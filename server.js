import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const { DB_HOST, PORT } = process.env;

const mongooseOptions = {
  dbName: 'platzbase',
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
};

mongoose.connect(DB_HOST, mongooseOptions)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server started on port: ${PORT}`);
      console.log("Database connection successful");
    });
  })
  .catch(error => {
    console.log("Database connection error:", error.message);
    process.exit(1);
  });

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  console.log('Database disconnected');
  process.exit(0);
});