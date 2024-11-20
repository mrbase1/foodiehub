import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = 'https://mqyaetbdxzbkjlcqlyxd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeWFldGJkeHpia2psY3FseXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwOTk4NzksImV4cCI6MjA0NzY3NTg3OX0.lyu8Ft_l8l4hLzccRHAKT_aOqxIEArbLvTkadOvto-Y';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);