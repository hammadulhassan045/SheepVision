import {supabase, isSupabaseConfigured} from '../config/supabase';

export const getFarmsForUser = async userId => {
  if (!isSupabaseConfigured) return [];

  const {data, error} = await supabase
    .from('farms')
    .select('farm_id, farm_name, address, district, province, country')
    .eq('owner_id', userId);
  if (error) throw error;

  return data || [];
};

export const createFarm = async ({
  name,
  address,
  district,
  province,
  country,
  ownerId,
}) => {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Add your credentials in src/config/supabase.js.',
    );
  }

  const {data, error} = await supabase
    .from('farms')
    .insert([
      {
        farm_name: name,
        address,
        district,
        province,
        country,
        owner_id: ownerId,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
};

export const getFarmUsers = async farmId => {
  if (!isSupabaseConfigured) return [];

  const {data, error} = await supabase
    .from('farm_users')
    .select('*')
    .eq('farm_id', farmId);

  if (error) throw error;
  return data || [];
};

export const addFarmUser = async ({farmId, name, role}) => {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Add your credentials in src/config/supabase.js.',
    );
  }

  const {data, error} = await supabase
    .from('farm_users')
    .insert([
      {
        farm_id: farmId,
        role,
        name,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};
