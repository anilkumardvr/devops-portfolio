/* effects.js — lightweight atmospheric ember/particle canvas for the hero, and decorative blade-cut divider SVGs.
   Pauses when off-screen, skipped entirely under prefers-reduced-motion, and runs a reduced particle count on small screens. */

function initHeroParticles(){
  var container = document.querySelector(".hero-particles");
  if(!container) return;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduced) return;

  var isSmall = window.innerWidth < 640;
  var count = isSmall ? 10 : 26;

  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  container.appendChild(canvas);
  var ctx = canvas.getContext("2d");
  if(!ctx) return;

  var running = false;
  var particles = [];
  var rafId = null;

  function resize(){
    var rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  function spawn(){
    return {
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 40,
      r: 1 + Math.random() * 2,
      speed: 0.3 + Math.random() * 0.6,
      drift: (Math.random() - 0.5) * 0.4,
      life: 0,
      maxLife: 220 + Math.random() * 200
    };
  }

  function ensureParticles(){
    while(particles.length < count){ particles.push(spawn()); }
    while(particles.length > count){ particles.pop(); }
  }

  function tick(){
    if(!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(var i=0;i<particles.length;i++){
      var p = particles[i];
      p.y -= p.speed;
      p.x += p.drift;
      p.life++;
      var fade = 1 - (p.life / p.maxLife);
      if(fade <= 0 || p.y < -10){
        particles[i] = spawn();
        continue;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,64,64," + (fade * 0.55).toFixed(2) + ")";
      ctx.fill();
    }
    rafId = requestAnimationFrame(tick);
  }

  function start(){
    if(running) return;
    running = true;
    resize();
    ensureParticles();
    rafId = requestAnimationFrame(tick);
  }

  function stop(){
    running = false;
    if(rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  window.addEventListener("resize", function(){
    isSmall = window.innerWidth < 640;
    count = isSmall ? 10 : 26;
    resize();
  });

  if("IntersectionObserver" in window){
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ start(); } else { stop(); }
      });
    }, { threshold: 0.1 });
    obs.observe(container);
  } else {
    start();
  }
}

/* Renders an abstract, original crossed-bars divider (not a weapon illustration) into any
   element carrying the .blade-divider class and a data-variant attribute. */
function initBladeDividers(){
  var dividers = document.querySelectorAll(".blade-divider");
  for(var i=0;i<dividers.length;i++){
    dividers[i].innerHTML = '<svg viewBox="0 0 200 24" preserveAspectRatio="none" aria-hidden="true">' +
      '<line x1="0" y1="20" x2="90" y2="4"></line>' +
      '<line x1="110" y1="4" x2="200" y2="20"></line>' +
      '<line class="blade-accent" x1="85" y1="12" x2="115" y2="12"></line>' +
      '</svg>';
  }
}
