const axios = require('axios');
const { BOT_TOKEN } = require('./_config');
const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Use GET.' });
  const file_id = req.query.file_id || req.url.split('/').pop().split('?')[0];
  if (!file_id) return res.status(400).json({ ok: false, error: 'Missing file_id.' });
  try {
    const r = await axios.post(`${TG_API}/getFile`, { file_id });
    if (!r.data.ok) return res.status(404).json({ ok: false, error: r.data.description });
    return res.json({ ok: true, ...r.data.result });
  } catch (err) {
    return res.status(502).json({ ok: false, error: err.response?.data?.description || err.message });
  }
};
