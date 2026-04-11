function parseRequest(chunk) {
  const raw = chunk.toString();

  // Split head and body on the blank line that separates them
  const [headerSection, ...bodyParts] = raw.split('\r\n\r\n');
  const rawBody = bodyParts.join('\r\n\r\n');

  // First line: METHOD /path?query HTTP/version
  const lines = headerSection.split('\r\n');
  const requestLine = lines[0];
  const [method, fullPath, httpVersion] = requestLine.split(' ');

  // Split path and query string
  const questionMark = fullPath.indexOf('?');
  const path = questionMark === -1 ? fullPath : fullPath.slice(0, questionMark);
  const queryString = questionMark === -1 ? '' : fullPath.slice(questionMark + 1);

  // Parse query params into an object
  const queryParams = {};
  if (queryString) {
    queryString.split('&').forEach((pair) => {
      const [key, value] = pair.split('=');
      queryParams[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
  }

  // Parse headers into an object (keys lowercased)
  const headers = {};
  for (let i = 1; i < lines.length; i++) {
    const colonIndex = lines[i].indexOf(':');
    if (colonIndex !== -1) {
      const key = lines[i].slice(0, colonIndex).trim().toLowerCase();
      const value = lines[i].slice(colonIndex + 1).trim();
      headers[key] = value;
    }
  }

  // Parse body — JSON if content-type says so, otherwise raw string
  let body = null;
  if (rawBody) {
    const contentType = headers['content-type'] || '';
    if (contentType.includes('application/json')) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        body = rawBody;
      }
    } else {
      body = rawBody;
    }
  }

  return { method, path, queryParams, httpVersion, headers, body };
}

module.exports = { parseRequest };
