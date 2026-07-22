# Product Spec — The Corporate Supplier Sustainability Portal 2026

**Version:** 4.0
**Date:** 22 July 2026
**Author:** Rebecca LeBlanc
**Status:** Confirmed

---

## Section 1 — Tool Summary

**Tool name:** The Corporate Supplier Sustainability Portal 2026

**What it does:** A public page that routes Tier 1 suppliers to either the EcoVadis scorecard or The Corporate's questionnaire, and stores what they submit in a Supabase database. **New in v4.0:** before a supplier can choose a route or enter any data, they must verify a real, reachable email address by clicking a magic link. Once verified, they proceed exactly as in v3.0 — EcoVadis registration, or the questionnaire via a guided in-tool form or a download-complete-upload workbook.

**Who uses it:** Tier 1 suppliers of The Corporate — external, unknown to the tool in advance, arriving via a link. Rebecca LeBlanc reads the collected responses in the Supabase dashboard; **no one reads them inside the app.**

**Why it exists:** v3.0 made the portal persist submissions, but anyone could submit under any email — real or fake — because nothing proved the submitter owned the address they typed. v4.0 adds a lightweight **email-verification gate**: whoever submits has proven they own a genuine, reachable mailbox. This is **validation, not gatekeeping** — anyone can still come and submit; they simply prove the email is theirs first.

**Build status:** Iteration. v3.0 (live, React + Vite + Tailwind, both doors, EcoVadis registration, Supabase-backed, write-only, GDPR consent) is working in production. v4.0 adds **magic-link email verification as a mandatory first step**, promotes the tool from Tier 2 to Tier 3 (authentication), and stores the verified email. **Everything in v3.0 is retained unless stated otherwise** — the doors, the EcoVadis registration screen, the consent flow, the PDF export, and the write-only security model all stay exactly as they are.

> **The central change:** v3.0 let anyone with the link submit immediately. v4.0 places a verification gate at the very front of the flow — **email first, everything else after.** The route choice (EcoVadis vs. questionnaire) now happens *after* verification, not on the landing page.

---

## Section 2 — Classification

### Data Model

**Decision:** D3 — unchanged from v3.0

| Label | What it means | This tool? |
|-------|--------------|-----------|
| D1 — Hardcoded | All data is written into the code by the developer. | No |
| D2 — Session | Data enters the tool during use and disappears when the tab closes. No database. | No |
| D3 — Persisted | Data is written to a database and survives after the session ends. Supabase is required. | Yes |

**Reason:** Supplier submissions must be retrievable by The Corporate after the supplier closes the tab — unchanged from v3.0. Authentication (below) also independently requires a database (the promotion rule).

**D3 triggers met:**
- [x] Data must be retrievable after the session ends
- [x] Multiple sessions contribute to the same dataset
- [ ] An audit trail or history is needed
- [ ] Data submitted by one person must be visible to another *(inside the app — no; reading happens in the Supabase dashboard)*
- [ ] Results must be accessible via a URL after the session ends
- [ ] Files uploaded by users must be stored and retrievable later *(uploads are parsed client-side; the file itself is not stored)*

---

### Access Model

**Decision:** A2 — Authentication (promoted from A1)

| Label | What it means | This tool? |
|-------|--------------|-----------|
| A1 — Public | Anyone with the URL can use it. No login, no account required. | No — was v3.0 |
| A2 — Authentication | Users must prove their identity to proceed. All verified users have the same permissions — there are no roles. | Yes |
| A3 — Authorization | Users log in AND have different roles with different permissions. | No |

**Reason:** Suppliers must verify a reachable email address before they can choose a route or enter any data. This is authentication — proving control of an email — with **no roles and no authorization**: every verified supplier can do exactly the same thing. There is no admin login, no account page, and no returning-user login experience.

> **Promotion rule applied:** Authentication requires user accounts, and user accounts live in a database. A2 therefore forces D3 (already true here). This promotes the tool from **Tier 2 to Tier 3**.

> **The write-only invariant is preserved.** In v3.0 the `anon` role could insert and never read. In v4.0, suppliers submit as the **`authenticated`** role, which likewise gets **INSERT only and no read**. Verifying an email opens a session; it does **not** grant the ability to read any stored data. Reading remains impossible from the client and is done only by Rebecca in the Supabase dashboard. See Section 6.

---

### If Access Model is A2 — both questions

**Auth reason:** Identity and continuity — a verified email matters. The purpose is to confirm the submitter owns a real, reachable mailbox so a submission is tied to a genuine inbox, not a random or fake address. It is **not** controlled access (anyone may still submit) and **not** an ongoing relationship (suppliers do not return to manage an account).

**Signup model:** **Open** — anyone can request a magic link. There is no invite list. The gate proves email ownership; it does not restrict who may submit.

---

### Tier

**Tier:** 3 (promoted from Tier 2)

D3 + A2 → Tier 3. Netlify + Supabase with authentication and RLS.

> This is a **contained Tier 3**: no roles (not A3), no account pages, no returning-user login, and the existing write-only data model is unchanged. The only Tier-3 machinery added is Supabase Auth (magic link) and an RLS update so the `authenticated` role — not `anon` — is the one allowed to insert.

---

### Standalone or Stack

**This tool is:** Standalone. It does not share its database with any other tool. Connecting the Supplier Sustainability Scorecard to this database (making the two a Stack) remains explicitly deferred (Section 12).

---

## Section 3 — Arms

### AI API Arm

**Active:** No

### Export Arm

**Active:** Yes — unchanged from v3.0

| Detail | Answer |
|--------|--------|
| Format | XLSX (template download) and PDF (submission summary) |
| What is exported | (1) The unchanged questionnaire template, downloaded from within Door 2. (2) A branded client-side PDF summary of the supplier's submitted answers (S1–S7, door used, date), offered on the Confirmation screen. |
| PDF design intent | Unchanged from v3.0 — branded header, section-by-section listing of answers, per `the-corporate-brand` skill. Generated client-side; no server. |

### Email Arm

**Active:** No — **and this is deliberate.**

> The magic-link verification email is **not** an app-built email arm. It is sent by **Supabase Auth**, not by the application's own code, when the app calls the Supabase sign-in method. Supabase Auth is configured to deliver these emails through **Resend as its custom SMTP provider** (set once in the Supabase dashboard). This means:
> - **No Netlify Function and no Supabase Edge Function** is built for email.
> - **No Resend API key appears anywhere in the code, environment variables, or the GitHub repo.** The Resend credential lives only in the Supabase Auth SMTP settings in the Supabase dashboard.
> - Claude Code must **not** build any transactional-email function. Its only involvement with email is calling the Supabase magic-link sign-in method; delivery is Supabase Auth's job.
>
> No confirmation email is sent to the supplier after submission — unchanged from v3.0. The Confirmation screen and the downloadable PDF remain the supplier's record.

### Scheduled Automation Arm

**Active:** No

---

## Section 4 — Stack and Deployment

### All Tiers

| Detail | Answer |
|--------|--------|
| Frontend framework | React + Vite + Tailwind — unchanged |
| Deployment target | **Netlify — the sole deploy target.** Every push to `main` auto-deploys. Build settings live in `netlify.toml` (`npm run build`, publish `dist`, Node 22). GitHub Pages is retired — unchanged from v3.0. |
| Netlify MCP | Not active — deployment is via the existing GitHub → Netlify auto-deploy; environment variables are managed by the builder in the Netlify dashboard. |

**GitHub:** The repo already exists and is connected to Netlify. The builder uploads the updated `product-spec.md` (this file), the updated `CLAUDE.md`, and the updated `PROGRESS.md` to the repo root before the build session. Claude Code commits and pushes to `main`.

---

### Supabase project — EXISTING

**Supabase project status:** Existing — this project was created in the v3.0 build and already contains tables, RLS policies, and the `submit_questionnaire` RPC.

**Supabase plan:** **Free (current).** ⚠️ **Recommendation: upgrade to Pro before real supplier traffic.** A Free-tier project pauses after ~1 week idle. In v3.0 a paused project meant submissions failed; **in v4.0 a paused project also breaks login** — suppliers cannot get or use a magic link at all, so the whole portal is unusable until it is manually unpaused. For an auth-gated, supplier-facing tool this is a materially bigger risk than before. Recorded as an Open Question (Section 15).

| Detail | Answer |
|--------|--------|
| Project name | Supplier-Engagement-Portal |
| Project ID / ref | `hqqngissvcbevktcizit` |
| Region | us-east-1 (US) |
| Postgres | 17 |
| `supabase-setup.md` location | `docs/supabase-setup.md` in the project folder — created in the v3.0 build; it is the schema source of truth. |

> **Existing-project path:** Claude Code **reads `docs/supabase-setup.md` before making any schema change** and reviews the current schema. It does **not** recreate the `suppliers` / `submissions` tables or the RPC. For v4.0 it makes only the additive changes in Sections 5 and 6 (two new columns, enable Supabase Auth, and move the write privileges from `anon` to `authenticated`), then **updates `docs/supabase-setup.md`** in the same save point.

### Stack

N/A — standalone.

---

## Section 5 — Data Architecture

Two tables, unchanged in structure from v3.0 except for **two new columns on `suppliers`** to record the verified email. **No new application table is needed for authentication** — Supabase Auth manages its own `auth.users` table automatically when magic-link auth is enabled.

### Table: `suppliers` (two new columns)

One row per supplier who registers (EcoVadis route) or submits (questionnaire route). A row is created only on submit/register.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid, PK | unchanged |
| `company_name` | text, not null | unchanged |
| `country` | text, not null | unchanged |
| `contact_name` | text, not null | unchanged |
| `contact_email` | text, not null | unchanged — **self-reported** contact email typed into the form. Personal data — Section 7. |
| **`verified_email`** | **text, not null** | **NEW — the email the supplier proved they own via the magic link, taken from the authenticated session. Captured automatically on both routes.** Personal data — Section 7. |
| **`verified_at`** | **timestamptz, not null** | **NEW — timestamp when the email was verified (the session's verification time). Captured automatically.** |
| `route` | text, not null | unchanged — `ecovadis` or `questionnaire` |
| `status` | text, not null | unchanged — `declared` or `submitted` |
| `ecovadis_scorecard_url` | text, nullable | unchanged — required when `route = ecovadis` |
| `consent_given` | boolean, not null | unchanged — must be true |
| `consent_at` | timestamptz, not null | unchanged |
| `consent_version` | text, not null | unchanged |
| `created_at` | timestamptz, default now() | unchanged |

> **`verified_email` vs `contact_email`:** these are stored **separately and are not required to match.** The verified email proves a real mailbox was used to enter the tool; the contact email is whatever the supplier types into the form. The app does **not** enforce that they are equal (see Out of Scope, Section 12). Storing both lets Rebecca see, in the dashboard, the proven mailbox alongside the self-reported contact.

### Table: `submissions` (unchanged)

One row per completed questionnaire. EcoVadis-route suppliers have no submission row. Columns unchanged from v3.0: `id`, `supplier_id` (FK → `suppliers.id`), `submitted_at`, `door` (`guided_form` | `upload`), `answers` (jsonb — all answers keyed by question ID, identical shape from both doors), `created_at`.

**Index:** `submissions.supplier_id` — unchanged.

**Write pattern:** unchanged from v3.0 — the questionnaire route writes `suppliers` + `submissions` atomically via the `submit_questionnaire` RPC; the EcoVadis route writes `suppliers` only. **New for v4.0:** both writes now carry `verified_email` and `verified_at`, and both execute in an **authenticated** session (see Section 6). The RPC signature gains the two verified-identity parameters.

**File storage:** No — uploads are parsed client-side; the file itself is not stored. Unchanged.

**Derived or calculated data:** No.

---

## Section 6 — Access and Permissions

### Auth configuration

| Detail | Answer |
|--------|--------|
| Authentication method | **Magic link.** The supplier enters their email, Supabase Auth emails a one-time link, and clicking it returns them to the portal in a verified session. Chosen because this is **one-time email validation, not a returning-user login** — a password would be friction with no purpose, since suppliers do not come back to manage an account. |
| Signup model | **Open** — anyone can request a magic link. No invite list. |
| Email delivery | Supabase Auth sends the magic-link email via **Resend configured as custom SMTP** in the Supabase dashboard (Section 3, Section 11). No email function is built; no Resend key is in the project. |
| Session use | The verified session exists only to (a) gate progress past the verification screen and (b) supply `verified_email` / `verified_at` for the supplier row. It is **not** used to link submissions to a `user_id`, and there is no "log back in later" behaviour. |

> **Privacy note (standing A2 note):** User accounts store email addresses in Supabase Auth (`auth.users`). Because this is an **open-signup public tool that also collects personal data through its forms**, GDPR applies in full (Section 7) — the verified email in `auth.users` and the `verified_email`/`contact_email` columns are all covered by the consent statement, retention period, and deletion mechanism.

### RLS rules — who can read and write what

RLS remains **enabled on both tables**. The change from v3.0: **the role allowed to insert moves from `anon` to `authenticated`**, because every submission now happens inside a verified session. The write-only invariant is unchanged — the inserting role can insert and nothing else.

| Table | User type | Can read | Can insert | Can update | Can delete |
|-------|----------|----------|------------|------------|------------|
| `suppliers` | Unauthenticated (`anon`) | No | **No** *(removed — was Allowed in v3.0)* | No | No |
| `suppliers` | Authenticated user (`authenticated`) | **No** | **Yes** | No | No |
| `submissions` | Unauthenticated (`anon`) | No | **No** *(removed)* | No | No |
| `submissions` | Authenticated user (`authenticated`) | **No** | **Yes** | No | No |

Enforcement, carried forward from v3.0's two-layer model:

1. **RLS policies** — the INSERT policies that referenced `anon` are replaced by INSERT policies for `authenticated` (`with check (true)`). No SELECT / UPDATE / DELETE policy exists for any role. Under RLS, absence of a policy is denial.
2. **GRANT layer** — INSERT is granted to `authenticated` and revoked from `anon` on both tables; SELECT / UPDATE / DELETE / TRUNCATE remain revoked from every client role. Even if a policy were ever added by mistake, the privilege is gone.

**`submit_questionnaire` RPC:** unchanged in behaviour (SECURITY DEFINER, atomic two-insert, returns void) except that **EXECUTE moves from `anon` to `authenticated`** (revoked from `anon`), and its signature gains `p_verified_email text` and `p_verified_at timestamptz` so the verified identity is written with the rows.

> **Hard rule for the build (unchanged):** the app must never call `.select()` on `suppliers` or `submissions`. A verified session does **not** unlock reads. If a future version needs an in-app review screen, it requires authorization (A3) and must return to the Tool Architect.

> **Verify before building any UI:** acting as the `authenticated` role, INSERT on both tables succeeds and SELECT / UPDATE / DELETE are denied; acting as `anon`, INSERT is now denied. The `consent_given = false` CHECK still blocks consent-less rows.

---

## Section 7 — GDPR

**GDPR outcome: APPLICABLE** — unchanged from v3.0, with the verified email added to what is stored.

**Personal data collected:** contact name, **self-reported contact email**, and — **new in v4.0 — the verified email**, which is stored both in Supabase Auth (`auth.users`) and in the `suppliers.verified_email` column. Company name and country are corporate data stored alongside and linked to the individual, so the record as a whole is in scope.

| Requirement | How v4.0 meets it |
|-------------|-------------------|
| **Lawful basis** | Consent — freely given, explicit, recorded. Unchanged. |
| **Consent mechanism** | Required, un-ticked-by-default checkbox at the point of submission — Guided Form final step (Door 1), Upload Review before Submit (Door 2), and the EcoVadis registration screen before redirect. Submit / Continue blocked until ticked. **Unchanged from v3.0** — the verification step at the front of the flow does **not** replace or move the consent checkbox. |
| **Consent record** | `consent_given`, `consent_at`, `consent_version` written to the `suppliers` row. A row cannot exist without consent. Unchanged. |
| **Transparency** | The consent text states what is collected (now including the verified email), why, where it is stored (Supabase, US region), how long (24 months), and how to have it deleted. |
| **Retention** | 24 months from submission. Unchanged. |
| **Retention enforcement** | Manual — Rebecca deletes expired records in the Supabase dashboard. **New for v4.0:** deletion of a supplier's data must **also remove that supplier's user record from Supabase Auth** (`auth.users`), not only the `suppliers` / `submissions` rows. Recorded in Known Issues and Section 15. |
| **Right to erasure / access** | A supplier emails **rebecca@lcaresource.com**. Deletion is performed manually in the dashboard and now includes the Auth user. This address appears in the consent text and on the Confirmation screen. |
| **Data minimisation** | Only the identity fields, the verified email, and the questionnaire answers are collected. No IP address, analytics, cookies, or tracking. |

**Consent text (starting wording — refine at build):**

> By submitting, you consent to The Corporate storing your company details, your name, the email address you verified, the contact email you provide, and your questionnaire answers, for the purpose of assessing supplier sustainability performance. Your data is stored securely and kept for 24 months, after which it is deleted. To access or delete your data, email rebecca@lcaresource.com.

---

## Section 8 — Screen and UI Structure

> **The v4.0 flow:** Landing → **Start submission → Email Entry → (magic link in inbox) → verified return → Route Choice** → then either EcoVadis Registration, or Door Choice → Guided Form / Upload → Confirmation. Verification is a **hard gate**: the Route Choice and every data-entry screen are unreachable until the supplier returns in a verified session.

### Landing Page (changed)

- **Purpose:** Show suppliers what they are being asked to do and why, before they commit.
- **What is visible:** Same content as v3.0 — nav, hero, "Why We Are Asking," the two-route explanation, timeline, key resources, footer.
- **User actions:** The two route buttons (EcoVadis / Complete Questionnaire) are **replaced by a single "Start submission" call-to-action.** The routes are still described on the page as context; the *choice* between them now happens after verification.
- **What happens next:** "Start submission" opens the Email Entry screen. It does **not** go to EcoVadis, and it does **not** open Door Choice.

### Email Entry (NEW)

- **Purpose:** Collect and verify the supplier's email before anything else.
- **What is visible:** A short explanation ("Enter your email to begin — we'll send you a one-time link to confirm it's you"), a single email field, and a "Send link" button. Brand-styled per `the-corporate-brand`.
- **User actions:** Enter an email address; submit. The app calls Supabase Auth's magic-link sign-in for that email.
- **What happens next:** The app moves to the Check-Your-Inbox holding screen. Supabase Auth (via Resend SMTP) sends the magic link.

### Check-Your-Inbox (NEW)

- **Purpose:** Tell the supplier the link is on its way and what to do.
- **What is visible:** A calm holding message — "Check your inbox and click the link to continue. You can close this tab; the link opens the portal for you." The email address it was sent to is shown for reassurance.
- **User actions:** None in this tab — the supplier goes to their email and clicks the link.
- **What happens next:** Clicking the magic link opens the portal in a **verified session** and lands on Route Choice. *(No resend button, no cooldown timer — see Out of Scope.)*

### Route Choice (NEW position — reached only after verification)

- **Purpose:** Let a verified supplier choose their route. This is the choice that used to be two buttons on the landing page.
- **What is visible:** Two clear options — "Complete via EcoVadis" and "Complete The Corporate's questionnaire" — with the same short framing each route had before. No visible "verified" badge (see Out of Scope).
- **User actions:** Pick one route.
- **What happens next:** EcoVadis → the EcoVadis Registration screen. Questionnaire → the existing Door Choice screen.

### EcoVadis Registration (unchanged internally, new position)

- Reached only after verification. Its fields, validation, consent checkbox, write logic (`route = ecovadis`, `status = declared`), and redirect-on-success behaviour are **unchanged from v3.0** — with the single addition that the row now also stores `verified_email` and `verified_at` from the session. A failed write still blocks the redirect.

### Door Choice → Guided Form (Door 1) / Download & Upload (Door 2) (unchanged internally, new position)

- Reached only after verification. The 7-section guided form, free navigation, inline validation, template download, client-side parse with hard failure on structural mismatch, and the Upload Review screen are **unchanged from v3.0**. The consent checkbox stays exactly where it is (Guided Form final step; Upload Review before Submit). On submit, the row now also carries `verified_email` and `verified_at`.

### Confirmation Screen (unchanged from v3.0)

- States the submission was recorded, shows which door was used, a summary, the 24-month retention period, and rebecca@lcaresource.com, and offers Download PDF. No confirmation email is sent.

---

## Section 9 — Logic and Calculations

**Verification gate logic (NEW — the core of v4.0):**
- A supplier cannot reach Route Choice, EcoVadis Registration, Door Choice, or any data-entry screen **without an active verified session.**
- On "Send link," the app calls Supabase Auth's magic-link sign-in (`signInWithOtp`) for the entered email, with the redirect target set to the deployed portal URL (Supabase Auth Site URL / redirect allow-list, Section 11).
- Clicking the link establishes the session and returns the supplier to the portal at Route Choice.
- From the session, the app reads the **verified email** and the **verification timestamp** and holds them for the eventual write. They are written to `verified_email` / `verified_at` on the `suppliers` row at submit (questionnaire route) or register (EcoVadis route) — never as a separate standalone insert.
- If a supplier arrives at a data-entry URL without a verified session (e.g. a bookmarked deep link), they are sent back to Email Entry.

**Database write logic (unchanged from v3.0, plus verified identity):**
- **Questionnaire route:** on a valid, consented submit — the `submit_questionnaire` RPC inserts `suppliers` + `submissions` atomically, now including `verified_email` and `verified_at`. Executed as the `authenticated` role.
- **EcoVadis route:** on a valid, consented continue — a single `suppliers` insert including `verified_email` / `verified_at`, then redirect. Executed as the `authenticated` role.
- **Writes only.** The client never issues a read against either table, verified session or not.

**Consent logic (unchanged from v3.0):** the consent checkbox is unticked by default, validated with required fields at each submission point; `consent_given` / `consent_at` / `consent_version` written with the row; no row may be inserted with `consent_given = false`.

**PDF generation:** unchanged — client-side, branded, section-by-section.

**Edge cases:**
- **Magic-link email never arrives / lands in spam:** the supplier can re-enter their email and request a new link (by returning to Email Entry and submitting again). There is **no dedicated resend button, cooldown, or rate-limit UI** in v4.0 (Out of Scope) — requesting again from the Email Entry screen is the supported path.
- **Link expired or already used:** clicking a stale link does not open a verified session; the supplier is returned to Email Entry to request a fresh one.
- **Link opened in a different browser/device than where "Send link" was pressed:** the click still establishes the session in the browser that opened the link; the supplier proceeds there. (This is standard magic-link behaviour and acceptable.)
- **Verified email ≠ typed contact email:** allowed by design — both are stored, neither is enforced against the other.
- **Database write fails after a valid verified submit:** unchanged from v3.0 — the supplier sees a clear "not recorded" error with retry, never a false Confirmation; on the EcoVadis route a failed write blocks the redirect.
- **Supabase project paused (Free tier):** login itself fails — the magic link cannot be sent or completed. This is the escalated version of the v3.0 idle-pause issue and the reason Pro is recommended (Section 4, Section 15).

---

## Section 10 — Brand and Visual Direction

**Brand reference:** `the-corporate-brand` skill — already installed at `.claude/skills/the-corporate-brand/`.

Unchanged from v3.0. The new screens (Email Entry, Check-Your-Inbox, Route Choice) must follow it: Chalk `#F2F2F2` background, Ink `#000000` text and CTAs, Playfair Display headlines, DM Sans body, square corners, no shadows, Acid Lime `#C8F135` only against black and sparingly. Copy reads in the brand voice — precise, direct, plain-language, not legalese.

**Magic-link email styling:** the **plain default Supabase Auth email template** is used, delivered through Resend. The email is **not** brand-styled in v4.0 (a brand-styled auth email would require a Supabase Send-Email Auth Hook / Edge Function and is explicitly Out of Scope — Section 12).

**Visual feel:** Professional and corporate — unchanged.

---

## Section 11 — API and Credentials

| Service | What it does in this tool | Key required | Where key is stored |
|---------|--------------------------|-------------|-------------------|
| Supabase (Database) | Stores supplier and submission records | Project URL + publishable (anon) key | Netlify environment variables — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (unchanged from v3.0) |
| Supabase (Auth) | Magic-link email verification; manages `auth.users` | Uses the same anon key from the browser to request the link | No new app key — same anon key as above |
| Resend (as Supabase Auth SMTP) | Delivers the magic-link email on Supabase Auth's behalf | Resend SMTP credential (an API key used as the SMTP password) | **Supabase dashboard → Authentication → SMTP Settings only.** Never in code, never in Netlify env vars, never in the repo. |

> **Security rule:** No API key, token, or credential appears in any HTML/JS file or any file committed to GitHub. The anon key is public by design and safe only because RLS grants the client role INSERT and nothing else (Section 6). **The Resend credential is not an application key** — it is configured once inside the Supabase Auth SMTP settings and never enters the project. **The Supabase service-role key is never used, added, or committed.**

**Credentials readiness:**

| Credential | Status | Where to get it / do it |
|-----------|--------|----------------|
| Supabase URL + anon key | Available | Already set in Netlify (v3.0) |
| Supabase service role key | Not used — never added | — |
| Resend account | **Needs creating** | resend.com — free tier (3,000 emails/month) is ample for verification volume |
| Resend verified sending domain | **Needs creating — deferrable to pre-go-live** | Resend → Add Domain (`lcaresource.com`) → add the SPF/DKIM DNS records at the domain's DNS provider → Verify. **Not required to build or test** — Resend can send magic links to the builder's own inbox in test mode, so the whole tool can be built and verified end-to-end before the domain is set up. Do this step only before pointing the portal at real suppliers. |
| Supabase custom SMTP (Resend) | **Needs configuring — dashboard only** | Supabase → Authentication → SMTP Settings → Enable Custom SMTP → host `smtp.resend.com`, port `465`, user `resend`, password = Resend API key, sender e.g. `auth@lcaresource.com`. (Or use Supabase's one-click Resend integration.) |
| Supabase Auth URL configuration | **Needs configuring — dashboard only** | Supabase → Authentication → URL Configuration → set Site URL to the Netlify site URL and add it (with `/*`) to Redirect URLs, so the magic link returns suppliers to the portal. |

> All items marked "Needs creating / configuring" are **builder tasks done in dashboards**, not build tasks — Claude Code cannot reach Resend, DNS, or the Supabase Auth dashboard settings. The domain-verification item is intentionally **deferrable to just before go-live**; everything else can be done at any point and the tool can be built and tested with a test-mode magic link to the builder's own inbox first.

---

## Section 12 — Out of Scope — Phase 2

| Deferred feature | Reason it is deferred |
|-----------------|----------------------|
| Resend-link button, cooldown timers, or rate-limit UI | Requesting a new link from the Email Entry screen is enough for v4.0; explicit resend UX is deferred. |
| Any visible "verified" badge or indicator to the supplier | The gate is invisible by design — once verified, the supplier simply proceeds. |
| Database-level enforcement that the verified email equals the typed contact email | Accepted as **UI-only** validation of email ownership. Both emails are stored; neither is enforced against the other. |
| Any change to Door 1 / Door 2 internals or EcoVadis registration internals | v4.0 changes only *when* these screens are reached (after verification), not how they work. |
| Account pages, passwords, or a returning-user login experience | This is one-time email validation, not a login. No password table, no "log back in." |
| Linking submissions to a `user_id` / relational coupling to `auth.users` | The session gates entry and supplies the verified email; submissions are not joined to the auth user. |
| Brand-styled magic-link email | Would require a Supabase Send-Email Auth Hook (Edge Function) + Resend API key as a secret. The plain default template via SMTP is used instead. |
| Internal review dashboard for The Corporate | Would require authorization (A3) and a read path. Reading happens in the Supabase dashboard. Already out of scope since v3.0. |
| Connecting the Supplier Sustainability Scorecard to this database | Makes the two a Stack; deferred until the portal is proven. |
| Automated retention deletion at 24 months | Needs a scheduled-automation arm. Manual deletion in the dashboard (now including the Auth user). |
| Deduplication / unique constraint on supplier email | Risks silently blocking a legitimate re-submission. Handled by eye in the dashboard. |
| Confirmation email to the supplier | The downloadable PDF is the supplier's record. |
| Storing the uploaded file itself | Only parsed answers are stored. |
| CAPTCHA / bot protection on the email form | Not required for v4.0's validation purpose; can be revisited if abuse appears. |

---

## Section 13 — Acceptance Criteria

> v4.0 adds criteria 1–8 below and retains the still-relevant v3.0 criteria (9–24). Any v3.0 criterion asserting `anon` can insert is superseded by criterion 6.

| # | What to verify | Expected result | Done? |
|---|---------------|-----------------|-------|
| 1 | Landing page shows a single "Start submission" CTA | The two route buttons are gone; routes are still described as context; "Start submission" opens Email Entry, not EcoVadis or Door Choice | [ ] |
| 2 | Email Entry sends a magic link | Entering an email and pressing "Send link" triggers Supabase Auth magic-link sign-in and shows the Check-Your-Inbox screen | [ ] |
| 3 | Magic link is delivered via Resend SMTP | The email arrives from the configured sender (test: to the builder's own inbox) and contains a working link | [ ] |
| 4 | Clicking the link opens a verified session at Route Choice | The supplier lands back in the portal, verified, on the Route Choice screen | [ ] |
| 5 | The gate is enforced | Route Choice, EcoVadis Registration, and all data-entry screens are unreachable without a verified session; a deep link without a session returns to Email Entry | [ ] |
| 6 | Only `authenticated` can write; `anon` cannot | Acting as `authenticated`: INSERT on `suppliers` and `submissions` succeeds. Acting as `anon`: INSERT is **denied** on both. SELECT/UPDATE/DELETE denied for every client role | [ ] |
| 7 | Verified email is stored on both routes | After a verified EcoVadis register and a verified questionnaire submit, `verified_email` and `verified_at` are populated on the `suppliers` row | [ ] |
| 8 | No email function and no Resend key in the project | Grep `src/` and the repo: no transactional-email function, no Resend API key, no service-role key anywhere | [ ] |
| 9 | EcoVadis Registration validates, writes, redirects | Required fields + consent enforced; on success a `suppliers` row exists (`route = ecovadis`, `status = declared`, scorecard URL, consent + verified fields), then ecovadis.com opens in a new tab | [ ] |
| 10 | EcoVadis write failure blocks the redirect | A failed insert shows a clear error; the supplier is not redirected | [ ] |
| 11 | Guided Form navigation and validation unchanged | 7 sections, free navigation, inline required-field errors | [ ] |
| 12 | Consent checkbox present, unticked, blocking, at all three points | Guided Form final step, Upload Review, EcoVadis Registration; blocked until ticked | [ ] |
| 13 | Guided Form submit writes both rows | `suppliers` (`route = questionnaire`, `status = submitted`) + `submissions` (`door = guided_form`) with all answers, plus verified fields | [ ] |
| 14 | Download Template unchanged | Downloads the unmodified `The_Corporate_Supplier_Questionnaire_2026.xlsx` | [ ] |
| 15 | Upload accepts, validates, reviews | .xlsx/.csv accepted; structural mismatch hard-fails; Upload Review read-only and accurate; missing required answers block Submit | [ ] |
| 16 | Upload submit writes both rows | Same as #13 but `door = upload` | [ ] |
| 17 | Both doors produce identical answer JSON | Same answers via Door 1 and Door 2 yield the same `answers` shape and keys | [ ] |
| 18 | Consent fields stored; no consent-less row | `consent_given = true`, `consent_at`, `consent_version` on every supplier row; CHECK blocks `consent_given = false` | [ ] |
| 19 | The client never reads | Grep `src/` — no `.select()` against `suppliers` or `submissions` | [ ] |
| 20 | Failed write never shows a false Confirmation | A simulated failed insert shows a "not recorded" error and retry, never Confirmation | [ ] |
| 21 | Confirmation Screen correct | States the submission was recorded; shows 24-month retention and rebecca@lcaresource.com | [ ] |
| 22 | PDF export works for both doors | Branded, section-by-section S1–S7 listing | [ ] |
| 23 | Records visible in the dashboard | After a verified test submission on each route, rows are present and correct, including verified fields | [ ] |
| 24 | Deploys and is responsive | Netlify live URL works on desktop and mobile across every screen, including the new ones | [ ] |
| 25 | `docs/supabase-setup.md` updated | Reflects the two new columns, the auth change, the `anon`→`authenticated` write move, and the RPC signature change | [ ] |

---

## Section 14 — Build Path

**This tool's tier:** Tier 3

### Pre-build steps — complete before opening Claude Code

- [x] Tool Architect — interview complete, this spec written and confirmed
- [ ] Project Governor — `CLAUDE.md` updated to v4.0 (add the auth/verification-gate rules, the `anon`→`authenticated` write change, the "no email function / no Resend key in repo" rule, and the deferred-domain note) and `PROGRESS.md` re-seeded
- [ ] `product-spec.md` v4.0, updated `CLAUDE.md`, updated `PROGRESS.md` pushed to the repo root
- [ ] Supabase Auth **SMTP configured** with Resend (dashboard) — *can be done now or during the build; use test mode to your own inbox until the domain is verified*
- [ ] Supabase Auth **URL configuration** set — Site URL + redirect allow-list = the Netlify site URL (dashboard)
- [ ] Resend **domain verification** — **deferrable to just before go-live**; not needed to build or test
- [ ] `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` already in Netlify (from v3.0) — confirm present

### Tier 3 — build session

- [ ] Claude Code reads `product-spec.md`, `CLAUDE.md`, `PROGRESS.md`, and **`docs/supabase-setup.md`** (existing schema — do not recreate tables or the RPC)
- [ ] Via Supabase MCP: **enable magic-link auth**; add `verified_email` and `verified_at` to `suppliers`; **move INSERT from `anon` to `authenticated`** on both tables (policies + GRANTs); move the RPC's EXECUTE to `authenticated` and add the two verified-identity parameters
- [ ] **Verify RLS before building UI** — `authenticated` can insert / cannot read; `anon` cannot insert
- [ ] Update `docs/supabase-setup.md` in the same save point
- [ ] Build the Email Entry, Check-Your-Inbox, and Route Choice screens; replace the landing page's two route buttons with a single "Start submission" CTA
- [ ] Wire the magic-link sign-in and the verified-session gate; capture `verified_email` / `verified_at` from the session
- [ ] Pass the verified fields into both write paths (RPC + EcoVadis insert), executing as `authenticated`
- [ ] Leave Door 1 / Door 2 / EcoVadis Registration internals and the consent flow unchanged
- [ ] Test end-to-end with a magic link to your own inbox; confirm rows (with verified fields) land in the dashboard
- [ ] Acceptance-criteria pass (25 criteria)
- [ ] Push to `main` → Netlify auto-deploys
- [ ] Optional post-build: run the Supabase QA skill to verify schema, RLS, and auth

---

## Section 15 — Open Questions

| Question | Who answers it | Blocking? |
|----------|---------------|-----------|
| **Upgrade Supabase from Free to Pro before real supplier traffic?** A paused Free project now breaks login, not just submissions. | Builder | No to build — **Yes before go-live** |
| When to do Resend **domain verification** for `lcaresource.com` (deferrable to pre-go-live; who manages the DNS?). | Builder | No — not needed to build or test |
| Final sender address for the magic-link email (`auth@lcaresource.com` vs `noreply@lcaresource.com`). | Builder | No |
| Final wording of the consent text and the magic-link email subject/body copy. | Builder | No — defaults provided |
| Retention deletion (incl. the Auth user) is manual — diarise it. Automate in a later version? | Builder | No — but a live GDPR obligation |

---

## Section 16 — Tool Version History

| Version | Date | What changed in the tool |
|---------|------|--------------------------|
| v1.0 | — | Static single-page site: EcoVadis external link + Excel download, returned by email outside the tool. |
| v2.0 | 8 July 2026 | React + Vite + Tailwind rebuild. Two in-tool submission doors, Door Choice, branded PDF export. Session-only, nothing stored. |
| v3.0 | 14 July 2026 | Database added (Supabase, Tier 2). Supplier + submission records persisted, EcoVadis Registration screen, GDPR consent at all submission points. Write-only — RLS grants `anon` INSERT and denies all reads. |
| v4.0 | 22 July 2026 | **Magic-link email verification added (Tier 3, A2 — authentication, no roles).** A mandatory email-verification gate now precedes route choice and all data entry: the landing page's two route buttons become one "Start submission" CTA, and the EcoVadis-vs-questionnaire choice moves to *after* verification. The verified email + timestamp are stored on the supplier row. Writes move from the `anon` role to the `authenticated` role (write-only invariant preserved). Magic-link emails are sent by Supabase Auth via Resend custom SMTP — no email function and no Resend key in the project. GDPR extended to cover the verified email (incl. deletion of the Supabase Auth user). |

---

*This spec is written for Claude Code. It assumes zero prior context. Every decision, rule, and requirement must be explicit enough that the builder can hand this document to Claude Code without a single verbal explanation.*
