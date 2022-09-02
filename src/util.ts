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

    /**
     * Expects geometry to be convex
     */
    export function addToScene(geometry: THREE.BufferGeometry, scene: THREE.Scene, colliders: THREE.Mesh[], draw: boolean) {
        // Add mesh to render
        if (draw) {
            const material = new THREE.MeshBasicMaterial({
                color: 0x000000,
                side: THREE.FrontSide
            })
            const mesh = new THREE.Mesh(geometry.clone().scale(0.99, 0.99, 0.99), material);
            scene.add(mesh);
        }
        
        // Add mesh to ray hit against
        {
            const material = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(geometry, material);
            colliders.push(mesh);
        }
    }
}

