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
history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

(function () {
  const canvas  = document.getElementById('frameCanvas');
  const section = document.getElementById('frameScrollSection');
  if (!canvas || !section) return;

  const ctx        = canvas.getContext('2d');
  const frameCount = 73;
  const frames     = new Array(frameCount);
  let   loaded     = 0;
  let   current    = 0;

  const heroH1        = section.querySelector('h1');
  const heroSub       = section.querySelector('.hero-sub');
  const heroCta       = section.querySelector('.hero-cta');
  const heroScrollLbl = document.getElementById('heroScrollLabel');

  function resizeCanvas() {
    canvas.width  = canvas.offsetWidth  || Math.round(window.innerWidth * 0.6);
    canvas.height = canvas.offsetHeight || window.innerHeight;
    drawFrame(Math.round(current));
  }

  function drawFrame(index) {
    const img = frames[index];
    if (!img || !img.complete || !img.naturalWidth) return;
    const cw = canvas.width, ch = canvas.height;
    const isMobile = window.innerWidth <= 768;
    const scale = isMobile
      ? Math.min(cw / img.naturalWidth, ch / img.naturalHeight)
      : Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
    const ox = (cw - w) / 2, oy = (ch - h) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, ox, oy, w, h);
    // Cover watermark in lower-right corner
    ctx.fillStyle = '#000000';
    ctx.fillRect(ox + w * 0.72, oy + h * 0.9136, w * 0.28, h * 0.0864);
  }

  function getTarget() {
    const rect     = section.getBoundingClientRect();
    const vh       = document.documentElement.clientHeight; // stable on iOS
    const total    = section.offsetHeight - vh;
    const scrolled = Math.max(0, -rect.top);
    return Math.min(scrolled / total, 1) * (frameCount - 1);
  }

  function loop() {
    const target = getTarget();
    const diff   = target - current;
    const isMob  = window.innerWidth <= 768;
    if (Math.abs(diff) > 0.05) {
      // Direct mapping on mobile (no lag on touch), smooth lerp on desktop
      current += isMob ? diff : diff * 0.18;
      drawFrame(Math.round(current));
    } else if (current !== target) {
      current = target;
      drawFrame(Math.round(current));
    }

    const p = current / (frameCount - 1); // 0 → 1

    // Slide canvas to the right (desktop only)
    if (window.innerWidth > 768) {
      canvas.style.transform = `translateY(-50%) translateX(${p * 52}vw)`;
    } else {
      canvas.style.transform = 'translate(-50%, -50%)';
    }

    // Animate mask: desktop only — mobile shows full frame without mask
    if (window.innerWidth > 768) {
      const lm   = Math.round(p * 12);
      const rm   = Math.round(75 + p * 25);
      const rt   = Math.round(90 + p * 25);
      const mask = `linear-gradient(to right, transparent 0%, black ${lm}%, black ${rm}%, transparent ${rt}%)`;
      canvas.style.webkitMaskImage = mask;
      canvas.style.maskImage       = mask;
    } else {
      canvas.style.webkitMaskImage = 'none';
      canvas.style.maskImage       = 'none';
    }

    // Fade out hero text in the first 60% of the scroll
    const textOpacity = Math.max(0, 1 - p / 0.6);
    if (heroH1)  heroH1.style.opacity  = textOpacity;
    if (heroSub) heroSub.style.opacity = textOpacity;
    if (heroCta) heroCta.style.opacity = textOpacity;

    // Fade in scroll label from top after hero text is gone
    const lblP = Math.max(0, (p - 0.6) / 0.25);
    if (heroScrollLbl) {
      const slideY = `calc(-50% + ${(1 - lblP) * -40}px)`;
      heroScrollLbl.style.opacity       = lblP;
      heroScrollLbl.style.transform     = window.innerWidth <= 768
        ? 'translate(-50%, -50%)'          // mobile: pure fade, no shift
        : `translateY(${slideY})`;          // desktop: slide in from top
      heroScrollLbl.style.pointerEvents = lblP >= 1 ? 'auto' : 'none';
    }

    requestAnimationFrame(loop);
  }

  // Load frame 1 first at high priority and draw immediately
  const firstImg = new Image();
  firstImg.fetchPriority = 'high';
  firstImg.src = 'frame_0001.png';
  firstImg.onload = () => {
    frames[0] = firstImg;
    loaded++;
    resizeCanvas();
  };
  frames[0] = firstImg;

  // Load remaining frames
  for (let i = 2; i <= frameCount; i++) {
    const img = new Image();
    img.src = 'frame_' + String(i).padStart(4, '0') + '.png';
    img.onload = () => { loaded++; };
    frames[i - 1] = img;
  }

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 200));
  resizeCanvas();
  requestAnimationFrame(loop);
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
function equalizeScrollLines() {
  const line1 = document.querySelector('.hsl-line1');
  const line2 = document.querySelector('.hsl-line2');
  if (!line1 || !line2) return;

  line1.style.letterSpacing = '';
  line2.style.letterSpacing = '';

  // Range-based measurement: accurate even when parent has opacity:0
  function textW(el) {
    const r = document.createRange();
    r.selectNodeContents(el);
    return r.getBoundingClientRect().width;
  }

  const w1   = textW(line1);
  const w2   = textW(line2);
  const diff = w1 - w2;
  if (Math.abs(diff) < 0.5) return;

  // letter-spacing L aligns last-char right edges when L = diff / (N-1)
  if (diff > 0) {
    const n = line2.textContent.trim().length;
    line2.style.letterSpacing = (diff / (n - 1)) + 'px';
  } else {
    const n = line1.textContent.trim().length;
    line1.style.letterSpacing = (Math.abs(diff) / (n - 1)) + 'px';
  }
}

function alignScrollLabelMobile() {
  if (window.innerWidth > 768) return;
  const heroH1El    = document.querySelector('.hero h1');
  const scrollLabel = document.getElementById('heroScrollLabel');
  if (!heroH1El || !scrollLabel) return;

  const h1Top     = heroH1El.getBoundingClientRect().top;
  const lblHeight = scrollLabel.getBoundingClientRect().height;
  // translate(-50%,-50%) means the element center is at `top`
  // so to align label top with h1 top: top = h1Top + lblHeight/2
  scrollLabel.style.top = (h1Top + lblHeight / 2) + 'px';
}

document.fonts.ready.then(() => {
  equalizeScrollLines();
  alignScrollLabelMobile();
  setTimeout(() => { equalizeScrollLines(); alignScrollLabelMobile(); }, 150);
});
window.addEventListener('resize', () => { equalizeScrollLines(); alignScrollLabelMobile(); });

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
