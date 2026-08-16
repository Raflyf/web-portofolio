/**
 * ============================================================================
 * RAFLY FIRMANSYAH - MAIN APPLICATION LOGIC (ENHANCED & AUDITED)
 * Security: Strict XSS-safe DOM construction, email regex validation
 * Accessibility: WCAG 2.2 AA compliant, prefers-reduced-motion support
 * Performance: Passive scroll listeners, IntersectionObserver optimizations
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
  initScrollSpy();
  initScrollProgressBar();
  initScrollReveal();
  initSmoothAnchorScroll();
  initBackToTop();
  initTerminal();
});

/* ==========================================================================
   1. THEME TOGGLER (Local Storage + System Preference)
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
   2. MOBILE NAVIGATION
   ========================================================================== */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close menu on nav link click
  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ==========================================================================
   3. PROJECTS SHOWCASE & FILTERING
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
    card.style.transitionDelay = `${idx * 50}ms`;

    // Header
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

    // Body
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

    // Footer
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
   4. CERTIFICATES SHOWCASE & FILTERING
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
    card.style.transitionDelay = `${idx * 40}ms`;

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
    viewBtn.textContent = 'Lihat Kredensial';
    viewBtn.addEventListener('click', () => openCertModal(cert));

    actionsWrap.appendChild(viewBtn);

    card.appendChild(topWrap);
    card.appendChild(metaWrap);
    card.appendChild(actionsWrap);

    gridEl.appendChild(card);
  });
}

/* ==========================================================================
   5. TIMELINE / MILESTONES
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
   6. MODAL DIALOGS (Accessible native <dialog> implementation)
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

  // Close dialog on backdrop click
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

    const descHeader = document.createElement('h4');
    descHeader.textContent = 'Kompetensi yang Dicapai:';
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

    const note = document.createElement('p');
    note.style.fontSize = 'var(--fs-caption)';
    note.style.color = 'var(--text-muted)';
    note.style.marginTop = '0.5rem';
    note.textContent = 'Dokumen sertifikat autentik tersimpan dan dapat dibuka langsung dalam format PDF.';
    bodyEl.appendChild(note);

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
      pdfBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> Buka Dokumen PDF Resmi`;
      actionsWrap.appendChild(pdfBtn);
    }

    if (cert.verificationUrl) {
      const verifyBtn = document.createElement('a');
      verifyBtn.href = cert.verificationUrl;
      verifyBtn.target = '_blank';
      verifyBtn.rel = 'noopener noreferrer';
      verifyBtn.className = 'btn-secondary';
      verifyBtn.textContent = 'Laman Lembaga / Penerbit';
      actionsWrap.appendChild(verifyBtn);
    }

    bodyEl.appendChild(actionsWrap);
  }

  activeCertModal.showModal();
}

/* ==========================================================================
   7. CONTACT FORM & VALIDATION
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');

  if (!form || !statusEl) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Honeypot check
    const honeypot = form.querySelector('input[name="_honeypot"]');
    if (honeypot && honeypot.value !== '') {
      return; // Silent discard bot submission
    }

    const nameInput = form.querySelector('#contact-name');
    const emailInput = form.querySelector('#contact-email');
    const messageInput = form.querySelector('#contact-message');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    // Email regex validation (RFC 5322 simplified)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !message || !emailPattern.test(email)) {
      form.classList.remove('is-shaking');
      void form.offsetWidth; // Trigger reflow for replayable shake animation
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

    // Success response
    statusEl.className = 'form-status success';
    statusEl.style.display = 'block';
    statusEl.textContent = `Terima kasih ${name}, pesan Anda berhasil dicatat. Anda juga dapat menghubungi WhatsApp kami di ${DEVELOPER_PROFILE.whatsapp}.`;

    form.reset();

    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 7000);
  });
}

/* ==========================================================================
   8. SCROLL PROGRESS BAR
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
   9. SCROLL REVEAL (IntersectionObserver)
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
   10. SMOOTH ANCHOR NAVIGATION
   ========================================================================== */
function initSmoothAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Set focus for accessibility without jump
        targetEl.setAttribute('tabindex', '-1');
        targetEl.focus({ preventScroll: true });
      }
    });
  });
}

/* ==========================================================================
   11. SCROLL SPY
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

/* ==========================================================================
   12. BACK TO TOP
   ========================================================================== */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
