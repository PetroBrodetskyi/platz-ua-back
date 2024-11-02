import express from "express";
import cors from "cors";
import http from "http";
import mongoose from "mongoose";
import socketSetup from "./socketSetup.js";
import dotenv from "dotenv";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: [
      "https://platzua.com",
      "https://platz-ua-front.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const mongooseOptions = {
  dbName: "platzbase",
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

app.use(express.json());
app.use(express.static("."));
app.use("/api/chat", chatRoutes);

socketSetup(server);

const { DB_HOST, PORT } = process.env;

mongoose
  .connect(DB_HOST, mongooseOptions)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server started on port: ${PORT}`);
      console.log("Database connection successful");
    });
  })
  .catch((error) => {
    console.log("Database connection error:", error.message);
    process.exit(1);
  });

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("Database disconnected");
  process.exit(0);
});
