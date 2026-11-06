# Review panel rubric

Reviewers did not make the work. Each reads the actual output, not a summary. Each returns JSON:

```json
{"approved": false, "score": 7.5, "blocking": [{"where": "1:04", "what": "...", "fix": "..."}], "polish": ["..."], "checked": ["what you actually opened or ran"]}
```

`approved` needs a score of 8.5 or higher and no blocking items, unless a lens below says otherwise. A blocker must be a defect you can point to, with a timestamp, page or node. Say what you could not check.

Tell each reviewer what the ceiling is, and list accepted items so they are not raised again. A fresh reviewer always finds something, and scores drift by about 0.5 with no change in quality. Do not treat that as a regression.

## Documents

- **Rubric lens:** can a scorer tick every criterion, in the criterion's own words?
- **Accuracy lens:** every number and claim traced to code, a test run or a source. Any invented fact is blocking.
- **Security lens:** read as a privacy specialist. Overclaims are blocking.

## Prototype

Run on the public link, signed out. Return `{approved, bugs[], tested_count}`. Follow the stop rule in `references/figma-prototype.md`.

## Video

Check first: the file is newer than the source and its length matches the timeline. If not, stop and report a stale render.

Run ffprobe. Extract 5 fps contact sheets. Look at all of them.

1. **Animation and visual.** Blocks only on defects: clipping, cropped text, collisions, stale frames, broken edits, wrong screen, overlays on faces. "Not Pixar" and "stylized" are polish, never blocking. This lens did not pass in 27 verdicts on the worked example, because reviewers were held to the wrong bar.
2. **Premiere judge.** A skeptical contest judge. Is the story clear in the first 10 seconds? Does it drag? Same blocking limit as lens 1.
3. **Story, audio and captions.** Must have zero blocking. Caption sync, mix, VO fragments, pacing, the cause and effect of each feature.
4. **Product accuracy and ethics.** Must score 8.5 or higher with zero blocking. Checked against the product truth files. Every on-screen claim true or labeled. This is the lens that gates a contest entry.

Do not gate on LRA or on the animation and premiere scores.

**Caps:** 2 fix-and-review rounds, then a human watches. Stop early if scores move less than 0.3. On round 2, a small budget can keep only lenses 3 and 4.
