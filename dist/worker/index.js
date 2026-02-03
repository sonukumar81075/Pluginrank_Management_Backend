"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Worker entrypoint: cron + background jobs.
 * Run with: npm run worker
 * See docs/CRON_AND_JOBS.md for schedule and job logic.
 */
const node_cron_1 = __importDefault(require("node-cron"));
const db_1 = require("../db");
async function start() {
    await (0, db_1.connectDb)();
    // Daily rank job: 02:00 UTC
    node_cron_1.default.schedule('0 2 * * *', () => {
        console.log('[Cron] Daily rank job triggered');
        // TODO: Enqueue fetchSerpRank for daily-plan projects
    });
    // Weekly rank job: Sunday 03:00 UTC
    node_cron_1.default.schedule('0 3 * * 0', () => {
        console.log('[Cron] Weekly rank job triggered');
        // TODO: Enqueue fetchSerpRank for weekly-plan projects
    });
    // Optional: weekly readme analysis
    node_cron_1.default.schedule('0 1 * * 0', () => {
        console.log('[Cron] Weekly readme analysis triggered');
        // TODO: Enqueue analyzeReadme for active projects
    });
    console.log('Worker started (cron only; queue jobs TBD)');
}
start().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map