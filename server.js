const net = require('net');
const { parseRequest } = require('./parseRequest');
const { buildResponse } = require('./buildResponse');
const { ERROR_RESPONSES } = require('./statusCodes');
const { Router } = require('./router');

const router = new Router();

router.get('/', () => buildResponse(200, { message: 'Welcome to the home page' }));
router.get('/about', () => buildResponse(200, { message: 'This is the about page' }));
router.post('/create-user', () => buildResponse(201, { message: 'User created' }));

const server = net.createServer((socket) => {
  socket.on('data', (chunk) => {
    try {
      const { method, path, queryParams, httpVersion, headers, body } = parseRequest(chunk);

    console.log(`--> ${method} ${path} ${httpVersion}`);

      const { handler, methodNotAllowed } = router.resolve(method, path);

      let response;
      if (handler) {
        response = handler({ method, path, queryParams, headers, body });
      } else if (methodNotAllowed) {
        response = buildResponse(405, ERROR_RESPONSES[405]);
      } else {
        response = buildResponse(404, ERROR_RESPONSES[404]);
      }

      socket.write(response);
      socket.end();

    } catch (err) {
      console.error('Request handling error:', err.message);
      const response = buildResponse(500, ERROR_RESPONSES[500]);
      socket.write(response);
      socket.end();
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
