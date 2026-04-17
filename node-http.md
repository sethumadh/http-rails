# Node HTTP Server — Learning Notes

---

## Session 1-6 (Prior)
- Built TCP server using `net` module
- Wrote `parseRequest` — parses method, path, query params, headers, body
- Wrote `buildResponse` — builds HTTP response string with correct headers
- Built `Router` with GET/POST/PUT/DELETE, 404/405 handling
- Added `Content-Type` header reading and JSON body parsing

---

## Session 7 — Route Params & Chunked Requests

### Route Params — `/users/:id`

**Where does param extraction happen?**
- NOT in `parseRequest` — it only sees the raw URL string e.g. `/users/42`
- It has no knowledge of registered routes
- You cannot know `42` is an `:id` without knowing the pattern `/users/:id`
- Pattern matching belongs in `router.resolve()` — the only place that has both the pattern and the incoming path

**Why not parse `:id` in parseRequest even if ":" is present in pattern?**
- The colon never appears in the incoming URL — the client sends `/users/42`, never `/users/:id`
- The colon is your convention, defined in your router
- `parseRequest` parses what the client sent — it cannot interpret your conventions

**Why query params ARE parsed in parseRequest:**
- Query params are self-contained in the URL — `?key=value` is a universal HTTP convention
- No route knowledge needed to parse them
- Rule: if derivable from the raw URL alone → `parseRequest`. If you need a route pattern → router.

**How `matchRoute` works:**
```
pattern: /users/:id   → ["users", ":id"]
path:    /users/42    → ["users", "42"]

segment 1: "users" === "users"  → exact match
segment 2: ":id" starts with ":" → dynamic, capture { id: "42" }
```
- If segment counts differ → no match
- If a static segment doesn't match exactly → no match
- Returns `{ matched, params }`

**What changed in code:**
- `router.js` — added `#matchRoute` private method, updated `resolve` to loop over routes using it, returns `params`
- `server.js` — destructures `params` from `resolve`, passes it to handler
- Registered test route: `router.get('/users/:id', ({ params }) => buildResponse(200, { userId: params.id }))`

---

### Chunked / Partial Request Handling

**The problem:**
- TCP is a byte stream — it does not guarantee a full HTTP request arrives in one `data` event
- Parsing on the first chunk means parsing a broken, incomplete request
- Large bodies or slow connections split requests across multiple chunks

**Mental model — the buffer as a waiting room:**
- Every `data` event: append to buffer first, never parse immediately
- Only parse when you have confirmed the full request is in the buffer
- Two checkpoints to verify completeness:

```
CHECKPOINT 1: do we have full headers?
  → look for \r\n\r\n in buffer
  → if not found → return, wait for next chunk

CHECKPOINT 2: do we have the full body?
  → extract Content-Length from headers
  → bodyReceived = buffer.length - (headerEnd + 4)
  → if bodyReceived < contentLength → return, wait for next chunk

Both pass → safe to parse
```

**Content-Length:**
- Set automatically by the HTTP client (browser, axios, curl) — you never set it manually on requests
- You already set it on responses in `buildResponse` using `Buffer.byteLength`
- Must be byte count, not character count — `Buffer.byteLength("café") = 5`, not 4

**Bytes vs characters:**
- 1 byte = 1 character only for ASCII (English letters, digits, symbols)
- Non-ASCII characters take 2-4 bytes (é = 2, 中 = 3, 😀 = 4)
- Always use `Buffer.byteLength()` not `.length` for Content-Length

**How `return` works inside the data callback:**
- `return` exits ONE invocation of the callback — not the callback registration
- `socket.on('data', callback)` stores the callback on the socket object
- `return` cannot touch that registration — they are in completely different places
- Next chunk arrives → same callback called again → same buffer still intact (closure)

**How Node.js knows which callback to call:**
- OS identifies each TCP connection by its 4-tuple: `(client IP, client port, server IP, server port)`
- Node.js maps each connection to a socket object
- Each socket object holds its own callback and buffer in a closure
- When a chunk arrives, OS identifies the connection → Node.js finds the socket → calls its callback

**Socket lifecycle:**
```
client connects → socket created → buffer = '' → data callback registered → ALIVE

chunk 1 → callback called → CP1 fail → return → ALIVE
chunk 2 → callback called → CP2 fail → return → ALIVE
chunk 3 → callback called → both pass → parse → respond
  → socket.write(response)
  → socket.end()   ← socket closes HERE, callback unregistered, buffer gone
```
- Socket stays alive until `socket.end()`, `socket.destroy()`, or client disconnects
- `return` does nothing to the socket's lifetime

**What changed in code:**
- `server.js` — `buffer` declared per connection (outside `data` handler)
- Two checkpoint `return`s before `parseRequest` is called
- `buffer = ''` reset after handling (success and error paths)

---

## Key Mental Models

| Question | Answer |
|---|---|
| Where does param extraction happen? | `router.resolve` — needs the pattern |
| Where does query param parsing happen? | `parseRequest` — self-contained in URL |
| What does `return` do inside a callback? | Exits that one invocation only |
| What keeps the buffer alive across chunks? | Closure — buffer is in scope of the data callback |
| What kills a socket? | `socket.end()` / `socket.destroy()` / client disconnect |
| Who sets Content-Length on requests? | The HTTP client (browser/axios/curl) automatically |
