function Player (app) {

  app.json('models/arms/arms')
    .skinning([0xE3B186, 0xE3B186])
    .after(character => {
      app.camera.add(character)
      character.translateX(0).translateZ(0).translateY(-6).scale.set(2,2,2)
      character.animation('rest').setLoop(THREE.LoopOnce, 0).play()
    })
    .load()

  app.json('models/arms/broom')
    .skinning([ 0x6A3E25 ])
    .after(function (b) {
      app.camera.add(b)
      b.translateX(0).translateZ(0).translateY(-6).scale.set(2,2,2)
    })
    .load()
}

