import { useState } from 'react';
import Header from '../landing/Header.jsx';
import SectionNav from './SectionNav.jsx';
import FieldInput from './FieldInput.jsx';
import ConsentCheckbox from '../ConsentCheckbox.jsx';
import { writeQuestionnaireSubmission } from '../../lib/db.js';
import {
  SECTIONS,
  fieldsForSection,
  isFieldValid,
  DECLARATION_FIELDS,
} from '../../data/questionnaireFields.js';

export default function GuidedForm({ onSubmitted, onBack, verifiedEmail }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Pre-fill the contact email with the magic-link-verified address (locked below).
  const [answers, setAnswers] = useState(() =>
    verifiedEmail ? { contact_email: verifiedEmail } : {}
  );
  const [errors, setErrors] = useState({});
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const section = SECTIONS[currentIndex];
  const isLastSection = currentIndex === SECTIONS.length - 1;
  const fields = fieldsForSection(section.id);
  const sectionFieldList = isLastSection ? [...fields, ...DECLARATION_FIELDS] : fields;

  function handleChange(fieldId, value) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }

  function validateFields(fieldList) {
    const newErrors = {};
    fieldList.forEach((f) => {
      if (!isFieldValid(f, answers[f.id])) {
        if (f.type === 'checkbox') newErrors[f.id] = 'Please confirm before continuing.';
        else if (f.type === 'email') {
          newErrors[f.id] = (answers[f.id] || '').trim()
            ? 'Enter a valid email address.'
            : 'This field is required.';
        } else newErrors[f.id] = 'This field is required.';
      }
    });
    return newErrors;
  }

  function handleNext() {
    const newErrors = validateFields(fields);
    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }
    setCurrentIndex((i) => Math.min(i + 1, SECTIONS.length - 1));
  }

  function handleBack() {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }

  function handleJump(index) {
    setCurrentIndex(index);
  }

  async function handleSubmit() {
    setSubmitError(null);
    // Validate every section, not just the current one.
    let allErrors = {};
    let firstInvalidIndex = null;
    SECTIONS.forEach((s, i) => {
      const sFields = i === SECTIONS.length - 1
        ? [...fieldsForSection(s.id), ...DECLARATION_FIELDS]
        : fieldsForSection(s.id);
      const sErrors = validateFields(sFields);
      if (Object.keys(sErrors).length > 0 && firstInvalidIndex === null) {
        firstInvalidIndex = i;
      }
      allErrors = { ...allErrors, ...sErrors };
    });

    // Consent is required and validated alongside the fields (spec §7/§9).
    const missingConsent = !consent;
    if (missingConsent) setConsentError('Please confirm consent before submitting.');

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setCurrentIndex(firstInvalidIndex);
      return;
    }
    if (missingConsent) return;

    // Write to the database BEFORE showing Confirmation. A failed write must never
    // advance to Confirmation — the supplier sees a "not recorded" error and can retry.
    setSubmitting(true);
    try {
      await writeQuestionnaireSubmission({ answers, door: 'guided_form' });
      onSubmitted(answers);
    } catch (err) {
      setSubmitError(
        'Your submission was not recorded. Please check your connection and submit again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="py-lg">
        <div className="max-w-page mx-auto px-md md:px-2xl flex items-center justify-between">
          <Header />
          <button type="button" onClick={onBack} className="text-[13px] tracking-[0.08em] uppercase underline">
            Back
          </button>
        </div>
      </header>

      <section className="py-3xl">
        <div className="max-w-page mx-auto px-md md:px-2xl max-w-content">
          <SectionNav currentIndex={currentIndex} onJump={handleJump} />

          <p className="font-body text-[13px] font-medium tracking-[0.16em] uppercase text-stone mb-xs">
            {section.esrsHeader}
          </p>
          <h1 className="font-display text-2xl md:text-[32px] font-normal mb-xl">{section.title}</h1>

          {sectionFieldList.map((field) => (
            <FieldInput
              key={field.id}
              field={field}
              value={answers[field.id]}
              error={errors[field.id]}
              onChange={(value) => handleChange(field.id, value)}
              readOnly={field.id === 'contact_email' && !!verifiedEmail}
            />
          ))}

          {isLastSection && (
            <div className="mt-xl mb-lg pt-lg" style={{ borderTop: '0.5px solid var(--tc-border)' }}>
              <ConsentCheckbox
                variant="questionnaire"
                checked={consent}
                onChange={(v) => {
                  setConsent(v);
                  if (v) setConsentError(null);
                }}
                error={consentError}
              />
            </div>
          )}

          {submitError && (
            <div className="border-l-2 p-md mb-lg bg-white" style={{ borderColor: '#C0392B' }}>
              <p style={{ color: '#C0392B' }}>{submitError}</p>
            </div>
          )}

          <div className="flex items-center justify-between mt-xl">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="tc-btn-secondary"
              style={currentIndex === 0 ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
            >
              Back
            </button>

            {isLastSection ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="tc-btn-primary"
              >
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            ) : (
              <button type="button" onClick={handleNext} className="tc-btn-primary">
                Next
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
