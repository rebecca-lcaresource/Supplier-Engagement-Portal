import Header from './landing/Header.jsx';

export default function DoorChoice({ onChooseDoor1, onChooseDoor2, onBack }) {
  return (
    <div className="min-h-screen">
      <header className="py-lg">
        <div className="max-w-page mx-auto px-md md:px-2xl flex items-center justify-between">
          <Header />
          <button type="button" onClick={onBack} className="text-[13px] tracking-[0.08em] uppercase underline">
            Back to landing page
          </button>
        </div>
      </header>

      <section className="py-3xl">
        <div className="max-w-page mx-auto px-md md:px-2xl">
          <p className="font-body text-[13px] font-medium tracking-[0.16em] uppercase text-stone mb-md">
            Complete Questionnaire
          </p>
          <h1 className="font-display text-2xl md:text-[32px] font-normal mb-xl max-w-content">
            How would you like to complete it?
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <DoorCard
              label="Door 1"
              title="Fill in the tool"
              description="Answer each section directly in your browser, with a guided step-by-step form. Nothing you enter is saved or sent anywhere until you choose to download your PDF summary at the end."
              actionLabel="Start guided form"
              onClick={onChooseDoor1}
            />
            <DoorCard
              label="Door 2"
              title="Download and complete offline"
              description="Download the questionnaire template, complete it individually or with colleagues, then upload the finished file here for a quick review before you're done."
              actionLabel="Download & upload"
              onClick={onChooseDoor2}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function DoorCard({ label, title, description, actionLabel, onClick }) {
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
