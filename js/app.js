function APP (WALLWIDTH, WALLHEIGHT) {
  // Scene
  this.scene = new THREE.Scene()
  this.floor = 0

  // Wall
  this.wallWidth = WALLWIDTH || 5000
  this.wallHeight = WALLHEIGHT || 400

  // Camera
  var viewAngle = 75,
      aspectRatio = window.innerWidth/window.innerHeight,
      near = 0.4,
      far = 20000
  this.camera = new THREE.PerspectiveCamera( viewAngle, aspectRatio, near, far )
  this.camera.updateProjectionMatrix()
  this.camera.position.z = 0

  //Loader manager
  this.manager = new THREE.LoadingManager()
  this.manager.onLoad = onLoad
  this.manager.onProgress = onProgress

  // Light
  this.light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 1 )
  // this.light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 )
  // this.light = new THREE.DirectionalLight( 0xff0000 )
  this.light.position.set( 0.5, 1, 0.75 )
  // this.light.position.set( 1, 0, 1 ).normalize()
  this.scene.add( this.light )

  //Directional Light
  this.directional = new THREE.DirectionalLight( 0xeeeeff )
  this.directional.position.set( 0.5, 1, 0.75 )
  this.directional.ambient = new THREE.Vector3(1.0 , 1.0 , 1.0)
  this.directional.diffuse = new THREE.Vector3(1.0 , 1.0 , 1.0)
  this.directional.specular = new THREE.Vector3(1.0 , 1.0 , 1.0)

  // this.light.position.set( 1, 0, 1 ).normalize()
  this.scene.add( this.directional )

  // Scene background
  // http://www.custommapmakers.org/skyboxes.php
  var imagePrefix = "images/background/hills2_"
	var directions  = ["rt", "lf", "up", "dn", "bk", "ft"]
	var imageSuffix = ".png"
  
  var urls = [];
	for (var i = 0; i < 6; i++)
		urls.push( imagePrefix + directions[i] + imageSuffix )

  var reflectionCube = new THREE.CubeTextureLoader().load( urls );
  reflectionCube.format = THREE.RGBFormat;
  this.scene.background = reflectionCube;

  // Axes lines
  // var axes = new THREE.AxisHelper(100);
	// this.scene.add( axes );

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

// Draw scenario
APP.prototype.scenario = function () {
  this.bottom()
  this.walls(0, -this.wallWidth/2, 0)
  this.walls(0, this.wallWidth/2, Math.PI)
  this.walls(-this.wallWidth/2, 0, Math.PI/2)
  this.walls(this.wallWidth/2, 0, -Math.PI/2)
}

//Draw floor
APP.prototype.bottom = function () {
  var geometry = new THREE.PlaneGeometry( 20000, 20000, 100, 100 )
  geometry.rotateX( - Math.PI / 2 )

  var textureLoader = new THREE.TextureLoader();
  var texture = textureLoader.load('images/misc/grass.png');
  texture.anisotropy = 4;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 800, 800 );
  var material = new THREE.MeshBasicMaterial({map: texture});

  var mesh = new THREE.Mesh( geometry, material )
  this.scene.add( mesh )
}

// Draw a wall
APP.prototype.walls = function (x, z, angle) {
  var geometry = new THREE.PlaneGeometry( this.wallWidth, this.wallHeight, 100, 100 )
  geometry.rotateY( angle )

  var textureLoader = new THREE.TextureLoader();
  var texture = textureLoader.load('images/misc/wall.jpg');
  texture.anisotropy = 1;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 20, 2 );
  var material = new THREE.MeshBasicMaterial({map: texture});
  
  var mesh = new THREE.Mesh( geometry, material )
  this.scene.add( mesh )
  mesh.position.setX(x).setY(100).setZ(z)
}

// Create Pseudo-Pommel
APP.prototype.sphere = function ( callback ) {
  var listener = new THREE.AudioListener()
  this.camera.add( listener )
  
  var sound = new THREE.PositionalAudio( listener )
  sound.setLoop( 1 )
  var audioLoader = new THREE.AudioLoader()
  audioLoader.load( 'sounds/hedwig.mp3', function( buffer ) {
    sound.setBuffer( buffer )
    sound.setRefDistance( 45 )
    sound.play()
  })

  var geometry = new THREE.SphereGeometry( 1, 6, 6 )
  var material = new THREE.MeshBasicMaterial( {color: 0x000000} )
  var obj = new THREE.Mesh( geometry, material )
  if (callback != undefined)
    callback(obj)
  this.scene.add(obj)
  obj.add( sound )
}
