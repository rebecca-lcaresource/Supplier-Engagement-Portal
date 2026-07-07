# The Corporate Supplier Sustainability Portal 2026

## Identity
A public landing page that routes Tier 1 suppliers to either the EcoVadis scorecard or an in-tool questionnaire (a guided form or a download-complete-upload flow), all handled in the browser — anyone with the link can use it, no login.
Tier: 1 — public page, no login, no database; supplier input is held in the browser for the session only and never stored (D2+A1).
Spec version governed: v2.0 — the version of docs/product-spec.md these rules were derived from.
Position: Standalone — no shared database, no other tools.

## Session Protocol
At the start of every session:
1. Pull the latest from main before reading anything else.
2. Check docs/product-spec.md: if its version is newer than the "Spec version governed" line above, STOP and tell the builder to re-run the Project Governor on the revised spec before building. Do not build against a stale CLAUDE.md.
3. Read PROGRESS.md in the root — it is the current state of this build. If it is missing, recreate it with the structure below, then continue.
4. Increment the session number and update the date in PROGRESS.md.
5. If "Notes for next session" has content: repeat it back to the builder, treat it as this session's priorities, then clear the section.
6. First Session Setup already ran in the v1.0 build (session 1). Do not re-run it; confirm docs/, the brand skill, and the questionnaire asset are still in place, then build.

Save point — after completing any module, feature, or fix:
1. Update PROGRESS.md: current state, remaining work, build decisions, known issues.
2. Commit and push to main.
3. Tell the builder in one line: "Save point committed: [what changed]."
Do not start the next piece of work before the save point is pushed. An ending session is a save point.

PROGRESS.md structure (for the recreate rule): status header (Session / Last updated / Live URL), Current state, Last session (3–5 lines, replace each session), Remaining work (shrinking checklist), Build decisions (one line each), Known issues, Notes for next session.

## Commands
```
npm install
npm run dev
npm run build
```

## Tech Stack
React · Vite · Tailwind CSS · Netlify
The frontend is being migrated from the v1.0 HTML/CSS/JS build to React + Vite + Tailwind; the Landing Page content and all brand rules carry over unchanged.
Deployment: Netlify MCP is not active, and GitHub is NOT connected to Netlify — same manual model as v1.0. Claude Code runs `npm run build` and hands the builder the `dist/` folder; the builder drags that folder into the existing Netlify site's dashboard (same live URL — v2.0 replaces v1.0). No environment variables, no build command configured in the Netlify dashboard.

## Arms
Export — browser only, no server function — (1) downloads the unchanged questionnaire template (XLSX) from within Door 2; (2) generates a branded client-side PDF summary of the supplier's submitted answers (S1–S7, door used, date) on the Confirmation screen, per the design in docs/product-spec.md.

## Hard Rules
- No supplier input ever leaves the browser. Typed form answers, parsed upload contents, and review/confirmation data stay in React state for the session only. No network request may transmit, store, or email any of it; no localStorage/sessionStorage/IndexedDB or any persistence. Refreshing or closing the tab clears everything. This invariant is what keeps GDPR inapplicable and satisfies the "no data leaves the browser" acceptance criterion — never add a backend call, form POST, or storage.
- No API keys, tokens, or secrets anywhere. Client-side parsing and PDF libraries are bundled at build time and use no keys.
- Uploaded files are parsed client-side only. A structural mismatch fails outright with a clear re-upload prompt — never a partial or best-effort mapping, and never a server upload.

## Project Structure
```
/                     ← root: CLAUDE.md, PROGRESS.md
/src                  ← React app (components, views, parsing + PDF logic)
/public/assets        ← questionnaire template + resource downloads
/docs                 ← product-spec.md (+ reference/ grounding PDFs)
/.claude/skills/the-corporate-brand/   ← brand skill
```

## Brand
Brand is governed by the the-corporate-brand skill at .claude/skills/the-corporate-brand/SKILL.md (installed in the v1.0 build). Invoke it for all UI, the new screens, and the PDF export.
Hard rules that hold even if the skill is not loaded:
- Background: #F2F2F2 (Chalk) — never white or Tailwind gray defaults
- Accent, buttons, CTAs: #000000 (Ink); links underlined in Ink, never blue
- Fonts: Playfair Display for headlines, DM Sans 300 for body, DM Sans 500 for labels/emphasis
- Square corners (border-radius: 0); no drop shadows, no gradients. Acid Lime #C8F135 only against black, sparingly.

## Business Rules
- The landing page's questionnaire button ("Complete Questionnaire") opens the Door Choice screen — it never triggers a download. The EcoVadis button is unchanged: opens EcoVadis in a new tab.
- Door 1 (Guided Form): a 7-section wizard; the supplier moves freely back and forth between visited sections. Required-field validation blocks advancing past a section and blocks final submit, with inline errors. Field definitions are derived from the questionnaire Excel workbook at build time and confirmed with the builder.
- Door 2 (Download & Upload): download the unchanged template; accept .xlsx or .csv; parse client-side and map to the same field structure as Door 1. Structural mismatch fails outright (re-upload prompt); on success, show the read-only Upload Review.
- Upload Review is read-only — no inline editing. A missing required field blocks Submit until a corrected file is uploaded (default; the builder may override).
- Confirmation screen is shared by both doors: it shows which door was used plus a summary, and offers "Download PDF" (the Export arm above).

Out of scope — do not build:
- Persisted storage of submissions, or any database (Tier 2/3)
- Supplier login or verification (any A2/A3 access change)
- Internal review dashboard, or a submission/response tracker
- Automated EcoVadis scorecard validation

## Reference Docs
Read before building the related part:
- docs/product-spec.md — full screen specs, door logic, parsing rules, PDF design, acceptance criteria
- .claude/skills/the-corporate-brand/SKILL.md — full brand system
PROGRESS.md in the root is read at every session start per the Session Protocol.
