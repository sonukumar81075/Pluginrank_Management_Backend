// const mongoose = require('mongoose');
// const { config } = require('../config');

// async function connectDb() {
//   await mongoose.connect(config.mongoUri);
// }

// async function disconnectDb() {
//   await mongoose.disconnect();
// }

// module.exports = { connectDb, disconnectDb };
const mongoose = require('mongoose');
const { config } = require('../config');

async function connectDb() {
  if (!config.mongoUri) {
    throw new Error('❌ MONGO_URI is missing in environment variables');
  }

  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(config.mongoUri, {
      autoIndex: true,
    });

    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed');
    console.error(err.message);
    throw err; // IMPORTANT: let index.js handle exit
  }
}

async function disconnectDb() {
  await mongoose.disconnect();
  console.log('🔌 MongoDB disconnected');
}

module.exports = { connectDb, disconnectDb };
