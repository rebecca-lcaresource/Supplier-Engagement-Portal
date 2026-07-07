const STEPS = [
  { index: '01', title: 'Portal Launch', date: 'April 2026' },
  { index: '02', title: 'Data Submission deadline', date: '30 September 2026' },
  { index: '03', title: 'Review & Scoring', date: 'Q4 2026' },
  { index: '04', title: 'Partnership Plans', date: 'Q1 2027' },
];

export default function Timeline() {
  return (
    <>
      <p className="font-body text-[13px] font-medium tracking-[0.16em] uppercase text-stone mb-md">
        What happens next
      </p>
      <h2 className="font-display text-2xl md:text-[32px] font-normal mb-lg">Programme timeline</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg mb-2xl">
        {STEPS.map((step) => (
          <div key={step.index} className="border-t-2 border-ink pt-md">
            <p className="font-body text-xs text-stone tracking-[0.1em]">{step.index}</p>
            <p className="font-display text-xl my-xs">{step.title}</p>
            <p className="text-[13px] text-stone">{step.date}</p>
          </div>
        ))}
      </div>
    </>
  );
}
