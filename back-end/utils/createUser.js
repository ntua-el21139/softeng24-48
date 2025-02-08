const bcrypt = require('bcryptjs');
const pool = require('./database');

async function createUser(username, password, role, operator_id = null) {
    try {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // First check if user exists
        const [existingUsers] = await pool.execute(
            'SELECT username FROM Users WHERE username = ?',
            [username]
        );

        if (existingUsers.length > 0) {
            console.log('User already exists');
            return false;
        }

        // Get role_id from Roles table
        const [roles] = await pool.execute(
            'SELECT role_id FROM Roles WHERE role_name = ?',
            [role]
        );

        if (roles.length === 0) {
            console.log('Role does not exist');
            return false;
        }

        const role_id = roles[0].role_id;

        // Insert the new user
        const [result] = await pool.execute(
            'INSERT INTO Users (username, password, role_id, operator_id) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, role_id, operator_id]
        );

        console.log('User created successfully');
        return true;

    } catch (error) {
        console.error('Error creating user:', error);
        return false;
    }
}

// Example usage:
async function createInitialUsers() {
    try {
        // Create admin user
        await createUser('admin', 'admin123', 'Admin');
        
        // Create some toll operators
        await createUser('operator_eg', 'op123', 'Toll Operator', 'EG');
        await createUser('operator_am', 'op123', 'Toll Operator', 'AM');
        await createUser('operator_nao', 'op123', 'Toll Operator', 'NAO');
        
        process.exit(0);
    } catch (error) {
        console.error('Error in createInitialUsers:', error);
        process.exit(1);
    }
}

// Run the function if this script is run directly
if (require.main === module) {
    createInitialUsers();
}

module.exports = createUser; 