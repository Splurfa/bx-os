import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CSVRow {
  bsrSubmissionId: string;
  date: string;
  time: string;
  staffMember: string;
  studentName: string;
  subject: string;
  behaviorCategory: string;
  teacherNotes: string;
  immediateSupport: string;
  staffEmail: string;
  studentFirst: string;
  studentLast: string;
  staffFirst: string;
  staffLast: string;
  srfLink: string;
  srfStatus: string;
  reflectionQ1: string;
  reflectionQ2: string;
  reflectionQ3: string;
  reflectionQ4: string;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 2;
      } else {
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  result.push(current.trim());
  return result;
}

function parseDate(dateStr: string): string | null {
  try {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

function parseTime(timeStr: string): string | null {
  try {
    // Handle formats like "3:31 PM"
    const timeParts = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (timeParts) {
      let hours = parseInt(timeParts[1]);
      const minutes = parseInt(timeParts[2]);
      const isPM = timeParts[3].toUpperCase() === 'PM';
      
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting historical CSV import process...');

    // Read the CSV file from the file system
    let csvContent: string;
    try {
      csvContent = await Deno.readTextFile('/tmp/docs/2024-2025 Hillel Bx Data - Sheet1.csv');
    } catch (error) {
      console.error('Error reading CSV file:', error);
      // Try alternative path
      try {
        csvContent = await Deno.readTextFile('./docs/2024-2025 Hillel Bx Data - Sheet1.csv');
      } catch (error2) {
        console.error('Error reading CSV file from alternative path:', error2);
        return new Response(
          JSON.stringify({ 
            error: 'Could not read CSV file', 
            details: error.message 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = parseCSVLine(lines[0]);
    
    console.log(`Processing ${lines.length - 1} data rows...`);

    const historicalIncidents = [];
    const staffMembers = new Set();
    let processedCount = 0;
    let skippedCount = 0;

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      if (row.length < 20) {
        skippedCount++;
        continue;
      }

      const csvRow: CSVRow = {
        bsrSubmissionId: row[0] || '',
        date: row[1] || '',
        time: row[2] || '',
        staffMember: row[3] || '',
        studentName: row[4] || '',
        subject: row[5] || '',
        behaviorCategory: row[6] || '',
        teacherNotes: row[7] || '',
        immediateSupport: row[8] || '',
        staffEmail: row[9] || '',
        studentFirst: row[10] || '',
        studentLast: row[11] || '',
        staffFirst: row[12] || '',
        staffLast: row[13] || '',
        srfLink: row[14] || '',
        srfStatus: row[15] || '',
        reflectionQ1: row[16] || '',
        reflectionQ2: row[17] || '',
        reflectionQ3: row[18] || '',
        reflectionQ4: row[19] || ''
      };

      // Skip rows with missing critical data
      if (!csvRow.studentFirst || !csvRow.studentLast || !csvRow.date) {
        skippedCount++;
        continue;
      }

      // Add staff member to set for later processing
      if (csvRow.staffFirst && csvRow.staffLast && csvRow.staffEmail) {
        staffMembers.add(JSON.stringify({
          firstName: csvRow.staffFirst,
          lastName: csvRow.staffLast,
          email: csvRow.staffEmail,
          department: csvRow.subject || 'Unknown'
        }));
      }

      // Create historical incident record
      const incidentDate = parseDate(csvRow.date);
      const incidentTime = parseTime(csvRow.time);

      historicalIncidents.push({
        bsr_submission_id: csvRow.bsrSubmissionId,
        student_name: `${csvRow.studentFirst} ${csvRow.studentLast}`,
        student_first_name: csvRow.studentFirst,
        student_last_name: csvRow.studentLast,
        staff_member: csvRow.staffMember,
        staff_first_name: csvRow.staffFirst,
        staff_last_name: csvRow.staffLast,
        staff_email: csvRow.staffEmail,
        incident_date: incidentDate,
        incident_time: incidentTime,
        behavior_type: csvRow.behaviorCategory,
        subject_context: csvRow.subject,
        teacher_notes: csvRow.teacherNotes,
        immediate_support: csvRow.immediateSupport?.toLowerCase() === 'yes',
        srf_status: csvRow.srfStatus,
        reflection_completed: csvRow.srfStatus?.toLowerCase() === 'complete',
        reflection_question_1: csvRow.reflectionQ1,
        reflection_question_2: csvRow.reflectionQ2,
        reflection_question_3: csvRow.reflectionQ3,
        reflection_question_4: csvRow.reflectionQ4,
        academic_year: '2024-2025',
        data_quality_score: 1.0
      });

      processedCount++;
    }

    console.log(`Processed ${processedCount} incidents, skipped ${skippedCount} rows`);

    // Insert historical staff data
    const staffArray = Array.from(staffMembers).map(staff => JSON.parse(staff));
    if (staffArray.length > 0) {
      const { error: staffError } = await supabase
        .from('historical_staff')
        .upsert(
          staffArray.map(staff => ({
            first_name: staff.firstName,
            last_name: staff.lastName,
            email: staff.email,
            department: staff.department,
            academic_year: '2024-2025'
          })),
          { onConflict: 'email,academic_year' }
        );

      if (staffError) {
        console.error('Error inserting historical staff:', staffError);
      } else {
        console.log(`Inserted ${staffArray.length} historical staff records`);
      }
    }

    // Insert historical incidents in batches
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < historicalIncidents.length; i += batchSize) {
      const batch = historicalIncidents.slice(i, i + batchSize);
      
      const { error: incidentError } = await supabase
        .from('historical_incidents')
        .insert(batch);

      if (incidentError) {
        console.error(`Error inserting batch ${i}-${i + batchSize}:`, incidentError);
      } else {
        insertedCount += batch.length;
        console.log(`Inserted batch ${i}-${i + batchSize} (${batch.length} records)`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Historical CSV data imported successfully',
        stats: {
          totalLines: lines.length - 1,
          processedIncidents: processedCount,
          insertedIncidents: insertedCount,
          skippedRows: skippedCount,
          staffMembers: staffArray.length
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Historical CSV import error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to import historical CSV data', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});