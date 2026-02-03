const mongoose = require('mongoose');
const { Project } = require('../models/Project');
const { Keyword } = require('../models/Keyword');
const { Competitor } = require('../models/Competitor');
const { Subscription } = require('../models/Subscription');
const { config } = require('../config');
const { ensureSubscription } = require('./authService');
const pluginSearchService = require('./pluginSearchService');

async function listProjects(userId) {
  const projects = await Project.find({ userId }).lean();
  const ids = projects.map((p) => p._id);
  const [keywords, competitorCounts] = await Promise.all([
    Keyword.find({ projectId: { $in: ids } }).lean(),
    Competitor.aggregate([{ $match: { projectId: { $in: ids } } }, { $group: { _id: '$projectId', count: { $sum: 1 } } }]),
  ]);
  const compMap = Object.fromEntries(competitorCounts.map((c) => [c._id.toString(), c.count]));
  return projects.map((p) => {
    const pid = p._id.toString();
    const kws = keywords.filter((k) => k.projectId.toString() === pid);
    let pluginData = p.pluginData ?? null;
    if (pluginData) {
      const fromIcons = pluginData.icons != null ? pluginSearchService.getIconUrl(pluginData.icons) : null;
      const fromSlug = pluginSearchService.getIconUrlFromSlug(pluginData.slug ?? p.slug);
      const rawUrl = pluginData.icon_url ?? fromIcons ?? fromSlug;
      pluginData = { ...pluginData, icon_url: pluginSearchService.normalizeIconUrl(rawUrl) ?? fromSlug };
    }
    return {
      id: pid,
      slug: p.slug,
      primary_keywords: p.primary_keywords,
      country: p.country,
      device: p.device,
      userId: p.userId?.toString(),
      keywords: kws.map((k) => ({ id: k._id.toString(), projectId: pid, keyword: k.keyword })),
      competitorCount: compMap[pid] ?? 0,
      pluginData,
      createdAt: p.createdAt?.toISOString(),
    };
  });
}

async function createProject(userId, slug, primary_keywords, country, device) {
  await ensureSubscription(new mongoose.Types.ObjectId(userId), 'free');
  const sub = await Subscription.findOne({ userId }).lean();
  const limits = sub?.limits ?? config.plans.free;
  const projectsLimit = limits.projects ?? config.plans.free.projects;
  const count = await Project.countDocuments({ userId });
  if (count >= projectsLimit) throw new Error('PLAN_LIMIT_PROJECTS');
  const slugNorm = slug.trim().toLowerCase();
  const existing = await Project.findOne({ userId, slug: slugNorm });
  if (existing) throw new Error('PROJECT_EXISTS');
  const plugin = await pluginSearchService.fetchAndSavePluginBySlug(slugNorm);
  if (!plugin) throw new Error('PLUGIN_NOT_FOUND');
  const keywordsFromForm = primary_keywords.map((k) => k.trim()).filter(Boolean);
  const keywordsFromTags = keywordsFromForm.length === 0 && plugin.tags && typeof plugin.tags === 'object'
    ? Object.values(plugin.tags).filter((v) => typeof v === 'string' && v.trim())
    : [];
  const primaryKeywordsFinal = keywordsFromForm.length > 0 ? keywordsFromForm : keywordsFromTags.slice(0, limits.keywordsPerProject);
  const project = await Project.create({
    userId,
    slug: slugNorm,
    primary_keywords: primaryKeywordsFinal,
    country: country.toUpperCase().slice(0, 2),
    device,
    pluginData: plugin,
  });
  for (const kw of primaryKeywordsFinal.slice(0, limits.keywordsPerProject)) {
    const k = kw.trim().toLowerCase();
    if (k) await Keyword.findOneAndUpdate({ projectId: project._id, keyword: k }, { projectId: project._id, keyword: k }, { upsert: true });
  }
  return project;
}

async function getProject(userId, projectId) {
  let project = await Project.findOne({ _id: projectId, userId }).lean();
  if (!project) return null;
  if (!project.pluginData && project.slug) {
    const plugin = await pluginSearchService.fetchAndSavePluginBySlug(project.slug);
    if (plugin) {
      await Project.updateOne({ _id: projectId, userId }, { pluginData: plugin });
      project = { ...project, pluginData: plugin };
    }
  }
  const keywords = await Keyword.find({ projectId }).lean();
  const competitorCount = await Competitor.countDocuments({ projectId });
  let pluginData = project.pluginData ?? null;
  if (pluginData) {
    const fromIcons = pluginData.icons != null ? pluginSearchService.getIconUrl(pluginData.icons) : null;
    const fromSlug = pluginSearchService.getIconUrlFromSlug(pluginData.slug ?? project.slug);
    const rawUrl = pluginData.icon_url ?? fromIcons ?? fromSlug;
    pluginData = { ...pluginData, icon_url: pluginSearchService.normalizeIconUrl(rawUrl) ?? fromSlug };
  }
  return {
    id: project._id.toString(),
    slug: project.slug,
    primary_keywords: project.primary_keywords,
    country: project.country,
    device: project.device,
    userId: project.userId?.toString(),
    keywords: keywords.map((k) => ({ id: k._id.toString(), projectId, keyword: k.keyword })),
    competitorCount,
    pluginData,
    createdAt: project.createdAt?.toISOString(),
  };
}

async function updateProject(userId, projectId, updates) {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) return null;
  if (updates.slug) {
    const newSlug = updates.slug.trim().toLowerCase();
    const plugin = await pluginSearchService.fetchAndSavePluginBySlug(newSlug);
    if (!plugin) throw new Error('PLUGIN_NOT_FOUND');
    project.slug = newSlug;
    project.pluginData = plugin;
  }
  if (updates.country) project.country = updates.country.toUpperCase().slice(0, 2);
  if (updates.device) project.device = updates.device;
  if (updates.primary_keywords) project.primary_keywords = updates.primary_keywords.map((k) => k.trim()).filter(Boolean);
  await project.save();
  return getProject(userId, projectId);
}

async function deleteProject(userId, projectId) {
  const result = await Project.findOneAndDelete({ _id: projectId, userId });
  if (result) {
    await Keyword.deleteMany({ projectId });
    await Competitor.deleteMany({ projectId });
  }
  return !!result;
}

async function addKeywords(userId, projectId, keywords) {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) return null;
  const sub = await Subscription.findOne({ userId }).lean();
  const limits = sub?.limits ?? config.plans.free;
  const current = await Keyword.countDocuments({ projectId });
  const toAdd = keywords.map((k) => k.trim().toLowerCase()).filter((k) => k);
  if (current + toAdd.length > limits.keywordsPerProject) throw new Error('PLAN_LIMIT_KEYWORDS');
  const added = [];
  for (const k of toAdd) {
    const doc = await Keyword.findOneAndUpdate(
      { projectId, keyword: k },
      { projectId, keyword: k },
      { upsert: true, new: true }
    );
    if (doc) added.push({ id: doc._id.toString(), keyword: doc.keyword });
  }
  return added;
}

async function removeKeyword(userId, projectId, keywordId) {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) return false;
  const result = await Keyword.findOneAndDelete({ _id: keywordId, projectId });
  return !!result;
}

module.exports = {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addKeywords,
  removeKeyword,
};
