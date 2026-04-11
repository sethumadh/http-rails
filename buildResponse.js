const { STATUS_CODES } = require('./statusCodes');

function buildResponse(statusCode, body, extraHeaders = {}) {
  const statusText = STATUS_CODES[statusCode] || 'Unknown';
  const bodyString = typeof body === 'object' ? JSON.stringify(body) : String(body);

  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(bodyString),
    'Connection': 'close',
    ...extraHeaders,
  };

  const headerLines = Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\r\n');

  return `HTTP/1.1 ${statusCode} ${statusText}\r\n${headerLines}\r\n\r\n${bodyString}`;
}

module.exports = { buildResponse };
