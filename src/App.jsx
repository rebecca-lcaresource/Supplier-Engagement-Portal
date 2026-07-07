import { useState } from 'react';
import LandingPage from './components/landing/LandingPage.jsx';

export default function App() {
  const [view, setView] = useState('landing');

  if (view === 'landing') {
    return <LandingPage onCompleteQuestionnaire={() => setView('doorChoice')} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>View "{view}" not built yet.</p>
    </div>
  );
}
