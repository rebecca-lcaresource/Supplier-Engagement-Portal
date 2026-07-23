// Database writes. Every function here INSERTs and nothing else — no read ever
// touches suppliers or submissions (write-only invariant, spec Section 6). A rejected
// promise means "not recorded"; callers must show an error and must NOT show Confirmation
// (and, on the EcoVadis route, must NOT redirect).
//
// v4.0: every write runs in a verified (authenticated) session and records the verified
// email + timestamp from that session (separate from the self-reported contact_email).
import { supabase } from './supabase.js';
import { getSession, verifiedEmail, verifiedAt } from './auth.js';

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

// Read the verified identity from the current session. Throws if there is no verified
// session — which should never happen, since every write is behind the gate.
async function requireVerifiedIdentity() {
  const session = await getSession();
  const email = verifiedEmail(session);
  if (!email) {
    throw new Error('Your verification has expired. Please verify your email again.');
  }
  return { verified_email: email, verified_at: verifiedAt(session) };
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
  const identity = await requireVerifiedIdentity();
  const { error } = await supabase.from('suppliers').insert({
    company_name: companyName.trim(),
    country: country.trim(),
    contact_name: contactName.trim(),
    contact_email: contactEmail.trim(),
    verified_email: identity.verified_email,
    verified_at: identity.verified_at,
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
// the S1 identity fields populate the suppliers columns. contact_email is self-reported;
// verified_email/verified_at come from the session and are stored separately.
export async function writeQuestionnaireSubmission({ answers, door }) {
  requireClient();
  const identity = await requireVerifiedIdentity();
  const { error } = await supabase.rpc('submit_questionnaire', {
    p_company_name: String(answers.company_name || '').trim(),
    p_country: String(answers.country || '').trim(),
    p_contact_name: String(answers.contact_name || '').trim(),
    p_contact_email: String(answers.contact_email || '').trim(),
    p_verified_email: identity.verified_email,
    p_verified_at: identity.verified_at,
    p_consent_version: CONSENT_VERSION,
    p_door: door, // 'guided_form' | 'upload'
    p_answers: answers,
  });
  if (error) throw new Error(error.message || 'The submission could not be recorded.');
}
