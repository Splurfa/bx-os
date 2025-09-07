-- Remove duplicate students keeping the oldest record for each duplicate
DELETE FROM students s1 
USING students s2 
WHERE s1.id > s2.id 
AND s1.first_name = s2.first_name 
AND s1.last_name = s2.last_name 
AND s1.grade IN ('6th', '7th', '8th') 
AND s2.grade IN ('6th', '7th', '8th');