const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { config } = require('../config');
const { User } = require('../models/User');
const { ApiKey } = require('../models/ApiKey');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'];

  if (apiKeyHeader) {
    const key = await resolveApiKey(apiKeyHeader);
    if (key) {
      req.auth = key;
      req.authVia = 'api_key';
      return next();
    }
  }

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret);
      const user = await User.findById(decoded.userId).select('email name role plan').lean();
      if (user) {
        req.auth = {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          plan: user.plan,
        };
        req.authVia = 'jwt';
        return next();
      }
    } catch {
      // invalid or expired
    }
  }

  res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or missing token' } });
}

async function resolveApiKey(rawKey) {
  const hash = hashApiKey(rawKey);
  const key = await ApiKey.findOne({ keyHash: hash, revokedAt: null });
  if (!key) return null;
  const user = await User.findById(key.userId).select('email name role plan').lean();
  if (!user) return null;
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    plan: user.plan,
  };
}

function hashApiKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

function requireAuth(req, res, next) {
  if (!req.auth) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    return;
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.auth || req.auth.role !== 'admin') {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Admin required' } });
    return;
  }
  next();
}

module.exports = { authenticate, requireAuth, requireAdmin };
