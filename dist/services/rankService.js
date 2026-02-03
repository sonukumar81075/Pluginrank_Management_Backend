"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRankings = getRankings;
const mongoose_1 = __importDefault(require("mongoose"));
const RankSnapshot_1 = require("../models/RankSnapshot");
const Keyword_1 = require("../models/Keyword");
const Project_1 = require("../models/Project");
async function getRankings(projectId, userId, opts) {
    const project = await Project_1.Project.findOne({ _id: projectId, userId });
    if (!project)
        return null;
    const granularity = opts.granularity ?? 'daily';
    const from = opts.from ? new Date(opts.from) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const to = opts.to ? new Date(opts.to) : new Date();
    const match = { projectId: new mongoose_1.default.Types.ObjectId(projectId), date: { $gte: from, $lte: to }, granularity };
    if (opts.keywordId)
        match.keywordId = new mongoose_1.default.Types.ObjectId(opts.keywordId);
    const snapshots = await RankSnapshot_1.RankSnapshot.find(match).sort({ date: 1 }).lean();
    const keywordIds = [...new Set(snapshots.map((s) => s.keywordId.toString()))];
    const keywords = await Keyword_1.Keyword.find({ _id: { $in: keywordIds } }).lean();
    const kwMap = Object.fromEntries(keywords.map((k) => [k._id.toString(), k.keyword]));
    const byKeyword = {};
    for (const s of snapshots) {
        const kid = s.keywordId.toString();
        if (!byKeyword[kid])
            byKeyword[kid] = [];
        byKeyword[kid].push({
            date: new Date(s.date).toISOString().slice(0, 10),
            position: s.position,
            url: s.url,
        });
    }
    return {
        projectId,
        granularity,
        data: Object.entries(byKeyword).map(([keywordId, points]) => ({
            keywordId,
            keyword: kwMap[keywordId] ?? '',
            points,
        })),
    };
}
//# sourceMappingURL=rankService.js.map