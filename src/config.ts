import * as THREE from 'three';

export namespace AppConfig {

    export const LIGHT_POSITION = new THREE.Vector3(0.2, 0.4, 0.0);

    export const AIR_ABSORPTION_PER_UNIT = 0.25;

    export const NUM_RAYS = 1_000;

    export const NUM_BOUNCES = 5;

}