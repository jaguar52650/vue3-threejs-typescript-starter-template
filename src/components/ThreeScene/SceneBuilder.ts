import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { toRaw } from "vue";
//https://holomorphicguy.hashnode.dev/using-threejs-with-vue3-and-typescript
import theCategories from "./categories.json";
import CameraControls from "camera-controls";
import gsap from "gsap";
import * as holdEvent from "hold-event";
//import * as holdEvent from "hold-event";

CameraControls.install({ THREE: THREE });

//https://github.com/yomotsu/hold-event/blob/master/src/KeyboardKeyHold.ts
const keyW = new holdEvent.KeyboardKeyHold("KeyW");
const keyS = new holdEvent.KeyboardKeyHold("KeyS");
const keyA = new holdEvent.KeyboardKeyHold("KeyA");
const keyD = new holdEvent.KeyboardKeyHold("KeyD");
const ArrowUp = new holdEvent.KeyboardKeyHold("ArrowUp");
const ArrowDown = new holdEvent.KeyboardKeyHold("ArrowDown");
const ArrowLeft = new holdEvent.KeyboardKeyHold("ArrowLeft");
const ArrowRight = new holdEvent.KeyboardKeyHold("ArrowRight");

export default class SceneBuilder {
  root: HTMLElement;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  material: THREE.MeshNormalMaterial;
  directionalLight;
  cameraControls;
  clock;

  constructor(root: HTMLElement) {
    this.clock = new THREE.Clock();
    this.root = root;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.scene.background = new THREE.Color(0x5555555);
    this.scene.background = new THREE.Color(0x0000000);
    this.cameraSetup();

    //this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.draw();
    this.root.appendChild(this.renderer.domElement);

    this.cameraControls = new CameraControls(
      this.camera,
      this.renderer.domElement
    );
    //this.cameraControls.truck(0.1, 0, false);
    const tween = gsap.fromTo(
      this.cameraControls,
      {
        azimuthAngle: 0,
      },
      {
        azimuthAngle: 180 * THREE.MathUtils.DEG2RAD,
        duration: 3,
        paused: true,
      }
    );

    //this.cameraControls.enabled = false;
    tween.play(0);
    keyW.addEventListener("holding", (event) => {
      this.cameraControls.forward(0.01 * event.deltaTime, false);
    });
    keyS.addEventListener("holding", (event) =>
      this.cameraControls.forward(-0.01 * event.deltaTime, false)
    );
    keyA.addEventListener("holding", (event) => {
      this.cameraControls.truck(-0.01 * event.deltaTime, 0, false);
    });
    keyD.addEventListener("holding", (event) => {
      this.cameraControls.truck(0.01 * event.deltaTime, 0, false);
    });
    ArrowUp.addEventListener("holding", (event) => {
      this.cameraControls.forward(0.005 * event.deltaTime, false);
    });
    ArrowDown.addEventListener("holding", (event) =>
      this.cameraControls.forward(-0.005 * event.deltaTime, false)
    );
    ArrowLeft.addEventListener("holding", (event) => {
      this.cameraControls.rotate(
        0.05 * THREE.MathUtils.DEG2RAD * event.deltaTime,
        0,
        true
      );
    });
    ArrowRight.addEventListener("holding", (event) => {
      this.cameraControls.rotate(
        -0.05 * THREE.MathUtils.DEG2RAD * event.deltaTime,
        0,
        true
      );
    });
  }

  cameraSetup() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.camera.position.set(2, 0, 2);
    this.camera.lookAt(0, 2, 0);
  }

  draw() {
    // LINE

    this.material = new THREE.LineBasicMaterial({ color: 0xffffff });

    // GRID
    const gridHelper = new THREE.GridHelper(500, 50);
    //this.scene.add(gridHelper);

    //AXES
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    //LIGHTS
    var light = new THREE.Light(0xffffff, 10, 100);
    light.position.set(10, 10, 10);
    this.scene.add(light);

    this.light = new THREE.AmbientLight(0xaaaaaa);
    this.scene.add(this.light);

    // Create a GridHelper
    let gridHelper2 = new THREE.GridHelper(20, 20, 0x555555, 0x555555, 10, 10);

    // Add objects to the grid
    for (let i = 0; i < 100; i++) {
      const object = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      );
      //gridHelper2.addObject(object);
    }
    gridHelper2.position.y = -1;
    this.scene.add(gridHelper2);
    this.drawFloor(701);
  }
  render = () => {
    // requestAnimationFrame(this.render);
    //this.renderer.render(toRaw(this.scene), this.camera);
    //this.controls.update();

    // snip
    const delta = this.clock.getDelta();
    const hasControlsUpdated = this.cameraControls.update(delta);

    requestAnimationFrame(this.render);

    // you can skip this condition to render though
    if (hasControlsUpdated) {
      //console.log(delta);
      //this.cameraControls.truck(0.1 * delta, 0, false);
      // this.cameraControls.rotate(
      //   -10 * THREE.MathUtils.DEG2RAD * delta,
      //   0,
      //   true
      // );
      //console.log("hasControlsUpdated");
      this.renderer.render(toRaw(this.scene), this.camera);
    }
  };

  addProduct = (front, back, index) => {
    const loadManager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(loadManager);
    let materials = [
      null,
      null,
      null,
      null,
      new THREE.MeshBasicMaterial({
        map: loader.load(front),
      }),
      new THREE.MeshBasicMaterial({
        map: loader.load(back),
      }),
    ];
    // materials = new THREE.MeshBasicMaterial({
    //   color: 0x00ff00,
    //   vertexColors: THREE.FaceColors,
    // });
    console.log(index);
    let width = 1;
    let height = (width / 3) * 4;
    let geometry = new THREE.BoxGeometry(width, height, 0.01); // ,в,
    const r = 5;
    const angle = index * (360 / 12) * THREE.MathUtils.DEG2RAD;
    console.log(angle);
    loadManager.onLoad = () => {
      const cube = new THREE.Mesh(geometry, materials);

      let x = r * Math.cos(angle);
      let y = r * Math.sin(angle);
      cube.position.set(x, 0, y);
      //cube.position.set(index * width * 1.5, 0, -0.5 );
      cube.rotation.y = -angle + 90 * THREE.MathUtils.DEG2RAD;

      this.scene.add(cube);
    };
  };

  drawFloor = (category) => {
    let level = this.getLevel(category, theCategories);
    //console.log(level);
    let index = 0;
    const subs = level.subs.filter((item) => item.picture_bar).slice(0, 12);
    let pos = 0;
    Math.floor(subs.length / -2);
    for (let i in subs) {
      this.addProduct(subs[i].picture_bar_img, subs[i].picture_bar_img, pos);
      index++;
      pos++;
    }
  };
  getLevel = (categoryId, levels) => {
    for (let i in levels) {
      if (levels[i].id == categoryId) {
        return levels[i];
      } else if (levels[i].subs.length) {
        let res = this.getLevel(categoryId, levels[i].subs);
        if (res) {
          return res;
        }
      }
    }
  };
}
