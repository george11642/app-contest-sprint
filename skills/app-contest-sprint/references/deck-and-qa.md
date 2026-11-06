# Finalist deck and Q&A prep

Only for finalists. Build a draft for the practice session, then finish by the deck deadline. The talk is 8:00 and the Q&A 4:00, strictly timed. Judges have seen nothing.

## Format

- **PPTX with embedded MP4, plus a PDF backup.** It runs on their machine; your own devices are not allowed.
- Build it from a script (`pptxgenjs`), so a re-run picks up new screens and video. If the team has a deck in another tool, keep it and export PPTX.
- 16:9, 13.33×7.5 in. Safe fonts only (Arial, Courier New), because the machine is unknown.
- Composite phone frames from real screenshots with a script.
- Render every slide to PNG and look at it.
- A PDF cannot play video, so the notes carry the fallback: narrate over the screenshot slides.

```js
const media = { type: "video", path: CLIP, x, y, w, h };
media.cover = "data:image/png;base64," + coverPngBase64;   // poster frame
slide.addMedia(media);
slide.addNotes(`[2:55 to 4:25, 90 s] ...`);
```

- Encode H.264 + AAC at 1080p.
- **Embed a cut, not the film.** A 2:40 film would eat a third of the talk. Plan a 30 to 60 s cut-down from the start, and set its length by the slot. **[SafetySense example]** The clip was 38.7 s and 5.5 MB, the deck 10.8 MB, the PDF 7.5 MB, against 65 MB for the full film.
- Email size limits for the deck are unknown. Check before the deadline, and ask itevents@unm.edu how to send a large deck.
- Test the embedded video on a machine that did not build the deck, in PowerPoint itself. Keynote and LibreOffice prove nothing.

## Structure and timing

Plan for about 7:30, never 8:00. Live delivery runs long.

| # | Slide | Clock | Length | Criterion |
|---|---|---|---|---|
| 1 | Title and tagline | 0:00 | 15 s | Professionalism |
| 2 | Team and one-paragraph idea | 0:15 | 30 s | Rule: team, app |
| 3 | The problem, as a claim with sourced facts | 0:45 | 45 s | Problem |
| 4 | The core idea and its promises | 1:30 | 35 s | Coherence |
| 5 | How it behaves, in steps | 2:05 | 50 s | Functionality |
| 6 | **Demo video** (set-up, clip, follow-up) | 2:55 | 90 s | Functionality, wow |
| 7 | Comparison with alternatives | 4:25 | 35 s | Originality |
| 8 | Design for the real user | 5:00 | 35 s | Design |
| 9 | Privacy | 5:35 | 35 s | Trust |
| 10 | Architecture | 6:10 | 35 s | Technology |
| 11 | Metrics and next steps | 6:45 | 25 s | Plan, mission |
| 12 | Close and thank you | 7:10 | 15 s | Professionalism |
| A1 to A3 | Likely judge questions | Q&A | | |

The submission page asks for 1 to 2 minutes on team, app, problem and technology, with the rest as pitch. A team may prefer a one-line tech mention early. Ask at practice.

## Slide and notes rules

- Every slide title is a claim, not a label.
- Define terms the first time.
- Notes start with a clock stamp, then the exact words, then bracketed stage directions and sources: `[0:45 to 1:30, 45 s]`.
- Do not talk over a clip that has narration. Set it up, play it, then say what to notice.
- State what is simulated, every time.
- Use the speakers' real names, years and majors, which the rules require. Leave `[FILL IN]` until they confirm.
- Assign who says what.

## Practice session

- Book the slot from the finalist email. Everyone attends if possible.
- A human prints one unofficial transcript per teammate. Do not email them.
- Bring a draft deck, even if the video is rough.
- Apply changes, then re-time.
- Rehearse with a stopwatch at least three times, including video playback on a fresh machine.

## Q&A prep file

- **How to answer:** one sentence, then stop. Add detail only when asked. If you do not know, say "We haven't measured that yet. Here's how we would."
- **Who answers what:** split by teammate.
- **Judge-role map:** which role will press on which topic. See [contest-rules.md](contest-rules.md).
- Each question has **Short** and **More**.
- Sections: trust and tech, cost, law and business, edge cases and abuse.
- **Facts table:** claim, source, status, date verified.
- **Things not to say:** the overclaims specific to this app.
- 3 appendix slides carry short answers to the top questions.

Prepare for any app:

- Why not just use (existing product)?
- Is this real, and what is simulated?
- What does it cost to run?
- What is the business model? (Label proposals as proposals.)
- Have you talked to users or partners? (Tell the truth.)
- What happens if it fails?
- What data do you keep, and who can see it?
- Could it be abused?
- Android? Other schools? Scale?
- Will the app store approve it?
- What worries you most?

For any number you have not measured, give the target and how you will measure it. Mark it in the prep file.
