const jwt = require('jsonwebtoken');

function isTokenSent(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid Token' });
    req.user = user;
    next();
  });
}

module.exports = isTokenSent;
