import express from "express";
import {
  getMessages,
  sendMessage,
  getChats,
  getChatById,
  createChat,
} from "../controllers/chatControllers.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.get("/messages", authenticate, getMessages);
router.post("/messages", sendMessage);
router.get("/chats", getChats);
router.get("/chats/:chatId", authenticate, getChatById);
router.post("/chats", createChat);

export default router;
