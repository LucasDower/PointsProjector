import * as THREE from 'three';

export namespace AppMath {
    export function getRandomRayDirection(): THREE.Vector3 {
        const lat = Math.acos(2.0 * Math.random() - 1.0) - (Math.PI / 2.0);
        const long = Math.PI * 2.0 * Math.random();

        return new THREE.Vector3(
            Math.cos(lat) * Math.cos(long),
            Math.cos(lat) * Math.sin(long),
            Math.sin(lat)
        );
    }

    export function nearlyEqual(a: number, b: number, epsilon: number = 0.0001) {
        return Math.abs(a - b) < epsilon;
    }

    export function reflectRay(incoming: THREE.Vector3, normal: THREE.Vector3): THREE.Vector3 {
        return incoming.clone().sub(normal.clone().multiplyScalar(2 * normal.dot(incoming)));
    }

}