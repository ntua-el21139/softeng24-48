const pool = require('../../utils/database');
const CSVHandler = require('../../utils/csvHandler');
const DBHandler = require('../../utils/dbHandler');

exports.resetstations = async (req, res) => {
    const csvHandler = new CSVHandler('back-end/csv_templates/tollstations2024.csv');
    const dbHandler = new DBHandler();

    try {
        // Read and process CSV
        const csvResult = await csvHandler.process();
        if (!csvResult.success) {
            return res.status(400).json({
                status: "failed",
                info: csvResult.error
            });
        }

        // Connect and insert to database
        await dbHandler.connect();
        const dbResult = await dbHandler.insertTolls(csvResult.data);
        
        if (!dbResult.success) {
            return res.status(500).json({
                status: "failed",
                info: dbResult.message
            });
        }

        res.json({
            status: "OK"
        });

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            status: "failed",
            info: error.message
        });
    } finally {
        await dbHandler.disconnect();
    }
};
