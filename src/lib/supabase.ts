
import { createClient } from '@supabase/supabase-js';

// Note: These would normally come from environment variables
// For now, using placeholder values - user should replace with actual Supabase credentials
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
