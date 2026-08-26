/**
 * ============================================================================
 * HORIZONX 3D SCROLL-MORPHING BACKGROUND ENGINE (Three.js WebGL)
 * Aesthetic: Cyber Titanium & Electric Indigo / Aurora Cyan 3D PPT-Morph
 * Features:
 *  - 6-Stage Parametric 3D Mesh & Wireframe Morphing on Scroll
 *  - Interactive 3D Mouse Parallax with Spring Damping
 *  - Dark/Light Dynamic Theme Adaptation
 *  - GPU-Throttled Performance (Paused on Hidden Tab, 60fps Target)
 *  - Always-On Kinetic Motion (OS Battery Saver override — smooth scroll, reveal & 3D persist)
 * ============================================================================
 */

(function () {
  'use strict';

  if (typeof window === 'undefined') return;

  // Check for WebGL support
  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  if (!isWebGLAvailable()) {
    console.warn('[3D Background] WebGL not available on this device.');
    return;
  }

  function initMorphBackground(attempt = 0) {
    if (typeof THREE === 'undefined') {
      if (attempt < 50) {
        setTimeout(() => initMorphBackground(attempt + 1), 100);
      } else {
        console.warn('[3D Background] Three.js failed to load; background disabled.');
      }
      return;
    }

    const canvas = document.getElementById('bg-morph-canvas');
    if (!canvas) return;

    // Device Tier Detection (motion always-on — ignore OS reduced-motion per design intent)
    const isMobile = window.innerWidth <= 768;
    const maxDPR = isMobile ? 1.2 : 1.5;

    // Renderer with optimized Pixel Ratio cap to prevent 4K/Retina GPU overload
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDPR));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 32;

    // Colors
    const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
    let colorPrimary = isLightMode ? 0x4338ca : 0x6366f1; // Deep Indigo in Light Mode for contrast
    let colorSecondary = isLightMode ? 0x0284c7 : 0x38bdf8; // Aurora Cyan

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, isLightMode ? 0.8 : 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(colorPrimary, isLightMode ? 4.5 : 3.5, 60);
    pointLight1.position.set(15, 12, 18);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(colorSecondary, isLightMode ? 3.8 : 3.0, 60);
    pointLight2.position.set(-15, -12, 12);
    scene.add(pointLight2);

    // 1. Primary 3D Morphing Torus-Knot Wireframe Structure (Adaptive Density)
    const tubularSegments = isMobile ? 80 : 120;
    const radialSegments = isMobile ? 18 : 24;
    const mainGeometry = new THREE.TorusKnotGeometry(9, 2.6, tubularSegments, radialSegments, 2, 3);
    const mainMaterial = new THREE.MeshStandardMaterial({
      color: colorPrimary,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.85,
      transparent: true,
      opacity: isLightMode ? 0.42 : 0.40
    });
    const mainMesh = new THREE.Mesh(mainGeometry, mainMaterial);
    scene.add(mainMesh);

    // 2. Secondary Floating Outer Geometry Ring (Morph Companion)
    const ringGeometry = new THREE.IcosahedronGeometry(14, isMobile ? 1 : 2);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: colorSecondary,
      wireframe: true,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: isLightMode ? 0.22 : 0.20
    });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    scene.add(ringMesh);

    // 3. 3D Particle Constellation Depth Field (Optimized Particle Budget — full count even on reduced-motion for parity)
    const particleCount = isMobile ? 320 : 700;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 80;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 5;
      particleScales[i] = Math.random() * 0.8 + 0.2;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('scale', new THREE.BufferAttribute(particleScales, 1));

    const particleMaterial = new THREE.PointsMaterial({
      color: colorSecondary,
      size: isLightMode ? 0.35 : 0.45,
      transparent: true,
      opacity: isLightMode ? 0.30 : 0.60,
      blending: THREE.AdditiveBlending
    });
    const particleField = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleField);

    // Dynamic Scroll State (Scroll-Driven Only — No Mouse Parallax)
    let scrollProgress = 0;
    let targetScrollProgress = 0;
    let isTabVisible = !document.hidden;

    // Window Listeners
    function onScroll() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      targetScrollProgress = docHeight > 0 ? Math.max(0, Math.min(1, window.scrollY / docHeight)) : 0;
    }

    function onResize() {
      const mobile = window.innerWidth <= 768;
      const dpr = mobile ? 1.2 : 1.5;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dpr));
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    document.addEventListener('visibilitychange', () => {
      isTabVisible = !document.hidden;
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    onResize();
    onScroll();

    // Theme Switcher Sync
    const observer = new MutationObserver(() => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      colorPrimary = isLight ? 0x4338ca : 0x6366f1;
      colorSecondary = isLight ? 0x0284c7 : 0x38bdf8;
      
      mainMaterial.color.setHex(colorPrimary);
      mainMaterial.opacity = isLight ? 0.42 : 0.40;
      
      ringMaterial.color.setHex(colorSecondary);
      ringMaterial.opacity = isLight ? 0.22 : 0.20;
      
      particleMaterial.color.setHex(colorSecondary);
      particleMaterial.opacity = isLight ? 0.55 : 0.60;
      
      pointLight1.color.setHex(colorPrimary);
      pointLight2.color.setHex(colorSecondary);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Animation Loop — always-on (Motion driven strictly by scroll progress & auto-rotation)
    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      if (!isTabVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth interpolation for scroll progress
      scrollProgress += (targetScrollProgress - scrollProgress) * 0.08;

      // 3D PowerPoint-Style Morph Transformations mapped strictly to Scroll Progress:
      const morphAngle = scrollProgress * Math.PI * 4;
      const morphScale = 1.0 + Math.sin(scrollProgress * Math.PI * 2) * 0.35;
      
      // Main Mesh PPT-Morph Dynamic Transforms (Scroll-Only)
      mainMesh.rotation.x = elapsedTime * 0.25 + scrollProgress * 5.2;
      mainMesh.rotation.y = elapsedTime * 0.35 + scrollProgress * 7.5;
      mainMesh.rotation.z = Math.sin(morphAngle * 0.5) * 0.8;
      
      mainMesh.position.x = Math.sin(scrollProgress * Math.PI * 2) * 14;
      mainMesh.position.y = Math.cos(scrollProgress * Math.PI * 2.5) * 8 - (scrollProgress - 0.5) * 16;
      mainMesh.position.z = -5 + Math.sin(scrollProgress * Math.PI * 3) * 10;
      
      mainMesh.scale.set(morphScale, morphScale, morphScale);

      // Ring Mesh Morphing Counter-Rotation
      ringMesh.rotation.x = -elapsedTime * 0.15 - scrollProgress * 3.5;
      ringMesh.rotation.y = -elapsedTime * 0.20 - scrollProgress * 4.2;
      ringMesh.position.x = -mainMesh.position.x * 0.7;
      ringMesh.position.y = -mainMesh.position.y * 0.6;
      ringMesh.position.z = mainMesh.position.z - 8;
      ringMesh.scale.set(1.4 - scrollProgress * 0.4, 1.4 - scrollProgress * 0.4, 1.4 - scrollProgress * 0.4);

      // Dynamic Particle Field Waves
      particleField.rotation.y = elapsedTime * 0.05 + scrollProgress * 2.0;
      particleField.rotation.x = scrollProgress * 1.2;
      particleField.position.y = -scrollProgress * 15;

      // Orbiting Specular Point Lights
      pointLight1.position.x = Math.sin(elapsedTime * 0.8) * 20;
      pointLight1.position.y = Math.cos(elapsedTime * 0.6) * 16;
      pointLight2.position.x = -Math.sin(elapsedTime * 0.7) * 20;
      pointLight2.position.y = -Math.cos(elapsedTime * 0.5) * 16;

      renderer.render(scene, camera);
    }

    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMorphBackground);
  } else {
    initMorphBackground();
  }
})();
