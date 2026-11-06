#!/bin/sh
# Render, normalize, measure. Writes out/final.mp4 only after everything succeeds, so an interrupted run leaves no
# half file for a reviewer. Run it in the foreground, or detached with its log, and wait for exit before any review.
set -e
cd "$(dirname "$0")/.."
mkdir -p out
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo none)
npx tsc --noEmit -p .
python3 scripts/check_beats.py
npx remotion render src/index.ts Hybrid out/.raw.mp4 --codec=h264 --crf=18 --log=error "$@"
ffmpeg -nostdin -loglevel error -y -i out/.raw.mp4 -c:v copy -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 -movflags +faststart out/.final.mp4
mv out/.final.mp4 out/final.mp4
rm -f out/.raw.mp4
echo "$COMMIT $(date -u +%FT%TZ)" > out/final.commit
sh scripts/check_final.sh out/final.mp4
