const { Router } = require('express');
const { z } = require('zod');
const { authenticate, requireAuth } = require('../middleware/auth');
const authService = require('../services/authService');

const router = Router();

const registerBody = z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().min(1).max(200) });
const loginBody = z.object({ email: z.string().email(), password: z.string() });
const refreshBody = z.object({ refreshToken: z.string() });
const updateProfileBody = z.object({ name: z.string().min(1).max(200).optional(), email: z.string().email().optional() }).refine((d) => d.name != null || d.email != null, { message: 'Provide name or email' });
const changePasswordBody = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) });
const forgotPasswordBody = z.object({ email: z.string().email() });
const resetPasswordBody = z.object({ token: z.string().min(1), newPassword: z.string().min(8) });

router.post('/register', async (req, res) => {
  try {
    const body = registerBody.parse(req.body);
    const result = await authService.register(body.email, body.password, body.name);
    res.status(201).json(result);
  } catch (e) {
    if (e instanceof z.ZodError) {
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
  } catch (e) {
    if (e instanceof z.ZodError) {
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
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: e.errors[0]?.message ?? 'Invalid input' } });
    }
    return res.status(401).json({ error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' } });
  }
});

router.post('/logout', authenticate, requireAuth, async (req, res) => {
  const refreshToken = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : undefined;
  await authService.logout(refreshToken);
  res.status(204).send();
});

router.get('/me', authenticate, requireAuth, async (req, res) => {
  const user = await authService.getMe(req.auth.id);
  if (!user) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
  res.json({ user });
});

router.patch('/me', authenticate, requireAuth, async (req, res) => {
  try {
    const body = updateProfileBody.parse(req.body);
    const user = await authService.updateProfile(req.auth.id, body);
    res.json({ user });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: e.errors[0]?.message ?? 'Invalid input' } });
    }
    if (e.message === 'EMAIL_IN_USE') {
      return res.status(400).json({ error: { code: 'EMAIL_IN_USE', message: 'Email already in use' } });
    }
    throw e;
  }
});

router.post('/change-password', authenticate, requireAuth, async (req, res) => {
  try {
    const body = changePasswordBody.parse(req.body);
    await authService.changePassword(req.auth.id, body.currentPassword, body.newPassword);
    res.status(204).send();
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: e.errors[0]?.message ?? 'Invalid input' } });
    }
    if (e.message === 'INVALID_PASSWORD') {
      return res.status(401).json({ error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect' } });
    }
    throw e;
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const body = forgotPasswordBody.parse(req.body);
    const result = await authService.requestPasswordReset(body.email);
    res.json(result);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: e.errors[0]?.message ?? 'Invalid input' } });
    }
    throw e;
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const body = resetPasswordBody.parse(req.body);
    await authService.resetPassword(body.token, body.newPassword);
    res.json({ ok: true, message: 'Password has been reset' });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: e.errors[0]?.message ?? 'Invalid input' } });
    }
    if (e.message === 'INVALID_OR_EXPIRED_TOKEN') {
      return res.status(400).json({ error: { code: 'INVALID_OR_EXPIRED_TOKEN', message: 'Reset link is invalid or has expired' } });
    }
    throw e;
  }
});

module.exports = { authRoutes: router };
