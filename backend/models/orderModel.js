import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  cart: [
    {
      productId: String,
      name: String,
      quantity: Number,
      price: Number,
      image: String,
    }
  ],
  grandTotal: Number,
  paymentId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
