const pool = require('../utils/database');
const moment = require('moment');
exports.getPassesCost = async (req, res) => {
    try {
        const { tollOpID, tagOpID, date_from, date_to } = req.params;
        const requestTimestamp = moment().format('YYYY-MM-DD HH:mm');

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
        const totalCost = rows.reduce((sum, row) => sum + row.charge, 0);
        
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