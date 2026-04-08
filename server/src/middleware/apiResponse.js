const apiResponse = require('../common/utils/apiResponse');

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const hasStandardEnvelope = (body) => isPlainObject(body) && (
  Object.prototype.hasOwnProperty.call(body, 'success')
  || Object.prototype.hasOwnProperty.call(body, 'error')
  || Object.prototype.hasOwnProperty.call(body, 'timestamp')
);

const wrapSuccessPayload = (body) => {
  if (hasStandardEnvelope(body) || body === undefined || body === null) {
    return body;
  }

  const timestamp = new Date().toISOString();

  if (Array.isArray(body)) {
    return { success: true, data: body, timestamp };
  }

  if (!isPlainObject(body)) {
    return { success: true, data: body, timestamp };
  }

  return {
    success: true,
    data: body,
    timestamp,
    ...body,
  };
};

const wrapErrorPayload = (body) => {
  if (hasStandardEnvelope(body) || body === undefined || body === null) {
    return body;
  }

  const timestamp = new Date().toISOString();

  if (!isPlainObject(body)) {
    return {
      success: false,
      error: { message: String(body || 'Request failed') },
      timestamp,
    };
  }

  const message = typeof body.message === 'string' && body.message.trim() ? body.message : 'Request failed';
  const details = Object.prototype.hasOwnProperty.call(body, 'details') ? body.details : body;

  return {
    success: false,
    error: { message, details },
    timestamp,
    ...body,
  };
};

module.exports = function apiResponseMiddleware(req, res, next) {
  const originalJson = res.json.bind(res);

  res.success = (data, statusCode = 200) => apiResponse.success(res, data, statusCode);
  res.fail = (message, statusCode = 500, details = null) => apiResponse.error(res, message, statusCode, details);

  res.json = (body) => {
    const wrapped = (res.statusCode || 200) >= 400 ? wrapErrorPayload(body) : wrapSuccessPayload(body);
    return originalJson(wrapped);
  };

  next();
};
