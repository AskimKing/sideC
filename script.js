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

// ---- Frame Scroll Animation (index.html only) ----
(function () {
  const canvas  = document.getElementById('frameCanvas');
  const section = document.getElementById('frameScrollSection');
  if (!canvas || !section) return;

  const ctx        = canvas.getContext('2d');
  const frameCount = 73;
  const frames     = new Array(frameCount);
  let   loaded     = 0;
  let   currentFrame = 0;

  // Resize canvas to match its actual CSS display size
  function resizeCanvas() {
    canvas.width  = canvas.offsetWidth  || Math.round(window.innerWidth * 0.6);
    canvas.height = canvas.offsetHeight || window.innerHeight;
    drawFrame(currentFrame);
  }

  // Draw a single frame centered + cover
  function drawFrame(index) {
    const img = frames[index];
    if (!img || !img.complete || !img.naturalWidth) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth  * scale;
    const h = img.naturalHeight * scale;
    const x = (cw - w) / 2;
    const y = (ch - h) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, x, y, w, h);
  }

  // Preload all frames
  for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    const num = String(i).padStart(4, '0');
    img.src = 'frame_' + num + '.png';
    img.onload = function () {
      loaded++;
      if (loaded === 1) {
        resizeCanvas(); // Draw first frame as soon as it loads
      }
    };
    frames[i - 1] = img;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Scroll → frame index
  let ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        const rect     = section.getBoundingClientRect();
        const total    = section.offsetHeight - window.innerHeight;
        const scrolled = Math.max(0, -rect.top);
        const progress = Math.min(scrolled / total, 1);
        const index    = Math.min(Math.round(progress * (frameCount - 1)), frameCount - 1);

        if (index !== currentFrame) {
          currentFrame = index;
          drawFrame(currentFrame);
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

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

// ---- Cookie Banner (every page) ----
function acceptCookies() {
  localStorage.setItem('cookieConsent', 'accepted');
  hideCookieBanner();
}

function declineCookies() {
  localStorage.setItem('cookieConsent', 'declined');
  hideCookieBanner();
}

function hideCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;
  banner.classList.remove('visible');
  setTimeout(() => { banner.style.display = 'none'; }, 420);
}

function initCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;
  if (!localStorage.getItem('cookieConsent')) {
    setTimeout(() => { banner.classList.add('visible'); }, 700);
  }
}

// ---- Menu (present on every page) ----
document.addEventListener('DOMContentLoaded', () => {
  const btn      = document.getElementById('menuBtn');
  const dropdown = document.getElementById('dropdown');

  initCookieBanner();

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
