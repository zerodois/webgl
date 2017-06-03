var app = new APP()
var controls
var geometry, material, mesh
var blocker = document.getElementById( 'blocker' )
var instructions = document.getElementById( 'instructions' )
var pommel, pspommel

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


var controlsEnabled = false
var prevTime = performance.now()
var velocity = new THREE.Vector3()

controls = new THREE.PointerLockControls(app.camera)
controls.getObject().translateZ(30)
app.scene.add(controls.getObject())
app.bottom(false)
KeyboardMove.aswd()

var signal = [ 1, -1 ]
var inc = [ 0.4, 0.1, 0.4 ]
var radio = 10

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

app.draw(() => {
  if (!controlsEnabled)
    return

  // Pommel 1
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

  // Pseudo-pommel 2
  pspommel.position.copy(curves[atCurve].getPointAt(curveTime += curveInc))

  if (Math.abs(curveTime-0.99) < 0.001)
    curveTime = 0, atCurve ^= 1
  

  // Camera
  var time = performance.now()
  var delta = ( time - prevTime ) / 1000
  velocity.x -= velocity.x * 10.0 * delta
  velocity.z -= velocity.z * 10.0 * delta
  velocity.y -= 9.8 * 100.0 * delta // 100.0 = mass
  if ( KeyboardMove.keys.W ) velocity.z -= 400.0 * delta
  if ( KeyboardMove.keys.S ) velocity.z += 400.0 * delta
  if ( KeyboardMove.keys.A ) velocity.x -= 400.0 * delta
  if ( KeyboardMove.keys.D ) velocity.x += 400.0 * delta
  
  controls.getObject().translateX( velocity.x * delta )
  controls.getObject().translateY( velocity.y * delta )
  controls.getObject().translateZ( velocity.z * delta )
  controls.getObject().position.y = 10
  prevTime = time
})

window.addEventListener( 'resize', onWindowResize, false )

function onWindowResize(){
  app.camera.aspect = window.innerWidth / window.innerHeight
  app.camera.updateProjectionMatrix()

  app.renderer.setSize( window.innerWidth, window.innerHeight )
}

app.render()