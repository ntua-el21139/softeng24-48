const pool = require('../utils/database');
const moment = require('moment');

exports.getChargesBy = async (req, res) => {
    try {
        const { tollOpID, date_from, date_to } = req.params;

        // Check if any required parameters are missing
        if (!tollOpID || !date_from || !date_to) {
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

        // Check if operator exists
        const [operator] = await pool.execute(
            'SELECT DISTINCT operator_id FROM Passes WHERE operator_id = ?',
            [tollOpID]
        );

        if (operator.length === 0) {
            return res.status(400).json({
                status: "failed",
                message: "Operator not found"
            });
        }

        //SQL Query: Get charges for the given tollOpID where 
        //timestamp between date_from and date_to
        const sql = `
            SELECT 
                charge, tag_home_id
            FROM Passes
            WHERE operator_id = ?
              AND timestamp BETWEEN ? AND ?
            ORDER BY timestamp ASC;
        `;

        //Execute query
        const [rows] = await pool.execute(sql, [tollOpID, mysqlDateFrom, mysqlDateTo]);
        
        // Check if any charges found
        if (rows.length === 0) {
            return res.status(204).json({
                status: "failed",
                message: "No charges found for given operator and time period"
            });
        }

        const vOpList = Object.entries(
            rows.reduce((acc, row) => {
                if (row.tag_home_id === tollOpID) return acc;
                
                if (!acc[row.tag_home_id]) {
                    acc[row.tag_home_id] = {
                        count: 0,
                        totalCharge: 0
                    };
                }
                acc[row.tag_home_id].count++;
                // Convert to cents, add, then convert back to euros
                acc[row.tag_home_id].totalCharge = (acc[row.tag_home_id].totalCharge * 100 + row.charge * 100) / 100;
                return acc;
            }, {})
        ).map(([visitingOpID, data]) => ({
            visitingOpID,
            nPasses: data.count,
            passesCost: Number(data.totalCharge.toFixed(2))
        }));

        //Response
        res.json({
            tollOpID: tollOpID,
            requestTimestamp: requestTimestamp,
            periodFrom: mysqlDateFrom,
            periodTo: mysqlDateTo,
            vOpList
        });     
    } catch (error) {   
        console.error("Database error:", error);
        res.status(500).json({
            status: "failed",
            message: error.message
        });
    }
};
