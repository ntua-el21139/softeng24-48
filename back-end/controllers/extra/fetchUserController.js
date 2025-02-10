const pool = require('../../utils/database');

exports.getFetchUser = async (req, res) => {
    const { username, password } = req.params;

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT user_id, username, role_id, operator_id FROM Users WHERE username = ? AND password = ?',
            [username, password]
        );

        connection.release();

        if (rows.length === 0) {
            return res.status(401).json({
                status: "failed",
                message: "Invalid username or password"
            });
        }

        res.json({
            status: "success",
            data: rows[0]
        });

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            status: "failed",
            message: "Internal server error"
        });
    }
};