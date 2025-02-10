const pool = require('../utils/database');
const moment = require('moment');
exports.getPassesCost = async (req, res) => {
    try {
        const { tollOpID, tagOpID, date_from, date_to } = req.params;

        // Check if any required parameters are missing
        if (!tollOpID || !tagOpID || !date_from || !date_to) {
            return res.status(400).json({
                status: "failed",
                message: "Missing required parameters"
            });
        }

        const requestTimestamp = moment().format('YYYY-MM-DD HH:mm');

        // Validate date format
        if (!moment(date_from, 'YYYY-MM-DD', true).isValid() || 
            !moment(date_to, 'YYYY-MM-DD', true).isValid()) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid date format. Use YYYY-MM-DD"
            });
        }

        // Check if both operators exist separately
        const [tollOperator] = await pool.execute(
            'SELECT operator_id FROM Passes WHERE operator_id = ? LIMIT 1',
            [tollOpID]
        );

        const [tagOperator] = await pool.execute(
            'SELECT operator_id FROM Passes WHERE operator_id = ? LIMIT 1',
            [tagOpID]
        );

        if (tollOperator.length === 0 || tagOperator.length === 0) {
            return res.status(400).json({
                status: "failed",
                message: "One or both operators not found"
            });
        }

        //SQL Query: Get passes for the given tollOpID and tagOpID where 
        //timestamp between date_from and date_to
        const sql = `
            SELECT 
                charge
            FROM Passes
            WHERE operator_id = ?
              AND tag_home_id = ?
              AND timestamp BETWEEN ? AND ?
            ORDER BY timestamp ASC;
        `;

        //Execute query
        const [rows] = await pool.execute(sql, [tollOpID, tagOpID, date_from, date_to]);

        if (rows.length === 0) {
            return res.status(204).json({
                status: "failed",
                message: "No passes found for given operators and time period"
            });
        }

        // Convert to cents (integers) before summing to avoid floating-point errors
        const totalCost = rows.reduce((sum, row) => sum + Math.round(row.charge * 100), 0) / 100;
        
        //Response
        res.json({
            tollOpID: tollOpID,
            tagOpID: tagOpID,
            requestTimestamp: requestTimestamp,
            periodFrom: date_from,
            periodTo: date_to,
            nPasses: rows.length,
            passesCost: totalCost
        });
        
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            status: "failed",
            message: error.message
        });
    }
};