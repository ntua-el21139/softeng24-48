require('dotenv').config();

module.exports = {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h' // Token expiration time
}; 