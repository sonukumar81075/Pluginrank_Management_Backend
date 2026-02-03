/**
 * Worker entrypoint: cron + background jobs.
 * Run with: npm run worker
 * See docs/CRON_AND_JOBS.md for schedule and job logic.
 */
const cron = require('node-cron');
const { connectDb } = require('../db');

async function start() {
  await connectDb();

  // Daily rank job: 02:00 UTC
  cron.schedule('0 2 * * *', () => {
    // TODO: Enqueue fetchSerpRank for daily-plan projects
  });

  // Weekly rank job: Sunday 03:00 UTC
  cron.schedule('0 3 * * 0', () => {
    // TODO: Enqueue fetchSerpRank for weekly-plan projects
  });

  // Optional: weekly readme analysis
  cron.schedule('0 1 * * 0', () => {
    // TODO: Enqueue analyzeReadme for active projects
  });
}

start().catch(() => {
  process.exit(1);
});
