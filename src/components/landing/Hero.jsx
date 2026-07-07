export default function Hero({ onSeeWhatToDo }) {
  return (
    <section className="pt-xl pb-3xl">
      <div className="max-w-page mx-auto px-md md:px-2xl">
        <p className="font-body text-[13px] font-medium tracking-[0.16em] uppercase text-stone mb-md">
          2026 Supplier Sustainability Engagement Programme
        </p>
        <h1 className="font-display text-4xl md:text-[48px] font-bold leading-[1.05] tracking-[-0.01em] mb-md">
          Onboarding our Tier 1 suppliers into the{' '}
          <span className="border-b-2 border-lime pb-[2px]">2026</span> sustainability programme
        </h1>
        <p className="text-lg font-light max-w-content mb-xl">
          This page explains what The Corporate is asking of its Tier 1 suppliers, and why.
          Answer one question below to find the fastest path to respond.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
          <StatTile figure="690,000 tCO2e" label="Total footprint, 2023" />
          <StatTile figure="71%" label="Sits in Scope 3 — our value chain" />
          <StatTile figure="2045" label="Net-zero target year" />
          <StatTile figure="500+" label="Tier 1 suppliers" />
        </div>

        <div className="mt-xl">
          <button type="button" onClick={onSeeWhatToDo} className="tc-btn-primary">
            See what to do now
          </button>
        </div>
      </div>
    </section>
  );
}

function StatTile({ figure, label }) {
  return (
    <div className="bg-linen border-[0.5px] border-stone p-lg">
      <p className="font-display text-3xl md:text-[40px] font-bold leading-[1.1] mb-xs">{figure}</p>
      <p className="font-body text-xs font-normal tracking-[0.08em] uppercase text-stone">{label}</p>
    </div>
  );
}
