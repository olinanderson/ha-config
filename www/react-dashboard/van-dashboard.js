var Zg = Object.defineProperty;
var Kg = (c, r, f) => r in c ? Zg(c, r, { enumerable: !0, configurable: !0, writable: !0, value: f }) : c[r] = f;
var ks = (c, r, f) => Kg(c, typeof r != "symbol" ? r + "" : r, f);
var mr = { exports: {} }, xu = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Cm;
function Jg() {
  if (Cm) return xu;
  Cm = 1;
  var c = Symbol.for("react.transitional.element"), r = Symbol.for("react.fragment");
  function f(o, m, h) {
    var g = null;
    if (h !== void 0 && (g = "" + h), m.key !== void 0 && (g = "" + m.key), "key" in m) {
      h = {};
      for (var y in m)
        y !== "key" && (h[y] = m[y]);
    } else h = m;
    return m = h.ref, {
      $$typeof: c,
      type: o,
      key: g,
      ref: m !== void 0 ? m : null,
      props: h
    };
  }
  return xu.Fragment = r, xu.jsx = f, xu.jsxs = f, xu;
}
var Om;
function Wg() {
  return Om || (Om = 1, mr.exports = Jg()), mr.exports;
}
var s = Wg(), hr = { exports: {} }, _u = {}, gr = { exports: {} }, vr = {};
/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Dm;
function $g() {
  return Dm || (Dm = 1, (function(c) {
    function r(T, q) {
      var ee = T.length;
      T.push(q);
      e: for (; 0 < ee; ) {
        var W = ee - 1 >>> 1, ce = T[W];
        if (0 < m(ce, q))
          T[W] = q, T[ee] = ce, ee = W;
        else break e;
      }
    }
    function f(T) {
      return T.length === 0 ? null : T[0];
    }
    function o(T) {
      if (T.length === 0) return null;
      var q = T[0], ee = T.pop();
      if (ee !== q) {
        T[0] = ee;
        e: for (var W = 0, ce = T.length, b = ce >>> 1; W < b; ) {
          var D = 2 * (W + 1) - 1, Y = T[D], Q = D + 1, ie = T[Q];
          if (0 > m(Y, ee))
            Q < ce && 0 > m(ie, Y) ? (T[W] = ie, T[Q] = ee, W = Q) : (T[W] = Y, T[D] = ee, W = D);
          else if (Q < ce && 0 > m(ie, ee))
            T[W] = ie, T[Q] = ee, W = Q;
          else break e;
        }
      }
      return q;
    }
    function m(T, q) {
      var ee = T.sortIndex - q.sortIndex;
      return ee !== 0 ? ee : T.id - q.id;
    }
    if (c.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
      var h = performance;
      c.unstable_now = function() {
        return h.now();
      };
    } else {
      var g = Date, y = g.now();
      c.unstable_now = function() {
        return g.now() - y;
      };
    }
    var _ = [], p = [], j = 1, z = null, B = 3, U = !1, L = !1, X = !1, Z = !1, F = typeof setTimeout == "function" ? setTimeout : null, fe = typeof clearTimeout == "function" ? clearTimeout : null, R = typeof setImmediate < "u" ? setImmediate : null;
    function te(T) {
      for (var q = f(p); q !== null; ) {
        if (q.callback === null) o(p);
        else if (q.startTime <= T)
          o(p), q.sortIndex = q.expirationTime, r(_, q);
        else break;
        q = f(p);
      }
    }
    function de(T) {
      if (X = !1, te(T), !L)
        if (f(_) !== null)
          L = !0, I || (I = !0, le());
        else {
          var q = f(p);
          q !== null && mt(de, q.startTime - T);
        }
    }
    var I = !1, J = -1, De = 5, we = -1;
    function nt() {
      return Z ? !0 : !(c.unstable_now() - we < De);
    }
    function Re() {
      if (Z = !1, I) {
        var T = c.unstable_now();
        we = T;
        var q = !0;
        try {
          e: {
            L = !1, X && (X = !1, fe(J), J = -1), U = !0;
            var ee = B;
            try {
              t: {
                for (te(T), z = f(_); z !== null && !(z.expirationTime > T && nt()); ) {
                  var W = z.callback;
                  if (typeof W == "function") {
                    z.callback = null, B = z.priorityLevel;
                    var ce = W(
                      z.expirationTime <= T
                    );
                    if (T = c.unstable_now(), typeof ce == "function") {
                      z.callback = ce, te(T), q = !0;
                      break t;
                    }
                    z === f(_) && o(_), te(T);
                  } else o(_);
                  z = f(_);
                }
                if (z !== null) q = !0;
                else {
                  var b = f(p);
                  b !== null && mt(
                    de,
                    b.startTime - T
                  ), q = !1;
                }
              }
              break e;
            } finally {
              z = null, B = ee, U = !1;
            }
            q = void 0;
          }
        } finally {
          q ? le() : I = !1;
        }
      }
    }
    var le;
    if (typeof R == "function")
      le = function() {
        R(Re);
      };
    else if (typeof MessageChannel < "u") {
      var dt = new MessageChannel(), tt = dt.port2;
      dt.port1.onmessage = Re, le = function() {
        tt.postMessage(null);
      };
    } else
      le = function() {
        F(Re, 0);
      };
    function mt(T, q) {
      J = F(function() {
        T(c.unstable_now());
      }, q);
    }
    c.unstable_IdlePriority = 5, c.unstable_ImmediatePriority = 1, c.unstable_LowPriority = 4, c.unstable_NormalPriority = 3, c.unstable_Profiling = null, c.unstable_UserBlockingPriority = 2, c.unstable_cancelCallback = function(T) {
      T.callback = null;
    }, c.unstable_forceFrameRate = function(T) {
      0 > T || 125 < T ? console.error(
        "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
      ) : De = 0 < T ? Math.floor(1e3 / T) : 5;
    }, c.unstable_getCurrentPriorityLevel = function() {
      return B;
    }, c.unstable_next = function(T) {
      switch (B) {
        case 1:
        case 2:
        case 3:
          var q = 3;
          break;
        default:
          q = B;
      }
      var ee = B;
      B = q;
      try {
        return T();
      } finally {
        B = ee;
      }
    }, c.unstable_requestPaint = function() {
      Z = !0;
    }, c.unstable_runWithPriority = function(T, q) {
      switch (T) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          T = 3;
      }
      var ee = B;
      B = T;
      try {
        return q();
      } finally {
        B = ee;
      }
    }, c.unstable_scheduleCallback = function(T, q, ee) {
      var W = c.unstable_now();
      switch (typeof ee == "object" && ee !== null ? (ee = ee.delay, ee = typeof ee == "number" && 0 < ee ? W + ee : W) : ee = W, T) {
        case 1:
          var ce = -1;
          break;
        case 2:
          ce = 250;
          break;
        case 5:
          ce = 1073741823;
          break;
        case 4:
          ce = 1e4;
          break;
        default:
          ce = 5e3;
      }
      return ce = ee + ce, T = {
        id: j++,
        callback: q,
        priorityLevel: T,
        startTime: ee,
        expirationTime: ce,
        sortIndex: -1
      }, ee > W ? (T.sortIndex = ee, r(p, T), f(_) === null && T === f(p) && (X ? (fe(J), J = -1) : X = !0, mt(de, ee - W))) : (T.sortIndex = ce, r(_, T), L || U || (L = !0, I || (I = !0, le()))), T;
    }, c.unstable_shouldYield = nt, c.unstable_wrapCallback = function(T) {
      var q = B;
      return function() {
        var ee = B;
        B = q;
        try {
          return T.apply(this, arguments);
        } finally {
          B = ee;
        }
      };
    };
  })(vr)), vr;
}
var Rm;
function Fg() {
  return Rm || (Rm = 1, gr.exports = $g()), gr.exports;
}
var pr = { exports: {} }, re = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Um;
function Ig() {
  if (Um) return re;
  Um = 1;
  var c = Symbol.for("react.transitional.element"), r = Symbol.for("react.portal"), f = Symbol.for("react.fragment"), o = Symbol.for("react.strict_mode"), m = Symbol.for("react.profiler"), h = Symbol.for("react.consumer"), g = Symbol.for("react.context"), y = Symbol.for("react.forward_ref"), _ = Symbol.for("react.suspense"), p = Symbol.for("react.memo"), j = Symbol.for("react.lazy"), z = Symbol.for("react.activity"), B = Symbol.iterator;
  function U(b) {
    return b === null || typeof b != "object" ? null : (b = B && b[B] || b["@@iterator"], typeof b == "function" ? b : null);
  }
  var L = {
    isMounted: function() {
      return !1;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, X = Object.assign, Z = {};
  function F(b, D, Y) {
    this.props = b, this.context = D, this.refs = Z, this.updater = Y || L;
  }
  F.prototype.isReactComponent = {}, F.prototype.setState = function(b, D) {
    if (typeof b != "object" && typeof b != "function" && b != null)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, b, D, "setState");
  }, F.prototype.forceUpdate = function(b) {
    this.updater.enqueueForceUpdate(this, b, "forceUpdate");
  };
  function fe() {
  }
  fe.prototype = F.prototype;
  function R(b, D, Y) {
    this.props = b, this.context = D, this.refs = Z, this.updater = Y || L;
  }
  var te = R.prototype = new fe();
  te.constructor = R, X(te, F.prototype), te.isPureReactComponent = !0;
  var de = Array.isArray;
  function I() {
  }
  var J = { H: null, A: null, T: null, S: null }, De = Object.prototype.hasOwnProperty;
  function we(b, D, Y) {
    var Q = Y.ref;
    return {
      $$typeof: c,
      type: b,
      key: D,
      ref: Q !== void 0 ? Q : null,
      props: Y
    };
  }
  function nt(b, D) {
    return we(b.type, D, b.props);
  }
  function Re(b) {
    return typeof b == "object" && b !== null && b.$$typeof === c;
  }
  function le(b) {
    var D = { "=": "=0", ":": "=2" };
    return "$" + b.replace(/[=:]/g, function(Y) {
      return D[Y];
    });
  }
  var dt = /\/+/g;
  function tt(b, D) {
    return typeof b == "object" && b !== null && b.key != null ? le("" + b.key) : D.toString(36);
  }
  function mt(b) {
    switch (b.status) {
      case "fulfilled":
        return b.value;
      case "rejected":
        throw b.reason;
      default:
        switch (typeof b.status == "string" ? b.then(I, I) : (b.status = "pending", b.then(
          function(D) {
            b.status === "pending" && (b.status = "fulfilled", b.value = D);
          },
          function(D) {
            b.status === "pending" && (b.status = "rejected", b.reason = D);
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
  function T(b, D, Y, Q, ie) {
    var k = typeof b;
    (k === "undefined" || k === "boolean") && (b = null);
    var ne = !1;
    if (b === null) ne = !0;
    else
      switch (k) {
        case "bigint":
        case "string":
        case "number":
          ne = !0;
          break;
        case "object":
          switch (b.$$typeof) {
            case c:
            case r:
              ne = !0;
              break;
            case j:
              return ne = b._init, T(
                ne(b._payload),
                D,
                Y,
                Q,
                ie
              );
          }
      }
    if (ne)
      return ie = ie(b), ne = Q === "" ? "." + tt(b, 0) : Q, de(ie) ? (Y = "", ne != null && (Y = ne.replace(dt, "$&/") + "/"), T(ie, D, Y, "", function(pt) {
        return pt;
      })) : ie != null && (Re(ie) && (ie = nt(
        ie,
        Y + (ie.key == null || b && b.key === ie.key ? "" : ("" + ie.key).replace(
          dt,
          "$&/"
        ) + "/") + ne
      )), D.push(ie)), 1;
    ne = 0;
    var ye = Q === "" ? "." : Q + ":";
    if (de(b))
      for (var Me = 0; Me < b.length; Me++)
        Q = b[Me], k = ye + tt(Q, Me), ne += T(
          Q,
          D,
          Y,
          k,
          ie
        );
    else if (Me = U(b), typeof Me == "function")
      for (b = Me.call(b), Me = 0; !(Q = b.next()).done; )
        Q = Q.value, k = ye + tt(Q, Me++), ne += T(
          Q,
          D,
          Y,
          k,
          ie
        );
    else if (k === "object") {
      if (typeof b.then == "function")
        return T(
          mt(b),
          D,
          Y,
          Q,
          ie
        );
      throw D = String(b), Error(
        "Objects are not valid as a React child (found: " + (D === "[object Object]" ? "object with keys {" + Object.keys(b).join(", ") + "}" : D) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return ne;
  }
  function q(b, D, Y) {
    if (b == null) return b;
    var Q = [], ie = 0;
    return T(b, Q, "", "", function(k) {
      return D.call(Y, k, ie++);
    }), Q;
  }
  function ee(b) {
    if (b._status === -1) {
      var D = b._result;
      D = D(), D.then(
        function(Y) {
          (b._status === 0 || b._status === -1) && (b._status = 1, b._result = Y);
        },
        function(Y) {
          (b._status === 0 || b._status === -1) && (b._status = 2, b._result = Y);
        }
      ), b._status === -1 && (b._status = 0, b._result = D);
    }
    if (b._status === 1) return b._result.default;
    throw b._result;
  }
  var W = typeof reportError == "function" ? reportError : function(b) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var D = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof b == "object" && b !== null && typeof b.message == "string" ? String(b.message) : String(b),
        error: b
      });
      if (!window.dispatchEvent(D)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", b);
      return;
    }
    console.error(b);
  }, ce = {
    map: q,
    forEach: function(b, D, Y) {
      q(
        b,
        function() {
          D.apply(this, arguments);
        },
        Y
      );
    },
    count: function(b) {
      var D = 0;
      return q(b, function() {
        D++;
      }), D;
    },
    toArray: function(b) {
      return q(b, function(D) {
        return D;
      }) || [];
    },
    only: function(b) {
      if (!Re(b))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return b;
    }
  };
  return re.Activity = z, re.Children = ce, re.Component = F, re.Fragment = f, re.Profiler = m, re.PureComponent = R, re.StrictMode = o, re.Suspense = _, re.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = J, re.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(b) {
      return J.H.useMemoCache(b);
    }
  }, re.cache = function(b) {
    return function() {
      return b.apply(null, arguments);
    };
  }, re.cacheSignal = function() {
    return null;
  }, re.cloneElement = function(b, D, Y) {
    if (b == null)
      throw Error(
        "The argument must be a React element, but you passed " + b + "."
      );
    var Q = X({}, b.props), ie = b.key;
    if (D != null)
      for (k in D.key !== void 0 && (ie = "" + D.key), D)
        !De.call(D, k) || k === "key" || k === "__self" || k === "__source" || k === "ref" && D.ref === void 0 || (Q[k] = D[k]);
    var k = arguments.length - 2;
    if (k === 1) Q.children = Y;
    else if (1 < k) {
      for (var ne = Array(k), ye = 0; ye < k; ye++)
        ne[ye] = arguments[ye + 2];
      Q.children = ne;
    }
    return we(b.type, ie, Q);
  }, re.createContext = function(b) {
    return b = {
      $$typeof: g,
      _currentValue: b,
      _currentValue2: b,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    }, b.Provider = b, b.Consumer = {
      $$typeof: h,
      _context: b
    }, b;
  }, re.createElement = function(b, D, Y) {
    var Q, ie = {}, k = null;
    if (D != null)
      for (Q in D.key !== void 0 && (k = "" + D.key), D)
        De.call(D, Q) && Q !== "key" && Q !== "__self" && Q !== "__source" && (ie[Q] = D[Q]);
    var ne = arguments.length - 2;
    if (ne === 1) ie.children = Y;
    else if (1 < ne) {
      for (var ye = Array(ne), Me = 0; Me < ne; Me++)
        ye[Me] = arguments[Me + 2];
      ie.children = ye;
    }
    if (b && b.defaultProps)
      for (Q in ne = b.defaultProps, ne)
        ie[Q] === void 0 && (ie[Q] = ne[Q]);
    return we(b, k, ie);
  }, re.createRef = function() {
    return { current: null };
  }, re.forwardRef = function(b) {
    return { $$typeof: y, render: b };
  }, re.isValidElement = Re, re.lazy = function(b) {
    return {
      $$typeof: j,
      _payload: { _status: -1, _result: b },
      _init: ee
    };
  }, re.memo = function(b, D) {
    return {
      $$typeof: p,
      type: b,
      compare: D === void 0 ? null : D
    };
  }, re.startTransition = function(b) {
    var D = J.T, Y = {};
    J.T = Y;
    try {
      var Q = b(), ie = J.S;
      ie !== null && ie(Y, Q), typeof Q == "object" && Q !== null && typeof Q.then == "function" && Q.then(I, W);
    } catch (k) {
      W(k);
    } finally {
      D !== null && Y.types !== null && (D.types = Y.types), J.T = D;
    }
  }, re.unstable_useCacheRefresh = function() {
    return J.H.useCacheRefresh();
  }, re.use = function(b) {
    return J.H.use(b);
  }, re.useActionState = function(b, D, Y) {
    return J.H.useActionState(b, D, Y);
  }, re.useCallback = function(b, D) {
    return J.H.useCallback(b, D);
  }, re.useContext = function(b) {
    return J.H.useContext(b);
  }, re.useDebugValue = function() {
  }, re.useDeferredValue = function(b, D) {
    return J.H.useDeferredValue(b, D);
  }, re.useEffect = function(b, D) {
    return J.H.useEffect(b, D);
  }, re.useEffectEvent = function(b) {
    return J.H.useEffectEvent(b);
  }, re.useId = function() {
    return J.H.useId();
  }, re.useImperativeHandle = function(b, D, Y) {
    return J.H.useImperativeHandle(b, D, Y);
  }, re.useInsertionEffect = function(b, D) {
    return J.H.useInsertionEffect(b, D);
  }, re.useLayoutEffect = function(b, D) {
    return J.H.useLayoutEffect(b, D);
  }, re.useMemo = function(b, D) {
    return J.H.useMemo(b, D);
  }, re.useOptimistic = function(b, D) {
    return J.H.useOptimistic(b, D);
  }, re.useReducer = function(b, D, Y) {
    return J.H.useReducer(b, D, Y);
  }, re.useRef = function(b) {
    return J.H.useRef(b);
  }, re.useState = function(b) {
    return J.H.useState(b);
  }, re.useSyncExternalStore = function(b, D, Y) {
    return J.H.useSyncExternalStore(
      b,
      D,
      Y
    );
  }, re.useTransition = function() {
    return J.H.useTransition();
  }, re.version = "19.2.5", re;
}
var Hm;
function Er() {
  return Hm || (Hm = 1, pr.exports = Ig()), pr.exports;
}
var yr = { exports: {} }, wt = {};
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Bm;
function Pg() {
  if (Bm) return wt;
  Bm = 1;
  var c = Er();
  function r(_) {
    var p = "https://react.dev/errors/" + _;
    if (1 < arguments.length) {
      p += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var j = 2; j < arguments.length; j++)
        p += "&args[]=" + encodeURIComponent(arguments[j]);
    }
    return "Minified React error #" + _ + "; visit " + p + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function f() {
  }
  var o = {
    d: {
      f,
      r: function() {
        throw Error(r(522));
      },
      D: f,
      C: f,
      L: f,
      m: f,
      X: f,
      S: f,
      M: f
    },
    p: 0,
    findDOMNode: null
  }, m = Symbol.for("react.portal");
  function h(_, p, j) {
    var z = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: m,
      key: z == null ? null : "" + z,
      children: _,
      containerInfo: p,
      implementation: j
    };
  }
  var g = c.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function y(_, p) {
    if (_ === "font") return "";
    if (typeof p == "string")
      return p === "use-credentials" ? p : "";
  }
  return wt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = o, wt.createPortal = function(_, p) {
    var j = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!p || p.nodeType !== 1 && p.nodeType !== 9 && p.nodeType !== 11)
      throw Error(r(299));
    return h(_, p, null, j);
  }, wt.flushSync = function(_) {
    var p = g.T, j = o.p;
    try {
      if (g.T = null, o.p = 2, _) return _();
    } finally {
      g.T = p, o.p = j, o.d.f();
    }
  }, wt.preconnect = function(_, p) {
    typeof _ == "string" && (p ? (p = p.crossOrigin, p = typeof p == "string" ? p === "use-credentials" ? p : "" : void 0) : p = null, o.d.C(_, p));
  }, wt.prefetchDNS = function(_) {
    typeof _ == "string" && o.d.D(_);
  }, wt.preinit = function(_, p) {
    if (typeof _ == "string" && p && typeof p.as == "string") {
      var j = p.as, z = y(j, p.crossOrigin), B = typeof p.integrity == "string" ? p.integrity : void 0, U = typeof p.fetchPriority == "string" ? p.fetchPriority : void 0;
      j === "style" ? o.d.S(
        _,
        typeof p.precedence == "string" ? p.precedence : void 0,
        {
          crossOrigin: z,
          integrity: B,
          fetchPriority: U
        }
      ) : j === "script" && o.d.X(_, {
        crossOrigin: z,
        integrity: B,
        fetchPriority: U,
        nonce: typeof p.nonce == "string" ? p.nonce : void 0
      });
    }
  }, wt.preinitModule = function(_, p) {
    if (typeof _ == "string")
      if (typeof p == "object" && p !== null) {
        if (p.as == null || p.as === "script") {
          var j = y(
            p.as,
            p.crossOrigin
          );
          o.d.M(_, {
            crossOrigin: j,
            integrity: typeof p.integrity == "string" ? p.integrity : void 0,
            nonce: typeof p.nonce == "string" ? p.nonce : void 0
          });
        }
      } else p == null && o.d.M(_);
  }, wt.preload = function(_, p) {
    if (typeof _ == "string" && typeof p == "object" && p !== null && typeof p.as == "string") {
      var j = p.as, z = y(j, p.crossOrigin);
      o.d.L(_, j, {
        crossOrigin: z,
        integrity: typeof p.integrity == "string" ? p.integrity : void 0,
        nonce: typeof p.nonce == "string" ? p.nonce : void 0,
        type: typeof p.type == "string" ? p.type : void 0,
        fetchPriority: typeof p.fetchPriority == "string" ? p.fetchPriority : void 0,
        referrerPolicy: typeof p.referrerPolicy == "string" ? p.referrerPolicy : void 0,
        imageSrcSet: typeof p.imageSrcSet == "string" ? p.imageSrcSet : void 0,
        imageSizes: typeof p.imageSizes == "string" ? p.imageSizes : void 0,
        media: typeof p.media == "string" ? p.media : void 0
      });
    }
  }, wt.preloadModule = function(_, p) {
    if (typeof _ == "string")
      if (p) {
        var j = y(p.as, p.crossOrigin);
        o.d.m(_, {
          as: typeof p.as == "string" && p.as !== "script" ? p.as : void 0,
          crossOrigin: j,
          integrity: typeof p.integrity == "string" ? p.integrity : void 0
        });
      } else o.d.m(_);
  }, wt.requestFormReset = function(_) {
    o.d.r(_);
  }, wt.unstable_batchedUpdates = function(_, p) {
    return _(p);
  }, wt.useFormState = function(_, p, j) {
    return g.H.useFormState(_, p, j);
  }, wt.useFormStatus = function() {
    return g.H.useHostTransitionStatus();
  }, wt.version = "19.2.5", wt;
}
var qm;
function ev() {
  if (qm) return yr.exports;
  qm = 1;
  function c() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(c);
      } catch (r) {
        console.error(r);
      }
  }
  return c(), yr.exports = Pg(), yr.exports;
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
var km;
function tv() {
  if (km) return _u;
  km = 1;
  var c = Fg(), r = Er(), f = ev();
  function o(e) {
    var t = "https://react.dev/errors/" + e;
    if (1 < arguments.length) {
      t += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var l = 2; l < arguments.length; l++)
        t += "&args[]=" + encodeURIComponent(arguments[l]);
    }
    return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function m(e) {
    return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
  }
  function h(e) {
    var t = e, l = e;
    if (e.alternate) for (; t.return; ) t = t.return;
    else {
      e = t;
      do
        t = e, (t.flags & 4098) !== 0 && (l = t.return), e = t.return;
      while (e);
    }
    return t.tag === 3 ? l : null;
  }
  function g(e) {
    if (e.tag === 13) {
      var t = e.memoizedState;
      if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
    }
    return null;
  }
  function y(e) {
    if (e.tag === 31) {
      var t = e.memoizedState;
      if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
    }
    return null;
  }
  function _(e) {
    if (h(e) !== e)
      throw Error(o(188));
  }
  function p(e) {
    var t = e.alternate;
    if (!t) {
      if (t = h(e), t === null) throw Error(o(188));
      return t !== e ? null : e;
    }
    for (var l = e, a = t; ; ) {
      var n = l.return;
      if (n === null) break;
      var u = n.alternate;
      if (u === null) {
        if (a = n.return, a !== null) {
          l = a;
          continue;
        }
        break;
      }
      if (n.child === u.child) {
        for (u = n.child; u; ) {
          if (u === l) return _(n), e;
          if (u === a) return _(n), t;
          u = u.sibling;
        }
        throw Error(o(188));
      }
      if (l.return !== a.return) l = n, a = u;
      else {
        for (var i = !1, d = n.child; d; ) {
          if (d === l) {
            i = !0, l = n, a = u;
            break;
          }
          if (d === a) {
            i = !0, a = n, l = u;
            break;
          }
          d = d.sibling;
        }
        if (!i) {
          for (d = u.child; d; ) {
            if (d === l) {
              i = !0, l = u, a = n;
              break;
            }
            if (d === a) {
              i = !0, a = u, l = n;
              break;
            }
            d = d.sibling;
          }
          if (!i) throw Error(o(189));
        }
      }
      if (l.alternate !== a) throw Error(o(190));
    }
    if (l.tag !== 3) throw Error(o(188));
    return l.stateNode.current === l ? e : t;
  }
  function j(e) {
    var t = e.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return e;
    for (e = e.child; e !== null; ) {
      if (t = j(e), t !== null) return t;
      e = e.sibling;
    }
    return null;
  }
  var z = Object.assign, B = Symbol.for("react.element"), U = Symbol.for("react.transitional.element"), L = Symbol.for("react.portal"), X = Symbol.for("react.fragment"), Z = Symbol.for("react.strict_mode"), F = Symbol.for("react.profiler"), fe = Symbol.for("react.consumer"), R = Symbol.for("react.context"), te = Symbol.for("react.forward_ref"), de = Symbol.for("react.suspense"), I = Symbol.for("react.suspense_list"), J = Symbol.for("react.memo"), De = Symbol.for("react.lazy"), we = Symbol.for("react.activity"), nt = Symbol.for("react.memo_cache_sentinel"), Re = Symbol.iterator;
  function le(e) {
    return e === null || typeof e != "object" ? null : (e = Re && e[Re] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var dt = Symbol.for("react.client.reference");
  function tt(e) {
    if (e == null) return null;
    if (typeof e == "function")
      return e.$$typeof === dt ? null : e.displayName || e.name || null;
    if (typeof e == "string") return e;
    switch (e) {
      case X:
        return "Fragment";
      case F:
        return "Profiler";
      case Z:
        return "StrictMode";
      case de:
        return "Suspense";
      case I:
        return "SuspenseList";
      case we:
        return "Activity";
    }
    if (typeof e == "object")
      switch (e.$$typeof) {
        case L:
          return "Portal";
        case R:
          return e.displayName || "Context";
        case fe:
          return (e._context.displayName || "Context") + ".Consumer";
        case te:
          var t = e.render;
          return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
        case J:
          return t = e.displayName || null, t !== null ? t : tt(e.type) || "Memo";
        case De:
          t = e._payload, e = e._init;
          try {
            return tt(e(t));
          } catch {
          }
      }
    return null;
  }
  var mt = Array.isArray, T = r.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, q = f.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, ee = {
    pending: !1,
    data: null,
    method: null,
    action: null
  }, W = [], ce = -1;
  function b(e) {
    return { current: e };
  }
  function D(e) {
    0 > ce || (e.current = W[ce], W[ce] = null, ce--);
  }
  function Y(e, t) {
    ce++, W[ce] = e.current, e.current = t;
  }
  var Q = b(null), ie = b(null), k = b(null), ne = b(null);
  function ye(e, t) {
    switch (Y(k, t), Y(ie, e), Y(Q, null), t.nodeType) {
      case 9:
      case 11:
        e = (e = t.documentElement) && (e = e.namespaceURI) ? em(e) : 0;
        break;
      default:
        if (e = t.tagName, t = t.namespaceURI)
          t = em(t), e = tm(t, e);
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
    D(Q), Y(Q, e);
  }
  function Me() {
    D(Q), D(ie), D(k);
  }
  function pt(e) {
    e.memoizedState !== null && Y(ne, e);
    var t = Q.current, l = tm(t, e.type);
    t !== l && (Y(ie, e), Y(Q, l));
  }
  function Le(e) {
    ie.current === e && (D(Q), D(ie)), ne.current === e && (D(ne), vu._currentValue = ee);
  }
  var Ee, Qe;
  function Ke(e) {
    if (Ee === void 0)
      try {
        throw Error();
      } catch (l) {
        var t = l.stack.trim().match(/\n( *(at )?)/);
        Ee = t && t[1] || "", Qe = -1 < l.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < l.stack.indexOf("@") ? "@unknown:0:0" : "";
      }
    return `
` + Ee + e + Qe;
  }
  var ct = !1;
  function Ot(e, t) {
    if (!e || ct) return "";
    ct = !0;
    var l = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      var a = {
        DetermineComponentFrameRoot: function() {
          try {
            if (t) {
              var O = function() {
                throw Error();
              };
              if (Object.defineProperty(O.prototype, "props", {
                set: function() {
                  throw Error();
                }
              }), typeof Reflect == "object" && Reflect.construct) {
                try {
                  Reflect.construct(O, []);
                } catch (E) {
                  var w = E;
                }
                Reflect.construct(e, [], O);
              } else {
                try {
                  O.call();
                } catch (E) {
                  w = E;
                }
                e.call(O.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (E) {
                w = E;
              }
              (O = e()) && typeof O.catch == "function" && O.catch(function() {
              });
            }
          } catch (E) {
            if (E && w && typeof E.stack == "string")
              return [E.stack, w.stack];
          }
          return [null, null];
        }
      };
      a.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
      var n = Object.getOwnPropertyDescriptor(
        a.DetermineComponentFrameRoot,
        "name"
      );
      n && n.configurable && Object.defineProperty(
        a.DetermineComponentFrameRoot,
        "name",
        { value: "DetermineComponentFrameRoot" }
      );
      var u = a.DetermineComponentFrameRoot(), i = u[0], d = u[1];
      if (i && d) {
        var v = i.split(`
`), M = d.split(`
`);
        for (n = a = 0; a < v.length && !v[a].includes("DetermineComponentFrameRoot"); )
          a++;
        for (; n < M.length && !M[n].includes(
          "DetermineComponentFrameRoot"
        ); )
          n++;
        if (a === v.length || n === M.length)
          for (a = v.length - 1, n = M.length - 1; 1 <= a && 0 <= n && v[a] !== M[n]; )
            n--;
        for (; 1 <= a && 0 <= n; a--, n--)
          if (v[a] !== M[n]) {
            if (a !== 1 || n !== 1)
              do
                if (a--, n--, 0 > n || v[a] !== M[n]) {
                  var A = `
` + v[a].replace(" at new ", " at ");
                  return e.displayName && A.includes("<anonymous>") && (A = A.replace("<anonymous>", e.displayName)), A;
                }
              while (1 <= a && 0 <= n);
            break;
          }
      }
    } finally {
      ct = !1, Error.prepareStackTrace = l;
    }
    return (l = e ? e.displayName || e.name : "") ? Ke(l) : "";
  }
  function Ft(e, t) {
    switch (e.tag) {
      case 26:
      case 27:
      case 5:
        return Ke(e.type);
      case 16:
        return Ke("Lazy");
      case 13:
        return e.child !== t && t !== null ? Ke("Suspense Fallback") : Ke("Suspense");
      case 19:
        return Ke("SuspenseList");
      case 0:
      case 15:
        return Ot(e.type, !1);
      case 11:
        return Ot(e.type.render, !1);
      case 1:
        return Ot(e.type, !0);
      case 31:
        return Ke("Activity");
      default:
        return "";
    }
  }
  function It(e) {
    try {
      var t = "", l = null;
      do
        t += Ft(e, l), l = e, e = e.return;
      while (e);
      return t;
    } catch (a) {
      return `
Error generating stack: ` + a.message + `
` + a.stack;
    }
  }
  var yt = Object.prototype.hasOwnProperty, P = c.unstable_scheduleCallback, Ye = c.unstable_cancelCallback, Et = c.unstable_shouldYield, Lt = c.unstable_requestPaint, Te = c.unstable_now, Fe = c.unstable_getCurrentPriorityLevel, bt = c.unstable_ImmediatePriority, dl = c.unstable_UserBlockingPriority, Pt = c.unstable_NormalPriority, Sl = c.unstable_LowPriority, xt = c.unstable_IdlePriority, Yt = c.log, be = c.unstable_setDisableYieldValue, Ze = null, Ce = null;
  function Gt(e) {
    if (typeof Yt == "function" && be(e), Ce && typeof Ce.setStrictMode == "function")
      try {
        Ce.setStrictMode(Ze, e);
      } catch {
      }
  }
  var Tt = Math.clz32 ? Math.clz32 : En, ec = Math.log, wu = Math.LN2;
  function En(e) {
    return e >>>= 0, e === 0 ? 32 : 31 - (ec(e) / wu | 0) | 0;
  }
  var Tn = 256, va = 262144, pa = 4194304;
  function zt(e) {
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
  function el(e, t, l) {
    var a = e.pendingLanes;
    if (a === 0) return 0;
    var n = 0, u = e.suspendedLanes, i = e.pingedLanes;
    e = e.warmLanes;
    var d = a & 134217727;
    return d !== 0 ? (a = d & ~u, a !== 0 ? n = zt(a) : (i &= d, i !== 0 ? n = zt(i) : l || (l = d & ~e, l !== 0 && (n = zt(l))))) : (d = a & ~u, d !== 0 ? n = zt(d) : i !== 0 ? n = zt(i) : l || (l = a & ~e, l !== 0 && (n = zt(l)))), n === 0 ? 0 : t !== 0 && t !== n && (t & u) === 0 && (u = n & -n, l = t & -t, u >= l || u === 32 && (l & 4194048) !== 0) ? t : n;
  }
  function zn(e, t) {
    return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
  }
  function Dh(e, t) {
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
  function Dr() {
    var e = pa;
    return pa <<= 1, (pa & 62914560) === 0 && (pa = 4194304), e;
  }
  function tc(e) {
    for (var t = [], l = 0; 31 > l; l++) t.push(e);
    return t;
  }
  function An(e, t) {
    e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
  }
  function Rh(e, t, l, a, n, u) {
    var i = e.pendingLanes;
    e.pendingLanes = l, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= l, e.entangledLanes &= l, e.errorRecoveryDisabledLanes &= l, e.shellSuspendCounter = 0;
    var d = e.entanglements, v = e.expirationTimes, M = e.hiddenUpdates;
    for (l = i & ~l; 0 < l; ) {
      var A = 31 - Tt(l), O = 1 << A;
      d[A] = 0, v[A] = -1;
      var w = M[A];
      if (w !== null)
        for (M[A] = null, A = 0; A < w.length; A++) {
          var E = w[A];
          E !== null && (E.lane &= -536870913);
        }
      l &= ~O;
    }
    a !== 0 && Rr(e, a, 0), u !== 0 && n === 0 && e.tag !== 0 && (e.suspendedLanes |= u & ~(i & ~t));
  }
  function Rr(e, t, l) {
    e.pendingLanes |= t, e.suspendedLanes &= ~t;
    var a = 31 - Tt(t);
    e.entangledLanes |= t, e.entanglements[a] = e.entanglements[a] | 1073741824 | l & 261930;
  }
  function Ur(e, t) {
    var l = e.entangledLanes |= t;
    for (e = e.entanglements; l; ) {
      var a = 31 - Tt(l), n = 1 << a;
      n & t | e[a] & t && (e[a] |= t), l &= ~n;
    }
  }
  function Hr(e, t) {
    var l = t & -t;
    return l = (l & 42) !== 0 ? 1 : lc(l), (l & (e.suspendedLanes | t)) !== 0 ? 0 : l;
  }
  function lc(e) {
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
  function ac(e) {
    return e &= -e, 2 < e ? 8 < e ? (e & 134217727) !== 0 ? 32 : 268435456 : 8 : 2;
  }
  function Br() {
    var e = q.p;
    return e !== 0 ? e : (e = window.event, e === void 0 ? 32 : Nm(e.type));
  }
  function qr(e, t) {
    var l = q.p;
    try {
      return q.p = e, t();
    } finally {
      q.p = l;
    }
  }
  var Xl = Math.random().toString(36).slice(2), _t = "__reactFiber$" + Xl, Dt = "__reactProps$" + Xl, Ba = "__reactContainer$" + Xl, nc = "__reactEvents$" + Xl, Uh = "__reactListeners$" + Xl, Hh = "__reactHandles$" + Xl, kr = "__reactResources$" + Xl, Cn = "__reactMarker$" + Xl;
  function uc(e) {
    delete e[_t], delete e[Dt], delete e[nc], delete e[Uh], delete e[Hh];
  }
  function qa(e) {
    var t = e[_t];
    if (t) return t;
    for (var l = e.parentNode; l; ) {
      if (t = l[Ba] || l[_t]) {
        if (l = t.alternate, t.child !== null || l !== null && l.child !== null)
          for (e = im(e); e !== null; ) {
            if (l = e[_t]) return l;
            e = im(e);
          }
        return t;
      }
      e = l, l = e.parentNode;
    }
    return null;
  }
  function ka(e) {
    if (e = e[_t] || e[Ba]) {
      var t = e.tag;
      if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3)
        return e;
    }
    return null;
  }
  function On(e) {
    var t = e.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
    throw Error(o(33));
  }
  function La(e) {
    var t = e[kr];
    return t || (t = e[kr] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() }), t;
  }
  function gt(e) {
    e[Cn] = !0;
  }
  var Lr = /* @__PURE__ */ new Set(), Yr = {};
  function ya(e, t) {
    Ya(e, t), Ya(e + "Capture", t);
  }
  function Ya(e, t) {
    for (Yr[e] = t, e = 0; e < t.length; e++)
      Lr.add(t[e]);
  }
  var Bh = RegExp(
    "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
  ), Gr = {}, Xr = {};
  function qh(e) {
    return yt.call(Xr, e) ? !0 : yt.call(Gr, e) ? !1 : Bh.test(e) ? Xr[e] = !0 : (Gr[e] = !0, !1);
  }
  function Eu(e, t, l) {
    if (qh(t))
      if (l === null) e.removeAttribute(t);
      else {
        switch (typeof l) {
          case "undefined":
          case "function":
          case "symbol":
            e.removeAttribute(t);
            return;
          case "boolean":
            var a = t.toLowerCase().slice(0, 5);
            if (a !== "data-" && a !== "aria-") {
              e.removeAttribute(t);
              return;
            }
        }
        e.setAttribute(t, "" + l);
      }
  }
  function Tu(e, t, l) {
    if (l === null) e.removeAttribute(t);
    else {
      switch (typeof l) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          e.removeAttribute(t);
          return;
      }
      e.setAttribute(t, "" + l);
    }
  }
  function jl(e, t, l, a) {
    if (a === null) e.removeAttribute(l);
    else {
      switch (typeof a) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          e.removeAttribute(l);
          return;
      }
      e.setAttributeNS(t, l, "" + a);
    }
  }
  function tl(e) {
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
  function Vr(e) {
    var t = e.type;
    return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
  }
  function kh(e, t, l) {
    var a = Object.getOwnPropertyDescriptor(
      e.constructor.prototype,
      t
    );
    if (!e.hasOwnProperty(t) && typeof a < "u" && typeof a.get == "function" && typeof a.set == "function") {
      var n = a.get, u = a.set;
      return Object.defineProperty(e, t, {
        configurable: !0,
        get: function() {
          return n.call(this);
        },
        set: function(i) {
          l = "" + i, u.call(this, i);
        }
      }), Object.defineProperty(e, t, {
        enumerable: a.enumerable
      }), {
        getValue: function() {
          return l;
        },
        setValue: function(i) {
          l = "" + i;
        },
        stopTracking: function() {
          e._valueTracker = null, delete e[t];
        }
      };
    }
  }
  function sc(e) {
    if (!e._valueTracker) {
      var t = Vr(e) ? "checked" : "value";
      e._valueTracker = kh(
        e,
        t,
        "" + e[t]
      );
    }
  }
  function Qr(e) {
    if (!e) return !1;
    var t = e._valueTracker;
    if (!t) return !0;
    var l = t.getValue(), a = "";
    return e && (a = Vr(e) ? e.checked ? "true" : "false" : e.value), e = a, e !== l ? (t.setValue(e), !0) : !1;
  }
  function zu(e) {
    if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
    try {
      return e.activeElement || e.body;
    } catch {
      return e.body;
    }
  }
  var Lh = /[\n"\\]/g;
  function ll(e) {
    return e.replace(
      Lh,
      function(t) {
        return "\\" + t.charCodeAt(0).toString(16) + " ";
      }
    );
  }
  function cc(e, t, l, a, n, u, i, d) {
    e.name = "", i != null && typeof i != "function" && typeof i != "symbol" && typeof i != "boolean" ? e.type = i : e.removeAttribute("type"), t != null ? i === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + tl(t)) : e.value !== "" + tl(t) && (e.value = "" + tl(t)) : i !== "submit" && i !== "reset" || e.removeAttribute("value"), t != null ? ic(e, i, tl(t)) : l != null ? ic(e, i, tl(l)) : a != null && e.removeAttribute("value"), n == null && u != null && (e.defaultChecked = !!u), n != null && (e.checked = n && typeof n != "function" && typeof n != "symbol"), d != null && typeof d != "function" && typeof d != "symbol" && typeof d != "boolean" ? e.name = "" + tl(d) : e.removeAttribute("name");
  }
  function Zr(e, t, l, a, n, u, i, d) {
    if (u != null && typeof u != "function" && typeof u != "symbol" && typeof u != "boolean" && (e.type = u), t != null || l != null) {
      if (!(u !== "submit" && u !== "reset" || t != null)) {
        sc(e);
        return;
      }
      l = l != null ? "" + tl(l) : "", t = t != null ? "" + tl(t) : l, d || t === e.value || (e.value = t), e.defaultValue = t;
    }
    a = a ?? n, a = typeof a != "function" && typeof a != "symbol" && !!a, e.checked = d ? e.checked : !!a, e.defaultChecked = !!a, i != null && typeof i != "function" && typeof i != "symbol" && typeof i != "boolean" && (e.name = i), sc(e);
  }
  function ic(e, t, l) {
    t === "number" && zu(e.ownerDocument) === e || e.defaultValue === "" + l || (e.defaultValue = "" + l);
  }
  function Ga(e, t, l, a) {
    if (e = e.options, t) {
      t = {};
      for (var n = 0; n < l.length; n++)
        t["$" + l[n]] = !0;
      for (l = 0; l < e.length; l++)
        n = t.hasOwnProperty("$" + e[l].value), e[l].selected !== n && (e[l].selected = n), n && a && (e[l].defaultSelected = !0);
    } else {
      for (l = "" + tl(l), t = null, n = 0; n < e.length; n++) {
        if (e[n].value === l) {
          e[n].selected = !0, a && (e[n].defaultSelected = !0);
          return;
        }
        t !== null || e[n].disabled || (t = e[n]);
      }
      t !== null && (t.selected = !0);
    }
  }
  function Kr(e, t, l) {
    if (t != null && (t = "" + tl(t), t !== e.value && (e.value = t), l == null)) {
      e.defaultValue !== t && (e.defaultValue = t);
      return;
    }
    e.defaultValue = l != null ? "" + tl(l) : "";
  }
  function Jr(e, t, l, a) {
    if (t == null) {
      if (a != null) {
        if (l != null) throw Error(o(92));
        if (mt(a)) {
          if (1 < a.length) throw Error(o(93));
          a = a[0];
        }
        l = a;
      }
      l == null && (l = ""), t = l;
    }
    l = tl(t), e.defaultValue = l, a = e.textContent, a === l && a !== "" && a !== null && (e.value = a), sc(e);
  }
  function Xa(e, t) {
    if (t) {
      var l = e.firstChild;
      if (l && l === e.lastChild && l.nodeType === 3) {
        l.nodeValue = t;
        return;
      }
    }
    e.textContent = t;
  }
  var Yh = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " "
    )
  );
  function Wr(e, t, l) {
    var a = t.indexOf("--") === 0;
    l == null || typeof l == "boolean" || l === "" ? a ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : a ? e.setProperty(t, l) : typeof l != "number" || l === 0 || Yh.has(t) ? t === "float" ? e.cssFloat = l : e[t] = ("" + l).trim() : e[t] = l + "px";
  }
  function $r(e, t, l) {
    if (t != null && typeof t != "object")
      throw Error(o(62));
    if (e = e.style, l != null) {
      for (var a in l)
        !l.hasOwnProperty(a) || t != null && t.hasOwnProperty(a) || (a.indexOf("--") === 0 ? e.setProperty(a, "") : a === "float" ? e.cssFloat = "" : e[a] = "");
      for (var n in t)
        a = t[n], t.hasOwnProperty(n) && l[n] !== a && Wr(e, n, a);
    } else
      for (var u in t)
        t.hasOwnProperty(u) && Wr(e, u, t[u]);
  }
  function rc(e) {
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
  var Gh = /* @__PURE__ */ new Map([
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
  ]), Xh = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function Au(e) {
    return Xh.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
  }
  function Nl() {
  }
  var oc = null;
  function fc(e) {
    return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
  }
  var Va = null, Qa = null;
  function Fr(e) {
    var t = ka(e);
    if (t && (e = t.stateNode)) {
      var l = e[Dt] || null;
      e: switch (e = t.stateNode, t.type) {
        case "input":
          if (cc(
            e,
            l.value,
            l.defaultValue,
            l.defaultValue,
            l.checked,
            l.defaultChecked,
            l.type,
            l.name
          ), t = l.name, l.type === "radio" && t != null) {
            for (l = e; l.parentNode; ) l = l.parentNode;
            for (l = l.querySelectorAll(
              'input[name="' + ll(
                "" + t
              ) + '"][type="radio"]'
            ), t = 0; t < l.length; t++) {
              var a = l[t];
              if (a !== e && a.form === e.form) {
                var n = a[Dt] || null;
                if (!n) throw Error(o(90));
                cc(
                  a,
                  n.value,
                  n.defaultValue,
                  n.defaultValue,
                  n.checked,
                  n.defaultChecked,
                  n.type,
                  n.name
                );
              }
            }
            for (t = 0; t < l.length; t++)
              a = l[t], a.form === e.form && Qr(a);
          }
          break e;
        case "textarea":
          Kr(e, l.value, l.defaultValue);
          break e;
        case "select":
          t = l.value, t != null && Ga(e, !!l.multiple, t, !1);
      }
    }
  }
  var dc = !1;
  function Ir(e, t, l) {
    if (dc) return e(t, l);
    dc = !0;
    try {
      var a = e(t);
      return a;
    } finally {
      if (dc = !1, (Va !== null || Qa !== null) && (ps(), Va && (t = Va, e = Qa, Qa = Va = null, Fr(t), e)))
        for (t = 0; t < e.length; t++) Fr(e[t]);
    }
  }
  function Dn(e, t) {
    var l = e.stateNode;
    if (l === null) return null;
    var a = l[Dt] || null;
    if (a === null) return null;
    l = a[t];
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
        (a = !a.disabled) || (e = e.type, a = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !a;
        break e;
      default:
        e = !1;
    }
    if (e) return null;
    if (l && typeof l != "function")
      throw Error(
        o(231, t, typeof l)
      );
    return l;
  }
  var Ml = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), mc = !1;
  if (Ml)
    try {
      var Rn = {};
      Object.defineProperty(Rn, "passive", {
        get: function() {
          mc = !0;
        }
      }), window.addEventListener("test", Rn, Rn), window.removeEventListener("test", Rn, Rn);
    } catch {
      mc = !1;
    }
  var Vl = null, hc = null, Cu = null;
  function Pr() {
    if (Cu) return Cu;
    var e, t = hc, l = t.length, a, n = "value" in Vl ? Vl.value : Vl.textContent, u = n.length;
    for (e = 0; e < l && t[e] === n[e]; e++) ;
    var i = l - e;
    for (a = 1; a <= i && t[l - a] === n[u - a]; a++) ;
    return Cu = n.slice(e, 1 < a ? 1 - a : void 0);
  }
  function Ou(e) {
    var t = e.keyCode;
    return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
  }
  function Du() {
    return !0;
  }
  function eo() {
    return !1;
  }
  function Rt(e) {
    function t(l, a, n, u, i) {
      this._reactName = l, this._targetInst = n, this.type = a, this.nativeEvent = u, this.target = i, this.currentTarget = null;
      for (var d in e)
        e.hasOwnProperty(d) && (l = e[d], this[d] = l ? l(u) : u[d]);
      return this.isDefaultPrevented = (u.defaultPrevented != null ? u.defaultPrevented : u.returnValue === !1) ? Du : eo, this.isPropagationStopped = eo, this;
    }
    return z(t.prototype, {
      preventDefault: function() {
        this.defaultPrevented = !0;
        var l = this.nativeEvent;
        l && (l.preventDefault ? l.preventDefault() : typeof l.returnValue != "unknown" && (l.returnValue = !1), this.isDefaultPrevented = Du);
      },
      stopPropagation: function() {
        var l = this.nativeEvent;
        l && (l.stopPropagation ? l.stopPropagation() : typeof l.cancelBubble != "unknown" && (l.cancelBubble = !0), this.isPropagationStopped = Du);
      },
      persist: function() {
      },
      isPersistent: Du
    }), t;
  }
  var ba = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function(e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  }, Ru = Rt(ba), Un = z({}, ba, { view: 0, detail: 0 }), Vh = Rt(Un), gc, vc, Hn, Uu = z({}, Un, {
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
    getModifierState: yc,
    button: 0,
    buttons: 0,
    relatedTarget: function(e) {
      return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
    },
    movementX: function(e) {
      return "movementX" in e ? e.movementX : (e !== Hn && (Hn && e.type === "mousemove" ? (gc = e.screenX - Hn.screenX, vc = e.screenY - Hn.screenY) : vc = gc = 0, Hn = e), gc);
    },
    movementY: function(e) {
      return "movementY" in e ? e.movementY : vc;
    }
  }), to = Rt(Uu), Qh = z({}, Uu, { dataTransfer: 0 }), Zh = Rt(Qh), Kh = z({}, Un, { relatedTarget: 0 }), pc = Rt(Kh), Jh = z({}, ba, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), Wh = Rt(Jh), $h = z({}, ba, {
    clipboardData: function(e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    }
  }), Fh = Rt($h), Ih = z({}, ba, { data: 0 }), lo = Rt(Ih), Ph = {
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
  }, e0 = {
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
  }, t0 = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
  };
  function l0(e) {
    var t = this.nativeEvent;
    return t.getModifierState ? t.getModifierState(e) : (e = t0[e]) ? !!t[e] : !1;
  }
  function yc() {
    return l0;
  }
  var a0 = z({}, Un, {
    key: function(e) {
      if (e.key) {
        var t = Ph[e.key] || e.key;
        if (t !== "Unidentified") return t;
      }
      return e.type === "keypress" ? (e = Ou(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? e0[e.keyCode] || "Unidentified" : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: yc,
    charCode: function(e) {
      return e.type === "keypress" ? Ou(e) : 0;
    },
    keyCode: function(e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    },
    which: function(e) {
      return e.type === "keypress" ? Ou(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    }
  }), n0 = Rt(a0), u0 = z({}, Uu, {
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
  }), ao = Rt(u0), s0 = z({}, Un, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: yc
  }), c0 = Rt(s0), i0 = z({}, ba, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), r0 = Rt(i0), o0 = z({}, Uu, {
    deltaX: function(e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function(e) {
      return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), f0 = Rt(o0), d0 = z({}, ba, {
    newState: 0,
    oldState: 0
  }), m0 = Rt(d0), h0 = [9, 13, 27, 32], bc = Ml && "CompositionEvent" in window, Bn = null;
  Ml && "documentMode" in document && (Bn = document.documentMode);
  var g0 = Ml && "TextEvent" in window && !Bn, no = Ml && (!bc || Bn && 8 < Bn && 11 >= Bn), uo = " ", so = !1;
  function co(e, t) {
    switch (e) {
      case "keyup":
        return h0.indexOf(t.keyCode) !== -1;
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
  function io(e) {
    return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
  }
  var Za = !1;
  function v0(e, t) {
    switch (e) {
      case "compositionend":
        return io(t);
      case "keypress":
        return t.which !== 32 ? null : (so = !0, uo);
      case "textInput":
        return e = t.data, e === uo && so ? null : e;
      default:
        return null;
    }
  }
  function p0(e, t) {
    if (Za)
      return e === "compositionend" || !bc && co(e, t) ? (e = Pr(), Cu = hc = Vl = null, Za = !1, e) : null;
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
        return no && t.locale !== "ko" ? null : t.data;
      default:
        return null;
    }
  }
  var y0 = {
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
  function ro(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t === "input" ? !!y0[e.type] : t === "textarea";
  }
  function oo(e, t, l, a) {
    Va ? Qa ? Qa.push(a) : Qa = [a] : Va = a, t = Ns(t, "onChange"), 0 < t.length && (l = new Ru(
      "onChange",
      "change",
      null,
      l,
      a
    ), e.push({ event: l, listeners: t }));
  }
  var qn = null, kn = null;
  function b0(e) {
    Jd(e, 0);
  }
  function Hu(e) {
    var t = On(e);
    if (Qr(t)) return e;
  }
  function fo(e, t) {
    if (e === "change") return t;
  }
  var mo = !1;
  if (Ml) {
    var xc;
    if (Ml) {
      var _c = "oninput" in document;
      if (!_c) {
        var ho = document.createElement("div");
        ho.setAttribute("oninput", "return;"), _c = typeof ho.oninput == "function";
      }
      xc = _c;
    } else xc = !1;
    mo = xc && (!document.documentMode || 9 < document.documentMode);
  }
  function go() {
    qn && (qn.detachEvent("onpropertychange", vo), kn = qn = null);
  }
  function vo(e) {
    if (e.propertyName === "value" && Hu(kn)) {
      var t = [];
      oo(
        t,
        kn,
        e,
        fc(e)
      ), Ir(b0, t);
    }
  }
  function x0(e, t, l) {
    e === "focusin" ? (go(), qn = t, kn = l, qn.attachEvent("onpropertychange", vo)) : e === "focusout" && go();
  }
  function _0(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown")
      return Hu(kn);
  }
  function S0(e, t) {
    if (e === "click") return Hu(t);
  }
  function j0(e, t) {
    if (e === "input" || e === "change")
      return Hu(t);
  }
  function N0(e, t) {
    return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
  }
  var Xt = typeof Object.is == "function" ? Object.is : N0;
  function Ln(e, t) {
    if (Xt(e, t)) return !0;
    if (typeof e != "object" || e === null || typeof t != "object" || t === null)
      return !1;
    var l = Object.keys(e), a = Object.keys(t);
    if (l.length !== a.length) return !1;
    for (a = 0; a < l.length; a++) {
      var n = l[a];
      if (!yt.call(t, n) || !Xt(e[n], t[n]))
        return !1;
    }
    return !0;
  }
  function po(e) {
    for (; e && e.firstChild; ) e = e.firstChild;
    return e;
  }
  function yo(e, t) {
    var l = po(e);
    e = 0;
    for (var a; l; ) {
      if (l.nodeType === 3) {
        if (a = e + l.textContent.length, e <= t && a >= t)
          return { node: l, offset: t - e };
        e = a;
      }
      e: {
        for (; l; ) {
          if (l.nextSibling) {
            l = l.nextSibling;
            break e;
          }
          l = l.parentNode;
        }
        l = void 0;
      }
      l = po(l);
    }
  }
  function bo(e, t) {
    return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? bo(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
  }
  function xo(e) {
    e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
    for (var t = zu(e.document); t instanceof e.HTMLIFrameElement; ) {
      try {
        var l = typeof t.contentWindow.location.href == "string";
      } catch {
        l = !1;
      }
      if (l) e = t.contentWindow;
      else break;
      t = zu(e.document);
    }
    return t;
  }
  function Sc(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
  }
  var M0 = Ml && "documentMode" in document && 11 >= document.documentMode, Ka = null, jc = null, Yn = null, Nc = !1;
  function _o(e, t, l) {
    var a = l.window === l ? l.document : l.nodeType === 9 ? l : l.ownerDocument;
    Nc || Ka == null || Ka !== zu(a) || (a = Ka, "selectionStart" in a && Sc(a) ? a = { start: a.selectionStart, end: a.selectionEnd } : (a = (a.ownerDocument && a.ownerDocument.defaultView || window).getSelection(), a = {
      anchorNode: a.anchorNode,
      anchorOffset: a.anchorOffset,
      focusNode: a.focusNode,
      focusOffset: a.focusOffset
    }), Yn && Ln(Yn, a) || (Yn = a, a = Ns(jc, "onSelect"), 0 < a.length && (t = new Ru(
      "onSelect",
      "select",
      null,
      t,
      l
    ), e.push({ event: t, listeners: a }), t.target = Ka)));
  }
  function xa(e, t) {
    var l = {};
    return l[e.toLowerCase()] = t.toLowerCase(), l["Webkit" + e] = "webkit" + t, l["Moz" + e] = "moz" + t, l;
  }
  var Ja = {
    animationend: xa("Animation", "AnimationEnd"),
    animationiteration: xa("Animation", "AnimationIteration"),
    animationstart: xa("Animation", "AnimationStart"),
    transitionrun: xa("Transition", "TransitionRun"),
    transitionstart: xa("Transition", "TransitionStart"),
    transitioncancel: xa("Transition", "TransitionCancel"),
    transitionend: xa("Transition", "TransitionEnd")
  }, Mc = {}, So = {};
  Ml && (So = document.createElement("div").style, "AnimationEvent" in window || (delete Ja.animationend.animation, delete Ja.animationiteration.animation, delete Ja.animationstart.animation), "TransitionEvent" in window || delete Ja.transitionend.transition);
  function _a(e) {
    if (Mc[e]) return Mc[e];
    if (!Ja[e]) return e;
    var t = Ja[e], l;
    for (l in t)
      if (t.hasOwnProperty(l) && l in So)
        return Mc[e] = t[l];
    return e;
  }
  var jo = _a("animationend"), No = _a("animationiteration"), Mo = _a("animationstart"), w0 = _a("transitionrun"), E0 = _a("transitionstart"), T0 = _a("transitioncancel"), wo = _a("transitionend"), Eo = /* @__PURE__ */ new Map(), wc = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
    " "
  );
  wc.push("scrollEnd");
  function ml(e, t) {
    Eo.set(e, t), ya(t, [e]);
  }
  var Bu = typeof reportError == "function" ? reportError : function(e) {
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
  }, al = [], Wa = 0, Ec = 0;
  function qu() {
    for (var e = Wa, t = Ec = Wa = 0; t < e; ) {
      var l = al[t];
      al[t++] = null;
      var a = al[t];
      al[t++] = null;
      var n = al[t];
      al[t++] = null;
      var u = al[t];
      if (al[t++] = null, a !== null && n !== null) {
        var i = a.pending;
        i === null ? n.next = n : (n.next = i.next, i.next = n), a.pending = n;
      }
      u !== 0 && To(l, n, u);
    }
  }
  function ku(e, t, l, a) {
    al[Wa++] = e, al[Wa++] = t, al[Wa++] = l, al[Wa++] = a, Ec |= a, e.lanes |= a, e = e.alternate, e !== null && (e.lanes |= a);
  }
  function Tc(e, t, l, a) {
    return ku(e, t, l, a), Lu(e);
  }
  function Sa(e, t) {
    return ku(e, null, null, t), Lu(e);
  }
  function To(e, t, l) {
    e.lanes |= l;
    var a = e.alternate;
    a !== null && (a.lanes |= l);
    for (var n = !1, u = e.return; u !== null; )
      u.childLanes |= l, a = u.alternate, a !== null && (a.childLanes |= l), u.tag === 22 && (e = u.stateNode, e === null || e._visibility & 1 || (n = !0)), e = u, u = u.return;
    return e.tag === 3 ? (u = e.stateNode, n && t !== null && (n = 31 - Tt(l), e = u.hiddenUpdates, a = e[n], a === null ? e[n] = [t] : a.push(t), t.lane = l | 536870912), u) : null;
  }
  function Lu(e) {
    if (50 < ru)
      throw ru = 0, Bi = null, Error(o(185));
    for (var t = e.return; t !== null; )
      e = t, t = e.return;
    return e.tag === 3 ? e.stateNode : null;
  }
  var $a = {};
  function z0(e, t, l, a) {
    this.tag = e, this.key = l, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = a, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Vt(e, t, l, a) {
    return new z0(e, t, l, a);
  }
  function zc(e) {
    return e = e.prototype, !(!e || !e.isReactComponent);
  }
  function wl(e, t) {
    var l = e.alternate;
    return l === null ? (l = Vt(
      e.tag,
      t,
      e.key,
      e.mode
    ), l.elementType = e.elementType, l.type = e.type, l.stateNode = e.stateNode, l.alternate = e, e.alternate = l) : (l.pendingProps = t, l.type = e.type, l.flags = 0, l.subtreeFlags = 0, l.deletions = null), l.flags = e.flags & 65011712, l.childLanes = e.childLanes, l.lanes = e.lanes, l.child = e.child, l.memoizedProps = e.memoizedProps, l.memoizedState = e.memoizedState, l.updateQueue = e.updateQueue, t = e.dependencies, l.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, l.sibling = e.sibling, l.index = e.index, l.ref = e.ref, l.refCleanup = e.refCleanup, l;
  }
  function zo(e, t) {
    e.flags &= 65011714;
    var l = e.alternate;
    return l === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = l.childLanes, e.lanes = l.lanes, e.child = l.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = l.memoizedProps, e.memoizedState = l.memoizedState, e.updateQueue = l.updateQueue, e.type = l.type, t = l.dependencies, e.dependencies = t === null ? null : {
      lanes: t.lanes,
      firstContext: t.firstContext
    }), e;
  }
  function Yu(e, t, l, a, n, u) {
    var i = 0;
    if (a = e, typeof e == "function") zc(e) && (i = 1);
    else if (typeof e == "string")
      i = Rg(
        e,
        l,
        Q.current
      ) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
    else
      e: switch (e) {
        case we:
          return e = Vt(31, l, t, n), e.elementType = we, e.lanes = u, e;
        case X:
          return ja(l.children, n, u, t);
        case Z:
          i = 8, n |= 24;
          break;
        case F:
          return e = Vt(12, l, t, n | 2), e.elementType = F, e.lanes = u, e;
        case de:
          return e = Vt(13, l, t, n), e.elementType = de, e.lanes = u, e;
        case I:
          return e = Vt(19, l, t, n), e.elementType = I, e.lanes = u, e;
        default:
          if (typeof e == "object" && e !== null)
            switch (e.$$typeof) {
              case R:
                i = 10;
                break e;
              case fe:
                i = 9;
                break e;
              case te:
                i = 11;
                break e;
              case J:
                i = 14;
                break e;
              case De:
                i = 16, a = null;
                break e;
            }
          i = 29, l = Error(
            o(130, e === null ? "null" : typeof e, "")
          ), a = null;
      }
    return t = Vt(i, l, t, n), t.elementType = e, t.type = a, t.lanes = u, t;
  }
  function ja(e, t, l, a) {
    return e = Vt(7, e, a, t), e.lanes = l, e;
  }
  function Ac(e, t, l) {
    return e = Vt(6, e, null, t), e.lanes = l, e;
  }
  function Ao(e) {
    var t = Vt(18, null, null, 0);
    return t.stateNode = e, t;
  }
  function Cc(e, t, l) {
    return t = Vt(
      4,
      e.children !== null ? e.children : [],
      e.key,
      t
    ), t.lanes = l, t.stateNode = {
      containerInfo: e.containerInfo,
      pendingChildren: null,
      implementation: e.implementation
    }, t;
  }
  var Co = /* @__PURE__ */ new WeakMap();
  function nl(e, t) {
    if (typeof e == "object" && e !== null) {
      var l = Co.get(e);
      return l !== void 0 ? l : (t = {
        value: e,
        source: t,
        stack: It(t)
      }, Co.set(e, t), t);
    }
    return {
      value: e,
      source: t,
      stack: It(t)
    };
  }
  var Fa = [], Ia = 0, Gu = null, Gn = 0, ul = [], sl = 0, Ql = null, pl = 1, yl = "";
  function El(e, t) {
    Fa[Ia++] = Gn, Fa[Ia++] = Gu, Gu = e, Gn = t;
  }
  function Oo(e, t, l) {
    ul[sl++] = pl, ul[sl++] = yl, ul[sl++] = Ql, Ql = e;
    var a = pl;
    e = yl;
    var n = 32 - Tt(a) - 1;
    a &= ~(1 << n), l += 1;
    var u = 32 - Tt(t) + n;
    if (30 < u) {
      var i = n - n % 5;
      u = (a & (1 << i) - 1).toString(32), a >>= i, n -= i, pl = 1 << 32 - Tt(t) + n | l << n | a, yl = u + e;
    } else
      pl = 1 << u | l << n | a, yl = e;
  }
  function Oc(e) {
    e.return !== null && (El(e, 1), Oo(e, 1, 0));
  }
  function Dc(e) {
    for (; e === Gu; )
      Gu = Fa[--Ia], Fa[Ia] = null, Gn = Fa[--Ia], Fa[Ia] = null;
    for (; e === Ql; )
      Ql = ul[--sl], ul[sl] = null, yl = ul[--sl], ul[sl] = null, pl = ul[--sl], ul[sl] = null;
  }
  function Do(e, t) {
    ul[sl++] = pl, ul[sl++] = yl, ul[sl++] = Ql, pl = t.id, yl = t.overflow, Ql = e;
  }
  var St = null, Je = null, Ne = !1, Zl = null, cl = !1, Rc = Error(o(519));
  function Kl(e) {
    var t = Error(
      o(
        418,
        1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML",
        ""
      )
    );
    throw Xn(nl(t, e)), Rc;
  }
  function Ro(e) {
    var t = e.stateNode, l = e.type, a = e.memoizedProps;
    switch (t[_t] = e, t[Dt] = a, l) {
      case "dialog":
        _e("cancel", t), _e("close", t);
        break;
      case "iframe":
      case "object":
      case "embed":
        _e("load", t);
        break;
      case "video":
      case "audio":
        for (l = 0; l < fu.length; l++)
          _e(fu[l], t);
        break;
      case "source":
        _e("error", t);
        break;
      case "img":
      case "image":
      case "link":
        _e("error", t), _e("load", t);
        break;
      case "details":
        _e("toggle", t);
        break;
      case "input":
        _e("invalid", t), Zr(
          t,
          a.value,
          a.defaultValue,
          a.checked,
          a.defaultChecked,
          a.type,
          a.name,
          !0
        );
        break;
      case "select":
        _e("invalid", t);
        break;
      case "textarea":
        _e("invalid", t), Jr(t, a.value, a.defaultValue, a.children);
    }
    l = a.children, typeof l != "string" && typeof l != "number" && typeof l != "bigint" || t.textContent === "" + l || a.suppressHydrationWarning === !0 || Id(t.textContent, l) ? (a.popover != null && (_e("beforetoggle", t), _e("toggle", t)), a.onScroll != null && _e("scroll", t), a.onScrollEnd != null && _e("scrollend", t), a.onClick != null && (t.onclick = Nl), t = !0) : t = !1, t || Kl(e, !0);
  }
  function Uo(e) {
    for (St = e.return; St; )
      switch (St.tag) {
        case 5:
        case 31:
        case 13:
          cl = !1;
          return;
        case 27:
        case 3:
          cl = !0;
          return;
        default:
          St = St.return;
      }
  }
  function Pa(e) {
    if (e !== St) return !1;
    if (!Ne) return Uo(e), Ne = !0, !1;
    var t = e.tag, l;
    if ((l = t !== 3 && t !== 27) && ((l = t === 5) && (l = e.type, l = !(l !== "form" && l !== "button") || Ii(e.type, e.memoizedProps)), l = !l), l && Je && Kl(e), Uo(e), t === 13) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(o(317));
      Je = cm(e);
    } else if (t === 31) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(o(317));
      Je = cm(e);
    } else
      t === 27 ? (t = Je, ca(e.type) ? (e = ar, ar = null, Je = e) : Je = t) : Je = St ? rl(e.stateNode.nextSibling) : null;
    return !0;
  }
  function Na() {
    Je = St = null, Ne = !1;
  }
  function Uc() {
    var e = Zl;
    return e !== null && (qt === null ? qt = e : qt.push.apply(
      qt,
      e
    ), Zl = null), e;
  }
  function Xn(e) {
    Zl === null ? Zl = [e] : Zl.push(e);
  }
  var Hc = b(null), Ma = null, Tl = null;
  function Jl(e, t, l) {
    Y(Hc, t._currentValue), t._currentValue = l;
  }
  function zl(e) {
    e._currentValue = Hc.current, D(Hc);
  }
  function Bc(e, t, l) {
    for (; e !== null; ) {
      var a = e.alternate;
      if ((e.childLanes & t) !== t ? (e.childLanes |= t, a !== null && (a.childLanes |= t)) : a !== null && (a.childLanes & t) !== t && (a.childLanes |= t), e === l) break;
      e = e.return;
    }
  }
  function qc(e, t, l, a) {
    var n = e.child;
    for (n !== null && (n.return = e); n !== null; ) {
      var u = n.dependencies;
      if (u !== null) {
        var i = n.child;
        u = u.firstContext;
        e: for (; u !== null; ) {
          var d = u;
          u = n;
          for (var v = 0; v < t.length; v++)
            if (d.context === t[v]) {
              u.lanes |= l, d = u.alternate, d !== null && (d.lanes |= l), Bc(
                u.return,
                l,
                e
              ), a || (i = null);
              break e;
            }
          u = d.next;
        }
      } else if (n.tag === 18) {
        if (i = n.return, i === null) throw Error(o(341));
        i.lanes |= l, u = i.alternate, u !== null && (u.lanes |= l), Bc(i, l, e), i = null;
      } else i = n.child;
      if (i !== null) i.return = n;
      else
        for (i = n; i !== null; ) {
          if (i === e) {
            i = null;
            break;
          }
          if (n = i.sibling, n !== null) {
            n.return = i.return, i = n;
            break;
          }
          i = i.return;
        }
      n = i;
    }
  }
  function en(e, t, l, a) {
    e = null;
    for (var n = t, u = !1; n !== null; ) {
      if (!u) {
        if ((n.flags & 524288) !== 0) u = !0;
        else if ((n.flags & 262144) !== 0) break;
      }
      if (n.tag === 10) {
        var i = n.alternate;
        if (i === null) throw Error(o(387));
        if (i = i.memoizedProps, i !== null) {
          var d = n.type;
          Xt(n.pendingProps.value, i.value) || (e !== null ? e.push(d) : e = [d]);
        }
      } else if (n === ne.current) {
        if (i = n.alternate, i === null) throw Error(o(387));
        i.memoizedState.memoizedState !== n.memoizedState.memoizedState && (e !== null ? e.push(vu) : e = [vu]);
      }
      n = n.return;
    }
    e !== null && qc(
      t,
      e,
      l,
      a
    ), t.flags |= 262144;
  }
  function Xu(e) {
    for (e = e.firstContext; e !== null; ) {
      if (!Xt(
        e.context._currentValue,
        e.memoizedValue
      ))
        return !0;
      e = e.next;
    }
    return !1;
  }
  function wa(e) {
    Ma = e, Tl = null, e = e.dependencies, e !== null && (e.firstContext = null);
  }
  function jt(e) {
    return Ho(Ma, e);
  }
  function Vu(e, t) {
    return Ma === null && wa(e), Ho(e, t);
  }
  function Ho(e, t) {
    var l = t._currentValue;
    if (t = { context: t, memoizedValue: l, next: null }, Tl === null) {
      if (e === null) throw Error(o(308));
      Tl = t, e.dependencies = { lanes: 0, firstContext: t }, e.flags |= 524288;
    } else Tl = Tl.next = t;
    return l;
  }
  var A0 = typeof AbortController < "u" ? AbortController : function() {
    var e = [], t = this.signal = {
      aborted: !1,
      addEventListener: function(l, a) {
        e.push(a);
      }
    };
    this.abort = function() {
      t.aborted = !0, e.forEach(function(l) {
        return l();
      });
    };
  }, C0 = c.unstable_scheduleCallback, O0 = c.unstable_NormalPriority, it = {
    $$typeof: R,
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0
  };
  function kc() {
    return {
      controller: new A0(),
      data: /* @__PURE__ */ new Map(),
      refCount: 0
    };
  }
  function Vn(e) {
    e.refCount--, e.refCount === 0 && C0(O0, function() {
      e.controller.abort();
    });
  }
  var Qn = null, Lc = 0, tn = 0, ln = null;
  function D0(e, t) {
    if (Qn === null) {
      var l = Qn = [];
      Lc = 0, tn = Xi(), ln = {
        status: "pending",
        value: void 0,
        then: function(a) {
          l.push(a);
        }
      };
    }
    return Lc++, t.then(Bo, Bo), t;
  }
  function Bo() {
    if (--Lc === 0 && Qn !== null) {
      ln !== null && (ln.status = "fulfilled");
      var e = Qn;
      Qn = null, tn = 0, ln = null;
      for (var t = 0; t < e.length; t++) (0, e[t])();
    }
  }
  function R0(e, t) {
    var l = [], a = {
      status: "pending",
      value: null,
      reason: null,
      then: function(n) {
        l.push(n);
      }
    };
    return e.then(
      function() {
        a.status = "fulfilled", a.value = t;
        for (var n = 0; n < l.length; n++) (0, l[n])(t);
      },
      function(n) {
        for (a.status = "rejected", a.reason = n, n = 0; n < l.length; n++)
          (0, l[n])(void 0);
      }
    ), a;
  }
  var qo = T.S;
  T.S = function(e, t) {
    Sd = Te(), typeof t == "object" && t !== null && typeof t.then == "function" && D0(e, t), qo !== null && qo(e, t);
  };
  var Ea = b(null);
  function Yc() {
    var e = Ea.current;
    return e !== null ? e : Ge.pooledCache;
  }
  function Qu(e, t) {
    t === null ? Y(Ea, Ea.current) : Y(Ea, t.pool);
  }
  function ko() {
    var e = Yc();
    return e === null ? null : { parent: it._currentValue, pool: e };
  }
  var an = Error(o(460)), Gc = Error(o(474)), Zu = Error(o(542)), Ku = { then: function() {
  } };
  function Lo(e) {
    return e = e.status, e === "fulfilled" || e === "rejected";
  }
  function Yo(e, t, l) {
    switch (l = e[l], l === void 0 ? e.push(t) : l !== t && (t.then(Nl, Nl), t = l), t.status) {
      case "fulfilled":
        return t.value;
      case "rejected":
        throw e = t.reason, Xo(e), e;
      default:
        if (typeof t.status == "string") t.then(Nl, Nl);
        else {
          if (e = Ge, e !== null && 100 < e.shellSuspendCounter)
            throw Error(o(482));
          e = t, e.status = "pending", e.then(
            function(a) {
              if (t.status === "pending") {
                var n = t;
                n.status = "fulfilled", n.value = a;
              }
            },
            function(a) {
              if (t.status === "pending") {
                var n = t;
                n.status = "rejected", n.reason = a;
              }
            }
          );
        }
        switch (t.status) {
          case "fulfilled":
            return t.value;
          case "rejected":
            throw e = t.reason, Xo(e), e;
        }
        throw za = t, an;
    }
  }
  function Ta(e) {
    try {
      var t = e._init;
      return t(e._payload);
    } catch (l) {
      throw l !== null && typeof l == "object" && typeof l.then == "function" ? (za = l, an) : l;
    }
  }
  var za = null;
  function Go() {
    if (za === null) throw Error(o(459));
    var e = za;
    return za = null, e;
  }
  function Xo(e) {
    if (e === an || e === Zu)
      throw Error(o(483));
  }
  var nn = null, Zn = 0;
  function Ju(e) {
    var t = Zn;
    return Zn += 1, nn === null && (nn = []), Yo(nn, e, t);
  }
  function Kn(e, t) {
    t = t.props.ref, e.ref = t !== void 0 ? t : null;
  }
  function Wu(e, t) {
    throw t.$$typeof === B ? Error(o(525)) : (e = Object.prototype.toString.call(t), Error(
      o(
        31,
        e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e
      )
    ));
  }
  function Vo(e) {
    function t(S, x) {
      if (e) {
        var N = S.deletions;
        N === null ? (S.deletions = [x], S.flags |= 16) : N.push(x);
      }
    }
    function l(S, x) {
      if (!e) return null;
      for (; x !== null; )
        t(S, x), x = x.sibling;
      return null;
    }
    function a(S) {
      for (var x = /* @__PURE__ */ new Map(); S !== null; )
        S.key !== null ? x.set(S.key, S) : x.set(S.index, S), S = S.sibling;
      return x;
    }
    function n(S, x) {
      return S = wl(S, x), S.index = 0, S.sibling = null, S;
    }
    function u(S, x, N) {
      return S.index = N, e ? (N = S.alternate, N !== null ? (N = N.index, N < x ? (S.flags |= 67108866, x) : N) : (S.flags |= 67108866, x)) : (S.flags |= 1048576, x);
    }
    function i(S) {
      return e && S.alternate === null && (S.flags |= 67108866), S;
    }
    function d(S, x, N, C) {
      return x === null || x.tag !== 6 ? (x = Ac(N, S.mode, C), x.return = S, x) : (x = n(x, N), x.return = S, x);
    }
    function v(S, x, N, C) {
      var ae = N.type;
      return ae === X ? A(
        S,
        x,
        N.props.children,
        C,
        N.key
      ) : x !== null && (x.elementType === ae || typeof ae == "object" && ae !== null && ae.$$typeof === De && Ta(ae) === x.type) ? (x = n(x, N.props), Kn(x, N), x.return = S, x) : (x = Yu(
        N.type,
        N.key,
        N.props,
        null,
        S.mode,
        C
      ), Kn(x, N), x.return = S, x);
    }
    function M(S, x, N, C) {
      return x === null || x.tag !== 4 || x.stateNode.containerInfo !== N.containerInfo || x.stateNode.implementation !== N.implementation ? (x = Cc(N, S.mode, C), x.return = S, x) : (x = n(x, N.children || []), x.return = S, x);
    }
    function A(S, x, N, C, ae) {
      return x === null || x.tag !== 7 ? (x = ja(
        N,
        S.mode,
        C,
        ae
      ), x.return = S, x) : (x = n(x, N), x.return = S, x);
    }
    function O(S, x, N) {
      if (typeof x == "string" && x !== "" || typeof x == "number" || typeof x == "bigint")
        return x = Ac(
          "" + x,
          S.mode,
          N
        ), x.return = S, x;
      if (typeof x == "object" && x !== null) {
        switch (x.$$typeof) {
          case U:
            return N = Yu(
              x.type,
              x.key,
              x.props,
              null,
              S.mode,
              N
            ), Kn(N, x), N.return = S, N;
          case L:
            return x = Cc(
              x,
              S.mode,
              N
            ), x.return = S, x;
          case De:
            return x = Ta(x), O(S, x, N);
        }
        if (mt(x) || le(x))
          return x = ja(
            x,
            S.mode,
            N,
            null
          ), x.return = S, x;
        if (typeof x.then == "function")
          return O(S, Ju(x), N);
        if (x.$$typeof === R)
          return O(
            S,
            Vu(S, x),
            N
          );
        Wu(S, x);
      }
      return null;
    }
    function w(S, x, N, C) {
      var ae = x !== null ? x.key : null;
      if (typeof N == "string" && N !== "" || typeof N == "number" || typeof N == "bigint")
        return ae !== null ? null : d(S, x, "" + N, C);
      if (typeof N == "object" && N !== null) {
        switch (N.$$typeof) {
          case U:
            return N.key === ae ? v(S, x, N, C) : null;
          case L:
            return N.key === ae ? M(S, x, N, C) : null;
          case De:
            return N = Ta(N), w(S, x, N, C);
        }
        if (mt(N) || le(N))
          return ae !== null ? null : A(S, x, N, C, null);
        if (typeof N.then == "function")
          return w(
            S,
            x,
            Ju(N),
            C
          );
        if (N.$$typeof === R)
          return w(
            S,
            x,
            Vu(S, N),
            C
          );
        Wu(S, N);
      }
      return null;
    }
    function E(S, x, N, C, ae) {
      if (typeof C == "string" && C !== "" || typeof C == "number" || typeof C == "bigint")
        return S = S.get(N) || null, d(x, S, "" + C, ae);
      if (typeof C == "object" && C !== null) {
        switch (C.$$typeof) {
          case U:
            return S = S.get(
              C.key === null ? N : C.key
            ) || null, v(x, S, C, ae);
          case L:
            return S = S.get(
              C.key === null ? N : C.key
            ) || null, M(x, S, C, ae);
          case De:
            return C = Ta(C), E(
              S,
              x,
              N,
              C,
              ae
            );
        }
        if (mt(C) || le(C))
          return S = S.get(N) || null, A(x, S, C, ae, null);
        if (typeof C.then == "function")
          return E(
            S,
            x,
            N,
            Ju(C),
            ae
          );
        if (C.$$typeof === R)
          return E(
            S,
            x,
            N,
            Vu(x, C),
            ae
          );
        Wu(x, C);
      }
      return null;
    }
    function K(S, x, N, C) {
      for (var ae = null, ze = null, $ = x, ge = x = 0, je = null; $ !== null && ge < N.length; ge++) {
        $.index > ge ? (je = $, $ = null) : je = $.sibling;
        var Ae = w(
          S,
          $,
          N[ge],
          C
        );
        if (Ae === null) {
          $ === null && ($ = je);
          break;
        }
        e && $ && Ae.alternate === null && t(S, $), x = u(Ae, x, ge), ze === null ? ae = Ae : ze.sibling = Ae, ze = Ae, $ = je;
      }
      if (ge === N.length)
        return l(S, $), Ne && El(S, ge), ae;
      if ($ === null) {
        for (; ge < N.length; ge++)
          $ = O(S, N[ge], C), $ !== null && (x = u(
            $,
            x,
            ge
          ), ze === null ? ae = $ : ze.sibling = $, ze = $);
        return Ne && El(S, ge), ae;
      }
      for ($ = a($); ge < N.length; ge++)
        je = E(
          $,
          S,
          ge,
          N[ge],
          C
        ), je !== null && (e && je.alternate !== null && $.delete(
          je.key === null ? ge : je.key
        ), x = u(
          je,
          x,
          ge
        ), ze === null ? ae = je : ze.sibling = je, ze = je);
      return e && $.forEach(function(da) {
        return t(S, da);
      }), Ne && El(S, ge), ae;
    }
    function ue(S, x, N, C) {
      if (N == null) throw Error(o(151));
      for (var ae = null, ze = null, $ = x, ge = x = 0, je = null, Ae = N.next(); $ !== null && !Ae.done; ge++, Ae = N.next()) {
        $.index > ge ? (je = $, $ = null) : je = $.sibling;
        var da = w(S, $, Ae.value, C);
        if (da === null) {
          $ === null && ($ = je);
          break;
        }
        e && $ && da.alternate === null && t(S, $), x = u(da, x, ge), ze === null ? ae = da : ze.sibling = da, ze = da, $ = je;
      }
      if (Ae.done)
        return l(S, $), Ne && El(S, ge), ae;
      if ($ === null) {
        for (; !Ae.done; ge++, Ae = N.next())
          Ae = O(S, Ae.value, C), Ae !== null && (x = u(Ae, x, ge), ze === null ? ae = Ae : ze.sibling = Ae, ze = Ae);
        return Ne && El(S, ge), ae;
      }
      for ($ = a($); !Ae.done; ge++, Ae = N.next())
        Ae = E($, S, ge, Ae.value, C), Ae !== null && (e && Ae.alternate !== null && $.delete(Ae.key === null ? ge : Ae.key), x = u(Ae, x, ge), ze === null ? ae = Ae : ze.sibling = Ae, ze = Ae);
      return e && $.forEach(function(Qg) {
        return t(S, Qg);
      }), Ne && El(S, ge), ae;
    }
    function ke(S, x, N, C) {
      if (typeof N == "object" && N !== null && N.type === X && N.key === null && (N = N.props.children), typeof N == "object" && N !== null) {
        switch (N.$$typeof) {
          case U:
            e: {
              for (var ae = N.key; x !== null; ) {
                if (x.key === ae) {
                  if (ae = N.type, ae === X) {
                    if (x.tag === 7) {
                      l(
                        S,
                        x.sibling
                      ), C = n(
                        x,
                        N.props.children
                      ), C.return = S, S = C;
                      break e;
                    }
                  } else if (x.elementType === ae || typeof ae == "object" && ae !== null && ae.$$typeof === De && Ta(ae) === x.type) {
                    l(
                      S,
                      x.sibling
                    ), C = n(x, N.props), Kn(C, N), C.return = S, S = C;
                    break e;
                  }
                  l(S, x);
                  break;
                } else t(S, x);
                x = x.sibling;
              }
              N.type === X ? (C = ja(
                N.props.children,
                S.mode,
                C,
                N.key
              ), C.return = S, S = C) : (C = Yu(
                N.type,
                N.key,
                N.props,
                null,
                S.mode,
                C
              ), Kn(C, N), C.return = S, S = C);
            }
            return i(S);
          case L:
            e: {
              for (ae = N.key; x !== null; ) {
                if (x.key === ae)
                  if (x.tag === 4 && x.stateNode.containerInfo === N.containerInfo && x.stateNode.implementation === N.implementation) {
                    l(
                      S,
                      x.sibling
                    ), C = n(x, N.children || []), C.return = S, S = C;
                    break e;
                  } else {
                    l(S, x);
                    break;
                  }
                else t(S, x);
                x = x.sibling;
              }
              C = Cc(N, S.mode, C), C.return = S, S = C;
            }
            return i(S);
          case De:
            return N = Ta(N), ke(
              S,
              x,
              N,
              C
            );
        }
        if (mt(N))
          return K(
            S,
            x,
            N,
            C
          );
        if (le(N)) {
          if (ae = le(N), typeof ae != "function") throw Error(o(150));
          return N = ae.call(N), ue(
            S,
            x,
            N,
            C
          );
        }
        if (typeof N.then == "function")
          return ke(
            S,
            x,
            Ju(N),
            C
          );
        if (N.$$typeof === R)
          return ke(
            S,
            x,
            Vu(S, N),
            C
          );
        Wu(S, N);
      }
      return typeof N == "string" && N !== "" || typeof N == "number" || typeof N == "bigint" ? (N = "" + N, x !== null && x.tag === 6 ? (l(S, x.sibling), C = n(x, N), C.return = S, S = C) : (l(S, x), C = Ac(N, S.mode, C), C.return = S, S = C), i(S)) : l(S, x);
    }
    return function(S, x, N, C) {
      try {
        Zn = 0;
        var ae = ke(
          S,
          x,
          N,
          C
        );
        return nn = null, ae;
      } catch ($) {
        if ($ === an || $ === Zu) throw $;
        var ze = Vt(29, $, null, S.mode);
        return ze.lanes = C, ze.return = S, ze;
      } finally {
      }
    };
  }
  var Aa = Vo(!0), Qo = Vo(!1), Wl = !1;
  function Xc(e) {
    e.updateQueue = {
      baseState: e.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null
    };
  }
  function Vc(e, t) {
    e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
      baseState: e.baseState,
      firstBaseUpdate: e.firstBaseUpdate,
      lastBaseUpdate: e.lastBaseUpdate,
      shared: e.shared,
      callbacks: null
    });
  }
  function $l(e) {
    return { lane: e, tag: 0, payload: null, callback: null, next: null };
  }
  function Fl(e, t, l) {
    var a = e.updateQueue;
    if (a === null) return null;
    if (a = a.shared, (Oe & 2) !== 0) {
      var n = a.pending;
      return n === null ? t.next = t : (t.next = n.next, n.next = t), a.pending = t, t = Lu(e), To(e, null, l), t;
    }
    return ku(e, a, t, l), Lu(e);
  }
  function Jn(e, t, l) {
    if (t = t.updateQueue, t !== null && (t = t.shared, (l & 4194048) !== 0)) {
      var a = t.lanes;
      a &= e.pendingLanes, l |= a, t.lanes = l, Ur(e, l);
    }
  }
  function Qc(e, t) {
    var l = e.updateQueue, a = e.alternate;
    if (a !== null && (a = a.updateQueue, l === a)) {
      var n = null, u = null;
      if (l = l.firstBaseUpdate, l !== null) {
        do {
          var i = {
            lane: l.lane,
            tag: l.tag,
            payload: l.payload,
            callback: null,
            next: null
          };
          u === null ? n = u = i : u = u.next = i, l = l.next;
        } while (l !== null);
        u === null ? n = u = t : u = u.next = t;
      } else n = u = t;
      l = {
        baseState: a.baseState,
        firstBaseUpdate: n,
        lastBaseUpdate: u,
        shared: a.shared,
        callbacks: a.callbacks
      }, e.updateQueue = l;
      return;
    }
    e = l.lastBaseUpdate, e === null ? l.firstBaseUpdate = t : e.next = t, l.lastBaseUpdate = t;
  }
  var Zc = !1;
  function Wn() {
    if (Zc) {
      var e = ln;
      if (e !== null) throw e;
    }
  }
  function $n(e, t, l, a) {
    Zc = !1;
    var n = e.updateQueue;
    Wl = !1;
    var u = n.firstBaseUpdate, i = n.lastBaseUpdate, d = n.shared.pending;
    if (d !== null) {
      n.shared.pending = null;
      var v = d, M = v.next;
      v.next = null, i === null ? u = M : i.next = M, i = v;
      var A = e.alternate;
      A !== null && (A = A.updateQueue, d = A.lastBaseUpdate, d !== i && (d === null ? A.firstBaseUpdate = M : d.next = M, A.lastBaseUpdate = v));
    }
    if (u !== null) {
      var O = n.baseState;
      i = 0, A = M = v = null, d = u;
      do {
        var w = d.lane & -536870913, E = w !== d.lane;
        if (E ? (Se & w) === w : (a & w) === w) {
          w !== 0 && w === tn && (Zc = !0), A !== null && (A = A.next = {
            lane: 0,
            tag: d.tag,
            payload: d.payload,
            callback: null,
            next: null
          });
          e: {
            var K = e, ue = d;
            w = t;
            var ke = l;
            switch (ue.tag) {
              case 1:
                if (K = ue.payload, typeof K == "function") {
                  O = K.call(ke, O, w);
                  break e;
                }
                O = K;
                break e;
              case 3:
                K.flags = K.flags & -65537 | 128;
              case 0:
                if (K = ue.payload, w = typeof K == "function" ? K.call(ke, O, w) : K, w == null) break e;
                O = z({}, O, w);
                break e;
              case 2:
                Wl = !0;
            }
          }
          w = d.callback, w !== null && (e.flags |= 64, E && (e.flags |= 8192), E = n.callbacks, E === null ? n.callbacks = [w] : E.push(w));
        } else
          E = {
            lane: w,
            tag: d.tag,
            payload: d.payload,
            callback: d.callback,
            next: null
          }, A === null ? (M = A = E, v = O) : A = A.next = E, i |= w;
        if (d = d.next, d === null) {
          if (d = n.shared.pending, d === null)
            break;
          E = d, d = E.next, E.next = null, n.lastBaseUpdate = E, n.shared.pending = null;
        }
      } while (!0);
      A === null && (v = O), n.baseState = v, n.firstBaseUpdate = M, n.lastBaseUpdate = A, u === null && (n.shared.lanes = 0), la |= i, e.lanes = i, e.memoizedState = O;
    }
  }
  function Zo(e, t) {
    if (typeof e != "function")
      throw Error(o(191, e));
    e.call(t);
  }
  function Ko(e, t) {
    var l = e.callbacks;
    if (l !== null)
      for (e.callbacks = null, e = 0; e < l.length; e++)
        Zo(l[e], t);
  }
  var un = b(null), $u = b(0);
  function Jo(e, t) {
    e = ql, Y($u, e), Y(un, t), ql = e | t.baseLanes;
  }
  function Kc() {
    Y($u, ql), Y(un, un.current);
  }
  function Jc() {
    ql = $u.current, D(un), D($u);
  }
  var Qt = b(null), il = null;
  function Il(e) {
    var t = e.alternate;
    Y(ut, ut.current & 1), Y(Qt, e), il === null && (t === null || un.current !== null || t.memoizedState !== null) && (il = e);
  }
  function Wc(e) {
    Y(ut, ut.current), Y(Qt, e), il === null && (il = e);
  }
  function Wo(e) {
    e.tag === 22 ? (Y(ut, ut.current), Y(Qt, e), il === null && (il = e)) : Pl();
  }
  function Pl() {
    Y(ut, ut.current), Y(Qt, Qt.current);
  }
  function Zt(e) {
    D(Qt), il === e && (il = null), D(ut);
  }
  var ut = b(0);
  function Fu(e) {
    for (var t = e; t !== null; ) {
      if (t.tag === 13) {
        var l = t.memoizedState;
        if (l !== null && (l = l.dehydrated, l === null || tr(l) || lr(l)))
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
  var Al = 0, me = null, Be = null, rt = null, Iu = !1, sn = !1, Ca = !1, Pu = 0, Fn = 0, cn = null, U0 = 0;
  function lt() {
    throw Error(o(321));
  }
  function $c(e, t) {
    if (t === null) return !1;
    for (var l = 0; l < t.length && l < e.length; l++)
      if (!Xt(e[l], t[l])) return !1;
    return !0;
  }
  function Fc(e, t, l, a, n, u) {
    return Al = u, me = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, T.H = e === null || e.memoizedState === null ? Df : di, Ca = !1, u = l(a, n), Ca = !1, sn && (u = Fo(
      t,
      l,
      a,
      n
    )), $o(e), u;
  }
  function $o(e) {
    T.H = eu;
    var t = Be !== null && Be.next !== null;
    if (Al = 0, rt = Be = me = null, Iu = !1, Fn = 0, cn = null, t) throw Error(o(300));
    e === null || ot || (e = e.dependencies, e !== null && Xu(e) && (ot = !0));
  }
  function Fo(e, t, l, a) {
    me = e;
    var n = 0;
    do {
      if (sn && (cn = null), Fn = 0, sn = !1, 25 <= n) throw Error(o(301));
      if (n += 1, rt = Be = null, e.updateQueue != null) {
        var u = e.updateQueue;
        u.lastEffect = null, u.events = null, u.stores = null, u.memoCache != null && (u.memoCache.index = 0);
      }
      T.H = Rf, u = t(l, a);
    } while (sn);
    return u;
  }
  function H0() {
    var e = T.H, t = e.useState()[0];
    return t = typeof t.then == "function" ? In(t) : t, e = e.useState()[0], (Be !== null ? Be.memoizedState : null) !== e && (me.flags |= 1024), t;
  }
  function Ic() {
    var e = Pu !== 0;
    return Pu = 0, e;
  }
  function Pc(e, t, l) {
    t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~l;
  }
  function ei(e) {
    if (Iu) {
      for (e = e.memoizedState; e !== null; ) {
        var t = e.queue;
        t !== null && (t.pending = null), e = e.next;
      }
      Iu = !1;
    }
    Al = 0, rt = Be = me = null, sn = !1, Fn = Pu = 0, cn = null;
  }
  function At() {
    var e = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null
    };
    return rt === null ? me.memoizedState = rt = e : rt = rt.next = e, rt;
  }
  function st() {
    if (Be === null) {
      var e = me.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = Be.next;
    var t = rt === null ? me.memoizedState : rt.next;
    if (t !== null)
      rt = t, Be = e;
    else {
      if (e === null)
        throw me.alternate === null ? Error(o(467)) : Error(o(310));
      Be = e, e = {
        memoizedState: Be.memoizedState,
        baseState: Be.baseState,
        baseQueue: Be.baseQueue,
        queue: Be.queue,
        next: null
      }, rt === null ? me.memoizedState = rt = e : rt = rt.next = e;
    }
    return rt;
  }
  function es() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function In(e) {
    var t = Fn;
    return Fn += 1, cn === null && (cn = []), e = Yo(cn, e, t), t = me, (rt === null ? t.memoizedState : rt.next) === null && (t = t.alternate, T.H = t === null || t.memoizedState === null ? Df : di), e;
  }
  function ts(e) {
    if (e !== null && typeof e == "object") {
      if (typeof e.then == "function") return In(e);
      if (e.$$typeof === R) return jt(e);
    }
    throw Error(o(438, String(e)));
  }
  function ti(e) {
    var t = null, l = me.updateQueue;
    if (l !== null && (t = l.memoCache), t == null) {
      var a = me.alternate;
      a !== null && (a = a.updateQueue, a !== null && (a = a.memoCache, a != null && (t = {
        data: a.data.map(function(n) {
          return n.slice();
        }),
        index: 0
      })));
    }
    if (t == null && (t = { data: [], index: 0 }), l === null && (l = es(), me.updateQueue = l), l.memoCache = t, l = t.data[t.index], l === void 0)
      for (l = t.data[t.index] = Array(e), a = 0; a < e; a++)
        l[a] = nt;
    return t.index++, l;
  }
  function Cl(e, t) {
    return typeof t == "function" ? t(e) : t;
  }
  function ls(e) {
    var t = st();
    return li(t, Be, e);
  }
  function li(e, t, l) {
    var a = e.queue;
    if (a === null) throw Error(o(311));
    a.lastRenderedReducer = l;
    var n = e.baseQueue, u = a.pending;
    if (u !== null) {
      if (n !== null) {
        var i = n.next;
        n.next = u.next, u.next = i;
      }
      t.baseQueue = n = u, a.pending = null;
    }
    if (u = e.baseState, n === null) e.memoizedState = u;
    else {
      t = n.next;
      var d = i = null, v = null, M = t, A = !1;
      do {
        var O = M.lane & -536870913;
        if (O !== M.lane ? (Se & O) === O : (Al & O) === O) {
          var w = M.revertLane;
          if (w === 0)
            v !== null && (v = v.next = {
              lane: 0,
              revertLane: 0,
              gesture: null,
              action: M.action,
              hasEagerState: M.hasEagerState,
              eagerState: M.eagerState,
              next: null
            }), O === tn && (A = !0);
          else if ((Al & w) === w) {
            M = M.next, w === tn && (A = !0);
            continue;
          } else
            O = {
              lane: 0,
              revertLane: M.revertLane,
              gesture: null,
              action: M.action,
              hasEagerState: M.hasEagerState,
              eagerState: M.eagerState,
              next: null
            }, v === null ? (d = v = O, i = u) : v = v.next = O, me.lanes |= w, la |= w;
          O = M.action, Ca && l(u, O), u = M.hasEagerState ? M.eagerState : l(u, O);
        } else
          w = {
            lane: O,
            revertLane: M.revertLane,
            gesture: M.gesture,
            action: M.action,
            hasEagerState: M.hasEagerState,
            eagerState: M.eagerState,
            next: null
          }, v === null ? (d = v = w, i = u) : v = v.next = w, me.lanes |= O, la |= O;
        M = M.next;
      } while (M !== null && M !== t);
      if (v === null ? i = u : v.next = d, !Xt(u, e.memoizedState) && (ot = !0, A && (l = ln, l !== null)))
        throw l;
      e.memoizedState = u, e.baseState = i, e.baseQueue = v, a.lastRenderedState = u;
    }
    return n === null && (a.lanes = 0), [e.memoizedState, a.dispatch];
  }
  function ai(e) {
    var t = st(), l = t.queue;
    if (l === null) throw Error(o(311));
    l.lastRenderedReducer = e;
    var a = l.dispatch, n = l.pending, u = t.memoizedState;
    if (n !== null) {
      l.pending = null;
      var i = n = n.next;
      do
        u = e(u, i.action), i = i.next;
      while (i !== n);
      Xt(u, t.memoizedState) || (ot = !0), t.memoizedState = u, t.baseQueue === null && (t.baseState = u), l.lastRenderedState = u;
    }
    return [u, a];
  }
  function Io(e, t, l) {
    var a = me, n = st(), u = Ne;
    if (u) {
      if (l === void 0) throw Error(o(407));
      l = l();
    } else l = t();
    var i = !Xt(
      (Be || n).memoizedState,
      l
    );
    if (i && (n.memoizedState = l, ot = !0), n = n.queue, si(tf.bind(null, a, n, e), [
      e
    ]), n.getSnapshot !== t || i || rt !== null && rt.memoizedState.tag & 1) {
      if (a.flags |= 2048, rn(
        9,
        { destroy: void 0 },
        ef.bind(
          null,
          a,
          n,
          l,
          t
        ),
        null
      ), Ge === null) throw Error(o(349));
      u || (Al & 127) !== 0 || Po(a, t, l);
    }
    return l;
  }
  function Po(e, t, l) {
    e.flags |= 16384, e = { getSnapshot: t, value: l }, t = me.updateQueue, t === null ? (t = es(), me.updateQueue = t, t.stores = [e]) : (l = t.stores, l === null ? t.stores = [e] : l.push(e));
  }
  function ef(e, t, l, a) {
    t.value = l, t.getSnapshot = a, lf(t) && af(e);
  }
  function tf(e, t, l) {
    return l(function() {
      lf(t) && af(e);
    });
  }
  function lf(e) {
    var t = e.getSnapshot;
    e = e.value;
    try {
      var l = t();
      return !Xt(e, l);
    } catch {
      return !0;
    }
  }
  function af(e) {
    var t = Sa(e, 2);
    t !== null && kt(t, e, 2);
  }
  function ni(e) {
    var t = At();
    if (typeof e == "function") {
      var l = e;
      if (e = l(), Ca) {
        Gt(!0);
        try {
          l();
        } finally {
          Gt(!1);
        }
      }
    }
    return t.memoizedState = t.baseState = e, t.queue = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Cl,
      lastRenderedState: e
    }, t;
  }
  function nf(e, t, l, a) {
    return e.baseState = l, li(
      e,
      Be,
      typeof a == "function" ? a : Cl
    );
  }
  function B0(e, t, l, a, n) {
    if (us(e)) throw Error(o(485));
    if (e = t.action, e !== null) {
      var u = {
        payload: n,
        action: e,
        next: null,
        isTransition: !0,
        status: "pending",
        value: null,
        reason: null,
        listeners: [],
        then: function(i) {
          u.listeners.push(i);
        }
      };
      T.T !== null ? l(!0) : u.isTransition = !1, a(u), l = t.pending, l === null ? (u.next = t.pending = u, uf(t, u)) : (u.next = l.next, t.pending = l.next = u);
    }
  }
  function uf(e, t) {
    var l = t.action, a = t.payload, n = e.state;
    if (t.isTransition) {
      var u = T.T, i = {};
      T.T = i;
      try {
        var d = l(n, a), v = T.S;
        v !== null && v(i, d), sf(e, t, d);
      } catch (M) {
        ui(e, t, M);
      } finally {
        u !== null && i.types !== null && (u.types = i.types), T.T = u;
      }
    } else
      try {
        u = l(n, a), sf(e, t, u);
      } catch (M) {
        ui(e, t, M);
      }
  }
  function sf(e, t, l) {
    l !== null && typeof l == "object" && typeof l.then == "function" ? l.then(
      function(a) {
        cf(e, t, a);
      },
      function(a) {
        return ui(e, t, a);
      }
    ) : cf(e, t, l);
  }
  function cf(e, t, l) {
    t.status = "fulfilled", t.value = l, rf(t), e.state = l, t = e.pending, t !== null && (l = t.next, l === t ? e.pending = null : (l = l.next, t.next = l, uf(e, l)));
  }
  function ui(e, t, l) {
    var a = e.pending;
    if (e.pending = null, a !== null) {
      a = a.next;
      do
        t.status = "rejected", t.reason = l, rf(t), t = t.next;
      while (t !== a);
    }
    e.action = null;
  }
  function rf(e) {
    e = e.listeners;
    for (var t = 0; t < e.length; t++) (0, e[t])();
  }
  function of(e, t) {
    return t;
  }
  function ff(e, t) {
    if (Ne) {
      var l = Ge.formState;
      if (l !== null) {
        e: {
          var a = me;
          if (Ne) {
            if (Je) {
              t: {
                for (var n = Je, u = cl; n.nodeType !== 8; ) {
                  if (!u) {
                    n = null;
                    break t;
                  }
                  if (n = rl(
                    n.nextSibling
                  ), n === null) {
                    n = null;
                    break t;
                  }
                }
                u = n.data, n = u === "F!" || u === "F" ? n : null;
              }
              if (n) {
                Je = rl(
                  n.nextSibling
                ), a = n.data === "F!";
                break e;
              }
            }
            Kl(a);
          }
          a = !1;
        }
        a && (t = l[0]);
      }
    }
    return l = At(), l.memoizedState = l.baseState = t, a = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: of,
      lastRenderedState: t
    }, l.queue = a, l = Af.bind(
      null,
      me,
      a
    ), a.dispatch = l, a = ni(!1), u = fi.bind(
      null,
      me,
      !1,
      a.queue
    ), a = At(), n = {
      state: t,
      dispatch: null,
      action: e,
      pending: null
    }, a.queue = n, l = B0.bind(
      null,
      me,
      n,
      u,
      l
    ), n.dispatch = l, a.memoizedState = e, [t, l, !1];
  }
  function df(e) {
    var t = st();
    return mf(t, Be, e);
  }
  function mf(e, t, l) {
    if (t = li(
      e,
      t,
      of
    )[0], e = ls(Cl)[0], typeof t == "object" && t !== null && typeof t.then == "function")
      try {
        var a = In(t);
      } catch (i) {
        throw i === an ? Zu : i;
      }
    else a = t;
    t = st();
    var n = t.queue, u = n.dispatch;
    return l !== t.memoizedState && (me.flags |= 2048, rn(
      9,
      { destroy: void 0 },
      q0.bind(null, n, l),
      null
    )), [a, u, e];
  }
  function q0(e, t) {
    e.action = t;
  }
  function hf(e) {
    var t = st(), l = Be;
    if (l !== null)
      return mf(t, l, e);
    st(), t = t.memoizedState, l = st();
    var a = l.queue.dispatch;
    return l.memoizedState = e, [t, a, !1];
  }
  function rn(e, t, l, a) {
    return e = { tag: e, create: l, deps: a, inst: t, next: null }, t = me.updateQueue, t === null && (t = es(), me.updateQueue = t), l = t.lastEffect, l === null ? t.lastEffect = e.next = e : (a = l.next, l.next = e, e.next = a, t.lastEffect = e), e;
  }
  function gf() {
    return st().memoizedState;
  }
  function as(e, t, l, a) {
    var n = At();
    me.flags |= e, n.memoizedState = rn(
      1 | t,
      { destroy: void 0 },
      l,
      a === void 0 ? null : a
    );
  }
  function ns(e, t, l, a) {
    var n = st();
    a = a === void 0 ? null : a;
    var u = n.memoizedState.inst;
    Be !== null && a !== null && $c(a, Be.memoizedState.deps) ? n.memoizedState = rn(t, u, l, a) : (me.flags |= e, n.memoizedState = rn(
      1 | t,
      u,
      l,
      a
    ));
  }
  function vf(e, t) {
    as(8390656, 8, e, t);
  }
  function si(e, t) {
    ns(2048, 8, e, t);
  }
  function k0(e) {
    me.flags |= 4;
    var t = me.updateQueue;
    if (t === null)
      t = es(), me.updateQueue = t, t.events = [e];
    else {
      var l = t.events;
      l === null ? t.events = [e] : l.push(e);
    }
  }
  function pf(e) {
    var t = st().memoizedState;
    return k0({ ref: t, nextImpl: e }), function() {
      if ((Oe & 2) !== 0) throw Error(o(440));
      return t.impl.apply(void 0, arguments);
    };
  }
  function yf(e, t) {
    return ns(4, 2, e, t);
  }
  function bf(e, t) {
    return ns(4, 4, e, t);
  }
  function xf(e, t) {
    if (typeof t == "function") {
      e = e();
      var l = t(e);
      return function() {
        typeof l == "function" ? l() : t(null);
      };
    }
    if (t != null)
      return e = e(), t.current = e, function() {
        t.current = null;
      };
  }
  function _f(e, t, l) {
    l = l != null ? l.concat([e]) : null, ns(4, 4, xf.bind(null, t, e), l);
  }
  function ci() {
  }
  function Sf(e, t) {
    var l = st();
    t = t === void 0 ? null : t;
    var a = l.memoizedState;
    return t !== null && $c(t, a[1]) ? a[0] : (l.memoizedState = [e, t], e);
  }
  function jf(e, t) {
    var l = st();
    t = t === void 0 ? null : t;
    var a = l.memoizedState;
    if (t !== null && $c(t, a[1]))
      return a[0];
    if (a = e(), Ca) {
      Gt(!0);
      try {
        e();
      } finally {
        Gt(!1);
      }
    }
    return l.memoizedState = [a, t], a;
  }
  function ii(e, t, l) {
    return l === void 0 || (Al & 1073741824) !== 0 && (Se & 261930) === 0 ? e.memoizedState = t : (e.memoizedState = l, e = Nd(), me.lanes |= e, la |= e, l);
  }
  function Nf(e, t, l, a) {
    return Xt(l, t) ? l : un.current !== null ? (e = ii(e, l, a), Xt(e, t) || (ot = !0), e) : (Al & 42) === 0 || (Al & 1073741824) !== 0 && (Se & 261930) === 0 ? (ot = !0, e.memoizedState = l) : (e = Nd(), me.lanes |= e, la |= e, t);
  }
  function Mf(e, t, l, a, n) {
    var u = q.p;
    q.p = u !== 0 && 8 > u ? u : 8;
    var i = T.T, d = {};
    T.T = d, fi(e, !1, t, l);
    try {
      var v = n(), M = T.S;
      if (M !== null && M(d, v), v !== null && typeof v == "object" && typeof v.then == "function") {
        var A = R0(
          v,
          a
        );
        Pn(
          e,
          t,
          A,
          Wt(e)
        );
      } else
        Pn(
          e,
          t,
          a,
          Wt(e)
        );
    } catch (O) {
      Pn(
        e,
        t,
        { then: function() {
        }, status: "rejected", reason: O },
        Wt()
      );
    } finally {
      q.p = u, i !== null && d.types !== null && (i.types = d.types), T.T = i;
    }
  }
  function L0() {
  }
  function ri(e, t, l, a) {
    if (e.tag !== 5) throw Error(o(476));
    var n = wf(e).queue;
    Mf(
      e,
      n,
      t,
      ee,
      l === null ? L0 : function() {
        return Ef(e), l(a);
      }
    );
  }
  function wf(e) {
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
        lastRenderedReducer: Cl,
        lastRenderedState: ee
      },
      next: null
    };
    var l = {};
    return t.next = {
      memoizedState: l,
      baseState: l,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Cl,
        lastRenderedState: l
      },
      next: null
    }, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
  }
  function Ef(e) {
    var t = wf(e);
    t.next === null && (t = e.alternate.memoizedState), Pn(
      e,
      t.next.queue,
      {},
      Wt()
    );
  }
  function oi() {
    return jt(vu);
  }
  function Tf() {
    return st().memoizedState;
  }
  function zf() {
    return st().memoizedState;
  }
  function Y0(e) {
    for (var t = e.return; t !== null; ) {
      switch (t.tag) {
        case 24:
        case 3:
          var l = Wt();
          e = $l(l);
          var a = Fl(t, e, l);
          a !== null && (kt(a, t, l), Jn(a, t, l)), t = { cache: kc() }, e.payload = t;
          return;
      }
      t = t.return;
    }
  }
  function G0(e, t, l) {
    var a = Wt();
    l = {
      lane: a,
      revertLane: 0,
      gesture: null,
      action: l,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, us(e) ? Cf(t, l) : (l = Tc(e, t, l, a), l !== null && (kt(l, e, a), Of(l, t, a)));
  }
  function Af(e, t, l) {
    var a = Wt();
    Pn(e, t, l, a);
  }
  function Pn(e, t, l, a) {
    var n = {
      lane: a,
      revertLane: 0,
      gesture: null,
      action: l,
      hasEagerState: !1,
      eagerState: null,
      next: null
    };
    if (us(e)) Cf(t, n);
    else {
      var u = e.alternate;
      if (e.lanes === 0 && (u === null || u.lanes === 0) && (u = t.lastRenderedReducer, u !== null))
        try {
          var i = t.lastRenderedState, d = u(i, l);
          if (n.hasEagerState = !0, n.eagerState = d, Xt(d, i))
            return ku(e, t, n, 0), Ge === null && qu(), !1;
        } catch {
        } finally {
        }
      if (l = Tc(e, t, n, a), l !== null)
        return kt(l, e, a), Of(l, t, a), !0;
    }
    return !1;
  }
  function fi(e, t, l, a) {
    if (a = {
      lane: 2,
      revertLane: Xi(),
      gesture: null,
      action: a,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, us(e)) {
      if (t) throw Error(o(479));
    } else
      t = Tc(
        e,
        l,
        a,
        2
      ), t !== null && kt(t, e, 2);
  }
  function us(e) {
    var t = e.alternate;
    return e === me || t !== null && t === me;
  }
  function Cf(e, t) {
    sn = Iu = !0;
    var l = e.pending;
    l === null ? t.next = t : (t.next = l.next, l.next = t), e.pending = t;
  }
  function Of(e, t, l) {
    if ((l & 4194048) !== 0) {
      var a = t.lanes;
      a &= e.pendingLanes, l |= a, t.lanes = l, Ur(e, l);
    }
  }
  var eu = {
    readContext: jt,
    use: ts,
    useCallback: lt,
    useContext: lt,
    useEffect: lt,
    useImperativeHandle: lt,
    useLayoutEffect: lt,
    useInsertionEffect: lt,
    useMemo: lt,
    useReducer: lt,
    useRef: lt,
    useState: lt,
    useDebugValue: lt,
    useDeferredValue: lt,
    useTransition: lt,
    useSyncExternalStore: lt,
    useId: lt,
    useHostTransitionStatus: lt,
    useFormState: lt,
    useActionState: lt,
    useOptimistic: lt,
    useMemoCache: lt,
    useCacheRefresh: lt
  };
  eu.useEffectEvent = lt;
  var Df = {
    readContext: jt,
    use: ts,
    useCallback: function(e, t) {
      return At().memoizedState = [
        e,
        t === void 0 ? null : t
      ], e;
    },
    useContext: jt,
    useEffect: vf,
    useImperativeHandle: function(e, t, l) {
      l = l != null ? l.concat([e]) : null, as(
        4194308,
        4,
        xf.bind(null, t, e),
        l
      );
    },
    useLayoutEffect: function(e, t) {
      return as(4194308, 4, e, t);
    },
    useInsertionEffect: function(e, t) {
      as(4, 2, e, t);
    },
    useMemo: function(e, t) {
      var l = At();
      t = t === void 0 ? null : t;
      var a = e();
      if (Ca) {
        Gt(!0);
        try {
          e();
        } finally {
          Gt(!1);
        }
      }
      return l.memoizedState = [a, t], a;
    },
    useReducer: function(e, t, l) {
      var a = At();
      if (l !== void 0) {
        var n = l(t);
        if (Ca) {
          Gt(!0);
          try {
            l(t);
          } finally {
            Gt(!1);
          }
        }
      } else n = t;
      return a.memoizedState = a.baseState = n, e = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: e,
        lastRenderedState: n
      }, a.queue = e, e = e.dispatch = G0.bind(
        null,
        me,
        e
      ), [a.memoizedState, e];
    },
    useRef: function(e) {
      var t = At();
      return e = { current: e }, t.memoizedState = e;
    },
    useState: function(e) {
      e = ni(e);
      var t = e.queue, l = Af.bind(null, me, t);
      return t.dispatch = l, [e.memoizedState, l];
    },
    useDebugValue: ci,
    useDeferredValue: function(e, t) {
      var l = At();
      return ii(l, e, t);
    },
    useTransition: function() {
      var e = ni(!1);
      return e = Mf.bind(
        null,
        me,
        e.queue,
        !0,
        !1
      ), At().memoizedState = e, [!1, e];
    },
    useSyncExternalStore: function(e, t, l) {
      var a = me, n = At();
      if (Ne) {
        if (l === void 0)
          throw Error(o(407));
        l = l();
      } else {
        if (l = t(), Ge === null)
          throw Error(o(349));
        (Se & 127) !== 0 || Po(a, t, l);
      }
      n.memoizedState = l;
      var u = { value: l, getSnapshot: t };
      return n.queue = u, vf(tf.bind(null, a, u, e), [
        e
      ]), a.flags |= 2048, rn(
        9,
        { destroy: void 0 },
        ef.bind(
          null,
          a,
          u,
          l,
          t
        ),
        null
      ), l;
    },
    useId: function() {
      var e = At(), t = Ge.identifierPrefix;
      if (Ne) {
        var l = yl, a = pl;
        l = (a & ~(1 << 32 - Tt(a) - 1)).toString(32) + l, t = "_" + t + "R_" + l, l = Pu++, 0 < l && (t += "H" + l.toString(32)), t += "_";
      } else
        l = U0++, t = "_" + t + "r_" + l.toString(32) + "_";
      return e.memoizedState = t;
    },
    useHostTransitionStatus: oi,
    useFormState: ff,
    useActionState: ff,
    useOptimistic: function(e) {
      var t = At();
      t.memoizedState = t.baseState = e;
      var l = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null
      };
      return t.queue = l, t = fi.bind(
        null,
        me,
        !0,
        l
      ), l.dispatch = t, [e, t];
    },
    useMemoCache: ti,
    useCacheRefresh: function() {
      return At().memoizedState = Y0.bind(
        null,
        me
      );
    },
    useEffectEvent: function(e) {
      var t = At(), l = { impl: e };
      return t.memoizedState = l, function() {
        if ((Oe & 2) !== 0)
          throw Error(o(440));
        return l.impl.apply(void 0, arguments);
      };
    }
  }, di = {
    readContext: jt,
    use: ts,
    useCallback: Sf,
    useContext: jt,
    useEffect: si,
    useImperativeHandle: _f,
    useInsertionEffect: yf,
    useLayoutEffect: bf,
    useMemo: jf,
    useReducer: ls,
    useRef: gf,
    useState: function() {
      return ls(Cl);
    },
    useDebugValue: ci,
    useDeferredValue: function(e, t) {
      var l = st();
      return Nf(
        l,
        Be.memoizedState,
        e,
        t
      );
    },
    useTransition: function() {
      var e = ls(Cl)[0], t = st().memoizedState;
      return [
        typeof e == "boolean" ? e : In(e),
        t
      ];
    },
    useSyncExternalStore: Io,
    useId: Tf,
    useHostTransitionStatus: oi,
    useFormState: df,
    useActionState: df,
    useOptimistic: function(e, t) {
      var l = st();
      return nf(l, Be, e, t);
    },
    useMemoCache: ti,
    useCacheRefresh: zf
  };
  di.useEffectEvent = pf;
  var Rf = {
    readContext: jt,
    use: ts,
    useCallback: Sf,
    useContext: jt,
    useEffect: si,
    useImperativeHandle: _f,
    useInsertionEffect: yf,
    useLayoutEffect: bf,
    useMemo: jf,
    useReducer: ai,
    useRef: gf,
    useState: function() {
      return ai(Cl);
    },
    useDebugValue: ci,
    useDeferredValue: function(e, t) {
      var l = st();
      return Be === null ? ii(l, e, t) : Nf(
        l,
        Be.memoizedState,
        e,
        t
      );
    },
    useTransition: function() {
      var e = ai(Cl)[0], t = st().memoizedState;
      return [
        typeof e == "boolean" ? e : In(e),
        t
      ];
    },
    useSyncExternalStore: Io,
    useId: Tf,
    useHostTransitionStatus: oi,
    useFormState: hf,
    useActionState: hf,
    useOptimistic: function(e, t) {
      var l = st();
      return Be !== null ? nf(l, Be, e, t) : (l.baseState = e, [e, l.queue.dispatch]);
    },
    useMemoCache: ti,
    useCacheRefresh: zf
  };
  Rf.useEffectEvent = pf;
  function mi(e, t, l, a) {
    t = e.memoizedState, l = l(a, t), l = l == null ? t : z({}, t, l), e.memoizedState = l, e.lanes === 0 && (e.updateQueue.baseState = l);
  }
  var hi = {
    enqueueSetState: function(e, t, l) {
      e = e._reactInternals;
      var a = Wt(), n = $l(a);
      n.payload = t, l != null && (n.callback = l), t = Fl(e, n, a), t !== null && (kt(t, e, a), Jn(t, e, a));
    },
    enqueueReplaceState: function(e, t, l) {
      e = e._reactInternals;
      var a = Wt(), n = $l(a);
      n.tag = 1, n.payload = t, l != null && (n.callback = l), t = Fl(e, n, a), t !== null && (kt(t, e, a), Jn(t, e, a));
    },
    enqueueForceUpdate: function(e, t) {
      e = e._reactInternals;
      var l = Wt(), a = $l(l);
      a.tag = 2, t != null && (a.callback = t), t = Fl(e, a, l), t !== null && (kt(t, e, l), Jn(t, e, l));
    }
  };
  function Uf(e, t, l, a, n, u, i) {
    return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(a, u, i) : t.prototype && t.prototype.isPureReactComponent ? !Ln(l, a) || !Ln(n, u) : !0;
  }
  function Hf(e, t, l, a) {
    e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(l, a), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(l, a), t.state !== e && hi.enqueueReplaceState(t, t.state, null);
  }
  function Oa(e, t) {
    var l = t;
    if ("ref" in t) {
      l = {};
      for (var a in t)
        a !== "ref" && (l[a] = t[a]);
    }
    if (e = e.defaultProps) {
      l === t && (l = z({}, l));
      for (var n in e)
        l[n] === void 0 && (l[n] = e[n]);
    }
    return l;
  }
  function Bf(e) {
    Bu(e);
  }
  function qf(e) {
    console.error(e);
  }
  function kf(e) {
    Bu(e);
  }
  function ss(e, t) {
    try {
      var l = e.onUncaughtError;
      l(t.value, { componentStack: t.stack });
    } catch (a) {
      setTimeout(function() {
        throw a;
      });
    }
  }
  function Lf(e, t, l) {
    try {
      var a = e.onCaughtError;
      a(l.value, {
        componentStack: l.stack,
        errorBoundary: t.tag === 1 ? t.stateNode : null
      });
    } catch (n) {
      setTimeout(function() {
        throw n;
      });
    }
  }
  function gi(e, t, l) {
    return l = $l(l), l.tag = 3, l.payload = { element: null }, l.callback = function() {
      ss(e, t);
    }, l;
  }
  function Yf(e) {
    return e = $l(e), e.tag = 3, e;
  }
  function Gf(e, t, l, a) {
    var n = l.type.getDerivedStateFromError;
    if (typeof n == "function") {
      var u = a.value;
      e.payload = function() {
        return n(u);
      }, e.callback = function() {
        Lf(t, l, a);
      };
    }
    var i = l.stateNode;
    i !== null && typeof i.componentDidCatch == "function" && (e.callback = function() {
      Lf(t, l, a), typeof n != "function" && (aa === null ? aa = /* @__PURE__ */ new Set([this]) : aa.add(this));
      var d = a.stack;
      this.componentDidCatch(a.value, {
        componentStack: d !== null ? d : ""
      });
    });
  }
  function X0(e, t, l, a, n) {
    if (l.flags |= 32768, a !== null && typeof a == "object" && typeof a.then == "function") {
      if (t = l.alternate, t !== null && en(
        t,
        l,
        n,
        !0
      ), l = Qt.current, l !== null) {
        switch (l.tag) {
          case 31:
          case 13:
            return il === null ? ys() : l.alternate === null && at === 0 && (at = 3), l.flags &= -257, l.flags |= 65536, l.lanes = n, a === Ku ? l.flags |= 16384 : (t = l.updateQueue, t === null ? l.updateQueue = /* @__PURE__ */ new Set([a]) : t.add(a), Li(e, a, n)), !1;
          case 22:
            return l.flags |= 65536, a === Ku ? l.flags |= 16384 : (t = l.updateQueue, t === null ? (t = {
              transitions: null,
              markerInstances: null,
              retryQueue: /* @__PURE__ */ new Set([a])
            }, l.updateQueue = t) : (l = t.retryQueue, l === null ? t.retryQueue = /* @__PURE__ */ new Set([a]) : l.add(a)), Li(e, a, n)), !1;
        }
        throw Error(o(435, l.tag));
      }
      return Li(e, a, n), ys(), !1;
    }
    if (Ne)
      return t = Qt.current, t !== null ? ((t.flags & 65536) === 0 && (t.flags |= 256), t.flags |= 65536, t.lanes = n, a !== Rc && (e = Error(o(422), { cause: a }), Xn(nl(e, l)))) : (a !== Rc && (t = Error(o(423), {
        cause: a
      }), Xn(
        nl(t, l)
      )), e = e.current.alternate, e.flags |= 65536, n &= -n, e.lanes |= n, a = nl(a, l), n = gi(
        e.stateNode,
        a,
        n
      ), Qc(e, n), at !== 4 && (at = 2)), !1;
    var u = Error(o(520), { cause: a });
    if (u = nl(u, l), iu === null ? iu = [u] : iu.push(u), at !== 4 && (at = 2), t === null) return !0;
    a = nl(a, l), l = t;
    do {
      switch (l.tag) {
        case 3:
          return l.flags |= 65536, e = n & -n, l.lanes |= e, e = gi(l.stateNode, a, e), Qc(l, e), !1;
        case 1:
          if (t = l.type, u = l.stateNode, (l.flags & 128) === 0 && (typeof t.getDerivedStateFromError == "function" || u !== null && typeof u.componentDidCatch == "function" && (aa === null || !aa.has(u))))
            return l.flags |= 65536, n &= -n, l.lanes |= n, n = Yf(n), Gf(
              n,
              e,
              l,
              a
            ), Qc(l, n), !1;
      }
      l = l.return;
    } while (l !== null);
    return !1;
  }
  var vi = Error(o(461)), ot = !1;
  function Nt(e, t, l, a) {
    t.child = e === null ? Qo(t, null, l, a) : Aa(
      t,
      e.child,
      l,
      a
    );
  }
  function Xf(e, t, l, a, n) {
    l = l.render;
    var u = t.ref;
    if ("ref" in a) {
      var i = {};
      for (var d in a)
        d !== "ref" && (i[d] = a[d]);
    } else i = a;
    return wa(t), a = Fc(
      e,
      t,
      l,
      i,
      u,
      n
    ), d = Ic(), e !== null && !ot ? (Pc(e, t, n), Ol(e, t, n)) : (Ne && d && Oc(t), t.flags |= 1, Nt(e, t, a, n), t.child);
  }
  function Vf(e, t, l, a, n) {
    if (e === null) {
      var u = l.type;
      return typeof u == "function" && !zc(u) && u.defaultProps === void 0 && l.compare === null ? (t.tag = 15, t.type = u, Qf(
        e,
        t,
        u,
        a,
        n
      )) : (e = Yu(
        l.type,
        null,
        a,
        t,
        t.mode,
        n
      ), e.ref = t.ref, e.return = t, t.child = e);
    }
    if (u = e.child, !Ni(e, n)) {
      var i = u.memoizedProps;
      if (l = l.compare, l = l !== null ? l : Ln, l(i, a) && e.ref === t.ref)
        return Ol(e, t, n);
    }
    return t.flags |= 1, e = wl(u, a), e.ref = t.ref, e.return = t, t.child = e;
  }
  function Qf(e, t, l, a, n) {
    if (e !== null) {
      var u = e.memoizedProps;
      if (Ln(u, a) && e.ref === t.ref)
        if (ot = !1, t.pendingProps = a = u, Ni(e, n))
          (e.flags & 131072) !== 0 && (ot = !0);
        else
          return t.lanes = e.lanes, Ol(e, t, n);
    }
    return pi(
      e,
      t,
      l,
      a,
      n
    );
  }
  function Zf(e, t, l, a) {
    var n = a.children, u = e !== null ? e.memoizedState : null;
    if (e === null && t.stateNode === null && (t.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), a.mode === "hidden") {
      if ((t.flags & 128) !== 0) {
        if (u = u !== null ? u.baseLanes | l : l, e !== null) {
          for (a = t.child = e.child, n = 0; a !== null; )
            n = n | a.lanes | a.childLanes, a = a.sibling;
          a = n & ~u;
        } else a = 0, t.child = null;
        return Kf(
          e,
          t,
          u,
          l,
          a
        );
      }
      if ((l & 536870912) !== 0)
        t.memoizedState = { baseLanes: 0, cachePool: null }, e !== null && Qu(
          t,
          u !== null ? u.cachePool : null
        ), u !== null ? Jo(t, u) : Kc(), Wo(t);
      else
        return a = t.lanes = 536870912, Kf(
          e,
          t,
          u !== null ? u.baseLanes | l : l,
          l,
          a
        );
    } else
      u !== null ? (Qu(t, u.cachePool), Jo(t, u), Pl(), t.memoizedState = null) : (e !== null && Qu(t, null), Kc(), Pl());
    return Nt(e, t, n, l), t.child;
  }
  function tu(e, t) {
    return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), t.sibling;
  }
  function Kf(e, t, l, a, n) {
    var u = Yc();
    return u = u === null ? null : { parent: it._currentValue, pool: u }, t.memoizedState = {
      baseLanes: l,
      cachePool: u
    }, e !== null && Qu(t, null), Kc(), Wo(t), e !== null && en(e, t, a, !0), t.childLanes = n, null;
  }
  function cs(e, t) {
    return t = rs(
      { mode: t.mode, children: t.children },
      e.mode
    ), t.ref = e.ref, e.child = t, t.return = e, t;
  }
  function Jf(e, t, l) {
    return Aa(t, e.child, null, l), e = cs(t, t.pendingProps), e.flags |= 2, Zt(t), t.memoizedState = null, e;
  }
  function V0(e, t, l) {
    var a = t.pendingProps, n = (t.flags & 128) !== 0;
    if (t.flags &= -129, e === null) {
      if (Ne) {
        if (a.mode === "hidden")
          return e = cs(t, a), t.lanes = 536870912, tu(null, e);
        if (Wc(t), (e = Je) ? (e = sm(
          e,
          cl
        ), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
          dehydrated: e,
          treeContext: Ql !== null ? { id: pl, overflow: yl } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, l = Ao(e), l.return = t, t.child = l, St = t, Je = null)) : e = null, e === null) throw Kl(t);
        return t.lanes = 536870912, null;
      }
      return cs(t, a);
    }
    var u = e.memoizedState;
    if (u !== null) {
      var i = u.dehydrated;
      if (Wc(t), n)
        if (t.flags & 256)
          t.flags &= -257, t = Jf(
            e,
            t,
            l
          );
        else if (t.memoizedState !== null)
          t.child = e.child, t.flags |= 128, t = null;
        else throw Error(o(558));
      else if (ot || en(e, t, l, !1), n = (l & e.childLanes) !== 0, ot || n) {
        if (a = Ge, a !== null && (i = Hr(a, l), i !== 0 && i !== u.retryLane))
          throw u.retryLane = i, Sa(e, i), kt(a, e, i), vi;
        ys(), t = Jf(
          e,
          t,
          l
        );
      } else
        e = u.treeContext, Je = rl(i.nextSibling), St = t, Ne = !0, Zl = null, cl = !1, e !== null && Do(t, e), t = cs(t, a), t.flags |= 4096;
      return t;
    }
    return e = wl(e.child, {
      mode: a.mode,
      children: a.children
    }), e.ref = t.ref, t.child = e, e.return = t, e;
  }
  function is(e, t) {
    var l = t.ref;
    if (l === null)
      e !== null && e.ref !== null && (t.flags |= 4194816);
    else {
      if (typeof l != "function" && typeof l != "object")
        throw Error(o(284));
      (e === null || e.ref !== l) && (t.flags |= 4194816);
    }
  }
  function pi(e, t, l, a, n) {
    return wa(t), l = Fc(
      e,
      t,
      l,
      a,
      void 0,
      n
    ), a = Ic(), e !== null && !ot ? (Pc(e, t, n), Ol(e, t, n)) : (Ne && a && Oc(t), t.flags |= 1, Nt(e, t, l, n), t.child);
  }
  function Wf(e, t, l, a, n, u) {
    return wa(t), t.updateQueue = null, l = Fo(
      t,
      a,
      l,
      n
    ), $o(e), a = Ic(), e !== null && !ot ? (Pc(e, t, u), Ol(e, t, u)) : (Ne && a && Oc(t), t.flags |= 1, Nt(e, t, l, u), t.child);
  }
  function $f(e, t, l, a, n) {
    if (wa(t), t.stateNode === null) {
      var u = $a, i = l.contextType;
      typeof i == "object" && i !== null && (u = jt(i)), u = new l(a, u), t.memoizedState = u.state !== null && u.state !== void 0 ? u.state : null, u.updater = hi, t.stateNode = u, u._reactInternals = t, u = t.stateNode, u.props = a, u.state = t.memoizedState, u.refs = {}, Xc(t), i = l.contextType, u.context = typeof i == "object" && i !== null ? jt(i) : $a, u.state = t.memoizedState, i = l.getDerivedStateFromProps, typeof i == "function" && (mi(
        t,
        l,
        i,
        a
      ), u.state = t.memoizedState), typeof l.getDerivedStateFromProps == "function" || typeof u.getSnapshotBeforeUpdate == "function" || typeof u.UNSAFE_componentWillMount != "function" && typeof u.componentWillMount != "function" || (i = u.state, typeof u.componentWillMount == "function" && u.componentWillMount(), typeof u.UNSAFE_componentWillMount == "function" && u.UNSAFE_componentWillMount(), i !== u.state && hi.enqueueReplaceState(u, u.state, null), $n(t, a, u, n), Wn(), u.state = t.memoizedState), typeof u.componentDidMount == "function" && (t.flags |= 4194308), a = !0;
    } else if (e === null) {
      u = t.stateNode;
      var d = t.memoizedProps, v = Oa(l, d);
      u.props = v;
      var M = u.context, A = l.contextType;
      i = $a, typeof A == "object" && A !== null && (i = jt(A));
      var O = l.getDerivedStateFromProps;
      A = typeof O == "function" || typeof u.getSnapshotBeforeUpdate == "function", d = t.pendingProps !== d, A || typeof u.UNSAFE_componentWillReceiveProps != "function" && typeof u.componentWillReceiveProps != "function" || (d || M !== i) && Hf(
        t,
        u,
        a,
        i
      ), Wl = !1;
      var w = t.memoizedState;
      u.state = w, $n(t, a, u, n), Wn(), M = t.memoizedState, d || w !== M || Wl ? (typeof O == "function" && (mi(
        t,
        l,
        O,
        a
      ), M = t.memoizedState), (v = Wl || Uf(
        t,
        l,
        v,
        a,
        w,
        M,
        i
      )) ? (A || typeof u.UNSAFE_componentWillMount != "function" && typeof u.componentWillMount != "function" || (typeof u.componentWillMount == "function" && u.componentWillMount(), typeof u.UNSAFE_componentWillMount == "function" && u.UNSAFE_componentWillMount()), typeof u.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof u.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = a, t.memoizedState = M), u.props = a, u.state = M, u.context = i, a = v) : (typeof u.componentDidMount == "function" && (t.flags |= 4194308), a = !1);
    } else {
      u = t.stateNode, Vc(e, t), i = t.memoizedProps, A = Oa(l, i), u.props = A, O = t.pendingProps, w = u.context, M = l.contextType, v = $a, typeof M == "object" && M !== null && (v = jt(M)), d = l.getDerivedStateFromProps, (M = typeof d == "function" || typeof u.getSnapshotBeforeUpdate == "function") || typeof u.UNSAFE_componentWillReceiveProps != "function" && typeof u.componentWillReceiveProps != "function" || (i !== O || w !== v) && Hf(
        t,
        u,
        a,
        v
      ), Wl = !1, w = t.memoizedState, u.state = w, $n(t, a, u, n), Wn();
      var E = t.memoizedState;
      i !== O || w !== E || Wl || e !== null && e.dependencies !== null && Xu(e.dependencies) ? (typeof d == "function" && (mi(
        t,
        l,
        d,
        a
      ), E = t.memoizedState), (A = Wl || Uf(
        t,
        l,
        A,
        a,
        w,
        E,
        v
      ) || e !== null && e.dependencies !== null && Xu(e.dependencies)) ? (M || typeof u.UNSAFE_componentWillUpdate != "function" && typeof u.componentWillUpdate != "function" || (typeof u.componentWillUpdate == "function" && u.componentWillUpdate(a, E, v), typeof u.UNSAFE_componentWillUpdate == "function" && u.UNSAFE_componentWillUpdate(
        a,
        E,
        v
      )), typeof u.componentDidUpdate == "function" && (t.flags |= 4), typeof u.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof u.componentDidUpdate != "function" || i === e.memoizedProps && w === e.memoizedState || (t.flags |= 4), typeof u.getSnapshotBeforeUpdate != "function" || i === e.memoizedProps && w === e.memoizedState || (t.flags |= 1024), t.memoizedProps = a, t.memoizedState = E), u.props = a, u.state = E, u.context = v, a = A) : (typeof u.componentDidUpdate != "function" || i === e.memoizedProps && w === e.memoizedState || (t.flags |= 4), typeof u.getSnapshotBeforeUpdate != "function" || i === e.memoizedProps && w === e.memoizedState || (t.flags |= 1024), a = !1);
    }
    return u = a, is(e, t), a = (t.flags & 128) !== 0, u || a ? (u = t.stateNode, l = a && typeof l.getDerivedStateFromError != "function" ? null : u.render(), t.flags |= 1, e !== null && a ? (t.child = Aa(
      t,
      e.child,
      null,
      n
    ), t.child = Aa(
      t,
      null,
      l,
      n
    )) : Nt(e, t, l, n), t.memoizedState = u.state, e = t.child) : e = Ol(
      e,
      t,
      n
    ), e;
  }
  function Ff(e, t, l, a) {
    return Na(), t.flags |= 256, Nt(e, t, l, a), t.child;
  }
  var yi = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0,
    hydrationErrors: null
  };
  function bi(e) {
    return { baseLanes: e, cachePool: ko() };
  }
  function xi(e, t, l) {
    return e = e !== null ? e.childLanes & ~l : 0, t && (e |= Jt), e;
  }
  function If(e, t, l) {
    var a = t.pendingProps, n = !1, u = (t.flags & 128) !== 0, i;
    if ((i = u) || (i = e !== null && e.memoizedState === null ? !1 : (ut.current & 2) !== 0), i && (n = !0, t.flags &= -129), i = (t.flags & 32) !== 0, t.flags &= -33, e === null) {
      if (Ne) {
        if (n ? Il(t) : Pl(), (e = Je) ? (e = sm(
          e,
          cl
        ), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
          dehydrated: e,
          treeContext: Ql !== null ? { id: pl, overflow: yl } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, l = Ao(e), l.return = t, t.child = l, St = t, Je = null)) : e = null, e === null) throw Kl(t);
        return lr(e) ? t.lanes = 32 : t.lanes = 536870912, null;
      }
      var d = a.children;
      return a = a.fallback, n ? (Pl(), n = t.mode, d = rs(
        { mode: "hidden", children: d },
        n
      ), a = ja(
        a,
        n,
        l,
        null
      ), d.return = t, a.return = t, d.sibling = a, t.child = d, a = t.child, a.memoizedState = bi(l), a.childLanes = xi(
        e,
        i,
        l
      ), t.memoizedState = yi, tu(null, a)) : (Il(t), _i(t, d));
    }
    var v = e.memoizedState;
    if (v !== null && (d = v.dehydrated, d !== null)) {
      if (u)
        t.flags & 256 ? (Il(t), t.flags &= -257, t = Si(
          e,
          t,
          l
        )) : t.memoizedState !== null ? (Pl(), t.child = e.child, t.flags |= 128, t = null) : (Pl(), d = a.fallback, n = t.mode, a = rs(
          { mode: "visible", children: a.children },
          n
        ), d = ja(
          d,
          n,
          l,
          null
        ), d.flags |= 2, a.return = t, d.return = t, a.sibling = d, t.child = a, Aa(
          t,
          e.child,
          null,
          l
        ), a = t.child, a.memoizedState = bi(l), a.childLanes = xi(
          e,
          i,
          l
        ), t.memoizedState = yi, t = tu(null, a));
      else if (Il(t), lr(d)) {
        if (i = d.nextSibling && d.nextSibling.dataset, i) var M = i.dgst;
        i = M, a = Error(o(419)), a.stack = "", a.digest = i, Xn({ value: a, source: null, stack: null }), t = Si(
          e,
          t,
          l
        );
      } else if (ot || en(e, t, l, !1), i = (l & e.childLanes) !== 0, ot || i) {
        if (i = Ge, i !== null && (a = Hr(i, l), a !== 0 && a !== v.retryLane))
          throw v.retryLane = a, Sa(e, a), kt(i, e, a), vi;
        tr(d) || ys(), t = Si(
          e,
          t,
          l
        );
      } else
        tr(d) ? (t.flags |= 192, t.child = e.child, t = null) : (e = v.treeContext, Je = rl(
          d.nextSibling
        ), St = t, Ne = !0, Zl = null, cl = !1, e !== null && Do(t, e), t = _i(
          t,
          a.children
        ), t.flags |= 4096);
      return t;
    }
    return n ? (Pl(), d = a.fallback, n = t.mode, v = e.child, M = v.sibling, a = wl(v, {
      mode: "hidden",
      children: a.children
    }), a.subtreeFlags = v.subtreeFlags & 65011712, M !== null ? d = wl(
      M,
      d
    ) : (d = ja(
      d,
      n,
      l,
      null
    ), d.flags |= 2), d.return = t, a.return = t, a.sibling = d, t.child = a, tu(null, a), a = t.child, d = e.child.memoizedState, d === null ? d = bi(l) : (n = d.cachePool, n !== null ? (v = it._currentValue, n = n.parent !== v ? { parent: v, pool: v } : n) : n = ko(), d = {
      baseLanes: d.baseLanes | l,
      cachePool: n
    }), a.memoizedState = d, a.childLanes = xi(
      e,
      i,
      l
    ), t.memoizedState = yi, tu(e.child, a)) : (Il(t), l = e.child, e = l.sibling, l = wl(l, {
      mode: "visible",
      children: a.children
    }), l.return = t, l.sibling = null, e !== null && (i = t.deletions, i === null ? (t.deletions = [e], t.flags |= 16) : i.push(e)), t.child = l, t.memoizedState = null, l);
  }
  function _i(e, t) {
    return t = rs(
      { mode: "visible", children: t },
      e.mode
    ), t.return = e, e.child = t;
  }
  function rs(e, t) {
    return e = Vt(22, e, null, t), e.lanes = 0, e;
  }
  function Si(e, t, l) {
    return Aa(t, e.child, null, l), e = _i(
      t,
      t.pendingProps.children
    ), e.flags |= 2, t.memoizedState = null, e;
  }
  function Pf(e, t, l) {
    e.lanes |= t;
    var a = e.alternate;
    a !== null && (a.lanes |= t), Bc(e.return, t, l);
  }
  function ji(e, t, l, a, n, u) {
    var i = e.memoizedState;
    i === null ? e.memoizedState = {
      isBackwards: t,
      rendering: null,
      renderingStartTime: 0,
      last: a,
      tail: l,
      tailMode: n,
      treeForkCount: u
    } : (i.isBackwards = t, i.rendering = null, i.renderingStartTime = 0, i.last = a, i.tail = l, i.tailMode = n, i.treeForkCount = u);
  }
  function ed(e, t, l) {
    var a = t.pendingProps, n = a.revealOrder, u = a.tail;
    a = a.children;
    var i = ut.current, d = (i & 2) !== 0;
    if (d ? (i = i & 1 | 2, t.flags |= 128) : i &= 1, Y(ut, i), Nt(e, t, a, l), a = Ne ? Gn : 0, !d && e !== null && (e.flags & 128) !== 0)
      e: for (e = t.child; e !== null; ) {
        if (e.tag === 13)
          e.memoizedState !== null && Pf(e, l, t);
        else if (e.tag === 19)
          Pf(e, l, t);
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
    switch (n) {
      case "forwards":
        for (l = t.child, n = null; l !== null; )
          e = l.alternate, e !== null && Fu(e) === null && (n = l), l = l.sibling;
        l = n, l === null ? (n = t.child, t.child = null) : (n = l.sibling, l.sibling = null), ji(
          t,
          !1,
          n,
          l,
          u,
          a
        );
        break;
      case "backwards":
      case "unstable_legacy-backwards":
        for (l = null, n = t.child, t.child = null; n !== null; ) {
          if (e = n.alternate, e !== null && Fu(e) === null) {
            t.child = n;
            break;
          }
          e = n.sibling, n.sibling = l, l = n, n = e;
        }
        ji(
          t,
          !0,
          l,
          null,
          u,
          a
        );
        break;
      case "together":
        ji(
          t,
          !1,
          null,
          null,
          void 0,
          a
        );
        break;
      default:
        t.memoizedState = null;
    }
    return t.child;
  }
  function Ol(e, t, l) {
    if (e !== null && (t.dependencies = e.dependencies), la |= t.lanes, (l & t.childLanes) === 0)
      if (e !== null) {
        if (en(
          e,
          t,
          l,
          !1
        ), (l & t.childLanes) === 0)
          return null;
      } else return null;
    if (e !== null && t.child !== e.child)
      throw Error(o(153));
    if (t.child !== null) {
      for (e = t.child, l = wl(e, e.pendingProps), t.child = l, l.return = t; e.sibling !== null; )
        e = e.sibling, l = l.sibling = wl(e, e.pendingProps), l.return = t;
      l.sibling = null;
    }
    return t.child;
  }
  function Ni(e, t) {
    return (e.lanes & t) !== 0 ? !0 : (e = e.dependencies, !!(e !== null && Xu(e)));
  }
  function Q0(e, t, l) {
    switch (t.tag) {
      case 3:
        ye(t, t.stateNode.containerInfo), Jl(t, it, e.memoizedState.cache), Na();
        break;
      case 27:
      case 5:
        pt(t);
        break;
      case 4:
        ye(t, t.stateNode.containerInfo);
        break;
      case 10:
        Jl(
          t,
          t.type,
          t.memoizedProps.value
        );
        break;
      case 31:
        if (t.memoizedState !== null)
          return t.flags |= 128, Wc(t), null;
        break;
      case 13:
        var a = t.memoizedState;
        if (a !== null)
          return a.dehydrated !== null ? (Il(t), t.flags |= 128, null) : (l & t.child.childLanes) !== 0 ? If(e, t, l) : (Il(t), e = Ol(
            e,
            t,
            l
          ), e !== null ? e.sibling : null);
        Il(t);
        break;
      case 19:
        var n = (e.flags & 128) !== 0;
        if (a = (l & t.childLanes) !== 0, a || (en(
          e,
          t,
          l,
          !1
        ), a = (l & t.childLanes) !== 0), n) {
          if (a)
            return ed(
              e,
              t,
              l
            );
          t.flags |= 128;
        }
        if (n = t.memoizedState, n !== null && (n.rendering = null, n.tail = null, n.lastEffect = null), Y(ut, ut.current), a) break;
        return null;
      case 22:
        return t.lanes = 0, Zf(
          e,
          t,
          l,
          t.pendingProps
        );
      case 24:
        Jl(t, it, e.memoizedState.cache);
    }
    return Ol(e, t, l);
  }
  function td(e, t, l) {
    if (e !== null)
      if (e.memoizedProps !== t.pendingProps)
        ot = !0;
      else {
        if (!Ni(e, l) && (t.flags & 128) === 0)
          return ot = !1, Q0(
            e,
            t,
            l
          );
        ot = (e.flags & 131072) !== 0;
      }
    else
      ot = !1, Ne && (t.flags & 1048576) !== 0 && Oo(t, Gn, t.index);
    switch (t.lanes = 0, t.tag) {
      case 16:
        e: {
          var a = t.pendingProps;
          if (e = Ta(t.elementType), t.type = e, typeof e == "function")
            zc(e) ? (a = Oa(e, a), t.tag = 1, t = $f(
              null,
              t,
              e,
              a,
              l
            )) : (t.tag = 0, t = pi(
              null,
              t,
              e,
              a,
              l
            ));
          else {
            if (e != null) {
              var n = e.$$typeof;
              if (n === te) {
                t.tag = 11, t = Xf(
                  null,
                  t,
                  e,
                  a,
                  l
                );
                break e;
              } else if (n === J) {
                t.tag = 14, t = Vf(
                  null,
                  t,
                  e,
                  a,
                  l
                );
                break e;
              }
            }
            throw t = tt(e) || e, Error(o(306, t, ""));
          }
        }
        return t;
      case 0:
        return pi(
          e,
          t,
          t.type,
          t.pendingProps,
          l
        );
      case 1:
        return a = t.type, n = Oa(
          a,
          t.pendingProps
        ), $f(
          e,
          t,
          a,
          n,
          l
        );
      case 3:
        e: {
          if (ye(
            t,
            t.stateNode.containerInfo
          ), e === null) throw Error(o(387));
          a = t.pendingProps;
          var u = t.memoizedState;
          n = u.element, Vc(e, t), $n(t, a, null, l);
          var i = t.memoizedState;
          if (a = i.cache, Jl(t, it, a), a !== u.cache && qc(
            t,
            [it],
            l,
            !0
          ), Wn(), a = i.element, u.isDehydrated)
            if (u = {
              element: a,
              isDehydrated: !1,
              cache: i.cache
            }, t.updateQueue.baseState = u, t.memoizedState = u, t.flags & 256) {
              t = Ff(
                e,
                t,
                a,
                l
              );
              break e;
            } else if (a !== n) {
              n = nl(
                Error(o(424)),
                t
              ), Xn(n), t = Ff(
                e,
                t,
                a,
                l
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
              for (Je = rl(e.firstChild), St = t, Ne = !0, Zl = null, cl = !0, l = Qo(
                t,
                null,
                a,
                l
              ), t.child = l; l; )
                l.flags = l.flags & -3 | 4096, l = l.sibling;
            }
          else {
            if (Na(), a === n) {
              t = Ol(
                e,
                t,
                l
              );
              break e;
            }
            Nt(e, t, a, l);
          }
          t = t.child;
        }
        return t;
      case 26:
        return is(e, t), e === null ? (l = dm(
          t.type,
          null,
          t.pendingProps,
          null
        )) ? t.memoizedState = l : Ne || (l = t.type, e = t.pendingProps, a = Ms(
          k.current
        ).createElement(l), a[_t] = t, a[Dt] = e, Mt(a, l, e), gt(a), t.stateNode = a) : t.memoizedState = dm(
          t.type,
          e.memoizedProps,
          t.pendingProps,
          e.memoizedState
        ), null;
      case 27:
        return pt(t), e === null && Ne && (a = t.stateNode = rm(
          t.type,
          t.pendingProps,
          k.current
        ), St = t, cl = !0, n = Je, ca(t.type) ? (ar = n, Je = rl(a.firstChild)) : Je = n), Nt(
          e,
          t,
          t.pendingProps.children,
          l
        ), is(e, t), e === null && (t.flags |= 4194304), t.child;
      case 5:
        return e === null && Ne && ((n = a = Je) && (a = _g(
          a,
          t.type,
          t.pendingProps,
          cl
        ), a !== null ? (t.stateNode = a, St = t, Je = rl(a.firstChild), cl = !1, n = !0) : n = !1), n || Kl(t)), pt(t), n = t.type, u = t.pendingProps, i = e !== null ? e.memoizedProps : null, a = u.children, Ii(n, u) ? a = null : i !== null && Ii(n, i) && (t.flags |= 32), t.memoizedState !== null && (n = Fc(
          e,
          t,
          H0,
          null,
          null,
          l
        ), vu._currentValue = n), is(e, t), Nt(e, t, a, l), t.child;
      case 6:
        return e === null && Ne && ((e = l = Je) && (l = Sg(
          l,
          t.pendingProps,
          cl
        ), l !== null ? (t.stateNode = l, St = t, Je = null, e = !0) : e = !1), e || Kl(t)), null;
      case 13:
        return If(e, t, l);
      case 4:
        return ye(
          t,
          t.stateNode.containerInfo
        ), a = t.pendingProps, e === null ? t.child = Aa(
          t,
          null,
          a,
          l
        ) : Nt(e, t, a, l), t.child;
      case 11:
        return Xf(
          e,
          t,
          t.type,
          t.pendingProps,
          l
        );
      case 7:
        return Nt(
          e,
          t,
          t.pendingProps,
          l
        ), t.child;
      case 8:
        return Nt(
          e,
          t,
          t.pendingProps.children,
          l
        ), t.child;
      case 12:
        return Nt(
          e,
          t,
          t.pendingProps.children,
          l
        ), t.child;
      case 10:
        return a = t.pendingProps, Jl(t, t.type, a.value), Nt(e, t, a.children, l), t.child;
      case 9:
        return n = t.type._context, a = t.pendingProps.children, wa(t), n = jt(n), a = a(n), t.flags |= 1, Nt(e, t, a, l), t.child;
      case 14:
        return Vf(
          e,
          t,
          t.type,
          t.pendingProps,
          l
        );
      case 15:
        return Qf(
          e,
          t,
          t.type,
          t.pendingProps,
          l
        );
      case 19:
        return ed(e, t, l);
      case 31:
        return V0(e, t, l);
      case 22:
        return Zf(
          e,
          t,
          l,
          t.pendingProps
        );
      case 24:
        return wa(t), a = jt(it), e === null ? (n = Yc(), n === null && (n = Ge, u = kc(), n.pooledCache = u, u.refCount++, u !== null && (n.pooledCacheLanes |= l), n = u), t.memoizedState = { parent: a, cache: n }, Xc(t), Jl(t, it, n)) : ((e.lanes & l) !== 0 && (Vc(e, t), $n(t, null, null, l), Wn()), n = e.memoizedState, u = t.memoizedState, n.parent !== a ? (n = { parent: a, cache: a }, t.memoizedState = n, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = n), Jl(t, it, a)) : (a = u.cache, Jl(t, it, a), a !== n.cache && qc(
          t,
          [it],
          l,
          !0
        ))), Nt(
          e,
          t,
          t.pendingProps.children,
          l
        ), t.child;
      case 29:
        throw t.pendingProps;
    }
    throw Error(o(156, t.tag));
  }
  function Dl(e) {
    e.flags |= 4;
  }
  function Mi(e, t, l, a, n) {
    if ((t = (e.mode & 32) !== 0) && (t = !1), t) {
      if (e.flags |= 16777216, (n & 335544128) === n)
        if (e.stateNode.complete) e.flags |= 8192;
        else if (Td()) e.flags |= 8192;
        else
          throw za = Ku, Gc;
    } else e.flags &= -16777217;
  }
  function ld(e, t) {
    if (t.type !== "stylesheet" || (t.state.loading & 4) !== 0)
      e.flags &= -16777217;
    else if (e.flags |= 16777216, !pm(t))
      if (Td()) e.flags |= 8192;
      else
        throw za = Ku, Gc;
  }
  function os(e, t) {
    t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag !== 22 ? Dr() : 536870912, e.lanes |= t, mn |= t);
  }
  function lu(e, t) {
    if (!Ne)
      switch (e.tailMode) {
        case "hidden":
          t = e.tail;
          for (var l = null; t !== null; )
            t.alternate !== null && (l = t), t = t.sibling;
          l === null ? e.tail = null : l.sibling = null;
          break;
        case "collapsed":
          l = e.tail;
          for (var a = null; l !== null; )
            l.alternate !== null && (a = l), l = l.sibling;
          a === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : a.sibling = null;
      }
  }
  function We(e) {
    var t = e.alternate !== null && e.alternate.child === e.child, l = 0, a = 0;
    if (t)
      for (var n = e.child; n !== null; )
        l |= n.lanes | n.childLanes, a |= n.subtreeFlags & 65011712, a |= n.flags & 65011712, n.return = e, n = n.sibling;
    else
      for (n = e.child; n !== null; )
        l |= n.lanes | n.childLanes, a |= n.subtreeFlags, a |= n.flags, n.return = e, n = n.sibling;
    return e.subtreeFlags |= a, e.childLanes = l, t;
  }
  function Z0(e, t, l) {
    var a = t.pendingProps;
    switch (Dc(t), t.tag) {
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return We(t), null;
      case 1:
        return We(t), null;
      case 3:
        return l = t.stateNode, a = null, e !== null && (a = e.memoizedState.cache), t.memoizedState.cache !== a && (t.flags |= 2048), zl(it), Me(), l.pendingContext && (l.context = l.pendingContext, l.pendingContext = null), (e === null || e.child === null) && (Pa(t) ? Dl(t) : e === null || e.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024, Uc())), We(t), null;
      case 26:
        var n = t.type, u = t.memoizedState;
        return e === null ? (Dl(t), u !== null ? (We(t), ld(t, u)) : (We(t), Mi(
          t,
          n,
          null,
          a,
          l
        ))) : u ? u !== e.memoizedState ? (Dl(t), We(t), ld(t, u)) : (We(t), t.flags &= -16777217) : (e = e.memoizedProps, e !== a && Dl(t), We(t), Mi(
          t,
          n,
          e,
          a,
          l
        )), null;
      case 27:
        if (Le(t), l = k.current, n = t.type, e !== null && t.stateNode != null)
          e.memoizedProps !== a && Dl(t);
        else {
          if (!a) {
            if (t.stateNode === null)
              throw Error(o(166));
            return We(t), null;
          }
          e = Q.current, Pa(t) ? Ro(t) : (e = rm(n, a, l), t.stateNode = e, Dl(t));
        }
        return We(t), null;
      case 5:
        if (Le(t), n = t.type, e !== null && t.stateNode != null)
          e.memoizedProps !== a && Dl(t);
        else {
          if (!a) {
            if (t.stateNode === null)
              throw Error(o(166));
            return We(t), null;
          }
          if (u = Q.current, Pa(t))
            Ro(t);
          else {
            var i = Ms(
              k.current
            );
            switch (u) {
              case 1:
                u = i.createElementNS(
                  "http://www.w3.org/2000/svg",
                  n
                );
                break;
              case 2:
                u = i.createElementNS(
                  "http://www.w3.org/1998/Math/MathML",
                  n
                );
                break;
              default:
                switch (n) {
                  case "svg":
                    u = i.createElementNS(
                      "http://www.w3.org/2000/svg",
                      n
                    );
                    break;
                  case "math":
                    u = i.createElementNS(
                      "http://www.w3.org/1998/Math/MathML",
                      n
                    );
                    break;
                  case "script":
                    u = i.createElement("div"), u.innerHTML = "<script><\/script>", u = u.removeChild(
                      u.firstChild
                    );
                    break;
                  case "select":
                    u = typeof a.is == "string" ? i.createElement("select", {
                      is: a.is
                    }) : i.createElement("select"), a.multiple ? u.multiple = !0 : a.size && (u.size = a.size);
                    break;
                  default:
                    u = typeof a.is == "string" ? i.createElement(n, { is: a.is }) : i.createElement(n);
                }
            }
            u[_t] = t, u[Dt] = a;
            e: for (i = t.child; i !== null; ) {
              if (i.tag === 5 || i.tag === 6)
                u.appendChild(i.stateNode);
              else if (i.tag !== 4 && i.tag !== 27 && i.child !== null) {
                i.child.return = i, i = i.child;
                continue;
              }
              if (i === t) break e;
              for (; i.sibling === null; ) {
                if (i.return === null || i.return === t)
                  break e;
                i = i.return;
              }
              i.sibling.return = i.return, i = i.sibling;
            }
            t.stateNode = u;
            e: switch (Mt(u, n, a), n) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                a = !!a.autoFocus;
                break e;
              case "img":
                a = !0;
                break e;
              default:
                a = !1;
            }
            a && Dl(t);
          }
        }
        return We(t), Mi(
          t,
          t.type,
          e === null ? null : e.memoizedProps,
          t.pendingProps,
          l
        ), null;
      case 6:
        if (e && t.stateNode != null)
          e.memoizedProps !== a && Dl(t);
        else {
          if (typeof a != "string" && t.stateNode === null)
            throw Error(o(166));
          if (e = k.current, Pa(t)) {
            if (e = t.stateNode, l = t.memoizedProps, a = null, n = St, n !== null)
              switch (n.tag) {
                case 27:
                case 5:
                  a = n.memoizedProps;
              }
            e[_t] = t, e = !!(e.nodeValue === l || a !== null && a.suppressHydrationWarning === !0 || Id(e.nodeValue, l)), e || Kl(t, !0);
          } else
            e = Ms(e).createTextNode(
              a
            ), e[_t] = t, t.stateNode = e;
        }
        return We(t), null;
      case 31:
        if (l = t.memoizedState, e === null || e.memoizedState !== null) {
          if (a = Pa(t), l !== null) {
            if (e === null) {
              if (!a) throw Error(o(318));
              if (e = t.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(o(557));
              e[_t] = t;
            } else
              Na(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            We(t), e = !1;
          } else
            l = Uc(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = l), e = !0;
          if (!e)
            return t.flags & 256 ? (Zt(t), t) : (Zt(t), null);
          if ((t.flags & 128) !== 0)
            throw Error(o(558));
        }
        return We(t), null;
      case 13:
        if (a = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
          if (n = Pa(t), a !== null && a.dehydrated !== null) {
            if (e === null) {
              if (!n) throw Error(o(318));
              if (n = t.memoizedState, n = n !== null ? n.dehydrated : null, !n) throw Error(o(317));
              n[_t] = t;
            } else
              Na(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            We(t), n = !1;
          } else
            n = Uc(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), n = !0;
          if (!n)
            return t.flags & 256 ? (Zt(t), t) : (Zt(t), null);
        }
        return Zt(t), (t.flags & 128) !== 0 ? (t.lanes = l, t) : (l = a !== null, e = e !== null && e.memoizedState !== null, l && (a = t.child, n = null, a.alternate !== null && a.alternate.memoizedState !== null && a.alternate.memoizedState.cachePool !== null && (n = a.alternate.memoizedState.cachePool.pool), u = null, a.memoizedState !== null && a.memoizedState.cachePool !== null && (u = a.memoizedState.cachePool.pool), u !== n && (a.flags |= 2048)), l !== e && l && (t.child.flags |= 8192), os(t, t.updateQueue), We(t), null);
      case 4:
        return Me(), e === null && Ki(t.stateNode.containerInfo), We(t), null;
      case 10:
        return zl(t.type), We(t), null;
      case 19:
        if (D(ut), a = t.memoizedState, a === null) return We(t), null;
        if (n = (t.flags & 128) !== 0, u = a.rendering, u === null)
          if (n) lu(a, !1);
          else {
            if (at !== 0 || e !== null && (e.flags & 128) !== 0)
              for (e = t.child; e !== null; ) {
                if (u = Fu(e), u !== null) {
                  for (t.flags |= 128, lu(a, !1), e = u.updateQueue, t.updateQueue = e, os(t, e), t.subtreeFlags = 0, e = l, l = t.child; l !== null; )
                    zo(l, e), l = l.sibling;
                  return Y(
                    ut,
                    ut.current & 1 | 2
                  ), Ne && El(t, a.treeForkCount), t.child;
                }
                e = e.sibling;
              }
            a.tail !== null && Te() > gs && (t.flags |= 128, n = !0, lu(a, !1), t.lanes = 4194304);
          }
        else {
          if (!n)
            if (e = Fu(u), e !== null) {
              if (t.flags |= 128, n = !0, e = e.updateQueue, t.updateQueue = e, os(t, e), lu(a, !0), a.tail === null && a.tailMode === "hidden" && !u.alternate && !Ne)
                return We(t), null;
            } else
              2 * Te() - a.renderingStartTime > gs && l !== 536870912 && (t.flags |= 128, n = !0, lu(a, !1), t.lanes = 4194304);
          a.isBackwards ? (u.sibling = t.child, t.child = u) : (e = a.last, e !== null ? e.sibling = u : t.child = u, a.last = u);
        }
        return a.tail !== null ? (e = a.tail, a.rendering = e, a.tail = e.sibling, a.renderingStartTime = Te(), e.sibling = null, l = ut.current, Y(
          ut,
          n ? l & 1 | 2 : l & 1
        ), Ne && El(t, a.treeForkCount), e) : (We(t), null);
      case 22:
      case 23:
        return Zt(t), Jc(), a = t.memoizedState !== null, e !== null ? e.memoizedState !== null !== a && (t.flags |= 8192) : a && (t.flags |= 8192), a ? (l & 536870912) !== 0 && (t.flags & 128) === 0 && (We(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : We(t), l = t.updateQueue, l !== null && os(t, l.retryQueue), l = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (l = e.memoizedState.cachePool.pool), a = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (a = t.memoizedState.cachePool.pool), a !== l && (t.flags |= 2048), e !== null && D(Ea), null;
      case 24:
        return l = null, e !== null && (l = e.memoizedState.cache), t.memoizedState.cache !== l && (t.flags |= 2048), zl(it), We(t), null;
      case 25:
        return null;
      case 30:
        return null;
    }
    throw Error(o(156, t.tag));
  }
  function K0(e, t) {
    switch (Dc(t), t.tag) {
      case 1:
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 3:
        return zl(it), Me(), e = t.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (t.flags = e & -65537 | 128, t) : null;
      case 26:
      case 27:
      case 5:
        return Le(t), null;
      case 31:
        if (t.memoizedState !== null) {
          if (Zt(t), t.alternate === null)
            throw Error(o(340));
          Na();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 13:
        if (Zt(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
          if (t.alternate === null)
            throw Error(o(340));
          Na();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 19:
        return D(ut), null;
      case 4:
        return Me(), null;
      case 10:
        return zl(t.type), null;
      case 22:
      case 23:
        return Zt(t), Jc(), e !== null && D(Ea), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 24:
        return zl(it), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function ad(e, t) {
    switch (Dc(t), t.tag) {
      case 3:
        zl(it), Me();
        break;
      case 26:
      case 27:
      case 5:
        Le(t);
        break;
      case 4:
        Me();
        break;
      case 31:
        t.memoizedState !== null && Zt(t);
        break;
      case 13:
        Zt(t);
        break;
      case 19:
        D(ut);
        break;
      case 10:
        zl(t.type);
        break;
      case 22:
      case 23:
        Zt(t), Jc(), e !== null && D(Ea);
        break;
      case 24:
        zl(it);
    }
  }
  function au(e, t) {
    try {
      var l = t.updateQueue, a = l !== null ? l.lastEffect : null;
      if (a !== null) {
        var n = a.next;
        l = n;
        do {
          if ((l.tag & e) === e) {
            a = void 0;
            var u = l.create, i = l.inst;
            a = u(), i.destroy = a;
          }
          l = l.next;
        } while (l !== n);
      }
    } catch (d) {
      He(t, t.return, d);
    }
  }
  function ea(e, t, l) {
    try {
      var a = t.updateQueue, n = a !== null ? a.lastEffect : null;
      if (n !== null) {
        var u = n.next;
        a = u;
        do {
          if ((a.tag & e) === e) {
            var i = a.inst, d = i.destroy;
            if (d !== void 0) {
              i.destroy = void 0, n = t;
              var v = l, M = d;
              try {
                M();
              } catch (A) {
                He(
                  n,
                  v,
                  A
                );
              }
            }
          }
          a = a.next;
        } while (a !== u);
      }
    } catch (A) {
      He(t, t.return, A);
    }
  }
  function nd(e) {
    var t = e.updateQueue;
    if (t !== null) {
      var l = e.stateNode;
      try {
        Ko(t, l);
      } catch (a) {
        He(e, e.return, a);
      }
    }
  }
  function ud(e, t, l) {
    l.props = Oa(
      e.type,
      e.memoizedProps
    ), l.state = e.memoizedState;
    try {
      l.componentWillUnmount();
    } catch (a) {
      He(e, t, a);
    }
  }
  function nu(e, t) {
    try {
      var l = e.ref;
      if (l !== null) {
        switch (e.tag) {
          case 26:
          case 27:
          case 5:
            var a = e.stateNode;
            break;
          case 30:
            a = e.stateNode;
            break;
          default:
            a = e.stateNode;
        }
        typeof l == "function" ? e.refCleanup = l(a) : l.current = a;
      }
    } catch (n) {
      He(e, t, n);
    }
  }
  function bl(e, t) {
    var l = e.ref, a = e.refCleanup;
    if (l !== null)
      if (typeof a == "function")
        try {
          a();
        } catch (n) {
          He(e, t, n);
        } finally {
          e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
        }
      else if (typeof l == "function")
        try {
          l(null);
        } catch (n) {
          He(e, t, n);
        }
      else l.current = null;
  }
  function sd(e) {
    var t = e.type, l = e.memoizedProps, a = e.stateNode;
    try {
      e: switch (t) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          l.autoFocus && a.focus();
          break e;
        case "img":
          l.src ? a.src = l.src : l.srcSet && (a.srcset = l.srcSet);
      }
    } catch (n) {
      He(e, e.return, n);
    }
  }
  function wi(e, t, l) {
    try {
      var a = e.stateNode;
      gg(a, e.type, l, t), a[Dt] = t;
    } catch (n) {
      He(e, e.return, n);
    }
  }
  function cd(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && ca(e.type) || e.tag === 4;
  }
  function Ei(e) {
    e: for (; ; ) {
      for (; e.sibling === null; ) {
        if (e.return === null || cd(e.return)) return null;
        e = e.return;
      }
      for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
        if (e.tag === 27 && ca(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue e;
        e.child.return = e, e = e.child;
      }
      if (!(e.flags & 2)) return e.stateNode;
    }
  }
  function Ti(e, t, l) {
    var a = e.tag;
    if (a === 5 || a === 6)
      e = e.stateNode, t ? (l.nodeType === 9 ? l.body : l.nodeName === "HTML" ? l.ownerDocument.body : l).insertBefore(e, t) : (t = l.nodeType === 9 ? l.body : l.nodeName === "HTML" ? l.ownerDocument.body : l, t.appendChild(e), l = l._reactRootContainer, l != null || t.onclick !== null || (t.onclick = Nl));
    else if (a !== 4 && (a === 27 && ca(e.type) && (l = e.stateNode, t = null), e = e.child, e !== null))
      for (Ti(e, t, l), e = e.sibling; e !== null; )
        Ti(e, t, l), e = e.sibling;
  }
  function fs(e, t, l) {
    var a = e.tag;
    if (a === 5 || a === 6)
      e = e.stateNode, t ? l.insertBefore(e, t) : l.appendChild(e);
    else if (a !== 4 && (a === 27 && ca(e.type) && (l = e.stateNode), e = e.child, e !== null))
      for (fs(e, t, l), e = e.sibling; e !== null; )
        fs(e, t, l), e = e.sibling;
  }
  function id(e) {
    var t = e.stateNode, l = e.memoizedProps;
    try {
      for (var a = e.type, n = t.attributes; n.length; )
        t.removeAttributeNode(n[0]);
      Mt(t, a, l), t[_t] = e, t[Dt] = l;
    } catch (u) {
      He(e, e.return, u);
    }
  }
  var Rl = !1, ft = !1, zi = !1, rd = typeof WeakSet == "function" ? WeakSet : Set, vt = null;
  function J0(e, t) {
    if (e = e.containerInfo, $i = Os, e = xo(e), Sc(e)) {
      if ("selectionStart" in e)
        var l = {
          start: e.selectionStart,
          end: e.selectionEnd
        };
      else
        e: {
          l = (l = e.ownerDocument) && l.defaultView || window;
          var a = l.getSelection && l.getSelection();
          if (a && a.rangeCount !== 0) {
            l = a.anchorNode;
            var n = a.anchorOffset, u = a.focusNode;
            a = a.focusOffset;
            try {
              l.nodeType, u.nodeType;
            } catch {
              l = null;
              break e;
            }
            var i = 0, d = -1, v = -1, M = 0, A = 0, O = e, w = null;
            t: for (; ; ) {
              for (var E; O !== l || n !== 0 && O.nodeType !== 3 || (d = i + n), O !== u || a !== 0 && O.nodeType !== 3 || (v = i + a), O.nodeType === 3 && (i += O.nodeValue.length), (E = O.firstChild) !== null; )
                w = O, O = E;
              for (; ; ) {
                if (O === e) break t;
                if (w === l && ++M === n && (d = i), w === u && ++A === a && (v = i), (E = O.nextSibling) !== null) break;
                O = w, w = O.parentNode;
              }
              O = E;
            }
            l = d === -1 || v === -1 ? null : { start: d, end: v };
          } else l = null;
        }
      l = l || { start: 0, end: 0 };
    } else l = null;
    for (Fi = { focusedElem: e, selectionRange: l }, Os = !1, vt = t; vt !== null; )
      if (t = vt, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null)
        e.return = t, vt = e;
      else
        for (; vt !== null; ) {
          switch (t = vt, u = t.alternate, e = t.flags, t.tag) {
            case 0:
              if ((e & 4) !== 0 && (e = t.updateQueue, e = e !== null ? e.events : null, e !== null))
                for (l = 0; l < e.length; l++)
                  n = e[l], n.ref.impl = n.nextImpl;
              break;
            case 11:
            case 15:
              break;
            case 1:
              if ((e & 1024) !== 0 && u !== null) {
                e = void 0, l = t, n = u.memoizedProps, u = u.memoizedState, a = l.stateNode;
                try {
                  var K = Oa(
                    l.type,
                    n
                  );
                  e = a.getSnapshotBeforeUpdate(
                    K,
                    u
                  ), a.__reactInternalSnapshotBeforeUpdate = e;
                } catch (ue) {
                  He(
                    l,
                    l.return,
                    ue
                  );
                }
              }
              break;
            case 3:
              if ((e & 1024) !== 0) {
                if (e = t.stateNode.containerInfo, l = e.nodeType, l === 9)
                  er(e);
                else if (l === 1)
                  switch (e.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      er(e);
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
              if ((e & 1024) !== 0) throw Error(o(163));
          }
          if (e = t.sibling, e !== null) {
            e.return = t.return, vt = e;
            break;
          }
          vt = t.return;
        }
  }
  function od(e, t, l) {
    var a = l.flags;
    switch (l.tag) {
      case 0:
      case 11:
      case 15:
        Hl(e, l), a & 4 && au(5, l);
        break;
      case 1:
        if (Hl(e, l), a & 4)
          if (e = l.stateNode, t === null)
            try {
              e.componentDidMount();
            } catch (i) {
              He(l, l.return, i);
            }
          else {
            var n = Oa(
              l.type,
              t.memoizedProps
            );
            t = t.memoizedState;
            try {
              e.componentDidUpdate(
                n,
                t,
                e.__reactInternalSnapshotBeforeUpdate
              );
            } catch (i) {
              He(
                l,
                l.return,
                i
              );
            }
          }
        a & 64 && nd(l), a & 512 && nu(l, l.return);
        break;
      case 3:
        if (Hl(e, l), a & 64 && (e = l.updateQueue, e !== null)) {
          if (t = null, l.child !== null)
            switch (l.child.tag) {
              case 27:
              case 5:
                t = l.child.stateNode;
                break;
              case 1:
                t = l.child.stateNode;
            }
          try {
            Ko(e, t);
          } catch (i) {
            He(l, l.return, i);
          }
        }
        break;
      case 27:
        t === null && a & 4 && id(l);
      case 26:
      case 5:
        Hl(e, l), t === null && a & 4 && sd(l), a & 512 && nu(l, l.return);
        break;
      case 12:
        Hl(e, l);
        break;
      case 31:
        Hl(e, l), a & 4 && md(e, l);
        break;
      case 13:
        Hl(e, l), a & 4 && hd(e, l), a & 64 && (e = l.memoizedState, e !== null && (e = e.dehydrated, e !== null && (l = ag.bind(
          null,
          l
        ), jg(e, l))));
        break;
      case 22:
        if (a = l.memoizedState !== null || Rl, !a) {
          t = t !== null && t.memoizedState !== null || ft, n = Rl;
          var u = ft;
          Rl = a, (ft = t) && !u ? Bl(
            e,
            l,
            (l.subtreeFlags & 8772) !== 0
          ) : Hl(e, l), Rl = n, ft = u;
        }
        break;
      case 30:
        break;
      default:
        Hl(e, l);
    }
  }
  function fd(e) {
    var t = e.alternate;
    t !== null && (e.alternate = null, fd(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && uc(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
  }
  var Ie = null, Ut = !1;
  function Ul(e, t, l) {
    for (l = l.child; l !== null; )
      dd(e, t, l), l = l.sibling;
  }
  function dd(e, t, l) {
    if (Ce && typeof Ce.onCommitFiberUnmount == "function")
      try {
        Ce.onCommitFiberUnmount(Ze, l);
      } catch {
      }
    switch (l.tag) {
      case 26:
        ft || bl(l, t), Ul(
          e,
          t,
          l
        ), l.memoizedState ? l.memoizedState.count-- : l.stateNode && (l = l.stateNode, l.parentNode.removeChild(l));
        break;
      case 27:
        ft || bl(l, t);
        var a = Ie, n = Ut;
        ca(l.type) && (Ie = l.stateNode, Ut = !1), Ul(
          e,
          t,
          l
        ), mu(l.stateNode), Ie = a, Ut = n;
        break;
      case 5:
        ft || bl(l, t);
      case 6:
        if (a = Ie, n = Ut, Ie = null, Ul(
          e,
          t,
          l
        ), Ie = a, Ut = n, Ie !== null)
          if (Ut)
            try {
              (Ie.nodeType === 9 ? Ie.body : Ie.nodeName === "HTML" ? Ie.ownerDocument.body : Ie).removeChild(l.stateNode);
            } catch (u) {
              He(
                l,
                t,
                u
              );
            }
          else
            try {
              Ie.removeChild(l.stateNode);
            } catch (u) {
              He(
                l,
                t,
                u
              );
            }
        break;
      case 18:
        Ie !== null && (Ut ? (e = Ie, nm(
          e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e,
          l.stateNode
        ), _n(e)) : nm(Ie, l.stateNode));
        break;
      case 4:
        a = Ie, n = Ut, Ie = l.stateNode.containerInfo, Ut = !0, Ul(
          e,
          t,
          l
        ), Ie = a, Ut = n;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        ea(2, l, t), ft || ea(4, l, t), Ul(
          e,
          t,
          l
        );
        break;
      case 1:
        ft || (bl(l, t), a = l.stateNode, typeof a.componentWillUnmount == "function" && ud(
          l,
          t,
          a
        )), Ul(
          e,
          t,
          l
        );
        break;
      case 21:
        Ul(
          e,
          t,
          l
        );
        break;
      case 22:
        ft = (a = ft) || l.memoizedState !== null, Ul(
          e,
          t,
          l
        ), ft = a;
        break;
      default:
        Ul(
          e,
          t,
          l
        );
    }
  }
  function md(e, t) {
    if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
      e = e.dehydrated;
      try {
        _n(e);
      } catch (l) {
        He(t, t.return, l);
      }
    }
  }
  function hd(e, t) {
    if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null))))
      try {
        _n(e);
      } catch (l) {
        He(t, t.return, l);
      }
  }
  function W0(e) {
    switch (e.tag) {
      case 31:
      case 13:
      case 19:
        var t = e.stateNode;
        return t === null && (t = e.stateNode = new rd()), t;
      case 22:
        return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new rd()), t;
      default:
        throw Error(o(435, e.tag));
    }
  }
  function ds(e, t) {
    var l = W0(e);
    t.forEach(function(a) {
      if (!l.has(a)) {
        l.add(a);
        var n = ng.bind(null, e, a);
        a.then(n, n);
      }
    });
  }
  function Ht(e, t) {
    var l = t.deletions;
    if (l !== null)
      for (var a = 0; a < l.length; a++) {
        var n = l[a], u = e, i = t, d = i;
        e: for (; d !== null; ) {
          switch (d.tag) {
            case 27:
              if (ca(d.type)) {
                Ie = d.stateNode, Ut = !1;
                break e;
              }
              break;
            case 5:
              Ie = d.stateNode, Ut = !1;
              break e;
            case 3:
            case 4:
              Ie = d.stateNode.containerInfo, Ut = !0;
              break e;
          }
          d = d.return;
        }
        if (Ie === null) throw Error(o(160));
        dd(u, i, n), Ie = null, Ut = !1, u = n.alternate, u !== null && (u.return = null), n.return = null;
      }
    if (t.subtreeFlags & 13886)
      for (t = t.child; t !== null; )
        gd(t, e), t = t.sibling;
  }
  var hl = null;
  function gd(e, t) {
    var l = e.alternate, a = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        Ht(t, e), Bt(e), a & 4 && (ea(3, e, e.return), au(3, e), ea(5, e, e.return));
        break;
      case 1:
        Ht(t, e), Bt(e), a & 512 && (ft || l === null || bl(l, l.return)), a & 64 && Rl && (e = e.updateQueue, e !== null && (a = e.callbacks, a !== null && (l = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = l === null ? a : l.concat(a))));
        break;
      case 26:
        var n = hl;
        if (Ht(t, e), Bt(e), a & 512 && (ft || l === null || bl(l, l.return)), a & 4) {
          var u = l !== null ? l.memoizedState : null;
          if (a = e.memoizedState, l === null)
            if (a === null)
              if (e.stateNode === null) {
                e: {
                  a = e.type, l = e.memoizedProps, n = n.ownerDocument || n;
                  t: switch (a) {
                    case "title":
                      u = n.getElementsByTagName("title")[0], (!u || u[Cn] || u[_t] || u.namespaceURI === "http://www.w3.org/2000/svg" || u.hasAttribute("itemprop")) && (u = n.createElement(a), n.head.insertBefore(
                        u,
                        n.querySelector("head > title")
                      )), Mt(u, a, l), u[_t] = e, gt(u), a = u;
                      break e;
                    case "link":
                      var i = gm(
                        "link",
                        "href",
                        n
                      ).get(a + (l.href || ""));
                      if (i) {
                        for (var d = 0; d < i.length; d++)
                          if (u = i[d], u.getAttribute("href") === (l.href == null || l.href === "" ? null : l.href) && u.getAttribute("rel") === (l.rel == null ? null : l.rel) && u.getAttribute("title") === (l.title == null ? null : l.title) && u.getAttribute("crossorigin") === (l.crossOrigin == null ? null : l.crossOrigin)) {
                            i.splice(d, 1);
                            break t;
                          }
                      }
                      u = n.createElement(a), Mt(u, a, l), n.head.appendChild(u);
                      break;
                    case "meta":
                      if (i = gm(
                        "meta",
                        "content",
                        n
                      ).get(a + (l.content || ""))) {
                        for (d = 0; d < i.length; d++)
                          if (u = i[d], u.getAttribute("content") === (l.content == null ? null : "" + l.content) && u.getAttribute("name") === (l.name == null ? null : l.name) && u.getAttribute("property") === (l.property == null ? null : l.property) && u.getAttribute("http-equiv") === (l.httpEquiv == null ? null : l.httpEquiv) && u.getAttribute("charset") === (l.charSet == null ? null : l.charSet)) {
                            i.splice(d, 1);
                            break t;
                          }
                      }
                      u = n.createElement(a), Mt(u, a, l), n.head.appendChild(u);
                      break;
                    default:
                      throw Error(o(468, a));
                  }
                  u[_t] = e, gt(u), a = u;
                }
                e.stateNode = a;
              } else
                vm(
                  n,
                  e.type,
                  e.stateNode
                );
            else
              e.stateNode = hm(
                n,
                a,
                e.memoizedProps
              );
          else
            u !== a ? (u === null ? l.stateNode !== null && (l = l.stateNode, l.parentNode.removeChild(l)) : u.count--, a === null ? vm(
              n,
              e.type,
              e.stateNode
            ) : hm(
              n,
              a,
              e.memoizedProps
            )) : a === null && e.stateNode !== null && wi(
              e,
              e.memoizedProps,
              l.memoizedProps
            );
        }
        break;
      case 27:
        Ht(t, e), Bt(e), a & 512 && (ft || l === null || bl(l, l.return)), l !== null && a & 4 && wi(
          e,
          e.memoizedProps,
          l.memoizedProps
        );
        break;
      case 5:
        if (Ht(t, e), Bt(e), a & 512 && (ft || l === null || bl(l, l.return)), e.flags & 32) {
          n = e.stateNode;
          try {
            Xa(n, "");
          } catch (K) {
            He(e, e.return, K);
          }
        }
        a & 4 && e.stateNode != null && (n = e.memoizedProps, wi(
          e,
          n,
          l !== null ? l.memoizedProps : n
        )), a & 1024 && (zi = !0);
        break;
      case 6:
        if (Ht(t, e), Bt(e), a & 4) {
          if (e.stateNode === null)
            throw Error(o(162));
          a = e.memoizedProps, l = e.stateNode;
          try {
            l.nodeValue = a;
          } catch (K) {
            He(e, e.return, K);
          }
        }
        break;
      case 3:
        if (Ts = null, n = hl, hl = ws(t.containerInfo), Ht(t, e), hl = n, Bt(e), a & 4 && l !== null && l.memoizedState.isDehydrated)
          try {
            _n(t.containerInfo);
          } catch (K) {
            He(e, e.return, K);
          }
        zi && (zi = !1, vd(e));
        break;
      case 4:
        a = hl, hl = ws(
          e.stateNode.containerInfo
        ), Ht(t, e), Bt(e), hl = a;
        break;
      case 12:
        Ht(t, e), Bt(e);
        break;
      case 31:
        Ht(t, e), Bt(e), a & 4 && (a = e.updateQueue, a !== null && (e.updateQueue = null, ds(e, a)));
        break;
      case 13:
        Ht(t, e), Bt(e), e.child.flags & 8192 && e.memoizedState !== null != (l !== null && l.memoizedState !== null) && (hs = Te()), a & 4 && (a = e.updateQueue, a !== null && (e.updateQueue = null, ds(e, a)));
        break;
      case 22:
        n = e.memoizedState !== null;
        var v = l !== null && l.memoizedState !== null, M = Rl, A = ft;
        if (Rl = M || n, ft = A || v, Ht(t, e), ft = A, Rl = M, Bt(e), a & 8192)
          e: for (t = e.stateNode, t._visibility = n ? t._visibility & -2 : t._visibility | 1, n && (l === null || v || Rl || ft || Da(e)), l = null, t = e; ; ) {
            if (t.tag === 5 || t.tag === 26) {
              if (l === null) {
                v = l = t;
                try {
                  if (u = v.stateNode, n)
                    i = u.style, typeof i.setProperty == "function" ? i.setProperty("display", "none", "important") : i.display = "none";
                  else {
                    d = v.stateNode;
                    var O = v.memoizedProps.style, w = O != null && O.hasOwnProperty("display") ? O.display : null;
                    d.style.display = w == null || typeof w == "boolean" ? "" : ("" + w).trim();
                  }
                } catch (K) {
                  He(v, v.return, K);
                }
              }
            } else if (t.tag === 6) {
              if (l === null) {
                v = t;
                try {
                  v.stateNode.nodeValue = n ? "" : v.memoizedProps;
                } catch (K) {
                  He(v, v.return, K);
                }
              }
            } else if (t.tag === 18) {
              if (l === null) {
                v = t;
                try {
                  var E = v.stateNode;
                  n ? um(E, !0) : um(v.stateNode, !1);
                } catch (K) {
                  He(v, v.return, K);
                }
              }
            } else if ((t.tag !== 22 && t.tag !== 23 || t.memoizedState === null || t === e) && t.child !== null) {
              t.child.return = t, t = t.child;
              continue;
            }
            if (t === e) break e;
            for (; t.sibling === null; ) {
              if (t.return === null || t.return === e) break e;
              l === t && (l = null), t = t.return;
            }
            l === t && (l = null), t.sibling.return = t.return, t = t.sibling;
          }
        a & 4 && (a = e.updateQueue, a !== null && (l = a.retryQueue, l !== null && (a.retryQueue = null, ds(e, l))));
        break;
      case 19:
        Ht(t, e), Bt(e), a & 4 && (a = e.updateQueue, a !== null && (e.updateQueue = null, ds(e, a)));
        break;
      case 30:
        break;
      case 21:
        break;
      default:
        Ht(t, e), Bt(e);
    }
  }
  function Bt(e) {
    var t = e.flags;
    if (t & 2) {
      try {
        for (var l, a = e.return; a !== null; ) {
          if (cd(a)) {
            l = a;
            break;
          }
          a = a.return;
        }
        if (l == null) throw Error(o(160));
        switch (l.tag) {
          case 27:
            var n = l.stateNode, u = Ei(e);
            fs(e, u, n);
            break;
          case 5:
            var i = l.stateNode;
            l.flags & 32 && (Xa(i, ""), l.flags &= -33);
            var d = Ei(e);
            fs(e, d, i);
            break;
          case 3:
          case 4:
            var v = l.stateNode.containerInfo, M = Ei(e);
            Ti(
              e,
              M,
              v
            );
            break;
          default:
            throw Error(o(161));
        }
      } catch (A) {
        He(e, e.return, A);
      }
      e.flags &= -3;
    }
    t & 4096 && (e.flags &= -4097);
  }
  function vd(e) {
    if (e.subtreeFlags & 1024)
      for (e = e.child; e !== null; ) {
        var t = e;
        vd(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), e = e.sibling;
      }
  }
  function Hl(e, t) {
    if (t.subtreeFlags & 8772)
      for (t = t.child; t !== null; )
        od(e, t.alternate, t), t = t.sibling;
  }
  function Da(e) {
    for (e = e.child; e !== null; ) {
      var t = e;
      switch (t.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          ea(4, t, t.return), Da(t);
          break;
        case 1:
          bl(t, t.return);
          var l = t.stateNode;
          typeof l.componentWillUnmount == "function" && ud(
            t,
            t.return,
            l
          ), Da(t);
          break;
        case 27:
          mu(t.stateNode);
        case 26:
        case 5:
          bl(t, t.return), Da(t);
          break;
        case 22:
          t.memoizedState === null && Da(t);
          break;
        case 30:
          Da(t);
          break;
        default:
          Da(t);
      }
      e = e.sibling;
    }
  }
  function Bl(e, t, l) {
    for (l = l && (t.subtreeFlags & 8772) !== 0, t = t.child; t !== null; ) {
      var a = t.alternate, n = e, u = t, i = u.flags;
      switch (u.tag) {
        case 0:
        case 11:
        case 15:
          Bl(
            n,
            u,
            l
          ), au(4, u);
          break;
        case 1:
          if (Bl(
            n,
            u,
            l
          ), a = u, n = a.stateNode, typeof n.componentDidMount == "function")
            try {
              n.componentDidMount();
            } catch (M) {
              He(a, a.return, M);
            }
          if (a = u, n = a.updateQueue, n !== null) {
            var d = a.stateNode;
            try {
              var v = n.shared.hiddenCallbacks;
              if (v !== null)
                for (n.shared.hiddenCallbacks = null, n = 0; n < v.length; n++)
                  Zo(v[n], d);
            } catch (M) {
              He(a, a.return, M);
            }
          }
          l && i & 64 && nd(u), nu(u, u.return);
          break;
        case 27:
          id(u);
        case 26:
        case 5:
          Bl(
            n,
            u,
            l
          ), l && a === null && i & 4 && sd(u), nu(u, u.return);
          break;
        case 12:
          Bl(
            n,
            u,
            l
          );
          break;
        case 31:
          Bl(
            n,
            u,
            l
          ), l && i & 4 && md(n, u);
          break;
        case 13:
          Bl(
            n,
            u,
            l
          ), l && i & 4 && hd(n, u);
          break;
        case 22:
          u.memoizedState === null && Bl(
            n,
            u,
            l
          ), nu(u, u.return);
          break;
        case 30:
          break;
        default:
          Bl(
            n,
            u,
            l
          );
      }
      t = t.sibling;
    }
  }
  function Ai(e, t) {
    var l = null;
    e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (l = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== l && (e != null && e.refCount++, l != null && Vn(l));
  }
  function Ci(e, t) {
    e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Vn(e));
  }
  function gl(e, t, l, a) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; )
        pd(
          e,
          t,
          l,
          a
        ), t = t.sibling;
  }
  function pd(e, t, l, a) {
    var n = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 15:
        gl(
          e,
          t,
          l,
          a
        ), n & 2048 && au(9, t);
        break;
      case 1:
        gl(
          e,
          t,
          l,
          a
        );
        break;
      case 3:
        gl(
          e,
          t,
          l,
          a
        ), n & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && Vn(e)));
        break;
      case 12:
        if (n & 2048) {
          gl(
            e,
            t,
            l,
            a
          ), e = t.stateNode;
          try {
            var u = t.memoizedProps, i = u.id, d = u.onPostCommit;
            typeof d == "function" && d(
              i,
              t.alternate === null ? "mount" : "update",
              e.passiveEffectDuration,
              -0
            );
          } catch (v) {
            He(t, t.return, v);
          }
        } else
          gl(
            e,
            t,
            l,
            a
          );
        break;
      case 31:
        gl(
          e,
          t,
          l,
          a
        );
        break;
      case 13:
        gl(
          e,
          t,
          l,
          a
        );
        break;
      case 23:
        break;
      case 22:
        u = t.stateNode, i = t.alternate, t.memoizedState !== null ? u._visibility & 2 ? gl(
          e,
          t,
          l,
          a
        ) : uu(e, t) : u._visibility & 2 ? gl(
          e,
          t,
          l,
          a
        ) : (u._visibility |= 2, on(
          e,
          t,
          l,
          a,
          (t.subtreeFlags & 10256) !== 0 || !1
        )), n & 2048 && Ai(i, t);
        break;
      case 24:
        gl(
          e,
          t,
          l,
          a
        ), n & 2048 && Ci(t.alternate, t);
        break;
      default:
        gl(
          e,
          t,
          l,
          a
        );
    }
  }
  function on(e, t, l, a, n) {
    for (n = n && ((t.subtreeFlags & 10256) !== 0 || !1), t = t.child; t !== null; ) {
      var u = e, i = t, d = l, v = a, M = i.flags;
      switch (i.tag) {
        case 0:
        case 11:
        case 15:
          on(
            u,
            i,
            d,
            v,
            n
          ), au(8, i);
          break;
        case 23:
          break;
        case 22:
          var A = i.stateNode;
          i.memoizedState !== null ? A._visibility & 2 ? on(
            u,
            i,
            d,
            v,
            n
          ) : uu(
            u,
            i
          ) : (A._visibility |= 2, on(
            u,
            i,
            d,
            v,
            n
          )), n && M & 2048 && Ai(
            i.alternate,
            i
          );
          break;
        case 24:
          on(
            u,
            i,
            d,
            v,
            n
          ), n && M & 2048 && Ci(i.alternate, i);
          break;
        default:
          on(
            u,
            i,
            d,
            v,
            n
          );
      }
      t = t.sibling;
    }
  }
  function uu(e, t) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; ) {
        var l = e, a = t, n = a.flags;
        switch (a.tag) {
          case 22:
            uu(l, a), n & 2048 && Ai(
              a.alternate,
              a
            );
            break;
          case 24:
            uu(l, a), n & 2048 && Ci(a.alternate, a);
            break;
          default:
            uu(l, a);
        }
        t = t.sibling;
      }
  }
  var su = 8192;
  function fn(e, t, l) {
    if (e.subtreeFlags & su)
      for (e = e.child; e !== null; )
        yd(
          e,
          t,
          l
        ), e = e.sibling;
  }
  function yd(e, t, l) {
    switch (e.tag) {
      case 26:
        fn(
          e,
          t,
          l
        ), e.flags & su && e.memoizedState !== null && Ug(
          l,
          hl,
          e.memoizedState,
          e.memoizedProps
        );
        break;
      case 5:
        fn(
          e,
          t,
          l
        );
        break;
      case 3:
      case 4:
        var a = hl;
        hl = ws(e.stateNode.containerInfo), fn(
          e,
          t,
          l
        ), hl = a;
        break;
      case 22:
        e.memoizedState === null && (a = e.alternate, a !== null && a.memoizedState !== null ? (a = su, su = 16777216, fn(
          e,
          t,
          l
        ), su = a) : fn(
          e,
          t,
          l
        ));
        break;
      default:
        fn(
          e,
          t,
          l
        );
    }
  }
  function bd(e) {
    var t = e.alternate;
    if (t !== null && (e = t.child, e !== null)) {
      t.child = null;
      do
        t = e.sibling, e.sibling = null, e = t;
      while (e !== null);
    }
  }
  function cu(e) {
    var t = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (t !== null)
        for (var l = 0; l < t.length; l++) {
          var a = t[l];
          vt = a, _d(
            a,
            e
          );
        }
      bd(e);
    }
    if (e.subtreeFlags & 10256)
      for (e = e.child; e !== null; )
        xd(e), e = e.sibling;
  }
  function xd(e) {
    switch (e.tag) {
      case 0:
      case 11:
      case 15:
        cu(e), e.flags & 2048 && ea(9, e, e.return);
        break;
      case 3:
        cu(e);
        break;
      case 12:
        cu(e);
        break;
      case 22:
        var t = e.stateNode;
        e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, ms(e)) : cu(e);
        break;
      default:
        cu(e);
    }
  }
  function ms(e) {
    var t = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (t !== null)
        for (var l = 0; l < t.length; l++) {
          var a = t[l];
          vt = a, _d(
            a,
            e
          );
        }
      bd(e);
    }
    for (e = e.child; e !== null; ) {
      switch (t = e, t.tag) {
        case 0:
        case 11:
        case 15:
          ea(8, t, t.return), ms(t);
          break;
        case 22:
          l = t.stateNode, l._visibility & 2 && (l._visibility &= -3, ms(t));
          break;
        default:
          ms(t);
      }
      e = e.sibling;
    }
  }
  function _d(e, t) {
    for (; vt !== null; ) {
      var l = vt;
      switch (l.tag) {
        case 0:
        case 11:
        case 15:
          ea(8, l, t);
          break;
        case 23:
        case 22:
          if (l.memoizedState !== null && l.memoizedState.cachePool !== null) {
            var a = l.memoizedState.cachePool.pool;
            a != null && a.refCount++;
          }
          break;
        case 24:
          Vn(l.memoizedState.cache);
      }
      if (a = l.child, a !== null) a.return = l, vt = a;
      else
        e: for (l = e; vt !== null; ) {
          a = vt;
          var n = a.sibling, u = a.return;
          if (fd(a), a === l) {
            vt = null;
            break e;
          }
          if (n !== null) {
            n.return = u, vt = n;
            break e;
          }
          vt = u;
        }
    }
  }
  var $0 = {
    getCacheForType: function(e) {
      var t = jt(it), l = t.data.get(e);
      return l === void 0 && (l = e(), t.data.set(e, l)), l;
    },
    cacheSignal: function() {
      return jt(it).controller.signal;
    }
  }, F0 = typeof WeakMap == "function" ? WeakMap : Map, Oe = 0, Ge = null, xe = null, Se = 0, Ue = 0, Kt = null, ta = !1, dn = !1, Oi = !1, ql = 0, at = 0, la = 0, Ra = 0, Di = 0, Jt = 0, mn = 0, iu = null, qt = null, Ri = !1, hs = 0, Sd = 0, gs = 1 / 0, vs = null, aa = null, ht = 0, na = null, hn = null, kl = 0, Ui = 0, Hi = null, jd = null, ru = 0, Bi = null;
  function Wt() {
    return (Oe & 2) !== 0 && Se !== 0 ? Se & -Se : T.T !== null ? Xi() : Br();
  }
  function Nd() {
    if (Jt === 0)
      if ((Se & 536870912) === 0 || Ne) {
        var e = va;
        va <<= 1, (va & 3932160) === 0 && (va = 262144), Jt = e;
      } else Jt = 536870912;
    return e = Qt.current, e !== null && (e.flags |= 32), Jt;
  }
  function kt(e, t, l) {
    (e === Ge && (Ue === 2 || Ue === 9) || e.cancelPendingCommit !== null) && (gn(e, 0), ua(
      e,
      Se,
      Jt,
      !1
    )), An(e, l), ((Oe & 2) === 0 || e !== Ge) && (e === Ge && ((Oe & 2) === 0 && (Ra |= l), at === 4 && ua(
      e,
      Se,
      Jt,
      !1
    )), xl(e));
  }
  function Md(e, t, l) {
    if ((Oe & 6) !== 0) throw Error(o(327));
    var a = !l && (t & 127) === 0 && (t & e.expiredLanes) === 0 || zn(e, t), n = a ? eg(e, t) : ki(e, t, !0), u = a;
    do {
      if (n === 0) {
        dn && !a && ua(e, t, 0, !1);
        break;
      } else {
        if (l = e.current.alternate, u && !I0(l)) {
          n = ki(e, t, !1), u = !1;
          continue;
        }
        if (n === 2) {
          if (u = t, e.errorRecoveryDisabledLanes & u)
            var i = 0;
          else
            i = e.pendingLanes & -536870913, i = i !== 0 ? i : i & 536870912 ? 536870912 : 0;
          if (i !== 0) {
            t = i;
            e: {
              var d = e;
              n = iu;
              var v = d.current.memoizedState.isDehydrated;
              if (v && (gn(d, i).flags |= 256), i = ki(
                d,
                i,
                !1
              ), i !== 2) {
                if (Oi && !v) {
                  d.errorRecoveryDisabledLanes |= u, Ra |= u, n = 4;
                  break e;
                }
                u = qt, qt = n, u !== null && (qt === null ? qt = u : qt.push.apply(
                  qt,
                  u
                ));
              }
              n = i;
            }
            if (u = !1, n !== 2) continue;
          }
        }
        if (n === 1) {
          gn(e, 0), ua(e, t, 0, !0);
          break;
        }
        e: {
          switch (a = e, u = n, u) {
            case 0:
            case 1:
              throw Error(o(345));
            case 4:
              if ((t & 4194048) !== t) break;
            case 6:
              ua(
                a,
                t,
                Jt,
                !ta
              );
              break e;
            case 2:
              qt = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(o(329));
          }
          if ((t & 62914560) === t && (n = hs + 300 - Te(), 10 < n)) {
            if (ua(
              a,
              t,
              Jt,
              !ta
            ), el(a, 0, !0) !== 0) break e;
            kl = t, a.timeoutHandle = lm(
              wd.bind(
                null,
                a,
                l,
                qt,
                vs,
                Ri,
                t,
                Jt,
                Ra,
                mn,
                ta,
                u,
                "Throttled",
                -0,
                0
              ),
              n
            );
            break e;
          }
          wd(
            a,
            l,
            qt,
            vs,
            Ri,
            t,
            Jt,
            Ra,
            mn,
            ta,
            u,
            null,
            -0,
            0
          );
        }
      }
      break;
    } while (!0);
    xl(e);
  }
  function wd(e, t, l, a, n, u, i, d, v, M, A, O, w, E) {
    if (e.timeoutHandle = -1, O = t.subtreeFlags, O & 8192 || (O & 16785408) === 16785408) {
      O = {
        stylesheets: null,
        count: 0,
        imgCount: 0,
        imgBytes: 0,
        suspenseyImages: [],
        waitingForImages: !0,
        waitingForViewTransition: !1,
        unsuspend: Nl
      }, yd(
        t,
        u,
        O
      );
      var K = (u & 62914560) === u ? hs - Te() : (u & 4194048) === u ? Sd - Te() : 0;
      if (K = Hg(
        O,
        K
      ), K !== null) {
        kl = u, e.cancelPendingCommit = K(
          Rd.bind(
            null,
            e,
            t,
            u,
            l,
            a,
            n,
            i,
            d,
            v,
            A,
            O,
            null,
            w,
            E
          )
        ), ua(e, u, i, !M);
        return;
      }
    }
    Rd(
      e,
      t,
      u,
      l,
      a,
      n,
      i,
      d,
      v
    );
  }
  function I0(e) {
    for (var t = e; ; ) {
      var l = t.tag;
      if ((l === 0 || l === 11 || l === 15) && t.flags & 16384 && (l = t.updateQueue, l !== null && (l = l.stores, l !== null)))
        for (var a = 0; a < l.length; a++) {
          var n = l[a], u = n.getSnapshot;
          n = n.value;
          try {
            if (!Xt(u(), n)) return !1;
          } catch {
            return !1;
          }
        }
      if (l = t.child, t.subtreeFlags & 16384 && l !== null)
        l.return = t, t = l;
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
  function ua(e, t, l, a) {
    t &= ~Di, t &= ~Ra, e.suspendedLanes |= t, e.pingedLanes &= ~t, a && (e.warmLanes |= t), a = e.expirationTimes;
    for (var n = t; 0 < n; ) {
      var u = 31 - Tt(n), i = 1 << u;
      a[u] = -1, n &= ~i;
    }
    l !== 0 && Rr(e, l, t);
  }
  function ps() {
    return (Oe & 6) === 0 ? (ou(0), !1) : !0;
  }
  function qi() {
    if (xe !== null) {
      if (Ue === 0)
        var e = xe.return;
      else
        e = xe, Tl = Ma = null, ei(e), nn = null, Zn = 0, e = xe;
      for (; e !== null; )
        ad(e.alternate, e), e = e.return;
      xe = null;
    }
  }
  function gn(e, t) {
    var l = e.timeoutHandle;
    l !== -1 && (e.timeoutHandle = -1, yg(l)), l = e.cancelPendingCommit, l !== null && (e.cancelPendingCommit = null, l()), kl = 0, qi(), Ge = e, xe = l = wl(e.current, null), Se = t, Ue = 0, Kt = null, ta = !1, dn = zn(e, t), Oi = !1, mn = Jt = Di = Ra = la = at = 0, qt = iu = null, Ri = !1, (t & 8) !== 0 && (t |= t & 32);
    var a = e.entangledLanes;
    if (a !== 0)
      for (e = e.entanglements, a &= t; 0 < a; ) {
        var n = 31 - Tt(a), u = 1 << n;
        t |= e[n], a &= ~u;
      }
    return ql = t, qu(), l;
  }
  function Ed(e, t) {
    me = null, T.H = eu, t === an || t === Zu ? (t = Go(), Ue = 3) : t === Gc ? (t = Go(), Ue = 4) : Ue = t === vi ? 8 : t !== null && typeof t == "object" && typeof t.then == "function" ? 6 : 1, Kt = t, xe === null && (at = 1, ss(
      e,
      nl(t, e.current)
    ));
  }
  function Td() {
    var e = Qt.current;
    return e === null ? !0 : (Se & 4194048) === Se ? il === null : (Se & 62914560) === Se || (Se & 536870912) !== 0 ? e === il : !1;
  }
  function zd() {
    var e = T.H;
    return T.H = eu, e === null ? eu : e;
  }
  function Ad() {
    var e = T.A;
    return T.A = $0, e;
  }
  function ys() {
    at = 4, ta || (Se & 4194048) !== Se && Qt.current !== null || (dn = !0), (la & 134217727) === 0 && (Ra & 134217727) === 0 || Ge === null || ua(
      Ge,
      Se,
      Jt,
      !1
    );
  }
  function ki(e, t, l) {
    var a = Oe;
    Oe |= 2;
    var n = zd(), u = Ad();
    (Ge !== e || Se !== t) && (vs = null, gn(e, t)), t = !1;
    var i = at;
    e: do
      try {
        if (Ue !== 0 && xe !== null) {
          var d = xe, v = Kt;
          switch (Ue) {
            case 8:
              qi(), i = 6;
              break e;
            case 3:
            case 2:
            case 9:
            case 6:
              Qt.current === null && (t = !0);
              var M = Ue;
              if (Ue = 0, Kt = null, vn(e, d, v, M), l && dn) {
                i = 0;
                break e;
              }
              break;
            default:
              M = Ue, Ue = 0, Kt = null, vn(e, d, v, M);
          }
        }
        P0(), i = at;
        break;
      } catch (A) {
        Ed(e, A);
      }
    while (!0);
    return t && e.shellSuspendCounter++, Tl = Ma = null, Oe = a, T.H = n, T.A = u, xe === null && (Ge = null, Se = 0, qu()), i;
  }
  function P0() {
    for (; xe !== null; ) Cd(xe);
  }
  function eg(e, t) {
    var l = Oe;
    Oe |= 2;
    var a = zd(), n = Ad();
    Ge !== e || Se !== t ? (vs = null, gs = Te() + 500, gn(e, t)) : dn = zn(
      e,
      t
    );
    e: do
      try {
        if (Ue !== 0 && xe !== null) {
          t = xe;
          var u = Kt;
          t: switch (Ue) {
            case 1:
              Ue = 0, Kt = null, vn(e, t, u, 1);
              break;
            case 2:
            case 9:
              if (Lo(u)) {
                Ue = 0, Kt = null, Od(t);
                break;
              }
              t = function() {
                Ue !== 2 && Ue !== 9 || Ge !== e || (Ue = 7), xl(e);
              }, u.then(t, t);
              break e;
            case 3:
              Ue = 7;
              break e;
            case 4:
              Ue = 5;
              break e;
            case 7:
              Lo(u) ? (Ue = 0, Kt = null, Od(t)) : (Ue = 0, Kt = null, vn(e, t, u, 7));
              break;
            case 5:
              var i = null;
              switch (xe.tag) {
                case 26:
                  i = xe.memoizedState;
                case 5:
                case 27:
                  var d = xe;
                  if (i ? pm(i) : d.stateNode.complete) {
                    Ue = 0, Kt = null;
                    var v = d.sibling;
                    if (v !== null) xe = v;
                    else {
                      var M = d.return;
                      M !== null ? (xe = M, bs(M)) : xe = null;
                    }
                    break t;
                  }
              }
              Ue = 0, Kt = null, vn(e, t, u, 5);
              break;
            case 6:
              Ue = 0, Kt = null, vn(e, t, u, 6);
              break;
            case 8:
              qi(), at = 6;
              break e;
            default:
              throw Error(o(462));
          }
        }
        tg();
        break;
      } catch (A) {
        Ed(e, A);
      }
    while (!0);
    return Tl = Ma = null, T.H = a, T.A = n, Oe = l, xe !== null ? 0 : (Ge = null, Se = 0, qu(), at);
  }
  function tg() {
    for (; xe !== null && !Et(); )
      Cd(xe);
  }
  function Cd(e) {
    var t = td(e.alternate, e, ql);
    e.memoizedProps = e.pendingProps, t === null ? bs(e) : xe = t;
  }
  function Od(e) {
    var t = e, l = t.alternate;
    switch (t.tag) {
      case 15:
      case 0:
        t = Wf(
          l,
          t,
          t.pendingProps,
          t.type,
          void 0,
          Se
        );
        break;
      case 11:
        t = Wf(
          l,
          t,
          t.pendingProps,
          t.type.render,
          t.ref,
          Se
        );
        break;
      case 5:
        ei(t);
      default:
        ad(l, t), t = xe = zo(t, ql), t = td(l, t, ql);
    }
    e.memoizedProps = e.pendingProps, t === null ? bs(e) : xe = t;
  }
  function vn(e, t, l, a) {
    Tl = Ma = null, ei(t), nn = null, Zn = 0;
    var n = t.return;
    try {
      if (X0(
        e,
        n,
        t,
        l,
        Se
      )) {
        at = 1, ss(
          e,
          nl(l, e.current)
        ), xe = null;
        return;
      }
    } catch (u) {
      if (n !== null) throw xe = n, u;
      at = 1, ss(
        e,
        nl(l, e.current)
      ), xe = null;
      return;
    }
    t.flags & 32768 ? (Ne || a === 1 ? e = !0 : dn || (Se & 536870912) !== 0 ? e = !1 : (ta = e = !0, (a === 2 || a === 9 || a === 3 || a === 6) && (a = Qt.current, a !== null && a.tag === 13 && (a.flags |= 16384))), Dd(t, e)) : bs(t);
  }
  function bs(e) {
    var t = e;
    do {
      if ((t.flags & 32768) !== 0) {
        Dd(
          t,
          ta
        );
        return;
      }
      e = t.return;
      var l = Z0(
        t.alternate,
        t,
        ql
      );
      if (l !== null) {
        xe = l;
        return;
      }
      if (t = t.sibling, t !== null) {
        xe = t;
        return;
      }
      xe = t = e;
    } while (t !== null);
    at === 0 && (at = 5);
  }
  function Dd(e, t) {
    do {
      var l = K0(e.alternate, e);
      if (l !== null) {
        l.flags &= 32767, xe = l;
        return;
      }
      if (l = e.return, l !== null && (l.flags |= 32768, l.subtreeFlags = 0, l.deletions = null), !t && (e = e.sibling, e !== null)) {
        xe = e;
        return;
      }
      xe = e = l;
    } while (e !== null);
    at = 6, xe = null;
  }
  function Rd(e, t, l, a, n, u, i, d, v) {
    e.cancelPendingCommit = null;
    do
      xs();
    while (ht !== 0);
    if ((Oe & 6) !== 0) throw Error(o(327));
    if (t !== null) {
      if (t === e.current) throw Error(o(177));
      if (u = t.lanes | t.childLanes, u |= Ec, Rh(
        e,
        l,
        u,
        i,
        d,
        v
      ), e === Ge && (xe = Ge = null, Se = 0), hn = t, na = e, kl = l, Ui = u, Hi = n, jd = a, (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, ug(Pt, function() {
        return kd(), null;
      })) : (e.callbackNode = null, e.callbackPriority = 0), a = (t.flags & 13878) !== 0, (t.subtreeFlags & 13878) !== 0 || a) {
        a = T.T, T.T = null, n = q.p, q.p = 2, i = Oe, Oe |= 4;
        try {
          J0(e, t, l);
        } finally {
          Oe = i, q.p = n, T.T = a;
        }
      }
      ht = 1, Ud(), Hd(), Bd();
    }
  }
  function Ud() {
    if (ht === 1) {
      ht = 0;
      var e = na, t = hn, l = (t.flags & 13878) !== 0;
      if ((t.subtreeFlags & 13878) !== 0 || l) {
        l = T.T, T.T = null;
        var a = q.p;
        q.p = 2;
        var n = Oe;
        Oe |= 4;
        try {
          gd(t, e);
          var u = Fi, i = xo(e.containerInfo), d = u.focusedElem, v = u.selectionRange;
          if (i !== d && d && d.ownerDocument && bo(
            d.ownerDocument.documentElement,
            d
          )) {
            if (v !== null && Sc(d)) {
              var M = v.start, A = v.end;
              if (A === void 0 && (A = M), "selectionStart" in d)
                d.selectionStart = M, d.selectionEnd = Math.min(
                  A,
                  d.value.length
                );
              else {
                var O = d.ownerDocument || document, w = O && O.defaultView || window;
                if (w.getSelection) {
                  var E = w.getSelection(), K = d.textContent.length, ue = Math.min(v.start, K), ke = v.end === void 0 ? ue : Math.min(v.end, K);
                  !E.extend && ue > ke && (i = ke, ke = ue, ue = i);
                  var S = yo(
                    d,
                    ue
                  ), x = yo(
                    d,
                    ke
                  );
                  if (S && x && (E.rangeCount !== 1 || E.anchorNode !== S.node || E.anchorOffset !== S.offset || E.focusNode !== x.node || E.focusOffset !== x.offset)) {
                    var N = O.createRange();
                    N.setStart(S.node, S.offset), E.removeAllRanges(), ue > ke ? (E.addRange(N), E.extend(x.node, x.offset)) : (N.setEnd(x.node, x.offset), E.addRange(N));
                  }
                }
              }
            }
            for (O = [], E = d; E = E.parentNode; )
              E.nodeType === 1 && O.push({
                element: E,
                left: E.scrollLeft,
                top: E.scrollTop
              });
            for (typeof d.focus == "function" && d.focus(), d = 0; d < O.length; d++) {
              var C = O[d];
              C.element.scrollLeft = C.left, C.element.scrollTop = C.top;
            }
          }
          Os = !!$i, Fi = $i = null;
        } finally {
          Oe = n, q.p = a, T.T = l;
        }
      }
      e.current = t, ht = 2;
    }
  }
  function Hd() {
    if (ht === 2) {
      ht = 0;
      var e = na, t = hn, l = (t.flags & 8772) !== 0;
      if ((t.subtreeFlags & 8772) !== 0 || l) {
        l = T.T, T.T = null;
        var a = q.p;
        q.p = 2;
        var n = Oe;
        Oe |= 4;
        try {
          od(e, t.alternate, t);
        } finally {
          Oe = n, q.p = a, T.T = l;
        }
      }
      ht = 3;
    }
  }
  function Bd() {
    if (ht === 4 || ht === 3) {
      ht = 0, Lt();
      var e = na, t = hn, l = kl, a = jd;
      (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? ht = 5 : (ht = 0, hn = na = null, qd(e, e.pendingLanes));
      var n = e.pendingLanes;
      if (n === 0 && (aa = null), ac(l), t = t.stateNode, Ce && typeof Ce.onCommitFiberRoot == "function")
        try {
          Ce.onCommitFiberRoot(
            Ze,
            t,
            void 0,
            (t.current.flags & 128) === 128
          );
        } catch {
        }
      if (a !== null) {
        t = T.T, n = q.p, q.p = 2, T.T = null;
        try {
          for (var u = e.onRecoverableError, i = 0; i < a.length; i++) {
            var d = a[i];
            u(d.value, {
              componentStack: d.stack
            });
          }
        } finally {
          T.T = t, q.p = n;
        }
      }
      (kl & 3) !== 0 && xs(), xl(e), n = e.pendingLanes, (l & 261930) !== 0 && (n & 42) !== 0 ? e === Bi ? ru++ : (ru = 0, Bi = e) : ru = 0, ou(0);
    }
  }
  function qd(e, t) {
    (e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, Vn(t)));
  }
  function xs() {
    return Ud(), Hd(), Bd(), kd();
  }
  function kd() {
    if (ht !== 5) return !1;
    var e = na, t = Ui;
    Ui = 0;
    var l = ac(kl), a = T.T, n = q.p;
    try {
      q.p = 32 > l ? 32 : l, T.T = null, l = Hi, Hi = null;
      var u = na, i = kl;
      if (ht = 0, hn = na = null, kl = 0, (Oe & 6) !== 0) throw Error(o(331));
      var d = Oe;
      if (Oe |= 4, xd(u.current), pd(
        u,
        u.current,
        i,
        l
      ), Oe = d, ou(0, !1), Ce && typeof Ce.onPostCommitFiberRoot == "function")
        try {
          Ce.onPostCommitFiberRoot(Ze, u);
        } catch {
        }
      return !0;
    } finally {
      q.p = n, T.T = a, qd(e, t);
    }
  }
  function Ld(e, t, l) {
    t = nl(l, t), t = gi(e.stateNode, t, 2), e = Fl(e, t, 2), e !== null && (An(e, 2), xl(e));
  }
  function He(e, t, l) {
    if (e.tag === 3)
      Ld(e, e, l);
    else
      for (; t !== null; ) {
        if (t.tag === 3) {
          Ld(
            t,
            e,
            l
          );
          break;
        } else if (t.tag === 1) {
          var a = t.stateNode;
          if (typeof t.type.getDerivedStateFromError == "function" || typeof a.componentDidCatch == "function" && (aa === null || !aa.has(a))) {
            e = nl(l, e), l = Yf(2), a = Fl(t, l, 2), a !== null && (Gf(
              l,
              a,
              t,
              e
            ), An(a, 2), xl(a));
            break;
          }
        }
        t = t.return;
      }
  }
  function Li(e, t, l) {
    var a = e.pingCache;
    if (a === null) {
      a = e.pingCache = new F0();
      var n = /* @__PURE__ */ new Set();
      a.set(t, n);
    } else
      n = a.get(t), n === void 0 && (n = /* @__PURE__ */ new Set(), a.set(t, n));
    n.has(l) || (Oi = !0, n.add(l), e = lg.bind(null, e, t, l), t.then(e, e));
  }
  function lg(e, t, l) {
    var a = e.pingCache;
    a !== null && a.delete(t), e.pingedLanes |= e.suspendedLanes & l, e.warmLanes &= ~l, Ge === e && (Se & l) === l && (at === 4 || at === 3 && (Se & 62914560) === Se && 300 > Te() - hs ? (Oe & 2) === 0 && gn(e, 0) : Di |= l, mn === Se && (mn = 0)), xl(e);
  }
  function Yd(e, t) {
    t === 0 && (t = Dr()), e = Sa(e, t), e !== null && (An(e, t), xl(e));
  }
  function ag(e) {
    var t = e.memoizedState, l = 0;
    t !== null && (l = t.retryLane), Yd(e, l);
  }
  function ng(e, t) {
    var l = 0;
    switch (e.tag) {
      case 31:
      case 13:
        var a = e.stateNode, n = e.memoizedState;
        n !== null && (l = n.retryLane);
        break;
      case 19:
        a = e.stateNode;
        break;
      case 22:
        a = e.stateNode._retryCache;
        break;
      default:
        throw Error(o(314));
    }
    a !== null && a.delete(t), Yd(e, l);
  }
  function ug(e, t) {
    return P(e, t);
  }
  var _s = null, pn = null, Yi = !1, Ss = !1, Gi = !1, sa = 0;
  function xl(e) {
    e !== pn && e.next === null && (pn === null ? _s = pn = e : pn = pn.next = e), Ss = !0, Yi || (Yi = !0, cg());
  }
  function ou(e, t) {
    if (!Gi && Ss) {
      Gi = !0;
      do
        for (var l = !1, a = _s; a !== null; ) {
          if (e !== 0) {
            var n = a.pendingLanes;
            if (n === 0) var u = 0;
            else {
              var i = a.suspendedLanes, d = a.pingedLanes;
              u = (1 << 31 - Tt(42 | e) + 1) - 1, u &= n & ~(i & ~d), u = u & 201326741 ? u & 201326741 | 1 : u ? u | 2 : 0;
            }
            u !== 0 && (l = !0, Qd(a, u));
          } else
            u = Se, u = el(
              a,
              a === Ge ? u : 0,
              a.cancelPendingCommit !== null || a.timeoutHandle !== -1
            ), (u & 3) === 0 || zn(a, u) || (l = !0, Qd(a, u));
          a = a.next;
        }
      while (l);
      Gi = !1;
    }
  }
  function sg() {
    Gd();
  }
  function Gd() {
    Ss = Yi = !1;
    var e = 0;
    sa !== 0 && pg() && (e = sa);
    for (var t = Te(), l = null, a = _s; a !== null; ) {
      var n = a.next, u = Xd(a, t);
      u === 0 ? (a.next = null, l === null ? _s = n : l.next = n, n === null && (pn = l)) : (l = a, (e !== 0 || (u & 3) !== 0) && (Ss = !0)), a = n;
    }
    ht !== 0 && ht !== 5 || ou(e), sa !== 0 && (sa = 0);
  }
  function Xd(e, t) {
    for (var l = e.suspendedLanes, a = e.pingedLanes, n = e.expirationTimes, u = e.pendingLanes & -62914561; 0 < u; ) {
      var i = 31 - Tt(u), d = 1 << i, v = n[i];
      v === -1 ? ((d & l) === 0 || (d & a) !== 0) && (n[i] = Dh(d, t)) : v <= t && (e.expiredLanes |= d), u &= ~d;
    }
    if (t = Ge, l = Se, l = el(
      e,
      e === t ? l : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1
    ), a = e.callbackNode, l === 0 || e === t && (Ue === 2 || Ue === 9) || e.cancelPendingCommit !== null)
      return a !== null && a !== null && Ye(a), e.callbackNode = null, e.callbackPriority = 0;
    if ((l & 3) === 0 || zn(e, l)) {
      if (t = l & -l, t === e.callbackPriority) return t;
      switch (a !== null && Ye(a), ac(l)) {
        case 2:
        case 8:
          l = dl;
          break;
        case 32:
          l = Pt;
          break;
        case 268435456:
          l = xt;
          break;
        default:
          l = Pt;
      }
      return a = Vd.bind(null, e), l = P(l, a), e.callbackPriority = t, e.callbackNode = l, t;
    }
    return a !== null && a !== null && Ye(a), e.callbackPriority = 2, e.callbackNode = null, 2;
  }
  function Vd(e, t) {
    if (ht !== 0 && ht !== 5)
      return e.callbackNode = null, e.callbackPriority = 0, null;
    var l = e.callbackNode;
    if (xs() && e.callbackNode !== l)
      return null;
    var a = Se;
    return a = el(
      e,
      e === Ge ? a : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1
    ), a === 0 ? null : (Md(e, a, t), Xd(e, Te()), e.callbackNode != null && e.callbackNode === l ? Vd.bind(null, e) : null);
  }
  function Qd(e, t) {
    if (xs()) return null;
    Md(e, t, !0);
  }
  function cg() {
    bg(function() {
      (Oe & 6) !== 0 ? P(
        bt,
        sg
      ) : Gd();
    });
  }
  function Xi() {
    if (sa === 0) {
      var e = tn;
      e === 0 && (e = Tn, Tn <<= 1, (Tn & 261888) === 0 && (Tn = 256)), sa = e;
    }
    return sa;
  }
  function Zd(e) {
    return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : Au("" + e);
  }
  function Kd(e, t) {
    var l = t.ownerDocument.createElement("input");
    return l.name = t.name, l.value = t.value, e.id && l.setAttribute("form", e.id), t.parentNode.insertBefore(l, t), e = new FormData(e), l.parentNode.removeChild(l), e;
  }
  function ig(e, t, l, a, n) {
    if (t === "submit" && l && l.stateNode === n) {
      var u = Zd(
        (n[Dt] || null).action
      ), i = a.submitter;
      i && (t = (t = i[Dt] || null) ? Zd(t.formAction) : i.getAttribute("formAction"), t !== null && (u = t, i = null));
      var d = new Ru(
        "action",
        "action",
        null,
        a,
        n
      );
      e.push({
        event: d,
        listeners: [
          {
            instance: null,
            listener: function() {
              if (a.defaultPrevented) {
                if (sa !== 0) {
                  var v = i ? Kd(n, i) : new FormData(n);
                  ri(
                    l,
                    {
                      pending: !0,
                      data: v,
                      method: n.method,
                      action: u
                    },
                    null,
                    v
                  );
                }
              } else
                typeof u == "function" && (d.preventDefault(), v = i ? Kd(n, i) : new FormData(n), ri(
                  l,
                  {
                    pending: !0,
                    data: v,
                    method: n.method,
                    action: u
                  },
                  u,
                  v
                ));
            },
            currentTarget: n
          }
        ]
      });
    }
  }
  for (var Vi = 0; Vi < wc.length; Vi++) {
    var Qi = wc[Vi], rg = Qi.toLowerCase(), og = Qi[0].toUpperCase() + Qi.slice(1);
    ml(
      rg,
      "on" + og
    );
  }
  ml(jo, "onAnimationEnd"), ml(No, "onAnimationIteration"), ml(Mo, "onAnimationStart"), ml("dblclick", "onDoubleClick"), ml("focusin", "onFocus"), ml("focusout", "onBlur"), ml(w0, "onTransitionRun"), ml(E0, "onTransitionStart"), ml(T0, "onTransitionCancel"), ml(wo, "onTransitionEnd"), Ya("onMouseEnter", ["mouseout", "mouseover"]), Ya("onMouseLeave", ["mouseout", "mouseover"]), Ya("onPointerEnter", ["pointerout", "pointerover"]), Ya("onPointerLeave", ["pointerout", "pointerover"]), ya(
    "onChange",
    "change click focusin focusout input keydown keyup selectionchange".split(" ")
  ), ya(
    "onSelect",
    "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
      " "
    )
  ), ya("onBeforeInput", [
    "compositionend",
    "keypress",
    "textInput",
    "paste"
  ]), ya(
    "onCompositionEnd",
    "compositionend focusout keydown keypress keyup mousedown".split(" ")
  ), ya(
    "onCompositionStart",
    "compositionstart focusout keydown keypress keyup mousedown".split(" ")
  ), ya(
    "onCompositionUpdate",
    "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
  );
  var fu = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
    " "
  ), fg = new Set(
    "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(fu)
  );
  function Jd(e, t) {
    t = (t & 4) !== 0;
    for (var l = 0; l < e.length; l++) {
      var a = e[l], n = a.event;
      a = a.listeners;
      e: {
        var u = void 0;
        if (t)
          for (var i = a.length - 1; 0 <= i; i--) {
            var d = a[i], v = d.instance, M = d.currentTarget;
            if (d = d.listener, v !== u && n.isPropagationStopped())
              break e;
            u = d, n.currentTarget = M;
            try {
              u(n);
            } catch (A) {
              Bu(A);
            }
            n.currentTarget = null, u = v;
          }
        else
          for (i = 0; i < a.length; i++) {
            if (d = a[i], v = d.instance, M = d.currentTarget, d = d.listener, v !== u && n.isPropagationStopped())
              break e;
            u = d, n.currentTarget = M;
            try {
              u(n);
            } catch (A) {
              Bu(A);
            }
            n.currentTarget = null, u = v;
          }
      }
    }
  }
  function _e(e, t) {
    var l = t[nc];
    l === void 0 && (l = t[nc] = /* @__PURE__ */ new Set());
    var a = e + "__bubble";
    l.has(a) || (Wd(t, e, 2, !1), l.add(a));
  }
  function Zi(e, t, l) {
    var a = 0;
    t && (a |= 4), Wd(
      l,
      e,
      a,
      t
    );
  }
  var js = "_reactListening" + Math.random().toString(36).slice(2);
  function Ki(e) {
    if (!e[js]) {
      e[js] = !0, Lr.forEach(function(l) {
        l !== "selectionchange" && (fg.has(l) || Zi(l, !1, e), Zi(l, !0, e));
      });
      var t = e.nodeType === 9 ? e : e.ownerDocument;
      t === null || t[js] || (t[js] = !0, Zi("selectionchange", !1, t));
    }
  }
  function Wd(e, t, l, a) {
    switch (Nm(t)) {
      case 2:
        var n = kg;
        break;
      case 8:
        n = Lg;
        break;
      default:
        n = ir;
    }
    l = n.bind(
      null,
      t,
      l,
      e
    ), n = void 0, !mc || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (n = !0), a ? n !== void 0 ? e.addEventListener(t, l, {
      capture: !0,
      passive: n
    }) : e.addEventListener(t, l, !0) : n !== void 0 ? e.addEventListener(t, l, {
      passive: n
    }) : e.addEventListener(t, l, !1);
  }
  function Ji(e, t, l, a, n) {
    var u = a;
    if ((t & 1) === 0 && (t & 2) === 0 && a !== null)
      e: for (; ; ) {
        if (a === null) return;
        var i = a.tag;
        if (i === 3 || i === 4) {
          var d = a.stateNode.containerInfo;
          if (d === n) break;
          if (i === 4)
            for (i = a.return; i !== null; ) {
              var v = i.tag;
              if ((v === 3 || v === 4) && i.stateNode.containerInfo === n)
                return;
              i = i.return;
            }
          for (; d !== null; ) {
            if (i = qa(d), i === null) return;
            if (v = i.tag, v === 5 || v === 6 || v === 26 || v === 27) {
              a = u = i;
              continue e;
            }
            d = d.parentNode;
          }
        }
        a = a.return;
      }
    Ir(function() {
      var M = u, A = fc(l), O = [];
      e: {
        var w = Eo.get(e);
        if (w !== void 0) {
          var E = Ru, K = e;
          switch (e) {
            case "keypress":
              if (Ou(l) === 0) break e;
            case "keydown":
            case "keyup":
              E = n0;
              break;
            case "focusin":
              K = "focus", E = pc;
              break;
            case "focusout":
              K = "blur", E = pc;
              break;
            case "beforeblur":
            case "afterblur":
              E = pc;
              break;
            case "click":
              if (l.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              E = to;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              E = Zh;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              E = c0;
              break;
            case jo:
            case No:
            case Mo:
              E = Wh;
              break;
            case wo:
              E = r0;
              break;
            case "scroll":
            case "scrollend":
              E = Vh;
              break;
            case "wheel":
              E = f0;
              break;
            case "copy":
            case "cut":
            case "paste":
              E = Fh;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              E = ao;
              break;
            case "toggle":
            case "beforetoggle":
              E = m0;
          }
          var ue = (t & 4) !== 0, ke = !ue && (e === "scroll" || e === "scrollend"), S = ue ? w !== null ? w + "Capture" : null : w;
          ue = [];
          for (var x = M, N; x !== null; ) {
            var C = x;
            if (N = C.stateNode, C = C.tag, C !== 5 && C !== 26 && C !== 27 || N === null || S === null || (C = Dn(x, S), C != null && ue.push(
              du(x, C, N)
            )), ke) break;
            x = x.return;
          }
          0 < ue.length && (w = new E(
            w,
            K,
            null,
            l,
            A
          ), O.push({ event: w, listeners: ue }));
        }
      }
      if ((t & 7) === 0) {
        e: {
          if (w = e === "mouseover" || e === "pointerover", E = e === "mouseout" || e === "pointerout", w && l !== oc && (K = l.relatedTarget || l.fromElement) && (qa(K) || K[Ba]))
            break e;
          if ((E || w) && (w = A.window === A ? A : (w = A.ownerDocument) ? w.defaultView || w.parentWindow : window, E ? (K = l.relatedTarget || l.toElement, E = M, K = K ? qa(K) : null, K !== null && (ke = h(K), ue = K.tag, K !== ke || ue !== 5 && ue !== 27 && ue !== 6) && (K = null)) : (E = null, K = M), E !== K)) {
            if (ue = to, C = "onMouseLeave", S = "onMouseEnter", x = "mouse", (e === "pointerout" || e === "pointerover") && (ue = ao, C = "onPointerLeave", S = "onPointerEnter", x = "pointer"), ke = E == null ? w : On(E), N = K == null ? w : On(K), w = new ue(
              C,
              x + "leave",
              E,
              l,
              A
            ), w.target = ke, w.relatedTarget = N, C = null, qa(A) === M && (ue = new ue(
              S,
              x + "enter",
              K,
              l,
              A
            ), ue.target = N, ue.relatedTarget = ke, C = ue), ke = C, E && K)
              t: {
                for (ue = dg, S = E, x = K, N = 0, C = S; C; C = ue(C))
                  N++;
                C = 0;
                for (var ae = x; ae; ae = ue(ae))
                  C++;
                for (; 0 < N - C; )
                  S = ue(S), N--;
                for (; 0 < C - N; )
                  x = ue(x), C--;
                for (; N--; ) {
                  if (S === x || x !== null && S === x.alternate) {
                    ue = S;
                    break t;
                  }
                  S = ue(S), x = ue(x);
                }
                ue = null;
              }
            else ue = null;
            E !== null && $d(
              O,
              w,
              E,
              ue,
              !1
            ), K !== null && ke !== null && $d(
              O,
              ke,
              K,
              ue,
              !0
            );
          }
        }
        e: {
          if (w = M ? On(M) : window, E = w.nodeName && w.nodeName.toLowerCase(), E === "select" || E === "input" && w.type === "file")
            var ze = fo;
          else if (ro(w))
            if (mo)
              ze = j0;
            else {
              ze = _0;
              var $ = x0;
            }
          else
            E = w.nodeName, !E || E.toLowerCase() !== "input" || w.type !== "checkbox" && w.type !== "radio" ? M && rc(M.elementType) && (ze = fo) : ze = S0;
          if (ze && (ze = ze(e, M))) {
            oo(
              O,
              ze,
              l,
              A
            );
            break e;
          }
          $ && $(e, w, M), e === "focusout" && M && w.type === "number" && M.memoizedProps.value != null && ic(w, "number", w.value);
        }
        switch ($ = M ? On(M) : window, e) {
          case "focusin":
            (ro($) || $.contentEditable === "true") && (Ka = $, jc = M, Yn = null);
            break;
          case "focusout":
            Yn = jc = Ka = null;
            break;
          case "mousedown":
            Nc = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Nc = !1, _o(O, l, A);
            break;
          case "selectionchange":
            if (M0) break;
          case "keydown":
          case "keyup":
            _o(O, l, A);
        }
        var ge;
        if (bc)
          e: {
            switch (e) {
              case "compositionstart":
                var je = "onCompositionStart";
                break e;
              case "compositionend":
                je = "onCompositionEnd";
                break e;
              case "compositionupdate":
                je = "onCompositionUpdate";
                break e;
            }
            je = void 0;
          }
        else
          Za ? co(e, l) && (je = "onCompositionEnd") : e === "keydown" && l.keyCode === 229 && (je = "onCompositionStart");
        je && (no && l.locale !== "ko" && (Za || je !== "onCompositionStart" ? je === "onCompositionEnd" && Za && (ge = Pr()) : (Vl = A, hc = "value" in Vl ? Vl.value : Vl.textContent, Za = !0)), $ = Ns(M, je), 0 < $.length && (je = new lo(
          je,
          e,
          null,
          l,
          A
        ), O.push({ event: je, listeners: $ }), ge ? je.data = ge : (ge = io(l), ge !== null && (je.data = ge)))), (ge = g0 ? v0(e, l) : p0(e, l)) && (je = Ns(M, "onBeforeInput"), 0 < je.length && ($ = new lo(
          "onBeforeInput",
          "beforeinput",
          null,
          l,
          A
        ), O.push({
          event: $,
          listeners: je
        }), $.data = ge)), ig(
          O,
          e,
          M,
          l,
          A
        );
      }
      Jd(O, t);
    });
  }
  function du(e, t, l) {
    return {
      instance: e,
      listener: t,
      currentTarget: l
    };
  }
  function Ns(e, t) {
    for (var l = t + "Capture", a = []; e !== null; ) {
      var n = e, u = n.stateNode;
      if (n = n.tag, n !== 5 && n !== 26 && n !== 27 || u === null || (n = Dn(e, l), n != null && a.unshift(
        du(e, n, u)
      ), n = Dn(e, t), n != null && a.push(
        du(e, n, u)
      )), e.tag === 3) return a;
      e = e.return;
    }
    return [];
  }
  function dg(e) {
    if (e === null) return null;
    do
      e = e.return;
    while (e && e.tag !== 5 && e.tag !== 27);
    return e || null;
  }
  function $d(e, t, l, a, n) {
    for (var u = t._reactName, i = []; l !== null && l !== a; ) {
      var d = l, v = d.alternate, M = d.stateNode;
      if (d = d.tag, v !== null && v === a) break;
      d !== 5 && d !== 26 && d !== 27 || M === null || (v = M, n ? (M = Dn(l, u), M != null && i.unshift(
        du(l, M, v)
      )) : n || (M = Dn(l, u), M != null && i.push(
        du(l, M, v)
      ))), l = l.return;
    }
    i.length !== 0 && e.push({ event: t, listeners: i });
  }
  var mg = /\r\n?/g, hg = /\u0000|\uFFFD/g;
  function Fd(e) {
    return (typeof e == "string" ? e : "" + e).replace(mg, `
`).replace(hg, "");
  }
  function Id(e, t) {
    return t = Fd(t), Fd(e) === t;
  }
  function qe(e, t, l, a, n, u) {
    switch (l) {
      case "children":
        typeof a == "string" ? t === "body" || t === "textarea" && a === "" || Xa(e, a) : (typeof a == "number" || typeof a == "bigint") && t !== "body" && Xa(e, "" + a);
        break;
      case "className":
        Tu(e, "class", a);
        break;
      case "tabIndex":
        Tu(e, "tabindex", a);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        Tu(e, l, a);
        break;
      case "style":
        $r(e, a, u);
        break;
      case "data":
        if (t !== "object") {
          Tu(e, "data", a);
          break;
        }
      case "src":
      case "href":
        if (a === "" && (t !== "a" || l !== "href")) {
          e.removeAttribute(l);
          break;
        }
        if (a == null || typeof a == "function" || typeof a == "symbol" || typeof a == "boolean") {
          e.removeAttribute(l);
          break;
        }
        a = Au("" + a), e.setAttribute(l, a);
        break;
      case "action":
      case "formAction":
        if (typeof a == "function") {
          e.setAttribute(
            l,
            "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
          );
          break;
        } else
          typeof u == "function" && (l === "formAction" ? (t !== "input" && qe(e, t, "name", n.name, n, null), qe(
            e,
            t,
            "formEncType",
            n.formEncType,
            n,
            null
          ), qe(
            e,
            t,
            "formMethod",
            n.formMethod,
            n,
            null
          ), qe(
            e,
            t,
            "formTarget",
            n.formTarget,
            n,
            null
          )) : (qe(e, t, "encType", n.encType, n, null), qe(e, t, "method", n.method, n, null), qe(e, t, "target", n.target, n, null)));
        if (a == null || typeof a == "symbol" || typeof a == "boolean") {
          e.removeAttribute(l);
          break;
        }
        a = Au("" + a), e.setAttribute(l, a);
        break;
      case "onClick":
        a != null && (e.onclick = Nl);
        break;
      case "onScroll":
        a != null && _e("scroll", e);
        break;
      case "onScrollEnd":
        a != null && _e("scrollend", e);
        break;
      case "dangerouslySetInnerHTML":
        if (a != null) {
          if (typeof a != "object" || !("__html" in a))
            throw Error(o(61));
          if (l = a.__html, l != null) {
            if (n.children != null) throw Error(o(60));
            e.innerHTML = l;
          }
        }
        break;
      case "multiple":
        e.multiple = a && typeof a != "function" && typeof a != "symbol";
        break;
      case "muted":
        e.muted = a && typeof a != "function" && typeof a != "symbol";
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
        if (a == null || typeof a == "function" || typeof a == "boolean" || typeof a == "symbol") {
          e.removeAttribute("xlink:href");
          break;
        }
        l = Au("" + a), e.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "xlink:href",
          l
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
        a != null && typeof a != "function" && typeof a != "symbol" ? e.setAttribute(l, "" + a) : e.removeAttribute(l);
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
        a && typeof a != "function" && typeof a != "symbol" ? e.setAttribute(l, "") : e.removeAttribute(l);
        break;
      case "capture":
      case "download":
        a === !0 ? e.setAttribute(l, "") : a !== !1 && a != null && typeof a != "function" && typeof a != "symbol" ? e.setAttribute(l, a) : e.removeAttribute(l);
        break;
      case "cols":
      case "rows":
      case "size":
      case "span":
        a != null && typeof a != "function" && typeof a != "symbol" && !isNaN(a) && 1 <= a ? e.setAttribute(l, a) : e.removeAttribute(l);
        break;
      case "rowSpan":
      case "start":
        a == null || typeof a == "function" || typeof a == "symbol" || isNaN(a) ? e.removeAttribute(l) : e.setAttribute(l, a);
        break;
      case "popover":
        _e("beforetoggle", e), _e("toggle", e), Eu(e, "popover", a);
        break;
      case "xlinkActuate":
        jl(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:actuate",
          a
        );
        break;
      case "xlinkArcrole":
        jl(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:arcrole",
          a
        );
        break;
      case "xlinkRole":
        jl(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:role",
          a
        );
        break;
      case "xlinkShow":
        jl(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:show",
          a
        );
        break;
      case "xlinkTitle":
        jl(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:title",
          a
        );
        break;
      case "xlinkType":
        jl(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:type",
          a
        );
        break;
      case "xmlBase":
        jl(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:base",
          a
        );
        break;
      case "xmlLang":
        jl(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:lang",
          a
        );
        break;
      case "xmlSpace":
        jl(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:space",
          a
        );
        break;
      case "is":
        Eu(e, "is", a);
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        (!(2 < l.length) || l[0] !== "o" && l[0] !== "O" || l[1] !== "n" && l[1] !== "N") && (l = Gh.get(l) || l, Eu(e, l, a));
    }
  }
  function Wi(e, t, l, a, n, u) {
    switch (l) {
      case "style":
        $r(e, a, u);
        break;
      case "dangerouslySetInnerHTML":
        if (a != null) {
          if (typeof a != "object" || !("__html" in a))
            throw Error(o(61));
          if (l = a.__html, l != null) {
            if (n.children != null) throw Error(o(60));
            e.innerHTML = l;
          }
        }
        break;
      case "children":
        typeof a == "string" ? Xa(e, a) : (typeof a == "number" || typeof a == "bigint") && Xa(e, "" + a);
        break;
      case "onScroll":
        a != null && _e("scroll", e);
        break;
      case "onScrollEnd":
        a != null && _e("scrollend", e);
        break;
      case "onClick":
        a != null && (e.onclick = Nl);
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
        if (!Yr.hasOwnProperty(l))
          e: {
            if (l[0] === "o" && l[1] === "n" && (n = l.endsWith("Capture"), t = l.slice(2, n ? l.length - 7 : void 0), u = e[Dt] || null, u = u != null ? u[l] : null, typeof u == "function" && e.removeEventListener(t, u, n), typeof a == "function")) {
              typeof u != "function" && u !== null && (l in e ? e[l] = null : e.hasAttribute(l) && e.removeAttribute(l)), e.addEventListener(t, a, n);
              break e;
            }
            l in e ? e[l] = a : a === !0 ? e.setAttribute(l, "") : Eu(e, l, a);
          }
    }
  }
  function Mt(e, t, l) {
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
        _e("error", e), _e("load", e);
        var a = !1, n = !1, u;
        for (u in l)
          if (l.hasOwnProperty(u)) {
            var i = l[u];
            if (i != null)
              switch (u) {
                case "src":
                  a = !0;
                  break;
                case "srcSet":
                  n = !0;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(o(137, t));
                default:
                  qe(e, t, u, i, l, null);
              }
          }
        n && qe(e, t, "srcSet", l.srcSet, l, null), a && qe(e, t, "src", l.src, l, null);
        return;
      case "input":
        _e("invalid", e);
        var d = u = i = n = null, v = null, M = null;
        for (a in l)
          if (l.hasOwnProperty(a)) {
            var A = l[a];
            if (A != null)
              switch (a) {
                case "name":
                  n = A;
                  break;
                case "type":
                  i = A;
                  break;
                case "checked":
                  v = A;
                  break;
                case "defaultChecked":
                  M = A;
                  break;
                case "value":
                  u = A;
                  break;
                case "defaultValue":
                  d = A;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (A != null)
                    throw Error(o(137, t));
                  break;
                default:
                  qe(e, t, a, A, l, null);
              }
          }
        Zr(
          e,
          u,
          d,
          v,
          M,
          i,
          n,
          !1
        );
        return;
      case "select":
        _e("invalid", e), a = i = u = null;
        for (n in l)
          if (l.hasOwnProperty(n) && (d = l[n], d != null))
            switch (n) {
              case "value":
                u = d;
                break;
              case "defaultValue":
                i = d;
                break;
              case "multiple":
                a = d;
              default:
                qe(e, t, n, d, l, null);
            }
        t = u, l = i, e.multiple = !!a, t != null ? Ga(e, !!a, t, !1) : l != null && Ga(e, !!a, l, !0);
        return;
      case "textarea":
        _e("invalid", e), u = n = a = null;
        for (i in l)
          if (l.hasOwnProperty(i) && (d = l[i], d != null))
            switch (i) {
              case "value":
                a = d;
                break;
              case "defaultValue":
                n = d;
                break;
              case "children":
                u = d;
                break;
              case "dangerouslySetInnerHTML":
                if (d != null) throw Error(o(91));
                break;
              default:
                qe(e, t, i, d, l, null);
            }
        Jr(e, a, n, u);
        return;
      case "option":
        for (v in l)
          if (l.hasOwnProperty(v) && (a = l[v], a != null))
            switch (v) {
              case "selected":
                e.selected = a && typeof a != "function" && typeof a != "symbol";
                break;
              default:
                qe(e, t, v, a, l, null);
            }
        return;
      case "dialog":
        _e("beforetoggle", e), _e("toggle", e), _e("cancel", e), _e("close", e);
        break;
      case "iframe":
      case "object":
        _e("load", e);
        break;
      case "video":
      case "audio":
        for (a = 0; a < fu.length; a++)
          _e(fu[a], e);
        break;
      case "image":
        _e("error", e), _e("load", e);
        break;
      case "details":
        _e("toggle", e);
        break;
      case "embed":
      case "source":
      case "link":
        _e("error", e), _e("load", e);
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
        for (M in l)
          if (l.hasOwnProperty(M) && (a = l[M], a != null))
            switch (M) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(o(137, t));
              default:
                qe(e, t, M, a, l, null);
            }
        return;
      default:
        if (rc(t)) {
          for (A in l)
            l.hasOwnProperty(A) && (a = l[A], a !== void 0 && Wi(
              e,
              t,
              A,
              a,
              l,
              void 0
            ));
          return;
        }
    }
    for (d in l)
      l.hasOwnProperty(d) && (a = l[d], a != null && qe(e, t, d, a, l, null));
  }
  function gg(e, t, l, a) {
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
        var n = null, u = null, i = null, d = null, v = null, M = null, A = null;
        for (E in l) {
          var O = l[E];
          if (l.hasOwnProperty(E) && O != null)
            switch (E) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                v = O;
              default:
                a.hasOwnProperty(E) || qe(e, t, E, null, a, O);
            }
        }
        for (var w in a) {
          var E = a[w];
          if (O = l[w], a.hasOwnProperty(w) && (E != null || O != null))
            switch (w) {
              case "type":
                u = E;
                break;
              case "name":
                n = E;
                break;
              case "checked":
                M = E;
                break;
              case "defaultChecked":
                A = E;
                break;
              case "value":
                i = E;
                break;
              case "defaultValue":
                d = E;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (E != null)
                  throw Error(o(137, t));
                break;
              default:
                E !== O && qe(
                  e,
                  t,
                  w,
                  E,
                  a,
                  O
                );
            }
        }
        cc(
          e,
          i,
          d,
          v,
          M,
          A,
          u,
          n
        );
        return;
      case "select":
        E = i = d = w = null;
        for (u in l)
          if (v = l[u], l.hasOwnProperty(u) && v != null)
            switch (u) {
              case "value":
                break;
              case "multiple":
                E = v;
              default:
                a.hasOwnProperty(u) || qe(
                  e,
                  t,
                  u,
                  null,
                  a,
                  v
                );
            }
        for (n in a)
          if (u = a[n], v = l[n], a.hasOwnProperty(n) && (u != null || v != null))
            switch (n) {
              case "value":
                w = u;
                break;
              case "defaultValue":
                d = u;
                break;
              case "multiple":
                i = u;
              default:
                u !== v && qe(
                  e,
                  t,
                  n,
                  u,
                  a,
                  v
                );
            }
        t = d, l = i, a = E, w != null ? Ga(e, !!l, w, !1) : !!a != !!l && (t != null ? Ga(e, !!l, t, !0) : Ga(e, !!l, l ? [] : "", !1));
        return;
      case "textarea":
        E = w = null;
        for (d in l)
          if (n = l[d], l.hasOwnProperty(d) && n != null && !a.hasOwnProperty(d))
            switch (d) {
              case "value":
                break;
              case "children":
                break;
              default:
                qe(e, t, d, null, a, n);
            }
        for (i in a)
          if (n = a[i], u = l[i], a.hasOwnProperty(i) && (n != null || u != null))
            switch (i) {
              case "value":
                w = n;
                break;
              case "defaultValue":
                E = n;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (n != null) throw Error(o(91));
                break;
              default:
                n !== u && qe(e, t, i, n, a, u);
            }
        Kr(e, w, E);
        return;
      case "option":
        for (var K in l)
          if (w = l[K], l.hasOwnProperty(K) && w != null && !a.hasOwnProperty(K))
            switch (K) {
              case "selected":
                e.selected = !1;
                break;
              default:
                qe(
                  e,
                  t,
                  K,
                  null,
                  a,
                  w
                );
            }
        for (v in a)
          if (w = a[v], E = l[v], a.hasOwnProperty(v) && w !== E && (w != null || E != null))
            switch (v) {
              case "selected":
                e.selected = w && typeof w != "function" && typeof w != "symbol";
                break;
              default:
                qe(
                  e,
                  t,
                  v,
                  w,
                  a,
                  E
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
        for (var ue in l)
          w = l[ue], l.hasOwnProperty(ue) && w != null && !a.hasOwnProperty(ue) && qe(e, t, ue, null, a, w);
        for (M in a)
          if (w = a[M], E = l[M], a.hasOwnProperty(M) && w !== E && (w != null || E != null))
            switch (M) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (w != null)
                  throw Error(o(137, t));
                break;
              default:
                qe(
                  e,
                  t,
                  M,
                  w,
                  a,
                  E
                );
            }
        return;
      default:
        if (rc(t)) {
          for (var ke in l)
            w = l[ke], l.hasOwnProperty(ke) && w !== void 0 && !a.hasOwnProperty(ke) && Wi(
              e,
              t,
              ke,
              void 0,
              a,
              w
            );
          for (A in a)
            w = a[A], E = l[A], !a.hasOwnProperty(A) || w === E || w === void 0 && E === void 0 || Wi(
              e,
              t,
              A,
              w,
              a,
              E
            );
          return;
        }
    }
    for (var S in l)
      w = l[S], l.hasOwnProperty(S) && w != null && !a.hasOwnProperty(S) && qe(e, t, S, null, a, w);
    for (O in a)
      w = a[O], E = l[O], !a.hasOwnProperty(O) || w === E || w == null && E == null || qe(e, t, O, w, a, E);
  }
  function Pd(e) {
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
  function vg() {
    if (typeof performance.getEntriesByType == "function") {
      for (var e = 0, t = 0, l = performance.getEntriesByType("resource"), a = 0; a < l.length; a++) {
        var n = l[a], u = n.transferSize, i = n.initiatorType, d = n.duration;
        if (u && d && Pd(i)) {
          for (i = 0, d = n.responseEnd, a += 1; a < l.length; a++) {
            var v = l[a], M = v.startTime;
            if (M > d) break;
            var A = v.transferSize, O = v.initiatorType;
            A && Pd(O) && (v = v.responseEnd, i += A * (v < d ? 1 : (d - M) / (v - M)));
          }
          if (--a, t += 8 * (u + i) / (n.duration / 1e3), e++, 10 < e) break;
        }
      }
      if (0 < e) return t / e / 1e6;
    }
    return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
  }
  var $i = null, Fi = null;
  function Ms(e) {
    return e.nodeType === 9 ? e : e.ownerDocument;
  }
  function em(e) {
    switch (e) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function tm(e, t) {
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
  function Ii(e, t) {
    return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
  }
  var Pi = null;
  function pg() {
    var e = window.event;
    return e && e.type === "popstate" ? e === Pi ? !1 : (Pi = e, !0) : (Pi = null, !1);
  }
  var lm = typeof setTimeout == "function" ? setTimeout : void 0, yg = typeof clearTimeout == "function" ? clearTimeout : void 0, am = typeof Promise == "function" ? Promise : void 0, bg = typeof queueMicrotask == "function" ? queueMicrotask : typeof am < "u" ? function(e) {
    return am.resolve(null).then(e).catch(xg);
  } : lm;
  function xg(e) {
    setTimeout(function() {
      throw e;
    });
  }
  function ca(e) {
    return e === "head";
  }
  function nm(e, t) {
    var l = t, a = 0;
    do {
      var n = l.nextSibling;
      if (e.removeChild(l), n && n.nodeType === 8)
        if (l = n.data, l === "/$" || l === "/&") {
          if (a === 0) {
            e.removeChild(n), _n(t);
            return;
          }
          a--;
        } else if (l === "$" || l === "$?" || l === "$~" || l === "$!" || l === "&")
          a++;
        else if (l === "html")
          mu(e.ownerDocument.documentElement);
        else if (l === "head") {
          l = e.ownerDocument.head, mu(l);
          for (var u = l.firstChild; u; ) {
            var i = u.nextSibling, d = u.nodeName;
            u[Cn] || d === "SCRIPT" || d === "STYLE" || d === "LINK" && u.rel.toLowerCase() === "stylesheet" || l.removeChild(u), u = i;
          }
        } else
          l === "body" && mu(e.ownerDocument.body);
      l = n;
    } while (l);
    _n(t);
  }
  function um(e, t) {
    var l = e;
    e = 0;
    do {
      var a = l.nextSibling;
      if (l.nodeType === 1 ? t ? (l._stashedDisplay = l.style.display, l.style.display = "none") : (l.style.display = l._stashedDisplay || "", l.getAttribute("style") === "" && l.removeAttribute("style")) : l.nodeType === 3 && (t ? (l._stashedText = l.nodeValue, l.nodeValue = "") : l.nodeValue = l._stashedText || ""), a && a.nodeType === 8)
        if (l = a.data, l === "/$") {
          if (e === 0) break;
          e--;
        } else
          l !== "$" && l !== "$?" && l !== "$~" && l !== "$!" || e++;
      l = a;
    } while (l);
  }
  function er(e) {
    var t = e.firstChild;
    for (t && t.nodeType === 10 && (t = t.nextSibling); t; ) {
      var l = t;
      switch (t = t.nextSibling, l.nodeName) {
        case "HTML":
        case "HEAD":
        case "BODY":
          er(l), uc(l);
          continue;
        case "SCRIPT":
        case "STYLE":
          continue;
        case "LINK":
          if (l.rel.toLowerCase() === "stylesheet") continue;
      }
      e.removeChild(l);
    }
  }
  function _g(e, t, l, a) {
    for (; e.nodeType === 1; ) {
      var n = l;
      if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
        if (!a && (e.nodeName !== "INPUT" || e.type !== "hidden"))
          break;
      } else if (a) {
        if (!e[Cn])
          switch (t) {
            case "meta":
              if (!e.hasAttribute("itemprop")) break;
              return e;
            case "link":
              if (u = e.getAttribute("rel"), u === "stylesheet" && e.hasAttribute("data-precedence"))
                break;
              if (u !== n.rel || e.getAttribute("href") !== (n.href == null || n.href === "" ? null : n.href) || e.getAttribute("crossorigin") !== (n.crossOrigin == null ? null : n.crossOrigin) || e.getAttribute("title") !== (n.title == null ? null : n.title))
                break;
              return e;
            case "style":
              if (e.hasAttribute("data-precedence")) break;
              return e;
            case "script":
              if (u = e.getAttribute("src"), (u !== (n.src == null ? null : n.src) || e.getAttribute("type") !== (n.type == null ? null : n.type) || e.getAttribute("crossorigin") !== (n.crossOrigin == null ? null : n.crossOrigin)) && u && e.hasAttribute("async") && !e.hasAttribute("itemprop"))
                break;
              return e;
            default:
              return e;
          }
      } else if (t === "input" && e.type === "hidden") {
        var u = n.name == null ? null : "" + n.name;
        if (n.type === "hidden" && e.getAttribute("name") === u)
          return e;
      } else return e;
      if (e = rl(e.nextSibling), e === null) break;
    }
    return null;
  }
  function Sg(e, t, l) {
    if (t === "") return null;
    for (; e.nodeType !== 3; )
      if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !l || (e = rl(e.nextSibling), e === null)) return null;
    return e;
  }
  function sm(e, t) {
    for (; e.nodeType !== 8; )
      if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = rl(e.nextSibling), e === null)) return null;
    return e;
  }
  function tr(e) {
    return e.data === "$?" || e.data === "$~";
  }
  function lr(e) {
    return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
  }
  function jg(e, t) {
    var l = e.ownerDocument;
    if (e.data === "$~") e._reactRetry = t;
    else if (e.data !== "$?" || l.readyState !== "loading")
      t();
    else {
      var a = function() {
        t(), l.removeEventListener("DOMContentLoaded", a);
      };
      l.addEventListener("DOMContentLoaded", a), e._reactRetry = a;
    }
  }
  function rl(e) {
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
  var ar = null;
  function cm(e) {
    e = e.nextSibling;
    for (var t = 0; e; ) {
      if (e.nodeType === 8) {
        var l = e.data;
        if (l === "/$" || l === "/&") {
          if (t === 0)
            return rl(e.nextSibling);
          t--;
        } else
          l !== "$" && l !== "$!" && l !== "$?" && l !== "$~" && l !== "&" || t++;
      }
      e = e.nextSibling;
    }
    return null;
  }
  function im(e) {
    e = e.previousSibling;
    for (var t = 0; e; ) {
      if (e.nodeType === 8) {
        var l = e.data;
        if (l === "$" || l === "$!" || l === "$?" || l === "$~" || l === "&") {
          if (t === 0) return e;
          t--;
        } else l !== "/$" && l !== "/&" || t++;
      }
      e = e.previousSibling;
    }
    return null;
  }
  function rm(e, t, l) {
    switch (t = Ms(l), e) {
      case "html":
        if (e = t.documentElement, !e) throw Error(o(452));
        return e;
      case "head":
        if (e = t.head, !e) throw Error(o(453));
        return e;
      case "body":
        if (e = t.body, !e) throw Error(o(454));
        return e;
      default:
        throw Error(o(451));
    }
  }
  function mu(e) {
    for (var t = e.attributes; t.length; )
      e.removeAttributeNode(t[0]);
    uc(e);
  }
  var ol = /* @__PURE__ */ new Map(), om = /* @__PURE__ */ new Set();
  function ws(e) {
    return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument;
  }
  var Ll = q.d;
  q.d = {
    f: Ng,
    r: Mg,
    D: wg,
    C: Eg,
    L: Tg,
    m: zg,
    X: Cg,
    S: Ag,
    M: Og
  };
  function Ng() {
    var e = Ll.f(), t = ps();
    return e || t;
  }
  function Mg(e) {
    var t = ka(e);
    t !== null && t.tag === 5 && t.type === "form" ? Ef(t) : Ll.r(e);
  }
  var yn = typeof document > "u" ? null : document;
  function fm(e, t, l) {
    var a = yn;
    if (a && typeof t == "string" && t) {
      var n = ll(t);
      n = 'link[rel="' + e + '"][href="' + n + '"]', typeof l == "string" && (n += '[crossorigin="' + l + '"]'), om.has(n) || (om.add(n), e = { rel: e, crossOrigin: l, href: t }, a.querySelector(n) === null && (t = a.createElement("link"), Mt(t, "link", e), gt(t), a.head.appendChild(t)));
    }
  }
  function wg(e) {
    Ll.D(e), fm("dns-prefetch", e, null);
  }
  function Eg(e, t) {
    Ll.C(e, t), fm("preconnect", e, t);
  }
  function Tg(e, t, l) {
    Ll.L(e, t, l);
    var a = yn;
    if (a && e && t) {
      var n = 'link[rel="preload"][as="' + ll(t) + '"]';
      t === "image" && l && l.imageSrcSet ? (n += '[imagesrcset="' + ll(
        l.imageSrcSet
      ) + '"]', typeof l.imageSizes == "string" && (n += '[imagesizes="' + ll(
        l.imageSizes
      ) + '"]')) : n += '[href="' + ll(e) + '"]';
      var u = n;
      switch (t) {
        case "style":
          u = bn(e);
          break;
        case "script":
          u = xn(e);
      }
      ol.has(u) || (e = z(
        {
          rel: "preload",
          href: t === "image" && l && l.imageSrcSet ? void 0 : e,
          as: t
        },
        l
      ), ol.set(u, e), a.querySelector(n) !== null || t === "style" && a.querySelector(hu(u)) || t === "script" && a.querySelector(gu(u)) || (t = a.createElement("link"), Mt(t, "link", e), gt(t), a.head.appendChild(t)));
    }
  }
  function zg(e, t) {
    Ll.m(e, t);
    var l = yn;
    if (l && e) {
      var a = t && typeof t.as == "string" ? t.as : "script", n = 'link[rel="modulepreload"][as="' + ll(a) + '"][href="' + ll(e) + '"]', u = n;
      switch (a) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          u = xn(e);
      }
      if (!ol.has(u) && (e = z({ rel: "modulepreload", href: e }, t), ol.set(u, e), l.querySelector(n) === null)) {
        switch (a) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (l.querySelector(gu(u)))
              return;
        }
        a = l.createElement("link"), Mt(a, "link", e), gt(a), l.head.appendChild(a);
      }
    }
  }
  function Ag(e, t, l) {
    Ll.S(e, t, l);
    var a = yn;
    if (a && e) {
      var n = La(a).hoistableStyles, u = bn(e);
      t = t || "default";
      var i = n.get(u);
      if (!i) {
        var d = { loading: 0, preload: null };
        if (i = a.querySelector(
          hu(u)
        ))
          d.loading = 5;
        else {
          e = z(
            { rel: "stylesheet", href: e, "data-precedence": t },
            l
          ), (l = ol.get(u)) && nr(e, l);
          var v = i = a.createElement("link");
          gt(v), Mt(v, "link", e), v._p = new Promise(function(M, A) {
            v.onload = M, v.onerror = A;
          }), v.addEventListener("load", function() {
            d.loading |= 1;
          }), v.addEventListener("error", function() {
            d.loading |= 2;
          }), d.loading |= 4, Es(i, t, a);
        }
        i = {
          type: "stylesheet",
          instance: i,
          count: 1,
          state: d
        }, n.set(u, i);
      }
    }
  }
  function Cg(e, t) {
    Ll.X(e, t);
    var l = yn;
    if (l && e) {
      var a = La(l).hoistableScripts, n = xn(e), u = a.get(n);
      u || (u = l.querySelector(gu(n)), u || (e = z({ src: e, async: !0 }, t), (t = ol.get(n)) && ur(e, t), u = l.createElement("script"), gt(u), Mt(u, "link", e), l.head.appendChild(u)), u = {
        type: "script",
        instance: u,
        count: 1,
        state: null
      }, a.set(n, u));
    }
  }
  function Og(e, t) {
    Ll.M(e, t);
    var l = yn;
    if (l && e) {
      var a = La(l).hoistableScripts, n = xn(e), u = a.get(n);
      u || (u = l.querySelector(gu(n)), u || (e = z({ src: e, async: !0, type: "module" }, t), (t = ol.get(n)) && ur(e, t), u = l.createElement("script"), gt(u), Mt(u, "link", e), l.head.appendChild(u)), u = {
        type: "script",
        instance: u,
        count: 1,
        state: null
      }, a.set(n, u));
    }
  }
  function dm(e, t, l, a) {
    var n = (n = k.current) ? ws(n) : null;
    if (!n) throw Error(o(446));
    switch (e) {
      case "meta":
      case "title":
        return null;
      case "style":
        return typeof l.precedence == "string" && typeof l.href == "string" ? (t = bn(l.href), l = La(
          n
        ).hoistableStyles, a = l.get(t), a || (a = {
          type: "style",
          instance: null,
          count: 0,
          state: null
        }, l.set(t, a)), a) : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if (l.rel === "stylesheet" && typeof l.href == "string" && typeof l.precedence == "string") {
          e = bn(l.href);
          var u = La(
            n
          ).hoistableStyles, i = u.get(e);
          if (i || (n = n.ownerDocument || n, i = {
            type: "stylesheet",
            instance: null,
            count: 0,
            state: { loading: 0, preload: null }
          }, u.set(e, i), (u = n.querySelector(
            hu(e)
          )) && !u._p && (i.instance = u, i.state.loading = 5), ol.has(e) || (l = {
            rel: "preload",
            as: "style",
            href: l.href,
            crossOrigin: l.crossOrigin,
            integrity: l.integrity,
            media: l.media,
            hrefLang: l.hrefLang,
            referrerPolicy: l.referrerPolicy
          }, ol.set(e, l), u || Dg(
            n,
            e,
            l,
            i.state
          ))), t && a === null)
            throw Error(o(528, ""));
          return i;
        }
        if (t && a !== null)
          throw Error(o(529, ""));
        return null;
      case "script":
        return t = l.async, l = l.src, typeof l == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = xn(l), l = La(
          n
        ).hoistableScripts, a = l.get(t), a || (a = {
          type: "script",
          instance: null,
          count: 0,
          state: null
        }, l.set(t, a)), a) : { type: "void", instance: null, count: 0, state: null };
      default:
        throw Error(o(444, e));
    }
  }
  function bn(e) {
    return 'href="' + ll(e) + '"';
  }
  function hu(e) {
    return 'link[rel="stylesheet"][' + e + "]";
  }
  function mm(e) {
    return z({}, e, {
      "data-precedence": e.precedence,
      precedence: null
    });
  }
  function Dg(e, t, l, a) {
    e.querySelector('link[rel="preload"][as="style"][' + t + "]") ? a.loading = 1 : (t = e.createElement("link"), a.preload = t, t.addEventListener("load", function() {
      return a.loading |= 1;
    }), t.addEventListener("error", function() {
      return a.loading |= 2;
    }), Mt(t, "link", l), gt(t), e.head.appendChild(t));
  }
  function xn(e) {
    return '[src="' + ll(e) + '"]';
  }
  function gu(e) {
    return "script[async]" + e;
  }
  function hm(e, t, l) {
    if (t.count++, t.instance === null)
      switch (t.type) {
        case "style":
          var a = e.querySelector(
            'style[data-href~="' + ll(l.href) + '"]'
          );
          if (a)
            return t.instance = a, gt(a), a;
          var n = z({}, l, {
            "data-href": l.href,
            "data-precedence": l.precedence,
            href: null,
            precedence: null
          });
          return a = (e.ownerDocument || e).createElement(
            "style"
          ), gt(a), Mt(a, "style", n), Es(a, l.precedence, e), t.instance = a;
        case "stylesheet":
          n = bn(l.href);
          var u = e.querySelector(
            hu(n)
          );
          if (u)
            return t.state.loading |= 4, t.instance = u, gt(u), u;
          a = mm(l), (n = ol.get(n)) && nr(a, n), u = (e.ownerDocument || e).createElement("link"), gt(u);
          var i = u;
          return i._p = new Promise(function(d, v) {
            i.onload = d, i.onerror = v;
          }), Mt(u, "link", a), t.state.loading |= 4, Es(u, l.precedence, e), t.instance = u;
        case "script":
          return u = xn(l.src), (n = e.querySelector(
            gu(u)
          )) ? (t.instance = n, gt(n), n) : (a = l, (n = ol.get(u)) && (a = z({}, l), ur(a, n)), e = e.ownerDocument || e, n = e.createElement("script"), gt(n), Mt(n, "link", a), e.head.appendChild(n), t.instance = n);
        case "void":
          return null;
        default:
          throw Error(o(443, t.type));
      }
    else
      t.type === "stylesheet" && (t.state.loading & 4) === 0 && (a = t.instance, t.state.loading |= 4, Es(a, l.precedence, e));
    return t.instance;
  }
  function Es(e, t, l) {
    for (var a = l.querySelectorAll(
      'link[rel="stylesheet"][data-precedence],style[data-precedence]'
    ), n = a.length ? a[a.length - 1] : null, u = n, i = 0; i < a.length; i++) {
      var d = a[i];
      if (d.dataset.precedence === t) u = d;
      else if (u !== n) break;
    }
    u ? u.parentNode.insertBefore(e, u.nextSibling) : (t = l.nodeType === 9 ? l.head : l, t.insertBefore(e, t.firstChild));
  }
  function nr(e, t) {
    e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.title == null && (e.title = t.title);
  }
  function ur(e, t) {
    e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.integrity == null && (e.integrity = t.integrity);
  }
  var Ts = null;
  function gm(e, t, l) {
    if (Ts === null) {
      var a = /* @__PURE__ */ new Map(), n = Ts = /* @__PURE__ */ new Map();
      n.set(l, a);
    } else
      n = Ts, a = n.get(l), a || (a = /* @__PURE__ */ new Map(), n.set(l, a));
    if (a.has(e)) return a;
    for (a.set(e, null), l = l.getElementsByTagName(e), n = 0; n < l.length; n++) {
      var u = l[n];
      if (!(u[Cn] || u[_t] || e === "link" && u.getAttribute("rel") === "stylesheet") && u.namespaceURI !== "http://www.w3.org/2000/svg") {
        var i = u.getAttribute(t) || "";
        i = e + i;
        var d = a.get(i);
        d ? d.push(u) : a.set(i, [u]);
      }
    }
    return a;
  }
  function vm(e, t, l) {
    e = e.ownerDocument || e, e.head.insertBefore(
      l,
      t === "title" ? e.querySelector("head > title") : null
    );
  }
  function Rg(e, t, l) {
    if (l === 1 || t.itemProp != null) return !1;
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
  function pm(e) {
    return !(e.type === "stylesheet" && (e.state.loading & 3) === 0);
  }
  function Ug(e, t, l, a) {
    if (l.type === "stylesheet" && (typeof a.media != "string" || matchMedia(a.media).matches !== !1) && (l.state.loading & 4) === 0) {
      if (l.instance === null) {
        var n = bn(a.href), u = t.querySelector(
          hu(n)
        );
        if (u) {
          t = u._p, t !== null && typeof t == "object" && typeof t.then == "function" && (e.count++, e = zs.bind(e), t.then(e, e)), l.state.loading |= 4, l.instance = u, gt(u);
          return;
        }
        u = t.ownerDocument || t, a = mm(a), (n = ol.get(n)) && nr(a, n), u = u.createElement("link"), gt(u);
        var i = u;
        i._p = new Promise(function(d, v) {
          i.onload = d, i.onerror = v;
        }), Mt(u, "link", a), l.instance = u;
      }
      e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(l, t), (t = l.state.preload) && (l.state.loading & 3) === 0 && (e.count++, l = zs.bind(e), t.addEventListener("load", l), t.addEventListener("error", l));
    }
  }
  var sr = 0;
  function Hg(e, t) {
    return e.stylesheets && e.count === 0 && Cs(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(l) {
      var a = setTimeout(function() {
        if (e.stylesheets && Cs(e, e.stylesheets), e.unsuspend) {
          var u = e.unsuspend;
          e.unsuspend = null, u();
        }
      }, 6e4 + t);
      0 < e.imgBytes && sr === 0 && (sr = 62500 * vg());
      var n = setTimeout(
        function() {
          if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && Cs(e, e.stylesheets), e.unsuspend)) {
            var u = e.unsuspend;
            e.unsuspend = null, u();
          }
        },
        (e.imgBytes > sr ? 50 : 800) + t
      );
      return e.unsuspend = l, function() {
        e.unsuspend = null, clearTimeout(a), clearTimeout(n);
      };
    } : null;
  }
  function zs() {
    if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
      if (this.stylesheets) Cs(this, this.stylesheets);
      else if (this.unsuspend) {
        var e = this.unsuspend;
        this.unsuspend = null, e();
      }
    }
  }
  var As = null;
  function Cs(e, t) {
    e.stylesheets = null, e.unsuspend !== null && (e.count++, As = /* @__PURE__ */ new Map(), t.forEach(Bg, e), As = null, zs.call(e));
  }
  function Bg(e, t) {
    if (!(t.state.loading & 4)) {
      var l = As.get(e);
      if (l) var a = l.get(null);
      else {
        l = /* @__PURE__ */ new Map(), As.set(e, l);
        for (var n = e.querySelectorAll(
          "link[data-precedence],style[data-precedence]"
        ), u = 0; u < n.length; u++) {
          var i = n[u];
          (i.nodeName === "LINK" || i.getAttribute("media") !== "not all") && (l.set(i.dataset.precedence, i), a = i);
        }
        a && l.set(null, a);
      }
      n = t.instance, i = n.getAttribute("data-precedence"), u = l.get(i) || a, u === a && l.set(null, n), l.set(i, n), this.count++, a = zs.bind(this), n.addEventListener("load", a), n.addEventListener("error", a), u ? u.parentNode.insertBefore(n, u.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(n, e.firstChild)), t.state.loading |= 4;
    }
  }
  var vu = {
    $$typeof: R,
    Provider: null,
    Consumer: null,
    _currentValue: ee,
    _currentValue2: ee,
    _threadCount: 0
  };
  function qg(e, t, l, a, n, u, i, d, v) {
    this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = tc(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = tc(0), this.hiddenUpdates = tc(null), this.identifierPrefix = a, this.onUncaughtError = n, this.onCaughtError = u, this.onRecoverableError = i, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = v, this.incompleteTransitions = /* @__PURE__ */ new Map();
  }
  function ym(e, t, l, a, n, u, i, d, v, M, A, O) {
    return e = new qg(
      e,
      t,
      l,
      i,
      v,
      M,
      A,
      O,
      d
    ), t = 1, u === !0 && (t |= 24), u = Vt(3, null, null, t), e.current = u, u.stateNode = e, t = kc(), t.refCount++, e.pooledCache = t, t.refCount++, u.memoizedState = {
      element: a,
      isDehydrated: l,
      cache: t
    }, Xc(u), e;
  }
  function bm(e) {
    return e ? (e = $a, e) : $a;
  }
  function xm(e, t, l, a, n, u) {
    n = bm(n), a.context === null ? a.context = n : a.pendingContext = n, a = $l(t), a.payload = { element: l }, u = u === void 0 ? null : u, u !== null && (a.callback = u), l = Fl(e, a, t), l !== null && (kt(l, e, t), Jn(l, e, t));
  }
  function _m(e, t) {
    if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
      var l = e.retryLane;
      e.retryLane = l !== 0 && l < t ? l : t;
    }
  }
  function cr(e, t) {
    _m(e, t), (e = e.alternate) && _m(e, t);
  }
  function Sm(e) {
    if (e.tag === 13 || e.tag === 31) {
      var t = Sa(e, 67108864);
      t !== null && kt(t, e, 67108864), cr(e, 67108864);
    }
  }
  function jm(e) {
    if (e.tag === 13 || e.tag === 31) {
      var t = Wt();
      t = lc(t);
      var l = Sa(e, t);
      l !== null && kt(l, e, t), cr(e, t);
    }
  }
  var Os = !0;
  function kg(e, t, l, a) {
    var n = T.T;
    T.T = null;
    var u = q.p;
    try {
      q.p = 2, ir(e, t, l, a);
    } finally {
      q.p = u, T.T = n;
    }
  }
  function Lg(e, t, l, a) {
    var n = T.T;
    T.T = null;
    var u = q.p;
    try {
      q.p = 8, ir(e, t, l, a);
    } finally {
      q.p = u, T.T = n;
    }
  }
  function ir(e, t, l, a) {
    if (Os) {
      var n = rr(a);
      if (n === null)
        Ji(
          e,
          t,
          a,
          Ds,
          l
        ), Mm(e, a);
      else if (Gg(
        n,
        e,
        t,
        l,
        a
      ))
        a.stopPropagation();
      else if (Mm(e, a), t & 4 && -1 < Yg.indexOf(e)) {
        for (; n !== null; ) {
          var u = ka(n);
          if (u !== null)
            switch (u.tag) {
              case 3:
                if (u = u.stateNode, u.current.memoizedState.isDehydrated) {
                  var i = zt(u.pendingLanes);
                  if (i !== 0) {
                    var d = u;
                    for (d.pendingLanes |= 2, d.entangledLanes |= 2; i; ) {
                      var v = 1 << 31 - Tt(i);
                      d.entanglements[1] |= v, i &= ~v;
                    }
                    xl(u), (Oe & 6) === 0 && (gs = Te() + 500, ou(0));
                  }
                }
                break;
              case 31:
              case 13:
                d = Sa(u, 2), d !== null && kt(d, u, 2), ps(), cr(u, 2);
            }
          if (u = rr(a), u === null && Ji(
            e,
            t,
            a,
            Ds,
            l
          ), u === n) break;
          n = u;
        }
        n !== null && a.stopPropagation();
      } else
        Ji(
          e,
          t,
          a,
          null,
          l
        );
    }
  }
  function rr(e) {
    return e = fc(e), or(e);
  }
  var Ds = null;
  function or(e) {
    if (Ds = null, e = qa(e), e !== null) {
      var t = h(e);
      if (t === null) e = null;
      else {
        var l = t.tag;
        if (l === 13) {
          if (e = g(t), e !== null) return e;
          e = null;
        } else if (l === 31) {
          if (e = y(t), e !== null) return e;
          e = null;
        } else if (l === 3) {
          if (t.stateNode.current.memoizedState.isDehydrated)
            return t.tag === 3 ? t.stateNode.containerInfo : null;
          e = null;
        } else t !== e && (e = null);
      }
    }
    return Ds = e, null;
  }
  function Nm(e) {
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
        switch (Fe()) {
          case bt:
            return 2;
          case dl:
            return 8;
          case Pt:
          case Sl:
            return 32;
          case xt:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var fr = !1, ia = null, ra = null, oa = null, pu = /* @__PURE__ */ new Map(), yu = /* @__PURE__ */ new Map(), fa = [], Yg = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
    " "
  );
  function Mm(e, t) {
    switch (e) {
      case "focusin":
      case "focusout":
        ia = null;
        break;
      case "dragenter":
      case "dragleave":
        ra = null;
        break;
      case "mouseover":
      case "mouseout":
        oa = null;
        break;
      case "pointerover":
      case "pointerout":
        pu.delete(t.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        yu.delete(t.pointerId);
    }
  }
  function bu(e, t, l, a, n, u) {
    return e === null || e.nativeEvent !== u ? (e = {
      blockedOn: t,
      domEventName: l,
      eventSystemFlags: a,
      nativeEvent: u,
      targetContainers: [n]
    }, t !== null && (t = ka(t), t !== null && Sm(t)), e) : (e.eventSystemFlags |= a, t = e.targetContainers, n !== null && t.indexOf(n) === -1 && t.push(n), e);
  }
  function Gg(e, t, l, a, n) {
    switch (t) {
      case "focusin":
        return ia = bu(
          ia,
          e,
          t,
          l,
          a,
          n
        ), !0;
      case "dragenter":
        return ra = bu(
          ra,
          e,
          t,
          l,
          a,
          n
        ), !0;
      case "mouseover":
        return oa = bu(
          oa,
          e,
          t,
          l,
          a,
          n
        ), !0;
      case "pointerover":
        var u = n.pointerId;
        return pu.set(
          u,
          bu(
            pu.get(u) || null,
            e,
            t,
            l,
            a,
            n
          )
        ), !0;
      case "gotpointercapture":
        return u = n.pointerId, yu.set(
          u,
          bu(
            yu.get(u) || null,
            e,
            t,
            l,
            a,
            n
          )
        ), !0;
    }
    return !1;
  }
  function wm(e) {
    var t = qa(e.target);
    if (t !== null) {
      var l = h(t);
      if (l !== null) {
        if (t = l.tag, t === 13) {
          if (t = g(l), t !== null) {
            e.blockedOn = t, qr(e.priority, function() {
              jm(l);
            });
            return;
          }
        } else if (t === 31) {
          if (t = y(l), t !== null) {
            e.blockedOn = t, qr(e.priority, function() {
              jm(l);
            });
            return;
          }
        } else if (t === 3 && l.stateNode.current.memoizedState.isDehydrated) {
          e.blockedOn = l.tag === 3 ? l.stateNode.containerInfo : null;
          return;
        }
      }
    }
    e.blockedOn = null;
  }
  function Rs(e) {
    if (e.blockedOn !== null) return !1;
    for (var t = e.targetContainers; 0 < t.length; ) {
      var l = rr(e.nativeEvent);
      if (l === null) {
        l = e.nativeEvent;
        var a = new l.constructor(
          l.type,
          l
        );
        oc = a, l.target.dispatchEvent(a), oc = null;
      } else
        return t = ka(l), t !== null && Sm(t), e.blockedOn = l, !1;
      t.shift();
    }
    return !0;
  }
  function Em(e, t, l) {
    Rs(e) && l.delete(t);
  }
  function Xg() {
    fr = !1, ia !== null && Rs(ia) && (ia = null), ra !== null && Rs(ra) && (ra = null), oa !== null && Rs(oa) && (oa = null), pu.forEach(Em), yu.forEach(Em);
  }
  function Us(e, t) {
    e.blockedOn === t && (e.blockedOn = null, fr || (fr = !0, c.unstable_scheduleCallback(
      c.unstable_NormalPriority,
      Xg
    )));
  }
  var Hs = null;
  function Tm(e) {
    Hs !== e && (Hs = e, c.unstable_scheduleCallback(
      c.unstable_NormalPriority,
      function() {
        Hs === e && (Hs = null);
        for (var t = 0; t < e.length; t += 3) {
          var l = e[t], a = e[t + 1], n = e[t + 2];
          if (typeof a != "function") {
            if (or(a || l) === null)
              continue;
            break;
          }
          var u = ka(l);
          u !== null && (e.splice(t, 3), t -= 3, ri(
            u,
            {
              pending: !0,
              data: n,
              method: l.method,
              action: a
            },
            a,
            n
          ));
        }
      }
    ));
  }
  function _n(e) {
    function t(v) {
      return Us(v, e);
    }
    ia !== null && Us(ia, e), ra !== null && Us(ra, e), oa !== null && Us(oa, e), pu.forEach(t), yu.forEach(t);
    for (var l = 0; l < fa.length; l++) {
      var a = fa[l];
      a.blockedOn === e && (a.blockedOn = null);
    }
    for (; 0 < fa.length && (l = fa[0], l.blockedOn === null); )
      wm(l), l.blockedOn === null && fa.shift();
    if (l = (e.ownerDocument || e).$$reactFormReplay, l != null)
      for (a = 0; a < l.length; a += 3) {
        var n = l[a], u = l[a + 1], i = n[Dt] || null;
        if (typeof u == "function")
          i || Tm(l);
        else if (i) {
          var d = null;
          if (u && u.hasAttribute("formAction")) {
            if (n = u, i = u[Dt] || null)
              d = i.formAction;
            else if (or(n) !== null) continue;
          } else d = i.action;
          typeof d == "function" ? l[a + 1] = d : (l.splice(a, 3), a -= 3), Tm(l);
        }
      }
  }
  function zm() {
    function e(u) {
      u.canIntercept && u.info === "react-transition" && u.intercept({
        handler: function() {
          return new Promise(function(i) {
            return n = i;
          });
        },
        focusReset: "manual",
        scroll: "manual"
      });
    }
    function t() {
      n !== null && (n(), n = null), a || setTimeout(l, 20);
    }
    function l() {
      if (!a && !navigation.transition) {
        var u = navigation.currentEntry;
        u && u.url != null && navigation.navigate(u.url, {
          state: u.getState(),
          info: "react-transition",
          history: "replace"
        });
      }
    }
    if (typeof navigation == "object") {
      var a = !1, n = null;
      return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(l, 100), function() {
        a = !0, navigation.removeEventListener("navigate", e), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), n !== null && (n(), n = null);
      };
    }
  }
  function dr(e) {
    this._internalRoot = e;
  }
  Bs.prototype.render = dr.prototype.render = function(e) {
    var t = this._internalRoot;
    if (t === null) throw Error(o(409));
    var l = t.current, a = Wt();
    xm(l, a, e, t, null, null);
  }, Bs.prototype.unmount = dr.prototype.unmount = function() {
    var e = this._internalRoot;
    if (e !== null) {
      this._internalRoot = null;
      var t = e.containerInfo;
      xm(e.current, 2, null, e, null, null), ps(), t[Ba] = null;
    }
  };
  function Bs(e) {
    this._internalRoot = e;
  }
  Bs.prototype.unstable_scheduleHydration = function(e) {
    if (e) {
      var t = Br();
      e = { blockedOn: null, target: e, priority: t };
      for (var l = 0; l < fa.length && t !== 0 && t < fa[l].priority; l++) ;
      fa.splice(l, 0, e), l === 0 && wm(e);
    }
  };
  var Am = r.version;
  if (Am !== "19.2.5")
    throw Error(
      o(
        527,
        Am,
        "19.2.5"
      )
    );
  q.findDOMNode = function(e) {
    var t = e._reactInternals;
    if (t === void 0)
      throw typeof e.render == "function" ? Error(o(188)) : (e = Object.keys(e).join(","), Error(o(268, e)));
    return e = p(t), e = e !== null ? j(e) : null, e = e === null ? null : e.stateNode, e;
  };
  var Vg = {
    bundleType: 0,
    version: "19.2.5",
    rendererPackageName: "react-dom",
    currentDispatcherRef: T,
    reconcilerVersion: "19.2.5"
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var qs = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!qs.isDisabled && qs.supportsFiber)
      try {
        Ze = qs.inject(
          Vg
        ), Ce = qs;
      } catch {
      }
  }
  return _u.createRoot = function(e, t) {
    if (!m(e)) throw Error(o(299));
    var l = !1, a = "", n = Bf, u = qf, i = kf;
    return t != null && (t.unstable_strictMode === !0 && (l = !0), t.identifierPrefix !== void 0 && (a = t.identifierPrefix), t.onUncaughtError !== void 0 && (n = t.onUncaughtError), t.onCaughtError !== void 0 && (u = t.onCaughtError), t.onRecoverableError !== void 0 && (i = t.onRecoverableError)), t = ym(
      e,
      1,
      !1,
      null,
      null,
      l,
      a,
      null,
      n,
      u,
      i,
      zm
    ), e[Ba] = t.current, Ki(e), new dr(t);
  }, _u.hydrateRoot = function(e, t, l) {
    if (!m(e)) throw Error(o(299));
    var a = !1, n = "", u = Bf, i = qf, d = kf, v = null;
    return l != null && (l.unstable_strictMode === !0 && (a = !0), l.identifierPrefix !== void 0 && (n = l.identifierPrefix), l.onUncaughtError !== void 0 && (u = l.onUncaughtError), l.onCaughtError !== void 0 && (i = l.onCaughtError), l.onRecoverableError !== void 0 && (d = l.onRecoverableError), l.formState !== void 0 && (v = l.formState)), t = ym(
      e,
      1,
      !0,
      t,
      l ?? null,
      a,
      n,
      v,
      u,
      i,
      d,
      zm
    ), t.context = bm(null), l = t.current, a = Wt(), a = lc(a), n = $l(a), n.callback = null, Fl(l, n, a), l = a, t.current.lanes = l, An(t, l), xl(t), e[Ba] = t.current, Ki(e), new Bs(t);
  }, _u.version = "19.2.5", _u;
}
var Lm;
function lv() {
  if (Lm) return hr.exports;
  Lm = 1;
  function c() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(c);
      } catch (r) {
        console.error(r);
      }
  }
  return c(), hr.exports = tv(), hr.exports;
}
var av = lv(), H = Er();
class ah {
  constructor() {
    ks(this, "_hass", null);
    ks(this, "_entityListeners", /* @__PURE__ */ new Map());
    ks(this, "_globalListeners", /* @__PURE__ */ new Set());
  }
  get hass() {
    return this._hass;
  }
  update(r) {
    this._hass = r;
    for (const f of this._entityListeners.values())
      f.forEach((o) => o());
    this._globalListeners.forEach((f) => f());
  }
  getEntity(r) {
    var f;
    return ((f = this._hass) == null ? void 0 : f.states[r]) ?? null;
  }
  subscribeEntity(r, f) {
    return this._entityListeners.has(r) || this._entityListeners.set(r, /* @__PURE__ */ new Set()), this._entityListeners.get(r).add(f), () => {
      var o;
      (o = this._entityListeners.get(r)) == null || o.delete(f);
    };
  }
  subscribeGlobal(r) {
    return this._globalListeners.add(r), () => {
      this._globalListeners.delete(r);
    };
  }
  async callService(r, f, o, m) {
    if (!this._hass) throw new Error("Not connected to Home Assistant");
    return this._hass.callService(r, f, o, m);
  }
}
const nh = H.createContext(new ah());
function Js() {
  return H.useContext(nh);
}
function nv({ children: c }) {
  const r = H.useRef(new ah());
  return H.useEffect(() => {
    const f = () => {
      const o = window.__HASS__;
      o && r.current.update(o);
    };
    return window.addEventListener("hass-updated", f), f(), () => window.removeEventListener("hass-updated", f);
  }, []), /* @__PURE__ */ s.jsx(nh.Provider, { value: r.current, children: c });
}
function Ua(c, r = 24) {
  const f = Js(), [o, m] = H.useState([]), [h, g] = H.useState(!1), y = H.useRef(null), _ = H.useRef(0), p = H.useCallback(() => {
    if (!c) return;
    const j = f.getEntity(c);
    if (!j) return;
    const z = j.state, B = parseFloat(z);
    if (!Number.isFinite(B)) return;
    const U = new Date(j.last_updated || j.last_changed).getTime();
    !Number.isFinite(U) || U <= _.current || (_.current = U, m((L) => [...L, { t: U, v: B }]));
  }, [c, f]);
  return H.useEffect(() => {
    var R, te, de;
    if (!c) {
      m([]);
      return;
    }
    const j = f.hass;
    if (!j) return;
    (R = y.current) == null || R.abort();
    const z = new AbortController();
    y.current = z, g(!0);
    const B = /* @__PURE__ */ new Date(), L = new Date(B.getTime() - r * 36e5).toISOString(), X = B.toISOString(), F = `${window.__HA_BASE_URL__ || ""}/api/history/period/${L}?end_time=${X}&filter_entity_id=${encodeURIComponent(c)}&minimal_response&no_attributes`, fe = (de = (te = j.auth) == null ? void 0 : te.data) == null ? void 0 : de.access_token;
    return fetch(F, {
      headers: { Authorization: `Bearer ${fe}`, "Content-Type": "application/json" },
      signal: z.signal
    }).then((I) => {
      if (!I.ok) throw new Error(`HTTP ${I.status}`);
      return I.json();
    }).then((I) => {
      if (z.signal.aborted) return;
      const J = [], De = (I == null ? void 0 : I[0]) ?? [];
      for (const we of De) {
        const nt = parseFloat(we.state ?? we.s);
        if (!Number.isFinite(nt)) continue;
        const Re = new Date(we.last_changed ?? we.lu * 1e3).getTime();
        Number.isFinite(Re) && J.push({ t: Re, v: nt });
      }
      m(J), _.current = J.length > 0 ? J[J.length - 1].t : 0;
    }).catch((I) => {
      I.name !== "AbortError" && console.error("[useHistory]", I);
    }).finally(() => {
      z.signal.aborted || g(!1);
    }), () => z.abort();
  }, [c, r, f]), H.useEffect(() => {
    if (c)
      return f.subscribeEntity(c, p);
  }, [c, f, p]), { data: o, loading: h };
}
function pe(c) {
  const r = Js(), f = H.useCallback(
    (m) => r.subscribeEntity(c, m),
    [r, c]
  ), o = H.useCallback(
    () => r.getEntity(c),
    [r, c]
  );
  return H.useSyncExternalStore(f, o);
}
function V(c) {
  const r = pe(c), f = r == null ? void 0 : r.state;
  if (f === void 0 || f === "unknown" || f === "unavailable")
    return { value: null, entity: r };
  const o = Number(f);
  return { value: Number.isFinite(o) ? o : null, entity: r };
}
function uh(c) {
  var r, f, o = "";
  if (typeof c == "string" || typeof c == "number") o += c;
  else if (typeof c == "object") if (Array.isArray(c)) {
    var m = c.length;
    for (r = 0; r < m; r++) c[r] && (f = uh(c[r])) && (o && (o += " "), o += f);
  } else for (f in c) c[f] && (o && (o += " "), o += f);
  return o;
}
function sh() {
  for (var c, r, f = 0, o = "", m = arguments.length; f < m; f++) (c = arguments[f]) && (r = uh(c)) && (o && (o += " "), o += r);
  return o;
}
const Tr = "-", uv = (c) => {
  const r = cv(c), {
    conflictingClassGroups: f,
    conflictingClassGroupModifiers: o
  } = c;
  return {
    getClassGroupId: (g) => {
      const y = g.split(Tr);
      return y[0] === "" && y.length !== 1 && y.shift(), ch(y, r) || sv(g);
    },
    getConflictingClassGroupIds: (g, y) => {
      const _ = f[g] || [];
      return y && o[g] ? [..._, ...o[g]] : _;
    }
  };
}, ch = (c, r) => {
  var g;
  if (c.length === 0)
    return r.classGroupId;
  const f = c[0], o = r.nextPart.get(f), m = o ? ch(c.slice(1), o) : void 0;
  if (m)
    return m;
  if (r.validators.length === 0)
    return;
  const h = c.join(Tr);
  return (g = r.validators.find(({
    validator: y
  }) => y(h))) == null ? void 0 : g.classGroupId;
}, Ym = /^\[(.+)\]$/, sv = (c) => {
  if (Ym.test(c)) {
    const r = Ym.exec(c)[1], f = r == null ? void 0 : r.substring(0, r.indexOf(":"));
    if (f)
      return "arbitrary.." + f;
  }
}, cv = (c) => {
  const {
    theme: r,
    prefix: f
  } = c, o = {
    nextPart: /* @__PURE__ */ new Map(),
    validators: []
  };
  return rv(Object.entries(c.classGroups), f).forEach(([h, g]) => {
    jr(g, o, h, r);
  }), o;
}, jr = (c, r, f, o) => {
  c.forEach((m) => {
    if (typeof m == "string") {
      const h = m === "" ? r : Gm(r, m);
      h.classGroupId = f;
      return;
    }
    if (typeof m == "function") {
      if (iv(m)) {
        jr(m(o), r, f, o);
        return;
      }
      r.validators.push({
        validator: m,
        classGroupId: f
      });
      return;
    }
    Object.entries(m).forEach(([h, g]) => {
      jr(g, Gm(r, h), f, o);
    });
  });
}, Gm = (c, r) => {
  let f = c;
  return r.split(Tr).forEach((o) => {
    f.nextPart.has(o) || f.nextPart.set(o, {
      nextPart: /* @__PURE__ */ new Map(),
      validators: []
    }), f = f.nextPart.get(o);
  }), f;
}, iv = (c) => c.isThemeGetter, rv = (c, r) => r ? c.map(([f, o]) => {
  const m = o.map((h) => typeof h == "string" ? r + h : typeof h == "object" ? Object.fromEntries(Object.entries(h).map(([g, y]) => [r + g, y])) : h);
  return [f, m];
}) : c, ov = (c) => {
  if (c < 1)
    return {
      get: () => {
      },
      set: () => {
      }
    };
  let r = 0, f = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  const m = (h, g) => {
    f.set(h, g), r++, r > c && (r = 0, o = f, f = /* @__PURE__ */ new Map());
  };
  return {
    get(h) {
      let g = f.get(h);
      if (g !== void 0)
        return g;
      if ((g = o.get(h)) !== void 0)
        return m(h, g), g;
    },
    set(h, g) {
      f.has(h) ? f.set(h, g) : m(h, g);
    }
  };
}, ih = "!", fv = (c) => {
  const {
    separator: r,
    experimentalParseClassName: f
  } = c, o = r.length === 1, m = r[0], h = r.length, g = (y) => {
    const _ = [];
    let p = 0, j = 0, z;
    for (let Z = 0; Z < y.length; Z++) {
      let F = y[Z];
      if (p === 0) {
        if (F === m && (o || y.slice(Z, Z + h) === r)) {
          _.push(y.slice(j, Z)), j = Z + h;
          continue;
        }
        if (F === "/") {
          z = Z;
          continue;
        }
      }
      F === "[" ? p++ : F === "]" && p--;
    }
    const B = _.length === 0 ? y : y.substring(j), U = B.startsWith(ih), L = U ? B.substring(1) : B, X = z && z > j ? z - j : void 0;
    return {
      modifiers: _,
      hasImportantModifier: U,
      baseClassName: L,
      maybePostfixModifierPosition: X
    };
  };
  return f ? (y) => f({
    className: y,
    parseClassName: g
  }) : g;
}, dv = (c) => {
  if (c.length <= 1)
    return c;
  const r = [];
  let f = [];
  return c.forEach((o) => {
    o[0] === "[" ? (r.push(...f.sort(), o), f = []) : f.push(o);
  }), r.push(...f.sort()), r;
}, mv = (c) => ({
  cache: ov(c.cacheSize),
  parseClassName: fv(c),
  ...uv(c)
}), hv = /\s+/, gv = (c, r) => {
  const {
    parseClassName: f,
    getClassGroupId: o,
    getConflictingClassGroupIds: m
  } = r, h = [], g = c.trim().split(hv);
  let y = "";
  for (let _ = g.length - 1; _ >= 0; _ -= 1) {
    const p = g[_], {
      modifiers: j,
      hasImportantModifier: z,
      baseClassName: B,
      maybePostfixModifierPosition: U
    } = f(p);
    let L = !!U, X = o(L ? B.substring(0, U) : B);
    if (!X) {
      if (!L) {
        y = p + (y.length > 0 ? " " + y : y);
        continue;
      }
      if (X = o(B), !X) {
        y = p + (y.length > 0 ? " " + y : y);
        continue;
      }
      L = !1;
    }
    const Z = dv(j).join(":"), F = z ? Z + ih : Z, fe = F + X;
    if (h.includes(fe))
      continue;
    h.push(fe);
    const R = m(X, L);
    for (let te = 0; te < R.length; ++te) {
      const de = R[te];
      h.push(F + de);
    }
    y = p + (y.length > 0 ? " " + y : y);
  }
  return y;
};
function vv() {
  let c = 0, r, f, o = "";
  for (; c < arguments.length; )
    (r = arguments[c++]) && (f = rh(r)) && (o && (o += " "), o += f);
  return o;
}
const rh = (c) => {
  if (typeof c == "string")
    return c;
  let r, f = "";
  for (let o = 0; o < c.length; o++)
    c[o] && (r = rh(c[o])) && (f && (f += " "), f += r);
  return f;
};
function pv(c, ...r) {
  let f, o, m, h = g;
  function g(_) {
    const p = r.reduce((j, z) => z(j), c());
    return f = mv(p), o = f.cache.get, m = f.cache.set, h = y, y(_);
  }
  function y(_) {
    const p = o(_);
    if (p)
      return p;
    const j = gv(_, f);
    return m(_, j), j;
  }
  return function() {
    return h(vv.apply(null, arguments));
  };
}
const $e = (c) => {
  const r = (f) => f[c] || [];
  return r.isThemeGetter = !0, r;
}, oh = /^\[(?:([a-z-]+):)?(.+)\]$/i, yv = /^\d+\/\d+$/, bv = /* @__PURE__ */ new Set(["px", "full", "screen"]), xv = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, _v = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, Sv = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, jv = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, Nv = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, Yl = (c) => Sn(c) || bv.has(c) || yv.test(c), ma = (c) => jn(c, "length", Ov), Sn = (c) => !!c && !Number.isNaN(Number(c)), br = (c) => jn(c, "number", Sn), Su = (c) => !!c && Number.isInteger(Number(c)), Mv = (c) => c.endsWith("%") && Sn(c.slice(0, -1)), ve = (c) => oh.test(c), ha = (c) => xv.test(c), wv = /* @__PURE__ */ new Set(["length", "size", "percentage"]), Ev = (c) => jn(c, wv, fh), Tv = (c) => jn(c, "position", fh), zv = /* @__PURE__ */ new Set(["image", "url"]), Av = (c) => jn(c, zv, Rv), Cv = (c) => jn(c, "", Dv), ju = () => !0, jn = (c, r, f) => {
  const o = oh.exec(c);
  return o ? o[1] ? typeof r == "string" ? o[1] === r : r.has(o[1]) : f(o[2]) : !1;
}, Ov = (c) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  _v.test(c) && !Sv.test(c)
), fh = () => !1, Dv = (c) => jv.test(c), Rv = (c) => Nv.test(c), Uv = () => {
  const c = $e("colors"), r = $e("spacing"), f = $e("blur"), o = $e("brightness"), m = $e("borderColor"), h = $e("borderRadius"), g = $e("borderSpacing"), y = $e("borderWidth"), _ = $e("contrast"), p = $e("grayscale"), j = $e("hueRotate"), z = $e("invert"), B = $e("gap"), U = $e("gradientColorStops"), L = $e("gradientColorStopPositions"), X = $e("inset"), Z = $e("margin"), F = $e("opacity"), fe = $e("padding"), R = $e("saturate"), te = $e("scale"), de = $e("sepia"), I = $e("skew"), J = $e("space"), De = $e("translate"), we = () => ["auto", "contain", "none"], nt = () => ["auto", "hidden", "clip", "visible", "scroll"], Re = () => ["auto", ve, r], le = () => [ve, r], dt = () => ["", Yl, ma], tt = () => ["auto", Sn, ve], mt = () => ["bottom", "center", "left", "left-bottom", "left-top", "right", "right-bottom", "right-top", "top"], T = () => ["solid", "dashed", "dotted", "double", "none"], q = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], ee = () => ["start", "end", "center", "between", "around", "evenly", "stretch"], W = () => ["", "0", ve], ce = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], b = () => [Sn, ve];
  return {
    cacheSize: 500,
    separator: ":",
    theme: {
      colors: [ju],
      spacing: [Yl, ma],
      blur: ["none", "", ha, ve],
      brightness: b(),
      borderColor: [c],
      borderRadius: ["none", "", "full", ha, ve],
      borderSpacing: le(),
      borderWidth: dt(),
      contrast: b(),
      grayscale: W(),
      hueRotate: b(),
      invert: W(),
      gap: le(),
      gradientColorStops: [c],
      gradientColorStopPositions: [Mv, ma],
      inset: Re(),
      margin: Re(),
      opacity: b(),
      padding: le(),
      saturate: b(),
      scale: b(),
      sepia: W(),
      skew: b(),
      space: le(),
      translate: le()
    },
    classGroups: {
      // Layout
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", "video", ve]
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
        columns: [ha]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": ce()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": ce()
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
        object: [...mt(), ve]
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: nt()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": nt()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": nt()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: we()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": we()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": we()
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
        inset: [X]
      }],
      /**
       * Right / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": [X]
      }],
      /**
       * Top / Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": [X]
      }],
      /**
       * Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      start: [{
        start: [X]
      }],
      /**
       * End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      end: [{
        end: [X]
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: [X]
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: [X]
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: [X]
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: [X]
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
        z: ["auto", Su, ve]
      }],
      // Flexbox and Grid
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: Re()
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
        flex: ["1", "auto", "initial", "none", ve]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: W()
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: W()
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: ["first", "last", "none", Su, ve]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": [ju]
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: ["auto", {
          span: ["full", Su, ve]
        }, ve]
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": tt()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": tt()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": [ju]
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: ["auto", {
          span: [Su, ve]
        }, ve]
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": tt()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": tt()
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
        "auto-cols": ["auto", "min", "max", "fr", ve]
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": ["auto", "min", "max", "fr", ve]
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: [B]
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": [B]
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": [B]
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
        p: [fe]
      }],
      /**
       * Padding X
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: [fe]
      }],
      /**
       * Padding Y
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: [fe]
      }],
      /**
       * Padding Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: [fe]
      }],
      /**
       * Padding End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: [fe]
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: [fe]
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: [fe]
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: [fe]
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: [fe]
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: [Z]
      }],
      /**
       * Margin X
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: [Z]
      }],
      /**
       * Margin Y
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: [Z]
      }],
      /**
       * Margin Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: [Z]
      }],
      /**
       * Margin End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: [Z]
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: [Z]
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: [Z]
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: [Z]
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: [Z]
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/space
       */
      "space-x": [{
        "space-x": [J]
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
        "space-y": [J]
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
        w: ["auto", "min", "max", "fit", "svw", "lvw", "dvw", ve, r]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [ve, r, "min", "max", "fit"]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [ve, r, "none", "full", "min", "max", "fit", "prose", {
          screen: [ha]
        }, ha]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: [ve, r, "auto", "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": [ve, r, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": [ve, r, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Size
       * @see https://tailwindcss.com/docs/size
       */
      size: [{
        size: [ve, r, "auto", "min", "max", "fit"]
      }],
      // Typography
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", ha, ma]
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
        font: ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black", br]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [ju]
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
        tracking: ["tighter", "tight", "normal", "wide", "wider", "widest", ve]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": ["none", Sn, br]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: ["none", "tight", "snug", "normal", "relaxed", "loose", Yl, ve]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", ve]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["none", "disc", "decimal", ve]
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
        placeholder: [c]
      }],
      /**
       * Placeholder Opacity
       * @see https://tailwindcss.com/docs/placeholder-opacity
       */
      "placeholder-opacity": [{
        "placeholder-opacity": [F]
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
        text: [c]
      }],
      /**
       * Text Opacity
       * @see https://tailwindcss.com/docs/text-opacity
       */
      "text-opacity": [{
        "text-opacity": [F]
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
        decoration: [...T(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: ["auto", "from-font", Yl, ma]
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": ["auto", Yl, ve]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: [c]
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
        indent: le()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", ve]
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
        content: ["none", ve]
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
        "bg-opacity": [F]
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
        bg: [...mt(), Tv]
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
        bg: ["auto", "cover", "contain", Ev]
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          "gradient-to": ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
        }, Av]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: [c]
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: [L]
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: [L]
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: [L]
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: [U]
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: [U]
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: [U]
      }],
      // Borders
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: [h]
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": [h]
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": [h]
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": [h]
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": [h]
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": [h]
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": [h]
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": [h]
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": [h]
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": [h]
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": [h]
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": [h]
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": [h]
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": [h]
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": [h]
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: [y]
      }],
      /**
       * Border Width X
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": [y]
      }],
      /**
       * Border Width Y
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": [y]
      }],
      /**
       * Border Width Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": [y]
      }],
      /**
       * Border Width End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": [y]
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": [y]
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": [y]
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": [y]
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": [y]
      }],
      /**
       * Border Opacity
       * @see https://tailwindcss.com/docs/border-opacity
       */
      "border-opacity": [{
        "border-opacity": [F]
      }],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [...T(), "hidden"]
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/divide-width
       */
      "divide-x": [{
        "divide-x": [y]
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
        "divide-y": [y]
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
        "divide-opacity": [F]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/divide-style
       */
      "divide-style": [{
        divide: T()
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: [m]
      }],
      /**
       * Border Color X
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": [m]
      }],
      /**
       * Border Color Y
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": [m]
      }],
      /**
       * Border Color S
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": [m]
      }],
      /**
       * Border Color E
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": [m]
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": [m]
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": [m]
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": [m]
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": [m]
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: [m]
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: ["", ...T()]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [Yl, ve]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: [Yl, ma]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: [c]
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/ring-width
       */
      "ring-w": [{
        ring: dt()
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
        ring: [c]
      }],
      /**
       * Ring Opacity
       * @see https://tailwindcss.com/docs/ring-opacity
       */
      "ring-opacity": [{
        "ring-opacity": [F]
      }],
      /**
       * Ring Offset Width
       * @see https://tailwindcss.com/docs/ring-offset-width
       */
      "ring-offset-w": [{
        "ring-offset": [Yl, ma]
      }],
      /**
       * Ring Offset Color
       * @see https://tailwindcss.com/docs/ring-offset-color
       */
      "ring-offset-color": [{
        "ring-offset": [c]
      }],
      // Effects
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: ["", "inner", "none", ha, Cv]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow-color
       */
      "shadow-color": [{
        shadow: [ju]
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [F]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...q(), "plus-lighter", "plus-darker"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": q()
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
        blur: [f]
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [o]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [_]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      "drop-shadow": [{
        "drop-shadow": ["", "none", ha, ve]
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: [p]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [j]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: [z]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [R]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: [de]
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
        "backdrop-blur": [f]
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [o]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [_]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": [p]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [j]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": [z]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [F]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [R]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": [de]
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
        "border-spacing": [g]
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": [g]
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": [g]
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
        transition: ["none", "all", "", "colors", "opacity", "shadow", "transform", ve]
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
        ease: ["linear", "in", "out", "in-out", ve]
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
        animate: ["none", "spin", "ping", "pulse", "bounce", ve]
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
        scale: [te]
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": [te]
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": [te]
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: [Su, ve]
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": [De]
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": [De]
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": [I]
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": [I]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: ["center", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left", ve]
      }],
      // Interactivity
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: ["auto", c]
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
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", ve]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      "caret-color": [{
        caret: [c]
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
        "scroll-m": le()
      }],
      /**
       * Scroll Margin X
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": le()
      }],
      /**
       * Scroll Margin Y
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": le()
      }],
      /**
       * Scroll Margin Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": le()
      }],
      /**
       * Scroll Margin End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": le()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": le()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": le()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": le()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": le()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": le()
      }],
      /**
       * Scroll Padding X
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": le()
      }],
      /**
       * Scroll Padding Y
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": le()
      }],
      /**
       * Scroll Padding Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": le()
      }],
      /**
       * Scroll Padding End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": le()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": le()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": le()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": le()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": le()
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
        "will-change": ["auto", "scroll", "contents", "transform", ve]
      }],
      // SVG
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: [c, "none"]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [Yl, ma, br]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: [c, "none"]
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
}, Hv = /* @__PURE__ */ pv(Uv);
function se(...c) {
  return Hv(sh(c));
}
function G(c, r = 1) {
  return c != null && Number.isFinite(c) ? c.toFixed(r) : "—";
}
function dh(c) {
  if (!c) return "";
  const r = Date.now() - new Date(c).getTime();
  if (r < 0) return "just now";
  const f = Math.floor(r / 1e3);
  if (f < 10) return "just now";
  if (f < 60) return `${f}s ago`;
  const o = Math.floor(f / 60);
  if (o < 60) return `${o}m ago`;
  const m = Math.floor(o / 60);
  return m < 24 ? `${m}h ago` : `${Math.floor(m / 24)}d ago`;
}
function Bv(c, r, f, o = 8700) {
  if (c == null || r == null || f == null || Math.abs(c) < 0.5 || !Number.isFinite(r) || !Number.isFinite(f)) return "";
  const m = c > 0 ? (o - f) / Math.abs(r) : f / Math.abs(r);
  if (!Number.isFinite(m) || m > 48) return "";
  const h = Math.floor(m), g = Math.round((m - h) * 60);
  return c > 0 ? `${h}h ${g}m to full` : `${h}h ${g}m left`;
}
function Nn({
  data: c,
  width: r = 80,
  height: f = 24,
  color: o = "currentColor",
  className: m,
  onClick: h
}) {
  const g = H.useMemo(() => {
    if (c.length < 2) return "";
    const y = c[0].t, p = c[c.length - 1].t - y || 1;
    let j = 1 / 0, z = -1 / 0;
    for (const Z of c)
      Z.v < j && (j = Z.v), Z.v > z && (z = Z.v);
    const B = z - j || 1, U = 1, L = r - U * 2, X = f - U * 2;
    return c.map((Z, F) => {
      const fe = U + (Z.t - y) / p * L, R = U + X - (Z.v - j) / B * X;
      return `${F === 0 ? "M" : "L"}${fe.toFixed(1)},${R.toFixed(1)}`;
    }).join(" ");
  }, [c, r, f]);
  return c.length < 2 ? null : /* @__PURE__ */ s.jsx(
    "svg",
    {
      width: r,
      height: f,
      viewBox: `0 0 ${r} ${f}`,
      className: se("shrink-0", h && "cursor-pointer hover:opacity-80", m),
      onClick: h,
      children: /* @__PURE__ */ s.jsx("path", { d: g, fill: "none", stroke: o, strokeWidth: 1.5, strokeLinejoin: "round" })
    }
  );
}
function qv(c) {
  return new Date(c).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function kv(c) {
  return new Date(c).toLocaleDateString([], { month: "short", day: "numeric" });
}
function Lv(c, r) {
  const f = c / r, o = Math.pow(10, Math.floor(Math.log10(f))), m = f / o;
  return m <= 1.5 ? o : m <= 3 ? 2 * o : m <= 7 ? 5 * o : 10 * o;
}
function Yv({ data: c, width: r = 600, height: f = 250, color: o = "#3b82f6", unit: m = "" }) {
  const [h, g] = H.useState(null), y = H.useRef(null), [_, p] = H.useState(null), j = H.useRef(null), z = H.useCallback((k) => {
    j.current = k, p(k);
  }, []), B = H.useRef(!1), U = H.useRef(!1), L = H.useRef(0), X = H.useRef(null), Z = H.useRef({ data: c, width: r });
  Z.current = { data: c, width: r };
  const F = c.length > 0 ? `${c[0].t}-${c[c.length - 1].t}` : "", fe = H.useRef(F);
  F !== fe.current && (fe.current = F, _ && z(null));
  const R = H.useMemo(() => {
    if (!_ || c.length < 2) return c;
    const [k, ne] = _;
    return c.filter((ye) => ye.t >= k && ye.t <= ne);
  }, [c, _]);
  H.useEffect(() => {
    const k = y.current;
    if (!k) return;
    const ne = { left: 48, right: 12 }, ye = (P) => {
      const Ye = k.getBoundingClientRect();
      return (P - Ye.left) * (Z.current.width / Ye.width);
    }, Me = (P) => {
      const Ye = Z.current.width;
      return Math.max(0, Math.min(1, (P - ne.left) / (Ye - ne.left - ne.right)));
    }, pt = (P, Ye) => {
      const { data: Et, width: Lt } = Z.current, Te = j.current;
      if (Et.length < 2) return;
      const Fe = Et[0].t, bt = Et[Et.length - 1].t, dl = Te ? Te[0] : Fe, Sl = (Te ? Te[1] : bt) - dl, xt = Sl * P, Yt = (bt - Fe) * 5e-3;
      if (xt < Yt) return;
      if (xt >= bt - Fe) {
        z(null);
        return;
      }
      const be = dl + Ye * Sl;
      let Ze = be - Ye * xt, Ce = be + (1 - Ye) * xt;
      Ze < Fe && (Ce += Fe - Ze, Ze = Fe), Ce > bt && (Ze -= Ce - bt, Ce = bt), Ze = Math.max(Ze, Fe), Ce = Math.min(Ce, bt), z([Ze, Ce]);
    }, Le = (P) => {
      const { data: Ye } = Z.current;
      if (Ye.length < 2) return;
      P.preventDefault();
      const Et = Me(ye(P.clientX)), Lt = P.deltaY > 0 ? 1.3 : 1 / 1.3;
      pt(Lt, Et);
    };
    let Ee = "idle", Qe = 0, Ke = null, ct = null;
    const Ot = (P, Ye, Et, Lt) => Math.sqrt((Et - P) ** 2 + (Lt - Ye) ** 2), Ft = (P) => {
      const { data: Ye } = Z.current;
      Ye.length < 2 || (P.preventDefault(), P.touches.length >= 2 ? (Ee = "pinch", Ke = { x: P.touches[0].clientX, y: P.touches[0].clientY }, ct = { x: P.touches[1].clientX, y: P.touches[1].clientY }) : P.touches.length === 1 && (Ee = "pan", Qe = ye(P.touches[0].clientX)));
    }, It = (P) => {
      const { data: Ye, width: Et } = Z.current, Lt = j.current;
      if (Ye.length < 2) return;
      P.preventDefault();
      const Te = Ye[0].t, Fe = Ye[Ye.length - 1].t, bt = Lt ? Lt[0] : Te, dl = Lt ? Lt[1] : Fe, Pt = dl - bt, Sl = Et - ne.left - ne.right;
      if (P.touches.length >= 2) {
        if (Ee !== "pinch" || !Ke || !ct) {
          Ee = "pinch", Ke = { x: P.touches[0].clientX, y: P.touches[0].clientY }, ct = { x: P.touches[1].clientX, y: P.touches[1].clientY };
          return;
        }
        const xt = { x: P.touches[0].clientX, y: P.touches[0].clientY }, Yt = { x: P.touches[1].clientX, y: P.touches[1].clientY }, be = Ot(Ke.x, Ke.y, ct.x, ct.y), Ze = Ot(xt.x, xt.y, Yt.x, Yt.y);
        if (be > 10 && Ze > 10) {
          const Ce = be / Ze, Gt = Pt * Ce, Tt = (Fe - Te) * 5e-3, ec = (Ke.x + ct.x) / 2, wu = (xt.x + Yt.x) / 2, En = Me(ye(wu)), va = -((ye(wu) - ye(ec)) / Sl) * Pt;
          if (Gt >= Fe - Te)
            z(null);
          else if (Gt >= Tt) {
            const pa = bt + En * Pt;
            let zt = pa - En * Gt + va, el = pa + (1 - En) * Gt + va;
            zt < Te && (el += Te - zt, zt = Te), el > Fe && (zt -= el - Fe, el = Fe), zt = Math.max(zt, Te), el = Math.min(el, Fe), z([zt, el]);
          }
        }
        Ke = xt, ct = Yt;
      } else if (P.touches.length === 1) {
        if (Ee === "pinch") {
          Ee = "pan", Qe = ye(P.touches[0].clientX), Ke = null, ct = null;
          return;
        }
        const xt = ye(P.touches[0].clientX), Yt = xt - Qe;
        if (Math.abs(Yt) > 1) {
          const be = -(Yt / Sl) * Pt;
          let Ze = bt + be, Ce = dl + be;
          Ze < Te && (Ce += Te - Ze, Ze = Te), Ce > Fe && (Ze -= Ce - Fe, Ce = Fe), Ze = Math.max(Ze, Te), Ce = Math.min(Ce, Fe), z([Ze, Ce]), Qe = xt;
        }
      }
    }, yt = (P) => {
      P.touches.length === 0 ? (Ee = "idle", Ke = null, ct = null) : P.touches.length === 1 && Ee === "pinch" ? (Ee = "pan", Qe = ye(P.touches[0].clientX), Ke = null, ct = null) : P.touches.length >= 2 && Ee !== "pinch" && (Ee = "pinch", Ke = { x: P.touches[0].clientX, y: P.touches[0].clientY }, ct = { x: P.touches[1].clientX, y: P.touches[1].clientY });
    };
    return k.addEventListener("wheel", Le, { passive: !1 }), k.addEventListener("touchstart", Ft, { passive: !1 }), k.addEventListener("touchmove", It, { passive: !1 }), k.addEventListener("touchend", yt), () => {
      k.removeEventListener("wheel", Le), k.removeEventListener("touchstart", Ft), k.removeEventListener("touchmove", It), k.removeEventListener("touchend", yt);
    };
  }, []);
  const te = H.useMemo(() => {
    if (R.length < 2) return null;
    const k = { top: 12, right: 12, bottom: 32, left: 48 }, ne = r - k.left - k.right, ye = f - k.top - k.bottom, Me = R[0].t, Le = R[R.length - 1].t - Me || 1;
    let Ee = 1 / 0, Qe = -1 / 0;
    for (const be of R)
      be.v < Ee && (Ee = be.v), be.v > Qe && (Qe = be.v);
    const Ke = (Qe - Ee) * 0.05 || 1;
    Ee -= Ke, Qe += Ke;
    const ct = Qe - Ee, Ot = (be) => k.left + (be - Me) / Le * ne, Ft = (be) => k.top + ye - (be - Ee) / ct * ye, It = (be) => Me + (be - k.left) / ne * Le, yt = R.map((be, Ze) => `${Ze === 0 ? "M" : "L"}${Ot(be.t).toFixed(1)},${Ft(be.v).toFixed(1)}`).join(" "), P = yt + ` L${Ot(R[R.length - 1].t).toFixed(1)},${(k.top + ye).toFixed(1)} L${Ot(R[0].t).toFixed(1)},${(k.top + ye).toFixed(1)} Z`, Ye = Lv(ct, 5), Et = [], Lt = Math.ceil(Ee / Ye) * Ye;
    for (let be = Lt; be <= Qe; be += Ye) Et.push(be);
    const Te = Le > 864e5, Fe = Math.min(6, Math.floor(ne / 80)), bt = [];
    for (let be = 0; be <= Fe; be++)
      bt.push(Me + Le * be / Fe);
    let dl = 0;
    for (const be of R) dl += be.v;
    const Pt = dl / R.length, Sl = Math.min(...R.map((be) => be.v)), xt = Math.max(...R.map((be) => be.v)), Yt = R[R.length - 1].v;
    return { margin: k, w: ne, h: ye, linePath: yt, areaPath: P, toX: Ot, toY: Ft, fromX: It, yTicks: Et, xTicks: bt, showDates: Te, minV: Ee, maxV: Qe, stats: { avg: Pt, min: Sl, max: xt, current: Yt } };
  }, [R, r, f]), de = H.useCallback(
    (k) => {
      if (!y.current || !X.current || c.length < 2) return;
      const ne = y.current.getBoundingClientRect(), ye = r / ne.width, pt = (k - ne.left) * ye - L.current;
      if (Math.abs(pt) > 3 && !U.current && (U.current = !0, g(null)), U.current) {
        const Le = { left: 48, right: 12 }, Ee = r - Le.left - Le.right, [Qe, Ke] = X.current, ct = Ke - Qe, Ot = -(pt / Ee) * ct, Ft = c[0].t, It = c[c.length - 1].t;
        let yt = Qe + Ot, P = Ke + Ot;
        yt < Ft && (P += Ft - yt, yt = Ft), P > It && (yt -= P - It, P = It), yt = Math.max(yt, Ft), P = Math.min(P, It), z([yt, P]);
      }
    },
    [c, r, z]
  ), I = H.useCallback(
    (k) => {
      if (!te || !y.current || B.current) return;
      const ne = y.current.getBoundingClientRect(), ye = r / ne.width, Me = (k.clientX - ne.left) * ye, pt = te.fromX(Me);
      let Le = 0, Ee = R.length - 1;
      for (; Le < Ee; ) {
        const Qe = Le + Ee >> 1;
        R[Qe].t < pt ? Le = Qe + 1 : Ee = Qe;
      }
      Le > 0 && Math.abs(R[Le - 1].t - pt) < Math.abs(R[Le].t - pt) && Le--, g(Le);
    },
    [te, R, r]
  ), J = H.useRef(null), De = H.useRef(null), we = H.useCallback(() => {
    J.current && window.removeEventListener("mousemove", J.current), De.current && window.removeEventListener("mouseup", De.current), J.current = null, De.current = null;
  }, []), nt = H.useCallback(
    (k) => {
      if (!y.current || c.length < 2) return;
      B.current = !0, U.current = !1;
      const ne = y.current.getBoundingClientRect(), ye = r / ne.width;
      L.current = (k.clientX - ne.left) * ye;
      const Me = c[0].t, pt = c[c.length - 1].t;
      X.current = j.current ?? [Me, pt], we();
      const Le = (Qe) => {
        Qe.preventDefault(), de(Qe.clientX);
      }, Ee = () => {
        B.current = !1, we();
      };
      J.current = Le, De.current = Ee, window.addEventListener("mousemove", Le), window.addEventListener("mouseup", Ee);
    },
    [c, _, r, de, we]
  );
  H.useEffect(() => () => we(), [we]);
  const Re = H.useCallback(() => {
    B.current || g(null);
  }, []);
  if (!te)
    return /* @__PURE__ */ s.jsx("div", { className: "flex items-center justify-center h-full text-muted-foreground text-sm", children: "No data" });
  const { margin: le, h: dt, linePath: tt, areaPath: mt, toX: T, toY: q, yTicks: ee, xTicks: W, showDates: ce, stats: b } = te, D = Math.abs(b.max - b.min) < 10 ? 1 : 0, Y = (k) => k.toFixed(D), Q = h != null ? R[h] : null, ie = _ != null;
  return /* @__PURE__ */ s.jsxs("div", { children: [
    /* @__PURE__ */ s.jsx("div", { className: "flex items-center justify-end mb-1 min-h-[1.5rem]", children: ie && /* @__PURE__ */ s.jsx(
      "button",
      {
        onClick: () => z(null),
        className: "text-[10px] text-muted-foreground hover:text-foreground px-2 py-0.5 rounded bg-muted",
        children: "Reset Zoom"
      }
    ) }),
    /* @__PURE__ */ s.jsxs(
      "svg",
      {
        ref: y,
        width: r,
        height: f,
        className: se("w-full select-none", ie ? "cursor-grab active:cursor-grabbing" : ""),
        viewBox: `0 0 ${r} ${f}`,
        style: { touchAction: "none", cursor: ie ? void 0 : "crosshair" },
        onMouseMove: I,
        onMouseDown: nt,
        onMouseLeave: Re,
        children: [
          ee.map((k) => /* @__PURE__ */ s.jsxs("g", { children: [
            /* @__PURE__ */ s.jsx(
              "line",
              {
                x1: le.left,
                y1: q(k),
                x2: r - le.right,
                y2: q(k),
                stroke: "currentColor",
                className: "text-border",
                strokeWidth: 0.5
              }
            ),
            /* @__PURE__ */ s.jsx(
              "text",
              {
                x: le.left - 6,
                y: q(k) + 4,
                textAnchor: "end",
                className: "fill-muted-foreground",
                fontSize: 10,
                children: Y(k)
              }
            )
          ] }, k)),
          W.map((k) => /* @__PURE__ */ s.jsx(
            "text",
            {
              x: T(k),
              y: le.top + dt + 20,
              textAnchor: "middle",
              className: "fill-muted-foreground",
              fontSize: 10,
              children: ce ? kv(k) : qv(k)
            },
            k
          )),
          /* @__PURE__ */ s.jsx("path", { d: mt, fill: o, opacity: 0.1 }),
          /* @__PURE__ */ s.jsx("path", { d: tt, fill: "none", stroke: o, strokeWidth: 2, strokeLinejoin: "round" }),
          Q && /* @__PURE__ */ s.jsxs(s.Fragment, { children: [
            /* @__PURE__ */ s.jsx(
              "line",
              {
                x1: T(Q.t),
                y1: le.top,
                x2: T(Q.t),
                y2: le.top + dt,
                stroke: o,
                strokeWidth: 1,
                opacity: 0.4,
                strokeDasharray: "3,3"
              }
            ),
            /* @__PURE__ */ s.jsx(
              "circle",
              {
                cx: T(Q.t),
                cy: q(Q.v),
                r: 4,
                fill: o,
                stroke: "hsl(var(--card))",
                strokeWidth: 2
              }
            )
          ] }),
          /* @__PURE__ */ s.jsx(
            "rect",
            {
              x: le.left,
              y: le.top,
              width: r - le.left - le.right,
              height: dt,
              fill: "transparent"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ s.jsx("div", { className: "flex gap-4 mt-2 text-xs min-h-[1.25rem]", children: Q ? /* @__PURE__ */ s.jsxs(s.Fragment, { children: [
      /* @__PURE__ */ s.jsx("span", { className: "text-muted-foreground", children: new Date(Q.t).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }) }),
      /* @__PURE__ */ s.jsxs("span", { className: "font-semibold", style: { color: o }, children: [
        Y(Q.v),
        m
      ] })
    ] }) : /* @__PURE__ */ s.jsxs(s.Fragment, { children: [
      /* @__PURE__ */ s.jsxs("span", { className: "text-muted-foreground", children: [
        "Current: ",
        /* @__PURE__ */ s.jsxs("strong", { className: "text-foreground", children: [
          Y(b.current),
          m
        ] })
      ] }),
      /* @__PURE__ */ s.jsxs("span", { className: "text-muted-foreground", children: [
        "Min: ",
        /* @__PURE__ */ s.jsxs("strong", { className: "text-foreground", children: [
          Y(b.min),
          m
        ] })
      ] }),
      /* @__PURE__ */ s.jsxs("span", { className: "text-muted-foreground", children: [
        "Max: ",
        /* @__PURE__ */ s.jsxs("strong", { className: "text-foreground", children: [
          Y(b.max),
          m
        ] })
      ] }),
      /* @__PURE__ */ s.jsxs("span", { className: "text-muted-foreground", children: [
        "Avg: ",
        /* @__PURE__ */ s.jsxs("strong", { className: "text-foreground", children: [
          Y(b.avg),
          m
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
const Gv = (c) => c.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), mh = (...c) => c.filter((r, f, o) => !!r && r.trim() !== "" && o.indexOf(r) === f).join(" ").trim();
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var Xv = {
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
const Vv = H.forwardRef(
  ({
    color: c = "currentColor",
    size: r = 24,
    strokeWidth: f = 2,
    absoluteStrokeWidth: o,
    className: m = "",
    children: h,
    iconNode: g,
    ...y
  }, _) => H.createElement(
    "svg",
    {
      ref: _,
      ...Xv,
      width: r,
      height: r,
      stroke: c,
      strokeWidth: o ? Number(f) * 24 / Number(r) : f,
      className: mh("lucide", m),
      ...y
    },
    [
      ...g.map(([p, j]) => H.createElement(p, j)),
      ...Array.isArray(h) ? h : [h]
    ]
  )
);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const he = (c, r) => {
  const f = H.forwardRef(
    ({ className: o, ...m }, h) => H.createElement(Vv, {
      ref: h,
      iconNode: r,
      className: mh(`lucide-${Gv(c)}`, o),
      ...m
    })
  );
  return f.displayName = `${c}`, f;
};
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Xm = he("Activity", [
  [
    "path",
    {
      d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
      key: "169zse"
    }
  ]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Qv = he("ArrowDown", [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Zv = he("ArrowUp", [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const zr = he("BatteryLow", [
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
const hh = he("Battery", [
  ["rect", { width: "16", height: "10", x: "2", y: "7", rx: "2", ry: "2", key: "1w10f2" }],
  ["line", { x1: "22", x2: "22", y1: "11", y2: "13", key: "4dh1rd" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Kv = he("Bed", [
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
const Jv = he("Car", [
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
const Wv = he("CircleDot", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Vm = he("CloudDrizzle", [
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
const $v = he("CloudFog", [
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
const xr = he("CloudRain", [
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
const Qm = he("CloudSnow", [
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
const Fv = he("CloudSun", [
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
const Nr = he("Cloud", [
  ["path", { d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z", key: "p7xjir" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Mn = he("Droplets", [
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
const Iv = he("Fan", [
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
const Ws = he("Flame", [
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
const gh = he("Fuel", [
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
const vh = he("Gauge", [
  ["path", { d: "m12 14 4-4", key: "9kzdfg" }],
  ["path", { d: "M3.34 19a10 10 0 1 1 17.32 0", key: "19p75a" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Pv = he("Globe", [
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
const ep = he("House", [
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
const ph = he("Lightbulb", [
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
const tp = he("MapPin", [
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
const Zm = he("Monitor", [
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
const Ar = he("Moon", [
  ["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", key: "a7tn18" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const lp = he("Mountain", [
  ["path", { d: "m8 3 4 8 5-5 5 15H2L8 3z", key: "otkl63" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ap = he("Music", [
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
const yh = he("PlugZap", [
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
const np = he("Power", [
  ["path", { d: "M12 2v10", key: "mnfbl" }],
  ["path", { d: "M18.4 6.6a9 9 0 1 1-12.77.04", key: "obofu9" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const up = he("Settings", [
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
const $s = he("ShowerHead", [
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
const Cr = he("Sun", [
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
const Or = he("Thermometer", [
  ["path", { d: "M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z", key: "17jzev" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Fs = he("Trash2", [
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
const sp = he("Trash", [
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
const cp = he("TriangleAlert", [
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
const ip = he("Truck", [
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
const rp = he("Waves", [
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
const op = he("Wifi", [
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
const Vs = he("Wind", [
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
const fp = he("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Is = he("Zap", [
  [
    "path",
    {
      d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
      key: "1xq2db"
    }
  ]
]), bh = H.createContext({ open: () => {
} });
function Gl() {
  return H.useContext(bh);
}
const dp = [
  { label: "1h", hours: 1 },
  { label: "6h", hours: 6 },
  { label: "24h", hours: 24 },
  { label: "3d", hours: 72 },
  { label: "7d", hours: 168 }
];
function mp({ children: c }) {
  const [r, f] = H.useState(null), [o, m] = H.useState(24), h = H.useRef(!1), g = H.useCallback((j, z, B = "") => {
    f({ entityId: j, name: z, unit: B }), m(24);
  }, []), y = H.useCallback(() => {
    f(null);
  }, []);
  H.useEffect(() => {
    if (!r) return;
    const j = (z) => {
      z.key === "Escape" && y();
    };
    return window.addEventListener("keydown", j), () => window.removeEventListener("keydown", j);
  }, [r, y]);
  const { data: _, loading: p } = Ua((r == null ? void 0 : r.entityId) ?? null, o);
  return /* @__PURE__ */ s.jsxs(bh.Provider, { value: { open: g }, children: [
    c,
    r && /* @__PURE__ */ s.jsx(
      "div",
      {
        className: "absolute inset-0 z-[9999] flex items-center justify-center",
        style: { background: "rgba(0,0,0,0.5)" },
        onMouseDown: (j) => {
          h.current = j.target === j.currentTarget;
        },
        onTouchStart: (j) => {
          h.current = j.target === j.currentTarget;
        },
        onClick: (j) => {
          j.target === j.currentTarget && h.current && y(), h.current = !1;
        },
        children: /* @__PURE__ */ s.jsx(
          "div",
          {
            className: se(
              "w-[min(95vw,700px)] max-h-[85vh] overflow-auto",
              "rounded-xl border bg-card text-foreground shadow-2xl"
            ),
            onClick: (j) => j.stopPropagation(),
            children: /* @__PURE__ */ s.jsx(
              hp,
              {
                state: r,
                hours: o,
                setHours: m,
                data: _,
                loading: p,
                close: y
              }
            )
          }
        )
      }
    )
  ] });
}
function hp({
  state: c,
  hours: r,
  setHours: f,
  data: o,
  loading: m,
  close: h
}) {
  const g = pe(c.entityId), y = (g == null ? void 0 : g.last_updated) || (g == null ? void 0 : g.last_changed), _ = y ? dh(y) : null;
  return /* @__PURE__ */ s.jsxs("div", { className: "p-5 space-y-4", children: [
    /* @__PURE__ */ s.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ s.jsxs("div", { children: [
        /* @__PURE__ */ s.jsx("h2", { className: "text-lg font-semibold", children: c.name }),
        /* @__PURE__ */ s.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ s.jsx("p", { className: "text-xs text-muted-foreground font-mono", children: c.entityId }),
          _ && /* @__PURE__ */ s.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "· Updated ",
            _
          ] })
        ] })
      ] }),
      /* @__PURE__ */ s.jsx(
        "button",
        {
          onClick: h,
          className: "rounded-md p-1.5 hover:bg-muted transition-colors",
          children: /* @__PURE__ */ s.jsx(fp, { className: "h-4 w-4" })
        }
      )
    ] }),
    /* @__PURE__ */ s.jsx("div", { className: "flex gap-1", children: dp.map((p) => /* @__PURE__ */ s.jsx(
      "button",
      {
        onClick: () => f(p.hours),
        className: se(
          "px-3 py-1 rounded-md text-xs font-medium transition-colors",
          r === p.hours ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
        ),
        children: p.label
      },
      p.label
    )) }),
    /* @__PURE__ */ s.jsx("div", { className: "min-h-[250px] flex items-center justify-center", children: m ? /* @__PURE__ */ s.jsx("div", { className: "text-sm text-muted-foreground animate-pulse", children: "Loading history…" }) : /* @__PURE__ */ s.jsx(Yv, { data: o, unit: c.unit }) })
  ] });
}
function wn({ title: c, children: r, className: f }) {
  return /* @__PURE__ */ s.jsxs("div", { className: se("p-4 md:p-6 space-y-4 max-w-screen-2xl mx-auto", f), children: [
    /* @__PURE__ */ s.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: c }),
    r
  ] });
}
const Xe = H.forwardRef(
  ({ className: c, ...r }, f) => /* @__PURE__ */ s.jsx(
    "div",
    {
      ref: f,
      className: se("rounded-lg border bg-card text-card-foreground shadow-sm", c),
      ...r
    }
  )
);
Xe.displayName = "Card";
const Pe = H.forwardRef(
  ({ className: c, ...r }, f) => /* @__PURE__ */ s.jsx("div", { ref: f, className: se("flex flex-col space-y-1.5 p-5 pb-0", c), ...r })
);
Pe.displayName = "CardHeader";
const et = H.forwardRef(
  ({ className: c, ...r }, f) => /* @__PURE__ */ s.jsx("div", { ref: f, className: se("text-sm font-semibold leading-none", c), ...r })
);
et.displayName = "CardTitle";
const gp = H.forwardRef(
  ({ className: c, ...r }, f) => /* @__PURE__ */ s.jsx("div", { ref: f, className: se("text-xs text-muted-foreground", c), ...r })
);
gp.displayName = "CardDescription";
const Ve = H.forwardRef(
  ({ className: c, ...r }, f) => /* @__PURE__ */ s.jsx("div", { ref: f, className: se("p-5 pt-4", c), ...r })
);
Ve.displayName = "CardContent";
const xh = H.forwardRef(
  ({ className: c, value: r = 0, max: f = 100, indicatorClassName: o, ...m }, h) => {
    const g = Math.min(100, Math.max(0, r / f * 100));
    return /* @__PURE__ */ s.jsx(
      "div",
      {
        ref: h,
        className: se("relative h-2 w-full overflow-hidden rounded-full bg-secondary", c),
        ...m,
        children: /* @__PURE__ */ s.jsx(
          "div",
          {
            className: se(
              "h-full rounded-full bg-primary transition-all duration-500",
              o
            ),
            style: { width: `${g}%` }
          }
        )
      }
    );
  }
);
xh.displayName = "Progress";
function oe({
  entityId: c,
  label: r,
  value: f,
  unit: o = "",
  icon: m,
  color: h = "#3b82f6",
  hours: g = 6,
  className: y
}) {
  const { data: _ } = Ua(c, g), { open: p } = Gl();
  return /* @__PURE__ */ s.jsxs(
    "div",
    {
      className: se(
        "flex items-center justify-between gap-2 cursor-pointer hover:bg-muted/50 rounded-md transition-colors -mx-1 px-1 py-0.5",
        y
      ),
      onClick: () => p(c, r, o),
      role: "button",
      tabIndex: 0,
      onKeyDown: (j) => {
        (j.key === "Enter" || j.key === " ") && p(c, r, o);
      },
      children: [
        /* @__PURE__ */ s.jsxs("span", { className: "text-xs text-muted-foreground flex items-center gap-1.5 shrink-0", children: [
          m && /* @__PURE__ */ s.jsx(m, { className: "h-3.5 w-3.5" }),
          r
        ] }),
        /* @__PURE__ */ s.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ s.jsx(Nn, { data: _, color: h, width: 64, height: 20 }),
          /* @__PURE__ */ s.jsxs("span", { className: "font-medium tabular-nums text-sm shrink-0", children: [
            f,
            o && /* @__PURE__ */ s.jsx("span", { className: "text-muted-foreground ml-0.5 text-xs", children: o })
          ] })
        ] })
      ]
    }
  );
}
function _h({ compact: c = !1 }) {
  const { value: r } = V("sensor.olins_van_bms_battery"), { value: f } = V("sensor.olins_van_bms_voltage"), { value: o } = V("sensor.olins_van_bms_current"), { value: m } = V("sensor.olins_van_bms_power"), { value: h } = V("sensor.olins_van_bms_stored_energy"), { value: g } = V("sensor.olins_van_bms_temperature"), { value: y } = V("sensor.olins_van_bms_cycles"), { value: _ } = V("sensor.olins_van_bms_delta_voltage"), { data: p } = Ua("sensor.olins_van_bms_battery", 12), { open: j } = Gl(), z = (o ?? 0) > 0, B = Bv(o, m, h), U = r ?? 0, L = U < 30 ? "text-red-500" : U < 65 ? "text-orange-500" : "text-green-500", X = U < 30 ? "bg-red-500" : U < 65 ? "bg-orange-500" : "bg-green-500";
  return /* @__PURE__ */ s.jsxs(Xe, { children: [
    /* @__PURE__ */ s.jsx(Pe, { className: "pb-2", children: /* @__PURE__ */ s.jsxs(et, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ s.jsx(hh, { className: "h-4 w-4" }),
      "Battery",
      /* @__PURE__ */ s.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
        /* @__PURE__ */ s.jsx(
          Nn,
          {
            data: p,
            color: U < 30 ? "#ef4444" : U < 65 ? "#f97316" : "#22c55e",
            width: 64,
            height: 20,
            onClick: () => j("sensor.olins_van_bms_battery", "Battery SOC", "%")
          }
        ),
        /* @__PURE__ */ s.jsxs("span", { className: se("text-2xl font-bold tabular-nums", L), children: [
          G(r, 0),
          "%"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ s.jsxs(Ve, { className: "space-y-3", children: [
      /* @__PURE__ */ s.jsx(xh, { value: U, className: "h-3", indicatorClassName: X }),
      /* @__PURE__ */ s.jsxs("div", { className: "grid gap-1", children: [
        /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.olins_van_bms_voltage", label: "Voltage", value: G(f, 2), unit: "V", color: "#6366f1" }),
        /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.olins_van_bms_current", label: "Current", value: G(o, 2), unit: "A", color: "#06b6d4" }),
        /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.olins_van_bms_power", label: "Power", value: G(m != null ? Math.abs(m) : null, 0), unit: "W", color: "#f59e0b" }),
        !c && /* @__PURE__ */ s.jsxs(s.Fragment, { children: [
          /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.olins_van_bms_stored_energy", label: "Stored", value: G(h, 0), unit: "Wh", color: "#8b5cf6" }),
          /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.olins_van_bms_temperature", label: "Temperature", value: G(g, 1), unit: "°C", color: "#ef4444" }),
          /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.olins_van_bms_cycles", label: "Cycles", value: G(y, 0), unit: "", color: "#64748b" }),
          /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.olins_van_bms_delta_voltage", label: "Cell Delta", value: G(_, 3), unit: "V", color: "#ec4899" })
        ] })
      ] }),
      B && /* @__PURE__ */ s.jsx(
        "p",
        {
          className: se(
            "text-xs font-medium text-center",
            z ? "text-green-500" : "text-orange-500"
          ),
          children: B
        }
      )
    ] })
  ] });
}
function Sh({ compact: c = !1 }) {
  const { value: r } = V("sensor.total_mppt_pv_power"), { value: f } = V("sensor.a32_pro_mppt1_pv_power"), { value: o } = V("sensor.a32_pro_mppt2_pv_power"), { value: m } = V("sensor.a32_pro_mppt1_yield_today"), { value: h } = V("sensor.a32_pro_mppt2_yield_today"), { value: g } = V("sensor.total_mppt_yield_today"), { value: y } = V("sensor.average_mppt_output_voltage"), { value: _ } = V("sensor.total_mppt_output_current"), { data: p } = Ua("sensor.total_mppt_pv_power", 12), { open: j } = Gl(), z = (r ?? 0) > 10;
  return /* @__PURE__ */ s.jsxs(Xe, { children: [
    /* @__PURE__ */ s.jsx(Pe, { className: "pb-2", children: /* @__PURE__ */ s.jsxs(et, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ s.jsx(Cr, { className: se("h-4 w-4", z ? "text-yellow-500" : "text-muted-foreground") }),
      "Solar",
      /* @__PURE__ */ s.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
        /* @__PURE__ */ s.jsx(
          Nn,
          {
            data: p,
            color: "#eab308",
            width: 64,
            height: 20,
            onClick: () => j("sensor.total_mppt_pv_power", "Total Solar", "W")
          }
        ),
        /* @__PURE__ */ s.jsxs(
          "span",
          {
            className: se(
              "text-2xl font-bold tabular-nums",
              z ? "text-yellow-500" : "text-muted-foreground"
            ),
            children: [
              G(r, 0),
              "W"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ s.jsxs(Ve, { className: "space-y-3", children: [
      /* @__PURE__ */ s.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ s.jsxs(
          "div",
          {
            className: "space-y-1 rounded-lg bg-muted/50 p-2.5 cursor-pointer hover:bg-muted/80 transition-colors",
            onClick: () => j("sensor.a32_pro_mppt1_pv_power", "MPPT 1", "W"),
            children: [
              /* @__PURE__ */ s.jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "MPPT 1" }),
              /* @__PURE__ */ s.jsxs("p", { className: "text-lg font-bold tabular-nums", children: [
                G(f, 0),
                "W"
              ] }),
              /* @__PURE__ */ s.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                G(m, 2),
                " kWh today"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ s.jsxs(
          "div",
          {
            className: "space-y-1 rounded-lg bg-muted/50 p-2.5 cursor-pointer hover:bg-muted/80 transition-colors",
            onClick: () => j("sensor.a32_pro_mppt2_pv_power", "MPPT 2", "W"),
            children: [
              /* @__PURE__ */ s.jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "MPPT 2" }),
              /* @__PURE__ */ s.jsxs("p", { className: "text-lg font-bold tabular-nums", children: [
                G(o, 0),
                "W"
              ] }),
              /* @__PURE__ */ s.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                G(h, 2),
                " kWh today"
              ] })
            ]
          }
        )
      ] }),
      !c && /* @__PURE__ */ s.jsxs("div", { className: "grid gap-1", children: [
        /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.total_mppt_yield_today", label: "Total Yield", value: G(g, 0), unit: "Wh", color: "#eab308" }),
        /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.average_mppt_output_voltage", label: "Output Voltage", value: G(y, 1), unit: "V", color: "#6366f1" }),
        /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.total_mppt_output_current", label: "Output Current", value: G(_, 1), unit: "A", color: "#06b6d4" })
      ] })
    ] })
  ] });
}
function Mr({ name: c, tempEntity: r, humidityEntity: f }) {
  const { value: o } = V(r), { value: m } = V(f), { data: h } = Ua(r, 12), { open: g } = Gl();
  return /* @__PURE__ */ s.jsx(
    Xe,
    {
      className: "cursor-pointer hover:bg-muted/30 transition-colors",
      onClick: () => g(r, `${c} Temperature`, "°C"),
      children: /* @__PURE__ */ s.jsx(Ve, { className: "pt-4 pb-4", children: /* @__PURE__ */ s.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ s.jsxs("div", { children: [
          /* @__PURE__ */ s.jsx("p", { className: "text-xs text-muted-foreground", children: c }),
          /* @__PURE__ */ s.jsxs("p", { className: "text-2xl font-bold tabular-nums", children: [
            G(o, 1),
            "°C"
          ] })
        ] }),
        /* @__PURE__ */ s.jsxs("div", { className: "flex flex-col items-end gap-1", children: [
          /* @__PURE__ */ s.jsx(Nn, { data: h, color: "#ef4444", width: 56, height: 18 }),
          /* @__PURE__ */ s.jsxs(
            "div",
            {
              className: "flex items-center gap-1 text-muted-foreground",
              onClick: (y) => {
                y.stopPropagation(), g(f, `${c} Humidity`, "%");
              },
              children: [
                /* @__PURE__ */ s.jsx(Mn, { className: "h-3.5 w-3.5" }),
                /* @__PURE__ */ s.jsxs("span", { className: "text-sm tabular-nums", children: [
                  G(m, 0),
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
function Qs({ name: c, entityId: r, invertWarning: f, icon: o }) {
  const { value: m } = V(r), h = m ?? 0, g = f ? h > 80 ? "bg-red-500" : h > 60 ? "bg-orange-500" : "bg-green-500" : h < 20 ? "bg-red-500" : h < 50 ? "bg-orange-500" : "bg-blue-500";
  return /* @__PURE__ */ s.jsx(Xe, { children: /* @__PURE__ */ s.jsxs(Ve, { className: "pt-4 pb-4", children: [
    /* @__PURE__ */ s.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ s.jsxs("p", { className: "text-sm font-medium flex items-center gap-1.5", children: [
        o,
        c
      ] }),
      /* @__PURE__ */ s.jsxs("p", { className: "text-lg font-bold tabular-nums", children: [
        G(m, 0),
        "%"
      ] })
    ] }),
    /* @__PURE__ */ s.jsx("div", { className: "h-3 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ s.jsx(
      "div",
      {
        className: se("h-full rounded-full transition-all duration-500", g),
        style: { width: `${Math.min(100, Math.max(0, h))}%` }
      }
    ) })
  ] }) });
}
function vp(c, r = "daily") {
  const f = Js(), [o, m] = H.useState([]);
  return H.useEffect(() => {
    let h = null, g = !1;
    async function y() {
      const p = f.hass;
      if (p != null && p.connection)
        try {
          h = await p.connection.subscribeMessage(
            (j) => {
              !g && j.forecast && m(j.forecast);
            },
            {
              type: "weather/subscribe_forecast",
              forecast_type: r,
              entity_id: c
            }
          );
        } catch (j) {
          console.warn("Failed to subscribe to weather forecast:", j);
        }
    }
    y();
    const _ = () => {
      var p;
      (p = f.hass) != null && p.connection && !h && y();
    };
    return window.addEventListener("hass-updated", _), () => {
      g = !0, h == null || h(), window.removeEventListener("hass-updated", _);
    };
  }, [f, c, r]), o;
}
const _r = /* @__PURE__ */ new Map();
function pp(c, r) {
  return `${c.toFixed(2)},${r.toFixed(2)}`;
}
function yp(c, r) {
  const [f, o] = H.useState(null), m = H.useRef(null);
  return H.useEffect(() => {
    if (c == null || r == null) return;
    const h = pp(c, r);
    if (h === m.current) return;
    m.current = h;
    const g = _r.get(h);
    if (g) {
      o(g);
      return;
    }
    let y = !1;
    const _ = `https://nominatim.openstreetmap.org/reverse?lat=${c}&lon=${r}&format=json&zoom=10&addressdetails=1`;
    return fetch(_, {
      headers: { "User-Agent": "VanDashboard/1.0" }
    }).then((p) => p.json()).then((p) => {
      var X;
      if (y) return;
      const j = p.address, z = (j == null ? void 0 : j.city) || (j == null ? void 0 : j.town) || (j == null ? void 0 : j.village) || (j == null ? void 0 : j.hamlet) || (j == null ? void 0 : j.county) || "", B = (j == null ? void 0 : j.state) || (j == null ? void 0 : j.province) || "", U = ((X = j == null ? void 0 : j.country_code) == null ? void 0 : X.toUpperCase()) || "";
      let L = "";
      z && B ? L = `${z}, ${B}` : z ? L = z : B ? L = B : p.display_name && (L = p.display_name.split(",").slice(0, 2).join(",").trim()), L && U && L.includes(U), _r.set(h, L), o(L);
    }).catch(() => {
      if (!y) {
        const p = `${Number(c).toFixed(2)}°, ${Number(r).toFixed(2)}°`;
        _r.set(h, p), o(p);
      }
    }), () => {
      y = !0;
    };
  }, [c, r]), f;
}
const Km = {
  sunny: Cr,
  "clear-night": Ar,
  cloudy: Nr,
  partlycloudy: Fv,
  rainy: xr,
  pouring: xr,
  snowy: Qm,
  "snowy-rainy": Qm,
  windy: Vs,
  "windy-variant": Vs,
  fog: $v,
  hail: Vm,
  lightning: Vm,
  "lightning-rainy": xr
};
function bp(c) {
  return (c == null ? void 0 : c.replace(/-/g, " ").replace(/_/g, " ")) ?? "";
}
function xp() {
  var fe, R;
  const c = pe("weather.pirateweather"), r = pe("device_tracker.starlink_device_location"), f = vp("weather.pirateweather", "daily"), o = (fe = r == null ? void 0 : r.attributes) == null ? void 0 : fe.latitude, m = (R = r == null ? void 0 : r.attributes) == null ? void 0 : R.longitude, h = yp(o, m);
  if (!c) return null;
  const g = c.state, y = c.attributes, _ = y.temperature, p = y.humidity, j = y.wind_speed, z = Km[g] || Nr, B = c.last_updated, U = f.slice(0, 7), L = U.flatMap((te) => [te.temperature, te.templow]), X = L.length > 0 ? Math.min(...L) : 0, F = (L.length > 0 ? Math.max(...L) : 30) - X || 1;
  return /* @__PURE__ */ s.jsxs(Xe, { children: [
    /* @__PURE__ */ s.jsxs(Pe, { className: "pb-2", children: [
      /* @__PURE__ */ s.jsxs(et, { className: "flex items-center justify-between text-base", children: [
        /* @__PURE__ */ s.jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ s.jsx(z, { className: "h-4 w-4" }),
          "Weather"
        ] }),
        /* @__PURE__ */ s.jsx("span", { className: "text-xs font-normal text-muted-foreground", children: dh(B) })
      ] }),
      h && /* @__PURE__ */ s.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1 -mt-1", children: [
        /* @__PURE__ */ s.jsx(tp, { className: "h-3 w-3" }),
        h
      ] })
    ] }),
    /* @__PURE__ */ s.jsxs(Ve, { className: "space-y-3", children: [
      /* @__PURE__ */ s.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ s.jsxs("div", { children: [
          /* @__PURE__ */ s.jsxs("p", { className: "text-3xl font-bold tabular-nums", children: [
            G(_, 0),
            "°C"
          ] }),
          /* @__PURE__ */ s.jsx("p", { className: "text-sm text-muted-foreground capitalize", children: bp(g) })
        ] }),
        /* @__PURE__ */ s.jsxs("div", { className: "text-right space-y-1", children: [
          /* @__PURE__ */ s.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1 justify-end", children: [
            /* @__PURE__ */ s.jsx(Mn, { className: "h-3 w-3" }),
            " ",
            G(p, 0),
            "%"
          ] }),
          /* @__PURE__ */ s.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1 justify-end", children: [
            /* @__PURE__ */ s.jsx(Vs, { className: "h-3 w-3" }),
            " ",
            G(j, 0),
            " km/h"
          ] })
        ] })
      ] }),
      U.length > 0 && /* @__PURE__ */ s.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ s.jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "7-Day Forecast" }),
        U.map((te, de) => {
          const I = Km[te.condition] || Nr, J = new Date(te.datetime), De = de === 0, we = De ? "Today" : J.toLocaleDateString(void 0, { weekday: "short" }), nt = te.templow, Re = te.temperature, le = (nt - X) / F * 100, dt = (Re - X) / F * 100, tt = Re > 30 ? "bg-red-500" : Re > 20 ? "bg-orange-400" : Re > 10 ? "bg-yellow-400" : Re > 0 ? "bg-blue-400" : "bg-blue-600";
          return /* @__PURE__ */ s.jsxs(
            "div",
            {
              className: "grid items-center gap-1 text-xs",
              style: { gridTemplateColumns: "2.5rem 1.25rem 1fr 2rem 2rem" },
              children: [
                /* @__PURE__ */ s.jsx(
                  "span",
                  {
                    className: `truncate ${De ? "font-medium text-foreground" : "text-muted-foreground"}`,
                    children: we
                  }
                ),
                /* @__PURE__ */ s.jsx(I, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                /* @__PURE__ */ s.jsx("div", { className: "relative h-2 rounded-full bg-muted", children: /* @__PURE__ */ s.jsx(
                  "div",
                  {
                    className: `absolute inset-y-0 rounded-full ${tt}`,
                    style: {
                      left: `${le}%`,
                      right: `${100 - dt}%`
                    }
                  }
                ) }),
                /* @__PURE__ */ s.jsxs("span", { className: "text-right tabular-nums text-muted-foreground", children: [
                  Math.round(nt),
                  "°"
                ] }),
                /* @__PURE__ */ s.jsxs("span", { className: "text-right tabular-nums font-medium", children: [
                  Math.round(Re),
                  "°"
                ] })
              ]
            },
            de
          );
        })
      ] }),
      U.some((te) => te.precipitation_probability > 0) && /* @__PURE__ */ s.jsx("div", { className: "flex gap-2 overflow-x-auto pb-1", children: U.map((te, de) => {
        const I = te.precipitation_probability, J = new Date(te.datetime), De = de === 0 ? "Tod" : J.toLocaleDateString(void 0, { weekday: "short" });
        return /* @__PURE__ */ s.jsxs("div", { className: "flex flex-col items-center gap-0.5 min-w-[2.5rem] text-xs", children: [
          /* @__PURE__ */ s.jsx("span", { className: "text-muted-foreground", children: De }),
          /* @__PURE__ */ s.jsx("div", { className: "h-6 w-3 rounded-sm bg-muted relative overflow-hidden", children: /* @__PURE__ */ s.jsx(
            "div",
            {
              className: "absolute bottom-0 w-full bg-blue-400 rounded-sm",
              style: { height: `${I}%` }
            }
          ) }),
          /* @__PURE__ */ s.jsxs("span", { className: "text-muted-foreground tabular-nums", children: [
            I,
            "%"
          ] })
        ] }, de);
      }) })
    ] })
  ] });
}
const Jm = (c) => typeof c == "boolean" ? `${c}` : c === 0 ? "0" : c, Wm = sh, jh = (c, r) => (f) => {
  var o;
  if ((r == null ? void 0 : r.variants) == null) return Wm(c, f == null ? void 0 : f.class, f == null ? void 0 : f.className);
  const { variants: m, defaultVariants: h } = r, g = Object.keys(m).map((p) => {
    const j = f == null ? void 0 : f[p], z = h == null ? void 0 : h[p];
    if (j === null) return null;
    const B = Jm(j) || Jm(z);
    return m[p][B];
  }), y = f && Object.entries(f).reduce((p, j) => {
    let [z, B] = j;
    return B === void 0 || (p[z] = B), p;
  }, {}), _ = r == null || (o = r.compoundVariants) === null || o === void 0 ? void 0 : o.reduce((p, j) => {
    let { class: z, className: B, ...U } = j;
    return Object.entries(U).every((L) => {
      let [X, Z] = L;
      return Array.isArray(Z) ? Z.includes({
        ...h,
        ...y
      }[X]) : {
        ...h,
        ...y
      }[X] === Z;
    }) ? [
      ...p,
      z,
      B
    ] : p;
  }, []);
  return Wm(c, g, _, f == null ? void 0 : f.class, f == null ? void 0 : f.className);
}, _p = jh(
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
), Mu = H.forwardRef(
  ({ className: c, variant: r, size: f, ...o }, m) => /* @__PURE__ */ s.jsx(
    "button",
    {
      className: se(_p({ variant: r, size: f, className: c })),
      ref: m,
      ...o
    }
  )
);
Mu.displayName = "Button";
const Ps = H.forwardRef(
  ({ className: c, onValueChange: r, ...f }, o) => /* @__PURE__ */ s.jsx(
    "input",
    {
      type: "range",
      ref: o,
      className: se(
        "w-full h-2 rounded-full appearance-none cursor-pointer bg-secondary",
        "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5",
        "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary",
        "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-md",
        "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full",
        "[&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background",
        c
      ),
      onChange: (m) => r == null ? void 0 : r(Number(m.target.value)),
      ...f
    }
  )
);
Ps.displayName = "Slider";
function Ha() {
  const c = Js();
  return H.useCallback(
    (r, f, o, m) => c.callService(r, f, o, m),
    [c]
  );
}
function fl(c) {
  const r = Ha(), f = c.split(".")[0];
  return H.useCallback(
    () => r(f, "toggle", void 0, { entity_id: c }),
    [r, f, c]
  );
}
function Sp(c) {
  const r = Ha();
  return H.useCallback(
    () => r("button", "press", void 0, { entity_id: c }),
    [r, c]
  );
}
function Nh() {
  var R;
  const c = pe("climate.a32_pro_van_hydronic_heating_pid"), r = Ha(), [f, o] = H.useState(null), m = H.useRef(null), h = H.useCallback(
    (te) => {
      m.current && clearTimeout(m.current), m.current = setTimeout(() => {
        r("climate", "set_temperature", { temperature: te }, {
          entity_id: "climate.a32_pro_van_hydronic_heating_pid"
        });
      }, 300);
    },
    [r]
  ), g = ((R = c == null ? void 0 : c.attributes) == null ? void 0 : R.temperature) ?? 0;
  if (H.useEffect(() => {
    o(null);
  }, [g]), !c) return null;
  const y = c.attributes, _ = y.current_temperature ?? 0, p = y.min_temp ?? 5, j = y.max_temp ?? 35, z = y.target_temp_step ?? 0.5, U = c.state === "heat", L = f ?? g, X = (te) => {
    const de = Math.round(te / z) * z;
    o(de), h(de);
  }, Z = () => {
    r("climate", "set_hvac_mode", {
      hvac_mode: U ? "off" : "heat"
    }, { entity_id: "climate.a32_pro_van_hydronic_heating_pid" });
  }, F = Math.max(0, Math.min(1, (L - p) / (j - p))), fe = U ? `hsl(${30 - F * 30}, ${70 + F * 30}%, ${55 - F * 10}%)` : void 0;
  return /* @__PURE__ */ s.jsxs(Xe, { children: [
    /* @__PURE__ */ s.jsx(Pe, { className: "pb-2", children: /* @__PURE__ */ s.jsxs(et, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ s.jsx(
        Or,
        {
          className: se("h-4 w-4", U ? "text-orange-500" : "text-muted-foreground")
        }
      ),
      "Thermostat",
      /* @__PURE__ */ s.jsx("span", { className: se(
        "ml-auto text-xs font-medium px-2 py-0.5 rounded-full",
        U ? "bg-orange-500/10 text-orange-500" : "bg-muted text-muted-foreground"
      ), children: U ? "Heating" : "Off" })
    ] }) }),
    /* @__PURE__ */ s.jsxs(Ve, { className: "space-y-4", children: [
      /* @__PURE__ */ s.jsxs("div", { className: "flex items-end justify-between", children: [
        /* @__PURE__ */ s.jsxs("div", { children: [
          /* @__PURE__ */ s.jsx("p", { className: "text-xs text-muted-foreground mb-0.5", children: "Current" }),
          /* @__PURE__ */ s.jsxs("p", { className: "text-3xl font-bold tabular-nums leading-none", children: [
            _.toFixed(1),
            "°"
          ] })
        ] }),
        U && /* @__PURE__ */ s.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ s.jsx("p", { className: "text-xs text-muted-foreground mb-0.5", children: "Target" }),
          /* @__PURE__ */ s.jsxs("p", { className: "text-2xl font-bold tabular-nums text-orange-500 leading-none", children: [
            L.toFixed(1),
            "°"
          ] })
        ] })
      ] }),
      U && /* @__PURE__ */ s.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ s.jsx(
          Ps,
          {
            min: p,
            max: j,
            step: z,
            value: L,
            onValueChange: X,
            style: fe ? {
              accentColor: fe
            } : void 0
          }
        ),
        /* @__PURE__ */ s.jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground tabular-nums", children: [
          /* @__PURE__ */ s.jsxs("span", { children: [
            p,
            "°"
          ] }),
          /* @__PURE__ */ s.jsxs("span", { children: [
            j,
            "°"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ s.jsxs(
        Mu,
        {
          variant: U ? "default" : "outline",
          className: se("w-full", U && "bg-orange-500 hover:bg-orange-600"),
          onClick: Z,
          children: [
            /* @__PURE__ */ s.jsx(np, { className: "h-4 w-4 mr-2" }),
            U ? "Turn Off" : "Turn On"
          ]
        }
      )
    ] })
  ] });
}
const _l = H.forwardRef(
  ({ className: c, checked: r = !1, onCheckedChange: f, ...o }, m) => /* @__PURE__ */ s.jsx(
    "button",
    {
      ref: m,
      role: "switch",
      "aria-checked": r,
      className: se(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
        "border-2 border-transparent transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        r ? "bg-primary" : "bg-input",
        c
      ),
      onClick: () => f == null ? void 0 : f(!r),
      ...o,
      children: /* @__PURE__ */ s.jsx(
        "span",
        {
          className: se(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
            r ? "translate-x-5" : "translate-x-0"
          )
        }
      )
    }
  )
);
_l.displayName = "Switch";
function Mh() {
  var I;
  const c = pe("switch.a32_pro_switch24_hydronic_heater"), r = pe("input_boolean.hot_water_mode"), f = pe("light.a32_pro_a32_pro_dac_0"), o = pe("sensor.a32_pro_hydronic_heater_status"), m = pe("input_boolean.heater_low_fuel_lockout"), { value: h } = V(
    "sensor.a32_pro_s5140_channel_34_temperature_blower_coolant"
  ), { value: g } = V(
    "sensor.a32_pro_s5140_channel_35_temperature_blower_air"
  ), { value: y } = V(
    "sensor.a32_pro_coolant_blower_heating_pid_climate_result"
  ), _ = fl("switch.a32_pro_switch24_hydronic_heater"), p = fl("input_boolean.hot_water_mode"), j = Ha(), z = (c == null ? void 0 : c.state) === "on", B = (r == null ? void 0 : r.state) === "on", U = (m == null ? void 0 : m.state) === "on", L = ((I = f == null ? void 0 : f.attributes) == null ? void 0 : I.brightness) ?? 0, X = Math.round(L / 255 * 100), Z = (o == null ? void 0 : o.state) ?? "", [F, fe] = H.useState(null), R = H.useRef(null), te = H.useCallback(
    (J) => {
      fe(J), R.current && clearTimeout(R.current), R.current = setTimeout(() => {
        j("light", "turn_on", { brightness_pct: J }, {
          entity_id: "light.a32_pro_a32_pro_dac_0"
        });
      }, 300);
    },
    [j]
  ), de = F ?? X;
  return H.useEffect(() => {
    fe(null);
  }, [X]), /* @__PURE__ */ s.jsxs(Xe, { children: [
    /* @__PURE__ */ s.jsx(Pe, { className: "pb-2", children: /* @__PURE__ */ s.jsxs(et, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ s.jsx(Ws, { className: se("h-4 w-4", z ? "text-orange-500" : "text-muted-foreground") }),
      "Heating System"
    ] }) }),
    /* @__PURE__ */ s.jsxs(Ve, { className: "space-y-4", children: [
      U && /* @__PURE__ */ s.jsx("div", { className: "rounded-lg bg-red-500/10 border border-red-500/30 p-2 text-xs text-red-500 font-medium", children: "⚠ Low fuel lockout active" }),
      /* @__PURE__ */ s.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ s.jsx("span", { className: "text-sm", children: "Hydronic Heater" }),
        /* @__PURE__ */ s.jsx(_l, { checked: z, onCheckedChange: _ })
      ] }),
      /* @__PURE__ */ s.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ s.jsxs("span", { className: "text-sm flex items-center gap-1.5", children: [
          /* @__PURE__ */ s.jsx(Mn, { className: "h-3.5 w-3.5 text-blue-500" }),
          "Hot Water Mode"
        ] }),
        /* @__PURE__ */ s.jsx(_l, { checked: B, onCheckedChange: p })
      ] }),
      /* @__PURE__ */ s.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ s.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ s.jsxs("span", { className: "text-sm flex items-center gap-1.5", children: [
            /* @__PURE__ */ s.jsx(Vs, { className: "h-3.5 w-3.5" }),
            "Blower Fan"
          ] }),
          /* @__PURE__ */ s.jsxs("span", { className: "text-xs text-muted-foreground tabular-nums", children: [
            de,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ s.jsx(
          Ps,
          {
            min: 0,
            max: 100,
            value: de,
            onValueChange: te
          }
        )
      ] }),
      /* @__PURE__ */ s.jsxs("div", { className: "border-t pt-3 space-y-1", children: [
        /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.a32_pro_s5140_channel_34_temperature_blower_coolant", label: "Coolant Temp", value: G(h, 1), unit: "°C", color: "#ef4444" }),
        /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.a32_pro_s5140_channel_35_temperature_blower_air", label: "Blower Air", value: G(g, 1), unit: "°C", color: "#f97316" }),
        /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.a32_pro_coolant_blower_heating_pid_climate_result", label: "PID Output", value: G(y != null ? y * 100 : null, 0), unit: "%", color: "#6366f1" }),
        Z && Z !== "Idle." && Z !== "0" && /* @__PURE__ */ s.jsx("p", { className: "text-xs text-orange-500 mt-1", children: Z })
      ] })
    ] })
  ] });
}
function wh() {
  var Z;
  const c = pe("fan.ag_pro_roof_fan"), r = pe("cover.ag_pro_roof_fan_lid"), f = pe("sensor.roof_fan_direction"), o = Ha(), m = (c == null ? void 0 : c.state) === "on", h = ((Z = c == null ? void 0 : c.attributes) == null ? void 0 : Z.percentage) ?? 0, g = r == null ? void 0 : r.state, y = (f == null ? void 0 : f.state) ?? "Unknown", _ = () => {
    o("fan", m ? "turn_off" : "turn_on", void 0, {
      entity_id: "fan.ag_pro_roof_fan"
    });
  }, [p, j] = H.useState(null), z = H.useRef(null), B = H.useCallback(
    (F) => {
      j(F), z.current && clearTimeout(z.current), z.current = setTimeout(() => {
        o("fan", "set_percentage", { percentage: F }, {
          entity_id: "fan.ag_pro_roof_fan"
        });
      }, 300);
    },
    [o]
  ), U = p ?? h;
  H.useEffect(() => {
    j(null);
  }, [h]);
  const L = (F) => {
    o("fan", "set_direction", { direction: F }, {
      entity_id: "fan.ag_pro_roof_fan"
    });
  }, X = () => {
    o("cover", g === "open" ? "close_cover" : "open_cover", void 0, { entity_id: "cover.ag_pro_roof_fan_lid" });
  };
  return /* @__PURE__ */ s.jsxs(Xe, { children: [
    /* @__PURE__ */ s.jsx(Pe, { className: "pb-2", children: /* @__PURE__ */ s.jsxs(et, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ s.jsx(
        Iv,
        {
          className: se("h-4 w-4", m && "text-cyan-500 animate-spin"),
          style: m ? { animationDuration: "2s" } : void 0
        }
      ),
      "Roof Fan"
    ] }) }),
    /* @__PURE__ */ s.jsxs(Ve, { className: "space-y-4", children: [
      /* @__PURE__ */ s.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ s.jsx("span", { className: "text-sm", children: "Fan" }),
        /* @__PURE__ */ s.jsx(_l, { checked: m, onCheckedChange: _ })
      ] }),
      m && /* @__PURE__ */ s.jsxs(s.Fragment, { children: [
        /* @__PURE__ */ s.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ s.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ s.jsx("span", { className: "text-sm", children: "Speed" }),
            /* @__PURE__ */ s.jsxs("span", { className: "text-xs text-muted-foreground tabular-nums", children: [
              U,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ s.jsx(Ps, { min: 0, max: 100, step: 10, value: U, onValueChange: B })
        ] }),
        /* @__PURE__ */ s.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ s.jsxs(
            Mu,
            {
              variant: y === "Exhaust" ? "default" : "outline",
              size: "sm",
              className: "flex-1",
              onClick: () => L("forward"),
              children: [
                /* @__PURE__ */ s.jsx(Zv, { className: "h-3.5 w-3.5 mr-1" }),
                "Exhaust"
              ]
            }
          ),
          /* @__PURE__ */ s.jsxs(
            Mu,
            {
              variant: y === "Intake" ? "default" : "outline",
              size: "sm",
              className: "flex-1",
              onClick: () => L("reverse"),
              children: [
                /* @__PURE__ */ s.jsx(Qv, { className: "h-3.5 w-3.5 mr-1" }),
                "Intake"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ s.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ s.jsx("span", { className: "text-sm", children: "Lid" }),
        /* @__PURE__ */ s.jsx(Mu, { variant: "outline", size: "sm", onClick: X, children: g === "open" ? "Close" : "Open" })
      ] })
    ] })
  ] });
}
const jp = {
  green: "bg-green-500",
  red: "bg-red-500",
  orange: "bg-orange-500",
  blue: "bg-blue-500",
  yellow: "bg-yellow-500",
  cyan: "bg-cyan-500",
  purple: "bg-purple-500"
};
function Nu({ active: c, color: r = "green", label: f, className: o }) {
  const m = r.startsWith("bg-") ? r : jp[r] ?? "bg-green-500";
  return /* @__PURE__ */ s.jsxs("div", { className: se("flex items-center gap-1.5", o), children: [
    /* @__PURE__ */ s.jsx(
      "span",
      {
        className: se(
          "h-2.5 w-2.5 rounded-full shrink-0",
          c ? m : "bg-muted-foreground/30"
        )
      }
    ),
    f && /* @__PURE__ */ s.jsx("span", { className: "text-xs text-muted-foreground", children: f })
  ] });
}
function Np() {
  const c = pe("binary_sensor.apollo_msr_2_1731d8_radar_target"), r = pe("device_tracker.starlink"), f = pe("input_boolean.power_saving_mode"), o = pe("input_boolean.sleep_mode"), m = pe("binary_sensor.engine_is_running"), h = (c == null ? void 0 : c.state) === "on", g = (r == null ? void 0 : r.state) === "home", y = (f == null ? void 0 : f.state) === "on", _ = (o == null ? void 0 : o.state) === "on", p = (m == null ? void 0 : m.state) === "on";
  return /* @__PURE__ */ s.jsxs("div", { className: "flex flex-wrap items-center gap-3 px-1", children: [
    /* @__PURE__ */ s.jsx(Nu, { active: h, color: "green", label: h ? "Occupied" : "Empty" }),
    /* @__PURE__ */ s.jsx(Nu, { active: g, color: "blue", label: g ? "Online" : "Offline" }),
    p && /* @__PURE__ */ s.jsx(Nu, { active: !0, color: "orange", label: "Engine On" }),
    y && /* @__PURE__ */ s.jsx(Nu, { active: !0, color: "yellow", label: "Power Save" }),
    _ && /* @__PURE__ */ s.jsx(Nu, { active: !0, color: "purple", label: "Sleep" })
  ] });
}
const $m = {
  green: { border: "border-green-500", bg: "bg-green-500/10", text: "text-green-500", glow: "shadow-green-500/25" },
  blue: { border: "border-blue-500", bg: "bg-blue-500/10", text: "text-blue-500", glow: "shadow-blue-500/25" },
  orange: { border: "border-orange-500", bg: "bg-orange-500/10", text: "text-orange-500", glow: "shadow-orange-500/25" },
  red: { border: "border-red-500", bg: "bg-red-500/10", text: "text-red-500", glow: "shadow-red-500/25" },
  cyan: { border: "border-cyan-500", bg: "bg-cyan-500/10", text: "text-cyan-500", glow: "shadow-cyan-500/25" },
  yellow: { border: "border-yellow-500", bg: "bg-yellow-500/10", text: "text-yellow-500", glow: "shadow-yellow-500/25" },
  purple: { border: "border-purple-500", bg: "bg-purple-500/10", text: "text-purple-500", glow: "shadow-purple-500/25" }
};
function Ct({
  entityId: c,
  name: r,
  icon: f,
  activeColor: o = "blue",
  onToggle: m,
  className: h
}) {
  const g = pe(c), y = fl(c), _ = (g == null ? void 0 : g.state) === "on", p = $m[o] || $m.blue;
  return /* @__PURE__ */ s.jsxs(
    "button",
    {
      onClick: m ?? y,
      className: se(
        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 min-w-[5rem]",
        _ ? `${p.border} ${p.bg} ${p.text} shadow-lg ${p.glow}` : "border-border bg-card text-muted-foreground hover:bg-accent",
        h
      ),
      children: [
        /* @__PURE__ */ s.jsx(
          f,
          {
            className: se("h-5 w-5 transition-transform duration-300")
          }
        ),
        /* @__PURE__ */ s.jsx("span", { className: "text-xs font-medium", children: r })
      ]
    }
  );
}
const Mp = 25e3;
function wp() {
  const c = pe("sensor.shellyem_c4d8d500789a_channel_1_voltage"), r = c == null ? void 0 : c.state;
  if (console.log("[InverterButton] voltage entity:", c ? `state="${r}"` : "null"), !r || r === "unavailable" || r === "unknown") return !1;
  const f = parseFloat(r);
  return Number.isFinite(f) && f > 0;
}
function Eh({ name: c = "Inverter" }) {
  const r = Sp("button.a32_pro_inverter_on_off_toggle"), f = wp(), [o, m] = H.useState(null), [h, g] = H.useState(!1), y = H.useRef(null), _ = H.useRef(f);
  _.current = f, H.useEffect(() => {
    h && o !== null && f === o && (g(!1), m(null), y.current && clearTimeout(y.current));
  }, [f, o, h]), H.useEffect(() => () => {
    y.current && clearTimeout(y.current);
  }, []);
  const p = H.useCallback(() => {
    r();
    const U = !(o !== null ? o : _.current);
    m(U), g(!0), y.current && clearTimeout(y.current), y.current = setTimeout(() => {
      g(!1), m(null);
    }, Mp);
  }, [r, o]), j = o !== null ? o : f, z = {
    border: "border-green-500",
    bg: "bg-green-500/10",
    text: "text-green-500",
    glow: "shadow-green-500/25"
  };
  return /* @__PURE__ */ s.jsxs(
    "button",
    {
      onClick: p,
      className: se(
        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 min-w-[5rem]",
        j ? `${z.border} ${z.bg} ${z.text} shadow-lg ${z.glow}` : "border-border bg-card text-muted-foreground hover:bg-accent"
      ),
      children: [
        /* @__PURE__ */ s.jsx(
          Is,
          {
            className: se(
              "h-5 w-5 transition-transform duration-300",
              h && "animate-pulse",
              j && !h && "scale-110"
            )
          }
        ),
        /* @__PURE__ */ s.jsx("span", { className: "text-xs font-medium", children: j ? "ON" : "OFF" })
      ]
    }
  );
}
function vl({
  label: c,
  value: r,
  color: f,
  icon: o,
  onClick: m
}) {
  return /* @__PURE__ */ s.jsxs(
    "button",
    {
      onClick: m,
      className: se(
        "flex items-center gap-2 rounded-lg border bg-card px-3 py-2 min-w-[7rem] text-left transition-colors",
        m && "hover:bg-accent active:bg-accent/80 cursor-pointer"
      ),
      children: [
        /* @__PURE__ */ s.jsx(o, { className: se("h-4 w-4 shrink-0", f) }),
        /* @__PURE__ */ s.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ s.jsx("p", { className: "text-[10px] text-muted-foreground leading-tight", children: c }),
          /* @__PURE__ */ s.jsx("p", { className: "text-sm font-semibold tabular-nums truncate", children: r })
        ] })
      ]
    }
  );
}
function Ep() {
  const { value: c } = V("sensor.olins_van_bms_battery"), { value: r } = V("sensor.total_mppt_pv_power"), { value: f } = V("sensor.a32_pro_fresh_water_tank_level"), { value: o } = V("sensor.a32_pro_grey_water_tank_level"), { value: m } = V("sensor.stable_fuel_level"), { value: h } = V("sensor.propane_tank_percentage"), { value: g } = V("sensor.starlink_downlink_throughput_mbps"), y = pe("binary_sensor.shelly_em_reachable"), _ = pe("input_boolean.power_saving_mode"), p = pe("switch.a32_pro_switch06_grey_water_tank_valve"), j = pe("light.led_controller_cct_1"), z = pe("light.led_controller_cct_2"), B = pe("light.led_controller_sc_1"), U = pe("light.led_controller_sc_2"), { open: L } = Gl(), X = fl("switch.a32_pro_switch06_grey_water_tank_valve"), Z = fl("input_boolean.power_saving_mode"), F = fl("light.led_controller_cct_1"), fe = (y == null ? void 0 : y.state) === "on", R = (_ == null ? void 0 : _.state) === "on", te = (p == null ? void 0 : p.state) === "on", de = [j, z, B, U].filter((J) => (J == null ? void 0 : J.state) === "on").length, I = (J) => J ?? 0;
  return /* @__PURE__ */ s.jsxs("div", { className: "flex gap-2 overflow-x-auto pb-1", children: [
    /* @__PURE__ */ s.jsx(
      vl,
      {
        label: "Battery",
        value: `${G(c, 0)}%`,
        color: I(c) < 30 ? "text-red-500" : I(c) < 65 ? "text-orange-500" : "text-green-500",
        icon: hh,
        onClick: () => L("sensor.olins_van_bms_battery", "Battery SOC", "%")
      }
    ),
    /* @__PURE__ */ s.jsx(
      vl,
      {
        label: "Solar",
        value: `${G(r, 0)}W`,
        color: I(r) > 50 ? "text-yellow-500" : "text-muted-foreground",
        icon: Cr,
        onClick: () => L("sensor.total_mppt_pv_power", "Solar Power", "W")
      }
    ),
    /* @__PURE__ */ s.jsx(
      vl,
      {
        label: "Lights",
        value: de > 0 ? `${de} on` : "Off",
        color: de > 0 ? "text-yellow-500" : "text-muted-foreground",
        icon: ph,
        onClick: F
      }
    ),
    /* @__PURE__ */ s.jsx(
      vl,
      {
        label: "Inverter",
        value: fe ? "ON" : "OFF",
        color: fe ? "text-green-500" : "text-muted-foreground",
        icon: Is,
        onClick: () => L("sensor.inverter_power_24v", "Inverter Power", "W")
      }
    ),
    /* @__PURE__ */ s.jsx(
      vl,
      {
        label: "Internet",
        value: `${G(g, 0)} Mbps`,
        color: I(g) > 50 ? "text-green-500" : I(g) > 10 ? "text-orange-500" : "text-red-500",
        icon: op,
        onClick: () => L("sensor.starlink_downlink_throughput_mbps", "Internet Speed", "Mbps")
      }
    ),
    /* @__PURE__ */ s.jsx(
      vl,
      {
        label: "Fresh",
        value: `${G(f, 0)}%`,
        color: I(f) < 20 ? "text-red-500" : I(f) < 50 ? "text-orange-500" : "text-blue-500",
        icon: Mn,
        onClick: () => L("sensor.a32_pro_fresh_water_tank_level", "Fresh Water", "%")
      }
    ),
    /* @__PURE__ */ s.jsx(
      vl,
      {
        label: "Grey",
        value: `${G(o, 0)}%`,
        color: I(o) > 80 ? "text-red-500" : I(o) > 60 ? "text-orange-500" : "text-green-500",
        icon: Fs,
        onClick: () => L("sensor.a32_pro_grey_water_tank_level", "Grey Water", "%")
      }
    ),
    /* @__PURE__ */ s.jsx(
      vl,
      {
        label: "Grey Dump",
        value: te ? "OPEN" : "Closed",
        color: te ? "text-orange-500" : "text-muted-foreground",
        icon: sp,
        onClick: X
      }
    ),
    /* @__PURE__ */ s.jsx(
      vl,
      {
        label: "Fuel",
        value: `${G(m, 0)}%`,
        color: I(m) < 15 ? "text-red-500" : I(m) < 30 ? "text-orange-500" : "text-green-500",
        icon: gh,
        onClick: () => L("sensor.stable_fuel_level", "Fuel Level", "%")
      }
    ),
    /* @__PURE__ */ s.jsx(
      vl,
      {
        label: "Propane",
        value: `${G(h, 0)}%`,
        color: I(h) < 15 ? "text-red-500" : I(h) < 30 ? "text-orange-500" : "text-green-500",
        icon: Ws,
        onClick: () => L("sensor.propane_tank_percentage", "Propane", "%")
      }
    ),
    /* @__PURE__ */ s.jsx(
      vl,
      {
        label: "Eco Mode",
        value: R ? "ON" : "OFF",
        color: R ? "text-yellow-500" : "text-muted-foreground",
        icon: zr,
        onClick: Z
      }
    )
  ] });
}
function Tp() {
  return /* @__PURE__ */ s.jsxs("div", { className: "flex flex-wrap gap-2", children: [
    /* @__PURE__ */ s.jsx(
      Ct,
      {
        entityId: "input_boolean.shore_power_charger_enabled",
        name: "Shore",
        icon: yh,
        activeColor: "green"
      }
    ),
    /* @__PURE__ */ s.jsx(
      Ct,
      {
        entityId: "switch.a32_pro_switch06_grey_water_tank_valve",
        name: "Grey Dump",
        icon: Fs,
        activeColor: "orange"
      }
    ),
    /* @__PURE__ */ s.jsx(Eh, {})
  ] });
}
function zp() {
  return /* @__PURE__ */ s.jsxs("div", { className: "flex flex-wrap gap-2", children: [
    /* @__PURE__ */ s.jsx(
      Ct,
      {
        entityId: "input_boolean.power_saving_mode",
        name: "Eco",
        icon: zr,
        activeColor: "yellow"
      }
    ),
    /* @__PURE__ */ s.jsx(
      Ct,
      {
        entityId: "input_boolean.sleep_mode",
        name: "Sleep",
        icon: Ar,
        activeColor: "purple"
      }
    ),
    /* @__PURE__ */ s.jsx(
      Ct,
      {
        entityId: "input_boolean.shower_mode",
        name: "Shower",
        icon: $s,
        activeColor: "cyan"
      }
    )
  ] });
}
function Th() {
  return /* @__PURE__ */ s.jsxs(wn, { title: "Home", children: [
    /* @__PURE__ */ s.jsx(Ep, {}),
    /* @__PURE__ */ s.jsx(Np, {}),
    /* @__PURE__ */ s.jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: [
      /* @__PURE__ */ s.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ s.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ s.jsx(
            Mr,
            {
              name: "Living",
              tempEntity: "sensor.a32_pro_bme280_1_temperature",
              humidityEntity: "sensor.a32_pro_bme280_1_relative_humidity"
            }
          ),
          /* @__PURE__ */ s.jsx(
            Mr,
            {
              name: "Outdoor",
              tempEntity: "sensor.a32_pro_bme280_4_temperature",
              humidityEntity: "sensor.a32_pro_bme280_4_relative_humidity"
            }
          )
        ] }),
        /* @__PURE__ */ s.jsx(Nh, {}),
        /* @__PURE__ */ s.jsx(Mh, {}),
        /* @__PURE__ */ s.jsx(wh, {})
      ] }),
      /* @__PURE__ */ s.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ s.jsx(_h, { compact: !0 }),
        /* @__PURE__ */ s.jsx(Sh, { compact: !0 }),
        /* @__PURE__ */ s.jsx(Tp, {})
      ] }),
      /* @__PURE__ */ s.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ s.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ s.jsx(Qs, { name: "Fresh", entityId: "sensor.a32_pro_fresh_water_tank_level" }),
          /* @__PURE__ */ s.jsx(
            Qs,
            {
              name: "Grey",
              entityId: "sensor.a32_pro_grey_water_tank_level",
              invertWarning: !0
            }
          )
        ] }),
        /* @__PURE__ */ s.jsx(zp, {}),
        /* @__PURE__ */ s.jsx(xp, {})
      ] })
    ] })
  ] });
}
const zh = [
  { id: "mppt1", label: "MPPT 1", powerEntity: "sensor.a32_pro_mppt1_pv_power", currentEntity: "sensor.a32_pro_mppt1_output_current", color: "#eab308" },
  { id: "mppt2", label: "MPPT 2", powerEntity: "sensor.a32_pro_mppt2_pv_power", currentEntity: "sensor.a32_pro_mppt2_output_current", color: "#f59e0b" },
  { id: "alt", label: "Alternator", powerEntity: "sensor.alternator_charger_power_24v", currentEntity: "sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger", color: "#8b5cf6" },
  { id: "shore", label: "Shore", powerEntity: "sensor.shore_power_charger_power_24v", currentEntity: "sensor.a32_pro_s5140_channel_16_current_24v_shore_power_charger", color: "#22c55e" }
], Ah = [
  { id: "ac", label: "A/C", powerEntity: "sensor.air_conditioning_power_24v", currentEntity: "sensor.a32_pro_s5140_channel_4_current_24v_air_conditioning", color: "#06b6d4" },
  { id: "inverter", label: "Inverter", powerEntity: "sensor.inverter_power_24v", currentEntity: "sensor.a32_pro_s5140_channel_7_current_24v_inverter", color: "#f97316" },
  { id: "24v", label: "24V Devices", powerEntity: "sensor.all_24v_devices_power_24v", currentEntity: "sensor.a32_pro_s5140_channel_5_current_24v_24v_devices", color: "#3b82f6" },
  { id: "12v", label: "12V Devices", powerEntity: "sensor.all_12v_devices_power_24v", currentEntity: "sensor.a32_pro_s5140_channel_6_current_24v_12v_devices", color: "#6366f1" },
  { id: "fan", label: "Roof Fan", powerEntity: "sensor.roof_fan_power_12v", currentEntity: "sensor.a32_pro_s5140_channel_14_current_12v_roof_fan", color: "#14b8a6" },
  { id: "heater", label: "Batt Heater", powerEntity: "sensor.battery_heater_power_12v", currentEntity: "sensor.a32_pro_s5140_channel_13_current_12v_battery_heater", color: "#ef4444" },
  { id: "bed", label: "Bed Motor", powerEntity: "sensor.bed_motor_power_24v", currentEntity: "sensor.a32_pro_s5140_channel_15_current_24v_bed_motor", color: "#a855f7" }
];
function Ap(c) {
  const r = {};
  for (const _ of zh) {
    const p = c === "amps" ? _.currentEntity : _.powerEntity, { value: j } = V(p);
    r[_.id] = { value: j, entity: p };
  }
  for (const _ of Ah) {
    const p = c === "amps" ? _.currentEntity : _.powerEntity, { value: j } = V(p);
    r[_.id] = { value: j, entity: p };
  }
  const { value: f } = V("sensor.olins_van_bms_battery"), { value: o } = V("sensor.battery_charging"), { value: m } = V("sensor.battery_discharging"), { value: h } = V("sensor.olins_van_bms_current");
  let g, y;
  if (c === "amps") {
    const _ = h ?? 0;
    g = _ > 0 ? _ : 0, y = _ < 0 ? Math.abs(_) : 0;
  } else
    g = o ?? 0, y = m ?? 0;
  return { vals: r, soc: f ?? 0, charging: g, discharging: y };
}
const Cp = 520, Xs = 380, Ls = 0, ga = 210, Ys = 370, $t = 14, Gs = 6, wr = 3, Fm = 1.5;
function Op() {
  const [c, r] = H.useState("amps"), { vals: f, soc: o, charging: m, discharging: h } = Ap(c), { open: g } = Gl(), y = c === "amps" ? "A" : "W", _ = c === "amps" ? 0.05 : 2, p = H.useMemo(() => {
    const R = zh.map((W) => {
      var ce, b;
      return { ...W, entity: ((ce = f[W.id]) == null ? void 0 : ce.entity) ?? W.powerEntity, value: Math.abs(((b = f[W.id]) == null ? void 0 : b.value) ?? 0) };
    }).filter((W) => W.value > _), te = Ah.map((W) => {
      var ce, b;
      return { ...W, entity: ((ce = f[W.id]) == null ? void 0 : ce.entity) ?? W.powerEntity, value: Math.abs(((b = f[W.id]) == null ? void 0 : b.value) ?? 0) };
    }).filter((W) => W.value > _), de = m, I = h;
    if (R.length === 0 && te.length === 0 && de < _ && I < _)
      return null;
    const J = Math.max(
      R.reduce((W, ce) => W + ce.value, 0),
      te.reduce((W, ce) => W + ce.value, 0),
      de + I,
      1
    ), we = (Xs - 40) / J, nt = 8, Re = Im(R, we, nt), le = Im(te, we, nt), dt = Math.max(wr, Math.max(de, I) * we, 40), tt = (Xs - dt) / 2;
    let mt = tt;
    const T = Re.map((W) => {
      const ce = Math.max(Fm, W.value * we), b = { from: W, toY: mt, toH: ce, value: W.value };
      return mt += ce, b;
    });
    let q = tt;
    const ee = le.map((W) => {
      const ce = Math.max(Fm, W.value * we), b = { to: W, fromY: q, fromH: ce, value: W.value };
      return q += ce, b;
    });
    return { sourceNodes: Re, consumerNodes: le, batteryY: tt, batteryH: dt, chargeFlows: T, dischargeFlows: ee, totalCharge: de, totalDischarge: I, soc: o };
  }, [f, o, m, h, _]);
  if (!p)
    return /* @__PURE__ */ s.jsxs(Xe, { children: [
      /* @__PURE__ */ s.jsx(Pe, { className: "pb-2", children: /* @__PURE__ */ s.jsxs(et, { className: "flex items-center gap-2 text-base", children: [
        /* @__PURE__ */ s.jsx(Xm, { className: "h-4 w-4" }),
        "Power Flow",
        /* @__PURE__ */ s.jsxs("div", { className: "ml-auto flex gap-1", children: [
          /* @__PURE__ */ s.jsx(
            "button",
            {
              onClick: () => r("amps"),
              className: se(
                "text-[10px] px-2 py-0.5 rounded transition-colors",
                c === "amps" ? "bg-blue-500/20 text-blue-400" : "bg-muted text-muted-foreground hover:text-foreground"
              ),
              children: "Amps"
            }
          ),
          /* @__PURE__ */ s.jsx(
            "button",
            {
              onClick: () => r("power"),
              className: se(
                "text-[10px] px-2 py-0.5 rounded transition-colors",
                c === "power" ? "bg-blue-500/20 text-blue-400" : "bg-muted text-muted-foreground hover:text-foreground"
              ),
              children: "Watts"
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ s.jsx(Ve, { children: /* @__PURE__ */ s.jsx("div", { className: "text-center text-sm text-muted-foreground py-8", children: "No active power flow" }) })
    ] });
  const { sourceNodes: j, consumerNodes: z, batteryY: B, batteryH: U, chargeFlows: L, dischargeFlows: X, totalCharge: Z, totalDischarge: F } = p, fe = o >= 65 ? "#22c55e" : o >= 30 ? "#f59e0b" : "#ef4444";
  return /* @__PURE__ */ s.jsxs(Xe, { children: [
    /* @__PURE__ */ s.jsx(Pe, { className: "pb-2", children: /* @__PURE__ */ s.jsxs(et, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ s.jsx(Xm, { className: "h-4 w-4" }),
      "Power Flow",
      /* @__PURE__ */ s.jsxs("div", { className: "ml-auto flex gap-1", children: [
        /* @__PURE__ */ s.jsx(
          "button",
          {
            onClick: () => r("amps"),
            className: se(
              "text-[10px] px-2 py-0.5 rounded transition-colors",
              c === "amps" ? "bg-blue-500/20 text-blue-400" : "bg-muted text-muted-foreground hover:text-foreground"
            ),
            children: "Amps"
          }
        ),
        /* @__PURE__ */ s.jsx(
          "button",
          {
            onClick: () => r("power"),
            className: se(
              "text-[10px] px-2 py-0.5 rounded transition-colors",
              c === "power" ? "bg-blue-500/20 text-blue-400" : "bg-muted text-muted-foreground hover:text-foreground"
            ),
            children: "Watts"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ s.jsx(Ve, { className: "overflow-x-auto", children: /* @__PURE__ */ s.jsxs(
      "svg",
      {
        viewBox: `0 0 ${Cp} ${Xs}`,
        className: "w-full",
        style: { minWidth: 320, maxHeight: 400 },
        children: [
          L.map((R) => /* @__PURE__ */ s.jsx(
            "path",
            {
              d: Pm(
                Ls + $t,
                R.from.y,
                R.from.h,
                ga,
                R.toY,
                R.toH
              ),
              fill: R.from.color,
              opacity: 0.25,
              className: "transition-opacity hover:opacity-50 cursor-pointer",
              onClick: () => g(R.from.entity, R.from.label, y)
            },
            R.from.id
          )),
          X.map((R) => /* @__PURE__ */ s.jsx(
            "path",
            {
              d: Pm(
                ga + $t,
                R.fromY,
                R.fromH,
                Ys,
                R.to.y,
                R.to.h
              ),
              fill: R.to.color,
              opacity: 0.25,
              className: "transition-opacity hover:opacity-50 cursor-pointer",
              onClick: () => g(R.to.entity, R.to.label, y)
            },
            R.to.id
          )),
          j.map((R) => /* @__PURE__ */ s.jsxs("g", { className: "cursor-pointer", onClick: () => g(R.entity, R.label, y), children: [
            /* @__PURE__ */ s.jsx("rect", { x: Ls, y: R.y, width: $t, height: R.h, rx: 3, fill: R.color }),
            /* @__PURE__ */ s.jsx(
              "text",
              {
                x: Ls + $t + Gs,
                y: R.y + R.h / 2,
                dominantBaseline: "central",
                className: "fill-foreground",
                fontSize: 11,
                fontWeight: 500,
                children: R.label
              }
            ),
            /* @__PURE__ */ s.jsxs(
              "text",
              {
                x: Ls + $t + Gs,
                y: R.y + R.h / 2 + 13,
                dominantBaseline: "central",
                className: "fill-muted-foreground",
                fontSize: 10,
                children: [
                  G(R.value, c === "amps" ? 1 : 0),
                  y
                ]
              }
            )
          ] }, R.id)),
          /* @__PURE__ */ s.jsxs("g", { children: [
            /* @__PURE__ */ s.jsx(
              "rect",
              {
                x: ga,
                y: B,
                width: $t,
                height: U,
                rx: 3,
                fill: "hsl(var(--muted))",
                stroke: "hsl(var(--border))",
                strokeWidth: 1
              }
            ),
            /* @__PURE__ */ s.jsx(
              "rect",
              {
                x: ga + 1,
                y: B + U * (1 - o / 100),
                width: $t - 2,
                height: U * (o / 100),
                rx: 2,
                fill: fe,
                opacity: 0.6
              }
            ),
            /* @__PURE__ */ s.jsx(
              "text",
              {
                x: ga + $t / 2,
                y: B - 8,
                textAnchor: "middle",
                className: "fill-foreground",
                fontSize: 11,
                fontWeight: 600,
                children: "Battery"
              }
            ),
            /* @__PURE__ */ s.jsxs(
              "text",
              {
                x: ga + $t / 2,
                y: B + U + 16,
                textAnchor: "middle",
                className: "fill-muted-foreground",
                fontSize: 10,
                children: [
                  G(o, 0),
                  "%"
                ]
              }
            ),
            Z > _ && /* @__PURE__ */ s.jsxs(
              "text",
              {
                x: ga - 4,
                y: B + U / 2 - 6,
                textAnchor: "end",
                fill: "#22c55e",
                fontSize: 10,
                fontWeight: 500,
                children: [
                  "+",
                  G(Z, c === "amps" ? 1 : 0),
                  y
                ]
              }
            ),
            F > _ && /* @__PURE__ */ s.jsxs(
              "text",
              {
                x: ga + $t + 4,
                y: B + U / 2 - 6,
                textAnchor: "start",
                fill: "#f97316",
                fontSize: 10,
                fontWeight: 500,
                children: [
                  "−",
                  G(F, c === "amps" ? 1 : 0),
                  y
                ]
              }
            )
          ] }),
          z.map((R) => /* @__PURE__ */ s.jsxs("g", { className: "cursor-pointer", onClick: () => g(R.entity, R.label, y), children: [
            /* @__PURE__ */ s.jsx("rect", { x: Ys, y: R.y, width: $t, height: R.h, rx: 3, fill: R.color }),
            /* @__PURE__ */ s.jsx(
              "text",
              {
                x: Ys + $t + Gs,
                y: R.y + R.h / 2,
                dominantBaseline: "central",
                className: "fill-foreground",
                fontSize: 11,
                fontWeight: 500,
                children: R.label
              }
            ),
            /* @__PURE__ */ s.jsxs(
              "text",
              {
                x: Ys + $t + Gs,
                y: R.y + R.h / 2 + 13,
                dominantBaseline: "central",
                className: "fill-muted-foreground",
                fontSize: 10,
                children: [
                  G(R.value, c === "amps" ? 1 : 0),
                  y
                ]
              }
            )
          ] }, R.id))
        ]
      }
    ) })
  ] });
}
function Im(c, r, f) {
  const o = c.reduce((h, g) => h + Math.max(wr, g.value * r), 0) + Math.max(0, c.length - 1) * f;
  let m = (Xs - o) / 2;
  return c.map((h) => {
    const g = Math.max(wr, h.value * r), y = { ...h, y: m, h: g };
    return m += g + f, y;
  });
}
function Pm(c, r, f, o, m, h) {
  const g = (c + o) / 2;
  return [
    `M${c},${r}`,
    `C${g},${r} ${g},${m} ${o},${m}`,
    `L${o},${m + h}`,
    `C${g},${m + h} ${g},${r + f} ${c},${r + f}`,
    "Z"
  ].join(" ");
}
function Dp() {
  const { value: c } = V("sensor.a32_pro_smart_battery_sense_12v_voltage"), { value: r } = V("sensor.battery_charging"), { value: f } = V("sensor.battery_discharging");
  return /* @__PURE__ */ s.jsxs(Xe, { children: [
    /* @__PURE__ */ s.jsx(Pe, { className: "pb-2", children: /* @__PURE__ */ s.jsxs(et, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ s.jsx(vh, { className: "h-4 w-4" }),
      "System Voltages"
    ] }) }),
    /* @__PURE__ */ s.jsxs(Ve, { className: "space-y-1", children: [
      /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.a32_pro_smart_battery_sense_12v_voltage", label: "12V Rail", value: G(c, 2), unit: "V", color: "#6366f1" }),
      /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.battery_charging", label: "Charging", value: G(r, 0), unit: "W", color: "#22c55e" }),
      /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.battery_discharging", label: "Discharging", value: G(f, 0), unit: "W", color: "#f97316" })
    ] })
  ] });
}
function Rp() {
  return /* @__PURE__ */ s.jsxs(Xe, { children: [
    /* @__PURE__ */ s.jsx(Pe, { className: "pb-2", children: /* @__PURE__ */ s.jsxs(et, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ s.jsx(Is, { className: "h-4 w-4" }),
      "Charging Controls"
    ] }) }),
    /* @__PURE__ */ s.jsx(Ve, { children: /* @__PURE__ */ s.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ s.jsx(
        Ct,
        {
          entityId: "input_boolean.shore_power_charger_enabled",
          name: "Shore Charger",
          icon: yh,
          activeColor: "green"
        }
      ),
      /* @__PURE__ */ s.jsx(Eh, {})
    ] }) })
  ] });
}
function Up() {
  return /* @__PURE__ */ s.jsx(wn, { title: "Power & Energy", children: /* @__PURE__ */ s.jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: [
    /* @__PURE__ */ s.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ s.jsx(_h, {}),
      /* @__PURE__ */ s.jsx(Dp, {})
    ] }),
    /* @__PURE__ */ s.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ s.jsx(Sh, {}),
      /* @__PURE__ */ s.jsx(Rp, {})
    ] }),
    /* @__PURE__ */ s.jsx("div", { className: "xl:col-span-1 md:col-span-2 xl:col-span-1", children: /* @__PURE__ */ s.jsx(Op, {}) })
  ] }) });
}
const Hp = [
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
function Bp() {
  const { value: c } = V("sensor.battery_heater_power_12v");
  return /* @__PURE__ */ s.jsxs(Xe, { children: [
    /* @__PURE__ */ s.jsx(Pe, { className: "pb-2", children: /* @__PURE__ */ s.jsxs(et, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ s.jsx(Or, { className: "h-4 w-4" }),
      "Battery Heater"
    ] }) }),
    /* @__PURE__ */ s.jsx(Ve, { children: /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.battery_heater_power_12v", label: "Power", value: G(c, 0), unit: "W", color: "#ef4444" }) })
  ] });
}
function qp() {
  return /* @__PURE__ */ s.jsx(wn, { title: "Climate & Heating", children: /* @__PURE__ */ s.jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: [
    /* @__PURE__ */ s.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ s.jsx(Nh, {}),
      /* @__PURE__ */ s.jsx(Mh, {})
    ] }),
    /* @__PURE__ */ s.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ s.jsx("h2", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider", children: "Temperature Zones" }),
      /* @__PURE__ */ s.jsx("div", { className: "grid grid-cols-2 gap-3", children: Hp.map((c) => /* @__PURE__ */ s.jsx(
        Mr,
        {
          name: c.name,
          tempEntity: c.temp,
          humidityEntity: c.humidity
        },
        c.name
      )) }),
      /* @__PURE__ */ s.jsx(Bp, {})
    ] }),
    /* @__PURE__ */ s.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ s.jsx(wh, {}) })
  ] }) });
}
function kp() {
  const c = pe("switch.a32_pro_water_system_master_switch"), r = pe("switch.a32_pro_water_system_state_main"), f = pe("switch.a32_pro_water_system_state_recirculating_shower"), o = fl("switch.a32_pro_water_system_master_switch"), m = fl("switch.a32_pro_water_system_state_main"), h = fl("switch.a32_pro_water_system_state_recirculating_shower");
  return /* @__PURE__ */ s.jsxs(Xe, { children: [
    /* @__PURE__ */ s.jsx(Pe, { className: "pb-2", children: /* @__PURE__ */ s.jsxs(et, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ s.jsx(rp, { className: "h-4 w-4" }),
      "Water Controls"
    ] }) }),
    /* @__PURE__ */ s.jsxs(Ve, { className: "space-y-3", children: [
      /* @__PURE__ */ s.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ s.jsx("span", { className: "text-sm font-medium", children: "Master Switch" }),
        /* @__PURE__ */ s.jsx(_l, { checked: (c == null ? void 0 : c.state) === "on", onCheckedChange: o })
      ] }),
      /* @__PURE__ */ s.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ s.jsx("span", { className: "text-sm", children: "Main Mode" }),
        /* @__PURE__ */ s.jsx(_l, { checked: (r == null ? void 0 : r.state) === "on", onCheckedChange: m })
      ] }),
      /* @__PURE__ */ s.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ s.jsxs("span", { className: "text-sm flex items-center gap-1.5", children: [
          /* @__PURE__ */ s.jsx($s, { className: "h-3.5 w-3.5" }),
          "Recirc Shower"
        ] }),
        /* @__PURE__ */ s.jsx(_l, { checked: (f == null ? void 0 : f.state) === "on", onCheckedChange: h })
      ] })
    ] })
  ] });
}
function Lp() {
  const { value: c } = V("sensor.propane_tank_percentage"), { value: r } = V("sensor.propane_liquid_volume"), { value: f } = V("sensor.propane_liquid_depth"), { value: o } = V("sensor.propane_raw_distance"), m = pe("switch.a32_pro_switch16_lpg_valve"), h = fl("switch.a32_pro_switch16_lpg_valve"), g = c ?? 0, y = g < 15 ? "bg-red-500" : g < 30 ? "bg-orange-500" : "bg-green-500";
  return /* @__PURE__ */ s.jsxs(Xe, { children: [
    /* @__PURE__ */ s.jsx(Pe, { className: "pb-2", children: /* @__PURE__ */ s.jsxs(et, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ s.jsx(Ws, { className: "h-4 w-4" }),
      "Propane",
      /* @__PURE__ */ s.jsxs(
        "span",
        {
          className: se(
            "ml-auto text-2xl font-bold tabular-nums",
            g < 15 ? "text-red-500" : g < 30 ? "text-orange-500" : "text-green-500"
          ),
          children: [
            G(c, 0),
            "%"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ s.jsxs(Ve, { className: "space-y-3", children: [
      /* @__PURE__ */ s.jsx("div", { className: "h-3 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ s.jsx(
        "div",
        {
          className: se("h-full rounded-full transition-all duration-500", y),
          style: { width: `${Math.min(100, Math.max(0, g))}%` }
        }
      ) }),
      /* @__PURE__ */ s.jsxs("div", { className: "grid gap-1", children: [
        /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.propane_liquid_volume", label: "Volume", value: G(r, 1), unit: "L", color: "#22c55e" }),
        /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.propane_liquid_depth", label: "Liquid Depth", value: G(f, 0), unit: "mm", color: "#3b82f6" }),
        /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.propane_raw_distance", label: "Raw Distance", value: G(o, 0), unit: "mm", color: "#64748b" })
      ] }),
      /* @__PURE__ */ s.jsxs("div", { className: "flex items-center justify-between pt-2 border-t", children: [
        /* @__PURE__ */ s.jsx("span", { className: "text-sm", children: "LPG Valve" }),
        /* @__PURE__ */ s.jsx(_l, { checked: (m == null ? void 0 : m.state) === "on", onCheckedChange: h })
      ] })
    ] })
  ] });
}
function Yp() {
  return /* @__PURE__ */ s.jsxs(Xe, { children: [
    /* @__PURE__ */ s.jsx(Pe, { className: "pb-2", children: /* @__PURE__ */ s.jsx(et, { className: "text-base", children: "Quick Modes" }) }),
    /* @__PURE__ */ s.jsx(Ve, { children: /* @__PURE__ */ s.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ s.jsx(
        Ct,
        {
          entityId: "input_boolean.shower_mode",
          name: "Shower",
          icon: $s,
          activeColor: "cyan"
        }
      ),
      /* @__PURE__ */ s.jsx(
        Ct,
        {
          entityId: "switch.a32_pro_switch06_grey_water_tank_valve",
          name: "Grey Dump",
          icon: Fs,
          activeColor: "orange"
        }
      )
    ] }) })
  ] });
}
function Gp() {
  return /* @__PURE__ */ s.jsx(wn, { title: "Water & Propane", children: /* @__PURE__ */ s.jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: [
    /* @__PURE__ */ s.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ s.jsx(
        Qs,
        {
          name: "Fresh Water",
          entityId: "sensor.a32_pro_fresh_water_tank_level",
          icon: /* @__PURE__ */ s.jsx(Mn, { className: "h-4 w-4 text-blue-500" })
        }
      ),
      /* @__PURE__ */ s.jsx(
        Qs,
        {
          name: "Grey Water",
          entityId: "sensor.a32_pro_grey_water_tank_level",
          invertWarning: !0,
          icon: /* @__PURE__ */ s.jsx(Fs, { className: "h-4 w-4 text-orange-500" })
        }
      ),
      /* @__PURE__ */ s.jsx(Yp, {})
    ] }),
    /* @__PURE__ */ s.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ s.jsx(kp, {}) }),
    /* @__PURE__ */ s.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ s.jsx(Lp, {}) })
  ] }) });
}
const Xp = jh(
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
function Zs({ className: c, variant: r, ...f }) {
  return /* @__PURE__ */ s.jsx("div", { className: se(Xp({ variant: r }), c), ...f });
}
function Vp() {
  const { value: c } = V("sensor.wican_speed"), { value: r } = V("sensor.wican_rpm"), f = pe("sensor.wican_gear_display"), { value: o } = V("sensor.wican_throttle_position"), { value: m } = V("sensor.wican_engine_load"), { value: h } = V("sensor.wican_coolant_temperature"), { value: g } = V("sensor.wican_control_module_voltage"), y = pe("binary_sensor.vehicle_is_moving"), _ = pe("binary_sensor.engine_is_running"), { data: p } = Ua("sensor.wican_speed", 6), { open: j } = Gl(), z = (y == null ? void 0 : y.state) === "on", B = (_ == null ? void 0 : _.state) === "on", U = (f == null ? void 0 : f.state) ?? "—";
  return /* @__PURE__ */ s.jsxs(Xe, { children: [
    /* @__PURE__ */ s.jsx(Pe, { className: "pb-2", children: /* @__PURE__ */ s.jsxs(et, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ s.jsx(Jv, { className: "h-4 w-4" }),
      "Engine",
      /* @__PURE__ */ s.jsxs("div", { className: "ml-auto flex gap-1.5", children: [
        B && /* @__PURE__ */ s.jsx(Zs, { variant: "default", className: "text-[10px] bg-green-500", children: "Running" }),
        z && /* @__PURE__ */ s.jsx(Zs, { variant: "default", className: "text-[10px] bg-blue-500", children: "Moving" })
      ] })
    ] }) }),
    /* @__PURE__ */ s.jsxs(Ve, { className: "space-y-3", children: [
      /* @__PURE__ */ s.jsxs("div", { className: "grid grid-cols-3 gap-3 text-center", children: [
        /* @__PURE__ */ s.jsxs("div", { className: "cursor-pointer hover:bg-muted/50 rounded-md p-1 transition-colors", onClick: () => j("sensor.wican_speed", "Speed", "km/h"), children: [
          /* @__PURE__ */ s.jsx("p", { className: "text-3xl font-bold tabular-nums", children: G(c, 0) }),
          /* @__PURE__ */ s.jsx("p", { className: "text-[10px] text-muted-foreground", children: "km/h" })
        ] }),
        /* @__PURE__ */ s.jsxs("div", { className: "cursor-pointer hover:bg-muted/50 rounded-md p-1 transition-colors", onClick: () => j("sensor.wican_rpm", "RPM", "rpm"), children: [
          /* @__PURE__ */ s.jsx("p", { className: "text-3xl font-bold tabular-nums", children: G(r, 0) }),
          /* @__PURE__ */ s.jsx("p", { className: "text-[10px] text-muted-foreground", children: "RPM" })
        ] }),
        /* @__PURE__ */ s.jsxs("div", { children: [
          /* @__PURE__ */ s.jsx("p", { className: "text-3xl font-bold tabular-nums", children: U }),
          /* @__PURE__ */ s.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Gear" })
        ] })
      ] }),
      /* @__PURE__ */ s.jsx(Nn, { data: p, color: "#3b82f6", width: 300, height: 32, className: "w-full", onClick: () => j("sensor.wican_speed", "Speed", "km/h") }),
      /* @__PURE__ */ s.jsxs("div", { className: "grid gap-1", children: [
        /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.wican_throttle_position", label: "Throttle", value: G(o, 0), unit: "%", color: "#f59e0b" }),
        /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.wican_engine_load", label: "Engine Load", value: G(m, 0), unit: "%", color: "#ef4444" }),
        /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.wican_coolant_temperature", label: "Coolant Temp", value: G(h, 0), unit: "°C", color: "#ef4444" }),
        /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.wican_control_module_voltage", label: "ECU Voltage", value: G(g, 1), unit: "V", color: "#6366f1" })
      ] })
    ] })
  ] });
}
function Qp() {
  const { value: c } = V("sensor.stable_fuel_level"), { value: r } = V("sensor.wican_fuel"), { value: f } = V("sensor.wican_fuel_5_min_mean"), { value: o } = V("sensor.fuel_consumption_l100km"), { value: m } = V("sensor.fuel_consumption_lh"), { value: h } = V("sensor.wican_fuel_rate"), { data: g } = Ua("sensor.stable_fuel_level", 24), { open: y } = Gl(), _ = c != null ? c / 100 * 94.6 : null, p = c ?? 0, j = p < 15 ? "text-red-500" : p < 30 ? "text-orange-500" : "text-green-500";
  return /* @__PURE__ */ s.jsxs(Xe, { children: [
    /* @__PURE__ */ s.jsx(Pe, { className: "pb-2", children: /* @__PURE__ */ s.jsxs(et, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ s.jsx(gh, { className: "h-4 w-4" }),
      "Fuel",
      /* @__PURE__ */ s.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
        /* @__PURE__ */ s.jsx(Nn, { data: g, color: p < 15 ? "#ef4444" : p < 30 ? "#f97316" : "#22c55e", width: 56, height: 18, onClick: () => y("sensor.stable_fuel_level", "Fuel Level", "%") }),
        /* @__PURE__ */ s.jsxs("span", { className: se("text-2xl font-bold tabular-nums", j), children: [
          G(c, 0),
          "%"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ s.jsxs(Ve, { className: "space-y-1", children: [
      /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.stable_fuel_level", label: "Estimated", value: G(_, 1), unit: "L", color: "#22c55e" }),
      /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.wican_fuel_5_min_mean", label: "5min Mean", value: G(f, 0), unit: "%", color: "#3b82f6" }),
      /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.wican_fuel", label: "Raw OBD", value: G(r, 0), unit: "%", color: "#64748b" }),
      (o ?? 0) > 0 && /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.fuel_consumption_l100km", label: "Economy", value: G(o, 1), unit: "L/100km", color: "#8b5cf6" }),
      (m ?? 0) > 0 && /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.fuel_consumption_lh", label: "Rate", value: G(m, 1), unit: "L/h", color: "#f59e0b" }),
      (h ?? 0) > 0 && /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.wican_fuel_rate", label: "Fuel Rate", value: G(h, 2), unit: "g/s", color: "#06b6d4" })
    ] })
  ] });
}
function Zp() {
  const { value: c } = V("sensor.wican_tire_pressure_fl"), { value: r } = V("sensor.wican_tire_pressure_fr"), { value: f } = V("sensor.wican_tire_pressure_rl"), { value: o } = V("sensor.wican_tire_pressure_rr"), m = pe("binary_sensor.low_tire_pressure"), h = (m == null ? void 0 : m.state) === "on", g = (y) => (y ?? 0) < 35 ? "text-red-500" : (y ?? 0) < 40 ? "text-orange-500" : "text-green-500";
  return /* @__PURE__ */ s.jsxs(Xe, { children: [
    /* @__PURE__ */ s.jsx(Pe, { className: "pb-2", children: /* @__PURE__ */ s.jsxs(et, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ s.jsx(Wv, { className: "h-4 w-4" }),
      "Tire Pressure",
      h && /* @__PURE__ */ s.jsx(Zs, { variant: "destructive", className: "ml-auto text-[10px]", children: "LOW" })
    ] }) }),
    /* @__PURE__ */ s.jsx(Ve, { children: /* @__PURE__ */ s.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ s.jsxs("div", { className: "rounded-lg bg-muted/50 p-3 text-center", children: [
        /* @__PURE__ */ s.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Front Left" }),
        /* @__PURE__ */ s.jsx("p", { className: se("text-xl font-bold tabular-nums", g(c)), children: G(c, 0) }),
        /* @__PURE__ */ s.jsx("p", { className: "text-[10px] text-muted-foreground", children: "psi" })
      ] }),
      /* @__PURE__ */ s.jsxs("div", { className: "rounded-lg bg-muted/50 p-3 text-center", children: [
        /* @__PURE__ */ s.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Front Right" }),
        /* @__PURE__ */ s.jsx("p", { className: se("text-xl font-bold tabular-nums", g(r)), children: G(r, 0) }),
        /* @__PURE__ */ s.jsx("p", { className: "text-[10px] text-muted-foreground", children: "psi" })
      ] }),
      /* @__PURE__ */ s.jsxs("div", { className: "rounded-lg bg-muted/50 p-3 text-center", children: [
        /* @__PURE__ */ s.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Rear Left" }),
        /* @__PURE__ */ s.jsx("p", { className: se("text-xl font-bold tabular-nums", g(f)), children: G(f, 0) }),
        /* @__PURE__ */ s.jsx("p", { className: "text-[10px] text-muted-foreground", children: "psi" })
      ] }),
      /* @__PURE__ */ s.jsxs("div", { className: "rounded-lg bg-muted/50 p-3 text-center", children: [
        /* @__PURE__ */ s.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Rear Right" }),
        /* @__PURE__ */ s.jsx("p", { className: se("text-xl font-bold tabular-nums", g(o)), children: G(o, 0) }),
        /* @__PURE__ */ s.jsx("p", { className: "text-[10px] text-muted-foreground", children: "psi" })
      ] })
    ] }) })
  ] });
}
function Kp() {
  const { value: c } = V("sensor.road_grade_deg"), { value: r } = V("sensor.road_grade_percent"), f = pe("sensor.hill_aggression");
  return /* @__PURE__ */ s.jsxs(Xe, { children: [
    /* @__PURE__ */ s.jsx(Pe, { className: "pb-2", children: /* @__PURE__ */ s.jsxs(et, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ s.jsx(lp, { className: "h-4 w-4" }),
      "Road Grade"
    ] }) }),
    /* @__PURE__ */ s.jsxs(Ve, { className: "space-y-1", children: [
      /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.road_grade_percent", label: "Grade", value: G(r, 1), unit: "%", color: "#22c55e" }),
      /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.road_grade_deg", label: "Degrees", value: G(c, 1), unit: "°", color: "#6366f1" }),
      /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.hill_aggression", label: "Terrain", value: (f == null ? void 0 : f.state) ?? "—", unit: "", color: "#64748b" })
    ] })
  ] });
}
function Jp() {
  const { value: c } = V("sensor.wican_oil_life"), { value: r } = V("sensor.wican_transmission_temperature"), { value: f } = V("sensor.wican_wastegate"), { value: o } = V("sensor.wican_alternator_duty"), { value: m } = V("sensor.wican_intake_air_temperature"), { value: h } = V("sensor.wican_ambient_air_temperature"), { value: g } = V("sensor.wican_fuel_pressure"), y = pe("binary_sensor.check_engine_light"), { value: _ } = V("sensor.dtc_count"), p = (y == null ? void 0 : y.state) === "on";
  return /* @__PURE__ */ s.jsxs(Xe, { children: [
    /* @__PURE__ */ s.jsx(Pe, { className: "pb-2", children: /* @__PURE__ */ s.jsxs(et, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ s.jsx(vh, { className: "h-4 w-4" }),
      "Diagnostics",
      p && /* @__PURE__ */ s.jsxs(Zs, { variant: "destructive", className: "ml-auto text-[10px] flex items-center gap-1", children: [
        /* @__PURE__ */ s.jsx(cp, { className: "h-3 w-3" }),
        "CEL (",
        _,
        " DTC)"
      ] })
    ] }) }),
    /* @__PURE__ */ s.jsxs(Ve, { className: "space-y-1", children: [
      /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.wican_oil_life", label: "Oil Life", value: G(c, 0), unit: "%", color: "#22c55e" }),
      /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.wican_transmission_temperature", label: "Trans Temp", value: G(r, 0), unit: "°C", color: "#ef4444" }),
      /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.wican_wastegate", label: "Wastegate", value: G(f, 0), unit: "%", color: "#f59e0b" }),
      /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.wican_alternator_duty", label: "Alt Duty", value: G(o, 0), unit: "%", color: "#6366f1" }),
      /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.wican_intake_air_temperature", label: "Intake Air", value: G(m, 0), unit: "°C", color: "#06b6d4" }),
      /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.wican_ambient_air_temperature", label: "Ambient Air", value: G(h, 0), unit: "°C", color: "#3b82f6" }),
      /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.wican_fuel_pressure", label: "Fuel Pressure", value: G(g, 0), unit: "kPa", color: "#8b5cf6" })
    ] })
  ] });
}
function Wp() {
  return /* @__PURE__ */ s.jsx(wn, { title: "Van & Vehicle", children: /* @__PURE__ */ s.jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: [
    /* @__PURE__ */ s.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ s.jsx(Vp, {}),
      /* @__PURE__ */ s.jsx(Qp, {})
    ] }),
    /* @__PURE__ */ s.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ s.jsx(Zp, {}),
      /* @__PURE__ */ s.jsx(Kp, {})
    ] }),
    /* @__PURE__ */ s.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ s.jsx(Jp, {}) })
  ] }) });
}
function $p({
  label: c,
  value: r,
  unit: f,
  icon: o,
  size: m = "sm",
  className: h
}) {
  return /* @__PURE__ */ s.jsxs("div", { className: se("flex items-center justify-between", h), children: [
    /* @__PURE__ */ s.jsxs(
      "span",
      {
        className: se(
          "text-muted-foreground flex items-center gap-1.5",
          m === "sm" ? "text-xs" : m === "md" ? "text-sm" : "text-base"
        ),
        children: [
          o && /* @__PURE__ */ s.jsx(o, { className: "h-3.5 w-3.5" }),
          c
        ]
      }
    ),
    /* @__PURE__ */ s.jsxs(
      "span",
      {
        className: se(
          "font-medium tabular-nums",
          m === "sm" ? "text-sm" : m === "md" ? "text-base" : "text-lg"
        ),
        children: [
          r,
          f && /* @__PURE__ */ s.jsx("span", { className: "text-muted-foreground ml-0.5 text-xs", children: f })
        ]
      }
    )
  ] });
}
function Fp() {
  const { value: c } = V("sensor.starlink_downlink_throughput_mbps"), { value: r } = V("sensor.starlink_uplink_throughput_mbps"), { value: f } = V("sensor.speedtest_download"), { value: o } = V("sensor.speedtest_upload"), { value: m } = V("sensor.speedtest_ping"), h = pe("binary_sensor.starlink_ethernet_speeds"), g = (h == null ? void 0 : h.state) === "off", { open: y } = Gl();
  return /* @__PURE__ */ s.jsxs(Xe, { children: [
    /* @__PURE__ */ s.jsx(Pe, { className: "pb-2", children: /* @__PURE__ */ s.jsxs(et, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ s.jsx(Pv, { className: "h-4 w-4" }),
      "Internet"
    ] }) }),
    /* @__PURE__ */ s.jsxs(Ve, { className: "space-y-3", children: [
      /* @__PURE__ */ s.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ s.jsxs(
          "div",
          {
            className: "rounded-lg bg-muted/50 p-2.5 text-center cursor-pointer hover:bg-muted/80 transition-colors",
            onClick: () => y("sensor.starlink_downlink_throughput_mbps", "Download", "Mbps"),
            children: [
              /* @__PURE__ */ s.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Download" }),
              /* @__PURE__ */ s.jsx("p", { className: "text-xl font-bold tabular-nums", children: G(c, 1) }),
              /* @__PURE__ */ s.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Mbps" })
            ]
          }
        ),
        /* @__PURE__ */ s.jsxs(
          "div",
          {
            className: "rounded-lg bg-muted/50 p-2.5 text-center cursor-pointer hover:bg-muted/80 transition-colors",
            onClick: () => y("sensor.starlink_uplink_throughput_mbps", "Upload", "Mbps"),
            children: [
              /* @__PURE__ */ s.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Upload" }),
              /* @__PURE__ */ s.jsx("p", { className: "text-xl font-bold tabular-nums", children: G(r, 1) }),
              /* @__PURE__ */ s.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Mbps" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ s.jsxs("div", { className: "grid gap-1", children: [
        /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.speedtest_download", label: "Speedtest DL", value: G(f, 1), unit: "Mbps", color: "#3b82f6" }),
        /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.speedtest_upload", label: "Speedtest UL", value: G(o, 1), unit: "Mbps", color: "#8b5cf6" }),
        /* @__PURE__ */ s.jsx(oe, { entityId: "sensor.speedtest_ping", label: "Ping", value: G(m, 0), unit: "ms", color: "#f59e0b" }),
        /* @__PURE__ */ s.jsx(
          $p,
          {
            label: "Ethernet",
            value: g ? "OK" : "Issues"
          }
        )
      ] })
    ] })
  ] });
}
function Ip() {
  return /* @__PURE__ */ s.jsxs(Xe, { children: [
    /* @__PURE__ */ s.jsx(Pe, { className: "pb-2", children: /* @__PURE__ */ s.jsx(et, { className: "text-base", children: "Modes" }) }),
    /* @__PURE__ */ s.jsx(Ve, { children: /* @__PURE__ */ s.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ s.jsx(
        Ct,
        {
          entityId: "input_boolean.power_saving_mode",
          name: "Eco",
          icon: zr,
          activeColor: "yellow"
        }
      ),
      /* @__PURE__ */ s.jsx(
        Ct,
        {
          entityId: "input_boolean.sleep_mode",
          name: "Sleep",
          icon: Ar,
          activeColor: "purple"
        }
      ),
      /* @__PURE__ */ s.jsx(
        Ct,
        {
          entityId: "input_boolean.shower_mode",
          name: "Shower",
          icon: $s,
          activeColor: "cyan"
        }
      )
    ] }) })
  ] });
}
function Pp() {
  Ha();
  const c = [
    { id: "light.led_controller_cct_1", name: "Main", color: !0 },
    { id: "light.led_controller_cct_2", name: "Under Cabinet", color: !0 },
    { id: "light.led_controller_sc_1", name: "Shower", color: !1 },
    { id: "light.led_controller_sc_2", name: "Accent", color: !1 }
  ];
  return /* @__PURE__ */ s.jsxs(Xe, { children: [
    /* @__PURE__ */ s.jsx(Pe, { className: "pb-2", children: /* @__PURE__ */ s.jsxs(et, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ s.jsx(ph, { className: "h-4 w-4" }),
      "Lights"
    ] }) }),
    /* @__PURE__ */ s.jsx(Ve, { className: "space-y-3", children: c.map((r) => /* @__PURE__ */ s.jsx(e1, { entityId: r.id, name: r.name }, r.id)) })
  ] });
}
function e1({ entityId: c, name: r }) {
  var _;
  const f = pe(c), o = fl(c), m = Ha(), h = (f == null ? void 0 : f.state) === "on", g = ((_ = f == null ? void 0 : f.attributes) == null ? void 0 : _.brightness) ?? 0, y = Math.round(g / 255 * 100);
  return /* @__PURE__ */ s.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ s.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ s.jsx("span", { className: "text-sm", children: r }),
      /* @__PURE__ */ s.jsxs("div", { className: "flex items-center gap-2", children: [
        h && /* @__PURE__ */ s.jsxs("span", { className: "text-xs text-muted-foreground tabular-nums", children: [
          y,
          "%"
        ] }),
        /* @__PURE__ */ s.jsx(_l, { checked: h, onCheckedChange: o })
      ] })
    ] }),
    h && /* @__PURE__ */ s.jsx(
      "input",
      {
        type: "range",
        min: 0,
        max: 100,
        value: y,
        onChange: (p) => m("light", "turn_on", { brightness_pct: Number(p.target.value) }, {
          entity_id: c
        }),
        className: `w-full h-1.5 rounded-full appearance-none cursor-pointer bg-secondary\r
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4\r
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary`
      }
    )
  ] });
}
function t1() {
  return /* @__PURE__ */ s.jsxs(Xe, { children: [
    /* @__PURE__ */ s.jsx(Pe, { className: "pb-2", children: /* @__PURE__ */ s.jsx(et, { className: "text-base", children: "Switches" }) }),
    /* @__PURE__ */ s.jsx(Ve, { children: /* @__PURE__ */ s.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ s.jsx(
        Ct,
        {
          entityId: "switch.a32_pro_do8_switch06_top_monitor",
          name: "Top Monitor",
          icon: Zm,
          activeColor: "blue"
        }
      ),
      /* @__PURE__ */ s.jsx(
        Ct,
        {
          entityId: "switch.a32_pro_do8_switch07_bottom_monitor",
          name: "Bottom Mon",
          icon: Zm,
          activeColor: "blue"
        }
      ),
      /* @__PURE__ */ s.jsx(
        Ct,
        {
          entityId: "switch.a32_pro_switch27_bed_power_supply",
          name: "Bed",
          icon: Kv,
          activeColor: "orange"
        }
      ),
      /* @__PURE__ */ s.jsx(
        Ct,
        {
          entityId: "switch.a32_pro_switch16_lpg_valve",
          name: "LPG",
          icon: Ws,
          activeColor: "red"
        }
      )
    ] }) })
  ] });
}
function l1() {
  const c = pe("input_boolean.windows_audio_stream"), r = fl("input_boolean.windows_audio_stream");
  return /* @__PURE__ */ s.jsx(Xe, { children: /* @__PURE__ */ s.jsx(Ve, { className: "pt-4", children: /* @__PURE__ */ s.jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ s.jsxs("span", { className: "text-sm flex items-center gap-1.5", children: [
      /* @__PURE__ */ s.jsx(ap, { className: "h-3.5 w-3.5" }),
      "Windows Audio Stream"
    ] }),
    /* @__PURE__ */ s.jsx(_l, { checked: (c == null ? void 0 : c.state) === "on", onCheckedChange: r })
  ] }) }) });
}
function a1() {
  return /* @__PURE__ */ s.jsx(wn, { title: "System", children: /* @__PURE__ */ s.jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: [
    /* @__PURE__ */ s.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ s.jsx(Fp, {}),
      /* @__PURE__ */ s.jsx(l1, {})
    ] }),
    /* @__PURE__ */ s.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ s.jsx(Ip, {}),
      /* @__PURE__ */ s.jsx(t1, {})
    ] }),
    /* @__PURE__ */ s.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ s.jsx(Pp, {}) })
  ] }) });
}
const Ch = {
  home: Th,
  power: Up,
  climate: qp,
  water: Gp,
  van: Wp,
  system: a1
}, n1 = [
  { id: "home", label: "Home", icon: ep },
  { id: "power", label: "Power", icon: Is },
  { id: "climate", label: "Climate", icon: Or },
  { id: "water", label: "Water", icon: Mn },
  { id: "van", label: "Van", icon: ip },
  { id: "system", label: "System", icon: up }
];
function eh() {
  const c = window.location.hash.slice(1);
  return c && c in Ch ? c : "home";
}
function u1() {
  const [c, r] = H.useState(!1);
  return H.useEffect(() => {
    var m, h;
    const f = () => {
      var y, _;
      const g = window.__HASS__;
      g != null && g.themes ? r(g.themes.darkMode ?? !1) : r(((_ = (y = window.matchMedia) == null ? void 0 : y.call(window, "(prefers-color-scheme: dark)")) == null ? void 0 : _.matches) ?? !1);
    };
    window.addEventListener("hass-updated", f);
    const o = (m = window.matchMedia) == null ? void 0 : m.call(window, "(prefers-color-scheme: dark)");
    return (h = o == null ? void 0 : o.addEventListener) == null || h.call(o, "change", f), f(), () => {
      var g;
      window.removeEventListener("hass-updated", f), (g = o == null ? void 0 : o.removeEventListener) == null || g.call(o, "change", f);
    };
  }, []), c;
}
function s1() {
  const c = u1(), [r, f] = H.useState(eh);
  H.useEffect(() => {
    const h = () => f(eh());
    return window.addEventListener("hashchange", h), () => window.removeEventListener("hashchange", h);
  }, []);
  const o = H.useCallback((h) => {
    window.location.hash = h, f(h);
  }, []), m = Ch[r] ?? Th;
  return /* @__PURE__ */ s.jsx(nv, { children: /* @__PURE__ */ s.jsx("div", { className: `van-dash-root ${c ? "dark" : ""}`, style: { position: "relative" }, children: /* @__PURE__ */ s.jsx(mp, { children: /* @__PURE__ */ s.jsxs("div", { className: "h-screen flex flex-col bg-background text-foreground", children: [
    /* @__PURE__ */ s.jsx("nav", { className: "flex-none border-b border-border bg-card/80 backdrop-blur-sm", children: /* @__PURE__ */ s.jsx("div", { className: "flex items-center gap-1 px-2 h-11 overflow-x-auto", children: n1.map(({ id: h, label: g, icon: y }) => /* @__PURE__ */ s.jsxs(
      "button",
      {
        onClick: () => o(h),
        className: se(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
          r === h ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
        ),
        children: [
          /* @__PURE__ */ s.jsx(y, { className: "h-4 w-4" }),
          g
        ]
      },
      h
    )) }) }),
    /* @__PURE__ */ s.jsx("div", { className: "flex-1 overflow-auto", children: /* @__PURE__ */ s.jsx(m, {}) })
  ] }) }) }) });
}
const c1 = 1, Ks = 2, Sr = 3, i1 = 4, r1 = 5;
function o1(c) {
  return {
    type: "auth",
    access_token: c
  };
}
function f1() {
  return {
    type: "supported_features",
    id: 1,
    // Always the first message after auth
    features: { coalesce_messages: 1 }
  };
}
function d1() {
  return {
    type: "get_states"
  };
}
function m1(c, r, f, o, m) {
  const h = {
    type: "call_service",
    domain: c,
    service: r,
    target: o,
    return_response: m
  };
  return f && (h.service_data = f), h;
}
function h1(c) {
  const r = {
    type: "subscribe_events"
  };
  return c && (r.event_type = c), r;
}
function th(c) {
  return {
    type: "unsubscribe_events",
    subscription: c
  };
}
function g1() {
  return {
    type: "ping"
  };
}
function v1(c, r) {
  return {
    type: "result",
    success: !1,
    error: {
      code: c,
      message: r
    }
  };
}
const Oh = (c, r, f, o) => {
  const [m, h, g] = c.split(".", 3);
  return Number(m) > r || Number(m) === r && (o === void 0 ? Number(h) >= f : Number(h) > f) || o !== void 0 && Number(m) === r && Number(h) === f && Number(g) >= o;
}, p1 = "auth_invalid", y1 = "auth_ok";
function b1(c) {
  if (!c.auth)
    throw i1;
  const r = c.auth;
  let f = r.expired ? r.refreshAccessToken().then(() => {
    f = void 0;
  }, () => {
    f = void 0;
  }) : void 0;
  const o = r.wsUrl;
  function m(h, g, y) {
    const _ = new WebSocket(o);
    let p = !1;
    const j = () => {
      if (_.removeEventListener("close", j), p) {
        y(Ks);
        return;
      }
      if (h === 0) {
        y(c1);
        return;
      }
      const U = h === -1 ? -1 : h - 1;
      setTimeout(() => m(U, g, y), 1e3);
    }, z = async (U) => {
      try {
        r.expired && await (f || r.refreshAccessToken()), _.send(JSON.stringify(o1(r.accessToken)));
      } catch (L) {
        p = L === Ks, _.close();
      }
    }, B = async (U) => {
      const L = JSON.parse(U.data);
      switch (L.type) {
        case p1:
          p = !0, _.close();
          break;
        case y1:
          _.removeEventListener("open", z), _.removeEventListener("message", B), _.removeEventListener("close", j), _.removeEventListener("error", j), _.haVersion = L.ha_version, Oh(_.haVersion, 2022, 9) && _.send(JSON.stringify(f1())), g(_);
          break;
      }
    };
    _.addEventListener("open", z), _.addEventListener("message", B), _.addEventListener("close", j), _.addEventListener("error", j);
  }
  return new Promise((h, g) => m(c.setupRetry, h, g));
}
class x1 {
  constructor(r, f) {
    this._handleMessage = (o) => {
      let m = JSON.parse(o.data);
      Array.isArray(m) || (m = [m]), m.forEach((h) => {
        const g = this.commands.get(h.id);
        switch (h.type) {
          case "event":
            g ? g.callback(h.event) : (console.warn(`Received event for unknown subscription ${h.id}. Unsubscribing.`), this.sendMessagePromise(th(h.id)).catch((y) => {
            }));
            break;
          case "result":
            g && (h.success ? (g.resolve(h.result), "subscribe" in g || this.commands.delete(h.id)) : (g.reject(h.error), this.commands.delete(h.id)));
            break;
          case "pong":
            g ? (g.resolve(), this.commands.delete(h.id)) : console.warn(`Received unknown pong response ${h.id}`);
            break;
        }
      });
    }, this._handleClose = async () => {
      const o = this.commands;
      if (this.commandId = 1, this.oldSubscriptions = this.commands, this.commands = /* @__PURE__ */ new Map(), this.socket = void 0, o.forEach((g) => {
        "subscribe" in g || g.reject(v1(Sr, "Connection lost"));
      }), this.closeRequested)
        return;
      this.fireEvent("disconnected");
      const m = Object.assign(Object.assign({}, this.options), { setupRetry: 0 }), h = (g) => {
        setTimeout(async () => {
          if (!this.closeRequested)
            try {
              const y = await m.createSocket(m);
              this._setSocket(y);
            } catch (y) {
              if (this._queuedMessages) {
                const _ = this._queuedMessages;
                this._queuedMessages = void 0;
                for (const p of _)
                  p.reject && p.reject(Sr);
              }
              y === Ks ? this.fireEvent("reconnect-error", y) : h(g + 1);
            }
        }, Math.min(g, 5) * 1e3);
      };
      this.suspendReconnectPromise && (await this.suspendReconnectPromise, this.suspendReconnectPromise = void 0, this._queuedMessages = []), h(0);
    }, this.options = f, this.commandId = 2, this.commands = /* @__PURE__ */ new Map(), this.eventListeners = /* @__PURE__ */ new Map(), this.closeRequested = !1, this._setSocket(r);
  }
  get connected() {
    return this.socket !== void 0 && this.socket.readyState == this.socket.OPEN;
  }
  _setSocket(r) {
    this.socket = r, this.haVersion = r.haVersion, r.addEventListener("message", this._handleMessage), r.addEventListener("close", this._handleClose);
    const f = this.oldSubscriptions;
    f && (this.oldSubscriptions = void 0, f.forEach((m) => {
      "subscribe" in m && m.subscribe && m.subscribe().then((h) => {
        m.unsubscribe = h, m.resolve();
      });
    }));
    const o = this._queuedMessages;
    if (o) {
      this._queuedMessages = void 0;
      for (const m of o)
        m.resolve();
    }
    this.fireEvent("ready");
  }
  addEventListener(r, f) {
    let o = this.eventListeners.get(r);
    o || (o = [], this.eventListeners.set(r, o)), o.push(f);
  }
  removeEventListener(r, f) {
    const o = this.eventListeners.get(r);
    if (!o)
      return;
    const m = o.indexOf(f);
    m !== -1 && o.splice(m, 1);
  }
  fireEvent(r, f) {
    (this.eventListeners.get(r) || []).forEach((o) => o(this, f));
  }
  suspendReconnectUntil(r) {
    this.suspendReconnectPromise = r;
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
  reconnect(r = !1) {
    if (this.socket) {
      if (!r) {
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
  async subscribeEvents(r, f) {
    return this.subscribeMessage(r, h1(f));
  }
  ping() {
    return this.sendMessagePromise(g1());
  }
  sendMessage(r, f) {
    if (!this.connected)
      throw Sr;
    if (this._queuedMessages) {
      if (f)
        throw new Error("Cannot queue with commandId");
      this._queuedMessages.push({ resolve: () => this.sendMessage(r) });
      return;
    }
    f || (f = this._genCmdId()), r.id = f, this.socket.send(JSON.stringify(r));
  }
  sendMessagePromise(r) {
    return new Promise((f, o) => {
      if (this._queuedMessages) {
        this._queuedMessages.push({
          reject: o,
          resolve: async () => {
            try {
              f(await this.sendMessagePromise(r));
            } catch (h) {
              o(h);
            }
          }
        });
        return;
      }
      const m = this._genCmdId();
      this.commands.set(m, { resolve: f, reject: o }), this.sendMessage(r, m);
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
  async subscribeMessage(r, f, o) {
    if (this._queuedMessages && await new Promise((h, g) => {
      this._queuedMessages.push({ resolve: h, reject: g });
    }), o != null && o.preCheck && !await o.preCheck())
      throw new Error("Pre-check failed");
    let m;
    return await new Promise((h, g) => {
      const y = this._genCmdId();
      m = {
        resolve: h,
        reject: g,
        callback: r,
        subscribe: (o == null ? void 0 : o.resubscribe) !== !1 ? () => this.subscribeMessage(r, f, o) : void 0,
        unsubscribe: async () => {
          this.connected && await this.sendMessagePromise(th(y)), this.commands.delete(y);
        }
      }, this.commands.set(y, m);
      try {
        this.sendMessage(f, y);
      } catch {
      }
    }), () => m.unsubscribe();
  }
  _genCmdId() {
    return ++this.commandId;
  }
}
const _1 = (c) => c * 1e3 + Date.now();
async function S1(c, r, f) {
  const o = typeof location < "u" && location;
  if (o && o.protocol === "https:") {
    const y = document.createElement("a");
    if (y.href = c, y.protocol === "http:" && y.hostname !== "localhost")
      throw r1;
  }
  const m = new FormData();
  r !== null && m.append("client_id", r), Object.keys(f).forEach((y) => {
    m.append(y, f[y]);
  });
  const h = await fetch(`${c}/auth/token`, {
    method: "POST",
    credentials: "same-origin",
    body: m
  });
  if (!h.ok)
    throw h.status === 400 || h.status === 403 ? Ks : new Error("Unable to fetch tokens");
  const g = await h.json();
  return g.hassUrl = c, g.clientId = r, g.expires = _1(g.expires_in), g;
}
class j1 {
  constructor(r, f) {
    this.data = r, this._saveTokens = f;
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
    const r = await S1(this.data.hassUrl, this.data.clientId, {
      grant_type: "refresh_token",
      refresh_token: this.data.refresh_token
    });
    r.refresh_token = this.data.refresh_token, this.data = r, this._saveTokens && this._saveTokens(r);
  }
  /**
   * Revoke the refresh & access tokens.
   */
  async revoke() {
    if (!this.data.refresh_token)
      throw new Error("No refresh_token to revoke");
    const r = new FormData();
    r.append("token", this.data.refresh_token), await fetch(`${this.data.hassUrl}/auth/revoke`, {
      method: "POST",
      credentials: "same-origin",
      body: r
    }), this._saveTokens && this._saveTokens(null);
  }
}
function R1(c, r) {
  return new j1({
    hassUrl: c,
    clientId: null,
    expires: Date.now() + 1e11,
    refresh_token: "",
    access_token: r,
    expires_in: 1e11
  });
}
const N1 = (c) => {
  let r = [];
  function f(m) {
    let h = [];
    for (let g = 0; g < r.length; g++)
      r[g] === m ? m = null : h.push(r[g]);
    r = h;
  }
  function o(m, h) {
    c = h ? m : Object.assign(Object.assign({}, c), m);
    let g = r;
    for (let y = 0; y < g.length; y++)
      g[y](c);
  }
  return {
    get state() {
      return c;
    },
    /**
     * Create a bound copy of the given action function.
     * The bound returned function invokes action() and persists the result back to the store.
     * If the return value of `action` is a Promise, the resolved value will be used as state.
     * @param {Function} action	An action of the form `action(state, ...args) -> stateUpdate`
     * @returns {Function} boundAction()
     */
    action(m) {
      function h(g) {
        o(g, !1);
      }
      return function() {
        let g = [c];
        for (let _ = 0; _ < arguments.length; _++)
          g.push(arguments[_]);
        let y = m.apply(this, g);
        if (y != null)
          return y instanceof Promise ? y.then(h) : h(y);
      };
    },
    /**
     * Apply a partial state object to the current state, invoking registered listeners.
     * @param {Object} update				An object with properties to be merged into state
     * @param {Boolean} [overwrite=false]	If `true`, update will replace state instead of being merged into it
     */
    setState: o,
    clearState() {
      c = void 0;
    },
    /**
     * Register a listener function to be called whenever state is changed. Returns an `unsubscribe()` function.
     * @param {Function} listener	A function to call when state changes. Gets passed the new state.
     * @returns {Function} unsubscribe()
     */
    subscribe(m) {
      return r.push(m), () => {
        f(m);
      };
    }
    // /**
    //  * Remove a previously-registered listener function.
    //  * @param {Function} listener	The callback previously passed to `subscribe()` that should be removed.
    //  * @function
    //  */
    // unsubscribe,
  };
}, M1 = 5e3, lh = (c, r, f, o, m = { unsubGrace: !0 }) => {
  if (c[r])
    return c[r];
  let h = 0, g, y, _ = N1();
  const p = () => {
    if (!f)
      throw new Error("Collection does not support refresh");
    return f(c).then((X) => _.setState(X, !0));
  }, j = () => p().catch((X) => {
    if (c.connected)
      throw X;
  }), z = () => {
    if (y !== void 0) {
      clearTimeout(y), y = void 0;
      return;
    }
    o && (g = o(c, _)), f && (c.addEventListener("ready", j), j()), c.addEventListener("disconnected", L);
  }, B = () => {
    y = void 0, g && g.then((X) => {
      X();
    }), _.clearState(), c.removeEventListener("ready", p), c.removeEventListener("disconnected", L);
  }, U = () => {
    y = setTimeout(B, M1);
  }, L = () => {
    y && (clearTimeout(y), B());
  };
  return c[r] = {
    get state() {
      return _.state;
    },
    refresh: p,
    subscribe(X) {
      h++, h === 1 && z();
      const Z = _.subscribe(X);
      return _.state !== void 0 && setTimeout(() => X(_.state), 0), () => {
        Z(), h--, h || (m.unsubGrace ? U() : B());
      };
    }
  }, c[r];
}, w1 = (c) => c.sendMessagePromise(d1()), U1 = (c, r, f, o, m, h) => c.sendMessagePromise(m1(r, f, o, m, h));
function E1(c, r) {
  const f = Object.assign({}, c.state);
  if (r.a)
    for (const o in r.a) {
      const m = r.a[o];
      let h = new Date(m.lc * 1e3).toISOString();
      f[o] = {
        entity_id: o,
        state: m.s,
        attributes: m.a,
        context: typeof m.c == "string" ? { id: m.c, parent_id: null, user_id: null } : m.c,
        last_changed: h,
        last_updated: m.lu ? new Date(m.lu * 1e3).toISOString() : h
      };
    }
  if (r.r)
    for (const o of r.r)
      delete f[o];
  if (r.c)
    for (const o in r.c) {
      let m = f[o];
      if (!m) {
        console.warn("Received state update for unknown entity", o);
        continue;
      }
      m = Object.assign({}, m);
      const { "+": h, "-": g } = r.c[o], y = (h == null ? void 0 : h.a) || (g == null ? void 0 : g.a), _ = y ? Object.assign({}, m.attributes) : m.attributes;
      if (h && (h.s !== void 0 && (m.state = h.s), h.c && (typeof h.c == "string" ? m.context = Object.assign(Object.assign({}, m.context), { id: h.c }) : m.context = Object.assign(Object.assign({}, m.context), h.c)), h.lc ? m.last_updated = m.last_changed = new Date(h.lc * 1e3).toISOString() : h.lu && (m.last_updated = new Date(h.lu * 1e3).toISOString()), h.a && Object.assign(_, h.a)), g != null && g.a)
        for (const p of g.a)
          delete _[p];
      y && (m.attributes = _), f[o] = m;
    }
  c.setState(f, !0);
}
const T1 = (c, r) => c.subscribeMessage((f) => E1(r, f), {
  type: "subscribe_entities"
});
function z1(c, r) {
  const f = c.state;
  if (f === void 0)
    return;
  const { entity_id: o, new_state: m } = r.data;
  if (m)
    c.setState({ [m.entity_id]: m });
  else {
    const h = Object.assign({}, f);
    delete h[o], c.setState(h, !0);
  }
}
async function A1(c) {
  const r = await w1(c), f = {};
  for (let o = 0; o < r.length; o++) {
    const m = r[o];
    f[m.entity_id] = m;
  }
  return f;
}
const C1 = (c, r) => c.subscribeEvents((f) => z1(r, f), "state_changed"), O1 = (c) => Oh(c.haVersion, 2022, 4, 0) ? lh(c, "_ent", void 0, T1) : lh(c, "_ent", A1, C1), H1 = (c, r) => O1(c).subscribe(r);
async function B1(c) {
  const r = Object.assign({ setupRetry: 0, createSocket: b1 }, c), f = await r.createSocket(r);
  return new x1(f, r);
}
function q1(c) {
  const r = av.createRoot(c);
  return r.render(/* @__PURE__ */ s.jsx(s1, {})), () => r.unmount();
}
export {
  U1 as callService,
  B1 as createConnection,
  R1 as createLongLivedTokenAuth,
  q1 as mount,
  H1 as subscribeEntities
};
