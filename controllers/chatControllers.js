import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";

export const getChats = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const chats = await Chat.find({
      $or: [{ user1: userId }, { user2: userId }],
    }).sort({ updatedAt: -1 });

    const chatsWithUnreadCount = chats.map((chat) => ({
      ...chat.toObject(),
      unreadCount:
        chat.unreadCount.get(chat.user1 === userId ? "user1" : "user2") || 0,
    }));

    res.status(200).json(chatsWithUnreadCount);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Server error while fetching chats." });
  }
};

export const getChatById = async (req, res) => {
  const { chatId } = req.params;

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
  const { chatId, userId } = req.query;

  if (!chatId || !userId) {
    return res
      .status(400)
      .json({ message: "Chat ID and User ID are required." });
  }

  try {
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

    const chat = await Chat.findById(chatId);
    if (chat) {
      const userKey = chat.user1 === userId ? "user1" : "user2";
      chat.unreadCount.set(userKey, 0);
      await chat.save();
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error while fetching messages." });
  }
};

export const sendMessage = async (req, res) => {
  const { senderId, receiverId, content, chatId, senderName } = req.body;

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

    const chat = await Chat.findById(chatId);
    if (chat) {
      const receiverKey = chat.user1 === receiverId ? "user1" : "user2";
      chat.unreadCount.set(
        receiverKey,
        (chat.unreadCount.get(receiverKey) || 0) + 1
      );
      chat.lastMessage = content;
      await chat.save();
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error while sending message." });
  }
};

export const editMessage = async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Content is required." });
  }

  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { content },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: "Message not found." });
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("Error editing message:", error);
    res.status(500).json({ message: "Server error while editing message." });
  }
};

export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    const deletedMessage = await Message.findByIdAndDelete(messageId);

    if (!deletedMessage) {
      return res.status(404).json({ message: "Message not found." });
    }

    res.status(200).json({ message: "Message deleted successfully." });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Server error while deleting message." });
  }
};
