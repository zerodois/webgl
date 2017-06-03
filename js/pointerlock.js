function Pointerlock () {
  this.havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document
  this.element = document.body
}
Pointerlock.prototype.check = function (success, error) {
  if (!this.havePointerLock)
    return error()
  success()
}
Pointerlock.prototype.onChange = function (onChange) {
  document.addEventListener( 'pointerlockchange', onChange, false )
}
Pointerlock.prototype.onError = function (onError) {
  document.addEventListener( 'pointerlockchange', onError, false )
}
Pointerlock.prototype.hasLock = function () {
  return document.pointerLockElement === this.element || document.mozPointerLockElement === this.element || document.webkitPointerLockElement === this.element
}
Pointerlock.prototype.request = function () {
  this.element.requestPointerLock()
}