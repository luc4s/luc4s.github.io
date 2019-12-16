var vertexShaderCode = "\
\
";
window.requestAnimationFrame = window.requestAnimationFrame
															|| window.mozRequestAnimationFrame
															|| window.webkitRequestAnimationFrame
															|| window.msRequestAnimationFrame;

// Renderer setup
var renderer = new THREE.WebGLRenderer({
	antialias: true,
});
renderer.setSize( window.innerWidth, window.innerHeight );

if (!renderer.extensions.get('OES_texture_float')) {
	window.alert('Unfortunately your browser does not support the technologie required by this page.');
}
document.body.appendChild( renderer.domElement );

// Scene setup
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000);

camera.position.z = 5;

// Scene lights
var light = new THREE.DirectionalLight(0xFFFFFF, 0.2);
light.position.set(-3, 3, 10);
light.target.position.set(3, -3, -3);
scene.add(light);

var light = new THREE.DirectionalLight(0xBD48FF, 0.3);
light.position.set(3, -3, 10);
light.target.position.set(-3, 3, -3);

scene.add(light);
scene.add(new THREE.AmbientLight(0x101010));

var size = 16;
var noiseSize = 8;

// Material setup
// Generate gradients texture for material
var texDim = noiseSize * noiseSize;
var data = new Float32Array(texDim * 3)
for (var i = 0; i < texDim; ++i) {
	var index = i * 3;
	var rnd = Math.random() * 2 * Math.PI;
	data[index] = Math.cos(rnd);
	data[index + 1] = Math.sin(rnd);
	data[index + 2] = 0;
}

var gradientTex = new THREE.DataTexture(
	data,
	noiseSize,
	noiseSize, 
	THREE.RGBFormat,
	THREE.FloatType,
	THREE.UVMapping,
	THREE.MirroredRepeatWrapping,
	THREE.MirroredRepeatWrapping,
	THREE.NearestFilter,
	THREE.NearestFilter);

var m =  new THREE.MeshStandardMaterial({
	aoMap: gradientTex,
	color: 0xFFFFFF,
	side: THREE.DoubleSide,
	flatShading: true,
	roughness: 0.4,
	metalness: 0.7,
	defines: { NOISE_SIZE: noiseSize },
	//wireframe: true,
});
/*
m = new THREE.MeshBasicMaterial({
	wireframe: true,
});
//*/

// Modify shader a bit to add perlin noise transform
//*
var theta = { value: 0.0 };
m.onBeforeCompile = function(shader) {
	shader.vertexShader =
		shader.vertexShader
			.replace(
				'#include <common>',
				'#include <common>\n' + shaderUtils)
			.replace(
				'#include <begin_vertex>',
				'#include <begin_vertex>\n' + shaderVertexTransform);
	shader.uniforms.gradientTex = { value: gradientTex };
	shader.uniforms.theta = theta;
};
//*/

var vertices = new Float32Array(size * size * 3 * 6);
function generateTriangulation() {
	var c = 0;
	var cUV = 0;

	var uvs = new Float32Array(size * size * 2 * 6);
	var normals = new Float32Array(vertices.length);

	function pushVertex(x, y) {
		vertices[c] = x;	normals[c++] = 0;
		vertices[c] = y;	normals[c++] = 0;
		vertices[c] = 0;	normals[c++] = -1;
		uvs[cUV++] = x / size;
		uvs[cUV++] = y / size;
	}

	for (var i = 0; i < size; ++i) {
		for (var j = 0; j < size; ++j) {
				pushVertex(i, j);
				pushVertex(i, j + 1);
				pushVertex(i + 1, j + 1);

				pushVertex(i + 1, j + 1);
				pushVertex(i + 1, j);
				pushVertex(i, j);
		}
	}

	var geom = new THREE.BufferGeometry();	
	geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
	geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
	geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
	//geom.computeVertexNormals();
	var mesh = new THREE.Mesh(geom, m);
	mesh.position.z = -10;
	mesh.position.y = -size / 2;
	mesh.position.x = -size / 2;
	return mesh;
}

var shape = generateTriangulation();
scene.add(shape);

function applyNoiseToGeometry() {
	var length = size;
	for (var i = 2; i < vertices.length; i += 3) {
		var vIdx = Math.floor(i / 3);
		var x = Math.floor(vIdx / length) % length;
		var y = (vIdx - x * length) % length;
		vertices[i] = perlin(x / 2, y / 2);
	}
	shape.geometry.getAttribute('position').needsUpdate = true;
	shape.geometry.computeVertexNormals();
}

function tick(timestamp) {
  window.requestAnimationFrame(tick);
	if (!this.lastUpdate) {
		this.lastUpdate = 0;
	}
	var dt = timestamp - this.lastUpdate
	if (dt < 33) {
		return;
	}
	this.lastUpdate = timestamp;
	theta.value += 0.01;
  //perturbGradient();
  //applyNoiseToGeometry();
  renderer.render(scene, camera);
}

function updatePlane() {
	var width = window.innerWidth;
	var height = window.innerHeight;
	
	var unprojected = new THREE.Vector4(0, 1, 0, 1).applyMatrix4(camera.projectionMatrix);
	console.log(unprojected);
}

window.addEventListener( 'resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updatePlane();
}, false );

tick();