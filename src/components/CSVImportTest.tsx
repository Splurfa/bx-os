import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { importHistoricalData, generateCurrentYearData } from '@/lib/csvImport';
import { useToast } from '@/hooks/use-toast';

export const CSVImportTest = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleImportHistorical = async () => {
    setIsImporting(true);
    setResult(null);

    try {
      const data = await importHistoricalData();
      setResult(data);
      toast({
        title: "Historical Data Import Successful",
        description: `Imported ${data?.stats?.insertedIncidents || 0} historical incidents from 2024-25`,
      });
    } catch (error) {
      console.error('Historical import failed:', error);
      setResult({ error: error.message });
      toast({
        title: "Historical Import Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleGenerateCurrentYear = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      const data = await generateCurrentYearData();
      setResult({ incidents_generated: data });
      toast({
        title: "Current Year Data Generated",
        description: `Generated ${data || 0} incidents for 2025-26 school year`,
      });
    } catch (error) {
      console.error('Current year generation failed:', error);
      setResult({ error: error.message });
      toast({
        title: "Data Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>BX-OS Data Management</CardTitle>
        <CardDescription>
          Import historical data (2024-25) and generate current year test data (2025-26)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <Button 
            onClick={handleImportHistorical} 
            disabled={isImporting || isGenerating}
            className="w-full"
            variant="default"
          >
            {isImporting ? 'Importing...' : 'Import Historical Data (2024-25)'}
          </Button>
          
          <Button 
            onClick={handleGenerateCurrentYear} 
            disabled={isImporting || isGenerating}
            className="w-full"
            variant="outline"
          >
            {isGenerating ? 'Generating...' : 'Generate Current Year Test Data (2025-26)'}
          </Button>
        </div>
        
        {result && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Result:</h4>
            <pre className="text-sm overflow-auto whitespace-pre-wrap max-h-64">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};