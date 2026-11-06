# Competitor research

Do this before the documents are final. The contest asks for "a novel idea", judges score originality, and a judge may name a rival in Q&A. A confident claim that turns out false costs more than having competitors at all.

Similar products do not disqualify an entry. The rules ask for an unpublished app, not a first-of-its-kind one. Tell the team this plainly so they don't panic or pivot on the last day. Confirm it against the live rules.

## Time box

- Triage mode (under 48 hours to the deadline): 30 minutes, 5 to 8 closest products, one pass.
- Otherwise: a full sweep, up to a few hours. On Claude Code, use parallel subagents or a Workflow if the team has opted in. On Codex, run the sweeps in sequence.

Never let this hold up the submission. If time runs out, soften the claims and send.

## Method

1. List the app's differentiators as a numbered feature list, from the code and docs. Only include what the app really does.
2. Sweep by category, not by one search. A single search misses most rivals:
   - direct apps in the same niche
   - new AI or startup entrants from the last 2 to 3 years (Product Hunt, YC, tech press, App Store and Google Play searches)
   - what iOS and Android already do for free
   - campus tools, especially what UNM and CNM already give students
   - enterprise or adjacent products, which often have the same feature under another name
   - hardware, academic projects and patents, if relevant
3. For each product, mark every feature yes, partial, no or unknown with a source URL. Use official sites, store listings, help centers and privacy policies. Say "no" only if the docs reasonably show it's absent. Otherwise say "unknown".
4. Check that each product is still live. Products shut down, and memory goes stale.
5. Verify the closest matches skeptically, in both directions: is their marketing overclaiming, and are we underestimating them? Does the feature work without a tap, on the team's platform, in the US?

## Output

Write `docs/COMPETITOR_RESEARCH.md` in the team's repo:

- bottom line first, separately for the contest rules, the originality score, and real-world viability
- a feature matrix of the closest products, with sources
- every other product in a compact list
- what is truly unique, what is matched, and where the entry is behind
- each risky statement in the team's materials, with replacement wording
- a short answer to "doesn't X already do this?"

Then fix the materials: purpose doc, deck, Q&A prep, README, video script, and the email draft. Re-render anything that changed.

## Claim rules

- Never write "first", "only", "no competitor" or "nobody else" unless the matrix supports it. Prefer "of the N apps we reviewed" and name them.
- Say how many products were reviewed and when.
- Compare the combination, not one feature. An app can lose every single-feature comparison and still be the only one with that combination.
- If an app really does everything, change the pitch to the audience and the fit: who it's built for, what the local angle is, and what it does better. Do not hide the rival. Name it and explain the difference.
- Don't claim a competitor lacks something on the basis of silence in their docs.
