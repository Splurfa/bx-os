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

    // Embedded CSV data (first 50 rows of historical data)
    const csvContent = `BSR Submission ID,Date,Time,Staff Member,Student Name,Subject,Behavior Category,Teacher Notes,Immediate Support?,Staff Email,Student First,Student Last,Staff First,Staff Last,SRF Link,SRF Status,What happened? What was your behavior?,What were you trying to accomplish with your behavior?,"Who has been affected by what happened, and how?",Please provide two sentences describing your understanding of what is expected of you when you return to your class.
b2b9b290-77d2-42ce-a180-1cf8008ad745,11/7/2024,3:31 PM,Matt Gould,Aaron Myers,General Studies,"Disruptive, Social/Emotional",Sent to support for disrupting class. He was arguing with another student and wouldn't stop,,mgould@hillelhebrew.org,Aaron,Myers,Matt,Gould,https://forms.fillout.com/t/o2p7iSRgYCus?studentfirst=Aaron&studentlast=Myers&staff=Matt&member=Gould&BSRID=b2b9b290-77d2-42ce-a180-1cf8008ad745&email=mgould@hillelhebrew.org,Complete,someone kept saying rude things to me so I said things back,I was trying to do my work but someone kept coming back to me and starting an argument,me my peers and my teacher,I know that instead of saying anything back to this student I should report it to the teacher. I should also try not to talk to these students in the first place no matter what.
56d45fc7-c60f-47d1-b8ef-31f6eb9afdda,11/8/2024,4:01 PM,Matt Gould,Eliyahu Aviv-Gabay,General Studies,Disruptive,Eliyahu to office. They kept joking about racist stuff plus I can't get him off games,,mgould@hillelhebrew.org,Eliyahu,Aviv-Gabay,Matt,Gould,https://forms.fillout.com/t/o2p7iSRgYCus?studentfirst=Eliyahu&studentlast=Aviv-Gabay&staff=Matt&member=Gould&BSRID=56d45fc7-c60f-47d1-b8ef-31f6eb9afdda&email=mgould@hillelhebrew.org,Complete,making fun of each other good we were just distracting,"nothing
",Aaron Myers making fun of each other,to lisine. to work hard
7b00ff7c-fabc-4916-b3a7-855966e06ec7,11/12/2024,9:04 AM,Elizabeth Dukatt,Menachem Kaplan,General Studies,Disruptive,disrupted class saying inappropriate statement,,edukatt@hillelhebrew.org,Menachem,Kaplan,Elizabeth,Dukatt,https://forms.fillout.com/t/o2p7iSRgYCus?studentfirst=Menachem&studentlast=Kaplan&staff=Elizabeth&member=Dukatt&BSRID=7b00ff7c-fabc-4916-b3a7-855966e06ec7&email=edukatt@hillelhebrew.org,Complete,"I was talking about Yula opening house, and I disrupted the class.",Talk to my friends about Yula.,"The class, because I disrupted learning.","Don't talk in class to your friends, Sit quietly, don't disrupt. Do your work on time."
cd8a4759-1460-4764-80dc-03227d7f9da2,11/13/2024,11:14 AM,Jared Gonzales,Zara Fayfel,General Studies,Disruptive,"Zara to student support for disruptive behavior, not to return to class",,jgonzales@hillelhebrew.org,Zara,Fayfel,Jared,Gonzales,https://forms.fillout.com/t/o2p7iSRgYCus?studentfirst=Zara&studentlast=Fayfel&staff=Jared&member=Gonzales&BSRID=cd8a4759-1460-4764-80dc-03227d7f9da2&email=jgonzales@hillelhebrew.org,Complete,i got my feet stuck on this sticky thing and then it as distupiv becuz it was stuck and she got mad,getting my feat of the stiky thing,my class becuz they were laughing,I have to go to class say sorry. then go sit in my seat.
5d9fcff6-8fd6-47f9-89e2-5fee9a70db94,11/13/2024,11:45 AM,Tehila Parnes,Claire Braunstein,General Studies,Disruptive,"causing disruption in class, put her shoes on a piece of cardboard with glue on one side and got her shoes stuck. class continued to spiral out of control so sent to student support.",,tparnes@hillelhebrew.org,Claire,Braunstein,Tehila,Parnes,https://forms.fillout.com/t/o2p7iSRgYCus?studentfirst=Claire&studentlast=Braunstein&staff=Tehila&member=Parnes&BSRID=5d9fcff6-8fd6-47f9-89e2-5fee9a70db94&email=tparnes@hillelhebrew.org,,,,,
164f0922-298b-45b2-bba7-5de23c8a8205,11/13/2024,12:00 PM,Rabbi Litenatsky,Pearl Wintner,Unstructured,"Disruptive, Avoidance",sent out before benching for disrupting and consequence is Mrs G office,,mlitenatsky@hillelhebrew.org,Pearl,Wintner,Rabbi,Litenatsky,https://forms.fillout.com/t/o2p7iSRgYCus?studentfirst=Pearl&studentlast=Wintner&staff=Rabbi&member=Litenatsky&BSRID=164f0922-298b-45b2-bba7-5de23c8a8205&email=mlitenatsky@hillelhebrew.org,Complete,I interrupted benching. I was being loud and crazy.,"Nothing, I just acted up",Rabbi Lit and my classmates. I interrupted.,I am going to walk in quietly and take out the things I need.
d689e967-e2cc-462e-9ae1-87673370c7d1,11/13/2024,12:09 PM,Rabbi Litenatsky,Jenna Portnoy,Unstructured,Disruptive,sent to Mrs G from lunch room,,mlitenatsky@hillelhebrew.org,Jenna,Portnoy,Rabbi,Litenatsky,https://forms.fillout.com/t/o2p7iSRgYCus?studentfirst=Jenna&studentlast=Portnoy&staff=Rabbi&member=Litenatsky&BSRID=d689e967-e2cc-462e-9ae1-87673370c7d1&email=mlitenatsky@hillelhebrew.org,Complete,"I was at lunch and I was very loud and disrespectful to Rabbi lit I was playing games and danceing
",nothing  just had a moment,Rabbi lit and class mates because they could not beanch,I will join the class nicely and quietly. will get my supplies and follow along
c167c32b-db01-4edf-8ba5-1011f00d7f29,11/13/2024,1:59 PM,Jared Gonzales,Liam Dinets,General Studies,Disruptive,"Sent out of math at 12:23, logging this now to ensure we're saving the information.",,jgonzales@hillelhebrew.org,Liam,Dinets,Jared,Gonzales,https://forms.fillout.com/t/o2p7iSRgYCus?studentfirst=Liam&studentlast=Dinets&staff=Jared&member=Gonzales&BSRID=c167c32b-db01-4edf-8ba5-1011f00d7f29&email=jgonzales@hillelhebrew.org,,,,,
b6b09673-1638-449d-a990-bf6bab0b8459,11/13/2024,2:43 PM,Rabbi Litenatsky,Mordechai Aviv-Gabay,Unstructured,"Disruptive, Social/Emotional","Pulled Zachary Hami off atrium bench, causing Zachary to be unable to work and an atrium wide chase while 3 separate work groups (including Zachary's) were disrupted. 

He is with me in the atrium.  ",,mlitenatsky@hillelhebrew.org,Mordechai,Aviv-Gabay,Rabbi,Litenatsky,https://forms.fillout.com/t/o2p7iSRgYCus?studentfirst=Mordechai&studentlast=Aviv-Gabay&staff=Rabbi&member=Litenatsky&BSRID=b6b09673-1638-449d-a990-bf6bab0b8459&email=mlitenatsky@hillelhebrew.org,,,,,
f131da3b-2f20-45bf-bbb9-e4ed07ed7e9f,11/14/2024,1:09 PM,Mali,Claire Braunstein,Judaic Studies,Disruptive,Was drawing on the table with a highlighter,,mtal@hillelhebrew.org,Claire,Braunstein,Mali,,https://forms.fillout.com/t/o2p7iSRgYCus?studentfirst=Claire&studentlast=Braunstein&staff=Mali&member=&BSRID=f131da3b-2f20-45bf-bbb9-e4ed07ed7e9f&email=mtal@hillelhebrew.org,Complete,I was coloring on the desk,I was just trying to coler,mora molly cuz it was distupdev,oppoligz to mora Mali. and sit and pay atttion for the rest of class`;

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

    // Insert historical staff data with proper conflict handling
    const staffArray = Array.from(staffMembers).map(staff => JSON.parse(staff));
    if (staffArray.length > 0) {
      // Insert staff one by one to handle conflicts gracefully
      let staffInserted = 0;
      for (const staff of staffArray) {
        try {
          const { error: staffError } = await supabase
            .from('historical_staff')
            .insert({
              first_name: staff.firstName,
              last_name: staff.lastName,
              email: staff.email,
              department: staff.department,
              academic_year: '2024-2025'
            });
          
          if (!staffError) {
            staffInserted++;
          }
        } catch (error) {
          // Skip duplicates, continue processing
          continue;
        }
      }
      console.log(`Successfully inserted ${staffInserted} staff members (${staffArray.length - staffInserted} duplicates skipped)`);
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