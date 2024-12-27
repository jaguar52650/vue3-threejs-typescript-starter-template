import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { toRaw } from "vue";
//https://holomorphicguy.hashnode.dev/using-threejs-with-vue3-and-typescript
import theCategories from "./categories.json";
import theCategory from "./category_703.json";
import colors from "./colors.json";
import CameraControls from "camera-controls";
import gsap from "gsap";
import * as holdEvent from "hold-event";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import GUI from "lil-gui";
import Stats from "stats.js";
//import Stats from "three/examples/jsm/libs/stats.module"; //https://sbcode.net/threejs/multi-controls-example/
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
  mesh;
  params;
  elevator;
  floor;
  stats;
  constructor(root: HTMLElement) {
    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom);

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
        distance: 2,
        //polarAngle: 90,
      },
      {
        azimuthAngle: (180 - 45) * -THREE.MathUtils.DEG2RAD,
        polarAngle: 70 * THREE.MathUtils.DEG2RAD,
        distance: 60,
        duration: 30,
        paused: true,
      }
    );

    //this.cameraControls.enabled = false;

    keyW.addEventListener("holding", (event) => {
      this.cameraControls.forward(0.01 * event.deltaTime, false);
    });
    keyS.addEventListener("holding", (event) => {
      this.cameraControls.forward(-0.01 * event.deltaTime, false);
    });
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
    setTimeout((_) => {
      tween.play(0);
    }, 2000);
  }

  cameraSetup() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.camera.position.set(35, 2, 35);
    this.camera.lookAt(0, 1, 0);
  }

  draw() {
    const loaderGltf = new GLTFLoader();
    loaderGltf.load("/models/lucy_wyldstyle.glb", (gltf) => {
      this.scene.add(gltf.scene);
      gltf.scene.position.y = -1.3; //  высота
      // gltf.scene.position.z = -4;
      // gltf.scene.scale.set(0.4, 0.4, 0.4);
      // gltf.scene.rotation.y = 180 * THREE.MathUtils.DEG2RAD;
      this.cameraControls.forward(0.0001, false);
    });
    // LINE

    this.material = new THREE.LineBasicMaterial({ color: 0xffffff });

    // GRID
    //const gridHelper = new THREE.GridHelper(500, 50);
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

    // direction light
    const color = 0xffffff;
    const intensity = 1;
    const directLight = new THREE.DirectionalLight(color, intensity);
    directLight.position.set(0, 10, 0);
    directLight.target.position.set(-5, 0, 0);
    this.scene.add(directLight);
    this.scene.add(directLight.target);

    // Create a GridHelper
    let gridHelper2 = new THREE.GridHelper(
      120,
      120,
      0x555555,
      0x555555,
      10,
      10
    );

    // Add objects to the grid
    // for (let i = 0; i < 100; i++) {
    //   const object = new THREE.Mesh(
    //     new THREE.BoxGeometry(1, 1, 1),
    //     new THREE.MeshBasicMaterial({ color: 0xff0000 })
    //   );
    //   //gridHelper2.addObject(object);
    // }
    gridHelper2.position.y = -1;
    this.scene.add(gridHelper2);
    this.drawFloor(701);
    //this.drawFloor(259);
    //this.drawElevator();
    this.drowProducts(theCategory);
  }
  drowProducts(category) {
    let count = category.filters.colors.length;

    let colorsMap = [];
    for (let index in colors) {
      colorsMap[colors[index].id] = colors[index].base_id ?? colors[index].id;
    }
    //console.log(colorsMap[104]);
    for (let index in category.filters.colors) {
      let color = category.filters.colors[index];
      //color.title
      const group = new THREE.Group();

      const groupsAngle = 180;
      let width = 3;
      let height = (width / 3) * 4;
      const r = 40;
      let countForAngel = count % 2 ? count : count - 1;
      const angle =
        index * (groupsAngle / countForAngel) * THREE.MathUtils.DEG2RAD;

      let x = r * Math.cos(angle);
      let y = 0.5 * r * Math.sin(angle);
      group.position.set(x, height, y);

      const fontLoader = new FontLoader();
      fontLoader.load(
        // path to the font (included in three)
        "node_modules/three/examples/fonts/droid/droid_serif_regular.typeface.json",
        // called when the font has loaded
        (droidFont) => {
          const settings = {
            size: 2,
            height: 0.05,
            font: droidFont,
          };

          const textGeometry = new TextGeometry(color.title, settings);
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
      //console.log(color.id);
      let ii = 0;
      for (let i in category.items.products) {
        //.slice(0, 4)
        let product = category.items.products[i];

        if (
          !product.colors
            .map((color) => parseInt(colorsMap[color.id]))
            .includes(color.id)
        ) {
          continue;
        }

        // console.log(product);
        let geometry = new THREE.BoxGeometry(width, height, 0.01); // ,в,
        let front = product.media.filter((media) => media.type == "image")[0]
          .media_url;
        let loadManager = new THREE.LoadingManager();
        const loader = new THREE.TextureLoader(loadManager);
        let materials = [
          null,
          null,
          null,
          null,
          new THREE.MeshBasicMaterial({
            map: loader.load(front),
          }),
          // null,
          new THREE.MeshBasicMaterial({
            map: loader.load(front),
          }),
        ];

        const cube = new THREE.Mesh(geometry, materials);
        cube.position.y = 2.5;

        if (ii % 2) {
          cube.position.x = width * 1.5;
          cube.position.z = (ii - 1) * -1.5;
        } else {
          cube.position.z = ii * -1.5;
        }
        cube.position.x -= width * 0.75;

        group.add(cube);
        ii++;
      }
      // console.log(angle * THREE.MathUtils.DEG2RAD);

      let angleRotate = index * (groupsAngle / countForAngel);
      //console.log(angleRotate);
      let baseAngle = -90;
      if (angleRotate > 90) {
        angleRotate *= -1;
        //baseAngle *= -1;
        group.rotation.y = (baseAngle + angleRotate) * THREE.MathUtils.DEG2RAD;
      } else {
        group.rotation.y = (baseAngle - angleRotate) * THREE.MathUtils.DEG2RAD;
      }
      //group.rotation.y =
      //(180 - index * (groupsAngle / count)) * THREE.MathUtils.DEG2RAD; //180

      this.scene.add(group);
    }
  }
  drawElevator() {
    const loaderGltf = new GLTFLoader();
    loaderGltf.load("/models/stairs1.glb", (gltf) => {
      // https://sketchfab.com/3d-models/stairs-railings-a419edddce534968937313dcff8429e7
      this.elevator = new THREE.Group();
      //console.log(gltf.scene.children[0].children[0].children[0]);
      this.elevator.add(gltf.scene);
      this.scene.add(this.elevator);
      var box = new THREE.Box3().setFromObject(this.elevator);
      var size = new THREE.Vector3();
      box.getSize(size);

      //this.elevator.position.x = size.x / 2;
      //this.elevator.position.y = -1; //высота
      //this.elevator.position.z = size.z / 2;
    });
  }
  drawElevators() {
    const loaderGltf = new GLTFLoader();
    loaderGltf.load("/models/stairs__railings.glb", (gltf) => {
      // https://sketchfab.com/3d-models/stairs-railings-a419edddce534968937313dcff8429e7
      this.elevator = new THREE.Group();
      //console.log(gltf.scene.children[0].children[0].children[0]);
      //this.scene.add(gltf.scene.children[0]);
      // let mesh = gltf.scene.children[0].children[0].children[0];
      //console.log(gltf.scene.children[0].children);

      let materialWhite = new THREE.MeshStandardMaterial({
        color: 0xffffff,
      });
      // 02, 12, 36,
      //index 0 ,10, 34
      let objs = [0, 10, 34];
      objs.forEach((index) => {
        let geometry =
          gltf.scene.children[0].children[0].children[index].geometry;
        let mesh = new THREE.Mesh(geometry, materialWhite);
        console.log(geometry);
        this.elevator.add(mesh);
      });

      let geometry = gltf.scene.children[0].children[0].children[0].geometry;

      const material = new THREE.MeshStandardMaterial({
        color: 0x0080c0,
        blendColor: 0x0080c0,
        opacity: 0.1,
        blending: 1,
        blendEquation: 100,
        blendSrc: 204,
        blendDst: 205,
        alphaToCoverage: false,
        transparent: true,
        roughnes: 1,
        toneMapped: true,
        vertexColors: false,
        emissive: 0x000000,
      });
      this.mesh = new THREE.Mesh(geometry, material);

      this.elevator.add(this.mesh);

      // var box = new THREE.Box3().setFromObject(this.mesh);
      // var size = new THREE.Vector3();
      // box.getSize(size);
      // console.log(size);
      // mesh.position.x -= size.x / 2;
      // mesh.position.y -= size.y / 2; //высота
      // mesh.position.z -= size.z / 2;

      this.scene.add(this.elevator);

      this.elevator.position.x = this.params.x;
      this.elevator.position.y = 10; //высота
      this.elevator.position.z = this.params.z - 50;
    });

    // const objLoader = new OBJLoader();
    // objLoader.load("/models/STAIRS_AND_RAILINGS.obj", (root) => {
    //   console.log(root);
    //   // this.scene.add(root.scene.children[0].children[0].children);
    // });

    //this.addWord();

    //this.mesh.morphTargetInfluences[0] = 0;
    this.initGUI();
  }
  initGUI = () => {
    // Set up dat.GUI to control targets
    this.params = {
      Spherify: 0,
      x: 239,
      y: 0,
      z: -696 + 28,
    };
    const gui = new GUI({ title: "Morph Targets" });

    gui
      .add(this.params, "Spherify", 0, 1)
      .step(0.01)
      .onChange((value) => {
        this.mesh.morphTargetInfluences[0] = value;
      });

    gui
      .add(this.params, "x", -100, 100)
      .step(1)
      .onChange((value) => {
        //this.x = value;
        this.mesh.position.x = 239 + value;
      });
    gui
      .add(this.params, "z", -100, 100)
      .step(1)
      .onChange((value) => {
        //this.z = value;
        this.mesh.position.z = -696 + 28 + value;
      });
  };
  addWord = () => {
    const geometry = this.createGeometry().then((geometry) => {
      const material = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        flatShading: true,
      });

      this.mesh = new THREE.Mesh(geometry, material);
      var box = new THREE.Box3().setFromObject(this.mesh);
      var size = new THREE.Vector3();
      box.getSize(size);
      // console.log(size);
      this.scene.add(this.mesh);
      // this.mesh.position.x -= size.x / 2;
      // this.mesh.position.y -= size.y / 2; //высота
      // this.mesh.position.z -= size.z / 2;
      this.mesh.position.y = 2;
    });
  };
  createGeometry = () => {
    var promise = new Promise(function (resolve, reject) {
      let geometry;
      geometry = new THREE.BoxGeometry(2, 2, 2, 32, 32, 32);
      const fontLoader = new FontLoader();
      fontLoader.load(
        // path to the font (included in three)
        "node_modules/three/examples/fonts/droid/droid_serif_regular.typeface.json",
        // called when the font has loaded
        (droidFont) => {
          const settings = {
            size: 1,
            height: 0.2,
            font: droidFont,
          };
          geometry = new TextGeometry("T", settings);

          // create an empty array to hold targets for the attribute we want to morph
          // morphing positions and normals is supported
          geometry.morphAttributes.position = [];

          // the original positions of the cube's vertices
          const positionAttribute = geometry.attributes.position;

          // for the first morph target we'll move the cube's vertices onto the surface of a sphere
          const spherePositions = [];

          // for the second morph target, we'll twist the cubes vertices
          // const twistPositions = [];
          //const direction = new THREE.Vector3(1, 0, 0);
          //const vertex = new THREE.Vector3();
          //console.log(positionAttribute.count);
          // console.log(positionAttribute["array"]);
          let g = [];
          for (let i = 0; i < positionAttribute.count; i++) {
            let x = positionAttribute.getX(i); // - 0.7994570322334766 / 2;
            let y = positionAttribute.getY(i); // - 0.9919999837875366 / 2;
            let z = positionAttribute.getZ(i); // - 0.2000000029802322 / 2;
            x -= 0.7994570322334766 / 2;
            y -= 0.9919999837875366 / 2;
            z -= 0.2000000029802322 / 2;
            g.push(x, y, z);
            spherePositions.push(
              x *
                Math.sqrt(1 - (y * y) / 2 - (z * z) / 2 + (y * y * z * z) / 3),
              y *
                Math.sqrt(1 - (z * z) / 2 - (x * x) / 2 + (z * z * x * x) / 3),
              z * Math.sqrt(1 - (x * x) / 2 - (y * y) / 2 + (x * x * y * y) / 3)
            );
            if (i == 0) {
              console.log([x, y, z]);
              console.log(spherePositions[0]);
            }
          }

          geometry.attributes.position = new THREE.Float32BufferAttribute(g, 3);
          // add the spherical positions as the first morph target
          geometry.morphAttributes.position[0] =
            new THREE.Float32BufferAttribute(spherePositions, 3);

          //return geometry;
          resolve(geometry);
        }
      );
    });
    return promise;
  };
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

      this.stats.begin();
      // monitored code goes here
      this.renderer.render(toRaw(this.scene), this.camera);
      this.stats.end();
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
    const groupsAngle = 180; //360;
    let width = 3;
    let height = (width / 3) * 4;
    let geometry = new THREE.BoxGeometry(width, height, 0.01); // ,в,
    const r = 40; //30;
    //const angle = index  * (groupsAngle / count) * THREE.MathUtils.DEG2RAD;
    const angle = (index + 1) * (groupsAngle / count) * THREE.MathUtils.DEG2RAD;
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
          size: 2,
          height: 0.05,
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

    // let geometryS = new THREE.BoxGeometry(width, width * 4.5, 0.01); // ,в,
    // let material = new THREE.MeshBasicMaterial({
    //   color: 0x185a7e,
    //   vertexColors: THREE.FaceColors,
    // });
    // const mesh = new THREE.Mesh(geometryS, material);
    // mesh.rotation.x = -55 * THREE.MathUtils.DEG2RAD;
    // mesh.position.y = 0; //  высота
    // mesh.position.z = -5.5; //к центру круга
    // group.add(mesh);

    const loaderGltf = new GLTFLoader();
    loaderGltf.load("/models/stairs1.glb", (gltf) => {
      group.add(gltf.scene);
      gltf.scene.position.y = -4.9; //  высота
      gltf.scene.position.z = -4;
      gltf.scene.scale.set(0.4, 0.4, 0.4);
      gltf.scene.rotation.y = 180 * THREE.MathUtils.DEG2RAD;
    });

    this.floor.add(group);
  };

  drawFloor = (category) => {
    this.floor = new THREE.Group();
    let level = this.getLevel(category, theCategories);
    //console.log(level);
    let index = 0;
    const subs = level.subs.filter((item) => item.picture_bar); //.slice(0, 12);
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
    this.floor.position.z = -45 - 10;
    this.scene.add(this.floor);
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
