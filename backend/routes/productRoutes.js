// backend/routes/productRoutes.js
import express from 'express';
import Product from '../models/Product.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/products
// supports: q (search), category, sort, order, page, limit, minPrice, maxPrice
router.get('/', async (req, res, next) => {
  try {
    const {
      q = '',
      category,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit, // 👈 if not provided, return ALL products
      minPrice,
      maxPrice,
    } = req.query;

    const filter = {};
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // 🔥 Handle pagination only if limit exists
    let products;
    let total;

    if (limit) {
      const skip = (Number(page) - 1) * Number(limit);

      const listQuery = Product.find(filter)
        .lean()
        .sort({ [sort]: order === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(Number(limit));

      [products, total] = await Promise.all([
        listQuery,
        Product.countDocuments(filter),
      ]);

      return res.json({
        items: products,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      });
    } else {
      // ✅ Return all products if no limit
      products = await Product.find(filter)
        .lean()
        .sort({ [sort]: order === 'asc' ? 1 : -1 });

      return res.json({ items: products, total: products.length });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) return res.status(404).json({ message: 'Product not found' });
    res.json(prod);
  } catch (err) {
    next(err);
  }
});

// GET recommendations: /api/products/:id/recommendations
router.get('/:id/recommendations', async (req, res, next) => {
  try {
    const base = await Product.findById(req.params.id).lean();
    if (!base) return res.status(404).json({ message: 'Product not found' });
    const items = await Product.find({ _id: { $ne: base._id }, category: base.category })
      .lean()
      .sort({ createdAt: -1 })
      .limit(8);
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// Admin: Create product (protected)
router.post('/', protect, async (req, res, next) => {
  try {
    const product = new Product({ ...req.body, createdBy: req.user._id });
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
});

// Update product
router.put('/:id', protect, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    Object.assign(product, req.body);
    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Delete product
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
