#!/bin/bash

# Stop on errors
set -e

# Run test
npm test

# Push current commits
git push origin main

# Push commits from main to deploy
git checkout deploy
git rebase main --autostash
git push origin deploy

# Return to main branch
git checkout main