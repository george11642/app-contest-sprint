# Submission documents and email

Five PDFs and a draft email. Every document is an attachment, never a link. Only the prototype is a link.

## Build method

One HTML file per document plus one shared stylesheet, rendered by headless Chrome. Agents can edit HTML, tables stay under control, and the diagram can be inline SVG. If the team already keeps a document in Word or Google Docs, keep that source and export PDF.

Copy `assets/submission/` into the team's `submission/_assets/`, then:

```sh
sh submission/_assets/render.sh submission/03-purpose/App-Purpose.html
pdftoppm -r 70 -png out.pdf preview/doc     # then LOOK at every page
```

- Mark unknowns with `<span class="fill">[FILL IN]</span>` and grep before the send step.
- Name files `<App>-<Doc>.pdf`, and title each `Attachment N of 5 · <criterion name>` so scorers can match it to a rubric row.
- Use `break-inside: avoid` on rows and cards, then read every page image. Page breaks are the common defect.
- Google Fonts need network at render time. Fall back to system fonts offline.
- **[SafetySense example]** Lengths were bio 1 page, screenshots 1, purpose 4, technical 6, security 4. Total about 3.6 MB.

## Bio (required, unscored): 1 page

App line, then one card per person: school, year, major, email, role, what they built, one honest line on why they care. Add a short "what we've built so far" strip and "how we split the work". Use only facts a teammate confirmed.

## Screenshots (required, unscored): 1 PDF with 3 labeled screens

Three screens that tell one story: calm state, the turning point, the payoff. Each has a number, a screen name, a state label and two lines on what is happening and why. State whether they are real screens or mock-ups, and label anything simulated. These may appear on score cards, so pick striking, legible frames with fictional data.

## Purpose, audience, functions, pathway (25 points): about 4 pages

Use the criterion's words as headings, in the same order, so a scorer can tick each one.

| Section | Content |
|---|---|
| Header | One-line claim, one sentence on what it does |
| **Purpose** | One sentence on the outcome. Why existing options fail, as 3 or 4 short cards, each with a cited fact. Name real alternatives |
| **Audience** | Table: who, who they are, what they need. Primary users, secondary users, institutional partners. State plainly when partners have not been contacted |
| **Functions** | What the user can do and how the app decides. Modes or roles, core logic, step-by-step behavior with triggers and exits, edge paths |
| Differentiation | Feature comparison against named competitors, with sources. The rules want a novel idea, so show the gap |
| **Pathway to satisfaction** | Metrics table: outcome, numeric target, how measured. Then a dated validation and rollout timeline starting with what is done |
| Mission fit | One box tying it to the mission: real community benefit, local context |
| Sources | Numbered, with dates checked |

"Pathway to satisfaction" is the phrase teams misread most. Treat it as how you will know users are satisfied and the steps to get there. Every metric needs a measurement method. Label targets as targets, not results.

## Proposed technical aspects (25 points): about 6 pages

The rule asks for "APIs, feeds, libraries, models, third party services" plus a diagram. Use those words.

| Section | Content |
|---|---|
| Architecture diagram | On page 1. Hand-authored SVG, plus a full-size rotated copy as the last page so every label is legible |
| Key numbers | 3 or 4 real tiles, such as third-party SDK count or automated test count |
| Components table | Each framework or library, and what you use it for |
| Your own logic | The part that is not a library, and how it is tested |
| Services table | Each third-party service: role, and **what data it receives**. This connects to the Security document |
| API surface | Route, auth type, purpose |
| Key flows | 2 timed walkthroughs of the most important paths |
| Engineering quality | Language mode, test count, how tests avoid real side effects |
| **What's real today, and what's next** | Component, status (Built, Live, Working, Blocked, Sandbox, Roadmap), notes. This is the most valuable table here |

The contest wants a road map, so a "next" column is fair. The status table keeps it honest, and a technical judge will trust the rest more because of it.

Diagram: group by trust boundary, label each arrow, say in a banner what never leaves the device or what the server never sees, include a legend, render so 10 pt labels survive PDF scaling.

## Security (25 points): about 4 pages

Scope it to the app's real data. A privacy specialist may read it. An app with almost no data still needs this document: say so and prove it.

| Section | Content |
|---|---|
| Design principles | 3 or 4 short claims the rest proves |
| **Data inventory** | Every data type: where it lives, retention, protection. Third parties and what they hold. This is the core |
| How protections work | Named mechanisms: algorithm and key location, auth per route, row-level security, secrets storage, abuse limits |
| **Threat model** | Threat, scenario, mitigations, **what's left**. Include misuse of your product by a bad actor |
| Legal and compliance | Only rules that apply, with citations and dates checked. Say which do not apply and why. "Not legal advice" where unsure |
| **Limitations stated plainly** | What is weak now, and the planned fix |
| Commitment | What review happens before real users |

The "what's left" column and the limitations section are the main credibility play. Overclaiming to a privacy specialist costs more than admitting a gap. Retention and deletion claims must match real code, so test them or describe them as planned.

## Fact checking

Keep a table: claim, source, date checked, status. Verify statistics at the primary source, check competitor claims on their own pages, and soften what you cannot prove ("still listed as"). Verify every phone number or resource. Some sites block automated fetches, so leave those for a human.

## Stale-number check

Keep one facts file, and grep every number against it before the email. Test counts, screen counts and timers drift between documents. If a prototype timer is deliberately shorter than the app's, say so wherever both appear.

**[SafetySense example]** PDFs said 136 tests while a later note said 214. One status doc said 34 screens while the prototype description said 56 plus 8 overlays.

## Email draft

Write it to a file from [assets/EMAIL_DRAFT.md](../assets/EMAIL_DRAFT.md). Never send it. Keep the extra-credit line only if someone truly attended. Then tell the humans to send it from a school address, well before the deadline, and to record the time.

Check first: every attachment opens, file names include the app name, the prototype link works signed out, no `[FILL IN]` remains, total size is comfortable for email.
