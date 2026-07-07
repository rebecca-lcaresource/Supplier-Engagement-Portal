import { SECTIONS } from '../../data/questionnaireFields.js';

export default function SectionNav({ currentIndex, onJump }) {
  return (
    <div className="mb-xl">
      <p className="font-body text-[13px] font-medium tracking-[0.16em] uppercase text-stone mb-sm">
        Section {currentIndex + 1} of {SECTIONS.length}
      </p>
      <div className="flex flex-wrap gap-xs">
        {SECTIONS.map((section, i) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onJump(i)}
            className="font-body text-[11px] tracking-[0.08em] uppercase px-sm py-xs border-[0.5px]"
            style={{
              borderColor: i === currentIndex ? 'var(--tc-ink)' : 'var(--tc-stone)',
              background: i === currentIndex ? 'var(--tc-ink)' : 'transparent',
              color: i === currentIndex ? 'var(--tc-chalk)' : 'var(--tc-ink)',
            }}
          >
            {section.id}
          </button>
        ))}
      </div>
    </div>
  );
}
