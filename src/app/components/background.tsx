"use client";

import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";

import { fillBackground, fillScene } from "./utils";

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
    bloomPass.threshold = 0.01;
    bloomPass.strength = 0.5;
    bloomPass.radius = 0.2;

    const outputPass = new OutputPass();

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);

    let gridTex: THREE.Texture | null = null;
    let carMixer: THREE.AnimationMixer | null = null;
    let carObject: THREE.Object3D | null = null;
    fillBackground(scene, camera.aspect);
    fillScene(scene).then((data) => {
      gridTex = data.gridTex;
      carMixer = data.carMixer;
      carObject = data.carObject;
    });

    const clock = new THREE.Clock();
    const carSpeed = new THREE.Vector3(0, 0, 0);
    const gridSpeed = 6;

    // Animation loop
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      if (gridTex) {
        gridTex.offset.y += delta * gridSpeed;
        gridTex.needsUpdate = true;
      }

      if (carMixer) {
        carMixer.update(delta);
      }

      if (carObject) {
        carObject.position.add(carSpeed.clone().multiplyScalar(delta));
      }

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

    // Add controls for the car
    const speed = 8;
    window.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "ArrowLeft":
        case "a":
          carSpeed.x = -speed;
          break;
        case "ArrowRight":
        case "d":
          carSpeed.x = speed;
          break;
      }
      return true;
    });
    window.addEventListener("keyup", (event) => {
      switch (event.key) {
        case "ArrowLeft":
        case "ArrowRight":
        case "a":
        case "d":
          carSpeed.set(0, 0, 0);
          break;
      }
      return true;
    });

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="background_three"></div>;
}
