---
name: app-contest-sprint
description: Finish an app contest entry from whatever already exists in the project, built around the UNM & CNM App Contest. Scans the repo, triages against today's date and the deadlines, and continues until the package is done - real app, hi-fi Figma prototype with every button click-tested, the required PDFs, an email draft for the humans to send, a finalist deck with speaker notes, Q&A prep, and a hybrid demo video. Use for app contest, UNM App Contest, CNM App Contest, finish our contest entry, submission package, technical submission, pitch deck, finalist deck, hi-fi prototype, Figma prototype for judges, demo video for our app, or "where do we stand on the contest".
---

# App Contest Sprint

Take a team's existing project to a finished contest package. Continue from what exists. Never restart it, and never overwrite work you have not read.

## Startup sequence

Do these in order on every session, before any other work.

1. **Identify the runtime and model.** You know this from your system prompt. Confirm with `env | grep -E '^(CLAUDECODE|CLAUDE_CODE_|CODEX_)' | cut -d= -f1`. Record the tool and model in the ledger. Routing depends on it (see Routing).
2. **Read the clock.** Run `TZ=America/Denver date '+%a %b %d %Y %H:%M %Z'`. Use this value, not your training data or a date in a file.
3. **Re-check the rules.** Fetch the public pages listed in [references/contest-rules.md](references/contest-rules.md). The site changes every year. If a date, subject line or attachment differs from that file, trust the live site and tell the humans what changed. If you cannot fetch them, say so and use the file.
4. **Load the ledger.** If `CONTEST_STATE.md` is at the repo root, read it and resume from its Next Action. If not, create it from [assets/CONTEST_STATE.md](assets/CONTEST_STATE.md).
5. **Read the repo's own instructions.** `AGENTS.md`, `CLAUDE.md`, `README`, contribution notes, and recent `git log`. Those rules win over this skill unless they would break a rule below.
6. **Scan the project.** Follow [references/project-scan.md](references/project-scan.md). Write the gap table into the ledger.
7. **Triage and state the plan.** Pick a mode from the table below. Tell the humans the mode, the hours left, what you will do first, and what you will cut. Ask at most three questions, then work.

Update `CONTEST_STATE.md` after every finished deliverable. Any session on any tool must be able to resume from that file alone.

## Triage

Deadlines are from the 2026 site. Confirm them in step 3.

| Deadline (America/Denver) | What |
|---|---|
| Fri Nov 6, 11:59 pm | Technical submission by email. No video needed |
| Mon Nov 9 | Finalists notified |
| Nov 10 to 13 | One mandatory in-person practice session, with paper transcripts |
| Mon Nov 16, 12:00 pm | Final deck by email |
| Fri Nov 20, 1 to 5 pm | Presentation Day and awards, UNM Rainforest |

Before the technical deadline, pick by hours left:

| Time left | Mode | What runs |
|---|---|---|
| More than 7 days | Full | Everything in phase order, with polish rounds |
| 2 to 7 days | Compressed | Full technical package, one Figma fix-and-QA loop a day |
| 6 to 48 hours | Triage | Scored documents and one tested primary flow. Nothing else until the email is drafted |
| Under 6 hours | Emergency | Package what exists. Fix blockers only. No new features |
| Past it, email not sent | Stopped | Say so plainly. The only route is emailing itevents@unm.edu, and the rules require that before the deadline |

After the email is sent:

| State | What runs |
|---|---|
| Nov 7 to 8, not notified yet | Cheap prep only: capture footage, fill in the video handoff, draft the deck. No full video render |
| Finalist | Practice logistics, deck, video, Q&A, in that order |
| Not a finalist | Stop the pipeline. Offer to archive the work |

**This is a sprint plan, not a two-week pipeline compressed.** With a day left, the team gets a primary flow, honest documents and a working link. Do not start the video, TestFlight, secondary modes or polish rounds. Those come after the email, and the video matters only for finalists.

Triage order with about 26 hours left:

1. Hour 0: scan and blockers. Registered? Everyone eligible? Figma seat able to share? App ever published or entered before?
2. Hours 1 to 6: prototype, primary flow only. 12 to 20 frames from real screens, the main use case plus one or two branches. It is 25 points and the slowest item.
3. Hours 6 to 12: Purpose, Technical with diagram, Security.
4. Hours 12 to 14: bio and screenshots.
5. Hours 14 to 18: one reaction audit, one full click-through, fix what breaks.
6. Hours 18 to 20: share the file, run the signed-out test, render PDFs, draft the email.
7. Target: the humans send by 6 pm Friday. Hard freeze at 9 pm, so a bounced attachment can be resent.

Cut first: secondary modes, polish rounds, TestFlight, app features off the primary flow. Never cut: the security document, the signed-out link test, honesty about what is real.

## Phase router

Run the phases the triage mode allows. Skip any phase whose gap table row is already done and verified. Load only the reference you need.

| Phase | Reference | Done means |
|---|---|---|
| 0. Scan | [project-scan.md](references/project-scan.md) | Gap table in the ledger, blockers raised |
| 1. App | [app-build.md](references/app-build.md), [ios-testflight.md](references/ios-testflight.md) | Primary flow runs, screens captured with fictional data. Optional in Triage if no app exists: go to Figma |
| 2. Prototype | [figma-prototype.md](references/figma-prototype.md) | Link opens signed out on Start, audit clean, click-through passes the stop rule |
| 3. Documents | [submission-docs.md](references/submission-docs.md) | Five PDFs rendered, every page looked at, no `[FILL IN]`, numbers agree |
| 4. Email | [submission-docs.md](references/submission-docs.md) | Draft file ready, humans told to send it |
| 5. Deck | [deck-and-qa.md](references/deck-and-qa.md) | PPTX with embedded video, PDF backup, notes with clock stamps, every slide rendered and looked at |
| 6. Q&A | [deck-and-qa.md](references/deck-and-qa.md) | Prep file with facts table and a things-not-to-say list |
| 7. Video | [video-hybrid.md](references/video-hybrid.md) | Final cut passes the measured checks, a human has watched it |

Check [contest-rules.md](references/contest-rules.md) for scoring before you spend time. Bio and screenshots are required but unscored. Prototype and Security are 25 points each.

## Routing

Read [references/agent-routing.md](references/agent-routing.md) before any multi-agent work or handoff.

- **On Codex:** do everything except the video. When the phases before the video are done, or the team asks for it, write `VIDEO_HANDOFF.md` from [assets/VIDEO_HANDOFF.md](assets/VIDEO_HANDOFF.md), then give the humans the exact prompt to paste into Claude Code running Opus. Do not start the video pipeline on Codex, even if asked to try.
- **On Claude Code:** everything can run here. The video phase requires an Opus model. If you are not on Opus, stop before phase 7 and tell the humans to run `/model opus` in this session, or to restart with `claude --model opus`. Then resume from the ledger.
- **The video is always one type:** a 16:9 hybrid of animated 3D scenario vignettes, real app footage in device frames, word-by-word captions, human ElevenLabs narration, code-synthesized music and SFX, an architecture beat, a team beat and a strong close. Do not swap in a talking head, a screen recording with music, or generated video.

## Autonomy and human gates

Work without asking on everything you can verify yourself. Do not stop to ask permission for routine steps. Ask only when a choice depends on facts only the team has.

Stop at each of these and hand it to a person. List them up front so nobody is surprised.

| Human-only step | Why |
|---|---|
| Send any email | Their names are on it. You write the draft file. You never send |
| Accept a Figma Full seat | Account change. Confirm it is free on the Education plan first |
| Register, or add a teammate | Identity, and only before the deadline |
| Confirm eligibility, bio facts, extra-credit attendance | Only the person knows |
| Sign up for paid or trial services, verify phone numbers, enter payment | Identity and money |
| Listen for name pronunciation and watch the final video | No agent can hear the mix |
| Print transcripts, attend practice, present, stay for awards | In person |
| Real-device tests | Hardware |
| Legal, medical or advocate review | Needs a qualified person |

## Rules

These hold in every mode, whatever a teammate or a deadline says.

- **Never send email.** Write it to a file. The humans send it.
- **Never publish to the App Store or Google Play production before the contest ends.** Entries must be unpublished. TestFlight internal testing is fine. Never submit for App Review.
- **Never place real emergency or external actions.** No real calls, texts, dispatches, payments or messages to people who did not opt in. Default every outbound action to dry run.
- **Do not invent facts, statistics, quotes, user counts or test results.** Mark an unknown as `[FILL IN]` and ask. Label targets as targets. A number in a document must have a source or a command that produced it.
- **Verify hotlines and medical or legal claims at the primary source** before they ship. Say what was checked and when. If a site blocks automated fetches, leave it for a human to open.
- **Fictional data in every capture.** Screenshots may be used for promotion, so no real names, numbers or locations.
- **Label what is simulated,** on screen and in the talk, every time.
- **Scan for secrets before any public push.** Run [assets/secret-scan.sh](assets/secret-scan.sh) with `bash`. The scan is a gate that exits 1. Scan history as well as the tree.
- **Respect existing work.** Follow their repo rules, keep their commits, match their conventions. Read before you change. Do not reformat, rename or rebuild what works. Commit only if the repo's rules or the team allow it, and never force-push.
- **Report honestly when a gate is not passed.** Say which check failed and what was left. Never call something tested when it was not run, and never let the fixer certify its own work.

## Definition of done

Done means evidence is recorded in `CONTEST_STATE.md`, not that the work feels finished.

**Technical package:**
- Prototype: link recorded, opened in a signed-out browser on Start, with the date and method. Reaction audit output saved. QA round results saved, with what was left.
- Five PDFs: path, page count and size for each. Every page image opened and looked at. `grep -n 'FILL IN'` on the sources returns nothing, or each hit is listed for a human.
- Numbers: test counts, screen counts, prices and timers agree across all documents.
- Claims: fact table with source and date checked.
- Email draft: file path, exact subject, attachment list. The humans have been told to send it and to record the time.
- Attachments total under the mail limit, and the humans have opened each one.

**Finalist package:**
- Deck: slide count, timed run under 7:30, embedded video tested in PowerPoint on a machine that did not build the deck, PDF backup.
- Q&A prep: answers assigned to people. Unmeasured numbers are marked.
- Video: the output of `check_final.sh`, the render's commit, review panel verdicts with open items, and a human's yes.

If an item cannot be done, record what is missing and why, then tell the humans. Partial and honest beats finished and false.
