createResources = (context, event) ->
  # Register this callback so that all resources will be reinitialized if the
  # context is ever lost (in glQuery, this function will only ever be
  # registered once)
  gl.contextrestored createResources

  #console.log "CREATE RESOURCES"
  
  # Initialize buffers
  # TODO: Use the model boundaries to set up the box bounds
  positions = [
     1.0, 1.0,-1.0,   1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,
    -1.0, 1.0,-1.0,   1.0, 1.0, 1.0,   1.0,-1.0, 1.0,
    -1.0,-1.0, 1.0,  -1.0, 1.0, 1.0,   1.0, 1.0,-1.0,
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,
     1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,
    -1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,   1.0, 1.0, 1.0,
     1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0
  ]
  indices = [
     0, 1, 2,   0, 2, 3,
     4, 7, 6,   4, 6, 5,
     8, 9,10,   8,10,11,
    12,13,14,  12,14,15,
    16,17,18,  16,18,19,
    20,21,22,  20,22,23 
  ]

  try
    if (state.vbo?)
      context.deleteBuffer state.vbo
    if (state.ibo?)
      context.deleteBuffer state.ibo

  state.vbo = context.createBuffer()
  context.bindBuffer context.ARRAY_BUFFER, state.vbo
  context.bufferData context.ARRAY_BUFFER, (new Float32Array positions), context.STATIC_DRAW

  state.ibo = context.createBuffer()
  context.bindBuffer context.ELEMENT_ARRAY_BUFFER, state.ibo
  context.bufferData context.ELEMENT_ARRAY_BUFFER, (new Uint16Array indices), context.STATIC_DRAW

setupContext = (context) ->
  # Register this callback so that the render state will be reinitialized if the
  # context is ever lost (in glQuery, this function will only ever be
  # registered once)
  gl.contextrestored setupContext
  
  # Setup rendering parameters
  state.context.viewport 0, 0, state.canvas.width, state.canvas.height
  state.context.clearColor 0.0, 0.0, 0.0, 0.0
  state.context.cullFace state.context.BACK
  state.context.enable state.context.CULL_FACE
  # TODO

# Create the scene
createScene = (context) ->
  # Store the context in the state
  # TODO: support multiple contexts in future?
  state.context = context  

  # Create resources used in this scene
  createResources context
  
  # Create the scene
  # TODO: Use the model boundaries to set up the projection parameters and the camera distance
  gl.scene({ 'scene': '' })
  .vertexAttrib('position', state.vbo, 9*8, gl.FLOAT, 3, false, 0, 0)
  .vertexElem(state.ibo, 6*6, gl.UNSIGNED_SHORT, 0)
  .uniform('view', gl.matrix4.newLookAt([10.0,10.0,10.0], [0.0,0.0,0.0], [0.0,0.0,1.0]))
  .uniform('projection', gl.matrix4.newOrtho(-math_sqrt2, math_sqrt2, -math_sqrt2, math_sqrt2, 0.1, 100.0))
  .uniform('model', state.rotation)
  .triangles()
  return

runScene = (canvas, idleCallback) ->
  state.canvas = canvas
  setupContext state.context

  # Run the scene with an idle callback function
  callback = safeExport 'mecha.renderer: render', undefined, ->
    if gl.update()
      state.context.clear state.context.DEPTH_BUFFER_BIT | state.context.COLOR_BUFFER_BIT
      (gl 'scene').render state.context
    else
      idleCallback()
    self.nextFrame = window.requestAnimationFrame callback, canvas
  state.nextFrame = window.requestAnimationFrame callback, canvas
  return

