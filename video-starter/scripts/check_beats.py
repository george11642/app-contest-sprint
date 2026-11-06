#!/usr/bin/env python3
"""Lint content/beats.json against content/timeline.json. Exit 1 on errors. Warnings are things a human should judge."""
import json, pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
film = json.load(open(ROOT / "content/beats.json"))
tl = {b["id"]: b for b in json.load(open(ROOT / "content/timeline.json"))["beats"]}
total = json.load(open(ROOT / "content/timeline.json"))["totalSec"]
FPS = 30
err, warn = [], []
norm = lambda s: re.sub(r"[^a-z0-9%'-]", "", s.lower())
def word_frame(bid, word, n=0):
    hits = [w for w in tl[bid]["words"] if norm(w["word"]) == norm(word)]
    if len(hits) <= n:
        err.append(f'{bid}: word "{word}" is not in the VO')
        return round(tl[bid]["startSec"] * FPS)
    return round(hits[n]["start"] * FPS)
def beat_end(bid):
    b = tl[bid]
    return round((b["words"][-1]["end"] if b["words"] else b["startSec"] + b["durationSec"]) * FPS)
def at(ref, owner):
    b0 = round(tl[owner]["startSec"] * FPS)
    if ref is None or ref == "start": return b0
    if ref == "end": return beat_end(owner)
    if isinstance(ref, (int, float)): return b0 + round(ref * FPS)
    if isinstance(ref, str): return word_frame(owner, ref)
    bid = ref.get("beat", owner)
    if bid not in tl:
        err.append(f"{owner}: reference to unknown beat {bid}")
        return b0
    base = word_frame(bid, ref["word"], ref.get("n", 0)) if ref.get("word") else beat_end(bid) if ref.get("end") else round(tl[bid]["startSec"] * FPS)
    return base + ref.get("frames", 0)

ids = [b["id"] for b in film["beats"]]
if len(ids) != len(set(ids)): err.append("duplicate beat ids")
shots = []
for b in film["beats"]:
    if b["id"] not in tl:
        err.append(f"{b['id']} is missing from the timeline. Run npm run vo:scratch.")
        continue
    for s in b.get("shots", []):
        shots.append((at(s.get("at"), b["id"]), s, b["id"]))
        for it in s.get("items", []) + s.get("nodes", []) + s.get("edges", []) + s.get("people", []):
            if "at" in it: at(it["at"], b["id"])
    for c in b.get("sfx", []):
        if "at" in c: at(c["at"], b["id"])
        if not (ROOT / f"public/sfx/{c['file']}.wav").exists():
            err.append(f"{b['id']}: sfx {c['file']} does not exist")
for m in film.get("music", []):
    at(m["from"], ids[0]); at(m["to"], ids[0])
shots.sort(key=lambda x: x[0])
names = [s["id"] for _, s, _ in shots]
if len(names) != len(set(names)): err.append("duplicate shot ids")
end = round(total * FPS)
last3d = None
for i, (f, s, bid) in enumerate(shots):
    to = shots[i + 1][0] if i + 1 < len(shots) else end
    if to - f < 15 and not (s["type"] == "brand"):
        err.append(f"shot {s['id']} lives {to - f} frames. Remove any card under 0.5 s.")
    if s["type"] == "vignette":
        if last3d is not None and (f - last3d) / FPS > 20:
            warn.append(f"{(f - last3d) / FPS:.1f} s with no 3D before {s['id']}. Add a 1 to 2 s cutaway so it does not read as a slide deck.")
        last3d = to
    if s["type"] == "architecture" and (to - f) / FPS > 9:
        warn.append(f"architecture beat runs {(to - f) / FPS:.1f} s. Target is 7 to 8 s.")
    if s["type"] == "end" and (to - f) / FPS < 6:
        warn.append(f"end card is {(to - f) / FPS:.1f} s. Everything must hold fully readable for at least 4.5 s.")
    scr = s.get("screen") or {}
    if scr.get("sample"): warn.append(f"shot {s['id']} still uses a sample screen, not real app footage")
    if s["type"] == "stat" and ("placeholder" in json.dumps(s).lower() or "sample" in json.dumps(s).lower()):
        warn.append(f"shot {s['id']} is a placeholder stat. Use a sourced number with citation or cut it.")
if not any(s["type"] == "end" for _, s, _ in shots): err.append("no end card, and the end card carries the required CC-BY credit")
if json.load(open(ROOT / "public/vo/manifest.json")).get("placeholder"): warn.append("VO is the scratch mumble track")
for x in warn: print("warn:", x)
for x in err: print("ERROR:", x)
print(f"{len(shots)} shots, {total:.1f} s, {len(err)} errors, {len(warn)} warnings")
sys.exit(1 if err else 0)
