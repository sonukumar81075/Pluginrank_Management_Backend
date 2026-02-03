const mongoose = require('mongoose');
const { config } = require('../config');

async function connectDb() {
  await mongoose.connect(config.mongoUri);
}

async function disconnectDb() {
  await mongoose.disconnect();
}

module.exports = { connectDb, disconnectDb };
