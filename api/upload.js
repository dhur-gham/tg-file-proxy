const axios    = require('axios');
const FormData = require('form-data');
const Busboy   = require('busboy');
const { BOT_TOKEN, CHAT_ID } = require('./_config');
const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const MAX_BYTES = 50 * 1024 * 1024;

function getSendMethod(mime = '') {
  if (mime.startsWith('image/')) return 'sendPhoto';
  if (mime.startsWith('video/')) return 'sendVideo';
  if (mime.startsWith('audio/')) return 'sendAudio';
  return 'sendDocument';
}

function extractFileId(result, method) {
  switch (method) {
    case 'sendPhoto': { const p = result.photo; return { file_id: p[p.length-1].file_id, meta: p[p.length-1] }; }
    case 'sendVideo': return { file_id: result.video.file_id, meta: result.video };
    case 'sendAudio': return { file_id: result.audio.file_id, meta: result.audio };
    default:          return { file_id: result.document.file_id, meta: result.document };
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Use POST.' });
  const bb = Busboy({ headers: req.headers, limits: { fileSize: MAX_BYTES } });
  let fileBuffer, fileName, fileMime, limitHit = false;

  bb.on('file', (_f, file, info) => {
    fileName = info.filename; fileMime = info.mimeType;
    const chunks = [];
    file.on('data', d => chunks.push(d));
    file.on('limit', () => { limitHit = true; });
    file.on('end',  () => { if (!limitHit) fileBuffer = Buffer.concat(chunks); });
  });

  bb.on('finish', async () => {
    if (limitHit) return res.status(413).json({ ok: false, error: 'File exceeds the 50 MB Telegram Bot API limit.' });
    if (!fileBuffer) return res.status(400).json({ ok: false, error: "No file. Use field name 'file'." });

    const method    = getSendMethod(fileMime);
    const fieldName = method.replace('send', '').toLowerCase();
    const form = new FormData();
    form.append('chat_id', CHAT_ID);
    form.append(fieldName, fileBuffer, { filename: fileName, contentType: fileMime });

    try {
      const tgRes = await axios.post(`${TG_API}/${method}`, form, {
        headers: form.getHeaders(), maxContentLength: Infinity, maxBodyLength: Infinity,
      });
      if (!tgRes.data.ok) return res.status(502).json({ ok: false, error: tgRes.data.description });
      const { file_id, meta } = extractFileId(tgRes.data.result, method);
      return res.json({
        ok: true, file_id,
        file_unique_id: meta.file_unique_id || null,
        file_size:      meta.file_size      || fileBuffer.length,
        mime_type:      meta.mime_type      || fileMime,
        file_name:      meta.file_name      || fileName,
      });
    } catch (err) {
      return res.status(502).json({ ok: false, error: err.response?.data?.description || err.message });
    }
  });

  bb.on('error', err => res.status(400).json({ ok: false, error: err.message }));
  req.pipe(bb);
};

module.exports.config = { api: { bodyParser: false } };
