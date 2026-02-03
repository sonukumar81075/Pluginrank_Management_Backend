const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { config } = require('./config');
const { connectDb } = require('./db');
const { apiRouter } = require('./routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: config.nodeEnv === 'production' ? undefined : true }));
app.use(express.json());

app.use('/api/v1', apiRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  await connectDb();
  app.listen(config.port);
}

start().catch(() => {
  process.exit(1);
});
