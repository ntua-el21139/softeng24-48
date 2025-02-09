const pool = require('../../utils/database');
const CSVHandler = require('../../utils/csvHandler');
const DBHandler = require('../../utils/dbHandler');

exports.resetstations = async (req, res) => {
    const csvHandler = new CSVHandler('csv_templates/tollstations2024.csv');
    const dbHandler = new DBHandler();

    try {
        // Connect to database
        await dbHandler.connect();
        
        // Process CSV first to ensure it's valid
        const csvResult = await csvHandler.process();
        if (!csvResult.success) {
            return res.status(400).json({
                status: "failed",
                info: csvResult.error
            });
        }

        // Create temporary table with same structure as Tolls
        await dbHandler.connection.execute(`
            CREATE TEMPORARY TABLE temp_tolls (
                operator_id VARCHAR(10),
                operator_name VARCHAR(100),
                toll_id VARCHAR(10),
                toll_name VARCHAR(200),
                PM VARCHAR(2),
                locality VARCHAR(50),
                road VARCHAR(100),
                lat VARCHAR(50),
                longt VARCHAR(50),
                email VARCHAR(50),
                price DOUBLE(4,2)
            )
        `);

        // Insert CSV data into temporary table
        const insertTempQuery = `
            INSERT INTO temp_tolls 
            (operator_id, operator_name, toll_id, toll_name, PM, locality, road, lat, longt, email, price)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (const row of csvResult.data) {
            await dbHandler.connection.execute(insertTempQuery, [
                row.OpID,
                row.Operator,
                row.TollID,
                row.Name,
                row.PM,
                row.Locality,
                row.Road,
                row.Lat,
                row.Long,
                row.Email,
                row.Price1  // Using Price1 as the default price
            ]);
        }

        // Delete toll stations that don't exist in the new data (CASCADE will handle passes)
        await dbHandler.connection.execute(`
            DELETE FROM Tolls 
            WHERE toll_id NOT IN (
                SELECT toll_id FROM temp_tolls
            )
        `);

        // Insert new toll stations
        await dbHandler.connection.execute(`
            INSERT INTO Tolls 
            SELECT * FROM temp_tolls 
            WHERE toll_id NOT IN (
                SELECT toll_id FROM Tolls
            )
        `);

        // Update existing toll stations
        await dbHandler.connection.execute(`
            UPDATE Tolls t
            INNER JOIN temp_tolls tt ON t.toll_id = tt.toll_id
            SET 
                t.operator_id = tt.operator_id,
                t.operator_name = tt.operator_name,
                t.toll_name = tt.toll_name,
                t.PM = tt.PM,
                t.locality = tt.locality,
                t.road = tt.road,
                t.lat = tt.lat,
                t.longt = tt.longt,
                t.email = tt.email,
                t.price = tt.price
        `);

        // Drop temporary table
        await dbHandler.connection.execute('DROP TEMPORARY TABLE IF EXISTS temp_tolls');

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
