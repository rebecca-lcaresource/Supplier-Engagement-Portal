import { useEffect, useState } from 'react';
import LandingPage from './components/landing/LandingPage.jsx';
import EmailEntry from './components/EmailEntry.jsx';
import RouteChoice from './components/RouteChoice.jsx';
import EcoVadisRegistration from './components/EcoVadisRegistration.jsx';
import DoorChoice from './components/DoorChoice.jsx';
import GuidedForm from './components/guidedForm/GuidedForm.jsx';
import DownloadUpload from './components/DownloadUpload.jsx';
import UploadReview from './components/UploadReview.jsx';
import Confirmation from './components/Confirmation.jsx';
import { getSession, onAuthChange, verifiedEmail } from './lib/auth.js';

// Screens that require a verified session (v4.0 hard gate). Reached without one
// (e.g. a bookmarked deep link), the supplier is sent back to Email Entry.
const GATED = ['routeChoice', 'ecovadisRegistration', 'doorChoice', 'guidedForm', 'downloadUpload', 'uploadReview'];

export default function App() {
  const [view, setView] = useState('landing');
  const [submission, setSubmission] = useState(null); // { answers, door }
  const [parsedAnswers, setParsedAnswers] = useState(null);
  const [contactHints, setContactHints] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    getSession().then(setSession);
    // Returning from the magic link fires SIGNED_IN → land on Route Choice. A normal
    // reload fires INITIAL_SESSION, which restores the session without navigating.
    const unsub = onAuthChange((event, sess) => {
      setSession(sess);
      if (event === 'SIGNED_IN') setView('routeChoice');
    });
    return unsub;
  }, []);

  const email = verifiedEmail(session);

  // Hard gate: never render a gated screen without a verified session.
  const effectiveView = GATED.includes(view) && !session ? 'emailEntry' : view;

  if (effectiveView === 'landing') {
    // Already verified (returning session) → straight to Route Choice; otherwise verify first.
    return <LandingPage onStartSubmission={() => setView(session ? 'routeChoice' : 'emailEntry')} />;
  }

  if (effectiveView === 'emailEntry') {
    return <EmailEntry onBack={() => setView('landing')} />;
  }

  if (effectiveView === 'routeChoice') {
    return (
      <RouteChoice
        onEcoVadis={() => setView('ecovadisRegistration')}
        onQuestionnaire={() => setView('doorChoice')}
      />
    );
  }

  if (effectiveView === 'ecovadisRegistration') {
    return <EcoVadisRegistration onBack={() => setView('routeChoice')} />;
  }

  if (effectiveView === 'doorChoice') {
    return (
      <DoorChoice
        onBack={() => setView('routeChoice')}
        onChooseDoor1={() => setView('guidedForm')}
        onChooseDoor2={() => setView('downloadUpload')}
      />
    );
  }

  if (effectiveView === 'guidedForm') {
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

  if (effectiveView === 'downloadUpload') {
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

  if (effectiveView === 'uploadReview') {
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

  if (effectiveView === 'confirmation' && submission) {
    return <Confirmation submission={submission} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>View "{effectiveView}" not built yet.</p>
    </div>
  );
}
