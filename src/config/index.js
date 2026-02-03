require('dotenv').config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/plugin_management',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'change-me-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-in-production',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  apiKey: {
    rateLimitPerMin: parseInt(process.env.API_KEY_RATE_LIMIT_PER_MIN || '60', 10),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  wpOrg: {
    apiBase: 'https://api.wordpress.org/plugins/info/1.2/',
    svnReadmeBase: 'https://plugins.svn.wordpress.org',
    cacheTtlDays: parseInt(process.env.WPORG_CACHE_TTL_DAYS || '14', 10),
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
