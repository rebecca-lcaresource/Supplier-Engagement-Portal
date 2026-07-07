# Product Spec — Supplier Sustainability Portal

**Version:** 1.0
**Date:** 24 June 2026
**Author:** Zyad Hatquai
**Status:** Confirmed

---

> This spec is written for Claude Code. It assumes zero prior context. Hand it over with the CLAUDE.md and PROGRESS.md the Project Governor produces from it.

---

## Section 1 — Tool Summary

**Tool name:** Supplier Sustainability Portal

**What it does:** A single public landing page that onboards The Corporate's Tier 1 suppliers into the 2026 supplier sustainability engagement programme. It explains what is being asked, why it matters, and routes each supplier to one of two response paths through one simple interactive decision. No login, nothing stored.

**Who uses it:** The Corporate's Tier 1 suppliers, specifically the procurement and sustainability contacts at those supplier companies. They arrive by a direct link sent to them, with no one to walk them through it. The page must be fully self-explanatory.

**Why it exists:** 71% of The Corporate's carbon footprint sits in its value chain. The company cannot reach net-zero or meet its sustainability reporting obligations without supplier data. This page is the self-service front door that gets suppliers to respond with minimum friction, by recognising existing ratings and asking everyone else once.

**Build status:** First build, no prior version.

---

## Section 2 — Classification

### Data Model

**Decision:** D1

| Label | What it means | This tool? |
|-------|--------------|-----------|
| D1 — Hardcoded | All data is written into the code by the developer. Users cannot input anything that persists. The tool displays what the developer put in. | Yes |
| D2 — Session | Data enters the tool during use and disappears when the tab closes. No database. Covers both uploaded files and form inputs. | No |
| D3 — Persisted | Data is written to a database and survives after the session ends. Supabase is required. | No |

**Reason:** Every figure and line on the page is fixed content written in by the builder. The supplier inputs nothing that persists. The EcoVadis Yes/No selection is browser-only UI state that disappears on refresh.

**D3 is triggered if any of the following are true — check all that apply:**
- [ ] Data must be retrievable after the session ends
- [ ] Multiple sessions contribute to the same dataset
- [ ] An audit trail or history is needed
- [ ] Data submitted by one person must be visible to another
- [ ] Results must be accessible via a URL after the session ends
- [ ] Files uploaded by users must be stored and retrievable later

None apply.

---

### Access Model

**Decision:** A1

| Label | What it means | This tool? |
|-------|--------------|-----------|
| A1 — Public | Anyone with the URL can use it. No login, no account required. | Yes |
| A2 — Authentication | Users must log in. All logged-in users see the same thing and have the same permissions. | No |
| A3 — Authorization | Users must log in and have different roles. Different roles see different data or have different permissions. | No |

**Reason:** The portal is sent directly to external suppliers and must open for anyone holding the link, with no account and no barrier.

---

### Tier

**Tier:** 1

| Tier | D+A combination | Stack | Deployment |
|------|----------------|-------|------------|
| 1 | D1+A1 or D2+A1 | Netlify only | Netlify |
| 2 | D3+A1 | Netlify + Supabase (no auth) | Netlify |
| 3 | D3+A2 or D3+A3 | Netlify + Supabase (auth + RLS) | Netlify |

D1 + A1 resolves to Tier 1: fixed content, public, nothing stored. The fastest kind to build.

---

### Standalone or Stack

**This tool is:** Standalone. It does not share a database with any other tool. There is no database at all.

---

## Section 3 — Arms

Arms are capabilities added to the tool. They do not change the tier. This tool has no active arms.

### AI API Arm

**Active:** No

### Export Arm

**Active:** No

> Note: Path B offers a download of the supplier questionnaire as an Excel file, but this is a fixed file bundled with the site and served as a static download. It is not a generated export and requires no function or backend.

### Email Arm

**Active:** No

> Note: Path A redirects to EcoVadis. The completed questionnaire is returned offline by the supplier to their account manager or programme contact. The EHS help desk is a `mailto:` link that opens the supplier's own email client. None of these is a server-side send, so the Email arm is not active and no Resend account is needed.

### Scheduled Automation Arm

**Active:** No

---

## Section 4 — Stack and Deployment

### All Tiers

| Detail | Answer |
|--------|--------|
| Frontend framework | HTML / CSS / JS, single scrolling page. No framework. The only interactivity is one client-side decision toggle. |
| Deployment target | Netlify |
| Netlify MCP | Not active. Deployment is done manually by the builder. |

**Deployment method — explicit override:** The builder deploys by dragging the build output folder (the HTML file plus its `assets/` folder of downloads) into the Netlify dashboard. This is a manual drag-and-drop deploy, not a Git-triggered Netlify deploy. There are no environment variables and no build command. Claude Code should produce a self-contained static folder ready to drag and drop.

**GitHub — pre-build requirement:**
The builder creates the GitHub repo before the first Claude Code session and uploads product-spec.md, CLAUDE.md, and PROGRESS.md to the repo root. Claude Code uses the repo to keep its work safe across sessions and commits regularly. GitHub here is for source and session continuity only. It is not wired to Netlify for deploys, because deployment is manual drag-and-drop (see above).

### CONDITIONAL: Supabase project

Not applicable. Tier 1, no database.

### CONDITIONAL: Stack

Not applicable. Standalone tool.

---

## Section 5 — Data Architecture

**Not applicable.** Data model is D1. There is no database and no schema for Claude Code to build.

---

## Section 6 — Access, Permissions and RLS

**Not applicable.** Access model is A1. There is no authentication, no user accounts, and no database, so there are no roles, permissions, or RLS policies. No A2/A3 privacy note is required because no login emails are stored.

---

## Section 7 — GDPR

**GDPR outcome:** Not applicable. Confirmed during the interview.

This tool has no database, no forms, and no uploads. It collects and stores no personal data of any kind. The only outbound contact is a `mailto:` link to the EHS help desk, which opens the supplier's own email client and captures nothing on the page. There is therefore no consent flow, data statement, or deletion mechanism to build.

> Confirmed by the builder: the page collects no personal data through any form or upload. GDPR is marked not applicable for this build.

---

## Section 8 — Screen and UI Structure

This is a single scrolling page with five stacked sections, in this exact order. The reference figures, dates, and wording below come from The Corporate Program Charter and Procurement Sustainability Strategy 2026. Do not invent or alter figures, dates, or requirements. Use plain priority-theme language only. Do not print any reporting-standard codes anywhere on the page.

### Section 1 of page — Hero

- **Purpose:** State what the portal is and anchor it with the four headline figures.
- **What is visible:** A headline naming the portal and the 2026 supplier sustainability engagement programme. One or two lines stating what this page is and what the supplier is here to do. Four large, prominent stat figures, displayed big:
  - **690,000 tCO2e** — total footprint, 2023
  - **71%** — of it in Scope 3, our value chain
  - **2045** — net-zero target year
  - **500+** — Tier 1 suppliers
- **User actions:** Read and scroll. A primary call-to-action button may anchor-scroll down to the "What you do now" section.
- **What happens next:** Continues into the Why section.

### Section 2 of page — Why

- **Purpose:** Explain why The Corporate is asking, framed as partnership rather than demand.
- **What is visible:** A short narrative covering four points drawn from the charter and strategy: the value-chain exposure (most of the footprint sits with suppliers, not inside The Corporate's own plants); the net-zero by 2045 ambition, with the 50% reduction against the 2023 base year by 2030 as supporting context; sustainability reporting readiness, referred to in plain language as CSRD readiness, framed as context for why visibility is needed now; and the shared-journey framing that this is the start of a working relationship. Priority themes are named in plain language only: climate, pollution, water, circular economy, people, governance.
- **User actions:** Read and scroll.
- **What happens next:** Continues into How it works.

### Section 3 of page — How it works (Smart Intake)

- **Purpose:** Explain the Smart Intake model and the efficiency rule before the supplier reaches the decision.
- **What is visible:** A short explanation that The Corporate recognises existing standards, so a valid EcoVadis scorecard exempts a supplier from the full assessment, and that everyone else completes one structured assessment, once. Two short supporting points: "Recognise existing standards" and "Ask once, then partner."
- **User actions:** Read and scroll.
- **What happens next:** Leads directly into the decision tree.

### Section 4 of page — What you do now (the decision tree)

- **Purpose:** Route each supplier to the correct response path. This is the only interactive element on the page.
- **What is visible:**
  - A single qualification question: **"Do you hold a valid EcoVadis scorecard issued within the last 12 months?"** with two buttons, **Yes** and **No**.
  - Beneath the question, two path cards sit side by side:
    - **Path A — EcoVadis:** a short instruction to share the scorecard, plus a button that redirects to EcoVadis (external link, opens in a new tab).
    - **Path B — Questionnaire:** a short instruction to complete the assessment offline and return it, plus a button that downloads the questionnaire as an Excel file.
  - A **Reset** control near the question.
- **User actions:**
  - Click **Yes** → Path A is highlighted, Path B is visibly dimmed.
  - Click **No** → Path B is highlighted, Path A is visibly dimmed.
  - Click **Reset** → both path cards return to a neutral, equal state with no selection.
  - From a path card, click its action button: Path A redirects to EcoVadis, Path B downloads the Excel questionnaire.
- **What happens next:** Path A opens the EcoVadis URL in a new tab. Path B downloads the bundled `.xlsx`. Both path cards stay visible at all times. Dimming changes emphasis only; it does not remove or disable either card.

### Section 5 of page — What happens next, and footer

- **Purpose:** Show the programme timeline, point to resources, and close with the brand footer.
- **What is visible:**
  - A four-step programme timeline, in order:
    - **Portal Launch** — April 2026
    - **Data Submission deadline** — 30 September 2026
    - **Review & Scoring** — Q4 2026
    - **Partnership Plans** — Q1 2027
  - A resources row with three items:
    - **Supplier Code of Conduct** — downloads a file provided by the builder
    - **Global Environmental Policy** — downloads a file provided by the builder
    - **EHS help desk** — a `mailto:` link to `support@thecorporate.com`
  - A brand footer with a confidentiality line written for an external supplier audience. It must not say "internal use only." Use a supplier-appropriate confidentiality line consistent with The Corporate brand.
- **User actions:** Read the timeline. Click a resource to download the relevant file or open the help desk email.
- **What happens next:** Resource clicks download the provided files or open the supplier's email client addressed to `support@thecorporate.com`.

---

## Section 9 — Logic and Calculations

There is no scoring or calculation. There is one client-side routing rule for the decision tree.

**What is applied:** A single decision rule driven by one Yes/No answer, controlling the visual emphasis of two path cards.

**Inputs:** One selection — the supplier's answer to "Do you hold a valid EcoVadis scorecard issued within the last 12 months?"

**Rules:**
- Yes → emphasise Path A (EcoVadis), dim Path B.
- No → emphasise Path B (Questionnaire), dim Path A.
- Reset → both paths neutral, no selection.
- State lives in the browser only and is lost on refresh.
- Both action buttons stay functional regardless of emphasis. Dimming is purely visual.

**Output:** A visual emphasis state on the two path cards. No stored result, no number. The redirect and the download fire only when the supplier clicks a path's action button, never automatically from the Yes/No answer itself.

**Edge cases:**
- No answer selected → both paths shown neutral, both action buttons available.
- Page refresh → resets to neutral.
- Supplier clicks the action button inside a dimmed path → it still works, because dim is visual only. This is deliberate, so a supplier who answered the question one way can still act on the other path without being trapped.

---

## Section 10 — Brand and Visual Direction

**Brand reference:** Brand skill file. Upload `the-corporate-brand` flat to the repo root; Claude Code installs it to `.claude/skills/` in the first session and applies it to all copy and UI. Read it before writing a single line of code or copy.

**Visual feel:** Professional and corporate, clean, board-credible. It should carry the same authority as The Corporate's confidential strategy documents, but read as an outward-facing invitation to suppliers rather than an internal memo.

**Reference or inspiration:** The Corporate Program Charter and Procurement Sustainability Strategy 2026 (visual language, figures, and tone).

---

## Section 11 — API and Credentials

No external services and no credentials. The tool is a static page. The EcoVadis redirect is a plain hyperlink, and the EHS help desk is a `mailto:` link. There are no API keys, tokens, or secrets of any kind, and no environment variables.

---

## Section 12 — Out of Scope — Phase 2

| Deferred feature | Reason it is deferred |
|-----------------|----------------------|
| In-portal questionnaire form (filling the assessment on the page) | Validate the core onboarding page first. Suppliers complete the Excel offline this version. |
| CSV upload | No uploads in this version. |
| EcoVadis scorecard upload | No uploads in this version. Path A redirects to EcoVadis instead. |
| Live send / server-side submission of the completed questionnaire | The questionnaire is returned offline to the account manager or programme contact. No send mechanism on the page. |
| Saved progress or supplier accounts | No login and no persistence in this version. |
| Automated supplier scoring | Out of scope for the launch portal. |
| Any database or persistence | None in this version, by design. Persistence is a later phase per the charter. |
| Programmatic EcoVadis validation | Out of scope this phase, consistent with the charter. |

---

## Section 13 — Acceptance Criteria

| # | What to verify | Expected result | Done? |
|---|---------------|-----------------|-------|
| 1 | Page renders as a single scrolling page with all five sections in order | Hero → Why → How it works → What you do now → What happens next + footer | [ ] |
| 2 | Hero shows the four headline figures, large and prominent | 690,000 tCO2e (2023), 71% Scope 3, net-zero by 2045, 500+ Tier 1 suppliers, exactly as written | [ ] |
| 3 | No reporting-standard codes appear anywhere on the page | Priority themes named in plain language only (climate, pollution, water, circular economy, people, governance) | [ ] |
| 4 | Why section frames the ask as partnership and references CSRD readiness as context | Narrative present, no demand tone, no standard codes | [ ] |
| 5 | Decision tree responds to Yes | Path A highlighted, Path B dimmed | [ ] |
| 6 | Decision tree responds to No | Path B highlighted, Path A dimmed | [ ] |
| 7 | Reset returns both paths to neutral | No selection, equal emphasis | [ ] |
| 8 | Path A button opens the EcoVadis URL in a new tab | EcoVadis opens; URL provided by builder | [ ] |
| 9 | Path B button downloads the provided Excel questionnaire | The bundled `.xlsx` downloads | [ ] |
| 10 | Dimmed path action buttons remain functional | Clicking a dimmed path's button still redirects or downloads | [ ] |
| 11 | Timeline shows the four steps with correct labels and dates | Portal Launch April 2026, Data Submission deadline 30 September 2026, Review & Scoring Q4 2026, Partnership Plans Q1 2027 | [ ] |
| 12 | Resources row works | Code of Conduct and Global Environmental Policy download their files; EHS help desk opens a mailto to support@thecorporate.com | [ ] |
| 13 | Footer confidentiality line suits an external audience | Brand-styled, does not say "internal use only" | [ ] |
| 14 | The Corporate brand applied throughout | Colours, type, and layout match the brand skill | [ ] |
| 15 | Responsive | Loads and reads correctly on desktop and mobile | [ ] |
| 16 | Deploys as a drag-and-drop static folder | Build output folder drops into Netlify with no build command and no env vars | [ ] |

---

## Section 14 — Build Path

**This tool's tier:** Tier 1

### Pre-build steps — complete these before opening Claude Code

- [ ] Tool Architect skill — interview complete, this spec written and confirmed
- [ ] Project Governor skill — CLAUDE.md and PROGRESS.md produced from this spec
- [ ] GitHub repo created by the builder
- [ ] product-spec.md uploaded to the repo root
- [ ] CLAUDE.md uploaded to the repo root
- [ ] PROGRESS.md uploaded to the repo root
- [ ] `the-corporate-brand` skill file uploaded to the repo root
- [ ] Assets provided and placed in the repo for bundling: the questionnaire Excel file (`The_Corporate_Supplier_Questionnaire_2026.xlsx`), the Supplier Code of Conduct file, and the Global Environmental Policy file
- [ ] EcoVadis redirect URL provided (Path A destination)
- [ ] EHS help desk email confirmed: `support@thecorporate.com`
- [ ] No credentials needed — nothing to enter as environment variables

> Netlify MCP is not active. Deployment is manual drag-and-drop, so Netlify is not connected to the GitHub repo. Claude Code organizes files into the correct folder structure (docs/, .claude/skills/) at the start of the first session.

### Tier 1 — build session

- [ ] Open Claude Code in the project folder (GitHub repo connected for source and session safety)
- [ ] Claude Code runs First Session Setup: creates docs/, moves reference files, installs the brand skill
- [ ] Claude Code reads product-spec.md, CLAUDE.md, and PROGRESS.md
- [ ] Claude Code reads the brand skill before writing any copy or code
- [ ] Claude Code builds the single-page tool plus its `assets/` folder of downloads
- [ ] Wire Path A to the provided EcoVadis URL, Path B to the bundled questionnaire file, the two resource links to their files, and the EHS help desk to the mailto
- [ ] Test locally, including the Yes/No/Reset interaction, both downloads, the redirect, and mobile layout
- [ ] **Deployment override:** do not rely on Git-triggered Netlify deploy. Produce a self-contained static build folder and deploy it by dragging it into the Netlify dashboard. No environment variables.

---

## Section 15 — Open Questions

| Question | Who answers it | Blocking? |
|----------|---------------|-----------|
| Exact EcoVadis redirect URL for Path A | Builder | No — build with a clearly marked placeholder constant, drop in the real URL before deploy |
| Final Supplier Code of Conduct file | Builder | No — wire the link during build, bundle the file when provided |
| Final Global Environmental Policy file | Builder | No — wire the link during build, bundle the file when provided |
| Exact confidentiality wording for the external footer | Builder / brand skill | No — Claude Code drafts from the brand skill, builder confirms |

---

## Section 16 — Tool Version History

| Version | Date | What changed in the tool |
|---------|------|--------------------------|
| v1.0 | 24 June 2026 | Initial build |

---

*This spec is written for Claude Code. It assumes zero prior context. Every decision, rule, and requirement is explicit enough to hand over without a single verbal explanation.*
