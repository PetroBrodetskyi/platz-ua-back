import "dotenv/config";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import Pusher from "pusher";
import ChatMessage from './models/chatMessage.js';

const { DB_HOST, PORT, PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = process.env;

const app = express();
app.use(express.json());
app.use(cors());

const pusher = new Pusher({
  appId: PUSHER_APP_ID,
  key: PUSHER_KEY,
  secret: PUSHER_SECRET,
  cluster: PUSHER_CLUSTER,
  useTLS: true
});

app.get('/messages', async (req, res) => {
  try {
    const messages = await ChatMessage.find().sort({ timestamp: -1 }).limit(50).exec();
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/messages', async (req, res) => {
  const { sender, content } = req.body;
  const newMessage = new ChatMessage({ sender, content });

  try {
    await newMessage.save();
    pusher.trigger('chat', 'message', {
      sender,
      content
    });
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

mongoose.connect(DB_HOST, {
  dbName: 'platzbase',
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
}).then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
    console.log("Database connection successful");
  });
}).catch(error => {
  console.log("Database connection error:", error.message);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  console.log('Database disconnected');
  process.exit(0);
});
