#!/usr/bin/env python3
"""Narration pipeline. Reads lines from content/beats.json.

  python3 scripts/vo.py scratch       # free: mumble track at 155 wpm so timing and picture work with no API key
  python3 scripts/vo.py gen [ids...]  # spends ElevenLabs characters. Check the ledger first.
  python3 scripts/vo.py build         # free: pause tightening, loudness, manifest

Raw takes: raw/vo/<id>.mp3 + .align.json   Final: public/vo/<id>.mp3 + public/vo/manifest.json
"""
import difflib, json, pathlib, re, subprocess, sys, tempfile
import numpy as np

ROOT = pathlib.Path(__file__).resolve().parents[1]
FILM = json.load(open(ROOT / "content/beats.json"))
SR = 44100
MAX_PAUSE = 0.40
TAIL = 0.15

def lines():
    return [b for b in FILM["beats"] if b.get("vo")]

def clean(word):
    return re.sub(r"[^a-z0-9]", "", word.lower())

# ------------------------------------------------------------------ scratch
def scratch():
    rng = np.random.default_rng(7)
    out_dir = ROOT / "public/vo"
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest = []
    for l in lines():
        t, chunks, words = 0.0, [], []
        pitch = 118 + 10 * rng.random()
        for tok in l["vo"].split():
            n = max(2, len(clean(tok)))
            d = 0.07 + 0.05 * n
            x = np.arange(int(d * SR)) / SR
            voiced = sum(np.sin(2 * np.pi * pitch * k * x) / k for k in range(1, 7))
            syll = max(1, n // 3)
            env = np.sin(np.pi * x / d) * (0.55 + 0.45 * np.abs(np.sin(np.pi * syll * x / d)))
            chunks.append(voiced * env * 0.22)
            words.append({"word": tok, "start": round(t, 3), "end": round(t + d, 3)})
            t += d
            gap = 0.30 if tok[-1] in ".!?" else 0.16 if tok[-1] in ",;:" else 0.035
            chunks.append(np.zeros(int(gap * SR)))
            t += gap
        y = np.concatenate(chunks).astype(np.float32)
        dst = out_dir / f"{l['id']}.mp3"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "libmp3lame", "-b:a", "128k", str(dst)],
                       input=y.tobytes(), check=True)
        manifest.append({"id": l["id"], "file": f"vo/{l['id']}.mp3", "durationSec": round(len(y) / SR, 3), "text": l["vo"], "spoken": l["vo"], "words": words})
    (out_dir / "manifest.json").write_text(json.dumps({"placeholder": True, "clips": manifest}, indent=1, ensure_ascii=False))
    print(f"scratch: {len(manifest)} clips, {sum(m['durationSec'] for m in manifest):.1f} s. This is a mumble track, not narration.")

# ------------------------------------------------------------------ ElevenLabs
def gen(ids):
    L = lines()
    v = FILM["voice"]
    for i, l in enumerate(L):
        if ids and l["id"] not in ids:
            continue
        cmd = ["python3", str(ROOT / "scripts/eleven_tts.py"), "--voice", v["id"], "--model", v["model"], "--text", l.get("tts", l["vo"]),
               "--out", str(ROOT / f"raw/vo/{l['id']}.mp3"), "--note", l["id"],
               "--stability", str(l.get("stability", 0.5)), "--style", str(l.get("style", 0.3))]
        if i > 0:
            cmd += ["--prev", L[i - 1].get("tts", L[i - 1]["vo"])]
        if i + 1 < len(L):
            cmd += ["--next", L[i + 1].get("tts", L[i + 1]["vo"])]
        r = subprocess.run(cmd, capture_output=True, text=True)
        print(r.stdout.strip() or r.stderr.strip()[-300:])
        if r.returncode:
            sys.exit(1)

def strip_tags(chars, starts, ends):
    """Drop ElevenLabs audio tags like [softly] (and the space after them) from the character alignment."""
    out, depth = [], 0
    for c, a, b in zip(chars, starts, ends):
        if c == "[": depth += 1; continue
        if c == "]": depth = max(0, depth - 1); continue
        if depth: continue
        out.append((c, a, b))
    while out and out[0][0].isspace(): out.pop(0)
    return [o[0] for o in out], [o[1] for o in out], [o[2] for o in out]

def words_from_chars(chars, starts, ends):
    chars, starts, ends = strip_tags(chars, starts, ends)
    out, cur, ws, we = [], "", None, None
    for c, a, b in zip(chars, starts, ends):
        if c.isspace():
            if cur:
                out.append({"word": cur, "start": ws, "end": we}); cur = ""
            continue
        if not cur:
            ws = a
        cur += c; we = b
    if cur:
        out.append({"word": cur, "start": ws, "end": we})
    return out

def map_display(display, tw):
    """Map display tokens (e.g. '70%') onto timed TTS words (e.g. 'seventy percent')."""
    dt = display.split()
    sm = difflib.SequenceMatcher(a=[clean(w) for w in dt], b=[clean(w["word"]) for w in tw], autojunk=False)
    res = []
    for op, a0, a1, b0, b1 in sm.get_opcodes():
        if op == "equal":
            for k in range(a1 - a0):
                res.append({"word": dt[a0 + k], "start": tw[b0 + k]["start"], "end": tw[b0 + k]["end"]})
        elif a1 > a0:
            if b1 > b0:
                t0, t1 = tw[b0]["start"], tw[b1 - 1]["end"]
            else:
                t0 = t1 = res[-1]["end"] if res else (tw[0]["start"] if tw else 0)
            n = a1 - a0
            for k in range(n):
                res.append({"word": dt[a0 + k], "start": t0 + (t1 - t0) * k / n, "end": t0 + (t1 - t0) * (k + 1) / n})
    return [{"word": w["word"], "start": round(w["start"], 3), "end": round(w["end"], 3)} for w in res]

def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)]))

def measure_i(path):
    e = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float([l for l in e.splitlines() if l.strip().startswith("I:")][-1].split()[1])

def loudnorm(src, dst, target=-16.0):
    """Static gain plus a peak limiter. ffmpeg's loudnorm goes dynamic on short clips, so measure instead."""
    g = target - measure_i(src)
    for _ in range(2):
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-af", f"volume={g:.2f}dB,alimiter=limit=0.84:attack=2:release=40:level=disabled,aresample=44100",
                        "-c:a", "libmp3lame", "-b:a", "192k", str(dst)], check=True)
        err = target - measure_i(dst)
        if abs(err) < 0.3: break
        g += err

def decode(p):
    return np.frombuffer(subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(p), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]), dtype=np.float32).copy()

def tighten(x, max_pause, thresh_db=-45.0):
    """Shorten long internal pauses (soft knee, 8 ms crossfade) and trim the tail. Returns (audio, remap)."""
    win = int(0.01 * SR)
    n = len(x) // win
    rms = np.sqrt(np.mean(x[: n * win].reshape(n, win) ** 2, axis=1) + 1e-12)
    quiet = 20 * np.log10(rms) < thresh_db
    voiced = np.where(~quiet)[0]
    if len(voiced) == 0:
        return x, (lambda t: t)
    first, last = voiced[0], voiced[-1]
    cuts, i = [], first
    while i <= last:
        if quiet[i]:
            j = i
            while j <= last and quiet[j]:
                j += 1
            d = (j - i) * win / SR
            if d > max_pause:
                keep = int((max_pause + 0.3 * (d - max_pause)) / 2 * SR)
                if j * win - keep > i * win + keep:
                    cuts.append((i * win + keep, j * win - keep))
            i = j
        else:
            i += 1
    end_keep = min(len(x), (last + 1) * win + int(TAIL * SR))
    xf = int(0.008 * SR)
    out, pos = [], 0
    for a, b in cuts + [(end_keep, end_keep)]:
        seg = x[pos:a].copy()
        if out and len(seg) > xf:
            prev = out[-1]
            ramp = np.linspace(0, 1, xf, dtype=np.float32)
            prev[-xf:] = prev[-xf:] * (1 - ramp) + seg[:xf] * ramp
            seg = seg[xf:]
        out.append(seg)
        pos = b
    y = np.concatenate(out)
    fade = int(0.03 * SR)
    y[-fade:] *= np.linspace(1, 0, fade, dtype=np.float32)
    removed = [(a / SR, (b - a) / SR) for a, b in cuts]
    def remap(t):
        shift = 0.0
        for a, d in removed:
            if t >= a + d: shift += d + 0.008
            elif t > a: shift += t - a
        return max(0.0, t - shift)
    return y, remap

def build():
    out_dir = ROOT / "public/vo"
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest = []
    for l in lines():
        raw = ROOT / f"raw/vo/{l['id']}.mp3"
        if not raw.exists():
            sys.exit(f"missing take {raw}. Run python3 scripts/vo.py gen {l['id']}")
        al = json.load(open(raw.with_suffix(".align.json")))
        a = al["alignment"]
        y, remap = tighten(decode(raw), l.get("maxPause", MAX_PAUSE))
        st = [round(remap(t), 3) for t in a["character_start_times_seconds"]]
        en = [round(remap(t), 3) for t in a["character_end_times_seconds"]]
        words = map_display(l["vo"], words_from_chars(a["characters"], st, en))
        dst = out_dir / f"{l['id']}.mp3"
        with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", tmp.name], input=y.astype(np.float32).tobytes(), check=True)
            loudnorm(tmp.name, dst)
        d = round(dur(dst), 3)
        for w in words:
            w["end"] = min(w["end"], d)
        manifest.append({"id": l["id"], "file": f"vo/{l['id']}.mp3", "durationSec": d, "text": l["vo"], "spoken": re.sub(r"\[[^\]]*\]\s*", "", al["text"]), "words": words})
    (out_dir / "manifest.json").write_text(json.dumps({"placeholder": False, "clips": manifest}, indent=1, ensure_ascii=False))
    print(f"built {len(manifest)} clips, {sum(m['durationSec'] for m in manifest):.1f} s")

if __name__ == "__main__":
    cmd, *ids = sys.argv[1:] or ["scratch"]
    if cmd == "scratch": scratch()
    elif cmd == "gen": gen(ids)
    elif cmd == "build": build()
    else: sys.exit(__doc__)
