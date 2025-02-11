const pool = require('../utils/database');
const moment = require('moment');
const { Parser } = require('json2csv');

exports.getPassAnalysis = async (req, res) => {
    try {
        const { stationOpID, tagOpID, date_from, date_to } = req.params;

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
        if (!stationOpID || !tagOpID || !date_from || !date_to) {
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
        const [stationOperator] = await pool.execute(
            'SELECT operator_id FROM Passes WHERE operator_id = ? LIMIT 1',
            [stationOpID]
        );

        const [tagOperator] = await pool.execute(
            'SELECT operator_id FROM Passes WHERE operator_id = ? LIMIT 1',
            [tagOpID]
        );

        if (stationOperator.length === 0 || tagOperator.length === 0) {
            return res.status(400).json({
                status: "failed",
                message: "One or both operators not found"
            });
        }

        //SQL Query: Get passes for the given stationOpID(operator_id) where 
        //tag_home_id = tagOpID and timestamp between date_from and date_to
        const sql = `
            SELECT 
                pass_id, timestamp, toll_id, tag_id, tag_home_id, operator_id, charge
            FROM Passes
            WHERE operator_id = ?
              AND tag_home_id = ?
              AND timestamp BETWEEN ? AND ?
            ORDER BY timestamp ASC;
        `;

        //Execute query
        const [rows] = await pool.execute(sql, [stationOpID, tagOpID, mysqlDateFrom, mysqlDateTo]);

        // Check if any passes found
        if (rows.length === 0) {
            return res.status(204).json({
                status: "failed",
                message: "No passes found for given operators and time period"
            });
        }

        const passList = rows.map((row, index)=> ({
            passIndex: index+1,
            passID: row.pass_id,
            stationID: row.toll_id,
            timestamp: moment(row.timestamp).format('YYYY-MM-DD HH:mm'),
            tagID: row.tag_id,
            passCharge: row.charge
        }));
        
        const responseData = {
            stationOpID: stationOpID, 
            tagOpID: tagOpID,
            requestTimestamp: requestTimestamp,
            periodFrom: mysqlDateFrom,
            periodTo: mysqlDateTo,
            nPasses: passList.length,
            passList
        };

        // Return response based on format
        if (format === 'csv') {
            try {
                const fields = ['stationOpID', 'tagOpID', 'requestTimestamp', 'periodFrom', 'periodTo', 'nPasses'];
                const passFields = ['passIndex', 'passID', 'stationID', 'timestamp', 'tagID', 'passCharge'];
                
                // Flatten the data structure for CSV
                const flatData = passList.map(pass => ({
                    stationOpID: responseData.stationOpID,
                    tagOpID: responseData.tagOpID,
                    requestTimestamp: responseData.requestTimestamp,
                    periodFrom: responseData.periodFrom,
                    periodTo: responseData.periodTo,
                    nPasses: responseData.nPasses,
                    ...pass
                }));

                const parser = new Parser({
                    fields: [...fields, ...passFields]
                });
                const csv = parser.parse(flatData);
                
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=pass-analysis-${stationOpID}-${tagOpID}-${date_from}-${date_to}.csv`);
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

    }catch (error){
        console.error("Database error:", error);
        res.status(500).json({
            status: "failed",
            message: error.message
        });
    }
};