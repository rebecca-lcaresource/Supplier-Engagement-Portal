// Supabase client — the ONLY database connection in the app.
//
// The app is WRITE-ONLY (see CLAUDE.md Hard Rules / spec Section 6). It only ever
// INSERTs (directly for the EcoVadis route, via the submit_questionnaire RPC for the
// questionnaire route) and NEVER reads from suppliers or submissions. RLS on
// Supabase denies the anon role every read; this client cannot read a row even if asked.
//
// Only the public URL + anon (publishable) key are used. The anon key is public by
// design — its safety rests entirely on the RLS policies, not on being hidden. The
// service-role key is never imported here or anywhere in this repo.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Missing at build time (e.g. local dev without env). Writes surface a handled
  // error to the supplier rather than crashing the app on load.
  // eslint-disable-next-line no-console
  console.error(
    'Supabase is not configured: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing.'
  );
}

// Sessions are ON so magic-link (Supabase Auth) sign-in works: detectSessionInUrl
// picks up the token when a supplier returns from the emailed link, persistSession
// keeps them signed in through the questionnaire. The app is still write-only —
// even a signed-in supplier can only INSERT (enforced by RLS), never read.
export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;
