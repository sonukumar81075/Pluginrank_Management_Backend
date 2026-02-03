const { Router } = require('express');
const { authRoutes } = require('./auth');
const { apiKeyRoutes } = require('./apiKeys');
const { pluginRoutes } = require('./plugins');
const { projectRoutes } = require('./projects');
const { alertRoutes } = require('./alerts');
const { usageRoutes } = require('./usage');

const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
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

apiRouter.use('/auth', authRoutes);
apiRouter.use('/api-keys', apiKeyRoutes);
apiRouter.use('/plugins', pluginRoutes);
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/alerts', alertRoutes);
apiRouter.use('/usage', usageRoutes);

module.exports = { apiRouter };
