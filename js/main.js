let scenarioSize = 5000
let scenarioHeight = 400
let app = new APP(scenarioSize, scenarioHeight)
let controls
let geometry, material, mesh
let blocker = document.getElementById('blocker')
let instructions = document.getElementById('instructions')
let pspommel, stick, arm, hand, handSphere
let camStart = new THREE.Vector3(0, 30, 30)
let camStLookAt = new THREE.Vector3(0, 0, 0)
let mixer = []
let sounds = []
let soundsPlaying = false

app.setOnLoad(atualize)
function atualize (percent) {
  document.querySelector('#bar .percent').style.setProperty('--percent', percent.toFixed(1) + '%')
  if (Math.floor(percent) == 100) {
    let div = document.getElementById('loading')
    div.classList.add('hide')
    window.setTimeout(() => div.style.display = 'none', 250)
  }
}

let initialBCP = new THREE.Vector3(randCoordinate(20), 40, randCoordinate(20))
let finalBCP

let curve = new THREE.CubicBezierCurve3(
  initialBCP,
  randVec(),
  randVec(),
  finalBCP = randVec()
)

let curveTime = 0
let curveInc = 0.001

app.obj('models/wolf').scale(0.05).load()

app.json('models/golden-snitch/animation/golden-snitch')
  .as('snitch')
  .skinning([0xFFD700, 0xFFD700])
  .after(character => {
    app.scene.add(character)
    character.position.setX(initialBCP.x).setY(initialBCP.y).setZ(initialBCP.z)
    character.lookAt(curve.getPointAt(curveInc))
    app.mp3('sounds/golden_snitch')
      .to(character)
      .after(x => {
        character.sound(0).setRefDistance(45)
        sounds.push(character.sound(0))
      })
      .load()
    character.animation(0).play()
  })
  .load()

app.json('models/arms/arms')
  .skinning([0xE3B186, 0xE3B186])
  .after(character => {
    arm = character
    let geometry = new THREE.SphereGeometry(0)
    let material = new THREE.MeshBasicMaterial({
      color: 0x000000
    })
    hand = new THREE.Mesh(geometry, material)
    hand.position.setX(3).setY(0.5).setZ(-8)
    hand.visible = false
    arm.add(hand)

    app.camera.add(arm)
    arm.translateX(0).translateZ(0).translateY(-6).scale.set(2, 2, 2)
    arm.rotateX(0.2)
    arm.animation('rest').setLoop(THREE.LoopOnce, 0).play()
  })
  .load()

app.json('models/arms/broom')
  .skinning([0x6A3E25])
  .after(function (b) {
    stick = b
    app.camera.add(b)
    b.translateX(0).translateZ(0).translateY(-6).scale.set(2, 2, 2)
    b.rotateX(0.2)
  })
  .load()

// Pseudo-pommel
app.sphere(obj => {
  // obj.position.setX(initialBCP.x).setY(initialBCP.y).setZ(initialBCP.z)
  obj.position.setX(10).setY(14)
  pspommel = obj
})

// app.arm(obj => {
//     arm = obj[0]
//     hand = obj[1]
//   }, obj => {
//     obj.rotateX(Math.PI / 8).rotateZ(Math.PI / 20)
// })

app.mtl('quiddich_stadium')
  .path('models/pitch/')
  .after(materials => {
    materials.preload();
    app.obj('quiddich_stadium')
      .path('models/pitch/')
      .material(materials)
      .scale(10)
      .after(obj => {
        obj.position.setY(-1200)
      })
      .load()
  })
  .load()

app.png('models/witch/witch-fire').after(texture => {
  app.obj('models/witch/witch')
    .before(obj => {
      obj.position.setX(-10)
    })
    .texture(texture)
    .load()
}).load()

app.obj('models/deer')
  .scale(0.01)
  .before(obj => {
    obj.position.setX(10)
    obj.ambient = new THREE.Vector3(0, 1, 0)
    obj.diffuse = new THREE.Vector3(0.7, 0.7, 0.7)
    obj.specular = new THREE.Vector3(0.6, 0.6, 0.6)
    obj.shininess = 100.0
  })
  .after(shader)
  .load()

app.mp3('sounds/wind')
  .to(app.camera)
  .as('wind')
  .after(x => {
    app.camera.sound('wind').position.setZ(1)
    sounds.push(app.camera.sound('wind'))
    app.camera.sound('wind').setVolume(0.07)
    if (controlsEnabled)
      app.camera.sound('wind').play()
  })
  .load()

app.mp3('sounds/hedwig')
  .to(app.camera)
  .as('music')
  .after(x => {
    app.camera.sound('music').position.setZ(1)
    sounds.push(app.camera.sound('music'))
    app.camera.sound('music').setVolume(1)
    if (controlsEnabled)
      app.camera.sound('music').play()
  })
  .load()

function shader(obj) {
  let uniforms = THREE.UniformsUtils.merge([
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

  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById('vertex-shader').textContent,
    fragmentShader: document.getElementById('fragment-shader').textContent,
    lights: true
  })

  obj.traverse(function (child) {
    child.material = material
  })
}

function randCoordinate(range, lowerBound, pos) {
  return (lowerBound || 0) + (range || scenarioSize / 3) * Math.random() *
         (pos || Math.random() > 0.5 ? 1 : -1)
}

function randVec() {
  return new THREE.Vector3(randCoordinate(),
    randCoordinate(scenarioHeight-30, 30, true),
    randCoordinate())
}

let pointerlock = new Pointerlock()
pointerlock.check(() => {}, err)

document.exitPointerLock = document.exitPointerLock ||
  document.mozExitPointerLock ||
  document.webkitExitPointerLock;

function err() {
  instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API'
}

pointerlock.onChange(function (event) {
  let lock = pointerlock.hasLock()
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
controls.getObject().position.copy(camStart)
app.scene.add(controls.getObject())

app.scenario()
KeyboardMove.aswd()
MouseClick.mclick()

let controlsEnabled = false

app.draw(() => {
  if (!controlsEnabled) {
    prevTime = performance.now()

    if (soundsPlaying) {
      sounds.forEach(sound => {
        try {
          sound.pause()
        }
        catch (e) {}
      })
      soundsPlaying = false
    }

    return false
  }

  if (!soundsPlaying) {
    sounds.forEach(sound => {
      sound.play()
    })
    soundsPlaying = true
  }

  movePseudoPommel()
  movePommel()
  moveCamera()
})

let signal = [1, -1]
let inc = [0.4, 0.1, 0.4]
let radio = 10

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
  app.get('snitch').position.copy(curve.getPointAt(curveTime += curveInc))
  if (Math.abs(curveTime - 0.9996) < 0.0005) {
    curveTime = 0
    curve = new THREE.CubicBezierCurve3(
      inicialBCP = finalBCP,
      randVec(),
      randVec(),
      finalBCP = randVec()
    )
  }
  app.get('snitch').lookAt(curve.getPointAt(curveTime + curveInc))
}

let prevTime = performance.now()
let velocity = new THREE.Vector3()

let startSpeed = 800.00
let maxCoord = [50.00, 4000.00/*450.00*/, 50.00]
let animatingArm = false
let armVisible = false
var animatingSprint = false
var sprintPosition = false

let curVolume = 0.07, nextVolume
let curInclination = 0.2, nextInclination

app.init = function (req) {
  controls.getObject().position.copy(camStart)
  velocity.x = velocity.y = velocity.z = 0
  if (req) {
    pointerlock.request();
    document.querySelector('#win').classList.add('none')
  }
}

function moveCamera() {
  let camera = controls.getObject()

  app.get('witch').rotateY(0.01)

  if (KeyboardMove.keys.Hm)
    app.init();

  let time = performance.now()
  let delta = (time - prevTime) / 1000
  let sft = KeyboardMove.keys.Sft
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
  else if (camera.position.y <= 60.00 && velocity.y < 0.0 || camera.position.y + 30.00 >= maxCoord[1] && velocity.y > 0.0)
    velocity.y *= 0.9

  camera.translateX(velocity.x * delta)
  camera.translateY(velocity.y * delta)
  camera.translateZ(velocity.z * delta)

  if (camera.position.y < 30) {
    velocity.y = 0
    camera.position.y = 30
  }

  if (MouseClick.right && !animatingArm && !armVisible) {
    animatingArm = true
    app.get('arms').animation('rest').stop()
    app.get('arms').animation('back').stop()
    app.get('arms').animation('get').setLoop(THREE.LoopOnce, 0).play()
    setTimeout(function() {
        animatingArm = false
        armVisible = true
      },
      app.get('arms').animation('get').duration * 1000 + 10
    )
  }
  else if (!MouseClick.right && !animatingArm && armVisible) {
    animatingArm = true
    app.get('arms').animation('get').stop()
    app.get('arms').animation('back').setLoop(THREE.LoopOnce, 0).play()
    setTimeout(function() {
        animatingArm = false
        armVisible = false
      },
      app.get('arms').animation('back').duration * 1000 + 10
    )
  }

  let sprint = sft && KeyboardMove.keys.W
  animateSprint(sprint ? 0.0 : 0.2)

  let handPos = new THREE.Vector3()
  handPos.setFromMatrixPosition(hand.matrixWorld)

  if (armVisible && app.get('snitch').position.distanceTo(handPos) < 5) {
    document.querySelector('#win').classList.remove('none')
    document.exitPointerLock();
    camera.position.copy(camStart)
    velocity.x = velocity.y = velocity.z = 0
  }

  if (Math.abs(velocity.x * delta) > 1 || Math.abs(velocity.y * delta) > 1 ||
      Math.abs(velocity.z * delta) > 1)
    fadeSound(sprint ? 0.8 : 0.2)
  else
    fadeSound(0.07)

  prevTime = time
}

function fadeSound(volume) {
  nextVolume = volume

  let diff = curVolume - nextVolume
  if (Math.abs(diff) > 0.009) {
    let inc = (diff > 0.00 ? -1 : 1) * (Math.abs(diff) > 0.2 ? 0.03 : 0.02)
    if (inc < 0.00 && curVolume + inc < nextVolume ||
        inc > 0.00 && curVolume + inc > nextVolume)
      inc = nextVolume - curVolume

    curVolume += inc
    app.camera.sound('wind').setVolume(curVolume)
  }
}

function animateSprint(inclination) {
  nextInclination = inclination

  let diff = curInclination - nextInclination
  if (Math.abs(diff) > 0.009) {
    let inc = (diff > 0.00 ? -1 : 1) * (Math.abs(diff) > 0.1 ? 0.03 : 0.04)
    if (inc < 0.00 && curInclination + inc < nextInclination ||
        inc > 0.00 && curInclination + inc > nextInclination)
      inc = nextInclination - curInclination

    curInclination += inc
    arm.rotateX(inc)
    stick.rotateX(inc)
  }
}

window.addEventListener('resize', onWindowResize, false)

function onWindowResize() {
  app.camera.aspect = window.innerWidth / window.innerHeight
  app.camera.updateProjectionMatrix()

  app.renderer.setSize(window.innerWidth, window.innerHeight)
}

app.render()