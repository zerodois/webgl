let scenarioHeight = 1700
let app = new APP()
let controls
let geometry, material, mesh
let blocker = document.getElementById('blocker')
let instructions = document.getElementById('instructions')
let stick, arm, hand, handSphere
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

function getCurveInc(atCurve) {
  return Math.max(1, Math.round( 11.2 * 100000 / atCurve.getLength() )) / 100000
}

let curveTime = 0
let curveInc = getCurveInc(curve)

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

app.mtl('quiddich_stadium')
  .path('models/pitch/')
  .after(materials => {
    materials.preload()
    app.obj('quiddich_stadium')
      .path('models/pitch/')
      .material(materials)
      .scale(10)
      .after(obj => {
        obj.position.setX(100).setY(-1200).setZ(-260)
        obj.rotateY(1.035)
      })
      .load()
  })
  .load()

app.mtl('wand')
  .path('models/wand/')
  .after(materials => {
    materials.preload()
    app.obj('wand')
      .as('wand')
      .path('models/wand/')
      .material(materials)
      .scale(2)
      .after(obj => {
        obj.position.setX(12).setY(5.5).setZ(-10)
        obj.rotateY(Math.PI)
        app.camera.add(obj)
      })
      .load()
  })
  .load()

app.png('models/witch/witch-fire').after(texture => {
  app.obj('models/witch/witch')
    .scale(20)
    .before(obj => {
      obj.position.setX(5900).setY(1070).setZ(-200)
    })
    .after(obj => {
      obj.rotateY(-Math.PI / 3)
    })
    .texture(texture)
    .load()
}).load()

app.obj('models/deer')
  .scale(0.25)
  .before(obj => {
    obj.position.setX(5900).setY(1070).setZ(100)
    obj.ambient = new THREE.Vector3(0, 0, 1)
    obj.diffuse = new THREE.Vector3(0.4, 0.4, 0.4)
    obj.specular = new THREE.Vector3(0.5, 0.5, 0.5)
    obj.shininess = 100.0
  })
  .after(obj => {
    shader
    obj.rotateX(0.05).rotateY(Math.PI * 7/8).rotateZ(-Math.PI / 10)
  })
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
    app.camera.sound('music').setVolume(0.5)
    if (controlsEnabled)
      app.camera.sound('music').play()
  })
  .load()

app.mp3('sounds/win')
  .to(app.camera)
  .after(x => {
    app.camera.sound('win').position.setZ(1)
    app.camera.sound('win').setVolume(1)
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
  ])

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

function randDLightCoord(positive) {
  return (positive ? 350 : 200) * Math.random() * (positive || Math.random() > 0.5 ? 1 : -1)
}

function randDLightVec() {
  return new THREE.Vector3(5900 + randDLightCoord(), 1070 + randDLightCoord(true), 100 + randDLightCoord())
}

let hasDeerLights = false
let deerLights = []
let iDLightsPos = []
let fDLightsPos = []
let curvesDLight = []

function createDeerLights() {
  hasDeerLights = true

  function createLight(color) {
    var pointLight = new THREE.PointLight(color, 0.8, 300)
    var geometry = new THREE.SphereGeometry(2, 24, 12)
    var material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: 0xffffff
    })

    var sphere = new THREE.Mesh(geometry, material)
    pointLight.add(sphere)
    return pointLight
  }

  let numLights = 5
  while (numLights--) {
    let pointLight = createLight(0x5555ff)
    let pos = randDLightVec()
    pointLight.position.copy(pos)
    app.scene.add(pointLight)

    deerLights.push(pointLight)
    iDLightsPos.push(pos)

    let endPos = randDLightVec()
    fDLightsPos.push(endPos)
    curvesDLight.push(
      new THREE.CubicBezierCurve3(
        pos,
        randDLightVec(),
        randDLightVec(),
        endPos
    ))
  }
}

function randCoordinate(range, lowerBound, pos) {
  return (lowerBound || 0) + (range || 12345) * Math.random() *
         (pos || Math.random() > 0.5 ? 1 : -1)
}

function randVec() {
  let y = randCoordinate(scenarioHeight - 30, 30, true)
  let z = randCoordinate(12570)
  
  let temp = 29052100 * Math.pow(z, 2) / 158004900
  while (29052100 - temp < 0.0001) {
    z = randCoordinate()
    temp = 29052100 * Math.pow(z, 2) / 158004900
  }  
  let x = randCoordinate(Math.sqrt(29052100 - temp))

  return new THREE.Vector3(x, y, z)
}

let pointerlock = new Pointerlock()
pointerlock.check(() => {}, err)

document.exitPointerLock = document.exitPointerLock ||
  document.mozExitPointerLock ||
  document.webkitExitPointerLock

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
KeyboardMove.aswd(getCheat)
MouseClick.mclick()

let superSprint = false
let stopSnitch = false

function getCheat() {
  if (pointerlock.hasLock())
    return false

  let cheat = prompt('Type a cheat code:')
  switch(cheat) {
    case 'super sprint':
      superSprint = true
      break
    case 'normal sprint':
      superSprint = false
      break
    case 'stop snitch':
      stopSnitch = true
      break
    case 'play snitch':
      stopSnitch = false
      break
    case 'enable wand':
      app.get('wand').visible = true
      break
    case 'disable wand':
      app.get('wand').visible = false
      break
    case 'enable lights':
    if (!hasDeerLights)    
        createDeerLights()
      break
    case 'reset':
      superSprint = false
      stopSnitch = false
      break
  }
}

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

  if (hasDeerLights)
    moveDLights()
  if (!stopSnitch)
    moveSnitch()
  moveCamera()

})

let DLcurveTime = 0
let DLcurveInc = 0.003

function moveDLights() {
  DLcurveTime += DLcurveInc
  let ended = Math.abs(DLcurveTime - 0.999) < 0.002
  for (i in deerLights) {
    deerLights[i].position.copy(curvesDLight[i].getPointAt(DLcurveTime))
    if (ended)
      curvesDLight[i] = new THREE.CubicBezierCurve3(
        iDLightsPos[i] = fDLightsPos[i],
        randDLightVec(),
        randDLightVec(),
        fDLightsPos[i] = randDLightVec()
      )
  }
  if (ended)
    DLcurveTime = 0
}

function moveSnitch() {
  app.get('snitch').position.copy(curve.getPointAt(curveTime += curveInc))
  if (Math.abs(curveTime - 0.999) < 0.001) {
    curveTime = 0
    curve = new THREE.CubicBezierCurve3(
      inicialBCP = finalBCP,
      randVec(),
      randVec(),
      finalBCP = randVec()
    )
    curveInc = getCurveInc(curve)
  }
  app.get('snitch').lookAt(curve.getPointAt(curveTime + curveInc))
}

let prevTime = performance.now()
let velocity = new THREE.Vector3()

let startSpeed = 800.00
let maxCoord = [50.00, 1700.00, 50.00]
let animatingArm = false
let armVisible = false
var animatingSprint = false
var sprintPosition = false

let curVolume = 0.07, nextVolume
let curInclination = 0.2, nextInclination

app.init = function (req) {
  if (req) {
    app.camera.sound('win').stop()
    document.querySelector('#win').classList.add('none')
    return true
  }
  
  controls.getObject().position.copy(camStart)
  velocity.x = velocity.y = velocity.z = 0
  sounds.forEach(s => s.stop())

  soundsPlaying = false
  animatingArm = false
  armVisible = false
  curInclination = 0.2
  curVolume = 0.07
  
  app.get('arms').animation('rest').stop()
  app.get('arms').animation('back').stop()
  app.get('arms').animation('get').stop()
  app.get('arms').animation('rest').play()
}

function moveCamera() {
  let camera = controls.getObject()

  if (KeyboardMove.keys.Hm)
    app.init()

  let time = performance.now()
  let delta = (time - prevTime) / 1000
  let sft = KeyboardMove.keys.Sft
  velocity.x -= velocity.x * 10.0 * delta
  velocity.z -= velocity.z * 10.0 * delta

  let sprintMultiplier = Math.max(1, sft * (superSprint ? 12 : 3))

  //velocity.y -= 9.8 * 10.0 * delta
  if (KeyboardMove.keys.W) velocity.z -= startSpeed * delta * sprintMultiplier
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

  let incX = velocity.x * delta * 3
  let incZ = velocity.z * delta * 3
  camera.translateX(incX)
  camera.translateZ(incZ)

  if (!insideEllipsis(camera.position.x, camera.position.z)) {
    camera.translateX(-1.1 * incX)
    camera.translateZ(-1.1 * incZ)
    
    if (!insideEllipsis(camera.position.x, camera.position.z)) {
      camera.translateX(0.1 * incX)
      camera.translateZ(0.1 * incZ)
    } 
  }

  camera.translateY(velocity.y * delta * 1.5 * sprintMultiplier)

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
  console.log(app.get('snitch').position.distanceTo(handPos))
  if (armVisible && app.get('snitch').position.distanceTo(handPos) < 10) {
    app.init()
    app.camera.sound('win').play()
    document.querySelector('#win').classList.remove('none')
    document.exitPointerLock()
  }

  if (Math.abs(velocity.x * delta) > 1 || Math.abs(velocity.y * delta) > 1 ||
      Math.abs(velocity.z * delta) > 1)
    fadeSound(sprint ? 0.8 : 0.2)
  else
    fadeSound(0.07)

  let curvePoint = new THREE.Vector3()
  curvePoint.setFromMatrixPosition(app.get('snitch').matrixWorld)
  app.get('wand').lookAt( app.camera.worldToLocal( curvePoint ) );

  prevTime = time
}

function insideEllipsis(x, z) {
  return Math.pow(z,2) / 158004900 + Math.pow(x,2) / 29052100 - 1 < 0.0001
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
