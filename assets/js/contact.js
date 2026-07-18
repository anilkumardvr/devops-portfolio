/* contact.js — "Open a Secure Channel" contact form. No backend on GitHub Pages: builds a pre-filled mailto: link. */

function initContactForm(){
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  if(!form) return;

  form.addEventListener("submit", function(e){
    e.preventDefault();
    var name = document.getElementById("cfName").value.trim();
    var email = document.getElementById("cfEmail").value.trim();
    var company = document.getElementById("cfCompany").value.trim();
    var opportunity = document.getElementById("cfOpportunity").value;
    var message = document.getElementById("cfMessage").value.trim();

    if(!name || !email || !message){
      if(note) note.textContent = "Name, email, and message are required.";
      return;
    }

    var subject = encodeURIComponent("Portfolio contact: " + opportunity + " opportunity from " + name);
    var body = encodeURIComponent(
      "Name: " + name + "\n" +
      "Email: " + email + "\n" +
      "Company: " + (company || "-") + "\n" +
      "Opportunity Type: " + opportunity + "\n\n" +
      message
    );
    window.location.href = "mailto:anilkumardevandla21@gmail.com?subject=" + subject + "&body=" + body;
    if(note) note.textContent = "Connection prepared. No rollback required.";
    form.reset();
  });
}
