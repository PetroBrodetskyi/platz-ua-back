import { Server } from "socket.io";
import Message from "./models/messageModel.js";

export default function socketSetup(server) {
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("chat message", async ({ senderId, receiverId, msg }) => {
      const newMessage = new Message({ senderId, receiverId, content: msg });
      await newMessage.save();

      socket.to(receiverId).emit("chat message", { senderId, msg });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
}
