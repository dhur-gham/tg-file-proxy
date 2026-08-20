const axios = require('axios');
const { BOT_TOKEN } = require('./_config');
const TG_API  = `https://api.telegram.org/bot${BOT_TOKEN}`;
const TG_FILE = `https://api.telegram.org/file/bot${BOT_TOKEN}`;

module.exports = async function resolve(file_id) {
  const r = await axios.post(`${TG_API}/getFile`, { file_id });
  if (!r.data.ok) { const e = new Error(r.data.description); e.status = 404; throw e; }
  const { file_path, file_size, file_unique_id } = r.data.result;
  if (!file_path) { const e = new Error('file_path unavailable — file may exceed 20 MB.'); e.status = 422; throw e; }
  return { file_path, file_size, file_unique_id, tg_url: `${TG_FILE}/${file_path}` };
};
