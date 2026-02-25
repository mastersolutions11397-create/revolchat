# 🚀 Deployment Guide - Telegram Chat System

Your chat system is fully built and working! You just need to deploy it to bypass network restrictions.

## ✅ What's Working Locally

- ✅ Next.js app running
- ✅ Database tables created
- ✅ AI agent configured
- ✅ Knowledge base API connected
- ✅ Webhook endpoint active
- ❌ Can't reach Telegram API (network issue)

## 🌐 Deploy to Vercel (5 Minutes)

### Step 1: Prepare for Deployment

1. Make sure all environment variables are set:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://fifutejpftnctnxacnzk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_AGENTS_API_URL=https://your-api-url.com
TELEGRAM_BOT_TOKEN=8758925874:AAF9mvI_8SZm-_rOX7MXnqd2CZLfrNpOeGI
DEFAULT_AGENT_ID=d7abb763-88eb-4b76-b07e-90055d5fbf23
```

### Step 2: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel deploy --prod
```

Or use the Vercel Dashboard:
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repo
4. Add environment variables
5. Deploy!

### Step 3: Update Webhook

Once deployed, get your production URL and set the webhook:

```bash
WEBHOOK_URL="https://your-app.vercel.app/api/telegram/webhook"
BOT_TOKEN="8758925874:AAF9mvI_8SZm-_rOX7MXnqd2CZLfrNpOeGI"

curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${WEBHOOK_URL}\"}"
```

### Step 4: Update API URL

Make sure to update `NEXT_PUBLIC_AGENTS_API_URL` to point to your deployed knowledge base API (not localhost).

## 🧪 Test the Deployed System

1. **Message your bot**: @mygirlfriend4587bot
2. **AI responds** with girlfriend personality
3. **Check dashboard**: https://your-app.vercel.app/dashboard/messages
4. **Toggle AI mode** and send manual messages

## 🔧 Environment Variables for Production

Add these in Vercel dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=https://fifutejpftnctnxacnzk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_AGENTS_API_URL=https://your-backend-api.com
TELEGRAM_BOT_TOKEN=8758925874:AAF9mvI_8SZm-_rOX7MXnqd2CZLfrNpOeGI
DEFAULT_AGENT_ID=d7abb763-88eb-4b76-b07e-90055d5fbf23
```

## 🎉 Once Deployed

Your AI girlfriend bot will:
- ✅ Respond to Telegram messages with AI personality
- ✅ Save all conversations in database
- ✅ Show online users in dashboard
- ✅ Allow admin takeover (toggle AI mode)
- ✅ Real-time message updates
- ✅ Full conversation history

## 🚨 Important Notes

1. **Don't commit .env** - It's in .gitignore
2. **Use environment variables** in Vercel dashboard
3. **Update webhook** after deployment
4. **Test thoroughly** after deploying

## 📝 Post-Deployment Checklist

- [ ] App deployed to Vercel
- [ ] Environment variables added
- [ ] Webhook updated to production URL
- [ ] Tested bot on Telegram
- [ ] Checked dashboard works
- [ ] Verified AI responses
- [ ] Tested admin takeover

🎊 **Congratulations!** Your AI girlfriend Telegram bot is live!
