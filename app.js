import express from "express";
import morgan from "morgan";
import cors from "cors";
import axios from "axios";
import "dotenv/config";

import productsRouter from './routes/productsRouter.js';
import usersRouter from "./routes/usersRouter.js";
import uploadRouter from './routes/uploadRouter.js';

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.use('/api/products', productsRouter);
app.use("/api/users", usersRouter);
app.use("/api", uploadRouter);

app.get('/api/exchange-rate', async (req, res) => {
  try {
    const response = await axios.get('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5');
    const euroRate = response.data.find(rate => rate.ccy === 'EUR');
    res.json(euroRate);
  } catch (error) {
    res.status(500).send('Error fetching exchange rate');
  }
});

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

export default app;
