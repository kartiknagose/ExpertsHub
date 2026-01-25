const { verifyJwt } = require('../common/utils/jwt');

module.exports = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  const payload = verifyJwt(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });
  req.user = payload; // { id, role }
  next();
};