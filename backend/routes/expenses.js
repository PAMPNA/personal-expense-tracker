const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// Create
router.post('/', auth, async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    const e = new Expense({ title, amount, category, date: new Date(date), userId: req.user._id });
    await e.save();
    res.status(201).json(e);
  } catch(err) {
    res.status(400).json({ error: err.message });
  }
});

// Read (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { category, from, to, page = 1, limit = 50 } = req.query;
    const q = { userId: req.user._id };
    if(category) q.category = category;
    if(from || to) q.date = {};
    if(from) q.date.$gte = new Date(from);
    if(to) q.date.$lte = new Date(to);
    const p = parseInt(page) || 1;
    const lim = parseInt(limit) || 50;
    const items = await Expense.find(q).sort({ date: -1 }).skip((p-1)*lim).limit(lim);
    res.json(items);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const payload = (({ title, amount, category, date }) => ({ title, amount, category, date }))(req.body);
    const updated = await Expense.findOneAndUpdate({ _id: id, userId: req.user._id }, payload, { new: true });
    if(!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch(err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Expense.findOneAndDelete({ _id: id, userId: req.user._id });
    if(!deleted) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
