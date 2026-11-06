# content/beats.json

```jsonc
{
  "title": "Internal name",
  "brand": { "app": "Name", "tagline": "Line", "accent": "#hex", "calm": "#hex", "captionHi": "#hex", "icon": "img/icon.png" },
  "voice": { "id": "ElevenLabs voice id", "model": "ElevenLabs model id" },
  "endHoldSec": 5,                     // silence after the last line
  "music": [ { "file": "tension_loop", "from": { "beat": "b01" }, "to": { "beat": "b05" }, "level": 0.7 } ],
  "beats": [ { /* one per narration line, in order */ } ]
}
```

Confirm the voice and model still exist before you generate. The sample values are defaults, not a recommendation.

## A beat

| Field | Meaning |
|---|---|
| `id` | Unique, used in file names |
| `vo` | Narration as shown in captions. Leave it out for a beat with no VO, and set `holdSec` |
| `tts` | What the voice reads, when it differs (numbers spelled out, direction tags) |
| `gapBefore` | Seconds of pause before the beat |
| `highlight` | Words colored in captions. Separate phrases with ` · ` |
| `noCaption` | Hide captions. Only when on-screen type repeats the whole sentence |
| `note` | Notes for humans and reviewers. Not rendered |
| `shots` | Shots that start in this beat |
| `sfx` | `{ file, at, vol, dur, fadeOut, loop }`, with `file` a name from `public/sfx/` |

## Time references

Any `at` accepts:

- `"start"` or `"end"` of the owning beat
- a word in the owning beat: `"Door"` (ignores case and punctuation)
- seconds after the beat start: `1.5`
- `{ "beat": "b05", "word": "free", "n": 0, "frames": -3 }`, or `{ "beat": "b05", "end": true }`

A shot runs until the next shot starts, so a re-voice moves every cut.

## Shot types

All shots take `id`, `at`, `tag` (a top-left label such as "Simulated"), `tagColor`, `letterbox`, `drift`, `pushIn`, `pushOut`.

| `type` | Fields |
|---|---|
| `vignette` | `set` (campus, dorm, party, city, studio, street), `actors`, `cam: { from, to, handheld }`, `dim`, `map`, `faceKey` |
| `device` | `screen`, `kicker`, `headline`, `body`, `side` |
| `brand` | none |
| `claims` | `chapter`, `title`, `items: [{ text, at }]` |
| `stat` | `chapter`, `kicker`, `value`, `suffix`, `label`, `citation`, `doi`, `countAt` |
| `architecture` | `chapter`, `zones`, `nodes`, `edges`, `banner` |
| `team` | `chapter`, `people: [{ name, detail, role, at }]`, `screen` |
| `end` | `headline`, `subhead`, `notice`, `resources`, `team` |

`screen` is `{ "src": "screens/home.png" }`, `{ "video": { "src": "footage/take.mp4", "trimBefore": 90 } }`, or `{ "sample": {...} }` for a placeholder.

An actor is `{ cast, at: [x, z], to: [x, z], rotY, clips: [{ anim, start }], hold, face }`. Clip starts are seconds from the shot's first frame. Types are in `src/hybrid/types.ts`. Run `npm run check` after every edit.
