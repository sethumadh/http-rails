const net = require('net');
const { parseRequest } = require('./parseRequest');
const { buildResponse } = require('./buildResponse');
const { ERROR_RESPONSES } = require('./statusCodes');
const { Router } = require('./router');

const router = new Router();

router.get('/', () => buildResponse(200, { message: 'Welcome to the home page' }));
router.get('/about', () => buildResponse(200, { message: 'This is the about page' }));
router.post('/create-user', () => buildResponse(201, { message: 'User created' }));
router.get('/users/:id', ({ params }) => buildResponse(200, { userId: params.id }));

const server = net.createServer((socket) => {
  let buffer = '';

  socket.on('data', (chunk) => {
    buffer += chunk.toString();

    // CHECKPOINT 1: do we have the full headers yet?
    const headerEnd = buffer.indexOf('\r\n\r\n');
    if (headerEnd === -1) return;

    // CHECKPOINT 2: do we have the full body yet?
    const headersRaw = buffer.slice(0, headerEnd);
    const contentLengthMatch = headersRaw.match(/Content-Length:\s*(\d+)/i);
    const contentLength = contentLengthMatch ? parseInt(contentLengthMatch[1]) : 0;

    const bodyReceived = buffer.length - (headerEnd + 4);
    if (bodyReceived < contentLength) return;

    // Both checkpoints passed — full request is in the buffer
    try {
      const { method, path, queryParams, httpVersion, headers, body } = parseRequest(buffer);

      console.log(`--> ${method} ${path} ${httpVersion}`);

      const { handler, params, methodNotAllowed } = router.resolve(method, path);

      let response;
      if (handler) {
        response = handler({ method, path, queryParams, params, headers, body });
      } else if (methodNotAllowed) {
        response = buildResponse(405, ERROR_RESPONSES[405]);
      } else {
        response = buildResponse(404, ERROR_RESPONSES[404]);
      }

      socket.write(response);
      socket.end();
      buffer = '';

    } catch (err) {
      console.error('Request handling error:', err.message);
      const response = buildResponse(500, ERROR_RESPONSES[500]);
      socket.write(response);
      socket.end();
      buffer = '';
    }
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err.message);
  });
});

// Global error handler
server.on('error', (err) => {
  console.error('Server error:', err.message);
  process.exit(1);
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
