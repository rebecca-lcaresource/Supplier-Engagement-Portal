export default function HowItWorks() {
  return (
    <section className="py-3xl">
      <div className="max-w-page mx-auto px-md md:px-2xl max-w-content">
        <div className="bg-ink px-3 py-1 inline-block mb-md">
          <span className="text-lime text-[10px] tracking-[0.14em] uppercase font-medium">
            Smart Intake
          </span>
        </div>
        <h2 className="font-display text-2xl md:text-[32px] font-normal leading-[1.15] mb-xl">
          How it works
        </h2>
        <p className="mb-xl">
          We recognise existing standards. If you hold a valid EcoVadis scorecard, it satisfies
          this programme — no separate assessment needed. If you don't, you complete one structured
          questionnaire, once.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div className="bg-white border-[0.5px] border-[rgba(182,176,159,0.35)] p-lg">
            <h3 className="font-body text-lg font-medium tracking-[0.08em] uppercase mb-sm">
              Recognise existing standards
            </h3>
            <p>A current EcoVadis scorecard stands in place of our own assessment. No duplicate work.</p>
          </div>
          <div className="bg-white border-[0.5px] border-[rgba(182,176,159,0.35)] p-lg">
            <h3 className="font-body text-lg font-medium tracking-[0.08em] uppercase mb-sm">
              Ask once, then partner
            </h3>
            <p>
              One structured questionnaire, completed a single time. From there, we work together
              on the priorities it surfaces.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
