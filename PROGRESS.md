# PROGRESS — Supplier Sustainability Portal

> Claude Code: read this file at the start of every session, before touching anything. Update it at every save point. Replace content — do not append. History lives in git.

**Session:** 2 — v2.0 build in progress
**Last updated:** 7 July 2026 — by Claude Code, session 2
**Live URL:** https://supplier-engagement-portal.netlify.app/ (still serving v1.0 until the v2.0 React build is deployed)

## Current state
v1.0 is live at the URL above (static HTML/CSS/JS `index.html`, all 16 v1.0 acceptance criteria pass except the EcoVadis placeholder). v2.0 build has started: `docs/product-spec.md` now holds the v2.0 spec, CLAUDE.md is regenerated for v2.0 (React/Vite/Tailwind, D2 data model, Export arm active), and the full S1–S7 questionnaire field structure has been derived and confirmed (see Build decisions). React app build not yet started — old `index.html` remains the live deploy until the v2.0 build replaces it.
[Rule: this section describes what exists and works right now — never what is planned. Completed checklist items get absorbed here in compressed form.]

## Last session
Session 1: ran First Session Setup, built and deployed the v1.0 static page. Session 2 (this one): spec revised to v2.0 by the builder/Project Governor; moved the new product-spec.md into docs/ (it had landed at repo root); read the questionnaire Excel and derived the full S1–S7 field structure; confirmed three open design questions with the builder (ESRS codes shown as small tags, S1 EcoVadis bypass question dropped from Door 1, declaration added as a final attestation step). Starting the React/Vite/Tailwind migration next.
[Rule: 3–5 lines maximum. Replace each session — what was built, changed, or fixed.]

## Remaining work
- [ ] Swap the placeholder EcoVadis URL (`https://www.ecovadis.com/`) for the confirmed redirect URL, then redeploy (carries over into the v2.0 Landing Page)
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
- **S1–S7 field mapping derived from `assets/The_Corporate_Supplier_Questionnaire_2026.xlsx`** (single sheet, one row per question — not 7 separate sheets) and confirmed with the builder on 7 July 2026:
  - 30 questions across S1–S7 (S1 has 2 after the bypass drop below; S2–S7 unchanged from the sheet). Column G (Status: Not Started/In Progress/Complete/N/A/EcoVadis Bypass) is an internal reviewer field, out of scope for the supplier-facing tool.
  - Dropdown option lists come from the sheet's own data validation (e.g., Yes/No; the Scope 2 verification-method list "Verified by Third Party / Internally Calculated / Estimated / Not Tracked," which the sheet applies only to that one row — mirrored as-is, not extended to Scope 1/3).
  - Every question is exactly one form field (even compound ones, e.g. "total + breakdown") so Door 1 and Door 2 share an identical field shape — required since Door 2's upload parser reads one Excel cell per question.
  - ESRS reference codes (E1-4, S2-1, G1-1, etc.) are shown to suppliers as small muted tags per question, styled like the brand's Caption/Label — a deliberate reversal of v1.0's "no reporting-standard codes" rule, since v2.0's users (sustainability managers, EHS leads) are ESRS-literate and the v2.0 CLAUDE.md doesn't carry that rule forward.
  - S1's EcoVadis bypass question (sheet row 8–9: "Do you hold a valid EcoVadis Scorecard?" + conditional link field) is **dropped from Door 1** — a supplier only reaches Door 1 by already having chosen the non-EcoVadis path on the Landing Page, so re-asking creates a dead-end. Door 1 starts at legal name/contact, then S2. Door 2's upload parser reads past those same rows in the template without requiring or gating on them, so both doors stay consistent.
  - The sheet's closing declaration block (accuracy confirmation + Authorised Signatory Name + Date + Signature/Digital Auth) is **added as a final attestation step** at the end of the Section 7 screen: a confirmation checkbox + typed "Authorised Signatory Name" field (standing in for a signature), with date auto-filled at submission. Keeps the spec's "7 sections" framing rather than adding an 8th.
[Rule: one line per decision made during the build that is not in the spec — prompt structures, field formats, naming choices, library picks. Future sessions depend on these to stay consistent.]

## Known issues
- Blocking deploy: EcoVadis redirect URL is still a placeholder (`https://www.ecovadis.com/`) — swap in the real URL before deploy.
- (v2) Upload with missing required answers: default is to block Submit until a corrected file is uploaded — builder may override (spec v2.0 §15).
- (v2) Landing questionnaire button label assumed "Complete Questionnaire" — builder may change (spec v2.0 §15).
- (v2) PDF export (Export arm) is likely to use jsPDF's default fonts rather than embedded Playfair Display/DM Sans TTFs, pending a check of whether font embedding is feasible in this build session — brand colors, layout, and square-corner styling still apply regardless. Will confirm actual approach when that task is reached.
[Rule: bugs, edge cases, and deferred fixes. One line each. Remove when resolved.]

## Notes for next session
None.
[Rule: the builder writes here between sessions. Claude Code reads these aloud at session start, acts on them, then clears this section.]
