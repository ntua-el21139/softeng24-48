const pool = require('../utils/database');
const moment = require('moment');

exports.getTollStationPasses = async (req, res) => {
    try {
        const { tollStationID, date_from, date_to } = req.params;
        const requestTimestamp = moment().format('YYYY-MM-DD HH:mm');

        // First get the operator_id from Tolls table
        const [tollStation] = await pool.execute(
            'SELECT operator_id FROM Tolls WHERE toll_id = ?',
            [tollStationID]
        );
        
        const operator_id = tollStation.length > 0 ? tollStation[0].operator_id : null;

        // Then get the passes
        const sql = `
            SELECT 
                pass_id, timestamp, toll_id, tag_id, tag_home_id, operator_id, charge
            FROM Passes
            WHERE toll_id = ?
              AND timestamp BETWEEN ? AND ?
            ORDER BY timestamp ASC;
        `;

        const [rows] = await pool.execute(sql, [tollStationID, date_from, date_to]);

        const passList = rows.map((row, index)=> ({
            passIndex: index+1, 
            passID: row.pass_id,
            timestamp: moment(row.timestamp).format('YYYY-MM-DD HH:mm'),
            tagID: row.tag_id,
            tagProvider: row.tag_home_id,
            passType: row.tag_home_id === operator_id ? "home" : "visitor",
            passCharge: row.charge
        }));

        //Response
        res.json({
            StationID: tollStationID,
            stationOperator: operator_id,
            requestTimestamp: requestTimestamp,
            periodFrom: date_from,
            periodTo: date_to,
            nPasses: passList.length,
            passList
        });

    } catch (error){
        console.error("Database error:", error);
        res.status(500).json({
            status: "failed",
            message: error.message
        });
    }
};