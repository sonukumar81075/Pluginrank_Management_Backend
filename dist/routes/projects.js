"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRoutes = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const projectService = __importStar(require("../services/projectService"));
const readmeService = __importStar(require("../services/readmeService"));
const rankService = __importStar(require("../services/rankService"));
const competitorService = __importStar(require("../services/competitorService"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, auth_1.requireAuth);
const createBody = zod_1.z.object({
    slug: zod_1.z.string().min(1).max(200),
    primary_keywords: zod_1.z.array(zod_1.z.string()).optional().default([]),
    country: zod_1.z.string().length(2),
    device: zod_1.z.enum(['desktop', 'mobile']).optional().default('desktop'),
});
router.get('/', async (req, res) => {
    const list = await projectService.listProjects(req.auth.id);
    res.json({ data: list });
});
router.post('/', async (req, res) => {
    try {
        const body = createBody.parse(req.body);
        const project = await projectService.createProject(req.auth.id, body.slug, body.primary_keywords, body.country, body.device);
        if (!project)
            return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Failed to create' } });
        res.status(201).json({
            id: project._id.toString(),
            slug: project.slug,
            primary_keywords: project.primary_keywords,
            country: project.country,
            device: project.device,
            userId: project.userId?.toString(),
            keywords: [],
            competitorCount: 0,
            createdAt: project.createdAt?.toISOString(),
        });
    }
    catch (e) {
        if (e instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: e.errors[0]?.message ?? 'Invalid input' } });
        }
        if (e.message === 'PLAN_LIMIT_PROJECTS') {
            return res.status(403).json({ error: { code: 'PLAN_LIMIT_PROJECTS', message: 'Your plan allows 1 project. Upgrade to add more.' } });
        }
        if (e.message === 'PROJECT_EXISTS') {
            return res.status(400).json({ error: { code: 'PROJECT_EXISTS', message: 'Project with this slug already exists.' } });
        }
        throw e;
    }
});
router.get('/:id', async (req, res) => {
    const project = await projectService.getProject(req.auth.id, req.params.id);
    if (!project)
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    res.json(project);
});
router.patch('/:id', async (req, res) => {
    const body = zod_1.z.object({
        slug: zod_1.z.string().min(1).max(200).optional(),
        primary_keywords: zod_1.z.array(zod_1.z.string()).optional(),
        country: zod_1.z.string().length(2).optional(),
        device: zod_1.z.enum(['desktop', 'mobile']).optional(),
    }).partial().parse(req.body);
    const project = await projectService.updateProject(req.auth.id, req.params.id, body);
    if (!project)
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    res.json(project);
});
router.delete('/:id', async (req, res) => {
    const ok = await projectService.deleteProject(req.auth.id, req.params.id);
    if (!ok)
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    res.status(204).send();
});
router.post('/:id/keywords', async (req, res) => {
    try {
        const body = zod_1.z.object({ keywords: zod_1.z.array(zod_1.z.string()).optional().default([]) }).parse(req.body);
        const keywords = body.keywords.length ? body.keywords : (req.body.keyword ? [req.body.keyword] : []);
        const added = await projectService.addKeywords(req.auth.id, req.params.id, keywords);
        if (!added)
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
        res.status(201).json({ data: added });
    }
    catch (e) {
        if (e.message === 'PLAN_LIMIT_KEYWORDS') {
            return res.status(403).json({ error: { code: 'PLAN_LIMIT_KEYWORDS', message: 'Keyword limit reached for your plan.' } });
        }
        throw e;
    }
});
router.delete('/:id/keywords/:keywordId', async (req, res) => {
    const ok = await projectService.removeKeyword(req.auth.id, req.params.id, req.params.keywordId);
    if (!ok)
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Keyword not found' } });
    res.status(204).send();
});
router.get('/:id/readme-analysis', async (req, res) => {
    const analysis = await readmeService.getLatestReadmeAnalysis(req.params.id);
    if (!analysis)
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No readme analysis yet' } });
    res.json(analysis);
});
router.post('/:id/readme-analysis/refresh', async (req, res) => {
    const project = await projectService.getProject(req.auth.id, req.params.id);
    if (!project)
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    const result = await readmeService.analyzeReadme(req.params.id);
    if (!result)
        return res.status(502).json({ error: { code: 'README_FETCH_FAILED', message: 'Could not fetch or parse readme' } });
    const full = await readmeService.getLatestReadmeAnalysis(req.params.id);
    res.status(202).json(full ?? result);
});
router.get('/:id/rankings', async (req, res) => {
    const from = req.query.from;
    const to = req.query.to;
    const granularity = req.query.granularity ?? 'daily';
    const keywordId = req.query.keyword_id;
    const data = await rankService.getRankings(req.params.id, req.auth.id, { from, to, granularity, keywordId });
    if (!data)
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    res.json(data);
});
router.post('/:id/competitors', async (req, res) => {
    try {
        const body = zod_1.z.object({ slug: zod_1.z.string().min(1).max(200) }).parse(req.body);
        const competitor = await competitorService.addCompetitor(req.auth.id, req.params.id, body.slug);
        if (!competitor)
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
        res.status(201).json({
            id: competitor._id.toString(),
            projectId: req.params.id,
            slug: competitor.slug,
            addedAt: competitor.createdAt?.toISOString(),
        });
    }
    catch (e) {
        if (e.message === 'PLAN_LIMIT_COMPETITORS') {
            return res.status(403).json({ error: { code: 'PLAN_LIMIT_COMPETITORS', message: 'Competitor limit reached for your plan.' } });
        }
        throw e;
    }
});
router.get('/:id/competitors', async (req, res) => {
    const list = await competitorService.listCompetitors(req.auth.id, req.params.id);
    if (list === null)
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    res.json({ data: list });
});
router.delete('/:id/competitors/:competitorId', async (req, res) => {
    const ok = await competitorService.removeCompetitor(req.auth.id, req.params.id, req.params.competitorId);
    if (!ok)
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Competitor not found' } });
    res.status(204).send();
});
router.get('/:id/competitors/compare', async (req, res) => {
    const data = await competitorService.compareCompetitors(req.auth.id, req.params.id);
    if (!data)
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    res.json(data);
});
exports.projectRoutes = router;
//# sourceMappingURL=projects.js.map