/* app.js — orchestration: boots every module on DOMContentLoaded, plus scroll progress, back-to-top, and reveal-on-scroll.
   Load order in index.html: projects.js, architecture.js, navigation.js, command-palette.js, effects.js, contact.js, app.js (this file, last). */

var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", function(){
  if(typeof renderCapabilities === "function") renderCapabilities();
  if(typeof renderCaseStudies === "function") renderCaseStudies();
  if(typeof renderTimeline === "function") renderTimeline();
  if(typeof renderPrinciples === "function") renderPrinciples();
  if(typeof initNav === "function") initNav();
  if(typeof initCommandPalette === "function") initCommandPalette();
  if(typeof initArchitectureInteractions === "function") initArchitectureInteractions();
  if(typeof initHeroSequence === "function") initHeroSequence();
  if(typeof initContactForm === "function") initContactForm();
  if(typeof initHeroParticles === "function") initHeroParticles();
  if(typeof initBladeDividers === "function") initBladeDividers();
  initScrollProgress();
  initBackToTop();
  initReveal();
});

function initScrollProgress(){
  var bar = document.getElementById("scrollProgress");
  if(!bar) return;
  var ticking = false;
  window.addEventListener("scroll", function(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      var h = document.documentElement;
      var pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      bar.style.width = pct + "%";
      ticking = false;
    });
  });
}

function initBackToTop(){
  var btn = document.getElementById("backToTop");
  if(!btn) return;
  window.addEventListener("scroll", function(){
    btn.hidden = window.scrollY < 600;
  });
  btn.addEventListener("click", function(){
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
}

function initReveal(){
  var items = document.querySelectorAll(".reveal");
  if(!("IntersectionObserver" in window)){
    items.forEach(function(i){ i.classList.add("is-visible"); });
    return;
  }
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(function(i){ obs.observe(i); });
}
