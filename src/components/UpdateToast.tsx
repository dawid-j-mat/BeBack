import { useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { t } from '../i18n';
import './UpdateToast.css';

// With registerType 'prompt' (D-34) a new build waits until the user taps
// "Refresh" instead of swapping the app mid-use; the bar sits above the
// bottom nav, styled like the paper toast.
let registered = false; // StrictMode double-mounts; the SW registers once

export function UpdateToast() {
  const [ready, setReady] = useState(false);
  const update = useRef<((reload?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    if (registered) return;
    registered = true;
    update.current = registerSW({ onNeedRefresh: () => setReady(true) });
  }, []);

  if (!ready) return null;
  return (
    <div className="nowa-wersja" role="status">
      <span>{t('nowa_wersja')}</span>
      <button type="button" className="btn-maly" onClick={() => void update.current?.(true)}>
        {t('odswiez')}
      </button>
    </div>
  );
}
