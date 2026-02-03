const mongoose = require('mongoose');
const { Project } = require('../models/Project');
const { Keyword } = require('../models/Keyword');
const { Competitor } = require('../models/Competitor');
const { Subscription } = require('../models/Subscription');

async function getUsage(userId) {
  const uid = new mongoose.Types.ObjectId(userId);
  const [sub, projectCount, keywordCount, competitorCount] = await Promise.all([
    Subscription.findOne({ userId: uid }).lean(),
    Project.countDocuments({ userId: uid }),
    Keyword.countDocuments({ projectId: { $in: await Project.find({ userId: uid }).distinct('_id') } }),
    Competitor.countDocuments({ projectId: { $in: await Project.find({ userId: uid }).distinct('_id') } }),
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

module.exports = { getUsage };
