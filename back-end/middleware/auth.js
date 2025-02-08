const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.config');

const verifyToken = (req, res, next) => {
    const token = req.headers['x-observatory-auth'];

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: "No token provided" 
        });
    }

    try {
        const decoded = jwt.verify(token, jwtConfig.secret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: "Requires admin privileges"
        });
    }
};

const isTollOperator = (req, res, next) => {
    if (req.user && req.user.role === 'Toll Operator') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: "Requires toll operator privileges"
        });
    }
};

module.exports = {
    verifyToken,
    isAdmin,
    isTollOperator
}; 