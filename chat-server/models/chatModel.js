import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  users: { type: [String], required: true, unique: true },
  lastMessage: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

chatSchema.index({ users: 1 }, { unique: true });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
