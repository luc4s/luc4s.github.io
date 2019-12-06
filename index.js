window.requestAnimationFrame = window.requestAnimationFrame
															|| window.mozRequestAnimationFrame
															|| window.webkitRequestAnimationFrame
															|| window.msRequestAnimationFrame;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000);

camera.position.z = 5;

var renderer = new THREE.WebGLRenderer({
	antialias: true,
});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );



var light = new THREE.DirectionalLight(0xFFFFFF, 0.2);
light.position.set(-3, 3, 10);
light.target.position.set(3, -3, -3);
scene.add(light);

var light = new THREE.DirectionalLight(0xBD48FF, 0.3);
light.position.set(3, -3, 10);
light.target.position.set(-3, 3, -3);

scene.add(light);

var geom = new THREE.BoxGeometry(1, 1, 1);

var material = new THREE.MeshStandardMaterial({
	color: '#FFFFFF',
	emissive: 0x444444,
	roughness: 1,
	metalness: 0,
});

var group = new THREE.Group();

var mesh = new THREE.Mesh(geom, material);
mesh.position.x = -3;
group.add(mesh);

mesh = new THREE.Mesh(geom, material);
group.add(mesh);

mesh = new THREE.Mesh(geom, material);
mesh.position.x = 3;
group.add(mesh);

group.position.y = -1;
scene.add(group);

// Generate random triangulation
var m =  new THREE.MeshStandardMaterial({
	color: 0xFFFFFF,
	side: THREE.DoubleSide,
	flatShading: true,
	roughness: 0.4,
	metalness: 0.3,
	//wireframe: true,
});

var size = 16;

var vertices = new Float32Array(size * size * 3);
var indices = [];
function generateTriangulation() {
	var geom = new THREE.BufferGeometry();	
	var array = [];
	var nArray = [];
	var s = 2;
	var c = 0;
	function newVx(x, y) {
		//var z = perlin((x + 32) / s, (y + 32) / s) - 0.5;
		//console.log(z);
		indices[c / 3] = [x, y];
		vertices[c++] = x + (Math.random() * 0.2 - 0.1);
		vertices[c++] = y + (Math.random() * 0.2 - 0.1);;
		vertices[c++] = 0;
	}

	var gIndices = new Uint16Array(6 * size * size);
	var idxCounter = 0;
	for (var i = 0; i < size; ++i) {
		for (var j = 0; j < size; ++j) {
				newVx(i, j);

				if ((i + 1 < size) && (j + 1 < size)) {
					var idx = j * size + i;
					gIndices[idxCounter++] = idx;
					gIndices[idxCounter++] = idx + size;
					gIndices[idxCounter++] = idx + 1 + size;

					gIndices[idxCounter++] = idx + 1 + size;
					gIndices[idxCounter++] = idx + 1;
					gIndices[idxCounter++] = idx;
				}
		}
	}
	geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
	geom.setIndex(new THREE.BufferAttribute(gIndices, 1));
	geom.computeVertexNormals();
	var mesh = new THREE.Mesh(geom, m);
	mesh.scale.setScalar(2);
	mesh.position.z = -5;
	mesh.position.y = -(size);
	mesh.position.x = -(size);
	return mesh;
}

var back = generateTriangulation();
scene.add(back);

function ondulate() {
	var length = size;
	for (var i = 2; i < vertices.length; i += 3) {
		var vIdx = Math.floor(i / 3);
		var x = Math.floor(vIdx / length) % length;
		var y = (vIdx - x * length) % length;
		//console.log(vIdx, indices.length);
		//var x = indices[vIdx][0];
		//var y = indices[vIdx][1];
		vertices[i] = perlin(x / 2, y / 2) - 0.5;
	}
	back.geometry.getAttribute('position').needsUpdate = true;
	back.geometry.computeVertexNormals();
}
//perturbGradient();
ondulate();


function tick(timestamp) {
  renderer.render(scene, camera);
  perturbGradient();
  ondulate();
  //window.setTimeout(requestAnimationFrame, 13, tick);
  //back.rotation.x += 0.01;
  //back.rotation.y += 0.02;
  window.requestAnimationFrame(tick);
}
renderer.render(scene, camera);
tick();