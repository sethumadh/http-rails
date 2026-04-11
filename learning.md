# Learning Log — Ruby on Rails

> All questions, answers, and explanations captured from every session.
> Run `update-learnings` to append new session learnings.

---

## Session 1 — Setup & Orientation

---

### Q: What is this Node.js repo?

**A:**
A from-scratch HTTP/1.1 server built on Node.js's raw TCP layer (`net` module). No frameworks. It manually parses HTTP bytes and serializes HTTP responses.

| File | Role |
|------|------|
| `server.js` | Raw TCP server. Accepts socket connections, reads raw bytes, routes requests. |
| `parseRequest.js` | Manually parses HTTP — splits on `\r\n\r\n`, extracts method/path/headers/body. |
| `buildResponse.js` | Manually serializes HTTP response — status line, headers, JSON body. |
| `statusCodes.js` | Lookup maps for status text and error response bodies. |

---

### Q: I want to learn Ruby on Rails by building the same server. What are the action steps?

**A:**

**Do NOT start with a full Ruby course.** Learn just enough Ruby to read `.rb` files, then jump into Rails.

#### Node.js → Rails mental model

| Your Node.js code | Rails equivalent |
|---|---|
| `net.createServer` + `socket.on('data')` | Puma (web server) + Rack (middleware interface) — you never touch this |
| `parseRequest.js` | ActionDispatch::Request — Rails parses raw HTTP for you |
| `buildResponse.js` | ActionDispatch::Response — Rails builds the response for you |
| `if path === '/' && method === 'GET'` | `config/routes.rb` — declarative routing |
| Handler block inside each `if` branch | Controller action (a method in a class) |
| `statusCodes.js` | Built into Rails — `:ok`, `:not_found`, `:created` etc. |
| `socket.write(response); socket.end()` | `render json: ...` — Rails handles write and close |

#### Action steps
1. **Phase 1** — Ruby syntax basics (2–3 hours, not a full course)
2. **Phase 2** — Setup: install rbenv, Ruby 3.x, Rails
3. **Phase 3** — Build the same 3 routes in Rails, comparing to your Node.js code line by line
4. **Phase 4** — Go deeper: Rack middleware, ActionDispatch internals

---

### Q: Ruby syntax — what do I need to know as a TS dev?

**A:**

The concepts that will trip you up:

| JS/TS | Ruby | Gotcha |
|-------|------|--------|
| `const x = 5` | `x = 5` | No declaration keyword |
| `function foo() {}` | `def foo; end` | — |
| `"Hello ${name}"` | `"Hello #{name}"` | `#{}` not `${}` |
| `{ key: value }` object | `{ key: value }` Hash | Similar syntax, different type |
| `:symbol` doesn't exist | `:name` — immutable string key | Used everywhere in Rails |
| `arr.forEach(x => ...)` | `arr.each { \|x\| ... }` | Blocks instead of arrow functions |
| `null` / `undefined` | `nil` | Only one null value |
| `0` is falsy | `0` is **truthy** | Very common bug for JS devs |
| `""` is falsy | `""` is **truthy** | Only `nil` and `false` are falsy |
| `===` strict equality | `==` | Ruby's `==` is already strict |
| `console.log` | `puts` / `p` | `p` prints with type info — better for debugging |
| `require('module')` | `require 'gem'` | No parens needed |

---

### Q: Setting up Ruby — rbenv PATH issue

**Problem:** After `rbenv install 3.3.0` and `rbenv global 3.3.0`, running `ruby -v` still showed the old system Ruby (2.6.10).

**Root cause:** `.zshrc` had `eval "$(rbenv init - zsh)"` but was missing `export PATH="$HOME/.rbenv/bin:$PATH"`. The `eval` line needs rbenv's binary on `PATH` first before it can set up shims.

**Fix:**
```bash
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
ruby -v      # should show 3.3.0
which ruby   # should show ~/.rbenv/shims/ruby
```

**`.zshrc` must have both lines in this order:**
```
export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init - zsh)"
```

**Lesson:** rbenv works by injecting "shims" (fake executables) at the front of your PATH that intercept calls to `ruby`, `gem`, `rails` etc. and redirect them to the right version. If rbenv's bin isn't on PATH first, the shims never get set up.

**Analogy to Node:** `rbenv` is to Ruby what `nvm` is to Node.

---

### Q: What does `rails new http-rails --api -T` do? Specifically `--api`?

**A:**

A full Rails app is built for **browsers** — it has a middleware stack for sessions, cookies, CSRF protection, HTML rendering. None of that exists in a JSON API server.

`--api` strips all browser concerns out and gives you a minimal stack.

| Layer | Full Rails | `--api` Rails | Your Node.js server |
|---|---|---|---|
| Views (HTML templates) | Included | **Removed** | Never existed |
| Cookie middleware | Included | **Removed** | Never existed |
| Session middleware | Included | **Removed** | Never existed |
| CSRF protection | Included | **Removed** | Never existed |
| JSON rendering | Included | Included | You built this in `buildResponse.js` |
| Routing | Included | Included | Your `if/else` in `server.js` |
| Request parsing | Included | Included | Your `parseRequest.js` |

**Middleware count:**
- Full Rails: ~23 middlewares
- `--api` Rails: ~11 middlewares
- Your Node.js server: **0** — you were at raw TCP

Your Node.js server was already API-only by nature — you built it from scratch and never added browser concerns. `--api` tells Rails to start from that same minimal baseline.

**`-T`** — skips test file generation. Keeps the project lean while learning.

---

---

## Session 2 — 2026-04-11

---

### Q: Built a Router class to abstract routing out of server.js. How does it work?

**A:**

Created [router.js](router.js) — a `Router` class that encapsulates route registration and lookup.

```js
class Router {
  constructor() { this.routes = []; }

  get(path, handler) { ... }
  post(path, handler) { ... }

  resolve(method, path) {
    // returns { handler, methodNotAllowed }
  }
}
```

Routes are registered as `{ method, path, handler }` entries. `resolve()` finds a match, and if the path exists but the method doesn't, it returns `methodNotAllowed: true` — so the server can still return 405 vs 404 correctly.

**server.js before:**
```js
if (path === '/' && method === 'GET') {
  response = buildResponse(200, { message: 'Welcome to the home page' });
} else if ...
```

**server.js after:**
```js
router.get('/', () => buildResponse(200, { message: 'Welcome to the home page' }));
// ...
const { handler, methodNotAllowed } = router.resolve(method, path);
```

**Rails parallel:** This is exactly what `config/routes.rb` does — `get '/', to: 'pages#home'` — except Rails points to a controller method, not an inline function.

---

### Q: Is Ruby and Rails two languages? Is it backend or frontend?

**A:**

**Ruby** is the language. **Rails** is a framework written in Ruby.
Same relationship as: **TypeScript** is the language, **Express** is the framework.

| Concept | Your world | Rails world |
|---|---|---|
| Language | TypeScript | Ruby |
| Web framework | Express | Rails |
| Package manager | npm | Bundler (`Gemfile` = `package.json`) |
| Packages | npm packages | Gems |
| Runtime | Node.js | Ruby interpreter |

**Rails is backend only.** It handles HTTP, routing, database, templating. Not a frontend language.

---

### Q: Key differences from Node/Express?

**A:**

**1. Convention over configuration**

Express is a blank slate — you wire everything manually (exactly like your `server.js` where you built a router from scratch). Rails gives you the full structure upfront. Routes, controllers, models, DB migrations all have a prescribed place.

**2. Rails router vs your Router class**

Your `router.get('/', handler)` maps directly to Rails' `config/routes.rb`:
```ruby
get '/', to: 'pages#home'
```
The difference: Rails routes point to a **controller method**, not an inline function.

**3. Ruby syntax vs TypeScript**

```ruby
# Ruby
3.times { puts "hello" }
users.select { |u| u.active? }.map { |u| u.name }
```
```ts
// TS equivalent
Array(3).fill(null).forEach(() => console.log("hello"));
users.filter(u => u.active).map(u => u.name);
```

- No type annotations by default — dynamically typed
- No `{}` blocks or `;` — scope ends with `end` keyword
- Everything is an object: `5.times`, `"hello".upcase`

**4. Batteries included**

Express = bare bones, you build everything (like you did).  
Rails = ORM (ActiveRecord), auth helpers, mailers, background jobs — all built in.

---

---

## Session 3 — 2026-04-11 — Routing Mental Model

---

### Q: Where does Rails routing point instead of an inline function?

**A:**

In Node.js (`router.js`), the route registration and the handler logic are bundled together:
```js
router.get('/', () => buildResponse(200, { message: 'Welcome' }));
//              ↑ logic lives right here, inline
```

Rails separates them entirely:

```
Node.js way:   route + handler = one thing
Rails way:     route declaration → points to → a method in a class (Controller)
```

`config/routes.rb`:
```ruby
get "/", to: "pages#home"
#              ↑      ↑
#         class name  method name inside that class
```

`app/controllers/pages_controller.rb`:
```ruby
class PagesController
  def home
    # this is your handler — the arrow function equivalent
  end
end
```

**Key insight:** Your `router.js` bundled registration + logic together. Rails pulls them apart. The router only knows *where to send the request*. The controller only knows *what to do with it*. This is the Single Responsibility Principle applied at the framework level.

---

### Q: Does Rails handle 405 vs 404 out of the box (like router.js did)?

**A:**

**No.** This is a known Rails gotcha.

Your `resolve()` was explicit about the distinction:
```js
const pathExists = this.routes.some(r => r.path === path);
return { handler: null, methodNotAllowed: pathExists };
// you distinguished "wrong method" vs "route doesn't exist"
```

Rails does **not** do this. A `POST /about` (which only has GET) returns **404**, not 405. Rails treats method mismatches the same as missing routes.

Fixing this requires custom routing constraints or `rescue_from`. It's a deliberate tradeoff — Rails optimises for the happy path.

---

### The Node.js → Rails side-by-side mental model

```
YOUR NODE.JS                          RAILS EQUIVALENT
─────────────────────────────────     ────────────────────────────────
router.js  ←── route registry         config/routes.rb
  routes = [{ method, path, fn }]       get "/", to: "pages#home"

  resolve(method, path)               ActionDispatch::Router (automatic)
    → { handler, methodNotAllowed }     → dispatches to controller action

  handler = inline arrow fn           app/controllers/pages_controller.rb
  () => buildResponse(200, {...})        def home; render json: {...}; end

  buildResponse(200, body)            render json: body, status: :ok
  (written manually)                  (Rails does this for you)
```

---

### Q: Rails version compatibility — Ruby 3.3 vs 3.4

**Problem:** `rails new` succeeded but then failed during `solid_cache:install` with:
```
anonymous rest parameter is also used within block (SyntaxError)
```
in `actionview-8.1.3/lib/action_view/helpers/capture_helper.rb`

**Root cause:** Rails 8.1 uses anonymous rest parameter forwarding syntax (`*`, `**` inside blocks) that was only fully supported in Ruby 3.4. Ruby 3.3 rejected it.

**Fix:** Upgrade to Ruby 3.4.2:
```bash
rbenv install 3.4.2
rbenv global 3.4.2
ruby -v           # must show 3.4.2
gem install rails  # gems are per Ruby version — reinstall needed
rm -rf http-rails
rails new http-rails --api -T
```

**Lesson:** Gems are installed per Ruby version under `~/.rbenv/versions/<version>/lib/ruby/gems/`. Switching Ruby versions means reinstalling gems.

---

---

## Session 3 — 2026-04-11

---

### Q: Does Puma open TCP sockets the same way net.createServer does?

**A:**

Yes — exactly the same thing at the OS level. Puma:

1. Opens a TCP socket via the OS kernel
2. Binds it to port 3000
3. Calls `accept` in a loop waiting for connections
4. Reads raw bytes off the socket
5. Converts bytes to string
6. Parses the HTTP request line and headers from those bytes

This is your `net.createServer()` + `socket.on('data', chunk)` + all of `parseRequest.js` lines 1–36 — done automatically by Puma, invisibly.

---

### Q: Is config.ru the one doing the parsing? Does it pipe down to each step?

**A:**

No — `config.ru` does none of the parsing. It is only a handoff point. Here is the full pipeline:

```
rails server
  └── boots Puma
        └── Puma                         # net.createServer + socket.on('data')
              └── opens TCP socket       # OS kernel, same as your net module
              └── reads raw bytes        # your chunk
              └── parses HTTP headers    # your parseRequest.js lines 1–36
              └── builds Rack env {}     # your { method, path, headers, body }
              └── calls app.call(env)
                    └── Rack
                          └── config.ru              # just says: run Rails
                                └── ActionDispatch middleware stack
                                      └── ParamsParser     # your lines 39–51
                                      └── RouteSet         # your router.js
                                            └── YOUR controller action
                                                  └── render json:
                                                        └── Puma writes response
                                                              └── closes socket
```

**Each layer explained:**

| Layer | What it does | Your Node.js equivalent |
|---|---|---|
| Puma | Opens TCP socket, reads bytes, parses HTTP request line + headers, builds Rack env | `net.createServer` + `socket.on('data')` + `parseRequest.js` lines 1–36 |
| Rack | Defines the interface contract: `app.call(env)` returns `[status, headers, body]` | Nothing — you had no interface layer |
| `config.ru` | Says "the app is Rails.application" — connector only | Nothing equivalent |
| ActionDispatch middleware stack | ~11 middlewares run in sequence (logging, IP detection, params parsing, routing) | Your `router.js` + `parseRequest.js` lines 39–51 |
| `ActionDispatch::ParamsParser` | Parses JSON body based on Content-Type | Your `parseRequest.js` lines 39–51 |
| `ActionDispatch::RouteSet` | Matches method + path to a controller | Your `router.js` `resolve()` method |
| Controller action | Your business logic | Your handler functions |
| `render json:` | Builds HTTP response + writes to socket | Your `buildResponse.js` + `socket.write()` + `socket.end()` |

**config.ru's one job:**
```ruby
run Rails.application   # ← entire file is basically this
```
It answers Rack's question: "who is `your_app`?" That's it.

---

### Q: My Rails app doesn't have Rack and ActionDispatch — or are they abstracted?

**A:**

They are already installed and running — fully abstracted. Confirmed in `Gemfile.lock`:

```
puma (8.0.0)
rack (3.2.6)
actionpack (8.1.3)   ← ActionDispatch lives inside this gem
```

`rails new` pulled them all in automatically as dependencies. They run silently on every `rails server` call. You never touch them directly — they just work.

**What was manual vs what is automatic:**

| Your code | Rails layer | Automatic? |
|---|---|---|
| `net.createServer` + `socket.on('data')` | Puma | Yes |
| `chunk.toString()` + header parsing | Puma | Yes |
| `parseRequest.js` body/JSON parsing | ActionDispatch::ParamsParser | Yes |
| `router.js` | ActionDispatch::RouteSet | Yes |
| `buildResponse.js` | `render json:` | Yes |
| `socket.write` + `socket.end` | Puma | Yes |

You built the entire stack manually. Rails ships it pre-assembled.

---

---

## Session 4 — 2026-04-11 — Controllers, Routing, Autoloading

---

### Q: Grouping routes — why `/` and `/about` go in PagesController, not separate controllers?

**A:**

One controller per *resource or logical group*, not one controller per route.

`/` and `/about` are both informational pages with no real difference in concern — they belong together under `PagesController`. Creating a separate `AboutController` for one method would violate YAGNI.

```ruby
get "/",      to: "pages#home"    # PagesController#home
get "/about", to: "pages#about"   # PagesController#about  ← same class
post "/create-user", to: "users#create"  # UsersController#create
```

Only split controllers when routes have meaningfully different concerns.

---

### Q: Is `def about` a reference to business logic, or does it execute directly?

**A:**

`def about` IS the handler — it executes directly, top to bottom. Nothing is a reference inside the method.

```
Node.js                              Rails
─────────────────────────────────    ──────────────────────────────
() => buildResponse(200, {...})   =  def about
                                       render json: {...}, status: :ok
                                     end

Arrow fn body    = method body
buildResponse()  = render json:
```

The only thing that IS a pointer is in `routes.rb`:
```ruby
get "/about", to: "pages#about"
#                  ↑ this is the reference
```

Full execution flow:
```
GET /about hits server
    ↓
routes.rb: "pages#about"  ← pointer
    ↓
Rails: PagesController.new.about  ← resolved + called
    ↓
def about runs top to bottom
    ↓
render json: {...}  ← your buildResponse() + socket.write() + socket.end()
```

---

### Q: Where is the `PagesController` class defined? Do you need to import/require it?

**A:**

It is defined at line 1 of `app/controllers/pages_controller.rb`:
```ruby
class PagesController < ApplicationController
```

**No import or require needed.** Rails uses **autoloading** — it scans `app/controllers/` on boot, loads every `*_controller.rb` file, and makes those classes available everywhere automatically.

```js
// YOUR Node.js — manual wiring required
const { Router } = require('./router')   // explicit import
const router = new Router()              // explicit instantiation
router.get('/about', fn)                 // explicit registration
```

```ruby
# RAILS — zero wiring
# routes.rb: "pages#about"
# Rails finds PagesController by name convention alone
# No require, no import, no instantiation in your code
```

The convention chain:
```
"pages#about"  (routes.rb)
    ↓ convention
PagesController  (class name)
    ↓ convention
app/controllers/pages_controller.rb  (file path)
    ↓ autoloaded on boot
def about  (method called directly)
```

---

### Q: What does `< ApplicationController` mean in `class PagesController < ApplicationController`?

**A:**

It means `PagesController` **inherits** from `ApplicationController`. Same as `extends` in TypeScript:

```ts
// TypeScript equivalent
class PagesController extends ApplicationController { ... }
```

`ApplicationController` (in `app/controllers/application_controller.rb`) is the base class all controllers inherit from. It's where you put shared behaviour — authentication checks, error handling, shared before-actions — that applies to every controller in the app.

---

### Files written — working routes

`config/routes.rb`:
```ruby
get  "/",            to: "pages#home"
get  "/about",       to: "pages#about"
post "/create-user", to: "users#create"
```

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

All three routes tested and working via `rails server` + curl.

---

---

## Session 5 — 2026-04-11 — Error Handling, Status Codes, Macros

---

### Q: What is `rescue_from` — a function? a convention?

**A:**

Neither. It is a **Rails macro** — a method that configures behaviour at class definition time, not at request time.

```
class ApplicationController loads
    ↓
rescue_from StandardError do...end  ← runs immediately at class load
    ↓
Rails registers: "if StandardError is raised anywhere, run this block"
    ↓
Request comes in later → action crashes → handler fires
```

TS equivalent mental model:
```ts
// Same idea as decorators
@CatchError(StandardError)
class ApplicationController { }
```

Other Rails macros you will see: `before_action`, `after_action`, `skip_before_action`.

---

### Q: Thrown exceptions vs intentional renders — what's the difference?

**A:**

```
THROWN EXCEPTIONS              INTENTIONAL RENDERS
────────────────────────────   ────────────────────────────────
Happen unexpectedly            You choose to send an error
Rails/Ruby raises them         You call render json: yourself
→ rescue_from catches them     → inside controller actions

Examples:                      Examples:
  unhandled crash → 500          user not found → 404
  no route match → 404           wrong password → 401
                                 validation fails → 422
```

Your Node.js had both too:
```js
// thrown — rescue_from equivalent
catch (err) { buildResponse(500, ...) }

// intentional — controller render equivalent
if (!authenticated) { buildResponse(401, ...) }
```

---

### Q: Status codes — do I need statusCodes.js in Rails?

**A:**

No. Rails replaces both jobs of `statusCodes.js` automatically.

**Job 1 — number → text string (`STATUS_CODES`):** Rails owns this entirely via symbols:

| Your number | Rails symbol |
|---|---|
| 200 | `:ok` |
| 201 | `:created` |
| 400 | `:bad_request` |
| 401 | `:unauthorized` |
| 403 | `:forbidden` |
| 404 | `:not_found` |
| 405 | `:method_not_allowed` |
| 409 | `:conflict` |
| 422 | `:unprocessable_entity` |
| 500 | `:internal_server_error` |

**Job 2 — error JSON body (`ERROR_RESPONSES`):** Rails triggers the error, you define the JSON shape — in `ApplicationController`, not in a separate file.

---

### Q: Why can't `rescue_from` catch 404 routing errors?

**A:**

Because `ActionController::RoutingError` fires in the **routing layer**, before any controller is instantiated. `rescue_from` only works inside the controller stack.

```
Request hits Rails
    ↓
Router tries to match path         ← RoutingError raised HERE
    ↓                                 (before ApplicationController exists)
Controller instantiated            ← rescue_from lives HERE
    ↓
Action runs
```

**Fix:** Use a catch-all route instead — same as your `else` branch in `router.js`:

```ruby
# routes.rb — must be LAST (first match wins, top to bottom)
match '*unmatched', to: 'application#not_found', via: :all
```

```ruby
# application_controller.rb
def not_found
  render json: { error: 'Not Found' }, status: :not_found
end
```

Why last? Rails reads routes top to bottom, first match wins — same as your `routes.find()` returning the first match.

---

### Q: What does `via: :all` mean in the catch-all route?

**A:**

It means match **any HTTP method** — GET, POST, DELETE, PATCH, etc.

```ruby
match '*unmatched', to: 'application#not_found', via: :all
#                                                 ↑
#                                    any method hits this
```

Without `via: :all` you'd need separate catch-alls per method. Your Node.js `else` branch also implicitly caught any method.

---

### Files written — error handling complete

`app/controllers/application_controller.rb`:
```ruby
class ApplicationController < ActionController::API
  # thrown crash → 500
  # YOUR: catch (err) { buildResponse(500, ERROR_RESPONSES[500]) }
  rescue_from StandardError do
    render json: { error: 'Internal Server Error' }, status: :internal_server_error
  end

  # catch-all route → 404
  # YOUR: else { buildResponse(404, ERROR_RESPONSES[404]) }
  def not_found
    render json: { error: 'Not Found' }, status: :not_found
  end
end
```

`config/routes.rb` (catch-all added last):
```ruby
match '*unmatched', to: 'application#not_found', via: :all
```

---

### Is this building an HTTP server "from scratch" in Rails?

**No — and that's the point.**

```
Node.js project  → FROM SCRATCH (manual TCP, parsing, routing, response)
Rails project    → USING A FRAMEWORK (Rails owns all those layers)
```

You can't go from scratch in Rails. But having built it from scratch in Node.js first means you know exactly what every Rails abstraction is replacing. That's more valuable than either alone.

---

---

## Session 6 — 2026-04-11 — params, request object, 405 handling

---

### Q: How do you access request data inside a Rails controller?

**A:**

Two automatic objects available in every controller action — no passing, no importing:

```ruby
def create
  params          # parsed body + query string + URL segments — all merged
  request         # full request object — method, path, headers, raw body
end
```

**Your Node.js equivalent:**
```js
// YOUR Node.js — manually passed to every handler
handler({ method, path, queryParams, headers, body })
```

```ruby
# RAILS — automatic, always present
params[:name]                     # from body or query string
request.method                    # GET, POST etc
request.path                      # /create-user
request.headers['Content-Type']   # any header
request.query_parameters[:page]   # query string only
request.request_parameters[:name] # body only
```

Full mapping of `parseRequest.js` output → Rails:

```
parseRequest.js output    RAILS equivalent
──────────────────────    ──────────────────────────────
method                 →  request.method
path                   →  request.path
queryParams            →  request.query_parameters
headers                →  request.headers['Key']
body                   →  params[:key]
```

---

### Q: params merges body AND query string — how do I distinguish?

**A:**

By default you can't — Rails merges them. Body wins if same key appears in both.

To be explicit:
```ruby
request.query_parameters[:name]   # URL query string only
request.request_parameters[:name] # body only
params[:name]                      # merged (body wins)
```

In practice: use different keys for URL params vs body — convention prevents collision.

Dynamic URL segments (`:id`) also go into `params`:
```ruby
# PATCH /users/123  with body { "name": "John" }
params[:id]    # → "123"  (URL segment)
params[:name]  # → "John" (body)
# different keys — no collision
```

---

### Q: Ruby single quotes vs double quotes for string interpolation

**A:**

Gotcha for JS devs — Ruby only interpolates with **double quotes**:

```ruby
name = "John"

'Hello #{name}'   # → "Hello #{name}"  ← literal, NOT interpolated
"Hello #{name}"   # → "Hello John"     ← interpolated ✅
```

In JS both `'${name}'` and `"${name}"` fail the same way. In Ruby only `"#{}"` works.

**Rule:** use double quotes whenever you need interpolation.

---

### Q: How to fix 405 Method Not Allowed in Rails?

**A:**

Rails returns 404 for wrong-method requests by default — it doesn't distinguish "path exists, wrong method" from "path doesn't exist."

**Fix:** add explicit wrong-method routes between real routes and catch-all. Must be in order:

```
1. Real routes       — correct method → controller action
2. Wrong-method      — known path, wrong method → 405
3. Catch-all         — unknown path → 404
```

```ruby
# routes.rb
get  "/about",  to: "pages#about"    # ← real route (GET only)

# wrong methods on /about → 405
match "/about", to: "application#method_not_allowed",
                via: [:post, :put, :patch, :delete]

# nothing matched → 404
match '*unmatched', to: 'application#not_found', via: :all
```

```ruby
# application_controller.rb
def method_not_allowed
  render json: { error: 'Method Not Allowed' }, status: :method_not_allowed
end
```

`via: [:post, :put, :patch, :delete]` — Ruby array of symbols. Lists every method that is NOT allowed for that path.

**Your Node.js equivalent:**
```js
const pathExists = this.routes.some(r => r.path === path)
return { handler: null, methodNotAllowed: pathExists }
```

---

### Final test results — all routes working

```
GET  /                → 200  {"message":"Welcome to the home page"}
GET  /about           → 200  {"message":"This is the about page"}
POST /create-user     → 201  {"message":"User John created", "email":"..."}
POST /about           → 405  {"error":"Method Not Allowed"}
GET  /create-user     → 405  {"error":"Method Not Allowed"}
GET  /unknown         → 404  {"error":"Not Found"}
```

---

### Complete Node.js → Rails mapping

```
YOUR Node.js                     RAILS
────────────────────────────     ──────────────────────────────
net.createServer()            →  Puma
parseRequest.js               →  ActionDispatch + request object
buildResponse.js              →  render json:
statusCodes.js                →  Rails symbols (:ok, :created...)
router.js — route registry    →  config/routes.rb
router.js — handler fn        →  controller actions
router.js — resolve() 404     →  catch-all route + not_found
router.js — resolve() 405     →  explicit wrong-method routes
catch(err) → 500              →  rescue_from StandardError
```

---

## Pitfalls Encountered

| # | Pitfall | Fix |
|---|---------|-----|
| 1 | rbenv shims not activating after install | Add `export PATH="$HOME/.rbenv/bin:$PATH"` before the `eval` line in `.zshrc` |
| 2 | Rails returns 404 (not 405) for wrong HTTP method on a known route | Add explicit wrong-method routes above the catch-all |
| 3 | Rails 8.1 incompatible with Ruby 3.3 — SyntaxError on anonymous rest parameters | Upgrade to Ruby 3.4.2 via rbenv, reinstall gems |
| 4 | `rescue_from` cannot catch `ActionController::RoutingError` — fires before controller loads | Use catch-all route `match '*unmatched'` + `not_found` action instead |
| 5 | Single quotes don't interpolate in Ruby — `'Hello #{name}'` prints literally | Use double quotes `"Hello #{name}"` for interpolation |

---

---

## 🧠 Mental Model Summary — Node.js HTTP Server → Ruby on Rails

### What we built
A JSON API server with 3 routes, full error handling (404/405/500), and request data access — rebuilt in Rails by mapping every manually-written Node.js piece to its Rails equivalent.

### The shape

```
YOUR Node.js (flat, manual)        RAILS (layered, automatic)
────────────────────────────────   ──────────────────────────────────
server.js                          config.ru
  net.createServer()            →    Puma (TCP server)
  socket.on('data', chunk)      →    Rack (middleware interface)
  parseRequest(chunk)           →    ActionDispatch (request parsing)
    method, path                →      request.method, request.path
    queryParams                 →      request.query_parameters
    headers                     →      request.headers
    body                        →      params[:key]
  router.resolve(method, path)  →    config/routes.rb
    routes array                →      get "/", to: "pages#home"
    handler fn                  →      PagesController#home
    methodNotAllowed            →      explicit wrong-method routes → 405
    else → 404                  →      catch-all route → not_found
  buildResponse(status, body)   →    render json: body, status: :symbol
  socket.write + socket.end     →    Puma (automatic)
  catch(err) → 500              →    rescue_from StandardError
```

### Key decisions & why
- `--api` flag → strips browser middleware — server was always API-only
- `PagesController` groups `/` and `/about` → one controller per logical group, not per route (YAGNI + SRP)
- `rescue_from` for 500, catch-all route for 404 → routing errors fire before controller exists — two different layers need two different tools
- Wrong-method routes above catch-all → Rails matches top to bottom, first match wins
- `ApplicationController` as base → shared error handling written once, inherited by all (DRY)

### The patterns we used
- **Convention over configuration** — file names, class names, route strings follow a fixed contract, Rails wires everything automatically
- **Inheritance** — `PagesController < ApplicationController < ActionController::API` — each layer adds behaviour
- **Macro registration** — `rescue_from` registers at class load time, fires at runtime

### What would break without it
- Remove `rescue_from StandardError` → crashes return HTML, not JSON — API clients break
- Move catch-all to the top → every request hits `not_found`, real routes never reached
- Remove wrong-method routes → `POST /about` returns 404 instead of 405
- Single quotes for interpolation → `'#{name}'` prints literally

---

## ⏭️ Next Session — Start Here

> **Read this at the start of the next session before asking anything.**

Phase 1 (routing + controllers + error handling) is complete and tested. All routes work.

**Phase 2 — ActiveRecord & the Model layer**

The current `users#create` ignores the database entirely:
```ruby
def create
  name  = params[:name]
  email = params[:email]
  render json: { message: "User #{name} created", email: email }, status: :created
  # ↑ nothing is saved anywhere
end
```

Next session picks up here — in this exact order using `/build-learn`:

1. **What is ActiveRecord?** — Rails ORM, maps a Ruby class to a DB table
2. **Generate a User model** — `rails generate model User name:string email:string`
3. **Run the migration** — `rails db:migrate` — creates the `users` table
4. **Save the user** — `User.create(name: params[:name], email: params[:email])`
5. **Strong parameters** — `params.require(:user).permit(:name, :email)` — security layer
6. **Query the DB** — `User.all`, `User.find(params[:id])`

**Compare every step to Node.js** — Node.js had no ORM, no migrations, no model layer. Each Rails concept will be genuinely new but map to the raw SQL you'd otherwise write manually.

---

## Environment

| Tool | Version |
|------|---------|
| Ruby | 3.4.2 (via rbenv) |
| Rails | 8.1.3 |
| Node.js project | `/Users/bhadrakeralavarma/Desktop/http/` |
| Rails project | `/Users/bhadrakeralavarma/Desktop/http/http-rails/` |
