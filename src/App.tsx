import './App.css';
import { useSession } from './auth/useSession';
import { LoginScreen } from './auth/LoginScreen';
import { TopBar } from './components/TopBar';
import { MapView } from './components/MapView';
import { BottomNav } from './components/BottomNav';

export default function App() {
  const session = useSession();

  if (session === undefined) return null; // checking stored session, avoid flicker
  if (!session) return <LoginScreen />;

  return (
    <>
      <div className="lotniczy" />
      <TopBar user={session.user} />
      <main className="mapa-wrap">
        <MapView />
      </main>
      <BottomNav />
    </>
  );
}
