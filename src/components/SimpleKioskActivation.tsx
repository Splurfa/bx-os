import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const SimpleKioskActivation = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const { user } = useAuth();

  const testDatabaseWrite = async () => {
    setLoading(true);
    setStatus('Testing database connection...');
    
    try {
      console.log('=== SIMPLE KIOSK ACTIVATION TEST ===');
      console.log('User:', user);
      console.log('Attempting direct database write...');

      // Direct, simple database write - activate kiosk ID 1
      const { data, error } = await supabase
        .from('kiosks')
        .update({ 
          is_active: true,
          activated_at: new Date().toISOString(),
          activated_by: user?.id 
        })
        .eq('id', 1)
        .select();

      console.log('Database response:', { data, error });

      if (error) {
        setStatus(`❌ Database Error: ${error.message}`);
        console.error('Database error:', error);
      } else {
        setStatus(`✅ Success! Kiosk activated: ${JSON.stringify(data)}`);
        console.log('Success:', data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setStatus(`❌ Unexpected error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const deactivateKiosk = async () => {
    setLoading(true);
    setStatus('Deactivating kiosk...');
    
    try {
      const { data, error } = await supabase
        .from('kiosks')
        .update({ 
          is_active: false,
          activated_at: null,
          activated_by: null 
        })
        .eq('id', 1)
        .select();

      if (error) {
        setStatus(`❌ Deactivate Error: ${error.message}`);
      } else {
        setStatus(`✅ Kiosk deactivated: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      setStatus(`❌ Unexpected error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Simple Kiosk Activation Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button 
              onClick={testDatabaseWrite} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Activate Kiosk 1'}
            </Button>
            
            <Button 
              onClick={deactivateKiosk} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Deactivate Kiosk 1
            </Button>
          </div>

          {status && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-mono whitespace-pre-wrap">{status}</p>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p>User: {user?.email || 'Not logged in'}</p>
            <p>User ID: {user?.id || 'None'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleKioskActivation;