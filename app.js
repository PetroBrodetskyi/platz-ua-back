import express from "express";
import morgan from "morgan";
import cors from "cors";
import axios from "axios";
import "dotenv/config";

import productsRouter from "./routes/productsRouter.js";
import { usersRouter, adminRouter } from "./routes/usersRouter.js";
import uploadRouter from "./routes/uploadRouter.js";
import sitemapRouter from "./routes/sitemapRouter.js";

const app = express();

const corsOptions = {
  origin: [
    "https://platzua.com",
    "https://platz-ua-front.vercel.app",
    "http://localhost:5173",
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
};

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

app.use(morgan("tiny"));
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));

app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);
app.use("/api/admin", adminRouter);
app.use("/api", uploadRouter);
app.use(sitemapRouter);

app.get("/api/exchange-rate", async (req, res, next) => {
  try {
    const response = await axios.get(
      "https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5"
    );
    const euroRate = response.data.find((rate) => rate.ccy === "EUR");
    res.json(euroRate);
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

export default app;
