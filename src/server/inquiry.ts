/**
 * Contact-form handler used by the Cloudflare Pages Function at /api/inquiry.
 * Kept free of Cloudflare-specific types so it can be unit-tested with Vitest.
 *
 * Required environment variables (set in Cloudflare Pages → Settings → Variables and secrets):
 *   RESEND_API_KEY  — secret API key from https://resend.com
 *   INQUIRY_TO      — inbox that receives enquiries
 *   INQUIRY_FROM    — sender, e.g. "adnex website <onboarding@resend.dev>" until adnex.net is verified in Resend
 */
export interface InquiryEnv {
  RESEND_API_KEY?: string;
  INQUIRY_TO?: string;
  INQUIRY_FROM?: string;
}

export const LOCATIONS = ['1 location', '2–5 locations', '6–20 locations', '21+ locations'] as const;
const MAX_BODY_BYTES = 10_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Fetch = typeof fetch;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

/** Single line, no control characters, trimmed and capped. */
const clean = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max) : '';

/** Multi-line text: keep newlines, drop other control characters. */
const cleanText = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]+/g, ' ').trim().slice(0, max) : '';

export async function handleInquiry(request: Request, env: InquiryEnv, fetchImpl: Fetch = fetch): Promise<Response> {
  if (request.method !== 'POST') return json(405, { ok: false, error: 'method_not_allowed' });

  // Only accept submissions made from this site's own pages.
  const origin = request.headers.get('Origin');
  if (!origin || origin !== new URL(request.url).origin) return json(403, { ok: false, error: 'forbidden' });

  if (!(request.headers.get('Content-Type') || '').includes('application/json')) {
    return json(415, { ok: false, error: 'unsupported_media_type' });
  }
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return json(413, { ok: false, error: 'too_large' });

  let data: Record<string, unknown>;
  try { data = JSON.parse(raw); } catch { return json(400, { ok: false, error: 'invalid_json' }); }
  if (!data || typeof data !== 'object') return json(400, { ok: false, error: 'invalid_json' });

  // Honeypot: bots fill the hidden field. Pretend success and send nothing.
  if (clean(data.website, 200)) return json(200, { ok: true });

  const name = clean(data.name, 100);
  const email = clean(data.email, 200);
  const restaurant = clean(data.restaurant, 150);
  const locations = (LOCATIONS as readonly string[]).includes(clean(data.locations, 40)) ? clean(data.locations, 40) : LOCATIONS[0];
  const message = cleanText(data.message, 2000);

  const fields: string[] = [];
  if (!name) fields.push('name');
  if (!EMAIL_RE.test(email)) fields.push('email');
  if (!restaurant) fields.push('restaurant');
  if (fields.length) return json(400, { ok: false, error: 'invalid_fields', fields });

  if (!env.RESEND_API_KEY || !env.INQUIRY_TO || !env.INQUIRY_FROM) {
    console.error('inquiry: email delivery is not configured (RESEND_API_KEY, INQUIRY_TO, INQUIRY_FROM)');
    return json(503, { ok: false, error: 'not_configured' });
  }

  const text = [
    'New enquiry from adnex.net',
    '',
    `Name: ${name}`,
    `Work email: ${email}`,
    `Restaurant: ${restaurant}`,
    `Locations: ${locations}`,
    '',
    'Message:',
    message || '—',
  ].join('\n');

  try {
    const res = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.INQUIRY_FROM,
        to: [env.INQUIRY_TO],
        reply_to: email,
        subject: `adnex enquiry — ${restaurant}`,
        text,
      }),
    });
    if (!res.ok) {
      console.error('inquiry: email provider rejected the message', res.status);
      return json(502, { ok: false, error: 'delivery_failed' });
    }
  } catch (err) {
    console.error('inquiry: email provider unreachable', err);
    return json(502, { ok: false, error: 'delivery_failed' });
  }
  return json(202, { ok: true });
}
