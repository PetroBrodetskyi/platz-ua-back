import Message from "../models/messageModel.js";

export const getMessages = async (req, res) => {
  const { senderId, receiverId } = req.query;

  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching messages." });
  }
};

export const sendMessage = async (req, res) => {
  const { senderId, receiverId, messageContent } = req.body;

  const newMessage = new Message({
    senderId,
    receiverId,
    content: messageContent,
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
