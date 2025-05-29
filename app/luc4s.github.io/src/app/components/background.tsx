"use client";

import * as THREE from "three";
import React, { useEffect, useRef } from "react";

function fillScene(scene: THREE.Scene) {
  {
    // Create a circle to represent the sun
    const geometry = new THREE.CircleGeometry(1.0, 64);
    const material = new THREE.MeshBasicMaterial({
      color: 0xfbc000, // Light salmon color, similar to sunset
      depthTest: false,
      depthWrite: false,
    });
    const circle = new THREE.Mesh(geometry, material);
    var size = 1;
    circle.scale.set(size, size, size); // Scale down the sun
    circle.position.set(0, 0.5, -1); // Position the sun above the plane
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

    var planeY = -2; // Position the plane slightly below the camera

    const plane = new THREE.Mesh(geometry, material);
    plane.scale.set(100, 100, 1); // Scale the plane to cover the background
    plane.rotation.x = -Math.PI / 2; // Rotate the plane to be horizontal
    plane.position.set(0, planeY, 0); // Position the plane below the camera
    scene.add(plane);

    // Generate plane grid
    var gridColor = 0x00aeff; // Cyan color for the grid
    const gridHelper = new THREE.GridHelper(100, 20, gridColor, gridColor);
    gridHelper.position.set(0, planeY, 0); // Position the grid on the plane
    // gridHelper.rotation.x = -Math.PI / 2; // Rotate the grid to match the plane
    scene.add(gridHelper);
  }

  {
    // Hemisphere light
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    light.position.set(0, 1, 0); // Position the light above the scene
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
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 1;

    fillScene(scene);

    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Animation loop
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
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
