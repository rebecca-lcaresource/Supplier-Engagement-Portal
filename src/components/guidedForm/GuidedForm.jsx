import { useState } from 'react';
import Header from '../landing/Header.jsx';
import SectionNav from './SectionNav.jsx';
import FieldInput from './FieldInput.jsx';
import {
  SECTIONS,
  fieldsForSection,
  isFieldValid,
  DECLARATION_FIELDS,
} from '../../data/questionnaireFields.js';

export default function GuidedForm({ onSubmit, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});

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
        newErrors[f.id] = f.type === 'checkbox' ? 'Please confirm before continuing.' : 'This field is required.';
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

  function handleSubmit() {
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

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setCurrentIndex(firstInvalidIndex);
      return;
    }

    onSubmit(answers);
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
            />
          ))}

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
              <button type="button" onClick={handleSubmit} className="tc-btn-primary">
                Submit
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
