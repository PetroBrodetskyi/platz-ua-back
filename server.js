import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import { createServer } from "http";
import { Server } from "socket.io";

const { DB_HOST, PORT } = process.env;

const mongooseOptions = {
  dbName: 'platzbase',
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
};

// Створюємо HTTP сервер з Express
const server = createServer(app);

// Ініціалізуємо socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Налаштуйте дозволені домени
  },
});

// Обробка підключень через WebSocket
io.on("connection", (socket) => {
  console.log("Новий клієнт підключився", socket.id);

  socket.on("message", (data) => {
    console.log("Повідомлення від клієнта:", data);
    
    // Відправка повідомлення всім клієнтам
    io.emit("message", data);
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
