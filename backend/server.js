require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const Product = require('./models/Product');
const Order = require('./models/Order');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ayipoee_coffee_shop';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB connected');
    // Seed sample products if none exist
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany([
        { name: 'Espresso', description: 'Strong coffee shot', price: 120 },
        { name: 'Latte', description: 'Coffee with milk', price: 150 },
        { name: 'Cappuccino', description: 'Foamy coffee', price: 160 },
        { name: 'Americano', description: 'Diluted espresso', price: 130 }
      ]);
      console.log('Sample products added');
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Ayipoee Coffee Shop API' }));

app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const { name, description, price } = req.body;
  if (!name || typeof price !== 'number') return res.status(400).json({ error: 'Missing name or valid price' });
  const item = new Product({ name, description, price });
  await item.save();
  res.status(201).json(item);
});

app.post('/api/orders', async (req, res) => {
  const { customerName, email, phone, items } = req.body;
  if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing order fields' });
  }
  const total = items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);
  const order = new Order({ customerName, email, phone, items, total });
  await order.save();
  res.status(201).json(order);
});

app.get('/api/orders', async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
