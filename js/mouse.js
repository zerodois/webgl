var MouseClick = {}
MouseClick.right = false

MouseClick.mclick = function () {
  document.onmousedown = e => mclick(e, true)
  document.onmouseup = e => mclick(e, false)
  
  function mclick (e, val) {
    var rightclick
    if (e.which) rightclick = (e.which == 3)
    else if (e.button) rightclick = (e.button == 2)
    if (rightclick)
      MouseClick.right = val
    console.log(rightclick, MouseClick.right)
  }
}