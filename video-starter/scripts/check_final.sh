#!/bin/sh
# Acceptance checks on the rendered file. Exit 1 on a hard failure. Then open the sheets and look at them.
F="${1:-out/final.mp4}"
cd "$(dirname "$0")/.."
[ -f "$F" ] || { echo "FAIL: no $F"; exit 1; }
FAIL=0
if [ -n "$(find src content public/vo -newer "$F" -type f 2>/dev/null | head -1)" ]; then echo "FAIL: source or VO is newer than $F. This is a stale render."; FAIL=1; fi
ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_name,width,height,r_frame_rate -of default=nw=1 "$F"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$F")
python3 - "$DUR" <<'PY' || FAIL=1
import json, sys
want = json.load(open("content/timeline.json"))["totalSec"]
got = float(sys.argv[1])
print(f"duration {got:.2f} s, timeline {want:.2f} s")
sys.exit(1 if abs(got - want) > 0.2 else 0)
PY
L=$(ffmpeg -nostdin -hide_banner -i "$F" -af ebur128=peak=true -f null - 2>&1 | grep -E '^ +(I|LRA|Peak):')
echo "$L"
python3 - "$L" <<'PY' || FAIL=1
import re, sys
s = sys.argv[1]
i = float(re.search(r"I:\s+(-?[\d.]+)", s).group(1))
p = float(re.search(r"Peak:\s+(-?[\d.]+)", s).group(1))
ok = -17.5 <= i <= -14.5 and p <= -0.5
print("loudness ok" if ok else f"FAIL: target -16 LUFS and peak under -1 dBFS, got {i} and {p}")
sys.exit(0 if ok else 1)
PY
echo "silences over 0.8 s (expect only deliberate ones):"
ffmpeg -nostdin -i "$F" -af silencedetect=noise=-45dB:d=0.8 -f null - 2>&1 | grep silence_end || true
echo "freezes over 2 s (expect none):"
ffmpeg -nostdin -i "$F" -vf freezedetect=n=-60dB:d=2 -f null - 2>&1 | grep freeze_start || true
python3 -c "import json,sys;sys.exit(1 if json.load(open('public/vo/manifest.json')).get('placeholder') else 0)" || { echo "FAIL: this render uses the scratch mumble track"; FAIL=1; }
python3 scripts/check_captions.py "$F" || FAIL=1
sh scripts/contact_sheet.sh "$F" out/sheets
exit $FAIL
