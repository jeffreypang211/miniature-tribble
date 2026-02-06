
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GameState, Telemetry } from '../types';

interface GameSceneProps {
  gameState: GameState;
  onTelemetryUpdate: (data: Telemetry) => void;
  onStateChange: (state: GameState) => void;
}

const GameScene: React.FC<GameSceneProps> = ({ gameState, onTelemetryUpdate, onStateChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    system: THREE.Group;
    targetMarker: THREE.Mesh;
    module: THREE.Mesh;
    keys: { [key: string]: boolean };
    params: {
      angle: number;
      velocity: number;
      targetAngle: number;
      isAligned: boolean;
      isDescending: boolean;
    }
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Init Three.js ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9); // Slate 100
    scene.fog = new THREE.Fog(0xf1f5f9, 20, 100);

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // --- Lights (Brightened for Light Theme) ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    camera.position.set(0, 12, 24);
    camera.lookAt(0, 3, 0);

    // --- Objects ---
    const system = new THREE.Group();
    scene.add(system);

    // Hook (Polished Steel)
    const hookGeo = new THREE.BoxGeometry(3.5, 0.8, 1.8);
    const hookMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
    const hook = new THREE.Mesh(hookGeo, hookMat);
    hook.position.y = 12;
    system.add(hook);

    // Main Cable
    const ropeGeo = new THREE.CylinderGeometry(0.1, 0.1, 6, 8);
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const rope = new THREE.Mesh(ropeGeo, ropeMat);
    rope.position.y = 9;
    system.add(rope);

    // Frame (Industrial Yellow)
    const frameGeo = new THREE.BoxGeometry(12, 0.8, 2.5);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.3, roughness: 0.5 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 6;
    system.add(frame);

    // Counterweight (Product Brown)
    const weightGeo = new THREE.BoxGeometry(2.5, 2.5, 2.5);
    const weightMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
    const weight = new THREE.Mesh(weightGeo, weightMat);
    weight.position.y = 7.8;
    system.add(weight);

    // Decorative ring
    const ringGeo = new THREE.TorusGeometry(1.8, 0.05, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 6.4;
    system.add(ring);

    // Module (Concrete Look)
    const moduleGeo = new THREE.BoxGeometry(9, 4, 5);
    const moduleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8, metalness: 0.1 });
    const module = new THREE.Mesh(moduleGeo, moduleMat);
    module.position.y = 1;
    system.add(module);

    // Module Outlines
    const edges = new THREE.EdgesGeometry(moduleGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.3 });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    module.add(wireframe);

    // Slings
    const slingGeo = new THREE.CylinderGeometry(0.08, 0.08, 5, 8);
    const slingMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const s1 = new THREE.Mesh(slingGeo, slingMat);
    s1.position.set(-4, 3.5, 0);
    system.add(s1);
    const s2 = new THREE.Mesh(slingGeo, slingMat);
    s2.position.set(4, 3.5, 0);
    system.add(s2);

    // Floor Grid (Subtle Gray)
    const gridHelper = new THREE.GridHelper(80, 40, 0xcbd5e1, 0xe2e8f0);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.01;
    scene.add(ground);

    // Target Marker (Semi-transparent Green)
    let targetAngle = Math.random() * Math.PI * 2;
    const targetGeo = new THREE.BoxGeometry(9.1, 0.2, 5.1);
    const targetMat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: false, transparent: true, opacity: 0.2 });
    const targetMarker = new THREE.Mesh(targetGeo, targetMat);
    targetMarker.position.y = -1.98;
    targetMarker.rotation.y = targetAngle;
    scene.add(targetMarker);

    // Target Border
    const targetEdges = new THREE.EdgesGeometry(targetGeo);
    const targetLine = new THREE.LineSegments(targetEdges, new THREE.LineBasicMaterial({ color: 0x10b981 }));
    targetMarker.add(targetLine);

    // Game state tracking
    const params = {
      angle: 0,
      velocity: 0,
      targetAngle: targetAngle,
      isAligned: false,
      isDescending: false
    };

    const keys: { [key: string]: boolean } = {};

    const handleKeyDown = (e: KeyboardEvent) => { 
      // Prevent scrolling when using arrow keys or space in the game
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      keys[e.key] = true; 
    };
    const handleKeyUp = (e: KeyboardEvent) => { 
      keys[e.key] = false; 
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    sceneRef.current = { scene, camera, renderer, system, targetMarker, module, keys, params };

    // --- Animation Loop ---
    const acc = 0.0008;
    const friction = 0.95;
    const maxVel = 0.025;
    const descendSpeed = 0.05;
    const groundY = -2;
    const stopY = groundY + 2 - 0.01;

    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!sceneRef.current) return;

      const { renderer, scene, camera, system, targetMarker, module, keys, params } = sceneRef.current;

      if (!params.isDescending) {
        if (keys['ArrowLeft']) params.velocity -= acc;
        if (keys['ArrowRight']) params.velocity += acc;

        params.velocity *= friction;
        params.velocity = Math.max(-maxVel, Math.min(maxVel, params.velocity));
        params.angle += params.velocity;
        system.rotation.y = params.angle;

        const diff = Math.abs((params.angle % (Math.PI * 2)) - (params.targetAngle % (Math.PI * 2)));
        const normDiff = Math.min(diff, Math.PI * 2 - diff);
        params.isAligned = normDiff < (4 * Math.PI / 180);

        if (params.isAligned) {
          (module.children[0] as THREE.LineSegments).material = new THREE.LineBasicMaterial({ color: 0x10b981, opacity: 1 });
        } else {
          (module.children[0] as THREE.LineSegments).material = new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.3 });
        }

        if (keys[' '] && params.isAligned) {
          params.isDescending = true;
          onStateChange(GameState.DESCENDING);
        }
      } else {
        if (system.position.y > stopY) {
          system.position.y -= descendSpeed;
          params.velocity = 0;
        } else {
          system.position.y = stopY;
          onStateChange(GameState.SUCCESS);
          setTimeout(() => resetGame(), 3000);
          params.isDescending = false;
        }
      }

      onTelemetryUpdate({
        currentAngle: (params.angle * 180 / Math.PI) % 360,
        targetAngle: (params.targetAngle * 180 / Math.PI) % 360,
        velocity: params.velocity * 1000,
        isAligned: params.isAligned,
        status: params.isDescending ? 'DESCENDING' : (params.isAligned ? 'READY' : 'SCANNING...')
      });

      renderer.render(scene, camera);
    };

    const resetGame = () => {
      if (!sceneRef.current) return;
      const { params, system, targetMarker } = sceneRef.current;
      params.angle = 0;
      params.velocity = 0;
      params.isDescending = false;
      params.isAligned = false;
      params.targetAngle = Math.random() * Math.PI * 2;
      
      system.position.y = 0;
      system.rotation.y = 0;
      targetMarker.rotation.y = params.targetAngle;
      
      onStateChange(GameState.ROTATING);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [onTelemetryUpdate, onStateChange]);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
};

export default GameScene;
