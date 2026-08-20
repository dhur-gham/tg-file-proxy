const { BOT_TOKEN, CHAT_ID } = process.env;

if (!BOT_TOKEN || !CHAT_ID) {
  throw new Error(
    'Missing required environment variables: BOT_TOKEN and CHAT_ID. ' +
    'Set them in your Vercel project settings or a local .env file.'
  );
}

module.exports = { BOT_TOKEN, CHAT_ID };
