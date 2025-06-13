// db.js
require('dotenv').config();           // load .env early
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);   // optional – removes a common warning

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // you can also do:
      //   user: process.env.DB_USER,
      //   pass: process.env.DB_PASS,
      // if you prefer not to embed creds in the URI
      serverSelectionTimeoutMS: 5000  // fail fast on bad DNS / IP blocks
    });
    console.log(`MongoDB → ${conn.connection.host}:${conn.connection.port}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);                  // stop the app if the DB is unavailable
  }
};

(async ()=>{
    await connectDB()
})()