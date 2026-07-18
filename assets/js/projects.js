/* projects.js — Engineering Capability Matrix, Engineering Missions (case studies), Mission History (timeline), Rules of Engagement (principles).
   Data + render functions. Vanilla JS, no build step. All content reflects verified repository/resume information; no fabricated metrics. */

var capabilities = [
  {
    id: "cloud",
    title: "Cloud Platforms",
    summary: "Azure and GCP landing zones, networking, and identity that other platforms build on top of.",
    tech: "Azure, AKS, GCP, GKE, Virtual Networks, Private Endpoints, IAM, Cloud Storage, Load Balancing",
    responsibility: "Design landing-zone networking, identity boundaries, and storage/DR posture for workloads running on Azure and GCP.",
    outcome: "Teams get a predictable, secured cloud foundation instead of one-off environments per project.",
    security: "Least-privilege IAM, private endpoints over public exposure, network segmentation by environment.",
    operational: "DR runbooks, capacity headroom checks, and clear ownership boundaries between platform and application teams."
  },
  {
    id: "k8s",
    title: "Kubernetes and Containers",
    summary: "AKS/GKE cluster design, workload scheduling, and the on-prem-to-cloud migrations that make it real.",
    tech: "Kubernetes, AKS, GKE, Docker, Helm, StatefulSets, Operators, Persistent Storage, Gateway API, Ingress, Workload Identity",
    responsibility: "Own cluster architecture, manifest transformation for migrations, Calico CNI networking, and pod scheduling aligned to node pools.",
    outcome: "Workloads move from on-prem to AKS without silent breakage in storage, networking, or scheduling assumptions.",
    security: "Pod security standards, Workload Identity instead of static credentials, namespace-level isolation.",
    operational: "Cluster troubleshooting playbooks, upgrade strategy, and persistent storage migration validation."
  },
  {
    id: "iac",
    title: "Infrastructure as Code",
    summary: "Terraform modules and Git-based workflows that make infrastructure changes reviewable, not tribal knowledge.",
    tech: "Terraform, reusable modules, remote state, environment promotion, drift detection, policy enforcement, validation gates",
    responsibility: "Build reusable IaC modules with environment promotion paths and validation gates before apply.",
    outcome: "Infrastructure changes go through the same review discipline as application code.",
    security: "Policy-as-code checks pre-apply, least-privilege service principals for pipeline execution.",
    operational: "Drift detection, remote state locking, and rollback-by-plan rather than manual edits."
  },
  {
    id: "cicd",
    title: "CI/CD and GitOps",
    summary: "Pipelines and GitOps controllers that move code to production without a human clicking deploy by hand.",
    tech: "GitHub Actions, Azure DevOps, Argo CD, reusable workflows, deployment approvals, blue-green and canary releases",
    responsibility: "Design pipeline stages, environment approvals, and progressive delivery strategies with automated rollback.",
    outcome: "Releases are repeatable and auditable, with a defined path back out if something goes wrong.",
    security: "Signed artifacts, environment approval gates, scoped deployment credentials via OIDC, security scans before promotion.",
    operational: "Automated rollback triggers tied to health checks, not just manual intervention."
  },
  {
    id: "security",
    title: "Platform Security",
    summary: "Secrets, identity, and supply-chain controls built into the pipeline rather than bolted on afterward.",
    tech: "Azure Key Vault, Workload Identity, OIDC, TLS, container image scanning, policy as code, least privilege",
    responsibility: "Integrate secret management, image scanning, and least-privilege access into the delivery path itself.",
    outcome: "Security checks happen before production, not as a post-incident retrofit.",
    security: "Key Vault-backed secrets, Workload Identity/AAD Pod Identity in place of long-lived keys, RBAC everywhere.",
    operational: "Regular access review, scoped service accounts, break-glass procedures for emergency access."
  },
  {
    id: "observability",
    title: "Observability and Reliability",
    summary: "Metrics, logs, and alerting that tell you something is wrong before a customer does.",
    tech: "Prometheus, Grafana, Elasticsearch, centralized logging, health checks, alerting, incident response, root-cause analysis",
    responsibility: "Build dashboards and alerting tied to SLIs, and run root-cause analysis when something breaks.",
    outcome: "Issues surface through telemetry and alerting rather than through support tickets.",
    security: "Access-controlled dashboards, log redaction for sensitive fields.",
    operational: "Capacity planning, on-call alerting thresholds, and documented incident response steps."
  },
  {
    id: "middleware",
    title: "Enterprise Middleware",
    summary: "Stateful middleware, the part of the platform that breaks quietly if persistence and HA are not handled correctly.",
    tech: "RabbitMQ, ActiveMQ Artemis, MinIO, Couchbase, Memcached, Elasticsearch, persistent storage, high availability",
    responsibility: "Deploy and secure stateful middleware on Kubernetes with persistent storage and high availability.",
    outcome: "Middleware survives node failures and restarts without silent data loss.",
    security: "Encrypted connectivity, credentials via Key Vault, network policies restricting east-west traffic.",
    operational: "Persistent volume backup, HA failover testing, and secure connectivity between services."
  }
];

var caseStudies = [
  {
    tag: "Cloud Migration",
    title: "Enterprise Azure Kubernetes Modernization",
    summary: "Migrating on-prem Kubernetes workloads to Azure Kubernetes Service without breaking storage, networking, or scheduling assumptions.",
    fields: [
      ["Engineering Problem", "On-prem Kubernetes workloads needed to move to AKS as part of a broader cloud migration, without disrupting existing services."],
      ["Existing Limitations", "The on-prem cluster's manifests, storage classes, and CNI assumptions were tied to on-prem infrastructure and did not map directly onto Azure-managed services."],
      ["Scope and Responsibility", "Owned manifest transformation, persistent storage redesign, Calico CNI networking, and pod scheduling strategy aligned to AKS node pools."],
      ["Architecture", "Re-mapped on-prem manifests to AKS-native constructs, introduced node pool separation by workload type, and validated networking behavior under Calico CNI on AKS."],
      ["Technical Decisions", "Kept Calico as the CNI to reduce network-policy rewrite risk, and moved storage classes to Azure-managed disks and files instead of replicating on-prem storage."],
      ["Security Controls", "Workload Identity replacing static credentials, with namespace isolation carried over from the on-prem RBAC design."],
      ["Networking Considerations", "Validated Calico network policies against AKS networking primitives and adjusted IP address management for node pool scaling."],
      ["Storage Considerations", "Redesigned persistent volume claims to use Azure Disks and Azure Files in place of on-prem storage backends."],
      ["Reliability Strategy", "Pod scheduling aligned to node pool boundaries with affinity and anti-affinity rules to avoid resource contention during migration."],
      ["Deployment Approach", "Workloads migrated in phases by namespace and validated against on-prem behavior before cutover."],
      ["Troubleshooting Challenges", "Reconciling on-prem storage class assumptions with Azure-managed disks, and validating pod scheduling behavior across new node pool boundaries."],
      ["Outcome", "Workloads run on AKS with equivalent networking and storage guarantees to the on-prem environment."],
      ["Lessons Learned", "Migrating CNI-dependent network policies needs early validation, and storage class differences surface late if not tested per namespace."],
      ["Technologies", "Kubernetes, AKS, Calico CNI, Azure Disks, Azure Files, Helm."]
    ]
  },
  {
    tag: "Platform Security",
    title: "Secure Enterprise Middleware on AKS",
    summary: "Deploying and securing RabbitMQ, ActiveMQ Artemis, MinIO, Couchbase, Memcached, and Elasticsearch as stateful platforms on Kubernetes.",
    fields: [
      ["Engineering Problem", "Enterprise applications depended on stateful middleware that needed to run reliably and securely inside AKS rather than on legacy VMs."],
      ["Existing Limitations", "Middleware services were not natively designed for frequent pod rescheduling, and secrets were previously handled outside a centralized vault."],
      ["Scope and Responsibility", "Designed and deployed middleware services on AKS as part of a cloud migration initiative, including persistent storage and secret handling."],
      ["Architecture", "Containerized each middleware service with persistent volume backing and namespace-level isolation between stateful and stateless workloads."],
      ["Technical Decisions", "Used StatefulSets for services requiring stable network identity and storage, and standard Deployments for stateless supporting components."],
      ["Security Controls", "Key Vault-backed secrets, Workload Identity for pod-to-Azure authentication, and scoped service accounts per middleware component."],
      ["Networking Considerations", "Internal-only Kubernetes services for middleware endpoints, with ingress limited to the application layer that needs it."],
      ["Storage Considerations", "Persistent volumes backed by Azure managed disks for services requiring durable local state."],
      ["Reliability Strategy", "Health checks and readiness probes gating traffic acceptance, with documented failover behavior for each stateful component."],
      ["Deployment Approach", "Helm-based releases per middleware component, versioned independently to allow isolated upgrades."],
      ["Troubleshooting Challenges", "Ensuring high availability for stateful services that are not natively designed for frequent pod rescheduling."],
      ["Outcome", "Middleware runs on AKS with secured secret handling and persistent storage instead of manual VM-based configuration."],
      ["Lessons Learned", "Stateful workloads need explicit rescheduling and failover testing; assuming Kubernetes defaults are sufficient for HA is a common early mistake."],
      ["Technologies", "RabbitMQ, ActiveMQ Artemis, MinIO, Couchbase, Memcached, Elasticsearch, Azure Key Vault, Workload Identity."]
    ]
  },
  {
    tag: "Platform Security",
    title: "Secretless Workload Authentication",
    summary: "Removing hardcoded credentials from Kubernetes manifests using Key Vault, Workload Identity, and OIDC federation.",
    fields: [
      ["Engineering Problem", "Applications stored credentials directly in Kubernetes manifests or environment variables, creating avoidable exposure risk."],
      ["Existing Limitations", "Secret rotation required manual manifest updates and redeployments, with no consistent identity model for pod-to-Azure access."],
      ["Scope and Responsibility", "Integrated Azure Key Vault and Workload Identity into application deployments so pods retrieve secrets at runtime instead of storing them."],
      ["Architecture", "Workloads authenticate through OIDC federation to Azure AD, assume a scoped identity, and retrieve secrets through a SecretProviderClass mounted as a volume."],
      ["Technical Decisions", "Chose Workload Identity over shared service-principal credentials to give each workload a distinct, auditable identity."],
      ["Security Controls", "Least-privilege access policies per Key Vault, private endpoints for Key Vault traffic, and no plaintext credentials in manifests or images."],
      ["Networking Considerations", "Private endpoints and private DNS zones used so Key Vault traffic does not traverse the public internet."],
      ["Storage Considerations", "Secrets are not persisted to disk; they are mounted in memory through the CSI secrets store driver."],
      ["Reliability Strategy", "Secret versioning allows rollback to a previous value if a rotation breaks a dependent service."],
      ["Deployment Approach", "Rolled out namespace by namespace, validating that workloads could retrieve secrets before removing legacy credential paths."],
      ["Troubleshooting Challenges", "Coordinating secret rotation timing with dependent services that cached credentials in memory."],
      ["Outcome", "Enabled workloads to retrieve secrets without storing application credentials in Kubernetes manifests."],
      ["Lessons Learned", "Secretless authentication reduces exposure but needs clear ownership of identity and access-policy review, or scope creep happens quickly."],
      ["Technologies", "Azure Key Vault, Workload Identity, OIDC federation, SecretProviderClass, Private Endpoints, Private DNS."]
    ]
  },
  {
    tag: "Delivery Automation",
    title: "Automated Infrastructure and Delivery",
    summary: "Reusable Terraform modules and standardized CI/CD pipelines with environment promotion and security gates.",
    fields: [
      ["Engineering Problem", "Manual, inconsistent deployment steps across environments slowed releases and increased risk."],
      ["Existing Limitations", "Infrastructure changes were difficult to review or repeat consistently, and pipeline definitions were duplicated across teams."],
      ["Scope and Responsibility", "Built reusable Terraform modules and standardized CI/CD pipelines for application deployment, environment configuration, and infrastructure management."],
      ["Architecture", "Modularized common infrastructure patterns (networking, compute, storage) in Terraform, paired with GitHub Actions and Azure DevOps pipelines using environment approval gates."],
      ["Technical Decisions", "Adopted a plan-review-apply workflow for Terraform rather than direct applies, and standardized pipeline templates instead of per-team copies."],
      ["Security Controls", "Least-privilege service principals for Terraform execution and scoped pipeline credentials with no long-lived secrets in pipeline definitions."],
      ["Networking Considerations", "Infrastructure modules provisioned consistent networking, including virtual networks, subnets, and private endpoints, rather than hand-built per-project networking."],
      ["Storage Considerations", "Remote Terraform state with locking to prevent concurrent-apply conflicts."],
      ["Reliability Strategy", "Environment promotion gates and security scanning before production deployment, with rollback available through GitOps revert where applicable."],
      ["Deployment Approach", "Standardized pipelines using GitHub Actions and Azure DevOps, with environment approval gates before production promotion."],
      ["Troubleshooting Challenges", "Standardizing pipeline templates across teams with different existing deployment habits, and migrating hand-built infrastructure into managed Terraform state without downtime."],
      ["Outcome", "Deployments follow a consistent, auditable path across environments rather than ad hoc manual steps."],
      ["Lessons Learned", "Standardization succeeds faster when reusable modules solve a real pain point for teams rather than being mandated top-down."],
      ["Technologies", "Terraform, GitHub Actions, Azure DevOps, Helm, Argo CD."]
    ]
  },
  {
    tag: "Reliability Engineering",
    title: "Observability and Reliability",
    summary: "Metrics, logging, alerting, and tested disaster-recovery practices built with Prometheus, Grafana, Elasticsearch, and Velero.",
    fields: [
      ["Engineering Problem", "Without centralized observability, issues were often discovered through user reports rather than proactive monitoring."],
      ["Existing Limitations", "Metrics, logs, and backups existed in silos with no consistent alerting strategy or tested recovery path."],
      ["Scope and Responsibility", "Built observability with Prometheus, Grafana, and Elasticsearch, and implemented Velero-based backup and disaster recovery."],
      ["Architecture", "Centralized metrics and log collection with dashboards tied to service health, paired with scheduled Velero backups for cluster recovery."],
      ["Technical Decisions", "Built alerting around SLIs relevant to the business rather than alerting on every available metric, to reduce alert fatigue."],
      ["Security Controls", "Access-controlled dashboards and encrypted, access-scoped backup data."],
      ["Networking Considerations", "Metrics and log traffic scoped to internal cluster networking, with dashboard access controlled separately from data ingestion."],
      ["Storage Considerations", "Backup retention and storage sizing planned around recovery point objectives for stateful workloads."],
      ["Reliability Strategy", "Scheduled Velero backups with periodic restore testing to confirm recovery actually works, not just that a backup file exists."],
      ["Deployment Approach", "Rolled out observability tooling cluster-wide before enforcing SLO-based alerting per service."],
      ["Troubleshooting Challenges", "Defining alert thresholds that surface real problems without generating alert fatigue."],
      ["Outcome", "Operational visibility and a tested backup and DR path where previously there was limited proactive monitoring."],
      ["Lessons Learned", "A backup strategy is only as good as its last successful restore test."],
      ["Technologies", "Prometheus, Grafana, Elasticsearch, Velero."]
    ]
  }
];

var timelineData = [
  {
    mission: "Platform Modernization",
    role: "Sr. Azure Cloud Engineer",
    company: "LTI Mindtree, Mississauga, ON",
    date: "Sep 2023 to Present",
    summary: "Leading end-to-end migration of on-prem Kubernetes workloads to Azure Kubernetes Service (AKS).",
    details: "Owns manifest transformation, persistent storage redesign, Calico CNI networking, and pod scheduling strategies aligned with AKS node pools. Technical ownership spans the full migration path from on-prem cluster to production-ready AKS workloads, including collaboration with application teams on cutover planning."
  },
  {
    mission: "Cloud Security and Reliability",
    role: "Azure Cloud Infrastructure Engineer",
    company: "Master Card, Bengaluru, IN",
    date: "Feb 2021 to Aug 2023",
    summary: "Integrated workloads with Azure VNET, load balancers, DNS and ingress; secured secrets with Key Vault and AAD Pod Identity.",
    details: "Secured ConfigMaps, Secrets, and RBAC using Azure Key Vault and AAD Pod Identity. Built observability with Prometheus, Grafana, and Elasticsearch, and implemented Velero-based backup and disaster recovery, including restore testing."
  },
  {
    mission: "Systems Administration and Monitoring",
    role: "DevOps Engineer / Azure Engineer",
    company: "ADP, Chennai, IN",
    date: "Oct 2019 to Feb 2021",
    summary: "Administered RHEL/Ubuntu Linux servers and Windows Server / IIS environments.",
    details: "Automated cloud storage and backup processes, and monitored web and mobile application infrastructure for performance and uptime across mixed Linux and Windows environments."
  },
  {
    mission: "Infrastructure Foundations",
    role: "Software Engineer",
    company: "Gemini Consulting, Odisha, IN",
    date: "Dec 2017 to Oct 2019",
    summary: "Administered Linux/Unix servers and implemented AWS infrastructure.",
    details: "Configured Nagios monitoring and alerting, implemented AWS infrastructure (EC2, Auto Scaling, load balancing), and maintained system security and compliance for production servers."
  }
];

var principlesData = [
  "Automate repeatable work.",
  "Design for failure, assume the node, the pod, or the pipeline will eventually fail.",
  "Build security into the architecture, not as a step added afterward.",
  "Make infrastructure reviewable, the same way application code is.",
  "Treat observability as a product requirement, not an afterthought.",
  "Improve developer experience, a platform people avoid using is not really a platform.",
  "Prefer reusable platforms over isolated, one-off solutions.",
  "Establish production ownership before deployment, not after the first incident.",
  "Reduce complexity before adding more tools.",
  "Document decisions, not only procedures."
];

function renderCapabilities(){
  var grid = document.getElementById("capabilityGrid");
  if(!grid) return;
  var html = "";
  for(var i=0;i<capabilities.length;i++){
    var c = capabilities[i];
    html += '<details class="capability-card" data-id="' + c.id + '">' +
      '<summary class="capability-head">' +
      '<svg class="capability-icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
      '<rect x="6" y="6" width="28" height="28" rx="4"/><path d="M13 20h14M20 13v14"/></svg>' +
      '<span class="capability-title">' + c.title + '</span>' +
      '<span class="capability-caret" aria-hidden="true">&#8250;</span>' +
      '</summary>' +
      '<p class="capability-summary">' + c.summary + '</p>' +
      '<div class="capability-body">' +
      '<div class="capability-row"><span class="capability-row-label">Core Technologies</span><span class="capability-row-value">' + c.tech + '</span></div>' +
      '<div class="capability-row"><span class="capability-row-label">Architectural Responsibility</span><span class="capability-row-value">' + c.responsibility + '</span></div>' +
      '<div class="capability-row"><span class="capability-row-label">Business Outcome</span><span class="capability-row-value">' + c.outcome + '</span></div>' +
      '<div class="capability-row"><span class="capability-row-label">Security Considerations</span><span class="capability-row-value">' + c.security + '</span></div>' +
      '<div class="capability-row"><span class="capability-row-label">Operational Considerations</span><span class="capability-row-value">' + c.operational + '</span></div>' +
      '</div></details>';
  }
  grid.innerHTML = html;
}

function renderCaseStudies(){
  var list = document.getElementById("caseList");
  if(!list) return;
  var html = "";
  for(var i=0;i<caseStudies.length;i++){
    var c = caseStudies[i];
    var fieldsHtml = "";
    for(var j=0;j<c.fields.length;j++){
      fieldsHtml += '<div class="case-field"><h4>' + c.fields[j][0] + '</h4><p>' + c.fields[j][1] + '</p></div>';
    }
    html += '<article class="case-study">' +
      '<button class="case-header" aria-expanded="false" data-case-toggle="' + i + '">' +
      '<span class="case-tag">' + c.tag + '</span>' +
      '<span class="case-title">' + c.title + '</span>' +
      '<span class="capability-caret" aria-hidden="true">&#8250;</span>' +
      '</button>' +
      '<p class="case-summary">' + c.summary + '</p>' +
      '<div class="case-body" id="case-body-' + i + '" hidden>' + fieldsHtml + '</div>' +
      '</article>';
  }
  list.innerHTML = html;
  var toggles = list.querySelectorAll("[data-case-toggle]");
  for(var k=0;k<toggles.length;k++){
    toggles[k].addEventListener("click", function(){
      var body = document.getElementById("case-body-" + this.dataset.caseToggle);
      var expanded = this.getAttribute("aria-expanded") === "true";
      this.setAttribute("aria-expanded", String(!expanded));
      body.hidden = expanded;
    });
  }
}

function renderTimeline(){
  var el = document.getElementById("timelineList");
  if(!el) return;
  var html = "";
  for(var i=0;i<timelineData.length;i++){
    var t = timelineData[i];
    html += '<div class="timeline-item">' +
      '<div class="timeline-dot"></div>' +
      '<div class="timeline-content">' +
      '<span class="timeline-date">' + t.date + '</span>' +
      '<h3>' + t.mission + '</h3>' +
      '<span class="timeline-company">' + t.role + ' &middot; ' + t.company + '</span>' +
      '<p class="timeline-summary">' + t.summary + '</p>' +
      '<button class="timeline-toggle" aria-expanded="false" data-timeline-toggle="' + i + '">View details</button>' +
      '<p class="timeline-details" id="timeline-details-' + i + '" hidden>' + t.details + '</p>' +
      '</div></div>';
  }
  el.innerHTML = html;
  var toggles = el.querySelectorAll("[data-timeline-toggle]");
  for(var k=0;k<toggles.length;k++){
    toggles[k].addEventListener("click", function(){
      var body = document.getElementById("timeline-details-" + this.dataset.timelineToggle);
      var expanded = this.getAttribute("aria-expanded") === "true";
      this.setAttribute("aria-expanded", String(!expanded));
      body.hidden = expanded;
      this.textContent = expanded ? "View details" : "Hide details";
    });
  }
}

function renderPrinciples(){
  var grid = document.getElementById("principlesGrid");
  if(!grid) return;
  var html = "";
  for(var i=0;i<principlesData.length;i++){
    html += '<div class="principle-card"><span class="principle-num">' + String(i+1).padStart(2,"0") + '</span><span class="principle-text">' + principlesData[i] + '</span></div>';
  }
  grid.innerHTML = html;
}
