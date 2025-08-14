-- Manual fix for the role column issue
-- Run this script in your PostgreSQL database

-- Connect to your database first:
-- psql -h localhost -U postgres -d crud_demo

-- Check if the role column exists
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- If the column doesn't exist, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        -- Add the column
        ALTER TABLE users ADD COLUMN role VARCHAR(20);
        
        -- Set default value for existing records
        UPDATE users SET role = 'USER' WHERE role IS NULL;
        
        -- Make it NOT NULL after setting default values
        ALTER TABLE users ALTER COLUMN role SET NOT NULL;
        ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER';
        
        -- Create index for performance
        CREATE INDEX idx_users_role ON users(role);
        
        RAISE NOTICE 'Role column added successfully to users table';
    ELSE
        RAISE NOTICE 'Role column already exists in users table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- Check existing users and their roles
SELECT id, name, email, role FROM users LIMIT 5;
