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

// Contact form -> mailto
// TODO: replace the placeholder below with your real email address
const CONTACT_EMAIL = 'your-email@example.com';
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
