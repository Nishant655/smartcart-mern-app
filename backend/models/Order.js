import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    cart: [{ name: String, quantity: Number, price: Number }],
    grandTotal: Number,
    paymentId: String,
    user: {
        name: String,
        email: String,
        phone: String
    }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
