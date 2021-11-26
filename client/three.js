import * as THREE from "https://cdn.skypack.dev/three@0.134.0";

/* variables utilises pour stocker la position de la camera et la position de l'objet a regarder */
let pos = {x: 0, y: 0, z: 100};
let look = {x: 0, y: 0};

/* permet de faire un rendu de la scene */
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

/* camera utilise dans la scene */
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );

/* scene de base utilisee pour le rendu */
const scene = new THREE.Scene();

/* materiau utilise pour dessiner le carre de la scene */
const material = new THREE.LineBasicMaterial( { color: 0x0000ff } ); 
const points = []; // points utilises pour creer le carre
points.push( new THREE.Vector3( -10,  10, 0 ) );
points.push( new THREE.Vector3(  10,  10, 0 ) );
points.push( new THREE.Vector3(  10, -10, 0 ) );
points.push( new THREE.Vector3( -10, -10, 0 ) );
points.push( new THREE.Vector3( -10,  10, 0 ) );

/* geometrie de la ligne, a partir des points crees */
const geometry = new THREE.BufferGeometry().setFromPoints( points );
/* objet representant la ligne a afficher, a partir de la geometrie et du materiau */
const line = new THREE.Line( geometry, material );

scene.add( line ); // ajout de la ligne a la scene

/* boucle principale du "jeu", actualise la position/direction de la camera et redessine la scene a l'ecran */
setInterval(() => {
    camera.position.set( pos.x, pos.y, pos.z );
    camera.lookAt( look.x, look.y, 0 );
    renderer.render( scene, camera );
}, 33);

/* associe les touches de claviers au changements les variables [look] et [pos] */
window.addEventListener('keydown', ev => {
    console.log(ev.key);
    switch (ev.key) {
        case "q":
            pos.x--;
            break;
        case "d":
            pos.x++;
            break;
        case "z":
            pos.z--;
            break;
        case "s":
            pos.z++;
            break;
        case "a":
            pos.y++;
            break;
        case "e":
            pos.y--;
            break;
        case "ArrowRight":
            look.x++;
            break;
        case "ArrowLeft":
            look.x--;
            break;
        case "ArrowUp":
            look.y++;
            break;
        case "ArrowDown":
            look.y--;
            break;
    
        default:
            break;
    }
});