"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCompetitor = addCompetitor;
exports.listCompetitors = listCompetitors;
exports.removeCompetitor = removeCompetitor;
exports.compareCompetitors = compareCompetitors;
const Competitor_1 = require("../models/Competitor");
const Project_1 = require("../models/Project");
const Subscription_1 = require("../models/Subscription");
const WporgSnapshot_1 = require("../models/WporgSnapshot");
const ReadmeAnalysis_1 = require("../models/ReadmeAnalysis");
const config_1 = require("../config");
async function addCompetitor(userId, projectId, slug) {
    const project = await Project_1.Project.findOne({ _id: projectId, userId });
    if (!project)
        return null;
    const sub = await Subscription_1.Subscription.findOne({ userId }).lean();
    const limits = sub?.limits ?? config_1.config.plans.free;
    const count = await Competitor_1.Competitor.countDocuments({ projectId });
    if (count >= limits.competitorsPerProject)
        throw new Error('PLAN_LIMIT_COMPETITORS');
    const slugNorm = slug.trim().toLowerCase();
    const existing = await Competitor_1.Competitor.findOne({ projectId, slug: slugNorm });
    if (existing)
        return existing;
    return Competitor_1.Competitor.create({ projectId, slug: slugNorm });
}
async function listCompetitors(userId, projectId) {
    const project = await Project_1.Project.findOne({ _id: projectId, userId });
    if (!project)
        return null;
    const competitors = await Competitor_1.Competitor.find({ projectId }).lean();
    const slugs = competitors.map((c) => c.slug);
    const wporg = await WporgSnapshot_1.WporgSnapshot.find({ slug: { $in: slugs } }).lean();
    const readmes = await ReadmeAnalysis_1.ReadmeAnalysis.aggregate([
        { $match: { slug: { $in: slugs } } },
        { $sort: { analyzedAt: -1 } },
        { $group: { _id: '$slug', score: { $first: '$score' } } },
    ]);
    const wpMap = Object.fromEntries(wporg.map((w) => [w.slug, w]));
    const readmeMap = Object.fromEntries(readmes.map((r) => [r._id, r.score]));
    return competitors.map((c) => {
        const slug = c.slug;
        const wp = wpMap[slug];
        return {
            id: c._id.toString(),
            projectId,
            slug,
            addedAt: c.createdAt?.toISOString(),
            active_installs: wp?.active_installs,
            rating: wp?.rating,
            readmeScore: readmeMap[slug],
        };
    });
}
async function removeCompetitor(userId, projectId, competitorId) {
    const project = await Project_1.Project.findOne({ _id: projectId, userId });
    if (!project)
        return false;
    const result = await Competitor_1.Competitor.findOneAndDelete({ _id: competitorId, projectId });
    return !!result;
}
async function compareCompetitors(userId, projectId) {
    const project = await Project_1.Project.findOne({ _id: projectId, userId }).lean();
    if (!project)
        return null;
    const slug = project.slug;
    const projectReadme = await ReadmeAnalysis_1.ReadmeAnalysis.findOne({ projectId }).sort({ analyzedAt: -1 }).lean();
    const competitors = await listCompetitors(userId, projectId);
    if (!competitors)
        return null;
    const wpProject = await WporgSnapshot_1.WporgSnapshot.findOne({ slug }).lean();
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
//# sourceMappingURL=competitorService.js.map