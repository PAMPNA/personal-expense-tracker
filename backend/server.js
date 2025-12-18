// Simple Express + Mongoose backend for Personal Expense Tracker
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expenses_db';
mongoose.connect(MONGO, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(()=> console.log('MongoDB connected'))
  .catch(e => console.error('Mongo connect error', e));

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/api/health', (req, res) => res.json({ok: true}));

const port = process.env.PORT || 4000;
app.listen(port, ()=> console.log('Server running on port', port));
