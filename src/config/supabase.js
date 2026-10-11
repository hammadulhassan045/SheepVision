import {createClient} from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://eorjsklcnlkshsaurghn.supabase.co';
export const SUPABASE_ANON_KEY =
  'sb_publishable_vfEuHeqTxVUVMxhUZ0qKbQ_QDF2I70r';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export const isSupabaseConfigured =
  SUPABASE_URL !== 'YOUR_SUPABASE_URL' &&
  SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
