const CSVHandler = require('../../utils/csvHandler');
const DBHandler = require('../../utils/dbHandler');
const pool = require('../../utils/database');

exports.addpasses = async (req, res) => {
    const dbHandler = new DBHandler();
    
    try {
        if (!req.file) {
            return res.status(400).json({
                status: "failed",
                message: "No file uploaded or invalid file type (only text/csv allowed)"
            });
        }
        
        await dbHandler.connect();  // Just await the connection
        const csvHandler = new CSVHandler(req.file.path);
        
        // Process the CSV file
        const csvResult = await csvHandler.process();
        if (!csvResult.success) {
            return res.status(400).json({
                status: "failed",
                info: csvResult.error
            });
        }

        // First extract unique toll_ids from CSV data
        const tollIds = [...new Set(csvResult.data.map(row => row.tollID))];
        console.log('Toll IDs from CSV:', tollIds);

        // Then construct the query
        const tollOperatorQuery = `
            SELECT toll_id, operator_id 
            FROM Tolls 
            WHERE toll_id IN (${'?,'.repeat(tollIds.length).slice(0, -1)})`;
        
        const [tollOperators] = await dbHandler.connection.execute(tollOperatorQuery, tollIds);
        
        // Debug logging
        console.log('Found toll operators:', tollOperators);
        
        // Create a map for quick lookup
        const operatorMap = {};
        tollOperators.forEach(row => {
            operatorMap[row.toll_id] = row.operator_id;
        });

        // Debug logging
        console.log('Operator Map:', operatorMap);

        // Check if all toll stations exist
        const missingTolls = tollIds.filter(id => !operatorMap[id]);
        if (missingTolls.length > 0) {
            return res.status(400).json({
                status: "failed",
                info: `Unknown toll stations: ${missingTolls.join(', ')}`
            });
        }

        // Start transaction
        await dbHandler.connection.beginTransaction();

        const insertQuery = `
            INSERT INTO Passes (timestamp, toll_id, tag_id, tag_home_id, operator_id, charge)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        for (const row of csvResult.data) {
            await dbHandler.connection.execute(insertQuery, [
                row.timestamp,
                row.tollID,
                row.tagRef,
                row.tagHomeID,
                operatorMap[row.tollID],
                row.charge
            ]);
        }

        // Commit transaction
        await dbHandler.connection.commit();

        res.json({
            status: "OK"
        });
        
    } catch (error){
        // Rollback transaction if there was an error
        if (dbHandler.connection) {
            await dbHandler.connection.rollback();
        }

        console.error("Database error:", error);
        res.status(500).json({
            status: "failed",
            message: error.message
        });
    } finally {
        await dbHandler.disconnect();  // Use the disconnect method from DBHandler
    }
};