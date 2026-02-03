require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const jwtAccessSecret = process.env.JWT_ACCESS_SECRET || 'change-me-in-production';
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'change-me-in-production';
if (isProduction && (jwtAccessSecret === 'change-me-in-production' || jwtRefreshSecret === 'change-me-in-production')) {
  throw new Error('Production requires JWT_ACCESS_SECRET and JWT_REFRESH_SECRET to be set in environment.');
}

const config = {
  nodeEnv,
  isProduction,
  port: parseInt(process.env.PORT || '3001', 10),
<<<<<<< HEAD
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/plugin_management',
  /** In production, set FRONTEND_URL (e.g. https://app.example.com) so CORS allows only your frontend. */
  frontendUrl: process.env.FRONTEND_URL || (isProduction ? null : true),
=======
  mongoUri: process.env.MONGO_URI || 'mongodb+srv://sonusaini81075_plugin_rank:abCD@1234@cluster0.rqqjdmw.mongodb.net/',
>>>>>>> aef963484e1ac34f770d4147492d68daabe6ff3f
  jwt: {
    accessSecret: jwtAccessSecret,
    refreshSecret: jwtRefreshSecret,
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
