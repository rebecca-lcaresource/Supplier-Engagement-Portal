# PROGRESS — Supplier Sustainability Portal

> Claude Code: read this file at the start of every session, before touching anything. Update it at every save point. Replace content — do not append. History lives in git.

**Session:** 6 — v3.0 build (database, EcoVadis registration, consent) + structured questionnaire contact fields, by Claude Code
**Last updated:** 15 July 2026 — Claude Code, v3.0 build
**Live URL:** https://supplier-engagement-portal.netlify.app/ (Netlify — sole target). v3.0 deployed via PR #2; EcoVadis route confirmed live. Netlify env vars confirmed set.

## Current state
**v3.0 is code-complete and builds clean** (`npm run build`, v3.0.0). The portal is now Tier 2: supplier submissions persist to Supabase, and the app is **write-only**.

- **Database (Supabase `hqqngissvcbevktcizit`):** `suppliers` + `submissions` tables, `submissions.supplier_id` index, RLS enabled. `anon` is INSERT-only, enforced in **two layers** — INSERT-only RLS policies *and* non-INSERT privileges revoked at the GRANT layer. Verified acting as the `anon` role: INSERT succeeds, SELECT/UPDATE denied, `consent_given = false` blocked by CHECK. Schema documented in `docs/supabase-setup.md` (the schema source of truth).
- **Write paths:** EcoVadis route = one direct `suppliers` insert (`route=ecovadis`, `status=declared`). Questionnaire route = the `submit_questionnaire` RPC (SECURITY DEFINER, EXECUTE to `anon`) writing `suppliers` + `submissions` **atomically** — no orphan rows if the second insert fails. Verified atomic (invalid door rolls back both). The client **never reads** — no `.select()` on either table.
- **EcoVadis Registration screen (new):** 5 fields + consent; on valid consented Continue it writes the row then opens ecovadis.com in a new tab. A failed write shows a clear error and **blocks the redirect** (verified in-browser).
- **GDPR consent:** unticked, blocking checkbox at all three submission points (guided form final step, upload review, EcoVadis), brand-voice text stating what/why/where (US)/how long (24 mo)/deletion contact. `consent_given/at/version` written on every supplier row; `CONSENT_VERSION = 2026-v1`.
- **Confirmation** states the submission was recorded + shows 24-month retention and rebecca@lcaresource.com. A failed write never reaches Confirmation (verified). PDF export retained.
- **Retired GitHub Pages leftovers:** `import.meta.env.BASE_URL` asset handling removed (absolute `/assets/` paths); Vite `base` is `/`. (No `deploy-pages.yml` existed in the repo.)

[Rule: this section describes what exists and works right now — never what is planned.]

## Last session
Session 6 (15 July 2026): Built all of v3.0 — schema + RLS + atomic RPC (write-only invariant proven as the anon role), EcoVadis Registration screen, consent at all three points, both-door writes with failure handling, updated Confirmation, removed Pages `BASE_URL` handling. Deployed via PR #2 → main → Netlify; EcoVadis route confirmed writing live. Then replaced the questionnaire's free-text Section 1 with four **structured contact fields** (company/country/contact name/email) on both doors so the `suppliers` columns are clean. Built clean; browser-verified (17/17 v3.0 checks earlier + 14/14 for the structured fields: guided S1, email validation, upload review contact fields, template parse).
[Rule: 3–5 lines maximum. Replace each session.]

## Remaining work
- [ ] **Verify the questionnaire route's live success-path write.** The EcoVadis route is confirmed live (a real submission landed a clean `suppliers` row on 15 Jul). Still to confirm on the deployed site: a guided-form submit and an upload submit each land a `suppliers` + `submissions` row in the dashboard (spec criteria 7, 10, 11, 18). Sandbox egress blocks `supabase.co`, so this must be done from the live site.

### v4.0 — magic-link email verification (Tier 3, A2)
Builder pre-tasks (dashboards / DNS — not build tasks):
- [x] (v4.0 revision) Builder: Resend account + API key created
- [x] (v4.0 revision) Builder: Resend custom SMTP configured in Supabase (Authentication → Emails → SMTP Settings), 22 Jul 2026
- [x] (v4.0 revision) Builder: Supabase Auth URL Configuration set — Site URL + redirect = the Netlify URL, 22 Jul 2026
- [ ] (v4.0 revision) Builder: verify the `lcaresource.com` sending domain in Resend (SPF/DKIM DNS) — **deferrable to pre-go-live**; magic links can be tested to the builder's own inbox until then
- [ ] (v4.0 revision) Builder: upgrade Supabase to Pro before real supplier traffic — a paused Free project now breaks login (manual billing step)

Build:
- [ ] (v4.0 revision) Add `verified_email` + `verified_at` columns to `suppliers`; enable magic-link auth (open signup); move INSERT from `anon` to `authenticated` on both tables (policies + GRANTs, revoke anon); move the `submit_questionnaire` RPC EXECUTE to `authenticated` and add the two verified params; update docs/supabase-setup.md
- [ ] (v4.0 revision) Verify RLS before UI: `authenticated` can insert / cannot read; `anon` cannot insert
- [ ] (v4.0 revision) Landing Page — replace the two route buttons with a single "Start submission" CTA
- [ ] (v4.0 revision) Build Email Entry — collect + send the magic link (Supabase Auth sign-in)
- [ ] (v4.0 revision) Build Check-Your-Inbox holding screen
- [ ] (v4.0 revision) Build Route Choice — reached only in a verified session; choose EcoVadis or questionnaire
- [ ] (v4.0 revision) Wire the verified-session gate — Route Choice / EcoVadis Registration / all data-entry screens unreachable without it; capture `verified_email` + `verified_at` from the session and pass into both write paths (run as `authenticated`)
- [ ] (v4.0 revision) Local test pass — magic link to the builder's own inbox; confirm rows (with verified fields) land in the dashboard
- [ ] (v4.0 revision) Acceptance criteria pass — verify all 25 criteria in spec "Acceptance Criteria" before deploy
- [ ] (v4.0 revision) Deploy to Netlify (push to main → auto-deploy; env vars already set)
[Rule: completed items leave this list and are absorbed into Current state. This list only shrinks.]

## Build decisions
[Carried forward from v2.0/v3.0 — still authoritative.]
- **S1–S7 field mapping** derived from `The_Corporate_Supplier_Questionnaire_2026.xlsx`; every question is one form field so Door 1 and Door 2 share an identical `answers` shape (keyed by lowercase question id, e.g. `s2_q1`). This is the shape written to `submissions.answers`.
- S1's EcoVadis bypass question was dropped from Door 1 in v2.0; v3.0 captures that routing via the EcoVadis Registration screen.
- ESRS reference codes shown as small muted per-question tags.
- The sheet's closing declaration (accuracy confirmation + Authorised Signatory Name) is a final attestation at the end of Section 7 — **distinct from the GDPR consent checkbox**, which sits below a divider on the same final step.
- React scaffold: Tailwind v3; `xlsx` for parsing; `jsPDF` for the PDF (both dynamically imported).
- Downloadable assets live in `/public/assets`, linked absolutely (`/assets/...`).
- **(v3.0) Write-only pattern:** `anon` has no SELECT, so the app never uses `.select()`/RETURNING. The questionnaire write goes through a SECURITY DEFINER RPC for atomicity; EcoVadis is a single direct insert. `@supabase/supabase-js` v2 `.insert()` without `.select()` sends `return=minimal`, so no read is needed.
- **(v3.0) Questionnaire Section 1 = structured identity fields** (`company_name`, `country`, `contact_name`, `contact_email`), replacing the old free-text S1 on both doors. Collected on-screen (guided-form Section 1, or the Upload Review screen for Door 2), never parsed from the workbook. `contact_email` is a validated email field. Both doors still emit an identical `answers` shape.
- **(v3.0) Consent version** `2026-v1` (`src/lib/db.js`); bump it in step with any wording change in `ConsentCheckbox.jsx`.
- Intentional brand exception: the Landing Page's two section dividers are Dark Blue (`#00008B`) by explicit builder request.
- Acid Lime used exactly twice on the landing page (hero "2026" underline; "Smart Intake" badge).
[Rule: one line per decision made during the build that is not in the spec.]

## Known issues
- **Spec revised to v4.0 on 22 July 2026 — CLAUDE.md regenerated by Project Governor.** v4.0 promotes the tool to Tier 3 (magic-link email verification, A2). See the v4.0 block in Remaining work.
- **Supabase is on the Free tier.** It pauses after ~1 week idle; while paused, **login now fails** (magic link) as well as submissions. Upgrade to Pro before sustained supplier traffic, or manually unpause around idle periods.
- **Retention deletion is manual** — nothing auto-deletes at 24 months. Rebecca must diarise this; it is a live GDPR obligation. **v4.0 note:** deletion must now also remove the supplier's Supabase Auth user, not just the table rows.
- **Supabase region is us-east-1 (US), not EU** — disclosed in the consent text; cannot change without a new project.
- Consent/declaration checkboxes use native browser styling (blue tick), consistent with the v2.0 checkboxes — not brand-restyled.
- `xlsx` (SheetJS) pinned at 0.18.5 with known advisories unpatched on npm; risk contained (client-side parse of the supplier's own file).
- Cosmetic (non-blocking): validation error text uses a non-brand red; the Guided Form shows two "Back" controls; PDF fonts are jsPDF stand-ins.
[Rule: bugs, edge cases, and deferred fixes. One line each. Remove when resolved.]

## Notes for next session
Two things carry over. (1) v3.0 leftover: verify one real questionnaire submission per route (guided + upload) on the **deployed** site and confirm the rows appear in the Supabase dashboard — the only thing the sandbox's blocked egress prevented. (2) v4.0 is next: the dashboard SMTP + Auth URL config are done; build the verification gate per the v4.0 block. Domain verification and the Pro upgrade are the builder's remaining pre-go-live tasks.
[Rule: the builder writes here between sessions. Claude Code reads these aloud at session start, acts on them, then clears this section.]
