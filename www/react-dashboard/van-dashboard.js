var Cy = Object.defineProperty;
var zy = (a, s, r) => s in a ? Cy(a, s, { enumerable: !0, configurable: !0, writable: !0, value: r }) : a[s] = r;
var Nr = (a, s, r) => zy(a, typeof s != "symbol" ? s + "" : s, r);
var vo = { exports: {} }, Ys = {};
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
function ky() {
  if (i0) return Ys;
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
  return Ys.Fragment = s, Ys.jsx = r, Ys.jsxs = r, Ys;
}
var r0;
function Oy() {
  return r0 || (r0 = 1, vo.exports = ky()), vo.exports;
}
var o = Oy(), xo = { exports: {} }, Gs = {}, _o = { exports: {} }, bo = {};
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
function Ry() {
  return c0 || (c0 = 1, (function(a) {
    function s(C, q) {
      var F = C.length;
      C.push(q);
      e: for (; 0 < F; ) {
        var ve = F - 1 >>> 1, je = C[ve];
        if (0 < f(je, q))
          C[ve] = q, C[F] = je, F = ve;
        else break e;
      }
    }
    function r(C) {
      return C.length === 0 ? null : C[0];
    }
    function u(C) {
      if (C.length === 0) return null;
      var q = C[0], F = C.pop();
      if (F !== q) {
        C[0] = F;
        e: for (var ve = 0, je = C.length, b = je >>> 1; ve < b; ) {
          var R = 2 * (ve + 1) - 1, Y = C[R], $ = R + 1, me = C[$];
          if (0 > f(Y, F))
            $ < je && 0 > f(me, Y) ? (C[ve] = me, C[$] = F, ve = $) : (C[ve] = Y, C[R] = F, ve = R);
          else if ($ < je && 0 > f(me, F))
            C[ve] = me, C[$] = F, ve = $;
          else break e;
        }
      }
      return q;
    }
    function f(C, q) {
      var F = C.sortIndex - q.sortIndex;
      return F !== 0 ? F : C.id - q.id;
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
    var y = [], g = [], x = 1, _ = null, S = 3, j = !1, T = !1, H = !1, L = !1, V = typeof setTimeout == "function" ? setTimeout : null, I = typeof clearTimeout == "function" ? clearTimeout : null, X = typeof setImmediate < "u" ? setImmediate : null;
    function P(C) {
      for (var q = r(g); q !== null; ) {
        if (q.callback === null) u(g);
        else if (q.startTime <= C)
          u(g), q.sortIndex = q.expirationTime, s(y, q);
        else break;
        q = r(g);
      }
    }
    function ee(C) {
      if (H = !1, P(C), !T)
        if (r(y) !== null)
          T = !0, W || (W = !0, te());
        else {
          var q = r(g);
          q !== null && we(ee, q.startTime - C);
        }
    }
    var W = !1, J = -1, K = 5, ce = -1;
    function ge() {
      return L ? !0 : !(a.unstable_now() - ce < K);
    }
    function se() {
      if (L = !1, W) {
        var C = a.unstable_now();
        ce = C;
        var q = !0;
        try {
          e: {
            T = !1, H && (H = !1, I(J), J = -1), j = !0;
            var F = S;
            try {
              t: {
                for (P(C), _ = r(y); _ !== null && !(_.expirationTime > C && ge()); ) {
                  var ve = _.callback;
                  if (typeof ve == "function") {
                    _.callback = null, S = _.priorityLevel;
                    var je = ve(
                      _.expirationTime <= C
                    );
                    if (C = a.unstable_now(), typeof je == "function") {
                      _.callback = je, P(C), q = !0;
                      break t;
                    }
                    _ === r(y) && u(y), P(C);
                  } else u(y);
                  _ = r(y);
                }
                if (_ !== null) q = !0;
                else {
                  var b = r(g);
                  b !== null && we(
                    ee,
                    b.startTime - C
                  ), q = !1;
                }
              }
              break e;
            } finally {
              _ = null, S = F, j = !1;
            }
            q = void 0;
          }
        } finally {
          q ? te() : W = !1;
        }
      }
    }
    var te;
    if (typeof X == "function")
      te = function() {
        X(se);
      };
    else if (typeof MessageChannel < "u") {
      var Me = new MessageChannel(), oe = Me.port2;
      Me.port1.onmessage = se, te = function() {
        oe.postMessage(null);
      };
    } else
      te = function() {
        V(se, 0);
      };
    function we(C, q) {
      J = V(function() {
        C(a.unstable_now());
      }, q);
    }
    a.unstable_IdlePriority = 5, a.unstable_ImmediatePriority = 1, a.unstable_LowPriority = 4, a.unstable_NormalPriority = 3, a.unstable_Profiling = null, a.unstable_UserBlockingPriority = 2, a.unstable_cancelCallback = function(C) {
      C.callback = null;
    }, a.unstable_forceFrameRate = function(C) {
      0 > C || 125 < C ? console.error(
        "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
      ) : K = 0 < C ? Math.floor(1e3 / C) : 5;
    }, a.unstable_getCurrentPriorityLevel = function() {
      return S;
    }, a.unstable_next = function(C) {
      switch (S) {
        case 1:
        case 2:
        case 3:
          var q = 3;
          break;
        default:
          q = S;
      }
      var F = S;
      S = q;
      try {
        return C();
      } finally {
        S = F;
      }
    }, a.unstable_requestPaint = function() {
      L = !0;
    }, a.unstable_runWithPriority = function(C, q) {
      switch (C) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          C = 3;
      }
      var F = S;
      S = C;
      try {
        return q();
      } finally {
        S = F;
      }
    }, a.unstable_scheduleCallback = function(C, q, F) {
      var ve = a.unstable_now();
      switch (typeof F == "object" && F !== null ? (F = F.delay, F = typeof F == "number" && 0 < F ? ve + F : ve) : F = ve, C) {
        case 1:
          var je = -1;
          break;
        case 2:
          je = 250;
          break;
        case 5:
          je = 1073741823;
          break;
        case 4:
          je = 1e4;
          break;
        default:
          je = 5e3;
      }
      return je = F + je, C = {
        id: x++,
        callback: q,
        priorityLevel: C,
        startTime: F,
        expirationTime: je,
        sortIndex: -1
      }, F > ve ? (C.sortIndex = F, s(g, C), r(y) === null && C === r(g) && (H ? (I(J), J = -1) : H = !0, we(ee, F - ve))) : (C.sortIndex = je, s(y, C), T || j || (T = !0, W || (W = !0, te()))), C;
    }, a.unstable_shouldYield = ge, a.unstable_wrapCallback = function(C) {
      var q = S;
      return function() {
        var F = S;
        S = q;
        try {
          return C.apply(this, arguments);
        } finally {
          S = F;
        }
      };
    };
  })(bo)), bo;
}
var u0;
function Dy() {
  return u0 || (u0 = 1, _o.exports = Ry()), _o.exports;
}
var wo = { exports: {} }, ye = {};
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
  if (o0) return ye;
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
  }, H = Object.assign, L = {};
  function V(b, R, Y) {
    this.props = b, this.context = R, this.refs = L, this.updater = Y || T;
  }
  V.prototype.isReactComponent = {}, V.prototype.setState = function(b, R) {
    if (typeof b != "object" && typeof b != "function" && b != null)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, b, R, "setState");
  }, V.prototype.forceUpdate = function(b) {
    this.updater.enqueueForceUpdate(this, b, "forceUpdate");
  };
  function I() {
  }
  I.prototype = V.prototype;
  function X(b, R, Y) {
    this.props = b, this.context = R, this.refs = L, this.updater = Y || T;
  }
  var P = X.prototype = new I();
  P.constructor = X, H(P, V.prototype), P.isPureReactComponent = !0;
  var ee = Array.isArray;
  function W() {
  }
  var J = { H: null, A: null, T: null, S: null }, K = Object.prototype.hasOwnProperty;
  function ce(b, R, Y) {
    var $ = Y.ref;
    return {
      $$typeof: a,
      type: b,
      key: R,
      ref: $ !== void 0 ? $ : null,
      props: Y
    };
  }
  function ge(b, R) {
    return ce(b.type, R, b.props);
  }
  function se(b) {
    return typeof b == "object" && b !== null && b.$$typeof === a;
  }
  function te(b) {
    var R = { "=": "=0", ":": "=2" };
    return "$" + b.replace(/[=:]/g, function(Y) {
      return R[Y];
    });
  }
  var Me = /\/+/g;
  function oe(b, R) {
    return typeof b == "object" && b !== null && b.key != null ? te("" + b.key) : R.toString(36);
  }
  function we(b) {
    switch (b.status) {
      case "fulfilled":
        return b.value;
      case "rejected":
        throw b.reason;
      default:
        switch (typeof b.status == "string" ? b.then(W, W) : (b.status = "pending", b.then(
          function(R) {
            b.status === "pending" && (b.status = "fulfilled", b.value = R);
          },
          function(R) {
            b.status === "pending" && (b.status = "rejected", b.reason = R);
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
  function C(b, R, Y, $, me) {
    var Q = typeof b;
    (Q === "undefined" || Q === "boolean") && (b = null);
    var fe = !1;
    if (b === null) fe = !0;
    else
      switch (Q) {
        case "bigint":
        case "string":
        case "number":
          fe = !0;
          break;
        case "object":
          switch (b.$$typeof) {
            case a:
            case s:
              fe = !0;
              break;
            case x:
              return fe = b._init, C(
                fe(b._payload),
                R,
                Y,
                $,
                me
              );
          }
      }
    if (fe)
      return me = me(b), fe = $ === "" ? "." + oe(b, 0) : $, ee(me) ? (Y = "", fe != null && (Y = fe.replace(Me, "$&/") + "/"), C(me, R, Y, "", function(_t) {
        return _t;
      })) : me != null && (se(me) && (me = ge(
        me,
        Y + (me.key == null || b && b.key === me.key ? "" : ("" + me.key).replace(
          Me,
          "$&/"
        ) + "/") + fe
      )), R.push(me)), 1;
    fe = 0;
    var Se = $ === "" ? "." : $ + ":";
    if (ee(b))
      for (var ke = 0; ke < b.length; ke++)
        $ = b[ke], Q = Se + oe($, ke), fe += C(
          $,
          R,
          Y,
          Q,
          me
        );
    else if (ke = j(b), typeof ke == "function")
      for (b = ke.call(b), ke = 0; !($ = b.next()).done; )
        $ = $.value, Q = Se + oe($, ke++), fe += C(
          $,
          R,
          Y,
          Q,
          me
        );
    else if (Q === "object") {
      if (typeof b.then == "function")
        return C(
          we(b),
          R,
          Y,
          $,
          me
        );
      throw R = String(b), Error(
        "Objects are not valid as a React child (found: " + (R === "[object Object]" ? "object with keys {" + Object.keys(b).join(", ") + "}" : R) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return fe;
  }
  function q(b, R, Y) {
    if (b == null) return b;
    var $ = [], me = 0;
    return C(b, $, "", "", function(Q) {
      return R.call(Y, Q, me++);
    }), $;
  }
  function F(b) {
    if (b._status === -1) {
      var R = b._result;
      R = R(), R.then(
        function(Y) {
          (b._status === 0 || b._status === -1) && (b._status = 1, b._result = Y);
        },
        function(Y) {
          (b._status === 0 || b._status === -1) && (b._status = 2, b._result = Y);
        }
      ), b._status === -1 && (b._status = 0, b._result = R);
    }
    if (b._status === 1) return b._result.default;
    throw b._result;
  }
  var ve = typeof reportError == "function" ? reportError : function(b) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var R = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof b == "object" && b !== null && typeof b.message == "string" ? String(b.message) : String(b),
        error: b
      });
      if (!window.dispatchEvent(R)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", b);
      return;
    }
    console.error(b);
  }, je = {
    map: q,
    forEach: function(b, R, Y) {
      q(
        b,
        function() {
          R.apply(this, arguments);
        },
        Y
      );
    },
    count: function(b) {
      var R = 0;
      return q(b, function() {
        R++;
      }), R;
    },
    toArray: function(b) {
      return q(b, function(R) {
        return R;
      }) || [];
    },
    only: function(b) {
      if (!se(b))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return b;
    }
  };
  return ye.Activity = _, ye.Children = je, ye.Component = V, ye.Fragment = r, ye.Profiler = f, ye.PureComponent = X, ye.StrictMode = u, ye.Suspense = y, ye.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = J, ye.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(b) {
      return J.H.useMemoCache(b);
    }
  }, ye.cache = function(b) {
    return function() {
      return b.apply(null, arguments);
    };
  }, ye.cacheSignal = function() {
    return null;
  }, ye.cloneElement = function(b, R, Y) {
    if (b == null)
      throw Error(
        "The argument must be a React element, but you passed " + b + "."
      );
    var $ = H({}, b.props), me = b.key;
    if (R != null)
      for (Q in R.key !== void 0 && (me = "" + R.key), R)
        !K.call(R, Q) || Q === "key" || Q === "__self" || Q === "__source" || Q === "ref" && R.ref === void 0 || ($[Q] = R[Q]);
    var Q = arguments.length - 2;
    if (Q === 1) $.children = Y;
    else if (1 < Q) {
      for (var fe = Array(Q), Se = 0; Se < Q; Se++)
        fe[Se] = arguments[Se + 2];
      $.children = fe;
    }
    return ce(b.type, me, $);
  }, ye.createContext = function(b) {
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
  }, ye.createElement = function(b, R, Y) {
    var $, me = {}, Q = null;
    if (R != null)
      for ($ in R.key !== void 0 && (Q = "" + R.key), R)
        K.call(R, $) && $ !== "key" && $ !== "__self" && $ !== "__source" && (me[$] = R[$]);
    var fe = arguments.length - 2;
    if (fe === 1) me.children = Y;
    else if (1 < fe) {
      for (var Se = Array(fe), ke = 0; ke < fe; ke++)
        Se[ke] = arguments[ke + 2];
      me.children = Se;
    }
    if (b && b.defaultProps)
      for ($ in fe = b.defaultProps, fe)
        me[$] === void 0 && (me[$] = fe[$]);
    return ce(b, Q, me);
  }, ye.createRef = function() {
    return { current: null };
  }, ye.forwardRef = function(b) {
    return { $$typeof: p, render: b };
  }, ye.isValidElement = se, ye.lazy = function(b) {
    return {
      $$typeof: x,
      _payload: { _status: -1, _result: b },
      _init: F
    };
  }, ye.memo = function(b, R) {
    return {
      $$typeof: g,
      type: b,
      compare: R === void 0 ? null : R
    };
  }, ye.startTransition = function(b) {
    var R = J.T, Y = {};
    J.T = Y;
    try {
      var $ = b(), me = J.S;
      me !== null && me(Y, $), typeof $ == "object" && $ !== null && typeof $.then == "function" && $.then(W, ve);
    } catch (Q) {
      ve(Q);
    } finally {
      R !== null && Y.types !== null && (R.types = Y.types), J.T = R;
    }
  }, ye.unstable_useCacheRefresh = function() {
    return J.H.useCacheRefresh();
  }, ye.use = function(b) {
    return J.H.use(b);
  }, ye.useActionState = function(b, R, Y) {
    return J.H.useActionState(b, R, Y);
  }, ye.useCallback = function(b, R) {
    return J.H.useCallback(b, R);
  }, ye.useContext = function(b) {
    return J.H.useContext(b);
  }, ye.useDebugValue = function() {
  }, ye.useDeferredValue = function(b, R) {
    return J.H.useDeferredValue(b, R);
  }, ye.useEffect = function(b, R) {
    return J.H.useEffect(b, R);
  }, ye.useEffectEvent = function(b) {
    return J.H.useEffectEvent(b);
  }, ye.useId = function() {
    return J.H.useId();
  }, ye.useImperativeHandle = function(b, R, Y) {
    return J.H.useImperativeHandle(b, R, Y);
  }, ye.useInsertionEffect = function(b, R) {
    return J.H.useInsertionEffect(b, R);
  }, ye.useLayoutEffect = function(b, R) {
    return J.H.useLayoutEffect(b, R);
  }, ye.useMemo = function(b, R) {
    return J.H.useMemo(b, R);
  }, ye.useOptimistic = function(b, R) {
    return J.H.useOptimistic(b, R);
  }, ye.useReducer = function(b, R, Y) {
    return J.H.useReducer(b, R, Y);
  }, ye.useRef = function(b) {
    return J.H.useRef(b);
  }, ye.useState = function(b) {
    return J.H.useState(b);
  }, ye.useSyncExternalStore = function(b, R, Y) {
    return J.H.useSyncExternalStore(
      b,
      R,
      Y
    );
  }, ye.useTransition = function() {
    return J.H.useTransition();
  }, ye.version = "19.2.5", ye;
}
var f0;
function $o() {
  return f0 || (f0 = 1, wo.exports = Hy()), wo.exports;
}
var So = { exports: {} }, At = {};
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
  if (d0) return At;
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
  return At.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = u, At.createPortal = function(y, g) {
    var x = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!g || g.nodeType !== 1 && g.nodeType !== 9 && g.nodeType !== 11)
      throw Error(s(299));
    return d(y, g, null, x);
  }, At.flushSync = function(y) {
    var g = m.T, x = u.p;
    try {
      if (m.T = null, u.p = 2, y) return y();
    } finally {
      m.T = g, u.p = x, u.d.f();
    }
  }, At.preconnect = function(y, g) {
    typeof y == "string" && (g ? (g = g.crossOrigin, g = typeof g == "string" ? g === "use-credentials" ? g : "" : void 0) : g = null, u.d.C(y, g));
  }, At.prefetchDNS = function(y) {
    typeof y == "string" && u.d.D(y);
  }, At.preinit = function(y, g) {
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
  }, At.preinitModule = function(y, g) {
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
  }, At.preload = function(y, g) {
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
  }, At.preloadModule = function(y, g) {
    if (typeof y == "string")
      if (g) {
        var x = p(g.as, g.crossOrigin);
        u.d.m(y, {
          as: typeof g.as == "string" && g.as !== "script" ? g.as : void 0,
          crossOrigin: x,
          integrity: typeof g.integrity == "string" ? g.integrity : void 0
        });
      } else u.d.m(y);
  }, At.requestFormReset = function(y) {
    u.d.r(y);
  }, At.unstable_batchedUpdates = function(y, g) {
    return y(g);
  }, At.useFormState = function(y, g, x) {
    return m.H.useFormState(y, g, x);
  }, At.useFormStatus = function() {
    return m.H.useHostTransitionStatus();
  }, At.version = "19.2.5", At;
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
  if (m0) return Gs;
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
  var _ = Object.assign, S = Symbol.for("react.element"), j = Symbol.for("react.transitional.element"), T = Symbol.for("react.portal"), H = Symbol.for("react.fragment"), L = Symbol.for("react.strict_mode"), V = Symbol.for("react.profiler"), I = Symbol.for("react.consumer"), X = Symbol.for("react.context"), P = Symbol.for("react.forward_ref"), ee = Symbol.for("react.suspense"), W = Symbol.for("react.suspense_list"), J = Symbol.for("react.memo"), K = Symbol.for("react.lazy"), ce = Symbol.for("react.activity"), ge = Symbol.for("react.memo_cache_sentinel"), se = Symbol.iterator;
  function te(e) {
    return e === null || typeof e != "object" ? null : (e = se && e[se] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var Me = Symbol.for("react.client.reference");
  function oe(e) {
    if (e == null) return null;
    if (typeof e == "function")
      return e.$$typeof === Me ? null : e.displayName || e.name || null;
    if (typeof e == "string") return e;
    switch (e) {
      case H:
        return "Fragment";
      case V:
        return "Profiler";
      case L:
        return "StrictMode";
      case ee:
        return "Suspense";
      case W:
        return "SuspenseList";
      case ce:
        return "Activity";
    }
    if (typeof e == "object")
      switch (e.$$typeof) {
        case T:
          return "Portal";
        case X:
          return e.displayName || "Context";
        case I:
          return (e._context.displayName || "Context") + ".Consumer";
        case P:
          var t = e.render;
          return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
        case J:
          return t = e.displayName || null, t !== null ? t : oe(e.type) || "Memo";
        case K:
          t = e._payload, e = e._init;
          try {
            return oe(e(t));
          } catch {
          }
      }
    return null;
  }
  var we = Array.isArray, C = s.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, q = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, F = {
    pending: !1,
    data: null,
    method: null,
    action: null
  }, ve = [], je = -1;
  function b(e) {
    return { current: e };
  }
  function R(e) {
    0 > je || (e.current = ve[je], ve[je] = null, je--);
  }
  function Y(e, t) {
    je++, ve[je] = e.current, e.current = t;
  }
  var $ = b(null), me = b(null), Q = b(null), fe = b(null);
  function Se(e, t) {
    switch (Y(Q, t), Y(me, e), Y($, null), t.nodeType) {
      case 9:
      case 11:
        e = (e = t.documentElement) && (e = e.namespaceURI) ? Am(e) : 0;
        break;
      default:
        if (e = t.tagName, t = t.namespaceURI)
          t = Am(t), e = Cm(t, e);
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
    R($), Y($, e);
  }
  function ke() {
    R($), R(me), R(Q);
  }
  function _t(e) {
    e.memoizedState !== null && Y(fe, e);
    var t = $.current, n = Cm(t, e.type);
    t !== n && (Y(me, e), Y($, n));
  }
  function Ze(e) {
    me.current === e && (R($), R(me)), fe.current === e && (R(fe), Us._currentValue = F);
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
  function Rt(e, t) {
    if (!e || ft) return "";
    ft = !0;
    var n = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      var l = {
        DetermineComponentFrameRoot: function() {
          try {
            if (t) {
              var B = function() {
                throw Error();
              };
              if (Object.defineProperty(B.prototype, "props", {
                set: function() {
                  throw Error();
                }
              }), typeof Reflect == "object" && Reflect.construct) {
                try {
                  Reflect.construct(B, []);
                } catch (k) {
                  var z = k;
                }
                Reflect.construct(e, [], B);
              } else {
                try {
                  B.call();
                } catch (k) {
                  z = k;
                }
                e.call(B.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (k) {
                z = k;
              }
              (B = e()) && typeof B.catch == "function" && B.catch(function() {
              });
            }
          } catch (k) {
            if (k && z && typeof k.stack == "string")
              return [k.stack, z.stack];
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
`), A = v.split(`
`);
        for (i = l = 0; l < w.length && !w[l].includes("DetermineComponentFrameRoot"); )
          l++;
        for (; i < A.length && !A[i].includes(
          "DetermineComponentFrameRoot"
        ); )
          i++;
        if (l === w.length || i === A.length)
          for (l = w.length - 1, i = A.length - 1; 1 <= l && 0 <= i && w[l] !== A[i]; )
            i--;
        for (; 1 <= l && 0 <= i; l--, i--)
          if (w[l] !== A[i]) {
            if (l !== 1 || i !== 1)
              do
                if (l--, i--, 0 > i || w[l] !== A[i]) {
                  var D = `
` + w[l].replace(" at new ", " at ");
                  return e.displayName && D.includes("<anonymous>") && (D = D.replace("<anonymous>", e.displayName)), D;
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
        return Rt(e.type, !1);
      case 11:
        return Rt(e.type.render, !1);
      case 1:
        return Rt(e.type, !0);
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
  var bt = Object.prototype.hasOwnProperty, re = a.unstable_scheduleCallback, Ke = a.unstable_cancelCallback, Ct = a.unstable_shouldYield, Vt = a.unstable_requestPaint, Re = a.unstable_now, nt = a.unstable_getCurrentPriorityLevel, wt = a.unstable_ImmediatePriority, gn = a.unstable_UserBlockingPriority, ln = a.unstable_NormalPriority, On = a.unstable_LowPriority, St = a.unstable_IdlePriority, Qt = a.log, Ne = a.unstable_setDisableYieldValue, Fe = null, Be = null;
  function Zt(e) {
    if (typeof Qt == "function" && Ne(e), Be && typeof Be.setStrictMode == "function")
      try {
        Be.setStrictMode(Fe, e);
      } catch {
      }
  }
  var zt = Math.clz32 ? Math.clz32 : Ja, ac = Math.log, di = Math.LN2;
  function Ja(e) {
    return e >>>= 0, e === 0 ? 32 : 31 - (ac(e) / di | 0) | 0;
  }
  var $a = 256, Al = 262144, Cl = 4194304;
  function kt(e) {
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
    return v !== 0 ? (l = v & ~c, l !== 0 ? i = kt(l) : (h &= v, h !== 0 ? i = kt(h) : n || (n = v & ~e, n !== 0 && (i = kt(n))))) : (v = l & ~c, v !== 0 ? i = kt(v) : h !== 0 ? i = kt(h) : n || (n = l & ~e, n !== 0 && (i = kt(n)))), i === 0 ? 0 : t !== 0 && t !== i && (t & c) === 0 && (c = i & -i, n = t & -t, c >= n || c === 32 && (n & 4194048) !== 0) ? t : i;
  }
  function Wa(e, t) {
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
    var e = Cl;
    return Cl <<= 1, (Cl & 62914560) === 0 && (Cl = 4194304), e;
  }
  function sc(e) {
    for (var t = [], n = 0; 31 > n; n++) t.push(e);
    return t;
  }
  function Fa(e, t) {
    e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
  }
  function vg(e, t, n, l, i, c) {
    var h = e.pendingLanes;
    e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
    var v = e.entanglements, w = e.expirationTimes, A = e.hiddenUpdates;
    for (n = h & ~n; 0 < n; ) {
      var D = 31 - zt(n), B = 1 << D;
      v[D] = 0, w[D] = -1;
      var z = A[D];
      if (z !== null)
        for (A[D] = null, D = 0; D < z.length; D++) {
          var k = z[D];
          k !== null && (k.lane &= -536870913);
        }
      n &= ~B;
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
    var e = q.p;
    return e !== 0 ? e : (e = window.event, e === void 0 ? 32 : Pm(e.type));
  }
  function pf(e, t) {
    var n = q.p;
    try {
      return q.p = e, t();
    } finally {
      q.p = n;
    }
  }
  var tl = Math.random().toString(36).slice(2), jt = "__reactFiber$" + tl, Dt = "__reactProps$" + tl, ta = "__reactContainer$" + tl, cc = "__reactEvents$" + tl, xg = "__reactListeners$" + tl, _g = "__reactHandles$" + tl, gf = "__reactResources$" + tl, Ia = "__reactMarker$" + tl;
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
  function Pa(e) {
    var t = e.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
    throw Error(u(33));
  }
  function aa(e) {
    var t = e[gf];
    return t || (t = e[gf] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() }), t;
  }
  function vt(e) {
    e[Ia] = !0;
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
  function Rn(e, t, n, l) {
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
        if (we(l)) {
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
  function Af(e, t, n) {
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
  function es(e, t) {
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
      var ts = {};
      Object.defineProperty(ts, "passive", {
        get: function() {
          yc = !0;
        }
      }), window.addEventListener("test", ts, ts), window.removeEventListener("test", ts, ts);
    } catch {
      yc = !1;
    }
  var nl = null, vc = null, yi = null;
  function Cf() {
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
  var kl = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function(e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  }, _i = Ht(kl), ns = _({}, kl, { view: 0, detail: 0 }), Eg = Ht(ns), xc, _c, ls, bi = _({}, ns, {
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
      return "movementX" in e ? e.movementX : (e !== ls && (ls && e.type === "mousemove" ? (xc = e.screenX - ls.screenX, _c = e.screenY - ls.screenY) : _c = xc = 0, ls = e), xc);
    },
    movementY: function(e) {
      return "movementY" in e ? e.movementY : _c;
    }
  }), kf = Ht(bi), Ag = _({}, bi, { dataTransfer: 0 }), Cg = Ht(Ag), zg = _({}, ns, { relatedTarget: 0 }), bc = Ht(zg), kg = _({}, kl, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), Og = Ht(kg), Rg = _({}, kl, {
    clipboardData: function(e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    }
  }), Dg = Ht(Rg), Hg = _({}, kl, { data: 0 }), Of = Ht(Hg), Ug = {
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
  var Yg = _({}, ns, {
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
  }), Rf = Ht(Xg), Vg = _({}, ns, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: wc
  }), Qg = Ht(Vg), Zg = _({}, kl, {
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
  }), $g = Ht(Jg), Wg = _({}, kl, {
    newState: 0,
    oldState: 0
  }), Fg = Ht(Wg), Ig = [9, 13, 27, 32], Sc = Hn && "CompositionEvent" in window, as = null;
  Hn && "documentMode" in document && (as = document.documentMode);
  var Pg = Hn && "TextEvent" in window && !as, Df = Hn && (!Sc || as && 8 < as && 11 >= as), Hf = " ", Uf = !1;
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
      return e === "compositionend" || !Sc && Lf(e, t) ? (e = Cf(), yi = vc = nl = null, oa = !1, e) : null;
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
  var ss = null, is = null;
  function l1(e) {
    Sm(e, 0);
  }
  function wi(e) {
    var t = Pa(e);
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
    ss && (ss.detachEvent("onpropertychange", Zf), is = ss = null);
  }
  function Zf(e) {
    if (e.propertyName === "value" && wi(is)) {
      var t = [];
      Yf(
        t,
        is,
        e,
        pc(e)
      ), Af(l1, t);
    }
  }
  function a1(e, t, n) {
    e === "focusin" ? (Qf(), ss = t, is = n, ss.attachEvent("onpropertychange", Zf)) : e === "focusout" && Qf();
  }
  function s1(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown")
      return wi(is);
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
  function rs(e, t) {
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
  var u1 = Hn && "documentMode" in document && 11 >= document.documentMode, fa = null, Tc = null, cs = null, Ec = !1;
  function Ff(e, t, n) {
    var l = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
    Ec || fa == null || fa !== pi(l) || (l = fa, "selectionStart" in l && Mc(l) ? l = { start: l.selectionStart, end: l.selectionEnd } : (l = (l.ownerDocument && l.ownerDocument.defaultView || window).getSelection(), l = {
      anchorNode: l.anchorNode,
      anchorOffset: l.anchorOffset,
      focusNode: l.focusNode,
      focusOffset: l.focusOffset
    }), cs && rs(cs, l) || (cs = l, l = or(Tc, "onSelect"), 0 < l.length && (t = new _i(
      "onSelect",
      "select",
      null,
      t,
      n
    ), e.push({ event: t, listeners: l }), t.target = fa)));
  }
  function Ol(e, t) {
    var n = {};
    return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
  }
  var da = {
    animationend: Ol("Animation", "AnimationEnd"),
    animationiteration: Ol("Animation", "AnimationIteration"),
    animationstart: Ol("Animation", "AnimationStart"),
    transitionrun: Ol("Transition", "TransitionRun"),
    transitionstart: Ol("Transition", "TransitionStart"),
    transitioncancel: Ol("Transition", "TransitionCancel"),
    transitionend: Ol("Transition", "TransitionEnd")
  }, Ac = {}, If = {};
  Hn && (If = document.createElement("div").style, "AnimationEvent" in window || (delete da.animationend.animation, delete da.animationiteration.animation, delete da.animationstart.animation), "TransitionEvent" in window || delete da.transitionend.transition);
  function Rl(e) {
    if (Ac[e]) return Ac[e];
    if (!da[e]) return e;
    var t = da[e], n;
    for (n in t)
      if (t.hasOwnProperty(n) && n in If)
        return Ac[e] = t[n];
    return e;
  }
  var Pf = Rl("animationend"), ed = Rl("animationiteration"), td = Rl("animationstart"), o1 = Rl("transitionrun"), f1 = Rl("transitionstart"), d1 = Rl("transitioncancel"), nd = Rl("transitionend"), ld = /* @__PURE__ */ new Map(), Cc = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
    " "
  );
  Cc.push("scrollEnd");
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
  function kc(e, t, n, l) {
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
    if (50 < Cs)
      throw Cs = 0, Yu = null, Error(u(185));
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
  function Oc(e) {
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
    if (l = e, typeof e == "function") Oc(e) && (h = 1);
    else if (typeof e == "string")
      h = vy(
        e,
        n,
        $.current
      ) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
    else
      e: switch (e) {
        case ce:
          return e = Jt(31, n, t, i), e.elementType = ce, e.lanes = c, e;
        case H:
          return Hl(n.children, i, c, t);
        case L:
          h = 8, i |= 24;
          break;
        case V:
          return e = Jt(12, n, t, i | 2), e.elementType = V, e.lanes = c, e;
        case ee:
          return e = Jt(13, n, t, i), e.elementType = ee, e.lanes = c, e;
        case W:
          return e = Jt(19, n, t, i), e.elementType = W, e.lanes = c, e;
        default:
          if (typeof e == "object" && e !== null)
            switch (e.$$typeof) {
              case X:
                h = 10;
                break e;
              case I:
                h = 9;
                break e;
              case P:
                h = 11;
                break e;
              case J:
                h = 14;
                break e;
              case K:
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
  function Rc(e, t, n) {
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
  var pa = [], ga = 0, Ei = null, us = 0, on = [], fn = 0, ll = null, jn = 1, Nn = "";
  function Ln(e, t) {
    pa[ga++] = us, pa[ga++] = Ei, Ei = e, us = t;
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
      Ei = pa[--ga], pa[ga] = null, us = pa[--ga], pa[ga] = null;
    for (; e === ll; )
      ll = on[--fn], on[fn] = null, Nn = on[--fn], on[fn] = null, jn = on[--fn], on[fn] = null;
  }
  function ud(e, t) {
    on[fn++] = jn, on[fn++] = Nn, on[fn++] = ll, jn = t.id, Nn = t.overflow, ll = e;
  }
  var Nt = null, Pe = null, ze = !1, al = null, dn = !1, Lc = Error(u(519));
  function sl(e) {
    var t = Error(
      u(
        418,
        1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML",
        ""
      )
    );
    throw os(un(t, e)), Lc;
  }
  function od(e) {
    var t = e.stateNode, n = e.type, l = e.memoizedProps;
    switch (t[jt] = e, t[Dt] = l, n) {
      case "dialog":
        Ee("cancel", t), Ee("close", t);
        break;
      case "iframe":
      case "object":
      case "embed":
        Ee("load", t);
        break;
      case "video":
      case "audio":
        for (n = 0; n < ks.length; n++)
          Ee(ks[n], t);
        break;
      case "source":
        Ee("error", t);
        break;
      case "img":
      case "image":
      case "link":
        Ee("error", t), Ee("load", t);
        break;
      case "details":
        Ee("toggle", t);
        break;
      case "input":
        Ee("invalid", t), Sf(
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
        Ee("invalid", t);
        break;
      case "textarea":
        Ee("invalid", t), Nf(t, l.value, l.defaultValue, l.children);
    }
    n = l.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || l.suppressHydrationWarning === !0 || Tm(t.textContent, n) ? (l.popover != null && (Ee("beforetoggle", t), Ee("toggle", t)), l.onScroll != null && Ee("scroll", t), l.onScrollEnd != null && Ee("scrollend", t), l.onClick != null && (t.onclick = Dn), t = !0) : t = !1, t || sl(e, !0);
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
    if (!ze) return fd(e), ze = !0, !1;
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
    Pe = Nt = null, ze = !1;
  }
  function Bc() {
    var e = al;
    return e !== null && (qt === null ? qt = e : qt.push.apply(
      qt,
      e
    ), al = null), e;
  }
  function os(e) {
    al === null ? al = [e] : al.push(e);
  }
  var qc = b(null), Ll = null, Bn = null;
  function il(e, t, n) {
    Y(qc, t._currentValue), t._currentValue = n;
  }
  function qn(e) {
    e._currentValue = qc.current, R(qc);
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
      } else if (i === fe.current) {
        if (h = i.alternate, h === null) throw Error(u(387));
        h.memoizedState.memoizedState !== i.memoizedState.memoizedState && (e !== null ? e.push(Us) : e = [Us]);
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
  function Ai(e) {
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
  function Ci(e, t) {
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
    $$typeof: X,
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
  function fs(e) {
    e.refCount--, e.refCount === 0 && p1(g1, function() {
      e.controller.abort();
    });
  }
  var ds = null, Vc = 0, xa = 0, _a = null;
  function y1(e, t) {
    if (ds === null) {
      var n = ds = [];
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
    if (--Vc === 0 && ds !== null) {
      _a !== null && (_a.status = "fulfilled");
      var e = ds;
      ds = null, xa = 0, _a = null;
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
  var md = C.S;
  C.S = function(e, t) {
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
  var ba = Error(u(460)), Zc = Error(u(474)), ki = Error(u(542)), Oi = { then: function() {
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
    if (e === ba || e === ki)
      throw Error(u(483));
  }
  var wa = null, hs = 0;
  function Ri(e) {
    var t = hs;
    return hs += 1, wa === null && (wa = []), yd(wa, e, t);
  }
  function ms(e, t) {
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
    function v(M, N, E, U) {
      return N === null || N.tag !== 6 ? (N = Rc(E, M.mode, U), N.return = M, N) : (N = i(N, E), N.return = M, N);
    }
    function w(M, N, E, U) {
      var ue = E.type;
      return ue === H ? D(
        M,
        N,
        E.props.children,
        U,
        E.key
      ) : N !== null && (N.elementType === ue || typeof ue == "object" && ue !== null && ue.$$typeof === K && Yl(ue) === N.type) ? (N = i(N, E.props), ms(N, E), N.return = M, N) : (N = Ti(
        E.type,
        E.key,
        E.props,
        null,
        M.mode,
        U
      ), ms(N, E), N.return = M, N);
    }
    function A(M, N, E, U) {
      return N === null || N.tag !== 4 || N.stateNode.containerInfo !== E.containerInfo || N.stateNode.implementation !== E.implementation ? (N = Dc(E, M.mode, U), N.return = M, N) : (N = i(N, E.children || []), N.return = M, N);
    }
    function D(M, N, E, U, ue) {
      return N === null || N.tag !== 7 ? (N = Hl(
        E,
        M.mode,
        U,
        ue
      ), N.return = M, N) : (N = i(N, E), N.return = M, N);
    }
    function B(M, N, E) {
      if (typeof N == "string" && N !== "" || typeof N == "number" || typeof N == "bigint")
        return N = Rc(
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
            ), ms(E, N), E.return = M, E;
          case T:
            return N = Dc(
              N,
              M.mode,
              E
            ), N.return = M, N;
          case K:
            return N = Yl(N), B(M, N, E);
        }
        if (we(N) || te(N))
          return N = Hl(
            N,
            M.mode,
            E,
            null
          ), N.return = M, N;
        if (typeof N.then == "function")
          return B(M, Ri(N), E);
        if (N.$$typeof === X)
          return B(
            M,
            Ci(M, N),
            E
          );
        Di(M, N);
      }
      return null;
    }
    function z(M, N, E, U) {
      var ue = N !== null ? N.key : null;
      if (typeof E == "string" && E !== "" || typeof E == "number" || typeof E == "bigint")
        return ue !== null ? null : v(M, N, "" + E, U);
      if (typeof E == "object" && E !== null) {
        switch (E.$$typeof) {
          case j:
            return E.key === ue ? w(M, N, E, U) : null;
          case T:
            return E.key === ue ? A(M, N, E, U) : null;
          case K:
            return E = Yl(E), z(M, N, E, U);
        }
        if (we(E) || te(E))
          return ue !== null ? null : D(M, N, E, U, null);
        if (typeof E.then == "function")
          return z(
            M,
            N,
            Ri(E),
            U
          );
        if (E.$$typeof === X)
          return z(
            M,
            N,
            Ci(M, E),
            U
          );
        Di(M, E);
      }
      return null;
    }
    function k(M, N, E, U, ue) {
      if (typeof U == "string" && U !== "" || typeof U == "number" || typeof U == "bigint")
        return M = M.get(E) || null, v(N, M, "" + U, ue);
      if (typeof U == "object" && U !== null) {
        switch (U.$$typeof) {
          case j:
            return M = M.get(
              U.key === null ? E : U.key
            ) || null, w(N, M, U, ue);
          case T:
            return M = M.get(
              U.key === null ? E : U.key
            ) || null, A(N, M, U, ue);
          case K:
            return U = Yl(U), k(
              M,
              N,
              E,
              U,
              ue
            );
        }
        if (we(U) || te(U))
          return M = M.get(E) || null, D(N, M, U, ue, null);
        if (typeof U.then == "function")
          return k(
            M,
            N,
            E,
            Ri(U),
            ue
          );
        if (U.$$typeof === X)
          return k(
            M,
            N,
            E,
            Ci(N, U),
            ue
          );
        Di(N, U);
      }
      return null;
    }
    function ne(M, N, E, U) {
      for (var ue = null, De = null, le = N, _e = N = 0, Ce = null; le !== null && _e < E.length; _e++) {
        le.index > _e ? (Ce = le, le = null) : Ce = le.sibling;
        var He = z(
          M,
          le,
          E[_e],
          U
        );
        if (He === null) {
          le === null && (le = Ce);
          break;
        }
        e && le && He.alternate === null && t(M, le), N = c(He, N, _e), De === null ? ue = He : De.sibling = He, De = He, le = Ce;
      }
      if (_e === E.length)
        return n(M, le), ze && Ln(M, _e), ue;
      if (le === null) {
        for (; _e < E.length; _e++)
          le = B(M, E[_e], U), le !== null && (N = c(
            le,
            N,
            _e
          ), De === null ? ue = le : De.sibling = le, De = le);
        return ze && Ln(M, _e), ue;
      }
      for (le = l(le); _e < E.length; _e++)
        Ce = k(
          le,
          M,
          _e,
          E[_e],
          U
        ), Ce !== null && (e && Ce.alternate !== null && le.delete(
          Ce.key === null ? _e : Ce.key
        ), N = c(
          Ce,
          N,
          _e
        ), De === null ? ue = Ce : De.sibling = Ce, De = Ce);
      return e && le.forEach(function(jl) {
        return t(M, jl);
      }), ze && Ln(M, _e), ue;
    }
    function de(M, N, E, U) {
      if (E == null) throw Error(u(151));
      for (var ue = null, De = null, le = N, _e = N = 0, Ce = null, He = E.next(); le !== null && !He.done; _e++, He = E.next()) {
        le.index > _e ? (Ce = le, le = null) : Ce = le.sibling;
        var jl = z(M, le, He.value, U);
        if (jl === null) {
          le === null && (le = Ce);
          break;
        }
        e && le && jl.alternate === null && t(M, le), N = c(jl, N, _e), De === null ? ue = jl : De.sibling = jl, De = jl, le = Ce;
      }
      if (He.done)
        return n(M, le), ze && Ln(M, _e), ue;
      if (le === null) {
        for (; !He.done; _e++, He = E.next())
          He = B(M, He.value, U), He !== null && (N = c(He, N, _e), De === null ? ue = He : De.sibling = He, De = He);
        return ze && Ln(M, _e), ue;
      }
      for (le = l(le); !He.done; _e++, He = E.next())
        He = k(le, M, _e, He.value, U), He !== null && (e && He.alternate !== null && le.delete(He.key === null ? _e : He.key), N = c(He, N, _e), De === null ? ue = He : De.sibling = He, De = He);
      return e && le.forEach(function(Ay) {
        return t(M, Ay);
      }), ze && Ln(M, _e), ue;
    }
    function Qe(M, N, E, U) {
      if (typeof E == "object" && E !== null && E.type === H && E.key === null && (E = E.props.children), typeof E == "object" && E !== null) {
        switch (E.$$typeof) {
          case j:
            e: {
              for (var ue = E.key; N !== null; ) {
                if (N.key === ue) {
                  if (ue = E.type, ue === H) {
                    if (N.tag === 7) {
                      n(
                        M,
                        N.sibling
                      ), U = i(
                        N,
                        E.props.children
                      ), U.return = M, M = U;
                      break e;
                    }
                  } else if (N.elementType === ue || typeof ue == "object" && ue !== null && ue.$$typeof === K && Yl(ue) === N.type) {
                    n(
                      M,
                      N.sibling
                    ), U = i(N, E.props), ms(U, E), U.return = M, M = U;
                    break e;
                  }
                  n(M, N);
                  break;
                } else t(M, N);
                N = N.sibling;
              }
              E.type === H ? (U = Hl(
                E.props.children,
                M.mode,
                U,
                E.key
              ), U.return = M, M = U) : (U = Ti(
                E.type,
                E.key,
                E.props,
                null,
                M.mode,
                U
              ), ms(U, E), U.return = M, M = U);
            }
            return h(M);
          case T:
            e: {
              for (ue = E.key; N !== null; ) {
                if (N.key === ue)
                  if (N.tag === 4 && N.stateNode.containerInfo === E.containerInfo && N.stateNode.implementation === E.implementation) {
                    n(
                      M,
                      N.sibling
                    ), U = i(N, E.children || []), U.return = M, M = U;
                    break e;
                  } else {
                    n(M, N);
                    break;
                  }
                else t(M, N);
                N = N.sibling;
              }
              U = Dc(E, M.mode, U), U.return = M, M = U;
            }
            return h(M);
          case K:
            return E = Yl(E), Qe(
              M,
              N,
              E,
              U
            );
        }
        if (we(E))
          return ne(
            M,
            N,
            E,
            U
          );
        if (te(E)) {
          if (ue = te(E), typeof ue != "function") throw Error(u(150));
          return E = ue.call(E), de(
            M,
            N,
            E,
            U
          );
        }
        if (typeof E.then == "function")
          return Qe(
            M,
            N,
            Ri(E),
            U
          );
        if (E.$$typeof === X)
          return Qe(
            M,
            N,
            Ci(M, E),
            U
          );
        Di(M, E);
      }
      return typeof E == "string" && E !== "" || typeof E == "number" || typeof E == "bigint" ? (E = "" + E, N !== null && N.tag === 6 ? (n(M, N.sibling), U = i(N, E), U.return = M, M = U) : (n(M, N), U = Rc(E, M.mode, U), U.return = M, M = U), h(M)) : n(M, N);
    }
    return function(M, N, E, U) {
      try {
        hs = 0;
        var ue = Qe(
          M,
          N,
          E,
          U
        );
        return wa = null, ue;
      } catch (le) {
        if (le === ba || le === ki) throw le;
        var De = Jt(29, le, null, M.mode);
        return De.lanes = U, De.return = M, De;
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
  function ps(e, t, n) {
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
  function gs() {
    if (Wc) {
      var e = _a;
      if (e !== null) throw e;
    }
  }
  function ys(e, t, n, l) {
    Wc = !1;
    var i = e.updateQueue;
    rl = !1;
    var c = i.firstBaseUpdate, h = i.lastBaseUpdate, v = i.shared.pending;
    if (v !== null) {
      i.shared.pending = null;
      var w = v, A = w.next;
      w.next = null, h === null ? c = A : h.next = A, h = w;
      var D = e.alternate;
      D !== null && (D = D.updateQueue, v = D.lastBaseUpdate, v !== h && (v === null ? D.firstBaseUpdate = A : v.next = A, D.lastBaseUpdate = w));
    }
    if (c !== null) {
      var B = i.baseState;
      h = 0, D = A = w = null, v = c;
      do {
        var z = v.lane & -536870913, k = z !== v.lane;
        if (k ? (Ae & z) === z : (l & z) === z) {
          z !== 0 && z === xa && (Wc = !0), D !== null && (D = D.next = {
            lane: 0,
            tag: v.tag,
            payload: v.payload,
            callback: null,
            next: null
          });
          e: {
            var ne = e, de = v;
            z = t;
            var Qe = n;
            switch (de.tag) {
              case 1:
                if (ne = de.payload, typeof ne == "function") {
                  B = ne.call(Qe, B, z);
                  break e;
                }
                B = ne;
                break e;
              case 3:
                ne.flags = ne.flags & -65537 | 128;
              case 0:
                if (ne = de.payload, z = typeof ne == "function" ? ne.call(Qe, B, z) : ne, z == null) break e;
                B = _({}, B, z);
                break e;
              case 2:
                rl = !0;
            }
          }
          z = v.callback, z !== null && (e.flags |= 64, k && (e.flags |= 8192), k = i.callbacks, k === null ? i.callbacks = [z] : k.push(z));
        } else
          k = {
            lane: z,
            tag: v.tag,
            payload: v.payload,
            callback: v.callback,
            next: null
          }, D === null ? (A = D = k, w = B) : D = D.next = k, h |= z;
        if (v = v.next, v === null) {
          if (v = i.shared.pending, v === null)
            break;
          k = v, v = k.next, k.next = null, i.lastBaseUpdate = k, i.shared.pending = null;
        }
      } while (!0);
      D === null && (w = B), i.baseState = w, i.firstBaseUpdate = A, i.lastBaseUpdate = D, c === null && (i.shared.lanes = 0), ml |= h, e.lanes = h, e.memoizedState = B;
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
    $n = Hi.current, R(Sa), R(Hi);
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
    R($t), hn === e && (hn = null), R(ut);
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
  var Yn = 0, xe = null, Xe = null, ht = null, Li = !1, ja = !1, Vl = !1, Bi = 0, vs = 0, Na = null, x1 = 0;
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
    return Yn = c, xe = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, C.H = e === null || e.memoizedState === null ? ch : gu, Vl = !1, c = n(l, i), Vl = !1, ja && (c = Td(
      t,
      n,
      l,
      i
    )), Md(e), c;
  }
  function Md(e) {
    C.H = bs;
    var t = Xe !== null && Xe.next !== null;
    if (Yn = 0, ht = Xe = xe = null, Li = !1, vs = 0, Na = null, t) throw Error(u(300));
    e === null || mt || (e = e.dependencies, e !== null && Ai(e) && (mt = !0));
  }
  function Td(e, t, n, l) {
    xe = e;
    var i = 0;
    do {
      if (ja && (Na = null), vs = 0, ja = !1, 25 <= i) throw Error(u(301));
      if (i += 1, ht = Xe = null, e.updateQueue != null) {
        var c = e.updateQueue;
        c.lastEffect = null, c.events = null, c.stores = null, c.memoCache != null && (c.memoCache.index = 0);
      }
      C.H = uh, c = t(n, l);
    } while (ja);
    return c;
  }
  function _1() {
    var e = C.H, t = e.useState()[0];
    return t = typeof t.then == "function" ? xs(t) : t, e = e.useState()[0], (Xe !== null ? Xe.memoizedState : null) !== e && (xe.flags |= 1024), t;
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
    Yn = 0, ht = Xe = xe = null, ja = !1, vs = Bi = 0, Na = null;
  }
  function Ot() {
    var e = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null
    };
    return ht === null ? xe.memoizedState = ht = e : ht = ht.next = e, ht;
  }
  function ot() {
    if (Xe === null) {
      var e = xe.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = Xe.next;
    var t = ht === null ? xe.memoizedState : ht.next;
    if (t !== null)
      ht = t, Xe = e;
    else {
      if (e === null)
        throw xe.alternate === null ? Error(u(467)) : Error(u(310));
      Xe = e, e = {
        memoizedState: Xe.memoizedState,
        baseState: Xe.baseState,
        baseQueue: Xe.baseQueue,
        queue: Xe.queue,
        next: null
      }, ht === null ? xe.memoizedState = ht = e : ht = ht.next = e;
    }
    return ht;
  }
  function qi() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function xs(e) {
    var t = vs;
    return vs += 1, Na === null && (Na = []), e = yd(Na, e, t), t = xe, (ht === null ? t.memoizedState : ht.next) === null && (t = t.alternate, C.H = t === null || t.memoizedState === null ? ch : gu), e;
  }
  function Yi(e) {
    if (e !== null && typeof e == "object") {
      if (typeof e.then == "function") return xs(e);
      if (e.$$typeof === X) return Mt(e);
    }
    throw Error(u(438, String(e)));
  }
  function su(e) {
    var t = null, n = xe.updateQueue;
    if (n !== null && (t = n.memoCache), t == null) {
      var l = xe.alternate;
      l !== null && (l = l.updateQueue, l !== null && (l = l.memoCache, l != null && (t = {
        data: l.data.map(function(i) {
          return i.slice();
        }),
        index: 0
      })));
    }
    if (t == null && (t = { data: [], index: 0 }), n === null && (n = qi(), xe.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0)
      for (n = t.data[t.index] = Array(e), l = 0; l < e; l++)
        n[l] = ge;
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
      var v = h = null, w = null, A = t, D = !1;
      do {
        var B = A.lane & -536870913;
        if (B !== A.lane ? (Ae & B) === B : (Yn & B) === B) {
          var z = A.revertLane;
          if (z === 0)
            w !== null && (w = w.next = {
              lane: 0,
              revertLane: 0,
              gesture: null,
              action: A.action,
              hasEagerState: A.hasEagerState,
              eagerState: A.eagerState,
              next: null
            }), B === xa && (D = !0);
          else if ((Yn & z) === z) {
            A = A.next, z === xa && (D = !0);
            continue;
          } else
            B = {
              lane: 0,
              revertLane: A.revertLane,
              gesture: null,
              action: A.action,
              hasEagerState: A.hasEagerState,
              eagerState: A.eagerState,
              next: null
            }, w === null ? (v = w = B, h = c) : w = w.next = B, xe.lanes |= z, ml |= z;
          B = A.action, Vl && n(c, B), c = A.hasEagerState ? A.eagerState : n(c, B);
        } else
          z = {
            lane: B,
            revertLane: A.revertLane,
            gesture: A.gesture,
            action: A.action,
            hasEagerState: A.hasEagerState,
            eagerState: A.eagerState,
            next: null
          }, w === null ? (v = w = z, h = c) : w = w.next = z, xe.lanes |= B, ml |= B;
        A = A.next;
      } while (A !== null && A !== t);
      if (w === null ? h = c : w.next = v, !Kt(c, e.memoizedState) && (mt = !0, D && (n = _a, n !== null)))
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
    var l = xe, i = ot(), c = ze;
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
        Cd.bind(
          null,
          l,
          i,
          n,
          t
        ),
        null
      ), Je === null) throw Error(u(349));
      c || (Yn & 127) !== 0 || Ad(l, t, n);
    }
    return n;
  }
  function Ad(e, t, n) {
    e.flags |= 16384, e = { getSnapshot: t, value: n }, t = xe.updateQueue, t === null ? (t = qi(), xe.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
  }
  function Cd(e, t, n, l) {
    t.value = n, t.getSnapshot = l, kd(t) && Od(e);
  }
  function zd(e, t, n) {
    return n(function() {
      kd(t) && Od(e);
    });
  }
  function kd(e) {
    var t = e.getSnapshot;
    e = e.value;
    try {
      var n = t();
      return !Kt(e, n);
    } catch {
      return !0;
    }
  }
  function Od(e) {
    var t = Dl(e, 2);
    t !== null && Yt(t, e, 2);
  }
  function cu(e) {
    var t = Ot();
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
  function Rd(e, t, n, l) {
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
      C.T !== null ? n(!0) : c.isTransition = !1, l(c), n = t.pending, n === null ? (c.next = t.pending = c, Dd(t, c)) : (c.next = n.next, t.pending = n.next = c);
    }
  }
  function Dd(e, t) {
    var n = t.action, l = t.payload, i = e.state;
    if (t.isTransition) {
      var c = C.T, h = {};
      C.T = h;
      try {
        var v = n(i, l), w = C.S;
        w !== null && w(h, v), Hd(e, t, v);
      } catch (A) {
        uu(e, t, A);
      } finally {
        c !== null && h.types !== null && (c.types = h.types), C.T = c;
      }
    } else
      try {
        c = n(i, l), Hd(e, t, c);
      } catch (A) {
        uu(e, t, A);
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
    if (ze) {
      var n = Je.formState;
      if (n !== null) {
        e: {
          var l = xe;
          if (ze) {
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
    return n = Ot(), n.memoizedState = n.baseState = t, l = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Bd,
      lastRenderedState: t
    }, n.queue = l, n = sh.bind(
      null,
      xe,
      l
    ), l.dispatch = n, l = cu(!1), c = pu.bind(
      null,
      xe,
      !1,
      l.queue
    ), l = Ot(), i = {
      state: t,
      dispatch: null,
      action: e,
      pending: null
    }, l.queue = i, n = b1.bind(
      null,
      xe,
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
        var l = xs(t);
      } catch (h) {
        throw h === ba ? ki : h;
      }
    else l = t;
    t = ot();
    var i = t.queue, c = i.dispatch;
    return n !== t.memoizedState && (xe.flags |= 2048, Ma(
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
    return e = { tag: e, create: n, deps: l, inst: t, next: null }, t = xe.updateQueue, t === null && (t = qi(), xe.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (l = n.next, n.next = e, e.next = l, t.lastEffect = e), e;
  }
  function Vd() {
    return ot().memoizedState;
  }
  function Xi(e, t, n, l) {
    var i = Ot();
    xe.flags |= e, i.memoizedState = Ma(
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
    Xe !== null && l !== null && eu(l, Xe.memoizedState.deps) ? i.memoizedState = Ma(t, c, n, l) : (xe.flags |= e, i.memoizedState = Ma(
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
    xe.flags |= 4;
    var t = xe.updateQueue;
    if (t === null)
      t = qi(), xe.updateQueue = t, t.events = [e];
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
    return n === void 0 || (Yn & 1073741824) !== 0 && (Ae & 261930) === 0 ? e.memoizedState = t : (e.memoizedState = n, e = Ph(), xe.lanes |= e, ml |= e, n);
  }
  function Pd(e, t, n, l) {
    return Kt(n, t) ? n : Sa.current !== null ? (e = du(e, n, l), Kt(e, t) || (mt = !0), e) : (Yn & 42) === 0 || (Yn & 1073741824) !== 0 && (Ae & 261930) === 0 ? (mt = !0, e.memoizedState = n) : (e = Ph(), xe.lanes |= e, ml |= e, t);
  }
  function eh(e, t, n, l, i) {
    var c = q.p;
    q.p = c !== 0 && 8 > c ? c : 8;
    var h = C.T, v = {};
    C.T = v, pu(e, !1, t, n);
    try {
      var w = i(), A = C.S;
      if (A !== null && A(v, w), w !== null && typeof w == "object" && typeof w.then == "function") {
        var D = v1(
          w,
          l
        );
        _s(
          e,
          t,
          D,
          Pt(e)
        );
      } else
        _s(
          e,
          t,
          l,
          Pt(e)
        );
    } catch (B) {
      _s(
        e,
        t,
        { then: function() {
        }, status: "rejected", reason: B },
        Pt()
      );
    } finally {
      q.p = c, h !== null && v.types !== null && (h.types = v.types), C.T = h;
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
      F,
      n === null ? j1 : function() {
        return nh(e), n(l);
      }
    );
  }
  function th(e) {
    var t = e.memoizedState;
    if (t !== null) return t;
    t = {
      memoizedState: F,
      baseState: F,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Gn,
        lastRenderedState: F
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
    t.next === null && (t = e.alternate.memoizedState), _s(
      e,
      t.next.queue,
      {},
      Pt()
    );
  }
  function mu() {
    return Mt(Us);
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
          l !== null && (Yt(l, t, n), ps(l, t, n)), t = { cache: Xc() }, e.payload = t;
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
    }, Qi(e) ? ih(t, n) : (n = kc(e, t, n, l), n !== null && (Yt(n, e, l), rh(n, t, l)));
  }
  function sh(e, t, n) {
    var l = Pt();
    _s(e, t, n, l);
  }
  function _s(e, t, n, l) {
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
      if (n = kc(e, t, i, l), n !== null)
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
      t = kc(
        e,
        n,
        l,
        2
      ), t !== null && Yt(t, e, 2);
  }
  function Qi(e) {
    var t = e.alternate;
    return e === xe || t !== null && t === xe;
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
  var bs = {
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
  bs.useEffectEvent = it;
  var ch = {
    readContext: Mt,
    use: Yi,
    useCallback: function(e, t) {
      return Ot().memoizedState = [
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
      var n = Ot();
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
      var l = Ot();
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
        xe,
        e
      ), [l.memoizedState, e];
    },
    useRef: function(e) {
      var t = Ot();
      return e = { current: e }, t.memoizedState = e;
    },
    useState: function(e) {
      e = cu(e);
      var t = e.queue, n = sh.bind(null, xe, t);
      return t.dispatch = n, [e.memoizedState, n];
    },
    useDebugValue: fu,
    useDeferredValue: function(e, t) {
      var n = Ot();
      return du(n, e, t);
    },
    useTransition: function() {
      var e = cu(!1);
      return e = eh.bind(
        null,
        xe,
        e.queue,
        !0,
        !1
      ), Ot().memoizedState = e, [!1, e];
    },
    useSyncExternalStore: function(e, t, n) {
      var l = xe, i = Ot();
      if (ze) {
        if (n === void 0)
          throw Error(u(407));
        n = n();
      } else {
        if (n = t(), Je === null)
          throw Error(u(349));
        (Ae & 127) !== 0 || Ad(l, t, n);
      }
      i.memoizedState = n;
      var c = { value: n, getSnapshot: t };
      return i.queue = c, Qd(zd.bind(null, l, c, e), [
        e
      ]), l.flags |= 2048, Ma(
        9,
        { destroy: void 0 },
        Cd.bind(
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
      var e = Ot(), t = Je.identifierPrefix;
      if (ze) {
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
      var t = Ot();
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
        xe,
        !0,
        n
      ), n.dispatch = t, [e, t];
    },
    useMemoCache: su,
    useCacheRefresh: function() {
      return Ot().memoizedState = N1.bind(
        null,
        xe
      );
    },
    useEffectEvent: function(e) {
      var t = Ot(), n = { impl: e };
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
        typeof e == "boolean" ? e : xs(e),
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
      return Rd(n, Xe, e, t);
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
        typeof e == "boolean" ? e : xs(e),
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
      return Xe !== null ? Rd(n, Xe, e, t) : (n.baseState = e, [e, n.queue.dispatch]);
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
      i.payload = t, n != null && (i.callback = n), t = ul(e, i, l), t !== null && (Yt(t, e, l), ps(t, e, l));
    },
    enqueueReplaceState: function(e, t, n) {
      e = e._reactInternals;
      var l = Pt(), i = cl(l);
      i.tag = 1, i.payload = t, n != null && (i.callback = n), t = ul(e, i, l), t !== null && (Yt(t, e, l), ps(t, e, l));
    },
    enqueueForceUpdate: function(e, t) {
      e = e._reactInternals;
      var n = Pt(), l = cl(n);
      l.tag = 2, t != null && (l.callback = t), t = ul(e, l, n), t !== null && (Yt(t, e, n), ps(t, e, n));
    }
  };
  function oh(e, t, n, l, i, c, h) {
    return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(l, c, h) : t.prototype && t.prototype.isPureReactComponent ? !rs(n, l) || !rs(i, c) : !0;
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
            return hn === null ? ar() : n.alternate === null && rt === 0 && (rt = 3), n.flags &= -257, n.flags |= 65536, n.lanes = i, l === Oi ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = /* @__PURE__ */ new Set([l]) : t.add(l), Vu(e, l, i)), !1;
          case 22:
            return n.flags |= 65536, l === Oi ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
              transitions: null,
              markerInstances: null,
              retryQueue: /* @__PURE__ */ new Set([l])
            }, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = /* @__PURE__ */ new Set([l]) : n.add(l)), Vu(e, l, i)), !1;
        }
        throw Error(u(435, n.tag));
      }
      return Vu(e, l, i), ar(), !1;
    }
    if (ze)
      return t = $t.current, t !== null ? ((t.flags & 65536) === 0 && (t.flags |= 256), t.flags |= 65536, t.lanes = i, l !== Lc && (e = Error(u(422), { cause: l }), os(un(e, n)))) : (l !== Lc && (t = Error(u(423), {
        cause: l
      }), os(
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
    ), v = nu(), e !== null && !mt ? (lu(e, t, i), Xn(e, t, i)) : (ze && v && Hc(t), t.flags |= 1, Tt(e, t, l, i), t.child);
  }
  function xh(e, t, n, l, i) {
    if (e === null) {
      var c = n.type;
      return typeof c == "function" && !Oc(c) && c.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = c, _h(
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
      if (n = n.compare, n = n !== null ? n : rs, n(h, l) && e.ref === t.ref)
        return Xn(e, t, i);
    }
    return t.flags |= 1, e = Un(c, l), e.ref = t.ref, e.return = t, t.child = e;
  }
  function _h(e, t, n, l, i) {
    if (e !== null) {
      var c = e.memoizedProps;
      if (rs(c, l) && e.ref === t.ref)
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
  function ws(e, t) {
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
      if (ze) {
        if (l.mode === "hidden")
          return e = Ki(t, l), t.lanes = 536870912, ws(null, e);
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
        e = c.treeContext, Pe = mn(h.nextSibling), Nt = t, ze = !0, al = null, dn = !1, e !== null && ud(t, e), t = Ki(t, l), t.flags |= 4096;
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
    ), l = nu(), e !== null && !mt ? (lu(e, t, i), Xn(e, t, i)) : (ze && l && Hc(t), t.flags |= 1, Tt(e, t, n, i), t.child);
  }
  function jh(e, t, n, l, i, c) {
    return Bl(t), t.updateQueue = null, n = Td(
      t,
      l,
      n,
      i
    ), Md(e), l = nu(), e !== null && !mt ? (lu(e, t, c), Xn(e, t, c)) : (ze && l && Hc(t), t.flags |= 1, Tt(e, t, n, c), t.child);
  }
  function Nh(e, t, n, l, i) {
    if (Bl(t), t.stateNode === null) {
      var c = ma, h = n.contextType;
      typeof h == "object" && h !== null && (c = Mt(h)), c = new n(l, c), t.memoizedState = c.state !== null && c.state !== void 0 ? c.state : null, c.updater = vu, t.stateNode = c, c._reactInternals = t, c = t.stateNode, c.props = l, c.state = t.memoizedState, c.refs = {}, Kc(t), h = n.contextType, c.context = typeof h == "object" && h !== null ? Mt(h) : ma, c.state = t.memoizedState, h = n.getDerivedStateFromProps, typeof h == "function" && (yu(
        t,
        n,
        h,
        l
      ), c.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof c.getSnapshotBeforeUpdate == "function" || typeof c.UNSAFE_componentWillMount != "function" && typeof c.componentWillMount != "function" || (h = c.state, typeof c.componentWillMount == "function" && c.componentWillMount(), typeof c.UNSAFE_componentWillMount == "function" && c.UNSAFE_componentWillMount(), h !== c.state && vu.enqueueReplaceState(c, c.state, null), ys(t, l, c, i), gs(), c.state = t.memoizedState), typeof c.componentDidMount == "function" && (t.flags |= 4194308), l = !0;
    } else if (e === null) {
      c = t.stateNode;
      var v = t.memoizedProps, w = Ql(n, v);
      c.props = w;
      var A = c.context, D = n.contextType;
      h = ma, typeof D == "object" && D !== null && (h = Mt(D));
      var B = n.getDerivedStateFromProps;
      D = typeof B == "function" || typeof c.getSnapshotBeforeUpdate == "function", v = t.pendingProps !== v, D || typeof c.UNSAFE_componentWillReceiveProps != "function" && typeof c.componentWillReceiveProps != "function" || (v || A !== h) && fh(
        t,
        c,
        l,
        h
      ), rl = !1;
      var z = t.memoizedState;
      c.state = z, ys(t, l, c, i), gs(), A = t.memoizedState, v || z !== A || rl ? (typeof B == "function" && (yu(
        t,
        n,
        B,
        l
      ), A = t.memoizedState), (w = rl || oh(
        t,
        n,
        w,
        l,
        z,
        A,
        h
      )) ? (D || typeof c.UNSAFE_componentWillMount != "function" && typeof c.componentWillMount != "function" || (typeof c.componentWillMount == "function" && c.componentWillMount(), typeof c.UNSAFE_componentWillMount == "function" && c.UNSAFE_componentWillMount()), typeof c.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof c.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = l, t.memoizedState = A), c.props = l, c.state = A, c.context = h, l = w) : (typeof c.componentDidMount == "function" && (t.flags |= 4194308), l = !1);
    } else {
      c = t.stateNode, Jc(e, t), h = t.memoizedProps, D = Ql(n, h), c.props = D, B = t.pendingProps, z = c.context, A = n.contextType, w = ma, typeof A == "object" && A !== null && (w = Mt(A)), v = n.getDerivedStateFromProps, (A = typeof v == "function" || typeof c.getSnapshotBeforeUpdate == "function") || typeof c.UNSAFE_componentWillReceiveProps != "function" && typeof c.componentWillReceiveProps != "function" || (h !== B || z !== w) && fh(
        t,
        c,
        l,
        w
      ), rl = !1, z = t.memoizedState, c.state = z, ys(t, l, c, i), gs();
      var k = t.memoizedState;
      h !== B || z !== k || rl || e !== null && e.dependencies !== null && Ai(e.dependencies) ? (typeof v == "function" && (yu(
        t,
        n,
        v,
        l
      ), k = t.memoizedState), (D = rl || oh(
        t,
        n,
        D,
        l,
        z,
        k,
        w
      ) || e !== null && e.dependencies !== null && Ai(e.dependencies)) ? (A || typeof c.UNSAFE_componentWillUpdate != "function" && typeof c.componentWillUpdate != "function" || (typeof c.componentWillUpdate == "function" && c.componentWillUpdate(l, k, w), typeof c.UNSAFE_componentWillUpdate == "function" && c.UNSAFE_componentWillUpdate(
        l,
        k,
        w
      )), typeof c.componentDidUpdate == "function" && (t.flags |= 4), typeof c.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof c.componentDidUpdate != "function" || h === e.memoizedProps && z === e.memoizedState || (t.flags |= 4), typeof c.getSnapshotBeforeUpdate != "function" || h === e.memoizedProps && z === e.memoizedState || (t.flags |= 1024), t.memoizedProps = l, t.memoizedState = k), c.props = l, c.state = k, c.context = w, l = D) : (typeof c.componentDidUpdate != "function" || h === e.memoizedProps && z === e.memoizedState || (t.flags |= 4), typeof c.getSnapshotBeforeUpdate != "function" || h === e.memoizedProps && z === e.memoizedState || (t.flags |= 1024), l = !1);
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
      if (ze) {
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
      ), t.memoizedState = wu, ws(null, l)) : (ol(t), Nu(t, v));
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
        ), t.memoizedState = wu, t = ws(null, l));
      else if (ol(t), io(v)) {
        if (h = v.nextSibling && v.nextSibling.dataset, h) var A = h.dgst;
        h = A, l = Error(u(419)), l.stack = "", l.digest = h, os({ value: l, source: null, stack: null }), t = Mu(
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
        ), Nt = t, ze = !0, al = null, dn = !1, e !== null && ud(t, e), t = Nu(
          t,
          l.children
        ), t.flags |= 4096);
      return t;
    }
    return i ? (fl(), v = l.fallback, i = t.mode, w = e.child, A = w.sibling, l = Un(w, {
      mode: "hidden",
      children: l.children
    }), l.subtreeFlags = w.subtreeFlags & 65011712, A !== null ? v = Un(
      A,
      v
    ) : (v = Hl(
      v,
      i,
      n,
      null
    ), v.flags |= 2), v.return = t, l.return = t, l.sibling = v, t.child = l, ws(null, l), l = t.child, v = e.child.memoizedState, v === null ? v = Su(n) : (i = v.cachePool, i !== null ? (w = dt._currentValue, i = i.parent !== w ? { parent: w, pool: w } : i) : i = pd(), v = {
      baseLanes: v.baseLanes | n,
      cachePool: i
    }), l.memoizedState = v, l.childLanes = ju(
      e,
      h,
      n
    ), t.memoizedState = wu, ws(e.child, l)) : (ol(t), n = e.child, e = n.sibling, n = Un(n, {
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
  function Ah(e, t, n) {
    var l = t.pendingProps, i = l.revealOrder, c = l.tail;
    l = l.children;
    var h = ut.current, v = (h & 2) !== 0;
    if (v ? (h = h & 1 | 2, t.flags |= 128) : h &= 1, Y(ut, h), Tt(e, t, l, n), l = ze ? us : 0, !v && e !== null && (e.flags & 128) !== 0)
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
    return (e.lanes & t) !== 0 ? !0 : (e = e.dependencies, !!(e !== null && Ai(e)));
  }
  function A1(e, t, n) {
    switch (t.tag) {
      case 3:
        Se(t, t.stateNode.containerInfo), il(t, dt, e.memoizedState.cache), Ul();
        break;
      case 27:
      case 5:
        _t(t);
        break;
      case 4:
        Se(t, t.stateNode.containerInfo);
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
            return Ah(
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
  function Ch(e, t, n) {
    if (e !== null)
      if (e.memoizedProps !== t.pendingProps)
        mt = !0;
      else {
        if (!Eu(e, n) && (t.flags & 128) === 0)
          return mt = !1, A1(
            e,
            t,
            n
          );
        mt = (e.flags & 131072) !== 0;
      }
    else
      mt = !1, ze && (t.flags & 1048576) !== 0 && cd(t, us, t.index);
    switch (t.lanes = 0, t.tag) {
      case 16:
        e: {
          var l = t.pendingProps;
          if (e = Yl(t.elementType), t.type = e, typeof e == "function")
            Oc(e) ? (l = Ql(e, l), t.tag = 1, t = Nh(
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
              if (i === P) {
                t.tag = 11, t = vh(
                  null,
                  t,
                  e,
                  l,
                  n
                );
                break e;
              } else if (i === J) {
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
            throw t = oe(e) || e, Error(u(306, t, ""));
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
          if (Se(
            t,
            t.stateNode.containerInfo
          ), e === null) throw Error(u(387));
          l = t.pendingProps;
          var c = t.memoizedState;
          i = c.element, Jc(e, t), ys(t, l, null, n);
          var h = t.memoizedState;
          if (l = h.cache, il(t, dt, l), l !== c.cache && Gc(
            t,
            [dt],
            n,
            !0
          ), gs(), l = h.element, c.isDehydrated)
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
              ), os(i), t = Mh(
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
              for (Pe = mn(e.firstChild), Nt = t, ze = !0, al = null, dn = !0, n = bd(
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
        )) ? t.memoizedState = n : ze || (n = t.type, e = t.pendingProps, l = fr(
          Q.current
        ).createElement(n), l[jt] = t, l[Dt] = e, Et(l, n, e), vt(l), t.stateNode = l) : t.memoizedState = Ym(
          t.type,
          e.memoizedProps,
          t.pendingProps,
          e.memoizedState
        ), null;
      case 27:
        return _t(t), e === null && ze && (l = t.stateNode = Lm(
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
        return e === null && ze && ((i = l = Pe) && (l = sy(
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
        ), Us._currentValue = i), Ji(e, t), Tt(e, t, l, n), t.child;
      case 6:
        return e === null && ze && ((e = n = Pe) && (n = iy(
          n,
          t.pendingProps,
          dn
        ), n !== null ? (t.stateNode = n, Nt = t, Pe = null, e = !0) : e = !1), e || sl(t)), null;
      case 13:
        return Th(e, t, n);
      case 4:
        return Se(
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
        return Ah(e, t, n);
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
        return Bl(t), l = Mt(dt), e === null ? (i = Qc(), i === null && (i = Je, c = Xc(), i.pooledCache = c, c.refCount++, c !== null && (i.pooledCacheLanes |= n), i = c), t.memoizedState = { parent: l, cache: i }, Kc(t), il(t, dt, i)) : ((e.lanes & n) !== 0 && (Jc(e, t), ys(t, null, null, n), gs()), i = e.memoizedState, c = t.memoizedState, i.parent !== l ? (i = { parent: l, cache: l }, t.memoizedState = i, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = i), il(t, dt, l)) : (l = c.cache, il(t, dt, l), l !== i.cache && Gc(
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
  function Au(e, t, n, l, i) {
    if ((t = (e.mode & 32) !== 0) && (t = !1), t) {
      if (e.flags |= 16777216, (i & 335544128) === i)
        if (e.stateNode.complete) e.flags |= 8192;
        else if (lm()) e.flags |= 8192;
        else
          throw Gl = Oi, Zc;
    } else e.flags &= -16777217;
  }
  function zh(e, t) {
    if (t.type !== "stylesheet" || (t.state.loading & 4) !== 0)
      e.flags &= -16777217;
    else if (e.flags |= 16777216, !Zm(t))
      if (lm()) e.flags |= 8192;
      else
        throw Gl = Oi, Zc;
  }
  function Wi(e, t) {
    t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag !== 22 ? of() : 536870912, e.lanes |= t, Ca |= t);
  }
  function Ss(e, t) {
    if (!ze)
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
  function C1(e, t, n) {
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
        return n = t.stateNode, l = null, e !== null && (l = e.memoizedState.cache), t.memoizedState.cache !== l && (t.flags |= 2048), qn(dt), ke(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (ya(t) ? Vn(t) : e === null || e.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024, Bc())), et(t), null;
      case 26:
        var i = t.type, c = t.memoizedState;
        return e === null ? (Vn(t), c !== null ? (et(t), zh(t, c)) : (et(t), Au(
          t,
          i,
          null,
          l,
          n
        ))) : c ? c !== e.memoizedState ? (Vn(t), et(t), zh(t, c)) : (et(t), t.flags &= -16777217) : (e = e.memoizedProps, e !== l && Vn(t), et(t), Au(
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
          e = $.current, ya(t) ? od(t) : (e = Lm(i, l, n), t.stateNode = e, Vn(t));
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
          if (c = $.current, ya(t))
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
        return et(t), Au(
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
        return ke(), e === null && Fu(t.stateNode.containerInfo), et(t), null;
      case 10:
        return qn(t.type), et(t), null;
      case 19:
        if (R(ut), l = t.memoizedState, l === null) return et(t), null;
        if (i = (t.flags & 128) !== 0, c = l.rendering, c === null)
          if (i) Ss(l, !1);
          else {
            if (rt !== 0 || e !== null && (e.flags & 128) !== 0)
              for (e = t.child; e !== null; ) {
                if (c = Ui(e), c !== null) {
                  for (t.flags |= 128, Ss(l, !1), e = c.updateQueue, t.updateQueue = e, Wi(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null; )
                    sd(n, e), n = n.sibling;
                  return Y(
                    ut,
                    ut.current & 1 | 2
                  ), ze && Ln(t, l.treeForkCount), t.child;
                }
                e = e.sibling;
              }
            l.tail !== null && Re() > tr && (t.flags |= 128, i = !0, Ss(l, !1), t.lanes = 4194304);
          }
        else {
          if (!i)
            if (e = Ui(c), e !== null) {
              if (t.flags |= 128, i = !0, e = e.updateQueue, t.updateQueue = e, Wi(t, e), Ss(l, !0), l.tail === null && l.tailMode === "hidden" && !c.alternate && !ze)
                return et(t), null;
            } else
              2 * Re() - l.renderingStartTime > tr && n !== 536870912 && (t.flags |= 128, i = !0, Ss(l, !1), t.lanes = 4194304);
          l.isBackwards ? (c.sibling = t.child, t.child = c) : (e = l.last, e !== null ? e.sibling = c : t.child = c, l.last = c);
        }
        return l.tail !== null ? (e = l.tail, l.rendering = e, l.tail = e.sibling, l.renderingStartTime = Re(), e.sibling = null, n = ut.current, Y(
          ut,
          i ? n & 1 | 2 : n & 1
        ), ze && Ln(t, l.treeForkCount), e) : (et(t), null);
      case 22:
      case 23:
        return Wt(t), Ic(), l = t.memoizedState !== null, e !== null ? e.memoizedState !== null !== l && (t.flags |= 8192) : l && (t.flags |= 8192), l ? (n & 536870912) !== 0 && (t.flags & 128) === 0 && (et(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : et(t), n = t.updateQueue, n !== null && Wi(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), l = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (l = t.memoizedState.cachePool.pool), l !== n && (t.flags |= 2048), e !== null && R(ql), null;
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
        return qn(dt), ke(), e = t.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (t.flags = e & -65537 | 128, t) : null;
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
        return R(ut), null;
      case 4:
        return ke(), null;
      case 10:
        return qn(t.type), null;
      case 22:
      case 23:
        return Wt(t), Ic(), e !== null && R(ql), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 24:
        return qn(dt), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function kh(e, t) {
    switch (Uc(t), t.tag) {
      case 3:
        qn(dt), ke();
        break;
      case 26:
      case 27:
      case 5:
        Ze(t);
        break;
      case 4:
        ke();
        break;
      case 31:
        t.memoizedState !== null && Wt(t);
        break;
      case 13:
        Wt(t);
        break;
      case 19:
        R(ut);
        break;
      case 10:
        qn(t.type);
        break;
      case 22:
      case 23:
        Wt(t), Ic(), e !== null && R(ql);
        break;
      case 24:
        qn(dt);
    }
  }
  function js(e, t) {
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
              var w = n, A = v;
              try {
                A();
              } catch (D) {
                Ge(
                  i,
                  w,
                  D
                );
              }
            }
          }
          l = l.next;
        } while (l !== c);
      }
    } catch (D) {
      Ge(t, t.return, D);
    }
  }
  function Oh(e) {
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
  function Rh(e, t, n) {
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
  function Ns(e, t) {
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
  function Cu(e, t, n) {
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
  function ku(e, t, n) {
    var l = e.tag;
    if (l === 5 || l === 6)
      e = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(e, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(e), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Dn));
    else if (l !== 4 && (l === 27 && xl(e.type) && (n = e.stateNode, t = null), e = e.child, e !== null))
      for (ku(e, t, n), e = e.sibling; e !== null; )
        ku(e, t, n), e = e.sibling;
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
  var Qn = !1, pt = !1, Ou = !1, Lh = typeof WeakSet == "function" ? WeakSet : Set, xt = null;
  function k1(e, t) {
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
            var h = 0, v = -1, w = -1, A = 0, D = 0, B = e, z = null;
            t: for (; ; ) {
              for (var k; B !== n || i !== 0 && B.nodeType !== 3 || (v = h + i), B !== c || l !== 0 && B.nodeType !== 3 || (w = h + l), B.nodeType === 3 && (h += B.nodeValue.length), (k = B.firstChild) !== null; )
                z = B, B = k;
              for (; ; ) {
                if (B === e) break t;
                if (z === n && ++A === i && (v = h), z === c && ++D === l && (w = h), (k = B.nextSibling) !== null) break;
                B = z, z = B.parentNode;
              }
              B = k;
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
                  var ne = Ql(
                    n.type,
                    i
                  );
                  e = l.getSnapshotBeforeUpdate(
                    ne,
                    c
                  ), l.__reactInternalSnapshotBeforeUpdate = e;
                } catch (de) {
                  Ge(
                    n,
                    n.return,
                    de
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
        Kn(e, n), l & 4 && js(5, n);
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
        l & 64 && Oh(n), l & 512 && Ns(n, n.return);
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
        Kn(e, n), t === null && l & 4 && Dh(n), l & 512 && Ns(n, n.return);
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
        ), Rs(n.stateNode), lt = l, Ut = i;
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
        lt !== null && (Ut ? (e = lt, Om(
          e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e,
          n.stateNode
        ), La(e)) : Om(lt, n.stateNode));
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
        pt || (Mn(n, t), l = n.stateNode, typeof l.componentWillUnmount == "function" && Rh(
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
  function O1(e) {
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
    var n = O1(e);
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
        Lt(t, e), Bt(e), l & 4 && (dl(3, e, e.return), js(3, e), dl(5, e, e.return));
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
                      c = i.getElementsByTagName("title")[0], (!c || c[Ia] || c[jt] || c.namespaceURI === "http://www.w3.org/2000/svg" || c.hasAttribute("itemprop")) && (c = i.createElement(l), i.head.insertBefore(
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
            )) : l === null && e.stateNode !== null && Cu(
              e,
              e.memoizedProps,
              n.memoizedProps
            );
        }
        break;
      case 27:
        Lt(t, e), Bt(e), l & 512 && (pt || n === null || Mn(n, n.return)), n !== null && l & 4 && Cu(
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
          } catch (ne) {
            Ge(e, e.return, ne);
          }
        }
        l & 4 && e.stateNode != null && (i = e.memoizedProps, Cu(
          e,
          i,
          n !== null ? n.memoizedProps : i
        )), l & 1024 && (Ou = !0);
        break;
      case 6:
        if (Lt(t, e), Bt(e), l & 4) {
          if (e.stateNode === null)
            throw Error(u(162));
          l = e.memoizedProps, n = e.stateNode;
          try {
            n.nodeValue = l;
          } catch (ne) {
            Ge(e, e.return, ne);
          }
        }
        break;
      case 3:
        if (mr = null, i = vn, vn = dr(t.containerInfo), Lt(t, e), vn = i, Bt(e), l & 4 && n !== null && n.memoizedState.isDehydrated)
          try {
            La(t.containerInfo);
          } catch (ne) {
            Ge(e, e.return, ne);
          }
        Ou && (Ou = !1, Qh(e));
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
        var w = n !== null && n.memoizedState !== null, A = Qn, D = pt;
        if (Qn = A || i, pt = D || w, Lt(t, e), pt = D, Qn = A, Bt(e), l & 8192)
          e: for (t = e.stateNode, t._visibility = i ? t._visibility & -2 : t._visibility | 1, i && (n === null || w || Qn || pt || Zl(e)), n = null, t = e; ; ) {
            if (t.tag === 5 || t.tag === 26) {
              if (n === null) {
                w = n = t;
                try {
                  if (c = w.stateNode, i)
                    h = c.style, typeof h.setProperty == "function" ? h.setProperty("display", "none", "important") : h.display = "none";
                  else {
                    v = w.stateNode;
                    var B = w.memoizedProps.style, z = B != null && B.hasOwnProperty("display") ? B.display : null;
                    v.style.display = z == null || typeof z == "boolean" ? "" : ("" + z).trim();
                  }
                } catch (ne) {
                  Ge(w, w.return, ne);
                }
              }
            } else if (t.tag === 6) {
              if (n === null) {
                w = t;
                try {
                  w.stateNode.nodeValue = i ? "" : w.memoizedProps;
                } catch (ne) {
                  Ge(w, w.return, ne);
                }
              }
            } else if (t.tag === 18) {
              if (n === null) {
                w = t;
                try {
                  var k = w.stateNode;
                  i ? Rm(k, !0) : Rm(w.stateNode, !1);
                } catch (ne) {
                  Ge(w, w.return, ne);
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
            var w = n.stateNode.containerInfo, A = zu(e);
            ku(
              e,
              A,
              w
            );
            break;
          default:
            throw Error(u(161));
        }
      } catch (D) {
        Ge(e, e.return, D);
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
          typeof n.componentWillUnmount == "function" && Rh(
            t,
            t.return,
            n
          ), Zl(t);
          break;
        case 27:
          Rs(t.stateNode);
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
          ), js(4, c);
          break;
        case 1:
          if (Jn(
            i,
            c,
            n
          ), l = c, i = l.stateNode, typeof i.componentDidMount == "function")
            try {
              i.componentDidMount();
            } catch (A) {
              Ge(l, l.return, A);
            }
          if (l = c, i = l.updateQueue, i !== null) {
            var v = l.stateNode;
            try {
              var w = i.shared.hiddenCallbacks;
              if (w !== null)
                for (i.shared.hiddenCallbacks = null, i = 0; i < w.length; i++)
                  wd(w[i], v);
            } catch (A) {
              Ge(l, l.return, A);
            }
          }
          n && h & 64 && Oh(c), Ns(c, c.return);
          break;
        case 27:
          Uh(c);
        case 26:
        case 5:
          Jn(
            i,
            c,
            n
          ), n && l === null && h & 4 && Dh(c), Ns(c, c.return);
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
          ), Ns(c, c.return);
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
  function Ru(e, t) {
    var n = null;
    e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && fs(n));
  }
  function Du(e, t) {
    e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && fs(e));
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
        ), i & 2048 && js(9, t);
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
        ), i & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && fs(e)));
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
        ) : Ms(e, t) : c._visibility & 2 ? xn(
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
        )), i & 2048 && Ru(h, t);
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
      var c = e, h = t, v = n, w = l, A = h.flags;
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
          ), js(8, h);
          break;
        case 23:
          break;
        case 22:
          var D = h.stateNode;
          h.memoizedState !== null ? D._visibility & 2 ? Ta(
            c,
            h,
            v,
            w,
            i
          ) : Ms(
            c,
            h
          ) : (D._visibility |= 2, Ta(
            c,
            h,
            v,
            w,
            i
          )), i && A & 2048 && Ru(
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
          ), i && A & 2048 && Du(h.alternate, h);
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
  function Ms(e, t) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; ) {
        var n = e, l = t, i = l.flags;
        switch (l.tag) {
          case 22:
            Ms(n, l), i & 2048 && Ru(
              l.alternate,
              l
            );
            break;
          case 24:
            Ms(n, l), i & 2048 && Du(l.alternate, l);
            break;
          default:
            Ms(n, l);
        }
        t = t.sibling;
      }
  }
  var Ts = 8192;
  function Ea(e, t, n) {
    if (e.subtreeFlags & Ts)
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
        ), e.flags & Ts && e.memoizedState !== null && xy(
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
        e.memoizedState === null && (l = e.alternate, l !== null && l.memoizedState !== null ? (l = Ts, Ts = 16777216, Ea(
          e,
          t,
          n
        ), Ts = l) : Ea(
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
  function Es(e) {
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
        Es(e), e.flags & 2048 && dl(9, e, e.return);
        break;
      case 3:
        Es(e);
        break;
      case 12:
        Es(e);
        break;
      case 22:
        var t = e.stateNode;
        e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Pi(e)) : Es(e);
        break;
      default:
        Es(e);
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
          fs(n.memoizedState.cache);
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
  var R1 = {
    getCacheForType: function(e) {
      var t = Mt(dt), n = t.data.get(e);
      return n === void 0 && (n = e(), t.data.set(e, n)), n;
    },
    cacheSignal: function() {
      return Mt(dt).controller.signal;
    }
  }, D1 = typeof WeakMap == "function" ? WeakMap : Map, qe = 0, Je = null, Te = null, Ae = 0, Ye = 0, Ft = null, hl = !1, Aa = !1, Hu = !1, $n = 0, rt = 0, ml = 0, Kl = 0, Uu = 0, It = 0, Ca = 0, As = null, qt = null, Lu = !1, er = 0, Fh = 0, tr = 1 / 0, nr = null, pl = null, gt = 0, gl = null, za = null, Wn = 0, Bu = 0, qu = null, Ih = null, Cs = 0, Yu = null;
  function Pt() {
    return (qe & 2) !== 0 && Ae !== 0 ? Ae & -Ae : C.T !== null ? Ku() : mf();
  }
  function Ph() {
    if (It === 0)
      if ((Ae & 536870912) === 0 || ze) {
        var e = Al;
        Al <<= 1, (Al & 3932160) === 0 && (Al = 262144), It = e;
      } else It = 536870912;
    return e = $t.current, e !== null && (e.flags |= 32), It;
  }
  function Yt(e, t, n) {
    (e === Je && (Ye === 2 || Ye === 9) || e.cancelPendingCommit !== null) && (ka(e, 0), yl(
      e,
      Ae,
      It,
      !1
    )), Fa(e, n), ((qe & 2) === 0 || e !== Je) && (e === Je && ((qe & 2) === 0 && (Kl |= n), rt === 4 && yl(
      e,
      Ae,
      It,
      !1
    )), Tn(e));
  }
  function em(e, t, n) {
    if ((qe & 6) !== 0) throw Error(u(327));
    var l = !n && (t & 127) === 0 && (t & e.expiredLanes) === 0 || Wa(e, t), i = l ? L1(e, t) : Xu(e, t, !0), c = l;
    do {
      if (i === 0) {
        Aa && !l && yl(e, t, 0, !1);
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
              if (w && (ka(v, h).flags |= 256), h = Xu(
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
          ka(e, 0), yl(e, t, 0, !0);
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
                Ca,
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
            Ca,
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
  function tm(e, t, n, l, i, c, h, v, w, A, D, B, z, k) {
    if (e.timeoutHandle = -1, B = t.subtreeFlags, B & 8192 || (B & 16785408) === 16785408) {
      B = {
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
        B
      );
      var ne = (c & 62914560) === c ? er - Re() : (c & 4194048) === c ? Fh - Re() : 0;
      if (ne = _y(
        B,
        ne
      ), ne !== null) {
        Wn = c, e.cancelPendingCommit = ne(
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
            D,
            B,
            null,
            z,
            k
          )
        ), yl(e, c, h, !A);
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
    return (qe & 6) === 0 ? (zs(0), !1) : !0;
  }
  function Gu() {
    if (Te !== null) {
      if (Ye === 0)
        var e = Te.return;
      else
        e = Te, Bn = Ll = null, au(e), wa = null, hs = 0, e = Te;
      for (; e !== null; )
        kh(e.alternate, e), e = e.return;
      Te = null;
    }
  }
  function ka(e, t) {
    var n = e.timeoutHandle;
    n !== -1 && (e.timeoutHandle = -1, ny(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), Wn = 0, Gu(), Je = e, Te = n = Un(e.current, null), Ae = t, Ye = 0, Ft = null, hl = !1, Aa = Wa(e, t), Hu = !1, Ca = It = Uu = Kl = ml = rt = 0, qt = As = null, Lu = !1, (t & 8) !== 0 && (t |= t & 32);
    var l = e.entangledLanes;
    if (l !== 0)
      for (e = e.entanglements, l &= t; 0 < l; ) {
        var i = 31 - zt(l), c = 1 << i;
        t |= e[i], l &= ~c;
      }
    return $n = t, ji(), n;
  }
  function nm(e, t) {
    xe = null, C.H = bs, t === ba || t === ki ? (t = vd(), Ye = 3) : t === Zc ? (t = vd(), Ye = 4) : Ye = t === _u ? 8 : t !== null && typeof t == "object" && typeof t.then == "function" ? 6 : 1, Ft = t, Te === null && (rt = 1, Zi(
      e,
      un(t, e.current)
    ));
  }
  function lm() {
    var e = $t.current;
    return e === null ? !0 : (Ae & 4194048) === Ae ? hn === null : (Ae & 62914560) === Ae || (Ae & 536870912) !== 0 ? e === hn : !1;
  }
  function am() {
    var e = C.H;
    return C.H = bs, e === null ? bs : e;
  }
  function sm() {
    var e = C.A;
    return C.A = R1, e;
  }
  function ar() {
    rt = 4, hl || (Ae & 4194048) !== Ae && $t.current !== null || (Aa = !0), (ml & 134217727) === 0 && (Kl & 134217727) === 0 || Je === null || yl(
      Je,
      Ae,
      It,
      !1
    );
  }
  function Xu(e, t, n) {
    var l = qe;
    qe |= 2;
    var i = am(), c = sm();
    (Je !== e || Ae !== t) && (nr = null, ka(e, t)), t = !1;
    var h = rt;
    e: do
      try {
        if (Ye !== 0 && Te !== null) {
          var v = Te, w = Ft;
          switch (Ye) {
            case 8:
              Gu(), h = 6;
              break e;
            case 3:
            case 2:
            case 9:
            case 6:
              $t.current === null && (t = !0);
              var A = Ye;
              if (Ye = 0, Ft = null, Oa(e, v, w, A), n && Aa) {
                h = 0;
                break e;
              }
              break;
            default:
              A = Ye, Ye = 0, Ft = null, Oa(e, v, w, A);
          }
        }
        U1(), h = rt;
        break;
      } catch (D) {
        nm(e, D);
      }
    while (!0);
    return t && e.shellSuspendCounter++, Bn = Ll = null, qe = l, C.H = i, C.A = c, Te === null && (Je = null, Ae = 0, ji()), h;
  }
  function U1() {
    for (; Te !== null; ) im(Te);
  }
  function L1(e, t) {
    var n = qe;
    qe |= 2;
    var l = am(), i = sm();
    Je !== e || Ae !== t ? (nr = null, tr = Re() + 500, ka(e, t)) : Aa = Wa(
      e,
      t
    );
    e: do
      try {
        if (Ye !== 0 && Te !== null) {
          t = Te;
          var c = Ft;
          t: switch (Ye) {
            case 1:
              Ye = 0, Ft = null, Oa(e, t, c, 1);
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
              gd(c) ? (Ye = 0, Ft = null, rm(t)) : (Ye = 0, Ft = null, Oa(e, t, c, 7));
              break;
            case 5:
              var h = null;
              switch (Te.tag) {
                case 26:
                  h = Te.memoizedState;
                case 5:
                case 27:
                  var v = Te;
                  if (h ? Zm(h) : v.stateNode.complete) {
                    Ye = 0, Ft = null;
                    var w = v.sibling;
                    if (w !== null) Te = w;
                    else {
                      var A = v.return;
                      A !== null ? (Te = A, sr(A)) : Te = null;
                    }
                    break t;
                  }
              }
              Ye = 0, Ft = null, Oa(e, t, c, 5);
              break;
            case 6:
              Ye = 0, Ft = null, Oa(e, t, c, 6);
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
      } catch (D) {
        nm(e, D);
      }
    while (!0);
    return Bn = Ll = null, C.H = l, C.A = i, qe = n, Te !== null ? 0 : (Je = null, Ae = 0, ji(), rt);
  }
  function B1() {
    for (; Te !== null && !Ct(); )
      im(Te);
  }
  function im(e) {
    var t = Ch(e.alternate, e, $n);
    e.memoizedProps = e.pendingProps, t === null ? sr(e) : Te = t;
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
          Ae
        );
        break;
      case 11:
        t = jh(
          n,
          t,
          t.pendingProps,
          t.type.render,
          t.ref,
          Ae
        );
        break;
      case 5:
        au(t);
      default:
        kh(n, t), t = Te = sd(t, $n), t = Ch(n, t, $n);
    }
    e.memoizedProps = e.pendingProps, t === null ? sr(e) : Te = t;
  }
  function Oa(e, t, n, l) {
    Bn = Ll = null, au(t), wa = null, hs = 0;
    var i = t.return;
    try {
      if (T1(
        e,
        i,
        t,
        n,
        Ae
      )) {
        rt = 1, Zi(
          e,
          un(n, e.current)
        ), Te = null;
        return;
      }
    } catch (c) {
      if (i !== null) throw Te = i, c;
      rt = 1, Zi(
        e,
        un(n, e.current)
      ), Te = null;
      return;
    }
    t.flags & 32768 ? (ze || l === 1 ? e = !0 : Aa || (Ae & 536870912) !== 0 ? e = !1 : (hl = e = !0, (l === 2 || l === 9 || l === 3 || l === 6) && (l = $t.current, l !== null && l.tag === 13 && (l.flags |= 16384))), cm(t, e)) : sr(t);
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
      var n = C1(
        t.alternate,
        t,
        $n
      );
      if (n !== null) {
        Te = n;
        return;
      }
      if (t = t.sibling, t !== null) {
        Te = t;
        return;
      }
      Te = t = e;
    } while (t !== null);
    rt === 0 && (rt = 5);
  }
  function cm(e, t) {
    do {
      var n = z1(e.alternate, e);
      if (n !== null) {
        n.flags &= 32767, Te = n;
        return;
      }
      if (n = e.return, n !== null && (n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null), !t && (e = e.sibling, e !== null)) {
        Te = e;
        return;
      }
      Te = e = n;
    } while (e !== null);
    rt = 6, Te = null;
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
      ), e === Je && (Te = Je = null, Ae = 0), za = t, gl = e, Wn = n, Bu = c, qu = i, Ih = l, (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, X1(ln, function() {
        return mm(), null;
      })) : (e.callbackNode = null, e.callbackPriority = 0), l = (t.flags & 13878) !== 0, (t.subtreeFlags & 13878) !== 0 || l) {
        l = C.T, C.T = null, i = q.p, q.p = 2, h = qe, qe |= 4;
        try {
          k1(e, t, n);
        } finally {
          qe = h, q.p = i, C.T = l;
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
        n = C.T, C.T = null;
        var l = q.p;
        q.p = 2;
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
              var A = w.start, D = w.end;
              if (D === void 0 && (D = A), "selectionStart" in v)
                v.selectionStart = A, v.selectionEnd = Math.min(
                  D,
                  v.value.length
                );
              else {
                var B = v.ownerDocument || document, z = B && B.defaultView || window;
                if (z.getSelection) {
                  var k = z.getSelection(), ne = v.textContent.length, de = Math.min(w.start, ne), Qe = w.end === void 0 ? de : Math.min(w.end, ne);
                  !k.extend && de > Qe && (h = Qe, Qe = de, de = h);
                  var M = Jf(
                    v,
                    de
                  ), N = Jf(
                    v,
                    Qe
                  );
                  if (M && N && (k.rangeCount !== 1 || k.anchorNode !== M.node || k.anchorOffset !== M.offset || k.focusNode !== N.node || k.focusOffset !== N.offset)) {
                    var E = B.createRange();
                    E.setStart(M.node, M.offset), k.removeAllRanges(), de > Qe ? (k.addRange(E), k.extend(N.node, N.offset)) : (E.setEnd(N.node, N.offset), k.addRange(E));
                  }
                }
              }
            }
            for (B = [], k = v; k = k.parentNode; )
              k.nodeType === 1 && B.push({
                element: k,
                left: k.scrollLeft,
                top: k.scrollTop
              });
            for (typeof v.focus == "function" && v.focus(), v = 0; v < B.length; v++) {
              var U = B[v];
              U.element.scrollLeft = U.left, U.element.scrollTop = U.top;
            }
          }
          vr = !!eo, to = eo = null;
        } finally {
          qe = i, q.p = l, C.T = n;
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
        n = C.T, C.T = null;
        var l = q.p;
        q.p = 2;
        var i = qe;
        qe |= 4;
        try {
          Bh(e, t.alternate, t);
        } finally {
          qe = i, q.p = l, C.T = n;
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
        t = C.T, i = q.p, q.p = 2, C.T = null;
        try {
          for (var c = e.onRecoverableError, h = 0; h < l.length; h++) {
            var v = l[h];
            c(v.value, {
              componentStack: v.stack
            });
          }
        } finally {
          C.T = t, q.p = i;
        }
      }
      (Wn & 3) !== 0 && ir(), Tn(e), i = e.pendingLanes, (n & 261930) !== 0 && (i & 42) !== 0 ? e === Yu ? Cs++ : (Cs = 0, Yu = e) : Cs = 0, zs(0);
    }
  }
  function hm(e, t) {
    (e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, fs(t)));
  }
  function ir() {
    return om(), fm(), dm(), mm();
  }
  function mm() {
    if (gt !== 5) return !1;
    var e = gl, t = Bu;
    Bu = 0;
    var n = rc(Wn), l = C.T, i = q.p;
    try {
      q.p = 32 > n ? 32 : n, C.T = null, n = qu, qu = null;
      var c = gl, h = Wn;
      if (gt = 0, za = gl = null, Wn = 0, (qe & 6) !== 0) throw Error(u(331));
      var v = qe;
      if (qe |= 4, $h(c.current), Zh(
        c,
        c.current,
        h,
        n
      ), qe = v, zs(0, !1), Be && typeof Be.onPostCommitFiberRoot == "function")
        try {
          Be.onPostCommitFiberRoot(Fe, c);
        } catch {
        }
      return !0;
    } finally {
      q.p = i, C.T = l, hm(e, t);
    }
  }
  function pm(e, t, n) {
    t = un(n, t), t = xu(e.stateNode, t, 2), e = ul(e, t, 2), e !== null && (Fa(e, 2), Tn(e));
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
            ), Fa(l, 2), Tn(l));
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
    l !== null && l.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, Je === e && (Ae & n) === n && (rt === 4 || rt === 3 && (Ae & 62914560) === Ae && 300 > Re() - er ? (qe & 2) === 0 && ka(e, 0) : Uu |= n, Ca === Ae && (Ca = 0)), Tn(e);
  }
  function gm(e, t) {
    t === 0 && (t = of()), e = Dl(e, t), e !== null && (Fa(e, t), Tn(e));
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
    return re(e, t);
  }
  var rr = null, Ra = null, Qu = !1, cr = !1, Zu = !1, vl = 0;
  function Tn(e) {
    e !== Ra && e.next === null && (Ra === null ? rr = Ra = e : Ra = Ra.next = e), cr = !0, Qu || (Qu = !0, Q1());
  }
  function zs(e, t) {
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
            c = Ae, c = an(
              l,
              l === Je ? c : 0,
              l.cancelPendingCommit !== null || l.timeoutHandle !== -1
            ), (c & 3) === 0 || Wa(l, c) || (n = !0, _m(l, c));
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
      c === 0 ? (l.next = null, n === null ? rr = i : n.next = i, i === null && (Ra = n)) : (n = l, (e !== 0 || (c & 3) !== 0) && (cr = !0)), l = i;
    }
    gt !== 0 && gt !== 5 || zs(e), vl !== 0 && (vl = 0);
  }
  function vm(e, t) {
    for (var n = e.suspendedLanes, l = e.pingedLanes, i = e.expirationTimes, c = e.pendingLanes & -62914561; 0 < c; ) {
      var h = 31 - zt(c), v = 1 << h, w = i[h];
      w === -1 ? ((v & n) === 0 || (v & l) !== 0) && (i[h] = yg(v, t)) : w <= t && (e.expiredLanes |= v), c &= ~v;
    }
    if (t = Je, n = Ae, n = an(
      e,
      e === t ? n : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1
    ), l = e.callbackNode, n === 0 || e === t && (Ye === 2 || Ye === 9) || e.cancelPendingCommit !== null)
      return l !== null && l !== null && Ke(l), e.callbackNode = null, e.callbackPriority = 0;
    if ((n & 3) === 0 || Wa(e, n)) {
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
      return l = xm.bind(null, e), n = re(n, l), e.callbackPriority = t, e.callbackNode = n, t;
    }
    return l !== null && l !== null && Ke(l), e.callbackPriority = 2, e.callbackNode = null, 2;
  }
  function xm(e, t) {
    if (gt !== 0 && gt !== 5)
      return e.callbackNode = null, e.callbackPriority = 0, null;
    var n = e.callbackNode;
    if (ir() && e.callbackNode !== n)
      return null;
    var l = Ae;
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
      (qe & 6) !== 0 ? re(
        wt,
        V1
      ) : ym();
    });
  }
  function Ku() {
    if (vl === 0) {
      var e = xa;
      e === 0 && (e = $a, $a <<= 1, ($a & 261888) === 0 && ($a = 256)), vl = e;
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
  for (var Ju = 0; Ju < Cc.length; Ju++) {
    var $u = Cc[Ju], K1 = $u.toLowerCase(), J1 = $u[0].toUpperCase() + $u.slice(1);
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
  var ks = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
    " "
  ), $1 = new Set(
    "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(ks)
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
            var v = l[h], w = v.instance, A = v.currentTarget;
            if (v = v.listener, w !== c && i.isPropagationStopped())
              break e;
            c = v, i.currentTarget = A;
            try {
              c(i);
            } catch (D) {
              Si(D);
            }
            i.currentTarget = null, c = w;
          }
        else
          for (h = 0; h < l.length; h++) {
            if (v = l[h], w = v.instance, A = v.currentTarget, v = v.listener, w !== c && i.isPropagationStopped())
              break e;
            c = v, i.currentTarget = A;
            try {
              c(i);
            } catch (D) {
              Si(D);
            }
            i.currentTarget = null, c = w;
          }
      }
    }
  }
  function Ee(e, t) {
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
    Af(function() {
      var A = c, D = pc(n), B = [];
      e: {
        var z = ld.get(e);
        if (z !== void 0) {
          var k = _i, ne = e;
          switch (e) {
            case "keypress":
              if (vi(n) === 0) break e;
            case "keydown":
            case "keyup":
              k = Gg;
              break;
            case "focusin":
              ne = "focus", k = bc;
              break;
            case "focusout":
              ne = "blur", k = bc;
              break;
            case "beforeblur":
            case "afterblur":
              k = bc;
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
              k = kf;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              k = Cg;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              k = Qg;
              break;
            case Pf:
            case ed:
            case td:
              k = Og;
              break;
            case nd:
              k = Kg;
              break;
            case "scroll":
            case "scrollend":
              k = Eg;
              break;
            case "wheel":
              k = $g;
              break;
            case "copy":
            case "cut":
            case "paste":
              k = Dg;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              k = Rf;
              break;
            case "toggle":
            case "beforetoggle":
              k = Fg;
          }
          var de = (t & 4) !== 0, Qe = !de && (e === "scroll" || e === "scrollend"), M = de ? z !== null ? z + "Capture" : null : z;
          de = [];
          for (var N = A, E; N !== null; ) {
            var U = N;
            if (E = U.stateNode, U = U.tag, U !== 5 && U !== 26 && U !== 27 || E === null || M === null || (U = es(N, M), U != null && de.push(
              Os(N, U, E)
            )), Qe) break;
            N = N.return;
          }
          0 < de.length && (z = new k(
            z,
            ne,
            null,
            n,
            D
          ), B.push({ event: z, listeners: de }));
        }
      }
      if ((t & 7) === 0) {
        e: {
          if (z = e === "mouseover" || e === "pointerover", k = e === "mouseout" || e === "pointerout", z && n !== mc && (ne = n.relatedTarget || n.fromElement) && (na(ne) || ne[ta]))
            break e;
          if ((k || z) && (z = D.window === D ? D : (z = D.ownerDocument) ? z.defaultView || z.parentWindow : window, k ? (ne = n.relatedTarget || n.toElement, k = A, ne = ne ? na(ne) : null, ne !== null && (Qe = d(ne), de = ne.tag, ne !== Qe || de !== 5 && de !== 27 && de !== 6) && (ne = null)) : (k = null, ne = A), k !== ne)) {
            if (de = kf, U = "onMouseLeave", M = "onMouseEnter", N = "mouse", (e === "pointerout" || e === "pointerover") && (de = Rf, U = "onPointerLeave", M = "onPointerEnter", N = "pointer"), Qe = k == null ? z : Pa(k), E = ne == null ? z : Pa(ne), z = new de(
              U,
              N + "leave",
              k,
              n,
              D
            ), z.target = Qe, z.relatedTarget = E, U = null, na(D) === A && (de = new de(
              M,
              N + "enter",
              ne,
              n,
              D
            ), de.target = E, de.relatedTarget = Qe, U = de), Qe = U, k && ne)
              t: {
                for (de = W1, M = k, N = ne, E = 0, U = M; U; U = de(U))
                  E++;
                U = 0;
                for (var ue = N; ue; ue = de(ue))
                  U++;
                for (; 0 < E - U; )
                  M = de(M), E--;
                for (; 0 < U - E; )
                  N = de(N), U--;
                for (; E--; ) {
                  if (M === N || N !== null && M === N.alternate) {
                    de = M;
                    break t;
                  }
                  M = de(M), N = de(N);
                }
                de = null;
              }
            else de = null;
            k !== null && Nm(
              B,
              z,
              k,
              de,
              !1
            ), ne !== null && Qe !== null && Nm(
              B,
              Qe,
              ne,
              de,
              !0
            );
          }
        }
        e: {
          if (z = A ? Pa(A) : window, k = z.nodeName && z.nodeName.toLowerCase(), k === "select" || k === "input" && z.type === "file")
            var De = Gf;
          else if (qf(z))
            if (Xf)
              De = r1;
            else {
              De = s1;
              var le = a1;
            }
          else
            k = z.nodeName, !k || k.toLowerCase() !== "input" || z.type !== "checkbox" && z.type !== "radio" ? A && hc(A.elementType) && (De = Gf) : De = i1;
          if (De && (De = De(e, A))) {
            Yf(
              B,
              De,
              n,
              D
            );
            break e;
          }
          le && le(e, z, A), e === "focusout" && A && z.type === "number" && A.memoizedProps.value != null && dc(z, "number", z.value);
        }
        switch (le = A ? Pa(A) : window, e) {
          case "focusin":
            (qf(le) || le.contentEditable === "true") && (fa = le, Tc = A, cs = null);
            break;
          case "focusout":
            cs = Tc = fa = null;
            break;
          case "mousedown":
            Ec = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Ec = !1, Ff(B, n, D);
            break;
          case "selectionchange":
            if (u1) break;
          case "keydown":
          case "keyup":
            Ff(B, n, D);
        }
        var _e;
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
        Ce && (Df && n.locale !== "ko" && (oa || Ce !== "onCompositionStart" ? Ce === "onCompositionEnd" && oa && (_e = Cf()) : (nl = D, vc = "value" in nl ? nl.value : nl.textContent, oa = !0)), le = or(A, Ce), 0 < le.length && (Ce = new Of(
          Ce,
          e,
          null,
          n,
          D
        ), B.push({ event: Ce, listeners: le }), _e ? Ce.data = _e : (_e = Bf(n), _e !== null && (Ce.data = _e)))), (_e = Pg ? e1(e, n) : t1(e, n)) && (Ce = or(A, "onBeforeInput"), 0 < Ce.length && (le = new Of(
          "onBeforeInput",
          "beforeinput",
          null,
          n,
          D
        ), B.push({
          event: le,
          listeners: Ce
        }), le.data = _e)), Z1(
          B,
          e,
          A,
          n,
          D
        );
      }
      Sm(B, t);
    });
  }
  function Os(e, t, n) {
    return {
      instance: e,
      listener: t,
      currentTarget: n
    };
  }
  function or(e, t) {
    for (var n = t + "Capture", l = []; e !== null; ) {
      var i = e, c = i.stateNode;
      if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || c === null || (i = es(e, n), i != null && l.unshift(
        Os(e, i, c)
      ), i = es(e, t), i != null && l.push(
        Os(e, i, c)
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
      var v = n, w = v.alternate, A = v.stateNode;
      if (v = v.tag, w !== null && w === l) break;
      v !== 5 && v !== 26 && v !== 27 || A === null || (w = A, i ? (A = es(n, c), A != null && h.unshift(
        Os(n, A, w)
      )) : i || (A = es(n, c), A != null && h.push(
        Os(n, A, w)
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
        l != null && Ee("scroll", e);
        break;
      case "onScrollEnd":
        l != null && Ee("scrollend", e);
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
        Ee("beforetoggle", e), Ee("toggle", e), hi(e, "popover", l);
        break;
      case "xlinkActuate":
        Rn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:actuate",
          l
        );
        break;
      case "xlinkArcrole":
        Rn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:arcrole",
          l
        );
        break;
      case "xlinkRole":
        Rn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:role",
          l
        );
        break;
      case "xlinkShow":
        Rn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:show",
          l
        );
        break;
      case "xlinkTitle":
        Rn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:title",
          l
        );
        break;
      case "xlinkType":
        Rn(
          e,
          "http://www.w3.org/1999/xlink",
          "xlink:type",
          l
        );
        break;
      case "xmlBase":
        Rn(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:base",
          l
        );
        break;
      case "xmlLang":
        Rn(
          e,
          "http://www.w3.org/XML/1998/namespace",
          "xml:lang",
          l
        );
        break;
      case "xmlSpace":
        Rn(
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
        l != null && Ee("scroll", e);
        break;
      case "onScrollEnd":
        l != null && Ee("scrollend", e);
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
        Ee("error", e), Ee("load", e);
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
        Ee("invalid", e);
        var v = c = h = i = null, w = null, A = null;
        for (l in n)
          if (n.hasOwnProperty(l)) {
            var D = n[l];
            if (D != null)
              switch (l) {
                case "name":
                  i = D;
                  break;
                case "type":
                  h = D;
                  break;
                case "checked":
                  w = D;
                  break;
                case "defaultChecked":
                  A = D;
                  break;
                case "value":
                  c = D;
                  break;
                case "defaultValue":
                  v = D;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (D != null)
                    throw Error(u(137, t));
                  break;
                default:
                  Ve(e, t, l, D, n, null);
              }
          }
        Sf(
          e,
          c,
          v,
          w,
          A,
          h,
          i,
          !1
        );
        return;
      case "select":
        Ee("invalid", e), l = h = c = null;
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
        Ee("invalid", e), c = i = l = null;
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
        Ee("beforetoggle", e), Ee("toggle", e), Ee("cancel", e), Ee("close", e);
        break;
      case "iframe":
      case "object":
        Ee("load", e);
        break;
      case "video":
      case "audio":
        for (l = 0; l < ks.length; l++)
          Ee(ks[l], e);
        break;
      case "image":
        Ee("error", e), Ee("load", e);
        break;
      case "details":
        Ee("toggle", e);
        break;
      case "embed":
      case "source":
      case "link":
        Ee("error", e), Ee("load", e);
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
        for (A in n)
          if (n.hasOwnProperty(A) && (l = n[A], l != null))
            switch (A) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(u(137, t));
              default:
                Ve(e, t, A, l, n, null);
            }
        return;
      default:
        if (hc(t)) {
          for (D in n)
            n.hasOwnProperty(D) && (l = n[D], l !== void 0 && Pu(
              e,
              t,
              D,
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
        var i = null, c = null, h = null, v = null, w = null, A = null, D = null;
        for (k in n) {
          var B = n[k];
          if (n.hasOwnProperty(k) && B != null)
            switch (k) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                w = B;
              default:
                l.hasOwnProperty(k) || Ve(e, t, k, null, l, B);
            }
        }
        for (var z in l) {
          var k = l[z];
          if (B = n[z], l.hasOwnProperty(z) && (k != null || B != null))
            switch (z) {
              case "type":
                c = k;
                break;
              case "name":
                i = k;
                break;
              case "checked":
                A = k;
                break;
              case "defaultChecked":
                D = k;
                break;
              case "value":
                h = k;
                break;
              case "defaultValue":
                v = k;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (k != null)
                  throw Error(u(137, t));
                break;
              default:
                k !== B && Ve(
                  e,
                  t,
                  z,
                  k,
                  l,
                  B
                );
            }
        }
        fc(
          e,
          h,
          v,
          w,
          A,
          D,
          c,
          i
        );
        return;
      case "select":
        k = h = v = z = null;
        for (c in n)
          if (w = n[c], n.hasOwnProperty(c) && w != null)
            switch (c) {
              case "value":
                break;
              case "multiple":
                k = w;
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
                z = c;
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
        t = v, n = h, l = k, z != null ? ia(e, !!n, z, !1) : !!l != !!n && (t != null ? ia(e, !!n, t, !0) : ia(e, !!n, n ? [] : "", !1));
        return;
      case "textarea":
        k = z = null;
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
                z = i;
                break;
              case "defaultValue":
                k = i;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (i != null) throw Error(u(91));
                break;
              default:
                i !== c && Ve(e, t, h, i, l, c);
            }
        jf(e, z, k);
        return;
      case "option":
        for (var ne in n)
          if (z = n[ne], n.hasOwnProperty(ne) && z != null && !l.hasOwnProperty(ne))
            switch (ne) {
              case "selected":
                e.selected = !1;
                break;
              default:
                Ve(
                  e,
                  t,
                  ne,
                  null,
                  l,
                  z
                );
            }
        for (w in l)
          if (z = l[w], k = n[w], l.hasOwnProperty(w) && z !== k && (z != null || k != null))
            switch (w) {
              case "selected":
                e.selected = z && typeof z != "function" && typeof z != "symbol";
                break;
              default:
                Ve(
                  e,
                  t,
                  w,
                  z,
                  l,
                  k
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
        for (var de in n)
          z = n[de], n.hasOwnProperty(de) && z != null && !l.hasOwnProperty(de) && Ve(e, t, de, null, l, z);
        for (A in l)
          if (z = l[A], k = n[A], l.hasOwnProperty(A) && z !== k && (z != null || k != null))
            switch (A) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (z != null)
                  throw Error(u(137, t));
                break;
              default:
                Ve(
                  e,
                  t,
                  A,
                  z,
                  l,
                  k
                );
            }
        return;
      default:
        if (hc(t)) {
          for (var Qe in n)
            z = n[Qe], n.hasOwnProperty(Qe) && z !== void 0 && !l.hasOwnProperty(Qe) && Pu(
              e,
              t,
              Qe,
              void 0,
              l,
              z
            );
          for (D in l)
            z = l[D], k = n[D], !l.hasOwnProperty(D) || z === k || z === void 0 && k === void 0 || Pu(
              e,
              t,
              D,
              z,
              l,
              k
            );
          return;
        }
    }
    for (var M in n)
      z = n[M], n.hasOwnProperty(M) && z != null && !l.hasOwnProperty(M) && Ve(e, t, M, null, l, z);
    for (B in l)
      z = l[B], k = n[B], !l.hasOwnProperty(B) || z === k || z == null && k == null || Ve(e, t, B, z, l, k);
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
            var w = n[l], A = w.startTime;
            if (A > v) break;
            var D = w.transferSize, B = w.initiatorType;
            D && Em(B) && (w = w.responseEnd, h += D * (w < v ? 1 : (v - A) / (w - A)));
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
  function Am(e) {
    switch (e) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function Cm(e, t) {
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
  var zm = typeof setTimeout == "function" ? setTimeout : void 0, ny = typeof clearTimeout == "function" ? clearTimeout : void 0, km = typeof Promise == "function" ? Promise : void 0, ly = typeof queueMicrotask == "function" ? queueMicrotask : typeof km < "u" ? function(e) {
    return km.resolve(null).then(e).catch(ay);
  } : zm;
  function ay(e) {
    setTimeout(function() {
      throw e;
    });
  }
  function xl(e) {
    return e === "head";
  }
  function Om(e, t) {
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
          Rs(e.ownerDocument.documentElement);
        else if (n === "head") {
          n = e.ownerDocument.head, Rs(n);
          for (var c = n.firstChild; c; ) {
            var h = c.nextSibling, v = c.nodeName;
            c[Ia] || v === "SCRIPT" || v === "STYLE" || v === "LINK" && c.rel.toLowerCase() === "stylesheet" || n.removeChild(c), c = h;
          }
        } else
          n === "body" && Rs(e.ownerDocument.body);
      n = i;
    } while (n);
    La(t);
  }
  function Rm(e, t) {
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
        if (!e[Ia])
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
  function Rs(e) {
    for (var t = e.attributes; t.length; )
      e.removeAttributeNode(t[0]);
    uc(e);
  }
  var pn = /* @__PURE__ */ new Map(), Bm = /* @__PURE__ */ new Set();
  function dr(e) {
    return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument;
  }
  var Fn = q.d;
  q.d = {
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
      ), pn.set(c, e), l.querySelector(i) !== null || t === "style" && l.querySelector(Ds(c)) || t === "script" && l.querySelector(Hs(c)) || (t = l.createElement("link"), Et(t, "link", e), vt(t), l.head.appendChild(t)));
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
            if (n.querySelector(Hs(c)))
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
          Ds(c)
        ))
          v.loading = 5;
        else {
          e = _(
            { rel: "stylesheet", href: e, "data-precedence": t },
            n
          ), (n = pn.get(c)) && co(e, n);
          var w = h = l.createElement("link");
          vt(w), Et(w, "link", e), w._p = new Promise(function(A, D) {
            w.onload = A, w.onerror = D;
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
      c || (c = n.querySelector(Hs(i)), c || (e = _({ src: e, async: !0 }, t), (t = pn.get(i)) && uo(e, t), c = n.createElement("script"), vt(c), Et(c, "link", e), n.head.appendChild(c)), c = {
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
      c || (c = n.querySelector(Hs(i)), c || (e = _({ src: e, async: !0, type: "module" }, t), (t = pn.get(i)) && uo(e, t), c = n.createElement("script"), vt(c), Et(c, "link", e), n.head.appendChild(c)), c = {
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
            Ds(e)
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
  function Ds(e) {
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
  function Hs(e) {
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
            Ds(i)
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
            Hs(c)
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
      if (!(c[Ia] || c[jt] || e === "link" && c.getAttribute("rel") === "stylesheet") && c.namespaceURI !== "http://www.w3.org/2000/svg") {
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
          Ds(i)
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
  var Us = {
    $$typeof: X,
    Provider: null,
    Consumer: null,
    _currentValue: F,
    _currentValue2: F,
    _threadCount: 0
  };
  function wy(e, t, n, l, i, c, h, v, w) {
    this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = sc(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = sc(0), this.hiddenUpdates = sc(null), this.identifierPrefix = l, this.onUncaughtError = i, this.onCaughtError = c, this.onRecoverableError = h, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = w, this.incompleteTransitions = /* @__PURE__ */ new Map();
  }
  function Km(e, t, n, l, i, c, h, v, w, A, D, B) {
    return e = new wy(
      e,
      t,
      n,
      h,
      w,
      A,
      D,
      B,
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
    i = Jm(i), l.context === null ? l.context = i : l.pendingContext = i, l = cl(t), l.payload = { element: n }, c = c === void 0 ? null : c, c !== null && (l.callback = c), n = ul(e, l, t), n !== null && (Yt(n, e, t), ps(n, e, t));
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
    var i = C.T;
    C.T = null;
    var c = q.p;
    try {
      q.p = 2, ho(e, t, n, l);
    } finally {
      q.p = c, C.T = i;
    }
  }
  function jy(e, t, n, l) {
    var i = C.T;
    C.T = null;
    var c = q.p;
    try {
      q.p = 8, ho(e, t, n, l);
    } finally {
      q.p = c, C.T = i;
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
                  var h = kt(c.pendingLanes);
                  if (h !== 0) {
                    var v = c;
                    for (v.pendingLanes |= 2, v.entangledLanes |= 2; h; ) {
                      var w = 1 << 31 - zt(h);
                      v.entanglements[1] |= w, h &= ~w;
                    }
                    Tn(c), (qe & 6) === 0 && (tr = Re() + 500, zs(0));
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
          case On:
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
  var go = !1, _l = null, bl = null, wl = null, Ls = /* @__PURE__ */ new Map(), Bs = /* @__PURE__ */ new Map(), Sl = [], Ny = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
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
        Ls.delete(t.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        Bs.delete(t.pointerId);
    }
  }
  function qs(e, t, n, l, i, c) {
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
        return _l = qs(
          _l,
          e,
          t,
          n,
          l,
          i
        ), !0;
      case "dragenter":
        return bl = qs(
          bl,
          e,
          t,
          n,
          l,
          i
        ), !0;
      case "mouseover":
        return wl = qs(
          wl,
          e,
          t,
          n,
          l,
          i
        ), !0;
      case "pointerover":
        var c = i.pointerId;
        return Ls.set(
          c,
          qs(
            Ls.get(c) || null,
            e,
            t,
            n,
            l,
            i
          )
        ), !0;
      case "gotpointercapture":
        return c = i.pointerId, Bs.set(
          c,
          qs(
            Bs.get(c) || null,
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
    go = !1, _l !== null && _r(_l) && (_l = null), bl !== null && _r(bl) && (bl = null), wl !== null && _r(wl) && (wl = null), Ls.forEach(n0), Bs.forEach(n0);
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
    _l !== null && br(_l, e), bl !== null && br(bl, e), wl !== null && br(wl, e), Ls.forEach(t), Bs.forEach(t);
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
  q.findDOMNode = function(e) {
    var t = e._reactInternals;
    if (t === void 0)
      throw typeof e.render == "function" ? Error(u(188)) : (e = Object.keys(e).join(","), Error(u(268, e)));
    return e = g(t), e = e !== null ? x(e) : null, e = e === null ? null : e.stateNode, e;
  };
  var Ey = {
    bundleType: 0,
    version: "19.2.5",
    rendererPackageName: "react-dom",
    currentDispatcherRef: C,
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
  return Gs.createRoot = function(e, t) {
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
  }, Gs.hydrateRoot = function(e, t, n) {
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
    ), t.context = Jm(null), n = t.current, l = Pt(), l = ic(l), i = cl(l), i.callback = null, ul(n, i, l), n = l, t.current.lanes = n, Fa(t, n), Tn(t), e[ta] = t.current, Fu(e), new Sr(t);
  }, Gs.version = "19.2.5", Gs;
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
var Yy = qy(), O = $o();
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
const sp = O.createContext(new ap());
function ai() {
  return O.useContext(sp);
}
function Gy({ children: a }) {
  const s = O.useRef(new ap());
  return O.useEffect(() => {
    const r = () => {
      const u = window.__HASS__;
      u && s.current.update(u);
    };
    return window.addEventListener("hass-updated", r), r(), () => window.removeEventListener("hass-updated", r);
  }, []), /* @__PURE__ */ o.jsx(sp.Provider, { value: s.current, children: a });
}
function Pl(a, s = 24) {
  const r = ai(), [u, f] = O.useState([]), [d, m] = O.useState(!1), p = O.useRef(null), y = O.useRef(0), g = O.useCallback(() => {
    if (!a) return;
    const x = r.getEntity(a);
    if (!x) return;
    const _ = x.state, S = parseFloat(_);
    if (!Number.isFinite(S)) return;
    const j = new Date(x.last_updated || x.last_changed).getTime();
    !Number.isFinite(j) || j <= y.current || (y.current = j, f((T) => [...T, { t: j, v: S }]));
  }, [a, r]);
  return O.useEffect(() => {
    var X, P, ee;
    if (!a) {
      f([]);
      return;
    }
    const x = r.hass;
    if (!x) return;
    (X = p.current) == null || X.abort();
    const _ = new AbortController();
    p.current = _, m(!0);
    const S = /* @__PURE__ */ new Date(), T = new Date(S.getTime() - s * 36e5).toISOString(), H = S.toISOString(), V = `${window.__HA_BASE_URL__ || ""}/api/history/period/${T}?end_time=${H}&filter_entity_id=${encodeURIComponent(a)}&minimal_response&no_attributes`, I = (ee = (P = x.auth) == null ? void 0 : P.data) == null ? void 0 : ee.access_token;
    return fetch(V, {
      headers: { Authorization: `Bearer ${I}`, "Content-Type": "application/json" },
      signal: _.signal
    }).then((W) => {
      if (!W.ok) throw new Error(`HTTP ${W.status}`);
      return W.json();
    }).then((W) => {
      if (_.signal.aborted) return;
      const J = [], K = (W == null ? void 0 : W[0]) ?? [];
      for (const ce of K) {
        const ge = parseFloat(ce.state ?? ce.s);
        if (!Number.isFinite(ge)) continue;
        const se = new Date(ce.last_changed ?? ce.lu * 1e3).getTime();
        Number.isFinite(se) && J.push({ t: se, v: ge });
      }
      f(J), y.current = J.length > 0 ? J[J.length - 1].t : 0;
    }).catch((W) => {
      W.name !== "AbortError" && console.error("[useHistory]", W);
    }).finally(() => {
      _.signal.aborted || m(!1);
    }), () => _.abort();
  }, [a, s, r]), O.useEffect(() => {
    if (a)
      return r.subscribeEntity(a, g);
  }, [a, r, g]), { data: u, loading: d };
}
function he(a) {
  const s = ai(), r = O.useCallback(
    (f) => s.subscribeEntity(a, f),
    [s, a]
  ), u = O.useCallback(
    () => s.getEntity(a),
    [s, a]
  );
  return O.useSyncExternalStore(r, u);
}
function G(a) {
  const s = he(a), r = s == null ? void 0 : s.state;
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
    for (let L = 0; L < p.length; L++) {
      let V = p[L];
      if (g === 0) {
        if (V === f && (u || p.slice(L, L + d) === s)) {
          y.push(p.slice(x, L)), x = L + d;
          continue;
        }
        if (V === "/") {
          _ = L;
          continue;
        }
      }
      V === "[" ? g++ : V === "]" && g--;
    }
    const S = y.length === 0 ? p : p.substring(x), j = S.startsWith(up), T = j ? S.substring(1) : S, H = _ && _ > x ? _ - x : void 0;
    return {
      modifiers: y,
      hasImportantModifier: j,
      baseClassName: T,
      maybePostfixModifierPosition: H
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
    let T = !!j, H = u(T ? S.substring(0, j) : S);
    if (!H) {
      if (!T) {
        p = g + (p.length > 0 ? " " + p : p);
        continue;
      }
      if (H = u(S), !H) {
        p = g + (p.length > 0 ? " " + p : p);
        continue;
      }
      T = !1;
    }
    const L = Wy(x).join(":"), V = _ ? L + up : L, I = V + H;
    if (d.includes(I))
      continue;
    d.push(I);
    const X = f(H, T);
    for (let P = 0; P < X.length; ++P) {
      const ee = X[P];
      d.push(V + ee);
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
}, fp = /^\[(?:([a-z-]+):)?(.+)\]$/i, nv = /^\d+\/\d+$/, lv = /* @__PURE__ */ new Set(["px", "full", "screen"]), av = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, sv = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, iv = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, rv = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, cv = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, In = (a) => Ba(a) || lv.has(a) || nv.test(a), Nl = (a) => Va(a, "length", gv), Ba = (a) => !!a && !Number.isNaN(Number(a)), jo = (a) => Va(a, "number", Ba), Xs = (a) => !!a && Number.isInteger(Number(a)), uv = (a) => a.endsWith("%") && Ba(a.slice(0, -1)), be = (a) => fp.test(a), Ml = (a) => av.test(a), ov = /* @__PURE__ */ new Set(["length", "size", "percentage"]), fv = (a) => Va(a, ov, dp), dv = (a) => Va(a, "position", dp), hv = /* @__PURE__ */ new Set(["image", "url"]), mv = (a) => Va(a, hv, vv), pv = (a) => Va(a, "", yv), Vs = () => !0, Va = (a, s, r) => {
  const u = fp.exec(a);
  return u ? u[1] ? typeof s == "string" ? u[1] === s : s.has(u[1]) : r(u[2]) : !1;
}, gv = (a) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  sv.test(a) && !iv.test(a)
), dp = () => !1, yv = (a) => rv.test(a), vv = (a) => cv.test(a), xv = () => {
  const a = tt("colors"), s = tt("spacing"), r = tt("blur"), u = tt("brightness"), f = tt("borderColor"), d = tt("borderRadius"), m = tt("borderSpacing"), p = tt("borderWidth"), y = tt("contrast"), g = tt("grayscale"), x = tt("hueRotate"), _ = tt("invert"), S = tt("gap"), j = tt("gradientColorStops"), T = tt("gradientColorStopPositions"), H = tt("inset"), L = tt("margin"), V = tt("opacity"), I = tt("padding"), X = tt("saturate"), P = tt("scale"), ee = tt("sepia"), W = tt("skew"), J = tt("space"), K = tt("translate"), ce = () => ["auto", "contain", "none"], ge = () => ["auto", "hidden", "clip", "visible", "scroll"], se = () => ["auto", be, s], te = () => [be, s], Me = () => ["", In, Nl], oe = () => ["auto", Ba, be], we = () => ["bottom", "center", "left", "left-bottom", "left-top", "right", "right-bottom", "right-top", "top"], C = () => ["solid", "dashed", "dotted", "double", "none"], q = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], F = () => ["start", "end", "center", "between", "around", "evenly", "stretch"], ve = () => ["", "0", be], je = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], b = () => [Ba, be];
  return {
    cacheSize: 500,
    separator: ":",
    theme: {
      colors: [Vs],
      spacing: [In, Nl],
      blur: ["none", "", Ml, be],
      brightness: b(),
      borderColor: [a],
      borderRadius: ["none", "", "full", Ml, be],
      borderSpacing: te(),
      borderWidth: Me(),
      contrast: b(),
      grayscale: ve(),
      hueRotate: b(),
      invert: ve(),
      gap: te(),
      gradientColorStops: [a],
      gradientColorStopPositions: [uv, Nl],
      inset: se(),
      margin: se(),
      opacity: b(),
      padding: te(),
      saturate: b(),
      scale: b(),
      sepia: ve(),
      skew: b(),
      space: te(),
      translate: te()
    },
    classGroups: {
      // Layout
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", "video", be]
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
        "break-after": je()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": je()
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
        object: [...we(), be]
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: ge()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": ge()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": ge()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: ce()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": ce()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": ce()
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
        inset: [H]
      }],
      /**
       * Right / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": [H]
      }],
      /**
       * Top / Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": [H]
      }],
      /**
       * Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      start: [{
        start: [H]
      }],
      /**
       * End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      end: [{
        end: [H]
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: [H]
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: [H]
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: [H]
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: [H]
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
        z: ["auto", Xs, be]
      }],
      // Flexbox and Grid
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: se()
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
        flex: ["1", "auto", "initial", "none", be]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ve()
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ve()
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: ["first", "last", "none", Xs, be]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": [Vs]
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: ["auto", {
          span: ["full", Xs, be]
        }, be]
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": oe()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": oe()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": [Vs]
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: ["auto", {
          span: [Xs, be]
        }, be]
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": oe()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": oe()
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
        "auto-cols": ["auto", "min", "max", "fr", be]
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": ["auto", "min", "max", "fr", be]
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
        justify: ["normal", ...F()]
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
        content: ["normal", ...F(), "baseline"]
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
        "place-content": [...F(), "baseline"]
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
        p: [I]
      }],
      /**
       * Padding X
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: [I]
      }],
      /**
       * Padding Y
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: [I]
      }],
      /**
       * Padding Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: [I]
      }],
      /**
       * Padding End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: [I]
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: [I]
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: [I]
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: [I]
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: [I]
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: [L]
      }],
      /**
       * Margin X
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: [L]
      }],
      /**
       * Margin Y
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: [L]
      }],
      /**
       * Margin Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: [L]
      }],
      /**
       * Margin End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: [L]
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: [L]
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: [L]
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: [L]
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: [L]
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
        w: ["auto", "min", "max", "fit", "svw", "lvw", "dvw", be, s]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [be, s, "min", "max", "fit"]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [be, s, "none", "full", "min", "max", "fit", "prose", {
          screen: [Ml]
        }, Ml]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: [be, s, "auto", "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": [be, s, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": [be, s, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Size
       * @see https://tailwindcss.com/docs/size
       */
      size: [{
        size: [be, s, "auto", "min", "max", "fit"]
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
        font: [Vs]
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
        tracking: ["tighter", "tight", "normal", "wide", "wider", "widest", be]
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
        leading: ["none", "tight", "snug", "normal", "relaxed", "loose", In, be]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", be]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["none", "disc", "decimal", be]
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
        decoration: [...C(), "wavy"]
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
        "underline-offset": ["auto", In, be]
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
        indent: te()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", be]
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
        content: ["none", be]
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
        bg: [...we(), dv]
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
        border: [...C(), "hidden"]
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
        divide: C()
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
        outline: ["", ...C()]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [In, be]
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
        ring: Me()
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
        shadow: [Vs]
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
        "drop-shadow": ["", "none", Ml, be]
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
        saturate: [X]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: [ee]
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
        "backdrop-saturate": [X]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": [ee]
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
        transition: ["none", "all", "", "colors", "opacity", "shadow", "transform", be]
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
        ease: ["linear", "in", "out", "in-out", be]
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
        animate: ["none", "spin", "ping", "pulse", "bounce", be]
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
        scale: [P]
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": [P]
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": [P]
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: [Xs, be]
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": [K]
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": [K]
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": [W]
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": [W]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: ["center", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left", be]
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
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", be]
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
        "scroll-m": te()
      }],
      /**
       * Scroll Margin X
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": te()
      }],
      /**
       * Scroll Margin Y
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": te()
      }],
      /**
       * Scroll Margin Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": te()
      }],
      /**
       * Scroll Margin End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": te()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": te()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": te()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": te()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": te()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": te()
      }],
      /**
       * Scroll Padding X
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": te()
      }],
      /**
       * Scroll Padding Y
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": te()
      }],
      /**
       * Scroll Padding Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": te()
      }],
      /**
       * Scroll Padding End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": te()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": te()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": te()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": te()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": te()
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
        "will-change": ["auto", "scroll", "contents", "transform", be]
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
function ie(...a) {
  return _v(rp(a));
}
function Z(a, s = 1) {
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
function Qa({
  data: a,
  width: s = 80,
  height: r = 24,
  color: u = "currentColor",
  className: f,
  onClick: d
}) {
  const m = O.useMemo(() => {
    if (a.length < 2) return "";
    const p = a[0].t, g = a[a.length - 1].t - p || 1;
    let x = 1 / 0, _ = -1 / 0;
    for (const L of a)
      L.v < x && (x = L.v), L.v > _ && (_ = L.v);
    const S = _ - x || 1, j = 1, T = s - j * 2, H = r - j * 2;
    return a.map((L, V) => {
      const I = j + (L.t - p) / g * T, X = j + H - (L.v - x) / S * H;
      return `${V === 0 ? "M" : "L"}${I.toFixed(1)},${X.toFixed(1)}`;
    }).join(" ");
  }, [a, s, r]);
  return a.length < 2 ? null : /* @__PURE__ */ o.jsx(
    "svg",
    {
      width: s,
      height: r,
      viewBox: `0 0 ${s} ${r}`,
      className: ie("shrink-0", d && "cursor-pointer hover:opacity-80", f),
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
  const [d, m] = O.useState(null), p = O.useRef(null), [y, g] = O.useState(null), x = O.useRef(null), _ = O.useCallback((Q) => {
    x.current = Q, g(Q);
  }, []), S = O.useRef(!1), j = O.useRef(!1), T = O.useRef(0), H = O.useRef(null), L = O.useRef({ data: a, width: s });
  L.current = { data: a, width: s };
  const V = a.length > 0 ? `${a[0].t}-${a[a.length - 1].t}` : "", I = O.useRef(V);
  V !== I.current && (I.current = V, y && _(null));
  const X = O.useMemo(() => {
    if (!y || a.length < 2) return a;
    const [Q, fe] = y;
    return a.filter((Se) => Se.t >= Q && Se.t <= fe);
  }, [a, y]);
  O.useEffect(() => {
    const Q = p.current;
    if (!Q) return;
    const fe = { left: 48, right: 12 }, Se = (re) => {
      const Ke = Q.getBoundingClientRect();
      return (re - Ke.left) * (L.current.width / Ke.width);
    }, ke = (re) => {
      const Ke = L.current.width;
      return Math.max(0, Math.min(1, (re - fe.left) / (Ke - fe.left - fe.right)));
    }, _t = (re, Ke) => {
      const { data: Ct, width: Vt } = L.current, Re = x.current;
      if (Ct.length < 2) return;
      const nt = Ct[0].t, wt = Ct[Ct.length - 1].t, gn = Re ? Re[0] : nt, On = (Re ? Re[1] : wt) - gn, St = On * re, Qt = (wt - nt) * 5e-3;
      if (St < Qt) return;
      if (St >= wt - nt) {
        _(null);
        return;
      }
      const Ne = gn + Ke * On;
      let Fe = Ne - Ke * St, Be = Ne + (1 - Ke) * St;
      Fe < nt && (Be += nt - Fe, Fe = nt), Be > wt && (Fe -= Be - wt, Be = wt), Fe = Math.max(Fe, nt), Be = Math.min(Be, wt), _([Fe, Be]);
    }, Ze = (re) => {
      const { data: Ke } = L.current;
      if (Ke.length < 2) return;
      re.preventDefault();
      const Ct = ke(Se(re.clientX)), Vt = re.deltaY > 0 ? 1.3 : 1 / 1.3;
      _t(Vt, Ct);
    };
    let Oe = "idle", We = 0, Ie = null, ft = null;
    const Rt = (re, Ke, Ct, Vt) => Math.sqrt((Ct - re) ** 2 + (Vt - Ke) ** 2), tn = (re) => {
      const { data: Ke } = L.current;
      Ke.length < 2 || (re.preventDefault(), re.touches.length >= 2 ? (Oe = "pinch", Ie = { x: re.touches[0].clientX, y: re.touches[0].clientY }, ft = { x: re.touches[1].clientX, y: re.touches[1].clientY }) : re.touches.length === 1 && (Oe = "pan", We = Se(re.touches[0].clientX)));
    }, nn = (re) => {
      const { data: Ke, width: Ct } = L.current, Vt = x.current;
      if (Ke.length < 2) return;
      re.preventDefault();
      const Re = Ke[0].t, nt = Ke[Ke.length - 1].t, wt = Vt ? Vt[0] : Re, gn = Vt ? Vt[1] : nt, ln = gn - wt, On = Ct - fe.left - fe.right;
      if (re.touches.length >= 2) {
        if (Oe !== "pinch" || !Ie || !ft) {
          Oe = "pinch", Ie = { x: re.touches[0].clientX, y: re.touches[0].clientY }, ft = { x: re.touches[1].clientX, y: re.touches[1].clientY };
          return;
        }
        const St = { x: re.touches[0].clientX, y: re.touches[0].clientY }, Qt = { x: re.touches[1].clientX, y: re.touches[1].clientY }, Ne = Rt(Ie.x, Ie.y, ft.x, ft.y), Fe = Rt(St.x, St.y, Qt.x, Qt.y);
        if (Ne > 10 && Fe > 10) {
          const Be = Ne / Fe, Zt = ln * Be, zt = (nt - Re) * 5e-3, ac = (Ie.x + ft.x) / 2, di = (St.x + Qt.x) / 2, Ja = ke(Se(di)), Al = -((Se(di) - Se(ac)) / On) * ln;
          if (Zt >= nt - Re)
            _(null);
          else if (Zt >= zt) {
            const Cl = wt + Ja * ln;
            let kt = Cl - Ja * Zt + Al, an = Cl + (1 - Ja) * Zt + Al;
            kt < Re && (an += Re - kt, kt = Re), an > nt && (kt -= an - nt, an = nt), kt = Math.max(kt, Re), an = Math.min(an, nt), _([kt, an]);
          }
        }
        Ie = St, ft = Qt;
      } else if (re.touches.length === 1) {
        if (Oe === "pinch") {
          Oe = "pan", We = Se(re.touches[0].clientX), Ie = null, ft = null;
          return;
        }
        const St = Se(re.touches[0].clientX), Qt = St - We;
        if (Math.abs(Qt) > 1) {
          const Ne = -(Qt / On) * ln;
          let Fe = wt + Ne, Be = gn + Ne;
          Fe < Re && (Be += Re - Fe, Fe = Re), Be > nt && (Fe -= Be - nt, Be = nt), Fe = Math.max(Fe, Re), Be = Math.min(Be, nt), _([Fe, Be]), We = St;
        }
      }
    }, bt = (re) => {
      re.touches.length === 0 ? (Oe = "idle", Ie = null, ft = null) : re.touches.length === 1 && Oe === "pinch" ? (Oe = "pan", We = Se(re.touches[0].clientX), Ie = null, ft = null) : re.touches.length >= 2 && Oe !== "pinch" && (Oe = "pinch", Ie = { x: re.touches[0].clientX, y: re.touches[0].clientY }, ft = { x: re.touches[1].clientX, y: re.touches[1].clientY });
    };
    return Q.addEventListener("wheel", Ze, { passive: !1 }), Q.addEventListener("touchstart", tn, { passive: !1 }), Q.addEventListener("touchmove", nn, { passive: !1 }), Q.addEventListener("touchend", bt), () => {
      Q.removeEventListener("wheel", Ze), Q.removeEventListener("touchstart", tn), Q.removeEventListener("touchmove", nn), Q.removeEventListener("touchend", bt);
    };
  }, []);
  const P = O.useMemo(() => {
    if (X.length < 2) return null;
    const Q = { top: 12, right: 12, bottom: 32, left: 48 }, fe = s - Q.left - Q.right, Se = r - Q.top - Q.bottom, ke = X[0].t, Ze = X[X.length - 1].t - ke || 1;
    let Oe = 1 / 0, We = -1 / 0;
    for (const Ne of X)
      Ne.v < Oe && (Oe = Ne.v), Ne.v > We && (We = Ne.v);
    const Ie = (We - Oe) * 0.05 || 1;
    Oe -= Ie, We += Ie;
    const ft = We - Oe, Rt = (Ne) => Q.left + (Ne - ke) / Ze * fe, tn = (Ne) => Q.top + Se - (Ne - Oe) / ft * Se, nn = (Ne) => ke + (Ne - Q.left) / fe * Ze, bt = X.map((Ne, Fe) => `${Fe === 0 ? "M" : "L"}${Rt(Ne.t).toFixed(1)},${tn(Ne.v).toFixed(1)}`).join(" "), re = bt + ` L${Rt(X[X.length - 1].t).toFixed(1)},${(Q.top + Se).toFixed(1)} L${Rt(X[0].t).toFixed(1)},${(Q.top + Se).toFixed(1)} Z`, Ke = jv(ft, 5), Ct = [], Vt = Math.ceil(Oe / Ke) * Ke;
    for (let Ne = Vt; Ne <= We; Ne += Ke) Ct.push(Ne);
    const Re = Ze > 864e5, nt = Math.min(6, Math.floor(fe / 80)), wt = [];
    for (let Ne = 0; Ne <= nt; Ne++)
      wt.push(ke + Ze * Ne / nt);
    let gn = 0;
    for (const Ne of X) gn += Ne.v;
    const ln = gn / X.length, On = Math.min(...X.map((Ne) => Ne.v)), St = Math.max(...X.map((Ne) => Ne.v)), Qt = X[X.length - 1].v;
    return { margin: Q, w: fe, h: Se, linePath: bt, areaPath: re, toX: Rt, toY: tn, fromX: nn, yTicks: Ct, xTicks: wt, showDates: Re, minV: Oe, maxV: We, stats: { avg: ln, min: On, max: St, current: Qt } };
  }, [X, s, r]), ee = O.useCallback(
    (Q) => {
      if (!p.current || !H.current || a.length < 2) return;
      const fe = p.current.getBoundingClientRect(), Se = s / fe.width, _t = (Q - fe.left) * Se - T.current;
      if (Math.abs(_t) > 3 && !j.current && (j.current = !0, m(null)), j.current) {
        const Ze = { left: 48, right: 12 }, Oe = s - Ze.left - Ze.right, [We, Ie] = H.current, ft = Ie - We, Rt = -(_t / Oe) * ft, tn = a[0].t, nn = a[a.length - 1].t;
        let bt = We + Rt, re = Ie + Rt;
        bt < tn && (re += tn - bt, bt = tn), re > nn && (bt -= re - nn, re = nn), bt = Math.max(bt, tn), re = Math.min(re, nn), _([bt, re]);
      }
    },
    [a, s, _]
  ), W = O.useCallback(
    (Q) => {
      if (!P || !p.current || S.current) return;
      const fe = p.current.getBoundingClientRect(), Se = s / fe.width, ke = (Q.clientX - fe.left) * Se, _t = P.fromX(ke);
      let Ze = 0, Oe = X.length - 1;
      for (; Ze < Oe; ) {
        const We = Ze + Oe >> 1;
        X[We].t < _t ? Ze = We + 1 : Oe = We;
      }
      Ze > 0 && Math.abs(X[Ze - 1].t - _t) < Math.abs(X[Ze].t - _t) && Ze--, m(Ze);
    },
    [P, X, s]
  ), J = O.useRef(null), K = O.useRef(null), ce = O.useCallback(() => {
    J.current && window.removeEventListener("mousemove", J.current), K.current && window.removeEventListener("mouseup", K.current), J.current = null, K.current = null;
  }, []), ge = O.useCallback(
    (Q) => {
      if (!p.current || a.length < 2) return;
      S.current = !0, j.current = !1;
      const fe = p.current.getBoundingClientRect(), Se = s / fe.width;
      T.current = (Q.clientX - fe.left) * Se;
      const ke = a[0].t, _t = a[a.length - 1].t;
      H.current = x.current ?? [ke, _t], ce();
      const Ze = (We) => {
        We.preventDefault(), ee(We.clientX);
      }, Oe = () => {
        S.current = !1, ce();
      };
      J.current = Ze, K.current = Oe, window.addEventListener("mousemove", Ze), window.addEventListener("mouseup", Oe);
    },
    [a, y, s, ee, ce]
  );
  O.useEffect(() => () => ce(), [ce]);
  const se = O.useCallback(() => {
    S.current || m(null);
  }, []);
  if (!P)
    return /* @__PURE__ */ o.jsx("div", { className: "flex items-center justify-center h-full text-muted-foreground text-sm", children: "No data" });
  const { margin: te, h: Me, linePath: oe, areaPath: we, toX: C, toY: q, yTicks: F, xTicks: ve, showDates: je, stats: b } = P, R = Math.abs(b.max - b.min) < 10 ? 1 : 0, Y = (Q) => Q.toFixed(R), $ = d != null ? X[d] : null, me = y != null;
  return /* @__PURE__ */ o.jsxs("div", { children: [
    /* @__PURE__ */ o.jsx("div", { className: "flex items-center justify-end mb-1 min-h-[1.5rem]", children: me && /* @__PURE__ */ o.jsx(
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
        className: ie("w-full select-none", me ? "cursor-grab active:cursor-grabbing" : ""),
        viewBox: `0 0 ${s} ${r}`,
        style: { touchAction: "none", cursor: me ? void 0 : "crosshair" },
        onMouseMove: W,
        onMouseDown: ge,
        onMouseLeave: se,
        children: [
          F.map((Q) => /* @__PURE__ */ o.jsxs("g", { children: [
            /* @__PURE__ */ o.jsx(
              "line",
              {
                x1: te.left,
                y1: q(Q),
                x2: s - te.right,
                y2: q(Q),
                stroke: "currentColor",
                className: "text-border",
                strokeWidth: 0.5
              }
            ),
            /* @__PURE__ */ o.jsx(
              "text",
              {
                x: te.left - 6,
                y: q(Q) + 4,
                textAnchor: "end",
                className: "fill-muted-foreground",
                fontSize: 10,
                children: Y(Q)
              }
            )
          ] }, Q)),
          ve.map((Q) => /* @__PURE__ */ o.jsx(
            "text",
            {
              x: C(Q),
              y: te.top + Me + 20,
              textAnchor: "middle",
              className: "fill-muted-foreground",
              fontSize: 10,
              children: je ? Sv(Q) : wv(Q)
            },
            Q
          )),
          /* @__PURE__ */ o.jsx("path", { d: we, fill: u, opacity: 0.1 }),
          /* @__PURE__ */ o.jsx("path", { d: oe, fill: "none", stroke: u, strokeWidth: 2, strokeLinejoin: "round" }),
          $ && /* @__PURE__ */ o.jsxs(o.Fragment, { children: [
            /* @__PURE__ */ o.jsx(
              "line",
              {
                x1: C($.t),
                y1: te.top,
                x2: C($.t),
                y2: te.top + Me,
                stroke: u,
                strokeWidth: 1,
                opacity: 0.4,
                strokeDasharray: "3,3"
              }
            ),
            /* @__PURE__ */ o.jsx(
              "circle",
              {
                cx: C($.t),
                cy: q($.v),
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
              x: te.left,
              y: te.top,
              width: s - te.left - te.right,
              height: Me,
              fill: "transparent"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ o.jsx("div", { className: "flex gap-4 mt-2 text-xs min-h-[1.25rem]", children: $ ? /* @__PURE__ */ o.jsxs(o.Fragment, { children: [
      /* @__PURE__ */ o.jsx("span", { className: "text-muted-foreground", children: new Date($.t).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }) }),
      /* @__PURE__ */ o.jsxs("span", { className: "font-semibold", style: { color: u }, children: [
        Y($.v),
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
const Ev = O.forwardRef(
  ({
    color: a = "currentColor",
    size: s = 24,
    strokeWidth: r = 2,
    absoluteStrokeWidth: u,
    className: f = "",
    children: d,
    iconNode: m,
    ...p
  }, y) => O.createElement(
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
      ...m.map(([g, x]) => O.createElement(g, x)),
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
const ae = (a, s) => {
  const r = O.forwardRef(
    ({ className: u, ...f }, d) => O.createElement(Ev, {
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
const Av = ae("AirVent", [
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
const Cv = ae("ArrowDown", [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const zv = ae("ArrowUp", [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Fo = ae("BatteryLow", [
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
const kv = ae("BatteryMedium", [
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
const Io = ae("Battery", [
  ["rect", { width: "16", height: "10", x: "2", y: "7", rx: "2", ry: "2", key: "1w10f2" }],
  ["line", { x1: "22", x2: "22", y1: "11", y2: "13", key: "4dh1rd" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ov = ae("Bed", [
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
const Rv = ae("Camera", [
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
const pp = ae("Car", [
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
const Dv = ae("ChevronLeft", [
  ["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Hv = ae("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const gp = ae("CircleDot", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const v0 = ae("CloudDrizzle", [
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
const Uv = ae("CloudFog", [
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
const No = ae("CloudRain", [
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
const x0 = ae("CloudSnow", [
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
const Lv = ae("CloudSun", [
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
const Ho = ae("Cloud", [
  ["path", { d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z", key: "p7xjir" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Bv = ae("Cpu", [
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
const Za = ae("Droplets", [
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
const qv = ae("Fan", [
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
const si = ae("Flame", [
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
const yp = ae("Fuel", [
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
const vp = ae("Gauge", [
  ["path", { d: "m12 14 4-4", key: "9kzdfg" }],
  ["path", { d: "M3.34 19a10 10 0 1 1 17.32 0", key: "19p75a" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Yv = ae("Globe", [
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
const Gv = ae("Grid2x2", [
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
const Xv = ae("History", [
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
const xp = ae("House", [
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
const Mo = ae("LampDesk", [
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
const ii = ae("Lightbulb", [
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
const Po = ae("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Vv = ae("MapPin", [
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
const Qv = ae("Maximize2", [
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
const Zv = ae("Minus", [["path", { d: "M5 12h14", key: "1ays0h" }]]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const _0 = ae("Monitor", [
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
const ef = ae("Moon", [
  ["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", key: "a7tn18" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const _p = ae("Mountain", [
  ["path", { d: "m8 3 4 8 5-5 5 15H2L8 3z", key: "otkl63" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Kv = ae("Music", [
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
const Jv = ae("Play", [
  ["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const bp = ae("PlugZap", [
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
const $v = ae("Plug", [
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
const Wv = ae("Plus", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const wp = ae("Power", [
  ["path", { d: "M12 2v10", key: "mnfbl" }],
  ["path", { d: "M18.4 6.6a9 9 0 1 1-12.77.04", key: "obofu9" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Fv = ae("Radio", [
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
const Iv = ae("Satellite", [
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
const Pv = ae("Settings", [
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
const Wr = ae("ShowerHead", [
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
const ex = ae("Snowflake", [
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
const Fr = ae("Sun", [
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
const Ir = ae("Thermometer", [
  ["path", { d: "M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z", key: "17jzev" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const tx = ae("ToggleLeft", [
  ["rect", { width: "20", height: "12", x: "2", y: "6", rx: "6", ry: "6", key: "f2vt7d" }],
  ["circle", { cx: "8", cy: "12", r: "2", key: "1nvbw3" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Pr = ae("Trash2", [
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
const nx = ae("Trash", [
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
const lx = ae("TriangleAlert", [
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
const ax = ae("Truck", [
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
const Sp = ae("VideoOff", [
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
const sx = ae("Waves", [
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
const ix = ae("Wifi", [
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
const Ps = ae("Wind", [
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
const rx = ae("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ri = ae("Zap", [
  [
    "path",
    {
      d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
      key: "1xq2db"
    }
  ]
]), jp = O.createContext({ open: () => {
} });
function zn() {
  return O.useContext(jp);
}
const cx = [
  { label: "1h", hours: 1 },
  { label: "6h", hours: 6 },
  { label: "24h", hours: 24 },
  { label: "3d", hours: 72 },
  { label: "7d", hours: 168 }
];
function ux({ children: a }) {
  const [s, r] = O.useState(null), [u, f] = O.useState(24), d = O.useRef(!1), m = O.useCallback((x, _, S = "") => {
    r({ entityId: x, name: _, unit: S }), f(24);
  }, []), p = O.useCallback(() => {
    r(null);
  }, []);
  O.useEffect(() => {
    if (!s) return;
    const x = (_) => {
      _.key === "Escape" && p();
    };
    return window.addEventListener("keydown", x), () => window.removeEventListener("keydown", x);
  }, [s, p]);
  const { data: y, loading: g } = Pl((s == null ? void 0 : s.entityId) ?? null, u);
  return /* @__PURE__ */ o.jsxs(jp.Provider, { value: { open: m }, children: [
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
            className: ie(
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
  const m = he(a.entityId), p = (m == null ? void 0 : m.last_updated) || (m == null ? void 0 : m.last_changed), y = p ? hp(p) : null;
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
        className: ie(
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
  return /* @__PURE__ */ o.jsxs("div", { className: ie("p-4 md:p-6 space-y-4 max-w-screen-2xl mx-auto", r), children: [
    /* @__PURE__ */ o.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: a }),
    s
  ] });
}
const Ue = O.forwardRef(
  ({ className: a, ...s }, r) => /* @__PURE__ */ o.jsx(
    "div",
    {
      ref: r,
      className: ie("rounded-lg border bg-card text-card-foreground shadow-sm", a),
      ...s
    }
  )
);
Ue.displayName = "Card";
const at = O.forwardRef(
  ({ className: a, ...s }, r) => /* @__PURE__ */ o.jsx("div", { ref: r, className: ie("flex flex-col space-y-1.5 p-5 pb-0", a), ...s })
);
at.displayName = "CardHeader";
const st = O.forwardRef(
  ({ className: a, ...s }, r) => /* @__PURE__ */ o.jsx("div", { ref: r, className: ie("text-sm font-semibold leading-none", a), ...s })
);
st.displayName = "CardTitle";
const fx = O.forwardRef(
  ({ className: a, ...s }, r) => /* @__PURE__ */ o.jsx("div", { ref: r, className: ie("text-xs text-muted-foreground", a), ...s })
);
fx.displayName = "CardDescription";
const Le = O.forwardRef(
  ({ className: a, ...s }, r) => /* @__PURE__ */ o.jsx("div", { ref: r, className: ie("p-5 pt-4", a), ...s })
);
Le.displayName = "CardContent";
const Np = O.forwardRef(
  ({ className: a, value: s = 0, max: r = 100, indicatorClassName: u, ...f }, d) => {
    const m = Math.min(100, Math.max(0, s / r * 100));
    return /* @__PURE__ */ o.jsx(
      "div",
      {
        ref: d,
        className: ie("relative h-2 w-full overflow-hidden rounded-full bg-secondary", a),
        ...f,
        children: /* @__PURE__ */ o.jsx(
          "div",
          {
            className: ie(
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
Np.displayName = "Progress";
function pe({
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
      className: ie(
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
          /* @__PURE__ */ o.jsx(Qa, { data: y, color: d, width: 64, height: 20 }),
          /* @__PURE__ */ o.jsxs("span", { className: "font-medium tabular-nums text-sm shrink-0", children: [
            r,
            u && /* @__PURE__ */ o.jsx("span", { className: "text-muted-foreground ml-0.5 text-xs", children: u })
          ] })
        ] })
      ]
    }
  );
}
function Mp({ compact: a = !1 }) {
  const { value: s } = G("sensor.olins_van_bms_battery"), { value: r } = G("sensor.olins_van_bms_voltage"), { value: u } = G("sensor.olins_van_bms_current"), { value: f } = G("sensor.olins_van_bms_power"), { value: d } = G("sensor.olins_van_bms_stored_energy"), { value: m } = G("sensor.olins_van_bms_temperature"), { value: p } = G("sensor.olins_van_bms_cycles"), { value: y } = G("sensor.olins_van_bms_delta_voltage"), { data: g } = Pl("sensor.olins_van_bms_battery", 12), { open: x } = zn(), _ = (u ?? 0) > 0, S = bv(u, f, d), j = s ?? 0, T = j < 30 ? "text-red-500" : j < 65 ? "text-orange-500" : "text-green-500", H = j < 30 ? "bg-red-500" : j < 65 ? "bg-orange-500" : "bg-green-500";
  return /* @__PURE__ */ o.jsxs(Ue, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(Io, { className: "h-4 w-4" }),
      "Battery",
      /* @__PURE__ */ o.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
        /* @__PURE__ */ o.jsx(
          Qa,
          {
            data: g,
            color: j < 30 ? "#ef4444" : j < 65 ? "#f97316" : "#22c55e",
            width: 64,
            height: 20,
            onClick: () => x("sensor.olins_van_bms_battery", "Battery SOC", "%")
          }
        ),
        /* @__PURE__ */ o.jsxs("span", { className: ie("text-2xl font-bold tabular-nums", T), children: [
          Z(s, 0),
          "%"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ o.jsxs(Le, { className: "space-y-3", children: [
      /* @__PURE__ */ o.jsx(Np, { value: j, className: "h-3", indicatorClassName: H }),
      /* @__PURE__ */ o.jsxs("div", { className: "grid gap-1", children: [
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.olins_van_bms_voltage", label: "Voltage", value: Z(r, 2), unit: "V", color: "#6366f1" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.olins_van_bms_current", label: "Current", value: Z(u, 2), unit: "A", color: "#06b6d4" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.olins_van_bms_power", label: "Power", value: Z(f != null ? Math.abs(f) : null, 0), unit: "W", color: "#f59e0b" }),
        !a && /* @__PURE__ */ o.jsxs(o.Fragment, { children: [
          /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.olins_van_bms_stored_energy", label: "Stored", value: Z(d, 0), unit: "Wh", color: "#8b5cf6" }),
          /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.olins_van_bms_temperature", label: "Temperature", value: Z(m, 1), unit: "°C", color: "#ef4444" }),
          /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.olins_van_bms_cycles", label: "Cycles", value: Z(p, 0), unit: "", color: "#64748b" }),
          /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.olins_van_bms_delta_voltage", label: "Cell Delta", value: Z(y, 3), unit: "V", color: "#ec4899" })
        ] })
      ] }),
      S && /* @__PURE__ */ o.jsx(
        "p",
        {
          className: ie(
            "text-xs font-medium text-center",
            _ ? "text-green-500" : "text-orange-500"
          ),
          children: S
        }
      )
    ] })
  ] });
}
function Tp({ compact: a = !1 }) {
  const { value: s } = G("sensor.total_mppt_pv_power"), { value: r } = G("sensor.a32_pro_mppt1_pv_power"), { value: u } = G("sensor.a32_pro_mppt2_pv_power"), { value: f } = G("sensor.a32_pro_mppt1_yield_today"), { value: d } = G("sensor.a32_pro_mppt2_yield_today"), { value: m } = G("sensor.total_mppt_yield_today"), { value: p } = G("sensor.average_mppt_output_voltage"), { value: y } = G("sensor.total_mppt_output_current"), { data: g } = Pl("sensor.total_mppt_pv_power", 12), { open: x } = zn(), _ = (s ?? 0) > 10;
  return /* @__PURE__ */ o.jsxs(Ue, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(Fr, { className: ie("h-4 w-4", _ ? "text-yellow-500" : "text-muted-foreground") }),
      "Solar",
      /* @__PURE__ */ o.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
        /* @__PURE__ */ o.jsx(
          Qa,
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
            className: ie(
              "text-2xl font-bold tabular-nums",
              _ ? "text-yellow-500" : "text-muted-foreground"
            ),
            children: [
              Z(s, 0),
              "W"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ o.jsxs(Le, { className: "space-y-3", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ o.jsxs(
          "div",
          {
            className: "space-y-1 rounded-lg bg-muted/50 p-2.5 cursor-pointer hover:bg-muted/80 transition-colors",
            onClick: () => x("sensor.a32_pro_mppt1_pv_power", "MPPT 1", "W"),
            children: [
              /* @__PURE__ */ o.jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "MPPT 1" }),
              /* @__PURE__ */ o.jsxs("p", { className: "text-lg font-bold tabular-nums", children: [
                Z(r, 0),
                "W"
              ] }),
              /* @__PURE__ */ o.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                Z(f, 2),
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
                Z(u, 0),
                "W"
              ] }),
              /* @__PURE__ */ o.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                Z(d, 2),
                " kWh today"
              ] })
            ]
          }
        )
      ] }),
      !a && /* @__PURE__ */ o.jsxs("div", { className: "grid gap-1", children: [
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.total_mppt_yield_today", label: "Total Yield", value: Z(m, 0), unit: "Wh", color: "#eab308" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.average_mppt_output_voltage", label: "Output Voltage", value: Z(p, 1), unit: "V", color: "#6366f1" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.total_mppt_output_current", label: "Output Current", value: Z(y, 1), unit: "A", color: "#06b6d4" })
      ] })
    ] })
  ] });
}
function Uo({ name: a, tempEntity: s, humidityEntity: r }) {
  const { value: u } = G(s), { value: f } = G(r), { data: d } = Pl(s, 12), { open: m } = zn();
  return /* @__PURE__ */ o.jsx(
    Ue,
    {
      className: "cursor-pointer hover:bg-muted/30 transition-colors",
      onClick: () => m(s, `${a} Temperature`, "°C"),
      children: /* @__PURE__ */ o.jsx(Le, { className: "pt-4 pb-4", children: /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsxs("div", { children: [
          /* @__PURE__ */ o.jsx("p", { className: "text-xs text-muted-foreground", children: a }),
          /* @__PURE__ */ o.jsxs("p", { className: "text-2xl font-bold tabular-nums", children: [
            Z(u, 1),
            "°C"
          ] })
        ] }),
        /* @__PURE__ */ o.jsxs("div", { className: "flex flex-col items-end gap-1", children: [
          /* @__PURE__ */ o.jsx(Qa, { data: d, color: "#ef4444", width: 56, height: 18 }),
          /* @__PURE__ */ o.jsxs(
            "div",
            {
              className: "flex items-center gap-1 text-muted-foreground",
              onClick: (p) => {
                p.stopPropagation(), m(r, `${a} Humidity`, "%");
              },
              children: [
                /* @__PURE__ */ o.jsx(Za, { className: "h-3.5 w-3.5" }),
                /* @__PURE__ */ o.jsxs("span", { className: "text-sm tabular-nums", children: [
                  Z(f, 0),
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
  const { value: f } = G(s), d = f ?? 0, m = r ? d > 80 ? "bg-red-500" : d > 60 ? "bg-orange-500" : "bg-green-500" : d < 20 ? "bg-red-500" : d < 50 ? "bg-orange-500" : "bg-blue-500";
  return /* @__PURE__ */ o.jsx(Ue, { children: /* @__PURE__ */ o.jsxs(Le, { className: "pt-4 pb-4", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ o.jsxs("p", { className: "text-sm font-medium flex items-center gap-1.5", children: [
        u,
        a
      ] }),
      /* @__PURE__ */ o.jsxs("p", { className: "text-lg font-bold tabular-nums", children: [
        Z(f, 0),
        "%"
      ] })
    ] }),
    /* @__PURE__ */ o.jsx("div", { className: "h-3 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ o.jsx(
      "div",
      {
        className: ie("h-full rounded-full transition-all duration-500", m),
        style: { width: `${Math.min(100, Math.max(0, d))}%` }
      }
    ) })
  ] }) });
}
function dx(a, s = "daily") {
  const r = ai(), [u, f] = O.useState([]);
  return O.useEffect(() => {
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
  const [r, u] = O.useState(null), f = O.useRef(null);
  return O.useEffect(() => {
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
      var H;
      if (p) return;
      const x = g.address, _ = (x == null ? void 0 : x.city) || (x == null ? void 0 : x.town) || (x == null ? void 0 : x.village) || (x == null ? void 0 : x.hamlet) || (x == null ? void 0 : x.county) || "", S = (x == null ? void 0 : x.state) || (x == null ? void 0 : x.province) || "", j = ((H = x == null ? void 0 : x.country_code) == null ? void 0 : H.toUpperCase()) || "";
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
  windy: Ps,
  "windy-variant": Ps,
  fog: Uv,
  hail: v0,
  lightning: v0,
  "lightning-rainy": No
};
function px(a) {
  return (a == null ? void 0 : a.replace(/-/g, " ").replace(/_/g, " ")) ?? "";
}
function gx() {
  var I, X;
  const a = he("weather.pirateweather"), s = he("device_tracker.starlink_device_location"), r = dx("weather.pirateweather", "daily"), u = (I = s == null ? void 0 : s.attributes) == null ? void 0 : I.latitude, f = (X = s == null ? void 0 : s.attributes) == null ? void 0 : X.longitude, d = mx(u, f);
  if (!a) return null;
  const m = a.state, p = a.attributes, y = p.temperature, g = p.humidity, x = p.wind_speed, _ = b0[m] || Ho, S = a.last_updated, j = r.slice(0, 7), T = j.flatMap((P) => [P.temperature, P.templow]), H = T.length > 0 ? Math.min(...T) : 0, V = (T.length > 0 ? Math.max(...T) : 30) - H || 1;
  return /* @__PURE__ */ o.jsxs(Ue, { children: [
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
    /* @__PURE__ */ o.jsxs(Le, { className: "space-y-3", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsxs("div", { children: [
          /* @__PURE__ */ o.jsxs("p", { className: "text-3xl font-bold tabular-nums", children: [
            Z(y, 0),
            "°C"
          ] }),
          /* @__PURE__ */ o.jsx("p", { className: "text-sm text-muted-foreground capitalize", children: px(m) })
        ] }),
        /* @__PURE__ */ o.jsxs("div", { className: "text-right space-y-1", children: [
          /* @__PURE__ */ o.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1 justify-end", children: [
            /* @__PURE__ */ o.jsx(Za, { className: "h-3 w-3" }),
            " ",
            Z(g, 0),
            "%"
          ] }),
          /* @__PURE__ */ o.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1 justify-end", children: [
            /* @__PURE__ */ o.jsx(Ps, { className: "h-3 w-3" }),
            " ",
            Z(x, 0),
            " km/h"
          ] })
        ] })
      ] }),
      j.length > 0 && /* @__PURE__ */ o.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ o.jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "7-Day Forecast" }),
        j.map((P, ee) => {
          const W = b0[P.condition] || Ho, J = new Date(P.datetime), K = ee === 0, ce = K ? "Today" : J.toLocaleDateString(void 0, { weekday: "short" }), ge = P.templow, se = P.temperature, te = (ge - H) / V * 100, Me = (se - H) / V * 100, oe = se > 30 ? "bg-red-500" : se > 20 ? "bg-orange-400" : se > 10 ? "bg-yellow-400" : se > 0 ? "bg-blue-400" : "bg-blue-600";
          return /* @__PURE__ */ o.jsxs(
            "div",
            {
              className: "grid items-center gap-1 text-xs",
              style: { gridTemplateColumns: "2.5rem 1.25rem 1fr 2rem 2rem" },
              children: [
                /* @__PURE__ */ o.jsx(
                  "span",
                  {
                    className: `truncate ${K ? "font-medium text-foreground" : "text-muted-foreground"}`,
                    children: ce
                  }
                ),
                /* @__PURE__ */ o.jsx(W, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                /* @__PURE__ */ o.jsx("div", { className: "relative h-2 rounded-full bg-muted", children: /* @__PURE__ */ o.jsx(
                  "div",
                  {
                    className: `absolute inset-y-0 rounded-full ${oe}`,
                    style: {
                      left: `${te}%`,
                      right: `${100 - Me}%`
                    }
                  }
                ) }),
                /* @__PURE__ */ o.jsxs("span", { className: "text-right tabular-nums text-muted-foreground", children: [
                  Math.round(ge),
                  "°"
                ] }),
                /* @__PURE__ */ o.jsxs("span", { className: "text-right tabular-nums font-medium", children: [
                  Math.round(se),
                  "°"
                ] })
              ]
            },
            ee
          );
        })
      ] }),
      j.some((P) => P.precipitation_probability > 0) && /* @__PURE__ */ o.jsx("div", { className: "flex gap-2 overflow-x-auto pb-1", children: j.map((P, ee) => {
        const W = P.precipitation_probability, J = new Date(P.datetime), K = ee === 0 ? "Tod" : J.toLocaleDateString(void 0, { weekday: "short" });
        return /* @__PURE__ */ o.jsxs("div", { className: "flex flex-col items-center gap-0.5 min-w-[2.5rem] text-xs", children: [
          /* @__PURE__ */ o.jsx("span", { className: "text-muted-foreground", children: K }),
          /* @__PURE__ */ o.jsx("div", { className: "h-6 w-3 rounded-sm bg-muted relative overflow-hidden", children: /* @__PURE__ */ o.jsx(
            "div",
            {
              className: "absolute bottom-0 w-full bg-blue-400 rounded-sm",
              style: { height: `${W}%` }
            }
          ) }),
          /* @__PURE__ */ o.jsxs("span", { className: "text-muted-foreground tabular-nums", children: [
            W,
            "%"
          ] })
        ] }, ee);
      }) })
    ] })
  ] });
}
const w0 = (a) => typeof a == "boolean" ? `${a}` : a === 0 ? "0" : a, S0 = rp, Ep = (a, s) => (r) => {
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
      let [H, L] = T;
      return Array.isArray(L) ? L.includes({
        ...d,
        ...p
      }[H]) : {
        ...d,
        ...p
      }[H] === L;
    }) ? [
      ...g,
      _,
      S
    ] : g;
  }, []);
  return S0(a, m, y, r == null ? void 0 : r.class, r == null ? void 0 : r.className);
}, yx = Ep(
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
), Is = O.forwardRef(
  ({ className: a, variant: s, size: r, ...u }, f) => /* @__PURE__ */ o.jsx(
    "button",
    {
      className: ie(yx({ variant: s, size: r, className: a })),
      ref: f,
      ...u
    }
  )
);
Is.displayName = "Button";
const ec = O.forwardRef(
  ({ className: a, onValueChange: s, ...r }, u) => /* @__PURE__ */ o.jsx(
    "input",
    {
      type: "range",
      ref: u,
      className: ie(
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
  const a = ai();
  return O.useCallback(
    (s, r, u, f) => a.callService(s, r, u, f),
    [a]
  );
}
function yt(a) {
  const s = El(), r = a.split(".")[0];
  return O.useCallback(
    () => s(r, "toggle", void 0, { entity_id: a }),
    [s, r, a]
  );
}
function vx(a) {
  const s = El();
  return O.useCallback(
    () => s("button", "press", void 0, { entity_id: a }),
    [s, a]
  );
}
function xx() {
  var X;
  const a = he("climate.a32_pro_van_hydronic_heating_pid"), s = El(), [r, u] = O.useState(null), f = O.useRef(null), d = O.useCallback(
    (P) => {
      f.current && clearTimeout(f.current), f.current = setTimeout(() => {
        s("climate", "set_temperature", { temperature: P }, {
          entity_id: "climate.a32_pro_van_hydronic_heating_pid"
        });
      }, 300);
    },
    [s]
  ), m = ((X = a == null ? void 0 : a.attributes) == null ? void 0 : X.temperature) ?? 0;
  if (O.useEffect(() => {
    u(null);
  }, [m]), !a) return null;
  const p = a.attributes, y = p.current_temperature ?? 0, g = p.min_temp ?? 5, x = p.max_temp ?? 35, _ = p.target_temp_step ?? 0.5, j = a.state === "heat", T = r ?? m, H = (P) => {
    const ee = Math.round(P / _) * _;
    u(ee), d(ee);
  }, L = () => {
    s("climate", "set_hvac_mode", {
      hvac_mode: j ? "off" : "heat"
    }, { entity_id: "climate.a32_pro_van_hydronic_heating_pid" });
  }, V = Math.max(0, Math.min(1, (T - g) / (x - g))), I = j ? `hsl(${30 - V * 30}, ${70 + V * 30}%, ${55 - V * 10}%)` : void 0;
  return /* @__PURE__ */ o.jsxs(Ue, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(
        Ir,
        {
          className: ie("h-4 w-4", j ? "text-orange-500" : "text-muted-foreground")
        }
      ),
      "Thermostat",
      /* @__PURE__ */ o.jsx("span", { className: ie(
        "ml-auto text-xs font-medium px-2 py-0.5 rounded-full",
        j ? "bg-orange-500/10 text-orange-500" : "bg-muted text-muted-foreground"
      ), children: j ? "Heating" : "Off" })
    ] }) }),
    /* @__PURE__ */ o.jsxs(Le, { className: "space-y-4", children: [
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
            onValueChange: H,
            style: I ? {
              accentColor: I
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
        Is,
        {
          variant: j ? "default" : "outline",
          className: ie("w-full", j && "bg-orange-500 hover:bg-orange-600"),
          onClick: L,
          children: [
            /* @__PURE__ */ o.jsx(wp, { className: "h-4 w-4 mr-2" }),
            j ? "Turn Off" : "Turn On"
          ]
        }
      )
    ] })
  ] });
}
const Gt = O.forwardRef(
  ({ className: a, checked: s = !1, onCheckedChange: r, ...u }, f) => /* @__PURE__ */ o.jsx(
    "button",
    {
      ref: f,
      role: "switch",
      "aria-checked": s,
      className: ie(
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
          className: ie(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
            s ? "translate-x-5" : "translate-x-0"
          )
        }
      )
    }
  )
);
Gt.displayName = "Switch";
function Ap() {
  var W;
  const a = he("switch.a32_pro_switch24_hydronic_heater"), s = he("input_boolean.hot_water_mode"), r = he("light.a32_pro_a32_pro_dac_0"), u = he("sensor.a32_pro_hydronic_heater_status"), f = he("input_boolean.heater_low_fuel_lockout"), { value: d } = G(
    "sensor.a32_pro_s5140_channel_34_temperature_blower_coolant"
  ), { value: m } = G(
    "sensor.a32_pro_s5140_channel_35_temperature_blower_air"
  ), { value: p } = G(
    "sensor.a32_pro_coolant_blower_heating_pid_climate_result"
  ), y = yt("switch.a32_pro_switch24_hydronic_heater"), g = yt("input_boolean.hot_water_mode"), x = El(), _ = (a == null ? void 0 : a.state) === "on", S = (s == null ? void 0 : s.state) === "on", j = (f == null ? void 0 : f.state) === "on", T = ((W = r == null ? void 0 : r.attributes) == null ? void 0 : W.brightness) ?? 0, H = Math.round(T / 255 * 100), L = (u == null ? void 0 : u.state) ?? "", [V, I] = O.useState(null), X = O.useRef(null), P = O.useCallback(
    (J) => {
      I(J), X.current && clearTimeout(X.current), X.current = setTimeout(() => {
        x("light", "turn_on", { brightness_pct: J }, {
          entity_id: "light.a32_pro_a32_pro_dac_0"
        });
      }, 300);
    },
    [x]
  ), ee = V ?? H;
  return O.useEffect(() => {
    I(null);
  }, [H]), /* @__PURE__ */ o.jsxs(Ue, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(si, { className: ie("h-4 w-4", _ ? "text-orange-500" : "text-muted-foreground") }),
      "Heating System"
    ] }) }),
    /* @__PURE__ */ o.jsxs(Le, { className: "space-y-4", children: [
      j && /* @__PURE__ */ o.jsx("div", { className: "rounded-lg bg-red-500/10 border border-red-500/30 p-2 text-xs text-red-500 font-medium", children: "⚠ Low fuel lockout active" }),
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "Hydronic Heater" }),
        /* @__PURE__ */ o.jsx(Gt, { checked: _, onCheckedChange: y })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsxs("span", { className: "text-sm flex items-center gap-1.5", children: [
          /* @__PURE__ */ o.jsx(Za, { className: "h-3.5 w-3.5 text-blue-500" }),
          "Hot Water Mode"
        ] }),
        /* @__PURE__ */ o.jsx(Gt, { checked: S, onCheckedChange: g })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ o.jsxs("span", { className: "text-sm flex items-center gap-1.5", children: [
            /* @__PURE__ */ o.jsx(Ps, { className: "h-3.5 w-3.5" }),
            "Blower Fan"
          ] }),
          /* @__PURE__ */ o.jsxs("span", { className: "text-xs text-muted-foreground tabular-nums", children: [
            ee,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ o.jsx(
          ec,
          {
            min: 0,
            max: 100,
            value: ee,
            onValueChange: P
          }
        )
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "border-t pt-3 space-y-1", children: [
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.a32_pro_s5140_channel_34_temperature_blower_coolant", label: "Coolant Temp", value: Z(d, 1), unit: "°C", color: "#ef4444" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.a32_pro_s5140_channel_35_temperature_blower_air", label: "Blower Air", value: Z(m, 1), unit: "°C", color: "#f97316" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.a32_pro_coolant_blower_heating_pid_climate_result", label: "PID Output", value: Z(p, 0), unit: "%", color: "#6366f1" }),
        L && L !== "Idle." && L !== "0" && /* @__PURE__ */ o.jsx("p", { className: "text-xs text-orange-500 mt-1", children: L })
      ] })
    ] })
  ] });
}
function Cp() {
  var L;
  const a = he("fan.ag_pro_roof_fan"), s = he("cover.ag_pro_roof_fan_lid"), r = he("sensor.roof_fan_direction"), u = El(), f = (a == null ? void 0 : a.state) === "on", d = ((L = a == null ? void 0 : a.attributes) == null ? void 0 : L.percentage) ?? 0, m = s == null ? void 0 : s.state, p = (r == null ? void 0 : r.state) ?? "Unknown", y = () => {
    u("fan", f ? "turn_off" : "turn_on", void 0, {
      entity_id: "fan.ag_pro_roof_fan"
    });
  }, [g, x] = O.useState(null), _ = O.useRef(null), S = O.useCallback(
    (V) => {
      x(V), _.current && clearTimeout(_.current), _.current = setTimeout(() => {
        u("fan", "set_percentage", { percentage: V }, {
          entity_id: "fan.ag_pro_roof_fan"
        });
      }, 300);
    },
    [u]
  ), j = g ?? d;
  O.useEffect(() => {
    x(null);
  }, [d]);
  const T = (V) => {
    u("fan", "set_direction", { direction: V }, {
      entity_id: "fan.ag_pro_roof_fan"
    });
  }, H = () => {
    u("cover", m === "open" ? "close_cover" : "open_cover", void 0, { entity_id: "cover.ag_pro_roof_fan_lid" });
  };
  return /* @__PURE__ */ o.jsxs(Ue, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(
        qv,
        {
          className: ie("h-4 w-4", f && "text-cyan-500 animate-spin"),
          style: f ? { animationDuration: "2s" } : void 0
        }
      ),
      "Roof Fan"
    ] }) }),
    /* @__PURE__ */ o.jsxs(Le, { className: "space-y-4", children: [
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
            Is,
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
            Is,
            {
              variant: p === "Intake" ? "default" : "outline",
              size: "sm",
              className: "flex-1",
              onClick: () => T("reverse"),
              children: [
                /* @__PURE__ */ o.jsx(Cv, { className: "h-3.5 w-3.5 mr-1" }),
                "Intake"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "Lid" }),
        /* @__PURE__ */ o.jsx(Is, { variant: "outline", size: "sm", onClick: H, children: m === "open" ? "Close" : "Open" })
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
function Qs({ active: a, color: s = "green", label: r, className: u }) {
  const f = s.startsWith("bg-") ? s : _x[s] ?? "bg-green-500";
  return /* @__PURE__ */ o.jsxs("div", { className: ie("flex items-center gap-1.5", u), children: [
    /* @__PURE__ */ o.jsx(
      "span",
      {
        className: ie(
          "h-2.5 w-2.5 rounded-full shrink-0",
          a ? f : "bg-muted-foreground/30"
        )
      }
    ),
    r && /* @__PURE__ */ o.jsx("span", { className: "text-xs text-muted-foreground", children: r })
  ] });
}
function bx() {
  const a = he("binary_sensor.apollo_msr_2_1731d8_radar_target"), s = he("device_tracker.starlink"), r = he("input_boolean.power_saving_mode"), u = he("input_boolean.sleep_mode"), f = he("binary_sensor.engine_is_running"), d = (a == null ? void 0 : a.state) === "on", m = (s == null ? void 0 : s.state) === "home", p = (r == null ? void 0 : r.state) === "on", y = (u == null ? void 0 : u.state) === "on", g = (f == null ? void 0 : f.state) === "on";
  return /* @__PURE__ */ o.jsxs("div", { className: "flex flex-wrap items-center gap-3 px-1", children: [
    /* @__PURE__ */ o.jsx(Qs, { active: d, color: "green", label: d ? "Occupied" : "Empty" }),
    /* @__PURE__ */ o.jsx(Qs, { active: m, color: "blue", label: m ? "Online" : "Offline" }),
    g && /* @__PURE__ */ o.jsx(Qs, { active: !0, color: "orange", label: "Engine On" }),
    p && /* @__PURE__ */ o.jsx(Qs, { active: !0, color: "yellow", label: "Power Save" }),
    y && /* @__PURE__ */ o.jsx(Qs, { active: !0, color: "purple", label: "Sleep" })
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
  const m = he(a), p = yt(a), y = (m == null ? void 0 : m.state) === "on", g = j0[u] || j0.blue;
  return /* @__PURE__ */ o.jsxs(
    "button",
    {
      onClick: f ?? p,
      className: ie(
        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 min-w-[5rem]",
        y ? `${g.border} ${g.bg} ${g.text} shadow-lg ${g.glow}` : "border-border bg-card text-muted-foreground hover:bg-accent",
        d
      ),
      children: [
        /* @__PURE__ */ o.jsx(
          r,
          {
            className: ie("h-5 w-5 transition-transform duration-300")
          }
        ),
        /* @__PURE__ */ o.jsx("span", { className: "text-xs font-medium", children: s })
      ]
    }
  );
}
const wx = 3e4;
function zp({ name: a = "Inverter" }) {
  const s = vx("button.a32_pro_inverter_on_off_toggle"), r = he("input_boolean.inverter_state"), u = (r == null ? void 0 : r.state) === "on", [f, d] = O.useState(!1), m = O.useRef(null), p = O.useRef(null);
  O.useEffect(() => {
    f && m.current !== null && (r == null ? void 0 : r.state) !== m.current && (d(!1), m.current = null, p.current && clearTimeout(p.current));
  }, [r == null ? void 0 : r.state, f]), O.useEffect(() => () => {
    p.current && clearTimeout(p.current);
  }, []);
  const y = O.useCallback(() => {
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
      className: ie(
        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 min-w-[5rem]",
        f ? "border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-lg shadow-yellow-500/25" : u ? `${g.border} ${g.bg} ${g.text} shadow-lg ${g.glow}` : "border-border bg-card text-muted-foreground hover:bg-accent"
      ),
      children: [
        /* @__PURE__ */ o.jsx(
          ri,
          {
            className: ie(
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
      className: ie(
        "flex items-center gap-2 rounded-lg border bg-card px-3 py-2 min-w-[7rem] text-left transition-colors",
        f && "hover:bg-accent active:bg-accent/80 cursor-pointer"
      ),
      children: [
        /* @__PURE__ */ o.jsx(u, { className: ie("h-4 w-4 shrink-0", r) }),
        /* @__PURE__ */ o.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground leading-tight", children: a }),
          /* @__PURE__ */ o.jsx("p", { className: "text-sm font-semibold tabular-nums truncate", children: s })
        ] })
      ]
    }
  );
}
function Sx() {
  const { value: a } = G("sensor.olins_van_bms_battery"), { value: s } = G("sensor.total_mppt_pv_power"), { value: r } = G("sensor.a32_pro_fresh_water_tank_level"), { value: u } = G("sensor.a32_pro_grey_water_tank_level"), { value: f } = G("sensor.stable_fuel_level"), { value: d } = G("sensor.propane_tank_percentage"), { value: m } = G("sensor.starlink_downlink_throughput_mbps"), p = he("binary_sensor.shelly_em_reachable"), y = he("input_boolean.power_saving_mode"), g = he("switch.a32_pro_switch06_grey_water_tank_valve"), x = he("light.led_controller_cct_1"), _ = he("light.led_controller_cct_2"), S = he("light.led_controller_sc_1"), j = he("light.led_controller_sc_2"), { open: T } = zn(), H = yt("switch.a32_pro_switch06_grey_water_tank_valve"), L = yt("input_boolean.power_saving_mode"), V = yt("light.led_controller_cct_1"), I = (p == null ? void 0 : p.state) === "on", X = (y == null ? void 0 : y.state) === "on", P = (g == null ? void 0 : g.state) === "on", ee = [x, _, S, j].filter((J) => (J == null ? void 0 : J.state) === "on").length, W = (J) => J ?? 0;
  return /* @__PURE__ */ o.jsxs("div", { className: "flex gap-2 overflow-x-auto pb-1", children: [
    /* @__PURE__ */ o.jsx(
      _n,
      {
        label: "Battery",
        value: `${Z(a, 0)}%`,
        color: W(a) < 30 ? "text-red-500" : W(a) < 65 ? "text-orange-500" : "text-green-500",
        icon: Io,
        onClick: () => T("sensor.olins_van_bms_battery", "Battery SOC", "%")
      }
    ),
    /* @__PURE__ */ o.jsx(
      _n,
      {
        label: "Solar",
        value: `${Z(s, 0)}W`,
        color: W(s) > 50 ? "text-yellow-500" : "text-muted-foreground",
        icon: Fr,
        onClick: () => T("sensor.total_mppt_pv_power", "Solar Power", "W")
      }
    ),
    /* @__PURE__ */ o.jsx(
      _n,
      {
        label: "Lights",
        value: ee > 0 ? `${ee} on` : "Off",
        color: ee > 0 ? "text-yellow-500" : "text-muted-foreground",
        icon: ii,
        onClick: V
      }
    ),
    /* @__PURE__ */ o.jsx(
      _n,
      {
        label: "Inverter",
        value: I ? "ON" : "OFF",
        color: I ? "text-green-500" : "text-muted-foreground",
        icon: ri,
        onClick: () => T("sensor.inverter_power_24v", "Inverter Power", "W")
      }
    ),
    /* @__PURE__ */ o.jsx(
      _n,
      {
        label: "Internet",
        value: `${Z(m, 0)} Mbps`,
        color: W(m) > 50 ? "text-green-500" : W(m) > 10 ? "text-orange-500" : "text-red-500",
        icon: ix,
        onClick: () => T("sensor.starlink_downlink_throughput_mbps", "Internet Speed", "Mbps")
      }
    ),
    /* @__PURE__ */ o.jsx(
      _n,
      {
        label: "Fresh",
        value: `${Z(r, 0)}%`,
        color: W(r) < 20 ? "text-red-500" : W(r) < 50 ? "text-orange-500" : "text-blue-500",
        icon: Za,
        onClick: () => T("sensor.a32_pro_fresh_water_tank_level", "Fresh Water", "%")
      }
    ),
    /* @__PURE__ */ o.jsx(
      _n,
      {
        label: "Grey",
        value: `${Z(u, 0)}%`,
        color: W(u) > 80 ? "text-red-500" : W(u) > 60 ? "text-orange-500" : "text-green-500",
        icon: Pr,
        onClick: () => T("sensor.a32_pro_grey_water_tank_level", "Grey Water", "%")
      }
    ),
    /* @__PURE__ */ o.jsx(
      _n,
      {
        label: "Grey Dump",
        value: P ? "OPEN" : "Closed",
        color: P ? "text-orange-500" : "text-muted-foreground",
        icon: nx,
        onClick: H
      }
    ),
    /* @__PURE__ */ o.jsx(
      _n,
      {
        label: "Fuel",
        value: `${Z(f, 0)}%`,
        color: W(f) < 15 ? "text-red-500" : W(f) < 30 ? "text-orange-500" : "text-green-500",
        icon: yp,
        onClick: () => T("sensor.stable_fuel_level", "Fuel Level", "%")
      }
    ),
    /* @__PURE__ */ o.jsx(
      _n,
      {
        label: "Propane",
        value: `${Z(d, 0)}%`,
        color: W(d) < 15 ? "text-red-500" : W(d) < 30 ? "text-orange-500" : "text-green-500",
        icon: si,
        onClick: () => T("sensor.propane_tank_percentage", "Propane", "%")
      }
    ),
    /* @__PURE__ */ o.jsx(
      _n,
      {
        label: "Eco Mode",
        value: X ? "ON" : "OFF",
        color: X ? "text-yellow-500" : "text-muted-foreground",
        icon: Fo,
        onClick: L
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
    /* @__PURE__ */ o.jsx(zp, {}),
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
        icon: Av,
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
function kp() {
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
        /* @__PURE__ */ o.jsx(Ap, {}),
        /* @__PURE__ */ o.jsx(Cp, {})
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ o.jsx(Mp, { compact: !0 }),
        /* @__PURE__ */ o.jsx(Tp, { compact: !0 }),
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
  return new kr(r);
}
function kr(a) {
  this._ = a;
}
function Tx(a, s) {
  return a.trim().split(/^|\s+/).map(function(r) {
    var u = "", f = r.indexOf(".");
    if (f >= 0 && (u = r.slice(f + 1), r = r.slice(0, f)), r && !s.hasOwnProperty(r)) throw new Error("unknown type: " + r);
    return { type: r, name: u };
  });
}
kr.prototype = Op.prototype = {
  constructor: kr,
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
    return new kr(a);
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
function Ax(a) {
  return function() {
    var s = this.ownerDocument, r = this.namespaceURI;
    return r === Lo && s.documentElement.namespaceURI === Lo ? s.createElement(a) : s.createElementNS(r, a);
  };
}
function Cx(a) {
  return function() {
    return this.ownerDocument.createElementNS(a.space, a.local);
  };
}
function Rp(a) {
  var s = tc(a);
  return (s.local ? Cx : Ax)(s);
}
function zx() {
}
function tf(a) {
  return a == null ? zx : function() {
    return this.querySelector(a);
  };
}
function kx(a) {
  typeof a != "function" && (a = tf(a));
  for (var s = this._groups, r = s.length, u = new Array(r), f = 0; f < r; ++f)
    for (var d = s[f], m = d.length, p = u[f] = new Array(m), y, g, x = 0; x < m; ++x)
      (y = d[x]) && (g = a.call(y, y.__data__, x, d)) && ("__data__" in y && (g.__data__ = y.__data__), p[x] = g);
  return new wn(u, this._parents);
}
function Ox(a) {
  return a == null ? [] : Array.isArray(a) ? a : Array.from(a);
}
function Rx() {
  return [];
}
function Dp(a) {
  return a == null ? Rx : function() {
    return this.querySelectorAll(a);
  };
}
function Dx(a) {
  return function() {
    return Ox(a.apply(this, arguments));
  };
}
function Hx(a) {
  typeof a == "function" ? a = Dx(a) : a = Dp(a);
  for (var s = this._groups, r = s.length, u = [], f = [], d = 0; d < r; ++d)
    for (var m = s[d], p = m.length, y, g = 0; g < p; ++g)
      (y = m[g]) && (u.push(a.call(y, y.__data__, g, m)), f.push(y));
  return new wn(u, f);
}
function Hp(a) {
  return function() {
    return this.matches(a);
  };
}
function Up(a) {
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
  return this.select(a == null ? Bx : Lx(typeof a == "function" ? a : Up(a)));
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
  return this.selectAll(a == null ? Gx : Xx(typeof a == "function" ? a : Up(a)));
}
function Qx(a) {
  typeof a != "function" && (a = Hp(a));
  for (var s = this._groups, r = s.length, u = new Array(r), f = 0; f < r; ++f)
    for (var d = s[f], m = d.length, p = u[f] = [], y, g = 0; g < m; ++g)
      (y = d[g]) && a.call(y, y.__data__, g, d) && p.push(y);
  return new wn(u, this._parents);
}
function Lp(a) {
  return new Array(a.length);
}
function Zx() {
  return new wn(this._enter || this._groups.map(Lp), this._parents);
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
    var x = u[g], _ = f[g], S = _.length, j = Ix(a.call(x, x && x.__data__, g, u)), T = j.length, H = p[g] = new Array(T), L = m[g] = new Array(T), V = y[g] = new Array(S);
    r(x, _, H, L, V, j, s);
    for (var I = 0, X = 0, P, ee; I < T; ++I)
      if (P = H[I]) {
        for (I >= X && (X = I + 1); !(ee = L[X]) && ++X < T; ) ;
        P._next = ee || null;
      }
  }
  return m = new wn(m, u), m._enter = p, m._exit = y, m;
}
function Ix(a) {
  return typeof a == "object" && "length" in a ? a : Array.from(a);
}
function Px() {
  return new wn(this._exit || this._groups.map(Lp), this._parents);
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
function Bp(a) {
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
  return a.style.getPropertyValue(s) || Bp(a).getComputedStyle(a, null).getPropertyValue(s);
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
function qp(a) {
  return a.trim().split(/^|\s+/);
}
function nf(a) {
  return a.classList || new Yp(a);
}
function Yp(a) {
  this._node = a, this._names = qp(a.getAttribute("class") || "");
}
Yp.prototype = {
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
function Gp(a, s) {
  for (var r = nf(a), u = -1, f = s.length; ++u < f; ) r.add(s[u]);
}
function Xp(a, s) {
  for (var r = nf(a), u = -1, f = s.length; ++u < f; ) r.remove(s[u]);
}
function M_(a) {
  return function() {
    Gp(this, a);
  };
}
function T_(a) {
  return function() {
    Xp(this, a);
  };
}
function E_(a, s) {
  return function() {
    (s.apply(this, arguments) ? Gp : Xp)(this, a);
  };
}
function A_(a, s) {
  var r = qp(a + "");
  if (arguments.length < 2) {
    for (var u = nf(this.node()), f = -1, d = r.length; ++f < d; ) if (!u.contains(r[f])) return !1;
    return !0;
  }
  return this.each((typeof s == "function" ? E_ : s ? M_ : T_)(r, s));
}
function C_() {
  this.textContent = "";
}
function z_(a) {
  return function() {
    this.textContent = a;
  };
}
function k_(a) {
  return function() {
    var s = a.apply(this, arguments);
    this.textContent = s ?? "";
  };
}
function O_(a) {
  return arguments.length ? this.each(a == null ? C_ : (typeof a == "function" ? k_ : z_)(a)) : this.node().textContent;
}
function R_() {
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
  return arguments.length ? this.each(a == null ? R_ : (typeof a == "function" ? H_ : D_)(a)) : this.node().innerHTML;
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
  var r = typeof a == "function" ? a : Rp(a), u = s == null ? X_ : typeof s == "function" ? s : tf(s);
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
function Vp(a, s, r) {
  var u = Bp(a), f = u.CustomEvent;
  typeof f == "function" ? f = new f(s, r) : (f = u.document.createEvent("Event"), r ? (f.initEvent(s, r.bubbles, r.cancelable), f.detail = r.detail) : f.initEvent(s, !1, !1)), a.dispatchEvent(f);
}
function nb(a, s) {
  return function() {
    return Vp(this, a, s);
  };
}
function lb(a, s) {
  return function() {
    return Vp(this, a, s.apply(this, arguments));
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
  select: kx,
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
  classed: A_,
  text: O_,
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
function lf(a, s, r) {
  a.prototype = s.prototype = r, r.constructor = a;
}
function Qp(a, s) {
  var r = Object.create(a.prototype);
  for (var u in s) r[u] = s[u];
  return r;
}
function ui() {
}
var ei = 0.7, Lr = 1 / ei, qa = "\\s*([+-]?\\d+)\\s*", ti = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", Cn = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", cb = /^#([0-9a-f]{3,8})$/, ub = new RegExp(`^rgb\\(${qa},${qa},${qa}\\)$`), ob = new RegExp(`^rgb\\(${Cn},${Cn},${Cn}\\)$`), fb = new RegExp(`^rgba\\(${qa},${qa},${qa},${ti}\\)$`), db = new RegExp(`^rgba\\(${Cn},${Cn},${Cn},${ti}\\)$`), hb = new RegExp(`^hsl\\(${ti},${Cn},${Cn}\\)$`), mb = new RegExp(`^hsla\\(${ti},${Cn},${Cn},${ti}\\)$`), T0 = {
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
lf(ui, ni, {
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
  formatRgb: A0,
  toString: A0
});
function E0() {
  return this.rgb().formatHex();
}
function pb() {
  return this.rgb().formatHex8();
}
function gb() {
  return Zp(this).formatHsl();
}
function A0() {
  return this.rgb().formatRgb();
}
function ni(a) {
  var s, r;
  return a = (a + "").trim().toLowerCase(), (s = cb.exec(a)) ? (r = s[1].length, s = parseInt(s[1], 16), r === 6 ? C0(s) : r === 3 ? new Xt(s >> 8 & 15 | s >> 4 & 240, s >> 4 & 15 | s & 240, (s & 15) << 4 | s & 15, 1) : r === 8 ? Mr(s >> 24 & 255, s >> 16 & 255, s >> 8 & 255, (s & 255) / 255) : r === 4 ? Mr(s >> 12 & 15 | s >> 8 & 240, s >> 8 & 15 | s >> 4 & 240, s >> 4 & 15 | s & 240, ((s & 15) << 4 | s & 15) / 255) : null) : (s = ub.exec(a)) ? new Xt(s[1], s[2], s[3], 1) : (s = ob.exec(a)) ? new Xt(s[1] * 255 / 100, s[2] * 255 / 100, s[3] * 255 / 100, 1) : (s = fb.exec(a)) ? Mr(s[1], s[2], s[3], s[4]) : (s = db.exec(a)) ? Mr(s[1] * 255 / 100, s[2] * 255 / 100, s[3] * 255 / 100, s[4]) : (s = hb.exec(a)) ? O0(s[1], s[2] / 100, s[3] / 100, 1) : (s = mb.exec(a)) ? O0(s[1], s[2] / 100, s[3] / 100, s[4]) : T0.hasOwnProperty(a) ? C0(T0[a]) : a === "transparent" ? new Xt(NaN, NaN, NaN, 0) : null;
}
function C0(a) {
  return new Xt(a >> 16 & 255, a >> 8 & 255, a & 255, 1);
}
function Mr(a, s, r, u) {
  return u <= 0 && (a = s = r = NaN), new Xt(a, s, r, u);
}
function yb(a) {
  return a instanceof ui || (a = ni(a)), a ? (a = a.rgb(), new Xt(a.r, a.g, a.b, a.opacity)) : new Xt();
}
function Bo(a, s, r, u) {
  return arguments.length === 1 ? yb(a) : new Xt(a, s, r, u ?? 1);
}
function Xt(a, s, r, u) {
  this.r = +a, this.g = +s, this.b = +r, this.opacity = +u;
}
lf(Xt, Bo, Qp(ui, {
  brighter(a) {
    return a = a == null ? Lr : Math.pow(Lr, a), new Xt(this.r * a, this.g * a, this.b * a, this.opacity);
  },
  darker(a) {
    return a = a == null ? ei : Math.pow(ei, a), new Xt(this.r * a, this.g * a, this.b * a, this.opacity);
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
  formatRgb: k0,
  toString: k0
}));
function z0() {
  return `#${Jl(this.r)}${Jl(this.g)}${Jl(this.b)}`;
}
function vb() {
  return `#${Jl(this.r)}${Jl(this.g)}${Jl(this.b)}${Jl((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function k0() {
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
function O0(a, s, r, u) {
  return u <= 0 ? a = s = r = NaN : r <= 0 || r >= 1 ? a = s = NaN : s <= 0 && (a = NaN), new bn(a, s, r, u);
}
function Zp(a) {
  if (a instanceof bn) return new bn(a.h, a.s, a.l, a.opacity);
  if (a instanceof ui || (a = ni(a)), !a) return new bn();
  if (a instanceof bn) return a;
  a = a.rgb();
  var s = a.r / 255, r = a.g / 255, u = a.b / 255, f = Math.min(s, r, u), d = Math.max(s, r, u), m = NaN, p = d - f, y = (d + f) / 2;
  return p ? (s === d ? m = (r - u) / p + (r < u) * 6 : r === d ? m = (u - s) / p + 2 : m = (s - r) / p + 4, p /= y < 0.5 ? d + f : 2 - d - f, m *= 60) : p = y > 0 && y < 1 ? 0 : m, new bn(m, p, y, a.opacity);
}
function xb(a, s, r, u) {
  return arguments.length === 1 ? Zp(a) : new bn(a, s, r, u ?? 1);
}
function bn(a, s, r, u) {
  this.h = +a, this.s = +s, this.l = +r, this.opacity = +u;
}
lf(bn, xb, Qp(ui, {
  brighter(a) {
    return a = a == null ? Lr : Math.pow(Lr, a), new bn(this.h, this.s, this.l * a, this.opacity);
  },
  darker(a) {
    return a = a == null ? ei : Math.pow(ei, a), new bn(this.h, this.s, this.l * a, this.opacity);
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
    return new bn(R0(this.h), Tr(this.s), Tr(this.l), Br(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const a = Br(this.opacity);
    return `${a === 1 ? "hsl(" : "hsla("}${R0(this.h)}, ${Tr(this.s) * 100}%, ${Tr(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
  }
}));
function R0(a) {
  return a = (a || 0) % 360, a < 0 ? a + 360 : a;
}
function Tr(a) {
  return Math.max(0, Math.min(1, a || 0));
}
function Eo(a, s, r) {
  return (a < 60 ? s + (r - s) * a / 60 : a < 180 ? r : a < 240 ? s + (r - s) * (240 - a) / 60 : s) * 255;
}
const Kp = (a) => () => a;
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
  return (a = +a) == 1 ? Jp : function(s, r) {
    return r - s ? bb(s, r, a) : Kp(isNaN(s) ? r : s);
  };
}
function Jp(a, s) {
  var r = s - a;
  return r ? _b(a, r) : Kp(isNaN(a) ? s : a);
}
const D0 = (function a(s) {
  var r = wb(s);
  function u(f, d) {
    var m = r((f = Bo(f)).r, (d = Bo(d)).r), p = r(f.g, d.g), y = r(f.b, d.b), g = Jp(f.opacity, d.opacity);
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
var qo = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, Ao = new RegExp(qo.source, "g");
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
  var r = qo.lastIndex = Ao.lastIndex = 0, u, f, d, m = -1, p = [], y = [];
  for (a = a + "", s = s + ""; (u = qo.exec(a)) && (f = Ao.exec(s)); )
    (d = f.index) > r && (d = s.slice(r, d), p[m] ? p[m] += d : p[++m] = d), (u = u[0]) === (f = f[0]) ? p[m] ? p[m] += f : p[++m] = f : (p[++m] = null, y.push({ i: m, x: Tl(u, f) })), r = Ao.lastIndex;
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
function $p(a, s, r, u, f, d) {
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
  return s.isIdentity ? Yo : $p(s.a, s.b, s.c, s.d, s.e, s.f);
}
function Tb(a) {
  return a == null || (Er || (Er = document.createElementNS("http://www.w3.org/2000/svg", "g")), Er.setAttribute("transform", a), !(a = Er.transform.baseVal.consolidate())) ? Yo : (a = a.matrix, $p(a.a, a.b, a.c, a.d, a.e, a.f));
}
function Wp(a, s, r, u) {
  function f(g) {
    return g.length ? g.pop() + " " : "";
  }
  function d(g, x, _, S, j, T) {
    if (g !== _ || x !== S) {
      var H = j.push("translate(", null, s, null, r);
      T.push({ i: H - 4, x: Tl(g, _) }, { i: H - 2, x: Tl(x, S) });
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
      var H = j.push(f(j) + "scale(", null, ",", null, ")");
      T.push({ i: H - 4, x: Tl(g, _) }, { i: H - 2, x: Tl(x, S) });
    } else (_ !== 1 || S !== 1) && j.push(f(j) + "scale(" + _ + "," + S + ")");
  }
  return function(g, x) {
    var _ = [], S = [];
    return g = a(g), x = a(x), d(g.translateX, g.translateY, x.translateX, x.translateY, _, S), m(g.rotate, x.rotate, _, S), p(g.skewX, x.skewX, _, S), y(g.scaleX, g.scaleY, x.scaleX, x.scaleY, _, S), g = x = null, function(j) {
      for (var T = -1, H = S.length, L; ++T < H; ) _[(L = S[T]).i] = L.x(j);
      return _.join("");
    };
  };
}
var Eb = Wp(Mb, "px, ", "px)", "deg)"), Ab = Wp(Tb, ", ", ")", ")"), Ga = 0, Ks = 0, Zs = 0, Fp = 1e3, qr, Js, Yr = 0, Wl = 0, nc = 0, li = typeof performance == "object" && performance.now ? performance : Date, Ip = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(a) {
  setTimeout(a, 17);
};
function af() {
  return Wl || (Ip(Cb), Wl = li.now() + nc);
}
function Cb() {
  Wl = 0;
}
function Gr() {
  this._call = this._time = this._next = null;
}
Gr.prototype = Pp.prototype = {
  constructor: Gr,
  restart: function(a, s, r) {
    if (typeof a != "function") throw new TypeError("callback is not a function");
    r = (r == null ? af() : +r) + (s == null ? 0 : +s), !this._next && Js !== this && (Js ? Js._next = this : qr = this, Js = this), this._call = a, this._time = r, Go();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, Go());
  }
};
function Pp(a, s, r) {
  var u = new Gr();
  return u.restart(a, s, r), u;
}
function zb() {
  af(), ++Ga;
  for (var a = qr, s; a; )
    (s = Wl - a._time) >= 0 && a._call.call(void 0, s), a = a._next;
  --Ga;
}
function U0() {
  Wl = (Yr = li.now()) + nc, Ga = Ks = 0;
  try {
    zb();
  } finally {
    Ga = 0, Ob(), Wl = 0;
  }
}
function kb() {
  var a = li.now(), s = a - Yr;
  s > Fp && (nc -= s, Yr = a);
}
function Ob() {
  for (var a, s = qr, r, u = 1 / 0; s; )
    s._call ? (u > s._time && (u = s._time), a = s, s = s._next) : (r = s._next, s._next = null, s = a ? a._next = r : qr = r);
  Js = a, Go(u);
}
function Go(a) {
  if (!Ga) {
    Ks && (Ks = clearTimeout(Ks));
    var s = a - Wl;
    s > 24 ? (a < 1 / 0 && (Ks = setTimeout(U0, a - li.now() - nc)), Zs && (Zs = clearInterval(Zs))) : (Zs || (Yr = li.now(), Zs = setInterval(kb, Fp)), Ga = 1, Ip(U0));
  }
}
function L0(a, s, r) {
  var u = new Gr();
  return s = s == null ? 0 : +s, u.restart((f) => {
    u.stop(), a(f + s);
  }, s, r), u;
}
var Rb = Op("start", "end", "cancel", "interrupt"), Db = [], eg = 0, B0 = 1, Xo = 2, Or = 3, q0 = 4, Vo = 5, Rr = 6;
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
    on: Rb,
    tween: Db,
    time: d.time,
    delay: d.delay,
    duration: d.duration,
    ease: d.ease,
    timer: null,
    state: eg
  });
}
function sf(a, s) {
  var r = Sn(a, s);
  if (r.state > eg) throw new Error("too late; already scheduled");
  return r;
}
function kn(a, s) {
  var r = Sn(a, s);
  if (r.state > Or) throw new Error("too late; already running");
  return r;
}
function Sn(a, s) {
  var r = a.__transition;
  if (!r || !(r = r[s])) throw new Error("transition not found");
  return r;
}
function Hb(a, s, r) {
  var u = a.__transition, f;
  u[s] = r, r.timer = Pp(d, 0, r.time);
  function d(g) {
    r.state = B0, r.timer.restart(m, r.delay, r.time), r.delay <= g && m(g - r.delay);
  }
  function m(g) {
    var x, _, S, j;
    if (r.state !== B0) return y();
    for (x in u)
      if (j = u[x], j.name === r.name) {
        if (j.state === Or) return L0(m);
        j.state === q0 ? (j.state = Rr, j.timer.stop(), j.on.call("interrupt", a, a.__data__, j.index, j.group), delete u[x]) : +x < s && (j.state = Rr, j.timer.stop(), j.on.call("cancel", a, a.__data__, j.index, j.group), delete u[x]);
      }
    if (L0(function() {
      r.state === Or && (r.state = q0, r.timer.restart(p, r.delay, r.time), p(g));
    }), r.state = Xo, r.on.call("start", a, a.__data__, r.index, r.group), r.state === Xo) {
      for (r.state = Or, f = new Array(S = r.tween.length), x = 0, _ = -1; x < S; ++x)
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
    r.state = Rr, r.timer.stop(), delete u[s];
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
      f = u.state > Xo && u.state < Vo, u.state = Rr, u.timer.stop(), u.on.call(f ? "interrupt" : "cancel", a, a.__data__, u.index, u.group), delete r[m];
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
    var f = kn(this, a), d = f.tween;
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
    var d = kn(this, a), m = d.tween;
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
function rf(a, s, r) {
  var u = a._id;
  return a.each(function() {
    var f = kn(this, u);
    (f.value || (f.value = {}))[s] = r.apply(this, arguments);
  }), function(f) {
    return Sn(f, u).value[s];
  };
}
function tg(a, s) {
  var r;
  return (typeof s == "number" ? Tl : s instanceof ni ? D0 : (r = ni(s)) ? (s = r, D0) : Nb)(a, s);
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
  var r = tc(a), u = r === "transform" ? Ab : tg;
  return this.attrTween(a, typeof s == "function" ? (r.local ? Kb : Zb)(r, u, rf(this, "attr." + a, s)) : s == null ? (r.local ? Xb : Gb)(r) : (r.local ? Qb : Vb)(r, u, s));
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
    sf(this, a).delay = +s.apply(this, arguments);
  };
}
function t2(a, s) {
  return s = +s, function() {
    sf(this, a).delay = s;
  };
}
function n2(a) {
  var s = this._id;
  return arguments.length ? this.each((typeof a == "function" ? e2 : t2)(s, a)) : Sn(this.node(), s).delay;
}
function l2(a, s) {
  return function() {
    kn(this, a).duration = +s.apply(this, arguments);
  };
}
function a2(a, s) {
  return s = +s, function() {
    kn(this, a).duration = s;
  };
}
function s2(a) {
  var s = this._id;
  return arguments.length ? this.each((typeof a == "function" ? l2 : a2)(s, a)) : Sn(this.node(), s).duration;
}
function i2(a, s) {
  if (typeof s != "function") throw new Error();
  return function() {
    kn(this, a).ease = s;
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
    kn(this, a).ease = r;
  };
}
function u2(a) {
  if (typeof a != "function") throw new Error();
  return this.each(c2(this._id, a));
}
function o2(a) {
  typeof a != "function" && (a = Hp(a));
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
  var u, f, d = d2(s) ? sf : kn;
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
  typeof a != "function" && (a = tf(a));
  for (var u = this._groups, f = u.length, d = new Array(f), m = 0; m < f; ++m)
    for (var p = u[m], y = p.length, g = d[m] = new Array(y), x, _, S = 0; S < y; ++S)
      (x = p[S]) && (_ = a.call(x, x.__data__, S, p)) && ("__data__" in x && (_.__data__ = x.__data__), g[S] = _, lc(g[S], s, r, S, g, Sn(x, r)));
  return new el(d, this._parents, s, r);
}
function v2(a) {
  var s = this._name, r = this._id;
  typeof a != "function" && (a = Dp(a));
  for (var u = this._groups, f = u.length, d = [], m = [], p = 0; p < f; ++p)
    for (var y = u[p], g = y.length, x, _ = 0; _ < g; ++_)
      if (x = y[_]) {
        for (var S = a.call(x, x.__data__, _, y), j, T = Sn(x, r), H = 0, L = S.length; H < L; ++H)
          (j = S[H]) && lc(j, s, r, H, S, T);
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
function ng(a) {
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
    var y = kn(this, a), g = y.on, x = y.value[d] == null ? p || (p = ng(s)) : void 0;
    (g !== r || f !== x) && (u = (r = g).copy()).on(m, f = x), y.on = u;
  };
}
function N2(a, s, r) {
  var u = (a += "") == "transform" ? Eb : tg;
  return s == null ? this.styleTween(a, b2(a, u)).on("end.style." + a, ng(a)) : typeof s == "function" ? this.styleTween(a, S2(a, u, rf(this, "style." + a, s))).each(j2(this._id, a)) : this.styleTween(a, w2(a, u, s), r).on("end.style." + a, null);
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
function A2(a) {
  return function() {
    this.textContent = a;
  };
}
function C2(a) {
  return function() {
    var s = a(this);
    this.textContent = s ?? "";
  };
}
function z2(a) {
  return this.tween("text", typeof a == "function" ? C2(rf(this, "text", a)) : A2(a == null ? "" : a + ""));
}
function k2(a) {
  return function(s) {
    this.textContent = a.call(this, s);
  };
}
function O2(a) {
  var s, r;
  function u() {
    var f = a.apply(this, arguments);
    return f !== r && (s = (r = f) && k2(f)), s;
  }
  return u._value = a, u;
}
function R2(a) {
  var s = "text";
  if (arguments.length < 1) return (s = this.tween(s)) && s._value;
  if (a == null) return this.tween(s, null);
  if (typeof a != "function") throw new Error();
  return this.tween(s, O2(a));
}
function D2() {
  for (var a = this._name, s = this._id, r = lg(), u = this._groups, f = u.length, d = 0; d < f; ++d)
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
      var g = kn(this, u), x = g.on;
      x !== a && (s = (a = x).copy(), s._.cancel.push(p), s._.interrupt.push(p), s._.end.push(y)), g.on = s;
    }), f === 0 && d();
  });
}
var U2 = 0;
function el(a, s, r, u) {
  this._groups = a, this._parents = s, this._name = r, this._id = u;
}
function lg() {
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
  textTween: R2,
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
  a instanceof el ? (s = a._id, a = a._name) : (s = lg(), (r = B2).time = af(), a = a == null ? null : a + "");
  for (var u = this._groups, f = u.length, d = 0; d < f; ++d)
    for (var m = u[d], p = m.length, y, g = 0; g < p; ++g)
      (y = m[g]) && lc(y, a, s, g, m, r || q2(y, s));
  return new el(u, this._parents, a, s);
}
ci.prototype.interrupt = Lb;
ci.prototype.transition = Y2;
function $s(a, s, r) {
  this.k = a, this.x = s, this.y = r;
}
$s.prototype = {
  constructor: $s,
  scale: function(a) {
    return a === 1 ? this : new $s(this.k * a, this.x, this.y);
  },
  translate: function(a, s) {
    return a === 0 & s === 0 ? this : new $s(this.k, this.x + this.k * a, this.y + this.k * s);
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
$s.prototype;
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
  let T = [], H, L;
  const V = { x: 0, y: 0 }, I = { x: 0, y: 0 }, [, , X, P] = G2({
    sourceX: a.x,
    sourceY: a.y,
    targetX: r.x,
    targetY: r.y
  });
  if (p[S] * y[S] === -1) {
    S === "x" ? (H = f.x ?? g.x + (x.x - g.x) * m, L = f.y ?? (g.y + x.y) / 2) : (H = f.x ?? (g.x + x.x) / 2, L = f.y ?? g.y + (x.y - g.y) * m);
    const K = [
      { x: H, y: g.y },
      { x: H, y: x.y }
    ], ce = [
      { x: g.x, y: L },
      { x: x.x, y: L }
    ];
    p[S] === j ? T = S === "x" ? K : ce : T = S === "x" ? ce : K;
  } else {
    const K = [{ x: g.x, y: x.y }], ce = [{ x: x.x, y: g.y }];
    if (S === "x" ? T = p.x === j ? ce : K : T = p.y === j ? K : ce, s === u) {
      const oe = Math.abs(a[S] - r[S]);
      if (oe <= d) {
        const we = Math.min(d - 1, d - oe);
        p[S] === j ? V[S] = (g[S] > a[S] ? -1 : 1) * we : I[S] = (x[S] > r[S] ? -1 : 1) * we;
      }
    }
    if (s !== u) {
      const oe = S === "x" ? "y" : "x", we = p[S] === y[oe], C = g[oe] > x[oe], q = g[oe] < x[oe];
      (p[S] === 1 && (!we && C || we && q) || p[S] !== 1 && (!we && q || we && C)) && (T = S === "x" ? K : ce);
    }
    const ge = { x: g.x + V.x, y: g.y + V.y }, se = { x: x.x + I.x, y: x.y + I.y }, te = Math.max(Math.abs(ge.x - T[0].x), Math.abs(se.x - T[0].x)), Me = Math.max(Math.abs(ge.y - T[0].y), Math.abs(se.y - T[0].y));
    te >= Me ? (H = (ge.x + se.x) / 2, L = T[0].y) : (H = T[0].x, L = (ge.y + se.y) / 2);
  }
  const ee = { x: g.x + V.x, y: g.y + V.y }, W = { x: x.x + I.x, y: x.y + I.y };
  return [[
    a,
    // we only want to add the gapped source/target if they are different from the first/last point to avoid duplicates which can cause issues with the bends
    ...ee.x !== T[0].x || ee.y !== T[0].y ? [ee] : [],
    ...T,
    ...W.x !== T[T.length - 1].x || W.y !== T[T.length - 1].y ? [W] : [],
    r
  ], H, L, X, P];
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
  const [_, S, j, T, H] = V2({
    source: { x: a, y: s },
    sourcePosition: r,
    target: { x: u, y: f },
    targetPosition: d,
    center: { x: p, y },
    offset: g,
    stepPosition: x
  });
  let L = `M${_[0].x} ${_[0].y}`;
  for (let V = 1; V < _.length - 1; V++)
    L += Q2(_[V - 1], _[V], _[V + 1], m);
  return L += `L${_[_.length - 1].x} ${_[_.length - 1].y}`, [L, S, j, T, H];
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
], Qr = 120, Fl = 56, en = 90, Ar = 100, Ws = 72, oi = 260, Ka = 175, ag = oi, sg = 340, ig = 10, rg = 450, Co = 580, zo = 420, Zr = 3;
function cg(a, s, r, u) {
  const f = (a - 1) * r, d = s - f / 2;
  return Array.from({ length: a }, (m, p) => d + p * r - u / 2);
}
const ug = cg(Xr.length, Ka, 75, Fl), og = cg(Vr.length, Ka, 68, Fl);
function cf(a, s, r, u, f, d) {
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
  const r = ig + Qr, u = ug[s] + Fl / 2, f = oi - en / 2, d = Ka - en / 2, m = f, p = d + en * (0.25 + s * 0.25);
  fi.push({
    id: `${a.id}-hub`,
    path: cf(r, u, $e.Right, m, p, $e.Left),
    defaultColor: a.color
  });
});
Vr.forEach((a, s) => {
  const r = oi + en / 2, u = Ka - en / 2, f = r, d = u + en * (0.13 + s * 0.25), m = rg, p = og[s] + Fl / 2;
  fi.push({
    id: `hub-${a.id}`,
    path: cf(f, d, $e.Right, m, p, $e.Left),
    defaultColor: a.color
  });
});
fi.push({
  id: "batt-edge",
  path: cf(oi, Ka + en / 2, $e.Bottom, ag, sg - Ws / 2, $e.Top),
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
function ko(a, s) {
  return 4 - Math.min(a / (s === "amps" ? 20 : 500), 1) * 3;
}
function Oo(a, s) {
  const r = Math.min(a / (s === "amps" ? 15 : 400), 1);
  return r > 0.5 ? 3 : r > 0.15 ? 2 : 1;
}
let Qo = 0, Zo = !1;
const fg = /* @__PURE__ */ new Map(), dg = /* @__PURE__ */ new Map();
function $2() {
  if (Zo) return;
  Zo = !0;
  function a(s) {
    for (const r of fi) {
      const { id: u } = r, f = K2(u), d = J2(u), m = f.lastTime === 0 ? 0 : Math.min((s - f.lastTime) / 1e3, 0.1);
      f.lastTime = s;
      const p = fg.get(u);
      p && (p.setAttribute("stroke", d.color), p.setAttribute("stroke-width", String(d.strokeWidth)), p.setAttribute("opacity", d.active ? "0.25" : "0.06"));
      const y = dg.get(u);
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
  const [a, s] = O.useState("amps"), { open: r } = zn(), u = a === "amps" ? "A" : "W", f = a === "amps" ? 0.05 : 2, d = a === "amps" ? 1 : 0, { value: m } = G("sensor.olins_van_bms_battery"), { value: p } = G("sensor.battery_charging"), { value: y } = G("sensor.battery_discharging"), { value: g } = G("sensor.olins_van_bms_current"), { value: x } = G("sensor.total_mppt_pv_power"), { value: _ } = G("sensor.shore_power_charger_power_24v"), { value: S } = G("sensor.alternator_charger_power_24v"), { value: j } = G("sensor.total_mppt_output_current"), { value: T } = G("sensor.a32_pro_s5140_channel_16_current_24v_shore_power_charger"), { value: H } = G("sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger"), { value: L } = G("sensor.all_12v_devices_power_24v"), { value: V } = G("sensor.air_conditioning_power_24v"), { value: I } = G("sensor.all_24v_devices_power_24v"), { value: X } = G("sensor.inverter_power_24v"), { value: P } = G("sensor.a32_pro_s5140_channel_6_current_24v_12v_devices"), { value: ee } = G("sensor.a32_pro_s5140_channel_4_current_24v_air_conditioning"), { value: W } = G("sensor.a32_pro_s5140_channel_5_current_24v_24v_devices"), { value: J } = G("sensor.a32_pro_s5140_channel_7_current_24v_inverter"), K = a === "amps" ? { solar: Math.abs(j ?? 0), shore: Math.abs(T ?? 0), alt: Math.abs(H ?? 0) } : { solar: Math.abs(x ?? 0), shore: Math.abs(_ ?? 0), alt: Math.abs(S ?? 0) }, ce = a === "amps" ? { "12v": Math.abs(P ?? 0), ac: Math.abs(ee ?? 0), "24v": Math.abs(W ?? 0), inverter: Math.abs(J ?? 0) } : { "12v": Math.abs(L ?? 0), ac: Math.abs(V ?? 0), "24v": Math.abs(I ?? 0), inverter: Math.abs(X ?? 0) };
  let ge, se;
  if (a === "amps") {
    const b = g ?? 0;
    ge = b > 0 ? b : 0, se = b < 0 ? Math.abs(b) : 0;
  } else
    ge = p ?? 0, se = y ?? 0;
  const te = Object.values(ce).reduce((b, R) => b + R, 0), Me = m ?? 0, oe = Me >= 65 ? "#16a34a" : Me >= 30 ? "#d97706" : "#dc2626", we = a === "amps" ? 15 : 300, C = 4.5;
  Xr.forEach((b) => {
    const R = K[b.id], Y = R > f;
    Dr.set(`${b.id}-hub`, {
      color: b.color,
      active: Y,
      speed: ko(R, a),
      dotCount: Oo(R, a),
      reverse: !1,
      strokeWidth: Y ? Math.min(1.5 + R / we * C, C) : 1
    });
  }), Vr.forEach((b) => {
    const R = ce[b.id], Y = R > f;
    Dr.set(`hub-${b.id}`, {
      color: b.color,
      active: Y,
      speed: ko(R, a),
      dotCount: Oo(R, a),
      reverse: !1,
      strokeWidth: Y ? Math.min(1.5 + R / we * C, C) : 1
    });
  });
  const q = Math.max(ge, se), F = ge > f || se > f;
  Dr.set("batt-edge", {
    color: ge > f ? "#16a34a" : se > f ? "#ea580c" : "hsl(var(--border))",
    active: F,
    speed: ko(q, a),
    dotCount: F ? Oo(q, a) : 0,
    reverse: se > f,
    strokeWidth: F ? Math.min(1.5 + q / we * C, C) : 1
  });
  const ve = O.useRef(null), je = O.useRef(!1);
  return O.useEffect(() => {
    const b = ve.current;
    if (!(!b || je.current)) {
      je.current = !0;
      for (const R of fi) {
        const Y = document.createElementNS("http://www.w3.org/2000/svg", "path");
        Y.setAttribute("d", R.path), Y.setAttribute("fill", "none"), Y.setAttribute("stroke", "#888"), Y.setAttribute("stroke-width", "1"), Y.setAttribute("stroke-linecap", "round"), Y.setAttribute("opacity", "0.07"), b.appendChild(Y), fg.set(R.id, Y);
        const $ = [];
        for (let me = 0; me < Zr; me++) {
          const Q = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          Q.setAttribute("r", "3.5"), Q.setAttribute("fill", "none"), Q.setAttribute("opacity", "0"), b.appendChild(Q), $.push(Q);
        }
        dg.set(R.id, $);
      }
      return $2(), () => W2();
    }
  }, []), /* @__PURE__ */ o.jsx(Ue, { children: /* @__PURE__ */ o.jsxs(Le, { className: "pt-4 relative", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "absolute top-3 left-3 z-10 flex gap-1", children: [
      /* @__PURE__ */ o.jsx(
        "button",
        {
          onClick: () => s("amps"),
          className: ie(
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
          className: ie(
            "text-[10px] px-2 py-0.5 rounded-md border transition-colors",
            a === "power" ? "bg-blue-500/15 text-blue-400 border-blue-500/30" : "bg-card text-muted-foreground border-border hover:text-foreground"
          ),
          children: "Watts"
        }
      )
    ] }),
    /* @__PURE__ */ o.jsxs("div", { style: { position: "relative", width: "100%", aspectRatio: `${Co}/${zo}`, margin: "0 auto" }, children: [
      /* @__PURE__ */ o.jsx(
        "svg",
        {
          ref: ve,
          viewBox: `0 0 ${Co} ${zo}`,
          style: { position: "absolute", inset: 0, width: "100%", height: "100%" },
          preserveAspectRatio: "xMidYMid meet"
        }
      ),
      /* @__PURE__ */ o.jsx("div", { style: {
        position: "absolute",
        inset: 0
        /* Use SVG viewBox coordinates via scale transform */
      }, children: /* @__PURE__ */ o.jsxs("svg", { viewBox: `0 0 ${Co} ${zo}`, style: { width: "100%", height: "100%" }, preserveAspectRatio: "xMidYMid meet", children: [
        Xr.map((b, R) => {
          const Y = K[b.id], $ = a === "amps" ? b.currentEntity : b.powerEntity;
          return /* @__PURE__ */ o.jsx("foreignObject", { x: ig, y: ug[R], width: Qr, height: Fl, children: /* @__PURE__ */ o.jsx(
            W0,
            {
              def: b,
              val: Z(Y, d),
              unit: u,
              active: Y > f,
              onClick: () => r($, b.label, u)
            }
          ) }, b.id);
        }),
        /* @__PURE__ */ o.jsx("foreignObject", { x: oi - en / 2, y: Ka - en / 2, width: en, height: en, children: /* @__PURE__ */ o.jsxs("div", { style: {
          width: en,
          height: en,
          borderRadius: "50%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: `1.5px solid ${te > f ? "#ca8a0450" : "hsl(var(--border))"}`,
          boxShadow: te > f ? "0 0 10px #ca8a0415" : "none",
          transition: "border-color 0.3s, box-shadow 0.3s"
        }, children: [
          /* @__PURE__ */ o.jsx(xp, { size: 18, style: { color: te > f ? "#ca8a04" : "hsl(var(--muted-foreground))" } }),
          /* @__PURE__ */ o.jsxs("span", { style: { fontSize: 11, fontWeight: 600, fontVariantNumeric: "tabular-nums", marginTop: 2, color: "hsl(var(--foreground))" }, children: [
            Z(te, d),
            " ",
            u
          ] })
        ] }) }),
        /* @__PURE__ */ o.jsx("foreignObject", { x: ag - Ar / 2, y: sg - Ws / 2, width: Ar, height: Ws, children: /* @__PURE__ */ o.jsx(
          "div",
          {
            style: { width: Ar, height: Ws, position: "relative", cursor: "pointer" },
            onClick: () => r("sensor.olins_van_bms_battery", "Battery SOC", "%"),
            children: /* @__PURE__ */ o.jsxs("div", { style: {
              width: Ar,
              height: Ws,
              borderRadius: "12px 12px 0 0",
              border: `1px solid ${oe}50`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 8px ${oe}15`,
              transition: "border-color 0.3s"
            }, children: [
              /* @__PURE__ */ o.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                /* @__PURE__ */ o.jsx(kv, { size: 16, style: { color: oe } }),
                /* @__PURE__ */ o.jsxs("span", { style: { fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: oe }, children: [
                  Z(Me, 0),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ o.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", marginTop: 2 }, children: [
                ge > f && /* @__PURE__ */ o.jsxs("span", { style: { fontSize: 10, fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "#16a34a" }, children: [
                  "↓ ",
                  Z(ge, d),
                  " ",
                  u
                ] }),
                se > f && /* @__PURE__ */ o.jsxs("span", { style: { fontSize: 10, fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "#ea580c" }, children: [
                  "↑ ",
                  Z(se, d),
                  " ",
                  u
                ] }),
                ge <= f && se <= f && /* @__PURE__ */ o.jsx("span", { style: { fontSize: 10, color: "hsl(var(--muted-foreground))", opacity: 0.5 }, children: "Idle" })
              ] }),
              /* @__PURE__ */ o.jsx("div", { style: {
                position: "absolute",
                bottom: 0,
                left: 0,
                height: 3,
                borderRadius: "0 0 12px 12px",
                width: `${Me}%`,
                backgroundColor: oe,
                boxShadow: `0 0 4px ${oe}40`,
                transition: "all 0.5s"
              } })
            ] })
          }
        ) }),
        Vr.map((b, R) => {
          const Y = ce[b.id], $ = a === "amps" ? b.currentEntity : b.powerEntity;
          return /* @__PURE__ */ o.jsx("foreignObject", { x: rg, y: og[R], width: Qr, height: Fl, children: /* @__PURE__ */ o.jsx(
            W0,
            {
              def: b,
              val: Z(Y, d),
              unit: u,
              active: Y > f,
              onClick: () => r($, b.label, u)
            }
          ) }, b.id);
        })
      ] }) })
    ] })
  ] }) });
}
function I2() {
  const { value: a } = G("sensor.a32_pro_smart_battery_sense_12v_voltage"), { value: s } = G("sensor.a32_pro_smart_battery_sense_12v_temperature"), { value: r } = G("sensor.battery_charging"), { value: u } = G("sensor.battery_discharging");
  return /* @__PURE__ */ o.jsxs(Ue, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(vp, { className: "h-4 w-4" }),
      "System Voltages"
    ] }) }),
    /* @__PURE__ */ o.jsxs(Le, { className: "space-y-1", children: [
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.a32_pro_smart_battery_sense_12v_voltage", label: "12V Rail", value: Z(a, 2), unit: "V", color: "#6366f1" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.a32_pro_smart_battery_sense_12v_temperature", label: "12V Temp", value: Z(s, 1), unit: "°C", color: "#3b82f6" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.battery_charging", label: "Charging", value: Z(r, 0), unit: "W", color: "#22c55e" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.battery_discharging", label: "Discharging", value: Z(u, 0), unit: "W", color: "#f97316" })
    ] })
  ] });
}
function P2() {
  return /* @__PURE__ */ o.jsxs(Ue, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(ri, { className: "h-4 w-4" }),
      "Charging Controls"
    ] }) }),
    /* @__PURE__ */ o.jsx(Le, { children: /* @__PURE__ */ o.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ o.jsx(
        ct,
        {
          entityId: "input_boolean.shore_power_charger_enabled",
          name: "Shore Charger",
          icon: bp,
          activeColor: "green"
        }
      ),
      /* @__PURE__ */ o.jsx(zp, {})
    ] }) })
  ] });
}
function e5() {
  return /* @__PURE__ */ o.jsx(ea, { title: "Power & Energy", children: /* @__PURE__ */ o.jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsx(Mp, {}),
      /* @__PURE__ */ o.jsx(I2, {})
    ] }),
    /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsx(Tp, {}),
      /* @__PURE__ */ o.jsx(P2, {})
    ] }),
    /* @__PURE__ */ o.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ o.jsx(F2, {}) })
  ] }) });
}
const En = 140, An = 140, Xa = 110, Cr = 12, Il = 135, Kr = 405, hg = Kr - Il;
function Fs(a) {
  return a * Math.PI / 180;
}
function Ko(a) {
  const s = Fs(a);
  return { x: En + Xa * Math.cos(s), y: An + Xa * Math.sin(s) };
}
function F0(a, s) {
  const r = Ko(a), u = Ko(s), d = s - a > 180 ? 1 : 0;
  return `M ${r.x} ${r.y} A ${Xa} ${Xa} 0 ${d} 1 ${u.x} ${u.y}`;
}
function I0(a, s, r) {
  const u = Math.max(0, Math.min(1, (a - s) / (r - s)));
  return Il + u * hg;
}
function P0(a, s, r, u) {
  const f = s + (a - Il) / hg * (r - s);
  return Math.round(Math.max(s, Math.min(r, f)) / u) * u;
}
function t5(a, s, r, u, f, d) {
  const m = O.useRef(!1), p = O.useCallback(
    (_, S) => {
      const j = a.current;
      if (!j) return null;
      const T = j.getBoundingClientRect(), H = 280 / T.width, L = 280 / T.height, V = (_ - T.left) * H, I = (S - T.top) * L;
      let X = Math.atan2(I - An, V - En) * 180 / Math.PI;
      return X < 0 && (X += 360), X < 90 && (X += 360), X < Il && (X = Il), X > Kr && (X = Kr), X;
    },
    [a]
  ), y = O.useCallback(
    (_, S) => {
      if (!m.current) return;
      const j = p(_, S);
      j !== null && f(P0(j, s, r, u));
    },
    [p, s, r, u, f]
  ), g = O.useCallback(() => {
    m.current && (m.current = !1, d());
  }, [d]);
  return O.useEffect(() => {
    const _ = (T) => y(T.clientX, T.clientY), S = (T) => {
      T.touches[0] && y(T.touches[0].clientX, T.touches[0].clientY);
    }, j = () => g();
    return window.addEventListener("mousemove", _), window.addEventListener("mouseup", j), window.addEventListener("touchmove", S, { passive: !0 }), window.addEventListener("touchend", j), window.addEventListener("touchcancel", j), () => {
      window.removeEventListener("mousemove", _), window.removeEventListener("mouseup", j), window.removeEventListener("touchmove", S), window.removeEventListener("touchend", j), window.removeEventListener("touchcancel", j);
    };
  }, [y, g]), { startDrag: O.useCallback(
    (_) => {
      _.preventDefault(), m.current = !0;
      const S = "touches" in _ ? _.touches[0].clientX : _.clientX, j = "touches" in _ ? _.touches[0].clientY : _.clientY, T = p(S, j);
      T !== null && f(P0(T, s, r, u));
    },
    [p, s, r, u, f]
  ) };
}
function n5() {
  var se, te, Me, oe, we, C;
  const a = he("climate.a32_pro_van_hydronic_heating_pid"), s = El(), [r, u] = O.useState(null), f = O.useRef(null), d = O.useRef(null), m = O.useCallback(
    (q) => {
      f.current && clearTimeout(f.current), f.current = setTimeout(() => {
        s("climate", "set_temperature", { temperature: q }, {
          entity_id: "climate.a32_pro_van_hydronic_heating_pid"
        });
      }, 400);
    },
    [s]
  ), p = ((se = a == null ? void 0 : a.attributes) == null ? void 0 : se.temperature) ?? 0, y = ((te = a == null ? void 0 : a.attributes) == null ? void 0 : te.current_temperature) ?? 0, g = ((Me = a == null ? void 0 : a.attributes) == null ? void 0 : Me.min_temp) ?? 5, x = ((oe = a == null ? void 0 : a.attributes) == null ? void 0 : oe.max_temp) ?? 35, _ = ((we = a == null ? void 0 : a.attributes) == null ? void 0 : we.target_temp_step) ?? 0.1, j = ((a == null ? void 0 : a.state) ?? "off") === "heat", H = ((C = a == null ? void 0 : a.attributes) == null ? void 0 : C.hvac_action) === "heating", L = r ?? p;
  O.useEffect(() => {
    u(null);
  }, [p]);
  const V = O.useCallback(
    (q) => {
      u(q), m(q);
    },
    [m]
  ), I = O.useCallback(() => {
  }, []), { startDrag: X } = t5(d, g, x, _, V, I), P = O.useCallback(() => {
    s("climate", "set_hvac_mode", {
      hvac_mode: j ? "off" : "heat"
    }, { entity_id: "climate.a32_pro_van_hydronic_heating_pid" });
  }, [s, j]), ee = O.useCallback(
    (q) => {
      const F = Math.round(Math.max(g, Math.min(x, L + q)) / _) * _;
      u(F), m(F);
    },
    [L, g, x, _, m]
  );
  if (!a) return null;
  const W = I0(L, g, x), J = I0(y, g, x), K = Ko(W), ce = j ? H ? "#f97316" : "#f59e0b" : "hsl(var(--muted))", ge = j ? "#f97316" : "hsl(var(--muted-foreground))";
  return /* @__PURE__ */ o.jsx(Ue, { children: /* @__PURE__ */ o.jsxs(Le, { className: "pt-4 pb-4 px-2 flex flex-col items-center", children: [
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
              strokeWidth: Cr,
              strokeLinecap: "round"
            }
          ),
          j && /* @__PURE__ */ o.jsx(
            "path",
            {
              d: F0(Il, W),
              fill: "none",
              stroke: ce,
              strokeWidth: Cr,
              strokeLinecap: "round",
              className: "transition-all duration-150"
            }
          ),
          (() => {
            const q = Xa + Cr / 2 + 4, F = Xa - Cr / 2 - 4, ve = {
              x: En + q * Math.cos(Fs(J)),
              y: An + q * Math.sin(Fs(J))
            }, je = {
              x: En + F * Math.cos(Fs(J)),
              y: An + F * Math.sin(Fs(J))
            };
            return /* @__PURE__ */ o.jsx(
              "line",
              {
                x1: je.x,
                y1: je.y,
                x2: ve.x,
                y2: ve.y,
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
              cx: K.x,
              cy: K.y,
              r: j ? 12 : 10,
              fill: ge,
              stroke: "white",
              strokeWidth: 2,
              className: ie("cursor-grab active:cursor-grabbing", !j && "opacity-50"),
              onMouseDown: j ? X : void 0,
              onTouchStart: j ? X : void 0
            }
          ),
          /* @__PURE__ */ o.jsx(
            "text",
            {
              x: En,
              y: An - 6,
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
              y: An - 20,
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
                y1: An + 24,
                x2: En + 30,
                y2: An + 24,
                stroke: "hsl(var(--border))",
                strokeWidth: 1
              }
            ),
            /* @__PURE__ */ o.jsxs(
              "text",
              {
                x: En - 4,
                y: An + 44,
                textAnchor: "middle",
                dominantBaseline: "central",
                className: "fill-muted-foreground",
                fontSize: 16,
                children: [
                  L.toFixed(1),
                  "°C"
                ]
              }
            ),
            /* @__PURE__ */ o.jsx(
              "text",
              {
                x: En + 32,
                y: An + 44,
                textAnchor: "start",
                dominantBaseline: "central",
                fontSize: 14,
                className: H ? "fill-orange-500" : "fill-muted-foreground",
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
          onClick: P,
          className: ie(
            "p-2.5 rounded-full border-2 transition-all",
            j ? "border-orange-500 bg-orange-500/10 text-orange-500" : "border-border bg-card text-muted-foreground hover:text-foreground"
          ),
          children: /* @__PURE__ */ o.jsx(wp, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ o.jsx(
        "button",
        {
          className: ie(
            "p-2.5 rounded-full border-2 transition-all",
            H ? "border-orange-500 bg-orange-500/10 text-orange-500" : "border-border bg-card text-muted-foreground"
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
          onClick: () => ee(-0.1),
          disabled: !j,
          className: ie(
            "p-3 rounded-full border-2 transition-all",
            j ? "border-border bg-card text-foreground hover:bg-accent active:scale-95" : "border-border bg-card text-muted-foreground opacity-50"
          ),
          children: /* @__PURE__ */ o.jsx(Zv, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ o.jsx(
        "button",
        {
          onClick: () => ee(0.1),
          disabled: !j,
          className: ie(
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
  const { value: a } = G("sensor.battery_heater_power_12v"), { value: s } = G("sensor.a32_pro_s5140_channel_36_temperature_battery_bottom_aluminum_plate"), r = he("switch.a32_pro_battery_heater_enable"), u = yt("switch.a32_pro_battery_heater_enable"), f = he("climate.a32_pro_battery_heater_thermostat"), d = (y = f == null ? void 0 : f.attributes) == null ? void 0 : y.temperature, m = (g = f == null ? void 0 : f.attributes) == null ? void 0 : g.current_temperature, p = f == null ? void 0 : f.state;
  return /* @__PURE__ */ o.jsxs(Ue, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(Io, { className: "h-4 w-4" }),
      "Battery Heater",
      /* @__PURE__ */ o.jsxs("div", { className: "ml-auto flex items-center gap-1.5", children: [
        /* @__PURE__ */ o.jsx("span", { className: "text-[10px] text-muted-foreground", children: p === "heat" ? "Heating" : "Off" }),
        /* @__PURE__ */ o.jsx(Gt, { checked: (r == null ? void 0 : r.state) === "on", onCheckedChange: u })
      ] })
    ] }) }),
    /* @__PURE__ */ o.jsxs(Le, { className: "space-y-1", children: [
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.a32_pro_s5140_channel_36_temperature_battery_bottom_aluminum_plate", label: "Battery Plate", value: Z(s, 1), unit: "°C", color: "#3b82f6" }),
      m != null && /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
        /* @__PURE__ */ o.jsx("span", { className: "text-muted-foreground", children: "Thermostat" }),
        /* @__PURE__ */ o.jsxs("span", { className: "tabular-nums", children: [
          Z(m, 1),
          "°C → ",
          Z(d, 0),
          "°C"
        ] })
      ] }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.battery_heater_power_12v", label: "Power", value: Z(a, 0), unit: "W", color: "#ef4444" })
    ] })
  ] });
}
function s5() {
  const a = he("switch.a32_pro_coolant_blower_mode_auto_manual"), s = yt("switch.a32_pro_coolant_blower_mode_auto_manual"), r = (a == null ? void 0 : a.state) === "on";
  return /* @__PURE__ */ o.jsx(Ue, { children: /* @__PURE__ */ o.jsx(Le, { className: "pt-4", children: /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
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
      /* @__PURE__ */ o.jsx(Ap, {})
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
  const f = he(a), d = (f == null ? void 0 : f.state) === "on";
  return /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between py-0.5", children: [
    /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: s }),
    /* @__PURE__ */ o.jsx(
      "span",
      {
        className: ie(
          "text-xs font-medium px-2 py-0.5 rounded-full",
          d ? "bg-green-500/15 text-green-500" : "bg-muted text-muted-foreground"
        ),
        children: d ? r : u
      }
    )
  ] });
}
function u5() {
  return /* @__PURE__ */ o.jsxs(Ue, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(gp, { className: "h-4 w-4" }),
      "Valves & Pumps"
    ] }) }),
    /* @__PURE__ */ o.jsxs(Le, { className: "space-y-1", children: [
      r5.map((a) => /* @__PURE__ */ o.jsx(ep, { entityId: a.entityId, name: a.name }, a.entityId)),
      /* @__PURE__ */ o.jsx("div", { className: "border-t my-1.5" }),
      c5.map((a) => /* @__PURE__ */ o.jsx(ep, { entityId: a.entityId, name: a.name, onLabel: "Running", offLabel: "Off" }, a.entityId))
    ] })
  ] });
}
function o5() {
  const a = he("switch.a32_pro_water_system_master_switch"), s = he("switch.a32_pro_water_system_state_main"), r = he("switch.a32_pro_water_system_state_recirculating_shower"), u = he("switch.a32_pro_water_system_state_recirculating_shower_flush"), f = yt("switch.a32_pro_water_system_master_switch"), d = yt("switch.a32_pro_water_system_state_main"), m = yt("switch.a32_pro_water_system_state_recirculating_shower"), p = yt("switch.a32_pro_water_system_state_recirculating_shower_flush");
  return /* @__PURE__ */ o.jsxs(Ue, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(sx, { className: "h-4 w-4" }),
      "Water Controls"
    ] }) }),
    /* @__PURE__ */ o.jsxs(Le, { className: "space-y-3", children: [
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
  const { value: a } = G("sensor.propane_tank_percentage"), { value: s } = G("sensor.propane_liquid_volume"), { value: r } = G("sensor.propane_liquid_depth"), { value: u } = G("sensor.propane_raw_distance"), f = he("switch.a32_pro_switch16_lpg_valve"), d = yt("switch.a32_pro_switch16_lpg_valve"), m = a ?? 0, p = m < 15 ? "bg-red-500" : m < 30 ? "bg-orange-500" : "bg-green-500";
  return /* @__PURE__ */ o.jsxs(Ue, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(si, { className: "h-4 w-4" }),
      "Propane",
      /* @__PURE__ */ o.jsxs(
        "span",
        {
          className: ie(
            "ml-auto text-2xl font-bold tabular-nums",
            m < 15 ? "text-red-500" : m < 30 ? "text-orange-500" : "text-green-500"
          ),
          children: [
            Z(a, 0),
            "%"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ o.jsxs(Le, { className: "space-y-3", children: [
      /* @__PURE__ */ o.jsx("div", { className: "h-3 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ o.jsx(
        "div",
        {
          className: ie("h-full rounded-full transition-all duration-500", p),
          style: { width: `${Math.min(100, Math.max(0, m))}%` }
        }
      ) }),
      /* @__PURE__ */ o.jsxs("div", { className: "grid gap-1", children: [
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.propane_liquid_volume", label: "Volume", value: Z(s, 1), unit: "L", color: "#22c55e" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.propane_liquid_depth", label: "Liquid Depth", value: Z(r, 0), unit: "mm", color: "#3b82f6" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.propane_raw_distance", label: "Raw Distance", value: Z(u, 0), unit: "mm", color: "#64748b" })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between pt-2 border-t", children: [
        /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "LPG Valve" }),
        /* @__PURE__ */ o.jsx(Gt, { checked: (f == null ? void 0 : f.state) === "on", onCheckedChange: d })
      ] })
    ] })
  ] });
}
function d5() {
  const { value: a } = G("sensor.a32_pro_s5140_channel_38_temperature_fresh_water_tank"), { value: s } = G("sensor.a32_pro_s5140_channel_39_temperature_grey_water_tank"), { value: r } = G("sensor.a32_pro_s5140_channel_40_temperature_shower_water_tank"), u = he("switch.a32_pro_fresh_water_tank_heater_enable"), f = he("switch.a32_pro_grey_water_tank_heater_enable"), d = he("switch.a32_pro_shower_water_tank_heater_enable"), m = yt("switch.a32_pro_fresh_water_tank_heater_enable"), p = yt("switch.a32_pro_grey_water_tank_heater_enable"), y = yt("switch.a32_pro_shower_water_tank_heater_enable"), g = [
    { name: "Fresh", temp: a, entityId: "sensor.a32_pro_s5140_channel_38_temperature_fresh_water_tank", heater: u, toggleHeater: m },
    { name: "Grey", temp: s, entityId: "sensor.a32_pro_s5140_channel_39_temperature_grey_water_tank", heater: f, toggleHeater: p },
    { name: "Shower", temp: r, entityId: "sensor.a32_pro_s5140_channel_40_temperature_shower_water_tank", heater: d, toggleHeater: y }
  ];
  return /* @__PURE__ */ o.jsxs(Ue, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(Ir, { className: "h-4 w-4" }),
      "Tank Temperatures"
    ] }) }),
    /* @__PURE__ */ o.jsx(Le, { className: "space-y-2", children: g.map((x) => {
      var _;
      return /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsx(
          pe,
          {
            entityId: x.entityId,
            label: x.name,
            value: Z(x.temp, 1),
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
  return /* @__PURE__ */ o.jsxs(Ue, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsx(st, { className: "text-base", children: "Quick Modes" }) }),
    /* @__PURE__ */ o.jsx(Le, { children: /* @__PURE__ */ o.jsxs("div", { className: "flex flex-wrap gap-2", children: [
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
          icon: /* @__PURE__ */ o.jsx(Za, { className: "h-4 w-4 text-blue-500" })
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
const p5 = Ep(
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
  return /* @__PURE__ */ o.jsx("div", { className: ie(p5({ variant: s }), a), ...r });
}
function g5() {
  const { value: a } = G("sensor.192_168_10_90_0d_vehiclespeed"), { value: s } = G("sensor.192_168_10_90_0c_enginerpm"), r = he("sensor.gear_display"), { value: u } = G("sensor.192_168_10_90_11_throttleposition"), { value: f } = G("sensor.192_168_10_90_04_calcengineload"), { value: d } = G("sensor.192_168_10_90_05_enginecoolanttemp"), { value: m } = G("sensor.192_168_10_90_42_controlmodulevolt"), p = he("binary_sensor.vehicle_is_moving"), y = he("binary_sensor.engine_is_running"), { data: g } = Pl("sensor.192_168_10_90_0d_vehiclespeed", 6), { open: x } = zn(), _ = (p == null ? void 0 : p.state) === "on", S = (y == null ? void 0 : y.state) === "on", j = (r == null ? void 0 : r.state) ?? "—";
  return /* @__PURE__ */ o.jsxs(Ue, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(pp, { className: "h-4 w-4" }),
      "Engine",
      /* @__PURE__ */ o.jsxs("div", { className: "ml-auto flex gap-1.5", children: [
        S && /* @__PURE__ */ o.jsx(Jr, { variant: "default", className: "text-[10px] bg-green-500", children: "Running" }),
        _ && /* @__PURE__ */ o.jsx(Jr, { variant: "default", className: "text-[10px] bg-blue-500", children: "Moving" })
      ] })
    ] }) }),
    /* @__PURE__ */ o.jsxs(Le, { className: "space-y-3", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "grid grid-cols-3 gap-3 text-center", children: [
        /* @__PURE__ */ o.jsxs("div", { className: "cursor-pointer hover:bg-muted/50 rounded-md p-1 transition-colors", onClick: () => x("sensor.192_168_10_90_0d_vehiclespeed", "Speed", "km/h"), children: [
          /* @__PURE__ */ o.jsx("p", { className: "text-3xl font-bold tabular-nums", children: Z(a, 0) }),
          /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "km/h" })
        ] }),
        /* @__PURE__ */ o.jsxs("div", { className: "cursor-pointer hover:bg-muted/50 rounded-md p-1 transition-colors", onClick: () => x("sensor.192_168_10_90_0c_enginerpm", "RPM", "rpm"), children: [
          /* @__PURE__ */ o.jsx("p", { className: "text-3xl font-bold tabular-nums", children: Z(s, 0) }),
          /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "RPM" })
        ] }),
        /* @__PURE__ */ o.jsxs("div", { children: [
          /* @__PURE__ */ o.jsx("p", { className: "text-3xl font-bold tabular-nums", children: j }),
          /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Gear" })
        ] })
      ] }),
      /* @__PURE__ */ o.jsx(Qa, { data: g, color: "#3b82f6", width: 300, height: 32, className: "w-full", onClick: () => x("sensor.192_168_10_90_0d_vehiclespeed", "Speed", "km/h") }),
      /* @__PURE__ */ o.jsxs("div", { className: "grid gap-1", children: [
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.192_168_10_90_11_throttleposition", label: "Throttle", value: Z(u, 0), unit: "%", color: "#f59e0b" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.192_168_10_90_04_calcengineload", label: "Engine Load", value: Z(f, 0), unit: "%", color: "#ef4444" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.192_168_10_90_05_enginecoolanttemp", label: "Coolant Temp", value: Z(d, 0), unit: "°C", color: "#ef4444" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.192_168_10_90_42_controlmodulevolt", label: "ECU Voltage", value: Z(m, 1), unit: "V", color: "#6366f1" })
      ] })
    ] })
  ] });
}
function y5() {
  const { value: a } = G("sensor.stable_fuel_level"), { value: s } = G("sensor.192_168_10_90_2f_fueltanklevel"), { value: r } = G("sensor.wican_fuel_5_min_mean"), { value: u } = G("sensor.estimated_fuel_consumption"), { value: f } = G("sensor.estimated_fuel_rate"), { value: d } = G("sensor.192_168_10_90_0d_vehiclespeed"), { data: m } = Pl("sensor.stable_fuel_level", 24), { open: p } = zn(), y = a != null ? a / 100 * 94.6 : null, g = a ?? 0, x = g < 15 ? "text-red-500" : g < 30 ? "text-orange-500" : "text-green-500", _ = (d ?? 0) > 5 ? Z(u, 1) : "—";
  return /* @__PURE__ */ o.jsxs(Ue, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(yp, { className: "h-4 w-4" }),
      "Fuel",
      /* @__PURE__ */ o.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
        /* @__PURE__ */ o.jsx(Qa, { data: m, color: g < 15 ? "#ef4444" : g < 30 ? "#f97316" : "#22c55e", width: 56, height: 18, onClick: () => p("sensor.stable_fuel_level", "Fuel Level", "%") }),
        /* @__PURE__ */ o.jsxs("span", { className: ie("text-2xl font-bold tabular-nums", x), children: [
          Z(a, 0),
          "%"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ o.jsxs(Le, { className: "space-y-1", children: [
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.stable_fuel_level", label: "Estimated", value: Z(y, 1), unit: "L", color: "#22c55e" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.wican_fuel_5_min_mean", label: "5min Mean", value: Z(r, 0), unit: "%", color: "#3b82f6" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.192_168_10_90_2f_fueltanklevel", label: "Raw OBD", value: Z(s, 0), unit: "%", color: "#64748b" }),
      (f ?? 0) > 0 && /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.estimated_fuel_rate", label: "Rate", value: Z(f, 1), unit: "L/h", color: "#f59e0b" }),
      (f ?? 0) > 0 && /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.estimated_fuel_consumption", label: "Economy", value: _, unit: "L/100km", color: "#8b5cf6" })
    ] })
  ] });
}
function v5() {
  const { value: a, entity: s } = G("sensor.192_168_10_90_tyre_p_fl"), { value: r, entity: u } = G("sensor.192_168_10_90_tyre_p_fr"), { value: f, entity: d } = G("sensor.192_168_10_90_tyre_p_rl"), { value: m, entity: p } = G("sensor.192_168_10_90_tyre_p_rr"), y = he("binary_sensor.low_tire_pressure"), g = (y == null ? void 0 : y.state) === "on", x = (L, V) => {
    var X;
    return L == null ? null : ((X = V == null ? void 0 : V.attributes) == null ? void 0 : X.unit_of_measurement) === "kPa" ? L * 0.072519 : L;
  }, _ = x(a, s), S = x(r, u), j = x(f, d), T = x(m, p), H = (L) => (L ?? 0) < 50 ? "text-red-500" : (L ?? 0) < 55 ? "text-orange-500" : "text-green-500";
  return /* @__PURE__ */ o.jsxs(Ue, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(gp, { className: "h-4 w-4" }),
      "Tire Pressure",
      g && /* @__PURE__ */ o.jsx(Jr, { variant: "destructive", className: "ml-auto text-[10px]", children: "LOW" })
    ] }) }),
    /* @__PURE__ */ o.jsx(Le, { children: /* @__PURE__ */ o.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "rounded-lg bg-muted/50 p-3 text-center", children: [
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Front Left" }),
        /* @__PURE__ */ o.jsx("p", { className: ie("text-xl font-bold tabular-nums", H(_)), children: Z(_, 0) }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "psi" })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "rounded-lg bg-muted/50 p-3 text-center", children: [
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Front Right" }),
        /* @__PURE__ */ o.jsx("p", { className: ie("text-xl font-bold tabular-nums", H(S)), children: Z(S, 0) }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "psi" })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "rounded-lg bg-muted/50 p-3 text-center", children: [
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Rear Left" }),
        /* @__PURE__ */ o.jsx("p", { className: ie("text-xl font-bold tabular-nums", H(j)), children: Z(j, 0) }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "psi" })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "rounded-lg bg-muted/50 p-3 text-center", children: [
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Rear Right" }),
        /* @__PURE__ */ o.jsx("p", { className: ie("text-xl font-bold tabular-nums", H(T)), children: Z(T, 0) }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "psi" })
      ] })
    ] }) })
  ] });
}
function x5() {
  const { value: a } = G("sensor.road_grade_deg"), { value: s } = G("sensor.road_grade"), r = he("sensor.hill_aggression");
  return /* @__PURE__ */ o.jsxs(Ue, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(_p, { className: "h-4 w-4" }),
      "Road Grade"
    ] }) }),
    /* @__PURE__ */ o.jsxs(Le, { className: "space-y-1", children: [
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.road_grade", label: "Grade", value: Z(s, 1), unit: "%", color: "#22c55e" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.road_grade_deg", label: "Degrees", value: Z(a, 1), unit: "°", color: "#6366f1" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.hill_aggression", label: "Terrain", value: (r == null ? void 0 : r.state) ?? "—", unit: "", color: "#64748b" })
    ] })
  ] });
}
function _5() {
  const { value: a } = G("sensor.192_168_10_90_oil_life"), { value: s } = G("sensor.192_168_10_90_tran_f_temp"), { value: r } = G("sensor.192_168_10_90_wastegate"), { value: u } = G("sensor.192_168_10_90_intake_air_tmp"), { value: f } = G("sensor.192_168_10_90_46_ambientairtemp"), { value: d } = G("sensor.192_168_10_90_fuel_pressure"), { value: m } = G("sensor.192_168_10_90_map"), { value: p } = G("sensor.injector_pulse_width_ms"), { value: y } = G("sensor.average_fuel_trim"), { value: g } = G("sensor.commanded_afr"), x = he("binary_sensor.check_engine_light"), { value: _ } = G("sensor.dtc_count"), S = (x == null ? void 0 : x.state) === "on";
  return /* @__PURE__ */ o.jsxs(Ue, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(vp, { className: "h-4 w-4" }),
      "Diagnostics",
      S && /* @__PURE__ */ o.jsxs(Jr, { variant: "destructive", className: "ml-auto text-[10px] flex items-center gap-1", children: [
        /* @__PURE__ */ o.jsx(lx, { className: "h-3 w-3" }),
        "CEL (",
        _,
        " DTC)"
      ] })
    ] }) }),
    /* @__PURE__ */ o.jsxs(Le, { className: "space-y-1", children: [
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.192_168_10_90_oil_life", label: "Oil Life", value: Z(a, 0), unit: "%", color: "#22c55e" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.192_168_10_90_wastegate", label: "Wastegate", value: Z(r, 0), unit: "%", color: "#f59e0b" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.192_168_10_90_intake_air_tmp", label: "Intake Air", value: Z(u, 0), unit: "°C", color: "#06b6d4" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.192_168_10_90_46_ambientairtemp", label: "Ambient Air", value: Z(f, 0), unit: "°C", color: "#3b82f6" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.192_168_10_90_fuel_pressure", label: "Fuel Pressure", value: Z(d, 0), unit: "kPa", color: "#8b5cf6" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.192_168_10_90_map", label: "MAP", value: Z(m, 0), unit: "kPa", color: "#14b8a6" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.injector_pulse_width_ms", label: "Injector PW", value: Z(p, 2), unit: "ms", color: "#e879f9" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.average_fuel_trim", label: "Fuel Trim", value: Z(y, 1), unit: "%", color: "#fb923c" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.commanded_afr", label: "AFR", value: Z(g, 1), unit: ":1", color: "#a78bfa" })
    ] })
  ] });
}
function b5() {
  const { value: a } = G("sensor.192_168_10_90_0c_enginerpm"), { value: s } = G("sensor.192_168_10_90_42_controlmodulevolt"), { value: r } = G("sensor.192_168_10_90_05_enginecoolanttemp"), { value: u } = G("sensor.192_168_10_90_tran_f_temp"), { value: f } = G("sensor.road_grade"), d = he("sensor.hill_aggression"), { open: m } = zn(), p = (r ?? 0) > 105 ? "text-red-500" : (r ?? 0) > 95 ? "text-orange-400" : "text-foreground", y = (u ?? 0) > 110 ? "text-red-500" : (u ?? 0) > 95 ? "text-orange-400" : "text-foreground";
  return /* @__PURE__ */ o.jsx(Ue, { children: /* @__PURE__ */ o.jsxs(Le, { className: "pt-4 pb-3", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "cursor-pointer hover:bg-muted/50 rounded-lg p-2 text-center transition-colors", onClick: () => m("sensor.192_168_10_90_0c_enginerpm", "RPM", "rpm"), children: [
        /* @__PURE__ */ o.jsx("p", { className: "text-3xl font-bold tabular-nums", children: Z(a, 0) }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "RPM" })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "cursor-pointer hover:bg-muted/50 rounded-lg p-2 text-center transition-colors", onClick: () => m("sensor.192_168_10_90_42_controlmodulevolt", "Battery Voltage", "V"), children: [
        /* @__PURE__ */ o.jsx("p", { className: "text-3xl font-bold tabular-nums", children: Z(s, 2) }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Battery V" })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: ie("cursor-pointer hover:bg-muted/50 rounded-lg p-2 text-center transition-colors"), onClick: () => m("sensor.192_168_10_90_05_enginecoolanttemp", "Coolant Temp", "°C"), children: [
        /* @__PURE__ */ o.jsxs("p", { className: ie("text-3xl font-bold tabular-nums", p), children: [
          Z(r, 0),
          "°"
        ] }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Coolant" })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: ie("cursor-pointer hover:bg-muted/50 rounded-lg p-2 text-center transition-colors"), onClick: () => m("sensor.192_168_10_90_tran_f_temp", "Trans Temp", "°C"), children: [
        /* @__PURE__ */ o.jsxs("p", { className: ie("text-3xl font-bold tabular-nums", y), children: [
          Z(u, 0),
          "°"
        ] }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Trans" })
      ] })
    ] }),
    /* @__PURE__ */ o.jsxs("div", { className: "mt-2 flex items-center justify-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 transition-colors", onClick: () => m("sensor.road_grade", "Road Grade", "%"), children: [
      /* @__PURE__ */ o.jsx(_p, { className: "h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ o.jsxs("span", { className: "text-2xl font-bold tabular-nums", children: [
        Z(f, 1),
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
  return /* @__PURE__ */ o.jsxs("div", { className: ie("flex items-center justify-between", d), children: [
    /* @__PURE__ */ o.jsxs(
      "span",
      {
        className: ie(
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
        className: ie(
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
  const { value: a } = G("sensor.starlink_downlink_throughput_mbps"), { value: s } = G("sensor.starlink_uplink_throughput_mbps"), { value: r } = G("sensor.speedtest_download"), { value: u } = G("sensor.speedtest_upload"), { value: f } = G("sensor.speedtest_ping"), d = he("binary_sensor.starlink_ethernet_speeds"), m = (d == null ? void 0 : d.state) === "off", { open: p } = zn();
  return /* @__PURE__ */ o.jsxs(Ue, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(Yv, { className: "h-4 w-4" }),
      "Internet"
    ] }) }),
    /* @__PURE__ */ o.jsxs(Le, { className: "space-y-3", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ o.jsxs(
          "div",
          {
            className: "rounded-lg bg-muted/50 p-2.5 text-center cursor-pointer hover:bg-muted/80 transition-colors",
            onClick: () => p("sensor.starlink_downlink_throughput_mbps", "Download", "Mbps"),
            children: [
              /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Download" }),
              /* @__PURE__ */ o.jsx("p", { className: "text-xl font-bold tabular-nums", children: Z(a, 1) }),
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
              /* @__PURE__ */ o.jsx("p", { className: "text-xl font-bold tabular-nums", children: Z(s, 1) }),
              /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Mbps" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "grid gap-1", children: [
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.speedtest_download", label: "Speedtest DL", value: Z(r, 1), unit: "Mbps", color: "#3b82f6" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.speedtest_upload", label: "Speedtest UL", value: Z(u, 1), unit: "Mbps", color: "#8b5cf6" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.speedtest_ping", label: "Ping", value: Z(f, 0), unit: "ms", color: "#f59e0b" }),
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
  return /* @__PURE__ */ o.jsxs(Ue, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsx(st, { className: "text-base", children: "Modes" }) }),
    /* @__PURE__ */ o.jsx(Le, { children: /* @__PURE__ */ o.jsxs("div", { className: "flex flex-wrap gap-2", children: [
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
  return /* @__PURE__ */ o.jsxs(Ue, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(st, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(ii, { className: "h-4 w-4" }),
      "Lights"
    ] }) }),
    /* @__PURE__ */ o.jsx(Le, { className: "space-y-3", children: a.map((s) => /* @__PURE__ */ o.jsx(T5, { entityId: s.id, name: s.name }, s.id)) })
  ] });
}
function T5({ entityId: a, name: s }) {
  var y;
  const r = he(a), u = yt(a), f = El(), d = (r == null ? void 0 : r.state) === "on", m = ((y = r == null ? void 0 : r.attributes) == null ? void 0 : y.brightness) ?? 0, p = Math.round(m / 255 * 100);
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
  return /* @__PURE__ */ o.jsxs(Ue, { children: [
    /* @__PURE__ */ o.jsx(at, { className: "pb-2", children: /* @__PURE__ */ o.jsx(st, { className: "text-base", children: "Switches" }) }),
    /* @__PURE__ */ o.jsx(Le, { children: /* @__PURE__ */ o.jsxs("div", { className: "flex flex-wrap gap-2", children: [
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
          icon: Ov,
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
          icon: Ps,
          activeColor: "cyan"
        }
      )
    ] }) })
  ] });
}
function A5() {
  const { value: a } = G("sensor.a32_pro_s5140_channel_37_temperature_air_fryer_compartment");
  return /* @__PURE__ */ o.jsx(Ue, { children: /* @__PURE__ */ o.jsx(Le, { className: "pt-4", children: /* @__PURE__ */ o.jsx(
    pe,
    {
      entityId: "sensor.a32_pro_s5140_channel_37_temperature_air_fryer_compartment",
      label: "Air Fryer Compartment",
      value: Z(a, 1),
      unit: "°C",
      icon: Ir,
      color: "#f97316"
    }
  ) }) });
}
function C5() {
  const a = he("input_boolean.windows_audio_stream"), s = yt("input_boolean.windows_audio_stream");
  return /* @__PURE__ */ o.jsx(Ue, { children: /* @__PURE__ */ o.jsx(Le, { className: "pt-4", children: /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
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
      /* @__PURE__ */ o.jsx(A5, {}),
      /* @__PURE__ */ o.jsx(C5, {})
    ] }),
    /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsx(N5, {}),
      /* @__PURE__ */ o.jsx(E5, {})
    ] }),
    /* @__PURE__ */ o.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ o.jsx(M5, {}) })
  ] }) });
}
const Jo = [
  { entityId: "camera.channel_1", label: "Left", channel: 1, stream: "channel_1", lightEntityId: "switch.a32_pro_switch21_left_outdoor_lights" },
  { entityId: "camera.channel_2", label: "Right", channel: 2, stream: "channel_2", lightEntityId: "switch.a32_pro_switch22_right_outdoor_lights" },
  { entityId: "camera.channel_3", label: "Front", channel: 3, stream: "channel_3", lightEntityId: "switch.a32_pro_switch31_lightbar" },
  { entityId: "camera.channel_4", label: "Back", channel: 4, stream: "channel_4", lightEntityId: "switch.a32_pro_switch23_rear_outdoor_lights" }
], uf = `http://${window.location.hostname}:8766`;
function k5({ stream: a }) {
  const s = O.useRef(null), [r, u] = O.useState("connecting"), [f, d] = O.useState(0), m = O.useRef(0);
  return O.useEffect(() => {
    if (!s.current) return;
    const p = s.current;
    let y = !1, g = !1, x, _ = null;
    const S = new AbortController();
    function j() {
      if (y || g) return;
      g = !0, S.abort();
      const ee = a.charCodeAt(a.length - 1) % 4 * 500, W = Math.min(2e3 * Math.pow(2, m.current), 3e4);
      m.current++, console.log(`[${a}] Reconnecting in ${((W + ee) / 1e3).toFixed(1)}s (attempt ${m.current})`), x = setTimeout(() => {
        y || (u("connecting"), d((J) => J + 1));
      }, W + ee);
    }
    async function T() {
      try {
        let ee = function() {
          if (!(se.updating || ge.readyState !== "open")) {
            if (Me.length > 0) {
              try {
                const q = Me.shift();
                se.appendBuffer(q.buffer);
              } catch {
                oe = !0, se.updating || W();
              }
              return;
            }
            oe && W();
          }
        }, W = function() {
          if (se.updating || ge.readyState !== "open" || se.buffered.length === 0) return;
          const q = se.buffered.start(0), F = se.buffered.end(se.buffered.length - 1);
          if (F - q > 60)
            try {
              se.remove(q, F - 20), oe = !1;
            } catch {
            }
          else
            oe = !1;
        };
        const J = await fetch(
          `${uf}/api/mse?src=${encodeURIComponent(a)}`,
          { signal: S.signal }
        );
        if (y) return;
        if (!J.ok || !J.body)
          throw new Error(`MSE stream error: ${J.status}`);
        let ce = (J.headers.get("Content-Type") || 'video/mp4; codecs="avc1.640028"').split(";").map((q) => q.trim()).join("; ");
        if (MediaSource.isTypeSupported(ce) || (ce = 'video/mp4; codecs="avc1.640028"'), !MediaSource.isTypeSupported(ce))
          throw new Error("No supported MSE codec");
        const ge = new MediaSource();
        if (_ = URL.createObjectURL(ge), p.src = _, await new Promise(
          (q) => ge.addEventListener("sourceopen", () => q(), { once: !0 })
        ), y) return;
        const se = ge.addSourceBuffer(ce), te = J.body.getReader(), Me = [];
        let oe = !1;
        se.addEventListener("updateend", ee);
        const we = setInterval(() => {
          y || (oe = !0, ee());
        }, 1e4);
        let C = !1;
        for (; !y && !g; ) {
          const { done: q, value: F } = await te.read();
          if (q || !F) break;
          if (se.updating || Me.length > 0)
            Me.push(F);
          else
            try {
              se.appendBuffer(F.buffer);
            } catch {
              Me.push(F);
            }
          C || (C = !0, p.play().catch(() => {
          }));
        }
        clearInterval(we), y || (u("connecting"), j());
      } catch (ee) {
        if (!y && !g) {
          if (ee instanceof DOMException && ee.name === "AbortError") return;
          console.error(`[${a}] MSE error:`, ee), u("connecting"), j();
        }
      }
    }
    const H = () => {
      y || (u("playing"), m.current = 0);
    }, L = () => {
      y || (console.error(`[${a}] Video element error:`, p.error), u("connecting"), j());
    };
    p.addEventListener("playing", H), p.addEventListener("error", L);
    let V = -1, I = 0, X = 0;
    const P = setInterval(() => {
      if (y || g) return;
      if (p.buffered.length > 0) {
        const W = p.buffered.end(p.buffered.length - 1);
        W - p.currentTime > 3 && (p.currentTime = W - 0.5);
      }
      const ee = p.currentTime;
      if (V >= 0 && ee === V && ee > 0) {
        if (I === 0 && (X = Date.now()), I++, I >= 3) {
          const W = ((Date.now() - X) / 1e3).toFixed(0);
          console.warn(`[${a}] Stall detected (stuck ${W}s at ${ee.toFixed(1)}s), reconnecting`), I = 0, u("connecting"), j();
        }
      } else
        I = 0;
      V = ee;
    }, 3e3);
    return T(), () => {
      y = !0, S.abort(), clearTimeout(x), clearInterval(P), p.removeEventListener("playing", H), p.removeEventListener("error", L), p.pause(), p.removeAttribute("src"), p.load(), _ && URL.revokeObjectURL(_);
    };
  }, [a, f]), /* @__PURE__ */ o.jsxs("div", { className: "relative w-full h-full bg-black", children: [
    /* @__PURE__ */ o.jsx(
      "video",
      {
        ref: s,
        autoPlay: !0,
        playsInline: !0,
        muted: !0,
        className: `w-full h-full object-contain transition-opacity duration-300 ${r === "playing" ? "opacity-100" : "opacity-0"}`
      }
    ),
    r === "connecting" && /* @__PURE__ */ o.jsx("div", { className: "absolute inset-0 flex items-center justify-center text-muted-foreground", children: /* @__PURE__ */ o.jsx(Po, { className: "h-6 w-6 animate-spin" }) }),
    r === "error" && /* @__PURE__ */ o.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2", children: [
      /* @__PURE__ */ o.jsx(Sp, { className: "h-6 w-6" }),
      /* @__PURE__ */ o.jsx("span", { className: "text-xs", children: "Reconnecting…" })
    ] })
  ] });
}
function O5({ entityId: a }) {
  const s = he(a), r = yt(a), u = (s == null ? void 0 : s.state) === "on";
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
function R5({
  stream: a,
  label: s,
  lightEntityId: r,
  hidden: u,
  expanded: f,
  quality: d,
  onExpand: m,
  onCollapse: p
}) {
  const y = d === "main" ? a : `${a}_sub`;
  return /* @__PURE__ */ o.jsxs(
    "div",
    {
      className: `relative rounded-lg overflow-hidden bg-black border border-border cursor-pointer group ${u ? "hidden" : ""}`,
      onClick: f ? p : m,
      children: [
        /* @__PURE__ */ o.jsxs("div", { className: "absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-1.5 bg-gradient-to-b from-black/70 to-transparent", children: [
          /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ o.jsx("span", { className: `text-white font-medium drop-shadow ${f ? "" : "text-sm"}`, children: s }),
            /* @__PURE__ */ o.jsx(O5, { entityId: r })
          ] }),
          f ? /* @__PURE__ */ o.jsxs(
            "button",
            {
              onClick: p,
              className: "flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm transition-colors",
              children: [
                /* @__PURE__ */ o.jsx(Gv, { className: "h-4 w-4" }),
                "Grid"
              ]
            }
          ) : /* @__PURE__ */ o.jsx(Qv, { className: "h-4 w-4 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity" })
        ] }),
        /* @__PURE__ */ o.jsx(k5, { stream: y })
      ]
    }
  );
}
async function zr(a, s) {
  const r = await fetch(`${uf}${a}`, s);
  if (!r.ok) throw new Error(`DVR proxy error: ${r.status}`);
  return r.json();
}
function D5({
  speed: a = 1,
  onError: s
}) {
  const r = O.useRef(null), [u, f] = O.useState("connecting");
  return O.useEffect(() => {
    r.current && (r.current.playbackRate = a);
  }, [a]), O.useEffect(() => {
    const d = r.current;
    if (!d) return;
    let m = !1, p = null, y = null;
    async function g() {
      if (d)
        try {
          const S = await fetch(`${uf}/api/playback/stream`);
          if (m) return;
          if (!S.ok || !S.body) {
            console.error("Playback stream:", S.status), f("error"), s == null || s();
            return;
          }
          let T = (S.headers.get("Content-Type") || 'video/mp4; codecs="hvc1"').split(";").map((P) => P.trim()).join("; ");
          if (MediaSource.isTypeSupported(T) || (T = 'video/mp4; codecs="hvc1"'), MediaSource.isTypeSupported(T) || (T = 'video/mp4; codecs="avc1.640028"'), !MediaSource.isTypeSupported(T)) {
            console.error("No supported MSE codec"), f("error"), s == null || s();
            return;
          }
          const H = new MediaSource();
          if (p = URL.createObjectURL(H), d.src = p, await new Promise(
            (P) => H.addEventListener("sourceopen", () => P(), { once: !0 })
          ), m) return;
          const L = H.addSourceBuffer(T);
          y = S.body.getReader();
          const V = [], I = () => {
            if (V.length > 0 && !L.updating && H.readyState === "open") {
              const P = V.shift();
              L.appendBuffer(P.buffer);
            }
          };
          L.addEventListener("updateend", I);
          let X = !1;
          for (; !m; ) {
            const { done: P, value: ee } = await y.read();
            if (P || !ee) break;
            L.updating || V.length > 0 ? V.push(ee) : L.appendBuffer(ee.buffer), X || (X = !0, d.playbackRate = a, d.play().catch(() => {
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
      /* @__PURE__ */ o.jsx(Sp, { className: "h-8 w-8" }),
      /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "Playback failed" })
    ] })
  ] });
}
function H5({
  segments: a,
  date: s,
  selectedTime: r,
  onSelectTime: u
}) {
  const f = O.useRef(null), d = 24, m = (/* @__PURE__ */ new Date(`${s}T00:00:00`)).getTime(), p = m + d * 36e5, y = (S) => (new Date(S.replace(" ", "T")).getTime() - m) / (p - m) * 100, g = (() => {
    if (!r) return 0;
    const S = new Date(r.replace(" ", "T")).getTime();
    return Math.max(0, Math.min(100, (S - m) / (p - m) * 100));
  })(), x = (S) => {
    if (!f.current) return;
    const j = f.current.getBoundingClientRect(), T = (S.clientX - j.left) / j.width, H = m + T * (p - m), L = new Date(H), V = (X) => String(X).padStart(2, "0"), I = `${s} ${V(L.getHours())}:${V(L.getMinutes())}:${V(L.getSeconds())}`;
    u(I);
  }, _ = O.useMemo(() => {
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
            const T = Math.max(0, y(S.start)), H = Math.min(100, y(S.end));
            return /* @__PURE__ */ o.jsx(
              "div",
              {
                className: "absolute top-0 bottom-0 bg-blue-500/50",
                style: { left: `${T}%`, width: `${H - T}%` }
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
function U5() {
  var J;
  const [a, s] = O.useState(1), [r, u] = O.useState(() => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)), [f, d] = O.useState([]), [m, p] = O.useState(""), [y, g] = O.useState(null), [x, _] = O.useState(!1), [S, j] = O.useState(1), [T, H] = O.useState(null);
  O.useEffect(() => {
    zr(`/api/date-range?channel=${a}`).then((K) => {
      K.min_date && K.max_date && H({
        min: K.min_date.slice(0, 10),
        max: K.max_date.slice(0, 10)
      });
    }).catch(() => {
    });
  }, [a]), O.useEffect(() => {
    d([]), g(null), zr(`/api/timeline?channel=${a}&date=${r}`).then((K) => {
      var ce;
      d(K.segments || []), (ce = K.segments) != null && ce.length && !m && p(K.segments[0].start);
    }).catch(() => {
    });
  }, [r, a]);
  const L = () => {
    const K = new Date(r);
    K.setDate(K.getDate() - 1);
    const ce = K.toISOString().slice(0, 10);
    (!T || ce >= T.min) && (u(ce), p(""));
  }, V = () => {
    const K = new Date(r);
    K.setDate(K.getDate() + 1);
    const ce = K.toISOString().slice(0, 10);
    (!T || ce <= T.max) && (u(ce), p(""));
  }, I = async (K, ce) => {
    const ge = K ?? m, se = S;
    if (!ge) return;
    _(!0), g(null);
    const te = new Date(ge.replace(" ", "T")).getTime();
    let Me = "";
    for (const oe of f) {
      const we = new Date(oe.start.replace(" ", "T")).getTime(), C = new Date(oe.end.replace(" ", "T")).getTime();
      if (te >= we && te < C) {
        Me = oe.end;
        break;
      }
    }
    if (!Me) {
      const oe = new Date(te + 18e5), we = (C) => String(C).padStart(2, "0");
      Me = `${r} ${we(oe.getHours())}:${we(oe.getMinutes())}:${we(oe.getSeconds())}`;
    }
    try {
      await zr("/api/playback/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: a, startTime: ge, endTime: Me, speed: se })
      }), g(Date.now());
    } catch (oe) {
      console.error("Playback start error:", oe);
    } finally {
      _(!1);
    }
  }, X = () => {
    g(null), zr("/api/playback/stop", { method: "POST" }).catch(() => {
    });
  }, P = (K) => {
    p(K), y && I(K);
  }, ee = (K) => {
    j(K);
  }, W = ((J = Jo.find((K) => K.channel === a)) == null ? void 0 : J.label) ?? `Ch ${a}`;
  return /* @__PURE__ */ o.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ o.jsx("div", { className: "flex gap-1", children: Jo.map((K) => /* @__PURE__ */ o.jsx(
        "button",
        {
          onClick: () => {
            s(K.channel), g(null);
          },
          className: `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${a === K.channel ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`,
          children: K.label
        },
        K.channel
      )) }),
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-1 ml-auto", children: [
        /* @__PURE__ */ o.jsx("button", { onClick: L, className: "p-1.5 rounded-md hover:bg-muted transition-colors", children: /* @__PURE__ */ o.jsx(Dv, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ o.jsx(
          "input",
          {
            type: "date",
            value: r,
            min: T == null ? void 0 : T.min,
            max: T == null ? void 0 : T.max,
            onChange: (K) => {
              u(K.target.value), p("");
            },
            className: "bg-muted border border-border rounded-md px-2 py-1 text-sm"
          }
        ),
        /* @__PURE__ */ o.jsx("button", { onClick: V, className: "p-1.5 rounded-md hover:bg-muted transition-colors", children: /* @__PURE__ */ o.jsx(Hv, { className: "h-4 w-4" }) })
      ] })
    ] }),
    f.length > 0 ? /* @__PURE__ */ o.jsx(
      H5,
      {
        segments: f,
        date: r,
        selectedTime: m,
        onSelectTime: P
      }
    ) : /* @__PURE__ */ o.jsxs("div", { className: "text-center text-muted-foreground text-sm py-4", children: [
      "No recordings found for ",
      r
    ] }),
    m && /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
      /* @__PURE__ */ o.jsxs("span", { className: "text-sm text-muted-foreground", children: [
        W,
        " · ",
        m.slice(11)
      ] }),
      y ? /* @__PURE__ */ o.jsx(
        "button",
        {
          onClick: X,
          className: "flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors",
          children: "Stop"
        }
      ) : /* @__PURE__ */ o.jsxs(
        "button",
        {
          onClick: () => I(),
          disabled: x,
          className: "flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50",
          children: [
            x ? /* @__PURE__ */ o.jsx(Po, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ o.jsx(Jv, { className: "h-4 w-4" }),
            "Play"
          ]
        }
      ),
      /* @__PURE__ */ o.jsx("div", { className: "flex items-center gap-0.5 ml-auto", children: [1, 2, 4, 8].map((K) => /* @__PURE__ */ o.jsxs(
        "button",
        {
          onClick: () => ee(K),
          className: `px-2 py-1 rounded text-xs font-medium transition-colors ${S === K ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:bg-muted"}`,
          children: [
            K,
            "x"
          ]
        },
        K
      )) })
    ] }),
    y && /* @__PURE__ */ o.jsx("div", { className: "aspect-video rounded-lg overflow-hidden border border-border", children: /* @__PURE__ */ o.jsx(
      D5,
      {
        speed: S,
        onError: X
      },
      y
    ) })
  ] });
}
function mg() {
  const [a, s] = O.useState(null), [r, u] = O.useState("live"), [f, d] = O.useState("main");
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
      ),
      /* @__PURE__ */ o.jsxs("div", { className: "ml-auto flex items-center gap-1 bg-muted rounded-md p-0.5", children: [
        /* @__PURE__ */ o.jsx(
          "button",
          {
            onClick: () => d("sub"),
            className: `px-2.5 py-1 rounded text-xs font-medium transition-colors ${f === "sub" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
            children: "SD"
          }
        ),
        /* @__PURE__ */ o.jsx(
          "button",
          {
            onClick: () => d("main"),
            className: `px-2.5 py-1 rounded text-xs font-medium transition-colors ${f === "main" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
            children: "HD"
          }
        )
      ] })
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
        children: Jo.map((m) => {
          const p = a === m.stream, y = a !== null && !p;
          return /* @__PURE__ */ o.jsx(
            R5,
            {
              stream: m.stream,
              label: m.label,
              lightEntityId: m.lightEntityId,
              hidden: y,
              expanded: p,
              quality: f,
              onExpand: () => s(m.stream),
              onCollapse: () => s(null)
            },
            m.stream
          );
        })
      }
    ) }),
    r === "playback" && /* @__PURE__ */ o.jsx(U5, {})
  ] });
}
const pg = {
  home: kp,
  power: e5,
  climate: i5,
  water: m5,
  van: w5,
  system: z5,
  cameras: mg
}, L5 = [
  { id: "home", label: "Home", icon: xp },
  { id: "power", label: "Power", icon: ri },
  { id: "climate", label: "Climate", icon: Ir },
  { id: "water", label: "Water", icon: Za },
  { id: "van", label: "Van", icon: ax },
  { id: "cameras", label: "Cameras", icon: Rv },
  { id: "system", label: "System", icon: Pv }
];
function tp() {
  const a = window.location.hash.slice(1);
  return a && a in pg ? a : "home";
}
function B5({ navigate: a }) {
  const s = ai(), r = O.useRef(!1);
  return O.useEffect(() => s.subscribeEntity("binary_sensor.vehicle_is_moving", () => {
    const u = s.getEntity("binary_sensor.vehicle_is_moving"), f = (u == null ? void 0 : u.state) === "on";
    f && !r.current && a("van"), r.current = f;
  }), [s, a]), null;
}
function q5() {
  const [a, s] = O.useState(!1);
  return O.useEffect(() => {
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
function Y5() {
  const a = q5(), [s, r] = O.useState(tp);
  O.useEffect(() => {
    const d = () => r(tp());
    return window.addEventListener("hashchange", d), () => window.removeEventListener("hashchange", d);
  }, []);
  const u = O.useCallback((d) => {
    window.location.hash = d, r(d);
  }, []), f = pg[s] ?? kp;
  return /* @__PURE__ */ o.jsxs(Gy, { children: [
    /* @__PURE__ */ o.jsx(B5, { navigate: u }),
    /* @__PURE__ */ o.jsx("div", { className: `van-dash-root ${a ? "dark" : ""}`, style: { position: "relative" }, children: /* @__PURE__ */ o.jsx(ux, { children: /* @__PURE__ */ o.jsxs("div", { className: "h-screen flex flex-col bg-background text-foreground", children: [
      /* @__PURE__ */ o.jsx("nav", { className: "flex-none border-b border-border bg-card/80 backdrop-blur-sm", children: /* @__PURE__ */ o.jsx("div", { className: "flex items-center gap-1 px-2 h-11 overflow-x-auto", children: L5.map(({ id: d, label: m, icon: p }) => /* @__PURE__ */ o.jsxs(
        "button",
        {
          onClick: () => u(d),
          className: ie(
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
const G5 = 1, $r = 2, Ro = 3, X5 = 4, V5 = 5;
function Q5(a) {
  return {
    type: "auth",
    access_token: a
  };
}
function Z5() {
  return {
    type: "supported_features",
    id: 1,
    // Always the first message after auth
    features: { coalesce_messages: 1 }
  };
}
function K5() {
  return {
    type: "get_states"
  };
}
function J5(a, s, r, u, f) {
  const d = {
    type: "call_service",
    domain: a,
    service: s,
    target: u,
    return_response: f
  };
  return r && (d.service_data = r), d;
}
function $5(a) {
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
function W5() {
  return {
    type: "ping"
  };
}
function F5(a, s) {
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
}, I5 = "auth_invalid", P5 = "auth_ok";
function e3(a) {
  if (!a.auth)
    throw X5;
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
        p(G5);
        return;
      }
      const j = d === -1 ? -1 : d - 1;
      setTimeout(() => f(j, m, p), 1e3);
    }, _ = async (j) => {
      try {
        s.expired && await (r || s.refreshAccessToken()), y.send(JSON.stringify(Q5(s.accessToken)));
      } catch (T) {
        g = T === $r, y.close();
      }
    }, S = async (j) => {
      const T = JSON.parse(j.data);
      switch (T.type) {
        case I5:
          g = !0, y.close();
          break;
        case P5:
          y.removeEventListener("open", _), y.removeEventListener("message", S), y.removeEventListener("close", x), y.removeEventListener("error", x), y.haVersion = T.ha_version, gg(y.haVersion, 2022, 9) && y.send(JSON.stringify(Z5())), m(y);
          break;
      }
    };
    y.addEventListener("open", _), y.addEventListener("message", S), y.addEventListener("close", x), y.addEventListener("error", x);
  }
  return new Promise((d, m) => f(a.setupRetry, d, m));
}
class t3 {
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
        "subscribe" in m || m.reject(F5(Ro, "Connection lost"));
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
                  g.reject && g.reject(Ro);
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
    return this.subscribeMessage(s, $5(r));
  }
  ping() {
    return this.sendMessagePromise(W5());
  }
  sendMessage(s, r) {
    if (!this.connected)
      throw Ro;
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
const n3 = (a) => a * 1e3 + Date.now();
async function l3(a, s, r) {
  const u = typeof location < "u" && location;
  if (u && u.protocol === "https:") {
    const p = document.createElement("a");
    if (p.href = a, p.protocol === "http:" && p.hostname !== "localhost")
      throw V5;
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
  return m.hassUrl = a, m.clientId = s, m.expires = n3(m.expires_in), m;
}
class a3 {
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
    const s = await l3(this.data.hassUrl, this.data.clientId, {
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
function p3(a, s) {
  return new a3({
    hassUrl: a,
    clientId: null,
    expires: Date.now() + 1e11,
    refresh_token: "",
    access_token: s,
    expires_in: 1e11
  });
}
const s3 = (a) => {
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
}, i3 = 5e3, lp = (a, s, r, u, f = { unsubGrace: !0 }) => {
  if (a[s])
    return a[s];
  let d = 0, m, p, y = s3();
  const g = () => {
    if (!r)
      throw new Error("Collection does not support refresh");
    return r(a).then((H) => y.setState(H, !0));
  }, x = () => g().catch((H) => {
    if (a.connected)
      throw H;
  }), _ = () => {
    if (p !== void 0) {
      clearTimeout(p), p = void 0;
      return;
    }
    u && (m = u(a, y)), r && (a.addEventListener("ready", x), x()), a.addEventListener("disconnected", T);
  }, S = () => {
    p = void 0, m && m.then((H) => {
      H();
    }), y.clearState(), a.removeEventListener("ready", g), a.removeEventListener("disconnected", T);
  }, j = () => {
    p = setTimeout(S, i3);
  }, T = () => {
    p && (clearTimeout(p), S());
  };
  return a[s] = {
    get state() {
      return y.state;
    },
    refresh: g,
    subscribe(H) {
      d++, d === 1 && _();
      const L = y.subscribe(H);
      return y.state !== void 0 && setTimeout(() => H(y.state), 0), () => {
        L(), d--, d || (f.unsubGrace ? j() : S());
      };
    }
  }, a[s];
}, r3 = (a) => a.sendMessagePromise(K5()), g3 = (a, s, r, u, f, d) => a.sendMessagePromise(J5(s, r, u, f, d));
function c3(a, s) {
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
const u3 = (a, s) => a.subscribeMessage((r) => c3(s, r), {
  type: "subscribe_entities"
});
function o3(a, s) {
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
async function f3(a) {
  const s = await r3(a), r = {};
  for (let u = 0; u < s.length; u++) {
    const f = s[u];
    r[f.entity_id] = f;
  }
  return r;
}
const d3 = (a, s) => a.subscribeEvents((r) => o3(s, r), "state_changed"), h3 = (a) => gg(a.haVersion, 2022, 4, 0) ? lp(a, "_ent", void 0, u3) : lp(a, "_ent", f3, d3), y3 = (a, s) => h3(a).subscribe(s);
async function v3(a) {
  const s = Object.assign({ setupRetry: 0, createSocket: e3 }, a), r = await s.createSocket(s);
  return new t3(r, s);
}
function x3(a) {
  const s = Yy.createRoot(a);
  return s.render(/* @__PURE__ */ o.jsx(Y5, {})), () => s.unmount();
}
export {
  g3 as callService,
  v3 as createConnection,
  p3 as createLongLivedTokenAuth,
  x3 as mount,
  y3 as subscribeEntities
};
