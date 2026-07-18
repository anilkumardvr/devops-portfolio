/* command-palette.js — accessible command palette (Cmd/Ctrl+K), with focus trapping and Escape-to-close. */

function initCommandPalette(){
  var palette = document.getElementById("commandPalette");
  var trigger = document.getElementById("cpTrigger");
  var input = document.getElementById("cpInput");
  var results = document.getElementById("cpResults");
  if(!palette || !input || !results) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var commands = [
    { label: "Go to Overview", hint: "section", action: function(){ scrollToId("home"); } },
    { label: "Go to Engineering Profile", hint: "section", action: function(){ scrollToId("about"); } },
    { label: "Go to Platform Capabilities", hint: "section", action: function(){ scrollToId("expertise"); } },
    { label: "Open Operation: Commit to Production", hint: "section", action: function(){ scrollToId("architecture"); } },
    { label: "Go to Engineering Missions", hint: "section", action: function(){ scrollToId("projects"); } },
    { label: "Go to Mission History", hint: "section", action: function(){ scrollToId("experience"); } },
    { label: "Go to Rules of Engagement", hint: "section", action: function(){ scrollToId("principles"); } },
    { label: "Open a Secure Channel (Contact)", hint: "section", action: function(){ scrollToId("contact"); } },
    { label: "Open GitHub profile", hint: "external", action: function(){ window.open("https://github.com/anilkumardvr","_blank","noopener"); } },
    { label: "Open LinkedIn profile", hint: "external", action: function(){ window.open("https://www.linkedin.com/in/anilkumardevandla/","_blank","noopener"); } },
    { label: "Email Anil", hint: "mailto", action: function(){ window.location.href = "mailto:anilkumardevandla21@gmail.com"; } },
    { label: "Download résumé", hint: "download", action: function(){ window.open("assets/Anilkumar-D-Resume.pdf", "_blank", "noopener"); } }
  ];

  var activeIndex = -1;
  var filtered = commands;
  var lastFocused = null;

  function scrollToId(id){
    var el = document.getElementById(id);
    if(el) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }

  function getFocusable(){
    return palette.querySelectorAll('input, button, [tabindex]:not([tabindex="-1"])');
  }

  function trapFocus(e){
    if(e.key !== "Tab") return;
    var focusable = getFocusable();
    if(focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if(e.shiftKey && document.activeElement === first){
      e.preventDefault();
      last.focus();
    } else if(!e.shiftKey && document.activeElement === last){
      e.preventDefault();
      first.focus();
    }
  }

  function open(){
    lastFocused = document.activeElement;
    palette.hidden = false;
    input.value = "";
    activeIndex = -1;
    renderResults(commands);
    setTimeout(function(){ input.focus(); }, 0);
    document.addEventListener("keydown", onKeydown);
  }

  function close(){
    palette.hidden = true;
    document.removeEventListener("keydown", onKeydown);
    if(lastFocused && typeof lastFocused.focus === "function"){
      lastFocused.focus();
    } else if(trigger){
      trigger.focus();
    }
  }

  function renderResults(list){
    filtered = list;
    var html = "";
    for(var i=0;i<list.length;i++){
      html += '<li role="option" data-idx="' + i + '" aria-selected="' + (i===activeIndex) + '"><span>' + list[i].label + '</span><span class="cp-hint">' + list[i].hint + '</span></li>';
    }
    results.innerHTML = html || '<li class="cp-hint">No matches</li>';
    var items = results.querySelectorAll("li[data-idx]");
    for(var j=0;j<items.length;j++){
      items[j].addEventListener("click", function(){
        var cmd = filtered[Number(this.dataset.idx)];
        if(cmd){ cmd.action(); close(); }
      });
    }
  }

  function onKeydown(e){
    if(e.key === "Escape"){ close(); return; }
    if(e.key === "Tab"){ trapFocus(e); return; }
    if(e.key === "ArrowDown"){ e.preventDefault(); activeIndex = Math.min(activeIndex+1, filtered.length-1); renderResults(filtered); }
    if(e.key === "ArrowUp"){ e.preventDefault(); activeIndex = Math.max(activeIndex-1, 0); renderResults(filtered); }
    if(e.key === "Enter"){
      e.preventDefault();
      var cmd = filtered[activeIndex] || filtered[0];
      if(cmd){ cmd.action(); close(); }
    }
  }

  input.addEventListener("input", function(){
    var q = input.value.toLowerCase();
    activeIndex = -1;
    renderResults(commands.filter(function(c){ return c.label.toLowerCase().indexOf(q) !== -1; }));
  });

  if(trigger) trigger.addEventListener("click", open);
  var closers = palette.querySelectorAll("[data-cp-close]");
  for(var k=0;k<closers.length;k++){ closers[k].addEventListener("click", close); }

  document.addEventListener("keydown", function(e){
    var isK = e.key === "k" || e.key === "K";
    if((e.metaKey || e.ctrlKey) && isK){
      e.preventDefault();
      palette.hidden ? open() : close();
    }
  });
}
