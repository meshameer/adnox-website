export const MEASUREMENT_ID = 'G-6W7KE9Q1MC';
const KEY = 'adnex-analytics-consent-v1';
type Choice = 'accepted' | 'declined';
declare global { interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; } }
export function getConsent(): Choice | null {
  try { const value = localStorage.getItem(KEY); return value === 'accepted' || value === 'declined' ? value : null; } catch { return null; }
}
let allowed = false;
export function startAnalytics() {
  if (getConsent() !== 'accepted') return;
  allowed = true;
  (window as unknown as Record<string, unknown>)[`ga-disable-${MEASUREMENT_ID}`] = false;
  if (document.getElementById('adnex-google-tag')) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer!.push(arguments); };
  window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
    cookie_expires: 60 * 60 * 24 * 180,
    page_location: window.location.origin + window.location.pathname,
    page_referrer: '',
  });
  window.gtag('event', 'page_view', { page_location: window.location.origin + window.location.pathname, page_title: document.title, page_referrer: '' });
  const script = document.createElement('script');
  script.id = 'adnex-google-tag'; script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
}
export function setConsent(choice: Choice) {
  try { localStorage.setItem(KEY, choice); } catch { /* Fail closed if consent cannot be saved. */ }
  if (choice === 'accepted') {
    // No tracking if a browser blocks preference storage.
    if (getConsent() !== 'accepted') return;
    startAnalytics();
  } else {
    allowed = false;
    (window as unknown as Record<string, unknown>)[`ga-disable-${MEASUREMENT_ID}`] = true;
    const host = window.location.hostname.split('.');
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.trim().split('=')[0];
      if (!/^_ga(?:_|$)/.test(name)) continue;
      document.cookie = `${name}=; Max-Age=0; path=/`;
      for (let i = 0; i < host.length - 1; i++) {
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${host.slice(i).join('.')}`;
      }
    }
  }
}
export function track(event: 'pilot_cta_clicked' | 'inquiry_submitted') {
  if (allowed && getConsent() === 'accepted') window.gtag?.('event', event);
}
