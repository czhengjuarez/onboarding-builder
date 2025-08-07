var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// .wrangler/tmp/bundle-BU483c/checked-fetch.js
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
var urls;
var init_checked_fetch = __esm({
  ".wrangler/tmp/bundle-BU483c/checked-fetch.js"() {
    urls = /* @__PURE__ */ new Set();
    __name(checkURL, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// (disabled):crypto
var require_crypto = __commonJS({
  "(disabled):crypto"() {
    init_checked_fetch();
  }
});

// .wrangler/tmp/bundle-BU483c/middleware-loader.entry.ts
init_checked_fetch();

// .wrangler/tmp/bundle-BU483c/middleware-insertion-facade.js
init_checked_fetch();

// index.ts
init_checked_fetch();

// node_modules/hono/dist/index.js
init_checked_fetch();

// node_modules/hono/dist/hono.js
init_checked_fetch();

// node_modules/hono/dist/hono-base.js
init_checked_fetch();

// node_modules/hono/dist/compose.js
init_checked_fetch();
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/context.js
init_checked_fetch();

// node_modules/hono/dist/request.js
init_checked_fetch();

// node_modules/hono/dist/request/constants.js
init_checked_fetch();
var GET_MATCH_RESULT = Symbol();

// node_modules/hono/dist/utils/body.js
init_checked_fetch();
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// node_modules/hono/dist/utils/url.js
init_checked_fetch();
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match, index) => {
    const mark = `@${index}`;
    groups.push([mark, match]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match[1], new RegExp(`^${match[2]}(?=/${next})`)] : [label, match[1], new RegExp(`^${match[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match) => {
      try {
        return decoder(match);
      } catch {
        return match;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf(
    "/",
    url.charCodeAt(9) === 58 ? 13 : 8
  );
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf(`?${key}`, 8);
    if (keyIndex2 === -1) {
      keyIndex2 = url.indexOf(`&${key}`, 8);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = class {
  static {
    __name(this, "HonoRequest");
  }
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param ? /\%/.test(param) ? tryDecodeURIComponent(param) : param : void 0;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value && typeof value === "string") {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = /* @__PURE__ */ __name((key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  }, "#cachedBody");
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  text() {
    return this.#cachedBody("text");
  }
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  blob() {
    return this.#cachedBody("blob");
  }
  formData() {
    return this.#cachedBody("formData");
  }
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
init_checked_fetch();
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var Context = class {
  static {
    __name(this, "Context");
  }
  #rawRequest;
  #req;
  env = {};
  #var;
  finalized = false;
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    return this.#res ||= new Response(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  set res(_res) {
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  render = /* @__PURE__ */ __name((...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  }, "render");
  setLayout = /* @__PURE__ */ __name((layout) => this.#layout = layout, "setLayout");
  getLayout = /* @__PURE__ */ __name(() => this.#layout, "getLayout");
  setRenderer = /* @__PURE__ */ __name((renderer) => {
    this.#renderer = renderer;
  }, "setRenderer");
  header = /* @__PURE__ */ __name((name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  }, "header");
  status = /* @__PURE__ */ __name((status) => {
    this.#status = status;
  }, "status");
  set = /* @__PURE__ */ __name((key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  }, "set");
  get = /* @__PURE__ */ __name((key) => {
    return this.#var ? this.#var.get(key) : void 0;
  }, "get");
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return new Response(data, { status, headers: responseHeaders });
  }
  newResponse = /* @__PURE__ */ __name((...args) => this.#newResponse(...args), "newResponse");
  body = /* @__PURE__ */ __name((data, arg, headers) => this.#newResponse(data, arg, headers), "body");
  text = /* @__PURE__ */ __name((text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  }, "text");
  json = /* @__PURE__ */ __name((object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  }, "json");
  html = /* @__PURE__ */ __name((html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  }, "html");
  redirect = /* @__PURE__ */ __name((location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  }, "redirect");
  notFound = /* @__PURE__ */ __name(() => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  }, "notFound");
};

// node_modules/hono/dist/router.js
init_checked_fetch();
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
  static {
    __name(this, "UnsupportedPathError");
  }
};

// node_modules/hono/dist/utils/constants.js
init_checked_fetch();
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = class {
  static {
    __name(this, "Hono");
  }
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError = /* @__PURE__ */ __name((handler) => {
    this.errorHandler = handler;
    return this;
  }, "onError");
  notFound = /* @__PURE__ */ __name((handler) => {
    this.#notFoundHandler = handler;
    return this;
  }, "notFound");
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  fetch = /* @__PURE__ */ __name((request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  }, "fetch");
  request = /* @__PURE__ */ __name((input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  }, "request");
  fire = /* @__PURE__ */ __name(() => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  }, "fire");
};

// node_modules/hono/dist/router/reg-exp-router/index.js
init_checked_fetch();

// node_modules/hono/dist/router/reg-exp-router/router.js
init_checked_fetch();

// node_modules/hono/dist/router/reg-exp-router/node.js
init_checked_fetch();
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = class {
  static {
    __name(this, "Node");
  }
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
init_checked_fetch();
var Trie = class {
  static {
    __name(this, "Trie");
  }
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var emptyParam = [];
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = class {
  static {
    __name(this, "RegExpRouter");
  }
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match(method, path) {
    clearWildcardRegExpCache();
    const matchers = this.#buildAllMatchers();
    this.match = (method2, path2) => {
      const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
      const staticMatch = matcher[2][path2];
      if (staticMatch) {
        return staticMatch;
      }
      const match = path2.match(matcher[0]);
      if (!match) {
        return [[], emptyParam];
      }
      const index = match.indexOf("", 1);
      return [matcher[1][index], match];
    };
    return this.match(method, path);
  }
  #buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/hono/dist/router/smart-router/index.js
init_checked_fetch();

// node_modules/hono/dist/router/smart-router/router.js
init_checked_fetch();
var SmartRouter = class {
  static {
    __name(this, "SmartRouter");
  }
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/index.js
init_checked_fetch();

// node_modules/hono/dist/router/trie-router/router.js
init_checked_fetch();

// node_modules/hono/dist/router/trie-router/node.js
init_checked_fetch();
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = class {
  static {
    __name(this, "Node");
  }
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  static {
    __name(this, "TrieRouter");
  }
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  static {
    __name(this, "Hono");
  }
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// node_modules/hono/dist/middleware/cors/index.js
init_checked_fetch();
var cors = /* @__PURE__ */ __name((options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return optsAllowMethods;
    } else if (Array.isArray(optsAllowMethods)) {
      return () => optsAllowMethods;
    } else {
      return () => [];
    }
  })(opts.allowMethods);
  return /* @__PURE__ */ __name(async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    __name(set, "set");
    const allowOrigin = findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.origin !== "*") {
      const existingVary = c.req.header("Vary");
      if (existingVary) {
        set("Vary", existingVary);
      } else {
        set("Vary", "Origin");
      }
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods.length) {
        set("Access-Control-Allow-Methods", allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
  }, "cors2");
}, "cors");

// node_modules/bcryptjs/index.js
init_checked_fetch();
var import_crypto = __toESM(require_crypto(), 1);
var randomFallback = null;
function randomBytes(len) {
  try {
    return crypto.getRandomValues(new Uint8Array(len));
  } catch {
  }
  try {
    return import_crypto.default.randomBytes(len);
  } catch {
  }
  if (!randomFallback) {
    throw Error(
      "Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative"
    );
  }
  return randomFallback(len);
}
__name(randomBytes, "randomBytes");
function genSaltSync(rounds, seed_length) {
  rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof rounds !== "number")
    throw Error(
      "Illegal arguments: " + typeof rounds + ", " + typeof seed_length
    );
  if (rounds < 4) rounds = 4;
  else if (rounds > 31) rounds = 31;
  var salt = [];
  salt.push("$2b$");
  if (rounds < 10) salt.push("0");
  salt.push(rounds.toString());
  salt.push("$");
  salt.push(base64_encode(randomBytes(BCRYPT_SALT_LEN), BCRYPT_SALT_LEN));
  return salt.join("");
}
__name(genSaltSync, "genSaltSync");
function genSalt(rounds, seed_length, callback) {
  if (typeof seed_length === "function")
    callback = seed_length, seed_length = void 0;
  if (typeof rounds === "function") callback = rounds, rounds = void 0;
  if (typeof rounds === "undefined") rounds = GENSALT_DEFAULT_LOG2_ROUNDS;
  else if (typeof rounds !== "number")
    throw Error("illegal arguments: " + typeof rounds);
  function _async(callback2) {
    nextTick(function() {
      try {
        callback2(null, genSaltSync(rounds));
      } catch (err) {
        callback2(err);
      }
    });
  }
  __name(_async, "_async");
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
__name(genSalt, "genSalt");
function hash(password, salt, callback, progressCallback) {
  function _async(callback2) {
    if (typeof password === "string" && typeof salt === "number")
      genSalt(salt, function(err, salt2) {
        _hash(password, salt2, callback2, progressCallback);
      });
    else if (typeof password === "string" && typeof salt === "string")
      _hash(password, salt, callback2, progressCallback);
    else
      nextTick(
        callback2.bind(
          this,
          Error("Illegal arguments: " + typeof password + ", " + typeof salt)
        )
      );
  }
  __name(_async, "_async");
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
__name(hash, "hash");
function safeStringCompare(known, unknown) {
  var diff = known.length ^ unknown.length;
  for (var i = 0; i < known.length; ++i) {
    diff |= known.charCodeAt(i) ^ unknown.charCodeAt(i);
  }
  return diff === 0;
}
__name(safeStringCompare, "safeStringCompare");
function compare(password, hashValue, callback, progressCallback) {
  function _async(callback2) {
    if (typeof password !== "string" || typeof hashValue !== "string") {
      nextTick(
        callback2.bind(
          this,
          Error(
            "Illegal arguments: " + typeof password + ", " + typeof hashValue
          )
        )
      );
      return;
    }
    if (hashValue.length !== 60) {
      nextTick(callback2.bind(this, null, false));
      return;
    }
    hash(
      password,
      hashValue.substring(0, 29),
      function(err, comp) {
        if (err) callback2(err);
        else callback2(null, safeStringCompare(comp, hashValue));
      },
      progressCallback
    );
  }
  __name(_async, "_async");
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
__name(compare, "compare");
var nextTick = typeof process !== "undefined" && process && typeof process.nextTick === "function" ? typeof setImmediate === "function" ? setImmediate : process.nextTick : setTimeout;
function utf8Length(string) {
  var len = 0, c = 0;
  for (var i = 0; i < string.length; ++i) {
    c = string.charCodeAt(i);
    if (c < 128) len += 1;
    else if (c < 2048) len += 2;
    else if ((c & 64512) === 55296 && (string.charCodeAt(i + 1) & 64512) === 56320) {
      ++i;
      len += 4;
    } else len += 3;
  }
  return len;
}
__name(utf8Length, "utf8Length");
function utf8Array(string) {
  var offset = 0, c1, c2;
  var buffer = new Array(utf8Length(string));
  for (var i = 0, k = string.length; i < k; ++i) {
    c1 = string.charCodeAt(i);
    if (c1 < 128) {
      buffer[offset++] = c1;
    } else if (c1 < 2048) {
      buffer[offset++] = c1 >> 6 | 192;
      buffer[offset++] = c1 & 63 | 128;
    } else if ((c1 & 64512) === 55296 && ((c2 = string.charCodeAt(i + 1)) & 64512) === 56320) {
      c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
      ++i;
      buffer[offset++] = c1 >> 18 | 240;
      buffer[offset++] = c1 >> 12 & 63 | 128;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    } else {
      buffer[offset++] = c1 >> 12 | 224;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    }
  }
  return buffer;
}
__name(utf8Array, "utf8Array");
var BASE64_CODE = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
var BASE64_INDEX = [
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  0,
  1,
  54,
  55,
  56,
  57,
  58,
  59,
  60,
  61,
  62,
  63,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50,
  51,
  52,
  53,
  -1,
  -1,
  -1,
  -1,
  -1
];
function base64_encode(b, len) {
  var off = 0, rs = [], c1, c2;
  if (len <= 0 || len > b.length) throw Error("Illegal len: " + len);
  while (off < len) {
    c1 = b[off++] & 255;
    rs.push(BASE64_CODE[c1 >> 2 & 63]);
    c1 = (c1 & 3) << 4;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b[off++] & 255;
    c1 |= c2 >> 4 & 15;
    rs.push(BASE64_CODE[c1 & 63]);
    c1 = (c2 & 15) << 2;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b[off++] & 255;
    c1 |= c2 >> 6 & 3;
    rs.push(BASE64_CODE[c1 & 63]);
    rs.push(BASE64_CODE[c2 & 63]);
  }
  return rs.join("");
}
__name(base64_encode, "base64_encode");
function base64_decode(s, len) {
  var off = 0, slen = s.length, olen = 0, rs = [], c1, c2, c3, c4, o, code;
  if (len <= 0) throw Error("Illegal len: " + len);
  while (off < slen - 1 && olen < len) {
    code = s.charCodeAt(off++);
    c1 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    code = s.charCodeAt(off++);
    c2 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c1 == -1 || c2 == -1) break;
    o = c1 << 2 >>> 0;
    o |= (c2 & 48) >> 4;
    rs.push(String.fromCharCode(o));
    if (++olen >= len || off >= slen) break;
    code = s.charCodeAt(off++);
    c3 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c3 == -1) break;
    o = (c2 & 15) << 4 >>> 0;
    o |= (c3 & 60) >> 2;
    rs.push(String.fromCharCode(o));
    if (++olen >= len || off >= slen) break;
    code = s.charCodeAt(off++);
    c4 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    o = (c3 & 3) << 6 >>> 0;
    o |= c4;
    rs.push(String.fromCharCode(o));
    ++olen;
  }
  var res = [];
  for (off = 0; off < olen; off++) res.push(rs[off].charCodeAt(0));
  return res;
}
__name(base64_decode, "base64_decode");
var BCRYPT_SALT_LEN = 16;
var GENSALT_DEFAULT_LOG2_ROUNDS = 10;
var BLOWFISH_NUM_ROUNDS = 16;
var MAX_EXECUTION_TIME = 100;
var P_ORIG = [
  608135816,
  2242054355,
  320440878,
  57701188,
  2752067618,
  698298832,
  137296536,
  3964562569,
  1160258022,
  953160567,
  3193202383,
  887688300,
  3232508343,
  3380367581,
  1065670069,
  3041331479,
  2450970073,
  2306472731
];
var S_ORIG = [
  3509652390,
  2564797868,
  805139163,
  3491422135,
  3101798381,
  1780907670,
  3128725573,
  4046225305,
  614570311,
  3012652279,
  134345442,
  2240740374,
  1667834072,
  1901547113,
  2757295779,
  4103290238,
  227898511,
  1921955416,
  1904987480,
  2182433518,
  2069144605,
  3260701109,
  2620446009,
  720527379,
  3318853667,
  677414384,
  3393288472,
  3101374703,
  2390351024,
  1614419982,
  1822297739,
  2954791486,
  3608508353,
  3174124327,
  2024746970,
  1432378464,
  3864339955,
  2857741204,
  1464375394,
  1676153920,
  1439316330,
  715854006,
  3033291828,
  289532110,
  2706671279,
  2087905683,
  3018724369,
  1668267050,
  732546397,
  1947742710,
  3462151702,
  2609353502,
  2950085171,
  1814351708,
  2050118529,
  680887927,
  999245976,
  1800124847,
  3300911131,
  1713906067,
  1641548236,
  4213287313,
  1216130144,
  1575780402,
  4018429277,
  3917837745,
  3693486850,
  3949271944,
  596196993,
  3549867205,
  258830323,
  2213823033,
  772490370,
  2760122372,
  1774776394,
  2652871518,
  566650946,
  4142492826,
  1728879713,
  2882767088,
  1783734482,
  3629395816,
  2517608232,
  2874225571,
  1861159788,
  326777828,
  3124490320,
  2130389656,
  2716951837,
  967770486,
  1724537150,
  2185432712,
  2364442137,
  1164943284,
  2105845187,
  998989502,
  3765401048,
  2244026483,
  1075463327,
  1455516326,
  1322494562,
  910128902,
  469688178,
  1117454909,
  936433444,
  3490320968,
  3675253459,
  1240580251,
  122909385,
  2157517691,
  634681816,
  4142456567,
  3825094682,
  3061402683,
  2540495037,
  79693498,
  3249098678,
  1084186820,
  1583128258,
  426386531,
  1761308591,
  1047286709,
  322548459,
  995290223,
  1845252383,
  2603652396,
  3431023940,
  2942221577,
  3202600964,
  3727903485,
  1712269319,
  422464435,
  3234572375,
  1170764815,
  3523960633,
  3117677531,
  1434042557,
  442511882,
  3600875718,
  1076654713,
  1738483198,
  4213154764,
  2393238008,
  3677496056,
  1014306527,
  4251020053,
  793779912,
  2902807211,
  842905082,
  4246964064,
  1395751752,
  1040244610,
  2656851899,
  3396308128,
  445077038,
  3742853595,
  3577915638,
  679411651,
  2892444358,
  2354009459,
  1767581616,
  3150600392,
  3791627101,
  3102740896,
  284835224,
  4246832056,
  1258075500,
  768725851,
  2589189241,
  3069724005,
  3532540348,
  1274779536,
  3789419226,
  2764799539,
  1660621633,
  3471099624,
  4011903706,
  913787905,
  3497959166,
  737222580,
  2514213453,
  2928710040,
  3937242737,
  1804850592,
  3499020752,
  2949064160,
  2386320175,
  2390070455,
  2415321851,
  4061277028,
  2290661394,
  2416832540,
  1336762016,
  1754252060,
  3520065937,
  3014181293,
  791618072,
  3188594551,
  3933548030,
  2332172193,
  3852520463,
  3043980520,
  413987798,
  3465142937,
  3030929376,
  4245938359,
  2093235073,
  3534596313,
  375366246,
  2157278981,
  2479649556,
  555357303,
  3870105701,
  2008414854,
  3344188149,
  4221384143,
  3956125452,
  2067696032,
  3594591187,
  2921233993,
  2428461,
  544322398,
  577241275,
  1471733935,
  610547355,
  4027169054,
  1432588573,
  1507829418,
  2025931657,
  3646575487,
  545086370,
  48609733,
  2200306550,
  1653985193,
  298326376,
  1316178497,
  3007786442,
  2064951626,
  458293330,
  2589141269,
  3591329599,
  3164325604,
  727753846,
  2179363840,
  146436021,
  1461446943,
  4069977195,
  705550613,
  3059967265,
  3887724982,
  4281599278,
  3313849956,
  1404054877,
  2845806497,
  146425753,
  1854211946,
  1266315497,
  3048417604,
  3681880366,
  3289982499,
  290971e4,
  1235738493,
  2632868024,
  2414719590,
  3970600049,
  1771706367,
  1449415276,
  3266420449,
  422970021,
  1963543593,
  2690192192,
  3826793022,
  1062508698,
  1531092325,
  1804592342,
  2583117782,
  2714934279,
  4024971509,
  1294809318,
  4028980673,
  1289560198,
  2221992742,
  1669523910,
  35572830,
  157838143,
  1052438473,
  1016535060,
  1802137761,
  1753167236,
  1386275462,
  3080475397,
  2857371447,
  1040679964,
  2145300060,
  2390574316,
  1461121720,
  2956646967,
  4031777805,
  4028374788,
  33600511,
  2920084762,
  1018524850,
  629373528,
  3691585981,
  3515945977,
  2091462646,
  2486323059,
  586499841,
  988145025,
  935516892,
  3367335476,
  2599673255,
  2839830854,
  265290510,
  3972581182,
  2759138881,
  3795373465,
  1005194799,
  847297441,
  406762289,
  1314163512,
  1332590856,
  1866599683,
  4127851711,
  750260880,
  613907577,
  1450815602,
  3165620655,
  3734664991,
  3650291728,
  3012275730,
  3704569646,
  1427272223,
  778793252,
  1343938022,
  2676280711,
  2052605720,
  1946737175,
  3164576444,
  3914038668,
  3967478842,
  3682934266,
  1661551462,
  3294938066,
  4011595847,
  840292616,
  3712170807,
  616741398,
  312560963,
  711312465,
  1351876610,
  322626781,
  1910503582,
  271666773,
  2175563734,
  1594956187,
  70604529,
  3617834859,
  1007753275,
  1495573769,
  4069517037,
  2549218298,
  2663038764,
  504708206,
  2263041392,
  3941167025,
  2249088522,
  1514023603,
  1998579484,
  1312622330,
  694541497,
  2582060303,
  2151582166,
  1382467621,
  776784248,
  2618340202,
  3323268794,
  2497899128,
  2784771155,
  503983604,
  4076293799,
  907881277,
  423175695,
  432175456,
  1378068232,
  4145222326,
  3954048622,
  3938656102,
  3820766613,
  2793130115,
  2977904593,
  26017576,
  3274890735,
  3194772133,
  1700274565,
  1756076034,
  4006520079,
  3677328699,
  720338349,
  1533947780,
  354530856,
  688349552,
  3973924725,
  1637815568,
  332179504,
  3949051286,
  53804574,
  2852348879,
  3044236432,
  1282449977,
  3583942155,
  3416972820,
  4006381244,
  1617046695,
  2628476075,
  3002303598,
  1686838959,
  431878346,
  2686675385,
  1700445008,
  1080580658,
  1009431731,
  832498133,
  3223435511,
  2605976345,
  2271191193,
  2516031870,
  1648197032,
  4164389018,
  2548247927,
  300782431,
  375919233,
  238389289,
  3353747414,
  2531188641,
  2019080857,
  1475708069,
  455242339,
  2609103871,
  448939670,
  3451063019,
  1395535956,
  2413381860,
  1841049896,
  1491858159,
  885456874,
  4264095073,
  4001119347,
  1565136089,
  3898914787,
  1108368660,
  540939232,
  1173283510,
  2745871338,
  3681308437,
  4207628240,
  3343053890,
  4016749493,
  1699691293,
  1103962373,
  3625875870,
  2256883143,
  3830138730,
  1031889488,
  3479347698,
  1535977030,
  4236805024,
  3251091107,
  2132092099,
  1774941330,
  1199868427,
  1452454533,
  157007616,
  2904115357,
  342012276,
  595725824,
  1480756522,
  206960106,
  497939518,
  591360097,
  863170706,
  2375253569,
  3596610801,
  1814182875,
  2094937945,
  3421402208,
  1082520231,
  3463918190,
  2785509508,
  435703966,
  3908032597,
  1641649973,
  2842273706,
  3305899714,
  1510255612,
  2148256476,
  2655287854,
  3276092548,
  4258621189,
  236887753,
  3681803219,
  274041037,
  1734335097,
  3815195456,
  3317970021,
  1899903192,
  1026095262,
  4050517792,
  356393447,
  2410691914,
  3873677099,
  3682840055,
  3913112168,
  2491498743,
  4132185628,
  2489919796,
  1091903735,
  1979897079,
  3170134830,
  3567386728,
  3557303409,
  857797738,
  1136121015,
  1342202287,
  507115054,
  2535736646,
  337727348,
  3213592640,
  1301675037,
  2528481711,
  1895095763,
  1721773893,
  3216771564,
  62756741,
  2142006736,
  835421444,
  2531993523,
  1442658625,
  3659876326,
  2882144922,
  676362277,
  1392781812,
  170690266,
  3921047035,
  1759253602,
  3611846912,
  1745797284,
  664899054,
  1329594018,
  3901205900,
  3045908486,
  2062866102,
  2865634940,
  3543621612,
  3464012697,
  1080764994,
  553557557,
  3656615353,
  3996768171,
  991055499,
  499776247,
  1265440854,
  648242737,
  3940784050,
  980351604,
  3713745714,
  1749149687,
  3396870395,
  4211799374,
  3640570775,
  1161844396,
  3125318951,
  1431517754,
  545492359,
  4268468663,
  3499529547,
  1437099964,
  2702547544,
  3433638243,
  2581715763,
  2787789398,
  1060185593,
  1593081372,
  2418618748,
  4260947970,
  69676912,
  2159744348,
  86519011,
  2512459080,
  3838209314,
  1220612927,
  3339683548,
  133810670,
  1090789135,
  1078426020,
  1569222167,
  845107691,
  3583754449,
  4072456591,
  1091646820,
  628848692,
  1613405280,
  3757631651,
  526609435,
  236106946,
  48312990,
  2942717905,
  3402727701,
  1797494240,
  859738849,
  992217954,
  4005476642,
  2243076622,
  3870952857,
  3732016268,
  765654824,
  3490871365,
  2511836413,
  1685915746,
  3888969200,
  1414112111,
  2273134842,
  3281911079,
  4080962846,
  172450625,
  2569994100,
  980381355,
  4109958455,
  2819808352,
  2716589560,
  2568741196,
  3681446669,
  3329971472,
  1835478071,
  660984891,
  3704678404,
  4045999559,
  3422617507,
  3040415634,
  1762651403,
  1719377915,
  3470491036,
  2693910283,
  3642056355,
  3138596744,
  1364962596,
  2073328063,
  1983633131,
  926494387,
  3423689081,
  2150032023,
  4096667949,
  1749200295,
  3328846651,
  309677260,
  2016342300,
  1779581495,
  3079819751,
  111262694,
  1274766160,
  443224088,
  298511866,
  1025883608,
  3806446537,
  1145181785,
  168956806,
  3641502830,
  3584813610,
  1689216846,
  3666258015,
  3200248200,
  1692713982,
  2646376535,
  4042768518,
  1618508792,
  1610833997,
  3523052358,
  4130873264,
  2001055236,
  3610705100,
  2202168115,
  4028541809,
  2961195399,
  1006657119,
  2006996926,
  3186142756,
  1430667929,
  3210227297,
  1314452623,
  4074634658,
  4101304120,
  2273951170,
  1399257539,
  3367210612,
  3027628629,
  1190975929,
  2062231137,
  2333990788,
  2221543033,
  2438960610,
  1181637006,
  548689776,
  2362791313,
  3372408396,
  3104550113,
  3145860560,
  296247880,
  1970579870,
  3078560182,
  3769228297,
  1714227617,
  3291629107,
  3898220290,
  166772364,
  1251581989,
  493813264,
  448347421,
  195405023,
  2709975567,
  677966185,
  3703036547,
  1463355134,
  2715995803,
  1338867538,
  1343315457,
  2802222074,
  2684532164,
  233230375,
  2599980071,
  2000651841,
  3277868038,
  1638401717,
  4028070440,
  3237316320,
  6314154,
  819756386,
  300326615,
  590932579,
  1405279636,
  3267499572,
  3150704214,
  2428286686,
  3959192993,
  3461946742,
  1862657033,
  1266418056,
  963775037,
  2089974820,
  2263052895,
  1917689273,
  448879540,
  3550394620,
  3981727096,
  150775221,
  3627908307,
  1303187396,
  508620638,
  2975983352,
  2726630617,
  1817252668,
  1876281319,
  1457606340,
  908771278,
  3720792119,
  3617206836,
  2455994898,
  1729034894,
  1080033504,
  976866871,
  3556439503,
  2881648439,
  1522871579,
  1555064734,
  1336096578,
  3548522304,
  2579274686,
  3574697629,
  3205460757,
  3593280638,
  3338716283,
  3079412587,
  564236357,
  2993598910,
  1781952180,
  1464380207,
  3163844217,
  3332601554,
  1699332808,
  1393555694,
  1183702653,
  3581086237,
  1288719814,
  691649499,
  2847557200,
  2895455976,
  3193889540,
  2717570544,
  1781354906,
  1676643554,
  2592534050,
  3230253752,
  1126444790,
  2770207658,
  2633158820,
  2210423226,
  2615765581,
  2414155088,
  3127139286,
  673620729,
  2805611233,
  1269405062,
  4015350505,
  3341807571,
  4149409754,
  1057255273,
  2012875353,
  2162469141,
  2276492801,
  2601117357,
  993977747,
  3918593370,
  2654263191,
  753973209,
  36408145,
  2530585658,
  25011837,
  3520020182,
  2088578344,
  530523599,
  2918365339,
  1524020338,
  1518925132,
  3760827505,
  3759777254,
  1202760957,
  3985898139,
  3906192525,
  674977740,
  4174734889,
  2031300136,
  2019492241,
  3983892565,
  4153806404,
  3822280332,
  352677332,
  2297720250,
  60907813,
  90501309,
  3286998549,
  1016092578,
  2535922412,
  2839152426,
  457141659,
  509813237,
  4120667899,
  652014361,
  1966332200,
  2975202805,
  55981186,
  2327461051,
  676427537,
  3255491064,
  2882294119,
  3433927263,
  1307055953,
  942726286,
  933058658,
  2468411793,
  3933900994,
  4215176142,
  1361170020,
  2001714738,
  2830558078,
  3274259782,
  1222529897,
  1679025792,
  2729314320,
  3714953764,
  1770335741,
  151462246,
  3013232138,
  1682292957,
  1483529935,
  471910574,
  1539241949,
  458788160,
  3436315007,
  1807016891,
  3718408830,
  978976581,
  1043663428,
  3165965781,
  1927990952,
  4200891579,
  2372276910,
  3208408903,
  3533431907,
  1412390302,
  2931980059,
  4132332400,
  1947078029,
  3881505623,
  4168226417,
  2941484381,
  1077988104,
  1320477388,
  886195818,
  18198404,
  3786409e3,
  2509781533,
  112762804,
  3463356488,
  1866414978,
  891333506,
  18488651,
  661792760,
  1628790961,
  3885187036,
  3141171499,
  876946877,
  2693282273,
  1372485963,
  791857591,
  2686433993,
  3759982718,
  3167212022,
  3472953795,
  2716379847,
  445679433,
  3561995674,
  3504004811,
  3574258232,
  54117162,
  3331405415,
  2381918588,
  3769707343,
  4154350007,
  1140177722,
  4074052095,
  668550556,
  3214352940,
  367459370,
  261225585,
  2610173221,
  4209349473,
  3468074219,
  3265815641,
  314222801,
  3066103646,
  3808782860,
  282218597,
  3406013506,
  3773591054,
  379116347,
  1285071038,
  846784868,
  2669647154,
  3771962079,
  3550491691,
  2305946142,
  453669953,
  1268987020,
  3317592352,
  3279303384,
  3744833421,
  2610507566,
  3859509063,
  266596637,
  3847019092,
  517658769,
  3462560207,
  3443424879,
  370717030,
  4247526661,
  2224018117,
  4143653529,
  4112773975,
  2788324899,
  2477274417,
  1456262402,
  2901442914,
  1517677493,
  1846949527,
  2295493580,
  3734397586,
  2176403920,
  1280348187,
  1908823572,
  3871786941,
  846861322,
  1172426758,
  3287448474,
  3383383037,
  1655181056,
  3139813346,
  901632758,
  1897031941,
  2986607138,
  3066810236,
  3447102507,
  1393639104,
  373351379,
  950779232,
  625454576,
  3124240540,
  4148612726,
  2007998917,
  544563296,
  2244738638,
  2330496472,
  2058025392,
  1291430526,
  424198748,
  50039436,
  29584100,
  3605783033,
  2429876329,
  2791104160,
  1057563949,
  3255363231,
  3075367218,
  3463963227,
  1469046755,
  985887462
];
var C_ORIG = [
  1332899944,
  1700884034,
  1701343084,
  1684370003,
  1668446532,
  1869963892
];
function _encipher(lr, off, P, S) {
  var n, l = lr[off], r = lr[off + 1];
  l ^= P[0];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[1];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[2];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[3];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[4];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[5];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[6];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[7];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[8];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[9];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[10];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[11];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[12];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[13];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[14];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[15];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[16];
  lr[off] = r ^ P[BLOWFISH_NUM_ROUNDS + 1];
  lr[off + 1] = l;
  return lr;
}
__name(_encipher, "_encipher");
function _streamtoword(data, offp) {
  for (var i = 0, word = 0; i < 4; ++i)
    word = word << 8 | data[offp] & 255, offp = (offp + 1) % data.length;
  return { key: word, offp };
}
__name(_streamtoword, "_streamtoword");
function _key(key, P, S) {
  var offset = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
  for (var i = 0; i < plen; i++)
    sw = _streamtoword(key, offset), offset = sw.offp, P[i] = P[i] ^ sw.key;
  for (i = 0; i < plen; i += 2)
    lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
  for (i = 0; i < slen; i += 2)
    lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
__name(_key, "_key");
function _ekskey(data, key, P, S) {
  var offp = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
  for (var i = 0; i < plen; i++)
    sw = _streamtoword(key, offp), offp = sw.offp, P[i] = P[i] ^ sw.key;
  offp = 0;
  for (i = 0; i < plen; i += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
  for (i = 0; i < slen; i += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
__name(_ekskey, "_ekskey");
function _crypt(b, salt, rounds, callback, progressCallback) {
  var cdata = C_ORIG.slice(), clen = cdata.length, err;
  if (rounds < 4 || rounds > 31) {
    err = Error("Illegal number of rounds (4-31): " + rounds);
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.length !== BCRYPT_SALT_LEN) {
    err = Error(
      "Illegal salt length: " + salt.length + " != " + BCRYPT_SALT_LEN
    );
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  rounds = 1 << rounds >>> 0;
  var P, S, i = 0, j;
  if (typeof Int32Array === "function") {
    P = new Int32Array(P_ORIG);
    S = new Int32Array(S_ORIG);
  } else {
    P = P_ORIG.slice();
    S = S_ORIG.slice();
  }
  _ekskey(salt, b, P, S);
  function next() {
    if (progressCallback) progressCallback(i / rounds);
    if (i < rounds) {
      var start = Date.now();
      for (; i < rounds; ) {
        i = i + 1;
        _key(b, P, S);
        _key(salt, P, S);
        if (Date.now() - start > MAX_EXECUTION_TIME) break;
      }
    } else {
      for (i = 0; i < 64; i++)
        for (j = 0; j < clen >> 1; j++) _encipher(cdata, j << 1, P, S);
      var ret = [];
      for (i = 0; i < clen; i++)
        ret.push((cdata[i] >> 24 & 255) >>> 0), ret.push((cdata[i] >> 16 & 255) >>> 0), ret.push((cdata[i] >> 8 & 255) >>> 0), ret.push((cdata[i] & 255) >>> 0);
      if (callback) {
        callback(null, ret);
        return;
      } else return ret;
    }
    if (callback) nextTick(next);
  }
  __name(next, "next");
  if (typeof callback !== "undefined") {
    next();
  } else {
    var res;
    while (true) if (typeof (res = next()) !== "undefined") return res || [];
  }
}
__name(_crypt, "_crypt");
function _hash(password, salt, callback, progressCallback) {
  var err;
  if (typeof password !== "string" || typeof salt !== "string") {
    err = Error("Invalid string / salt: Not a string");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  var minor, offset;
  if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2") {
    err = Error("Invalid salt version: " + salt.substring(0, 2));
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.charAt(2) === "$") minor = String.fromCharCode(0), offset = 3;
  else {
    minor = salt.charAt(2);
    if (minor !== "a" && minor !== "b" && minor !== "y" || salt.charAt(3) !== "$") {
      err = Error("Invalid salt revision: " + salt.substring(2, 4));
      if (callback) {
        nextTick(callback.bind(this, err));
        return;
      } else throw err;
    }
    offset = 4;
  }
  if (salt.charAt(offset + 2) > "$") {
    err = Error("Missing salt rounds");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10, r2 = parseInt(salt.substring(offset + 1, offset + 2), 10), rounds = r1 + r2, real_salt = salt.substring(offset + 3, offset + 25);
  password += minor >= "a" ? "\0" : "";
  var passwordb = utf8Array(password), saltb = base64_decode(real_salt, BCRYPT_SALT_LEN);
  function finish(bytes) {
    var res = [];
    res.push("$2");
    if (minor >= "a") res.push(minor);
    res.push("$");
    if (rounds < 10) res.push("0");
    res.push(rounds.toString());
    res.push("$");
    res.push(base64_encode(saltb, saltb.length));
    res.push(base64_encode(bytes, C_ORIG.length * 4 - 1));
    return res.join("");
  }
  __name(finish, "finish");
  if (typeof callback == "undefined")
    return finish(_crypt(passwordb, saltb, rounds));
  else {
    _crypt(
      passwordb,
      saltb,
      rounds,
      function(err2, bytes) {
        if (err2) callback(err2, null);
        else callback(null, finish(bytes));
      },
      progressCallback
    );
  }
}
__name(_hash, "_hash");

// index.ts
var app = new Hono2();
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"]
}));
app.get("/api/test/env", async (c) => {
  return c.json({
    hasGoogleClientId: !!c.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!c.env.GOOGLE_CLIENT_SECRET,
    hasJwtSecret: !!c.env.JWT_SECRET,
    googleClientIdLength: c.env.GOOGLE_CLIENT_ID?.length || 0,
    environment: c.env.ENVIRONMENT || "not_set"
  });
});
app.get("/api/templates/:userId", async (c) => {
  const userId = c.req.param("userId");
  const versionId = c.req.query("versionId");
  try {
    let query = "SELECT * FROM onboarding_templates WHERE user_id = ?";
    let params = [userId];
    if (versionId) {
      query += " AND version_id = ?";
      params.push(versionId);
    } else {
      query += " AND version_id IS NULL";
    }
    query += " ORDER BY period, created_at";
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json({ success: true, data: results });
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch templates" }, 500);
  }
});
app.post("/api/templates", async (c) => {
  const { userId, period, title, priority = "medium", versionId } = await c.req.json();
  if (!userId || !period || !title) {
    return c.json({ success: false, error: "Missing required fields" }, 400);
  }
  try {
    const id = crypto.randomUUID();
    await c.env.DB.prepare(
      "INSERT INTO onboarding_templates (id, user_id, period, title, priority, version_id) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(id, userId, period, title, priority, versionId || null).run();
    return c.json({ success: true, data: { id, userId, period, title, priority, completed: false, version_id: versionId } });
  } catch (error) {
    return c.json({ success: false, error: "Failed to create template" }, 500);
  }
});
app.put("/api/templates/:id", async (c) => {
  const id = c.req.param("id");
  const { title, completed, priority } = await c.req.json();
  try {
    await c.env.DB.prepare(
      "UPDATE onboarding_templates SET title = ?, completed = ?, priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(title, completed, priority, id).run();
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: "Failed to update template" }, 500);
  }
});
app.delete("/api/templates/:id", async (c) => {
  const id = c.req.param("id");
  try {
    await c.env.DB.prepare("DELETE FROM onboarding_templates WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: "Failed to delete template" }, 500);
  }
});
app.post("/api/templates/share", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "No token provided" }, 401);
  }
  const token = authHeader.substring(7);
  try {
    const tokenData = verifyJWT(token, c.env.JWT_SECRET);
    const userId = tokenData.id;
    const { templateId, title, description, expiresIn, maxClones, selectedVersionId } = await c.req.json();
    console.log("Share request received:", { templateId, userId, title, description, expiresIn, maxClones, selectedVersionId });
    if (!title || !selectedVersionId) {
      console.log("Missing required fields:", { title, selectedVersionId });
      return c.json({ success: false, error: "Missing required fields" }, 400);
    }
    const user = await c.env.DB.prepare(
      "SELECT * FROM users WHERE id = ?"
    ).bind(userId).first();
    console.log("User lookup result:", user);
    if (!user) {
      console.log("User not found for userId:", userId);
      return c.json({ success: false, error: "User not found" }, 404);
    }
    const hasTemplates = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM onboarding_templates WHERE user_id = ? AND version_id = ?"
    ).bind(userId, selectedVersionId).first();
    const hasJTBDCategories = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM jtbd_categories WHERE user_id = ? AND version_id = ?"
    ).bind(userId, selectedVersionId).first();
    console.log("Content check:", { hasTemplates: hasTemplates.count, hasJTBDCategories: hasJTBDCategories.count });
    if (hasTemplates.count === 0 && hasJTBDCategories.count === 0) {
      console.log("No content to share for user:", userId);
      return c.json({ success: false, error: "No templates or resources to share" }, 400);
    }
    const inviteToken = crypto.randomUUID();
    let expiresAt = null;
    if (expiresIn) {
      const now = /* @__PURE__ */ new Date();
      expiresAt = new Date(now.getTime() + expiresIn * 24 * 60 * 60 * 1e3).toISOString();
    }
    const shareId = crypto.randomUUID();
    console.log("\u{1F50D} CRITICAL DEBUG: About to insert shared template with version_id:", selectedVersionId, "type:", typeof selectedVersionId);
    await c.env.DB.prepare(
      "INSERT INTO shared_templates (id, template_id, owner_user_id, invite_token, title, description, expires_at, max_clones, version_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(shareId, null, userId, inviteToken, title, description, expiresAt, maxClones, selectedVersionId).run();
    console.log("\u2705 Shared template record created with ID:", shareId, "and version_id:", selectedVersionId);
    return c.json({
      success: true,
      data: {
        shareId,
        inviteToken,
        inviteUrl: `${new URL(c.req.url).origin}/invite/${inviteToken}`,
        title,
        description,
        expiresAt,
        maxClones
      }
    });
  } catch (error) {
    console.error("JWT verification or share template error:", error);
    return c.json({ success: false, error: "Failed to share template" }, 500);
  }
});
app.get("/api/templates/shared/:token", async (c) => {
  const token = c.req.param("token");
  console.log("Shared template endpoint called with token:", token);
  try {
    const sharedTemplate = await c.env.DB.prepare(`
      SELECT 
        st.*,
        u.name as owner_name,
        u.email as owner_email
      FROM shared_templates st
      JOIN users u ON st.owner_user_id = u.id
      WHERE st.invite_token = ? AND st.is_active = 1
    `).bind(token).first();
    console.log("Database query result:", sharedTemplate);
    if (!sharedTemplate) {
      console.log("No shared template found for token:", token);
      return c.json({ success: false, error: "Shared template not found or inactive" }, 404);
    }
    console.log("Found shared template:", {
      title: sharedTemplate.title,
      owner_user_id: sharedTemplate.owner_user_id,
      expires_at: sharedTemplate.expires_at
    });
    if (sharedTemplate.expires_at && new Date(sharedTemplate.expires_at) < /* @__PURE__ */ new Date()) {
      return c.json({ success: false, error: "Invite link has expired" }, 410);
    }
    if (sharedTemplate.max_clones && sharedTemplate.clone_count >= sharedTemplate.max_clones) {
      return c.json({ success: false, error: "Maximum number of clones reached" }, 410);
    }
    const { results: templateData } = await c.env.DB.prepare(
      "SELECT * FROM onboarding_templates WHERE user_id = ? ORDER BY period, created_at"
    ).bind(sharedTemplate.owner_user_id).all();
    const { results: jtbdCategories } = await c.env.DB.prepare(
      "SELECT * FROM jtbd_categories WHERE user_id = ? ORDER BY created_at DESC"
    ).bind(sharedTemplate.owner_user_id).all();
    const jtbdWithResources = await Promise.all(
      jtbdCategories.map(async (category) => {
        const { results: resources } = await c.env.DB.prepare(
          "SELECT * FROM resources WHERE category_id = ? ORDER BY created_at"
        ).bind(category.id).all();
        return {
          id: category.id,
          category: category.category,
          job: category.job,
          situation: category.situation,
          outcome: category.outcome,
          resources
        };
      })
    );
    return c.json({
      success: true,
      data: {
        shareInfo: {
          title: sharedTemplate.title,
          description: sharedTemplate.description,
          ownerName: sharedTemplate.owner_name,
          ownerEmail: sharedTemplate.owner_email,
          cloneCount: sharedTemplate.clone_count,
          maxClones: sharedTemplate.max_clones,
          expiresAt: sharedTemplate.expires_at
        },
        templates: templateData,
        jtbdResources: jtbdWithResources
      }
    });
  } catch (error) {
    console.error("Get shared template error details:", {
      message: error.message,
      stack: error.stack,
      error
    });
    return c.json({ success: false, error: `Failed to fetch shared template: ${error.message}` }, 500);
  }
});
app.post("/api/templates/clone/:token", async (c) => {
  const token = c.req.param("token");
  console.log("Clone endpoint called with token:", token);
  let requestBody;
  try {
    requestBody = await c.req.json();
    console.log("Request body:", requestBody);
  } catch (error) {
    console.error("Error parsing request body:", error);
    return c.json({ success: false, error: "Invalid request body" }, 400);
  }
  const { userId, confirmed, overwrite } = requestBody;
  console.log("Extracted userId:", userId, "confirmed:", confirmed, "overwrite:", overwrite);
  if (!userId) {
    console.error("No userId provided");
    return c.json({ success: false, error: "User ID required" }, 400);
  }
  try {
    const sharedTemplate = await c.env.DB.prepare(
      "SELECT * FROM shared_templates WHERE invite_token = ? AND is_active = 1"
    ).bind(token).first();
    console.log("\u{1F50D} Shared template record:", JSON.stringify(sharedTemplate, null, 2));
    console.log("\u{1F50D} CRITICAL DEBUG: version_id value:", sharedTemplate.version_id, "type:", typeof sharedTemplate.version_id);
    console.log("\u{1F50D} CRITICAL DEBUG: Is version_id truthy?", !!sharedTemplate.version_id);
    if (!sharedTemplate) {
      return c.json({ success: false, error: "Shared template not found or inactive" }, 404);
    }
    if (sharedTemplate.expires_at && new Date(sharedTemplate.expires_at) < /* @__PURE__ */ new Date()) {
      return c.json({ success: false, error: "Invite link has expired" }, 410);
    }
    if (sharedTemplate.max_clones && sharedTemplate.clone_count >= sharedTemplate.max_clones) {
      return c.json({ success: false, error: "Maximum number of clones reached" }, 410);
    }
    if (sharedTemplate.owner_user_id === userId) {
      return c.json({ success: false, error: "Cannot clone your own template" }, 400);
    }
    const sharedVersionName = `Shared: ${sharedTemplate.title}`;
    const existingClone = await c.env.DB.prepare(
      "SELECT * FROM template_versions WHERE user_id = ? AND name = ?"
    ).bind(userId, sharedVersionName).first();
    if (existingClone && !overwrite) {
      console.log("\u{1F50D} Duplicate clone detected:", existingClone.name);
      return c.json({
        success: false,
        requiresDuplicateConfirmation: true,
        message: `You already have a version "${existingClone.name}" from this shared template. Would you like to overwrite it with the latest version?`,
        existingVersion: {
          id: existingClone.id,
          name: existingClone.name,
          description: existingClone.description,
          created_at: existingClone.created_at
        }
      }, 200);
    }
    if (overwrite && existingClone) {
      console.log("\u{1F5D1}\uFE0F Overwriting existing clone version:", existingClone.name);
      await c.env.DB.prepare(
        "DELETE FROM onboarding_templates WHERE version_id = ?"
      ).bind(existingClone.id).run();
      await c.env.DB.prepare(
        "DELETE FROM resources WHERE category_id IN (SELECT id FROM jtbd_categories WHERE version_id = ?)"
      ).bind(existingClone.id).run();
      await c.env.DB.prepare(
        "DELETE FROM jtbd_categories WHERE version_id = ?"
      ).bind(existingClone.id).run();
      await c.env.DB.prepare(
        "DELETE FROM template_versions WHERE id = ?"
      ).bind(existingClone.id).run();
      console.log("\u2705 Successfully deleted old version for overwrite");
    }
    if (!confirmed && !overwrite) {
      const { results: existingTemplates } = await c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM onboarding_templates WHERE user_id = ?"
      ).bind(userId).all();
      const { results: existingJtbd } = await c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM jtbd_categories WHERE user_id = ?"
      ).bind(userId).all();
      const hasExistingTemplates = existingTemplates[0]?.count > 0;
      const hasExistingJtbd = existingJtbd[0]?.count > 0;
      if (hasExistingTemplates || hasExistingJtbd) {
        return c.json({
          success: false,
          requiresConfirmation: true,
          message: "You already have existing templates and resource data. Cloning will add the shared content to your existing data.",
          existingData: {
            templates: hasExistingTemplates,
            jtbd: hasExistingJtbd
          }
        }, 200);
      }
    }
    console.log("\u{1F50D} Getting templates for version:", sharedTemplate.version_id, "from owner:", sharedTemplate.owner_user_id);
    let originalTemplates, originalJtbdCategories;
    if (!sharedTemplate.version_id) {
      console.log("\u26A0\uFE0F WARNING: Shared template has no version_id! This is a legacy share - getting ALL templates from owner.");
      console.log("\u{1F50D} Falling back to get all templates from owner (legacy behavior)");
      const templatesResult = await c.env.DB.prepare(
        "SELECT * FROM onboarding_templates WHERE user_id = ?"
      ).bind(sharedTemplate.owner_user_id).all();
      originalTemplates = templatesResult.results;
      const jtbdResult = await c.env.DB.prepare(
        "SELECT * FROM jtbd_categories WHERE user_id = ?"
      ).bind(sharedTemplate.owner_user_id).all();
      originalJtbdCategories = jtbdResult.results;
    } else {
      console.log("\u2705 Version-specific share detected! Getting content from version:", sharedTemplate.version_id);
      const templatesResult = await c.env.DB.prepare(
        "SELECT * FROM onboarding_templates WHERE user_id = ? AND version_id = ?"
      ).bind(sharedTemplate.owner_user_id, sharedTemplate.version_id).all();
      originalTemplates = templatesResult.results;
      const jtbdResult = await c.env.DB.prepare(
        "SELECT * FROM jtbd_categories WHERE user_id = ? AND version_id = ?"
      ).bind(sharedTemplate.owner_user_id, sharedTemplate.version_id).all();
      originalJtbdCategories = jtbdResult.results;
    }
    console.log("\u{1F50D} Retrieved", originalTemplates?.length || 0, "templates from version", sharedTemplate.version_id || "ALL");
    console.log("\u{1F50D} Retrieved", originalJtbdCategories?.length || 0, "JTBD categories from version", sharedTemplate.version_id || "ALL");
    const newVersionId = crypto.randomUUID();
    const sharedVersionDescription = `Cloned from shared template: ${sharedTemplate.description || "No description"}`;
    console.log("\u{1F386} Creating new version for shared content:", {
      versionId: newVersionId,
      name: sharedVersionName,
      description: sharedVersionDescription
    });
    await c.env.DB.prepare(
      "INSERT INTO template_versions (id, user_id, name, description, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      newVersionId,
      userId,
      sharedVersionName,
      sharedVersionDescription,
      0,
      // not default
      (/* @__PURE__ */ new Date()).toISOString(),
      (/* @__PURE__ */ new Date()).toISOString()
    ).run();
    console.log("\u2705 New version created successfully");
    console.log("\u{1F504} Cloning", originalTemplates.length, "templates into new version");
    let templatesAdded = 0;
    for (const template of originalTemplates) {
      const newId = crypto.randomUUID();
      console.log("Adding template to new version:", {
        id: newId,
        versionId: newVersionId,
        title: template.title,
        period: template.period
      });
      await c.env.DB.prepare(
        "INSERT INTO onboarding_templates (id, user_id, version_id, period, title, priority, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        newId,
        userId,
        newVersionId,
        template.period || null,
        template.title || null,
        template.priority || null,
        false,
        (/* @__PURE__ */ new Date()).toISOString(),
        (/* @__PURE__ */ new Date()).toISOString()
      ).run();
      templatesAdded++;
    }
    console.log("\u{1F504} Cloning", originalJtbdCategories.length, "JTBD categories into new version");
    let categoriesAdded = 0;
    let resourcesAdded = 0;
    for (const category of originalJtbdCategories) {
      const newCategoryId = crypto.randomUUID();
      console.log("Adding category to new version:", {
        id: newCategoryId,
        versionId: newVersionId,
        category: category.category
      });
      await c.env.DB.prepare(
        "INSERT INTO jtbd_categories (id, user_id, version_id, category, job, situation, outcome, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        newCategoryId,
        userId,
        newVersionId,
        category.category || null,
        category.job || null,
        category.situation || null,
        category.outcome || null,
        (/* @__PURE__ */ new Date()).toISOString(),
        (/* @__PURE__ */ new Date()).toISOString()
      ).run();
      categoriesAdded++;
      console.log("\u{1F50D} About to query resources for category ID:", category.id);
      try {
        const { results: categoryResources } = await c.env.DB.prepare(
          "SELECT * FROM resources WHERE category_id = ?"
        ).bind(category.id).all();
        console.log("\u2705 Successfully retrieved", categoryResources.length, "resources for category:", category.category);
        for (const resource of categoryResources) {
          const newResourceId = crypto.randomUUID();
          console.log("Adding resource to new version category:", {
            id: newResourceId,
            categoryId: newCategoryId,
            name: resource.name,
            type: resource.type
          });
          await c.env.DB.prepare(
            "INSERT INTO resources (id, category_id, name, type, url) VALUES (?, ?, ?, ?, ?)"
          ).bind(
            newResourceId,
            newCategoryId,
            resource.name || null,
            resource.type || null,
            resource.url || null
          ).run();
          resourcesAdded++;
        }
      } catch (resourceError) {
        console.error("\u274C Error querying/inserting resources:", resourceError);
        console.error("\u274C Error details:", {
          message: resourceError.message,
          categoryId: category.id,
          newCategoryId
        });
      }
    }
    await c.env.DB.prepare(
      "UPDATE shared_templates SET clone_count = clone_count + 1 WHERE invite_token = ?"
    ).bind(token).run();
    console.log("\u2705 Template cloning completed successfully!");
    console.log("\u{1F4CA} Summary:", {
      newVersionId,
      versionName: sharedVersionName,
      templatesAdded,
      categoriesAdded,
      resourcesAdded
    });
    return c.json({
      success: true,
      message: `Successfully created new version "${sharedVersionName}" with ${templatesAdded} templates, ${categoriesAdded} categories, and ${resourcesAdded} resources`,
      data: {
        versionId: newVersionId,
        versionName: sharedVersionName,
        templatesAdded,
        categoriesAdded,
        resourcesAdded
      }
    });
  } catch (error) {
    console.error("Clone template error details:", {
      message: error.message,
      stack: error.stack,
      error
    });
    return c.json({ success: false, error: `Failed to clone template: ${error.message}` }, 500);
  }
});
app.get("/api/templates/my-shares/:userId", async (c) => {
  const userId = c.req.param("userId");
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM shared_templates WHERE owner_user_id = ? ORDER BY created_at DESC"
    ).bind(userId).all();
    const sharesWithUrls = results.map((share) => ({
      ...share,
      inviteUrl: `${new URL(c.req.url).origin}/invite/${share.invite_token}`
    }));
    return c.json({ success: true, data: sharesWithUrls });
  } catch (error) {
    console.error("Get my shares error:", error);
    return c.json({ success: false, error: "Failed to fetch shared templates" }, 500);
  }
});
app.delete("/api/templates/share/:shareId/delete", async (c) => {
  const shareId = c.req.param("shareId");
  const { userId } = await c.req.json();
  try {
    const shareCheck = await c.env.DB.prepare(
      "SELECT id FROM shared_templates WHERE id = ? AND owner_user_id = ?"
    ).bind(shareId, userId).first();
    if (!shareCheck) {
      return c.json({ success: false, error: "Shared template not found or access denied" }, 404);
    }
    const result = await c.env.DB.prepare(
      "DELETE FROM shared_templates WHERE id = ? AND owner_user_id = ?"
    ).bind(shareId, userId).run();
    if (result.changes === 0) {
      return c.json({ success: false, error: "Failed to delete shared template" }, 500);
    }
    console.log(`\u2705 Share record deleted: ${shareId} by user ${userId}`);
    return c.json({ success: true, message: "Share record deleted permanently" });
  } catch (error) {
    console.error("\u274C Delete share error:", error);
    return c.json({ success: false, error: "Failed to delete shared template" }, 500);
  }
});
app.delete("/api/templates/share/:shareId", async (c) => {
  const shareId = c.req.param("shareId");
  const { userId } = await c.req.json();
  try {
    const result = await c.env.DB.prepare(
      "UPDATE shared_templates SET is_active = 0 WHERE id = ? AND owner_user_id = ?"
    ).bind(shareId, userId).run();
    if (result.changes === 0) {
      return c.json({ success: false, error: "Shared template not found or access denied" }, 404);
    }
    return c.json({ success: true, message: "Shared template deactivated" });
  } catch (error) {
    console.error("Revoke share error:", error);
    return c.json({ success: false, error: "Failed to revoke shared template" }, 500);
  }
});
app.put("/api/jtbd/:userId", async (c) => {
  const userId = c.req.param("userId");
  const { categories, versionId } = await c.req.json();
  if (!userId || !categories || !versionId) {
    return c.json({ success: false, error: "Missing required fields" }, 400);
  }
  try {
    console.log(`Auto-save JTBD update for user ${userId}, version ${versionId}:`, categories.length, "categories");
    return c.json({
      success: true,
      message: `Auto-save completed for ${categories.length} JTBD categories`
    });
  } catch (error) {
    console.error("JTBD auto-save error:", error);
    return c.json({ success: false, error: "Failed to auto-save JTBD data" }, 500);
  }
});
app.get("/api/jtbd/:userId", async (c) => {
  const userId = c.req.param("userId");
  const versionId = c.req.query("versionId");
  try {
    let query = "SELECT * FROM jtbd_categories WHERE user_id = ?";
    let params = [userId];
    if (versionId) {
      query += " AND version_id = ?";
      params.push(versionId);
    } else {
      query += " AND version_id IS NULL";
    }
    query += " ORDER BY created_at DESC";
    const { results: categories } = await c.env.DB.prepare(query).bind(...params).all();
    const categoriesWithResources = await Promise.all(
      categories.map(async (category) => {
        const { results: resources } = await c.env.DB.prepare(
          "SELECT * FROM resources WHERE category_id = ? ORDER BY created_at"
        ).bind(category.id).all();
        return {
          id: category.id,
          category: category.category,
          job: category.job,
          situation: category.situation,
          outcome: category.outcome,
          resources
        };
      })
    );
    return c.json({ success: true, data: categoriesWithResources });
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch JTBD resources" }, 500);
  }
});
app.post("/api/jtbd", async (c) => {
  const { userId, category, job, situation, outcome, versionId } = await c.req.json();
  if (!userId || !category || !job || !situation || !outcome) {
    return c.json({ success: false, error: "Missing required fields" }, 400);
  }
  try {
    const id = crypto.randomUUID();
    await c.env.DB.prepare(
      "INSERT INTO jtbd_categories (id, user_id, category, job, situation, outcome, version_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(id, userId, category, job, situation, outcome, versionId || null).run();
    return c.json({ success: true, data: { id, userId, category, job, situation, outcome, resources: [], version_id: versionId } });
  } catch (error) {
    return c.json({ success: false, error: "Failed to create JTBD category" }, 500);
  }
});
app.post("/api/jtbd/:categoryId/resources", async (c) => {
  const categoryId = c.req.param("categoryId");
  const { name, type, url } = await c.req.json();
  if (!name || !type || !url) {
    return c.json({ success: false, error: "Missing required fields" }, 400);
  }
  try {
    const id = crypto.randomUUID();
    await c.env.DB.prepare(
      "INSERT INTO resources (id, category_id, name, type, url) VALUES (?, ?, ?, ?, ?)"
    ).bind(id, categoryId, name, type, url).run();
    return c.json({ success: true, data: { id, categoryId, name, type, url } });
  } catch (error) {
    return c.json({ success: false, error: "Failed to create resource" }, 500);
  }
});
app.delete("/api/jtbd/:id", async (c) => {
  const id = c.req.param("id");
  try {
    await c.env.DB.prepare("DELETE FROM jtbd_categories WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: "Failed to delete JTBD category" }, 500);
  }
});
app.delete("/api/jtbd/resources/:id", async (c) => {
  const id = c.req.param("id");
  try {
    await c.env.DB.prepare("DELETE FROM resources WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: "Failed to delete resource" }, 500);
  }
});
app.get("/api/versions/:userId", async (c) => {
  const userId = c.req.param("userId");
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "No token provided" }, 401);
  }
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM template_versions WHERE user_id = ? ORDER BY is_default DESC, created_at DESC"
    ).bind(userId).all();
    console.log("\u{1F50D} Loading versions for user:", userId);
    console.log("\u{1F50D} Found versions:", results?.length || 0);
    if (results && results.length > 0) {
      console.log("\u{1F50D} Version details:", JSON.stringify(results, null, 2));
    }
    return c.json({ success: true, data: results });
  } catch (error) {
    console.error("Failed to load versions:", error);
    return c.json({ success: false, error: "Failed to load versions" }, 500);
  }
});
app.post("/api/versions", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "No token provided" }, 401);
  }
  const { userId, name, description, copyFromVersionId } = await c.req.json();
  console.log("\u{1F50D} Backend received version creation request:", {
    userId,
    name,
    description,
    copyFromVersionId
  });
  if (!userId || !name) {
    return c.json({ success: false, error: "Missing required fields" }, 400);
  }
  try {
    const versionId = crypto.randomUUID();
    const isDefault = false;
    await c.env.DB.prepare(
      "INSERT INTO template_versions (id, user_id, name, description, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
    ).bind(versionId, userId, name, description || null, isDefault).run();
    if (copyFromVersionId) {
      console.log("\u{1F504} COPYING DATA: from version", copyFromVersionId, "to new version", versionId);
      console.log("\u{1F504} copyFromVersionId type:", typeof copyFromVersionId, "value:", copyFromVersionId);
      const { results: sourceTemplates } = await c.env.DB.prepare(
        "SELECT * FROM onboarding_templates WHERE user_id = ? AND version_id = ?"
      ).bind(userId, copyFromVersionId).all();
      for (const template of sourceTemplates) {
        const newTemplateId = crypto.randomUUID();
        await c.env.DB.prepare(
          "INSERT INTO onboarding_templates (id, user_id, period, title, priority, completed, version_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
        ).bind(newTemplateId, userId, template.period, template.title, template.priority, template.completed, versionId).run();
      }
      const { results: sourceCategories } = await c.env.DB.prepare(
        "SELECT * FROM jtbd_categories WHERE user_id = ? AND version_id = ?"
      ).bind(userId, copyFromVersionId).all();
      for (const category of sourceCategories) {
        const newCategoryId = crypto.randomUUID();
        await c.env.DB.prepare(
          "INSERT INTO jtbd_categories (id, user_id, category, job, situation, outcome, version_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
        ).bind(newCategoryId, userId, category.category, category.job, category.situation, category.outcome, versionId).run();
        const { results: sourceResources } = await c.env.DB.prepare(
          "SELECT * FROM resources WHERE category_id = ?"
        ).bind(category.id).all();
        for (const resource of sourceResources) {
          const newResourceId = crypto.randomUUID();
          await c.env.DB.prepare(
            "INSERT INTO resources (id, category_id, name, type, url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
          ).bind(newResourceId, newCategoryId, resource.name, resource.type, resource.url).run();
        }
      }
      console.log("Successfully copied data from version", copyFromVersionId, "to", versionId);
    } else {
      console.log("\u{1F331}\u{1F331}\u{1F331} SEEDING BRANCH EXECUTED - Starting default seeding for version", versionId);
      console.log("\u{1F331} User ID:", userId, "Version ID:", versionId);
      try {
        console.log("\u{1F331} About to call COMBINED seeding function...");
        console.log("\u{1F331} Starting proper default seeding (no debug tests)...");
        console.log("\u{1F331} Using the same seeding functions that work for new accounts...");
        await seedDefaultTemplates(userId, c.env.DB, versionId);
        console.log("\u2705 Templates seeded successfully");
        console.log("\u{1F50D} About to call seedDefaultResources with userId:", userId, "versionId:", versionId);
        await seedDefaultResources(userId, c.env.DB, versionId);
        console.log("\u2705 Resources seeded successfully");
        const createdCategories = await c.env.DB.prepare(
          "SELECT id, category, version_id FROM jtbd_categories WHERE user_id = ? AND version_id = ?"
        ).bind(userId, versionId).all();
        console.log("\u{1F50D} Verification: Created categories for this version:", createdCategories.results?.length || 0);
        if (createdCategories.results) {
          createdCategories.results.forEach((cat) => {
            console.log("\u{1F50D} Category:", cat.category, "ID:", cat.id, "Version:", cat.version_id);
          });
        }
        console.log("\u{1F389}\u{1F389} SEEDING COMPLETED using working new account functions!");
        console.log("\u2705\u2705\u2705 ALL SEEDING COMPLETED for version", versionId);
      } catch (seedError) {
        console.error("\u274C\u274C\u274C SEEDING ERROR:", seedError);
        console.error("\u274C Error details:", JSON.stringify(seedError, null, 2));
      }
    }
    const newVersion = await c.env.DB.prepare(
      "SELECT * FROM template_versions WHERE id = ?"
    ).bind(versionId).first();
    return c.json({ success: true, data: newVersion });
  } catch (error) {
    console.error("Failed to create version:", error);
    return c.json({ success: false, error: "Failed to create version" }, 500);
  }
});
app.put("/api/versions/:versionId", async (c) => {
  const versionId = c.req.param("versionId");
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "No token provided" }, 401);
  }
  const { name, description } = await c.req.json();
  if (!name) {
    return c.json({ success: false, error: "Name is required" }, 400);
  }
  try {
    await c.env.DB.prepare(
      "UPDATE template_versions SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(name, description || null, versionId).run();
    const updatedVersion = await c.env.DB.prepare(
      "SELECT * FROM template_versions WHERE id = ?"
    ).bind(versionId).first();
    return c.json({ success: true, data: updatedVersion });
  } catch (error) {
    console.error("Failed to update version:", error);
    return c.json({ success: false, error: "Failed to update version" }, 500);
  }
});
app.delete("/api/versions/:versionId", async (c) => {
  const versionId = c.req.param("versionId");
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "No token provided" }, 401);
  }
  try {
    const version = await c.env.DB.prepare(
      "SELECT * FROM template_versions WHERE id = ?"
    ).bind(versionId).first();
    if (!version) {
      return c.json({ success: false, error: "Version not found" }, 404);
    }
    if (version.is_default) {
      return c.json({ success: false, error: "Cannot delete the default version" }, 400);
    }
    await c.env.DB.prepare("DELETE FROM template_versions WHERE id = ?").bind(versionId).run();
    return c.json({ success: true });
  } catch (error) {
    console.error("Failed to delete version:", error);
    return c.json({ success: false, error: "Failed to delete version" }, 500);
  }
});
app.post("/api/versions/:versionId/set-default", async (c) => {
  const versionId = c.req.param("versionId");
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "No token provided" }, 401);
  }
  try {
    const version = await c.env.DB.prepare(
      "SELECT * FROM template_versions WHERE id = ?"
    ).bind(versionId).first();
    if (!version) {
      return c.json({ success: false, error: "Version not found" }, 404);
    }
    await c.env.DB.prepare(
      "UPDATE template_versions SET is_default = 0, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?"
    ).bind(version.user_id).run();
    await c.env.DB.prepare(
      "UPDATE template_versions SET is_default = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(versionId).run();
    const updatedVersion = await c.env.DB.prepare(
      "SELECT * FROM template_versions WHERE id = ?"
    ).bind(versionId).first();
    return c.json({ success: true, data: updatedVersion });
  } catch (error) {
    console.error("Failed to set default version:", error);
    return c.json({ success: false, error: "Failed to set default version" }, 500);
  }
});
app.post("/api/users", async (c) => {
  const { id, email, name, profileImageUrl } = await c.req.json();
  if (!id || !email || !name) {
    return c.json({ success: false, error: "Missing required fields" }, 400);
  }
  try {
    await c.env.DB.prepare(
      "INSERT OR REPLACE INTO users (id, email, name, profile_image_url, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)"
    ).bind(id, email, name, profileImageUrl).run();
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: "Failed to create/update user" }, 500);
  }
});
app.get("/api/auth/google", async (c) => {
  console.log("\u{1F510} [OAuth] Starting Google OAuth flow");
  try {
    const origin = new URL(c.req.url).origin;
    const redirectUri = `${origin}/api/auth/google/callback`;
    console.log("\u{1F517} [OAuth] Origin:", origin);
    console.log("\u{1F517} [OAuth] Redirect URI:", redirectUri);
    if (!c.env.GOOGLE_CLIENT_ID) {
      console.error("\u274C [OAuth] GOOGLE_CLIENT_ID is not configured");
      return c.redirect("/?error=oauth_config_missing");
    }
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", c.env.GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("access_type", "offline");
    console.log("\u2705 [OAuth] Redirecting to Google OAuth URL");
    console.log("\u{1F517} [OAuth] Google URL:", googleAuthUrl.toString());
    return c.redirect(googleAuthUrl.toString());
  } catch (error) {
    console.error("\u274C [OAuth] Error in Google OAuth initiation:", error);
    return c.redirect("/?error=oauth_init_failed");
  }
});
app.get("/api/auth/config", async (c) => {
  return c.json({
    googleClientId: c.env.GOOGLE_CLIENT_ID
  });
});
app.get("/api/auth/google/callback", async (c) => {
  console.log("\u{1F504} [OAuth] Processing Google OAuth callback");
  const code = c.req.query("code");
  const error = c.req.query("error");
  const state = c.req.query("state");
  console.log("\u{1F4E5} [OAuth] Callback parameters:", {
    hasCode: !!code,
    error: error || "none",
    state: state || "none"
  });
  if (error) {
    console.error("\u274C [OAuth] Google returned error:", error);
    return c.redirect(`/?error=auth_failed&details=${encodeURIComponent(error)}`);
  }
  if (!code) {
    console.error("\u274C [OAuth] No authorization code received");
    return c.redirect("/?error=auth_failed&details=no_code");
  }
  try {
    const origin = new URL(c.req.url).origin;
    const redirectUri = `${origin}/api/auth/google/callback`;
    console.log("\u{1F517} [OAuth] Token exchange redirect URI:", redirectUri);
    if (!c.env.GOOGLE_CLIENT_ID || !c.env.GOOGLE_CLIENT_SECRET) {
      console.error("\u274C [OAuth] Missing Google OAuth credentials");
      return c.redirect("/?error=oauth_config_missing");
    }
    console.log("\u{1F504} [OAuth] Exchanging code for tokens...");
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: c.env.GOOGLE_CLIENT_ID,
        client_secret: c.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri
      })
    });
    console.log("\u{1F4CA} [OAuth] Token response status:", tokenResponse.status);
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("\u274C [OAuth] Token exchange failed:", {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      });
      return c.redirect(`/?error=token_failed&status=${tokenResponse.status}`);
    }
    const tokens = await tokenResponse.json();
    console.log("\u{1F39F}\uFE0F [OAuth] Token exchange successful, access_token present:", !!tokens.access_token);
    if (!tokens.access_token) {
      console.error("\u274C [OAuth] No access token in response:", tokens);
      return c.redirect("/?error=token_failed&details=no_access_token");
    }
    console.log("\u{1F464} [OAuth] Fetching user info from Google...");
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    });
    console.log("\u{1F4CA} [OAuth] User info response status:", userResponse.status);
    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error("\u274C [OAuth] Failed to fetch user info:", {
        status: userResponse.status,
        statusText: userResponse.statusText,
        error: errorText
      });
      return c.redirect(`/?error=userinfo_failed&status=${userResponse.status}`);
    }
    const userInfo = await userResponse.json();
    console.log("\u2705 [OAuth] User info retrieved:", {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      hasPicture: !!userInfo.picture
    });
    console.log("\u{1F50D} [OAuth] Checking if user exists in database...");
    let user = await c.env.DB.prepare(
      "SELECT * FROM users WHERE id = ? OR email = ?"
    ).bind(userInfo.id, userInfo.email).first();
    if (user) {
      console.log("\u{1F504} [OAuth] Updating existing user:", user.id);
      try {
        await c.env.DB.prepare(
          "UPDATE users SET name = ?, profile_image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
        ).bind(userInfo.name, userInfo.picture, user.id).run();
        console.log("\u2705 [OAuth] User updated successfully");
      } catch (dbError) {
        console.error("\u274C [OAuth] Failed to update user:", dbError);
        return c.redirect("/?error=db_update_failed");
      }
    } else {
      console.log("\u{1F195} [OAuth] Creating new user:", userInfo.id);
      try {
        await c.env.DB.prepare(
          "INSERT INTO users (id, email, name, profile_image_url) VALUES (?, ?, ?, ?)"
        ).bind(userInfo.id, userInfo.email, userInfo.name, userInfo.picture).run();
        console.log("\u2705 [OAuth] New user created successfully");
        user = { id: userInfo.id, email: userInfo.email, name: userInfo.name, profile_image_url: userInfo.picture };
        const defaultVersionId = crypto.randomUUID();
        console.log("\u{1F331} [OAuth] Creating default version for new user:", userInfo.id, "with version ID:", defaultVersionId);
        await c.env.DB.prepare(
          "INSERT INTO template_versions (id, user_id, name, description, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
        ).bind(
          defaultVersionId,
          userInfo.id,
          "Base version",
          "My starter version",
          1,
          // is_default = true
          (/* @__PURE__ */ new Date()).toISOString(),
          (/* @__PURE__ */ new Date()).toISOString()
        ).run();
        console.log("\u2705 [OAuth] Default version created successfully");
        console.log("\u{1F331} [OAuth] Seeding default content into default version...");
        await seedDefaultTemplates(userInfo.id, c.env.DB, defaultVersionId);
        await seedDefaultResources(userInfo.id, c.env.DB, defaultVersionId);
        console.log("\u2705 [OAuth] Default content seeded into default version");
      } catch (dbError) {
        console.error("\u274C [OAuth] Failed to create new user or seed content:", dbError);
        return c.redirect("/?error=db_create_failed");
      }
    }
    console.log("\u{1F39F}\uFE0F [OAuth] Creating JWT token...");
    try {
      const jwtToken = createJWT(
        {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture
        },
        c.env.JWT_SECRET
      );
      const userData = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture
      };
      console.log("\u2705 [OAuth] JWT token created successfully, redirecting to app...");
      return c.redirect(`/?token=${jwtToken}&user=${encodeURIComponent(JSON.stringify(userData))}`);
    } catch (jwtError) {
      console.error("\u274C [OAuth] Failed to create JWT token:", jwtError);
      return c.redirect("/?error=jwt_creation_failed");
    }
  } catch (error2) {
    console.error("\u274C [OAuth] Unexpected error in OAuth callback:", error2);
    return c.redirect("/?error=auth_error");
  }
});
app.get("/api/auth/verify", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "No token provided" }, 401);
  }
  const token = authHeader.substring(7);
  try {
    const tokenData = verifyJWT(token, c.env.JWT_SECRET);
    const user = await c.env.DB.prepare(
      "SELECT * FROM users WHERE id = ?"
    ).bind(tokenData.id).first();
    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.profile_image_url
      }
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return c.json({ error: "Invalid token" }, 401);
  }
});
var generateUserId = /* @__PURE__ */ __name(() => {
  return "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}, "generateUserId");
var createJWT = /* @__PURE__ */ __name((payload, secret) => {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1e3);
  const exp = now + 7 * 24 * 60 * 60;
  const tokenPayload = { ...payload, iat: now, exp };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(tokenPayload));
  const signature = btoa(secret + encodedHeader + encodedPayload);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}, "createJWT");
var verifyJWT = /* @__PURE__ */ __name((token, secret) => {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }
  const [header, payload, signature] = parts;
  const expectedSignature = btoa(secret + header + payload);
  if (signature !== expectedSignature) {
    throw new Error("Invalid token signature");
  }
  const tokenData = JSON.parse(atob(payload));
  if (Date.now() / 1e3 > tokenData.exp) {
    throw new Error("Token expired");
  }
  return tokenData;
}, "verifyJWT");
var seedDefaultTemplates = /* @__PURE__ */ __name(async (userId, db, versionId) => {
  const defaultTemplates = [
    // First Day
    { period: "firstDay", title: "Complete IT setup and access accounts", priority: "high" },
    { period: "firstDay", title: "Meet your direct manager and team", priority: "high" },
    { period: "firstDay", title: "Review job description and expectations", priority: "high" },
    { period: "firstDay", title: "Complete required HR paperwork", priority: "medium" },
    { period: "firstDay", title: "Take office tour and locate key areas", priority: "medium" },
    // First Week
    { period: "firstWeek", title: "Schedule 1:1s with key stakeholders", priority: "high" },
    { period: "firstWeek", title: "Review company handbook and policies", priority: "medium" },
    { period: "firstWeek", title: "Set up development environment", priority: "high" },
    { period: "firstWeek", title: "Join relevant Slack channels and meetings", priority: "medium" },
    { period: "firstWeek", title: "Complete security and compliance training", priority: "medium" },
    // Second Week
    { period: "secondWeek", title: "Shadow team members on current projects", priority: "high" },
    { period: "secondWeek", title: "Review codebase and documentation", priority: "high" },
    { period: "secondWeek", title: "Attend team retrospective and planning", priority: "medium" },
    // Third Week
    { period: "thirdWeek", title: "Take on first small project or task", priority: "high" },
    { period: "thirdWeek", title: "Provide feedback on onboarding process", priority: "low" },
    // First Month
    { period: "firstMonth", title: "Complete 30-day check-in with manager", priority: "high" },
    { period: "firstMonth", title: "Set goals for next 60 days", priority: "medium" }
  ];
  try {
    for (const template of defaultTemplates) {
      const templateId = crypto.randomUUID();
      await db.prepare(
        "INSERT INTO onboarding_templates (id, user_id, period, title, priority, completed, version_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
      ).bind(
        templateId,
        userId,
        template.period,
        template.title,
        template.priority,
        false,
        versionId || null
      ).run();
    }
    console.log(`\u2705 Successfully seeded ${defaultTemplates.length} default templates for user ${userId}`);
  } catch (error) {
    console.error("\u274C Error seeding default templates:", error);
    throw error;
  }
}, "seedDefaultTemplates");
var seedDefaultResources = /* @__PURE__ */ __name(async (userId, db, versionId) => {
  const defaultCategories = [
    {
      id: crypto.randomUUID(),
      category: "Design Tools & Systems",
      job: "create consistent designs",
      situation: "access to design systems and tools",
      outcome: "work efficiently and maintain brand consistency",
      resources: [
        { name: "Figma Component Library", type: "tool", url: "#" },
        { name: "Design System Documentation", type: "article", url: "#" },
        { name: "Brand Guidelines", type: "guide", url: "#" }
      ]
    },
    {
      id: crypto.randomUUID(),
      category: "Process & Workflow",
      job: "understand our design process",
      situation: "clear workflow documentation",
      outcome: "collaborate effectively with my team",
      resources: [
        { name: "Design Process Playbook", type: "guide", url: "#" },
        { name: "Critique Guidelines", type: "guide", url: "#" },
        { name: "Handoff Checklist", type: "tool", url: "#" }
      ]
    },
    {
      id: crypto.randomUUID(),
      category: "Research & Strategy",
      job: "make informed design decisions",
      situation: "access to user research and strategy docs",
      outcome: "design with user needs in mind",
      resources: [
        { name: "User Research Repository", type: "tool", url: "#" },
        { name: "Question Bank", type: "guide", url: "#" },
        { name: "Usability Testing Templates", type: "tool", url: "#" }
      ]
    }
  ];
  try {
    console.log("\u{1F50D} Starting to seed", defaultCategories.length, "JTBD categories for user", userId, "version", versionId);
    for (const category of defaultCategories) {
      console.log("\u{1F50D} Inserting JTBD category:", category.category, "with ID:", category.id);
      await db.prepare(
        "INSERT INTO jtbd_categories (id, user_id, category, job, situation, outcome, version_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
      ).bind(category.id, userId, category.category, category.job, category.situation, category.outcome, versionId || null).run();
      console.log("\u2705 Successfully inserted JTBD category:", category.category);
      console.log("\u{1F50D} Inserting", category.resources.length, "resources for category:", category.category);
      for (let i = 0; i < category.resources.length; i++) {
        const resource = category.resources[i];
        const resourceId = `res_${userId}_${category.id}_${i + 1}`;
        console.log("\u{1F50D} Inserting resource:", resource.name, "with ID:", resourceId, "for category ID:", category.id);
        await db.prepare(
          "INSERT INTO resources (id, category_id, name, type, url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
        ).bind(resourceId, category.id, resource.name, resource.type, resource.url).run();
        console.log("\u2705 Successfully inserted resource:", resource.name);
      }
    }
    console.log(`\u2705 Successfully seeded ${defaultCategories.length} JTBD categories and resources for user ${userId} in version ${versionId}`);
  } catch (error) {
    console.error("\u274C Error seeding default resources:", error);
    console.error("\u274C Full error details:", JSON.stringify(error, null, 2));
  }
}, "seedDefaultResources");
app.post("/api/auth/register", async (c) => {
  const { email, password, name } = await c.req.json();
  if (!email || !password || !name) {
    return c.json({ error: "Email, password, and name are required" }, 400);
  }
  try {
    const existingUser = await c.env.DB.prepare(
      "SELECT * FROM users WHERE email = ?"
    ).bind(email).first();
    if (existingUser) {
      return c.json({ error: "User with this email already exists" }, 400);
    }
    const passwordHash = await hash(password, 10);
    const userId = generateUserId();
    await c.env.DB.prepare(
      "INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)"
    ).bind(userId, email, name, passwordHash).run();
    const defaultVersionId = crypto.randomUUID();
    console.log("\u{1F331} Creating default version for new email user:", userId, "with version ID:", defaultVersionId);
    await c.env.DB.prepare(
      "INSERT INTO template_versions (id, user_id, name, description, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      defaultVersionId,
      userId,
      "Base version",
      "My starter version",
      1,
      // is_default = true
      (/* @__PURE__ */ new Date()).toISOString(),
      (/* @__PURE__ */ new Date()).toISOString()
    ).run();
    console.log("\u2705 Default version created successfully for email user");
    console.log("\u{1F331} Seeding default content into default version for email user...");
    await seedDefaultTemplates(userId, c.env.DB, defaultVersionId);
    await seedDefaultResources(userId, c.env.DB, defaultVersionId);
    console.log("\u2705 Default content seeded into default version for email user");
    const token = createJWT(
      { id: userId, email, name },
      c.env.JWT_SECRET
    );
    return c.json({
      token,
      user: { id: userId, email, name }
    }, 201);
  } catch (error) {
    console.error("Registration error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.post("/api/auth/login", async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }
  try {
    const user = await c.env.DB.prepare(
      "SELECT * FROM users WHERE email = ?"
    ).bind(email).first();
    if (!user) {
      return c.json({ error: "Invalid email or password" }, 401);
    }
    if (!user.password_hash) {
      return c.json({ error: "Invalid email or password" }, 401);
    }
    const validPassword = await compare(password, user.password_hash);
    if (!validPassword) {
      return c.json({ error: "Invalid email or password" }, 401);
    }
    const existingVersions = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM template_versions WHERE user_id = ?"
    ).bind(user.id).first();
    if (existingVersions.count === 0) {
      console.log("\u{1F331} [Email Login] Creating default version for existing user:", user.id);
      const defaultVersionId = crypto.randomUUID();
      await c.env.DB.prepare(
        "INSERT INTO template_versions (id, user_id, name, description, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        defaultVersionId,
        user.id,
        "Base version",
        "My starter version",
        1,
        // is_default = true
        (/* @__PURE__ */ new Date()).toISOString(),
        (/* @__PURE__ */ new Date()).toISOString()
      ).run();
      console.log("\u2705 [Email Login] Default version created successfully");
      console.log("\u{1F331} [Email Login] Seeding default content into default version...");
      await seedDefaultTemplates(user.id, c.env.DB, defaultVersionId);
      await seedDefaultResources(user.id, c.env.DB, defaultVersionId);
      console.log("\u2705 [Email Login] Default content seeded into default version");
    }
    const token = createJWT(
      { id: user.id, email: user.email, name: user.name, picture: user.profile_image_url },
      c.env.JWT_SECRET
    );
    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.profile_image_url
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.delete("/api/auth/delete-account", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "No token provided" }, 401);
  }
  const token = authHeader.substring(7);
  try {
    const tokenData = verifyJWT(token, c.env.JWT_SECRET);
    const user = await c.env.DB.prepare(
      "SELECT * FROM users WHERE id = ?"
    ).bind(tokenData.id).first();
    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }
    const userId = tokenData.id;
    await c.env.DB.prepare(
      "DELETE FROM onboarding_templates WHERE user_id = ?"
    ).bind(userId).run();
    await c.env.DB.prepare(
      "DELETE FROM resources WHERE category_id IN (SELECT id FROM jtbd_categories WHERE user_id = ?)"
    ).bind(userId).run();
    await c.env.DB.prepare(
      "DELETE FROM jtbd_categories WHERE user_id = ?"
    ).bind(userId).run();
    await c.env.DB.prepare(
      "DELETE FROM users WHERE id = ?"
    ).bind(userId).run();
    return c.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app.get("*", async (c) => {
  const url = new URL(c.req.url);
  const response = await c.env.ASSETS.fetch(c.req.url);
  if (response.status === 404) {
    const indexUrl = new URL("/index.html", url.origin);
    return c.env.ASSETS.fetch(indexUrl.toString());
  }
  return response;
});
var index_default = app;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_checked_fetch();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_checked_fetch();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-BU483c/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = index_default;

// node_modules/wrangler/templates/middleware/common.ts
init_checked_fetch();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-BU483c/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
