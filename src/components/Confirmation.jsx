import Header from './landing/Header.jsx';
import { SECTIONS } from '../data/questionnaireFields.js';
import { generateSubmissionPdf } from '../lib/generatePdf.js';

export default function Confirmation({ submission }) {
  const doorLabel = submission.door === 'door1' ? 'In-tool guided form' : 'Download & upload';

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
            Nothing you entered has been sent or stored anywhere — this browser session is the
            only place it exists. Download a PDF summary now if you'd like a record, since closing
            or refreshing this tab clears everything.
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
