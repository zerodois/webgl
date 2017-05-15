function format (data) {
  var vec = { vertices: [], points: [] };
  data.split('\n').reduce(readLine, vec);
  var vMax = vec4(vec.max.x, vec.max.y, vec.max.z, 1)
  var vMin = vec4(vec.min.x, vec.min.y, vec.min.z, 1)

  var midPoint = add(vMin, vMax).map(item => item * 0.5);
  var invdiag = 1.5 / length( subtract(vMax, vMin) );
  
  vec.vertices.forEach((item, i) => {
    vec.vertices [i] = subtract(item, midPoint).map(el => el * invdiag)
    vec.vertices [i][3] = 1;
  })

  return vec.points.concatAll(item => {
    var n = Number(item)
    return vec.vertices[ n-1 ]
  })
}

function readLine (obj, line) {
  arr = line.split(' ').map(e => e.split('/')[0]).filter(el => el != "")
  var X = Number(arr[1]), Y = Number(arr[2]), Z = Number(arr[3]);
  if (arr[0] == 'v') {
    obj.max = obj.max == undefined ? { x: X, y: Y, z: Z } : obj.max;
    obj.min = obj.min == undefined ? { x: X, y: Y, z: Z } : obj.min;
    obj.max.x = Math.max( obj.max.x, X )
    obj.max.y = Math.max( obj.max.y, Y )
    obj.max.z = Math.max( obj.max.z, Z )
    obj.min.x = Math.min( obj.min.x, X )
    obj.min.y = Math.min( obj.min.y, Y )
    obj.min.z = Math.min( obj.min.z, Z )
    obj.vertices.push(vec4(X, Y, Z, 1))
  }
  else if (arr[0] == 'f')
    obj.points.push(vec3(X, Y, Z))
  return obj;
}

const URL = 'https://raw.githubusercontent.com/zerodois/webgl/master';
axios.get(URL + '/models/deer.obj')
  .then(function (response) {
    var v = format(response.data)
    points = v
    colors = colorize()//v.map(el => [ 0.5, 0.5, 0.5, 1.0 ])
    init()
  })
  .catch(function (error) {
    console.log(error);
  })

function colorize () {
  var size = 0.2 / points.length
  var color = 0
  return points.map(item => {
    let a = [ 0.83 - color, 0.82 - color, 0.65 - color, 1 ]
    color += size
    return a
  })
}
