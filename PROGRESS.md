# PROGRESS — Supplier Sustainability Portal

> Claude Code: read this file at the start of every session, before touching anything. Update it at every save point. Replace content — do not append. History lives in git.

**Session:** 1 — build complete, ready for deploy
**Last updated:** 7 July 2026 — by Claude Code, session 1
**Live URL:** none yet [Rule: fill in after the first successful deploy]

## Current state
The full single-page portal is built at `index.html` (self-contained: inline CSS, inline JS, Google Fonts CDN link, no separate files). All five sections are in place and match the spec: Hero (headline + four stat tiles), Why (value-chain exposure, net-zero ambition, reporting-readiness context, shared-journey framing, six plain-language priority themes), How it works (Smart Intake explanation, two supporting points), What you do now (Yes/No/Reset decision tree with Path A/Path B cards), What happens next + footer (four-step timeline, resources row, external-audience confidentiality line). Downloadable assets live in `assets/`. Brand skill applied throughout (Chalk/Ink/Linen/Stone palette, Playfair Display + DM Sans, square corners, no shadows/gradients, Acid Lime used twice). Tested locally with `npx serve .` and Playwright: decision-tree emphasis/dim/reset states, dimmed-button functionality, both file downloads, the EcoVadis link's new-tab behaviour, and mobile layout all verified working. All 16 acceptance criteria in the spec pass, except criterion 8 which is blocked only on the real EcoVadis URL (see Known issues).
[Rule: this section describes what exists and works right now — never what is planned. Completed checklist items get absorbed here in compressed form.]

## Last session
Session 1: ran First Session Setup, then built the complete page in one pass — all five sections, the decision-tree interaction, and the brand system. Verified locally with a headless-browser walkthrough (desktop + mobile screenshots, click-through of Yes/No/Reset, both downloads, dimmed-button behaviour). Ready to deploy once the real EcoVadis URL is supplied.
[Rule: 3–5 lines maximum. Replace each session — what was built, changed, or fixed.]

## Remaining work
- [ ] Swap the placeholder EcoVadis URL (`https://www.ecovadis.com/`, marked with a `BUILDER:` comment above the Path A link in `index.html`) for the confirmed redirect URL before deploy
- [ ] Builder confirms the drafted footer confidentiality wording (or supplies replacement copy)
- [ ] Deploy to Netlify — drag the repo root folder (`index.html` + `assets/`) into the Netlify dashboard (manual; no build command, no env vars)
[Rule: completed items leave this list and are absorbed into Current state. This list only shrinks.]

## Build decisions
- Single self-contained `index.html` (inline CSS + inline JS, no separate asset files besides `assets/`) to keep the drag-and-drop deploy folder minimal.
- Path A and Path B action buttons are plain `<a>` elements (external link with `target="_blank" rel="noopener"`, and a `download` attribute respectively) — no JS needed for the redirect/download itself, only for the Yes/No/Reset emphasis toggle.
- Reference PDFs (Procurement Sustainability Strategy 2026, Program Charter 2026) live in `docs/reference/` — grounding material for copy, never linked from the page itself.
- Questionnaire file's extension corrected from `.XLS` to `.xlsx` to match its actual internal format (confirmed via `file`: Microsoft Excel 2007+/zip-based), matching the spec's `.xlsx` wording.
- Acid Lime used exactly twice per the brand skill's cap: an underline on "2026" in the hero headline, and the black "Smart Intake" badge pill.
- CSRD is never named on the page; the Why section refers to it only as "new sustainability reporting obligations," per the no-reporting-codes rule.

## Known issues
- Blocking deploy: EcoVadis redirect URL is still a placeholder (`https://www.ecovadis.com/`) — swap in the real URL before the drag-and-drop deploy.
- Non-blocking: footer confidentiality line was drafted by Claude Code from the brand voice rules — builder should confirm or replace before deploy.
[Rule: bugs, edge cases, and deferred fixes. One line each. Remove when resolved.]

## Notes for next session
None.
[Rule: the builder writes here between sessions. Claude Code reads these aloud at session start, acts on them, then clears this section.]
