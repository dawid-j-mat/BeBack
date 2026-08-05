import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { t } from '../i18n';

type Phase = 'login' | 'code';
type Status = 'idle' | 'signing' | 'sending' | 'verifying' | 'error';
// Which attempt failed - the two ways in have different advice.
type Failure = 'password' | 'send' | 'code';

// Two ways in (D-53). Password is the everyday one: it talks to Supabase
// directly, so the session lands in the app's own storage and it works the
// same in an installed iOS PWA, where a mailed link would create the session
// in Safari instead and loop forever. The e-mailed six-digit code stays for
// people who have no password yet and for new devices; it is a code, never a
// link, for the same iOS reason (D-48).

// Auth failures have to be diagnosable from a phone, which has no console:
// the raw reason, its HTTP status and Supabase's error code all go on screen.
// A bare message (Supabase sometimes sends none) would otherwise read as "0"
// and hide whether the address, the account or the mail sender is at fault.
function describeAuthError(error: { message?: string; status?: number; code?: string }): string {
  const code = error.code;
  const status = error.status;
  const message = error.message?.trim();
  const parts = [
    message && message !== String(status) ? message : null,
    code ? `[${code}]` : null,
    status ? `(${status})` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'brak szczegółów';
}

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

const FAILURE_TEXT: Record<Failure, 'login_haslo_blad' | 'login_blad' | 'login_kod_blad'> = {
  password: 'login_haslo_blad',
  send: 'login_blad',
  code: 'login_kod_blad',
};

export function LoginScreen() {
  const [phase, setPhase] = useState<Phase>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [failure, setFailure] = useState<Failure | null>(null);
  const [detail, setDetail] = useState<string | null>(() => readLinkError());

  function fail(which: Failure, error: { message?: string; status?: number; code?: string }) {
    setFailure(which);
    setDetail(describeAuthError(error));
    setStatus('error');
  }

  // On success the auth listener in useSession picks up the session and the
  // app swaps the login screen out - nothing more to do in any of these.
  async function signIn(event: FormEvent) {
    event.preventDefault();
    setStatus('signing');
    setDetail(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      console.error('[beback] signInWithPassword error:', error);
      fail('password', error);
    }
  }

  async function sendCode() {
    setStatus('sending');
    setDetail(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      // closed registration (D-16): codes go only to existing accounts
      options: { shouldCreateUser: false },
    });
    if (error) {
      console.error('[beback] signInWithOtp error:', error);
      fail('send', error);
    } else {
      setCode('');
      setPhase('code');
      setStatus('idle');
      setFailure(null);
    }
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    setStatus('verifying');
    setDetail(null);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email',
    });
    if (error) {
      console.error('[beback] verifyOtp error:', error);
      fail('code', error);
    }
  }

  function backToLogin() {
    setPhase('login');
    setCode('');
    setStatus('idle');
    setFailure(null);
    setDetail(null);
  }

  const problem = status === 'error' && failure ? t(FAILURE_TEXT[failure]) : null;

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

        {phase === 'login' ? (
          <form className="logowanie-form" onSubmit={signIn}>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder={t('login_email_ph')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {/* current-password lets the phone's keychain save and refill it,
                so everyday sign-ins are a single tap */}
            <input
              type="password"
              autoComplete="current-password"
              placeholder={t('login_haslo_ph')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              className="btn pieczec"
              disabled={status === 'signing' || !email.trim() || !password}
            >
              {status === 'signing' ? t('login_weryfikacja') : t('login_zaloguj')}
            </button>
            {problem && <p className="logowanie-blad">{problem}</p>}
            {detail && <p className="logowanie-szczegol">{detail}</p>}
            <div className="logowanie-akcje">
              <button
                type="button"
                className="logowanie-link"
                onClick={() => void sendCode()}
                disabled={status === 'sending' || !email.trim()}
              >
                {status === 'sending' ? t('login_wysylanie') : t('login_kodem')}
              </button>
            </div>
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
            {problem && <p className="logowanie-blad">{problem}</p>}
            {detail && <p className="logowanie-szczegol">{detail}</p>}
            <div className="logowanie-akcje">
              <button
                type="button"
                className="logowanie-link"
                onClick={() => void sendCode()}
                disabled={status === 'sending'}
              >
                {status === 'sending' ? t('login_wysylanie') : t('login_ponow')}
              </button>
              <button type="button" className="logowanie-link" onClick={backToLogin}>
                {t('login_wstecz')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
