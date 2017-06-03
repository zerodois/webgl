var KeyboardMove = {}
KeyboardMove.keys = { W: false, D: false, S: false, A: false, Spc: false, Alt: false, Sft: false, Hm: false }

KeyboardMove.aswd = function () {
  document.onkeydown = e => aswd(e, true)
  document.onkeyup = e => aswd(e, false)

  function aswd (e, val) {
    var map = { '87': 'W', '65': 'A', '68': 'D', '83': 'S', '32': 'Spc', '18': 'Alt', '16': 'Sft', '36': 'Hm' }
    // console.log(e.keyCode)
    var m = map[ '' + e.keyCode ]
    if (m != undefined)
      KeyboardMove.keys[m] = val
  }
}
