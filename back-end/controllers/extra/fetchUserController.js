const pool = require('../../utils/database');
const bcrypt = require('bcrypt');

exports.getFetchUser = async (req, res) => {
    const { username, password } = req.params;

    try {
        const connection = await pool.getConnection();
        
        // First get the user by username only
        const [rows] = await connection.execute(
            'SELECT user_id, username, password, role_id, operator_id FROM Users WHERE username = ?',
            [username]
        );

        connection.release();

        if (rows.length === 0) {
            return res.status(401).json({
                status: "failed",
                message: "Invalid username or password"
            });
        }

        // Compare hashed password
        const match = await bcrypt.compare(password, rows[0].password);
        
        if (!match) {
            return res.status(401).json({
                status: "failed",
                message: "Invalid username or password"
            });
        }

        // Don't send password back in response
        const { password: _, ...userWithoutPassword } = rows[0];
        
        res.json({
            status: "success",
            data: userWithoutPassword
        });

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            status: "failed",
            message: "Internal server error"
        });
    }
};