#!/bin/bash

# Stop on errors
set -e

# Pull changes
git pull origin production

# Stop husky
export HUSKY=0

# Install packages
npm install --production

# Reread supervisor configs
supervisorctl reread

# Apply supervisor config changes if any
supervisorctl update

# Restart website
supervisorctl restart doh1

# Restart queue
supervisorctl restart queue