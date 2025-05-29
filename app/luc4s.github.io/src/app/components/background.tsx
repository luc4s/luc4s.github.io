"use client";

import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";

function fillScene(scene: THREE.Scene) {
  {
    // Create a circle to represent the sun
    const geometry = new THREE.CircleGeometry(1.0, 64);
    const material = new THREE.MeshBasicMaterial({
      color: 0xfbc000,
      depthTest: false,
      depthWrite: false,
    });
    const circle = new THREE.Mesh(geometry, material);
    var size = 64;
    circle.scale.set(size, size, size);
    circle.position.set(0, 16, -100); // Position the sun above groung
    scene.add(circle);
  }

  {
    // Create a large plane to fill the background
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff4444,
      metalness: 1.0,
      roughness: 0.1,
    });

    var planeY = 0;
    var planeSize = 256;

    const plane = new THREE.Mesh(geometry, material);
    plane.scale.set(planeSize, planeSize, 1);
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(0, planeY, 0);
    scene.add(plane);

    // Generate plane grid
    var gridColor = 0xff00ff;
    const gridHelper = new THREE.GridHelper(
      planeSize,
      40,
      gridColor,
      gridColor
    );
    gridHelper.position.set(0, planeY, 0);
    scene.add(gridHelper);
  }

  {
    // Hemisphere light
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    light.position.set(0, 1, 0);
    scene.add(light);
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
    camera.position.z = 1;
    camera.position.y = 5;

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
    bloomPass.radius = 0.1;

    const outputPass = new OutputPass();

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);

    // Animation loop
    renderer.setAnimationLoop(() => {
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
