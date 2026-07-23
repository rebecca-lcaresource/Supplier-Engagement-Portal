import Header from './landing/Header.jsx';

// Reached only in a verified session (after the magic link). The EcoVadis-vs-questionnaire
// choice that used to be two buttons on the landing page now lives here.
export default function RouteChoice({ onEcoVadis, onQuestionnaire }) {
  return (
    <div className="min-h-screen">
      <header className="py-lg">
        <div className="max-w-page mx-auto px-md md:px-2xl">
          <Header />
        </div>
      </header>

      <section className="py-3xl">
        <div className="max-w-page mx-auto px-md md:px-2xl">
          <p className="font-body text-[13px] font-medium tracking-[0.16em] uppercase text-stone mb-md">
            Email verified
          </p>
          <h1 className="font-display text-2xl md:text-[32px] font-normal mb-xl max-w-content">
            How would you like to respond?
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <RouteCard
              label="Route A"
              title="EcoVadis"
              description="Already hold a valid EcoVadis scorecard? Register your details and continue to EcoVadis to share it. No duplicate assessment."
              actionLabel="Complete via EcoVadis"
              onClick={onEcoVadis}
            />
            <RouteCard
              label="Route B"
              title="The Corporate's questionnaire"
              description="Complete the assessment in the tool with a guided step-by-step form, or download it, finish offline, and upload the workbook."
              actionLabel="Complete the questionnaire"
              onClick={onQuestionnaire}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function RouteCard({ label, title, description, actionLabel, onClick }) {
  return (
    <div className="bg-white border-[0.5px] border-stone p-lg flex flex-col">
      <p className="font-body text-[13px] font-medium tracking-[0.1em] uppercase text-stone mb-xs">{label}</p>
      <h2 className="font-display text-2xl mb-md">{title}</h2>
      <p className="mb-lg flex-1">{description}</p>
      <button type="button" onClick={onClick} className="tc-btn-primary self-start">
        {actionLabel}
      </button>
    </div>
  );
}
