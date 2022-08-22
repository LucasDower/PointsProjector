import * as THREE from 'three';
import { AppMath } from './math';
import { AppConfig } from './config';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshBasicMaterial({
  color: 0x303030,
  wireframe: true,
  side: THREE.DoubleSide
});
const cubeMesh = new THREE.Mesh(boxGeometry, boxMaterial);

{
  const sphereGeometry = new THREE.SphereGeometry(0.01, 4, 2);
  sphereGeometry.translate(AppConfig.LIGHT_POSITION.x, AppConfig.LIGHT_POSITION.y, AppConfig.LIGHT_POSITION.z);

  const sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFFF00,
    wireframe: true
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(sphere);
}

function generateRays(origin: THREE.Vector3, count: number): Array<{ ray: THREE.Ray, colour: THREE.Color, alpha: number }> {
  const rays = new Array<{ ray: THREE.Ray, colour: THREE.Color, alpha: number }>(count);
  for (let i = 0; i < count; ++i) {
    rays[i] = {
      ray: new THREE.Ray(origin, AppMath.getRandomRayDirection()),
      colour: new THREE.Color(1.0, 1.0, 1.0),
      alpha: 1.0
    }
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
}

const faceIndexToColour = new Map<number, THREE.Color>();
faceIndexToColour.set(0, new THREE.Color(1.0, 1.0, 0.0));
faceIndexToColour.set(1, new THREE.Color(1.0, 1.0, 0.0));
faceIndexToColour.set(2, new THREE.Color(0.0, 1.0, 1.0));
faceIndexToColour.set(3, new THREE.Color(0.0, 1.0, 1.0));
faceIndexToColour.set(4, new THREE.Color(1.0, 1.0, 1.0));
faceIndexToColour.set(5, new THREE.Color(1.0, 1.0, 1.0));
faceIndexToColour.set(6, new THREE.Color(1.0, 0.0, 1.0));
faceIndexToColour.set(7, new THREE.Color(1.0, 0.0, 1.0));
for (let i = 4; i < 7; ++i) {
  //const faceColour = new THREE.Color(Math.random(), Math.random(), Math.random());
  const faceColour = new THREE.Color('white');
  faceIndexToColour.set(i * 2 + 0, faceColour);
  faceIndexToColour.set(i * 2 + 1, faceColour);
}

const absorptionPerUnit = 0.25;

function addNewRays() {  
  const rawPositions: number[] = [];
  const rawNormals: number[] = [];
  const rawColours: number[] = [];
  
  // Generate initial rays
  const rays = generateRays(AppConfig.LIGHT_POSITION, AppConfig.NUM_RAYS);

  const rayCaster = new THREE.Raycaster(new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 0.0, 0.0));

  for (let bounceCount = 0; bounceCount < AppConfig.NUM_BOUNCES; ++bounceCount) {
    for (let rayIndex = 0; rayIndex < AppConfig.NUM_RAYS; ++rayIndex) {
      const { ray, colour, alpha }  = rays[rayIndex];

      rayCaster.set(ray.origin, ray.direction);
      const intersections = rayCaster.intersectObject(cubeMesh);

      // Get the closest intersection, however, ignore the first intersection if there are multiple
      // as this is likely the ray intersecting with the 
      const intersection = (intersections.length >= 2) ? intersections[1] : intersections[0];

      if (intersection !== undefined && intersection.face !== undefined && intersection.face !== null && intersection.faceIndex !== undefined) {
        
        const hit = intersection.point;
        const hitNormal = intersection.face.normal;

        rawPositions.push(hit.x, hit.y, hit.z);
        rawNormals.push(hitNormal.x, hitNormal.y, hitNormal.z);
        
        const reflected = AppMath.reflectRay(ray.direction, intersection.face.normal);
        
        const newRay = new THREE.Ray(hit, reflected);
        rays[rayIndex].ray = newRay.clone();
        
        // Absorb colour
        const faceColour = faceIndexToColour.get(intersection.faceIndex)!;
        rays[rayIndex].colour.multiply(faceColour.clone());
        rays[rayIndex].alpha *= Math.pow(absorptionPerUnit, intersection.distance);
        
        rawColours.push(colour.r, colour.g, colour.b, rays[rayIndex].alpha);
      }
    }
  }

  const pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rawPositions, 3));
  pointsGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(rawNormals, 3));
  pointsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(rawColours, 4));
  pointsGeometry.computeBoundingSphere();

  var pointsMaterial = new THREE.PointsMaterial({
    sizeAttenuation: false,
    vertexColors: true,
    transparent: true,
    side: THREE.FrontSide
  });

  const points = new THREE.Points(pointsGeometry, pointsMaterial);
  scene.add(points);
}

function animate (): void {
  requestAnimationFrame(animate);

  render();
}

let time = 0.0;

camera.position.y = 0.25;

function render(): void {
  const distance = 1.5;
  camera.position.x = Math.sin(time) * distance;
  camera.position.z = Math.cos(time) * distance;
  camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));

  time += 0.001;

  renderer.render(scene, camera);
}

init();
addNewRays();

setInterval(addNewRays, 1000);

animate();
