#!/usr/bin/env bash
# swhid.sh - write research/js/swhid.js: for each file under sources/, its git blob hash (the
# SWHID's hash, swh:1:cnt:…) and the last commit that changed it (for permalinks to the lines).
# Run from anywhere in the repository after committing the sources, then commit swhid.js.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
out=research/js/swhid.js
{
  echo '/* SWHIDs (git blob hashes) of the files under sources/, with the commit that last changed each,'
  echo ' * for citations and permalinks. Made by tools/swhid.sh; run it again when the sources change. */'
  printf '(function (root) { root.SW.SWHID = {'
  sep=''
  while IFS= read -r f; do
    rel=${f#sources/}
    blob=$(git hash-object "$f")
    commit=$(git log -1 --format=%H -- "$f")
    printf '%s"%s": ["%s", "%s"]' "$sep" "$rel" "$blob" "$commit"
    sep=', '
  done < <(git ls-files sources | sort)
  echo '}; })(this);'
} > "$out"
echo "wrote $out"
