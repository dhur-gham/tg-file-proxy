const axios   = require('axios');
const resolve = require('./_resolve');
const mime    = require('./_mime');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Use GET.' });
  const file_id = req.query.file_id || req.url.split('/').pop().split('?')[0];
  if (!file_id) return res.status(400).json({ ok: false, error: 'Missing file_id.' });
  try {
    const { file_path, file_size, file_unique_id, tg_url } = await resolve(file_id);
    const filename = file_path.split('/').pop();
    const tgRes = await axios.get(tg_url, { responseType: 'stream' });
    const ct = tgRes.headers['content-type'] || mime(filename);
    res.setHeader('Content-Type', ct);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    if (file_size) res.setHeader('Content-Length', file_size);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    tgRes.data.pipe(res);
  } catch (err) {
    if (!res.headersSent) res.status(err.status || 502).json({ ok: false, error: err.message });
  }
};
