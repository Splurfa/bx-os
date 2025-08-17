# 📊 CSV Import & Data Strategy

## Overview
Transform flat CSV student data into a sophisticated relational database structure that supports family relationships, external data correlation, and future behavioral intelligence features.

## Current CSV Data Structure Analysis

### **Sample CSV Fields (from your data)**
```csv
Student Name, Teacher Name, Grade, Class, Family Info, Guardian Contacts...
```

### **Transformation Requirements**
- **Normalize Family Relationships:** Extract family units from individual student records
- **Create Guardian Contacts:** Separate primary/secondary/emergency contacts
- **Establish Correlation Markers:** Time-based and name-based matching for external systems
- **Prepare Extension Points:** Ready for SIS data integration

## Database Architecture for CSV Import

### **Core Relational Model**
<lov-mermaid>
graph TD
    F[families] --> S[students]
    F --> G[guardians]
    S --> BR[behavior_requests]
    S --> ED[external_data]
    G --> CP[contact_preferences]
    
    subgraph "CSV Import Foundation"
        F
        S  
        G
        CP
    end
    
    subgraph "Behavioral Workflow"
        BR --> R[reflections]
        R --> BH[behavior_history]
    end
    
    subgraph "Future Integration"
        ED --> DS[data_sources]
        DS --> EC[external_correlations]
    end
    
    style F fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style S fill:#f1f8e9,stroke:#388e3c,stroke-width:2px
    style G fill:#fce4ec,stroke:#c2185b,stroke-width:2px
</lov-mermaid>

## Import Strategy

### **Phase 1: Family Normalization (30 minutes)**

**1.1 Extract Unique Families**
```sql
-- Create families table for CSV import
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_name TEXT NOT NULL,
    address TEXT,
    phone_primary TEXT,
    phone_secondary TEXT,
    email_primary TEXT,
    emergency_contact TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

**1.2 Process CSV Family Logic**
```typescript
// Family extraction algorithm
interface CSVRow {
    studentName: string;
    guardianName: string;
    address: string;
    phone: string;
    email: string;
}

function extractFamilies(csvData: CSVRow[]) {
    const familyMap = new Map();
    
    csvData.forEach(row => {
        const familyKey = `${row.address}-${row.guardianName}`;
        if (!familyMap.has(familyKey)) {
            familyMap.set(familyKey, {
                family_name: row.guardianName.split(' ').pop(), // Last name
                address: row.address,
                phone_primary: row.phone,
                email_primary: row.email,
                students: []
            });
        }
        familyMap.get(familyKey).students.push(row.studentName);
    });
    
    return Array.from(familyMap.values());
}
```

### **Phase 2: Student Import with Family Links (45 minutes)**

**2.1 Enhanced Students Table**
```sql
-- Students table with family relationships
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id),
    name TEXT NOT NULL,
    grade TEXT,
    class_name TEXT,
    student_id_external TEXT, -- For SIS correlation
    date_of_birth DATE,
    enrollment_date DATE,
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for external system correlation
CREATE INDEX idx_students_external_id ON students(student_id_external);
CREATE INDEX idx_students_name_grade ON students(name, grade);
```

**2.2 CSV to Students Import Process**
```typescript
async function importStudents(csvData: CSVRow[], families: Family[]) {
    for (const row of csvData) {
        // Find matching family
        const family = families.find(f => 
            f.address === row.address && 
            f.family_name.includes(row.guardianName.split(' ').pop())
        );
        
        // Insert student with family relationship
        await supabase.from('students').insert({
            family_id: family.id,
            name: row.studentName,
            grade: row.grade,
            class_name: row.class,
            student_id_external: generateExternalId(row.studentName, row.grade),
            enrollment_date: new Date(),
            status: 'active'
        });
    }
}
```

### **Phase 3: Guardian Contact Management (30 minutes)**

**3.1 Guardians Table Structure**
```sql
-- Guardians with detailed contact preferences
CREATE TABLE guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id),
    name TEXT NOT NULL,
    relationship TEXT, -- 'parent', 'guardian', 'emergency'
    phone_primary TEXT,
    phone_secondary TEXT,
    email TEXT,
    preferred_contact_method TEXT DEFAULT 'email',
    contact_time_preference TEXT DEFAULT 'anytime',
    language_preference TEXT DEFAULT 'english',
    receive_behavioral_notifications BOOLEAN DEFAULT true,
    receive_academic_notifications BOOLEAN DEFAULT true,
    receive_emergency_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

**3.2 Contact Preferences Processing**
```typescript
interface ContactPreference {
    method: 'email' | 'sms' | 'phone' | 'app';
    timing: 'immediate' | 'daily_digest' | 'weekly_summary';
    types: ('behavioral' | 'academic' | 'emergency')[];
}

async function processGuardianContacts(csvData: CSVRow[], families: Family[]) {
    for (const family of families) {
        // Extract primary guardian from CSV
        const primaryGuardian = {
            family_id: family.id,
            name: family.family_name,
            relationship: 'parent',
            phone_primary: family.phone_primary,
            email: family.email_primary,
            preferred_contact_method: 'email',
            receive_behavioral_notifications: true
        };
        
        await supabase.from('guardians').insert(primaryGuardian);
    }
}
```

## External Data Correlation Framework

### **Preparation for SIS Integration**

**4.1 Data Sources Tracking**
```sql
-- Track external data sources for future correlation
CREATE TABLE data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_name TEXT NOT NULL, -- 'PowerSchool', 'Infinite Campus', etc.
    source_type TEXT NOT NULL, -- 'SIS', 'Assessment', 'Communication'
    api_endpoint TEXT,
    last_sync TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'pending',
    credentials_stored BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Store external system data for correlation
CREATE TABLE external_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id),
    data_source_id UUID REFERENCES data_sources(id),
    external_student_id TEXT,
    data_type TEXT, -- 'academic', 'attendance', 'disciplinary'
    data_payload JSONB,
    correlation_confidence DECIMAL(3,2), -- 0.00 to 1.00
    last_updated TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**4.2 Correlation Strategy**
```typescript
// Future SIS correlation logic
interface CorrelationStrategy {
    student_name_match: number;    // Weight: 0.4
    grade_level_match: number;     // Weight: 0.2  
    enrollment_date_match: number; // Weight: 0.2
    guardian_name_match: number;   // Weight: 0.2
}

function calculateCorrelationConfidence(
    internal: Student, 
    external: ExternalStudentData
): number {
    // Name similarity algorithm
    const nameSimilarity = calculateNameSimilarity(internal.name, external.name);
    
    // Grade level exact match
    const gradeMatch = internal.grade === external.grade ? 1.0 : 0.0;
    
    // Date proximity (within 30 days)
    const dateMatch = calculateDateProximity(internal.enrollment_date, external.enrollment_date);
    
    // Guardian name in emergency contacts
    const guardianMatch = checkGuardianMatch(internal.family_id, external.emergency_contacts);
    
    return (nameSimilarity * 0.4) + (gradeMatch * 0.2) + (dateMatch * 0.2) + (guardianMatch * 0.2);
}
```

## CSV Import Implementation Plan

### **Immediate Implementation (During Sprint)**

**Step 1: Database Nuclear Reset** ⏱️ 30 minutes
```sql
-- Drop existing tables and recreate with new architecture
DROP TABLE IF EXISTS behavior_history CASCADE;
DROP TABLE IF EXISTS reflections CASCADE;
DROP TABLE IF EXISTS behavior_requests CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- Implement new schema with family relationships
-- (Include all tables from above)
```

**Step 2: CSV Processing Pipeline** ⏱️ 45 minutes
```typescript
// Create CSV import utility
async function importCSVData(csvFile: File) {
    const csvData = await parseCSV(csvFile);
    
    // Phase 1: Extract and create families
    const families = extractFamilies(csvData);
    await batchInsert('families', families);
    
    // Phase 2: Import students with family links
    await importStudents(csvData, families);
    
    // Phase 3: Create guardian contacts
    await processGuardianContacts(csvData, families);
    
    // Phase 4: Setup correlation markers
    await prepareExternalCorrelation(csvData);
    
    return {
        families_imported: families.length,
        students_imported: csvData.length,
        guardians_created: families.length * 1.5, // Average guardians per family
        correlation_markers: csvData.length
    };
}
```

**Step 3: Validation & Testing** ⏱️ 15 minutes
```typescript
// Import validation
async function validateImport() {
    const results = await Promise.all([
        supabase.from('families').select('*', { count: 'exact' }),
        supabase.from('students').select('*', { count: 'exact' }),
        supabase.from('guardians').select('*', { count: 'exact' })
    ]);
    
    return {
        families_count: results[0].count,
        students_count: results[1].count,
        guardians_count: results[2].count,
        relationship_integrity: await checkRelationshipIntegrity()
    };
}
```

## Success Criteria

### **Import Success Metrics**
- [ ] **100+ students imported** with complete family relationships
- [ ] **Family normalization successful** with proper guardian contact extraction
- [ ] **External correlation markers** prepared for future SIS integration
- [ ] **Data integrity validated** with foreign key relationships intact
- [ ] **Import performance** under 2 minutes for 100+ student dataset

### **Future-Proof Validation**
- [ ] **Extension points ready** for AI behavioral analysis
- [ ] **Communication framework prepared** for parent notification system
- [ ] **External data correlation** architecture validated
- [ ] **Scalability tested** for 1000+ student datasets

**Total Implementation Time:** 1.5 hours during Phase 1 of sprint (hours 2-3.5)

This strategy transforms your CSV data into a sophisticated relational foundation that's immediately useful for the current behavioral system while being perfectly prepared for advanced AI, analytics, and external integration features.