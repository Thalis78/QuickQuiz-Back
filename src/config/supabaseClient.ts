import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ SUPABASE_URL e SUPABASE_ANON_KEY devem estar definidas no .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('✅ Supabase conectado:', supabaseUrl);
