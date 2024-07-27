import express from "express";
import cors from "cors";
import morgan from "morgan";
import axios from "axios";
import "dotenv/config";

import productsRouter from './routes/productsRouter.js';
import usersRouter from "./routes/usersRouter.js";
import uploadRouter from './routes/uploadRouter.js';

const app = express();

// Налаштування CORS
app.use(cors({
  origin: 'https://petrobrodetskyi.github.io', // Домен вашого клієнта
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true
}));

app.use(morgan("tiny"));
app.use(express.json({ limit: '10mb' }));

app.use('/api/products', productsRouter);
app.use("/api/users", usersRouter);
app.use("/api", uploadRouter);

app.get('/api/exchange-rate', async (req, res, next) => {
  try {
    const response = await axios.get('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5');
    const euroRate = response.data.find(rate => rate.ccy === 'EUR');
    res.json(euroRate);
  } catch (error) {
    next(error);
  }
});

// Обробка preflight запитів
app.options('*', cors());

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

export default app;
