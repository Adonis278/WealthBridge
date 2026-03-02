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
