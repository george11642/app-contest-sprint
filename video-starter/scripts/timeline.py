#!/usr/bin/env python3
"""Build content/timeline.json from content/beats.json + public/vo/manifest.json. Also writes raw/animatic.wav.
Run scripts/fix_timing.py after this. Notes belong in beats.json `note`; this script only writes generated files."""
import json, pathlib, subprocess
ROOT = pathlib.Path(__file__).resolve().parents[1]
film = json.load(open(ROOT / "content/beats.json"))
man = {e["id"]: e for e in json.load(open(ROOT / "public/vo/manifest.json"))["clips"]}
t, tl = 0.0, []
for b in film["beats"]:
    t += b.get("gapBefore", 0.0)
    start = round(t, 3)
    e = man.get(b["id"])
    if b.get("vo"):
        if not e or e["text"] != b["vo"]:
            raise SystemExit(f"{b['id']}: the VO text changed. Re-voice it, or run npm run vo:scratch for picture work.")
        d = e["durationSec"]
        words = [{"word": w["word"], "start": round(start + w["start"], 3), "end": round(start + w["end"], 3)} for w in e["words"]]
        tl.append({"id": b["id"], "file": e["file"], "startSec": start, "durationSec": d, "highlight": b.get("highlight", ""), "words": words})
    else:
        d = b.get("holdSec", 1.0)
        tl.append({"id": b["id"], "file": None, "startSec": start, "durationSec": d, "highlight": "", "words": []})
    t += d
total = round(t + film.get("endHoldSec", 5.0), 2)
json.dump({"totalSec": total, "beats": tl}, open(ROOT / "content/timeline.json", "w"), indent=1, ensure_ascii=False)
# audio-only animatic: review this before any picture exists, it is the cheapest review in the pipeline
voiced = [b for b in tl if b["file"]]
if voiced:
    (ROOT / "raw").mkdir(exist_ok=True)
    inputs, filt = [], []
    for k, b in enumerate(voiced):
        ms = int(b["startSec"] * 1000)
        inputs += ["-i", str(ROOT / "public" / b["file"])]
        filt.append(f"[{k}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={ms}|{ms}[a{k}]")
    filt.append("".join(f"[a{k}]" for k in range(len(voiced))) + f"amix=inputs={len(voiced)}:normalize=0:duration=longest,atrim=0:{total}[out]")
    subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(filt), "-map", "[out]", str(ROOT / "raw/animatic.wav")], check=True)
print(f"timeline: {len(tl)} beats, {total:.1f} s. Animatic: raw/animatic.wav")
