const { Router } = require('express');
const { authenticate, requireAuth } = require('../middleware/auth');
const pluginSearchService = require('../services/pluginSearchService');

const router = Router();
router.use(authenticate, requireAuth);

router.get('/by-slug/:slug', async (req, res) => {
  try {
    const slug = String(req.params.slug || '').trim();
    if (!slug) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Slug is required' } });
    }
    const plugin = await pluginSearchService.getPluginBySlug(slug);
    if (!plugin) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Plugin not found on WordPress.org' } });
    }
    res.json(plugin);
  } catch (e) {
    return res.status(502).json({ error: { code: 'WP_ORG_ERROR', message: 'WordPress.org API error' } });
  }
});

router.get('/popular', async (req, res) => {
  try {
    const perPage = Math.min(24, Math.max(1, parseInt(String(req.query.per_page), 10) || 10));
    const result = await pluginSearchService.getPopularPlugins(perPage);
    res.json(result);
  } catch (e) {
    return res.status(502).json({ error: { code: 'WP_ORG_ERROR', message: 'WordPress.org API error' } });
  }
});

router.get('/search', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(String(req.query.per_page), 10) || 20));
    const q = String(req.query.q ?? '').trim();
    if (!q) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Query "q" is required' } });
    }
    const result = await pluginSearchService.searchPlugins(q, page, perPage);
    res.json(result);
  } catch (e) {
    return res.status(502).json({ error: { code: 'WP_ORG_ERROR', message: 'WordPress.org API error' } });
  }
});

module.exports = { pluginRoutes: router };
