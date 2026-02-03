"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsage = getUsage;
const mongoose_1 = __importDefault(require("mongoose"));
const Project_1 = require("../models/Project");
const Keyword_1 = require("../models/Keyword");
const Competitor_1 = require("../models/Competitor");
const Subscription_1 = require("../models/Subscription");
async function getUsage(userId) {
    const uid = new mongoose_1.default.Types.ObjectId(userId);
    const [sub, projectCount, keywordCount, competitorCount] = await Promise.all([
        Subscription_1.Subscription.findOne({ userId: uid }).lean(),
        Project_1.Project.countDocuments({ userId: uid }),
        Keyword_1.Keyword.countDocuments({ projectId: { $in: await Project_1.Project.find({ userId: uid }).distinct('_id') } }),
        Competitor_1.Competitor.countDocuments({ projectId: { $in: await Project_1.Project.find({ userId: uid }).distinct('_id') } }),
    ]);
    const plan = sub?.plan ?? 'free';
    const limits = sub?.limits ?? { projects: 1, keywordsPerProject: 5, competitorsPerProject: 1 };
    const projectsLimit = limits.projects ?? 1;
    const keywordsPerProject = limits.keywordsPerProject ?? 5;
    const competitorsPerProject = limits.competitorsPerProject ?? 1;
    return {
        plan,
        projects: projectCount,
        projectsLimit,
        keywords: keywordCount,
        keywordsLimit: projectsLimit * keywordsPerProject,
        competitors: competitorCount,
        competitorsLimit: projectsLimit * competitorsPerProject,
    };
}
//# sourceMappingURL=usageService.js.map