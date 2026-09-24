import { createClient } from "jsr:@supabase/supabase-js@2"

// The newsletter sign-up is deliberately public — a visitor subscribes to the
// daily card before they have any account. That means no Auth0 token to check
// here, so the defences are: a strict email shape, a honeypot for naive bots,
// and a unique constraint on email that turns a resubmission into an update
// instead of a duplicate row. Writes go through the service role because
// `leads` has RLS on with no policies.
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

// Deliberately plain: enough to reject typos and junk, without pretending to
// validate deliverability, which only a real send can prove.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const LANGUAGES = new Set(["pt", "en"])

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

  const b = body as Record<string, unknown>

  // A field no human sees, so anything filling it is automated. Answered with
  // the same success shape a real sign-up gets, to avoid teaching bots the tell.
  if (typeof b.company === "string" && b.company.trim() !== "") {
    return json({ ok: true })
  }

  // LGPD Art. 8º: consent has to be evidenced, not implied by submitting a
  // form. The checkbox is enforced here, not just hidden in the UI — a
  // request that skips it is rejected outright rather than silently accepted.
  if (b.consent !== true) {
    return json({ error: "consent_required" }, 400)
  }

  // Stored lowercase so the unique constraint is effectively case-insensitive.
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : ""
  if (!EMAIL.test(email) || email.length > 320) {
    return json({ error: "invalid_email" }, 400)
  }

  const rawName = typeof b.name === "string" ? b.name.trim() : ""
  const name = rawName === "" ? null : rawName.slice(0, 120)
  const language = typeof b.language === "string" && LANGUAGES.has(b.language) ? b.language : "pt"
  const source = typeof b.source === "string" && b.source.trim() !== ""
    ? b.source.trim().slice(0, 60)
    : "newsletter"

  // Resubscribing after an unsubscribe has to bring the lead back, and a
  // second sign-up must not create a twin — hence the explicit conflict target.
  // consented_at is refreshed on every accepted submission, so it always
  // reflects the most recent consent, including a resubscribe after opting out.
  const { error } = await supabase
    .from("leads")
    .upsert(
      {
        email,
        name,
        language,
        source,
        status: "subscribed",
        consented_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email", ignoreDuplicates: false },
    )

  if (error) {
    console.error("leads upsert failed", error)
    return json({ error: "db" }, 500)
  }

  return json({ ok: true }, 201)
})
