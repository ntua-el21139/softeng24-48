const pool = require('../../utils/database');

exports.resetpasses = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM Passes');
        connection.release();

        res.json({
            status: "OK"
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            status: "failed",
            info: error.message
        });
    }
};

