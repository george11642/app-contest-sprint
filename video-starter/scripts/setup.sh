#!/bin/sh
# One-time setup after npm install. Safe to re-run.
set -e
cd "$(dirname "$0")/.."
for t in node python3 ffmpeg ffprobe; do command -v "$t" >/dev/null || { echo "missing $t"; exit 1; }; done
python3 -c 'import numpy' 2>/dev/null || { echo "missing numpy: run python3 -m pip install numpy"; exit 1; }
sh scripts/bake_all.sh
python3 scripts/synth_audio.py >/dev/null
echo "synthesized sfx and music"
if [ -f public/vo/manifest.json ]; then python3 scripts/timeline.py; else python3 scripts/vo.py scratch; python3 scripts/timeline.py; fi
python3 scripts/fix_timing.py --write
sh scripts/beds.sh
python3 scripts/check_beats.py || true
