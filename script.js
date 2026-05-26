// =============================================
//  OASIS MEDIA PRODUCTIONS
// =============================================

// ---- Lightbox (only exists on projects.html) ----
const lightbox      = document.getElementById('lightbox');
const videoWrap     = document.getElementById('lightboxVideo');
const panelBackdrop = document.getElementById('panelBackdrop');

function openLightbox(videoId, start, isShort = false) {
  closePanel(); // close nav panels first
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}`
             + `?autoplay=1&playsinline=1&rel=0&fs=1`
             + (start ? `&start=${start}` : '');
  iframe.allow           = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
  iframe.allowFullscreen = true;

  videoWrap.innerHTML = '';
  videoWrap.appendChild(iframe);
  videoWrap.classList.toggle('is-short', isShort);

  lightbox.classList.add('open');
  document.body.classList.add('lightbox-open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  videoWrap.innerHTML = '';
  videoWrap.classList.remove('is-short');
  lightbox.classList.remove('open');
  document.body.classList.remove('lightbox-open');
  document.body.style.overflow = '';
}

// ---- Nav Panels (Startseite / Über uns / Dienstleistungen — index.html only) ----
function openPanel(id) {
  document.querySelectorAll('.nav-panel').forEach(p => p.classList.remove('open'));
  document.querySelectorAll('.nav-link-btn').forEach(b => b.classList.remove('active'));

  const panel = document.getElementById('panel-' + id);
  const btn   = document.querySelector(`.nav-link-btn[data-panel="${id}"]`);
  if (!panel) return;

  panel.classList.add('open');
  if (btn) btn.classList.add('active');
  if (panelBackdrop) panelBackdrop.classList.add('open');
}

function closePanel() {
  document.querySelectorAll('.nav-panel').forEach(p => p.classList.remove('open'));
  document.querySelectorAll('.nav-link-btn').forEach(b => b.classList.remove('active'));
  if (panelBackdrop) panelBackdrop.classList.remove('open');
}

// ---- Menu (present on every page) ----
document.addEventListener('DOMContentLoaded', () => {
  const btn      = document.getElementById('menuBtn');
  const dropdown = document.getElementById('dropdown');

  if (!btn || !dropdown) return;

  // Hamburger toggle
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    closePanel(); // close nav panels when hamburger opens
    const isOpen = dropdown.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', isOpen);
  });

  // Nav panel button clicks (toggle open/close)
  document.querySelectorAll('.nav-link-btn').forEach(navBtn => {
    navBtn.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', false);

      const id    = navBtn.dataset.panel;
      const panel = document.getElementById('panel-' + id);
      if (panel && panel.classList.contains('open')) {
        closePanel(); // clicking active button again closes it
      } else {
        openPanel(id);
      }
    });
  });

  // Panels stop propagation so a click inside doesn't trigger document-click
  document.querySelectorAll('.nav-panel').forEach(panel => {
    panel.addEventListener('click', e => e.stopPropagation());
  });

  // Backdrop click closes panel
  if (panelBackdrop) {
    panelBackdrop.addEventListener('click', closePanel);
  }

  // Click anywhere else closes dropdown and panels
  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', false);
    closePanel();
  });

  // ESC closes everything
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    dropdown.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', false);
    if (lightbox) closeLightbox();
    closePanel();
  });
});
