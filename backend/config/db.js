const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/openhire';
  
  try {
    // Attempt standard connection first with 3.5s timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3500,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`[Database] Local MongoDB unavailable (${err.message}). Initializing embedded in-memory database...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        binary: {
          version: '4.0.28'
        }
      });
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] Embedded MongoDB Memory Server connected successfully: ${memoryUri}`);
      return conn;
    } catch (innerErr) {
      console.error(`[Database] Failed to connect to MongoDB: ${innerErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
