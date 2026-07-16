const capabilities = [
  {
    "id": "cloud",
    "title": "Cloud Platforms",
    "summary": "Azure and GCP landing zones, networking, and identity that other platforms build on top of.",
    "tech": "Azure, AKS, GCP, GKE, Virtual Networks, Private Endpoints, IAM, Cloud Storage, Load Balancing",
    "responsibility": "Design landing-zone networking, identity boundaries, and storage/DR posture for workloads running on Azure and GCP.",
    "outcome": "Teams get a predictable, secured cloud foundation instead of one-off environments per project.",
    "security": "Least-privilege IAM, private endpoints over public exposure, network segmentation by environment.",
    "operational": "DR runbooks, capacity headroom checks, and clear ownership boundaries between platform and application teams."
  },
  {
    "id": "k8s",
    "title": "Kubernetes & Containers",
    "summary": "AKS/GKE cluster design, workload scheduling, and the on-prem-to-cloud migrations that make it real.",
    "tech": "Kubernetes, AKS, GKE, Docker, Helm, Operators, Persistent Storage, Ingress/Gateway API, Workload Identity",
    "responsibility": "Own cluster architecture, manifest transformation for migrations, Calico CNI networking, and pod scheduling aligned to node pools.",
    "outcome": "Workloads move from on-prem to AKS without silent breakage in storage, networking, or scheduling assumptions.",
    "security": "Pod security standards, Workload Identity instead of static credentials, namespace-level isolation.",
    "operational": "Cluster troubleshooting playbooks, upgrade strategy, and persistent storage migration validation."
  },
  {
    "id": "iac",
    "title": "Infrastructure as Code",
    "summary": "Terraform modules and Git-based workflows that make infrastructure changes reviewable, not tribal knowledge.",
    "tech": "Terraform, reusable modules, remote state, ARM templates, policy enforcement, drift detection",
    "responsibility": "Build reusable IaC modules with environment promotion paths and validation gates before apply.",
    "outcome": "Infrastructure changes go through the same review discipline as application code.",
    "security": "Policy-as-code checks pre-apply, least-privilege service principals for pipeline execution.",
    "operational": "Drift detection, remote state locking, and rollback-by-plan rather than manual edits."
  },
  {
    "id": "cicd",
    "title": "CI/CD & GitOps",
    "summary": "Pipelines and GitOps controllers that move code to production without a human clicking deploy by hand.",
    "tech": "GitHub Actions, Azure DevOps, Argo CD, reusable pipelines, blue-green and canary strategies",
    "responsibility": "Design pipeline stages, environment approvals, and progressive delivery strategies with automated rollback.",
    "outcome": "Releases are repeatable and auditable, with a defined path back out if something goes wrong.",
    "security": "Signed artifacts, environment approval gates, scoped deployment credentials via OIDC.",
    "operational": "Automated rollback triggers tied to health checks, not just manual intervention."
  },
  {
    "id": "security",
    "title": "Platform Security",
    "summary": "Secrets, identity, and supply-chain controls built into the pipeline rather than bolted on afterward.",
    "tech": "Azure Key Vault, Workload Identity, OIDC, TLS, container image scanning, SAST/DAST, policy as code",
    "responsibility": "Integrate secret management, image scanning, and least-privilege access into the delivery path itself.",
    "outcome": "Security checks happen before production, not as a post-incident retrofit.",
    "security": "Key Vault-backed secrets, Workload Identity/AAD Pod Identity in place of long-lived keys, RBAC everywhere.",
    "operational": "Regular access review, scoped service accounts, break-glass procedures for emergency access."
  },
  {
    "id": "observability",
    "title": "Observability & Reliability",
    "summary": "Metrics, logs, and alerting that tell you something is wrong before a customer does.",
    "tech": "Prometheus, Grafana, Elasticsearch, centralized logging, SLI/SLO design, incident response",
    "responsibility": "Build dashboards and alerting tied to SLIs, and run root-cause analysis when something breaks.",
    "outcome": "Issues surface through telemetry and alerting rather than through support tickets.",
    "security": "Access-controlled dashboards, log redaction for sensitive fields.",
    "operational": "Capacity planning, on-call alerting thresholds, and documented incident response steps."
  },
  {
    "id": "middleware",
    "title": "Enterprise Middleware",
    "summary": "Stateful middleware, the part of the platform that breaks quietly if persistence and HA are not handled correctly.",
    "tech": "RabbitMQ, ActiveMQ Artemis, MinIO, Couchbase, Memcached, Elasticsearch",
    "responsibility": "Deploy and secure stateful middleware on Kubernetes with persistent storage and high availability.",
    "outcome": "Middleware survives node failures and restarts without silent data loss.",
    "security": "Encrypted connectivity, credentials via Key Vault, network policies restricting east-west traffic.",
    "operational": "Persistent volume backup, HA failover testing, and secure connectivity between services."
  }
];

const archNodes = {
  "developer": {
    "title": "Developer",
    "purpose": "Where the change originates, a feature, fix, or config update.",
    "decisions": "Feature branches with required PR review before merge to main.",
    "security": "No direct commits to protected branches; signed commits where enforced.",
    "failure": "A bad change is caught at review or CI, not in production.",
    "recovery": "Revert via Git history; the trunk is always the source of truth.",
    "ownership": "Engineer authoring the change, reviewed by a peer."
  },
  "git": {
    "title": "Git Repository",
    "purpose": "Single source of truth for application and infrastructure code.",
    "decisions": "Branch protection, required reviews, and status checks before merge.",
    "security": "Repo-level RBAC, no plaintext secrets in history, secret scanning enabled.",
    "failure": "Force-push or history rewrite on a protected branch.",
    "recovery": "Branch protection blocks it by default; backups of default branch state.",
    "ownership": "Platform team owns branch policy; app teams own their code."
  },
  "ci": {
    "title": "CI Pipeline",
    "purpose": "Builds, lints, and tests every change automatically.",
    "decisions": "Reusable pipeline templates instead of copy-pasted YAML per repo.",
    "security": "Least-privilege pipeline identity; no long-lived secrets in plaintext.",
    "failure": "Flaky test or build breaks the pipeline.",
    "recovery": "Re-run with isolated retry; quarantine known-flaky tests rather than ignoring failures.",
    "ownership": "Platform team owns pipeline templates; app teams own their test suites."
  },
  "test": {
    "title": "Testing",
    "purpose": "Automated verification the change behaves as expected before it goes further.",
    "decisions": "Fail fast, unit and integration tests run before any deployment step.",
    "security": "Test environments isolated from production data.",
    "failure": "A regression slips through an untested code path.",
    "recovery": "Rollback via GitOps revert; add a regression test for the gap.",
    "ownership": "Shared between app engineers and platform test tooling."
  },
  "security": {
    "title": "Security Gates",
    "purpose": "Static analysis, dependency, and image scanning before an artifact is trusted.",
    "decisions": "Block on critical vulnerabilities; warn (not block) on lower severity to avoid pipeline gridlock.",
    "security": "SAST/DAST plus container image scanning against known CVEs.",
    "failure": "A vulnerable dependency reaches the registry.",
    "recovery": "Automated re-scan on schedule; patch and rebuild pipeline triggered on new CVE disclosure.",
    "ownership": "Platform security function, with escalation path to app teams."
  },
  "registry": {
    "title": "Container Registry",
    "purpose": "Immutable, versioned storage for built artifacts.",
    "decisions": "Images are tagged by commit SHA, not latest, for traceability.",
    "security": "Signed images, private registry, scoped pull credentials via Workload Identity.",
    "failure": "A bad image gets published.",
    "recovery": "Retag and redeploy the last known-good SHA; registry retention keeps history available.",
    "ownership": "Platform team owns registry policy and retention."
  },
  "gitops": {
    "title": "GitOps Controller",
    "purpose": "Reconciles the cluster state to match what is declared in Git, an Argo CD controller watching a manifests repo.",
    "decisions": "Declarative desired-state model; no manual kubectl apply in production.",
    "security": "Controller has scoped, audited access to the cluster; changes are traceable to a Git commit.",
    "failure": "Manifest drift between Git and live cluster state.",
    "recovery": "Controller auto-reconciles back to declared state, or a manual sync is triggered.",
    "ownership": "Platform team owns the controller; app teams own their manifests."
  },
  "k8s": {
    "title": "Kubernetes / AKS",
    "purpose": "Runs the actual workloads, scheduling, scaling, and self-healing containers.",
    "decisions": "Node pool separation by workload type; affinity/anti-affinity and taints for placement control.",
    "security": "Pod security standards, namespace isolation, Workload Identity for pod-to-Azure auth.",
    "failure": "Node failure, resource exhaustion, or a bad rollout.",
    "recovery": "Automated pod rescheduling, HPA scaling, and rollout rollback via GitOps revert.",
    "ownership": "Platform team owns cluster; app teams own workload manifests and resource requests."
  },
  "gateway": {
    "title": "Application Gateway",
    "purpose": "Routes external traffic into the cluster and terminates TLS.",
    "decisions": "Ingress/Gateway API-based routing rather than manually managed load balancer rules.",
    "security": "TLS termination, WAF rules where applicable, private endpoints for internal-only services.",
    "failure": "Misconfigured routing rule sends traffic to the wrong service or drops it.",
    "recovery": "Config is declarative and version-controlled; revert to last known-good routing config.",
    "ownership": "Platform networking function."
  },
  "services": {
    "title": "Services",
    "purpose": "The running application and middleware endpoints consumers actually talk to.",
    "decisions": "Service-level health checks gate traffic acceptance.",
    "security": "Network policies restricting east-west traffic to what is explicitly allowed.",
    "failure": "A service fails its readiness check.",
    "recovery": "Traffic is held back until healthy; automated restart on failed liveness checks.",
    "ownership": "Application teams, with platform-provided health-check conventions."
  },
  "monitoring": {
    "title": "Monitoring & Alerting",
    "purpose": "Telemetry, logs, and alerts that surface problems before customers report them.",
    "decisions": "SLI/SLO-based alerting instead of alerting on every anomaly.",
    "security": "Access-controlled dashboards; sensitive fields redacted from logs.",
    "failure": "An SLO burns down faster than expected.",
    "recovery": "Alert routes to on-call; runbook-driven triage and, if needed, rollback.",
    "ownership": "Platform reliability function, with app teams owning their service SLOs."
  },
  "terraform": {
    "title": "Terraform",
    "purpose": "Provisions the cloud infrastructure everything above runs on.",
    "decisions": "Reusable modules with remote state and environment promotion via plan review.",
    "security": "Least-privilege service principal for apply; state files encrypted at rest.",
    "failure": "An unreviewed apply introduces drift or an outage.",
    "recovery": "Plan-before-apply catches most issues; state history allows targeted rollback.",
    "ownership": "Platform team owns core modules; app teams consume them."
  },
  "vault": {
    "title": "Azure Key Vault",
    "purpose": "Central secret and certificate storage, referenced instead of hardcoded credentials.",
    "decisions": "Workload Identity/AAD Pod Identity to fetch secrets, no secrets baked into images.",
    "security": "RBAC-scoped access policies, audit logging on every secret access.",
    "failure": "A secret is rotated without updating dependent services.",
    "recovery": "Versioned secrets allow rollback to the previous value while the issue is fixed.",
    "ownership": "Platform security function."
  },
  "helm": {
    "title": "Helm",
    "purpose": "Packages Kubernetes manifests into versioned, configurable releases.",
    "decisions": "Values files per environment instead of duplicated manifest trees.",
    "security": "Chart source pinned and reviewed; no pulling arbitrary public charts into production.",
    "failure": "A bad values change ships to the wrong environment.",
    "recovery": "Helm rollback to the previous release revision.",
    "ownership": "Platform team owns chart structure; app teams own values overrides."
  },
  "observability": {
    "title": "Prometheus / Grafana",
    "purpose": "Metrics collection and visualization for cluster and application health.",
    "decisions": "Dashboards built around SLIs that matter to the business, not vanity metrics.",
    "security": "Scoped access to dashboards containing sensitive operational data.",
    "failure": "A metric silently stops reporting, masking a real problem.",
    "recovery": "Alerting on missing or stale metrics, not only on threshold breaches.",
    "ownership": "Platform reliability function."
  },
  "rollback": {
    "title": "Automated Rollback",
    "purpose": "Reverts a bad deployment without waiting for a human to notice at 2am.",
    "decisions": "Health-check-gated promotion; automatic revert if the new version fails checks.",
    "security": "Rollback path itself is version-controlled and auditable.",
    "failure": "A rollout passes health checks but fails under real load.",
    "recovery": "Manual rollback via GitOps revert as a second line of defense.",
    "ownership": "Platform team owns the rollback mechanism; app teams define health checks."
  }
};

const caseStudies = [
  {
    "tag": "Cloud Migration",
    "title": "Enterprise Azure Kubernetes Modernization",
    "summary": "Migrating on-prem Kubernetes workloads to Azure Kubernetes Service without breaking storage, networking, or scheduling assumptions.",
    "fields": {
      "Business Problem": "On-prem Kubernetes workloads needed to move to AKS as part of a broader cloud migration, without disrupting existing services.",
      "Scope & Ownership": "Owned manifest transformation, persistent storage redesign, Calico CNI networking, and pod scheduling strategy aligned to AKS node pools.",
      "Architectural Approach": "Re-mapped on-prem manifests to AKS-native constructs, redesigned persistent volume claims for Azure-managed storage, and validated networking behavior under Calico CNI on AKS.",
      "Security Model": "Workload Identity replacing static credentials, namespace isolation carried over from on-prem RBAC design.",
      "Technologies": "Kubernetes, AKS, Calico CNI, Azure Disks/Files, Helm.",
      "Challenges": "Reconciling on-prem storage class assumptions with Azure-managed disks, and validating pod scheduling behavior across new node pool boundaries.",
      "Outcome": "Workloads run on AKS with equivalent networking and storage guarantees to the on-prem environment."
    }
  },
  {
    "tag": "Platform Security",
    "title": "Secure Middleware Platform on AKS",
    "summary": "Deploying and securing RabbitMQ, ActiveMQ, MinIO, Couchbase, Memcached, and Elasticsearch as stateful platforms on Kubernetes.",
    "fields": {
      "Business Problem": "Enterprise applications depended on stateful middleware that needed to run reliably and securely inside AKS rather than on legacy VMs.",
      "Scope & Ownership": "Designed and deployed middleware services on AKS as part of a cloud migration initiative, including persistent storage and secret handling.",
      "Architectural Approach": "Containerized each middleware service with persistent volume backing, secured secrets through Azure Key Vault integration and Workload Identity.",
      "Security Model": "Key Vault-backed secrets, Workload Identity for pod-to-Azure authentication, scoped service accounts per middleware component.",
      "Technologies": "RabbitMQ, ActiveMQ Artemis, MinIO, Couchbase, Memcached, Elasticsearch, Azure Key Vault, Workload Identity.",
      "Challenges": "Ensuring high availability for stateful services that are not natively designed for frequent pod rescheduling.",
      "Outcome": "Middleware runs on AKS with secured secret handling and persistent storage instead of manual VM-based configuration."
    }
  },
  {
    "tag": "Delivery Automation",
    "title": "GitOps-Based Delivery Platform",
    "summary": "CI/CD and GitOps workflows with reusable pipeline controls and environment promotion.",
    "fields": {
      "Business Problem": "Manual, inconsistent deployment steps across environments slowed releases and increased risk.",
      "Scope & Ownership": "Built and supported CI/CD automation workflows for application deployment, environment configuration, and infrastructure management.",
      "Architectural Approach": "Standardized pipelines using GitHub Actions and Azure DevOps, with environment approval gates before production promotion.",
      "Security Model": "Scoped pipeline credentials, environment approval gates, no long-lived secrets in pipeline definitions.",
      "Technologies": "GitHub Actions, Azure DevOps, ArgoCD, Terraform.",
      "Challenges": "Standardizing pipeline templates across teams with different existing deployment habits.",
      "Outcome": "Deployments follow a consistent, auditable path across environments rather than ad hoc manual steps."
    }
  },
  {
    "tag": "Infrastructure as Code",
    "title": "Infrastructure Automation with Terraform",
    "summary": "Repeatable cloud infrastructure through reusable modules and validation before apply.",
    "fields": {
      "Business Problem": "Infrastructure changes were difficult to review or repeat consistently across environments.",
      "Scope & Ownership": "Built reusable Terraform modules and automated validation as part of infrastructure automation and cloud migration work.",
      "Architectural Approach": "Modularized common infrastructure patterns (networking, compute, storage) so environments are provisioned consistently rather than hand-built.",
      "Security Model": "Least-privilege service principals for Terraform execution; plan review required before apply.",
      "Technologies": "Terraform, ARM templates, Azure DevOps pipelines.",
      "Challenges": "Migrating existing hand-built infrastructure into managed Terraform state without downtime.",
      "Outcome": "Infrastructure changes are reviewable, repeatable, and tracked in version control instead of made manually."
    }
  },
  {
    "tag": "Reliability Engineering",
    "title": "Cloud Observability and Reliability Platform",
    "summary": "Metrics, logging, alerting, and DR practices built with Prometheus, Grafana, and Elasticsearch.",
    "fields": {
      "Business Problem": "Without centralized observability, issues were often discovered through user reports rather than proactive monitoring.",
      "Scope & Ownership": "Built observability with Prometheus, Grafana, and Elasticsearch, and implemented Velero-based backup and disaster recovery.",
      "Architectural Approach": "Centralized metrics and log collection with dashboards tied to service health, paired with scheduled Velero backups for cluster recovery.",
      "Security Model": "Access-controlled dashboards; backup data encrypted and access-scoped.",
      "Technologies": "Prometheus, Grafana, Elasticsearch, Velero.",
      "Challenges": "Defining alert thresholds that surface real problems without generating alert fatigue.",
      "Outcome": "Operational visibility and a tested backup and DR path where previously there was limited proactive monitoring."
    }
  }
];

const timelineData = [
  {
    "mission": "Platform Modernization",
    "role": "Sr. Azure Cloud Engineer",
    "company": "LTI Mindtree, Mississauga, ON",
    "date": "Sep 2023 to Present",
    "summary": "Leading end-to-end migration of on-prem Kubernetes workloads to Azure Kubernetes Service (AKS).",
    "details": "Owns manifest transformation, persistent storage redesign, Calico CNI networking, and pod scheduling strategies aligned with AKS node pools. Technical ownership spans the full migration path from on-prem cluster to production-ready AKS workloads."
  },
  {
    "mission": "Cloud Security & Reliability",
    "role": "Azure Cloud Infrastructure Engineer",
    "company": "Master Card, Bengaluru, IN",
    "date": "Feb 2021 to Aug 2023",
    "summary": "Integrated workloads with Azure VNET, load balancers, DNS and ingress; secured secrets with Key Vault and AAD Pod Identity.",
    "details": "Secured ConfigMaps, Secrets, and RBAC using Azure Key Vault and AAD Pod Identity. Built observability with Prometheus, Grafana, and Elasticsearch, and implemented Velero-based backup and disaster recovery."
  },
  {
    "mission": "Systems Administration & Monitoring",
    "role": "DevOps Engineer / Azure Engineer",
    "company": "ADP, Chennai, IN",
    "date": "Oct 2019 to Feb 2021",
    "summary": "Administered RHEL/Ubuntu Linux servers and Windows Server / IIS environments.",
    "details": "Automated cloud storage and backup processes, and monitored web and mobile application infrastructure for performance and uptime."
  },
  {
    "mission": "Infrastructure Foundations",
    "role": "Software Engineer",
    "company": "Gemini Consulting, Odisha, IN",
    "date": "Dec 2017 to Oct 2019",
    "summary": "Administered Linux/Unix servers and implemented AWS infrastructure.",
    "details": "Configured Nagios monitoring and alerting, implemented AWS infrastructure (EC2, Auto Scaling, load balancing), and maintained system security and compliance."
  }
];

const principlesData = [
  "Automate repeatable work.",
  "Design for failure, assume the node, the pod, or the pipeline will eventually fail.",
  "Security must be part of the architecture, not a step added afterward.",
  "Infrastructure should be reviewable, the same way application code is.",
  "Observability is a product requirement, not an afterthought.",
  "Developer experience matters, a platform people avoid using is not really a platform.",
  "Prefer reusable platforms over isolated, one-off solutions.",
  "Production ownership begins before deployment, not after the first incident.",
  "Reduce complexity before adding more tools.",
  "Document decisions, not only procedures."
];


/* =====================================================
   script.js — Anil Kumar Devandla portfolio
   Vanilla JS. No build step. GitHub Pages static hosting.
   Contact form has no backend: it opens a pre-filled
   mailto: link (documented in the contact section note).
   ===================================================== */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  renderCapabilities();
  renderArchitecturePanelDefault();
  renderCaseStudies();
  renderTimeline();
  renderPrinciples();
  initNav();
  initCommandPalette();
  initScrollProgress();
  initBackToTop();
  initReveal();
  initArchitectureInteractions();
  initHeroSequence();
  initContactForm();
});

/* ---------- render: capability matrix ---------- */
function renderCapabilities(){
  const grid = document.getElementById("capabilityGrid");
  if(!grid) return;
  grid.innerHTML = capabilities.map(c => `
    <details class="capability-card" data-id="${c.id}">
      <summary class="capability-head">
        <svg class="capability-icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
          <rect x="6" y="6" width="28" height="28" rx="4"/>
          <path d="M13 20h14M20 13v14"/>
        </svg>
        <span class="capability-title">${c.title}</span>
        <span class="capability-caret" aria-hidden="true">&#8250;</span>
      </summary>
      <p class="capability-summary">${c.summary}</p>
      <div class="capability-body">
        <div class="capability-row"><span class="capability-row-label">Core Technologies</span><span class="capability-row-value">${c.tech}</span></div>
        <div class="capability-row"><span class="capability-row-label">Architectural Responsibility</span><span class="capability-row-value">${c.responsibility}</span></div>
        <div class="capability-row"><span class="capability-row-label">Business Outcome</span><span class="capability-row-value">${c.outcome}</span></div>
        <div class="capability-row"><span class="capability-row-label">Security Considerations</span><span class="capability-row-value">${c.security}</span></div>
        <div class="capability-row"><span class="capability-row-label">Operational Considerations</span><span class="capability-row-value">${c.operational}</span></div>
      </div>
    </details>
  `).join("");
}

/* ---------- render: case studies ---------- */
function renderCaseStudies(){
  const list = document.getElementById("caseList");
  if(!list) return;
  list.innerHTML = caseStudies.map((c,i) => `
    <article class="case-study">
      <button class="case-header" aria-expanded="false" data-case-toggle="${i}">
        <span class="case-tag">${c.tag}</span>
        <span class="case-title">${c.title}</span>
        <span class="capability-caret" aria-hidden="true">&#8250;</span>
      </button>
      <p class="case-summary">${c.summary}</p>
      <div class="case-body" id="case-body-${i}" hidden>
        ${Object.entries(c.fields).map(([k,v]) => `<div class="case-field"><h4>${k}</h4><p>${v}</p></div>`).join("")}
      </div>
    </article>
  `).join("");
  list.querySelectorAll("[data-case-toggle]").forEach(btn => {
    btn.addEventListener("click", () => {
      const body = document.getElementById("case-body-" + btn.dataset.caseToggle);
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      body.hidden = expanded;
    });
  });
}

/* ---------- render: timeline ---------- */
function renderTimeline(){
  const el = document.getElementById("timelineList");
  if(!el) return;
  el.innerHTML = timelineData.map((t,i) => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <span class="timeline-date">${t.date}</span>
        <h3>${t.mission}</h3>
        <span class="timeline-company">${t.role} &middot; ${t.company}</span>
        <p class="timeline-summary">${t.summary}</p>
        <button class="timeline-toggle" aria-expanded="false" data-timeline-toggle="${i}">View details</button>
        <p class="timeline-details" id="timeline-details-${i}" hidden>${t.details}</p>
      </div>
    </div>
  `).join("");
  el.querySelectorAll("[data-timeline-toggle]").forEach(btn => {
    btn.addEventListener("click", () => {
      const body = document.getElementById("timeline-details-" + btn.dataset.timelineToggle);
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      body.hidden = expanded;
      btn.textContent = expanded ? "View details" : "Hide details";
    });
  });
}

/* ---------- render: principles ---------- */
function renderPrinciples(){
  const grid = document.getElementById("principlesGrid");
  if(!grid) return;
  grid.innerHTML = principlesData.map((p,i) => `
    <div class="principle-card">
      <span class="principle-num">${String(i+1).padStart(2,"0")}</span>
      <span class="principle-text">${p}</span>
    </div>
  `).join("");
}

/* ---------- architecture default panel ---------- */
function renderArchitecturePanelDefault(){
  /* placeholder already in HTML; nothing to do until a node is clicked */
}

/* ---------- nav: active section + mobile toggle ---------- */
function initNav(){
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navModules");
  if(toggle && menu){
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded","false");
    }));
  }
  const sections = document.querySelectorAll("main section[id]");
  const links = document.querySelectorAll(".nav-modules a");
  if(!("IntersectionObserver" in window) || sections.length === 0) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        links.forEach(l => l.classList.toggle("is-active", l.dataset.nav === entry.target.id));
      }
    });
  }, {rootMargin: "-45% 0px -45% 0px"});
  sections.forEach(s => obs.observe(s));
}

/* ---------- command palette ---------- */
function initCommandPalette(){
  const palette = document.getElementById("commandPalette");
  const trigger = document.getElementById("cpTrigger");
  const input = document.getElementById("cpInput");
  const results = document.getElementById("cpResults");
  if(!palette || !input || !results) return;

  const commands = [
    {label:"Go to Overview", hint:"section", action: () => scrollToId("home")},
    {label:"Go to Expertise", hint:"section", action: () => scrollToId("expertise")},
    {label:"Go to Architecture", hint:"section", action: () => scrollToId("architecture")},
    {label:"Go to Experience", hint:"section", action: () => scrollToId("experience")},
    {label:"Go to Projects", hint:"section", action: () => scrollToId("projects")},
    {label:"Go to Principles", hint:"section", action: () => scrollToId("principles")},
    {label:"Go to Contact", hint:"section", action: () => scrollToId("contact")},
    {label:"Open GitHub profile", hint:"external", action: () => window.open("https://github.com/anilkumardvr","_blank","noopener")},
    {label:"Open LinkedIn profile", hint:"external", action: () => window.open("https://www.linkedin.com/in/anilkumardevandla/","_blank","noopener")},
    {label:"Email Anil", hint:"mailto", action: () => window.location.href = "mailto:anilkumardevandla21@gmail.com"},
    {label:"Download resume (publishing soon)", hint:"disabled", action: () => {}}
  ];

  let activeIndex = -1;
  let filtered = commands;

  function scrollToId(id){
    const el = document.getElementById(id);
    if(el) el.scrollIntoView({behavior: prefersReducedMotion ? "auto" : "smooth"});
  }

  function open(){
    palette.hidden = false;
    input.value = "";
    renderResults(commands);
    activeIndex = -1;
    setTimeout(() => input.focus(), 0);
    document.addEventListener("keydown", onKeydown);
  }
  function close(){
    palette.hidden = true;
    document.removeEventListener("keydown", onKeydown);
    trigger && trigger.focus();
  }
  function renderResults(list){
    filtered = list;
    results.innerHTML = list.map((c,i) => `<li role="option" data-idx="${i}" aria-selected="${i===activeIndex}"><span>${c.label}</span><span class="cp-hint">${c.hint}</span></li>`).join("") || '<li class="cp-hint">No matches</li>';
    results.querySelectorAll("li[data-idx]").forEach(li => {
      li.addEventListener("click", () => {
        const cmd = filtered[Number(li.dataset.idx)];
        if(cmd){ cmd.action(); close(); }
      });
    });
  }
  function onKeydown(e){
    if(e.key === "Escape"){ close(); return; }
    if(e.key === "ArrowDown"){ e.preventDefault(); activeIndex = Math.min(activeIndex+1, filtered.length-1); renderResults(filtered); }
    if(e.key === "ArrowUp"){ e.preventDefault(); activeIndex = Math.max(activeIndex-1, 0); renderResults(filtered); }
    if(e.key === "Enter"){
      e.preventDefault();
      const cmd = filtered[activeIndex] || filtered[0];
      if(cmd){ cmd.action(); close(); }
    }
    if(e.key === "Tab"){
      const focusables = palette.querySelectorAll("input, li");
      if(focusables.length){ e.preventDefault(); }
    }
  }

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase();
    activeIndex = -1;
    renderResults(commands.filter(c => c.label.toLowerCase().includes(q)));
  });

  trigger && trigger.addEventListener("click", open);
  palette.querySelectorAll("[data-cp-close]").forEach(el => el.addEventListener("click", close));

  document.addEventListener("keydown", (e) => {
    const isK = e.key === "k" || e.key === "K";
    if((e.metaKey || e.ctrlKey) && isK){
      e.preventDefault();
      palette.hidden ? open() : close();
    }
  });
}

/* ---------- scroll progress ---------- */
function initScrollProgress(){
  const bar = document.getElementById("scrollProgress");
  if(!bar) return;
  let ticking = false;
  window.addEventListener("scroll", () => {
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const h = document.documentElement;
      const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      bar.style.width = pct + "%";
      ticking = false;
    });
  });
}

/* ---------- back to top ---------- */
function initBackToTop(){
  const btn = document.getElementById("backToTop");
  if(!btn) return;
  window.addEventListener("scroll", () => {
    btn.hidden = window.scrollY < 600;
  });
  btn.addEventListener("click", () => window.scrollTo({top:0, behavior: prefersReducedMotion ? "auto" : "smooth"}));
}

/* ---------- reveal on scroll ---------- */
function initReveal(){
  const items = document.querySelectorAll(".reveal");
  if(!("IntersectionObserver" in window)){
    items.forEach(i => i.classList.add("is-visible"));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, {threshold: 0.15});
  items.forEach(i => obs.observe(i));
}

/* ---------- architecture diagram interactions ---------- */
function initArchitectureInteractions(){
  const svg = document.getElementById("pipelineDiagram");
  const panel = document.getElementById("architecturePanel");
  const section = document.getElementById("architecture");
  if(!svg || !panel) return;

  svg.querySelectorAll(".arch-node").forEach(node => {
    node.setAttribute("tabindex","0");
    node.setAttribute("role","button");
    const id = node.dataset.node;
    const data = archNodes[id];
    if(data) node.setAttribute("aria-label", data.title + ": " + data.purpose);
    const activate = () => {
      svg.querySelectorAll(".arch-node").forEach(n => n.classList.remove("is-selected"));
      node.classList.add("is-selected");
      renderArchPanel(data);
    };
    node.addEventListener("click", activate);
    node.addEventListener("keydown", (e) => { if(e.key === "Enter" || e.key === " "){ e.preventDefault(); activate(); } });
  });

  function renderArchPanel(data){
    if(!data) return;
    panel.innerHTML = `
      <h3>${data.title}</h3>
      <dl>
        <dt>Purpose</dt><dd>${data.purpose}</dd>
        <dt>Design Decisions</dt><dd>${data.decisions}</dd>
        <dt>Security Controls</dt><dd>${data.security}</dd>
        <dt>Failure Scenario</dt><dd>${data.failure}</dd>
        <dt>Recovery</dt><dd>${data.recovery}</dd>
        <dt>Operational Ownership</dt><dd>${data.ownership}</dd>
      </dl>`;
  }

  if(section && "IntersectionObserver" in window){
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if(entry.isIntersecting) section.classList.add("is-live"); });
    }, {threshold:0.25});
    obs.observe(section);
  } else if(section){
    section.classList.add("is-live");
  }
}

/* ---------- hero animation sequence ---------- */
function initHeroSequence(){
  const hero = document.querySelector(".hero");
  const terminal = document.getElementById("terminalBody");
  if(!hero) return;

  const lines = [
    "$ kubectl get engineer anil",
    "NAME    ROLE                      STATUS",
    "anil    DevOps & Cloud Platform   Ready",
    "",
    "SPECIALTY   Kubernetes, Cloud, Automation",
    "UPTIME      High",
    "INCIDENTS   Under control"
  ];

  function activateHero(){
    hero.classList.add("is-live");
    const nodes = hero.querySelectorAll(".hp-node");
    nodes.forEach((n, i) => {
      setTimeout(() => n.classList.add("is-active"), prefersReducedMotion ? 0 : i * 220);
    });
  }

  function typeTerminal(){
    if(!terminal) return;
    if(prefersReducedMotion){
      terminal.textContent = lines.join("\n");
      return;
    }
    let li = 0, ci = 0;
    let out = "";
    function step(){
      if(li >= lines.length) return;
      const line = lines[li];
      if(ci <= line.length){
        out = lines.slice(0,li).join("\n") + (li>0 ? "\n" : "") + line.slice(0,ci);
        terminal.textContent = out;
        ci++;
        setTimeout(step, 14);
      } else {
        li++; ci = 0;
        setTimeout(step, 60);
      }
    }
    step();
  }

  requestAnimationFrame(() => {
    activateHero();
    setTimeout(typeTerminal, prefersReducedMotion ? 0 : 500);
  });
}

/* ---------- contact form (static site: mailto fallback) ---------- */
function initContactForm(){
  const form = document.getElementById("contactForm");
  const note = document.getElementById("formNote");
  if(!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("cfName").value.trim();
    const email = document.getElementById("cfEmail").value.trim();
    const company = document.getElementById("cfCompany").value.trim();
    const opportunity = document.getElementById("cfOpportunity").value;
    const message = document.getElementById("cfMessage").value.trim();

    if(!name || !email || !message){
      note.textContent = "Name, email, and message are required.";
      return;
    }

    const subject = encodeURIComponent("Portfolio contact: " + opportunity + " opportunity from " + name);
    const body = encodeURIComponent(
      "Name: " + name + "\n" +
      "Email: " + email + "\n" +
      "Company: " + (company || "-") + "\n" +
      "Opportunity Type: " + opportunity + "\n\n" +
      message
    );
    const mailto = "mailto:anilkumardevandla21@gmail.com?subject=" + subject + "&body=" + body;
    window.location.href = mailto;
    note.textContent = "Connection established. Message delivered without requiring a rollback.";
    form.reset();
  });
}
