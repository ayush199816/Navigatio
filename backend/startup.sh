#!/bin/bash
cd "$(dirname "$0")"
npm install
pm2 delete ecosystem.config.js
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Run the command that PM2 suggests to set up startup script
