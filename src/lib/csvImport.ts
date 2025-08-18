import { supabase } from '@/integrations/supabase/client';

// Demo account creation function for initial setup
export const createDemoAccounts = async () => {
  const { data, error } = await supabase.functions.invoke('create-demo-accounts');
  
  if (error) {
    throw new Error('Failed to create demo accounts: ' + error.message);
  }
  
  return data;
};

// Legacy function - CSV import is now handled via database migration
export const importCSVData = async () => {
  // CSV import is now handled automatically via database migration
  // This function is kept for compatibility but does nothing
  console.log('CSV import is handled via database migration - no action required');
  return { success: true, message: 'CSV data already imported via migration' };
};