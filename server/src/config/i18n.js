// Minimal i18n stub: attach a locale based on Accept-Language header
module.exports = (req, _res, next) => {
  const header = req.headers['accept-language'] || 'en';
  req.locale = header.split(',')[0].trim().toLowerCase();
  next();
};