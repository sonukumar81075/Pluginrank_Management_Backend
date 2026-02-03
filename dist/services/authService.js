"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
exports.getMe = getMe;
exports.ensureSubscription = ensureSubscription;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = require("../models/User");
const RefreshToken_1 = require("../models/RefreshToken");
const Subscription_1 = require("../models/Subscription");
const config_1 = require("../config");
const SALT_ROUNDS = 10;
const REFRESH_DAYS = 7;
async function register(email, password, name) {
    const existing = await User_1.User.findOne({ email: email.toLowerCase().trim() });
    if (existing)
        throw new Error('EMAIL_IN_USE');
    const passwordHash = await bcryptjs_1.default.hash(password, SALT_ROUNDS);
    const user = await User_1.User.create({
        email: email.toLowerCase().trim(),
        passwordHash,
        name: name.trim(),
        role: 'user',
        plan: 'free',
    });
    await ensureSubscription(user._id, 'free');
    const tokens = await issueTokens(user._id.toString(), user.email, user.name, user.role, user.plan);
    return { user: toUser(user), tokens };
}
async function login(email, password) {
    const user = await User_1.User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user || !user.passwordHash)
        throw new Error('INVALID_CREDENTIALS');
    const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!ok)
        throw new Error('INVALID_CREDENTIALS');
    const tokens = await issueTokens(user._id.toString(), user.email, user.name, user.role, user.plan);
    return { user: toUser(user), tokens };
}
async function refresh(refreshToken) {
    const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.config.jwt.refreshSecret);
    const stored = await RefreshToken_1.RefreshToken.findOne({ tokenHash: hashToken(refreshToken), revokedAt: null });
    if (!stored)
        throw new Error('INVALID_REFRESH_TOKEN');
    const user = await User_1.User.findById(decoded.userId).select('email name role plan');
    if (!user)
        throw new Error('USER_NOT_FOUND');
    await RefreshToken_1.RefreshToken.updateOne({ _id: stored._id }, { revokedAt: new Date() });
    const tokens = await issueTokens(user._id.toString(), user.email, user.name, user.role, user.plan);
    return { user: toUser(user), tokens };
}
async function logout(refreshToken) {
    if (refreshToken) {
        await RefreshToken_1.RefreshToken.updateOne({ tokenHash: hashToken(refreshToken) }, { revokedAt: new Date() });
    }
}
async function getMe(userId) {
    const user = await User_1.User.findById(userId).select('email name role plan createdAt');
    if (!user)
        return null;
    return toUser(user);
}
async function issueTokens(userId, email, name, role, plan) {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, config_1.config.jwt.accessSecret, { expiresIn: 900 });
    const refreshToken = jsonwebtoken_1.default.sign({ userId, jti: crypto_1.default.randomUUID() }, config_1.config.jwt.refreshSecret, { expiresIn: 60 * 60 * 24 * 7 });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_DAYS);
    await RefreshToken_1.RefreshToken.create({
        userId,
        tokenHash: hashToken(refreshToken),
        expiresAt,
    });
    const expiresIn = 900; // 15 min in seconds
    return { accessToken, refreshToken, expiresIn };
}
function hashToken(t) {
    return crypto_1.default.createHash('sha256').update(t).digest('hex');
}
function toUser(u) {
    return {
        id: u._id.toString(),
        email: u.email,
        name: u.name,
        role: u.role,
        plan: u.plan,
        createdAt: u.createdAt?.toISOString(),
    };
}
async function ensureSubscription(userId, plan) {
    const limits = config_1.config.plans[plan];
    const sub = await Subscription_1.Subscription.findOne({ userId });
    if (sub)
        return sub;
    return Subscription_1.Subscription.create({
        userId,
        plan,
        limits: {
            projects: limits.projects,
            keywordsPerProject: limits.keywordsPerProject,
            countries: limits.countries,
            competitorsPerProject: limits.competitorsPerProject,
            rankUpdateFrequency: limits.rankUpdateFrequency,
            alerts: limits.alerts,
            exports: limits.exports,
        },
    });
}
//# sourceMappingURL=authService.js.map