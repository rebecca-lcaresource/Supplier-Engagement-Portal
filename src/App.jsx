import { useEffect, useState } from 'react';
import LandingPage from './components/landing/LandingPage.jsx';
import EcoVadisRegistration from './components/EcoVadisRegistration.jsx';
import EmailGate from './components/EmailGate.jsx';
import DoorChoice from './components/DoorChoice.jsx';
import GuidedForm from './components/guidedForm/GuidedForm.jsx';
import DownloadUpload from './components/DownloadUpload.jsx';
import UploadReview from './components/UploadReview.jsx';
import Confirmation from './components/Confirmation.jsx';
import { getSession, onAuthChange, verifiedEmail } from './lib/auth.js';

export default function App() {
  const [view, setView] = useState('landing');
  const [submission, setSubmission] = useState(null); // { answers, door }
  const [parsedAnswers, setParsedAnswers] = useState(null);
  const [contactHints, setContactHints] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    getSession().then(setSession);
    // On returning from the magic link, Supabase fires SIGNED_IN — send the verified
    // supplier straight into the questionnaire. A normal reload fires INITIAL_SESSION,
    // which just restores state without navigating.
    const unsub = onAuthChange((event, sess) => {
      setSession(sess);
      if (event === 'SIGNED_IN') setView('doorChoice');
    });
    return unsub;
  }, []);

  // Questionnaire requires a verified email (magic link). Verified → Door Choice;
  // otherwise → the email gate.
  function startQuestionnaire() {
    setView(session ? 'doorChoice' : 'emailGate');
  }

  const email = verifiedEmail(session);

  if (view === 'landing') {
    return (
      <LandingPage
        onCompleteQuestionnaire={startQuestionnaire}
        onEcoVadis={() => setView('ecovadisRegistration')}
      />
    );
  }

  if (view === 'emailGate') {
    return <EmailGate onBack={() => setView('landing')} />;
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
        verifiedEmail={email}
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
        onParsed={(answers, hints) => {
          setParsedAnswers(answers);
          setContactHints(hints);
          setView('uploadReview');
        }}
      />
    );
  }

  if (view === 'uploadReview') {
    return (
      <UploadReview
        parsedAnswers={parsedAnswers}
        contactHints={contactHints}
        verifiedEmail={email}
        onReupload={() => {
          setParsedAnswers(null);
          setContactHints(null);
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
