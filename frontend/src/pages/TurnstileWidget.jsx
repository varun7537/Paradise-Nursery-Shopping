// src/components/TurnstileWidget.jsx
//
// Thin React wrapper around the Cloudflare Turnstile script.
// Loads the Turnstile script once, renders the widget into a div ref,
// and reports back via callbacks. No external npm package required —
// Cloudflare's official approach is the plain <script> + window.turnstile API.
//
// Exposes a `reset()` method via ref so the parent form can force a fresh
// challenge after a failed/expired submission (Turnstile tokens are
// single-use and time-limited).
//
// ── FIX: React 18 StrictMode mounts every component twice in development
// (mount → cleanup → mount again). The previous version raced: the first
// effect's async `loadTurnstileScript().then(...)` could still be in flight
// when the second mount fired, occasionally calling `window.turnstile.render`
// on a container that was already mid-render or already removed — Turnstile
// throws in that case, which landed in `.catch(() => onError?.())` and showed
// up as "Could not load CAPTCHA" even though nothing was actually wrong with
// the network/sitekey. Fixed by:
//   1. Tracking widget state with a ref-guarded "already rendered" flag.
//   2. Removing any existing widget for this container before rendering a
//      new one, instead of relying solely on the cleanup function running
//      first (which StrictMode does not guarantee in all React versions).
//   3. Reporting load/script errors distinctly from render errors via
//      console.error so they're distinguishable in devtools.

import React, { useEffect, useRef, useId, forwardRef, useImperativeHandle } from 'react';

const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

if (!TURNSTILE_SITE_KEY) {
  // Fail loudly in dev rather than silently rendering a broken widget.
  // eslint-disable-next-line no-console
  console.error(
    'VITE_TURNSTILE_SITE_KEY is not set. Add it to your .env file — see setup instructions.'
  );
}

let scriptLoadPromise = null;

/** Loads the Turnstile script exactly once, no matter how many widgets mount. */
function loadTurnstileScript() {
  if (window.turnstile) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${TURNSTILE_SCRIPT_SRC}"]`);
    if (existing) {
      // Script tag already in the DOM (e.g. from a previous mount) — if
      // window.turnstile is already set we'd have returned above, so this
      // means it's still loading. Wait for its load/error event.
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Turnstile script failed to load.')));
      return;
    }
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Turnstile script failed to load.'));
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

/**
 * @param {Object} props
 * @param {(token: string) => void} props.onVerify   - Called with the token once solved.
 * @param {() => void} [props.onExpire]               - Called when a solved token expires.
 * @param {(reason?: string) => void} [props.onError] - Called if the widget itself errors.
 * @param {'light'|'dark'|'auto'} [props.theme]
 *
 * Usage:
 *   const captchaRef = useRef(null);
 *   <TurnstileWidget ref={captchaRef} onVerify={setToken} />
 *   // later, after a failed submit:
 *   captchaRef.current?.reset();
 */
const TurnstileWidget = forwardRef(({ onVerify, onExpire, onError, theme = 'light' }, ref) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  // ── FIX: unique, stable id that survives StrictMode's double-invoke
  // (useId alone is stable per-instance but we also need it to identify
  // and clean up a possibly-already-rendered widget in the same DOM node).
  const reactId = useId();

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current != null && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch (err) {
          console.error('TurnstileWidget: reset() failed.', err);
        }
      }
    },
  }));

  useEffect(() => {
    let cancelled = false;

    const renderWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile) return;

      // ── FIX: if a widget is already rendered into this container (can
      // happen on StrictMode's second mount before the first cleanup ran,
      // or on a fast re-render), remove it first instead of rendering a
      // second widget on top / throwing.
      if (widgetIdRef.current != null) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore — widget may already be gone
        }
        widgetIdRef.current = null;
      }

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme,
          callback: (token) => onVerify?.(token),
          'expired-callback': () => onExpire?.(),
          'error-callback': (code) => {
            console.error('TurnstileWidget: error-callback fired.', { code });
            onError?.('render');
          },
        });
      } catch (err) {
        // This is the actual exception path that used to trigger the
        // misleading generic message. Now it's logged with full detail.
        console.error('TurnstileWidget: render() threw.', err);
        onError?.('render');
      }
    };

    loadTurnstileScript()
      .then(renderWidget)
      .catch((err) => {
        console.error('TurnstileWidget: script load failed.', err);
        if (!cancelled) onError?.('script-load');
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current != null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  return <div ref={containerRef} id={`turnstile-${reactId}`} className="cf-turnstile" />;
});

TurnstileWidget.displayName = 'TurnstileWidget';

export default TurnstileWidget;