#!/bin/sh
# Pre-loop music beds to the film's full length. Remotion's `loop` breaks per-frame volume curves after the first loop.
set -e
cd "$(dirname "$0")/.."
LEN=$(python3 -c "import json;print(int(json.load(open('content/timeline.json'))['totalSec'])+12)")
mkdir -p public/music/long
for f in tension_loop tension_build product_pulse_loop resolve_pad; do
  ffmpeg -nostdin -v error -y -stream_loop -1 -i "public/music/$f.wav" -t "$LEN" -c:a libmp3lame -b:a 192k "public/music/long/$f.mp3"
done
echo "beds: ${LEN} s"
