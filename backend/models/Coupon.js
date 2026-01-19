// backend/models/Coupon.js
import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['PERCENT', 'FLAT'], required: true },
  value: { type: Number, required: true }, // percent (e.g., 10) or flat (e.g., 200)
  minOrder: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 0 }, // cap for percent
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  usageLimit: { type: Number, default: 0 }, // 0 = unlimited
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

couponSchema.index({ code: 1 });

export default mongoose.model('Coupon', couponSchema);
