# PROGRESS — Supplier Sustainability Portal

> Claude Code: read this file at the start of every session, before touching anything. Update it at every save point. Replace content — do not append. History lives in git.

**Session:** 2 — v2.0 build complete, awaiting deploy
**Last updated:** 7 July 2026 — by Claude Code, session 2
**Live URL:** https://supplier-engagement-portal.netlify.app/ (still serving v1.0 until the builder drags the handed-off v2.0 `dist/` build onto Netlify)

## Current state
v1.0 is still the live deploy at the URL above — the v2.0 React app is code-complete, builds cleanly (`npm run build`, no errors), and has passed a full local acceptance-criteria walkthrough, but has not yet been pushed to Netlify (that needs a Netlify dashboard build-config change first, see Remaining work). All 15 acceptance criteria in docs/product-spec.md §13 verified locally:
- **1** Landing Page renders unchanged, EcoVadis button confirmed `target="_blank"` to the (placeholder) URL — **2** "Complete Questionnaire" opens Door Choice, no download fires — **3** Door Choice shows both cards + working back-to-landing — **4** Guided Form's 7 sections match the confirmed field mapping — **5** inline validation blocks Next on empty required fields, section-tab jump works — **6** valid Submit reaches Confirmation — **7** Download Template verified **byte-identical** (`cmp`) to the source asset — **8** a garbage file is hard-rejected with a clear error, .xlsx/.csv both accepted — **9** Upload Review parsed values verified to match a synthetic filled file exactly, values aren't editable, re-upload returns to the upload step — **10** an unfilled template correctly flags all 27 answers as missing and blocks Submit — **11** Confirmation shows door used + sections completed for both doors — **12** the downloaded PDF was rendered in Chromium and visually confirmed: branded header, correct pagination (4 pages), all content present — **13** grepped `src/` for `localStorage|sessionStorage|fetch|XMLHttpRequest|axios` — no matches; network tab during a full run showed only the Google Fonts CSS request, no data transmission — **14** no persistence mechanism exists anywhere in the code, so refresh/close trivially clears everything — **15** production build succeeds, and every screen (Landing, Door Choice, Guided Form, Download & Upload) was screenshotted at a 390px mobile viewport with clean stacked layouts and no console errors.

Also fixed a bundle-size issue found during this pass: jsPDF and xlsx are now dynamically imported inside the functions that use them rather than statically, so their weight (and jsPDF's unused html2canvas/dompurify sub-dependencies) only loads when a supplier actually reaches Door 2 or Confirmation — cut the main JS bundle from ~911 KB to ~180 KB.

A fresh `dist/` build was produced and verified standalone (served + loaded with Playwright, no console errors, all assets resolve) and handed to the builder as a zip for manual drag-and-drop, matching CLAUDE.md's current deployment model. The builder confirmed they'll connect Netlify to GitHub for CI-based builds soon — CLAUDE.md's Deployment line will need updating again when that happens (see Remaining work).
[Rule: this section describes what exists and works right now — never what is planned. Completed checklist items get absorbed here in compressed form.]

## Last session
Session 1: ran First Session Setup, built and deployed the v1.0 static page. Session 2 (this one): spec revised to v2.0; built the full React app (Landing Page, Door Choice, Guided Form, Door 2, Confirmation, PDF export); ran a full local acceptance-criteria pass (all 15 v2.0 criteria verified); produced and handed off a verified `dist/` build for manual drag-and-drop deploy. Still open: real EcoVadis URL, and the builder's planned switch to GitHub-connected Netlify builds.
[Rule: 3–5 lines maximum. Replace each session — what was built, changed, or fixed.]

## Remaining work
- [ ] Swap the placeholder EcoVadis URL (`https://www.ecovadis.com/`) for the confirmed redirect URL, then rebuild and redeploy
- [ ] Builder drags the `dist/` build (handed off as a zip this session) onto the existing Netlify site's dashboard
- [ ] Builder is connecting Netlify to GitHub for CI builds shortly — when that happens, update CLAUDE.md's Deployment line (currently "manual, GitHub NOT connected") and Netlify's build command (`npm run build`) / publish directory (`dist`) accordingly
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
- React scaffold: plain Tailwind v3 (config-based, not v4's CSS-first setup) for predictable brand-token theming; `xlsx` (SheetJS) for both .xlsx and .csv upload parsing (one library, no separate CSV parser); `jsPDF` v4 for the client-side PDF export. Downloadable assets moved from `/assets` to `/public/assets` (Vite convention — copied to the build output root as-is), so links changed from relative `assets/...` to absolute `/assets/...`.
- Path B's landing-page card instruction text updated to "Complete the assessment in the tool, or download it, finish offline, and upload the result." (not specified verbatim in either spec version) to reflect that the button now opens Door Choice instead of downloading directly.
- PDF export uses jsPDF's built-in 'times' (serif, for headings) and 'helvetica' (sans, for body) rather than embedding the actual Playfair Display/DM Sans TTFs — approximates the brand's serif/sans pairing without the complexity and repo weight of font embedding. Brand colors (Ink/Stone/Chalk), the black header band with logo mark, and square-corner layout are applied exactly.
- `jsPDF` and `xlsx` are dynamically imported inside `generatePdf.js`/`parseUpload.js` rather than statically at module load, since jsPDF pulls in unused html2canvas/dompurify sub-dependencies — keeps both libraries out of the initial bundle, loading only when a supplier reaches Door 2 or Confirmation. Cut the main JS bundle from ~911 KB to ~180 KB.
- Landing Page's `.tc-divider` (the two horizontal rules between Hero/Why/How it works) recolored to Dark Blue (`#00008B`) and thickened to 1px, per explicit builder request — a deliberate one-off exception to the brand's "never blue" rule, not a change to the brand skill or CLAUDE.md hard rule itself.
[Rule: one line per decision made during the build that is not in the spec — prompt structures, field formats, naming choices, library picks. Future sessions depend on these to stay consistent.]

## Known issues
- Brand deviation, intentional: the Landing Page's two section dividers are Dark Blue, not Stone/Ink — see Build decisions. Future sessions should not "fix" this back to brand-compliant without checking with the builder first, since it was a deliberate explicit request.
- Blocking deploy: EcoVadis redirect URL is still a placeholder (`https://www.ecovadis.com/`) — swap in the real URL before deploy.
- (v2) Upload with missing required answers: default is to block Submit until a corrected file is uploaded — builder may override (spec v2.0 §15).
- (v2) Landing questionnaire button label assumed "Complete Questionnaire" — builder may change (spec v2.0 §15).
- `xlsx` (SheetJS), the only client-side .xlsx/.csv parsing library available via the npm registry from this environment, is pinned at 0.18.5 with two known high-severity advisories (prototype pollution, ReDoS) that SheetJS has not patched on npm — fixed releases exist only on SheetJS's own CDN, which this sandboxed environment's network policy can't reach. Risk is contained (parsing happens entirely client-side on a file the supplier uploads themselves; nothing server-side or networked is exposed), but the builder may want to source the patched tarball directly from cdn.sheetjs.com and swap it in outside this environment.
[Rule: bugs, edge cases, and deferred fixes. One line each. Remove when resolved.]

## Notes for next session
None.
[Rule: the builder writes here between sessions. Claude Code reads these aloud at session start, acts on them, then clears this section.]
