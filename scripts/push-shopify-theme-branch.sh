#!/bin/bash
set -e

THEME_DIR="shopify-theme"
BRANCH_NAME="shopify-theme"
TEMP_DIR=$(mktemp -d)

echo "=== Comic Crafter — Push Shopify Theme Branch ==="
echo "Creating orphan branch '$BRANCH_NAME' with theme files only..."

cp -r "$THEME_DIR"/* "$TEMP_DIR/"

git stash --include-untracked 2>/dev/null || true

if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  git branch -D "$BRANCH_NAME"
fi

git checkout --orphan "$BRANCH_NAME"

git rm -rf . 2>/dev/null || true
find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} +

cp -r "$TEMP_DIR"/* .

git add .
git commit -m "Shopify theme: Comic Crafter Pro"

echo ""
echo "Branch '$BRANCH_NAME' created locally with theme files."
echo "Now push it to GitHub with: git push origin $BRANCH_NAME"
echo ""
echo "Then in Shopify Admin > Online Store > Themes > Connect theme:"
echo "  - Repository: comiccrafter-ai"
echo "  - Branch: shopify-theme"
echo ""

git checkout main
git stash pop 2>/dev/null || true

rm -rf "$TEMP_DIR"
echo "Done! Back on main branch."
