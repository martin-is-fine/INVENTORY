-- ============================================================
-- KNS Inventory — Create / Promote Admin User
-- ============================================================
-- Run this in your Supabase SQL Editor AFTER running schema.sql
-- and AFTER the user has signed up through the app.
--
-- Step 1: Find the user's profile by email
-- Step 2: Update their role to 'admin'
-- ============================================================

-- Option A: Promote an EXISTING user to admin by email
-- Replace 'tesla@gmail.com' with the email of the user you want to make admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'tesla@gmail.com';

-- Verify it worked:
SELECT id, full_name, email, role, status
FROM profiles
WHERE email = 'tesla@gmail.com';

-- ============================================================
-- Option B: See all users and their roles
-- ============================================================
-- SELECT id, full_name, email, role, status FROM profiles ORDER BY created_at;

-- ============================================================
-- Option C: Demote an admin back to staff
-- ============================================================
-- UPDATE profiles SET role = 'user' WHERE email = 'someone@example.com';
