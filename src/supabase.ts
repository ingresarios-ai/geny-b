import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fduresfcgczpiijfzmeb.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkdXJlc2ZjZ2N6cGlpamZ6bWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NjMzMjIsImV4cCI6MjA5MTQzOTMyMn0.-5SeL78JrGCBaGKsfrph8NzZro-KF25nFXkJVJfXD6Q';

export const supabase = createClient(supabaseUrl, supabaseKey);
