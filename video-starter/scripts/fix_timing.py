#!/usr/bin/env python3
"""Fix ElevenLabs alignment against the measured audio. Run after timeline.py, before building picture.

  python3 scripts/fix_timing.py [--write]

1. Late sentence-final words: the aligner parks them inside the trailing pause. Pull them back onto the speech.
2. Caption onsets: after a pause the aligner runs 150 to 250 ms late. Writes content/caption_onsets.json.
   This affects captions only; cut timing stays put.
3. Clipped fragments before an inserted digital-zero gap: fade them out. Originals go to raw/vo/prefrag/.
"""
import json, os, pathlib, re, shutil, subprocess, sys
import numpy as np
ROOT = pathlib.Path(__file__).resolve().parents[1]
SR = 44100
WRITE = "--write" in sys.argv
TL = ROOT / "content/timeline.json"
t = json.load(open(TL))
placeholder = json.load(open(ROOT / "public/vo/manifest.json")).get("placeholder", False)

def silences(path, d):
    e = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", f"silencedetect=noise=-40dB:d={d}", "-f", "null", "-"], capture_output=True, text=True).stderr
    return [float(x) for x in re.findall(r"silence_start: ([\d.]+)", e)], [float(x) for x in re.findall(r"silence_end: ([\d.]+)", e)]

voiced = [b for b in t["beats"] if b["file"]]
moved = 0
for b in voiced:
    ss, se = silences(ROOT / "public" / b["file"], 0.1)
    sil = [(b["startSec"] + a, b["startSec"] + (se[i] if i < len(se) else 1e9)) for i, a in enumerate(ss)]
    ws = b["words"]
    for i in range(1, len(ws)):
        wd, prev = ws[i], ws[i - 1]
        for a, z in sil:
            if a - 0.06 <= wd["start"] < z - 0.05 and a > prev["end"] + 0.1:
                ns, ne = round(prev["end"] + 0.06, 3), round(a, 3)
                if ne - ns > 0.08:
                    print(f"late word {b['id']} {wd['word']}: {wd['start']:.2f} -> {ns:.2f}")
                    wd["start"], wd["end"] = ns, ne; moved += 1
                break

onsets, n = {}, 0
for b in voiced:
    _, se = silences(ROOT / "public" / b["file"], 0.08)
    ends = [b["startSec"] + x for x in se]
    ws = b["words"]
    for i, wd in enumerate(ws):
        prev_start = ws[i - 1]["start"] if i else b["startSec"] - 1
        cands = [e for e in ends if wd["start"] - 0.4 <= e <= wd["start"] + 0.06 and e >= prev_start + 0.12]
        if cands and wd["start"] - max(cands) > 0.04:
            onsets.setdefault(b["id"], {})[str(i)] = round(max(cands), 3); n += 1

def load(p):
    return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout, np.float32).copy()
def db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)

frags = 0
if not placeholder:
    for b in voiced:
        p = ROOT / "public" / b["file"]
        x = load(p)
        zero = np.abs(x) < 1e-4
        runs, i, N = [], 0, len(x)
        while i < N:
            if zero[i]:
                j = i
                while j < N and zero[j]: j += 1
                if j - i > 0.15 * SR: runs.append((i, j))
                i = j
            else:
                i += 1
        fixes = []
        win = int(0.01 * SR)
        for a, _ in runs:
            if a < 0.05 * SR: continue
            k, qs = a, None
            while k > a - int(0.32 * SR) and k > win:
                if db(x[k - win:k]) < -40 and db(x[max(0, k - int(0.06 * SR)):k]) < -38:
                    qs = k; break
                k -= win
            if qs is not None and a - qs > 0.02 * SR and db(x[qs:a]) > -45:
                fixes.append((qs, a))
        for s, e in fixes:
            print(f"fragment {b['id']}: {s/SR:.3f}-{e/SR:.3f}")
            frags += 1
        if fixes and WRITE:
            bk = ROOT / "raw/vo/prefrag" / f"{b['id']}.mp3"
            bk.parent.mkdir(parents=True, exist_ok=True)
            if not bk.exists(): shutil.copy(p, bk)
            f = int(0.01 * SR)
            for s, e in fixes:
                s0 = max(0, s - f)
                x[s0:s] *= np.linspace(1, 0, s - s0)
                x[s:e] = 0
            tmp = str(p) + ".tmp.wav"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", tmp], input=x.tobytes(), check=True)
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-codec:a", "libmp3lame", "-b:a", "192k", str(p)], check=True)
            os.remove(tmp)

if WRITE:
    json.dump(t, open(TL, "w"), indent=1, ensure_ascii=False)
    json.dump(onsets, open(ROOT / "content/caption_onsets.json", "w"), indent=1)
print(f"late words {moved}, caption onsets {n}, fragments {frags}{'' if WRITE else ' (dry run, pass --write)'}")
