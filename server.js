import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import { createServer } from "http";
import { Server } from "socket.io";
import ChatMessage from './models/chatMessage.js';

const { DB_HOST, PORT } = process.env;

const mongooseOptions = {
  dbName: 'platzbase',
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
};

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://petrobrodetskyi.github.io",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Новий клієнт підключився", socket.id);

  (async () => {
    try {
      const messages = await ChatMessage.find().sort({ timestamp: -1 }).limit(50).exec();
      socket.emit('initialMessages', messages.reverse());
    } catch (error) {
      console.error('Error fetching messages:', error.message);
    }
  })();

  socket.on("message", async (message) => {
    const { sender, content } = message;
    const newMessage = new ChatMessage({ sender, content });

    try {
      await newMessage.save();
      io.emit("message", newMessage);
    } catch (error) {
      console.error('Error saving message:', error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Клієнт відключився", socket.id);
  });
});

mongoose.connect(DB_HOST, mongooseOptions)
  .then(() => {
    server.listen(PORT, () => {
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
