import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://vvexrpfbycsljunysjxh.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2ZXhycGZieWNzbGp1bnlzanhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzMwMTIsImV4cCI6MjA3Nzc0OTAxMn0.SgyyyfZpq_60icnH9ZbE2lquQElNtVHhN8kNLXV5AHA";

export const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("Supabase client OK:", db);
