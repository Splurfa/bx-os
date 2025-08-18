import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface CSVStudent {
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
  student_full_name: string;
  dob: string;
  class_raw: string;
  household_emails: string;
}

interface ProcessedFamily {
  family_name: string;
  primary_contact_name: string;
  primary_contact_phone: string;
  primary_contact_email: string;
  address_line1: string;
  city: string;
  state: string;
  zip_code: string;
  students: ProcessedStudent[];
  guardians: ProcessedGuardian[];
}

interface ProcessedStudent {
  name: string;
  first_name: string;
  last_name: string;
  grade: string;
  class_name: string;
  date_of_birth?: string;
}

interface ProcessedGuardian {
  first_name: string;
  last_name: string;
  name: string;
  relationship: string;
  phone_primary: string;
  email?: string;
  is_primary_contact: boolean;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    studentsProcessed: number;
    familiesCreated: number;
    guardiansCreated: number;
    errors: string[];
  } | null>(null);

  const parseCSV = (csvText: string): CSVStudent[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const student: any = {};
      
      headers.forEach((header, index) => {
        if (header.includes('student') && header.includes('name')) {
          student.student_name = values[index];
        } else if (header.includes('teacher')) {
          student.teacher_name = values[index];
        } else if (header.includes('grade')) {
          student.grade = values[index];
        } else if (header.includes('class')) {
          student.class = values[index];
        } else if (header.includes('family') || header.includes('contact') || header.includes('parent')) {
          student.family_info = values[index];
        }
      });
      
      return student as CSVStudent;
    }).filter(student => student.student_name && student.student_name.trim());
  };

  const normalizeFamilies = (students: CSVStudent[]): ProcessedFamily[] => {
    const familyMap = new Map<string, ProcessedFamily>();
    
    students.forEach(csvStudent => {
      // Create family key from family info (phone/email) or student's last name
      const nameParts = csvStudent.student_name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      
      let familyKey = lastName.toLowerCase();
      let contactInfo = csvStudent.family_info || '';
      
      // Extract phone/email from family_info if available
      const phoneMatch = contactInfo.match(/(\d{3}[-.]?\d{3}[-.]?\d{4})/);
      const emailMatch = contactInfo.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      
      if (phoneMatch || emailMatch) {
        familyKey = (phoneMatch?.[0] || emailMatch?.[0] || lastName).toLowerCase();
      }
      
      if (!familyMap.has(familyKey)) {
        familyMap.set(familyKey, {
          family_name: `${lastName} Family`,
          primary_contact_name: contactInfo.split(/[,;]|phone|email/i)[0]?.trim() || `${lastName} Guardian`,
          primary_contact_phone: phoneMatch?.[0] || '',
          primary_contact_email: emailMatch?.[0] || '',
          students: []
        });
      }
      
      familyMap.get(familyKey)!.students.push({
        name: csvStudent.student_name,
        first_name: firstName,
        last_name: lastName,
        grade: csvStudent.grade || '',
        class_name: csvStudent.class || csvStudent.teacher_name || ''
      });
    });
    
    return Array.from(familyMap.values());
  };

  const importFamiliesAndStudents = async (families: ProcessedFamily[]) => {
    let studentsProcessed = 0;
    let familiesCreated = 0;
    let guardiansCreated = 0;
    const errors: string[] = [];
    
    for (const family of families) {
      try {
        // Create family
        const { data: familyData, error: familyError } = await supabase
          .from('families')
          .insert({
            family_name: family.family_name,
            primary_contact_name: family.primary_contact_name,
            primary_contact_phone: family.primary_contact_phone,
            primary_contact_email: family.primary_contact_email
          })
          .select()
          .single();
          
        if (familyError) throw familyError;
        familiesCreated++;
        
        // Create guardian
        if (family.primary_contact_name) {
          const { error: guardianError } = await supabase
            .from('guardians')
            .insert({
              family_id: familyData.id,
              first_name: family.primary_contact_name.split(' ')[0],
              last_name: family.primary_contact_name.split(' ').slice(1).join(' ') || family.primary_contact_name.split(' ')[0],
              name: family.primary_contact_name,
              relationship: 'Parent/Guardian',
              phone_primary: family.primary_contact_phone,
              email: family.primary_contact_email,
              is_primary_contact: true,
              communication_preference: family.primary_contact_email ? 'email' : 'phone'
            });
            
          if (guardianError) throw guardianError;
          guardiansCreated++;
        }
        
        // Create students
        for (const student of family.students) {
          const { error: studentError } = await supabase
            .from('students')
            .insert({
              family_id: familyData.id,
              name: student.name,
              first_name: student.first_name,
              last_name: student.last_name,
              grade: student.grade,
              class_name: student.class_name
            });
            
          if (studentError) throw studentError;
          studentsProcessed++;
        }
        
        setProgress((familiesCreated / families.length) * 100);
        
      } catch (error: any) {
        errors.push(`Family ${family.family_name}: ${error.message}`);
      }
    }
    
    return { studentsProcessed, familiesCreated, guardiansCreated, errors };
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResults(null);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file.",
        variant: "destructive"
      });
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setImporting(true);
    setProgress(0);
    
    try {
      const csvText = await file.text();
      const csvStudents = parseCSV(csvText);
      
      if (csvStudents.length === 0) {
        throw new Error('No valid student records found in CSV');
      }
      
      const families = normalizeFamilies(csvStudents);
      const results = await importFamiliesAndStudents(families);
      
      setResults(results);
      
      if (results.errors.length === 0) {
        toast({
          title: "Import successful!",
          description: `Imported ${results.studentsProcessed} students in ${results.familiesCreated} families.`
        });
        onImportComplete();
      } else {
        toast({
          title: "Import completed with errors",
          description: `${results.studentsProcessed} students imported, ${results.errors.length} errors.`,
          variant: "destructive"
        });
      }
      
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive"
      });
      setResults({ studentsProcessed: 0, familiesCreated: 0, guardiansCreated: 0, errors: [error.message] });
    } finally {
      setImporting(false);
    }
  };

  const resetModal = () => {
    setFile(null);
    setResults(null);
    setProgress(0);
    setImporting(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Student Data from CSV
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {!results && (
            <>
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Upload a CSV file with columns: student_name, teacher_name, grade, class, family_info
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="csv-file">CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={importing}
                />
              </div>
              
              {importing && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    Processing families and students... {Math.round(progress)}%
                  </p>
                </div>
              )}
            </>
          )}
          
          {results && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {results.errors.length === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                <h3 className="font-semibold">Import Results</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{results.studentsProcessed}</div>
                  <div className="text-sm text-muted-foreground">Students</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{results.familiesCreated}</div>
                  <div className="text-sm text-muted-foreground">Families</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">{results.guardiansCreated}</div>
                  <div className="text-sm text-muted-foreground">Guardians</div>
                </div>
              </div>
              
              {results.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-2">{results.errors.length} errors occurred:</div>
                    <ul className="list-disc list-inside text-sm">
                      {results.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {results.errors.length > 5 && (
                        <li>... and {results.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              {results ? 'Close' : 'Cancel'}
            </Button>
            {!results && (
              <Button 
                onClick={handleImport} 
                disabled={!file || importing}
              >
                {importing ? 'Importing...' : 'Import Data'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};