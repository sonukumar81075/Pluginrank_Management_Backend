"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config");
const User_1 = require("../models/User");
const ApiKey_1 = require("../models/ApiKey");
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
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.accessSecret);
            const user = await User_1.User.findById(decoded.userId).select('email name role plan').lean();
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
        }
        catch {
            // invalid or expired
        }
    }
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or missing token' } });
}
async function resolveApiKey(rawKey) {
    const hash = hashApiKey(rawKey);
    const key = await ApiKey_1.ApiKey.findOne({ keyHash: hash, revokedAt: null });
    if (!key)
        return null;
    const user = await User_1.User.findById(key.userId).select('email name role plan').lean();
    if (!user)
        return null;
    const u = user;
    return {
        id: u._id.toString(),
        email: u.email,
        name: u.name,
        role: u.role,
        plan: u.plan,
    };
}
function hashApiKey(key) {
    return crypto_1.default.createHash('sha256').update(key).digest('hex');
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
//# sourceMappingURL=auth.js.map