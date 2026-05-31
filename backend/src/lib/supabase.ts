import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL is missing from environment");
}
if (!supabaseKey) {
  throw new Error("SUPABASE_SERVICE_KEY is missing from environment");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    // ws transport required on Node < 22
    transport: ws as never,
  },
});
