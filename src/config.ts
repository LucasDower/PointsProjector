import * as THREE from 'three';

export namespace AppConfig {

    export const LIGHT_POSITION = new THREE.Vector3(0.2, 0.4, 0.0);

    export const AIR_ABSORPTION_PER_UNIT = 0.25;

    export const NEW_RAYS = true;

    export const NUM_RAYS = 5_000;

    export const NUM_BOUNCES = 3;

}