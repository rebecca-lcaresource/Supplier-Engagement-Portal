# PROGRESS — Supplier Sustainability Portal

> Claude Code: read this file at the start of every session, before touching anything. Update it at every save point. Replace content — do not append. History lives in git.

**Session:** 5 — v3.0 kickoff (database upgrade), by Project Governor
**Last updated:** 14 July 2026 — Project Governor, pre-v3.0-build
**Live URL:** https://supplier-engagement-portal.netlify.app/ (Netlify — sole target; GitHub Pages backup retired 14 July 2026)

## Current state
**v2.0 is live and confirmed working end-to-end in production** at the URL above — the React app, all 7 questionnaire sections, both doors (guided form + download/upload), client-side upload parsing, and the branded PDF export are deployed and functioning, not just locally. v2.0 was code-complete, built clean (`npm run build`), and passed a full acceptance walkthrough (all 15 v2.0 criteria). Deployment is CI-based: any push to `main` auto-redeploys via Netlify (`netlify.toml`: `npm run build`, publish `dist`, Node 22). The two builder-overridable defaults are settled (Door 2 blocks Submit on a missing required answer; landing button stays "Complete Questionnaire"), and the EcoVadis button's interim destination (the EcoVadis homepage) is accepted.
**v3.0 has not started.** It promotes the tool from Tier 1 (session-only, nothing stored) to Tier 2: supplier submissions now persist to Supabase, a new EcoVadis Registration screen captures the EcoVadis route, and GDPR consent is required at every submission point. The Supabase project exists (`hqqngissvcbevktcizit`, empty) and the Netlify env vars are set.
[Rule: this section describes what exists and works right now — never what is planned. Completed checklist items get absorbed here in compressed form.]

## Last session
Session 4 (8 July 2026): added a GitHub Pages backup deploy alongside Netlify. **This is now being reverted in v3.0** — Pages is retired (it would lack the Supabase env vars and silently fail to record submissions), so the `deploy-pages.yml` workflow and the `VITE_BASE` subpath handling are removed and Vite `base` returns to `/`.
[Rule: 3–5 lines maximum. Replace each session — what was built, changed, or fixed.]

## Remaining work
- [ ] Remove the GitHub Pages deploy: delete `.github/workflows/deploy-pages.yml`, drop the `VITE_BASE`/`import.meta.env.BASE_URL` subpath handling, set Vite `base` back to `/`
- [ ] Connect to Supabase project `hqqngissvcbevktcizit` via MCP; create the `suppliers` and `submissions` tables, the anon INSERT-only RLS policies, and the `submissions.supplier_id` index; then write docs/supabase-setup.md
- [ ] **Verify RLS before any UI** — with the anon key, confirm INSERT succeeds and SELECT is denied on both tables (spec §6, criterion 13)
- [ ] Confirm the Supabase plan with the builder — a Free-tier project pauses after ~1 week idle and would break the live form
- [ ] Build the EcoVadis Registration screen (spec §8) — five fields + consent; on Continue, write a `suppliers` row (`route=ecovadis`, `status=declared`) then open ecovadis.com in a new tab
- [ ] Add the GDPR consent checkbox (unticked, blocking) to all three submission points: Guided Form final step, Upload Review, EcoVadis Registration
- [ ] Wire the database writes for both doors and the EcoVadis route, including failure handling — a failed write never shows Confirmation and blocks the EcoVadis redirect (spec §9)
- [ ] Ensure both doors emit identical answer JSON keyed by question ID from the existing shared field mapping (spec §5, criterion 11)
- [ ] Update the Confirmation screen — state the submission was recorded; show 24-month retention + rebecca@lcaresource.com (spec §8)
- [ ] Test both routes end to end; verify the rows land correctly in the Supabase dashboard
- [ ] Acceptance-criteria pass — verify all 20 criteria in spec §13 before deploy
- [ ] Push to `main` → Netlify auto-deploys
[Rule: completed items leave this list and are absorbed into Current state. This list only shrinks.]

## Build decisions
[Carried forward from v2.0 — still authoritative. New v3.0 decisions get appended here as they are made.]
- **S1–S7 field mapping** derived from `assets/The_Corporate_Supplier_Questionnaire_2026.xlsx` (single sheet, one row per question) and confirmed with the builder 7 July 2026. Every question is exactly one form field so Door 1 and Door 2 share an identical field shape — this is the shape the v3.0 `answers` JSON must reuse. Column G (reviewer Status) is out of scope for the supplier tool.
- S1's EcoVadis bypass question was **dropped from Door 1** in v2.0 (a supplier only reaches Door 1 via the non-EcoVadis path). In v3.0 that routing is captured by the new EcoVadis Registration screen instead.
- ESRS reference codes (E1-4, S2-1, etc.) are shown to suppliers as small muted per-question tags — v2.0's users are ESRS-literate.
- The sheet's closing declaration (accuracy confirmation + Authorised Signatory Name + Date) is a final attestation step at the end of Section 7, keeping the "7 sections" framing. (Distinct from the new GDPR consent checkbox, which is a separate, required control.)
- React scaffold: Tailwind v3 (config-based) for brand tokens; `xlsx` (SheetJS) for .xlsx/.csv parsing; `jsPDF` v4 for the client-side PDF. `jsPDF` and `xlsx` are dynamically imported so they load only at Door 2 / Confirmation (main bundle ~911 KB → ~180 KB).
- Downloadable assets live in `/public/assets` (Vite convention), linked absolutely.
- PDF export uses jsPDF built-in times/helvetica as stand-ins for Playfair/DM Sans; brand colors, black header band, and square corners applied exactly.
- Intentional brand exception: the Landing Page's two section dividers are Dark Blue (`#00008B`, 1px) by explicit builder request — not a change to the brand skill.
- Acid Lime used exactly twice (hero "2026" underline; "Smart Intake" badge). CSRD never named on the page.
[Rule: one line per decision made during the build that is not in the spec — field formats, naming choices, library picks. Future sessions depend on these to stay consistent.]

## Known issues
- **Retention deletion is manual for v3.0** — nothing auto-deletes at 24 months. Rebecca must diarise this; it is a live GDPR obligation, not a nicety. Automating it is a v4.0 candidate.
- **Supabase plan unconfirmed** — if the project is on Free tier it pauses after ~1 week without traffic, and suppliers' submissions will fail until it is unpaused. Confirm/upgrade before real supplier use.
- **Supabase region is us-east-1 (US), not EU.** The project already exists there and the region cannot change without a new project; the consent text discloses US storage. Acceptable as-is, noted for the record.
- `xlsx` (SheetJS) is pinned at 0.18.5 with two known high-severity advisories unpatched on npm; the patched build lives only on SheetJS's CDN, unreachable from the build environment. Risk is contained (parsing is client-side on a file the supplier uploads themselves), but the builder may swap in the CDN tarball outside this environment.
- Intentional brand deviation: the Dark Blue dividers — do not "fix" back to brand-compliant without checking with the builder.
- Cosmetic polish (non-blocking): validation error text uses a non-brand red; the Guided Form shows two "Back" controls with different meanings; PDF fonts are jsPDF stand-ins. Address only if the builder wants the extra polish.
[Rule: bugs, edge cases, and deferred fixes. One line each. Remove when resolved.]

## Notes for next session
Start with the two foundations before any screen work: (1) remove the GitHub Pages deploy and reset Vite `base` to `/`, and (2) create the schema + RLS via Supabase MCP and **verify the anon key can insert but cannot select** — that write-only guarantee is the security invariant of the whole tool, so prove it before building any UI on top of it. Then confirm the Supabase plan with the builder.
[Rule: the builder writes here between sessions. Claude Code reads these aloud at session start, acts on them, then clears this section.]
