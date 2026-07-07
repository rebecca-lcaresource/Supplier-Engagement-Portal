# Product Spec — The Corporate Supplier Sustainability Portal 2026

**Version:** 2.0
**Date:** 5 July 2026
**Author:** Zyad Hatquai
**Status:** Confirmed

---

## Section 1 — Tool Summary

**Tool name:** The Corporate Supplier Sustainability Portal 2026

**What it does:** A single-page public landing page that onboards Tier 1 suppliers into The Corporate's ESRS-aligned sustainability assessment programme. It communicates the company's net-zero targets, explains the two submission paths, and routes each supplier to the correct action. Route one is the EcoVadis scorecard. Route two, the questionnaire, now lets suppliers submit their answers directly through the tool, either by filling in a guided in-tool form or by downloading, completing offline, and uploading the finished file for review before submitting.

**Who uses it:** Tier 1 supplier contacts, sustainability managers, EHS leads, and procurement representatives at supplier organisations, who receive the URL directly from The Corporate's procurement or EHS team.

**Why it exists:** To formally launch The Corporate's 2026 supplier sustainability assessment without requiring direct explanation from the internal team, and to remove the email round-trip from the questionnaire route. This version is also a UX experiment: it validates whether suppliers can complete and submit the full questionnaire in-browser before any backend delivery is built.

**Build status:** Iteration. Previous version (v1.0) was a static single-page site with two routes: EcoVadis (external link, unchanged) and Excel download (offline completion, returned by email, outside the tool). This build replaces the email return step with two in-tool submission doors on the questionnaire route. Nothing is stored or emailed in this version; it is explicitly scoped as an experiment to validate the submission flow.

---

## Section 2 — Classification

### Data Model

**Decision:** D2

| Label | What it means | This tool? |
|-------|--------------|-----------|
| D1 — Hardcoded | All data is written into the code by the developer. Users cannot input anything that persists. The tool displays what the developer put in. | No |
| D2 — Session | Data enters the tool during use and disappears when the tab closes. No database. Covers both uploaded files and form inputs. | Yes |
| D3 — Persisted | Data is written to a database and survives after the session ends. Supabase is required. | No |

**Reason:** Suppliers now type answers into a guided form or upload a completed file, and the tool reads that data back to them during the session. Nothing is written to a database, sent by email, or otherwise transmitted anywhere. It exists only in the browser for the duration of that visit and is discarded the moment the tab closes. This version deliberately validates the submission experience before any persistence is added.

**D3 triggers — none apply, confirmed during the interview:**
- [ ] Data must be retrievable after the session ends
- [ ] Multiple sessions contribute to the same dataset
- [ ] An audit trail or history is needed
- [ ] Data submitted by one person must be visible to another
- [ ] Results must be accessible via a URL after the session ends
- [ ] Files uploaded by users must be stored and retrievable later

---

### Access Model

**Decision:** A1

| Label | What it means | This tool? |
|-------|--------------|-----------|
| A1 — Public | Anyone with the URL can use it. No login, no account required. | Yes |
| A2 — Authentication | Users must log in. All logged-in users see the same thing and have the same permissions. | No |
| A3 — Authorization | Users must log in and have different roles. Different roles see different data or have different permissions. | No |

**Reason:** The page is still distributed to Tier 1 suppliers as a direct link. Suppliers self-identify by typing their company details into Section 1 of the form, the same as today. No login or account is required for this version.

> **Promotion rule:** Auth requires a database. If the access model is A2 or A3, the data model is D3, even when all displayed content is fixed. Not applicable here since A1 is confirmed.

---

### Tier

**Tier:** 1

| Tier | D+A combination | Stack | Deployment |
|------|----------------|-------|------------|
| 1 | D1+A1 or D2+A1 | Netlify only | Netlify |
| 2 | D3+A1 | Netlify + Supabase (no auth) | Netlify |
| 3 | D3+A2 or D3+A3 | Netlify + Supabase (auth + RLS) | Netlify |

D2 + A1 keeps this tool at Tier 1 in plain language: no database to build, no login system, still a Netlify-only static deploy. The added complexity is entirely in the client-side interaction, not the architecture.

---

### Standalone or Stack

**This tool is:** Standalone. It does not share a database with any other tool.

> A mixed access pattern (public submission plus an internal review side) was discussed and explicitly deferred for this version. See Section 12.

---

## Section 3 — Arms

### AI API Arm

**Active:** No

Reading the uploaded file back (Door 2) is structural cell-to-field matching only. It does not use AI to interpret free text.

---

### Export Arm

**Active:** Yes

| Detail | Answer |
|--------|--------|
| Format | Both (XLSX and PDF) |
| What is exported | (1) The unchanged blank questionnaire template, The_Corporate_Supplier_Questionnaire_2026.xlsx, now downloaded from within Door 2 rather than directly from the landing page. (2) New: a branded PDF summary of the supplier's submitted answers, generated client-side after either door's submission, so the supplier has a record since nothing else is stored or emailed. |
| PDF design intent | The Corporate brand throughout: Playfair Display for headings, DM Sans for body text, Ink / Stone / Linen / Chalk / White colour tokens, square corners, no shadows. A straightforward listing of the supplier's answers, one section per heading, S1 through S7, in order. Header includes The Corporate logo and the title "Supplier Questionnaire Submission." Footer includes the submission date and which door was used (in-tool form or file upload). No cover page. |

---

### Email Arm

**Active:** No

Confirmed explicitly: no email is sent at any point in this version, on submission or otherwise.

---

### Scheduled Automation Arm

**Active:** No

---

## Section 4 — Stack and Deployment

### All Tiers

| Detail | Answer |
|--------|--------|
| Frontend framework | React + Vite + Tailwind. Upgraded from the v1.0 HTML/CSS/JS build. A 7-section wizard with free back-and-forth navigation, a second data-entry path that feeds the same review and confirmation screens, client-side file parsing, and client-side PDF generation is state-heavy enough to warrant the framework. |
| Deployment target | Netlify |
| Netlify MCP | Not active. Deployment is done manually through the Netlify dashboard after each build. |

**GitHub:** This iteration continues in the existing repository used for the v1.0 build (the one currently deploying supplier_onboarding.html). The updated product-spec.md, CLAUDE.md, and PROGRESS.md replace the v1.0 versions at the repo root before the build session opens. Claude Code assumes the repo exists, commits regularly, and pushes to main. It does not create or configure the repo. See Section 15 for the confirmation this covers.

---

### CONDITIONAL: Supabase project

N/A. Tier 1, no database.

---

### CONDITIONAL: Stack membership

N/A. Standalone tool.

---

## Section 5 — Data Architecture

N/A. Data Model is D2. No database, no tables.

All state, the guided form's answers, the parsed values from an uploaded file, and the data shown on the review and confirmation screens, lives in React component state for the duration of the browser session only. None of it is written to storage of any kind.

---

## Section 6 — Access and Permissions

N/A. Access Model is A1. No authentication, no roles, no RLS.

---

## Section 7 — GDPR

**GDPR outcome:** Not applicable, confirmed during the interview.

**Reasoning:** Section 1 of the questionnaire, in both doors, asks for fields that would count as personal data if they were stored or transmitted (company name, contact name, contact email). None of it is. It is never sent to a server, never written to a database, and never emailed. It exists only in the browser's memory for the length of that one session and is discarded the instant the tab closes or is refreshed. Because no processing or storage of personal data occurs outside the individual supplier's own device, this version does not trigger GDPR obligations.

> This outcome is specific to this version. The moment persistence (D3) or a login (A2/A3) is added, this section must be reopened and the full consent framework evaluated. See Section 12.

---

## Section 8 — Screen and UI Structure

### Landing Page (unchanged)

- **Purpose:** Route Tier 1 suppliers to the correct submission path and communicate The Corporate's sustainability expectations.
- **What is visible:** Nav bar, hero section, "Why We Are Asking," the two-route section (EcoVadis card and Questionnaire card), timeline, key resources, footer. Content and brand treatment unchanged from v1.0.
- **User actions:** Click "Submit EcoVadis Scorecard" (opens ecovadis.com in a new tab, unchanged). Click the questionnaire route's button, relabelled "Complete Questionnaire" (previously "Download Assessment").
- **What happens next:** The EcoVadis button behaves exactly as before. The questionnaire button now opens the Door Choice view instead of immediately downloading a file.

### Door Choice (new)

- **Purpose:** Let the supplier pick how they want to complete the questionnaire.
- **What is visible:** Two option cards side by side. Door one: "Fill in the tool," with a short description of the guided form. Door two: "Download and complete offline," with a short description of downloading, completing with colleagues, and uploading the result. A way back to the landing page.
- **User actions:** Choose Door 1 or Door 2.
- **What happens next:** Door 1 opens the Guided Form at Section 1. Door 2 opens the Download & Upload view.

### Guided Form (Door 1)

- **Purpose:** Let the supplier answer the questionnaire section by section, mirroring the structure of the Excel workbook.
- **What is visible:** A progress indicator (for example "Section 3 of 7"), the current section's title, and its fields. The exact fields per section are not enumerated in this spec; Claude Code derives them directly from the existing Excel asset at build time and confirms the mapping with the builder (see Section 15). Back and Next controls, and a Submit control on the final section. Inline validation messages on required fields.
- **User actions:** Fill in fields for the current section. Move back and forth between any of the 7 sections freely before submitting. Submit once all required fields across every section are valid.
- **What happens next:** Attempting to advance past a section, or to submit, with a required field empty blocks the action immediately with an inline error; nothing further happens until it's resolved. A valid submit moves to the Confirmation Screen.

### Download & Upload (Door 2)

- **Purpose:** Let the supplier download the blank template, complete it offline (individually or with colleagues), and upload the result.
- **What is visible:** A "Download Template" button (the unchanged Excel asset). An upload control accepting .xlsx or the workbook's .csv export. Brief instructions.
- **User actions:** Download the template. Upload a completed file.
- **What happens next:** On upload, the tool attempts to read the file's structure. If it doesn't match the expected template (wrong file, missing sheets, unexpected layout), a clear error message asks the supplier to re-upload the correct file; nothing is guessed or partially mapped. On a successful read, the supplier moves to the Upload Review screen.

### Upload Review (Door 2)

- **Purpose:** Let the supplier confirm the tool read their file correctly before submitting.
- **What is visible:** A read-only summary of the parsed answers, grouped by section, S1 through S7.
- **User actions:** "Submit" to confirm and proceed, or "Re-upload a different file" to return to the upload step. There is no inline editing here; a wrong value is fixed in the source file and re-uploaded.
- **What happens next:** A valid submit moves to the Confirmation Screen.

### Confirmation Screen (shared by both doors)

- **Purpose:** Confirm the submission was received for this session, and give the supplier a way to keep a record of it.
- **What is visible:** A summary of what was submitted (which door was used, sections completed), and a "Download PDF" button.
- **User actions:** Click "Download PDF" to generate and download the branded summary described in Section 3.
- **What happens next:** Nothing further. The supplier may close the tab; nothing is retained by the tool once they do.

---

## Section 9 — Logic and Calculations

**Door 1, sequential form logic:** The 7 sections are held in component state for the session only. Field definitions per section are derived at build time by Claude Code reading the existing Excel asset's structure (sheet names, cell labels, answer types) and are confirmed with the builder before the form is finalised. The supplier can move back and forth between any visited section. Required-field validation blocks advancing to the next section and blocks final submission until every required field across all 7 sections is filled; errors are shown inline at the field level.

**Door 2, upload parsing logic:** On upload, the tool reads the .xlsx file with a client-side spreadsheet-parsing library, or the .csv export with a client-side CSV-parsing library, and maps cells or columns to the same field structure used in Door 1 (the same source of truth: the existing Excel template). If the structure doesn't match what's expected, the read fails outright and the supplier is asked to re-upload the correct file. There is no partial or best-effort mapping. On a successful read, the parsed values populate the read-only Upload Review screen exactly as extracted.

**PDF generation logic:** Triggered by "Download PDF" on the Confirmation Screen. Generates a client-side PDF, using a JS PDF-generation library, listing the supplier's answers section by section (S1 to S7), styled per the-corporate-brand skill, and including which door was used and the date. Nothing leaves the browser to produce this file.

**Edge cases:**
- The supplier closes the tab partway through either door: nothing is saved. They start over on their next visit. This is expected for this version.
- An uploaded file parses successfully but is missing answers to required questions: by default, this spec treats that the same way Door 1 treats a missing required field. The Upload Review screen flags what's missing and blocks Submit until a corrected file is uploaded. This default is called out explicitly in Section 15 since it wasn't stated outright in the interview and should be confirmed before or during the build.

---

## Section 10 — Brand and Visual Direction

**Brand reference:** the-corporate-brand skill file. Already present at the repo root from the v1.0 build; Claude Code confirms it is still installed to .claude/skills/ in First Session Setup.

**Visual feel:** Corporate minimalism, unchanged from v1.0. Restraint over decoration. Precise, direct, composed, authoritative. No gradients, no shadows, no rounded corners.

**Key brand rules Claude Code must enforce, including on the new views and the PDF:**
- Fonts: Playfair Display (headlines), DM Sans 300 (body), DM Sans 500 (labels and emphasis)
- Colours: Ink (#000000), Stone (#B6B09F), Linen (#EAE4D5), Chalk (#F2F2F2), White (#FFFFFF), Acid Lime (#C8F135)
- Acid Lime: used sparingly, always against #000000, never directly on light backgrounds
- Buttons and cards: square corners, no shadows
- No blue links: underline plus Ink colour only
- Copy follows The Corporate voice rules: short declarative sentences, active voice, no exclamation points, no emoji

---

## Section 11 — API and Credentials

This tool requires no external services and no API keys, unchanged from v1.0.

| Service | What it does in this tool | Key required | Where key is stored |
|---------|--------------------------|-------------|-------------------|
| None | — | — | — |

**Client-side libraries (not credentials, no keys involved):** a spreadsheet-parsing library for reading .xlsx uploads, a CSV-parsing library for .csv uploads, and a PDF-generation library for the branded confirmation summary. All bundled at build time and run entirely in the browser. No server, no environment variables, no account setup required.

**Credentials readiness:** Nothing to prepare before the build session.

---

## Section 12 — Out of Scope — Phase 2

| Deferred feature | Reason it is deferred |
|-----------------|----------------------|
| Persisted storage of submissions (a database, Tier 2/3) so The Corporate's team can retrieve what suppliers send | This version validates the submission UX first; adding a database is the next iteration once the flow is proven |
| Supplier login or verification, to confirm only invited/correct suppliers can submit rather than anyone with the link | Requires an access-model change (A2/A3) and a database; deferred until persistence is added |
| Internal review dashboard for procurement/EHS (carried over from v1.0) | Depends on the database above; not needed to validate the supplier-facing flow |
| Submission tracker, percentage of Tier 1 suppliers who have responded (carried over from v1.0) | Depends on the database above |
| Automated EcoVadis scorecard validation (carried over from v1.0) | Requires EcoVadis API access, pending availability |

---

## Section 13 — Acceptance Criteria

| # | What to verify | Expected result | Done? |
|---|---------------|-----------------|-------|
| 1 | Landing page renders unchanged | All v1.0 sections render as before; EcoVadis button opens ecovadis.com in a new tab | [ ] |
| 2 | Questionnaire button opens Door Choice | Clicking "Complete Questionnaire" opens the Door Choice view instead of triggering a download | [ ] |
| 3 | Door Choice presents both doors clearly | Both cards are visible, described, and navigable; a way back to the landing page exists | [ ] |
| 4 | Guided form (Door 1) matches the source Excel structure | All 7 sections render with fields matching the workbook, confirmed with the builder during build | [ ] |
| 5 | Guided form navigation and validation | Supplier can move back and forth between visited sections; required fields block advancing or submitting until filled, shown inline | [ ] |
| 6 | Guided form submit reaches Confirmation | Submitting Section 7 with all required fields valid moves to the Confirmation Screen | [ ] |
| 7 | Download Template (Door 2) unchanged | Clicking downloads the unmodified The_Corporate_Supplier_Questionnaire_2026.xlsx | [ ] |
| 8 | Upload accepts and validates files | .xlsx and .csv are accepted; a structurally mismatched file produces a clear error and no partial data | [ ] |
| 9 | Upload Review is accurate and read-only | Parsed values match the uploaded file exactly; no inline editing is possible; "re-upload" returns to the upload step | [ ] |
| 10 | Missing required fields in an uploaded file are flagged | Submit is blocked on the Upload Review screen until a corrected file is uploaded, per the Section 9 default | [ ] |
| 11 | Confirmation Screen displays correctly for both doors | Shows which door was used and a summary of what was submitted | [ ] |
| 12 | PDF export matches brand and content | "Download PDF" produces a branded, section-by-section (S1 to S7) listing of the submitted answers | [ ] |
| 13 | No data leaves the browser | No network request stores or emails submission data; verifiable in the browser's network tab during QA | [ ] |
| 14 | Nothing persists across sessions | Refreshing or closing the tab at any point clears all entered or uploaded data | [ ] |
| 15 | Tool deploys and is responsive | Live Netlify URL loads correctly on desktop and mobile for every view, including the new ones | [ ] |

---

## Section 14 — Build Path

**This tool's tier:** Tier 1

---

### Pre-build steps — complete these before opening Claude Code

- [ ] Tool Architect skill, interview complete, this spec written and confirmed
- [ ] Project Governor skill, CLAUDE.md and PROGRESS.md produced from this spec
- [ ] Existing GitHub repo from the v1.0 build confirmed and ready (see Section 15)
- [ ] product-spec.md (this file) uploaded to the repo root, replacing the v1.0 version
- [ ] CLAUDE.md uploaded to the repo root, replacing the v1.0 version
- [ ] PROGRESS.md uploaded to the repo root
- [ ] the-corporate-brand skill file confirmed still present at the repo root
- [ ] The_Corporate_Supplier_Questionnaire_2026.xlsx confirmed still present in /assets/, unchanged
- [ ] Netlify connection to the repo confirmed still active (Netlify MCP not active, so deploys stay manual)
- [ ] No credentials to prepare for this tool

---

### Tier 1 — build session

- [ ] Open Claude Code in the project folder (existing GitHub repo connected to Netlify)
- [ ] Claude Code runs First Session Setup: confirms docs/, reference files, and the-corporate-brand skill are correctly installed
- [ ] Claude Code reads product-spec.md, CLAUDE.md, and PROGRESS.md
- [ ] Claude Code reads The_Corporate_Supplier_Questionnaire_2026.xlsx to derive the S1 to S7 field structure, and confirms the mapping with the builder before finalising the guided form
- [ ] Claude Code migrates the frontend from HTML/CSS/JS to React + Vite + Tailwind, preserving the unchanged Landing Page content and all brand rules
- [ ] Claude Code builds the new views: Door Choice, Guided Form (Door 1), Download & Upload plus Review (Door 2), Confirmation Screen
- [ ] Claude Code implements client-side .xlsx/.csv parsing and client-side PDF generation
- [ ] Test locally before deploying
- [ ] Push to main, Netlify deploys automatically

---

## Section 15 — Open Questions

| Question | Who answers it | Blocking? |
|----------|---------------|-----------|
| Confirm the existing GitHub repo from the v1.0 build (supplier_onboarding.html) is the one this iteration continues in | Builder | Yes, needed before the build session starts |
| If an uploaded file parses successfully but required answers are missing, this spec defaults to blocking Submit until a corrected file is uploaded, the same way Door 1 blocks on a missing required field. Confirm or override | Builder | No, Claude Code can build the stated default; override any time |
| Exact button label and copy for the questionnaire route on the landing page (this spec assumes "Complete Questionnaire") | Builder | No, easy to change after build |
| Exact field list per section, S1 to S7, is not enumerated in this spec | Claude Code, derived from the existing Excel asset, confirmed with builder | No, resolves during build |
| Choice of client-side libraries for .xlsx parsing, .csv parsing, and PDF generation | Claude Code | No, standard libraries, no licensing concerns expected |

---

## Section 16 — Tool Version History

| Version | Date | What changed in the tool |
|---------|------|--------------------------|
| v1.0 | 12 June 2026 | Retroactive spec of the existing supplier onboarding landing page (supplier_onboarding.html). Spec created to establish Project Governor and Claude Code session compatibility. |
| v2.0 | 5 July 2026 | Added two in-tool submission doors to the questionnaire route: a guided section-by-section form (Door 1) and a download-complete-upload flow with a read-only review step (Door 2). Added a branded PDF export of submitted answers. Migrated the frontend from HTML/CSS/JS to React + Vite + Tailwind. Data model moved from D1 (hardcoded) to D2 (session only) since the tool now accepts supplier input; access model remains A1. No database, login, or email in this version, explicitly deferred. |

---

*This spec is written for Claude Code. It assumes zero prior context. Every decision, rule, and requirement must be explicit enough that the builder can hand this document to Claude Code without a single verbal explanation.*
