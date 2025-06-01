"use client";

import * as THREE from "three";
import React, { useEffect, useRef } from "react";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { Sky } from "three/addons/objects/Sky.js";
import { lchown } from "node:fs";

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
    circle.position.set(0, 32, zPos - 1); // Position the sun above groung
    circle.renderOrder = -1;

    scene.add(circle);
  }

  {
    // Generate plane grid
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

    var gridColor = 0xff00ff;
    var gridStep = 4;

    // Create lines going in the X direction
    const gridGeometryX = new THREE.BufferGeometry();
    const positionsX = [];
    for (let i = -planeSize / 2; i <= planeSize / 2; i += gridStep) {
      positionsX.push(i, planeY, -planeSize / 2);
      positionsX.push(i, planeY, planeSize / 2);
    }
    gridGeometryX.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positionsX, 3)
    );
    const lineMatPrams = { color: gridColor, depthTest: false };
    const gridMaterial = new THREE.LineBasicMaterial(lineMatPrams);
    const gridLinesX = new THREE.LineSegments(gridGeometryX, gridMaterial);
    scene.add(gridLinesX);

    // Create lines going in the Z direction
    const gridGeometryZ = new THREE.BufferGeometry();
    const positionsZ = [];
    positionsZ.push(-planeSize / 2, planeY, 0);
    positionsZ.push(planeSize / 2, planeY, 0);
    gridGeometryZ.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positionsZ, 3)
    );

    const group = new THREE.Group();
    group.name = "lines";
    for (let i = -planeSize / 2; i <= planeSize / 2; i += gridStep) {
      const gridLinesZ = new THREE.LineSegments(gridGeometryZ, gridMaterial);
      gridLinesZ.position.set(0, planeY, i);
      group.add(gridLinesZ);
    }
    scene.add(group);
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
