Object.defineProperty(Array.prototype, 'concatAll', {
  enumerable: false,
  writable: true,
  value: function(fn) {
    let result = [];
    this.forEach(function (item) {
      item = fn !== undefined ? item.map(el => fn(el)) : item
      result = result.concat(item);
    });
    return result;
  }
})
