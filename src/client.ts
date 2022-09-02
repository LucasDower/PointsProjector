import * as THREE from 'three';
import { AppMath } from './math';
import { AppConfig } from './config';
import { AppUtil } from './util';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const hitMeshes: THREE.Mesh[] = []; // Meshes for rays to collide with
let time = 0.0;

/**
 * Setup the scene
 */
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

  // Add a mesh to represent the light position
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

  const cylinder = new THREE.CylinderGeometry(0.05, 0.05, 0.2);
  cylinder.translate(0.1, -0.1, -0.3);
  AppUtil.addToScene(cylinder, scene, hitMeshes, true);

  const box = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  box.translate(-0.2, -0.4, 0);
  box.rotateY(THREE.MathUtils.degToRad(30));
  AppUtil.addToScene(box, scene, hitMeshes, true);

  const walls = new THREE.BoxGeometry(1.0, 1.0, 1.0);
  AppUtil.addToScene(walls, scene, hitMeshes, false);

  addNewRays();

  if (AppConfig.NEW_RAYS) {
    setInterval(addNewRays, 1000);
  }
}

/**
 * Do another wave of ray-casts and add new points into the scene
 */
function addNewRays() {  
  const rawPositions: number[] = [];
  const rawColours: number[] = [];
  
  // Generate initial rays
  const rays = AppUtil.generateRays(AppConfig.LIGHT_POSITION, AppConfig.NUM_RAYS);
  const rayCaster = new THREE.Raycaster(new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 0.0, 0.0));

  for (let bounceCount = 0; bounceCount < AppConfig.NUM_BOUNCES; ++bounceCount) {
    for (let rayIndex = 0; rayIndex < AppConfig.NUM_RAYS; ++rayIndex) {
      const { ray, colour, alpha }  = rays[rayIndex];

      rayCaster.set(ray.origin, ray.direction);
      const intersections = rayCaster.intersectObjects(hitMeshes);

      // Ignore the intersection if ray collided with the wall it previously just reflected off of.
      // TODO: This could just be fixed by adding a small offset to the reflected ray's origin along
      // the face's normal.
      let intersection = intersections[0];
      if (intersections.length > 1 && intersection.point.distanceTo(ray.origin) < 0.001) {
        intersection = intersections[1];
      }

      if (intersection !== undefined && intersection.face !== undefined && intersection.face !== null && intersection.faceIndex !== undefined) {
        const hitPos = intersection.point;
        const reflectedDirection = AppMath.reflectRay(ray.direction, intersection.face.normal);
        
        // Update ray's position and direction
        rays[rayIndex].ray.origin = hitPos;
        rays[rayIndex].ray.direction = reflectedDirection;
        
        // Absorb colour
        const faceColour = AppUtil.getFaceColour(intersection.faceIndex);
        rays[rayIndex].colour.multiply(faceColour.clone());
        rays[rayIndex].alpha *= Math.pow(AppConfig.AIR_ABSORPTION_PER_UNIT, intersection.distance);
        
        // Add raw data to draw
        rawPositions.push(hitPos.x, hitPos.y, hitPos.z);
        rawColours.push(colour.r, colour.g, colour.b, rays[rayIndex].alpha);
      }
    }
  }

  const pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rawPositions, 3));
  pointsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(rawColours, 4));
  pointsGeometry.computeBoundingSphere();

  var pointsMaterial = new THREE.PointsMaterial({
    sizeAttenuation: false,
    vertexColors: true,
    transparent: true,
  });

  const points = new THREE.Points(pointsGeometry, pointsMaterial);
  scene.add(points);
}

function animate(): void {
  requestAnimationFrame(animate);
  render();
}

function render(): void {
  const distance = 0.5;
  camera.position.x = Math.sin(time) * distance;
  camera.position.y = Math.sin(time) * 0.5;
  camera.position.z = Math.cos(time) * distance;
  camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));

  renderer.render(scene, camera);
  
  time += 0.001;
}

init();
animate();
