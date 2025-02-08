-- First insert permissions
INSERT INTO Permissions (data_scope, access_type) VALUES
('All', 'Read_Write'),      -- Admin permission
('Own', 'Read_Write'),      -- Toll Operator permission
('All', 'Read'),           -- Analyst permission
('Anonymized', 'Read');    -- Business permission

-- Then insert roles with their corresponding permissions
INSERT INTO Roles (role_name, permission_id) VALUES
('Admin', 1),
('Toll Operator', 2),
('Analyst', 3),
('Business', 4); 