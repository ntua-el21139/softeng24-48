const pool = require('../../utils/database');

exports.getMapSupply = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.execute('SELECT * FROM Tolls');

        connection.release();

        if (rows.length === 0) {
            return res.status(204).json({
                status: "failed",
                message: "No toll stations found"
            });
        }

        res.json({
            data: rows
        })
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            status: "failed",
            message: "Internal server error",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
