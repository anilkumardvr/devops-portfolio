// Page loader
window.addEventListener('load', () => {
const loader = document.getElementById('pageLoader');
if (loader) {
setTimeout(() => loader.classList.add('loaded'), 400);
}
});

// Nav toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
navToggle.addEventListener('click', () => {
navMenu.classList.toggle('open');
});
}

// Sound toggle (persisted preference)
const soundToggle = document.getElementById('soundToggle');
let soundEnabled = localStorage.getItem('portfolioSound') !== 'off';
function updateSoundIcon() {
if (!soundToggle) return;
const icon = soundToggle.querySelector('.sound-icon');
if (icon) icon.textContent = soundEnabled ? '\u{1F50A}' : '\u{1F507}';
soundToggle.setAttribute('aria-pressed', String(soundEnabled));
}
updateSoundIcon();
if (soundToggle) {
soundToggle.addEventListener('click', () => {
soundEnabled = !soundEnabled;
localStorage.setItem('portfolioSound', soundEnabled ? 'on' : 'off');
updateSoundIcon();
});
}

// Synthesized section-transition sound (Web Audio API, no external audio file)
function playTransitionSound() {
if (!soundEnabled) return;
try {
const Ctx = window.AudioContext || window.webkitAudioContext;
if (!Ctx) return;
const ctx = window.__portfolioAudioCtx || (window.__portfolioAudioCtx = new Ctx());
if (ctx.state === 'suspended') ctx.resume();
const now = ctx.currentTime;

const osc = ctx.createOscillator();
const gain = ctx.createGain();
osc.type = 'sine';
osc.frequency.setValueAtTime(220, now);
osc.frequency.exponentialRampToValueAtTime(920, now + 0.16);
osc.frequency.exponentialRampToValueAtTime(150, now + 0.4);
gain.gain.setValueAtTime(0.0001, now);
gain.gain.exponentialRampToValueAtTime(0.22, now + 0.04);
gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.44);
osc.connect(gain).connect(ctx.destination);
osc.start(now);
osc.stop(now + 0.46);

const tick = ctx.createOscillator();
const tickGain = ctx.createGain();
tick.type = 'triangle';
tick.frequency.setValueAtTime(1400, now);
tickGain.gain.setValueAtTime(0.09, now);
tickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
tick.connect(tickGain).connect(ctx.destination);
tick.start(now);
tick.stop(now + 0.12);
} catch (err) {
/* Audio not available — fail silently */
}
}

// Curtain-wipe transition overlay driven by the Web Animations API
const transitionOverlay = document.getElementById('transitionOverlay');
function runSectionTransition(onCovered) {
if (!transitionOverlay) { onCovered(); return; }
const bars = transitionOverlay.querySelectorAll('span');
const stepIn = 60;
const stepOut = 50;
const durIn = 380;
const durOut = 380;
bars.forEach((bar, i) => {
bar.style.transformOrigin = 'top';
bar.animate(
[{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }],
{ duration: durIn, delay: i * stepIn, easing: 'cubic-bezier(0.77,0,0.18,1)', fill: 'forwards' }
);
});
const revealDelay = durIn + (bars.length - 1) * stepIn + 40;
setTimeout(() => {
onCovered();
bars.forEach((bar, i) => {
bar.style.transformOrigin = 'bottom';
bar.animate(
[{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }],
{ duration: durOut, delay: i * stepOut, easing: 'cubic-bezier(0.77,0,0.18,1)', fill: 'forwards' }
);
});
}, revealDelay);
}

// Nav link clicks: sound + curtain transition + scroll + arrival flash
document.querySelectorAll('.pill-nav-menu a[href^="#"], .pill-nav-name[href^="#"]').forEach((link) => {
link.addEventListener('click', (e) => {
const targetId = link.getAttribute('href');
const targetEl = document.querySelector(targetId);
if (!targetEl) return;
e.preventDefault();
if (navMenu) navMenu.classList.remove('open');
playTransitionSound();
runSectionTransition(() => {
targetEl.scrollIntoView({ behavior: 'auto', block: 'start' });
targetEl.classList.remove('section-flash');
void targetEl.offsetWidth;
targetEl.classList.add('section-flash');
setTimeout(() => targetEl.classList.remove('section-flash'), 900);
});
});
});

// Split hero tagline into words for cascading entrance animation
function splitWords(el) {
const text = el.textContent.trim();
el.innerHTML = text.split(' ').map((w, i) => '<span class="split-word" style="animation-delay:' + (0.9 + i * 0.06) + 's">' + w + '</span>').join(' ');
}
const heroTagline = document.querySelector('.hero-tagline');
if (heroTagline) {
splitWords(heroTagline);
}

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
entries.forEach((entry) => {
if (entry.isIntersecting) {
entry.target.classList.add('is-visible');
observer.unobserve(entry.target);
}
});
}, { threshold: 0.15 });
revealEls.forEach((el) => observer.observe(el));

// Timeline items stagger in as they enter the viewport
const timelineItems = document.querySelectorAll('.timeline-item');
const timelineObserver = new IntersectionObserver((entries) => {
entries.forEach((entry) => {
if (entry.isIntersecting) {
entry.target.classList.add('is-inview');
}
});
}, { threshold: 0.3 });
timelineItems.forEach((el) => timelineObserver.observe(el));

// Animated stat counters
function animateCounter(el) {
const target = parseFloat(el.dataset.target || '0');
const duration = 1400;
const start = performance.now();
function step(now) {
const p = Math.min((now - start) / duration, 1);
const eased = 1 - Math.pow(1 - p, 3);
el.textContent = Math.floor(eased * target);
if (p < 1) {
requestAnimationFrame(step);
} else {
el.textContent = String(target);
}
}
requestAnimationFrame(step);
}
const statObserver = new IntersectionObserver((entries) => {
entries.forEach((entry) => {
if (entry.isIntersecting) {
animateCounter(entry.target);
statObserver.unobserve(entry.target);
}
});
}, { threshold: 0.6 });
document.querySelectorAll('.stat-num').forEach((el) => statObserver.observe(el));

// Scroll progress bar, nav hide/show, hero parallax, active nav link, timeline progress
const progressBar = document.getElementById('scrollProgress');
const pillNav = document.getElementById('pillNav');
const heroTitle = document.querySelector('.hero-title');
const heroMeta = document.querySelector('.hero-meta');
const sections = document.querySelectorAll('section[id], header[id]');
const navLinks = document.querySelectorAll('.pill-nav-menu a[href^="#"]');
const timelineEl = document.querySelector('.timeline');
const timelineProgress = document.getElementById('timelineProgress');

let lastScroll = window.scrollY;

function updateProgress() {
const scrollTop = window.scrollY;
const docHeight = document.documentElement.scrollHeight - window.innerHeight;
const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
if (progressBar) {
progressBar.style.width = pct + '%';
}
}

function handleNavScroll() {
const current = window.scrollY;
if (pillNav) {
if (current > lastScroll && current > 120) {
pillNav.classList.add('nav-hidden');
} else {
pillNav.classList.remove('nav-hidden');
}
}
lastScroll = current;
}

function handleParallax() {
const y = window.scrollY;
if (heroTitle) {
heroTitle.style.transform = 'translateY(' + Math.min(y * 0.18, 120) + 'px)';
}
if (heroMeta) {
heroMeta.style.opacity = String(Math.max(1 - y / 250, 0));
}
}

function setActiveLink() {
let current = '';
sections.forEach((sec) => {
const rect = sec.getBoundingClientRect();
if (rect.top <= 120 && rect.bottom >= 120) {
current = sec.getAttribute('id');
}
});
navLinks.forEach((link) => {
link.classList.toggle('active', link.getAttribute('href') === '#' + current);
});
}

function updateTimelineProgress() {
if (!timelineEl || !timelineProgress) return;
const rect = timelineEl.getBoundingClientRect();
const winH = window.innerHeight;
const visible = winH * 0.6 - rect.top;
const pct = Math.min(Math.max(visible / rect.height, 0), 1) * 100;
timelineProgress.style.height = pct + '%';
}

let ticking = false;
window.addEventListener('scroll', () => {
if (!ticking) {
window.requestAnimationFrame(() => {
updateProgress();
handleNavScroll();
handleParallax();
setActiveLink();
updateTimelineProgress();
ticking = false;
});
ticking = true;
}
});

updateProgress();
handleParallax();
setActiveLink();
updateTimelineProgress();

// Cursor glow + cursor dot follow mouse with easing
const cursorGlow = document.getElementById('cursorGlow');
const cursorDot = document.getElementById('cursorDot');
let glowX = window.innerWidth / 2;
let glowY = window.innerHeight / 2;
let curX = glowX;
let curY = glowY;

window.addEventListener('mousemove', (e) => {
glowX = e.clientX;
glowY = e.clientY;
if (cursorDot) {
cursorDot.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px) translate(-50%, -50%)';
}
});

function animateGlow() {
curX += (glowX - curX) * 0.12;
curY += (glowY - curY) * 0.12;
if (cursorGlow) {
cursorGlow.style.transform = 'translate(' + curX + 'px, ' + curY + 'px) translate(-50%, -50%)';
}
requestAnimationFrame(animateGlow);
}

if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
animateGlow();
}

// Cursor glow grows on hover of interactive elements
document.querySelectorAll('a, button, .skill-tags span, .marquee-track span').forEach((el) => {
el.addEventListener('mouseenter', () => {
if (cursorGlow) cursorGlow.classList.add('cursor-glow--active');
});
el.addEventListener('mouseleave', () => {
if (cursorGlow) cursorGlow.classList.remove('cursor-glow--active');
});
});

// 3D tilt effect on service, project, skill and social cards
document.querySelectorAll('.project-card, .service-card, .skill-category, .github-card, .linkedin-card, .repo-chip').forEach((card) => {
card.addEventListener('mousemove', (e) => {
const rect = card.getBoundingClientRect();
const x = e.clientX - rect.left;
const y = e.clientY - rect.top;
const cx = rect.width / 2;
const cy = rect.height / 2;
const rotateX = ((y - cy) / cy) * -6;
const rotateY = ((x - cx) / cx) * 6;
card.style.transform = 'perspective(900px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-6px)';
});
card.addEventListener('mouseleave', () => {
card.style.transform = '';
});
});

// Magnetic hover effect on buttons and links
document.querySelectorAll('.cta-link, .contact-form button, .contact-links a').forEach((btn) => {
btn.addEventListener('mousemove', (e) => {
const rect = btn.getBoundingClientRect();
const x = e.clientX - rect.left - rect.width / 2;
const y = e.clientY - rect.top - rect.height / 2;
btn.style.transform = 'translate(' + x * 0.25 + 'px, ' + y * 0.25 + 'px)';
});
btn.addEventListener('mouseleave', () => {
btn.style.transform = '';
});
});

// Ripple effect on button and link clicks
document.querySelectorAll('.contact-form button, .cta-link, .contact-links a').forEach((btn) => {
btn.addEventListener('click', function (e) {
const ripple = document.createElement('span');
ripple.className = 'ripple';
const rect = this.getBoundingClientRect();
ripple.style.left = (e.clientX - rect.left) + 'px';
ripple.style.top = (e.clientY - rect.top) + 'px';
this.appendChild(ripple);
setTimeout(() => ripple.remove(), 650);
});
});

// Contact form -> mailto
const CONTACT_EMAIL = 'anilkumardevandla21@gmail.com';
const form = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

if (form) {
form.addEventListener('submit', (e) => {
e.preventDefault();
const name = form.name.value.trim();
const email = form.email.value.trim();
const message = form.message.value.trim();
const subject = encodeURIComponent('Portfolio inquiry from ' + name);
const body = encodeURIComponent(message + '\n\nFrom: ' + name + ' (' + email + ')');
window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
if (formNote) {
formNote.textContent = 'Opening your email client...';
}
});
}


// Highlights carousel — fancy fade + scale + directional slide transitions (fully re-synced each call, cannot get stuck)
(function () {
const carousel = document.getElementById('highlightsCarousel');
if (!carousel) return;
const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
const dots = Array.from(carousel.querySelectorAll('.carousel-dot'));
const prevBtn = document.getElementById('carouselPrev');
const nextBtn = document.getElementById('carouselNext');
let current = 0;
let autoplayTimer = null;

function render() {
slides.forEach((slide, i) => {
if (i === current) {
slide.classList.add('is-active');
slide.style.transform = '';
} else {
slide.classList.remove('is-active');
const offset = i > current ? 70 : -70;
slide.style.transform = 'scale(0.94) translateX(' + offset + 'px)';
}
});
dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
}

function goTo(index) {
current = ((index % slides.length) + slides.length) % slides.length;
render();
}
function next() { goTo(current + 1); }
function prev() { goTo(current - 1); }

function startAutoplay() {
stopAutoplay();
autoplayTimer = setInterval(next, 4500);
}
function stopAutoplay() {
if (autoplayTimer) clearInterval(autoplayTimer);
}

if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAutoplay(); });
if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });
dots.forEach((dot, i) => {
dot.addEventListener('click', () => { goTo(i); startAutoplay(); });
});

carousel.addEventListener('mouseenter', stopAutoplay);
carousel.addEventListener('mouseleave', startAutoplay);

// Swipe support
let startX = null;
carousel.addEventListener('pointerdown', (e) => { startX = e.clientX; });
carousel.addEventListener('pointerup', (e) => {
if (startX === null) return;
const dx = e.clientX - startX;
if (Math.abs(dx) > 50) {
if (dx < 0) { next(); } else { prev(); }
startAutoplay();
}
startX = null;
});

render();
startAutoplay();
})();
