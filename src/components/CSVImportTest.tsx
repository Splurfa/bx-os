import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { importCSVData } from '@/lib/csvImport';
import { useToast } from '@/hooks/use-toast';

export const CSVImportTest = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleImport = async () => {
    setIsImporting(true);
    setResult(null);

    try {
      const data = await importCSVData();
      setResult(data);
      toast({
        title: "CSV Import Successful",
        description: `Imported ${data.message || 'complete dataset'}`,
      });
    } catch (error) {
      console.error('Import failed:', error);
      setResult({ error: error.message });
      toast({
        title: "CSV Import Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>CSV Import Test</CardTitle>
        <CardDescription>
          Import complete Hillel CSV dataset (691+ students)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleImport} 
          disabled={isImporting}
          className="w-full"
        >
          {isImporting ? 'Importing...' : 'Import Complete Dataset'}
        </Button>
        
        {result && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Result:</h4>
            <pre className="text-sm overflow-auto whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};