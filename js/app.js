function APP (FLOOR) {
  // Scene
  this.scene = new THREE.Scene()
  this.scene.fog = new THREE.Fog( 0x8cedf7, 0, 750 )
  this.floor = FLOOR || 0

  // Camera
  var fieldOfView = 75,
      aspectRatio = window.innerWidth/window.innerHeight,
      near = 0.4,
      far = 1000
  this.camera = new THREE.PerspectiveCamera( fieldOfView, aspectRatio, near, far )
  this.camera.updateProjectionMatrix()
  this.camera.position.z = 0

  //Loader manager
  this.manager = new THREE.LoadingManager()
  this.manager.onLoad = onLoad
  this.manager.onProgress = onProgress

  // Light
  this.light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 )
  this.light.position.set( 0.5, 1, 0.75 )
  // this.light = new THREE.DirectionalLight( 0xffffff )
  // this.light.position.set( 1, 0, 1 ).normalize()
  this.scene.add( this.light )

  // Objects
  this.fn = () => {}
  this.arr = []
}
function onLoad () {
}
function onProgress (url, item, total) {
}

APP.prototype.draw = function (fn) {
  this.fn = fn
}

APP.prototype.texture = function (url, fn) {
  var texture = new THREE.Texture()
  var loader = new THREE.ImageLoader( this.manager )
  loader.load( url, function ( image ) {
    texture.image = image
    texture.needsUpdate = true
    if (fn)
      fn(texture)
  })
  return texture
}

APP.prototype.load = function (url, scale, callback) {
  var loader = new THREE.OBJLoader(this.manager)
  var self = this
  loader.load( url, obj => {
    obj.scale.set(scale, scale, scale)
    obj.position.set(0, this.floor, 0)
    if (callback != undefined)
      callback(obj)
    self.scene.add(obj)
  })
}

APP.prototype.render =  function () {
  var self = this
  this.renderer = new THREE.WebGLRenderer()
  this.renderer.setClearColor( 0x9ef6ff )
  this.renderer.setPixelRatio( window.devicePixelRatio )
  this.renderer.setSize( window.innerWidth, window.innerHeight )
  document.body.appendChild( this.renderer.domElement )

  const render = () => {
    requestAnimationFrame( render )
    this.fn()
    self.renderer.render( self.scene, self.camera )
  }
  render()
}

//Draw floor
APP.prototype.bottom = function (wireframe) {
  var geometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 )
  geometry.rotateX( - Math.PI / 2 )

  for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {
    var vertex = geometry.vertices[ i ]
    vertex.x += Math.random() * 20 - 10
    // vertex.y += Math.random() * 2
    vertex.z += Math.random() * 20 - 10
  }

  APP.prototype.colorize(geometry, {
    c1: { r: 22, g: 145, b: 17 },
    c2: { r: 13, g: 119, b: 8 },
    c3: { r: 32, g: 117, b: 28 }
  })

  material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors, wireframe } )
  mesh = new THREE.Mesh( geometry, material )
  this.scene.add( mesh )
}

// Create Pseudo-Pommel
APP.prototype.sphere = function ( callback ) {
  var geometry = new THREE.SphereGeometry( 1, 6, 6 )
  var material = new THREE.MeshBasicMaterial( {color: 0x000000} )
  var obj = new THREE.Mesh( geometry, material )
  if (callback != undefined)
    callback(obj)
  this.scene.add(obj)
}

APP.prototype.colorize = function (obj, colors) {
  var c1 = colors.c1, c2 = colors.c2, c3 = colors.c3

  for ( var i = 0, l = obj.faces.length; i < l; i ++ ) {
    var face = obj.faces[ i ]
    face.vertexColors[ 0 ] = new THREE.Color(c1.r/256, c1.g/256, c1.b/256)
    face.vertexColors[ 1 ] = new THREE.Color(c2.r/256, c2.g/256, c3.b/256)
    face.vertexColors[ 2 ] = new THREE.Color(c3.r/256, c3.g/256, c3.b/256)
  }
}