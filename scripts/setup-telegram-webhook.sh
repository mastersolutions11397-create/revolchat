#!/bin/bash

# Telegram Webhook Setup Script
# This script sets up the Telegram webhook with your ngrok URL

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Telegram Webhook Setup${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

# Check if bot token is set
if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ "$TELEGRAM_BOT_TOKEN" = "your_telegram_bot_token_here" ]; then
    echo -e "${RED}❌ Error: TELEGRAM_BOT_TOKEN not set in .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Bot token found${NC}"

# Check if ngrok is running
echo ""
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
echo -e "${YELLOW}Setting webhook...${NC}"

# Set the webhook
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${WEBHOOK_URL}\"}")

# Check if successful
if echo "$RESPONSE" | grep -q '"ok":true'; then
    echo -e "${GREEN}✅ Webhook set successfully!${NC}"
    echo ""
    echo -e "${BLUE}Webhook URL: ${WEBHOOK_URL}${NC}"
    echo ""
    echo -e "${GREEN}🎉 Your bot is ready to receive messages!${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "1. Make sure your app is running: ${BLUE}npm run dev${NC}"
    echo -e "2. Open Telegram and message your bot: ${BLUE}@mygirlfriend4587bot${NC}"
    echo -e "3. Check the dashboard: ${BLUE}http://localhost:3000/dashboard/messages${NC}"
else
    echo -e "${RED}❌ Failed to set webhook${NC}"
    echo -e "${YELLOW}Response: ${RESPONSE}${NC}"
    exit 1
fi

# Show webhook info
echo ""
echo -e "${YELLOW}Verifying webhook...${NC}"
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo" | \
  grep -E '"url"|"pending_update_count"|"last_error_message"' || true

echo ""
echo -e "${GREEN}Setup complete!${NC}"
