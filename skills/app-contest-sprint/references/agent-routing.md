# Agent routing

## Who does what

| Work | Claude Code | Codex |
|---|---|---|
| Scan, triage, ledger | Yes | Yes |
| App, backend | Yes | Yes |
| Figma prototype | Yes | Yes, if the Figma MCP is connected |
| PDFs, email draft | Yes | Yes |
| Deck, Q&A prep | Yes | Yes |
| Video | Yes, Opus model required | No. Write the handoff |

`CONTEST_STATE.md` is the shared memory. A team can switch tools between any two deliverables.

## On Claude Code

- Check the model before phase 7. If it is not Opus, stop and say: run `/model opus` here, or restart with `claude --model opus`, then ask me to continue the contest sprint. Earlier phases can run on any model.
- Multi-agent work: use subagents. Where the Workflow tool is available, use it for review panels and parallel QA. Results are journaled, so a re-run after a limit is cheap if prompts are unchanged.

## On Codex

- Do everything except the video, even if the team asks you to try it. The video needs the Remotion kit, heavy visual iteration and review rounds, and the route that was tested runs on Claude Code Opus.
- Footage capture is fine on Codex, because it comes from the app. Do it if time allows, and record it in the handoff.
- When the earlier phases are done, or the team asks, write `VIDEO_HANDOFF.md` at the repo root from [assets/VIDEO_HANDOFF.md](../assets/VIDEO_HANDOFF.md), fill in every section you can, and print the paste prompt below.
- Multi-agent work: use fresh `codex exec` runs, each with a self-contained prompt, or subagents if your version offers them. Run reviewers in fresh runs so they carry no context from the author. Save each verdict to a file. [Codex browser QA was not tested on the worked example.]

## The prompt to paste into Claude Code running Opus

Give the humans this exactly. Before they paste it, they should install the skill for Claude Code (`npx skills add george11642/app-contest-sprint`) and open Claude Code at the repo root.

```text
Use the app-contest-sprint skill. Read CONTEST_STATE.md and VIDEO_HANDOFF.md at the repo root, then run the video phase from references/video-hybrid.md. We are running on Opus. Keep to the review caps and stop conditions. Do not change the app or the submission documents. If a fact in the handoff is missing or looks wrong, ask us before it goes on screen.
```

## Before a handoff is complete

The handoff is ready when a fresh Opus session can start without asking what the app does:

- Product truth files with exact numbers and timings for every claim
- Screen recording of the real flow, plus a timestamped cut list
- Clean screenshots of key screens with story-consistent clocks
- Demo data notes: names on screen, fake numbers, what is simulated
- Brand: colors, logo as SVG, icon, fonts
- Team names with pronunciation, and a yes or no on photos
- Sourced stats with citation and DOI
- Staging rules for sensitive content
- The story: protagonist, scenario, the twist, the architecture in under 25 words
- Deck status and which slide takes the clip
- Whether `ELEVENLABS_API_KEY` is present, by name only, never the value

If an item is missing, list it under Open Items. Do not guess to fill it.

## Review panels

The rubric is in [assets/review-panel-rubric.md](../assets/review-panel-rubric.md). The rule on both tools: reviewers never wrote the work, and they read the output itself, not the author's summary.

- **Claude Code:** one subagent per lens, or a Workflow fan-out.
- **Codex:** one fresh `codex exec` per lens. On a tight budget, run the accuracy lens and one other.
- Merge verdicts into one list for the fixer. Save panel results to a file, and record the verdict in the ledger.
- The fixer never certifies its own work. A new reviewer confirms the fix.

## When a tool is missing

| Missing | Do this |
|---|---|
| Figma MCP | Try to connect it once. If not: build frames in the Figma app with the human, or generate a Figma plugin script they run. Screens can be exported as PNG for drag-in. Tell the team the wiring needs a person, and give a hotspot list per frame. In an emergency, any tool that gives a public clickable link is better than nothing, but say Figma is what the rules name |
| Browser for click-through | Use headed Playwright with a normal user agent and a clean profile. If none works, give the human a checklist by flow and record that the walk was manual. Never report a signed-in or headless login wall as a pass or a fail |
| Chrome for PDFs | `assets/submission/render.sh` falls back to Edge, Chromium, then `weasyprint`. Failing that, export from Word or Google Docs |
| `pdftoppm` | Use `sips`, `mutool`, or a browser to view pages. Still look at every page |
| ElevenLabs key | Use the scratch VO for picture work. Tell the human which step needs the key. Do not substitute robotic TTS in a final cut |
| Xcode or a Mac | Build for what the team has. iOS capture needs a Mac; use web or Android, or go straight to Figma |
| Apple paid membership | Stay on the simulator. TestFlight is optional |
| Network | Fonts and rule pages need it. Say what could not be fetched |

## Usage limits

- Stop fanning out at a limit. Failed reviewers teach nothing. Wait for the reset.
- Do not launch a panel with little quota left.
- Make work resumable: commit after each deliverable when the repo's rules allow it, and update the ledger.
- Do not let two sessions share one working tree on the same files.
