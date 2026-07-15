import Header from './Header.jsx';
import Hero from './Hero.jsx';
import Why from './Why.jsx';
import HowItWorks from './HowItWorks.jsx';
import DecisionTree from './DecisionTree.jsx';
import Timeline from './Timeline.jsx';
import Resources from './Resources.jsx';
import Footer from './Footer.jsx';

export default function LandingPage({ onCompleteQuestionnaire, onEcoVadis }) {
  return (
    <div>
      <header className="py-lg">
        <div className="max-w-page mx-auto px-md md:px-2xl">
          <Header />
        </div>
      </header>

      <Hero onSeeWhatToDo={() => document.getElementById('decision')?.scrollIntoView()} />

      <div className="max-w-page mx-auto px-md md:px-2xl"><div className="tc-divider" /></div>
      <Why />

      <div className="max-w-page mx-auto px-md md:px-2xl"><div className="tc-divider" /></div>
      <HowItWorks />

      <DecisionTree id="decision" onCompleteQuestionnaire={onCompleteQuestionnaire} onEcoVadis={onEcoVadis} />

      <section className="py-3xl">
        <div className="max-w-page mx-auto px-md md:px-2xl">
          <Timeline />
          <Resources />
        </div>
      </section>

      <Footer />
    </div>
  );
}
