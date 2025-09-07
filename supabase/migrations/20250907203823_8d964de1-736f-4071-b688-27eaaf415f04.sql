-- First clear any kiosk references that might block deletion
UPDATE kiosks SET current_student_id = NULL WHERE current_student_id IS NOT NULL;

-- Now remove duplicate students keeping the first occurrence (oldest record)
WITH duplicates AS (
  SELECT id, first_name, last_name,
         ROW_NUMBER() OVER (PARTITION BY first_name, last_name ORDER BY created_at ASC) as rn
  FROM students
  WHERE grade IN ('6th', '7th', '8th')
)
DELETE FROM students 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);