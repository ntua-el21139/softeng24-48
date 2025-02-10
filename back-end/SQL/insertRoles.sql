-- First insert permissions
INSERT INTO Permissions (data_scope, access_type) VALUES
('All', 'Read_Write'),      -- Admin permission
('Own', 'Read_Write'),      -- Toll Operator permission
('All', 'Read'),           -- Analyst permission
('Anonymized', 'Read');    -- Business permission

-- Then insert roles with their corresponding permissions
INSERT INTO Roles (role_name, permission_id) VALUES
('Admin', 1),              -- Admin role with full access
('Toll Operator', 2),      -- Operator role with own data access
('Analyst', 3),           -- Analyst role with read-only access
('Business', 4);          -- Business role with anonymized access 