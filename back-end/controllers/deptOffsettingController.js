const pool = require('../utils/database');
const moment = require('moment');

exports.getDeptOffsetting = async (req, res) => {
    try {
        const { credential, date } = req.params;

        // Check if parameters are missing
        if (!credential || !date) {
            return res.status(400).json({
                status: "failed",
                message: "Missing required parameters"
            });
        }

        // Validate date format for YYYY-MM
        if (!moment(date, 'YYYY-MM', true).isValid()) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid date format. Use YYYY-MM"
            });
        }

        const [stationOperator] = await pool.execute(
            'SELECT operator_id FROM Passes WHERE operator_id = ? LIMIT 1',
            [credential]
        );

        // Check if credential is valid
        if (stationOperator.length === 0) {
            if (credential === "admin") {
                const sql = `
                    SELECT 
                        id,
                        debtor_operator_id,
                        creditor_operator_id,
                        amount,
                        month_year,
                        created_at
                    FROM Monthly_Debts
                    WHERE DATE_FORMAT(month_year, '%Y-%m') = ?
                    ORDER BY created_at ASC
                `;
                
                const [rows] = await pool.execute(sql, [date]);

                if (rows.length === 0) {
                    return res.status(204).json({
                        status: "failed",
                        message: "No debts found for the specified month"
                    });
                }

                return res.json({
                    status: "success",
                    data: rows
                });
            } else {
                return res.status(400).json({
                    status: "failed",
                    message: "Enter valid operator_id or 'admin' as parameter"
                });
            }      
        } else {
            // Handle station operator logic here
        }
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            status: "failed",
            message: "Internal server error",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
