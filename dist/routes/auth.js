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
exports.authRoutes = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const authService = __importStar(require("../services/authService"));
const router = (0, express_1.Router)();
const registerBody = zod_1.z.object({ email: zod_1.z.string().email(), password: zod_1.z.string().min(8), name: zod_1.z.string().min(1).max(200) });
const loginBody = zod_1.z.object({ email: zod_1.z.string().email(), password: zod_1.z.string() });
const refreshBody = zod_1.z.object({ refreshToken: zod_1.z.string() });
router.post('/register', async (req, res) => {
    try {
        const body = registerBody.parse(req.body);
        const result = await authService.register(body.email, body.password, body.name);
        res.status(201).json(result);
    }
    catch (e) {
        if (e instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: e.errors[0]?.message ?? 'Invalid input' } });
        }
        if (e.message === 'EMAIL_IN_USE') {
            return res.status(400).json({ error: { code: 'EMAIL_IN_USE', message: 'Email already registered' } });
        }
        throw e;
    }
});
router.post('/login', async (req, res) => {
    try {
        const body = loginBody.parse(req.body);
        const result = await authService.login(body.email, body.password);
        res.json(result);
    }
    catch (e) {
        if (e instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: e.errors[0]?.message ?? 'Invalid input' } });
        }
        if (e.message === 'INVALID_CREDENTIALS') {
            return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
        }
        throw e;
    }
});
router.post('/refresh', async (req, res) => {
    try {
        const body = refreshBody.parse(req.body);
        const result = await authService.refresh(body.refreshToken);
        res.json(result);
    }
    catch (e) {
        if (e instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: e.errors[0]?.message ?? 'Invalid input' } });
        }
        return res.status(401).json({ error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' } });
    }
});
router.post('/logout', auth_1.authenticate, auth_1.requireAuth, async (req, res) => {
    const refreshToken = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : undefined;
    await authService.logout(refreshToken);
    res.status(204).send();
});
router.get('/me', auth_1.authenticate, auth_1.requireAuth, async (req, res) => {
    const user = await authService.getMe(req.auth.id);
    if (!user)
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    res.json({ user });
});
exports.authRoutes = router;
//# sourceMappingURL=auth.js.map