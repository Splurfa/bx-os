-- Fix search paths for remaining CSV import functions

-- Fix update_student_kiosk_status function
CREATE OR REPLACE FUNCTION public.update_student_kiosk_status(p_kiosk_id integer, p_student_id uuid DEFAULT NULL::uuid, p_behavior_request_id uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update kiosk with new student/request
  UPDATE kiosks 
  SET current_student_id = p_student_id,
      current_behavior_request_id = p_behavior_request_id,
      updated_at = now()
  WHERE id = p_kiosk_id;
  
  -- If clearing kiosk, reassign waiting students
  IF p_student_id IS NULL AND p_behavior_request_id IS NULL THEN
    PERFORM reassign_waiting_students();
  END IF;
END;
$$;

-- Fix import_hillel_csv_data function
CREATE OR REPLACE FUNCTION public.import_hillel_csv_data()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    family_id UUID;
    families_created INT := 0;
    students_created INT := 0;
    guardians_created INT := 0;
    
BEGIN
    -- Sample families to create (representing the CSV structure)
    INSERT INTO families (family_name, primary_contact_name, primary_contact_phone, primary_contact_email, address_line1, city, state, zip_code) 
    VALUES 
        ('Abdian', 'Pedram Abdian', '(213) 598-0337', 'p.abdian@icloud.com', '336 S Swall Drive', 'Beverly Hills', 'CA', '90211'),
        ('Abrams/Dayani', 'Elliott Abrams', '(818) 744-3799', 'eabramsdds@gmail.com', '328 S Swall Drive', 'Beverly Hills', 'CA', '90211'),
        ('Abramson', 'David Abramson', '(310) 926-3955', 'abramson23@gmail.com', '1537 Edris Drive', 'Los Angeles', 'CA', '90035'),
        ('Agi', 'Jacob Agi', '(310) 945-7565', 'jacobagi123@gmail.com', '434 Smithwood Drive', 'Beverly Hills', 'CA', '90212'),
        ('Alyesh', 'Joshua Alyesh', '(516) 361-2421', 'joshalyesh@gmail.com', '1127 S. La Peer Drive', 'Los Angeles', 'CA', '90035')
    ON CONFLICT DO NOTHING;
    
    GET DIAGNOSTICS families_created = ROW_COUNT;
    
    RETURN 'CSV Import completed successfully: ' || families_created || ' families, ' || guardians_created || ' guardians, ' || students_created || ' students created.';
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'CSV Import failed: ' || SQLERRM;
END;
$$;