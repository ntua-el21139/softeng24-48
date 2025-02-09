const pool = require('../utils/database');
const moment = require('moment');

exports.getTollStationPasses = async (req, res) => {
    try {
        const { tollStationID, date_from, date_to } = req.params;

        // Check if any required parameters are missing
        if (!tollStationID || !date_from || !date_to) {
            return res.status(400).json({
                status: "failed",
                message: "Missing required parameters"
            });
        }

        // Validate date format
        if (!moment(date_from, 'YYYY-MM-DD', true).isValid() || 
            !moment(date_to, 'YYYY-MM-DD', true).isValid()) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid date format. Use YYYY-MM-DD"
            });
        }

        // First get the operator_id from Tolls table
        const [tollStation] = await pool.execute(
            'SELECT operator_id FROM Tolls WHERE toll_id = ?',
            [tollStationID]
        );
        
        // Check if station exists
        if (tollStation.length === 0) {
            return res.status(400).json({
                status: "failed",
                message: "Station not found"
            });
        }

        const operator_id = tollStation[0].operator_id;

        // Get the passes
        const sql = `
            SELECT 
                pass_id, timestamp, toll_id, tag_id, tag_home_id, operator_id, charge
            FROM Passes
            WHERE toll_id = ?
              AND timestamp BETWEEN ? AND ?
            ORDER BY timestamp ASC;
        `;

        const [rows] = await pool.execute(sql, [tollStationID, date_from, date_to]);

        // Check if any passes found
        if (rows.length === 0) {
            return res.status(204).json({
                status: "failed",
                message: "No passes found for given station and time period"
            });
        }

        const passList = rows.map((row, index)=> ({
            passIndex: index+1, 
            passID: row.pass_id,
            timestamp: moment(row.timestamp).format('YYYY-MM-DD HH:mm'),
            tagID: row.tag_id,
            tagProvider: row.tag_home_id,
            passType: row.tag_home_id === operator_id ? "home" : "visitor",
            passCharge: row.charge
        }));

        // Successful response
        res.json({
            StationID: tollStationID,
            stationOperator: operator_id,
            requestTimestamp: moment().format('YYYY-MM-DD HH:mm'),
            periodFrom: date_from,
            periodTo: date_to,
            nPasses: passList.length,
            passList
        });

    } catch (error){
        console.error("Database error:", error);
        res.status(500).json({
            status: "failed",
            message: "Internal server error"
        });
    }
};