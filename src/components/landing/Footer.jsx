import Header from './Header.jsx';

export default function Footer() {
  return (
    <footer className="bg-ink text-chalk py-2xl mt-3xl">
      <div className="max-w-page mx-auto px-md md:px-2xl">
        <Header dark />
        <p className="text-[13px] text-stone max-w-content mt-lg leading-relaxed">
          This portal and the resources linked from it are provided to Tier 1 suppliers of The
          Corporate for the purposes of the 2026 sustainability engagement programme. Please treat
          their contents as confidential to your organisation and do not redistribute outside it
          without our consent.
        </p>
      </div>
    </footer>
  );
}
