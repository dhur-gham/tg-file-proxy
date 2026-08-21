# ✈️ Telegram File Proxy

A lightweight middleware that uses your Telegram bot as a **free file storage backend**.  
Upload any file → get a permanent `file_id` → preview or download via clean URLs.

**Live:** [tg-file-proxy.vercel.app](https://tg-file-proxy.vercel.app) &nbsp;·&nbsp; **API Docs:** [tg-file-proxy.vercel.app/docs](https://tg-file-proxy.vercel.app/docs)

---

## How it works

Telegram stores files permanently on their servers. This proxy:
1. Accepts your file upload
2. Sends it to Telegram via the Bot API (which stores it and returns a `file_id`)
3. Returns the `file_id` + ready-to-use preview/download URLs

---

## Setup

### 1. Clone & install
```bash
git clone https://github.com/dhur-gham/tg-file-proxy.git
cd tg-file-proxy
npm install
```

### 2. Environment variables
```bash
cp .env.example .env
```

| Variable    | Description |
|-------------|-------------|
| `BOT_TOKEN` | Bot token from [@BotFather](https://t.me/BotFather) |
| `CHAT_ID`   | Telegram chat ID where files are stored. Get it from [@userinfobot](https://t.me/userinfobot) |

### 3. Deploy to Vercel
```bash
npx vercel --prod
```
Then set `BOT_TOKEN` and `CHAT_ID` in your Vercel project → Settings → Environment Variables.

---

## API Endpoints

Full interactive docs at [tg-file-proxy.vercel.app/docs](https://tg-file-proxy.vercel.app/docs)  
Raw OpenAPI spec at [tg-file-proxy.vercel.app/openapi.json](https://tg-file-proxy.vercel.app/openapi.json)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload` | Upload a file → returns `file_id` |
| `GET`  | `/view/:file_id` | Serve file inline (browser preview) |
| `GET`  | `/file/:file_id` | Force download |
| `GET`  | `/info/:file_id` | File metadata only |

### Upload example
```bash
curl -X POST https://tg-file-proxy.vercel.app/upload \
  -F "file=@photo.jpg"
```

**Response:**
```json
{
  "ok": true,
  "file_id": "AgACAgQAAxkDAAPQaoeECyJJIGus",
  "file_unique_id": "AQADSomeUniqueId",
  "file_size": 51200,
  "mime_type": "image/jpeg",
  "file_name": "photo.jpg"
}
```

### Preview / Download
```
https://tg-file-proxy.vercel.app/view/AgACAgQAAxkD...   👁️ opens in browser
https://tg-file-proxy.vercel.app/file/AgACAgQAAxkD...   ⬇️ downloads
```

---

## Limits

| Limit | Value |
|-------|-------|
| Max upload size | **50 MB** (Telegram Bot API hard limit) |
| Max download size | **20 MB** (Bot API getFile limit) |
| Supported file types | Any |
| Download URL TTL | ~1 hour (proxy auto-refreshes) |

---

## ⚠️ Scaling for heavy use

This setup is built for personal or low-volume use — one bot writing into one chat. That is fine for a few uploads a day. Push real traffic through it and Telegram will start throttling you, and eventually ban the bot.

Telegram enforces per-bot rate limits, and file uploads are among the most expensive calls you can make:

| Limit | Approximate value |
|-------|-------------------|
| Messages to one chat | ~1 per second sustained |
| Total messages across all chats | ~30 per second |
| Bulk sending to one chat | ~20 per minute |

Cross those and the API replies `429 Too Many Requests` with a `retry_after` value. Ignore the backoff and keep hammering, and Telegram escalates: longer cooldowns, then a permanent ban on the bot token. Bans apply to the bot, not just the request — everything already uploaded through it becomes unreachable, because `getFile` stops working for that token. There is no paid tier that lifts these limits.

For heavy use you need more than one bot, and you need to send to more than one chat. Each bot carries its own quota, and the per-chat limit is stricter than the global one, so spreading load across both dimensions is what keeps you under the ceiling.

Note that a `file_id` only works with the bot token that created it. Once you use more than one bot, each file has to be served back through the same bot that uploaded it, so that pairing has to be recorded and kept.

Deleting a storage message invalidates its `file_id` permanently.

As shipped, `/upload` is public and unauthenticated — anyone who finds the URL can write into your chats and burn your quota.

Telegram is a messaging service, not a CDN. Using it as bulk file hosting runs against the spirit of the terms, and sustained abuse gets bots banned. For anything serious, use S3, R2, or B2.

---

## Built by

[dhurgham.dev](https://dhurgham.dev)
