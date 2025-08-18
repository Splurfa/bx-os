import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createDemoAccounts, importCSVData } from '@/lib/csvImport';
import { toast } from 'sonner';

export const SetupDatabase = () => {
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    try {
      // Create demo accounts
      toast.info('Creating demo accounts...');
      await createDemoAccounts();
      toast.success('Demo accounts created!');

      // Import CSV data
      toast.info('Importing student data...');
      await importCSVData();
      toast.success('Student data imported successfully!');

      toast.success('Database setup complete! You can now log in with:\n- admin@school.edu / password123\n- teacher@school.edu / password123');
    } catch (error) {
      console.error('Setup error:', error);
      toast.error('Setup failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Database Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Set up demo accounts and populate student data from CSV.
        </p>
        <Button 
          onClick={handleSetup} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Setting up...' : 'Setup Database'}
        </Button>
      </CardContent>
    </Card>
  );
};