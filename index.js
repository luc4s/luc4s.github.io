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
var lightIntensity = 0.2;
var f = 0.8;
var light = new THREE.DirectionalLight(0xFFFFFF, lightIntensity);
light.position.set(-f, -f, f);
scene.add(light);
//light = new THREE.DirectionalLight(0xBD48FF, lightIntensity);
light = new THREE.DirectionalLight(0xDDDDFF, lightIntensity);
light.position.set(f, f, f);
scene.add(light);

light = new THREE.DirectionalLight(0xDDDDFF, lightIntensity);
light.position.set(-f, f, f);
scene.add(light);

light = new THREE.DirectionalLight(0xDDDDFF, lightIntensity);
light.position.set(f, -f, f);
scene.add(light);

var size = 16;
var noiseSize = 32;

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

var accData = new Float32Array(size * size * 3);
accData.fill(0);
var accTex = new THREE.DataTexture(
	accData,
	size,
	size,
	THREE.RGBFormat,
	THREE.FloatType,
	THREE.UVMapping,
	THREE.MirroredRepeatWrapping,
	THREE.MirroredRepeatWrapping,
	THREE.NearestFilter,
	THREE.NearestFilter);

var m =  new THREE.MeshStandardMaterial({
	color: 0xFFFFFF,
	side: THREE.DoubleSide,
	flatShading: true,
	roughness: 0.4,
	metalness: 1,
	defines: { NOISE_SIZE: noiseSize },
});
var wfMaterial = new THREE.MeshBasicMaterial({
	color: 0xFFFFFF,
	flatShading: true,
	wireframe: true,
	depthTest: false,
});
wfMaterial.defines = { NOISE_SIZE: noiseSize };
wfMaterial.onBeforeCompile = beforeCompileShader;

// Modify shader to add perlin noise transform
//*
var theta = { value: 0.0 };
function beforeCompileShader (shader) {
	shader.vertexShader =
		shader.vertexShader
			.replace(
				'#include <common>',
				'#include <common>\n' + document.getElementById('shaderUtils').textContent)
			.replace(
				'#include <begin_vertex>',
				'#include <begin_vertex>\n' + document.getElementById('vertShader').textContent);
	shader.uniforms.gradientTex = { value: gradientTex };
	shader.uniforms.accTex = { value: accTex };
	shader.uniforms.theta = theta;
};
m.onBeforeCompile = beforeCompileShader;
//*/

function generateTriangulation() {
	var c = 0;
	var cUV = 0;

	var vertices = new Float32Array(size * size * 3 * 6);
	var uvs = new Float32Array(size * size * 2 * 6);
	var normals = new Float32Array(vertices.length);
	var rAxis = new Float32Array(vertices.length);

	function pushVertex(x, y) {
		vertices[c] = x; normals[c++] = 0;
		vertices[c] = y; normals[c++] = 0;
		vertices[c] = 0; normals[c++] = -1;
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
	var mesh = new THREE.Mesh(geom, m);
	mesh.position.z = 0;
	mesh.position.y = -size / 2;
	mesh.position.x = -size / 2;
	return mesh;
}

var shape = generateTriangulation();
scene.add(shape);

var wfShape = new THREE.Mesh(shape.geometry, wfMaterial);
wfShape.position.copy(shape.position);
scene.add(wfShape);

window.addEventListener('resize', function() {
	var width = window.innerWidth;
	var height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  updatePlane();
}, false );

var mouseCoords = null;
window.addEventListener('mousemove', function(e) {
	if (mouseCoords == null) {
		mouseCoords = {};
	}
	mouseCoords.x = (event.clientX / window.innerWidth) * size;
	mouseCoords.y = (1.0 - event.clientY / window.innerHeight) * size;
});

var m = 0;
var lastPos = { x: 0, y: 0 };
var lastT = 0;

function addMomentum(x, y, t) {
	if (!lastPos) {
		lastPos = { "x": x, "y": y };
		lastT = t;
		return;
	}
	var dx = lastPos.x - x;
	var dy = lastPos.y - y;
	var dt = t - lastT;
	var d = Math.sqrt(dx * dx + dy * dy);
	m = Math.max(2, Math.min(1e5, m + d * dt));
	lastPos = { "x": x, "y": y };
	lastT = t;
}

function handleMoveEvent(event) {
	addMomentum(event.pageX, event.pageY, event.timeStamp);
}

window.onmousemove = handleMoveEvent;
window.ontouchmove = handleMoveEvent;
window.onscroll = function() {
	m = Math.max(2, m + 1e8);
};
function tick() {
	var lastUpdate = 0;
	function loop(timestamp) {
		var dt = timestamp - lastUpdate;
		if (dt > 16) {
			lastUpdate = timestamp;
			theta.value += 0.002 * Math.min(7, m / 500);
		  renderer.render(scene, camera);
		}
		m *= 0.9;
	  window.requestAnimationFrame(loop);
	}
	loop(Math.Infinity);
}

function updatePlane() {
	var projected = new THREE.Vector4(size / 2, size / 2, -10, 1)
		.applyMatrix4(camera.matrixWorldInverse);
	projected.w = 1.0;
	projected
		.applyMatrix4(camera.projectionMatrix)
		.divideScalar(projected.w);
	var scale = 1.0 / Math.min(projected.x, projected.y);
	shape.scale.setScalar(scale);
	shape.position.y = (-size / 2) * scale;
	shape.position.x = (-size / 2) * scale;
	wfShape.scale.copy(shape.scale);
	wfShape.position.copy(shape.position);
}

tick();


window.onload = function() {
	updatePlane();
};