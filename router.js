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

  // Tries to match a pattern like /users/:id against a path like /users/42.
  // Returns { matched, params } — params is {} if no dynamic segments.
  #matchRoute(pattern, path) {
    const patternSegments = pattern.split('/');
    const pathSegments = path.split('/');

    if (patternSegments.length !== pathSegments.length) return { matched: false };

    const params = {};
    for (let i = 0; i < patternSegments.length; i++) {
      if (patternSegments[i].startsWith(':')) {
        const key = patternSegments[i].slice(1); // strip the leading ':'
        params[key] = pathSegments[i];
      } else if (patternSegments[i] !== pathSegments[i]) {
        return { matched: false };
      }
    }

    return { matched: true, params };
  }

  // Returns { handler, params, methodNotAllowed } for a given method + path.
  // methodNotAllowed is true when the path matches but the method doesn't.
  resolve(method, path) {
    for (const route of this.routes) {
      const { matched, params } = this.#matchRoute(route.path, path);
      if (matched && route.method === method) {
        return { handler: route.handler, params, methodNotAllowed: false };
      }
    }

    const pathExists = this.routes.some(r => this.#matchRoute(r.path, path).matched);
    return { handler: null, params: {}, methodNotAllowed: pathExists };
  }
}

module.exports = { Router };
