import { useEffect, useState } from 'react';
import { getConsent, setConsent, startAnalytics } from './analytics';
export default function AnalyticsConsent() {
  const [open, setOpen] = useState(() => !getConsent());
  useEffect(() => { startAnalytics(); }, []);
  function choose(choice: 'accepted' | 'declined') {
    const wasLoaded = !!document.getElementById('adnex-google-tag');
    setConsent(choice); setOpen(false);
    if (wasLoaded) window.location.reload();
  }
  return <><button type="button" className="privacy-settings" onClick={() => setOpen(true)}>Analytics preferences</button>
    <details className="privacy-notice"><summary>Privacy &amp; analytics</summary><p>When you send the contact form, your name, email, restaurant name, number of locations and message are emailed to adnex so we can reply. They are delivered through our email-sending provider and are not used for anything else. If you accept analytics, Google Analytics uses cookies to measure page visits and pilot actions. We never include your name, email or message in analytics events. Advertising storage and personalization are disabled. Your preference is saved in this browser; you can decline or withdraw it using Analytics preferences. Withdrawal stops future collection but does not erase previously collected data. Cloudflare serves this site and processes connection data to deliver and protect it. Fonts are served from this site; no third-party font requests are made.</p><p>Learn more about <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google’s privacy practices</a> and <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">Cloudflare’s privacy practices</a>.</p></details>
    {open && <section className="consent-banner" aria-label="Analytics preferences"><div><h2>A little insight. Your choice.</h2><p>Allow Google Analytics cookies to help us understand visits? What you type in the contact form is never included. You can change your choice in the footer.</p></div><div className="consent-actions"><button type="button" className="btn btn-ghost" onClick={() => choose('declined')}>Decline analytics</button><button type="button" className="btn btn-primary" onClick={() => choose('accepted')}>Accept analytics</button></div></section>}
  </>;
}
