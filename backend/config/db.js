const mongoose = require('mongoose');

let isConnected = false;
let isEmbedded = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/openhire';

  try {
    // Attempt standard connection with 1.8s timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1800
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    isConnected = true;
    isEmbedded = false;
    process.env.USE_EMBEDDED_DB = 'false';
    return conn;
  } catch (err) {
    console.warn(`[Database] Local MongoDB unavailable (${err.message}). Activating embedded persistent database engine...`);
    isConnected = true;
    isEmbedded = true;
    process.env.USE_EMBEDDED_DB = 'true';
    return { connection: { host: 'embedded-local-storage' } };
  }
};

module.exports = connectDB;
module.exports.isEmbedded = () => process.env.USE_EMBEDDED_DB === 'true';
