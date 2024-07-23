import express from 'express';
import Product from '../models/productModel.js';
import View from '../models/viewModel.js';

const router = express.Router();

router.post('/products/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip;
    const userId = req.user ? req.user._id : null;

    const existingView = await View.findOne({ productId: id, ipAddress, userId });

    if (!existingView) {
      const newView = new View({ productId: id, ipAddress, userId });
      await newView.save();

      await Product.findByIdAndUpdate(id, { $inc: { views: 1 } });
    }

    res.status(200).send({ message: 'View registered' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default router;
