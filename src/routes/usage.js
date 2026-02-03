const { Router } = require('express');
const { authenticate, requireAuth } = require('../middleware/auth');
const usageService = require('../services/usageService');

const router = Router();
router.use(authenticate, requireAuth);

router.get('/', async (req, res) => {
  const usage = await usageService.getUsage(req.auth.id);
  res.json(usage);
});

module.exports = { usageRoutes: router };
