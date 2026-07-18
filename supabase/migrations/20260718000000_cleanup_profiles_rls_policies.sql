-- Remove redundant RLS policies on profiles table
-- These were duplicated by "Read profiles by role" and "Users can update own profile"

DROP POLICY IF EXISTS "Clients can view own profile" ON profiles;
DROP POLICY IF EXISTS "Barbers and admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Clients can update own profile" ON profiles;

-- Remaining policies on profiles:
-- "Read profiles by role"       (SELECT: own profile + barber/admin see all)
-- "Users can update own profile" (UPDATE: own profile only)
-- "Admin full access profiles"   (ALL: admin unrestricted)