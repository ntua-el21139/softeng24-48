const DBHandler = require('./dbHandler');

async function populateRoles() {
    const dbHandler = new DBHandler();
    
    try {
        console.log('Attempting to connect to database...');
        await dbHandler.connect();
        console.log('Database connection established');

        // First delete existing records
        console.log('Cleaning up existing roles and permissions...');
        await dbHandler.connection.execute('DELETE FROM Roles');
        await dbHandler.connection.execute('DELETE FROM Permissions');
        console.log('Cleanup completed');

        // Insert permissions
        console.log('Inserting permissions...');
        const insertPermissionQuery = `
            INSERT INTO Permissions (data_scope, access_type) 
            VALUES (?, ?)
        `;

        const permissions = [
            ['All', 'Read_Write'],      // Admin permission
            ['Own', 'Read_Write'],      // Toll Operator permission
            ['All', 'Read'],           // Analyst permission
            ['Anonymized', 'Read']     // Business permission
        ];

        for (const [scope, access] of permissions) {
            console.log(`Inserting permission: ${scope} - ${access}`);
            await dbHandler.connection.execute(insertPermissionQuery, [scope, access]);
        }
        console.log('All permissions inserted');

        // Insert roles
        console.log('Inserting roles...');
        const insertRoleQuery = `
            INSERT INTO Roles (role_name, permission_id) 
            VALUES (?, ?)
        `;

        const roles = [
            ['Admin', 1],
            ['Toll Operator', 2],
            ['Analyst', 3],
            ['Business', 4]
        ];

        for (const [name, permissionId] of roles) {
            console.log(`Inserting role: ${name} with permission ID ${permissionId}`);
            await dbHandler.connection.execute(insertRoleQuery, [name, permissionId]);
        }

        console.log('Roles and permissions populated successfully');
    } catch (error) {
        console.error('Error populating roles and permissions:', error);
        throw error;
    } finally {
        console.log('Closing database connection...');
        await dbHandler.disconnect();
        console.log('Database connection closed');
    }
}

// Execute if this script is run directly
if (require.main === module) {
    console.log('Starting roles population script...');
    populateRoles()
        .then(() => {
            console.log('Role population completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Error during role population:', error);
            process.exit(1);
        });
} else {
    module.exports = populateRoles;
}
