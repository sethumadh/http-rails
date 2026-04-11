class Router {
  constructor() {
    this.routes = [];
  }

  #addRoute(method, path, handler) {
    this.routes.push({ method, path, handler });
  }

  get(path, handler) {
    this.#addRoute('GET', path, handler);
  }

  post(path, handler) {
    this.#addRoute('POST', path, handler);
  }

  put(path, handler) {
    this.#addRoute('PUT', path, handler);
  }

  delete(path, handler) {
    this.#addRoute('DELETE', path, handler);
  }

  // Returns { handler, methodNotAllowed } for a given method + path.
  // methodNotAllowed is true when the path exists but the method doesn't match.
  resolve(method, path) {
    const handler = this.routes.find(r => r.method === method && r.path === path);
    if (handler) return { handler: handler.handler, methodNotAllowed: false };

    const pathExists = this.routes.some(r => r.path === path);
    return { handler: null, methodNotAllowed: pathExists };
  }
}

module.exports = { Router };
