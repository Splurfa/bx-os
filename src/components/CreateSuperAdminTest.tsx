import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, CheckCircle } from 'lucide-react';

const CreateSuperAdminTest = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const { toast } = useToast();

  const createTestSuperAdmin = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-super-admin-test', {});

      if (error) {
        throw error;
      }

      if (data.success) {
        setIsCreated(true);
        toast({
          title: "Success!",
          description: "Test super admin account created successfully",
        });
      } else {
        throw new Error(data.error || 'Failed to create test super admin');
      }
    } catch (error) {
      console.error('Error creating test super admin:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create test super admin account',
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (isCreated) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Super Admin Created!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Test Credentials:</p>
            <p className="text-sm"><strong>Email:</strong> superadmin@school.edu</p>
            <p className="text-sm"><strong>Password:</strong> password123</p>
          </div>
          <p className="text-sm text-muted-foreground">
            You can now sign out and log in with these credentials to test super admin features.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Test Super Admin</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This will create a test super admin account with the credentials:
        </p>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm"><strong>Email:</strong> superadmin@school.edu</p>
          <p className="text-sm"><strong>Password:</strong> password123</p>
        </div>
        <Button 
          onClick={createTestSuperAdmin} 
          disabled={isCreating}
          className="w-full"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {isCreating ? 'Creating...' : 'Create Test Super Admin'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CreateSuperAdminTest;