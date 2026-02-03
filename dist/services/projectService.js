"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProjects = listProjects;
exports.createProject = createProject;
exports.getProject = getProject;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
exports.addKeywords = addKeywords;
exports.removeKeyword = removeKeyword;
const mongoose_1 = __importDefault(require("mongoose"));
const Project_1 = require("../models/Project");
const Keyword_1 = require("../models/Keyword");
const Competitor_1 = require("../models/Competitor");
const Subscription_1 = require("../models/Subscription");
const config_1 = require("../config");
const authService_1 = require("./authService");
async function listProjects(userId) {
    const projects = await Project_1.Project.find({ userId }).lean();
    const ids = projects.map((p) => p._id);
    const [keywords, competitorCounts] = await Promise.all([
        Keyword_1.Keyword.find({ projectId: { $in: ids } }).lean(),
        Competitor_1.Competitor.aggregate([{ $match: { projectId: { $in: ids } } }, { $group: { _id: '$projectId', count: { $sum: 1 } } }]),
    ]);
    const compMap = Object.fromEntries(competitorCounts.map((c) => [c._id.toString(), c.count]));
    return projects.map((p) => {
        const pid = p._id.toString();
        const kws = keywords.filter((k) => k.projectId.toString() === pid);
        return {
            id: pid,
            slug: p.slug,
            primary_keywords: p.primary_keywords,
            country: p.country,
            device: p.device,
            userId: p.userId?.toString(),
            keywords: kws.map((k) => ({ id: k._id.toString(), projectId: pid, keyword: k.keyword })),
            competitorCount: compMap[pid] ?? 0,
            createdAt: p.createdAt?.toISOString(),
        };
    });
}
async function createProject(userId, slug, primary_keywords, country, device) {
    await (0, authService_1.ensureSubscription)(new mongoose_1.default.Types.ObjectId(userId), 'free');
    const sub = await Subscription_1.Subscription.findOne({ userId }).lean();
    const limits = sub?.limits ?? config_1.config.plans.free;
    const count = await Project_1.Project.countDocuments({ userId });
    if (count >= limits.projects) {
        throw new Error('PLAN_LIMIT_PROJECTS');
    }
    const slugNorm = slug.trim().toLowerCase();
    const existing = await Project_1.Project.findOne({ userId, slug: slugNorm });
    if (existing)
        throw new Error('PROJECT_EXISTS');
    const project = await Project_1.Project.create({
        userId,
        slug: slugNorm,
        primary_keywords: primary_keywords.map((k) => k.trim()).filter(Boolean),
        country: country.toUpperCase().slice(0, 2),
        device,
    });
    for (const kw of primary_keywords.slice(0, limits.keywordsPerProject)) {
        const k = kw.trim().toLowerCase();
        if (k)
            await Keyword_1.Keyword.findOneAndUpdate({ projectId: project._id, keyword: k }, { projectId: project._id, keyword: k }, { upsert: true });
    }
    return project;
}
async function getProject(userId, projectId) {
    const project = await Project_1.Project.findOne({ _id: projectId, userId }).lean();
    if (!project)
        return null;
    const keywords = await Keyword_1.Keyword.find({ projectId }).lean();
    const competitorCount = await Competitor_1.Competitor.countDocuments({ projectId });
    return {
        id: project._id.toString(),
        slug: project.slug,
        primary_keywords: project.primary_keywords,
        country: project.country,
        device: project.device,
        userId: project.userId?.toString(),
        keywords: keywords.map((k) => ({ id: k._id.toString(), projectId, keyword: k.keyword })),
        competitorCount,
        createdAt: project.createdAt?.toISOString(),
    };
}
async function updateProject(userId, projectId, updates) {
    const project = await Project_1.Project.findOne({ _id: projectId, userId });
    if (!project)
        return null;
    if (updates.slug)
        project.slug = updates.slug.trim().toLowerCase();
    if (updates.country)
        project.country = updates.country.toUpperCase().slice(0, 2);
    if (updates.device)
        project.device = updates.device;
    if (updates.primary_keywords)
        project.primary_keywords = updates.primary_keywords.map((k) => k.trim()).filter(Boolean);
    await project.save();
    return getProject(userId, projectId);
}
async function deleteProject(userId, projectId) {
    const result = await Project_1.Project.findOneAndDelete({ _id: projectId, userId });
    if (result) {
        await Keyword_1.Keyword.deleteMany({ projectId });
        await Competitor_1.Competitor.deleteMany({ projectId });
    }
    return !!result;
}
async function addKeywords(userId, projectId, keywords) {
    const project = await Project_1.Project.findOne({ _id: projectId, userId });
    if (!project)
        return null;
    const sub = await Subscription_1.Subscription.findOne({ userId }).lean();
    const limits = sub?.limits ?? config_1.config.plans.free;
    const current = await Keyword_1.Keyword.countDocuments({ projectId });
    const toAdd = keywords.map((k) => k.trim().toLowerCase()).filter((k) => k);
    if (current + toAdd.length > limits.keywordsPerProject)
        throw new Error('PLAN_LIMIT_KEYWORDS');
    const added = [];
    for (const k of toAdd) {
        const doc = await Keyword_1.Keyword.findOneAndUpdate({ projectId, keyword: k }, { projectId, keyword: k }, { upsert: true, new: true });
        if (doc)
            added.push({ id: doc._id.toString(), keyword: doc.keyword });
    }
    return added;
}
async function removeKeyword(userId, projectId, keywordId) {
    const project = await Project_1.Project.findOne({ _id: projectId, userId });
    if (!project)
        return false;
    const result = await Keyword_1.Keyword.findOneAndDelete({ _id: keywordId, projectId });
    return !!result;
}
//# sourceMappingURL=projectService.js.map