import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Usar any para evitar problemas de tipos cuando no hay conexion configurada
export const supabase: any = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true },
  db: { schema: 'public' },
});

export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('usuarios').select('count', { count: 'exact', head: true });
    return !error;
  } catch {
    return false;
  }
};
