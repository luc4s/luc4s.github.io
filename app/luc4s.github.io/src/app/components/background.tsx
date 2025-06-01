"use client";

import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";

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

  const texture = new THREE.DataTexture(data, sideLength, sideLength, 1);
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
  // Generate gradient textures for the skybox sides
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
            const nIndex = (ny * width + nx) * 4;
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

function fillBackground(scene: THREE.Scene, aspectRatio: number) {
  const skyColorTop = new THREE.Color(0x000428);
  const skyColorBottom = new THREE.Color(0xff1f5a);
  const skyTexture = generateSceneBackground(
    aspectRatio,
    skyColorBottom,
    skyColorTop
  );
  scene.background = skyTexture;
}

function fillScene(scene: THREE.Scene) {
  const data = {
    gridTex: null,
  };

  {
    var sunSize = 56;
    var zPos = -100;

    // Add bands on top to create glitch effect
    const band = new THREE.PlaneGeometry(2 * sunSize, 2);
    const bandMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      depthTest: true,
      depthWrite: true,
      colorWrite: false,
    });

    var count = 12;
    var space = 6;
    var spaceGrowth = -0.1;
    var offsetY = 45;
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
    var planeY = 0;
    var planeSize = 256;

    // Generate plane grid
    const gridTexture = createGridTexture(256, 0xff00ffff);
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: gridTexture,
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.scale.set(planeSize, planeSize, 1);
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(0, planeY, 0);
    scene.add(plane);

    data["gridTex"] = gridTexture;
  }

  return data;
}

export default function Background() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      90,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.y = 5;
    camera.position.z = 1;

    fillBackground(scene, camera.aspect);
    const sceneData = fillScene(scene);

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const renderScene = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = 0;
    bloomPass.strength = 0.5;
    bloomPass.radius = 0.5;

    const outputPass = new OutputPass();

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);

    const gridTex = sceneData.gridTex as THREE.Texture | null;
    let animate = () => {};
    if (gridTex) {
      animate = () => {
        // gridTex.offset.x += 0.005;
        gridTex.offset.y += 0.005;
        gridTex.needsUpdate = true;
      };
    }

    // Animation loop
    renderer.setAnimationLoop(() => {
      animate();
      composer.render();
    });

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);

      fillBackground(scene, camera.aspect);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="background_three"></div>;
}
