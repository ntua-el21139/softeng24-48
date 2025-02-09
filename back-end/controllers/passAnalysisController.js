const pool = require('../utils/database');
const moment = require('moment');

exports.getPassAnalysis = async (req, res) => {
    try {
        const { stationOpID, tagOpID, date_from, date_to } = req.params;
        const requestTimestamp = moment().format('YYYY-MM-DD HH:mm');

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
        const [rows] = await pool.execute(sql, [stationOpID, tagOpID, date_from, date_to]);

        const passList = rows.map((row, index)=> ({
            passIndex: index+1,
            passID: row.pass_id,
            stationID: row.toll_id,
            timestamp: moment(row.timestamp).format('YYYY-MM-DD HH:mm'),
            tagID: row.tag_id,
            passCharge: row.charge
        }));
        
        //Response
        res.json({
            stationOpID: stationOpID, 
            tagOpID: tagOpID,
            requestTimestamp: requestTimestamp,
            periodFrom: date_from,
            periodTo: date_to,
            nPasses: passList.length,
            passList

        });

    }catch (error){
        console.error("Database error:", error);
        res.status(500).json({
            status: "failed",
            message: error.message
        });
    }
};