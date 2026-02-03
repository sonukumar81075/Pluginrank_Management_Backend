const { Router } = require('express');
const { authenticate, requireAuth } = require('../middleware/auth');
const { Alert } = require('../models/Alert');

const router = Router();
router.use(authenticate, requireAuth);

router.get('/', async (req, res) => {
  const projectId = req.query.project_id;
  const status = req.query.status;
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const perPage = Math.min(50, Math.max(1, parseInt(String(req.query.per_page), 10) || 20));

  const filter = { userId: req.auth.id };
  if (projectId) filter.projectId = projectId;
  if (status) filter.status = status;

  const [alerts, total] = await Promise.all([
    Alert.find(filter).sort({ createdAt: -1 }).skip((page - 1) * perPage).limit(perPage).lean(),
    Alert.countDocuments(filter),
  ]);

  res.json({
    data: alerts.map((a) => ({
      id: a._id.toString(),
      projectId: a.projectId.toString(),
      type: a.type,
      title: a.title,
      message: a.message,
      status: a.status,
      createdAt: a.createdAt?.toISOString(),
    })),
    meta: { total, page, per_page: perPage },
  });
});

router.patch('/:id', async (req, res) => {
  const alert = await Alert.findOne({ _id: req.params.id, userId: req.auth.id });
  if (!alert) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Alert not found' } });
  const status = req.body?.status;
  if (status === 'read' || status === 'dismissed') {
    alert.status = status;
    if (status === 'read') alert.readAt = new Date();
    await alert.save();
  }
  res.json({ id: alert._id.toString(), status: alert.status });
});

module.exports = { alertRoutes: router };
