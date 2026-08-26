/**
 * ============================================================================
 * HORIZONX 3D SCROLL-MORPHING BACKGROUND ENGINE (Three.js WebGL)
 * Aesthetic: Cyber Titanium, Electric Indigo & Aurora Cyan 3D Fluid Morph
 * Features:
 *  - Organic 3D Fluid Wave Ribbon & Smooth Parametric Surface (Zero Wireframe Noise)
 *  - Responsive Multi-Resolution Adaptability (Optimized for Laptop & Mobile)
 *  - Dynamic 6-Stage Spatial Morphing synchronized with Scroll Progress
 *  - Interactive 3D Parallax with Smooth Mouse Spring Physics
 *  - Dark & Light Theme Harmonious Color Adaptation
 *  - GPU Efficient (Throttles when Tab Hidden, 60fps Target)
 * ============================================================================
 */

(function () {
  'use strict';

  if (typeof window === 'undefined') return;

  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  if (!isWebGLAvailable()) return;

  function initMorphBackground() {
    if (typeof THREE === 'undefined') {
      setTimeout(initMorphBackground, 100);
      return;
    }

    const canvas = document.getElementById('bg-morph-canvas');
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 2. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth, window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 30);

    // 3. Theme Colors
    const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
    let colorIndigo = isLightMode ? 0x4f46e5 : 0x6366f1;
    let colorCyan = isLightMode ? 0x0284c7 : 0x38bdf8;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, isLightMode ? 0.8 : 0.5);
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(colorIndigo, isLightMode ? 3.0 : 4.5, 80);
    light1.position.set(20, 15, 20);
    scene.add(light1);

    const light2 = new THREE.PointLight(colorCyan, isLightMode ? 2.5 : 4.0, 80);
    light2.position.set(-20, -15, 15);
    scene.add(light2);

    // 5. Smooth 3D Fluid Parametric Wave Mesh (No harsh wireframes)
    // Large wide plane positioned elegantly in background depth
    const gridX = 48;
    const gridY = 36;
    const waveGeometry = new THREE.PlaneGeometry(80, 50, gridX, gridY);
    
    // Store base positions for dynamic wave morphing
    const posAttribute = waveGeometry.attributes.position;
    const basePositions = new Float32Array(posAttribute.array);

    const waveMaterial = new THREE.MeshStandardMaterial({
      color: colorIndigo,
      roughness: 0.35,
      metalness: 0.8,
      transparent: true,
      opacity: isLightMode ? 0.18 : 0.32,
      side: THREE.DoubleSide,
      flatShading: false
    });

    const waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
    waveMesh.rotation.x = -Math.PI * 0.28;
    waveMesh.position.set(0, -6, -8);
    scene.add(waveMesh);

    // 6. Secondary Floating Cosmic Particle Field (Dispersed uniformly across screen)
    const particleCount = prefersReducedMotion ? 200 : 600;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 100;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 5;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: colorCyan,
      size: isLightMode ? 0.4 : 0.55,
      transparent: true,
      opacity: isLightMode ? 0.3 : 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 7. Scroll & Mouse Tracking
    let scrollProgress = 0;
    let targetScrollProgress = 0;
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    let isTabVisible = !document.hidden;

    function onScroll() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      targetScrollProgress = docHeight > 0 ? Math.max(0, Math.min(1, window.scrollY / docHeight)) : 0;
    }

    function onMouseMove(e) {
      if (prefersReducedMotion) return;
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    document.addEventListener('visibilitychange', () => {
      isTabVisible = !document.hidden;
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    onScroll();

    // Theme Switcher Sync
    const observer = new MutationObserver(() => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      colorIndigo = isLight ? 0x4f46e5 : 0x6366f1;
      colorCyan = isLight ? 0x0284c7 : 0x38bdf8;

      waveMaterial.color.setHex(colorIndigo);
      waveMaterial.opacity = isLight ? 0.16 : 0.30;
      
      particleMaterial.color.setHex(colorCyan);
      particleMaterial.opacity = isLight ? 0.28 : 0.55;

      light1.color.setHex(colorIndigo);
      light2.color.setHex(colorCyan);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Animation Loop
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      if (!isTabVisible) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth interpolation
      scrollProgress += (targetScrollProgress - scrollProgress) * 0.08;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Dynamic 3D Wave Morphing on Scroll (PPT-Morph Style Surface Waves)
      const positions = posAttribute.array;
      const waveFreq = 0.12 + scrollProgress * 0.08;
      const waveSpeed = prefersReducedMotion ? 0.2 : 0.9;
      const morphHeight = 3.5 + Math.sin(scrollProgress * Math.PI) * 2.5;

      for (let i = 0; i < positions.length; i += 3) {
        const x = basePositions[i];
        const y = basePositions[i + 1];
        
        // Multi-frequency sinusoidal wave formula
        const zWave = Math.sin(x * waveFreq + time * waveSpeed) * Math.cos(y * waveFreq + time * waveSpeed * 0.8) * morphHeight
                    + Math.sin((x + y) * 0.08 + time * 0.5) * 1.5;
        
        positions[i + 2] = zWave;
      }
      posAttribute.needsUpdate = true;
      waveGeometry.computeVertexNormals();

      // Smooth 3D Mesh Spatial Transforms
      waveMesh.rotation.z = Math.sin(time * 0.15) * 0.05 + (scrollProgress - 0.5) * 0.4 + mouseX * 0.08;
      waveMesh.rotation.x = -Math.PI * 0.28 + (scrollProgress - 0.5) * 0.35 - mouseY * 0.08;
      waveMesh.position.y = -6 - (scrollProgress - 0.5) * 12;
      waveMesh.position.x = mouseX * 2.0;

      // Particle Drift
      particles.rotation.y = time * 0.03 + scrollProgress * 0.5;
      particles.position.y = -scrollProgress * 10;

      // Orbiting Specular Point Lights
      light1.position.x = Math.sin(time * 0.6) * 25;
      light1.position.y = Math.cos(time * 0.4) * 20;
      light2.position.x = -Math.sin(time * 0.5) * 25;
      light2.position.y = -Math.cos(time * 0.3) * 20;

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
