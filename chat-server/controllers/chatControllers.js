import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";

export const getChats = async (req, res) => {
  const { userId } = req.query;

  console.log("Fetching chats for userId:", userId);

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const chats = await Chat.find({
      $or: [{ user1: userId }, { user2: userId }],
    });
    console.log("Chats found:", chats);
    res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Server error while fetching chats." });
  }
};

export const getChatById = async (req, res) => {
  const { chatId } = req.params;

  console.log("Fetching chat for chatId:", chatId);

  if (!chatId) {
    return res.status(400).json({ message: "Chat ID is required." });
  }

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found." });
    }
    res.status(200).json(chat);
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ message: "Server error while fetching chat." });
  }
};

export const createChat = async (req, res) => {
  let { userId1, userId2 } = req.body;

  if (!userId1 || !userId2) {
    return res.status(400).json({ message: "Both user IDs are required." });
  }

  if (userId1 > userId2) {
    [userId1, userId2] = [userId2, userId1];
  }

  try {
    const existingChat = await Chat.findOne({ user1: userId1, user2: userId2 });

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    const newChat = await Chat.create({ user1: userId1, user2: userId2 });
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

  console.log("Fetching messages for chatId:", chatId);

  if (!chatId) {
    return res.status(400).json({ message: "Chat ID is required." });
  }

  try {
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
    console.log("Messages found:", messages);
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error while fetching messages." });
  }
};

export const sendMessage = async (req, res) => {
  const { senderId, receiverId, content, chatId, senderName } = req.body;

  console.log("Sending message from:", senderId, "to:", receiverId);

  if (!senderId || !receiverId || !content || !chatId || !senderName) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const newMessage = new Message({
    senderId,
    receiverId,
    content,
    chatId,
    senderName,
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
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error while sending message." });
  }
};
