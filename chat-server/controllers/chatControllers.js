import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";

export const getChats = async (req, res) => {
  const { userId } = req.query;

  try {
    const chats = await Chat.find({ users: userId });
    res.status(200).json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching chats." });
  }
};

export const createChat = async (req, res) => {
  const { userId1, userId2 } = req.body;

  try {
    const chat = await Chat.findOneAndUpdate(
      { users: { $all: [userId1, userId2] } },
      { $setOnInsert: { users: [userId1, userId2], lastMessage: "" } },
      { upsert: true, new: true }
    );
    res.status(201).json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while creating chat." });
  }
};

export const getMessages = async (req, res) => {
  const { chatId } = req.query;

  try {
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching messages." });
  }
};

export const sendMessage = async (req, res) => {
  const { senderId, receiverId, content, chatId } = req.body;

  const newMessage = new Message({
    senderId,
    receiverId,
    content,
    chatId,
    createdAt: new Date(),
  });

  try {
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while sending message." });
  }
};
