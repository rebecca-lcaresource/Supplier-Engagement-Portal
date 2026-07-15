// Database writes. Every function here INSERTs and nothing else — no read ever
// touches suppliers or submissions (write-only invariant, spec Section 6). A rejected
// promise means "not recorded"; callers must show an error and must NOT show Confirmation
// (and, on the EcoVadis route, must NOT redirect).
import { supabase } from './supabase.js';

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
// fails). answers is the identical JSON shape both doors produce, keyed by question id.
export async function writeQuestionnaireSubmission({ answers, door }) {
  requireClient();
  const identity = deriveIdentity(answers);
  const { error } = await supabase.rpc('submit_questionnaire', {
    p_company_name: identity.companyName,
    p_country: identity.country,
    p_contact_name: identity.contactName,
    p_contact_email: identity.contactEmail,
    p_consent_version: CONSENT_VERSION,
    p_door: door, // 'guided_form' | 'upload'
    p_answers: answers,
  });
  if (error) throw new Error(error.message || 'The submission could not be recorded.');
}

// The questionnaire's S1 is free text: s1_q1 holds "legal name and registered country",
// s1_q2 holds "contact name, title, and email". The suppliers identity columns are
// derived from them (the full answers JSON remains the authoritative detailed record).
// contact_email is extracted so dashboard dedupe-by-email works; the rest are stored
// verbatim. See PROGRESS.md build decisions.
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;

function deriveIdentity(answers) {
  const s1q1 = String(answers.s1_q1 || '').trim();
  const s1q2 = String(answers.s1_q2 || '').trim();
  const email = s1q2.match(EMAIL_RE);
  return {
    companyName: s1q1 || 'Not provided',
    country: s1q1 || 'Not provided',
    contactName: s1q2 || 'Not provided',
    contactEmail: email ? email[0] : s1q2 || 'Not provided',
  };
}
