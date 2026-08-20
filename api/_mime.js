const map = {
  jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', gif:'image/gif',
  webp:'image/webp', svg:'image/svg+xml', bmp:'image/bmp',
  mp4:'video/mp4', mov:'video/quicktime', webm:'video/webm', avi:'video/x-msvideo',
  mp3:'audio/mpeg', ogg:'audio/ogg', wav:'audio/wav', m4a:'audio/mp4',
  pdf:'application/pdf',
  txt:'text/plain', html:'text/html', css:'text/css', js:'text/javascript',
  json:'application/json', xml:'application/xml',
};
module.exports = (filename, fallback) => {
  const ext = (filename || '').split('.').pop().toLowerCase();
  return map[ext] || fallback || 'application/octet-stream';
};
