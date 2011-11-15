/*
 * Copyright 2011, CircuitHub.com
 */
"use strict";

(function() {
  var apiInit, asm, canvasInit, collectASM, compileASM, compileCSM, compileGLSL, constants, controlsInit, controlsSourceCompile, glslLibrary, keyDown, lookAtToQuaternion, mapASM, mapCollectASM, mecha, modifySubAttr, mouseCoordsWithinElement, mouseDown, mouseMove, mouseUp, mouseWheel, optimizeASM, orbitLookAt, orbitLookAtNode, recordToVec3, recordToVec4, registerControlEvents, registerDOMEvents, sceneIdle, sceneInit, state, vec3ToRecord, vec4ToRecord, windowResize, zoomLookAt, zoomLookAtNode;
  var __slice = Array.prototype.slice;
  modifySubAttr = function(node, attr, subAttr, value) {
    var attrRecord;
    attrRecord = node.get(attr);
    attrRecord[subAttr] = value;
    return node.set(attr, attrRecord);
  };
  recordToVec3 = function(record) {
    return [record.x, record.y, record.z];
  };
  recordToVec4 = function(record) {
    return [record.x, record.y, record.z, record.w];
  };
  vec3ToRecord = function(vec) {
    return {
      x: vec[0],
      y: vec[1],
      z: vec[2]
    };
  };
  vec4ToRecord = function(vec) {
    return {
      x: vec[0],
      y: vec[1],
      z: vec[2],
      w: vec[3]
    };
  };
  lookAtToQuaternion = function(lookAt) {
    var eye, look, up, x, y, z;
    eye = recordToVec3(lookAt.eye);
    look = recordToVec3(lookAt.look);
    up = recordToVec3(lookAt.up);
    x = [0.0, 0.0, 0.0];
    y = [0.0, 0.0, 0.0];
    z = [0.0, 0.0, 0.0];
    SceneJS_math_subVec3(look, eye, z);
    SceneJS_math_cross3Vec3(up, z, x);
    SceneJS_math_cross3Vec3(z, x, y);
    SceneJS_math_normalizeVec3(x);
    SceneJS_math_normalizeVec3(y);
    SceneJS_math_normalizeVec3(z);
    return SceneJS_math_newQuaternionFromMat3(x.concat(y, z));
  };
  orbitLookAt = function(dAngles, orbitUp, lookAt) {
    var axis, dAngle, eye0, eye0len, eye0norm, eye1, look, result, rotMat, tangent0, tangent0norm, tangent1, tangentError, up0, up0norm, up1;
    if (dAngles[0] === 0.0 && dAngles[1] === 0.0) {
      return {
        eye: lookAt.eye,
        up: lookAt.up
      };
    }
    eye0 = recordToVec3(lookAt.eye);
    up0 = recordToVec3(lookAt.up);
    look = recordToVec3(lookAt.look);
    eye0len = SceneJS_math_lenVec3(eye0);
    eye0norm = [0.0, 0.0, 0.0];
    SceneJS_math_mulVec3Scalar(eye0, 1.0 / eye0len, eye0norm);
    tangent0 = [0.0, 0.0, 0.0];
    SceneJS_math_cross3Vec3(up0, eye0, tangent0);
    tangent0norm = SceneJS_math_normalizeVec3(tangent0);
    up0norm = [0.0, 0.0, 0.0];
    SceneJS_math_cross3Vec3(eye0norm, tangent0norm, up0norm);
    axis = [tangent0norm[0] * -dAngles[1] + up0norm[0] * -dAngles[0], tangent0norm[1] * -dAngles[1] + up0norm[1] * -dAngles[0], tangent0norm[2] * -dAngles[1] + up0norm[2] * -dAngles[0]];
    dAngle = SceneJS_math_lenVec2(dAngles);
    rotMat = SceneJS_math_rotationMat4v(dAngle, axis);
    eye1 = SceneJS_math_transformVector3(rotMat, eye0);
    tangent1 = SceneJS_math_transformVector3(rotMat, tangent0);
    tangentError = [0.0, 0.0, 0.0];
    SceneJS_math_mulVec3(tangent1, orbitUp, tangentError);
    SceneJS_math_subVec3(tangent1, tangentError);
    up1 = [0.0, 0.0, 0.0];
    SceneJS_math_cross3Vec3(eye1, tangent1, up1);
    return result = {
      eye: vec3ToRecord(eye1),
      look: lookAt.look,
      up: vec3ToRecord(up1)
    };
  };
  orbitLookAtNode = function(node, dAngles, orbitUp) {
    return node.set(orbitLookAt(dAngles, orbitUp, {
      eye: node.get('eye'),
      look: node.get('look'),
      up: node.get('up')
    }));
  };
  zoomLookAt = function(distance, limits, lookAt) {
    var eye0, eye0len, eye1, eye1len, look, result;
    eye0 = recordToVec3(lookAt.eye);
    look = recordToVec3(lookAt.look);
    eye0len = SceneJS_math_lenVec3(eye0);
    if (limits != null) {
      eye1len = Math.clamp(eye0len + distance, limits[0], limits[1]);
    } else {
      eye1len = eye0len + distance;
    }
    eye1 = [0.0, 0.0, 0.0];
    SceneJS_math_mulVec3Scalar(eye0, eye1len / eye0len, eye1);
    return result = {
      eye: vec3ToRecord(eye1),
      look: lookAt.look,
      up: lookAt.up
    };
  };
  zoomLookAtNode = function(node, distance, limits) {
    return node.set(zoomLookAt(distance, limits, {
      eye: node.get('eye'),
      look: node.get('look'),
      up: node.get('up')
    }));
  };
  mecha = {};
  mecha.log = ((typeof console !== "undefined" && console !== null) && (console.log != null) ? function() {
    return console.log.apply(console, arguments);
  } : function() {});
  mecha.logInternalError = ((typeof console !== "undefined" && console !== null) && (console.log != null) ? function() {
    return console.log.apply(console, arguments);
  } : function() {});
  mecha.logApiError = ((typeof console !== "undefined" && console !== null) && (console.log != null) ? function() {
    return console.log.apply(console, arguments);
  } : function() {});
  Array.prototype.flatten = function() {
    var x, _ref;
    return (_ref = []).concat.apply(_ref, (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        x = this[_i];
        _results.push((Array.isArray(x) ? flatten(x) : [x]));
      }
      return _results;
    }).call(this));
  };
  Math.clamp = function(s, min, max) {
    return Math.min(Math.max(s, min), max);
  };
  compileCSM = function(source, callback) {
    var postfix, prefix, requestId;
    prefix = '(function(){\n  /* BEGIN API */\n  ' + state.api.sourceCode + '  \n  /* BEGIN SOURCE */\n  return scene(\n';
    postfix = '  \n  );\n})();';
    return requestId = JSandbox.eval({
      data: prefix + source + postfix,
      callback: function(result) {
        return callback(result);
      },
      onerror: function(data, request) {
        return mecha.logInternalError("Error compiling the solid model.");
      }
    });
  };
  asm = {
    union: function() {
      var nodes;
      nodes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return {
        type: 'union',
        nodes: nodes.flatten()
      };
    },
    intersect: function() {
      var flattenedNodes, n, nodes, result, _i, _len;
      nodes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      flattenedNodes = nodes.flatten();
      result = {
        type: 'intersect',
        nodes: (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = flattenedNodes.length; _i < _len; _i++) {
            n = flattenedNodes[_i];
            if (n.type !== 'intersect') {
              _results.push(n);
            }
          }
          return _results;
        })()
      };
      for (_i = 0, _len = flattenedNodes.length; _i < _len; _i++) {
        n = flattenedNodes[_i];
        if (n.type === 'intersect') {
          result.nodes = result.nodes.concat(n.nodes);
        }
      }
      return result;
    },
    invert: function() {
      var nodes;
      nodes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return {
        type: 'invert',
        nodes: nodes.flatten()
      };
    },
    mirror: function() {
      var attr, nodes;
      attr = arguments[0], nodes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return {
        type: 'mirror',
        attr: attr,
        nodes: nodes.flatten()
      };
    },
    translate: function() {
      var attr, nodes;
      attr = arguments[0], nodes = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return {
        type: 'translate',
        attr: attr,
        nodes: nodes.flatten()
      };
    },
    halfspace: function(attr) {
      return {
        type: 'halfspace',
        attr: attr
      };
    }
  };
  mapCollectASM = function(nodes, flags, params, dispatch) {
    var node, parentTranslation, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = nodes.length; _i < _len; _i++) {
      node = nodes[_i];
      _results.push((function() {
        switch (node.type) {
          case 'invert':
            flags.invert = !flags.invert;
            if (dispatch[node.type] != null) {
              dispatch[node.type](node, flags, params);
            }
            mapCollectASM(node.nodes, flags, params, dispatch);
            return flags.invert = !flags.invert;
          case 'translate':
            parentTranslation = flags.translation;
            flags.translation = node.attr.offset;
            mapCollectASM(node.nodes, flags, params, dispatch);
            return flags.translation = parentTranslation;
          default:
            if (dispatch[node.type] != null) {
              return dispatch[node.type](node, flags, params);
            } else {
              if (dispatch["default"] !== null) {
                return dispatch["default"](node, flags, params);
              }
            }
        }
      })());
    }
    return _results;
  };
  collectASM = {
    intersect: function(nodes, flags, halfSpaceBins) {
      return mapCollectASM(nodes, flags, {
        halfSpaceBins: halfSpaceBins
      }, {
        halfspace: function(node, flags, params) {
          return params.halfSpaceBins[node.attr.axis + (flags.invert ? 3 : 0)].push(node.attr.val);
        },
        mirror: function() {},
        "default": function(node) {
          return mecha.logInternalError("ASM Collect: Unsupported node type, '" + node.type + "', inside intersection.");
        }
      });
    }
  };
  mapASM = function(dispatch, stack, node, flags) {
    var dispatchMethod, n, prevFlags, returnNode, _i, _len, _ref;
    stack.push({
      type: node.type,
      attr: node.attr,
      nodes: []
    });
    prevFlags = {
      invert: flags.invert
    };
    switch (node.type) {
      case 'invert':
        flags.invert = !flags.invert;
    }
    _ref = node.nodes || [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      n = _ref[_i];
      mapASM(dispatch, stack, n, flags);
    }
    flags.invert = prevFlags.invert;
    returnNode = stack.pop();
    dispatchMethod = dispatch[node.type] != null ? node.type : 'default';
    return dispatch[dispatchMethod](stack.reverse(), returnNode, flags);
  };
  optimizeASM = function(node, flags) {
    var dispatchFlatten, dispatchTrim, resultNode, stack;
    resultNode = {};
    if (!(flags != null)) {
      flags = {
        invert: false
      };
    }
    dispatchTrim = {};
    dispatchFlatten = {
      union: function(stack, node, flags) {
        var s, _i, _len;
        for (_i = 0, _len = stack.length; _i < _len; _i++) {
          s = stack[_i];
          switch (s.type) {
            case 'union':
              s.nodes.concat(node.nodes);
              return;
          }
          break;
        }
        return stack[0].nodes.push(node);
      },
      intersect: function(stack, node, flags) {
        var s, _i, _len;
        for (_i = 0, _len = stack.length; _i < _len; _i++) {
          s = stack[_i];
          switch (s.type) {
            case 'intersect':
              s.nodes.concat(node.nodes);
              return;
          }
          break;
        }
        return stack[0].nodes.push(node);
      },
      translate: function(stack, node, flags) {
        return stack[0].nodes.push(node);
      },
      halfspace: function(stack, node, flags) {
        var n, s, _i, _j, _len, _len2, _ref;
        if (node.nodes.length > 0) {
          mecha.logInternalError("ASM Optimize: Unexpected child nodes found in halfspace node.");
        }
        for (_i = 0, _len = stack.length; _i < _len; _i++) {
          s = stack[_i];
          switch (s.type) {
            case 'intersect':
              _ref = s.nodes;
              for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
                n = _ref[_j];
                if (n.type === 'halfspace' && n.attr.axis === node.attr.axis) {
                  if ((n.attr.val < node.attr.val && flags.invert) || (n.attr.val > node.attr.val && !flags.invert)) {
                    n.attr = node.attr;
                  }
                  return;
                }
              }
          }
          break;
        }
        return stack[0].nodes.push(node);
      },
      "default": function(stack, node, flags) {
        return stack[0].nodes.push(node);
      }
    };
    stack = [
      {
        type: 'union',
        nodes: []
      }
    ];
    mapASM(dispatchFlatten, stack, node, flags);
    return stack[0];
    /*
      intersect: (node, flags) ->
        # Collect half-spaces into bins by type [x+, x-, y+, y-, z+, z-]
        halfSpaceBins = []
        halfSpaceBins.push [] for i in [0..5]
        collectASM.intersect node.nodes, flags, halfSpaceBins
      
        # Remove redundant half-spaces from the node
        boundaries = []
        boundaries.push (spaces.reduce (a,b) -> Math.max(a,b)) for spaces in halfSpaceBins[0..2]
        boundaries.push (spaces.reduce (a,b) -> Math.min(a,b)) for spaces in halfSpaceBins[3..5]
    
        # Detect symmetries inside the intersection (symmetrize)
        center = [boundaries[0] + boundaries[3], boundaries[1] + boundaries[4], boundaries[2] + boundaries[5]]
        mirrorAxes = (i for i in [0..2] when halfSpaceBins[i].length > 0 and halfSpaceBins[i + 3].length > 0)
    
        mirrorHalfSpaces = (asm.halfspace {val: boundaries[i] - center[i], axis: i} for i in mirrorAxes)
        posHalfSpaces = (asm.halfspace {val: boundaries[i] - center[i], axis: i} for i in [0..2] when halfSpaceBins[i].length > 0 and halfSpaceBins[i + 3].length == 0)
        negHalfSpaces = (asm.halfspace {val: boundaries[i] - center[i-3], axis: i-3} for i in [3..5] when halfSpaceBins[i].length > 0 and halfSpaceBins[i-3].length == 0)
    
        mirrorNode = (asm.mirror {axes: mirrorAxes, duplicate: true}, mirrorHalfSpaces...) if mirrorHalfSpaces.length > 0
        posNode = asm.intersect posHalfSpaces... if posHalfSpaces.length > 0
        negNode = asm.invert negHalfSpaces... if negHalfSpaces.length > 0
    
        intersectNodes = []
        intersectNodes.push mirrorNode if mirrorNode? 
        intersectNodes.push posNode if posNode?
        intersectNodes.push negNode if negNode?
        #TODO: intersectNodes.push # other types of nodes... (cylinders, spheres etc)
    
        intersectNode = 
          if intersectNodes.length == 1 and intersectNodes[0].type == 'intersect'
            intersectNodes[0]
          else if intersectNodes.length > 0
            type: 'intersect'
            nodes: intersectNodes
          else
            undefined
    
        resultNode = 
          if center[0] == 0 and center[1] == 0 and center[2] == 0
            intersectNode
          else if intersectNode?
            type: 'translate'
            attr: 
              position: center
            nodes: [intersectNode]
          else
            undefined
      */
  };
  compileASM = function(concreteSolidModel) {
    var compileASMNode, dispatch;
    dispatch = {
      scene: function(node) {
        var n;
        if (node.nodes.length > 1) {
          return asm.union.apply(asm, (function() {
            var _i, _len, _ref, _results;
            _ref = node.nodes;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              n = _ref[_i];
              _results.push(compileASMNode(n));
            }
            return _results;
          })());
        } else if (node.nodes.length === 1) {
          return compileASMNode(node.nodes[0]);
        } else {
          return {};
        }
      },
      box: function(node) {
        var ALL_EDGES, halfspaces;
        halfspaces = [
          asm.halfspace({
            val: -node.attr.dimensions[0],
            axis: 0
          }), asm.halfspace({
            val: -node.attr.dimensions[1],
            axis: 1
          }), asm.halfspace({
            val: -node.attr.dimensions[2],
            axis: 2
          }), asm.halfspace({
            val: node.attr.dimensions[0],
            axis: 0
          }), asm.halfspace({
            val: node.attr.dimensions[1],
            axis: 1
          }), asm.halfspace({
            val: node.attr.dimensions[2],
            axis: 2
          })
        ];
        if (node.attr.chamfer != null) {
          node.attr.chamfer.edges.reduce(function(result, current) {
            return result + Math.pow(2, current);
          });
          ALL_EDGES = (Math.pow(2, 12)) - 1;
          if (chamferEdges === ALL_EDGES) {
            if (node.attr.chamfer.corners) {
              return asm.intersect(halfspaces[0], halfspaces[1], halfspaces[2], asm.invert.apply(asm, halfspaces.slice(3, 7)));
            } else {
              return asm.intersect(asm.intersect(halfspaces[0], halfspaces[1], asm.invert(halfspaces[3], halfspaces[4]), halfspaces[2], asm.invert(halfspaces[5])));
            }
          } else {
            return asm.intersect(halfspaces[0], halfspaces[1], halfspaces[2], asm.invert.apply(asm, halfspaces.slice(3, 7)));
          }
        } else {
          return asm.intersect(halfspaces[0], halfspaces[1], halfspaces[2], asm.invert.apply(asm, halfspaces.slice(3, 7)));
        }
      },
      sphere: function(node) {
        return {};
      },
      cylinder: function(node) {
        return {};
      },
      intersect: function(node) {
        var n;
        return asm.intersect.apply(asm, (function() {
          var _i, _len, _ref, _results;
          _ref = node.nodes;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            n = _ref[_i];
            _results.push(compileASMNode(n));
          }
          return _results;
        })());
      },
      union: function(node) {
        var n;
        return asm.union.apply(asm, (function() {
          var _i, _len, _ref, _results;
          _ref = node.nodes;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            n = _ref[_i];
            _results.push(compileASMNode(n));
          }
          return _results;
        })());
      },
      difference: function(node) {
        var n;
        if (node.nodes.length > 0) {
          return asm.intersect(compileASMNode(node.nodes[0], asm.invert.apply(asm, (function() {
            var _i, _len, _ref, _results;
            _ref = node.nodes.slice(1, (node.nodes.length + 1) || 9e9);
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              n = _ref[_i];
              _results.push(compileASMNode(n));
            }
            return _results;
          })())));
        } else {
          return asm.intersect();
        }
      },
      translate: function(node) {
        var n;
        return asm.translate.apply(asm, [node.attr].concat(__slice.call((function() {
          var _i, _len, _ref, _results;
          _ref = node.nodes;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            n = _ref[_i];
            _results.push(compileASMNode(n));
          }
          return _results;
        })())));
      }
    };
    compileASMNode = function(node) {
      switch (typeof node) {
        case 'object':
          if (dispatch[node.type] != null) {
            return dispatch[node.type](node);
          } else {
            mecha.log("Unexpected node type '" + node.type + "'.");
            return {};
          }
          break;
        default:
          mecha.log("Unexpected node of type '" + (typeof node) + "'.");
          return {};
      }
    };
    if (concreteSolidModel.type !== 'scene') {
      mecha.log("Expected node of type 'scene' at the root of the solid model, instead, got '" + concreteSolidModel.type + "'.");
      return;
    }
    return optimizeASM(compileASMNode(concreteSolidModel));
  };
  glslLibrary = {
    distanceFunctions: {
      sphereDist: {
        id: '_sphereDist',
        returnType: 'float',
        arguments: ['vec3', 'float'],
        code: (function() {
          var position, radius;
          position = 'a';
          radius = 'b';
          return ["return length(" + position + ") - " + radius + ";"];
        })()
      },
      cornerDist: {
        id: '_cornerDist',
        returnType: 'float',
        arguments: ['vec3', 'vec3'],
        code: (function() {
          var dist, position, radius;
          position = 'a';
          radius = 'b';
          dist = 's';
          return ["if (all(lessThan(" + position + ", " + radius + ")))", "  return 0.0;", "vec3 " + dist + " = max(vec3(0.0), " + position + " - " + radius + ");", "return max(max(" + dist + ".x, " + dist + ".y), " + dist + ".z);"];
        })()
      },
      boxChamferDist: {
        id: '_boxChamferDist',
        returnType: 'float',
        arguments: ['vec3', 'vec3', 'vec3', 'float'],
        code: (function() {
          var center, chamferCenter, chamferDist, chamferDistLength, chamferRadius, dist, gtChamferCenter, position, radius, rel;
          position = 'a';
          center = 'b';
          radius = 'c';
          chamferRadius = 'd';
          rel = 'r';
          dist = 's';
          chamferCenter = 'cc';
          chamferDist = 'ccd';
          chamferDistLength = 'ccdl';
          gtChamferCenter = 'gtcc';
          return ["vec3 " + rel + " = abs(" + position + " - " + center + ");", "vec3 " + dist + " = max(vec3(0.0), " + rel + " - " + center + ");", "if (any(greaterThan(" + rel + ", " + center + " + vec3(" + chamferRadius + ")))) { return max(max(" + dist + ".x, " + dist + ".y), " + dist + ".z); }", "vec3 " + chamferCenter + " = " + radius + " - vec3(" + chamferRadius + ");", "bvec3 " + gtChamferCenter + " = greaterThan(" + rel + ", " + chamferCenter + ");", "if (!any(" + gtChamferCenter + ")) { return 0.0; }", "vec3 " + chamferDist + " = " + rel + " - " + chamferCenter + ";", "if (min(" + chamferDist + ".x, " + chamferDist + ".y) < 0.0 && min(" + chamferDist + ".x, " + chamferDist + ".z) < 0.0 && min(" + chamferDist + ".y, " + chamferDist + ".z) < 0.0)", "{ return max(max(" + dist + ".x, " + dist + ".y), " + dist + ".z); }", "float " + chamferDistLength + ";", "if (all(" + gtChamferCenter + ")) {", "  " + chamferDistLength + " = length(" + chamferDist + ");", "}", "else if(" + chamferDist + ".x < 0.0) {", "  " + chamferDistLength + " = length(" + chamferDist + ".yz);", "}", "else if (" + chamferDist + ".y < 0.0) {", "  " + chamferDistLength + " = length(" + chamferDist + ".xz);", "}", "else { // " + chamferDist + ".z < 0.0", "  " + chamferDistLength + " = length(" + chamferDist + ".xy);", "}", "return min(" + chamferDistLength + " - " + chamferRadius + ", 0.0);"];
        })(),
        intersectDist: {
          id: '__intersectDist',
          arguments: ['float', 'float'],
          code: ["return max(a,b);"]
        },
        differenceDist: {
          id: '__differenceDist',
          arguments: ['float', 'float'],
          code: ["return max(a,-b);"]
        },
        unionDist: {
          id: '__unionDist',
          arguments: ['float', 'float'],
          code: ["return min(a,b);"]
        }
      }
    },
    compile: function(libraryFunctions) {
      var argCharCode, argName, c, charCodeA, code, distanceFunction, f, i, v, _i, _len, _ref, _ref2;
      code = "";
      for (f in libraryFunctions) {
        v = libraryFunctions[f];
        distanceFunction = this.distanceFunctions[f + 'Dist'];
        if (!distanceFunction) {
          mecha.log("GLSL distance function '" + f + "Dist' could not be found.");
          continue;
        }
        code += '\n';
        code += "" + distanceFunction.returnType + " " + distanceFunction.id + "(";
        charCodeA = 'a'.charCodeAt(0);
        for (i = 0, _ref = distanceFunction.arguments.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
          argCharCode = charCodeA + i;
          argName = String.fromCharCode(argCharCode);
          code += "in " + distanceFunction.arguments[i] + " " + argName;
          if (i < distanceFunction.arguments.length - 1) {
            code += ',';
          }
        }
        code += ") {\n";
        _ref2 = distanceFunction.code;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          c = _ref2[_i];
          code += c + '\n';
        }
        code += "}\n";
      }
      return code;
    }
  };
  compileGLSL = function(abstractSolidModel) {
    var compileIntersect, compileNode, flags, glslParams, main, prefix, rayDirection, rayOrigin, sceneDist, sceneNormal, sceneRayDist, uniforms;
    prefix = '#ifdef GL_ES\n  precision highp float;\n#endif\nuniform vec3 SCENEJS_uEye;                  // World-space eye position\nvarying vec3 SCENEJS_vEyeVec;               // Output world-space eye vector\nvarying vec4 SCENEJS_vWorldVertex;          // Varying for fragment clip or world pos hook\n';
    uniforms = "";
    rayOrigin = 'ro';
    rayDirection = 'rd';
    sceneDist = function(prelude, code) {
      return "\nfloat sceneDist(in vec3 " + rayOrigin + "){\n" + prelude + "  return " + code + ";\n}\n\n";
    };
    sceneRayDist = 'float sceneRayDist(in vec3 ro, in vec3 rd) {\n  return 0.0;\n}\n';
    sceneNormal = 'vec3 sceneNormal(in vec3 p) {\n  const float eps = 0.0001;\n  vec3 n;\n  n.x = sceneDist( vec3(p.x+eps, p.yz) ) - sceneDist( vec3(p.x-eps, p.yz) );\n  n.y = sceneDist( vec3(p.x, p.y+eps, p.z) ) - sceneDist( vec3(p.x, p.y-eps, p.z) );\n  n.z = sceneDist( vec3(p.xy, p.z+eps) ) - sceneDist( vec3(p.xy, p.z-eps) );\n  return normalize(n);\n}\n';
    main = 'void main(void) {\n  const int steps = 64;\n  const float threshold = 0.01;\n  vec3 rayDir = /*normalize*/(/*SCENEJS_uMMatrix * */ -SCENEJS_vEyeVec);\n  vec3 rayOrigin = SCENEJS_vWorldVertex.xyz;\n  bool hit = false;\n  float dist = 0.0;\n  for(int i = 0; i < steps; i++) {\n    //dist = sceneRayDist(rayOrigin, rayDir);\n    dist = sceneDist(rayOrigin);\n    if (dist < threshold) {\n      hit = true;\n      break;\n    }\n    rayOrigin += dist * rayDir;\n  }\n  if(!hit) { discard; }\n  /*if(!hit) { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); return; }*/\n  const vec3 diffuseColor = vec3(0.1, 0.2, 0.8);\n  /*const vec3 specularColor = vec3(1.0, 1.0, 1.0);*/\n  const vec3 lightPos = vec3(1.5,1.5, 4.0);\n  vec3 ldir = normalize(lightPos - rayOrigin);\n  vec3 diffuse = diffuseColor * dot(sceneNormal(rayOrigin), ldir);\n  gl_FragColor = vec4(diffuse, 1.0);\n}\n';
    compileIntersect = function(node, flags, glslParams) {
      var childNode, currentRayOrigin, halfSpaceBins, i, _i, _len, _ref;
      currentRayOrigin = glslParams.prelude[glslParams.prelude.length - 1][0];
      if (node.nodes.length === 0) {
        mecha.logInternalError('GLSL Compiler: Intersect nodes should not be empty.');
        return;
      }
      _ref = node.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        childNode = _ref[_i];
        switch (childNode.type) {
          case 'intersect':
            mecha.logInternalError("GLSL Compiler: Intersect nodes should not be directly nested, expected intersect nodes to be flattened by the ASM compiler.");
            break;
          case 'mirror':
            glslParams.prelude.push([
              'r' + glslParams.prelude.length, (function() {
                switch (childNode.attr.axes.length) {
                  case 3:
                    return "abs(" + currentRayOrigin + ")";
                    break;
                  case 1:
                    switch (childNode.attr.axes[0]) {
                      case 0:
                        return "vec3(abs(" + currentRayOrigin + ".x), " + currentRayOrigin + ".yz)";
                        break;
                      case 1:
                        return "vec3(" + currentRayOrigin + ".x, abs(" + currentRayOrigin + ".y), " + currentRayOrigin + ".z)";
                        break;
                      case 2:
                        return "vec3(" + currentRayOrigin + ".xy, abs(" + currentRayOrigin + ".z))";
                        break;
                      default:
                        mecha.logInternalError("GLSL Compiler: Unknown axis " + childNode.attr.axes[0] + " in mirror node.");
                        return currentRayOrigin;
                    }
                    break;
                  case 2:
                    if (childNode.attr.axes[0] !== 0 && childNode.attr.axes[1] !== 0) {
                      return "vec3(" + currentRayOrigin + ".x, abs(" + currentRayOrigin + ".yz)";
                    } else if (childNode.attr.axes[0] !== 1 && childNode.attr.axes[1] !== 1) {
                      return "vec3(abs(" + currentRayOrigin + ".x), (" + currentRayOrigin + ".y, abs(" + currentRayOrigin + ".z))";
                    } else {
                      return "vec3(abs(" + currentRayOrigin + ".xy), " + currentRayOrigin + ".z)";
                    }
                    break;
                  default:
                    mecha.logInternalError("GLSL Compiler: Mirror node has " + childNode.attr.axes.length + " axes, expected between 1 and 3.");
                    return currentRayOrigin;
                }
              })()
            ]);
            glslParams.prelude.code += "  vec3 " + glslParams.prelude[glslParams.prelude.length - 1][0] + " = " + glslParams.prelude[glslParams.prelude.length - 1][1] + ";\n";
            compileIntersect(childNode, flags, glslParams);
            glslParams.prelude.pop();
            break;
          case 'halfspace':
            break;
          default:
            mecha.logInternalError("GLSL Compiler: Could not compile unknown node with type " + childNode.type + ".");
        }
      }
      halfSpaceBins = [];
      for (i = 0; i <= 5; i++) {
        halfSpaceBins.push([]);
      }
      collectASM.intersect(node.nodes, flags, halfSpaceBins);
      if (halfSpaceBins[0].length > 0 && halfSpaceBins[1].length > 0 && halfSpaceBins[2].length > 0) {
        glslParams.functions.corner = true;
        return glslParams.code = "" + glslLibrary.distanceFunctions.cornerDist.id + "(" + currentRayOrigin + ", vec3(" + (-halfSpaceBins[0]) + ", " + (-halfSpaceBins[1]) + ", " + (-halfSpaceBins[2]) + "))";
      }
    };
    compileNode = function(node, flags, glslParams) {
      var glslINFINITY, n, _i, _len, _ref;
      switch (node.type) {
        case 'union':
          glslParams.functions.unionDist = true;
          _ref = node.nodes;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            n = _ref[_i];
            compileNode(n, flags, glslParams);
          }
          return mecha.logInternalError("GLSL Compiler: BUSY HERE... (compile union node)");
        case 'intersect':
          return compileIntersect(node, flags, glslParams);
        default:
          mecha.logInternalError("GLSL Compiler: Could not compile unknown node with type " + node.type + ".");
          glslINFINITY = '1.0/0.0';
          return glslParams.code = "" + glslINFINITY;
      }
    };
    glslParams = {
      functions: {},
      prelude: [['ro', "" + rayOrigin]],
      code: ""
    };
    glslParams.prelude.code = "";
    flags = {
      invert: false
    };
    compileNode(abstractSolidModel, flags, glslParams);
    return prefix + (glslLibrary.compile(glslParams.functions)) + (sceneDist(glslParams.prelude.code, glslParams.code)) + sceneNormal + main;
  };
  constants = {
    canvas: {
      defaultSize: [512, 512]
    },
    camera: {
      maxOrbitSpeed: Math.PI * 0.1,
      orbitSpeedFactor: 0.02,
      zoomSpeedFactor: 0.5
    }
  };
  state = {
    scene: SceneJS.scene('Scene'),
    canvas: document.getElementById('scenejsCanvas'),
    viewport: {
      domElement: document.getElementById('viewport'),
      mouse: {
        last: [0, 0],
        leftDragging: false,
        middleDragging: false
      }
    },
    api: {
      url: null,
      sourceCode: null
    },
    application: {
      initialized: false
    }
  };
  mouseCoordsWithinElement = function(event) {
    var coords, element, totalOffsetLeft, totalOffsetTop;
    coords = [0, 0];
    if (!event) {
      event = window.event;
      coords = [event.x, event.y];
    } else {
      element = event.target;
      totalOffsetLeft = 0;
      totalOffsetTop = 0;
      while (element.offsetParent) {
        totalOffsetLeft += element.offsetLeft;
        totalOffsetTop += element.offsetTop;
        element = element.offsetParent;
      }
      coords = [event.pageX - totalOffsetLeft, event.pageY - totalOffsetTop];
    }
    return coords;
  };
  windowResize = function() {};
  mouseDown = function(event) {
    switch (event.which) {
      case 1:
        return state.viewport.mouse.leftDragging = true;
    }
  };
  mouseUp = function(event) {
    return state.viewport.mouse.leftDragging = false;
  };
  mouseMove = function(event) {
    var delta, deltaLength, orbitAngles;
    if (state.viewport.mouse.leftDragging) {
      delta = [event.clientX - state.viewport.mouse.last[0], event.clientY - state.viewport.mouse.last[1]];
      deltaLength = SceneJS_math_lenVec2(delta);
      orbitAngles = [0.0, 0.0];
      SceneJS_math_mulVec2Scalar(delta, constants.camera.orbitSpeedFactor / deltaLength, orbitAngles);
      orbitAngles = [Math.clamp(orbitAngles[0], -constants.camera.maxOrbitSpeed, constants.camera.maxOrbitSpeed), Math.clamp(orbitAngles[1], -constants.camera.maxOrbitSpeed, constants.camera.maxOrbitSpeed)];
      orbitLookAtNode(state.scene.findNode('main-lookAt'), orbitAngles, [0.0, 0.0, 1.0]);
    }
    return state.viewport.mouse.last = [event.clientX, event.clientY];
  };
  mouseWheel = function(event) {
    var delta, zoomDistance;
    delta = event.wheelDelta != null ? event.wheelDelta / -120.0 : Math.clamp(event.detail, -1.0, 1.0);
    zoomDistance = delta * constants.camera.zoomSpeedFactor;
    return zoomLookAtNode(state.scene.findNode('main-lookAt'), zoomDistance);
  };
  keyDown = function(event) {};
  controlsSourceCompile = function() {
    try {
      return compileCSM(($('#source-code')).val(), function(result) {
        return (state.scene.findNode('main-shader')).set('shaders', [
          {
            stage: 'fragment',
            code: compileGLSL(compileASM(result))
          }
        ]);
      });
    } catch (error) {
      return mecha.log(error);
    }
  };
  registerDOMEvents = function() {
    state.viewport.domElement.addEventListener('mousedown', mouseDown, true);
    state.viewport.domElement.addEventListener('mouseup', mouseUp, true);
    state.viewport.domElement.addEventListener('mousemove', mouseMove, true);
    state.viewport.domElement.addEventListener('mousewheel', mouseWheel, true);
    state.viewport.domElement.addEventListener('DOMMouseScroll', mouseWheel, true);
    document.addEventListener('keydown', keyDown, true);
    return window.addEventListener('resize', windowResize, true);
  };
  registerControlEvents = function() {
    return ($('#source-compile')).click(controlsSourceCompile);
  };
  sceneIdle = function() {};
  canvasInit = function() {
    return windowResize();
  };
  sceneInit = function() {
    return compileCSM(($('#source-code')).val(), function(result) {
      var shaderDef;
      shaderDef = {
        type: 'shader',
        id: 'main-shader',
        shaders: [
          {
            stage: 'fragment',
            code: compileGLSL(compileASM(result))
          }
        ],
        vars: {}
      };
      return (state.scene.findNode('cube-mat')).insert('node', shaderDef);
    });
  };
  controlsInit = function() {};
  apiInit = function() {
    state.api.url = ($("link[rel='api']")).attr('href');
    return ($.get(encodeURIComponent(state.api.url, void 0, void 0, 'text'))).success(function(data, textStatus, jqXHR) {
      state.api.sourceCode = data;
      mecha.log("Loaded " + state.api.url);
      return sceneInit();
    }).error(function() {
      return mecha.log("Error loading API script");
    });
  };
  canvasInit();
  state.scene.start({
    idleFunc: sceneIdle
  });
  $(function() {
    apiInit();
    controlsInit();
    registerDOMEvents();
    registerControlEvents();
    return state.application.initialized = true;
  });
}).call(this);
