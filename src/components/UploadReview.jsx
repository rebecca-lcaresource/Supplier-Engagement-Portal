import { useState } from 'react';
import Header from './landing/Header.jsx';
import FieldInput from './guidedForm/FieldInput.jsx';
import {
  SECTIONS,
  fieldsForSection,
  DECLARATION_FIELDS,
  isFieldValid,
} from '../data/questionnaireFields.js';

export default function UploadReview({ parsedAnswers, onReupload, onSubmit }) {
  const [declaration, setDeclaration] = useState({});
  const [errors, setErrors] = useState({});
  const [showMissingBanner, setShowMissingBanner] = useState(false);

  const missingFieldIds = SECTIONS.flatMap((s) => fieldsForSection(s.id))
    .filter((f) => !isFieldValid(f, parsedAnswers[f.id]))
    .map((f) => f.id);

  function handleDeclarationChange(fieldId, value) {
    setDeclaration((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }

  function handleSubmit() {
    if (missingFieldIds.length > 0) {
      setShowMissingBanner(true);
      return;
    }

    const newErrors = {};
    DECLARATION_FIELDS.forEach((f) => {
      if (!isFieldValid(f, declaration[f.id])) {
        newErrors[f.id] = f.type === 'checkbox' ? 'Please confirm before continuing.' : 'This field is required.';
      }
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({ ...parsedAnswers, ...declaration });
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
            This is a read-only summary. If anything looks wrong, fix it in your file and
            re-upload — values can't be edited here.
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

          {SECTIONS.map((section) => (
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

          <div className="flex items-center justify-between">
            <button type="button" onClick={onReupload} className="tc-btn-secondary">
              Re-upload a different file
            </button>
            <button type="button" onClick={handleSubmit} className="tc-btn-primary">
              Submit
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
