import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_API_KEY = Deno.env.get("WEBHOOK_API_KEY")!;
const APP_URL = Deno.env.get("APP_URL") || "https://genyapp.ingresarios.ai";
const GHL_API_KEY = Deno.env.get("GHL_API_KEY")!;

const GHL_API_BASE = "https://services.leadconnectorhq.com";

async function updateGHLContact(contactId: string, magicLink: string): Promise<void> {
  try {
    const res = await fetch(`${GHL_API_BASE}/contacts/${contactId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${GHL_API_KEY}`,
        "Content-Type": "application/json",
        "Version": "2021-07-28",
      },
      body: JSON.stringify({
        customFields: [
          {
            key: "webhook_magic_link_geny_b",
            field_value: magicLink,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`GHL update failed (${res.status}):`, errorBody);
    } else {
      console.log("GHL contact updated successfully with magic link");
    }
  } catch (err) {
    console.error("GHL API error:", err);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Validate API key
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey || apiKey !== WEBHOOK_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { name, email, contact_id } = body;

    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

    // Invalidate existing unused invitations for this email
    const { data: existing } = await supabase
      .from("invitations")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from("invitations")
        .update({ used_at: new Date().toISOString() })
        .eq("id", existing[0].id);
    }

    // Insert new invitation
    const { error: insertError } = await supabase
      .from("invitations")
      .insert({
        token,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create invitation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const magicLink = `${APP_URL}/registro?token=${token}`;

    // Update GHL contact with magic link if contact_id is provided
    if (contact_id) {
      await updateGHLContact(contact_id, magicLink);
    } else {
      console.warn("No contact_id provided — skipping GHL update");
    }

    return new Response(
      JSON.stringify({
        success: true,
        magic_link: magicLink,
        expires_at: expiresAt,
        ghl_updated: !!contact_id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
