# App Contest Sprint

An agent skill that takes a team's existing project to a finished app contest package. It scans what you have, checks today's date against the deadlines, and continues from there. It never restarts your project.

It was built around the UNM & CNM App Contest and works on Claude Code and Codex.

**What it produces:** a real app, a hi-fi Figma prototype with every button click-tested, the required PDFs, an email draft, a finalist deck with speaker notes, Q&A prep, and a demo video.

**What it will not do:** send your email, publish your app, place real calls or messages, or invent facts.

## Install

```sh
npx skills add george11642/app-contest-sprint
```

Pick Claude Code, Codex, or both when asked. Run it from your project folder.

## First prompt

Open your agent at your project root and paste this:

```text
Use the app-contest-sprint skill. Scan this project, check today's date against the contest deadlines, and tell me where we stand and what you will do first. Then keep going.
```

The skill keeps a ledger at `CONTEST_STATE.md` in your repo, so any session on either tool can pick up where the last one stopped.

## Claude Code and Codex

| | Claude Code | Codex |
|---|---|---|
| Scan, app, prototype, PDFs, deck, Q&A | Yes | Yes |
| Video | Yes, on an Opus model | No |

**On Claude Code,** everything can run in one place. The video phase needs Opus. Switch with `/model opus`, or start with `claude --model opus`.

**On Codex,** the skill does everything except the video, then writes `VIDEO_HANDOFF.md` and gives you the exact prompt to paste into Claude Code running Opus.

## It triages against the clock

The technical submission is an email and needs no video. The video only matters for finalists. So the skill does scored deliverables first and video last. With a day left you get a primary flow, honest documents and a working link. It will not pretend a two-week pipeline fits in a day.

## Requirements

| What | When |
|---|---|
| Figma on the free Education plan, with a Full seat able to share | Prototype |
| ElevenLabs account (free tier) and `ELEVENLABS_API_KEY` | Video narration |
| Apple Developer membership | Only for TestFlight. The simulator needs none |
| Chrome or Edge | PDFs |
| node 20+, python3 with numpy, ffmpeg | Video |

## Steps only people can do

- Send every email
- Accept a Figma Full seat, after confirming it is free
- Register, add teammates, confirm eligibility
- Confirm bio facts and extra-credit attendance
- Sign up for services and enter payment or phone details
- Listen to name pronunciation and watch the final video
- Run real-device tests
- Print transcripts, attend practice, present, stay for awards
- Get any legal, medical or advocate review

## What's here

- `skills/app-contest-sprint/`: the skill. `SKILL.md`, `references/`, `assets/`.
- `video-starter/`: a clean Remotion project for the hybrid film, with a sample film that renders out of the box. It lives outside the skill folder because it is large. The skill fetches it when the video phase starts.

## Limits

Rules and dates come from the public 2026 contest pages. The skill re-checks them at run time, because they change. The worked example has not been scored, so nothing here is proven to earn points. Web, Android and Codex browser paths are marked where they were never tried.

## License

MIT for code and text. 3D assets are licensed per [video-starter/LICENSES.md](video-starter/LICENSES.md), including a CC-BY credit that must stay on your end card.
