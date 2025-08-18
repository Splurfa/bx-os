DROP FUNCTION IF EXISTS public.process_csv_to_families_and_students();

CREATE OR REPLACE FUNCTION public.process_csv_to_families_and_students()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  csv_row RECORD;
  family_key_var TEXT;
  current_family_id UUID;
  student_dob DATE;
  emails_array TEXT[];
  parent1_email TEXT;
  parent2_email TEXT;
  families_created INT := 0;
  guardians_created INT := 0;
  students_created INT := 0;
  
BEGIN
  -- Clear existing data
  DELETE FROM behavior_history;
  DELETE FROM reflections;  
  DELETE FROM behavior_requests;
  DELETE FROM students;
  DELETE FROM guardians;
  DELETE FROM families;
  
  -- Create temporary tracking table for this session
  DROP TABLE IF EXISTS temp_processed_families;
  CREATE TEMPORARY TABLE temp_processed_families (
    family_key TEXT PRIMARY KEY,
    family_id UUID
  );
  
  -- Process each CSV row
  FOR csv_row IN 
    SELECT * FROM csv_import_raw ORDER BY family_header, street, city
  LOOP
    -- Create family key for grouping
    family_key_var := csv_row.family_header || '|' || COALESCE(csv_row.street, '') || '|' || COALESCE(csv_row.city, '');
    
    -- Check if family already exists in tracking
    SELECT temp_processed_families.family_id INTO current_family_id 
    FROM temp_processed_families 
    WHERE temp_processed_families.family_key = family_key_var;
    
    -- Create family if it doesn't exist
    IF current_family_id IS NULL THEN
      INSERT INTO families (
        family_name,
        primary_contact_name,
        primary_contact_phone,
        primary_contact_email,
        address_line1,
        city,
        state,
        zip_code
      ) VALUES (
        csv_row.family_header,
        csv_row.parent1_name,
        csv_row.parent1_cell_1,
        CASE WHEN csv_row.household_emails IS NOT NULL 
             THEN TRIM(SPLIT_PART(csv_row.household_emails, ',', 1))
             ELSE NULL END,
        csv_row.street,
        csv_row.city,
        csv_row.state,
        csv_row.zipc
      ) RETURNING id INTO current_family_id;
      
      -- Track this family
      INSERT INTO temp_processed_families (family_key, family_id) VALUES (family_key_var, current_family_id);
      families_created := families_created + 1;
      
      -- Parse household emails
      IF csv_row.household_emails IS NOT NULL THEN
        emails_array := string_to_array(REPLACE(csv_row.household_emails, ' ', ''), ',');
        parent1_email := CASE WHEN array_length(emails_array, 1) >= 1 THEN TRIM(emails_array[1]) ELSE NULL END;
        parent2_email := CASE WHEN array_length(emails_array, 1) >= 2 THEN TRIM(emails_array[2]) ELSE NULL END;
      END IF;
      
      -- Create guardian 1 if exists
      IF csv_row.parent1_name IS NOT NULL AND TRIM(csv_row.parent1_name) != '' THEN
        INSERT INTO guardians (
          family_id,
          first_name,
          last_name,
          relationship,
          phone_primary,
          phone_secondary,
          email,
          is_primary_contact,
          communication_preference
        ) VALUES (
          current_family_id,
          SPLIT_PART(TRIM(csv_row.parent1_name), ' ', 1),
          CASE WHEN position(' ' IN TRIM(csv_row.parent1_name)) > 0 
               THEN SUBSTRING(TRIM(csv_row.parent1_name) FROM position(' ' IN TRIM(csv_row.parent1_name)) + 1)
               ELSE TRIM(csv_row.parent1_name) END,
          'Parent',
          csv_row.parent1_cell_1,
          COALESCE(csv_row.parent1_cell_2, csv_row.parent1_work_1),
          parent1_email,
          true,
          'email'
        );
        guardians_created := guardians_created + 1;
      END IF;
      
      -- Create guardian 2 if exists
      IF csv_row.parent2_name IS NOT NULL AND TRIM(csv_row.parent2_name) != '' THEN
        INSERT INTO guardians (
          family_id,
          first_name,
          last_name,
          relationship,
          phone_primary,
          phone_secondary,
          email,
          is_primary_contact,
          communication_preference
        ) VALUES (
          current_family_id,
          SPLIT_PART(TRIM(csv_row.parent2_name), ' ', 1),
          CASE WHEN position(' ' IN TRIM(csv_row.parent2_name)) > 0 
               THEN SUBSTRING(TRIM(csv_row.parent2_name) FROM position(' ' IN TRIM(csv_row.parent2_name)) + 1)
               ELSE TRIM(csv_row.parent2_name) END,
          'Parent',
          csv_row.parent2_cell_1,
          COALESCE(csv_row.parent2_cell_2, csv_row.parent2_work_1),
          parent2_email,
          false,
          'email'
        );
        guardians_created := guardians_created + 1;
      END IF;
    END IF;
    
    -- Parse date of birth
    BEGIN
      student_dob := TO_DATE(csv_row.dob, 'MM/DD/YYYY');
    EXCEPTION
      WHEN others THEN
        student_dob := NULL;
    END;
    
    -- Create student
    INSERT INTO students (
      family_id,
      first_name,
      last_name,
      grade,
      class_name,
      date_of_birth
    ) VALUES (
      current_family_id,
      csv_row.student_first_name,
      csv_row.student_last_name,
      csv_row.class_raw,
      csv_row.class_raw,
      student_dob
    );
    students_created := students_created + 1;
    
  END LOOP;
  
  RETURN 'CSV Processing completed successfully: ' || 
         families_created || ' families, ' || 
         guardians_created || ' guardians, ' || 
         students_created || ' students created from CSV import.';
         
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'CSV Processing failed: ' || SQLERRM;
END;
$$;

-- Now execute the function
SELECT process_csv_to_families_and_students();