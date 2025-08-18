import { supabase } from '@/integrations/supabase/client';

export interface CSVRow {
  family_header: string;
  street: string;
  city: string;
  state: string;
  zipc: string;
  parent1_name: string;
  parent1_cell_1: string;
  parent2_name: string;
  parent2_cell_1: string;
  student_first_name: string;
  student_last_name: string;
  dob: string;
  class_raw: string;
  household_emails: string;
}

export const createDemoAccounts = async () => {
  const { data, error } = await supabase.functions.invoke('create-demo-accounts');
  if (error) {
    console.error('Error creating demo accounts:', error);
    throw error;
  }
  return data;
};

export const importCSVData = async () => {
  // Sample data from the CSV file
  const csvData: CSVRow[] = [
    {
      family_header: 'Abdian',
      street: '336 S Swall Drive',
      city: 'Beverly Hills',
      state: 'CA',
      zipc: '90211',
      parent1_name: 'Pedram Abdian',
      parent1_cell_1: '(213) 598-0337',
      parent2_name: 'Desiree Abdian',
      parent2_cell_1: '(310) 801-3159',
      student_first_name: 'Gabriella',
      student_last_name: 'Abdian',
      dob: '01/10/2019',
      class_raw: '1-3',
      household_emails: 'desireeabdian@gmail.com, p.abdian@icloud.com'
    },
    {
      family_header: 'Abdian',
      street: '336 S Swall Drive',
      city: 'Beverly Hills',
      state: 'CA',
      zipc: '90211',
      parent1_name: 'Pedram Abdian',
      parent1_cell_1: '(213) 598-0337',
      parent2_name: 'Desiree Abdian',
      parent2_cell_1: '(310) 801-3159',
      student_first_name: 'Adele Eden',
      student_last_name: 'Abdian',
      dob: '02/23/2022',
      class_raw: 'N4',
      household_emails: 'desireeabdian@gmail.com, p.abdian@icloud.com'
    },
    {
      family_header: 'Abrams/Dayani',
      street: '328 S Swall Drive',
      city: 'Beverly Hills',
      state: 'CA',
      zipc: '90211',
      parent1_name: 'Elliott Abrams',
      parent1_cell_1: '(818) 744-3799',
      parent2_name: 'Azadeh Dayani',
      parent2_cell_1: '(310) 963-4292',
      student_first_name: 'Alexandra',
      student_last_name: 'Abrams',
      dob: '07/02/2015',
      class_raw: '5.3',
      household_emails: 'azidayani@gmail.com, eabramsdds@gmail.com'
    }
  ];

  try {
    // Create families
    const uniqueFamilies = Array.from(
      new Map(csvData.map(row => [
        `${row.family_header}-${row.street}`,
        {
          family_name: row.family_header,
          primary_contact_name: row.parent1_name,
          primary_contact_phone: row.parent1_cell_1,
          primary_contact_email: row.household_emails.split(',')[0]?.trim(),
          address_line1: row.street,
          city: row.city,
          state: row.state,
          zip_code: row.zipc
        }
      ])).values()
    );

    const { data: familiesData, error: familiesError } = await supabase
      .from('families')
      .insert(uniqueFamilies)
      .select();

    if (familiesError) throw familiesError;

    // Create guardians
    const guardians = [];
    for (const family of familiesData) {
      const csvRows = csvData.filter(row => 
        row.family_header === family.family_name && row.street === family.address_line1
      );
      
      if (csvRows.length > 0) {
        const row = csvRows[0];
        
        // Parent 1
        if (row.parent1_name) {
          guardians.push({
            family_id: family.id,
            first_name: row.parent1_name.split(' ')[0],
            last_name: row.parent1_name.split(' ').slice(1).join(' '),
            relationship: 'Parent',
            phone_primary: row.parent1_cell_1,
            email: row.household_emails.split(',')[0]?.trim(),
            is_primary_contact: true
          });
        }
        
        // Parent 2
        if (row.parent2_name) {
          guardians.push({
            family_id: family.id,
            first_name: row.parent2_name.split(' ')[0],
            last_name: row.parent2_name.split(' ').slice(1).join(' '),
            relationship: 'Parent',
            phone_primary: row.parent2_cell_1,
            email: row.household_emails.split(',')[1]?.trim(),
            is_primary_contact: false
          });
        }
      }
    }

    const { error: guardiansError } = await supabase
      .from('guardians')
      .insert(guardians);

    if (guardiansError) throw guardiansError;

    // Create students
    const students = [];
    for (const family of familiesData) {
      const familyStudents = csvData.filter(row => 
        row.family_header === family.family_name && row.street === family.address_line1
      );
      
      for (const row of familyStudents) {
        students.push({
          family_id: family.id,
          first_name: row.student_first_name,
          last_name: row.student_last_name,
          grade: row.class_raw,
          class_name: row.class_raw,
          date_of_birth: row.dob.match(/^\d{2}\/\d{2}\/\d{4}$/) 
            ? new Date(row.dob).toISOString().split('T')[0]
            : null
        });
      }
    }

    const { error: studentsError } = await supabase
      .from('students')
      .insert(students);

    if (studentsError) throw studentsError;

    return { success: true, message: 'CSV data imported successfully' };
  } catch (error) {
    console.error('CSV import error:', error);
    throw error;
  }
};