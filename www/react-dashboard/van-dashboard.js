var Ay = Object.defineProperty;
var zy = (a, s, r) => s in a ? Ay(a, s, { enumerable: !0, configurable: !0, writable: !0, value: r }) : a[s] = r;
var Nr = (a, s, r) => zy(a, typeof s != "symbol" ? s + "" : s, r);
var vo = { exports: {} }, Gs = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var i0;
function Oy() {
  if (i0) return Gs;
  i0 = 1;
  var a = Symbol.for("react.transitional.element"), s = Symbol.for("react.fragment");
  function r(u, f, d) {
    var m = null;
    if (d !== void 0 && (m = "" + d), f.key !== void 0 && (m = "" + f.key), "key" in f) {
      d = {};
      for (var p in f)
        p !== "key" && (d[p] = f[p]);
    } else d = f;
    return f = d.ref, {
      $$typeof: a,
      type: u,
      key: m,
      ref: f !== void 0 ? f : null,
      props: d
    };
  }
  return Gs.Fragment = s, Gs.jsx = r, Gs.jsxs = r, Gs;
}
var r0;
function Ry() {
  return r0 || (r0 = 1, vo.exports = Oy()), vo.exports;
}
var o = Ry(), xo = { exports: {} }, Xs = {}, _o = { exports: {} }, bo = {};
/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var c0;
function ky() {
  return c0 || (c0 = 1, (function(a) {
    function s(z, G) {
      var ee = z.length;
      z.push(G);
      e: for (; 0 < ee; ) {
        var ye = ee - 1 >>> 1, Se = z[ye];
        if (0 < f(Se, G))
          z[ye] = G, z[ee] = Se, ee = ye;
        else break e;
      }
    }
    function r(z) {
      return z.length === 0 ? null : z[0];
    }
    function u(z) {
      if (z.length === 0) return null;
      var G = z[0], ee = z.pop();
      if (ee !== G) {
        z[0] = ee;
        e: for (var ye = 0, Se = z.length, b = Se >>> 1; ye < b; ) {
          var k = 2 * (ye + 1) - 1, Y = z[k], W = k + 1, de = z[W];
          if (0 > f(Y, ee))
            W < Se && 0 > f(de, Y) ? (z[ye] = de, z[W] = ee, ye = W) : (z[ye] = Y, z[k] = ee, ye = k);
          else if (W < Se && 0 > f(de, ee))
            z[ye] = de, z[W] = ee, ye = W;
          else break e;
        }
      }
      return G;
    }
    function f(z, G) {
      var ee = z.sortIndex - G.sortIndex;
      return ee !== 0 ? ee : z.id - G.id;
    }
    if (a.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
      var d = performance;
      a.unstable_now = function() {
        return d.now();
      };
    } else {
      var m = Date, p = m.now();
      a.unstable_now = function() {
        return m.now() - p;
      };
    }
    var y = [], g = [], x = 1, _ = null, S = 3, j = !1, T = !1, D = !1, U = !1, V = typeof setTimeout == "function" ? setTimeout : null, J = typeof clearTimeout == "function" ? clearTimeout : null, L = typeof setImmediate < "u" ? setImmediate : null;
    function I(z) {
      for (var G = r(g); G !== null; ) {
        if (G.callback === null) u(g);
        else if (G.startTime <= z)
          u(g), G.sortIndex = G.expirationTime, s(y, G);
        else break;
        G = r(g);
      }
    }
    function se(z) {
      if (D = !1, I(z), !T)
        if (r(y) !== null)
          T = !0, Z || (Z = !0, P());
        else {
          var G = r(g);
          G !== null && Ne(se, G.startTime - z);
        }
    }
    var Z = !1, F = -1, $ = 5, fe = -1;
    function we() {
      return U ? !0 : !(a.unstable_now() - fe < $);
    }
    function me() {
      if (U = !1, Z) {
        var z = a.unstable_now();
        fe = z;
        var G = !0;
        try {
          e: {
            T = !1, D && (D = !1, J(F), F = -1), j = !0;
            var ee = S;
            try {
              t: {
                for (I(z), _ = r(y); _ !== null && !(_.expirationTime > z && we()); ) {
                  var ye = _.callback;
                  if (typeof ye == "function") {
                    _.callback = null, S = _.priorityLevel;
                    var Se = ye(
                      _.expirationTime <= z
                    );
                    if (z = a.unstable_now(), typeof Se == "function") {
                      _.callback = Se, I(z), G = !0;
                      break t;
                    }
                    _ === r(y) && u(y), I(z);
                  } else u(y);
                  _ = r(y);
                }
                if (_ !== null) G = !0;
                else {
                  var b = r(g);
                  b !== null && Ne(
                    se,
                    b.startTime - z
                  ), G = !1;
                }
              }
              break e;
            } finally {
              _ = null, S = ee, j = !1;
            }
            G = void 0;
          }
        } finally {
          G ? P() : Z = !1;
        }
      }
    }
    var P;
    if (typeof L == "function")
      P = function() {
        L(me);
      };
    else if (typeof MessageChannel < "u") {
      var Le = new MessageChannel(), he = Le.port2;
      Le.port1.onmessage = me, P = function() {
        he.postMessage(null);
      };
    } else
      P = function() {
        V(me, 0);
      };
    function Ne(z, G) {
      F = V(function() {
        z(a.unstable_now());
      }, G);
    }
    a.unstable_IdlePriority = 5, a.unstable_ImmediatePriority = 1, a.unstable_LowPriority = 4, a.unstable_NormalPriority = 3, a.unstable_Profiling = null, a.unstable_UserBlockingPriority = 2, a.unstable_cancelCallback = function(z) {
      z.callback = null;
    }, a.unstable_forceFrameRate = function(z) {
      0 > z || 125 < z ? console.error(
        "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
      ) : $ = 0 < z ? Math.floor(1e3 / z) : 5;
    }, a.unstable_getCurrentPriorityLevel = function() {
      return S;
    }, a.unstable_next = function(z) {
      switch (S) {
        case 1:
        case 2:
        case 3:
          var G = 3;
          break;
        default:
          G = S;
      }
      var ee = S;
      S = G;
      try {
        return z();
      } finally {
        S = ee;
      }
    }, a.unstable_requestPaint = function() {
      U = !0;
    }, a.unstable_runWithPriority = function(z, G) {
      switch (z) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          z = 3;
      }
      var ee = S;
      S = z;
      try {
        return G();
      } finally {
        S = ee;
      }
    }, a.unstable_scheduleCallback = function(z, G, ee) {
      var ye = a.unstable_now();
      switch (typeof ee == "object" && ee !== null ? (ee = ee.delay, ee = typeof ee == "number" && 0 < ee ? ye + ee : ye) : ee = ye, z) {
        case 1:
          var Se = -1;
          break;
        case 2:
          Se = 250;
          break;
        case 5:
          Se = 1073741823;
          break;
        case 4:
          Se = 1e4;
          break;
        default:
          Se = 5e3;
      }
      return Se = ee + Se, z = {
        id: x++,
        callback: G,
        priorityLevel: z,
        startTime: ee,
        expirationTime: Se,
        sortIndex: -1
      }, ee > ye ? (z.sortIndex = ee, s(g, z), r(y) === null && z === r(g) && (D ? (J(F), F = -1) : D = !0, Ne(se, ee - ye))) : (z.sortIndex = Se, s(y, z), T || j || (T = !0, Z || (Z = !0, P()))), z;
    }, a.unstable_shouldYield = we, a.unstable_wrapCallback = function(z) {
      var G = S;
      return function() {
        var ee = S;
        S = G;
        try {
          return z.apply(this, arguments);
        } finally {
          S = ee;
        }
      };
    };
  })(bo)), bo;
}
var u0;
function Dy() {
  return u0 || (u0 = 1, _o.exports = ky()), _o.exports;
}
var wo = { exports: {} }, pe = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var o0;
function Hy() {
  if (o0) return pe;
  o0 = 1;
  var a = Symbol.for("react.transitional.element"), s = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), u = Symbol.for("react.strict_mode"), f = Symbol.for("react.profiler"), d = Symbol.for("react.consumer"), m = Symbol.for("react.context"), p = Symbol.for("react.forward_ref"), y = Symbol.for("react.suspense"), g = Symbol.for("react.memo"), x = Symbol.for("react.lazy"), _ = Symbol.for("react.activity"), S = Symbol.iterator;
  function j(b) {
    return b === null || typeof b != "object" ? null : (b = S && b[S] || b["@@iterator"], typeof b == "function" ? b : null);
  }
  var T = {
    isMounted: function() {
      return !1;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, D = Object.assign, U = {};
  function V(b, k, Y) {
    this.props = b, this.context = k, this.refs = U, this.updater = Y || T;
  }
  V.prototype.isReactComponent = {}, V.prototype.setState = function(b, k) {
    if (typeof b != "object" && typeof b != "function" && b != null)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, b, k, "setState");
  }, V.prototype.forceUpdate = function(b) {
    this.updater.enqueueForceUpdate(this, b, "forceUpdate");
  };
  function J() {
  }
  J.prototype = V.prototype;
  function L(b, k, Y) {
    this.props = b, this.context = k, this.refs = U, this.updater = Y || T;
  }
  var I = L.prototype = new J();
  I.constructor = L, D(I, V.prototype), I.isPureReactComponent = !0;
  var se = Array.isArray;
  function Z() {
  }
  var F = { H: null, A: null, T: null, S: null }, $ = Object.prototype.hasOwnProperty;
  function fe(b, k, Y) {
    var W = Y.ref;
    return {
      $$typeof: a,
      type: b,
      key: k,
      ref: W !== void 0 ? W : null,
      props: Y
    };
  }
  function we(b, k) {
    return fe(b.type, k, b.props);
  }
  function me(b) {
    return typeof b == "object" && b !== null && b.$$typeof === a;
  }
  function P(b) {
    var k = { "=": "=0", ":": "=2" };
    return "$" + b.replace(/[=:]/g, function(Y) {
      return k[Y];
    });
  }
  var Le = /\/+/g;
  function he(b, k) {
    return typeof b == "object" && b !== null && b.key != null ? P("" + b.key) : k.toString(36);
  }
  function Ne(b) {
    switch (b.status) {
      case "fulfilled":
        return b.value;
      case "rejected":
        throw b.reason;
      default:
        switch (typeof b.status == "string" ? b.then(Z, Z) : (b.status = "pending", b.then(
          function(k) {
            b.status === "pending" && (b.status = "fulfilled", b.value = k);
          },
          function(k) {
            b.status === "pending" && (b.status = "rejected", b.reason = k);
          }
        )), b.status) {
          case "fulfilled":
            return b.value;
          case "rejected":
            throw b.reason;
        }
    }
    throw b;
  }
  function z(b, k, Y, W, de) {
    var Q = typeof b;
    (Q === "undefined" || Q === "boolean") && (b = null);
    var ce = !1;
    if (b === null) ce = !0;
    else
      switch (Q) {
        case "bigint":
        case "string":
        case "number":
          ce = !0;
          break;
        case "object":
          switch (b.$$typeof) {
            case a:
            case s:
              ce = !0;
              break;
            case x:
              return ce = b._init, z(
                ce(b._payload),
                k,
                Y,
                W,
                de
              );
          }
      }
    if (ce)
      return de = de(b), ce = W === "" ? "." + he(b, 0) : W, se(de) ? (Y = "", ce != null && (Y = ce.replace(Le, "$&/") + "/"), z(de, k, Y, "", function(_t) {
        return _t;
      })) : de != null && (me(de) && (de = we(
        de,
        Y + (de.key == null || b && b.key === de.key ? "" : ("" + de.key).replace(
          Le,
          "$&/"
        ) + "/") + ce
      )), k.push(de)), 1;
    ce = 0;
    var be = W === "" ? "." : W + ":";
    if (se(b))
      for (var ze = 0; ze < b.length; ze++)
        W = b[ze], Q = be + he(W, ze), ce += z(
          W,
          k,
          Y,
          Q,
          de
        );
    else if (ze = j(b), typeof ze == "function")
      for (b = ze.call(b), ze = 0; !(W = b.next()).done; )
        W = W.value, Q = be + he(W, ze++), ce += z(
          W,
          k,
          Y,
          Q,
          de
        );
    else if (Q === "object") {
      if (typeof b.then == "function")
        return z(
          Ne(b),
          k,
          Y,
          W,
          de
        );
      throw k = String(b), Error(
        "Objects are not valid as a React child (found: " + (k === "[object Object]" ? "object with keys {" + Object.keys(b).join(", ") + "}" : k) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return ce;
  }
  function G(b, k, Y) {
    if (b == null) return b;
    var W = [], de = 0;
    return z(b, W, "", "", function(Q) {
      return k.call(Y, Q, de++);
    }), W;
  }
  function ee(b) {
    if (b._status === -1) {
      var k = b._result;
      k = k(), k.then(
        function(Y) {
          (b._status === 0 || b._status === -1) && (b._status = 1, b._result = Y);
        },
        function(Y) {
          (b._status === 0 || b._status === -1) && (b._status = 2, b._result = Y);
        }
      ), b._status === -1 && (b._status = 0, b._result = k);
    }
    if (b._status === 1) return b._result.default;
    throw b._result;
  }
  var ye = typeof reportError == "function" ? reportError : function(b) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var k = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof b == "object" && b !== null && typeof b.message == "string" ? String(b.message) : String(b),
        error: b
      });
      if (!window.dispatchEvent(k)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", b);
      return;
    }
    console.error(b);
  }, Se = {
    map: G,
    forEach: function(b, k, Y) {
      G(
        b,
        function() {
          k.apply(this, arguments);
        },
        Y
      );
    },
    count: function(b) {
      var k = 0;
      return G(b, function() {
        k++;
      }), k;
    },
    toArray: function(b) {
      return G(b, function(k) {
        return k;
      }) || [];
    },
    only: function(b) {
      if (!me(b))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return b;
    }
  };
  return pe.Activity = _, pe.Children = Se, pe.Component = V, pe.Fragment = r, pe.Profiler = f, pe.PureComponent = L, pe.StrictMode = u, pe.Suspense = y, pe.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = F, pe.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(b) {
      return F.H.useMemoCache(b);
    }
  }, pe.cache = function(b) {
    return function() {
      return b.apply(null, arguments);
    };
  }, pe.cacheSignal = function() {
    return null;
  }, pe.cloneElement = function(b, k, Y) {
    if (b == null)
      throw Error(
        "The argument must be a React element, but you passed " + b + "."
      );
    var W = D({}, b.props), de = b.key;
    if (k != null)
      for (Q in k.key !== void 0 && (de = "" + k.key), k)
        !$.call(k, Q) || Q === "key" || Q === "__self" || Q === "__source" || Q === "ref" && k.ref === void 0 || (W[Q] = k[Q]);
    var Q = arguments.length - 2;
    if (Q === 1) W.children = Y;
    else if (1 < Q) {
      for (var ce = Array(Q), be = 0; be < Q; be++)
        ce[be] = arguments[be + 2];
      W.children = ce;
    }
    return fe(b.type, de, W);
  }, pe.createContext = function(b) {
    return b = {
      $$typeof: m,
      _currentValue: b,
      _currentValue2: b,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    }, b.Provider = b, b.Consumer = {
      $$typeof: d,
      _context: b
    }, b;
  }, pe.createElement = function(b, k, Y) {
    var W, de = {}, Q = null;
    if (k != null)
      for (W in k.key !== void 0 && (Q = "" + k.key), k)
        $.call(k, W) && W !== "key" && W !== "__self" && W !== "__source" && (de[W] = k[W]);
    var ce = arguments.length - 2;
    if (ce === 1) de.children = Y;
    else if (1 < ce) {
      for (var be = Array(ce), ze = 0; ze < ce; ze++)
        be[ze] = arguments[ze + 2];
      de.children = be;
    }
    if (b && b.defaultProps)
      for (W in ce = b.defaultProps, ce)
        de[W] === void 0 && (de[W] = ce[W]);
    return fe(b, Q, de);
  }, pe.createRef = function() {
    return { current: null };
  }, pe.forwardRef = function(b) {
    return { $$typeof: p, render: b };
  }, pe.isValidElement = me, pe.lazy = function(b) {
    return {
      $$typeof: x,
      _payload: { _status: -1, _result: b },
      _init: ee
    };
  }, pe.memo = function(b, k) {
    return {
      $$typeof: g,
      type: b,
      compare: k === void 0 ? null : k
    };
  }, pe.startTransition = function(b) {
    var k = F.T, Y = {};
    F.T = Y;
    try {
      var W = b(), de = F.S;
      de !== null && de(Y, W), typeof W == "object" && W !== null && typeof W.then == "function" && W.then(Z, ye);
    } catch (Q) {
      ye(Q);
    } finally {
      k !== null && Y.types !== null && (k.types = Y.types), F.T = k;
    }
  }, pe.unstable_useCacheRefresh = function() {
    return F.H.useCacheRefresh();
  }, pe.use = function(b) {
    return F.H.use(b);
  }, pe.useActionState = function(b, k, Y) {
    return F.H.useActionState(b, k, Y);
  }, pe.useCallback = function(b, k) {
    return F.H.useCallback(b, k);
  }, pe.useContext = function(b) {
    return F.H.useContext(b);
  }, pe.useDebugValue = function() {
  }, pe.useDeferredValue = function(b, k) {
    return F.H.useDeferredValue(b, k);
  }, pe.useEffect = function(b, k) {
    return F.H.useEffect(b, k);
  }, pe.useEffectEvent = function(b) {
    return F.H.useEffectEvent(b);
  }, pe.useId = function() {
    return F.H.useId();
  }, pe.useImperativeHandle = function(b, k, Y) {
    return F.H.useImperativeHandle(b, k, Y);
  }, pe.useInsertionEffect = function(b, k) {
    return F.H.useInsertionEffect(b, k);
  }, pe.useLayoutEffect = function(b, k) {
    return F.H.useLayoutEffect(b, k);
  }, pe.useMemo = function(b, k) {
    return F.H.useMemo(b, k);
  }, pe.useOptimistic = function(b, k) {
    return F.H.useOptimistic(b, k);
  }, pe.useReducer = function(b, k, Y) {
    return F.H.useReducer(b, k, Y);
  }, pe.useRef = function(b) {
    return F.H.useRef(b);
  }, pe.useState = function(b) {
    return F.H.useState(b);
  }, pe.useSyncExternalStore = function(b, k, Y) {
    return F.H.useSyncExternalStore(
      b,
      k,
      Y
    );
  }, pe.useTransition = function() {
    return F.H.useTransition();
  }, pe.version = "19.2.5", pe;
}
var f0;
function $o() {
  return f0 || (f0 = 1, wo.exports = Hy()), wo.exports;
}
var So = { exports: {} }, Ct = {};
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var d0;
function Uy() {
  if (d0) return Ct;
  d0 = 1;
  var a = $o();
  function s(y) {
    var g = "https://react.dev/errors/" + y;
    if (1 < arguments.length) {
      g += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var x = 2; x < arguments.length; x++)
        g += "&args[]=" + encodeURIComponent(arguments[x]);
    }
    return "Minified React error #" + y + "; visit " + g + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function r() {
  }
  var u = {
    d: {
      f: r,
      r: function() {
        throw Error(s(522));
      },
      D: r,
      C: r,
      L: r,
      m: r,
      X: r,
      S: r,
      M: r
    },
    p: 0,
    findDOMNode: null
  }, f = Symbol.for("react.portal");
  function d(y, g, x) {
    var _ = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: f,
      key: _ == null ? null : "" + _,
      children: y,
      containerInfo: g,
      implementation: x
    };
  }
  var m = a.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function p(y, g) {
    if (y === "font") return "";
    if (typeof g == "string")
      return g === "use-credentials" ? g : "";
  }
  return Ct.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = u, Ct.createPortal = function(y, g) {
    var x = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!g || g.nodeType !== 1 && g.nodeType !== 9 && g.nodeType !== 11)
      throw Error(s(299));
    return d(y, g, null, x);
  }, Ct.flushSync = function(y) {
    var g = m.T, x = u.p;
    try {
      if (m.T = null, u.p = 2, y) return y();
    } finally {
      m.T = g, u.p = x, u.d.f();
    }
  }, Ct.preconnect = function(y, g) {
    typeof y == "string" && (g ? (g = g.crossOrigin, g = typeof g == "string" ? g === "use-credentials" ? g : "" : void 0) : g = null, u.d.C(y, g));
  }, Ct.prefetchDNS = function(y) {
    typeof y == "string" && u.d.D(y);
  }, Ct.preinit = function(y, g) {
    if (typeof y == "string" && g && typeof g.as == "string") {
      var x = g.as, _ = p(x, g.crossOrigin), S = typeof g.integrity == "string" ? g.integrity : void 0, j = typeof g.fetchPriority == "string" ? g.fetchPriority : void 0;
      x === "style" ? u.d.S(
        y,
        typeof g.precedence == "string" ? g.precedence : void 0,
        {
          crossOrigin: _,
          integrity: S,
          fetchPriority: j
        }
      ) : x === "script" && u.d.X(y, {
        crossOrigin: _,
        integrity: S,
        fetchPriority: j,
        nonce: typeof g.nonce == "string" ? g.nonce : void 0
      });
    }
  }, Ct.preinitModule = function(y, g) {
    if (typeof y == "string")
      if (typeof g == "object" && g !== null) {
        if (g.as == null || g.as === "script") {
          var x = p(
            g.as,
            g.crossOrigin
          );
          u.d.M(y, {
            crossOrigin: x,
            integrity: typeof g.integrity == "string" ? g.integrity : void 0,
            nonce: typeof g.nonce == "string" ? g.nonce : void 0
          });
        }
      } else g == null && u.d.M(y);
  }, Ct.preload = function(y, g) {
    if (typeof y == "string" && typeof g == "object" && g !== null && typeof g.as == "string") {
      var x = g.as, _ = p(x, g.crossOrigin);
      u.d.L(y, x, {
        crossOrigin: _,
        integrity: typeof g.integrity == "string" ? g.integrity : void 0,
        nonce: typeof g.nonce == "string" ? g.nonce : void 0,
        type: typeof g.type == "string" ? g.type : void 0,
        fetchPriority: typeof g.fetchPriority == "string" ? g.fetchPriority : void 0,
        referrerPolicy: typeof g.referrerPolicy == "string" ? g.referrerPolicy : void 0,
        imageSrcSet: typeof g.imageSrcSet == "string" ? g.imageSrcSet : void 0,
        imageSizes: typeof g.imageSizes == "string" ? g.imageSizes : void 0,
        media: typeof g.media == "string" ? g.media : void 0
      });
    }
  }, Ct.preloadModule = function(y, g) {
    if (typeof y == "string")
      if (g) {
        var x = p(g.as, g.crossOrigin);
        u.d.m(y, {
          as: typeof g.as == "string" && g.as !== "script" ? g.as : void 0,
          crossOrigin: x,
          integrity: typeof g.integrity == "string" ? g.integrity : void 0
        });
      } else u.d.m(y);
  }, Ct.requestFormReset = function(y) {
    u.d.r(y);
  }, Ct.unstable_batchedUpdates = function(y, g) {
    return y(g);
  }, Ct.useFormState = function(y, g, x) {
    return m.H.useFormState(y, g, x);
  }, Ct.useFormStatus = function() {
    return m.H.useHostTransitionStatus();
  }, Ct.version = "19.2.5", Ct;
}
var h0;
function Ly() {
  if (h0) return So.exports;
  h0 = 1;
  function a() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(a);
      } catch (s) {
        console.error(s);
      }
  }
  return a(), So.exports = Uy(), So.exports;
}
/**
 * @license React
 * react-dom-client.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var m0;
function By() {
  if (m0) return Xs;
  m0 = 1;
  var a = Dy(), s = $o(), r = Ly();
  function u(e) {
    var t = "https://react.dev/errors/" + e;
    if (1 < arguments.length) {
      t += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var n = 2; n < arguments.length; n++)
        t += "&args[]=" + encodeURIComponent(arguments[n]);
    }
    return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function f(e) {
    return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
  }
  function d(e) {
    var t = e, n = e;
    if (e.alternate) for (; t.return; ) t = t.return;
    else {
      e = t;
      do
        t = e, (t.flags & 4098) !== 0 && (n = t.return), e = t.return;
      while (e);
    }
    return t.tag === 3 ? n : null;
  }
  function m(e) {
    if (e.tag === 13) {
      var t = e.memoizedState;
      if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
    }
    return null;
  }
  function p(e) {
    if (e.tag === 31) {
      var t = e.memoizedState;
      if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
    }
    return null;
  }
  function y(e) {
    if (d(e) !== e)
      throw Error(u(188));
  }
  function g(e) {
    var t = e.alternate;
    if (!t) {
      if (t = d(e), t === null) throw Error(u(188));
      return t !== e ? null : e;
    }
    for (var n = e, l = t; ; ) {
      var i = n.return;
      if (i === null) break;
      var c = i.alternate;
      if (c === null) {
        if (l = i.return, l !== null) {
          n = l;
          continue;
        }
        break;
      }
      if (i.child === c.child) {
        for (c = i.child; c; ) {
          if (c === n) return y(i), e;
          if (c === l) return y(i), t;
          c = c.sibling;
        }
        throw Error(u(188));
      }
      if (n.return !== l.return) n = i, l = c;
      else {
        for (var h = !1, v = i.child; v; ) {
          if (v === n) {
            h = !0, n = i, l = c;
            break;
          }
          if (v === l) {
            h = !0, l = i, n = c;
            break;
          }
          v = v.sibling;
        }
        if (!h) {
          for (v = c.child; v; ) {
            if (v === n) {
              h = !0, n = c, l = i;
              break;
            }
            if (v === l) {
              h = !0, l = c, n = i;
              break;
            }
            v = v.sibling;
          }
          if (!h) throw Error(u(189));
        }
      }
      if (n.alternate !== l) throw Error(u(190));
    }
    if (n.tag !== 3) throw Error(u(188));
    return n.stateNode.current === n ? e : t;
  }
  function x(e) {
    var t = e.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return e;
    for (e = e.child; e !== null; ) {
      if (t = x(e), t !== null) return t;
      e = e.sibling;
    }
    return null;
  }
  var _ = Object.assign, S = Symbol.for("react.element"), j = Symbol.for("react.transitional.element"), T = Symbol.for("react.portal"), D = Symbol.for("react.fragment"), U = Symbol.for("react.strict_mode"), V = Symbol.for("react.profiler"), J = Symbol.for("react.consumer"), L = Symbol.for("react.context"), I = Symbol.for("react.forward_ref"), se = Symbol.for("react.suspense"), Z = Symbol.for("react.suspense_list"), F = Symbol.for("react.memo"), $ = Symbol.for("react.lazy"), fe = Symbol.for("react.activity"), we = Symbol.for("react.memo_cache_sentinel"), me = Symbol.iterator;
  function P(e) {
    return e === null || typeof e != "object" ? null : (e = me && e[me] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var Le = Symbol.for("react.client.reference");
  function he(e) {
    if (e == null) return null;
    if (typeof e == "function")
      return e.$$typeof === Le ? null : e.displayName || e.name || null;
    if (typeof e == "string") return e;
    switch (e) {
      case D:
        return "Fragment";
      case V:
        return "Profiler";
      case U:
        return "StrictMode";
      case se:
        return "Suspense";
      case Z:
        return "SuspenseList";
      case fe:
        return "Activity";
    }
    if (typeof e == "object")
      switch (e.$$typeof) {
        case T:
          return "Portal";
        case L:
          return e.displayName || "Context";
        case J:
          return (e._context.displayName || "Context") + ".Consumer";
        case I:
          var t = e.render;
          return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
        case F:
          return t = e.displayName || null, t !== null ? t : he(e.type) || "Memo";
        case $:
          t = e._payload, e = e._init;
          try {
            return he(e(t));
          } catch {
          }
      }
    return null;
  }
  var Ne = Array.isArray, z = s.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, G = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, ee = {
    pending: !1,
    data: null,
    method: null,
    action: null
  }, ye = [], Se = -1;
  function b(e) {
    return { current: e };
  }
  function k(e) {
    0 > Se || (e.current = ye[Se], ye[Se] = null, Se--);
  }
  function Y(e, t) {
    Se++, ye[Se] = e.current, e.current = t;
  }
  var W = b(null), de = b(null), Q = b(null), ce = b(null);
  function be(e, t) {
    switch (Y(Q, t), Y(de, e), Y(W, null), t.nodeType) {
      case 9:
      case 11:
        e = (e = t.documentElement) && (e = e.namespaceURI) ? Cm(e) : 0;
        break;
      default:
        if (e = t.tagName, t = t.namespaceURI)
          t = Cm(t), e = Am(t, e);
        else
          switch (e) {
            case "svg":
              e = 1;
              break;
            case "math":
              e = 2;
              break;
            default:
              e = 0;
          }
    }
    k(W), Y(W, e);
  }
  function ze() {
    k(W), k(de), k(Q);
  }
  function _t(e) {
    e.memoizedState !== null && Y(ce, e);
    var t = W.current, n = Am(t, e.type);
    t !== n && (Y(de, e), Y(W, n));
  }
  function Ze(e) {
    de.current === e && (k(W), k(de)), ce.current === e && (k(ce), Ls._currentValue = ee);
  }
  var Oe, We;
  function Ie(e) {
    if (Oe === void 0)
      try {
        throw Error();
      } catch (n) {
        var t = n.stack.trim().match(/\n( *(at )?)/);
        Oe = t && t[1] || "", We = -1 < n.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < n.stack.indexOf("@") ? "@unknown:0:0" : "";
      }
    return `
` + Oe + e + We;
  }
  var ft = !1;
  function kt(e, t) {
    if (!e || ft) return "";
    ft = !0;
    var n = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      var l = {
        DetermineComponentFrameRoot: function() {
          try {
            if (t) {
              var q = function() {
                throw Error();
              };
              if (Object.defineProperty(q.prototype, "props", {
                set: function() {
                  throw Error();
                }
              }), typeof Reflect == "object" && Reflect.construct) {
                try {
                  Reflect.construct(q, []);
                } catch (O) {
                  var A = O;
                }
                Reflect.construct(e, [], q);
              } else {
                try {
                  q.call();
                } catch (O) {
                  A = O;
                }
                e.call(q.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (O) {
                A = O;
              }
              (q = e()) && typeof q.catch == "function" && q.catch(function() {
              });
            }
          } catch (O) {
            if (O && A && typeof O.stack == "string")
              return [O.stack, A.stack];
          }
          return [null, null];
        }
      };
      l.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
      var i = Object.getOwnPropertyDescriptor(
        l.DetermineComponentFrameRoot,
        "name"
      );
      i && i.configurable && Object.defineProperty(
        l.DetermineComponentFrameRoot,
        "name",
        { value: "DetermineComponentFrameRoot" }
      );
      var c = l.DetermineComponentFrameRoot(), h = c[0], v = c[1];
      if (h && v) {
        var w = h.split(`
`), C = v.split(`
`);
        for (i = l = 0; l < w.length && !w[l].includes("DetermineComponentFrameRoot"); )
          l++;
        for (; i < C.length && !C[i].includes(
          "DetermineComponentFrameRoot"
        ); )
          i++;
        if (l === w.length || i === C.length)
          for (l = w.length - 1, i = C.length - 1; 1 <= l && 0 <= i && w[l] !== C[i]; )
            i--;
        for (; 1 <= l && 0 <= i; l--, i--)
          if (w[l] !== C[i]) {
            if (l !== 1 || i !== 1)
              do
                if (l--, i--, 0 > i || w[l] !== C[i]) {
                  var H = `
` + w[l].replace(" at new ", " at ");
                  return e.displayName && H.includes("<anonymous>") && (H = H.replace("<anonymous>", e.displayName)), H;
                }
              while (1 <= l && 0 <= i);
            break;
          }
      }
    } finally {
      ft = !1, Error.prepareStackTrace = n;
    }
    return (n = e ? e.displayName || e.name : "") ? Ie(n) : "";
  }
  function tn(e, t) {
    switch (e.tag) {
      case 26:
      case 27:
      case 5:
        return Ie(e.type);
      case 16:
        return Ie("Lazy");
      case 13:
        return e.child !== t && t !== null ? Ie("Suspense Fallback") : Ie("Suspense");
      case 19:
        return Ie("SuspenseList");
      case 0:
      case 15:
        return kt(e.type, !1);
      case 11:
        return kt(e.type.render, !1);
      case 1:
        return kt(e.type, !0);
      case 31:
        return Ie("Activity");
      default:
        return "";
    }
  }
  function nn(e) {
    try {
      var t = "", n = null;
      do
        t += tn(e, n), n = e, e = e.return;
      while (e);
      return t;
    } catch (l) {
      return `
Error generating stack: ` + l.message + `
` + l.stack;
    }
  }
  var bt = Object.prototype.hasOwnProperty, ie = a.unstable_scheduleCallback, Ke = a.unstable_cancelCallback, At = a.unstable_shouldYield, Vt = a.unstable_requestPaint, Re = a.unstable_now, nt = a.unstable_getCurrentPriorityLevel, wt = a.unstable_ImmediatePriority, gn = a.unstable_UserBlockingPriority, ln = a.unstable_NormalPriority, Rn = a.unstable_LowPriority, St = a.unstable_IdlePriority, Qt = a.log, je = a.unstable_setDisableYieldValue, Fe = null, Be = null;
  function Zt(e) {
    if (typeof Qt == "function" && je(e), Be && typeof Be.setStrictMode == "function")
      try {
        Be.setStrictMode(Fe, e);
      } catch {
      }
  }
  var zt = Math.clz32 ? Math.clz32 : $a, ac = Math.log, di = Math.LN2;
  function $a(e) {
    return e >>>= 0, e === 0 ? 32 : 31 - (ac(e) / di | 0) | 0;
  }
  var Wa = 256, Cl = 262144, Al = 4194304;
  function Ot(e) {
    var t = e & 42;
    if (t !== 0) return t;
    switch (e & -e) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
        return 64;
      case 128:
        return 128;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
        return e & 261888;
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return e & 3932160;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return e & 62914560;
      case 67108864:
        return 67108864;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 0;
      default:
        return e;
    }
  }
  function an(e, t, n) {
    var l = e.pendingLanes;
    if (l === 0) return 0;
    var i = 0, c = e.suspendedLanes, h = e.pingedLanes;
    e = e.warmLanes;
    var v = l & 134217727;
    return v !== 0 ? (l = v & ~c, l !== 0 ? i = Ot(l) : (h &= v, h !== 0 ? i = Ot(h) : n || (n = v & ~e, n !== 0 && (i = Ot(n))))) : (v = l & ~c, v !== 0 ? i = Ot(v) : h !== 0 ? i = Ot(h) : n || (n = l & ~e, n !== 0 && (i = Ot(n)))), i === 0 ? 0 : t !== 0 && t !== i && (t & c) === 0 && (c = i & -i, n = t & -t, c >= n || c === 32 && (n & 4194048) !== 0) ? t : i;
  }
  function Fa(e, t) {
    return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
  }
  function yg(e, t) {
    switch (e) {
      case 1:
      case 2:
      case 4:
      case 8:
      case 64:
        return t + 250;
      case 16:
      case 32:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return t + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return -1;
      case 67108864:
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function of() {
    var e = Al;
    return Al <<= 1, (Al & 62914560) === 0 && (Al = 4194304), e;
  }
  function sc(e) {
    for (var t = [], n = 0; 31 > n; n++) t.push(e);
    return t;
  }
  function Ia(e, t) {
    e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
  }
  function vg(e, t, n, l, i, c) {
    var h = e.pendingLanes;
    e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
    var v = e.entanglements, w = e.expirationTimes, C = e.hiddenUpdates;
    for (n = h & ~n; 0 < n; ) {
      var H = 31 - zt(n), q = 1 << H;
      v[H] = 0, w[H] = -1;
      var A = C[H];
      if (A !== null)
        for (C[H] = null, H = 0; H < A.length; H++) {
          var O = A[H];
          O !== null && (O.lane &= -536870913);
        }
      n &= ~q;
    }
    l !== 0 && ff(e, l, 0), c !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= c & ~(h & ~t));
  }
  function ff(e, t, n) {
    e.pendingLanes |= t, e.suspendedLanes &= ~t;
    var l = 31 - zt(t);
    e.entangledLanes |= t, e.entanglements[l] = e.entanglements[l] | 1073741824 | n & 261930;
  }
  function df(e, t) {
    var n = e.entangledLanes |= t;
    for (e = e.entanglements; n; ) {
      var l = 31 - zt(n), i = 1 << l;
      i & t | e[l] & t && (e[l] |= t), n &= ~i;
    }
  }
  function hf(e, t) {
    var n = t & -t;
    return n = (n & 42) !== 0 ? 1 : ic(n), (n & (e.suspendedLanes | t)) !== 0 ? 0 : n;
  }
  function ic(e) {
    switch (e) {
      case 2:
        e = 1;
        break;
      case 8:
        e = 4;
        break;
      case 32:
        e = 16;
        break;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        e = 128;
        break;
      case 268435456:
        e = 134217728;
        break;
      default:
        e = 0;
    }
    return e;
  }
  function rc(e) {
    return e &= -e, 2 < e ? 8 < e ? (e & 134217727) !== 0 ? 32 : 268435456 : 8 : 2;
  }
  function mf() {
    var e = G.p;
    return e !== 0 ? e : (e = window.event, e === void 0 ? 32 : Pm(e.type));
  }
  function pf(e, t) {
    var n = G.p;
    try {
      return G.p = e, t();
    } finally {
      G.p = n;
    }
  }
  var tl = Math.random().toString(36).slice(2), jt = "__reactFiber$" + tl, Dt = "__reactProps$" + tl, ta = "__reactContainer$" + tl, cc = "__reactEvents$" + tl, xg = "__reactListeners$" + tl, _g = "__reactHandles$" + tl, gf = "__reactResources$" + tl, Pa = "__reactMarker$" + tl;
  function uc(e) {
    delete e[jt], delete e[Dt], delete e[cc], delete e[xg], delete e[_g];
  }
  function na(e) {
    var t = e[jt];
    if (t) return t;
    for (var n = e.parentNode; n; ) {
      if (t = n[ta] || n[jt]) {
        if (n = t.alternate, t.child !== null || n !== null && n.child !== null)
          for (e = Um(e); e !== null; ) {
            if (n = e[jt]) return n;
            e = Um(e);
          }
        return t;
      }
      e = n, n = e.parentNode;
    }
    return null;
  }
  function la(e) {
    if (e = e[jt] || e[ta]) {
      var t = e.tag;
      if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3)
        return e;
    }
    return null;
  }
  function es(e) {
    var t = e.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
    throw Error(u(33));
  }
  function aa(e) {
    var t = e[gf];
    return t || (t = e[gf] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() }), t;
  }
  function vt(e) {
    e[Pa] = !0;
  }
  var yf = /* @__PURE__ */ new Set(), vf = {};
  function zl(e, t) {
    sa(e, t), sa(e + "Capture", t);
  }
  function sa(e, t) {
    for (vf[e] = t, e = 0; e < t.length; e++)
      yf.add(t[e]);
  }
  var bg = RegExp(
    "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
  ), xf = {}, _f = {};
  function wg(e) {
    return bt.call(_f, e) ? !0 : bt.call(xf, e) ? !1 : bg.test(e) ? _f[e] = !0 : (xf[e] = !0, !1);
  }
  function hi(e, t, n) {
    if (wg(t))
      if (n === null) e.removeAttribute(t);
      else {
        switch (typeof n) {
          case "undefined":
          case "function":
          case "symbol":
            e.removeAttribute(t);
            return;
          case "boolean":
            var l = t.toLowerCase().slice(0, 5);
            if (l !== "data-" && l !== "aria-") {
              e.removeAttribute(t);
              return;
            }
        }
        e.setAttribute(t, "" + n);
      }
  }
  function mi(e, t, n) {
    if (n === null) e.removeAttribute(t);
    else {
      switch (typeof n) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          e.removeAttribute(t);
          return;
      }
      e.setAttribute(t, "" + n);
    }
  }
  function kn(e, t, n, l) {
    if (l === null) e.removeAttribute(n);
    else {
      switch (typeof l) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          e.removeAttribute(n);
          return;
      }
      e.setAttributeNS(t, n, "" + l);
    }
  }
  function sn(e) {
    switch (typeof e) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return e;
      case "object":
        return e;
      default:
        return "";
    }
  }
  function bf(e) {
    var t = e.type;
    return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
  }
  function Sg(e, t, n) {
    var l = Object.getOwnPropertyDescriptor(
      e.constructor.prototype,
      t
    );
    if (!e.hasOwnProperty(t) && typeof l < "u" && typeof l.get == "function" && typeof l.set == "function") {
      var i = l.get, c = l.set;
      return Object.defineProperty(e, t, {
        configurable: !0,
        get: function() {
          return i.call(this);
        },
        set: function(h) {
          n = "" + h, c.call(this, h);
        }
      }), Object.defineProperty(e, t, {
        enumerable: l.enumerable
      }), {
        getValue: function() {
          return n;
        },
        setValue: function(h) {
          n = "" + h;
        },
        stopTracking: function() {
          e._valueTracker = null, delete e[t];
        }
      };
    }
  }
  function oc(e) {
    if (!e._valueTracker) {
      var t = bf(e) ? "checked" : "value";
      e._valueTracker = Sg(
        e,
        t,
        "" + e[t]
      );
    }
  }
  function wf(e) {
    if (!e) return !1;
    var t = e._valueTracker;
    if (!t) return !0;
    var n = t.getValue(), l = "";
    return e && (l = bf(e) ? e.checked ? "true" : "false" : e.value), e = l, e !== n ? (t.setValue(e), !0) : !1;
  }
  function pi(e) {
    if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
    try {
      return e.activeElement || e.body;
    } catch {
      return e.body;
    }
  }
  var jg = /[\n"\\]/g;
  function rn(e) {
    return e.replace(
      jg,
      function(t) {
        return "\\" + t.charCodeAt(0).toString(16) + " ";
      }
    );
  }
  function fc(e, t, n, l, i, c, h, v) {
    e.name = "", h != null && typeof h != "function" && typeof h != "symbol" && typeof h != "boolean" ? e.type = h : e.removeAttribute("type"), t != null ? h === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + sn(t)) : e.value !== "" + sn(t) && (e.value = "" + sn(t)) : h !== "submit" && h !== "reset" || e.removeAttribute("value"), t != null ? dc(e, h, sn(t)) : n != null ? dc(e, h, sn(n)) : l != null && e.removeAttribute("value"), i == null && c != null && (e.defaultChecked = !!c), i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"), v != null && typeof v != "function" && typeof v != "symbol" && typeof v != "boolean" ? e.name = "" + sn(v) : e.removeAttribute("name");
  }
  function Sf(e, t, n, l, i, c, h, v) {
    if (c != null && typeof c != "function" && typeof c != "symbol" && typeof c != "boolean" && (e.type = c), t != null || n != null) {
      if (!(c !== "submit" && c !== "reset" || t != null)) {
        oc(e);
        return;
      }
      n = n != null ? "" + sn(n) : "", t = t != null ? "" + sn(t) : n, v || t === e.value || (e.value = t), e.defaultValue = t;
    }
    l = l ?? i, l = typeof l != "function" && typeof l != "symbol" && !!l, e.checked = v ? e.checked : !!l, e.defaultChecked = !!l, h != null && typeof h != "function" && typeof h != "symbol" && typeof h != "boolean" && (e.name = h), oc(e);
  }
  function dc(e, t, n) {
    t === "number" && pi(e.ownerDocument) === e || e.defaultValue === "" + n || (e.defaultValue = "" + n);
  }
  function ia(e, t, n, l) {
    if (e = e.options, t) {
      t = {};
      for (var i = 0; i < n.length; i++)
        t["$" + n[i]] = !0;
      for (n = 0; n < e.length; n++)
        i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && l && (e[n].defaultSelected = !0);
    } else {
      for (n = "" + sn(n), t = null, i = 0; i < e.length; i++) {
        if (e[i].value === n) {
          e[i].selected = !0, l && (e[i].defaultSelected = !0);
          return;
        }
        t !== null || e[i].disabled || (t = e[i]);
      }
      t !== null && (t.selected = !0);
    }
  }
  function jf(e, t, n) {
    if (t != null && (t = "" + sn(t), t !== e.value && (e.value = t), n == null)) {
      e.defaultValue !== t && (e.defaultValue = t);
      return;
    }
    e.defaultValue = n != null ? "" + sn(n) : "";
  }
  function Nf(e, t, n, l) {
    if (t == null) {
      if (l != null) {
        if (n != null) throw Error(u(92));
        if (Ne(l)) {
          if (1 < l.length) throw Error(u(93));
          l = l[0];
        }
        n = l;
      }
      n == null && (n = ""), t = n;
    }
    n = sn(t), e.defaultValue = n, l = e.textContent, l === n && l !== "" && l !== null && (e.value = l), oc(e);
  }
  function ra(e, t) {
    if (t) {
      var n = e.firstChild;
      if (n && n === e.lastChild && n.nodeType === 3) {
        n.nodeValue = t;
        return;
      }
    }
    e.textContent = t;
  }
  var Ng = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " "
    )
  );
  function Mf(e, t, n) {
    var l = t.indexOf("--") === 0;
    n == null || typeof n == "boolean" || n === "" ? l ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : l ? e.setProperty(t, n) : typeof n != "number" || n === 0 || Ng.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
  }
  function Tf(e, t, n) {
    if (t != null && typeof t != "object")
      throw Error(u(62));
    if (e = e.style, n != null) {
      for (var l in n)
        !n.hasOwnProperty(l) || t != null && t.hasOwnProperty(l) || (l.indexOf("--") === 0 ? e.setProperty(l, "") : l === "float" ? e.cssFloat = "" : e[l] = "");
      for (var i in t)
        l = t[i], t.hasOwnProperty(i) && n[i] !== l && Mf(e, i, l);
    } else
      for (var c in t)
        t.hasOwnProperty(c) && Mf(e, c, t[c]);
  }
  function hc(e) {
    if (e.indexOf("-") === -1) return !1;
    switch (e) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var Mg = /* @__PURE__ */ new Map([
    ["acceptCharset", "accept-charset"],
    ["htmlFor", "for"],
    ["httpEquiv", "http-equiv"],
    ["crossOrigin", "crossorigin"],
    ["accentHeight", "accent-height"],
    ["alignmentBaseline", "alignment-baseline"],
    ["arabicForm", "arabic-form"],
    ["baselineShift", "baseline-shift"],
    ["capHeight", "cap-height"],
    ["clipPath", "clip-path"],
    ["clipRule", "clip-rule"],
    ["colorInterpolation", "color-interpolation"],
    ["colorInterpolationFilters", "color-interpolation-filters"],
    ["colorProfile", "color-profile"],
    ["colorRendering", "color-rendering"],
    ["dominantBaseline", "dominant-baseline"],
    ["enableBackground", "enable-background"],
    ["fillOpacity", "fill-opacity"],
    ["fillRule", "fill-rule"],
    ["floodColor", "flood-color"],
    ["floodOpacity", "flood-opacity"],
    ["fontFamily", "font-family"],
    ["fontSize", "font-size"],
    ["fontSizeAdjust", "font-size-adjust"],
    ["fontStretch", "font-stretch"],
    ["fontStyle", "font-style"],
    ["fontVariant", "font-variant"],
    ["fontWeight", "font-weight"],
    ["glyphName", "glyph-name"],
    ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
    ["glyphOrientationVertical", "glyph-orientation-vertical"],
    ["horizAdvX", "horiz-adv-x"],
    ["horizOriginX", "horiz-origin-x"],
    ["imageRendering", "image-rendering"],
    ["letterSpacing", "letter-spacing"],
    ["lightingColor", "lighting-color"],
    ["markerEnd", "marker-end"],
    ["markerMid", "marker-mid"],
    ["markerStart", "marker-start"],
    ["overlinePosition", "overline-position"],
    ["overlineThickness", "overline-thickness"],
    ["paintOrder", "paint-order"],
    ["panose-1", "panose-1"],
    ["pointerEvents", "pointer-events"],
    ["renderingIntent", "rendering-intent"],
    ["shapeRendering", "shape-rendering"],
    ["stopColor", "stop-color"],
    ["stopOpacity", "stop-opacity"],
    ["strikethroughPosition", "strikethrough-position"],
    ["strikethroughThickness", "strikethrough-thickness"],
    ["strokeDasharray", "stroke-dasharray"],
    ["strokeDashoffset", "stroke-dashoffset"],
    ["strokeLinecap", "stroke-linecap"],
    ["strokeLinejoin", "stroke-linejoin"],
    ["strokeMiterlimit", "stroke-miterlimit"],
    ["strokeOpacity", "stroke-opacity"],
    ["strokeWidth", "stroke-width"],
    ["textAnchor", "text-anchor"],
    ["textDecoration", "text-decoration"],
    ["textRendering", "text-rendering"],
    ["transformOrigin", "transform-origin"],
    ["underlinePosition", "underline-position"],
    ["underlineThickness", "underline-thickness"],
    ["unicodeBidi", "unicode-bidi"],
    ["unicodeRange", "unicode-range"],
    ["unitsPerEm", "units-per-em"],
    ["vAlphabetic", "v-alphabetic"],
    ["vHanging", "v-hanging"],
    ["vIdeographic", "v-ideographic"],
    ["vMathematical", "v-mathematical"],
    ["vectorEffect", "vector-effect"],
    ["vertAdvY", "vert-adv-y"],
    ["vertOriginX", "vert-origin-x"],
    ["vertOriginY", "vert-origin-y"],
    ["wordSpacing", "word-spacing"],
    ["writingMode", "writing-mode"],
    ["xmlnsXlink", "xmlns:xlink"],
    ["xHeight", "x-height"]
  ]), Tg = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function gi(e) {
    return Tg.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
  }
  function Dn() {
  }
  var mc = null;
  function pc(e) {
    return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
  }
  var ca = null, ua = null;
  function Ef(e) {
    var t = la(e);
    if (t && (e = t.stateNode)) {
      var n = e[Dt] || null;
      e: switch (e = t.stateNode, t.type) {
        case "input":
          if (fc(
            e,
            n.value,
            n.defaultValue,
            n.defaultValue,
            n.checked,
            n.defaultChecked,
            n.type,
            n.name
          ), t = n.name, n.type === "radio" && t != null) {
            for (n = e; n.parentNode; ) n = n.parentNode;
            for (n = n.querySelectorAll(
              'input[name="' + rn(
                "" + t
              ) + '"][type="radio"]'
            ), t = 0; t < n.length; t++) {
              var l = n[t];
              if (l !== e && l.form === e.form) {
                var i = l[Dt] || null;
                if (!i) throw Error(u(90));
                fc(
                  l,
                  i.value,
                  i.defaultValue,
                  i.defaultValue,
                  i.checked,
                  i.defaultChecked,
                  i.type,
                  i.name
                );
              }
            }
            for (t = 0; t < n.length; t++)
              l = n[t], l.form === e.form && wf(l);
          }
          break e;
        case "textarea":
          jf(e, n.value, n.defaultValue);
          break e;
        case "select":
          t = n.value, t != null && ia(e, !!n.multiple, t, !1);
      }
    }
  }
  var gc = !1;
  function Cf(e, t, n) {
    if (gc) return e(t, n);
    gc = !0;
    try {
      var l = e(t);
      return l;
    } finally {
      if (gc = !1, (ca !== null || ua !== null) && (lr(), ca && (t = ca, e = ua, ua = ca = null, Ef(t), e)))
        for (t = 0; t < e.length; t++) Ef(e[t]);
    }
  }
  function ts(e, t) {
    var n = e.stateNode;
    if (n === null) return null;
    var l = n[Dt] || null;
    if (l === null) return null;
    n = l[t];
    e: switch (t) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (l = !l.disabled) || (e = e.type, l = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !l;
        break e;
      default:
        e = !1;
    }
    if (e) return null;
    if (n && typeof n != "function")
      throw Error(
        u(231, t, typeof n)
      );
    return n;
  }
  var Hn = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), yc = !1;
  if (Hn)
    try {
      var ns = {};
      Object.defineProperty(ns, "passive", {
        get: function() {
          yc = !0;
        }
      }), window.addEventListener("test", ns, ns), window.removeEventListener("test", ns, ns);
    } catch {
      yc = !1;
    }
  var nl = null, vc = null, yi = null;
  function Af() {
    if (yi) return yi;
    var e, t = vc, n = t.length, l, i = "value" in nl ? nl.value : nl.textContent, c = i.length;
    for (e = 0; e < n && t[e] === i[e]; e++) ;
    var h = n - e;
    for (l = 1; l <= h && t[n - l] === i[c - l]; l++) ;
    return yi = i.slice(e, 1 < l ? 1 - l : void 0);
  }
  function vi(e) {
    var t = e.keyCode;
    return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
  }
  function xi() {
    return !0;
  }
  function zf() {
    return !1;
  }
  function Ht(e) {
    function t(n, l, i, c, h) {
      this._reactName = n, this._targetInst = i, this.type = l, this.nativeEvent = c, this.target = h, this.currentTarget = null;
      for (var v in e)
        e.hasOwnProperty(v) && (n = e[v], this[v] = n ? n(c) : c[v]);
      return this.isDefaultPrevented = (c.defaultPrevented != null ? c.defaultPrevented : c.returnValue === !1) ? xi : zf, this.isPropagationStopped = zf, this;
    }
    return _(t.prototype, {
      preventDefault: function() {
        this.defaultPrevented = !0;
        var n = this.nativeEvent;
        n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = xi);
      },
      stopPropagation: function() {
        var n = this.nativeEvent;
        n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = xi);
      },
      persist: function() {
      },
      isPersistent: xi
    }), t;
  }
  var Ol = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function(e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  }, _i = Ht(Ol), ls = _({}, Ol, { view: 0, detail: 0 }), Eg = Ht(ls), xc, _c, as, bi = _({}, ls, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: wc,
    button: 0,
    buttons: 0,
    relatedTarget: function(e) {
      return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
    },
    movementX: function(e) {
      return "movementX" in e ? e.movementX : (e !== as && (as && e.type === "mousemove" ? (xc = e.screenX - as.screenX, _c = e.screenY - as.screenY) : _c = xc = 0, as = e), xc);
    },
    movementY: function(e) {
      return "movementY" in e ? e.movementY : _c;
    }
  }), Of = Ht(bi), Cg = _({}, bi, { dataTransfer: 0 }), Ag = Ht(Cg), zg = _({}, ls, { relatedTarget: 0 }), bc = Ht(zg), Og = _({}, Ol, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), Rg = Ht(Og), kg = _({}, Ol, {
    clipboardData: function(e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    }
  }), Dg = Ht(kg), Hg = _({}, Ol, { data: 0 }), Rf = Ht(Hg), Ug = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  }, Lg = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  }, Bg = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
  };
  function qg(e) {
    var t = this.nativeEvent;
    return t.getModifierState ? t.getModifierState(e) : (e = Bg[e]) ? !!t[e] : !1;
  }
  function wc() {
    return qg;
  }
  var Yg = _({}, ls, {
    key: function(e) {
      if (e.key) {
        var t = Ug[e.key] || e.key;
        if (t !== "Unidentified") return t;
      }
      return e.type === "keypress" ? (e = vi(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Lg[e.keyCode] || "Unidentified" : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: wc,
    charCode: function(e) {
      return e.type === "keypress" ? vi(e) : 0;
    },
    keyCode: function(e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    },
    which: function(e) {
      return e.type === "keypress" ? vi(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    }
  }), Gg = Ht(Yg), Xg = _({}, bi, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0
  }), kf = Ht(Xg), Vg = _({}, ls, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: wc
  }), Qg = Ht(Vg), Zg = _({}, Ol, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), Kg = Ht(Zg), Jg = _({}, bi, {
    deltaX: function(e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function(e) {
      return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), $g = Ht(Jg), Wg = _({}, Ol, {
    newState: 0,
    oldState: 0
  }), Fg = Ht(Wg), Ig = [9, 13, 27, 32], Sc = Hn && "CompositionEvent" in window, ss = null;
  Hn && "documentMode" in document && (ss = document.documentMode);
  var Pg = Hn && "TextEvent" in window && !ss, Df = Hn && (!Sc || ss && 8 < ss && 11 >= ss), Hf = " ", Uf = !1;
  function Lf(e, t) {
    switch (e) {
      case "keyup":
        return Ig.indexOf(t.keyCode) !== -1;
      case "keydown":
        return t.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function Bf(e) {
    return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
  }
  var oa = !1;
  function e1(e, t) {
    switch (e) {
      case "compositionend":
        return Bf(t);
      case "keypress":
        return t.which !== 32 ? null : (Uf = !0, Hf);
      case "textInput":
        return e = t.data, e === Hf && Uf ? null : e;
      default:
        return null;
    }
  }
  function t1(e, t) {
    if (oa)
      return e === "compositionend" || !Sc && Lf(e, t) ? (e = Af(), yi = vc = nl = null, oa = !1, e) : null;
    switch (e) {
      case "paste":
        return null;
      case "keypress":
        if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
          if (t.char && 1 < t.char.length)
            return t.char;
          if (t.which) return String.fromCharCode(t.which);
        }
        return null;
      case "compositionend":
        return Df && t.locale !== "ko" ? null : t.data;
      default:
        return null;
    }
  }
  var n1 = {
    color: !0,
    date: !0,
    datetime: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0
  };
  function qf(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t === "input" ? !!n1[e.type] : t === "textarea";
  }
  function Yf(e, t, n, l) {
    ca ? ua ? ua.push(l) : ua = [l] : ca = l, t = or(t, "onChange"), 0 < t.length && (n = new _i(
      "onChange",
      "change",
      null,
      n,
      l
    ), e.push({ event: n, listeners: t }));
  }
  var is = null, rs = null;
  function l1(e) {
    Sm(e, 0);
  }
  function wi(e) {
    var t = es(e);
    if (wf(t)) return e;
  }
  function Gf(e, t) {
    if (e === "change") return t;
  }
  var Xf = !1;
  if (Hn) {
    var jc;
    if (Hn) {
      var Nc = "oninput" in document;
      if (!Nc) {
        var Vf = document.createElement("div");
        Vf.setAttribute("oninput", "return;"), Nc = typeof Vf.oninput == "function";
      }
      jc = Nc;
    } else jc = !1;
    Xf = jc && (!document.documentMode || 9 < document.documentMode);
  }
  function Qf() {
    is && (is.detachEvent("onpropertychange", Zf), rs = is = null);
  }
  function Zf(e) {
    if (e.propertyName === "value" && wi(rs)) {
      var t = [];
      Yf(
        t,
        rs,
        e,
        pc(e)
      ), Cf(l1, t);
    }
  }
  function a1(e, t, n) {
    e === "focusin" ? (Qf(), is = t, rs = n, is.attachEvent("onpropertychange", Zf)) : e === "focusout" && Qf();
  }
  function s1(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown")
      return wi(rs);
  }
  function i1(e, t) {
    if (e === "click") return wi(t);
  }
  function r1(e, t) {
    if (e === "input" || e === "change")
      return wi(t);
  }
  function c1(e, t) {
    return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
  }
  var Kt = typeof Object.is == "function" ? Object.is : c1;
  function cs(e, t) {
    if (Kt(e, t)) return !0;
    if (typeof e != "object" || e === null || typeof t != "object" || t === null)
      return !1;
    var n = Object.keys(e), l = Object.keys(t);
    if (n.length !== l.length) return !1;
    for (l = 0; l < n.length; l++) {
      var i = n[l];
      if (!bt.call(t, i) || !Kt(e[i], t[i]))
        return !1;
    }
    return !0;
  }
  function Kf(e) {
    for (; e && e.firstChild; ) e = e.firstChild;
    return e;
  }
  function Jf(e, t) {
    var n = Kf(e);
    e = 0;
    for (var l; n; ) {
      if (n.nodeType === 3) {
        if (l = e + n.textContent.length, e <= t && l >= t)
          return { node: n, offset: t - e };
        e = l;
      }
      e: {
        for (; n; ) {
          if (n.nextSibling) {
            n = n.nextSibling;
            break e;
          }
          n = n.parentNode;
        }
        n = void 0;
      }
      n = Kf(n);
    }
  }
  function $f(e, t) {
    return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? $f(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
  }
  function Wf(e) {
    e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
    for (var t = pi(e.document); t instanceof e.HTMLIFrameElement; ) {
      try {
        var n = typeof t.contentWindow.location.href == "string";
      } catch {
        n = !1;
      }
      if (n) e = t.contentWindow;
      else break;
      t = pi(e.document);
    }
    return t;
  }
  function Mc(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
  }
  var u1 = Hn && "documentMode" in document && 11 >= document.documentMode, fa = null, Tc = null, us = null, Ec = !1;
  function Ff(e, t, n) {
    var l = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
    Ec || fa == null || fa !== pi(l) || (l = fa, "selectionStart" in l && Mc(l) ? l = { start: l.selectionStart, end: l.selectionEnd } : (l = (l.ownerDocument && l.ownerDocument.defaultView || window).getSelection(), l = {
      anchorNode: l.anchorNode,
      anchorOffset: l.anchorOffset,
      focusNode: l.focusNode,
      focusOffset: l.focusOffset
    }), us && cs(us, l) || (us = l, l = or(Tc, "onSelect"), 0 < l.length && (t = new _i(
      "onSelect",
      "select",
      null,
      t,
      n
    ), e.push({ event: t, listeners: l }), t.target = fa)));
  }
  function Rl(e, t) {
    var n = {};
    return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
  }
  var da = {
    animationend: Rl("Animation", "AnimationEnd"),
    animationiteration: Rl("Animation", "AnimationIteration"),
    animationstart: Rl("Animation", "AnimationStart"),
    transitionrun: Rl("Transition", "TransitionRun"),
    transitionstart: Rl("Transition", "TransitionStart"),
    transitioncancel: Rl("Transition", "TransitionCancel"),
    transitionend: Rl("Transition", "TransitionEnd")
  }, Cc = {}, If = {};
  Hn && (If = document.createElement("div").style, "AnimationEvent" in window || (delete da.animationend.animation, delete da.animationiteration.animation, delete da.animationstart.animation), "TransitionEvent" in window || delete da.transitionend.transition);
  function kl(e) {
    if (Cc[e]) return Cc[e];
    if (!da[e]) return e;
    var t = da[e], n;
    for (n in t)
      if (t.hasOwnProperty(n) && n in If)
        return Cc[e] = t[n];
    return e;
  }
  var Pf = kl("animationend"), ed = kl("animationiteration"), td = kl("animationstart"), o1 = kl("transitionrun"), f1 = kl("transitionstart"), d1 = kl("transitioncancel"), nd = kl("transitionend"), ld = /* @__PURE__ */ new Map(), Ac = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
    " "
  );
  Ac.push("scrollEnd");
  function yn(e, t) {
    ld.set(e, t), zl(t, [e]);
  }
  var Si = typeof reportError == "function" ? reportError : function(e) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var t = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof e == "object" && e !== null && typeof e.message == "string" ? String(e.message) : String(e),
        error: e
      });
      if (!window.dispatchEvent(t)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", e);
      return;
    }
    console.error(e);
  }, cn = [], ha = 0, zc = 0;
  function ji() {
    for (var e = ha, t = zc = ha = 0; t < e; ) {
      var n = cn[t];
      cn[t++] = null;
      var l = cn[t];
      cn[t++] = null;
      var i = cn[t];
      cn[t++] = null;
      var c = cn[t];
      if (cn[t++] = null, l !== null && i !== null) {
        var h = l.pending;
        h === null ? i.next = i : (i.next = h.next, h.next = i), l.pending = i;
      }
      c !== 0 && ad(n, i, c);
    }
  }
  function Ni(e, t, n, l) {
    cn[ha++] = e, cn[ha++] = t, cn[ha++] = n, cn[ha++] = l, zc |= l, e.lanes |= l, e = e.alternate, e !== null && (e.lanes |= l);
  }
  function Oc(e, t, n, l) {
    return Ni(e, t, n, l), Mi(e);
  }
  function Dl(e, t) {
    return Ni(e, null, null, t), Mi(e);
  }
  function ad(e, t, n) {
    e.lanes |= n;
    var l = e.alternate;
    l !== null && (l.lanes |= n);
    for (var i = !1, c = e.return; c !== null; )
      c.childLanes |= n, l = c.alternate, l !== null && (l.childLanes |= n), c.tag === 22 && (e = c.stateNode, e === null || e._visibility & 1 || (i = !0)), e = c, c = c.return;
    return e.tag === 3 ? (c = e.stateNode, i && t !== null && (i = 31 - zt(n), e = c.hiddenUpdates, l = e[i], l === null ? e[i] = [t] : l.push(t), t.lane = n | 536870912), c) : null;
  }
  function Mi(e) {
    if (50 < zs)
      throw zs = 0, Yu = null, Error(u(185));
    for (var t = e.return; t !== null; )
      e = t, t = e.return;
    return e.tag === 3 ? e.stateNode : null;
  }
  var ma = {};
  function h1(e, t, n, l) {
    this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = l, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Jt(e, t, n, l) {
    return new h1(e, t, n, l);
  }
  function Rc(e) {
    return e = e.prototype, !(!e || !e.isReactComponent);
  }
  function Un(e, t) {
    var n = e.alternate;
    return n === null ? (n = Jt(
      e.tag,
      t,
      e.key,
      e.mode
    ), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 65011712, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
  }
  function sd(e, t) {
    e.flags &= 65011714;
    var n = e.alternate;
    return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
      lanes: t.lanes,
      firstContext: t.firstContext
    }), e;
  }
  function Ti(e, t, n, l, i, c) {
    var h = 0;
    if (l = e, typeof e == "function") Rc(e) && (h = 1);
    else if (typeof e == "string")
      h = vy(
        e,
        n,
        W.current
      ) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
    else
      e: switch (e) {
        case fe:
          return e = Jt(31, n, t, i), e.elementType = fe, e.lanes = c, e;
        case D:
          return Hl(n.children, i, c, t);
        case U:
          h = 8, i |= 24;
          break;
        case V:
          return e = Jt(12, n, t, i | 2), e.elementType = V, e.lanes = c, e;
        case se:
          return e = Jt(13, n, t, i), e.elementType = se, e.lanes = c, e;
        case Z:
          return e = Jt(19, n, t, i), e.elementType = Z, e.lanes = c, e;
        default:
          if (typeof e == "object" && e !== null)
            switch (e.$$typeof) {
              case L:
                h = 10;
                break e;
              case J:
                h = 9;
                break e;
              case I:
                h = 11;
                break e;
              case F:
                h = 14;
                break e;
              case $:
                h = 16, l = null;
                break e;
            }
          h = 29, n = Error(
            u(130, e === null ? "null" : typeof e, "")
          ), l = null;
      }
    return t = Jt(h, n, t, i), t.elementType = e, t.type = l, t.lanes = c, t;
  }
  function Hl(e, t, n, l) {
    return e = Jt(7, e, l, t), e.lanes = n, e;
  }
  function kc(e, t, n) {
    return e = Jt(6, e, null, t), e.lanes = n, e;
  }
  function id(e) {
    var t = Jt(18, null, null, 0);
    return t.stateNode = e, t;
  }
  function Dc(e, t, n) {
    return t = Jt(
      4,
      e.children !== null ? e.children : [],
      e.key,
      t
    ), t.lanes = n, t.stateNode = {
      containerInfo: e.containerInfo,
      pendingChildren: null,
      implementation: e.implementation
    }, t;
  }
  var rd = /* @__PURE__ */ new WeakMap();
  function un(e, t) {
    if (typeof e == "object" && e !== null) {
      var n = rd.get(e);
      return n !== void 0 ? n : (t = {
        value: e,
        source: t,
        stack: nn(t)
      }, rd.set(e, t), t);
    }
    return {
      value: e,
      source: t,
      stack: nn(t)
    };
  }
  var pa = [], ga = 0, Ei = null, os = 0, on = [], fn = 0, ll = null, jn = 1, Nn = "";
  function Ln(e, t) {
    pa[ga++] = os, pa[ga++] = Ei, Ei = e, os = t;
  }
  function cd(e, t, n) {
    on[fn++] = jn, on[fn++] = Nn, on[fn++] = ll, ll = e;
    var l = jn;
    e = Nn;
    var i = 32 - zt(l) - 1;
    l &= ~(1 << i), n += 1;
    var c = 32 - zt(t) + i;
    if (30 < c) {
      var h = i - i % 5;
      c = (l & (1 << h) - 1).toString(32), l >>= h, i -= h, jn = 1 << 32 - zt(t) + i | n << i | l, Nn = c + e;
    } else
      jn = 1 << c | n << i | l, Nn = e;
  }
  function Hc(e) {
    e.return !== null && (Ln(e, 1), cd(e, 1, 0));
  }
  function Uc(e) {
    for (; e === Ei; )
      Ei = pa[--ga], pa[ga] = null, os = pa[--ga], pa[ga] = null;
    for (; e === ll; )
      ll = on[--fn], on[fn] = null, Nn = on[--fn], on[fn] = null, jn = on[--fn], on[fn] = null;
  }
  function ud(e, t) {
    on[fn++] = jn, on[fn++] = Nn, on[fn++] = ll, jn = t.id, Nn = t.overflow, ll = e;
  }
  var Nt = null, Pe = null, Ae = !1, al = null, dn = !1, Lc = Error(u(519));
  function sl(e) {
    var t = Error(
      u(
        418,
        1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML",
        ""
      )
    );
    throw fs(un(t, e)), Lc;
  }
  function od(e) {
    var t = e.stateNode, n = e.type, l = e.memoizedProps;
    switch (t[jt] = e, t[Dt] = l, n) {
      case "dialog":
        Te("cancel", t), Te("close", t);
        break;
      case "iframe":
      case "object":
      case "embed":
        Te("load", t);
        break;
      case "video":
      case "audio":
        for (n = 0; n < Rs.length; n++)
          Te(Rs[n], t);
        break;
      case "source":
        Te("error", t);
        break;
      case "img":
      case "image":
      case "link":
        Te("error", t), Te("load", t);
        break;
      case "details":
        Te("toggle", t);
        break;
      case "input":
        Te("invalid", t), Sf(
          t,
          l.value,
          l.defaultValue,
          l.checked,
          l.defaultChecked,
          l.type,
          l.name,
          !0
        );
        break;
      case "select":
        Te("invalid", t);
        break;
      case "textarea":
        Te("invalid", t), Nf(t, l.value, l.defaultValue, l.children);
    }
    n = l.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || l.suppressHydrationWarning === !0 || Tm(t.textContent, n) ? (l.popover != null && (Te("beforetoggle", t), Te("toggle", t)), l.onScroll != null && Te("scroll", t), l.onScrollEnd != null && Te("scrollend", t), l.onClick != null && (t.onclick = Dn), t = !0) : t = !1, t || sl(e, !0);
  }
  function fd(e) {
    for (Nt = e.return; Nt; )
      switch (Nt.tag) {
        case 5:
        case 31:
        case 13:
          dn = !1;
          return;
        case 27:
        case 3:
          dn = !0;
          return;
        default:
          Nt = Nt.return;
      }
  }
  function ya(e) {
    if (e !== Nt) return !1;
    if (!Ae) return fd(e), Ae = !0, !1;
    var t = e.tag, n;
    if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = !(n !== "form" && n !== "button") || no(e.type, e.memoizedProps)), n = !n), n && Pe && sl(e), fd(e), t === 13) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(u(317));
      Pe = Hm(e);
    } else if (t === 31) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(u(317));
      Pe = Hm(e);
    } else
      t === 27 ? (t = Pe, xl(e.type) ? (e = ro, ro = null, Pe = e) : Pe = t) : Pe = Nt ? mn(e.stateNode.nextSibling) : null;
    return !0;
  }
  function Ul() {
    Pe = Nt = null, Ae = !1;
  }
  function Bc() {
    var e = al;
    return e !== null && (qt === null ? qt = e : qt.push.apply(
      qt,
      e
    ), al = null), e;
  }
  function fs(e) {
    al === null ? al = [e] : al.push(e);
  }
  var qc = b(null), Ll = null, Bn = null;
  function il(e, t, n) {
    Y(qc, t._currentValue), t._currentValue = n;
  }
  function qn(e) {
    e._currentValue = qc.current, k(qc);
  }
  function Yc(e, t, n) {
    for (; e !== null; ) {
      var l = e.alternate;
      if ((e.childLanes & t) !== t ? (e.childLanes |= t, l !== null && (l.childLanes |= t)) : l !== null && (l.childLanes & t) !== t && (l.childLanes |= t), e === n) break;
      e = e.return;
    }
  }
  function Gc(e, t, n, l) {
    var i = e.child;
    for (i !== null && (i.return = e); i !== null; ) {
      var c = i.dependencies;
      if (c !== null) {
        var h = i.child;
        c = c.firstContext;
        e: for (; c !== null; ) {
          var v = c;
          c = i;
          for (var w = 0; w < t.length; w++)
            if (v.context === t[w]) {
              c.lanes |= n, v = c.alternate, v !== null && (v.lanes |= n), Yc(
                c.return,
                n,
                e
              ), l || (h = null);
              break e;
            }
          c = v.next;
        }
      } else if (i.tag === 18) {
        if (h = i.return, h === null) throw Error(u(341));
        h.lanes |= n, c = h.alternate, c !== null && (c.lanes |= n), Yc(h, n, e), h = null;
      } else h = i.child;
      if (h !== null) h.return = i;
      else
        for (h = i; h !== null; ) {
          if (h === e) {
            h = null;
            break;
          }
          if (i = h.sibling, i !== null) {
            i.return = h.return, h = i;
            break;
          }
          h = h.return;
        }
      i = h;
    }
  }
  function va(e, t, n, l) {
    e = null;
    for (var i = t, c = !1; i !== null; ) {
      if (!c) {
        if ((i.flags & 524288) !== 0) c = !0;
        else if ((i.flags & 262144) !== 0) break;
      }
      if (i.tag === 10) {
        var h = i.alternate;
        if (h === null) throw Error(u(387));
        if (h = h.memoizedProps, h !== null) {
          var v = i.type;
          Kt(i.pendingProps.value, h.value) || (e !== null ? e.push(v) : e = [v]);
        }
      } else if (i === ce.current) {
        if (h = i.alternate, h === null) throw Error(u(387));
        h.memoizedState.memoizedState !== i.memoizedState.memoizedState && (e !== null ? e.push(Ls) : e = [Ls]);
      }
      i = i.return;
    }
    e !== null && Gc(
      t,
      e,
      n,
      l
    ), t.flags |= 262144;
  }
  function Ci(e) {
    for (e = e.firstContext; e !== null; ) {
      if (!Kt(
        e.context._currentValue,
        e.memoizedValue
      ))
        return !0;
      e = e.next;
    }
    return !1;
  }
  function Bl(e) {
    Ll = e, Bn = null, e = e.dependencies, e !== null && (e.firstContext = null);
  }
  function Mt(e) {
    return dd(Ll, e);
  }
  function Ai(e, t) {
    return Ll === null && Bl(e), dd(e, t);
  }
  function dd(e, t) {
    var n = t._currentValue;
    if (t = { context: t, memoizedValue: n, next: null }, Bn === null) {
      if (e === null) throw Error(u(308));
      Bn = t, e.dependencies = { lanes: 0, firstContext: t }, e.flags |= 524288;
    } else Bn = Bn.next = t;
    return n;
  }
  var m1 = typeof AbortController < "u" ? AbortController : function() {
    var e = [], t = this.signal = {
      aborted: !1,
      addEventListener: function(n, l) {
        e.push(l);
      }
    };
    this.abort = function() {
      t.aborted = !0, e.forEach(function(n) {
        return n();
      });
    };
  }, p1 = a.unstable_scheduleCallback, g1 = a.unstable_NormalPriority, dt = {
    $$typeof: L,
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0
  };
  function Xc() {
    return {
      controller: new m1(),
      data: /* @__PURE__ */ new Map(),
      refCount: 0
    };
  }
  function ds(e) {
    e.refCount--, e.refCount === 0 && p1(g1, function() {
      e.controller.abort();
    });
  }
  var hs = null, Vc = 0, xa = 0, _a = null;
  function y1(e, t) {
    if (hs === null) {
      var n = hs = [];
      Vc = 0, xa = Ku(), _a = {
        status: "pending",
        value: void 0,
        then: function(l) {
          n.push(l);
        }
      };
    }
    return Vc++, t.then(hd, hd), t;
  }
  function hd() {
    if (--Vc === 0 && hs !== null) {
      _a !== null && (_a.status = "fulfilled");
      var e = hs;
      hs = null, xa = 0, _a = null;
      for (var t = 0; t < e.length; t++) (0, e[t])();
    }
  }
  function v1(e, t) {
    var n = [], l = {
      status: "pending",
      value: null,
      reason: null,
      then: function(i) {
        n.push(i);
      }
    };
    return e.then(
      function() {
        l.status = "fulfilled", l.value = t;
        for (var i = 0; i < n.length; i++) (0, n[i])(t);
      },
      function(i) {
        for (l.status = "rejected", l.reason = i, i = 0; i < n.length; i++)
          (0, n[i])(void 0);
      }
    ), l;
  }
  var md = z.S;
  z.S = function(e, t) {
    Fh = Re(), typeof t == "object" && t !== null && typeof t.then == "function" && y1(e, t), md !== null && md(e, t);
  };
  var ql = b(null);
  function Qc() {
    var e = ql.current;
    return e !== null ? e : Je.pooledCache;
  }
  function zi(e, t) {
    t === null ? Y(ql, ql.current) : Y(ql, t.pool);
  }
  function pd() {
    var e = Qc();
    return e === null ? null : { parent: dt._currentValue, pool: e };
  }
  var ba = Error(u(460)), Zc = Error(u(474)), Oi = Error(u(542)), Ri = { then: function() {
  } };
  function gd(e) {
    return e = e.status, e === "fulfilled" || e === "rejected";
  }
  function yd(e, t, n) {
    switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(Dn, Dn), t = n), t.status) {
      case "fulfilled":
        return t.value;
      case "rejected":
        throw e = t.reason, xd(e), e;
      default:
        if (typeof t.status == "string") t.then(Dn, Dn);
        else {
          if (e = Je, e !== null && 100 < e.shellSuspendCounter)
            throw Error(u(482));
          e = t, e.status = "pending", e.then(
            function(l) {
              if (t.status === "pending") {
                var i = t;
                i.status = "fulfilled", i.value = l;
              }
            },
            function(l) {
              if (t.status === "pending") {
                var i = t;
                i.status = "rejected", i.reason = l;
              }
            }
          );
        }
        switch (t.status) {
          case "fulfilled":
            return t.value;
          case "rejected":
            throw e = t.reason, xd(e), e;
        }
        throw Gl = t, ba;
    }
  }
  function Yl(e) {
    try {
      var t = e._init;
      return t(e._payload);
    } catch (n) {
      throw n !== null && typeof n == "object" && typeof n.then == "function" ? (Gl = n, ba) : n;
    }
  }
  var Gl = null;
  function vd() {
    if (Gl === null) throw Error(u(459));
    var e = Gl;
    return Gl = null, e;
  }
  function xd(e) {
    if (e === ba || e === Oi)
      throw Error(u(483));
  }
  var wa = null, ms = 0;
  function ki(e) {
    var t = ms;
    return ms += 1, wa === null && (wa = []), yd(wa, e, t);
  }
  function ps(e, t) {
    t = t.props.ref, e.ref = t !== void 0 ? t : null;
  }
  function Di(e, t) {
    throw t.$$typeof === S ? Error(u(525)) : (e = Object.prototype.toString.call(t), Error(
      u(
        31,
        e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e
      )
    ));
  }
  function _d(e) {
    function t(M, N) {
      if (e) {
        var E = M.deletions;
        E === null ? (M.deletions = [N], M.flags |= 16) : E.push(N);
      }
    }
    function n(M, N) {
      if (!e) return null;
      for (; N !== null; )
        t(M, N), N = N.sibling;
      return null;
    }
    function l(M) {
      for (var N = /* @__PURE__ */ new Map(); M !== null; )
        M.key !== null ? N.set(M.key, M) : N.set(M.index, M), M = M.sibling;
      return N;
    }
    function i(M, N) {
      return M = Un(M, N), M.index = 0, M.sibling = null, M;
    }
    function c(M, N, E) {
      return M.index = E, e ? (E = M.alternate, E !== null ? (E = E.index, E < N ? (M.flags |= 67108866, N) : E) : (M.flags |= 67108866, N)) : (M.flags |= 1048576, N);
    }
    function h(M) {
      return e && M.alternate === null && (M.flags |= 67108866), M;
    }
    function v(M, N, E, B) {
      return N === null || N.tag !== 6 ? (N = kc(E, M.mode, B), N.return = M, N) : (N = i(N, E), N.return = M, N);
    }
    function w(M, N, E, B) {
      var re = E.type;
      return re === D ? H(
        M,
        N,
        E.props.children,
        B,
        E.key
      ) : N !== null && (N.elementType === re || typeof re == "object" && re !== null && re.$$typeof === $ && Yl(re) === N.type) ? (N = i(N, E.props), ps(N, E), N.return = M, N) : (N = Ti(
        E.type,
        E.key,
        E.props,
        null,
        M.mode,
        B
      ), ps(N, E), N.return = M, N);
    }
    function C(M, N, E, B) {
      return N === null || N.tag !== 4 || N.stateNode.containerInfo !== E.containerInfo || N.stateNode.implementation !== E.implementation ? (N = Dc(E, M.mode, B), N.return = M, N) : (N = i(N, E.children || []), N.return = M, N);
    }
    function H(M, N, E, B, re) {
      return N === null || N.tag !== 7 ? (N = Hl(
        E,
        M.mode,
        B,
        re
      ), N.return = M, N) : (N = i(N, E), N.return = M, N);
    }
    function q(M, N, E) {
      if (typeof N == "string" && N !== "" || typeof N == "number" || typeof N == "bigint")
        return N = kc(
          "" + N,
          M.mode,
          E
        ), N.return = M, N;
      if (typeof N == "object" && N !== null) {
        switch (N.$$typeof) {
          case j:
            return E = Ti(
              N.type,
              N.key,
              N.props,
              null,
              M.mode,
              E
            ), ps(E, N), E.return = M, E;
          case T:
            return N = Dc(
              N,
              M.mode,
              E
            ), N.return = M, N;
          case $:
            return N = Yl(N), q(M, N, E);
        }
        if (Ne(N) || P(N))
          return N = Hl(
            N,
            M.mode,
            E,
            null
          ), N.return = M, N;
        if (typeof N.then == "function")
          return q(M, ki(N), E);
        if (N.$$typeof === L)
          return q(
            M,
            Ai(M, N),
            E
          );
        Di(M, N);
      }
      return null;
    }
    function A(M, N, E, B) {
      var re = N !== null ? N.key : null;
      if (typeof E == "string" && E !== "" || typeof E == "number" || typeof E == "bigint")
        return re !== null ? null : v(M, N, "" + E, B);
      if (typeof E == "object" && E !== null) {
        switch (E.$$typeof) {
          case j:
            return E.key === re ? w(M, N, E, B) : null;
          case T:
            return E.key === re ? C(M, N, E, B) : null;
          case $:
            return E = Yl(E), A(M, N, E, B);
        }
        if (Ne(E) || P(E))
          return re !== null ? null : H(M, N, E, B, null);
        if (typeof E.then == "function")
          return A(
            M,
            N,
            ki(E),
            B
          );
        if (E.$$typeof === L)
          return A(
            M,
            N,
            Ai(M, E),
            B
          );
        Di(M, E);
      }
      return null;
    }
    function O(M, N, E, B, re) {
      if (typeof B == "string" && B !== "" || typeof B == "number" || typeof B == "bigint")
        return M = M.get(E) || null, v(N, M, "" + B, re);
      if (typeof B == "object" && B !== null) {
        switch (B.$$typeof) {
          case j:
            return M = M.get(
              B.key === null ? E : B.key
            ) || null, w(N, M, B, re);
          case T:
            return M = M.get(
              B.key === null ? E : B.key
            ) || null, C(N, M, B, re);
          case $:
            return B = Yl(B), O(
              M,
              N,
              E,
              B,
              re
            );
        }
        if (Ne(B) || P(B))
          return M = M.get(E) || null, H(N, M, B, re, null);
        if (typeof B.then == "function")
          return O(
            M,
            N,
            E,
            ki(B),
            re
          );
        if (B.$$typeof === L)
          return O(
            M,
            N,
            E,
            Ai(N, B),
            re
          );
        Di(N, B);
      }
      return null;
    }
    function te(M, N, E, B) {
      for (var re = null, ke = null, ne = N, xe = N = 0, Ce = null; ne !== null && xe < E.length; xe++) {
        ne.index > xe ? (Ce = ne, ne = null) : Ce = ne.sibling;
        var De = A(
          M,
          ne,
          E[xe],
          B
        );
        if (De === null) {
          ne === null && (ne = Ce);
          break;
        }
        e && ne && De.alternate === null && t(M, ne), N = c(De, N, xe), ke === null ? re = De : ke.sibling = De, ke = De, ne = Ce;
      }
      if (xe === E.length)
        return n(M, ne), Ae && Ln(M, xe), re;
      if (ne === null) {
        for (; xe < E.length; xe++)
          ne = q(M, E[xe], B), ne !== null && (N = c(
            ne,
            N,
            xe
          ), ke === null ? re = ne : ke.sibling = ne, ke = ne);
        return Ae && Ln(M, xe), re;
      }
      for (ne = l(ne); xe < E.length; xe++)
        Ce = O(
          ne,
          M,
          xe,
          E[xe],
          B
        ), Ce !== null && (e && Ce.alternate !== null && ne.delete(
          Ce.key === null ? xe : Ce.key
        ), N = c(
          Ce,
          N,
          xe
        ), ke === null ? re = Ce : ke.sibling = Ce, ke = Ce);
      return e && ne.forEach(function(jl) {
        return t(M, jl);
      }), Ae && Ln(M, xe), re;
    }
    function oe(M, N, E, B) {
      if (E == null) throw Error(u(151));
      for (var re = null, ke = null, ne = N, xe = N = 0, Ce = null, De = E.next(); ne !== null && !De.done; xe++, De = E.next()) {
        ne.index > xe ? (Ce = ne, ne = null) : Ce = ne.sibling;
        var jl = A(M, ne, De.value, B);
        if (jl === null) {
          ne === null && (ne = Ce);
          break;
        }
        e && ne && jl.alternate === null && t(M, ne), N = c(jl, N, xe), ke === null ? re = jl : ke.sibling = jl, ke = jl, ne = Ce;
      }
      if (De.done)
        return n(M, ne), Ae && Ln(M, xe), re;
      if (ne === null) {
        for (; !De.done; xe++, De = E.next())
          De = q(M, De.value, B), De !== null && (N = c(De, N, xe), ke === null ? re = De : ke.sibling = De, ke = De);
        return Ae && Ln(M, xe), re;
      }
      for (ne = l(ne); !De.done; xe++, De = E.next())
        De = O(ne, M, xe, De.value, B), De !== null && (e && De.alternate !== null && ne.delete(De.key === null ? xe : De.key), N = c(De, N, xe), ke === null ? re = De : ke.sibling = De, ke = De);
      return e && ne.forEach(function(Cy) {
        return t(M, Cy);
      }), Ae && Ln(M, xe), re;
    }
    function Qe(M, N, E, B) {
      if (typeof E == "object" && E !== null && E.type === D && E.key === null && (E = E.props.children), typeof E == "object" && E !== null) {
        switch (E.$$typeof) {
          case j:
            e: {
              for (var re = E.key; N !== null; ) {
                if (N.key === re) {
                  if (re = E.type, re === D) {
                    if (N.tag === 7) {
                      n(
                        M,
                        N.sibling
                      ), B = i(
                        N,
                        E.props.children
                      ), B.return = M, M = B;
                      break e;
                    }
                  } else if (N.elementType === re || typeof re == "object" && re !== null && re.$$typeof === $ && Yl(re) === N.type) {
                    n(
                      M,
                      N.sibling
                    ), B = i(N, E.props), ps(B, E), B.return = M, M = B;
                    break e;
                  }
                  n(M, N);
                  break;
                } else t(M, N);
                N = N.sibling;
              }
              E.type === D ? (B = Hl(
                E.props.children,
                M.mode,
                B,
                E.key
              ), B.return = M, M = B) : (B = Ti(
                E.type,
                E.key,
                E.props,
                null,
                M.mode,
                B
              ), ps(B, E), B.return = M, M = B);
            }
            return h(M);
          case T:
            e: {
              for (re = E.key; N !== null; ) {
                if (N.key === re)
                  if (N.tag === 4 && N.stateNode.containerInfo === E.containerInfo && N.stateNode.implementation === E.implementation) {
                    n(
                      M,
                      N.sibling
                    ), B = i(N, E.children || []), B.return = M, M = B;
                    break e;
                  } else {
                    n(M, N);
                    break;
                  }
                else t(M, N);
                N = N.sibling;
              }
              B = Dc(E, M.mode, B), B.return = M, M = B;
            }
            return h(M);
          case $:
            return E = Yl(E), Qe(
              M,
              N,
              E,
              B
            );
        }
        if (Ne(E))
          return te(
            M,
            N,
            E,
            B
          );
        if (P(E)) {
          if (re = P(E), typeof re != "function") throw Error(u(150));
          return E = re.call(E), oe(
            M,
            N,
            E,
            B
          );
        }
        if (typeof E.then == "function")
          return Qe(
            M,
            N,
            ki(E),
            B
          );
        if (E.$$typeof === L)
          return Qe(
            M,
            N,
            Ai(M, E),
            B
          );
        Di(M, E);
      }
      return typeof E == "string" && E !== "" || typeof E == "number" || typeof E == "bigint" ? (E = "" + E, N !== null && N.tag === 6 ? (n(M, N.sibling), B = i(N, E), B.return = M, M = B) : (n(M, N), B = kc(E, M.mode, B), B.return = M, M = B), h(M)) : n(M, N);
    }
    return function(M, N, E, B) {
      try {
        ms = 0;
        var re = Qe(
          M,
          N,
          E,
          B
        );
        return wa = null, re;
      } catch (ne) {
        if (ne === ba || ne === Oi) throw ne;
        var ke = Jt(29, ne, null, M.mode);
        return ke.lanes = B, ke.return = M, ke;
      } finally {
      }
    };
  }
  var Xl = _d(!0), bd = _d(!1), rl = !1;
  function Kc(e) {
    e.updateQueue = {
      baseState: e.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null
    };
  }
  function Jc(e, t) {
    e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
      baseState: e.baseState,
      firstBaseUpdate: e.firstBaseUpdate,
      lastBaseUpdate: e.lastBaseUpdate,
      shared: e.shared,
      callbacks: null
    });
  }
  function cl(e) {
    return { lane: e, tag: 0, payload: null, callback: null, next: null };
  }
  function ul(e, t, n) {
    var l = e.updateQueue;
    if (l === null) return null;
    if (l = l.shared, (qe & 2) !== 0) {
      var i = l.pending;
      return i === null ? t.next = t : (t.next = i.next, i.next = t), l.pending = t, t = Mi(e), ad(e, null, n), t;
    }
    return Ni(e, l, t, n), Mi(e);
  }
  function gs(e, t, n) {
    if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194048) !== 0)) {
      var l = t.lanes;
      l &= e.pendingLanes, n |= l, t.lanes = n, df(e, n);
    }
  }
  function $c(e, t) {
    var n = e.updateQueue, l = e.alternate;
    if (l !== null && (l = l.updateQueue, n === l)) {
      var i = null, c = null;
      if (n = n.firstBaseUpdate, n !== null) {
        do {
          var h = {
            lane: n.lane,
            tag: n.tag,
            payload: n.payload,
            callback: null,
            next: null
          };
          c === null ? i = c = h : c = c.next = h, n = n.next;
        } while (n !== null);
        c === null ? i = c = t : c = c.next = t;
      } else i = c = t;
      n = {
        baseState: l.baseState,
        firstBaseUpdate: i,
        lastBaseUpdate: c,
        shared: l.shared,
        callbacks: l.callbacks
      }, e.updateQueue = n;
      return;
    }
    e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
  }
  var Wc = !1;
  function ys() {
    if (Wc) {
      var e = _a;
      if (e !== null) throw e;
    }
  }
  function vs(e, t, n, l) {
    Wc = !1;
    var i = e.updateQueue;
    rl = !1;
    var c = i.firstBaseUpdate, h = i.lastBaseUpdate, v = i.shared.pending;
    if (v !== null) {
      i.shared.pending = null;
      var w = v, C = w.next;
      w.next = null, h === null ? c = C : h.next = C, h = w;
      var H = e.alternate;
      H !== null && (H = H.updateQueue, v = H.lastBaseUpdate, v !== h && (v === null ? H.firstBaseUpdate = C : v.next = C, H.lastBaseUpdate = w));
    }
    if (c !== null) {
      var q = i.baseState;
      h = 0, H = C = w = null, v = c;
      do {
        var A = v.lane & -536870913, O = A !== v.lane;
        if (O ? (Ee & A) === A : (l & A) === A) {
          A !== 0 && A === xa && (Wc = !0), H !== null && (H = H.next = {
            lane: 0,
            tag: v.tag,
            payload: v.payload,
            callback: null,
            next: null
          });
          e: {
            var te = e, oe = v;
            A = t;
            var Qe = n;
            switch (oe.tag) {
              case 1:
                if (te = oe.payload, typeof te == "function") {
                  q = te.call(Qe, q, A);
                  break e;
                }
                q = te;
                break e;
              case 3:
                te.flags = te.flags & -65537 | 128;
              case 0:
                if (te = oe.payload, A = typeof te == "function" ? te.call(Qe, q, A) : te, A == null) break e;
                q = _({}, q, A);
                break e;
              case 2:
                rl = !0;
            }
          }
          A = v.callback, A !== null && (e.flags |= 64, O && (e.flags |= 8192), O = i.callbacks, O === null ? i.callbacks = [A] : O.push(A));
        } else
          O = {
            lane: A,
            tag: v.tag,
            payload: v.payload,
            callback: v.callback,
            next: null
          }, H === null ? (C = H = O, w = q) : H = H.next = O, h |= A;
        if (v = v.next, v === null) {
          if (v = i.shared.pending, v === null)
            break;
          O = v, v = O.next, O.next = null, i.lastBaseUpdate = O, i.shared.pending = null;
        }
      } while (!0);
      H === null && (w = q), i.baseState = w, i.firstBaseUpdate = C, i.lastBaseUpdate = H, c === null && (i.shared.lanes = 0), ml |= h, e.lanes = h, e.memoizedState = q;
    }
  }
  function wd(e, t) {
    if (typeof e != "function")
      throw Error(u(191, e));
    e.call(t);
  }
  function Sd(e, t) {
    var n = e.callbacks;
    if (n !== null)
      for (e.callbacks = null, e = 0; e < n.length; e++)
        wd(n[e], t);
  }
  var Sa = b(null), Hi = b(0);
  function jd(e, t) {
    e = $n, Y(Hi, e), Y(Sa, t), $n = e | t.baseLanes;
  }
  function Fc() {
    Y(Hi, $n), Y(Sa, Sa.current);
  }
  function Ic() {
    $n = Hi.current, k(Sa), k(Hi);
  }
  var $t = b(null), hn = null;
  function ol(e) {
    var t = e.alternate;
    Y(ut, ut.current & 1), Y($t, e), hn === null && (t === null || Sa.current !== null || t.memoizedState !== null) && (hn = e);
  }
  function Pc(e) {
    Y(ut, ut.current), Y($t, e), hn === null && (hn = e);
  }
  function Nd(e) {
    e.tag === 22 ? (Y(ut, ut.current), Y($t, e), hn === null && (hn = e)) : fl();
  }
  function fl() {
    Y(ut, ut.current), Y($t, $t.current);
  }
  function Wt(e) {
    k($t), hn === e && (hn = null), k(ut);
  }
  var ut = b(0);
  function Ui(e) {
    for (var t = e; t !== null; ) {
      if (t.tag === 13) {
        var n = t.memoizedState;
        if (n !== null && (n = n.dehydrated, n === null || so(n) || io(n)))
          return t;
      } else if (t.tag === 19 && (t.memoizedProps.revealOrder === "forwards" || t.memoizedProps.revealOrder === "backwards" || t.memoizedProps.revealOrder === "unstable_legacy-backwards" || t.memoizedProps.revealOrder === "together")) {
        if ((t.flags & 128) !== 0) return t;
      } else if (t.child !== null) {
        t.child.return = t, t = t.child;
        continue;
      }
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return null;
        t = t.return;
      }
      t.sibling.return = t.return, t = t.sibling;
    }
    return null;
  }
  var Yn = 0, ve = null, Xe = null, ht = null, Li = !1, ja = !1, Vl = !1, Bi = 0, xs = 0, Na = null, x1 = 0;
  function it() {
    throw Error(u(321));
  }
  function eu(e, t) {
    if (t === null) return !1;
    for (var n = 0; n < t.length && n < e.length; n++)
      if (!Kt(e[n], t[n])) return !1;
    return !0;
  }
  function tu(e, t, n, l, i, c) {
    return Yn = c, ve = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, z.H = e === null || e.memoizedState === null ? ch : gu, Vl = !1, c = n(l, i), Vl = !1, ja && (c = Td(
      t,
      n,
      l,
      i
    )), Md(e), c;
  }
  function Md(e) {
    z.H = ws;
    var t = Xe !== null && Xe.next !== null;
    if (Yn = 0, ht = Xe = ve = null, Li = !1, xs = 0, Na = null, t) throw Error(u(300));
    e === null || mt || (e = e.dependencies, e !== null && Ci(e) && (mt = !0));
  }
  function Td(e, t, n, l) {
    ve = e;
    var i = 0;
    do {
      if (ja && (Na = null), xs = 0, ja = !1, 25 <= i) throw Error(u(301));
      if (i += 1, ht = Xe = null, e.updateQueue != null) {
        var c = e.updateQueue;
        c.lastEffect = null, c.events = null, c.stores = null, c.memoCache != null && (c.memoCache.index = 0);
      }
      z.H = uh, c = t(n, l);
    } while (ja);
    return c;
  }
  function _1() {
    var e = z.H, t = e.useState()[0];
    return t = typeof t.then == "function" ? _s(t) : t, e = e.useState()[0], (Xe !== null ? Xe.memoizedState : null) !== e && (ve.flags |= 1024), t;
  }
  function nu() {
    var e = Bi !== 0;
    return Bi = 0, e;
  }
  function lu(e, t, n) {
    t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
  }
  function au(e) {
    if (Li) {
      for (e = e.memoizedState; e !== null; ) {
        var t = e.queue;
        t !== null && (t.pending = null), e = e.next;
      }
      Li = !1;
    }
    Yn = 0, ht = Xe = ve = null, ja = !1, xs = Bi = 0, Na = null;
  }
  function Rt() {
    var e = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null
    };
    return ht === null ? ve.memoizedState = ht = e : ht = ht.next = e, ht;
  }
  function ot() {
    if (Xe === null) {
      var e = ve.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = Xe.next;
    var t = ht === null ? ve.memoizedState : ht.next;
    if (t !== null)
      ht = t, Xe = e;
    else {
      if (e === null)
        throw ve.alternate === null ? Error(u(467)) : Error(u(310));
      Xe = e, e = {
        memoizedState: Xe.memoizedState,
        baseState: Xe.baseState,
        baseQueue: Xe.baseQueue,
        queue: Xe.queue,
        next: null
      }, ht === null ? ve.memoizedState = ht = e : ht = ht.next = e;
    }
    return ht;
  }
  function qi() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function _s(e) {
    var t = xs;
    return xs += 1, Na === null && (Na = []), e = yd(Na, e, t), t = ve, (ht === null ? t.memoizedState : ht.next) === null && (t = t.alternate, z.H = t === null || t.memoizedState === null ? ch : gu), e;
  }
  function Yi(e) {
    if (e !== null && typeof e == "object") {
      if (typeof e.then == "function") return _s(e);
      if (e.$$typeof === L) return Mt(e);
    }
    throw Error(u(438, String(e)));
  }
  function su(e) {
    var t = null, n = ve.updateQueue;
    if (n !== null && (t = n.memoCache), t == null) {
      var l = ve.alternate;
      l !== null && (l = l.updateQueue, l !== null && (l = l.memoCache, l != null && (t = {
        data: l.data.map(function(i) {
          return i.slice();
        }),
        index: 0
      })));
    }
    if (t == null && (t = { data: [], index: 0 }), n === null && (n = qi(), ve.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0)
      for (n = t.data[t.index] = Array(e), l = 0; l < e; l++)
        n[l] = we;
    return t.index++, n;
  }
  function Gn(e, t) {
    return typeof t == "function" ? t(e) : t;
  }
  function Gi(e) {
    var t = ot();
    return iu(t, Xe, e);
  }
  function iu(e, t, n) {
    var l = e.queue;
    if (l === null) throw Error(u(311));
    l.lastRenderedReducer = n;
    var i = e.baseQueue, c = l.pending;
    if (c !== null) {
      if (i !== null) {
        var h = i.next;
        i.next = c.next, c.next = h;
      }
      t.baseQueue = i = c, l.pending = null;
    }
    if (c = e.baseState, i === null) e.memoizedState = c;
    else {
      t = i.next;
      var v = h = null, w = null, C = t, H = !1;
      do {
        var q = C.lane & -536870913;
        if (q !== C.lane ? (Ee & q) === q : (Yn & q) === q) {
          var A = C.revertLane;
          if (A === 0)
            w !== null && (w = w.next = {
              lane: 0,
              revertLane: 0,
              gesture: null,
              action: C.action,
              hasEagerState: C.hasEagerState,
              eagerState: C.eagerState,
              next: null
            }), q === xa && (H = !0);
          else if ((Yn & A) === A) {
            C = C.next, A === xa && (H = !0);
            continue;
          } else
            q = {
              lane: 0,
              revertLane: C.revertLane,
              gesture: null,
              action: C.action,
              hasEagerState: C.hasEagerState,
              eagerState: C.eagerState,
              next: null
            }, w === null ? (v = w = q, h = c) : w = w.next = q, ve.lanes |= A, ml |= A;
          q = C.action, Vl && n(c, q), c = C.hasEagerState ? C.eagerState : n(c, q);
        } else
          A = {
            lane: q,
            revertLane: C.revertLane,
            gesture: C.gesture,
            action: C.action,
            hasEagerState: C.hasEagerState,
            eagerState: C.eagerState,
            next: null
          }, w === null ? (v = w = A, h = c) : w = w.next = A, ve.lanes |= q, ml |= q;
        C = C.next;
      } while (C !== null && C !== t);
      if (w === null ? h = c : w.next = v, !Kt(c, e.memoizedState) && (mt = !0, H && (n = _a, n !== null)))
        throw n;
      e.memoizedState = c, e.baseState = h, e.baseQueue = w, l.lastRenderedState = c;
    }
    return i === null && (l.lanes = 0), [e.memoizedState, l.dispatch];
  }
  function ru(e) {
    var t = ot(), n = t.queue;
    if (n === null) throw Error(u(311));
    n.lastRenderedReducer = e;
    var l = n.dispatch, i = n.pending, c = t.memoizedState;
    if (i !== null) {
      n.pending = null;
      var h = i = i.next;
      do
        c = e(c, h.action), h = h.next;
      while (h !== i);
      Kt(c, t.memoizedState) || (mt = !0), t.memoizedState = c, t.baseQueue === null && (t.baseState = c), n.lastRenderedState = c;
    }
    return [c, l];
  }
  function Ed(e, t, n) {
    var l = ve, i = ot(), c = Ae;
    if (c) {
      if (n === void 0) throw Error(u(407));
      n = n();
    } else n = t();
    var h = !Kt(
      (Xe || i).memoizedState,
      n
    );
    if (h && (i.memoizedState = n, mt = !0), i = i.queue, ou(zd.bind(null, l, i, e), [
      e
    ]), i.getSnapshot !== t || h || ht !== null && ht.memoizedState.tag & 1) {
      if (l.flags |= 2048, Ma(
        9,
        { destroy: void 0 },
        Ad.bind(
          null,
          l,
          i,
          n,
          t
        ),
        null
      ), Je === null) throw Error(u(349));
      c || (Yn & 127) !== 0 || Cd(l, t, n);
    }
    return n;
  }
  function Cd(e, t, n) {
    e.flags |= 16384, e = { getSnapshot: t, value: n }, t = ve.updateQueue, t === null ? (t = qi(), ve.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
  }
  function Ad(e, t, n, l) {
    t.value = n, t.getSnapshot = l, Od(t) && Rd(e);
  }
  function zd(e, t, n) {
    return n(function() {
      Od(t) && Rd(e);
    });
  }
  function Od(e) {
    var t = e.getSnapshot;
    e = e.value;
    try {
      var n = t();
      return !Kt(e, n);
    } catch {
      return !0;
    }
  }
  function Rd(e) {
    var t = Dl(e, 2);
    t !== null && Yt(t, e, 2);
  }
  function cu(e) {
    var t = Rt();
    if (typeof e == "function") {
      var n = e;
      if (e = n(), Vl) {
        Zt(!0);
        try {
          n();
        } finally {
          Zt(!1);
        }
      }
    }
    return t.memoizedState = t.baseState = e, t.queue = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Gn,
      lastRenderedState: e
    }, t;
  }
  function kd(e, t, n, l) {
    return e.baseState = n, iu(
      e,
      Xe,
      typeof l == "function" ? l : Gn
    );
  }
  function b1(e, t, n, l, i) {
    if (Qi(e)) throw Error(u(485));
    if (e = t.action, e !== null) {
      var c = {
        payload: i,
        action: e,
        next: null,
        isTransition: !0,
        status: "pending",
        value: null,
        reason: null,
        listeners: [],
        then: function(h) {
          c.listeners.push(h);
        }
      };
      z.T !== null ? n(!0) : c.isTransition = !1, l(c), n = t.pending, n === null ? (c.next = t.pending = c, Dd(t, c)) : (c.next = n.next, t.pending = n.next = c);
    }
  }
  function Dd(e, t) {
    var n = t.action, l = t.payload, i = e.state;
    if (t.isTransition) {
      var c = z.T, h = {};
      z.T = h;
      try {
        var v = n(i, l), w = z.S;
        w !== null && w(h, v), Hd(e, t, v);
      } catch (C) {
        uu(e, t, C);
      } finally {
        c !== null && h.types !== null && (c.types = h.types), z.T = c;
      }
    } else
      try {
        c = n(i, l), Hd(e, t, c);
      } catch (C) {
        uu(e, t, C);
      }
  }
  function Hd(e, t, n) {
    n !== null && typeof n == "object" && typeof n.then == "function" ? n.then(
      function(l) {
        Ud(e, t, l);
      },
      function(l) {
        return uu(e, t, l);
      }
    ) : Ud(e, t, n);
  }
  function Ud(e, t, n) {
    t.status = "fulfilled", t.value = n, Ld(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, Dd(e, n)));
  }
  function uu(e, t, n) {
    var l = e.pending;
    if (e.pending = null, l !== null) {
      l = l.next;
      do
        t.status = "rejected", t.reason = n, Ld(t), t = t.next;
      while (t !== l);
    }
    e.action = null;
  }
  function Ld(e) {
    e = e.listeners;
    for (var t = 0; t < e.length; t++) (0, e[t])();
  }
  function Bd(e, t) {
    return t;
  }
  function qd(e, t) {
    if (Ae) {
      var n = Je.formState;
      if (n !== null) {
        e: {
          var l = ve;
          if (Ae) {
            if (Pe) {
              t: {
                for (var i = Pe, c = dn; i.nodeType !== 8; ) {
                  if (!c) {
                    i = null;
                    break t;
                  }
                  if (i = mn(
                    i.nextSibling
                  ), i === null) {
                    i = null;
                    break t;
                  }
                }
                c = i.data, i = c === "F!" || c === "F" ? i : null;
              }
              if (i) {
                Pe = mn(
                  i.nextSibling
                ), l = i.data === "F!";
                break e;
              }
            }
            sl(l);
          }
          l = !1;
        }
        l && (t = n[0]);
      }
    }
    return n = Rt(), n.memoizedState = n.baseState = t, l = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Bd,
      lastRenderedState: t
    }, n.queue = l, n = sh.bind(
      null,
      ve,
      l
    ), l.dispatch = n, l = cu(!1), c = pu.bind(
      null,
      ve,
      !1,
      l.queue
    ), l = Rt(), i = {
      state: t,
      dispatch: null,
      action: e,
      pending: null
    }, l.queue = i, n = b1.bind(
      null,
      ve,
      i,
      c,
      n
    ), i.dispatch = n, l.memoizedState = e, [t, n, !1];
  }
  function Yd(e) {
    var t = ot();
    return Gd(t, Xe, e);
  }
  function Gd(e, t, n) {
    if (t = iu(
      e,
      t,
      Bd
    )[0], e = Gi(Gn)[0], typeof t == "object" && t !== null && typeof t.then == "function")
      try {
        var l = _s(t);
      } catch (h) {
        throw h === ba ? Oi : h;
      }
    else l = t;
    t = ot();
    var i = t.queue, c = i.dispatch;
    return n !== t.memoizedState && (ve.flags |= 2048, Ma(
      9,
      { destroy: void 0 },
      w1.bind(null, i, n),
      null
    )), [l, c, e];
  }
  function w1(e, t) {
    e.action = t;
  }
  function Xd(e) {
    var t = ot(), n = Xe;
    if (n !== null)
      return Gd(t, n, e);
    ot(), t = t.memoizedState, n = ot();
    var l = n.queue.dispatch;
    return n.memoizedState = e, [t, l, !1];
  }
  function Ma(e, t, n, l) {
    return e = { tag: e, create: n, deps: l, inst: t, next: null }, t = ve.updateQueue, t === null && (t = qi(), ve.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (l = n.next, n.next = e, e.next = l, t.lastEffect = e), e;
  }
  function Vd() {
    return ot().memoizedState;
  }
  function Xi(e, t, n, l) {
    var i = Rt();
    ve.flags |= e, i.memoizedState = Ma(
      1 | t,
      { destroy: void 0 },
      n,
      l === void 0 ? null : l
    );
  }
  function Vi(e, t, n, l) {
    var i = ot();
    l = l === void 0 ? null : l;
    var c = i.memoizedState.inst;
    Xe !== null && l !== null && eu(l, Xe.memoizedState.deps) ? i.memoizedState = Ma(t, c, n, l) : (ve.flags |= e, i.memoizedState = Ma(
      1 | t,
      c,
      n,
      l
    ));
  }
  function Qd(e, t) {
    Xi(8390656, 8, e, t);
  }
  function ou(e, t) {
    Vi(2048, 8, e, t);
  }
  function S1(e) {
    ve.flags |= 4;
    var t = ve.updateQueue;
    if (t === null)
      t = qi(), ve.updateQueue = t, t.events = [e];
    else {
      var n = t.events;
      n === null ? t.events = [e] : n.push(e);
    }
  }
  function Zd(e) {
    var t = ot().memoizedState;
    return S1({ ref: t, nextImpl: e }), function() {
      if ((qe & 2) !== 0) throw Error(u(440));
      return t.impl.apply(void 0, arguments);
    };
  }
  function Kd(e, t) {
    return Vi(4, 2, e, t);
  }
  function Jd(e, t) {
    return Vi(4, 4, e, t);
  }
  function $d(e, t) {
    if (typeof t == "function") {
      e = e();
      var n = t(e);
      return function() {
        typeof n == "function" ? n() : t(null);
      };
    }
    if (t != null)
      return e = e(), t.current = e, function() {
        t.current = null;
      };
  }
  function Wd(e, t, n) {
    n = n != null ? n.concat([e]) : null, Vi(4, 4, $d.bind(null, t, e), n);
  }
  function fu() {
  }
  function Fd(e, t) {
    var n = ot();
    t = t === void 0 ? null : t;
    var l = n.memoizedState;
    return t !== null && eu(t, l[1]) ? l[0] : (n.memoizedState = [e, t], e);
  }
  function Id(e, t) {
    var n = ot();
    t = t === void 0 ? null : t;
    var l = n.memoizedState;
    if (t !== null && eu(t, l[1]))
      return l[0];
    if (l = e(), Vl) {
      Zt(!0);
      try {
        e();
      } finally {
        Zt(!1);
      }
    }
    return n.memoizedState = [l, t], l;
  }
  function du(e, t, n) {
    return n === void 0 || (Yn & 1073741824) !== 0 && (Ee & 261930) === 0 ? e.memoizedState = t : (e.memoizedState = n, e = Ph(), ve.lanes |= e, ml |= e, n);
  }
  function Pd(e, t, n, l) {
    return Kt(n, t) ? n : Sa.current !== null ? (e = du(e, n, l), Kt(e, t) || (mt = !0), e) : (Yn & 42) === 0 || (Yn & 1073741824) !== 0 && (Ee & 261930) === 0 ? (mt = !0, e.memoizedState = n) : (e = Ph(), ve.lanes |= e, ml |= e, t);
  }
  function eh(e, t, n, l, i) {
    var c = G.p;
    G.p = c !== 0 && 8 > c ? c : 8;
    var h = z.T, v = {};
    z.T = v, pu(e, !1, t, n);
    try {
      var w = i(), C = z.S;
      if (C !== null && C(v, w), w !== null && typeof w == "object" && typeof w.then == "function") {
        var H = v1(
          w,
          l
        );
        bs(
          e,
          t,
          H,
          Pt(e)
        );
      } else
        bs(
          e,
          t,
          l,
          Pt(e)
        );
    } catch (q) {
      bs(
        e,
        t,
        { then: function() {
        }, status: "rejected", reason: q },
        Pt()
      );
    } finally {
      G.p = c, h !== null && v.types !== null && (h.types = v.types), z.T = h;
    }
  }
  function j1() {
  }
  function hu(e, t, n, l) {
    if (e.tag !== 5) throw Error(u(476));
    var i = th(e).queue;
    eh(
      e,
      i,
      t,
      ee,
      n === null ? j1 : function() {
        return nh(e), n(l);
      }
    );
  }
  function th(e) {
    var t = e.memoizedState;
    if (t !== null) return t;
    t = {
      memoizedState: ee,
      baseState: ee,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Gn,
        lastRenderedState: ee
      },
      next: null
    };
    var n = {};
    return t.next = {
      memoizedState: n,
      baseState: n,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Gn,
        lastRenderedState: n
      },
      next: null
    }, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
  }
  function nh(e) {
    var t = th(e);
    t.next === null && (t = e.alternate.memoizedState), bs(
      e,
      t.next.queue,
      {},
      Pt()
    );
  }
  function mu() {
    return Mt(Ls);
  }
  function lh() {
    return ot().memoizedState;
  }
  function ah() {
    return ot().memoizedState;
  }
  function N1(e) {
    for (var t = e.return; t !== null; ) {
      switch (t.tag) {
        case 24:
        case 3:
          var n = Pt();
          e = cl(n);
          var l = ul(t, e, n);
          l !== null && (Yt(l, t, n), gs(l, t, n)), t = { cache: Xc() }, e.payload = t;
          return;
      }
      t = t.return;
    }
  }
  function M1(e, t, n) {
    var l = Pt();
    n = {
      lane: l,
      revertLane: 0,
      gesture: null,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, Qi(e) ? ih(t, n) : (n = Oc(e, t, n, l), n !== null && (Yt(n, e, l), rh(n, t, l)));
  }
  function sh(e, t, n) {
    var l = Pt();
    bs(e, t, n, l);
  }
  function bs(e, t, n, l) {
    var i = {
      lane: l,
      revertLane: 0,
      gesture: null,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null
    };
    if (Qi(e)) ih(t, i);
    else {
      var c = e.alternate;
      if (e.lanes === 0 && (c === null || c.lanes === 0) && (c = t.lastRenderedReducer, c !== null))
        try {
          var h = t.lastRenderedState, v = c(h, n);
          if (i.hasEagerState = !0, i.eagerState = v, Kt(v, h))
            return Ni(e, t, i, 0), Je === null && ji(), !1;
        } catch {
        } finally {
        }
      if (n = Oc(e, t, i, l), n !== null)
        return Yt(n, e, l), rh(n, t, l), !0;
    }
    return !1;
  }
  function pu(e, t, n, l) {
    if (l = {
      lane: 2,
      revertLane: Ku(),
      gesture: null,
      action: l,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, Qi(e)) {
      if (t) throw Error(u(479));
    } else
      t = Oc(
        e,
        n,
        l,
        2
      ), t !== null && Yt(t, e, 2);
  }
  function Qi(e) {
    var t = e.alternate;
    return e === ve || t !== null && t === ve;
  }
  function ih(e, t) {
    ja = Li = !0;
    var n = e.pending;
    n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
  }
  function rh(e, t, n) {
    if ((n & 4194048) !== 0) {
      var l = t.lanes;
      l &= e.pendingLanes, n |= l, t.lanes = n, df(e, n);
    }
  }
  var ws = {
    readContext: Mt,
    use: Yi,
    useCallback: it,
    useContext: it,
    useEffect: it,
    useImperativeHandle: it,
    useLayoutEffect: it,
    useInsertionEffect: it,
    useMemo: it,
    useReducer: it,
    useRef: it,
    useState: it,
    useDebugValue: it,
    useDeferredValue: it,
    useTransition: it,
    useSyncExternalStore: it,
    useId: it,
    useHostTransitionStatus: it,
    useFormState: it,
    useActionState: it,
    useOptimistic: it,
    useMemoCache: it,
    useCacheRefresh: it
  };
  ws.useEffectEvent = it;
  var ch = {
    readContext: Mt,
    use: Yi,
    useCallback: function(e, t) {
      return Rt().memoizedState = [
        e,
        t === void 0 ? null : t
      ], e;
    },
    useContext: Mt,
    useEffect: Qd,
    useImperativeHandle: function(e, t, n) {
      n = n != null ? n.concat([e]) : null, Xi(
        4194308,
        4,
        $d.bind(null, t, e),
        n
      );
    },
    useLayoutEffect: function(e, t) {
      return Xi(4194308, 4, e, t);
    },
    useInsertionEffect: function(e, t) {
      Xi(4, 2, e, t);
    },
    useMemo: function(e, t) {
      var n = Rt();
      t = t === void 0 ? null : t;
      var l = e();
      if (Vl) {
        Zt(!0);
        try {
          e();
        } finally {
          Zt(!1);
        }
      }
      return n.memoizedState = [l, t], l;
    },
    useReducer: function(e, t, n) {
      var l = Rt();
      if (n !== void 0) {
        var i = n(t);
        if (Vl) {
          Zt(!0);
          try {
            n(t);
          } finally {
            Zt(!1);
          }
        }
      } else i = t;
      return l.memoizedState = l.baseState = i, e = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: e,
        lastRenderedState: i
      }, l.queue = e, e = e.dispatch = M1.bind(
        null,
        ve,
        e
      ), [l.memoizedState, e];
    },
    useRef: function(e) {
      var t = Rt();
      return e = { current: e }, t.memoizedState = e;
    },
    useState: function(e) {
      e = cu(e);
      var t = e.queue, n = sh.bind(null, ve, t);
      return t.dispatch = n, [e.memoizedState, n];
    },
    useDebugValue: fu,
    useDeferredValue: function(e, t) {
      var n = Rt();
      return du(n, e, t);
    },
    useTransition: function() {
      var e = cu(!1);
      return e = eh.bind(
        null,
        ve,
        e.queue,
        !0,
        !1
      ), Rt().memoizedState = e, [!1, e];
    },
    useSyncExternalStore: function(e, t, n) {
      var l = ve, i = Rt();
      if (Ae) {
        if (n === void 0)
          throw Error(u(407));
        n = n();
      } else {
        if (n = t(), Je === null)
          throw Error(u(349));
        (Ee & 127) !== 0 || Cd(l, t, n);
      }
      i.memoizedState = n;
      var c = { value: n, getSnapshot: t };
      return i.queue = c, Qd(zd.bind(null, l, c, e), [
        e
      ]), l.flags |= 2048, Ma(
        9,
        { destroy: void 0 },
        Ad.bind(
          null,
          l,
          c,
          n,
          t
        ),
        null
      ), n;
    },
    useId: function() {
      var e = Rt(), t = Je.identifierPrefix;
      if (Ae) {
        var n = Nn, l = jn;
        n = (l & ~(1 << 32 - zt(l) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = Bi++, 0 < n && (t += "H" + n.toString(32)), t += "_";
      } else
        n = x1++, t = "_" + t + "r_" + n.toString(32) + "_";
      return e.memoizedState = t;
    },
    useHostTransitionStatus: mu,
    useFormState: qd,
    useActionState: qd,
    useOptimistic: function(e) {
      var t = Rt();
      t.memoizedState = t.baseState = e;
      var n = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null
      };
      return t.queue = n, t = pu.bind(
        null,
        ve,
        !0,
        n
      ), n.dispatch = t, [e, t];
    },
    useMemoCache: su,
    useCacheRefresh: function() {
      return Rt().memoizedState = N1.bind(
        null,
        ve
      );
    },
    useEffectEvent: function(e) {
      var t = Rt(), n = { impl: e };
      return t.memoizedState = n, function() {
        if ((qe & 2) !== 0)
          throw Error(u(440));
        return n.impl.apply(void 0, arguments);
      };
    }
  }, gu = {
    readContext: Mt,
    use: Yi,
    useCallback: Fd,
    useContext: Mt,
    useEffect: ou,
    useImperativeHandle: Wd,
    useInsertionEffect: Kd,
    useLayoutEffect: Jd,
    useMemo: Id,
    useReducer: Gi,
    useRef: Vd,
    useState: function() {
      return Gi(Gn);
    },
    useDebugValue: fu,
    useDeferredValue: function(e, t) {
      var n = ot();
      return Pd(
        n,
        Xe.memoizedState,
        e,
        t
      );
    },
    useTransition: function() {
      var e = Gi(Gn)[0], t = ot().memoizedState;
      return [
        typeof e == "boolean" ? e : _s(e),
        t
      ];
    },
    useSyncExternalStore: Ed,
    useId: lh,
    useHostTransitionStatus: mu,
    useFormState: Yd,
    useActionState: Yd,
    useOptimistic: function(e, t) {
      var n = ot();
      return kd(n, Xe, e, t);
    },
    useMemoCache: su,
    useCacheRefresh: ah
  };
  gu.useEffectEvent = Zd;
  var uh = {
    readContext: Mt,
    use: Yi,
    useCallback: Fd,
    useContext: Mt,
    useEffect: ou,
    useImperativeHandle: Wd,
    useInsertionEffect: Kd,
    useLayoutEffect: Jd,
    useMemo: Id,
    useReducer: ru,
    useRef: Vd,
    useState: function() {
      return ru(Gn);
    },
    useDebugValue: fu,
    useDeferredValue: function(e, t) {
      var n = ot();
      return Xe === null ? du(n, e, t) : Pd(
        n,
        Xe.memoizedState,
        e,
        t
      );
    },
    useTransition: function() {
      var e = ru(Gn)[0], t = ot().memoizedState;
      return [
        typeof e == "boolean" ? e : _s(e),
        t
      ];
    },
    useSyncExternalStore: Ed,
    useId: lh,
    useHostTransitionStatus: mu,
    useFormState: Xd,
    useActionState: Xd,
    useOptimistic: function(e, t) {
      var n = ot();
      return Xe !== null ? kd(n, Xe, e, t) : (n.baseState = e, [e, n.queue.dispatch]);
    },
    useMemoCache: su,
    useCacheRefresh: ah
  };
  uh.useEffectEvent = Zd;
  function yu(e, t, n, l) {
    t = e.memoizedState, n = n(l, t), n = n == null ? t : _({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
  }
  var vu = {
    enqueueSetState: function(e, t, n) {
      e = e._reactInternals;
      var l = Pt(), i = cl(l);
      i.payload = t, n != null && (i.callback = n), t = ul(e, i, l), t !== null && (Yt(t, e, l), gs(t, e, l));
    },
    enqueueReplaceState: function(e, t, n) {
      e = e._reactInternals;
      var l = Pt(), i = cl(l);
      i.tag = 1, i.payload = t, n != null && (i.callback = n), t = ul(e, i, l), t !== null && (Yt(t, e, l), gs(t, e, l));
    },
    enqueueForceUpdate: function(e, t) {
      e = e._reactInternals;
      var n = Pt(), l = cl(n);
      l.tag = 2, t != null && (l.callback = t), t = ul(e, l, n), t !== null && (Yt(t, e, n), gs(t, e, n));
    }
  };
  function oh(e, t, n, l, i, c, h) {
    return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(l, c, h) : t.prototype && t.prototype.isPureReactComponent ? !cs(n, l) || !cs(i, c) : !0;
  }
  function fh(e, t, n, l) {
    e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, l), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, l), t.state !== e && vu.enqueueReplaceState(t, t.state, null);
  }
  function Ql(e, t) {
    var n = t;
    if ("ref" in t) {
      n = {};
      for (var l in t)
        l !== "ref" && (n[l] = t[l]);
    }
    if (e = e.defaultProps) {
      n === t && (n = _({}, n));
      for (var i in e)
        n[i] === void 0 && (n[i] = e[i]);
    }
    return n;
  }
  function dh(e) {
    Si(e);
  }
  function hh(e) {
    console.error(e);
  }
  function mh(e) {
    Si(e);
  }
  function Zi(e, t) {
    try {
      var n = e.onUncaughtError;
      n(t.value, { componentStack: t.stack });
    } catch (l) {
      setTimeout(function() {
        throw l;
      });
    }
  }
  function ph(e, t, n) {
    try {
      var l = e.onCaughtError;
      l(n.value, {
        componentStack: n.stack,
        errorBoundary: t.tag === 1 ? t.stateNode : null
      });
    } catch (i) {
      setTimeout(function() {
        throw i;
      });
    }
  }
  function xu(e, t, n) {
    return n = cl(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
      Zi(e, t);
    }, n;
  }
  function gh(e) {
    return e = cl(e), e.tag = 3, e;
  }
  function yh(e, t, n, l) {
    var i = n.type.getDerivedStateFromError;
    if (typeof i == "function") {
      var c = l.value;
      e.payload = function() {
        return i(c);
      }, e.callback = function() {
        ph(t, n, l);
      };
    }
    var h = n.stateNode;
    h !== null && typeof h.componentDidCatch == "function" && (e.callback = function() {
      ph(t, n, l), typeof i != "function" && (pl === null ? pl = /* @__PURE__ */ new Set([this]) : pl.add(this));
      var v = l.stack;
      this.componentDidCatch(l.value, {
        componentStack: v !== null ? v : ""
      });
    });
  }
  function T1(e, t, n, l, i) {
    if (n.flags |= 32768, l !== null && typeof l == "object" && typeof l.then == "function") {
      if (t = n.alternate, t !== null && va(
        t,
        n,
        i,
        !0
      ), n = $t.current, n !== null) {
        switch (n.tag) {
          case 31:
          case 13:
            return hn === null ? ar() : n.alternate === null && rt === 0 && (rt = 3), n.flags &= -257, n.flags |= 65536, n.lanes = i, l === Ri ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = /* @__PURE__ */ new Set([l]) : t.add(l), Vu(e, l, i)), !1;
          case 22:
            return n.flags |= 65536, l === Ri ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
              transitions: null,
              markerInstances: null,
              retryQueue: /* @__PURE__ */ new Set([l])
            }, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = /* @__PURE__ */ new Set([l]) : n.add(l)), Vu(e, l, i)), !1;
        }
        throw Error(u(435, n.tag));
      }
      return Vu(e, l, i), ar(), !1;
    }
    if (Ae)
      return t = $t.current, t !== null ? ((t.flags & 65536) === 0 && (t.flags |= 256), t.flags |= 65536, t.lanes = i, l !== Lc && (e = Error(u(422), { cause: l }), fs(un(e, n)))) : (l !== Lc && (t = Error(u(423), {
        cause: l
      }), fs(
        un(t, n)
      )), e = e.current.alternate, e.flags |= 65536, i &= -i, e.lanes |= i, l = un(l, n), i = xu(
        e.stateNode,
        l,
        i
      ), $c(e, i), rt !== 4 && (rt = 2)), !1;
    var c = Error(u(520), { cause: l });
    if (c = un(c, n), As === null ? As = [c] : As.push(c), rt !== 4 && (rt = 2), t === null) return !0;
    l = un(l, n), n = t;
    do {
      switch (n.tag) {
        case 3:
          return n.flags |= 65536, e = i & -i, n.lanes |= e, e = xu(n.stateNode, l, e), $c(n, e), !1;
        case 1:
          if (t = n.type, c = n.stateNode, (n.flags & 128) === 0 && (typeof t.getDerivedStateFromError == "function" || c !== null && typeof c.componentDidCatch == "function" && (pl === null || !pl.has(c))))
            return n.flags |= 65536, i &= -i, n.lanes |= i, i = gh(i), yh(
              i,
              e,
              n,
              l
            ), $c(n, i), !1;
      }
      n = n.return;
    } while (n !== null);
    return !1;
  }
  var _u = Error(u(461)), mt = !1;
  function Tt(e, t, n, l) {
    t.child = e === null ? bd(t, null, n, l) : Xl(
      t,
      e.child,
      n,
      l
    );
  }
  function vh(e, t, n, l, i) {
    n = n.render;
    var c = t.ref;
    if ("ref" in l) {
      var h = {};
      for (var v in l)
        v !== "ref" && (h[v] = l[v]);
    } else h = l;
    return Bl(t), l = tu(
      e,
      t,
      n,
      h,
      c,
      i
    ), v = nu(), e !== null && !mt ? (lu(e, t, i), Xn(e, t, i)) : (Ae && v && Hc(t), t.flags |= 1, Tt(e, t, l, i), t.child);
  }
  function xh(e, t, n, l, i) {
    if (e === null) {
      var c = n.type;
      return typeof c == "function" && !Rc(c) && c.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = c, _h(
        e,
        t,
        c,
        l,
        i
      )) : (e = Ti(
        n.type,
        null,
        l,
        t,
        t.mode,
        i
      ), e.ref = t.ref, e.return = t, t.child = e);
    }
    if (c = e.child, !Eu(e, i)) {
      var h = c.memoizedProps;
      if (n = n.compare, n = n !== null ? n : cs, n(h, l) && e.ref === t.ref)
        return Xn(e, t, i);
    }
    return t.flags |= 1, e = Un(c, l), e.ref = t.ref, e.return = t, t.child = e;
  }
  function _h(e, t, n, l, i) {
    if (e !== null) {
      var c = e.memoizedProps;
      if (cs(c, l) && e.ref === t.ref)
        if (mt = !1, t.pendingProps = l = c, Eu(e, i))
          (e.flags & 131072) !== 0 && (mt = !0);
        else
          return t.lanes = e.lanes, Xn(e, t, i);
    }
    return bu(
      e,
      t,
      n,
      l,
      i
    );
  }
  function bh(e, t, n, l) {
    var i = l.children, c = e !== null ? e.memoizedState : null;
    if (e === null && t.stateNode === null && (t.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), l.mode === "hidden") {
      if ((t.flags & 128) !== 0) {
        if (c = c !== null ? c.baseLanes | n : n, e !== null) {
          for (l = t.child = e.child, i = 0; l !== null; )
            i = i | l.lanes | l.childLanes, l = l.sibling;
          l = i & ~c;
        } else l = 0, t.child = null;
        return wh(
          e,
          t,
          c,
          n,
          l
        );
      }
      if ((n & 536870912) !== 0)
        t.memoizedState = { baseLanes: 0, cachePool: null }, e !== null && zi(
          t,
          c !== null ? c.cachePool : null
        ), c !== null ? jd(t, c) : Fc(), Nd(t);
      else
        return l = t.lanes = 536870912, wh(
          e,
          t,
          c !== null ? c.baseLanes | n : n,
          n,
          l
        );
    } else
      c !== null ? (zi(t, c.cachePool), jd(t, c), fl(), t.memoizedState = null) : (e !== null && zi(t, null), Fc(), fl());
    return Tt(e, t, i, n), t.child;
  }
  function Ss(e, t) {
    return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), t.sibling;
  }
  function wh(e, t, n, l, i) {
    var c = Qc();
    return c = c === null ? null : { parent: dt._currentValue, pool: c }, t.memoizedState = {
      baseLanes: n,
      cachePool: c
    }, e !== null && zi(t, null), Fc(), Nd(t), e !== null && va(e, t, l, !0), t.childLanes = i, null;
  }
  function Ki(e, t) {
    return t = $i(
      { mode: t.mode, children: t.children },
      e.mode
    ), t.ref = e.ref, e.child = t, t.return = e, t;
  }
  function Sh(e, t, n) {
    return Xl(t, e.child, null, n), e = Ki(t, t.pendingProps), e.flags |= 2, Wt(t), t.memoizedState = null, e;
  }
  function E1(e, t, n) {
    var l = t.pendingProps, i = (t.flags & 128) !== 0;
    if (t.flags &= -129, e === null) {
      if (Ae) {
        if (l.mode === "hidden")
          return e = Ki(t, l), t.lanes = 536870912, Ss(null, e);
        if (Pc(t), (e = Pe) ? (e = Dm(
          e,
          dn
        ), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
          dehydrated: e,
          treeContext: ll !== null ? { id: jn, overflow: Nn } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, n = id(e), n.return = t, t.child = n, Nt = t, Pe = null)) : e = null, e === null) throw sl(t);
        return t.lanes = 536870912, null;
      }
      return Ki(t, l);
    }
    var c = e.memoizedState;
    if (c !== null) {
      var h = c.dehydrated;
      if (Pc(t), i)
        if (t.flags & 256)
          t.flags &= -257, t = Sh(
            e,
            t,
            n
          );
        else if (t.memoizedState !== null)
          t.child = e.child, t.flags |= 128, t = null;
        else throw Error(u(558));
      else if (mt || va(e, t, n, !1), i = (n & e.childLanes) !== 0, mt || i) {
        if (l = Je, l !== null && (h = hf(l, n), h !== 0 && h !== c.retryLane))
          throw c.retryLane = h, Dl(e, h), Yt(l, e, h), _u;
        ar(), t = Sh(
          e,
          t,
          n
        );
      } else
        e = c.treeContext, Pe = mn(h.nextSibling), Nt = t, Ae = !0, al = null, dn = !1, e !== null && ud(t, e), t = Ki(t, l), t.flags |= 4096;
      return t;
    }
    return e = Un(e.child, {
      mode: l.mode,
      children: l.children
    }), e.ref = t.ref, t.child = e, e.return = t, e;
  }
  function Ji(e, t) {
    var n = t.ref;
    if (n === null)
      e !== null && e.ref !== null && (t.flags |= 4194816);
    else {
      if (typeof n != "function" && typeof n != "object")
        throw Error(u(284));
      (e === null || e.ref !== n) && (t.flags |= 4194816);
    }
  }
  function bu(e, t, n, l, i) {
    return Bl(t), n = tu(
      e,
      t,
      n,
      l,
      void 0,
      i
    ), l = nu(), e !== null && !mt ? (lu(e, t, i), Xn(e, t, i)) : (Ae && l && Hc(t), t.flags |= 1, Tt(e, t, n, i), t.child);
  }
  function jh(e, t, n, l, i, c) {
    return Bl(t), t.updateQueue = null, n = Td(
      t,
      l,
      n,
      i
    ), Md(e), l = nu(), e !== null && !mt ? (lu(e, t, c), Xn(e, t, c)) : (Ae && l && Hc(t), t.flags |= 1, Tt(e, t, n, c), t.child);
  }
  function Nh(e, t, n, l, i) {
    if (Bl(t), t.stateNode === null) {
      var c = ma, h = n.contextType;
      typeof h == "object" && h !== null && (c = Mt(h)), c = new n(l, c), t.memoizedState = c.state !== null && c.state !== void 0 ? c.state : null, c.updater = vu, t.stateNode = c, c._reactInternals = t, c = t.stateNode, c.props = l, c.state = t.memoizedState, c.refs = {}, Kc(t), h = n.contextType, c.context = typeof h == "object" && h !== null ? Mt(h) : ma, c.state = t.memoizedState, h = n.getDerivedStateFromProps, typeof h == "function" && (yu(
        t,
        n,
        h,
        l
      ), c.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof c.getSnapshotBeforeUpdate == "function" || typeof c.UNSAFE_componentWillMount != "function" && typeof c.componentWillMount != "function" || (h = c.state, typeof c.componentWillMount == "function" && c.componentWillMount(), typeof c.UNSAFE_componentWillMount == "function" && c.UNSAFE_componentWillMount(), h !== c.state && vu.enqueueReplaceState(c, c.state, null), vs(t, l, c, i), ys(), c.state = t.memoizedState), typeof c.componentDidMount == "function" && (t.flags |= 4194308), l = !0;
    } else if (e === null) {
      c = t.stateNode;
      var v = t.memoizedProps, w = Ql(n, v);
      c.props = w;
      var C = c.context, H = n.contextType;
      h = ma, typeof H == "object" && H !== null && (h = Mt(H));
      var q = n.getDerivedStateFromProps;
      H = typeof q == "function" || typeof c.getSnapshotBeforeUpdate == "function", v = t.pendingProps !== v, H || typeof c.UNSAFE_componentWillReceiveProps != "function" && typeof c.componentWillReceiveProps != "function" || (v || C !== h) && fh(
        t,
        c,
        l,
        h
      ), rl = !1;
      var A = t.memoizedState;
      c.state = A, vs(t, l, c, i), ys(), C = t.memoizedState, v || A !== C || rl ? (typeof q == "function" && (yu(
        t,
        n,
        q,
        l
      ), C = t.memoizedState), (w = rl || oh(
        t,
        n,
        w,
        l,
        A,
        C,
        h
      )) ? (H || typeof c.UNSAFE_componentWillMount != "function" && typeof c.componentWillMount != "function" || (typeof c.componentWillMount == "function" && c.componentWillMount(), typeof c.UNSAFE_componentWillMount == "function" && c.UNSAFE_componentWillMount()), typeof c.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof c.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = l, t.memoizedState = C), c.props = l, c.state = C, c.context = h, l = w) : (typeof c.componentDidMount == "function" && (t.flags |= 4194308), l = !1);
    } else {
      c = t.stateNode, Jc(e, t), h = t.memoizedProps, H = Ql(n, h), c.props = H, q = t.pendingProps, A = c.context, C = n.contextType, w = ma, typeof C == "object" && C !== null && (w = Mt(C)), v = n.getDerivedStateFromProps, (C = typeof v == "function" || typeof c.getSnapshotBeforeUpdate == "function") || typeof c.UNSAFE_componentWillReceiveProps != "function" && typeof c.componentWillReceiveProps != "function" || (h !== q || A !== w) && fh(
        t,
        c,
        l,
        w
      ), rl = !1, A = t.memoizedState, c.state = A, vs(t, l, c, i), ys();
      var O = t.memoizedState;
      h !== q || A !== O || rl || e !== null && e.dependencies !== null && Ci(e.dependencies) ? (typeof v == "function" && (yu(
        t,
        n,
        v,
        l
      ), O = t.memoizedState), (H = rl || oh(
        t,
        n,
        H,
        l,
        A,
        O,
        w
      ) || e !== null && e.dependencies !== null && Ci(e.dependencies)) ? (C || typeof c.UNSAFE_componentWillUpdate != "function" && typeof c.componentWillUpdate != "function" || (typeof c.componentWillUpdate == "function" && c.componentWillUpdate(l, O, w), typeof c.UNSAFE_componentWillUpdate == "function" && c.UNSAFE_componentWillUpdate(
        l,
        O,
        w
      )), typeof c.componentDidUpdate == "function" && (t.flags |= 4), typeof c.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof c.componentDidUpdate != "function" || h === e.memoizedProps && A === e.memoizedState || (t.flags |= 4), typeof c.getSnapshotBeforeUpdate != "function" || h === e.memoizedProps && A === e.memoizedState || (t.flags |= 1024), t.memoizedProps = l, t.memoizedState = O), c.props = l, c.state = O, c.context = w, l = H) : (typeof c.componentDidUpdate != "function" || h === e.memoizedProps && A === e.memoizedState || (t.flags |= 4), typeof c.getSnapshotBeforeUpdate != "function" || h === e.memoizedProps && A === e.memoizedState || (t.flags |= 1024), l = !1);
    }
    return c = l, Ji(e, t), l = (t.flags & 128) !== 0, c || l ? (c = t.stateNode, n = l && typeof n.getDerivedStateFromError != "function" ? null : c.render(), t.flags |= 1, e !== null && l ? (t.child = Xl(
      t,
      e.child,
      null,
      i
    ), t.child = Xl(
      t,
      null,
      n,
      i
    )) : Tt(e, t, n, i), t.memoizedState = c.state, e = t.child) : e = Xn(
      e,
      t,
      i
    ), e;
  }
  function Mh(e, t, n, l) {
    return Ul(), t.flags |= 256, Tt(e, t, n, l), t.child;
  }
  var wu = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0,
    hydrationErrors: null
  };
  function Su(e) {
    return { baseLanes: e, cachePool: pd() };
  }
  function ju(e, t, n) {
    return e = e !== null ? e.childLanes & ~n : 0, t && (e |= It), e;
  }
  function Th(e, t, n) {
    var l = t.pendingProps, i = !1, c = (t.flags & 128) !== 0, h;
    if ((h = c) || (h = e !== null && e.memoizedState === null ? !1 : (ut.current & 2) !== 0), h && (i = !0, t.flags &= -129), h = (t.flags & 32) !== 0, t.flags &= -33, e === null) {
      if (Ae) {
        if (i ? ol(t) : fl(), (e = Pe) ? (e = Dm(
          e,
          dn
        ), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
          dehydrated: e,
          treeContext: ll !== null ? { id: jn, overflow: Nn } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, n = id(e), n.return = t, t.child = n, Nt = t, Pe = null)) : e = null, e === null) throw sl(t);
        return io(e) ? t.lanes = 32 : t.lanes = 536870912, null;
      }
      var v = l.children;
      return l = l.fallback, i ? (fl(), i = t.mode, v = $i(
        { mode: "hidden", children: v },
        i
      ), l = Hl(
        l,
        i,
        n,
        null
      ), v.return = t, l.return = t, v.sibling = l, t.child = v, l = t.child, l.memoizedState = Su(n), l.childLanes = ju(
        e,
        h,
        n
      ), t.memoizedState = wu, Ss(null, l)) : (ol(t), Nu(t, v));
    }
    var w = e.memoizedState;
    if (w !== null && (v = w.dehydrated, v !== null)) {
      if (c)
        t.flags & 256 ? (ol(t), t.flags &= -257, t = Mu(
          e,
          t,
          n
        )) : t.memoizedState !== null ? (fl(), t.child = e.child, t.flags |= 128, t = null) : (fl(), v = l.fallback, i = t.mode, l = $i(
          { mode: "visible", children: l.children },
          i
        ), v = Hl(
          v,
          i,
          n,
          null
        ), v.flags |= 2, l.return = t, v.return = t, l.sibling = v, t.child = l, Xl(
          t,
          e.child,
          null,
          n
        ), l = t.child, l.memoizedState = Su(n), l.childLanes = ju(
          e,
          h,
          n
        ), t.memoizedState = wu, t = Ss(null, l));
      else if (ol(t), io(v)) {
        if (h = v.nextSibling && v.nextSibling.dataset, h) var C = h.dgst;
        h = C, l = Error(u(419)), l.stack = "", l.digest = h, fs({ value: l, source: null, stack: null }), t = Mu(
          e,
          t,
          n
        );
      } else if (mt || va(e, t, n, !1), h = (n & e.childLanes) !== 0, mt || h) {
        if (h = Je, h !== null && (l = hf(h, n), l !== 0 && l !== w.retryLane))
          throw w.retryLane = l, Dl(e, l), Yt(h, e, l), _u;
        so(v) || ar(), t = Mu(
          e,
          t,
          n
        );
      } else
        so(v) ? (t.flags |= 192, t.child = e.child, t = null) : (e = w.treeContext, Pe = mn(
          v.nextSibling
        ), Nt = t, Ae = !0, al = null, dn = !1, e !== null && ud(t, e), t = Nu(
          t,
          l.children
        ), t.flags |= 4096);
      return t;
    }
    return i ? (fl(), v = l.fallback, i = t.mode, w = e.child, C = w.sibling, l = Un(w, {
      mode: "hidden",
      children: l.children
    }), l.subtreeFlags = w.subtreeFlags & 65011712, C !== null ? v = Un(
      C,
      v
    ) : (v = Hl(
      v,
      i,
      n,
      null
    ), v.flags |= 2), v.return = t, l.return = t, l.sibling = v, t.child = l, Ss(null, l), l = t.child, v = e.child.memoizedState, v === null ? v = Su(n) : (i = v.cachePool, i !== null ? (w = dt._currentValue, i = i.parent !== w ? { parent: w, pool: w } : i) : i = pd(), v = {
      baseLanes: v.baseLanes | n,
      cachePool: i
    }), l.memoizedState = v, l.childLanes = ju(
      e,
      h,
      n
    ), t.memoizedState = wu, Ss(e.child, l)) : (ol(t), n = e.child, e = n.sibling, n = Un(n, {
      mode: "visible",
      children: l.children
    }), n.return = t, n.sibling = null, e !== null && (h = t.deletions, h === null ? (t.deletions = [e], t.flags |= 16) : h.push(e)), t.child = n, t.memoizedState = null, n);
  }
  function Nu(e, t) {
    return t = $i(
      { mode: "visible", children: t },
      e.mode
    ), t.return = e, e.child = t;
  }
  function $i(e, t) {
    return e = Jt(22, e, null, t), e.lanes = 0, e;
  }
  function Mu(e, t, n) {
    return Xl(t, e.child, null, n), e = Nu(
      t,
      t.pendingProps.children
    ), e.flags |= 2, t.memoizedState = null, e;
  }
  function Eh(e, t, n) {
    e.lanes |= t;
    var l = e.alternate;
    l !== null && (l.lanes |= t), Yc(e.return, t, n);
  }
  function Tu(e, t, n, l, i, c) {
    var h = e.memoizedState;
    h === null ? e.memoizedState = {
      isBackwards: t,
      rendering: null,
      renderingStartTime: 0,
      last: l,
      tail: n,
      tailMode: i,
      treeForkCount: c
    } : (h.isBackwards = t, h.rendering = null, h.renderingStartTime = 0, h.last = l, h.tail = n, h.tailMode = i, h.treeForkCount = c);
  }
  function Ch(e, t, n) {
    var l = t.pendingProps, i = l.revealOrder, c = l.tail;
    l = l.children;
    var h = ut.current, v = (h & 2) !== 0;
    if (v ? (h = h & 1 | 2, t.flags |= 128) : h &= 1, Y(ut, h), Tt(e, t, l, n), l = Ae ? os : 0, !v && e !== null && (e.flags & 128) !== 0)
      e: for (e = t.child; e !== null; ) {
        if (e.tag === 13)
          e.memoizedState !== null && Eh(e, n, t);
        else if (e.tag === 19)
          Eh(e, n, t);
        else if (e.child !== null) {
          e.child.return = e, e = e.child;
          continue;
        }
        if (e === t) break e;
        for (; e.sibling === null; ) {
          if (e.return === null || e.return === t)
            break e;
          e = e.return;
        }
        e.sibling.return = e.return, e = e.sibling;
      }
    switch (i) {
      case "forwards":
        for (n = t.child, i = null; n !== null; )
          e = n.alternate, e !== null && Ui(e) === null && (i = n), n = n.sibling;
        n = i, n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), Tu(
          t,
          !1,
          i,
          n,
          c,
          l
        );
        break;
      case "backwards":
      case "unstable_legacy-backwards":
        for (n = null, i = t.child, t.child = null; i !== null; ) {
          if (e = i.alternate, e !== null && Ui(e) === null) {
            t.child = i;
            break;
          }
          e = i.sibling, i.sibling = n, n = i, i = e;
        }
        Tu(
          t,
          !0,
          n,
          null,
          c,
          l
        );
        break;
      case "together":
        Tu(
          t,
          !1,
          null,
          null,
          void 0,
          l
        );
        break;
      default:
        t.memoizedState = null;
    }
    return t.child;
  }
  function Xn(e, t, n) {
    if (e !== null && (t.dependencies = e.dependencies), ml |= t.lanes, (n & t.childLanes) === 0)
      if (e !== null) {
        if (va(
          e,
          t,
          n,
          !1
        ), (n & t.childLanes) === 0)
          return null;
      } else return null;
    if (e !== null && t.child !== e.child)
      throw Error(u(153));
    if (t.child !== null) {
      for (e = t.child, n = Un(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; )
        e = e.sibling, n = n.sibling = Un(e, e.pendingProps), n.return = t;
      n.sibling = null;
    }
    return t.child;
  }
  function Eu(e, t) {
    return (e.lanes & t) !== 0 ? !0 : (e = e.dependencies, !!(e !== null && Ci(e)));
  }
  function C1(e, t, n) {
    switch (t.tag) {
      case 3:
        be(t, t.stateNode.containerInfo), il(t, dt, e.memoizedState.cache), Ul();
        break;
      case 27:
      case 5:
        _t(t);
        break;
      case 4:
        be(t, t.stateNode.containerInfo);
        break;
      case 10:
        il(
          t,
          t.type,
          t.memoizedProps.value
        );
        break;
      case 31:
        if (t.memoizedState !== null)
          return t.flags |= 128, Pc(t), null;
        break;
      case 13:
        var l = t.memoizedState;
        if (l !== null)
          return l.dehydrated !== null ? (ol(t), t.flags |= 128, null) : (n & t.child.childLanes) !== 0 ? Th(e, t, n) : (ol(t), e = Xn(
            e,
            t,
            n
          ), e !== null ? e.sibling : null);
        ol(t);
        break;
      case 19:
        var i = (e.flags & 128) !== 0;
        if (l = (n & t.childLanes) !== 0, l || (va(
          e,
          t,
          n,
          !1
        ), l = (n & t.childLanes) !== 0), i) {
          if (l)
            return Ch(
              e,
              t,
              n
            );
          t.flags |= 128;
        }
        if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), Y(ut, ut.current), l) break;
        return null;
      case 22:
        return t.lanes = 0, bh(
          e,
          t,
          n,
          t.pendingProps
        );
      case 24:
        il(t, dt, e.memoizedState.cache);
    }
    return Xn(e, t, n);
  }
  function Ah(e, t, n) {
    if (e !== null)
      if (e.memoizedProps !== t.pendingProps)
        mt = !0;
      else {
        if (!Eu(e, n) && (t.flags & 128) === 0)
          return mt = !1, C1(
            e,
            t,
            n
          );
        mt = (e.flags & 131072) !== 0;
      }
    else
      mt = !1, Ae && (t.flags & 1048576) !== 0 && cd(t, os, t.index);
    switch (t.lanes = 0, t.tag) {
      case 16:
        e: {
          var l = t.pendingProps;
          if (e = Yl(t.elementType), t.type = e, typeof e == "function")
            Rc(e) ? (l = Ql(e, l), t.tag = 1, t = Nh(
              null,
              t,
              e,
              l,
              n
            )) : (t.tag = 0, t = bu(
              null,
              t,
              e,
              l,
              n
            ));
          else {
            if (e != null) {
              var i = e.$$typeof;
              if (i === I) {
                t.tag = 11, t = vh(
                  null,
                  t,
                  e,
                  l,
                  n
                );
                break e;
              } else if (i === F) {
                t.tag = 14, t = xh(
                  null,
                  t,
                  e,
                  l,
                  n
                );
                break e;
              }
            }
            throw t = he(e) || e, Error(u(306, t, ""));
          }
        }
        return t;
      case 0:
        return bu(
          e,
          t,
          t.type,
          t.pendingProps,
          n
        );
      case 1:
        return l = t.type, i = Ql(
          l,
          t.pendingProps
        ), Nh(
          e,
          t,
          l,
          i,
          n
        );
      case 3:
        e: {
          if (be(
            t,
            t.stateNode.containerInfo
          ), e === null) throw Error(u(387));
          l = t.pendingProps;
          var c = t.memoizedState;
          i = c.element, Jc(e, t), vs(t, l, null, n);
          var h = t.memoizedState;
          if (l = h.cache, il(t, dt, l), l !== c.cache && Gc(
            t,
            [dt],
            n,
            !0
          ), ys(), l = h.element, c.isDehydrated)
            if (c = {
              element: l,
              isDehydrated: !1,
              cache: h.cache
            }, t.updateQueue.baseState = c, t.memoizedState = c, t.flags & 256) {
              t = Mh(
                e,
                t,
                l,
                n
              );
              break e;
            } else if (l !== i) {
              i = un(
                Error(u(424)),
                t
              ), fs(i), t = Mh(
                e,
                t,
                l,
                n
              );
              break e;
            } else {
              switch (e = t.stateNode.containerInfo, e.nodeType) {
                case 9:
                  e = e.body;
                  break;
                default:
                  e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
              }
              for (Pe = mn(e.firstChild), Nt = t, Ae = !0, al = null, dn = !0, n = bd(
                t,
                null,
                l,
                n
              ), t.child = n; n; )
                n.flags = n.flags & -3 | 4096, n = n.sibling;
            }
          else {
            if (Ul(), l === i) {
              t = Xn(
                e,
                t,
                n
              );
              break e;
            }
            Tt(e, t, l, n);
          }
          t = t.child;
        }
        return t;
      case 26:
        return Ji(e, t), e === null ? (n = Ym(
          t.type,
          null,
          t.pendingProps,
          null
        )) ? t.memoizedState = n : Ae || (n = t.type, e = t.pendingProps, l = fr(
          Q.current
        ).createElement(n), l[jt] = t, l[Dt] = e, Et(l, n, e), vt(l), t.stateNode = l) : t.memoizedState = Ym(
          t.type,
          e.memoizedProps,
          t.pendingProps,
          e.memoizedState
        ), null;
      case 27:
        return _t(t), e === null && Ae && (l = t.stateNode = Lm(
          t.type,
          t.pendingProps,
          Q.current
        ), Nt = t, dn = !0, i = Pe, xl(t.type) ? (ro = i, Pe = mn(l.firstChild)) : Pe = i), Tt(
          e,
          t,
          t.pendingProps.children,
          n
        ), Ji(e, t), e === null && (t.flags |= 4194304), t.child;
      case 5:
        return e === null && Ae && ((i = l = Pe) && (l = sy(
          l,
          t.type,
          t.pendingProps,
          dn
        ), l !== null ? (t.stateNode = l, Nt = t, Pe = mn(l.firstChild), dn = !1, i = !0) : i = !1), i || sl(t)), _t(t), i = t.type, c = t.pendingProps, h = e !== null ? e.memoizedProps : null, l = c.children, no(i, c) ? l = null : h !== null && no(i, h) && (t.flags |= 32), t.memoizedState !== null && (i = tu(
          e,
          t,
          _1,
          null,
          null,
          n
        ), Ls._currentValue = i), Ji(e, t), Tt(e, t, l, n), t.child;
      case 6:
        return e === null && Ae && ((e = n = Pe) && (n = iy(
          n,
          t.pendingProps,
          dn
        ), n !== null ? (t.stateNode = n, Nt = t, Pe = null, e = !0) : e = !1), e || sl(t)), null;
      case 13:
        return Th(e, t, n);
      case 4:
        return be(
          t,
          t.stateNode.containerInfo
        ), l = t.pendingProps, e === null ? t.child = Xl(
          t,
          null,
          l,
          n
        ) : Tt(e, t, l, n), t.child;
      case 11:
        return vh(
          e,
          t,
          t.type,
          t.pendingProps,
          n
        );
      case 7:
        return Tt(
          e,
          t,
          t.pendingProps,
          n
        ), t.child;
      case 8:
        return Tt(
          e,
          t,
          t.pendingProps.children,
          n
        ), t.child;
      case 12:
        return Tt(
          e,
          t,
          t.pendingProps.children,
          n
        ), t.child;
      case 10:
        return l = t.pendingProps, il(t, t.type, l.value), Tt(e, t, l.children, n), t.child;
      case 9:
        return i = t.type._context, l = t.pendingProps.children, Bl(t), i = Mt(i), l = l(i), t.flags |= 1, Tt(e, t, l, n), t.child;
      case 14:
        return xh(
          e,
          t,
          t.type,
          t.pendingProps,
          n
        );
      case 15:
        return _h(
          e,
          t,
          t.type,
          t.pendingProps,
          n
        );
      case 19:
        return Ch(e, t, n);
      case 31:
        return E1(e, t, n);
      case 22:
        return bh(
          e,
          t,
          n,
          t.pendingProps
        );
      case 24:
        return Bl(t), l = Mt(dt), e === null ? (i = Qc(), i === null && (i = Je, c = Xc(), i.pooledCache = c, c.refCount++, c !== null && (i.pooledCacheLanes |= n), i = c), t.memoizedState = { parent: l, cache: i }, Kc(t), il(t, dt, i)) : ((e.lanes & n) !== 0 && (Jc(e, t), vs(t, null, null, n), ys()), i = e.memoizedState, c = t.memoizedState, i.parent !== l ? (i = { parent: l, cache: l }, t.memoizedState = i, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = i), il(t, dt, l)) : (l = c.cache, il(t, dt, l), l !== i.cache && Gc(
          t,
          [dt],
          n,
          !0
        ))), Tt(
          e,
          t,
          t.pendingProps.children,
          n
        ), t.child;
      case 29:
        throw t.pendingProps;
    }
    throw Error(u(156, t.tag));
  }
  function Vn(e) {
    e.flags |= 4;
  }
  function Cu(e, t, n, l, i) {
    if ((t = (e.mode & 32) !== 0) && (t = !1), t) {
      if (e.flags |= 16777216, (i & 335544128) === i)
        if (e.stateNode.complete) e.flags |= 8192;
        else if (lm()) e.flags |= 8192;
        else
          throw Gl = Ri, Zc;
    } else e.flags &= -16777217;
  }
  function zh(e, t) {
    if (t.type !== "stylesheet" || (t.state.loading & 4) !== 0)
      e.flags &= -16777217;
    else if (e.flags |= 16777216, !Zm(t))
      if (lm()) e.flags |= 8192;
      else
        throw Gl = Ri, Zc;
  }
  function Wi(e, t) {
    t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag !== 22 ? of() : 536870912, e.lanes |= t, Aa |= t);
  }
  function js(e, t) {
    if (!Ae)
      switch (e.tailMode) {
        case "hidden":
          t = e.tail;
          for (var n = null; t !== null; )
            t.alternate !== null && (n = t), t = t.sibling;
          n === null ? e.tail = null : n.sibling = null;
          break;
        case "collapsed":
          n = e.tail;
          for (var l = null; n !== null; )
            n.alternate !== null && (l = n), n = n.sibling;
          l === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : l.sibling = null;
      }
  }
  function et(e) {
    var t = e.alternate !== null && e.alternate.child === e.child, n = 0, l = 0;
    if (t)
      for (var i = e.child; i !== null; )
        n |= i.lanes | i.childLanes, l |= i.subtreeFlags & 65011712, l |= i.flags & 65011712, i.return = e, i = i.sibling;
    else
      for (i = e.child; i !== null; )
        n |= i.lanes | i.childLanes, l |= i.subtreeFlags, l |= i.flags, i.return = e, i = i.sibling;
    return e.subtreeFlags |= l, e.childLanes = n, t;
  }
  function A1(e, t, n) {
    var l = t.pendingProps;
    switch (Uc(t), t.tag) {
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return et(t), null;
      case 1:
        return et(t), null;
      case 3:
        return n = t.stateNode, l = null, e !== null && (l = e.memoizedState.cache), t.memoizedState.cache !== l && (t.flags |= 2048), qn(dt), ze(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (ya(t) ? Vn(t) : e === null || e.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024, Bc())), et(t), null;
      case 26:
        var i = t.type, c = t.memoizedState;
        return e === null ? (Vn(t), c !== null ? (et(t), zh(t, c)) : (et(t), Cu(
          t,
          i,
          null,
          l,
          n
        ))) : c ? c !== e.memoizedState ? (Vn(t), et(t), zh(t, c)) : (et(t), t.flags &= -16777217) : (e = e.memoizedProps, e !== l && Vn(t), et(t), Cu(
          t,
          i,
          e,
          l,
          n
        )), null;
      case 27:
        if (Ze(t), n = Q.current, i = t.type, e !== null && t.stateNode != null)
          e.memoizedProps !== l && Vn(t);
        else {
          if (!l) {
            if (t.stateNode === null)
              throw Error(u(166));
            return et(t), null;
          }
          e = W.current, ya(t) ? od(t) : (e = Lm(i, l, n), t.stateNode = e, Vn(t));
        }
        return et(t), null;
      case 5:
        if (Ze(t), i = t.type, e !== null && t.stateNode != null)
          e.memoizedProps !== l && Vn(t);
        else {
          if (!l) {
            if (t.stateNode === null)
              throw Error(u(166));
            return et(t), null;
          }
          if (c = W.current, ya(t))
            od(t);
          else {
            var h = fr(
              Q.current
            );
            switch (c) {
              case 1:
                c = h.createElementNS(
                  "http://www.w3.org/2000/svg",
                  i
                );
                break;
              case 2:
                c = h.createElementNS(
                  "http://www.w3.org/1998/Math/MathML",
                  i
                );
                break;
              default:
                switch (i) {
                  case "svg":
                    c = h.createElementNS(
                      "http://www.w3.org/2000/svg",
                      i
                    );
                    break;
                  case "math":
                    c = h.createElementNS(
                      "http://www.w3.org/1998/Math/MathML",
                      i
                    );
                    break;
                  case "script":
                    c = h.createElement("div"), c.innerHTML = "<script><\/script>", c = c.removeChild(
                      c.firstChild
                    );
                    break;
                  case "select":
                    c = typeof l.is == "string" ? h.createElement("select", {
                      is: l.is
                    }) : h.createElement("select"), l.multiple ? c.multiple = !0 : l.size && (c.size = l.size);
                    break;
                  default:
                    c = typeof l.is == "string" ? h.createElement(i, { is: l.is }) : h.createElement(i);
                }
            }
            c[jt] = t, c[Dt] = l;
            e: for (h = t.child; h !== null; ) {
              if (h.tag === 5 || h.tag === 6)
                c.appendChild(h.stateNode);
              else if (h.tag !== 4 && h.tag !== 27 && h.child !== null) {
                h.child.return = h, h = h.child;
                continue;
              }
              if (h === t) break e;
              for (; h.sibling === null; ) {
                if (h.return === null || h.return === t)
                  break e;
                h = h.return;
              }
              h.sibling.return = h.return, h = h.sibling;
            }
            t.stateNode = c;
            e: switch (Et(c, i, l), i) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                l = !!l.autoFocus;
                break e;
              case "img":
                l = !0;
                break e;
              default:
                l = !1;
            }
            l && Vn(t);
          }
        }
        return et(t), Cu(
          t,
          t.type,
          e === null ? null : e.memoizedProps,
          t.pendingProps,
          n
        ), null;
      case 6:
        if (e && t.stateNode != null)
          e.memoizedProps !== l && Vn(t);
        else {
          if (typeof l != "string" && t.stateNode === null)
            throw Error(u(166));
          if (e = Q.current, ya(t)) {
            if (e = t.stateNode, n = t.memoizedProps, l = null, i = Nt, i !== null)
              switch (i.tag) {
                case 27:
                case 5:
                  l = i.memoizedProps;
              }
            e[jt] = t, e = !!(e.nodeValue === n || l !== null && l.suppressHydrationWarning === !0 || Tm(e.nodeValue, n)), e || sl(t, !0);
          } else
            e = fr(e).createTextNode(
              l
            ), e[jt] = t, t.stateNode = e;
        }
        return et(t), null;
      case 31:
        if (n = t.memoizedState, e === null || e.memoizedState !== null) {
          if (l = ya(t), n !== null) {
            if (e === null) {
              if (!l) throw Error(u(318));
              if (e = t.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(u(557));
              e[jt] = t;
            } else
              Ul(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            et(t), e = !1;
          } else
            n = Bc(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
          if (!e)
            return t.flags & 256 ? (Wt(t), t) : (Wt(t), null);
          if ((t.flags & 128) !== 0)
            throw Error(u(558));
        }
        return et(t), null;
      case 13:
        if (l = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
          if (i = ya(t), l !== null && l.dehydrated !== null) {
            if (e === null) {
              if (!i) throw Error(u(318));
              if (i = t.memoizedState, i = i !== null ? i.dehydrated : null, !i) throw Error(u(317));
              i[jt] = t;
            } else
              Ul(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            et(t), i = !1;
          } else
            i = Bc(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = i), i = !0;
          if (!i)
            return t.flags & 256 ? (Wt(t), t) : (Wt(t), null);
        }
        return Wt(t), (t.flags & 128) !== 0 ? (t.lanes = n, t) : (n = l !== null, e = e !== null && e.memoizedState !== null, n && (l = t.child, i = null, l.alternate !== null && l.alternate.memoizedState !== null && l.alternate.memoizedState.cachePool !== null && (i = l.alternate.memoizedState.cachePool.pool), c = null, l.memoizedState !== null && l.memoizedState.cachePool !== null && (c = l.memoizedState.cachePool.pool), c !== i && (l.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), Wi(t, t.updateQueue), et(t), null);
      case 4:
        return ze(), e === null && Fu(t.stateNode.containerInfo), et(t), null;
      case 10:
        return qn(t.type), et(t), null;
      case 19:
        if (k(ut), l = t.memoizedState, l === null) return et(t), null;
        if (i = (t.flags & 128) !== 0, c = l.rendering, c === null)
          if (i) js(l, !1);
          else {
            if (rt !== 0 || e !== null && (e.flags & 128) !== 0)
              for (e = t.child; e !== null; ) {
                if (c = Ui(e), c !== null) {
                  for (t.flags |= 128, js(l, !1), e = c.updateQueue, t.updateQueue = e, Wi(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null; )
                    sd(n, e), n = n.sibling;
                  return Y(
                    ut,
                    ut.current & 1 | 2
                  ), Ae && Ln(t, l.treeForkCount), t.child;
                }
                e = e.sibling;
              }
            l.tail !== null && Re() > tr && (t.flags |= 128, i = !0, js(l, !1), t.lanes = 4194304);
          }
        else {
          if (!i)
            if (e = Ui(c), e !== null) {
              if (t.flags |= 128, i = !0, e = e.updateQueue, t.updateQueue = e, Wi(t, e), js(l, !0), l.tail === null && l.tailMode === "hidden" && !c.alternate && !Ae)
                return et(t), null;
            } else
              2 * Re() - l.renderingStartTime > tr && n !== 536870912 && (t.flags |= 128, i = !0, js(l, !1), t.lanes = 4194304);
          l.isBackwards ? (c.sibling = t.child, t.child = c) : (e = l.last, e !== null ? e.sibling = c : t.child = c, l.last = c);
        }
        return l.tail !== null ? (e = l.tail, l.rendering = e, l.tail = e.sibling, l.renderingStartTime = Re(), e.sibling = null, n = ut.current, Y(
          ut,
          i ? n & 1 | 2 : n & 1
        ), Ae && Ln(t, l.treeForkCount), e) : (et(t), null);
      case 22:
      case 23:
        return Wt(t), Ic(), l = t.memoizedState !== null, e !== null ? e.memoizedState !== null !== l && (t.flags |= 8192) : l && (t.flags |= 8192), l ? (n & 536870912) !== 0 && (t.flags & 128) === 0 && (et(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : et(t), n = t.updateQueue, n !== null && Wi(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), l = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (l = t.memoizedState.cachePool.pool), l !== n && (t.flags |= 2048), e !== null && k(ql), null;
      case 24:
        return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), qn(dt), et(t), null;
      case 25:
        return null;
      case 30:
        return null;
    }
    throw Error(u(156, t.tag));
  }
  function z1(e, t) {
    switch (Uc(t), t.tag) {
      case 1:
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 3:
        return qn(dt), ze(), e = t.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (t.flags = e & -65537 | 128, t) : null;
      case 26:
      case 27:
      case 5:
        return Ze(t), null;
      case 31:
        if (t.memoizedState !== null) {
          if (Wt(t), t.alternate === null)
            throw Error(u(340));
          Ul();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 13:
        if (Wt(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
          if (t.alternate === null)
            throw Error(u(340));
          Ul();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 19:
        return k(ut), null;
      case 4:
        return ze(), null;
      case 10:
        return qn(t.type), null;
      case 22:
      case 23:
        return Wt(t), Ic(), e !== null && k(ql), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 24:
        return qn(dt), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function Oh(e, t) {
    switch (Uc(t), t.tag) {
      case 3:
        qn(dt), ze();
        break;
      case 26:
      case 27:
      case 5:
        Ze(t);
        break;
      case 4:
        ze();
        break;
      case 31:
        t.memoizedState !== null && Wt(t);
        break;
      case 13:
        Wt(t);
        break;
      case 19:
        k(ut);
        break;
      case 10:
        qn(t.type);
        break;
      case 22:
      case 23:
        Wt(t), Ic(), e !== null && k(ql);
        break;
      case 24:
        qn(dt);
    }
  }
  function Ns(e, t) {
    try {
      var n = t.updateQueue, l = n !== null ? n.lastEffect : null;
      if (l !== null) {
        var i = l.next;
        n = i;
        do {
          if ((n.tag & e) === e) {
            l = void 0;
            var c = n.create, h = n.inst;
            l = c(), h.destroy = l;
          }
          n = n.next;
        } while (n !== i);
      }
    } catch (v) {
      Ge(t, t.return, v);
    }
  }
  function dl(e, t, n) {
    try {
      var l = t.updateQueue, i = l !== null ? l.lastEffect : null;
      if (i !== null) {
        var c = i.next;
        l = c;
        do {
          if ((l.tag & e) === e) {
            var h = l.inst, v = h.destroy;
            if (v !== void 0) {
              h.destroy = void 0, i = t;
              var w = n, C = v;
              try {
                C();
              } catch (H) {
                Ge(
                  i,
                  w,
                  H
                );
              }
            }
          }
          l = l.next;
        } while (l !== c);
      }
    } catch (H) {
      Ge(t, t.return, H);
    }
  }
  function Rh(e) {
    var t = e.updateQueue;
    if (t !== null) {
      var n = e.stateNode;
      try {
        Sd(t, n);
      } catch (l) {
        Ge(e, e.return, l);
      }
    }
  }
  function kh(e, t, n) {
    n.props = Ql(
      e.type,
      e.memoizedProps
    ), n.state = e.memoizedState;
    try {
      n.componentWillUnmount();
    } catch (l) {
      Ge(e, t, l);
    }
  }
  function Ms(e, t) {
    try {
      var n = e.ref;
      if (n !== null) {
        switch (e.tag) {
          case 26:
          case 27:
          case 5:
            var l = e.stateNode;
            break;
          case 30:
            l = e.stateNode;
            break;
          default:
            l = e.stateNode;
        }
        typeof n == "function" ? e.refCleanup = n(l) : n.current = l;
      }
    } catch (i) {
      Ge(e, t, i);
    }
  }
  function Mn(e, t) {
    var n = e.ref, l = e.refCleanup;
    if (n !== null)
      if (typeof l == "function")
        try {
          l();
        } catch (i) {
          Ge(e, t, i);
        } finally {
          e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
        }
      else if (typeof n == "function")
        try {
          n(null);
        } catch (i) {
          Ge(e, t, i);
        }
      else n.current = null;
  }
  function Dh(e) {
    var t = e.type, n = e.memoizedProps, l = e.stateNode;
    try {
      e: switch (t) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          n.autoFocus && l.focus();
          break e;
        case "img":
          n.src ? l.src = n.src : n.srcSet && (l.srcset = n.srcSet);
      }
    } catch (i) {
      Ge(e, e.return, i);
    }
  }
  function Au(e, t, n) {
    try {
      var l = e.stateNode;
      P1(l, e.type, n, t), l[Dt] = t;
    } catch (i) {
      Ge(e, e.return, i);
    }
  }
  function Hh(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && xl(e.type) || e.tag === 4;
  }
  function zu(e) {
    e: for (; ; ) {
      for (; e.sibling === null; ) {
        if (e.return === null || Hh(e.return)) return null;
        e = e.return;
      }
      for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
        if (e.tag === 27 && xl(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue e;
        e.child.return = e, e = e.child;
      }
      if (!(e.flags & 2)) return e.stateNode;
    }
  }
  function Ou(e, t, n) {
    var l = e.tag;
    if (l === 5 || l === 6)
      e = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(e, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(e), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Dn));
    else if (l !== 4 && (l === 27 && xl(e.type) && (n = e.stateNode, t = null), e = e.child, e !== null))
      for (Ou(e, t, n), e = e.sibling; e !== null; )
        Ou(e, t, n), e = e.sibling;
  }
  function Fi(e, t, n) {
    var l = e.tag;
    if (l === 5 || l === 6)
      e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
    else if (l !== 4 && (l === 27 && xl(e.type) && (n = e.stateNode), e = e.child, e !== null))
      for (Fi(e, t, n), e = e.sibling; e !== null; )
        Fi(e, t, n), e = e.sibling;
  }
  function Uh(e) {
    var t = e.stateNode, n = e.memoizedProps;
    try {
      for (var l = e.type, i = t.attributes; i.length; )
        t.removeAttributeNode(i[0]);
      Et(t, l, n), t[jt] = e, t[Dt] = n;
    } catch (c) {
      Ge(e, e.return, c);
    }
  }
  var Qn = !1, pt = !1, Ru = !1, Lh = typeof WeakSet == "function" ? WeakSet : Set, xt = null;
  function O1(e, t) {
    if (e = e.containerInfo, eo = vr, e = Wf(e), Mc(e)) {
      if ("selectionStart" in e)
        var n = {
          start: e.selectionStart,
          end: e.selectionEnd
        };
      else
        e: {
          n = (n = e.ownerDocument) && n.defaultView || window;
          var l = n.getSelection && n.getSelection();
          if (l && l.rangeCount !== 0) {
            n = l.anchorNode;
            var i = l.anchorOffset, c = l.focusNode;
            l = l.focusOffset;
            try {
              n.nodeType, c.nodeType;
            } catch {
              n = null;
              break e;
            }
            var h = 0, v = -1, w = -1, C = 0, H = 0, q = e, A = null;
            t: for (; ; ) {
              for (var O; q !== n || i !== 0 && q.nodeType !== 3 || (v = h + i), q !== c || l !== 0 && q.nodeType !== 3 || (w = h + l), q.nodeType === 3 && (h += q.nodeValue.length), (O = q.firstChild) !== null; )
                A = q, q = O;
              for (; ; ) {
                if (q === e) break t;
                if (A === n && ++C === i && (v = h), A === c && ++H === l && (w = h), (O = q.nextSibling) !== null) break;
                q = A, A = q.parentNode;
              }
              q = O;
            }
            n = v === -1 || w === -1 ? null : { start: v, end: w };
          } else n = null;
        }
      n = n || { start: 0, end: 0 };
    } else n = null;
    for (to = { focusedElem: e, selectionRange: n }, vr = !1, xt = t; xt !== null; )
      if (t = xt, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null)
        e.return = t, xt = e;
      else
        for (; xt !== null; ) {
          switch (t = xt, c = t.alternate, e = t.flags, t.tag) {
            case 0:
              if ((e & 4) !== 0 && (e = t.updateQueue, e = e !== null ? e.events : null, e !== null))
                for (n = 0; n < e.length; n++)
                  i = e[n], i.ref.impl = i.nextImpl;
              break;
            case 11:
            case 15:
              break;
            case 1:
              if ((e & 1024) !== 0 && c !== null) {
                e = void 0, n = t, i = c.memoizedProps, c = c.memoizedState, l = n.stateNode;
                try {
                  var te = Ql(
                    n.type,
                    i
                  );
                  e = l.getSnapshotBeforeUpdate(
                    te,
                    c
                  ), l.__reactInternalSnapshotBeforeUpdate = e;
                } catch (oe) {
                  Ge(
                    n,
                    n.return,
                    oe
                  );
                }
              }
              break;
            case 3:
              if ((e & 1024) !== 0) {
                if (e = t.stateNode.containerInfo, n = e.nodeType, n === 9)
                  ao(e);
                else if (n === 1)
                  switch (e.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      ao(e);
                      break;
                    default:
                      e.textContent = "";
                  }
              }
              break;
            case 5:
            case 26:
            case 27:
            case 6:
            case 4:
            case 17:
              break;
            default:
              if ((e & 1024) !== 0) throw Error(u(163));
          }
          if (e = t.sibling, e !== null) {
            e.return = t.return, xt = e;
            break;
          }
          xt = t.return;
        }
  }
  function Bh(e, t, n) {
    var l = n.flags;
    switch (n.tag) {
      case 0:
      case 11:
      case 15:
        Kn(e, n), l & 4 && Ns(5, n);
        break;
      case 1:
        if (Kn(e, n), l & 4)
          if (e = n.stateNode, t === null)
            try {
              e.componentDidMount();
            } catch (h) {
              Ge(n, n.return, h);
            }
          else {
            var i = Ql(
              n.type,
              t.memoizedProps
            );
            t = t.memoizedState;
            try {
              e.componentDidUpdate(
                i,
                t,
                e.__reactInternalSnapshotBeforeUpdate
              );
            } catch (h) {
              Ge(
                n,
                n.return,
                h
              );
            }
          }
        l & 64 && Rh(n), l & 512 && Ms(n, n.return);
        break;
      case 3:
        if (Kn(e, n), l & 64 && (e = n.updateQueue, e !== null)) {
          if (t = null, n.child !== null)
            switch (n.child.tag) {
              case 27:
              case 5:
                t = n.child.stateNode;
                break;
              case 1:
                t = n.child.stateNode;
            }
          try {
            Sd(e, t);
          } catch (h) {
            Ge(n, n.return, h);
          }
        }
        break;
      case 27:
        t === null && l & 4 && Uh(n);
      case 26:
      case 5:
        Kn(e, n), t === null && l & 4 && Dh(n), l & 512 && Ms(n, n.return);
        break;
      case 12:
        Kn(e, n);
        break;
      case 31:
        Kn(e, n), l & 4 && Gh(e, n);
        break;
      case 13:
        Kn(e, n), l & 4 && Xh(e, n), l & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = Y1.bind(
          null,
          n
        ), ry(e, n))));
        break;
      case 22:
        if (l = n.memoizedState !== null || Qn, !l) {
          t = t !== null && t.memoizedState !== null || pt, i = Qn;
          var c = pt;
          Qn = l, (pt = t) && !c ? Jn(
            e,
            n,
            (n.subtreeFlags & 8772) !== 0
          ) : Kn(e, n), Qn = i, pt = c;
        }
        break;
      case 30:
        break;
      default:
        Kn(e, n);
    }
  }
  function qh(e) {
    var t = e.alternate;
    t !== null && (e.alternate = null, qh(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && uc(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
  }
  var lt = null, Ut = !1;
  function Zn(e, t, n) {
    for (n = n.child; n !== null; )
      Yh(e, t, n), n = n.sibling;
  }
  function Yh(e, t, n) {
    if (Be && typeof Be.onCommitFiberUnmount == "function")
      try {
        Be.onCommitFiberUnmount(Fe, n);
      } catch {
      }
    switch (n.tag) {
      case 26:
        pt || Mn(n, t), Zn(
          e,
          t,
          n
        ), n.memoizedState ? n.memoizedState.count-- : n.stateNode && (n = n.stateNode, n.parentNode.removeChild(n));
        break;
      case 27:
        pt || Mn(n, t);
        var l = lt, i = Ut;
        xl(n.type) && (lt = n.stateNode, Ut = !1), Zn(
          e,
          t,
          n
        ), Ds(n.stateNode), lt = l, Ut = i;
        break;
      case 5:
        pt || Mn(n, t);
      case 6:
        if (l = lt, i = Ut, lt = null, Zn(
          e,
          t,
          n
        ), lt = l, Ut = i, lt !== null)
          if (Ut)
            try {
              (lt.nodeType === 9 ? lt.body : lt.nodeName === "HTML" ? lt.ownerDocument.body : lt).removeChild(n.stateNode);
            } catch (c) {
              Ge(
                n,
                t,
                c
              );
            }
          else
            try {
              lt.removeChild(n.stateNode);
            } catch (c) {
              Ge(
                n,
                t,
                c
              );
            }
        break;
      case 18:
        lt !== null && (Ut ? (e = lt, Rm(
          e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e,
          n.stateNode
        ), La(e)) : Rm(lt, n.stateNode));
        break;
      case 4:
        l = lt, i = Ut, lt = n.stateNode.containerInfo, Ut = !0, Zn(
          e,
          t,
          n
        ), lt = l, Ut = i;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        dl(2, n, t), pt || dl(4, n, t), Zn(
          e,
          t,
          n
        );
        break;
      case 1:
        pt || (Mn(n, t), l = n.stateNode, typeof l.componentWillUnmount == "function" && kh(
          n,
          t,
          l
        )), Zn(
          e,
          t,
          n
        );
        break;
      case 21:
        Zn(
          e,
          t,
          n
        );
        break;
      case 22:
        pt = (l = pt) || n.memoizedState !== null, Zn(
          e,
          t,
          n
        ), pt = l;
        break;
      default:
        Zn(
          e,
          t,
          n
        );
    }
  }
  function Gh(e, t) {
    if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
      e = e.dehydrated;
      try {
        La(e);
      } catch (n) {
        Ge(t, t.return, n);
      }
    }
  }
  function Xh(e, t) {
    if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null))))
      try {
        La(e);
      } catch (n) {
        Ge(t, t.return, n);
      }
  }
  function R1(e) {
    switch (e.tag) {
      case 31:
      case 13:
      case 19:
        var t = e.stateNode;
        return t === null && (t = e.stateNode = new Lh()), t;
      case 22:
        return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new Lh()), t;
      default:
        throw Error(u(435, e.tag));
    }
  }
  function Ii(e, t) {
    var n = R1(e);
    t.forEach(function(l) {
      if (!n.has(l)) {
        n.add(l);
        var i = G1.bind(null, e, l);
        l.then(i, i);
      }
    });
  }
  function Lt(e, t) {
    var n = t.deletions;
    if (n !== null)
      for (var l = 0; l < n.length; l++) {
        var i = n[l], c = e, h = t, v = h;
        e: for (; v !== null; ) {
          switch (v.tag) {
            case 27:
              if (xl(v.type)) {
                lt = v.stateNode, Ut = !1;
                break e;
              }
              break;
            case 5:
              lt = v.stateNode, Ut = !1;
              break e;
            case 3:
            case 4:
              lt = v.stateNode.containerInfo, Ut = !0;
              break e;
          }
          v = v.return;
        }
        if (lt === null) throw Error(u(160));
        Yh(c, h, i), lt = null, Ut = !1, c = i.alternate, c !== null && (c.return = null), i.return = null;
      }
    if (t.subtreeFlags & 13886)
      for (t = t.child; t !== null; )
        Vh(t, e), t = t.sibling;
  }
  var vn = null;
  function Vh(e, t) {
    var n = e.alternate, l = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        Lt(t, e), Bt(e), l & 4 && (dl(3, e, e.return), Ns(3, e), dl(5, e, e.return));
        break;
      case 1:
        Lt(t, e), Bt(e), l & 512 && (pt || n === null || Mn(n, n.return)), l & 64 && Qn && (e = e.updateQueue, e !== null && (l = e.callbacks, l !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? l : n.concat(l))));
        break;
      case 26:
        var i = vn;
        if (Lt(t, e), Bt(e), l & 512 && (pt || n === null || Mn(n, n.return)), l & 4) {
          var c = n !== null ? n.memoizedState : null;
          if (l = e.memoizedState, n === null)
            if (l === null)
              if (e.stateNode === null) {
                e: {
                  l = e.type, n = e.memoizedProps, i = i.ownerDocument || i;
                  t: switch (l) {
                    case "title":
                      c = i.getElementsByTagName("title")[0], (!c || c[Pa] || c[jt] || c.namespaceURI === "http://www.w3.org/2000/svg" || c.hasAttribute("itemprop")) && (c = i.createElement(l), i.head.insertBefore(
                        c,
                        i.querySelector("head > title")
                      )), Et(c, l, n), c[jt] = e, vt(c), l = c;
                      break e;
                    case "link":
                      var h = Vm(
                        "link",
                        "href",
                        i
                      ).get(l + (n.href || ""));
                      if (h) {
                        for (var v = 0; v < h.length; v++)
                          if (c = h[v], c.getAttribute("href") === (n.href == null || n.href === "" ? null : n.href) && c.getAttribute("rel") === (n.rel == null ? null : n.rel) && c.getAttribute("title") === (n.title == null ? null : n.title) && c.getAttribute("crossorigin") === (n.crossOrigin == null ? null : n.crossOrigin)) {
                            h.splice(v, 1);
                            break t;
                          }
                      }
                      c = i.createElement(l), Et(c, l, n), i.head.appendChild(c);
                      break;
                    case "meta":
                      if (h = Vm(
                        "meta",
                        "content",
                        i
                      ).get(l + (n.content || ""))) {
                        for (v = 0; v < h.length; v++)
                          if (c = h[v], c.getAttribute("content") === (n.content == null ? null : "" + n.content) && c.getAttribute("name") === (n.name == null ? null : n.name) && c.getAttribute("property") === (n.property == null ? null : n.property) && c.getAttribute("http-equiv") === (n.httpEquiv == null ? null : n.httpEquiv) && c.getAttribute("charset") === (n.charSet == null ? null : n.charSet)) {
                            h.splice(v, 1);
                            break t;
                          }
                      }
                      c = i.createElement(l), Et(c, l, n), i.head.appendChild(c);
                      break;
                    default:
                      throw Error(u(468, l));
                  }
                  c[jt] = e, vt(c), l = c;
                }
                e.stateNode = l;
              } else
                Qm(
                  i,
                  e.type,
                  e.stateNode
                );
            else
              e.stateNode = Xm(
                i,
                l,
                e.memoizedProps
              );
          else
            c !== l ? (c === null ? n.stateNode !== null && (n = n.stateNode, n.parentNode.removeChild(n)) : c.count--, l === null ? Qm(
              i,
              e.type,
              e.stateNode
            ) : Xm(
              i,
              l,
              e.memoizedProps
            )) : l === null && e.stateNode !== null && Au(
              e,
              e.memoizedProps,
              n.memoizedProps
            );
        }
        break;
      case 27:
        Lt(t, e), Bt(e), l & 512 && (pt || n === null || Mn(n, n.return)), n !== null && l & 4 && Au(
          e,
          e.memoizedProps,
          n.memoizedProps
        );
        break;
      case 5:
        if (Lt(t, e), Bt(e), l & 512 && (pt || n === null || Mn(n, n.return)), e.flags & 32) {
          i = e.stateNode;
          try {
            ra(i, "");
          } catch (te) {
            Ge(e, e.return, te);
          }
        }
        l & 4 && e.stateNode != null && (i = e.memoizedProps, Au(
          e,
          i,
          n !== null ? n.memoizedProps : i
        )), l & 1024 && (Ru = !0);
        break;
      case 6:
        if (Lt(t, e), Bt(e), l & 4) {
          if (e.stateNode === null)
            throw Error(u(162));
          l = e.memoizedProps, n = e.stateNode;
          try {
            n.nodeValue = l;
          } catch (te) {
            Ge(e, e.return, te);
          }
        }
        break;
      case 3:
        if (mr = null, i = vn, vn = dr(t.containerInfo), Lt(t, e), vn = i, Bt(e), l & 4 && n !== null && n.memoizedState.isDehydrated)
          try {
            La(t.containerInfo);
          } catch (te) {
            Ge(e, e.return, te);
          }
        Ru && (Ru = !1, Qh(e));
        break;
      case 4:
        l = vn, vn = dr(
          e.stateNode.containerInfo
        ), Lt(t, e), Bt(e), vn = l;
        break;
      case 12:
        Lt(t, e), Bt(e);
        break;
      case 31:
        Lt(t, e), Bt(e), l & 4 && (l = e.updateQueue, l !== null && (e.updateQueue = null, Ii(e, l)));
        break;
      case 13:
        Lt(t, e), Bt(e), e.child.flags & 8192 && e.memoizedState !== null != (n !== null && n.memoizedState !== null) && (er = Re()), l & 4 && (l = e.updateQueue, l !== null && (e.updateQueue = null, Ii(e, l)));
        break;
      case 22:
        i = e.memoizedState !== null;
        var w = n !== null && n.memoizedState !== null, C = Qn, H = pt;
        if (Qn = C || i, pt = H || w, Lt(t, e), pt = H, Qn = C, Bt(e), l & 8192)
          e: for (t = e.stateNode, t._visibility = i ? t._visibility & -2 : t._visibility | 1, i && (n === null || w || Qn || pt || Zl(e)), n = null, t = e; ; ) {
            if (t.tag === 5 || t.tag === 26) {
              if (n === null) {
                w = n = t;
                try {
                  if (c = w.stateNode, i)
                    h = c.style, typeof h.setProperty == "function" ? h.setProperty("display", "none", "important") : h.display = "none";
                  else {
                    v = w.stateNode;
                    var q = w.memoizedProps.style, A = q != null && q.hasOwnProperty("display") ? q.display : null;
                    v.style.display = A == null || typeof A == "boolean" ? "" : ("" + A).trim();
                  }
                } catch (te) {
                  Ge(w, w.return, te);
                }
              }
            } else if (t.tag === 6) {
              if (n === null) {
                w = t;
                try {
                  w.stateNode.nodeValue = i ? "" : w.memoizedProps;
                } catch (te) {
                  Ge(w, w.return, te);
                }
              }
            } else if (t.tag === 18) {
              if (n === null) {
                w = t;
                try {
                  var O = w.stateNode;
                  i ? km(O, !0) : km(w.stateNode, !1);
                } catch (te) {
                  Ge(w, w.return, te);
                }
              }
            } else if ((t.tag !== 22 && t.tag !== 23 || t.memoizedState === null || t === e) && t.child !== null) {
              t.child.return = t, t = t.child;
              continue;
            }
            if (t === e) break e;
            for (; t.sibling === null; ) {
              if (t.return === null || t.return === e) break e;
              n === t && (n = null), t = t.return;
            }
            n === t && (n = null), t.sibling.return = t.return, t = t.sibling;
          }
        l & 4 && (l = e.updateQueue, l !== null && (n = l.retryQueue, n !== null && (l.retryQueue = null, Ii(e, n))));
        break;
      case 19:
        Lt(t, e), Bt(e), l & 4 && (l = e.updateQueue, l !== null && (e.updateQueue = null, Ii(e, l)));
        break;
      case 30:
        break;
      case 21:
        break;
      default:
        Lt(t, e), Bt(e);
    }
  }
  function Bt(e) {
    var t = e.flags;
    if (t & 2) {
      try {
        for (var n, l = e.return; l !== null; ) {
          if (Hh(l)) {
            n = l;
            break;
          }
          l = l.return;
        }
        if (n == null) throw Error(u(160));
        switch (n.tag) {
          case 27:
            var i = n.stateNode, c = zu(e);
            Fi(e, c, i);
            break;
          case 5:
            var h = n.stateNode;
            n.flags & 32 && (ra(h, ""), n.flags &= -33);
            var v = zu(e);
            Fi(e, v, h);
            break;
          case 3:
          case 4:
            var w = n.stateNode.containerInfo, C = zu(e);
            Ou(
              e,
              C,
              w
            );
            break;
          default:
            throw Error(u(161));
        }
      } catch (H) {
        Ge(e, e.return, H);
      }
      e.flags &= -3;
    }
    t & 4096 && (e.flags &= -4097);
  }
  function Qh(e) {
    if (e.subtreeFlags & 1024)
      for (e = e.child; e !== null; ) {
        var t = e;
        Qh(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), e = e.sibling;
      }
  }
  function Kn(e, t) {
    if (t.subtreeFlags & 8772)
      for (t = t.child; t !== null; )
        Bh(e, t.alternate, t), t = t.sibling;
  }
  function Zl(e) {
    for (e = e.child; e !== null; ) {
      var t = e;
      switch (t.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          dl(4, t, t.return), Zl(t);
          break;
        case 1:
          Mn(t, t.return);
          var n = t.stateNode;
          typeof n.componentWillUnmount == "function" && kh(
            t,
            t.return,
            n
          ), Zl(t);
          break;
        case 27:
          Ds(t.stateNode);
        case 26:
        case 5:
          Mn(t, t.return), Zl(t);
          break;
        case 22:
          t.memoizedState === null && Zl(t);
          break;
        case 30:
          Zl(t);
          break;
        default:
          Zl(t);
      }
      e = e.sibling;
    }
  }
  function Jn(e, t, n) {
    for (n = n && (t.subtreeFlags & 8772) !== 0, t = t.child; t !== null; ) {
      var l = t.alternate, i = e, c = t, h = c.flags;
      switch (c.tag) {
        case 0:
        case 11:
        case 15:
          Jn(
            i,
            c,
            n
          ), Ns(4, c);
          break;
        case 1:
          if (Jn(
            i,
            c,
            n
          ), l = c, i = l.stateNode, typeof i.componentDidMount == "function")
            try {
              i.componentDidMount();
            } catch (C) {
              Ge(l, l.return, C);
            }
          if (l = c, i = l.updateQueue, i !== null) {
            var v = l.stateNode;
            try {
              var w = i.shared.hiddenCallbacks;
              if (w !== null)
                for (i.shared.hiddenCallbacks = null, i = 0; i < w.length; i++)
                  wd(w[i], v);
            } catch (C) {
              Ge(l, l.return, C);
            }
          }
          n && h & 64 && Rh(c), Ms(c, c.return);
          break;
        case 27:
          Uh(c);
        case 26:
        case 5:
          Jn(
            i,
            c,
            n
          ), n && l === null && h & 4 && Dh(c), Ms(c, c.return);
          break;
        case 12:
          Jn(
            i,
            c,
            n
          );
          break;
        case 31:
          Jn(
            i,
            c,
            n
          ), n && h & 4 && Gh(i, c);
          break;
        case 13:
          Jn(
            i,
            c,
            n
          ), n && h & 4 && Xh(i, c);
          break;
        case 22:
          c.memoizedState === null && Jn(
            i,
            c,
            n
          ), Ms(c, c.return);
          break;
        case 30:
          break;
        default:
          Jn(
            i,
            c,
            n
          );
      }
      t = t.sibling;
    }
  }
  function ku(e, t) {
    var n = null;
    e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && ds(n));
  }
  function Du(e, t) {
    e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && ds(e));
  }
  function xn(e, t, n, l) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; )
        Zh(
          e,
          t,
          n,
          l
        ), t = t.sibling;
  }
  function Zh(e, t, n, l) {
    var i = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 15:
        xn(
          e,
          t,
          n,
          l
        ), i & 2048 && Ns(9, t);
        break;
      case 1:
        xn(
          e,
          t,
          n,
          l
        );
        break;
      case 3:
        xn(
          e,
          t,
          n,
          l
        ), i & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && ds(e)));
        break;
      case 12:
        if (i & 2048) {
          xn(
            e,
            t,
            n,
            l
          ), e = t.stateNode;
          try {
            var c = t.memoizedProps, h = c.id, v = c.onPostCommit;
            typeof v == "function" && v(
              h,
              t.alternate === null ? "mount" : "update",
              e.passiveEffectDuration,
              -0
            );
          } catch (w) {
            Ge(t, t.return, w);
          }
        } else
          xn(
            e,
            t,
            n,
            l
          );
        break;
      case 31:
        xn(
          e,
          t,
          n,
          l
        );
        break;
      case 13:
        xn(
          e,
          t,
          n,
          l
        );
        break;
      case 23:
        break;
      case 22:
        c = t.stateNode, h = t.alternate, t.memoizedState !== null ? c._visibility & 2 ? xn(
          e,
          t,
          n,
          l
        ) : Ts(e, t) : c._visibility & 2 ? xn(
          e,
          t,
          n,
          l
        ) : (c._visibility |= 2, Ta(
          e,
          t,
          n,
          l,
          (t.subtreeFlags & 10256) !== 0 || !1
        )), i & 2048 && ku(h, t);
        break;
      case 24:
        xn(
          e,
          t,
          n,
          l
        ), i & 2048 && Du(t.alternate, t);
        break;
      default:
        xn(
          e,
          t,
          n,
          l
        );
    }
  }
  function Ta(e, t, n, l, i) {
    for (i = i && ((t.subtreeFlags & 10256) !== 0 || !1), t = t.child; t !== null; ) {
      var c = e, h = t, v = n, w = l, C = h.flags;
      switch (h.tag) {
        case 0:
        case 11:
        case 15:
          Ta(
            c,
            h,
            v,
            w,
            i
          ), Ns(8, h);
          break;
        case 23:
          break;
        case 22:
          var H = h.stateNode;
          h.memoizedState !== null ? H._visibility & 2 ? Ta(
            c,
            h,
            v,
            w,
            i
          ) : Ts(
            c,
            h
          ) : (H._visibility |= 2, Ta(
            c,
            h,
            v,
            w,
            i
          )), i && C & 2048 && ku(
            h.alternate,
            h
          );
          break;
        case 24:
          Ta(
            c,
            h,
            v,
            w,
            i
          ), i && C & 2048 && Du(h.alternate, h);
          break;
        default:
          Ta(
            c,
            h,
            v,
            w,
            i
          );
      }
      t = t.sibling;
    }
  }
  function Ts(e, t) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; ) {
        var n = e, l = t, i = l.flags;
        switch (l.tag) {
          case 22:
            Ts(n, l), i & 2048 && ku(
              l.alternate,
              l
            );
            break;
          case 24:
            Ts(n, l), i & 2048 && Du(l.alternate, l);
            break;
          default:
            Ts(n, l);
        }
        t = t.sibling;
      }
  }
  var Es = 8192;
  function Ea(e, t, n) {
    if (e.subtreeFlags & Es)
      for (e = e.child; e !== null; )
        Kh(
          e,
          t,
          n
        ), e = e.sibling;
  }
  function Kh(e, t, n) {
    switch (e.tag) {
      case 26:
        Ea(
          e,
          t,
          n
        ), e.flags & Es && e.memoizedState !== null && xy(
          n,
          vn,
          e.memoizedState,
          e.memoizedProps
        );
        break;
      case 5:
        Ea(
          e,
          t,
          n
        );
        break;
      case 3:
      case 4:
        var l = vn;
        vn = dr(e.stateNode.containerInfo), Ea(
          e,
          t,
          n
        ), vn = l;
        break;
      case 22:
        e.memoizedState === null && (l = e.alternate, l !== null && l.memoizedState !== null ? (l = Es, Es = 16777216, Ea(
          e,
          t,
          n
        ), Es = l) : Ea(
          e,
          t,
          n
        ));
        break;
      default:
        Ea(
          e,
          t,
          n
        );
    }
  }
  function Jh(e) {
    var t = e.alternate;
    if (t !== null && (e = t.child, e !== null)) {
      t.child = null;
      do
        t = e.sibling, e.sibling = null, e = t;
      while (e !== null);
    }
  }
  function Cs(e) {
    var t = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (t !== null)
        for (var n = 0; n < t.length; n++) {
          var l = t[n];
          xt = l, Wh(
            l,
            e
          );
        }
      Jh(e);
    }
    if (e.subtreeFlags & 10256)
      for (e = e.child; e !== null; )
        $h(e), e = e.sibling;
  }
  function $h(e) {
    switch (e.tag) {
      case 0:
      case 11:
      case 15:
        Cs(e), e.flags & 2048 && dl(9, e, e.return);
        break;
      case 3:
        Cs(e);
        break;
      case 12:
        Cs(e);
        break;
      case 22:
        var t = e.stateNode;
        e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Pi(e)) : Cs(e);
        break;
      default:
        Cs(e);
    }
  }
  function Pi(e) {
    var t = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (t !== null)
        for (var n = 0; n < t.length; n++) {
          var l = t[n];
          xt = l, Wh(
            l,
            e
          );
        }
      Jh(e);
    }
    for (e = e.child; e !== null; ) {
      switch (t = e, t.tag) {
        case 0:
        case 11:
        case 15:
          dl(8, t, t.return), Pi(t);
          break;
        case 22:
          n = t.stateNode, n._visibility & 2 && (n._visibility &= -3, Pi(t));
          break;
        default:
          Pi(t);
      }
      e = e.sibling;
    }
  }
  function Wh(e, t) {
    for (; xt !== null; ) {
      var n = xt;
      switch (n.tag) {
        case 0:
        case 11:
        case 15:
          dl(8, n, t);
          break;
        case 23:
        case 22:
          if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
            var l = n.memoizedState.cachePool.pool;
            l != null && l.refCount++;
          }
          break;
        case 24:
          ds(n.memoizedState.cache);
      }
      if (l = n.child, l !== null) l.return = n, xt = l;
      else
        e: for (n = e; xt !== null; ) {
          l = xt;
          var i = l.sibling, c = l.return;
          if (qh(l), l === n) {
            xt = null;
            break e;
          }
          if (i !== null) {
            i.return = c, xt = i;
            break e;
          }
          xt = c;
        }
    }
  }
  var k1 = {
    getCacheForType: function(e) {
      var t = Mt(dt), n = t.data.get(e);
      return n === void 0 && (n = e(), t.data.set(e, n)), n;
    },
    cacheSignal: function() {
      return Mt(dt).controller.signal;
    }
  }, D1 = typeof WeakMap == "function" ? WeakMap : Map, qe = 0, Je = null, Me = null, Ee = 0, Ye = 0, Ft = null, hl = !1, Ca = !1, Hu = !1, $n = 0, rt = 0, ml = 0, Kl = 0, Uu = 0, It = 0, Aa = 0, As = null, qt = null, Lu = !1, er = 0, Fh = 0, tr = 1 / 0, nr = null, pl = null, gt = 0, gl = null, za = null, Wn = 0, Bu = 0, qu = null, Ih = null, zs = 0, Yu = null;
  function Pt() {
    return (qe & 2) !== 0 && Ee !== 0 ? Ee & -Ee : z.T !== null ? Ku() : mf();
  }
  function Ph() {
    if (It === 0)
      if ((Ee & 536870912) === 0 || Ae) {
        var e = Cl;
        Cl <<= 1, (Cl & 3932160) === 0 && (Cl = 262144), It = e;
      } else It = 536870912;
    return e = $t.current, e !== null && (e.flags |= 32), It;
  }
  function Yt(e, t, n) {
    (e === Je && (Ye === 2 || Ye === 9) || e.cancelPendingCommit !== null) && (Oa(e, 0), yl(
      e,
      Ee,
      It,
      !1
    )), Ia(e, n), ((qe & 2) === 0 || e !== Je) && (e === Je && ((qe & 2) === 0 && (Kl |= n), rt === 4 && yl(
      e,
      Ee,
      It,
      !1
    )), Tn(e));
  }
  function em(e, t, n) {
    if ((qe & 6) !== 0) throw Error(u(327));
    var l = !n && (t & 127) === 0 && (t & e.expiredLanes) === 0 || Fa(e, t), i = l ? L1(e, t) : Xu(e, t, !0), c = l;
    do {
      if (i === 0) {
        Ca && !l && yl(e, t, 0, !1);
        break;
      } else {
        if (n = e.current.alternate, c && !H1(n)) {
          i = Xu(e, t, !1), c = !1;
          continue;
        }
        if (i === 2) {
          if (c = t, e.errorRecoveryDisabledLanes & c)
            var h = 0;
          else
            h = e.pendingLanes & -536870913, h = h !== 0 ? h : h & 536870912 ? 536870912 : 0;
          if (h !== 0) {
            t = h;
            e: {
              var v = e;
              i = As;
              var w = v.current.memoizedState.isDehydrated;
              if (w && (Oa(v, h).flags |= 256), h = Xu(
                v,
                h,
                !1
              ), h !== 2) {
                if (Hu && !w) {
                  v.errorRecoveryDisabledLanes |= c, Kl |= c, i = 4;
                  break e;
                }
                c = qt, qt = i, c !== null && (qt === null ? qt = c : qt.push.apply(
                  qt,
                  c
                ));
              }
              i = h;
            }
            if (c = !1, i !== 2) continue;
          }
        }
        if (i === 1) {
          Oa(e, 0), yl(e, t, 0, !0);
          break;
        }
        e: {
          switch (l = e, c = i, c) {
            case 0:
            case 1:
              throw Error(u(345));
            case 4:
              if ((t & 4194048) !== t) break;
            case 6:
              yl(
                l,
                t,
                It,
                !hl
              );
              break e;
            case 2:
              qt = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(u(329));
          }
          if ((t & 62914560) === t && (i = er + 300 - Re(), 10 < i)) {
            if (yl(
              l,
              t,
              It,
              !hl
            ), an(l, 0, !0) !== 0) break e;
            Wn = t, l.timeoutHandle = zm(
              tm.bind(
                null,
                l,
                n,
                qt,
                nr,
                Lu,
                t,
                It,
                Kl,
                Aa,
                hl,
                c,
                "Throttled",
                -0,
                0
              ),
              i
            );
            break e;
          }
          tm(
            l,
            n,
            qt,
            nr,
            Lu,
            t,
            It,
            Kl,
            Aa,
            hl,
            c,
            null,
            -0,
            0
          );
        }
      }
      break;
    } while (!0);
    Tn(e);
  }
  function tm(e, t, n, l, i, c, h, v, w, C, H, q, A, O) {
    if (e.timeoutHandle = -1, q = t.subtreeFlags, q & 8192 || (q & 16785408) === 16785408) {
      q = {
        stylesheets: null,
        count: 0,
        imgCount: 0,
        imgBytes: 0,
        suspenseyImages: [],
        waitingForImages: !0,
        waitingForViewTransition: !1,
        unsuspend: Dn
      }, Kh(
        t,
        c,
        q
      );
      var te = (c & 62914560) === c ? er - Re() : (c & 4194048) === c ? Fh - Re() : 0;
      if (te = _y(
        q,
        te
      ), te !== null) {
        Wn = c, e.cancelPendingCommit = te(
          um.bind(
            null,
            e,
            t,
            c,
            n,
            l,
            i,
            h,
            v,
            w,
            H,
            q,
            null,
            A,
            O
          )
        ), yl(e, c, h, !C);
        return;
      }
    }
    um(
      e,
      t,
      c,
      n,
      l,
      i,
      h,
      v,
      w
    );
  }
  function H1(e) {
    for (var t = e; ; ) {
      var n = t.tag;
      if ((n === 0 || n === 11 || n === 15) && t.flags & 16384 && (n = t.updateQueue, n !== null && (n = n.stores, n !== null)))
        for (var l = 0; l < n.length; l++) {
          var i = n[l], c = i.getSnapshot;
          i = i.value;
          try {
            if (!Kt(c(), i)) return !1;
          } catch {
            return !1;
          }
        }
      if (n = t.child, t.subtreeFlags & 16384 && n !== null)
        n.return = t, t = n;
      else {
        if (t === e) break;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === e) return !0;
          t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
      }
    }
    return !0;
  }
  function yl(e, t, n, l) {
    t &= ~Uu, t &= ~Kl, e.suspendedLanes |= t, e.pingedLanes &= ~t, l && (e.warmLanes |= t), l = e.expirationTimes;
    for (var i = t; 0 < i; ) {
      var c = 31 - zt(i), h = 1 << c;
      l[c] = -1, i &= ~h;
    }
    n !== 0 && ff(e, n, t);
  }
  function lr() {
    return (qe & 6) === 0 ? (Os(0), !1) : !0;
  }
  function Gu() {
    if (Me !== null) {
      if (Ye === 0)
        var e = Me.return;
      else
        e = Me, Bn = Ll = null, au(e), wa = null, ms = 0, e = Me;
      for (; e !== null; )
        Oh(e.alternate, e), e = e.return;
      Me = null;
    }
  }
  function Oa(e, t) {
    var n = e.timeoutHandle;
    n !== -1 && (e.timeoutHandle = -1, ny(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), Wn = 0, Gu(), Je = e, Me = n = Un(e.current, null), Ee = t, Ye = 0, Ft = null, hl = !1, Ca = Fa(e, t), Hu = !1, Aa = It = Uu = Kl = ml = rt = 0, qt = As = null, Lu = !1, (t & 8) !== 0 && (t |= t & 32);
    var l = e.entangledLanes;
    if (l !== 0)
      for (e = e.entanglements, l &= t; 0 < l; ) {
        var i = 31 - zt(l), c = 1 << i;
        t |= e[i], l &= ~c;
      }
    return $n = t, ji(), n;
  }
  function nm(e, t) {
    ve = null, z.H = ws, t === ba || t === Oi ? (t = vd(), Ye = 3) : t === Zc ? (t = vd(), Ye = 4) : Ye = t === _u ? 8 : t !== null && typeof t == "object" && typeof t.then == "function" ? 6 : 1, Ft = t, Me === null && (rt = 1, Zi(
      e,
      un(t, e.current)
    ));
  }
  function lm() {
    var e = $t.current;
    return e === null ? !0 : (Ee & 4194048) === Ee ? hn === null : (Ee & 62914560) === Ee || (Ee & 536870912) !== 0 ? e === hn : !1;
  }
  function am() {
    var e = z.H;
    return z.H = ws, e === null ? ws : e;
  }
  function sm() {
    var e = z.A;
    return z.A = k1, e;
  }
  function ar() {
    rt = 4, hl || (Ee & 4194048) !== Ee && $t.current !== null || (Ca = !0), (ml & 134217727) === 0 && (Kl & 134217727) === 0 || Je === null || yl(
      Je,
      Ee,
      It,
      !1
    );
  }
  function Xu(e, t, n) {
    var l = qe;
    qe |= 2;
    var i = am(), c = sm();
    (Je !== e || Ee !== t) && (nr = null, Oa(e, t)), t = !1;
    var h = rt;
    e: do
      try {
        if (Ye !== 0 && Me !== null) {
          var v = Me, w = Ft;
          switch (Ye) {
            case 8:
              Gu(), h = 6;
              break e;
            case 3:
            case 2:
            case 9:
            case 6:
              $t.current === null && (t = !0);
              var C = Ye;
              if (Ye = 0, Ft = null, Ra(e, v, w, C), n && Ca) {
                h = 0;
                break e;
              }
              break;
            default:
              C = Ye, Ye = 0, Ft = null, Ra(e, v, w, C);
          }
        }
        U1(), h = rt;
        break;
      } catch (H) {
        nm(e, H);
      }
    while (!0);
    return t && e.shellSuspendCounter++, Bn = Ll = null, qe = l, z.H = i, z.A = c, Me === null && (Je = null, Ee = 0, ji()), h;
  }
  function U1() {
    for (; Me !== null; ) im(Me);
  }
  function L1(e, t) {
    var n = qe;
    qe |= 2;
    var l = am(), i = sm();
    Je !== e || Ee !== t ? (nr = null, tr = Re() + 500, Oa(e, t)) : Ca = Fa(
      e,
      t
    );
    e: do
      try {
        if (Ye !== 0 && Me !== null) {
          t = Me;
          var c = Ft;
          t: switch (Ye) {
            case 1:
              Ye = 0, Ft = null, Ra(e, t, c, 1);
              break;
            case 2:
            case 9:
              if (gd(c)) {
                Ye = 0, Ft = null, rm(t);
                break;
              }
              t = function() {
                Ye !== 2 && Ye !== 9 || Je !== e || (Ye = 7), Tn(e);
              }, c.then(t, t);
              break e;
            case 3:
              Ye = 7;
              break e;
            case 4:
              Ye = 5;
              break e;
            case 7:
              gd(c) ? (Ye = 0, Ft = null, rm(t)) : (Ye = 0, Ft = null, Ra(e, t, c, 7));
              break;
            case 5:
              var h = null;
              switch (Me.tag) {
                case 26:
                  h = Me.memoizedState;
                case 5:
                case 27:
                  var v = Me;
                  if (h ? Zm(h) : v.stateNode.complete) {
                    Ye = 0, Ft = null;
                    var w = v.sibling;
                    if (w !== null) Me = w;
                    else {
                      var C = v.return;
                      C !== null ? (Me = C, sr(C)) : Me = null;
                    }
                    break t;
                  }
              }
              Ye = 0, Ft = null, Ra(e, t, c, 5);
              break;
            case 6:
              Ye = 0, Ft = null, Ra(e, t, c, 6);
              break;
            case 8:
              Gu(), rt = 6;
              break e;
            default:
              throw Error(u(462));
          }
        }
        B1();
        break;
      } catch (H) {
        nm(e, H);
      }
    while (!0);
    return Bn = Ll = null, z.H = l, z.A = i, qe = n, Me !== null ? 0 : (Je = null, Ee = 0, ji(), rt);
  }
  function B1() {
    for (; Me !== null && !At(); )
      im(Me);
  }
  function im(e) {
    var t = Ah(e.alternate, e, $n);
    e.memoizedProps = e.pendingProps, t === null ? sr(e) : Me = t;
  }
  function rm(e) {
    var t = e, n = t.alternate;
    switch (t.tag) {
      case 15:
      case 0:
        t = jh(
          n,
          t,
          t.pendingProps,
          t.type,
          void 0,
          Ee
        );
        break;
      case 11:
        t = jh(
          n,
          t,
          t.pendingProps,
          t.type.render,
          t.ref,
          Ee
        );
        break;
      case 5:
        au(t);
      default:
        Oh(n, t), t = Me = sd(t, $n), t = Ah(n, t, $n);
    }
    e.memoizedProps = e.pendingProps, t === null ? sr(e) : Me = t;
  }
  function Ra(e, t, n, l) {
    Bn = Ll = null, au(t), wa = null, ms = 0;
    var i = t.return;
    try {
      if (T1(
        e,
        i,
        t,
        n,
        Ee
      )) {
        rt = 1, Zi(
          e,
          un(n, e.current)
        ), Me = null;
        return;
      }
    } catch (c) {
      if (i !== null) throw Me = i, c;
      rt = 1, Zi(
        e,
        un(n, e.current)
      ), Me = null;
      return;
    }
    t.flags & 32768 ? (Ae || l === 1 ? e = !0 : Ca || (Ee & 536870912) !== 0 ? e = !1 : (hl = e = !0, (l === 2 || l === 9 || l === 3 || l === 6) && (l = $t.current, l !== null && l.tag === 13 && (l.flags |= 16384))), cm(t, e)) : sr(t);
  }
  function sr(e) {
    var t = e;
    do {
      if ((t.flags & 32768) !== 0) {
        cm(
          t,
          hl
        );
        return;
      }
      e = t.return;
      var n = A1(
        t.alternate,
        t,
        $n
      );
      if (n !== null) {
        Me = n;
        return;
      }
      if (t = t.sibling, t !== null) {
        Me = t;
        return;
      }
      Me = t = e;
    } while (t !== null);
    rt === 0 && (rt = 5);
  }
  function cm(e, t) {
    do {
      var n = z1(e.alternate, e);
      if (n !== null) {
        n.flags &= 32767, Me = n;
        return;
      }
      if (n = e.return, n !== null && (n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null), !t && (e = e.sibling, e !== null)) {
        Me = e;
        return;
      }
      Me = e = n;
    } while (e !== null);
    rt = 6, Me = null;
  }
  function um(e, t, n, l, i, c, h, v, w) {
    e.cancelPendingCommit = null;
    do
      ir();
    while (gt !== 0);
    if ((qe & 6) !== 0) throw Error(u(327));
    if (t !== null) {
      if (t === e.current) throw Error(u(177));
      if (c = t.lanes | t.childLanes, c |= zc, vg(
        e,
        n,
        c,
        h,
        v,
        w
      ), e === Je && (Me = Je = null, Ee = 0), za = t, gl = e, Wn = n, Bu = c, qu = i, Ih = l, (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, X1(ln, function() {
        return mm(), null;
      })) : (e.callbackNode = null, e.callbackPriority = 0), l = (t.flags & 13878) !== 0, (t.subtreeFlags & 13878) !== 0 || l) {
        l = z.T, z.T = null, i = G.p, G.p = 2, h = qe, qe |= 4;
        try {
          O1(e, t, n);
        } finally {
          qe = h, G.p = i, z.T = l;
        }
      }
      gt = 1, om(), fm(), dm();
    }
  }
  function om() {
    if (gt === 1) {
      gt = 0;
      var e = gl, t = za, n = (t.flags & 13878) !== 0;
      if ((t.subtreeFlags & 13878) !== 0 || n) {
        n = z.T, z.T = null;
        var l = G.p;
        G.p = 2;
        var i = qe;
        qe |= 4;
        try {
          Vh(t, e);
          var c = to, h = Wf(e.containerInfo), v = c.focusedElem, w = c.selectionRange;
          if (h !== v && v && v.ownerDocument && $f(
            v.ownerDocument.documentElement,
            v
          )) {
            if (w !== null && Mc(v)) {
              var C = w.start, H = w.end;
              if (H === void 0 && (H = C), "selectionStart" in v)
                v.selectionStart = C, v.selectionEnd = Math.min(
                  H,
                  v.value.length
                );
              else {
                var q = v.ownerDocument || document, A = q && q.defaultView || window;
                if (A.getSelection) {
                  var O = A.getSelection(), te = v.textContent.length, oe = Math.min(w.start, te), Qe = w.end === void 0 ? oe : Math.min(w.end, te);
                  !O.extend && oe > Qe && (h = Qe, Qe = oe, oe = h);
                  var M = Jf(
                    v,
                    oe
                  ), N = Jf(
                    v,
                    Qe
                  );
                  if (M && N && (O.rangeCount !== 1 || O.anchorNode !== M.node || O.anchorOffset !== M.offset || O.focusNode !== N.node || O.focusOffset !== N.offset)) {
                    var E = q.createRange();
                    E.setStart(M.node, M.offset), O.removeAllRanges(), oe > Qe ? (O.addRange(E), O.extend(N.node, N.offset)) : (E.setEnd(N.node, N.offset), O.addRange(E));
                  }
                }
              }
            }
            for (q = [], O = v; O = O.parentNode; )
              O.nodeType === 1 && q.push({
                element: O,
                left: O.scrollLeft,
                top: O.scrollTop
              });
            for (typeof v.focus == "function" && v.focus(), v = 0; v < q.length; v++) {
              var B = q[v];
              B.element.scrollLeft = B.left, B.element.scrollTop = B.top;
            }
          }
          vr = !!eo, to = eo = null;
        } finally {
          qe = i, G.p = l, z.T = n;
        }
      }
      e.current = t, gt = 2;
    }
  }
  function fm() {
    if (gt === 2) {
      gt = 0;
      var e = gl, t = za, n = (t.flags & 8772) !== 0;
      if ((t.subtreeFlags & 8772) !== 0 || n) {
        n = z.T, z.T = null;
        var l = G.p;
        G.p = 2;
        var i = qe;
        qe |= 4;
        try {
          Bh(e, t.alternate, t);
        } finally {
          qe = i, G.p = l, z.T = n;
        }
      }
      gt = 3;
    }
  }
  function dm() {
    if (gt === 4 || gt === 3) {
      gt = 0, Vt();
      var e = gl, t = za, n = Wn, l = Ih;
      (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? gt = 5 : (gt = 0, za = gl = null, hm(e, e.pendingLanes));
      var i = e.pendingLanes;
      if (i === 0 && (pl = null), rc(n), t = t.stateNode, Be && typeof Be.onCommitFiberRoot == "function")
        try {
          Be.onCommitFiberRoot(
            Fe,
            t,
            void 0,
            (t.current.flags & 128) === 128
          );
        } catch {
        }
      if (l !== null) {
        t = z.T, i = G.p, G.p = 2, z.T = null;
        try {
          for (var c = e.onRecoverableError, h = 0; h < l.length; h++) {
            var v = l[h];
            c(v.value, {
              componentStack: v.stack
            });
          }
        } finally {
          z.T = t, G.p = i;
        }
      }
      (Wn & 3) !== 0 && ir(), Tn(e), i = e.pendingLanes, (n & 261930) !== 0 && (i & 42) !== 0 ? e === Yu ? zs++ : (zs = 0, Yu = e) : zs = 0, Os(0);
    }
  }
  function hm(e, t) {
    (e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, ds(t)));
  }
  function ir() {
    return om(), fm(), dm(), mm();
  }
  function mm() {
    if (gt !== 5) return !1;
    var e = gl, t = Bu;
    Bu = 0;
    var n = rc(Wn), l = z.T, i = G.p;
    try {
      G.p = 32 > n ? 32 : n, z.T = null, n = qu, qu = null;
      var c = gl, h = Wn;
      if (gt = 0, za = gl = null, Wn = 0, (qe & 6) !== 0) throw Error(u(331));
      var v = qe;
      if (qe |= 4, $h(c.current), Zh(
        c,
        c.current,
        h,
        n
      ), qe = v, Os(0, !1), Be && typeof Be.onPostCommitFiberRoot == "function")
        try {
          Be.onPostCommitFiberRoot(Fe, c);
        } catch {
        }
      return !0;
    } finally {
      G.p = i, z.T = l, hm(e, t);
    }
  }
  function pm(e, t, n) {
    t = un(n, t), t = xu(e.stateNode, t, 2), e = ul(e, t, 2), e !== null && (Ia(e, 2), Tn(e));
  }
  function Ge(e, t, n) {
    if (e.tag === 3)
      pm(e, e, n);
    else
      for (; t !== null; ) {
        if (t.tag === 3) {
          pm(
            t,
            e,
            n
          );
          break;
        } else if (t.tag === 1) {
          var l = t.stateNode;
          if (typeof t.type.getDerivedStateFromError == "function" || typeof l.componentDidCatch == "function" && (pl === null || !pl.has(l))) {
            e = un(n, e), n = gh(2), l = ul(t, n, 2), l !== null && (yh(
              n,
              l,
              t,
              e
            ), Ia(l, 2), Tn(l));
            break;
          }
        }
        t = t.return;
      }
  }
  function Vu(e, t, n) {
    var l = e.pingCache;
    if (l === null) {
      l = e.pingCache = new D1();
      var i = /* @__PURE__ */ new Set();
      l.set(t, i);
    } else
      i = l.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), l.set(t, i));
    i.has(n) || (Hu = !0, i.add(n), e = q1.bind(null, e, t, n), t.then(e, e));
  }
  function q1(e, t, n) {
    var l = e.pingCache;
    l !== null && l.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, Je === e && (Ee & n) === n && (rt === 4 || rt === 3 && (Ee & 62914560) === Ee && 300 > Re() - er ? (qe & 2) === 0 && Oa(e, 0) : Uu |= n, Aa === Ee && (Aa = 0)), Tn(e);
  }
  function gm(e, t) {
    t === 0 && (t = of()), e = Dl(e, t), e !== null && (Ia(e, t), Tn(e));
  }
  function Y1(e) {
    var t = e.memoizedState, n = 0;
    t !== null && (n = t.retryLane), gm(e, n);
  }
  function G1(e, t) {
    var n = 0;
    switch (e.tag) {
      case 31:
      case 13:
        var l = e.stateNode, i = e.memoizedState;
        i !== null && (n = i.retryLane);
        break;
      case 19:
        l = e.stateNode;
        break;
      case 22:
        l = e.stateNode._retryCache;
        break;
      default:
        throw Error(u(314));
    }
    l !== null && l.delete(t), gm(e, n);
  }
  function X1(e, t) {
    return ie(e, t);
  }
  var rr = null, ka = null, Qu = !1, cr = !1, Zu = !1, vl = 0;
  function Tn(e) {
    e !== ka && e.next === null && (ka === null ? rr = ka = e : ka = ka.next = e), cr = !0, Qu || (Qu = !0, Q1());
  }
  function Os(e, t) {
    if (!Zu && cr) {
      Zu = !0;
      do
        for (var n = !1, l = rr; l !== null; ) {
          if (e !== 0) {
            var i = l.pendingLanes;
            if (i === 0) var c = 0;
            else {
              var h = l.suspendedLanes, v = l.pingedLanes;
              c = (1 << 31 - zt(42 | e) + 1) - 1, c &= i & ~(h & ~v), c = c & 201326741 ? c & 201326741 | 1 : c ? c | 2 : 0;
            }
            c !== 0 && (n = !0, _m(l, c));
          } else
            c = Ee, c = an(
              l,
              l === Je ? c : 0,
              l.cancelPendingCommit !== null || l.timeoutHandle !== -1
            ), (c & 3) === 0 || Fa(l, c) || (n = !0, _m(l, c));
          l = l.next;
        }
      while (n);
      Zu = !1;
    }
  }
  function V1() {
    ym();
  }
  function ym() {
    cr = Qu = !1;
    var e = 0;
    vl !== 0 && ty() && (e = vl);
    for (var t = Re(), n = null, l = rr; l !== null; ) {
      var i = l.next, c = vm(l, t);
      c === 0 ? (l.next = null, n === null ? rr = i : n.next = i, i === null && (ka = n)) : (n = l, (e !== 0 || (c & 3) !== 0) && (cr = !0)), l = i;
    }
    gt !== 0 && gt !== 5 || Os(e), vl !== 0 && (vl = 0);
  }
  function vm(e, t) {
    for (var n = e.suspendedLanes, l = e.pingedLanes, i = e.expirationTimes, c = e.pendingLanes & -62914561; 0 < c; ) {
      var h = 31 - zt(c), v = 1 << h, w = i[h];
      w === -1 ? ((v & n) === 0 || (v & l) !== 0) && (i[h] = yg(v, t)) : w <= t && (e.expiredLanes |= v), c &= ~v;
    }
    if (t = Je, n = Ee, n = an(
      e,
      e === t ? n : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1
    ), l = e.callbackNode, n === 0 || e === t && (Ye === 2 || Ye === 9) || e.cancelPendingCommit !== null)
      return l !== null && l !== null && Ke(l), e.callbackNode = null, e.callbackPriority = 0;
    if ((n & 3) === 0 || Fa(e, n)) {
      if (t = n & -n, t === e.callbackPriority) return t;
      switch (l !== null && Ke(l), rc(n)) {
        case 2:
        case 8:
          n = gn;
          break;
        case 32:
          n = ln;
          break;
        case 268435456:
          n = St;
          break;
        default:
          n = ln;
      }
      return l = xm.bind(null, e), n = ie(n, l), e.callbackPriority = t, e.callbackNode = n, t;
    }
    return l !== null && l !== null && Ke(l), e.callbackPriority = 2, e.callbackNode = null, 2;
  }
  function xm(e, t) {
    if (gt !== 0 && gt !== 5)
      return e.callbackNode = null, e.callbackPriority = 0, null;
    var n = e.callbackNode;
    if (ir() && e.callbackNode !== n)
      return null;
    var l = Ee;
    return l = an(
      e,
      e === Je ? l : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1
    ), l === 0 ? null : (em(e, l, t), vm(e, Re()), e.callbackNode != null && e.callbackNode === n ? xm.bind(null, e) : null);
  }
  function _m(e, t) {
    if (ir()) return null;
    em(e, t, !0);
  }
  function Q1() {
    ly(function() {
      (qe & 6) !== 0 ? ie(
        wt,
        V1
      ) : ym();
    });
  }
  function Ku() {
    if (vl === 0) {
      var e = xa;
      e === 0 && (e = Wa, Wa <<= 1, (Wa & 261888) === 0 && (Wa = 256)), vl = e;
    }
    return vl;
  }
  function bm(e) {
    return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : gi("" + e);
  }
  function wm(e, t) {
    var n = t.ownerDocument.createElement("input");
    return n.name = t.name, n.value = t.value, e.id && n.setAttribute("form", e.id), t.parentNode.insertBefore(n, t), e = new FormData(e), n.parentNode.removeChild(n), e;
  }
  function Z1(e, t, n, l, i) {
    if (t === "submit" && n && n.stateNode === i) {
      var c = bm(
        (i[Dt] || null).action
      ), h = l.submitter;
      h && (t = (t = h[Dt] || null) ? bm(t.formAction) : h.getAttribute("formAction"), t !== null && (c = t, h = null));
      var v = new _i(
        "action",
        "action",
        null,
        l,
        i
      );
      e.push({
        event: v,
        listeners: [
          {
            instance: null,
            listener: function() {
              if (l.defaultPrevented) {
                if (vl !== 0) {
                  var w = h ? wm(i, h) : new FormData(i);
                  hu(
                    n,
                    {
                      pending: !0,
                      data: w,
                      method: i.method,
                      action: c
                    },
                    null,
                    w
                  );
                }
              } else
                typeof c == "function" && (v.preventDefault(), w = h ? wm(i, h) : new FormData(i), hu(
                  n,
                  {
                    pending: !0,
                    data: w,
                    method: i.method,
                    action: c
                  },
                  c,
                  w
                ));
            },
            currentTarget: i
          }
        ]
      });
    }
  }
  for (var Ju = 0; Ju < Ac.length; Ju++) {
    var $u = Ac[Ju], K1 = $u.toLowerCase(), J1 = $u[0].toUpperCase() + $u.slice(1);
    yn(
      K1,
      "on" + J1
    );
  }
  yn(Pf, "onAnimationEnd"), yn(ed, "onAnimationIteration"), yn(td, "onAnimationStart"), yn("dblclick", "onDoubleClick"), yn("focusin", "onFocus"), yn("focusout", "onBlur"), yn(o1, "onTransitionRun"), yn(f1, "onTransitionStart"), yn(d1, "onTransitionCancel"), yn(nd, "onTransitionEnd"), sa("onMouseEnter", ["mouseout", "mouseover"]), sa("onMouseLeave", ["mouseout", "mouseover"]), sa("onPointerEnter", ["pointerout", "pointerover"]), sa("onPointerLeave", ["pointerout", "pointerover"]), zl(
    "onChange",
    "change click focusin focusout input keydown keyup selectionchange".split(" ")
  ), zl(
    "onSelect",
    "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
      " "
    )
  ), zl("onBeforeInput", [
    "compositionend",
    "keypress",
    "textInput",
    "paste"
  ]), zl(
    "onCompositionEnd",
    "compositionend focusout keydown keypress keyup mousedown".split(" ")
  ), zl(
    "onCompositionStart",
    "compositionstart focusout keydown keypress keyup mousedown".split(" ")
  ), zl(
    "onCompositionUpdate",
    "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
  );
  var Rs = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
    " "
  ), $1 = new Set(
    "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Rs)
  );
  function Sm(e, t) {
    t = (t & 4) !== 0;
    for (var n = 0; n < e.length; n++) {
      var l = e[n], i = l.event;
      l = l.listeners;
      e: {
        var c = void 0;
        if (t)
          for (var h = l.length - 1; 0 <= h; h--) {
            var v = l[h], w = v.instance, C = v.currentTarget;
            if (v = v.listener, w !== c && i.isPropagationStopped())
              break e;
            c = v, i.currentTarget = C;
            try {
              c(i);
            } catch (H) {
              Si(H);
            }
            i.currentTarget = null, c = w;
          }
        else
          for (h = 0; h < l.length; h++) {
            if (v = l[h], w = v.instance, C = v.currentTarget, v = v.listener, w !== c && i.isPropagationStopped())
              break e;
            c = v, i.currentTarget = C;
            try {
              c(i);
            } catch (H) {
              Si(H);
            }
            i.currentTarget = null, c = w;
          }
      }
    }
  }
  function Te(e, t) {
    var n = t[cc];
    n === void 0 && (n = t[cc] = /* @__PURE__ */ new Set());
    var l = e + "__bubble";
    n.has(l) || (jm(t, e, 2, !1), n.add(l));
  }
  function Wu(e, t, n) {
    var l = 0;
    t && (l |= 4), jm(
      n,
      e,
      l,
      t
    );
  }
  var ur = "_reactListening" + Math.random().toString(36).slice(2);
  function Fu(e) {
    if (!e[ur]) {
      e[ur] = !0, yf.forEach(function(n) {
        n !== "selectionchange" && ($1.has(n) || Wu(n, !1, e), Wu(n, !0, e));
      });
      var t = e.nodeType === 9 ? e : e.ownerDocument;
      t === null || t[ur] || (t[ur] = !0, Wu("selectionchange", !1, t));
    }
  }
  function jm(e, t, n, l) {
    switch (Pm(t)) {
      case 2:
        var i = Sy;
        break;
      case 8:
        i = jy;
        break;
      default:
        i = ho;
    }
    n = i.bind(
      null,
      t,
      n,
      e
    ), i = void 0, !yc || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), l ? i !== void 0 ? e.addEventListener(t, n, {
      capture: !0,
      passive: i
    }) : e.addEventListener(t, n, !0) : i !== void 0 ? e.addEventListener(t, n, {
      passive: i
    }) : e.addEventListener(t, n, !1);
  }
  function Iu(e, t, n, l, i) {
    var c = l;
    if ((t & 1) === 0 && (t & 2) === 0 && l !== null)
      e: for (; ; ) {
        if (l === null) return;
        var h = l.tag;
        if (h === 3 || h === 4) {
          var v = l.stateNode.containerInfo;
          if (v === i) break;
          if (h === 4)
            for (h = l.return; h !== null; ) {
              var w = h.tag;
              if ((w === 3 || w === 4) && h.stateNode.containerInfo === i)
                return;
              h = h.return;
            }
          for (; v !== null; ) {
            if (h = na(v), h === null) return;
            if (w = h.tag, w === 5 || w === 6 || w === 26 || w === 27) {
              l = c = h;
              continue e;
            }
            v = v.parentNode;
          }
        }
        l = l.return;
      }
    Cf(function() {
      var C = c, H = pc(n), q = [];
      e: {
        var A = ld.get(e);
        if (A !== void 0) {
          var O = _i, te = e;
          switch (e) {
            case "keypress":
              if (vi(n) === 0) break e;
            case "keydown":
            case "keyup":
              O = Gg;
              break;
            case "focusin":
              te = "focus", O = bc;
              break;
            case "focusout":
              te = "blur", O = bc;
              break;
            case "beforeblur":
            case "afterblur":
              O = bc;
              break;
            case "click":
              if (n.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              O = Of;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              O = Ag;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              O = Qg;
              break;
            case Pf:
            case ed:
            case td:
              O = Rg;
              break;
            case nd:
              O = Kg;
              break;
            case "scroll":
            case "scrollend":
              O = Eg;
              break;
            case "wheel":
              O = $g;
              break;
            case "copy":
            case "cut":
            case "paste":
              O = Dg;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              O = kf;
              break;
            case "toggle":
            case "beforetoggle":
              O = Fg;
          }
          var oe = (t & 4) !== 0, Qe = !oe && (e === "scroll" || e === "scrollend"), M = oe ? A !== null ? A + "Capture" : null : A;
          oe = [];
          for (var N = C, E; N !== null; ) {
            var B = N;
            if (E = B.stateNode, B = B.tag, B !== 5 && B !== 26 && B !== 27 || E === null || M === null || (B = ts(N, M), B != null && oe.push(
              ks(N, B, E)
            )), Qe) break;
            N = N.return;
          }
          0 < oe.length && (A = new O(
            A,
            te,
            null,
            n,
            H
          ), q.push({ event: A, listeners: oe }));
        }
      }
      if ((t & 7) === 0) {
        e: {
          if (A = e === "mouseover" || e === "pointerover", O = e === "mouseout" || e === "pointerout", A && n !== mc && (te = n.relatedTarget || n.fromElement) && (na(te) || te[ta]))
            break e;
          if ((O || A) && (A = H.window === H ? H : (A = H.ownerDocument) ? A.defaultView || A.parentWindow : window, O ? (te = n.relatedTarget || n.toElement, O = C, te = te ? na(te) : null, te !== null && (Qe = d(te), oe = te.tag, te !== Qe || oe !== 5 && oe !== 27 && oe !== 6) && (te = null)) : (O = null, te = C), O !== te)) {
            if (oe = Of, B = "onMouseLeave", M = "onMouseEnter", N = "mouse", (e === "pointerout" || e === "pointerover") && (oe = kf, B = "onPointerLeave", M = "onPointerEnter", N = "pointer"), Qe = O == null ? A : es(O), E = te == null ? A : es(te), A = new oe(
              B,
              N + "leave",
              O,
              n,
              H
            ), A.target = Qe, A.relatedTarget = E, B = null, na(H) === C && (oe = new oe(
              M,
              N + "enter",
              te,
              n,
              H
            ), oe.target = E, oe.relatedTarget = Qe, B = oe), Qe = B, O && te)
              t: {
                for (oe = W1, M = O, N = te, E = 0, B = M; B; B = oe(B))
                  E++;
                B = 0;
                for (var re = N; re; re = oe(re))
                  B++;
                for (; 0 < E - B; )
                  M = oe(M), E--;
                for (; 0 < B - E; )
                  N = oe(N), B--;
                for (; E--; ) {
                  if (M === N || N !== null && M === N.alternate) {
                    oe = M;
                    break t;
                  }
                  M = oe(M), N = oe(N);
                }
                oe = null;
              }
            else oe = null;
            O !== null && Nm(
              q,
              A,
              O,
              oe,
              !1
            ), te !== null && Qe !== null && Nm(
              q,
              Qe,
              te,
              oe,
              !0
            );
          }
        }
        e: {
          if (A = C ? es(C) : window, O = A.nodeName && A.nodeName.toLowerCase(), O === "select" || O === "input" && A.type === "file")
            var ke = Gf;
          else if (qf(A))
            if (Xf)
              ke = r1;
            else {
              ke = s1;
              var ne = a1;
            }
          else
            O = A.nodeName, !O || O.toLowerCase() !== "input" || A.type !== "checkbox" && A.type !== "radio" ? C && hc(C.elementType) && (ke = Gf) : ke = i1;
          if (ke && (ke = ke(e, C))) {
            Yf(
              q,
              ke,
              n,
              H
            );
            break e;
          }
          ne && ne(e, A, C), e === "focusout" && C && A.type === "number" && C.memoizedProps.value != null && dc(A, "number", A.value);
        }
        switch (ne = C ? es(C) : window, e) {
          case "focusin":
            (qf(ne) || ne.contentEditable === "true") && (fa = ne, Tc = C, us = null);
            break;
          case "focusout":
            us = Tc = fa = null;
            break;
          case "mousedown":
            Ec = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Ec = !1, Ff(q, n, H);
            break;
          case "selectionchange":
            if (u1) break;
          case "keydown":
          case "keyup":
            Ff(q, n, H);
        }
        var xe;
        if (Sc)
          e: {
            switch (e) {
              case "compositionstart":
                var Ce = "onCompositionStart";
                break e;
              case "compositionend":
                Ce = "onCompositionEnd";
                break e;
              case "compositionupdate":
                Ce = "onCompositionUpdate";
                break e;
            }
            Ce = void 0;
          }
        else
          oa ? Lf(e, n) && (Ce = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (Ce = "onCompositionStart");
        Ce && (Df && n.locale !== "ko" && (oa || Ce !== "onCompositionStart" ? Ce === "onCompositionEnd" && oa && (xe = Af()) : (nl = H, vc = "value" in nl ? nl.value : nl.textContent, oa = !0)), ne = or(C, Ce), 0 < ne.length && (Ce = new Rf(
          Ce,
          e,
          null,
          n,
          H
        ), q.push({ event: Ce, listeners: ne }), xe ? Ce.data = xe : (xe = Bf(n), xe !== null && (Ce.data = xe)))), (xe = Pg ? e1(e, n) : t1(e, n)) && (Ce = or(C, "onBeforeInput"), 0 < Ce.length && (ne = new Rf(
          "onBeforeInput",
          "beforeinput",
          null,
          n,
          H
        ), q.push({
          event: ne,
          listeners: Ce
        }), ne.data = xe)), Z1(
          q,
          e,
          C,
          n,
          H
        );
      }
      Sm(q, t);
    });
  }
  function ks(e, t, n) {
    return {
      instance: e,
      listener: t,
      currentTarget: n
    };
  }
  function or(e, t) {
    for (var n = t + "Capture", l = []; e !== null; ) {
      var i = e, c = i.stateNode;
      if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || c === null || (i = ts(e, n), i != null && l.unshift(
        ks(e, i, c)
      ), i = ts(e, t), i != null && l.push(
        ks(e, i, c)
      )), e.tag === 3) return l;
      e = e.return;
    }
    return [];
  }
  function W1(e) {
    if (e === null) return null;
    do
      e = e.return;
    while (e && e.tag !== 5 && e.tag !== 27);
    return e || null;
  }
  function Nm(e, t, n, l, i) {
    for (var c = t._reactName, h = []; n !== null && n !== l; ) {
      var v = n, w = v.alternate, C = v.stateNode;
      if (v = v.tag, w !== null && w === l) break;
      v !== 5 && v !== 26 && v !== 27 || C === null || (w = C, i ? (C = ts(n, c), C != null && h.unshift(
        ks(n, C, w)
      )) : i || (C = ts(n, c), C != null && h.push(
        ks(n, C, w)
      ))), n = n.return;
    }
    h.length !== 0 && e.push({ event: t, listeners: h });
  }
  var F1 = /\r\n?/g, I1 = /\u0000|\uFFFD/g;
  function Mm(e) {
    return (typeof e == "string" ? e : "" + e).replace(F1, `
`).replace(I1, "");
  }
  function Tm(e, t) {
    return t = Mm(t), Mm(e) === t;
  }
  function Ve(e, t, n, l, i, c) {
    switch (n) {
      case "children":
        typeof l == "string" ? t === "body" || t === "textarea" && l === "" || ra(e, l) : (typeof l == "number" || typeof l == "bigint") && t !== "body" && ra(e, "" + l);
        break;
      case "className":
        mi(e, "class", l);
        break;
      case "tabIndex":
        mi(e, "tabindex", l);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        mi(e, n, l);
        break;
      case "style":
        Tf(e, l, c);
        break;
      case "data":
        if (t !== "object") {
          mi(e, "data", l);
          break;
        }
      case "src":
      case "href":
        if (l === "" && (t !== "a" || n !== "href")) {
          e.removeAttribute(n);
          break;
        }
        if (l == null || typeof l == "function" || typeof l == "symbol" || typeof l == "boolean") {
          e.removeAttribute(n);
          break;
        }
        l = gi("" + l), e.setAttribute(n, l);
        break;
      case "action":
      case "formAction":
        if (typeof l == "function") {
          e.setAttribute(
            n,
            "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
          );
          break;
        } else
          typeof c == "function" && (n === "formAction" ? (t !== "input" && Ve(e, t, "name", i.name, i, null), Ve(
            e,
            t,
            "formEncType",
            i.formEncType,
            i,
            null
          ), Ve(
            e,
            t,
            "formMethod",
            i.formMethod,
            i,
            null
          ), Ve(
            e,
            t,
            "formTarget",
            i.formTarget,
            i,
            null
          )) : (Ve(e, t, "encType", i.encType, i, null), Ve(e, t, "method", i.method, i, null), Ve(e, t, "target", i.target, i, null)));
        if (l == null || typeof l == "symbol" || typeof l == "boolean") {
          e.removeAttribute(n);
          break;
        }
        l = gi("" + l), e.setAttribute(n, l);
        break;
      case "onClick":
        l != null && (e.onclick = Dn);
        break;
      case "onScroll":
        l != null && Te("scroll", e);
        break;
      case "onScrollEnd":
        l != null && Te("scrollend", e);
        break;
      case "dangerouslySetInnerHTML":
        if (l != null) {
          if (typeof l != "object" || !("__html" in l))
            throw Error(u(61));
          if (n = l.__html, n != null) {
            if (i.children != null) throw Error(u(60));
            e.innerHTML = n;
          }
        }
        break;
      case "multiple":
        e.multiple = l && typeof l != "function" && typeof l != "symbol";
        break;
      case "muted":
        e.muted = l && typeof l != "function" && typeof l != "symbol";
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "defaultValue":
      case "defaultChecked":
      case "innerHTML":
      case "ref":
        break;
      case "autoFocus":
        break;
      case "xlinkHref":
        if (l == null || typeof l == "function" || typeof l == "boolean" || typeof l == "symbol") {
          e.removeAttribute("xlink:href");
          break;
        }
        n = gi("" + l), e.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "xlink:href",
          n
        );
        break;
      case "contentEditable":
      case "spellCheck":
      case "draggable":
      case "value":
      case "autoReverse":
      case "externalResourcesRequired":
      case "focusable":
      case "preserveAlpha":
        l != null && typeof l != "function" && typeof l != "symbol" ? e.setAttribute(n, "" + l) : e.removeAttribute(n);
        break;
      case "inert":
      case "allowFullScreen":
      case "async":
      case "autoPlay":
      case "controls":
      case "default":
      case "defer":
      case "disabled":
      case "disablePictureInPicture":
      case "disableRemotePlayback":
      case "formNoValidate":
      case "hidden":
      case "loop":
      case "noModule":
      case "noValidate":
      case "open":
      case "playsInline":
      case "readOnly":
      case "required":
      case "reversed":
      case "scoped":
      case "seamless":
      case "itemScope":
        l && typeof l != "function" && typeof l != "symbol" ? e.setAttribute(n, "") : e.removeAttribute(n);
        break;
      case "capture":
      case "download":
        l === !0 ? e.setAttribute(n, "") : l !== !1 && l != null && typeof l != "function" && typeof l != "symbol" ? e.setAttribute(n, l) : e.removeAttribute(n);
        break;
      case "cols":
      case "rows":
      case "size":
      case "span":
        l != null && typeof l != "function" && typeof l != "symbol" && !isNaN(l) && 1 <= l ? e.setAttribute(n, l) : e.removeAttribute(n);
        break;
      case "rowSpan":
      case "start":
        l == null || typeof l == "function" || typeof l == "symbol" || isNaN(l) ? e.removeAttribute(n) : e.setAttribute(n, l);
        break;
      case "popover":
        Te("beforetoggle", e), Te("toggle", e), hi(e, "popover", l);
        break;
      case "xlinkActuate":
        kn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:actuate",
          l
        );
        break;
      case "xlinkArcrole":
        kn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:arcrole",
          l
        );
        break;
      case "xlinkRole":
        kn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:role",
          l
        );
        break;
      case "xlinkShow":
        kn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:show",
          l
        );
        break;
      case "xlinkTitle":
        kn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:title",
          l
        );
        break;
      case "xlinkType":
        kn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:type",
          l
        );
        break;
      case "xmlBase":
        kn(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:base",
          l
        );
        break;
      case "xmlLang":
        kn(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:lang",
          l
        );
        break;
      case "xmlSpace":
        kn(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:space",
          l
        );
        break;
      case "is":
        hi(e, "is", l);
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") && (n = Mg.get(n) || n, hi(e, n, l));
    }
  }
  function Pu(e, t, n, l, i, c) {
    switch (n) {
      case "style":
        Tf(e, l, c);
        break;
      case "dangerouslySetInnerHTML":
        if (l != null) {
          if (typeof l != "object" || !("__html" in l))
            throw Error(u(61));
          if (n = l.__html, n != null) {
            if (i.children != null) throw Error(u(60));
            e.innerHTML = n;
          }
        }
        break;
      case "children":
        typeof l == "string" ? ra(e, l) : (typeof l == "number" || typeof l == "bigint") && ra(e, "" + l);
        break;
      case "onScroll":
        l != null && Te("scroll", e);
        break;
      case "onScrollEnd":
        l != null && Te("scrollend", e);
        break;
      case "onClick":
        l != null && (e.onclick = Dn);
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "innerHTML":
      case "ref":
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        if (!vf.hasOwnProperty(n))
          e: {
            if (n[0] === "o" && n[1] === "n" && (i = n.endsWith("Capture"), t = n.slice(2, i ? n.length - 7 : void 0), c = e[Dt] || null, c = c != null ? c[n] : null, typeof c == "function" && e.removeEventListener(t, c, i), typeof l == "function")) {
              typeof c != "function" && c !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(t, l, i);
              break e;
            }
            n in e ? e[n] = l : l === !0 ? e.setAttribute(n, "") : hi(e, n, l);
          }
    }
  }
  function Et(e, t, n) {
    switch (t) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "img":
        Te("error", e), Te("load", e);
        var l = !1, i = !1, c;
        for (c in n)
          if (n.hasOwnProperty(c)) {
            var h = n[c];
            if (h != null)
              switch (c) {
                case "src":
                  l = !0;
                  break;
                case "srcSet":
                  i = !0;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(u(137, t));
                default:
                  Ve(e, t, c, h, n, null);
              }
          }
        i && Ve(e, t, "srcSet", n.srcSet, n, null), l && Ve(e, t, "src", n.src, n, null);
        return;
      case "input":
        Te("invalid", e);
        var v = c = h = i = null, w = null, C = null;
        for (l in n)
          if (n.hasOwnProperty(l)) {
            var H = n[l];
            if (H != null)
              switch (l) {
                case "name":
                  i = H;
                  break;
                case "type":
                  h = H;
                  break;
                case "checked":
                  w = H;
                  break;
                case "defaultChecked":
                  C = H;
                  break;
                case "value":
                  c = H;
                  break;
                case "defaultValue":
                  v = H;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (H != null)
                    throw Error(u(137, t));
                  break;
                default:
                  Ve(e, t, l, H, n, null);
              }
          }
        Sf(
          e,
          c,
          v,
          w,
          C,
          h,
          i,
          !1
        );
        return;
      case "select":
        Te("invalid", e), l = h = c = null;
        for (i in n)
          if (n.hasOwnProperty(i) && (v = n[i], v != null))
            switch (i) {
              case "value":
                c = v;
                break;
              case "defaultValue":
                h = v;
                break;
              case "multiple":
                l = v;
              default:
                Ve(e, t, i, v, n, null);
            }
        t = c, n = h, e.multiple = !!l, t != null ? ia(e, !!l, t, !1) : n != null && ia(e, !!l, n, !0);
        return;
      case "textarea":
        Te("invalid", e), c = i = l = null;
        for (h in n)
          if (n.hasOwnProperty(h) && (v = n[h], v != null))
            switch (h) {
              case "value":
                l = v;
                break;
              case "defaultValue":
                i = v;
                break;
              case "children":
                c = v;
                break;
              case "dangerouslySetInnerHTML":
                if (v != null) throw Error(u(91));
                break;
              default:
                Ve(e, t, h, v, n, null);
            }
        Nf(e, l, i, c);
        return;
      case "option":
        for (w in n)
          if (n.hasOwnProperty(w) && (l = n[w], l != null))
            switch (w) {
              case "selected":
                e.selected = l && typeof l != "function" && typeof l != "symbol";
                break;
              default:
                Ve(e, t, w, l, n, null);
            }
        return;
      case "dialog":
        Te("beforetoggle", e), Te("toggle", e), Te("cancel", e), Te("close", e);
        break;
      case "iframe":
      case "object":
        Te("load", e);
        break;
      case "video":
      case "audio":
        for (l = 0; l < Rs.length; l++)
          Te(Rs[l], e);
        break;
      case "image":
        Te("error", e), Te("load", e);
        break;
      case "details":
        Te("toggle", e);
        break;
      case "embed":
      case "source":
      case "link":
        Te("error", e), Te("load", e);
      case "area":
      case "base":
      case "br":
      case "col":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "track":
      case "wbr":
      case "menuitem":
        for (C in n)
          if (n.hasOwnProperty(C) && (l = n[C], l != null))
            switch (C) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(u(137, t));
              default:
                Ve(e, t, C, l, n, null);
            }
        return;
      default:
        if (hc(t)) {
          for (H in n)
            n.hasOwnProperty(H) && (l = n[H], l !== void 0 && Pu(
              e,
              t,
              H,
              l,
              n,
              void 0
            ));
          return;
        }
    }
    for (v in n)
      n.hasOwnProperty(v) && (l = n[v], l != null && Ve(e, t, v, l, n, null));
  }
  function P1(e, t, n, l) {
    switch (t) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "input":
        var i = null, c = null, h = null, v = null, w = null, C = null, H = null;
        for (O in n) {
          var q = n[O];
          if (n.hasOwnProperty(O) && q != null)
            switch (O) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                w = q;
              default:
                l.hasOwnProperty(O) || Ve(e, t, O, null, l, q);
            }
        }
        for (var A in l) {
          var O = l[A];
          if (q = n[A], l.hasOwnProperty(A) && (O != null || q != null))
            switch (A) {
              case "type":
                c = O;
                break;
              case "name":
                i = O;
                break;
              case "checked":
                C = O;
                break;
              case "defaultChecked":
                H = O;
                break;
              case "value":
                h = O;
                break;
              case "defaultValue":
                v = O;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (O != null)
                  throw Error(u(137, t));
                break;
              default:
                O !== q && Ve(
                  e,
                  t,
                  A,
                  O,
                  l,
                  q
                );
            }
        }
        fc(
          e,
          h,
          v,
          w,
          C,
          H,
          c,
          i
        );
        return;
      case "select":
        O = h = v = A = null;
        for (c in n)
          if (w = n[c], n.hasOwnProperty(c) && w != null)
            switch (c) {
              case "value":
                break;
              case "multiple":
                O = w;
              default:
                l.hasOwnProperty(c) || Ve(
                  e,
                  t,
                  c,
                  null,
                  l,
                  w
                );
            }
        for (i in l)
          if (c = l[i], w = n[i], l.hasOwnProperty(i) && (c != null || w != null))
            switch (i) {
              case "value":
                A = c;
                break;
              case "defaultValue":
                v = c;
                break;
              case "multiple":
                h = c;
              default:
                c !== w && Ve(
                  e,
                  t,
                  i,
                  c,
                  l,
                  w
                );
            }
        t = v, n = h, l = O, A != null ? ia(e, !!n, A, !1) : !!l != !!n && (t != null ? ia(e, !!n, t, !0) : ia(e, !!n, n ? [] : "", !1));
        return;
      case "textarea":
        O = A = null;
        for (v in n)
          if (i = n[v], n.hasOwnProperty(v) && i != null && !l.hasOwnProperty(v))
            switch (v) {
              case "value":
                break;
              case "children":
                break;
              default:
                Ve(e, t, v, null, l, i);
            }
        for (h in l)
          if (i = l[h], c = n[h], l.hasOwnProperty(h) && (i != null || c != null))
            switch (h) {
              case "value":
                A = i;
                break;
              case "defaultValue":
                O = i;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (i != null) throw Error(u(91));
                break;
              default:
                i !== c && Ve(e, t, h, i, l, c);
            }
        jf(e, A, O);
        return;
      case "option":
        for (var te in n)
          if (A = n[te], n.hasOwnProperty(te) && A != null && !l.hasOwnProperty(te))
            switch (te) {
              case "selected":
                e.selected = !1;
                break;
              default:
                Ve(
                  e,
                  t,
                  te,
                  null,
                  l,
                  A
                );
            }
        for (w in l)
          if (A = l[w], O = n[w], l.hasOwnProperty(w) && A !== O && (A != null || O != null))
            switch (w) {
              case "selected":
                e.selected = A && typeof A != "function" && typeof A != "symbol";
                break;
              default:
                Ve(
                  e,
                  t,
                  w,
                  A,
                  l,
                  O
                );
            }
        return;
      case "img":
      case "link":
      case "area":
      case "base":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
      case "menuitem":
        for (var oe in n)
          A = n[oe], n.hasOwnProperty(oe) && A != null && !l.hasOwnProperty(oe) && Ve(e, t, oe, null, l, A);
        for (C in l)
          if (A = l[C], O = n[C], l.hasOwnProperty(C) && A !== O && (A != null || O != null))
            switch (C) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (A != null)
                  throw Error(u(137, t));
                break;
              default:
                Ve(
                  e,
                  t,
                  C,
                  A,
                  l,
                  O
                );
            }
        return;
      default:
        if (hc(t)) {
          for (var Qe in n)
            A = n[Qe], n.hasOwnProperty(Qe) && A !== void 0 && !l.hasOwnProperty(Qe) && Pu(
              e,
              t,
              Qe,
              void 0,
              l,
              A
            );
          for (H in l)
            A = l[H], O = n[H], !l.hasOwnProperty(H) || A === O || A === void 0 && O === void 0 || Pu(
              e,
              t,
              H,
              A,
              l,
              O
            );
          return;
        }
    }
    for (var M in n)
      A = n[M], n.hasOwnProperty(M) && A != null && !l.hasOwnProperty(M) && Ve(e, t, M, null, l, A);
    for (q in l)
      A = l[q], O = n[q], !l.hasOwnProperty(q) || A === O || A == null && O == null || Ve(e, t, q, A, l, O);
  }
  function Em(e) {
    switch (e) {
      case "css":
      case "script":
      case "font":
      case "img":
      case "image":
      case "input":
      case "link":
        return !0;
      default:
        return !1;
    }
  }
  function ey() {
    if (typeof performance.getEntriesByType == "function") {
      for (var e = 0, t = 0, n = performance.getEntriesByType("resource"), l = 0; l < n.length; l++) {
        var i = n[l], c = i.transferSize, h = i.initiatorType, v = i.duration;
        if (c && v && Em(h)) {
          for (h = 0, v = i.responseEnd, l += 1; l < n.length; l++) {
            var w = n[l], C = w.startTime;
            if (C > v) break;
            var H = w.transferSize, q = w.initiatorType;
            H && Em(q) && (w = w.responseEnd, h += H * (w < v ? 1 : (v - C) / (w - C)));
          }
          if (--l, t += 8 * (c + h) / (i.duration / 1e3), e++, 10 < e) break;
        }
      }
      if (0 < e) return t / e / 1e6;
    }
    return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
  }
  var eo = null, to = null;
  function fr(e) {
    return e.nodeType === 9 ? e : e.ownerDocument;
  }
  function Cm(e) {
    switch (e) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function Am(e, t) {
    if (e === 0)
      switch (t) {
        case "svg":
          return 1;
        case "math":
          return 2;
        default:
          return 0;
      }
    return e === 1 && t === "foreignObject" ? 0 : e;
  }
  function no(e, t) {
    return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
  }
  var lo = null;
  function ty() {
    var e = window.event;
    return e && e.type === "popstate" ? e === lo ? !1 : (lo = e, !0) : (lo = null, !1);
  }
  var zm = typeof setTimeout == "function" ? setTimeout : void 0, ny = typeof clearTimeout == "function" ? clearTimeout : void 0, Om = typeof Promise == "function" ? Promise : void 0, ly = typeof queueMicrotask == "function" ? queueMicrotask : typeof Om < "u" ? function(e) {
    return Om.resolve(null).then(e).catch(ay);
  } : zm;
  function ay(e) {
    setTimeout(function() {
      throw e;
    });
  }
  function xl(e) {
    return e === "head";
  }
  function Rm(e, t) {
    var n = t, l = 0;
    do {
      var i = n.nextSibling;
      if (e.removeChild(n), i && i.nodeType === 8)
        if (n = i.data, n === "/$" || n === "/&") {
          if (l === 0) {
            e.removeChild(i), La(t);
            return;
          }
          l--;
        } else if (n === "$" || n === "$?" || n === "$~" || n === "$!" || n === "&")
          l++;
        else if (n === "html")
          Ds(e.ownerDocument.documentElement);
        else if (n === "head") {
          n = e.ownerDocument.head, Ds(n);
          for (var c = n.firstChild; c; ) {
            var h = c.nextSibling, v = c.nodeName;
            c[Pa] || v === "SCRIPT" || v === "STYLE" || v === "LINK" && c.rel.toLowerCase() === "stylesheet" || n.removeChild(c), c = h;
          }
        } else
          n === "body" && Ds(e.ownerDocument.body);
      n = i;
    } while (n);
    La(t);
  }
  function km(e, t) {
    var n = e;
    e = 0;
    do {
      var l = n.nextSibling;
      if (n.nodeType === 1 ? t ? (n._stashedDisplay = n.style.display, n.style.display = "none") : (n.style.display = n._stashedDisplay || "", n.getAttribute("style") === "" && n.removeAttribute("style")) : n.nodeType === 3 && (t ? (n._stashedText = n.nodeValue, n.nodeValue = "") : n.nodeValue = n._stashedText || ""), l && l.nodeType === 8)
        if (n = l.data, n === "/$") {
          if (e === 0) break;
          e--;
        } else
          n !== "$" && n !== "$?" && n !== "$~" && n !== "$!" || e++;
      n = l;
    } while (n);
  }
  function ao(e) {
    var t = e.firstChild;
    for (t && t.nodeType === 10 && (t = t.nextSibling); t; ) {
      var n = t;
      switch (t = t.nextSibling, n.nodeName) {
        case "HTML":
        case "HEAD":
        case "BODY":
          ao(n), uc(n);
          continue;
        case "SCRIPT":
        case "STYLE":
          continue;
        case "LINK":
          if (n.rel.toLowerCase() === "stylesheet") continue;
      }
      e.removeChild(n);
    }
  }
  function sy(e, t, n, l) {
    for (; e.nodeType === 1; ) {
      var i = n;
      if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
        if (!l && (e.nodeName !== "INPUT" || e.type !== "hidden"))
          break;
      } else if (l) {
        if (!e[Pa])
          switch (t) {
            case "meta":
              if (!e.hasAttribute("itemprop")) break;
              return e;
            case "link":
              if (c = e.getAttribute("rel"), c === "stylesheet" && e.hasAttribute("data-precedence"))
                break;
              if (c !== i.rel || e.getAttribute("href") !== (i.href == null || i.href === "" ? null : i.href) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin) || e.getAttribute("title") !== (i.title == null ? null : i.title))
                break;
              return e;
            case "style":
              if (e.hasAttribute("data-precedence")) break;
              return e;
            case "script":
              if (c = e.getAttribute("src"), (c !== (i.src == null ? null : i.src) || e.getAttribute("type") !== (i.type == null ? null : i.type) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin)) && c && e.hasAttribute("async") && !e.hasAttribute("itemprop"))
                break;
              return e;
            default:
              return e;
          }
      } else if (t === "input" && e.type === "hidden") {
        var c = i.name == null ? null : "" + i.name;
        if (i.type === "hidden" && e.getAttribute("name") === c)
          return e;
      } else return e;
      if (e = mn(e.nextSibling), e === null) break;
    }
    return null;
  }
  function iy(e, t, n) {
    if (t === "") return null;
    for (; e.nodeType !== 3; )
      if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !n || (e = mn(e.nextSibling), e === null)) return null;
    return e;
  }
  function Dm(e, t) {
    for (; e.nodeType !== 8; )
      if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = mn(e.nextSibling), e === null)) return null;
    return e;
  }
  function so(e) {
    return e.data === "$?" || e.data === "$~";
  }
  function io(e) {
    return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
  }
  function ry(e, t) {
    var n = e.ownerDocument;
    if (e.data === "$~") e._reactRetry = t;
    else if (e.data !== "$?" || n.readyState !== "loading")
      t();
    else {
      var l = function() {
        t(), n.removeEventListener("DOMContentLoaded", l);
      };
      n.addEventListener("DOMContentLoaded", l), e._reactRetry = l;
    }
  }
  function mn(e) {
    for (; e != null; e = e.nextSibling) {
      var t = e.nodeType;
      if (t === 1 || t === 3) break;
      if (t === 8) {
        if (t = e.data, t === "$" || t === "$!" || t === "$?" || t === "$~" || t === "&" || t === "F!" || t === "F")
          break;
        if (t === "/$" || t === "/&") return null;
      }
    }
    return e;
  }
  var ro = null;
  function Hm(e) {
    e = e.nextSibling;
    for (var t = 0; e; ) {
      if (e.nodeType === 8) {
        var n = e.data;
        if (n === "/$" || n === "/&") {
          if (t === 0)
            return mn(e.nextSibling);
          t--;
        } else
          n !== "$" && n !== "$!" && n !== "$?" && n !== "$~" && n !== "&" || t++;
      }
      e = e.nextSibling;
    }
    return null;
  }
  function Um(e) {
    e = e.previousSibling;
    for (var t = 0; e; ) {
      if (e.nodeType === 8) {
        var n = e.data;
        if (n === "$" || n === "$!" || n === "$?" || n === "$~" || n === "&") {
          if (t === 0) return e;
          t--;
        } else n !== "/$" && n !== "/&" || t++;
      }
      e = e.previousSibling;
    }
    return null;
  }
  function Lm(e, t, n) {
    switch (t = fr(n), e) {
      case "html":
        if (e = t.documentElement, !e) throw Error(u(452));
        return e;
      case "head":
        if (e = t.head, !e) throw Error(u(453));
        return e;
      case "body":
        if (e = t.body, !e) throw Error(u(454));
        return e;
      default:
        throw Error(u(451));
    }
  }
  function Ds(e) {
    for (var t = e.attributes; t.length; )
      e.removeAttributeNode(t[0]);
    uc(e);
  }
  var pn = /* @__PURE__ */ new Map(), Bm = /* @__PURE__ */ new Set();
  function dr(e) {
    return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument;
  }
  var Fn = G.d;
  G.d = {
    f: cy,
    r: uy,
    D: oy,
    C: fy,
    L: dy,
    m: hy,
    X: py,
    S: my,
    M: gy
  };
  function cy() {
    var e = Fn.f(), t = lr();
    return e || t;
  }
  function uy(e) {
    var t = la(e);
    t !== null && t.tag === 5 && t.type === "form" ? nh(t) : Fn.r(e);
  }
  var Da = typeof document > "u" ? null : document;
  function qm(e, t, n) {
    var l = Da;
    if (l && typeof t == "string" && t) {
      var i = rn(t);
      i = 'link[rel="' + e + '"][href="' + i + '"]', typeof n == "string" && (i += '[crossorigin="' + n + '"]'), Bm.has(i) || (Bm.add(i), e = { rel: e, crossOrigin: n, href: t }, l.querySelector(i) === null && (t = l.createElement("link"), Et(t, "link", e), vt(t), l.head.appendChild(t)));
    }
  }
  function oy(e) {
    Fn.D(e), qm("dns-prefetch", e, null);
  }
  function fy(e, t) {
    Fn.C(e, t), qm("preconnect", e, t);
  }
  function dy(e, t, n) {
    Fn.L(e, t, n);
    var l = Da;
    if (l && e && t) {
      var i = 'link[rel="preload"][as="' + rn(t) + '"]';
      t === "image" && n && n.imageSrcSet ? (i += '[imagesrcset="' + rn(
        n.imageSrcSet
      ) + '"]', typeof n.imageSizes == "string" && (i += '[imagesizes="' + rn(
        n.imageSizes
      ) + '"]')) : i += '[href="' + rn(e) + '"]';
      var c = i;
      switch (t) {
        case "style":
          c = Ha(e);
          break;
        case "script":
          c = Ua(e);
      }
      pn.has(c) || (e = _(
        {
          rel: "preload",
          href: t === "image" && n && n.imageSrcSet ? void 0 : e,
          as: t
        },
        n
      ), pn.set(c, e), l.querySelector(i) !== null || t === "style" && l.querySelector(Hs(c)) || t === "script" && l.querySelector(Us(c)) || (t = l.createElement("link"), Et(t, "link", e), vt(t), l.head.appendChild(t)));
    }
  }
  function hy(e, t) {
    Fn.m(e, t);
    var n = Da;
    if (n && e) {
      var l = t && typeof t.as == "string" ? t.as : "script", i = 'link[rel="modulepreload"][as="' + rn(l) + '"][href="' + rn(e) + '"]', c = i;
      switch (l) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          c = Ua(e);
      }
      if (!pn.has(c) && (e = _({ rel: "modulepreload", href: e }, t), pn.set(c, e), n.querySelector(i) === null)) {
        switch (l) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (n.querySelector(Us(c)))
              return;
        }
        l = n.createElement("link"), Et(l, "link", e), vt(l), n.head.appendChild(l);
      }
    }
  }
  function my(e, t, n) {
    Fn.S(e, t, n);
    var l = Da;
    if (l && e) {
      var i = aa(l).hoistableStyles, c = Ha(e);
      t = t || "default";
      var h = i.get(c);
      if (!h) {
        var v = { loading: 0, preload: null };
        if (h = l.querySelector(
          Hs(c)
        ))
          v.loading = 5;
        else {
          e = _(
            { rel: "stylesheet", href: e, "data-precedence": t },
            n
          ), (n = pn.get(c)) && co(e, n);
          var w = h = l.createElement("link");
          vt(w), Et(w, "link", e), w._p = new Promise(function(C, H) {
            w.onload = C, w.onerror = H;
          }), w.addEventListener("load", function() {
            v.loading |= 1;
          }), w.addEventListener("error", function() {
            v.loading |= 2;
          }), v.loading |= 4, hr(h, t, l);
        }
        h = {
          type: "stylesheet",
          instance: h,
          count: 1,
          state: v
        }, i.set(c, h);
      }
    }
  }
  function py(e, t) {
    Fn.X(e, t);
    var n = Da;
    if (n && e) {
      var l = aa(n).hoistableScripts, i = Ua(e), c = l.get(i);
      c || (c = n.querySelector(Us(i)), c || (e = _({ src: e, async: !0 }, t), (t = pn.get(i)) && uo(e, t), c = n.createElement("script"), vt(c), Et(c, "link", e), n.head.appendChild(c)), c = {
        type: "script",
        instance: c,
        count: 1,
        state: null
      }, l.set(i, c));
    }
  }
  function gy(e, t) {
    Fn.M(e, t);
    var n = Da;
    if (n && e) {
      var l = aa(n).hoistableScripts, i = Ua(e), c = l.get(i);
      c || (c = n.querySelector(Us(i)), c || (e = _({ src: e, async: !0, type: "module" }, t), (t = pn.get(i)) && uo(e, t), c = n.createElement("script"), vt(c), Et(c, "link", e), n.head.appendChild(c)), c = {
        type: "script",
        instance: c,
        count: 1,
        state: null
      }, l.set(i, c));
    }
  }
  function Ym(e, t, n, l) {
    var i = (i = Q.current) ? dr(i) : null;
    if (!i) throw Error(u(446));
    switch (e) {
      case "meta":
      case "title":
        return null;
      case "style":
        return typeof n.precedence == "string" && typeof n.href == "string" ? (t = Ha(n.href), n = aa(
          i
        ).hoistableStyles, l = n.get(t), l || (l = {
          type: "style",
          instance: null,
          count: 0,
          state: null
        }, n.set(t, l)), l) : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if (n.rel === "stylesheet" && typeof n.href == "string" && typeof n.precedence == "string") {
          e = Ha(n.href);
          var c = aa(
            i
          ).hoistableStyles, h = c.get(e);
          if (h || (i = i.ownerDocument || i, h = {
            type: "stylesheet",
            instance: null,
            count: 0,
            state: { loading: 0, preload: null }
          }, c.set(e, h), (c = i.querySelector(
            Hs(e)
          )) && !c._p && (h.instance = c, h.state.loading = 5), pn.has(e) || (n = {
            rel: "preload",
            as: "style",
            href: n.href,
            crossOrigin: n.crossOrigin,
            integrity: n.integrity,
            media: n.media,
            hrefLang: n.hrefLang,
            referrerPolicy: n.referrerPolicy
          }, pn.set(e, n), c || yy(
            i,
            e,
            n,
            h.state
          ))), t && l === null)
            throw Error(u(528, ""));
          return h;
        }
        if (t && l !== null)
          throw Error(u(529, ""));
        return null;
      case "script":
        return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = Ua(n), n = aa(
          i
        ).hoistableScripts, l = n.get(t), l || (l = {
          type: "script",
          instance: null,
          count: 0,
          state: null
        }, n.set(t, l)), l) : { type: "void", instance: null, count: 0, state: null };
      default:
        throw Error(u(444, e));
    }
  }
  function Ha(e) {
    return 'href="' + rn(e) + '"';
  }
  function Hs(e) {
    return 'link[rel="stylesheet"][' + e + "]";
  }
  function Gm(e) {
    return _({}, e, {
      "data-precedence": e.precedence,
      precedence: null
    });
  }
  function yy(e, t, n, l) {
    e.querySelector('link[rel="preload"][as="style"][' + t + "]") ? l.loading = 1 : (t = e.createElement("link"), l.preload = t, t.addEventListener("load", function() {
      return l.loading |= 1;
    }), t.addEventListener("error", function() {
      return l.loading |= 2;
    }), Et(t, "link", n), vt(t), e.head.appendChild(t));
  }
  function Ua(e) {
    return '[src="' + rn(e) + '"]';
  }
  function Us(e) {
    return "script[async]" + e;
  }
  function Xm(e, t, n) {
    if (t.count++, t.instance === null)
      switch (t.type) {
        case "style":
          var l = e.querySelector(
            'style[data-href~="' + rn(n.href) + '"]'
          );
          if (l)
            return t.instance = l, vt(l), l;
          var i = _({}, n, {
            "data-href": n.href,
            "data-precedence": n.precedence,
            href: null,
            precedence: null
          });
          return l = (e.ownerDocument || e).createElement(
            "style"
          ), vt(l), Et(l, "style", i), hr(l, n.precedence, e), t.instance = l;
        case "stylesheet":
          i = Ha(n.href);
          var c = e.querySelector(
            Hs(i)
          );
          if (c)
            return t.state.loading |= 4, t.instance = c, vt(c), c;
          l = Gm(n), (i = pn.get(i)) && co(l, i), c = (e.ownerDocument || e).createElement("link"), vt(c);
          var h = c;
          return h._p = new Promise(function(v, w) {
            h.onload = v, h.onerror = w;
          }), Et(c, "link", l), t.state.loading |= 4, hr(c, n.precedence, e), t.instance = c;
        case "script":
          return c = Ua(n.src), (i = e.querySelector(
            Us(c)
          )) ? (t.instance = i, vt(i), i) : (l = n, (i = pn.get(c)) && (l = _({}, n), uo(l, i)), e = e.ownerDocument || e, i = e.createElement("script"), vt(i), Et(i, "link", l), e.head.appendChild(i), t.instance = i);
        case "void":
          return null;
        default:
          throw Error(u(443, t.type));
      }
    else
      t.type === "stylesheet" && (t.state.loading & 4) === 0 && (l = t.instance, t.state.loading |= 4, hr(l, n.precedence, e));
    return t.instance;
  }
  function hr(e, t, n) {
    for (var l = n.querySelectorAll(
      'link[rel="stylesheet"][data-precedence],style[data-precedence]'
    ), i = l.length ? l[l.length - 1] : null, c = i, h = 0; h < l.length; h++) {
      var v = l[h];
      if (v.dataset.precedence === t) c = v;
      else if (c !== i) break;
    }
    c ? c.parentNode.insertBefore(e, c.nextSibling) : (t = n.nodeType === 9 ? n.head : n, t.insertBefore(e, t.firstChild));
  }
  function co(e, t) {
    e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.title == null && (e.title = t.title);
  }
  function uo(e, t) {
    e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.integrity == null && (e.integrity = t.integrity);
  }
  var mr = null;
  function Vm(e, t, n) {
    if (mr === null) {
      var l = /* @__PURE__ */ new Map(), i = mr = /* @__PURE__ */ new Map();
      i.set(n, l);
    } else
      i = mr, l = i.get(n), l || (l = /* @__PURE__ */ new Map(), i.set(n, l));
    if (l.has(e)) return l;
    for (l.set(e, null), n = n.getElementsByTagName(e), i = 0; i < n.length; i++) {
      var c = n[i];
      if (!(c[Pa] || c[jt] || e === "link" && c.getAttribute("rel") === "stylesheet") && c.namespaceURI !== "http://www.w3.org/2000/svg") {
        var h = c.getAttribute(t) || "";
        h = e + h;
        var v = l.get(h);
        v ? v.push(c) : l.set(h, [c]);
      }
    }
    return l;
  }
  function Qm(e, t, n) {
    e = e.ownerDocument || e, e.head.insertBefore(
      n,
      t === "title" ? e.querySelector("head > title") : null
    );
  }
  function vy(e, t, n) {
    if (n === 1 || t.itemProp != null) return !1;
    switch (e) {
      case "meta":
      case "title":
        return !0;
      case "style":
        if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "")
          break;
        return !0;
      case "link":
        if (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" || t.onLoad || t.onError)
          break;
        switch (t.rel) {
          case "stylesheet":
            return e = t.disabled, typeof t.precedence == "string" && e == null;
          default:
            return !0;
        }
      case "script":
        if (t.async && typeof t.async != "function" && typeof t.async != "symbol" && !t.onLoad && !t.onError && t.src && typeof t.src == "string")
          return !0;
    }
    return !1;
  }
  function Zm(e) {
    return !(e.type === "stylesheet" && (e.state.loading & 3) === 0);
  }
  function xy(e, t, n, l) {
    if (n.type === "stylesheet" && (typeof l.media != "string" || matchMedia(l.media).matches !== !1) && (n.state.loading & 4) === 0) {
      if (n.instance === null) {
        var i = Ha(l.href), c = t.querySelector(
          Hs(i)
        );
        if (c) {
          t = c._p, t !== null && typeof t == "object" && typeof t.then == "function" && (e.count++, e = pr.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = c, vt(c);
          return;
        }
        c = t.ownerDocument || t, l = Gm(l), (i = pn.get(i)) && co(l, i), c = c.createElement("link"), vt(c);
        var h = c;
        h._p = new Promise(function(v, w) {
          h.onload = v, h.onerror = w;
        }), Et(c, "link", l), n.instance = c;
      }
      e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(n, t), (t = n.state.preload) && (n.state.loading & 3) === 0 && (e.count++, n = pr.bind(e), t.addEventListener("load", n), t.addEventListener("error", n));
    }
  }
  var oo = 0;
  function _y(e, t) {
    return e.stylesheets && e.count === 0 && yr(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(n) {
      var l = setTimeout(function() {
        if (e.stylesheets && yr(e, e.stylesheets), e.unsuspend) {
          var c = e.unsuspend;
          e.unsuspend = null, c();
        }
      }, 6e4 + t);
      0 < e.imgBytes && oo === 0 && (oo = 62500 * ey());
      var i = setTimeout(
        function() {
          if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && yr(e, e.stylesheets), e.unsuspend)) {
            var c = e.unsuspend;
            e.unsuspend = null, c();
          }
        },
        (e.imgBytes > oo ? 50 : 800) + t
      );
      return e.unsuspend = n, function() {
        e.unsuspend = null, clearTimeout(l), clearTimeout(i);
      };
    } : null;
  }
  function pr() {
    if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
      if (this.stylesheets) yr(this, this.stylesheets);
      else if (this.unsuspend) {
        var e = this.unsuspend;
        this.unsuspend = null, e();
      }
    }
  }
  var gr = null;
  function yr(e, t) {
    e.stylesheets = null, e.unsuspend !== null && (e.count++, gr = /* @__PURE__ */ new Map(), t.forEach(by, e), gr = null, pr.call(e));
  }
  function by(e, t) {
    if (!(t.state.loading & 4)) {
      var n = gr.get(e);
      if (n) var l = n.get(null);
      else {
        n = /* @__PURE__ */ new Map(), gr.set(e, n);
        for (var i = e.querySelectorAll(
          "link[data-precedence],style[data-precedence]"
        ), c = 0; c < i.length; c++) {
          var h = i[c];
          (h.nodeName === "LINK" || h.getAttribute("media") !== "not all") && (n.set(h.dataset.precedence, h), l = h);
        }
        l && n.set(null, l);
      }
      i = t.instance, h = i.getAttribute("data-precedence"), c = n.get(h) || l, c === l && n.set(null, i), n.set(h, i), this.count++, l = pr.bind(this), i.addEventListener("load", l), i.addEventListener("error", l), c ? c.parentNode.insertBefore(i, c.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(i, e.firstChild)), t.state.loading |= 4;
    }
  }
  var Ls = {
    $$typeof: L,
    Provider: null,
    Consumer: null,
    _currentValue: ee,
    _currentValue2: ee,
    _threadCount: 0
  };
  function wy(e, t, n, l, i, c, h, v, w) {
    this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = sc(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = sc(0), this.hiddenUpdates = sc(null), this.identifierPrefix = l, this.onUncaughtError = i, this.onCaughtError = c, this.onRecoverableError = h, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = w, this.incompleteTransitions = /* @__PURE__ */ new Map();
  }
  function Km(e, t, n, l, i, c, h, v, w, C, H, q) {
    return e = new wy(
      e,
      t,
      n,
      h,
      w,
      C,
      H,
      q,
      v
    ), t = 1, c === !0 && (t |= 24), c = Jt(3, null, null, t), e.current = c, c.stateNode = e, t = Xc(), t.refCount++, e.pooledCache = t, t.refCount++, c.memoizedState = {
      element: l,
      isDehydrated: n,
      cache: t
    }, Kc(c), e;
  }
  function Jm(e) {
    return e ? (e = ma, e) : ma;
  }
  function $m(e, t, n, l, i, c) {
    i = Jm(i), l.context === null ? l.context = i : l.pendingContext = i, l = cl(t), l.payload = { element: n }, c = c === void 0 ? null : c, c !== null && (l.callback = c), n = ul(e, l, t), n !== null && (Yt(n, e, t), gs(n, e, t));
  }
  function Wm(e, t) {
    if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
      var n = e.retryLane;
      e.retryLane = n !== 0 && n < t ? n : t;
    }
  }
  function fo(e, t) {
    Wm(e, t), (e = e.alternate) && Wm(e, t);
  }
  function Fm(e) {
    if (e.tag === 13 || e.tag === 31) {
      var t = Dl(e, 67108864);
      t !== null && Yt(t, e, 67108864), fo(e, 67108864);
    }
  }
  function Im(e) {
    if (e.tag === 13 || e.tag === 31) {
      var t = Pt();
      t = ic(t);
      var n = Dl(e, t);
      n !== null && Yt(n, e, t), fo(e, t);
    }
  }
  var vr = !0;
  function Sy(e, t, n, l) {
    var i = z.T;
    z.T = null;
    var c = G.p;
    try {
      G.p = 2, ho(e, t, n, l);
    } finally {
      G.p = c, z.T = i;
    }
  }
  function jy(e, t, n, l) {
    var i = z.T;
    z.T = null;
    var c = G.p;
    try {
      G.p = 8, ho(e, t, n, l);
    } finally {
      G.p = c, z.T = i;
    }
  }
  function ho(e, t, n, l) {
    if (vr) {
      var i = mo(l);
      if (i === null)
        Iu(
          e,
          t,
          l,
          xr,
          n
        ), e0(e, l);
      else if (My(
        i,
        e,
        t,
        n,
        l
      ))
        l.stopPropagation();
      else if (e0(e, l), t & 4 && -1 < Ny.indexOf(e)) {
        for (; i !== null; ) {
          var c = la(i);
          if (c !== null)
            switch (c.tag) {
              case 3:
                if (c = c.stateNode, c.current.memoizedState.isDehydrated) {
                  var h = Ot(c.pendingLanes);
                  if (h !== 0) {
                    var v = c;
                    for (v.pendingLanes |= 2, v.entangledLanes |= 2; h; ) {
                      var w = 1 << 31 - zt(h);
                      v.entanglements[1] |= w, h &= ~w;
                    }
                    Tn(c), (qe & 6) === 0 && (tr = Re() + 500, Os(0));
                  }
                }
                break;
              case 31:
              case 13:
                v = Dl(c, 2), v !== null && Yt(v, c, 2), lr(), fo(c, 2);
            }
          if (c = mo(l), c === null && Iu(
            e,
            t,
            l,
            xr,
            n
          ), c === i) break;
          i = c;
        }
        i !== null && l.stopPropagation();
      } else
        Iu(
          e,
          t,
          l,
          null,
          n
        );
    }
  }
  function mo(e) {
    return e = pc(e), po(e);
  }
  var xr = null;
  function po(e) {
    if (xr = null, e = na(e), e !== null) {
      var t = d(e);
      if (t === null) e = null;
      else {
        var n = t.tag;
        if (n === 13) {
          if (e = m(t), e !== null) return e;
          e = null;
        } else if (n === 31) {
          if (e = p(t), e !== null) return e;
          e = null;
        } else if (n === 3) {
          if (t.stateNode.current.memoizedState.isDehydrated)
            return t.tag === 3 ? t.stateNode.containerInfo : null;
          e = null;
        } else t !== e && (e = null);
      }
    }
    return xr = e, null;
  }
  function Pm(e) {
    switch (e) {
      case "beforetoggle":
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "toggle":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 2;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 8;
      case "message":
        switch (nt()) {
          case wt:
            return 2;
          case gn:
            return 8;
          case ln:
          case Rn:
            return 32;
          case St:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var go = !1, _l = null, bl = null, wl = null, Bs = /* @__PURE__ */ new Map(), qs = /* @__PURE__ */ new Map(), Sl = [], Ny = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
    " "
  );
  function e0(e, t) {
    switch (e) {
      case "focusin":
      case "focusout":
        _l = null;
        break;
      case "dragenter":
      case "dragleave":
        bl = null;
        break;
      case "mouseover":
      case "mouseout":
        wl = null;
        break;
      case "pointerover":
      case "pointerout":
        Bs.delete(t.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        qs.delete(t.pointerId);
    }
  }
  function Ys(e, t, n, l, i, c) {
    return e === null || e.nativeEvent !== c ? (e = {
      blockedOn: t,
      domEventName: n,
      eventSystemFlags: l,
      nativeEvent: c,
      targetContainers: [i]
    }, t !== null && (t = la(t), t !== null && Fm(t)), e) : (e.eventSystemFlags |= l, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
  }
  function My(e, t, n, l, i) {
    switch (t) {
      case "focusin":
        return _l = Ys(
          _l,
          e,
          t,
          n,
          l,
          i
        ), !0;
      case "dragenter":
        return bl = Ys(
          bl,
          e,
          t,
          n,
          l,
          i
        ), !0;
      case "mouseover":
        return wl = Ys(
          wl,
          e,
          t,
          n,
          l,
          i
        ), !0;
      case "pointerover":
        var c = i.pointerId;
        return Bs.set(
          c,
          Ys(
            Bs.get(c) || null,
            e,
            t,
            n,
            l,
            i
          )
        ), !0;
      case "gotpointercapture":
        return c = i.pointerId, qs.set(
          c,
          Ys(
            qs.get(c) || null,
            e,
            t,
            n,
            l,
            i
          )
        ), !0;
    }
    return !1;
  }
  function t0(e) {
    var t = na(e.target);
    if (t !== null) {
      var n = d(t);
      if (n !== null) {
        if (t = n.tag, t === 13) {
          if (t = m(n), t !== null) {
            e.blockedOn = t, pf(e.priority, function() {
              Im(n);
            });
            return;
          }
        } else if (t === 31) {
          if (t = p(n), t !== null) {
            e.blockedOn = t, pf(e.priority, function() {
              Im(n);
            });
            return;
          }
        } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
          e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
          return;
        }
      }
    }
    e.blockedOn = null;
  }
  function _r(e) {
    if (e.blockedOn !== null) return !1;
    for (var t = e.targetContainers; 0 < t.length; ) {
      var n = mo(e.nativeEvent);
      if (n === null) {
        n = e.nativeEvent;
        var l = new n.constructor(
          n.type,
          n
        );
        mc = l, n.target.dispatchEvent(l), mc = null;
      } else
        return t = la(n), t !== null && Fm(t), e.blockedOn = n, !1;
      t.shift();
    }
    return !0;
  }
  function n0(e, t, n) {
    _r(e) && n.delete(t);
  }
  function Ty() {
    go = !1, _l !== null && _r(_l) && (_l = null), bl !== null && _r(bl) && (bl = null), wl !== null && _r(wl) && (wl = null), Bs.forEach(n0), qs.forEach(n0);
  }
  function br(e, t) {
    e.blockedOn === t && (e.blockedOn = null, go || (go = !0, a.unstable_scheduleCallback(
      a.unstable_NormalPriority,
      Ty
    )));
  }
  var wr = null;
  function l0(e) {
    wr !== e && (wr = e, a.unstable_scheduleCallback(
      a.unstable_NormalPriority,
      function() {
        wr === e && (wr = null);
        for (var t = 0; t < e.length; t += 3) {
          var n = e[t], l = e[t + 1], i = e[t + 2];
          if (typeof l != "function") {
            if (po(l || n) === null)
              continue;
            break;
          }
          var c = la(n);
          c !== null && (e.splice(t, 3), t -= 3, hu(
            c,
            {
              pending: !0,
              data: i,
              method: n.method,
              action: l
            },
            l,
            i
          ));
        }
      }
    ));
  }
  function La(e) {
    function t(w) {
      return br(w, e);
    }
    _l !== null && br(_l, e), bl !== null && br(bl, e), wl !== null && br(wl, e), Bs.forEach(t), qs.forEach(t);
    for (var n = 0; n < Sl.length; n++) {
      var l = Sl[n];
      l.blockedOn === e && (l.blockedOn = null);
    }
    for (; 0 < Sl.length && (n = Sl[0], n.blockedOn === null); )
      t0(n), n.blockedOn === null && Sl.shift();
    if (n = (e.ownerDocument || e).$$reactFormReplay, n != null)
      for (l = 0; l < n.length; l += 3) {
        var i = n[l], c = n[l + 1], h = i[Dt] || null;
        if (typeof c == "function")
          h || l0(n);
        else if (h) {
          var v = null;
          if (c && c.hasAttribute("formAction")) {
            if (i = c, h = c[Dt] || null)
              v = h.formAction;
            else if (po(i) !== null) continue;
          } else v = h.action;
          typeof v == "function" ? n[l + 1] = v : (n.splice(l, 3), l -= 3), l0(n);
        }
      }
  }
  function a0() {
    function e(c) {
      c.canIntercept && c.info === "react-transition" && c.intercept({
        handler: function() {
          return new Promise(function(h) {
            return i = h;
          });
        },
        focusReset: "manual",
        scroll: "manual"
      });
    }
    function t() {
      i !== null && (i(), i = null), l || setTimeout(n, 20);
    }
    function n() {
      if (!l && !navigation.transition) {
        var c = navigation.currentEntry;
        c && c.url != null && navigation.navigate(c.url, {
          state: c.getState(),
          info: "react-transition",
          history: "replace"
        });
      }
    }
    if (typeof navigation == "object") {
      var l = !1, i = null;
      return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(n, 100), function() {
        l = !0, navigation.removeEventListener("navigate", e), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), i !== null && (i(), i = null);
      };
    }
  }
  function yo(e) {
    this._internalRoot = e;
  }
  Sr.prototype.render = yo.prototype.render = function(e) {
    var t = this._internalRoot;
    if (t === null) throw Error(u(409));
    var n = t.current, l = Pt();
    $m(n, l, e, t, null, null);
  }, Sr.prototype.unmount = yo.prototype.unmount = function() {
    var e = this._internalRoot;
    if (e !== null) {
      this._internalRoot = null;
      var t = e.containerInfo;
      $m(e.current, 2, null, e, null, null), lr(), t[ta] = null;
    }
  };
  function Sr(e) {
    this._internalRoot = e;
  }
  Sr.prototype.unstable_scheduleHydration = function(e) {
    if (e) {
      var t = mf();
      e = { blockedOn: null, target: e, priority: t };
      for (var n = 0; n < Sl.length && t !== 0 && t < Sl[n].priority; n++) ;
      Sl.splice(n, 0, e), n === 0 && t0(e);
    }
  };
  var s0 = s.version;
  if (s0 !== "19.2.5")
    throw Error(
      u(
        527,
        s0,
        "19.2.5"
      )
    );
  G.findDOMNode = function(e) {
    var t = e._reactInternals;
    if (t === void 0)
      throw typeof e.render == "function" ? Error(u(188)) : (e = Object.keys(e).join(","), Error(u(268, e)));
    return e = g(t), e = e !== null ? x(e) : null, e = e === null ? null : e.stateNode, e;
  };
  var Ey = {
    bundleType: 0,
    version: "19.2.5",
    rendererPackageName: "react-dom",
    currentDispatcherRef: z,
    reconcilerVersion: "19.2.5"
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var jr = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!jr.isDisabled && jr.supportsFiber)
      try {
        Fe = jr.inject(
          Ey
        ), Be = jr;
      } catch {
      }
  }
  return Xs.createRoot = function(e, t) {
    if (!f(e)) throw Error(u(299));
    var n = !1, l = "", i = dh, c = hh, h = mh;
    return t != null && (t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (l = t.identifierPrefix), t.onUncaughtError !== void 0 && (i = t.onUncaughtError), t.onCaughtError !== void 0 && (c = t.onCaughtError), t.onRecoverableError !== void 0 && (h = t.onRecoverableError)), t = Km(
      e,
      1,
      !1,
      null,
      null,
      n,
      l,
      null,
      i,
      c,
      h,
      a0
    ), e[ta] = t.current, Fu(e), new yo(t);
  }, Xs.hydrateRoot = function(e, t, n) {
    if (!f(e)) throw Error(u(299));
    var l = !1, i = "", c = dh, h = hh, v = mh, w = null;
    return n != null && (n.unstable_strictMode === !0 && (l = !0), n.identifierPrefix !== void 0 && (i = n.identifierPrefix), n.onUncaughtError !== void 0 && (c = n.onUncaughtError), n.onCaughtError !== void 0 && (h = n.onCaughtError), n.onRecoverableError !== void 0 && (v = n.onRecoverableError), n.formState !== void 0 && (w = n.formState)), t = Km(
      e,
      1,
      !0,
      t,
      n ?? null,
      l,
      i,
      w,
      c,
      h,
      v,
      a0
    ), t.context = Jm(null), n = t.current, l = Pt(), l = ic(l), i = cl(l), i.callback = null, ul(n, i, l), n = l, t.current.lanes = n, Ia(t, n), Tn(t), e[ta] = t.current, Fu(e), new Sr(t);
  }, Xs.version = "19.2.5", Xs;
}
var p0;
function qy() {
  if (p0) return xo.exports;
  p0 = 1;
  function a() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(a);
      } catch (s) {
        console.error(s);
      }
  }
  return a(), xo.exports = By(), xo.exports;
}
var Yy = qy(), R = $o();
class ap {
  constructor() {
    Nr(this, "_hass", null);
    Nr(this, "_entityListeners", /* @__PURE__ */ new Map());
    Nr(this, "_globalListeners", /* @__PURE__ */ new Set());
  }
  get hass() {
    return this._hass;
  }
  update(s) {
    this._hass = s;
    for (const r of this._entityListeners.values())
      r.forEach((u) => u());
    this._globalListeners.forEach((r) => r());
  }
  getEntity(s) {
    var r;
    return ((r = this._hass) == null ? void 0 : r.states[s]) ?? null;
  }
  subscribeEntity(s, r) {
    return this._entityListeners.has(s) || this._entityListeners.set(s, /* @__PURE__ */ new Set()), this._entityListeners.get(s).add(r), () => {
      var u;
      (u = this._entityListeners.get(s)) == null || u.delete(r);
    };
  }
  subscribeGlobal(s) {
    return this._globalListeners.add(s), () => {
      this._globalListeners.delete(s);
    };
  }
  async callService(s, r, u, f) {
    if (!this._hass) throw new Error("Not connected to Home Assistant");
    return this._hass.callService(s, r, u, f);
  }
}
const sp = R.createContext(new ap());
function Va() {
  return R.useContext(sp);
}
function Gy({ children: a }) {
  const s = R.useRef(new ap());
  return R.useEffect(() => {
    const r = () => {
      const u = window.__HASS__;
      u && s.current.update(u);
    };
    return window.addEventListener("hass-updated", r), r(), () => window.removeEventListener("hass-updated", r);
  }, []), /* @__PURE__ */ o.jsx(sp.Provider, { value: s.current, children: a });
}
function Pl(a, s = 24) {
  const r = Va(), [u, f] = R.useState([]), [d, m] = R.useState(!1), p = R.useRef(null), y = R.useRef(0), g = R.useCallback(() => {
    if (!a) return;
    const x = r.getEntity(a);
    if (!x) return;
    const _ = x.state, S = parseFloat(_);
    if (!Number.isFinite(S)) return;
    const j = new Date(x.last_updated || x.last_changed).getTime();
    !Number.isFinite(j) || j <= y.current || (y.current = j, f((T) => [...T, { t: j, v: S }]));
  }, [a, r]);
  return R.useEffect(() => {
    var L, I, se;
    if (!a) {
      f([]);
      return;
    }
    const x = r.hass;
    if (!x) return;
    (L = p.current) == null || L.abort();
    const _ = new AbortController();
    p.current = _, m(!0);
    const S = /* @__PURE__ */ new Date(), T = new Date(S.getTime() - s * 36e5).toISOString(), D = S.toISOString(), V = `${window.__HA_BASE_URL__ || ""}/api/history/period/${T}?end_time=${D}&filter_entity_id=${encodeURIComponent(a)}&minimal_response&no_attributes`, J = (se = (I = x.auth) == null ? void 0 : I.data) == null ? void 0 : se.access_token;
    return fetch(V, {
      headers: { Authorization: `Bearer ${J}`, "Content-Type": "application/json" },
      signal: _.signal
    }).then((Z) => {
      if (!Z.ok) throw new Error(`HTTP ${Z.status}`);
      return Z.json();
    }).then((Z) => {
      if (_.signal.aborted) return;
      const F = [], $ = (Z == null ? void 0 : Z[0]) ?? [];
      for (const fe of $) {
        const we = parseFloat(fe.state ?? fe.s);
        if (!Number.isFinite(we)) continue;
        const me = new Date(fe.last_changed ?? fe.lu * 1e3).getTime();
        Number.isFinite(me) && F.push({ t: me, v: we });
      }
      f(F), y.current = F.length > 0 ? F[F.length - 1].t : 0;
    }).catch((Z) => {
      Z.name !== "AbortError" && console.error("[useHistory]", Z);
    }).finally(() => {
      _.signal.aborted || m(!1);
    }), () => _.abort();
  }, [a, s, r]), R.useEffect(() => {
    if (a)
      return r.subscribeEntity(a, g);
  }, [a, r, g]), { data: u, loading: d };
}
function ue(a) {
  const s = Va(), r = R.useCallback(
    (f) => s.subscribeEntity(a, f),
    [s, a]
  ), u = R.useCallback(
    () => s.getEntity(a),
    [s, a]
  );
  return R.useSyncExternalStore(r, u);
}
function X(a) {
  const s = ue(a), r = s == null ? void 0 : s.state;
  if (r === void 0 || r === "unknown" || r === "unavailable")
    return { value: null, entity: s };
  const u = Number(r);
  return { value: Number.isFinite(u) ? u : null, entity: s };
}
function ip(a) {
  var s, r, u = "";
  if (typeof a == "string" || typeof a == "number") u += a;
  else if (typeof a == "object") if (Array.isArray(a)) {
    var f = a.length;
    for (s = 0; s < f; s++) a[s] && (r = ip(a[s])) && (u && (u += " "), u += r);
  } else for (r in a) a[r] && (u && (u += " "), u += r);
  return u;
}
function rp() {
  for (var a, s, r = 0, u = "", f = arguments.length; r < f; r++) (a = arguments[r]) && (s = ip(a)) && (u && (u += " "), u += s);
  return u;
}
const Wo = "-", Xy = (a) => {
  const s = Qy(a), {
    conflictingClassGroups: r,
    conflictingClassGroupModifiers: u
  } = a;
  return {
    getClassGroupId: (m) => {
      const p = m.split(Wo);
      return p[0] === "" && p.length !== 1 && p.shift(), cp(p, s) || Vy(m);
    },
    getConflictingClassGroupIds: (m, p) => {
      const y = r[m] || [];
      return p && u[m] ? [...y, ...u[m]] : y;
    }
  };
}, cp = (a, s) => {
  var m;
  if (a.length === 0)
    return s.classGroupId;
  const r = a[0], u = s.nextPart.get(r), f = u ? cp(a.slice(1), u) : void 0;
  if (f)
    return f;
  if (s.validators.length === 0)
    return;
  const d = a.join(Wo);
  return (m = s.validators.find(({
    validator: p
  }) => p(d))) == null ? void 0 : m.classGroupId;
}, g0 = /^\[(.+)\]$/, Vy = (a) => {
  if (g0.test(a)) {
    const s = g0.exec(a)[1], r = s == null ? void 0 : s.substring(0, s.indexOf(":"));
    if (r)
      return "arbitrary.." + r;
  }
}, Qy = (a) => {
  const {
    theme: s,
    prefix: r
  } = a, u = {
    nextPart: /* @__PURE__ */ new Map(),
    validators: []
  };
  return Ky(Object.entries(a.classGroups), r).forEach(([d, m]) => {
    Do(m, u, d, s);
  }), u;
}, Do = (a, s, r, u) => {
  a.forEach((f) => {
    if (typeof f == "string") {
      const d = f === "" ? s : y0(s, f);
      d.classGroupId = r;
      return;
    }
    if (typeof f == "function") {
      if (Zy(f)) {
        Do(f(u), s, r, u);
        return;
      }
      s.validators.push({
        validator: f,
        classGroupId: r
      });
      return;
    }
    Object.entries(f).forEach(([d, m]) => {
      Do(m, y0(s, d), r, u);
    });
  });
}, y0 = (a, s) => {
  let r = a;
  return s.split(Wo).forEach((u) => {
    r.nextPart.has(u) || r.nextPart.set(u, {
      nextPart: /* @__PURE__ */ new Map(),
      validators: []
    }), r = r.nextPart.get(u);
  }), r;
}, Zy = (a) => a.isThemeGetter, Ky = (a, s) => s ? a.map(([r, u]) => {
  const f = u.map((d) => typeof d == "string" ? s + d : typeof d == "object" ? Object.fromEntries(Object.entries(d).map(([m, p]) => [s + m, p])) : d);
  return [r, f];
}) : a, Jy = (a) => {
  if (a < 1)
    return {
      get: () => {
      },
      set: () => {
      }
    };
  let s = 0, r = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map();
  const f = (d, m) => {
    r.set(d, m), s++, s > a && (s = 0, u = r, r = /* @__PURE__ */ new Map());
  };
  return {
    get(d) {
      let m = r.get(d);
      if (m !== void 0)
        return m;
      if ((m = u.get(d)) !== void 0)
        return f(d, m), m;
    },
    set(d, m) {
      r.has(d) ? r.set(d, m) : f(d, m);
    }
  };
}, up = "!", $y = (a) => {
  const {
    separator: s,
    experimentalParseClassName: r
  } = a, u = s.length === 1, f = s[0], d = s.length, m = (p) => {
    const y = [];
    let g = 0, x = 0, _;
    for (let U = 0; U < p.length; U++) {
      let V = p[U];
      if (g === 0) {
        if (V === f && (u || p.slice(U, U + d) === s)) {
          y.push(p.slice(x, U)), x = U + d;
          continue;
        }
        if (V === "/") {
          _ = U;
          continue;
        }
      }
      V === "[" ? g++ : V === "]" && g--;
    }
    const S = y.length === 0 ? p : p.substring(x), j = S.startsWith(up), T = j ? S.substring(1) : S, D = _ && _ > x ? _ - x : void 0;
    return {
      modifiers: y,
      hasImportantModifier: j,
      baseClassName: T,
      maybePostfixModifierPosition: D
    };
  };
  return r ? (p) => r({
    className: p,
    parseClassName: m
  }) : m;
}, Wy = (a) => {
  if (a.length <= 1)
    return a;
  const s = [];
  let r = [];
  return a.forEach((u) => {
    u[0] === "[" ? (s.push(...r.sort(), u), r = []) : r.push(u);
  }), s.push(...r.sort()), s;
}, Fy = (a) => ({
  cache: Jy(a.cacheSize),
  parseClassName: $y(a),
  ...Xy(a)
}), Iy = /\s+/, Py = (a, s) => {
  const {
    parseClassName: r,
    getClassGroupId: u,
    getConflictingClassGroupIds: f
  } = s, d = [], m = a.trim().split(Iy);
  let p = "";
  for (let y = m.length - 1; y >= 0; y -= 1) {
    const g = m[y], {
      modifiers: x,
      hasImportantModifier: _,
      baseClassName: S,
      maybePostfixModifierPosition: j
    } = r(g);
    let T = !!j, D = u(T ? S.substring(0, j) : S);
    if (!D) {
      if (!T) {
        p = g + (p.length > 0 ? " " + p : p);
        continue;
      }
      if (D = u(S), !D) {
        p = g + (p.length > 0 ? " " + p : p);
        continue;
      }
      T = !1;
    }
    const U = Wy(x).join(":"), V = _ ? U + up : U, J = V + D;
    if (d.includes(J))
      continue;
    d.push(J);
    const L = f(D, T);
    for (let I = 0; I < L.length; ++I) {
      const se = L[I];
      d.push(V + se);
    }
    p = g + (p.length > 0 ? " " + p : p);
  }
  return p;
};
function ev() {
  let a = 0, s, r, u = "";
  for (; a < arguments.length; )
    (s = arguments[a++]) && (r = op(s)) && (u && (u += " "), u += r);
  return u;
}
const op = (a) => {
  if (typeof a == "string")
    return a;
  let s, r = "";
  for (let u = 0; u < a.length; u++)
    a[u] && (s = op(a[u])) && (r && (r += " "), r += s);
  return r;
};
function tv(a, ...s) {
  let r, u, f, d = m;
  function m(y) {
    const g = s.reduce((x, _) => _(x), a());
    return r = Fy(g), u = r.cache.get, f = r.cache.set, d = p, p(y);
  }
  function p(y) {
    const g = u(y);
    if (g)
      return g;
    const x = Py(y, r);
    return f(y, x), x;
  }
  return function() {
    return d(ev.apply(null, arguments));
  };
}
const tt = (a) => {
  const s = (r) => r[a] || [];
  return s.isThemeGetter = !0, s;
}, fp = /^\[(?:([a-z-]+):)?(.+)\]$/i, nv = /^\d+\/\d+$/, lv = /* @__PURE__ */ new Set(["px", "full", "screen"]), av = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, sv = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, iv = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, rv = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, cv = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, In = (a) => Ba(a) || lv.has(a) || nv.test(a), Nl = (a) => Qa(a, "length", gv), Ba = (a) => !!a && !Number.isNaN(Number(a)), jo = (a) => Qa(a, "number", Ba), Vs = (a) => !!a && Number.isInteger(Number(a)), uv = (a) => a.endsWith("%") && Ba(a.slice(0, -1)), _e = (a) => fp.test(a), Ml = (a) => av.test(a), ov = /* @__PURE__ */ new Set(["length", "size", "percentage"]), fv = (a) => Qa(a, ov, dp), dv = (a) => Qa(a, "position", dp), hv = /* @__PURE__ */ new Set(["image", "url"]), mv = (a) => Qa(a, hv, vv), pv = (a) => Qa(a, "", yv), Qs = () => !0, Qa = (a, s, r) => {
  const u = fp.exec(a);
  return u ? u[1] ? typeof s == "string" ? u[1] === s : s.has(u[1]) : r(u[2]) : !1;
}, gv = (a) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  sv.test(a) && !iv.test(a)
), dp = () => !1, yv = (a) => rv.test(a), vv = (a) => cv.test(a), xv = () => {
  const a = tt("colors"), s = tt("spacing"), r = tt("blur"), u = tt("brightness"), f = tt("borderColor"), d = tt("borderRadius"), m = tt("borderSpacing"), p = tt("borderWidth"), y = tt("contrast"), g = tt("grayscale"), x = tt("hueRotate"), _ = tt("invert"), S = tt("gap"), j = tt("gradientColorStops"), T = tt("gradientColorStopPositions"), D = tt("inset"), U = tt("margin"), V = tt("opacity"), J = tt("padding"), L = tt("saturate"), I = tt("scale"), se = tt("sepia"), Z = tt("skew"), F = tt("space"), $ = tt("translate"), fe = () => ["auto", "contain", "none"], we = () => ["auto", "hidden", "clip", "visible", "scroll"], me = () => ["auto", _e, s], P = () => [_e, s], Le = () => ["", In, Nl], he = () => ["auto", Ba, _e], Ne = () => ["bottom", "center", "left", "left-bottom", "left-top", "right", "right-bottom", "right-top", "top"], z = () => ["solid", "dashed", "dotted", "double", "none"], G = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], ee = () => ["start", "end", "center", "between", "around", "evenly", "stretch"], ye = () => ["", "0", _e], Se = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], b = () => [Ba, _e];
  return {
    cacheSize: 500,
    separator: ":",
    theme: {
      colors: [Qs],
      spacing: [In, Nl],
      blur: ["none", "", Ml, _e],
      brightness: b(),
      borderColor: [a],
      borderRadius: ["none", "", "full", Ml, _e],
      borderSpacing: P(),
      borderWidth: Le(),
      contrast: b(),
      grayscale: ye(),
      hueRotate: b(),
      invert: ye(),
      gap: P(),
      gradientColorStops: [a],
      gradientColorStopPositions: [uv, Nl],
      inset: me(),
      margin: me(),
      opacity: b(),
      padding: P(),
      saturate: b(),
      scale: b(),
      sepia: ye(),
      skew: b(),
      space: P(),
      translate: P()
    },
    classGroups: {
      // Layout
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", "video", _e]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       */
      container: ["container"],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [Ml]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": Se()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": Se()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      "break-inside": [{
        "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      "box-decoration": [{
        "box-decoration": ["slice", "clone"]
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ["border", "content"]
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ["right", "left", "none", "start", "end"]
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ["left", "right", "both", "none", "start", "end"]
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ["isolate", "isolation-auto"],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      "object-fit": [{
        object: ["contain", "cover", "fill", "none", "scale-down"]
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      "object-position": [{
        object: [...Ne(), _e]
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: we()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": we()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": we()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: fe()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": fe()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": fe()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ["static", "fixed", "absolute", "relative", "sticky"],
      /**
       * Top / Right / Bottom / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: [D]
      }],
      /**
       * Right / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": [D]
      }],
      /**
       * Top / Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": [D]
      }],
      /**
       * Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      start: [{
        start: [D]
      }],
      /**
       * End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      end: [{
        end: [D]
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: [D]
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: [D]
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: [D]
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: [D]
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ["visible", "invisible", "collapse"],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: ["auto", Vs, _e]
      }],
      // Flexbox and Grid
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: me()
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      "flex-direction": [{
        flex: ["row", "row-reverse", "col", "col-reverse"]
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      "flex-wrap": [{
        flex: ["wrap", "wrap-reverse", "nowrap"]
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: ["1", "auto", "initial", "none", _e]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ye()
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ye()
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: ["first", "last", "none", Vs, _e]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": [Qs]
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: ["auto", {
          span: ["full", Vs, _e]
        }, _e]
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": he()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": he()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": [Qs]
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: ["auto", {
          span: [Vs, _e]
        }, _e]
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": he()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": he()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      "grid-flow": [{
        "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      "auto-cols": [{
        "auto-cols": ["auto", "min", "max", "fr", _e]
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": ["auto", "min", "max", "fr", _e]
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: [S]
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": [S]
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": [S]
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: ["normal", ...ee()]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      "justify-items": [{
        "justify-items": ["start", "end", "center", "stretch"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", "start", "end", "center", "stretch"]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      "align-content": [{
        content: ["normal", ...ee(), "baseline"]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      "align-items": [{
        items: ["start", "end", "center", "baseline", "stretch"]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", "start", "end", "center", "stretch", "baseline"]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      "place-content": [{
        "place-content": [...ee(), "baseline"]
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      "place-items": [{
        "place-items": ["start", "end", "center", "baseline", "stretch"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", "start", "end", "center", "stretch"]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: [J]
      }],
      /**
       * Padding X
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: [J]
      }],
      /**
       * Padding Y
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: [J]
      }],
      /**
       * Padding Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: [J]
      }],
      /**
       * Padding End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: [J]
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: [J]
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: [J]
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: [J]
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: [J]
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: [U]
      }],
      /**
       * Margin X
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: [U]
      }],
      /**
       * Margin Y
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: [U]
      }],
      /**
       * Margin Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: [U]
      }],
      /**
       * Margin End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: [U]
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: [U]
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: [U]
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: [U]
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: [U]
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/space
       */
      "space-x": [{
        "space-x": [F]
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/space
       */
      "space-x-reverse": ["space-x-reverse"],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/space
       */
      "space-y": [{
        "space-y": [F]
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/space
       */
      "space-y-reverse": ["space-y-reverse"],
      // Sizing
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: ["auto", "min", "max", "fit", "svw", "lvw", "dvw", _e, s]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [_e, s, "min", "max", "fit"]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [_e, s, "none", "full", "min", "max", "fit", "prose", {
          screen: [Ml]
        }, Ml]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: [_e, s, "auto", "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": [_e, s, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": [_e, s, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Size
       * @see https://tailwindcss.com/docs/size
       */
      size: [{
        size: [_e, s, "auto", "min", "max", "fit"]
      }],
      // Typography
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", Ml, Nl]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      "font-smoothing": ["antialiased", "subpixel-antialiased"],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      "font-style": ["italic", "not-italic"],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      "font-weight": [{
        font: ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black", jo]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [Qs]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-normal": ["normal-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-ordinal": ["ordinal"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-slashed-zero": ["slashed-zero"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-figure": ["lining-nums", "oldstyle-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-spacing": ["proportional-nums", "tabular-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: ["tighter", "tight", "normal", "wide", "wider", "widest", _e]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": ["none", Ba, jo]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: ["none", "tight", "snug", "normal", "relaxed", "loose", In, _e]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", _e]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["none", "disc", "decimal", _e]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      "list-style-position": [{
        list: ["inside", "outside"]
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/placeholder-color
       */
      "placeholder-color": [{
        placeholder: [a]
      }],
      /**
       * Placeholder Opacity
       * @see https://tailwindcss.com/docs/placeholder-opacity
       */
      "placeholder-opacity": [{
        "placeholder-opacity": [V]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      "text-alignment": [{
        text: ["left", "center", "right", "justify", "start", "end"]
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: [a]
      }],
      /**
       * Text Opacity
       * @see https://tailwindcss.com/docs/text-opacity
       */
      "text-opacity": [{
        "text-opacity": [V]
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      "text-decoration": ["underline", "overline", "line-through", "no-underline"],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      "text-decoration-style": [{
        decoration: [...z(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: ["auto", "from-font", In, Nl]
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": ["auto", In, _e]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: [a]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      "text-wrap": [{
        text: ["wrap", "nowrap", "balance", "pretty"]
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: P()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", _e]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ["normal", "words", "all", "keep"]
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ["none", "manual", "auto"]
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ["none", _e]
      }],
      // Backgrounds
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      "bg-attachment": [{
        bg: ["fixed", "local", "scroll"]
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      "bg-clip": [{
        "bg-clip": ["border", "padding", "content", "text"]
      }],
      /**
       * Background Opacity
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/background-opacity
       */
      "bg-opacity": [{
        "bg-opacity": [V]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      "bg-origin": [{
        "bg-origin": ["border", "padding", "content"]
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      "bg-position": [{
        bg: [...Ne(), dv]
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: ["no-repeat", {
          repeat: ["", "x", "y", "round", "space"]
        }]
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: ["auto", "cover", "contain", fv]
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          "gradient-to": ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
        }, mv]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: [a]
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: [T]
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: [T]
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: [T]
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: [j]
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: [j]
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: [j]
      }],
      // Borders
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: [d]
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": [d]
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": [d]
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": [d]
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": [d]
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": [d]
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": [d]
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": [d]
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": [d]
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": [d]
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": [d]
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": [d]
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": [d]
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": [d]
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": [d]
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: [p]
      }],
      /**
       * Border Width X
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": [p]
      }],
      /**
       * Border Width Y
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": [p]
      }],
      /**
       * Border Width Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": [p]
      }],
      /**
       * Border Width End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": [p]
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": [p]
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": [p]
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": [p]
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": [p]
      }],
      /**
       * Border Opacity
       * @see https://tailwindcss.com/docs/border-opacity
       */
      "border-opacity": [{
        "border-opacity": [V]
      }],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [...z(), "hidden"]
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/divide-width
       */
      "divide-x": [{
        "divide-x": [p]
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/divide-width
       */
      "divide-x-reverse": ["divide-x-reverse"],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/divide-width
       */
      "divide-y": [{
        "divide-y": [p]
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/divide-width
       */
      "divide-y-reverse": ["divide-y-reverse"],
      /**
       * Divide Opacity
       * @see https://tailwindcss.com/docs/divide-opacity
       */
      "divide-opacity": [{
        "divide-opacity": [V]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/divide-style
       */
      "divide-style": [{
        divide: z()
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: [f]
      }],
      /**
       * Border Color X
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": [f]
      }],
      /**
       * Border Color Y
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": [f]
      }],
      /**
       * Border Color S
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": [f]
      }],
      /**
       * Border Color E
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": [f]
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": [f]
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": [f]
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": [f]
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": [f]
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: [f]
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: ["", ...z()]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [In, _e]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: [In, Nl]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: [a]
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/ring-width
       */
      "ring-w": [{
        ring: Le()
      }],
      /**
       * Ring Width Inset
       * @see https://tailwindcss.com/docs/ring-width
       */
      "ring-w-inset": ["ring-inset"],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/ring-color
       */
      "ring-color": [{
        ring: [a]
      }],
      /**
       * Ring Opacity
       * @see https://tailwindcss.com/docs/ring-opacity
       */
      "ring-opacity": [{
        "ring-opacity": [V]
      }],
      /**
       * Ring Offset Width
       * @see https://tailwindcss.com/docs/ring-offset-width
       */
      "ring-offset-w": [{
        "ring-offset": [In, Nl]
      }],
      /**
       * Ring Offset Color
       * @see https://tailwindcss.com/docs/ring-offset-color
       */
      "ring-offset-color": [{
        "ring-offset": [a]
      }],
      // Effects
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: ["", "inner", "none", Ml, pv]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow-color
       */
      "shadow-color": [{
        shadow: [Qs]
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [V]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...G(), "plus-lighter", "plus-darker"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": G()
      }],
      // Filters
      /**
       * Filter
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: ["", "none"]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: [r]
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [u]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [y]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      "drop-shadow": [{
        "drop-shadow": ["", "none", Ml, _e]
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: [g]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [x]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: [_]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [L]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: [se]
      }],
      /**
       * Backdrop Filter
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      "backdrop-filter": [{
        "backdrop-filter": ["", "none"]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      "backdrop-blur": [{
        "backdrop-blur": [r]
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [u]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [y]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": [g]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [x]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": [_]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [V]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [L]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": [se]
      }],
      // Tables
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      "border-collapse": [{
        border: ["collapse", "separate"]
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing": [{
        "border-spacing": [m]
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": [m]
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": [m]
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      "table-layout": [{
        table: ["auto", "fixed"]
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ["top", "bottom"]
      }],
      // Transitions and Animation
      /**
       * Tranisition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ["none", "all", "", "colors", "opacity", "shadow", "transform", _e]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: b()
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "in", "out", "in-out", _e]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: b()
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", "spin", "ping", "pulse", "bounce", _e]
      }],
      // Transforms
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: ["", "gpu", "none"]
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: [I]
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": [I]
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": [I]
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: [Vs, _e]
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": [$]
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": [$]
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": [Z]
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": [Z]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: ["center", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left", _e]
      }],
      // Interactivity
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: ["auto", a]
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ["none", "auto"]
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", _e]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      "caret-color": [{
        caret: [a]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      "pointer-events": [{
        "pointer-events": ["none", "auto"]
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ["none", "y", "x", ""]
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      "scroll-behavior": [{
        scroll: ["auto", "smooth"]
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-m": [{
        "scroll-m": P()
      }],
      /**
       * Scroll Margin X
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": P()
      }],
      /**
       * Scroll Margin Y
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": P()
      }],
      /**
       * Scroll Margin Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": P()
      }],
      /**
       * Scroll Margin End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": P()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": P()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": P()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": P()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": P()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": P()
      }],
      /**
       * Scroll Padding X
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": P()
      }],
      /**
       * Scroll Padding Y
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": P()
      }],
      /**
       * Scroll Padding Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": P()
      }],
      /**
       * Scroll Padding End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": P()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": P()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": P()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": P()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": P()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      "snap-align": [{
        snap: ["start", "end", "center", "align-none"]
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      "snap-stop": [{
        snap: ["normal", "always"]
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-type": [{
        snap: ["none", "x", "y", "both"]
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-strictness": [{
        snap: ["mandatory", "proximity"]
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ["auto", "none", "manipulation"]
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-x": [{
        "touch-pan": ["x", "left", "right"]
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-y": [{
        "touch-pan": ["y", "up", "down"]
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-pz": ["touch-pinch-zoom"],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ["none", "text", "all", "auto"]
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      "will-change": [{
        "will-change": ["auto", "scroll", "contents", "transform", _e]
      }],
      // SVG
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: [a, "none"]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [In, Nl, jo]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: [a, "none"]
      }],
      // Accessibility
      /**
       * Screen Readers
       * @see https://tailwindcss.com/docs/screen-readers
       */
      sr: ["sr-only", "not-sr-only"],
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      "forced-color-adjust": [{
        "forced-color-adjust": ["auto", "none"]
      }]
    },
    conflictingClassGroups: {
      overflow: ["overflow-x", "overflow-y"],
      overscroll: ["overscroll-x", "overscroll-y"],
      inset: ["inset-x", "inset-y", "start", "end", "top", "right", "bottom", "left"],
      "inset-x": ["right", "left"],
      "inset-y": ["top", "bottom"],
      flex: ["basis", "grow", "shrink"],
      gap: ["gap-x", "gap-y"],
      p: ["px", "py", "ps", "pe", "pt", "pr", "pb", "pl"],
      px: ["pr", "pl"],
      py: ["pt", "pb"],
      m: ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"],
      mx: ["mr", "ml"],
      my: ["mt", "mb"],
      size: ["w", "h"],
      "font-size": ["leading"],
      "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
      "fvn-ordinal": ["fvn-normal"],
      "fvn-slashed-zero": ["fvn-normal"],
      "fvn-figure": ["fvn-normal"],
      "fvn-spacing": ["fvn-normal"],
      "fvn-fraction": ["fvn-normal"],
      "line-clamp": ["display", "overflow"],
      rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
      "rounded-s": ["rounded-ss", "rounded-es"],
      "rounded-e": ["rounded-se", "rounded-ee"],
      "rounded-t": ["rounded-tl", "rounded-tr"],
      "rounded-r": ["rounded-tr", "rounded-br"],
      "rounded-b": ["rounded-br", "rounded-bl"],
      "rounded-l": ["rounded-tl", "rounded-bl"],
      "border-spacing": ["border-spacing-x", "border-spacing-y"],
      "border-w": ["border-w-s", "border-w-e", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
      "border-w-x": ["border-w-r", "border-w-l"],
      "border-w-y": ["border-w-t", "border-w-b"],
      "border-color": ["border-color-s", "border-color-e", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
      "border-color-x": ["border-color-r", "border-color-l"],
      "border-color-y": ["border-color-t", "border-color-b"],
      "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
      "scroll-mx": ["scroll-mr", "scroll-ml"],
      "scroll-my": ["scroll-mt", "scroll-mb"],
      "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
      "scroll-px": ["scroll-pr", "scroll-pl"],
      "scroll-py": ["scroll-pt", "scroll-pb"],
      touch: ["touch-x", "touch-y", "touch-pz"],
      "touch-x": ["touch"],
      "touch-y": ["touch"],
      "touch-pz": ["touch"]
    },
    conflictingClassGroupModifiers: {
      "font-size": ["leading"]
    }
  };
}, _v = /* @__PURE__ */ tv(xv);
function ae(...a) {
  return _v(rp(a));
}
function K(a, s = 1) {
  return a != null && Number.isFinite(a) ? a.toFixed(s) : "—";
}
function hp(a) {
  if (!a) return "";
  const s = Date.now() - new Date(a).getTime();
  if (s < 0) return "just now";
  const r = Math.floor(s / 1e3);
  if (r < 10) return "just now";
  if (r < 60) return `${r}s ago`;
  const u = Math.floor(r / 60);
  if (u < 60) return `${u}m ago`;
  const f = Math.floor(u / 60);
  return f < 24 ? `${f}h ago` : `${Math.floor(f / 24)}d ago`;
}
function bv(a, s, r, u = 8700) {
  if (a == null || s == null || r == null || Math.abs(a) < 0.5 || !Number.isFinite(s) || !Number.isFinite(r)) return "";
  const f = a > 0 ? (u - r) / Math.abs(s) : r / Math.abs(s);
  if (!Number.isFinite(f) || f > 48) return "";
  const d = Math.floor(f), m = Math.round((f - d) * 60);
  return a > 0 ? `${d}h ${m}m to full` : `${d}h ${m}m left`;
}
function Za({
  data: a,
  width: s = 80,
  height: r = 24,
  color: u = "currentColor",
  className: f,
  onClick: d
}) {
  const m = R.useMemo(() => {
    if (a.length < 2) return "";
    const p = a[0].t, g = a[a.length - 1].t - p || 1;
    let x = 1 / 0, _ = -1 / 0;
    for (const U of a)
      U.v < x && (x = U.v), U.v > _ && (_ = U.v);
    const S = _ - x || 1, j = 1, T = s - j * 2, D = r - j * 2;
    return a.map((U, V) => {
      const J = j + (U.t - p) / g * T, L = j + D - (U.v - x) / S * D;
      return `${V === 0 ? "M" : "L"}${J.toFixed(1)},${L.toFixed(1)}`;
    }).join(" ");
  }, [a, s, r]);
  return a.length < 2 ? null : /* @__PURE__ */ o.jsx(
    "svg",
    {
      width: s,
      height: r,
      viewBox: `0 0 ${s} ${r}`,
      className: ae("shrink-0", d && "cursor-pointer hover:opacity-80", f),
      onClick: d,
      children: /* @__PURE__ */ o.jsx("path", { d: m, fill: "none", stroke: u, strokeWidth: 1.5, strokeLinejoin: "round" })
    }
  );
}
function wv(a) {
  return new Date(a).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function Sv(a) {
  return new Date(a).toLocaleDateString([], { month: "short", day: "numeric" });
}
function jv(a, s) {
  const r = a / s, u = Math.pow(10, Math.floor(Math.log10(r))), f = r / u;
  return f <= 1.5 ? u : f <= 3 ? 2 * u : f <= 7 ? 5 * u : 10 * u;
}
function Nv({ data: a, width: s = 600, height: r = 250, color: u = "#3b82f6", unit: f = "" }) {
  const [d, m] = R.useState(null), p = R.useRef(null), [y, g] = R.useState(null), x = R.useRef(null), _ = R.useCallback((Q) => {
    x.current = Q, g(Q);
  }, []), S = R.useRef(!1), j = R.useRef(!1), T = R.useRef(0), D = R.useRef(null), U = R.useRef({ data: a, width: s });
  U.current = { data: a, width: s };
  const V = a.length > 0 ? `${a[0].t}-${a[a.length - 1].t}` : "", J = R.useRef(V);
  V !== J.current && (J.current = V, y && _(null));
  const L = R.useMemo(() => {
    if (!y || a.length < 2) return a;
    const [Q, ce] = y;
    return a.filter((be) => be.t >= Q && be.t <= ce);
  }, [a, y]);
  R.useEffect(() => {
    const Q = p.current;
    if (!Q) return;
    const ce = { left: 48, right: 12 }, be = (ie) => {
      const Ke = Q.getBoundingClientRect();
      return (ie - Ke.left) * (U.current.width / Ke.width);
    }, ze = (ie) => {
      const Ke = U.current.width;
      return Math.max(0, Math.min(1, (ie - ce.left) / (Ke - ce.left - ce.right)));
    }, _t = (ie, Ke) => {
      const { data: At, width: Vt } = U.current, Re = x.current;
      if (At.length < 2) return;
      const nt = At[0].t, wt = At[At.length - 1].t, gn = Re ? Re[0] : nt, Rn = (Re ? Re[1] : wt) - gn, St = Rn * ie, Qt = (wt - nt) * 5e-3;
      if (St < Qt) return;
      if (St >= wt - nt) {
        _(null);
        return;
      }
      const je = gn + Ke * Rn;
      let Fe = je - Ke * St, Be = je + (1 - Ke) * St;
      Fe < nt && (Be += nt - Fe, Fe = nt), Be > wt && (Fe -= Be - wt, Be = wt), Fe = Math.max(Fe, nt), Be = Math.min(Be, wt), _([Fe, Be]);
    }, Ze = (ie) => {
      const { data: Ke } = U.current;
      if (Ke.length < 2) return;
      ie.preventDefault();
      const At = ze(be(ie.clientX)), Vt = ie.deltaY > 0 ? 1.3 : 1 / 1.3;
      _t(Vt, At);
    };
    let Oe = "idle", We = 0, Ie = null, ft = null;
    const kt = (ie, Ke, At, Vt) => Math.sqrt((At - ie) ** 2 + (Vt - Ke) ** 2), tn = (ie) => {
      const { data: Ke } = U.current;
      Ke.length < 2 || (ie.preventDefault(), ie.touches.length >= 2 ? (Oe = "pinch", Ie = { x: ie.touches[0].clientX, y: ie.touches[0].clientY }, ft = { x: ie.touches[1].clientX, y: ie.touches[1].clientY }) : ie.touches.length === 1 && (Oe = "pan", We = be(ie.touches[0].clientX)));
    }, nn = (ie) => {
      const { data: Ke, width: At } = U.current, Vt = x.current;
      if (Ke.length < 2) return;
      ie.preventDefault();
      const Re = Ke[0].t, nt = Ke[Ke.length - 1].t, wt = Vt ? Vt[0] : Re, gn = Vt ? Vt[1] : nt, ln = gn - wt, Rn = At - ce.left - ce.right;
      if (ie.touches.length >= 2) {
        if (Oe !== "pinch" || !Ie || !ft) {
          Oe = "pinch", Ie = { x: ie.touches[0].clientX, y: ie.touches[0].clientY }, ft = { x: ie.touches[1].clientX, y: ie.touches[1].clientY };
          return;
        }
        const St = { x: ie.touches[0].clientX, y: ie.touches[0].clientY }, Qt = { x: ie.touches[1].clientX, y: ie.touches[1].clientY }, je = kt(Ie.x, Ie.y, ft.x, ft.y), Fe = kt(St.x, St.y, Qt.x, Qt.y);
        if (je > 10 && Fe > 10) {
          const Be = je / Fe, Zt = ln * Be, zt = (nt - Re) * 5e-3, ac = (Ie.x + ft.x) / 2, di = (St.x + Qt.x) / 2, $a = ze(be(di)), Cl = -((be(di) - be(ac)) / Rn) * ln;
          if (Zt >= nt - Re)
            _(null);
          else if (Zt >= zt) {
            const Al = wt + $a * ln;
            let Ot = Al - $a * Zt + Cl, an = Al + (1 - $a) * Zt + Cl;
            Ot < Re && (an += Re - Ot, Ot = Re), an > nt && (Ot -= an - nt, an = nt), Ot = Math.max(Ot, Re), an = Math.min(an, nt), _([Ot, an]);
          }
        }
        Ie = St, ft = Qt;
      } else if (ie.touches.length === 1) {
        if (Oe === "pinch") {
          Oe = "pan", We = be(ie.touches[0].clientX), Ie = null, ft = null;
          return;
        }
        const St = be(ie.touches[0].clientX), Qt = St - We;
        if (Math.abs(Qt) > 1) {
          const je = -(Qt / Rn) * ln;
          let Fe = wt + je, Be = gn + je;
          Fe < Re && (Be += Re - Fe, Fe = Re), Be > nt && (Fe -= Be - nt, Be = nt), Fe = Math.max(Fe, Re), Be = Math.min(Be, nt), _([Fe, Be]), We = St;
        }
      }
    }, bt = (ie) => {
      ie.touches.length === 0 ? (Oe = "idle", Ie = null, ft = null) : ie.touches.length === 1 && Oe === "pinch" ? (Oe = "pan", We = be(ie.touches[0].clientX), Ie = null, ft = null) : ie.touches.length >= 2 && Oe !== "pinch" && (Oe = "pinch", Ie = { x: ie.touches[0].clientX, y: ie.touches[0].clientY }, ft = { x: ie.touches[1].clientX, y: ie.touches[1].clientY });
    };
    return Q.addEventListener("wheel", Ze, { passive: !1 }), Q.addEventListener("touchstart", tn, { passive: !1 }), Q.addEventListener("touchmove", nn, { passive: !1 }), Q.addEventListener("touchend", bt), () => {
      Q.removeEventListener("wheel", Ze), Q.removeEventListener("touchstart", tn), Q.removeEventListener("touchmove", nn), Q.removeEventListener("touchend", bt);
    };
  }, []);
  const I = R.useMemo(() => {
    if (L.length < 2) return null;
    const Q = { top: 12, right: 12, bottom: 32, left: 48 }, ce = s - Q.left - Q.right, be = r - Q.top - Q.bottom, ze = L[0].t, Ze = L[L.length - 1].t - ze || 1;
    let Oe = 1 / 0, We = -1 / 0;
    for (const je of L)
      je.v < Oe && (Oe = je.v), je.v > We && (We = je.v);
    const Ie = (We - Oe) * 0.05 || 1;
    Oe -= Ie, We += Ie;
    const ft = We - Oe, kt = (je) => Q.left + (je - ze) / Ze * ce, tn = (je) => Q.top + be - (je - Oe) / ft * be, nn = (je) => ze + (je - Q.left) / ce * Ze, bt = L.map((je, Fe) => `${Fe === 0 ? "M" : "L"}${kt(je.t).toFixed(1)},${tn(je.v).toFixed(1)}`).join(" "), ie = bt + ` L${kt(L[L.length - 1].t).toFixed(1)},${(Q.top + be).toFixed(1)} L${kt(L[0].t).toFixed(1)},${(Q.top + be).toFixed(1)} Z`, Ke = jv(ft, 5), At = [], Vt = Math.ceil(Oe / Ke) * Ke;
    for (let je = Vt; je <= We; je += Ke) At.push(je);
    const Re = Ze > 864e5, nt = Math.min(6, Math.floor(ce / 80)), wt = [];
    for (let je = 0; je <= nt; je++)
      wt.push(ze + Ze * je / nt);
    let gn = 0;
    for (const je of L) gn += je.v;
    const ln = gn / L.length, Rn = Math.min(...L.map((je) => je.v)), St = Math.max(...L.map((je) => je.v)), Qt = L[L.length - 1].v;
    return { margin: Q, w: ce, h: be, linePath: bt, areaPath: ie, toX: kt, toY: tn, fromX: nn, yTicks: At, xTicks: wt, showDates: Re, minV: Oe, maxV: We, stats: { avg: ln, min: Rn, max: St, current: Qt } };
  }, [L, s, r]), se = R.useCallback(
    (Q) => {
      if (!p.current || !D.current || a.length < 2) return;
      const ce = p.current.getBoundingClientRect(), be = s / ce.width, _t = (Q - ce.left) * be - T.current;
      if (Math.abs(_t) > 3 && !j.current && (j.current = !0, m(null)), j.current) {
        const Ze = { left: 48, right: 12 }, Oe = s - Ze.left - Ze.right, [We, Ie] = D.current, ft = Ie - We, kt = -(_t / Oe) * ft, tn = a[0].t, nn = a[a.length - 1].t;
        let bt = We + kt, ie = Ie + kt;
        bt < tn && (ie += tn - bt, bt = tn), ie > nn && (bt -= ie - nn, ie = nn), bt = Math.max(bt, tn), ie = Math.min(ie, nn), _([bt, ie]);
      }
    },
    [a, s, _]
  ), Z = R.useCallback(
    (Q) => {
      if (!I || !p.current || S.current) return;
      const ce = p.current.getBoundingClientRect(), be = s / ce.width, ze = (Q.clientX - ce.left) * be, _t = I.fromX(ze);
      let Ze = 0, Oe = L.length - 1;
      for (; Ze < Oe; ) {
        const We = Ze + Oe >> 1;
        L[We].t < _t ? Ze = We + 1 : Oe = We;
      }
      Ze > 0 && Math.abs(L[Ze - 1].t - _t) < Math.abs(L[Ze].t - _t) && Ze--, m(Ze);
    },
    [I, L, s]
  ), F = R.useRef(null), $ = R.useRef(null), fe = R.useCallback(() => {
    F.current && window.removeEventListener("mousemove", F.current), $.current && window.removeEventListener("mouseup", $.current), F.current = null, $.current = null;
  }, []), we = R.useCallback(
    (Q) => {
      if (!p.current || a.length < 2) return;
      S.current = !0, j.current = !1;
      const ce = p.current.getBoundingClientRect(), be = s / ce.width;
      T.current = (Q.clientX - ce.left) * be;
      const ze = a[0].t, _t = a[a.length - 1].t;
      D.current = x.current ?? [ze, _t], fe();
      const Ze = (We) => {
        We.preventDefault(), se(We.clientX);
      }, Oe = () => {
        S.current = !1, fe();
      };
      F.current = Ze, $.current = Oe, window.addEventListener("mousemove", Ze), window.addEventListener("mouseup", Oe);
    },
    [a, y, s, se, fe]
  );
  R.useEffect(() => () => fe(), [fe]);
  const me = R.useCallback(() => {
    S.current || m(null);
  }, []);
  if (!I)
    return /* @__PURE__ */ o.jsx("div", { className: "flex items-center justify-center h-full text-muted-foreground text-sm", children: "No data" });
  const { margin: P, h: Le, linePath: he, areaPath: Ne, toX: z, toY: G, yTicks: ee, xTicks: ye, showDates: Se, stats: b } = I, k = Math.abs(b.max - b.min) < 10 ? 1 : 0, Y = (Q) => Q.toFixed(k), W = d != null ? L[d] : null, de = y != null;
  return /* @__PURE__ */ o.jsxs("div", { children: [
    /* @__PURE__ */ o.jsx("div", { className: "flex items-center justify-end mb-1 min-h-[1.5rem]", children: de && /* @__PURE__ */ o.jsx(
      "button",
      {
        onClick: () => _(null),
        className: "text-[10px] text-muted-foreground hover:text-foreground px-2 py-0.5 rounded bg-muted",
        children: "Reset Zoom"
      }
    ) }),
    /* @__PURE__ */ o.jsxs(
      "svg",
      {
        ref: p,
        width: s,
        height: r,
        className: ae("w-full select-none", de ? "cursor-grab active:cursor-grabbing" : ""),
        viewBox: `0 0 ${s} ${r}`,
        style: { touchAction: "none", cursor: de ? void 0 : "crosshair" },
        onMouseMove: Z,
        onMouseDown: we,
        onMouseLeave: me,
        children: [
          ee.map((Q) => /* @__PURE__ */ o.jsxs("g", { children: [
            /* @__PURE__ */ o.jsx(
              "line",
              {
                x1: P.left,
                y1: G(Q),
                x2: s - P.right,
                y2: G(Q),
                stroke: "currentColor",
                className: "text-border",
                strokeWidth: 0.5
              }
            ),
            /* @__PURE__ */ o.jsx(
              "text",
              {
                x: P.left - 6,
                y: G(Q) + 4,
                textAnchor: "end",
                className: "fill-muted-foreground",
                fontSize: 10,
                children: Y(Q)
              }
            )
          ] }, Q)),
          ye.map((Q) => /* @__PURE__ */ o.jsx(
            "text",
            {
              x: z(Q),
              y: P.top + Le + 20,
              textAnchor: "middle",
              className: "fill-muted-foreground",
              fontSize: 10,
              children: Se ? Sv(Q) : wv(Q)
            },
            Q
          )),
          /* @__PURE__ */ o.jsx("path", { d: Ne, fill: u, opacity: 0.1 }),
          /* @__PURE__ */ o.jsx("path", { d: he, fill: "none", stroke: u, strokeWidth: 2, strokeLinejoin: "round" }),
          W && /* @__PURE__ */ o.jsxs(o.Fragment, { children: [
            /* @__PURE__ */ o.jsx(
              "line",
              {
                x1: z(W.t),
                y1: P.top,
                x2: z(W.t),
                y2: P.top + Le,
                stroke: u,
                strokeWidth: 1,
                opacity: 0.4,
                strokeDasharray: "3,3"
              }
            ),
            /* @__PURE__ */ o.jsx(
              "circle",
              {
                cx: z(W.t),
                cy: G(W.v),
                r: 4,
                fill: u,
                stroke: "hsl(var(--card))",
                strokeWidth: 2
              }
            )
          ] }),
          /* @__PURE__ */ o.jsx(
            "rect",
            {
              x: P.left,
              y: P.top,
              width: s - P.left - P.right,
              height: Le,
              fill: "transparent"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ o.jsx("div", { className: "flex gap-4 mt-2 text-xs min-h-[1.25rem]", children: W ? /* @__PURE__ */ o.jsxs(o.Fragment, { children: [
      /* @__PURE__ */ o.jsx("span", { className: "text-muted-foreground", children: new Date(W.t).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }) }),
      /* @__PURE__ */ o.jsxs("span", { className: "font-semibold", style: { color: u }, children: [
        Y(W.v),
        f
      ] })
    ] }) : /* @__PURE__ */ o.jsxs(o.Fragment, { children: [
      /* @__PURE__ */ o.jsxs("span", { className: "text-muted-foreground", children: [
        "Current: ",
        /* @__PURE__ */ o.jsxs("strong", { className: "text-foreground", children: [
          Y(b.current),
          f
        ] })
      ] }),
      /* @__PURE__ */ o.jsxs("span", { className: "text-muted-foreground", children: [
        "Min: ",
        /* @__PURE__ */ o.jsxs("strong", { className: "text-foreground", children: [
          Y(b.min),
          f
        ] })
      ] }),
      /* @__PURE__ */ o.jsxs("span", { className: "text-muted-foreground", children: [
        "Max: ",
        /* @__PURE__ */ o.jsxs("strong", { className: "text-foreground", children: [
          Y(b.max),
          f
        ] })
      ] }),
      /* @__PURE__ */ o.jsxs("span", { className: "text-muted-foreground", children: [
        "Avg: ",
        /* @__PURE__ */ o.jsxs("strong", { className: "text-foreground", children: [
          Y(b.avg),
          f
        ] })
      ] })
    ] }) })
  ] });
}
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Mv = (a) => a.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), mp = (...a) => a.filter((s, r, u) => !!s && s.trim() !== "" && u.indexOf(s) === r).join(" ").trim();
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var Tv = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ev = R.forwardRef(
  ({
    color: a = "currentColor",
    size: s = 24,
    strokeWidth: r = 2,
    absoluteStrokeWidth: u,
    className: f = "",
    children: d,
    iconNode: m,
    ...p
  }, y) => R.createElement(
    "svg",
    {
      ref: y,
      ...Tv,
      width: s,
      height: s,
      stroke: a,
      strokeWidth: u ? Number(r) * 24 / Number(s) : r,
      className: mp("lucide", f),
      ...p
    },
    [
      ...m.map(([g, x]) => R.createElement(g, x)),
      ...Array.isArray(d) ? d : [d]
    ]
  )
);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const le = (a, s) => {
  const r = R.forwardRef(
    ({ className: u, ...f }, d) => R.createElement(Ev, {
      ref: d,
      iconNode: s,
      className: mp(`lucide-${Mv(a)}`, u),
      ...f
    })
  );
  return r.displayName = `${a}`, r;
};
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Cv = le("AirVent", [
  [
    "path",
    {
      d: "M6 12H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",
      key: "larmp2"
    }
  ],
  ["path", { d: "M6 8h12", key: "6g4wlu" }],
  ["path", { d: "M18.3 17.7a2.5 2.5 0 0 1-3.16 3.83 2.53 2.53 0 0 1-1.14-2V12", key: "1bo8pg" }],
  ["path", { d: "M6.6 15.6A2 2 0 1 0 10 17v-5", key: "t9h90c" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Av = le("ArrowDown", [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const zv = le("ArrowUp", [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Fo = le("BatteryLow", [
  ["rect", { width: "16", height: "10", x: "2", y: "7", rx: "2", ry: "2", key: "1w10f2" }],
  ["line", { x1: "22", x2: "22", y1: "11", y2: "13", key: "4dh1rd" }],
  ["line", { x1: "6", x2: "6", y1: "11", y2: "13", key: "1wd6dw" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ov = le("BatteryMedium", [
  ["rect", { width: "16", height: "10", x: "2", y: "7", rx: "2", ry: "2", key: "1w10f2" }],
  ["line", { x1: "22", x2: "22", y1: "11", y2: "13", key: "4dh1rd" }],
  ["line", { x1: "6", x2: "6", y1: "11", y2: "13", key: "1wd6dw" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "13", key: "haxvl5" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Io = le("Battery", [
  ["rect", { width: "16", height: "10", x: "2", y: "7", rx: "2", ry: "2", key: "1w10f2" }],
  ["line", { x1: "22", x2: "22", y1: "11", y2: "13", key: "4dh1rd" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Rv = le("Bed", [
  ["path", { d: "M2 4v16", key: "vw9hq8" }],
  ["path", { d: "M2 8h18a2 2 0 0 1 2 2v10", key: "1dgv2r" }],
  ["path", { d: "M2 17h20", key: "18nfp3" }],
  ["path", { d: "M6 8v9", key: "1yriud" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const kv = le("Camera", [
  [
    "path",
    {
      d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",
      key: "1tc9qg"
    }
  ],
  ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const pp = le("Car", [
  [
    "path",
    {
      d: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2",
      key: "5owen"
    }
  ],
  ["circle", { cx: "7", cy: "17", r: "2", key: "u2ysq9" }],
  ["path", { d: "M9 17h6", key: "r8uit2" }],
  ["circle", { cx: "17", cy: "17", r: "2", key: "axvx0g" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Dv = le("ChevronLeft", [
  ["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Hv = le("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const gp = le("CircleDot", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const v0 = le("CloudDrizzle", [
  ["path", { d: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242", key: "1pljnt" }],
  ["path", { d: "M8 19v1", key: "1dk2by" }],
  ["path", { d: "M8 14v1", key: "84yxot" }],
  ["path", { d: "M16 19v1", key: "v220m7" }],
  ["path", { d: "M16 14v1", key: "g12gj6" }],
  ["path", { d: "M12 21v1", key: "q8vafk" }],
  ["path", { d: "M12 16v1", key: "1mx6rx" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Uv = le("CloudFog", [
  ["path", { d: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242", key: "1pljnt" }],
  ["path", { d: "M16 17H7", key: "pygtm1" }],
  ["path", { d: "M17 21H9", key: "1u2q02" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const No = le("CloudRain", [
  ["path", { d: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242", key: "1pljnt" }],
  ["path", { d: "M16 14v6", key: "1j4efv" }],
  ["path", { d: "M8 14v6", key: "17c4r9" }],
  ["path", { d: "M12 16v6", key: "c8a4gj" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const x0 = le("CloudSnow", [
  ["path", { d: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242", key: "1pljnt" }],
  ["path", { d: "M8 15h.01", key: "a7atzg" }],
  ["path", { d: "M8 19h.01", key: "puxtts" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }],
  ["path", { d: "M12 21h.01", key: "h35vbk" }],
  ["path", { d: "M16 15h.01", key: "rnfrdf" }],
  ["path", { d: "M16 19h.01", key: "1vcnzz" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Lv = le("CloudSun", [
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }],
  ["path", { d: "M20 12h2", key: "1q8mjw" }],
  ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }],
  ["path", { d: "M15.947 12.65a4 4 0 0 0-5.925-4.128", key: "dpwdj0" }],
  ["path", { d: "M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z", key: "s09mg5" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ho = le("Cloud", [
  ["path", { d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z", key: "p7xjir" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Bv = le("Cpu", [
  ["rect", { width: "16", height: "16", x: "4", y: "4", rx: "2", key: "14l7u7" }],
  ["rect", { width: "6", height: "6", x: "9", y: "9", rx: "1", key: "5aljv4" }],
  ["path", { d: "M15 2v2", key: "13l42r" }],
  ["path", { d: "M15 20v2", key: "15mkzm" }],
  ["path", { d: "M2 15h2", key: "1gxd5l" }],
  ["path", { d: "M2 9h2", key: "1bbxkp" }],
  ["path", { d: "M20 15h2", key: "19e6y8" }],
  ["path", { d: "M20 9h2", key: "19tzq7" }],
  ["path", { d: "M9 2v2", key: "165o2o" }],
  ["path", { d: "M9 20v2", key: "i2bqo8" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ka = le("Droplets", [
  [
    "path",
    {
      d: "M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z",
      key: "1ptgy4"
    }
  ],
  [
    "path",
    {
      d: "M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97",
      key: "1sl1rz"
    }
  ]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const qv = le("Fan", [
  [
    "path",
    {
      d: "M10.827 16.379a6.082 6.082 0 0 1-8.618-7.002l5.412 1.45a6.082 6.082 0 0 1 7.002-8.618l-1.45 5.412a6.082 6.082 0 0 1 8.618 7.002l-5.412-1.45a6.082 6.082 0 0 1-7.002 8.618l1.45-5.412Z",
      key: "484a7f"
    }
  ],
  ["path", { d: "M12 12v.01", key: "u5ubse" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const si = le("Flame", [
  [
    "path",
    {
      d: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
      key: "96xj49"
    }
  ]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const yp = le("Fuel", [
  ["line", { x1: "3", x2: "15", y1: "22", y2: "22", key: "xegly4" }],
  ["line", { x1: "4", x2: "14", y1: "9", y2: "9", key: "xcnuvu" }],
  ["path", { d: "M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18", key: "16j0yd" }],
  [
    "path",
    {
      d: "M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5",
      key: "7cu91f"
    }
  ]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const vp = le("Gauge", [
  ["path", { d: "m12 14 4-4", key: "9kzdfg" }],
  ["path", { d: "M3.34 19a10 10 0 1 1 17.32 0", key: "19p75a" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Yv = le("Globe", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" }],
  ["path", { d: "M2 12h20", key: "9i4pu4" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Gv = le("Grid2x2", [
  ["path", { d: "M12 3v18", key: "108xh3" }],
  ["path", { d: "M3 12h18", key: "1i2n21" }],
  ["rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", key: "h1oib" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Xv = le("History", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
  ["path", { d: "M12 7v5l4 2", key: "1fdv2h" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const xp = le("House", [
  ["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", key: "5wwlr5" }],
  [
    "path",
    {
      d: "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
      key: "1d0kgt"
    }
  ]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Mo = le("LampDesk", [
  ["path", { d: "m14 5-3 3 2 7 8-8-7-2Z", key: "1b0msb" }],
  ["path", { d: "m14 5-3 3-3-3 3-3 3 3Z", key: "1uemms" }],
  ["path", { d: "M9.5 6.5 4 12l3 6", key: "1bx08v" }],
  ["path", { d: "M3 22v-2c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v2H3Z", key: "wap775" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ii = le("Lightbulb", [
  [
    "path",
    {
      d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
      key: "1gvzjb"
    }
  ],
  ["path", { d: "M9 18h6", key: "x1upvd" }],
  ["path", { d: "M10 22h4", key: "ceow96" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Po = le("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Vv = le("MapPin", [
  [
    "path",
    {
      d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
      key: "1r0f0z"
    }
  ],
  ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Qv = le("Maximize2", [
  ["polyline", { points: "15 3 21 3 21 9", key: "mznyad" }],
  ["polyline", { points: "9 21 3 21 3 15", key: "1avn1i" }],
  ["line", { x1: "21", x2: "14", y1: "3", y2: "10", key: "ota7mn" }],
  ["line", { x1: "3", x2: "10", y1: "21", y2: "14", key: "1atl0r" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Zv = le("Minus", [["path", { d: "M5 12h14", key: "1ays0h" }]]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const _0 = le("Monitor", [
  ["rect", { width: "20", height: "14", x: "2", y: "3", rx: "2", key: "48i651" }],
  ["line", { x1: "8", x2: "16", y1: "21", y2: "21", key: "1svkeh" }],
  ["line", { x1: "12", x2: "12", y1: "17", y2: "21", key: "vw1qmm" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ef = le("Moon", [
  ["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", key: "a7tn18" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const _p = le("Mountain", [
  ["path", { d: "m8 3 4 8 5-5 5 15H2L8 3z", key: "otkl63" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Kv = le("Music", [
  ["path", { d: "M9 18V5l12-2v13", key: "1jmyc2" }],
  ["circle", { cx: "6", cy: "18", r: "3", key: "fqmcym" }],
  ["circle", { cx: "18", cy: "16", r: "3", key: "1hluhg" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Jv = le("Play", [
  ["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const bp = le("PlugZap", [
  [
    "path",
    { d: "M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z", key: "goz73y" }
  ],
  ["path", { d: "m2 22 3-3", key: "19mgm9" }],
  ["path", { d: "M7.5 13.5 10 11", key: "7xgeeb" }],
  ["path", { d: "M10.5 16.5 13 14", key: "10btkg" }],
  ["path", { d: "m18 3-4 4h6l-4 4", key: "16psg9" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const $v = le("Plug", [
  ["path", { d: "M12 22v-5", key: "1ega77" }],
  ["path", { d: "M9 8V2", key: "14iosj" }],
  ["path", { d: "M15 8V2", key: "18g5xt" }],
  ["path", { d: "M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z", key: "osxo6l" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Wv = le("Plus", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const wp = le("Power", [
  ["path", { d: "M12 2v10", key: "mnfbl" }],
  ["path", { d: "M18.4 6.6a9 9 0 1 1-12.77.04", key: "obofu9" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Fv = le("Radio", [
  ["path", { d: "M4.9 19.1C1 15.2 1 8.8 4.9 4.9", key: "1vaf9d" }],
  ["path", { d: "M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5", key: "u1ii0m" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }],
  ["path", { d: "M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5", key: "1j5fej" }],
  ["path", { d: "M19.1 4.9C23 8.8 23 15.1 19.1 19", key: "10b0cb" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Iv = le("Satellite", [
  ["path", { d: "M13 7 9 3 5 7l4 4", key: "vyckw6" }],
  ["path", { d: "m17 11 4 4-4 4-4-4", key: "rchckc" }],
  ["path", { d: "m8 12 4 4 6-6-4-4Z", key: "1sshf7" }],
  ["path", { d: "m16 8 3-3", key: "x428zp" }],
  ["path", { d: "M9 21a6 6 0 0 0-6-6", key: "1iajcf" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Pv = le("Settings", [
  [
    "path",
    {
      d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
      key: "1qme2f"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Wr = le("ShowerHead", [
  ["path", { d: "m4 4 2.5 2.5", key: "uv2vmf" }],
  ["path", { d: "M13.5 6.5a4.95 4.95 0 0 0-7 7", key: "frdkwv" }],
  ["path", { d: "M15 5 5 15", key: "1ag8rq" }],
  ["path", { d: "M14 17v.01", key: "eokfpp" }],
  ["path", { d: "M10 16v.01", key: "14uyyl" }],
  ["path", { d: "M13 13v.01", key: "1v1k97" }],
  ["path", { d: "M16 10v.01", key: "5169yg" }],
  ["path", { d: "M11 20v.01", key: "cj92p8" }],
  ["path", { d: "M17 14v.01", key: "11cswd" }],
  ["path", { d: "M20 11v.01", key: "19e0od" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ex = le("Snowflake", [
  ["line", { x1: "2", x2: "22", y1: "12", y2: "12", key: "1dnqot" }],
  ["line", { x1: "12", x2: "12", y1: "2", y2: "22", key: "7eqyqh" }],
  ["path", { d: "m20 16-4-4 4-4", key: "rquw4f" }],
  ["path", { d: "m4 8 4 4-4 4", key: "12s3z9" }],
  ["path", { d: "m16 4-4 4-4-4", key: "1tumq1" }],
  ["path", { d: "m8 20 4-4 4 4", key: "9p200w" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Fr = le("Sun", [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "M12 20v2", key: "1lh1kg" }],
  ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }],
  ["path", { d: "m17.66 17.66 1.41 1.41", key: "ptbguv" }],
  ["path", { d: "M2 12h2", key: "1t8f8n" }],
  ["path", { d: "M20 12h2", key: "1q8mjw" }],
  ["path", { d: "m6.34 17.66-1.41 1.41", key: "1m8zz5" }],
  ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ir = le("Thermometer", [
  ["path", { d: "M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z", key: "17jzev" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const tx = le("ToggleLeft", [
  ["rect", { width: "20", height: "12", x: "2", y: "6", rx: "6", ry: "6", key: "f2vt7d" }],
  ["circle", { cx: "8", cy: "12", r: "2", key: "1nvbw3" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Pr = le("Trash2", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const nx = le("Trash", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const lx = le("TriangleAlert", [
  [
    "path",
    {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      key: "wmoenq"
    }
  ],
  ["path", { d: "M12 9v4", key: "juzpu7" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ax = le("Truck", [
  ["path", { d: "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2", key: "wrbu53" }],
  ["path", { d: "M15 18H9", key: "1lyqi6" }],
  [
    "path",
    {
      d: "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",
      key: "lysw3i"
    }
  ],
  ["circle", { cx: "17", cy: "18", r: "2", key: "332jqn" }],
  ["circle", { cx: "7", cy: "18", r: "2", key: "19iecd" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const tf = le("VideoOff", [
  [
    "path",
    { d: "M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196", key: "w8jjjt" }
  ],
  ["path", { d: "M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2", key: "1xawa7" }],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const sx = le("Waves", [
  [
    "path",
    {
      d: "M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
      key: "knzxuh"
    }
  ],
  [
    "path",
    {
      d: "M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
      key: "2jd2cc"
    }
  ],
  [
    "path",
    {
      d: "M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
      key: "rd2r6e"
    }
  ]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ix = le("Wifi", [
  ["path", { d: "M12 20h.01", key: "zekei9" }],
  ["path", { d: "M2 8.82a15 15 0 0 1 20 0", key: "dnpr2z" }],
  ["path", { d: "M5 12.859a10 10 0 0 1 14 0", key: "1x1e6c" }],
  ["path", { d: "M8.5 16.429a5 5 0 0 1 7 0", key: "1bycff" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ei = le("Wind", [
  ["path", { d: "M12.8 19.6A2 2 0 1 0 14 16H2", key: "148xed" }],
  ["path", { d: "M17.5 8a2.5 2.5 0 1 1 2 4H2", key: "1u4tom" }],
  ["path", { d: "M9.8 4.4A2 2 0 1 1 11 8H2", key: "75valh" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const rx = le("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ri = le("Zap", [
  [
    "path",
    {
      d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
      key: "1xq2db"
    }
  ]
]), Sp = R.createContext({ open: () => {
} });
function zn() {
  return R.useContext(Sp);
}
const cx = [
  { label: "1h", hours: 1 },
  { label: "6h", hours: 6 },
  { label: "24h", hours: 24 },
  { label: "3d", hours: 72 },
  { label: "7d", hours: 168 }
];
function ux({ children: a }) {
  const [s, r] = R.useState(null), [u, f] = R.useState(24), d = R.useRef(!1), m = R.useCallback((x, _, S = "") => {
    r({ entityId: x, name: _, unit: S }), f(24);
  }, []), p = R.useCallback(() => {
    r(null);
  }, []);
  R.useEffect(() => {
    if (!s) return;
    const x = (_) => {
      _.key === "Escape" && p();
    };
    return window.addEventListener("keydown", x), () => window.removeEventListener("keydown", x);
  }, [s, p]);
  const { data: y, loading: g } = Pl((s == null ? void 0 : s.entityId) ?? null, u);
  return /* @__PURE__ */ o.jsxs(Sp.Provider, { value: { open: m }, children: [
    a,
    s && /* @__PURE__ */ o.jsx(
      "div",
      {
        className: "absolute inset-0 z-[9999] flex items-center justify-center",
        style: { background: "rgba(0,0,0,0.5)" },
        onMouseDown: (x) => {
          d.current = x.target === x.currentTarget;
        },
        onTouchStart: (x) => {
          d.current = x.target === x.currentTarget;
        },
        onClick: (x) => {
          x.target === x.currentTarget && d.current && p(), d.current = !1;
        },
        children: /* @__PURE__ */ o.jsx(
          "div",
          {
            className: ae(
              "w-[min(95vw,700px)] max-h-[85vh] overflow-auto",
              "rounded-xl border bg-card text-foreground shadow-2xl"
            ),
            onClick: (x) => x.stopPropagation(),
            children: /* @__PURE__ */ o.jsx(
              ox,
              {
                state: s,
                hours: u,
                setHours: f,
                data: y,
                loading: g,
                close: p
              }
            )
          }
        )
      }
    )
  ] });
}
function ox({
  state: a,
  hours: s,
  setHours: r,
  data: u,
  loading: f,
  close: d
}) {
  const m = ue(a.entityId), p = (m == null ? void 0 : m.last_updated) || (m == null ? void 0 : m.last_changed), y = p ? hp(p) : null;
  return /* @__PURE__ */ o.jsxs("div", { className: "p-5 space-y-4", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ o.jsxs("div", { children: [
        /* @__PURE__ */ o.jsx("h2", { className: "text-lg font-semibold", children: a.name }),
        /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ o.jsx("p", { className: "text-xs text-muted-foreground font-mono", children: a.entityId }),
          y && /* @__PURE__ */ o.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "· Updated ",
            y
          ] })
        ] })
      ] }),
      /* @__PURE__ */ o.jsx(
        "button",
        {
          onClick: d,
          className: "rounded-md p-1.5 hover:bg-muted transition-colors",
          children: /* @__PURE__ */ o.jsx(rx, { className: "h-4 w-4" })
        }
      )
    ] }),
    /* @__PURE__ */ o.jsx("div", { className: "flex gap-1", children: cx.map((g) => /* @__PURE__ */ o.jsx(
      "button",
      {
        onClick: () => r(g.hours),
        className: ae(
          "px-3 py-1 rounded-md text-xs font-medium transition-colors",
          s === g.hours ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
        ),
        children: g.label
      },
      g.label
    )) }),
    /* @__PURE__ */ o.jsx("div", { className: "min-h-[250px] flex items-center justify-center", children: f ? /* @__PURE__ */ o.jsx("div", { className: "text-sm text-muted-foreground animate-pulse", children: "Loading history…" }) : /* @__PURE__ */ o.jsx(Nv, { data: u, unit: a.unit }) })
  ] });
}
function ea({ title: a, children: s, className: r }) {
  return /* @__PURE__ */ o.jsxs("div", { className: ae("p-4 md:p-6 space-y-4 max-w-screen-2xl mx-auto", r), children: [
    /* @__PURE__ */ o.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: a }),
    s
  ] });
}
const He = R.forwardRef(
  ({ className: a, ...s }, r) => /* @__PURE__ */ o.jsx(
    "div",
    {
      ref: r,
      className: ae("rounded-lg border bg-card text-card-foreground shadow-sm", a),
      ...s
    }
  )
);
He.displayName = "Card";
const at = R.forwardRef(
  ({ className: a, ...s }, r) => /* @__PURE__ */ o.jsx("div", { ref: r, className: ae("flex flex-col space-y-1.5 p-5 pb-0", a), ...s })
);
at.displayName = "CardHeader";
const st = R.forwardRef(
  ({ className: a, ...s }, r) => /* @__PURE__ */ o.jsx("div", { ref: r, className: ae("text-sm font-semibold leading-none", a), ...s })
);
st.displayName = "CardTitle";
const fx = R.forwardRef(
  ({ className: a, ...s }, r) => /* @__PURE__ */ o.jsx("div", { ref: r, className: ae("text-xs text-muted-foreground", a), ...s })
);
fx.displayName = "CardDescription";
const Ue = R.forwardRef(
  ({ className: a, ...s }, r) => /* @__PURE__ */ o.jsx("div", { ref: r, className: ae("p-5 pt-4", a), ...s })
);
Ue.displayName = "CardContent";
const jp = R.forwardRef(
  ({ className: a, value: s = 0, max: r = 100, indicatorClassName: u, ...f }, d) => {
    const m = Math.min(100, Math.max(0, s / r * 100));
    return /* @__PURE__ */ o.jsx(
      "div",
      {
        ref: d,
        className: ae("relative h-2 w-full overflow-hidden rounded-full bg-secondary", a),
        ...f,
        children: /* @__PURE__ */ o.jsx(
          "div",
          {
            className: ae(
              "h-full rounded-full bg-primary transition-all duration-500",
              u
            ),
            style: { width: `${m}%` }
          }
        )
      }
    );
  }
);
jp.displayName = "Progress";
function ge({
  entityId: a,
  label: s,
  value: r,
  unit: u = "",
  icon: f,
  color: d = "#3b82f6",
  hours: m = 6,
  className: p
}) {
  const { data: y } = Pl(a, m), { open: g } = zn();
  return /* @__PURE__ */ o.jsxs(
    "div",
    {
      className: ae(
        "flex items-center justify-between gap-2 cursor-pointer hover:bg-muted/50 rounded-md transition-colors -mx-1 px-1 py-0.5",
        p
      ),
      onClick: () => g(a, s, u),
      role: "button",
      tabIndex: 0,
      onKeyDown: (x) => {
        (x.key === "Enter" || x.key === " ") && g(a, s, u);
      },
      children: [
        /* @__PURE__ */ o.jsxs("span", { className: "text-xs text-muted-foreground flex items-center gap-1.5 shrink-0", children: [
          f && /* @__PURE__ */ o.jsx(f, { className: "h-3.5 w-3.5" }),
          s
        ] }),
        /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ o.jsx(Za, { data: y, color: d, width: 64, height: 20 }),
          /* @__PURE__ */ o.jsxs("span", { className: "font-medium tabular-nums text-sm shrink-0", children: [
            r,
            u && /* @__PURE__ */ o.jsx("span", { className: "text-muted-foreground ml-0.5 text-xs", children: u })
          ] })
        ] })
      ]
    }
  );
}
function Np({ compact: a = !1 }) {
  const { value: s } = X("sensor.olins_van_bms_battery"), { value: r } = X("sensor.olins_van_bms_voltage"), { value: u } = X("sensor.olins_van_bms_current"), { value: f } = X("sensor.olins_van_bms_power"), { value: d } = X("sensor.olins_van_bms_stored_energy"), { value: m } = X("sensor.olins_van_bms_temperature"), { value: p } = X("sensor.olins_van_bms_cycles"), { value: y } = X("sensor.olins_van_bms_delta_voltage"), { data: g } = Pl("sensor.olins_van_bms_battery", 12), { open: x } = zn(), _ = (u ?? 0) > 0, S = bv(u, f, d), j = s ?? 0, T = j < 30 ? "text-red-500" : j < 65 ? "text-orange-500" : "text-green-500", D = j < 30 ? "bg-red-500" : j < 65 ? "bg-orange-500" : "bg-green-500";
  return /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(Io, { className: "h-4 w-4" }),
      "Battery",
      /* @__PURE__ */ o.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
        /* @__PURE__ */ o.jsx(
          Za,
          {
            data: g,
            color: j < 30 ? "#ef4444" : j < 65 ? "#f97316" : "#22c55e",
            width: 64,
            height: 20,
            onClick: () => x("sensor.olins_van_bms_battery", "Battery SOC", "%")
          }
        ),
        /* @__PURE__ */ o.jsxs("span", { className: ae("text-2xl font-bold tabular-nums", T), children: [
          K(s, 0),
          "%"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ o.jsxs(Ue, { className: "space-y-3", children: [
      /* @__PURE__ */ o.jsx(jp, { value: j, className: "h-3", indicatorClassName: D }),
      /* @__PURE__ */ o.jsxs("div", { className: "grid gap-1", children: [
        /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.olins_van_bms_voltage", label: "Voltage", value: K(r, 2), unit: "V", color: "#6366f1" }),
        /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.olins_van_bms_current", label: "Current", value: K(u, 2), unit: "A", color: "#06b6d4" }),
        /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.olins_van_bms_power", label: "Power", value: K(f != null ? Math.abs(f) : null, 0), unit: "W", color: "#f59e0b" }),
        !a && /* @__PURE__ */ o.jsxs(o.Fragment, { children: [
          /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.olins_van_bms_stored_energy", label: "Stored", value: K(d, 0), unit: "Wh", color: "#8b5cf6" }),
          /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.olins_van_bms_temperature", label: "Temperature", value: K(m, 1), unit: "°C", color: "#ef4444" }),
          /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.olins_van_bms_cycles", label: "Cycles", value: K(p, 0), unit: "", color: "#64748b" }),
          /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.olins_van_bms_delta_voltage", label: "Cell Delta", value: K(y, 3), unit: "V", color: "#ec4899" })
        ] })
      ] }),
      S && /* @__PURE__ */ o.jsx(
        "p",
        {
          className: ae(
            "text-xs font-medium text-center",
            _ ? "text-green-500" : "text-orange-500"
          ),
          children: S
        }
      )
    ] })
  ] });
}
function Mp({ compact: a = !1 }) {
  const { value: s } = X("sensor.total_mppt_pv_power"), { value: r } = X("sensor.a32_pro_mppt1_pv_power"), { value: u } = X("sensor.a32_pro_mppt2_pv_power"), { value: f } = X("sensor.a32_pro_mppt1_yield_today"), { value: d } = X("sensor.a32_pro_mppt2_yield_today"), { value: m } = X("sensor.total_mppt_yield_today"), { value: p } = X("sensor.average_mppt_output_voltage"), { value: y } = X("sensor.total_mppt_output_current"), { data: g } = Pl("sensor.total_mppt_pv_power", 12), { open: x } = zn(), _ = (s ?? 0) > 10;
  return /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(Fr, { className: ae("h-4 w-4", _ ? "text-yellow-500" : "text-muted-foreground") }),
      "Solar",
      /* @__PURE__ */ o.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
        /* @__PURE__ */ o.jsx(
          Za,
          {
            data: g,
            color: "#eab308",
            width: 64,
            height: 20,
            onClick: () => x("sensor.total_mppt_pv_power", "Total Solar", "W")
          }
        ),
        /* @__PURE__ */ o.jsxs(
          "span",
          {
            className: ae(
              "text-2xl font-bold tabular-nums",
              _ ? "text-yellow-500" : "text-muted-foreground"
            ),
            children: [
              K(s, 0),
              "W"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ o.jsxs(Ue, { className: "space-y-3", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ o.jsxs(
          "div",
          {
            className: "space-y-1 rounded-lg bg-muted/50 p-2.5 cursor-pointer hover:bg-muted/80 transition-colors",
            onClick: () => x("sensor.a32_pro_mppt1_pv_power", "MPPT 1", "W"),
            children: [
              /* @__PURE__ */ o.jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "MPPT 1" }),
              /* @__PURE__ */ o.jsxs("p", { className: "text-lg font-bold tabular-nums", children: [
                K(r, 0),
                "W"
              ] }),
              /* @__PURE__ */ o.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                K(f, 2),
                " kWh today"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ o.jsxs(
          "div",
          {
            className: "space-y-1 rounded-lg bg-muted/50 p-2.5 cursor-pointer hover:bg-muted/80 transition-colors",
            onClick: () => x("sensor.a32_pro_mppt2_pv_power", "MPPT 2", "W"),
            children: [
              /* @__PURE__ */ o.jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "MPPT 2" }),
              /* @__PURE__ */ o.jsxs("p", { className: "text-lg font-bold tabular-nums", children: [
                K(u, 0),
                "W"
              ] }),
              /* @__PURE__ */ o.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                K(d, 2),
                " kWh today"
              ] })
            ]
          }
        )
      ] }),
      !a && /* @__PURE__ */ o.jsxs("div", { className: "grid gap-1", children: [
        /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.total_mppt_yield_today", label: "Total Yield", value: K(m, 0), unit: "Wh", color: "#eab308" }),
        /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.average_mppt_output_voltage", label: "Output Voltage", value: K(p, 1), unit: "V", color: "#6366f1" }),
        /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.total_mppt_output_current", label: "Output Current", value: K(y, 1), unit: "A", color: "#06b6d4" })
      ] })
    ] })
  ] });
}
function Uo({ name: a, tempEntity: s, humidityEntity: r }) {
  const { value: u } = X(s), { value: f } = X(r), { data: d } = Pl(s, 12), { open: m } = zn();
  return /* @__PURE__ */ o.jsx(
    He,
    {
      className: "cursor-pointer hover:bg-muted/30 transition-colors",
      onClick: () => m(s, `${a} Temperature`, "°C"),
      children: /* @__PURE__ */ o.jsx(Ue, { className: "pt-4 pb-4", children: /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsxs("div", { children: [
          /* @__PURE__ */ o.jsx("p", { className: "text-xs text-muted-foreground", children: a }),
          /* @__PURE__ */ o.jsxs("p", { className: "text-2xl font-bold tabular-nums", children: [
            K(u, 1),
            "°C"
          ] })
        ] }),
        /* @__PURE__ */ o.jsxs("div", { className: "flex flex-col items-end gap-1", children: [
          /* @__PURE__ */ o.jsx(Za, { data: d, color: "#ef4444", width: 56, height: 18 }),
          /* @__PURE__ */ o.jsxs(
            "div",
            {
              className: "flex items-center gap-1 text-muted-foreground",
              onClick: (p) => {
                p.stopPropagation(), m(r, `${a} Humidity`, "%");
              },
              children: [
                /* @__PURE__ */ o.jsx(Ka, { className: "h-3.5 w-3.5" }),
                /* @__PURE__ */ o.jsxs("span", { className: "text-sm tabular-nums", children: [
                  K(f, 0),
                  "%"
                ] })
              ]
            }
          )
        ] })
      ] }) })
    }
  );
}
function Hr({ name: a, entityId: s, invertWarning: r, icon: u }) {
  const { value: f } = X(s), d = f ?? 0, m = r ? d > 80 ? "bg-red-500" : d > 60 ? "bg-orange-500" : "bg-green-500" : d < 20 ? "bg-red-500" : d < 50 ? "bg-orange-500" : "bg-blue-500";
  return /* @__PURE__ */ o.jsx(He, { children: /* @__PURE__ */ o.jsxs(Ue, { className: "pt-4 pb-4", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ o.jsxs("p", { className: "text-sm font-medium flex items-center gap-1.5", children: [
        u,
        a
      ] }),
      /* @__PURE__ */ o.jsxs("p", { className: "text-lg font-bold tabular-nums", children: [
        K(f, 0),
        "%"
      ] })
    ] }),
    /* @__PURE__ */ o.jsx("div", { className: "h-3 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ o.jsx(
      "div",
      {
        className: ae("h-full rounded-full transition-all duration-500", m),
        style: { width: `${Math.min(100, Math.max(0, d))}%` }
      }
    ) })
  ] }) });
}
function dx(a, s = "daily") {
  const r = Va(), [u, f] = R.useState([]);
  return R.useEffect(() => {
    let d = null, m = !1;
    async function p() {
      const g = r.hass;
      if (g != null && g.connection)
        try {
          d = await g.connection.subscribeMessage(
            (x) => {
              !m && x.forecast && f(x.forecast);
            },
            {
              type: "weather/subscribe_forecast",
              forecast_type: s,
              entity_id: a
            }
          );
        } catch (x) {
          console.warn("Failed to subscribe to weather forecast:", x);
        }
    }
    p();
    const y = () => {
      var g;
      (g = r.hass) != null && g.connection && !d && p();
    };
    return window.addEventListener("hass-updated", y), () => {
      m = !0, d == null || d(), window.removeEventListener("hass-updated", y);
    };
  }, [r, a, s]), u;
}
const To = /* @__PURE__ */ new Map();
function hx(a, s) {
  return `${a.toFixed(2)},${s.toFixed(2)}`;
}
function mx(a, s) {
  const [r, u] = R.useState(null), f = R.useRef(null);
  return R.useEffect(() => {
    if (a == null || s == null) return;
    const d = hx(a, s);
    if (d === f.current) return;
    f.current = d;
    const m = To.get(d);
    if (m) {
      u(m);
      return;
    }
    let p = !1;
    const y = `https://nominatim.openstreetmap.org/reverse?lat=${a}&lon=${s}&format=json&zoom=10&addressdetails=1`;
    return fetch(y, {
      headers: { "User-Agent": "VanDashboard/1.0" }
    }).then((g) => g.json()).then((g) => {
      var D;
      if (p) return;
      const x = g.address, _ = (x == null ? void 0 : x.city) || (x == null ? void 0 : x.town) || (x == null ? void 0 : x.village) || (x == null ? void 0 : x.hamlet) || (x == null ? void 0 : x.county) || "", S = (x == null ? void 0 : x.state) || (x == null ? void 0 : x.province) || "", j = ((D = x == null ? void 0 : x.country_code) == null ? void 0 : D.toUpperCase()) || "";
      let T = "";
      _ && S ? T = `${_}, ${S}` : _ ? T = _ : S ? T = S : g.display_name && (T = g.display_name.split(",").slice(0, 2).join(",").trim()), T && j && T.includes(j), To.set(d, T), u(T);
    }).catch(() => {
      if (!p) {
        const g = `${Number(a).toFixed(2)}°, ${Number(s).toFixed(2)}°`;
        To.set(d, g), u(g);
      }
    }), () => {
      p = !0;
    };
  }, [a, s]), r;
}
const b0 = {
  sunny: Fr,
  "clear-night": ef,
  cloudy: Ho,
  partlycloudy: Lv,
  rainy: No,
  pouring: No,
  snowy: x0,
  "snowy-rainy": x0,
  windy: ei,
  "windy-variant": ei,
  fog: Uv,
  hail: v0,
  lightning: v0,
  "lightning-rainy": No
};
function px(a) {
  return (a == null ? void 0 : a.replace(/-/g, " ").replace(/_/g, " ")) ?? "";
}
function gx() {
  var J, L;
  const a = ue("weather.pirateweather"), s = ue("device_tracker.starlink_device_location"), r = dx("weather.pirateweather", "daily"), u = (J = s == null ? void 0 : s.attributes) == null ? void 0 : J.latitude, f = (L = s == null ? void 0 : s.attributes) == null ? void 0 : L.longitude, d = mx(u, f);
  if (!a) return null;
  const m = a.state, p = a.attributes, y = p.temperature, g = p.humidity, x = p.wind_speed, _ = b0[m] || Ho, S = a.last_updated, j = r.slice(0, 7), T = j.flatMap((I) => [I.temperature, I.templow]), D = T.length > 0 ? Math.min(...T) : 0, V = (T.length > 0 ? Math.max(...T) : 30) - D || 1;
  return /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsxs(at, { className: "pb-2", children: [
      /* @__PURE__ */ o.jsxs(st, { className: "flex items-center justify-between text-base", children: [
        /* @__PURE__ */ o.jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ o.jsx(_, { className: "h-4 w-4" }),
          "Weather"
        ] }),
        /* @__PURE__ */ o.jsx("span", { className: "text-xs font-normal text-muted-foreground", children: hp(S) })
      ] }),
      d && /* @__PURE__ */ o.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1 -mt-1", children: [
        /* @__PURE__ */ o.jsx(Vv, { className: "h-3 w-3" }),
        d
      ] })
    ] }),
    /* @__PURE__ */ o.jsxs(Ue, { className: "space-y-3", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsxs("div", { children: [
          /* @__PURE__ */ o.jsxs("p", { className: "text-3xl font-bold tabular-nums", children: [
            K(y, 0),
            "°C"
          ] }),
          /* @__PURE__ */ o.jsx("p", { className: "text-sm text-muted-foreground capitalize", children: px(m) })
        ] }),
        /* @__PURE__ */ o.jsxs("div", { className: "text-right space-y-1", children: [
          /* @__PURE__ */ o.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1 justify-end", children: [
            /* @__PURE__ */ o.jsx(Ka, { className: "h-3 w-3" }),
            " ",
            K(g, 0),
            "%"
          ] }),
          /* @__PURE__ */ o.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1 justify-end", children: [
            /* @__PURE__ */ o.jsx(ei, { className: "h-3 w-3" }),
            " ",
            K(x, 0),
            " km/h"
          ] })
        ] })
      ] }),
      j.length > 0 && /* @__PURE__ */ o.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ o.jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "7-Day Forecast" }),
        j.map((I, se) => {
          const Z = b0[I.condition] || Ho, F = new Date(I.datetime), $ = se === 0, fe = $ ? "Today" : F.toLocaleDateString(void 0, { weekday: "short" }), we = I.templow, me = I.temperature, P = (we - D) / V * 100, Le = (me - D) / V * 100, he = me > 30 ? "bg-red-500" : me > 20 ? "bg-orange-400" : me > 10 ? "bg-yellow-400" : me > 0 ? "bg-blue-400" : "bg-blue-600";
          return /* @__PURE__ */ o.jsxs(
            "div",
            {
              className: "grid items-center gap-1 text-xs",
              style: { gridTemplateColumns: "2.5rem 1.25rem 1fr 2rem 2rem" },
              children: [
                /* @__PURE__ */ o.jsx(
                  "span",
                  {
                    className: `truncate ${$ ? "font-medium text-foreground" : "text-muted-foreground"}`,
                    children: fe
                  }
                ),
                /* @__PURE__ */ o.jsx(Z, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                /* @__PURE__ */ o.jsx("div", { className: "relative h-2 rounded-full bg-muted", children: /* @__PURE__ */ o.jsx(
                  "div",
                  {
                    className: `absolute inset-y-0 rounded-full ${he}`,
                    style: {
                      left: `${P}%`,
                      right: `${100 - Le}%`
                    }
                  }
                ) }),
                /* @__PURE__ */ o.jsxs("span", { className: "text-right tabular-nums text-muted-foreground", children: [
                  Math.round(we),
                  "°"
                ] }),
                /* @__PURE__ */ o.jsxs("span", { className: "text-right tabular-nums font-medium", children: [
                  Math.round(me),
                  "°"
                ] })
              ]
            },
            se
          );
        })
      ] }),
      j.some((I) => I.precipitation_probability > 0) && /* @__PURE__ */ o.jsx("div", { className: "flex gap-2 overflow-x-auto pb-1", children: j.map((I, se) => {
        const Z = I.precipitation_probability, F = new Date(I.datetime), $ = se === 0 ? "Tod" : F.toLocaleDateString(void 0, { weekday: "short" });
        return /* @__PURE__ */ o.jsxs("div", { className: "flex flex-col items-center gap-0.5 min-w-[2.5rem] text-xs", children: [
          /* @__PURE__ */ o.jsx("span", { className: "text-muted-foreground", children: $ }),
          /* @__PURE__ */ o.jsx("div", { className: "h-6 w-3 rounded-sm bg-muted relative overflow-hidden", children: /* @__PURE__ */ o.jsx(
            "div",
            {
              className: "absolute bottom-0 w-full bg-blue-400 rounded-sm",
              style: { height: `${Z}%` }
            }
          ) }),
          /* @__PURE__ */ o.jsxs("span", { className: "text-muted-foreground tabular-nums", children: [
            Z,
            "%"
          ] })
        ] }, se);
      }) })
    ] })
  ] });
}
const w0 = (a) => typeof a == "boolean" ? `${a}` : a === 0 ? "0" : a, S0 = rp, Tp = (a, s) => (r) => {
  var u;
  if ((s == null ? void 0 : s.variants) == null) return S0(a, r == null ? void 0 : r.class, r == null ? void 0 : r.className);
  const { variants: f, defaultVariants: d } = s, m = Object.keys(f).map((g) => {
    const x = r == null ? void 0 : r[g], _ = d == null ? void 0 : d[g];
    if (x === null) return null;
    const S = w0(x) || w0(_);
    return f[g][S];
  }), p = r && Object.entries(r).reduce((g, x) => {
    let [_, S] = x;
    return S === void 0 || (g[_] = S), g;
  }, {}), y = s == null || (u = s.compoundVariants) === null || u === void 0 ? void 0 : u.reduce((g, x) => {
    let { class: _, className: S, ...j } = x;
    return Object.entries(j).every((T) => {
      let [D, U] = T;
      return Array.isArray(U) ? U.includes({
        ...d,
        ...p
      }[D]) : {
        ...d,
        ...p
      }[D] === U;
    }) ? [
      ...g,
      _,
      S
    ] : g;
  }, []);
  return S0(a, m, y, r == null ? void 0 : r.class, r == null ? void 0 : r.className);
}, yx = Tp(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
), Ps = R.forwardRef(
  ({ className: a, variant: s, size: r, ...u }, f) => /* @__PURE__ */ o.jsx(
    "button",
    {
      className: ae(yx({ variant: s, size: r, className: a })),
      ref: f,
      ...u
    }
  )
);
Ps.displayName = "Button";
const ec = R.forwardRef(
  ({ className: a, onValueChange: s, ...r }, u) => /* @__PURE__ */ o.jsx(
    "input",
    {
      type: "range",
      ref: u,
      className: ae(
        "w-full h-2 rounded-full appearance-none cursor-pointer bg-secondary",
        "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5",
        "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary",
        "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-md",
        "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full",
        "[&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background",
        a
      ),
      onChange: (f) => s == null ? void 0 : s(Number(f.target.value)),
      ...r
    }
  )
);
ec.displayName = "Slider";
function El() {
  const a = Va();
  return R.useCallback(
    (s, r, u, f) => a.callService(s, r, u, f),
    [a]
  );
}
function yt(a) {
  const s = El(), r = a.split(".")[0];
  return R.useCallback(
    () => s(r, "toggle", void 0, { entity_id: a }),
    [s, r, a]
  );
}
function vx(a) {
  const s = El();
  return R.useCallback(
    () => s("button", "press", void 0, { entity_id: a }),
    [s, a]
  );
}
function xx() {
  var L;
  const a = ue("climate.a32_pro_van_hydronic_heating_pid"), s = El(), [r, u] = R.useState(null), f = R.useRef(null), d = R.useCallback(
    (I) => {
      f.current && clearTimeout(f.current), f.current = setTimeout(() => {
        s("climate", "set_temperature", { temperature: I }, {
          entity_id: "climate.a32_pro_van_hydronic_heating_pid"
        });
      }, 300);
    },
    [s]
  ), m = ((L = a == null ? void 0 : a.attributes) == null ? void 0 : L.temperature) ?? 0;
  if (R.useEffect(() => {
    u(null);
  }, [m]), !a) return null;
  const p = a.attributes, y = p.current_temperature ?? 0, g = p.min_temp ?? 5, x = p.max_temp ?? 35, _ = p.target_temp_step ?? 0.5, j = a.state === "heat", T = r ?? m, D = (I) => {
    const se = Math.round(I / _) * _;
    u(se), d(se);
  }, U = () => {
    s("climate", "set_hvac_mode", {
      hvac_mode: j ? "off" : "heat"
    }, { entity_id: "climate.a32_pro_van_hydronic_heating_pid" });
  }, V = Math.max(0, Math.min(1, (T - g) / (x - g))), J = j ? `hsl(${30 - V * 30}, ${70 + V * 30}%, ${55 - V * 10}%)` : void 0;
  return /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(
        Ir,
        {
          className: ae("h-4 w-4", j ? "text-orange-500" : "text-muted-foreground")
        }
      ),
      "Thermostat",
      /* @__PURE__ */ o.jsx("span", { className: ae(
        "ml-auto text-xs font-medium px-2 py-0.5 rounded-full",
        j ? "bg-orange-500/10 text-orange-500" : "bg-muted text-muted-foreground"
      ), children: j ? "Heating" : "Off" })
    ] }) }),
    /* @__PURE__ */ o.jsxs(Ue, { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-end justify-between", children: [
        /* @__PURE__ */ o.jsxs("div", { children: [
          /* @__PURE__ */ o.jsx("p", { className: "text-xs text-muted-foreground mb-0.5", children: "Current" }),
          /* @__PURE__ */ o.jsxs("p", { className: "text-3xl font-bold tabular-nums leading-none", children: [
            y.toFixed(1),
            "°"
          ] })
        ] }),
        j && /* @__PURE__ */ o.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ o.jsx("p", { className: "text-xs text-muted-foreground mb-0.5", children: "Target" }),
          /* @__PURE__ */ o.jsxs("p", { className: "text-2xl font-bold tabular-nums text-orange-500 leading-none", children: [
            T.toFixed(1),
            "°"
          ] })
        ] })
      ] }),
      j && /* @__PURE__ */ o.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ o.jsx(
          ec,
          {
            min: g,
            max: x,
            step: _,
            value: T,
            onValueChange: D,
            style: J ? {
              accentColor: J
            } : void 0
          }
        ),
        /* @__PURE__ */ o.jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground tabular-nums", children: [
          /* @__PURE__ */ o.jsxs("span", { children: [
            g,
            "°"
          ] }),
          /* @__PURE__ */ o.jsxs("span", { children: [
            x,
            "°"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ o.jsxs(
        Ps,
        {
          variant: j ? "default" : "outline",
          className: ae("w-full", j && "bg-orange-500 hover:bg-orange-600"),
          onClick: U,
          children: [
            /* @__PURE__ */ o.jsx(wp, { className: "h-4 w-4 mr-2" }),
            j ? "Turn Off" : "Turn On"
          ]
        }
      )
    ] })
  ] });
}
const Gt = R.forwardRef(
  ({ className: a, checked: s = !1, onCheckedChange: r, ...u }, f) => /* @__PURE__ */ o.jsx(
    "button",
    {
      ref: f,
      role: "switch",
      "aria-checked": s,
      className: ae(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
        "border-2 border-transparent transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        s ? "bg-primary" : "bg-input",
        a
      ),
      onClick: () => r == null ? void 0 : r(!s),
      ...u,
      children: /* @__PURE__ */ o.jsx(
        "span",
        {
          className: ae(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
            s ? "translate-x-5" : "translate-x-0"
          )
        }
      )
    }
  )
);
Gt.displayName = "Switch";
function Ep() {
  var Z;
  const a = ue("switch.a32_pro_switch24_hydronic_heater"), s = ue("input_boolean.hot_water_mode"), r = ue("light.a32_pro_a32_pro_dac_0"), u = ue("sensor.a32_pro_hydronic_heater_status"), f = ue("input_boolean.heater_low_fuel_lockout"), { value: d } = X(
    "sensor.a32_pro_s5140_channel_34_temperature_blower_coolant"
  ), { value: m } = X(
    "sensor.a32_pro_s5140_channel_35_temperature_blower_air"
  ), { value: p } = X(
    "sensor.a32_pro_coolant_blower_heating_pid_climate_result"
  ), y = yt("switch.a32_pro_switch24_hydronic_heater"), g = yt("input_boolean.hot_water_mode"), x = El(), _ = (a == null ? void 0 : a.state) === "on", S = (s == null ? void 0 : s.state) === "on", j = (f == null ? void 0 : f.state) === "on", T = ((Z = r == null ? void 0 : r.attributes) == null ? void 0 : Z.brightness) ?? 0, D = Math.round(T / 255 * 100), U = (u == null ? void 0 : u.state) ?? "", [V, J] = R.useState(null), L = R.useRef(null), I = R.useCallback(
    (F) => {
      J(F), L.current && clearTimeout(L.current), L.current = setTimeout(() => {
        x("light", "turn_on", { brightness_pct: F }, {
          entity_id: "light.a32_pro_a32_pro_dac_0"
        });
      }, 300);
    },
    [x]
  ), se = V ?? D;
  return R.useEffect(() => {
    J(null);
  }, [D]), /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(si, { className: ae("h-4 w-4", _ ? "text-orange-500" : "text-muted-foreground") }),
      "Heating System"
    ] }) }),
    /* @__PURE__ */ o.jsxs(Ue, { className: "space-y-4", children: [
      j && /* @__PURE__ */ o.jsx("div", { className: "rounded-lg bg-red-500/10 border border-red-500/30 p-2 text-xs text-red-500 font-medium", children: "⚠ Low fuel lockout active" }),
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "Hydronic Heater" }),
        /* @__PURE__ */ o.jsx(Gt, { checked: _, onCheckedChange: y })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsxs("span", { className: "text-sm flex items-center gap-1.5", children: [
          /* @__PURE__ */ o.jsx(Ka, { className: "h-3.5 w-3.5 text-blue-500" }),
          "Hot Water Mode"
        ] }),
        /* @__PURE__ */ o.jsx(Gt, { checked: S, onCheckedChange: g })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ o.jsxs("span", { className: "text-sm flex items-center gap-1.5", children: [
            /* @__PURE__ */ o.jsx(ei, { className: "h-3.5 w-3.5" }),
            "Blower Fan"
          ] }),
          /* @__PURE__ */ o.jsxs("span", { className: "text-xs text-muted-foreground tabular-nums", children: [
            se,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ o.jsx(
          ec,
          {
            min: 0,
            max: 100,
            value: se,
            onValueChange: I
          }
        )
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "border-t pt-3 space-y-1", children: [
        /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.a32_pro_s5140_channel_34_temperature_blower_coolant", label: "Coolant Temp", value: K(d, 1), unit: "°C", color: "#ef4444" }),
        /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.a32_pro_s5140_channel_35_temperature_blower_air", label: "Blower Air", value: K(m, 1), unit: "°C", color: "#f97316" }),
        /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.a32_pro_coolant_blower_heating_pid_climate_result", label: "PID Output", value: K(p, 0), unit: "%", color: "#6366f1" }),
        U && U !== "Idle." && U !== "0" && /* @__PURE__ */ o.jsx("p", { className: "text-xs text-orange-500 mt-1", children: U })
      ] })
    ] })
  ] });
}
function Cp() {
  var U;
  const a = ue("fan.ag_pro_roof_fan"), s = ue("cover.ag_pro_roof_fan_lid"), r = ue("sensor.roof_fan_direction"), u = El(), f = (a == null ? void 0 : a.state) === "on", d = ((U = a == null ? void 0 : a.attributes) == null ? void 0 : U.percentage) ?? 0, m = s == null ? void 0 : s.state, p = (r == null ? void 0 : r.state) ?? "Unknown", y = () => {
    u("fan", f ? "turn_off" : "turn_on", void 0, {
      entity_id: "fan.ag_pro_roof_fan"
    });
  }, [g, x] = R.useState(null), _ = R.useRef(null), S = R.useCallback(
    (V) => {
      x(V), _.current && clearTimeout(_.current), _.current = setTimeout(() => {
        u("fan", "set_percentage", { percentage: V }, {
          entity_id: "fan.ag_pro_roof_fan"
        });
      }, 300);
    },
    [u]
  ), j = g ?? d;
  R.useEffect(() => {
    x(null);
  }, [d]);
  const T = (V) => {
    u("fan", "set_direction", { direction: V }, {
      entity_id: "fan.ag_pro_roof_fan"
    });
  }, D = () => {
    u("cover", m === "open" ? "close_cover" : "open_cover", void 0, { entity_id: "cover.ag_pro_roof_fan_lid" });
  };
  return /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(
        qv,
        {
          className: ae("h-4 w-4", f && "text-cyan-500 animate-spin"),
          style: f ? { animationDuration: "2s" } : void 0
        }
      ),
      "Roof Fan"
    ] }) }),
    /* @__PURE__ */ o.jsxs(Ue, { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "Fan" }),
        /* @__PURE__ */ o.jsx(Gt, { checked: f, onCheckedChange: y })
      ] }),
      f && /* @__PURE__ */ o.jsxs(o.Fragment, { children: [
        /* @__PURE__ */ o.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "Speed" }),
            /* @__PURE__ */ o.jsxs("span", { className: "text-xs text-muted-foreground tabular-nums", children: [
              j,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ o.jsx(ec, { min: 0, max: 100, step: 10, value: j, onValueChange: S })
        ] }),
        /* @__PURE__ */ o.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ o.jsxs(
            Ps,
            {
              variant: p === "Exhaust" ? "default" : "outline",
              size: "sm",
              className: "flex-1",
              onClick: () => T("forward"),
              children: [
                /* @__PURE__ */ o.jsx(zv, { className: "h-3.5 w-3.5 mr-1" }),
                "Exhaust"
              ]
            }
          ),
          /* @__PURE__ */ o.jsxs(
            Ps,
            {
              variant: p === "Intake" ? "default" : "outline",
              size: "sm",
              className: "flex-1",
              onClick: () => T("reverse"),
              children: [
                /* @__PURE__ */ o.jsx(Av, { className: "h-3.5 w-3.5 mr-1" }),
                "Intake"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "Lid" }),
        /* @__PURE__ */ o.jsx(Ps, { variant: "outline", size: "sm", onClick: D, children: m === "open" ? "Close" : "Open" })
      ] })
    ] })
  ] });
}
const _x = {
  green: "bg-green-500",
  red: "bg-red-500",
  orange: "bg-orange-500",
  blue: "bg-blue-500",
  yellow: "bg-yellow-500",
  cyan: "bg-cyan-500",
  purple: "bg-purple-500"
};
function Zs({ active: a, color: s = "green", label: r, className: u }) {
  const f = s.startsWith("bg-") ? s : _x[s] ?? "bg-green-500";
  return /* @__PURE__ */ o.jsxs("div", { className: ae("flex items-center gap-1.5", u), children: [
    /* @__PURE__ */ o.jsx(
      "span",
      {
        className: ae(
          "h-2.5 w-2.5 rounded-full shrink-0",
          a ? f : "bg-muted-foreground/30"
        )
      }
    ),
    r && /* @__PURE__ */ o.jsx("span", { className: "text-xs text-muted-foreground", children: r })
  ] });
}
function bx() {
  const a = ue("binary_sensor.apollo_msr_2_1731d8_radar_target"), s = ue("device_tracker.starlink"), r = ue("input_boolean.power_saving_mode"), u = ue("input_boolean.sleep_mode"), f = ue("binary_sensor.engine_is_running"), d = (a == null ? void 0 : a.state) === "on", m = (s == null ? void 0 : s.state) === "home", p = (r == null ? void 0 : r.state) === "on", y = (u == null ? void 0 : u.state) === "on", g = (f == null ? void 0 : f.state) === "on";
  return /* @__PURE__ */ o.jsxs("div", { className: "flex flex-wrap items-center gap-3 px-1", children: [
    /* @__PURE__ */ o.jsx(Zs, { active: d, color: "green", label: d ? "Occupied" : "Empty" }),
    /* @__PURE__ */ o.jsx(Zs, { active: m, color: "blue", label: m ? "Online" : "Offline" }),
    g && /* @__PURE__ */ o.jsx(Zs, { active: !0, color: "orange", label: "Engine On" }),
    p && /* @__PURE__ */ o.jsx(Zs, { active: !0, color: "yellow", label: "Power Save" }),
    y && /* @__PURE__ */ o.jsx(Zs, { active: !0, color: "purple", label: "Sleep" })
  ] });
}
const j0 = {
  green: { border: "border-green-500", bg: "bg-green-500/10", text: "text-green-500", glow: "shadow-green-500/25" },
  blue: { border: "border-blue-500", bg: "bg-blue-500/10", text: "text-blue-500", glow: "shadow-blue-500/25" },
  orange: { border: "border-orange-500", bg: "bg-orange-500/10", text: "text-orange-500", glow: "shadow-orange-500/25" },
  red: { border: "border-red-500", bg: "bg-red-500/10", text: "text-red-500", glow: "shadow-red-500/25" },
  cyan: { border: "border-cyan-500", bg: "bg-cyan-500/10", text: "text-cyan-500", glow: "shadow-cyan-500/25" },
  yellow: { border: "border-yellow-500", bg: "bg-yellow-500/10", text: "text-yellow-500", glow: "shadow-yellow-500/25" },
  purple: { border: "border-purple-500", bg: "bg-purple-500/10", text: "text-purple-500", glow: "shadow-purple-500/25" }
};
function ct({
  entityId: a,
  name: s,
  icon: r,
  activeColor: u = "blue",
  onToggle: f,
  className: d
}) {
  const m = ue(a), p = yt(a), y = (m == null ? void 0 : m.state) === "on", g = j0[u] || j0.blue;
  return /* @__PURE__ */ o.jsxs(
    "button",
    {
      onClick: f ?? p,
      className: ae(
        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 min-w-[5rem]",
        y ? `${g.border} ${g.bg} ${g.text} shadow-lg ${g.glow}` : "border-border bg-card text-muted-foreground hover:bg-accent",
        d
      ),
      children: [
        /* @__PURE__ */ o.jsx(
          r,
          {
            className: ae("h-5 w-5 transition-transform duration-300")
          }
        ),
        /* @__PURE__ */ o.jsx("span", { className: "text-xs font-medium", children: s })
      ]
    }
  );
}
const wx = 3e4;
function Ap({ name: a = "Inverter" }) {
  const s = vx("button.a32_pro_inverter_on_off_toggle"), r = ue("input_boolean.inverter_state"), u = (r == null ? void 0 : r.state) === "on", [f, d] = R.useState(!1), m = R.useRef(null), p = R.useRef(null);
  R.useEffect(() => {
    f && m.current !== null && (r == null ? void 0 : r.state) !== m.current && (d(!1), m.current = null, p.current && clearTimeout(p.current));
  }, [r == null ? void 0 : r.state, f]), R.useEffect(() => () => {
    p.current && clearTimeout(p.current);
  }, []);
  const y = R.useCallback(() => {
    f || (s(), m.current = (r == null ? void 0 : r.state) ?? null, d(!0), p.current && clearTimeout(p.current), p.current = setTimeout(() => {
      d(!1), m.current = null;
    }, wx));
  }, [s, f, r == null ? void 0 : r.state]), g = {
    border: "border-green-500",
    bg: "bg-green-500/10",
    text: "text-green-500",
    glow: "shadow-green-500/25"
  };
  return /* @__PURE__ */ o.jsxs(
    "button",
    {
      onClick: y,
      className: ae(
        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 min-w-[5rem]",
        f ? "border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-lg shadow-yellow-500/25" : u ? `${g.border} ${g.bg} ${g.text} shadow-lg ${g.glow}` : "border-border bg-card text-muted-foreground hover:bg-accent"
      ),
      children: [
        /* @__PURE__ */ o.jsx(
          ri,
          {
            className: ae(
              "h-5 w-5 transition-transform duration-300",
              f && "animate-pulse",
              u && !f && "scale-110"
            )
          }
        ),
        /* @__PURE__ */ o.jsx("span", { className: "text-xs font-medium", children: f ? "Loading…" : u ? "ON" : "OFF" })
      ]
    }
  );
}
function _n({
  label: a,
  value: s,
  color: r,
  icon: u,
  onClick: f
}) {
  return /* @__PURE__ */ o.jsxs(
    "button",
    {
      onClick: f,
      className: ae(
        "flex items-center gap-2 rounded-lg border bg-card px-3 py-2 min-w-[7rem] text-left transition-colors",
        f && "hover:bg-accent active:bg-accent/80 cursor-pointer"
      ),
      children: [
        /* @__PURE__ */ o.jsx(u, { className: ae("h-4 w-4 shrink-0", r) }),
        /* @__PURE__ */ o.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground leading-tight", children: a }),
          /* @__PURE__ */ o.jsx("p", { className: "text-sm font-semibold tabular-nums truncate", children: s })
        ] })
      ]
    }
  );
}
function Sx() {
  const { value: a } = X("sensor.olins_van_bms_battery"), { value: s } = X("sensor.total_mppt_pv_power"), { value: r } = X("sensor.a32_pro_fresh_water_tank_level"), { value: u } = X("sensor.a32_pro_grey_water_tank_level"), { value: f } = X("sensor.stable_fuel_level"), { value: d } = X("sensor.propane_tank_percentage"), { value: m } = X("sensor.starlink_downlink_throughput_mbps"), p = ue("binary_sensor.shelly_em_reachable"), y = ue("input_boolean.power_saving_mode"), g = ue("switch.a32_pro_switch06_grey_water_tank_valve"), x = ue("light.led_controller_cct_1"), _ = ue("light.led_controller_cct_2"), S = ue("light.led_controller_sc_1"), j = ue("light.led_controller_sc_2"), { open: T } = zn(), D = yt("switch.a32_pro_switch06_grey_water_tank_valve"), U = yt("input_boolean.power_saving_mode"), V = yt("light.led_controller_cct_1"), J = (p == null ? void 0 : p.state) === "on", L = (y == null ? void 0 : y.state) === "on", I = (g == null ? void 0 : g.state) === "on", se = [x, _, S, j].filter((F) => (F == null ? void 0 : F.state) === "on").length, Z = (F) => F ?? 0;
  return /* @__PURE__ */ o.jsxs("div", { className: "flex gap-2 overflow-x-auto pb-1", children: [
    /* @__PURE__ */ o.jsx(
      _n,
      {
        label: "Battery",
        value: `${K(a, 0)}%`,
        color: Z(a) < 30 ? "text-red-500" : Z(a) < 65 ? "text-orange-500" : "text-green-500",
        icon: Io,
        onClick: () => T("sensor.olins_van_bms_battery", "Battery SOC", "%")
      }
    ),
    /* @__PURE__ */ o.jsx(
      _n,
      {
        label: "Solar",
        value: `${K(s, 0)}W`,
        color: Z(s) > 50 ? "text-yellow-500" : "text-muted-foreground",
        icon: Fr,
        onClick: () => T("sensor.total_mppt_pv_power", "Solar Power", "W")
      }
    ),
    /* @__PURE__ */ o.jsx(
      _n,
      {
        label: "Lights",
        value: se > 0 ? `${se} on` : "Off",
        color: se > 0 ? "text-yellow-500" : "text-muted-foreground",
        icon: ii,
        onClick: V
      }
    ),
    /* @__PURE__ */ o.jsx(
      _n,
      {
        label: "Inverter",
        value: J ? "ON" : "OFF",
        color: J ? "text-green-500" : "text-muted-foreground",
        icon: ri,
        onClick: () => T("sensor.inverter_power_24v", "Inverter Power", "W")
      }
    ),
    /* @__PURE__ */ o.jsx(
      _n,
      {
        label: "Internet",
        value: `${K(m, 0)} Mbps`,
        color: Z(m) > 50 ? "text-green-500" : Z(m) > 10 ? "text-orange-500" : "text-red-500",
        icon: ix,
        onClick: () => T("sensor.starlink_downlink_throughput_mbps", "Internet Speed", "Mbps")
      }
    ),
    /* @__PURE__ */ o.jsx(
      _n,
      {
        label: "Fresh",
        value: `${K(r, 0)}%`,
        color: Z(r) < 20 ? "text-red-500" : Z(r) < 50 ? "text-orange-500" : "text-blue-500",
        icon: Ka,
        onClick: () => T("sensor.a32_pro_fresh_water_tank_level", "Fresh Water", "%")
      }
    ),
    /* @__PURE__ */ o.jsx(
      _n,
      {
        label: "Grey",
        value: `${K(u, 0)}%`,
        color: Z(u) > 80 ? "text-red-500" : Z(u) > 60 ? "text-orange-500" : "text-green-500",
        icon: Pr,
        onClick: () => T("sensor.a32_pro_grey_water_tank_level", "Grey Water", "%")
      }
    ),
    /* @__PURE__ */ o.jsx(
      _n,
      {
        label: "Grey Dump",
        value: I ? "OPEN" : "Closed",
        color: I ? "text-orange-500" : "text-muted-foreground",
        icon: nx,
        onClick: D
      }
    ),
    /* @__PURE__ */ o.jsx(
      _n,
      {
        label: "Fuel",
        value: `${K(f, 0)}%`,
        color: Z(f) < 15 ? "text-red-500" : Z(f) < 30 ? "text-orange-500" : "text-green-500",
        icon: yp,
        onClick: () => T("sensor.stable_fuel_level", "Fuel Level", "%")
      }
    ),
    /* @__PURE__ */ o.jsx(
      _n,
      {
        label: "Propane",
        value: `${K(d, 0)}%`,
        color: Z(d) < 15 ? "text-red-500" : Z(d) < 30 ? "text-orange-500" : "text-green-500",
        icon: si,
        onClick: () => T("sensor.propane_tank_percentage", "Propane", "%")
      }
    ),
    /* @__PURE__ */ o.jsx(
      _n,
      {
        label: "Eco Mode",
        value: L ? "ON" : "OFF",
        color: L ? "text-yellow-500" : "text-muted-foreground",
        icon: Fo,
        onClick: U
      }
    )
  ] });
}
function jx() {
  return /* @__PURE__ */ o.jsxs("div", { className: "flex flex-wrap gap-2", children: [
    /* @__PURE__ */ o.jsx(
      ct,
      {
        entityId: "input_boolean.shore_power_charger_enabled",
        name: "Shore",
        icon: bp,
        activeColor: "green"
      }
    ),
    /* @__PURE__ */ o.jsx(
      ct,
      {
        entityId: "switch.a32_pro_switch06_grey_water_tank_valve",
        name: "Grey Dump",
        icon: Pr,
        activeColor: "orange"
      }
    ),
    /* @__PURE__ */ o.jsx(Ap, {}),
    /* @__PURE__ */ o.jsx(
      ct,
      {
        entityId: "switch.a32_pro_switch21_left_outdoor_lights",
        name: "Left Light",
        icon: Mo,
        activeColor: "yellow"
      }
    ),
    /* @__PURE__ */ o.jsx(
      ct,
      {
        entityId: "switch.a32_pro_switch22_right_outdoor_lights",
        name: "Right Light",
        icon: Mo,
        activeColor: "yellow"
      }
    ),
    /* @__PURE__ */ o.jsx(
      ct,
      {
        entityId: "switch.a32_pro_switch23_rear_outdoor_lights",
        name: "Rear Light",
        icon: Mo,
        activeColor: "yellow"
      }
    ),
    /* @__PURE__ */ o.jsx(
      ct,
      {
        entityId: "switch.a32_pro_switch31_lightbar",
        name: "Lightbar",
        icon: ii,
        activeColor: "yellow"
      }
    ),
    /* @__PURE__ */ o.jsx(
      ct,
      {
        entityId: "switch.a32_pro_switch28_compressor",
        name: "Compressor",
        icon: Cv,
        activeColor: "cyan"
      }
    )
  ] });
}
function Nx() {
  return /* @__PURE__ */ o.jsxs("div", { className: "flex flex-wrap gap-2", children: [
    /* @__PURE__ */ o.jsx(
      ct,
      {
        entityId: "input_boolean.power_saving_mode",
        name: "Eco",
        icon: Fo,
        activeColor: "yellow"
      }
    ),
    /* @__PURE__ */ o.jsx(
      ct,
      {
        entityId: "input_boolean.sleep_mode",
        name: "Sleep",
        icon: ef,
        activeColor: "purple"
      }
    ),
    /* @__PURE__ */ o.jsx(
      ct,
      {
        entityId: "input_boolean.shower_mode",
        name: "Shower",
        icon: Wr,
        activeColor: "cyan"
      }
    )
  ] });
}
function zp() {
  return /* @__PURE__ */ o.jsxs(ea, { title: "Home", children: [
    /* @__PURE__ */ o.jsx(Sx, {}),
    /* @__PURE__ */ o.jsx(bx, {}),
    /* @__PURE__ */ o.jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ o.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ o.jsx(
            Uo,
            {
              name: "Living",
              tempEntity: "sensor.a32_pro_bme280_1_temperature",
              humidityEntity: "sensor.a32_pro_bme280_1_relative_humidity"
            }
          ),
          /* @__PURE__ */ o.jsx(
            Uo,
            {
              name: "Outdoor",
              tempEntity: "sensor.a32_pro_bme280_4_temperature",
              humidityEntity: "sensor.a32_pro_bme280_4_relative_humidity"
            }
          )
        ] }),
        /* @__PURE__ */ o.jsx(xx, {}),
        /* @__PURE__ */ o.jsx(Ep, {}),
        /* @__PURE__ */ o.jsx(Cp, {})
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ o.jsx(Np, { compact: !0 }),
        /* @__PURE__ */ o.jsx(Mp, { compact: !0 }),
        /* @__PURE__ */ o.jsx(jx, {})
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ o.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ o.jsx(Hr, { name: "Fresh", entityId: "sensor.a32_pro_fresh_water_tank_level" }),
          /* @__PURE__ */ o.jsx(
            Hr,
            {
              name: "Grey",
              entityId: "sensor.a32_pro_grey_water_tank_level",
              invertWarning: !0
            }
          )
        ] }),
        /* @__PURE__ */ o.jsx(Nx, {}),
        /* @__PURE__ */ o.jsx(gx, {})
      ] })
    ] })
  ] });
}
var Mx = { value: () => {
} };
function Op() {
  for (var a = 0, s = arguments.length, r = {}, u; a < s; ++a) {
    if (!(u = arguments[a] + "") || u in r || /[\s.]/.test(u)) throw new Error("illegal type: " + u);
    r[u] = [];
  }
  return new Or(r);
}
function Or(a) {
  this._ = a;
}
function Tx(a, s) {
  return a.trim().split(/^|\s+/).map(function(r) {
    var u = "", f = r.indexOf(".");
    if (f >= 0 && (u = r.slice(f + 1), r = r.slice(0, f)), r && !s.hasOwnProperty(r)) throw new Error("unknown type: " + r);
    return { type: r, name: u };
  });
}
Or.prototype = Op.prototype = {
  constructor: Or,
  on: function(a, s) {
    var r = this._, u = Tx(a + "", r), f, d = -1, m = u.length;
    if (arguments.length < 2) {
      for (; ++d < m; ) if ((f = (a = u[d]).type) && (f = Ex(r[f], a.name))) return f;
      return;
    }
    if (s != null && typeof s != "function") throw new Error("invalid callback: " + s);
    for (; ++d < m; )
      if (f = (a = u[d]).type) r[f] = N0(r[f], a.name, s);
      else if (s == null) for (f in r) r[f] = N0(r[f], a.name, null);
    return this;
  },
  copy: function() {
    var a = {}, s = this._;
    for (var r in s) a[r] = s[r].slice();
    return new Or(a);
  },
  call: function(a, s) {
    if ((f = arguments.length - 2) > 0) for (var r = new Array(f), u = 0, f, d; u < f; ++u) r[u] = arguments[u + 2];
    if (!this._.hasOwnProperty(a)) throw new Error("unknown type: " + a);
    for (d = this._[a], u = 0, f = d.length; u < f; ++u) d[u].value.apply(s, r);
  },
  apply: function(a, s, r) {
    if (!this._.hasOwnProperty(a)) throw new Error("unknown type: " + a);
    for (var u = this._[a], f = 0, d = u.length; f < d; ++f) u[f].value.apply(s, r);
  }
};
function Ex(a, s) {
  for (var r = 0, u = a.length, f; r < u; ++r)
    if ((f = a[r]).name === s)
      return f.value;
}
function N0(a, s, r) {
  for (var u = 0, f = a.length; u < f; ++u)
    if (a[u].name === s) {
      a[u] = Mx, a = a.slice(0, u).concat(a.slice(u + 1));
      break;
    }
  return r != null && a.push({ name: s, value: r }), a;
}
var Lo = "http://www.w3.org/1999/xhtml";
const M0 = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: Lo,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function tc(a) {
  var s = a += "", r = s.indexOf(":");
  return r >= 0 && (s = a.slice(0, r)) !== "xmlns" && (a = a.slice(r + 1)), M0.hasOwnProperty(s) ? { space: M0[s], local: a } : a;
}
function Cx(a) {
  return function() {
    var s = this.ownerDocument, r = this.namespaceURI;
    return r === Lo && s.documentElement.namespaceURI === Lo ? s.createElement(a) : s.createElementNS(r, a);
  };
}
function Ax(a) {
  return function() {
    return this.ownerDocument.createElementNS(a.space, a.local);
  };
}
function Rp(a) {
  var s = tc(a);
  return (s.local ? Ax : Cx)(s);
}
function zx() {
}
function nf(a) {
  return a == null ? zx : function() {
    return this.querySelector(a);
  };
}
function Ox(a) {
  typeof a != "function" && (a = nf(a));
  for (var s = this._groups, r = s.length, u = new Array(r), f = 0; f < r; ++f)
    for (var d = s[f], m = d.length, p = u[f] = new Array(m), y, g, x = 0; x < m; ++x)
      (y = d[x]) && (g = a.call(y, y.__data__, x, d)) && ("__data__" in y && (g.__data__ = y.__data__), p[x] = g);
  return new wn(u, this._parents);
}
function Rx(a) {
  return a == null ? [] : Array.isArray(a) ? a : Array.from(a);
}
function kx() {
  return [];
}
function kp(a) {
  return a == null ? kx : function() {
    return this.querySelectorAll(a);
  };
}
function Dx(a) {
  return function() {
    return Rx(a.apply(this, arguments));
  };
}
function Hx(a) {
  typeof a == "function" ? a = Dx(a) : a = kp(a);
  for (var s = this._groups, r = s.length, u = [], f = [], d = 0; d < r; ++d)
    for (var m = s[d], p = m.length, y, g = 0; g < p; ++g)
      (y = m[g]) && (u.push(a.call(y, y.__data__, g, m)), f.push(y));
  return new wn(u, f);
}
function Dp(a) {
  return function() {
    return this.matches(a);
  };
}
function Hp(a) {
  return function(s) {
    return s.matches(a);
  };
}
var Ux = Array.prototype.find;
function Lx(a) {
  return function() {
    return Ux.call(this.children, a);
  };
}
function Bx() {
  return this.firstElementChild;
}
function qx(a) {
  return this.select(a == null ? Bx : Lx(typeof a == "function" ? a : Hp(a)));
}
var Yx = Array.prototype.filter;
function Gx() {
  return Array.from(this.children);
}
function Xx(a) {
  return function() {
    return Yx.call(this.children, a);
  };
}
function Vx(a) {
  return this.selectAll(a == null ? Gx : Xx(typeof a == "function" ? a : Hp(a)));
}
function Qx(a) {
  typeof a != "function" && (a = Dp(a));
  for (var s = this._groups, r = s.length, u = new Array(r), f = 0; f < r; ++f)
    for (var d = s[f], m = d.length, p = u[f] = [], y, g = 0; g < m; ++g)
      (y = d[g]) && a.call(y, y.__data__, g, d) && p.push(y);
  return new wn(u, this._parents);
}
function Up(a) {
  return new Array(a.length);
}
function Zx() {
  return new wn(this._enter || this._groups.map(Up), this._parents);
}
function Ur(a, s) {
  this.ownerDocument = a.ownerDocument, this.namespaceURI = a.namespaceURI, this._next = null, this._parent = a, this.__data__ = s;
}
Ur.prototype = {
  constructor: Ur,
  appendChild: function(a) {
    return this._parent.insertBefore(a, this._next);
  },
  insertBefore: function(a, s) {
    return this._parent.insertBefore(a, s);
  },
  querySelector: function(a) {
    return this._parent.querySelector(a);
  },
  querySelectorAll: function(a) {
    return this._parent.querySelectorAll(a);
  }
};
function Kx(a) {
  return function() {
    return a;
  };
}
function Jx(a, s, r, u, f, d) {
  for (var m = 0, p, y = s.length, g = d.length; m < g; ++m)
    (p = s[m]) ? (p.__data__ = d[m], u[m] = p) : r[m] = new Ur(a, d[m]);
  for (; m < y; ++m)
    (p = s[m]) && (f[m] = p);
}
function $x(a, s, r, u, f, d, m) {
  var p, y, g = /* @__PURE__ */ new Map(), x = s.length, _ = d.length, S = new Array(x), j;
  for (p = 0; p < x; ++p)
    (y = s[p]) && (S[p] = j = m.call(y, y.__data__, p, s) + "", g.has(j) ? f[p] = y : g.set(j, y));
  for (p = 0; p < _; ++p)
    j = m.call(a, d[p], p, d) + "", (y = g.get(j)) ? (u[p] = y, y.__data__ = d[p], g.delete(j)) : r[p] = new Ur(a, d[p]);
  for (p = 0; p < x; ++p)
    (y = s[p]) && g.get(S[p]) === y && (f[p] = y);
}
function Wx(a) {
  return a.__data__;
}
function Fx(a, s) {
  if (!arguments.length) return Array.from(this, Wx);
  var r = s ? $x : Jx, u = this._parents, f = this._groups;
  typeof a != "function" && (a = Kx(a));
  for (var d = f.length, m = new Array(d), p = new Array(d), y = new Array(d), g = 0; g < d; ++g) {
    var x = u[g], _ = f[g], S = _.length, j = Ix(a.call(x, x && x.__data__, g, u)), T = j.length, D = p[g] = new Array(T), U = m[g] = new Array(T), V = y[g] = new Array(S);
    r(x, _, D, U, V, j, s);
    for (var J = 0, L = 0, I, se; J < T; ++J)
      if (I = D[J]) {
        for (J >= L && (L = J + 1); !(se = U[L]) && ++L < T; ) ;
        I._next = se || null;
      }
  }
  return m = new wn(m, u), m._enter = p, m._exit = y, m;
}
function Ix(a) {
  return typeof a == "object" && "length" in a ? a : Array.from(a);
}
function Px() {
  return new wn(this._exit || this._groups.map(Up), this._parents);
}
function e_(a, s, r) {
  var u = this.enter(), f = this, d = this.exit();
  return typeof a == "function" ? (u = a(u), u && (u = u.selection())) : u = u.append(a + ""), s != null && (f = s(f), f && (f = f.selection())), r == null ? d.remove() : r(d), u && f ? u.merge(f).order() : f;
}
function t_(a) {
  for (var s = a.selection ? a.selection() : a, r = this._groups, u = s._groups, f = r.length, d = u.length, m = Math.min(f, d), p = new Array(f), y = 0; y < m; ++y)
    for (var g = r[y], x = u[y], _ = g.length, S = p[y] = new Array(_), j, T = 0; T < _; ++T)
      (j = g[T] || x[T]) && (S[T] = j);
  for (; y < f; ++y)
    p[y] = r[y];
  return new wn(p, this._parents);
}
function n_() {
  for (var a = this._groups, s = -1, r = a.length; ++s < r; )
    for (var u = a[s], f = u.length - 1, d = u[f], m; --f >= 0; )
      (m = u[f]) && (d && m.compareDocumentPosition(d) ^ 4 && d.parentNode.insertBefore(m, d), d = m);
  return this;
}
function l_(a) {
  a || (a = a_);
  function s(_, S) {
    return _ && S ? a(_.__data__, S.__data__) : !_ - !S;
  }
  for (var r = this._groups, u = r.length, f = new Array(u), d = 0; d < u; ++d) {
    for (var m = r[d], p = m.length, y = f[d] = new Array(p), g, x = 0; x < p; ++x)
      (g = m[x]) && (y[x] = g);
    y.sort(s);
  }
  return new wn(f, this._parents).order();
}
function a_(a, s) {
  return a < s ? -1 : a > s ? 1 : a >= s ? 0 : NaN;
}
function s_() {
  var a = arguments[0];
  return arguments[0] = this, a.apply(null, arguments), this;
}
function i_() {
  return Array.from(this);
}
function r_() {
  for (var a = this._groups, s = 0, r = a.length; s < r; ++s)
    for (var u = a[s], f = 0, d = u.length; f < d; ++f) {
      var m = u[f];
      if (m) return m;
    }
  return null;
}
function c_() {
  let a = 0;
  for (const s of this) ++a;
  return a;
}
function u_() {
  return !this.node();
}
function o_(a) {
  for (var s = this._groups, r = 0, u = s.length; r < u; ++r)
    for (var f = s[r], d = 0, m = f.length, p; d < m; ++d)
      (p = f[d]) && a.call(p, p.__data__, d, f);
  return this;
}
function f_(a) {
  return function() {
    this.removeAttribute(a);
  };
}
function d_(a) {
  return function() {
    this.removeAttributeNS(a.space, a.local);
  };
}
function h_(a, s) {
  return function() {
    this.setAttribute(a, s);
  };
}
function m_(a, s) {
  return function() {
    this.setAttributeNS(a.space, a.local, s);
  };
}
function p_(a, s) {
  return function() {
    var r = s.apply(this, arguments);
    r == null ? this.removeAttribute(a) : this.setAttribute(a, r);
  };
}
function g_(a, s) {
  return function() {
    var r = s.apply(this, arguments);
    r == null ? this.removeAttributeNS(a.space, a.local) : this.setAttributeNS(a.space, a.local, r);
  };
}
function y_(a, s) {
  var r = tc(a);
  if (arguments.length < 2) {
    var u = this.node();
    return r.local ? u.getAttributeNS(r.space, r.local) : u.getAttribute(r);
  }
  return this.each((s == null ? r.local ? d_ : f_ : typeof s == "function" ? r.local ? g_ : p_ : r.local ? m_ : h_)(r, s));
}
function Lp(a) {
  return a.ownerDocument && a.ownerDocument.defaultView || a.document && a || a.defaultView;
}
function v_(a) {
  return function() {
    this.style.removeProperty(a);
  };
}
function x_(a, s, r) {
  return function() {
    this.style.setProperty(a, s, r);
  };
}
function __(a, s, r) {
  return function() {
    var u = s.apply(this, arguments);
    u == null ? this.style.removeProperty(a) : this.style.setProperty(a, u, r);
  };
}
function b_(a, s, r) {
  return arguments.length > 1 ? this.each((s == null ? v_ : typeof s == "function" ? __ : x_)(a, s, r ?? "")) : Ya(this.node(), a);
}
function Ya(a, s) {
  return a.style.getPropertyValue(s) || Lp(a).getComputedStyle(a, null).getPropertyValue(s);
}
function w_(a) {
  return function() {
    delete this[a];
  };
}
function S_(a, s) {
  return function() {
    this[a] = s;
  };
}
function j_(a, s) {
  return function() {
    var r = s.apply(this, arguments);
    r == null ? delete this[a] : this[a] = r;
  };
}
function N_(a, s) {
  return arguments.length > 1 ? this.each((s == null ? w_ : typeof s == "function" ? j_ : S_)(a, s)) : this.node()[a];
}
function Bp(a) {
  return a.trim().split(/^|\s+/);
}
function lf(a) {
  return a.classList || new qp(a);
}
function qp(a) {
  this._node = a, this._names = Bp(a.getAttribute("class") || "");
}
qp.prototype = {
  add: function(a) {
    var s = this._names.indexOf(a);
    s < 0 && (this._names.push(a), this._node.setAttribute("class", this._names.join(" ")));
  },
  remove: function(a) {
    var s = this._names.indexOf(a);
    s >= 0 && (this._names.splice(s, 1), this._node.setAttribute("class", this._names.join(" ")));
  },
  contains: function(a) {
    return this._names.indexOf(a) >= 0;
  }
};
function Yp(a, s) {
  for (var r = lf(a), u = -1, f = s.length; ++u < f; ) r.add(s[u]);
}
function Gp(a, s) {
  for (var r = lf(a), u = -1, f = s.length; ++u < f; ) r.remove(s[u]);
}
function M_(a) {
  return function() {
    Yp(this, a);
  };
}
function T_(a) {
  return function() {
    Gp(this, a);
  };
}
function E_(a, s) {
  return function() {
    (s.apply(this, arguments) ? Yp : Gp)(this, a);
  };
}
function C_(a, s) {
  var r = Bp(a + "");
  if (arguments.length < 2) {
    for (var u = lf(this.node()), f = -1, d = r.length; ++f < d; ) if (!u.contains(r[f])) return !1;
    return !0;
  }
  return this.each((typeof s == "function" ? E_ : s ? M_ : T_)(r, s));
}
function A_() {
  this.textContent = "";
}
function z_(a) {
  return function() {
    this.textContent = a;
  };
}
function O_(a) {
  return function() {
    var s = a.apply(this, arguments);
    this.textContent = s ?? "";
  };
}
function R_(a) {
  return arguments.length ? this.each(a == null ? A_ : (typeof a == "function" ? O_ : z_)(a)) : this.node().textContent;
}
function k_() {
  this.innerHTML = "";
}
function D_(a) {
  return function() {
    this.innerHTML = a;
  };
}
function H_(a) {
  return function() {
    var s = a.apply(this, arguments);
    this.innerHTML = s ?? "";
  };
}
function U_(a) {
  return arguments.length ? this.each(a == null ? k_ : (typeof a == "function" ? H_ : D_)(a)) : this.node().innerHTML;
}
function L_() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function B_() {
  return this.each(L_);
}
function q_() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function Y_() {
  return this.each(q_);
}
function G_(a) {
  var s = typeof a == "function" ? a : Rp(a);
  return this.select(function() {
    return this.appendChild(s.apply(this, arguments));
  });
}
function X_() {
  return null;
}
function V_(a, s) {
  var r = typeof a == "function" ? a : Rp(a), u = s == null ? X_ : typeof s == "function" ? s : nf(s);
  return this.select(function() {
    return this.insertBefore(r.apply(this, arguments), u.apply(this, arguments) || null);
  });
}
function Q_() {
  var a = this.parentNode;
  a && a.removeChild(this);
}
function Z_() {
  return this.each(Q_);
}
function K_() {
  var a = this.cloneNode(!1), s = this.parentNode;
  return s ? s.insertBefore(a, this.nextSibling) : a;
}
function J_() {
  var a = this.cloneNode(!0), s = this.parentNode;
  return s ? s.insertBefore(a, this.nextSibling) : a;
}
function $_(a) {
  return this.select(a ? J_ : K_);
}
function W_(a) {
  return arguments.length ? this.property("__data__", a) : this.node().__data__;
}
function F_(a) {
  return function(s) {
    a.call(this, s, this.__data__);
  };
}
function I_(a) {
  return a.trim().split(/^|\s+/).map(function(s) {
    var r = "", u = s.indexOf(".");
    return u >= 0 && (r = s.slice(u + 1), s = s.slice(0, u)), { type: s, name: r };
  });
}
function P_(a) {
  return function() {
    var s = this.__on;
    if (s) {
      for (var r = 0, u = -1, f = s.length, d; r < f; ++r)
        d = s[r], (!a.type || d.type === a.type) && d.name === a.name ? this.removeEventListener(d.type, d.listener, d.options) : s[++u] = d;
      ++u ? s.length = u : delete this.__on;
    }
  };
}
function eb(a, s, r) {
  return function() {
    var u = this.__on, f, d = F_(s);
    if (u) {
      for (var m = 0, p = u.length; m < p; ++m)
        if ((f = u[m]).type === a.type && f.name === a.name) {
          this.removeEventListener(f.type, f.listener, f.options), this.addEventListener(f.type, f.listener = d, f.options = r), f.value = s;
          return;
        }
    }
    this.addEventListener(a.type, d, r), f = { type: a.type, name: a.name, value: s, listener: d, options: r }, u ? u.push(f) : this.__on = [f];
  };
}
function tb(a, s, r) {
  var u = I_(a + ""), f, d = u.length, m;
  if (arguments.length < 2) {
    var p = this.node().__on;
    if (p) {
      for (var y = 0, g = p.length, x; y < g; ++y)
        for (f = 0, x = p[y]; f < d; ++f)
          if ((m = u[f]).type === x.type && m.name === x.name)
            return x.value;
    }
    return;
  }
  for (p = s ? eb : P_, f = 0; f < d; ++f) this.each(p(u[f], s, r));
  return this;
}
function Xp(a, s, r) {
  var u = Lp(a), f = u.CustomEvent;
  typeof f == "function" ? f = new f(s, r) : (f = u.document.createEvent("Event"), r ? (f.initEvent(s, r.bubbles, r.cancelable), f.detail = r.detail) : f.initEvent(s, !1, !1)), a.dispatchEvent(f);
}
function nb(a, s) {
  return function() {
    return Xp(this, a, s);
  };
}
function lb(a, s) {
  return function() {
    return Xp(this, a, s.apply(this, arguments));
  };
}
function ab(a, s) {
  return this.each((typeof s == "function" ? lb : nb)(a, s));
}
function* sb() {
  for (var a = this._groups, s = 0, r = a.length; s < r; ++s)
    for (var u = a[s], f = 0, d = u.length, m; f < d; ++f)
      (m = u[f]) && (yield m);
}
var ib = [null];
function wn(a, s) {
  this._groups = a, this._parents = s;
}
function ci() {
  return new wn([[document.documentElement]], ib);
}
function rb() {
  return this;
}
wn.prototype = ci.prototype = {
  constructor: wn,
  select: Ox,
  selectAll: Hx,
  selectChild: qx,
  selectChildren: Vx,
  filter: Qx,
  data: Fx,
  enter: Zx,
  exit: Px,
  join: e_,
  merge: t_,
  selection: rb,
  order: n_,
  sort: l_,
  call: s_,
  nodes: i_,
  node: r_,
  size: c_,
  empty: u_,
  each: o_,
  attr: y_,
  style: b_,
  property: N_,
  classed: C_,
  text: R_,
  html: U_,
  raise: B_,
  lower: Y_,
  append: G_,
  insert: V_,
  remove: Z_,
  clone: $_,
  datum: W_,
  on: tb,
  dispatch: ab,
  [Symbol.iterator]: sb
};
function af(a, s, r) {
  a.prototype = s.prototype = r, r.constructor = a;
}
function Vp(a, s) {
  var r = Object.create(a.prototype);
  for (var u in s) r[u] = s[u];
  return r;
}
function ui() {
}
var ti = 0.7, Lr = 1 / ti, qa = "\\s*([+-]?\\d+)\\s*", ni = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", An = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", cb = /^#([0-9a-f]{3,8})$/, ub = new RegExp(`^rgb\\(${qa},${qa},${qa}\\)$`), ob = new RegExp(`^rgb\\(${An},${An},${An}\\)$`), fb = new RegExp(`^rgba\\(${qa},${qa},${qa},${ni}\\)$`), db = new RegExp(`^rgba\\(${An},${An},${An},${ni}\\)$`), hb = new RegExp(`^hsl\\(${ni},${An},${An}\\)$`), mb = new RegExp(`^hsla\\(${ni},${An},${An},${ni}\\)$`), T0 = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
af(ui, li, {
  copy(a) {
    return Object.assign(new this.constructor(), this, a);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: E0,
  // Deprecated! Use color.formatHex.
  formatHex: E0,
  formatHex8: pb,
  formatHsl: gb,
  formatRgb: C0,
  toString: C0
});
function E0() {
  return this.rgb().formatHex();
}
function pb() {
  return this.rgb().formatHex8();
}
function gb() {
  return Qp(this).formatHsl();
}
function C0() {
  return this.rgb().formatRgb();
}
function li(a) {
  var s, r;
  return a = (a + "").trim().toLowerCase(), (s = cb.exec(a)) ? (r = s[1].length, s = parseInt(s[1], 16), r === 6 ? A0(s) : r === 3 ? new Xt(s >> 8 & 15 | s >> 4 & 240, s >> 4 & 15 | s & 240, (s & 15) << 4 | s & 15, 1) : r === 8 ? Mr(s >> 24 & 255, s >> 16 & 255, s >> 8 & 255, (s & 255) / 255) : r === 4 ? Mr(s >> 12 & 15 | s >> 8 & 240, s >> 8 & 15 | s >> 4 & 240, s >> 4 & 15 | s & 240, ((s & 15) << 4 | s & 15) / 255) : null) : (s = ub.exec(a)) ? new Xt(s[1], s[2], s[3], 1) : (s = ob.exec(a)) ? new Xt(s[1] * 255 / 100, s[2] * 255 / 100, s[3] * 255 / 100, 1) : (s = fb.exec(a)) ? Mr(s[1], s[2], s[3], s[4]) : (s = db.exec(a)) ? Mr(s[1] * 255 / 100, s[2] * 255 / 100, s[3] * 255 / 100, s[4]) : (s = hb.exec(a)) ? R0(s[1], s[2] / 100, s[3] / 100, 1) : (s = mb.exec(a)) ? R0(s[1], s[2] / 100, s[3] / 100, s[4]) : T0.hasOwnProperty(a) ? A0(T0[a]) : a === "transparent" ? new Xt(NaN, NaN, NaN, 0) : null;
}
function A0(a) {
  return new Xt(a >> 16 & 255, a >> 8 & 255, a & 255, 1);
}
function Mr(a, s, r, u) {
  return u <= 0 && (a = s = r = NaN), new Xt(a, s, r, u);
}
function yb(a) {
  return a instanceof ui || (a = li(a)), a ? (a = a.rgb(), new Xt(a.r, a.g, a.b, a.opacity)) : new Xt();
}
function Bo(a, s, r, u) {
  return arguments.length === 1 ? yb(a) : new Xt(a, s, r, u ?? 1);
}
function Xt(a, s, r, u) {
  this.r = +a, this.g = +s, this.b = +r, this.opacity = +u;
}
af(Xt, Bo, Vp(ui, {
  brighter(a) {
    return a = a == null ? Lr : Math.pow(Lr, a), new Xt(this.r * a, this.g * a, this.b * a, this.opacity);
  },
  darker(a) {
    return a = a == null ? ti : Math.pow(ti, a), new Xt(this.r * a, this.g * a, this.b * a, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Xt($l(this.r), $l(this.g), $l(this.b), Br(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: z0,
  // Deprecated! Use color.formatHex.
  formatHex: z0,
  formatHex8: vb,
  formatRgb: O0,
  toString: O0
}));
function z0() {
  return `#${Jl(this.r)}${Jl(this.g)}${Jl(this.b)}`;
}
function vb() {
  return `#${Jl(this.r)}${Jl(this.g)}${Jl(this.b)}${Jl((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function O0() {
  const a = Br(this.opacity);
  return `${a === 1 ? "rgb(" : "rgba("}${$l(this.r)}, ${$l(this.g)}, ${$l(this.b)}${a === 1 ? ")" : `, ${a})`}`;
}
function Br(a) {
  return isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
}
function $l(a) {
  return Math.max(0, Math.min(255, Math.round(a) || 0));
}
function Jl(a) {
  return a = $l(a), (a < 16 ? "0" : "") + a.toString(16);
}
function R0(a, s, r, u) {
  return u <= 0 ? a = s = r = NaN : r <= 0 || r >= 1 ? a = s = NaN : s <= 0 && (a = NaN), new bn(a, s, r, u);
}
function Qp(a) {
  if (a instanceof bn) return new bn(a.h, a.s, a.l, a.opacity);
  if (a instanceof ui || (a = li(a)), !a) return new bn();
  if (a instanceof bn) return a;
  a = a.rgb();
  var s = a.r / 255, r = a.g / 255, u = a.b / 255, f = Math.min(s, r, u), d = Math.max(s, r, u), m = NaN, p = d - f, y = (d + f) / 2;
  return p ? (s === d ? m = (r - u) / p + (r < u) * 6 : r === d ? m = (u - s) / p + 2 : m = (s - r) / p + 4, p /= y < 0.5 ? d + f : 2 - d - f, m *= 60) : p = y > 0 && y < 1 ? 0 : m, new bn(m, p, y, a.opacity);
}
function xb(a, s, r, u) {
  return arguments.length === 1 ? Qp(a) : new bn(a, s, r, u ?? 1);
}
function bn(a, s, r, u) {
  this.h = +a, this.s = +s, this.l = +r, this.opacity = +u;
}
af(bn, xb, Vp(ui, {
  brighter(a) {
    return a = a == null ? Lr : Math.pow(Lr, a), new bn(this.h, this.s, this.l * a, this.opacity);
  },
  darker(a) {
    return a = a == null ? ti : Math.pow(ti, a), new bn(this.h, this.s, this.l * a, this.opacity);
  },
  rgb() {
    var a = this.h % 360 + (this.h < 0) * 360, s = isNaN(a) || isNaN(this.s) ? 0 : this.s, r = this.l, u = r + (r < 0.5 ? r : 1 - r) * s, f = 2 * r - u;
    return new Xt(
      Eo(a >= 240 ? a - 240 : a + 120, f, u),
      Eo(a, f, u),
      Eo(a < 120 ? a + 240 : a - 120, f, u),
      this.opacity
    );
  },
  clamp() {
    return new bn(k0(this.h), Tr(this.s), Tr(this.l), Br(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const a = Br(this.opacity);
    return `${a === 1 ? "hsl(" : "hsla("}${k0(this.h)}, ${Tr(this.s) * 100}%, ${Tr(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
  }
}));
function k0(a) {
  return a = (a || 0) % 360, a < 0 ? a + 360 : a;
}
function Tr(a) {
  return Math.max(0, Math.min(1, a || 0));
}
function Eo(a, s, r) {
  return (a < 60 ? s + (r - s) * a / 60 : a < 180 ? r : a < 240 ? s + (r - s) * (240 - a) / 60 : s) * 255;
}
const Zp = (a) => () => a;
function _b(a, s) {
  return function(r) {
    return a + r * s;
  };
}
function bb(a, s, r) {
  return a = Math.pow(a, r), s = Math.pow(s, r) - a, r = 1 / r, function(u) {
    return Math.pow(a + u * s, r);
  };
}
function wb(a) {
  return (a = +a) == 1 ? Kp : function(s, r) {
    return r - s ? bb(s, r, a) : Zp(isNaN(s) ? r : s);
  };
}
function Kp(a, s) {
  var r = s - a;
  return r ? _b(a, r) : Zp(isNaN(a) ? s : a);
}
const D0 = (function a(s) {
  var r = wb(s);
  function u(f, d) {
    var m = r((f = Bo(f)).r, (d = Bo(d)).r), p = r(f.g, d.g), y = r(f.b, d.b), g = Kp(f.opacity, d.opacity);
    return function(x) {
      return f.r = m(x), f.g = p(x), f.b = y(x), f.opacity = g(x), f + "";
    };
  }
  return u.gamma = a, u;
})(1);
function Tl(a, s) {
  return a = +a, s = +s, function(r) {
    return a * (1 - r) + s * r;
  };
}
var qo = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, Co = new RegExp(qo.source, "g");
function Sb(a) {
  return function() {
    return a;
  };
}
function jb(a) {
  return function(s) {
    return a(s) + "";
  };
}
function Nb(a, s) {
  var r = qo.lastIndex = Co.lastIndex = 0, u, f, d, m = -1, p = [], y = [];
  for (a = a + "", s = s + ""; (u = qo.exec(a)) && (f = Co.exec(s)); )
    (d = f.index) > r && (d = s.slice(r, d), p[m] ? p[m] += d : p[++m] = d), (u = u[0]) === (f = f[0]) ? p[m] ? p[m] += f : p[++m] = f : (p[++m] = null, y.push({ i: m, x: Tl(u, f) })), r = Co.lastIndex;
  return r < s.length && (d = s.slice(r), p[m] ? p[m] += d : p[++m] = d), p.length < 2 ? y[0] ? jb(y[0].x) : Sb(s) : (s = y.length, function(g) {
    for (var x = 0, _; x < s; ++x) p[(_ = y[x]).i] = _.x(g);
    return p.join("");
  });
}
var H0 = 180 / Math.PI, Yo = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function Jp(a, s, r, u, f, d) {
  var m, p, y;
  return (m = Math.sqrt(a * a + s * s)) && (a /= m, s /= m), (y = a * r + s * u) && (r -= a * y, u -= s * y), (p = Math.sqrt(r * r + u * u)) && (r /= p, u /= p, y /= p), a * u < s * r && (a = -a, s = -s, y = -y, m = -m), {
    translateX: f,
    translateY: d,
    rotate: Math.atan2(s, a) * H0,
    skewX: Math.atan(y) * H0,
    scaleX: m,
    scaleY: p
  };
}
var Er;
function Mb(a) {
  const s = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(a + "");
  return s.isIdentity ? Yo : Jp(s.a, s.b, s.c, s.d, s.e, s.f);
}
function Tb(a) {
  return a == null || (Er || (Er = document.createElementNS("http://www.w3.org/2000/svg", "g")), Er.setAttribute("transform", a), !(a = Er.transform.baseVal.consolidate())) ? Yo : (a = a.matrix, Jp(a.a, a.b, a.c, a.d, a.e, a.f));
}
function $p(a, s, r, u) {
  function f(g) {
    return g.length ? g.pop() + " " : "";
  }
  function d(g, x, _, S, j, T) {
    if (g !== _ || x !== S) {
      var D = j.push("translate(", null, s, null, r);
      T.push({ i: D - 4, x: Tl(g, _) }, { i: D - 2, x: Tl(x, S) });
    } else (_ || S) && j.push("translate(" + _ + s + S + r);
  }
  function m(g, x, _, S) {
    g !== x ? (g - x > 180 ? x += 360 : x - g > 180 && (g += 360), S.push({ i: _.push(f(_) + "rotate(", null, u) - 2, x: Tl(g, x) })) : x && _.push(f(_) + "rotate(" + x + u);
  }
  function p(g, x, _, S) {
    g !== x ? S.push({ i: _.push(f(_) + "skewX(", null, u) - 2, x: Tl(g, x) }) : x && _.push(f(_) + "skewX(" + x + u);
  }
  function y(g, x, _, S, j, T) {
    if (g !== _ || x !== S) {
      var D = j.push(f(j) + "scale(", null, ",", null, ")");
      T.push({ i: D - 4, x: Tl(g, _) }, { i: D - 2, x: Tl(x, S) });
    } else (_ !== 1 || S !== 1) && j.push(f(j) + "scale(" + _ + "," + S + ")");
  }
  return function(g, x) {
    var _ = [], S = [];
    return g = a(g), x = a(x), d(g.translateX, g.translateY, x.translateX, x.translateY, _, S), m(g.rotate, x.rotate, _, S), p(g.skewX, x.skewX, _, S), y(g.scaleX, g.scaleY, x.scaleX, x.scaleY, _, S), g = x = null, function(j) {
      for (var T = -1, D = S.length, U; ++T < D; ) _[(U = S[T]).i] = U.x(j);
      return _.join("");
    };
  };
}
var Eb = $p(Mb, "px, ", "px)", "deg)"), Cb = $p(Tb, ", ", ")", ")"), Ga = 0, Js = 0, Ks = 0, Wp = 1e3, qr, $s, Yr = 0, Wl = 0, nc = 0, ai = typeof performance == "object" && performance.now ? performance : Date, Fp = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(a) {
  setTimeout(a, 17);
};
function sf() {
  return Wl || (Fp(Ab), Wl = ai.now() + nc);
}
function Ab() {
  Wl = 0;
}
function Gr() {
  this._call = this._time = this._next = null;
}
Gr.prototype = Ip.prototype = {
  constructor: Gr,
  restart: function(a, s, r) {
    if (typeof a != "function") throw new TypeError("callback is not a function");
    r = (r == null ? sf() : +r) + (s == null ? 0 : +s), !this._next && $s !== this && ($s ? $s._next = this : qr = this, $s = this), this._call = a, this._time = r, Go();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, Go());
  }
};
function Ip(a, s, r) {
  var u = new Gr();
  return u.restart(a, s, r), u;
}
function zb() {
  sf(), ++Ga;
  for (var a = qr, s; a; )
    (s = Wl - a._time) >= 0 && a._call.call(void 0, s), a = a._next;
  --Ga;
}
function U0() {
  Wl = (Yr = ai.now()) + nc, Ga = Js = 0;
  try {
    zb();
  } finally {
    Ga = 0, Rb(), Wl = 0;
  }
}
function Ob() {
  var a = ai.now(), s = a - Yr;
  s > Wp && (nc -= s, Yr = a);
}
function Rb() {
  for (var a, s = qr, r, u = 1 / 0; s; )
    s._call ? (u > s._time && (u = s._time), a = s, s = s._next) : (r = s._next, s._next = null, s = a ? a._next = r : qr = r);
  $s = a, Go(u);
}
function Go(a) {
  if (!Ga) {
    Js && (Js = clearTimeout(Js));
    var s = a - Wl;
    s > 24 ? (a < 1 / 0 && (Js = setTimeout(U0, a - ai.now() - nc)), Ks && (Ks = clearInterval(Ks))) : (Ks || (Yr = ai.now(), Ks = setInterval(Ob, Wp)), Ga = 1, Fp(U0));
  }
}
function L0(a, s, r) {
  var u = new Gr();
  return s = s == null ? 0 : +s, u.restart((f) => {
    u.stop(), a(f + s);
  }, s, r), u;
}
var kb = Op("start", "end", "cancel", "interrupt"), Db = [], Pp = 0, B0 = 1, Xo = 2, Rr = 3, q0 = 4, Vo = 5, kr = 6;
function lc(a, s, r, u, f, d) {
  var m = a.__transition;
  if (!m) a.__transition = {};
  else if (r in m) return;
  Hb(a, r, {
    name: s,
    index: u,
    // For context during callback.
    group: f,
    // For context during callback.
    on: kb,
    tween: Db,
    time: d.time,
    delay: d.delay,
    duration: d.duration,
    ease: d.ease,
    timer: null,
    state: Pp
  });
}
function rf(a, s) {
  var r = Sn(a, s);
  if (r.state > Pp) throw new Error("too late; already scheduled");
  return r;
}
function On(a, s) {
  var r = Sn(a, s);
  if (r.state > Rr) throw new Error("too late; already running");
  return r;
}
function Sn(a, s) {
  var r = a.__transition;
  if (!r || !(r = r[s])) throw new Error("transition not found");
  return r;
}
function Hb(a, s, r) {
  var u = a.__transition, f;
  u[s] = r, r.timer = Ip(d, 0, r.time);
  function d(g) {
    r.state = B0, r.timer.restart(m, r.delay, r.time), r.delay <= g && m(g - r.delay);
  }
  function m(g) {
    var x, _, S, j;
    if (r.state !== B0) return y();
    for (x in u)
      if (j = u[x], j.name === r.name) {
        if (j.state === Rr) return L0(m);
        j.state === q0 ? (j.state = kr, j.timer.stop(), j.on.call("interrupt", a, a.__data__, j.index, j.group), delete u[x]) : +x < s && (j.state = kr, j.timer.stop(), j.on.call("cancel", a, a.__data__, j.index, j.group), delete u[x]);
      }
    if (L0(function() {
      r.state === Rr && (r.state = q0, r.timer.restart(p, r.delay, r.time), p(g));
    }), r.state = Xo, r.on.call("start", a, a.__data__, r.index, r.group), r.state === Xo) {
      for (r.state = Rr, f = new Array(S = r.tween.length), x = 0, _ = -1; x < S; ++x)
        (j = r.tween[x].value.call(a, a.__data__, r.index, r.group)) && (f[++_] = j);
      f.length = _ + 1;
    }
  }
  function p(g) {
    for (var x = g < r.duration ? r.ease.call(null, g / r.duration) : (r.timer.restart(y), r.state = Vo, 1), _ = -1, S = f.length; ++_ < S; )
      f[_].call(a, x);
    r.state === Vo && (r.on.call("end", a, a.__data__, r.index, r.group), y());
  }
  function y() {
    r.state = kr, r.timer.stop(), delete u[s];
    for (var g in u) return;
    delete a.__transition;
  }
}
function Ub(a, s) {
  var r = a.__transition, u, f, d = !0, m;
  if (r) {
    s = s == null ? null : s + "";
    for (m in r) {
      if ((u = r[m]).name !== s) {
        d = !1;
        continue;
      }
      f = u.state > Xo && u.state < Vo, u.state = kr, u.timer.stop(), u.on.call(f ? "interrupt" : "cancel", a, a.__data__, u.index, u.group), delete r[m];
    }
    d && delete a.__transition;
  }
}
function Lb(a) {
  return this.each(function() {
    Ub(this, a);
  });
}
function Bb(a, s) {
  var r, u;
  return function() {
    var f = On(this, a), d = f.tween;
    if (d !== r) {
      u = r = d;
      for (var m = 0, p = u.length; m < p; ++m)
        if (u[m].name === s) {
          u = u.slice(), u.splice(m, 1);
          break;
        }
    }
    f.tween = u;
  };
}
function qb(a, s, r) {
  var u, f;
  if (typeof r != "function") throw new Error();
  return function() {
    var d = On(this, a), m = d.tween;
    if (m !== u) {
      f = (u = m).slice();
      for (var p = { name: s, value: r }, y = 0, g = f.length; y < g; ++y)
        if (f[y].name === s) {
          f[y] = p;
          break;
        }
      y === g && f.push(p);
    }
    d.tween = f;
  };
}
function Yb(a, s) {
  var r = this._id;
  if (a += "", arguments.length < 2) {
    for (var u = Sn(this.node(), r).tween, f = 0, d = u.length, m; f < d; ++f)
      if ((m = u[f]).name === a)
        return m.value;
    return null;
  }
  return this.each((s == null ? Bb : qb)(r, a, s));
}
function cf(a, s, r) {
  var u = a._id;
  return a.each(function() {
    var f = On(this, u);
    (f.value || (f.value = {}))[s] = r.apply(this, arguments);
  }), function(f) {
    return Sn(f, u).value[s];
  };
}
function eg(a, s) {
  var r;
  return (typeof s == "number" ? Tl : s instanceof li ? D0 : (r = li(s)) ? (s = r, D0) : Nb)(a, s);
}
function Gb(a) {
  return function() {
    this.removeAttribute(a);
  };
}
function Xb(a) {
  return function() {
    this.removeAttributeNS(a.space, a.local);
  };
}
function Vb(a, s, r) {
  var u, f = r + "", d;
  return function() {
    var m = this.getAttribute(a);
    return m === f ? null : m === u ? d : d = s(u = m, r);
  };
}
function Qb(a, s, r) {
  var u, f = r + "", d;
  return function() {
    var m = this.getAttributeNS(a.space, a.local);
    return m === f ? null : m === u ? d : d = s(u = m, r);
  };
}
function Zb(a, s, r) {
  var u, f, d;
  return function() {
    var m, p = r(this), y;
    return p == null ? void this.removeAttribute(a) : (m = this.getAttribute(a), y = p + "", m === y ? null : m === u && y === f ? d : (f = y, d = s(u = m, p)));
  };
}
function Kb(a, s, r) {
  var u, f, d;
  return function() {
    var m, p = r(this), y;
    return p == null ? void this.removeAttributeNS(a.space, a.local) : (m = this.getAttributeNS(a.space, a.local), y = p + "", m === y ? null : m === u && y === f ? d : (f = y, d = s(u = m, p)));
  };
}
function Jb(a, s) {
  var r = tc(a), u = r === "transform" ? Cb : eg;
  return this.attrTween(a, typeof s == "function" ? (r.local ? Kb : Zb)(r, u, cf(this, "attr." + a, s)) : s == null ? (r.local ? Xb : Gb)(r) : (r.local ? Qb : Vb)(r, u, s));
}
function $b(a, s) {
  return function(r) {
    this.setAttribute(a, s.call(this, r));
  };
}
function Wb(a, s) {
  return function(r) {
    this.setAttributeNS(a.space, a.local, s.call(this, r));
  };
}
function Fb(a, s) {
  var r, u;
  function f() {
    var d = s.apply(this, arguments);
    return d !== u && (r = (u = d) && Wb(a, d)), r;
  }
  return f._value = s, f;
}
function Ib(a, s) {
  var r, u;
  function f() {
    var d = s.apply(this, arguments);
    return d !== u && (r = (u = d) && $b(a, d)), r;
  }
  return f._value = s, f;
}
function Pb(a, s) {
  var r = "attr." + a;
  if (arguments.length < 2) return (r = this.tween(r)) && r._value;
  if (s == null) return this.tween(r, null);
  if (typeof s != "function") throw new Error();
  var u = tc(a);
  return this.tween(r, (u.local ? Fb : Ib)(u, s));
}
function e2(a, s) {
  return function() {
    rf(this, a).delay = +s.apply(this, arguments);
  };
}
function t2(a, s) {
  return s = +s, function() {
    rf(this, a).delay = s;
  };
}
function n2(a) {
  var s = this._id;
  return arguments.length ? this.each((typeof a == "function" ? e2 : t2)(s, a)) : Sn(this.node(), s).delay;
}
function l2(a, s) {
  return function() {
    On(this, a).duration = +s.apply(this, arguments);
  };
}
function a2(a, s) {
  return s = +s, function() {
    On(this, a).duration = s;
  };
}
function s2(a) {
  var s = this._id;
  return arguments.length ? this.each((typeof a == "function" ? l2 : a2)(s, a)) : Sn(this.node(), s).duration;
}
function i2(a, s) {
  if (typeof s != "function") throw new Error();
  return function() {
    On(this, a).ease = s;
  };
}
function r2(a) {
  var s = this._id;
  return arguments.length ? this.each(i2(s, a)) : Sn(this.node(), s).ease;
}
function c2(a, s) {
  return function() {
    var r = s.apply(this, arguments);
    if (typeof r != "function") throw new Error();
    On(this, a).ease = r;
  };
}
function u2(a) {
  if (typeof a != "function") throw new Error();
  return this.each(c2(this._id, a));
}
function o2(a) {
  typeof a != "function" && (a = Dp(a));
  for (var s = this._groups, r = s.length, u = new Array(r), f = 0; f < r; ++f)
    for (var d = s[f], m = d.length, p = u[f] = [], y, g = 0; g < m; ++g)
      (y = d[g]) && a.call(y, y.__data__, g, d) && p.push(y);
  return new el(u, this._parents, this._name, this._id);
}
function f2(a) {
  if (a._id !== this._id) throw new Error();
  for (var s = this._groups, r = a._groups, u = s.length, f = r.length, d = Math.min(u, f), m = new Array(u), p = 0; p < d; ++p)
    for (var y = s[p], g = r[p], x = y.length, _ = m[p] = new Array(x), S, j = 0; j < x; ++j)
      (S = y[j] || g[j]) && (_[j] = S);
  for (; p < u; ++p)
    m[p] = s[p];
  return new el(m, this._parents, this._name, this._id);
}
function d2(a) {
  return (a + "").trim().split(/^|\s+/).every(function(s) {
    var r = s.indexOf(".");
    return r >= 0 && (s = s.slice(0, r)), !s || s === "start";
  });
}
function h2(a, s, r) {
  var u, f, d = d2(s) ? rf : On;
  return function() {
    var m = d(this, a), p = m.on;
    p !== u && (f = (u = p).copy()).on(s, r), m.on = f;
  };
}
function m2(a, s) {
  var r = this._id;
  return arguments.length < 2 ? Sn(this.node(), r).on.on(a) : this.each(h2(r, a, s));
}
function p2(a) {
  return function() {
    var s = this.parentNode;
    for (var r in this.__transition) if (+r !== a) return;
    s && s.removeChild(this);
  };
}
function g2() {
  return this.on("end.remove", p2(this._id));
}
function y2(a) {
  var s = this._name, r = this._id;
  typeof a != "function" && (a = nf(a));
  for (var u = this._groups, f = u.length, d = new Array(f), m = 0; m < f; ++m)
    for (var p = u[m], y = p.length, g = d[m] = new Array(y), x, _, S = 0; S < y; ++S)
      (x = p[S]) && (_ = a.call(x, x.__data__, S, p)) && ("__data__" in x && (_.__data__ = x.__data__), g[S] = _, lc(g[S], s, r, S, g, Sn(x, r)));
  return new el(d, this._parents, s, r);
}
function v2(a) {
  var s = this._name, r = this._id;
  typeof a != "function" && (a = kp(a));
  for (var u = this._groups, f = u.length, d = [], m = [], p = 0; p < f; ++p)
    for (var y = u[p], g = y.length, x, _ = 0; _ < g; ++_)
      if (x = y[_]) {
        for (var S = a.call(x, x.__data__, _, y), j, T = Sn(x, r), D = 0, U = S.length; D < U; ++D)
          (j = S[D]) && lc(j, s, r, D, S, T);
        d.push(S), m.push(x);
      }
  return new el(d, m, s, r);
}
var x2 = ci.prototype.constructor;
function _2() {
  return new x2(this._groups, this._parents);
}
function b2(a, s) {
  var r, u, f;
  return function() {
    var d = Ya(this, a), m = (this.style.removeProperty(a), Ya(this, a));
    return d === m ? null : d === r && m === u ? f : f = s(r = d, u = m);
  };
}
function tg(a) {
  return function() {
    this.style.removeProperty(a);
  };
}
function w2(a, s, r) {
  var u, f = r + "", d;
  return function() {
    var m = Ya(this, a);
    return m === f ? null : m === u ? d : d = s(u = m, r);
  };
}
function S2(a, s, r) {
  var u, f, d;
  return function() {
    var m = Ya(this, a), p = r(this), y = p + "";
    return p == null && (y = p = (this.style.removeProperty(a), Ya(this, a))), m === y ? null : m === u && y === f ? d : (f = y, d = s(u = m, p));
  };
}
function j2(a, s) {
  var r, u, f, d = "style." + s, m = "end." + d, p;
  return function() {
    var y = On(this, a), g = y.on, x = y.value[d] == null ? p || (p = tg(s)) : void 0;
    (g !== r || f !== x) && (u = (r = g).copy()).on(m, f = x), y.on = u;
  };
}
function N2(a, s, r) {
  var u = (a += "") == "transform" ? Eb : eg;
  return s == null ? this.styleTween(a, b2(a, u)).on("end.style." + a, tg(a)) : typeof s == "function" ? this.styleTween(a, S2(a, u, cf(this, "style." + a, s))).each(j2(this._id, a)) : this.styleTween(a, w2(a, u, s), r).on("end.style." + a, null);
}
function M2(a, s, r) {
  return function(u) {
    this.style.setProperty(a, s.call(this, u), r);
  };
}
function T2(a, s, r) {
  var u, f;
  function d() {
    var m = s.apply(this, arguments);
    return m !== f && (u = (f = m) && M2(a, m, r)), u;
  }
  return d._value = s, d;
}
function E2(a, s, r) {
  var u = "style." + (a += "");
  if (arguments.length < 2) return (u = this.tween(u)) && u._value;
  if (s == null) return this.tween(u, null);
  if (typeof s != "function") throw new Error();
  return this.tween(u, T2(a, s, r ?? ""));
}
function C2(a) {
  return function() {
    this.textContent = a;
  };
}
function A2(a) {
  return function() {
    var s = a(this);
    this.textContent = s ?? "";
  };
}
function z2(a) {
  return this.tween("text", typeof a == "function" ? A2(cf(this, "text", a)) : C2(a == null ? "" : a + ""));
}
function O2(a) {
  return function(s) {
    this.textContent = a.call(this, s);
  };
}
function R2(a) {
  var s, r;
  function u() {
    var f = a.apply(this, arguments);
    return f !== r && (s = (r = f) && O2(f)), s;
  }
  return u._value = a, u;
}
function k2(a) {
  var s = "text";
  if (arguments.length < 1) return (s = this.tween(s)) && s._value;
  if (a == null) return this.tween(s, null);
  if (typeof a != "function") throw new Error();
  return this.tween(s, R2(a));
}
function D2() {
  for (var a = this._name, s = this._id, r = ng(), u = this._groups, f = u.length, d = 0; d < f; ++d)
    for (var m = u[d], p = m.length, y, g = 0; g < p; ++g)
      if (y = m[g]) {
        var x = Sn(y, s);
        lc(y, a, r, g, m, {
          time: x.time + x.delay + x.duration,
          delay: 0,
          duration: x.duration,
          ease: x.ease
        });
      }
  return new el(u, this._parents, a, r);
}
function H2() {
  var a, s, r = this, u = r._id, f = r.size();
  return new Promise(function(d, m) {
    var p = { value: m }, y = { value: function() {
      --f === 0 && d();
    } };
    r.each(function() {
      var g = On(this, u), x = g.on;
      x !== a && (s = (a = x).copy(), s._.cancel.push(p), s._.interrupt.push(p), s._.end.push(y)), g.on = s;
    }), f === 0 && d();
  });
}
var U2 = 0;
function el(a, s, r, u) {
  this._groups = a, this._parents = s, this._name = r, this._id = u;
}
function ng() {
  return ++U2;
}
var Pn = ci.prototype;
el.prototype = {
  constructor: el,
  select: y2,
  selectAll: v2,
  selectChild: Pn.selectChild,
  selectChildren: Pn.selectChildren,
  filter: o2,
  merge: f2,
  selection: _2,
  transition: D2,
  call: Pn.call,
  nodes: Pn.nodes,
  node: Pn.node,
  size: Pn.size,
  empty: Pn.empty,
  each: Pn.each,
  on: m2,
  attr: Jb,
  attrTween: Pb,
  style: N2,
  styleTween: E2,
  text: z2,
  textTween: k2,
  remove: g2,
  tween: Yb,
  delay: n2,
  duration: s2,
  ease: r2,
  easeVarying: u2,
  end: H2,
  [Symbol.iterator]: Pn[Symbol.iterator]
};
function L2(a) {
  return ((a *= 2) <= 1 ? a * a * a : (a -= 2) * a * a + 2) / 2;
}
var B2 = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: L2
};
function q2(a, s) {
  for (var r; !(r = a.__transition) || !(r = r[s]); )
    if (!(a = a.parentNode))
      throw new Error(`transition ${s} not found`);
  return r;
}
function Y2(a) {
  var s, r;
  a instanceof el ? (s = a._id, a = a._name) : (s = ng(), (r = B2).time = sf(), a = a == null ? null : a + "");
  for (var u = this._groups, f = u.length, d = 0; d < f; ++d)
    for (var m = u[d], p = m.length, y, g = 0; g < p; ++g)
      (y = m[g]) && lc(y, a, s, g, m, r || q2(y, s));
  return new el(u, this._parents, a, s);
}
ci.prototype.interrupt = Lb;
ci.prototype.transition = Y2;
function Ws(a, s, r) {
  this.k = a, this.x = s, this.y = r;
}
Ws.prototype = {
  constructor: Ws,
  scale: function(a) {
    return a === 1 ? this : new Ws(this.k * a, this.x, this.y);
  },
  translate: function(a, s) {
    return a === 0 & s === 0 ? this : new Ws(this.k, this.x + this.k * a, this.y + this.k * s);
  },
  apply: function(a) {
    return [a[0] * this.k + this.x, a[1] * this.k + this.y];
  },
  applyX: function(a) {
    return a * this.k + this.x;
  },
  applyY: function(a) {
    return a * this.k + this.y;
  },
  invert: function(a) {
    return [(a[0] - this.x) / this.k, (a[1] - this.y) / this.k];
  },
  invertX: function(a) {
    return (a - this.x) / this.k;
  },
  invertY: function(a) {
    return (a - this.y) / this.k;
  },
  rescaleX: function(a) {
    return a.copy().domain(a.range().map(this.invertX, this).map(a.invert, a));
  },
  rescaleY: function(a) {
    return a.copy().domain(a.range().map(this.invertY, this).map(a.invert, a));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
Ws.prototype;
var Y0;
(function(a) {
  a.Strict = "strict", a.Loose = "loose";
})(Y0 || (Y0 = {}));
var G0;
(function(a) {
  a.Free = "free", a.Vertical = "vertical", a.Horizontal = "horizontal";
})(G0 || (G0 = {}));
var X0;
(function(a) {
  a.Partial = "partial", a.Full = "full";
})(X0 || (X0 = {}));
var V0;
(function(a) {
  a.Bezier = "default", a.Straight = "straight", a.Step = "step", a.SmoothStep = "smoothstep", a.SimpleBezier = "simplebezier";
})(V0 || (V0 = {}));
var Q0;
(function(a) {
  a.Arrow = "arrow", a.ArrowClosed = "arrowclosed";
})(Q0 || (Q0 = {}));
var $e;
(function(a) {
  a.Left = "left", a.Top = "top", a.Right = "right", a.Bottom = "bottom";
})($e || ($e = {}));
$e.Left + "", $e.Right, $e.Right + "", $e.Left, $e.Top + "", $e.Bottom, $e.Bottom + "", $e.Top;
function G2({ sourceX: a, sourceY: s, targetX: r, targetY: u }) {
  const f = Math.abs(r - a) / 2, d = r < a ? r + f : r - f, m = Math.abs(u - s) / 2, p = u < s ? u + m : u - m;
  return [d, p, f, m];
}
const Z0 = {
  [$e.Left]: { x: -1, y: 0 },
  [$e.Right]: { x: 1, y: 0 },
  [$e.Top]: { x: 0, y: -1 },
  [$e.Bottom]: { x: 0, y: 1 }
}, X2 = ({ source: a, sourcePosition: s = $e.Bottom, target: r }) => s === $e.Left || s === $e.Right ? a.x < r.x ? { x: 1, y: 0 } : { x: -1, y: 0 } : a.y < r.y ? { x: 0, y: 1 } : { x: 0, y: -1 }, K0 = (a, s) => Math.sqrt(Math.pow(s.x - a.x, 2) + Math.pow(s.y - a.y, 2));
function V2({ source: a, sourcePosition: s = $e.Bottom, target: r, targetPosition: u = $e.Top, center: f, offset: d, stepPosition: m }) {
  const p = Z0[s], y = Z0[u], g = { x: a.x + p.x * d, y: a.y + p.y * d }, x = { x: r.x + y.x * d, y: r.y + y.y * d }, _ = X2({
    source: g,
    sourcePosition: s,
    target: x
  }), S = _.x !== 0 ? "x" : "y", j = _[S];
  let T = [], D, U;
  const V = { x: 0, y: 0 }, J = { x: 0, y: 0 }, [, , L, I] = G2({
    sourceX: a.x,
    sourceY: a.y,
    targetX: r.x,
    targetY: r.y
  });
  if (p[S] * y[S] === -1) {
    S === "x" ? (D = f.x ?? g.x + (x.x - g.x) * m, U = f.y ?? (g.y + x.y) / 2) : (D = f.x ?? (g.x + x.x) / 2, U = f.y ?? g.y + (x.y - g.y) * m);
    const $ = [
      { x: D, y: g.y },
      { x: D, y: x.y }
    ], fe = [
      { x: g.x, y: U },
      { x: x.x, y: U }
    ];
    p[S] === j ? T = S === "x" ? $ : fe : T = S === "x" ? fe : $;
  } else {
    const $ = [{ x: g.x, y: x.y }], fe = [{ x: x.x, y: g.y }];
    if (S === "x" ? T = p.x === j ? fe : $ : T = p.y === j ? $ : fe, s === u) {
      const he = Math.abs(a[S] - r[S]);
      if (he <= d) {
        const Ne = Math.min(d - 1, d - he);
        p[S] === j ? V[S] = (g[S] > a[S] ? -1 : 1) * Ne : J[S] = (x[S] > r[S] ? -1 : 1) * Ne;
      }
    }
    if (s !== u) {
      const he = S === "x" ? "y" : "x", Ne = p[S] === y[he], z = g[he] > x[he], G = g[he] < x[he];
      (p[S] === 1 && (!Ne && z || Ne && G) || p[S] !== 1 && (!Ne && G || Ne && z)) && (T = S === "x" ? $ : fe);
    }
    const we = { x: g.x + V.x, y: g.y + V.y }, me = { x: x.x + J.x, y: x.y + J.y }, P = Math.max(Math.abs(we.x - T[0].x), Math.abs(me.x - T[0].x)), Le = Math.max(Math.abs(we.y - T[0].y), Math.abs(me.y - T[0].y));
    P >= Le ? (D = (we.x + me.x) / 2, U = T[0].y) : (D = T[0].x, U = (we.y + me.y) / 2);
  }
  const se = { x: g.x + V.x, y: g.y + V.y }, Z = { x: x.x + J.x, y: x.y + J.y };
  return [[
    a,
    // we only want to add the gapped source/target if they are different from the first/last point to avoid duplicates which can cause issues with the bends
    ...se.x !== T[0].x || se.y !== T[0].y ? [se] : [],
    ...T,
    ...Z.x !== T[T.length - 1].x || Z.y !== T[T.length - 1].y ? [Z] : [],
    r
  ], D, U, L, I];
}
function Q2(a, s, r, u) {
  const f = Math.min(K0(a, s) / 2, K0(s, r) / 2, u), { x: d, y: m } = s;
  if (a.x === d && d === r.x || a.y === m && m === r.y)
    return `L${d} ${m}`;
  if (a.y === m) {
    const g = a.x < r.x ? -1 : 1, x = a.y < r.y ? 1 : -1;
    return `L ${d + f * g},${m}Q ${d},${m} ${d},${m + f * x}`;
  }
  const p = a.x < r.x ? 1 : -1, y = a.y < r.y ? -1 : 1;
  return `L ${d},${m + f * y}Q ${d},${m} ${d + f * p},${m}`;
}
function Z2({ sourceX: a, sourceY: s, sourcePosition: r = $e.Bottom, targetX: u, targetY: f, targetPosition: d = $e.Top, borderRadius: m = 5, centerX: p, centerY: y, offset: g = 20, stepPosition: x = 0.5 }) {
  const [_, S, j, T, D] = V2({
    source: { x: a, y: s },
    sourcePosition: r,
    target: { x: u, y: f },
    targetPosition: d,
    center: { x: p, y },
    offset: g,
    stepPosition: x
  });
  let U = `M${_[0].x} ${_[0].y}`;
  for (let V = 1; V < _.length - 1; V++)
    U += Q2(_[V - 1], _[V], _[V + 1], m);
  return U += `L${_[_.length - 1].x} ${_[_.length - 1].y}`, [U, S, j, T, D];
}
var J0;
(function(a) {
  a.Line = "line", a.Handle = "handle";
})(J0 || (J0 = {}));
const Xr = [
  { id: "solar", label: "Solar", Icon: Fr, powerEntity: "sensor.total_mppt_pv_power", currentEntity: "sensor.total_mppt_output_current", color: "#ca8a04" },
  { id: "shore", label: "Shore Power", Icon: $v, powerEntity: "sensor.shore_power_charger_power_24v", currentEntity: "sensor.a32_pro_s5140_channel_16_current_24v_shore_power_charger", color: "#16a34a" },
  { id: "alt", label: "Alt. Charger", Icon: pp, powerEntity: "sensor.alternator_charger_power_24v", currentEntity: "sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger", color: "#2563eb" }
], Vr = [
  { id: "12v", label: "12V Devices", Icon: ii, powerEntity: "sensor.all_12v_devices_power_24v", currentEntity: "sensor.a32_pro_s5140_channel_6_current_24v_12v_devices", color: "#4f46e5" },
  { id: "ac", label: "A/C", Icon: ex, powerEntity: "sensor.air_conditioning_power_24v", currentEntity: "sensor.a32_pro_s5140_channel_4_current_24v_air_conditioning", color: "#0891b2" },
  { id: "24v", label: "24V Devices", Icon: Bv, powerEntity: "sensor.all_24v_devices_power_24v", currentEntity: "sensor.a32_pro_s5140_channel_5_current_24v_24v_devices", color: "#2563eb" },
  { id: "inverter", label: "Inverter", Icon: ri, powerEntity: "sensor.inverter_power_24v", currentEntity: "sensor.a32_pro_s5140_channel_7_current_24v_inverter", color: "#ea580c" }
], Qr = 120, Fl = 56, en = 90, Cr = 100, Fs = 72, oi = 260, Ja = 175, lg = oi, ag = 340, sg = 10, ig = 450, Ao = 580, zo = 420, Zr = 3;
function rg(a, s, r, u) {
  const f = (a - 1) * r, d = s - f / 2;
  return Array.from({ length: a }, (m, p) => d + p * r - u / 2);
}
const cg = rg(Xr.length, Ja, 75, Fl), ug = rg(Vr.length, Ja, 68, Fl);
function uf(a, s, r, u, f, d) {
  const [m] = Z2({
    sourceX: a,
    sourceY: s,
    sourcePosition: r,
    targetX: u,
    targetY: f,
    targetPosition: d,
    borderRadius: 16
  });
  return m;
}
const fi = [];
Xr.forEach((a, s) => {
  const r = sg + Qr, u = cg[s] + Fl / 2, f = oi - en / 2, d = Ja - en / 2, m = f, p = d + en * (0.25 + s * 0.25);
  fi.push({
    id: `${a.id}-hub`,
    path: uf(r, u, $e.Right, m, p, $e.Left),
    defaultColor: a.color
  });
});
Vr.forEach((a, s) => {
  const r = oi + en / 2, u = Ja - en / 2, f = r, d = u + en * (0.13 + s * 0.25), m = ig, p = ug[s] + Fl / 2;
  fi.push({
    id: `hub-${a.id}`,
    path: uf(f, d, $e.Right, m, p, $e.Left),
    defaultColor: a.color
  });
});
fi.push({
  id: "batt-edge",
  path: uf(oi, Ja + en / 2, $e.Bottom, lg, ag - Fs / 2, $e.Top),
  defaultColor: "#334155"
});
const $0 = /* @__PURE__ */ new Map(), Dr = /* @__PURE__ */ new Map();
function K2(a) {
  let s = $0.get(a);
  return s || (s = { phases: Array.from({ length: Zr }, (r, u) => u / Zr), lastTime: 0 }, $0.set(a, s)), s;
}
function J2(a) {
  return Dr.get(a) ?? { color: "#888", active: !1, speed: 3, dotCount: 0, reverse: !1, strokeWidth: 1 };
}
function Oo(a, s) {
  return 4 - Math.min(a / (s === "amps" ? 20 : 500), 1) * 3;
}
function Ro(a, s) {
  const r = Math.min(a / (s === "amps" ? 15 : 400), 1);
  return r > 0.5 ? 3 : r > 0.15 ? 2 : 1;
}
let Qo = 0, Zo = !1;
const og = /* @__PURE__ */ new Map(), fg = /* @__PURE__ */ new Map();
function $2() {
  if (Zo) return;
  Zo = !0;
  function a(s) {
    for (const r of fi) {
      const { id: u } = r, f = K2(u), d = J2(u), m = f.lastTime === 0 ? 0 : Math.min((s - f.lastTime) / 1e3, 0.1);
      f.lastTime = s;
      const p = og.get(u);
      p && (p.setAttribute("stroke", d.color), p.setAttribute("stroke-width", String(d.strokeWidth)), p.setAttribute("opacity", d.active ? "0.25" : "0.06"));
      const y = fg.get(u);
      if (!y || !p) continue;
      const g = p.getTotalLength(), x = d.speed > 0 ? m / d.speed : 0;
      for (let _ = 0; _ < Zr; _++) {
        const S = y[_];
        if (!S) continue;
        if (!d.active || _ >= d.dotCount) {
          S.setAttribute("opacity", "0");
          continue;
        }
        f.phases[_] = d.reverse ? ((f.phases[_] - x) % 1 + 1) % 1 : (f.phases[_] + x) % 1;
        const j = p.getPointAtLength(f.phases[_] * g);
        S.setAttribute("cx", String(j.x)), S.setAttribute("cy", String(j.y)), S.setAttribute("fill", d.color), S.setAttribute("opacity", "0.8");
      }
    }
    Qo = requestAnimationFrame(a);
  }
  Qo = requestAnimationFrame(a);
}
function W2() {
  Zo = !1, cancelAnimationFrame(Qo);
}
function W0({ def: a, val: s, unit: r, active: u, onClick: f }) {
  const d = a.Icon;
  return /* @__PURE__ */ o.jsx(
    "div",
    {
      style: { width: Qr, height: Fl, cursor: "pointer" },
      onClick: f,
      children: /* @__PURE__ */ o.jsxs("div", { style: {
        height: "100%",
        borderRadius: 12,
        border: `1px solid ${u ? `${a.color}60` : "hsl(var(--border))"}`,
        padding: "6px 12px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        opacity: u ? 1 : 0.5,
        boxShadow: u ? `0 0 8px ${a.color}15` : "none",
        transition: "all 0.3s"
      }, children: [
        /* @__PURE__ */ o.jsx(d, { size: 16, style: { flexShrink: 0, color: u ? a.color : "hsl(var(--muted-foreground))" } }),
        /* @__PURE__ */ o.jsxs("div", { style: { display: "flex", flexDirection: "column", minWidth: 0 }, children: [
          /* @__PURE__ */ o.jsx("span", { style: {
            fontSize: 10,
            color: "hsl(var(--muted-foreground))",
            lineHeight: 1.2,
            opacity: u ? 0.8 : 0.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }, children: a.label }),
          /* @__PURE__ */ o.jsxs("span", { style: {
            fontSize: 14,
            fontWeight: 600,
            lineHeight: 1.2,
            fontVariantNumeric: "tabular-nums",
            color: u ? a.color : "hsl(var(--muted-foreground))"
          }, children: [
            s,
            " ",
            r
          ] })
        ] })
      ] })
    }
  );
}
function F2() {
  const [a, s] = R.useState("amps"), { open: r } = zn(), u = a === "amps" ? "A" : "W", f = a === "amps" ? 0.05 : 2, d = a === "amps" ? 1 : 0, { value: m } = X("sensor.olins_van_bms_battery"), { value: p } = X("sensor.battery_charging"), { value: y } = X("sensor.battery_discharging"), { value: g } = X("sensor.olins_van_bms_current"), { value: x } = X("sensor.total_mppt_pv_power"), { value: _ } = X("sensor.shore_power_charger_power_24v"), { value: S } = X("sensor.alternator_charger_power_24v"), { value: j } = X("sensor.total_mppt_output_current"), { value: T } = X("sensor.a32_pro_s5140_channel_16_current_24v_shore_power_charger"), { value: D } = X("sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger"), { value: U } = X("sensor.all_12v_devices_power_24v"), { value: V } = X("sensor.air_conditioning_power_24v"), { value: J } = X("sensor.all_24v_devices_power_24v"), { value: L } = X("sensor.inverter_power_24v"), { value: I } = X("sensor.a32_pro_s5140_channel_6_current_24v_12v_devices"), { value: se } = X("sensor.a32_pro_s5140_channel_4_current_24v_air_conditioning"), { value: Z } = X("sensor.a32_pro_s5140_channel_5_current_24v_24v_devices"), { value: F } = X("sensor.a32_pro_s5140_channel_7_current_24v_inverter"), $ = a === "amps" ? { solar: Math.abs(j ?? 0), shore: Math.abs(T ?? 0), alt: Math.abs(D ?? 0) } : { solar: Math.abs(x ?? 0), shore: Math.abs(_ ?? 0), alt: Math.abs(S ?? 0) }, fe = a === "amps" ? { "12v": Math.abs(I ?? 0), ac: Math.abs(se ?? 0), "24v": Math.abs(Z ?? 0), inverter: Math.abs(F ?? 0) } : { "12v": Math.abs(U ?? 0), ac: Math.abs(V ?? 0), "24v": Math.abs(J ?? 0), inverter: Math.abs(L ?? 0) };
  let we, me;
  if (a === "amps") {
    const b = g ?? 0;
    we = b > 0 ? b : 0, me = b < 0 ? Math.abs(b) : 0;
  } else
    we = p ?? 0, me = y ?? 0;
  const P = Object.values(fe).reduce((b, k) => b + k, 0), Le = m ?? 0, he = Le >= 65 ? "#16a34a" : Le >= 30 ? "#d97706" : "#dc2626", Ne = a === "amps" ? 15 : 300, z = 4.5;
  Xr.forEach((b) => {
    const k = $[b.id], Y = k > f;
    Dr.set(`${b.id}-hub`, {
      color: b.color,
      active: Y,
      speed: Oo(k, a),
      dotCount: Ro(k, a),
      reverse: !1,
      strokeWidth: Y ? Math.min(1.5 + k / Ne * z, z) : 1
    });
  }), Vr.forEach((b) => {
    const k = fe[b.id], Y = k > f;
    Dr.set(`hub-${b.id}`, {
      color: b.color,
      active: Y,
      speed: Oo(k, a),
      dotCount: Ro(k, a),
      reverse: !1,
      strokeWidth: Y ? Math.min(1.5 + k / Ne * z, z) : 1
    });
  });
  const G = Math.max(we, me), ee = we > f || me > f;
  Dr.set("batt-edge", {
    color: we > f ? "#16a34a" : me > f ? "#ea580c" : "hsl(var(--border))",
    active: ee,
    speed: Oo(G, a),
    dotCount: ee ? Ro(G, a) : 0,
    reverse: me > f,
    strokeWidth: ee ? Math.min(1.5 + G / Ne * z, z) : 1
  });
  const ye = R.useRef(null), Se = R.useRef(!1);
  return R.useEffect(() => {
    const b = ye.current;
    if (!(!b || Se.current)) {
      Se.current = !0;
      for (const k of fi) {
        const Y = document.createElementNS("http://www.w3.org/2000/svg", "path");
        Y.setAttribute("d", k.path), Y.setAttribute("fill", "none"), Y.setAttribute("stroke", "#888"), Y.setAttribute("stroke-width", "1"), Y.setAttribute("stroke-linecap", "round"), Y.setAttribute("opacity", "0.07"), b.appendChild(Y), og.set(k.id, Y);
        const W = [];
        for (let de = 0; de < Zr; de++) {
          const Q = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          Q.setAttribute("r", "3.5"), Q.setAttribute("fill", "none"), Q.setAttribute("opacity", "0"), b.appendChild(Q), W.push(Q);
        }
        fg.set(k.id, W);
      }
      return $2(), () => W2();
    }
  }, []), /* @__PURE__ */ o.jsx(He, { children: /* @__PURE__ */ o.jsxs(Ue, { className: "pt-4 relative", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "absolute top-3 left-3 z-10 flex gap-1", children: [
      /* @__PURE__ */ o.jsx(
        "button",
        {
          onClick: () => s("amps"),
          className: ae(
            "text-[10px] px-2 py-0.5 rounded-md border transition-colors",
            a === "amps" ? "bg-blue-500/15 text-blue-400 border-blue-500/30" : "bg-card text-muted-foreground border-border hover:text-foreground"
          ),
          children: "Amps"
        }
      ),
      /* @__PURE__ */ o.jsx(
        "button",
        {
          onClick: () => s("power"),
          className: ae(
            "text-[10px] px-2 py-0.5 rounded-md border transition-colors",
            a === "power" ? "bg-blue-500/15 text-blue-400 border-blue-500/30" : "bg-card text-muted-foreground border-border hover:text-foreground"
          ),
          children: "Watts"
        }
      )
    ] }),
    /* @__PURE__ */ o.jsxs("div", { style: { position: "relative", width: "100%", aspectRatio: `${Ao}/${zo}`, margin: "0 auto" }, children: [
      /* @__PURE__ */ o.jsx(
        "svg",
        {
          ref: ye,
          viewBox: `0 0 ${Ao} ${zo}`,
          style: { position: "absolute", inset: 0, width: "100%", height: "100%" },
          preserveAspectRatio: "xMidYMid meet"
        }
      ),
      /* @__PURE__ */ o.jsx("div", { style: {
        position: "absolute",
        inset: 0
        /* Use SVG viewBox coordinates via scale transform */
      }, children: /* @__PURE__ */ o.jsxs("svg", { viewBox: `0 0 ${Ao} ${zo}`, style: { width: "100%", height: "100%" }, preserveAspectRatio: "xMidYMid meet", children: [
        Xr.map((b, k) => {
          const Y = $[b.id], W = a === "amps" ? b.currentEntity : b.powerEntity;
          return /* @__PURE__ */ o.jsx("foreignObject", { x: sg, y: cg[k], width: Qr, height: Fl, children: /* @__PURE__ */ o.jsx(
            W0,
            {
              def: b,
              val: K(Y, d),
              unit: u,
              active: Y > f,
              onClick: () => r(W, b.label, u)
            }
          ) }, b.id);
        }),
        /* @__PURE__ */ o.jsx("foreignObject", { x: oi - en / 2, y: Ja - en / 2, width: en, height: en, children: /* @__PURE__ */ o.jsxs("div", { style: {
          width: en,
          height: en,
          borderRadius: "50%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: `1.5px solid ${P > f ? "#ca8a0450" : "hsl(var(--border))"}`,
          boxShadow: P > f ? "0 0 10px #ca8a0415" : "none",
          transition: "border-color 0.3s, box-shadow 0.3s"
        }, children: [
          /* @__PURE__ */ o.jsx(xp, { size: 18, style: { color: P > f ? "#ca8a04" : "hsl(var(--muted-foreground))" } }),
          /* @__PURE__ */ o.jsxs("span", { style: { fontSize: 11, fontWeight: 600, fontVariantNumeric: "tabular-nums", marginTop: 2, color: "hsl(var(--foreground))" }, children: [
            K(P, d),
            " ",
            u
          ] })
        ] }) }),
        /* @__PURE__ */ o.jsx("foreignObject", { x: lg - Cr / 2, y: ag - Fs / 2, width: Cr, height: Fs, children: /* @__PURE__ */ o.jsx(
          "div",
          {
            style: { width: Cr, height: Fs, position: "relative", cursor: "pointer" },
            onClick: () => r("sensor.olins_van_bms_battery", "Battery SOC", "%"),
            children: /* @__PURE__ */ o.jsxs("div", { style: {
              width: Cr,
              height: Fs,
              borderRadius: "12px 12px 0 0",
              border: `1px solid ${he}50`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 8px ${he}15`,
              transition: "border-color 0.3s"
            }, children: [
              /* @__PURE__ */ o.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                /* @__PURE__ */ o.jsx(Ov, { size: 16, style: { color: he } }),
                /* @__PURE__ */ o.jsxs("span", { style: { fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: he }, children: [
                  K(Le, 0),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ o.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", marginTop: 2 }, children: [
                we > f && /* @__PURE__ */ o.jsxs("span", { style: { fontSize: 10, fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "#16a34a" }, children: [
                  "↓ ",
                  K(we, d),
                  " ",
                  u
                ] }),
                me > f && /* @__PURE__ */ o.jsxs("span", { style: { fontSize: 10, fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "#ea580c" }, children: [
                  "↑ ",
                  K(me, d),
                  " ",
                  u
                ] }),
                we <= f && me <= f && /* @__PURE__ */ o.jsx("span", { style: { fontSize: 10, color: "hsl(var(--muted-foreground))", opacity: 0.5 }, children: "Idle" })
              ] }),
              /* @__PURE__ */ o.jsx("div", { style: {
                position: "absolute",
                bottom: 0,
                left: 0,
                height: 3,
                borderRadius: "0 0 12px 12px",
                width: `${Le}%`,
                backgroundColor: he,
                boxShadow: `0 0 4px ${he}40`,
                transition: "all 0.5s"
              } })
            ] })
          }
        ) }),
        Vr.map((b, k) => {
          const Y = fe[b.id], W = a === "amps" ? b.currentEntity : b.powerEntity;
          return /* @__PURE__ */ o.jsx("foreignObject", { x: ig, y: ug[k], width: Qr, height: Fl, children: /* @__PURE__ */ o.jsx(
            W0,
            {
              def: b,
              val: K(Y, d),
              unit: u,
              active: Y > f,
              onClick: () => r(W, b.label, u)
            }
          ) }, b.id);
        })
      ] }) })
    ] })
  ] }) });
}
function I2() {
  const { value: a } = X("sensor.a32_pro_smart_battery_sense_12v_voltage"), { value: s } = X("sensor.a32_pro_smart_battery_sense_12v_temperature"), { value: r } = X("sensor.battery_charging"), { value: u } = X("sensor.battery_discharging");
  return /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(vp, { className: "h-4 w-4" }),
      "System Voltages"
    ] }) }),
    /* @__PURE__ */ o.jsxs(Ue, { className: "space-y-1", children: [
      /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.a32_pro_smart_battery_sense_12v_voltage", label: "12V Rail", value: K(a, 2), unit: "V", color: "#6366f1" }),
      /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.a32_pro_smart_battery_sense_12v_temperature", label: "12V Temp", value: K(s, 1), unit: "°C", color: "#3b82f6" }),
      /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.battery_charging", label: "Charging", value: K(r, 0), unit: "W", color: "#22c55e" }),
      /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.battery_discharging", label: "Discharging", value: K(u, 0), unit: "W", color: "#f97316" })
    ] })
  ] });
}
function P2() {
  return /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(ri, { className: "h-4 w-4" }),
      "Charging Controls"
    ] }) }),
    /* @__PURE__ */ o.jsx(Ue, { children: /* @__PURE__ */ o.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ o.jsx(
        ct,
        {
          entityId: "input_boolean.shore_power_charger_enabled",
          name: "Shore Charger",
          icon: bp,
          activeColor: "green"
        }
      ),
      /* @__PURE__ */ o.jsx(Ap, {})
    ] }) })
  ] });
}
function e5() {
  return /* @__PURE__ */ o.jsx(ea, { title: "Power & Energy", children: /* @__PURE__ */ o.jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsx(Np, {}),
      /* @__PURE__ */ o.jsx(I2, {})
    ] }),
    /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsx(Mp, {}),
      /* @__PURE__ */ o.jsx(P2, {})
    ] }),
    /* @__PURE__ */ o.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ o.jsx(F2, {}) })
  ] }) });
}
const En = 140, Cn = 140, Xa = 110, Ar = 12, Il = 135, Kr = 405, dg = Kr - Il;
function Is(a) {
  return a * Math.PI / 180;
}
function Ko(a) {
  const s = Is(a);
  return { x: En + Xa * Math.cos(s), y: Cn + Xa * Math.sin(s) };
}
function F0(a, s) {
  const r = Ko(a), u = Ko(s), d = s - a > 180 ? 1 : 0;
  return `M ${r.x} ${r.y} A ${Xa} ${Xa} 0 ${d} 1 ${u.x} ${u.y}`;
}
function I0(a, s, r) {
  const u = Math.max(0, Math.min(1, (a - s) / (r - s)));
  return Il + u * dg;
}
function P0(a, s, r, u) {
  const f = s + (a - Il) / dg * (r - s);
  return Math.round(Math.max(s, Math.min(r, f)) / u) * u;
}
function t5(a, s, r, u, f, d) {
  const m = R.useRef(!1), p = R.useCallback(
    (_, S) => {
      const j = a.current;
      if (!j) return null;
      const T = j.getBoundingClientRect(), D = 280 / T.width, U = 280 / T.height, V = (_ - T.left) * D, J = (S - T.top) * U;
      let L = Math.atan2(J - Cn, V - En) * 180 / Math.PI;
      return L < 0 && (L += 360), L < 90 && (L += 360), L < Il && (L = Il), L > Kr && (L = Kr), L;
    },
    [a]
  ), y = R.useCallback(
    (_, S) => {
      if (!m.current) return;
      const j = p(_, S);
      j !== null && f(P0(j, s, r, u));
    },
    [p, s, r, u, f]
  ), g = R.useCallback(() => {
    m.current && (m.current = !1, d());
  }, [d]);
  return R.useEffect(() => {
    const _ = (T) => y(T.clientX, T.clientY), S = (T) => {
      T.touches[0] && y(T.touches[0].clientX, T.touches[0].clientY);
    }, j = () => g();
    return window.addEventListener("mousemove", _), window.addEventListener("mouseup", j), window.addEventListener("touchmove", S, { passive: !0 }), window.addEventListener("touchend", j), window.addEventListener("touchcancel", j), () => {
      window.removeEventListener("mousemove", _), window.removeEventListener("mouseup", j), window.removeEventListener("touchmove", S), window.removeEventListener("touchend", j), window.removeEventListener("touchcancel", j);
    };
  }, [y, g]), { startDrag: R.useCallback(
    (_) => {
      _.preventDefault(), m.current = !0;
      const S = "touches" in _ ? _.touches[0].clientX : _.clientX, j = "touches" in _ ? _.touches[0].clientY : _.clientY, T = p(S, j);
      T !== null && f(P0(T, s, r, u));
    },
    [p, s, r, u, f]
  ) };
}
function n5() {
  var me, P, Le, he, Ne, z;
  const a = ue("climate.a32_pro_van_hydronic_heating_pid"), s = El(), [r, u] = R.useState(null), f = R.useRef(null), d = R.useRef(null), m = R.useCallback(
    (G) => {
      f.current && clearTimeout(f.current), f.current = setTimeout(() => {
        s("climate", "set_temperature", { temperature: G }, {
          entity_id: "climate.a32_pro_van_hydronic_heating_pid"
        });
      }, 400);
    },
    [s]
  ), p = ((me = a == null ? void 0 : a.attributes) == null ? void 0 : me.temperature) ?? 0, y = ((P = a == null ? void 0 : a.attributes) == null ? void 0 : P.current_temperature) ?? 0, g = ((Le = a == null ? void 0 : a.attributes) == null ? void 0 : Le.min_temp) ?? 5, x = ((he = a == null ? void 0 : a.attributes) == null ? void 0 : he.max_temp) ?? 35, _ = ((Ne = a == null ? void 0 : a.attributes) == null ? void 0 : Ne.target_temp_step) ?? 0.1, j = ((a == null ? void 0 : a.state) ?? "off") === "heat", D = ((z = a == null ? void 0 : a.attributes) == null ? void 0 : z.hvac_action) === "heating", U = r ?? p;
  R.useEffect(() => {
    u(null);
  }, [p]);
  const V = R.useCallback(
    (G) => {
      u(G), m(G);
    },
    [m]
  ), J = R.useCallback(() => {
  }, []), { startDrag: L } = t5(d, g, x, _, V, J), I = R.useCallback(() => {
    s("climate", "set_hvac_mode", {
      hvac_mode: j ? "off" : "heat"
    }, { entity_id: "climate.a32_pro_van_hydronic_heating_pid" });
  }, [s, j]), se = R.useCallback(
    (G) => {
      const ee = Math.round(Math.max(g, Math.min(x, U + G)) / _) * _;
      u(ee), m(ee);
    },
    [U, g, x, _, m]
  );
  if (!a) return null;
  const Z = I0(U, g, x), F = I0(y, g, x), $ = Ko(Z), fe = j ? D ? "#f97316" : "#f59e0b" : "hsl(var(--muted))", we = j ? "#f97316" : "hsl(var(--muted-foreground))";
  return /* @__PURE__ */ o.jsx(He, { children: /* @__PURE__ */ o.jsxs(Ue, { className: "pt-4 pb-4 px-2 flex flex-col items-center", children: [
    /* @__PURE__ */ o.jsx("div", { className: "w-full flex justify-end pr-2 -mt-1 mb-0", children: /* @__PURE__ */ o.jsx("button", { className: "text-muted-foreground hover:text-foreground p-1", children: /* @__PURE__ */ o.jsxs("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "currentColor", children: [
      /* @__PURE__ */ o.jsx("circle", { cx: "8", cy: "3", r: "1.5" }),
      /* @__PURE__ */ o.jsx("circle", { cx: "8", cy: "8", r: "1.5" }),
      /* @__PURE__ */ o.jsx("circle", { cx: "8", cy: "13", r: "1.5" })
    ] }) }) }),
    /* @__PURE__ */ o.jsxs(
      "svg",
      {
        ref: d,
        viewBox: "0 0 280 260",
        className: "w-full max-w-[280px] select-none touch-none",
        style: { marginTop: -8, marginBottom: -12 },
        children: [
          /* @__PURE__ */ o.jsx(
            "path",
            {
              d: F0(Il, Kr),
              fill: "none",
              stroke: "hsl(var(--muted))",
              strokeWidth: Ar,
              strokeLinecap: "round"
            }
          ),
          j && /* @__PURE__ */ o.jsx(
            "path",
            {
              d: F0(Il, Z),
              fill: "none",
              stroke: fe,
              strokeWidth: Ar,
              strokeLinecap: "round",
              className: "transition-all duration-150"
            }
          ),
          (() => {
            const G = Xa + Ar / 2 + 4, ee = Xa - Ar / 2 - 4, ye = {
              x: En + G * Math.cos(Is(F)),
              y: Cn + G * Math.sin(Is(F))
            }, Se = {
              x: En + ee * Math.cos(Is(F)),
              y: Cn + ee * Math.sin(Is(F))
            };
            return /* @__PURE__ */ o.jsx(
              "line",
              {
                x1: Se.x,
                y1: Se.y,
                x2: ye.x,
                y2: ye.y,
                stroke: "hsl(var(--foreground))",
                strokeWidth: 2,
                strokeLinecap: "round",
                opacity: 0.5
              }
            );
          })(),
          /* @__PURE__ */ o.jsx(
            "circle",
            {
              cx: $.x,
              cy: $.y,
              r: j ? 12 : 10,
              fill: we,
              stroke: "white",
              strokeWidth: 2,
              className: ae("cursor-grab active:cursor-grabbing", !j && "opacity-50"),
              onMouseDown: j ? L : void 0,
              onTouchStart: j ? L : void 0
            }
          ),
          /* @__PURE__ */ o.jsx(
            "text",
            {
              x: En,
              y: Cn - 6,
              textAnchor: "middle",
              dominantBaseline: "central",
              className: "fill-foreground",
              fontSize: 42,
              fontWeight: 300,
              children: y.toFixed(1)
            }
          ),
          /* @__PURE__ */ o.jsx(
            "text",
            {
              x: En + 42,
              y: Cn - 20,
              textAnchor: "start",
              dominantBaseline: "central",
              className: "fill-muted-foreground",
              fontSize: 16,
              children: "°C"
            }
          ),
          j && /* @__PURE__ */ o.jsxs("g", { children: [
            /* @__PURE__ */ o.jsx(
              "line",
              {
                x1: En - 30,
                y1: Cn + 24,
                x2: En + 30,
                y2: Cn + 24,
                stroke: "hsl(var(--border))",
                strokeWidth: 1
              }
            ),
            /* @__PURE__ */ o.jsxs(
              "text",
              {
                x: En - 4,
                y: Cn + 44,
                textAnchor: "middle",
                dominantBaseline: "central",
                className: "fill-muted-foreground",
                fontSize: 16,
                children: [
                  U.toFixed(1),
                  "°C"
                ]
              }
            ),
            /* @__PURE__ */ o.jsx(
              "text",
              {
                x: En + 32,
                y: Cn + 44,
                textAnchor: "start",
                dominantBaseline: "central",
                fontSize: 14,
                className: D ? "fill-orange-500" : "fill-muted-foreground",
                children: "≋"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-6 mt-1 mb-3", children: [
      /* @__PURE__ */ o.jsx(
        "button",
        {
          onClick: I,
          className: ae(
            "p-2.5 rounded-full border-2 transition-all",
            j ? "border-orange-500 bg-orange-500/10 text-orange-500" : "border-border bg-card text-muted-foreground hover:text-foreground"
          ),
          children: /* @__PURE__ */ o.jsx(wp, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ o.jsx(
        "button",
        {
          className: ae(
            "p-2.5 rounded-full border-2 transition-all",
            D ? "border-orange-500 bg-orange-500/10 text-orange-500" : "border-border bg-card text-muted-foreground"
          ),
          disabled: !0,
          children: /* @__PURE__ */ o.jsx(si, { className: "h-5 w-5" })
        }
      )
    ] }),
    /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-8", children: [
      /* @__PURE__ */ o.jsx(
        "button",
        {
          onClick: () => se(-0.1),
          disabled: !j,
          className: ae(
            "p-3 rounded-full border-2 transition-all",
            j ? "border-border bg-card text-foreground hover:bg-accent active:scale-95" : "border-border bg-card text-muted-foreground opacity-50"
          ),
          children: /* @__PURE__ */ o.jsx(Zv, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ o.jsx(
        "button",
        {
          onClick: () => se(0.1),
          disabled: !j,
          className: ae(
            "p-3 rounded-full border-2 transition-all",
            j ? "border-border bg-card text-foreground hover:bg-accent active:scale-95" : "border-border bg-card text-muted-foreground opacity-50"
          ),
          children: /* @__PURE__ */ o.jsx(Wv, { className: "h-5 w-5" })
        }
      )
    ] })
  ] }) });
}
const l5 = [
  {
    name: "Living Area",
    temp: "sensor.a32_pro_bme280_1_temperature",
    humidity: "sensor.a32_pro_bme280_1_relative_humidity"
  },
  {
    name: "Cab",
    temp: "sensor.a32_pro_bme280_2_temperature",
    humidity: "sensor.a32_pro_bme280_2_relative_humidity"
  },
  {
    name: "Shower",
    temp: "sensor.a32_pro_bme280_3_temperature",
    humidity: "sensor.a32_pro_bme280_3_relative_humidity"
  },
  {
    name: "Outdoor",
    temp: "sensor.a32_pro_bme280_4_temperature",
    humidity: "sensor.a32_pro_bme280_4_relative_humidity"
  }
];
function a5() {
  var y, g;
  const { value: a } = X("sensor.battery_heater_power_12v"), { value: s } = X("sensor.a32_pro_s5140_channel_36_temperature_battery_bottom_aluminum_plate"), r = ue("switch.a32_pro_battery_heater_enable"), u = yt("switch.a32_pro_battery_heater_enable"), f = ue("climate.a32_pro_battery_heater_thermostat"), d = (y = f == null ? void 0 : f.attributes) == null ? void 0 : y.temperature, m = (g = f == null ? void 0 : f.attributes) == null ? void 0 : g.current_temperature, p = f == null ? void 0 : f.state;
  return /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(Io, { className: "h-4 w-4" }),
      "Battery Heater",
      /* @__PURE__ */ o.jsxs("div", { className: "ml-auto flex items-center gap-1.5", children: [
        /* @__PURE__ */ o.jsx("span", { className: "text-[10px] text-muted-foreground", children: p === "heat" ? "Heating" : "Off" }),
        /* @__PURE__ */ o.jsx(Gt, { checked: (r == null ? void 0 : r.state) === "on", onCheckedChange: u })
      ] })
    ] }) }),
    /* @__PURE__ */ o.jsxs(Ue, { className: "space-y-1", children: [
      /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.a32_pro_s5140_channel_36_temperature_battery_bottom_aluminum_plate", label: "Battery Plate", value: K(s, 1), unit: "°C", color: "#3b82f6" }),
      m != null && /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
        /* @__PURE__ */ o.jsx("span", { className: "text-muted-foreground", children: "Thermostat" }),
        /* @__PURE__ */ o.jsxs("span", { className: "tabular-nums", children: [
          K(m, 1),
          "°C → ",
          K(d, 0),
          "°C"
        ] })
      ] }),
      /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.battery_heater_power_12v", label: "Power", value: K(a, 0), unit: "W", color: "#ef4444" })
    ] })
  ] });
}
function s5() {
  const a = ue("switch.a32_pro_coolant_blower_mode_auto_manual"), s = yt("switch.a32_pro_coolant_blower_mode_auto_manual"), r = (a == null ? void 0 : a.state) === "on";
  return /* @__PURE__ */ o.jsx(He, { children: /* @__PURE__ */ o.jsx(Ue, { className: "pt-4", children: /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ o.jsxs("span", { className: "text-sm flex items-center gap-1.5", children: [
      /* @__PURE__ */ o.jsx(tx, { className: "h-3.5 w-3.5" }),
      "Blower Fan Mode"
    ] }),
    /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ o.jsx("span", { className: "text-xs text-muted-foreground", children: r ? "Auto (PID)" : "Manual" }),
      /* @__PURE__ */ o.jsx(Gt, { checked: r, onCheckedChange: s })
    ] })
  ] }) }) });
}
function i5() {
  return /* @__PURE__ */ o.jsx(ea, { title: "Climate & Heating", children: /* @__PURE__ */ o.jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsx(n5, {}),
      /* @__PURE__ */ o.jsx(Ep, {})
    ] }),
    /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsx("h2", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider", children: "Temperature Zones" }),
      /* @__PURE__ */ o.jsx("div", { className: "grid grid-cols-2 gap-3", children: l5.map((a) => /* @__PURE__ */ o.jsx(
        Uo,
        {
          name: a.name,
          tempEntity: a.temp,
          humidityEntity: a.humidity
        },
        a.name
      )) }),
      /* @__PURE__ */ o.jsx(a5, {})
    ] }),
    /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsx(Cp, {}),
      /* @__PURE__ */ o.jsx(s5, {})
    ] })
  ] }) });
}
const r5 = [
  { entityId: "switch.a32_pro_switch01_water_system_valve_1", name: "Valve 1" },
  { entityId: "switch.a32_pro_switch02_water_system_valve_2", name: "Valve 2" },
  { entityId: "switch.a32_pro_switch03_water_system_valve_3", name: "Valve 3" },
  { entityId: "switch.a32_pro_switch06_grey_water_tank_valve", name: "Grey Dump Valve" }
], c5 = [
  { entityId: "switch.a32_pro_switch30_main_system_water_pump", name: "Main Pump" },
  { entityId: "switch.a32_pro_switch29_shower_system_water_pump", name: "Shower Pump" },
  { entityId: "switch.a32_pro_switch14_uv_filter", name: "UV Filter" }
];
function ep({ entityId: a, name: s, onLabel: r = "Open", offLabel: u = "Closed" }) {
  const f = ue(a), d = (f == null ? void 0 : f.state) === "on";
  return /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between py-0.5", children: [
    /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: s }),
    /* @__PURE__ */ o.jsx(
      "span",
      {
        className: ae(
          "text-xs font-medium px-2 py-0.5 rounded-full",
          d ? "bg-green-500/15 text-green-500" : "bg-muted text-muted-foreground"
        ),
        children: d ? r : u
      }
    )
  ] });
}
function u5() {
  return /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(gp, { className: "h-4 w-4" }),
      "Valves & Pumps"
    ] }) }),
    /* @__PURE__ */ o.jsxs(Ue, { className: "space-y-1", children: [
      r5.map((a) => /* @__PURE__ */ o.jsx(ep, { entityId: a.entityId, name: a.name }, a.entityId)),
      /* @__PURE__ */ o.jsx("div", { className: "border-t my-1.5" }),
      c5.map((a) => /* @__PURE__ */ o.jsx(ep, { entityId: a.entityId, name: a.name, onLabel: "Running", offLabel: "Off" }, a.entityId))
    ] })
  ] });
}
function o5() {
  const a = ue("switch.a32_pro_water_system_master_switch"), s = ue("switch.a32_pro_water_system_state_main"), r = ue("switch.a32_pro_water_system_state_recirculating_shower"), u = ue("switch.a32_pro_water_system_state_recirculating_shower_flush"), f = yt("switch.a32_pro_water_system_master_switch"), d = yt("switch.a32_pro_water_system_state_main"), m = yt("switch.a32_pro_water_system_state_recirculating_shower"), p = yt("switch.a32_pro_water_system_state_recirculating_shower_flush");
  return /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(sx, { className: "h-4 w-4" }),
      "Water Controls"
    ] }) }),
    /* @__PURE__ */ o.jsxs(Ue, { className: "space-y-3", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsx("span", { className: "text-sm font-medium", children: "Master Switch" }),
        /* @__PURE__ */ o.jsx(Gt, { checked: (a == null ? void 0 : a.state) === "on", onCheckedChange: f })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "Main Mode" }),
        /* @__PURE__ */ o.jsx(Gt, { checked: (s == null ? void 0 : s.state) === "on", onCheckedChange: d })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsxs("span", { className: "text-sm flex items-center gap-1.5", children: [
          /* @__PURE__ */ o.jsx(Wr, { className: "h-3.5 w-3.5" }),
          "Recirc Shower"
        ] }),
        /* @__PURE__ */ o.jsx(Gt, { checked: (r == null ? void 0 : r.state) === "on", onCheckedChange: m })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "Recirc Flush" }),
        /* @__PURE__ */ o.jsx(Gt, { checked: (u == null ? void 0 : u.state) === "on", onCheckedChange: p })
      ] })
    ] })
  ] });
}
function f5() {
  const { value: a } = X("sensor.propane_tank_percentage"), { value: s } = X("sensor.propane_liquid_volume"), { value: r } = X("sensor.propane_liquid_depth"), { value: u } = X("sensor.propane_raw_distance"), f = ue("switch.a32_pro_switch16_lpg_valve"), d = yt("switch.a32_pro_switch16_lpg_valve"), m = a ?? 0, p = m < 15 ? "bg-red-500" : m < 30 ? "bg-orange-500" : "bg-green-500";
  return /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(si, { className: "h-4 w-4" }),
      "Propane",
      /* @__PURE__ */ o.jsxs(
        "span",
        {
          className: ae(
            "ml-auto text-2xl font-bold tabular-nums",
            m < 15 ? "text-red-500" : m < 30 ? "text-orange-500" : "text-green-500"
          ),
          children: [
            K(a, 0),
            "%"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ o.jsxs(Ue, { className: "space-y-3", children: [
      /* @__PURE__ */ o.jsx("div", { className: "h-3 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ o.jsx(
        "div",
        {
          className: ae("h-full rounded-full transition-all duration-500", p),
          style: { width: `${Math.min(100, Math.max(0, m))}%` }
        }
      ) }),
      /* @__PURE__ */ o.jsxs("div", { className: "grid gap-1", children: [
        /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.propane_liquid_volume", label: "Volume", value: K(s, 1), unit: "L", color: "#22c55e" }),
        /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.propane_liquid_depth", label: "Liquid Depth", value: K(r, 0), unit: "mm", color: "#3b82f6" }),
        /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.propane_raw_distance", label: "Raw Distance", value: K(u, 0), unit: "mm", color: "#64748b" })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between pt-2 border-t", children: [
        /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "LPG Valve" }),
        /* @__PURE__ */ o.jsx(Gt, { checked: (f == null ? void 0 : f.state) === "on", onCheckedChange: d })
      ] })
    ] })
  ] });
}
function d5() {
  const { value: a } = X("sensor.a32_pro_s5140_channel_38_temperature_fresh_water_tank"), { value: s } = X("sensor.a32_pro_s5140_channel_39_temperature_grey_water_tank"), { value: r } = X("sensor.a32_pro_s5140_channel_40_temperature_shower_water_tank"), u = ue("switch.a32_pro_fresh_water_tank_heater_enable"), f = ue("switch.a32_pro_grey_water_tank_heater_enable"), d = ue("switch.a32_pro_shower_water_tank_heater_enable"), m = yt("switch.a32_pro_fresh_water_tank_heater_enable"), p = yt("switch.a32_pro_grey_water_tank_heater_enable"), y = yt("switch.a32_pro_shower_water_tank_heater_enable"), g = [
    { name: "Fresh", temp: a, entityId: "sensor.a32_pro_s5140_channel_38_temperature_fresh_water_tank", heater: u, toggleHeater: m },
    { name: "Grey", temp: s, entityId: "sensor.a32_pro_s5140_channel_39_temperature_grey_water_tank", heater: f, toggleHeater: p },
    { name: "Shower", temp: r, entityId: "sensor.a32_pro_s5140_channel_40_temperature_shower_water_tank", heater: d, toggleHeater: y }
  ];
  return /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(Ir, { className: "h-4 w-4" }),
      "Tank Temperatures"
    ] }) }),
    /* @__PURE__ */ o.jsx(Ue, { className: "space-y-2", children: g.map((x) => {
      var _;
      return /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsx(
          ge,
          {
            entityId: x.entityId,
            label: x.name,
            value: K(x.temp, 1),
            unit: "°C",
            color: x.temp != null && x.temp < 3 ? "#ef4444" : "#3b82f6",
            className: "flex-1"
          }
        ),
        /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-1.5 ml-2 shrink-0", children: [
          /* @__PURE__ */ o.jsx("span", { className: "text-[10px] text-muted-foreground", children: "Heat" }),
          /* @__PURE__ */ o.jsx(
            Gt,
            {
              checked: ((_ = x.heater) == null ? void 0 : _.state) === "on",
              onCheckedChange: x.toggleHeater
            }
          )
        ] })
      ] }, x.name);
    }) })
  ] });
}
function h5() {
  return /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsx(st, { className: "text-base", children: "Quick Modes" }) }),
    /* @__PURE__ */ o.jsx(Ue, { children: /* @__PURE__ */ o.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ o.jsx(
        ct,
        {
          entityId: "input_boolean.shower_mode",
          name: "Shower",
          icon: Wr,
          activeColor: "cyan"
        }
      ),
      /* @__PURE__ */ o.jsx(
        ct,
        {
          entityId: "switch.a32_pro_switch06_grey_water_tank_valve",
          name: "Grey Dump",
          icon: Pr,
          activeColor: "orange"
        }
      )
    ] }) })
  ] });
}
function m5() {
  return /* @__PURE__ */ o.jsx(ea, { title: "Water & Propane", children: /* @__PURE__ */ o.jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsx(
        Hr,
        {
          name: "Fresh Water",
          entityId: "sensor.a32_pro_fresh_water_tank_level",
          icon: /* @__PURE__ */ o.jsx(Ka, { className: "h-4 w-4 text-blue-500" })
        }
      ),
      /* @__PURE__ */ o.jsx(
        Hr,
        {
          name: "Grey Water",
          entityId: "sensor.a32_pro_grey_water_tank_level",
          invertWarning: !0,
          icon: /* @__PURE__ */ o.jsx(Pr, { className: "h-4 w-4 text-orange-500" })
        }
      ),
      /* @__PURE__ */ o.jsx(d5, {}),
      /* @__PURE__ */ o.jsx(h5, {})
    ] }),
    /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsx(o5, {}),
      /* @__PURE__ */ o.jsx(u5, {})
    ] }),
    /* @__PURE__ */ o.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ o.jsx(f5, {}) })
  ] }) });
}
const p5 = Tp(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        success: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
        warning: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Jr({ className: a, variant: s, ...r }) {
  return /* @__PURE__ */ o.jsx("div", { className: ae(p5({ variant: s }), a), ...r });
}
function g5() {
  const { value: a } = X("sensor.192_168_10_90_0d_vehiclespeed"), { value: s } = X("sensor.192_168_10_90_0c_enginerpm"), r = ue("sensor.gear_display"), { value: u } = X("sensor.192_168_10_90_11_throttleposition"), { value: f } = X("sensor.192_168_10_90_04_calcengineload"), { value: d } = X("sensor.192_168_10_90_05_enginecoolanttemp"), { value: m } = X("sensor.192_168_10_90_42_controlmodulevolt"), p = ue("binary_sensor.vehicle_is_moving"), y = ue("binary_sensor.engine_is_running"), { data: g } = Pl("sensor.192_168_10_90_0d_vehiclespeed", 6), { open: x } = zn(), _ = (p == null ? void 0 : p.state) === "on", S = (y == null ? void 0 : y.state) === "on", j = (r == null ? void 0 : r.state) ?? "—";
  return /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(pp, { className: "h-4 w-4" }),
      "Engine",
      /* @__PURE__ */ o.jsxs("div", { className: "ml-auto flex gap-1.5", children: [
        S && /* @__PURE__ */ o.jsx(Jr, { variant: "default", className: "text-[10px] bg-green-500", children: "Running" }),
        _ && /* @__PURE__ */ o.jsx(Jr, { variant: "default", className: "text-[10px] bg-blue-500", children: "Moving" })
      ] })
    ] }) }),
    /* @__PURE__ */ o.jsxs(Ue, { className: "space-y-3", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "grid grid-cols-3 gap-3 text-center", children: [
        /* @__PURE__ */ o.jsxs("div", { className: "cursor-pointer hover:bg-muted/50 rounded-md p-1 transition-colors", onClick: () => x("sensor.192_168_10_90_0d_vehiclespeed", "Speed", "km/h"), children: [
          /* @__PURE__ */ o.jsx("p", { className: "text-3xl font-bold tabular-nums", children: K(a, 0) }),
          /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "km/h" })
        ] }),
        /* @__PURE__ */ o.jsxs("div", { className: "cursor-pointer hover:bg-muted/50 rounded-md p-1 transition-colors", onClick: () => x("sensor.192_168_10_90_0c_enginerpm", "RPM", "rpm"), children: [
          /* @__PURE__ */ o.jsx("p", { className: "text-3xl font-bold tabular-nums", children: K(s, 0) }),
          /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "RPM" })
        ] }),
        /* @__PURE__ */ o.jsxs("div", { children: [
          /* @__PURE__ */ o.jsx("p", { className: "text-3xl font-bold tabular-nums", children: j }),
          /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Gear" })
        ] })
      ] }),
      /* @__PURE__ */ o.jsx(Za, { data: g, color: "#3b82f6", width: 300, height: 32, className: "w-full", onClick: () => x("sensor.192_168_10_90_0d_vehiclespeed", "Speed", "km/h") }),
      /* @__PURE__ */ o.jsxs("div", { className: "grid gap-1", children: [
        /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.192_168_10_90_11_throttleposition", label: "Throttle", value: K(u, 0), unit: "%", color: "#f59e0b" }),
        /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.192_168_10_90_04_calcengineload", label: "Engine Load", value: K(f, 0), unit: "%", color: "#ef4444" }),
        /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.192_168_10_90_05_enginecoolanttemp", label: "Coolant Temp", value: K(d, 0), unit: "°C", color: "#ef4444" }),
        /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.192_168_10_90_42_controlmodulevolt", label: "ECU Voltage", value: K(m, 1), unit: "V", color: "#6366f1" })
      ] })
    ] })
  ] });
}
function y5() {
  const { value: a } = X("sensor.stable_fuel_level"), { value: s } = X("sensor.192_168_10_90_2f_fueltanklevel"), { value: r } = X("sensor.wican_fuel_5_min_mean"), { value: u } = X("sensor.fuel_consumption_l_100km"), { value: f } = X("sensor.fuel_consumption_l_h"), { data: d } = Pl("sensor.stable_fuel_level", 24), { open: m } = zn(), p = a != null ? a / 100 * 94.6 : null, y = a ?? 0, g = y < 15 ? "text-red-500" : y < 30 ? "text-orange-500" : "text-green-500";
  return /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(yp, { className: "h-4 w-4" }),
      "Fuel",
      /* @__PURE__ */ o.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
        /* @__PURE__ */ o.jsx(Za, { data: d, color: y < 15 ? "#ef4444" : y < 30 ? "#f97316" : "#22c55e", width: 56, height: 18, onClick: () => m("sensor.stable_fuel_level", "Fuel Level", "%") }),
        /* @__PURE__ */ o.jsxs("span", { className: ae("text-2xl font-bold tabular-nums", g), children: [
          K(a, 0),
          "%"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ o.jsxs(Ue, { className: "space-y-1", children: [
      /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.stable_fuel_level", label: "Estimated", value: K(p, 1), unit: "L", color: "#22c55e" }),
      /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.wican_fuel_5_min_mean", label: "5min Mean", value: K(r, 0), unit: "%", color: "#3b82f6" }),
      /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.192_168_10_90_2f_fueltanklevel", label: "Raw OBD", value: K(s, 0), unit: "%", color: "#64748b" }),
      (u ?? 0) > 0 && /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.fuel_consumption_l_100km", label: "Economy", value: K(u, 1), unit: "L/100km", color: "#8b5cf6" }),
      (f ?? 0) > 0 && /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.fuel_consumption_l_h", label: "Rate", value: K(f, 1), unit: "L/h", color: "#f59e0b" })
    ] })
  ] });
}
function v5() {
  const { value: a, entity: s } = X("sensor.192_168_10_90_tyre_p_fl"), { value: r, entity: u } = X("sensor.192_168_10_90_tyre_p_fr"), { value: f, entity: d } = X("sensor.192_168_10_90_tyre_p_rl"), { value: m, entity: p } = X("sensor.192_168_10_90_tyre_p_rr"), y = ue("binary_sensor.low_tire_pressure"), g = (y == null ? void 0 : y.state) === "on", x = (U, V) => {
    var L;
    return U == null ? null : ((L = V == null ? void 0 : V.attributes) == null ? void 0 : L.unit_of_measurement) === "kPa" ? U * 0.072519 : U;
  }, _ = x(a, s), S = x(r, u), j = x(f, d), T = x(m, p), D = (U) => (U ?? 0) < 50 ? "text-red-500" : (U ?? 0) < 55 ? "text-orange-500" : "text-green-500";
  return /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(gp, { className: "h-4 w-4" }),
      "Tire Pressure",
      g && /* @__PURE__ */ o.jsx(Jr, { variant: "destructive", className: "ml-auto text-[10px]", children: "LOW" })
    ] }) }),
    /* @__PURE__ */ o.jsx(Ue, { children: /* @__PURE__ */ o.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "rounded-lg bg-muted/50 p-3 text-center", children: [
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Front Left" }),
        /* @__PURE__ */ o.jsx("p", { className: ae("text-xl font-bold tabular-nums", D(_)), children: K(_, 0) }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "psi" })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "rounded-lg bg-muted/50 p-3 text-center", children: [
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Front Right" }),
        /* @__PURE__ */ o.jsx("p", { className: ae("text-xl font-bold tabular-nums", D(S)), children: K(S, 0) }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "psi" })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "rounded-lg bg-muted/50 p-3 text-center", children: [
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Rear Left" }),
        /* @__PURE__ */ o.jsx("p", { className: ae("text-xl font-bold tabular-nums", D(j)), children: K(j, 0) }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "psi" })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "rounded-lg bg-muted/50 p-3 text-center", children: [
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Rear Right" }),
        /* @__PURE__ */ o.jsx("p", { className: ae("text-xl font-bold tabular-nums", D(T)), children: K(T, 0) }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "psi" })
      ] })
    ] }) })
  ] });
}
function x5() {
  const { value: a } = X("sensor.road_grade_deg"), { value: s } = X("sensor.road_grade"), r = ue("sensor.hill_aggression");
  return /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(_p, { className: "h-4 w-4" }),
      "Road Grade"
    ] }) }),
    /* @__PURE__ */ o.jsxs(Ue, { className: "space-y-1", children: [
      /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.road_grade", label: "Grade", value: K(s, 1), unit: "%", color: "#22c55e" }),
      /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.road_grade_deg", label: "Degrees", value: K(a, 1), unit: "°", color: "#6366f1" }),
      /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.hill_aggression", label: "Terrain", value: (r == null ? void 0 : r.state) ?? "—", unit: "", color: "#64748b" })
    ] })
  ] });
}
function _5() {
  const { value: a } = X("sensor.192_168_10_90_oil_life"), { value: s } = X("sensor.192_168_10_90_tran_f_temp"), { value: r } = X("sensor.192_168_10_90_wastegate"), { value: u } = X("sensor.192_168_10_90_intake_air_tmp"), { value: f } = X("sensor.192_168_10_90_46_ambientairtemp"), { value: d } = X("sensor.192_168_10_90_fuel_pressure"), m = ue("binary_sensor.check_engine_light"), { value: p } = X("sensor.dtc_count"), y = (m == null ? void 0 : m.state) === "on";
  return /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(vp, { className: "h-4 w-4" }),
      "Diagnostics",
      y && /* @__PURE__ */ o.jsxs(Jr, { variant: "destructive", className: "ml-auto text-[10px] flex items-center gap-1", children: [
        /* @__PURE__ */ o.jsx(lx, { className: "h-3 w-3" }),
        "CEL (",
        p,
        " DTC)"
      ] })
    ] }) }),
    /* @__PURE__ */ o.jsxs(Ue, { className: "space-y-1", children: [
      /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.192_168_10_90_oil_life", label: "Oil Life", value: K(a, 0), unit: "%", color: "#22c55e" }),
      /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.192_168_10_90_wastegate", label: "Wastegate", value: K(r, 0), unit: "%", color: "#f59e0b" }),
      /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.192_168_10_90_intake_air_tmp", label: "Intake Air", value: K(u, 0), unit: "°C", color: "#06b6d4" }),
      /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.192_168_10_90_46_ambientairtemp", label: "Ambient Air", value: K(f, 0), unit: "°C", color: "#3b82f6" }),
      /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.192_168_10_90_fuel_pressure", label: "Fuel Pressure", value: K(d, 0), unit: "kPa", color: "#8b5cf6" })
    ] })
  ] });
}
function b5() {
  const { value: a } = X("sensor.192_168_10_90_0c_enginerpm"), { value: s } = X("sensor.192_168_10_90_42_controlmodulevolt"), { value: r } = X("sensor.192_168_10_90_05_enginecoolanttemp"), { value: u } = X("sensor.192_168_10_90_tran_f_temp"), { value: f } = X("sensor.road_grade"), d = ue("sensor.hill_aggression"), { open: m } = zn(), p = (r ?? 0) > 105 ? "text-red-500" : (r ?? 0) > 95 ? "text-orange-400" : "text-foreground", y = (u ?? 0) > 110 ? "text-red-500" : (u ?? 0) > 95 ? "text-orange-400" : "text-foreground";
  return /* @__PURE__ */ o.jsx(He, { children: /* @__PURE__ */ o.jsxs(Ue, { className: "pt-4 pb-3", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "cursor-pointer hover:bg-muted/50 rounded-lg p-2 text-center transition-colors", onClick: () => m("sensor.192_168_10_90_0c_enginerpm", "RPM", "rpm"), children: [
        /* @__PURE__ */ o.jsx("p", { className: "text-3xl font-bold tabular-nums", children: K(a, 0) }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "RPM" })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "cursor-pointer hover:bg-muted/50 rounded-lg p-2 text-center transition-colors", onClick: () => m("sensor.192_168_10_90_42_controlmodulevolt", "Battery Voltage", "V"), children: [
        /* @__PURE__ */ o.jsx("p", { className: "text-3xl font-bold tabular-nums", children: K(s, 2) }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Battery V" })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: ae("cursor-pointer hover:bg-muted/50 rounded-lg p-2 text-center transition-colors"), onClick: () => m("sensor.192_168_10_90_05_enginecoolanttemp", "Coolant Temp", "°C"), children: [
        /* @__PURE__ */ o.jsxs("p", { className: ae("text-3xl font-bold tabular-nums", p), children: [
          K(r, 0),
          "°"
        ] }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Coolant" })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: ae("cursor-pointer hover:bg-muted/50 rounded-lg p-2 text-center transition-colors"), onClick: () => m("sensor.192_168_10_90_tran_f_temp", "Trans Temp", "°C"), children: [
        /* @__PURE__ */ o.jsxs("p", { className: ae("text-3xl font-bold tabular-nums", y), children: [
          K(u, 0),
          "°"
        ] }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Trans" })
      ] })
    ] }),
    /* @__PURE__ */ o.jsxs("div", { className: "mt-2 flex items-center justify-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 transition-colors", onClick: () => m("sensor.road_grade", "Road Grade", "%"), children: [
      /* @__PURE__ */ o.jsx(_p, { className: "h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ o.jsxs("span", { className: "text-2xl font-bold tabular-nums", children: [
        K(f, 1),
        "%"
      ] }),
      /* @__PURE__ */ o.jsx("span", { className: "text-xs text-muted-foreground", children: (d == null ? void 0 : d.state) ?? "—" })
    ] })
  ] }) });
}
function w5() {
  return /* @__PURE__ */ o.jsxs(ea, { title: "Van & Vehicle", children: [
    /* @__PURE__ */ o.jsx(b5, {}),
    /* @__PURE__ */ o.jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3 mt-4", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ o.jsx(g5, {}),
        /* @__PURE__ */ o.jsx(y5, {})
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ o.jsx(v5, {}),
        /* @__PURE__ */ o.jsx(x5, {})
      ] }),
      /* @__PURE__ */ o.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ o.jsx(_5, {}) })
    ] })
  ] });
}
function S5({
  label: a,
  value: s,
  unit: r,
  icon: u,
  size: f = "sm",
  className: d
}) {
  return /* @__PURE__ */ o.jsxs("div", { className: ae("flex items-center justify-between", d), children: [
    /* @__PURE__ */ o.jsxs(
      "span",
      {
        className: ae(
          "text-muted-foreground flex items-center gap-1.5",
          f === "sm" ? "text-xs" : f === "md" ? "text-sm" : "text-base"
        ),
        children: [
          u && /* @__PURE__ */ o.jsx(u, { className: "h-3.5 w-3.5" }),
          a
        ]
      }
    ),
    /* @__PURE__ */ o.jsxs(
      "span",
      {
        className: ae(
          "font-medium tabular-nums",
          f === "sm" ? "text-sm" : f === "md" ? "text-base" : "text-lg"
        ),
        children: [
          s,
          r && /* @__PURE__ */ o.jsx("span", { className: "text-muted-foreground ml-0.5 text-xs", children: r })
        ]
      }
    )
  ] });
}
function j5() {
  const { value: a } = X("sensor.starlink_downlink_throughput_mbps"), { value: s } = X("sensor.starlink_uplink_throughput_mbps"), { value: r } = X("sensor.speedtest_download"), { value: u } = X("sensor.speedtest_upload"), { value: f } = X("sensor.speedtest_ping"), d = ue("binary_sensor.starlink_ethernet_speeds"), m = (d == null ? void 0 : d.state) === "off", { open: p } = zn();
  return /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(Yv, { className: "h-4 w-4" }),
      "Internet"
    ] }) }),
    /* @__PURE__ */ o.jsxs(Ue, { className: "space-y-3", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ o.jsxs(
          "div",
          {
            className: "rounded-lg bg-muted/50 p-2.5 text-center cursor-pointer hover:bg-muted/80 transition-colors",
            onClick: () => p("sensor.starlink_downlink_throughput_mbps", "Download", "Mbps"),
            children: [
              /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Download" }),
              /* @__PURE__ */ o.jsx("p", { className: "text-xl font-bold tabular-nums", children: K(a, 1) }),
              /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Mbps" })
            ]
          }
        ),
        /* @__PURE__ */ o.jsxs(
          "div",
          {
            className: "rounded-lg bg-muted/50 p-2.5 text-center cursor-pointer hover:bg-muted/80 transition-colors",
            onClick: () => p("sensor.starlink_uplink_throughput_mbps", "Upload", "Mbps"),
            children: [
              /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Upload" }),
              /* @__PURE__ */ o.jsx("p", { className: "text-xl font-bold tabular-nums", children: K(s, 1) }),
              /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Mbps" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "grid gap-1", children: [
        /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.speedtest_download", label: "Speedtest DL", value: K(r, 1), unit: "Mbps", color: "#3b82f6" }),
        /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.speedtest_upload", label: "Speedtest UL", value: K(u, 1), unit: "Mbps", color: "#8b5cf6" }),
        /* @__PURE__ */ o.jsx(ge, { entityId: "sensor.speedtest_ping", label: "Ping", value: K(f, 0), unit: "ms", color: "#f59e0b" }),
        /* @__PURE__ */ o.jsx(
          S5,
          {
            label: "Ethernet",
            value: m ? "OK" : "Issues"
          }
        )
      ] })
    ] })
  ] });
}
function N5() {
  return /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsx(st, { className: "text-base", children: "Modes" }) }),
    /* @__PURE__ */ o.jsx(Ue, { children: /* @__PURE__ */ o.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ o.jsx(
        ct,
        {
          entityId: "input_boolean.power_saving_mode",
          name: "Eco",
          icon: Fo,
          activeColor: "yellow"
        }
      ),
      /* @__PURE__ */ o.jsx(
        ct,
        {
          entityId: "input_boolean.sleep_mode",
          name: "Sleep",
          icon: ef,
          activeColor: "purple"
        }
      ),
      /* @__PURE__ */ o.jsx(
        ct,
        {
          entityId: "input_boolean.shower_mode",
          name: "Shower",
          icon: Wr,
          activeColor: "cyan"
        }
      )
    ] }) })
  ] });
}
function M5() {
  El();
  const a = [
    { id: "light.led_controller_cct_1", name: "Main", color: !0 },
    { id: "light.led_controller_cct_2", name: "Under Cabinet", color: !0 },
    { id: "light.led_controller_sc_1", name: "Shower", color: !1 },
    { id: "light.led_controller_sc_2", name: "Accent", color: !1 }
  ];
  return /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(ii, { className: "h-4 w-4" }),
      "Lights"
    ] }) }),
    /* @__PURE__ */ o.jsx(Ue, { className: "space-y-3", children: a.map((s) => /* @__PURE__ */ o.jsx(T5, { entityId: s.id, name: s.name }, s.id)) })
  ] });
}
function T5({ entityId: a, name: s }) {
  var y;
  const r = ue(a), u = yt(a), f = El(), d = (r == null ? void 0 : r.state) === "on", m = ((y = r == null ? void 0 : r.attributes) == null ? void 0 : y.brightness) ?? 0, p = Math.round(m / 255 * 100);
  return /* @__PURE__ */ o.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: s }),
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-2", children: [
        d && /* @__PURE__ */ o.jsxs("span", { className: "text-xs text-muted-foreground tabular-nums", children: [
          p,
          "%"
        ] }),
        /* @__PURE__ */ o.jsx(Gt, { checked: d, onCheckedChange: u })
      ] })
    ] }),
    d && /* @__PURE__ */ o.jsx(
      "input",
      {
        type: "range",
        min: 0,
        max: 100,
        value: p,
        onChange: (g) => f("light", "turn_on", { brightness_pct: Number(g.target.value) }, {
          entity_id: a
        }),
        className: `w-full h-1.5 rounded-full appearance-none cursor-pointer bg-secondary\r
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4\r
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary`
      }
    )
  ] });
}
function E5() {
  return /* @__PURE__ */ o.jsxs(He, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsx(st, { className: "text-base", children: "Switches" }) }),
    /* @__PURE__ */ o.jsx(Ue, { children: /* @__PURE__ */ o.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ o.jsx(
        ct,
        {
          entityId: "switch.a32_pro_do8_switch06_top_monitor",
          name: "Top Monitor",
          icon: _0,
          activeColor: "blue"
        }
      ),
      /* @__PURE__ */ o.jsx(
        ct,
        {
          entityId: "switch.a32_pro_do8_switch07_bottom_monitor",
          name: "Bottom Mon",
          icon: _0,
          activeColor: "blue"
        }
      ),
      /* @__PURE__ */ o.jsx(
        ct,
        {
          entityId: "switch.a32_pro_switch27_bed_power_supply",
          name: "Bed",
          icon: Rv,
          activeColor: "orange"
        }
      ),
      /* @__PURE__ */ o.jsx(
        ct,
        {
          entityId: "switch.a32_pro_switch16_lpg_valve",
          name: "LPG",
          icon: si,
          activeColor: "red"
        }
      ),
      /* @__PURE__ */ o.jsx(
        ct,
        {
          entityId: "switch.a32_pro_switch26_starlink_power_supply",
          name: "Starlink",
          icon: Iv,
          activeColor: "blue"
        }
      ),
      /* @__PURE__ */ o.jsx(
        ct,
        {
          entityId: "switch.a32_pro_air_fryer_ventilation_enable",
          name: "Air Fryer Vent",
          icon: ei,
          activeColor: "cyan"
        }
      )
    ] }) })
  ] });
}
function C5() {
  const { value: a } = X("sensor.a32_pro_s5140_channel_37_temperature_air_fryer_compartment");
  return /* @__PURE__ */ o.jsx(He, { children: /* @__PURE__ */ o.jsx(Ue, { className: "pt-4", children: /* @__PURE__ */ o.jsx(
    ge,
    {
      entityId: "sensor.a32_pro_s5140_channel_37_temperature_air_fryer_compartment",
      label: "Air Fryer Compartment",
      value: K(a, 1),
      unit: "°C",
      icon: Ir,
      color: "#f97316"
    }
  ) }) });
}
function A5() {
  const a = ue("input_boolean.windows_audio_stream"), s = yt("input_boolean.windows_audio_stream");
  return /* @__PURE__ */ o.jsx(He, { children: /* @__PURE__ */ o.jsx(Ue, { className: "pt-4", children: /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ o.jsxs("span", { className: "text-sm flex items-center gap-1.5", children: [
      /* @__PURE__ */ o.jsx(Kv, { className: "h-3.5 w-3.5" }),
      "Windows Audio Stream"
    ] }),
    /* @__PURE__ */ o.jsx(Gt, { checked: (a == null ? void 0 : a.state) === "on", onCheckedChange: s })
  ] }) }) });
}
function z5() {
  return /* @__PURE__ */ o.jsx(ea, { title: "System", children: /* @__PURE__ */ o.jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsx(j5, {}),
      /* @__PURE__ */ o.jsx(C5, {}),
      /* @__PURE__ */ o.jsx(A5, {})
    ] }),
    /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsx(N5, {}),
      /* @__PURE__ */ o.jsx(E5, {})
    ] }),
    /* @__PURE__ */ o.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ o.jsx(M5, {}) })
  ] }) });
}
const Jo = [
  { entityId: "camera.channel_1", label: "Left", channel: 1, lightEntityId: "switch.a32_pro_switch21_left_outdoor_lights" },
  { entityId: "camera.channel_2", label: "Right", channel: 2, lightEntityId: "switch.a32_pro_switch22_right_outdoor_lights" },
  { entityId: "camera.channel_3", label: "Front", channel: 3, lightEntityId: "switch.a32_pro_switch31_lightbar" },
  { entityId: "camera.channel_4", label: "Back", channel: 4, lightEntityId: "switch.a32_pro_switch23_rear_outdoor_lights" }
], O5 = [
  { urls: "stun:stun.l.google.com:19302" }
];
function R5({ entityId: a }) {
  const s = Va(), r = R.useRef(null), u = R.useRef(null), f = R.useRef(null), d = R.useRef(null), [m, p] = R.useState("connecting"), [y, g] = R.useState(0), x = R.useRef(0);
  return R.useEffect(() => {
    let _ = !1, S, j, T = 0, D = !1;
    function U() {
      if (_) return;
      const J = Math.min(2e3 * Math.pow(2, x.current), 3e4);
      x.current++, S = setTimeout(() => {
        _ || (p("connecting"), g((L) => L + 1));
      }, J);
    }
    async function V() {
      const J = s.hass;
      if (!J) {
        p("error"), U();
        return;
      }
      try {
        const L = new RTCPeerConnection({
          iceServers: O5,
          bundlePolicy: "max-bundle"
        });
        u.current = L, L.addTransceiver("video", { direction: "recvonly" }), L.addTransceiver("audio", { direction: "recvonly" }), L.ontrack = (Z) => {
          !_ && r.current && Z.streams[0] && (r.current.srcObject = Z.streams[0]);
        }, L.onconnectionstatechange = () => {
          if (_) return;
          const Z = L.connectionState;
          Z === "connected" ? (p("playing"), D = !0, x.current = 0) : Z === "failed" || Z === "closed" ? (D = !1, p("connecting"), U()) : Z === "disconnected" && (D = !1, setTimeout(() => {
            !_ && L.connectionState === "disconnected" && (p("connecting"), U());
          }, 5e3));
        }, L.onicecandidate = (Z) => {
          Z.candidate && d.current && J.connection.sendMessagePromise({
            type: "camera/webrtc/candidate",
            entity_id: a,
            session_id: d.current,
            candidate: Z.candidate.toJSON()
          }).catch(() => {
          });
        };
        const I = await L.createOffer();
        await L.setLocalDescription(I);
        const se = await J.connection.subscribeMessage(
          (Z) => {
            if (!_)
              if (Z.type === "session")
                d.current = Z.session_id;
              else if (Z.type === "answer")
                L.setRemoteDescription(
                  new RTCSessionDescription({ type: "answer", sdp: Z.answer })
                );
              else if (Z.type === "candidate") {
                const F = typeof Z.candidate == "string" ? new RTCIceCandidate({ candidate: Z.candidate, sdpMid: "0" }) : new RTCIceCandidate(Z.candidate);
                L.addIceCandidate(F).catch(() => {
                });
              } else Z.type === "error" && (console.error(`WebRTC error for ${a}:`, Z.message), p("connecting"), U());
          },
          {
            type: "camera/webrtc/offer",
            entity_id: a,
            offer: L.localDescription.sdp
          }
        );
        f.current = se;
      } catch (L) {
        _ || (console.error(`WebRTC connect failed for ${a}:`, L), p("connecting"), U());
      }
    }
    return j = setInterval(() => {
      const J = r.current;
      !J || !D || J.paused || (J.currentTime > 0 && J.currentTime === T && (console.warn(`Video stalled for ${a}, reconnecting`), D = !1, p("connecting"), g((L) => L + 1)), T = J.currentTime);
    }, 5e3), V(), () => {
      var J, L;
      _ = !0, D = !1, clearTimeout(S), clearInterval(j), (J = f.current) == null || J.call(f), f.current = null, (L = u.current) == null || L.close(), u.current = null, d.current = null;
    };
  }, [a, s, y]), /* @__PURE__ */ o.jsxs("div", { className: "relative w-full h-full bg-black", children: [
    /* @__PURE__ */ o.jsx(
      "video",
      {
        ref: r,
        autoPlay: !0,
        playsInline: !0,
        muted: !0,
        className: `w-full h-full object-contain transition-opacity duration-300 ${m === "playing" ? "opacity-100" : "opacity-0"}`
      }
    ),
    m === "connecting" && /* @__PURE__ */ o.jsx("div", { className: "absolute inset-0 flex items-center justify-center text-muted-foreground", children: /* @__PURE__ */ o.jsx(Po, { className: "h-6 w-6 animate-spin" }) }),
    m === "error" && /* @__PURE__ */ o.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2", children: [
      /* @__PURE__ */ o.jsx(tf, { className: "h-6 w-6" }),
      /* @__PURE__ */ o.jsx("span", { className: "text-xs", children: "Reconnecting…" })
    ] })
  ] });
}
function k5({ entityId: a }) {
  const s = ue(a), r = yt(a), u = (s == null ? void 0 : s.state) === "on";
  return /* @__PURE__ */ o.jsx(
    "button",
    {
      onClick: (f) => {
        f.stopPropagation(), r();
      },
      className: `flex items-center justify-center w-9 h-9 rounded-full transition-all ${u ? "bg-yellow-400/90 text-black shadow-[0_0_12px_rgba(250,204,21,0.5)]" : "bg-white/15 text-white/70 hover:bg-white/25"}`,
      children: /* @__PURE__ */ o.jsx(ii, { className: "h-4.5 w-4.5" })
    }
  );
}
function D5({
  entityId: a,
  label: s,
  lightEntityId: r,
  hidden: u,
  expanded: f,
  onExpand: d,
  onCollapse: m
}) {
  const p = ue(a), y = !p || p.state === "unavailable";
  return /* @__PURE__ */ o.jsxs(
    "div",
    {
      className: `relative rounded-lg overflow-hidden bg-black border border-border cursor-pointer group ${u ? "hidden" : ""}`,
      onClick: f ? void 0 : d,
      children: [
        /* @__PURE__ */ o.jsxs("div", { className: "absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-1.5 bg-gradient-to-b from-black/70 to-transparent", children: [
          /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ o.jsx("span", { className: `text-white font-medium drop-shadow ${f ? "" : "text-sm"}`, children: s }),
            /* @__PURE__ */ o.jsx(k5, { entityId: r })
          ] }),
          f ? /* @__PURE__ */ o.jsxs(
            "button",
            {
              onClick: m,
              className: "flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm transition-colors",
              children: [
                /* @__PURE__ */ o.jsx(Gv, { className: "h-4 w-4" }),
                "Grid"
              ]
            }
          ) : /* @__PURE__ */ o.jsx(Qv, { className: "h-4 w-4 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity" })
        ] }),
        y ? /* @__PURE__ */ o.jsxs("div", { className: `flex flex-col items-center justify-center h-full text-muted-foreground gap-2 ${f ? "min-h-[400px]" : "min-h-[180px]"}`, children: [
          /* @__PURE__ */ o.jsx(tf, { className: f ? "h-10 w-10" : "h-8 w-8" }),
          /* @__PURE__ */ o.jsx("span", { className: f ? "" : "text-sm", children: "Camera unavailable" })
        ] }) : /* @__PURE__ */ o.jsx(R5, { entityId: a })
      ]
    }
  );
}
const hg = `http://${window.location.hostname}:8766`;
async function zr(a, s) {
  const r = await fetch(`${hg}${a}`, s);
  if (!r.ok) throw new Error(`DVR proxy error: ${r.status}`);
  return r.json();
}
function H5({
  speed: a = 1,
  onError: s
}) {
  const r = R.useRef(null), [u, f] = R.useState("connecting");
  return R.useEffect(() => {
    r.current && (r.current.playbackRate = a);
  }, [a]), R.useEffect(() => {
    const d = r.current;
    if (!d) return;
    let m = !1, p = null, y = null;
    async function g() {
      if (d)
        try {
          const S = await fetch(`${hg}/api/playback/stream`);
          if (m) return;
          if (!S.ok || !S.body) {
            console.error("Playback stream:", S.status), f("error"), s == null || s();
            return;
          }
          let T = (S.headers.get("Content-Type") || 'video/mp4; codecs="hvc1"').split(";").map((I) => I.trim()).join("; ");
          if (MediaSource.isTypeSupported(T) || (T = 'video/mp4; codecs="hvc1"'), MediaSource.isTypeSupported(T) || (T = 'video/mp4; codecs="avc1.640028"'), !MediaSource.isTypeSupported(T)) {
            console.error("No supported MSE codec"), f("error"), s == null || s();
            return;
          }
          const D = new MediaSource();
          if (p = URL.createObjectURL(D), d.src = p, await new Promise(
            (I) => D.addEventListener("sourceopen", () => I(), { once: !0 })
          ), m) return;
          const U = D.addSourceBuffer(T);
          y = S.body.getReader();
          const V = [], J = () => {
            V.length > 0 && !U.updating && D.readyState === "open" && U.appendBuffer(V.shift());
          };
          U.addEventListener("updateend", J);
          let L = !1;
          for (; !m; ) {
            const { done: I, value: se } = await y.read();
            if (I || !se) break;
            U.updating || V.length > 0 ? V.push(se) : U.appendBuffer(se), L || (L = !0, d.playbackRate = a, d.play().catch(() => {
            }));
          }
        } catch (S) {
          m || (console.error("Playback MSE error:", S), f("error"), s == null || s());
        }
    }
    const x = () => {
      m || f("playing");
    }, _ = () => {
      m || (console.error("Playback video error:", d.error), f("error"), s == null || s());
    };
    return d.addEventListener("playing", x), d.addEventListener("error", _), g(), () => {
      m = !0, d.removeEventListener("playing", x), d.removeEventListener("error", _), y == null || y.cancel().catch(() => {
      }), d.pause(), d.removeAttribute("src"), d.load(), p && URL.revokeObjectURL(p);
    };
  }, [s]), /* @__PURE__ */ o.jsxs("div", { className: "relative w-full h-full bg-black rounded-lg overflow-hidden", children: [
    /* @__PURE__ */ o.jsx(
      "video",
      {
        ref: r,
        autoPlay: !0,
        playsInline: !0,
        muted: !0,
        className: `w-full h-full object-contain transition-opacity duration-300 ${u === "playing" ? "opacity-100" : "opacity-0"}`
      }
    ),
    u === "connecting" && /* @__PURE__ */ o.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2", children: [
      /* @__PURE__ */ o.jsx(Po, { className: "h-8 w-8 animate-spin" }),
      /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "Connecting to recording..." })
    ] }),
    u === "error" && /* @__PURE__ */ o.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2", children: [
      /* @__PURE__ */ o.jsx(tf, { className: "h-8 w-8" }),
      /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "Playback failed" })
    ] })
  ] });
}
function U5({
  segments: a,
  date: s,
  selectedTime: r,
  onSelectTime: u
}) {
  const f = R.useRef(null), d = 24, m = (/* @__PURE__ */ new Date(`${s}T00:00:00`)).getTime(), p = m + d * 36e5, y = (S) => (new Date(S.replace(" ", "T")).getTime() - m) / (p - m) * 100, g = (() => {
    if (!r) return 0;
    const S = new Date(r.replace(" ", "T")).getTime();
    return Math.max(0, Math.min(100, (S - m) / (p - m) * 100));
  })(), x = (S) => {
    if (!f.current) return;
    const j = f.current.getBoundingClientRect(), T = (S.clientX - j.left) / j.width, D = m + T * (p - m), U = new Date(D), V = (L) => String(L).padStart(2, "0"), J = `${s} ${V(U.getHours())}:${V(U.getMinutes())}:${V(U.getSeconds())}`;
    u(J);
  }, _ = R.useMemo(() => {
    const S = [];
    for (let j = 0; j < 24; j += 3)
      S.push(
        /* @__PURE__ */ o.jsx(
          "span",
          {
            className: "absolute text-[9px] text-muted-foreground -bottom-4",
            style: { left: `${j / 24 * 100}%`, transform: "translateX(-50%)" },
            children: j === 0 ? "12a" : j < 12 ? `${j}a` : j === 12 ? "12p" : `${j - 12}p`
          },
          j
        )
      );
    return S;
  }, []);
  return /* @__PURE__ */ o.jsxs("div", { className: "relative px-1 pt-1 pb-6", children: [
    /* @__PURE__ */ o.jsxs(
      "div",
      {
        ref: f,
        className: "relative w-full h-6 bg-muted/50 rounded cursor-pointer border border-border overflow-hidden",
        onClick: x,
        children: [
          a.map((S, j) => {
            const T = Math.max(0, y(S.start)), D = Math.min(100, y(S.end));
            return /* @__PURE__ */ o.jsx(
              "div",
              {
                className: "absolute top-0 bottom-0 bg-blue-500/50",
                style: { left: `${T}%`, width: `${D - T}%` }
              },
              j
            );
          }),
          /* @__PURE__ */ o.jsx(
            "div",
            {
              className: "absolute top-0 bottom-0 w-0.5 bg-red-500 z-10",
              style: { left: `${g}%` }
            }
          )
        ]
      }
    ),
    _
  ] });
}
function L5() {
  var F;
  const [a, s] = R.useState(1), [r, u] = R.useState(() => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)), [f, d] = R.useState([]), [m, p] = R.useState(""), [y, g] = R.useState(null), [x, _] = R.useState(!1), [S, j] = R.useState(1), [T, D] = R.useState(null);
  R.useEffect(() => {
    zr(`/api/date-range?channel=${a}`).then(($) => {
      $.min_date && $.max_date && D({
        min: $.min_date.slice(0, 10),
        max: $.max_date.slice(0, 10)
      });
    }).catch(() => {
    });
  }, [a]), R.useEffect(() => {
    d([]), g(null), zr(`/api/timeline?channel=${a}&date=${r}`).then(($) => {
      var fe;
      d($.segments || []), (fe = $.segments) != null && fe.length && !m && p($.segments[0].start);
    }).catch(() => {
    });
  }, [r, a]);
  const U = () => {
    const $ = new Date(r);
    $.setDate($.getDate() - 1);
    const fe = $.toISOString().slice(0, 10);
    (!T || fe >= T.min) && (u(fe), p(""));
  }, V = () => {
    const $ = new Date(r);
    $.setDate($.getDate() + 1);
    const fe = $.toISOString().slice(0, 10);
    (!T || fe <= T.max) && (u(fe), p(""));
  }, J = async ($, fe) => {
    const we = $ ?? m, me = S;
    if (!we) return;
    _(!0), g(null);
    const P = new Date(we.replace(" ", "T")).getTime();
    let Le = "";
    for (const he of f) {
      const Ne = new Date(he.start.replace(" ", "T")).getTime(), z = new Date(he.end.replace(" ", "T")).getTime();
      if (P >= Ne && P < z) {
        Le = he.end;
        break;
      }
    }
    if (!Le) {
      const he = new Date(P + 18e5), Ne = (z) => String(z).padStart(2, "0");
      Le = `${r} ${Ne(he.getHours())}:${Ne(he.getMinutes())}:${Ne(he.getSeconds())}`;
    }
    try {
      await zr("/api/playback/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: a, startTime: we, endTime: Le, speed: me })
      }), g(Date.now());
    } catch (he) {
      console.error("Playback start error:", he);
    } finally {
      _(!1);
    }
  }, L = () => {
    g(null), zr("/api/playback/stop", { method: "POST" }).catch(() => {
    });
  }, I = ($) => {
    p($), y && J($);
  }, se = ($) => {
    j($);
  }, Z = ((F = Jo.find(($) => $.channel === a)) == null ? void 0 : F.label) ?? `Ch ${a}`;
  return /* @__PURE__ */ o.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ o.jsx("div", { className: "flex gap-1", children: Jo.map(($) => /* @__PURE__ */ o.jsx(
        "button",
        {
          onClick: () => {
            s($.channel), g(null);
          },
          className: `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${a === $.channel ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`,
          children: $.label
        },
        $.channel
      )) }),
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-1 ml-auto", children: [
        /* @__PURE__ */ o.jsx("button", { onClick: U, className: "p-1.5 rounded-md hover:bg-muted transition-colors", children: /* @__PURE__ */ o.jsx(Dv, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ o.jsx(
          "input",
          {
            type: "date",
            value: r,
            min: T == null ? void 0 : T.min,
            max: T == null ? void 0 : T.max,
            onChange: ($) => {
              u($.target.value), p("");
            },
            className: "bg-muted border border-border rounded-md px-2 py-1 text-sm"
          }
        ),
        /* @__PURE__ */ o.jsx("button", { onClick: V, className: "p-1.5 rounded-md hover:bg-muted transition-colors", children: /* @__PURE__ */ o.jsx(Hv, { className: "h-4 w-4" }) })
      ] })
    ] }),
    f.length > 0 ? /* @__PURE__ */ o.jsx(
      U5,
      {
        segments: f,
        date: r,
        selectedTime: m,
        onSelectTime: I
      }
    ) : /* @__PURE__ */ o.jsxs("div", { className: "text-center text-muted-foreground text-sm py-4", children: [
      "No recordings found for ",
      r
    ] }),
    m && /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
      /* @__PURE__ */ o.jsxs("span", { className: "text-sm text-muted-foreground", children: [
        Z,
        " · ",
        m.slice(11)
      ] }),
      y ? /* @__PURE__ */ o.jsx(
        "button",
        {
          onClick: L,
          className: "flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors",
          children: "Stop"
        }
      ) : /* @__PURE__ */ o.jsxs(
        "button",
        {
          onClick: () => J(),
          disabled: x,
          className: "flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50",
          children: [
            x ? /* @__PURE__ */ o.jsx(Po, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ o.jsx(Jv, { className: "h-4 w-4" }),
            "Play"
          ]
        }
      ),
      /* @__PURE__ */ o.jsx("div", { className: "flex items-center gap-0.5 ml-auto", children: [1, 2, 4, 8].map(($) => /* @__PURE__ */ o.jsxs(
        "button",
        {
          onClick: () => se($),
          className: `px-2 py-1 rounded text-xs font-medium transition-colors ${S === $ ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:bg-muted"}`,
          children: [
            $,
            "x"
          ]
        },
        $
      )) })
    ] }),
    y && /* @__PURE__ */ o.jsx("div", { className: "aspect-video rounded-lg overflow-hidden border border-border", children: /* @__PURE__ */ o.jsx(
      H5,
      {
        speed: S,
        onError: L
      },
      y
    ) })
  ] });
}
function mg() {
  const [a, s] = R.useState(null), [r, u] = R.useState("live");
  return /* @__PURE__ */ o.jsxs(ea, { title: "Cameras", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
      /* @__PURE__ */ o.jsxs(
        "button",
        {
          onClick: () => u("live"),
          className: `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${r === "live" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`,
          children: [
            /* @__PURE__ */ o.jsx(Fv, { className: "h-4 w-4" }),
            "Live"
          ]
        }
      ),
      /* @__PURE__ */ o.jsxs(
        "button",
        {
          onClick: () => u("playback"),
          className: `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${r === "playback" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`,
          children: [
            /* @__PURE__ */ o.jsx(Xv, { className: "h-4 w-4" }),
            "Playback"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ o.jsx("div", { className: r === "live" ? "" : "hidden", children: /* @__PURE__ */ o.jsx(
      "div",
      {
        className: "grid gap-3",
        style: {
          minHeight: "calc(100vh - 180px)",
          gridTemplateColumns: a ? "1fr" : "repeat(2, 1fr)",
          gridTemplateRows: a ? "1fr" : "repeat(2, 1fr)"
        },
        children: Jo.map((f) => {
          const d = a === f.entityId, m = a !== null && !d;
          return /* @__PURE__ */ o.jsx(
            D5,
            {
              entityId: f.entityId,
              label: f.label,
              lightEntityId: f.lightEntityId,
              hidden: m,
              expanded: d,
              onExpand: () => s(f.entityId),
              onCollapse: () => s(null)
            },
            f.entityId
          );
        })
      }
    ) }),
    r === "playback" && /* @__PURE__ */ o.jsx(L5, {})
  ] });
}
const pg = {
  home: zp,
  power: e5,
  climate: i5,
  water: m5,
  van: w5,
  system: z5,
  cameras: mg
}, B5 = [
  { id: "home", label: "Home", icon: xp },
  { id: "power", label: "Power", icon: ri },
  { id: "climate", label: "Climate", icon: Ir },
  { id: "water", label: "Water", icon: Ka },
  { id: "van", label: "Van", icon: ax },
  { id: "cameras", label: "Cameras", icon: kv },
  { id: "system", label: "System", icon: Pv }
];
function tp() {
  const a = window.location.hash.slice(1);
  return a && a in pg ? a : "home";
}
function q5({ navigate: a }) {
  const s = Va(), r = R.useRef(!1);
  return R.useEffect(() => s.subscribeEntity("binary_sensor.vehicle_is_moving", () => {
    const u = s.getEntity("binary_sensor.vehicle_is_moving"), f = (u == null ? void 0 : u.state) === "on";
    f && !r.current && a("van"), r.current = f;
  }), [s, a]), null;
}
function Y5() {
  const [a, s] = R.useState(!1);
  return R.useEffect(() => {
    var f, d;
    const r = () => {
      var p, y;
      const m = window.__HASS__;
      m != null && m.themes ? s(m.themes.darkMode ?? !1) : s(((y = (p = window.matchMedia) == null ? void 0 : p.call(window, "(prefers-color-scheme: dark)")) == null ? void 0 : y.matches) ?? !1);
    };
    window.addEventListener("hass-updated", r);
    const u = (f = window.matchMedia) == null ? void 0 : f.call(window, "(prefers-color-scheme: dark)");
    return (d = u == null ? void 0 : u.addEventListener) == null || d.call(u, "change", r), r(), () => {
      var m;
      window.removeEventListener("hass-updated", r), (m = u == null ? void 0 : u.removeEventListener) == null || m.call(u, "change", r);
    };
  }, []), a;
}
function G5() {
  const a = Y5(), [s, r] = R.useState(tp);
  R.useEffect(() => {
    const d = () => r(tp());
    return window.addEventListener("hashchange", d), () => window.removeEventListener("hashchange", d);
  }, []);
  const u = R.useCallback((d) => {
    window.location.hash = d, r(d);
  }, []), f = pg[s] ?? zp;
  return /* @__PURE__ */ o.jsxs(Gy, { children: [
    /* @__PURE__ */ o.jsx(q5, { navigate: u }),
    /* @__PURE__ */ o.jsx("div", { className: `van-dash-root ${a ? "dark" : ""}`, style: { position: "relative" }, children: /* @__PURE__ */ o.jsx(ux, { children: /* @__PURE__ */ o.jsxs("div", { className: "h-screen flex flex-col bg-background text-foreground", children: [
      /* @__PURE__ */ o.jsx("nav", { className: "flex-none border-b border-border bg-card/80 backdrop-blur-sm", children: /* @__PURE__ */ o.jsx("div", { className: "flex items-center gap-1 px-2 h-11 overflow-x-auto", children: B5.map(({ id: d, label: m, icon: p }) => /* @__PURE__ */ o.jsxs(
        "button",
        {
          onClick: () => u(d),
          className: ae(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
            s === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          ),
          children: [
            /* @__PURE__ */ o.jsx(p, { className: "h-4 w-4" }),
            m
          ]
        },
        d
      )) }) }),
      /* @__PURE__ */ o.jsxs("div", { className: "flex-1 overflow-auto", children: [
        /* @__PURE__ */ o.jsx("div", { className: s === "cameras" ? "" : "hidden", children: /* @__PURE__ */ o.jsx(mg, {}) }),
        s !== "cameras" && /* @__PURE__ */ o.jsx(f, {})
      ] })
    ] }) }) })
  ] });
}
const X5 = 1, $r = 2, ko = 3, V5 = 4, Q5 = 5;
function Z5(a) {
  return {
    type: "auth",
    access_token: a
  };
}
function K5() {
  return {
    type: "supported_features",
    id: 1,
    // Always the first message after auth
    features: { coalesce_messages: 1 }
  };
}
function J5() {
  return {
    type: "get_states"
  };
}
function $5(a, s, r, u, f) {
  const d = {
    type: "call_service",
    domain: a,
    service: s,
    target: u,
    return_response: f
  };
  return r && (d.service_data = r), d;
}
function W5(a) {
  const s = {
    type: "subscribe_events"
  };
  return a && (s.event_type = a), s;
}
function np(a) {
  return {
    type: "unsubscribe_events",
    subscription: a
  };
}
function F5() {
  return {
    type: "ping"
  };
}
function I5(a, s) {
  return {
    type: "result",
    success: !1,
    error: {
      code: a,
      message: s
    }
  };
}
const gg = (a, s, r, u) => {
  const [f, d, m] = a.split(".", 3);
  return Number(f) > s || Number(f) === s && (u === void 0 ? Number(d) >= r : Number(d) > r) || u !== void 0 && Number(f) === s && Number(d) === r && Number(m) >= u;
}, P5 = "auth_invalid", e3 = "auth_ok";
function t3(a) {
  if (!a.auth)
    throw V5;
  const s = a.auth;
  let r = s.expired ? s.refreshAccessToken().then(() => {
    r = void 0;
  }, () => {
    r = void 0;
  }) : void 0;
  const u = s.wsUrl;
  function f(d, m, p) {
    const y = new WebSocket(u);
    let g = !1;
    const x = () => {
      if (y.removeEventListener("close", x), g) {
        p($r);
        return;
      }
      if (d === 0) {
        p(X5);
        return;
      }
      const j = d === -1 ? -1 : d - 1;
      setTimeout(() => f(j, m, p), 1e3);
    }, _ = async (j) => {
      try {
        s.expired && await (r || s.refreshAccessToken()), y.send(JSON.stringify(Z5(s.accessToken)));
      } catch (T) {
        g = T === $r, y.close();
      }
    }, S = async (j) => {
      const T = JSON.parse(j.data);
      switch (T.type) {
        case P5:
          g = !0, y.close();
          break;
        case e3:
          y.removeEventListener("open", _), y.removeEventListener("message", S), y.removeEventListener("close", x), y.removeEventListener("error", x), y.haVersion = T.ha_version, gg(y.haVersion, 2022, 9) && y.send(JSON.stringify(K5())), m(y);
          break;
      }
    };
    y.addEventListener("open", _), y.addEventListener("message", S), y.addEventListener("close", x), y.addEventListener("error", x);
  }
  return new Promise((d, m) => f(a.setupRetry, d, m));
}
class n3 {
  constructor(s, r) {
    this._handleMessage = (u) => {
      let f = JSON.parse(u.data);
      Array.isArray(f) || (f = [f]), f.forEach((d) => {
        const m = this.commands.get(d.id);
        switch (d.type) {
          case "event":
            m ? m.callback(d.event) : (console.warn(`Received event for unknown subscription ${d.id}. Unsubscribing.`), this.sendMessagePromise(np(d.id)).catch((p) => {
            }));
            break;
          case "result":
            m && (d.success ? (m.resolve(d.result), "subscribe" in m || this.commands.delete(d.id)) : (m.reject(d.error), this.commands.delete(d.id)));
            break;
          case "pong":
            m ? (m.resolve(), this.commands.delete(d.id)) : console.warn(`Received unknown pong response ${d.id}`);
            break;
        }
      });
    }, this._handleClose = async () => {
      const u = this.commands;
      if (this.commandId = 1, this.oldSubscriptions = this.commands, this.commands = /* @__PURE__ */ new Map(), this.socket = void 0, u.forEach((m) => {
        "subscribe" in m || m.reject(I5(ko, "Connection lost"));
      }), this.closeRequested)
        return;
      this.fireEvent("disconnected");
      const f = Object.assign(Object.assign({}, this.options), { setupRetry: 0 }), d = (m) => {
        setTimeout(async () => {
          if (!this.closeRequested)
            try {
              const p = await f.createSocket(f);
              this._setSocket(p);
            } catch (p) {
              if (this._queuedMessages) {
                const y = this._queuedMessages;
                this._queuedMessages = void 0;
                for (const g of y)
                  g.reject && g.reject(ko);
              }
              p === $r ? this.fireEvent("reconnect-error", p) : d(m + 1);
            }
        }, Math.min(m, 5) * 1e3);
      };
      this.suspendReconnectPromise && (await this.suspendReconnectPromise, this.suspendReconnectPromise = void 0, this._queuedMessages = []), d(0);
    }, this.options = r, this.commandId = 2, this.commands = /* @__PURE__ */ new Map(), this.eventListeners = /* @__PURE__ */ new Map(), this.closeRequested = !1, this._setSocket(s);
  }
  get connected() {
    return this.socket !== void 0 && this.socket.readyState == this.socket.OPEN;
  }
  _setSocket(s) {
    this.socket = s, this.haVersion = s.haVersion, s.addEventListener("message", this._handleMessage), s.addEventListener("close", this._handleClose);
    const r = this.oldSubscriptions;
    r && (this.oldSubscriptions = void 0, r.forEach((f) => {
      "subscribe" in f && f.subscribe && f.subscribe().then((d) => {
        f.unsubscribe = d, f.resolve();
      });
    }));
    const u = this._queuedMessages;
    if (u) {
      this._queuedMessages = void 0;
      for (const f of u)
        f.resolve();
    }
    this.fireEvent("ready");
  }
  addEventListener(s, r) {
    let u = this.eventListeners.get(s);
    u || (u = [], this.eventListeners.set(s, u)), u.push(r);
  }
  removeEventListener(s, r) {
    const u = this.eventListeners.get(s);
    if (!u)
      return;
    const f = u.indexOf(r);
    f !== -1 && u.splice(f, 1);
  }
  fireEvent(s, r) {
    (this.eventListeners.get(s) || []).forEach((u) => u(this, r));
  }
  suspendReconnectUntil(s) {
    this.suspendReconnectPromise = s;
  }
  suspend() {
    if (!this.suspendReconnectPromise)
      throw new Error("Suspend promise not set");
    this.socket && this.socket.close();
  }
  /**
   * Reconnect the websocket connection.
   * @param force discard old socket instead of gracefully closing it.
   */
  reconnect(s = !1) {
    if (this.socket) {
      if (!s) {
        this.socket.close();
        return;
      }
      this.socket.removeEventListener("message", this._handleMessage), this.socket.removeEventListener("close", this._handleClose), this.socket.close(), this._handleClose();
    }
  }
  close() {
    this.closeRequested = !0, this.socket && this.socket.close();
  }
  /**
   * Subscribe to a specific or all events.
   *
   * @param callback Callback  to be called when a new event fires
   * @param eventType
   * @returns promise that resolves to an unsubscribe function
   */
  async subscribeEvents(s, r) {
    return this.subscribeMessage(s, W5(r));
  }
  ping() {
    return this.sendMessagePromise(F5());
  }
  sendMessage(s, r) {
    if (!this.connected)
      throw ko;
    if (this._queuedMessages) {
      if (r)
        throw new Error("Cannot queue with commandId");
      this._queuedMessages.push({ resolve: () => this.sendMessage(s) });
      return;
    }
    r || (r = this._genCmdId()), s.id = r, this.socket.send(JSON.stringify(s));
  }
  sendMessagePromise(s) {
    return new Promise((r, u) => {
      if (this._queuedMessages) {
        this._queuedMessages.push({
          reject: u,
          resolve: async () => {
            try {
              r(await this.sendMessagePromise(s));
            } catch (d) {
              u(d);
            }
          }
        });
        return;
      }
      const f = this._genCmdId();
      this.commands.set(f, { resolve: r, reject: u }), this.sendMessage(s, f);
    });
  }
  /**
   * Call a websocket command that starts a subscription on the backend.
   *
   * @param message the message to start the subscription
   * @param callback the callback to be called when a new item arrives
   * @param [options.resubscribe] re-established a subscription after a reconnect. Defaults to true.
   * @returns promise that resolves to an unsubscribe function
   */
  async subscribeMessage(s, r, u) {
    if (this._queuedMessages && await new Promise((d, m) => {
      this._queuedMessages.push({ resolve: d, reject: m });
    }), u != null && u.preCheck && !await u.preCheck())
      throw new Error("Pre-check failed");
    let f;
    return await new Promise((d, m) => {
      const p = this._genCmdId();
      f = {
        resolve: d,
        reject: m,
        callback: s,
        subscribe: (u == null ? void 0 : u.resubscribe) !== !1 ? () => this.subscribeMessage(s, r, u) : void 0,
        unsubscribe: async () => {
          this.connected && await this.sendMessagePromise(np(p)), this.commands.delete(p);
        }
      }, this.commands.set(p, f);
      try {
        this.sendMessage(r, p);
      } catch {
      }
    }), () => f.unsubscribe();
  }
  _genCmdId() {
    return ++this.commandId;
  }
}
const l3 = (a) => a * 1e3 + Date.now();
async function a3(a, s, r) {
  const u = typeof location < "u" && location;
  if (u && u.protocol === "https:") {
    const p = document.createElement("a");
    if (p.href = a, p.protocol === "http:" && p.hostname !== "localhost")
      throw Q5;
  }
  const f = new FormData();
  s !== null && f.append("client_id", s), Object.keys(r).forEach((p) => {
    f.append(p, r[p]);
  });
  const d = await fetch(`${a}/auth/token`, {
    method: "POST",
    credentials: "same-origin",
    body: f
  });
  if (!d.ok)
    throw d.status === 400 || d.status === 403 ? $r : new Error("Unable to fetch tokens");
  const m = await d.json();
  return m.hassUrl = a, m.clientId = s, m.expires = l3(m.expires_in), m;
}
class s3 {
  constructor(s, r) {
    this.data = s, this._saveTokens = r;
  }
  get wsUrl() {
    return `ws${this.data.hassUrl.substr(4)}/api/websocket`;
  }
  get accessToken() {
    return this.data.access_token;
  }
  get expired() {
    return Date.now() > this.data.expires;
  }
  /**
   * Refresh the access token.
   */
  async refreshAccessToken() {
    if (!this.data.refresh_token)
      throw new Error("No refresh_token");
    const s = await a3(this.data.hassUrl, this.data.clientId, {
      grant_type: "refresh_token",
      refresh_token: this.data.refresh_token
    });
    s.refresh_token = this.data.refresh_token, this.data = s, this._saveTokens && this._saveTokens(s);
  }
  /**
   * Revoke the refresh & access tokens.
   */
  async revoke() {
    if (!this.data.refresh_token)
      throw new Error("No refresh_token to revoke");
    const s = new FormData();
    s.append("token", this.data.refresh_token), await fetch(`${this.data.hassUrl}/auth/revoke`, {
      method: "POST",
      credentials: "same-origin",
      body: s
    }), this._saveTokens && this._saveTokens(null);
  }
}
function g3(a, s) {
  return new s3({
    hassUrl: a,
    clientId: null,
    expires: Date.now() + 1e11,
    refresh_token: "",
    access_token: s,
    expires_in: 1e11
  });
}
const i3 = (a) => {
  let s = [];
  function r(f) {
    let d = [];
    for (let m = 0; m < s.length; m++)
      s[m] === f ? f = null : d.push(s[m]);
    s = d;
  }
  function u(f, d) {
    a = d ? f : Object.assign(Object.assign({}, a), f);
    let m = s;
    for (let p = 0; p < m.length; p++)
      m[p](a);
  }
  return {
    get state() {
      return a;
    },
    /**
     * Create a bound copy of the given action function.
     * The bound returned function invokes action() and persists the result back to the store.
     * If the return value of `action` is a Promise, the resolved value will be used as state.
     * @param {Function} action	An action of the form `action(state, ...args) -> stateUpdate`
     * @returns {Function} boundAction()
     */
    action(f) {
      function d(m) {
        u(m, !1);
      }
      return function() {
        let m = [a];
        for (let y = 0; y < arguments.length; y++)
          m.push(arguments[y]);
        let p = f.apply(this, m);
        if (p != null)
          return p instanceof Promise ? p.then(d) : d(p);
      };
    },
    /**
     * Apply a partial state object to the current state, invoking registered listeners.
     * @param {Object} update				An object with properties to be merged into state
     * @param {Boolean} [overwrite=false]	If `true`, update will replace state instead of being merged into it
     */
    setState: u,
    clearState() {
      a = void 0;
    },
    /**
     * Register a listener function to be called whenever state is changed. Returns an `unsubscribe()` function.
     * @param {Function} listener	A function to call when state changes. Gets passed the new state.
     * @returns {Function} unsubscribe()
     */
    subscribe(f) {
      return s.push(f), () => {
        r(f);
      };
    }
    // /**
    //  * Remove a previously-registered listener function.
    //  * @param {Function} listener	The callback previously passed to `subscribe()` that should be removed.
    //  * @function
    //  */
    // unsubscribe,
  };
}, r3 = 5e3, lp = (a, s, r, u, f = { unsubGrace: !0 }) => {
  if (a[s])
    return a[s];
  let d = 0, m, p, y = i3();
  const g = () => {
    if (!r)
      throw new Error("Collection does not support refresh");
    return r(a).then((D) => y.setState(D, !0));
  }, x = () => g().catch((D) => {
    if (a.connected)
      throw D;
  }), _ = () => {
    if (p !== void 0) {
      clearTimeout(p), p = void 0;
      return;
    }
    u && (m = u(a, y)), r && (a.addEventListener("ready", x), x()), a.addEventListener("disconnected", T);
  }, S = () => {
    p = void 0, m && m.then((D) => {
      D();
    }), y.clearState(), a.removeEventListener("ready", g), a.removeEventListener("disconnected", T);
  }, j = () => {
    p = setTimeout(S, r3);
  }, T = () => {
    p && (clearTimeout(p), S());
  };
  return a[s] = {
    get state() {
      return y.state;
    },
    refresh: g,
    subscribe(D) {
      d++, d === 1 && _();
      const U = y.subscribe(D);
      return y.state !== void 0 && setTimeout(() => D(y.state), 0), () => {
        U(), d--, d || (f.unsubGrace ? j() : S());
      };
    }
  }, a[s];
}, c3 = (a) => a.sendMessagePromise(J5()), y3 = (a, s, r, u, f, d) => a.sendMessagePromise($5(s, r, u, f, d));
function u3(a, s) {
  const r = Object.assign({}, a.state);
  if (s.a)
    for (const u in s.a) {
      const f = s.a[u];
      let d = new Date(f.lc * 1e3).toISOString();
      r[u] = {
        entity_id: u,
        state: f.s,
        attributes: f.a,
        context: typeof f.c == "string" ? { id: f.c, parent_id: null, user_id: null } : f.c,
        last_changed: d,
        last_updated: f.lu ? new Date(f.lu * 1e3).toISOString() : d
      };
    }
  if (s.r)
    for (const u of s.r)
      delete r[u];
  if (s.c)
    for (const u in s.c) {
      let f = r[u];
      if (!f) {
        console.warn("Received state update for unknown entity", u);
        continue;
      }
      f = Object.assign({}, f);
      const { "+": d, "-": m } = s.c[u], p = (d == null ? void 0 : d.a) || (m == null ? void 0 : m.a), y = p ? Object.assign({}, f.attributes) : f.attributes;
      if (d && (d.s !== void 0 && (f.state = d.s), d.c && (typeof d.c == "string" ? f.context = Object.assign(Object.assign({}, f.context), { id: d.c }) : f.context = Object.assign(Object.assign({}, f.context), d.c)), d.lc ? f.last_updated = f.last_changed = new Date(d.lc * 1e3).toISOString() : d.lu && (f.last_updated = new Date(d.lu * 1e3).toISOString()), d.a && Object.assign(y, d.a)), m != null && m.a)
        for (const g of m.a)
          delete y[g];
      p && (f.attributes = y), r[u] = f;
    }
  a.setState(r, !0);
}
const o3 = (a, s) => a.subscribeMessage((r) => u3(s, r), {
  type: "subscribe_entities"
});
function f3(a, s) {
  const r = a.state;
  if (r === void 0)
    return;
  const { entity_id: u, new_state: f } = s.data;
  if (f)
    a.setState({ [f.entity_id]: f });
  else {
    const d = Object.assign({}, r);
    delete d[u], a.setState(d, !0);
  }
}
async function d3(a) {
  const s = await c3(a), r = {};
  for (let u = 0; u < s.length; u++) {
    const f = s[u];
    r[f.entity_id] = f;
  }
  return r;
}
const h3 = (a, s) => a.subscribeEvents((r) => f3(s, r), "state_changed"), m3 = (a) => gg(a.haVersion, 2022, 4, 0) ? lp(a, "_ent", void 0, o3) : lp(a, "_ent", d3, h3), v3 = (a, s) => m3(a).subscribe(s);
async function x3(a) {
  const s = Object.assign({ setupRetry: 0, createSocket: t3 }, a), r = await s.createSocket(s);
  return new n3(r, s);
}
function _3(a) {
  const s = Yy.createRoot(a);
  return s.render(/* @__PURE__ */ o.jsx(G5, {})), () => s.unmount();
}
export {
  y3 as callService,
  x3 as createConnection,
  g3 as createLongLivedTokenAuth,
  _3 as mount,
  v3 as subscribeEntities
};
