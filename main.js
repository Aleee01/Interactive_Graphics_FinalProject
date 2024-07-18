import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import TWEEN from '@tweenjs/tween.js';

const gameContainer = document.getElementById('game-container');
const scene = new THREE.Scene();
const resolution = new THREE.Vector2(30, 30);
const sizes = {
  width: gameContainer.clientWidth,
  height: gameContainer.clientHeight
};

const loader = new THREE.TextureLoader();
const initialTexture = loader.load('./background.png', function(texture) {
  scene.background = texture;
});

const camera = new THREE.PerspectiveCamera(70, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(8 + resolution.x / 2, resolution.x / 2, resolution.y + 6);
camera.lookAt(new THREE.Vector3(0, 2.5, 0));

const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
renderer.setSize(sizes.width, sizes.height);
renderer.shadowMap.enabled = true; // Abilita le ombre nel renderer
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Tipo di mappa delle ombre (opzionale, può essere cambiato in base alle esigenze)


gameContainer.appendChild(renderer.domElement);

const planeGeometry = new THREE.PlaneGeometry(resolution.x, resolution.y);
planeGeometry.rotateX(-Math.PI * 0.5);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x1E90FF });
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.position.x = resolution.x / 2 - 0.5;
planeMesh.position.z = resolution.y / 2 - 0.5;
planeMesh.position.y = -1;
planeMesh.receiveShadow = true
scene.add(planeMesh);

const gridHelper = new THREE.GridHelper(resolution.x, resolution.x, 0x000000, 0x000000);
gridHelper.position.set(resolution.x / 2 - 0.5, -1, resolution.y / 2 - 0.5);
scene.add(gridHelper);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(resolution.x / 2 + 4, 0, resolution.y / 2 + 4);

function getRandomPosition() {
  return {
    x: Math.floor(Math.random() * resolution.x),
    z: Math.floor(Math.random() * resolution.y)
  };
}

let character;
let model;

document.querySelectorAll('input[name="character"]').forEach((radio) => {
  radio.addEventListener('change', (event) => {
    resetGame()
    character = event.target.value;
    let pathMTL;
    let pathOBJ;
    if(character === "Patrick") {
      loadPatrick();
    } else if(character === "Spongebob") {
      loadSpongebob();
    }
  });
});

function loadPatrick() {
  const mtlLoader = new MTLLoader();
  mtlLoader.load('Patrick_.blend/Patrick.mtl', (materials) => {
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load('Patrick_.blend/Patrick.obj', (object) => {
      model = object;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const maxDimension = Math.max(size.x, size.y, size.z);
      let scale = 1 / maxDimension;
      scale *= 1.5;
      model.scale.set(scale, scale, scale);

      const pos = getRandomPosition();
      model.position.set(pos.x, 0, pos.z);

      model.castShadow = true
      model.receiveShadow = true

      scene.add(model);
      loadGhost();
    }, undefined, (error) => {
      console.error(error);
    });
  }, undefined, (error) => {
    console.error(error);
  });
}

function loadSpongebob() {
  const mtlLoader = new MTLLoader();
  mtlLoader.load('Patrick_.blend/Spongebob_blend.mtl', (materials) => {
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load('Patrick_.blend/Spongebob_blend.obj', (object) => {
      model = object;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const maxDimension = Math.max(size.x, size.y, size.z);
      let scale = 1 / maxDimension;
      scale *= 1.5;
      model.scale.set(scale, scale, scale);

      const pos = getRandomPosition();
      model.position.set(pos.x, -1, pos.z);
      model.rotation.y = Math.PI

      model.castShadow = true
      model.receiveShadow = true

      scene.add(model);
      loadGhost();
    }, undefined, (error) => {
      console.error(error);
    });
  }, undefined, (error) => {
    console.error(error);
  });
}


let ghost;
function loadGhost() {
  const loaderG = new OBJLoader();
  loaderG.load('Ghost.obj', (object) => {
    ghost = object;
    ghost.material = new THREE.MeshStandardMaterial({ color: 0xffffff });

    let pos;
    do {
      pos = getRandomPosition();
    } while (pos.x === model.position.x && pos.z === model.position.z);

    ghost.castShadow = true
    ghost.receiveShadow = true
    ghost.position.set(pos.x, 0, pos.z);
    ghost.position.y = -1;
    scene.add(ghost);
  }, undefined, (error) => {
    console.error(error);
  });
}

const UP = new THREE.Vector3(0, 0, -1);
const DOWN = new THREE.Vector3(0, 0, 1);
const RIGHT = new THREE.Vector3(1, 0, 0);
const LEFT = new THREE.Vector3(-1, 0, 0);

let direction = DOWN;
let moveInterval;
let moveSpeed = 500;
let speedGhost = 600;

document.addEventListener('keydown', (event) => {
  if (!model) return;

  switch (event.key) {
    case 'ArrowUp':
      direction = UP
      if(character==="Spongebob") {
        model.rotation.y = 0;
     }
     else if(character==="Patrick") {
       model.rotation.y = Math.PI;
     }
      break;
    case 'ArrowDown':
      direction = DOWN
      if(character==="Spongebob") {
        model.rotation.y = Math.PI;
     }
     else if(character==="Patrick") {
       model.rotation.y = 0;
     }
      break;
    case 'ArrowLeft':
      direction = LEFT
      if(character==="Spongebob") {
         model.rotation.y = Math.PI / 2;
      }
      else if(character==="Patrick") {
        model.rotation.y = -Math.PI / 2;
      }
      break;
    case 'ArrowRight':
      direction = RIGHT
      if(character==="Spongebob") {
        model.rotation.y = -Math.PI / 2;
     }
     else if(character==="Patrick") {
       model.rotation.y = Math.PI / 2;
     }
      break;
  }
});

function moveModel() {
  if (!model) return;

  const targetPosition = model.position.clone().add(direction);

  // Wrap around grid boundaries
  if (targetPosition.x < 0) targetPosition.x = resolution.x - 1;
  if (targetPosition.x >= resolution.x) targetPosition.x = 0;
  if (targetPosition.z < 0) targetPosition.z = resolution.y - 1;
  if (targetPosition.z >= resolution.y) targetPosition.z = 0;

  new TWEEN.Tween(model.position)
    .to({ x: targetPosition.x, z: targetPosition.z }, moveSpeed)
    .start()

  moveGhostTowardsModel();
  checkSphereCollision();
  checkBoxCollision();
  checkGhostCollision();
}


function moveGhostTowardsModel() {
  if (!ghost || !model || blocked) return;

  const directionToModel = new THREE.Vector3();
  if (Math.abs(model.position.x - ghost.position.x) > Math.abs(model.position.z - ghost.position.z)) {
    directionToModel.x = Math.sign(model.position.x - ghost.position.x);
    directionToModel.z = 0;
  } else {
    directionToModel.x = 0;
    directionToModel.z = Math.sign(model.position.z - ghost.position.z);
  }

  const targetPosition = ghost.position.clone().add(directionToModel);

  // Wrap around grid boundaries
  if (targetPosition.x < 0) targetPosition.x = resolution.x - 1;
  if (targetPosition.x >= resolution.x) targetPosition.x = 0;
  if (targetPosition.z < 0) targetPosition.z = resolution.y - 1;
  if (targetPosition.z >= resolution.y) targetPosition.z = 0;

  new TWEEN.Tween(ghost.position)
    .to({ x: targetPosition.x, z: targetPosition.z }, speedGhost)
    .start();

  // Update rotation based on movement direction
  if (directionToModel.x === 1) {
    ghost.rotation.y = -Math.PI / 2;
  } else if (directionToModel.x === -1) {
    ghost.rotation.y = Math.PI / 2;
  } else if (directionToModel.z === 1) {
    ghost.rotation.y = Math.PI;
  } else if (directionToModel.z === -1) {
    ghost.rotation.y = 0;
  }
}

const dirLight = new THREE.DirectionalLight(0xffffff, 3);
dirLight.position.set(10, 10, 10);
dirLight.target.position.set(resolution.x / 2, 0, resolution.y / 2);
dirLight.castShadow = true; // Abilita le ombre per la luce direzionale

// Configurazioni aggiuntive per le ombre
dirLight.shadow.mapSize.set(1024, 1024); // Dimensione della mappa delle ombre
dirLight.shadow.radius = 6; // Raggio di sfocatura delle ombre (opzionale)
dirLight.shadow.camera.top = resolution.y / 2; // Estensione della telecamera delle ombre
dirLight.shadow.camera.bottom = -resolution.y / 2;
dirLight.shadow.camera.left = -resolution.x / 2;
dirLight.shadow.camera.right = resolution.x / 2;

scene.add(dirLight);


function animate() {
  controls.update();
  TWEEN.update(); // Update the TWEEN animations
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

function updateBackground(texturePath, planeColor) {
  loader.load(texturePath, function(texture) {
    scene.background = texture;
  });
  planeMaterial.color.set(planeColor);
}

document.querySelectorAll('input[name="mode"]').forEach((radio) => {
  radio.addEventListener('change', (event) => {
    const selectedBackground = event.target.value;
    const selectedColor = event.target.dataset.color;
    updateBackground(selectedBackground, selectedColor);
  });
});

const playButton = document.getElementById('playButton');
const stopButton = document.getElementById('stopButton');
const resumeButton = document.getElementById('resumeButton');
const resetButton = document.getElementById('resetButton');

let gameStarted = false;
let startTime; 
let endTime; 
let seconds;

function calculateTime() {
  const elapsedTime = endTime - startTime; 
  seconds = Math.floor(elapsedTime / 1000); 
}

playButton.addEventListener('click', async () => {
  const { value: name } = await Swal.fire({
    title: 'Enter your name',
    input: 'text',
    inputLabel: 'Your name',
    inputPlaceholder: 'Enter your name',
    inputValidator: (value) => {
      if (!value) {
        return 'You need to write something!';
      }
    }
  });

  if (name) {
    document.getElementById('username').textContent = ` ${name}`;
    startTime = Date.now();
    if(gameStarted) {
      resetGame()    
    }
    if (!gameStarted) {
      gameStarted = true;
      if (!moveInterval) {
        moveInterval = setInterval(moveModel, moveSpeed);
      }
      if(!boxInterval) {
        startBoxGeneration()
      }
      generateFallingSpheres();
    }
  }
});

stopButton.addEventListener('click', () => {
  stopGame();
});

resumeButton.addEventListener('click', () => {
  moveInterval = setInterval(moveModel, moveSpeed);
});

resetButton.addEventListener('click', () => {
  resetGame();
});

function resetGame() {
  stopGame();
  document.querySelectorAll('input[name="character"]').forEach(radio => {
    radio.checked = false;
  });
  redSphereCount = redSphere
  greenSphereCount = greenSphere
  document.getElementById('username').textContent = ``;
  document.getElementById('score').textContent = ``;
  scene.remove(ghost);
  scene.remove(model);

  for(let i=0; i<prisms.length; i++) {
     scene.remove(prisms[i])
  }
  for (let i = 0; i < spheres.length; i++) {
    scene.remove(spheres[i]);
  }
  for (let i = 0; i < rocks.length; i++) {
    scene.remove(rocks[i]);
  }
  for (let i = 0; i < boxes.length; i++) {
    scene.remove(boxes[i]);
  }
  spheres = [];
  rocks = []
  gameStarted = false;
}

function stopGame() {
  clearInterval(moveInterval);
  stopBoxGeneration();
  moveInterval = null;
  gameStarted = false;
}

document.querySelectorAll('input[name="difficulty"]').forEach((radio) => {
  radio.addEventListener('change', (event) => {
    stopGame();
    switch (event.target.value) {
      case 'easy':
        moveSpeed = 500;
        speedGhost = 600;
        redSphere = 3;
        greenSphere = 2;
        yellowSphere = 0;
        numRocks = 5;
        numBoxes = 5;
        numPrism = 1;
        break;
      case 'medium':
        moveSpeed = 300;
        speedGhost = 400;
        redSphere = 5;
        greenSphere = 2;
        yellowSphere = 3;
        numRocks = 8;
        numBoxes = 8;
        numPrism = 3;
        break;
      case 'hard':
        moveSpeed = 100;
        speedGhost = 200;
        redSphere = 10;
        greenSphere = 5;
        yellowSphere = 5;
        numRocks = 13;
        numBoxes = 13;
        numPrism = 5;
        break;
    }
    resetGame();
  });
});

let numPrism = 1; 
let redSphere = 3;
let greenSphere = 2;
let yellowSphere = 0;
let numRocks = 5; 
let numBoxes = 5;
let redPoints = 10;
let greenPoints = 20;
let yellowPoints = -10;

let spheres = [];
let prisms = [];
let rocks = [];
let boxes = [];

let boxInterval = null;

function generateFallingSpheres() {

  for (let i = 0; i < redSphere; i++) {
    createSphere(0xff0000, redPoints);
  }
  for (let i = 0; i < greenSphere; i++) {
    createSphere(0x00ff00, greenPoints);
  }
  for (let i = 0; i < yellowSphere; i++) {
    createSphere(0xffff00, yellowPoints);
  }
  for(let i=0; i<numPrism; i++){
    createPrism(0x00ffff);
  }
  for (let i = 0; i < numRocks; i++) {
    createRocks(0xacacac);
  }
}

function createSphere(color, points) {
  setTimeout(() => {
    let pos = getRandomPosition();
    while (isPositionOccupied(pos)) {
      pos = getRandomPosition();
    }

    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: color });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = true
    sphere.receiveShadow = true
    sphere.userData.points = points; // 10 punti
    sphere.position.set(pos.x, 20, pos.z);
    spheres.push(sphere);
    scene.add(sphere);

    new TWEEN.Tween(sphere.position)
      .to({ y: -0.5 }, 2000)
      .easing(TWEEN.Easing.Bounce.Out)
      .start();
  }, Math.random() * 2000);
}

function createPrism(color) {
  setTimeout(() => {
    let pos = getRandomPosition();
    while (isPositionOccupied(pos)) {
      pos = getRandomPosition();
    }

    const prismGeometry = new THREE.CylinderGeometry(0, 0.5, 1, 3); // Prisma triangolare
    const prismMaterial = new THREE.MeshStandardMaterial({ color: color });
    const prism = new THREE.Mesh(prismGeometry, prismMaterial);
    prism.castShadow = true
    prism.receiveShadow = true
    prism.position.set(pos.x, 20, pos.z)
    scene.add(prism);
    prisms.push(prism)

    new TWEEN.Tween(prism.position)
      .to({ y: -0.5 }, 2000)
      .easing(TWEEN.Easing.Bounce.Out)
      .start();
  }, Math.random() * 2000);
}

function createRocks(color) {
  setTimeout(() => {
    let pos = getRandomPosition();
    while (isPositionOccupied(pos)) {
      pos = getRandomPosition();
    }

    const rockGeometry = new THREE.IcosahedronGeometry(0.5);
    const rockMaterial = new THREE.MeshStandardMaterial({ color: color });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.castShadow = true
    rock.receiveShadow = true
    rock.position.set(pos.x, 20, pos.z);
    rocks.push(rock);
    scene.add(rock);

    new TWEEN.Tween(rock.position)
      .to({ y: -0.5 }, 2000)
      .easing(TWEEN.Easing.Bounce.Out)
      .start();
  }, Math.random() * 2000);

}

function createBox() {
  setTimeout(() => {
    let pos = getRandomPosition();
    while (isPositionOccupied(pos)) {
      pos = getRandomPosition();
    }

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const loader2 = new THREE.TextureLoader();
    const boxMaterial = new THREE.MeshStandardMaterial({color: 0xff00a0 });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.castShadow = true
    box.receiveShadow = true
    box.position.set(pos.x, 20, pos.z);
    boxes.push(box);
    scene.add(box);

    new TWEEN.Tween(box.position)
      .to({ y: -0.5 }, 2000)
      .easing(TWEEN.Easing.Bounce.Out)
      .start();
  }, Math.random() * 2000);

}

function stopBoxGeneration() {
  clearInterval(boxInterval);
  boxInterval = null;
}
function startBoxGeneration() {
  boxInterval = setInterval(() => {
    createBox(0xDF73FF);
  }, 5000);
}

function checkBoxCollision() {
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i];
    if (model && Math.round(model.position.x) === Math.round(box.position.x) && Math.round(model.position.z) === Math.round(box.position.z)) {
      scene.remove(box);
      boxes.splice(i, 1);

      const effectType = Math.random();

      if (effectType < 0.5) {
        // Effetto: punti doppi per 10 secondi
        applyDoublePointsEffect();
      } else {
        // Effetto: punti dimezzati per 10 secondi
        applyHalfPointsEffect();
      }
      startEffectTimer();
    }
  }
}

let currentEffect = null;

function applyDoublePointsEffect() {
  console.log("double")
  for(let i=0; i<spheres.length; i++) {
    const sphere = spheres[i];
    sphere.userData.points *= 2
  }
  currentEffect = "double"
}

function applyHalfPointsEffect() {
  console.log("half")
  for(let i=0; i<spheres.length; i++) {
    const sphere = spheres[i];
    sphere.userData.points /= 2
  }
  currentEffect = 'half';
}

function resetPoints() {
  for(let i=0; i<spheres.length; i++) {
    const sphere = spheres[i];
    const currentColor = sphere.material.color
    const red = new THREE.Color(0xff0000);
    const green = new THREE.Color(0x00ff00);
    const yellow = new THREE.Color(0xffff00)
    if(currentColor.equals(red)) {
      sphere.userData.points = 10
    }
    else if (currentColor.equals(green)) {
      sphere.userData.points = 20
    }
    else if(currentColor.equals(yellow)) {
      sphere.userData.points = -10
    }
  }
}

let effectTimeout;

function startEffectTimer() {
  clearTimeout(effectTimeout); 
  effectTimeout = setTimeout(() => {
    resetPoints();
    currentEffect = null;
  }, 10000); // 10 secondi
}


function isPositionOccupied(pos) {

  if (model && Math.round(pos.x) === Math.round(model.position.x) && Math.round(pos.z) === Math.round(model.position.z)) {
    return true;
  }
  if (ghost && Math.round(pos.x) === Math.round(ghost.position.x) && Math.round(pos.z) === Math.round(ghost.position.z)) {
    return true;
  }
  for (let i = 0; i < spheres.length; i++) {
    const sphere = spheres[i];
    if (Math.round(pos.x) === Math.round(sphere.position.x) && Math.round(pos.z) === Math.round(sphere.position.z)) {
      return true;
    }
  }
  for (let i = 0; i < rocks.length; i++) {
    const rock = rocks[i];
    if (Math.round(pos.x) === Math.round(rock.position.x) && Math.round(pos.z) === Math.round(rock.position.z)) {
      return true;
    }
  }
  for(let i=0; i<numPrism; i++) {
    const prism = prisms[i]
    if (prism && Math.round(pos.x) === Math.round(prism.position.x) && Math.round(pos.z) === Math.round(prism.position.z)) {
      return true;
    }
  }
  
  return false;
}

function checkGhostCollision() {
  if (model && ghost && Math.round(model.position.x) === Math.round(ghost.position.x) && Math.round(model.position.z) === Math.round(ghost.position.z)) {
    // Fermare il gioco e mostrare il messaggio di game over
    clearInterval(moveInterval); 
    stopBoxGeneration()
    Swal.fire({
      title: 'Game over!',
      text: 'Try again!',
      icon: 'error',
      confirmButtonText: 'OK'
    }).then((result) => {
      if (result.isConfirmed) {
        resetGame()
      }
    }); 
  }
}


let redSphereCount = redSphere
let greenSphereCount = greenSphere

function checkSphereCollision() {
  for (let i = 0; i < spheres.length; i++) {
    const sphere = spheres[i];
    if (model && Math.round(model.position.x) === Math.round(sphere.position.x) && Math.round(model.position.z) === Math.round(sphere.position.z)) {
      scene.remove(sphere);
      const color = sphere.material.color
      const red = new THREE.Color(0xff0000);
      const green = new THREE.Color(0x00ff00);
      if(color.equals(red)){
        redSphereCount--
        console.log(redSphereCount)
      }
      else if(color.equals(green)){
        greenSphereCount--
      }
      spheres.splice(i, 1);
      addToScore(sphere.userData.points);
    }
    if (redSphereCount===0 && greenSphereCount===0) {
      endTime = Date.now(); // Memorizza il tempo di fineù
      calculateTime()
      stopGame()
      Swal.fire({
        title: 'You have win!',
        text:  `You completed the game in ${seconds} seconds`,
        icon: 'success',
        confirmButtonText: 'OK'
      }).then((result) => {
        if (result.isConfirmed) {
          resetGame()
        }
      }); 
    }
  }
  for(let i=0; i<prisms.length; i++) {
    const prism = prisms[i]
    if (prism && Math.round(model.position.x) === Math.round(prism.position.x) && Math.round(model.position.z) === Math.round(prism.position.z)) {
      scene.remove(prism)
      freezeGhost()
    }
  }
  
  for (let i = 0; i < rocks.length; i++) {
    const rock = rocks[i];
    if (model && Math.round(model.position.x) === Math.round(rock.position.x) && Math.round(model.position.z) === Math.round(rock.position.z)) {
      scene.remove(rock);
      resetGame()
      Swal.fire({
        title: 'Game over!',
        text: 'Try again!',
        icon: 'error',
        confirmButtonText: 'OK'
      })
    }
  }
}

let blocked = false;

function freezeGhost() {
  blocked = true; // Imposta blocked a true

  setTimeout(() => {
    blocked = false; // Dopo 10 secondi, reimposta blocked a false
  }, 10000); // 10000 millisecondi = 10 secondi
}

function addToScore(points) {
  let scoreElement = document.getElementById("score");
  let currentScore = parseInt(scoreElement.innerHTML) || 0;
  currentScore += points;
  scoreElement.innerHTML = currentScore;
}
