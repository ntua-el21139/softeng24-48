const DBHandler = require('./dbHandler');

async function populateUsers() {
    const dbHandler = new DBHandler();
    
    try {
        console.log('Attempting to connect to database...');
        await dbHandler.connect();
        console.log('Database connection established');

        // First delete existing records
        console.log('Cleaning up existing users...');
        await dbHandler.connection.execute('DELETE FROM Users WHERE role_id = 2');  // Delete operators
        await dbHandler.connection.execute('DELETE FROM Users WHERE role_id = 1');  // Delete admin
        console.log('Cleanup completed');

        const users = [
            { username: 'admin', password: 'password', role_id: 1, operator_id: null },
            { username: 'aegeanmotorway', password: 'password', role_id: 2, operator_id: 'AM' },
            { username: 'egnatia', password: 'password', role_id: 2, operator_id: 'EG' },
            { username: 'gefyra', password: 'password', role_id: 2, operator_id: 'GE' },
            { username: 'kentrikiodos', password: 'password', role_id: 2, operator_id: 'KO' },
            { username: 'moreas', password: 'password', role_id: 2, operator_id: 'MO' },
            { username: 'naodos', password: 'password', role_id: 2, operator_id: 'NAO' },
            { username: 'neaodos', password: 'password', role_id: 2, operator_id: 'NO' },
            { username: 'olympiaodos', password: 'password', role_id: 2, operator_id: 'OO' }
        ];

        const insertQuery = `
            INSERT INTO Users (username, password, role_id, operator_id)
            VALUES (?, ?, ?, ?)
        `;

        console.log('Inserting new users...');
        for (const user of users) {
            console.log(`Inserting user: ${user.username} (role_id: ${user.role_id}, operator_id: ${user.operator_id || 'null'})`);
            await dbHandler.connection.execute(insertQuery, [
                user.username,
                user.password,
                user.role_id,
                user.operator_id
            ]);
        }

        console.log('Users populated successfully');
    } catch (error) {
        console.error('Error populating users:', error);
        throw error;
    } finally {
        console.log('Closing database connection...');
        await dbHandler.disconnect();
        console.log('Database connection closed');
    }
}

// Execute if this script is run directly
if (require.main === module) {
    console.log('Starting users population script...');
    populateUsers()
        .then(() => {
            console.log('User population completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Error during user population:', error);
            process.exit(1);
        });
} else {
    module.exports = populateUsers;
} 