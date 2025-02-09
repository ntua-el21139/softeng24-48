const pool = require('../../utils/database');

exports.getHealthcheck = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        const [[tollCount], [tagCount], [passCount]] = await Promise.all([
            connection.execute('SELECT COUNT(*) as n_stations FROM Tolls'),
            connection.execute('SELECT COUNT(DISTINCT tag_id) as n_tags FROM Passes'),
            connection.execute('SELECT COUNT(*) as n_passes FROM Passes')
        ]);

        connection.release();

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
        

