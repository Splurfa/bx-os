import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CSVRow {
  family_header: string;
  street: string;
  city: string;
  state: string;
  zipc: string;
  address_raw: string;
  parent1_name: string;
  parent1_cell_1: string;
  parent1_cell_2: string;
  parent1_work_1: string;
  parent1_work_2: string;
  parent2_name: string;
  parent2_cell_1: string;
  parent2_cell_2: string;
  parent2_work_1: string;
  parent2_work_2: string;
  student_first_name: string;
  student_last_name: string;
  student_full_name: string;
  dob: string;
  class_raw: string;
  page_number: string;
  source_excerpt: string;
  household_emails: string;
  address_parse_mode: string;
  street_normalized: string;
}

function parseCSVRow(line: string): CSVRow | null {
  // Simple CSV parser that handles quoted fields
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  
  if (fields.length < 26) return null;
  
  return {
    family_header: fields[0],
    street: fields[1],
    city: fields[2],
    state: fields[3],
    zipc: fields[4],
    address_raw: fields[5],
    parent1_name: fields[6],
    parent1_cell_1: fields[7],
    parent1_cell_2: fields[8],
    parent1_work_1: fields[9],
    parent1_work_2: fields[10],
    parent2_name: fields[11],
    parent2_cell_1: fields[12],
    parent2_cell_2: fields[13],
    parent2_work_1: fields[14],
    parent2_work_2: fields[15],
    student_first_name: fields[16],
    student_last_name: fields[17],
    student_full_name: fields[18],
    dob: fields[19],
    class_raw: fields[20],
    page_number: fields[21],
    source_excerpt: fields[22],
    household_emails: fields[23],
    address_parse_mode: fields[24],
    street_normalized: fields[25]
  };
}

function formatDate(dateStr: string): string | null {
  try {
    // Handle MM/DD/YYYY format
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting CSV import process...');

    // Read the CSV file
    let csvContent: string;
    try {
      csvContent = await Deno.readTextFile('/opt/api/public/data/hillel_students_2025.csv');
    } catch (error) {
      console.error('Error reading CSV file:', error);
      // Fallback: try to fetch from URL
      const response = await fetch('https://tkqlflnarqrddjdqslom.supabase.co/storage/v1/object/public/data/hillel_students_2025.csv');
      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: 'Could not read CSV file' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      csvContent = await response.text();
    }

    // Parse CSV content
    const lines = csvContent.split('\n').filter(line => line.trim());
    const header = lines[0];
    const dataLines = lines.slice(1);

    console.log(`Found ${dataLines.length} data rows to process`);

    // Clear existing data
    console.log('Clearing existing data...');
    await supabaseClient.from('behavior_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('reflections').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('behavior_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('guardians').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('families').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Process CSV data
    const familyMap = new Map<string, any>();
    const studentsToCreate: any[] = [];
    const guardiansToCreate: any[] = [];

    for (const line of dataLines) {
      const row = parseCSVRow(line);
      if (!row) continue;

      // Create family key for grouping
      const familyKey = `${row.family_header}|${row.street}|${row.city}`;
      
      // Create or get family
      if (!familyMap.has(familyKey)) {
        const emails = row.household_emails.split(',').map(e => e.trim()).filter(e => e);
        const primaryEmail = emails[0] || '';
        
        const family = {
          family_name: row.family_header,
          primary_contact_name: row.parent1_name || row.parent2_name || '',
          primary_contact_phone: row.parent1_cell_1 || row.parent2_cell_1 || '',
          primary_contact_email: primaryEmail,
          address_line1: row.street,
          city: row.city,
          state: row.state,
          zip_code: row.zipc
        };
        
        familyMap.set(familyKey, family);
        
        // Prepare guardians for this family
        if (row.parent1_name) {
          const parent1Names = row.parent1_name.split(' ');
          guardiansToCreate.push({
            family_key: familyKey,
            first_name: parent1Names[0] || '',
            last_name: parent1Names.slice(1).join(' ') || '',
            relationship: 'Parent',
            phone_primary: row.parent1_cell_1 || '',
            phone_secondary: row.parent1_cell_2 || '',
            email: emails.find(e => e.includes(row.parent1_name.toLowerCase().split(' ')[0])) || emails[0] || '',
            is_primary_contact: true,
            communication_preference: 'email'
          });
        }
        
        if (row.parent2_name) {
          const parent2Names = row.parent2_name.split(' ');
          guardiansToCreate.push({
            family_key: familyKey,
            first_name: parent2Names[0] || '',
            last_name: parent2Names.slice(1).join(' ') || '',
            relationship: 'Parent',
            phone_primary: row.parent2_cell_1 || '',
            phone_secondary: row.parent2_cell_2 || '',
            email: emails.find(e => e.includes(row.parent2_name.toLowerCase().split(' ')[0])) || emails[1] || '',
            is_primary_contact: false,
            communication_preference: 'email'
          });
        }
      }
      
      // Add student
      studentsToCreate.push({
        family_key: familyKey,
        first_name: row.student_first_name,
        last_name: row.student_last_name,
        grade: row.class_raw,
        class_name: row.class_raw,
        date_of_birth: formatDate(row.dob)
      });
    }

    console.log(`Processing ${familyMap.size} families, ${guardiansToCreate.length} guardians, ${studentsToCreate.length} students`);

    // Insert families
    const families = Array.from(familyMap.values());
    const { data: familyData, error: familyError } = await supabaseClient
      .from('families')
      .insert(families)
      .select('id, family_name, address_line1, city');

    if (familyError) {
      console.error('Error inserting families:', familyError);
      throw familyError;
    }

    console.log(`Inserted ${familyData.length} families`);

    // Create family lookup
    const familyLookup = new Map<string, string>();
    for (const family of familyData) {
      const key = `${family.family_name}|${family.address_line1}|${family.city}`;
      familyLookup.set(key, family.id);
    }

    // Insert guardians
    const guardiansWithFamilyIds = guardiansToCreate.map(guardian => ({
      ...guardian,
      family_id: familyLookup.get(guardian.family_key)
    })).filter(g => g.family_id);

    const { error: guardianError } = await supabaseClient
      .from('guardians')
      .insert(guardiansWithFamilyIds.map(g => {
        const { family_key, ...rest } = g;
        return rest;
      }));

    if (guardianError) {
      console.error('Error inserting guardians:', guardianError);
      throw guardianError;
    }

    console.log(`Inserted ${guardiansWithFamilyIds.length} guardians`);

    // Insert students
    const studentsWithFamilyIds = studentsToCreate.map(student => ({
      ...student,
      family_id: familyLookup.get(student.family_key)
    })).filter(s => s.family_id);

    const { error: studentError } = await supabaseClient
      .from('students')
      .insert(studentsWithFamilyIds.map(s => {
        const { family_key, ...rest } = s;
        return rest;
      }));

    if (studentError) {
      console.error('Error inserting students:', studentError);
      throw studentError;
    }

    console.log(`Inserted ${studentsWithFamilyIds.length} students`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `CSV Import completed: ${familyData.length} families, ${guardiansWithFamilyIds.length} guardians, ${studentsWithFamilyIds.length} students created.`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('CSV import error:', error);
    return new Response(
      JSON.stringify({
        error: 'CSV import failed',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});