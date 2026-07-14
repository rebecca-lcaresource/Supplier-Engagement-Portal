# Product Spec — The Corporate Supplier Sustainability Portal 2026

**Version:** 3.0
**Date:** 14 July 2026
**Author:** Rebecca LeBlanc
**Status:** Confirmed

---

## Section 1 — Tool Summary

**Tool name:** The Corporate Supplier Sustainability Portal 2026

**What it does:** A public page that routes Tier 1 suppliers to either the EcoVadis scorecard or The Corporate's questionnaire, and — new in v3.0 — **stores what they submit in a database**. Suppliers taking the EcoVadis route register their details before being redirected. Suppliers taking the questionnaire route complete it either through a guided in-tool form or by downloading, completing offline, and uploading the workbook; their answers are written to the database on submit.

**Who uses it:** Tier 1 suppliers of The Corporate — external, unknown to the tool in advance, arriving via a link. Rebecca LeBlanc reads the collected responses in the Supabase dashboard; **no one reads them inside the app**.

**Why it exists:** v2.0 validated the submission flow but deliberately stored nothing — a supplier could complete the full questionnaire and the tool would forget it the moment the tab closed. v3.0 makes the portal real: responses persist, and The Corporate can see who has responded, which route they took, and what they said.

**Build status:** Iteration. v2.0 (live, React + Vite + Tailwind, both doors, PDF export, nothing stored) is working in production. v3.0 adds a Supabase database, an EcoVadis registration screen, and GDPR consent. Everything in v2.0 is retained unless stated otherwise.

> **The central change:** v2.0's defining hard rule was *"no supplier input ever leaves the browser."* **v3.0 deletes that rule.** Supplier input is now transmitted to and stored in Supabase. Any acceptance criterion, code comment, or CLAUDE.md rule asserting that nothing leaves the browser is obsolete and must be removed.

---

## Section 2 — Classification

### Data Model

**Decision:** D3 (promoted from D2)

| Label | What it means | This tool? |
|-------|--------------|-----------|
| D1 — Hardcoded | All data is written into the code by the developer. | No |
| D2 — Session | Data enters the tool during use and disappears when the tab closes. No database. | No — was v2.0 |
| D3 — Persisted | Data is written to a database and survives after the session ends. | Yes |

**Reason:** Supplier submissions must be retrievable by The Corporate after the supplier closes the tab. That is the entire purpose of v3.0.

**D3 triggers met:**
- [x] Data must be retrievable after the session ends
- [x] Multiple sessions contribute to the same dataset (each supplier submits independently; all land in one dataset)
- [ ] An audit trail or history is needed
- [ ] Data submitted by one person must be visible to another *(inside the app — no; reading happens in the Supabase dashboard)*
- [ ] Results must be accessible via a URL after the session ends
- [ ] Files uploaded by users must be stored and retrievable later *(uploads are parsed client-side; the file itself is not stored)*

---

### Access Model

**Decision:** A1 — unchanged

| Label | What it means | This tool? |
|-------|--------------|-----------|
| A1 — Public | Anyone with the URL can use it. No login, no account required. | Yes |
| A2 — Authentication | Users must log in. | No |
| A3 — Authorization | Users must log in and have different roles. | No |

**Reason:** Suppliers arrive via a link and must not have to create accounts. **The portal is write-only** — it can insert supplier and submission records but can never read them back. There is no screen anywhere in the app that displays stored data, so a public URL exposes nothing. Reading is done by Rebecca in the Supabase dashboard, authenticated by Supabase itself, outside the app.

> **This is the security invariant of v3.0.** A1 + D3 is only safe because reads are impossible from the client. See Section 6.

---

### Tier

**Tier:** 2 (promoted from Tier 1)

D3 + A1 → Tier 2. Netlify + Supabase, no auth.

---

### Standalone or Stack

**This tool is:** Standalone. The Supplier Sustainability Scorecard (a separate tool) currently has reviewers key supplier answers in by hand and does not read this database. Connecting the Scorecard to this database — making the two a Stack — is explicitly deferred (Section 12).

---

## Section 3 — Arms

### AI API Arm

**Active:** No

### Export Arm

**Active:** Yes — unchanged from v2.0

| Detail | Answer |
|--------|--------|
| Format | XLSX (template download) and PDF (submission summary) |
| What is exported | (1) The unchanged questionnaire template, downloaded from within Door 2. (2) A branded client-side PDF summary of the supplier's submitted answers (S1–S7, door used, date), offered on the Confirmation screen. |
| PDF design intent | Unchanged from v2.0 — branded header, section-by-section listing of answers, per `the-corporate-brand.skill`. Generated client-side; no server. |

### Email Arm

**Active:** No — no confirmation email is sent to the supplier. The Confirmation screen and the downloadable PDF are the supplier's record.

### Scheduled Automation Arm

**Active:** No

---

## Section 4 — Stack and Deployment

### All Tiers

| Detail | Answer |
|--------|--------|
| Frontend framework | React + Vite + Tailwind — unchanged from v2.0 |
| Deployment target | **Netlify — the sole deploy target.** CI-based: every push to `main` auto-deploys. Build settings live in `netlify.toml` (`npm run build`, publish `dist`, Node 22). **The GitHub Pages backup deploy is retired** (disabled by the builder, 14 July 2026) — a Pages build would lack the Supabase environment variables and would silently fail to record submissions, which is worse than having no backup. Claude Code must remove `.github/workflows/deploy-pages.yml` and any Pages-specific config (including the `VITE_BASE` subpath handling, which existed only for Pages). Vite `base` returns to `/`. |
| Netlify MCP | Not active |

### Supabase project

| Detail | Answer |
|--------|--------|
| Project name | Supplier-Engagement-Portal |
| Project ID / ref | `hqqngissvcbevktcizit` |
| Region | us-east-1 |
| Postgres | 17 |
| Status | ACTIVE_HEALTHY — **verified 14 July 2026** |
| Existing schema | **None — the project is empty (zero tables in `public`).** |

> **New-project path:** because the project contains no tables, Claude Code creates the entire schema itself via the Supabase MCP (tables, RLS policies, indexes) and produces `supabase-setup.md` documenting what it created. The builder does not write SQL and does not need to prepare a schema in advance.

### Stack

N/A — standalone.

---

## Section 5 — Data Architecture

Two tables. Answers are held as a single JSON field rather than 27 columns, because the questionnaire is revised annually and a column-per-question schema would require a migration every year.

### Table: `suppliers`

One row per supplier who engages with the portal. **A row is created only when a supplier submits or registers** — there is no pre-seeded supplier list and no "not started" state.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid, PK | auto-generated |
| `company_name` | text, not null | |
| `country` | text, not null | Registered country |
| `contact_name` | text, not null | |
| `contact_email` | text, not null | **Personal data — see Section 7** |
| `route` | text, not null | `ecovadis` or `questionnaire` |
| `status` | text, not null | `declared` (EcoVadis route — registered and redirected) or `submitted` (questionnaire route — questionnaire completed) |
| `ecovadis_scorecard_url` | text, nullable | Required when `route = ecovadis`; null otherwise |
| `consent_given` | boolean, not null | Must be true — a row cannot exist without consent |
| `consent_at` | timestamptz, not null | When consent was given |
| `consent_version` | text, not null | Which consent text the supplier agreed to (e.g. `2026-v1`) — so a future wording change stays auditable |
| `created_at` | timestamptz, default now() | |

### Table: `submissions`

One row per completed questionnaire. EcoVadis-route suppliers have **no** submission row.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid, PK | auto-generated |
| `supplier_id` | uuid, FK → `suppliers.id`, not null | |
| `submitted_at` | timestamptz, default now() | |
| `door` | text, not null | `guided_form` or `upload` |
| `answers` | jsonb, not null | All 27 answers, keyed by question ID (e.g. `{"S2_Q1": "...", "S2_Q2": "..."}`). Question IDs come from the same field mapping already derived from `The_Corporate_Supplier_Questionnaire_2026.xlsx` and used by both doors — one source of truth, so Door 1 and Door 2 produce identical JSON shapes. |
| `created_at` | timestamptz, default now() | |

**Index:** `submissions.supplier_id`.

**Write pattern:** the questionnaire route creates the `suppliers` row and its `submissions` row together on submit; if either insert fails, neither is kept (no orphan supplier rows). The EcoVadis route creates a `suppliers` row only.

**Duplicates:** a supplier who submits twice creates two rows. This is accepted for v3.0 — deduplication is done by eye in the dashboard on `contact_email`. Enforcing uniqueness is deferred (Section 12); the risk of a hard unique constraint is that a genuine re-submission (a corrected file) would fail silently for the supplier.

---

## Section 6 — Access and Permissions

**Access model: A1 (public), enforced write-only at the database.**

Row Level Security is **enabled on both tables**, and the anon key is granted exactly one capability:

| Table | anon INSERT | anon SELECT | anon UPDATE | anon DELETE |
|-------|-------------|-------------|-------------|-------------|
| `suppliers` | **Allowed** | **Denied** | Denied | Denied |
| `submissions` | **Allowed** | **Denied** | Denied | Denied |

- **INSERT policy:** permitted for the `anon` role on both tables — this is what lets a public supplier submit.
- **No SELECT policy exists for `anon` on either table.** Under RLS, absence of a policy means denial. Even if someone extracts the anon key from the deployed JavaScript (they can — it is public by design), they cannot read a single row.
- **Reading** is done exclusively by Rebecca in the **Supabase dashboard**, authenticated by Supabase. No read path exists in the application.

> **Hard rule for the build:** the app must never call `.select()` on `suppliers` or `submissions`. Adding any read to the client would expose every supplier's commercial data to anyone with the URL. If a future version needs an in-app review screen, it requires authentication (A2) and must go back to the Tool Architect.

---

## Section 7 — GDPR

**GDPR outcome: APPLICABLE.** This reverses v2.0, where it was "Not applicable" solely because nothing was stored.

**Personal data collected:** contact name and contact email (business contact details of a named individual). Company name and country are corporate data, but they are stored alongside and linked to the individual, so the record as a whole is in scope.

| Requirement | How v3.0 meets it |
|-------------|-------------------|
| **Lawful basis** | **Consent** — freely given, explicit, and recorded. |
| **Consent mechanism** | A **required, un-ticked-by-default checkbox** shown at the point of submission: on the final step of the Guided Form (Door 1), on the Upload Review screen before Submit (Door 2), and on the EcoVadis registration screen before redirect. Submit / Continue is **blocked** until it is ticked. Pre-ticked boxes and implied consent are not permitted. |
| **Consent record** | `consent_given`, `consent_at`, and `consent_version` are written to the `suppliers` row. A row cannot exist without consent — this is the audit trail. |
| **Transparency** | The consent text states plainly: what is collected, why (supplier sustainability assessment for The Corporate), where it is stored (Supabase, US region), how long it is kept (24 months), and how to have it deleted. |
| **Retention** | **24 months** from submission. Covers the current assessment cycle and the next, allowing year-on-year comparison, after which the record is deleted. |
| **Retention enforcement** | **Manual for v3.0.** There is no scheduled-automation arm, so nothing auto-deletes. Rebecca deletes expired records in the Supabase dashboard. This is a known limitation, recorded in Section 15 and in the build's Known Issues — an automated retention job is a candidate for v4.0. |
| **Right to erasure / access** | A supplier emails **rebecca@lcaresource.com** to request access to or deletion of their data. This address must appear in the consent text and on the Confirmation screen. Deletion is performed manually in the Supabase dashboard. |
| **Data minimisation** | Only the four identity fields plus the questionnaire answers are collected. No IP address, analytics, cookies, or tracking. |

**Consent text (starting wording — refine at build):**

> By submitting, you consent to The Corporate storing your company details, your name and email address, and your questionnaire answers for the purpose of assessing supplier sustainability performance. Your data is stored securely and kept for 24 months, after which it is deleted. To access or delete your data, email rebecca@lcaresource.com.

---

## Section 8 — Screen and UI Structure

### Landing Page (unchanged from v2.0)

- Nav, hero, "Why We Are Asking," the two-route section, timeline, key resources, footer.
- **Changed behaviour:** the EcoVadis button **no longer opens ecovadis.com directly.** It now opens the new EcoVadis Registration screen. The questionnaire button continues to open Door Choice.

### EcoVadis Registration (NEW in v3.0)

- **Purpose:** Capture who is taking the EcoVadis route before sending them to EcoVadis — without this, EcoVadis suppliers would be invisible to The Corporate.
- **What is visible:** Short form — company name, country, contact name, contact email, EcoVadis scorecard link. The GDPR consent checkbox (unticked). A "Continue to EcoVadis" button. A way back to the landing page.
- **User actions:** Fill in the five fields, tick consent, continue.
- **What happens next:** Required-field validation and the consent tick are both enforced; Continue is blocked until they pass. On success, a `suppliers` row is written with `route = ecovadis`, `status = declared`, and the scorecard URL — then **ecovadis.com opens in a new tab** and the supplier sees a short confirmation in the portal tab. If the insert fails, the supplier sees a clear error and is not redirected (see Section 9).

### Door Choice (unchanged from v2.0)

### Guided Form — Door 1 (changed)

- Unchanged: 7 sections, free back-and-forth navigation, inline required-field validation, field definitions derived from the Excel workbook.
- **New:** the final section carries the **GDPR consent checkbox**, unticked by default. Submit is blocked until every required field across all 7 sections is valid **and** consent is ticked.
- **What happens next:** on submit, the tool writes a `suppliers` row (`route = questionnaire`, `status = submitted`) and a `submissions` row (`door = guided_form`, answers as JSON), then moves to Confirmation. A failed write does not advance (Section 9).

### Download & Upload — Door 2 (unchanged from v2.0)

Template download, .xlsx/.csv upload, client-side parse, hard failure on structural mismatch.

### Upload Review — Door 2 (changed)

- Unchanged: read-only parsed answers grouped S1–S7, no inline editing, missing required answers block Submit until a corrected file is uploaded.
- **New:** the **GDPR consent checkbox** appears here, unticked, and Submit is blocked until it is ticked.
- **What happens next:** on submit, the tool writes a `suppliers` row (`route = questionnaire`, `status = submitted`) and a `submissions` row (`door = upload`, answers as JSON), then moves to Confirmation.

### Confirmation Screen (changed)

- Unchanged: shows which door was used, a summary of what was submitted, and a "Download PDF" button.
- **New:** states plainly that the submission **has been recorded by The Corporate** (v2.0 could not say this — nothing was stored). Shows the retention period and the deletion contact (rebecca@lcaresource.com).
- **The PDF remains the supplier's own record** — no confirmation email is sent.

---

## Section 9 — Logic and Calculations

**Door 1 / Door 2 logic:** unchanged from v2.0 — sequential form with validation; client-side parse with hard failure on structural mismatch; a single shared field mapping derived from the Excel workbook is the source of truth for both doors.

**Answer serialisation (new):** both doors produce the **same JSON shape** for `submissions.answers`, keyed by question ID from the shared field mapping. Door 1 and Door 2 must never produce differently-shaped JSON — this is what makes the stored data comparable and, later, machine-scoreable.

**Database write logic (new):**
- **Questionnaire route:** on a valid, consented submit — insert the `suppliers` row, then the `submissions` row referencing it. If the submission insert fails, the supplier row must not be left orphaned; the write is treated as one unit.
- **EcoVadis route:** on a valid, consented continue — insert the `suppliers` row only, then redirect.
- **Writes only.** The client never issues a read against either table.

**Consent logic (new):** the consent checkbox is unticked by default and cannot be bypassed. It is validated at the same moment as required fields. `consent_given`, `consent_at` (timestamp of the tick), and `consent_version` are written with the supplier row. **No row may be inserted with `consent_given = false`.**

**PDF generation:** unchanged from v2.0 — client-side, branded, section-by-section.

**Edge cases:**
- **The database write fails** (network drop, Supabase unreachable): the supplier must see a **clear error stating their submission was not recorded**, with the option to retry. They must never see a Confirmation screen for a submission that wasn't stored. This is the most important new failure mode — a false confirmation means The Corporate believes it has a response it does not have. On the EcoVadis route, a failed write must **block the redirect**, otherwise the supplier leaves and is never recorded.
- **A supplier submits twice:** two supplier rows are created. Accepted for v3.0 (Section 5).
- **A supplier abandons partway:** nothing is written — rows are created only at submit / continue. Partial completions do not exist in the database.
- **The supplier closes the tab after a successful write:** the record persists. This is the point of v3.0.

---

## Section 10 — Brand and Visual Direction

Unchanged from v2.0. Governed by `the-corporate-brand.skill` (already installed at `.claude/skills/the-corporate-brand/`). The new EcoVadis Registration screen and the consent checkboxes must follow it: Chalk `#F2F2F2` background, Ink `#000000` text and CTAs, Playfair Display headlines, DM Sans body, square corners, no shadows, Acid Lime `#C8F135` only against black and sparingly.

The consent text must read in the brand voice — precise, direct, composed. Plain-language, not legalese.

---

## Section 11 — API and Credentials

| Service | What it does in this tool | Key required | Where key is stored |
|---------|--------------------------|-------------|-------------------|
| Supabase | Stores supplier and submission records | Project URL + **publishable (anon) key** | Netlify environment variables, exposed to the client at build time as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |

**On the anon key being public:** it ships inside the deployed JavaScript and anyone can extract it. This is expected and safe **only because RLS grants it INSERT and nothing else** (Section 6). The security of this tool rests entirely on the RLS policies, not on hiding the key.

**The service-role key must never appear in this project** — not in the code, not in Netlify env vars, not in the repo. It bypasses RLS.

**Credentials readiness:** the builder must add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to **Netlify** (Site configuration → Environment variables). Both values come from the Supabase dashboard (Project Settings → API). A rebuild is required after adding them. **No other deploy target needs configuring** — GitHub Pages is retired.

---

## Section 12 — Out of Scope — Phase 2

| Deferred feature | Reason it is deferred |
|-----------------|----------------------|
| **Connecting the Supplier Sustainability Scorecard to this database** (Scorecard reads submissions instead of reviewers re-keying them) | The obvious next step, and the reason the answer JSON is shaped consistently. It makes the two tools a **Stack** and changes the Scorecard's spec too. Deliberately deferred until v3.0 is proven in production. |
| In-app review screen for The Corporate | Would require authentication (A2) and a read path — a fundamentally different security model. Reading happens in the Supabase dashboard for now. |
| Automated retention deletion at 24 months | Needs a scheduled-automation arm. Manual deletion in the dashboard for v3.0. |
| Deduplication / unique constraint on supplier email | Risks silently blocking a legitimate re-submission. Handled by eye in the dashboard for now. |
| Confirmation email to the supplier | Would require an email arm. The downloadable PDF is the supplier's record. |
| Storing the uploaded file itself | Only the parsed answers are stored; the file is not retained. |
| Supplier login / verification | Any A2/A3 change is out of scope. |

---

## Section 13 — Acceptance Criteria

> Criteria 13 and 14 of the v2.0 spec ("no data leaves the browser," "nothing persists across sessions") are **deleted** — v3.0 inverts both.

| # | What to verify | Expected result | Done? |
|---|---------------|-----------------|-------|
| 1 | Landing page renders unchanged | All sections render as before | [ ] |
| 2 | EcoVadis button opens the new Registration screen | It no longer goes straight to ecovadis.com | [ ] |
| 3 | EcoVadis Registration validates and writes | Required fields + consent enforced; on success a `suppliers` row exists with `route = ecovadis`, `status = declared`, scorecard URL, and consent fields; ecovadis.com then opens in a new tab | [ ] |
| 4 | EcoVadis write failure blocks the redirect | If the insert fails, a clear error shows and the supplier is **not** redirected | [ ] |
| 5 | Door Choice, Guided Form navigation and validation | Unchanged from v2.0 — 7 sections, free navigation, inline required-field errors | [ ] |
| 6 | Consent checkbox present, unticked, and blocking | Appears on the Guided Form's final step, the Upload Review screen, and EcoVadis Registration; unticked by default; Submit/Continue blocked until ticked | [ ] |
| 7 | Guided Form submit writes both rows | A `suppliers` row (`route = questionnaire`, `status = submitted`) and a `submissions` row (`door = guided_form`) with all 27 answers in `answers` | [ ] |
| 8 | Download Template unchanged | Downloads the unmodified `The_Corporate_Supplier_Questionnaire_2026.xlsx` | [ ] |
| 9 | Upload accepts, validates, and reviews | .xlsx/.csv accepted; structural mismatch hard-fails; Upload Review read-only and accurate; missing required answers block Submit | [ ] |
| 10 | Upload submit writes both rows | Same as #7 but `door = upload` | [ ] |
| 11 | **Both doors produce identical answer JSON** | Submitting the same answers through Door 1 and Door 2 yields the same `answers` JSON shape and keys | [ ] |
| 12 | Consent fields are stored | `consent_given = true`, `consent_at`, and `consent_version` populated on every supplier row; **no row exists with `consent_given = false`** | [ ] |
| 13 | **RLS blocks all reads** | Using the anon key, a `select` against `suppliers` and `submissions` returns **zero rows / permission denied**. Verify directly — this is the security invariant of the whole tool | [ ] |
| 14 | **The client never reads** | Grep `src/` — no `.select()` call against `suppliers` or `submissions` anywhere in the app | [ ] |
| 15 | Failed write never shows a false Confirmation | Simulate a failed insert: the supplier sees a clear "not recorded" error and a retry, never the Confirmation screen | [ ] |
| 16 | Confirmation Screen updated | States the submission was recorded, shows the 24-month retention period and rebecca@lcaresource.com | [ ] |
| 17 | PDF export still works for both doors | Branded, section-by-section S1–S7 listing of submitted answers | [ ] |
| 18 | Records are visible in the dashboard | After a test submission on each route, the rows are present and correct in the Supabase dashboard | [ ] |
| 19 | Deploys and is responsive | Netlify live URL works on desktop and mobile across every screen including the new one. The GitHub Pages workflow is removed from the repo and the Pages URL no longer serves the app | [ ] |
| 20 | Service-role key absent | The service-role key appears nowhere in the repo, the code, or the env vars | [ ] |

---

## Section 14 — Build Path

**This tool's tier:** Tier 2

### Pre-build steps

- [x] Tool Architect — interview complete, this spec written and confirmed
- [ ] Project Governor — CLAUDE.md updated to v3.0 (the v2.0 "no data leaves the browser" hard rule must be **removed**) and PROGRESS.md re-seeded
- [x] Supabase project created and verified — `hqqngissvcbevktcizit`, ACTIVE_HEALTHY, empty
- [ ] `product-spec.md` v3.0, updated `CLAUDE.md`, and updated `PROGRESS.md` pushed to the repo
- [ ] `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` added to Netlify environment variables
- [ ] No `supabase-setup.md` needed — the project is empty; Claude Code creates the schema via MCP and produces that file itself

### Tier 2 — build sessions

- [ ] Claude Code reads `product-spec.md`, `CLAUDE.md`, `PROGRESS.md`
- [ ] Claude Code creates both tables, the RLS policies, and the index via the Supabase MCP; writes `supabase-setup.md`
- [ ] **Verify RLS before writing any UI** — confirm the anon key can insert and cannot select
- [ ] Build the EcoVadis Registration screen
- [ ] Add the consent checkbox to all three submission points
- [ ] Wire the database writes for both doors and the EcoVadis route, including failure handling
- [ ] Update the Confirmation screen
- [ ] Test both routes end to end; verify rows land correctly in the dashboard
- [ ] Acceptance-criteria pass (20 criteria)
- [ ] Push to `main` → Netlify auto-deploys

---

## Section 15 — Open Questions

| Question | Who answers it | Blocking? |
|----------|---------------|-----------|
| Final wording of the consent text (starting wording in Section 7). | Builder | No — default provided |
| Retention deletion is **manual** for v3.0 — nothing auto-deletes at 24 months. Rebecca must diarise this. Automate in v4.0? | Builder | No — but it is a live GDPR obligation, not a nicety |
| The EcoVadis link is still the generic homepage (`https://www.ecovadis.com/`) rather than a targeted redirect. Carried over from v2.0, still settled as acceptable. | Builder | No |
| ~~GitHub Pages backup deploy~~ — **RESOLVED 14 July 2026.** The builder disabled GitHub Pages. Netlify is now the only deploy target; Claude Code removes the Pages workflow and the `VITE_BASE` subpath handling. | Builder | Resolved |

---

## Section 16 — Tool Version History

| Version | Date | What changed in the tool |
|---------|------|--------------------------|
| v1.0 | — | Static single-page site: EcoVadis external link + Excel download, returned by email outside the tool. |
| v2.0 | 8 July 2026 | React + Vite + Tailwind rebuild. Two in-tool submission doors (guided form, download-and-upload), Door Choice screen, branded PDF export. Nothing stored — session-only, explicitly an experiment to validate the submission flow. |
| v3.0 | 14 July 2026 | **Database added (Supabase, Tier 2).** Supplier and submission records persisted. New EcoVadis Registration screen so the EcoVadis route is captured. GDPR consent required at all three submission points, with consent recorded. Portal is **write-only** — RLS grants insert and denies all reads; responses are read in the Supabase dashboard. v2.0's "no data leaves the browser" invariant is retired. |

---

*This spec is written for Claude Code. It assumes zero prior context. Every decision, rule, and requirement must be explicit enough that the builder can hand this document to Claude Code without a single verbal explanation.*
