import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { toRaw } from "vue";
//https://holomorphicguy.hashnode.dev/using-threejs-with-vue3-and-typescript
import theCategories from "./categories.json";

export default class SceneBuilder {
  root: HTMLElement;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  material: THREE.MeshNormalMaterial;
  directionalLight;

  constructor(root: HTMLElement) {
    this.root = root;
    (this.scene = new THREE.Scene()),
      (this.renderer = new THREE.WebGLRenderer({ antialias: true }));

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.scene.background = new THREE.Color(0x5555555);
    this.scene.background = new THREE.Color(0x0000000);
    this.cameraSetup();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.draw();
    this.root.appendChild(this.renderer.domElement);
  }

  cameraSetup() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.camera.position.set(2, 2, 2);
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

    //threejs create box
    const loader = new THREE.TextureLoader();
    const texture = loader.load(
      "https://imgcdn.zarina.ru/upload/images/42250/thumb/900_9999/4225070571_153_1.webp?t=1712655854"
      //"https://threejs.org/manual/examples/resources/images/wall.jpg"
    );
    //https://imgcdn.zarina.ru/upload/images/42250/thumb/900_9999/4225070571_153_4.webp?t=1712655857
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({
      map: texture,
    });

    let box = new THREE.BoxGeometry(0.01, 2, 1); // ,в,
    //let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    let cube = new THREE.Mesh(box, material);
    cube.position.set(0.5, 1, -0.5);
    //this.scene.add(cube);

    // this.addProduct(
    //   "https://imgcdn.zarina.ru/upload/images/42250/thumb/900_9999/4225070571_153_1.webp?t=1712655854",
    //   "https://imgcdn.zarina.ru/upload/images/42250/thumb/900_9999/4225070571_153_4.webp?t=1712655857",
    //   0
    // );
    // this.addProduct(
    //   "https://imgcdn.zarina.ru/upload/images/44221/thumb/900_9999/4422142332_33_1.webp?t=1732025102",
    //   "https://imgcdn.zarina.ru/upload/images/44221/thumb/900_9999/4422142332_33_5.webp?t=1732025102",
    //   1
    // );

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
    this.scene.add(gridHelper2);
    this.drawFloor(701);
  }
  addProduct = (front, back, index) => {
    const loadManager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(loadManager);
    const materials = [
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
    let width = 1;
    let height = (width / 3) * 4;
    let geometry = new THREE.BoxGeometry(width, height, 0.01); // ,в,
    loadManager.onLoad = () => {
      const cube = new THREE.Mesh(geometry, materials);
      cube.position.set(0.5 + index * width * 1.5, 1, -0.5);
      this.scene.add(cube);
    };
  };

  drawFloor = (category) => {
    let level = this.getLevel(category, theCategories);
    console.log(level);
    let index = 0;
    for (let i in level.subs) {
      if (level.subs[i].picture_bar) {
        this.addProduct(
          level.subs[i].picture_bar_img,
          level.subs[i].picture_bar_img,
          index++
        );
      }
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

  render = () => {
    requestAnimationFrame(this.render);
    this.renderer.render(toRaw(this.scene), this.camera);
    this.controls.update();
  };
}
