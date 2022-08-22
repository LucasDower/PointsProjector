import * as THREE from 'three';
import { AppMath } from './math';

export namespace AppUtil {
    export function generateRays(origin: THREE.Vector3, count: number): Array<{ ray: THREE.Ray, colour: THREE.Color, alpha: number }> {
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

    export function getFaceColour(faceIndex: number) {
        switch (faceIndex) {
            case 0:
            case 1:
                return new THREE.Color(1.0, 1.0, 0.0);
            case 2:
            case 3:
                return new THREE.Color(0.0, 1.0, 1.0);
            case 6:
            case 7:
                return new THREE.Color(1.0, 0.0, 1.0);
            default:
                return new THREE.Color(1.0, 1.0, 1.0);
        }
    } 
}

