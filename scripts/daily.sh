#!/usr/bin/env zsh
# Scizen Daily — Run scraper then outreach
set -e

export PATH="$HOME/.local/bin:/opt/homebrew/bin:$PATH"
export TAVILY_API_KEY="$(cat ~/.hermes/.env | grep TAVILY_API_KEY | cut -d= -f2 | tr -d '
')"
export RESEND_API_KEY="$(cat ~/.hermes/.env | grep RESEND_API_KEY | cut -d= -f2 | tr -d '
')"
export EMAIL_FROM="hello@scizen.fr"

cd ~/projets/hermes-projets/scizen

echo "[$(date)] === Signal Scraper ==="
python scripts/signal_scraper.py --output data/leads/ >> /tmp/scizen_daily.log 2>&1

echo "[$(date)] === Outreach Send ==="
python scripts/outreach_send.py --config scripts/outreach_config.yaml >> /tmp/scizen_daily.log 2>&1

echo "[$(date)] === DONE ==="
