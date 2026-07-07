# Supplier Sustainability Portal

## Identity
A single public landing page that onboards The Corporate's Tier 1 suppliers into the 2026 sustainability engagement programme — anyone with the link can open it, no login, nothing stored.
Tier: 1 — public page, fixed content, no database, no login required (D1+A1).
Spec version governed: v1.0 — the version of docs/product-spec.md these rules were derived from.
Position: Standalone — no shared database, no other tools.

## Session Protocol
At the start of every session:
1. Pull the latest from main before reading anything else.
2. Check docs/product-spec.md: if its version is newer than the "Spec version governed" line above, STOP and tell the builder to re-run the Project Governor on the revised spec before building. Do not build against a stale CLAUDE.md.
3. Read PROGRESS.md in the root — it is the current state of this build. If it is missing, recreate it with the structure below, then continue.
4. Increment the session number and update the date in PROGRESS.md.
5. If "Notes for next session" has content: repeat it back to the builder, treat it as this session's priorities, then clear the section.
6. If this is session 1, run First Session Setup below before any build work.

Save point — after completing any module, feature, or fix:
1. Update PROGRESS.md: current state, remaining work, build decisions, known issues.
2. Commit and push to main.
3. Tell the builder in one line: "Save point committed: [what changed]."
Do not start the next piece of work before the save point is pushed. An ending session is a save point.

First Session Setup (session 1 only):
1. Create docs/ and move product-spec.md into it.
2. Install the brand skill: create .claude/skills/the-corporate-brand/ and place the provided brand file there as SKILL.md (add minimal name/description frontmatter if it has none).
3. Announce what moved, then commit and push before building anything.

PROGRESS.md structure (for the recreate rule): status header (Session / Last updated / Live URL), Current state, Last session (3–5 lines, replace each session), Remaining work (shrinking checklist), Build decisions (one line each), Known issues, Notes for next session.

## Commands
```
npx serve .
```

## Tech Stack
HTML · CSS · JavaScript · Netlify
Deployment: manual drag-and-drop. Netlify MCP is not active and GitHub is NOT connected to Netlify. Produce one self-contained static folder (the page plus its assets/ folder of downloads); the builder deploys by dragging that folder into the Netlify dashboard. No build command, no environment variables. Tell the builder exactly which folder to drag before the first deploy.

## Hard Rules
- Static page only: no database, no backend, no data capture. The page must never collect, store, or transmit supplier data. Persistence is explicitly a later phase — do not add it.
- No API keys, tokens, or secrets anywhere. There are none in this tool and none may be introduced.
- Submission paths are non-server: Path A is an external link to EcoVadis (new tab), Path B is a static file download, the help desk is a mailto. Never add a form submission, upload, or server-side send.

## Project Structure
```
/                     ← root: CLAUDE.md, PROGRESS.md
/index.html           ← the single scrolling page
/assets               ← questionnaire Excel, Code of Conduct, Environmental Policy (downloads)
/docs                 ← product-spec.md
/.claude/skills/the-corporate-brand/   ← brand skill
```

## Brand
Brand is governed by the the-corporate-brand skill at .claude/skills/the-corporate-brand/SKILL.md (installed in First Session Setup). Invoke it for any UI or copy work.
Hard rules that hold even if the skill is not loaded:
- Background: #F2F2F2 (Chalk) — never white or Tailwind gray defaults
- Accent, buttons, CTAs: #000000 (Ink); links underlined in Ink, never blue
- Font: Playfair Display for display headlines, DM Sans for all body text
- Square corners (border-radius: 0); no drop shadows, no gradients. Acid Lime #C8F135 only against black, maximum twice per page.

## Business Rules
- Decision tree: Yes → emphasise Path A (EcoVadis), dim Path B. No → emphasise Path B (Questionnaire), dim Path A. Reset → both neutral. State is browser-only and clears on refresh.
- Dim is visual only: both path action buttons stay fully functional regardless of emphasis, so a supplier can always act on either path.
- The redirect and the download fire only when the supplier clicks a path's action button — never automatically from the Yes/No answer.
- Figures and dates are used exactly as written in the spec — never invent, alter, or add any figure, date, or requirement.
- Plain priority themes only (climate, pollution, water, circular economy, people, governance). No reporting-standard codes anywhere on the page.
- The footer confidentiality line is written for an external supplier audience — never "internal use only."

Out of scope — do not build:
- In-portal questionnaire form, CSV upload, or EcoVadis scorecard upload — no in-page data entry or uploads
- Server-side submission of the questionnaire, or saved progress / supplier accounts
- Automated scoring, in-tool Scope 3 calculation, any database or persistence, or programmatic EcoVadis validation

## Reference Docs
Read before building the related part:
- docs/product-spec.md — full page sections, decision-tree logic, timeline, resources, acceptance criteria
- .claude/skills/the-corporate-brand/SKILL.md — full brand system
PROGRESS.md in the root is read at every session start per the Session Protocol.
