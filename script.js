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

document.querySelectorAll('.pill-nav-menu a[href^="#"]').forEach((link) => {
link.addEventListener('click', () => {
navMenu.classList.remove('open');
});
});
}

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

// 3D tilt effect on service, project and skill cards
document.querySelectorAll('.project-card, .service-card, .skill-category').forEach((card) => {
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
