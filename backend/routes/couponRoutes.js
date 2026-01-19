// backend/routes/couponRoutes.js
import express from 'express';
import Coupon from '../models/Coupon.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Create coupon (protected - later add admin role check)
router.post('/', protect, async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) { next(err); }
});

// Validate coupon: GET /api/coupons/validate/:code?total=1234
router.get('/validate/:code', async (req, res, next) => {
  try {
    const total = Number(req.query.total || 0);
    const code = (req.params.code || '').toUpperCase();
    const coupon = await Coupon.findOne({ code, isActive: true }).lean();
    if (!coupon) return res.status(404).json({ message: 'Invalid coupon' });

    const now = new Date();
    if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate))
      return res.status(400).json({ message: 'Coupon expired or not active' });

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
      return res.status(400).json({ message: 'Coupon usage limit reached' });

    if (total < (coupon.minOrder || 0))
      return res.status(400).json({ message: `Minimum order ₹${coupon.minOrder} required` });

    let discount = coupon.type === 'PERCENT' ? (total * coupon.value) / 100 : coupon.value;
    if (coupon.type === 'PERCENT' && coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    discount = Math.min(discount, total);

    const payable = Math.max(total - discount, 0);

    res.json({
      valid: true,
      code: coupon.code,
      discount,
      payable,
      couponId: coupon._id,
    });
  } catch (err) { next(err); }
});

// Optionally: mark coupon used (should be done in order creation with transaction)
router.post('/use/:id', protect, async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    coupon.usedCount = (coupon.usedCount || 0) + 1;
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) coupon.isActive = false;
    await coupon.save();
    res.json({ message: 'Coupon usage recorded' });
  } catch (err) { next(err); }
});

export default router;
