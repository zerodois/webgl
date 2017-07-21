function APP(WALLWIDTH, WALLHEIGHT) {
  // Scene
  this.scene = new THREE.Scene()
  this.clock = new THREE.Clock()
  this.toLoading = 0
  this.loaded = 0
  this.floor = 0
  this.mixer = []

  // Wall
  this.wallWidth = WALLWIDTH || 5000
  this.wallHeight = WALLHEIGHT || 400

  // Camera
  let viewAngle = 75,
    aspectRatio = window.innerWidth / window.innerHeight,
    near = 0.4,
    far = 27000
  this.camera = new THREE.PerspectiveCamera(viewAngle, aspectRatio, near, far)
  this.camera.updateProjectionMatrix()
  this.camera.position.z = 0
  this.listener = new THREE.AudioListener()
  this.camera.add(this.listener)
  this.setOnLoad = fn => this.loaderFn = fn

  // Camera listener
  let listener = new THREE.AudioListener()
  this.camera.add(listener)

  //Loader manager
  this.manager = new THREE.LoadingManager()
  this.manager.onLoad = this.onLoad
  this.manager.onProgress = this.onProgress

  //Private methods
  this.get = function (name) {
    if (objects[name])
      return objects[name]
    return null
  }
  this.set = function (name, obj) {
    objects[name] = obj
  }

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
  let imagePrefix = 'images/background/nottingham_'
  let directions = ['rt', 'lf', 'up', 'dn', 'bk', 'ft']
  let imageSuffix = '.png'

  let urls = []
  for (let i = 0; i < 6; i++)
    urls.push(imagePrefix + directions[i] + imageSuffix)

  let reflectionCube = new THREE.CubeTextureLoader(this.manager).load(urls)
  reflectionCube.format = THREE.RGBFormat
  this.scene.background = reflectionCube

  // Axes lines
  // let axes = new THREE.AxisHelper(100)
  // this.scene.add( axes )

  // Objects
  let objects = {'listener': listener}
  this.fn = () => {}
  this.arr = []
}

APP.prototype.onLoad = function () {
  let percent = (this.loaded/this.toLoading)*100
  if (this.loaderFn && !isNaN(percent))
    this.loaderFn(percent)
}

function onProgress(url, item, total) {}

APP.prototype.draw = function (fn) {
  this.fn = fn
}

APP.prototype.delta = function () {
  return this.clock.getDelta()
}

APP.prototype.texture = function (url, fn) {
  let texture = new THREE.Texture()
  let loader = new THREE.ImageLoader(this.manager)
  loader.load(url, function (image) {
    texture.image = image
    texture.needsUpdate = true
    if (fn)
      fn(texture)
  })
  return texture
}

APP.prototype.png = function (url) {
  let loader = new THREE.ImageLoader(this.manager)
  return this.global('png', loader, url).return(image => {
    let texture = new THREE.Texture()
    texture.image = image
    texture.needsUpdate = true
    return texture
  })
}

APP.prototype.obj = function (url) {
  let loader = new THREE.OBJLoader(this.manager)
  return this.global('obj', loader, url)
}

APP.prototype.mtl = function (url) {
  let loader = new THREE.MTLLoader(this.manager)
  return this.global('mtl', loader, url)
    .return(x => x)
}

APP.prototype.mp3 = function (url) {
  let self   = this
  let size   = 0
  let loader = new THREE.AudioLoader(this.manager)
  function to (character) {
    this.after(sound => {
      let positional = new THREE.PositionalAudio(self.listener)
      positional.setLoop(1)
      positional.setBuffer(sound)
      if (character.sounds === undefined)
        character.sounds = {}
      character.sounds[ size++ ] = positional
      character.sounds[ this.prop.name ] = positional
      character.sound = index => index === undefined ? character.sounds : character.sounds[ index ]
      character.add(positional)
    })
    return this
  }
  return this.global('mp3', loader, url)
    .add('to', to)
    .return(x => x)
}

APP.prototype.json = function (url) {
  let self = this
  let loader = new THREE.JSONLoader(this.manager)

  function mesh(arr) {
    this.return(skinning)

    function skinning(geometry, materials) {
      let mats = arr ? arr.map(item => new THREE.MeshLambertMaterial({
        color: item,
        skinning: true
      })) : materials
      let character = new THREE.SkinnedMesh(geometry, mats)
      if (geometry.animations === undefined)
        return character
      let m = new THREE.AnimationMixer(character)
      self.mixer.push(m)
      geometry.animations.forEach((a, i) => {
        let animation = null
        animation = m.clipAction(geometry.animations[i])
        animation.setEffectiveWeight(1)
        animation.clampWhenFinished = true
        animation.enabled = true
        animation.duration = geometry.animations[i].duration
        !character.actions ? character.actions = {} : false
        character.actions[i] = animation
        character.actions[geometry.animations[i].name] = character.actions[i]
      })
      character.animation = function (index) {
        if (index === undefined)
          return character.actions
        return character.actions[index]
      }
      return character
    }
    return this
  }
  return this.global('json', loader, url)
    .add('skinning', mesh)
    .return(x => x)
}

APP.prototype.global = function (ext, loader, url) {
  let self = this
  let prop = {
    before: [],
    after: []
  }
  function add(prop, fn) {
    this[prop] = fn
    return this
  }
  function construct(name) {
    return function (fn) {
      if (Array.isArray(prop[name]))
        prop[name].push(fn)
      else
        prop[name] = fn
      return this
    }
  }
  function load() {
    self.toLoading++
    let name = url.split('/').slice(-1).pop()
    prop.name = prop.as ? prop.as : name
    if (prop.path)
      loader.setPath(prop.path)
    if (prop.material)
      loader.setMaterials(prop.material)
    loader.load(`${url}.${ext}`, (obj, mat) => {
      self.loaded++
      self.onLoad()
      if (prop.return) {
        let ret = prop.return(obj)
        self.set(prop.name, ret)
        prop.before.forEach(fn => fn(ret, mat))
        prop.after.forEach(fn => fn(ret, mat))
        return true
      }
      if (prop.scale)
        obj.scale.set(prop.scale, prop.scale, prop.scale)
      obj.position.set(0, self.floor, 0)
      prop.before.forEach(fn => fn(obj, mat))
      if (prop.texture)
        obj.traverse(function (child) {
          if (child instanceof THREE.Mesh)
            child.material.map = prop.texture
        })
      self.scene.add(obj)
      self.set(prop.as ? prop.as : name, obj)
      prop.after.forEach(fn => fn(obj, mat))
    })
  }
  return {
    add,
    prop,
    load,
    path: construct('path'),
    before: construct('before'),
    texture: construct('texture'),
    material: construct('material'),
    after: construct('after'),
    scale: construct('scale'),
    return: construct('return'),
    as: construct('as')
  }
}

APP.prototype.render = function () {
  let self = this
  this.renderer = new THREE.WebGLRenderer()
  this.renderer.setClearColor(0x9ef6ff)
  this.renderer.setPixelRatio(window.devicePixelRatio)
  this.renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(this.renderer.domElement)

  const render = () => {
    requestAnimationFrame(render)
    let delta = self.delta()
    if (this.fn() !== false)
      self.mixer.forEach(m => m.update(delta))
    self.renderer.render(self.scene, self.camera)
  }
  render()
}

// Draw scenario
APP.prototype.scenario = function () {
  this.bottom()
}

//Draw floor
APP.prototype.bottom = function () {
  let geometry = new THREE.PlaneGeometry(25000, 25000, 100, 100)
  geometry.rotateX(-Math.PI / 2)

  let textureLoader = new THREE.TextureLoader(this.manager)
  let texture = textureLoader.load('images/misc/grass.png')
  let material = new THREE.MeshPhongMaterial({
    color: 0xaaaaaa,
    specular: 0x000000,
    map: texture
  })

  texture.anisotropy = 6
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(800, 800)

  let mesh = new THREE.Mesh(geometry, material)
  this.scene.add(mesh)
}

// Create Pseudo-Pommel
APP.prototype.sphere = function (callback) {
  let geometry = new THREE.SphereGeometry(1, 6, 6)
  let material = new THREE.MeshBasicMaterial({
    color: 0x000000
  })
  let obj = new THREE.Mesh(geometry, material)
  if (callback != undefined)
    callback(obj)
  this.scene.add(obj)
  // obj.add(sound)
}