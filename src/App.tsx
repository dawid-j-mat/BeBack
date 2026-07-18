import { useState } from 'react';
import './App.css';
import { useSession } from './auth/useSession';
import { LoginScreen } from './auth/LoginScreen';
import { TopBar } from './components/TopBar';
import { MapView } from './components/MapView';
import { BottomNav } from './components/BottomNav';
import { AddFlow } from './add/AddFlow';
import { useEntries } from './lib/entries';

export default function App() {
  const session = useSession();
  const [adding, setAdding] = useState(false);
  const [freshEntryId, setFreshEntryId] = useState<string | null>(null);
  const { entries, refresh } = useEntries(Boolean(session));

  if (session === undefined) return null; // checking stored session, avoid flicker
  if (!session) return <LoginScreen />;

  return (
    <>
      <div className="lotniczy" />
      <TopBar user={session.user} />
      <main className="mapa-wrap">
        <MapView entries={entries} freshEntryId={freshEntryId} />
      </main>
      <BottomNav onAdd={() => setAdding(true)} />
      {adding && (
        <AddFlow
          userId={session.user.id}
          onClose={() => setAdding(false)}
          onSaved={(entryId) => {
            setFreshEntryId(entryId);
            refresh();
          }}
        />
      )}
    </>
  );
}
