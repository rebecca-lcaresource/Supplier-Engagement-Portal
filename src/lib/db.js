// Database writes. Every function here INSERTs and nothing else — no read ever
// touches suppliers or submissions (write-only invariant, spec Section 6). A rejected
// promise means "not recorded"; callers must show an error and must NOT show Confirmation
// (and, on the EcoVadis route, must NOT redirect).
import { supabase } from './supabase.js';
import { getSession, verifiedEmail } from './auth.js';

// The version of the consent wording the supplier agreed to. Bump when the text changes
// so historic consents stay auditable (stored on every suppliers row).
export const CONSENT_VERSION = '2026-v1';

function requireClient() {
  if (!supabase) {
    throw new Error(
      'The submission service is not available right now. Please try again later.'
    );
  }
}

// EcoVadis route — a single suppliers row (route=ecovadis, status=declared).
// No submission row. id is left to the DB default; we never read it back.
export async function writeEcoVadisRegistration({
  companyName,
  country,
  contactName,
  contactEmail,
  scorecardUrl,
}) {
  requireClient();
  const { error } = await supabase.from('suppliers').insert({
    company_name: companyName.trim(),
    country: country.trim(),
    contact_name: contactName.trim(),
    contact_email: contactEmail.trim(),
    route: 'ecovadis',
    status: 'declared',
    ecovadis_scorecard_url: scorecardUrl.trim(),
    consent_given: true,
    consent_at: new Date().toISOString(),
    consent_version: CONSENT_VERSION,
  });
  if (error) throw new Error(error.message || 'The submission could not be recorded.');
}

// Questionnaire route (both doors) — suppliers + submissions written atomically by the
// submit_questionnaire RPC (one transaction; no orphan supplier row if the second insert
// fails). answers is the identical JSON shape both doors produce, keyed by question id;
// the S1 identity fields (company_name, country, contact_name, contact_email) populate
// the suppliers columns directly.
export async function writeQuestionnaireSubmission({ answers, door }) {
  requireClient();
  // The recorded contact email is ALWAYS the magic-link-verified address — never a value
  // typed into the form — so a stored response is always tied to a proven email. Fall back
  // to the form value only if there is somehow no session (e.g. auth misconfigured).
  const session = await getSession();
  const email = verifiedEmail(session) || String(answers.contact_email || '').trim();
  const finalAnswers = { ...answers, contact_email: email };
  const { error } = await supabase.rpc('submit_questionnaire', {
    p_company_name: String(answers.company_name || '').trim(),
    p_country: String(answers.country || '').trim(),
    p_contact_name: String(answers.contact_name || '').trim(),
    p_contact_email: email,
    p_consent_version: CONSENT_VERSION,
    p_door: door, // 'guided_form' | 'upload'
    p_answers: finalAnswers,
  });
  if (error) throw new Error(error.message || 'The submission could not be recorded.');
}
