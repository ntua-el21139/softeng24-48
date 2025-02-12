# Database Setup Instructions

This directory contains the SQL dump file (`interToll_dump.sql`) for the InterToll database. Follow these instructions to set up your database.

## Prerequisites

- MySQL Server 8.0 or higher installed
- MySQL root access or a user with sufficient privileges

## Setup Steps

1. **Start MySQL Server**
   ```bash
   # For macOS
   brew services start mysql
   
   # For Linux
   sudo systemctl start mysql
   
   # For Windows
   net start mysql
   ```

2. **Create Database and Import Dump**
   ```bash
   # Login to MySQL (you'll be prompted for password)
   mysql -u root -p
   
   # Inside MySQL, create the database
   CREATE DATABASE IF NOT EXISTS interToll;
   exit;
   
   # Import the dump file (you'll be prompted for password)
   mysql -u root -p interToll < interToll_dump.sql
   ```

3. **Verify Installation**
   ```bash
   mysql -u root -p
   
   # Inside MySQL
   USE interToll;
   SHOW TABLES;
   ```
   You should see the following tables:
   - Monthly_Debts
   - Passes
   - Permissions
   - Roles
   - Tolls
   - Users

## Environment Configuration

Make sure your `.env` file in the `back-end` directory has the correct database credentials:

```env
PORT=9115
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=interToll
```

## Common Issues

1. **Access Denied Error**
   - Verify your MySQL root password
   - Make sure the password in `back-end/.env` matches your MySQL password

2. **Database Already Exists**
   ```sql
   DROP DATABASE IF EXISTS interToll;
   CREATE DATABASE interToll;
   ```

3. **Port Conflicts**
   - Default MySQL port is 3306
   - Verify MySQL is running: `mysql --version`

## Backup Database

To create a new dump of your database:
```bash
mysqldump -u root -p interToll > interToll_backup.sql
```

## Additional Help

If you encounter any issues:
1. Check MySQL service status
2. Verify database credentials
3. Ensure MySQL server is running
4. Check MySQL error logs 