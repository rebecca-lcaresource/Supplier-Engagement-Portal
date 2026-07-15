import { useState } from 'react';

export default function DecisionTree({ id, onCompleteQuestionnaire, onEcoVadis }) {
  const [answer, setAnswer] = useState(null); // null | 'yes' | 'no'

  return (
    <section id={id} className="py-3xl bg-linen">
      <div className="max-w-page mx-auto px-md md:px-2xl">
        <p className="font-body text-[13px] font-medium tracking-[0.16em] uppercase text-stone mb-md">
          What you do now
        </p>
        <h2 className="font-display text-2xl md:text-[26px] font-normal mb-lg max-w-content">
          Do you hold a valid EcoVadis scorecard issued within the last 12 months?
        </h2>

        <div className="flex items-center gap-md flex-wrap mb-2xl">
          <button
            type="button"
            className="tc-yn-btn"
            aria-pressed={answer === 'yes'}
            style={answer === 'yes' ? { background: 'var(--tc-ink)', color: 'var(--tc-chalk)' } : undefined}
            onClick={() => setAnswer('yes')}
          >
            Yes
          </button>
          <button
            type="button"
            className="tc-yn-btn"
            aria-pressed={answer === 'no'}
            style={answer === 'no' ? { background: 'var(--tc-ink)', color: 'var(--tc-chalk)' } : undefined}
            onClick={() => setAnswer('no')}
          >
            No
          </button>
          <button
            type="button"
            className="font-body text-xs font-normal tracking-[0.08em] uppercase text-stone underline hover:text-ink px-sm py-[12px]"
            onClick={() => setAnswer(null)}
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <PathCard
            label="Path A"
            title="EcoVadis"
            instruction="Register your details, then continue to EcoVadis to share your current scorecard."
            emphasized={answer === 'yes'}
            dimmed={answer === 'no'}
          >
            <button type="button" onClick={onEcoVadis} className="tc-btn-primary">
              Continue to EcoVadis
            </button>
          </PathCard>

          <PathCard
            label="Path B"
            title="Questionnaire"
            instruction="Complete the assessment in the tool, or download it, finish offline, and upload the result."
            emphasized={answer === 'no'}
            dimmed={answer === 'yes'}
          >
            <button type="button" onClick={onCompleteQuestionnaire} className="tc-btn-primary">
              Complete Questionnaire
            </button>
          </PathCard>
        </div>
      </div>

      <style>{`
        .tc-yn-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: transparent;
          color: var(--tc-ink);
          border: 0.5px solid var(--tc-ink);
          border-radius: 0;
          padding: 12px 32px;
          cursor: pointer;
        }
      `}</style>
    </section>
  );
}

function PathCard({ label, title, instruction, emphasized, dimmed, children }) {
  return (
    <div
      className="bg-white p-lg transition-opacity duration-150"
      style={{
        border: emphasized ? '1px solid var(--tc-ink)' : '0.5px solid var(--tc-stone)',
        opacity: dimmed ? 0.45 : 1,
      }}
    >
      <p className="font-body text-[13px] font-medium tracking-[0.1em] uppercase text-stone mb-xs">{label}</p>
      <h3 className="font-display text-2xl mb-md">{title}</h3>
      <p className="mb-lg">{instruction}</p>
      {children}
    </div>
  );
}
