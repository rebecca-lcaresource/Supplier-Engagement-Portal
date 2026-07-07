import { useState } from 'react';
import LandingPage from './components/landing/LandingPage.jsx';
import DoorChoice from './components/DoorChoice.jsx';
import GuidedForm from './components/guidedForm/GuidedForm.jsx';

export default function App() {
  const [view, setView] = useState('landing');
  const [submission, setSubmission] = useState(null); // { answers, door }

  if (view === 'landing') {
    return <LandingPage onCompleteQuestionnaire={() => setView('doorChoice')} />;
  }

  if (view === 'doorChoice') {
    return (
      <DoorChoice
        onBack={() => setView('landing')}
        onChooseDoor1={() => setView('guidedForm')}
        onChooseDoor2={() => setView('downloadUpload')}
      />
    );
  }

  if (view === 'guidedForm') {
    return (
      <GuidedForm
        onBack={() => setView('doorChoice')}
        onSubmit={(answers) => {
          setSubmission({ answers, door: 'door1' });
          setView('confirmation');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>View "{view}" not built yet.</p>
    </div>
  );
}
