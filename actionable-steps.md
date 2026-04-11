# Learning Ruby on Rails — Actionable Steps

> **Goal**: Rebuild the Node.js raw HTTP server in Ruby on Rails.
> Compare every line of Rails code to the existing Node.js implementation to build a mental model.
> This file is a living document — updated with learnings, pitfalls, and errors as we go.

---

## Context: What We Already Built (Node.js)

| File | What it does |
|------|-------------|
| `server.js` | Raw TCP server using `net.createServer`. Accepts socket connections, reads raw bytes. |
| `parseRequest.js` | Manually parses HTTP bytes — splits on `\r\n\r\n`, extracts method/path/headers/body. |
| `buildResponse.js` | Manually serializes HTTP response — status line, headers, body. |
| `statusCodes.js` | Lookup maps for status text and error response bodies. |

---

## Mental Model: Node.js → Rails Mapping

| Your Node.js code | Rails equivalent | Notes |
|---|---|---|
| `net.createServer` + `socket.on('data')` | **Puma** + **Rack** | You never write this in Rails. It's the web server layer. |
| `chunk.toString()` + splitting on `\r\n` | **ActionDispatch::Request** | Rails parses the raw HTTP bytes for you. |
| `buildResponse.js` | **ActionDispatch::Response** | Rails builds and sends the response for you. |
| `if path === '/' && method === 'GET'` | **config/routes.rb** | Declarative routing instead of if/else. |
| The handler block inside each if branch | **Controller action** (a method in a class) | Each route maps to a method in a controller file. |
| `statusCodes.js` | Built into Rails | `render json: ..., status: :ok` etc. |
| `socket.write(response); socket.end()` | `render json: ...` | Rails handles writing and closing for you. |

---

## Phase 1 — Ruby Syntax Basics

**Status**: [ ] Not started

**Goal**: Read and write `.rb` files without confusion. Not a full Ruby course — only what you need for Rails.

### Checklist
- [ ] Variables — `x = 5` (no `const`/`let`)
- [ ] Methods — `def foo; end`
- [ ] String interpolation — `"Hello #{name}"`
- [ ] Symbols — `:name` (immutable key, like a locked string — used everywhere in Rails)
- [ ] Hashes — `{ name: "John" }` (like a JS object)
- [ ] Arrays and iteration — `arr.each { |x| puts x }`
- [ ] Blocks — `do |x| ... end` or `{ |x| ... }` (like JS callbacks)
- [ ] Classes — `class Foo; def bar; end; end`
- [ ] `require` / `require_relative` (like `require`/`import` in Node)
- [ ] `nil` (not `null`/`undefined`)
- [ ] Truthiness — only `false` and `nil` are falsy (unlike JS where `0`, `""` are falsy)

### Key Differences from TS/JS — Watch Out For These

| JS/TS | Ruby | Gotcha |
|-------|------|--------|
| `null` / `undefined` | `nil` | Only one null value in Ruby |
| `===` strict equality | `==` (Ruby's `==` is already strict by type) | No `===` operator |
| `0` is falsy | `0` is **truthy** | Very common bug for JS devs |
| `""` is falsy | `""` is **truthy** | Same — only `nil` and `false` are falsy |
| Arrow function `x => x + 1` | Block `{ \|x\| x + 1 }` or `proc { \|x\| x + 1 }` | — |
| `console.log` | `puts` / `p` | `p` prints with type info, good for debugging |
| `require('module')` | `require 'gem'` / `require_relative './file'` | — |
| Semicolons optional | No semicolons, newlines end statements | — |

---

## Phase 2 — Setup

**Status**: [ ] Not started

### Steps
- [ ] Check Ruby: `ruby -v` (need 3.x)
- [ ] Check Rails: `rails -v`
- [ ] If not installed: install `rbenv`, then `rbenv install 3.3.0`, then `gem install rails`
- [ ] Create new Rails API app: `rails new http-rails --api -T`
  - `--api` — strips out views, cookies, browser middleware (we only need JSON responses, just like our Node server)
  - `-T` — skips test files (keep it lean for learning)

### What `rails new` generates — mapped to your Node.js project

| Rails file/folder | Node.js equivalent |
|---|---|
| `config/routes.rb` | The `if/else` block in `server.js` |
| `app/controllers/` | The handler code inside each `if` branch |
| `config/application.rb` | Your `server.js` setup/config |
| `Gemfile` | `package.json` |
| `Gemfile.lock` | `package-lock.json` / `yarn.lock` |
| No equivalent | `parseRequest.js` — Rails/Rack handles this |
| No equivalent | `buildResponse.js` — Rails handles this |
| No equivalent | `statusCodes.js` — Rails has `:ok`, `:not_found` etc built in |

---

## Phase 3 — Build the Rails HTTP Server

**Status**: [ ] Not started

### Step 3.1 — Define Routes

**Node.js** (`server.js`):
```js
if (path === '/' && method === 'GET') { ... }
else if (path === '/about' && method === 'GET') { ... }
else if (path === '/create-user' && method === 'POST') { ... }
```

**Rails** (`config/routes.rb`):
```ruby
Rails.application.routes.draw do
  get  '/',            to: 'pages#home'
  get  '/about',       to: 'pages#about'
  post '/create-user', to: 'users#create'
end
```

- [ ] Add the 3 routes to `config/routes.rb`

---

### Step 3.2 — Create Controllers

**Node.js**: handler code was inline in `server.js`

**Rails**: each route maps to a method (called an **action**) inside a controller class

`app/controllers/pages_controller.rb`:
```ruby
class PagesController < ApplicationController
  def home
    render json: { message: 'Welcome to the home page' }, status: :ok
  end

  def about
    render json: { message: 'This is the about page' }, status: :ok
  end
end
```

`app/controllers/users_controller.rb`:
```ruby
class UsersController < ApplicationController
  def create
    render json: { message: 'User created' }, status: :created
  end
end
```

- [ ] Create `pages_controller.rb` with `home` and `about` actions
- [ ] Create `users_controller.rb` with `create` action

---

### Step 3.3 — Error Handling (404, 405, 500)

**Node.js** (`server.js`):
```js
} else {
  response = buildResponse(404, ERROR_RESPONSES[404]);
}
```

**Rails**: handled in `ApplicationController` using `rescue_from` and routing fallbacks

```ruby
# config/routes.rb — catch-all for 404
match '*path', to: 'application#not_found', via: :all
```

```ruby
# app/controllers/application_controller.rb
def not_found
  render json: { error: 'Not Found' }, status: :not_found
end
```

- [ ] Add 404 catch-all route
- [ ] Add `not_found` action to `ApplicationController`
- [ ] Handle 500 with `rescue_from StandardError`

---

### Step 3.4 — Test with curl

Same curl commands from `curl-commands.md` should work against the Rails server on port 3000.

- [ ] `rails server` — starts on port 3000 by default
- [ ] Test `GET /`
- [ ] Test `GET /about`
- [ ] Test `POST /create-user` with JSON body
- [ ] Test 404 — unknown route
- [ ] Test 405 — wrong method on known route (note: Rails returns 404 by default, not 405 — see Pitfalls)

---

## Phase 4 — Go Deeper (After Phase 3 Works)

**Status**: [ ] Not started

These map directly to files you built from scratch in Node.js.

- [ ] **Rack middleware** — equivalent to your `parseRequest.js`. Learn how Rack sits between Puma and Rails and parses raw HTTP.
- [ ] **ActionDispatch::Request** — how Rails exposes `request.method`, `request.path`, `request.headers`, `request.body`
- [ ] **ActionDispatch::Response** — how Rails builds the HTTP response string under the hood
- [ ] **Puma** — the TCP server, equivalent to `net.createServer`

---

## Pitfalls & Errors Log

> Updated as we encounter them.

### [PENDING] 405 Method Not Allowed
- **What happens**: In your Node.js server, you explicitly return 405 when a route exists but the wrong HTTP method is used.
- **Rails default**: Rails returns **404** (routing error), not 405, for method mismatches.
- **Fix**: Requires custom routing constraints or `rescue_from ActionController::RoutingError`.
- **Status**: Not yet implemented.

---

## Learnings Log

> Updated as we go.

---

## Commands Reference

```bash
# Start Rails server
rails server

# Generate a controller
rails generate controller Pages home about

# Check routes
rails routes

# Ruby version
ruby -v

# Rails version
rails -v
```

---

## Resources

- Node.js project: `/Users/bhadrakeralavarma/Desktop/http/`
- Rails project: (to be created)
- Ruby docs: https://ruby-doc.org
- Rails guides: https://guides.rubyonrails.org
