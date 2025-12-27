// deno-lint-ignore-file no-explicit-any
// Edge function for portal login using username/password for staff and students

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ success: false, message: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { username, password, userType } = await req.json();

    if (!username || !password || !userType) {
      return new Response(JSON.stringify({ success: false, message: "Missing credentials" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // NOTE: For simplicity, compare plain text password to stored value in portal_users

    const { data: user, error } = await supabase
      .from("portal_users")
      .select("id, username, full_name, email, department, user_type, is_active, password_hash")
      .eq("username", username)
      .eq("user_type", userType)
      .maybeSingle();

    if (error) {
      console.error("Error querying portal_users:", error);
      return new Response(JSON.stringify({ success: false, message: "Login failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!user) {
      return new Response(JSON.stringify({ success: false, message: "Invalid username or password" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!user.is_active) {
      return new Response(JSON.stringify({ success: false, message: "Account is inactive" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!user.password_hash || user.password_hash !== password) {
      return new Response(JSON.stringify({ success: false, message: "Invalid username or password" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const safeUser = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      department: user.department,
      user_type: user.user_type,
    };

    return new Response(JSON.stringify({ success: true, user: safeUser }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("Unexpected error in portal-login:", err);
    return new Response(JSON.stringify({ success: false, message: "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
