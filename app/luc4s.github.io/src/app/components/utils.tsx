import Noise from "noisejs";
import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

function loadCar() {
  const loader = new GLTFLoader();
  const promise = new Promise<GLTF>((resolve, reject) => {
    loader.load(
      "models/testarossa.glb",
      (gltf) => {
        resolve(gltf);
      },
      function () {},
      function (error) {
        reject(error);
      }
    );
  });
  return promise;
}
function createGridTexture(size: number, color: number): THREE.Texture {
  // For tiling, size must be a power of 2
  const sideLength = Math.pow(2, Math.ceil(Math.log2(size)));
  const data = new Uint8Array(sideLength * sideLength * 4);
  for (let i = 0; i < sideLength; i++) {
    for (let j = 0; j < sideLength; j++) {
      const index = (i * sideLength + j) * 4;
      if (i == 0 || j == 0 || i == sideLength - 1 || j == sideLength - 1) {
        data[index] = (color >> 24) & 0xff;
        data[index + 1] = (color >> 16) & 0xff;
        data[index + 2] = (color >> 8) & 0xff;
        data[index + 3] = color & 0xff;
      } else {
        data[index] = 0;
        data[index + 1] = 0;
        data[index + 2] = 0;
        data[index + 3] = 255;
      }
    }
  }

  // Dirty hack to get max anisotropy
  const renderer = new THREE.WebGLRenderer({ antialias: false });

  const texture = new THREE.DataTexture(data, sideLength, sideLength);
  texture.type = THREE.UnsignedByteType;
  texture.format = THREE.RGBAFormat;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.generateMipmaps = true;
  texture.repeat.setScalar(size / 2);
  texture.needsUpdate = true;

  return texture;
}
function generateSunTexture(colorBottom: THREE.Color, colorTop: THREE.Color) {
  const width = 1;
  const height = 256;
  const size = width * height;
  const data = new Uint8Array(size * 4);
  for (let i = 0; i < size; i++) {
    const stride = i * 4;
    const y = i / width;
    const ratio = y / (height - 1);
    const color = colorBottom.clone().lerp(colorTop, ratio);
    data[stride] = color.r * 255;
    data[stride + 1] = color.g * 255;
    data[stride + 2] = color.b * 255;
    data[stride + 3] = ratio * 255; // Use alpha for transparency
  }
  const texture = new THREE.DataTexture(data, width, height);
  texture.type = THREE.UnsignedByteType;
  texture.format = THREE.RGBAFormat;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}
function generateSceneBackground(
  aspectRatio: number,
  colorBottom: THREE.Color,
  colorTop: THREE.Color
) {
  const width = 2048;
  const height = 2048;
  const size = width * height;
  const data = new Uint8Array(size * 4);
  for (let i = 0; i < size; i++) {
    const stride = i * 4;
    const y = i / width;
    const ratio = y / (height - 1);
    const t = Math.pow(ratio, 0.1);

    const color = colorBottom.clone().lerp(colorTop, t);
    data[stride] = color.r * 255;
    data[stride + 1] = color.g * 255;
    data[stride + 2] = color.b * 255;
    data[stride + 3] = t * 255;
  }

  const makeStar = (x: number, y: number) => {
    const i = (y * width + x) * 4;

    // Add random brightness variation to stars
    const brightness = 0.5 + Math.random() * 0.5;
    const intensity = Math.floor(255 * brightness);
    data[i] = intensity;
    data[i + 1] = intensity;
    data[i + 2] = intensity;
    data[i + 3] = 255;
  };

  // Add white dots to create a starry effect
  const minStars = 1000;
  const maxStars = 2000;
  const starCount = Math.floor(Math.random() * maxStars) + minStars;
  for (let i = 0; i < starCount; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    makeStar(x, y);

    // Make some stars larger
    if (Math.random() < 0.1) {
      const size = 1;
      for (let dx = -size; dx <= size; ++dx) {
        for (let dy = -size; dy <= size; ++dy) {
          const nx = x + dx;
          const ny = y + dy;
          const radiusSq = dx * dx + dy * dy;
          if (radiusSq > 1) continue;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            makeStar(nx, ny);
          }
        }
      }
    }
  }

  const texture = new THREE.DataTexture(data, width, height);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  const aspect = 1 / aspectRatio;

  texture.offset.x = aspect > 1 ? (1 - 1 / aspect) / 2 : 0;
  texture.repeat.x = aspect > 1 ? 1 / aspect : 1;

  texture.offset.y = aspect > 1 ? 0 : (1 - aspect) / 2;
  texture.repeat.y = aspect > 1 ? 1 : aspect;

  texture.needsUpdate = true;
  return texture;
}
function generateMountains() {
  //@ts-expect-error: Noise exported weirdly
  const noise = new Noise.Noise(Math.random());

  const size = 256;
  const aspect = 4;
  const segmentCount = 50;
  const maxHeight = 24;
  const smoothing = 24;
  const borderSize = 32;

  const mountainGeometry = new THREE.PlaneGeometry(
    size,
    size / aspect,
    segmentCount,
    segmentCount / aspect
  );

  // Generate mountain heights using Perlin noise
  const vertices = mountainGeometry.attributes.position.array;
  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const y = vertices[i + 1];
    let height =
      maxHeight * 0.5 * (1 + noise.simplex2(x / smoothing, y / smoothing));

    // Fade out height near borders
    const distanceFromBorder = Math.min(
      Math.abs(x + size / 2),
      Math.abs(x - size / 2),
      Math.abs(y + size / (2 * aspect)),
      Math.abs(y - size / (2 * aspect))
    );
    const fadeRatio = Math.min(distanceFromBorder / borderSize, 1);
    height *= fadeRatio;

    vertices[i + 2] = height;
  }
  mountainGeometry.attributes.position.needsUpdate = true;
  mountainGeometry.computeVertexNormals();

  const mountainMaterial = new THREE.MeshBasicMaterial({
    color: 0x0,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  const mountainMesh = new THREE.Mesh(mountainGeometry, mountainMaterial);

  // Add wireframe
  const wireframe = new THREE.WireframeGeometry(mountainGeometry);
  const lines = new THREE.LineSegments(wireframe);
  (lines.material as THREE.LineBasicMaterial).color.set(0x2574fc);

  const group = new THREE.Group();
  group.add(mountainMesh);
  group.add(lines);
  return group;
}

export function fillBackground(scene: THREE.Scene, aspectRatio: number) {
  const skyColorTop = new THREE.Color(0x000428);
  const skyColorBottom = new THREE.Color(0xff1f5a);
  const skyTexture = generateSceneBackground(
    aspectRatio,
    skyColorBottom,
    skyColorTop
  );
  scene.background = skyTexture;
}

export function fillScene(scene: THREE.Scene) {
  const data = {
    gridTex: null as THREE.Texture | null,
    carMixer: null as THREE.AnimationMixer | null,
    carObject: null as THREE.Object3D | null,
  };
  let promiseResolve: (_data: typeof data) => void;
  const promise = new Promise<typeof data>((resolve) => {
    promiseResolve = resolve;
  });

  {
    const sunSize = 56;
    const zPos = -100;

    // Add bands on top to create glitch effect
    const band = new THREE.PlaneGeometry(2 * sunSize, 2);
    const bandMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      depthTest: true,
      depthWrite: true,
      colorWrite: false,
    });

    const count = 12;
    const space = 6;
    const spaceGrowth = -0.1;
    const offsetY = 45;
    for (let i = 0; i < count; i++) {
      const bandMesh = new THREE.Mesh(band, bandMaterial);
      bandMesh.position.set(
        0,
        offsetY - i * (space + i * spaceGrowth),
        zPos + 1
      );
      bandMesh.renderOrder = -2;
      scene.add(bandMesh);
    }

    // Create a circle to represent the sun
    const geometry = new THREE.CircleGeometry(1.0, 64);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      depthWrite: false,
      depthTest: true,
      depthFunc: THREE.LessDepth,
      transparent: true,
      map: generateSunTexture(
        new THREE.Color(0xff1f5a),
        new THREE.Color(0xffa500)
      ),
    });
    const circle = new THREE.Mesh(geometry, material);
    circle.scale.setScalar(sunSize);
    circle.position.set(0, 32, zPos - 1);
    circle.renderOrder = -1;

    scene.add(circle);
  }

  {
    const planeY = 0;
    const planeSize = 256;

    // Generate plane grid
    const gridTexture = createGridTexture(256, 0xff00ffff);
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: gridTexture,
      roughness: 0.5,
      metalness: 0.6,
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.scale.set(planeSize, planeSize, 1);
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(0, planeY, 0);
    plane.renderOrder = 0;
    scene.add(plane);

    data["gridTex"] = gridTexture;
  }

  {
    const mountainsDist = -75;
    const mountainsObj = generateMountains();
    mountainsObj.position.set(0, 0.1, mountainsDist);
    mountainsObj.rotation.x = -Math.PI / 2;
    mountainsObj.renderOrder = 1;
    scene.add(mountainsObj);
  }

  {
    loadCar()
      .then((gltf) => {
        const carObject = gltf.scene;
        carObject.scale.setScalar(1.5);
        carObject.position.set(10, 0, -10);
        carObject.rotation.y = Math.PI;
        scene.add(carObject);

        // Animations
        const mixer = new THREE.AnimationMixer(carObject);
        gltf.animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          action.timeScale = 8;
          action.play();
        });

        data["carObject"] = carObject;
        data["carMixer"] = mixer;
        promiseResolve(data);
      })
      .catch((error) => {
        console.error("Error loading car model:", error);
      });
  }

  // Add some light
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  return promise;
}
