import { useState } from 'react';
import Header from './landing/Header.jsx';
import { sendMagicLink } from '../lib/auth.js';

const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[\w.-]+$/;

// Verifies a supplier's email before the questionnaire. They enter their email, we send
// a magic link; when they click it they return signed in (handled in App). The verified
// email is then recorded as the contact email on their submission.
export default function EmailGate({ onBack }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    setError(null);
    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setSending(true);
    try {
      await sendMagicLink(email);
      setSent(true);
    } catch (err) {
      const msg = err.message || '';
      setError(
        /failed to fetch|network/i.test(msg)
          ? "We couldn't reach the server. Check your connection and try again."
          : msg || 'We could not send the link. Please try again.'
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="py-lg">
        <div className="max-w-page mx-auto px-md md:px-2xl flex items-center justify-between">
          <Header />
          <button
            type="button"
            onClick={onBack}
            className="text-[13px] tracking-[0.08em] uppercase underline"
          >
            Back
          </button>
        </div>
      </header>

      <section className="py-3xl">
        <div className="max-w-page mx-auto px-md md:px-2xl max-w-content">
          <p className="font-body text-[13px] font-medium tracking-[0.16em] uppercase text-stone mb-md">
            Verify your email
          </p>

          {sent ? (
            <>
              <h1 className="font-display text-2xl md:text-[32px] font-normal mb-lg">
                Check your email
              </h1>
              <p className="mb-lg">
                We've sent a secure link to <span className="font-medium">{email.trim()}</span>.
                Open it on this device to continue to the questionnaire. The link is single-use
                and expires shortly.
              </p>
              <p className="mb-xl text-sm text-stone">
                No email after a minute or two? Check your spam folder, or go back and try again.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setError(null);
                }}
                className="tc-btn-secondary"
              >
                Use a different email
              </button>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl md:text-[32px] font-normal mb-md">
                Enter your email to begin
              </h1>
              <p className="mb-xl">
                We'll send you a secure link to confirm it's you. This email is recorded with
                your submission so The Corporate can reach the right contact.
              </p>

              <div className="mb-lg">
                <label htmlFor="gate-email" className="block mb-xs">
                  <span className="font-body text-sm text-ink">Work email address</span>
                </label>
                <input
                  id="gate-email"
                  type="email"
                  className={`tc-input ${error ? 'has-error' : ''}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend();
                  }}
                />
                {error && (
                  <p className="text-[13px] mt-xs" style={{ color: '#C0392B' }}>
                    {error}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mt-xl">
                <button type="button" onClick={onBack} className="tc-btn-secondary">
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending}
                  className="tc-btn-primary"
                >
                  {sending ? 'Sending…' : 'Send me the link'}
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
