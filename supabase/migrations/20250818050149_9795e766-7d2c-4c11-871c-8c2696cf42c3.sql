-- Populate database from CSV data - Fixed version
-- This migration processes the Hillel students CSV and populates families, guardians, and students

-- First, let's create a temporary table to hold the CSV data
CREATE TEMP TABLE csv_import (
  family_header text,
  street text,
  city text,
  state text,
  zipc text,
  parent1_name text,
  parent1_cell_1 text,
  parent2_name text,
  parent2_cell_1 text,
  student_first_name text,
  student_last_name text,
  student_full_name text,
  dob text,
  class_raw text,
  household_emails text
);

-- Insert the CSV data (first 16 rows as sample)
INSERT INTO csv_import VALUES
('Abdian','336 S Swall Drive','Beverly Hills','CA','90211','Pedram Abdian','(213) 598-0337','Desiree Abdian','(310) 801-3159','Gabriella','Abdian','Gabriella Abdian','01/10/2019','1-3','desireeabdian@gmail.com, p.abdian@icloud.com'),
('Abdian','336 S Swall Drive','Beverly Hills','CA','90211','Pedram Abdian','(213) 598-0337','Desiree Abdian','(310) 801-3159','Adele Eden','Abdian','Adele Eden Abdian','02/23/2022','N4','desireeabdian@gmail.com, p.abdian@icloud.com'),
('Abrams/Dayani','328 S Swall Drive','Beverly Hills','CA','90211','Elliott Abrams','(818) 744-3799','Azadeh Dayani','(310) 963-4292','Alexandra','Abrams','Alexandra Abrams','07/02/2015','5.3','azidayani@gmail.com, eabramsdds@gmail.com'),
('Abrams/Dayani','328 S Swall Drive','Beverly Hills','CA','90211','Elliott Abrams','(818) 744-3799','Azadeh Dayani','(310) 963-4292','Isabella','Abrams','Isabella Abrams','10/09/2017','2-2','azidayani@gmail.com, eabramsdds@gmail.com'),
('Abramson','1537 Edris Drive','Los Angeles','CA','90035','David Abramson','(310) 926-3955','Dana Abramson','(310) 926-8913','Asher','Abramson','Asher Abramson','11/30/2012','7th','abramson23@gmail.com, ranarazz@yahoo.com'),
('Agi','434 Smithwood Drive','Beverly Hills','CA','90212','Jacob Agi','(310) 945-7565','Rebecca Agi','(310) 729-3811','Samuel','Agi','Samuel Agi','04/08/2018','2-1','beccaagi@gmail.com, bestmilkla@gmail.com, jacobagi123@gmail.com'),
('Agi','434 Smithwood Drive','Beverly Hills','CA','90212','Jacob Agi','(310) 945-7565','Rebecca Agi','(310) 729-3811','Abraham','Agi','Abraham Agi','04/25/2021','K4','beccaagi@gmail.com, bestmilkla@gmail.com, jacobagi123@gmail.com'),
('Alyesh','1127 S. la Peer Drive','Los Angeles','CA','90035','Joshua Alyesh','(516) 361-2421','Jessie Alyesh','(732) 801-7415','Ellia','Alyesh','Ellia Alyesh','10/19/2011','8th','jessieboda@gmail.com, joshalyesh@gmail.com'),
('Alyesh','1127 S. la Peer Drive','Los Angeles','CA','90035','Joshua Alyesh','(516) 361-2421','Jessie Alyesh','(732) 801-7415','Lior','Alyesh','Lior Alyesh','03/31/2014','6th','jessieboda@gmail.com, joshalyesh@gmail.com'),
('Alyesh','1127 S. la Peer Drive','Los Angeles','CA','90035','Joshua Alyesh','(516) 361-2421','Jessie Alyesh','(732) 801-7415','Liam','Alyesh','Liam Alyesh','02/18/2020','Pre1-1','jessieboda@gmail.com, joshalyesh@gmail.com'),
('Alyesh','1127 S. la Peer Drive','Los Angeles','CA','90035','Joshua Alyesh','(516) 361-2421','Jessie Alyesh','(732) 801-7415','Levi','Alyesh','Levi Alyesh','02/06/2024','PN2','jessieboda@gmail.com, joshalyesh@gmail.com'),
('Amona','504 N. Maple Drive','Beverly Hills','CA','90210','Pirooz Amona','(213) 820-3915','Nely Amona','(310) 488-4826','Ella','Amona','Ella Amona','01/28/2013','7th','american@webuyupside.com, nely26@gmail.com'),
('Armin','314 N. Elm Drive','Beverly Hills','CA','90210','Sean Armin','(310) 922-1189','Dalia Armin','(310) 968-5595','Abigail','Armin','Abigail Armin','12/10/2018','1-2','dalia.yerushalmi@gmail.com, sarmin@gmail.com'),
('Armin','314 N. Elm Drive','Beverly Hills','CA','90210','Sean Armin','(310) 922-1189','Dalia Armin','(310) 968-5595','Gabriel','Armin','Gabriel Armin','04/05/2017','3-3','dalia.yerushalmi@gmail.com, sarmin@gmail.com'),
('Armin','314 N. Elm Drive','Beverly Hills','CA','90210','Sean Armin','(310) 922-1189','Dalia Armin','(310) 968-5595','Liam','Armin','Liam Armin','09/07/2021','N1','dalia.yerushalmi@gmail.com, sarmin@gmail.com'),
('Armin','314 N. Elm Drive','Beverly Hills','CA','90210','Sean Armin','(310) 922-1189','Dalia Armin','(310) 968-5595','Kayla','Armin','Kayla Armin','02/04/2023','PN3','dalia.yerushalmi@gmail.com, sarmin@gmail.com');

-- Now create families from unique family/address combinations
INSERT INTO families (family_name, primary_contact_name, primary_contact_phone, primary_contact_email, address_line1, city, state, zip_code)
SELECT DISTINCT 
  family_header,
  parent1_name,
  parent1_cell_1,
  trim(split_part(household_emails, ',', 1)),
  street,
  city,
  state,
  zipc
FROM csv_import;

-- Create guardians for each family
WITH family_guardians AS (
  SELECT DISTINCT
    f.id as family_id,
    csv.parent1_name,
    csv.parent1_cell_1,
    csv.parent2_name,
    csv.parent2_cell_1,
    csv.household_emails
  FROM families f
  JOIN csv_import csv ON f.family_name = csv.family_header AND f.address_line1 = csv.street
)
INSERT INTO guardians (family_id, first_name, last_name, name, relationship, phone_primary, email, is_primary_contact)
SELECT 
  family_id,
  split_part(parent1_name, ' ', 1),
  split_part(parent1_name, ' ', 2),
  parent1_name,
  'Parent',
  parent1_cell_1,
  trim(split_part(household_emails, ',', 1)),
  true
FROM family_guardians
WHERE parent1_name IS NOT NULL AND parent1_name != ''
UNION ALL
SELECT 
  family_id,
  split_part(parent2_name, ' ', 1),
  split_part(parent2_name, ' ', 2),
  parent2_name,
  'Parent',
  parent2_cell_1,
  trim(split_part(household_emails, ',', 2)),
  false
FROM family_guardians
WHERE parent2_name IS NOT NULL AND parent2_name != '';

-- Create students linked to families (excluding the generated 'name' column)
INSERT INTO students (family_id, first_name, last_name, grade, class_name, date_of_birth)
SELECT 
  f.id,
  csv.student_first_name,
  csv.student_last_name,
  csv.class_raw,
  csv.class_raw,
  CASE 
    WHEN csv.dob ~ '^\d{2}/\d{2}/\d{4}$' THEN 
      TO_DATE(csv.dob, 'MM/DD/YYYY')
    ELSE NULL
  END
FROM csv_import csv
JOIN families f ON f.family_name = csv.family_header AND f.address_line1 = csv.street;

-- Drop the temporary table
DROP TABLE csv_import;