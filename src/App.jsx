import { useState } from 'react';
import LandingPage from './components/landing/LandingPage.jsx';
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
        onSubmit={(answers) => {
          setSubmission({ answers, door: 'door2' });
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
