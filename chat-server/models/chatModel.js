import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  users: { type: [String], required: true },
  lastMessage: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
