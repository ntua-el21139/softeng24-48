const pool = require('../../utils/database');
const moment = require('moment');

exports.getHealthcheck = async (req, res) => {
    try {
        const sql1 = `
            SELECT COUNT(*) as n_stations
            FROM Tolls
        `;
        const sql2 = `
            SELECT COUNT(DISTINCT tag_id) as n_tags
            FROM Passes
        `;
        const sql3 = `
            SELECT COUNT(*) as n_passes
            FROM Passes
        `;

        const [tollCount] = await pool.execute(sql1);
        const [tagCount] = await pool.execute(sql2);
        const [passCount] = await pool.execute(sql3);

        //Response
        res.json({
            status: "OK", 
            dbconnection: process.env.DB_DATABASE + "@" + process.env.DB_HOST,
            n_stations: tollCount[0].n_stations, 
            n_tags: tagCount[0].n_tags,
            n_passes: passCount[0].n_passes
        });

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            status: "failed",
            dbconnection: process.env.DB_DATABASE + "@" + process.env.DB_HOST
        });
    }
};

        //Check database connection
        

