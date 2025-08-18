import { supabase } from '@/integrations/supabase/client';

// Complete CSV import function that processes all 691+ students
export const importCSVData = async () => {
  try {
    console.log('Starting complete CSV import...');
    
    const { data, error } = await supabase.functions.invoke('import-csv');
    
    if (error) {
      console.error('CSV import error:', error);
      throw new Error('Failed to import CSV data: ' + error.message);
    }
    
    console.log('CSV import completed:', data);
    return data;
  } catch (error) {
    console.error('CSV import failed:', error);
    throw error;
  }
};

// Demo account creation function for initial setup
export const createDemoAccounts = async () => {
  const { data, error } = await supabase.functions.invoke('create-demo-accounts');
  
  if (error) {
    throw new Error('Failed to create demo accounts: ' + error.message);
  }
  
  return data;
};