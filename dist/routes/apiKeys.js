"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyRoutes = void 0;
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const ApiKey_1 = require("../models/ApiKey");
const config_1 = require("../config");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, auth_1.requireAuth);
const createBody = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    scopes: zod_1.z.array(zod_1.z.string()).optional().default([]),
});
function hashKey(key) {
    return crypto_1.default.createHash('sha256').update(key).digest('hex');
}
function generateKey(prefix) {
    const secret = crypto_1.default.randomBytes(24).toString('base64url');
    const key = `${prefix}${secret}`;
    return { key, keyPrefix: prefix, hash: hashKey(key) };
}
router.post('/', async (req, res) => {
    try {
        const body = createBody.parse(req.body);
        const { key, keyPrefix, hash } = generateKey('wp_live_');
        const doc = await ApiKey_1.ApiKey.create({
            userId: req.auth.id,
            name: body.name,
            keyHash: hash,
            keyPrefix,
            scopes: body.scopes,
            rateLimitPerMin: config_1.config.apiKey.rateLimitPerMin,
        });
        res.status(201).json({
            id: doc._id.toString(),
            name: doc.name,
            scopes: doc.scopes,
            keyPrefix: doc.keyPrefix,
            secret: key,
            message: 'Store the secret securely; it will not be shown again.',
        });
    }
    catch (e) {
        if (e instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: e.errors[0]?.message ?? 'Invalid input' } });
        }
        throw e;
    }
});
router.get('/', async (req, res) => {
    const keys = await ApiKey_1.ApiKey.find({ userId: req.auth.id, revokedAt: null })
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
    const key = await ApiKey_1.ApiKey.findOne({ _id: req.params.id, userId: req.auth.id, revokedAt: null });
    if (!key)
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API key not found' } });
    const body = zod_1.z.object({ name: zod_1.z.string().min(1).max(100).optional(), scopes: zod_1.z.array(zod_1.z.string()).optional() }).parse(req.body);
    if (body.name)
        key.name = body.name;
    if (body.scopes)
        key.scopes = body.scopes;
    await key.save();
    res.json({ id: key._id.toString(), name: key.name, scopes: key.scopes });
});
router.delete('/:id', async (req, res) => {
    const key = await ApiKey_1.ApiKey.findOne({ _id: req.params.id, userId: req.auth.id });
    if (!key)
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API key not found' } });
    key.revokedAt = new Date();
    await key.save();
    res.status(204).send();
});
exports.apiKeyRoutes = router;
//# sourceMappingURL=apiKeys.js.map