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
| Plan | **Free tier** (builder decision, 15 July 2026). ⚠️ Pauses after ~1 week idle — while paused, supplier submissions fail. Unpause manually in the dashboard before/after idle periods, or upgrade to Pro before sustained supplier traffic. |

## Client configuration

The app connects with the **publishable (anon) key** only, exposed to the browser at build time via Netlify env vars:

- `VITE_SUPABASE_URL` = the project URL above
- `VITE_SUPABASE_ANON_KEY` = the anon / publishable key (Project Settings → API)

The **service-role key is never used** — never in code, env, or repo. It bypasses RLS.

## Tables

### `suppliers`

One row per supplier who registers (EcoVadis route) or submits (questionnaire route). A row is created only on submit/register — there is no "not started" state.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, default `gen_random_uuid()`. **In practice supplied by the client** (`crypto.randomUUID()`) so the app can link the submission row without reading back. |
| `company_name` | text | not null |
| `country` | text | not null |
| `contact_name` | text | not null |
| `contact_email` | text | not null — **personal data (GDPR)** |
| `route` | text | not null, CHECK in (`ecovadis`, `questionnaire`) |
| `status` | text | not null, CHECK in (`declared`, `submitted`) |
| `ecovadis_scorecard_url` | text | nullable (required by the app when `route = ecovadis`) |
| `consent_given` | boolean | not null, **CHECK (`consent_given = true`)** — a row cannot exist without consent |
| `consent_at` | timestamptz | not null |
| `consent_version` | text | not null (e.g. `2026-v1`) |
| `created_at` | timestamptz | not null, default `now()` |

### `submissions`

One row per completed questionnaire. EcoVadis-route suppliers have **no** submission row.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `supplier_id` | uuid | not null, FK → `suppliers.id` |
| `submitted_at` | timestamptz | not null, default `now()` |
| `door` | text | not null, CHECK in (`guided_form`, `upload`) |
| `answers` | jsonb | not null — all answers keyed by question ID (identical shape from both doors) |
| `created_at` | timestamptz | not null, default `now()` |

**Index:** `submissions_supplier_id_idx` on `submissions (supplier_id)`.

## RLS — write-only, enforced in two layers

RLS is **enabled on both tables**. The `anon` role can INSERT and nothing else.

| Table | anon INSERT | anon SELECT | anon UPDATE | anon DELETE |
|-------|-------------|-------------|-------------|-------------|
| `suppliers` | ✅ Allowed | ❌ Denied | ❌ Denied | ❌ Denied |
| `submissions` | ✅ Allowed | ❌ Denied | ❌ Denied | ❌ Denied |

Two layers of enforcement:

1. **RLS policies** — only `INSERT` policies exist (`with check (true)`) for `anon`. No SELECT/UPDATE/DELETE policy exists; under RLS, absence of a policy is denial.
2. **GRANT layer** — SELECT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER were **revoked from `anon`**; only INSERT remains granted. So even if a policy were ever added by mistake, the privilege is gone.

Because `anon` lacks SELECT, `INSERT ... RETURNING` and supabase-js `.insert().select()` both fail for anon. The app therefore **never reads** and never depends on RETURNING:

- **EcoVadis route** — a single direct `insert` into `suppliers` (no submission row).
- **Questionnaire route** — the `submit_questionnaire` RPC (below) writes both rows in one transaction, so there is never an orphan `suppliers` row if the `submissions` insert fails.

### Function: `submit_questionnaire(...)`

`SECURITY DEFINER`, `EXECUTE` granted to `anon` only (revoked from `PUBLIC`). It **inserts** the `suppliers` and `submissions` rows atomically and **returns void** — it exposes no read path, so the write-only invariant holds. Signature:

```
submit_questionnaire(
  p_company_name text, p_country text, p_contact_name text, p_contact_email text,
  p_consent_version text, p_door text, p_answers jsonb
) returns void
```

Sets `route = 'questionnaire'`, `status = 'submitted'`, `consent_given = true`, `consent_at = now()`. Rejects an unknown `p_door` or an empty `p_consent_version`.

### Verification (run 15 July 2026, acting as the `anon` role — the real RLS boundary)

| Check | Result |
|-------|--------|
| anon INSERT `suppliers` (client-supplied id, no RETURNING) | ✅ succeeds |
| anon INSERT `submissions` (client-supplied id, no RETURNING) | ✅ succeeds |
| anon SELECT `suppliers` | ✅ denied |
| anon UPDATE `suppliers` | ✅ denied |
| anon INSERT with `consent_given = false` | ✅ blocked by CHECK |

All probe rows were rolled back / deleted; both tables are empty.

## Migrations applied

1. `v3_0_suppliers_submissions_schema` — tables, index, RLS enabled, anon INSERT policies.
2. `v3_0_lock_anon_to_insert_only` — revoke non-INSERT privileges from `anon` (defense in depth).
3. `v3_0_submit_questionnaire_rpc` — atomic two-insert RPC (SECURITY DEFINER; EXECUTE to `anon`).

## Notes

- **Reading** happens only in the Supabase dashboard (Rebecca), authenticated by Supabase — never in the app.
- **Retention:** 24 months, deleted **manually** in the dashboard (no automated job in v3.0).
- **Duplicates** are allowed (a re-submission creates a second row); dedupe by eye on `contact_email`.

---

_Last updated: 15 July 2026 — Session 5 (v3.0 build). Schema created via Supabase MCP._
