"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("./config");
const db_1 = require("./db");
const routes_1 = require("./routes");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: config_1.config.nodeEnv === 'production' ? undefined : true }));
app.use(express_1.default.json());
app.use('/api/v1', routes_1.apiRouter);
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
async function start() {
    await (0, db_1.connectDb)();
    app.listen(config_1.config.port, () => {
        console.log(`API listening on port ${config_1.config.port}`);
    });
}
start().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map