import * as th from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; 
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';



let fxaaPass, renderPass, composer;


// all models to load
let modelsPath = ["portal2.glb", "bullet.glb", "sharingan.glb", "shieldBattery.glb", "triquetra.glb", "thor.glb"]

// models group
let modelsGroup = new th.Group();

// three js init variables
let scene, renderer;
let camera, container;
let gltfLoader = new GLTFLoader();

let buttons = {
  "forward": document.getElementById("forward"),
  "backward": document.getElementById("backward")
}

let flag = false;

// adding callback functions to the event
buttons["forward"].addEventListener("click", buttonCallback);
buttons["backward"].addEventListener("click", buttonCallback);

//buttons callback function
function buttonCallback(event) {
  if (event.target.id === "forward" && !flag){
    flag = true;
    smoothRotate(Math.PI * (1 / modelsPath.length) * 2);
  } else if (event.target.id === "backward" && !flag){
    flag = true;
    smoothRotate(-Math.PI * (1 / modelsPath.length) * 2);
  }
}


// load gltf2 model
function loadModel(url) {
  return new Promise((resolve, reject) => {
    gltfLoader.load(url, gltf => {
      resolve(gltf.scene)
    }, undefined, error => {
      reject(error);
    })
  });
}


// loading models and setup the startup position
function loadModels(models) {
  let points = new th.EllipseCurve(0, 0, 10, 10).getPoints(models.length);

  let promises = [];

  models.forEach((element, index) => {
    promises.push(loadModel(`models/${element}`).then(model => {
      model.name = element;

      model.position.x = points[index].x;
      model.position.z = points[index].y;
      modelsGroup.add(model);
    }));
  });

  modelsGroup.rotation.y += 0.515
  scene.add(modelsGroup);
}


// smooth rotation
function smoothRotate(angle) {
  let modelsGroupTween = new TWEEN.Tween(modelsGroup.rotation);
  let rotateTo = modelsGroup.rotation.y + angle;
  modelsGroupTween.easing(TWEEN.Easing.Quadratic.InOut).onComplete(() => {flag = false}).to({ y: rotateTo }, 1000).start();
}

// animations
function animate(time) {
  time *= 0.001
  requestAnimationFrame(animate);

  TWEEN.update();

  modelsGroup.children.forEach(element => {
    element.rotation.y = time;
  });

  composer.render();
}

//camera controls 
function addCameraControls() {
  const controls = new OrbitControls(camera, renderer.domElement);

  //controls.update() must be called after any manual changes to the camera's transform
  camera.position.set(0, 20, 100);
  controls.update();
}

//add  directional light
function addLight() {
  const directionalLight = new th.DirectionalLight(0xffffff, 0.2);
  const hemisphereLight = new th.HemisphereLight(0xedfcfc, 0x080820, 5);

  directionalLight.position.set(3,3,5);
  directionalLight.rotateY(10);

  scene.add(directionalLight);
  scene.add(hemisphereLight);
}


// main init function
function init() {

  container = document.getElementById("scene");
  scene = new th.Scene();
  camera = new th.PerspectiveCamera(80, container.offsetWidth / container.offsetHeight, 0.1, 1000);

  renderer = new th.WebGLRenderer({
    alpha: true,
    // anitialias: true,
  });
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  container.appendChild(renderer.domElement);

  composer = new EffectComposer( renderer );
  renderPass = new RenderPass(scene, camera);
  fxaaPass = new ShaderPass( FXAAShader );

  const pixelRatio = renderer.getPixelRatio();

  fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( container.offsetWidth * pixelRatio );
  fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( container.offsetHeight * pixelRatio );
  composer.addPass( renderPass );
  composer.addPass( fxaaPass );

  // addCameraControls();

  camera.position.z = 15;
  camera.lookAt(modelsGroup.position);

  addLight();
  loadModels(modelsPath);

  animate();
}


init();
