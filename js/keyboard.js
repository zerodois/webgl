var KeyboardMove = {}
KeyboardMove.keys = { W: false, D: false, S: false, A: false, Spc: false, C: false, Sft: false, Hm: false, Enter: false }

KeyboardMove.aswd = function (callOnEnter) {
  document.onkeydown = e => aswd(e, true)
  document.onkeyup = e => aswd(e, false)

  let onEnterDown = callOnEnter

  function aswd (e, val) {
    var map = { '87': 'W', '65': 'A', '68': 'D', '83': 'S', '32': 'Spc', '67': 'C', '16': 'Sft', '36': 'Hm', '13': 'Enter' }
    var m = map[ '' + e.keyCode ]
    if (m != undefined)
      KeyboardMove.keys[m] = val
    if (m == 'Enter' && KeyboardMove.keys[m])
      onEnterDown()
  }
}
