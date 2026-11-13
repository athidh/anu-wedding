const mongoose = require('mongoose');

let isConnected = false;
let retryTimer = null;

mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('\x1b[32m[Database]\x1b[0m Successfully connected to MongoDB Atlas.');
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('\x1b[33m[Database]\x1b[0m Disconnected from MongoDB Atlas.');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error('\x1b[31m[Database Error]\x1b[0m', err.message);
});

async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('\x1b[31m[Database Error]\x1b[0m MONGODB_URI is not set in environment variables.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });

    isConnected = conn.connections[0].readyState === 1;
    console.log(`\x1b[32m[Database]\x1b[0m Connected to MongoDB Atlas host: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.error('\x1b[31m[Database Connection Failed]\x1b[0m', error.message);
    console.warn('\x1b[33m[Database]\x1b[0m Will retry connection in 10 seconds...');
    if (!retryTimer) {
      retryTimer = setTimeout(() => {
        retryTimer = null;
        connectDB();
      }, 10000);
    }
  }
}

module.exports = { connectDB, isConnected: () => isConnected };
