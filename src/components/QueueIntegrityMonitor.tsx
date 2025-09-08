import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IntegrityIssue {
  issue_type: string;
  kiosk_id: number;
  student_id: string;
  behavior_request_id: string;
  details: string;
}

interface RepairSuggestion {
  repair_type: string;
  kiosk_id: number;
  behavior_request_id: string;
  suggested_action: string;
}

export const QueueIntegrityMonitor: React.FC = () => {
  const [issues, setIssues] = useState<IntegrityIssue[]>([]);
  const [suggestions, setSuggestions] = useState<RepairSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const { toast } = useToast();

  const checkIntegrity = async () => {
    setLoading(true);
    try {
      const { data: integrityData, error: integrityError } = await supabase.rpc('check_queue_integrity');
      if (integrityError) throw integrityError;

      const { data: suggestionsData, error: suggestionsError } = await supabase.rpc('get_queue_repair_suggestions');
      if (suggestionsError) throw suggestionsError;

      setIssues(integrityData || []);
      setSuggestions(suggestionsData || []);
    } catch (error) {
      console.error('Error checking integrity:', error);
      toast({
        title: "Error",
        description: "Failed to check queue integrity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const repairIssues = async () => {
    setRepairing(true);
    try {
      let repairsApplied = 0;

      // Apply repairs based on suggestions
      for (const suggestion of suggestions) {
        if (suggestion.repair_type === 'clear_orphaned_kiosk') {
          // Clear orphaned kiosk assignment
          const { error } = await supabase.rpc('update_student_kiosk_status_atomic', {
            p_kiosk_id: suggestion.kiosk_id,
            p_student_id: null,
            p_behavior_request_id: null
          });
          if (error) throw error;
          repairsApplied++;
        } else if (suggestion.repair_type === 'reset_orphaned_request') {
          // Reset orphaned behavior request
          const { error } = await supabase
            .from('behavior_requests')
            .update({ 
              status: 'waiting', 
              assigned_kiosk: null 
            })
            .eq('id', suggestion.behavior_request_id);
          if (error) throw error;
          repairsApplied++;
        }
      }

      // Trigger reassignment after repairs
      if (repairsApplied > 0) {
        await supabase.rpc('reassign_waiting_students');
      }

      toast({
        title: "Repairs Applied",
        description: `Successfully applied ${repairsApplied} repairs.`,
      });

      // Recheck integrity
      await checkIntegrity();
    } catch (error) {
      console.error('Error applying repairs:', error);
      toast({
        title: "Error",
        description: "Failed to apply some repairs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRepairing(false);
    }
  };

  useEffect(() => {
    checkIntegrity();
  }, []);

  const getIssueTypeColor = (type: string) => {
    switch (type) {
      case 'kiosk_orphaned_assignment':
        return 'destructive';
      case 'behavior_request_orphaned':
        return 'destructive';
      case 'duplicate_student_assignments':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getIssueTypeLabel = (type: string) => {
    switch (type) {
      case 'kiosk_orphaned_assignment':
        return 'Orphaned Kiosk';
      case 'behavior_request_orphaned':
        return 'Orphaned Request';
      case 'duplicate_student_assignments':
        return 'Duplicate Assignment';
      default:
        return type;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Queue Integrity Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={checkIntegrity} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Check Integrity
          </Button>
          {suggestions.length > 0 && (
            <Button 
              onClick={repairIssues} 
              disabled={repairing}
              variant="default"
              size="sm"
            >
              Apply Repairs ({suggestions.length})
            </Button>
          )}
        </div>

        {issues.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No integrity issues detected. Queue is functioning properly.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Found {issues.length} integrity issue(s) that need attention.
              </AlertDescription>
            </Alert>

            {issues.map((issue, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={getIssueTypeColor(issue.issue_type)}>
                    {getIssueTypeLabel(issue.issue_type)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Kiosk {issue.kiosk_id}
                  </span>
                </div>
                <p className="text-sm">{issue.details}</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Request ID: {issue.behavior_request_id}</div>
                  <div>Student ID: {issue.student_id}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Suggested Repairs:</h4>
            {suggestions.map((suggestion, index) => (
              <div key={index} className="text-sm bg-muted p-2 rounded">
                {suggestion.suggested_action}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};