import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zxwmnglrhbockrtopfad.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4d21uZ2xyaGJvY2tydG9wZmFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MDcyOTksImV4cCI6MjEwNzM4MzI5OX0.tppOHrpl2dGYnk9jsc-_lGecNRuxdwVAreLHS3yZnt0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
