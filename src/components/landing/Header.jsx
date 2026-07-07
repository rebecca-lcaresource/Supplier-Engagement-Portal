export default function Header({ dark = false }) {
  return (
    <div className="flex items-center gap-sm">
      <div className={`w-7 h-7 flex items-center justify-center ${dark ? 'bg-chalk' : 'bg-ink'}`}>
        <span className={`font-body font-medium text-sm ${dark ? 'text-ink' : 'text-chalk'}`}>C</span>
      </div>
      <span className={`font-body font-light tracking-[0.12em] uppercase text-sm ${dark ? 'text-chalk' : 'text-ink'}`}>
        The Corporate
      </span>
    </div>
  );
}
