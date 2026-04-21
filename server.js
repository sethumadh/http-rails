const net = require("net");
const path = require('path'); 
const fs = require("fs");

const { parseRequest } = require("./parseRequest");
const { buildResponse } = require("./buildResponse");
const { ERROR_RESPONSES } = require("./statusCodes");
const { Router } = require("./router");
const { MIME_TYPES } = require("./mimeType");

function runMiddlewares(middlewares, req, whenAllDone) {
  let i = 0;

  function go() {
    if (i < middlewares.length) {
      middlewares[i++](req, go);
    } else {
      whenAllDone();
    }
  }

  go();
}

const router = new Router();

router.get("/", () =>
  buildResponse(200, { message: "Welcome to the home page" }),
);
router.get("/about", () =>
  buildResponse(200, { message: "This is the about page" }),
);
router.post("/create-user", (req) => {
  console.log(req.body, "--------");
  return buildResponse(201, { message: "User created" });
});
router.get("/users/:id", ({ params }) =>
  buildResponse(200, { userId: params.id }),
);
router.use(function logger(req, next) {
  console.log(`[middleware] ${req.method} ${req.path}`);
  next();
});
router.use(function jsonBodyParser(req, next) {
  const contentType = req.headers["content-type"] || "";
  if (
    contentType.includes("application/json") &&
    typeof req.body === "string"
  ) {
    req.body = JSON.parse(req.body);
  }
  next();
});

const server = net.createServer((socket) => {
  let buffer = "";

  socket.on("data", (chunk) => {
    buffer += chunk.toString();

    // CHECKPOINT 1: do we have the full headers yet?
    const headerEnd = buffer.indexOf("\r\n\r\n");
    if (headerEnd === -1) return;

    // CHECKPOINT 2: do we have the full body yet?
    const headersRaw = buffer.slice(0, headerEnd);
    const contentLengthMatch = headersRaw.match(/Content-Length:\s*(\d+)/i);
    const contentLength = contentLengthMatch
      ? parseInt(contentLengthMatch[1])
      : 0;

    const bodyReceived = buffer.length - (headerEnd + 4);
    if (bodyReceived < contentLength) return;

    // Both checkpoints passed — full request is in the buffer
    try {
      const req = parseRequest(buffer);

      const ext = path.extname(req.path);
      const filePath = `./public${req.path}`;
      try {
        const data = fs.readFileSync(filePath);
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        const response = `HTTP/1.1 200 OK\r\nContent-Type: ${contentType}\r\nContent-Length: ${data.length}\r\n\r\n`;
        socket.write(response);
        socket.write(data);
        socket.end();
        buffer = "";
        return;
      } catch (err) {
      }

      const { method, queryParams, httpVersion, headers, body } = req;

      console.log(`--> ${method} ${path} ${httpVersion}`);

      const { handler, params, methodNotAllowed } = router.resolve(
        method,
        req.path,
      );

      let response;
      if (handler) {
        runMiddlewares(router.middlewares, req, () => {
          response = handler(req);
          socket.write(response);
          socket.end();
          buffer = "";
        });
      } else if (methodNotAllowed) {
        response = buildResponse(405, ERROR_RESPONSES[405]);
        socket.write(response);
        socket.end();
        buffer = "";
      } else {
        response = buildResponse(404, ERROR_RESPONSES[404]);
        socket.write(response);
        socket.end();
        buffer = "";
      }
    } catch (err) {
      console.error("Request handling error:", err.message);
      const response = buildResponse(500, ERROR_RESPONSES[500]);
      socket.write(response);
      socket.end();
      buffer = "";
    }
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err.message);
  });
});

// Global error handler
server.on("error", (err) => {
  console.error("Server error:", err.message);
  process.exit(1);
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
