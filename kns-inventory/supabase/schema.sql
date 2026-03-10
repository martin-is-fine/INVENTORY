-- ============================================================
-- KNS Inventory — Supabase Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- 1. Profiles (extends auth.users with app-specific data)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  department TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Pending', 'Inactive')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it already exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Departments
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO departments (name) VALUES
  ('IT Department'), ('Human Resources'), ('Administration'), ('Finance'), ('College')
ON CONFLICT (name) DO NOTHING;

-- 3. Categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO categories (name) VALUES
  ('Electronics'), ('Furniture'), ('Office Supplies'), ('Computers'), ('Equipment'), ('Peripherals')
ON CONFLICT (name) DO NOTHING;

-- 4. Inventory Items
CREATE TABLE IF NOT EXISTS inventory_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  department TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1,
  condition TEXT NOT NULL DEFAULT 'Good' CHECK (condition IN ('Excellent', 'Good', 'Fair', 'Poor', 'Needs Repair', 'Spoiled')),
  brand TEXT DEFAULT '',
  asset_type TEXT DEFAULT '',
  asset_id TEXT DEFAULT '',
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed some defaults
INSERT INTO inventory_items (name, category, department, quantity, condition) VALUES
  ('Laptop - HP EliteBook', 'Electronics', 'IT Department', 15, 'Good'),
  ('Office Chair - Ergonomic', 'Furniture', 'Human Resources', 42, 'Good'),
  ('Printer - LaserJet Pro', 'Office Supplies', 'Administration', 8, 'Fair')
ON CONFLICT DO NOTHING;

-- 5. Stock Movements
CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  item_name TEXT NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('Issue', 'Return', 'Transfer')),
  from_location TEXT NOT NULL DEFAULT '',
  to_location TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT DEFAULT '',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Requests
CREATE TABLE IF NOT EXISTS requests (
  id SERIAL PRIMARY KEY,
  requestor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_type TEXT DEFAULT 'new' CHECK (request_type IN ('new', 'replacement', 'repair')),
  item_name TEXT NOT NULL,
  category TEXT DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
  department TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  description TEXT DEFAULT '',
  approved_by TEXT DEFAULT '',
  remarks TEXT DEFAULT '',
  required_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Helper: Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: users read own, admins read/write all
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admins insert profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins update all profiles" ON profiles FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins delete profiles" ON profiles FOR DELETE USING (public.is_admin());

-- Inventory Items: everyone reads, admins write
CREATE POLICY "Everyone reads inventory" ON inventory_items FOR SELECT USING (true);
CREATE POLICY "Admins manage inventory" ON inventory_items FOR ALL USING (public.is_admin());

-- Stock Movements: everyone reads, admins write
CREATE POLICY "Everyone reads movements" ON stock_movements FOR SELECT USING (true);
CREATE POLICY "Admins manage movements" ON stock_movements FOR ALL USING (public.is_admin());

-- Requests: users see own + create, admins see all + update
CREATE POLICY "Users read own requests" ON requests FOR SELECT USING (requestor_id = auth.uid() OR public.is_admin());
CREATE POLICY "Users create requests" ON requests FOR INSERT WITH CHECK (requestor_id = auth.uid());
CREATE POLICY "Admins manage requests" ON requests FOR ALL USING (public.is_admin());

-- Categories & Departments: everyone reads, admins write
CREATE POLICY "Everyone reads categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON categories FOR ALL USING (public.is_admin());
CREATE POLICY "Everyone reads departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Admins manage departments" ON departments FOR ALL USING (public.is_admin());
