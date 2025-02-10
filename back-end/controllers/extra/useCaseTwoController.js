const pool = require('../../utils/database');

exports.getUseCaseTwo = async (req, res) => {
    try{
        const connection = await pool.getConnection();

        const { OpID } = req.params;

        if (!OpID){
            return res.status(400).json({
                status: "failed",
                message: "Missing required parameters"
            })
        }

        const [operator] = await pool.execute(
            'SELECT DISTINCT operator_id FROM Passes WHERE operator_id = ?',
            [OpID]
        );

        if (operator.length === 0) {
            return res.status(400).json({
                status: "failed",
                message: "Operator not found"
            });
        }

        const [rows] = await connection.execute('SELECT toll_id, toll_name FROM Tolls WHERE operator_id = ?', [OpID]);

        connection.release();

        if (rows.length === 0) {
            return res.status(204).json({
                status: "failed",
                message: "No tolls found for the given operator"
            });
        }
        
        res.json({
            status: "success",
            data: rows
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            status: "failed",
            message: "Internal server error",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};