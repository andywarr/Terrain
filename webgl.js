var createBuffer = require('gl-buffer');
var createShader = require('gl-shader');
var createVAO = require('gl-vao');
var fill = require('ndarray-fill');
var fs = require('fs');
var glm = require('gl-matrix');
var mesher = require('heightmap-mesher');
var normals = require('mesh-normals');
var perlin = require('perlin').noise.perlin2;
var shell = require('gl-now')({ clearColor: [1, 1, 1, 1] });
var zero = require('zeros');

shell.on('gl-init', init);
shell.on('gl-render', render);

var mat4 = glm.mat4;
var meshes = [];
var scale = [15,3.5,15];
var shader;
var t = 0;

function init() {
  var gl = shell.gl;
  
  shader = createShader(gl,
    require('./shaders/terrain.vert'),
    require('./shaders/terrain.frag')
  );
  
  for (var x = -3; x <= 3; x++) {
    for (var y = -3; y <= 3; y++) {
      meshes.push(createMesh(gl, x, y));
    }
  }
}

function createMesh(gl, x, y) {
  var vertData = mesher(
    perlinify(
      zero([64, 64]),
      x,
      y
    ),
    0.25
  );
  
  // TODO: WHAT HAPPENS IF I REMOVE THIS???
  for (var i = 0; i < vertData.length; i += 3) {
    vertData[i  ] *= scale[0];
    vertData[i+1] *= scale[1];
    vertData[i+2] *= scale[2];
  }
  
  var normData = normals(vertData);
  var vertBuffer = createBuffer(gl, vertData);
  var quads = createVAO(gl, null, [{
    buffer: vertBuffer, 
    type: gl.FLOAT, 
    size: 3,
    offset: 0,
    stride: 0,
    normalized: false
  }, 
  {
    buffer: createBuffer(gl, normData),
    type: gl.FLOAT,
    size: 3,
    offset: 0,
    stride: 0,
    normalized: false
  }]);

  return { vao: quads, length: vertData.length / 3, x: x, y: y };
}

function perlinify(array, _x, _y) {
  _x *= array.shape[0] - 1;
  _y *= array.shape[1] - 1;
  return fill(array, function(x, y) {
    var v = perlin((x + _x) * 0.055 + 972, (y + _y) * 0.055 - 234);
    v += perlin((x + _x) * 0.5 + 102.01, (y + _y) * 0.5 - 948.01) * 0.05;
    v += perlin((x + _x) * 0.005 + 152.01, (y + _y) * 0.005 - 448.01) * 0.25;
    return v;
  })  
}

function render() {
  var gl = shell.gl;
  
  t += 1;
  
  var projection = mat4.perspective(new Float32Array(16),
    0.25*Math.PI, shell.width/shell.height, 0.05, 1000);
}