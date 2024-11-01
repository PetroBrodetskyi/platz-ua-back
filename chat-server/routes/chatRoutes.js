import express from "express";
import { getMessages, sendMessage } from "../controllers/chatControllers.js";
import { getChats, createChat } from "../controllers/chatControllers.js";

const router = express.Router();

router.get("/messages", getMessages);
router.post("/messages", sendMessage);
router.get("/chats", getChats);
router.post("/chats", createChat);

export default router;
