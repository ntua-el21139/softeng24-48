const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    database: process.env.DB_DATABASE || 'interToll'
};

// Only add password if it's set in .env
if (process.env.DB_PASSWORD) {
    config.password = process.env.DB_PASSWORD;
}

module.exports = config; 