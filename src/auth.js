const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./config');

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'No token' });
  const token = header.split(' ')[1];
  jwt.verify(token, jwtSecret, (err, user) => {
    if(err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}
module.exports = authMiddleware;
