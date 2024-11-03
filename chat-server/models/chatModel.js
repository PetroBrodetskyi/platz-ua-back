import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  user1: {
    type: String,
    required: true,
  },
  user2: {
    type: String,
    required: true,
  },
  lastMessage: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

chatSchema.index({ user1: 1, user2: 1 }, { unique: true });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
