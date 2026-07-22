import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { t } from '../i18n';

type Phase = 'email' | 'code';
type Status = 'idle' | 'sending' | 'verifying' | 'error';

// Login is a two-step e-mail OTP (D-48): the user asks for a code, then types
// the six digits back in. Unlike a magic link, a typed code works no matter
// which app or browser opens the mail - which is the whole point on iOS, where
// an installed PWA has its own storage jar and never sees a session created in
// Safari. So there is no clicked link here at all.

// A stale magic-link mail (from before D-48) still bounces back with error
// params in the URL hash; read them once so we can say what happened.
function readLinkError(): string | null {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  if (!params.get('error')) return null;
  history.replaceState(null, '', window.location.pathname);
  return params.get('error_code') === 'otp_expired'
    ? t('login_link_wygasl')
    : (params.get('error_description') ?? t('login_blad'));
}

export function LoginScreen() {
  const [phase, setPhase] = useState<Phase>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [detail, setDetail] = useState<string | null>(() => readLinkError());

  async function sendCode(event?: FormEvent) {
    event?.preventDefault();
    setStatus('sending');
    setDetail(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      // closed registration (D-16): codes go only to existing accounts
      options: { shouldCreateUser: false },
    });
    if (error) {
      console.error('[beback] signInWithOtp error:', error.message);
      setDetail(error.message);
      setStatus('error');
    } else {
      setCode('');
      setPhase('code');
      setStatus('idle');
    }
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    setStatus('verifying');
    setDetail(null);
    // On success the auth listener in useSession picks up the session and the
    // app swaps the login screen out - nothing more to do here.
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email',
    });
    if (error) {
      console.error('[beback] verifyOtp error:', error.message);
      setStatus('error');
    }
  }

  function changeEmail() {
    setPhase('email');
    setCode('');
    setStatus('idle');
    setDetail(null);
  }

  return (
    <div className="logowanie">
      <div className="lotniczy" />
      <div className="logowanie-cialo">
        <span className="wordmark duzy">
          <span className="znak" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 14 4 9l5-5" />
              <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
            </svg>
          </span>
          <span className="nazwa">BeBack</span>
        </span>

        {phase === 'email' ? (
          <form className="logowanie-form" onSubmit={sendCode}>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder={t('login_email_ph')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn pieczec" disabled={status === 'sending'}>
              {status === 'sending' ? t('login_wysylanie') : t('login_wyslij')}
            </button>
            {status === 'error' && <p className="logowanie-blad">{t('login_blad')}</p>}
            {detail && <p className="logowanie-szczegol">{detail}</p>}
          </form>
        ) : (
          <form className="logowanie-form" onSubmit={verifyCode}>
            <p className="logowanie-wyslano">{t('login_wyslano')}</p>
            <input
              className="logowanie-kod"
              type="text"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder={t('login_kod_ph')}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
            <button
              type="submit"
              className="btn pieczec"
              disabled={status === 'verifying' || code.length < 6}
            >
              {status === 'verifying' ? t('login_weryfikacja') : t('login_zaloguj')}
            </button>
            {status === 'error' && <p className="logowanie-blad">{t('login_kod_blad')}</p>}
            <div className="logowanie-akcje">
              <button
                type="button"
                className="logowanie-link"
                onClick={() => void sendCode()}
                disabled={status === 'sending'}
              >
                {status === 'sending' ? t('login_wysylanie') : t('login_ponow')}
              </button>
              <button type="button" className="logowanie-link" onClick={changeEmail}>
                {t('login_inny_email')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
