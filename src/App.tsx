import './App.css';
import { TopBar } from './components/TopBar';
import { MapView } from './components/MapView';
import { BottomNav } from './components/BottomNav';

export default function App() {
  return (
    <>
      <div className="lotniczy" />
      <TopBar />
      <main className="mapa-wrap">
        <MapView />
      </main>
      <BottomNav />
    </>
  );
}
