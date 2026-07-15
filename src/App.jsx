import { useState } from 'react';
import LandingPage from './components/landing/LandingPage.jsx';
import EcoVadisRegistration from './components/EcoVadisRegistration.jsx';
import DoorChoice from './components/DoorChoice.jsx';
import GuidedForm from './components/guidedForm/GuidedForm.jsx';
import DownloadUpload from './components/DownloadUpload.jsx';
import UploadReview from './components/UploadReview.jsx';
import Confirmation from './components/Confirmation.jsx';

export default function App() {
  const [view, setView] = useState('landing');
  const [submission, setSubmission] = useState(null); // { answers, door }
  const [parsedAnswers, setParsedAnswers] = useState(null);

  if (view === 'landing') {
    return (
      <LandingPage
        onCompleteQuestionnaire={() => setView('doorChoice')}
        onEcoVadis={() => setView('ecovadisRegistration')}
      />
    );
  }

  if (view === 'ecovadisRegistration') {
    return <EcoVadisRegistration onBack={() => setView('landing')} />;
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
        // Called only after the database write has succeeded.
        onSubmitted={(answers) => {
          setSubmission({ answers, door: 'guided_form' });
          setView('confirmation');
        }}
      />
    );
  }

  if (view === 'downloadUpload') {
    return (
      <DownloadUpload
        onBack={() => setView('doorChoice')}
        onParsed={(answers) => {
          setParsedAnswers(answers);
          setView('uploadReview');
        }}
      />
    );
  }

  if (view === 'uploadReview') {
    return (
      <UploadReview
        parsedAnswers={parsedAnswers}
        onReupload={() => {
          setParsedAnswers(null);
          setView('downloadUpload');
        }}
        // Called only after the database write has succeeded.
        onSubmitted={(answers) => {
          setSubmission({ answers, door: 'upload' });
          setView('confirmation');
        }}
      />
    );
  }

  if (view === 'confirmation' && submission) {
    return <Confirmation submission={submission} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>View "{view}" not built yet.</p>
    </div>
  );
}
