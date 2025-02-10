const pool = require('../../utils/database');

exports.resetpasses = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Delete all records
        await connection.query('DELETE FROM Passes');
        
        // Reset auto-increment counter
        await connection.query('ALTER TABLE Passes AUTO_INCREMENT = 1');
        
        await connection.commit();

        res.json({
            status: "OK"
        });
    } catch (error) {
        await connection.rollback();
        console.error("Database error:", error);
        res.status(500).json({
            status: "failed",
            info: error.message
        });
    } finally {
        connection.release();
    }
};

