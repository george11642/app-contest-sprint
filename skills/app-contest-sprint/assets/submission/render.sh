#!/bin/sh
# Render HTML to PDF beside each source, then print page counts. Keep base.css beside the HTML, or link it by a relative path.
# Usage: sh render.sh doc1.html [doc2.html ...]
# Uses headless Chrome, then Edge or Chromium, then weasyprint. Set CHROME to override.
set -e
find_chrome() {
  for c in "${CHROME:-}" "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" "/Applications/Chromium.app/Contents/MacOS/Chromium" \
    google-chrome google-chrome-stable chromium chromium-browser microsoft-edge msedge chrome; do
    [ -n "$c" ] || continue
    if [ -x "$c" ] || command -v "$c" >/dev/null 2>&1; then echo "$c"; return 0; fi
  done
  return 1
}
BROWSER=$(find_chrome || true)
[ $# -gt 0 ] || { echo "usage: sh render.sh doc.html ..."; exit 1; }
for f in "$@"; do
  abs=$(cd "$(dirname "$f")" && pwd)/$(basename "$f")
  out="${abs%.html}.pdf"
  if [ -n "$BROWSER" ]; then
    "$BROWSER" --headless=new --disable-gpu --no-pdf-header-footer --run-all-compositor-stages-before-draw \
      --virtual-time-budget=15000 --print-to-pdf="$out" "file://$abs" >/dev/null 2>&1
  elif command -v weasyprint >/dev/null 2>&1; then
    weasyprint "$abs" "$out"
  else
    echo "No renderer found. Install Chrome, or use weasyprint, or export from Word or Google Docs."; exit 1
  fi
  pages=$(pdfinfo "$out" 2>/dev/null | awk '/^Pages/{print $2}')
  echo "$out: ${pages:-?} pages, $(du -k "$out" | cut -f1) KB"
done
echo "Now render page images and look at every page: pdftoppm -r 70 -png file.pdf preview"
