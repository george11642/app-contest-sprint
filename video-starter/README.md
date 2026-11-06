# Hybrid film starter

A Remotion project for a 16:9 hybrid demo film: animated 3D vignettes, real app footage in device frames, word-by-word captions, ElevenLabs narration, synthesized music and SFX, an architecture beat, a team beat and an end card. It renders a 38 s sample film out of the box, with no API keys.

The app in the sample ("Lantern") and its people are fictional. So are its numbers. Replace everything.

Full method: `skills/app-contest-sprint/references/video-hybrid.md`.

## Requirements

node 20+, python3 with numpy, ffmpeg. Remotion downloads its own headless Chrome on first render. Network is needed for fonts.

## Commands

```sh
npm install
npm run setup        # bakes animations, synthesizes audio, builds a scratch VO. About 30 s
npm run check        # tsc plus a lint of content/beats.json
npm run studio       # live preview
node scripts/stills.mjs out/chk/a 1 8 f:300     # half-size stills, by second or f:frame
npm run clip -- --frames=0-150                   # short clip to out/clip.mp4
npm run render:final                             # render, normalize, measure, write out/final.mp4
```

`render:final` exits 1 while the film uses the scratch VO. That is on purpose: the mumble track must never ship.

## Make it yours

1. Put real footage in `public/footage/` and screens in `public/screens/`.
2. Edit `content/beats.json`: `brand`, `voice`, `music`, and one entry per narration line. Use `content/README.md` for the format.
3. `npm run vo:scratch` to time the script for free. Listen to `raw/animatic.wav`.
4. Generate the real voice:
   ```sh
   export ELEVENLABS_API_KEY=...          # never commit or print it
   python3 scripts/vo.py gen              # spends characters. Ledger in raw/vo/. Cap 3,500; ELEVEN_CAP changes it
   npm run vo:build
   ```
5. Add a case to `Render` in `src/hybrid/Hybrid.tsx` for any scene the JSON cannot express.
6. `npm run render:final`, then open every sheet in `out/sheets/`.

## Layout

| Path | What |
|---|---|
| `content/beats.json` | Source of truth: narration, shots, sound |
| `content/timeline.json`, `caption_onsets.json` | Generated. Do not edit |
| `src/hybrid/` | Composition, cut list, 2D templates, data-driven 3D vignette, captions, device frame |
| `src/kit3d/` | 3D kit: cast, poses, sets, camera, props. See its README |
| `scripts/vo.py` | `scratch`, `gen`, `build` |
| `scripts/eleven_tts.py` | ElevenLabs call with a character ledger and hard cap |
| `scripts/vo_splice.py` | Re-voice one sentence and splice |
| `scripts/timeline.py`, `fix_timing.py` | Timeline, late-word fixes, caption onsets, fragment fades |
| `scripts/synth_audio.py`, `beds.sh` | Music and SFX, and bed pre-looping |
| `scripts/check_beats.py`, `check_captions.py`, `check_final.sh` | Lint, caption check, acceptance checks |
| `scripts/stills.mjs`, `contact_sheet.sh` | Stills and contact sheets |
| `scripts/bake_ual.mjs`, `bake_all.sh` | Retarget animation clips onto the rigs |

`remotion.config.ts` sets `--gl=angle`, which the 3D scenes need in headless mode. See `LICENSES.md`: the CC-BY credit stays on the end card.
