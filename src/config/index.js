if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

/* ---------- JWT VALIDATION ---------- */
const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

if (isProduction && (!jwtAccessSecret || !jwtRefreshSecret)) {
  throw new Error(
    '❌ Production requires JWT_ACCESS_SECRET and JWT_REFRESH_SECRET to be set'
  );
}

/* ---------- CONFIG ---------- */
const config = {
  nodeEnv,
  isProduction,

  // Render injects PORT automatically
  port: process.env.PORT ? Number(process.env.PORT) : 5000,

  // NEVER fallback to localhost in production
  mongoUri: isProduction
    ? process.env.MONGO_URI
    : process.env.MONGO_URI || 'mongodb://localhost:27017/plugin_management',

  frontendUrl: process.env.FRONTEND_URL || null,

  jwt: {
    accessSecret: jwtAccessSecret || 'dev-access-secret',
    refreshSecret: jwtRefreshSecret || 'dev-refresh-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  apiKey: {
    rateLimitPerMin: Number(process.env.API_KEY_RATE_LIMIT_PER_MIN || 60),
  },

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
    max: Number(process.env.RATE_LIMIT_MAX || 100),
  },

  wpOrg: {
    apiBase: 'https://api.wordpress.org/plugins/info/1.2/',
    svnReadmeBase: 'https://plugins.svn.wordpress.org',
    cacheTtlDays: Number(process.env.WPORG_CACHE_TTL_DAYS || 14),
  },

  plans: {
    free: {
      projects: 1,
      keywordsPerProject: 5,
      countries: 1,
      competitorsPerProject: 1,
      rankUpdateFrequency: 'weekly',
      alerts: false,
      exports: false,
    },
    paid: {
      projects: 100,
      keywordsPerProject: 50,
      countries: 5,
      competitorsPerProject: 10,
      rankUpdateFrequency: 'daily',
      alerts: true,
      exports: true,
    },
  },
};

module.exports = { config };
