import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

function init() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize, false);
  function onWindowResize (): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio( window.devicePixelRatio )
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
  }

  camera.position.z = 3;
}

function setup() {  
  const positions = [];
  const colours = [];

  const pointsGeometry = new THREE.BufferGeometry();
  for (let i = 0; i < 1000; ++i) {
    positions.push(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
    colours.push(Math.random(), Math.random(), Math.random());
  }
  pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  pointsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));
  pointsGeometry.computeBoundingSphere();

  var pointsMaterial = new THREE.PointsMaterial({
    sizeAttenuation: false,
    vertexColors: true
  });

  const points = new THREE.Points(pointsGeometry, pointsMaterial);
  scene.add(points);
}

function animate (): void {
  requestAnimationFrame(animate);

  render();
}

let time = 0.0;

function render(): void {
  camera.position.x = Math.sin(time);
  camera.position.z = Math.cos(time);
  camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));

  time += 0.001;

  renderer.render(scene, camera);
}

init();
setup();
animate();
