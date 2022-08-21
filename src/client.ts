import * as THREE from 'three';
import { AppMath } from './math';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

const lightPosition = new THREE.Vector3(0.25, 0.25, 0.25);

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshBasicMaterial({
  color: 0x303030,
  wireframe: true,
  side: THREE.DoubleSide
});
const cubeMesh = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(cubeMesh);

function generateRays(origin: THREE.Vector3, count: number): Array<THREE.Ray> {
  const rays = new Array<THREE.Ray>(count);
  for (let i = 0; i < count; ++i) {
    rays[i] = new THREE.Ray(origin, AppMath.getRandomUnitVector());
  }
  return rays;
}

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

  camera.position.z = 5;
}

function setup() {  
  const pointsGeometry = new THREE.BufferGeometry();
  {
    const positions: any[] = [];
    const colours: any[] = [];

    const rays = generateRays(lightPosition, 1_000_000);
    const rayCaster = new THREE.Raycaster(new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 0.0, 0.0));
    for (const ray of rays) {
      rayCaster.set(ray.origin, ray.direction);
      const intersections = rayCaster.intersectObject(cubeMesh);
      const closestIntersection = intersections[0];

      if (closestIntersection !== undefined) {
        const point = closestIntersection.point;
        positions.push(point.x, point.y, point.z);
        colours.push(Math.random(), Math.random(), Math.random());
      }

      /*
      const intersection = AppMath.intersectLinePlane(new THREE.Vector3(0.5, 0, 0), new THREE.Vector3(-1, 0, 0), ray);
      if (intersection !== undefined) {
        positions.push(intersection.x, intersection.y, intersection.z);
        colours.push(Math.random(), Math.random(), Math.random());
      }
      */
    }

    pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    pointsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));
    pointsGeometry.computeBoundingSphere();
  }

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
