import { createClient } from "jsr:@supabase/supabase-js@2"

// LGPD Art. 18, IX / Marco Civil: revoking consent has to be as easy as
// giving it. This endpoint is reached by the unsubscribe link in every
// newsletter email (`?token=` -> the lead's own unsubscribe_token, never
// their id or email), so no login and no email confirmation step stands
// between a subscriber and opting out.
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405)
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return json({ error: "bad_json" }, 400)
  }

  const token = typeof (body as Record<string, unknown>).token === "string"
    ? (body as Record<string, unknown>).token as string
    : ""
  if (!token) return json({ error: "missing_token" }, 400)

  const { data, error } = await supabase
    .from("leads")
    .update({ status: "unsubscribed", updated_at: new Date().toISOString() })
    .eq("unsubscribe_token", token)
    .select("id")
    .maybeSingle()

  if (error) {
    console.error("unsubscribe failed", error)
    return json({ error: "db" }, 500)
  }
  // Idempotent: a token that's already unsubscribed, or double-clicked, still
  // reads as success — only a token that never matched any lead is a real 404.
  if (!data) return json({ error: "not_found" }, 404)

  return json({ ok: true })
})
