# The Corporate Supplier Sustainability Portal 2026

## Identity
Public page that routes Tier 1 suppliers to EcoVadis (via a short registration screen) or The Corporate's questionnaire (guided form or download-complete-upload), and stores what they submit to Supabase. Anyone with the link can use it, no login. Rebecca reads responses in the Supabase dashboard — the app never reads them back.
Tier: 2 — public page, no login, supplier submissions persist to Supabase; the app is write-only (D3+A1).
Spec version governed: v3.0 — the version of docs/product-spec.md these rules were derived from.
Position: Standalone — its own Supabase project, no other tools share it. (A future link to the Supplier Sustainability Scorecard is out of scope.)

## Session Protocol
At the start of every session:
1. Pull the latest from main before reading anything else.
2. Check docs/product-spec.md: if its version is newer than the "Spec version governed" line above, STOP and tell the builder to re-run the Project Governor on the revised spec before building. Do not build against a stale CLAUDE.md.
3. Read PROGRESS.md in the root — it is the current state of this build. If missing, recreate it with the structure below, then continue.
4. Increment the session number and update the date in PROGRESS.md.
5. If "Notes for next session" has content: repeat it back to the builder, treat it as this session's priorities, then clear the section.
6. First Session Setup already ran in the v1.0 build. Do not re-run it; confirm docs/, the brand skill, and the questionnaire asset are still in place, then build.

Save point — after completing any module, feature, fix, or schema change:
1. Update PROGRESS.md: current state, remaining work, build decisions, known issues.
2. If the database was touched (any table or policy change), update docs/supabase-setup.md in the same save point.
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
React · Vite · Tailwind CSS · Netlify · Supabase
Deployment: GitHub → Netlify, auto-deploys from main. Netlify MCP is not active — the repo is already connected and the builder has added the environment variables in the Netlify dashboard (14 July 2026). **Netlify is the sole deploy target; the GitHub Pages backup is retired** — remove `.github/workflows/deploy-pages.yml` and the `VITE_BASE` subpath handling, and return Vite `base` to `/`. Build settings live in `netlify.toml` (`npm run build`, publish `dist`, Node 22).

## Arms
Export — browser only, no server function — (1) downloads the unchanged questionnaire template (XLSX) from Door 2; (2) generates a branded client-side PDF summary of the supplier's submitted answers (S1–S7, door used, date) on the Confirmation screen.

## Environment Variables
VITE_SUPABASE_URL — Supabase: Project Settings → API → Project URL — Netlify env var
VITE_SUPABASE_ANON_KEY — Supabase: Project Settings → API → anon / public key — Netlify env var
Both added by the builder on 14 July 2026. The service-role key is never used, never added, never committed. No value ever appears in code or in any file committed to GitHub.

## Supabase
Project: "Supplier-Engagement-Portal" — **already exists** (ID `hqqngissvcbevktcizit`, region us-east-1, Postgres 17) but is **empty (no tables)**. There is no supabase-setup.md yet. Connect to this project via Supabase MCP, build the schema and RLS below, then **write** docs/supabase-setup.md as the schema source of truth. Do not create a new project.
Plan: confirm with the builder — a Free-tier project pauses after ~1 week idle, which would break a live supplier form. Flag until confirmed.

Build this schema — authoritative until docs/supabase-setup.md exists:
- `suppliers`: company_name, country, contact_name, contact_email, route ('ecovadis' | 'questionnaire'), status ('declared' | 'submitted'), ecovadis_scorecard_url (nullable), consent_given (bool), consent_at, consent_version, created_at
- `submissions`: supplier_id (FK → suppliers.id), submitted_at, door ('guided_form' | 'upload'), answers (jsonb — all answers keyed by question ID), created_at
- Index: submissions.supplier_id

RLS — build these policies, never skip:
- `suppliers`: anon INSERT-only. No SELECT / UPDATE / DELETE for anon.
- `submissions`: anon INSERT-only. No SELECT / UPDATE / DELETE for anon.
- **Verify before building any UI:** with the anon key, INSERT succeeds and SELECT returns permission-denied / zero rows on both tables.

After setup, write docs/supabase-setup.md (project name, ID, URL, plan, both tables with field types, RLS per table, notes, last-updated line with date and session). From then, that file is the schema source of truth.

## Hard Rules
- **Write-only.** The app INSERTs to `suppliers` and `submissions` and NEVER reads them — no `.select()` against either table anywhere in `src/`. Reading happens only in the Supabase dashboard. A single client read exposes every supplier's data to anyone with the URL. An in-app review screen would require auth (A2) and a return to the Tool Architect.
- RLS is never disabled on any table. anon gets INSERT only. The security of this tool rests on these policies, not on hiding the anon key — the anon key is public by design.
- The Supabase **service-role key** is never used, never added to code / env / repo. It bypasses RLS.
- **No row may be inserted with `consent_given = false`.** Consent is validated alongside required fields at all three submission points; `consent_given`, `consent_at`, `consent_version` are written on every `suppliers` row.
- A **failed database write NEVER shows a Confirmation screen** — the supplier sees a clear "not recorded" error and a retry. On the EcoVadis route, a failed write **blocks the redirect**.
- API keys never in any frontend file or GitHub commit (only the public anon URL and key are client-side, by design).
- Uploaded files are parsed client-side only; the file itself is never stored. A structural mismatch fails outright with a clear re-upload prompt.
- Both doors produce **identical answer JSON**, keyed by question ID from the shared field mapping — Door 1 and Door 2 must never emit different shapes.
- GDPR: consent checkbox + the confirmed data statement required before any submit or redirect. Personal data collected: contact name, contact email (with company name, country). Retention 24 months. Deletion requests → rebecca@lcaresource.com. Supabase region is us-east-1 (US) — disclosed in the consent text; it cannot change without a new project.

## Brand
Brand is governed by the the-corporate-brand skill at .claude/skills/the-corporate-brand/SKILL.md (installed in the v1.0 build). Invoke it for all UI, the new EcoVadis Registration screen, the consent copy, and the PDF export. The consent text reads in the brand voice — precise, plain-language, not legalese.
Hard rules that hold even if the skill is not loaded:
- Background: #F2F2F2 (Chalk) — never white or Tailwind gray defaults
- Accent, buttons, CTAs: #000000 (Ink); links underlined in Ink, never blue
- Fonts: Playfair Display for headlines, DM Sans 300 for body, DM Sans 500 for labels/emphasis
- Square corners (border-radius: 0); no drop shadows, no gradients. Acid Lime #C8F135 only against black, sparingly.

## Business Rules
- Landing page: "Complete Questionnaire" opens Door Choice (never a download). **The EcoVadis button now opens the EcoVadis Registration screen** — it no longer links straight to ecovadis.com.
- **EcoVadis Registration (new screen):** company, country, contact name, contact email, EcoVadis scorecard link, plus consent. On a valid, consented Continue, write a `suppliers` row (`route = ecovadis`, `status = declared`), then open ecovadis.com in a new tab. A failed write blocks the redirect.
- Door 1 (Guided Form): 7-section wizard, free back-and-forth, inline required-field validation. Consent checkbox on the final step. On submit, write `suppliers` (`route = questionnaire`, `status = submitted`) + `submissions` (`door = guided_form`).
- Door 2 (Download & Upload): download the unchanged template; accept .xlsx/.csv; parse client-side; structural mismatch fails outright. Read-only Upload Review with the consent checkbox; a missing required field blocks Submit until a corrected file is uploaded. On submit, write `suppliers` + `submissions` (`door = upload`).
- Confirmation (shared by both doors): shows door used + summary, **states the submission was recorded**, shows the 24-month retention period and rebecca@lcaresource.com, and offers Download PDF. No confirmation email is sent.
- Full screen specs, field mapping, and write logic: docs/product-spec.md.

Out of scope — do not build:
- Any in-app screen that reads or displays submissions (needs A2 auth) — reading is done in the Supabase dashboard
- Connecting this database to the Supplier Sustainability Scorecard (would make the two a stack)
- Automated 24-month retention deletion (manual in the dashboard for now); deduplication / unique-email constraint
- Confirmation email to the supplier; storing the uploaded file; supplier login or verification

## Reference Docs
Read before building the related part:
- docs/product-spec.md — full screen specs, door logic, DB write logic, GDPR, RLS, acceptance criteria
- docs/supabase-setup.md — schema source of truth (once written in the first v3.0 session)
- .claude/skills/the-corporate-brand/SKILL.md — full brand system
PROGRESS.md in the root is read at every session start per the Session Protocol.
