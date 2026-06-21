import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  // Handle CORS preflight
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
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: token, password" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: "La contraseña debe tener al menos 8 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase admin client
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Look up the invitation
    const { data: invitation, error: lookupError } = await supabase
      .from("invitations")
      .select("*")
      .eq("token", token)
      .single();

    if (lookupError || !invitation) {
      return new Response(
        JSON.stringify({ error: "Token inválido o no encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already used
    if (invitation.used_at) {
      return new Response(
        JSON.stringify({ error: "Este enlace ya fue utilizado. Contacta a soporte si necesitas ayuda." }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Este enlace ha expirado. Solicita uno nuevo." }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === invitation.email.toLowerCase()
    );

    if (userExists) {
      // Mark invitation as used
      await supabase
        .from("invitations")
        .update({ used_at: new Date().toISOString() })
        .eq("id", invitation.id);

      return new Response(
        JSON.stringify({
          error: "Ya existe una cuenta con este correo. Intenta iniciar sesión.",
          code: "USER_EXISTS",
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create user in Supabase Auth
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: invitation.email,
      password: password,
      email_confirm: true, // Auto-confirm since they came via magic link
      user_metadata: {
        full_name: invitation.name,
      },
    });

    if (createError) {
      console.error("Create user error:", createError);
      return new Response(
        JSON.stringify({ error: "Error al crear la cuenta. Intenta de nuevo." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark invitation as used
    await supabase
      .from("invitations")
      .update({ used_at: new Date().toISOString() })
      .eq("id", invitation.id);

    // Create profile entry if profiles table exists
    try {
      await supabase.from("profiles").insert({
        id: newUser.user.id,
        email: invitation.email,
        name: invitation.name,
      });
    } catch (_e) {
      // Profile creation is optional - table may have different schema
      console.log("Profile creation skipped or failed (non-critical)");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Cuenta creada exitosamente",
        user_id: newUser.user.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Register error:", err);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
