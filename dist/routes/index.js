"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const auth_1 = require("./auth");
const apiKeys_1 = require("./apiKeys");
const plugins_1 = require("./plugins");
const projects_1 = require("./projects");
const alerts_1 = require("./alerts");
const usage_1 = require("./usage");
exports.apiRouter = (0, express_1.Router)();
exports.apiRouter.get('/', (_req, res) => {
    res.json({
        version: '1.0',
        docs: '/api/v1',
        endpoints: [
            'POST /auth/register',
            'POST /auth/login',
            'GET /plugins/search',
            'GET /projects',
            'POST /projects',
            'GET /projects/:id/rankings',
            'GET /projects/:id/readme-analysis',
            'GET /projects/:id/competitors/compare',
        ],
    });
});
exports.apiRouter.use('/auth', auth_1.authRoutes);
exports.apiRouter.use('/api-keys', apiKeys_1.apiKeyRoutes);
exports.apiRouter.use('/plugins', plugins_1.pluginRoutes);
exports.apiRouter.use('/projects', projects_1.projectRoutes);
exports.apiRouter.use('/alerts', alerts_1.alertRoutes);
exports.apiRouter.use('/usage', usage_1.usageRoutes);
//# sourceMappingURL=index.js.map