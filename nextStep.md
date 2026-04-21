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
- [x] Design a `use(fn)` API on the router or server
- [x] Each middleware receives `(req, res, next)` and calls `next()` to continue
- [x] Support route-level and global middleware

## 4. URL-encoded Body Parsing
- [ ] Detect `application/x-www-form-urlencoded` content type in `parseRequest`
- [ ] Parse `key=value&key2=value2` the same way query strings are parsed
- [ ] Return parsed object as `body` (consistent with JSON body parsing)

## 5. Static File Serving
- [x] Serve files from a designated directory (e.g. `./public`)
- [x] Set correct `Content-Type` based on file extension (`.html`, `.css`, `.js`, etc.)
- [x] Return 404 if file not found

## 6. Keep-Alive / Persistent Connections (skip for now — infrastructure concern, less practical)
- [ ] Understand HTTP/1.1 keep-alive default behavior
- [ ] Buffer reset and re-use across multiple requests on the same socket
- [ ] Respect `Connection: close` header to end when needed

## 7. Response Streaming
- [ ] Stream large files directly to socket instead of loading into memory
- [ ] Natural extension of static file serving

## 8. Nginx & VPS Deployment (EC2) ← next priority

### Step 1 — Launch EC2 Instance
- [ ] Create AWS account, launch a `t2.micro` (free tier) Ubuntu instance
- [ ] Configure security group: open ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
- [ ] Download the `.pem` key pair

### Step 2 — SSH into the server
- [ ] `ssh -i your-key.pem ubuntu@<your-ec2-ip>`

### Step 3 — Install Node.js on the server
- [ ] Install Node via `nvm` or `apt`
- [ ] Clone your repo / copy files up

### Step 4 — Run your server & verify
- [ ] `node server.js` on port 3000
- [ ] Hit `http://<ec2-ip>:3000` directly to confirm it works

### Step 5 — Install & configure Nginx
- [ ] `apt install nginx`
- [ ] Write a config that proxies `http://<ec2-ip>` → `localhost:3000`
- [ ] Understand why Nginx sits in front of Node (reverse proxy mental model)
- [ ] Serve static files directly from Nginx (never hits Node)

### Step 6 — Keep Node running with pm2
- [ ] `npm install -g pm2`
- [ ] `pm2 start server.js` — survives SSH disconnect and reboots

### Step 7 — Point a domain (optional but needed for SSL)
- [ ] Buy/use a domain, point its A record to your EC2 IP

### Step 8 — SSL with Let's Encrypt
- [ ] `certbot --nginx` — auto-configures HTTPS and renews certs
