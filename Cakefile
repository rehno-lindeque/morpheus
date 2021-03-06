fs     = require 'fs'
path   = require 'path'
{exec} = require 'child_process'

###
Files
###

morpheusModules = ['morpheus','morpheus-api', 'morpheus-generator', 'morpheus-editor', 'morpheus-renderer', 'morpheus-gui']

morpheusFiles = [
  'morpheus-generator'
  'morpheus-editor'
  'morpheus-renderer'
  'morpheus-gui'
]

apiFiles = [
  'api/api.csm'
  'api/exports'
]

generatorFiles  = [
  'common/directives'
  'common/array'
  'common/math'
  'common/morpheus.log'
  'generator/core'
  'generator/util.tostring'
  'generator/translate.csm'
  'generator/compile.asm.api'
  'generator/compile.asm.generics'
  'generator/compile.asm.optimize'
  'generator/compile.asm.bounds'
  'generator/compile.asm'
  'generator/compile.glsl.api'
  'generator/compile.glsl.library'
  'generator/compile.glsl.compiler'
  'generator/compile.glsl.compilerDistance'
  'generator/compile.glsl.sceneDistance'
  'generator/compile.glsl.sceneId'
  'generator/compile.glsl'
  'generator/exports'
]

guiFiles  = [
  'common/directives'
  'common/math'
  'common/morpheus.log'
  'gui/core'
  'gui/constants'
  'gui/state'
  'gui/mouse'
  'gui/scene'
  'gui/events.window'
  'gui/events.mouse'
  'gui/events.keyboard'
  'gui/events.controls'
  'gui/events.register'
  'gui/events.idle'
  'gui/events.init'
  'gui/create'
  'gui/models'
  'gui/exports'
]

rendererFiles  = [
  'common/directives'
  'common/math'
  'common/morpheus.log'
  'renderer/core'
  'renderer/state'
  'renderer/model'
  'renderer/scene'
  'renderer/exports'
]

editorFiles = [
  'common/directives'
  'common/morpheus.log'
  'editor/translate.sugaredjs'
  'editor/create'
  'editor/sourcecode'
  'editor/exports'
]

completeFiles = [
  'glquery/glquery'
  'glquery/glquery.math.module'
  'adt/adt'
  'adt/adt-html'
  'parameterize/parameterize-form'
  'jsandbox/jsandbox'
  'morpheus'
]


###
Generic functions
###

Function.prototype.partial = (args0...) ->
  fn = this
  (args1...) -> this.fn (args0.concat args1)...

###
Build helpers
###

# (String, String, Maybe (() -> IO)) -> IO
concatHeader = (filename, module, callback) ->
  fs.readFile "static/lib/#{filename}.js", 'utf8', (err, fileContents) ->
    throw err if err
    fs.readFile "src/common/header.js", 'utf8', (err, commonHeaderContents) ->
      throw err if err
      if module?
        fs.readFile "src/#{module}/header.js", 'utf8', (err, headerContents) ->
          throw err if err
          callback?(commonHeaderContents + headerContents + fileContents)
      else
        callback?(commonHeaderContents + fileContents)

# (String, String) -> Maybe (() -> IO) -> String -> IO
buildText = (filename, module) -> (callback) -> (text) ->
  fs.writeFile "build/#{filename}.coffee", text.join('\n\n'), 'utf8', (err) ->
    throw err if err
    exec "coffee -o static/lib -c build/#{filename}.coffee", (err, stdout, stderr) ->
      throw err if err
      console.log stdout + stderr
      fs.unlink "build/#{filename}.coffee", (err) ->
        throw err if err
        # Concatenate the header file
        concatHeader filename, module, (text) ->
          # Write out the result
          fs.writeFile "static/lib/#{filename}.js", text, 'utf8', (err) ->
            throw err if err
            console.log "...Done (#{filename}.js)"
            callback?()

# String -> Maybe (String -> IO) -> String -> IO
prependText = (preText) -> (callback) -> (text) ->
  console.log "Concatinating debug flag..."
  callback?(preText + text)

# [String] -> Maybe (String -> IO) -> () -> IO
concatSrcFiles = (files) -> (callback) ->
  contents = new Array files.length
  remaining = files.length
  for file, index in files then do (file, index) ->
    fs.readFile "src/#{file}.coffee", 'utf8', (err, fileContents) ->
      throw err if err
      contents[index] = fileContents
      (callback contents) if --remaining is 0 and callback?

# String -> Maybe (() -> IO) -> String -> IO
writeJSFile = (filename) -> (callback) -> (text) ->
  fs.writeFile "static/lib/#{filename}.js", text.join('\n\n'), 'utf8', (err) ->
    throw err if err
    console.log "...Done (#{filename}.js)"
    callback?()

# [String] -> (String -> IO) -> IO
concatLibFiles = (files) -> (callback) ->
  contents = new Array files.length
  remaining = files.length
  for file, index in files then do (file, index) ->
    fs.readFile "static/lib/#{file}.js", 'utf8', (err, fileContents) ->
      throw err if err
      contents[index] = fileContents
      (callback contents) if --remaining is 0 and callback?

###
Build scripts
###

# Maybe (() -> IO) -> IO
buildMorpheus = (callback) ->
  (concatLibFiles morpheusFiles) (writeJSFile 'morpheus') callback

# Maybe (String -> IO) -> String -> IO
prependDebug = prependText "morpheusDebug = true\n"

# Maybe (() -> IO) -> IO
buildApi = (callback, debug) ->
  if debug
    (concatSrcFiles apiFiles) (prependDebug (buildText 'morpheus-api', 'api') callback)
  else
    (concatSrcFiles apiFiles) (buildText 'morpheus-api', 'api') callback
buildGenerator = (callback, debug) ->
  if debug
    (concatSrcFiles generatorFiles) (prependDebug (buildText 'morpheus-generator', 'generator') callback)
  else
    (concatSrcFiles generatorFiles) (buildText 'morpheus-generator', 'generator') callback
buildEditor = (callback, debug) ->
  if debug
    (concatSrcFiles editorFiles) (prependDebug (buildText 'morpheus-editor', 'editor') callback)
  else
    (concatSrcFiles editorFiles) (buildText 'morpheus-editor', 'editor') callback
buildRenderer = (callback, debug) ->
  if debug
    (concatSrcFiles rendererFiles) (prependDebug (buildText 'morpheus-renderer', 'renderer') callback)
  else
    (concatSrcFiles rendererFiles) (buildText 'morpheus-renderer', 'renderer') callback
buildGui = (callback, debug) ->
  if debug
    (concatSrcFiles guiFiles) (prependDebug (buildText 'morpheus-gui', 'gui') callback)
  else
    (concatSrcFiles guiFiles) (buildText 'morpheus-gui', 'gui') callback

# Maybe (() -> IO) -> IO
minify = (callback) ->
  path.exists 'node_modules/.bin/uglifyjs', (exists) ->
    tool = if exists then 'node_modules/.bin/uglifyjs' else 'uglifyjs'
    remaining = morpheusModules.length
    for file in morpheusModules then do (file) ->
      path.exists "static/lib/#{file}.js", (exists) ->
        if exists
          exec "#{tool} static/lib/#{file}.js > static/lib/#{file}.min.js", (err, stdout, stderr) ->
            throw err if err
            console.log stdout + stderr
            console.log "...Done (#{file}.min.js)"
            callback?() if --remaining is 0

# Maybe (() -> IO) -> IO
packComplete = (callback) ->
  (concatLibFiles completeFiles) (writeJSFile 'morpheus.complete') (-> ->
    console.log "...Done (morpheus.complete.js)"
    callback?())

###
Tasks
###

option '-g', '--global', 'Use with fetch to install supporting libraries and tools globally'

#task 'build', "Build the entire morpheus module", ->
#  exec "mkdir -p 'build'", (err, stdout, stderr) -> return
#  buildMorpheus()

task 'build-api', "Build the API module", ->
  exec "mkdir -p 'build'", (err, stdout, stderr) -> return
  buildApi()

task 'build-generator', "Build the generator module", ->
  exec "mkdir -p 'build'", (err, stdout, stderr) -> return
  buildGenerator()

task 'build-editor', "Build the editor module", ->
  exec "mkdir -p 'build'", (err, stdout, stderr) -> return
  buildEditor()

task 'build-renderer', "Build the renderer module", ->
  exec "mkdir -p 'build'", (err, stdout, stderr) -> return
  buildRenderer()

task 'build-gui', "Build the gui module", ->
  exec "mkdir -p 'build'", (err, stdout, stderr) -> return
  buildGui()

task 'pack-complete', "Pack morpheus with all its dependencies into a single .js file", ->
  packComplete()

task 'all', "Build all distribution files", ->
  exec "mkdir -p 'build'", (err, stdout, stderr) -> return
  buildApi -> buildGenerator -> buildEditor -> buildRenderer -> buildGui -> buildMorpheus -> minify -> packComplete()

task 'debug', "Build all distribution files in debug (development) mode", ->
  exec "mkdir -p 'build'", (err, stdout, stderr) -> return
  buildApi -> buildGenerator -> buildEditor -> buildRenderer -> buildGui -> buildMorpheus -> minify -> packComplete()

task 'fetch:tools', "Fetch all supporting tools", (options) ->
  invoke 'fetch:npm'
  invoke 'fetch:uglifyjs'
  invoke 'fetch:express'

task 'fetch:npm', "Fetch the npm package manager (always global)", ->
  if options.global
    console.warn "npm is always installed globally"
  exec "curl http://npmjs.org/install.sh | sudo sh", (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
    console.log "Done."

task 'fetch:uglifyjs', "Fetch the UglifyJS minification tool", (options) ->
  exec "#{if options.global then 'sudo ' else ''}npm install uglify-js #{if options.global then '-g' else ''}", (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
    console.log "Done."

task 'fetch:express', "Fetch the express server (for running a local server)", (options) ->
  exec "#{if options.global then 'sudo ' else ''}npm install express #{if options.global then '-g' else ''}", (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
    console.log "Done."

task 'fetch:libraries', "Update all supporting libraries", (options) ->
  invoke 'fetch:glquery'
  #invoke 'fetch:jquery'
  #invoke 'fetch:jsandbox'
  #invoke 'fetch:uglifyjs-parser'
  invoke 'fetch:adt.js'
  invoke 'fetch:adt-html.js'
  invoke 'fetch:parameterize-form'

task 'fetch:glquery', "Update the glQuery library (always local)", (options) ->
  if options.global
    console.warn "glquery is always installed locally"
  urls = [
    'https://raw.github.com/glQuery/glQuery/master/dist/glquery.js'
    'https://raw.github.com/glQuery/glQuery/master/dist/extra/glquery.math.module.js'
  ]
  remaining = urls.length
  downloadCallback = (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
    --remaining
    console.log "Done." if remaining == 0
  for url in urls
    exec "wget -nv -O static/lib/glquery/#{url.substr url.lastIndexOf('/') + 1} #{url}", downloadCallback

task 'fetch:adt.js', "Update the adt.js library (always local)", (options) ->
  if options.global
    console.warn "adt.js is always installed locally"
  urls = [
    'https://raw.github.com/rehno-lindeque/adt.js/master/dist/adt.js'
  ]
  remaining = urls.length
  downloadCallback = (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
    --remaining
    console.log "Done." if remaining == 0
  for url in urls
    exec "wget -nv -O static/lib/adt/#{url.substr url.lastIndexOf('/') + 1} #{url}", downloadCallback

task 'fetch:adt-html.js', "Update the adt-html.js library (always local)", (options) ->
  if options.global
    console.warn "adt-html.js is always installed locally"
  urls = [
    'https://raw.github.com/rehno-lindeque/adt-html.js/master/dist/adt-html.js'
  ]
  remaining = urls.length
  downloadCallback = (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
    --remaining
    console.log "Done." if remaining == 0
  for url in urls
    exec "wget -nv -O static/lib/adt/#{url.substr url.lastIndexOf('/') + 1} #{url}", downloadCallback

task 'fetch:parameterize-form', "Update the parameterize-form library (always local)", (options) ->
  if options.global
    console.warn "parameterize-form is always installed locally"
  urls = [
    'https://raw.github.com/circuithub/parameterize-form/master/dist/parameterize-form.js'
  ]
  remaining = urls.length
  downloadCallback = (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
    --remaining
    console.log "Done." if remaining == 0
  for url in urls
    exec "wget -nv -O static/lib/parameterize/#{url.substr url.lastIndexOf('/') + 1} #{url}", downloadCallback

task 'minify', "Minify the resulting application file after build", ->
  minify()

task 'clean', "Cleanup all build files and distribution files", ->
  exec "rm -rf build"
  remaining = morpheusModules.length
  for file in morpheusModules
    exec "rm static/lib/#{file}.js", (err, stdout, stderr) ->
      #console.log stdout + stderr
      console.log "...Done (clean)" if --remaining is 0

