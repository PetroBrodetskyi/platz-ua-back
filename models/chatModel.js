import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    user1: { type: String, required: true },
    user2: { type: String, required: true },
    lastMessage: { type: String, default: "" },
    unreadCount: {
      type: Map,
      of: Number,
      default: { user1: 0, user2: 0 },
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
