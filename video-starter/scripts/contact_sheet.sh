#!/bin/sh
# Contact sheets from a video at 5 fps, 30 frames a sheet: sh scripts/contact_sheet.sh out/final.mp4 out/sheets
# Then open every sheet and look at it. A render is not finished until someone has.
set -e
IN="${1:-out/final.mp4}"; OUT="${2:-out/sheets}"
mkdir -p "$OUT"; rm -f "$OUT"/s_*.jpg
ffmpeg -v error -i "$IN" -vf "fps=5,scale=480:-1,tile=6x5" -q:v 4 "$OUT/s_%02d.jpg"
ls "$OUT"/s_*.jpg
