/**
 * Validate that a URL points to a legitimate upload from this server.
 * Prevents users from setting arbitrary URLs (javascript:, data:, external)
 * as their profile photo or other uploaded file references.
 *
 * @param {string} url - The URL to validate
 * @param {string[]} allowedPrefixes - Array of allowed path prefixes (e.g. ['/uploads/profile-photos/'])
 * @returns {boolean} True if the URL is valid
 */
function isValidUploadUrl(url, allowedPrefixes) {
  if (!url || typeof url !== 'string') return false;

  // Must match at least one allowed prefix
  return allowedPrefixes.some((prefix) => url.startsWith(prefix));
}

module.exports = { isValidUploadUrl };
