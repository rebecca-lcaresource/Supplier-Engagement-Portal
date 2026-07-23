# Supabase Setup — Schema Source of Truth

> This file documents the live database schema for the Supplier Sustainability Portal.
> It is the **schema source of truth**. Update it in the same save point as any table or policy change (per CLAUDE.md Session Protocol).

## Project

| Detail | Value |
|--------|-------|
| Project name | Supplier-Engagement-Portal |
| Project ID / ref | `hqqngissvcbevktcizit` |
| URL | `https://hqqngissvcbevktcizit.supabase.co` |
| Region | us-east-1 (US) — disclosed in consent text; cannot change without a new project |
| Postgres | 17 |
| Organization | LCA Resource LLC |
| Plan | **Free tier.** ⚠️ In v4.0 a paused Free project breaks **login** (magic link can't be sent/completed), not just submissions — the whole portal is unusable until unpaused. Upgrade to Pro before real supplier traffic. |

## Client configuration

The app connects with the **publishable (anon) key** only, exposed to the browser at build time via Netlify env vars:

- `VITE_SUPABASE_URL` = the project URL above
- `VITE_SUPABASE_ANON_KEY` = the anon / publishable key (used for both DB calls and to request magic links)

The **service-role key is never used** — never in code, env, or repo. The **Resend credential is not an app key** — it lives only in Supabase Auth → SMTP settings, never in the repo.

## Authentication (magic link) — v4.0

Access model **A2 (authentication, no roles)**. Before choosing a route or entering any data, a supplier must verify a reachable email:

1. App calls `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: <site origin> } })`.
2. Supabase Auth emails a one-time magic link (delivered via **Resend custom SMTP**, configured in the dashboard).
3. Clicking the link returns the supplier in a verified session (`authenticated` role). The app reads the **verified email + verification time** from the session and writes them to `suppliers.verified_email` / `verified_at`.

Open signup (anyone may request a link). The session only (a) gates progress and (b) supplies the verified identity — submissions are **not** linked to a `user_id`. Both routes (EcoVadis + questionnaire) run in a verified session.

**Required dashboard config (outside code):** Authentication → Email provider enabled; **URL Configuration** → Site URL + Redirect URLs include the Netlify URL (**this is the #1 thing that breaks magic links if missing**); SMTP → Resend.

## Tables

### `suppliers`

One row per supplier who registers (EcoVadis route) or submits (questionnaire route). Created only on submit/register.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, default `gen_random_uuid()`. Never read back by the app. |
| `company_name` | text | not null |
| `country` | text | not null |
| `contact_name` | text | not null |
| `contact_email` | text | not null — **self-reported** email typed into the form. Personal data (GDPR). |
| `verified_email` | text | **not null (NEW v4.0)** — the email proven via magic link, from the session. Personal data (GDPR). |
| `verified_at` | timestamptz | **not null (NEW v4.0)** — when the email was verified (from the session). |
| `route` | text | not null, CHECK in (`ecovadis`, `questionnaire`) |
| `status` | text | not null, CHECK in (`declared`, `submitted`) |
| `ecovadis_scorecard_url` | text | nullable (required by the app when `route = ecovadis`) |
| `consent_given` | boolean | not null, **CHECK (`consent_given = true`)** |
| `consent_at` | timestamptz | not null |
| `consent_version` | text | not null (e.g. `2026-v1`) |
| `created_at` | timestamptz | not null, default `now()` |

> `verified_email` vs `contact_email` are stored **separately and not enforced to match** (email-ownership validation is UI-only). Verified = proven mailbox; contact = whatever the supplier types.

### `submissions`

One row per completed questionnaire. EcoVadis-route suppliers have **no** submission row. Unchanged from v3.0: `id`, `supplier_id` (FK → `suppliers.id`), `submitted_at`, `door` (`guided_form`|`upload`), `answers` (jsonb), `created_at`.

**Index:** `submissions_supplier_id_idx` on `submissions (supplier_id)`.

## RLS — write-only, `authenticated` role (v4.0)

RLS enabled on both tables. In v4.0 the inserting role moved from `anon` to **`authenticated`** — every submission happens in a verified session.

| Table | `anon` | `authenticated` |
|-------|--------|-----------------|
| `suppliers` | INSERT ❌ (removed) · read/update/delete ❌ | **INSERT ✅** · read/update/delete ❌ |
| `submissions` | INSERT ❌ (removed) · read/update/delete ❌ | **INSERT ✅** · read/update/delete ❌ |

Two layers: (1) RLS INSERT policies exist **only for `authenticated`** (`with check (true)`); no SELECT/UPDATE/DELETE policy for any role. (2) GRANT: INSERT granted to `authenticated`, revoked from `anon`; SELECT/UPDATE/DELETE revoked from all client roles. The app **never reads** — no `.select()` on either table.

### Function: `submit_questionnaire(...)`

`SECURITY DEFINER`, **EXECUTE granted to `authenticated`** (revoked from `anon`/`PUBLIC`). Inserts `suppliers` + `submissions` atomically, returns void. Signature (v4.0 — gained the two verified params):

```
submit_questionnaire(
  p_company_name text, p_country text, p_contact_name text, p_contact_email text,
  p_verified_email text, p_verified_at timestamptz,
  p_consent_version text, p_door text, p_answers jsonb
) returns void
```

Sets `route='questionnaire'`, `status='submitted'`, `consent_given=true`, `consent_at=now()`. Rejects unknown `p_door`, empty `p_consent_version`, empty `p_verified_email`, or null `p_verified_at`.

### Verification (run 22 July 2026, acting as each role — the real RLS boundary)

| Check | Result |
|-------|--------|
| `authenticated` INSERT `suppliers` | ✅ succeeds |
| `authenticated` SELECT | ✅ denied |
| `authenticated` RPC (with verified params) | ✅ succeeds |
| **`anon` INSERT** | ✅ **denied** (v4.0 change) |
| `verified_email` NOT NULL | ✅ enforced |
| `consent_given = false` | ✅ blocked by CHECK (unchanged) |

All probe rows deleted; both tables empty.

## Migrations applied

1. `v3_0_suppliers_submissions_schema` — tables, index, RLS enabled, anon INSERT policies.
2. `v3_0_lock_anon_to_insert_only` — revoke non-INSERT privileges from `anon`.
3. `v3_0_submit_questionnaire_rpc` — atomic two-insert RPC (EXECUTE to `anon`).
4. `v3_1_allow_authenticated_inserts` — add `authenticated` INSERT policies/grant + RPC EXECUTE.
5. `v4_0_verified_email_and_authenticated_writes` — add `verified_email` + `verified_at`; **revoke `anon` INSERT** (drop anon policies + grant); replace RPC with the 9-param verified signature, EXECUTE `authenticated` only.

## Notes

- **Reading** happens only in the Supabase dashboard (Rebecca), never in the app.
- **Retention:** 24 months, deleted **manually** in the dashboard — v4.0 deletion must **also remove the supplier's Supabase Auth user** (`auth.users`), not just these rows.
- **Duplicates** allowed; dedupe by eye on `contact_email` / `verified_email`.

---

_Last updated: 22 July 2026 — v4.0 build (magic-link verification). Schema changes via Supabase MCP._
