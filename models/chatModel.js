import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
