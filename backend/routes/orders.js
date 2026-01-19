import express from 'express';
import Order from '../models/Order.js';
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json({ message: 'Order placed', order: newOrder });
  } catch (err) {
    res.status(500).json({ error: 'Error saving order' });
  }
});

router.get('/', async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

export default router;
