USE interToll;

-- Drop tables in the correct order to avoid foreign key constraint issues
DROP TABLE IF EXISTS Monthly_Debts;
DROP TABLE IF EXISTS Passes;
DROP TABLE IF EXISTS Tolls;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Roles;
DROP TABLE IF EXISTS Permissions;

-- Create tables in the correct order
CREATE TABLE Permissions (
    permission_id INT AUTO_INCREMENT PRIMARY KEY,
    data_scope ENUM('All', 'Own', 'Anonymized') NOT NULL,
    access_type ENUM('Read', 'Read_Write') NOT NULL
);

CREATE TABLE Roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name ENUM('Admin', 'Toll Operator', 'Analyst', 'Business') NOT NULL,
    permission_id INT UNIQUE,  -- One-to-one with Permission
    FOREIGN KEY (permission_id) REFERENCES Permissions(permission_id)
);

CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    operator_id VARCHAR(10) UNIQUE,  -- Only applicable for toll operators (must be UNIQUE)
    FOREIGN KEY (role_id) REFERENCES Roles(role_id)
);

CREATE TABLE Tolls (
    operator_id VARCHAR(10), 
    operator_name VARCHAR(100),
    toll_id VARCHAR(10) PRIMARY KEY,
    toll_name VARCHAR(200),
    PM VARCHAR(2),
    locality VARCHAR(50),
    road VARCHAR(100),
    lat VARCHAR(50),
    longt VARCHAR(50),
    email VARCHAR(50),
    price DOUBLE(4,2)
    -- FOREIGN KEY (operator_id) REFERENCES Users(operator_id)
);

CREATE TABLE Passes (
    pass_id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME,
    toll_id VARCHAR(10),
    tag_id VARCHAR(10),
    tag_home_id VARCHAR(10),
    operator_id VARCHAR(10),
    charge DOUBLE(4,2),
    FOREIGN KEY (toll_id) REFERENCES Tolls(toll_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Monthly_Debts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    debtor_operator_id VARCHAR(10) NOT NULL,   -- The operator who owes money
    creditor_operator_id VARCHAR(10) NOT NULL, -- The operator who is owed money
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0), -- Debt amount
    month_year DATE NOT NULL, -- The end of the month (YYYY-MM format)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp of entry
);