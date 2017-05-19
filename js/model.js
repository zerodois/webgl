function format (data) {
  var vec = data.split('\n').reduce(readLine, { vertices: [], points: [] });
  var vMax = vec4(vec.max.x, vec.max.y, vec.max.z, 1)
  var vMin = vec4(vec.min.x, vec.min.y, vec.min.z, 1)

  var midPoint = add(vMin, vMax).map(item => item * 0.5);
  var invdiag = 1.5 / length( subtract(vMax, vMin) );
  
  vec.vertices.forEach((item, i) => {
    vec.vertices [i] = subtract(item, midPoint).map(el => el * invdiag)
    vec.vertices [i][3] = 1;
  })

  return vec.points.concatAll(item => vec.vertices[ item-1 ])
}

function readLine (obj, line) {
  arr = line.split(' ').map(e => e.split('/')[0]).filter(el => el != "")
  var X = Number(arr[1]), Y = Number(arr[2]), Z = Number(arr[3]);

  if (arr[0] == 'v') {
    reduce (obj, 'max', { x: X, y: Y, z: Z }, Math.max)
    reduce (obj, 'min', { x: X, y: Y, z: Z }, Math.min)
    obj.vertices.push(vec4(X, Y, Z, 1))
  }
  else if (arr[0] == 'f')
    obj.points.push(vec3(X, Y, Z))
  
  return obj;
}

function reduce (obj, name, point, fn) {
  if (obj[name] == undefined)
    return obj[name] = point
  Object.keys(point).forEach((index, coord) => {
    obj[name][index] = fn(obj[name][index], point[index])
  })
}

function colorize () {
  var size = 0.2 / points.length, color = 0
  return points.map(item => [ 0.83 - color, 0.82 - color, 0.65 - (color += size) - size, 1 ])
}

axios.get(app.server + '/models/deer.obj')
  .then(function (response) {
    var v = format(response.data)
    points = v
    colors = colorize()
    init()
  })
  .catch(function (error) {
    console.log(error);
  })
