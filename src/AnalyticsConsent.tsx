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
  return <><button className="privacy-settings" onClick={() => setOpen(true)}>Analytics preferences</button>
    <details className="privacy-notice"><summary>Privacy & analytics</summary><p>Your uploaded images and inquiry entries stay in your browser; the draft download does not submit a lead. If you accept analytics, Google Analytics uses cookies to measure page visits and demo/pilot actions. We do not include your name, email, notes, images or filenames in our analytics events. Advertising storage and personalization are disabled. Your preference is saved in this browser; you can decline or withdraw it using Analytics preferences. Withdrawal stops future collection but does not erase previously collected data. Cloudflare serves this site and processes connection data to deliver and protect it. Fonts are loaded from Google Fonts.</p><p>Learn more about <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google’s privacy practices</a> and <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">Cloudflare’s privacy practices</a>.</p></details>
    {open && <section className="consent-banner" aria-label="Analytics preferences"><div><h2>A little insight. Your choice.</h2><p>Allow Google Analytics cookies to help us understand visits and demo usage? Your form entries and uploaded images are not included. You can change your choice in the footer.</p></div><div className="consent-actions"><button className="button" onClick={() => choose('declined')}>Decline analytics</button><button className="button blue" onClick={() => choose('accepted')}>Accept analytics</button></div></section>}
  </>;
}
