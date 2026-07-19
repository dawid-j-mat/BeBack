import { useEffect, useState } from 'react';
import './App.css';
import { useSession } from './auth/useSession';
import { saveProfileLang, useProfile } from './auth/useProfile';
import { currentLang, setLang, type Lang } from './i18n';
import { LoginScreen } from './auth/LoginScreen';
import { TopBar } from './components/TopBar';
import { MapView } from './components/MapView';
import { BottomNav, type AppView } from './components/BottomNav';
import { AddFlow } from './add/AddFlow';
import { EditEntry } from './edit/EditEntry';
import { Journal } from './journal/Journal';
import { useOfflineEntries } from './lib/sync';
import type { Entry } from './lib/entries';

export default function App() {
  const session = useSession();
  const [view, setView] = useState<AppView>('mapa');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [freshEntryId, setFreshEntryId] = useState<string | null>(null);
  const userId = session?.user.id ?? null;
  const { displayName, profileLang } = useProfile(userId);
  const { entries, refresh } = useOfflineEntries(userId);

  // Language state lives here so changing it re-renders the whole tree; the
  // value itself is held by src/i18n (device copy) and the profile row.
  const [lang, setLangState] = useState<Lang>(currentLang());
  useEffect(() => {
    if (profileLang && profileLang !== currentLang()) {
      setLang(profileLang);
      setLangState(profileLang);
    }
  }, [profileLang]);

  function changeLang(next: Lang) {
    if (next === lang) return;
    setLang(next);
    setLangState(next);
    if (userId) void saveProfileLang(userId, next);
  }

  if (session === undefined) return null; // checking stored session, avoid flicker
  if (!session) return <LoginScreen />;

  return (
    <>
      <div className="lotniczy" />
      <TopBar displayName={displayName} lang={lang} onLangChange={changeLang} />
      <main className="mapa-wrap">
        {/* The map stays mounted while the journal covers it: MapLibre is
            expensive to spin up and would lose its viewport on every switch. */}
        <MapView
          entries={entries}
          freshEntryId={freshEntryId}
          currentUserId={session.user.id}
          onEdit={setEditing}
        />
        {view === 'dziennik' && (
          <Journal entries={entries} currentUserId={session.user.id} onEdit={setEditing} />
        )}
      </main>
      <BottomNav view={view} onNav={setView} onAdd={() => setAdding(true)} />
      {adding && (
        <AddFlow
          userId={session.user.id}
          authorName={displayName}
          onClose={() => setAdding(false)}
          onSaved={(entryId) => {
            setFreshEntryId(entryId);
            setView('mapa'); // back to the map, where the new pin pulses (SPEC §3.2)
          }}
        />
      )}
      {editing && (
        <EditEntry
          entry={editing}
          userId={session.user.id}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void refresh();
          }}
        />
      )}
    </>
  );
}
