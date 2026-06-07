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
  const frameCount = 219; // frame_0001.png – frame_0219.png
  const frames     = new Array(frameCount);
  let   loaded     = 0;
  let   current    = 0;

  const heroH1        = section.querySelector('h1');
  const heroSub       = section.querySelector('.hero-sub');
  const heroCta       = section.querySelector('.hero-cta');
  const heroScrollLbl = document.getElementById('heroScrollLabel');
  const heroViralLbl  = document.getElementById('heroViralLabel');

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
      ? Math.min(cw / img.naturalWidth, ch / img.naturalHeight) * 0.9
      : Math.max(cw / img.naturalWidth, ch / img.naturalHeight) * 0.9;
    const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
    const ox = (cw - w) / 2, oy = (ch - h) / 2 - ch * 0.05;
    ctx.clearRect(0, 0, cw, ch);
    ctx.filter = index <= 73 ? 'brightness(1.15)' : 'none';
    ctx.drawImage(img, ox, oy, w, h);
    ctx.filter = 'none';
    // Cover watermark in lower-right corner
    ctx.fillStyle = '#000000';
    const rectW = index >= 169 ? w * 0.13 : w * 0.14;
    ctx.fillRect(ox + w * (1 - rectW / w), oy + h * 0.88, rectW, h * 0.12);
  }

  function getTarget() {
    const rect     = section.getBoundingClientRect();
    const vh       = window.innerWidth <= 768
      ? document.documentElement.clientHeight  // stable on iOS
      : window.innerHeight;                    // reliable on desktop
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

    // p over phases 1+2 (frames 0-145); clamped at 1 during phase 3
    const p12  = Math.min(current / 145, 1);
    // Phase 3 starts exactly when Math.round(current) first hits 146 (frame_0001c)
    const inP3 = current >= 145.5;
    // q3: 0 at frame_0001c (index 146) → 1 at frame_0073c (index 218)
    const q3   = inP3 ? Math.min(Math.max(0, (current - 146) / 72), 1) : 0;

    // Desktop: pan right (phases 1+2) then back left (phase 3)
    if (window.innerWidth > 768) {
      const slideX = inP3 ? (1 - q3) * 52 : p12 * 52;
      canvas.style.transform = `translateY(-50%) translateX(${slideX}vw)`;

      const qMask = inP3 ? (1 - q3) : p12;
      const lm   = Math.round(qMask * 12);
      const rm   = Math.round(75 + qMask * 25);
      const rt   = Math.round(90 + qMask * 25);
      const mask = `linear-gradient(to right, transparent 0%, black ${lm}%, black ${rm}%, transparent ${rt}%)`;
      canvas.style.webkitMaskImage = mask;
      canvas.style.maskImage       = mask;
    } else {
      canvas.style.transform       = 'translate(-50%, -50%)';
      canvas.style.webkitMaskImage = 'none';
      canvas.style.maskImage       = 'none';
    }

    // Hero text: fade out in first 60% of phases 1+2
    const textOpacity = Math.max(0, 1 - p12 / 0.51);
    if (heroH1)  heroH1.style.opacity  = textOpacity;
    if (heroSub) heroSub.style.opacity = textOpacity;
    if (heroCta) heroCta.style.opacity = textOpacity;

    // Scroll label: fade in during phases 1+2, fade out during phase 3
    const lblIn = Math.max(0, (p12 - 0.6) / 0.25);
    if (heroScrollLbl) {
      const lblOpacity = inP3 ? Math.max(0, 1 - Math.max(0, current - 151) / 57) : lblIn;
      const slideY     = `calc(-50% + ${(1 - lblIn) * -40}px)`;
      heroScrollLbl.style.opacity       = lblOpacity;
      heroScrollLbl.style.transform     = window.innerWidth <= 768
        ? 'translate(-50%, -50%)'
        : inP3 ? 'translateY(-50%)' : `translateY(${slideY})`;
      heroScrollLbl.style.pointerEvents = (lblIn >= 1 && !inP3) ? 'auto' : 'none';
    }

    // Viral label: fades in over 34 frames (151→185), stays visible until end
    if (heroViralLbl) {
      const viralP = Math.max(0, Math.min(1, (current - 151) / 29));
      heroViralLbl.style.opacity       = viralP;
      heroViralLbl.style.transform     = window.innerWidth <= 768
        ? 'translate(-50%, -50%)'
        : 'translateY(-50%)';
      heroViralLbl.style.pointerEvents = viralP >= 1 ? 'auto' : 'none';
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

  // Load remaining frames 2-219 (indices 1-218)
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

  // ---- Two-stage scroll snap ----
  // Stage 0 = frame 0 (hero), Stage 1 = frame 123 (NLM), Stage 2 = frame 180 (viral)
  const snapFrames = [0, 145, 218];
  let stageIdx  = 0;
  let inTransit = false;

  function goToStage(idx) {
    if (idx < 0 || idx >= snapFrames.length || inTransit) return;
    stageIdx  = idx;
    inTransit = true;
    const vh    = window.innerWidth <= 768
      ? document.documentElement.clientHeight : window.innerHeight;
    const total = section.offsetHeight - vh;
    window.scrollTo({
      top: section.offsetTop + (snapFrames[idx] / (frameCount - 1)) * total,
      behavior: 'smooth'
    });
    setTimeout(() => { inTransit = false; }, 1100);
  }

  // Desktop: one scroll gesture advances exactly one stage.
  // Trackpads fire many events per gesture — only the first of a new gesture counts.
  let lastWheelTime = 0;
  window.addEventListener('wheel', (e) => {
    if (window.innerWidth <= 768) return;
    const rect      = section.getBoundingClientRect();
    const goingDown = e.deltaY > 0;
    if (rect.top > 0) return;                       // above section — don't intercept
    if (rect.bottom <= window.innerHeight) return;  // below section — don't intercept
    // At last stage scrolling down → release to section end
    if (stageIdx >= snapFrames.length - 1 && goingDown) return;
    // At first stage scrolling up → release above section
    if (stageIdx <= 0 && !goingDown) return;
    e.preventDefault();
    if (inTransit) return;
    const now = Date.now();
    if (now - lastWheelTime < 350) return;          // same gesture — ignore
    lastWheelTime = now;
    if (goingDown) goToStage(stageIdx + 1);
    else           goToStage(stageIdx - 1);
  }, { passive: false });

  // Mobile: debounce snap to nearest stage after scroll ends
  let mobSnapTid  = null;
  let mobSnapping = false;
  window.addEventListener('scroll', () => {
    if (window.innerWidth > 768 || mobSnapping) return;
    clearTimeout(mobSnapTid);
    mobSnapTid = setTimeout(() => {
      const rect = section.getBoundingClientRect();
      if (rect.top > 10) return;
      const t = getTarget();
      if (t > snapFrames[snapFrames.length - 1] + 15) return;
      const nearest = snapFrames.reduce((a, b) =>
        Math.abs(b - t) < Math.abs(a - t) ? b : a);
      if (Math.abs(nearest - t) < 1.5) return;
      stageIdx    = snapFrames.indexOf(nearest);
      mobSnapping = true;
      const vh    = document.documentElement.clientHeight;
      const total = section.offsetHeight - vh;
      window.scrollTo({
        top: section.offsetTop + (nearest / (frameCount - 1)) * total,
        behavior: 'smooth'
      });
      setTimeout(() => { mobSnapping = false; }, 800);
    }, 200);
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
  const scrollLabel = document.getElementById('heroScrollLabel');
  if (!scrollLabel) return;

  if (window.innerWidth > 768) {
    scrollLabel.style.top = ''; // clear any leftover mobile inline style
    return;
  }

  const heroH1El = document.querySelector('.hero h1');
  if (!heroH1El) return;

  const h1Top     = heroH1El.getBoundingClientRect().top;
  const lblHeight = scrollLabel.getBoundingClientRect().height;
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
