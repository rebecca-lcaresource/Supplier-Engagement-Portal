# Supplier Sustainability Portal — Build Activity Log

**Project:** The Corporate Supplier Sustainability Portal
**Repo:** Supplier-Engagement-Portal (GitHub)
**Live site:** https://supplier-engagement-portal.netlify.app/
**Log compiled:** 7 July 2026
**Status note added:** 8 July 2026

> **Current status (8 July 2026):** This log narrates the *pre-build* Tool Architect → Project Governor → Claude Code workflow. It was compiled at the point where v2.0 was specced but not yet built. **v2.0 has since been built, deployed, and confirmed live** (7 July 2026), and audited against the spec (8 July 2026). The "next steps" in Stage 9 are done — see "Open items to carry forward" at the bottom for the current picture. The single genuinely-open item is the placeholder EcoVadis URL. Do not read Stage 9 as outstanding work.

---

## Overview

This log records the full pre-build and iteration workflow for the Supplier Sustainability Portal, a public landing page onboarding The Corporate's Tier 1 suppliers into the 2026 sustainability engagement programme. Two versions are covered: **v1.0** (a static informational page, built and deployed) and **v2.0** (a React rebuild adding in-tool questionnaire submission — built, deployed, and live as of 7 July 2026; see the status note above). The workflow followed the SustainOS AILab sequence: **Tool Architect** (writes the spec) → **Project Governor** (writes the build-governance files) → **Claude Code** (builds).

---

## Stage 1 — Tool Architect run (v1.0 spec)

- Invoked the **Tool Architect** skill with a detailed brief for a single public supplier onboarding page (intro + headline figures, "why," Smart Intake explanation, an interactive EcoVadis Yes/No decision tree, a four-step timeline, resources row, and brand footer).
- Supplied source-of-truth documents: **Program Charter 2026**, **Procurement Sustainability Strategy 2026**, the **Supplier Sustainability Assessment (Excel questionnaire)**, and **the-corporate-brand.skill**.
- Confirmed the brief excluded any in-portal questionnaire form or CSV upload; the questionnaire was a downloadable Excel completed offline.
- **Classification agreed:** Tier 1 — Data model **D1** (fixed content), Access **A1** (public, no login), **standalone**, **no arms**, **no database**, **GDPR not applicable**.
- **Decisions confirmed:** tool name "Supplier Sustainability Portal"; deployment via manual drag-and-drop to Netlify with GitHub for source; five placeholders left for later (EcoVadis link, Code of Conduct file, Global Environmental Policy file, help desk email, footer confidentiality wording).
- **Output produced:** `product-spec.md` (v1.0, status Confirmed), grounded entirely in the source documents — no invented figures or dates.

## Stage 2 — Installing the Project Governor skill

- Established that the **Project Governor** is a separate SustainOS skill and was not yet installed.
- Walked through installing a `.skill` file: **Settings → Capabilities** (confirm Code execution is on) → **Customize → Skills → "+" → Create skill → Upload a skill** → toggle on.
- Skill installed successfully.

## Stage 3 — Project Governor run (v1.0 governance files)

- Ran **Project Governor** against the confirmed v1.0 spec.
- Cleared all gates: Tier 1 confirmed, no Supabase, brand skill present, no blocking gaps.
- **Outputs produced:** `CLAUDE.md` (v1.0 rulebook, 79 lines) and `PROGRESS.md` (v1.0 checklist, seeded at Session 0 / nothing built).

## Stage 4 — GitHub repo setup

- Created the **Supplier-Engagement-Portal** repo and uploaded the governance files.
- Housekeeping resolved during setup: located the two previously-missing policy files (Code of Conduct, Global Environmental Policy); removed duplicate `product-spec.md` copies from a staging upload; kept a single clean set; identified the source PDFs as optional reference material.
- Confirmed final repo set: `CLAUDE.md`, `PROGRESS.md`, `product-spec.md`, `the-corporate-brand.skill`, the questionnaire Excel, and the two policy PDFs.

## Stage 5 — v1.0 build and deploy (Claude Code)

*Performed in Claude Code; recorded here from the resulting PROGRESS.md.*

- Ran First Session Setup, then built the complete static page in one pass: Hero, Why, How it works, decision tree, timeline + footer.
- Applied the brand system (Chalk/Ink/Linen/Stone, Playfair Display + DM Sans, square corners, no shadows, Acid Lime used twice).
- Verified locally (decision-tree states, downloads, EcoVadis new-tab link, mobile layout); 16 acceptance criteria passing except the one blocked on the real EcoVadis URL.
- **Deployed to Netlify** via manual drag-and-drop. Live at https://supplier-engagement-portal.netlify.app/
- Key build decisions recorded (self-contained `index.html`; plain `<a>` buttons; questionnaire extension corrected `.XLS` → `.xlsx`; CSRD never named on the page).
- **Still open from v1.0:** swap the placeholder EcoVadis URL for the real one and redeploy.

## Stage 6 — v2.0 spec introduced

- Uploaded a new `product-spec.md`. Identified it as a **different, expanded version (v2.0)** — not the v1.0 that was built.
- Flagged the differences before acting: it reintroduced an **in-tool questionnaire form** and **file upload**, added a **PDF export**, and moved the data model to **D2**.
- Confirmed this was **intentional** — a deliberate second version.

## Stage 7 — Project Governor run (v2.0, iteration mode)

- Re-read the full v2.0 spec and both output templates.
- Corrected course on an important point: because **v1.0 was genuinely built and deployed**, this was treated as a **true iteration on a live build**, not a fresh start.
- Retrieved the **current PROGRESS.md** from the repo to preserve v1.0 history.
- Confirmed with the builder: target repo is Supplier-Engagement-Portal; **v2.0 replaces v1.0 on the same Netlify URL**.
- **Classification (v2.0):** Tier 1 — Data model **D2** (supplier input held in the browser for the session only, nothing stored), Access **A1**, **standalone**. **Export arm active** (browser-only): template download + client-side branded PDF. Frontend migrates **HTML/CSS/JS → React + Vite + Tailwind**. No database, no credentials, no environment variables. GDPR still not applicable (nothing leaves the browser).
- **Outputs produced:**
  - `CLAUDE.md` — fully regenerated for v2.0 (80 lines).
  - `PROGRESS.md` — v1.0 state, build decisions, live URL, and known issues **preserved**; v2.0 work appended, each line tagged `(v2 revision)`; one known-issues line added noting the spec revision.

## Stage 8 — GitHub update (v2.0 files)

- Uploaded the three v2.0 files to the repo, replacing the older same-named versions: `product-spec.md`, `CLAUDE.md`, `PROGRESS.md`.
- Brand skill and questionnaire Excel left in place.

## Stage 9 — Current position and next steps

- **Live site:** v1.0 still running, unaffected.
- **Next action:** open **Claude Code** and build v2.0 by working through the `(v2 revision)` items in PROGRESS.md — starting with deriving the S1–S7 form fields from the questionnaire Excel and confirming the mapping.
- **Netlify:** update it **only after** Claude Code has built and pushed v2.0. Because v2.0 is a React app, the same Netlify site needs a one-time switch to build-on-deploy (build command `npm run build`, publish folder `dist`) instead of drag-and-drop. Dashboard walkthrough to follow at that point.

---

## Files produced in this workflow

| File | Version | Stage | Status |
|------|---------|-------|--------|
| `product-spec.md` | v1.0 | Tool Architect | Superseded by v2.0 |
| `CLAUDE.md` | v1.0 | Project Governor | Superseded by v2.0 |
| `PROGRESS.md` | v1.0 | Project Governor → Claude Code | Preserved inside v2.0 |
| `index.html` (live site) | v1.0 | Claude Code | Built & deployed |
| `product-spec.md` | v2.0 | (revised spec) | Current — in repo |
| `CLAUDE.md` | v2.0 | Project Governor (iteration) | Current — in repo |
| `PROGRESS.md` | v2.0 | Project Governor (iteration) | Current — in repo |

## Key decisions across the workflow

- Kept both versions **Tier 1** (public, no database) — v1.0 as D1, v2.0 as D2 with browser-only input.
- v2.0 collects supplier input but **stores and transmits nothing** — the load-bearing rule that keeps GDPR inapplicable.
- v2.0 **replaces v1.0 at the same live URL** rather than spinning up a new site.
- Governor **iteration mode** preserved the v1.0 PROGRESS.md rather than resetting it — protecting the live build's history.

## Open items to carry forward

*Updated 8 July 2026 — most of the original list is now done.*

- [x] Build v2.0 in Claude Code — **done 7 July 2026** (Guided Form, both doors, PDF export; all 15 acceptance criteria verified).
- [x] Confirm the S1–S7 questionnaire field mapping (derived from the Excel) — **confirmed 7 July 2026**; lives in `src/data/questionnaireFields.js`.
- [x] Confirm the landing button label and the upload-missing-required behaviour — **settled 8 July 2026** ("Complete Questionnaire" kept; block-Submit-on-missing kept).
- [x] Switch the Netlify site to build-on-deploy, then redeploy v2.0 over v1.0 — **done 7 July 2026**; CI now auto-deploys on every push to `main`.
- [ ] Swap the placeholder EcoVadis URL for the real redirect and redeploy — **still open** (carried over from v1.0; the current link is only the EcoVadis homepage).
