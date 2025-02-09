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

        // Validate date format
        if (!moment(date_from, 'YYYY-MM-DD', true).isValid() || 
            !moment(date_to, 'YYYY-MM-DD', true).isValid()) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid date format. Use YYYY-MM-DD"
            });
        }

        // Check if operator exists
        const [operator] = await pool.execute(
            'SELECT operator_id FROM Operators WHERE operator_id = ?',
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
        const [rows] = await pool.execute(sql, [tollOpID, date_from, date_to]);
        
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
                acc[row.tag_home_id].totalCharge += row.charge;
                return acc;
            }, {})
        ).map(([visitingOpID, data]) => ({
            visitingOpID,
            nPasses: data.count,
            passesCost: data.totalCharge
        }));

        //Response
        res.json({
            tollOpID: tollOpID,
            requestTimestamp: requestTimestamp,
            periodFrom: date_from,
            periodTo: date_to,
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
