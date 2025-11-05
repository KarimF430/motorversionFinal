#!/bin/bash

# Add GitHub remote for backend
echo "🔗 Adding GitHub remote..."

# You need to create a GitHub repo first, then add it here
# Replace with your actual GitHub repo URL
GITHUB_REPO="https://github.com/KarimF430/motoroctane-backend.git"

git remote add origin "$GITHUB_REPO" 2>/dev/null || echo "Remote 'origin' already exists"
git remote set-url origin "$GITHUB_REPO"

echo "📤 Pushing to GitHub..."
git push -u origin main

echo "✅ Done! Now configure Render to pull from this GitHub repo"
