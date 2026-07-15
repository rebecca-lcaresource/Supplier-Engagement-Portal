import Header from './landing/Header.jsx';
import { SECTIONS } from '../data/questionnaireFields.js';
import { generateSubmissionPdf } from '../lib/generatePdf.js';

export default function Confirmation({ submission }) {
  const doorLabel = submission.door === 'guided_form' ? 'In-tool guided form' : 'Download & upload';

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
            Submission received
          </p>
          <h1 className="font-display text-2xl md:text-[32px] font-normal mb-lg">
            Thank you — your assessment is complete
          </h1>

          <div className="bg-linen border-[0.5px] border-stone p-lg mb-xl">
            <p className="mb-sm">
              <span className="font-medium">Completed via:</span> {doorLabel}
            </p>
            <p>
              <span className="font-medium">Sections completed:</span> {SECTIONS.map((s) => s.id).join(', ')}
            </p>
          </div>

          <p className="mb-lg">
            Your submission has been recorded by The Corporate. You do not need to do anything
            further, and no confirmation email is sent — download a PDF summary below if you would
            like your own copy.
          </p>

          <p className="mb-xl text-sm text-stone">
            Your data is kept for 24 months, after which it is deleted. To access or delete your
            data, email <a href="mailto:rebecca@lcaresource.com">rebecca@lcaresource.com</a>.
          </p>

          <button
            type="button"
            onClick={() => generateSubmissionPdf(submission)}
            className="tc-btn-primary"
          >
            Download PDF
          </button>
        </div>
      </section>
    </div>
  );
}
