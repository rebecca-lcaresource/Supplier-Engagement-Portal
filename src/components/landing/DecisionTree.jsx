// v4.0: the landing page no longer offers the route choice. The two route buttons are
// replaced by a single "Start submission" CTA; the routes are described here only as
// context. The EcoVadis-vs-questionnaire choice happens after email verification
// (Route Choice screen).
export default function DecisionTree({ id, onStartSubmission }) {
  return (
    <section id={id} className="py-3xl bg-linen">
      <div className="max-w-page mx-auto px-md md:px-2xl">
        <p className="font-body text-[13px] font-medium tracking-[0.16em] uppercase text-stone mb-md">
          What you do now
        </p>
        <h2 className="font-display text-2xl md:text-[26px] font-normal mb-lg max-w-content">
          Verify your email, then choose the route that fits you.
        </h2>
        <p className="mb-2xl max-w-content">
          To begin, confirm your email address — we'll send a one-time link. Once verified, you'll
          pick one of two routes:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-2xl">
          <PathCard
            label="Route A"
            title="EcoVadis"
            instruction="If you hold a valid EcoVadis scorecard, register your details and continue to EcoVadis to share it — no duplicate assessment."
          />
          <PathCard
            label="Route B"
            title="Questionnaire"
            instruction="Complete The Corporate's assessment in the tool, or download it, finish offline, and upload the result."
          />
        </div>

        <button type="button" onClick={onStartSubmission} className="tc-btn-primary">
          Start submission
        </button>
      </div>
    </section>
  );
}

function PathCard({ label, title, instruction }) {
  return (
    <div className="bg-white p-lg" style={{ border: '0.5px solid var(--tc-stone)' }}>
      <p className="font-body text-[13px] font-medium tracking-[0.1em] uppercase text-stone mb-xs">{label}</p>
      <h3 className="font-display text-2xl mb-md">{title}</h3>
      <p>{instruction}</p>
    </div>
  );
}
