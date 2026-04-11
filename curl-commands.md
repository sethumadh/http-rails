# Curl Commands

Start the server first:
```
node server.js
```

---

## GET /
```
curl -v http://localhost:3000/
```

## GET /about
```
curl -v http://localhost:3000/about
```

## GET / with query params
```
curl -v "http://localhost:3000/?name=john&age=30"
```

## POST /create-user
```
curl -v -X POST http://localhost:3000/create-user \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}'
```

## 404 — unknown route
```
curl -v http://localhost:3000/unknown
```

## 405 — wrong method on a known route
```
curl -v -X POST http://localhost:3000/about
```
```
curl -v -X GET http://localhost:3000/create-user
```
