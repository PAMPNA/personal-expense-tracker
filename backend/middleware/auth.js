const jwt = require('jsonwebtoken');
const User = require('../models/User');
const jwtSecret = process.env.JWT_SECRET || 'secret';

module.exports = async function(req, res, next) {
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({ error: 'No token' });
  const parts = auth.split(' ');
  if(parts.length !== 2) return res.status(401).json({ error: 'Invalid token' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findById(payload.id).select('-password');
    if(!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch(e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
