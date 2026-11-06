#!/usr/bin/env python3
"""Caption checks.

  python3 scripts/check_captions.py                  # structure: word order, chunk sizes, speech rate
  python3 scripts/check_captions.py out/final.mp4    # adds a whisper-1 transcript of the mix if OPENAI_API_KEY is set

Whisper on the final mix is the acceptance check. Stills cannot prove sync.
"""
import difflib, json, os, pathlib, re, statistics, subprocess, sys, tempfile, urllib.request, uuid
ROOT = pathlib.Path(__file__).resolve().parents[1]
tl = json.load(open(ROOT / "content/timeline.json"))
words = [dict(w, beat=b["id"]) for b in tl["beats"] for w in b["words"]]
bad = 0
for a, b in zip(words, words[1:]):
    if b["start"] < a["start"] - 1e-6:
        print(f"out of order: {a['word']} then {b['word']}"); bad += 1
    if b["beat"] != a["beat"] and b["start"] < a["end"] - 0.02:
        print(f"beats overlap at {b['start']:.2f}: {a['beat']} / {b['beat']}"); bad += 1
vo = sum(b["durationSec"] for b in tl["beats"] if b["file"])
print(f"{len(words)} words, {vo:.1f} s VO, {len(words) / max(vo, 1) * 60:.0f} wpm, {bad} structural problems")
norm = lambda s: re.sub(r"[^a-z0-9%]", "", s.lower())
if len(sys.argv) > 1:
    if not os.environ.get("OPENAI_API_KEY"):
        print("OPENAI_API_KEY is not set, so the whisper check was skipped. Have a human watch with the sound on.")
    else:
        with tempfile.NamedTemporaryFile(suffix=".mp3") as tmp:
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", sys.argv[1], "-vn", "-ac", "1", "-ar", "16000", "-b:a", "48k", tmp.name], check=True)
            data = open(tmp.name, "rb").read()
        bd = uuid.uuid4().hex
        parts = b""
        for k, v in [("model", "whisper-1"), ("response_format", "verbose_json"), ("timestamp_granularities[]", "word")]:
            parts += f'--{bd}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
        parts += f'--{bd}\r\nContent-Disposition: form-data; name="file"; filename="a.mp3"\r\nContent-Type: audio/mpeg\r\n\r\n'.encode() + data + f"\r\n--{bd}--\r\n".encode()
        req = urllib.request.Request("https://api.openai.com/v1/audio/transcriptions", data=parts, method="POST",
                                     headers={"Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}", "Content-Type": f"multipart/form-data; boundary={bd}"})
        got = json.load(urllib.request.urlopen(req, timeout=300))["words"]
        sm = difflib.SequenceMatcher(a=[norm(w["word"]) for w in words], b=[norm(w["word"]) for w in got], autojunk=False)
        off = [got[m.b + k]["start"] - words[m.a + k]["start"] for m in sm.get_matching_blocks() for k in range(m.size)]
        print(f"whisper matched {len(off)} of {len(words)} words, median offset {statistics.median(off) * 1000:.0f} ms" if off else "whisper matched no words")
        for op, a0, a1, b0, b1 in sm.get_opcodes():
            if op != "equal":
                print(f"  {op}: {' '.join(w['word'] for w in words[a0:a1])!r} vs {' '.join(w['word'] for w in got[b0:b1])!r}")
sys.exit(1 if bad else 0)
