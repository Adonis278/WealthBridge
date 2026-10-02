/**
 * reCAPTCHA Enterprise helper — CURRENTLY UNUSED.
 *
 * The login/signup pages used to load `recaptcha/enterprise.js` and call
 * executeRecaptcha() on every submit. That cost 346 KB plus an iframe that ran
 * for ~1.1s, and bought nothing: the token was never sent anywhere and never
 * verified, so it was not an access control.
 *
 * This module is kept so the integration can be finished properly. To turn it
 * back on you need all three parts:
 *   1. load the enterprise.js script on the auth pages,
 *   2. send the token from executeRecaptcha() to your server, and
 *   3. verify it server-side via the reCAPTCHA Enterprise assessment API
 *      and reject the request on a low score.
 * Re-adding only step 1 restores the cost without the protection.
 *
 * NOTE: this is unrelated to Firebase phone auth, which uses its own
 * RecaptchaVerifier in AuthContext and still works.
 */

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

export const executeRecaptcha = async (action: string): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!RECAPTCHA_SITE_KEY) {
      resolve(null);
      return;
    }

    if (typeof window === 'undefined' || !window.grecaptcha?.enterprise) {
      console.warn('reCAPTCHA Enterprise not loaded');
      resolve(null);
      return;
    }

    window.grecaptcha.enterprise.ready(async () => {
      try {
        const token = await window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, { action });
        resolve(token);
      } catch (error) {
        console.error('reCAPTCHA execution failed:', error);
        resolve(null);
      }
    });
  });
};

export { RECAPTCHA_SITE_KEY };
