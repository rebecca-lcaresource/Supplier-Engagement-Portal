# The Corporate Supplier Sustainability Portal 2026

## Identity
Public page that verifies a supplier's email (magic link) before they choose a route, then routes them to EcoVadis (via a short registration screen) or The Corporate's questionnaire (guided form or download-complete-upload), and stores what they submit to Supabase. Anyone with the link can start; they prove they own a reachable email first. Rebecca reads responses in the Supabase dashboard — the app never reads them back.
Tier: 3 — public supplier portal; suppliers verify a real email via magic link before choosing a route or entering data; submissions persist to Supabase; no roles, no returning-user login (D3+A2 — authentication, no authorization).
Spec version governed: v4.0 — the version of docs/product-spec.md these rules were derived from.
Position: Standalone — its own Supabase project, no other tools share it. (A future link to the Supplier Sustainability Scorecard is out of scope.)

## Session Protocol
At the start of every session:
1. Pull the latest from main before reading anything else.
2. Check docs/product-spec.md: if its version is newer than the "Spec version governed" line above, STOP and tell the builder to re-run the Project Governor on the revised spec before building. Do not build against a stale CLAUDE.md.
3. Read PROGRESS.md in the root — it is the current state of this build. If missing, recreate it with the structure below, then continue.
4. Increment the session number and update the date in PROGRESS.md.
5. If "Notes for next session" has content: repeat it back to the builder, treat it as this session's priorities, then clear the section.
6. First Session Setup already ran in the v1.0 build. Do not re-run it; confirm docs/, the the-corporate-brand skill, and the questionnaire asset are still in place, then build.

Save point — after completing any module, feature, fix, or schema change:
1. Update PROGRESS.md: current state, remaining work, build decisions, known issues.
2. If the database was touched (any table, policy, or auth change), update docs/supabase-setup.md in the same save point.
3. Commit and push to main.
4. Tell the builder in one line: "Save point committed: [what changed]."
Do not start the next piece of work before the save point is pushed. An ending session is a save point.

PROGRESS.md structure (for the recreate rule): status header (Session / Last updated / Live URL), Current state, Last session (3–5 lines, replace each session), Remaining work (shrinking checklist), Build decisions (one line each), Known issues, Notes for next session.

## Commands
```
npm install
npm run dev
npm run build
```

## Tech Stack
React · Vite · Tailwind CSS · Netlify · Supabase (Database + Auth)
Deployment: GitHub → Netlify, auto-deploys from main. Netlify MCP is not active — the repo is already connected and the builder manages environment variables in the Netlify dashboard. Build settings live in `netlify.toml` (`npm run build`, publish `dist`, Node 22). Netlify is the sole deploy target.

## Arms
Export — browser only, no server function — (1) downloads the unchanged questionnaire template (XLSX) from Door 2; (2) generates a branded client-side PDF summary of the supplier's submitted answers (S1–S7, door used, date) on the Confirmation screen.
No email arm: the magic-link verification email is sent by **Supabase Auth via Resend custom SMTP** (configured in the Supabase dashboard), NOT by application code. **Do not build any email function** (no Netlify Function, no Edge Function) and never place a Resend key in the project.

## Environment Variables
VITE_SUPABASE_URL — Supabase: Project Settings → API → Project URL — Netlify env var
VITE_SUPABASE_ANON_KEY — Supabase: Project Settings → API → anon / public key — Netlify env var
Both already set in Netlify (prior build). The frontend uses the anon key for the magic-link sign-in call; it is public by design and protected by RLS. The **Resend credential is NOT an environment variable** — it lives only in the Supabase Auth SMTP settings in the dashboard, never in code, env vars, or the repo. The service-role key is never used, never added, never committed. No secret value ever appears in any file committed to GitHub.

## Supabase
Project: "Supplier-Engagement-Portal" — already exists. Project URL: https://hqqngissvcbevktcizit.supabase.co (region us-east-1, Postgres 17).
docs/supabase-setup.md is the schema source of truth. Read it before any database work. Never recreate tables, policies, or the RPC that already exist. Update it at every save point that touches the database.
Plan: Free — pauses after ~1 week idle. A paused project now breaks **login** (the magic link cannot be sent or completed), not just submissions. Recommend upgrading to Pro before real supplier traffic (manual billing step in the dashboard, flag until done).

Tables this tool uses:
`suppliers`: company_name, country, contact_name, contact_email, **verified_email (NEW)**, **verified_at (NEW)**, route, status, ecovadis_scorecard_url, consent_given, consent_at, consent_version, created_at
`submissions`: supplier_id (FK → suppliers.id), submitted_at, door, answers (jsonb), created_at
Index: submissions.supplier_id
RLS: `suppliers` — authenticated: INSERT-only; no select/update/delete. anon: no access. `submissions` — same.
Auth: magic link — open signup. Supabase Auth manages auth.users. The verified email + timestamp are read from the session and written to suppliers.verified_email / verified_at at submit (questionnaire) or register (EcoVadis).

v4.0 additive database changes to make, then document in docs/supabase-setup.md:
- Add `verified_email` (text, not null) and `verified_at` (timestamptz, not null) to `suppliers`.
- Enable Supabase Auth magic-link, open signup.
- Move INSERT from `anon` to `authenticated` on both tables (INSERT policies + GRANTs); revoke all `anon` access to both tables.
- Move the `submit_questionnaire` RPC's EXECUTE from `anon` to `authenticated`; add `p_verified_email text` and `p_verified_at timestamptz` parameters.
- Verify before building any UI: acting as `authenticated`, INSERT succeeds and SELECT/UPDATE/DELETE are denied; acting as `anon`, INSERT is denied.

## Hard Rules
- API keys never in any frontend file or GitHub commit. The Supabase anon key is public by design, protected by RLS. The Resend credential lives ONLY in Supabase Auth SMTP settings. Do NOT build an email function — Supabase Auth sends the magic link via custom SMTP.
- Netlify Identity: never. Supabase Auth is the only authentication system in this stack.
- RLS never disabled on any table. `anon` has no table access; `authenticated` is INSERT-only on both tables. Never add a SELECT/UPDATE/DELETE policy for any client role.
- **Write-only.** The app INSERTs to `suppliers` and `submissions` and NEVER reads them — no `.select()` against either table anywhere in `src/`. A verified session does NOT unlock reads. Reading happens only in the Supabase dashboard.
- **Verification is a hard gate.** Route Choice, EcoVadis Registration, and all data-entry screens are unreachable without a verified session. A supplier arriving without one (e.g. a bookmarked deep link) is sent back to Email Entry.
- No row may be inserted with `consent_given = false`. `consent_given` / `consent_at` / `consent_version` are written on every `suppliers` row.
- A failed database write NEVER shows a Confirmation screen — the supplier sees a clear "not recorded" error and a retry. On the EcoVadis route, a failed write blocks the redirect.
- `verified_email` and `contact_email` are stored separately and are NOT enforced to match — email-ownership validation is UI-only.
- The Supabase service-role key is never used, added, or committed. It bypasses RLS.
- GDPR: consent checkbox + the confirmed data statement required before any submit or redirect. Personal data: contact name, contact email, and the verified email (also in auth.users). Retention 24 months, manual deletion. Deletion requests → rebecca@lcaresource.com, and must also delete the supplier's Supabase Auth user. Supabase region is us-east-1 (US) — disclosed in consent text; it cannot change without a new project (flag, do not attempt to change).
- Do not change Door 1 / Door 2 internals, the EcoVadis Registration internals, or the consent flow — v4.0 changes only *when* these screens are reached (after verification), never how they work.

## Brand
Governed by the the-corporate-brand skill at .claude/skills/the-corporate-brand/SKILL.md (installed in the v1.0 build). Invoke it for all UI, including the new Email Entry, Check-Your-Inbox, and Route Choice screens, and the consent copy.
Hard rules that hold even if the skill is not loaded:
- Background: #F2F2F2 (Chalk) — never white or Tailwind gray defaults
- Accent, buttons, CTAs: #000000 (Ink); links underlined in Ink, never blue
- Fonts: Playfair Display for headlines, DM Sans for body
- Square corners (border-radius: 0); no drop shadows, no gradients. Acid Lime #C8F135 only against black, sparingly.
The magic-link email uses the plain default Supabase template — it is not brand-styled in v4.0.

## Business Rules
- Landing page: the two route buttons are replaced by a single "Start submission" CTA; the routes are still described as context. "Start submission" opens Email Entry — never EcoVadis or Door Choice directly.
- Flow order: Landing → Start submission → Email Entry → magic link → verified session → Route Choice → (EcoVadis Registration) OR (Door Choice → Guided Form / Upload) → Confirmation.
- The EcoVadis-vs-questionnaire choice happens at Route Choice, AFTER verification — not on the landing page.
- Both doors emit an identical `answers` JSON shape keyed by question ID (unchanged from v3.0).
- Both write paths run as `authenticated` and include `verified_email` + `verified_at`. Questionnaire route = the atomic `submit_questionnaire` RPC; EcoVadis route = a single `suppliers` insert.
- Confirmation states the submission was recorded, shows the 24-month retention and rebecca@lcaresource.com, and offers Download PDF. No confirmation email is sent.

Out of scope — do not build:
- Resend-link button, cooldowns, or rate-limit UI
- Any visible "verified" badge or indicator to the supplier
- Database-level enforcement that `verified_email` = `contact_email` (UI-only)
- Any change to Door 1 / Door 2 internals or EcoVadis routing internals
- Account pages, passwords, or a returning-user login; linking submissions to a user_id
- Brand-styled magic-link email (Send-Email Auth Hook)
- Any in-app screen that reads or displays submissions (needs A3); Scorecard connection
- Automated 24-month retention deletion; deduplication / unique-email constraint
- Confirmation email to the supplier; storing the uploaded file; CAPTCHA / bot protection

## Reference Docs
Read before building the related part:
- docs/product-spec.md — full screen specs, flow order, DB write logic, GDPR, RLS, and the 25 acceptance criteria
- docs/supabase-setup.md — schema source of truth (exists — read first)
- .claude/skills/the-corporate-brand/SKILL.md — full brand system
PROGRESS.md in the root is read at every session start per the Session Protocol.
