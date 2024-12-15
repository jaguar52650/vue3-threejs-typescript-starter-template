import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { toRaw } from "vue";
//https://holomorphicguy.hashnode.dev/using-threejs-with-vue3-and-typescript
import theCategories from "./categories.json";
import CameraControls from "camera-controls";
import gsap from "gsap";
import * as holdEvent from "hold-event";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
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
  raycaster;

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
        duration: 10,
        paused: true,
      }
    );

    //this.cameraControls.enabled = false;

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

    this.raycaster = new THREE.Raycaster();

    tween.play(0);
  }

  cameraSetup() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.camera.position.set(35, 4, 35);
    this.camera.lookAt(0, 1, 0);
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
    let gridHelper2 = new THREE.GridHelper(60, 60, 0x555555, 0x555555, 10, 10);

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
    //this.drawFloor(259);
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
      // const intersects = this.raycaster.intersectObjects(this.scene.children);

      // for (let i = 0; i < intersects.length; i++) {
      //   //console.log(intersects[i]);
      // }
    }
  };

  addProduct = (front, back, index, count, name) => {
    const group = new THREE.Group();

    const loadManager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(loadManager);

    // materials = new THREE.MeshBasicMaterial({
    //   color: 0x00ff00,
    //   vertexColors: THREE.FaceColors,
    // });
    //console.log(index);
    const groupsAngle = 360;
    let width = 3;
    let height = (width / 3) * 4;
    let geometry = new THREE.BoxGeometry(width, height, 0.01); // ,в,
    const r = 30;
    const angle = index * (groupsAngle / count) * THREE.MathUtils.DEG2RAD;
    //console.log(angle);

    let x = r * Math.cos(angle);
    let y = r * Math.sin(angle);
    group.position.set(x, height, y);
    //group.position.set(index * width * 1.5, 0, -0.5 );
    group.rotation.y = -angle + (groupsAngle / 4) * THREE.MathUtils.DEG2RAD;

    if (front != "https://imgcdn.zarina.ru") {
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

      loadManager.onLoad = () => {
        const cube = new THREE.Mesh(geometry, materials);
        cube.position.y = 2.5;
        group.add(cube);
      };
    }

    //https://www.educative.io/answers/how-to-create-text-in-threejs
    // custom font see
    //font convertr
    //gero3.github.io/facetype.js/
    const fontLoader = new FontLoader();
    fontLoader.load(
      // path to the font (included in three)
      "node_modules/three/examples/fonts/droid/droid_serif_regular.typeface.json",
      // called when the font has loaded
      (droidFont) => {
        const settings = {
          size: 1,
          height: 0.02,
          font: droidFont,
        };

        const textGeometry = new TextGeometry(name, settings);
        //const textMaterial = new THREE.MeshNormalMaterial();
        const textMaterial = new THREE.MeshBasicMaterial({
          color: 0xb9b9b9,
          vertexColors: THREE.FaceColors,
        });

        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        //textMesh.geometry.x = 0.1;
        textMesh.scale.set(0.3, 0.3, 0.3);
        // Create a bounding box
        var box = new THREE.Box3().setFromObject(textMesh);
        // Get the size
        var size = new THREE.Vector3();
        box.getSize(size);
        //console.log(size);

        textMesh.position.x = size.x / -2;
        textMesh.position.y = 5; //высота
        textMesh.position.z = 0.5;

        group.add(textMesh);
      }
    );

    let geometryS = new THREE.BoxGeometry(width, width * 4.5, 0.01); // ,в,
    let material = new THREE.MeshBasicMaterial({
      color: 0x185a7e,
      vertexColors: THREE.FaceColors,
    });
    const mesh = new THREE.Mesh(geometryS, material);
    mesh.rotation.x = -55 * THREE.MathUtils.DEG2RAD;
    mesh.position.y = 0; //  высота
    mesh.position.z = -5.5; //к центру круга
    group.add(mesh);
    this.scene.add(group);
  };

  drawFloor = (category) => {
    let level = this.getLevel(category, theCategories);
    console.log(level);
    let index = 0;
    const subs = level.subs; //.filter((item) => item.picture_bar); //.slice(0, 12);
    let pos = 0;
    Math.floor(subs.length / -2);
    for (let i in subs) {
      this.addProduct(
        subs[i].picture_bar_img,
        subs[i].picture_bar_img,
        pos,
        subs.length,
        subs[i].name
      );
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
