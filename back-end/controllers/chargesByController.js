const pool = require('../utils/database');
const moment = require('moment');
const { Parser } = require('json2csv');

exports.getChargesBy = async (req, res) => {
    try {
        const { tollOpID, date_from, date_to } = req.params;

        // Check for invalid query parameters
        const allowedQueryParams = ['format'];
        const receivedQueryParams = Object.keys(req.query);
        const invalidParams = receivedQueryParams.filter(param => !allowedQueryParams.includes(param));
        
        if (invalidParams.length > 0) {
            return res.status(400).json({
                status: "failed",
                message: `Invalid query parameter(s): ${invalidParams.join(', ')}`
            });
        }

        const format = req.query.format?.toLowerCase() || 'json';

        // Only validate format if it's provided in the query
        if (req.query.format && format !== 'json' && format !== 'csv') {
            return res.status(400).json({
                status: "failed",
                message: "Invalid format. Use 'json' or 'csv'"
            });
        }

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

        const responseData = {
            tollOpID: tollOpID,
            requestTimestamp: requestTimestamp,
            periodFrom: mysqlDateFrom,
            periodTo: mysqlDateTo,
            vOpList
        };

        // Return response based on format
        if (format === 'csv') {
            try {
                // Flatten the data structure for CSV
                const flatData = vOpList.map(op => ({
                    tollOpID: responseData.tollOpID,
                    requestTimestamp: responseData.requestTimestamp,
                    periodFrom: responseData.periodFrom,
                    periodTo: responseData.periodTo,
                    ...op
                }));

                const fields = ['tollOpID', 'requestTimestamp', 'periodFrom', 'periodTo', 'visitingOpID', 'nPasses', 'passesCost'];
                
                const parser = new Parser({ fields });
                const csv = parser.parse(flatData);
                
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=charges-by-${tollOpID}-${date_from}-${date_to}.csv`);
                return res.send(csv);
            } catch (err) {
                console.error('CSV Parsing Error:', err);
                return res.status(500).json({
                    status: "failed",
                    message: "Error generating CSV"
                });
            }
        }

        // Default JSON response
        res.json(responseData);
        
    } catch (error) {   
        console.error("Database error:", error);
        res.status(500).json({
            status: "failed",
            message: error.message
        });
    }
};
