import { beforeEach, describe, expect, it } from 'vitest';
import { getConsent, MEASUREMENT_ID, setConsent, startAnalytics, track } from './analytics';
function commands() { return (window.dataLayer || []).map(value => Array.from(value as ArrayLike<unknown>)); }
beforeEach(() => {
  localStorage.clear(); setConsent('declined'); localStorage.clear();
  document.getElementById('adnex-google-tag')?.remove();
  delete window.gtag; delete window.dataLayer;
});
describe('Analytics consent and data boundaries', () => {
  it('does not load Google or queue events without consent', () => {
    startAnalytics(); track('inquiry_submitted');
    expect(getConsent()).toBeNull();
    expect(document.getElementById('adnex-google-tag')).toBeNull();
    expect(window.dataLayer).toBeUndefined();
  });
  it('keeps declined visits untracked', () => {
    setConsent('declined'); startAnalytics(); track('pilot_cta_clicked');
    expect(window.dataLayer).toBeUndefined();
    expect(document.getElementById('adnex-google-tag')).toBeNull();
  });
  it('loads once after acceptance and sends only named events', () => {
    setConsent('accepted'); startAnalytics();
    expect(document.querySelectorAll('#adnex-google-tag')).toHaveLength(1);
    expect((document.getElementById('adnex-google-tag') as HTMLScriptElement).src).toContain(MEASUREMENT_ID);
    expect(commands().filter(c => c[1] === 'page_view')).toHaveLength(1);
    track('inquiry_submitted');
    expect(commands().at(-1)).toEqual(['event', 'inquiry_submitted']);
    expect(commands()[0]).toEqual(['consent', 'default', {analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'}]);
  });
  it('stops events and deletes analytics cookies on withdrawal; permits later acceptance', () => {
    setConsent('accepted'); document.cookie = '_ga=test; path=/';
    const count = commands().length;
    setConsent('declined'); track('inquiry_submitted');
    expect(commands()).toHaveLength(count);
    expect(document.cookie).not.toContain('_ga=');
    expect((window as unknown as Record<string, unknown>)[`ga-disable-${MEASUREMENT_ID}`]).toBe(true);
    setConsent('accepted'); track('inquiry_submitted');
    expect((window as unknown as Record<string, unknown>)[`ga-disable-${MEASUREMENT_ID}`]).toBe(false);
    expect(commands().at(-1)).toEqual(['event', 'inquiry_submitted']);
  });
});
