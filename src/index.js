const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { config } = require('./config');
const { connectDb } = require('./db');
const { apiRouter } = require('./routes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: config.isProduction
    ? (config.frontendUrl ? config.frontendUrl : false)
    : true,
  credentials: true,
}));
app.use(express.json());

app.use('/api/v1', apiRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  await connectDb();
  app.listen(config.port);
}

start().catch((err) => {
  if (process.env.NODE_ENV === 'production') {
    process.stderr.write(err?.stack || String(err));
    process.stderr.write('\n');
  }
  process.exit(1);
});
