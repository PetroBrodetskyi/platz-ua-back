import express from 'express';
import Message from '../models/chatMessage.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const { sender, content } = req.body;

  try {
    const newMessage = new Message({ sender, content });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
