import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey
);

export const supabaseAnon = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey
);
