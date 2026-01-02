#!/usr/bin/env bash
set -euo pipefail

# ─── Load .env ────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$SCRIPT_DIR/.env" ]]; then
    set -a
    source "$SCRIPT_DIR/.env"
    set +a
fi

# ─── Configuration ────────────────────────────────────────────────────────────
S3_BUCKET="${DEPLOY_S3_BUCKET:?Error: DEPLOY_S3_BUCKET not set in .env}"
CF_DIST_ID="${DEPLOY_CF_DIST_ID:?Error: DEPLOY_CF_DIST_ID not set in .env}"
# immutable assets get cached for 1 year
IMMUTABLE_CACHE="public, max-age=31536000, immutable"

# ─── Helpers ──────────────────────────────────────────────────────────────────

# Upload a .br file with content-encoding and cache control
upload_brotli_file() {
    local file_path="$1"
    local content_type="$2"
    # strip dist/ and .br
    local s3_key="${file_path#dist/}"
    s3_key="${s3_key%.br}"

    echo "📦 Brotli → $s3_key"
    aws s3 cp "$file_path" "s3://${S3_BUCKET}/${s3_key}" \
      --content-type      "$content_type" \
      --content-encoding  br \
      --cache-control     "$IMMUTABLE_CACHE" \
      --metadata-directive REPLACE
}

# Upload a plain file (JS, WASM, CSS) with cache control
upload_plain_file() {
    local file_path="$1"
    local content_type="$2"
    local s3_key="${file_path#dist/}"

    echo "📦 Plain → $s3_key"
    aws s3 cp "$file_path" "s3://${S3_BUCKET}/${s3_key}" \
      --content-type      "$content_type" \
      --cache-control     "$IMMUTABLE_CACHE" \
      --metadata-directive REPLACE
}

# ─── Step 1: Sync everything ───────────────────────────────────────────────────
echo "🔄 Syncing dist/ → s3://${S3_BUCKET}/"
aws s3 sync dist/ "s3://${S3_BUCKET}/" --delete

# ─── Step 2: Fix headers on plain assets ───────────────────────────────────────
echo "⚙️  Setting cache headers on JS/WASM/CSS"
find dist/ -type f \( -name "*.js" -o -name "*.wasm" -o -name "*.css" \) | while read -r file; do
  case "$file" in
    *.js)   upload_plain_file "$file" "application/javascript" ;;
    *.wasm) upload_plain_file "$file" "application/wasm"       ;;
    *.css)  upload_plain_file "$file" "text/css"               ;;
    *)      echo "⚠️  Skipping unknown: $file"                   ;;
  esac
done

# ─── Step 3: Upload Brotli versions with proper headers ───────────────────────
echo "⚙️  Uploading .br files with content-encoding and cache headers"
find dist/ -name "*.br" -type f | while read -r file; do
  case "$file" in
    *.wasm.br) upload_brotli_file "$file" "application/wasm"        ;;
    *.js.br)   upload_brotli_file "$file" "application/javascript" ;;
    *.css.br)  upload_brotli_file "$file" "text/css"               ;;
    *)         echo "⚠️  Skipping unknown .br: $file"               ;;
  esac
done

# ─── Step 4: Invalidate CloudFront ───────────────────────────────────────────
echo "🚀 Invalidating CloudFront ($CF_DIST_ID)"
aws cloudfront create-invalidation \
    --distribution-id "$CF_DIST_ID" \
    --paths '/*' \
    --no-cli-pager

echo "✅ Deployment complete."