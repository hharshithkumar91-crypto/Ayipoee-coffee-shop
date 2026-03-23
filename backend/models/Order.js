const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  quantity: { type: Number, default: 1 },
  price: { type: Number, default: 0 },
});

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  email: String,
  phone: String,
  items: [orderItemSchema],
  status: { type: String, default: 'Pending' },
  total: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
