import { useState } from 'react';
import Header from './landing/Header.jsx';
import ConsentCheckbox from './ConsentCheckbox.jsx';
import { writeEcoVadisRegistration } from '../lib/db.js';

// EcoVadis destination — the generic homepage is the accepted interim link (spec §15;
// carried from v2.0). Revisit if EcoVadis provides a targeted redirect URL.
const ECOVADIS_URL = 'https://www.ecovadis.com/';

const FIELDS = [
  { id: 'companyName', label: 'Company name', type: 'text' },
  { id: 'country', label: 'Registered country', type: 'text' },
  { id: 'contactName', label: 'Contact name', type: 'text' },
  { id: 'contactEmail', label: 'Contact email', type: 'email' },
  { id: 'scorecardUrl', label: 'EcoVadis scorecard link', type: 'url' },
];

const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[\w.-]+$/;

export default function EcoVadisRegistration({ onBack }) {
  const [values, setValues] = useState({
    companyName: '',
    country: '',
    contactName: '',
    contactEmail: '',
    scorecardUrl: '',
  });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function handleChange(id, value) {
    setValues((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function validate() {
    const next = {};
    FIELDS.forEach((f) => {
      if (!values[f.id].trim()) next[f.id] = 'This field is required.';
    });
    if (values.contactEmail.trim() && !EMAIL_RE.test(values.contactEmail.trim())) {
      next.contactEmail = 'Enter a valid email address.';
    }
    if (!consent) next.consent = 'Please confirm consent before continuing.';
    return next;
  }

  async function handleContinue() {
    setSubmitError(null);
    const next = validate();
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    setSubmitting(true);
    try {
      // Write MUST succeed before we redirect — a failed write blocks the redirect,
      // otherwise the supplier leaves and is never recorded (spec §9).
      await writeEcoVadisRegistration(values);
      setDone(true);
      window.open(ECOVADIS_URL, '_blank', 'noopener');
    } catch (err) {
      setSubmitError(
        'We could not record your registration, so you have not been redirected. ' +
          'Please check your connection and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen">
        <header className="py-lg">
          <div className="max-w-page mx-auto px-md md:px-2xl">
            <Header />
          </div>
        </header>
        <section className="py-3xl">
          <div className="max-w-page mx-auto px-md md:px-2xl max-w-content">
            <p className="font-body text-[13px] font-medium tracking-[0.16em] uppercase text-stone mb-md">
              Registration recorded
            </p>
            <h1 className="font-display text-2xl md:text-[32px] font-normal mb-lg">
              You're registered — EcoVadis has opened in a new tab
            </h1>
            <p className="mb-lg">
              The Corporate has recorded that you are taking the EcoVadis route. Complete
              your assessment on EcoVadis. If the new tab did not open, use the button below.
            </p>
            <p className="mb-lg text-sm text-stone">
              Your registration is kept for 24 months, after which it is deleted. To access
              or delete your data, email{' '}
              <a href="mailto:rebecca@lcaresource.com">rebecca@lcaresource.com</a>.
            </p>
            <a href={ECOVADIS_URL} target="_blank" rel="noopener" className="tc-btn-primary">
              Go to EcoVadis
            </a>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="py-lg">
        <div className="max-w-page mx-auto px-md md:px-2xl flex items-center justify-between">
          <Header />
          <button
            type="button"
            onClick={onBack}
            className="text-[13px] tracking-[0.08em] uppercase underline"
          >
            Back
          </button>
        </div>
      </header>

      <section className="py-3xl">
        <div className="max-w-page mx-auto px-md md:px-2xl max-w-content">
          <p className="font-body text-[13px] font-medium tracking-[0.16em] uppercase text-stone mb-md">
            EcoVadis route
          </p>
          <h1 className="font-display text-2xl md:text-[32px] font-normal mb-md">
            Register before you continue to EcoVadis
          </h1>
          <p className="mb-xl">
            Tell us who you are so The Corporate can record your participation. On continue,
            we save your registration and open EcoVadis in a new tab.
          </p>

          {FIELDS.map((field) => {
            const inputId = `ecovadis-${field.id}`;
            return (
              <div key={field.id} className="mb-lg">
                <label htmlFor={inputId} className="block mb-xs">
                  <span className="font-body text-sm text-ink">{field.label}</span>
                </label>
                <input
                  id={inputId}
                  type={field.type}
                  className={`tc-input ${errors[field.id] ? 'has-error' : ''}`}
                  value={values[field.id]}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                />
                {errors[field.id] && (
                  <p className="text-[13px] mt-xs" style={{ color: '#C0392B' }}>
                    {errors[field.id]}
                  </p>
                )}
              </div>
            );
          })}

          <ConsentCheckbox
            variant="ecovadis"
            checked={consent}
            onChange={(v) => {
              setConsent(v);
              setErrors((prev) => {
                if (!prev.consent) return prev;
                const next = { ...prev };
                delete next.consent;
                return next;
              });
            }}
            error={errors.consent}
          />

          {submitError && (
            <div className="border-l-2 p-md mb-lg bg-white" style={{ borderColor: '#C0392B' }}>
              <p style={{ color: '#C0392B' }}>{submitError}</p>
            </div>
          )}

          <div className="flex items-center justify-between mt-xl">
            <button type="button" onClick={onBack} className="tc-btn-secondary">
              Back
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={submitting}
              className="tc-btn-primary"
            >
              {submitting ? 'Saving…' : 'Continue to EcoVadis'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
