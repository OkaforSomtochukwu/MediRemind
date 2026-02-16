import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseUrl.startsWith('http') || supabaseUrl === 'your-project-url') {
    throw new Error(
        'Invalid Supabase URL. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL is set to a valid Supabase URL.'
    );
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
    throw new Error(
        'Invalid Supabase Anon Key. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_ANON_KEY is set.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
