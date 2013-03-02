/*
 * Copyright 2011-2013, CircuitHub.com
 */
var morpheus = morpheus || {}; /* Redeclaring morpheus is fine: behaves like a no-op (https://developer.mozilla.org/en/JavaScript/Reference/Scope_Cheatsheet) */

morpheus.api = 
// Generated by CoffeeScript 1.4.0
(function() {
  var exports,
    __slice = [].slice;

  (function() {
    var Api, Dispatcher, MorpheusExpression, dispatch, extend, morpheusPrimitiveTypeof, morpheusTypeof, varCons;
    extend = function(obj, mixin) {
      var method, name;
      for (name in mixin) {
        method = mixin[name];
        obj[name] = method;
      }
      return obj;
    };
    morpheusTypeof = function(value) {
      if (Array.isArray(value)) {
        if (value.length <= 4) {
          return "vec" + value.length;
        } else {
          throw "Parameter type with length `" + value.length + "` is not supported.";
        }
      } else {
        return 'float';
      }
    };
    morpheusPrimitiveTypeof = function(value) {
      if ((Array.isArray(value)) && value.length > 0) {
        return morpheusPrimitiveTypeof(value[0]);
      } else {
        switch (typeof value) {
          case 'real':
            return 'float';
          default:
            throw "Unknown parameter type `" + (typeof value) + "`.";
        }
      }
    };
    varCons = function(args, datatype) {
      var result;
      result = Array.prototype.slice.call(args, 0);
      result._tag = datatype;
      return result;
    };
    Dispatcher = function() {};
    dispatch = new Dispatcher;
    Api = function(f) {
      return function() {
        var obj;
        obj = extend(Object.create(dispatch), f.apply(null, arguments));
        if ((typeof this !== "undefined" && this !== null) && this instanceof Dispatcher) {
          obj.nodes.unshift(this);
        }
        return obj;
      };
    };
    extend(dispatch, {
      union: Api(function() {
        var nodes;
        nodes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return {
          type: 'union',
          nodes: nodes
        };
      }),
      intersect: Api(function() {
        var nodes;
        nodes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return {
          type: 'intersect',
          nodes: nodes
        };
      }),
      difference: Api(function() {
        var nodes;
        nodes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return {
          type: 'difference',
          nodes: nodes
        };
      }),
      box: Api(function() {
        var attr, nodes;
        attr = arguments[0], nodes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return {
          type: 'box',
          attr: attr,
          nodes: nodes
        };
      }),
      cylinder: Api(function() {
        var attr, nodes;
        attr = arguments[0], nodes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return {
          type: 'cylinder',
          attr: attr,
          nodes: nodes
        };
      }),
      sphere: Api(function() {
        var attr, nodes;
        attr = arguments[0], nodes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return {
          type: 'sphere',
          attr: attr,
          nodes: nodes
        };
      }),
      mirror: Api(function() {
        var attr, nodes;
        attr = arguments[0], nodes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return {
          type: 'mirror',
          attr: attr,
          nodes: nodes
        };
      }),
      repeat: Api(function() {
        var attr, nodes;
        attr = arguments[0], nodes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return {
          type: 'repeat',
          attr: attr,
          nodes: nodes
        };
      }),
      translate: Api(function() {
        var attr, nodes;
        attr = arguments[0], nodes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return {
          type: 'translate',
          attr: attr,
          nodes: nodes
        };
      }),
      rotate: Api(function() {
        var attr, nodes;
        attr = arguments[0], nodes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return {
          type: 'rotate',
          attr: attr,
          nodes: nodes
        };
      }),
      scale: Api(function() {
        var attr, nodes;
        attr = arguments[0], nodes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return {
          type: 'scale',
          attr: attr,
          nodes: nodes
        };
      }),
      material: Api(function() {
        var attr, nodes;
        attr = arguments[0], nodes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return {
          type: 'material',
          attr: attr,
          nodes: nodes
        };
      }),
      chamfer: Api(function() {
        var attr, nodes;
        attr = arguments[0], nodes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return {
          type: 'chamfer',
          attr: attr,
          nodes: nodes
        };
      }),
      bevel: Api(function() {
        var attr, nodes;
        attr = arguments[0], nodes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return {
          type: 'bevel',
          attr: attr,
          nodes: nodes
        };
      }),
      wedge: Api(function() {
        var attr, nodes;
        attr = arguments[0], nodes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return {
          type: 'wedge',
          attr: attr,
          nodes: nodes
        };
      }),
      bend: Api(function() {
        var attr, nodes;
        attr = arguments[0], nodes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return {
          type: 'bend',
          attr: attr,
          nodes: nodes
        };
      })
    });
    window.scene = function() {
      var attr, nodes, serializeAttr, serializeNodes;
      attr = arguments[0], nodes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      serializeAttr = function(attr) {
        var i, key, val, _i, _ref;
        if (attr instanceof MorpheusExpression) {
          return attr.serialize();
        } else if (Array.isArray(attr)) {
          for (i = _i = 0, _ref = attr.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
            attr[i] = serializeAttr(attr[i]);
          }
        } else if (typeof attr === 'object') {
          for (key in attr) {
            val = attr[key];
            attr[key] = serializeAttr(val);
          }
        }
        return attr;
      };
      serializeNodes = function(nodes) {
        var n, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = nodes.length; _i < _len; _i++) {
          n = nodes[_i];
          _results.push({
            type: n.type,
            attr: serializeAttr(n.attr),
            nodes: serializeNodes(n.nodes)
          });
        }
        return _results;
      };
      return {
        type: 'scene',
        attr: attr,
        nodes: serializeNodes(nodes)
      };
    };
    extend(window, dispatch);
    /*
      class MorpheusParameter
        constructor: (attr) ->
          @attr = attr
          @str = "u#{attr.paramIndex}"
          exportedParameters[this.str] = attr
    */

    MorpheusExpression = (function() {

      function MorpheusExpression(param, str, primitiveType) {
        this.param = param;
        this.str = new String(str);
        this.primitiveType = primitiveType;
      }

      MorpheusExpression.prototype.serialize = function() {
        return this.str;
      };

      MorpheusExpression.prototype.update = function(str) {
        return new MorpheusExpression(this.param, str);
      };

      MorpheusExpression.prototype.index = function(arg) {
        if (arg instanceof MorpheusExpression) {
          return this.update("(" + (this.serialize()) + ")[" + (arg.serialize()) + "]");
        } else if (typeof arg === 'number' && (arg | 0) === arg) {
          return this.update("" + (this.serialize()) + "[" + arg + "]");
        } else {
          throw "Argument to index must be an integer";
        }
      };

      MorpheusExpression.prototype.mul = function(arg) {
        if (arg instanceof MorpheusExpression) {
          return this.update("(" + (this.serialize()) + ") * (" + (arg.serialize()) + ")");
        } else if (this.primitiveType === 'float' && typeof arg === 'number' && (arg | 0) === arg) {
          return this.update("(" + (this.serialize()) + ") * " + arg + ".0");
        } else {
          return this.update("(" + (this.serialize()) + ") * " + arg);
        }
      };

      MorpheusExpression.prototype.div = function(arg) {
        if (arg instanceof MorpheusExpression) {
          return this.update("(" + (this.serialize()) + ") / (" + (arg.serialize()) + ")");
        } else if (this.primitiveType === 'float' && typeof arg === 'number' && (arg | 0) === arg) {
          return this.update("(" + (this.serialize()) + ") / " + arg + ".0");
        } else {
          return this.update("(" + (this.serialize()) + ") / " + arg);
        }
      };

      MorpheusExpression.prototype.add = function(arg) {
        if (arg instanceof MorpheusExpression) {
          return this.update("(" + (this.serialize()) + ") + (" + (arg.serialize()) + ")");
        } else if (this.primitiveType === 'float' && typeof arg === 'number' && (arg | 0) === arg) {
          return this.update("(" + (this.serialize()) + ") + " + arg + ".0");
        } else {
          return this.update("(" + (this.serialize()) + ") + " + arg);
        }
      };

      MorpheusExpression.prototype.sub = function(arg) {
        if (arg instanceof MorpheusExpression) {
          return this.update("(" + (this.serialize()) + ") - (" + (arg.serialize()) + ")");
        } else if (this.primitiveType === 'float' && typeof arg === 'number' && (arg | 0) === arg) {
          return this.update("(" + (this.serialize()) + ") - " + arg + ".0");
        } else {
          return this.update("(" + (this.serialize()) + ") - " + arg);
        }
      };

      MorpheusExpression.prototype.neg = function() {
        return this.update("-(" + (this.serialize()) + ")");
      };

      return MorpheusExpression;

    })();
    return (function() {
      var globalParamIndex, mul, sub, varConsSimple;
      globalParamIndex = 0;
      mul = function(a, b) {
        var i, result, _i, _j, _ref, _ref1;
        if ((Array.isArray(a)) && (Array.isArray(b))) {
          if (a.length !== b.length) {
            throw "No product operator available for arrays of different lengths.";
          }
          if (a.length > 4) {
            throw "No product operator available for arrays of lengths greater than 4.";
          }
          result = 0.0;
          for (i = _i = 0, _ref = a.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
            result += a[i] * b[i];
          }
          return result;
        } else if (Array.isArray(a)) {
          result = a.slice(0);
          for (i = _j = 0, _ref1 = a.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
            result[i] *= b;
          }
          return result;
        } else if (typeof a === 'number' && typeof b === 'number') {
          return a * b;
        } else {
          throw "No product operator available operands with types `" + (typeof a) + "` and `" + (typeof b) + "`.";
        }
      };
      sub = function(a, b) {
        var i, result, _i, _ref;
        if ((Array.isArray(a)) && (Array.isArray(b))) {
          if (a.length !== b.length) {
            throw "No subtract operator available for arrays of different lengths.";
          }
          if (a.length > 4) {
            throw "No subtract operator available for arrays of lengths greater than 4.";
          }
          result = a.slice(0);
          for (i = _i = 0, _ref = a.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
            result[i] -= b[i];
          }
          return result;
        } else if (typeof a === 'number' && typeof b === 'number') {
          return a - b;
        } else {
          throw "No subtract operator available operands with types `" + (typeof a) + "` and `" + (typeof b) + "`.";
        }
      };
      varConsSimple = function() {
        var args, param, paramStr, primitiveType, type;
        type = arguments[0], primitiveType = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        param = varCons(args, type);
        paramStr = "u" + globalParamIndex;
        ++globalParamIndex;
        exportedParameters[paramStr] = param;
        return new MorpheusExpression(param, paramStr, primitiveType);
      };
      window.real = function(id, meta, defaultValue) {
        return varConsSimple.apply(null, ['real', 'float'].concat(__slice.call(arguments)));
      };
      window.dimension1 = function(id, meta, defaultValue) {
        return varConsSimple.apply(null, ['dimension1', 'float'].concat(__slice.call(arguments)));
      };
      window.dimension2 = function(id, meta, defaultValue) {
        return varConsSimple.apply(null, ['dimension2', 'float'].concat(__slice.call(arguments)));
      };
      window.dimension3 = function(id, meta, defaultValue) {
        return varConsSimple.apply(null, ['dimension3', 'float'].concat(__slice.call(arguments)));
      };
      window.vector2 = function(id, meta, defaultValue) {
        return varConsSimple.apply(null, ['vector2', 'float'].concat(__slice.call(arguments)));
      };
      window.vector3 = function(id, meta, defaultValue) {
        return varConsSimple.apply(null, ['vector3', 'float'].concat(__slice.call(arguments)));
      };
      window.point2 = function(id, meta, defaultValue) {
        return varConsSimple.apply(null, ['point2', 'float'].concat(__slice.call(arguments)));
      };
      window.point3 = function(id, meta, defaultValue) {
        return varConsSimple.apply(null, ['point3', 'float'].concat(__slice.call(arguments)));
      };
      window.pitch1 = function(id, meta, defaultValue) {
        return varConsSimple.apply(null, ['pitch1', 'float'].concat(__slice.call(arguments)));
      };
      window.pitch2 = function(id, meta, defaultValue) {
        return varConsSimple.apply(null, ['pitch2', 'float'].concat(__slice.call(arguments)));
      };
      window.pitch3 = function(id, meta, defaultValue) {
        return varConsSimple.apply(null, ['pitch3', 'float'].concat(__slice.call(arguments)));
      };
      window.angle = function(id, meta, defaultValue) {
        return varConsSimple.apply(null, ['angle', 'float'].concat(__slice.call(arguments)));
      };
      window.polar = function(id, meta, defaultValue) {
        return varConsSimple.apply(null, ['polar', 'float'].concat(__slice.call(arguments)));
      };
      window.cylindrical = function(id, meta, defaultValue) {
        return varConsSimple.apply(null, ['cylindrical', 'float'].concat(__slice.call(arguments)));
      };
      window.spherical = function(id, meta, defaultValue) {
        return varConsSimple.apply(null, ['spherical', 'float'].concat(__slice.call(arguments)));
      };
      window.natural = function(id, meta, defaultValue) {
        return varConsSimple.apply(null, ['natural', 'float'].concat(__slice.call(arguments)));
      };
      window.latice1 = function(id, meta, defaultValue) {
        return varConsSimple.apply(null, ['latice1', 'float'].concat(__slice.call(arguments)));
      };
      window.latice2 = function(id, meta, defaultValue) {
        return varConsSimple.apply(null, ['latice2', 'float'].concat(__slice.call(arguments)));
      };
      window.latice3 = function(id, meta, defaultValue) {
        return varConsSimple.apply(null, ['latice3', 'float'].concat(__slice.call(arguments)));
      };
      window.option = function(id, meta, options, defaultOption) {
        var param, paramStr;
        param = varCons(arguments, "option");
        paramStr = "u" + globalParamIndex;
        ++globalParamIndex;
        exportedParameters[paramStr] = param;
        throw "Option is not supported yet";
        return new MorpheusExpression(param, paramStr, void 0);
      };
      window.boolean = function(id, meta, defaultValue) {
        var param, paramStr;
        param = varCons(arguments, "boolean");
        paramStr = "u" + globalParamIndex;
        ++globalParamIndex;
        exportedParameters[paramStr] = param;
        throw "Boolean is not supported yet";
        return new MorpheusExpression(param, paramStr, void 0);
      };
      return window.range = function(id, meta, defaultValue, range) {
        var param, paramStr;
        param = varCons(arguments, "range");
        paramStr = "u" + globalParamIndex;
        ++globalParamIndex;
        exportedParameters[paramStr] = param;
        return new MorpheusExpression(param, paramStr, 'float');
      };
    })();
  })();

  exports = exports != null ? exports : {};

  return exports;

}).call(this);