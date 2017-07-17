var scenarioSize = 5000
var scenarioHeight = 400
var app = new APP(scenarioSize, scenarioHeight)
var controls
var geometry, material, mesh
var blocker = document.getElementById('blocker')
var instructions = document.getElementById('instructions')
var pommel, pspommel, stick, arm, hand, handSphere
var camStart = new THREE.Vector3(0, 10, 30)
var camStLookAt = new THREE.Vector3(0, 0, 0)
var mixer = null

var initialBCP = new THREE.Vector3(randCoordinate(20), 20, randCoordinate(20))
var finalBCP

var curve = new THREE.CubicBezierCurve3(
  initialBCP,
  randVec(),
  randVec(),
  finalBCP = randVec()
)

var curveTime = 0
var curveInc = 0.001

app.load('models/wolf.obj', 0.05)

var loader = new THREE.JSONLoader()
loader.load('models/golden-snitch/animation/golden-snitch.json', function (geometry, materials) {
  materials.forEach(function (material) {
    material.skinning = true
  })
  character = new THREE.SkinnedMesh(
    geometry,
    new THREE.MeshBasicMaterial( { color: 0xFFD700, skinning: true } )
  )

  mixer = new THREE.AnimationMixer(character)
  animation = mixer.clipAction(geometry.animations[ 0 ])
  animation.setEffectiveWeight(1)
  animation.clampWhenFinished = true
  animation.enabled = true

  pommel = character
  app.scene.add(character)
  pommel.position.setX(initialBCP.x).setY(initialBCP.y).setZ(initialBCP.z)
  pommel.lookAt(curve.getPointAt(curveInc))
  
  addSound(character)

  isLoaded = true
  animation.play()
})

// Pseudo-pommel
app.sphere(obj => {
  // obj.position.setX(initialBCP.x).setY(initialBCP.y).setZ(initialBCP.z)
  obj.position.setX(10).setY(14)
  pspommel = obj
})

app.arm(obj => {
  arm = obj[0]
  hand = obj[1]
}, obj => {
  obj.rotateX(Math.PI/8).rotateZ(Math.PI/20)
})

// app.load('models/nimbus2000.obj', 0.06, obj => {
//   obj.position.setX(20).setY(4.5).setZ(2)
//   stick = obj
// }, obj => {
//   obj.rotateY(Math.PI / 4).rotateZ(-Math.PI / 4)
// })

app.load('models/stadium/QuiddichStadium.obj', 1, obj => {
  obj.position.setZ(-5000)
})

var witch
app.texture('models/witch-fire.png', text => {
  app.load('models/witch.obj', 1, obj => {
    obj.position.setX(-10)
    witch = obj
    obj.traverse(function (child) {
      if (child instanceof THREE.Mesh)
        child.material.map = text
    })
  })
})

app.load('models/deer.obj', 0.01, obj => {
  obj.position.setX(10)
  obj.ambient = new THREE.Vector3(0, 1, 0)
  obj.diffuse = new THREE.Vector3(0.7, 0.7, 0.7)
  obj.specular = new THREE.Vector3(0.6, 0.6, 0.6)
  obj.shininess = 100.0

  shader(obj)
}, shader)

function shader(obj) {
  var uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib["lights"],
    {
      lightPosition: {
        type: "v3",
        value: app.directional.position
      }
    },
    {
      ambientProduct: {
        type: "v3",
        value: app.directional.ambient.multiply(obj.ambient)
      }
    },
    {
      diffuseProduct: {
        type: "v3",
        value: app.directional.diffuse.multiply(obj.diffuse)
      }
    },
    {
      specularProduct: {
        type: "v3",
        value: app.directional.specular.multiply(obj.specular)
      }
    },
    {
      shininess: {
        type: "float",
        value: obj.shininess
      }
    }
  ]);

  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById('vertex-shader').textContent,
    fragmentShader: document.getElementById('fragment-shader').textContent,
    lights: true
  })

  obj.traverse(function (child) {
    child.material = material
  })
}

function addSound(obj) {
  var listener = new THREE.AudioListener()
  app.camera.add(listener)

  var sound = new THREE.PositionalAudio(listener)
  sound.setLoop(1)
  var audioLoader = new THREE.AudioLoader()
  audioLoader.load('sounds/hedwig.mp3', function (buffer) {
    sound.setBuffer(buffer)
    sound.setRefDistance(45)
    sound.play()
  })

  obj.add(sound)
}

function randCoordinate(limit, pos) {
  return (limit || scenarioSize) / 2 * Math.random() * (pos || Math.random() > 0.5 ? 1 : -1)
}

function randVec() {
  return new THREE.Vector3(randCoordinate(),
    randCoordinate(scenarioHeight, true),
    randCoordinate())
}

var pointerlock = new Pointerlock()
pointerlock.check(() => {}, err)

document.exitPointerLock = document.exitPointerLock ||
  document.mozExitPointerLock ||
	document.webkitExitPointerLock;

function err() {
  instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API'
}

pointerlock.onChange(function (event) {
  var lock = pointerlock.hasLock()
  controlsEnabled = lock
  controls.enabled = lock
  blocker.style.display = lock ? 'none' : 'block'
  instructions.style.display = lock ? '' : '-webkit-box'
})
instructions.addEventListener('click', function (event) {
  instructions.style.display = 'none'
  pointerlock.request()
}, false)
pointerlock.onError(() => {})

controls = new THREE.PointerLockControls(app.camera)
controls.getObject().translateZ(30)
app.scene.add(controls.getObject())

app.camera.add(arm)
arm.translateX(2).translateY(-2.3)
arm.visible = false

app.scenario()
KeyboardMove.aswd()
MouseClick.mclick()

var controlsEnabled = false

app.draw(() => {
  if (!controlsEnabled) {
    prevTime = performance.now()
    return
  }

  var delta = app.delta();
  mixer.update(delta);


  movePseudoPommel()
  movePommel()
  moveCamera()
})

var signal = [1, -1]
var inc = [0.4, 0.1, 0.4]
var radio = 10

function movePseudoPommel() {
  if (Math.abs(pspommel.position.x) <= Math.abs(pspommel.position.z)) {
    pspommel.position.x += inc[0] * signal[1]
    pspommel.position.z = Math.sqrt(radio * radio - Math.pow(pspommel.position.x, 2)) * signal[1]
  } else {
    pspommel.position.z -= inc[2] * signal[0]
    pspommel.position.x = Math.sqrt(radio * radio - Math.pow(pspommel.position.z, 2)) * signal[0]
  }

  pspommel.position.y -= inc[1] * signal[1]

  if (Math.abs(pspommel.position.x) <= inc[0] * 0.5)
    signal[0] *= -1
  if (Math.abs(pspommel.position.z) <= inc[2] * 0.5)
    signal[1] *= -1
}

function movePommel() {
  pommel.position.copy(curve.getPointAt(curveTime += curveInc))
  if (Math.abs(curveTime - 0.9996) < 0.0005) {
    curveTime = 0
    curve = new THREE.CubicBezierCurve3(
      inicialBCP = finalBCP,
      randVec(),
      randVec(),
      finalBCP = randVec()
    )
  }
  pommel.lookAt(curve.getPointAt(curveTime + curveInc))
}

var prevTime = performance.now()
var velocity = new THREE.Vector3()

var startSpeed = 800.00
var maxCoord = [50.00, 450.00, 50.00]

function moveCamera() {
  var camera = controls.getObject()

  witch.rotateY(0.01)

  if (KeyboardMove.keys.Hm) {
    camera.position.copy(camStart)
    velocity.x = velocity.y = velocity.z = 0
  }

  var time = performance.now()
  var delta = (time - prevTime) / 1000
  var sft = KeyboardMove.keys.Sft
  velocity.x -= velocity.x * 10.0 * delta
  velocity.z -= velocity.z * 10.0 * delta

  //velocity.y -= 9.8 * 10.0 * delta
  if (KeyboardMove.keys.W) velocity.z -= startSpeed * delta * Math.max(1, sft * 3)
  if (KeyboardMove.keys.S) velocity.z += startSpeed * delta
  if (KeyboardMove.keys.A) velocity.x -= startSpeed * delta
  if (KeyboardMove.keys.D) velocity.x += startSpeed * delta

  if (KeyboardMove.keys.C)
    velocity.y -= startSpeed * 0.5 * delta
  else if (velocity.y < 0.0) // take it off to turn gravity on
    velocity.y *= 0.92

  if (KeyboardMove.keys.Spc)
    velocity.y += startSpeed * 0.4 * delta * Math.max(1, (velocity.y < 0.0) * 3)
  else if (velocity.y > 0.0)
    velocity.y *= 0.95

  if (camera.position.y >= maxCoord[1] && velocity.y > 0.0)
    velocity.y = 0.0
  else if (camera.position.y <= 30.00 && velocity.y < 0.0 || camera.position.y + 30.00 >= maxCoord[1] && velocity.y > 0.0)
    velocity.y *= 0.9

  camera.translateX(velocity.x * delta);
  camera.translateY(velocity.y * delta);
  camera.translateZ(velocity.z * delta);

  if (camera.position.y < 10) {
    velocity.y = 0;
    camera.position.y = 10;
  }

  arm.visible = MouseClick.right

  var handPos = new THREE.Vector3()
  handPos.setFromMatrixPosition(hand.matrixWorld)

  if (arm.visible && pommel.position.distanceTo(handPos) < 5)
  {
    document.exitPointerLock();
    camera.position.copy(camStart)
    velocity.x = velocity.y = velocity.z = 0
    arm.visible = false
  }

  prevTime = time
}

window.addEventListener('resize', onWindowResize, false)

function onWindowResize() {
  app.camera.aspect = window.innerWidth / window.innerHeight
  app.camera.updateProjectionMatrix()

  app.renderer.setSize(window.innerWidth, window.innerHeight)
}

app.render()