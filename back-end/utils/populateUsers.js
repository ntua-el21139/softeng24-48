const DBHandler = require('./dbHandler');

async function populateUsers() {
    const dbHandler = new DBHandler();
    
    try {
        await dbHandler.connect();

        // First delete existing records
        console.log('Cleaning up existing users...');
        await dbHandler.connection.execute('DELETE FROM Users WHERE role_id = 2');  // Delete operators
        await dbHandler.connection.execute('DELETE FROM Users WHERE role_id = 1');  // Delete admin
        await dbHandler.connection.execute('DELETE FROM Users WHERE role_id = 3');
        await dbHandler.connection.execute('DELETE FROM Users WHERE role_id = 4');

        const users = [
            { username: 'admin', password: 'password', role_id: 1, operator_id: null },
            { username: 'aegeanmotorway', password: 'password', role_id: 2, operator_id: 'AM' },
            { username: 'egnatia', password: 'password', role_id: 2, operator_id: 'EG' },
            { username: 'gefyra', password: 'password', role_id: 2, operator_id: 'GE' },
            { username: 'kentrikiodos', password: 'password', role_id: 2, operator_id: 'KO' },
            { username: 'moreas', password: 'password', role_id: 2, operator_id: 'MO' },
            { username: 'naodos', password: 'password', role_id: 2, operator_id: 'NAO' },
            { username: 'neaodos', password: 'password', role_id: 2, operator_id: 'NO' },
            { username: 'olympiaodos', password: 'password', role_id: 2, operator_id: 'OO' },
            { username: 'analyst', password: 'password', role_id: 3, operator_id: null },
            { username: 'business', password: 'password', role_id: 4, operator_id: null },
        ];

        const insertQuery = `
            INSERT INTO Users (username, password, role_id, operator_id)
            VALUES (?, ?, ?, ?)
        `;

        console.log('Inserting new users...');
        for (const user of users) {
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
        await dbHandler.disconnect();
    }
}

// Execute if this script is run directly
if (require.main === module) {
    populateUsers()
        .then(() => {
            console.log('User population completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Error during user population:', error);
            process.exit(1);
        });
}

module.exports = populateUsers; 