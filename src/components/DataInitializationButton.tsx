import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { importHistoricalData, generateCurrentYearData } from '@/lib/csvImport';
import { supabase } from '@/integrations/supabase/client';

export const DataInitializationButton = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const { toast } = useToast();

  const addProgress = (message: string) => {
    setProgress(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const initializeAllData = async () => {
    setIsInitializing(true);
    setProgress([]);
    addProgress('Starting complete data initialization...');

    try {
      // Step 1: Import historical CSV data (2024-2025)
      addProgress('Importing historical data from 2024-25...');
      try {
        const historicalResult = await importHistoricalData();
        addProgress(`✓ Historical data imported: ${historicalResult?.stats?.insertedIncidents || 0} incidents`);
      } catch (error) {
        addProgress(`⚠ Historical import failed: ${error.message}`);
      }

      // Step 2: Seed academic records
      addProgress('Seeding academic records...');
      try {
        const { data: academicResult, error: academicError } = await supabase.rpc('seed_academic_records');
        if (academicError) throw academicError;
        addProgress(`✓ Academic records seeded: ${academicResult || 0} records`);
      } catch (error) {
        addProgress(`⚠ Academic seeding failed: ${error.message}`);
      }

      // Step 3: Generate current year test data (2025-2026)
      addProgress('Generating current year test data...');
      try {
        const currentYearResult = await generateCurrentYearData();
        addProgress(`✓ Current year data generated: ${currentYearResult || 0} incidents`);
      } catch (error) {
        addProgress(`⚠ Current year generation failed: ${error.message}`);
      }

      // Step 4: Match students to historical data
      addProgress('Matching students to historical data...');
      try {
        const { data: matchResult, error: matchError } = await supabase.rpc('match_students_to_historical_data');
        if (matchError) throw matchError;
        addProgress(`✓ Student matching completed: ${matchResult || 0} matches`);
      } catch (error) {
        addProgress(`⚠ Student matching failed: ${error.message}`);
      }

      addProgress('✅ Data initialization complete!');
      toast({
        title: "Data Initialization Complete",
        description: "All reporting data has been initialized successfully",
      });

    } catch (error) {
      addProgress(`❌ Initialization failed: ${error.message}`);
      toast({
        title: "Initialization Failed",
        description: "Failed to initialize data. Check progress log for details.",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>BX-OS Data Initialization</CardTitle>
        <CardDescription>
          Initialize complete reporting system with historical and current year data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={initializeAllData} 
          disabled={isInitializing}
          className="w-full"
          size="lg"
        >
          {isInitializing ? 'Initializing...' : 'Initialize Complete Data System'}
        </Button>
        
        {progress.length > 0 && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Progress Log:</h4>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {progress.map((message, index) => (
                <div key={index} className="text-sm font-mono">
                  {message}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};