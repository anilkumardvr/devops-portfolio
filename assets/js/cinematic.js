/* cinematic.js - hero intro sequence, mission-progress nav indicator, and scene-transition reveals. Independent of app.js orchestration; self-initializes on DOMContentLoaded. */

document.addEventListener("DOMContentLoaded", function(){
initCinematicHeroIntro();
initMissionProgressNav();
initSceneTransitions();
});

function initCinematicHeroIntro(){
var overlay = document.getElementById("heroIntroOverlay");
if(!overlay) return;
var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if(reduced){ overlay.classList.add("intro-hidden"); return; }
var steps = [220, 700, 1500];
setTimeout(function(){ overlay.classList.add("intro-step-1"); }, 50);
setTimeout(function(){ overlay.classList.add("intro-step-2"); }, steps[0]);
setTimeout(function(){ overlay.classList.add("intro-done"); }, steps[1]);
setTimeout(function(){ overlay.classList.add("intro-hidden"); }, steps[2]);
}

function initMissionProgressNav(){
var countEl = document.getElementById("nmpCount");
var fillEl = document.getElementById("nmpFill");
if(!countEl || !fillEl) return;
var ids = ["about","expertise","architecture","projects","experience","principles","contact"];
var sections = ids.map(function(id){ return document.getElementById(id); }).filter(Boolean);
var total = sections.length;
if(!("IntersectionObserver" in window) || total === 0) return;
var current = 0;
function update(idx){
current = idx;
var n = idx + 1;
countEl.textContent = String(n).padStart(2,"0") + " / " + String(total).padStart(2,"0");
fillEl.style.width = Math.round((n/total)*100) + "%";
}
update(0);
var obs = new IntersectionObserver(function(entries){
entries.forEach(function(entry){
if(entry.isIntersecting){
var idx = sections.indexOf(entry.target);
if(idx > -1) update(idx);
}
});
}, {rootMargin: "-45% 0px -45% 0px"});
sections.forEach(function(s){ obs.observe(s); });
}

function initSceneTransitions(){
var dividers = document.querySelectorAll(".blade-divider");
if(dividers.length === 0) return;
if(!("IntersectionObserver" in window)){
dividers.forEach(function(d){ d.classList.add("is-swept"); });
return;
}
var obs = new IntersectionObserver(function(entries){
entries.forEach(function(entry){
if(entry.isIntersecting){
entry.target.classList.add("is-swept");
obs.unobserve(entry.target);
}
});
}, {threshold: 0.4});
dividers.forEach(function(d){ obs.observe(d); });
}
