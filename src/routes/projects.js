const { Router } = require('express');
const { z } = require('zod');
const { authenticate, requireAuth } = require('../middleware/auth');
const projectService = require('../services/projectService');
const readmeService = require('../services/readmeService');
const rankService = require('../services/rankService');
const competitorService = require('../services/competitorService');

const router = Router();
router.use(authenticate, requireAuth);

const createBody = z.object({
  slug: z.string().min(1).max(200),
  primary_keywords: z.array(z.string()).optional().default([]),
  country: z.string().length(2),
  device: z.enum(['desktop', 'mobile']).optional().default('desktop'),
});

router.get('/', async (req, res) => {
  const list = await projectService.listProjects(req.auth.id);
  res.json({ data: list });
});

router.post('/', async (req, res) => {
  try {
    const body = createBody.parse(req.body);
    const project = await projectService.createProject(
      req.auth.id,
      body.slug,
      body.primary_keywords,
      body.country,
      body.device
    );
    if (!project) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Failed to create' } });
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
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: e.errors[0]?.message ?? 'Invalid input' } });
    }
    if (e.message === 'PLAN_LIMIT_PROJECTS') {
      return res.status(403).json({ error: { code: 'PLAN_LIMIT_PROJECTS', message: 'Your plan allows 1 plugin. Upgrade to add more.' } });
    }
    if (e.message === 'PROJECT_EXISTS') {
      return res.status(400).json({ error: { code: 'PROJECT_EXISTS', message: 'Project with this slug already exists.' } });
    }
    if (e.message === 'PLUGIN_NOT_FOUND') {
      return res.status(400).json({ error: { code: 'PLUGIN_NOT_FOUND', message: 'Plugin not found on WordPress.org. Check the slug and try again.' } });
    }
    throw e;
  }
});

router.get('/:id', async (req, res) => {
  const project = await projectService.getProject(req.auth.id, req.params.id);
  if (!project) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
  res.json(project);
});

router.patch('/:id', async (req, res) => {
  const body = z.object({
    slug: z.string().min(1).max(200).optional(),
    primary_keywords: z.array(z.string()).optional(),
    country: z.string().length(2).optional(),
    device: z.enum(['desktop', 'mobile']).optional(),
  }).partial().parse(req.body);
  try {
    const project = await projectService.updateProject(req.auth.id, req.params.id, body);
    if (!project) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    res.json(project);
  } catch (e) {
    if (e.message === 'PLUGIN_NOT_FOUND') {
      return res.status(400).json({ error: { code: 'PLUGIN_NOT_FOUND', message: 'Plugin not found on WordPress.org. Check the slug and try again.' } });
    }
    throw e;
  }
});

router.delete('/:id', async (req, res) => {
  const ok = await projectService.deleteProject(req.auth.id, req.params.id);
  if (!ok) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
  res.status(204).send();
});

router.post('/:id/keywords', async (req, res) => {
  try {
    const body = z.object({ keywords: z.array(z.string()).optional().default([]) }).parse(req.body);
    const keywords = body.keywords.length ? body.keywords : (req.body.keyword ? [req.body.keyword] : []);
    const added = await projectService.addKeywords(req.auth.id, req.params.id, keywords);
    if (!added) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    res.status(201).json({ data: added });
  } catch (e) {
    if (e.message === 'PLAN_LIMIT_KEYWORDS') {
      return res.status(403).json({ error: { code: 'PLAN_LIMIT_KEYWORDS', message: 'Keyword limit reached for your plan.' } });
    }
    throw e;
  }
});

router.delete('/:id/keywords/:keywordId', async (req, res) => {
  const ok = await projectService.removeKeyword(req.auth.id, req.params.id, req.params.keywordId);
  if (!ok) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Keyword not found' } });
  res.status(204).send();
});

router.get('/:id/readme-analysis', async (req, res) => {
  const analysis = await readmeService.getLatestReadmeAnalysis(req.params.id);
  if (!analysis) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No readme analysis yet' } });
  res.json(analysis);
});

router.post('/:id/readme-analysis/refresh', async (req, res) => {
  const project = await projectService.getProject(req.auth.id, req.params.id);
  if (!project) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
  const result = await readmeService.analyzeReadme(req.params.id);
  if (!result) return res.status(502).json({ error: { code: 'README_FETCH_FAILED', message: 'Could not fetch or parse readme' } });
  const full = await readmeService.getLatestReadmeAnalysis(req.params.id);
  res.status(202).json(full ?? result);
});

router.get('/:id/rankings', async (req, res) => {
  const from = req.query.from;
  const to = req.query.to;
  const granularity = req.query.granularity ?? 'daily';
  const keywordId = req.query.keyword_id;
  const data = await rankService.getRankings(req.params.id, req.auth.id, { from, to, granularity, keywordId });
  if (!data) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
  res.json(data);
});

router.post('/:id/competitors', async (req, res) => {
  try {
    const body = z.object({ slug: z.string().min(1).max(200) }).parse(req.body);
    const competitor = await competitorService.addCompetitor(req.auth.id, req.params.id, body.slug);
    if (!competitor) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    res.status(201).json({
      id: competitor._id.toString(),
      projectId: req.params.id,
      slug: competitor.slug,
      addedAt: competitor.createdAt?.toISOString(),
    });
  } catch (e) {
    if (e.message === 'PLAN_LIMIT_COMPETITORS') {
      return res.status(403).json({ error: { code: 'PLAN_LIMIT_COMPETITORS', message: 'Competitor limit reached for your plan.' } });
    }
    throw e;
  }
});

router.get('/:id/competitors', async (req, res) => {
  const list = await competitorService.listCompetitors(req.auth.id, req.params.id);
  if (list === null) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
  res.json({ data: list });
});

router.delete('/:id/competitors/:competitorId', async (req, res) => {
  const ok = await competitorService.removeCompetitor(req.auth.id, req.params.id, req.params.competitorId);
  if (!ok) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Competitor not found' } });
  res.status(204).send();
});

router.get('/:id/competitors/compare', async (req, res) => {
  const data = await competitorService.compareCompetitors(req.auth.id, req.params.id);
  if (!data) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
  res.json(data);
});

module.exports = { projectRoutes: router };
