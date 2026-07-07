# PROGRESS — Supplier Sustainability Portal

> Claude Code: read this file at the start of every session, before touching anything. Update it at every save point. Replace content — do not append. History lives in git.

**Session:** 1 — build in progress
**Last updated:** 7 July 2026 — by Claude Code, session 1
**Live URL:** none yet [Rule: fill in after the first successful deploy]

## Current state
First Session Setup complete. `docs/product-spec.md` holds the governed spec; `docs/reference/` holds the two source PDFs (Procurement Sustainability Strategy 2026, Program Charter 2026) used only for content grounding. Brand skill installed at `.claude/skills/the-corporate-brand/SKILL.md`. Download assets organized in `assets/`: Supplier Code of Conduct PDF, Global Environmental Policy PDF, Supplier Questionnaire (renamed `.XLS` → `.xlsx`, its true format). Three duplicate short-filename copies (`PROCUR_1.PDF`, `SUPPLI_1.PDF`, `THE_CO_1.XLS`) were removed after confirming byte-for-byte identity with their descriptively-named counterparts. Page build not yet started.
[Rule: this section describes what exists and works right now — never what is planned. Completed checklist items get absorbed here in compressed form.]

## Last session
Session 1: ran First Session Setup (docs/, assets/, brand skill install) and committed before starting the page build.
[Rule: 3–5 lines maximum. Replace each session — what was built, changed, or fixed.]

## Remaining work
- [ ] Build Hero — intro headline plus the four large headline figures
- [ ] Build Why — value-chain exposure, net-zero ambition, CSRD readiness as context, shared-journey framing; partnership tone
- [ ] Build How it works — the Smart Intake model and the EcoVadis efficiency rule
- [ ] Build What you do now — the Yes/No/Reset decision tree with Path A (EcoVadis link) and Path B (questionnaire download) side by side
- [ ] Build What happens next + footer — four-step timeline, resources row, external-audience confidentiality footer
- [ ] Local test pass — full walkthrough of every section, the Yes/No/Reset interaction, both downloads, the redirect, and mobile layout
- [ ] Acceptance criteria pass — verify every criterion in spec "Acceptance Criteria" (17 items) before deploy
- [ ] Deploy to Netlify — builder drags the self-contained build folder into the Netlify dashboard (manual; no env vars, no Git-Netlify connection)
[Rule: completed items leave this list and are absorbed into Current state. This list only shrinks.]

## Build decisions
None yet.
[Rule: one line per decision made during the build that is not in the spec — prompt structures, field formats, naming choices, library picks. Future sessions depend on these to stay consistent.]

## Known issues
- Provide before first deployment: the EcoVadis redirect URL (Path A destination).
- Provide before first deployment: the Supplier Code of Conduct file and the Global Environmental Policy file (resources row downloads).
- Confirm before first deployment: the EHS help desk email address (mailto).
- Confirm before first deployment: the exact footer confidentiality wording (Claude Code drafts from the brand voice; builder approves).
[Rule: bugs, edge cases, and deferred fixes. One line each. Remove when resolved.]

## Notes for next session
None.
[Rule: the builder writes here between sessions. Claude Code reads these aloud at session start, acts on them, then clears this section.]
