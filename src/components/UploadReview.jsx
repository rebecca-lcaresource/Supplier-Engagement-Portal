import { useState } from 'react';
import Header from './landing/Header.jsx';
import FieldInput from './guidedForm/FieldInput.jsx';
import ConsentCheckbox from './ConsentCheckbox.jsx';
import { writeQuestionnaireSubmission } from '../lib/db.js';
import {
  SECTIONS,
  fieldsForSection,
  DECLARATION_FIELDS,
  IDENTITY_FIELDS,
  isFieldValid,
} from '../data/questionnaireFields.js';

export default function UploadReview({ parsedAnswers, contactHints, verifiedEmail, onReupload, onSubmitted }) {
  // S1 contact fields are collected here (not in the workbook), pre-filled from
  // the file's original free-text S1 cells where we could read them. The contact
  // email is the magic-link-verified address (locked below).
  const [contact, setContact] = useState(() => ({
    company_name: contactHints?.company_name || '',
    country: contactHints?.country || '',
    contact_name: contactHints?.contact_name || '',
    contact_email: verifiedEmail || contactHints?.contact_email || '',
  }));
  const [declaration, setDeclaration] = useState({});
  const [errors, setErrors] = useState({});
  const [showMissingBanner, setShowMissingBanner] = useState(false);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Only the parsed (S2–S7) fields can be "missing from the file". S1 identity is
  // typed on this screen, so it is validated separately, not treated as a file gap.
  const parsedFields = SECTIONS.flatMap((s) => fieldsForSection(s.id)).filter(
    (f) => f.sheetRow != null
  );
  const missingFieldIds = parsedFields
    .filter((f) => !isFieldValid(f, parsedAnswers[f.id]))
    .map((f) => f.id);

  const parsedSections = SECTIONS.filter((s) => fieldsForSection(s.id).some((f) => f.sheetRow != null));

  function clearError(fieldId) {
    setErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }

  function handleContactChange(fieldId, value) {
    setContact((prev) => ({ ...prev, [fieldId]: value }));
    clearError(fieldId);
  }

  function handleDeclarationChange(fieldId, value) {
    setDeclaration((prev) => ({ ...prev, [fieldId]: value }));
    clearError(fieldId);
  }

  async function handleSubmit() {
    setSubmitError(null);
    if (missingFieldIds.length > 0) {
      setShowMissingBanner(true);
      return;
    }

    const newErrors = {};
    IDENTITY_FIELDS.forEach((f) => {
      if (!isFieldValid(f, contact[f.id])) {
        newErrors[f.id] =
          f.type === 'email' ? 'Enter a valid email address.' : 'This field is required.';
      }
    });
    DECLARATION_FIELDS.forEach((f) => {
      if (!isFieldValid(f, declaration[f.id])) {
        newErrors[f.id] = f.type === 'checkbox' ? 'Please confirm before continuing.' : 'This field is required.';
      }
    });
    const missingConsent = !consent;
    if (missingConsent) setConsentError('Please confirm consent before submitting.');
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    if (missingConsent) return;

    // Write BEFORE Confirmation. A failed write never advances — supplier retries.
    const answers = { ...parsedAnswers, ...contact, ...declaration };
    setSubmitting(true);
    try {
      await writeQuestionnaireSubmission({ answers, door: 'upload' });
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
        <div className="max-w-page mx-auto px-md md:px-2xl">
          <Header />
        </div>
      </header>

      <section className="py-3xl">
        <div className="max-w-page mx-auto px-md md:px-2xl max-w-content">
          <p className="font-body text-[13px] font-medium tracking-[0.16em] uppercase text-stone mb-md">
            Door 2 — Review
          </p>
          <h1 className="font-display text-2xl md:text-[32px] font-normal mb-md">
            Confirm what we read from your file
          </h1>
          <p className="mb-xl">
            Your answers below are read-only — if anything looks wrong, fix it in your file and
            re-upload. Please add your contact details, which we collect here rather than from the
            file.
          </p>

          {showMissingBanner && missingFieldIds.length > 0 && (
            <div className="border-l-2 p-md mb-lg bg-white" style={{ borderColor: '#C0392B' }}>
              <p style={{ color: '#C0392B' }}>
                {missingFieldIds.length} required answer{missingFieldIds.length === 1 ? '' : 's'} missing
                from the uploaded file. Fix your file and upload it again — flagged questions are
                marked below.
              </p>
            </div>
          )}

          {/* S1 — General Information: editable, collected on-screen */}
          <div className="mb-xl">
            <p className="font-body text-[13px] font-medium tracking-[0.16em] uppercase text-stone mb-xs">
              General Information
            </p>
            <h2 className="font-display text-xl mb-md">Your contact details</h2>
            {IDENTITY_FIELDS.map((field) => (
              <FieldInput
                key={field.id}
                field={field}
                value={contact[field.id]}
                error={errors[field.id]}
                onChange={(value) => handleContactChange(field.id, value)}
              />
            ))}
          </div>

          {/* S2–S7 — parsed answers, read-only */}
          {parsedSections.map((section) => (
            <div key={section.id} className="mb-xl">
              <p className="font-body text-[13px] font-medium tracking-[0.16em] uppercase text-stone mb-xs">
                {section.esrsHeader}
              </p>
              <h2 className="font-display text-xl mb-md">{section.title}</h2>

              {fieldsForSection(section.id).map((field) => {
                const value = parsedAnswers[field.id];
                const missing = !isFieldValid(field, value);
                return (
                  <div key={field.id} className="mb-md pb-md" style={{ borderBottom: '0.5px solid var(--tc-border)' }}>
                    <p className="text-sm mb-xs">{field.label}</p>
                    {missing ? (
                      <p className="text-[13px]" style={{ color: '#C0392B' }}>Missing — required</p>
                    ) : (
                      <p className="text-[15px] font-normal whitespace-pre-wrap">{value}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          <div className="mb-xl">
            <h2 className="font-display text-xl mb-md">Declaration</h2>
            {DECLARATION_FIELDS.map((field) => (
              <FieldInput
                key={field.id}
                field={field}
                value={declaration[field.id]}
                error={errors[field.id]}
                onChange={(value) => handleDeclarationChange(field.id, value)}
              />
            ))}
          </div>

          <div className="mb-lg pt-lg" style={{ borderTop: '0.5px solid var(--tc-border)' }}>
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

          {submitError && (
            <div className="border-l-2 p-md mb-lg bg-white" style={{ borderColor: '#C0392B' }}>
              <p style={{ color: '#C0392B' }}>{submitError}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button type="button" onClick={onReupload} className="tc-btn-secondary">
              Re-upload a different file
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="tc-btn-primary"
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
