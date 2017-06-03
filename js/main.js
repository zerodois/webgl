var app = new APP()
var controls
var geometry, material, mesh
var blocker = document.getElementById( 'blocker' )
var instructions = document.getElementById( 'instructions' )
var pommel, pspommel
var camStart = new THREE.Vector3( 0, 10, 30 )
var camStLookAt = new THREE.Vector3( 0, 0, 0 )

app.load('models/wolf.obj', 0.05)

app.load('models/pommel.obj', 1, obj => {
  obj.position.setX(10).setY(10)
  pommel = obj
})

// Pseudo-pommel
app.sphere( obj => {
  obj.position.setX(28).setY(20).setZ(8)
  pspommel = obj
})


app.texture('models/witch-fire.png', text => {
  app.load('models/witch.obj', 1, obj => {
    obj.position.setX(-10)
    obj.traverse( function ( child ) {
      if ( child instanceof THREE.Mesh )
        child.material.map = text
    })
  })
})

app.load('models/deer.obj', 0.01, obj => {
  obj.position.setX(10)
  shader(obj)
}, shader)

function shader (obj) {
  var material = new THREE.ShaderMaterial({
    vertexShader: document.getElementById( 'vertex-shader' ).textContent,
    fragmentShader: document.getElementById( 'fragment-shader' ).textContent
  })
  obj.traverse(function (child) {
    child.material = material
  })
}

var pointerlock = new Pointerlock()
pointerlock.check(() => {}, err)
function err () {
  instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API'
}

pointerlock.onChange(function ( event ) {
  var lock = pointerlock.hasLock()
  controlsEnabled = lock
  controls.enabled = lock
  blocker.style.display = lock ? 'none' : 'block'
  instructions.style.display = lock ? '' : '-webkit-box'
})
instructions.addEventListener( 'click', function ( event ) {
  instructions.style.display = 'none'
  pointerlock.request()
}, false )
pointerlock.onError(() => {})

controls = new THREE.PointerLockControls(app.camera)
controls.getObject().translateZ(30)
app.scene.add(controls.getObject())
app.bottom(false)
KeyboardMove.aswd()

app.draw(() => {
  if (!controlsEnabled)
    return

  movePommel()
  movePseudoPommel()
  moveCamera()
  
})

var signal = [ 1, -1 ]
var inc = [ 0.4, 0.1, 0.4 ]
var radio = 10

function movePommel() {
  if (Math.abs(pommel.position.x) <= Math.abs(pommel.position.z)) {
    pommel.position.x += inc[0] * signal[1]
    pommel.position.z = Math.sqrt(radio * radio - Math.pow(pommel.position.x, 2)) * signal[1]
  }
  else {
    pommel.position.z -= inc[2] * signal[0]
    pommel.position.x = Math.sqrt(radio * radio - Math.pow(pommel.position.z, 2)) * signal[0]
  }

  pommel.position.y -= inc[1] * signal[1]

  if (Math.abs(pommel.position.x) <= inc[0] * 0.5)
    signal[0] *= -1
  if (Math.abs(pommel.position.z) <= inc[2] * 0.5)
    signal[1] *= -1
}

var curves = [new THREE.CubicBezierCurve3(
                new THREE.Vector3( 28, 20, 8 ),
                new THREE.Vector3( -85, 20, -60 ),
                new THREE.Vector3( 117, 20, 4 ),
                new THREE.Vector3( -5, 20, 3 )
              ),
              new THREE.CubicBezierCurve3(
                new THREE.Vector3( -5, 20, 3 ),
                new THREE.Vector3( -129, 20, 3 ),
                new THREE.Vector3( 90, 20, 71 ),
                new THREE.Vector3( 28, 20, 8 )
              )]

var atCurve = 0
var curveTime = 0
var curveInc = 0.01

function movePseudoPommel() {
  pspommel.position.copy( curves[atCurve].getPointAt(curveTime += curveInc) )
  if ( Math.abs(curveTime-0.99) < 0.01 )
    curveTime = 0, atCurve ^= 1
}

var controlsEnabled = false
var prevTime = performance.now()
var velocity = new THREE.Vector3()

var startSpeed = 800.00;

function moveCamera() {
  var camera = controls.getObject()

  if ( KeyboardMove.keys.Hm ) {
    camera.position.copy( camStart )
    velocity.x = velocity.y = velocity.z = 0
  }

  var time = performance.now()
  var delta = ( time - prevTime ) / 1000
  var sft = KeyboardMove.keys.Sft
  velocity.x -= velocity.x * 10.0 * delta
  velocity.z -= velocity.z * 10.0 * delta

  //velocity.y -= 9.8 * 10.0 * delta
  if ( KeyboardMove.keys.W ) velocity.z -= startSpeed * delta * Math.max(1, sft * 3)
  if ( KeyboardMove.keys.S ) velocity.z += startSpeed * delta
  if ( KeyboardMove.keys.A ) velocity.x -= startSpeed * delta
  if ( KeyboardMove.keys.D ) velocity.x += startSpeed * delta
  
  if ( KeyboardMove.keys.Alt )
    velocity.y -= startSpeed * 0.5 * delta
  else if (velocity.y < 0.0) // take it off to turn gravity on
    velocity.y *= 0.92

  if ( KeyboardMove.keys.Spc )
    velocity.y += startSpeed * 0.4 * delta * Math.max(1, (velocity.y < 0.0) * 3)
  else if (velocity.y > 0)
    velocity.y *= 0.95

  if (camera.y <= 50.00 && velocity.y < 0.0)
    velocity.y *= 0.8
  
  camera.translateX( velocity.x * delta );
  camera.translateY( velocity.y * delta );
  camera.translateZ( velocity.z * delta );

  if ( camera.position.y < 10 ) {
    velocity.y = 0;
    camera.position.y = 10;
  }

  prevTime = time
}

window.addEventListener( 'resize', onWindowResize, false )

function onWindowResize(){
  app.camera.aspect = window.innerWidth / window.innerHeight
  app.camera.updateProjectionMatrix()

  app.renderer.setSize( window.innerWidth, window.innerHeight )
}

app.render()