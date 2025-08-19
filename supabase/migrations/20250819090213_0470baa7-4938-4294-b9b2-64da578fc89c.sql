-- Remove unwanted columns from profiles table
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS hire_date,
DROP COLUMN IF EXISTS department, 
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS classroom,
DROP COLUMN IF EXISTS grade_level;