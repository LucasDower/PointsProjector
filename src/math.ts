import * as THREE from 'three';

export namespace AppMath {
    export function getRandomUnitVector(): THREE.Vector3 {
        const vec = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
        return vec.normalize();
    }

    export function intersectLinePlane(planeCentre: THREE.Vector3, planeNormal: THREE.Vector3, ray: THREE.Ray) {
        if (AppMath.nearlyEqual(planeNormal.dot(ray.direction), 0)) {
            return undefined;
        }

        const t = (planeNormal.dot(planeCentre) - planeNormal.dot(ray.origin)) / planeNormal.dot(ray.direction);
        return ray.origin.clone().add(ray.direction.clone().multiplyScalar(t));
    }

    export function nearlyEqual(a: number, b: number, epsilon: number = 0.0001) {
        return Math.abs(a - b) < epsilon;
    }
}