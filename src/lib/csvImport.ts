import { supabase } from '@/integrations/supabase/client';

// Import historical CSV data from 2024-2025
export const importHistoricalData = async () => {
  try {
    console.log('Starting historical data import...');
    
    const { data, error } = await supabase.functions.invoke('import-historical-csv');
    
    if (error) {
      console.error('Historical import error:', error);
      throw new Error('Failed to import historical data: ' + error.message);
    }
    
    console.log('Historical import completed:', data);
    return data;
  } catch (error) {
    console.error('Historical import failed:', error);
    throw error;
  }
};

// Generate current year test data (2025-2026)
export const generateCurrentYearData = async () => {
  try {
    console.log('Generating current year test data...');
    
    const { data, error } = await supabase.rpc('seed_current_year_behavior_data');
    
    if (error) {
      console.error('Current year data generation error:', error);
      throw new Error('Failed to generate current year data: ' + error.message);
    }
    
    console.log('Generated incidents:', data);
    return data;
  } catch (error) {
    console.error('Current year data generation failed:', error);
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