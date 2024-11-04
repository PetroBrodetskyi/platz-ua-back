import express from "express";
import {
  getMessages,
  sendMessage,
  getChats,
  getChatById,
  createChat,
} from "../controllers/chatControllers.js";

const router = express.Router();

router.get("/messages", getMessages);
router.post("/messages", sendMessage);
router.get("/chats", getChats);
router.get("/chats/:chatId", getChatById);
router.post("/chats", createChat);

export default router;
