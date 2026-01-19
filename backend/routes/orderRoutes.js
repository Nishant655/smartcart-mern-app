import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

// ✅ Save Order
router.post('/', async (req, res) => {
    const { cart, grandTotal, paymentId, user } = req.body;
    if (!cart?.length || !paymentId || !user?.name) {
        return res.status(400).json({ message: "Missing order details" });
    }
    try {
        const order = new Order({ cart, grandTotal, paymentId, user });
        const savedOrder = await order.save();
        res.status(201).json({ success: true, orderId: savedOrder._id });
    } catch (error) {
        console.error('❌ Error saving order:', error);
        res.status(500).json({ success: false, message: 'Error saving order' });
    }
});

export default router;
