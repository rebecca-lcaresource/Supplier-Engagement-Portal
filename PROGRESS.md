# PROGRESS — Supplier Sustainability Portal

> Claude Code: read this file at the start of every session, before touching anything. Update it at every save point. Replace content — do not append. History lives in git.

**Session:** 1 — deployed, pending final verification
**Last updated:** 7 July 2026 — v2.0 revision items added by Project Governor (v1.0 state from session 1 preserved)
**Live URL:** https://supplier-engagement-portal.netlify.app/

## Current state
The full single-page portal is built at `index.html` (self-contained: inline CSS, inline JS, Google Fonts CDN link, no separate files). All five sections are in place and match the spec: Hero (headline + four stat tiles), Why (value-chain exposure, net-zero ambition, reporting-readiness context, shared-journey framing, six plain-language priority themes), How it works (Smart Intake explanation, two supporting points), What you do now (Yes/No/Reset decision tree with Path A/Path B cards), What happens next + footer (four-step timeline, resources row, external-audience confidentiality line). Downloadable assets live in `assets/`. Brand skill applied throughout (Chalk/Ink/Linen/Stone palette, Playfair Display + DM Sans, square corners, no shadows/gradients, Acid Lime used twice). Tested locally with `npx serve .` and Playwright: decision-tree emphasis/dim/reset states, dimmed-button functionality, both file downloads, the EcoVadis link's new-tab behaviour, and mobile layout all verified working. All 16 acceptance criteria in the spec pass, except criterion 8 which is blocked only on the real EcoVadis URL (see Known issues). Footer confidentiality wording is confirmed final by the builder.
[Rule: this section describes what exists and works right now — never what is planned. Completed checklist items get absorbed here in compressed form.]

## Last session
Session 1: ran First Session Setup, built the complete page in one pass (all five sections, decision-tree interaction, brand system), verified it locally with a headless-browser walkthrough, and the builder deployed it to Netlify via manual drag-and-drop. Live URL recorded above. EcoVadis redirect is still the placeholder.
[Rule: 3–5 lines maximum. Replace each session — what was built, changed, or fixed.]

## Remaining work
- [ ] Swap the placeholder EcoVadis URL (`https://www.ecovadis.com/`, marked with a `BUILDER:` comment above the Path A link in `index.html`) for the confirmed redirect URL, then redeploy
- [ ] Builder confirms the live site (headline, four stat tiles, Yes/No/Reset) looks correct — Claude Code could not fetch the live URL directly (this environment's outbound network is allowlisted and does not include netlify.app)
- [ ] (v2 revision) Builder: replace the v1.0 product-spec.md and CLAUDE.md at the repo root with the v2.0 versions, and upload this PROGRESS.md
- [ ] (v2 revision) Confirm docs/, the-corporate-brand skill, and the questionnaire template asset are still correctly in place (First Session Setup already ran in session 1 — do not re-run)
- [ ] (v2 revision) Read the questionnaire Excel to derive the S1–S7 field structure; confirm the mapping with the builder
- [ ] (v2 revision) Migrate the frontend from HTML/CSS/JS to React + Vite + Tailwind, preserving the Landing Page content and all brand rules
- [ ] (v2 revision) Build Door Choice screen — pick "Fill in the tool" or "Download and complete offline," with a way back to the landing page
- [ ] (v2 revision) Build Guided Form (Door 1) — 7-section wizard, free back/forth navigation, required-field validation with inline errors
- [ ] (v2 revision) Build Download & Upload (Door 2) — template download + .xlsx/.csv upload with client-side structural parsing (hard fail on mismatch)
- [ ] (v2 revision) Build Upload Review (Door 2) — read-only parsed summary; missing required fields block Submit until a corrected file is uploaded
- [ ] (v2 revision) Build Confirmation screen (shared) — shows which door was used, a summary, and a Download PDF button
- [ ] (v2 revision) Wire Export arm: client-side branded PDF of the submitted answers (S1–S7, door used, date)
- [ ] (v2 revision) Local test pass — every screen, both doors, parsing, PDF generation, and mobile layout
- [ ] (v2 revision) Acceptance criteria pass — verify all 15 v2.0 criteria in spec "Acceptance Criteria" before deploy
- [ ] (v2 revision) Switch the existing Netlify site to build-on-deploy (build command `npm run build`, publish `dist`) and redeploy — v2.0 replaces v1.0 at the same URL
[Rule: completed items leave this list and are absorbed into Current state. This list only shrinks.]

## Build decisions
- Single self-contained `index.html` (inline CSS + inline JS, no separate asset files besides `assets/`) to keep the drag-and-drop deploy folder minimal.
- Path A and Path B action buttons are plain `<a>` elements (external link with `target="_blank" rel="noopener"`, and a `download` attribute respectively) — no JS needed for the redirect/download itself, only for the Yes/No/Reset emphasis toggle.
- Reference PDFs (Procurement Sustainability Strategy 2026, Program Charter 2026) live in `docs/reference/` — grounding material for copy, never linked from the page itself.
- Questionnaire file's extension corrected from `.XLS` to `.xlsx` to match its actual internal format (confirmed via `file`: Microsoft Excel 2007+/zip-based), matching the spec's `.xlsx` wording.
- Acid Lime used exactly twice per the brand skill's cap: an underline on "2026" in the hero headline, and the black "Smart Intake" badge pill.
- CSRD is never named on the page; the Why section refers to it only as "new sustainability reporting obligations," per the no-reporting-codes rule.
[Rule: one line per decision made during the build that is not in the spec — prompt structures, field formats, naming choices, library picks. Future sessions depend on these to stay consistent.]

## Known issues
- Blocking deploy: EcoVadis redirect URL is still a placeholder (`https://www.ecovadis.com/`) — swap in the real URL before the drag-and-drop deploy.
- Spec revised to v2.0 on 7 July 2026 — CLAUDE.md regenerated by Project Governor. Frontend migrates HTML/CSS/JS → React + Vite; the questionnaire route gains two in-tool doors plus a client-side PDF export; data model moves D1 → D2 (browser-only input, still nothing stored).
- (v2) Upload with missing required answers: default is to block Submit until a corrected file is uploaded — builder may override (spec v2.0 §15).
- (v2) Landing questionnaire button label assumed "Complete Questionnaire" — builder may change (spec v2.0 §15).
- (v2) S1–S7 field list is not enumerated in the spec — Claude Code derives it from the questionnaire Excel and confirms with the builder during the build.
[Rule: bugs, edge cases, and deferred fixes. One line each. Remove when resolved.]

## Notes for next session
None.
[Rule: the builder writes here between sessions. Claude Code reads these aloud at session start, acts on them, then clears this section.]
