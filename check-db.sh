#!/bin/bash

echo "Checking if chat tables exist in Supabase..."
echo ""

# Load env vars
source .env

# Check if tables exist using Supabase API
curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/chat_sessions?limit=1" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" | head -20

echo ""
echo ""
echo "If you see an error above, the tables don't exist yet."
echo "Run the migration in Supabase SQL Editor:"
echo "  supabase/run-all-migrations-simple.sql"
