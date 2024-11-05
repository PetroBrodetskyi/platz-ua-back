import express from "express";
import {
  getMessages,
  sendMessage,
  getChats,
  getChatById,
  createChat,
  editMessage,
  deleteMessage,
} from "../controllers/chatControllers.js";

const router = express.Router();

router.get("/messages", getMessages);
router.post("/messages", sendMessage);
router.get("/chats", getChats);
router.get("/chats/:chatId", getChatById);
router.post("/chats", createChat);
router.patch("/messages/:messageId", editMessage);
router.delete("/messages/:messageId", deleteMessage);

export default router;
