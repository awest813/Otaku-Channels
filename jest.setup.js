import '@testing-library/jest-dom/extend-expect';

// Allow router mocks.
// eslint-disable-next-line no-undef
jest.mock('next/router', () => require('next-router-mock'));

// Polyfill Web Fetch API (Request / Response / Headers) for environments that
// don't provide them (Jest 27 node/jsdom environments on Node < 18 globals).
// Next.js App Router route handlers rely on these globals at class-definition time.
if (typeof global.Headers === 'undefined') {
  // eslint-disable-next-line no-undef
  global.Headers = class Headers {
    constructor(init = {}) {
      this._h = {};
      if (init && typeof init === 'object') {
        Object.entries(init).forEach(([k, v]) => {
          this._h[k.toLowerCase()] = String(v);
        });
      }
    }
    get(name) {
      return this._h[name.toLowerCase()] ?? null;
    }
    set(name, value) {
      this._h[name.toLowerCase()] = String(value);
    }
    has(name) {
      return name.toLowerCase() in this._h;
    }
    append(name, value) {
      const k = name.toLowerCase();
      this._h[k] = this._h[k] ? `${this._h[k]}, ${value}` : String(value);
    }
    delete(name) {
      delete this._h[name.toLowerCase()];
    }
    forEach(fn) {
      Object.entries(this._h).forEach(([k, v]) => fn(v, k, this));
    }
    entries() {
      return Object.entries(this._h)[Symbol.iterator]();
    }
    keys() {
      return Object.keys(this._h)[Symbol.iterator]();
    }
    values() {
      return Object.values(this._h)[Symbol.iterator]();
    }
    [Symbol.iterator]() {
      return this.entries();
    }
  };
}

if (typeof global.Response === 'undefined') {
  // eslint-disable-next-line no-undef
  global.Response = class Response {
    constructor(body, init = {}) {
      this._body = body == null ? '' : String(body);
      // Expose as .body (mirrors the Web API ReadableStream field name)
      this.body = this._body;
      this.status = (init && init.status) || 200;
      this.statusText = (init && init.statusText) || '';
      // eslint-disable-next-line no-undef
      this.headers = new global.Headers((init && init.headers) || {});
      this.ok = this.status >= 200 && this.status < 300;
      this.url = '';
    }
    static json(data, init = {}) {
      const body = JSON.stringify(data);
      // eslint-disable-next-line no-undef
      const headers = new global.Headers({
        'content-type': 'application/json',
        ...((init && init.headers) || {}),
      });
      // eslint-disable-next-line no-undef
      return new global.Response(body, { ...init, headers });
    }
    async json() {
      return JSON.parse(this._body || this.body);
    }
    async text() {
      return this._body;
    }
    clone() {
      // eslint-disable-next-line no-undef
      return new global.Response(this._body, {
        status: this.status,
        statusText: this.statusText,
        headers: this.headers,
      });
    }
  };
}

if (typeof global.Request === 'undefined') {
  // eslint-disable-next-line no-undef
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = typeof input === 'string' ? input : input.url;
      this.method = ((init && init.method) || 'GET').toUpperCase();
      // eslint-disable-next-line no-undef
      this.headers = new global.Headers((init && init.headers) || {});
      this._body = (init && init.body) || null;
    }
    async json() {
      return JSON.parse(this._body);
    }
    async text() {
      return this._body || '';
    }
    clone() {
      // eslint-disable-next-line no-undef
      return new global.Request(this.url, {
        method: this.method,
        headers: this.headers,
        body: this._body,
      });
    }
  };
}
