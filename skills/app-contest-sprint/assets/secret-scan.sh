#!/usr/bin/env bash
# Gate before any public push. Exit 1 on a finding. Scans the tree, untracked files and all history.
# Usage: bash secret-scan.sh [path-to-local-env-file]
# Allowlist: put one fixed string per line in .secret-scan-allow, with a reason in a comment line above it.
set -u
PAT='AC[0-9a-f]{32}|SK[0-9a-f]{32}|sk_live_|sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{30,}|github_pat_|xox[bap]-|AKIA[0-9A-Z]{16}|sb_secret_|eyJ[A-Za-z0-9_-]{20,}\.|-----BEGIN [A-Z ]*PRIVATE KEY|\+1[ -]?[0-9]{3}[ -]?[0-9]{3}[ -]?[0-9]{4}|\(?[0-9]{3}\)?[ -][0-9]{3}-[0-9]{4}|[A-Za-z0-9._%+-]+@(gmail|icloud|yahoo|outlook|hotmail)\.com'
allow() { if [ -f .secret-scan-allow ]; then grep -vE '^#' .secret-scan-allow | grep -vF -f - ; else cat; fi; }
FOUND=0
report() { [ -n "$1" ] && { echo "$2:"; echo "$1" | cut -c1-120 | head -20; FOUND=1; }; }
report "$(git grep -nIE "$PAT" -- . ':!*secret-scan.sh' | allow)" "tracked files"
U=$(git ls-files --others --exclude-standard)
[ -n "$U" ] && report "$(echo "$U" | tr '\n' '\0' | xargs -0 grep -nIE "$PAT" 2>/dev/null | grep -v 'secret-scan.sh:' | allow)" "untracked files"
report "$(git log --all -p --no-color -- . ':!*secret-scan.sh' | grep -E '^\+' | grep -E "$PAT" | allow)" "history"
if [ "${1:-}" != "" ] && [ -f "$1" ]; then
  # exact local values, never echoed
  while IFS= read -r v; do
    [ ${#v} -ge 8 ] || continue
    if git grep -qF -- "$v" || git log --all -p --no-color | grep -qF -- "$v"; then echo "a value from the local env file is in the repo"; FOUND=1; fi
  done < <(sed -n 's/^[A-Za-z_][A-Za-z0-9_]*=//p' "$1" | tr -d "\"'")
fi
[ "$FOUND" = 0 ] && echo "secret scan: clean" || { echo "secret scan: BLOCKED. Fix or allowlist each finding, then re-run."; exit 1; }
