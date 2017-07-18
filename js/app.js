function APP(WALLWIDTH, WALLHEIGHT) {
  // Scene
  this.scene = new THREE.Scene()
  this.clock = new THREE.Clock()
  this.floor = 0

  // Wall
  this.wallWidth = WALLWIDTH || 5000
  this.wallHeight = WALLHEIGHT || 400

  // Camera
  var viewAngle = 75,
    aspectRatio = window.innerWidth / window.innerHeight,
    near = 0.4,
    far = 20000
  this.camera = new THREE.PerspectiveCamera(viewAngle, aspectRatio, near, far)
  this.camera.updateProjectionMatrix()
  this.camera.position.z = 0

  //Loader manager
  this.manager = new THREE.LoadingManager()
  this.manager.onLoad = onLoad
  this.manager.onProgress = onProgress

  // Light
  this.light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 1)
  // this.light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 )
  // this.light = new THREE.DirectionalLight( 0xff0000 )
  this.light.position.set(0.5, 1, 0.75)
  // this.light.position.set( 1, 0, 1 ).normalize()
  this.scene.add(this.light)
  
  //Directional Light
  this.directional = new THREE.DirectionalLight(0xeeeeff)
  this.directional.position.set(0.5, 1, 0.75)
  this.directional.ambient = new THREE.Vector3(1.0, 1.0, 1.0)
  this.directional.diffuse = new THREE.Vector3(1.0, 1.0, 1.0)
  this.directional.specular = new THREE.Vector3(1.0, 1.0, 1.0)

  // this.light.position.set( 1, 0, 1 ).normalize()
  this.scene.add(this.directional)

  // Scene background
  // http://www.custommapmakers.org/skyboxes.php
  var imagePrefix = "images/background/hills2_"
  var directions = ["rt", "lf", "up", "dn", "bk", "ft"]
  var imageSuffix = ".png"

  var urls = []
  for (var i = 0; i < 6; i++)
    urls.push(imagePrefix + directions[i] + imageSuffix)

  var reflectionCube = new THREE.CubeTextureLoader().load(urls)
  reflectionCube.format = THREE.RGBFormat
  this.scene.background = reflectionCube

  // Axes lines
  // var axes = new THREE.AxisHelper(100)
  // this.scene.add( axes )

  // Objects
  this.fn = () => {}
  this.arr = []
}

function onLoad() {}

function onProgress(url, item, total) {}

APP.prototype.draw = function (fn) {
  this.fn = fn
}

APP.prototype.delta = function () {
  return this.clock.getDelta() }

APP.prototype.texture = function (url, fn) {
  var texture = new THREE.Texture()
  var loader = new THREE.ImageLoader(this.manager)
  loader.load(url, function (image) {
    texture.image = image
    texture.needsUpdate = true
    if (fn)
      fn(texture)
  })
  return texture
}

APP.prototype.load = function (url, scale, callback, endcallback) {
  var loader = new THREE.OBJLoader(this.manager)
  var self = this
  loader.load(url, obj => {
    obj.scale.set(scale, scale, scale)
    obj.position.set(0, this.floor, 0)
    if (callback != undefined)
      callback(obj)
    self.scene.add(obj)
    if (endcallback != undefined)
      endcallback(obj)
  })
}

APP.prototype.render = function () {
  var self = this
  this.renderer = new THREE.WebGLRenderer()
  this.renderer.setClearColor(0x9ef6ff)
  this.renderer.setPixelRatio(window.devicePixelRatio)
  this.renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(this.renderer.domElement)

  const render = () => {
    requestAnimationFrame(render)
    this.fn()
    self.renderer.render(self.scene, self.camera)
  }
  render()
}

// Draw scenario
APP.prototype.scenario = function () {
  this.bottom()
  this.wall(0, -this.wallWidth / 2, 0)
  this.wall(0, this.wallWidth / 2, Math.PI)
  this.wall(-this.wallWidth / 2, 0, Math.PI / 2)
  this.wall(this.wallWidth / 2, 0, -Math.PI / 2)
}

//Draw floor
APP.prototype.bottom = function () {
  var geometry = new THREE.PlaneGeometry(20000, 20000, 100, 100)
  geometry.rotateX(-Math.PI / 2)

  var textureLoader = new THREE.TextureLoader()
  var texture = textureLoader.load('images/misc/grass.png')
  var material = new THREE.MeshPhongMaterial({
    color: 0xaaaaaa,
    specular: 0x000000,
    map: texture
  })

  texture.anisotropy = 6
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(800, 800)

  var mesh = new THREE.Mesh(geometry, material)
  this.scene.add(mesh)
}

// Draw a wall
APP.prototype.wall = function (x, z, angle) {
  var geometry = new THREE.PlaneGeometry(this.wallWidth, this.wallHeight, 100, 100)
  geometry.rotateY(angle)

  var textureLoader = new THREE.TextureLoader()
  var texture = textureLoader.load('images/misc/wall.jpg')

  var material = new THREE.MeshBasicMaterial({
    map: texture
  })
  
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(20, 2)

  var mesh = new THREE.Mesh(geometry, material)
  this.scene.add(mesh)
  mesh.position.setX(x).setY(100).setZ(z)
}

// Create Pseudo-Pommel
APP.prototype.sphere = function (callback) {
  // var listener = new THREE.AudioListener()
  // this.camera.add(listener)

  // var sound = new THREE.PositionalAudio(listener)
  // sound.setLoop(1)
  // var audioLoader = new THREE.AudioLoader()
  // audioLoader.load('sounds/hedwig.mp3', function (buffer) {
  //   sound.setBuffer(buffer)
  //   sound.setRefDistance(45)
  //   sound.play()
  // })

  var geometry = new THREE.SphereGeometry(1, 6, 6)
  var material = new THREE.MeshBasicMaterial({
    color: 0x000000
  })
  var obj = new THREE.Mesh(geometry, material)
  if (callback != undefined)
    callback(obj)
  this.scene.add(obj)
  // obj.add(sound)
}

// Create Pseudo-Arm
APP.prototype.arm = function (callback, callback2) {
  var obj = new THREE.Object3D()
  
  var geometry = new THREE.BoxGeometry(1, 1, 10)
  var material = new THREE.MeshBasicMaterial({
    color: 0xA98765
  })
  obj.add (new THREE.Mesh(geometry, material))

  geometry = new THREE.BoxGeometry(1.8, 0.5, 3)
  material = new THREE.MeshBasicMaterial({
    color: 0xA98775
  })
  var hand = new THREE.Object3D()
  hand.add(new THREE.Mesh(geometry, material))
  
  geometry = new THREE.BoxGeometry(1.4, 0.5, 0.5)
  
  var finger = new THREE.Mesh(geometry, material)
  finger.position.setX(-1.5).setZ(1)
  hand.add(finger)

  hand.position.setZ(-6)
  obj.add(hand)

  if (callback != undefined)
    callback([obj, hand])
  this.scene.add(obj)
  if (callback2 != undefined)
    callback2(obj)

  hand.rotateX(Math.PI/6).rotateZ(-Math.PI/6).translateY(0.5).translateX(-0.3)
  finger.rotateY(-Math.PI/4).rotateZ(Math.PI/8).translateZ(-0.6).translateX(-0.3)
}