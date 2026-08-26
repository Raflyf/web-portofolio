/**
 * ============================================================================
 * HORIZONX 3D SCROLL-MORPHING GEOMETRY ENGINE (Three.js WebGL)
 * Aesthetic: Cyber Titanium & Electric Indigo / Aurora Cyan 3D Spatial Universe
 * Features:
 *  - Iconic 3D Parametric Torus Knot + Orbital Polyhedron Geometries
 *  - Calibrated Multi-Viewport Scale (Expansive on Desktop/Laptop & Mobile)
 *  - Rich Dual-Material Shading: Volumetric Shaded Body + Cyber Specular Wireframe
 *  - 6-Stage Spatial PowerPoint-Morph Transitions synchronized with Scroll
 *  - Interactive 3D Parallax with Smooth Damping Spring Physics
 *  - Dark / Light Theme Real-Time Adaptation
 *  - Throttled when Tab Hidden for 60fps Stability
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

    // 1. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 2. Camera Setup (Wide Field of View for expansive desktop visibility)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth, window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 36);

    // 3. Theme Colors
    const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
    let colorPrimary = isLightMode ? 0x4f46e5 : 0x6366f1; // Electric Indigo
    let colorSecondary = isLightMode ? 0x0284c7 : 0x38bdf8; // Aurora Cyan
    let colorHighlight = isLightMode ? 0x7c3aed : 0x818cf8; // Hyper Violet

    // 4. Studio Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, isLightMode ? 0.9 : 0.6);
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(colorPrimary, isLightMode ? 3.5 : 5.0, 90);
    light1.position.set(24, 18, 25);
    scene.add(light1);

    const light2 = new THREE.PointLight(colorSecondary, isLightMode ? 3.0 : 4.5, 90);
    light2.position.set(-24, -18, 20);
    scene.add(light2);

    const light3 = new THREE.PointLight(colorHighlight, isLightMode ? 2.0 : 3.0, 70);
    light3.position.set(0, 25, 10);
    scene.add(light3);

    // 5. Main 3D Torus Knot Geometry Group (Shaded Solid Core + Glowing Specular Structure)
    const geometryGroup = new THREE.Group();
    scene.add(geometryGroup);

    // Calibrated Desktop Geometry Size
    const knotGeometry = new THREE.TorusKnotGeometry(8.5, 2.4, 160, 32, 2, 3);

    // Solid Volumetric Core Material (Gives actual 3D body and lighting so it never looks like a hollow glitch line)
    const solidMaterial = new THREE.MeshStandardMaterial({
      color: colorPrimary,
      roughness: 0.25,
      metalness: 0.85,
      transparent: true,
      opacity: isLightMode ? 0.28 : 0.45,
      wireframe: false
    });
    const solidMesh = new THREE.Mesh(knotGeometry, solidMaterial);
    geometryGroup.add(solidMesh);

    // Outer Cyber Contour Lattice (Accents the 3D curves)
    const latticeMaterial = new THREE.MeshStandardMaterial({
      color: colorSecondary,
      wireframe: true,
      transparent: true,
      opacity: isLightMode ? 0.15 : 0.25,
      roughness: 0.1,
      metalness: 0.9
    });
    const latticeMesh = new THREE.Mesh(knotGeometry, latticeMaterial);
    latticeMesh.scale.set(1.03, 1.03, 1.03);
    geometryGroup.add(latticeMesh);

    // 6. Orbital Satellite Geometries (Icosahedron & Octahedrons that float dynamically)
    const orbGroup = new THREE.Group();
    scene.add(orbGroup);

    const icosaGeometry = new THREE.IcosahedronGeometry(5.5, 1);
    const icosaMaterial = new THREE.MeshStandardMaterial({
      color: colorSecondary,
      wireframe: true,
      transparent: true,
      opacity: isLightMode ? 0.2 : 0.35
    });
    const icosaMesh = new THREE.Mesh(icosaGeometry, icosaMaterial);
    icosaMesh.position.set(18, -4, -6);
    orbGroup.add(icosaMesh);

    const octaGeometry = new THREE.OctahedronGeometry(4.0, 0);
    const octaMaterial = new THREE.MeshStandardMaterial({
      color: colorPrimary,
      wireframe: true,
      transparent: true,
      opacity: isLightMode ? 0.2 : 0.35
    });
    const octaMesh = new THREE.Mesh(octaGeometry, octaMaterial);
    octaMesh.position.set(-18, 6, -8);
    orbGroup.add(octaMesh);

    // 7. 3D Particle Constellation (Uniformly distributed across 3D space)
    const particleCount = prefersReducedMotion ? 250 : 700;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 110;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 90;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: colorSecondary,
      size: isLightMode ? 0.38 : 0.48,
      transparent: true,
      opacity: isLightMode ? 0.35 : 0.65,
      blending: THREE.AdditiveBlending
    });
    const particleField = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleField);

    // 8. Responsive Sizing & Layout Adjustment
    function updateResponsiveScale() {
      const isMobile = window.innerWidth <= 768;
      const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
      
      if (isMobile) {
        geometryGroup.scale.set(0.72, 0.72, 0.72);
        geometryGroup.position.set(0, 2, -4);
        orbGroup.visible = false;
      } else if (isTablet) {
        geometryGroup.scale.set(0.95, 0.95, 0.95);
        geometryGroup.position.set(0, 0, -5);
        orbGroup.visible = true;
        icosaMesh.position.set(14, -4, -6);
        octaMesh.position.set(-14, 5, -8);
      } else {
        // Desktop / Laptop: Full expansive 3D presence with cinematic depth
        geometryGroup.scale.set(1.2, 1.2, 1.2);
        geometryGroup.position.set(0, 0, -6);
        orbGroup.visible = true;
        icosaMesh.position.set(20, -5, -6);
        octaMesh.position.set(-20, 7, -8);
      }
    }

    // 9. Scroll & Mouse Tracking
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
      updateResponsiveScale();
    }

    document.addEventListener('visibilitychange', () => {
      isTabVisible = !document.hidden;
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    onScroll();
    updateResponsiveScale();

    // 10. Theme Switcher Sync
    const observer = new MutationObserver(() => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      colorPrimary = isLight ? 0x4f46e5 : 0x6366f1;
      colorSecondary = isLight ? 0x0284c7 : 0x38bdf8;
      colorHighlight = isLight ? 0x7c3aed : 0x818cf8;

      solidMaterial.color.setHex(colorPrimary);
      solidMaterial.opacity = isLight ? 0.24 : 0.42;

      latticeMaterial.color.setHex(colorSecondary);
      latticeMaterial.opacity = isLight ? 0.12 : 0.22;

      icosaMaterial.color.setHex(colorSecondary);
      octaMaterial.color.setHex(colorPrimary);

      particleMaterial.color.setHex(colorSecondary);
      particleMaterial.opacity = isLight ? 0.30 : 0.60;

      light1.color.setHex(colorPrimary);
      light2.color.setHex(colorSecondary);
      light3.color.setHex(colorHighlight);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // 11. Animation Loop with Dynamic 3D PPT-Morph Spatial Transitions
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      if (!isTabVisible) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth interpolation for scroll & cursor parallax
      scrollProgress += (targetScrollProgress - scrollProgress) * 0.08;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // 3D PowerPoint Morph Transformations mapped to scroll:
      const morphFactor = scrollProgress * Math.PI * 2;
      const currentScale = (window.innerWidth <= 768 ? 0.72 : 1.2) * (1.0 + Math.sin(morphFactor) * 0.25);

      // Primary Geometry Morph Rotations & Spatial Gliding
      geometryGroup.rotation.x = time * 0.22 + scrollProgress * 4.8 + mouseY * 0.35;
      geometryGroup.rotation.y = time * 0.30 + scrollProgress * 6.2 + mouseX * 0.35;
      geometryGroup.rotation.z = Math.sin(time * 0.2 + scrollProgress * 3.0) * 0.4;

      geometryGroup.position.x = Math.sin(scrollProgress * Math.PI * 2) * 12 + mouseX * 2.0;
      geometryGroup.position.y = - (scrollProgress - 0.5) * 18 - mouseY * 2.0;
      geometryGroup.position.z = -6 + Math.sin(scrollProgress * Math.PI * 3) * 8;
      geometryGroup.scale.set(currentScale, currentScale, currentScale);

      // Orbiting Satellites Counter-Morphing
      orbGroup.rotation.y = -time * 0.25 - scrollProgress * 3.5;
      orbGroup.rotation.x = time * 0.15 + scrollProgress * 2.0;

      icosaMesh.rotation.x = time * 0.4;
      icosaMesh.rotation.y = time * 0.5;

      octaMesh.rotation.y = -time * 0.35;
      octaMesh.rotation.z = time * 0.45;

      // Dynamic Particle Field Flow
      particleField.rotation.y = time * 0.04 + scrollProgress * 1.5;
      particleField.rotation.x = scrollProgress * 0.8;
      particleField.position.y = -scrollProgress * 12;

      // Orbital Point Lights
      light1.position.x = Math.sin(time * 0.7) * 26;
      light1.position.y = Math.cos(time * 0.5) * 22;
      light2.position.x = -Math.sin(time * 0.6) * 26;
      light2.position.y = -Math.cos(time * 0.4) * 22;

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
