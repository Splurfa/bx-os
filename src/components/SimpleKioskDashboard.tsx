import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface KioskData {
  id: number;
  name: string;
  is_active: boolean;
  activated_at: string | null;
  activated_by: string | null;
}

const SimpleKioskDashboard = () => {
  const [kiosks, setKiosks] = useState<KioskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchKiosks = async () => {
    setLoading(true);
    try {
      console.log('=== FETCHING KIOSKS ===');
      
      const { data, error } = await supabase
        .from('kiosks')
        .select('*')
        .order('id');

      console.log('Kiosks data:', { data, error });

      if (error) {
        console.error('Error fetching kiosks:', error);
      } else {
        setKiosks(data || []);
        setLastRefresh(new Date());
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKiosks();

    // Set up real-time subscription
    const channel = supabase
      .channel('simple-kiosk-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kiosks'
        },
        (payload) => {
          console.log('Real-time kiosk change:', payload);
          fetchKiosks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Simple Kiosk Dashboard</h1>
        <div className="space-x-2">
          <Button onClick={fetchKiosks} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Last refresh: {lastRefresh.toLocaleTimeString()}
      </div>

      <div className="grid gap-4">
        {kiosks.map((kiosk) => (
          <Card key={kiosk.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Kiosk {kiosk.id}: {kiosk.name}</CardTitle>
                <Badge variant={kiosk.is_active ? "default" : "secondary"}>
                  {kiosk.is_active ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Status:</strong> {kiosk.is_active ? 'Active' : 'Inactive'}</p>
                {kiosk.activated_at && (
                  <p><strong>Activated:</strong> {new Date(kiosk.activated_at).toLocaleString()}</p>
                )}
                {kiosk.activated_by && (
                  <p><strong>Activated by:</strong> {kiosk.activated_by}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {kiosks.length === 0 && !loading && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No kiosks found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimpleKioskDashboard;