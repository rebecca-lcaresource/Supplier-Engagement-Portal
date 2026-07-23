// Magic-link (passwordless email) auth via Supabase Auth. v4.0 gates the whole flow:
// a supplier verifies their email before choosing a route or entering data. They enter
// their email, receive a link, click it, and return signed in. Supabase sends the email
// through its configured SMTP provider (Resend) — no email code or Resend key lives here.
// The verified email + timestamp are read from the session and stored in their own
// suppliers columns (verified_email / verified_at), separate from the self-reported
// contact_email.
import { supabase } from './supabase.js';

// Send the magic link. emailRedirectTo must be an allowlisted URL in the Supabase
// dashboard (Authentication → URL Configuration → Redirect URLs).
export async function sendMagicLink(email) {
  if (!supabase) {
    throw new Error('Sign-in is not available right now. Please try again later.');
  }
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw new Error(error.message || 'We could not send the link. Please try again.');
}

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

// Subscribe to auth changes. cb(event, session). Returns an unsubscribe function.
export function onAuthChange(cb) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((event, session) => cb(event, session));
  return () => data.subscription.unsubscribe();
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
}

export function verifiedEmail(session) {
  return session?.user?.email ?? null;
}

// When the email was verified, taken from the session's user record.
export function verifiedAt(session) {
  const u = session?.user;
  return (
    u?.email_confirmed_at ||
    u?.confirmed_at ||
    u?.last_sign_in_at ||
    new Date().toISOString()
  );
}
