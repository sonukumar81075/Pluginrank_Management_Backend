const mongoose = require('mongoose');
const { RankSnapshot } = require('../models/RankSnapshot');
const { Keyword } = require('../models/Keyword');
const { Project } = require('../models/Project');

async function getRankings(projectId, userId, opts = {}) {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) return null;

  const granularity = opts.granularity ?? 'daily';
  const from = opts.from ? new Date(opts.from) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const to = opts.to ? new Date(opts.to) : new Date();

  const match = {
    projectId: new mongoose.Types.ObjectId(projectId),
    date: { $gte: from, $lte: to },
    granularity,
  };
  if (opts.keywordId) match.keywordId = new mongoose.Types.ObjectId(opts.keywordId);

  const snapshots = await RankSnapshot.find(match).sort({ date: 1 }).lean();
  const keywordIds = [...new Set(snapshots.map((s) => s.keywordId.toString()))];
  const keywords = await Keyword.find({ _id: { $in: keywordIds } }).lean();
  const kwMap = Object.fromEntries(keywords.map((k) => [k._id.toString(), k.keyword]));

  const byKeyword = {};
  for (const s of snapshots) {
    const kid = s.keywordId.toString();
    if (!byKeyword[kid]) byKeyword[kid] = [];
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

module.exports = { getRankings };
