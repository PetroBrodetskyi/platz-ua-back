import express from 'express';
import Product from '../models/productModel.js';

const router = express.Router();

router.post('/products/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const viewCookieName = `viewed_${id}`;

    // Перевіряємо, чи є кука для цього продукту
    if (!req.cookies[viewCookieName]) {
      // Якщо куки немає, збільшуємо лічильник переглядів продукту
      await Product.findByIdAndUpdate(id, { $inc: { views: 1 } });

      // Встановлюємо куку з терміном дії 1 день
      res.cookie(viewCookieName, true, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
    }

    res.status(200).send({ message: 'View registered' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default router;
