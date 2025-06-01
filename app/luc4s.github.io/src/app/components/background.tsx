"use client";

import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { Sky } from "three/addons/objects/Sky.js";

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
  const texture = new THREE.DataTexture(data, sideLength, sideLength, 1);
  texture.type = THREE.UnsignedByteType;
  texture.format = THREE.RGBAFormat;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8; // TODO Get that value from renderer
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.generateMipmaps = true;
  texture.repeat.setScalar(size / 2);
  texture.needsUpdate = true;

  return texture;
}
function fillScene(scene: THREE.Scene) {
  {
    // Skybox
    const sky = new Sky();
    sky.scale.setScalar(450000);

    const phi = THREE.MathUtils.degToRad(92);
    const theta = THREE.MathUtils.degToRad(180);
    const sunPosition = new THREE.Vector3().setFromSphericalCoords(
      1,
      phi,
      theta
    );

    sky.material.uniforms.sunPosition.value = sunPosition;
    sky.material.uniforms.rayleigh.value = 16;
    sky.material.uniforms.mieCoefficient.value = 0;
    sky.material.uniforms.mieDirectionalG.value = 0;
    sky.material.uniforms.turbidity.value = 0;
    sky.renderOrder = -2;

    scene.add(sky);
  }

  {
    var size = 64;
    var zPos = -100;

    // Add black bands on top to create glitch effect
    const band = new THREE.PlaneGeometry(2 * size, 2);
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
      color: 0xfbc000,
      depthWrite: false,
      depthTest: true,
      depthFunc: THREE.LessDepth,
    });
    const circle = new THREE.Mesh(geometry, material);
    circle.scale.setScalar(size);
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
  }
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

    fillScene(scene);

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

    const lines = scene.getObjectByName("lines") as THREE.Group;
    const animate = () => {
      if (lines) {
        lines.children.forEach((line) => {
          line.position.z += 0.05;
          if (line.position.z > 0) {
            line.position.z = -100;
          }
        });
      }
    };

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
