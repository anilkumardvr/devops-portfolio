/* navigation.js — sticky tactical nav: mobile toggle + active-section tracking (IntersectionObserver). */

function initNav(){
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navModules");
  if(toggle && menu){
    toggle.addEventListener("click", function(){
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    var links = menu.querySelectorAll("a");
    for(var i=0;i<links.length;i++){
      links[i].addEventListener("click", function(){
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded","false");
      });
    }
  }

  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".nav-modules a");
  if(!("IntersectionObserver" in window) || sections.length === 0) return;

  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        for(var i=0;i<navLinks.length;i++){
          navLinks[i].classList.toggle("is-active", navLinks[i].dataset.nav === entry.target.id);
        }
      }
    });
  }, {rootMargin: "-45% 0px -45% 0px"});

  sections.forEach(function(s){ obs.observe(s); });
}
