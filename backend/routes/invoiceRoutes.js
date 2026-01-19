import express from 'express';
import PDFDocument from 'pdfkit';
import Order from '../models/Order.js';

const router = express.Router();

router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).send('Order not found');

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);
    doc.pipe(res);

    // ======= HEADER =======
    doc.fontSize(26).text('SmartCart Invoice', { align: 'center', underline: true });
    doc.moveDown(1);

    // Invoice details
    doc.fontSize(12).text(`Invoice #: ${order._id}`, { align: 'center' });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'center' });
    doc.text(`Payment ID: ${order.paymentId}`, { align: 'center' });
    doc.moveDown(1);

    // Customer details
    doc.text(`Customer: ${order.user.name}`, { align: 'center' });
    if (order.user.address) doc.text(`Address: ${order.user.address}`, { align: 'center' });
    doc.text(`Email: ${order.user.email}`, { align: 'center' });
    doc.text(`Phone: ${order.user.phone}`, { align: 'center' });
    doc.moveDown(2);

    // ======= TABLE HEADER =======
    const tableTop = doc.y;
    const tableWidth = 500;

    const imgX = 60;
    const itemDescX = 150;
    const priceX = 300;
    const qtyX = 380;
    const subtotalX = 460;

    // Draw header background
    doc.rect(50, tableTop, tableWidth, 25).fill('#f0f0f0').stroke();
    doc.fillColor('black').fontSize(12).text('Image', imgX, tableTop + 7);
    doc.text('Item Description', itemDescX, tableTop + 7);
    doc.text('Price', priceX, tableTop + 7);
    doc.text('Qty', qtyX, tableTop + 7);
    doc.text('Subtotal', subtotalX, tableTop + 7);

    // Reset fill for table rows
    doc.fillColor('black');

    // ======= TABLE BODY =======
    let y = tableTop + 25;

    for (const item of order.cart) {
      // Draw row border
      doc.rect(50, y, tableWidth, 50).stroke();

      // Product Image
      if (item.image || item.images?.[0]) {
        try {
          doc.image(item.image || item.images[0], imgX, y + 5, { width: 40, height: 40 });
        } catch (err) {
          doc.fontSize(8).text('No Img', imgX, y + 20);
        }
      }

      // Product Details
      doc.fontSize(10).text(item.name, itemDescX, y + 20);
      doc.text(`₹${item.price}`, priceX, y + 20);
      doc.text(item.quantity, qtyX, y + 20);
      doc.text(`₹${item.price * item.quantity}`, subtotalX, y + 20);

      y += 50;
    }

    // ======= TOTAL =======
    doc.fontSize(14).text(`Total: ₹${order.grandTotal}`, 50, y + 20, { align: 'right' });

    // ======= FOOTER =======
    doc.moveDown(4);
    doc.fontSize(10).fillColor('gray')
      .text('Thank you for shopping with SmartCart!', { align: 'center' });
    doc.text('For support, email us at support@smartcart.com', { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('❌ Error generating invoice:', error);
    res.status(500).send('Error generating invoice');
  }
});

export default router;
