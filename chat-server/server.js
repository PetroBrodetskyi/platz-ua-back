import express from "express";
import http from "http";
import socketSetup from "./socketSetup.js";
import dotenv from "dotenv";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const PORT = process.env.PORT;

const app = express();
const server = http.createServer(app);

socketSetup(server);

app.use(express.static("."));
app.use(express.json());
app.use("/api/chat", chatRoutes);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
