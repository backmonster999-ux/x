import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function CameraRig({ section, activeMemory }) {
  const { camera } = useThree();

  // Target positions and look-at targets for each section
  const sectionPositions = [
    [0, 0, 14],      // Section 0: Landing (distant view)
    [0, 0, 7.5],     // Section 1: Intro (zooming in)
    [0, 0, 8.5],     // Section 2: Memory Constellation (balanced view)
    [-1.2, 0.6, 2.6], // Section 3: Unsent Letter (angled focus on floating paper)
    [0, 0, 9.5],     // Section 4: Time Void (wider view of broken clocks)
    [0, 2.5, 7.5],   // Section 5: Final Scene (angled slightly up)
    [0, 22.0, 4.0],  // Section 6: Let Go (ascending straight up)
  ];

  const sectionTargets = [
    [0, 0, 0],       // 0: Landing
    [0, 0, 0],       // 1: Intro
    [0, 0, 0],       // 2: Memories
    [1.4, 0.15, -1.5], // 3: Looking at paper sheet
    [0, 0, 0],       // 4: Looking at center void
    [0, 3.5, -2.0],  // 5: Tilting up towards rising particles
    [0, 25.0, -10.0] // 6: Let Go (looking straight up into the void)
  ];

  const currentPos = useRef(new THREE.Vector3(0, 0, 14));
  const currentTarget = useRef(new THREE.Vector3(0, 0, 0));

  // Initialize camera
  useEffect(() => {
    camera.position.set(0, 0, 14);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const isMobile = window.innerWidth < 768;

    // 1. Calculate Base Position & Target depending on section & memory selections
    let basePos = [...sectionPositions[section]];
    let baseTarget = [...sectionTargets[section]];

    // Mobile adjustments (back camera off for narrower aspect ratio)
    if (isMobile) {
      basePos[2] += 2.0; // push camera back
    }

    if (section === 2 && activeMemory) {
      // Zoom into the selected memory orb
      basePos = [
        activeMemory.coords[0],
        activeMemory.coords[1],
        activeMemory.coords[2] + (isMobile ? 2.5 : 1.8),
      ];
      baseTarget = [...activeMemory.coords];
    }

    // Special animation for Section 5 & 6: Slow automated rise
    if (section === 5) {
      basePos[1] += Math.sin(time * 0.1) * 0.4; // slight float
    }

    // 2. Add Mouse Parallax (disable in final ascend)
    const parallaxSpeed = section >= 5 ? 0.0 : isMobile ? 0.3 : 0.8;
    const targetX = basePos[0] + state.pointer.x * parallaxSpeed;
    const targetY = basePos[1] + state.pointer.y * parallaxSpeed;
    const targetZ = basePos[2];

    const targetPosVec = new THREE.Vector3(targetX, targetY, targetZ);
    const targetLookVec = new THREE.Vector3(...baseTarget);

    // 3. Smooth Lerp
    // Use faster transition speed for memory clicks, slower for scene changes
    const lerpSpeed = section === 6 ? 0.6 : (section === 2 && activeMemory) ? 3.0 : 1.5;
    
    currentPos.current.lerp(targetPosVec, delta * lerpSpeed);
    currentTarget.current.lerp(targetLookVec, delta * lerpSpeed);

    // 4. Apply to Camera
    camera.position.copy(currentPos.current);
    camera.lookAt(currentTarget.current);
  });

  return null;
}
