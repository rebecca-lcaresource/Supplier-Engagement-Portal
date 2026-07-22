// Magic-link (passwordless email) auth via Supabase Auth. Used to verify a supplier's
// email before they complete the questionnaire: they enter their email, receive a link,
// click it, and return signed in. Supabase sends the email through the configured SMTP
// provider (Resend). The verified email becomes the recorded contact email.
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
