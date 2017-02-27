

"use strict";

var gl;

var nRows = 50;
var nColumns = 50;

// data for radial hat function: sin(Pi*r)/(Pi*r)

var data = [];
for( var i = 0; i < nRows; ++i ) {
    data.push( [] );
    var x = Math.PI*(4*i/nRows-2.0);

    for( var j = 0; j < nColumns; ++j ) {
        var y = Math.PI*(4*j/nRows-2.0);
        var r = Math.sqrt(x*x+y*y);

        // take care of 0/0 for r = 0

        data[i][j] = r ? Math.sin(r) / r : 1.0;
    }
}

var coords = [];
coords.push(vec4(-100, 0, 0, 1));
coords.push(vec4(100, 0, 0, 1));
coords.push(vec4(0, -100, 0, 1));
coords.push(vec4(0, 100, 0, 1));
coords.push(vec4(0, 0, -100, 1));
coords.push(vec4(0, 0, 100, 1));

var pointsArray = [];

var fColor;

var near = -1000;
var far = 1000;
var radius = 6.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

const black = vec4(0.0, 0.0, 0.0, 1.0);
const red = vec4(1.0, 0.0, 0.0, 1.0);
const green = vec4(0.0, 1.0, 0.0, 1.0);
const blue = vec4(0.0, 0.0, 1.0, 1.0);

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
const eye = vec3(100.0, 0.0, 0.0);

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

var modelMatrixLoc, viewMatrixLoc, projectionMatrixLoc;


var _rmat = mat4();


var _debug_flag = 0;
var _theta = 0.0;

var _yaw = 0;
var _pitch   = 0;
var _roll    = 0;

var _m_pos   = vec4(0, 0, 0, 1);
var _v_pos   = vec4(0, 0, -4, 1);

var _mesh_v_vbo_id;
var _coord_v_vbo_id;
var _program;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    // enable depth testing and polygon offset
    // so lines will be in front of filled triangles

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);

// vertex array of nRows*nColumns quadrilaterals
// (two triangles/quad) from data

    for(var i=0; i<nRows-1; i++) {
        for(var j=0; j<nColumns-1;j++) {
            pointsArray.push( vec4(2*i/nRows-1, data[i][j], 2*j/nColumns-1, 1.0));
            pointsArray.push( vec4(2*(i+1)/nRows-1, data[i+1][j], 2*j/nColumns-1, 1.0));
            pointsArray.push( vec4(2*(i+1)/nRows-1, data[i+1][j+1], 2*(j+1)/nColumns-1, 1.0));
            pointsArray.push( vec4(2*i/nRows-1, data[i][j+1], 2*(j+1)/nColumns-1, 1.0) );
    }
}
    //
    //  Load shaders and initialize attribute buffers
    //
    _program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( _program );


    _mesh_v_vbo_id = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, _mesh_v_vbo_id );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);


    _coord_v_vbo_id = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, _coord_v_vbo_id );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(coords), gl.STATIC_DRAW);

    fColor = gl.getUniformLocation(_program, "fColor");

    modelMatrixLoc = gl.getUniformLocation( _program, "modelMatrix");
    viewMatrixLoc = gl.getUniformLocation( _program, "viewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( _program, "projectionMatrix" );

	var lable_yaw = document.getElementById("lable_yaw");
	var lable_pitch = document.getElementById("lable_pitch");
	var lable_roll = document.getElementById("lable_roll");
	var lable_mp = document.getElementById("lable_mp");
	var lable_vp = document.getElementById("lable_vp");
	
	lable_yaw.innerText = " " + _yaw;
	lable_roll.innerText = " " + _roll;
	lable_pitch.innerText = " " + _pitch;

	document.getElementById("btn_m_left").onclick = function(){
		_m_pos = add(_m_pos, vec4(-1, 0, 0, 0));
		lable_mp.innerText = "m:("+_m_pos[0]+", "+_m_pos[1]+", "+_m_pos[2]+")";
	};
	document.getElementById("btn_m_up").onclick = function(){
		_m_pos = add(_m_pos, vec4(0, 1, 0, 0));
		lable_mp.innerText = "m:("+_m_pos[0]+", "+_m_pos[1]+", "+_m_pos[2]+")";
	};
	document.getElementById("btn_m_right").onclick = function(){
		_m_pos = add(_m_pos, vec4(1, 0, 0, 0));
		lable_mp.innerText = "m:("+_m_pos[0]+", "+_m_pos[1]+", "+_m_pos[2]+")";
	};
	document.getElementById("btn_m_down").onclick = function(){
		_m_pos = add(_m_pos, vec4(0, -1, 0, 0));
		lable_mp.innerText = "m:("+_m_pos[0]+", "+_m_pos[1]+", "+_m_pos[2]+")";
	};
	document.getElementById("btn_m_far").onclick = function(){
		_m_pos = add(_m_pos, vec4(0, 0, -1, 0));
		lable_mp.innerText = "m:("+_m_pos[0]+", "+_m_pos[1]+", "+_m_pos[2]+")";
	};
	document.getElementById("btn_m_near").onclick = function(){
		_m_pos = add(_m_pos, vec4(0, 0, 1, 0));
		lable_mp.innerText = "m:("+_m_pos[0]+", "+_m_pos[1]+", "+_m_pos[2]+")";
	};

	document.getElementById("btn_v_left").onclick = function(){
		_v_pos = add(_v_pos, vec4(-1, 0, 0, 0));
		lable_vp.innerText = "v:("+_v_pos[0]+", "+_v_pos[1]+", "+_v_pos[2]+")";
	};
	document.getElementById("btn_v_up").onclick = function(){
		_v_pos = add(_v_pos, vec4(0, 1, 0, 0));
		lable_vp.innerText = "v:("+_v_pos[0]+", "+_v_pos[1]+", "+_v_pos[2]+")";
	};
	document.getElementById("btn_v_right").onclick = function(){
		_v_pos = add(_v_pos, vec4(1, 0, 0, 0));
		lable_vp.innerText = "v:("+_v_pos[0]+", "+_v_pos[1]+", "+_v_pos[2]+")";
	};
	document.getElementById("btn_v_down").onclick = function(){
		_v_pos = add(_v_pos, vec4(0, -1, 0, 0));
		lable_vp.innerText = "v:("+_v_pos[0]+", "+_v_pos[1]+", "+_v_pos[2]+")";
	};
	document.getElementById("btn_v_far").onclick = function(){
		_v_pos = add(_v_pos, vec4(0, 0, -1, 0));
		lable_vp.innerText = "v:("+_v_pos[0]+", "+_v_pos[1]+", "+_v_pos[2]+")";
	};
	document.getElementById("btn_v_near").onclick = function(){
		_v_pos = add(_v_pos, vec4(0, 0, 1, 0));
		lable_vp.innerText = "v:("+_v_pos[0]+", "+_v_pos[1]+", "+_v_pos[2]+")";
	};


	document.getElementById("btn_yaw_in").onclick = function(){
		_yaw += 1;
		lable_yaw.innerText = " " + _yaw;
	};
	document.getElementById("btn_yaw_de").onclick = function(){
		_yaw -= 1;
		lable_yaw.innerText = " " + _yaw;
	};

	document.getElementById("btn_pitch_in").onclick = function(){
		_pitch += 1;
		lable_pitch.innerText = " " + _pitch;
	};
	document.getElementById("btn_pitch_de").onclick = function(){
		_pitch -= 1;
		lable_pitch.innerText = " " + _pitch;
	};

	document.getElementById("btn_roll_in").onclick = function(){
		_roll += 1;
		lable_roll.innerText = " " + _roll;
	};
	document.getElementById("btn_roll_de").onclick = function(){
		_roll -= 1;
		lable_roll.innerText = " " + _roll;
	};


    render();

}


function render()
{
    gl.useProgram( _program );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //var modelViewMatrix = lookAt( eye, at, up );
    //var projectionMatrix = ortho( left, right, bottom, ytop, near, far );
    var projectionMatrix = perspective(90, 1, 0, 1000 )


    //var vmat = mult(_rmat, modelViewMatrix);
    var Tv = translate(_v_pos[0], _v_pos[1], _v_pos[2] );
    var Tm = translate(_m_pos[0], _m_pos[1], _m_pos[2] );
    var Rvx = rotateX(_pitch);
    var Rvy = rotateY(_yaw);
    var Rvz = rotateZ(_roll);
    var Rmz = rotateZ(0);
    var Rmx = rotateX(0);
    var vmat = mult(Tv, mult(Rvx, mult(Rvy , mult(Rvz, Tm))));


    gl.uniformMatrix4fv( viewMatrixLoc, false, flatten(vmat) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    // draw each quad as two filled red triangles
    // and then as two black line loops
    var vPosition = gl.getAttribLocation( _program, "vPosition" );

    gl.bindBuffer( gl.ARRAY_BUFFER, _mesh_v_vbo_id );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var mmat0 = translate(0, 0, 0 );
    gl.uniformMatrix4fv( modelMatrixLoc, false, flatten(mmat0) );
    for(var i=0; i<pointsArray.length; i+=4) {
        gl.uniform4fv(fColor, flatten(red));
        gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
        gl.uniform4fv(fColor, flatten(black));
        gl.drawArrays( gl.LINE_LOOP, i, 4 );
    }

    var mmat1 = translate(3, 0, 0 );
    gl.uniformMatrix4fv( modelMatrixLoc, false, flatten(mmat1) );
    for(var i=0; i<pointsArray.length; i+=4) {
        gl.uniform4fv(fColor, flatten(green));
        gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
        gl.uniform4fv(fColor, flatten(black));
        gl.drawArrays( gl.LINE_LOOP, i, 4 );
    }

    var mmat2 = translate(0, 0, 3 );
    gl.uniformMatrix4fv( modelMatrixLoc, false, flatten(mmat2) );
    for(var i=0; i<pointsArray.length; i+=4) {
        gl.uniform4fv(fColor, flatten(blue));
        gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );
        gl.uniform4fv(fColor, flatten(black));
        gl.drawArrays( gl.LINE_LOOP, i, 4 );
    }

    gl.uniformMatrix4fv( modelMatrixLoc, false, flatten(mat4()) );
    gl.bindBuffer( gl.ARRAY_BUFFER, _coord_v_vbo_id );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    gl.uniform4fv(fColor, flatten(red));
    gl.drawArrays( gl.LINES, 0, 2 );
    gl.uniform4fv(fColor, flatten(green));
    gl.drawArrays( gl.LINES, 2, 2 );
    gl.uniform4fv(fColor, flatten(blue));
    gl.drawArrays( gl.LINES, 4, 2 );


    requestAnimFrame(render);
}

var degtorad = Math.PI / 180; // Degree-to-Radian conversion

function getRotationMatrix( alpha, beta, gamma ) {

	var _x = beta  ? beta  * degtorad : 0; // beta value
	var _y = gamma ? gamma * degtorad : 0; // gamma value
	var _z = alpha ? alpha * degtorad : 0; // alpha value

	var cX = Math.cos( _x );
	var cY = Math.cos( _y );
	var cZ = Math.cos( _z );
	var sX = Math.sin( _x );
	var sY = Math.sin( _y );
	var sZ = Math.sin( _z );

	var m11 = cZ * cY - sZ * sX * sY;
	var m12 = - cX * sZ;
	var m13 = cY * sZ * sX + cZ * sY;
	
	var m21 = cY * sZ + cZ * sX * sY;
	var m22 = cZ * cX;
	var m23 = sZ * sY - cZ * cY * sX;
	
	var m31 = - cX * sY;
	var m32 = sX;
	var m33 = cX * cY;

    var result = mat4(
        vec4( m11, m12, m13, 0),
        vec4( m21, m22, m23, 0),
        vec4( m31, m32, m33, 0),
        vec4()
    );

    return result;
}

