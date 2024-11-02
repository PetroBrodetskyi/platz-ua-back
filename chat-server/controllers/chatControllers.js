import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";

export const getChats = async (req, res) => {
  const { userId } = req.query;

  try {
    const chats = await Chat.find({ users: { $in: [userId] } });
    res.status(200).json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching chats." });
  }
};

export const createChat = async (req, res) => {
  const { userId1, userId2 } = req.body;

  if (!userId1 || !userId2) {
    return res.status(400).json({ message: "Both user IDs are required." });
  }

  try {
    const existingChat = await Chat.findOne({
      users: { $all: [userId1, userId2] },
    });
    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    const newChat = await Chat.create({ users: [userId1, userId2] });
    return res.status(201).json(newChat);
  } catch (error) {
    console.error("Server error while creating chat:", error);
    return res
      .status(500)
      .json({ message: "Server error while creating chat." });
  }
};

export const getMessages = async (req, res) => {
  const { chatId } = req.query;

  if (!chatId) {
    return res.status(400).json({ message: "Chat ID is required." });
  }

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

  if (!senderId || !receiverId || !content || !chatId) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const newMessage = new Message({
    senderId,
    receiverId,
    content,
    chatId,
    createdAt: new Date(),
  });

  try {
    await newMessage.save();

    await Chat.findByIdAndUpdate(
      chatId,
      { lastMessage: content },
      { new: true }
    );

    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while sending message." });
  }
};
