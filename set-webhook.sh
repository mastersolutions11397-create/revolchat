#!/bin/bash

WEBHOOK_URL="https://ec63-119-156-127-237.ngrok-free.app/api/telegram/webhook"
BOT_TOKEN="8758925874:AAF9mvI_8SZm-_rOX7MXnqd2CZLfrNpOeGI"

echo "Setting webhook to: $WEBHOOK_URL"
echo ""

curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${WEBHOOK_URL}\"}"

echo ""
echo ""
echo "Checking webhook status..."
curl "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo"
