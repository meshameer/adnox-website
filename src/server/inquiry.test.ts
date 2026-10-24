import { describe, expect, it, vi } from 'vitest';
import { handleInquiry } from './inquiry';

const ORIGIN = 'https://adnex.net';
const env = { RESEND_API_KEY: 'test-key', INQUIRY_TO: 'inbox@example.com', INQUIRY_FROM: 'adnex <onboarding@resend.dev>' };
const valid = { name: 'Alex', email: 'alex@example.com', restaurant: 'The Daily Table', locations: '2–5 locations', message: 'Hello\nthere', website: '' };

function req(body: unknown, init: { origin?: string | null; method?: string; type?: string } = {}) {
  const headers = new Headers({ 'Content-Type': init.type ?? 'application/json' });
  if (init.origin !== null) headers.set('Origin', init.origin ?? ORIGIN);
  return new Request(`${ORIGIN}/api/inquiry`, { method: init.method ?? 'POST', headers, body: init.method === 'GET' ? undefined : typeof body === 'string' ? body : JSON.stringify(body) });
}
const okFetch = () => vi.fn(async () => new Response('{}', { status: 200 })) as unknown as typeof fetch & ReturnType<typeof vi.fn>;

describe('POST /api/inquiry', () => {
  it('emails a valid enquiry with reply-to set to the sender', async () => {
    const f = okFetch();
    const res = await handleInquiry(req(valid), env, f);
    expect(res.status).toBe(202);
    expect(f).toHaveBeenCalledTimes(1);
    const [url, init] = (f as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    const sent = JSON.parse(String(init.body));
    expect(sent.to).toEqual(['inbox@example.com']);
    expect(sent.reply_to).toBe('alex@example.com');
    expect(sent.subject).toBe('adnex enquiry — The Daily Table');
    expect(sent.text).toContain('Locations: 2–5 locations');
    expect(sent.text).toContain('Hello\nthere');
  });
  it('rejects missing or invalid fields without sending', async () => {
    const f = okFetch();
    const res = await handleInquiry(req({ ...valid, name: ' ', email: 'nope' }), env, f);
    expect(res.status).toBe(400);
    expect((await res.json()).fields).toEqual(['name', 'email']);
    expect(f).not.toHaveBeenCalled();
  });
  it('silently drops honeypot submissions', async () => {
    const f = okFetch();
    const res = await handleInquiry(req({ ...valid, website: 'spam.example' }), env, f);
    expect(res.status).toBe(200);
    expect(f).not.toHaveBeenCalled();
  });
  it('refuses cross-site, non-JSON, oversized and non-POST requests', async () => {
    const f = okFetch();
    expect((await handleInquiry(req(valid, { origin: 'https://evil.example' }), env, f)).status).toBe(403);
    expect((await handleInquiry(req(valid, { origin: null }), env, f)).status).toBe(403);
    expect((await handleInquiry(req('name=x', { type: 'application/x-www-form-urlencoded' }), env, f)).status).toBe(415);
    expect((await handleInquiry(req({ ...valid, message: 'x'.repeat(20_000) }), env, f)).status).toBe(413);
    expect((await handleInquiry(req(null, { method: 'GET' }), env, f)).status).toBe(405);
    expect(f).not.toHaveBeenCalled();
  });
  it('strips header-breaking characters from single-line fields', async () => {
    const f = okFetch();
    await handleInquiry(req({ ...valid, restaurant: 'Cafe\r\nBcc: x@y.z' }), env, f);
    const sent = JSON.parse(String((f as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0][1].body));
    expect(sent.subject).not.toMatch(/[\r\n]/);
  });
  it('reports misconfiguration and provider failures instead of claiming success', async () => {
    expect((await handleInquiry(req(valid), {}, okFetch())).status).toBe(503);
    const failing = vi.fn(async () => new Response('bad', { status: 422 })) as unknown as typeof fetch;
    expect((await handleInquiry(req(valid), env, failing)).status).toBe(502);
    const down = vi.fn(async () => { throw new Error('offline'); }) as unknown as typeof fetch;
    expect((await handleInquiry(req(valid), env, down)).status).toBe(502);
  });
});
