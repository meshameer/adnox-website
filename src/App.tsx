import React, { useEffect, useRef, useState } from 'react';
import './styles.css';
import AnalyticsConsent from './AnalyticsConsent';
import { track } from './analytics';

const NAV: [string, string][] = [
  ['Home', '#top'],
  ['Experience', '#experience'],
  ['Reliability', '#reliability'],
  ['Approach', '#approach'],
  ['Contact', '#contact'],
];

const Logo = ({ large = false }: { large?: boolean }) => (
  <a className={large ? 'logo logo-lg' : 'logo'} href="#top" aria-label="adnex, home">
    adne
    <svg viewBox="2.8 2.8 18.4 18.4" aria-hidden="true">
      <path className="x1" d="M5 5L19 19" strokeWidth="4.4" strokeLinecap="round" fill="none" />
      <path className="x2" d="M19 5L5 19" strokeWidth="4.4" strokeLinecap="round" fill="none" />
    </svg>
  </a>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const Tick = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
);

const CloudIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18a4 4 0 0 1-1.1-7.85A5 5 0 0 1 15.5 8 4.5 4.5 0 0 1 17 17H7z" /></svg>
);

/** Animated "offline-first" infographic: cycles connected/unreachable, honors prefers-reduced-motion. */
function ReliabilityInfographic() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduce) return;
    const id = setInterval(() => setOnline(o => !o), 3000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="infographic">
      <div className="ig-head" aria-hidden="true">
        <span className="ig-chip"><CloudIcon /></span>
        <b>Offline-first</b>
        <span className={`ig-badge ${online ? 'ok' : 'warn'}`}>{online ? 'Connected' : 'Unreachable'}</span>
      </div>
      <div className={`ig-wire${online ? '' : ' cut'}`} aria-hidden="true" />
      <div className="ig-screen" aria-hidden="true">
        <span className="ig-scr-lb">Dining room</span>
        <div className="ig-scr-foot">
          <span className="ig-play">Playing</span>
          <span className="ig-state">{online ? 'Synced' : 'Playing cached'}</span>
        </div>
      </div>
      <ul className="ig-checks">
        <li className="ig-check"><span className="ck" aria-hidden="true"><Tick /></span>No surprises mid-service</li>
        <li className="ig-check"><span className="ck" aria-hidden="true"><Tick /></span>No screens left guessing</li>
      </ul>
    </div>
  );
}

/** Decorative signage-tile wall behind the page; rebuilt to fill the viewport. */
function TileWall() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const build = () => {
      el.innerHTML = '';
      const size = 72, gap = 12;
      const cols = Math.ceil((window.innerWidth + gap) / (size + gap));
      const rows = Math.ceil((window.innerHeight + gap) / (size + gap));
      let seed = 29;
      const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      const frag = document.createDocumentFragment();
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const d = document.createElement('div');
        const on = rnd() < 0.16;
        d.className = on ? 'tile on' : 'tile';
        d.style.cssText = `left:${c * (size + gap)}px;top:${r * (size + gap)}px;width:${size}px;height:${size}px`;
        if (on) { d.style.setProperty('--d', `${(7 + rnd() * 7).toFixed(1)}s`); d.style.setProperty('--o', `-${(rnd() * 9).toFixed(1)}s`); }
        frag.appendChild(d);
      }
      el.appendChild(frag);
    };
    build();
    const onResize = () => { clearTimeout(timer); timer = setTimeout(build, 200); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); clearTimeout(timer); };
  }, []);
  return <div id="bgwall" ref={ref} aria-hidden="true" />;
}

type FormState = 'idle' | 'sending' | 'sent' | 'error';

function InquiryForm() {
  const [state, setState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const value = (k: string) => String(data.get(k) ?? '').trim();
    const next: Record<string, string> = {};
    if (!value('name')) next.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('email'))) next.email = 'Please enter a valid email address.';
    if (!value('restaurant')) next.restaurant = 'Please enter your restaurant name.';
    setErrors(next);
    if (Object.keys(next).length) {
      (form.elements.namedItem(Object.keys(next)[0]) as HTMLElement | null)?.focus();
      return;
    }
    setState('sending');
    setMessage('');
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: value('name'), email: value('email'), restaurant: value('restaurant'),
          locations: value('locations'), message: value('message'), website: value('website'),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState('sent');
      setMessage(`Thanks, ${value('name')}. Your message has been sent — we'll reply to ${value('email')}.`);
      form.reset();
      track('inquiry_submitted');
    } catch {
      setState('error');
      setMessage('Sorry, your message could not be sent. Please try again in a moment.');
    }
  }

  const field = (id: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="fld">
      <label htmlFor={`f-${id}`}>{label}</label>
      <input className="in" id={`f-${id}`} name={id} aria-invalid={errors[id] ? true : undefined}
        aria-describedby={errors[id] ? `e-${id}` : undefined} required {...props} />
      {errors[id] && <span className="err-msg" id={`e-${id}`}>{errors[id]}</span>}
    </div>
  );

  return (
    <form className="form" onSubmit={submit} noValidate>
      <h3>Start a conversation</h3>
      <div className="form-row">
        {field('name', 'Your name', { autoComplete: 'name', maxLength: 100 })}
        {field('email', 'Work email', { type: 'email', autoComplete: 'email', maxLength: 200 })}
      </div>
      <div className="form-row">
        {field('restaurant', 'Restaurant name', { autoComplete: 'organization', maxLength: 150 })}
        <div className="fld">
          <label htmlFor="f-locations">Locations</label>
          <select className="in" id="f-locations" name="locations" defaultValue="1 location">
            <option>1 location</option><option>2–5 locations</option><option>6–20 locations</option><option>21+ locations</option>
          </select>
        </div>
      </div>
      <div className="fld">
        <label htmlFor="f-message">Anything you'd like us to know? <span className="faint" style={{ fontWeight: 400 }}>(optional)</span></label>
        <textarea className="in" id="f-message" name="message" maxLength={2000} />
      </div>
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-website">Leave this field empty</label>
        <input id="f-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <button className="btn btn-primary" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : 'Send'}
      </button>
      <p className="note">We use your details only to reply to this enquiry. Analytics never records what you type here.</p>
      <div role="status" aria-live="polite">
        {message && <p className={state === 'sent' ? 'form-status ok' : 'form-status err'}>{message}</p>}
      </div>
    </form>
  );
}

export default function App() {
  const [menu, setMenu] = useState(false);
  const cta = () => track('pilot_cta_clicked');
  return (
    <>
      <TileWall />
      <a className="skip" href="#main">Skip to content</a>
      <header className="nav">
        <div className="wrap nav-in">
          <Logo />
          <nav className="nav-links" aria-label="Primary">
            {NAV.map(([name, href]) => <a key={href} href={href}>{name}</a>)}
          </nav>
          <a className="btn btn-primary btn-sm cta only-desk" href="#contact" onClick={cta}>Request a demo</a>
          <button className="menu-btn" type="button" aria-expanded={menu} aria-controls="sheet"
            aria-label={menu ? 'Close menu' : 'Open menu'} onClick={() => setMenu(!menu)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {menu ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
        <div className="sheet" id="sheet" hidden={!menu}>
          <div className="wrap"><ul>
            {NAV.map(([name, href]) => <li key={href}><a href={href} onClick={() => setMenu(false)}>{name}</a></li>)}
            <li><a className="btn btn-primary" href="#contact" onClick={() => { setMenu(false); cta(); }}>Request a demo</a></li>
          </ul></div>
        </div>
      </header>

      <main id="main">
        <div id="top" />
        <section className="hero" aria-labelledby="h-hero">
          <div className="wrap">
            <div className="hero-copy">
              <h1 id="h-hero">Your screens,<span className="ln2">reimagined.</span></h1>
              <p className="lead">An effortless, fully managed way to run the screens in your restaurant.</p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#contact" onClick={cta}>Request a demo <ArrowIcon /></a>
                <a className="btn btn-text" href="#experience">See the idea <span className="arw" aria-hidden="true">&rarr;</span></a>
              </div>
            </div>
          </div>
          <div className="hero-band">
            <img src={`${import.meta.env.BASE_URL}hero-screens.jpg`} alt="A restaurant interior with adnex signage screens showing a seasonal menu, a lunch board and a coffee promotion" fetchPriority="high" />
          </div>
        </section>

        <section id="experience" aria-labelledby="h-exp">
          <div className="wrap sec split">
            <div className="sec-copy">
              <span className="eyebrow">The experience</span>
              <h2 id="h-exp">An atmosphere. Not just a screen.</h2>
              <p className="body">Your menus, your moments, your room — presented with the same care the food deserves.</p>
              <p className="body">A quiet, confident look that belongs to your restaurant, not to the hardware on the wall.</p>
              <a className="btn btn-text" href="#contact">See it in your space <span className="arw" aria-hidden="true">&rarr;</span></a>
            </div>
            <figure className="plate ink" aria-hidden="true">
              <p className="word">Good food deserves<br />a great <span className="ac">first impression.</span></p>
              <span className="beat" />
            </figure>
          </div>
        </section>

        <section id="reliability" className="wash" aria-labelledby="h-rel">
          <div className="wrap sec split">
            <div className="sec-copy">
              <span className="eyebrow">Reliability</span>
              <h2 id="h-rel">Dependable through every shift.</h2>
              <p className="body">Designed to keep going when the connection doesn't, so the room stays exactly as you intended.</p>
            </div>
            <ReliabilityInfographic />
          </div>
        </section>

        <section id="approach" aria-labelledby="h-app">
          <div className="wrap">
            <div className="panel-sec sec split">
              <div className="sec-copy">
                <span className="eyebrow">The approach</span>
                <h2 id="h-app">Managed, end to end.</h2>
                <p className="body">Hardware, software and upkeep, handled as one. You stay with your guests; we stay with the screens.</p>
                <p className="body">We start small, with a pilot shaped around your restaurant.</p>
              </div>
              <div>
                <ol className="steps">
                  <li className="step"><b>Share your setup</b><span>Tell us about your space and your screens.</span></li>
                  <li className="step"><b>Discuss the fit</b><span>We talk through whether adnex is right for you.</span></li>
                  <li className="step"><b>Scope your pilot</b><span>A small, considered start — on your terms.</span></li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="wash" aria-labelledby="h-con">
          <div className="wrap contact-grid">
            <div className="sec-copy" style={{ maxWidth: '38ch' }}>
              <span className="eyebrow">Contact</span>
              <h2 id="h-con">Let's talk about your space.</h2>
              <p className="body">Tell us about your restaurant and what you want from your screens. We'll take it from there.</p>
              <p className="note">adnex is in development. Pilot timing, pricing and feature availability have not been announced.</p>
            </div>
            <InquiryForm />
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap foot">
          <Logo large />
          <nav aria-label="Footer"><ul className="foot-links">
            {NAV.map(([name, href]) => <li key={href}><a href={href}>{name}</a></li>)}
          </ul></nav>
        </div>
        <div className="wrap">
          <div className="privacy-row">
            <p className="small">&copy; {new Date().getFullYear()} adnex</p>
            <AnalyticsConsent />
          </div>
        </div>
      </footer>
    </>
  );
}
