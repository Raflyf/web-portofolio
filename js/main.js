/**
 * ============================================================================
 * RAFLY FIRMANSYAH - MAIN APPLICATION LOGIC
 * - Inertia Smooth-Scroll Engine with Cubic Physics & Wheel Damper
 * - FormSubmit AJAX Real Email Delivery to raflyfirmansyah02@gmail.com
 * - 1-Click Email Copy with Floating Toast Feedback
 * - Dual Delivery with Direct WhatsApp Web Dispatch
 * - Embedded PDF Document Viewer inside Native <dialog> Modals
 * - WCAG 2.2 AA Accessibility & Security Sanitization
 * ============================================================================
 */

import { DEVELOPER_PROFILE, PROJECTS_DATA, CERTIFICATES_DATA, TIMELINE_DATA } from './data.js';
import { initTerminal } from './terminal.js';

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileNavigation();
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
  initInertiaSmoothWheel();
  initBackToTopButtons();
  initTerminal();
});

/* ==========================================================================
   1. CUSTOM CUBIC SMOOTH-SCROLL ENGINE
   Guarantees 60-120fps fluid deceleration across all platforms
   ========================================================================== */
export function smoothScrollTo(targetY, duration = 850) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, targetY);
    return;
  }

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
        smoothScrollTo(0, 800);
        return;
      }

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        smoothScrollTo(offsetPosition, 850);

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
    smoothScrollTo(0, 900);
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
   2. MOMENTUM INERTIA SMOOTH WHEEL ENGINE (Fluid 60-120fps physics)
   ========================================================================== */
function initInertiaSmoothWheel() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let currentY = window.scrollY || window.pageYOffset;
  let targetY = currentY;
  let isRunning = false;
  const ease = 0.085;

  function updateWheelPhysics() {
    const diff = targetY - currentY;
    
    if (Math.abs(diff) > 0.4) {
      currentY += diff * ease;
      window.scrollTo(0, Math.round(currentY * 10) / 10);
      requestAnimationFrame(updateWheelPhysics);
    } else {
      currentY = targetY;
      window.scrollTo(0, targetY);
      isRunning = false;
    }
  }

  window.addEventListener('wheel', (e) => {
    const path = e.composedPath ? e.composedPath() : [];
    const isScrollableChild = path.some(el => {
      if (!el || !el.classList) return false;
      return (
        el.classList.contains('terminal-body') ||
        el.classList.contains('modal-body') ||
        el.tagName === 'TEXTAREA' ||
        el.tagName === 'IFRAME'
      );
    });

    if (isScrollableChild) {
      targetY = window.scrollY || window.pageYOffset;
      currentY = targetY;
      return;
    }

    e.preventDefault();

    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );

    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 40;
    if (e.deltaMode === 2) delta *= 800;

    targetY = Math.min(Math.max(0, targetY + delta), maxScroll);

    if (!isRunning) {
      isRunning = true;
      currentY = window.scrollY || window.pageYOffset;
      requestAnimationFrame(updateWheelPhysics);
    }
  }, { passive: false });

  window.addEventListener('scroll', () => {
    if (!isRunning) {
      currentY = window.scrollY || window.pageYOffset;
      targetY = currentY;
    }
  }, { passive: true });
}

/* ==========================================================================
   3. THEME TOGGLER
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
   4. MOBILE NAVIGATION
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
}

/* ==========================================================================
   5. PROJECTS SHOWCASE & FILTERING
   ========================================================================== */
function initProjectsSection() {
  const gridEl = document.getElementById('projects-grid');
  const filterTabs = document.querySelectorAll('[data-filter-project]');

  if (!gridEl) return;

  renderProjects('all');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const category = tab.getAttribute('data-filter-project');
      renderProjects(category);
    });
  });
}

function renderProjects(category) {
  const gridEl = document.getElementById('projects-grid');
  if (!gridEl) return;

  gridEl.innerHTML = '';

  const filtered = category === 'all' 
    ? PROJECTS_DATA 
    : PROJECTS_DATA.filter(p => p.category === category);

  if (filtered.length === 0) {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'empty-state reveal-item is-revealed';
    emptyEl.textContent = 'Belum ada proyek dalam kategori ini.';
    gridEl.appendChild(emptyEl);
    return;
  }

  filtered.forEach((project, idx) => {
    const card = document.createElement('article');
    card.className = 'project-card reveal-item is-revealed';
    card.setAttribute('tabindex', '0');
    card.style.transitionDelay = `${idx * 40}ms`;

    const header = document.createElement('div');
    header.className = 'project-card__header';

    const badge = document.createElement('span');
    badge.className = 'project-card__badge';
    badge.textContent = project.badge;

    const linksWrap = document.createElement('div');
    linksWrap.className = 'project-card__links';

    if (project.githubUrl) {
      const ghLink = document.createElement('a');
      ghLink.href = project.githubUrl;
      ghLink.target = '_blank';
      ghLink.rel = 'noopener noreferrer';
      ghLink.className = 'project-icon-link';
      ghLink.setAttribute('aria-label', `Buka repositori GitHub untuk ${project.title}`);
      ghLink.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`;
      linksWrap.appendChild(ghLink);
    }

    header.appendChild(badge);
    header.appendChild(linksWrap);

    const body = document.createElement('div');
    body.className = 'project-card__body';

    const title = document.createElement('h3');
    title.className = 'project-card__title';
    title.textContent = project.title;

    const desc = document.createElement('p');
    desc.className = 'project-card__desc';
    desc.textContent = project.description;

    const featuresList = document.createElement('div');
    featuresList.className = 'project-card__features';

    project.keyFeatures.slice(0, 2).forEach(feature => {
      const featItem = document.createElement('div');
      featItem.className = 'project-card__feature-item';
      featItem.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      const featText = document.createElement('span');
      featText.textContent = feature;
      featItem.appendChild(featText);
      featuresList.appendChild(featItem);
    });

    body.appendChild(title);
    body.appendChild(desc);
    body.appendChild(featuresList);

    const footer = document.createElement('div');
    footer.className = 'project-card__footer';

    const tagsWrap = document.createElement('div');
    tagsWrap.className = 'project-card__tags';
    project.techStack.forEach(t => {
      const tag = document.createElement('span');
      tag.className = 'project-card__tag';
      tag.textContent = t;
      tagsWrap.appendChild(tag);
    });

    const detailBtn = document.createElement('button');
    detailBtn.className = 'btn-detail-trigger';
    detailBtn.textContent = 'Detail & Arsitektur';
    detailBtn.addEventListener('click', () => openProjectModal(project));

    footer.appendChild(tagsWrap);
    footer.appendChild(detailBtn);

    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);

    gridEl.appendChild(card);
  });
}

/* ==========================================================================
   6. CERTIFICATES SHOWCASE & FILTERING
   ========================================================================== */
function initCertificatesSection() {
  const gridEl = document.getElementById('certificates-grid');
  const filterTabs = document.querySelectorAll('[data-filter-cert]');

  if (!gridEl) return;

  renderCertificates('all');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const category = tab.getAttribute('data-filter-cert');
      renderCertificates(category);
    });
  });
}

function renderCertificates(category) {
  const gridEl = document.getElementById('certificates-grid');
  if (!gridEl) return;

  gridEl.innerHTML = '';

  const filtered = category === 'all'
    ? CERTIFICATES_DATA
    : CERTIFICATES_DATA.filter(c => c.category === category);

  filtered.forEach((cert, idx) => {
    const card = document.createElement('article');
    card.className = 'certificate-card reveal-item is-revealed';
    card.style.transitionDelay = `${idx * 30}ms`;

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

    const idSpan = document.createElement('span');
    idSpan.textContent = `ID: ${cert.credentialId}`;

    metaWrap.appendChild(dateSpan);
    metaWrap.appendChild(idSpan);

    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'cert-card__actions';

    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn-cert-view';
    viewBtn.textContent = 'Lihat Kredensial & PDF';
    viewBtn.addEventListener('click', () => openCertModal(cert));

    actionsWrap.appendChild(viewBtn);

    card.appendChild(topWrap);
    card.appendChild(metaWrap);
    card.appendChild(actionsWrap);

    gridEl.appendChild(card);
  });
}

/* ==========================================================================
   7. TIMELINE / MILESTONES
   ========================================================================== */
function initTimelineSection() {
  const timelineEl = document.getElementById('experience-timeline');
  if (!timelineEl) return;

  timelineEl.innerHTML = '';

  TIMELINE_DATA.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'timeline-item reveal-item';

    const nodeEl = document.createElement('div');
    nodeEl.className = 'timeline-node';

    const contentEl = document.createElement('div');
    contentEl.className = 'timeline-content';

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
  });
}

/* ==========================================================================
   8. MODAL DIALOGS (Accessible native <dialog> implementation)
   ========================================================================== */
let activeProjectModal = null;
let activeCertModal = null;

function initModals() {
  activeProjectModal = document.getElementById('project-modal');
  activeCertModal = document.getElementById('cert-modal');

  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dialog = btn.closest('dialog');
      if (dialog) dialog.close();
    });
  });

  [activeProjectModal, activeCertModal].forEach(dialog => {
    if (!dialog) return;
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        dialog.close();
      }
    });
  });
}

function openProjectModal(project) {
  if (!activeProjectModal) return;

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

  activeProjectModal.showModal();
}

function openCertModal(cert) {
  if (!activeCertModal) return;

  const titleEl = document.getElementById('cert-modal-title');
  const bodyEl = document.getElementById('cert-modal-body');

  if (titleEl) titleEl.textContent = cert.title;
  if (bodyEl) {
    bodyEl.innerHTML = '';

    const metaBox = document.createElement('div');
    metaBox.style.padding = '1rem';
    metaBox.style.backgroundColor = 'var(--bg-secondary)';
    metaBox.style.borderRadius = 'var(--radius-md)';
    metaBox.style.display = 'flex';
    metaBox.style.flexDirection = 'column';
    metaBox.style.gap = '0.4rem';
    metaBox.style.fontSize = 'var(--fs-body-sm)';

    metaBox.innerHTML = `
      <div><strong>Penerima:</strong> Rafly Firmansyah</div>
      <div><strong>Penerbit / Penyelenggara:</strong> ${cert.issuer}</div>
      ${cert.institution ? `<div><strong>Institusi / Lokasi:</strong> ${cert.institution}</div>` : ''}
      ${cert.instructor ? `<div><strong>Instruktur / Pembicara:</strong> ${cert.instructor}</div>` : ''}
      <div><strong>Tanggal Penerbitan:</strong> ${cert.date}</div>
      <div><strong>Nomor Kredensial / Ref:</strong> <code style="font-family:var(--font-mono);background:var(--badge-bg);padding:0.1rem 0.4rem;border-radius:4px;">${cert.credentialId}</code></div>
      <div><strong>Kategori:</strong> ${cert.categoryLabel}</div>
    `;
    bodyEl.appendChild(metaBox);

    // Embedded PDF Preview Frame
    if (cert.pdfUrl) {
      const previewHeader = document.createElement('h4');
      previewHeader.textContent = 'Pratinjau Dokumen Sertifikat:';
      previewHeader.style.marginTop = '0.75rem';
      bodyEl.appendChild(previewHeader);

      const iframe = document.createElement('iframe');
      iframe.className = 'modal-pdf-frame';
      iframe.src = `${cert.pdfUrl}#toolbar=0&navpanes=0`;
      iframe.title = `Pratinjau Dokumen ${cert.title}`;
      iframe.loading = 'lazy';
      bodyEl.appendChild(iframe);
    }

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

    if (cert.pdfUrl) {
      const pdfBtn = document.createElement('a');
      pdfBtn.href = cert.pdfUrl;
      pdfBtn.target = '_blank';
      pdfBtn.rel = 'noopener noreferrer';
      pdfBtn.className = 'btn-primary';
      pdfBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> Buka Tab Baru (Ukuran Penuh)`;
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

  activeCertModal.showModal();
}

/* ==========================================================================
   9. REAL CONTACT FORM DELIVERY (FormSubmit.co + WhatsApp Dual Delivery)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');
  const submitBtn = document.getElementById('form-submit-btn');
  const btnText = document.getElementById('btn-text');

  if (!form || !statusEl || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Anti-spam Honeypot Check
    const honeypot = form.querySelector('input[name="_honeypot"]');
    if (honeypot && honeypot.value !== '') {
      return;
    }

    // 2. Client-side Rate Limiting (30-second cooldown)
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

    // 3. Email regex validation (RFC 5322)
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

    // 4. Loading State
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

      if (response.ok || data.success === 'true') {
        localStorage.setItem('portfolio_last_submit', Date.now().toString());

        statusEl.className = 'form-status success';
        statusEl.style.display = 'block';

        const waText = encodeURIComponent(`Halo Rafly, saya ${name} (${email}). Pesan: ${message}`);
        const waLink = `https://wa.me/6289913333223?text=${waText}`;

        statusEl.innerHTML = `
          <div><strong>Pesan Berhasil Terkirim!</strong> Pesan Anda telah diteruskan langsung ke kotak masuk email <code>raflyfirmansyah02@gmail.com</code>.</div>
          <div style="margin-top: 0.5rem;">Ingin respon lebih cepat? Anda dapat langsung melanjutkan obrolan via WhatsApp:</div>
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="form-status-wa-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            Lanjutkan ke WhatsApp
          </a>
        `;

        form.reset();
        showToast('Pesan berhasil terkirim ke email Rafly Firmansyah!');
      } else {
        throw new Error(data.message || 'Gagal mengirimkan pesan.');
      }
    } catch (err) {
      console.warn('FormSubmit AJAX fallback:', err);
      
      // Fallback directly to WhatsApp
      statusEl.className = 'form-status error';
      statusEl.style.display = 'block';

      const waText = encodeURIComponent(`Halo Rafly, saya ${name} (${email}). Pesan: ${message}`);
      const waLink = `https://wa.me/6289913333223?text=${waText}`;

      statusEl.innerHTML = `
        <div>Koneksi email pengiriman sedang sibuk. Silakan hubungi langsung via WhatsApp dengan 1-klik di bawah ini:</div>
        <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="form-status-wa-btn" style="margin-top:0.5rem;">
          Kirim via WhatsApp
        </a>
      `;
    } finally {
      submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Kirim Pesan Langsung';
    }
  });
}

/* ==========================================================================
   10. COPY EMAIL TO CLIPBOARD WITH TOAST
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
        // Fallback for older browsers
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

export function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('is-visible');

  setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 3500);
}

/* ==========================================================================
   11. SCROLL PROGRESS BAR
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

/* ==========================================================================
   12. SCROLL REVEAL (IntersectionObserver)
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.section, .about-pillars .pillar-card, .tech-group-card, .timeline-item');

  if (revealElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => {
    el.classList.add('reveal-item');
    observer.observe(el);
  });
}

/* ==========================================================================
   13. SCROLL SPY
   ========================================================================== */
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
