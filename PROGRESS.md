# PROGRESS — Supplier Sustainability Portal

> Claude Code: read this file at the start of every session, before touching anything. Update it at every save point. Replace content — do not append. History lives in git.

**Session:** 7 — v4.0 build (magic-link email verification, Tier 3), by Claude Code
**Last updated:** 22 July 2026 — Claude Code, v4.0 build + live magic-link confirmed
**Live URL:** https://supplier-engagement-portal.netlify.app/ (Netlify — sole target). v4.0 deployed (PRs #4, #5). **Magic-link verification CONFIRMED WORKING LIVE 22 Jul** — link sent via Resend, clicked from spam, landed on the portal (verified session created for rebecca@lcaresource.com).

## Current state
**v4.0 is code-complete and builds clean** (`npm run build`, v4.0.0). The portal is now **Tier 3**: a magic-link email-verification gate precedes route choice and all data entry. Everything from v3.0 (both doors, EcoVadis registration, consent, PDF, write-only) is retained.

- **Flow:** Landing (single "Start submission" CTA; routes described as context) → **Email Entry → Check-Your-Inbox → magic link → verified session → Route Choice** → EcoVadis Registration OR Door Choice → Guided Form / Upload → Confirmation. The EcoVadis-vs-questionnaire choice now happens *after* verification.
- **Hard gate** (`src/App.jsx`): Route Choice, EcoVadis Registration, Door Choice, and all data-entry screens are unreachable without a verified session (`GATED` list → forced to Email Entry otherwise). Returning from the link fires `SIGNED_IN` → Route Choice.
- **Database (Supabase `hqqngissvcbevktcizit`):** added `verified_email` + `verified_at` (both NOT NULL) to `suppliers`. Writes moved from `anon` to **`authenticated`** — `anon` INSERT revoked (policies + grant dropped); `authenticated` INSERT policies/grant + RPC EXECUTE. The `submit_questionnaire` RPC gained `p_verified_email` + `p_verified_at`. Verified acting as each role: `authenticated` inserts/can't read, **`anon` can't insert**, NOT NULL + consent CHECK hold. `docs/supabase-setup.md` updated.
- **Verified identity capture:** both write paths read `verified_email` + `verified_at` from the session (`src/lib/auth.js`) and store them; a write with no verified session throws. `contact_email` is self-reported (pre-filled with the verified email, but editable) and stored **separately** — not enforced to match.
- **New screens:** `EmailEntry.jsx` (entry + check-inbox), `RouteChoice.jsx`. `EmailGate.jsx` (v3.1) removed. Consent copy updated to cover the verified + contact emails.
- **No email function, no Resend key, no service-role key** anywhere in the repo — Supabase Auth sends the magic link via Resend SMTP (dashboard-only).

[Rule: this section describes what exists and works right now — never what is planned.]

## Last session
Session 7 (22 July 2026): Built v4.0 to the revised spec — magic-link verification gate at the front of the flow (Tier 3, A2). DB: verified columns, RPC verified params, writes moved `anon`→`authenticated` (anon insert revoked), all verified acting as each role. App: single "Start submission" CTA, Email Entry, Check-Your-Inbox, Route Choice, hard session gate, verified fields into both writes; reverted the v3.1 contact-email lock (now self-reported + separate verified column). Built clean; browser-verified 12/12 (single CTA, gate, verified→Route Choice→both routes, verified-email pre-fill, EcoVadis reachable). Deployed via PR to main.

## Remaining work
- [ ] **Complete one full end-to-end submission per route on the live site.** Auth (magic link → verified session → portal) is confirmed. Still to do: from a verified session, submit the questionnaire (guided + upload) and register via EcoVadis, then confirm the `suppliers` row carries `verified_email` + `verified_at` (and a `submissions` row for the questionnaire). Use an incognito window for a clean run — the browser stays signed in between tries.
- [ ] **Builder — fix email deliverability (spam):** the test link came from `onboarding@resend.dev` and landed in spam. Verify the `lcaresource.com` domain in Resend (add SPF/DKIM DNS at resend.com/domains), then set the Supabase Auth sender back to `auth@lcaresource.com`. This is the main pre-go-live task.
- [ ] **Builder — upgrade Supabase to Pro** before real supplier traffic (a paused Free project breaks login, not just submissions).
- [ ] Housekeeping: `docs/supabase-setup.md` still lists Plan = Free; update when Pro upgrade happens. Tables are currently empty (test rows cleared).
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
- **(v4.0) Magic-link gate** is state-based in `App.jsx` (`GATED` views + `effectiveView`), not URL-routed — this is a single-page app. `SIGNED_IN` → Route Choice; a verified but not-yet-started returning session sends "Start submission" straight to Route Choice. Sessions persist (retest in incognito). `verified_at` is read from the session user (`email_confirmed_at` → `confirmed_at` → `last_sign_in_at`). `verified_email` and `contact_email` are stored separately and not enforced equal (UI-only ownership check).
- Intentional brand exception: the Landing Page's two section dividers are Dark Blue (`#00008B`) by explicit builder request.
- Acid Lime used exactly twice on the landing page (hero "2026" underline; "Smart Intake" badge).
[Rule: one line per decision made during the build that is not in the spec.]

## Known issues
- **Live magic-link flow not yet exercised end-to-end** — verified with a simulated session only (sandbox blocks `supabase.co`). Needs one real click-through on the deployed site (see Remaining work).
- **Supabase is on the Free tier.** It pauses after ~1 week idle; while paused, **login now fails** (magic link) as well as submissions. Upgrade to Pro before sustained supplier traffic, or manually unpause around idle periods.
- **Retention deletion is manual** — nothing auto-deletes at 24 months. Rebecca must diarise this; it is a live GDPR obligation. **v4.0 note:** deletion must now also remove the supplier's Supabase Auth user, not just the table rows.
- **Supabase region is us-east-1 (US), not EU** — disclosed in the consent text; cannot change without a new project.
- Consent/declaration checkboxes use native browser styling (blue tick), consistent with the v2.0 checkboxes — not brand-restyled.
- `xlsx` (SheetJS) pinned at 0.18.5 with known advisories unpatched on npm; risk contained (client-side parse of the supplier's own file).
- Cosmetic (non-blocking): validation error text uses a non-brand red; the Guided Form shows two "Back" controls; PDF fonts are jsPDF stand-ins.
[Rule: bugs, edge cases, and deferred fixes. One line each. Remove when resolved.]

## Notes for next session (for 23 July)
v4.0 is live and the magic-link sign-in is **confirmed working** (link → portal). Tomorrow's priorities:
1. **Finish the end-to-end proof:** in an incognito window, sign in via the magic link, then actually **submit** — questionnaire (guided + upload) and EcoVadis — and check the `suppliers`/`submissions` rows carry the verified fields. (The link email lands in **spam** for now — that's expected until the domain is verified.)
2. **Deliverability (main go-live blocker):** verify `lcaresource.com` in Resend (SPF/DKIM), then switch the Supabase Auth sender from `onboarding@resend.dev` back to `auth@lcaresource.com` so links reach inboxes, not spam.
3. **Upgrade Supabase to Pro** before sending the link to real suppliers.
Nothing in the code/build is outstanding — the remaining work is dashboard/DNS config + a confirmation test.
[Rule: the builder writes here between sessions. Claude Code reads these aloud at session start, acts on them, then clears this section.]
