const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_dev_secret';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

module.exports = { PORT, JWT_SECRET, CORS_ORIGIN };