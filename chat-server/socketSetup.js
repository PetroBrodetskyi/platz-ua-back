import { Server } from "socket.io";
import Message from "./models/messageModel.js";

export default function socketSetup(server) {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "https://platzua.com"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("join", ({ chatId }) => {
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });

    socket.on(
      "chat message",
      async ({ senderId, receiverId, content, chatId }) => {
        try {
          const newMessage = new Message({ senderId, receiverId, content });
          await newMessage.save();

          io.to(chatId).emit("chat message", { senderId, content });
        } catch (error) {
          console.error("Error saving message:", error);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
}
