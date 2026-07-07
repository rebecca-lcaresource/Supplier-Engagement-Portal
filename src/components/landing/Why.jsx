const THEMES = ['Climate', 'Pollution', 'Water', 'Circular economy', 'People', 'Governance'];

export default function Why() {
  return (
    <section className="py-3xl">
      <div className="max-w-page mx-auto px-md md:px-2xl max-w-content">
        <p className="font-body text-[13px] font-medium tracking-[0.16em] uppercase text-stone mb-md">
          Why we're asking
        </p>
        <h2 className="font-display text-2xl md:text-[32px] font-normal leading-[1.15] mb-lg">
          This is a shared journey, not a one-off request
        </h2>

        <p className="mb-lg">
          Most of The Corporate's carbon footprint does not sit inside our own plants. It sits with
          the suppliers in our value chain. Reaching net-zero means working with those businesses
          directly, not around them.
        </p>

        <p className="mb-lg">
          We are targeting net-zero by 2045, with a 50% reduction against our 2023 baseline by 2030.
          Supplier data is how we track progress toward both.
        </p>

        <p className="mb-lg">
          New sustainability reporting obligations mean we need clear visibility into supplier
          performance now. This programme is how we build that visibility together, ahead of when
          it is required.
        </p>

        <div>
          <p className="mb-md">
            This is the start of a working relationship. We're asking every Tier 1 supplier to
            engage with us across six priority themes:
          </p>
          <div className="flex flex-wrap gap-sm">
            {THEMES.map((theme) => (
              <span
                key={theme}
                className="border-[0.5px] border-stone px-[14px] py-[6px] text-xs tracking-[0.06em] uppercase"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
