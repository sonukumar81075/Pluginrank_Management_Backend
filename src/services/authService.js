const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { User } = require('../models/User');
const { RefreshToken } = require('../models/RefreshToken');
const { Subscription } = require('../models/Subscription');
const { config } = require('../config');

const SALT_ROUNDS = 10;
const REFRESH_DAYS = 7;

async function register(email, password, name) {
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) throw new Error('EMAIL_IN_USE');
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({
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
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
  if (!user || !user.passwordHash) throw new Error('INVALID_CREDENTIALS');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error('INVALID_CREDENTIALS');
  const tokens = await issueTokens(user._id.toString(), user.email, user.name, user.role, user.plan);
  return { user: toUser(user), tokens };
}

async function refresh(refreshToken) {
  const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
  const stored = await RefreshToken.findOne({ tokenHash: hashToken(refreshToken), revokedAt: null });
  if (!stored) throw new Error('INVALID_REFRESH_TOKEN');
  const user = await User.findById(decoded.userId).select('email name role plan');
  if (!user) throw new Error('USER_NOT_FOUND');
  await RefreshToken.updateOne({ _id: stored._id }, { revokedAt: new Date() });
  const tokens = await issueTokens(user._id.toString(), user.email, user.name, user.role, user.plan);
  return { user: toUser(user), tokens };
}

async function logout(refreshToken) {
  if (refreshToken) {
    await RefreshToken.updateOne({ tokenHash: hashToken(refreshToken) }, { revokedAt: new Date() });
  }
}

async function getMe(userId) {
  const user = await User.findById(userId).select('email name role plan createdAt');
  if (!user) return null;
  return toUser(user);
}

async function updateProfile(userId, data) {
  const user = await User.findById(userId);
  if (!user) throw new Error('USER_NOT_FOUND');
  if (data.name != null) user.name = String(data.name).trim();
  if (data.email != null) {
    const email = String(data.email).toLowerCase().trim();
    if (email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) throw new Error('EMAIL_IN_USE');
      user.email = email;
    }
  }
  await user.save();
  return toUser(user);
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user || !user.passwordHash) throw new Error('USER_NOT_FOUND');
  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) throw new Error('INVALID_PASSWORD');
  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();
  return { ok: true };
}

async function issueTokens(userId, email, name, role, plan) {
  const accessToken = jwt.sign({ userId }, config.jwt.accessSecret, { expiresIn: 900 });
  const refreshToken = jwt.sign(
    { userId, jti: crypto.randomUUID() },
    config.jwt.refreshSecret,
    { expiresIn: 60 * 60 * 24 * 7 }
  );
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_DAYS);
  await RefreshToken.create({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt,
  });
  const expiresIn = 900;
  return { accessToken, refreshToken, expiresIn };
}

function hashToken(t) {
  return crypto.createHash('sha256').update(t).digest('hex');
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

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

async function requestPasswordReset(email) {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordResetToken +passwordResetExpires');
  if (!user) return { ok: true }; // Don't reveal if email exists
  const plainToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
  user.passwordResetToken = tokenHash;
  user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);
  await user.save({ validateBeforeSave: false });
  return { ok: true, resetToken: plainToken };
}

async function resetPassword(token, newPassword) {
  if (!token || typeof token !== 'string') throw new Error('INVALID_TOKEN');
  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
  const user = await User.findOne({
    passwordResetToken: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordHash +passwordResetToken +passwordResetExpires');
  if (!user) throw new Error('INVALID_OR_EXPIRED_TOKEN');
  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });
  return { ok: true };
}

async function ensureSubscription(userId, plan) {
  const limits = config.plans[plan];
  const sub = await Subscription.findOne({ userId });
  if (sub) return sub;
  return Subscription.create({
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

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  ensureSubscription,
};
