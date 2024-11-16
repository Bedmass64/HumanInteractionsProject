import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oxjqldoghtqrhxykpjmj.supabase.co'; // Replace with your Supabase URL
const supabaseKey = '<eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94anFsZG9naHRxcmh4eWtwam1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk1MDczNzEsImV4cCI6MjA0NTA4MzM3MX0.s-uwrca4Y0UnrBEavhXigPcQLP9RIKJGPW0b1HQI57Y>'; // Replace with your Supabase anon key
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
