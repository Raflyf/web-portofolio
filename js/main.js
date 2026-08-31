/**
 * ============================================================================
 * RAFLY FIRMANSYAH - MAIN APPLICATION LOGIC (v2.1.0 S1 Informatika & Preview)
 * - Inertia Smooth-Scroll Engine with Cubic Physics & Wheel Damper
 * - Asymmetric Bento & Spotlight Projects Render Architecture
 * - FormSubmit AJAX Real Email Delivery to raflyfirmansyah02@gmail.com
 * - Standalone preview.html PDF Viewer Integration (In-Browser Preview)
 * - 1-Click Email & Credential Copy with Floating Toast Feedback
 * - Verified Native <dialog> Modals with Centered Glassmorphism
 * - WCAG 2.2 AA Accessibility & Security Sanitization
 * ============================================================================
 */

import { DEVELOPER_PROFILE, PROJECTS_DATA, CERTIFICATES_DATA, TIMELINE_DATA } from './data.js?v=10.545.0';
import { initTerminal } from './terminal.js?v=10.545.0';
import { telemetry } from './telemetry.js?v=10.545.0';

document.addEventListener('DOMContentLoaded', () => {
  telemetry.init();
  initThemeToggle();
  initMobileNavigation();
  initHeroClock();
  initHeroShowcaseCarousel();
  initProjectsSection();
  initCertificatesSection();
  initTimelineSection();
  initModals();
  initContactForm();
  initCopyEmailButton();
  initScrollSpy();
  initScrollProgressBar();
  initScrollReveal();
  initSmoothScrollEngine();
  initBackToTopButtons();
  initHorizonXEffects();
  initTerminal();
});

/* ==========================================================================
   1. HERO LIVE TIME TICKER
   ========================================================================== */
function initHeroClock() {
  const clockEl = document.getElementById('hero-clock');
  if (!clockEl) return;

  function updateClock() {
    const now = new Date();
    const options = { timeZone: 'Asia/Jakarta', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const timeStr = new Intl.DateTimeFormat('id-ID', options).format(now);
    clockEl.textContent = `WIB (UTC+7) · ${timeStr}`;
  }

  updateClock();
  let clockTimer = setInterval(updateClock, 1000);

  // Pause the clock when the tab is hidden to reduce background timer churn
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(clockTimer);
      clockTimer = null;
    } else if (!clockTimer) {
      updateClock();
      clockTimer = setInterval(updateClock, 1000);
    }
  });
}

/* ==========================================================================
   1B. DYNAMIC HERO SHOWCASE ROTATING DECK & HORIZONTAL SLIDER ENGINE
   ========================================================================== */
const HERO_SHOWCASE_PROJECTS = [
  {
    id: "open-plagiarism-checker",
    tag: "NLP · Skripsi S1",
    title: "OpenPlagiarismChecker",
    desc: "Mesin riset pemeriksa dokumen akademik lokal berbasis N-Gram Shingling dan Sentence Transformers.",
    spec: "IndoBERT & N-Gram"
  },
  {
    id: "spam-email-classifier",
    tag: "Machine Learning · Riset",
    title: "Spam-Email Detection System",
    desc: "Evaluasi komparatif Complement Naive Bayes (CNB) vs XGBoost dengan mitigasi Concept Drift.",
    spec: "CNB vs XGBoost"
  },
  {
    id: "laser-pointer-ppt",
    tag: "Computer Vision / IoT",
    title: "laser_pointer_PPT",
    desc: "Pengendali presentasi PowerPoint nirsentuh dari smartphone menggunakan sensor gyroscope dan WebSocket.",
    spec: "Gyroscope & WebSockets"
  },
  {
    id: "fotokita-blur",
    tag: "Edge AI / Vision",
    title: "FotoKitaBlur",
    desc: "Deteksi gestur tangan realtime berbasis browser menggunakan MediaPipe Tasks Vision dan OpenCV.",
    spec: "MediaPipe & OpenCV"
  },
  {
    id: "web-portofolio",
    tag: "Frontend & Systems",
    title: "Web Portofolio & AI Platform",
    desc: "Arsitektur antarmuka web modern Vanilla JS/CSS, observabilitas telemetri, dan integrasi AI.",
    spec: "Vanilla Architecture"
  }
];

function initHeroShowcaseCarousel() {
  const deck = document.getElementById('hero-showcase-deck');
  const viewport = document.getElementById('showcase-carousel-viewport');
  const track = document.getElementById('showcase-slider-track');
  const prevBtn = document.getElementById('showcase-prev-btn');
  const nextBtn = document.getElementById('showcase-next-btn');

  if (!deck || !track || !viewport) return;

  const total = HERO_SHOWCASE_PROJECTS.length;
  let currentIndex = 0;
  let autoTimer = null;
  let isTransitioning = false;

  // Build the duplicated sliding cards array (10 cards for infinite seamless sliding)
  const fullCardsList = [...HERO_SHOWCASE_PROJECTS, ...HERO_SHOWCASE_PROJECTS];

  track.innerHTML = '';
  fullCardsList.forEach((proj) => {
    const card = document.createElement('a');
    card.href = '#projects';
    card.className = 'showcase-card';
    card.setAttribute('data-project-id', proj.id);
    card.innerHTML = `
      <span class="showcase-card-tag">${proj.tag}</span>
      <h2 class="showcase-card-title">${proj.title}</h2>
      <p class="showcase-card-desc">${proj.desc}</p>
      <div class="showcase-card-footer">
        <span>${proj.spec}</span>
        <span style="display:inline-flex;align-items:center;gap:4px;">Detail &rarr;</span>
      </div>
    `;

    card.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSec = document.getElementById('projects');
      if (targetSec) {
        const headerOffset = 80;
        const elementPosition = targetSec.getBoundingClientRect().top;
        const offsetPosition = elementPosition + (window.scrollY || window.pageYOffset) - headerOffset;
        smoothScrollTo(offsetPosition, 1050);

        document.querySelectorAll('.nav-link').forEach(link => {
          if (link.getAttribute('href') === '#projects') {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });

    track.appendChild(card);
  });

  function updateCardSizes() {
    const viewportWidth = viewport.clientWidth;
    if (!viewportWidth) return;
    const isMobile = window.innerWidth <= 640;
    const isTablet = window.innerWidth <= 960 && window.innerWidth > 640;
    const visibleCount = isMobile ? 1 : (isTablet ? 2 : 3);
    const gap = 20; // 1.25rem = 20px
    const cardWidth = Math.floor((viewportWidth - (visibleCount - 1) * gap) / visibleCount);

    const cards = track.querySelectorAll('.showcase-card');
    cards.forEach(card => {
      card.style.width = `${cardWidth}px`;
      card.style.flex = `0 0 ${cardWidth}px`;
    });
  }

  function getStepWidth() {
    const firstCard = track.querySelector('.showcase-card');
    if (!firstCard) return 360;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.gap) || 20;
    return firstCard.offsetWidth + gap;
  }

  function updateSlide(animate = true) {
    if (!animate) {
      track.classList.add('no-transition');
    } else {
      track.classList.remove('no-transition');
    }

    const step = getStepWidth();
    track.style.transform = `translate3d(-${currentIndex * step}px, 0, 0)`;

    if (!animate) {
      // Force layout repaint
      track.offsetHeight;
      track.classList.remove('no-transition');
    }
  }

  function nextSlide() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex++;
    updateSlide(true);

    setTimeout(() => {
      if (currentIndex >= total) {
        currentIndex = 0;
        updateSlide(false);
      }
      isTransitioning = false;
    }, 950);
  }

  function prevSlide() {
    if (isTransitioning) return;
    isTransitioning = true;

    if (currentIndex <= 0) {
      currentIndex = total;
      updateSlide(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          currentIndex = total - 1;
          updateSlide(true);
          setTimeout(() => {
            isTransitioning = false;
          }, 950);
        });
      });
    } else {
      currentIndex--;
      updateSlide(true);
      setTimeout(() => {
        isTransitioning = false;
      }, 950);
    }
  }

  function startTimer() {
    stopTimer();
    autoTimer = setInterval(nextSlide, 3000);
  }

  function stopTimer() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  // Pause auto-rotation when the tab is hidden; resume when visible again
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopTimer();
    } else if (!document.hidden) {
      startTimer();
    }
  });

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      nextSlide();
      startTimer();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      prevSlide();
      startTimer();
    });
  }

  deck.addEventListener('mouseenter', stopTimer);
  deck.addEventListener('mouseleave', startTimer);

  let touchStartX = 0;
  deck.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopTimer();
  }, { passive: true });

  deck.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (diff > 45) {
      prevSlide();
    } else if (diff < -45) {
      nextSlide();
    }
    startTimer();
  }, { passive: true });

  window.addEventListener('resize', () => {
    updateCardSizes();
    updateSlide(false);
  }, { passive: true });

  updateCardSizes();
  updateSlide(false);
  startTimer();
}

/* ==========================================================================
   2. CUSTOM CUBIC SMOOTH-SCROLL ENGINE
   ========================================================================== */
function smoothScrollTo(targetY, duration = 1100) {
  const startY = window.scrollY || window.pageYOffset;
  const distance = targetY - startY;
  
  if (Math.abs(distance) < 2) return;

  let startTime = null;

  function easeInOutCubic(t) {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function animationLoop(currentTime) {
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);

    window.scrollTo(0, startY + (distance * easedProgress));

    if (progress < 1) {
      window.requestAnimationFrame(animationLoop);
    }
  }

  window.requestAnimationFrame(animationLoop);
}

function initSmoothScrollEngine() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') {
        e.preventDefault();
        smoothScrollTo(0, 1050);
        return;
      }

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        smoothScrollTo(offsetPosition, 1050);

        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        if (this.classList.contains('nav-link')) {
          this.classList.add('active');
        }

        targetEl.setAttribute('tabindex', '-1');
        targetEl.focus({ preventScroll: true });
      }
    });
  });
}

function initBackToTopButtons() {
  const footerBtn = document.getElementById('back-to-top');
  const floatingBtn = document.getElementById('floating-back-to-top');

  const handleScrollToTop = (e) => {
    e.preventDefault();
    smoothScrollTo(0, 1150); // Calibrated gentle and smooth back to top
  };

  if (footerBtn) {
    footerBtn.addEventListener('click', handleScrollToTop);
  }

  if (floatingBtn) {
    floatingBtn.addEventListener('click', handleScrollToTop);

    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY || window.pageYOffset;
      if (currentScroll > 350) {
        floatingBtn.classList.add('is-visible');
      } else {
        floatingBtn.classList.remove('is-visible');
      }
    }, { passive: true });
  }
}

/* ==========================================================================
   3. MOMENTUM INERTIA SMOOTH WHEEL ENGINE (Fluid 60-120fps physics)
   ========================================================================== */

/* ==========================================================================
   4. THEME TOGGLER
   ========================================================================== */
function initThemeToggle() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (!themeBtn) return;

  const savedTheme = localStorage.getItem('portfolio-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  applyTheme(initialTheme);

  themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem('portfolio-theme', nextTheme);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.setAttribute('aria-label', `Ganti ke mode ${theme === 'dark' ? 'terang' : 'gelap'}`);
  }
}

/* ==========================================================================
   5. MOBILE NAVIGATION
   ========================================================================== */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('is-open') && !navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
      navMenu.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ==========================================================================
   6. PROJECTS SHOWCASE (Unified Dynamic Grid with Fluid Cascade Transitions)
   ========================================================================== */
function initProjectsSection() {
  const gridEl = document.getElementById('projects-grid');
  const filterTabs = document.querySelectorAll('[data-filter-project]');
  const spotlightDetailBtn = document.getElementById('btn-spotlight-detail');

  if (spotlightDetailBtn) {
    spotlightDetailBtn.addEventListener('click', () => {
      openProjectModal(PROJECTS_DATA[0]);
    });
  }

  if (!gridEl) return;

  renderProjects('all');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('active')) return;
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const category = tab.getAttribute('data-filter-project');
      
      const gridEl = document.getElementById('projects-grid');
      if (gridEl) gridEl.classList.add('is-tab-fading-out');

      setTimeout(() => {
        renderProjects(category);
        if (gridEl) gridEl.classList.remove('is-tab-fading-out');
      }, 140);
    });
  });
}

function renderProjects(category) {
  const gridEl = document.getElementById('projects-grid');
  const spotlightCard = document.getElementById('spotlight-project-card');
  if (!gridEl) return;

  gridEl.innerHTML = '';

  // Permanently hide the oversized spotlight card so all projects render uniformly in grid
  if (spotlightCard) {
    spotlightCard.classList.remove('is-revealed');
    spotlightCard.classList.add('is-hidden');
    spotlightCard.style.display = 'none';
  }

  // Render ALL projects (including OpenPlagiarismChecker) in the clean uniform multi-column grid
  const projectsToRender = category === 'all'
    ? PROJECTS_DATA
    : PROJECTS_DATA.filter(p => p.category === category);

  if (projectsToRender.length === 0) {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'empty-state reveal-item is-revealed';
    emptyEl.textContent = 'Belum ada proyek dalam kategori ini.';
    gridEl.appendChild(emptyEl);
    return;
  }

  projectsToRender.forEach((project) => {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.setAttribute('tabindex', '0');

    const topWrap = document.createElement('div');
    topWrap.className = 'project-card__top';

    const tagBadge = document.createElement('span');
    tagBadge.className = 'section-tag';
    tagBadge.textContent = project.categoryLabel;

    topWrap.appendChild(tagBadge);

    if (project.githubUrl) {
      const ghLink = document.createElement('a');
      ghLink.href = project.githubUrl;
      ghLink.target = '_blank';
      ghLink.rel = 'noopener noreferrer';
      ghLink.className = 'icon-link';
      ghLink.setAttribute('aria-label', `Lihat repository GitHub untuk ${project.title}`);
      ghLink.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`;
      topWrap.appendChild(ghLink);
    }

    const title = document.createElement('h3');
    title.className = 'project-card__title';
    title.textContent = project.title;

    const desc = document.createElement('p');
    desc.className = 'project-card__desc';
    desc.textContent = project.description;

    const tagsWrap = document.createElement('div');
    tagsWrap.className = 'tech-pills-wrap';
    project.techStack.forEach(t => {
      const tag = document.createElement('span');
      tag.className = 'tech-pill';
      tag.textContent = t;
      tagsWrap.appendChild(tag);
    });

    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'project-card__actions';

    const detailBtn = document.createElement('button');
    detailBtn.className = 'btn-project-detail';
    detailBtn.textContent = 'Detail & Arsitektur';
    detailBtn.addEventListener('click', () => openProjectModal(project));
    actionsWrap.appendChild(detailBtn);

    card.appendChild(topWrap);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(tagsWrap);
    card.appendChild(actionsWrap);

    gridEl.appendChild(card);
    observeElementForScrollReveal(card);
  });
}


/* ==========================================================================
   7. MODULAR CERTIFICATES SECTION (Preview in Browser Tab)
   ========================================================================== */
function initCertificatesSection() {
  const gridEl = document.getElementById('certificates-grid');
  const filterTabs = document.querySelectorAll('[data-filter-cert]');

  if (!gridEl) return;

  renderCertificates('all');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('active')) return;
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const category = tab.getAttribute('data-filter-cert');
      
      const gridEl = document.getElementById('certificates-grid');
      if (gridEl) gridEl.classList.add('is-tab-fading-out');

      setTimeout(() => {
        renderCertificates(category);
        if (gridEl) gridEl.classList.remove('is-tab-fading-out');
      }, 140);
    });
  });
}

function renderCertificates(category) {
  const gridEl = document.getElementById('certificates-grid');
  if (!gridEl) return;

  gridEl.innerHTML = '';

  const filtered = category === 'all'
    ? CERTIFICATES_DATA
    : CERTIFICATES_DATA.filter(c => c.category === category || (category === 'security' && c.category === 'network') || (category === 'network' && c.category === 'security'));

  filtered.forEach((cert) => {
    const card = document.createElement('article');
    card.className = 'certificate-card';

    const topWrap = document.createElement('div');
    topWrap.className = 'cert-card__top';

    const issuerBadge = document.createElement('div');
    issuerBadge.className = 'cert-issuer-badge';
    issuerBadge.textContent = cert.issuer.slice(0, 3).toUpperCase();

    const infoWrap = document.createElement('div');
    infoWrap.className = 'cert-card__info';

    const title = document.createElement('h3');
    title.className = 'cert-card__title';
    title.textContent = cert.title;

    const issuer = document.createElement('div');
    issuer.className = 'cert-card__issuer';
    issuer.textContent = cert.issuer;

    infoWrap.appendChild(title);
    infoWrap.appendChild(issuer);

    topWrap.appendChild(issuerBadge);
    topWrap.appendChild(infoWrap);

    const metaWrap = document.createElement('div');
    metaWrap.className = 'cert-card__meta';

    const dateSpan = document.createElement('span');
    dateSpan.textContent = `Tahun: ${cert.date}`;

    const idButton = document.createElement('button');
    idButton.className = 'btn-copy';
    idButton.title = 'Salin Nomor Kredensial';
    idButton.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> <span>ID: ${cert.credentialId}</span>`;
    idButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(cert.credentialId);
        showToast(`ID Kredensial ${cert.credentialId} berhasil disalin!`);
      } catch (err) {
        showToast(`ID: ${cert.credentialId}`);
      }
    });

    metaWrap.appendChild(dateSpan);
    metaWrap.appendChild(idButton);

    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'cert-card__actions';

    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn-cert-view';
    viewBtn.textContent = 'Lihat Kredensial';
    viewBtn.addEventListener('click', () => openCertModal(cert));

    actionsWrap.appendChild(viewBtn);

    if (cert.imageUrl || cert.pdfUrl || cert.images) {
      const imgsParam = cert.images ? cert.images.join(',') : (cert.imageUrl || '');
      const previewUrl = `preview.html?imgs=${encodeURIComponent(imgsParam)}&pdf=${encodeURIComponent(cert.pdfUrl || '')}&title=${encodeURIComponent(cert.title)}`;
      const pdfBtn = document.createElement('a');
      pdfBtn.href = previewUrl;
      pdfBtn.target = '_blank';
      pdfBtn.rel = 'noopener noreferrer';
      pdfBtn.className = 'btn-copy';
      pdfBtn.innerHTML = `<span>Buka Sertifikat</span> ↗`;
      actionsWrap.appendChild(pdfBtn);
    }

    card.appendChild(topWrap);
    card.appendChild(infoWrap);
    card.appendChild(metaWrap);
    card.appendChild(actionsWrap);

    gridEl.appendChild(card);
    observeElementForScrollReveal(card);
  });
}

/* ==========================================================================
   8. TIMELINE / MILESTONES
   ========================================================================== */
function initTimelineSection() {
  const timelineEl = document.getElementById('experience-timeline');
  if (!timelineEl) return;

  timelineEl.innerHTML = '';

  TIMELINE_DATA.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'timeline-item';

    const nodeEl = document.createElement('div');
    nodeEl.className = 'timeline-node';

    const contentEl = document.createElement('div');
    contentEl.className = 'timeline-content reveal-item';

    const dateEl = document.createElement('div');
    dateEl.className = 'timeline-date';
    dateEl.textContent = item.period;

    const titleEl = document.createElement('h3');
    titleEl.className = 'timeline-title';
    titleEl.textContent = item.title;

    const instEl = document.createElement('div');
    instEl.className = 'timeline-institution';
    instEl.textContent = item.institution;

    const descEl = document.createElement('p');
    descEl.className = 'timeline-desc';
    descEl.textContent = item.description;

    contentEl.appendChild(dateEl);
    contentEl.appendChild(titleEl);
    contentEl.appendChild(instEl);
    contentEl.appendChild(descEl);

    itemEl.appendChild(nodeEl);
    itemEl.appendChild(contentEl);

    timelineEl.appendChild(itemEl);
    observeElementForScrollReveal(contentEl);
  });
}

/* ==========================================================================
   9. MODAL DIALOGS (Fluid 3D Morph & PPT Expansion Engine)
   ========================================================================== */
let activeProjectModal = null;
let activeCertModal = null;

function smoothCloseModal(dialog) {
  if (!dialog || !dialog.open || dialog.classList.contains('is-closing')) return;
  dialog.classList.add('is-closing');
  setTimeout(() => {
    try {
      dialog.close();
    } catch (e) {
      dialog.removeAttribute('open');
    }
    dialog.classList.remove('is-closing');
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
  }, 300);
}

function initModals() {
  activeProjectModal = document.getElementById('project-modal');
  activeCertModal = document.getElementById('cert-modal');

  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const dialog = btn.closest('dialog');
      if (dialog) smoothCloseModal(dialog);
    });
  });

  [activeProjectModal, activeCertModal].forEach(dialog => {
    if (!dialog) return;

    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    });

    // Intercept native Escape (cancel event) for smooth exit animation
    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      smoothCloseModal(dialog);
    });

    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        smoothCloseModal(dialog);
        return;
      }
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        smoothCloseModal(dialog);
      }
    });
  });
}

function openProjectModal(project) {
  if (!activeProjectModal) return;

  // Log Telemetry Event
  if (window.telemetry || telemetry) {
    telemetry.logEvent('link_click', project.id, `Lihat Detail Proyek: ${project.title}`);
  }

  const titleEl = document.getElementById('project-modal-title');
  const bodyEl = document.getElementById('project-modal-body');

  if (titleEl) titleEl.textContent = project.title;
  if (bodyEl) {
    bodyEl.innerHTML = '';

    const badgeEl = document.createElement('span');
    badgeEl.className = 'section-tag';
    badgeEl.textContent = `${project.categoryLabel} · ${project.badge}`;
    bodyEl.appendChild(badgeEl);

    const descEl = document.createElement('p');
    descEl.className = 'section-desc';
    descEl.textContent = project.longDescription || project.description;
    bodyEl.appendChild(descEl);

    const featHeader = document.createElement('h4');
    featHeader.textContent = 'Fitur Utama & Keunggulan Arsitektur:';
    bodyEl.appendChild(featHeader);

    const featList = document.createElement('ul');
    featList.style.display = 'flex';
    featList.style.flexDirection = 'column';
    featList.style.gap = '0.5rem';

    project.keyFeatures.forEach(feat => {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.alignItems = 'flex-start';
      li.style.gap = '0.5rem';
      li.style.fontSize = 'var(--fs-body-sm)';
      li.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" stroke-width="2.5" style="flex-shrink:0;margin-top:0.2rem;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      const span = document.createElement('span');
      span.textContent = feat;
      li.appendChild(span);
      featList.appendChild(li);
    });
    bodyEl.appendChild(featList);

    const techHeader = document.createElement('h4');
    techHeader.textContent = 'Tumpukan Teknologi:';
    techHeader.style.marginTop = '0.5rem';
    bodyEl.appendChild(techHeader);

    const techWrap = document.createElement('div');
    techWrap.className = 'tech-pills-wrap';
    project.techStack.forEach(t => {
      const pill = document.createElement('span');
      pill.className = 'tech-pill';
      pill.textContent = t;
      techWrap.appendChild(pill);
    });
    bodyEl.appendChild(techWrap);

    const actionsWrap = document.createElement('div');
    actionsWrap.style.display = 'flex';
    actionsWrap.style.gap = '1rem';
    actionsWrap.style.marginTop = '1rem';

    if (project.githubUrl) {
      const ghBtn = document.createElement('a');
      ghBtn.href = project.githubUrl;
      ghBtn.target = '_blank';
      ghBtn.rel = 'noopener noreferrer';
      ghBtn.className = 'btn-primary';
      ghBtn.textContent = 'Kunjungi Repositori GitHub';
      actionsWrap.appendChild(ghBtn);
    }

    bodyEl.appendChild(actionsWrap);
  }

  document.body.classList.add('modal-open');
  document.documentElement.classList.add('modal-open');
  activeProjectModal.classList.remove('is-closing');
  activeProjectModal.showModal();
}

function openCertModal(cert) {
  if (!activeCertModal) return;

  // Log Telemetry Event
  if (window.telemetry || telemetry) {
    telemetry.logEvent('cert_view', cert.id, `Buka Detail Sertifikat: ${cert.title}`);
  }

  const titleEl = document.getElementById('cert-modal-title');
  const bodyEl = document.getElementById('cert-modal-body');

  if (titleEl) titleEl.textContent = cert.title;
  if (bodyEl) {
    bodyEl.innerHTML = '';

    const metaBox = document.createElement('div');
    metaBox.style.padding = '1rem';
    metaBox.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
    metaBox.style.border = '1px solid rgba(255, 255, 255, 0.10)';
    metaBox.style.borderRadius = 'var(--radius-md)';
    metaBox.style.display = 'flex';
    metaBox.style.flexDirection = 'column';
    metaBox.style.gap = '0.4rem';
    metaBox.style.fontSize = 'var(--fs-body-sm)';

    metaBox.innerHTML = `
      <div><strong>Penerima:</strong> Rafly Firmansyah</div>
      <div><strong>Program Studi:</strong> S1 Informatika — UBSI</div>
      <div><strong>Penerbit / Penyelenggara:</strong> ${cert.issuer}</div>
      ${cert.institution ? `<div><strong>Institusi / Lokasi:</strong> ${cert.institution}</div>` : ''}
      ${cert.instructor ? `<div><strong>Instruktur / Pembicara:</strong> ${cert.instructor}</div>` : ''}
      <div><strong>Tanggal Penerbitan:</strong> ${cert.date}</div>
      <div><strong>Nomor Kredensial / Ref:</strong> <code style="font-family:var(--font-mono);background:var(--badge-bg);padding:0.1rem 0.4rem;border-radius:4px;">${cert.credentialId}</code></div>
      <div><strong>Kategori:</strong> ${cert.categoryLabel}</div>
    `;
    bodyEl.appendChild(metaBox);

    const descHeader = document.createElement('h4');
    descHeader.textContent = 'Kompetensi yang Dicapai:';
    descHeader.style.marginTop = '0.75rem';
    bodyEl.appendChild(descHeader);

    const desc = document.createElement('p');
    desc.style.fontSize = 'var(--fs-body-sm)';
    desc.style.lineHeight = '1.6';
    desc.textContent = cert.description;
    bodyEl.appendChild(desc);

    const skillsHeader = document.createElement('h4');
    skillsHeader.textContent = 'Keahlian Teruji:';
    skillsHeader.style.marginTop = '0.5rem';
    bodyEl.appendChild(skillsHeader);

    const skillsWrap = document.createElement('div');
    skillsWrap.className = 'tech-pills-wrap';
    cert.skillsGained.forEach(s => {
      const pill = document.createElement('span');
      pill.className = 'tech-pill';
      pill.textContent = s;
      skillsWrap.appendChild(pill);
    });
    bodyEl.appendChild(skillsWrap);

    const actionsWrap = document.createElement('div');
    actionsWrap.style.display = 'flex';
    actionsWrap.style.flexWrap = 'wrap';
    actionsWrap.style.gap = '0.75rem';
    actionsWrap.style.marginTop = '1rem';

    if (cert.imageUrl || cert.pdfUrl || cert.images) {
      const imgsParam = cert.images ? cert.images.join(',') : (cert.imageUrl || '');
      const previewUrl = `preview.html?imgs=${encodeURIComponent(imgsParam)}&pdf=${encodeURIComponent(cert.pdfUrl || '')}&title=${encodeURIComponent(cert.title)}`;
      const pdfBtn = document.createElement('a');
      pdfBtn.href = previewUrl;
      pdfBtn.target = '_blank';
      pdfBtn.rel = 'noopener noreferrer';
      pdfBtn.className = 'btn-primary';
      pdfBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> Pratinjau Dokumen Sertifikat`;
      actionsWrap.appendChild(pdfBtn);
    }

    if (cert.verificationUrl) {
      const verifyBtn = document.createElement('a');
      verifyBtn.href = cert.verificationUrl;
      verifyBtn.target = '_blank';
      verifyBtn.rel = 'noopener noreferrer';
      verifyBtn.className = 'btn-secondary';
      verifyBtn.textContent = 'Laman Lembaga / Penyelenggara';
      actionsWrap.appendChild(verifyBtn);
    }

    bodyEl.appendChild(actionsWrap);
  }

  document.body.classList.add('modal-open');
  document.documentElement.classList.add('modal-open');
  activeCertModal.classList.remove('is-closing');
  activeCertModal.showModal();
}

/* ==========================================================================
   10. REAL CONTACT FORM DELIVERY (FormSubmit.co + WhatsApp Dual Delivery)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');
  const submitBtn = document.getElementById('form-submit-btn');
  const btnText = document.getElementById('btn-text');

  if (!form || !statusEl || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const honeypot = form.querySelector('input[name="_honeypot"]');
    if (honeypot && honeypot.value !== '') {
      return;
    }

    const lastSubmitTime = localStorage.getItem('portfolio_last_submit');
    const now = Date.now();
    if (lastSubmitTime && (now - parseInt(lastSubmitTime, 10)) < 30000) {
      const remainingSeconds = Math.ceil((30000 - (now - parseInt(lastSubmitTime, 10))) / 1000);
      statusEl.className = 'form-status error';
      statusEl.style.display = 'block';
      statusEl.textContent = `Mohon menunggu ${remainingSeconds} detik sebelum mengirimkan pesan kembali demi mencegah spam.`;
      return;
    }

    const nameInput = form.querySelector('#contact-name');
    const emailInput = form.querySelector('#contact-email');
    const messageInput = form.querySelector('#contact-message');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !message || !emailPattern.test(email)) {
      form.classList.remove('is-shaking');
      void form.offsetWidth;
      form.classList.add('is-shaking');

      statusEl.className = 'form-status error';
      statusEl.style.display = 'block';

      if (!emailPattern.test(email) && email) {
        statusEl.textContent = 'Format alamat email tidak valid. Harap periksa kembali.';
        emailInput.focus();
      } else {
        statusEl.textContent = 'Harap lengkapi semua kolom formulir dengan benar.';
      }

      setTimeout(() => {
        form.classList.remove('is-shaking');
      }, 500);

      return;
    }

    submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Mengirim Pesan...';

    const payload = {
      name: name,
      email: email,
      message: message,
      _subject: `Pesan Portofolio Baru dari ${name} (${email})`,
      _template: 'table',
      _captcha: 'false'
    };

    try {
      const response = await fetch('https://formsubmit.co/ajax/raflyfirmansyah02@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok || data.success === 'true' || data.success === true) {
        localStorage.setItem('portfolio_last_submit', Date.now().toString());
        telemetry.logEvent('contact_submit', 'success', 'Pengiriman Formulir Kontak Berhasil');
        statusEl.className = 'form-status success';
        statusEl.style.display = 'block';

        const waText = encodeURIComponent(`Halo Rafly, saya ${name} (${email}). Pesan: ${message}`);
        const waLink = `https://wa.me/628991333323?text=${waText}`;

        statusEl.innerHTML = `
          <div class="form-status-head">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" stroke-width="2.5" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <strong>Pesan Berhasil Terkirim!</strong>
          </div>
          <p style="margin: 0.35rem 0 0.75rem 0; font-size: 0.85rem; color: var(--text-muted);">Pesan Anda telah diteruskan langsung ke kotak masuk email <code>raflyfirmansyah02@gmail.com</code>.</p>
          <div style="font-size: 0.85rem; color: var(--text-body); margin-bottom: 0.5rem;">Ingin respon lebih cepat? Lanjutkan diskusi instan via WhatsApp:</div>
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="form-status-wa-btn" aria-label="Lanjutkan chat ke WhatsApp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            <span>Lanjutkan ke WhatsApp</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true" style="margin-left:auto;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </a>
        `;

        form.reset();
        showToast('Pesan berhasil terkirim ke email Rafly Firmansyah!');
      } else {
        throw new Error(data.message || 'Gagal mengirim pesan');
      }
    } catch (err) {
      telemetry.logEvent('contact_submit', 'error', 'Kegagalan Pengiriman Formulir Kontak');
      statusEl.className = 'form-status error';
      statusEl.style.display = 'block';

      const waText = encodeURIComponent(`Halo Rafly, saya ${name} (${email}). Pesan: ${message}`);
      const waLink = `https://wa.me/628991333323?text=${waText}`;

      statusEl.innerHTML = `
        <div class="form-status-head">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <strong>Koneksi Pengiriman Sedang Sibuk</strong>
        </div>
        <p style="margin: 0.35rem 0 0.75rem 0; font-size: 0.85rem; color: var(--text-muted);">Silakan hubungi langsung melalui WhatsApp 1-klik di bawah ini:</p>
        <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="form-status-wa-btn" aria-label="Kirim pesan langsung via WhatsApp">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          <span>Kirim via WhatsApp Langsung</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true" style="margin-left:auto;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </a>
      `;
    } finally {
      submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Kirim Pesan Langsung';
    }
  });
}

/* ==========================================================================
   11. COPY EMAIL TO CLIPBOARD WITH TOAST
   ========================================================================== */
function initCopyEmailButton() {
  const copyBtn = document.getElementById('copy-email-btn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    const email = DEVELOPER_PROFILE.email || 'raflyfirmansyah02@gmail.com';

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = email;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      showToast(`Alamat email ${email} berhasil disalin ke clipboard!`);
    } catch (err) {
      showToast(`Email: ${email}`);
    }
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('is-visible');

  setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 3500);
}

/* ==========================================================================
   12. SCROLL PROGRESS BAR & SCROLL REVEAL
   ========================================================================== */
function initScrollProgressBar() {
  const progressBar = document.getElementById('scroll-progress-bar');
  if (!progressBar) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', Math.round(progress));
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

let globalScrollObserver = null;

function observeElementForScrollReveal(el) {
  if (!el || !globalScrollObserver) return;
  el.classList.add('reveal-item');
  globalScrollObserver.observe(el);
}

function refreshScrollReveal() {
  if (!globalScrollObserver) return;
  const revealElements = document.querySelectorAll(
    '.hero-pill-badge, .hero-main-title, .hero-lead-text, .hero-btn-group, .hero-showcase-canvas, .section-header, .about-bio, .pillar-card, .marquee-container, .bento-tile, .project-card, .certificate-card, .filter-bar, .timeline-content, .terminal-card, .contact-method-card, .contact-form'
  );

  revealElements.forEach(el => {
    el.classList.add('reveal-item');
    globalScrollObserver.observe(el);
  });
}

function initScrollReveal() {
  if (globalScrollObserver) {
    globalScrollObserver.disconnect();
  }

  globalScrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
      } else {
        entry.target.classList.remove('is-revealed');
        // If element is above the viewport, mark it as reveal-from-top so it slides down when scrolling back up
        if (entry.boundingClientRect.top < 0) {
          entry.target.classList.add('reveal-from-top');
        } else {
          entry.target.classList.remove('reveal-from-top');
        }
      }
    });
  }, {
    rootMargin: '10px 0px -10px 0px',
    threshold: 0.08
  });

  refreshScrollReveal();
}

function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (sections.length === 0 || navLinks.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(sec => observer.observe(sec));
}

/* ==========================================================================
   HORIZONX INTERACTION & MOTION SPOTLIGHT ENGINE (RAF-Optimized)
   ========================================================================== */
function initHorizonXEffects() {
  // 1. Mouse Spotlight & Hover Physics for Showcase & Bento Cards (RAF Throttled to eliminate reflow thrashing)
  const cards = document.querySelectorAll('.showcase-card, .bento-tile, .certificate-card, .pillar-card, .contact-method-card, .contact-form');
  cards.forEach(card => {
    let rect = null;
    let rafId = null;

    card.addEventListener('mouseenter', () => {
      rect = card.getBoundingClientRect();
    }, { passive: true });

    card.addEventListener('mousemove', (e) => {
      if (!rect) rect = card.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          if (rect) {
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
          }
          rafId = null;
        });
      }
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      rect = null;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }, { passive: true });
  });

  // 2. Parallax Drift on Ambient Background Blobs on Mouse Movement (RAF Throttled)
  const blobs = document.querySelectorAll('.ambient-blob');
  if (blobs.length > 0) {
    let blobRafId = null;
    window.addEventListener('mousemove', (e) => {
      const clientX = e.clientX;
      const clientY = e.clientY;

      if (!blobRafId) {
        blobRafId = requestAnimationFrame(() => {
          const mouseX = (clientX / window.innerWidth - 0.5) * 35;
          const mouseY = (clientY / window.innerHeight - 0.5) * 35;
          blobs.forEach((blob, index) => {
            const factor = (index + 1) * 0.45;
            blob.style.transform = `translate(${mouseX * factor}px, ${mouseY * factor}px)`;
          });
          blobRafId = null;
        });
      }
    }, { passive: true });
  }
}

// ==========================================================================
// PORTFOLIO AGENT API (dipanggil oleh parseAndExecuteActionTags di terminal.js)
// Mengeksekusi [ACTION:...] directive dari AI ke aksi DOM yang nyata.
// ==========================================================================
const AGENT_ALLOWED_SECTIONS = ['hero', 'about', 'skills', 'projects', 'certificates', 'experience', 'lab', 'contact'];
const AGENT_ALLOWED_URL_HOSTS = ['github.com', 'raflyfirmansyah-portofolio.vercel.app', 'wa.me', 'bnsp.go.id', 'mikrotik.com', 'netacad.com'];

function agentScrollToSection(sectionId) {
  const id = AGENT_ALLOWED_SECTIONS.includes(String(sectionId || '').toLowerCase())
    ? String(sectionId).toLowerCase()
    : '';
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  const headerOffset = 80;
  const elementPosition = el.getBoundingClientRect().top;
  const offsetPosition = elementPosition + (window.scrollY || window.pageYOffset) - headerOffset;
  smoothScrollTo(offsetPosition, 1050);
  return true;
}

function agentSafeOpenUrl(rawUrl) {
  try {
    const url = new URL(String(rawUrl || ''), window.location.origin);
    if (url.protocol !== 'https:') return false;
    if (!AGENT_ALLOWED_URL_HOSTS.includes(url.hostname)) return false;
    window.open(url.href, '_blank', 'noopener,noreferrer');
    return true;
  } catch (_) {
    return false;
  }
}

window.portfolioAgent = {
  executeAction(actionType, payload) {
    const p = payload || {};
    switch (actionType) {
      case 'OPEN_PROJECT': {
        const key = String(p.id || p.title || p.name || '').toLowerCase();
        const project = PROJECTS_DATA.find((pr) =>
          String(pr.id || '').toLowerCase() === key ||
          String(pr.title || '').toLowerCase() === key ||
          key.length > 3 && String(pr.title || '').toLowerCase().includes(key)
        );
        if (project) {
          agentScrollToSection('projects');
          openProjectModal(project);
          return true;
        }
        return agentScrollToSection('projects');
      }
      case 'OPEN_CERTIFICATE': {
        const key = String(p.id || p.title || p.name || '').toLowerCase();
        const cert = CERTIFICATES_DATA.find((c) =>
          String(c.title || '').toLowerCase() === key ||
          key.length > 3 && String(c.title || '').toLowerCase().includes(key)
        );
        if (cert) {
          agentScrollToSection('certificates');
          openCertModal(cert);
          return true;
        }
        return agentScrollToSection('certificates');
      }
      case 'FILL_CONTACT': {
        agentScrollToSection('contact');
        const form = document.getElementById('contact-form');
        if (!form) return false;
        const nameInput = form.querySelector('#contact-name');
        const messageInput = form.querySelector('#contact-message');
        if (p.name && nameInput && !nameInput.value) nameInput.value = String(p.name).slice(0, 100);
        if (p.message && messageInput && !messageInput.value) messageInput.value = String(p.message).slice(0, 500);
        return true;
      }
      case 'NAVIGATE':
        return agentScrollToSection(p.section || p.target || p.id);
      case 'OPEN_URL':
        return agentSafeOpenUrl(p.url || p.link);
      case 'OPEN_GITHUB':
        return agentSafeOpenUrl(p.url || `https://github.com/Raflyf${p.repo ? '/' + String(p.repo).replace(/^\/+/, '') : ''}`);
      case 'TOGGLE_THEME': {
        const btn = document.getElementById('theme-toggle-btn');
        if (btn) { btn.click(); return true; }
        return false;
      }
      case 'COPY_EMAIL': {
        const btn = document.getElementById('copy-email-btn');
        if (btn) { btn.click(); return true; }
        return false;
      }
      default:
        return false;
    }
  }
};



