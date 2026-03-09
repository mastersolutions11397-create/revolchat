#!/bin/bash

# Telegram Webhook Setup Script
# This script sets up the Telegram webhook with your ngrok URL for all bots

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Telegram Webhook Setup (Multi-Bot)${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check if ngrok is running
echo -e "${YELLOW}Checking for ngrok...${NC}"

# Try to get ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o 'https://[a-zA-Z0-9-]*\.ngrok[a-zA-Z0-9.-]*' | head -1)

if [ -z "$NGROK_URL" ]; then
    echo -e "${RED}❌ ngrok is not running!${NC}"
    echo ""
    echo -e "${YELLOW}To start ngrok, run in a new terminal:${NC}"
    echo -e "${BLUE}   ngrok http 3000${NC}"
    echo ""
    echo -e "${YELLOW}Then run this script again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ ngrok is running${NC}"
echo -e "${BLUE}   URL: $NGROK_URL${NC}"

# Construct webhook URL
WEBHOOK_URL="${NGROK_URL}/api/telegram/webhook"

echo ""
echo -e "${YELLOW}Setting webhooks for all bots...${NC}"

# Call the setup-webhook API endpoint
RESPONSE=$(curl -s -X POST "http://localhost:3000/api/telegram/setup-webhook" \
  -H "Content-Type: application/json" \
  -d "{\"webhook_url\": \"${WEBHOOK_URL}\"}")

# Check if successful
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Webhooks set successfully!${NC}"
    echo ""
    echo -e "${BLUE}Webhook URL: ${WEBHOOK_URL}${NC}"
    echo ""

    # Show individual bot results
    echo -e "${YELLOW}Bot webhook status:${NC}"
    echo "$RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for r in data.get('results', []):
        name = r.get('agent_name', 'Unknown')
        username = r.get('telegram_username', 'N/A')
        success = '✅' if r.get('success') else '❌'
        print(f'  {success} {name} (@{username})')
except:
    pass
" 2>/dev/null || echo "$RESPONSE"

    echo ""
    echo -e "${GREEN}🎉 Your bots are ready to receive messages!${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "1. Make sure your app is running: ${BLUE}npm run dev${NC}"
    echo -e "2. Open Telegram and message one of your bots"
    echo -e "3. Check the bots page: ${BLUE}http://localhost:3000/dashboard/bots${NC}"
else
    echo -e "${RED}❌ Failed to set webhooks${NC}"
    echo -e "${YELLOW}Response: ${RESPONSE}${NC}"

    # If the API isn't running, provide manual instructions
    if echo "$RESPONSE" | grep -qi "ECONNREFUSED\|connection refused\|fetch failed"; then
        echo ""
        echo -e "${YELLOW}The Next.js app doesn't seem to be running.${NC}"
        echo -e "Start it with: ${BLUE}npm run dev${NC}"
        echo ""
        echo -e "${YELLOW}Or set webhook manually for a specific bot:${NC}"
        echo -e "${BLUE}curl -X POST \"https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook\" \\${NC}"
        echo -e "${BLUE}  -H \"Content-Type: application/json\" \\${NC}"
        echo -e "${BLUE}  -d '{\"url\": \"${WEBHOOK_URL}\"}'${NC}"
    fi
    exit 1
fi

# Show webhook info
echo ""
echo -e "${YELLOW}Verifying webhooks...${NC}"
curl -s "http://localhost:3000/api/telegram/setup-webhook" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for agent in data.get('agents', []):
        name = agent.get('agent_name', 'Unknown')
        url = agent.get('webhook_url', 'Not set')
        pending = agent.get('pending_update_count', 0)
        error = agent.get('last_error_message')
        print(f'  {name}:')
        print(f'    URL: {url}')
        print(f'    Pending updates: {pending}')
        if error:
            print(f'    Last error: {error}')
except Exception as e:
    print(f'Error parsing response: {e}')
" 2>/dev/null || true

echo ""
echo -e "${GREEN}Setup complete!${NC}"
