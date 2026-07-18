import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { t } from '../i18n';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function sendLink(event: FormEvent) {
    event.preventDefault();
    setStatus('sending');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin,
        // closed registration (D-16): links go only to existing accounts
        shouldCreateUser: false,
      },
    });
    setStatus(error ? 'error' : 'sent');
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

        {status === 'sent' ? (
          <p className="logowanie-wyslano">{t('login_wyslano')}</p>
        ) : (
          <form className="logowanie-form" onSubmit={sendLink}>
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
          </form>
        )}
      </div>
    </div>
  );
}
