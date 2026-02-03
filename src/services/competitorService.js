const { Competitor } = require('../models/Competitor');
const { Project } = require('../models/Project');
const { Subscription } = require('../models/Subscription');
const { WporgSnapshot } = require('../models/WporgSnapshot');
const { ReadmeAnalysis } = require('../models/ReadmeAnalysis');
const { config } = require('../config');

async function addCompetitor(userId, projectId, slug) {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) return null;
  const sub = await Subscription.findOne({ userId }).lean();
  const limits = sub?.limits ?? config.plans.free;
  const count = await Competitor.countDocuments({ projectId });
  if (count >= limits.competitorsPerProject) throw new Error('PLAN_LIMIT_COMPETITORS');
  const slugNorm = slug.trim().toLowerCase();
  const existing = await Competitor.findOne({ projectId, slug: slugNorm });
  if (existing) return existing;
  return Competitor.create({ projectId, slug: slugNorm });
}

async function listCompetitors(userId, projectId) {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) return null;
  const competitors = await Competitor.find({ projectId }).lean();
  const slugs = competitors.map((c) => c.slug);
  const wporg = await WporgSnapshot.find({ slug: { $in: slugs } }).lean();
  const readmes = await ReadmeAnalysis.aggregate([
    { $match: { slug: { $in: slugs } } },
    { $sort: { analyzedAt: -1 } },
    { $group: { _id: '$slug', score: { $first: '$score' } } },
  ]);
  const wpMap = Object.fromEntries(wporg.map((w) => [w.slug, w]));
  const readmeMap = Object.fromEntries(readmes.map((r) => [r._id, r.score]));
  return competitors.map((c) => ({
    id: c._id.toString(),
    projectId,
    slug: c.slug,
    addedAt: c.createdAt?.toISOString(),
    active_installs: wpMap[c.slug]?.active_installs,
    rating: wpMap[c.slug]?.rating,
    readmeScore: readmeMap[c.slug],
  }));
}

async function removeCompetitor(userId, projectId, competitorId) {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) return false;
  const result = await Competitor.findOneAndDelete({ _id: competitorId, projectId });
  return !!result;
}

async function compareCompetitors(userId, projectId) {
  const project = await Project.findOne({ _id: projectId, userId }).lean();
  if (!project) return null;
  const slug = project.slug;
  const projectReadme = await ReadmeAnalysis.findOne({ projectId }).sort({ analyzedAt: -1 }).lean();
  const competitors = await listCompetitors(userId, projectId);
  if (!competitors) return null;
  const wpProject = await WporgSnapshot.findOne({ slug }).lean();
  return {
    project: {
      slug,
      readmeScore: projectReadme?.score,
      activeInstalls: wpProject?.active_installs,
    },
    competitors: competitors.map((c) => ({
      slug: c.slug,
      active_installs: c.active_installs,
      rating: c.rating,
      readmeScore: c.readmeScore,
    })),
  };
}

module.exports = {
  addCompetitor,
  listCompetitors,
  removeCompetitor,
  compareCompetitors,
};
