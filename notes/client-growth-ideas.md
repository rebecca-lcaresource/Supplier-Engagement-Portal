# Client Growth — App Ideas & Marketing Plan

**Saved:** 8 July 2026 — handoff notes from the session that built the Supplier Portal v2.0.
**Purpose:** Pick this up in a fresh session tomorrow. The plan: use the **Tool Architect** skill to spec a lead-magnet app, starting with the CSRD Readiness Scorecard (see below).

---

## Where things stand (so tomorrow starts from a clean base)

The Supplier Sustainability Portal is **built, deployed, and live** on two independent URLs, both auto-deploying from `main`:

| | URL | Host |
|---|---|---|
| Primary | https://supplier-engagement-portal.netlify.app/ | Netlify |
| Backup | https://rebecca-lcaresource.github.io/Supplier-Engagement-Portal/ | GitHub Pages |

That project is done for now (only open item: swap the interim EcoVadis homepage link if EcoVadis ever gives a targeted URL). The ideas below are a **new** direction — client acquisition — not more work on the portal.

---

## The core insight: your actual differentiator

Your domain is LCA / ESG. This week you shipped a real, working, ESRS-aligned supplier-engagement web app — Scope 1/2/3 capture, EcoVadis routing, a 7-section questionnaire, client-side branded PDF export — **as a non-developer, by directing AI.**

That combination is rare and is exactly what your clients wish they had:
> Someone who deeply understands ESG **and** can spin up custom tools fast and cheaply.

Most ESG consultants can't build. Most developers don't understand CSRD. You now do both. So your marketing and your "app" should be the **same thing**: small, genuinely useful ESG tools that double as lead magnets *and* as proof you can build.

---

## App ideas, ranked

### 1. CSRD / ESRS Readiness Scorecard  ← recommended flagship
A 10–15 question self-assessment that gives a company an instant readiness score plus a personalized, branded PDF of their gaps — in exchange for an email.

**Why this one first:**
- Highest-intent lead magnet — sustainability managers love self-scoring tools.
- **Massive reuse from the portal you just built:** the questionnaire/section structure, the field-data pattern (`src/data/questionnaireFields.js`), and the client-side branded PDF export (`src/lib/generatePdf.js`) are already done and proven. This is essentially the portal, simplified into a *scorecard* — score instead of collect.
- The one genuinely new piece is **email capture** to send the full report — that likely bumps it above "Tier 1 / nothing stored," so flag it to the Tool Architect (see below).

### 2. "Which ESG rules actually apply to me?" decision tool
A guided decision tree (same Yes/No pattern already built) that tells a company which frameworks and deadlines apply — CSRD vs. SEC vs. CDP vs. EcoVadis vs. SBTi — based on size, region, sector. Very shareable because it removes real, widespread confusion.

### 3. Scope 3 hotspot estimator
Enter industry + spend + supplier count → a rough estimate of where value-chain emissions hide. Showcases the Scope 3 expertise that's your hardest-to-find skill.

### 4. Product Carbon Footprint mini-calculator
Rough cradle-to-gate estimate for a product. Ties directly to the "LCA Resource" brand name.

---

## The part that actually gets clients (marketing mechanic)

The mechanic matters more than the app. For whichever tool:

1. **Free instant value** — they get a score/answer immediately, no gate.
2. **Email for the full report** — the PDF export you already know how to build becomes the lead capture.
3. **The LinkedIn story is "how," not "look at me."** You don't have to sell. Post something like:
   > "A CSRD readiness check shouldn't cost £5k. I built a free one — here's the tool, and here's how I built it with AI in a weekend as a non-coder."

   That one post markets the tool, the service, **and** your AI+ESG edge at once. Build-in-public is currently very magnetic on LinkedIn.

Each tool = one shareable post + one lead magnet. Ship a few over a few weeks and you have a content engine running on things you're genuinely good at.

---

## How to brief the Tool Architect tomorrow (starter)

Open a fresh session and tell the Tool Architect roughly this:

> I want a **CSRD / ESRS Readiness Scorecard** — a public, no-login web tool. A visitor answers ~10–15 questions about their sustainability reporting maturity, gets an instant readiness score and a short set of prioritized gaps on screen, then can enter their email to receive a fuller branded PDF report. It should reuse the look, the questionnaire/field pattern, and the client-side PDF export from my existing Supplier-Engagement-Portal (React + Vite + Tailwind, The Corporate–style brand, or my own LCA Resource brand). The one new capability vs. that project is capturing the email + sending the report, so we need to decide how leads are stored/sent (this probably makes it Tier 2, not Tier 1).

Key decisions the Architect will want settled:
- **Whose brand?** The Corporate brand was for that client — this tool is *yours*, so consider an "LCA Resource" brand skill instead.
- **Lead handling** — where do emails go? (e.g., a simple email service / Netlify form / a lightweight database). This is the deciding factor for the tier.
- **Scoring logic** — what makes a score high vs. low, and what gap advice each answer triggers.
- **Question set** — you have strong source material already in the supplier questionnaire; a readiness scorecard is broader/higher-level than that supplier form, so it needs its own shorter question list.

---

*Great week — you shipped a real product. This is the fun part: turning that capability into clients.*
