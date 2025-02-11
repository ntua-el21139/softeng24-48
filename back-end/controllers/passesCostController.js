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

        // Validate date format (YYYYMMDD)
        if (!moment(date_from, 'YYYYMMDD', true).isValid() || 
            !moment(date_to, 'YYYYMMDD', true).isValid()) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid date format. Use YYYYMMDD"
            });
        }

        // Check if date_from is after date_to
        if (moment(date_from, 'YYYYMMDD').isAfter(moment(date_to, 'YYYYMMDD'))) {
            return res.status(400).json({
                status: "failed",
                message: "Date from cannot be after date to"
            });
        }

        // Convert dates to MySQL format (YYYY-MM-DD)
        const mysqlDateFrom = moment(date_from, 'YYYYMMDD').format('YYYY-MM-DD');
        const mysqlDateTo = moment(date_to, 'YYYYMMDD').format('YYYY-MM-DD');

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
        const [rows] = await pool.execute(sql, [tollOpID, tagOpID, mysqlDateFrom, mysqlDateTo]);

        if (rows.length === 0) {
            return res.status(204).json({
                status: "failed",
                message: "No passes found for given operators and time period"
            });
        }

        // Convert to cents, add, then convert back to euros
        const totalCost = Number((rows.reduce((sum, row) => sum + row.charge * 100, 0) / 100).toFixed(2));
        
        //Response
        res.json({
            tollOpID: tollOpID,
            tagOpID: tagOpID,
            requestTimestamp: requestTimestamp,
            periodFrom: mysqlDateFrom,
            periodTo: mysqlDateTo,
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