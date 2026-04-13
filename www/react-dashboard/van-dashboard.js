var S1 = Object.defineProperty;
var j1 = (a, s, r) => s in a ? S1(a, s, { enumerable: !0, configurable: !0, writable: !0, value: r }) : a[s] = r;
var wr = (a, s, r) => j1(a, typeof s != "symbol" ? s + "" : s, r);
var ho = { exports: {} }, Hs = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var l0;
function N1() {
  if (l0) return Hs;
  l0 = 1;
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
  return Hs.Fragment = s, Hs.jsx = r, Hs.jsxs = r, Hs;
}
var a0;
function M1() {
  return a0 || (a0 = 1, ho.exports = N1()), ho.exports;
}
var o = M1(), mo = { exports: {} }, Us = {}, po = { exports: {} }, go = {};
/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var s0;
function T1() {
  return s0 || (s0 = 1, (function(a) {
    function s(A, q) {
      var W = A.length;
      A.push(q);
      e: for (; 0 < W; ) {
        var he = W - 1 >>> 1, me = A[he];
        if (0 < f(me, q))
          A[he] = q, A[W] = me, W = he;
        else break e;
      }
    }
    function r(A) {
      return A.length === 0 ? null : A[0];
    }
    function u(A) {
      if (A.length === 0) return null;
      var q = A[0], W = A.pop();
      if (W !== q) {
        A[0] = W;
        e: for (var he = 0, me = A.length, _ = me >>> 1; he < _; ) {
          var O = 2 * (he + 1) - 1, V = A[O], I = O + 1, fe = A[I];
          if (0 > f(V, W))
            I < me && 0 > f(fe, V) ? (A[he] = fe, A[I] = W, he = I) : (A[he] = V, A[O] = W, he = O);
          else if (I < me && 0 > f(fe, W))
            A[he] = fe, A[I] = W, he = I;
          else break e;
        }
      }
      return q;
    }
    function f(A, q) {
      var W = A.sortIndex - q.sortIndex;
      return W !== 0 ? W : A.id - q.id;
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
    var y = [], g = [], x = 1, b = null, S = 3, N = !1, z = !1, R = !1, H = !1, G = typeof setTimeout == "function" ? setTimeout : null, $ = typeof clearTimeout == "function" ? clearTimeout : null, P = typeof setImmediate < "u" ? setImmediate : null;
    function X(A) {
      for (var q = r(g); q !== null; ) {
        if (q.callback === null) u(g);
        else if (q.startTime <= A)
          u(g), q.sortIndex = q.expirationTime, s(y, q);
        else break;
        q = r(g);
      }
    }
    function J(A) {
      if (R = !1, X(A), !z)
        if (r(y) !== null)
          z = !0, ne || (ne = !0, oe());
        else {
          var q = r(g);
          q !== null && ve(J, q.startTime - A);
        }
    }
    var ne = !1, Z = -1, ee = 5, ge = -1;
    function _e() {
      return H ? !0 : !(a.unstable_now() - ge < ee);
    }
    function ce() {
      if (H = !1, ne) {
        var A = a.unstable_now();
        ge = A;
        var q = !0;
        try {
          e: {
            z = !1, R && (R = !1, $(Z), Z = -1), N = !0;
            var W = S;
            try {
              t: {
                for (X(A), b = r(y); b !== null && !(b.expirationTime > A && _e()); ) {
                  var he = b.callback;
                  if (typeof he == "function") {
                    b.callback = null, S = b.priorityLevel;
                    var me = he(
                      b.expirationTime <= A
                    );
                    if (A = a.unstable_now(), typeof me == "function") {
                      b.callback = me, X(A), q = !0;
                      break t;
                    }
                    b === r(y) && u(y), X(A);
                  } else u(y);
                  b = r(y);
                }
                if (b !== null) q = !0;
                else {
                  var _ = r(g);
                  _ !== null && ve(
                    J,
                    _.startTime - A
                  ), q = !1;
                }
              }
              break e;
            } finally {
              b = null, S = W, N = !1;
            }
            q = void 0;
          }
        } finally {
          q ? oe() : ne = !1;
        }
      }
    }
    var oe;
    if (typeof P == "function")
      oe = function() {
        P(ce);
      };
    else if (typeof MessageChannel < "u") {
      var Me = new MessageChannel(), K = Me.port2;
      Me.port1.onmessage = ce, oe = function() {
        K.postMessage(null);
      };
    } else
      oe = function() {
        G(ce, 0);
      };
    function ve(A, q) {
      Z = G(function() {
        A(a.unstable_now());
      }, q);
    }
    a.unstable_IdlePriority = 5, a.unstable_ImmediatePriority = 1, a.unstable_LowPriority = 4, a.unstable_NormalPriority = 3, a.unstable_Profiling = null, a.unstable_UserBlockingPriority = 2, a.unstable_cancelCallback = function(A) {
      A.callback = null;
    }, a.unstable_forceFrameRate = function(A) {
      0 > A || 125 < A ? console.error(
        "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
      ) : ee = 0 < A ? Math.floor(1e3 / A) : 5;
    }, a.unstable_getCurrentPriorityLevel = function() {
      return S;
    }, a.unstable_next = function(A) {
      switch (S) {
        case 1:
        case 2:
        case 3:
          var q = 3;
          break;
        default:
          q = S;
      }
      var W = S;
      S = q;
      try {
        return A();
      } finally {
        S = W;
      }
    }, a.unstable_requestPaint = function() {
      H = !0;
    }, a.unstable_runWithPriority = function(A, q) {
      switch (A) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          A = 3;
      }
      var W = S;
      S = A;
      try {
        return q();
      } finally {
        S = W;
      }
    }, a.unstable_scheduleCallback = function(A, q, W) {
      var he = a.unstable_now();
      switch (typeof W == "object" && W !== null ? (W = W.delay, W = typeof W == "number" && 0 < W ? he + W : he) : W = he, A) {
        case 1:
          var me = -1;
          break;
        case 2:
          me = 250;
          break;
        case 5:
          me = 1073741823;
          break;
        case 4:
          me = 1e4;
          break;
        default:
          me = 5e3;
      }
      return me = W + me, A = {
        id: x++,
        callback: q,
        priorityLevel: A,
        startTime: W,
        expirationTime: me,
        sortIndex: -1
      }, W > he ? (A.sortIndex = W, s(g, A), r(y) === null && A === r(g) && (R ? ($(Z), Z = -1) : R = !0, ve(J, W - he))) : (A.sortIndex = me, s(y, A), z || N || (z = !0, ne || (ne = !0, oe()))), A;
    }, a.unstable_shouldYield = _e, a.unstable_wrapCallback = function(A) {
      var q = S;
      return function() {
        var W = S;
        S = q;
        try {
          return A.apply(this, arguments);
        } finally {
          S = W;
        }
      };
    };
  })(go)), go;
}
var i0;
function E1() {
  return i0 || (i0 = 1, po.exports = T1()), po.exports;
}
var yo = { exports: {} }, be = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var r0;
function A1() {
  if (r0) return be;
  r0 = 1;
  var a = Symbol.for("react.transitional.element"), s = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), u = Symbol.for("react.strict_mode"), f = Symbol.for("react.profiler"), d = Symbol.for("react.consumer"), m = Symbol.for("react.context"), p = Symbol.for("react.forward_ref"), y = Symbol.for("react.suspense"), g = Symbol.for("react.memo"), x = Symbol.for("react.lazy"), b = Symbol.for("react.activity"), S = Symbol.iterator;
  function N(_) {
    return _ === null || typeof _ != "object" ? null : (_ = S && _[S] || _["@@iterator"], typeof _ == "function" ? _ : null);
  }
  var z = {
    isMounted: function() {
      return !1;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, R = Object.assign, H = {};
  function G(_, O, V) {
    this.props = _, this.context = O, this.refs = H, this.updater = V || z;
  }
  G.prototype.isReactComponent = {}, G.prototype.setState = function(_, O) {
    if (typeof _ != "object" && typeof _ != "function" && _ != null)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, _, O, "setState");
  }, G.prototype.forceUpdate = function(_) {
    this.updater.enqueueForceUpdate(this, _, "forceUpdate");
  };
  function $() {
  }
  $.prototype = G.prototype;
  function P(_, O, V) {
    this.props = _, this.context = O, this.refs = H, this.updater = V || z;
  }
  var X = P.prototype = new $();
  X.constructor = P, R(X, G.prototype), X.isPureReactComponent = !0;
  var J = Array.isArray;
  function ne() {
  }
  var Z = { H: null, A: null, T: null, S: null }, ee = Object.prototype.hasOwnProperty;
  function ge(_, O, V) {
    var I = V.ref;
    return {
      $$typeof: a,
      type: _,
      key: O,
      ref: I !== void 0 ? I : null,
      props: V
    };
  }
  function _e(_, O) {
    return ge(_.type, O, _.props);
  }
  function ce(_) {
    return typeof _ == "object" && _ !== null && _.$$typeof === a;
  }
  function oe(_) {
    var O = { "=": "=0", ":": "=2" };
    return "$" + _.replace(/[=:]/g, function(V) {
      return O[V];
    });
  }
  var Me = /\/+/g;
  function K(_, O) {
    return typeof _ == "object" && _ !== null && _.key != null ? oe("" + _.key) : O.toString(36);
  }
  function ve(_) {
    switch (_.status) {
      case "fulfilled":
        return _.value;
      case "rejected":
        throw _.reason;
      default:
        switch (typeof _.status == "string" ? _.then(ne, ne) : (_.status = "pending", _.then(
          function(O) {
            _.status === "pending" && (_.status = "fulfilled", _.value = O);
          },
          function(O) {
            _.status === "pending" && (_.status = "rejected", _.reason = O);
          }
        )), _.status) {
          case "fulfilled":
            return _.value;
          case "rejected":
            throw _.reason;
        }
    }
    throw _;
  }
  function A(_, O, V, I, fe) {
    var ye = typeof _;
    (ye === "undefined" || ye === "boolean") && (_ = null);
    var F = !1;
    if (_ === null) F = !0;
    else
      switch (ye) {
        case "bigint":
        case "string":
        case "number":
          F = !0;
          break;
        case "object":
          switch (_.$$typeof) {
            case a:
            case s:
              F = !0;
              break;
            case x:
              return F = _._init, A(
                F(_._payload),
                O,
                V,
                I,
                fe
              );
          }
      }
    if (F)
      return fe = fe(_), F = I === "" ? "." + K(_, 0) : I, J(fe) ? (V = "", F != null && (V = F.replace(Me, "$&/") + "/"), A(fe, O, V, "", function(vt) {
        return vt;
      })) : fe != null && (ce(fe) && (fe = _e(
        fe,
        V + (fe.key == null || _ && _.key === fe.key ? "" : ("" + fe.key).replace(
          Me,
          "$&/"
        ) + "/") + F
      )), O.push(fe)), 1;
    F = 0;
    var Te = I === "" ? "." : I + ":";
    if (J(_))
      for (var xe = 0; xe < _.length; xe++)
        I = _[xe], ye = Te + K(I, xe), F += A(
          I,
          O,
          V,
          ye,
          fe
        );
    else if (xe = N(_), typeof xe == "function")
      for (_ = xe.call(_), xe = 0; !(I = _.next()).done; )
        I = I.value, ye = Te + K(I, xe++), F += A(
          I,
          O,
          V,
          ye,
          fe
        );
    else if (ye === "object") {
      if (typeof _.then == "function")
        return A(
          ve(_),
          O,
          V,
          I,
          fe
        );
      throw O = String(_), Error(
        "Objects are not valid as a React child (found: " + (O === "[object Object]" ? "object with keys {" + Object.keys(_).join(", ") + "}" : O) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return F;
  }
  function q(_, O, V) {
    if (_ == null) return _;
    var I = [], fe = 0;
    return A(_, I, "", "", function(ye) {
      return O.call(V, ye, fe++);
    }), I;
  }
  function W(_) {
    if (_._status === -1) {
      var O = _._result;
      O = O(), O.then(
        function(V) {
          (_._status === 0 || _._status === -1) && (_._status = 1, _._result = V);
        },
        function(V) {
          (_._status === 0 || _._status === -1) && (_._status = 2, _._result = V);
        }
      ), _._status === -1 && (_._status = 0, _._result = O);
    }
    if (_._status === 1) return _._result.default;
    throw _._result;
  }
  var he = typeof reportError == "function" ? reportError : function(_) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var O = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof _ == "object" && _ !== null && typeof _.message == "string" ? String(_.message) : String(_),
        error: _
      });
      if (!window.dispatchEvent(O)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", _);
      return;
    }
    console.error(_);
  }, me = {
    map: q,
    forEach: function(_, O, V) {
      q(
        _,
        function() {
          O.apply(this, arguments);
        },
        V
      );
    },
    count: function(_) {
      var O = 0;
      return q(_, function() {
        O++;
      }), O;
    },
    toArray: function(_) {
      return q(_, function(O) {
        return O;
      }) || [];
    },
    only: function(_) {
      if (!ce(_))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return _;
    }
  };
  return be.Activity = b, be.Children = me, be.Component = G, be.Fragment = r, be.Profiler = f, be.PureComponent = P, be.StrictMode = u, be.Suspense = y, be.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Z, be.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(_) {
      return Z.H.useMemoCache(_);
    }
  }, be.cache = function(_) {
    return function() {
      return _.apply(null, arguments);
    };
  }, be.cacheSignal = function() {
    return null;
  }, be.cloneElement = function(_, O, V) {
    if (_ == null)
      throw Error(
        "The argument must be a React element, but you passed " + _ + "."
      );
    var I = R({}, _.props), fe = _.key;
    if (O != null)
      for (ye in O.key !== void 0 && (fe = "" + O.key), O)
        !ee.call(O, ye) || ye === "key" || ye === "__self" || ye === "__source" || ye === "ref" && O.ref === void 0 || (I[ye] = O[ye]);
    var ye = arguments.length - 2;
    if (ye === 1) I.children = V;
    else if (1 < ye) {
      for (var F = Array(ye), Te = 0; Te < ye; Te++)
        F[Te] = arguments[Te + 2];
      I.children = F;
    }
    return ge(_.type, fe, I);
  }, be.createContext = function(_) {
    return _ = {
      $$typeof: m,
      _currentValue: _,
      _currentValue2: _,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    }, _.Provider = _, _.Consumer = {
      $$typeof: d,
      _context: _
    }, _;
  }, be.createElement = function(_, O, V) {
    var I, fe = {}, ye = null;
    if (O != null)
      for (I in O.key !== void 0 && (ye = "" + O.key), O)
        ee.call(O, I) && I !== "key" && I !== "__self" && I !== "__source" && (fe[I] = O[I]);
    var F = arguments.length - 2;
    if (F === 1) fe.children = V;
    else if (1 < F) {
      for (var Te = Array(F), xe = 0; xe < F; xe++)
        Te[xe] = arguments[xe + 2];
      fe.children = Te;
    }
    if (_ && _.defaultProps)
      for (I in F = _.defaultProps, F)
        fe[I] === void 0 && (fe[I] = F[I]);
    return ge(_, ye, fe);
  }, be.createRef = function() {
    return { current: null };
  }, be.forwardRef = function(_) {
    return { $$typeof: p, render: _ };
  }, be.isValidElement = ce, be.lazy = function(_) {
    return {
      $$typeof: x,
      _payload: { _status: -1, _result: _ },
      _init: W
    };
  }, be.memo = function(_, O) {
    return {
      $$typeof: g,
      type: _,
      compare: O === void 0 ? null : O
    };
  }, be.startTransition = function(_) {
    var O = Z.T, V = {};
    Z.T = V;
    try {
      var I = _(), fe = Z.S;
      fe !== null && fe(V, I), typeof I == "object" && I !== null && typeof I.then == "function" && I.then(ne, he);
    } catch (ye) {
      he(ye);
    } finally {
      O !== null && V.types !== null && (O.types = V.types), Z.T = O;
    }
  }, be.unstable_useCacheRefresh = function() {
    return Z.H.useCacheRefresh();
  }, be.use = function(_) {
    return Z.H.use(_);
  }, be.useActionState = function(_, O, V) {
    return Z.H.useActionState(_, O, V);
  }, be.useCallback = function(_, O) {
    return Z.H.useCallback(_, O);
  }, be.useContext = function(_) {
    return Z.H.useContext(_);
  }, be.useDebugValue = function() {
  }, be.useDeferredValue = function(_, O) {
    return Z.H.useDeferredValue(_, O);
  }, be.useEffect = function(_, O) {
    return Z.H.useEffect(_, O);
  }, be.useEffectEvent = function(_) {
    return Z.H.useEffectEvent(_);
  }, be.useId = function() {
    return Z.H.useId();
  }, be.useImperativeHandle = function(_, O, V) {
    return Z.H.useImperativeHandle(_, O, V);
  }, be.useInsertionEffect = function(_, O) {
    return Z.H.useInsertionEffect(_, O);
  }, be.useLayoutEffect = function(_, O) {
    return Z.H.useLayoutEffect(_, O);
  }, be.useMemo = function(_, O) {
    return Z.H.useMemo(_, O);
  }, be.useOptimistic = function(_, O) {
    return Z.H.useOptimistic(_, O);
  }, be.useReducer = function(_, O, V) {
    return Z.H.useReducer(_, O, V);
  }, be.useRef = function(_) {
    return Z.H.useRef(_);
  }, be.useState = function(_) {
    return Z.H.useState(_);
  }, be.useSyncExternalStore = function(_, O, V) {
    return Z.H.useSyncExternalStore(
      _,
      O,
      V
    );
  }, be.useTransition = function() {
    return Z.H.useTransition();
  }, be.version = "19.2.5", be;
}
var c0;
function Qo() {
  return c0 || (c0 = 1, yo.exports = A1()), yo.exports;
}
var vo = { exports: {} }, zt = {};
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var u0;
function C1() {
  if (u0) return zt;
  u0 = 1;
  var a = Qo();
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
    var b = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: f,
      key: b == null ? null : "" + b,
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
  return zt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = u, zt.createPortal = function(y, g) {
    var x = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!g || g.nodeType !== 1 && g.nodeType !== 9 && g.nodeType !== 11)
      throw Error(s(299));
    return d(y, g, null, x);
  }, zt.flushSync = function(y) {
    var g = m.T, x = u.p;
    try {
      if (m.T = null, u.p = 2, y) return y();
    } finally {
      m.T = g, u.p = x, u.d.f();
    }
  }, zt.preconnect = function(y, g) {
    typeof y == "string" && (g ? (g = g.crossOrigin, g = typeof g == "string" ? g === "use-credentials" ? g : "" : void 0) : g = null, u.d.C(y, g));
  }, zt.prefetchDNS = function(y) {
    typeof y == "string" && u.d.D(y);
  }, zt.preinit = function(y, g) {
    if (typeof y == "string" && g && typeof g.as == "string") {
      var x = g.as, b = p(x, g.crossOrigin), S = typeof g.integrity == "string" ? g.integrity : void 0, N = typeof g.fetchPriority == "string" ? g.fetchPriority : void 0;
      x === "style" ? u.d.S(
        y,
        typeof g.precedence == "string" ? g.precedence : void 0,
        {
          crossOrigin: b,
          integrity: S,
          fetchPriority: N
        }
      ) : x === "script" && u.d.X(y, {
        crossOrigin: b,
        integrity: S,
        fetchPriority: N,
        nonce: typeof g.nonce == "string" ? g.nonce : void 0
      });
    }
  }, zt.preinitModule = function(y, g) {
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
  }, zt.preload = function(y, g) {
    if (typeof y == "string" && typeof g == "object" && g !== null && typeof g.as == "string") {
      var x = g.as, b = p(x, g.crossOrigin);
      u.d.L(y, x, {
        crossOrigin: b,
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
  }, zt.preloadModule = function(y, g) {
    if (typeof y == "string")
      if (g) {
        var x = p(g.as, g.crossOrigin);
        u.d.m(y, {
          as: typeof g.as == "string" && g.as !== "script" ? g.as : void 0,
          crossOrigin: x,
          integrity: typeof g.integrity == "string" ? g.integrity : void 0
        });
      } else u.d.m(y);
  }, zt.requestFormReset = function(y) {
    u.d.r(y);
  }, zt.unstable_batchedUpdates = function(y, g) {
    return y(g);
  }, zt.useFormState = function(y, g, x) {
    return m.H.useFormState(y, g, x);
  }, zt.useFormStatus = function() {
    return m.H.useHostTransitionStatus();
  }, zt.version = "19.2.5", zt;
}
var o0;
function z1() {
  if (o0) return vo.exports;
  o0 = 1;
  function a() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(a);
      } catch (s) {
        console.error(s);
      }
  }
  return a(), vo.exports = C1(), vo.exports;
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
var f0;
function O1() {
  if (f0) return Us;
  f0 = 1;
  var a = E1(), s = Qo(), r = z1();
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
  var b = Object.assign, S = Symbol.for("react.element"), N = Symbol.for("react.transitional.element"), z = Symbol.for("react.portal"), R = Symbol.for("react.fragment"), H = Symbol.for("react.strict_mode"), G = Symbol.for("react.profiler"), $ = Symbol.for("react.consumer"), P = Symbol.for("react.context"), X = Symbol.for("react.forward_ref"), J = Symbol.for("react.suspense"), ne = Symbol.for("react.suspense_list"), Z = Symbol.for("react.memo"), ee = Symbol.for("react.lazy"), ge = Symbol.for("react.activity"), _e = Symbol.for("react.memo_cache_sentinel"), ce = Symbol.iterator;
  function oe(e) {
    return e === null || typeof e != "object" ? null : (e = ce && e[ce] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var Me = Symbol.for("react.client.reference");
  function K(e) {
    if (e == null) return null;
    if (typeof e == "function")
      return e.$$typeof === Me ? null : e.displayName || e.name || null;
    if (typeof e == "string") return e;
    switch (e) {
      case R:
        return "Fragment";
      case G:
        return "Profiler";
      case H:
        return "StrictMode";
      case J:
        return "Suspense";
      case ne:
        return "SuspenseList";
      case ge:
        return "Activity";
    }
    if (typeof e == "object")
      switch (e.$$typeof) {
        case z:
          return "Portal";
        case P:
          return e.displayName || "Context";
        case $:
          return (e._context.displayName || "Context") + ".Consumer";
        case X:
          var t = e.render;
          return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
        case Z:
          return t = e.displayName || null, t !== null ? t : K(e.type) || "Memo";
        case ee:
          t = e._payload, e = e._init;
          try {
            return K(e(t));
          } catch {
          }
      }
    return null;
  }
  var ve = Array.isArray, A = s.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, q = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, W = {
    pending: !1,
    data: null,
    method: null,
    action: null
  }, he = [], me = -1;
  function _(e) {
    return { current: e };
  }
  function O(e) {
    0 > me || (e.current = he[me], he[me] = null, me--);
  }
  function V(e, t) {
    me++, he[me] = e.current, e.current = t;
  }
  var I = _(null), fe = _(null), ye = _(null), F = _(null);
  function Te(e, t) {
    switch (V(ye, t), V(fe, e), V(I, null), t.nodeType) {
      case 9:
      case 11:
        e = (e = t.documentElement) && (e = e.namespaceURI) ? Mm(e) : 0;
        break;
      default:
        if (e = t.tagName, t = t.namespaceURI)
          t = Mm(t), e = Tm(t, e);
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
    O(I), V(I, e);
  }
  function xe() {
    O(I), O(fe), O(ye);
  }
  function vt(e) {
    e.memoizedState !== null && V(F, e);
    var t = I.current, n = Tm(t, e.type);
    t !== n && (V(fe, e), V(I, n));
  }
  function At(e) {
    fe.current === e && (O(I), O(fe)), F.current === e && (O(F), Os._currentValue = W);
  }
  var Je, De;
  function Ue(e) {
    if (Je === void 0)
      try {
        throw Error();
      } catch (n) {
        var t = n.stack.trim().match(/\n( *(at )?)/);
        Je = t && t[1] || "", De = -1 < n.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < n.stack.indexOf("@") ? "@unknown:0:0" : "";
      }
    return `
` + Je + e + De;
  }
  var rt = !1;
  function ot(e, t) {
    if (!e || rt) return "";
    rt = !0;
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
                  var C = k;
                }
                Reflect.construct(e, [], B);
              } else {
                try {
                  B.call();
                } catch (k) {
                  C = k;
                }
                e.call(B.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (k) {
                C = k;
              }
              (B = e()) && typeof B.catch == "function" && B.catch(function() {
              });
            }
          } catch (k) {
            if (k && C && typeof k.stack == "string")
              return [k.stack, C.stack];
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
`), E = v.split(`
`);
        for (i = l = 0; l < w.length && !w[l].includes("DetermineComponentFrameRoot"); )
          l++;
        for (; i < E.length && !E[i].includes(
          "DetermineComponentFrameRoot"
        ); )
          i++;
        if (l === w.length || i === E.length)
          for (l = w.length - 1, i = E.length - 1; 1 <= l && 0 <= i && w[l] !== E[i]; )
            i--;
        for (; 1 <= l && 0 <= i; l--, i--)
          if (w[l] !== E[i]) {
            if (l !== 1 || i !== 1)
              do
                if (l--, i--, 0 > i || w[l] !== E[i]) {
                  var U = `
` + w[l].replace(" at new ", " at ");
                  return e.displayName && U.includes("<anonymous>") && (U = U.replace("<anonymous>", e.displayName)), U;
                }
              while (1 <= l && 0 <= i);
            break;
          }
      }
    } finally {
      rt = !1, Error.prepareStackTrace = n;
    }
    return (n = e ? e.displayName || e.name : "") ? Ue(n) : "";
  }
  function nn(e, t) {
    switch (e.tag) {
      case 26:
      case 27:
      case 5:
        return Ue(e.type);
      case 16:
        return Ue("Lazy");
      case 13:
        return e.child !== t && t !== null ? Ue("Suspense Fallback") : Ue("Suspense");
      case 19:
        return Ue("SuspenseList");
      case 0:
      case 15:
        return ot(e.type, !1);
      case 11:
        return ot(e.type.render, !1);
      case 1:
        return ot(e.type, !0);
      case 31:
        return Ue("Activity");
      default:
        return "";
    }
  }
  function Vt(e) {
    try {
      var t = "", n = null;
      do
        t += nn(e, n), n = e, e = e.return;
      while (e);
      return t;
    } catch (l) {
      return `
Error generating stack: ` + l.message + `
` + l.stack;
    }
  }
  var Xt = Object.prototype.hasOwnProperty, wt = a.unstable_scheduleCallback, ie = a.unstable_cancelCallback, We = a.unstable_shouldYield, kt = a.unstable_requestPaint, Fe = a.unstable_now, ft = a.unstable_getCurrentPriorityLevel, Ie = a.unstable_ImmediatePriority, St = a.unstable_UserBlockingPriority, Qt = a.unstable_NormalPriority, On = a.unstable_LowPriority, Sn = a.unstable_IdlePriority, Ct = a.log, Zt = a.unstable_setDisableYieldValue, we = null, ke = null;
  function $e(e) {
    if (typeof Ct == "function" && Zt(e), ke && typeof ke.setStrictMode == "function")
      try {
        ke.setStrictMode(we, e);
      } catch {
      }
  }
  var xt = Math.clz32 ? Math.clz32 : ui, Ir = Math.log, Pr = Math.LN2;
  function ui(e) {
    return e >>>= 0, e === 0 ? 32 : 31 - (Ir(e) / Pr | 0) | 0;
  }
  var tl = 256, Qa = 262144, Al = 4194304;
  function jn(e) {
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
  function ln(e, t, n) {
    var l = e.pendingLanes;
    if (l === 0) return 0;
    var i = 0, c = e.suspendedLanes, h = e.pingedLanes;
    e = e.warmLanes;
    var v = l & 134217727;
    return v !== 0 ? (l = v & ~c, l !== 0 ? i = jn(l) : (h &= v, h !== 0 ? i = jn(h) : n || (n = v & ~e, n !== 0 && (i = jn(n))))) : (v = l & ~c, v !== 0 ? i = jn(v) : h !== 0 ? i = jn(h) : n || (n = l & ~e, n !== 0 && (i = jn(n)))), i === 0 ? 0 : t !== 0 && t !== i && (t & c) === 0 && (c = i & -i, n = t & -t, c >= n || c === 32 && (n & 4194048) !== 0) ? t : i;
  }
  function Kt(e, t) {
    return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
  }
  function og(e, t) {
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
  function rf() {
    var e = Al;
    return Al <<= 1, (Al & 62914560) === 0 && (Al = 4194304), e;
  }
  function ec(e) {
    for (var t = [], n = 0; 31 > n; n++) t.push(e);
    return t;
  }
  function Za(e, t) {
    e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
  }
  function fg(e, t, n, l, i, c) {
    var h = e.pendingLanes;
    e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
    var v = e.entanglements, w = e.expirationTimes, E = e.hiddenUpdates;
    for (n = h & ~n; 0 < n; ) {
      var U = 31 - xt(n), B = 1 << U;
      v[U] = 0, w[U] = -1;
      var C = E[U];
      if (C !== null)
        for (E[U] = null, U = 0; U < C.length; U++) {
          var k = C[U];
          k !== null && (k.lane &= -536870913);
        }
      n &= ~B;
    }
    l !== 0 && cf(e, l, 0), c !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= c & ~(h & ~t));
  }
  function cf(e, t, n) {
    e.pendingLanes |= t, e.suspendedLanes &= ~t;
    var l = 31 - xt(t);
    e.entangledLanes |= t, e.entanglements[l] = e.entanglements[l] | 1073741824 | n & 261930;
  }
  function uf(e, t) {
    var n = e.entangledLanes |= t;
    for (e = e.entanglements; n; ) {
      var l = 31 - xt(n), i = 1 << l;
      i & t | e[l] & t && (e[l] |= t), n &= ~i;
    }
  }
  function of(e, t) {
    var n = t & -t;
    return n = (n & 42) !== 0 ? 1 : tc(n), (n & (e.suspendedLanes | t)) !== 0 ? 0 : n;
  }
  function tc(e) {
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
  function nc(e) {
    return e &= -e, 2 < e ? 8 < e ? (e & 134217727) !== 0 ? 32 : 268435456 : 8 : 2;
  }
  function ff() {
    var e = q.p;
    return e !== 0 ? e : (e = window.event, e === void 0 ? 32 : Wm(e.type));
  }
  function df(e, t) {
    var n = q.p;
    try {
      return q.p = e, t();
    } finally {
      q.p = n;
    }
  }
  var nl = Math.random().toString(36).slice(2), jt = "__reactFiber$" + nl, Rt = "__reactProps$" + nl, Pl = "__reactContainer$" + nl, lc = "__reactEvents$" + nl, dg = "__reactListeners$" + nl, hg = "__reactHandles$" + nl, hf = "__reactResources$" + nl, Ka = "__reactMarker$" + nl;
  function ac(e) {
    delete e[jt], delete e[Rt], delete e[lc], delete e[dg], delete e[hg];
  }
  function ea(e) {
    var t = e[jt];
    if (t) return t;
    for (var n = e.parentNode; n; ) {
      if (t = n[Pl] || n[jt]) {
        if (n = t.alternate, t.child !== null || n !== null && n.child !== null)
          for (e = Dm(e); e !== null; ) {
            if (n = e[jt]) return n;
            e = Dm(e);
          }
        return t;
      }
      e = n, n = e.parentNode;
    }
    return null;
  }
  function ta(e) {
    if (e = e[jt] || e[Pl]) {
      var t = e.tag;
      if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3)
        return e;
    }
    return null;
  }
  function Ja(e) {
    var t = e.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
    throw Error(u(33));
  }
  function na(e) {
    var t = e[hf];
    return t || (t = e[hf] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() }), t;
  }
  function _t(e) {
    e[Ka] = !0;
  }
  var mf = /* @__PURE__ */ new Set(), pf = {};
  function Cl(e, t) {
    la(e, t), la(e + "Capture", t);
  }
  function la(e, t) {
    for (pf[e] = t, e = 0; e < t.length; e++)
      mf.add(t[e]);
  }
  var mg = RegExp(
    "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
  ), gf = {}, yf = {};
  function pg(e) {
    return Xt.call(yf, e) ? !0 : Xt.call(gf, e) ? !1 : mg.test(e) ? yf[e] = !0 : (gf[e] = !0, !1);
  }
  function oi(e, t, n) {
    if (pg(t))
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
  function fi(e, t, n) {
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
  function an(e) {
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
  function vf(e) {
    var t = e.type;
    return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
  }
  function gg(e, t, n) {
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
  function sc(e) {
    if (!e._valueTracker) {
      var t = vf(e) ? "checked" : "value";
      e._valueTracker = gg(
        e,
        t,
        "" + e[t]
      );
    }
  }
  function xf(e) {
    if (!e) return !1;
    var t = e._valueTracker;
    if (!t) return !0;
    var n = t.getValue(), l = "";
    return e && (l = vf(e) ? e.checked ? "true" : "false" : e.value), e = l, e !== n ? (t.setValue(e), !0) : !1;
  }
  function di(e) {
    if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
    try {
      return e.activeElement || e.body;
    } catch {
      return e.body;
    }
  }
  var yg = /[\n"\\]/g;
  function sn(e) {
    return e.replace(
      yg,
      function(t) {
        return "\\" + t.charCodeAt(0).toString(16) + " ";
      }
    );
  }
  function ic(e, t, n, l, i, c, h, v) {
    e.name = "", h != null && typeof h != "function" && typeof h != "symbol" && typeof h != "boolean" ? e.type = h : e.removeAttribute("type"), t != null ? h === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + an(t)) : e.value !== "" + an(t) && (e.value = "" + an(t)) : h !== "submit" && h !== "reset" || e.removeAttribute("value"), t != null ? rc(e, h, an(t)) : n != null ? rc(e, h, an(n)) : l != null && e.removeAttribute("value"), i == null && c != null && (e.defaultChecked = !!c), i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"), v != null && typeof v != "function" && typeof v != "symbol" && typeof v != "boolean" ? e.name = "" + an(v) : e.removeAttribute("name");
  }
  function _f(e, t, n, l, i, c, h, v) {
    if (c != null && typeof c != "function" && typeof c != "symbol" && typeof c != "boolean" && (e.type = c), t != null || n != null) {
      if (!(c !== "submit" && c !== "reset" || t != null)) {
        sc(e);
        return;
      }
      n = n != null ? "" + an(n) : "", t = t != null ? "" + an(t) : n, v || t === e.value || (e.value = t), e.defaultValue = t;
    }
    l = l ?? i, l = typeof l != "function" && typeof l != "symbol" && !!l, e.checked = v ? e.checked : !!l, e.defaultChecked = !!l, h != null && typeof h != "function" && typeof h != "symbol" && typeof h != "boolean" && (e.name = h), sc(e);
  }
  function rc(e, t, n) {
    t === "number" && di(e.ownerDocument) === e || e.defaultValue === "" + n || (e.defaultValue = "" + n);
  }
  function aa(e, t, n, l) {
    if (e = e.options, t) {
      t = {};
      for (var i = 0; i < n.length; i++)
        t["$" + n[i]] = !0;
      for (n = 0; n < e.length; n++)
        i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && l && (e[n].defaultSelected = !0);
    } else {
      for (n = "" + an(n), t = null, i = 0; i < e.length; i++) {
        if (e[i].value === n) {
          e[i].selected = !0, l && (e[i].defaultSelected = !0);
          return;
        }
        t !== null || e[i].disabled || (t = e[i]);
      }
      t !== null && (t.selected = !0);
    }
  }
  function bf(e, t, n) {
    if (t != null && (t = "" + an(t), t !== e.value && (e.value = t), n == null)) {
      e.defaultValue !== t && (e.defaultValue = t);
      return;
    }
    e.defaultValue = n != null ? "" + an(n) : "";
  }
  function wf(e, t, n, l) {
    if (t == null) {
      if (l != null) {
        if (n != null) throw Error(u(92));
        if (ve(l)) {
          if (1 < l.length) throw Error(u(93));
          l = l[0];
        }
        n = l;
      }
      n == null && (n = ""), t = n;
    }
    n = an(t), e.defaultValue = n, l = e.textContent, l === n && l !== "" && l !== null && (e.value = l), sc(e);
  }
  function sa(e, t) {
    if (t) {
      var n = e.firstChild;
      if (n && n === e.lastChild && n.nodeType === 3) {
        n.nodeValue = t;
        return;
      }
    }
    e.textContent = t;
  }
  var vg = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " "
    )
  );
  function Sf(e, t, n) {
    var l = t.indexOf("--") === 0;
    n == null || typeof n == "boolean" || n === "" ? l ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : l ? e.setProperty(t, n) : typeof n != "number" || n === 0 || vg.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
  }
  function jf(e, t, n) {
    if (t != null && typeof t != "object")
      throw Error(u(62));
    if (e = e.style, n != null) {
      for (var l in n)
        !n.hasOwnProperty(l) || t != null && t.hasOwnProperty(l) || (l.indexOf("--") === 0 ? e.setProperty(l, "") : l === "float" ? e.cssFloat = "" : e[l] = "");
      for (var i in t)
        l = t[i], t.hasOwnProperty(i) && n[i] !== l && Sf(e, i, l);
    } else
      for (var c in t)
        t.hasOwnProperty(c) && Sf(e, c, t[c]);
  }
  function cc(e) {
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
  var xg = /* @__PURE__ */ new Map([
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
  ]), _g = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function hi(e) {
    return _g.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
  }
  function Dn() {
  }
  var uc = null;
  function oc(e) {
    return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
  }
  var ia = null, ra = null;
  function Nf(e) {
    var t = ta(e);
    if (t && (e = t.stateNode)) {
      var n = e[Rt] || null;
      e: switch (e = t.stateNode, t.type) {
        case "input":
          if (ic(
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
              'input[name="' + sn(
                "" + t
              ) + '"][type="radio"]'
            ), t = 0; t < n.length; t++) {
              var l = n[t];
              if (l !== e && l.form === e.form) {
                var i = l[Rt] || null;
                if (!i) throw Error(u(90));
                ic(
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
              l = n[t], l.form === e.form && xf(l);
          }
          break e;
        case "textarea":
          bf(e, n.value, n.defaultValue);
          break e;
        case "select":
          t = n.value, t != null && aa(e, !!n.multiple, t, !1);
      }
    }
  }
  var fc = !1;
  function Mf(e, t, n) {
    if (fc) return e(t, n);
    fc = !0;
    try {
      var l = e(t);
      return l;
    } finally {
      if (fc = !1, (ia !== null || ra !== null) && (er(), ia && (t = ia, e = ra, ra = ia = null, Nf(t), e)))
        for (t = 0; t < e.length; t++) Nf(e[t]);
    }
  }
  function $a(e, t) {
    var n = e.stateNode;
    if (n === null) return null;
    var l = n[Rt] || null;
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
  var Rn = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), dc = !1;
  if (Rn)
    try {
      var Wa = {};
      Object.defineProperty(Wa, "passive", {
        get: function() {
          dc = !0;
        }
      }), window.addEventListener("test", Wa, Wa), window.removeEventListener("test", Wa, Wa);
    } catch {
      dc = !1;
    }
  var ll = null, hc = null, mi = null;
  function Tf() {
    if (mi) return mi;
    var e, t = hc, n = t.length, l, i = "value" in ll ? ll.value : ll.textContent, c = i.length;
    for (e = 0; e < n && t[e] === i[e]; e++) ;
    var h = n - e;
    for (l = 1; l <= h && t[n - l] === i[c - l]; l++) ;
    return mi = i.slice(e, 1 < l ? 1 - l : void 0);
  }
  function pi(e) {
    var t = e.keyCode;
    return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
  }
  function gi() {
    return !0;
  }
  function Ef() {
    return !1;
  }
  function Ht(e) {
    function t(n, l, i, c, h) {
      this._reactName = n, this._targetInst = i, this.type = l, this.nativeEvent = c, this.target = h, this.currentTarget = null;
      for (var v in e)
        e.hasOwnProperty(v) && (n = e[v], this[v] = n ? n(c) : c[v]);
      return this.isDefaultPrevented = (c.defaultPrevented != null ? c.defaultPrevented : c.returnValue === !1) ? gi : Ef, this.isPropagationStopped = Ef, this;
    }
    return b(t.prototype, {
      preventDefault: function() {
        this.defaultPrevented = !0;
        var n = this.nativeEvent;
        n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = gi);
      },
      stopPropagation: function() {
        var n = this.nativeEvent;
        n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = gi);
      },
      persist: function() {
      },
      isPersistent: gi
    }), t;
  }
  var zl = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function(e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  }, yi = Ht(zl), Fa = b({}, zl, { view: 0, detail: 0 }), bg = Ht(Fa), mc, pc, Ia, vi = b({}, Fa, {
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
      return "movementX" in e ? e.movementX : (e !== Ia && (Ia && e.type === "mousemove" ? (mc = e.screenX - Ia.screenX, pc = e.screenY - Ia.screenY) : pc = mc = 0, Ia = e), mc);
    },
    movementY: function(e) {
      return "movementY" in e ? e.movementY : pc;
    }
  }), Af = Ht(vi), wg = b({}, vi, { dataTransfer: 0 }), Sg = Ht(wg), jg = b({}, Fa, { relatedTarget: 0 }), gc = Ht(jg), Ng = b({}, zl, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), Mg = Ht(Ng), Tg = b({}, zl, {
    clipboardData: function(e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    }
  }), Eg = Ht(Tg), Ag = b({}, zl, { data: 0 }), Cf = Ht(Ag), Cg = {
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
  }, zg = {
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
  }, Og = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
  };
  function kg(e) {
    var t = this.nativeEvent;
    return t.getModifierState ? t.getModifierState(e) : (e = Og[e]) ? !!t[e] : !1;
  }
  function yc() {
    return kg;
  }
  var Dg = b({}, Fa, {
    key: function(e) {
      if (e.key) {
        var t = Cg[e.key] || e.key;
        if (t !== "Unidentified") return t;
      }
      return e.type === "keypress" ? (e = pi(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? zg[e.keyCode] || "Unidentified" : "";
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
      return e.type === "keypress" ? pi(e) : 0;
    },
    keyCode: function(e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    },
    which: function(e) {
      return e.type === "keypress" ? pi(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    }
  }), Rg = Ht(Dg), Hg = b({}, vi, {
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
  }), zf = Ht(Hg), Ug = b({}, Fa, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: yc
  }), Lg = Ht(Ug), Bg = b({}, zl, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), qg = Ht(Bg), Yg = b({}, vi, {
    deltaX: function(e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function(e) {
      return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), Gg = Ht(Yg), Vg = b({}, zl, {
    newState: 0,
    oldState: 0
  }), Xg = Ht(Vg), Qg = [9, 13, 27, 32], vc = Rn && "CompositionEvent" in window, Pa = null;
  Rn && "documentMode" in document && (Pa = document.documentMode);
  var Zg = Rn && "TextEvent" in window && !Pa, Of = Rn && (!vc || Pa && 8 < Pa && 11 >= Pa), kf = " ", Df = !1;
  function Rf(e, t) {
    switch (e) {
      case "keyup":
        return Qg.indexOf(t.keyCode) !== -1;
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
  function Hf(e) {
    return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
  }
  var ca = !1;
  function Kg(e, t) {
    switch (e) {
      case "compositionend":
        return Hf(t);
      case "keypress":
        return t.which !== 32 ? null : (Df = !0, kf);
      case "textInput":
        return e = t.data, e === kf && Df ? null : e;
      default:
        return null;
    }
  }
  function Jg(e, t) {
    if (ca)
      return e === "compositionend" || !vc && Rf(e, t) ? (e = Tf(), mi = hc = ll = null, ca = !1, e) : null;
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
        return Of && t.locale !== "ko" ? null : t.data;
      default:
        return null;
    }
  }
  var $g = {
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
  function Uf(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t === "input" ? !!$g[e.type] : t === "textarea";
  }
  function Lf(e, t, n, l) {
    ia ? ra ? ra.push(l) : ra = [l] : ia = l, t = rr(t, "onChange"), 0 < t.length && (n = new yi(
      "onChange",
      "change",
      null,
      n,
      l
    ), e.push({ event: n, listeners: t }));
  }
  var es = null, ts = null;
  function Wg(e) {
    _m(e, 0);
  }
  function xi(e) {
    var t = Ja(e);
    if (xf(t)) return e;
  }
  function Bf(e, t) {
    if (e === "change") return t;
  }
  var qf = !1;
  if (Rn) {
    var xc;
    if (Rn) {
      var _c = "oninput" in document;
      if (!_c) {
        var Yf = document.createElement("div");
        Yf.setAttribute("oninput", "return;"), _c = typeof Yf.oninput == "function";
      }
      xc = _c;
    } else xc = !1;
    qf = xc && (!document.documentMode || 9 < document.documentMode);
  }
  function Gf() {
    es && (es.detachEvent("onpropertychange", Vf), ts = es = null);
  }
  function Vf(e) {
    if (e.propertyName === "value" && xi(ts)) {
      var t = [];
      Lf(
        t,
        ts,
        e,
        oc(e)
      ), Mf(Wg, t);
    }
  }
  function Fg(e, t, n) {
    e === "focusin" ? (Gf(), es = t, ts = n, es.attachEvent("onpropertychange", Vf)) : e === "focusout" && Gf();
  }
  function Ig(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown")
      return xi(ts);
  }
  function Pg(e, t) {
    if (e === "click") return xi(t);
  }
  function ey(e, t) {
    if (e === "input" || e === "change")
      return xi(t);
  }
  function ty(e, t) {
    return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
  }
  var Jt = typeof Object.is == "function" ? Object.is : ty;
  function ns(e, t) {
    if (Jt(e, t)) return !0;
    if (typeof e != "object" || e === null || typeof t != "object" || t === null)
      return !1;
    var n = Object.keys(e), l = Object.keys(t);
    if (n.length !== l.length) return !1;
    for (l = 0; l < n.length; l++) {
      var i = n[l];
      if (!Xt.call(t, i) || !Jt(e[i], t[i]))
        return !1;
    }
    return !0;
  }
  function Xf(e) {
    for (; e && e.firstChild; ) e = e.firstChild;
    return e;
  }
  function Qf(e, t) {
    var n = Xf(e);
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
      n = Xf(n);
    }
  }
  function Zf(e, t) {
    return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Zf(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
  }
  function Kf(e) {
    e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
    for (var t = di(e.document); t instanceof e.HTMLIFrameElement; ) {
      try {
        var n = typeof t.contentWindow.location.href == "string";
      } catch {
        n = !1;
      }
      if (n) e = t.contentWindow;
      else break;
      t = di(e.document);
    }
    return t;
  }
  function bc(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
  }
  var ny = Rn && "documentMode" in document && 11 >= document.documentMode, ua = null, wc = null, ls = null, Sc = !1;
  function Jf(e, t, n) {
    var l = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
    Sc || ua == null || ua !== di(l) || (l = ua, "selectionStart" in l && bc(l) ? l = { start: l.selectionStart, end: l.selectionEnd } : (l = (l.ownerDocument && l.ownerDocument.defaultView || window).getSelection(), l = {
      anchorNode: l.anchorNode,
      anchorOffset: l.anchorOffset,
      focusNode: l.focusNode,
      focusOffset: l.focusOffset
    }), ls && ns(ls, l) || (ls = l, l = rr(wc, "onSelect"), 0 < l.length && (t = new yi(
      "onSelect",
      "select",
      null,
      t,
      n
    ), e.push({ event: t, listeners: l }), t.target = ua)));
  }
  function Ol(e, t) {
    var n = {};
    return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
  }
  var oa = {
    animationend: Ol("Animation", "AnimationEnd"),
    animationiteration: Ol("Animation", "AnimationIteration"),
    animationstart: Ol("Animation", "AnimationStart"),
    transitionrun: Ol("Transition", "TransitionRun"),
    transitionstart: Ol("Transition", "TransitionStart"),
    transitioncancel: Ol("Transition", "TransitionCancel"),
    transitionend: Ol("Transition", "TransitionEnd")
  }, jc = {}, $f = {};
  Rn && ($f = document.createElement("div").style, "AnimationEvent" in window || (delete oa.animationend.animation, delete oa.animationiteration.animation, delete oa.animationstart.animation), "TransitionEvent" in window || delete oa.transitionend.transition);
  function kl(e) {
    if (jc[e]) return jc[e];
    if (!oa[e]) return e;
    var t = oa[e], n;
    for (n in t)
      if (t.hasOwnProperty(n) && n in $f)
        return jc[e] = t[n];
    return e;
  }
  var Wf = kl("animationend"), Ff = kl("animationiteration"), If = kl("animationstart"), ly = kl("transitionrun"), ay = kl("transitionstart"), sy = kl("transitioncancel"), Pf = kl("transitionend"), ed = /* @__PURE__ */ new Map(), Nc = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
    " "
  );
  Nc.push("scrollEnd");
  function pn(e, t) {
    ed.set(e, t), Cl(t, [e]);
  }
  var _i = typeof reportError == "function" ? reportError : function(e) {
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
  }, rn = [], fa = 0, Mc = 0;
  function bi() {
    for (var e = fa, t = Mc = fa = 0; t < e; ) {
      var n = rn[t];
      rn[t++] = null;
      var l = rn[t];
      rn[t++] = null;
      var i = rn[t];
      rn[t++] = null;
      var c = rn[t];
      if (rn[t++] = null, l !== null && i !== null) {
        var h = l.pending;
        h === null ? i.next = i : (i.next = h.next, h.next = i), l.pending = i;
      }
      c !== 0 && td(n, i, c);
    }
  }
  function wi(e, t, n, l) {
    rn[fa++] = e, rn[fa++] = t, rn[fa++] = n, rn[fa++] = l, Mc |= l, e.lanes |= l, e = e.alternate, e !== null && (e.lanes |= l);
  }
  function Tc(e, t, n, l) {
    return wi(e, t, n, l), Si(e);
  }
  function Dl(e, t) {
    return wi(e, null, null, t), Si(e);
  }
  function td(e, t, n) {
    e.lanes |= n;
    var l = e.alternate;
    l !== null && (l.lanes |= n);
    for (var i = !1, c = e.return; c !== null; )
      c.childLanes |= n, l = c.alternate, l !== null && (l.childLanes |= n), c.tag === 22 && (e = c.stateNode, e === null || e._visibility & 1 || (i = !0)), e = c, c = c.return;
    return e.tag === 3 ? (c = e.stateNode, i && t !== null && (i = 31 - xt(n), e = c.hiddenUpdates, l = e[i], l === null ? e[i] = [t] : l.push(t), t.lane = n | 536870912), c) : null;
  }
  function Si(e) {
    if (50 < Ns)
      throw Ns = 0, Hu = null, Error(u(185));
    for (var t = e.return; t !== null; )
      e = t, t = e.return;
    return e.tag === 3 ? e.stateNode : null;
  }
  var da = {};
  function iy(e, t, n, l) {
    this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = l, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function $t(e, t, n, l) {
    return new iy(e, t, n, l);
  }
  function Ec(e) {
    return e = e.prototype, !(!e || !e.isReactComponent);
  }
  function Hn(e, t) {
    var n = e.alternate;
    return n === null ? (n = $t(
      e.tag,
      t,
      e.key,
      e.mode
    ), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 65011712, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
  }
  function nd(e, t) {
    e.flags &= 65011714;
    var n = e.alternate;
    return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
      lanes: t.lanes,
      firstContext: t.firstContext
    }), e;
  }
  function ji(e, t, n, l, i, c) {
    var h = 0;
    if (l = e, typeof e == "function") Ec(e) && (h = 1);
    else if (typeof e == "string")
      h = f1(
        e,
        n,
        I.current
      ) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
    else
      e: switch (e) {
        case ge:
          return e = $t(31, n, t, i), e.elementType = ge, e.lanes = c, e;
        case R:
          return Rl(n.children, i, c, t);
        case H:
          h = 8, i |= 24;
          break;
        case G:
          return e = $t(12, n, t, i | 2), e.elementType = G, e.lanes = c, e;
        case J:
          return e = $t(13, n, t, i), e.elementType = J, e.lanes = c, e;
        case ne:
          return e = $t(19, n, t, i), e.elementType = ne, e.lanes = c, e;
        default:
          if (typeof e == "object" && e !== null)
            switch (e.$$typeof) {
              case P:
                h = 10;
                break e;
              case $:
                h = 9;
                break e;
              case X:
                h = 11;
                break e;
              case Z:
                h = 14;
                break e;
              case ee:
                h = 16, l = null;
                break e;
            }
          h = 29, n = Error(
            u(130, e === null ? "null" : typeof e, "")
          ), l = null;
      }
    return t = $t(h, n, t, i), t.elementType = e, t.type = l, t.lanes = c, t;
  }
  function Rl(e, t, n, l) {
    return e = $t(7, e, l, t), e.lanes = n, e;
  }
  function Ac(e, t, n) {
    return e = $t(6, e, null, t), e.lanes = n, e;
  }
  function ld(e) {
    var t = $t(18, null, null, 0);
    return t.stateNode = e, t;
  }
  function Cc(e, t, n) {
    return t = $t(
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
  var ad = /* @__PURE__ */ new WeakMap();
  function cn(e, t) {
    if (typeof e == "object" && e !== null) {
      var n = ad.get(e);
      return n !== void 0 ? n : (t = {
        value: e,
        source: t,
        stack: Vt(t)
      }, ad.set(e, t), t);
    }
    return {
      value: e,
      source: t,
      stack: Vt(t)
    };
  }
  var ha = [], ma = 0, Ni = null, as = 0, un = [], on = 0, al = null, Nn = 1, Mn = "";
  function Un(e, t) {
    ha[ma++] = as, ha[ma++] = Ni, Ni = e, as = t;
  }
  function sd(e, t, n) {
    un[on++] = Nn, un[on++] = Mn, un[on++] = al, al = e;
    var l = Nn;
    e = Mn;
    var i = 32 - xt(l) - 1;
    l &= ~(1 << i), n += 1;
    var c = 32 - xt(t) + i;
    if (30 < c) {
      var h = i - i % 5;
      c = (l & (1 << h) - 1).toString(32), l >>= h, i -= h, Nn = 1 << 32 - xt(t) + i | n << i | l, Mn = c + e;
    } else
      Nn = 1 << c | n << i | l, Mn = e;
  }
  function zc(e) {
    e.return !== null && (Un(e, 1), sd(e, 1, 0));
  }
  function Oc(e) {
    for (; e === Ni; )
      Ni = ha[--ma], ha[ma] = null, as = ha[--ma], ha[ma] = null;
    for (; e === al; )
      al = un[--on], un[on] = null, Mn = un[--on], un[on] = null, Nn = un[--on], un[on] = null;
  }
  function id(e, t) {
    un[on++] = Nn, un[on++] = Mn, un[on++] = al, Nn = t.id, Mn = t.overflow, al = e;
  }
  var Nt = null, Pe = null, Oe = !1, sl = null, fn = !1, kc = Error(u(519));
  function il(e) {
    var t = Error(
      u(
        418,
        1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML",
        ""
      )
    );
    throw ss(cn(t, e)), kc;
  }
  function rd(e) {
    var t = e.stateNode, n = e.type, l = e.memoizedProps;
    switch (t[jt] = e, t[Rt] = l, n) {
      case "dialog":
        Ae("cancel", t), Ae("close", t);
        break;
      case "iframe":
      case "object":
      case "embed":
        Ae("load", t);
        break;
      case "video":
      case "audio":
        for (n = 0; n < Ts.length; n++)
          Ae(Ts[n], t);
        break;
      case "source":
        Ae("error", t);
        break;
      case "img":
      case "image":
      case "link":
        Ae("error", t), Ae("load", t);
        break;
      case "details":
        Ae("toggle", t);
        break;
      case "input":
        Ae("invalid", t), _f(
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
        Ae("invalid", t);
        break;
      case "textarea":
        Ae("invalid", t), wf(t, l.value, l.defaultValue, l.children);
    }
    n = l.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || l.suppressHydrationWarning === !0 || jm(t.textContent, n) ? (l.popover != null && (Ae("beforetoggle", t), Ae("toggle", t)), l.onScroll != null && Ae("scroll", t), l.onScrollEnd != null && Ae("scrollend", t), l.onClick != null && (t.onclick = Dn), t = !0) : t = !1, t || il(e, !0);
  }
  function cd(e) {
    for (Nt = e.return; Nt; )
      switch (Nt.tag) {
        case 5:
        case 31:
        case 13:
          fn = !1;
          return;
        case 27:
        case 3:
          fn = !0;
          return;
        default:
          Nt = Nt.return;
      }
  }
  function pa(e) {
    if (e !== Nt) return !1;
    if (!Oe) return cd(e), Oe = !0, !1;
    var t = e.tag, n;
    if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = !(n !== "form" && n !== "button") || Fu(e.type, e.memoizedProps)), n = !n), n && Pe && il(e), cd(e), t === 13) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(u(317));
      Pe = km(e);
    } else if (t === 31) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(u(317));
      Pe = km(e);
    } else
      t === 27 ? (t = Pe, _l(e.type) ? (e = no, no = null, Pe = e) : Pe = t) : Pe = Nt ? hn(e.stateNode.nextSibling) : null;
    return !0;
  }
  function Hl() {
    Pe = Nt = null, Oe = !1;
  }
  function Dc() {
    var e = sl;
    return e !== null && (qt === null ? qt = e : qt.push.apply(
      qt,
      e
    ), sl = null), e;
  }
  function ss(e) {
    sl === null ? sl = [e] : sl.push(e);
  }
  var Rc = _(null), Ul = null, Ln = null;
  function rl(e, t, n) {
    V(Rc, t._currentValue), t._currentValue = n;
  }
  function Bn(e) {
    e._currentValue = Rc.current, O(Rc);
  }
  function Hc(e, t, n) {
    for (; e !== null; ) {
      var l = e.alternate;
      if ((e.childLanes & t) !== t ? (e.childLanes |= t, l !== null && (l.childLanes |= t)) : l !== null && (l.childLanes & t) !== t && (l.childLanes |= t), e === n) break;
      e = e.return;
    }
  }
  function Uc(e, t, n, l) {
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
              c.lanes |= n, v = c.alternate, v !== null && (v.lanes |= n), Hc(
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
        h.lanes |= n, c = h.alternate, c !== null && (c.lanes |= n), Hc(h, n, e), h = null;
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
  function ga(e, t, n, l) {
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
          Jt(i.pendingProps.value, h.value) || (e !== null ? e.push(v) : e = [v]);
        }
      } else if (i === F.current) {
        if (h = i.alternate, h === null) throw Error(u(387));
        h.memoizedState.memoizedState !== i.memoizedState.memoizedState && (e !== null ? e.push(Os) : e = [Os]);
      }
      i = i.return;
    }
    e !== null && Uc(
      t,
      e,
      n,
      l
    ), t.flags |= 262144;
  }
  function Mi(e) {
    for (e = e.firstContext; e !== null; ) {
      if (!Jt(
        e.context._currentValue,
        e.memoizedValue
      ))
        return !0;
      e = e.next;
    }
    return !1;
  }
  function Ll(e) {
    Ul = e, Ln = null, e = e.dependencies, e !== null && (e.firstContext = null);
  }
  function Mt(e) {
    return ud(Ul, e);
  }
  function Ti(e, t) {
    return Ul === null && Ll(e), ud(e, t);
  }
  function ud(e, t) {
    var n = t._currentValue;
    if (t = { context: t, memoizedValue: n, next: null }, Ln === null) {
      if (e === null) throw Error(u(308));
      Ln = t, e.dependencies = { lanes: 0, firstContext: t }, e.flags |= 524288;
    } else Ln = Ln.next = t;
    return n;
  }
  var ry = typeof AbortController < "u" ? AbortController : function() {
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
  }, cy = a.unstable_scheduleCallback, uy = a.unstable_NormalPriority, dt = {
    $$typeof: P,
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0
  };
  function Lc() {
    return {
      controller: new ry(),
      data: /* @__PURE__ */ new Map(),
      refCount: 0
    };
  }
  function is(e) {
    e.refCount--, e.refCount === 0 && cy(uy, function() {
      e.controller.abort();
    });
  }
  var rs = null, Bc = 0, ya = 0, va = null;
  function oy(e, t) {
    if (rs === null) {
      var n = rs = [];
      Bc = 0, ya = Gu(), va = {
        status: "pending",
        value: void 0,
        then: function(l) {
          n.push(l);
        }
      };
    }
    return Bc++, t.then(od, od), t;
  }
  function od() {
    if (--Bc === 0 && rs !== null) {
      va !== null && (va.status = "fulfilled");
      var e = rs;
      rs = null, ya = 0, va = null;
      for (var t = 0; t < e.length; t++) (0, e[t])();
    }
  }
  function fy(e, t) {
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
  var fd = A.S;
  A.S = function(e, t) {
    Jh = Fe(), typeof t == "object" && t !== null && typeof t.then == "function" && oy(e, t), fd !== null && fd(e, t);
  };
  var Bl = _(null);
  function qc() {
    var e = Bl.current;
    return e !== null ? e : Ze.pooledCache;
  }
  function Ei(e, t) {
    t === null ? V(Bl, Bl.current) : V(Bl, t.pool);
  }
  function dd() {
    var e = qc();
    return e === null ? null : { parent: dt._currentValue, pool: e };
  }
  var xa = Error(u(460)), Yc = Error(u(474)), Ai = Error(u(542)), Ci = { then: function() {
  } };
  function hd(e) {
    return e = e.status, e === "fulfilled" || e === "rejected";
  }
  function md(e, t, n) {
    switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(Dn, Dn), t = n), t.status) {
      case "fulfilled":
        return t.value;
      case "rejected":
        throw e = t.reason, gd(e), e;
      default:
        if (typeof t.status == "string") t.then(Dn, Dn);
        else {
          if (e = Ze, e !== null && 100 < e.shellSuspendCounter)
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
            throw e = t.reason, gd(e), e;
        }
        throw Yl = t, xa;
    }
  }
  function ql(e) {
    try {
      var t = e._init;
      return t(e._payload);
    } catch (n) {
      throw n !== null && typeof n == "object" && typeof n.then == "function" ? (Yl = n, xa) : n;
    }
  }
  var Yl = null;
  function pd() {
    if (Yl === null) throw Error(u(459));
    var e = Yl;
    return Yl = null, e;
  }
  function gd(e) {
    if (e === xa || e === Ai)
      throw Error(u(483));
  }
  var _a = null, cs = 0;
  function zi(e) {
    var t = cs;
    return cs += 1, _a === null && (_a = []), md(_a, e, t);
  }
  function us(e, t) {
    t = t.props.ref, e.ref = t !== void 0 ? t : null;
  }
  function Oi(e, t) {
    throw t.$$typeof === S ? Error(u(525)) : (e = Object.prototype.toString.call(t), Error(
      u(
        31,
        e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e
      )
    ));
  }
  function yd(e) {
    function t(M, j) {
      if (e) {
        var T = M.deletions;
        T === null ? (M.deletions = [j], M.flags |= 16) : T.push(j);
      }
    }
    function n(M, j) {
      if (!e) return null;
      for (; j !== null; )
        t(M, j), j = j.sibling;
      return null;
    }
    function l(M) {
      for (var j = /* @__PURE__ */ new Map(); M !== null; )
        M.key !== null ? j.set(M.key, M) : j.set(M.index, M), M = M.sibling;
      return j;
    }
    function i(M, j) {
      return M = Hn(M, j), M.index = 0, M.sibling = null, M;
    }
    function c(M, j, T) {
      return M.index = T, e ? (T = M.alternate, T !== null ? (T = T.index, T < j ? (M.flags |= 67108866, j) : T) : (M.flags |= 67108866, j)) : (M.flags |= 1048576, j);
    }
    function h(M) {
      return e && M.alternate === null && (M.flags |= 67108866), M;
    }
    function v(M, j, T, L) {
      return j === null || j.tag !== 6 ? (j = Ac(T, M.mode, L), j.return = M, j) : (j = i(j, T), j.return = M, j);
    }
    function w(M, j, T, L) {
      var ue = T.type;
      return ue === R ? U(
        M,
        j,
        T.props.children,
        L,
        T.key
      ) : j !== null && (j.elementType === ue || typeof ue == "object" && ue !== null && ue.$$typeof === ee && ql(ue) === j.type) ? (j = i(j, T.props), us(j, T), j.return = M, j) : (j = ji(
        T.type,
        T.key,
        T.props,
        null,
        M.mode,
        L
      ), us(j, T), j.return = M, j);
    }
    function E(M, j, T, L) {
      return j === null || j.tag !== 4 || j.stateNode.containerInfo !== T.containerInfo || j.stateNode.implementation !== T.implementation ? (j = Cc(T, M.mode, L), j.return = M, j) : (j = i(j, T.children || []), j.return = M, j);
    }
    function U(M, j, T, L, ue) {
      return j === null || j.tag !== 7 ? (j = Rl(
        T,
        M.mode,
        L,
        ue
      ), j.return = M, j) : (j = i(j, T), j.return = M, j);
    }
    function B(M, j, T) {
      if (typeof j == "string" && j !== "" || typeof j == "number" || typeof j == "bigint")
        return j = Ac(
          "" + j,
          M.mode,
          T
        ), j.return = M, j;
      if (typeof j == "object" && j !== null) {
        switch (j.$$typeof) {
          case N:
            return T = ji(
              j.type,
              j.key,
              j.props,
              null,
              M.mode,
              T
            ), us(T, j), T.return = M, T;
          case z:
            return j = Cc(
              j,
              M.mode,
              T
            ), j.return = M, j;
          case ee:
            return j = ql(j), B(M, j, T);
        }
        if (ve(j) || oe(j))
          return j = Rl(
            j,
            M.mode,
            T,
            null
          ), j.return = M, j;
        if (typeof j.then == "function")
          return B(M, zi(j), T);
        if (j.$$typeof === P)
          return B(
            M,
            Ti(M, j),
            T
          );
        Oi(M, j);
      }
      return null;
    }
    function C(M, j, T, L) {
      var ue = j !== null ? j.key : null;
      if (typeof T == "string" && T !== "" || typeof T == "number" || typeof T == "bigint")
        return ue !== null ? null : v(M, j, "" + T, L);
      if (typeof T == "object" && T !== null) {
        switch (T.$$typeof) {
          case N:
            return T.key === ue ? w(M, j, T, L) : null;
          case z:
            return T.key === ue ? E(M, j, T, L) : null;
          case ee:
            return T = ql(T), C(M, j, T, L);
        }
        if (ve(T) || oe(T))
          return ue !== null ? null : U(M, j, T, L, null);
        if (typeof T.then == "function")
          return C(
            M,
            j,
            zi(T),
            L
          );
        if (T.$$typeof === P)
          return C(
            M,
            j,
            Ti(M, T),
            L
          );
        Oi(M, T);
      }
      return null;
    }
    function k(M, j, T, L, ue) {
      if (typeof L == "string" && L !== "" || typeof L == "number" || typeof L == "bigint")
        return M = M.get(T) || null, v(j, M, "" + L, ue);
      if (typeof L == "object" && L !== null) {
        switch (L.$$typeof) {
          case N:
            return M = M.get(
              L.key === null ? T : L.key
            ) || null, w(j, M, L, ue);
          case z:
            return M = M.get(
              L.key === null ? T : L.key
            ) || null, E(j, M, L, ue);
          case ee:
            return L = ql(L), k(
              M,
              j,
              T,
              L,
              ue
            );
        }
        if (ve(L) || oe(L))
          return M = M.get(T) || null, U(j, M, L, ue, null);
        if (typeof L.then == "function")
          return k(
            M,
            j,
            T,
            zi(L),
            ue
          );
        if (L.$$typeof === P)
          return k(
            M,
            j,
            T,
            Ti(j, L),
            ue
          );
        Oi(j, L);
      }
      return null;
    }
    function te(M, j, T, L) {
      for (var ue = null, Re = null, le = j, je = j = 0, ze = null; le !== null && je < T.length; je++) {
        le.index > je ? (ze = le, le = null) : ze = le.sibling;
        var He = C(
          M,
          le,
          T[je],
          L
        );
        if (He === null) {
          le === null && (le = ze);
          break;
        }
        e && le && He.alternate === null && t(M, le), j = c(He, j, je), Re === null ? ue = He : Re.sibling = He, Re = He, le = ze;
      }
      if (je === T.length)
        return n(M, le), Oe && Un(M, je), ue;
      if (le === null) {
        for (; je < T.length; je++)
          le = B(M, T[je], L), le !== null && (j = c(
            le,
            j,
            je
          ), Re === null ? ue = le : Re.sibling = le, Re = le);
        return Oe && Un(M, je), ue;
      }
      for (le = l(le); je < T.length; je++)
        ze = k(
          le,
          M,
          je,
          T[je],
          L
        ), ze !== null && (e && ze.alternate !== null && le.delete(
          ze.key === null ? je : ze.key
        ), j = c(
          ze,
          j,
          je
        ), Re === null ? ue = ze : Re.sibling = ze, Re = ze);
      return e && le.forEach(function(Nl) {
        return t(M, Nl);
      }), Oe && Un(M, je), ue;
    }
    function de(M, j, T, L) {
      if (T == null) throw Error(u(151));
      for (var ue = null, Re = null, le = j, je = j = 0, ze = null, He = T.next(); le !== null && !He.done; je++, He = T.next()) {
        le.index > je ? (ze = le, le = null) : ze = le.sibling;
        var Nl = C(M, le, He.value, L);
        if (Nl === null) {
          le === null && (le = ze);
          break;
        }
        e && le && Nl.alternate === null && t(M, le), j = c(Nl, j, je), Re === null ? ue = Nl : Re.sibling = Nl, Re = Nl, le = ze;
      }
      if (He.done)
        return n(M, le), Oe && Un(M, je), ue;
      if (le === null) {
        for (; !He.done; je++, He = T.next())
          He = B(M, He.value, L), He !== null && (j = c(He, j, je), Re === null ? ue = He : Re.sibling = He, Re = He);
        return Oe && Un(M, je), ue;
      }
      for (le = l(le); !He.done; je++, He = T.next())
        He = k(le, M, je, He.value, L), He !== null && (e && He.alternate !== null && le.delete(He.key === null ? je : He.key), j = c(He, j, je), Re === null ? ue = He : Re.sibling = He, Re = He);
      return e && le.forEach(function(w1) {
        return t(M, w1);
      }), Oe && Un(M, je), ue;
    }
    function Qe(M, j, T, L) {
      if (typeof T == "object" && T !== null && T.type === R && T.key === null && (T = T.props.children), typeof T == "object" && T !== null) {
        switch (T.$$typeof) {
          case N:
            e: {
              for (var ue = T.key; j !== null; ) {
                if (j.key === ue) {
                  if (ue = T.type, ue === R) {
                    if (j.tag === 7) {
                      n(
                        M,
                        j.sibling
                      ), L = i(
                        j,
                        T.props.children
                      ), L.return = M, M = L;
                      break e;
                    }
                  } else if (j.elementType === ue || typeof ue == "object" && ue !== null && ue.$$typeof === ee && ql(ue) === j.type) {
                    n(
                      M,
                      j.sibling
                    ), L = i(j, T.props), us(L, T), L.return = M, M = L;
                    break e;
                  }
                  n(M, j);
                  break;
                } else t(M, j);
                j = j.sibling;
              }
              T.type === R ? (L = Rl(
                T.props.children,
                M.mode,
                L,
                T.key
              ), L.return = M, M = L) : (L = ji(
                T.type,
                T.key,
                T.props,
                null,
                M.mode,
                L
              ), us(L, T), L.return = M, M = L);
            }
            return h(M);
          case z:
            e: {
              for (ue = T.key; j !== null; ) {
                if (j.key === ue)
                  if (j.tag === 4 && j.stateNode.containerInfo === T.containerInfo && j.stateNode.implementation === T.implementation) {
                    n(
                      M,
                      j.sibling
                    ), L = i(j, T.children || []), L.return = M, M = L;
                    break e;
                  } else {
                    n(M, j);
                    break;
                  }
                else t(M, j);
                j = j.sibling;
              }
              L = Cc(T, M.mode, L), L.return = M, M = L;
            }
            return h(M);
          case ee:
            return T = ql(T), Qe(
              M,
              j,
              T,
              L
            );
        }
        if (ve(T))
          return te(
            M,
            j,
            T,
            L
          );
        if (oe(T)) {
          if (ue = oe(T), typeof ue != "function") throw Error(u(150));
          return T = ue.call(T), de(
            M,
            j,
            T,
            L
          );
        }
        if (typeof T.then == "function")
          return Qe(
            M,
            j,
            zi(T),
            L
          );
        if (T.$$typeof === P)
          return Qe(
            M,
            j,
            Ti(M, T),
            L
          );
        Oi(M, T);
      }
      return typeof T == "string" && T !== "" || typeof T == "number" || typeof T == "bigint" ? (T = "" + T, j !== null && j.tag === 6 ? (n(M, j.sibling), L = i(j, T), L.return = M, M = L) : (n(M, j), L = Ac(T, M.mode, L), L.return = M, M = L), h(M)) : n(M, j);
    }
    return function(M, j, T, L) {
      try {
        cs = 0;
        var ue = Qe(
          M,
          j,
          T,
          L
        );
        return _a = null, ue;
      } catch (le) {
        if (le === xa || le === Ai) throw le;
        var Re = $t(29, le, null, M.mode);
        return Re.lanes = L, Re.return = M, Re;
      } finally {
      }
    };
  }
  var Gl = yd(!0), vd = yd(!1), cl = !1;
  function Gc(e) {
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
  function ul(e) {
    return { lane: e, tag: 0, payload: null, callback: null, next: null };
  }
  function ol(e, t, n) {
    var l = e.updateQueue;
    if (l === null) return null;
    if (l = l.shared, (Le & 2) !== 0) {
      var i = l.pending;
      return i === null ? t.next = t : (t.next = i.next, i.next = t), l.pending = t, t = Si(e), td(e, null, n), t;
    }
    return wi(e, l, t, n), Si(e);
  }
  function os(e, t, n) {
    if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194048) !== 0)) {
      var l = t.lanes;
      l &= e.pendingLanes, n |= l, t.lanes = n, uf(e, n);
    }
  }
  function Xc(e, t) {
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
  var Qc = !1;
  function fs() {
    if (Qc) {
      var e = va;
      if (e !== null) throw e;
    }
  }
  function ds(e, t, n, l) {
    Qc = !1;
    var i = e.updateQueue;
    cl = !1;
    var c = i.firstBaseUpdate, h = i.lastBaseUpdate, v = i.shared.pending;
    if (v !== null) {
      i.shared.pending = null;
      var w = v, E = w.next;
      w.next = null, h === null ? c = E : h.next = E, h = w;
      var U = e.alternate;
      U !== null && (U = U.updateQueue, v = U.lastBaseUpdate, v !== h && (v === null ? U.firstBaseUpdate = E : v.next = E, U.lastBaseUpdate = w));
    }
    if (c !== null) {
      var B = i.baseState;
      h = 0, U = E = w = null, v = c;
      do {
        var C = v.lane & -536870913, k = C !== v.lane;
        if (k ? (Ce & C) === C : (l & C) === C) {
          C !== 0 && C === ya && (Qc = !0), U !== null && (U = U.next = {
            lane: 0,
            tag: v.tag,
            payload: v.payload,
            callback: null,
            next: null
          });
          e: {
            var te = e, de = v;
            C = t;
            var Qe = n;
            switch (de.tag) {
              case 1:
                if (te = de.payload, typeof te == "function") {
                  B = te.call(Qe, B, C);
                  break e;
                }
                B = te;
                break e;
              case 3:
                te.flags = te.flags & -65537 | 128;
              case 0:
                if (te = de.payload, C = typeof te == "function" ? te.call(Qe, B, C) : te, C == null) break e;
                B = b({}, B, C);
                break e;
              case 2:
                cl = !0;
            }
          }
          C = v.callback, C !== null && (e.flags |= 64, k && (e.flags |= 8192), k = i.callbacks, k === null ? i.callbacks = [C] : k.push(C));
        } else
          k = {
            lane: C,
            tag: v.tag,
            payload: v.payload,
            callback: v.callback,
            next: null
          }, U === null ? (E = U = k, w = B) : U = U.next = k, h |= C;
        if (v = v.next, v === null) {
          if (v = i.shared.pending, v === null)
            break;
          k = v, v = k.next, k.next = null, i.lastBaseUpdate = k, i.shared.pending = null;
        }
      } while (!0);
      U === null && (w = B), i.baseState = w, i.firstBaseUpdate = E, i.lastBaseUpdate = U, c === null && (i.shared.lanes = 0), pl |= h, e.lanes = h, e.memoizedState = B;
    }
  }
  function xd(e, t) {
    if (typeof e != "function")
      throw Error(u(191, e));
    e.call(t);
  }
  function _d(e, t) {
    var n = e.callbacks;
    if (n !== null)
      for (e.callbacks = null, e = 0; e < n.length; e++)
        xd(n[e], t);
  }
  var ba = _(null), ki = _(0);
  function bd(e, t) {
    e = Jn, V(ki, e), V(ba, t), Jn = e | t.baseLanes;
  }
  function Zc() {
    V(ki, Jn), V(ba, ba.current);
  }
  function Kc() {
    Jn = ki.current, O(ba), O(ki);
  }
  var Wt = _(null), dn = null;
  function fl(e) {
    var t = e.alternate;
    V(ct, ct.current & 1), V(Wt, e), dn === null && (t === null || ba.current !== null || t.memoizedState !== null) && (dn = e);
  }
  function Jc(e) {
    V(ct, ct.current), V(Wt, e), dn === null && (dn = e);
  }
  function wd(e) {
    e.tag === 22 ? (V(ct, ct.current), V(Wt, e), dn === null && (dn = e)) : dl();
  }
  function dl() {
    V(ct, ct.current), V(Wt, Wt.current);
  }
  function Ft(e) {
    O(Wt), dn === e && (dn = null), O(ct);
  }
  var ct = _(0);
  function Di(e) {
    for (var t = e; t !== null; ) {
      if (t.tag === 13) {
        var n = t.memoizedState;
        if (n !== null && (n = n.dehydrated, n === null || eo(n) || to(n)))
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
  var qn = 0, Se = null, Ve = null, ht = null, Ri = !1, wa = !1, Vl = !1, Hi = 0, hs = 0, Sa = null, dy = 0;
  function st() {
    throw Error(u(321));
  }
  function $c(e, t) {
    if (t === null) return !1;
    for (var n = 0; n < t.length && n < e.length; n++)
      if (!Jt(e[n], t[n])) return !1;
    return !0;
  }
  function Wc(e, t, n, l, i, c) {
    return qn = c, Se = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, A.H = e === null || e.memoizedState === null ? sh : fu, Vl = !1, c = n(l, i), Vl = !1, wa && (c = jd(
      t,
      n,
      l,
      i
    )), Sd(e), c;
  }
  function Sd(e) {
    A.H = gs;
    var t = Ve !== null && Ve.next !== null;
    if (qn = 0, ht = Ve = Se = null, Ri = !1, hs = 0, Sa = null, t) throw Error(u(300));
    e === null || mt || (e = e.dependencies, e !== null && Mi(e) && (mt = !0));
  }
  function jd(e, t, n, l) {
    Se = e;
    var i = 0;
    do {
      if (wa && (Sa = null), hs = 0, wa = !1, 25 <= i) throw Error(u(301));
      if (i += 1, ht = Ve = null, e.updateQueue != null) {
        var c = e.updateQueue;
        c.lastEffect = null, c.events = null, c.stores = null, c.memoCache != null && (c.memoCache.index = 0);
      }
      A.H = ih, c = t(n, l);
    } while (wa);
    return c;
  }
  function hy() {
    var e = A.H, t = e.useState()[0];
    return t = typeof t.then == "function" ? ms(t) : t, e = e.useState()[0], (Ve !== null ? Ve.memoizedState : null) !== e && (Se.flags |= 1024), t;
  }
  function Fc() {
    var e = Hi !== 0;
    return Hi = 0, e;
  }
  function Ic(e, t, n) {
    t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
  }
  function Pc(e) {
    if (Ri) {
      for (e = e.memoizedState; e !== null; ) {
        var t = e.queue;
        t !== null && (t.pending = null), e = e.next;
      }
      Ri = !1;
    }
    qn = 0, ht = Ve = Se = null, wa = !1, hs = Hi = 0, Sa = null;
  }
  function Dt() {
    var e = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null
    };
    return ht === null ? Se.memoizedState = ht = e : ht = ht.next = e, ht;
  }
  function ut() {
    if (Ve === null) {
      var e = Se.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = Ve.next;
    var t = ht === null ? Se.memoizedState : ht.next;
    if (t !== null)
      ht = t, Ve = e;
    else {
      if (e === null)
        throw Se.alternate === null ? Error(u(467)) : Error(u(310));
      Ve = e, e = {
        memoizedState: Ve.memoizedState,
        baseState: Ve.baseState,
        baseQueue: Ve.baseQueue,
        queue: Ve.queue,
        next: null
      }, ht === null ? Se.memoizedState = ht = e : ht = ht.next = e;
    }
    return ht;
  }
  function Ui() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function ms(e) {
    var t = hs;
    return hs += 1, Sa === null && (Sa = []), e = md(Sa, e, t), t = Se, (ht === null ? t.memoizedState : ht.next) === null && (t = t.alternate, A.H = t === null || t.memoizedState === null ? sh : fu), e;
  }
  function Li(e) {
    if (e !== null && typeof e == "object") {
      if (typeof e.then == "function") return ms(e);
      if (e.$$typeof === P) return Mt(e);
    }
    throw Error(u(438, String(e)));
  }
  function eu(e) {
    var t = null, n = Se.updateQueue;
    if (n !== null && (t = n.memoCache), t == null) {
      var l = Se.alternate;
      l !== null && (l = l.updateQueue, l !== null && (l = l.memoCache, l != null && (t = {
        data: l.data.map(function(i) {
          return i.slice();
        }),
        index: 0
      })));
    }
    if (t == null && (t = { data: [], index: 0 }), n === null && (n = Ui(), Se.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0)
      for (n = t.data[t.index] = Array(e), l = 0; l < e; l++)
        n[l] = _e;
    return t.index++, n;
  }
  function Yn(e, t) {
    return typeof t == "function" ? t(e) : t;
  }
  function Bi(e) {
    var t = ut();
    return tu(t, Ve, e);
  }
  function tu(e, t, n) {
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
      var v = h = null, w = null, E = t, U = !1;
      do {
        var B = E.lane & -536870913;
        if (B !== E.lane ? (Ce & B) === B : (qn & B) === B) {
          var C = E.revertLane;
          if (C === 0)
            w !== null && (w = w.next = {
              lane: 0,
              revertLane: 0,
              gesture: null,
              action: E.action,
              hasEagerState: E.hasEagerState,
              eagerState: E.eagerState,
              next: null
            }), B === ya && (U = !0);
          else if ((qn & C) === C) {
            E = E.next, C === ya && (U = !0);
            continue;
          } else
            B = {
              lane: 0,
              revertLane: E.revertLane,
              gesture: null,
              action: E.action,
              hasEagerState: E.hasEagerState,
              eagerState: E.eagerState,
              next: null
            }, w === null ? (v = w = B, h = c) : w = w.next = B, Se.lanes |= C, pl |= C;
          B = E.action, Vl && n(c, B), c = E.hasEagerState ? E.eagerState : n(c, B);
        } else
          C = {
            lane: B,
            revertLane: E.revertLane,
            gesture: E.gesture,
            action: E.action,
            hasEagerState: E.hasEagerState,
            eagerState: E.eagerState,
            next: null
          }, w === null ? (v = w = C, h = c) : w = w.next = C, Se.lanes |= B, pl |= B;
        E = E.next;
      } while (E !== null && E !== t);
      if (w === null ? h = c : w.next = v, !Jt(c, e.memoizedState) && (mt = !0, U && (n = va, n !== null)))
        throw n;
      e.memoizedState = c, e.baseState = h, e.baseQueue = w, l.lastRenderedState = c;
    }
    return i === null && (l.lanes = 0), [e.memoizedState, l.dispatch];
  }
  function nu(e) {
    var t = ut(), n = t.queue;
    if (n === null) throw Error(u(311));
    n.lastRenderedReducer = e;
    var l = n.dispatch, i = n.pending, c = t.memoizedState;
    if (i !== null) {
      n.pending = null;
      var h = i = i.next;
      do
        c = e(c, h.action), h = h.next;
      while (h !== i);
      Jt(c, t.memoizedState) || (mt = !0), t.memoizedState = c, t.baseQueue === null && (t.baseState = c), n.lastRenderedState = c;
    }
    return [c, l];
  }
  function Nd(e, t, n) {
    var l = Se, i = ut(), c = Oe;
    if (c) {
      if (n === void 0) throw Error(u(407));
      n = n();
    } else n = t();
    var h = !Jt(
      (Ve || i).memoizedState,
      n
    );
    if (h && (i.memoizedState = n, mt = !0), i = i.queue, su(Ed.bind(null, l, i, e), [
      e
    ]), i.getSnapshot !== t || h || ht !== null && ht.memoizedState.tag & 1) {
      if (l.flags |= 2048, ja(
        9,
        { destroy: void 0 },
        Td.bind(
          null,
          l,
          i,
          n,
          t
        ),
        null
      ), Ze === null) throw Error(u(349));
      c || (qn & 127) !== 0 || Md(l, t, n);
    }
    return n;
  }
  function Md(e, t, n) {
    e.flags |= 16384, e = { getSnapshot: t, value: n }, t = Se.updateQueue, t === null ? (t = Ui(), Se.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
  }
  function Td(e, t, n, l) {
    t.value = n, t.getSnapshot = l, Ad(t) && Cd(e);
  }
  function Ed(e, t, n) {
    return n(function() {
      Ad(t) && Cd(e);
    });
  }
  function Ad(e) {
    var t = e.getSnapshot;
    e = e.value;
    try {
      var n = t();
      return !Jt(e, n);
    } catch {
      return !0;
    }
  }
  function Cd(e) {
    var t = Dl(e, 2);
    t !== null && Yt(t, e, 2);
  }
  function lu(e) {
    var t = Dt();
    if (typeof e == "function") {
      var n = e;
      if (e = n(), Vl) {
        $e(!0);
        try {
          n();
        } finally {
          $e(!1);
        }
      }
    }
    return t.memoizedState = t.baseState = e, t.queue = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Yn,
      lastRenderedState: e
    }, t;
  }
  function zd(e, t, n, l) {
    return e.baseState = n, tu(
      e,
      Ve,
      typeof l == "function" ? l : Yn
    );
  }
  function my(e, t, n, l, i) {
    if (Gi(e)) throw Error(u(485));
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
      A.T !== null ? n(!0) : c.isTransition = !1, l(c), n = t.pending, n === null ? (c.next = t.pending = c, Od(t, c)) : (c.next = n.next, t.pending = n.next = c);
    }
  }
  function Od(e, t) {
    var n = t.action, l = t.payload, i = e.state;
    if (t.isTransition) {
      var c = A.T, h = {};
      A.T = h;
      try {
        var v = n(i, l), w = A.S;
        w !== null && w(h, v), kd(e, t, v);
      } catch (E) {
        au(e, t, E);
      } finally {
        c !== null && h.types !== null && (c.types = h.types), A.T = c;
      }
    } else
      try {
        c = n(i, l), kd(e, t, c);
      } catch (E) {
        au(e, t, E);
      }
  }
  function kd(e, t, n) {
    n !== null && typeof n == "object" && typeof n.then == "function" ? n.then(
      function(l) {
        Dd(e, t, l);
      },
      function(l) {
        return au(e, t, l);
      }
    ) : Dd(e, t, n);
  }
  function Dd(e, t, n) {
    t.status = "fulfilled", t.value = n, Rd(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, Od(e, n)));
  }
  function au(e, t, n) {
    var l = e.pending;
    if (e.pending = null, l !== null) {
      l = l.next;
      do
        t.status = "rejected", t.reason = n, Rd(t), t = t.next;
      while (t !== l);
    }
    e.action = null;
  }
  function Rd(e) {
    e = e.listeners;
    for (var t = 0; t < e.length; t++) (0, e[t])();
  }
  function Hd(e, t) {
    return t;
  }
  function Ud(e, t) {
    if (Oe) {
      var n = Ze.formState;
      if (n !== null) {
        e: {
          var l = Se;
          if (Oe) {
            if (Pe) {
              t: {
                for (var i = Pe, c = fn; i.nodeType !== 8; ) {
                  if (!c) {
                    i = null;
                    break t;
                  }
                  if (i = hn(
                    i.nextSibling
                  ), i === null) {
                    i = null;
                    break t;
                  }
                }
                c = i.data, i = c === "F!" || c === "F" ? i : null;
              }
              if (i) {
                Pe = hn(
                  i.nextSibling
                ), l = i.data === "F!";
                break e;
              }
            }
            il(l);
          }
          l = !1;
        }
        l && (t = n[0]);
      }
    }
    return n = Dt(), n.memoizedState = n.baseState = t, l = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Hd,
      lastRenderedState: t
    }, n.queue = l, n = nh.bind(
      null,
      Se,
      l
    ), l.dispatch = n, l = lu(!1), c = ou.bind(
      null,
      Se,
      !1,
      l.queue
    ), l = Dt(), i = {
      state: t,
      dispatch: null,
      action: e,
      pending: null
    }, l.queue = i, n = my.bind(
      null,
      Se,
      i,
      c,
      n
    ), i.dispatch = n, l.memoizedState = e, [t, n, !1];
  }
  function Ld(e) {
    var t = ut();
    return Bd(t, Ve, e);
  }
  function Bd(e, t, n) {
    if (t = tu(
      e,
      t,
      Hd
    )[0], e = Bi(Yn)[0], typeof t == "object" && t !== null && typeof t.then == "function")
      try {
        var l = ms(t);
      } catch (h) {
        throw h === xa ? Ai : h;
      }
    else l = t;
    t = ut();
    var i = t.queue, c = i.dispatch;
    return n !== t.memoizedState && (Se.flags |= 2048, ja(
      9,
      { destroy: void 0 },
      py.bind(null, i, n),
      null
    )), [l, c, e];
  }
  function py(e, t) {
    e.action = t;
  }
  function qd(e) {
    var t = ut(), n = Ve;
    if (n !== null)
      return Bd(t, n, e);
    ut(), t = t.memoizedState, n = ut();
    var l = n.queue.dispatch;
    return n.memoizedState = e, [t, l, !1];
  }
  function ja(e, t, n, l) {
    return e = { tag: e, create: n, deps: l, inst: t, next: null }, t = Se.updateQueue, t === null && (t = Ui(), Se.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (l = n.next, n.next = e, e.next = l, t.lastEffect = e), e;
  }
  function Yd() {
    return ut().memoizedState;
  }
  function qi(e, t, n, l) {
    var i = Dt();
    Se.flags |= e, i.memoizedState = ja(
      1 | t,
      { destroy: void 0 },
      n,
      l === void 0 ? null : l
    );
  }
  function Yi(e, t, n, l) {
    var i = ut();
    l = l === void 0 ? null : l;
    var c = i.memoizedState.inst;
    Ve !== null && l !== null && $c(l, Ve.memoizedState.deps) ? i.memoizedState = ja(t, c, n, l) : (Se.flags |= e, i.memoizedState = ja(
      1 | t,
      c,
      n,
      l
    ));
  }
  function Gd(e, t) {
    qi(8390656, 8, e, t);
  }
  function su(e, t) {
    Yi(2048, 8, e, t);
  }
  function gy(e) {
    Se.flags |= 4;
    var t = Se.updateQueue;
    if (t === null)
      t = Ui(), Se.updateQueue = t, t.events = [e];
    else {
      var n = t.events;
      n === null ? t.events = [e] : n.push(e);
    }
  }
  function Vd(e) {
    var t = ut().memoizedState;
    return gy({ ref: t, nextImpl: e }), function() {
      if ((Le & 2) !== 0) throw Error(u(440));
      return t.impl.apply(void 0, arguments);
    };
  }
  function Xd(e, t) {
    return Yi(4, 2, e, t);
  }
  function Qd(e, t) {
    return Yi(4, 4, e, t);
  }
  function Zd(e, t) {
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
  function Kd(e, t, n) {
    n = n != null ? n.concat([e]) : null, Yi(4, 4, Zd.bind(null, t, e), n);
  }
  function iu() {
  }
  function Jd(e, t) {
    var n = ut();
    t = t === void 0 ? null : t;
    var l = n.memoizedState;
    return t !== null && $c(t, l[1]) ? l[0] : (n.memoizedState = [e, t], e);
  }
  function $d(e, t) {
    var n = ut();
    t = t === void 0 ? null : t;
    var l = n.memoizedState;
    if (t !== null && $c(t, l[1]))
      return l[0];
    if (l = e(), Vl) {
      $e(!0);
      try {
        e();
      } finally {
        $e(!1);
      }
    }
    return n.memoizedState = [l, t], l;
  }
  function ru(e, t, n) {
    return n === void 0 || (qn & 1073741824) !== 0 && (Ce & 261930) === 0 ? e.memoizedState = t : (e.memoizedState = n, e = Wh(), Se.lanes |= e, pl |= e, n);
  }
  function Wd(e, t, n, l) {
    return Jt(n, t) ? n : ba.current !== null ? (e = ru(e, n, l), Jt(e, t) || (mt = !0), e) : (qn & 42) === 0 || (qn & 1073741824) !== 0 && (Ce & 261930) === 0 ? (mt = !0, e.memoizedState = n) : (e = Wh(), Se.lanes |= e, pl |= e, t);
  }
  function Fd(e, t, n, l, i) {
    var c = q.p;
    q.p = c !== 0 && 8 > c ? c : 8;
    var h = A.T, v = {};
    A.T = v, ou(e, !1, t, n);
    try {
      var w = i(), E = A.S;
      if (E !== null && E(v, w), w !== null && typeof w == "object" && typeof w.then == "function") {
        var U = fy(
          w,
          l
        );
        ps(
          e,
          t,
          U,
          en(e)
        );
      } else
        ps(
          e,
          t,
          l,
          en(e)
        );
    } catch (B) {
      ps(
        e,
        t,
        { then: function() {
        }, status: "rejected", reason: B },
        en()
      );
    } finally {
      q.p = c, h !== null && v.types !== null && (h.types = v.types), A.T = h;
    }
  }
  function yy() {
  }
  function cu(e, t, n, l) {
    if (e.tag !== 5) throw Error(u(476));
    var i = Id(e).queue;
    Fd(
      e,
      i,
      t,
      W,
      n === null ? yy : function() {
        return Pd(e), n(l);
      }
    );
  }
  function Id(e) {
    var t = e.memoizedState;
    if (t !== null) return t;
    t = {
      memoizedState: W,
      baseState: W,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Yn,
        lastRenderedState: W
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
        lastRenderedReducer: Yn,
        lastRenderedState: n
      },
      next: null
    }, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
  }
  function Pd(e) {
    var t = Id(e);
    t.next === null && (t = e.alternate.memoizedState), ps(
      e,
      t.next.queue,
      {},
      en()
    );
  }
  function uu() {
    return Mt(Os);
  }
  function eh() {
    return ut().memoizedState;
  }
  function th() {
    return ut().memoizedState;
  }
  function vy(e) {
    for (var t = e.return; t !== null; ) {
      switch (t.tag) {
        case 24:
        case 3:
          var n = en();
          e = ul(n);
          var l = ol(t, e, n);
          l !== null && (Yt(l, t, n), os(l, t, n)), t = { cache: Lc() }, e.payload = t;
          return;
      }
      t = t.return;
    }
  }
  function xy(e, t, n) {
    var l = en();
    n = {
      lane: l,
      revertLane: 0,
      gesture: null,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, Gi(e) ? lh(t, n) : (n = Tc(e, t, n, l), n !== null && (Yt(n, e, l), ah(n, t, l)));
  }
  function nh(e, t, n) {
    var l = en();
    ps(e, t, n, l);
  }
  function ps(e, t, n, l) {
    var i = {
      lane: l,
      revertLane: 0,
      gesture: null,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null
    };
    if (Gi(e)) lh(t, i);
    else {
      var c = e.alternate;
      if (e.lanes === 0 && (c === null || c.lanes === 0) && (c = t.lastRenderedReducer, c !== null))
        try {
          var h = t.lastRenderedState, v = c(h, n);
          if (i.hasEagerState = !0, i.eagerState = v, Jt(v, h))
            return wi(e, t, i, 0), Ze === null && bi(), !1;
        } catch {
        } finally {
        }
      if (n = Tc(e, t, i, l), n !== null)
        return Yt(n, e, l), ah(n, t, l), !0;
    }
    return !1;
  }
  function ou(e, t, n, l) {
    if (l = {
      lane: 2,
      revertLane: Gu(),
      gesture: null,
      action: l,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, Gi(e)) {
      if (t) throw Error(u(479));
    } else
      t = Tc(
        e,
        n,
        l,
        2
      ), t !== null && Yt(t, e, 2);
  }
  function Gi(e) {
    var t = e.alternate;
    return e === Se || t !== null && t === Se;
  }
  function lh(e, t) {
    wa = Ri = !0;
    var n = e.pending;
    n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
  }
  function ah(e, t, n) {
    if ((n & 4194048) !== 0) {
      var l = t.lanes;
      l &= e.pendingLanes, n |= l, t.lanes = n, uf(e, n);
    }
  }
  var gs = {
    readContext: Mt,
    use: Li,
    useCallback: st,
    useContext: st,
    useEffect: st,
    useImperativeHandle: st,
    useLayoutEffect: st,
    useInsertionEffect: st,
    useMemo: st,
    useReducer: st,
    useRef: st,
    useState: st,
    useDebugValue: st,
    useDeferredValue: st,
    useTransition: st,
    useSyncExternalStore: st,
    useId: st,
    useHostTransitionStatus: st,
    useFormState: st,
    useActionState: st,
    useOptimistic: st,
    useMemoCache: st,
    useCacheRefresh: st
  };
  gs.useEffectEvent = st;
  var sh = {
    readContext: Mt,
    use: Li,
    useCallback: function(e, t) {
      return Dt().memoizedState = [
        e,
        t === void 0 ? null : t
      ], e;
    },
    useContext: Mt,
    useEffect: Gd,
    useImperativeHandle: function(e, t, n) {
      n = n != null ? n.concat([e]) : null, qi(
        4194308,
        4,
        Zd.bind(null, t, e),
        n
      );
    },
    useLayoutEffect: function(e, t) {
      return qi(4194308, 4, e, t);
    },
    useInsertionEffect: function(e, t) {
      qi(4, 2, e, t);
    },
    useMemo: function(e, t) {
      var n = Dt();
      t = t === void 0 ? null : t;
      var l = e();
      if (Vl) {
        $e(!0);
        try {
          e();
        } finally {
          $e(!1);
        }
      }
      return n.memoizedState = [l, t], l;
    },
    useReducer: function(e, t, n) {
      var l = Dt();
      if (n !== void 0) {
        var i = n(t);
        if (Vl) {
          $e(!0);
          try {
            n(t);
          } finally {
            $e(!1);
          }
        }
      } else i = t;
      return l.memoizedState = l.baseState = i, e = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: e,
        lastRenderedState: i
      }, l.queue = e, e = e.dispatch = xy.bind(
        null,
        Se,
        e
      ), [l.memoizedState, e];
    },
    useRef: function(e) {
      var t = Dt();
      return e = { current: e }, t.memoizedState = e;
    },
    useState: function(e) {
      e = lu(e);
      var t = e.queue, n = nh.bind(null, Se, t);
      return t.dispatch = n, [e.memoizedState, n];
    },
    useDebugValue: iu,
    useDeferredValue: function(e, t) {
      var n = Dt();
      return ru(n, e, t);
    },
    useTransition: function() {
      var e = lu(!1);
      return e = Fd.bind(
        null,
        Se,
        e.queue,
        !0,
        !1
      ), Dt().memoizedState = e, [!1, e];
    },
    useSyncExternalStore: function(e, t, n) {
      var l = Se, i = Dt();
      if (Oe) {
        if (n === void 0)
          throw Error(u(407));
        n = n();
      } else {
        if (n = t(), Ze === null)
          throw Error(u(349));
        (Ce & 127) !== 0 || Md(l, t, n);
      }
      i.memoizedState = n;
      var c = { value: n, getSnapshot: t };
      return i.queue = c, Gd(Ed.bind(null, l, c, e), [
        e
      ]), l.flags |= 2048, ja(
        9,
        { destroy: void 0 },
        Td.bind(
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
      var e = Dt(), t = Ze.identifierPrefix;
      if (Oe) {
        var n = Mn, l = Nn;
        n = (l & ~(1 << 32 - xt(l) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = Hi++, 0 < n && (t += "H" + n.toString(32)), t += "_";
      } else
        n = dy++, t = "_" + t + "r_" + n.toString(32) + "_";
      return e.memoizedState = t;
    },
    useHostTransitionStatus: uu,
    useFormState: Ud,
    useActionState: Ud,
    useOptimistic: function(e) {
      var t = Dt();
      t.memoizedState = t.baseState = e;
      var n = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null
      };
      return t.queue = n, t = ou.bind(
        null,
        Se,
        !0,
        n
      ), n.dispatch = t, [e, t];
    },
    useMemoCache: eu,
    useCacheRefresh: function() {
      return Dt().memoizedState = vy.bind(
        null,
        Se
      );
    },
    useEffectEvent: function(e) {
      var t = Dt(), n = { impl: e };
      return t.memoizedState = n, function() {
        if ((Le & 2) !== 0)
          throw Error(u(440));
        return n.impl.apply(void 0, arguments);
      };
    }
  }, fu = {
    readContext: Mt,
    use: Li,
    useCallback: Jd,
    useContext: Mt,
    useEffect: su,
    useImperativeHandle: Kd,
    useInsertionEffect: Xd,
    useLayoutEffect: Qd,
    useMemo: $d,
    useReducer: Bi,
    useRef: Yd,
    useState: function() {
      return Bi(Yn);
    },
    useDebugValue: iu,
    useDeferredValue: function(e, t) {
      var n = ut();
      return Wd(
        n,
        Ve.memoizedState,
        e,
        t
      );
    },
    useTransition: function() {
      var e = Bi(Yn)[0], t = ut().memoizedState;
      return [
        typeof e == "boolean" ? e : ms(e),
        t
      ];
    },
    useSyncExternalStore: Nd,
    useId: eh,
    useHostTransitionStatus: uu,
    useFormState: Ld,
    useActionState: Ld,
    useOptimistic: function(e, t) {
      var n = ut();
      return zd(n, Ve, e, t);
    },
    useMemoCache: eu,
    useCacheRefresh: th
  };
  fu.useEffectEvent = Vd;
  var ih = {
    readContext: Mt,
    use: Li,
    useCallback: Jd,
    useContext: Mt,
    useEffect: su,
    useImperativeHandle: Kd,
    useInsertionEffect: Xd,
    useLayoutEffect: Qd,
    useMemo: $d,
    useReducer: nu,
    useRef: Yd,
    useState: function() {
      return nu(Yn);
    },
    useDebugValue: iu,
    useDeferredValue: function(e, t) {
      var n = ut();
      return Ve === null ? ru(n, e, t) : Wd(
        n,
        Ve.memoizedState,
        e,
        t
      );
    },
    useTransition: function() {
      var e = nu(Yn)[0], t = ut().memoizedState;
      return [
        typeof e == "boolean" ? e : ms(e),
        t
      ];
    },
    useSyncExternalStore: Nd,
    useId: eh,
    useHostTransitionStatus: uu,
    useFormState: qd,
    useActionState: qd,
    useOptimistic: function(e, t) {
      var n = ut();
      return Ve !== null ? zd(n, Ve, e, t) : (n.baseState = e, [e, n.queue.dispatch]);
    },
    useMemoCache: eu,
    useCacheRefresh: th
  };
  ih.useEffectEvent = Vd;
  function du(e, t, n, l) {
    t = e.memoizedState, n = n(l, t), n = n == null ? t : b({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
  }
  var hu = {
    enqueueSetState: function(e, t, n) {
      e = e._reactInternals;
      var l = en(), i = ul(l);
      i.payload = t, n != null && (i.callback = n), t = ol(e, i, l), t !== null && (Yt(t, e, l), os(t, e, l));
    },
    enqueueReplaceState: function(e, t, n) {
      e = e._reactInternals;
      var l = en(), i = ul(l);
      i.tag = 1, i.payload = t, n != null && (i.callback = n), t = ol(e, i, l), t !== null && (Yt(t, e, l), os(t, e, l));
    },
    enqueueForceUpdate: function(e, t) {
      e = e._reactInternals;
      var n = en(), l = ul(n);
      l.tag = 2, t != null && (l.callback = t), t = ol(e, l, n), t !== null && (Yt(t, e, n), os(t, e, n));
    }
  };
  function rh(e, t, n, l, i, c, h) {
    return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(l, c, h) : t.prototype && t.prototype.isPureReactComponent ? !ns(n, l) || !ns(i, c) : !0;
  }
  function ch(e, t, n, l) {
    e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, l), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, l), t.state !== e && hu.enqueueReplaceState(t, t.state, null);
  }
  function Xl(e, t) {
    var n = t;
    if ("ref" in t) {
      n = {};
      for (var l in t)
        l !== "ref" && (n[l] = t[l]);
    }
    if (e = e.defaultProps) {
      n === t && (n = b({}, n));
      for (var i in e)
        n[i] === void 0 && (n[i] = e[i]);
    }
    return n;
  }
  function uh(e) {
    _i(e);
  }
  function oh(e) {
    console.error(e);
  }
  function fh(e) {
    _i(e);
  }
  function Vi(e, t) {
    try {
      var n = e.onUncaughtError;
      n(t.value, { componentStack: t.stack });
    } catch (l) {
      setTimeout(function() {
        throw l;
      });
    }
  }
  function dh(e, t, n) {
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
  function mu(e, t, n) {
    return n = ul(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
      Vi(e, t);
    }, n;
  }
  function hh(e) {
    return e = ul(e), e.tag = 3, e;
  }
  function mh(e, t, n, l) {
    var i = n.type.getDerivedStateFromError;
    if (typeof i == "function") {
      var c = l.value;
      e.payload = function() {
        return i(c);
      }, e.callback = function() {
        dh(t, n, l);
      };
    }
    var h = n.stateNode;
    h !== null && typeof h.componentDidCatch == "function" && (e.callback = function() {
      dh(t, n, l), typeof i != "function" && (gl === null ? gl = /* @__PURE__ */ new Set([this]) : gl.add(this));
      var v = l.stack;
      this.componentDidCatch(l.value, {
        componentStack: v !== null ? v : ""
      });
    });
  }
  function _y(e, t, n, l, i) {
    if (n.flags |= 32768, l !== null && typeof l == "object" && typeof l.then == "function") {
      if (t = n.alternate, t !== null && ga(
        t,
        n,
        i,
        !0
      ), n = Wt.current, n !== null) {
        switch (n.tag) {
          case 31:
          case 13:
            return dn === null ? tr() : n.alternate === null && it === 0 && (it = 3), n.flags &= -257, n.flags |= 65536, n.lanes = i, l === Ci ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = /* @__PURE__ */ new Set([l]) : t.add(l), Bu(e, l, i)), !1;
          case 22:
            return n.flags |= 65536, l === Ci ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
              transitions: null,
              markerInstances: null,
              retryQueue: /* @__PURE__ */ new Set([l])
            }, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = /* @__PURE__ */ new Set([l]) : n.add(l)), Bu(e, l, i)), !1;
        }
        throw Error(u(435, n.tag));
      }
      return Bu(e, l, i), tr(), !1;
    }
    if (Oe)
      return t = Wt.current, t !== null ? ((t.flags & 65536) === 0 && (t.flags |= 256), t.flags |= 65536, t.lanes = i, l !== kc && (e = Error(u(422), { cause: l }), ss(cn(e, n)))) : (l !== kc && (t = Error(u(423), {
        cause: l
      }), ss(
        cn(t, n)
      )), e = e.current.alternate, e.flags |= 65536, i &= -i, e.lanes |= i, l = cn(l, n), i = mu(
        e.stateNode,
        l,
        i
      ), Xc(e, i), it !== 4 && (it = 2)), !1;
    var c = Error(u(520), { cause: l });
    if (c = cn(c, n), js === null ? js = [c] : js.push(c), it !== 4 && (it = 2), t === null) return !0;
    l = cn(l, n), n = t;
    do {
      switch (n.tag) {
        case 3:
          return n.flags |= 65536, e = i & -i, n.lanes |= e, e = mu(n.stateNode, l, e), Xc(n, e), !1;
        case 1:
          if (t = n.type, c = n.stateNode, (n.flags & 128) === 0 && (typeof t.getDerivedStateFromError == "function" || c !== null && typeof c.componentDidCatch == "function" && (gl === null || !gl.has(c))))
            return n.flags |= 65536, i &= -i, n.lanes |= i, i = hh(i), mh(
              i,
              e,
              n,
              l
            ), Xc(n, i), !1;
      }
      n = n.return;
    } while (n !== null);
    return !1;
  }
  var pu = Error(u(461)), mt = !1;
  function Tt(e, t, n, l) {
    t.child = e === null ? vd(t, null, n, l) : Gl(
      t,
      e.child,
      n,
      l
    );
  }
  function ph(e, t, n, l, i) {
    n = n.render;
    var c = t.ref;
    if ("ref" in l) {
      var h = {};
      for (var v in l)
        v !== "ref" && (h[v] = l[v]);
    } else h = l;
    return Ll(t), l = Wc(
      e,
      t,
      n,
      h,
      c,
      i
    ), v = Fc(), e !== null && !mt ? (Ic(e, t, i), Gn(e, t, i)) : (Oe && v && zc(t), t.flags |= 1, Tt(e, t, l, i), t.child);
  }
  function gh(e, t, n, l, i) {
    if (e === null) {
      var c = n.type;
      return typeof c == "function" && !Ec(c) && c.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = c, yh(
        e,
        t,
        c,
        l,
        i
      )) : (e = ji(
        n.type,
        null,
        l,
        t,
        t.mode,
        i
      ), e.ref = t.ref, e.return = t, t.child = e);
    }
    if (c = e.child, !Su(e, i)) {
      var h = c.memoizedProps;
      if (n = n.compare, n = n !== null ? n : ns, n(h, l) && e.ref === t.ref)
        return Gn(e, t, i);
    }
    return t.flags |= 1, e = Hn(c, l), e.ref = t.ref, e.return = t, t.child = e;
  }
  function yh(e, t, n, l, i) {
    if (e !== null) {
      var c = e.memoizedProps;
      if (ns(c, l) && e.ref === t.ref)
        if (mt = !1, t.pendingProps = l = c, Su(e, i))
          (e.flags & 131072) !== 0 && (mt = !0);
        else
          return t.lanes = e.lanes, Gn(e, t, i);
    }
    return gu(
      e,
      t,
      n,
      l,
      i
    );
  }
  function vh(e, t, n, l) {
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
        return xh(
          e,
          t,
          c,
          n,
          l
        );
      }
      if ((n & 536870912) !== 0)
        t.memoizedState = { baseLanes: 0, cachePool: null }, e !== null && Ei(
          t,
          c !== null ? c.cachePool : null
        ), c !== null ? bd(t, c) : Zc(), wd(t);
      else
        return l = t.lanes = 536870912, xh(
          e,
          t,
          c !== null ? c.baseLanes | n : n,
          n,
          l
        );
    } else
      c !== null ? (Ei(t, c.cachePool), bd(t, c), dl(), t.memoizedState = null) : (e !== null && Ei(t, null), Zc(), dl());
    return Tt(e, t, i, n), t.child;
  }
  function ys(e, t) {
    return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), t.sibling;
  }
  function xh(e, t, n, l, i) {
    var c = qc();
    return c = c === null ? null : { parent: dt._currentValue, pool: c }, t.memoizedState = {
      baseLanes: n,
      cachePool: c
    }, e !== null && Ei(t, null), Zc(), wd(t), e !== null && ga(e, t, l, !0), t.childLanes = i, null;
  }
  function Xi(e, t) {
    return t = Zi(
      { mode: t.mode, children: t.children },
      e.mode
    ), t.ref = e.ref, e.child = t, t.return = e, t;
  }
  function _h(e, t, n) {
    return Gl(t, e.child, null, n), e = Xi(t, t.pendingProps), e.flags |= 2, Ft(t), t.memoizedState = null, e;
  }
  function by(e, t, n) {
    var l = t.pendingProps, i = (t.flags & 128) !== 0;
    if (t.flags &= -129, e === null) {
      if (Oe) {
        if (l.mode === "hidden")
          return e = Xi(t, l), t.lanes = 536870912, ys(null, e);
        if (Jc(t), (e = Pe) ? (e = Om(
          e,
          fn
        ), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
          dehydrated: e,
          treeContext: al !== null ? { id: Nn, overflow: Mn } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, n = ld(e), n.return = t, t.child = n, Nt = t, Pe = null)) : e = null, e === null) throw il(t);
        return t.lanes = 536870912, null;
      }
      return Xi(t, l);
    }
    var c = e.memoizedState;
    if (c !== null) {
      var h = c.dehydrated;
      if (Jc(t), i)
        if (t.flags & 256)
          t.flags &= -257, t = _h(
            e,
            t,
            n
          );
        else if (t.memoizedState !== null)
          t.child = e.child, t.flags |= 128, t = null;
        else throw Error(u(558));
      else if (mt || ga(e, t, n, !1), i = (n & e.childLanes) !== 0, mt || i) {
        if (l = Ze, l !== null && (h = of(l, n), h !== 0 && h !== c.retryLane))
          throw c.retryLane = h, Dl(e, h), Yt(l, e, h), pu;
        tr(), t = _h(
          e,
          t,
          n
        );
      } else
        e = c.treeContext, Pe = hn(h.nextSibling), Nt = t, Oe = !0, sl = null, fn = !1, e !== null && id(t, e), t = Xi(t, l), t.flags |= 4096;
      return t;
    }
    return e = Hn(e.child, {
      mode: l.mode,
      children: l.children
    }), e.ref = t.ref, t.child = e, e.return = t, e;
  }
  function Qi(e, t) {
    var n = t.ref;
    if (n === null)
      e !== null && e.ref !== null && (t.flags |= 4194816);
    else {
      if (typeof n != "function" && typeof n != "object")
        throw Error(u(284));
      (e === null || e.ref !== n) && (t.flags |= 4194816);
    }
  }
  function gu(e, t, n, l, i) {
    return Ll(t), n = Wc(
      e,
      t,
      n,
      l,
      void 0,
      i
    ), l = Fc(), e !== null && !mt ? (Ic(e, t, i), Gn(e, t, i)) : (Oe && l && zc(t), t.flags |= 1, Tt(e, t, n, i), t.child);
  }
  function bh(e, t, n, l, i, c) {
    return Ll(t), t.updateQueue = null, n = jd(
      t,
      l,
      n,
      i
    ), Sd(e), l = Fc(), e !== null && !mt ? (Ic(e, t, c), Gn(e, t, c)) : (Oe && l && zc(t), t.flags |= 1, Tt(e, t, n, c), t.child);
  }
  function wh(e, t, n, l, i) {
    if (Ll(t), t.stateNode === null) {
      var c = da, h = n.contextType;
      typeof h == "object" && h !== null && (c = Mt(h)), c = new n(l, c), t.memoizedState = c.state !== null && c.state !== void 0 ? c.state : null, c.updater = hu, t.stateNode = c, c._reactInternals = t, c = t.stateNode, c.props = l, c.state = t.memoizedState, c.refs = {}, Gc(t), h = n.contextType, c.context = typeof h == "object" && h !== null ? Mt(h) : da, c.state = t.memoizedState, h = n.getDerivedStateFromProps, typeof h == "function" && (du(
        t,
        n,
        h,
        l
      ), c.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof c.getSnapshotBeforeUpdate == "function" || typeof c.UNSAFE_componentWillMount != "function" && typeof c.componentWillMount != "function" || (h = c.state, typeof c.componentWillMount == "function" && c.componentWillMount(), typeof c.UNSAFE_componentWillMount == "function" && c.UNSAFE_componentWillMount(), h !== c.state && hu.enqueueReplaceState(c, c.state, null), ds(t, l, c, i), fs(), c.state = t.memoizedState), typeof c.componentDidMount == "function" && (t.flags |= 4194308), l = !0;
    } else if (e === null) {
      c = t.stateNode;
      var v = t.memoizedProps, w = Xl(n, v);
      c.props = w;
      var E = c.context, U = n.contextType;
      h = da, typeof U == "object" && U !== null && (h = Mt(U));
      var B = n.getDerivedStateFromProps;
      U = typeof B == "function" || typeof c.getSnapshotBeforeUpdate == "function", v = t.pendingProps !== v, U || typeof c.UNSAFE_componentWillReceiveProps != "function" && typeof c.componentWillReceiveProps != "function" || (v || E !== h) && ch(
        t,
        c,
        l,
        h
      ), cl = !1;
      var C = t.memoizedState;
      c.state = C, ds(t, l, c, i), fs(), E = t.memoizedState, v || C !== E || cl ? (typeof B == "function" && (du(
        t,
        n,
        B,
        l
      ), E = t.memoizedState), (w = cl || rh(
        t,
        n,
        w,
        l,
        C,
        E,
        h
      )) ? (U || typeof c.UNSAFE_componentWillMount != "function" && typeof c.componentWillMount != "function" || (typeof c.componentWillMount == "function" && c.componentWillMount(), typeof c.UNSAFE_componentWillMount == "function" && c.UNSAFE_componentWillMount()), typeof c.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof c.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = l, t.memoizedState = E), c.props = l, c.state = E, c.context = h, l = w) : (typeof c.componentDidMount == "function" && (t.flags |= 4194308), l = !1);
    } else {
      c = t.stateNode, Vc(e, t), h = t.memoizedProps, U = Xl(n, h), c.props = U, B = t.pendingProps, C = c.context, E = n.contextType, w = da, typeof E == "object" && E !== null && (w = Mt(E)), v = n.getDerivedStateFromProps, (E = typeof v == "function" || typeof c.getSnapshotBeforeUpdate == "function") || typeof c.UNSAFE_componentWillReceiveProps != "function" && typeof c.componentWillReceiveProps != "function" || (h !== B || C !== w) && ch(
        t,
        c,
        l,
        w
      ), cl = !1, C = t.memoizedState, c.state = C, ds(t, l, c, i), fs();
      var k = t.memoizedState;
      h !== B || C !== k || cl || e !== null && e.dependencies !== null && Mi(e.dependencies) ? (typeof v == "function" && (du(
        t,
        n,
        v,
        l
      ), k = t.memoizedState), (U = cl || rh(
        t,
        n,
        U,
        l,
        C,
        k,
        w
      ) || e !== null && e.dependencies !== null && Mi(e.dependencies)) ? (E || typeof c.UNSAFE_componentWillUpdate != "function" && typeof c.componentWillUpdate != "function" || (typeof c.componentWillUpdate == "function" && c.componentWillUpdate(l, k, w), typeof c.UNSAFE_componentWillUpdate == "function" && c.UNSAFE_componentWillUpdate(
        l,
        k,
        w
      )), typeof c.componentDidUpdate == "function" && (t.flags |= 4), typeof c.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof c.componentDidUpdate != "function" || h === e.memoizedProps && C === e.memoizedState || (t.flags |= 4), typeof c.getSnapshotBeforeUpdate != "function" || h === e.memoizedProps && C === e.memoizedState || (t.flags |= 1024), t.memoizedProps = l, t.memoizedState = k), c.props = l, c.state = k, c.context = w, l = U) : (typeof c.componentDidUpdate != "function" || h === e.memoizedProps && C === e.memoizedState || (t.flags |= 4), typeof c.getSnapshotBeforeUpdate != "function" || h === e.memoizedProps && C === e.memoizedState || (t.flags |= 1024), l = !1);
    }
    return c = l, Qi(e, t), l = (t.flags & 128) !== 0, c || l ? (c = t.stateNode, n = l && typeof n.getDerivedStateFromError != "function" ? null : c.render(), t.flags |= 1, e !== null && l ? (t.child = Gl(
      t,
      e.child,
      null,
      i
    ), t.child = Gl(
      t,
      null,
      n,
      i
    )) : Tt(e, t, n, i), t.memoizedState = c.state, e = t.child) : e = Gn(
      e,
      t,
      i
    ), e;
  }
  function Sh(e, t, n, l) {
    return Hl(), t.flags |= 256, Tt(e, t, n, l), t.child;
  }
  var yu = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0,
    hydrationErrors: null
  };
  function vu(e) {
    return { baseLanes: e, cachePool: dd() };
  }
  function xu(e, t, n) {
    return e = e !== null ? e.childLanes & ~n : 0, t && (e |= Pt), e;
  }
  function jh(e, t, n) {
    var l = t.pendingProps, i = !1, c = (t.flags & 128) !== 0, h;
    if ((h = c) || (h = e !== null && e.memoizedState === null ? !1 : (ct.current & 2) !== 0), h && (i = !0, t.flags &= -129), h = (t.flags & 32) !== 0, t.flags &= -33, e === null) {
      if (Oe) {
        if (i ? fl(t) : dl(), (e = Pe) ? (e = Om(
          e,
          fn
        ), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
          dehydrated: e,
          treeContext: al !== null ? { id: Nn, overflow: Mn } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, n = ld(e), n.return = t, t.child = n, Nt = t, Pe = null)) : e = null, e === null) throw il(t);
        return to(e) ? t.lanes = 32 : t.lanes = 536870912, null;
      }
      var v = l.children;
      return l = l.fallback, i ? (dl(), i = t.mode, v = Zi(
        { mode: "hidden", children: v },
        i
      ), l = Rl(
        l,
        i,
        n,
        null
      ), v.return = t, l.return = t, v.sibling = l, t.child = v, l = t.child, l.memoizedState = vu(n), l.childLanes = xu(
        e,
        h,
        n
      ), t.memoizedState = yu, ys(null, l)) : (fl(t), _u(t, v));
    }
    var w = e.memoizedState;
    if (w !== null && (v = w.dehydrated, v !== null)) {
      if (c)
        t.flags & 256 ? (fl(t), t.flags &= -257, t = bu(
          e,
          t,
          n
        )) : t.memoizedState !== null ? (dl(), t.child = e.child, t.flags |= 128, t = null) : (dl(), v = l.fallback, i = t.mode, l = Zi(
          { mode: "visible", children: l.children },
          i
        ), v = Rl(
          v,
          i,
          n,
          null
        ), v.flags |= 2, l.return = t, v.return = t, l.sibling = v, t.child = l, Gl(
          t,
          e.child,
          null,
          n
        ), l = t.child, l.memoizedState = vu(n), l.childLanes = xu(
          e,
          h,
          n
        ), t.memoizedState = yu, t = ys(null, l));
      else if (fl(t), to(v)) {
        if (h = v.nextSibling && v.nextSibling.dataset, h) var E = h.dgst;
        h = E, l = Error(u(419)), l.stack = "", l.digest = h, ss({ value: l, source: null, stack: null }), t = bu(
          e,
          t,
          n
        );
      } else if (mt || ga(e, t, n, !1), h = (n & e.childLanes) !== 0, mt || h) {
        if (h = Ze, h !== null && (l = of(h, n), l !== 0 && l !== w.retryLane))
          throw w.retryLane = l, Dl(e, l), Yt(h, e, l), pu;
        eo(v) || tr(), t = bu(
          e,
          t,
          n
        );
      } else
        eo(v) ? (t.flags |= 192, t.child = e.child, t = null) : (e = w.treeContext, Pe = hn(
          v.nextSibling
        ), Nt = t, Oe = !0, sl = null, fn = !1, e !== null && id(t, e), t = _u(
          t,
          l.children
        ), t.flags |= 4096);
      return t;
    }
    return i ? (dl(), v = l.fallback, i = t.mode, w = e.child, E = w.sibling, l = Hn(w, {
      mode: "hidden",
      children: l.children
    }), l.subtreeFlags = w.subtreeFlags & 65011712, E !== null ? v = Hn(
      E,
      v
    ) : (v = Rl(
      v,
      i,
      n,
      null
    ), v.flags |= 2), v.return = t, l.return = t, l.sibling = v, t.child = l, ys(null, l), l = t.child, v = e.child.memoizedState, v === null ? v = vu(n) : (i = v.cachePool, i !== null ? (w = dt._currentValue, i = i.parent !== w ? { parent: w, pool: w } : i) : i = dd(), v = {
      baseLanes: v.baseLanes | n,
      cachePool: i
    }), l.memoizedState = v, l.childLanes = xu(
      e,
      h,
      n
    ), t.memoizedState = yu, ys(e.child, l)) : (fl(t), n = e.child, e = n.sibling, n = Hn(n, {
      mode: "visible",
      children: l.children
    }), n.return = t, n.sibling = null, e !== null && (h = t.deletions, h === null ? (t.deletions = [e], t.flags |= 16) : h.push(e)), t.child = n, t.memoizedState = null, n);
  }
  function _u(e, t) {
    return t = Zi(
      { mode: "visible", children: t },
      e.mode
    ), t.return = e, e.child = t;
  }
  function Zi(e, t) {
    return e = $t(22, e, null, t), e.lanes = 0, e;
  }
  function bu(e, t, n) {
    return Gl(t, e.child, null, n), e = _u(
      t,
      t.pendingProps.children
    ), e.flags |= 2, t.memoizedState = null, e;
  }
  function Nh(e, t, n) {
    e.lanes |= t;
    var l = e.alternate;
    l !== null && (l.lanes |= t), Hc(e.return, t, n);
  }
  function wu(e, t, n, l, i, c) {
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
  function Mh(e, t, n) {
    var l = t.pendingProps, i = l.revealOrder, c = l.tail;
    l = l.children;
    var h = ct.current, v = (h & 2) !== 0;
    if (v ? (h = h & 1 | 2, t.flags |= 128) : h &= 1, V(ct, h), Tt(e, t, l, n), l = Oe ? as : 0, !v && e !== null && (e.flags & 128) !== 0)
      e: for (e = t.child; e !== null; ) {
        if (e.tag === 13)
          e.memoizedState !== null && Nh(e, n, t);
        else if (e.tag === 19)
          Nh(e, n, t);
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
          e = n.alternate, e !== null && Di(e) === null && (i = n), n = n.sibling;
        n = i, n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), wu(
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
          if (e = i.alternate, e !== null && Di(e) === null) {
            t.child = i;
            break;
          }
          e = i.sibling, i.sibling = n, n = i, i = e;
        }
        wu(
          t,
          !0,
          n,
          null,
          c,
          l
        );
        break;
      case "together":
        wu(
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
  function Gn(e, t, n) {
    if (e !== null && (t.dependencies = e.dependencies), pl |= t.lanes, (n & t.childLanes) === 0)
      if (e !== null) {
        if (ga(
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
      for (e = t.child, n = Hn(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; )
        e = e.sibling, n = n.sibling = Hn(e, e.pendingProps), n.return = t;
      n.sibling = null;
    }
    return t.child;
  }
  function Su(e, t) {
    return (e.lanes & t) !== 0 ? !0 : (e = e.dependencies, !!(e !== null && Mi(e)));
  }
  function wy(e, t, n) {
    switch (t.tag) {
      case 3:
        Te(t, t.stateNode.containerInfo), rl(t, dt, e.memoizedState.cache), Hl();
        break;
      case 27:
      case 5:
        vt(t);
        break;
      case 4:
        Te(t, t.stateNode.containerInfo);
        break;
      case 10:
        rl(
          t,
          t.type,
          t.memoizedProps.value
        );
        break;
      case 31:
        if (t.memoizedState !== null)
          return t.flags |= 128, Jc(t), null;
        break;
      case 13:
        var l = t.memoizedState;
        if (l !== null)
          return l.dehydrated !== null ? (fl(t), t.flags |= 128, null) : (n & t.child.childLanes) !== 0 ? jh(e, t, n) : (fl(t), e = Gn(
            e,
            t,
            n
          ), e !== null ? e.sibling : null);
        fl(t);
        break;
      case 19:
        var i = (e.flags & 128) !== 0;
        if (l = (n & t.childLanes) !== 0, l || (ga(
          e,
          t,
          n,
          !1
        ), l = (n & t.childLanes) !== 0), i) {
          if (l)
            return Mh(
              e,
              t,
              n
            );
          t.flags |= 128;
        }
        if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), V(ct, ct.current), l) break;
        return null;
      case 22:
        return t.lanes = 0, vh(
          e,
          t,
          n,
          t.pendingProps
        );
      case 24:
        rl(t, dt, e.memoizedState.cache);
    }
    return Gn(e, t, n);
  }
  function Th(e, t, n) {
    if (e !== null)
      if (e.memoizedProps !== t.pendingProps)
        mt = !0;
      else {
        if (!Su(e, n) && (t.flags & 128) === 0)
          return mt = !1, wy(
            e,
            t,
            n
          );
        mt = (e.flags & 131072) !== 0;
      }
    else
      mt = !1, Oe && (t.flags & 1048576) !== 0 && sd(t, as, t.index);
    switch (t.lanes = 0, t.tag) {
      case 16:
        e: {
          var l = t.pendingProps;
          if (e = ql(t.elementType), t.type = e, typeof e == "function")
            Ec(e) ? (l = Xl(e, l), t.tag = 1, t = wh(
              null,
              t,
              e,
              l,
              n
            )) : (t.tag = 0, t = gu(
              null,
              t,
              e,
              l,
              n
            ));
          else {
            if (e != null) {
              var i = e.$$typeof;
              if (i === X) {
                t.tag = 11, t = ph(
                  null,
                  t,
                  e,
                  l,
                  n
                );
                break e;
              } else if (i === Z) {
                t.tag = 14, t = gh(
                  null,
                  t,
                  e,
                  l,
                  n
                );
                break e;
              }
            }
            throw t = K(e) || e, Error(u(306, t, ""));
          }
        }
        return t;
      case 0:
        return gu(
          e,
          t,
          t.type,
          t.pendingProps,
          n
        );
      case 1:
        return l = t.type, i = Xl(
          l,
          t.pendingProps
        ), wh(
          e,
          t,
          l,
          i,
          n
        );
      case 3:
        e: {
          if (Te(
            t,
            t.stateNode.containerInfo
          ), e === null) throw Error(u(387));
          l = t.pendingProps;
          var c = t.memoizedState;
          i = c.element, Vc(e, t), ds(t, l, null, n);
          var h = t.memoizedState;
          if (l = h.cache, rl(t, dt, l), l !== c.cache && Uc(
            t,
            [dt],
            n,
            !0
          ), fs(), l = h.element, c.isDehydrated)
            if (c = {
              element: l,
              isDehydrated: !1,
              cache: h.cache
            }, t.updateQueue.baseState = c, t.memoizedState = c, t.flags & 256) {
              t = Sh(
                e,
                t,
                l,
                n
              );
              break e;
            } else if (l !== i) {
              i = cn(
                Error(u(424)),
                t
              ), ss(i), t = Sh(
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
              for (Pe = hn(e.firstChild), Nt = t, Oe = !0, sl = null, fn = !0, n = vd(
                t,
                null,
                l,
                n
              ), t.child = n; n; )
                n.flags = n.flags & -3 | 4096, n = n.sibling;
            }
          else {
            if (Hl(), l === i) {
              t = Gn(
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
        return Qi(e, t), e === null ? (n = Lm(
          t.type,
          null,
          t.pendingProps,
          null
        )) ? t.memoizedState = n : Oe || (n = t.type, e = t.pendingProps, l = cr(
          ye.current
        ).createElement(n), l[jt] = t, l[Rt] = e, Et(l, n, e), _t(l), t.stateNode = l) : t.memoizedState = Lm(
          t.type,
          e.memoizedProps,
          t.pendingProps,
          e.memoizedState
        ), null;
      case 27:
        return vt(t), e === null && Oe && (l = t.stateNode = Rm(
          t.type,
          t.pendingProps,
          ye.current
        ), Nt = t, fn = !0, i = Pe, _l(t.type) ? (no = i, Pe = hn(l.firstChild)) : Pe = i), Tt(
          e,
          t,
          t.pendingProps.children,
          n
        ), Qi(e, t), e === null && (t.flags |= 4194304), t.child;
      case 5:
        return e === null && Oe && ((i = l = Pe) && (l = Iy(
          l,
          t.type,
          t.pendingProps,
          fn
        ), l !== null ? (t.stateNode = l, Nt = t, Pe = hn(l.firstChild), fn = !1, i = !0) : i = !1), i || il(t)), vt(t), i = t.type, c = t.pendingProps, h = e !== null ? e.memoizedProps : null, l = c.children, Fu(i, c) ? l = null : h !== null && Fu(i, h) && (t.flags |= 32), t.memoizedState !== null && (i = Wc(
          e,
          t,
          hy,
          null,
          null,
          n
        ), Os._currentValue = i), Qi(e, t), Tt(e, t, l, n), t.child;
      case 6:
        return e === null && Oe && ((e = n = Pe) && (n = Py(
          n,
          t.pendingProps,
          fn
        ), n !== null ? (t.stateNode = n, Nt = t, Pe = null, e = !0) : e = !1), e || il(t)), null;
      case 13:
        return jh(e, t, n);
      case 4:
        return Te(
          t,
          t.stateNode.containerInfo
        ), l = t.pendingProps, e === null ? t.child = Gl(
          t,
          null,
          l,
          n
        ) : Tt(e, t, l, n), t.child;
      case 11:
        return ph(
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
        return l = t.pendingProps, rl(t, t.type, l.value), Tt(e, t, l.children, n), t.child;
      case 9:
        return i = t.type._context, l = t.pendingProps.children, Ll(t), i = Mt(i), l = l(i), t.flags |= 1, Tt(e, t, l, n), t.child;
      case 14:
        return gh(
          e,
          t,
          t.type,
          t.pendingProps,
          n
        );
      case 15:
        return yh(
          e,
          t,
          t.type,
          t.pendingProps,
          n
        );
      case 19:
        return Mh(e, t, n);
      case 31:
        return by(e, t, n);
      case 22:
        return vh(
          e,
          t,
          n,
          t.pendingProps
        );
      case 24:
        return Ll(t), l = Mt(dt), e === null ? (i = qc(), i === null && (i = Ze, c = Lc(), i.pooledCache = c, c.refCount++, c !== null && (i.pooledCacheLanes |= n), i = c), t.memoizedState = { parent: l, cache: i }, Gc(t), rl(t, dt, i)) : ((e.lanes & n) !== 0 && (Vc(e, t), ds(t, null, null, n), fs()), i = e.memoizedState, c = t.memoizedState, i.parent !== l ? (i = { parent: l, cache: l }, t.memoizedState = i, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = i), rl(t, dt, l)) : (l = c.cache, rl(t, dt, l), l !== i.cache && Uc(
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
  function ju(e, t, n, l, i) {
    if ((t = (e.mode & 32) !== 0) && (t = !1), t) {
      if (e.flags |= 16777216, (i & 335544128) === i)
        if (e.stateNode.complete) e.flags |= 8192;
        else if (em()) e.flags |= 8192;
        else
          throw Yl = Ci, Yc;
    } else e.flags &= -16777217;
  }
  function Eh(e, t) {
    if (t.type !== "stylesheet" || (t.state.loading & 4) !== 0)
      e.flags &= -16777217;
    else if (e.flags |= 16777216, !Vm(t))
      if (em()) e.flags |= 8192;
      else
        throw Yl = Ci, Yc;
  }
  function Ki(e, t) {
    t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag !== 22 ? rf() : 536870912, e.lanes |= t, Ea |= t);
  }
  function vs(e, t) {
    if (!Oe)
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
  function Sy(e, t, n) {
    var l = t.pendingProps;
    switch (Oc(t), t.tag) {
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
        return n = t.stateNode, l = null, e !== null && (l = e.memoizedState.cache), t.memoizedState.cache !== l && (t.flags |= 2048), Bn(dt), xe(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (pa(t) ? Vn(t) : e === null || e.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024, Dc())), et(t), null;
      case 26:
        var i = t.type, c = t.memoizedState;
        return e === null ? (Vn(t), c !== null ? (et(t), Eh(t, c)) : (et(t), ju(
          t,
          i,
          null,
          l,
          n
        ))) : c ? c !== e.memoizedState ? (Vn(t), et(t), Eh(t, c)) : (et(t), t.flags &= -16777217) : (e = e.memoizedProps, e !== l && Vn(t), et(t), ju(
          t,
          i,
          e,
          l,
          n
        )), null;
      case 27:
        if (At(t), n = ye.current, i = t.type, e !== null && t.stateNode != null)
          e.memoizedProps !== l && Vn(t);
        else {
          if (!l) {
            if (t.stateNode === null)
              throw Error(u(166));
            return et(t), null;
          }
          e = I.current, pa(t) ? rd(t) : (e = Rm(i, l, n), t.stateNode = e, Vn(t));
        }
        return et(t), null;
      case 5:
        if (At(t), i = t.type, e !== null && t.stateNode != null)
          e.memoizedProps !== l && Vn(t);
        else {
          if (!l) {
            if (t.stateNode === null)
              throw Error(u(166));
            return et(t), null;
          }
          if (c = I.current, pa(t))
            rd(t);
          else {
            var h = cr(
              ye.current
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
            c[jt] = t, c[Rt] = l;
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
        return et(t), ju(
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
          if (e = ye.current, pa(t)) {
            if (e = t.stateNode, n = t.memoizedProps, l = null, i = Nt, i !== null)
              switch (i.tag) {
                case 27:
                case 5:
                  l = i.memoizedProps;
              }
            e[jt] = t, e = !!(e.nodeValue === n || l !== null && l.suppressHydrationWarning === !0 || jm(e.nodeValue, n)), e || il(t, !0);
          } else
            e = cr(e).createTextNode(
              l
            ), e[jt] = t, t.stateNode = e;
        }
        return et(t), null;
      case 31:
        if (n = t.memoizedState, e === null || e.memoizedState !== null) {
          if (l = pa(t), n !== null) {
            if (e === null) {
              if (!l) throw Error(u(318));
              if (e = t.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(u(557));
              e[jt] = t;
            } else
              Hl(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            et(t), e = !1;
          } else
            n = Dc(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
          if (!e)
            return t.flags & 256 ? (Ft(t), t) : (Ft(t), null);
          if ((t.flags & 128) !== 0)
            throw Error(u(558));
        }
        return et(t), null;
      case 13:
        if (l = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
          if (i = pa(t), l !== null && l.dehydrated !== null) {
            if (e === null) {
              if (!i) throw Error(u(318));
              if (i = t.memoizedState, i = i !== null ? i.dehydrated : null, !i) throw Error(u(317));
              i[jt] = t;
            } else
              Hl(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            et(t), i = !1;
          } else
            i = Dc(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = i), i = !0;
          if (!i)
            return t.flags & 256 ? (Ft(t), t) : (Ft(t), null);
        }
        return Ft(t), (t.flags & 128) !== 0 ? (t.lanes = n, t) : (n = l !== null, e = e !== null && e.memoizedState !== null, n && (l = t.child, i = null, l.alternate !== null && l.alternate.memoizedState !== null && l.alternate.memoizedState.cachePool !== null && (i = l.alternate.memoizedState.cachePool.pool), c = null, l.memoizedState !== null && l.memoizedState.cachePool !== null && (c = l.memoizedState.cachePool.pool), c !== i && (l.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), Ki(t, t.updateQueue), et(t), null);
      case 4:
        return xe(), e === null && Zu(t.stateNode.containerInfo), et(t), null;
      case 10:
        return Bn(t.type), et(t), null;
      case 19:
        if (O(ct), l = t.memoizedState, l === null) return et(t), null;
        if (i = (t.flags & 128) !== 0, c = l.rendering, c === null)
          if (i) vs(l, !1);
          else {
            if (it !== 0 || e !== null && (e.flags & 128) !== 0)
              for (e = t.child; e !== null; ) {
                if (c = Di(e), c !== null) {
                  for (t.flags |= 128, vs(l, !1), e = c.updateQueue, t.updateQueue = e, Ki(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null; )
                    nd(n, e), n = n.sibling;
                  return V(
                    ct,
                    ct.current & 1 | 2
                  ), Oe && Un(t, l.treeForkCount), t.child;
                }
                e = e.sibling;
              }
            l.tail !== null && Fe() > Ii && (t.flags |= 128, i = !0, vs(l, !1), t.lanes = 4194304);
          }
        else {
          if (!i)
            if (e = Di(c), e !== null) {
              if (t.flags |= 128, i = !0, e = e.updateQueue, t.updateQueue = e, Ki(t, e), vs(l, !0), l.tail === null && l.tailMode === "hidden" && !c.alternate && !Oe)
                return et(t), null;
            } else
              2 * Fe() - l.renderingStartTime > Ii && n !== 536870912 && (t.flags |= 128, i = !0, vs(l, !1), t.lanes = 4194304);
          l.isBackwards ? (c.sibling = t.child, t.child = c) : (e = l.last, e !== null ? e.sibling = c : t.child = c, l.last = c);
        }
        return l.tail !== null ? (e = l.tail, l.rendering = e, l.tail = e.sibling, l.renderingStartTime = Fe(), e.sibling = null, n = ct.current, V(
          ct,
          i ? n & 1 | 2 : n & 1
        ), Oe && Un(t, l.treeForkCount), e) : (et(t), null);
      case 22:
      case 23:
        return Ft(t), Kc(), l = t.memoizedState !== null, e !== null ? e.memoizedState !== null !== l && (t.flags |= 8192) : l && (t.flags |= 8192), l ? (n & 536870912) !== 0 && (t.flags & 128) === 0 && (et(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : et(t), n = t.updateQueue, n !== null && Ki(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), l = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (l = t.memoizedState.cachePool.pool), l !== n && (t.flags |= 2048), e !== null && O(Bl), null;
      case 24:
        return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), Bn(dt), et(t), null;
      case 25:
        return null;
      case 30:
        return null;
    }
    throw Error(u(156, t.tag));
  }
  function jy(e, t) {
    switch (Oc(t), t.tag) {
      case 1:
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 3:
        return Bn(dt), xe(), e = t.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (t.flags = e & -65537 | 128, t) : null;
      case 26:
      case 27:
      case 5:
        return At(t), null;
      case 31:
        if (t.memoizedState !== null) {
          if (Ft(t), t.alternate === null)
            throw Error(u(340));
          Hl();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 13:
        if (Ft(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
          if (t.alternate === null)
            throw Error(u(340));
          Hl();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 19:
        return O(ct), null;
      case 4:
        return xe(), null;
      case 10:
        return Bn(t.type), null;
      case 22:
      case 23:
        return Ft(t), Kc(), e !== null && O(Bl), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 24:
        return Bn(dt), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function Ah(e, t) {
    switch (Oc(t), t.tag) {
      case 3:
        Bn(dt), xe();
        break;
      case 26:
      case 27:
      case 5:
        At(t);
        break;
      case 4:
        xe();
        break;
      case 31:
        t.memoizedState !== null && Ft(t);
        break;
      case 13:
        Ft(t);
        break;
      case 19:
        O(ct);
        break;
      case 10:
        Bn(t.type);
        break;
      case 22:
      case 23:
        Ft(t), Kc(), e !== null && O(Bl);
        break;
      case 24:
        Bn(dt);
    }
  }
  function xs(e, t) {
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
  function hl(e, t, n) {
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
              var w = n, E = v;
              try {
                E();
              } catch (U) {
                Ge(
                  i,
                  w,
                  U
                );
              }
            }
          }
          l = l.next;
        } while (l !== c);
      }
    } catch (U) {
      Ge(t, t.return, U);
    }
  }
  function Ch(e) {
    var t = e.updateQueue;
    if (t !== null) {
      var n = e.stateNode;
      try {
        _d(t, n);
      } catch (l) {
        Ge(e, e.return, l);
      }
    }
  }
  function zh(e, t, n) {
    n.props = Xl(
      e.type,
      e.memoizedProps
    ), n.state = e.memoizedState;
    try {
      n.componentWillUnmount();
    } catch (l) {
      Ge(e, t, l);
    }
  }
  function _s(e, t) {
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
  function Tn(e, t) {
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
  function Oh(e) {
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
  function Nu(e, t, n) {
    try {
      var l = e.stateNode;
      Zy(l, e.type, n, t), l[Rt] = t;
    } catch (i) {
      Ge(e, e.return, i);
    }
  }
  function kh(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && _l(e.type) || e.tag === 4;
  }
  function Mu(e) {
    e: for (; ; ) {
      for (; e.sibling === null; ) {
        if (e.return === null || kh(e.return)) return null;
        e = e.return;
      }
      for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
        if (e.tag === 27 && _l(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue e;
        e.child.return = e, e = e.child;
      }
      if (!(e.flags & 2)) return e.stateNode;
    }
  }
  function Tu(e, t, n) {
    var l = e.tag;
    if (l === 5 || l === 6)
      e = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(e, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(e), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Dn));
    else if (l !== 4 && (l === 27 && _l(e.type) && (n = e.stateNode, t = null), e = e.child, e !== null))
      for (Tu(e, t, n), e = e.sibling; e !== null; )
        Tu(e, t, n), e = e.sibling;
  }
  function Ji(e, t, n) {
    var l = e.tag;
    if (l === 5 || l === 6)
      e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
    else if (l !== 4 && (l === 27 && _l(e.type) && (n = e.stateNode), e = e.child, e !== null))
      for (Ji(e, t, n), e = e.sibling; e !== null; )
        Ji(e, t, n), e = e.sibling;
  }
  function Dh(e) {
    var t = e.stateNode, n = e.memoizedProps;
    try {
      for (var l = e.type, i = t.attributes; i.length; )
        t.removeAttributeNode(i[0]);
      Et(t, l, n), t[jt] = e, t[Rt] = n;
    } catch (c) {
      Ge(e, e.return, c);
    }
  }
  var Xn = !1, pt = !1, Eu = !1, Rh = typeof WeakSet == "function" ? WeakSet : Set, bt = null;
  function Ny(e, t) {
    if (e = e.containerInfo, $u = pr, e = Kf(e), bc(e)) {
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
            var h = 0, v = -1, w = -1, E = 0, U = 0, B = e, C = null;
            t: for (; ; ) {
              for (var k; B !== n || i !== 0 && B.nodeType !== 3 || (v = h + i), B !== c || l !== 0 && B.nodeType !== 3 || (w = h + l), B.nodeType === 3 && (h += B.nodeValue.length), (k = B.firstChild) !== null; )
                C = B, B = k;
              for (; ; ) {
                if (B === e) break t;
                if (C === n && ++E === i && (v = h), C === c && ++U === l && (w = h), (k = B.nextSibling) !== null) break;
                B = C, C = B.parentNode;
              }
              B = k;
            }
            n = v === -1 || w === -1 ? null : { start: v, end: w };
          } else n = null;
        }
      n = n || { start: 0, end: 0 };
    } else n = null;
    for (Wu = { focusedElem: e, selectionRange: n }, pr = !1, bt = t; bt !== null; )
      if (t = bt, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null)
        e.return = t, bt = e;
      else
        for (; bt !== null; ) {
          switch (t = bt, c = t.alternate, e = t.flags, t.tag) {
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
                  var te = Xl(
                    n.type,
                    i
                  );
                  e = l.getSnapshotBeforeUpdate(
                    te,
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
                  Pu(e);
                else if (n === 1)
                  switch (e.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      Pu(e);
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
            e.return = t.return, bt = e;
            break;
          }
          bt = t.return;
        }
  }
  function Hh(e, t, n) {
    var l = n.flags;
    switch (n.tag) {
      case 0:
      case 11:
      case 15:
        Zn(e, n), l & 4 && xs(5, n);
        break;
      case 1:
        if (Zn(e, n), l & 4)
          if (e = n.stateNode, t === null)
            try {
              e.componentDidMount();
            } catch (h) {
              Ge(n, n.return, h);
            }
          else {
            var i = Xl(
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
        l & 64 && Ch(n), l & 512 && _s(n, n.return);
        break;
      case 3:
        if (Zn(e, n), l & 64 && (e = n.updateQueue, e !== null)) {
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
            _d(e, t);
          } catch (h) {
            Ge(n, n.return, h);
          }
        }
        break;
      case 27:
        t === null && l & 4 && Dh(n);
      case 26:
      case 5:
        Zn(e, n), t === null && l & 4 && Oh(n), l & 512 && _s(n, n.return);
        break;
      case 12:
        Zn(e, n);
        break;
      case 31:
        Zn(e, n), l & 4 && Bh(e, n);
        break;
      case 13:
        Zn(e, n), l & 4 && qh(e, n), l & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = Dy.bind(
          null,
          n
        ), e1(e, n))));
        break;
      case 22:
        if (l = n.memoizedState !== null || Xn, !l) {
          t = t !== null && t.memoizedState !== null || pt, i = Xn;
          var c = pt;
          Xn = l, (pt = t) && !c ? Kn(
            e,
            n,
            (n.subtreeFlags & 8772) !== 0
          ) : Zn(e, n), Xn = i, pt = c;
        }
        break;
      case 30:
        break;
      default:
        Zn(e, n);
    }
  }
  function Uh(e) {
    var t = e.alternate;
    t !== null && (e.alternate = null, Uh(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && ac(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
  }
  var nt = null, Ut = !1;
  function Qn(e, t, n) {
    for (n = n.child; n !== null; )
      Lh(e, t, n), n = n.sibling;
  }
  function Lh(e, t, n) {
    if (ke && typeof ke.onCommitFiberUnmount == "function")
      try {
        ke.onCommitFiberUnmount(we, n);
      } catch {
      }
    switch (n.tag) {
      case 26:
        pt || Tn(n, t), Qn(
          e,
          t,
          n
        ), n.memoizedState ? n.memoizedState.count-- : n.stateNode && (n = n.stateNode, n.parentNode.removeChild(n));
        break;
      case 27:
        pt || Tn(n, t);
        var l = nt, i = Ut;
        _l(n.type) && (nt = n.stateNode, Ut = !1), Qn(
          e,
          t,
          n
        ), As(n.stateNode), nt = l, Ut = i;
        break;
      case 5:
        pt || Tn(n, t);
      case 6:
        if (l = nt, i = Ut, nt = null, Qn(
          e,
          t,
          n
        ), nt = l, Ut = i, nt !== null)
          if (Ut)
            try {
              (nt.nodeType === 9 ? nt.body : nt.nodeName === "HTML" ? nt.ownerDocument.body : nt).removeChild(n.stateNode);
            } catch (c) {
              Ge(
                n,
                t,
                c
              );
            }
          else
            try {
              nt.removeChild(n.stateNode);
            } catch (c) {
              Ge(
                n,
                t,
                c
              );
            }
        break;
      case 18:
        nt !== null && (Ut ? (e = nt, Cm(
          e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e,
          n.stateNode
        ), Ha(e)) : Cm(nt, n.stateNode));
        break;
      case 4:
        l = nt, i = Ut, nt = n.stateNode.containerInfo, Ut = !0, Qn(
          e,
          t,
          n
        ), nt = l, Ut = i;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        hl(2, n, t), pt || hl(4, n, t), Qn(
          e,
          t,
          n
        );
        break;
      case 1:
        pt || (Tn(n, t), l = n.stateNode, typeof l.componentWillUnmount == "function" && zh(
          n,
          t,
          l
        )), Qn(
          e,
          t,
          n
        );
        break;
      case 21:
        Qn(
          e,
          t,
          n
        );
        break;
      case 22:
        pt = (l = pt) || n.memoizedState !== null, Qn(
          e,
          t,
          n
        ), pt = l;
        break;
      default:
        Qn(
          e,
          t,
          n
        );
    }
  }
  function Bh(e, t) {
    if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
      e = e.dehydrated;
      try {
        Ha(e);
      } catch (n) {
        Ge(t, t.return, n);
      }
    }
  }
  function qh(e, t) {
    if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null))))
      try {
        Ha(e);
      } catch (n) {
        Ge(t, t.return, n);
      }
  }
  function My(e) {
    switch (e.tag) {
      case 31:
      case 13:
      case 19:
        var t = e.stateNode;
        return t === null && (t = e.stateNode = new Rh()), t;
      case 22:
        return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new Rh()), t;
      default:
        throw Error(u(435, e.tag));
    }
  }
  function $i(e, t) {
    var n = My(e);
    t.forEach(function(l) {
      if (!n.has(l)) {
        n.add(l);
        var i = Ry.bind(null, e, l);
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
              if (_l(v.type)) {
                nt = v.stateNode, Ut = !1;
                break e;
              }
              break;
            case 5:
              nt = v.stateNode, Ut = !1;
              break e;
            case 3:
            case 4:
              nt = v.stateNode.containerInfo, Ut = !0;
              break e;
          }
          v = v.return;
        }
        if (nt === null) throw Error(u(160));
        Lh(c, h, i), nt = null, Ut = !1, c = i.alternate, c !== null && (c.return = null), i.return = null;
      }
    if (t.subtreeFlags & 13886)
      for (t = t.child; t !== null; )
        Yh(t, e), t = t.sibling;
  }
  var gn = null;
  function Yh(e, t) {
    var n = e.alternate, l = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        Lt(t, e), Bt(e), l & 4 && (hl(3, e, e.return), xs(3, e), hl(5, e, e.return));
        break;
      case 1:
        Lt(t, e), Bt(e), l & 512 && (pt || n === null || Tn(n, n.return)), l & 64 && Xn && (e = e.updateQueue, e !== null && (l = e.callbacks, l !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? l : n.concat(l))));
        break;
      case 26:
        var i = gn;
        if (Lt(t, e), Bt(e), l & 512 && (pt || n === null || Tn(n, n.return)), l & 4) {
          var c = n !== null ? n.memoizedState : null;
          if (l = e.memoizedState, n === null)
            if (l === null)
              if (e.stateNode === null) {
                e: {
                  l = e.type, n = e.memoizedProps, i = i.ownerDocument || i;
                  t: switch (l) {
                    case "title":
                      c = i.getElementsByTagName("title")[0], (!c || c[Ka] || c[jt] || c.namespaceURI === "http://www.w3.org/2000/svg" || c.hasAttribute("itemprop")) && (c = i.createElement(l), i.head.insertBefore(
                        c,
                        i.querySelector("head > title")
                      )), Et(c, l, n), c[jt] = e, _t(c), l = c;
                      break e;
                    case "link":
                      var h = Ym(
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
                      if (h = Ym(
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
                  c[jt] = e, _t(c), l = c;
                }
                e.stateNode = l;
              } else
                Gm(
                  i,
                  e.type,
                  e.stateNode
                );
            else
              e.stateNode = qm(
                i,
                l,
                e.memoizedProps
              );
          else
            c !== l ? (c === null ? n.stateNode !== null && (n = n.stateNode, n.parentNode.removeChild(n)) : c.count--, l === null ? Gm(
              i,
              e.type,
              e.stateNode
            ) : qm(
              i,
              l,
              e.memoizedProps
            )) : l === null && e.stateNode !== null && Nu(
              e,
              e.memoizedProps,
              n.memoizedProps
            );
        }
        break;
      case 27:
        Lt(t, e), Bt(e), l & 512 && (pt || n === null || Tn(n, n.return)), n !== null && l & 4 && Nu(
          e,
          e.memoizedProps,
          n.memoizedProps
        );
        break;
      case 5:
        if (Lt(t, e), Bt(e), l & 512 && (pt || n === null || Tn(n, n.return)), e.flags & 32) {
          i = e.stateNode;
          try {
            sa(i, "");
          } catch (te) {
            Ge(e, e.return, te);
          }
        }
        l & 4 && e.stateNode != null && (i = e.memoizedProps, Nu(
          e,
          i,
          n !== null ? n.memoizedProps : i
        )), l & 1024 && (Eu = !0);
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
        if (fr = null, i = gn, gn = ur(t.containerInfo), Lt(t, e), gn = i, Bt(e), l & 4 && n !== null && n.memoizedState.isDehydrated)
          try {
            Ha(t.containerInfo);
          } catch (te) {
            Ge(e, e.return, te);
          }
        Eu && (Eu = !1, Gh(e));
        break;
      case 4:
        l = gn, gn = ur(
          e.stateNode.containerInfo
        ), Lt(t, e), Bt(e), gn = l;
        break;
      case 12:
        Lt(t, e), Bt(e);
        break;
      case 31:
        Lt(t, e), Bt(e), l & 4 && (l = e.updateQueue, l !== null && (e.updateQueue = null, $i(e, l)));
        break;
      case 13:
        Lt(t, e), Bt(e), e.child.flags & 8192 && e.memoizedState !== null != (n !== null && n.memoizedState !== null) && (Fi = Fe()), l & 4 && (l = e.updateQueue, l !== null && (e.updateQueue = null, $i(e, l)));
        break;
      case 22:
        i = e.memoizedState !== null;
        var w = n !== null && n.memoizedState !== null, E = Xn, U = pt;
        if (Xn = E || i, pt = U || w, Lt(t, e), pt = U, Xn = E, Bt(e), l & 8192)
          e: for (t = e.stateNode, t._visibility = i ? t._visibility & -2 : t._visibility | 1, i && (n === null || w || Xn || pt || Ql(e)), n = null, t = e; ; ) {
            if (t.tag === 5 || t.tag === 26) {
              if (n === null) {
                w = n = t;
                try {
                  if (c = w.stateNode, i)
                    h = c.style, typeof h.setProperty == "function" ? h.setProperty("display", "none", "important") : h.display = "none";
                  else {
                    v = w.stateNode;
                    var B = w.memoizedProps.style, C = B != null && B.hasOwnProperty("display") ? B.display : null;
                    v.style.display = C == null || typeof C == "boolean" ? "" : ("" + C).trim();
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
                  var k = w.stateNode;
                  i ? zm(k, !0) : zm(w.stateNode, !1);
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
        l & 4 && (l = e.updateQueue, l !== null && (n = l.retryQueue, n !== null && (l.retryQueue = null, $i(e, n))));
        break;
      case 19:
        Lt(t, e), Bt(e), l & 4 && (l = e.updateQueue, l !== null && (e.updateQueue = null, $i(e, l)));
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
          if (kh(l)) {
            n = l;
            break;
          }
          l = l.return;
        }
        if (n == null) throw Error(u(160));
        switch (n.tag) {
          case 27:
            var i = n.stateNode, c = Mu(e);
            Ji(e, c, i);
            break;
          case 5:
            var h = n.stateNode;
            n.flags & 32 && (sa(h, ""), n.flags &= -33);
            var v = Mu(e);
            Ji(e, v, h);
            break;
          case 3:
          case 4:
            var w = n.stateNode.containerInfo, E = Mu(e);
            Tu(
              e,
              E,
              w
            );
            break;
          default:
            throw Error(u(161));
        }
      } catch (U) {
        Ge(e, e.return, U);
      }
      e.flags &= -3;
    }
    t & 4096 && (e.flags &= -4097);
  }
  function Gh(e) {
    if (e.subtreeFlags & 1024)
      for (e = e.child; e !== null; ) {
        var t = e;
        Gh(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), e = e.sibling;
      }
  }
  function Zn(e, t) {
    if (t.subtreeFlags & 8772)
      for (t = t.child; t !== null; )
        Hh(e, t.alternate, t), t = t.sibling;
  }
  function Ql(e) {
    for (e = e.child; e !== null; ) {
      var t = e;
      switch (t.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          hl(4, t, t.return), Ql(t);
          break;
        case 1:
          Tn(t, t.return);
          var n = t.stateNode;
          typeof n.componentWillUnmount == "function" && zh(
            t,
            t.return,
            n
          ), Ql(t);
          break;
        case 27:
          As(t.stateNode);
        case 26:
        case 5:
          Tn(t, t.return), Ql(t);
          break;
        case 22:
          t.memoizedState === null && Ql(t);
          break;
        case 30:
          Ql(t);
          break;
        default:
          Ql(t);
      }
      e = e.sibling;
    }
  }
  function Kn(e, t, n) {
    for (n = n && (t.subtreeFlags & 8772) !== 0, t = t.child; t !== null; ) {
      var l = t.alternate, i = e, c = t, h = c.flags;
      switch (c.tag) {
        case 0:
        case 11:
        case 15:
          Kn(
            i,
            c,
            n
          ), xs(4, c);
          break;
        case 1:
          if (Kn(
            i,
            c,
            n
          ), l = c, i = l.stateNode, typeof i.componentDidMount == "function")
            try {
              i.componentDidMount();
            } catch (E) {
              Ge(l, l.return, E);
            }
          if (l = c, i = l.updateQueue, i !== null) {
            var v = l.stateNode;
            try {
              var w = i.shared.hiddenCallbacks;
              if (w !== null)
                for (i.shared.hiddenCallbacks = null, i = 0; i < w.length; i++)
                  xd(w[i], v);
            } catch (E) {
              Ge(l, l.return, E);
            }
          }
          n && h & 64 && Ch(c), _s(c, c.return);
          break;
        case 27:
          Dh(c);
        case 26:
        case 5:
          Kn(
            i,
            c,
            n
          ), n && l === null && h & 4 && Oh(c), _s(c, c.return);
          break;
        case 12:
          Kn(
            i,
            c,
            n
          );
          break;
        case 31:
          Kn(
            i,
            c,
            n
          ), n && h & 4 && Bh(i, c);
          break;
        case 13:
          Kn(
            i,
            c,
            n
          ), n && h & 4 && qh(i, c);
          break;
        case 22:
          c.memoizedState === null && Kn(
            i,
            c,
            n
          ), _s(c, c.return);
          break;
        case 30:
          break;
        default:
          Kn(
            i,
            c,
            n
          );
      }
      t = t.sibling;
    }
  }
  function Au(e, t) {
    var n = null;
    e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && is(n));
  }
  function Cu(e, t) {
    e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && is(e));
  }
  function yn(e, t, n, l) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; )
        Vh(
          e,
          t,
          n,
          l
        ), t = t.sibling;
  }
  function Vh(e, t, n, l) {
    var i = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 15:
        yn(
          e,
          t,
          n,
          l
        ), i & 2048 && xs(9, t);
        break;
      case 1:
        yn(
          e,
          t,
          n,
          l
        );
        break;
      case 3:
        yn(
          e,
          t,
          n,
          l
        ), i & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && is(e)));
        break;
      case 12:
        if (i & 2048) {
          yn(
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
          yn(
            e,
            t,
            n,
            l
          );
        break;
      case 31:
        yn(
          e,
          t,
          n,
          l
        );
        break;
      case 13:
        yn(
          e,
          t,
          n,
          l
        );
        break;
      case 23:
        break;
      case 22:
        c = t.stateNode, h = t.alternate, t.memoizedState !== null ? c._visibility & 2 ? yn(
          e,
          t,
          n,
          l
        ) : bs(e, t) : c._visibility & 2 ? yn(
          e,
          t,
          n,
          l
        ) : (c._visibility |= 2, Na(
          e,
          t,
          n,
          l,
          (t.subtreeFlags & 10256) !== 0 || !1
        )), i & 2048 && Au(h, t);
        break;
      case 24:
        yn(
          e,
          t,
          n,
          l
        ), i & 2048 && Cu(t.alternate, t);
        break;
      default:
        yn(
          e,
          t,
          n,
          l
        );
    }
  }
  function Na(e, t, n, l, i) {
    for (i = i && ((t.subtreeFlags & 10256) !== 0 || !1), t = t.child; t !== null; ) {
      var c = e, h = t, v = n, w = l, E = h.flags;
      switch (h.tag) {
        case 0:
        case 11:
        case 15:
          Na(
            c,
            h,
            v,
            w,
            i
          ), xs(8, h);
          break;
        case 23:
          break;
        case 22:
          var U = h.stateNode;
          h.memoizedState !== null ? U._visibility & 2 ? Na(
            c,
            h,
            v,
            w,
            i
          ) : bs(
            c,
            h
          ) : (U._visibility |= 2, Na(
            c,
            h,
            v,
            w,
            i
          )), i && E & 2048 && Au(
            h.alternate,
            h
          );
          break;
        case 24:
          Na(
            c,
            h,
            v,
            w,
            i
          ), i && E & 2048 && Cu(h.alternate, h);
          break;
        default:
          Na(
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
  function bs(e, t) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; ) {
        var n = e, l = t, i = l.flags;
        switch (l.tag) {
          case 22:
            bs(n, l), i & 2048 && Au(
              l.alternate,
              l
            );
            break;
          case 24:
            bs(n, l), i & 2048 && Cu(l.alternate, l);
            break;
          default:
            bs(n, l);
        }
        t = t.sibling;
      }
  }
  var ws = 8192;
  function Ma(e, t, n) {
    if (e.subtreeFlags & ws)
      for (e = e.child; e !== null; )
        Xh(
          e,
          t,
          n
        ), e = e.sibling;
  }
  function Xh(e, t, n) {
    switch (e.tag) {
      case 26:
        Ma(
          e,
          t,
          n
        ), e.flags & ws && e.memoizedState !== null && d1(
          n,
          gn,
          e.memoizedState,
          e.memoizedProps
        );
        break;
      case 5:
        Ma(
          e,
          t,
          n
        );
        break;
      case 3:
      case 4:
        var l = gn;
        gn = ur(e.stateNode.containerInfo), Ma(
          e,
          t,
          n
        ), gn = l;
        break;
      case 22:
        e.memoizedState === null && (l = e.alternate, l !== null && l.memoizedState !== null ? (l = ws, ws = 16777216, Ma(
          e,
          t,
          n
        ), ws = l) : Ma(
          e,
          t,
          n
        ));
        break;
      default:
        Ma(
          e,
          t,
          n
        );
    }
  }
  function Qh(e) {
    var t = e.alternate;
    if (t !== null && (e = t.child, e !== null)) {
      t.child = null;
      do
        t = e.sibling, e.sibling = null, e = t;
      while (e !== null);
    }
  }
  function Ss(e) {
    var t = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (t !== null)
        for (var n = 0; n < t.length; n++) {
          var l = t[n];
          bt = l, Kh(
            l,
            e
          );
        }
      Qh(e);
    }
    if (e.subtreeFlags & 10256)
      for (e = e.child; e !== null; )
        Zh(e), e = e.sibling;
  }
  function Zh(e) {
    switch (e.tag) {
      case 0:
      case 11:
      case 15:
        Ss(e), e.flags & 2048 && hl(9, e, e.return);
        break;
      case 3:
        Ss(e);
        break;
      case 12:
        Ss(e);
        break;
      case 22:
        var t = e.stateNode;
        e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Wi(e)) : Ss(e);
        break;
      default:
        Ss(e);
    }
  }
  function Wi(e) {
    var t = e.deletions;
    if ((e.flags & 16) !== 0) {
      if (t !== null)
        for (var n = 0; n < t.length; n++) {
          var l = t[n];
          bt = l, Kh(
            l,
            e
          );
        }
      Qh(e);
    }
    for (e = e.child; e !== null; ) {
      switch (t = e, t.tag) {
        case 0:
        case 11:
        case 15:
          hl(8, t, t.return), Wi(t);
          break;
        case 22:
          n = t.stateNode, n._visibility & 2 && (n._visibility &= -3, Wi(t));
          break;
        default:
          Wi(t);
      }
      e = e.sibling;
    }
  }
  function Kh(e, t) {
    for (; bt !== null; ) {
      var n = bt;
      switch (n.tag) {
        case 0:
        case 11:
        case 15:
          hl(8, n, t);
          break;
        case 23:
        case 22:
          if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
            var l = n.memoizedState.cachePool.pool;
            l != null && l.refCount++;
          }
          break;
        case 24:
          is(n.memoizedState.cache);
      }
      if (l = n.child, l !== null) l.return = n, bt = l;
      else
        e: for (n = e; bt !== null; ) {
          l = bt;
          var i = l.sibling, c = l.return;
          if (Uh(l), l === n) {
            bt = null;
            break e;
          }
          if (i !== null) {
            i.return = c, bt = i;
            break e;
          }
          bt = c;
        }
    }
  }
  var Ty = {
    getCacheForType: function(e) {
      var t = Mt(dt), n = t.data.get(e);
      return n === void 0 && (n = e(), t.data.set(e, n)), n;
    },
    cacheSignal: function() {
      return Mt(dt).controller.signal;
    }
  }, Ey = typeof WeakMap == "function" ? WeakMap : Map, Le = 0, Ze = null, Ee = null, Ce = 0, Ye = 0, It = null, ml = !1, Ta = !1, zu = !1, Jn = 0, it = 0, pl = 0, Zl = 0, Ou = 0, Pt = 0, Ea = 0, js = null, qt = null, ku = !1, Fi = 0, Jh = 0, Ii = 1 / 0, Pi = null, gl = null, yt = 0, yl = null, Aa = null, $n = 0, Du = 0, Ru = null, $h = null, Ns = 0, Hu = null;
  function en() {
    return (Le & 2) !== 0 && Ce !== 0 ? Ce & -Ce : A.T !== null ? Gu() : ff();
  }
  function Wh() {
    if (Pt === 0)
      if ((Ce & 536870912) === 0 || Oe) {
        var e = Qa;
        Qa <<= 1, (Qa & 3932160) === 0 && (Qa = 262144), Pt = e;
      } else Pt = 536870912;
    return e = Wt.current, e !== null && (e.flags |= 32), Pt;
  }
  function Yt(e, t, n) {
    (e === Ze && (Ye === 2 || Ye === 9) || e.cancelPendingCommit !== null) && (Ca(e, 0), vl(
      e,
      Ce,
      Pt,
      !1
    )), Za(e, n), ((Le & 2) === 0 || e !== Ze) && (e === Ze && ((Le & 2) === 0 && (Zl |= n), it === 4 && vl(
      e,
      Ce,
      Pt,
      !1
    )), En(e));
  }
  function Fh(e, t, n) {
    if ((Le & 6) !== 0) throw Error(u(327));
    var l = !n && (t & 127) === 0 && (t & e.expiredLanes) === 0 || Kt(e, t), i = l ? zy(e, t) : Lu(e, t, !0), c = l;
    do {
      if (i === 0) {
        Ta && !l && vl(e, t, 0, !1);
        break;
      } else {
        if (n = e.current.alternate, c && !Ay(n)) {
          i = Lu(e, t, !1), c = !1;
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
              i = js;
              var w = v.current.memoizedState.isDehydrated;
              if (w && (Ca(v, h).flags |= 256), h = Lu(
                v,
                h,
                !1
              ), h !== 2) {
                if (zu && !w) {
                  v.errorRecoveryDisabledLanes |= c, Zl |= c, i = 4;
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
          Ca(e, 0), vl(e, t, 0, !0);
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
              vl(
                l,
                t,
                Pt,
                !ml
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
          if ((t & 62914560) === t && (i = Fi + 300 - Fe(), 10 < i)) {
            if (vl(
              l,
              t,
              Pt,
              !ml
            ), ln(l, 0, !0) !== 0) break e;
            $n = t, l.timeoutHandle = Em(
              Ih.bind(
                null,
                l,
                n,
                qt,
                Pi,
                ku,
                t,
                Pt,
                Zl,
                Ea,
                ml,
                c,
                "Throttled",
                -0,
                0
              ),
              i
            );
            break e;
          }
          Ih(
            l,
            n,
            qt,
            Pi,
            ku,
            t,
            Pt,
            Zl,
            Ea,
            ml,
            c,
            null,
            -0,
            0
          );
        }
      }
      break;
    } while (!0);
    En(e);
  }
  function Ih(e, t, n, l, i, c, h, v, w, E, U, B, C, k) {
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
      }, Xh(
        t,
        c,
        B
      );
      var te = (c & 62914560) === c ? Fi - Fe() : (c & 4194048) === c ? Jh - Fe() : 0;
      if (te = h1(
        B,
        te
      ), te !== null) {
        $n = c, e.cancelPendingCommit = te(
          im.bind(
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
            U,
            B,
            null,
            C,
            k
          )
        ), vl(e, c, h, !E);
        return;
      }
    }
    im(
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
  function Ay(e) {
    for (var t = e; ; ) {
      var n = t.tag;
      if ((n === 0 || n === 11 || n === 15) && t.flags & 16384 && (n = t.updateQueue, n !== null && (n = n.stores, n !== null)))
        for (var l = 0; l < n.length; l++) {
          var i = n[l], c = i.getSnapshot;
          i = i.value;
          try {
            if (!Jt(c(), i)) return !1;
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
  function vl(e, t, n, l) {
    t &= ~Ou, t &= ~Zl, e.suspendedLanes |= t, e.pingedLanes &= ~t, l && (e.warmLanes |= t), l = e.expirationTimes;
    for (var i = t; 0 < i; ) {
      var c = 31 - xt(i), h = 1 << c;
      l[c] = -1, i &= ~h;
    }
    n !== 0 && cf(e, n, t);
  }
  function er() {
    return (Le & 6) === 0 ? (Ms(0), !1) : !0;
  }
  function Uu() {
    if (Ee !== null) {
      if (Ye === 0)
        var e = Ee.return;
      else
        e = Ee, Ln = Ul = null, Pc(e), _a = null, cs = 0, e = Ee;
      for (; e !== null; )
        Ah(e.alternate, e), e = e.return;
      Ee = null;
    }
  }
  function Ca(e, t) {
    var n = e.timeoutHandle;
    n !== -1 && (e.timeoutHandle = -1, $y(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), $n = 0, Uu(), Ze = e, Ee = n = Hn(e.current, null), Ce = t, Ye = 0, It = null, ml = !1, Ta = Kt(e, t), zu = !1, Ea = Pt = Ou = Zl = pl = it = 0, qt = js = null, ku = !1, (t & 8) !== 0 && (t |= t & 32);
    var l = e.entangledLanes;
    if (l !== 0)
      for (e = e.entanglements, l &= t; 0 < l; ) {
        var i = 31 - xt(l), c = 1 << i;
        t |= e[i], l &= ~c;
      }
    return Jn = t, bi(), n;
  }
  function Ph(e, t) {
    Se = null, A.H = gs, t === xa || t === Ai ? (t = pd(), Ye = 3) : t === Yc ? (t = pd(), Ye = 4) : Ye = t === pu ? 8 : t !== null && typeof t == "object" && typeof t.then == "function" ? 6 : 1, It = t, Ee === null && (it = 1, Vi(
      e,
      cn(t, e.current)
    ));
  }
  function em() {
    var e = Wt.current;
    return e === null ? !0 : (Ce & 4194048) === Ce ? dn === null : (Ce & 62914560) === Ce || (Ce & 536870912) !== 0 ? e === dn : !1;
  }
  function tm() {
    var e = A.H;
    return A.H = gs, e === null ? gs : e;
  }
  function nm() {
    var e = A.A;
    return A.A = Ty, e;
  }
  function tr() {
    it = 4, ml || (Ce & 4194048) !== Ce && Wt.current !== null || (Ta = !0), (pl & 134217727) === 0 && (Zl & 134217727) === 0 || Ze === null || vl(
      Ze,
      Ce,
      Pt,
      !1
    );
  }
  function Lu(e, t, n) {
    var l = Le;
    Le |= 2;
    var i = tm(), c = nm();
    (Ze !== e || Ce !== t) && (Pi = null, Ca(e, t)), t = !1;
    var h = it;
    e: do
      try {
        if (Ye !== 0 && Ee !== null) {
          var v = Ee, w = It;
          switch (Ye) {
            case 8:
              Uu(), h = 6;
              break e;
            case 3:
            case 2:
            case 9:
            case 6:
              Wt.current === null && (t = !0);
              var E = Ye;
              if (Ye = 0, It = null, za(e, v, w, E), n && Ta) {
                h = 0;
                break e;
              }
              break;
            default:
              E = Ye, Ye = 0, It = null, za(e, v, w, E);
          }
        }
        Cy(), h = it;
        break;
      } catch (U) {
        Ph(e, U);
      }
    while (!0);
    return t && e.shellSuspendCounter++, Ln = Ul = null, Le = l, A.H = i, A.A = c, Ee === null && (Ze = null, Ce = 0, bi()), h;
  }
  function Cy() {
    for (; Ee !== null; ) lm(Ee);
  }
  function zy(e, t) {
    var n = Le;
    Le |= 2;
    var l = tm(), i = nm();
    Ze !== e || Ce !== t ? (Pi = null, Ii = Fe() + 500, Ca(e, t)) : Ta = Kt(
      e,
      t
    );
    e: do
      try {
        if (Ye !== 0 && Ee !== null) {
          t = Ee;
          var c = It;
          t: switch (Ye) {
            case 1:
              Ye = 0, It = null, za(e, t, c, 1);
              break;
            case 2:
            case 9:
              if (hd(c)) {
                Ye = 0, It = null, am(t);
                break;
              }
              t = function() {
                Ye !== 2 && Ye !== 9 || Ze !== e || (Ye = 7), En(e);
              }, c.then(t, t);
              break e;
            case 3:
              Ye = 7;
              break e;
            case 4:
              Ye = 5;
              break e;
            case 7:
              hd(c) ? (Ye = 0, It = null, am(t)) : (Ye = 0, It = null, za(e, t, c, 7));
              break;
            case 5:
              var h = null;
              switch (Ee.tag) {
                case 26:
                  h = Ee.memoizedState;
                case 5:
                case 27:
                  var v = Ee;
                  if (h ? Vm(h) : v.stateNode.complete) {
                    Ye = 0, It = null;
                    var w = v.sibling;
                    if (w !== null) Ee = w;
                    else {
                      var E = v.return;
                      E !== null ? (Ee = E, nr(E)) : Ee = null;
                    }
                    break t;
                  }
              }
              Ye = 0, It = null, za(e, t, c, 5);
              break;
            case 6:
              Ye = 0, It = null, za(e, t, c, 6);
              break;
            case 8:
              Uu(), it = 6;
              break e;
            default:
              throw Error(u(462));
          }
        }
        Oy();
        break;
      } catch (U) {
        Ph(e, U);
      }
    while (!0);
    return Ln = Ul = null, A.H = l, A.A = i, Le = n, Ee !== null ? 0 : (Ze = null, Ce = 0, bi(), it);
  }
  function Oy() {
    for (; Ee !== null && !We(); )
      lm(Ee);
  }
  function lm(e) {
    var t = Th(e.alternate, e, Jn);
    e.memoizedProps = e.pendingProps, t === null ? nr(e) : Ee = t;
  }
  function am(e) {
    var t = e, n = t.alternate;
    switch (t.tag) {
      case 15:
      case 0:
        t = bh(
          n,
          t,
          t.pendingProps,
          t.type,
          void 0,
          Ce
        );
        break;
      case 11:
        t = bh(
          n,
          t,
          t.pendingProps,
          t.type.render,
          t.ref,
          Ce
        );
        break;
      case 5:
        Pc(t);
      default:
        Ah(n, t), t = Ee = nd(t, Jn), t = Th(n, t, Jn);
    }
    e.memoizedProps = e.pendingProps, t === null ? nr(e) : Ee = t;
  }
  function za(e, t, n, l) {
    Ln = Ul = null, Pc(t), _a = null, cs = 0;
    var i = t.return;
    try {
      if (_y(
        e,
        i,
        t,
        n,
        Ce
      )) {
        it = 1, Vi(
          e,
          cn(n, e.current)
        ), Ee = null;
        return;
      }
    } catch (c) {
      if (i !== null) throw Ee = i, c;
      it = 1, Vi(
        e,
        cn(n, e.current)
      ), Ee = null;
      return;
    }
    t.flags & 32768 ? (Oe || l === 1 ? e = !0 : Ta || (Ce & 536870912) !== 0 ? e = !1 : (ml = e = !0, (l === 2 || l === 9 || l === 3 || l === 6) && (l = Wt.current, l !== null && l.tag === 13 && (l.flags |= 16384))), sm(t, e)) : nr(t);
  }
  function nr(e) {
    var t = e;
    do {
      if ((t.flags & 32768) !== 0) {
        sm(
          t,
          ml
        );
        return;
      }
      e = t.return;
      var n = Sy(
        t.alternate,
        t,
        Jn
      );
      if (n !== null) {
        Ee = n;
        return;
      }
      if (t = t.sibling, t !== null) {
        Ee = t;
        return;
      }
      Ee = t = e;
    } while (t !== null);
    it === 0 && (it = 5);
  }
  function sm(e, t) {
    do {
      var n = jy(e.alternate, e);
      if (n !== null) {
        n.flags &= 32767, Ee = n;
        return;
      }
      if (n = e.return, n !== null && (n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null), !t && (e = e.sibling, e !== null)) {
        Ee = e;
        return;
      }
      Ee = e = n;
    } while (e !== null);
    it = 6, Ee = null;
  }
  function im(e, t, n, l, i, c, h, v, w) {
    e.cancelPendingCommit = null;
    do
      lr();
    while (yt !== 0);
    if ((Le & 6) !== 0) throw Error(u(327));
    if (t !== null) {
      if (t === e.current) throw Error(u(177));
      if (c = t.lanes | t.childLanes, c |= Mc, fg(
        e,
        n,
        c,
        h,
        v,
        w
      ), e === Ze && (Ee = Ze = null, Ce = 0), Aa = t, yl = e, $n = n, Du = c, Ru = i, $h = l, (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, Hy(Qt, function() {
        return fm(), null;
      })) : (e.callbackNode = null, e.callbackPriority = 0), l = (t.flags & 13878) !== 0, (t.subtreeFlags & 13878) !== 0 || l) {
        l = A.T, A.T = null, i = q.p, q.p = 2, h = Le, Le |= 4;
        try {
          Ny(e, t, n);
        } finally {
          Le = h, q.p = i, A.T = l;
        }
      }
      yt = 1, rm(), cm(), um();
    }
  }
  function rm() {
    if (yt === 1) {
      yt = 0;
      var e = yl, t = Aa, n = (t.flags & 13878) !== 0;
      if ((t.subtreeFlags & 13878) !== 0 || n) {
        n = A.T, A.T = null;
        var l = q.p;
        q.p = 2;
        var i = Le;
        Le |= 4;
        try {
          Yh(t, e);
          var c = Wu, h = Kf(e.containerInfo), v = c.focusedElem, w = c.selectionRange;
          if (h !== v && v && v.ownerDocument && Zf(
            v.ownerDocument.documentElement,
            v
          )) {
            if (w !== null && bc(v)) {
              var E = w.start, U = w.end;
              if (U === void 0 && (U = E), "selectionStart" in v)
                v.selectionStart = E, v.selectionEnd = Math.min(
                  U,
                  v.value.length
                );
              else {
                var B = v.ownerDocument || document, C = B && B.defaultView || window;
                if (C.getSelection) {
                  var k = C.getSelection(), te = v.textContent.length, de = Math.min(w.start, te), Qe = w.end === void 0 ? de : Math.min(w.end, te);
                  !k.extend && de > Qe && (h = Qe, Qe = de, de = h);
                  var M = Qf(
                    v,
                    de
                  ), j = Qf(
                    v,
                    Qe
                  );
                  if (M && j && (k.rangeCount !== 1 || k.anchorNode !== M.node || k.anchorOffset !== M.offset || k.focusNode !== j.node || k.focusOffset !== j.offset)) {
                    var T = B.createRange();
                    T.setStart(M.node, M.offset), k.removeAllRanges(), de > Qe ? (k.addRange(T), k.extend(j.node, j.offset)) : (T.setEnd(j.node, j.offset), k.addRange(T));
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
              var L = B[v];
              L.element.scrollLeft = L.left, L.element.scrollTop = L.top;
            }
          }
          pr = !!$u, Wu = $u = null;
        } finally {
          Le = i, q.p = l, A.T = n;
        }
      }
      e.current = t, yt = 2;
    }
  }
  function cm() {
    if (yt === 2) {
      yt = 0;
      var e = yl, t = Aa, n = (t.flags & 8772) !== 0;
      if ((t.subtreeFlags & 8772) !== 0 || n) {
        n = A.T, A.T = null;
        var l = q.p;
        q.p = 2;
        var i = Le;
        Le |= 4;
        try {
          Hh(e, t.alternate, t);
        } finally {
          Le = i, q.p = l, A.T = n;
        }
      }
      yt = 3;
    }
  }
  function um() {
    if (yt === 4 || yt === 3) {
      yt = 0, kt();
      var e = yl, t = Aa, n = $n, l = $h;
      (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? yt = 5 : (yt = 0, Aa = yl = null, om(e, e.pendingLanes));
      var i = e.pendingLanes;
      if (i === 0 && (gl = null), nc(n), t = t.stateNode, ke && typeof ke.onCommitFiberRoot == "function")
        try {
          ke.onCommitFiberRoot(
            we,
            t,
            void 0,
            (t.current.flags & 128) === 128
          );
        } catch {
        }
      if (l !== null) {
        t = A.T, i = q.p, q.p = 2, A.T = null;
        try {
          for (var c = e.onRecoverableError, h = 0; h < l.length; h++) {
            var v = l[h];
            c(v.value, {
              componentStack: v.stack
            });
          }
        } finally {
          A.T = t, q.p = i;
        }
      }
      ($n & 3) !== 0 && lr(), En(e), i = e.pendingLanes, (n & 261930) !== 0 && (i & 42) !== 0 ? e === Hu ? Ns++ : (Ns = 0, Hu = e) : Ns = 0, Ms(0);
    }
  }
  function om(e, t) {
    (e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, is(t)));
  }
  function lr() {
    return rm(), cm(), um(), fm();
  }
  function fm() {
    if (yt !== 5) return !1;
    var e = yl, t = Du;
    Du = 0;
    var n = nc($n), l = A.T, i = q.p;
    try {
      q.p = 32 > n ? 32 : n, A.T = null, n = Ru, Ru = null;
      var c = yl, h = $n;
      if (yt = 0, Aa = yl = null, $n = 0, (Le & 6) !== 0) throw Error(u(331));
      var v = Le;
      if (Le |= 4, Zh(c.current), Vh(
        c,
        c.current,
        h,
        n
      ), Le = v, Ms(0, !1), ke && typeof ke.onPostCommitFiberRoot == "function")
        try {
          ke.onPostCommitFiberRoot(we, c);
        } catch {
        }
      return !0;
    } finally {
      q.p = i, A.T = l, om(e, t);
    }
  }
  function dm(e, t, n) {
    t = cn(n, t), t = mu(e.stateNode, t, 2), e = ol(e, t, 2), e !== null && (Za(e, 2), En(e));
  }
  function Ge(e, t, n) {
    if (e.tag === 3)
      dm(e, e, n);
    else
      for (; t !== null; ) {
        if (t.tag === 3) {
          dm(
            t,
            e,
            n
          );
          break;
        } else if (t.tag === 1) {
          var l = t.stateNode;
          if (typeof t.type.getDerivedStateFromError == "function" || typeof l.componentDidCatch == "function" && (gl === null || !gl.has(l))) {
            e = cn(n, e), n = hh(2), l = ol(t, n, 2), l !== null && (mh(
              n,
              l,
              t,
              e
            ), Za(l, 2), En(l));
            break;
          }
        }
        t = t.return;
      }
  }
  function Bu(e, t, n) {
    var l = e.pingCache;
    if (l === null) {
      l = e.pingCache = new Ey();
      var i = /* @__PURE__ */ new Set();
      l.set(t, i);
    } else
      i = l.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), l.set(t, i));
    i.has(n) || (zu = !0, i.add(n), e = ky.bind(null, e, t, n), t.then(e, e));
  }
  function ky(e, t, n) {
    var l = e.pingCache;
    l !== null && l.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, Ze === e && (Ce & n) === n && (it === 4 || it === 3 && (Ce & 62914560) === Ce && 300 > Fe() - Fi ? (Le & 2) === 0 && Ca(e, 0) : Ou |= n, Ea === Ce && (Ea = 0)), En(e);
  }
  function hm(e, t) {
    t === 0 && (t = rf()), e = Dl(e, t), e !== null && (Za(e, t), En(e));
  }
  function Dy(e) {
    var t = e.memoizedState, n = 0;
    t !== null && (n = t.retryLane), hm(e, n);
  }
  function Ry(e, t) {
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
    l !== null && l.delete(t), hm(e, n);
  }
  function Hy(e, t) {
    return wt(e, t);
  }
  var ar = null, Oa = null, qu = !1, sr = !1, Yu = !1, xl = 0;
  function En(e) {
    e !== Oa && e.next === null && (Oa === null ? ar = Oa = e : Oa = Oa.next = e), sr = !0, qu || (qu = !0, Ly());
  }
  function Ms(e, t) {
    if (!Yu && sr) {
      Yu = !0;
      do
        for (var n = !1, l = ar; l !== null; ) {
          if (e !== 0) {
            var i = l.pendingLanes;
            if (i === 0) var c = 0;
            else {
              var h = l.suspendedLanes, v = l.pingedLanes;
              c = (1 << 31 - xt(42 | e) + 1) - 1, c &= i & ~(h & ~v), c = c & 201326741 ? c & 201326741 | 1 : c ? c | 2 : 0;
            }
            c !== 0 && (n = !0, ym(l, c));
          } else
            c = Ce, c = ln(
              l,
              l === Ze ? c : 0,
              l.cancelPendingCommit !== null || l.timeoutHandle !== -1
            ), (c & 3) === 0 || Kt(l, c) || (n = !0, ym(l, c));
          l = l.next;
        }
      while (n);
      Yu = !1;
    }
  }
  function Uy() {
    mm();
  }
  function mm() {
    sr = qu = !1;
    var e = 0;
    xl !== 0 && Jy() && (e = xl);
    for (var t = Fe(), n = null, l = ar; l !== null; ) {
      var i = l.next, c = pm(l, t);
      c === 0 ? (l.next = null, n === null ? ar = i : n.next = i, i === null && (Oa = n)) : (n = l, (e !== 0 || (c & 3) !== 0) && (sr = !0)), l = i;
    }
    yt !== 0 && yt !== 5 || Ms(e), xl !== 0 && (xl = 0);
  }
  function pm(e, t) {
    for (var n = e.suspendedLanes, l = e.pingedLanes, i = e.expirationTimes, c = e.pendingLanes & -62914561; 0 < c; ) {
      var h = 31 - xt(c), v = 1 << h, w = i[h];
      w === -1 ? ((v & n) === 0 || (v & l) !== 0) && (i[h] = og(v, t)) : w <= t && (e.expiredLanes |= v), c &= ~v;
    }
    if (t = Ze, n = Ce, n = ln(
      e,
      e === t ? n : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1
    ), l = e.callbackNode, n === 0 || e === t && (Ye === 2 || Ye === 9) || e.cancelPendingCommit !== null)
      return l !== null && l !== null && ie(l), e.callbackNode = null, e.callbackPriority = 0;
    if ((n & 3) === 0 || Kt(e, n)) {
      if (t = n & -n, t === e.callbackPriority) return t;
      switch (l !== null && ie(l), nc(n)) {
        case 2:
        case 8:
          n = St;
          break;
        case 32:
          n = Qt;
          break;
        case 268435456:
          n = Sn;
          break;
        default:
          n = Qt;
      }
      return l = gm.bind(null, e), n = wt(n, l), e.callbackPriority = t, e.callbackNode = n, t;
    }
    return l !== null && l !== null && ie(l), e.callbackPriority = 2, e.callbackNode = null, 2;
  }
  function gm(e, t) {
    if (yt !== 0 && yt !== 5)
      return e.callbackNode = null, e.callbackPriority = 0, null;
    var n = e.callbackNode;
    if (lr() && e.callbackNode !== n)
      return null;
    var l = Ce;
    return l = ln(
      e,
      e === Ze ? l : 0,
      e.cancelPendingCommit !== null || e.timeoutHandle !== -1
    ), l === 0 ? null : (Fh(e, l, t), pm(e, Fe()), e.callbackNode != null && e.callbackNode === n ? gm.bind(null, e) : null);
  }
  function ym(e, t) {
    if (lr()) return null;
    Fh(e, t, !0);
  }
  function Ly() {
    Wy(function() {
      (Le & 6) !== 0 ? wt(
        Ie,
        Uy
      ) : mm();
    });
  }
  function Gu() {
    if (xl === 0) {
      var e = ya;
      e === 0 && (e = tl, tl <<= 1, (tl & 261888) === 0 && (tl = 256)), xl = e;
    }
    return xl;
  }
  function vm(e) {
    return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : hi("" + e);
  }
  function xm(e, t) {
    var n = t.ownerDocument.createElement("input");
    return n.name = t.name, n.value = t.value, e.id && n.setAttribute("form", e.id), t.parentNode.insertBefore(n, t), e = new FormData(e), n.parentNode.removeChild(n), e;
  }
  function By(e, t, n, l, i) {
    if (t === "submit" && n && n.stateNode === i) {
      var c = vm(
        (i[Rt] || null).action
      ), h = l.submitter;
      h && (t = (t = h[Rt] || null) ? vm(t.formAction) : h.getAttribute("formAction"), t !== null && (c = t, h = null));
      var v = new yi(
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
                if (xl !== 0) {
                  var w = h ? xm(i, h) : new FormData(i);
                  cu(
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
                typeof c == "function" && (v.preventDefault(), w = h ? xm(i, h) : new FormData(i), cu(
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
  for (var Vu = 0; Vu < Nc.length; Vu++) {
    var Xu = Nc[Vu], qy = Xu.toLowerCase(), Yy = Xu[0].toUpperCase() + Xu.slice(1);
    pn(
      qy,
      "on" + Yy
    );
  }
  pn(Wf, "onAnimationEnd"), pn(Ff, "onAnimationIteration"), pn(If, "onAnimationStart"), pn("dblclick", "onDoubleClick"), pn("focusin", "onFocus"), pn("focusout", "onBlur"), pn(ly, "onTransitionRun"), pn(ay, "onTransitionStart"), pn(sy, "onTransitionCancel"), pn(Pf, "onTransitionEnd"), la("onMouseEnter", ["mouseout", "mouseover"]), la("onMouseLeave", ["mouseout", "mouseover"]), la("onPointerEnter", ["pointerout", "pointerover"]), la("onPointerLeave", ["pointerout", "pointerover"]), Cl(
    "onChange",
    "change click focusin focusout input keydown keyup selectionchange".split(" ")
  ), Cl(
    "onSelect",
    "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
      " "
    )
  ), Cl("onBeforeInput", [
    "compositionend",
    "keypress",
    "textInput",
    "paste"
  ]), Cl(
    "onCompositionEnd",
    "compositionend focusout keydown keypress keyup mousedown".split(" ")
  ), Cl(
    "onCompositionStart",
    "compositionstart focusout keydown keypress keyup mousedown".split(" ")
  ), Cl(
    "onCompositionUpdate",
    "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
  );
  var Ts = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
    " "
  ), Gy = new Set(
    "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Ts)
  );
  function _m(e, t) {
    t = (t & 4) !== 0;
    for (var n = 0; n < e.length; n++) {
      var l = e[n], i = l.event;
      l = l.listeners;
      e: {
        var c = void 0;
        if (t)
          for (var h = l.length - 1; 0 <= h; h--) {
            var v = l[h], w = v.instance, E = v.currentTarget;
            if (v = v.listener, w !== c && i.isPropagationStopped())
              break e;
            c = v, i.currentTarget = E;
            try {
              c(i);
            } catch (U) {
              _i(U);
            }
            i.currentTarget = null, c = w;
          }
        else
          for (h = 0; h < l.length; h++) {
            if (v = l[h], w = v.instance, E = v.currentTarget, v = v.listener, w !== c && i.isPropagationStopped())
              break e;
            c = v, i.currentTarget = E;
            try {
              c(i);
            } catch (U) {
              _i(U);
            }
            i.currentTarget = null, c = w;
          }
      }
    }
  }
  function Ae(e, t) {
    var n = t[lc];
    n === void 0 && (n = t[lc] = /* @__PURE__ */ new Set());
    var l = e + "__bubble";
    n.has(l) || (bm(t, e, 2, !1), n.add(l));
  }
  function Qu(e, t, n) {
    var l = 0;
    t && (l |= 4), bm(
      n,
      e,
      l,
      t
    );
  }
  var ir = "_reactListening" + Math.random().toString(36).slice(2);
  function Zu(e) {
    if (!e[ir]) {
      e[ir] = !0, mf.forEach(function(n) {
        n !== "selectionchange" && (Gy.has(n) || Qu(n, !1, e), Qu(n, !0, e));
      });
      var t = e.nodeType === 9 ? e : e.ownerDocument;
      t === null || t[ir] || (t[ir] = !0, Qu("selectionchange", !1, t));
    }
  }
  function bm(e, t, n, l) {
    switch (Wm(t)) {
      case 2:
        var i = g1;
        break;
      case 8:
        i = y1;
        break;
      default:
        i = ro;
    }
    n = i.bind(
      null,
      t,
      n,
      e
    ), i = void 0, !dc || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), l ? i !== void 0 ? e.addEventListener(t, n, {
      capture: !0,
      passive: i
    }) : e.addEventListener(t, n, !0) : i !== void 0 ? e.addEventListener(t, n, {
      passive: i
    }) : e.addEventListener(t, n, !1);
  }
  function Ku(e, t, n, l, i) {
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
            if (h = ea(v), h === null) return;
            if (w = h.tag, w === 5 || w === 6 || w === 26 || w === 27) {
              l = c = h;
              continue e;
            }
            v = v.parentNode;
          }
        }
        l = l.return;
      }
    Mf(function() {
      var E = c, U = oc(n), B = [];
      e: {
        var C = ed.get(e);
        if (C !== void 0) {
          var k = yi, te = e;
          switch (e) {
            case "keypress":
              if (pi(n) === 0) break e;
            case "keydown":
            case "keyup":
              k = Rg;
              break;
            case "focusin":
              te = "focus", k = gc;
              break;
            case "focusout":
              te = "blur", k = gc;
              break;
            case "beforeblur":
            case "afterblur":
              k = gc;
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
              k = Af;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              k = Sg;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              k = Lg;
              break;
            case Wf:
            case Ff:
            case If:
              k = Mg;
              break;
            case Pf:
              k = qg;
              break;
            case "scroll":
            case "scrollend":
              k = bg;
              break;
            case "wheel":
              k = Gg;
              break;
            case "copy":
            case "cut":
            case "paste":
              k = Eg;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              k = zf;
              break;
            case "toggle":
            case "beforetoggle":
              k = Xg;
          }
          var de = (t & 4) !== 0, Qe = !de && (e === "scroll" || e === "scrollend"), M = de ? C !== null ? C + "Capture" : null : C;
          de = [];
          for (var j = E, T; j !== null; ) {
            var L = j;
            if (T = L.stateNode, L = L.tag, L !== 5 && L !== 26 && L !== 27 || T === null || M === null || (L = $a(j, M), L != null && de.push(
              Es(j, L, T)
            )), Qe) break;
            j = j.return;
          }
          0 < de.length && (C = new k(
            C,
            te,
            null,
            n,
            U
          ), B.push({ event: C, listeners: de }));
        }
      }
      if ((t & 7) === 0) {
        e: {
          if (C = e === "mouseover" || e === "pointerover", k = e === "mouseout" || e === "pointerout", C && n !== uc && (te = n.relatedTarget || n.fromElement) && (ea(te) || te[Pl]))
            break e;
          if ((k || C) && (C = U.window === U ? U : (C = U.ownerDocument) ? C.defaultView || C.parentWindow : window, k ? (te = n.relatedTarget || n.toElement, k = E, te = te ? ea(te) : null, te !== null && (Qe = d(te), de = te.tag, te !== Qe || de !== 5 && de !== 27 && de !== 6) && (te = null)) : (k = null, te = E), k !== te)) {
            if (de = Af, L = "onMouseLeave", M = "onMouseEnter", j = "mouse", (e === "pointerout" || e === "pointerover") && (de = zf, L = "onPointerLeave", M = "onPointerEnter", j = "pointer"), Qe = k == null ? C : Ja(k), T = te == null ? C : Ja(te), C = new de(
              L,
              j + "leave",
              k,
              n,
              U
            ), C.target = Qe, C.relatedTarget = T, L = null, ea(U) === E && (de = new de(
              M,
              j + "enter",
              te,
              n,
              U
            ), de.target = T, de.relatedTarget = Qe, L = de), Qe = L, k && te)
              t: {
                for (de = Vy, M = k, j = te, T = 0, L = M; L; L = de(L))
                  T++;
                L = 0;
                for (var ue = j; ue; ue = de(ue))
                  L++;
                for (; 0 < T - L; )
                  M = de(M), T--;
                for (; 0 < L - T; )
                  j = de(j), L--;
                for (; T--; ) {
                  if (M === j || j !== null && M === j.alternate) {
                    de = M;
                    break t;
                  }
                  M = de(M), j = de(j);
                }
                de = null;
              }
            else de = null;
            k !== null && wm(
              B,
              C,
              k,
              de,
              !1
            ), te !== null && Qe !== null && wm(
              B,
              Qe,
              te,
              de,
              !0
            );
          }
        }
        e: {
          if (C = E ? Ja(E) : window, k = C.nodeName && C.nodeName.toLowerCase(), k === "select" || k === "input" && C.type === "file")
            var Re = Bf;
          else if (Uf(C))
            if (qf)
              Re = ey;
            else {
              Re = Ig;
              var le = Fg;
            }
          else
            k = C.nodeName, !k || k.toLowerCase() !== "input" || C.type !== "checkbox" && C.type !== "radio" ? E && cc(E.elementType) && (Re = Bf) : Re = Pg;
          if (Re && (Re = Re(e, E))) {
            Lf(
              B,
              Re,
              n,
              U
            );
            break e;
          }
          le && le(e, C, E), e === "focusout" && E && C.type === "number" && E.memoizedProps.value != null && rc(C, "number", C.value);
        }
        switch (le = E ? Ja(E) : window, e) {
          case "focusin":
            (Uf(le) || le.contentEditable === "true") && (ua = le, wc = E, ls = null);
            break;
          case "focusout":
            ls = wc = ua = null;
            break;
          case "mousedown":
            Sc = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Sc = !1, Jf(B, n, U);
            break;
          case "selectionchange":
            if (ny) break;
          case "keydown":
          case "keyup":
            Jf(B, n, U);
        }
        var je;
        if (vc)
          e: {
            switch (e) {
              case "compositionstart":
                var ze = "onCompositionStart";
                break e;
              case "compositionend":
                ze = "onCompositionEnd";
                break e;
              case "compositionupdate":
                ze = "onCompositionUpdate";
                break e;
            }
            ze = void 0;
          }
        else
          ca ? Rf(e, n) && (ze = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (ze = "onCompositionStart");
        ze && (Of && n.locale !== "ko" && (ca || ze !== "onCompositionStart" ? ze === "onCompositionEnd" && ca && (je = Tf()) : (ll = U, hc = "value" in ll ? ll.value : ll.textContent, ca = !0)), le = rr(E, ze), 0 < le.length && (ze = new Cf(
          ze,
          e,
          null,
          n,
          U
        ), B.push({ event: ze, listeners: le }), je ? ze.data = je : (je = Hf(n), je !== null && (ze.data = je)))), (je = Zg ? Kg(e, n) : Jg(e, n)) && (ze = rr(E, "onBeforeInput"), 0 < ze.length && (le = new Cf(
          "onBeforeInput",
          "beforeinput",
          null,
          n,
          U
        ), B.push({
          event: le,
          listeners: ze
        }), le.data = je)), By(
          B,
          e,
          E,
          n,
          U
        );
      }
      _m(B, t);
    });
  }
  function Es(e, t, n) {
    return {
      instance: e,
      listener: t,
      currentTarget: n
    };
  }
  function rr(e, t) {
    for (var n = t + "Capture", l = []; e !== null; ) {
      var i = e, c = i.stateNode;
      if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || c === null || (i = $a(e, n), i != null && l.unshift(
        Es(e, i, c)
      ), i = $a(e, t), i != null && l.push(
        Es(e, i, c)
      )), e.tag === 3) return l;
      e = e.return;
    }
    return [];
  }
  function Vy(e) {
    if (e === null) return null;
    do
      e = e.return;
    while (e && e.tag !== 5 && e.tag !== 27);
    return e || null;
  }
  function wm(e, t, n, l, i) {
    for (var c = t._reactName, h = []; n !== null && n !== l; ) {
      var v = n, w = v.alternate, E = v.stateNode;
      if (v = v.tag, w !== null && w === l) break;
      v !== 5 && v !== 26 && v !== 27 || E === null || (w = E, i ? (E = $a(n, c), E != null && h.unshift(
        Es(n, E, w)
      )) : i || (E = $a(n, c), E != null && h.push(
        Es(n, E, w)
      ))), n = n.return;
    }
    h.length !== 0 && e.push({ event: t, listeners: h });
  }
  var Xy = /\r\n?/g, Qy = /\u0000|\uFFFD/g;
  function Sm(e) {
    return (typeof e == "string" ? e : "" + e).replace(Xy, `
`).replace(Qy, "");
  }
  function jm(e, t) {
    return t = Sm(t), Sm(e) === t;
  }
  function Xe(e, t, n, l, i, c) {
    switch (n) {
      case "children":
        typeof l == "string" ? t === "body" || t === "textarea" && l === "" || sa(e, l) : (typeof l == "number" || typeof l == "bigint") && t !== "body" && sa(e, "" + l);
        break;
      case "className":
        fi(e, "class", l);
        break;
      case "tabIndex":
        fi(e, "tabindex", l);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        fi(e, n, l);
        break;
      case "style":
        jf(e, l, c);
        break;
      case "data":
        if (t !== "object") {
          fi(e, "data", l);
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
        l = hi("" + l), e.setAttribute(n, l);
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
          typeof c == "function" && (n === "formAction" ? (t !== "input" && Xe(e, t, "name", i.name, i, null), Xe(
            e,
            t,
            "formEncType",
            i.formEncType,
            i,
            null
          ), Xe(
            e,
            t,
            "formMethod",
            i.formMethod,
            i,
            null
          ), Xe(
            e,
            t,
            "formTarget",
            i.formTarget,
            i,
            null
          )) : (Xe(e, t, "encType", i.encType, i, null), Xe(e, t, "method", i.method, i, null), Xe(e, t, "target", i.target, i, null)));
        if (l == null || typeof l == "symbol" || typeof l == "boolean") {
          e.removeAttribute(n);
          break;
        }
        l = hi("" + l), e.setAttribute(n, l);
        break;
      case "onClick":
        l != null && (e.onclick = Dn);
        break;
      case "onScroll":
        l != null && Ae("scroll", e);
        break;
      case "onScrollEnd":
        l != null && Ae("scrollend", e);
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
        n = hi("" + l), e.setAttributeNS(
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
        Ae("beforetoggle", e), Ae("toggle", e), oi(e, "popover", l);
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
        oi(e, "is", l);
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") && (n = xg.get(n) || n, oi(e, n, l));
    }
  }
  function Ju(e, t, n, l, i, c) {
    switch (n) {
      case "style":
        jf(e, l, c);
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
        typeof l == "string" ? sa(e, l) : (typeof l == "number" || typeof l == "bigint") && sa(e, "" + l);
        break;
      case "onScroll":
        l != null && Ae("scroll", e);
        break;
      case "onScrollEnd":
        l != null && Ae("scrollend", e);
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
        if (!pf.hasOwnProperty(n))
          e: {
            if (n[0] === "o" && n[1] === "n" && (i = n.endsWith("Capture"), t = n.slice(2, i ? n.length - 7 : void 0), c = e[Rt] || null, c = c != null ? c[n] : null, typeof c == "function" && e.removeEventListener(t, c, i), typeof l == "function")) {
              typeof c != "function" && c !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(t, l, i);
              break e;
            }
            n in e ? e[n] = l : l === !0 ? e.setAttribute(n, "") : oi(e, n, l);
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
        Ae("error", e), Ae("load", e);
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
                  Xe(e, t, c, h, n, null);
              }
          }
        i && Xe(e, t, "srcSet", n.srcSet, n, null), l && Xe(e, t, "src", n.src, n, null);
        return;
      case "input":
        Ae("invalid", e);
        var v = c = h = i = null, w = null, E = null;
        for (l in n)
          if (n.hasOwnProperty(l)) {
            var U = n[l];
            if (U != null)
              switch (l) {
                case "name":
                  i = U;
                  break;
                case "type":
                  h = U;
                  break;
                case "checked":
                  w = U;
                  break;
                case "defaultChecked":
                  E = U;
                  break;
                case "value":
                  c = U;
                  break;
                case "defaultValue":
                  v = U;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (U != null)
                    throw Error(u(137, t));
                  break;
                default:
                  Xe(e, t, l, U, n, null);
              }
          }
        _f(
          e,
          c,
          v,
          w,
          E,
          h,
          i,
          !1
        );
        return;
      case "select":
        Ae("invalid", e), l = h = c = null;
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
                Xe(e, t, i, v, n, null);
            }
        t = c, n = h, e.multiple = !!l, t != null ? aa(e, !!l, t, !1) : n != null && aa(e, !!l, n, !0);
        return;
      case "textarea":
        Ae("invalid", e), c = i = l = null;
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
                Xe(e, t, h, v, n, null);
            }
        wf(e, l, i, c);
        return;
      case "option":
        for (w in n)
          if (n.hasOwnProperty(w) && (l = n[w], l != null))
            switch (w) {
              case "selected":
                e.selected = l && typeof l != "function" && typeof l != "symbol";
                break;
              default:
                Xe(e, t, w, l, n, null);
            }
        return;
      case "dialog":
        Ae("beforetoggle", e), Ae("toggle", e), Ae("cancel", e), Ae("close", e);
        break;
      case "iframe":
      case "object":
        Ae("load", e);
        break;
      case "video":
      case "audio":
        for (l = 0; l < Ts.length; l++)
          Ae(Ts[l], e);
        break;
      case "image":
        Ae("error", e), Ae("load", e);
        break;
      case "details":
        Ae("toggle", e);
        break;
      case "embed":
      case "source":
      case "link":
        Ae("error", e), Ae("load", e);
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
        for (E in n)
          if (n.hasOwnProperty(E) && (l = n[E], l != null))
            switch (E) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(u(137, t));
              default:
                Xe(e, t, E, l, n, null);
            }
        return;
      default:
        if (cc(t)) {
          for (U in n)
            n.hasOwnProperty(U) && (l = n[U], l !== void 0 && Ju(
              e,
              t,
              U,
              l,
              n,
              void 0
            ));
          return;
        }
    }
    for (v in n)
      n.hasOwnProperty(v) && (l = n[v], l != null && Xe(e, t, v, l, n, null));
  }
  function Zy(e, t, n, l) {
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
        var i = null, c = null, h = null, v = null, w = null, E = null, U = null;
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
                l.hasOwnProperty(k) || Xe(e, t, k, null, l, B);
            }
        }
        for (var C in l) {
          var k = l[C];
          if (B = n[C], l.hasOwnProperty(C) && (k != null || B != null))
            switch (C) {
              case "type":
                c = k;
                break;
              case "name":
                i = k;
                break;
              case "checked":
                E = k;
                break;
              case "defaultChecked":
                U = k;
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
                k !== B && Xe(
                  e,
                  t,
                  C,
                  k,
                  l,
                  B
                );
            }
        }
        ic(
          e,
          h,
          v,
          w,
          E,
          U,
          c,
          i
        );
        return;
      case "select":
        k = h = v = C = null;
        for (c in n)
          if (w = n[c], n.hasOwnProperty(c) && w != null)
            switch (c) {
              case "value":
                break;
              case "multiple":
                k = w;
              default:
                l.hasOwnProperty(c) || Xe(
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
                C = c;
                break;
              case "defaultValue":
                v = c;
                break;
              case "multiple":
                h = c;
              default:
                c !== w && Xe(
                  e,
                  t,
                  i,
                  c,
                  l,
                  w
                );
            }
        t = v, n = h, l = k, C != null ? aa(e, !!n, C, !1) : !!l != !!n && (t != null ? aa(e, !!n, t, !0) : aa(e, !!n, n ? [] : "", !1));
        return;
      case "textarea":
        k = C = null;
        for (v in n)
          if (i = n[v], n.hasOwnProperty(v) && i != null && !l.hasOwnProperty(v))
            switch (v) {
              case "value":
                break;
              case "children":
                break;
              default:
                Xe(e, t, v, null, l, i);
            }
        for (h in l)
          if (i = l[h], c = n[h], l.hasOwnProperty(h) && (i != null || c != null))
            switch (h) {
              case "value":
                C = i;
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
                i !== c && Xe(e, t, h, i, l, c);
            }
        bf(e, C, k);
        return;
      case "option":
        for (var te in n)
          if (C = n[te], n.hasOwnProperty(te) && C != null && !l.hasOwnProperty(te))
            switch (te) {
              case "selected":
                e.selected = !1;
                break;
              default:
                Xe(
                  e,
                  t,
                  te,
                  null,
                  l,
                  C
                );
            }
        for (w in l)
          if (C = l[w], k = n[w], l.hasOwnProperty(w) && C !== k && (C != null || k != null))
            switch (w) {
              case "selected":
                e.selected = C && typeof C != "function" && typeof C != "symbol";
                break;
              default:
                Xe(
                  e,
                  t,
                  w,
                  C,
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
          C = n[de], n.hasOwnProperty(de) && C != null && !l.hasOwnProperty(de) && Xe(e, t, de, null, l, C);
        for (E in l)
          if (C = l[E], k = n[E], l.hasOwnProperty(E) && C !== k && (C != null || k != null))
            switch (E) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (C != null)
                  throw Error(u(137, t));
                break;
              default:
                Xe(
                  e,
                  t,
                  E,
                  C,
                  l,
                  k
                );
            }
        return;
      default:
        if (cc(t)) {
          for (var Qe in n)
            C = n[Qe], n.hasOwnProperty(Qe) && C !== void 0 && !l.hasOwnProperty(Qe) && Ju(
              e,
              t,
              Qe,
              void 0,
              l,
              C
            );
          for (U in l)
            C = l[U], k = n[U], !l.hasOwnProperty(U) || C === k || C === void 0 && k === void 0 || Ju(
              e,
              t,
              U,
              C,
              l,
              k
            );
          return;
        }
    }
    for (var M in n)
      C = n[M], n.hasOwnProperty(M) && C != null && !l.hasOwnProperty(M) && Xe(e, t, M, null, l, C);
    for (B in l)
      C = l[B], k = n[B], !l.hasOwnProperty(B) || C === k || C == null && k == null || Xe(e, t, B, C, l, k);
  }
  function Nm(e) {
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
  function Ky() {
    if (typeof performance.getEntriesByType == "function") {
      for (var e = 0, t = 0, n = performance.getEntriesByType("resource"), l = 0; l < n.length; l++) {
        var i = n[l], c = i.transferSize, h = i.initiatorType, v = i.duration;
        if (c && v && Nm(h)) {
          for (h = 0, v = i.responseEnd, l += 1; l < n.length; l++) {
            var w = n[l], E = w.startTime;
            if (E > v) break;
            var U = w.transferSize, B = w.initiatorType;
            U && Nm(B) && (w = w.responseEnd, h += U * (w < v ? 1 : (v - E) / (w - E)));
          }
          if (--l, t += 8 * (c + h) / (i.duration / 1e3), e++, 10 < e) break;
        }
      }
      if (0 < e) return t / e / 1e6;
    }
    return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
  }
  var $u = null, Wu = null;
  function cr(e) {
    return e.nodeType === 9 ? e : e.ownerDocument;
  }
  function Mm(e) {
    switch (e) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function Tm(e, t) {
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
  function Fu(e, t) {
    return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
  }
  var Iu = null;
  function Jy() {
    var e = window.event;
    return e && e.type === "popstate" ? e === Iu ? !1 : (Iu = e, !0) : (Iu = null, !1);
  }
  var Em = typeof setTimeout == "function" ? setTimeout : void 0, $y = typeof clearTimeout == "function" ? clearTimeout : void 0, Am = typeof Promise == "function" ? Promise : void 0, Wy = typeof queueMicrotask == "function" ? queueMicrotask : typeof Am < "u" ? function(e) {
    return Am.resolve(null).then(e).catch(Fy);
  } : Em;
  function Fy(e) {
    setTimeout(function() {
      throw e;
    });
  }
  function _l(e) {
    return e === "head";
  }
  function Cm(e, t) {
    var n = t, l = 0;
    do {
      var i = n.nextSibling;
      if (e.removeChild(n), i && i.nodeType === 8)
        if (n = i.data, n === "/$" || n === "/&") {
          if (l === 0) {
            e.removeChild(i), Ha(t);
            return;
          }
          l--;
        } else if (n === "$" || n === "$?" || n === "$~" || n === "$!" || n === "&")
          l++;
        else if (n === "html")
          As(e.ownerDocument.documentElement);
        else if (n === "head") {
          n = e.ownerDocument.head, As(n);
          for (var c = n.firstChild; c; ) {
            var h = c.nextSibling, v = c.nodeName;
            c[Ka] || v === "SCRIPT" || v === "STYLE" || v === "LINK" && c.rel.toLowerCase() === "stylesheet" || n.removeChild(c), c = h;
          }
        } else
          n === "body" && As(e.ownerDocument.body);
      n = i;
    } while (n);
    Ha(t);
  }
  function zm(e, t) {
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
  function Pu(e) {
    var t = e.firstChild;
    for (t && t.nodeType === 10 && (t = t.nextSibling); t; ) {
      var n = t;
      switch (t = t.nextSibling, n.nodeName) {
        case "HTML":
        case "HEAD":
        case "BODY":
          Pu(n), ac(n);
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
  function Iy(e, t, n, l) {
    for (; e.nodeType === 1; ) {
      var i = n;
      if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
        if (!l && (e.nodeName !== "INPUT" || e.type !== "hidden"))
          break;
      } else if (l) {
        if (!e[Ka])
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
      if (e = hn(e.nextSibling), e === null) break;
    }
    return null;
  }
  function Py(e, t, n) {
    if (t === "") return null;
    for (; e.nodeType !== 3; )
      if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !n || (e = hn(e.nextSibling), e === null)) return null;
    return e;
  }
  function Om(e, t) {
    for (; e.nodeType !== 8; )
      if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = hn(e.nextSibling), e === null)) return null;
    return e;
  }
  function eo(e) {
    return e.data === "$?" || e.data === "$~";
  }
  function to(e) {
    return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
  }
  function e1(e, t) {
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
  function hn(e) {
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
  var no = null;
  function km(e) {
    e = e.nextSibling;
    for (var t = 0; e; ) {
      if (e.nodeType === 8) {
        var n = e.data;
        if (n === "/$" || n === "/&") {
          if (t === 0)
            return hn(e.nextSibling);
          t--;
        } else
          n !== "$" && n !== "$!" && n !== "$?" && n !== "$~" && n !== "&" || t++;
      }
      e = e.nextSibling;
    }
    return null;
  }
  function Dm(e) {
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
  function Rm(e, t, n) {
    switch (t = cr(n), e) {
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
  function As(e) {
    for (var t = e.attributes; t.length; )
      e.removeAttributeNode(t[0]);
    ac(e);
  }
  var mn = /* @__PURE__ */ new Map(), Hm = /* @__PURE__ */ new Set();
  function ur(e) {
    return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument;
  }
  var Wn = q.d;
  q.d = {
    f: t1,
    r: n1,
    D: l1,
    C: a1,
    L: s1,
    m: i1,
    X: c1,
    S: r1,
    M: u1
  };
  function t1() {
    var e = Wn.f(), t = er();
    return e || t;
  }
  function n1(e) {
    var t = ta(e);
    t !== null && t.tag === 5 && t.type === "form" ? Pd(t) : Wn.r(e);
  }
  var ka = typeof document > "u" ? null : document;
  function Um(e, t, n) {
    var l = ka;
    if (l && typeof t == "string" && t) {
      var i = sn(t);
      i = 'link[rel="' + e + '"][href="' + i + '"]', typeof n == "string" && (i += '[crossorigin="' + n + '"]'), Hm.has(i) || (Hm.add(i), e = { rel: e, crossOrigin: n, href: t }, l.querySelector(i) === null && (t = l.createElement("link"), Et(t, "link", e), _t(t), l.head.appendChild(t)));
    }
  }
  function l1(e) {
    Wn.D(e), Um("dns-prefetch", e, null);
  }
  function a1(e, t) {
    Wn.C(e, t), Um("preconnect", e, t);
  }
  function s1(e, t, n) {
    Wn.L(e, t, n);
    var l = ka;
    if (l && e && t) {
      var i = 'link[rel="preload"][as="' + sn(t) + '"]';
      t === "image" && n && n.imageSrcSet ? (i += '[imagesrcset="' + sn(
        n.imageSrcSet
      ) + '"]', typeof n.imageSizes == "string" && (i += '[imagesizes="' + sn(
        n.imageSizes
      ) + '"]')) : i += '[href="' + sn(e) + '"]';
      var c = i;
      switch (t) {
        case "style":
          c = Da(e);
          break;
        case "script":
          c = Ra(e);
      }
      mn.has(c) || (e = b(
        {
          rel: "preload",
          href: t === "image" && n && n.imageSrcSet ? void 0 : e,
          as: t
        },
        n
      ), mn.set(c, e), l.querySelector(i) !== null || t === "style" && l.querySelector(Cs(c)) || t === "script" && l.querySelector(zs(c)) || (t = l.createElement("link"), Et(t, "link", e), _t(t), l.head.appendChild(t)));
    }
  }
  function i1(e, t) {
    Wn.m(e, t);
    var n = ka;
    if (n && e) {
      var l = t && typeof t.as == "string" ? t.as : "script", i = 'link[rel="modulepreload"][as="' + sn(l) + '"][href="' + sn(e) + '"]', c = i;
      switch (l) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          c = Ra(e);
      }
      if (!mn.has(c) && (e = b({ rel: "modulepreload", href: e }, t), mn.set(c, e), n.querySelector(i) === null)) {
        switch (l) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (n.querySelector(zs(c)))
              return;
        }
        l = n.createElement("link"), Et(l, "link", e), _t(l), n.head.appendChild(l);
      }
    }
  }
  function r1(e, t, n) {
    Wn.S(e, t, n);
    var l = ka;
    if (l && e) {
      var i = na(l).hoistableStyles, c = Da(e);
      t = t || "default";
      var h = i.get(c);
      if (!h) {
        var v = { loading: 0, preload: null };
        if (h = l.querySelector(
          Cs(c)
        ))
          v.loading = 5;
        else {
          e = b(
            { rel: "stylesheet", href: e, "data-precedence": t },
            n
          ), (n = mn.get(c)) && lo(e, n);
          var w = h = l.createElement("link");
          _t(w), Et(w, "link", e), w._p = new Promise(function(E, U) {
            w.onload = E, w.onerror = U;
          }), w.addEventListener("load", function() {
            v.loading |= 1;
          }), w.addEventListener("error", function() {
            v.loading |= 2;
          }), v.loading |= 4, or(h, t, l);
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
  function c1(e, t) {
    Wn.X(e, t);
    var n = ka;
    if (n && e) {
      var l = na(n).hoistableScripts, i = Ra(e), c = l.get(i);
      c || (c = n.querySelector(zs(i)), c || (e = b({ src: e, async: !0 }, t), (t = mn.get(i)) && ao(e, t), c = n.createElement("script"), _t(c), Et(c, "link", e), n.head.appendChild(c)), c = {
        type: "script",
        instance: c,
        count: 1,
        state: null
      }, l.set(i, c));
    }
  }
  function u1(e, t) {
    Wn.M(e, t);
    var n = ka;
    if (n && e) {
      var l = na(n).hoistableScripts, i = Ra(e), c = l.get(i);
      c || (c = n.querySelector(zs(i)), c || (e = b({ src: e, async: !0, type: "module" }, t), (t = mn.get(i)) && ao(e, t), c = n.createElement("script"), _t(c), Et(c, "link", e), n.head.appendChild(c)), c = {
        type: "script",
        instance: c,
        count: 1,
        state: null
      }, l.set(i, c));
    }
  }
  function Lm(e, t, n, l) {
    var i = (i = ye.current) ? ur(i) : null;
    if (!i) throw Error(u(446));
    switch (e) {
      case "meta":
      case "title":
        return null;
      case "style":
        return typeof n.precedence == "string" && typeof n.href == "string" ? (t = Da(n.href), n = na(
          i
        ).hoistableStyles, l = n.get(t), l || (l = {
          type: "style",
          instance: null,
          count: 0,
          state: null
        }, n.set(t, l)), l) : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if (n.rel === "stylesheet" && typeof n.href == "string" && typeof n.precedence == "string") {
          e = Da(n.href);
          var c = na(
            i
          ).hoistableStyles, h = c.get(e);
          if (h || (i = i.ownerDocument || i, h = {
            type: "stylesheet",
            instance: null,
            count: 0,
            state: { loading: 0, preload: null }
          }, c.set(e, h), (c = i.querySelector(
            Cs(e)
          )) && !c._p && (h.instance = c, h.state.loading = 5), mn.has(e) || (n = {
            rel: "preload",
            as: "style",
            href: n.href,
            crossOrigin: n.crossOrigin,
            integrity: n.integrity,
            media: n.media,
            hrefLang: n.hrefLang,
            referrerPolicy: n.referrerPolicy
          }, mn.set(e, n), c || o1(
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
        return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = Ra(n), n = na(
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
  function Da(e) {
    return 'href="' + sn(e) + '"';
  }
  function Cs(e) {
    return 'link[rel="stylesheet"][' + e + "]";
  }
  function Bm(e) {
    return b({}, e, {
      "data-precedence": e.precedence,
      precedence: null
    });
  }
  function o1(e, t, n, l) {
    e.querySelector('link[rel="preload"][as="style"][' + t + "]") ? l.loading = 1 : (t = e.createElement("link"), l.preload = t, t.addEventListener("load", function() {
      return l.loading |= 1;
    }), t.addEventListener("error", function() {
      return l.loading |= 2;
    }), Et(t, "link", n), _t(t), e.head.appendChild(t));
  }
  function Ra(e) {
    return '[src="' + sn(e) + '"]';
  }
  function zs(e) {
    return "script[async]" + e;
  }
  function qm(e, t, n) {
    if (t.count++, t.instance === null)
      switch (t.type) {
        case "style":
          var l = e.querySelector(
            'style[data-href~="' + sn(n.href) + '"]'
          );
          if (l)
            return t.instance = l, _t(l), l;
          var i = b({}, n, {
            "data-href": n.href,
            "data-precedence": n.precedence,
            href: null,
            precedence: null
          });
          return l = (e.ownerDocument || e).createElement(
            "style"
          ), _t(l), Et(l, "style", i), or(l, n.precedence, e), t.instance = l;
        case "stylesheet":
          i = Da(n.href);
          var c = e.querySelector(
            Cs(i)
          );
          if (c)
            return t.state.loading |= 4, t.instance = c, _t(c), c;
          l = Bm(n), (i = mn.get(i)) && lo(l, i), c = (e.ownerDocument || e).createElement("link"), _t(c);
          var h = c;
          return h._p = new Promise(function(v, w) {
            h.onload = v, h.onerror = w;
          }), Et(c, "link", l), t.state.loading |= 4, or(c, n.precedence, e), t.instance = c;
        case "script":
          return c = Ra(n.src), (i = e.querySelector(
            zs(c)
          )) ? (t.instance = i, _t(i), i) : (l = n, (i = mn.get(c)) && (l = b({}, n), ao(l, i)), e = e.ownerDocument || e, i = e.createElement("script"), _t(i), Et(i, "link", l), e.head.appendChild(i), t.instance = i);
        case "void":
          return null;
        default:
          throw Error(u(443, t.type));
      }
    else
      t.type === "stylesheet" && (t.state.loading & 4) === 0 && (l = t.instance, t.state.loading |= 4, or(l, n.precedence, e));
    return t.instance;
  }
  function or(e, t, n) {
    for (var l = n.querySelectorAll(
      'link[rel="stylesheet"][data-precedence],style[data-precedence]'
    ), i = l.length ? l[l.length - 1] : null, c = i, h = 0; h < l.length; h++) {
      var v = l[h];
      if (v.dataset.precedence === t) c = v;
      else if (c !== i) break;
    }
    c ? c.parentNode.insertBefore(e, c.nextSibling) : (t = n.nodeType === 9 ? n.head : n, t.insertBefore(e, t.firstChild));
  }
  function lo(e, t) {
    e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.title == null && (e.title = t.title);
  }
  function ao(e, t) {
    e.crossOrigin == null && (e.crossOrigin = t.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy), e.integrity == null && (e.integrity = t.integrity);
  }
  var fr = null;
  function Ym(e, t, n) {
    if (fr === null) {
      var l = /* @__PURE__ */ new Map(), i = fr = /* @__PURE__ */ new Map();
      i.set(n, l);
    } else
      i = fr, l = i.get(n), l || (l = /* @__PURE__ */ new Map(), i.set(n, l));
    if (l.has(e)) return l;
    for (l.set(e, null), n = n.getElementsByTagName(e), i = 0; i < n.length; i++) {
      var c = n[i];
      if (!(c[Ka] || c[jt] || e === "link" && c.getAttribute("rel") === "stylesheet") && c.namespaceURI !== "http://www.w3.org/2000/svg") {
        var h = c.getAttribute(t) || "";
        h = e + h;
        var v = l.get(h);
        v ? v.push(c) : l.set(h, [c]);
      }
    }
    return l;
  }
  function Gm(e, t, n) {
    e = e.ownerDocument || e, e.head.insertBefore(
      n,
      t === "title" ? e.querySelector("head > title") : null
    );
  }
  function f1(e, t, n) {
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
  function Vm(e) {
    return !(e.type === "stylesheet" && (e.state.loading & 3) === 0);
  }
  function d1(e, t, n, l) {
    if (n.type === "stylesheet" && (typeof l.media != "string" || matchMedia(l.media).matches !== !1) && (n.state.loading & 4) === 0) {
      if (n.instance === null) {
        var i = Da(l.href), c = t.querySelector(
          Cs(i)
        );
        if (c) {
          t = c._p, t !== null && typeof t == "object" && typeof t.then == "function" && (e.count++, e = dr.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = c, _t(c);
          return;
        }
        c = t.ownerDocument || t, l = Bm(l), (i = mn.get(i)) && lo(l, i), c = c.createElement("link"), _t(c);
        var h = c;
        h._p = new Promise(function(v, w) {
          h.onload = v, h.onerror = w;
        }), Et(c, "link", l), n.instance = c;
      }
      e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(n, t), (t = n.state.preload) && (n.state.loading & 3) === 0 && (e.count++, n = dr.bind(e), t.addEventListener("load", n), t.addEventListener("error", n));
    }
  }
  var so = 0;
  function h1(e, t) {
    return e.stylesheets && e.count === 0 && mr(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(n) {
      var l = setTimeout(function() {
        if (e.stylesheets && mr(e, e.stylesheets), e.unsuspend) {
          var c = e.unsuspend;
          e.unsuspend = null, c();
        }
      }, 6e4 + t);
      0 < e.imgBytes && so === 0 && (so = 62500 * Ky());
      var i = setTimeout(
        function() {
          if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && mr(e, e.stylesheets), e.unsuspend)) {
            var c = e.unsuspend;
            e.unsuspend = null, c();
          }
        },
        (e.imgBytes > so ? 50 : 800) + t
      );
      return e.unsuspend = n, function() {
        e.unsuspend = null, clearTimeout(l), clearTimeout(i);
      };
    } : null;
  }
  function dr() {
    if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
      if (this.stylesheets) mr(this, this.stylesheets);
      else if (this.unsuspend) {
        var e = this.unsuspend;
        this.unsuspend = null, e();
      }
    }
  }
  var hr = null;
  function mr(e, t) {
    e.stylesheets = null, e.unsuspend !== null && (e.count++, hr = /* @__PURE__ */ new Map(), t.forEach(m1, e), hr = null, dr.call(e));
  }
  function m1(e, t) {
    if (!(t.state.loading & 4)) {
      var n = hr.get(e);
      if (n) var l = n.get(null);
      else {
        n = /* @__PURE__ */ new Map(), hr.set(e, n);
        for (var i = e.querySelectorAll(
          "link[data-precedence],style[data-precedence]"
        ), c = 0; c < i.length; c++) {
          var h = i[c];
          (h.nodeName === "LINK" || h.getAttribute("media") !== "not all") && (n.set(h.dataset.precedence, h), l = h);
        }
        l && n.set(null, l);
      }
      i = t.instance, h = i.getAttribute("data-precedence"), c = n.get(h) || l, c === l && n.set(null, i), n.set(h, i), this.count++, l = dr.bind(this), i.addEventListener("load", l), i.addEventListener("error", l), c ? c.parentNode.insertBefore(i, c.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(i, e.firstChild)), t.state.loading |= 4;
    }
  }
  var Os = {
    $$typeof: P,
    Provider: null,
    Consumer: null,
    _currentValue: W,
    _currentValue2: W,
    _threadCount: 0
  };
  function p1(e, t, n, l, i, c, h, v, w) {
    this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = ec(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = ec(0), this.hiddenUpdates = ec(null), this.identifierPrefix = l, this.onUncaughtError = i, this.onCaughtError = c, this.onRecoverableError = h, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = w, this.incompleteTransitions = /* @__PURE__ */ new Map();
  }
  function Xm(e, t, n, l, i, c, h, v, w, E, U, B) {
    return e = new p1(
      e,
      t,
      n,
      h,
      w,
      E,
      U,
      B,
      v
    ), t = 1, c === !0 && (t |= 24), c = $t(3, null, null, t), e.current = c, c.stateNode = e, t = Lc(), t.refCount++, e.pooledCache = t, t.refCount++, c.memoizedState = {
      element: l,
      isDehydrated: n,
      cache: t
    }, Gc(c), e;
  }
  function Qm(e) {
    return e ? (e = da, e) : da;
  }
  function Zm(e, t, n, l, i, c) {
    i = Qm(i), l.context === null ? l.context = i : l.pendingContext = i, l = ul(t), l.payload = { element: n }, c = c === void 0 ? null : c, c !== null && (l.callback = c), n = ol(e, l, t), n !== null && (Yt(n, e, t), os(n, e, t));
  }
  function Km(e, t) {
    if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
      var n = e.retryLane;
      e.retryLane = n !== 0 && n < t ? n : t;
    }
  }
  function io(e, t) {
    Km(e, t), (e = e.alternate) && Km(e, t);
  }
  function Jm(e) {
    if (e.tag === 13 || e.tag === 31) {
      var t = Dl(e, 67108864);
      t !== null && Yt(t, e, 67108864), io(e, 67108864);
    }
  }
  function $m(e) {
    if (e.tag === 13 || e.tag === 31) {
      var t = en();
      t = tc(t);
      var n = Dl(e, t);
      n !== null && Yt(n, e, t), io(e, t);
    }
  }
  var pr = !0;
  function g1(e, t, n, l) {
    var i = A.T;
    A.T = null;
    var c = q.p;
    try {
      q.p = 2, ro(e, t, n, l);
    } finally {
      q.p = c, A.T = i;
    }
  }
  function y1(e, t, n, l) {
    var i = A.T;
    A.T = null;
    var c = q.p;
    try {
      q.p = 8, ro(e, t, n, l);
    } finally {
      q.p = c, A.T = i;
    }
  }
  function ro(e, t, n, l) {
    if (pr) {
      var i = co(l);
      if (i === null)
        Ku(
          e,
          t,
          l,
          gr,
          n
        ), Fm(e, l);
      else if (x1(
        i,
        e,
        t,
        n,
        l
      ))
        l.stopPropagation();
      else if (Fm(e, l), t & 4 && -1 < v1.indexOf(e)) {
        for (; i !== null; ) {
          var c = ta(i);
          if (c !== null)
            switch (c.tag) {
              case 3:
                if (c = c.stateNode, c.current.memoizedState.isDehydrated) {
                  var h = jn(c.pendingLanes);
                  if (h !== 0) {
                    var v = c;
                    for (v.pendingLanes |= 2, v.entangledLanes |= 2; h; ) {
                      var w = 1 << 31 - xt(h);
                      v.entanglements[1] |= w, h &= ~w;
                    }
                    En(c), (Le & 6) === 0 && (Ii = Fe() + 500, Ms(0));
                  }
                }
                break;
              case 31:
              case 13:
                v = Dl(c, 2), v !== null && Yt(v, c, 2), er(), io(c, 2);
            }
          if (c = co(l), c === null && Ku(
            e,
            t,
            l,
            gr,
            n
          ), c === i) break;
          i = c;
        }
        i !== null && l.stopPropagation();
      } else
        Ku(
          e,
          t,
          l,
          null,
          n
        );
    }
  }
  function co(e) {
    return e = oc(e), uo(e);
  }
  var gr = null;
  function uo(e) {
    if (gr = null, e = ea(e), e !== null) {
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
    return gr = e, null;
  }
  function Wm(e) {
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
        switch (ft()) {
          case Ie:
            return 2;
          case St:
            return 8;
          case Qt:
          case On:
            return 32;
          case Sn:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var oo = !1, bl = null, wl = null, Sl = null, ks = /* @__PURE__ */ new Map(), Ds = /* @__PURE__ */ new Map(), jl = [], v1 = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
    " "
  );
  function Fm(e, t) {
    switch (e) {
      case "focusin":
      case "focusout":
        bl = null;
        break;
      case "dragenter":
      case "dragleave":
        wl = null;
        break;
      case "mouseover":
      case "mouseout":
        Sl = null;
        break;
      case "pointerover":
      case "pointerout":
        ks.delete(t.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        Ds.delete(t.pointerId);
    }
  }
  function Rs(e, t, n, l, i, c) {
    return e === null || e.nativeEvent !== c ? (e = {
      blockedOn: t,
      domEventName: n,
      eventSystemFlags: l,
      nativeEvent: c,
      targetContainers: [i]
    }, t !== null && (t = ta(t), t !== null && Jm(t)), e) : (e.eventSystemFlags |= l, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
  }
  function x1(e, t, n, l, i) {
    switch (t) {
      case "focusin":
        return bl = Rs(
          bl,
          e,
          t,
          n,
          l,
          i
        ), !0;
      case "dragenter":
        return wl = Rs(
          wl,
          e,
          t,
          n,
          l,
          i
        ), !0;
      case "mouseover":
        return Sl = Rs(
          Sl,
          e,
          t,
          n,
          l,
          i
        ), !0;
      case "pointerover":
        var c = i.pointerId;
        return ks.set(
          c,
          Rs(
            ks.get(c) || null,
            e,
            t,
            n,
            l,
            i
          )
        ), !0;
      case "gotpointercapture":
        return c = i.pointerId, Ds.set(
          c,
          Rs(
            Ds.get(c) || null,
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
  function Im(e) {
    var t = ea(e.target);
    if (t !== null) {
      var n = d(t);
      if (n !== null) {
        if (t = n.tag, t === 13) {
          if (t = m(n), t !== null) {
            e.blockedOn = t, df(e.priority, function() {
              $m(n);
            });
            return;
          }
        } else if (t === 31) {
          if (t = p(n), t !== null) {
            e.blockedOn = t, df(e.priority, function() {
              $m(n);
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
  function yr(e) {
    if (e.blockedOn !== null) return !1;
    for (var t = e.targetContainers; 0 < t.length; ) {
      var n = co(e.nativeEvent);
      if (n === null) {
        n = e.nativeEvent;
        var l = new n.constructor(
          n.type,
          n
        );
        uc = l, n.target.dispatchEvent(l), uc = null;
      } else
        return t = ta(n), t !== null && Jm(t), e.blockedOn = n, !1;
      t.shift();
    }
    return !0;
  }
  function Pm(e, t, n) {
    yr(e) && n.delete(t);
  }
  function _1() {
    oo = !1, bl !== null && yr(bl) && (bl = null), wl !== null && yr(wl) && (wl = null), Sl !== null && yr(Sl) && (Sl = null), ks.forEach(Pm), Ds.forEach(Pm);
  }
  function vr(e, t) {
    e.blockedOn === t && (e.blockedOn = null, oo || (oo = !0, a.unstable_scheduleCallback(
      a.unstable_NormalPriority,
      _1
    )));
  }
  var xr = null;
  function e0(e) {
    xr !== e && (xr = e, a.unstable_scheduleCallback(
      a.unstable_NormalPriority,
      function() {
        xr === e && (xr = null);
        for (var t = 0; t < e.length; t += 3) {
          var n = e[t], l = e[t + 1], i = e[t + 2];
          if (typeof l != "function") {
            if (uo(l || n) === null)
              continue;
            break;
          }
          var c = ta(n);
          c !== null && (e.splice(t, 3), t -= 3, cu(
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
  function Ha(e) {
    function t(w) {
      return vr(w, e);
    }
    bl !== null && vr(bl, e), wl !== null && vr(wl, e), Sl !== null && vr(Sl, e), ks.forEach(t), Ds.forEach(t);
    for (var n = 0; n < jl.length; n++) {
      var l = jl[n];
      l.blockedOn === e && (l.blockedOn = null);
    }
    for (; 0 < jl.length && (n = jl[0], n.blockedOn === null); )
      Im(n), n.blockedOn === null && jl.shift();
    if (n = (e.ownerDocument || e).$$reactFormReplay, n != null)
      for (l = 0; l < n.length; l += 3) {
        var i = n[l], c = n[l + 1], h = i[Rt] || null;
        if (typeof c == "function")
          h || e0(n);
        else if (h) {
          var v = null;
          if (c && c.hasAttribute("formAction")) {
            if (i = c, h = c[Rt] || null)
              v = h.formAction;
            else if (uo(i) !== null) continue;
          } else v = h.action;
          typeof v == "function" ? n[l + 1] = v : (n.splice(l, 3), l -= 3), e0(n);
        }
      }
  }
  function t0() {
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
  function fo(e) {
    this._internalRoot = e;
  }
  _r.prototype.render = fo.prototype.render = function(e) {
    var t = this._internalRoot;
    if (t === null) throw Error(u(409));
    var n = t.current, l = en();
    Zm(n, l, e, t, null, null);
  }, _r.prototype.unmount = fo.prototype.unmount = function() {
    var e = this._internalRoot;
    if (e !== null) {
      this._internalRoot = null;
      var t = e.containerInfo;
      Zm(e.current, 2, null, e, null, null), er(), t[Pl] = null;
    }
  };
  function _r(e) {
    this._internalRoot = e;
  }
  _r.prototype.unstable_scheduleHydration = function(e) {
    if (e) {
      var t = ff();
      e = { blockedOn: null, target: e, priority: t };
      for (var n = 0; n < jl.length && t !== 0 && t < jl[n].priority; n++) ;
      jl.splice(n, 0, e), n === 0 && Im(e);
    }
  };
  var n0 = s.version;
  if (n0 !== "19.2.5")
    throw Error(
      u(
        527,
        n0,
        "19.2.5"
      )
    );
  q.findDOMNode = function(e) {
    var t = e._reactInternals;
    if (t === void 0)
      throw typeof e.render == "function" ? Error(u(188)) : (e = Object.keys(e).join(","), Error(u(268, e)));
    return e = g(t), e = e !== null ? x(e) : null, e = e === null ? null : e.stateNode, e;
  };
  var b1 = {
    bundleType: 0,
    version: "19.2.5",
    rendererPackageName: "react-dom",
    currentDispatcherRef: A,
    reconcilerVersion: "19.2.5"
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var br = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!br.isDisabled && br.supportsFiber)
      try {
        we = br.inject(
          b1
        ), ke = br;
      } catch {
      }
  }
  return Us.createRoot = function(e, t) {
    if (!f(e)) throw Error(u(299));
    var n = !1, l = "", i = uh, c = oh, h = fh;
    return t != null && (t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (l = t.identifierPrefix), t.onUncaughtError !== void 0 && (i = t.onUncaughtError), t.onCaughtError !== void 0 && (c = t.onCaughtError), t.onRecoverableError !== void 0 && (h = t.onRecoverableError)), t = Xm(
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
      t0
    ), e[Pl] = t.current, Zu(e), new fo(t);
  }, Us.hydrateRoot = function(e, t, n) {
    if (!f(e)) throw Error(u(299));
    var l = !1, i = "", c = uh, h = oh, v = fh, w = null;
    return n != null && (n.unstable_strictMode === !0 && (l = !0), n.identifierPrefix !== void 0 && (i = n.identifierPrefix), n.onUncaughtError !== void 0 && (c = n.onUncaughtError), n.onCaughtError !== void 0 && (h = n.onCaughtError), n.onRecoverableError !== void 0 && (v = n.onRecoverableError), n.formState !== void 0 && (w = n.formState)), t = Xm(
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
      t0
    ), t.context = Qm(null), n = t.current, l = en(), l = tc(l), i = ul(l), i.callback = null, ol(n, i, l), n = l, t.current.lanes = n, Za(t, n), En(t), e[Pl] = t.current, Zu(e), new _r(t);
  }, Us.version = "19.2.5", Us;
}
var d0;
function k1() {
  if (d0) return mo.exports;
  d0 = 1;
  function a() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(a);
      } catch (s) {
        console.error(s);
      }
  }
  return a(), mo.exports = O1(), mo.exports;
}
var D1 = k1(), D = Qo();
class I0 {
  constructor() {
    wr(this, "_hass", null);
    wr(this, "_entityListeners", /* @__PURE__ */ new Map());
    wr(this, "_globalListeners", /* @__PURE__ */ new Set());
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
const P0 = D.createContext(new I0());
function ti() {
  return D.useContext(P0);
}
function R1({ children: a }) {
  const s = D.useRef(new I0());
  return D.useEffect(() => {
    const r = () => {
      const f = window.__HASS__;
      f && s.current.update(f);
    };
    window.addEventListener("hass-updated", r);
    const u = () => {
      document.hidden || r();
    };
    return document.addEventListener("visibilitychange", u), r(), () => {
      window.removeEventListener("hass-updated", r), document.removeEventListener("visibilitychange", u);
    };
  }, []), /* @__PURE__ */ o.jsx(P0.Provider, { value: s.current, children: a });
}
function Fl(a, s = 24) {
  const r = ti(), [u, f] = D.useState([]), [d, m] = D.useState(!1), p = D.useRef(null), y = D.useRef(0), g = D.useCallback(() => {
    if (!a) return;
    const x = r.getEntity(a);
    if (!x) return;
    const b = x.state, S = parseFloat(b);
    if (!Number.isFinite(S)) return;
    const N = new Date(x.last_updated || x.last_changed).getTime();
    !Number.isFinite(N) || N <= y.current || (y.current = N, f((z) => [...z, { t: N, v: S }]));
  }, [a, r]);
  return D.useEffect(() => {
    var P, X, J;
    if (!a) {
      f([]);
      return;
    }
    const x = r.hass;
    if (!x) return;
    (P = p.current) == null || P.abort();
    const b = new AbortController();
    p.current = b, m(!0);
    const S = /* @__PURE__ */ new Date(), z = new Date(S.getTime() - s * 36e5).toISOString(), R = S.toISOString(), G = `${window.__HA_BASE_URL__ || ""}/api/history/period/${z}?end_time=${R}&filter_entity_id=${encodeURIComponent(a)}&minimal_response&no_attributes`, $ = (J = (X = x.auth) == null ? void 0 : X.data) == null ? void 0 : J.access_token;
    return fetch(G, {
      headers: { Authorization: `Bearer ${$}`, "Content-Type": "application/json" },
      signal: b.signal
    }).then((ne) => {
      if (!ne.ok) throw new Error(`HTTP ${ne.status}`);
      return ne.json();
    }).then((ne) => {
      if (b.signal.aborted) return;
      const Z = [], ee = (ne == null ? void 0 : ne[0]) ?? [];
      for (const ge of ee) {
        const _e = parseFloat(ge.state ?? ge.s);
        if (!Number.isFinite(_e)) continue;
        const ce = new Date(ge.last_changed ?? ge.lu * 1e3).getTime();
        Number.isFinite(ce) && Z.push({ t: ce, v: _e });
      }
      f(Z), y.current = Z.length > 0 ? Z[Z.length - 1].t : 0;
    }).catch((ne) => {
      ne.name !== "AbortError" && console.error("[useHistory]", ne);
    }).finally(() => {
      b.signal.aborted || m(!1);
    }), () => b.abort();
  }, [a, s, r]), D.useEffect(() => {
    if (a)
      return r.subscribeEntity(a, g);
  }, [a, r, g]), { data: u, loading: d };
}
function re(a) {
  const s = ti(), r = D.useCallback(
    (f) => s.subscribeEntity(a, f),
    [s, a]
  ), u = D.useCallback(
    () => s.getEntity(a),
    [s, a]
  );
  return D.useSyncExternalStore(r, u);
}
function Y(a) {
  const s = re(a), r = s == null ? void 0 : s.state;
  if (r === void 0 || r === "unknown" || r === "unavailable")
    return { value: null, entity: s };
  const u = Number(r);
  return { value: Number.isFinite(u) ? u : null, entity: s };
}
function ep(a) {
  var s, r, u = "";
  if (typeof a == "string" || typeof a == "number") u += a;
  else if (typeof a == "object") if (Array.isArray(a)) {
    var f = a.length;
    for (s = 0; s < f; s++) a[s] && (r = ep(a[s])) && (u && (u += " "), u += r);
  } else for (r in a) a[r] && (u && (u += " "), u += r);
  return u;
}
function tp() {
  for (var a, s, r = 0, u = "", f = arguments.length; r < f; r++) (a = arguments[r]) && (s = ep(a)) && (u && (u += " "), u += s);
  return u;
}
const Zo = "-", H1 = (a) => {
  const s = L1(a), {
    conflictingClassGroups: r,
    conflictingClassGroupModifiers: u
  } = a;
  return {
    getClassGroupId: (m) => {
      const p = m.split(Zo);
      return p[0] === "" && p.length !== 1 && p.shift(), np(p, s) || U1(m);
    },
    getConflictingClassGroupIds: (m, p) => {
      const y = r[m] || [];
      return p && u[m] ? [...y, ...u[m]] : y;
    }
  };
}, np = (a, s) => {
  var m;
  if (a.length === 0)
    return s.classGroupId;
  const r = a[0], u = s.nextPart.get(r), f = u ? np(a.slice(1), u) : void 0;
  if (f)
    return f;
  if (s.validators.length === 0)
    return;
  const d = a.join(Zo);
  return (m = s.validators.find(({
    validator: p
  }) => p(d))) == null ? void 0 : m.classGroupId;
}, h0 = /^\[(.+)\]$/, U1 = (a) => {
  if (h0.test(a)) {
    const s = h0.exec(a)[1], r = s == null ? void 0 : s.substring(0, s.indexOf(":"));
    if (r)
      return "arbitrary.." + r;
  }
}, L1 = (a) => {
  const {
    theme: s,
    prefix: r
  } = a, u = {
    nextPart: /* @__PURE__ */ new Map(),
    validators: []
  };
  return q1(Object.entries(a.classGroups), r).forEach(([d, m]) => {
    zo(m, u, d, s);
  }), u;
}, zo = (a, s, r, u) => {
  a.forEach((f) => {
    if (typeof f == "string") {
      const d = f === "" ? s : m0(s, f);
      d.classGroupId = r;
      return;
    }
    if (typeof f == "function") {
      if (B1(f)) {
        zo(f(u), s, r, u);
        return;
      }
      s.validators.push({
        validator: f,
        classGroupId: r
      });
      return;
    }
    Object.entries(f).forEach(([d, m]) => {
      zo(m, m0(s, d), r, u);
    });
  });
}, m0 = (a, s) => {
  let r = a;
  return s.split(Zo).forEach((u) => {
    r.nextPart.has(u) || r.nextPart.set(u, {
      nextPart: /* @__PURE__ */ new Map(),
      validators: []
    }), r = r.nextPart.get(u);
  }), r;
}, B1 = (a) => a.isThemeGetter, q1 = (a, s) => s ? a.map(([r, u]) => {
  const f = u.map((d) => typeof d == "string" ? s + d : typeof d == "object" ? Object.fromEntries(Object.entries(d).map(([m, p]) => [s + m, p])) : d);
  return [r, f];
}) : a, Y1 = (a) => {
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
}, lp = "!", G1 = (a) => {
  const {
    separator: s,
    experimentalParseClassName: r
  } = a, u = s.length === 1, f = s[0], d = s.length, m = (p) => {
    const y = [];
    let g = 0, x = 0, b;
    for (let H = 0; H < p.length; H++) {
      let G = p[H];
      if (g === 0) {
        if (G === f && (u || p.slice(H, H + d) === s)) {
          y.push(p.slice(x, H)), x = H + d;
          continue;
        }
        if (G === "/") {
          b = H;
          continue;
        }
      }
      G === "[" ? g++ : G === "]" && g--;
    }
    const S = y.length === 0 ? p : p.substring(x), N = S.startsWith(lp), z = N ? S.substring(1) : S, R = b && b > x ? b - x : void 0;
    return {
      modifiers: y,
      hasImportantModifier: N,
      baseClassName: z,
      maybePostfixModifierPosition: R
    };
  };
  return r ? (p) => r({
    className: p,
    parseClassName: m
  }) : m;
}, V1 = (a) => {
  if (a.length <= 1)
    return a;
  const s = [];
  let r = [];
  return a.forEach((u) => {
    u[0] === "[" ? (s.push(...r.sort(), u), r = []) : r.push(u);
  }), s.push(...r.sort()), s;
}, X1 = (a) => ({
  cache: Y1(a.cacheSize),
  parseClassName: G1(a),
  ...H1(a)
}), Q1 = /\s+/, Z1 = (a, s) => {
  const {
    parseClassName: r,
    getClassGroupId: u,
    getConflictingClassGroupIds: f
  } = s, d = [], m = a.trim().split(Q1);
  let p = "";
  for (let y = m.length - 1; y >= 0; y -= 1) {
    const g = m[y], {
      modifiers: x,
      hasImportantModifier: b,
      baseClassName: S,
      maybePostfixModifierPosition: N
    } = r(g);
    let z = !!N, R = u(z ? S.substring(0, N) : S);
    if (!R) {
      if (!z) {
        p = g + (p.length > 0 ? " " + p : p);
        continue;
      }
      if (R = u(S), !R) {
        p = g + (p.length > 0 ? " " + p : p);
        continue;
      }
      z = !1;
    }
    const H = V1(x).join(":"), G = b ? H + lp : H, $ = G + R;
    if (d.includes($))
      continue;
    d.push($);
    const P = f(R, z);
    for (let X = 0; X < P.length; ++X) {
      const J = P[X];
      d.push(G + J);
    }
    p = g + (p.length > 0 ? " " + p : p);
  }
  return p;
};
function K1() {
  let a = 0, s, r, u = "";
  for (; a < arguments.length; )
    (s = arguments[a++]) && (r = ap(s)) && (u && (u += " "), u += r);
  return u;
}
const ap = (a) => {
  if (typeof a == "string")
    return a;
  let s, r = "";
  for (let u = 0; u < a.length; u++)
    a[u] && (s = ap(a[u])) && (r && (r += " "), r += s);
  return r;
};
function J1(a, ...s) {
  let r, u, f, d = m;
  function m(y) {
    const g = s.reduce((x, b) => b(x), a());
    return r = X1(g), u = r.cache.get, f = r.cache.set, d = p, p(y);
  }
  function p(y) {
    const g = u(y);
    if (g)
      return g;
    const x = Z1(y, r);
    return f(y, x), x;
  }
  return function() {
    return d(K1.apply(null, arguments));
  };
}
const tt = (a) => {
  const s = (r) => r[a] || [];
  return s.isThemeGetter = !0, s;
}, sp = /^\[(?:([a-z-]+):)?(.+)\]$/i, $1 = /^\d+\/\d+$/, W1 = /* @__PURE__ */ new Set(["px", "full", "screen"]), F1 = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, I1 = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, P1 = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, ev = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, tv = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, Fn = (a) => Ua(a) || W1.has(a) || $1.test(a), Ml = (a) => Ya(a, "length", uv), Ua = (a) => !!a && !Number.isNaN(Number(a)), xo = (a) => Ya(a, "number", Ua), Ls = (a) => !!a && Number.isInteger(Number(a)), nv = (a) => a.endsWith("%") && Ua(a.slice(0, -1)), Ne = (a) => sp.test(a), Tl = (a) => F1.test(a), lv = /* @__PURE__ */ new Set(["length", "size", "percentage"]), av = (a) => Ya(a, lv, ip), sv = (a) => Ya(a, "position", ip), iv = /* @__PURE__ */ new Set(["image", "url"]), rv = (a) => Ya(a, iv, fv), cv = (a) => Ya(a, "", ov), Bs = () => !0, Ya = (a, s, r) => {
  const u = sp.exec(a);
  return u ? u[1] ? typeof s == "string" ? u[1] === s : s.has(u[1]) : r(u[2]) : !1;
}, uv = (a) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  I1.test(a) && !P1.test(a)
), ip = () => !1, ov = (a) => ev.test(a), fv = (a) => tv.test(a), dv = () => {
  const a = tt("colors"), s = tt("spacing"), r = tt("blur"), u = tt("brightness"), f = tt("borderColor"), d = tt("borderRadius"), m = tt("borderSpacing"), p = tt("borderWidth"), y = tt("contrast"), g = tt("grayscale"), x = tt("hueRotate"), b = tt("invert"), S = tt("gap"), N = tt("gradientColorStops"), z = tt("gradientColorStopPositions"), R = tt("inset"), H = tt("margin"), G = tt("opacity"), $ = tt("padding"), P = tt("saturate"), X = tt("scale"), J = tt("sepia"), ne = tt("skew"), Z = tt("space"), ee = tt("translate"), ge = () => ["auto", "contain", "none"], _e = () => ["auto", "hidden", "clip", "visible", "scroll"], ce = () => ["auto", Ne, s], oe = () => [Ne, s], Me = () => ["", Fn, Ml], K = () => ["auto", Ua, Ne], ve = () => ["bottom", "center", "left", "left-bottom", "left-top", "right", "right-bottom", "right-top", "top"], A = () => ["solid", "dashed", "dotted", "double", "none"], q = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], W = () => ["start", "end", "center", "between", "around", "evenly", "stretch"], he = () => ["", "0", Ne], me = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], _ = () => [Ua, Ne];
  return {
    cacheSize: 500,
    separator: ":",
    theme: {
      colors: [Bs],
      spacing: [Fn, Ml],
      blur: ["none", "", Tl, Ne],
      brightness: _(),
      borderColor: [a],
      borderRadius: ["none", "", "full", Tl, Ne],
      borderSpacing: oe(),
      borderWidth: Me(),
      contrast: _(),
      grayscale: he(),
      hueRotate: _(),
      invert: he(),
      gap: oe(),
      gradientColorStops: [a],
      gradientColorStopPositions: [nv, Ml],
      inset: ce(),
      margin: ce(),
      opacity: _(),
      padding: oe(),
      saturate: _(),
      scale: _(),
      sepia: he(),
      skew: _(),
      space: oe(),
      translate: oe()
    },
    classGroups: {
      // Layout
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", "video", Ne]
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
        columns: [Tl]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": me()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": me()
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
        object: [...ve(), Ne]
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: _e()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": _e()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": _e()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: ge()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": ge()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": ge()
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
        inset: [R]
      }],
      /**
       * Right / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": [R]
      }],
      /**
       * Top / Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": [R]
      }],
      /**
       * Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      start: [{
        start: [R]
      }],
      /**
       * End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      end: [{
        end: [R]
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: [R]
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: [R]
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: [R]
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: [R]
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
        z: ["auto", Ls, Ne]
      }],
      // Flexbox and Grid
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: ce()
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
        flex: ["1", "auto", "initial", "none", Ne]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: he()
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: he()
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: ["first", "last", "none", Ls, Ne]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": [Bs]
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: ["auto", {
          span: ["full", Ls, Ne]
        }, Ne]
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": K()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": K()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": [Bs]
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: ["auto", {
          span: [Ls, Ne]
        }, Ne]
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": K()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": K()
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
        "auto-cols": ["auto", "min", "max", "fr", Ne]
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": ["auto", "min", "max", "fr", Ne]
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
        justify: ["normal", ...W()]
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
        content: ["normal", ...W(), "baseline"]
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
        "place-content": [...W(), "baseline"]
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
        p: [$]
      }],
      /**
       * Padding X
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: [$]
      }],
      /**
       * Padding Y
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: [$]
      }],
      /**
       * Padding Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: [$]
      }],
      /**
       * Padding End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: [$]
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: [$]
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: [$]
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: [$]
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: [$]
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: [H]
      }],
      /**
       * Margin X
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: [H]
      }],
      /**
       * Margin Y
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: [H]
      }],
      /**
       * Margin Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: [H]
      }],
      /**
       * Margin End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: [H]
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: [H]
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: [H]
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: [H]
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: [H]
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/space
       */
      "space-x": [{
        "space-x": [Z]
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
        "space-y": [Z]
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
        w: ["auto", "min", "max", "fit", "svw", "lvw", "dvw", Ne, s]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [Ne, s, "min", "max", "fit"]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [Ne, s, "none", "full", "min", "max", "fit", "prose", {
          screen: [Tl]
        }, Tl]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: [Ne, s, "auto", "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": [Ne, s, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": [Ne, s, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Size
       * @see https://tailwindcss.com/docs/size
       */
      size: [{
        size: [Ne, s, "auto", "min", "max", "fit"]
      }],
      // Typography
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", Tl, Ml]
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
        font: ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black", xo]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [Bs]
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
        tracking: ["tighter", "tight", "normal", "wide", "wider", "widest", Ne]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": ["none", Ua, xo]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: ["none", "tight", "snug", "normal", "relaxed", "loose", Fn, Ne]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", Ne]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["none", "disc", "decimal", Ne]
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
        "placeholder-opacity": [G]
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
        "text-opacity": [G]
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
        decoration: [...A(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: ["auto", "from-font", Fn, Ml]
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": ["auto", Fn, Ne]
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
        indent: oe()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", Ne]
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
        content: ["none", Ne]
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
        "bg-opacity": [G]
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
        bg: [...ve(), sv]
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
        bg: ["auto", "cover", "contain", av]
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          "gradient-to": ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
        }, rv]
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
        from: [z]
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: [z]
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: [z]
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: [N]
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: [N]
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: [N]
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
        "border-opacity": [G]
      }],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [...A(), "hidden"]
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
        "divide-opacity": [G]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/divide-style
       */
      "divide-style": [{
        divide: A()
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
        outline: ["", ...A()]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [Fn, Ne]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: [Fn, Ml]
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
        "ring-opacity": [G]
      }],
      /**
       * Ring Offset Width
       * @see https://tailwindcss.com/docs/ring-offset-width
       */
      "ring-offset-w": [{
        "ring-offset": [Fn, Ml]
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
        shadow: ["", "inner", "none", Tl, cv]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow-color
       */
      "shadow-color": [{
        shadow: [Bs]
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [G]
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
        "drop-shadow": ["", "none", Tl, Ne]
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
        invert: [b]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [P]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: [J]
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
        "backdrop-invert": [b]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [G]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [P]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": [J]
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
        transition: ["none", "all", "", "colors", "opacity", "shadow", "transform", Ne]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: _()
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "in", "out", "in-out", Ne]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: _()
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", "spin", "ping", "pulse", "bounce", Ne]
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
        scale: [X]
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": [X]
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": [X]
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: [Ls, Ne]
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": [ee]
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": [ee]
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": [ne]
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": [ne]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: ["center", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left", Ne]
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
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", Ne]
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
        "scroll-m": oe()
      }],
      /**
       * Scroll Margin X
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": oe()
      }],
      /**
       * Scroll Margin Y
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": oe()
      }],
      /**
       * Scroll Margin Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": oe()
      }],
      /**
       * Scroll Margin End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": oe()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": oe()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": oe()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": oe()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": oe()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": oe()
      }],
      /**
       * Scroll Padding X
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": oe()
      }],
      /**
       * Scroll Padding Y
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": oe()
      }],
      /**
       * Scroll Padding Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": oe()
      }],
      /**
       * Scroll Padding End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": oe()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": oe()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": oe()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": oe()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": oe()
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
        "will-change": ["auto", "scroll", "contents", "transform", Ne]
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
        stroke: [Fn, Ml, xo]
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
}, hv = /* @__PURE__ */ J1(dv);
function ae(...a) {
  return hv(tp(a));
}
function Q(a, s = 1) {
  return a != null && Number.isFinite(a) ? a.toFixed(s) : "—";
}
function rp(a) {
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
function mv(a, s, r, u = 8700) {
  if (a == null || s == null || r == null || Math.abs(a) < 0.1 || !Number.isFinite(s) || !Number.isFinite(r)) return "";
  const f = a > 0 ? (u - r) / Math.abs(s) : r / Math.abs(s);
  if (!Number.isFinite(f) || f > 48) return "";
  const d = Math.floor(f), m = Math.round((f - d) * 60);
  return a > 0 ? `${d}h ${m}m to full` : `${d}h ${m}m left`;
}
function cp(a, s = 300) {
  return a ? (Date.now() - new Date(a).getTime()) / 1e3 < s : !1;
}
function Ga({
  data: a,
  width: s = 80,
  height: r = 24,
  color: u = "currentColor",
  className: f,
  onClick: d
}) {
  const m = D.useMemo(() => {
    if (a.length < 2) return "";
    const p = a[0].t, g = a[a.length - 1].t - p || 1;
    let x = 1 / 0, b = -1 / 0;
    for (const H of a)
      H.v < x && (x = H.v), H.v > b && (b = H.v);
    const S = b - x || 1, N = 1, z = s - N * 2, R = r - N * 2;
    return a.map((H, G) => {
      const $ = N + (H.t - p) / g * z, P = N + R - (H.v - x) / S * R;
      return `${G === 0 ? "M" : "L"}${$.toFixed(1)},${P.toFixed(1)}`;
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
function pv(a) {
  return new Date(a).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function gv(a) {
  return new Date(a).toLocaleDateString([], { month: "short", day: "numeric" });
}
function yv(a, s) {
  const r = a / s, u = Math.pow(10, Math.floor(Math.log10(r))), f = r / u;
  return f <= 1.5 ? u : f <= 3 ? 2 * u : f <= 7 ? 5 * u : 10 * u;
}
function vv({ data: a, width: s = 600, height: r = 250, color: u = "#3b82f6", unit: f = "" }) {
  const [d, m] = D.useState(null), p = D.useRef(null), [y, g] = D.useState(null), x = D.useRef(null), b = D.useCallback((F) => {
    x.current = F, g(F);
  }, []), S = D.useRef(!1), N = D.useRef(!1), z = D.useRef(0), R = D.useRef(null), H = D.useRef({ data: a, width: s });
  H.current = { data: a, width: s };
  const G = a.length > 0 ? `${a[0].t}-${a.length}` : "", $ = D.useRef(G), P = D.useRef(a.length);
  if (G !== $.current) {
    const F = a.length > 0 && $.current !== "" && !$.current.startsWith(`${a[0].t}-`), Te = a.length < P.current;
    (F || Te) && y && b(null), $.current = G;
  }
  P.current = a.length;
  const X = D.useMemo(() => {
    if (!y || a.length < 2) return a;
    const [F, Te] = y;
    return a.filter((xe) => xe.t >= F && xe.t <= Te);
  }, [a, y]);
  D.useEffect(() => {
    const F = p.current;
    if (!F) return;
    const Te = { left: 48, right: 12 }, xe = (ie) => {
      const We = F.getBoundingClientRect();
      return (ie - We.left) * (H.current.width / We.width);
    }, vt = (ie) => {
      const We = H.current.width;
      return Math.max(0, Math.min(1, (ie - Te.left) / (We - Te.left - Te.right)));
    }, At = (ie, We) => {
      const { data: kt, width: Fe } = H.current, ft = x.current;
      if (kt.length < 2) return;
      const Ie = kt[0].t, St = kt[kt.length - 1].t, Qt = ft ? ft[0] : Ie, Sn = (ft ? ft[1] : St) - Qt, Ct = Sn * ie, Zt = (St - Ie) * 5e-3;
      if (Ct < Zt) return;
      if (Ct >= St - Ie) {
        b(null);
        return;
      }
      const we = Qt + We * Sn;
      let ke = we - We * Ct, $e = we + (1 - We) * Ct;
      ke < Ie && ($e += Ie - ke, ke = Ie), $e > St && (ke -= $e - St, $e = St), ke = Math.max(ke, Ie), $e = Math.min($e, St), b([ke, $e]);
    }, Je = (ie) => {
      const { data: We } = H.current;
      if (We.length < 2) return;
      ie.preventDefault();
      const kt = vt(xe(ie.clientX)), Fe = ie.deltaY > 0 ? 1.3 : 1 / 1.3;
      At(Fe, kt);
    };
    let De = "idle", Ue = 0, rt = null, ot = null;
    const nn = (ie, We, kt, Fe) => Math.sqrt((kt - ie) ** 2 + (Fe - We) ** 2), Vt = (ie) => {
      const { data: We } = H.current;
      We.length < 2 || (ie.preventDefault(), ie.touches.length >= 2 ? (De = "pinch", rt = { x: ie.touches[0].clientX, y: ie.touches[0].clientY }, ot = { x: ie.touches[1].clientX, y: ie.touches[1].clientY }) : ie.touches.length === 1 && (De = "pan", Ue = xe(ie.touches[0].clientX)));
    }, Xt = (ie) => {
      const { data: We, width: kt } = H.current, Fe = x.current;
      if (We.length < 2) return;
      ie.preventDefault();
      const ft = We[0].t, Ie = We[We.length - 1].t, St = Fe ? Fe[0] : ft, Qt = Fe ? Fe[1] : Ie, On = Qt - St, Sn = kt - Te.left - Te.right;
      if (ie.touches.length >= 2) {
        if (De !== "pinch" || !rt || !ot) {
          De = "pinch", rt = { x: ie.touches[0].clientX, y: ie.touches[0].clientY }, ot = { x: ie.touches[1].clientX, y: ie.touches[1].clientY };
          return;
        }
        const Ct = { x: ie.touches[0].clientX, y: ie.touches[0].clientY }, Zt = { x: ie.touches[1].clientX, y: ie.touches[1].clientY }, we = nn(rt.x, rt.y, ot.x, ot.y), ke = nn(Ct.x, Ct.y, Zt.x, Zt.y);
        if (we > 10 && ke > 10) {
          const $e = we / ke, xt = On * $e, Ir = (Ie - ft) * 5e-3, Pr = (rt.x + ot.x) / 2, ui = (Ct.x + Zt.x) / 2, tl = vt(xe(ui)), Al = -((xe(ui) - xe(Pr)) / Sn) * On;
          if (xt >= Ie - ft)
            b(null);
          else if (xt >= Ir) {
            const jn = St + tl * On;
            let ln = jn - tl * xt + Al, Kt = jn + (1 - tl) * xt + Al;
            ln < ft && (Kt += ft - ln, ln = ft), Kt > Ie && (ln -= Kt - Ie, Kt = Ie), ln = Math.max(ln, ft), Kt = Math.min(Kt, Ie), b([ln, Kt]);
          }
        }
        rt = Ct, ot = Zt;
      } else if (ie.touches.length === 1) {
        if (De === "pinch") {
          De = "pan", Ue = xe(ie.touches[0].clientX), rt = null, ot = null;
          return;
        }
        const Ct = xe(ie.touches[0].clientX), Zt = Ct - Ue;
        if (Math.abs(Zt) > 1) {
          const we = -(Zt / Sn) * On;
          let ke = St + we, $e = Qt + we;
          ke < ft && ($e += ft - ke, ke = ft), $e > Ie && (ke -= $e - Ie, $e = Ie), ke = Math.max(ke, ft), $e = Math.min($e, Ie), b([ke, $e]), Ue = Ct;
        }
      }
    }, wt = (ie) => {
      ie.touches.length === 0 ? (De = "idle", rt = null, ot = null) : ie.touches.length === 1 && De === "pinch" ? (De = "pan", Ue = xe(ie.touches[0].clientX), rt = null, ot = null) : ie.touches.length >= 2 && De !== "pinch" && (De = "pinch", rt = { x: ie.touches[0].clientX, y: ie.touches[0].clientY }, ot = { x: ie.touches[1].clientX, y: ie.touches[1].clientY });
    };
    return F.addEventListener("wheel", Je, { passive: !1 }), F.addEventListener("touchstart", Vt, { passive: !1 }), F.addEventListener("touchmove", Xt, { passive: !1 }), F.addEventListener("touchend", wt), () => {
      F.removeEventListener("wheel", Je), F.removeEventListener("touchstart", Vt), F.removeEventListener("touchmove", Xt), F.removeEventListener("touchend", wt);
    };
  }, []);
  const J = D.useMemo(() => {
    if (X.length < 2) return null;
    const F = { top: 12, right: 12, bottom: 32, left: 48 }, Te = s - F.left - F.right, xe = r - F.top - F.bottom, vt = X[0].t, Je = X[X.length - 1].t - vt || 1;
    let De = 1 / 0, Ue = -1 / 0;
    for (const we of X)
      we.v < De && (De = we.v), we.v > Ue && (Ue = we.v);
    const rt = (Ue - De) * 0.05 || 1;
    De -= rt, Ue += rt;
    const ot = Ue - De, nn = (we) => F.left + (we - vt) / Je * Te, Vt = (we) => F.top + xe - (we - De) / ot * xe, Xt = (we) => vt + (we - F.left) / Te * Je, wt = X.map((we, ke) => `${ke === 0 ? "M" : "L"}${nn(we.t).toFixed(1)},${Vt(we.v).toFixed(1)}`).join(" "), ie = wt + ` L${nn(X[X.length - 1].t).toFixed(1)},${(F.top + xe).toFixed(1)} L${nn(X[0].t).toFixed(1)},${(F.top + xe).toFixed(1)} Z`, We = yv(ot, 5), kt = [], Fe = Math.ceil(De / We) * We;
    for (let we = Fe; we <= Ue; we += We) kt.push(we);
    const ft = Je > 864e5, Ie = Math.min(6, Math.floor(Te / 80)), St = [];
    for (let we = 0; we <= Ie; we++)
      St.push(vt + Je * we / Ie);
    let Qt = 0;
    for (const we of X) Qt += we.v;
    const On = Qt / X.length, Sn = Math.min(...X.map((we) => we.v)), Ct = Math.max(...X.map((we) => we.v)), Zt = X[X.length - 1].v;
    return { margin: F, w: Te, h: xe, linePath: wt, areaPath: ie, toX: nn, toY: Vt, fromX: Xt, yTicks: kt, xTicks: St, showDates: ft, minV: De, maxV: Ue, stats: { avg: On, min: Sn, max: Ct, current: Zt } };
  }, [X, s, r]), ne = D.useCallback(
    (F) => {
      if (!p.current || !R.current || a.length < 2) return;
      const Te = p.current.getBoundingClientRect(), xe = s / Te.width, At = (F - Te.left) * xe - z.current;
      if (Math.abs(At) > 3 && !N.current && (N.current = !0, m(null)), N.current) {
        const Je = { left: 48, right: 12 }, De = s - Je.left - Je.right, [Ue, rt] = R.current, ot = rt - Ue, nn = -(At / De) * ot, Vt = a[0].t, Xt = a[a.length - 1].t;
        let wt = Ue + nn, ie = rt + nn;
        wt < Vt && (ie += Vt - wt, wt = Vt), ie > Xt && (wt -= ie - Xt, ie = Xt), wt = Math.max(wt, Vt), ie = Math.min(ie, Xt), b([wt, ie]);
      }
    },
    [a, s, b]
  ), Z = D.useCallback(
    (F) => {
      if (!J || !p.current || S.current) return;
      const Te = p.current.getBoundingClientRect(), xe = s / Te.width, vt = (F.clientX - Te.left) * xe, At = J.fromX(vt);
      let Je = 0, De = X.length - 1;
      for (; Je < De; ) {
        const Ue = Je + De >> 1;
        X[Ue].t < At ? Je = Ue + 1 : De = Ue;
      }
      Je > 0 && Math.abs(X[Je - 1].t - At) < Math.abs(X[Je].t - At) && Je--, m(Je);
    },
    [J, X, s]
  ), ee = D.useRef(null), ge = D.useRef(null), _e = D.useCallback(() => {
    ee.current && window.removeEventListener("mousemove", ee.current), ge.current && window.removeEventListener("mouseup", ge.current), ee.current = null, ge.current = null;
  }, []), ce = D.useCallback(
    (F) => {
      if (!p.current || a.length < 2) return;
      S.current = !0, N.current = !1;
      const Te = p.current.getBoundingClientRect(), xe = s / Te.width;
      z.current = (F.clientX - Te.left) * xe;
      const vt = a[0].t, At = a[a.length - 1].t;
      R.current = x.current ?? [vt, At], _e();
      const Je = (Ue) => {
        Ue.preventDefault(), ne(Ue.clientX);
      }, De = () => {
        S.current = !1, _e();
      };
      ee.current = Je, ge.current = De, window.addEventListener("mousemove", Je), window.addEventListener("mouseup", De);
    },
    [a, y, s, ne, _e]
  );
  D.useEffect(() => () => _e(), [_e]);
  const oe = D.useCallback(() => {
    S.current || m(null);
  }, []);
  if (!J)
    return /* @__PURE__ */ o.jsx("div", { className: "flex items-center justify-center h-full text-muted-foreground text-sm", children: "No data" });
  const { margin: Me, h: K, linePath: ve, areaPath: A, toX: q, toY: W, yTicks: he, xTicks: me, showDates: _, stats: O } = J, V = Math.abs(O.max - O.min) < 10 ? 1 : 0, I = (F) => F.toFixed(V), fe = d != null ? X[d] : null, ye = y != null;
  return /* @__PURE__ */ o.jsxs("div", { children: [
    /* @__PURE__ */ o.jsx("div", { className: "flex items-center justify-end mb-1 min-h-[1.5rem]", children: ye && /* @__PURE__ */ o.jsx(
      "button",
      {
        onClick: () => b(null),
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
        className: ae("w-full select-none", ye ? "cursor-grab active:cursor-grabbing" : ""),
        viewBox: `0 0 ${s} ${r}`,
        style: { touchAction: "none", cursor: ye ? void 0 : "crosshair" },
        onMouseMove: Z,
        onMouseDown: ce,
        onMouseLeave: oe,
        children: [
          he.map((F) => /* @__PURE__ */ o.jsxs("g", { children: [
            /* @__PURE__ */ o.jsx(
              "line",
              {
                x1: Me.left,
                y1: W(F),
                x2: s - Me.right,
                y2: W(F),
                stroke: "currentColor",
                className: "text-border",
                strokeWidth: 0.5
              }
            ),
            /* @__PURE__ */ o.jsx(
              "text",
              {
                x: Me.left - 6,
                y: W(F) + 4,
                textAnchor: "end",
                className: "fill-muted-foreground",
                fontSize: 10,
                children: I(F)
              }
            )
          ] }, F)),
          me.map((F) => /* @__PURE__ */ o.jsx(
            "text",
            {
              x: q(F),
              y: Me.top + K + 20,
              textAnchor: "middle",
              className: "fill-muted-foreground",
              fontSize: 10,
              children: _ ? gv(F) : pv(F)
            },
            F
          )),
          /* @__PURE__ */ o.jsx("path", { d: A, fill: u, opacity: 0.1 }),
          /* @__PURE__ */ o.jsx("path", { d: ve, fill: "none", stroke: u, strokeWidth: 2, strokeLinejoin: "round" }),
          fe && /* @__PURE__ */ o.jsxs(o.Fragment, { children: [
            /* @__PURE__ */ o.jsx(
              "line",
              {
                x1: q(fe.t),
                y1: Me.top,
                x2: q(fe.t),
                y2: Me.top + K,
                stroke: u,
                strokeWidth: 1,
                opacity: 0.4,
                strokeDasharray: "3,3"
              }
            ),
            /* @__PURE__ */ o.jsx(
              "circle",
              {
                cx: q(fe.t),
                cy: W(fe.v),
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
              x: Me.left,
              y: Me.top,
              width: s - Me.left - Me.right,
              height: K,
              fill: "transparent"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ o.jsx("div", { className: "flex gap-4 mt-2 text-xs min-h-[1.25rem]", children: fe ? /* @__PURE__ */ o.jsxs(o.Fragment, { children: [
      /* @__PURE__ */ o.jsx("span", { className: "text-muted-foreground", children: new Date(fe.t).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }) }),
      /* @__PURE__ */ o.jsxs("span", { className: "font-semibold", style: { color: u }, children: [
        I(fe.v),
        f
      ] })
    ] }) : /* @__PURE__ */ o.jsxs(o.Fragment, { children: [
      /* @__PURE__ */ o.jsxs("span", { className: "text-muted-foreground", children: [
        "Current: ",
        /* @__PURE__ */ o.jsxs("strong", { className: "text-foreground", children: [
          I(O.current),
          f
        ] })
      ] }),
      /* @__PURE__ */ o.jsxs("span", { className: "text-muted-foreground", children: [
        "Min: ",
        /* @__PURE__ */ o.jsxs("strong", { className: "text-foreground", children: [
          I(O.min),
          f
        ] })
      ] }),
      /* @__PURE__ */ o.jsxs("span", { className: "text-muted-foreground", children: [
        "Max: ",
        /* @__PURE__ */ o.jsxs("strong", { className: "text-foreground", children: [
          I(O.max),
          f
        ] })
      ] }),
      /* @__PURE__ */ o.jsxs("span", { className: "text-muted-foreground", children: [
        "Avg: ",
        /* @__PURE__ */ o.jsxs("strong", { className: "text-foreground", children: [
          I(O.avg),
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
const xv = (a) => a.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), up = (...a) => a.filter((s, r, u) => !!s && s.trim() !== "" && u.indexOf(s) === r).join(" ").trim();
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var _v = {
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
const bv = D.forwardRef(
  ({
    color: a = "currentColor",
    size: s = 24,
    strokeWidth: r = 2,
    absoluteStrokeWidth: u,
    className: f = "",
    children: d,
    iconNode: m,
    ...p
  }, y) => D.createElement(
    "svg",
    {
      ref: y,
      ..._v,
      width: s,
      height: s,
      stroke: a,
      strokeWidth: u ? Number(r) * 24 / Number(s) : r,
      className: up("lucide", f),
      ...p
    },
    [
      ...m.map(([g, x]) => D.createElement(g, x)),
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
const se = (a, s) => {
  const r = D.forwardRef(
    ({ className: u, ...f }, d) => D.createElement(bv, {
      ref: d,
      iconNode: s,
      className: up(`lucide-${xv(a)}`, u),
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
const wv = se("AirVent", [
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
const Sv = se("ArrowDown", [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const jv = se("ArrowUp", [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ko = se("BatteryLow", [
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
const Nv = se("BatteryMedium", [
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
const Jo = se("Battery", [
  ["rect", { width: "16", height: "10", x: "2", y: "7", rx: "2", ry: "2", key: "1w10f2" }],
  ["line", { x1: "22", x2: "22", y1: "11", y2: "13", key: "4dh1rd" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Mv = se("Bed", [
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
const Tv = se("Camera", [
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
const op = se("Car", [
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
const Ev = se("ChevronLeft", [
  ["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Av = se("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const fp = se("CircleDot", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const p0 = se("CloudDrizzle", [
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
const Cv = se("CloudFog", [
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
const _o = se("CloudRain", [
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
const g0 = se("CloudSnow", [
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
const zv = se("CloudSun", [
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
const Oo = se("Cloud", [
  ["path", { d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z", key: "p7xjir" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ov = se("Cpu", [
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
const Va = se("Droplets", [
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
const kv = se("Fan", [
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
const Xr = se("Flame", [
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
const dp = se("Fuel", [
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
const hp = se("Gauge", [
  ["path", { d: "m12 14 4-4", key: "9kzdfg" }],
  ["path", { d: "M3.34 19a10 10 0 1 1 17.32 0", key: "19p75a" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Dv = se("Globe", [
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
const Rv = se("Grid2x2", [
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
const Hv = se("History", [
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
const mp = se("House", [
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
const bo = se("LampDesk", [
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
const Qr = se("Lightbulb", [
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
const $s = se("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Uv = se("MapPin", [
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
const Lv = se("Maximize2", [
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
const y0 = se("Monitor", [
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
const $o = se("Moon", [
  ["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", key: "a7tn18" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const pp = se("Mountain", [
  ["path", { d: "m8 3 4 8 5-5 5 15H2L8 3z", key: "otkl63" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Bv = se("Music", [
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
const qv = se("Pause", [
  ["rect", { x: "14", y: "4", width: "4", height: "16", rx: "1", key: "zuxfzm" }],
  ["rect", { x: "6", y: "4", width: "4", height: "16", rx: "1", key: "1okwgv" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const wo = se("Play", [
  ["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const gp = se("PlugZap", [
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
const Yv = se("Plug", [
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
const yp = se("Power", [
  ["path", { d: "M12 2v10", key: "mnfbl" }],
  ["path", { d: "M18.4 6.6a9 9 0 1 1-12.77.04", key: "obofu9" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Gv = se("Radio", [
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
const Vv = se("Settings", [
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
const Zr = se("ShowerHead", [
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
const Xv = se("Snowflake", [
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
const ni = se("Sun", [
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
const li = se("Thermometer", [
  ["path", { d: "M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z", key: "17jzev" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Qv = se("ToggleLeft", [
  ["rect", { width: "20", height: "12", x: "2", y: "6", rx: "6", ry: "6", key: "f2vt7d" }],
  ["circle", { cx: "8", cy: "12", r: "2", key: "1nvbw3" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Kr = se("Trash2", [
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
const Zv = se("Trash", [
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
const Kv = se("TriangleAlert", [
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
const Jv = se("Truck", [
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
const Wo = se("VideoOff", [
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
const $v = se("Waves", [
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
const Wv = se("Wifi", [
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
const Ws = se("Wind", [
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
const Fv = se("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ai = se("Zap", [
  [
    "path",
    {
      d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
      key: "1xq2db"
    }
  ]
]), vp = D.createContext({ open: () => {
} });
function Cn() {
  return D.useContext(vp);
}
const Iv = [
  { label: "1h", hours: 1 },
  { label: "6h", hours: 6 },
  { label: "24h", hours: 24 },
  { label: "3d", hours: 72 },
  { label: "7d", hours: 168 }
];
function Pv({ children: a }) {
  const [s, r] = D.useState(null), [u, f] = D.useState(24), d = D.useRef(!1), m = D.useCallback((x, b, S = "") => {
    r({ entityId: x, name: b, unit: S }), f(24);
  }, []), p = D.useCallback(() => {
    r(null);
  }, []);
  D.useEffect(() => {
    if (!s) return;
    const x = (b) => {
      b.key === "Escape" && p();
    };
    return window.addEventListener("keydown", x), () => window.removeEventListener("keydown", x);
  }, [s, p]);
  const { data: y, loading: g } = Fl((s == null ? void 0 : s.entityId) ?? null, u);
  return /* @__PURE__ */ o.jsxs(vp.Provider, { value: { open: m }, children: [
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
              ex,
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
function ex({
  state: a,
  hours: s,
  setHours: r,
  data: u,
  loading: f,
  close: d
}) {
  const m = re(a.entityId), p = m == null ? void 0 : m.state, y = (m == null ? void 0 : m.last_updated) || (m == null ? void 0 : m.last_changed), g = y ? rp(y) : null;
  return /* @__PURE__ */ o.jsxs("div", { className: "p-5 space-y-4", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ o.jsxs("div", { children: [
        /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ o.jsx("h2", { className: "text-lg font-semibold", children: a.name }),
          p != null && p !== "unknown" && p !== "unavailable" && /* @__PURE__ */ o.jsxs("span", { className: "text-lg font-bold tabular-nums text-primary", children: [
            p,
            a.unit && /* @__PURE__ */ o.jsx("span", { className: "text-sm text-muted-foreground ml-0.5", children: a.unit })
          ] })
        ] }),
        /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ o.jsx("p", { className: "text-xs text-muted-foreground font-mono", children: a.entityId }),
          g && /* @__PURE__ */ o.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "· Updated ",
            g
          ] })
        ] })
      ] }),
      /* @__PURE__ */ o.jsx(
        "button",
        {
          onClick: d,
          className: "rounded-md p-1.5 hover:bg-muted transition-colors",
          children: /* @__PURE__ */ o.jsx(Fv, { className: "h-4 w-4" })
        }
      )
    ] }),
    /* @__PURE__ */ o.jsx("div", { className: "flex gap-1", children: Iv.map((x) => /* @__PURE__ */ o.jsx(
      "button",
      {
        onClick: () => r(x.hours),
        className: ae(
          "px-3 py-1 rounded-md text-xs font-medium transition-colors",
          s === x.hours ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
        ),
        children: x.label
      },
      x.label
    )) }),
    /* @__PURE__ */ o.jsx("div", { className: "min-h-[250px] flex items-center justify-center", children: f ? /* @__PURE__ */ o.jsx("div", { className: "text-sm text-muted-foreground animate-pulse", children: "Loading history…" }) : /* @__PURE__ */ o.jsx(vv, { data: u, unit: a.unit }) })
  ] });
}
function Il({ title: a, children: s, className: r }) {
  return /* @__PURE__ */ o.jsxs("div", { className: ae("p-4 md:p-6 space-y-4 max-w-screen-2xl mx-auto", r), children: [
    /* @__PURE__ */ o.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: a }),
    s
  ] });
}
const Be = D.forwardRef(
  ({ className: a, ...s }, r) => /* @__PURE__ */ o.jsx(
    "div",
    {
      ref: r,
      className: ae("rounded-lg border bg-card text-card-foreground shadow-sm", a),
      ...s
    }
  )
);
Be.displayName = "Card";
const lt = D.forwardRef(
  ({ className: a, ...s }, r) => /* @__PURE__ */ o.jsx("div", { ref: r, className: ae("flex flex-col space-y-1.5 p-5 pb-0", a), ...s })
);
lt.displayName = "CardHeader";
const at = D.forwardRef(
  ({ className: a, ...s }, r) => /* @__PURE__ */ o.jsx("div", { ref: r, className: ae("text-sm font-semibold leading-none", a), ...s })
);
at.displayName = "CardTitle";
const tx = D.forwardRef(
  ({ className: a, ...s }, r) => /* @__PURE__ */ o.jsx("div", { ref: r, className: ae("text-xs text-muted-foreground", a), ...s })
);
tx.displayName = "CardDescription";
const qe = D.forwardRef(
  ({ className: a, ...s }, r) => /* @__PURE__ */ o.jsx("div", { ref: r, className: ae("p-5 pt-4", a), ...s })
);
qe.displayName = "CardContent";
const xp = D.forwardRef(
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
xp.displayName = "Progress";
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
  const { data: y } = Fl(a, m), { open: g } = Cn();
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
          /* @__PURE__ */ o.jsx(Ga, { data: y, color: d, width: 64, height: 20 }),
          /* @__PURE__ */ o.jsxs("span", { className: "font-medium tabular-nums text-sm shrink-0", children: [
            r,
            u && /* @__PURE__ */ o.jsx("span", { className: "text-muted-foreground ml-0.5 text-xs", children: u })
          ] })
        ] })
      ]
    }
  );
}
function _p({ compact: a = !1 }) {
  const { value: s } = Y("sensor.olins_van_bms_battery"), { value: r } = Y("sensor.olins_van_bms_voltage"), { value: u } = Y("sensor.olins_van_bms_current"), { value: f } = Y("sensor.olins_van_bms_power"), { value: d } = Y("sensor.olins_van_bms_stored_energy"), { value: m } = Y("sensor.olins_van_bms_temperature"), { value: p } = Y("sensor.olins_van_bms_cycles"), { value: y } = Y("sensor.olins_van_bms_delta_voltage"), { data: g } = Fl("sensor.olins_van_bms_battery", 12), { open: x } = Cn(), b = (u ?? 0) > 0, S = mv(u, f, d), N = s ?? 0, z = N < 30 ? "text-red-500" : N < 65 ? "text-orange-500" : "text-green-500", R = N < 30 ? "bg-red-500" : N < 65 ? "bg-orange-500" : "bg-green-500";
  return /* @__PURE__ */ o.jsxs(Be, { children: [
    /* @__PURE__ */ o.jsx(lt, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(at, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(Jo, { className: "h-4 w-4" }),
      "Battery",
      /* @__PURE__ */ o.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
        /* @__PURE__ */ o.jsx(
          Ga,
          {
            data: g,
            color: N < 30 ? "#ef4444" : N < 65 ? "#f97316" : "#22c55e",
            width: 64,
            height: 20,
            onClick: () => x("sensor.olins_van_bms_battery", "Battery SOC", "%")
          }
        ),
        /* @__PURE__ */ o.jsxs("span", { className: ae("text-2xl font-bold tabular-nums", z), children: [
          Q(s, 0),
          "%"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ o.jsxs(qe, { className: "space-y-3", children: [
      /* @__PURE__ */ o.jsx(xp, { value: N, className: "h-3", indicatorClassName: R }),
      /* @__PURE__ */ o.jsxs("div", { className: "grid gap-1", children: [
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.olins_van_bms_voltage", label: "Voltage", value: Q(r, 2), unit: "V", color: "#6366f1" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.olins_van_bms_current", label: "Current", value: Q(u, 2), unit: "A", color: "#06b6d4" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.olins_van_bms_power", label: "Power", value: Q(f != null ? Math.abs(f) : null, 0), unit: "W", color: "#f59e0b" }),
        !a && /* @__PURE__ */ o.jsxs(o.Fragment, { children: [
          /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.olins_van_bms_stored_energy", label: "Stored", value: Q(d, 0), unit: "Wh", color: "#8b5cf6" }),
          /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.olins_van_bms_temperature", label: "Temperature", value: Q(m, 1), unit: "°C", color: "#ef4444" }),
          /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.olins_van_bms_cycles", label: "Cycles", value: Q(p, 0), unit: "", color: "#64748b" }),
          /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.olins_van_bms_delta_voltage", label: "Cell Delta", value: Q(y, 3), unit: "V", color: "#ec4899" })
        ] })
      ] }),
      S && /* @__PURE__ */ o.jsx(
        "p",
        {
          className: ae(
            "text-xs font-medium text-center",
            b ? "text-green-500" : "text-orange-500"
          ),
          children: S
        }
      )
    ] })
  ] });
}
function bp({ compact: a = !1 }) {
  const { value: s } = Y("sensor.total_mppt_pv_power"), { value: r } = Y("sensor.a32_pro_mppt1_pv_power"), { value: u } = Y("sensor.a32_pro_mppt2_pv_power"), { value: f } = Y("sensor.a32_pro_mppt1_yield_today"), { value: d } = Y("sensor.a32_pro_mppt2_yield_today"), { value: m } = Y("sensor.total_mppt_yield_today"), { value: p } = Y("sensor.average_mppt_output_voltage"), { value: y } = Y("sensor.total_mppt_output_current"), { data: g } = Fl("sensor.total_mppt_pv_power", 12), { open: x } = Cn(), b = (s ?? 0) > 10;
  return /* @__PURE__ */ o.jsxs(Be, { children: [
    /* @__PURE__ */ o.jsx(lt, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(at, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(ni, { className: ae("h-4 w-4", b ? "text-yellow-500" : "text-muted-foreground") }),
      "Solar",
      /* @__PURE__ */ o.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
        /* @__PURE__ */ o.jsx(
          Ga,
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
              b ? "text-yellow-500" : "text-muted-foreground"
            ),
            children: [
              Q(s, 0),
              "W"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ o.jsxs(qe, { className: "space-y-3", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ o.jsxs(
          "div",
          {
            className: "space-y-1 rounded-lg bg-muted/50 p-2.5 cursor-pointer hover:bg-muted/80 transition-colors",
            onClick: () => x("sensor.a32_pro_mppt1_pv_power", "MPPT 1", "W"),
            children: [
              /* @__PURE__ */ o.jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "MPPT 1" }),
              /* @__PURE__ */ o.jsxs("p", { className: "text-lg font-bold tabular-nums", children: [
                Q(r, 0),
                "W"
              ] }),
              /* @__PURE__ */ o.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                Q(f, 2),
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
                Q(u, 0),
                "W"
              ] }),
              /* @__PURE__ */ o.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                Q(d, 2),
                " kWh today"
              ] })
            ]
          }
        )
      ] }),
      !a && /* @__PURE__ */ o.jsxs("div", { className: "grid gap-1", children: [
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.total_mppt_yield_today", label: "Total Yield", value: Q(m, 0), unit: "Wh", color: "#eab308" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.average_mppt_output_voltage", label: "Output Voltage", value: Q(p, 1), unit: "V", color: "#6366f1" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.total_mppt_output_current", label: "Output Current", value: Q(y, 1), unit: "A", color: "#06b6d4" })
      ] })
    ] })
  ] });
}
function ko({ name: a, tempEntity: s, humidityEntity: r }) {
  const { value: u } = Y(s), { value: f } = Y(r), { data: d } = Fl(s, 12), { open: m } = Cn();
  return /* @__PURE__ */ o.jsx(
    Be,
    {
      className: "cursor-pointer hover:bg-muted/30 transition-colors",
      onClick: () => m(s, `${a} Temperature`, "°C"),
      children: /* @__PURE__ */ o.jsx(qe, { className: "pt-4 pb-4", children: /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsxs("div", { children: [
          /* @__PURE__ */ o.jsx("p", { className: "text-xs text-muted-foreground", children: a }),
          /* @__PURE__ */ o.jsxs("p", { className: "text-2xl font-bold tabular-nums", children: [
            Q(u, 1),
            "°C"
          ] })
        ] }),
        /* @__PURE__ */ o.jsxs("div", { className: "flex flex-col items-end gap-1", children: [
          /* @__PURE__ */ o.jsx(Ga, { data: d, color: "#ef4444", width: 56, height: 18 }),
          /* @__PURE__ */ o.jsxs(
            "div",
            {
              className: "flex items-center gap-1 text-muted-foreground",
              onClick: (p) => {
                p.stopPropagation(), m(r, `${a} Humidity`, "%");
              },
              children: [
                /* @__PURE__ */ o.jsx(Va, { className: "h-3.5 w-3.5" }),
                /* @__PURE__ */ o.jsxs("span", { className: "text-sm tabular-nums", children: [
                  Q(f, 0),
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
function Or({ name: a, entityId: s, invertWarning: r, icon: u }) {
  const { value: f } = Y(s), d = f ?? 0, m = r ? d > 80 ? "bg-red-500" : d > 60 ? "bg-orange-500" : "bg-green-500" : d < 20 ? "bg-red-500" : d < 50 ? "bg-orange-500" : "bg-blue-500";
  return /* @__PURE__ */ o.jsx(Be, { children: /* @__PURE__ */ o.jsxs(qe, { className: "pt-4 pb-4", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ o.jsxs("p", { className: "text-sm font-medium flex items-center gap-1.5", children: [
        u,
        a
      ] }),
      /* @__PURE__ */ o.jsxs("p", { className: "text-lg font-bold tabular-nums", children: [
        Q(f, 0),
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
function nx(a, s = "daily") {
  const r = ti(), [u, f] = D.useState([]);
  return D.useEffect(() => {
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
const So = /* @__PURE__ */ new Map();
function lx(a, s) {
  return `${a.toFixed(2)},${s.toFixed(2)}`;
}
function ax(a, s) {
  const [r, u] = D.useState(null), f = D.useRef(null);
  return D.useEffect(() => {
    if (a == null || s == null) return;
    const d = lx(a, s);
    if (d === f.current) return;
    f.current = d;
    const m = So.get(d);
    if (m) {
      u(m);
      return;
    }
    let p = !1;
    const y = `https://nominatim.openstreetmap.org/reverse?lat=${a}&lon=${s}&format=json&zoom=10&addressdetails=1`;
    return fetch(y, {
      headers: { "User-Agent": "VanDashboard/1.0" }
    }).then((g) => g.json()).then((g) => {
      var R;
      if (p) return;
      const x = g.address, b = (x == null ? void 0 : x.city) || (x == null ? void 0 : x.town) || (x == null ? void 0 : x.village) || (x == null ? void 0 : x.hamlet) || (x == null ? void 0 : x.county) || "", S = (x == null ? void 0 : x.state) || (x == null ? void 0 : x.province) || "", N = ((R = x == null ? void 0 : x.country_code) == null ? void 0 : R.toUpperCase()) || "";
      let z = "";
      b && S ? z = `${b}, ${S}` : b ? z = b : S ? z = S : g.display_name && (z = g.display_name.split(",").slice(0, 2).join(",").trim()), z && N && z.includes(N), So.set(d, z), u(z);
    }).catch(() => {
      if (!p) {
        const g = `${Number(a).toFixed(2)}°, ${Number(s).toFixed(2)}°`;
        So.set(d, g), u(g);
      }
    }), () => {
      p = !0;
    };
  }, [a, s]), r;
}
const v0 = {
  sunny: ni,
  "clear-night": $o,
  cloudy: Oo,
  partlycloudy: zv,
  rainy: _o,
  pouring: _o,
  snowy: g0,
  "snowy-rainy": g0,
  windy: Ws,
  "windy-variant": Ws,
  fog: Cv,
  hail: p0,
  lightning: p0,
  "lightning-rainy": _o
};
function sx(a) {
  return (a == null ? void 0 : a.replace(/-/g, " ").replace(/_/g, " ")) ?? "";
}
function ix() {
  var $, P;
  const a = re("weather.pirateweather"), s = re("device_tracker.starlink_device_location"), r = nx("weather.pirateweather", "daily"), u = ($ = s == null ? void 0 : s.attributes) == null ? void 0 : $.latitude, f = (P = s == null ? void 0 : s.attributes) == null ? void 0 : P.longitude, d = ax(u, f);
  if (!a) return null;
  const m = a.state, p = a.attributes, y = p.temperature, g = p.humidity, x = p.wind_speed, b = v0[m] || Oo, S = a.last_updated, N = r.slice(0, 7), z = N.flatMap((X) => [X.temperature, X.templow]), R = z.length > 0 ? Math.min(...z) : 0, G = (z.length > 0 ? Math.max(...z) : 30) - R || 1;
  return /* @__PURE__ */ o.jsxs(Be, { children: [
    /* @__PURE__ */ o.jsxs(lt, { className: "pb-2", children: [
      /* @__PURE__ */ o.jsxs(at, { className: "flex items-center justify-between text-base", children: [
        /* @__PURE__ */ o.jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ o.jsx(b, { className: "h-4 w-4" }),
          "Weather"
        ] }),
        /* @__PURE__ */ o.jsx("span", { className: "text-xs font-normal text-muted-foreground", children: rp(S) })
      ] }),
      d && /* @__PURE__ */ o.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1 -mt-1", children: [
        /* @__PURE__ */ o.jsx(Uv, { className: "h-3 w-3" }),
        d
      ] })
    ] }),
    /* @__PURE__ */ o.jsxs(qe, { className: "space-y-3", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsxs("div", { children: [
          /* @__PURE__ */ o.jsxs("p", { className: "text-3xl font-bold tabular-nums", children: [
            Q(y, 0),
            "°C"
          ] }),
          /* @__PURE__ */ o.jsx("p", { className: "text-sm text-muted-foreground capitalize", children: sx(m) })
        ] }),
        /* @__PURE__ */ o.jsxs("div", { className: "text-right space-y-1", children: [
          /* @__PURE__ */ o.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1 justify-end", children: [
            /* @__PURE__ */ o.jsx(Va, { className: "h-3 w-3" }),
            " ",
            Q(g, 0),
            "%"
          ] }),
          /* @__PURE__ */ o.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1 justify-end", children: [
            /* @__PURE__ */ o.jsx(Ws, { className: "h-3 w-3" }),
            " ",
            Q(x, 0),
            " km/h"
          ] })
        ] })
      ] }),
      N.length > 0 && /* @__PURE__ */ o.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ o.jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "7-Day Forecast" }),
        N.map((X, J) => {
          const ne = v0[X.condition] || Oo, Z = new Date(X.datetime), ee = J === 0, ge = ee ? "Today" : Z.toLocaleDateString(void 0, { weekday: "short" }), _e = X.templow, ce = X.temperature, oe = (_e - R) / G * 100, Me = (ce - R) / G * 100, K = ce > 30 ? "bg-red-500" : ce > 20 ? "bg-orange-400" : ce > 10 ? "bg-yellow-400" : ce > 0 ? "bg-blue-400" : "bg-blue-600";
          return /* @__PURE__ */ o.jsxs(
            "div",
            {
              className: "grid items-center gap-1 text-xs",
              style: { gridTemplateColumns: "2.5rem 1.25rem 1fr 2rem 2rem" },
              children: [
                /* @__PURE__ */ o.jsx(
                  "span",
                  {
                    className: `truncate ${ee ? "font-medium text-foreground" : "text-muted-foreground"}`,
                    children: ge
                  }
                ),
                /* @__PURE__ */ o.jsx(ne, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                /* @__PURE__ */ o.jsx("div", { className: "relative h-2 rounded-full bg-muted", children: /* @__PURE__ */ o.jsx(
                  "div",
                  {
                    className: `absolute inset-y-0 rounded-full ${K}`,
                    style: {
                      left: `${oe}%`,
                      right: `${100 - Me}%`
                    }
                  }
                ) }),
                /* @__PURE__ */ o.jsxs("span", { className: "text-right tabular-nums text-muted-foreground", children: [
                  Math.round(_e),
                  "°"
                ] }),
                /* @__PURE__ */ o.jsxs("span", { className: "text-right tabular-nums font-medium", children: [
                  Math.round(ce),
                  "°"
                ] })
              ]
            },
            J
          );
        })
      ] }),
      N.some((X) => X.precipitation_probability > 0) && /* @__PURE__ */ o.jsx("div", { className: "flex gap-2 overflow-x-auto pb-1", children: N.map((X, J) => {
        const ne = X.precipitation_probability, Z = new Date(X.datetime), ee = J === 0 ? "Tod" : Z.toLocaleDateString(void 0, { weekday: "short" });
        return /* @__PURE__ */ o.jsxs("div", { className: "flex flex-col items-center gap-0.5 min-w-[2.5rem] text-xs", children: [
          /* @__PURE__ */ o.jsx("span", { className: "text-muted-foreground", children: ee }),
          /* @__PURE__ */ o.jsx("div", { className: "h-6 w-3 rounded-sm bg-muted relative overflow-hidden", children: /* @__PURE__ */ o.jsx(
            "div",
            {
              className: "absolute bottom-0 w-full bg-blue-400 rounded-sm",
              style: { height: `${ne}%` }
            }
          ) }),
          /* @__PURE__ */ o.jsxs("span", { className: "text-muted-foreground tabular-nums", children: [
            ne,
            "%"
          ] })
        ] }, J);
      }) })
    ] })
  ] });
}
const x0 = (a) => typeof a == "boolean" ? `${a}` : a === 0 ? "0" : a, _0 = tp, wp = (a, s) => (r) => {
  var u;
  if ((s == null ? void 0 : s.variants) == null) return _0(a, r == null ? void 0 : r.class, r == null ? void 0 : r.className);
  const { variants: f, defaultVariants: d } = s, m = Object.keys(f).map((g) => {
    const x = r == null ? void 0 : r[g], b = d == null ? void 0 : d[g];
    if (x === null) return null;
    const S = x0(x) || x0(b);
    return f[g][S];
  }), p = r && Object.entries(r).reduce((g, x) => {
    let [b, S] = x;
    return S === void 0 || (g[b] = S), g;
  }, {}), y = s == null || (u = s.compoundVariants) === null || u === void 0 ? void 0 : u.reduce((g, x) => {
    let { class: b, className: S, ...N } = x;
    return Object.entries(N).every((z) => {
      let [R, H] = z;
      return Array.isArray(H) ? H.includes({
        ...d,
        ...p
      }[R]) : {
        ...d,
        ...p
      }[R] === H;
    }) ? [
      ...g,
      b,
      S
    ] : g;
  }, []);
  return _0(a, m, y, r == null ? void 0 : r.class, r == null ? void 0 : r.className);
}, rx = wp(
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
), Ks = D.forwardRef(
  ({ className: a, variant: s, size: r, ...u }, f) => /* @__PURE__ */ o.jsx(
    "button",
    {
      className: ae(rx({ variant: s, size: r, className: a })),
      ref: f,
      ...u
    }
  )
);
Ks.displayName = "Button";
const Jr = D.forwardRef(
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
Jr.displayName = "Slider";
function el() {
  const a = ti();
  return D.useCallback(
    (s, r, u, f) => a.callService(s, r, u, f),
    [a]
  );
}
function Ot(a) {
  const s = el(), r = a.split(".")[0];
  return D.useCallback(
    () => s(r, "toggle", void 0, { entity_id: a }),
    [s, r, a]
  );
}
function cx(a) {
  const s = el();
  return D.useCallback(
    () => s("button", "press", void 0, { entity_id: a }),
    [s, a]
  );
}
function ux() {
  var P;
  const a = re("climate.a32_pro_van_hydronic_heating_pid"), s = el(), [r, u] = D.useState(null), f = D.useRef(null), d = D.useCallback(
    (X) => {
      f.current && clearTimeout(f.current), f.current = setTimeout(() => {
        s("climate", "set_temperature", { temperature: X }, {
          entity_id: "climate.a32_pro_van_hydronic_heating_pid"
        });
      }, 300);
    },
    [s]
  ), m = ((P = a == null ? void 0 : a.attributes) == null ? void 0 : P.temperature) ?? 0;
  if (D.useEffect(() => {
    u(null);
  }, [m]), !a) return null;
  const p = a.attributes, y = p.current_temperature ?? 0, g = p.min_temp ?? 5, x = p.max_temp ?? 35, b = p.target_temp_step ?? 0.5, N = a.state === "heat", z = r ?? m, R = (X) => {
    const J = Math.round(X / b) * b;
    u(J), d(J);
  }, H = () => {
    s("climate", "set_hvac_mode", {
      hvac_mode: N ? "off" : "heat"
    }, { entity_id: "climate.a32_pro_van_hydronic_heating_pid" });
  }, G = Math.max(0, Math.min(1, (z - g) / (x - g))), $ = N ? `hsl(${30 - G * 30}, ${70 + G * 30}%, ${55 - G * 10}%)` : void 0;
  return /* @__PURE__ */ o.jsxs(Be, { children: [
    /* @__PURE__ */ o.jsx(lt, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(at, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(
        li,
        {
          className: ae("h-4 w-4", N ? "text-orange-500" : "text-muted-foreground")
        }
      ),
      "Thermostat",
      /* @__PURE__ */ o.jsx("span", { className: ae(
        "ml-auto text-xs font-medium px-2 py-0.5 rounded-full",
        N ? "bg-orange-500/10 text-orange-500" : "bg-muted text-muted-foreground"
      ), children: N ? "Heating" : "Off" })
    ] }) }),
    /* @__PURE__ */ o.jsxs(qe, { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-end justify-between", children: [
        /* @__PURE__ */ o.jsxs("div", { children: [
          /* @__PURE__ */ o.jsx("p", { className: "text-xs text-muted-foreground mb-0.5", children: "Current" }),
          /* @__PURE__ */ o.jsxs("p", { className: "text-3xl font-bold tabular-nums leading-none", children: [
            y.toFixed(1),
            "°"
          ] })
        ] }),
        N && /* @__PURE__ */ o.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ o.jsx("p", { className: "text-xs text-muted-foreground mb-0.5", children: "Target" }),
          /* @__PURE__ */ o.jsxs("p", { className: "text-2xl font-bold tabular-nums text-orange-500 leading-none", children: [
            z.toFixed(1),
            "°"
          ] })
        ] })
      ] }),
      N && /* @__PURE__ */ o.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ o.jsx(
          Jr,
          {
            min: g,
            max: x,
            step: b,
            value: z,
            onValueChange: R,
            style: $ ? {
              accentColor: $
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
        Ks,
        {
          variant: N ? "default" : "outline",
          className: ae("w-full", N && "bg-orange-500 hover:bg-orange-600"),
          onClick: H,
          children: [
            /* @__PURE__ */ o.jsx(yp, { className: "h-4 w-4 mr-2" }),
            N ? "Turn Off" : "Turn On"
          ]
        }
      )
    ] })
  ] });
}
const _n = D.forwardRef(
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
_n.displayName = "Switch";
function Sp() {
  var ne;
  const a = re("switch.a32_pro_switch24_hydronic_heater"), s = re("input_boolean.hot_water_mode"), r = re("light.a32_pro_a32_pro_dac_0"), u = re("sensor.a32_pro_hydronic_heater_status"), f = re("input_boolean.heater_low_fuel_lockout"), { value: d } = Y(
    "sensor.a32_pro_s5140_channel_34_temperature_blower_coolant"
  ), { value: m } = Y(
    "sensor.a32_pro_s5140_channel_35_temperature_blower_air"
  ), { value: p } = Y(
    "sensor.a32_pro_coolant_blower_heating_pid_climate_result"
  ), y = Ot("switch.a32_pro_switch24_hydronic_heater"), g = Ot("input_boolean.hot_water_mode"), x = el(), b = (a == null ? void 0 : a.state) === "on", S = (s == null ? void 0 : s.state) === "on", N = (f == null ? void 0 : f.state) === "on", z = ((ne = r == null ? void 0 : r.attributes) == null ? void 0 : ne.brightness) ?? 0, R = Math.round(z / 255 * 100), H = (u == null ? void 0 : u.state) ?? "", [G, $] = D.useState(null), P = D.useRef(null), X = D.useCallback(
    (Z) => {
      $(Z), P.current && clearTimeout(P.current), P.current = setTimeout(() => {
        x("light", "turn_on", { brightness_pct: Z }, {
          entity_id: "light.a32_pro_a32_pro_dac_0"
        });
      }, 300);
    },
    [x]
  ), J = G ?? R;
  return D.useEffect(() => {
    $(null);
  }, [R]), /* @__PURE__ */ o.jsxs(Be, { children: [
    /* @__PURE__ */ o.jsx(lt, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(at, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(Xr, { className: ae("h-4 w-4", b ? "text-orange-500" : "text-muted-foreground") }),
      "Heating System"
    ] }) }),
    /* @__PURE__ */ o.jsxs(qe, { className: "space-y-4", children: [
      N && /* @__PURE__ */ o.jsx("div", { className: "rounded-lg bg-red-500/10 border border-red-500/30 p-2 text-xs text-red-500 font-medium", children: "⚠ Low fuel lockout active" }),
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "Hydronic Heater" }),
        /* @__PURE__ */ o.jsx(_n, { checked: b, onCheckedChange: y })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsxs("span", { className: "text-sm flex items-center gap-1.5", children: [
          /* @__PURE__ */ o.jsx(Va, { className: "h-3.5 w-3.5 text-blue-500" }),
          "Hot Water Mode"
        ] }),
        /* @__PURE__ */ o.jsx(_n, { checked: S, onCheckedChange: g })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ o.jsxs("span", { className: "text-sm flex items-center gap-1.5", children: [
            /* @__PURE__ */ o.jsx(Ws, { className: "h-3.5 w-3.5" }),
            "Blower Fan"
          ] }),
          /* @__PURE__ */ o.jsxs("span", { className: "text-xs text-muted-foreground tabular-nums", children: [
            J,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ o.jsx(
          Jr,
          {
            min: 0,
            max: 100,
            value: J,
            onValueChange: X
          }
        )
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "border-t pt-3 space-y-1", children: [
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.a32_pro_s5140_channel_34_temperature_blower_coolant", label: "Coolant Temp", value: Q(d, 1), unit: "°C", color: "#ef4444" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.a32_pro_s5140_channel_35_temperature_blower_air", label: "Blower Air", value: Q(m, 1), unit: "°C", color: "#f97316" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.a32_pro_coolant_blower_heating_pid_climate_result", label: "PID Output", value: Q(p, 0), unit: "%", color: "#6366f1" }),
        H && H !== "Idle." && H !== "0" && /* @__PURE__ */ o.jsx("p", { className: "text-xs text-orange-500 mt-1", children: H })
      ] })
    ] })
  ] });
}
function jp() {
  var H;
  const a = re("fan.ag_pro_roof_fan"), s = re("cover.ag_pro_roof_fan_lid"), r = re("sensor.roof_fan_direction"), u = el(), f = (a == null ? void 0 : a.state) === "on", d = ((H = a == null ? void 0 : a.attributes) == null ? void 0 : H.percentage) ?? 0, m = s == null ? void 0 : s.state, p = (r == null ? void 0 : r.state) ?? "Unknown", y = () => {
    u("fan", f ? "turn_off" : "turn_on", void 0, {
      entity_id: "fan.ag_pro_roof_fan"
    });
  }, [g, x] = D.useState(null), b = D.useRef(null), S = D.useCallback(
    (G) => {
      x(G), b.current && clearTimeout(b.current), b.current = setTimeout(() => {
        u("fan", "set_percentage", { percentage: G }, {
          entity_id: "fan.ag_pro_roof_fan"
        });
      }, 300);
    },
    [u]
  ), N = g ?? d;
  D.useEffect(() => {
    x(null);
  }, [d]);
  const z = (G) => {
    u("fan", "set_direction", { direction: G }, {
      entity_id: "fan.ag_pro_roof_fan"
    });
  }, R = () => {
    u("cover", m === "open" ? "close_cover" : "open_cover", void 0, { entity_id: "cover.ag_pro_roof_fan_lid" });
  };
  return /* @__PURE__ */ o.jsxs(Be, { children: [
    /* @__PURE__ */ o.jsx(lt, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(at, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(
        kv,
        {
          className: ae("h-4 w-4", f && "text-cyan-500 animate-spin"),
          style: f ? { animationDuration: "2s" } : void 0
        }
      ),
      "Roof Fan"
    ] }) }),
    /* @__PURE__ */ o.jsxs(qe, { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "Fan" }),
        /* @__PURE__ */ o.jsx(_n, { checked: f, onCheckedChange: y })
      ] }),
      f && /* @__PURE__ */ o.jsxs(o.Fragment, { children: [
        /* @__PURE__ */ o.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "Speed" }),
            /* @__PURE__ */ o.jsxs("span", { className: "text-xs text-muted-foreground tabular-nums", children: [
              N,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ o.jsx(Jr, { min: 0, max: 100, step: 10, value: N, onValueChange: S })
        ] }),
        /* @__PURE__ */ o.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ o.jsxs(
            Ks,
            {
              variant: p === "Exhaust" ? "default" : "outline",
              size: "sm",
              className: "flex-1",
              onClick: () => z("forward"),
              children: [
                /* @__PURE__ */ o.jsx(jv, { className: "h-3.5 w-3.5 mr-1" }),
                "Exhaust"
              ]
            }
          ),
          /* @__PURE__ */ o.jsxs(
            Ks,
            {
              variant: p === "Intake" ? "default" : "outline",
              size: "sm",
              className: "flex-1",
              onClick: () => z("reverse"),
              children: [
                /* @__PURE__ */ o.jsx(Sv, { className: "h-3.5 w-3.5 mr-1" }),
                "Intake"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "Lid" }),
        /* @__PURE__ */ o.jsx(Ks, { variant: "outline", size: "sm", onClick: R, children: m === "open" ? "Close" : "Open" })
      ] })
    ] })
  ] });
}
const ox = {
  green: "bg-green-500",
  red: "bg-red-500",
  orange: "bg-orange-500",
  blue: "bg-blue-500",
  yellow: "bg-yellow-500",
  cyan: "bg-cyan-500",
  purple: "bg-purple-500"
};
function qs({ active: a, color: s = "green", label: r, className: u }) {
  const f = s.startsWith("bg-") ? s : ox[s] ?? "bg-green-500";
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
function fx() {
  const a = re("binary_sensor.apollo_msr_2_1731d8_radar_target"), s = re("device_tracker.starlink"), r = re("input_boolean.power_saving_mode"), u = re("input_boolean.sleep_mode"), f = re("binary_sensor.engine_is_running"), d = re("binary_sensor.meatpi_pro_ecu_status"), m = (a == null ? void 0 : a.state) === "on", p = (s == null ? void 0 : s.state) === "home", y = (r == null ? void 0 : r.state) === "on", g = (u == null ? void 0 : u.state) === "on", x = (d == null ? void 0 : d.state) === "on" && cp(d == null ? void 0 : d.last_updated), b = (f == null ? void 0 : f.state) === "on" && x;
  return /* @__PURE__ */ o.jsxs("div", { className: "flex flex-wrap items-center gap-3 px-1", children: [
    /* @__PURE__ */ o.jsx(qs, { active: m, color: "green", label: m ? "Occupied" : "Empty" }),
    /* @__PURE__ */ o.jsx(qs, { active: p, color: "blue", label: p ? "Online" : "Offline" }),
    b && /* @__PURE__ */ o.jsx(qs, { active: !0, color: "orange", label: "Engine On" }),
    y && /* @__PURE__ */ o.jsx(qs, { active: !0, color: "yellow", label: "Power Save" }),
    g && /* @__PURE__ */ o.jsx(qs, { active: !0, color: "purple", label: "Sleep" })
  ] });
}
const b0 = {
  green: { border: "border-green-500", bg: "bg-green-500/10", text: "text-green-500", glow: "shadow-green-500/25" },
  blue: { border: "border-blue-500", bg: "bg-blue-500/10", text: "text-blue-500", glow: "shadow-blue-500/25" },
  orange: { border: "border-orange-500", bg: "bg-orange-500/10", text: "text-orange-500", glow: "shadow-orange-500/25" },
  red: { border: "border-red-500", bg: "bg-red-500/10", text: "text-red-500", glow: "shadow-red-500/25" },
  cyan: { border: "border-cyan-500", bg: "bg-cyan-500/10", text: "text-cyan-500", glow: "shadow-cyan-500/25" },
  yellow: { border: "border-yellow-500", bg: "bg-yellow-500/10", text: "text-yellow-500", glow: "shadow-yellow-500/25" },
  purple: { border: "border-purple-500", bg: "bg-purple-500/10", text: "text-purple-500", glow: "shadow-purple-500/25" }
};
function gt({
  entityId: a,
  name: s,
  icon: r,
  activeColor: u = "blue",
  onToggle: f,
  className: d
}) {
  const m = re(a), p = Ot(a), y = (m == null ? void 0 : m.state) === "on", g = b0[u] || b0.blue;
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
function Sr({ entityId: a, name: s, hasCct: r = !1 }) {
  var X, J, ne, Z;
  const u = re(a), f = Ot(a), d = el(), m = (u == null ? void 0 : u.state) === "on", p = ((X = u == null ? void 0 : u.attributes) == null ? void 0 : X.brightness) ?? 0, y = Math.round(p / 255 * 100), g = ((J = u == null ? void 0 : u.attributes) == null ? void 0 : J.color_temp) ?? 250, x = ((ne = u == null ? void 0 : u.attributes) == null ? void 0 : ne.min_mireds) ?? 150, b = ((Z = u == null ? void 0 : u.attributes) == null ? void 0 : Z.max_mireds) ?? 500, [S, N] = D.useState(y), [z, R] = D.useState(g), H = D.useRef(void 0), G = D.useRef(void 0);
  D.useEffect(() => {
    N(y);
  }, [y]), D.useEffect(() => {
    R(g);
  }, [g]);
  const $ = D.useCallback(
    (ee) => {
      N(ee), H.current && clearTimeout(H.current), H.current = setTimeout(() => {
        d("light", "turn_on", { brightness_pct: ee }, { entity_id: a });
      }, 200);
    },
    [d, a]
  ), P = D.useCallback(
    (ee) => {
      R(ee), G.current && clearTimeout(G.current), G.current = setTimeout(() => {
        d("light", "turn_on", { color_temp: ee }, { entity_id: a });
      }, 200);
    },
    [d, a]
  );
  return /* @__PURE__ */ o.jsxs(
    "div",
    {
      className: ae(
        "rounded-xl border-2 transition-all duration-300 overflow-hidden",
        m ? "border-yellow-500/60 bg-yellow-500/5 shadow-md shadow-yellow-500/15" : "border-border bg-card"
      ),
      children: [
        /* @__PURE__ */ o.jsxs(
          "button",
          {
            onClick: f,
            className: ae(
              "flex items-center gap-3 w-full px-3 py-2.5 transition-colors",
              m ? "text-foreground" : "text-muted-foreground hover:bg-accent"
            ),
            children: [
              /* @__PURE__ */ o.jsx(yp, { className: ae("h-3.5 w-3.5 shrink-0", m ? "text-yellow-500" : "") }),
              /* @__PURE__ */ o.jsx("span", { className: "text-xs font-medium", children: s }),
              m && /* @__PURE__ */ o.jsxs("span", { className: "ml-auto text-[10px] tabular-nums text-muted-foreground", children: [
                S,
                "%"
              ] })
            ]
          }
        ),
        m && /* @__PURE__ */ o.jsxs("div", { className: "px-3 pb-2.5 space-y-2", children: [
          /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ o.jsx(ni, { className: "h-3 w-3 text-muted-foreground shrink-0" }),
            /* @__PURE__ */ o.jsx(
              "input",
              {
                type: "range",
                min: 1,
                max: 100,
                value: S,
                onChange: (ee) => $(Number(ee.target.value)),
                className: `w-full h-1.5 rounded-full appearance-none cursor-pointer bg-secondary\r
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4\r
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-500`
              }
            )
          ] }),
          r && /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ o.jsx(li, { className: "h-3 w-3 text-muted-foreground shrink-0" }),
            /* @__PURE__ */ o.jsx(
              "input",
              {
                type: "range",
                min: x,
                max: b,
                value: z,
                onChange: (ee) => P(Number(ee.target.value)),
                className: `w-full h-1.5 rounded-full appearance-none cursor-pointer\r
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4\r
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-400`,
                style: {
                  background: "linear-gradient(to right, #cce0ff, #ffcc66, #ff8833)"
                }
              }
            )
          ] })
        ] })
      ]
    }
  );
}
const dx = 3e4;
function Np({ name: a = "Inverter" }) {
  const s = cx("button.a32_pro_inverter_on_off_toggle"), r = re("input_boolean.inverter_state"), u = (r == null ? void 0 : r.state) === "on", [f, d] = D.useState(!1), m = D.useRef(null), p = D.useRef(null);
  D.useEffect(() => {
    f && m.current !== null && (r == null ? void 0 : r.state) !== m.current && (d(!1), m.current = null, p.current && clearTimeout(p.current));
  }, [r == null ? void 0 : r.state, f]), D.useEffect(() => () => {
    p.current && clearTimeout(p.current);
  }, []);
  const y = D.useCallback(() => {
    f || (s(), m.current = (r == null ? void 0 : r.state) ?? null, d(!0), p.current && clearTimeout(p.current), p.current = setTimeout(() => {
      d(!1), m.current = null;
    }, dx));
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
          ai,
          {
            className: ae(
              "h-5 w-5 transition-transform duration-300",
              f && "animate-pulse",
              u && !f && "scale-110"
            )
          }
        ),
        /* @__PURE__ */ o.jsx("span", { className: "text-xs font-medium", children: f ? "Loading…" : u ? "ON" : "Inverter" })
      ]
    }
  );
}
function vn({
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
function hx() {
  const { value: a } = Y("sensor.olins_van_bms_battery"), { value: s } = Y("sensor.total_mppt_pv_power"), { value: r } = Y("sensor.a32_pro_fresh_water_tank_level"), { value: u } = Y("sensor.a32_pro_grey_water_tank_level"), { value: f } = Y("sensor.stable_fuel_level"), { value: d } = Y("sensor.propane_tank_percentage"), { value: m } = Y("sensor.starlink_downlink_throughput_mbps"), p = re("binary_sensor.shelly_em_reachable"), y = re("input_boolean.power_saving_mode"), g = re("switch.a32_pro_switch06_grey_water_tank_valve"), x = re("light.led_controller_cct_1"), b = re("light.led_controller_cct_2"), S = re("light.led_controller_sc_1"), N = re("light.led_controller_sc_2"), { open: z } = Cn(), R = Ot("switch.a32_pro_switch06_grey_water_tank_valve"), H = Ot("input_boolean.power_saving_mode"), G = el(), $ = (p == null ? void 0 : p.state) === "on", P = (y == null ? void 0 : y.state) === "on", X = (g == null ? void 0 : g.state) === "on", J = [x, b, S, N].filter((ee) => (ee == null ? void 0 : ee.state) === "on").length, ne = D.useCallback(() => {
    const ee = [
      "light.led_controller_cct_1",
      "light.led_controller_cct_2",
      "light.led_controller_sc_1",
      "light.led_controller_sc_2"
    ], ge = J > 0 ? "turn_off" : "turn_on";
    G("light", ge, void 0, { entity_id: ee });
  }, [G, J]), Z = (ee) => ee ?? 0;
  return /* @__PURE__ */ o.jsxs("div", { className: "flex gap-2 overflow-x-auto pb-1", children: [
    /* @__PURE__ */ o.jsx(
      vn,
      {
        label: "Battery",
        value: `${Q(a, 0)}%`,
        color: Z(a) < 30 ? "text-red-500" : Z(a) < 65 ? "text-orange-500" : "text-green-500",
        icon: Jo,
        onClick: () => z("sensor.olins_van_bms_battery", "Battery SOC", "%")
      }
    ),
    /* @__PURE__ */ o.jsx(
      vn,
      {
        label: "Solar",
        value: `${Q(s, 0)}W`,
        color: Z(s) > 50 ? "text-yellow-500" : "text-muted-foreground",
        icon: ni,
        onClick: () => z("sensor.total_mppt_pv_power", "Solar Power", "W")
      }
    ),
    /* @__PURE__ */ o.jsx(
      vn,
      {
        label: "Lights",
        value: J > 0 ? `${J} on` : "Off",
        color: J > 0 ? "text-yellow-500" : "text-muted-foreground",
        icon: Qr,
        onClick: ne
      }
    ),
    /* @__PURE__ */ o.jsx(
      vn,
      {
        label: "Inverter",
        value: $ ? "ON" : "OFF",
        color: $ ? "text-green-500" : "text-muted-foreground",
        icon: ai,
        onClick: () => z("sensor.inverter_power_24v", "Inverter Power", "W")
      }
    ),
    /* @__PURE__ */ o.jsx(
      vn,
      {
        label: "Internet",
        value: `${Q(m, 0)} Mbps`,
        color: Z(m) > 50 ? "text-green-500" : Z(m) > 10 ? "text-orange-500" : "text-red-500",
        icon: Wv,
        onClick: () => z("sensor.starlink_downlink_throughput_mbps", "Internet Speed", "Mbps")
      }
    ),
    /* @__PURE__ */ o.jsx(
      vn,
      {
        label: "Fresh",
        value: `${Q(r, 0)}%`,
        color: Z(r) < 20 ? "text-red-500" : Z(r) < 50 ? "text-orange-500" : "text-blue-500",
        icon: Va,
        onClick: () => z("sensor.a32_pro_fresh_water_tank_level", "Fresh Water", "%")
      }
    ),
    /* @__PURE__ */ o.jsx(
      vn,
      {
        label: "Grey",
        value: `${Q(u, 0)}%`,
        color: Z(u) > 80 ? "text-red-500" : Z(u) > 60 ? "text-orange-500" : "text-green-500",
        icon: Kr,
        onClick: () => z("sensor.a32_pro_grey_water_tank_level", "Grey Water", "%")
      }
    ),
    /* @__PURE__ */ o.jsx(
      vn,
      {
        label: "Grey Dump",
        value: X ? "OPEN" : "Closed",
        color: X ? "text-orange-500" : "text-muted-foreground",
        icon: Zv,
        onClick: R
      }
    ),
    /* @__PURE__ */ o.jsx(
      vn,
      {
        label: "Fuel",
        value: `${Q(f, 0)}%`,
        color: Z(f) < 15 ? "text-red-500" : Z(f) < 30 ? "text-orange-500" : "text-green-500",
        icon: dp,
        onClick: () => z("sensor.stable_fuel_level", "Fuel Level", "%")
      }
    ),
    /* @__PURE__ */ o.jsx(
      vn,
      {
        label: "Propane",
        value: `${Q(d, 0)}%`,
        color: Z(d) < 15 ? "text-red-500" : Z(d) < 30 ? "text-orange-500" : "text-green-500",
        icon: Xr,
        onClick: () => z("sensor.propane_tank_percentage", "Propane", "%")
      }
    ),
    /* @__PURE__ */ o.jsx(
      vn,
      {
        label: "Eco Mode",
        value: P ? "ON" : "OFF",
        color: P ? "text-yellow-500" : "text-muted-foreground",
        icon: Ko,
        onClick: H
      }
    )
  ] });
}
function mx() {
  return /* @__PURE__ */ o.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ o.jsx(
        gt,
        {
          entityId: "input_boolean.shore_power_charger_enabled",
          name: "Shore",
          icon: gp,
          activeColor: "green"
        }
      ),
      /* @__PURE__ */ o.jsx(
        gt,
        {
          entityId: "switch.a32_pro_switch06_grey_water_tank_valve",
          name: "Grey Dump",
          icon: Kr,
          activeColor: "orange"
        }
      ),
      /* @__PURE__ */ o.jsx(Np, {}),
      /* @__PURE__ */ o.jsx(
        gt,
        {
          entityId: "switch.a32_pro_switch28_compressor",
          name: "Compressor",
          icon: wv,
          activeColor: "cyan"
        }
      )
    ] }),
    /* @__PURE__ */ o.jsxs("div", { children: [
      /* @__PURE__ */ o.jsx("p", { className: "text-xs text-muted-foreground font-medium mb-1.5", children: "Indoor Lights" }),
      /* @__PURE__ */ o.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ o.jsx(Sr, { entityId: "light.led_controller_cct_1", name: "Main", hasCct: !0 }),
        /* @__PURE__ */ o.jsx(Sr, { entityId: "light.led_controller_cct_2", name: "Cabinet", hasCct: !0 }),
        /* @__PURE__ */ o.jsx(Sr, { entityId: "light.led_controller_sc_1", name: "Shower" }),
        /* @__PURE__ */ o.jsx(Sr, { entityId: "light.led_controller_sc_2", name: "Accent" })
      ] })
    ] }),
    /* @__PURE__ */ o.jsxs("div", { children: [
      /* @__PURE__ */ o.jsx("p", { className: "text-xs text-muted-foreground font-medium mb-1.5", children: "Outdoor Lights" }),
      /* @__PURE__ */ o.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ o.jsx(
          gt,
          {
            entityId: "switch.a32_pro_switch21_left_outdoor_lights",
            name: "Left",
            icon: bo,
            activeColor: "yellow"
          }
        ),
        /* @__PURE__ */ o.jsx(
          gt,
          {
            entityId: "switch.a32_pro_switch22_right_outdoor_lights",
            name: "Right",
            icon: bo,
            activeColor: "yellow"
          }
        ),
        /* @__PURE__ */ o.jsx(
          gt,
          {
            entityId: "switch.a32_pro_switch23_rear_outdoor_lights",
            name: "Rear",
            icon: bo,
            activeColor: "yellow"
          }
        ),
        /* @__PURE__ */ o.jsx(
          gt,
          {
            entityId: "switch.a32_pro_switch31_lightbar",
            name: "Lightbar",
            icon: Qr,
            activeColor: "yellow"
          }
        )
      ] })
    ] })
  ] });
}
function px() {
  return /* @__PURE__ */ o.jsxs("div", { className: "flex flex-wrap gap-2", children: [
    /* @__PURE__ */ o.jsx(
      gt,
      {
        entityId: "input_boolean.power_saving_mode",
        name: "Eco",
        icon: Ko,
        activeColor: "yellow"
      }
    ),
    /* @__PURE__ */ o.jsx(
      gt,
      {
        entityId: "input_boolean.sleep_mode",
        name: "Sleep",
        icon: $o,
        activeColor: "purple"
      }
    ),
    /* @__PURE__ */ o.jsx(
      gt,
      {
        entityId: "input_boolean.shower_mode",
        name: "Shower",
        icon: Zr,
        activeColor: "cyan"
      }
    )
  ] });
}
function Mp() {
  return /* @__PURE__ */ o.jsxs(Il, { title: "Home", children: [
    /* @__PURE__ */ o.jsx(hx, {}),
    /* @__PURE__ */ o.jsx(fx, {}),
    /* @__PURE__ */ o.jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ o.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ o.jsx(
            ko,
            {
              name: "Living",
              tempEntity: "sensor.a32_pro_bme280_1_temperature",
              humidityEntity: "sensor.a32_pro_bme280_1_relative_humidity"
            }
          ),
          /* @__PURE__ */ o.jsx(
            ko,
            {
              name: "Outdoor",
              tempEntity: "sensor.a32_pro_bme280_4_temperature",
              humidityEntity: "sensor.a32_pro_bme280_4_relative_humidity"
            }
          )
        ] }),
        /* @__PURE__ */ o.jsx(ux, {}),
        /* @__PURE__ */ o.jsx(Sp, {}),
        /* @__PURE__ */ o.jsx(jp, {})
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ o.jsx(_p, { compact: !0 }),
        /* @__PURE__ */ o.jsx(bp, { compact: !0 }),
        /* @__PURE__ */ o.jsx(mx, {})
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ o.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ o.jsx(Or, { name: "Fresh", entityId: "sensor.a32_pro_fresh_water_tank_level" }),
          /* @__PURE__ */ o.jsx(
            Or,
            {
              name: "Grey",
              entityId: "sensor.a32_pro_grey_water_tank_level",
              invertWarning: !0
            }
          )
        ] }),
        /* @__PURE__ */ o.jsx(px, {}),
        /* @__PURE__ */ o.jsx(ix, {})
      ] })
    ] })
  ] });
}
var gx = { value: () => {
} };
function Tp() {
  for (var a = 0, s = arguments.length, r = {}, u; a < s; ++a) {
    if (!(u = arguments[a] + "") || u in r || /[\s.]/.test(u)) throw new Error("illegal type: " + u);
    r[u] = [];
  }
  return new Er(r);
}
function Er(a) {
  this._ = a;
}
function yx(a, s) {
  return a.trim().split(/^|\s+/).map(function(r) {
    var u = "", f = r.indexOf(".");
    if (f >= 0 && (u = r.slice(f + 1), r = r.slice(0, f)), r && !s.hasOwnProperty(r)) throw new Error("unknown type: " + r);
    return { type: r, name: u };
  });
}
Er.prototype = Tp.prototype = {
  constructor: Er,
  on: function(a, s) {
    var r = this._, u = yx(a + "", r), f, d = -1, m = u.length;
    if (arguments.length < 2) {
      for (; ++d < m; ) if ((f = (a = u[d]).type) && (f = vx(r[f], a.name))) return f;
      return;
    }
    if (s != null && typeof s != "function") throw new Error("invalid callback: " + s);
    for (; ++d < m; )
      if (f = (a = u[d]).type) r[f] = w0(r[f], a.name, s);
      else if (s == null) for (f in r) r[f] = w0(r[f], a.name, null);
    return this;
  },
  copy: function() {
    var a = {}, s = this._;
    for (var r in s) a[r] = s[r].slice();
    return new Er(a);
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
function vx(a, s) {
  for (var r = 0, u = a.length, f; r < u; ++r)
    if ((f = a[r]).name === s)
      return f.value;
}
function w0(a, s, r) {
  for (var u = 0, f = a.length; u < f; ++u)
    if (a[u].name === s) {
      a[u] = gx, a = a.slice(0, u).concat(a.slice(u + 1));
      break;
    }
  return r != null && a.push({ name: s, value: r }), a;
}
var Do = "http://www.w3.org/1999/xhtml";
const S0 = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: Do,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function $r(a) {
  var s = a += "", r = s.indexOf(":");
  return r >= 0 && (s = a.slice(0, r)) !== "xmlns" && (a = a.slice(r + 1)), S0.hasOwnProperty(s) ? { space: S0[s], local: a } : a;
}
function xx(a) {
  return function() {
    var s = this.ownerDocument, r = this.namespaceURI;
    return r === Do && s.documentElement.namespaceURI === Do ? s.createElement(a) : s.createElementNS(r, a);
  };
}
function _x(a) {
  return function() {
    return this.ownerDocument.createElementNS(a.space, a.local);
  };
}
function Ep(a) {
  var s = $r(a);
  return (s.local ? _x : xx)(s);
}
function bx() {
}
function Fo(a) {
  return a == null ? bx : function() {
    return this.querySelector(a);
  };
}
function wx(a) {
  typeof a != "function" && (a = Fo(a));
  for (var s = this._groups, r = s.length, u = new Array(r), f = 0; f < r; ++f)
    for (var d = s[f], m = d.length, p = u[f] = new Array(m), y, g, x = 0; x < m; ++x)
      (y = d[x]) && (g = a.call(y, y.__data__, x, d)) && ("__data__" in y && (g.__data__ = y.__data__), p[x] = g);
  return new bn(u, this._parents);
}
function Sx(a) {
  return a == null ? [] : Array.isArray(a) ? a : Array.from(a);
}
function jx() {
  return [];
}
function Ap(a) {
  return a == null ? jx : function() {
    return this.querySelectorAll(a);
  };
}
function Nx(a) {
  return function() {
    return Sx(a.apply(this, arguments));
  };
}
function Mx(a) {
  typeof a == "function" ? a = Nx(a) : a = Ap(a);
  for (var s = this._groups, r = s.length, u = [], f = [], d = 0; d < r; ++d)
    for (var m = s[d], p = m.length, y, g = 0; g < p; ++g)
      (y = m[g]) && (u.push(a.call(y, y.__data__, g, m)), f.push(y));
  return new bn(u, f);
}
function Cp(a) {
  return function() {
    return this.matches(a);
  };
}
function zp(a) {
  return function(s) {
    return s.matches(a);
  };
}
var Tx = Array.prototype.find;
function Ex(a) {
  return function() {
    return Tx.call(this.children, a);
  };
}
function Ax() {
  return this.firstElementChild;
}
function Cx(a) {
  return this.select(a == null ? Ax : Ex(typeof a == "function" ? a : zp(a)));
}
var zx = Array.prototype.filter;
function Ox() {
  return Array.from(this.children);
}
function kx(a) {
  return function() {
    return zx.call(this.children, a);
  };
}
function Dx(a) {
  return this.selectAll(a == null ? Ox : kx(typeof a == "function" ? a : zp(a)));
}
function Rx(a) {
  typeof a != "function" && (a = Cp(a));
  for (var s = this._groups, r = s.length, u = new Array(r), f = 0; f < r; ++f)
    for (var d = s[f], m = d.length, p = u[f] = [], y, g = 0; g < m; ++g)
      (y = d[g]) && a.call(y, y.__data__, g, d) && p.push(y);
  return new bn(u, this._parents);
}
function Op(a) {
  return new Array(a.length);
}
function Hx() {
  return new bn(this._enter || this._groups.map(Op), this._parents);
}
function kr(a, s) {
  this.ownerDocument = a.ownerDocument, this.namespaceURI = a.namespaceURI, this._next = null, this._parent = a, this.__data__ = s;
}
kr.prototype = {
  constructor: kr,
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
function Ux(a) {
  return function() {
    return a;
  };
}
function Lx(a, s, r, u, f, d) {
  for (var m = 0, p, y = s.length, g = d.length; m < g; ++m)
    (p = s[m]) ? (p.__data__ = d[m], u[m] = p) : r[m] = new kr(a, d[m]);
  for (; m < y; ++m)
    (p = s[m]) && (f[m] = p);
}
function Bx(a, s, r, u, f, d, m) {
  var p, y, g = /* @__PURE__ */ new Map(), x = s.length, b = d.length, S = new Array(x), N;
  for (p = 0; p < x; ++p)
    (y = s[p]) && (S[p] = N = m.call(y, y.__data__, p, s) + "", g.has(N) ? f[p] = y : g.set(N, y));
  for (p = 0; p < b; ++p)
    N = m.call(a, d[p], p, d) + "", (y = g.get(N)) ? (u[p] = y, y.__data__ = d[p], g.delete(N)) : r[p] = new kr(a, d[p]);
  for (p = 0; p < x; ++p)
    (y = s[p]) && g.get(S[p]) === y && (f[p] = y);
}
function qx(a) {
  return a.__data__;
}
function Yx(a, s) {
  if (!arguments.length) return Array.from(this, qx);
  var r = s ? Bx : Lx, u = this._parents, f = this._groups;
  typeof a != "function" && (a = Ux(a));
  for (var d = f.length, m = new Array(d), p = new Array(d), y = new Array(d), g = 0; g < d; ++g) {
    var x = u[g], b = f[g], S = b.length, N = Gx(a.call(x, x && x.__data__, g, u)), z = N.length, R = p[g] = new Array(z), H = m[g] = new Array(z), G = y[g] = new Array(S);
    r(x, b, R, H, G, N, s);
    for (var $ = 0, P = 0, X, J; $ < z; ++$)
      if (X = R[$]) {
        for ($ >= P && (P = $ + 1); !(J = H[P]) && ++P < z; ) ;
        X._next = J || null;
      }
  }
  return m = new bn(m, u), m._enter = p, m._exit = y, m;
}
function Gx(a) {
  return typeof a == "object" && "length" in a ? a : Array.from(a);
}
function Vx() {
  return new bn(this._exit || this._groups.map(Op), this._parents);
}
function Xx(a, s, r) {
  var u = this.enter(), f = this, d = this.exit();
  return typeof a == "function" ? (u = a(u), u && (u = u.selection())) : u = u.append(a + ""), s != null && (f = s(f), f && (f = f.selection())), r == null ? d.remove() : r(d), u && f ? u.merge(f).order() : f;
}
function Qx(a) {
  for (var s = a.selection ? a.selection() : a, r = this._groups, u = s._groups, f = r.length, d = u.length, m = Math.min(f, d), p = new Array(f), y = 0; y < m; ++y)
    for (var g = r[y], x = u[y], b = g.length, S = p[y] = new Array(b), N, z = 0; z < b; ++z)
      (N = g[z] || x[z]) && (S[z] = N);
  for (; y < f; ++y)
    p[y] = r[y];
  return new bn(p, this._parents);
}
function Zx() {
  for (var a = this._groups, s = -1, r = a.length; ++s < r; )
    for (var u = a[s], f = u.length - 1, d = u[f], m; --f >= 0; )
      (m = u[f]) && (d && m.compareDocumentPosition(d) ^ 4 && d.parentNode.insertBefore(m, d), d = m);
  return this;
}
function Kx(a) {
  a || (a = Jx);
  function s(b, S) {
    return b && S ? a(b.__data__, S.__data__) : !b - !S;
  }
  for (var r = this._groups, u = r.length, f = new Array(u), d = 0; d < u; ++d) {
    for (var m = r[d], p = m.length, y = f[d] = new Array(p), g, x = 0; x < p; ++x)
      (g = m[x]) && (y[x] = g);
    y.sort(s);
  }
  return new bn(f, this._parents).order();
}
function Jx(a, s) {
  return a < s ? -1 : a > s ? 1 : a >= s ? 0 : NaN;
}
function $x() {
  var a = arguments[0];
  return arguments[0] = this, a.apply(null, arguments), this;
}
function Wx() {
  return Array.from(this);
}
function Fx() {
  for (var a = this._groups, s = 0, r = a.length; s < r; ++s)
    for (var u = a[s], f = 0, d = u.length; f < d; ++f) {
      var m = u[f];
      if (m) return m;
    }
  return null;
}
function Ix() {
  let a = 0;
  for (const s of this) ++a;
  return a;
}
function Px() {
  return !this.node();
}
function e_(a) {
  for (var s = this._groups, r = 0, u = s.length; r < u; ++r)
    for (var f = s[r], d = 0, m = f.length, p; d < m; ++d)
      (p = f[d]) && a.call(p, p.__data__, d, f);
  return this;
}
function t_(a) {
  return function() {
    this.removeAttribute(a);
  };
}
function n_(a) {
  return function() {
    this.removeAttributeNS(a.space, a.local);
  };
}
function l_(a, s) {
  return function() {
    this.setAttribute(a, s);
  };
}
function a_(a, s) {
  return function() {
    this.setAttributeNS(a.space, a.local, s);
  };
}
function s_(a, s) {
  return function() {
    var r = s.apply(this, arguments);
    r == null ? this.removeAttribute(a) : this.setAttribute(a, r);
  };
}
function i_(a, s) {
  return function() {
    var r = s.apply(this, arguments);
    r == null ? this.removeAttributeNS(a.space, a.local) : this.setAttributeNS(a.space, a.local, r);
  };
}
function r_(a, s) {
  var r = $r(a);
  if (arguments.length < 2) {
    var u = this.node();
    return r.local ? u.getAttributeNS(r.space, r.local) : u.getAttribute(r);
  }
  return this.each((s == null ? r.local ? n_ : t_ : typeof s == "function" ? r.local ? i_ : s_ : r.local ? a_ : l_)(r, s));
}
function kp(a) {
  return a.ownerDocument && a.ownerDocument.defaultView || a.document && a || a.defaultView;
}
function c_(a) {
  return function() {
    this.style.removeProperty(a);
  };
}
function u_(a, s, r) {
  return function() {
    this.style.setProperty(a, s, r);
  };
}
function o_(a, s, r) {
  return function() {
    var u = s.apply(this, arguments);
    u == null ? this.style.removeProperty(a) : this.style.setProperty(a, u, r);
  };
}
function f_(a, s, r) {
  return arguments.length > 1 ? this.each((s == null ? c_ : typeof s == "function" ? o_ : u_)(a, s, r ?? "")) : Ba(this.node(), a);
}
function Ba(a, s) {
  return a.style.getPropertyValue(s) || kp(a).getComputedStyle(a, null).getPropertyValue(s);
}
function d_(a) {
  return function() {
    delete this[a];
  };
}
function h_(a, s) {
  return function() {
    this[a] = s;
  };
}
function m_(a, s) {
  return function() {
    var r = s.apply(this, arguments);
    r == null ? delete this[a] : this[a] = r;
  };
}
function p_(a, s) {
  return arguments.length > 1 ? this.each((s == null ? d_ : typeof s == "function" ? m_ : h_)(a, s)) : this.node()[a];
}
function Dp(a) {
  return a.trim().split(/^|\s+/);
}
function Io(a) {
  return a.classList || new Rp(a);
}
function Rp(a) {
  this._node = a, this._names = Dp(a.getAttribute("class") || "");
}
Rp.prototype = {
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
function Hp(a, s) {
  for (var r = Io(a), u = -1, f = s.length; ++u < f; ) r.add(s[u]);
}
function Up(a, s) {
  for (var r = Io(a), u = -1, f = s.length; ++u < f; ) r.remove(s[u]);
}
function g_(a) {
  return function() {
    Hp(this, a);
  };
}
function y_(a) {
  return function() {
    Up(this, a);
  };
}
function v_(a, s) {
  return function() {
    (s.apply(this, arguments) ? Hp : Up)(this, a);
  };
}
function x_(a, s) {
  var r = Dp(a + "");
  if (arguments.length < 2) {
    for (var u = Io(this.node()), f = -1, d = r.length; ++f < d; ) if (!u.contains(r[f])) return !1;
    return !0;
  }
  return this.each((typeof s == "function" ? v_ : s ? g_ : y_)(r, s));
}
function __() {
  this.textContent = "";
}
function b_(a) {
  return function() {
    this.textContent = a;
  };
}
function w_(a) {
  return function() {
    var s = a.apply(this, arguments);
    this.textContent = s ?? "";
  };
}
function S_(a) {
  return arguments.length ? this.each(a == null ? __ : (typeof a == "function" ? w_ : b_)(a)) : this.node().textContent;
}
function j_() {
  this.innerHTML = "";
}
function N_(a) {
  return function() {
    this.innerHTML = a;
  };
}
function M_(a) {
  return function() {
    var s = a.apply(this, arguments);
    this.innerHTML = s ?? "";
  };
}
function T_(a) {
  return arguments.length ? this.each(a == null ? j_ : (typeof a == "function" ? M_ : N_)(a)) : this.node().innerHTML;
}
function E_() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function A_() {
  return this.each(E_);
}
function C_() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function z_() {
  return this.each(C_);
}
function O_(a) {
  var s = typeof a == "function" ? a : Ep(a);
  return this.select(function() {
    return this.appendChild(s.apply(this, arguments));
  });
}
function k_() {
  return null;
}
function D_(a, s) {
  var r = typeof a == "function" ? a : Ep(a), u = s == null ? k_ : typeof s == "function" ? s : Fo(s);
  return this.select(function() {
    return this.insertBefore(r.apply(this, arguments), u.apply(this, arguments) || null);
  });
}
function R_() {
  var a = this.parentNode;
  a && a.removeChild(this);
}
function H_() {
  return this.each(R_);
}
function U_() {
  var a = this.cloneNode(!1), s = this.parentNode;
  return s ? s.insertBefore(a, this.nextSibling) : a;
}
function L_() {
  var a = this.cloneNode(!0), s = this.parentNode;
  return s ? s.insertBefore(a, this.nextSibling) : a;
}
function B_(a) {
  return this.select(a ? L_ : U_);
}
function q_(a) {
  return arguments.length ? this.property("__data__", a) : this.node().__data__;
}
function Y_(a) {
  return function(s) {
    a.call(this, s, this.__data__);
  };
}
function G_(a) {
  return a.trim().split(/^|\s+/).map(function(s) {
    var r = "", u = s.indexOf(".");
    return u >= 0 && (r = s.slice(u + 1), s = s.slice(0, u)), { type: s, name: r };
  });
}
function V_(a) {
  return function() {
    var s = this.__on;
    if (s) {
      for (var r = 0, u = -1, f = s.length, d; r < f; ++r)
        d = s[r], (!a.type || d.type === a.type) && d.name === a.name ? this.removeEventListener(d.type, d.listener, d.options) : s[++u] = d;
      ++u ? s.length = u : delete this.__on;
    }
  };
}
function X_(a, s, r) {
  return function() {
    var u = this.__on, f, d = Y_(s);
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
function Q_(a, s, r) {
  var u = G_(a + ""), f, d = u.length, m;
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
  for (p = s ? X_ : V_, f = 0; f < d; ++f) this.each(p(u[f], s, r));
  return this;
}
function Lp(a, s, r) {
  var u = kp(a), f = u.CustomEvent;
  typeof f == "function" ? f = new f(s, r) : (f = u.document.createEvent("Event"), r ? (f.initEvent(s, r.bubbles, r.cancelable), f.detail = r.detail) : f.initEvent(s, !1, !1)), a.dispatchEvent(f);
}
function Z_(a, s) {
  return function() {
    return Lp(this, a, s);
  };
}
function K_(a, s) {
  return function() {
    return Lp(this, a, s.apply(this, arguments));
  };
}
function J_(a, s) {
  return this.each((typeof s == "function" ? K_ : Z_)(a, s));
}
function* $_() {
  for (var a = this._groups, s = 0, r = a.length; s < r; ++s)
    for (var u = a[s], f = 0, d = u.length, m; f < d; ++f)
      (m = u[f]) && (yield m);
}
var W_ = [null];
function bn(a, s) {
  this._groups = a, this._parents = s;
}
function si() {
  return new bn([[document.documentElement]], W_);
}
function F_() {
  return this;
}
bn.prototype = si.prototype = {
  constructor: bn,
  select: wx,
  selectAll: Mx,
  selectChild: Cx,
  selectChildren: Dx,
  filter: Rx,
  data: Yx,
  enter: Hx,
  exit: Vx,
  join: Xx,
  merge: Qx,
  selection: F_,
  order: Zx,
  sort: Kx,
  call: $x,
  nodes: Wx,
  node: Fx,
  size: Ix,
  empty: Px,
  each: e_,
  attr: r_,
  style: f_,
  property: p_,
  classed: x_,
  text: S_,
  html: T_,
  raise: A_,
  lower: z_,
  append: O_,
  insert: D_,
  remove: H_,
  clone: B_,
  datum: q_,
  on: Q_,
  dispatch: J_,
  [Symbol.iterator]: $_
};
function Po(a, s, r) {
  a.prototype = s.prototype = r, r.constructor = a;
}
function Bp(a, s) {
  var r = Object.create(a.prototype);
  for (var u in s) r[u] = s[u];
  return r;
}
function ii() {
}
var Fs = 0.7, Dr = 1 / Fs, La = "\\s*([+-]?\\d+)\\s*", Is = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", An = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", I_ = /^#([0-9a-f]{3,8})$/, P_ = new RegExp(`^rgb\\(${La},${La},${La}\\)$`), eb = new RegExp(`^rgb\\(${An},${An},${An}\\)$`), tb = new RegExp(`^rgba\\(${La},${La},${La},${Is}\\)$`), nb = new RegExp(`^rgba\\(${An},${An},${An},${Is}\\)$`), lb = new RegExp(`^hsl\\(${Is},${An},${An}\\)$`), ab = new RegExp(`^hsla\\(${Is},${An},${An},${Is}\\)$`), j0 = {
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
Po(ii, Ps, {
  copy(a) {
    return Object.assign(new this.constructor(), this, a);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: N0,
  // Deprecated! Use color.formatHex.
  formatHex: N0,
  formatHex8: sb,
  formatHsl: ib,
  formatRgb: M0,
  toString: M0
});
function N0() {
  return this.rgb().formatHex();
}
function sb() {
  return this.rgb().formatHex8();
}
function ib() {
  return qp(this).formatHsl();
}
function M0() {
  return this.rgb().formatRgb();
}
function Ps(a) {
  var s, r;
  return a = (a + "").trim().toLowerCase(), (s = I_.exec(a)) ? (r = s[1].length, s = parseInt(s[1], 16), r === 6 ? T0(s) : r === 3 ? new Gt(s >> 8 & 15 | s >> 4 & 240, s >> 4 & 15 | s & 240, (s & 15) << 4 | s & 15, 1) : r === 8 ? jr(s >> 24 & 255, s >> 16 & 255, s >> 8 & 255, (s & 255) / 255) : r === 4 ? jr(s >> 12 & 15 | s >> 8 & 240, s >> 8 & 15 | s >> 4 & 240, s >> 4 & 15 | s & 240, ((s & 15) << 4 | s & 15) / 255) : null) : (s = P_.exec(a)) ? new Gt(s[1], s[2], s[3], 1) : (s = eb.exec(a)) ? new Gt(s[1] * 255 / 100, s[2] * 255 / 100, s[3] * 255 / 100, 1) : (s = tb.exec(a)) ? jr(s[1], s[2], s[3], s[4]) : (s = nb.exec(a)) ? jr(s[1] * 255 / 100, s[2] * 255 / 100, s[3] * 255 / 100, s[4]) : (s = lb.exec(a)) ? C0(s[1], s[2] / 100, s[3] / 100, 1) : (s = ab.exec(a)) ? C0(s[1], s[2] / 100, s[3] / 100, s[4]) : j0.hasOwnProperty(a) ? T0(j0[a]) : a === "transparent" ? new Gt(NaN, NaN, NaN, 0) : null;
}
function T0(a) {
  return new Gt(a >> 16 & 255, a >> 8 & 255, a & 255, 1);
}
function jr(a, s, r, u) {
  return u <= 0 && (a = s = r = NaN), new Gt(a, s, r, u);
}
function rb(a) {
  return a instanceof ii || (a = Ps(a)), a ? (a = a.rgb(), new Gt(a.r, a.g, a.b, a.opacity)) : new Gt();
}
function Ro(a, s, r, u) {
  return arguments.length === 1 ? rb(a) : new Gt(a, s, r, u ?? 1);
}
function Gt(a, s, r, u) {
  this.r = +a, this.g = +s, this.b = +r, this.opacity = +u;
}
Po(Gt, Ro, Bp(ii, {
  brighter(a) {
    return a = a == null ? Dr : Math.pow(Dr, a), new Gt(this.r * a, this.g * a, this.b * a, this.opacity);
  },
  darker(a) {
    return a = a == null ? Fs : Math.pow(Fs, a), new Gt(this.r * a, this.g * a, this.b * a, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Gt(Jl(this.r), Jl(this.g), Jl(this.b), Rr(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: E0,
  // Deprecated! Use color.formatHex.
  formatHex: E0,
  formatHex8: cb,
  formatRgb: A0,
  toString: A0
}));
function E0() {
  return `#${Kl(this.r)}${Kl(this.g)}${Kl(this.b)}`;
}
function cb() {
  return `#${Kl(this.r)}${Kl(this.g)}${Kl(this.b)}${Kl((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function A0() {
  const a = Rr(this.opacity);
  return `${a === 1 ? "rgb(" : "rgba("}${Jl(this.r)}, ${Jl(this.g)}, ${Jl(this.b)}${a === 1 ? ")" : `, ${a})`}`;
}
function Rr(a) {
  return isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
}
function Jl(a) {
  return Math.max(0, Math.min(255, Math.round(a) || 0));
}
function Kl(a) {
  return a = Jl(a), (a < 16 ? "0" : "") + a.toString(16);
}
function C0(a, s, r, u) {
  return u <= 0 ? a = s = r = NaN : r <= 0 || r >= 1 ? a = s = NaN : s <= 0 && (a = NaN), new xn(a, s, r, u);
}
function qp(a) {
  if (a instanceof xn) return new xn(a.h, a.s, a.l, a.opacity);
  if (a instanceof ii || (a = Ps(a)), !a) return new xn();
  if (a instanceof xn) return a;
  a = a.rgb();
  var s = a.r / 255, r = a.g / 255, u = a.b / 255, f = Math.min(s, r, u), d = Math.max(s, r, u), m = NaN, p = d - f, y = (d + f) / 2;
  return p ? (s === d ? m = (r - u) / p + (r < u) * 6 : r === d ? m = (u - s) / p + 2 : m = (s - r) / p + 4, p /= y < 0.5 ? d + f : 2 - d - f, m *= 60) : p = y > 0 && y < 1 ? 0 : m, new xn(m, p, y, a.opacity);
}
function ub(a, s, r, u) {
  return arguments.length === 1 ? qp(a) : new xn(a, s, r, u ?? 1);
}
function xn(a, s, r, u) {
  this.h = +a, this.s = +s, this.l = +r, this.opacity = +u;
}
Po(xn, ub, Bp(ii, {
  brighter(a) {
    return a = a == null ? Dr : Math.pow(Dr, a), new xn(this.h, this.s, this.l * a, this.opacity);
  },
  darker(a) {
    return a = a == null ? Fs : Math.pow(Fs, a), new xn(this.h, this.s, this.l * a, this.opacity);
  },
  rgb() {
    var a = this.h % 360 + (this.h < 0) * 360, s = isNaN(a) || isNaN(this.s) ? 0 : this.s, r = this.l, u = r + (r < 0.5 ? r : 1 - r) * s, f = 2 * r - u;
    return new Gt(
      jo(a >= 240 ? a - 240 : a + 120, f, u),
      jo(a, f, u),
      jo(a < 120 ? a + 240 : a - 120, f, u),
      this.opacity
    );
  },
  clamp() {
    return new xn(z0(this.h), Nr(this.s), Nr(this.l), Rr(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const a = Rr(this.opacity);
    return `${a === 1 ? "hsl(" : "hsla("}${z0(this.h)}, ${Nr(this.s) * 100}%, ${Nr(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
  }
}));
function z0(a) {
  return a = (a || 0) % 360, a < 0 ? a + 360 : a;
}
function Nr(a) {
  return Math.max(0, Math.min(1, a || 0));
}
function jo(a, s, r) {
  return (a < 60 ? s + (r - s) * a / 60 : a < 180 ? r : a < 240 ? s + (r - s) * (240 - a) / 60 : s) * 255;
}
const Yp = (a) => () => a;
function ob(a, s) {
  return function(r) {
    return a + r * s;
  };
}
function fb(a, s, r) {
  return a = Math.pow(a, r), s = Math.pow(s, r) - a, r = 1 / r, function(u) {
    return Math.pow(a + u * s, r);
  };
}
function db(a) {
  return (a = +a) == 1 ? Gp : function(s, r) {
    return r - s ? fb(s, r, a) : Yp(isNaN(s) ? r : s);
  };
}
function Gp(a, s) {
  var r = s - a;
  return r ? ob(a, r) : Yp(isNaN(a) ? s : a);
}
const O0 = (function a(s) {
  var r = db(s);
  function u(f, d) {
    var m = r((f = Ro(f)).r, (d = Ro(d)).r), p = r(f.g, d.g), y = r(f.b, d.b), g = Gp(f.opacity, d.opacity);
    return function(x) {
      return f.r = m(x), f.g = p(x), f.b = y(x), f.opacity = g(x), f + "";
    };
  }
  return u.gamma = a, u;
})(1);
function El(a, s) {
  return a = +a, s = +s, function(r) {
    return a * (1 - r) + s * r;
  };
}
var Ho = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, No = new RegExp(Ho.source, "g");
function hb(a) {
  return function() {
    return a;
  };
}
function mb(a) {
  return function(s) {
    return a(s) + "";
  };
}
function pb(a, s) {
  var r = Ho.lastIndex = No.lastIndex = 0, u, f, d, m = -1, p = [], y = [];
  for (a = a + "", s = s + ""; (u = Ho.exec(a)) && (f = No.exec(s)); )
    (d = f.index) > r && (d = s.slice(r, d), p[m] ? p[m] += d : p[++m] = d), (u = u[0]) === (f = f[0]) ? p[m] ? p[m] += f : p[++m] = f : (p[++m] = null, y.push({ i: m, x: El(u, f) })), r = No.lastIndex;
  return r < s.length && (d = s.slice(r), p[m] ? p[m] += d : p[++m] = d), p.length < 2 ? y[0] ? mb(y[0].x) : hb(s) : (s = y.length, function(g) {
    for (var x = 0, b; x < s; ++x) p[(b = y[x]).i] = b.x(g);
    return p.join("");
  });
}
var k0 = 180 / Math.PI, Uo = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function Vp(a, s, r, u, f, d) {
  var m, p, y;
  return (m = Math.sqrt(a * a + s * s)) && (a /= m, s /= m), (y = a * r + s * u) && (r -= a * y, u -= s * y), (p = Math.sqrt(r * r + u * u)) && (r /= p, u /= p, y /= p), a * u < s * r && (a = -a, s = -s, y = -y, m = -m), {
    translateX: f,
    translateY: d,
    rotate: Math.atan2(s, a) * k0,
    skewX: Math.atan(y) * k0,
    scaleX: m,
    scaleY: p
  };
}
var Mr;
function gb(a) {
  const s = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(a + "");
  return s.isIdentity ? Uo : Vp(s.a, s.b, s.c, s.d, s.e, s.f);
}
function yb(a) {
  return a == null || (Mr || (Mr = document.createElementNS("http://www.w3.org/2000/svg", "g")), Mr.setAttribute("transform", a), !(a = Mr.transform.baseVal.consolidate())) ? Uo : (a = a.matrix, Vp(a.a, a.b, a.c, a.d, a.e, a.f));
}
function Xp(a, s, r, u) {
  function f(g) {
    return g.length ? g.pop() + " " : "";
  }
  function d(g, x, b, S, N, z) {
    if (g !== b || x !== S) {
      var R = N.push("translate(", null, s, null, r);
      z.push({ i: R - 4, x: El(g, b) }, { i: R - 2, x: El(x, S) });
    } else (b || S) && N.push("translate(" + b + s + S + r);
  }
  function m(g, x, b, S) {
    g !== x ? (g - x > 180 ? x += 360 : x - g > 180 && (g += 360), S.push({ i: b.push(f(b) + "rotate(", null, u) - 2, x: El(g, x) })) : x && b.push(f(b) + "rotate(" + x + u);
  }
  function p(g, x, b, S) {
    g !== x ? S.push({ i: b.push(f(b) + "skewX(", null, u) - 2, x: El(g, x) }) : x && b.push(f(b) + "skewX(" + x + u);
  }
  function y(g, x, b, S, N, z) {
    if (g !== b || x !== S) {
      var R = N.push(f(N) + "scale(", null, ",", null, ")");
      z.push({ i: R - 4, x: El(g, b) }, { i: R - 2, x: El(x, S) });
    } else (b !== 1 || S !== 1) && N.push(f(N) + "scale(" + b + "," + S + ")");
  }
  return function(g, x) {
    var b = [], S = [];
    return g = a(g), x = a(x), d(g.translateX, g.translateY, x.translateX, x.translateY, b, S), m(g.rotate, x.rotate, b, S), p(g.skewX, x.skewX, b, S), y(g.scaleX, g.scaleY, x.scaleX, x.scaleY, b, S), g = x = null, function(N) {
      for (var z = -1, R = S.length, H; ++z < R; ) b[(H = S[z]).i] = H.x(N);
      return b.join("");
    };
  };
}
var vb = Xp(gb, "px, ", "px)", "deg)"), xb = Xp(yb, ", ", ")", ")"), qa = 0, Vs = 0, Ys = 0, Qp = 1e3, Hr, Xs, Ur = 0, $l = 0, Wr = 0, ei = typeof performance == "object" && performance.now ? performance : Date, Zp = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(a) {
  setTimeout(a, 17);
};
function ef() {
  return $l || (Zp(_b), $l = ei.now() + Wr);
}
function _b() {
  $l = 0;
}
function Lr() {
  this._call = this._time = this._next = null;
}
Lr.prototype = Kp.prototype = {
  constructor: Lr,
  restart: function(a, s, r) {
    if (typeof a != "function") throw new TypeError("callback is not a function");
    r = (r == null ? ef() : +r) + (s == null ? 0 : +s), !this._next && Xs !== this && (Xs ? Xs._next = this : Hr = this, Xs = this), this._call = a, this._time = r, Lo();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, Lo());
  }
};
function Kp(a, s, r) {
  var u = new Lr();
  return u.restart(a, s, r), u;
}
function bb() {
  ef(), ++qa;
  for (var a = Hr, s; a; )
    (s = $l - a._time) >= 0 && a._call.call(void 0, s), a = a._next;
  --qa;
}
function D0() {
  $l = (Ur = ei.now()) + Wr, qa = Vs = 0;
  try {
    bb();
  } finally {
    qa = 0, Sb(), $l = 0;
  }
}
function wb() {
  var a = ei.now(), s = a - Ur;
  s > Qp && (Wr -= s, Ur = a);
}
function Sb() {
  for (var a, s = Hr, r, u = 1 / 0; s; )
    s._call ? (u > s._time && (u = s._time), a = s, s = s._next) : (r = s._next, s._next = null, s = a ? a._next = r : Hr = r);
  Xs = a, Lo(u);
}
function Lo(a) {
  if (!qa) {
    Vs && (Vs = clearTimeout(Vs));
    var s = a - $l;
    s > 24 ? (a < 1 / 0 && (Vs = setTimeout(D0, a - ei.now() - Wr)), Ys && (Ys = clearInterval(Ys))) : (Ys || (Ur = ei.now(), Ys = setInterval(wb, Qp)), qa = 1, Zp(D0));
  }
}
function R0(a, s, r) {
  var u = new Lr();
  return s = s == null ? 0 : +s, u.restart((f) => {
    u.stop(), a(f + s);
  }, s, r), u;
}
var jb = Tp("start", "end", "cancel", "interrupt"), Nb = [], Jp = 0, H0 = 1, Bo = 2, Ar = 3, U0 = 4, qo = 5, Cr = 6;
function Fr(a, s, r, u, f, d) {
  var m = a.__transition;
  if (!m) a.__transition = {};
  else if (r in m) return;
  Mb(a, r, {
    name: s,
    index: u,
    // For context during callback.
    group: f,
    // For context during callback.
    on: jb,
    tween: Nb,
    time: d.time,
    delay: d.delay,
    duration: d.duration,
    ease: d.ease,
    timer: null,
    state: Jp
  });
}
function tf(a, s) {
  var r = wn(a, s);
  if (r.state > Jp) throw new Error("too late; already scheduled");
  return r;
}
function zn(a, s) {
  var r = wn(a, s);
  if (r.state > Ar) throw new Error("too late; already running");
  return r;
}
function wn(a, s) {
  var r = a.__transition;
  if (!r || !(r = r[s])) throw new Error("transition not found");
  return r;
}
function Mb(a, s, r) {
  var u = a.__transition, f;
  u[s] = r, r.timer = Kp(d, 0, r.time);
  function d(g) {
    r.state = H0, r.timer.restart(m, r.delay, r.time), r.delay <= g && m(g - r.delay);
  }
  function m(g) {
    var x, b, S, N;
    if (r.state !== H0) return y();
    for (x in u)
      if (N = u[x], N.name === r.name) {
        if (N.state === Ar) return R0(m);
        N.state === U0 ? (N.state = Cr, N.timer.stop(), N.on.call("interrupt", a, a.__data__, N.index, N.group), delete u[x]) : +x < s && (N.state = Cr, N.timer.stop(), N.on.call("cancel", a, a.__data__, N.index, N.group), delete u[x]);
      }
    if (R0(function() {
      r.state === Ar && (r.state = U0, r.timer.restart(p, r.delay, r.time), p(g));
    }), r.state = Bo, r.on.call("start", a, a.__data__, r.index, r.group), r.state === Bo) {
      for (r.state = Ar, f = new Array(S = r.tween.length), x = 0, b = -1; x < S; ++x)
        (N = r.tween[x].value.call(a, a.__data__, r.index, r.group)) && (f[++b] = N);
      f.length = b + 1;
    }
  }
  function p(g) {
    for (var x = g < r.duration ? r.ease.call(null, g / r.duration) : (r.timer.restart(y), r.state = qo, 1), b = -1, S = f.length; ++b < S; )
      f[b].call(a, x);
    r.state === qo && (r.on.call("end", a, a.__data__, r.index, r.group), y());
  }
  function y() {
    r.state = Cr, r.timer.stop(), delete u[s];
    for (var g in u) return;
    delete a.__transition;
  }
}
function Tb(a, s) {
  var r = a.__transition, u, f, d = !0, m;
  if (r) {
    s = s == null ? null : s + "";
    for (m in r) {
      if ((u = r[m]).name !== s) {
        d = !1;
        continue;
      }
      f = u.state > Bo && u.state < qo, u.state = Cr, u.timer.stop(), u.on.call(f ? "interrupt" : "cancel", a, a.__data__, u.index, u.group), delete r[m];
    }
    d && delete a.__transition;
  }
}
function Eb(a) {
  return this.each(function() {
    Tb(this, a);
  });
}
function Ab(a, s) {
  var r, u;
  return function() {
    var f = zn(this, a), d = f.tween;
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
function Cb(a, s, r) {
  var u, f;
  if (typeof r != "function") throw new Error();
  return function() {
    var d = zn(this, a), m = d.tween;
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
function zb(a, s) {
  var r = this._id;
  if (a += "", arguments.length < 2) {
    for (var u = wn(this.node(), r).tween, f = 0, d = u.length, m; f < d; ++f)
      if ((m = u[f]).name === a)
        return m.value;
    return null;
  }
  return this.each((s == null ? Ab : Cb)(r, a, s));
}
function nf(a, s, r) {
  var u = a._id;
  return a.each(function() {
    var f = zn(this, u);
    (f.value || (f.value = {}))[s] = r.apply(this, arguments);
  }), function(f) {
    return wn(f, u).value[s];
  };
}
function $p(a, s) {
  var r;
  return (typeof s == "number" ? El : s instanceof Ps ? O0 : (r = Ps(s)) ? (s = r, O0) : pb)(a, s);
}
function Ob(a) {
  return function() {
    this.removeAttribute(a);
  };
}
function kb(a) {
  return function() {
    this.removeAttributeNS(a.space, a.local);
  };
}
function Db(a, s, r) {
  var u, f = r + "", d;
  return function() {
    var m = this.getAttribute(a);
    return m === f ? null : m === u ? d : d = s(u = m, r);
  };
}
function Rb(a, s, r) {
  var u, f = r + "", d;
  return function() {
    var m = this.getAttributeNS(a.space, a.local);
    return m === f ? null : m === u ? d : d = s(u = m, r);
  };
}
function Hb(a, s, r) {
  var u, f, d;
  return function() {
    var m, p = r(this), y;
    return p == null ? void this.removeAttribute(a) : (m = this.getAttribute(a), y = p + "", m === y ? null : m === u && y === f ? d : (f = y, d = s(u = m, p)));
  };
}
function Ub(a, s, r) {
  var u, f, d;
  return function() {
    var m, p = r(this), y;
    return p == null ? void this.removeAttributeNS(a.space, a.local) : (m = this.getAttributeNS(a.space, a.local), y = p + "", m === y ? null : m === u && y === f ? d : (f = y, d = s(u = m, p)));
  };
}
function Lb(a, s) {
  var r = $r(a), u = r === "transform" ? xb : $p;
  return this.attrTween(a, typeof s == "function" ? (r.local ? Ub : Hb)(r, u, nf(this, "attr." + a, s)) : s == null ? (r.local ? kb : Ob)(r) : (r.local ? Rb : Db)(r, u, s));
}
function Bb(a, s) {
  return function(r) {
    this.setAttribute(a, s.call(this, r));
  };
}
function qb(a, s) {
  return function(r) {
    this.setAttributeNS(a.space, a.local, s.call(this, r));
  };
}
function Yb(a, s) {
  var r, u;
  function f() {
    var d = s.apply(this, arguments);
    return d !== u && (r = (u = d) && qb(a, d)), r;
  }
  return f._value = s, f;
}
function Gb(a, s) {
  var r, u;
  function f() {
    var d = s.apply(this, arguments);
    return d !== u && (r = (u = d) && Bb(a, d)), r;
  }
  return f._value = s, f;
}
function Vb(a, s) {
  var r = "attr." + a;
  if (arguments.length < 2) return (r = this.tween(r)) && r._value;
  if (s == null) return this.tween(r, null);
  if (typeof s != "function") throw new Error();
  var u = $r(a);
  return this.tween(r, (u.local ? Yb : Gb)(u, s));
}
function Xb(a, s) {
  return function() {
    tf(this, a).delay = +s.apply(this, arguments);
  };
}
function Qb(a, s) {
  return s = +s, function() {
    tf(this, a).delay = s;
  };
}
function Zb(a) {
  var s = this._id;
  return arguments.length ? this.each((typeof a == "function" ? Xb : Qb)(s, a)) : wn(this.node(), s).delay;
}
function Kb(a, s) {
  return function() {
    zn(this, a).duration = +s.apply(this, arguments);
  };
}
function Jb(a, s) {
  return s = +s, function() {
    zn(this, a).duration = s;
  };
}
function $b(a) {
  var s = this._id;
  return arguments.length ? this.each((typeof a == "function" ? Kb : Jb)(s, a)) : wn(this.node(), s).duration;
}
function Wb(a, s) {
  if (typeof s != "function") throw new Error();
  return function() {
    zn(this, a).ease = s;
  };
}
function Fb(a) {
  var s = this._id;
  return arguments.length ? this.each(Wb(s, a)) : wn(this.node(), s).ease;
}
function Ib(a, s) {
  return function() {
    var r = s.apply(this, arguments);
    if (typeof r != "function") throw new Error();
    zn(this, a).ease = r;
  };
}
function Pb(a) {
  if (typeof a != "function") throw new Error();
  return this.each(Ib(this._id, a));
}
function e2(a) {
  typeof a != "function" && (a = Cp(a));
  for (var s = this._groups, r = s.length, u = new Array(r), f = 0; f < r; ++f)
    for (var d = s[f], m = d.length, p = u[f] = [], y, g = 0; g < m; ++g)
      (y = d[g]) && a.call(y, y.__data__, g, d) && p.push(y);
  return new Pn(u, this._parents, this._name, this._id);
}
function t2(a) {
  if (a._id !== this._id) throw new Error();
  for (var s = this._groups, r = a._groups, u = s.length, f = r.length, d = Math.min(u, f), m = new Array(u), p = 0; p < d; ++p)
    for (var y = s[p], g = r[p], x = y.length, b = m[p] = new Array(x), S, N = 0; N < x; ++N)
      (S = y[N] || g[N]) && (b[N] = S);
  for (; p < u; ++p)
    m[p] = s[p];
  return new Pn(m, this._parents, this._name, this._id);
}
function n2(a) {
  return (a + "").trim().split(/^|\s+/).every(function(s) {
    var r = s.indexOf(".");
    return r >= 0 && (s = s.slice(0, r)), !s || s === "start";
  });
}
function l2(a, s, r) {
  var u, f, d = n2(s) ? tf : zn;
  return function() {
    var m = d(this, a), p = m.on;
    p !== u && (f = (u = p).copy()).on(s, r), m.on = f;
  };
}
function a2(a, s) {
  var r = this._id;
  return arguments.length < 2 ? wn(this.node(), r).on.on(a) : this.each(l2(r, a, s));
}
function s2(a) {
  return function() {
    var s = this.parentNode;
    for (var r in this.__transition) if (+r !== a) return;
    s && s.removeChild(this);
  };
}
function i2() {
  return this.on("end.remove", s2(this._id));
}
function r2(a) {
  var s = this._name, r = this._id;
  typeof a != "function" && (a = Fo(a));
  for (var u = this._groups, f = u.length, d = new Array(f), m = 0; m < f; ++m)
    for (var p = u[m], y = p.length, g = d[m] = new Array(y), x, b, S = 0; S < y; ++S)
      (x = p[S]) && (b = a.call(x, x.__data__, S, p)) && ("__data__" in x && (b.__data__ = x.__data__), g[S] = b, Fr(g[S], s, r, S, g, wn(x, r)));
  return new Pn(d, this._parents, s, r);
}
function c2(a) {
  var s = this._name, r = this._id;
  typeof a != "function" && (a = Ap(a));
  for (var u = this._groups, f = u.length, d = [], m = [], p = 0; p < f; ++p)
    for (var y = u[p], g = y.length, x, b = 0; b < g; ++b)
      if (x = y[b]) {
        for (var S = a.call(x, x.__data__, b, y), N, z = wn(x, r), R = 0, H = S.length; R < H; ++R)
          (N = S[R]) && Fr(N, s, r, R, S, z);
        d.push(S), m.push(x);
      }
  return new Pn(d, m, s, r);
}
var u2 = si.prototype.constructor;
function o2() {
  return new u2(this._groups, this._parents);
}
function f2(a, s) {
  var r, u, f;
  return function() {
    var d = Ba(this, a), m = (this.style.removeProperty(a), Ba(this, a));
    return d === m ? null : d === r && m === u ? f : f = s(r = d, u = m);
  };
}
function Wp(a) {
  return function() {
    this.style.removeProperty(a);
  };
}
function d2(a, s, r) {
  var u, f = r + "", d;
  return function() {
    var m = Ba(this, a);
    return m === f ? null : m === u ? d : d = s(u = m, r);
  };
}
function h2(a, s, r) {
  var u, f, d;
  return function() {
    var m = Ba(this, a), p = r(this), y = p + "";
    return p == null && (y = p = (this.style.removeProperty(a), Ba(this, a))), m === y ? null : m === u && y === f ? d : (f = y, d = s(u = m, p));
  };
}
function m2(a, s) {
  var r, u, f, d = "style." + s, m = "end." + d, p;
  return function() {
    var y = zn(this, a), g = y.on, x = y.value[d] == null ? p || (p = Wp(s)) : void 0;
    (g !== r || f !== x) && (u = (r = g).copy()).on(m, f = x), y.on = u;
  };
}
function p2(a, s, r) {
  var u = (a += "") == "transform" ? vb : $p;
  return s == null ? this.styleTween(a, f2(a, u)).on("end.style." + a, Wp(a)) : typeof s == "function" ? this.styleTween(a, h2(a, u, nf(this, "style." + a, s))).each(m2(this._id, a)) : this.styleTween(a, d2(a, u, s), r).on("end.style." + a, null);
}
function g2(a, s, r) {
  return function(u) {
    this.style.setProperty(a, s.call(this, u), r);
  };
}
function y2(a, s, r) {
  var u, f;
  function d() {
    var m = s.apply(this, arguments);
    return m !== f && (u = (f = m) && g2(a, m, r)), u;
  }
  return d._value = s, d;
}
function v2(a, s, r) {
  var u = "style." + (a += "");
  if (arguments.length < 2) return (u = this.tween(u)) && u._value;
  if (s == null) return this.tween(u, null);
  if (typeof s != "function") throw new Error();
  return this.tween(u, y2(a, s, r ?? ""));
}
function x2(a) {
  return function() {
    this.textContent = a;
  };
}
function _2(a) {
  return function() {
    var s = a(this);
    this.textContent = s ?? "";
  };
}
function b2(a) {
  return this.tween("text", typeof a == "function" ? _2(nf(this, "text", a)) : x2(a == null ? "" : a + ""));
}
function w2(a) {
  return function(s) {
    this.textContent = a.call(this, s);
  };
}
function S2(a) {
  var s, r;
  function u() {
    var f = a.apply(this, arguments);
    return f !== r && (s = (r = f) && w2(f)), s;
  }
  return u._value = a, u;
}
function j2(a) {
  var s = "text";
  if (arguments.length < 1) return (s = this.tween(s)) && s._value;
  if (a == null) return this.tween(s, null);
  if (typeof a != "function") throw new Error();
  return this.tween(s, S2(a));
}
function N2() {
  for (var a = this._name, s = this._id, r = Fp(), u = this._groups, f = u.length, d = 0; d < f; ++d)
    for (var m = u[d], p = m.length, y, g = 0; g < p; ++g)
      if (y = m[g]) {
        var x = wn(y, s);
        Fr(y, a, r, g, m, {
          time: x.time + x.delay + x.duration,
          delay: 0,
          duration: x.duration,
          ease: x.ease
        });
      }
  return new Pn(u, this._parents, a, r);
}
function M2() {
  var a, s, r = this, u = r._id, f = r.size();
  return new Promise(function(d, m) {
    var p = { value: m }, y = { value: function() {
      --f === 0 && d();
    } };
    r.each(function() {
      var g = zn(this, u), x = g.on;
      x !== a && (s = (a = x).copy(), s._.cancel.push(p), s._.interrupt.push(p), s._.end.push(y)), g.on = s;
    }), f === 0 && d();
  });
}
var T2 = 0;
function Pn(a, s, r, u) {
  this._groups = a, this._parents = s, this._name = r, this._id = u;
}
function Fp() {
  return ++T2;
}
var In = si.prototype;
Pn.prototype = {
  constructor: Pn,
  select: r2,
  selectAll: c2,
  selectChild: In.selectChild,
  selectChildren: In.selectChildren,
  filter: e2,
  merge: t2,
  selection: o2,
  transition: N2,
  call: In.call,
  nodes: In.nodes,
  node: In.node,
  size: In.size,
  empty: In.empty,
  each: In.each,
  on: a2,
  attr: Lb,
  attrTween: Vb,
  style: p2,
  styleTween: v2,
  text: b2,
  textTween: j2,
  remove: i2,
  tween: zb,
  delay: Zb,
  duration: $b,
  ease: Fb,
  easeVarying: Pb,
  end: M2,
  [Symbol.iterator]: In[Symbol.iterator]
};
function E2(a) {
  return ((a *= 2) <= 1 ? a * a * a : (a -= 2) * a * a + 2) / 2;
}
var A2 = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: E2
};
function C2(a, s) {
  for (var r; !(r = a.__transition) || !(r = r[s]); )
    if (!(a = a.parentNode))
      throw new Error(`transition ${s} not found`);
  return r;
}
function z2(a) {
  var s, r;
  a instanceof Pn ? (s = a._id, a = a._name) : (s = Fp(), (r = A2).time = ef(), a = a == null ? null : a + "");
  for (var u = this._groups, f = u.length, d = 0; d < f; ++d)
    for (var m = u[d], p = m.length, y, g = 0; g < p; ++g)
      (y = m[g]) && Fr(y, a, s, g, m, r || C2(y, s));
  return new Pn(u, this._parents, a, s);
}
si.prototype.interrupt = Eb;
si.prototype.transition = z2;
function Qs(a, s, r) {
  this.k = a, this.x = s, this.y = r;
}
Qs.prototype = {
  constructor: Qs,
  scale: function(a) {
    return a === 1 ? this : new Qs(this.k * a, this.x, this.y);
  },
  translate: function(a, s) {
    return a === 0 & s === 0 ? this : new Qs(this.k, this.x + this.k * a, this.y + this.k * s);
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
Qs.prototype;
var L0;
(function(a) {
  a.Strict = "strict", a.Loose = "loose";
})(L0 || (L0 = {}));
var B0;
(function(a) {
  a.Free = "free", a.Vertical = "vertical", a.Horizontal = "horizontal";
})(B0 || (B0 = {}));
var q0;
(function(a) {
  a.Partial = "partial", a.Full = "full";
})(q0 || (q0 = {}));
var Y0;
(function(a) {
  a.Bezier = "default", a.Straight = "straight", a.Step = "step", a.SmoothStep = "smoothstep", a.SimpleBezier = "simplebezier";
})(Y0 || (Y0 = {}));
var G0;
(function(a) {
  a.Arrow = "arrow", a.ArrowClosed = "arrowclosed";
})(G0 || (G0 = {}));
var Ke;
(function(a) {
  a.Left = "left", a.Top = "top", a.Right = "right", a.Bottom = "bottom";
})(Ke || (Ke = {}));
Ke.Left + "", Ke.Right, Ke.Right + "", Ke.Left, Ke.Top + "", Ke.Bottom, Ke.Bottom + "", Ke.Top;
function O2({ sourceX: a, sourceY: s, targetX: r, targetY: u }) {
  const f = Math.abs(r - a) / 2, d = r < a ? r + f : r - f, m = Math.abs(u - s) / 2, p = u < s ? u + m : u - m;
  return [d, p, f, m];
}
const V0 = {
  [Ke.Left]: { x: -1, y: 0 },
  [Ke.Right]: { x: 1, y: 0 },
  [Ke.Top]: { x: 0, y: -1 },
  [Ke.Bottom]: { x: 0, y: 1 }
}, k2 = ({ source: a, sourcePosition: s = Ke.Bottom, target: r }) => s === Ke.Left || s === Ke.Right ? a.x < r.x ? { x: 1, y: 0 } : { x: -1, y: 0 } : a.y < r.y ? { x: 0, y: 1 } : { x: 0, y: -1 }, X0 = (a, s) => Math.sqrt(Math.pow(s.x - a.x, 2) + Math.pow(s.y - a.y, 2));
function D2({ source: a, sourcePosition: s = Ke.Bottom, target: r, targetPosition: u = Ke.Top, center: f, offset: d, stepPosition: m }) {
  const p = V0[s], y = V0[u], g = { x: a.x + p.x * d, y: a.y + p.y * d }, x = { x: r.x + y.x * d, y: r.y + y.y * d }, b = k2({
    source: g,
    sourcePosition: s,
    target: x
  }), S = b.x !== 0 ? "x" : "y", N = b[S];
  let z = [], R, H;
  const G = { x: 0, y: 0 }, $ = { x: 0, y: 0 }, [, , P, X] = O2({
    sourceX: a.x,
    sourceY: a.y,
    targetX: r.x,
    targetY: r.y
  });
  if (p[S] * y[S] === -1) {
    S === "x" ? (R = f.x ?? g.x + (x.x - g.x) * m, H = f.y ?? (g.y + x.y) / 2) : (R = f.x ?? (g.x + x.x) / 2, H = f.y ?? g.y + (x.y - g.y) * m);
    const ee = [
      { x: R, y: g.y },
      { x: R, y: x.y }
    ], ge = [
      { x: g.x, y: H },
      { x: x.x, y: H }
    ];
    p[S] === N ? z = S === "x" ? ee : ge : z = S === "x" ? ge : ee;
  } else {
    const ee = [{ x: g.x, y: x.y }], ge = [{ x: x.x, y: g.y }];
    if (S === "x" ? z = p.x === N ? ge : ee : z = p.y === N ? ee : ge, s === u) {
      const K = Math.abs(a[S] - r[S]);
      if (K <= d) {
        const ve = Math.min(d - 1, d - K);
        p[S] === N ? G[S] = (g[S] > a[S] ? -1 : 1) * ve : $[S] = (x[S] > r[S] ? -1 : 1) * ve;
      }
    }
    if (s !== u) {
      const K = S === "x" ? "y" : "x", ve = p[S] === y[K], A = g[K] > x[K], q = g[K] < x[K];
      (p[S] === 1 && (!ve && A || ve && q) || p[S] !== 1 && (!ve && q || ve && A)) && (z = S === "x" ? ee : ge);
    }
    const _e = { x: g.x + G.x, y: g.y + G.y }, ce = { x: x.x + $.x, y: x.y + $.y }, oe = Math.max(Math.abs(_e.x - z[0].x), Math.abs(ce.x - z[0].x)), Me = Math.max(Math.abs(_e.y - z[0].y), Math.abs(ce.y - z[0].y));
    oe >= Me ? (R = (_e.x + ce.x) / 2, H = z[0].y) : (R = z[0].x, H = (_e.y + ce.y) / 2);
  }
  const J = { x: g.x + G.x, y: g.y + G.y }, ne = { x: x.x + $.x, y: x.y + $.y };
  return [[
    a,
    // we only want to add the gapped source/target if they are different from the first/last point to avoid duplicates which can cause issues with the bends
    ...J.x !== z[0].x || J.y !== z[0].y ? [J] : [],
    ...z,
    ...ne.x !== z[z.length - 1].x || ne.y !== z[z.length - 1].y ? [ne] : [],
    r
  ], R, H, P, X];
}
function R2(a, s, r, u) {
  const f = Math.min(X0(a, s) / 2, X0(s, r) / 2, u), { x: d, y: m } = s;
  if (a.x === d && d === r.x || a.y === m && m === r.y)
    return `L${d} ${m}`;
  if (a.y === m) {
    const g = a.x < r.x ? -1 : 1, x = a.y < r.y ? 1 : -1;
    return `L ${d + f * g},${m}Q ${d},${m} ${d},${m + f * x}`;
  }
  const p = a.x < r.x ? 1 : -1, y = a.y < r.y ? -1 : 1;
  return `L ${d},${m + f * y}Q ${d},${m} ${d + f * p},${m}`;
}
function H2({ sourceX: a, sourceY: s, sourcePosition: r = Ke.Bottom, targetX: u, targetY: f, targetPosition: d = Ke.Top, borderRadius: m = 5, centerX: p, centerY: y, offset: g = 20, stepPosition: x = 0.5 }) {
  const [b, S, N, z, R] = D2({
    source: { x: a, y: s },
    sourcePosition: r,
    target: { x: u, y: f },
    targetPosition: d,
    center: { x: p, y },
    offset: g,
    stepPosition: x
  });
  let H = `M${b[0].x} ${b[0].y}`;
  for (let G = 1; G < b.length - 1; G++)
    H += R2(b[G - 1], b[G], b[G + 1], m);
  return H += `L${b[b.length - 1].x} ${b[b.length - 1].y}`, [H, S, N, z, R];
}
var Q0;
(function(a) {
  a.Line = "line", a.Handle = "handle";
})(Q0 || (Q0 = {}));
const Br = [
  { id: "solar", label: "Solar", Icon: ni, powerEntity: "sensor.total_mppt_pv_power", currentEntity: "sensor.total_mppt_output_current", color: "#ca8a04" },
  { id: "shore", label: "Shore Power", Icon: Yv, powerEntity: "sensor.shore_power_charger_power_24v", currentEntity: "sensor.a32_pro_s5140_channel_16_current_24v_shore_power_charger", color: "#16a34a" },
  { id: "alt", label: "Alt. Charger", Icon: op, powerEntity: "sensor.alternator_charger_power_24v", currentEntity: "sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger", color: "#2563eb" }
], qr = [
  { id: "12v", label: "12V Devices", Icon: Qr, powerEntity: "sensor.all_12v_devices_power_24v", currentEntity: "sensor.a32_pro_s5140_channel_6_current_24v_12v_devices", color: "#4f46e5" },
  { id: "ac", label: "A/C", Icon: Xv, powerEntity: "sensor.air_conditioning_power_24v", currentEntity: "sensor.a32_pro_s5140_channel_4_current_24v_air_conditioning", color: "#0891b2" },
  { id: "24v", label: "24V Devices", Icon: Ov, powerEntity: "sensor.all_24v_devices_power_24v", currentEntity: "sensor.a32_pro_s5140_channel_5_current_24v_24v_devices", color: "#2563eb" },
  { id: "inverter", label: "Inverter", Icon: ai, powerEntity: "sensor.inverter_power_24v", currentEntity: "sensor.a32_pro_s5140_channel_7_current_24v_inverter", color: "#ea580c" }
], Yr = 120, Wl = 56, tn = 90, Tr = 100, Zs = 72, ri = 260, Xa = 175, Ip = ri, Pp = 340, eg = 10, tg = 450, Mo = 580, To = 420, Gr = 3;
function ng(a, s, r, u) {
  const f = (a - 1) * r, d = s - f / 2;
  return Array.from({ length: a }, (m, p) => d + p * r - u / 2);
}
const lg = ng(Br.length, Xa, 75, Wl), ag = ng(qr.length, Xa, 68, Wl);
function lf(a, s, r, u, f, d) {
  const [m] = H2({
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
const ci = [];
Br.forEach((a, s) => {
  const r = eg + Yr, u = lg[s] + Wl / 2, f = ri - tn / 2, d = Xa - tn / 2, m = f, p = d + tn * (0.25 + s * 0.25);
  ci.push({
    id: `${a.id}-hub`,
    path: lf(r, u, Ke.Right, m, p, Ke.Left),
    defaultColor: a.color
  });
});
qr.forEach((a, s) => {
  const r = ri + tn / 2, u = Xa - tn / 2, f = r, d = u + tn * (0.13 + s * 0.25), m = tg, p = ag[s] + Wl / 2;
  ci.push({
    id: `hub-${a.id}`,
    path: lf(f, d, Ke.Right, m, p, Ke.Left),
    defaultColor: a.color
  });
});
ci.push({
  id: "batt-edge",
  path: lf(ri, Xa + tn / 2, Ke.Bottom, Ip, Pp - Zs / 2, Ke.Top),
  defaultColor: "#334155"
});
const Z0 = /* @__PURE__ */ new Map(), zr = /* @__PURE__ */ new Map();
function U2(a, s) {
  let r = Z0.get(a);
  return r || (r = { phases: Array.from({ length: Gr }, (u, f) => f / Math.max(s, Gr)), lastTime: 0 }, Z0.set(a, r)), r;
}
function L2(a) {
  return zr.get(a) ?? { color: "#888", active: !1, speed: 3, dotCount: 0, reverse: !1, strokeWidth: 1 };
}
function Eo(a, s) {
  return 4 - Math.min(a / (s === "amps" ? 20 : 500), 1) * 3;
}
function Ao(a, s) {
  const r = Math.min(a / (s === "amps" ? 15 : 400), 1);
  return r > 0.5 ? 3 : r > 0.15 ? 2 : 1;
}
let Yo = 0, Go = !1;
const sg = /* @__PURE__ */ new Map(), ig = /* @__PURE__ */ new Map();
function B2() {
  if (Go) return;
  Go = !0;
  function a(s) {
    for (const r of ci) {
      const { id: u } = r, f = L2(u), d = U2(u, f.dotCount), m = d.lastTime === 0 ? 0 : Math.min((s - d.lastTime) / 1e3, 0.1);
      d.lastTime = s;
      const p = sg.get(u);
      p && (p.setAttribute("stroke", f.color), p.setAttribute("stroke-width", String(f.strokeWidth)), p.setAttribute("opacity", f.active ? "0.25" : "0.06"));
      const y = ig.get(u);
      if (!y || !p) continue;
      const g = p.getTotalLength(), x = f.speed > 0 ? m / f.speed : 0;
      f.active && f.dotCount > 0 && (d.phases[0] = f.reverse ? ((d.phases[0] - x) % 1 + 1) % 1 : (d.phases[0] + x) % 1);
      const b = 1 / Math.max(f.dotCount, 1);
      for (let S = 0; S < Gr; S++) {
        const N = y[S];
        if (!N) continue;
        if (!f.active || S >= f.dotCount) {
          N.setAttribute("opacity", "0");
          continue;
        }
        const z = ((d.phases[0] + S * b) % 1 + 1) % 1, R = p.getPointAtLength(z * g);
        N.setAttribute("cx", String(R.x)), N.setAttribute("cy", String(R.y)), N.setAttribute("fill", f.color), N.setAttribute("opacity", "0.8");
      }
    }
    Yo = requestAnimationFrame(a);
  }
  Yo = requestAnimationFrame(a);
}
function q2() {
  Go = !1, cancelAnimationFrame(Yo);
}
function K0({ def: a, val: s, unit: r, active: u, onClick: f }) {
  const d = a.Icon;
  return /* @__PURE__ */ o.jsx(
    "div",
    {
      style: { width: Yr, height: Wl, cursor: "pointer" },
      onClick: f,
      children: /* @__PURE__ */ o.jsxs("div", { style: {
        height: "100%",
        borderRadius: 12,
        border: `2px solid ${u ? `${a.color}70` : "hsl(var(--border))"}`,
        padding: "6px 12px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        opacity: u ? 1 : 0.5,
        boxShadow: u ? `0 0 10px ${a.color}20` : "none",
        transition: "all 0.3s"
      }, children: [
        /* @__PURE__ */ o.jsx(d, { size: 18, style: { flexShrink: 0, color: u ? a.color : "hsl(var(--muted-foreground))" } }),
        /* @__PURE__ */ o.jsxs("div", { style: { display: "flex", flexDirection: "column", minWidth: 0 }, children: [
          /* @__PURE__ */ o.jsx("span", { style: {
            fontSize: 11,
            fontWeight: 500,
            color: "hsl(var(--muted-foreground))",
            lineHeight: 1.2,
            opacity: u ? 0.9 : 0.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }, children: a.label }),
          /* @__PURE__ */ o.jsxs("span", { style: {
            fontSize: 15,
            fontWeight: 700,
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
function Y2() {
  const [a, s] = D.useState("amps"), { open: r } = Cn(), u = a === "amps" ? "A" : "W", f = a === "amps" ? 0.05 : 2, d = a === "amps" ? 1 : 0, { value: m } = Y("sensor.olins_van_bms_battery"), { value: p } = Y("sensor.battery_charging"), { value: y } = Y("sensor.battery_discharging"), { value: g } = Y("sensor.olins_van_bms_current"), { value: x } = Y("sensor.total_mppt_pv_power"), { value: b } = Y("sensor.shore_power_charger_power_24v"), { value: S } = Y("sensor.alternator_charger_power_24v"), { value: N } = Y("sensor.total_mppt_output_current"), { value: z } = Y("sensor.a32_pro_s5140_channel_16_current_24v_shore_power_charger"), { value: R } = Y("sensor.a32_pro_s5140_channel_8_current_24v_alternator_charger"), { value: H } = Y("sensor.all_12v_devices_power_24v"), { value: G } = Y("sensor.air_conditioning_power_24v"), { value: $ } = Y("sensor.all_24v_devices_power_24v"), { value: P } = Y("sensor.inverter_power_24v"), { value: X } = Y("sensor.a32_pro_s5140_channel_6_current_24v_12v_devices"), { value: J } = Y("sensor.a32_pro_s5140_channel_4_current_24v_air_conditioning"), { value: ne } = Y("sensor.a32_pro_s5140_channel_5_current_24v_24v_devices"), { value: Z } = Y("sensor.a32_pro_s5140_channel_7_current_24v_inverter"), ee = a === "amps" ? { solar: Math.abs(N ?? 0), shore: Math.abs(z ?? 0), alt: Math.abs(R ?? 0) } : { solar: Math.abs(x ?? 0), shore: Math.abs(b ?? 0), alt: Math.abs(S ?? 0) }, ge = a === "amps" ? { "12v": Math.abs(X ?? 0), ac: Math.abs(J ?? 0), "24v": Math.abs(ne ?? 0), inverter: Math.abs(Z ?? 0) } : { "12v": Math.abs(H ?? 0), ac: Math.abs(G ?? 0), "24v": Math.abs($ ?? 0), inverter: Math.abs(P ?? 0) };
  let _e, ce;
  if (a === "amps") {
    const _ = g ?? 0;
    _e = _ > 0 ? _ : 0, ce = _ < 0 ? Math.abs(_) : 0;
  } else
    _e = p ?? 0, ce = y ?? 0;
  const oe = Object.values(ge).reduce((_, O) => _ + O, 0), Me = m ?? 0, K = Me >= 65 ? "#16a34a" : Me >= 30 ? "#d97706" : "#dc2626", ve = a === "amps" ? 15 : 300, A = 4.5;
  Br.forEach((_) => {
    const O = ee[_.id], V = O > f;
    zr.set(`${_.id}-hub`, {
      color: _.color,
      active: V,
      speed: Eo(O, a),
      dotCount: Ao(O, a),
      reverse: !1,
      strokeWidth: V ? Math.min(1.5 + O / ve * A, A) : 1
    });
  }), qr.forEach((_) => {
    const O = ge[_.id], V = O > f;
    zr.set(`hub-${_.id}`, {
      color: _.color,
      active: V,
      speed: Eo(O, a),
      dotCount: Ao(O, a),
      reverse: !1,
      strokeWidth: V ? Math.min(1.5 + O / ve * A, A) : 1
    });
  });
  const q = Math.max(_e, ce), W = _e > f || ce > f;
  zr.set("batt-edge", {
    color: _e > f ? "#16a34a" : ce > f ? "#ea580c" : "hsl(var(--border))",
    active: W,
    speed: Eo(q, a),
    dotCount: W ? Ao(q, a) : 0,
    reverse: ce > f,
    strokeWidth: W ? Math.min(1.5 + q / ve * A, A) : 1
  });
  const he = D.useRef(null), me = D.useRef(!1);
  return D.useEffect(() => {
    const _ = he.current;
    if (!(!_ || me.current)) {
      me.current = !0;
      for (const O of ci) {
        const V = document.createElementNS("http://www.w3.org/2000/svg", "path");
        V.setAttribute("d", O.path), V.setAttribute("fill", "none"), V.setAttribute("stroke", "#888"), V.setAttribute("stroke-width", "1"), V.setAttribute("stroke-linecap", "round"), V.setAttribute("opacity", "0.07"), _.appendChild(V), sg.set(O.id, V);
        const I = [];
        for (let fe = 0; fe < Gr; fe++) {
          const ye = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          ye.setAttribute("r", "4"), ye.setAttribute("fill", "none"), ye.setAttribute("opacity", "0"), _.appendChild(ye), I.push(ye);
        }
        ig.set(O.id, I);
      }
      return B2(), () => q2();
    }
  }, []), /* @__PURE__ */ o.jsx(Be, { children: /* @__PURE__ */ o.jsxs(qe, { className: "pt-4 relative", children: [
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
    /* @__PURE__ */ o.jsxs("div", { style: { position: "relative", width: "100%", aspectRatio: `${Mo}/${To}`, margin: "0 auto" }, children: [
      /* @__PURE__ */ o.jsx(
        "svg",
        {
          ref: he,
          viewBox: `0 0 ${Mo} ${To}`,
          style: { position: "absolute", inset: 0, width: "100%", height: "100%" },
          preserveAspectRatio: "xMidYMid meet"
        }
      ),
      /* @__PURE__ */ o.jsx("div", { style: {
        position: "absolute",
        inset: 0
        /* Use SVG viewBox coordinates via scale transform */
      }, children: /* @__PURE__ */ o.jsxs("svg", { viewBox: `0 0 ${Mo} ${To}`, style: { width: "100%", height: "100%" }, preserveAspectRatio: "xMidYMid meet", children: [
        Br.map((_, O) => {
          const V = ee[_.id], I = a === "amps" ? _.currentEntity : _.powerEntity;
          return /* @__PURE__ */ o.jsx("foreignObject", { x: eg, y: lg[O], width: Yr, height: Wl, children: /* @__PURE__ */ o.jsx(
            K0,
            {
              def: _,
              val: Q(V, d),
              unit: u,
              active: V > f,
              onClick: () => r(I, _.label, u)
            }
          ) }, _.id);
        }),
        /* @__PURE__ */ o.jsx("foreignObject", { x: ri - tn / 2, y: Xa - tn / 2, width: tn, height: tn, children: /* @__PURE__ */ o.jsxs("div", { style: {
          width: tn,
          height: tn,
          borderRadius: "50%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: `2px solid ${oe > f ? "#ca8a0460" : "hsl(var(--border))"}`,
          boxShadow: oe > f ? "0 0 12px #ca8a0420" : "none",
          transition: "border-color 0.3s, box-shadow 0.3s"
        }, children: [
          /* @__PURE__ */ o.jsx(mp, { size: 18, style: { color: oe > f ? "#ca8a04" : "hsl(var(--muted-foreground))" } }),
          /* @__PURE__ */ o.jsxs("span", { style: { fontSize: 12, fontWeight: 600, fontVariantNumeric: "tabular-nums", marginTop: 2, color: "hsl(var(--foreground))" }, children: [
            Q(oe, d),
            " ",
            u
          ] })
        ] }) }),
        /* @__PURE__ */ o.jsx("foreignObject", { x: Ip - Tr / 2, y: Pp - Zs / 2, width: Tr, height: Zs, children: /* @__PURE__ */ o.jsx(
          "div",
          {
            style: { width: Tr, height: Zs, position: "relative", cursor: "pointer" },
            onClick: () => r("sensor.olins_van_bms_battery", "Battery SOC", "%"),
            children: /* @__PURE__ */ o.jsxs("div", { style: {
              width: Tr,
              height: Zs,
              borderRadius: "12px 12px 0 0",
              border: `2px solid ${K}60`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 8px ${K}15`,
              transition: "border-color 0.3s"
            }, children: [
              /* @__PURE__ */ o.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                /* @__PURE__ */ o.jsx(Nv, { size: 16, style: { color: K } }),
                /* @__PURE__ */ o.jsxs("span", { style: { fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: K }, children: [
                  Q(Me, 0),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ o.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", marginTop: 2 }, children: [
                _e > f && /* @__PURE__ */ o.jsxs("span", { style: { fontSize: 10, fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "#16a34a" }, children: [
                  "↓ ",
                  Q(_e, d),
                  " ",
                  u
                ] }),
                ce > f && /* @__PURE__ */ o.jsxs("span", { style: { fontSize: 10, fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "#ea580c" }, children: [
                  "↑ ",
                  Q(ce, d),
                  " ",
                  u
                ] }),
                _e <= f && ce <= f && /* @__PURE__ */ o.jsx("span", { style: { fontSize: 10, color: "hsl(var(--muted-foreground))", opacity: 0.5 }, children: "Idle" })
              ] }),
              /* @__PURE__ */ o.jsx("div", { style: {
                position: "absolute",
                bottom: 0,
                left: 0,
                height: 3,
                borderRadius: "0 0 12px 12px",
                width: `${Me}%`,
                backgroundColor: K,
                boxShadow: `0 0 4px ${K}40`,
                transition: "all 0.5s"
              } })
            ] })
          }
        ) }),
        qr.map((_, O) => {
          const V = ge[_.id], I = a === "amps" ? _.currentEntity : _.powerEntity;
          return /* @__PURE__ */ o.jsx("foreignObject", { x: tg, y: ag[O], width: Yr, height: Wl, children: /* @__PURE__ */ o.jsx(
            K0,
            {
              def: _,
              val: Q(V, d),
              unit: u,
              active: V > f,
              onClick: () => r(I, _.label, u)
            }
          ) }, _.id);
        })
      ] }) })
    ] })
  ] }) });
}
function G2() {
  const { value: a } = Y("sensor.a32_pro_smart_battery_sense_12v_voltage"), { value: s } = Y("sensor.a32_pro_smart_battery_sense_12v_temperature"), { value: r } = Y("sensor.battery_charging"), { value: u } = Y("sensor.battery_discharging");
  return /* @__PURE__ */ o.jsxs(Be, { children: [
    /* @__PURE__ */ o.jsx(lt, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(at, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(hp, { className: "h-4 w-4" }),
      "System Voltages"
    ] }) }),
    /* @__PURE__ */ o.jsxs(qe, { className: "space-y-1", children: [
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.a32_pro_smart_battery_sense_12v_voltage", label: "12V Rail", value: Q(a, 2), unit: "V", color: "#6366f1" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.a32_pro_smart_battery_sense_12v_temperature", label: "12V Temp", value: Q(s, 1), unit: "°C", color: "#3b82f6" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.battery_charging", label: "Charging", value: Q(r, 0), unit: "W", color: "#22c55e" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.battery_discharging", label: "Discharging", value: Q(u, 0), unit: "W", color: "#f97316" })
    ] })
  ] });
}
function V2() {
  return /* @__PURE__ */ o.jsxs(Be, { children: [
    /* @__PURE__ */ o.jsx(lt, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(at, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(ai, { className: "h-4 w-4" }),
      "Charging Controls"
    ] }) }),
    /* @__PURE__ */ o.jsx(qe, { children: /* @__PURE__ */ o.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ o.jsx(
        gt,
        {
          entityId: "input_boolean.shore_power_charger_enabled",
          name: "Shore Charger",
          icon: gp,
          activeColor: "green"
        }
      ),
      /* @__PURE__ */ o.jsx(Np, {})
    ] }) })
  ] });
}
function X2() {
  return /* @__PURE__ */ o.jsx(Il, { title: "Power & Energy", children: /* @__PURE__ */ o.jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsx(_p, {}),
      /* @__PURE__ */ o.jsx(G2, {})
    ] }),
    /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsx(bp, {}),
      /* @__PURE__ */ o.jsx(V2, {})
    ] }),
    /* @__PURE__ */ o.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ o.jsx(Y2, {}) })
  ] }) });
}
const Q2 = [
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
function Z2() {
  var y, g;
  const { value: a } = Y("sensor.battery_heater_power_12v"), { value: s } = Y("sensor.a32_pro_s5140_channel_36_temperature_battery_bottom_aluminum_plate"), r = re("switch.a32_pro_battery_heater_enable"), u = Ot("switch.a32_pro_battery_heater_enable"), f = re("climate.a32_pro_battery_heater_thermostat"), d = (y = f == null ? void 0 : f.attributes) == null ? void 0 : y.temperature, m = (g = f == null ? void 0 : f.attributes) == null ? void 0 : g.current_temperature, p = f == null ? void 0 : f.state;
  return /* @__PURE__ */ o.jsxs(Be, { children: [
    /* @__PURE__ */ o.jsx(lt, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(at, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(Jo, { className: "h-4 w-4" }),
      "Battery Heater",
      /* @__PURE__ */ o.jsxs("div", { className: "ml-auto flex items-center gap-1.5", children: [
        /* @__PURE__ */ o.jsx("span", { className: "text-[10px] text-muted-foreground", children: p === "heat" ? "Heating" : "Off" }),
        /* @__PURE__ */ o.jsx(_n, { checked: (r == null ? void 0 : r.state) === "on", onCheckedChange: u })
      ] })
    ] }) }),
    /* @__PURE__ */ o.jsxs(qe, { className: "space-y-1", children: [
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.a32_pro_s5140_channel_36_temperature_battery_bottom_aluminum_plate", label: "Battery Plate", value: Q(s, 1), unit: "°C", color: "#3b82f6" }),
      m != null && /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
        /* @__PURE__ */ o.jsx("span", { className: "text-muted-foreground", children: "Thermostat" }),
        /* @__PURE__ */ o.jsxs("span", { className: "tabular-nums", children: [
          Q(m, 1),
          "°C → ",
          Q(d, 0),
          "°C"
        ] })
      ] }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.battery_heater_power_12v", label: "Power", value: Q(a, 0), unit: "W", color: "#ef4444" })
    ] })
  ] });
}
function K2() {
  const a = re("switch.a32_pro_coolant_blower_mode_auto_manual"), s = Ot("switch.a32_pro_coolant_blower_mode_auto_manual"), r = (a == null ? void 0 : a.state) === "on";
  return /* @__PURE__ */ o.jsx(Be, { children: /* @__PURE__ */ o.jsx(qe, { className: "pt-4", children: /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ o.jsxs("span", { className: "text-sm flex items-center gap-1.5", children: [
      /* @__PURE__ */ o.jsx(Qv, { className: "h-3.5 w-3.5" }),
      "Blower Fan Mode"
    ] }),
    /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ o.jsx("span", { className: "text-xs text-muted-foreground", children: r ? "Auto (PID)" : "Manual" }),
      /* @__PURE__ */ o.jsx(_n, { checked: r, onCheckedChange: s })
    ] })
  ] }) }) });
}
function J2() {
  const { value: a } = Y("sensor.a32_pro_s5140_channel_37_temperature_air_fryer_compartment"), s = re("switch.a32_pro_air_fryer_ventilation_enable"), r = Ot("switch.a32_pro_air_fryer_ventilation_enable");
  return /* @__PURE__ */ o.jsx(Be, { children: /* @__PURE__ */ o.jsxs(qe, { className: "pt-4 space-y-2", children: [
    /* @__PURE__ */ o.jsx(
      pe,
      {
        entityId: "sensor.a32_pro_s5140_channel_37_temperature_air_fryer_compartment",
        label: "Air Fryer Compartment",
        value: Q(a, 1),
        unit: "°C",
        icon: li,
        color: "#f97316"
      }
    ),
    /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ o.jsxs("span", { className: "text-sm flex items-center gap-1.5", children: [
        /* @__PURE__ */ o.jsx(Ws, { className: "h-3.5 w-3.5" }),
        "Ventilation Fan"
      ] }),
      /* @__PURE__ */ o.jsx(_n, { checked: (s == null ? void 0 : s.state) === "on", onCheckedChange: r })
    ] })
  ] }) });
}
function $2() {
  return /* @__PURE__ */ o.jsx(Il, { title: "Climate & Heating", children: /* @__PURE__ */ o.jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: [
    /* @__PURE__ */ o.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ o.jsx(Sp, {}) }),
    /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsx("h2", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider", children: "Temperature Zones" }),
      /* @__PURE__ */ o.jsx("div", { className: "grid grid-cols-2 gap-3", children: Q2.map((a) => /* @__PURE__ */ o.jsx(
        ko,
        {
          name: a.name,
          tempEntity: a.temp,
          humidityEntity: a.humidity
        },
        a.name
      )) }),
      /* @__PURE__ */ o.jsx(Z2, {}),
      /* @__PURE__ */ o.jsx(J2, {})
    ] }),
    /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsx(jp, {}),
      /* @__PURE__ */ o.jsx(K2, {})
    ] })
  ] }) });
}
const W2 = [
  { entityId: "switch.a32_pro_switch01_water_system_valve_1", name: "Valve 1" },
  { entityId: "switch.a32_pro_switch02_water_system_valve_2", name: "Valve 2" },
  { entityId: "switch.a32_pro_switch03_water_system_valve_3", name: "Valve 3" },
  { entityId: "switch.a32_pro_switch06_grey_water_tank_valve", name: "Grey Dump Valve" }
], F2 = [
  { entityId: "switch.a32_pro_switch30_main_system_water_pump", name: "Main Pump" },
  { entityId: "switch.a32_pro_switch29_shower_system_water_pump", name: "Shower Pump" },
  { entityId: "switch.a32_pro_switch14_uv_filter", name: "UV Filter" }
];
function J0({ entityId: a, name: s, onLabel: r = "Open", offLabel: u = "Closed" }) {
  const f = re(a), d = (f == null ? void 0 : f.state) === "on";
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
function I2() {
  return /* @__PURE__ */ o.jsxs(Be, { children: [
    /* @__PURE__ */ o.jsx(lt, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(at, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(fp, { className: "h-4 w-4" }),
      "Valves & Pumps"
    ] }) }),
    /* @__PURE__ */ o.jsxs(qe, { className: "space-y-1", children: [
      W2.map((a) => /* @__PURE__ */ o.jsx(J0, { entityId: a.entityId, name: a.name }, a.entityId)),
      /* @__PURE__ */ o.jsx("div", { className: "border-t my-1.5" }),
      F2.map((a) => /* @__PURE__ */ o.jsx(J0, { entityId: a.entityId, name: a.name, onLabel: "Running", offLabel: "Off" }, a.entityId))
    ] })
  ] });
}
const P2 = [
  { id: "main", label: "Main", entityId: "switch.a32_pro_water_system_state_main" },
  { id: "recirc", label: "Recirculating Shower", entityId: "switch.a32_pro_water_system_state_recirculating_shower" },
  { id: "flush", label: "Recirculating Flush", entityId: "switch.a32_pro_water_system_state_recirculating_shower_flush" }
];
function ew() {
  const a = re("switch.a32_pro_water_system_master_switch"), s = re("switch.a32_pro_water_system_state_main"), r = re("switch.a32_pro_water_system_state_recirculating_shower"), u = re("switch.a32_pro_water_system_state_recirculating_shower_flush"), f = Ot("switch.a32_pro_water_system_master_switch"), d = el(), m = (a == null ? void 0 : a.state) === "on", p = (s == null ? void 0 : s.state) === "on" ? "main" : (r == null ? void 0 : r.state) === "on" ? "recirc" : (u == null ? void 0 : u.state) === "on" ? "flush" : null, y = (g) => {
    d("switch", "turn_on", void 0, { entity_id: g });
  };
  return /* @__PURE__ */ o.jsxs(Be, { children: [
    /* @__PURE__ */ o.jsx(lt, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(at, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx($v, { className: "h-4 w-4" }),
      "Water Controls"
    ] }) }),
    /* @__PURE__ */ o.jsxs(qe, { className: "space-y-3", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ o.jsx("span", { className: "text-sm font-medium", children: "Master Switch" }),
        /* @__PURE__ */ o.jsx(_n, { checked: m, onCheckedChange: f })
      ] }),
      m && /* @__PURE__ */ o.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ o.jsx("span", { className: "text-xs text-muted-foreground", children: "Mode" }),
        /* @__PURE__ */ o.jsx("div", { className: "flex flex-col gap-1.5", children: P2.map((g) => /* @__PURE__ */ o.jsxs(
          "button",
          {
            onClick: () => y(g.entityId),
            className: ae(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
              p === g.id ? "bg-blue-500/15 text-blue-400 border border-blue-500/30" : "bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted hover:text-foreground"
            ),
            children: [
              g.id === "recirc" && /* @__PURE__ */ o.jsx(Zr, { className: "h-3.5 w-3.5 shrink-0" }),
              g.label
            ]
          },
          g.id
        )) })
      ] })
    ] })
  ] });
}
function tw() {
  const { value: a } = Y("sensor.propane_tank_percentage"), { value: s } = Y("sensor.propane_liquid_volume"), { value: r } = Y("sensor.propane_liquid_depth"), { value: u } = Y("sensor.propane_raw_distance"), f = re("switch.a32_pro_switch16_lpg_valve"), d = Ot("switch.a32_pro_switch16_lpg_valve"), m = a ?? 0, p = m < 15 ? "bg-red-500" : m < 30 ? "bg-orange-500" : "bg-green-500";
  return /* @__PURE__ */ o.jsxs(Be, { children: [
    /* @__PURE__ */ o.jsx(lt, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(at, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(Xr, { className: "h-4 w-4" }),
      "Propane",
      /* @__PURE__ */ o.jsxs(
        "span",
        {
          className: ae(
            "ml-auto text-2xl font-bold tabular-nums",
            m < 15 ? "text-red-500" : m < 30 ? "text-orange-500" : "text-green-500"
          ),
          children: [
            Q(a, 0),
            "%"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ o.jsxs(qe, { className: "space-y-3", children: [
      /* @__PURE__ */ o.jsx("div", { className: "h-3 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ o.jsx(
        "div",
        {
          className: ae("h-full rounded-full transition-all duration-500", p),
          style: { width: `${Math.min(100, Math.max(0, m))}%` }
        }
      ) }),
      /* @__PURE__ */ o.jsxs("div", { className: "grid gap-1", children: [
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.propane_liquid_volume", label: "Volume", value: Q(s, 1), unit: "L", color: "#22c55e" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.propane_liquid_depth", label: "Liquid Depth", value: Q(r, 0), unit: "mm", color: "#3b82f6" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.propane_raw_distance", label: "Raw Distance", value: Q(u, 0), unit: "mm", color: "#64748b" })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between pt-2 border-t", children: [
        /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "LPG Valve" }),
        /* @__PURE__ */ o.jsx(_n, { checked: (f == null ? void 0 : f.state) === "on", onCheckedChange: d })
      ] })
    ] })
  ] });
}
function nw() {
  const { value: a } = Y("sensor.a32_pro_s5140_channel_38_temperature_fresh_water_tank"), { value: s } = Y("sensor.a32_pro_s5140_channel_39_temperature_grey_water_tank"), { value: r } = Y("sensor.a32_pro_s5140_channel_40_temperature_shower_water_tank"), u = re("switch.a32_pro_fresh_water_tank_heater_enable"), f = re("switch.a32_pro_grey_water_tank_heater_enable"), d = re("switch.a32_pro_shower_water_tank_heater_enable"), m = Ot("switch.a32_pro_fresh_water_tank_heater_enable"), p = Ot("switch.a32_pro_grey_water_tank_heater_enable"), y = Ot("switch.a32_pro_shower_water_tank_heater_enable"), g = re("climate.a32_pro_fresh_water_tank_thermostat"), x = re("climate.a32_pro_grey_water_tank_thermostat"), b = re("climate.a32_pro_shower_water_tank_thermostat"), S = [
    { name: "Fresh", temp: a, entityId: "sensor.a32_pro_s5140_channel_38_temperature_fresh_water_tank", heater: u, toggleHeater: m, thermostat: g },
    { name: "Grey", temp: s, entityId: "sensor.a32_pro_s5140_channel_39_temperature_grey_water_tank", heater: f, toggleHeater: p, thermostat: x },
    { name: "Shower", temp: r, entityId: "sensor.a32_pro_s5140_channel_40_temperature_shower_water_tank", heater: d, toggleHeater: y, thermostat: b }
  ];
  return /* @__PURE__ */ o.jsxs(Be, { children: [
    /* @__PURE__ */ o.jsx(lt, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(at, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(li, { className: "h-4 w-4" }),
      "Tank Temperatures"
    ] }) }),
    /* @__PURE__ */ o.jsx(qe, { className: "space-y-2", children: S.map((N) => {
      var H, G, $, P, X;
      const z = (G = (H = N.thermostat) == null ? void 0 : H.attributes) == null ? void 0 : G.target_temp_high, R = (($ = N.thermostat) == null ? void 0 : $.state) === "heat";
      return /* @__PURE__ */ o.jsxs("div", { className: "space-y-0.5", children: [
        /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ o.jsx(
            pe,
            {
              entityId: N.entityId,
              label: N.name,
              value: Q(N.temp, 1),
              unit: "°C",
              color: N.temp != null && N.temp < 3 ? "#ef4444" : "#3b82f6",
              className: "flex-1"
            }
          ),
          /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-1.5 ml-2 shrink-0", children: [
            /* @__PURE__ */ o.jsx("span", { className: "text-[10px] text-muted-foreground", children: "Heat" }),
            /* @__PURE__ */ o.jsx(
              _n,
              {
                checked: ((P = N.heater) == null ? void 0 : P.state) === "on",
                onCheckedChange: N.toggleHeater
              }
            )
          ] })
        ] }),
        ((X = N.heater) == null ? void 0 : X.state) === "on" && z != null && /* @__PURE__ */ o.jsx("div", { className: "flex items-center gap-1 ml-1 text-[10px]", children: /* @__PURE__ */ o.jsxs("span", { className: ae(
          "font-medium",
          R ? "text-orange-400" : "text-muted-foreground"
        ), children: [
          R ? "Heating" : "Idle",
          " → ",
          z,
          "°C"
        ] }) })
      ] }, N.name);
    }) })
  ] });
}
function lw() {
  return /* @__PURE__ */ o.jsxs(Be, { children: [
    /* @__PURE__ */ o.jsx(lt, { className: "pb-2", children: /* @__PURE__ */ o.jsx(at, { className: "text-base", children: "Quick Modes" }) }),
    /* @__PURE__ */ o.jsx(qe, { children: /* @__PURE__ */ o.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ o.jsx(
        gt,
        {
          entityId: "input_boolean.shower_mode",
          name: "Shower",
          icon: Zr,
          activeColor: "cyan"
        }
      ),
      /* @__PURE__ */ o.jsx(
        gt,
        {
          entityId: "switch.a32_pro_switch06_grey_water_tank_valve",
          name: "Grey Dump",
          icon: Kr,
          activeColor: "orange"
        }
      )
    ] }) })
  ] });
}
function aw() {
  return /* @__PURE__ */ o.jsx(Il, { title: "Water & Propane", children: /* @__PURE__ */ o.jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsx(
        Or,
        {
          name: "Fresh Water",
          entityId: "sensor.a32_pro_fresh_water_tank_level",
          icon: /* @__PURE__ */ o.jsx(Va, { className: "h-4 w-4 text-blue-500" })
        }
      ),
      /* @__PURE__ */ o.jsx(
        Or,
        {
          name: "Grey Water",
          entityId: "sensor.a32_pro_grey_water_tank_level",
          invertWarning: !0,
          icon: /* @__PURE__ */ o.jsx(Kr, { className: "h-4 w-4 text-orange-500" })
        }
      ),
      /* @__PURE__ */ o.jsx(nw, {}),
      /* @__PURE__ */ o.jsx(lw, {})
    ] }),
    /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsx(ew, {}),
      /* @__PURE__ */ o.jsx(I2, {})
    ] }),
    /* @__PURE__ */ o.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ o.jsx(tw, {}) })
  ] }) });
}
const sw = wp(
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
function Js({ className: a, variant: s, ...r }) {
  return /* @__PURE__ */ o.jsx("div", { className: ae(sw({ variant: s }), a), ...r });
}
function iw() {
  const { value: a } = Y("sensor.192_168_10_90_0d_vehiclespeed"), { value: s } = Y("sensor.192_168_10_90_0c_enginerpm"), r = re("sensor.gear_display"), { value: u } = Y("sensor.192_168_10_90_11_throttleposition"), { value: f } = Y("sensor.192_168_10_90_04_calcengineload"), { value: d } = Y("sensor.192_168_10_90_05_enginecoolanttemp"), { value: m } = Y("sensor.192_168_10_90_42_controlmodulevolt"), p = re("binary_sensor.vehicle_is_moving"), y = re("binary_sensor.engine_is_running"), g = re("binary_sensor.meatpi_pro_ecu_status"), { data: x } = Fl("sensor.192_168_10_90_0d_vehiclespeed", 6), { open: b } = Cn(), S = (g == null ? void 0 : g.state) === "on" && cp(g == null ? void 0 : g.last_updated), N = (p == null ? void 0 : p.state) === "on" && S, z = (y == null ? void 0 : y.state) === "on" && S, R = (r == null ? void 0 : r.state) ?? "—";
  return /* @__PURE__ */ o.jsxs(Be, { children: [
    /* @__PURE__ */ o.jsx(lt, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(at, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(op, { className: "h-4 w-4" }),
      "Engine",
      /* @__PURE__ */ o.jsxs("div", { className: "ml-auto flex gap-1.5", children: [
        !S && /* @__PURE__ */ o.jsx(Js, { variant: "outline", className: "text-[10px] text-muted-foreground border-muted-foreground/30", children: "Disconnected" }),
        z && /* @__PURE__ */ o.jsx(Js, { variant: "default", className: "text-[10px] bg-green-500", children: "Running" }),
        N && /* @__PURE__ */ o.jsx(Js, { variant: "default", className: "text-[10px] bg-blue-500", children: "Moving" })
      ] })
    ] }) }),
    /* @__PURE__ */ o.jsxs(qe, { className: "space-y-3", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "grid grid-cols-3 gap-3 text-center", children: [
        /* @__PURE__ */ o.jsxs("div", { className: "cursor-pointer hover:bg-muted/50 rounded-md p-1 transition-colors", onClick: () => b("sensor.192_168_10_90_0d_vehiclespeed", "Speed", "km/h"), children: [
          /* @__PURE__ */ o.jsx("p", { className: "text-3xl font-bold tabular-nums", children: Q(a, 0) }),
          /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "km/h" })
        ] }),
        /* @__PURE__ */ o.jsxs("div", { className: "cursor-pointer hover:bg-muted/50 rounded-md p-1 transition-colors", onClick: () => b("sensor.192_168_10_90_0c_enginerpm", "RPM", "rpm"), children: [
          /* @__PURE__ */ o.jsx("p", { className: "text-3xl font-bold tabular-nums", children: Q(s, 0) }),
          /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "RPM" })
        ] }),
        /* @__PURE__ */ o.jsxs("div", { children: [
          /* @__PURE__ */ o.jsx("p", { className: "text-3xl font-bold tabular-nums", children: R }),
          /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Gear" })
        ] })
      ] }),
      /* @__PURE__ */ o.jsx(Ga, { data: x, color: "#3b82f6", width: 300, height: 32, className: "w-full", onClick: () => b("sensor.192_168_10_90_0d_vehiclespeed", "Speed", "km/h") }),
      /* @__PURE__ */ o.jsxs("div", { className: "grid gap-1", children: [
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.192_168_10_90_11_throttleposition", label: "Throttle", value: Q(u, 0), unit: "%", color: "#f59e0b" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.192_168_10_90_04_calcengineload", label: "Engine Load", value: Q(f, 0), unit: "%", color: "#ef4444" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.192_168_10_90_05_enginecoolanttemp", label: "Coolant Temp", value: Q(d, 0), unit: "°C", color: "#ef4444" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.192_168_10_90_42_controlmodulevolt", label: "ECU Voltage", value: Q(m, 1), unit: "V", color: "#6366f1" })
      ] })
    ] })
  ] });
}
function rw() {
  const { value: a } = Y("sensor.stable_fuel_level"), { value: s } = Y("sensor.192_168_10_90_2f_fueltanklevel"), { value: r } = Y("sensor.wican_fuel_5_min_mean"), { value: u } = Y("sensor.estimated_fuel_consumption"), { value: f } = Y("sensor.estimated_fuel_rate"), { value: d } = Y("sensor.192_168_10_90_0d_vehiclespeed"), { data: m } = Fl("sensor.stable_fuel_level", 24), { open: p } = Cn(), y = a != null ? a / 100 * 94.6 : null, g = a ?? 0, x = g < 15 ? "text-red-500" : g < 30 ? "text-orange-500" : "text-green-500", b = (d ?? 0) > 5 ? Q(u, 1) : "—";
  return /* @__PURE__ */ o.jsxs(Be, { children: [
    /* @__PURE__ */ o.jsx(lt, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(at, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(dp, { className: "h-4 w-4" }),
      "Fuel",
      /* @__PURE__ */ o.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
        /* @__PURE__ */ o.jsx(Ga, { data: m, color: g < 15 ? "#ef4444" : g < 30 ? "#f97316" : "#22c55e", width: 56, height: 18, onClick: () => p("sensor.stable_fuel_level", "Fuel Level", "%") }),
        /* @__PURE__ */ o.jsxs("span", { className: ae("text-2xl font-bold tabular-nums", x), children: [
          Q(a, 0),
          "%"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ o.jsxs(qe, { className: "space-y-1", children: [
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.stable_fuel_level", label: "Estimated", value: Q(y, 1), unit: "L", color: "#22c55e" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.wican_fuel_5_min_mean", label: "5min Mean", value: Q(r, 0), unit: "%", color: "#3b82f6" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.192_168_10_90_2f_fueltanklevel", label: "Raw OBD", value: Q(s, 0), unit: "%", color: "#64748b" }),
      (f ?? 0) > 0 && /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.estimated_fuel_rate", label: "Rate", value: Q(f, 1), unit: "L/h", color: "#f59e0b" }),
      (f ?? 0) > 0 && /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.estimated_fuel_consumption", label: "Economy", value: b, unit: "L/100km", color: "#8b5cf6" })
    ] })
  ] });
}
function cw() {
  const { value: a, entity: s } = Y("sensor.192_168_10_90_tyre_p_fl"), { value: r, entity: u } = Y("sensor.192_168_10_90_tyre_p_fr"), { value: f, entity: d } = Y("sensor.192_168_10_90_tyre_p_rl"), { value: m, entity: p } = Y("sensor.192_168_10_90_tyre_p_rr"), y = re("binary_sensor.low_tire_pressure"), g = (y == null ? void 0 : y.state) === "on", x = (H, G) => {
    var P;
    return H == null ? null : ((P = G == null ? void 0 : G.attributes) == null ? void 0 : P.unit_of_measurement) === "kPa" ? H * 0.072519 : H;
  }, b = x(a, s), S = x(r, u), N = x(f, d), z = x(m, p), R = (H) => (H ?? 0) < 50 ? "text-red-500" : (H ?? 0) < 55 ? "text-orange-500" : "text-green-500";
  return /* @__PURE__ */ o.jsxs(Be, { children: [
    /* @__PURE__ */ o.jsx(lt, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(at, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(fp, { className: "h-4 w-4" }),
      "Tire Pressure",
      g && /* @__PURE__ */ o.jsx(Js, { variant: "destructive", className: "ml-auto text-[10px]", children: "LOW" })
    ] }) }),
    /* @__PURE__ */ o.jsx(qe, { children: /* @__PURE__ */ o.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "rounded-lg bg-muted/50 p-3 text-center", children: [
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Front Left" }),
        /* @__PURE__ */ o.jsx("p", { className: ae("text-xl font-bold tabular-nums", R(b)), children: Q(b, 0) }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "psi" })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "rounded-lg bg-muted/50 p-3 text-center", children: [
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Front Right" }),
        /* @__PURE__ */ o.jsx("p", { className: ae("text-xl font-bold tabular-nums", R(S)), children: Q(S, 0) }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "psi" })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "rounded-lg bg-muted/50 p-3 text-center", children: [
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Rear Left" }),
        /* @__PURE__ */ o.jsx("p", { className: ae("text-xl font-bold tabular-nums", R(N)), children: Q(N, 0) }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "psi" })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "rounded-lg bg-muted/50 p-3 text-center", children: [
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Rear Right" }),
        /* @__PURE__ */ o.jsx("p", { className: ae("text-xl font-bold tabular-nums", R(z)), children: Q(z, 0) }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "psi" })
      ] })
    ] }) })
  ] });
}
function uw() {
  const { value: a } = Y("sensor.road_grade_deg"), { value: s } = Y("sensor.road_grade"), r = re("sensor.hill_aggression");
  return /* @__PURE__ */ o.jsxs(Be, { children: [
    /* @__PURE__ */ o.jsx(lt, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(at, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(pp, { className: "h-4 w-4" }),
      "Road Grade"
    ] }) }),
    /* @__PURE__ */ o.jsxs(qe, { className: "space-y-1", children: [
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.road_grade", label: "Grade", value: Q(s, 1), unit: "%", color: "#22c55e" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.road_grade_deg", label: "Degrees", value: Q(a, 1), unit: "°", color: "#6366f1" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.hill_aggression", label: "Terrain", value: (r == null ? void 0 : r.state) ?? "—", unit: "", color: "#64748b" })
    ] })
  ] });
}
function ow() {
  const { value: a } = Y("sensor.192_168_10_90_oil_life"), { value: s } = Y("sensor.192_168_10_90_tran_f_temp"), { value: r } = Y("sensor.192_168_10_90_wastegate"), { value: u } = Y("sensor.192_168_10_90_intake_air_tmp"), { value: f } = Y("sensor.192_168_10_90_46_ambientairtemp"), { value: d } = Y("sensor.192_168_10_90_fuel_pressure"), { value: m } = Y("sensor.192_168_10_90_map"), { value: p } = Y("sensor.injector_pulse_width_ms"), { value: y } = Y("sensor.average_fuel_trim"), { value: g } = Y("sensor.commanded_afr"), { value: x } = Y("sensor.wican_alternator_duty"), b = re("binary_sensor.check_engine_light"), { value: S } = Y("sensor.dtc_count"), N = (b == null ? void 0 : b.state) === "on";
  return /* @__PURE__ */ o.jsxs(Be, { children: [
    /* @__PURE__ */ o.jsx(lt, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(at, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(hp, { className: "h-4 w-4" }),
      "Diagnostics",
      N && /* @__PURE__ */ o.jsxs(Js, { variant: "destructive", className: "ml-auto text-[10px] flex items-center gap-1", children: [
        /* @__PURE__ */ o.jsx(Kv, { className: "h-3 w-3" }),
        "CEL (",
        S,
        " DTC)"
      ] })
    ] }) }),
    /* @__PURE__ */ o.jsxs(qe, { className: "space-y-1", children: [
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.192_168_10_90_oil_life", label: "Oil Life", value: Q(a, 0), unit: "%", color: "#22c55e" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.192_168_10_90_wastegate", label: "Wastegate", value: Q(r, 0), unit: "%", color: "#f59e0b" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.192_168_10_90_intake_air_tmp", label: "Intake Air", value: Q(u, 0), unit: "°C", color: "#06b6d4" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.192_168_10_90_46_ambientairtemp", label: "Ambient Air", value: Q(f, 0), unit: "°C", color: "#3b82f6" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.192_168_10_90_fuel_pressure", label: "Fuel Pressure", value: Q(d, 0), unit: "kPa", color: "#8b5cf6" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.192_168_10_90_map", label: "MAP", value: Q(m, 0), unit: "kPa", color: "#14b8a6" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.injector_pulse_width_ms", label: "Injector PW", value: Q(p, 2), unit: "ms", color: "#e879f9" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.average_fuel_trim", label: "Fuel Trim", value: Q(y, 1), unit: "%", color: "#fb923c" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.commanded_afr", label: "AFR", value: Q(g, 1), unit: ":1", color: "#a78bfa" }),
      /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.wican_alternator_duty", label: "Alt Duty", value: Q(x, 0), unit: "%", color: "#facc15" })
    ] })
  ] });
}
function fw() {
  const { value: a } = Y("sensor.192_168_10_90_0c_enginerpm"), { value: s } = Y("sensor.192_168_10_90_42_controlmodulevolt"), { value: r } = Y("sensor.192_168_10_90_05_enginecoolanttemp"), { value: u } = Y("sensor.192_168_10_90_tran_f_temp"), { value: f } = Y("sensor.road_grade"), d = re("sensor.hill_aggression"), { open: m } = Cn(), p = (r ?? 0) > 105 ? "text-red-500" : (r ?? 0) > 95 ? "text-orange-400" : "text-foreground", y = (u ?? 0) > 110 ? "text-red-500" : (u ?? 0) > 95 ? "text-orange-400" : "text-foreground";
  return /* @__PURE__ */ o.jsx(Be, { children: /* @__PURE__ */ o.jsxs(qe, { className: "pt-4 pb-3", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "cursor-pointer hover:bg-muted/50 rounded-lg p-2 text-center transition-colors", onClick: () => m("sensor.192_168_10_90_0c_enginerpm", "RPM", "rpm"), children: [
        /* @__PURE__ */ o.jsx("p", { className: "text-3xl font-bold tabular-nums", children: Q(a, 0) }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "RPM" })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "cursor-pointer hover:bg-muted/50 rounded-lg p-2 text-center transition-colors", onClick: () => m("sensor.192_168_10_90_42_controlmodulevolt", "Battery Voltage", "V"), children: [
        /* @__PURE__ */ o.jsx("p", { className: "text-3xl font-bold tabular-nums", children: Q(s, 2) }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Battery V" })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: ae("cursor-pointer hover:bg-muted/50 rounded-lg p-2 text-center transition-colors"), onClick: () => m("sensor.192_168_10_90_05_enginecoolanttemp", "Coolant Temp", "°C"), children: [
        /* @__PURE__ */ o.jsxs("p", { className: ae("text-3xl font-bold tabular-nums", p), children: [
          Q(r, 0),
          "°"
        ] }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Coolant" })
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: ae("cursor-pointer hover:bg-muted/50 rounded-lg p-2 text-center transition-colors"), onClick: () => m("sensor.192_168_10_90_tran_f_temp", "Trans Temp", "°C"), children: [
        /* @__PURE__ */ o.jsxs("p", { className: ae("text-3xl font-bold tabular-nums", y), children: [
          Q(u, 0),
          "°"
        ] }),
        /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Trans" })
      ] })
    ] }),
    /* @__PURE__ */ o.jsxs("div", { className: "mt-2 flex items-center justify-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 transition-colors", onClick: () => m("sensor.road_grade", "Road Grade", "%"), children: [
      /* @__PURE__ */ o.jsx(pp, { className: "h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ o.jsxs("span", { className: "text-2xl font-bold tabular-nums", children: [
        Q(f, 1),
        "%"
      ] }),
      /* @__PURE__ */ o.jsx("span", { className: "text-xs text-muted-foreground", children: (d == null ? void 0 : d.state) ?? "—" })
    ] })
  ] }) });
}
function dw() {
  return /* @__PURE__ */ o.jsxs(Il, { title: "Van & Vehicle", children: [
    /* @__PURE__ */ o.jsx(fw, {}),
    /* @__PURE__ */ o.jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3 mt-4", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ o.jsx(iw, {}),
        /* @__PURE__ */ o.jsx(rw, {})
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ o.jsx(cw, {}),
        /* @__PURE__ */ o.jsx(uw, {})
      ] }),
      /* @__PURE__ */ o.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ o.jsx(ow, {}) })
    ] })
  ] });
}
function hw({
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
function mw() {
  const { value: a } = Y("sensor.starlink_downlink_throughput_mbps"), { value: s } = Y("sensor.starlink_uplink_throughput_mbps"), { value: r } = Y("sensor.speedtest_download"), { value: u } = Y("sensor.speedtest_upload"), { value: f } = Y("sensor.speedtest_ping"), d = re("binary_sensor.starlink_ethernet_speeds"), m = re("input_boolean.speedtest_running"), p = el(), y = (d == null ? void 0 : d.state) === "off", g = (m == null ? void 0 : m.state) === "on", x = () => {
    g || p("script", "turn_on", void 0, { entity_id: "script.update_speedtest" });
  }, { open: b } = Cn();
  return /* @__PURE__ */ o.jsxs(Be, { children: [
    /* @__PURE__ */ o.jsx(lt, { className: "pb-2", children: /* @__PURE__ */ o.jsxs(at, { className: "flex items-center gap-2 text-base", children: [
      /* @__PURE__ */ o.jsx(Dv, { className: "h-4 w-4" }),
      "Internet"
    ] }) }),
    /* @__PURE__ */ o.jsxs(qe, { className: "space-y-3", children: [
      /* @__PURE__ */ o.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ o.jsxs(
          "div",
          {
            className: "rounded-lg bg-muted/50 p-2.5 text-center cursor-pointer hover:bg-muted/80 transition-colors",
            onClick: () => b("sensor.starlink_downlink_throughput_mbps", "Download", "Mbps"),
            children: [
              /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Download" }),
              /* @__PURE__ */ o.jsx("p", { className: "text-xl font-bold tabular-nums", children: Q(a, 1) }),
              /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Mbps" })
            ]
          }
        ),
        /* @__PURE__ */ o.jsxs(
          "div",
          {
            className: "rounded-lg bg-muted/50 p-2.5 text-center cursor-pointer hover:bg-muted/80 transition-colors",
            onClick: () => b("sensor.starlink_uplink_throughput_mbps", "Upload", "Mbps"),
            children: [
              /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Upload" }),
              /* @__PURE__ */ o.jsx("p", { className: "text-xl font-bold tabular-nums", children: Q(s, 1) }),
              /* @__PURE__ */ o.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Mbps" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ o.jsxs("div", { className: "grid gap-1", children: [
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.speedtest_download", label: "Speedtest DL", value: Q(r, 1), unit: "Mbps", color: "#3b82f6" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.speedtest_upload", label: "Speedtest UL", value: Q(u, 1), unit: "Mbps", color: "#8b5cf6" }),
        /* @__PURE__ */ o.jsx(pe, { entityId: "sensor.speedtest_ping", label: "Ping", value: Q(f, 0), unit: "ms", color: "#f59e0b" }),
        /* @__PURE__ */ o.jsx(
          hw,
          {
            label: "Ethernet",
            value: y ? "OK" : "Issues"
          }
        )
      ] }),
      /* @__PURE__ */ o.jsx(
        "button",
        {
          onClick: x,
          disabled: g,
          className: "w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 px-3 flex items-center justify-center gap-2 transition-colors",
          children: g ? /* @__PURE__ */ o.jsxs(o.Fragment, { children: [
            /* @__PURE__ */ o.jsx($s, { className: "h-4 w-4 animate-spin" }),
            "Running…"
          ] }) : "Run Speedtest"
        }
      )
    ] })
  ] });
}
function pw() {
  return /* @__PURE__ */ o.jsxs(Be, { children: [
    /* @__PURE__ */ o.jsx(lt, { className: "pb-2", children: /* @__PURE__ */ o.jsx(at, { className: "text-base", children: "Modes" }) }),
    /* @__PURE__ */ o.jsx(qe, { children: /* @__PURE__ */ o.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ o.jsx(
        gt,
        {
          entityId: "input_boolean.power_saving_mode",
          name: "Eco",
          icon: Ko,
          activeColor: "yellow"
        }
      ),
      /* @__PURE__ */ o.jsx(
        gt,
        {
          entityId: "input_boolean.sleep_mode",
          name: "Sleep",
          icon: $o,
          activeColor: "purple"
        }
      ),
      /* @__PURE__ */ o.jsx(
        gt,
        {
          entityId: "input_boolean.shower_mode",
          name: "Shower",
          icon: Zr,
          activeColor: "cyan"
        }
      )
    ] }) })
  ] });
}
function gw() {
  return /* @__PURE__ */ o.jsxs(Be, { children: [
    /* @__PURE__ */ o.jsx(lt, { className: "pb-2", children: /* @__PURE__ */ o.jsx(at, { className: "text-base", children: "Switches" }) }),
    /* @__PURE__ */ o.jsx(qe, { children: /* @__PURE__ */ o.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ o.jsx(
        gt,
        {
          entityId: "switch.a32_pro_do8_switch06_top_monitor",
          name: "Top Monitor",
          icon: y0,
          activeColor: "blue"
        }
      ),
      /* @__PURE__ */ o.jsx(
        gt,
        {
          entityId: "switch.a32_pro_do8_switch07_bottom_monitor",
          name: "Bottom Mon",
          icon: y0,
          activeColor: "blue"
        }
      ),
      /* @__PURE__ */ o.jsx(
        gt,
        {
          entityId: "switch.a32_pro_switch27_bed_power_supply",
          name: "Bed",
          icon: Mv,
          activeColor: "orange"
        }
      ),
      /* @__PURE__ */ o.jsx(
        gt,
        {
          entityId: "switch.a32_pro_switch16_lpg_valve",
          name: "LPG",
          icon: Xr,
          activeColor: "red"
        }
      )
    ] }) })
  ] });
}
function yw() {
  const a = re("input_boolean.windows_audio_stream"), s = Ot("input_boolean.windows_audio_stream");
  return /* @__PURE__ */ o.jsx(Be, { children: /* @__PURE__ */ o.jsx(qe, { className: "pt-4", children: /* @__PURE__ */ o.jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ o.jsxs("span", { className: "text-sm flex items-center gap-1.5", children: [
      /* @__PURE__ */ o.jsx(Bv, { className: "h-3.5 w-3.5" }),
      "Windows Audio Stream"
    ] }),
    /* @__PURE__ */ o.jsx(_n, { checked: (a == null ? void 0 : a.state) === "on", onCheckedChange: s })
  ] }) }) });
}
function vw() {
  return /* @__PURE__ */ o.jsx(Il, { title: "System", children: /* @__PURE__ */ o.jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsx(mw, {}),
      /* @__PURE__ */ o.jsx(yw, {})
    ] }),
    /* @__PURE__ */ o.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ o.jsx(pw, {}),
      /* @__PURE__ */ o.jsx(gw, {})
    ] })
  ] }) });
}
const Vo = [
  { entityId: "camera.channel_1", label: "Left", channel: 1, stream: "channel_1", lightEntityId: "switch.a32_pro_switch21_left_outdoor_lights" },
  { entityId: "camera.channel_2", label: "Right", channel: 2, stream: "channel_2", lightEntityId: "switch.a32_pro_switch22_right_outdoor_lights" },
  { entityId: "camera.channel_3", label: "Front", channel: 3, stream: "channel_3", lightEntityId: "switch.a32_pro_switch31_lightbar" },
  { entityId: "camera.channel_4", label: "Back", channel: 4, stream: "channel_4", lightEntityId: "switch.a32_pro_switch23_rear_outdoor_lights" }
], af = window.location.protocol === "https:", Xo = /^192\.168\.10\./.test(window.location.hostname), sf = `http://${window.location.hostname}:8766`;
function xw(a) {
  return af ? `${window.__HA_BASE_URL__ || ""}/api/go2rtc/api/stream.mp4?src=${encodeURIComponent(a)}` : `${sf}/api/mse?src=${encodeURIComponent(a)}`;
}
function _w(a) {
  var r, u;
  const s = { signal: a };
  if (af) {
    const f = window.__HASS__, d = (u = (r = f == null ? void 0 : f.auth) == null ? void 0 : r.data) == null ? void 0 : u.access_token;
    d && (s.headers = { Authorization: `Bearer ${d}` });
  }
  return s;
}
function bw({ stream: a }) {
  const s = D.useRef(null), [r, u] = D.useState("connecting"), [f, d] = D.useState(0), m = D.useRef(0);
  return D.useEffect(() => {
    if (!s.current) return;
    const p = s.current;
    let y = !1, g = !1, x, b = null;
    const S = new AbortController();
    function N() {
      if (y || g) return;
      g = !0, S.abort();
      const J = a.charCodeAt(a.length - 1) % 4 * 500, ne = Math.min(2e3 * Math.pow(2, m.current), 3e4);
      m.current++, console.log(`[${a}] Reconnecting in ${((ne + J) / 1e3).toFixed(1)}s (attempt ${m.current})`), x = setTimeout(() => {
        y || (u("connecting"), d((Z) => Z + 1));
      }, ne + J);
    }
    async function z() {
      try {
        let J = function() {
          if (!(ce.updating || _e.readyState !== "open")) {
            if (Me.length > 0) {
              try {
                const q = Me.shift();
                ce.appendBuffer(q.buffer);
              } catch {
                K = !0, ce.updating || ne();
              }
              return;
            }
            K && ne();
          }
        }, ne = function() {
          if (ce.updating || _e.readyState !== "open" || ce.buffered.length === 0) return;
          const q = ce.buffered.start(0), W = ce.buffered.end(ce.buffered.length - 1);
          if (W - q > 60)
            try {
              ce.remove(q, W - 20), K = !1;
            } catch {
            }
          else
            K = !1;
        };
        const Z = await fetch(
          xw(a),
          _w(S.signal)
        );
        if (y) return;
        if (!Z.ok || !Z.body)
          throw new Error(`MSE stream error: ${Z.status}`);
        let ge = (Z.headers.get("Content-Type") || 'video/mp4; codecs="avc1.640028"').split(";").map((q) => q.trim()).join("; ");
        if (MediaSource.isTypeSupported(ge) || (ge = 'video/mp4; codecs="avc1.640028"'), !MediaSource.isTypeSupported(ge))
          throw new Error("No supported MSE codec");
        const _e = new MediaSource();
        if (b = URL.createObjectURL(_e), p.src = b, await new Promise(
          (q) => _e.addEventListener("sourceopen", () => q(), { once: !0 })
        ), y) return;
        const ce = _e.addSourceBuffer(ge), oe = Z.body.getReader(), Me = [];
        let K = !1;
        ce.addEventListener("updateend", J);
        const ve = setInterval(() => {
          y || (K = !0, J());
        }, 1e4);
        let A = !1;
        for (; !y && !g; ) {
          const { done: q, value: W } = await oe.read();
          if (q || !W) break;
          if (ce.updating || Me.length > 0)
            Me.push(W);
          else
            try {
              ce.appendBuffer(W.buffer);
            } catch {
              Me.push(W);
            }
          A || (A = !0, p.play().catch(() => {
          }));
        }
        clearInterval(ve), y || (u("connecting"), N());
      } catch (J) {
        if (!y && !g) {
          if (J instanceof DOMException && J.name === "AbortError") return;
          console.error(`[${a}] MSE error:`, J), u("connecting"), N();
        }
      }
    }
    const R = () => {
      y || (u("playing"), m.current = 0);
    }, H = () => {
      y || (console.error(`[${a}] Video element error:`, p.error), u("connecting"), N());
    };
    p.addEventListener("playing", R), p.addEventListener("error", H);
    let G = -1, $ = 0, P = 0;
    const X = setInterval(() => {
      if (y || g) return;
      const J = Xo ? 3 : 5;
      if (p.buffered.length > 0) {
        const ee = p.buffered.end(p.buffered.length - 1);
        ee - p.currentTime > J && (p.currentTime = ee - 0.5);
      }
      const ne = Xo ? 3 : 4, Z = p.currentTime;
      if (G >= 0 && Z === G && Z > 0) {
        if ($ === 0 && (P = Date.now()), $++, $ >= ne) {
          const ee = ((Date.now() - P) / 1e3).toFixed(0);
          console.warn(`[${a}] Stall detected (stuck ${ee}s at ${Z.toFixed(1)}s), reconnecting`), $ = 0, u("connecting"), N();
        }
      } else
        $ = 0;
      G = Z;
    }, 3e3);
    return z(), () => {
      y = !0, S.abort(), clearTimeout(x), clearInterval(X), p.removeEventListener("playing", R), p.removeEventListener("error", H), p.pause(), p.removeAttribute("src"), p.load(), b && URL.revokeObjectURL(b);
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
    r === "connecting" && /* @__PURE__ */ o.jsx("div", { className: "absolute inset-0 flex items-center justify-center text-muted-foreground", children: /* @__PURE__ */ o.jsx($s, { className: "h-6 w-6 animate-spin" }) }),
    r === "error" && /* @__PURE__ */ o.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2", children: [
      /* @__PURE__ */ o.jsx(Wo, { className: "h-6 w-6" }),
      /* @__PURE__ */ o.jsx("span", { className: "text-xs", children: "Reconnecting…" })
    ] })
  ] });
}
function ww({ entityId: a }) {
  const s = re(a), r = Ot(a), u = (s == null ? void 0 : s.state) === "on";
  return /* @__PURE__ */ o.jsx(
    "button",
    {
      onClick: (f) => {
        f.stopPropagation(), r();
      },
      className: `flex items-center justify-center w-9 h-9 rounded-full transition-all ${u ? "bg-yellow-400/90 text-black shadow-[0_0_12px_rgba(250,204,21,0.5)]" : "bg-white/15 text-white/70 hover:bg-white/25"}`,
      children: /* @__PURE__ */ o.jsx(Qr, { className: "h-4.5 w-4.5" })
    }
  );
}
function Sw({
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
            /* @__PURE__ */ o.jsx(ww, { entityId: r })
          ] }),
          f ? /* @__PURE__ */ o.jsxs(
            "button",
            {
              onClick: p,
              className: "flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm transition-colors",
              children: [
                /* @__PURE__ */ o.jsx(Rv, { className: "h-4 w-4" }),
                "Grid"
              ]
            }
          ) : /* @__PURE__ */ o.jsx(Lv, { className: "h-4 w-4 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity" })
        ] }),
        /* @__PURE__ */ o.jsx(bw, { stream: y })
      ]
    }
  );
}
async function Gs(a, s) {
  const r = await fetch(`${sf}${a}`, s);
  if (!r.ok) throw new Error(`DVR proxy error: ${r.status}`);
  return r.json();
}
function jw({
  speed: a = 1,
  paused: s = !1,
  onError: r
}) {
  const u = D.useRef(null), [f, d] = D.useState("connecting");
  return D.useEffect(() => {
    u.current && (u.current.playbackRate = a);
  }, [a]), D.useEffect(() => {
    const m = u.current;
    m && (s ? m.pause() : m.readyState >= 2 && m.play().catch(() => {
    }));
  }, [s]), D.useEffect(() => {
    const m = u.current;
    if (!m) return;
    let p = !1, y = null, g = null;
    async function x() {
      if (m)
        try {
          const N = await fetch(`${sf}/api/playback/stream`);
          if (p) return;
          if (!N.ok || !N.body) {
            console.error("Playback stream:", N.status), d("error"), r == null || r();
            return;
          }
          let R = (N.headers.get("Content-Type") || 'video/mp4; codecs="hvc1"').split(";").map((J) => J.trim()).join("; ");
          if (MediaSource.isTypeSupported(R) || (R = 'video/mp4; codecs="hvc1"'), MediaSource.isTypeSupported(R) || (R = 'video/mp4; codecs="avc1.640028"'), !MediaSource.isTypeSupported(R)) {
            console.error("No supported MSE codec"), d("error"), r == null || r();
            return;
          }
          const H = new MediaSource();
          if (y = URL.createObjectURL(H), m.src = y, await new Promise(
            (J) => H.addEventListener("sourceopen", () => J(), { once: !0 })
          ), p) return;
          const G = H.addSourceBuffer(R);
          g = N.body.getReader();
          const $ = [], P = () => {
            if ($.length > 0 && !G.updating && H.readyState === "open") {
              const J = $.shift();
              G.appendBuffer(J.buffer);
            }
          };
          G.addEventListener("updateend", P);
          let X = !1;
          for (; !p; ) {
            const { done: J, value: ne } = await g.read();
            if (J || !ne) break;
            G.updating || $.length > 0 ? $.push(ne) : G.appendBuffer(ne.buffer), X || (X = !0, m.playbackRate = a, m.play().catch(() => {
            }));
          }
        } catch (N) {
          p || (console.error("Playback MSE error:", N), d("error"), r == null || r());
        }
    }
    const b = () => {
      p || d("playing");
    }, S = () => {
      p || (console.error("Playback video error:", m.error), d("error"), r == null || r());
    };
    return m.addEventListener("playing", b), m.addEventListener("error", S), x(), () => {
      p = !0, m.removeEventListener("playing", b), m.removeEventListener("error", S), g == null || g.cancel().catch(() => {
      }), m.pause(), m.removeAttribute("src"), m.load(), y && URL.revokeObjectURL(y);
    };
  }, [r]), /* @__PURE__ */ o.jsxs("div", { className: "relative w-full h-full bg-black rounded-lg overflow-hidden", children: [
    /* @__PURE__ */ o.jsx(
      "video",
      {
        ref: u,
        autoPlay: !0,
        playsInline: !0,
        muted: !0,
        className: `w-full h-full object-contain transition-opacity duration-300 ${f === "playing" ? "opacity-100" : "opacity-0"}`
      }
    ),
    f === "connecting" && /* @__PURE__ */ o.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2", children: [
      /* @__PURE__ */ o.jsx($s, { className: "h-8 w-8 animate-spin" }),
      /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "Connecting to recording..." })
    ] }),
    f === "error" && /* @__PURE__ */ o.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2", children: [
      /* @__PURE__ */ o.jsx(Wo, { className: "h-8 w-8" }),
      /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "Playback failed" })
    ] })
  ] });
}
function Nw({
  segments: a,
  date: s,
  selectedTime: r,
  onSelectTime: u
}) {
  const f = D.useRef(null), d = 24, m = (/* @__PURE__ */ new Date(`${s}T00:00:00`)).getTime(), p = m + d * 36e5, y = (S) => (new Date(S.replace(" ", "T")).getTime() - m) / (p - m) * 100, g = (() => {
    if (!r) return 0;
    const S = new Date(r.replace(" ", "T")).getTime();
    return Math.max(0, Math.min(100, (S - m) / (p - m) * 100));
  })(), x = (S) => {
    if (!f.current) return;
    const N = f.current.getBoundingClientRect(), z = (S.clientX - N.left) / N.width, R = m + z * (p - m), H = new Date(R), G = (P) => String(P).padStart(2, "0"), $ = `${s} ${G(H.getHours())}:${G(H.getMinutes())}:${G(H.getSeconds())}`;
    u($);
  }, b = D.useMemo(() => {
    const S = [];
    for (let N = 0; N < 24; N += 3)
      S.push(
        /* @__PURE__ */ o.jsx(
          "span",
          {
            className: "absolute text-[9px] text-white/50 -bottom-4",
            style: { left: `${N / 24 * 100}%`, transform: "translateX(-50%)" },
            children: N === 0 ? "12a" : N < 12 ? `${N}a` : N === 12 ? "12p" : `${N - 12}p`
          },
          N
        )
      );
    return S;
  }, []);
  return /* @__PURE__ */ o.jsxs("div", { className: "relative px-1 pt-1 pb-5", children: [
    /* @__PURE__ */ o.jsxs(
      "div",
      {
        ref: f,
        className: "relative w-full h-5 bg-white/15 rounded cursor-pointer border border-white/20 overflow-hidden",
        onClick: x,
        children: [
          a.map((S, N) => {
            const z = Math.max(0, y(S.start)), R = Math.min(100, y(S.end));
            return /* @__PURE__ */ o.jsx(
              "div",
              {
                className: "absolute top-0 bottom-0 bg-blue-400/50",
                style: { left: `${z}%`, width: `${R - z}%` }
              },
              N
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
    b
  ] });
}
function Mw() {
  return af ? /* @__PURE__ */ o.jsxs("div", { className: "aspect-video rounded-lg border border-border bg-black flex flex-col items-center justify-center text-muted-foreground gap-2 px-4 text-center", children: [
    /* @__PURE__ */ o.jsx(Wo, { className: "h-8 w-8" }),
    /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "Playback requires local or Tailscale access" }),
    /* @__PURE__ */ o.jsx("span", { className: "text-xs opacity-60", children: "Nabu Casa can only proxy live feeds, not DVR recordings" })
  ] }) : /* @__PURE__ */ o.jsx(Tw, {});
}
function Tw() {
  var Me;
  const [a, s] = D.useState(1), [r, u] = D.useState(() => {
    const K = /* @__PURE__ */ new Date(), ve = (A) => String(A).padStart(2, "0");
    return `${K.getFullYear()}-${ve(K.getMonth() + 1)}-${ve(K.getDate())}`;
  }), [f, d] = D.useState([]), [m, p] = D.useState(""), [y, g] = D.useState(null), [x, b] = D.useState(!1), [S, N] = D.useState(1), [z, R] = D.useState(!1), [H, G] = D.useState(null), [$, P] = D.useState(!0), X = D.useRef(void 0), J = D.useCallback(() => {
    P(!0), clearTimeout(X.current), y && !z && (X.current = setTimeout(() => P(!1), 3e3));
  }, [y, z]);
  D.useEffect(() => {
    !y || z || x ? (P(!0), clearTimeout(X.current)) : J();
  }, [y, z, x, J]), D.useEffect(() => () => clearTimeout(X.current), []), D.useEffect(() => {
    Gs(`/api/date-range?channel=${a}`).then((K) => {
      K.min_date && K.max_date && G({
        min: K.min_date.slice(0, 10),
        max: K.max_date.slice(0, 10)
      });
    }).catch(() => {
    });
  }, [a]), D.useEffect(() => {
    d([]), g(null), b(!0), Gs(`/api/timeline?channel=${a}&date=${r}`).then(async (K) => {
      const ve = K.segments || [];
      if (d(ve), ve.length) {
        const A = ve[0].start;
        p(A);
        const q = new Date(A.replace(" ", "T")).getTime();
        let W = ve[0].end;
        if (!W) {
          const he = new Date(q + 18e5), me = (_) => String(_).padStart(2, "0");
          W = `${r} ${me(he.getHours())}:${me(he.getMinutes())}:${me(he.getSeconds())}`;
        }
        try {
          await Gs("/api/playback/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channel: a, startTime: A, endTime: W, speed: S })
          }), g(Date.now());
        } catch (he) {
          console.error("Auto-playback start error:", he);
        }
      }
      b(!1);
    }).catch(() => {
      b(!1);
    });
  }, [r, a]);
  const ne = () => {
    const K = new Date(r);
    K.setDate(K.getDate() - 1);
    const ve = K.toISOString().slice(0, 10);
    (!H || ve >= H.min) && (u(ve), p(""));
  }, Z = () => {
    const K = new Date(r);
    K.setDate(K.getDate() + 1);
    const ve = K.toISOString().slice(0, 10);
    (!H || ve <= H.max) && (u(ve), p(""));
  }, ee = async (K, ve) => {
    const A = K ?? m, q = S;
    if (!A) return;
    b(!0), g(null);
    const W = new Date(A.replace(" ", "T")).getTime();
    let he = "";
    for (const me of f) {
      const _ = new Date(me.start.replace(" ", "T")).getTime(), O = new Date(me.end.replace(" ", "T")).getTime();
      if (W >= _ && W < O) {
        he = me.end;
        break;
      }
    }
    if (!he) {
      const me = new Date(W + 18e5), _ = (O) => String(O).padStart(2, "0");
      he = `${r} ${_(me.getHours())}:${_(me.getMinutes())}:${_(me.getSeconds())}`;
    }
    try {
      await Gs("/api/playback/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: a, startTime: A, endTime: he, speed: q })
      }), g(Date.now());
    } catch (me) {
      console.error("Playback start error:", me);
    } finally {
      b(!1);
    }
  }, ge = () => {
    g(null), R(!1), Gs("/api/playback/stop", { method: "POST" }).catch(() => {
    });
  }, _e = (K) => {
    p(K), y && ee(K);
  }, ce = (K) => {
    N(K);
  }, oe = ((Me = Vo.find((K) => K.channel === a)) == null ? void 0 : Me.label) ?? `Ch ${a}`;
  return /* @__PURE__ */ o.jsxs(
    "div",
    {
      className: "relative aspect-video rounded-lg overflow-hidden border border-border bg-black",
      onMouseMove: J,
      onTouchStart: J,
      children: [
        y ? /* @__PURE__ */ o.jsx(
          jw,
          {
            speed: S,
            paused: z,
            onError: ge
          },
          y
        ) : /* @__PURE__ */ o.jsx("div", { className: "w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2", children: x ? /* @__PURE__ */ o.jsxs(o.Fragment, { children: [
          /* @__PURE__ */ o.jsx($s, { className: "h-8 w-8 animate-spin" }),
          /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "Loading..." })
        ] }) : f.length === 0 ? /* @__PURE__ */ o.jsxs("span", { className: "text-sm", children: [
          "No recordings for ",
          r
        ] }) : /* @__PURE__ */ o.jsxs(o.Fragment, { children: [
          /* @__PURE__ */ o.jsx(wo, { className: "h-8 w-8 opacity-40" }),
          /* @__PURE__ */ o.jsx("span", { className: "text-sm", children: "Select a time on the timeline" })
        ] }) }),
        /* @__PURE__ */ o.jsxs(
          "div",
          {
            className: `absolute inset-0 flex flex-col justify-between transition-opacity duration-500 ${$ ? "opacity-100" : "opacity-0 pointer-events-none"}`,
            onClick: (K) => {
              K.target === K.currentTarget && ($ && y && !z ? (P(!1), clearTimeout(X.current)) : J());
            },
            children: [
              /* @__PURE__ */ o.jsx("div", { className: "bg-gradient-to-b from-black/80 via-black/50 to-transparent px-3 py-2.5", children: /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ o.jsx("div", { className: "flex gap-1", children: Vo.map((K) => /* @__PURE__ */ o.jsx(
                  "button",
                  {
                    onClick: () => {
                      s(K.channel), g(null);
                    },
                    className: `px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${a === K.channel ? "bg-white/25 text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`,
                    children: K.label
                  },
                  K.channel
                )) }),
                /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-1 ml-auto", children: [
                  /* @__PURE__ */ o.jsx("button", { onClick: ne, className: "p-1 rounded-md hover:bg-white/10 text-white/80 transition-colors", children: /* @__PURE__ */ o.jsx(Ev, { className: "h-4 w-4" }) }),
                  /* @__PURE__ */ o.jsx(
                    "input",
                    {
                      type: "date",
                      value: r,
                      min: H == null ? void 0 : H.min,
                      max: H == null ? void 0 : H.max,
                      onChange: (K) => {
                        u(K.target.value), p("");
                      },
                      className: "bg-white/10 border border-white/20 rounded-md px-2 py-0.5 text-xs text-white [color-scheme:dark]"
                    }
                  ),
                  /* @__PURE__ */ o.jsx("button", { onClick: Z, className: "p-1 rounded-md hover:bg-white/10 text-white/80 transition-colors", children: /* @__PURE__ */ o.jsx(Av, { className: "h-4 w-4" }) })
                ] })
              ] }) }),
              /* @__PURE__ */ o.jsxs("div", { className: "bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 pb-2.5 pt-6", children: [
                /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                  y ? /* @__PURE__ */ o.jsx(
                    "button",
                    {
                      onClick: () => R((K) => !K),
                      className: "flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors",
                      children: z ? /* @__PURE__ */ o.jsx(wo, { className: "h-4 w-4 ml-0.5" }) : /* @__PURE__ */ o.jsx(qv, { className: "h-4 w-4" })
                    }
                  ) : /* @__PURE__ */ o.jsx(
                    "button",
                    {
                      onClick: () => ee(),
                      disabled: x || !m,
                      className: "flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors disabled:opacity-30",
                      children: x ? /* @__PURE__ */ o.jsx($s, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ o.jsx(wo, { className: "h-4 w-4 ml-0.5" })
                    }
                  ),
                  y && /* @__PURE__ */ o.jsx(
                    "button",
                    {
                      onClick: ge,
                      className: "px-2 py-1 rounded text-xs font-medium text-red-400 bg-red-500/20 hover:bg-red-500/30 transition-colors",
                      children: "Stop"
                    }
                  ),
                  m && /* @__PURE__ */ o.jsxs("span", { className: "text-xs text-white/70", children: [
                    oe,
                    " · ",
                    m.slice(11)
                  ] }),
                  /* @__PURE__ */ o.jsx("div", { className: "flex items-center gap-0.5 ml-auto", children: [1, 2, 4, 8].map((K) => /* @__PURE__ */ o.jsxs(
                    "button",
                    {
                      onClick: () => ce(K),
                      className: `px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${S === K ? "bg-white/25 text-white" : "text-white/50 hover:text-white hover:bg-white/10"}`,
                      children: [
                        K,
                        "x"
                      ]
                    },
                    K
                  )) })
                ] }),
                f.length > 0 && /* @__PURE__ */ o.jsx(
                  Nw,
                  {
                    segments: f,
                    date: r,
                    selectedTime: m,
                    onSelectTime: _e
                  }
                )
              ] })
            ]
          }
        )
      ]
    }
  );
}
function rg() {
  const [a, s] = D.useState(null), [r, u] = D.useState("live"), [f, d] = D.useState(Xo ? "main" : "sub");
  return /* @__PURE__ */ o.jsxs(Il, { title: "Cameras", children: [
    /* @__PURE__ */ o.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
      /* @__PURE__ */ o.jsxs(
        "button",
        {
          onClick: () => u("live"),
          className: `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${r === "live" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`,
          children: [
            /* @__PURE__ */ o.jsx(Gv, { className: "h-4 w-4" }),
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
            /* @__PURE__ */ o.jsx(Hv, { className: "h-4 w-4" }),
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
        children: Vo.map((m) => {
          const p = a === m.stream, y = a !== null && !p;
          return /* @__PURE__ */ o.jsx(
            Sw,
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
    r === "playback" && /* @__PURE__ */ o.jsx(Mw, {})
  ] });
}
const cg = {
  home: Mp,
  power: X2,
  climate: $2,
  water: aw,
  van: dw,
  system: vw,
  cameras: rg
}, Ew = [
  { id: "home", label: "Home", icon: mp },
  { id: "power", label: "Power", icon: ai },
  { id: "climate", label: "Climate", icon: li },
  { id: "water", label: "Water", icon: Va },
  { id: "van", label: "Van", icon: Jv },
  { id: "cameras", label: "Cameras", icon: Tv },
  { id: "system", label: "System", icon: Vv }
];
function $0() {
  const a = window.location.hash.slice(1);
  return a && a in cg ? a : "home";
}
function Aw({ navigate: a }) {
  const s = ti(), r = D.useRef(!1);
  return D.useEffect(() => s.subscribeEntity("binary_sensor.vehicle_is_moving", () => {
    const u = s.getEntity("binary_sensor.vehicle_is_moving"), f = (u == null ? void 0 : u.state) === "on";
    f && !r.current && a("van"), r.current = f;
  }), [s, a]), null;
}
function Cw() {
  const [a, s] = D.useState(!1);
  return D.useEffect(() => {
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
function zw() {
  const a = Cw(), [s, r] = D.useState($0);
  D.useEffect(() => {
    const d = () => r($0());
    return window.addEventListener("hashchange", d), () => window.removeEventListener("hashchange", d);
  }, []);
  const u = D.useCallback((d) => {
    window.location.hash = d, r(d);
  }, []), f = cg[s] ?? Mp;
  return /* @__PURE__ */ o.jsxs(R1, { children: [
    /* @__PURE__ */ o.jsx(Aw, { navigate: u }),
    /* @__PURE__ */ o.jsx("div", { className: `van-dash-root ${a ? "dark" : ""}`, style: { position: "relative" }, children: /* @__PURE__ */ o.jsx(Pv, { children: /* @__PURE__ */ o.jsxs("div", { className: "h-screen flex flex-col bg-background text-foreground", children: [
      /* @__PURE__ */ o.jsx("nav", { className: "flex-none border-b border-border bg-card/80 backdrop-blur-sm", children: /* @__PURE__ */ o.jsx("div", { className: "flex items-center gap-1 px-2 h-11 overflow-x-auto", children: Ew.map(({ id: d, label: m, icon: p }) => /* @__PURE__ */ o.jsxs(
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
        /* @__PURE__ */ o.jsx("div", { className: s === "cameras" ? "" : "hidden", children: /* @__PURE__ */ o.jsx(rg, {}) }),
        s !== "cameras" && /* @__PURE__ */ o.jsx(f, {})
      ] })
    ] }) }) })
  ] });
}
const Ow = 1, Vr = 2, Co = 3, kw = 4, Dw = 5;
function Rw(a) {
  return {
    type: "auth",
    access_token: a
  };
}
function Hw() {
  return {
    type: "supported_features",
    id: 1,
    // Always the first message after auth
    features: { coalesce_messages: 1 }
  };
}
function Uw() {
  return {
    type: "get_states"
  };
}
function Lw(a, s, r, u, f) {
  const d = {
    type: "call_service",
    domain: a,
    service: s,
    target: u,
    return_response: f
  };
  return r && (d.service_data = r), d;
}
function Bw(a) {
  const s = {
    type: "subscribe_events"
  };
  return a && (s.event_type = a), s;
}
function W0(a) {
  return {
    type: "unsubscribe_events",
    subscription: a
  };
}
function qw() {
  return {
    type: "ping"
  };
}
function Yw(a, s) {
  return {
    type: "result",
    success: !1,
    error: {
      code: a,
      message: s
    }
  };
}
const ug = (a, s, r, u) => {
  const [f, d, m] = a.split(".", 3);
  return Number(f) > s || Number(f) === s && (u === void 0 ? Number(d) >= r : Number(d) > r) || u !== void 0 && Number(f) === s && Number(d) === r && Number(m) >= u;
}, Gw = "auth_invalid", Vw = "auth_ok";
function Xw(a) {
  if (!a.auth)
    throw kw;
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
        p(Vr);
        return;
      }
      if (d === 0) {
        p(Ow);
        return;
      }
      const N = d === -1 ? -1 : d - 1;
      setTimeout(() => f(N, m, p), 1e3);
    }, b = async (N) => {
      try {
        s.expired && await (r || s.refreshAccessToken()), y.send(JSON.stringify(Rw(s.accessToken)));
      } catch (z) {
        g = z === Vr, y.close();
      }
    }, S = async (N) => {
      const z = JSON.parse(N.data);
      switch (z.type) {
        case Gw:
          g = !0, y.close();
          break;
        case Vw:
          y.removeEventListener("open", b), y.removeEventListener("message", S), y.removeEventListener("close", x), y.removeEventListener("error", x), y.haVersion = z.ha_version, ug(y.haVersion, 2022, 9) && y.send(JSON.stringify(Hw())), m(y);
          break;
      }
    };
    y.addEventListener("open", b), y.addEventListener("message", S), y.addEventListener("close", x), y.addEventListener("error", x);
  }
  return new Promise((d, m) => f(a.setupRetry, d, m));
}
class Qw {
  constructor(s, r) {
    this._handleMessage = (u) => {
      let f = JSON.parse(u.data);
      Array.isArray(f) || (f = [f]), f.forEach((d) => {
        const m = this.commands.get(d.id);
        switch (d.type) {
          case "event":
            m ? m.callback(d.event) : (console.warn(`Received event for unknown subscription ${d.id}. Unsubscribing.`), this.sendMessagePromise(W0(d.id)).catch((p) => {
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
        "subscribe" in m || m.reject(Yw(Co, "Connection lost"));
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
                  g.reject && g.reject(Co);
              }
              p === Vr ? this.fireEvent("reconnect-error", p) : d(m + 1);
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
    return this.subscribeMessage(s, Bw(r));
  }
  ping() {
    return this.sendMessagePromise(qw());
  }
  sendMessage(s, r) {
    if (!this.connected)
      throw Co;
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
          this.connected && await this.sendMessagePromise(W0(p)), this.commands.delete(p);
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
const Zw = (a) => a * 1e3 + Date.now();
async function Kw(a, s, r) {
  const u = typeof location < "u" && location;
  if (u && u.protocol === "https:") {
    const p = document.createElement("a");
    if (p.href = a, p.protocol === "http:" && p.hostname !== "localhost")
      throw Dw;
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
    throw d.status === 400 || d.status === 403 ? Vr : new Error("Unable to fetch tokens");
  const m = await d.json();
  return m.hassUrl = a, m.clientId = s, m.expires = Zw(m.expires_in), m;
}
class Jw {
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
    const s = await Kw(this.data.hassUrl, this.data.clientId, {
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
function s5(a, s) {
  return new Jw({
    hassUrl: a,
    clientId: null,
    expires: Date.now() + 1e11,
    refresh_token: "",
    access_token: s,
    expires_in: 1e11
  });
}
const $w = (a) => {
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
}, Ww = 5e3, F0 = (a, s, r, u, f = { unsubGrace: !0 }) => {
  if (a[s])
    return a[s];
  let d = 0, m, p, y = $w();
  const g = () => {
    if (!r)
      throw new Error("Collection does not support refresh");
    return r(a).then((R) => y.setState(R, !0));
  }, x = () => g().catch((R) => {
    if (a.connected)
      throw R;
  }), b = () => {
    if (p !== void 0) {
      clearTimeout(p), p = void 0;
      return;
    }
    u && (m = u(a, y)), r && (a.addEventListener("ready", x), x()), a.addEventListener("disconnected", z);
  }, S = () => {
    p = void 0, m && m.then((R) => {
      R();
    }), y.clearState(), a.removeEventListener("ready", g), a.removeEventListener("disconnected", z);
  }, N = () => {
    p = setTimeout(S, Ww);
  }, z = () => {
    p && (clearTimeout(p), S());
  };
  return a[s] = {
    get state() {
      return y.state;
    },
    refresh: g,
    subscribe(R) {
      d++, d === 1 && b();
      const H = y.subscribe(R);
      return y.state !== void 0 && setTimeout(() => R(y.state), 0), () => {
        H(), d--, d || (f.unsubGrace ? N() : S());
      };
    }
  }, a[s];
}, Fw = (a) => a.sendMessagePromise(Uw()), i5 = (a, s, r, u, f, d) => a.sendMessagePromise(Lw(s, r, u, f, d));
function Iw(a, s) {
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
const Pw = (a, s) => a.subscribeMessage((r) => Iw(s, r), {
  type: "subscribe_entities"
});
function e5(a, s) {
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
async function t5(a) {
  const s = await Fw(a), r = {};
  for (let u = 0; u < s.length; u++) {
    const f = s[u];
    r[f.entity_id] = f;
  }
  return r;
}
const n5 = (a, s) => a.subscribeEvents((r) => e5(s, r), "state_changed"), l5 = (a) => ug(a.haVersion, 2022, 4, 0) ? F0(a, "_ent", void 0, Pw) : F0(a, "_ent", t5, n5), r5 = (a, s) => l5(a).subscribe(s);
async function c5(a) {
  const s = Object.assign({ setupRetry: 0, createSocket: Xw }, a), r = await s.createSocket(s);
  return new Qw(r, s);
}
function u5(a) {
  const s = D1.createRoot(a);
  return s.render(/* @__PURE__ */ o.jsx(zw, {})), () => s.unmount();
}
export {
  i5 as callService,
  c5 as createConnection,
  s5 as createLongLivedTokenAuth,
  u5 as mount,
  r5 as subscribeEntities
};
