var app = new APP();
var controls;
var geometry, material, mesh;
var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );
var pomo

app.load('models/wolf.obj', 0.05);

app.load('models/pomo.obj', 1, obj => {
  obj.position.setY(10).setX(10)
  pomo = obj
});

app.texture('models/witch-fire.png', text => {
  app.load('models/witch.obj', 1, obj => {
    obj.position.setX(-10)
    obj.traverse( function ( child ) {
      if ( child instanceof THREE.Mesh )
        child.material.map = text;
    });
  })
})

app.load('models/deer.obj', 0.01, obj => {
  obj.position.setX(10)
}, shader);


function shader (obj) {
  var material = new THREE.ShaderMaterial({
    vertexShader: document.getElementById( 'vertex-shader' ).textContent,
    fragmentShader: document.getElementById( 'fragment-shader' ).textContent
  });
  obj.traverse(function (child) {
    child.material = material;
  });
}

var pointerlock = new Pointerlock();
pointerlock.check(() => {}, err);
function err () {
  instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
}

pointerlock.onChange(function ( event ) {
  var lock = pointerlock.hasLock();
  controlsEnabled = lock;
  controls.enabled = lock;
  blocker.style.display = lock ? 'none' : 'block';
  instructions.style.display = lock ? '' : '-webkit-box';
});
instructions.addEventListener( 'click', function ( event ) {
  instructions.style.display = 'none';
  pointerlock.request();
}, false );
pointerlock.onError(() => {});


var controlsEnabled = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();

controls = new THREE.PointerLockControls(app.camera);
controls.getObject().translateZ(30);
app.scene.add(controls.getObject());
app.bottom(false);
KeyboardMove.aswd();

var signal = [ 1, -1 ]
var inc = [ 0.4, 0.1, 0.4 ]
var radio = 10

app.draw(() => {
  if (!controlsEnabled)
    return;

  if (Math.abs(pomo.position.x) <= Math.abs(pomo.position.z)) {
    pomo.position.x += inc[0] * signal[1];
    pomo.position.z = Math.sqrt(radio * radio - Math.pow(pomo.position.x, 2)) * signal[1];
  }
  else {
    pomo.position.z -= inc[2] * signal[0];
    pomo.position.x = Math.sqrt(radio * radio - Math.pow(pomo.position.z, 2)) * signal[0];
  }

  pomo.position.y -= inc[1] * signal[1];

  if (Math.abs(pomo.position.x) <= inc[0] * 0.5)
    signal[0] *= -1;
  if (Math.abs(pomo.position.z) <= inc[2] * 0.5)
    signal[1] *= -1;

  var time = performance.now();
  var delta = ( time - prevTime ) / 1000;
  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 10.0 * delta;
  velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
  if ( KeyboardMove.keys.W ) velocity.z -= 400.0 * delta;
  if ( KeyboardMove.keys.S ) velocity.z += 400.0 * delta;
  if ( KeyboardMove.keys.A ) velocity.x -= 400.0 * delta;
  if ( KeyboardMove.keys.D ) velocity.x += 400.0 * delta;
  
  controls.getObject().translateX( velocity.x * delta );
  controls.getObject().translateY( velocity.y * delta );
  controls.getObject().translateZ( velocity.z * delta );
  controls.getObject().position.y = 10;
  prevTime = time;
});

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
  app.camera.aspect = window.innerWidth / window.innerHeight;
  app.camera.updateProjectionMatrix();

  app.renderer.setSize( window.innerWidth, window.innerHeight );
}

app.render();