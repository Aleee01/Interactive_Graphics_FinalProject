import * as THREE from 'three'

const sphere = new THREE.SphereGeometry(0.3, 10, 10) //raggio e segmenti di suddivisione

export default class Thing{

    constructor() {
        const material = new THREE.MeshStandardMaterial({ color: 0xdd4646 });
        const mesh = new THREE.Mesh(sphere, material)

        mesh.castShadow = true //genera ombre
        mesh.receiveShadow = true //riceve ombre 
    }

}