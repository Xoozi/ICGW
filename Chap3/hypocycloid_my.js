"use strict";

var canvas;
var gl;


var maxNumTriangles = 2000000;
var maxNumVertices  = 3 * maxNumTriangles;
var index = 0;
var theta = 0.0;
var R = 1.0;
var r = 1.0/Math.E;
var vBuffer;

var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

var rate = [
	1.0,			//1/1
	1.0/Math.sqrt(2),	//sqrt(2)/1
	0.5,		        //2/1
	0.3,			//3/1
	1.0/Math.PI,		//pi/1
	1.0/4.0			//4/1
];

function hypocycloid_point(t){

	var x = (R-r)*Math.cos(t) + r*Math.cos(t*(R-r)/r);
	var y = (R-r)*Math.sin(t) - r*Math.sin(t*(R-r)/r);
	return vec2(x, y);
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW);

    var aPosition = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    var colorLoc = gl.getUniformLocation( program, "uColor" );
    gl.uniform4fv(colorLoc, colors[0]);

    var cm = document.getElementById("colormenu");
    cm.addEventListener("click", function() {
    	gl.uniform4fv(colorLoc, colors[cm.selectedIndex]);
        });

    var rm = document.getElementById("ratemenu");
    rm.addEventListener("click", function() {
	    r = rate[rm.selectedIndex];
	    theta = 0;
	    index = 0;
        });

    document.getElementById("slider").onchange = function(event) {
            r = parseFloat(event.target.value);
	    theta = 0;
	    index = 0;
    };

    render();
}


function render() {
        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
	var t = hypocycloid_point(theta);
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(t));

        index++;
	theta+=0.01;

    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINE_STRIP, 0, index );

    window.requestAnimFrame(render);
}
