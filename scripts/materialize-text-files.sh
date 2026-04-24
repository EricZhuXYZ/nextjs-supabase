#!/bin/zsh
set -euo pipefail

if [[ "${SKIP_MATERIALIZE_TEXT_FILES:-}" == "1" ]]; then
  exit 0
fi

count=0

while IFS= read -r -d '' file; do
  tmp="$(mktemp)"
  /bin/cp "$file" "$tmp"
  mode="$(/usr/bin/stat -f '%Lp' "$file")"
  /bin/chmod "$mode" "$tmp"
  /bin/mv "$tmp" "$file"
  count=$((count + 1))
done < <(
  find . \
    \( -path './.git' -o -path './.next' -o -path './.turbo' -o -path './out' -o -path './build' \) -prune \
    -o -type f \
    \( -name '*.d.ts' -o -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \
    -o -name '*.mjs' -o -name '*.cjs' -o -name '*.json' -o -name '*.css' -o -name '*.md' \
    -o -name '.env' -o -name '.env.local' -o -name '.gitignore' \) \
    -print0
)

echo "Materialized ${count} text-like files."
