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
  if (allowedPrefixes.some((prefix) => url.startsWith(prefix))) {
    return true;
  }

  // Allow trusted cloud-hosted uploads (Cloudinary)
  try {
    const parsed = new URL(url);
    const protocolOk = parsed.protocol === 'https:' || parsed.protocol === 'http:';
    const hostOk = parsed.hostname === 'res.cloudinary.com';
    if (!protocolOk || !hostOk) return false;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (cloudName) {
      return parsed.pathname.startsWith(`/${cloudName}/`);
    }

    // Fallback when cloud name is not configured in env
    return parsed.pathname.length > 2;
  } catch {
    return false;
  }
}

module.exports = { isValidUploadUrl };
