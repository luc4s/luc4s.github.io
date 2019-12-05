var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000);

camera.position.z = 5;

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

window.requestAnimationFrame = window.requestAnimationFrame
															|| window.mozRequestAnimationFrame
															|| window.webkitRequestAnimationFrame
															|| window.msRequestAnimationFrame;

scene.add(new THREE.AmbientLight( 0x404040 ));

var mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
scene.add(mesh);

function tick(timestamp) {
  renderer.render(scene, camera);
  window.setTimeout(requestAnimationFrame, 13, tick);
  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.01;
}

requestAnimationFrame(tick);