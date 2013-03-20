/*
 * Copyright 2011-2013, CircuitHub.com
 */
var morpheus = morpheus || {}; /* Redeclaring morpheus is fine: behaves like a no-op (https://developer.mozilla.org/en/JavaScript/Reference/Scope_Cheatsheet) */

morpheus.gui = 
// Generated by CoffeeScript 1.4.0
(function() {
  "use strict";

  var apiInit, canvasInit, constants, controlsArgumentsUpdate, controlsInit, controlsSourceCompile, create, createControls, createEditor, getModelArguments, getModelParameters, gl, init, keyDown, math_degToRad, math_invsqrt2, math_radToDeg, math_sqrt2, mouseCoordsWithinElement, mouseDown, mouseMove, mouseUp, mouseWheel, registerControlEvents, registerDOMEvents, registerEditorEvents, result, safeExport, safeTry, sceneIdle, sceneReset, sceneScript, setModelArguments, state, windowResize, wrapParams,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  math_sqrt2 = Math.sqrt(2.0);

  math_invsqrt2 = 1.0 / math_sqrt2;

  math_degToRad = Math.PI / 180.0;

  math_radToDeg = 180.0 / Math.PI;

  Math.clamp = function(s, min, max) {
    return Math.min(Math.max(s, min), max);
  };

  morpheus.log = ((typeof console !== "undefined" && console !== null) && (console.log != null) ? function() {
    return console.log.apply(console, arguments);
  } : function() {});

  morpheus.logDebug = ((typeof morpheusDebug !== "undefined" && morpheusDebug !== null) && morpheusDebug && (typeof console !== "undefined" && console !== null) && (console.log != null) ? function() {
    return console.log.apply(console, arguments);
  } : function() {});

  morpheus.logInternalError = ((typeof console !== "undefined" && console !== null) && (console.error != null) ? function() {
    return console.error.apply(console, arguments);
  } : function() {});

  morpheus.logApiError = ((typeof console !== "undefined" && console !== null) && (console.error != null) ? function() {
    return console.error.apply(console, arguments);
  } : function() {});

  morpheus.logApiWarning = ((typeof console !== "undefined" && console !== null) && (console.warn != null) ? function() {
    return console.warn.apply(console, arguments);
  } : function() {});

  morpheus.logException = function(locationName, error) {
    var logArgs;
    logArgs = ["Uncaught exception in `" + locationName + "`:\n"];
    logArgs.push((error.message != null ? "" + error.message + "\n" : error));
    if (error.stack != null) {
      logArgs.push(error.stack);
    }
    morpheus.logInternalError.apply(morpheus, logArgs);
  };

  safeExport = function(name, errorValue, callback) {
    return safeTry(name, callback, function(error) {
      morpheus.logException(name, error);
      return errorValue;
    });
  };

  safeTry = function(name, callback, errorCallback) {
    if ((typeof morpheusDebug !== "undefined" && morpheusDebug !== null) && morpheusDebug) {
      return callback;
    } else {
      return function() {
        try {
          return callback.apply(null, arguments);
        } catch (error) {
          return errorCallback(error);
        }
      };
    }
  };

  gl = glQuery;

  constants = {
    canvas: {
      defaultSize: [512, 512]
    },
    camera: {
      maxOrbitSpeed: Math.PI * 0.1,
      orbitSpeedFactor: 0.05,
      zoomSpeedFactor: 0.5
    }
  };

  state = {
    scene: null,
    canvas: null,
    viewport: {
      domElement: null,
      mouse: {
        last: [0, 0],
        leftDown: false,
        middleDown: false,
        leftDragDistance: 0,
        middleDragDistance: 0
      }
    },
    editor: {
      domElement: null
    },
    parameters: {
      domElement: null
    },
    api: {
      url: null,
      sourceCode: null
    },
    application: {
      initialized: false,
      sceneInitialized: false
    },
    models: {},
    paths: {
      morpheusUrlRoot: null,
      jsandboxUrl: null
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

  sceneScript = safeExport('morpheus.gui: sceneScript', void 0, function(morpheusScriptCode, callback) {
    var csmSourceCode, requestId;
    csmSourceCode = morpheus.generator.translateCSM(state.api.sourceCode, morpheusScriptCode);
    requestId = JSandbox["eval"]({
      data: csmSourceCode,
      callback: function(result) {
        var defaultValue, id, meta, model, oldParam, param, params, uniformID, unwrap, _base, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
        morpheus.logDebug(result);
        if ((_ref = (_base = state.models).scene) == null) {
          _base.scene = {
            shaders: [],
            params: {},
            args: {}
          };
        }
        model = state.models.scene;
        params = (_ref1 = result != null ? (_ref2 = result.attr) != null ? _ref2.params : void 0 : void 0) != null ? _ref1 : {};
        unwrap = function(data) {
          switch (data._tag) {
            case 'tolerance':
            case 'range':
              return data[0];
            default:
              return data;
          }
        };
        _ref3 = model.params;
        for (uniformID in _ref3) {
          oldParam = _ref3[uniformID];
          param = params[uniformID];
          if (!(param != null) || param._tag !== oldParam._tag) {
            _ref4 = unwrap(param != null ? param : oldParam), id = _ref4[0], meta = _ref4[1], defaultValue = _ref4[2];
            delete model.args[id];
          }
        }
        for (uniformID in params) {
          param = params[uniformID];
          _ref5 = unwrap(param), id = _ref5[0], meta = _ref5[1], defaultValue = _ref5[2];
          if (!(__indexOf.call(model.args, id) >= 0)) {
            model.args[id] = defaultValue;
          }
        }
        model.params = params;
        model.shaders = morpheus.generator.compileGLSL(morpheus.generator.compileASM(result), model.params);
        morpheus.renderer.modelShaders('scene', model.shaders);
        morpheus.gui.setModelArguments('scene', model.args);
        controlsInit();
        state.application.sceneInitialized = true;
        if (typeof callback === "function") {
          callback();
        }
      },
      onerror: function(data, request) {
        morpheus.logInternalError("Error compiling the solid model.");
        if (typeof callback === "function") {
          callback("Error compiling the solid model.");
        }
      }
    });
  });

  sceneReset = safeExport('morpheus.gui: sceneReset', void 0, function() {
    return state.models['scene'] = {
      shaders: [],
      params: {},
      args: {}
    };
  });

  windowResize = safeExport('morpheus.gui: windowResize', void 0, function() {});

  mouseDown = safeExport('morpheus.gui: mouseDown', void 0, function(event) {
    state.viewport.mouse.last = [event.clientX, event.clientY];
    switch (event.which) {
      case 1:
        return state.viewport.mouse.leftDown = true;
      case 2:
        return state.viewport.mouse.middleDown = true;
    }
    /* Pick the object under the mouse
    if not state.scene?
      return
    if event.which == 1 # Left mouse button
      coords = mouseCoordsWithinElement event
      state.viewport.mouse.pickRecord = state.scene.pick coords[0], coords[1]
    */

  });

  mouseUp = safeExport('morpheus.gui: mouseUp', void 0, function(event) {
    switch (event.which) {
      case 1:
        state.viewport.mouse.leftDown = false;
        state.viewport.mouse.leftDragDistance = 0;
        break;
      case 2:
        state.viewport.mouse.middleDown = false;
        state.viewport.mouse.middleDragDistance = 0;
    }
  });

  mouseMove = function(event) {
    return safeTry("morpheus.gui: mouseMove", (function() {
      var delta, deltaLength, orbitAngles;
      delta = [event.clientX - state.viewport.mouse.last[0], event.clientY - state.viewport.mouse.last[1]];
      deltaLength = gl.vec2.length(delta);
      if (state.viewport.mouse.leftDown) {
        state.viewport.mouse.leftDragDistance += deltaLength;
      }
      if (state.viewport.mouse.middleDown) {
        state.viewport.mouse.middleDragDistance += deltaLength;
      }
      if (state.viewport.mouse.leftDown && event.which === 1) {
        orbitAngles = [0.0, 0.0];
        gl.vec2.mul(orbitAngles, delta, constants.camera.orbitSpeedFactor / deltaLength);
        orbitAngles = [Math.clamp(orbitAngles[0], -constants.camera.maxOrbitSpeed, constants.camera.maxOrbitSpeed), Math.clamp(orbitAngles[1], -constants.camera.maxOrbitSpeed, constants.camera.maxOrbitSpeed)];
        if ((isNaN(orbitAngles[0])) || (Math.abs(orbitAngles[0])) === Infinity) {
          orbitAngles[0] = 0.0;
        }
        if ((isNaN(orbitAngles[1])) || (Math.abs(orbitAngles[1])) === Infinity) {
          orbitAngles[1] = 0.0;
        }
        morpheus.renderer.modelRotate('scene', orbitAngles);
      }
      return state.viewport.mouse.last = [event.clientX, event.clientY];
    }), (function(error) {}))();
  };

  mouseWheel = safeExport('morpheus.gui: mouseWheel', void 0, function(event) {
    var delta, zoomDistance;
    delta = event.wheelDelta != null ? event.wheelDelta / -120.0 : Math.clamp(event.detail, -1.0, 1.0);
    zoomDistance = delta * constants.camera.zoomSpeedFactor;
  });

  keyDown = safeExport('morpheus.gui: keyDown', void 0, function(event) {});

  controlsSourceCompile = safeExport('morpheus.gui.controlsSourceCompile', void 0, function() {
    morpheus.gui.sceneScript(morpheus.editor.getSourceCode(state.editor.domElement), function(error) {
      if (error != null) {
        console.error(error);
      }
    });
  });

  controlsArgumentsUpdate = safeExport('morpheus.gui.controlsArgumentsUpdate', void 0, function(event) {
    setModelArguments('scene', parameterize.get(state.parameters.domElement, getModelParameters('scene')));
  });

  registerDOMEvents = function() {
    ($('#morpheus-gui')).on('mousedown', '#morpheus-canvas', mouseDown);
    state.viewport.domElement.addEventListener('mouseup', mouseUp, true);
    state.viewport.domElement.addEventListener('mousemove', mouseMove, true);
    state.viewport.domElement.addEventListener('mousewheel', mouseWheel, true);
    state.viewport.domElement.addEventListener('DOMMouseScroll', mouseWheel, true);
    document.addEventListener('keydown', keyDown, true);
    return window.addEventListener('resize', windowResize, true);
  };

  registerEditorEvents = function() {
    var $container;
    $container = $(state.editor.domElement);
    return ($container.find('.morpheus-source-compile')).on('click', controlsSourceCompile);
  };

  registerControlEvents = function() {
    return parameterize.on('update', state.parameters.domElement, controlsArgumentsUpdate);
  };

  sceneIdle = function() {
    return safeTry("morpheus.gui: sceneIdle", (function() {}), (function(error) {}))();
  };

  canvasInit = function() {
    return windowResize();
  };

  controlsInit = safeExport('morpheus.gui: controlsInit', void 0, function() {
    var c, controls, el, model, modelName, roundDecimals, _i, _len;
    roundDecimals = function(n) {
      var nonzeroDigits, parts, zeroDigits;
      parts = (String(n)).split('.');
      if (parts.length === 1) {
        return parts[0];
      }
      nonzeroDigits = parts[1].match(/[1-9]+/g);
      zeroDigits = parts[1].match(/^0+/);
      if (nonzeroDigits.length === 0) {
        return parts[0];
      }
      if (zeroDigits.length > 0) {
        return "" + parts[0] + "." + zeroDigits[0] + nonzeroDigits[0];
      }
      return "" + parts[0] + "." + nonzeroDigits[0];
    };
    el = state.parameters.domElement;
    if (el != null) {
      controls = (function() {
        var _ref, _results;
        _ref = state.models;
        _results = [];
        for (modelName in _ref) {
          model = _ref[modelName];
          _results.push(parameterize.html(getModelParameters(modelName)));
        }
        return _results;
      })();
      el.innerHTML = "";
      for (_i = 0, _len = controls.length; _i < _len; _i++) {
        c = controls[_i];
        el.appendChild(c);
      }
    }
  });

  apiInit = function(morpheusScriptCode, callback) {
    var $apiLink;
    $apiLink = $("link[rel='api']");
    if (typeof state.paths.morpheusUrlRoot === 'string') {
      state.api.url = state.paths.morpheusUrlRoot.length === 0 || state.paths.morpheusUrlRoot[state.paths.morpheusUrlRoot.length - 1] === '/' ? state.paths.morpheusUrlRoot + 'morpheus-api.min.js' : state.paths.morpheusUrlRoot + '/morpheus-api.min.js';
    } else if ($apiLink.length > 0) {
      state.api.url = $apiLink.attr('href');
    } else {
      state.api.url = 'morpheus-api.min.js';
    }
    return ($.get(state.api.url, void 0, void 0, 'text')).success(function(data, textStatus, jqXHR) {
      state.api.sourceCode = data;
      morpheus.log("Loaded " + state.api.url);
      return typeof callback === "function" ? callback(morpheusScriptCode) : void 0;
    }).error(function() {
      return morpheus.log("Error loading API script");
    });
  };

  init = function(containerEl, canvasEl, callback) {
    var morpheusScriptCode, _ref, _ref1;
    state.viewport.domElement = containerEl;
    state.canvas = canvasEl;
    if (state.canvas != null) {
      state.scene = morpheus.renderer.createScene(state.canvas.getContext('experimental-webgl'));
      morpheus.renderer.runScene(state.canvas, (function() {}));
    }
    canvasInit();
    morpheusScriptCode = (_ref = (_ref1 = morpheus.editor) != null ? _ref1.getSourceCode(state.editor.domElement) : void 0) != null ? _ref : "";
    apiInit(morpheusScriptCode, function() {
      if (typeof callback === "function") {
        callback();
      }
      if (!state.application.sceneInitialized) {
        return sceneScript(morpheusScriptCode);
      }
    });
    registerDOMEvents();
    return state.application.initialized = true;
  };

  create = safeExport('morpheus.gui.create', false, function(container, jsandboxUrl, morpheusUrlRoot, fixedWidth, fixedHeight, callback) {
    var containerEl, errorHtml;
    errorHtml = "<div>Could not create Morpheus GUI. Please see the console for error messages.</div>";
    if (!(fixedWidth != null)) {
      fixedWidth = 512;
    }
    if (!(fixedHeight != null)) {
      fixedHeight = 512;
    }
    if (container !== null && typeof container !== 'string' && (typeof container !== 'object' || container.nodeName !== 'DIV')) {
      containerEl.innerHTML = errorHtml;
      morpheus.logApiError("Morpheus GUI: (ERROR) Invalid container selector '" + container + "' supplied, expected type 'string' or dom element of type 'DIV'.");
      return false;
    } else if (container === null) {
      morpheus.logApiWarning("Morpheus GUI: (WARNING) No container element supplied. Creating a div element here...");
    } else {
      containerEl = typeof container === 'string' ? document.querySelector(container) : container;
    }
    if (containerEl === null || containerEl.nodeName !== 'DIV') {
      morpheus.logApiError("Morpheus GUI: (ERROR) Invalid container selector '" + container + "' supplied, could not find a matching 'DIV' element in the document.");
      return false;
    }
    containerEl.innerHTML = ("<canvas id='morpheus-canvas' width='" + fixedWidth + "' height='" + fixedHeight + "'>\n  <p>This application requires a browser that supports the<a href='http://www.w3.org/html/wg/html5/'>HTML5</a>&lt;canvas&gt; feature.</p>\n</canvas>") + containerEl.innerHTML;
    if (jsandboxUrl != null) {
      state.paths.jsandboxUrl = jsandboxUrl;
    }
    if (morpheusUrlRoot != null) {
      state.paths.morpheusUrlRoot = morpheusUrlRoot;
    }
    if (state.paths.jsandboxUrl != null) {
      JSandbox.create(state.paths.jsandboxUrl);
    }
    init(containerEl, document.getElementById('morpheus-canvas'), callback);
    return true;
  });

  createControls = safeExport('morpheus.gui.createControls', false, function(container) {
    var containerEl;
    if (container !== null && typeof container !== 'string' && (typeof container !== 'object' || container.nodeName !== 'DIV')) {
      morpheus.logApiError("Morpheus GUI: (ERROR) Invalid container selector '" + container + "' supplied, expected type 'string' or dom element of type 'DIV'.");
      return false;
    } else if (container === null) {
      morpheus.logApiWarning("Morpheus GUI: (WARNING) No container element supplied. Creating a div element here...");
    } else {
      containerEl = typeof container === 'string' ? document.querySelector(container) : container;
    }
    if (containerEl === null || containerEl.nodeName !== 'DIV') {
      morpheus.logApiError("Morpheus GUI: (ERROR) Invalid container id '" + container + "' supplied, could not find a matching 'DIV' element in the document.");
      return false;
    }
    if (!(state.parameters.domElement != null)) {
      state.parameters.domElement = containerEl;
    }
    controlsInit();
    registerControlEvents();
    return true;
  });

  createEditor = safeExport('morpheus.gui.createEditor', false, function(container, sourceCode) {
    morpheus.editor.create(container, sourceCode);
    state.editor.domElement = container;
    registerEditorEvents();
    return true;
  });

  wrapParams = function(params) {
    var name, param, _ref;
    return parameterize.form.parameters("", (_ref = parameterize.form).section.apply(_ref, [""].concat(__slice.call((function() {
      var _results;
      _results = [];
      for (name in params) {
        param = params[name];
        _results.push(param);
      }
      return _results;
    })()))));
  };

  getModelParameters = safeExport('morpheus.gui.getModelParameters', {}, function(modelName) {
    var k, params, v, _ref;
    if ((modelName != null) && (state.models[modelName] != null)) {
      return wrapParams(state.models[modelName].params);
    }
    params = {};
    _ref = state.models;
    for (k in _ref) {
      v = _ref[k];
      params[k] = wrapParams(v.params);
    }
    return params;
  });

  getModelArguments = safeExport('morpheus.gui.getModelArguments', {}, function(modelName) {
    var args, k, v, _ref;
    if ((modelName != null) && (state.models[modelName] != null)) {
      return state.models[modelName].args;
    }
    args = {};
    _ref = state.models;
    for (k in _ref) {
      v = _ref[k];
      args[k] = v.args;
    }
    return args;
  });

  setModelArguments = safeExport('morpheus.gui.setModelArguments', {}, function(modelName, args) {
    var dimensionType, globalScale, k, model, v, _render, _scaleArgument, _unwrap;
    globalScale = 0.1;
    _unwrap = function(data) {
      switch (data._tag) {
        case 'tolerance':
        case 'range':
          return data[0];
        default:
          return data;
      }
    };
    dimensionType = {
      real: true,
      dimension1: true,
      dimension2: true,
      dimension3: true,
      vector2: true,
      vector3: true,
      point2: true,
      point3: true,
      pitch1: true,
      pitch2: true,
      pitch3: true,
      angle: false,
      polar: false,
      cylindrical: void 0,
      spherical: void 0,
      integer: false,
      natural: false,
      latice1: false,
      latice2: false,
      latice3: false,
      boolean: false,
      option: false
    };
    _scaleArgument = function(arg, param) {
      var a, tag;
      tag = (_unwrap(param))._tag;
      if (!(dimensionType[tag] != null)) {
        throw "Parameter type " + tag + " is not yet supported.";
      }
      if (!dimensionType[(_unwrap(param))._tag]) {
        return arg;
      }
      if (Array.isArray(arg)) {
        return (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = arg.length; _i < _len; _i++) {
            a = arg[_i];
            _results.push(a * globalScale);
          }
          return _results;
        })();
      } else if (typeof arg === 'object') {
        if (!arg.min && arg.max) {
          throw "Could not find min and max keys for toleranced argument.";
        }
        if (Array.isArray(arg.min)) {
          return {
            min: (function() {
              var _i, _len, _ref, _results;
              _ref = arg.min;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                a = _ref[_i];
                _results.push(a * globalScale);
              }
              return _results;
            })(),
            max: (function() {
              var _i, _len, _ref, _results;
              _ref = arg.max;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                a = _ref[_i];
                _results.push(a * globalScale);
              }
              return _results;
            })()
          };
        } else {
          return {
            min: arg.min * globalScale,
            max: arg.max * globalScale
          };
        }
      }
      return arg * globalScale;
    };
    _render = function(model, args) {
      var arg, id, k, newArgs, param, paramToUniform, uniformID, _ref;
      paramToUniform = {};
      if (model.params != null) {
        _ref = model.params;
        for (uniformID in _ref) {
          param = _ref[uniformID];
          id = _unwrap(param)[0];
          paramToUniform[id] = uniformID;
        }
      }
      newArgs = {};
      for (k in args) {
        arg = args[k];
        newArgs[k] = _scaleArgument(arg, model.params[paramToUniform[k]]);
      }
      model.args = newArgs;
      return morpheus.renderer.modelArguments(modelName, model.args, model.params);
    };
    if (!(modelName != null)) {
      for (k in args) {
        v = args[k];
        model = state.models[k];
        if (!(model != null)) {
          throw "No model with the name '" + modelName + "' exists in the scene.";
        }
        _render(model, v);
      }
      return;
    }
    model = state.models[modelName];
    if (!(model != null)) {
      throw "No model with the name '" + modelName + "' exists in the scene.";
    }
    _render(model, args);
  });

  /*
  getModelDefaultArguments = safeExport 'morpheus.gui.getModelParameters', {}, (modelName) ->
    params = state?.models[modelName]?.params
    for name,attr of params
      if not (name in model.args)
        [id,meta,defaultValue] = ["", {}, 0]
        switch attr._tag
          when 'tolerance'
            [id,meta,defaultValue] = attr[0] # unwrap tolerance tag
            if Array.isArray defaultValue.min
              defaultValue = ((defaultValue.min[i] + defaultValue.max[i]) * 0.5 for i in [0...defaultValue.min.length])
            else
              defaultValue = (defaultValue.min + defaultValue.max) * 0.5
          when 'range'
            throw "TODO: Range not yet implemented"
          else
            [id,meta,defaultValue] = attr
        model.args[name] = defaultValue # TODO: handle tolerance value here?
  */


  result = typeof exports !== "undefined" && exports !== null ? exports : {};

  result.create = create;

  result.createControls = createControls;

  result.createEditor = createEditor;

  result.sceneScript = sceneScript;

  result.sceneReset = sceneReset;

  result.getModelParameters = getModelParameters;

  result.getModelArguments = getModelArguments;

  result.setModelArguments = setModelArguments;

  return result;

}).call(this);
