// GDPR consent control. Required and unticked by default at all three submission points
// (Guided Form final step, Upload Review, EcoVadis Registration). Submit/Continue is
// blocked until it is ticked. The text is written in the brand voice — plain, direct,
// not legalese — and states what is collected, why, where it is stored, for how long,
// and how to have it deleted (spec Section 7). Keep CONSENT_VERSION (src/lib/db.js) in
// step with any wording change here.
const DELETION_EMAIL = 'rebecca@lcaresource.com';

// `variant` tailors the "what we collect" clause to the route.
const DATA_CLAUSE = {
  questionnaire:
    'your company details, your name, and your email address, together with your questionnaire answers,',
  ecovadis:
    'your company details, your name, and your email address, together with your EcoVadis scorecard link,',
};

export default function ConsentCheckbox({ variant = 'questionnaire', checked, onChange, error }) {
  return (
    <div className="mb-lg">
      <label htmlFor="gdpr-consent" className="flex items-start gap-sm cursor-pointer">
        <input
          id="gdpr-consent"
          type="checkbox"
          checked={checked === true}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1"
        />
        <span className="text-sm">
          I consent to The Corporate storing {DATA_CLAUSE[variant]} to assess supplier
          sustainability performance. The data is held securely in the United States
          (Supabase, us-east-1) and kept for 24 months, after which it is deleted. To
          access or delete your data, email{' '}
          <a href={`mailto:${DELETION_EMAIL}`}>{DELETION_EMAIL}</a>.
        </span>
      </label>
      {error && (
        <p className="text-[13px] mt-xs" style={{ color: '#C0392B' }}>
          {error}
        </p>
      )}
    </div>
  );
}
