const { Router } = require('express');
const crypto = require('crypto');
const { z } = require('zod');
const { authenticate, requireAuth } = require('../middleware/auth');
const { ApiKey } = require('../models/ApiKey');
const { config } = require('../config');

const router = Router();
router.use(authenticate, requireAuth);

const createBody = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()).optional().default([]),
});

function hashKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

function generateKey(prefix) {
  const secret = crypto.randomBytes(24).toString('base64url');
  const key = `${prefix}${secret}`;
  return { key, keyPrefix: prefix, hash: hashKey(key) };
}

router.post('/', async (req, res) => {
  try {
    const body = createBody.parse(req.body);
    const { key, keyPrefix, hash } = generateKey('wp_live_');
    const doc = await ApiKey.create({
      userId: req.auth.id,
      name: body.name,
      keyHash: hash,
      keyPrefix,
      scopes: body.scopes,
      rateLimitPerMin: config.apiKey.rateLimitPerMin,
    });
    res.status(201).json({
      id: doc._id.toString(),
      name: doc.name,
      scopes: doc.scopes,
      keyPrefix: doc.keyPrefix,
      secret: key,
      message: 'Store the secret securely; it will not be shown again.',
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: e.errors[0]?.message ?? 'Invalid input' } });
    }
    throw e;
  }
});

router.get('/', async (req, res) => {
  const keys = await ApiKey.find({ userId: req.auth.id, revokedAt: null })
    .select('name keyPrefix scopes lastUsedAt createdAt')
    .lean();
  res.json({
    data: keys.map((k) => ({
      id: k._id.toString(),
      name: k.name,
      keyPrefix: k.keyPrefix,
      scopes: k.scopes,
      lastUsedAt: k.lastUsedAt?.toISOString(),
      createdAt: k.createdAt?.toISOString(),
    })),
  });
});

router.patch('/:id', async (req, res) => {
  const key = await ApiKey.findOne({ _id: req.params.id, userId: req.auth.id, revokedAt: null });
  if (!key) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API key not found' } });
  const body = z.object({ name: z.string().min(1).max(100).optional(), scopes: z.array(z.string()).optional() }).parse(req.body);
  if (body.name) key.name = body.name;
  if (body.scopes) key.scopes = body.scopes;
  await key.save();
  res.json({ id: key._id.toString(), name: key.name, scopes: key.scopes });
});

router.delete('/:id', async (req, res) => {
  const key = await ApiKey.findOne({ _id: req.params.id, userId: req.auth.id });
  if (!key) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API key not found' } });
  key.revokedAt = new Date();
  await key.save();
  res.status(204).send();
});

module.exports = { apiKeyRoutes: router };
