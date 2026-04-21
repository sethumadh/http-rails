# Build Plan — HTTP Server from Scratch

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## 1. Route Params — `/users/:id`
- [x] Support dynamic segments in router paths (e.g. `/users/:id`, `/posts/:id/comments`)
- [x] Extract matched params into an object (e.g. `{ id: '42' }`) and pass to handler
- [x] Handle conflicts between static and dynamic routes (static wins)

## 2. Chunked / Partial Request Handling
- [x] Buffer incoming `data` events instead of parsing on first chunk
- [x] Detect end of headers (`\r\n\r\n`) before parsing
- [x] Use `Content-Length` header to know when the full body has arrived

## 3. Middleware Layer
- [ ] Design a `use(fn)` API on the router or server
- [ ] Each middleware receives `(req, res, next)` and calls `next()` to continue
- [ ] Support route-level and global middleware

## 4. URL-encoded Body Parsing
- [ ] Detect `application/x-www-form-urlencoded` content type in `parseRequest`
- [ ] Parse `key=value&key2=value2` the same way query strings are parsed
- [ ] Return parsed object as `body` (consistent with JSON body parsing)

## 5. Static File Serving
- [ ] Serve files from a designated directory (e.g. `./public`)
- [ ] Set correct `Content-Type` based on file extension (`.html`, `.css`, `.js`, etc.)
- [ ] Return 404 if file not found

## 6. Keep-Alive / Persistent Connections
- [ ] Understand HTTP/1.1 keep-alive default behavior
- [ ] Buffer reset and re-use across multiple requests on the same socket
- [ ] Respect `Connection: close` header to end when needed

## 7. Response Streaming
- [ ] Stream large files directly to socket instead of loading into memory
- [ ] Natural extension of static file serving

## 8. Nginx & VPS Deployment (EC2)
- [ ] Understand why Nginx sits in front of Node (reverse proxy mental model)
- [ ] Nginx config — forward `/api/*` to Node on port 3000
- [ ] Serve static files directly from Nginx (never hits Node)
- [ ] SSL termination with Let's Encrypt
- [ ] Keep Node running with pm2
