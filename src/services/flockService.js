import {supabase, isSupabaseConfigured} from '../config/supabase';

export const getFlocksByFarm = async farmId => {
  if (!isSupabaseConfigured) return [];

  const {data, error} = await supabase
    .from('flocks')
    .select('*')
    .eq('farm_id', farmId);
  if (error) throw error;
  return data || [];
};

export const createFlock = async ({farmId, name, purpose}) => {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Add your credentials in src/config/supabase.js.',
    );
  }

  const {data, error} = await supabase
    .from('flocks')
    .insert([
      {
        farm_id: farmId,
        name,
        purpose,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};
