const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../utils/database');
const jwtConfig = require('../config/jwt.config');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Get user from database
        const [users] = await pool.execute(
            'SELECT * FROM Users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const user = users[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Create token
        const token = jwt.sign(
            { 
                id: user.user_id,
                username: user.username,
                role: user.role,
                operator_id: user.operator_id 
            },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );

        res.json({
            success: true,
            token: token
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.logout = (req, res) => {
    // Since JWT is stateless, we just return success
    // The front-end should remove the token
    res.json({
        success: true,
        message: "Logged out successfully"
    });
}; 