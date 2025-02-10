const pool = require('./database');
const moment = require('moment');

/**
 * Calculates and populates monthly debts for a specific month and year
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2024)
 */
async function populateMonthlyDebts(month, year) {
    try {
        // Format dates for the query
        const startDate = moment({ year, month: month - 1, day: 1 })
            .format('YYYY-MM-DD HH:mm:ss');
        const endDate = moment({ year, month: month - 1, day: 1 })
            .endOf('month')
            .format('YYYY-MM-DD HH:mm:ss');
        
        console.log(`Calculating debts for period: ${startDate} to ${endDate}`);

        // First, clear existing debts for this month
        const clearQuery = `
            DELETE FROM Monthly_Debts 
            WHERE DATE_FORMAT(month_year, '%Y-%m') = ?
        `;
        await pool.execute(clearQuery, [moment({ year, month: month - 1 }).format('YYYY-MM')]);

        // Reset auto-increment ID to 1
        const resetAutoIncrementQuery = `
            ALTER TABLE Monthly_Debts AUTO_INCREMENT = 1
        `;
        await pool.execute(resetAutoIncrementQuery);

        // Calculate net debts between operators
        const calculateDebtsQuery = `
            WITH OperatorDebts AS (
                SELECT 
                    p.operator_id AS creditor_operator_id,
                    p.tag_home_id AS debtor_operator_id,
                    SUM(p.charge) AS amount
                FROM Passes p
                WHERE p.timestamp >= ?
                AND p.timestamp < ?
                AND p.operator_id != p.tag_home_id
                GROUP BY p.operator_id, p.tag_home_id
            ),
            NetDebts AS (
                SELECT 
                    CASE 
                        WHEN d1.amount > COALESCE(d2.amount, 0) THEN d1.debtor_operator_id
                        ELSE d1.creditor_operator_id
                    END AS debtor_operator_id,
                    CASE 
                        WHEN d1.amount > COALESCE(d2.amount, 0) THEN d1.creditor_operator_id
                        ELSE d1.debtor_operator_id
                    END AS creditor_operator_id,
                    ABS(d1.amount - COALESCE(d2.amount, 0)) AS net_amount
                FROM OperatorDebts d1
                LEFT JOIN OperatorDebts d2 
                    ON d1.creditor_operator_id = d2.debtor_operator_id 
                    AND d1.debtor_operator_id = d2.creditor_operator_id
                WHERE d1.creditor_operator_id < d1.debtor_operator_id  -- Avoid duplicate pairs
            )
            SELECT * FROM NetDebts WHERE net_amount > 0
        `;

        const [debts] = await pool.execute(calculateDebtsQuery, [startDate, endDate]);

        if (debts.length === 0) {
            console.log('No debts found for the specified period');
            return;
        }

        // Insert calculated debts
        const insertDebtQuery = `
            INSERT INTO Monthly_Debts 
            (debtor_operator_id, creditor_operator_id, amount, month_year)
            VALUES (?, ?, ?, ?)
        `;

        const monthEnd = moment({ year, month: month - 1 }).endOf('month').format('YYYY-MM-DD');

        for (const debt of debts) {
            await pool.execute(insertDebtQuery, [
                debt.debtor_operator_id,
                debt.creditor_operator_id,
                debt.net_amount,
                monthEnd
            ]);
        }

        console.log(`Successfully populated ${debts.length} debt records for ${month}/${year}`);

    } catch (error) {
        console.error('Error populating monthly debts:', error);
        throw error;
    }
}

// Execute if this script is run directly
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length !== 2) {
        console.error('Error: Both month and year arguments are required');
        console.error('Usage: node populateDebts.js <month> <year>');
        console.error('Example: node populateDebts.js 1 2024');
        process.exit(1);
    }

    const month = parseInt(args[0]);
    const year = parseInt(args[1]);

    // Validate month and year
    if (isNaN(month) || month < 1 || month > 12) {
        console.error('Error: Month must be a number between 1 and 12');
        process.exit(1);
    }

    if (isNaN(year) || year < 2000 || year > 2100) {
        console.error('Error: Year must be a valid year between 2000 and 2100');
        process.exit(1);
    }

    populateMonthlyDebts(month, year)
        .then(() => {
            console.log('Monthly debts population completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Error during monthly debts population:', error);
            process.exit(1);
        });
}

module.exports = populateMonthlyDebts;