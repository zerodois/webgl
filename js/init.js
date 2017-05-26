var W = window.innerWidth
var H = window.innerHeight
var canvas
var gl

var points = []
var colors = []

var theta = [ 0, 0, 0 ]
var thetaLoc

function init () {
	canvas = document.getElementById( "gl-canvas" )
	canvas.height = canvas.width = Math.min( W/4, H/4 ) * 3

	gl = WebGLUtils.setupWebGL( canvas )
	if (!gl) alert( "WebGL isn't available" )

	gl.viewport( 0, 0, canvas.width, canvas.height )
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 )
	gl.enable( gl.DEPTH_TEST )

	//  Load shaders and initialize attribute buffers
	var program = initShaders( gl, "vertex-shader", "fragment-shader" )
	gl.useProgram( program )
	
	var cBuffer = gl.createBuffer()
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer )
	gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW )

	var vColor = gl.getAttribLocation( program, "vColor" )
	gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 )
	gl.enableVertexAttribArray( vColor )

	var vBuffer = gl.createBuffer()
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer )
	gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW )
	
	var vPosition = gl.getAttribLocation( program, "vPosition" )
	gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 )
	gl.enableVertexAttribArray( vPosition )

	thetaLoc = gl.getUniformLocation( program, "theta" ) 
	
	render()
}

function render () {
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT )

	gl.uniform3fv( thetaLoc, theta )
	gl.drawArrays( gl.TRIANGLES, 0, points.length )

	requestAnimFrame( render )
}
