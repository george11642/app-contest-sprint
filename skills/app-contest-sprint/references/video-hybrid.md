# Hybrid demo video

Claude Code on an Opus model only. On Codex, stop and write the handoff. See [agent-routing.md](agent-routing.md).

**Run this only for finalists,** after the email is sent and the finalist notice has arrived. The technical submission needs no video. Between the email and the notice, capture footage and fill in the handoff at most.

**The format is fixed:** 16:9, 1920×1080, 30 fps. Animated 3D scenario vignettes, real app footage in device frames, word-by-word captions, human ElevenLabs narration, code-synthesized music and SFX, an architecture beat, a team beat, a strong close.

## Set expectations first

Tell the team:

- **Budget 2 to 3 calendar days on a limited plan,** with at least one session-limit stop. The uncapped worked example used 908,637 output tokens and about 927M cache-read tokens across two films, and hit session limits three times. A capped single film from this starter should be about a tenth to a fifth of that. That is an estimate, not a measurement.
- **It will read as stylized 3D, not Pixar.** 12 review panels never moved the animation score above 6.8 or the premiere score above 7.2. More rounds did not raise scores after about the third panel.
- **The film is about 2:30 and the talk is 8:00.** Embed a 30 to 60 s cut in the deck. Keep the full film as backup.

## Fetch the starter

`npx skills add` copies only the skill folder. The starter lives at the root of the skill repo.

```sh
git clone --depth 1 https://github.com/george11642/app-contest-sprint /tmp/acs
cp -R /tmp/acs/video-starter ./video     # check that ./video does not exist first
cd video && npm install && npm run setup
```

Requires node 20+, python3 with numpy, ffmpeg. Setup bakes animations, synthesizes audio, and builds a scratch VO. No API key is needed until you generate narration. `video-starter/README.md` lists the commands.

Add to the team's `.gitignore`: `video/node_modules/`, `video/out/`, `video/raw/`. Read `LICENSES.md`. The CC-BY credit stays on the end card.

Keep `video/STATE.md`: last render path and commit, last panel verdicts, open blockers, ledger total. One film, one writer. Do not let two sessions share this tree.

## Pipeline

1. **Capture real footage first.** Everything that proves the app comes from this. Fix the status-bar clock, day and night consistency, demo names and on-screen strings before recording. Patching later cost rounds, and a patched string left a ghost in the final cut. Save to `public/footage/` and `public/screens/`. Scan recordings for blank frames.
2. **Write the beat sheet.** `content/beats.json` is the source of truth: narration, shots, sound cues. Use the template below. Decide staging rules before writing for any sensitive topic. Lock VO length to the template budget now.
3. **Audio-only review.** `npm run vo:scratch`, then review the script and `raw/animatic.wav` with the panel. This is the cheapest review in the pipeline.
4. **Voice.** Audition 3 voices on one hook line. Set `voice` in beats.json and confirm the voice and model still exist. Check ElevenLabs free-tier licensing and attribution terms for this use; they were not checked on the worked example. The team sets `ELEVENLABS_API_KEY`. Never print it. Then:
   ```sh
   python3 scripts/vo.py gen        # spends characters. Ledger cap 3,500; ELEVEN_CAP changes it
   npm run vo:build                 # free: pauses, loudness, manifest, timeline, timing fixes, beds
   ```
   Spend check: about 2,100 characters of final text in the worked example. Retry a failed call once at most. Re-voice one sentence, then splice, instead of a whole line:
   ```sh
   python3 scripts/vo.py gen b05    # new take, then:
   python3 scripts/vo_splice.py OUT.mp3 SRC1.mp3:^:"end text" SRC2.mp3:"start text":$ --gap 0.3
   ```
   A human listens for team names. No agent can settle pronunciation.
5. **Cast and sets.** Pick cast slots in `src/kit3d/gltf/cast.ts` and check them in the `GltfLab` composition. Use the rigged GLBs from the start. Do not model characters.
6. **Build picture.** Every shot starts from a VO word in beats.json, so re-timing moves all cuts. For a scene the JSON cannot express, write a component and add a case to `Render` in `src/hybrid/Hybrid.tsx`. Drive everything from the frame number. No `Math.random`, no clock.
7. **Verify with stills while working.** Render only at checkpoints.
   ```sh
   node scripts/stills.mjs out/chk/a 12.5 40 f:1320
   npm run check
   npx remotion render src/index.ts Hybrid out/test.mp4 --frames=300-420 --codec=h264 --crf=18
   ```
   `remotion.config.ts` sets `--gl=angle`, which 3D needs in headless mode.
8. **Full render and finish.** `npm run render:final` renders, normalizes, measures, and writes `out/final.mp4` only on success. Run it in the foreground or poll until exit. Commit after each render.
9. **Look at it.** `check_final.sh` writes 5 fps contact sheets to `out/sheets/`. Open every sheet. A render is not finished until someone has.
10. **Review, within the caps below.** Then a human watches with the sound on.
11. **Cut the deck clip.** Render a 30 to 60 s cut for the slot, or trim with ffmpeg, then H.264 + AAC at 1080p.

## Beat template

From the final cut. Scale to your length. Target 2:15 to 2:40.

| Time (s) | Len | Beat | Medium | [SafetySense example] |
|---|---|---|---|---|
| 0.0 | 5.6 | **Cold open: the situation, stakes visible at frame 0** | 3D, letterboxed | Night walk, she freezes |
| 5.6 | 1.2 | **Smash cut to the product acting** | Real UI full frame | Alert screen |
| 6.8 | 1.1 | Payoff in the world | 3D | City map, phones ringing |
| 7.9 | 0.8 | Brand sting | 2D sticker | Logo slam |
| 8.7 | 7.1 | Problem: why existing tools fail | Type, then 3D insert | "Apps wait for a button" |
| 15.8 | 6.5 | **The one hero stat** | Count-up card with citation and a push-in | Sourced % with n |
| 22.3 | 8.3 | Three barriers, one shot each | 3D, 3D, card | |
| 30.6 | 3.8 | Meet the app, tagline | Logo plus device | Hit on the name after 0.5 s of silence |
| 34.4 | 9.5 | How you start | Real screens, 3D insert | Modes, triggers |
| 43.9 | 11.9 | Core capability | 3D, then real footage | |
| 55.8 | 13.9 | Steps 1 and 2 of the flow | Real, 3D cutaway, 3D, real | |
| 69.7 | 7.7 | What the other side sees | 3D blip, real page | Live link |
| 77.4 | 10.4 | Step 3, the big promise, honest disclosure | Real footage, 2 s 3D insert | "Simulated" label |
| 87.8 | 8.7 | **The twist nobody expects** | 2.4 s 3D with no VO, then real UI | Second PIN |
| 96.5 | 7.8 | Failure mode handled | 3D hit, motion graphic | Server notices |
| 104.3 | 3.9 | Secondary feature | 3D, real | |
| 108.2 | 13.4 | Trust and privacy | 3D, then animated claim cards | |
| 121.6 | 7 to 8 | **Architecture beat** | Node diagram synced to VO, packets on each named edge | The worked example ran 13.5 s, too long |
| 135.1 | 9.9 | **Team beat** | Names land first, app as b-roll | Name, major, school |
| 145.0 | 5.6 | Resolution, 2.6 s with no VO | 3D, characters smile | |
| 150.6 | 8.8 | **Strong close**: tagline, disclaimer, resources, credits | End card with continuous motion | Holds 4.5 s or more fully readable |

Rules that held up:

- Pattern for each feature: **3D cause, then real app effect,** a new beat every 3 to 5 s.
- Put a 1 to 2 s 3D cutaway in every 20 s window. The loudest pacing complaint was a stretch that "collapses into a slide deck".
- Silence is a tool: drain everything about 0.45 s before a hard cut, and land the hit on the cut.
- Target about 155 wpm and 26% 3D screen time.

## Narration

- Short sentences. Second person or a named fictional character.
- `tts` may spell out numbers or hold direction tags, while `vo` stays as displayed.
- If an on-screen claim needs a number, take it from the product truth file.

## Captions

- Words animate by opacity and color only. Per-word scale made the line jitter.
- Chunks are up to 7 words or 44 characters, cleared at each section cut.
- One baseline for the whole film.
- One mute rule: hide a sentence's caption only as a whole (`noCaption`), and only when on-screen type quotes it verbatim.
- ElevenLabs alignment runs late after pauses. `fix_timing.py` corrects it from measured silence. It runs inside `npm run vo:build`.
- Whisper on the final mix is the acceptance check: `python3 scripts/check_captions.py out/final.mp4` with `OPENAI_API_KEY` set. Otherwise a human checks sync.

## 3D direction

- Frame heroes at medium distance. Close-ups exposed every limit. Moving to medium fixed more than any shader.
- If a hand fails in close-up, remove it. Use `PhoneInsert`, a phone alone with a glow.
- The women in the pack share one face. Keep secondary characters far from camera, or use a different rig.
- Avoid top-down and rear cameras on heads. A camera change is cheaper than a mesh change.
- The tone lock in `cast.ts` keeps a character the same person under any lighting.
- Build sitting from the kit pose. The UAL sitting clip splayed the legs.
- A soft contact shadow stops the floating look; `Actor` adds one.
- Cameras can end up inside heads. Hide obstructing objects instead of squeezing the shot.
- No postprocessing library for depth of field. The kit fakes it.

## Overlays and motion

- One overlay at a time. Three large HUD elements at most.
- Fixed bands: title-safe 5%, caption band, sticker band. Nothing in the face zone.
- A move must not push text out of title-safe. Cap zoom at about 1.3x and check at the end of the move.
- Phone frames stay fully in frame unless the crop is obviously deliberate.
- Hard cuts on the beat. Push-through zooms of 4 frames or less from 3D to UI. No crossfades between shots: they read as ghosted double exposures.
- No dips to near black. No solid full-frame flashes: they read as dropouts and can be a photosensitivity risk.
- Remove any card that lives under 0.5 s. `npm run check` catches this.
- Every 2D section needs slow motion. Reviewers want a change every 3 to 5 s. The end card pushes continuously.

## Audio

- `synth_audio.py` makes 25+ SFX and 4 beds with numpy. No downloads, no licensing questions. Add functions for sounds your story needs.
- Beds must be pre-looped (`scripts/beds.sh`). A looped `<Audio>` breaks per-frame volume after the first loop.
- Volume curves are quantized to 0.04 steps, or Remotion's ffmpeg expression overflows.
- Targets: -16 LUFS integrated, -1.5 dBTP, music about 7 dB under VO, extra duck 3.5 to 4.4 dB under dense lines.
- Do not gate on LRA. It barely moves with continuous VO.
- Rings and buzzes mask VO at 1 to 4 kHz. Keep them low under lines.
- If hits push the raw render to 0 dBFS, limit first: `-af "aresample=192000,alimiter=limit=0.79:attack=1:release=60:level=false,aresample=48000"`.

## Product truth

Agents invent UI to make a beat work. In the worked example the film showed a flow the app lacked, a server alarm at 58 s when the real timing was about 3 minutes, and a push that was really an SMS.

- Every on-screen claim must match the spec and the app, or change the app first.
- Label simulations from the first frame of that beat. Label time skips and sped-up footage at a readable size.
- Stat cards: exact wording, sample size, year, citation and DOI at a readable size.
- Check demo data: no contact sharing the protagonist's name, no daytime status bar in a night story.
- Label dramatization: "Dramatization · fictional characters".
- Sensitive topics: decide staging rules up front. **[SafetySense example]** No harm shown, cut away before contact, the threat is never staged, no scream audio, neutral silhouettes, no blaming wording, no voyeuristic angles, a verified hotline on the end card.

## Review caps

Use the rubric in [assets/review-panel-rubric.md](../assets/review-panel-rubric.md).

- **Maximum 2 fix-and-review rounds,** then a human watches. Stop early if scores move less than 0.3.
- Must pass: accuracy 8.5 or higher with zero blocking, story and audio with zero blocking, `check_final.sh` clean.
- Animation and premiere block only on defects. "Not Pixar" is polish.
- Do not give reviewers Pixar-grade references. Tell them the ceiling, and list accepted items so they are not raised again.
- Before review, confirm the file is newer than the source and its length equals the timeline. `check_final.sh` does this. Two whole rounds were lost reviewing stale renders.

## Stop conditions

Stop and tell the humans when any of these holds:

- Two rounds are done. Report open items honestly, and let a person choose.
- The ElevenLabs ledger is near its cap and the fix needs new VO. Ask before spending.
- A session limit hits. Do not fan out. Wait for the reset, then resume from `video/STATE.md`. In the worked example 276 agents died instantly at limits.
- The deck deadline is under 24 hours away. Ship the best render, then finish the deck.
- A claim in the film cannot be verified. Cut it.

Long renders survive agent death if detached and logged. Check the log before re-rendering. Fonts need network at render time, so confirm one render while online.

## Do not imitate

Open items in the worked example's final cut: shared faces across women, a VO claim with nothing on screen to match, a 2-frame solid flash, a 4-frame leftover card, a prop mismatch between shots, a caption over a key object, a static end card with small credits, a mid-film stretch with no 3D, a patched string with a ghost, and a day and night clock mismatch.
