const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { config } = require('./config');
const { connectDb } = require('./db');
const { apiRouter } = require('./routes');

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(helmet());
app.use(cors({
  origin: config.isProduction
    ? (config.frontendUrl || false)
    : true,
  credentials: true,
}));
app.use(express.json());

/* ---------- ROUTES ---------- */
app.use('/api/v1', apiRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ---------- START SERVER ---------- */
async function start() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDb();
    console.log('✅ Database connected');

    const PORT = process.env.PORT || config.port || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server failed to start');
    console.error(err);
    process.exit(1);
  }
}

start();
