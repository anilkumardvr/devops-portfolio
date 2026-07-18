/* architecture.js — "Operation: Commit to Production" delivery diagram, the secure middleware diagram, and the hero deployment-path animation.
   Two interactive SVG diagrams share the same generic activation/panel-render logic (initArchDiagram). */

var archNodes = {
  developer: { title: "Developer", purpose: "Where the change originates: a feature, fix, or config update.", decisions: "Feature branches with required PR review before merge to main.", security: "No direct commits to protected branches; signed commits where enforced.", failure: "A bad change is caught at review or CI, not in production.", recovery: "Revert via Git history; the trunk is always the source of truth.", ownership: "Engineer authoring the change, reviewed by a peer." },
  git: { title: "Git Repository", purpose: "Single source of truth for application and infrastructure code.", decisions: "Branch protection, required reviews, and status checks before merge.", security: "Repo-level RBAC, no plaintext secrets in history, secret scanning enabled.", failure: "Force-push or history rewrite on a protected branch.", recovery: "Branch protection blocks it by default; backups of default branch state.", ownership: "Platform team owns branch policy; app teams own their code." },
  ci: { title: "CI Pipeline", purpose: "Builds, lints, and tests every change automatically.", decisions: "Reusable pipeline templates instead of copy-pasted YAML per repo.", security: "Least-privilege pipeline identity; no long-lived secrets in plaintext.", failure: "A flaky test or build breaks the pipeline.", recovery: "Re-run with isolated retry; quarantine known-flaky tests rather than ignoring failures.", ownership: "Platform team owns pipeline templates; app teams own their test suites." },
  test: { title: "Testing", purpose: "Automated verification that a change behaves as expected before it goes further.", decisions: "Fail fast: unit and integration tests run before any deployment step.", security: "Test environments isolated from production data.", failure: "A regression slips through an untested code path.", recovery: "Rollback via GitOps revert; add a regression test for the gap.", ownership: "Shared between app engineers and platform test tooling." },
  security: { title: "Security Gates", purpose: "Static analysis, dependency, and image scanning before an artifact is trusted.", decisions: "Block on critical vulnerabilities; warn, not block, on lower severity to avoid pipeline gridlock.", security: "SAST/DAST plus container image scanning against known CVEs.", failure: "A vulnerable dependency reaches the registry.", recovery: "Automated re-scan on schedule; patch-and-rebuild pipeline triggered on new CVE disclosure.", ownership: "Platform security function, with escalation to app teams." },
  registry: { title: "Container Registry", purpose: "Immutable, versioned storage for built artifacts.", decisions: "Images tagged by commit SHA, not latest, for traceability.", security: "Signed images, private registry, scoped pull credentials via Workload Identity.", failure: "A bad image gets published.", recovery: "Retag and redeploy the last known-good SHA; registry retention keeps history available.", ownership: "Platform team owns registry policy and retention." },
  gitops: { title: "GitOps Controller", purpose: "Reconciles cluster state to match what is declared in Git.", decisions: "Declarative desired-state model; no manual kubectl apply in production.", security: "Controller has scoped, audited access to the cluster; changes trace back to a Git commit.", failure: "Manifest drift between Git and live cluster state.", recovery: "Controller auto-reconciles to the declared state, or a manual sync is triggered.", ownership: "Platform team owns the controller; app teams own their manifests." },
  k8s: { title: "Kubernetes / AKS", purpose: "Runs the actual workloads: scheduling, scaling, and self-healing containers.", decisions: "Node pool separation by workload type; affinity/anti-affinity and taints for placement control.", security: "Pod security standards, namespace isolation, Workload Identity for pod-to-Azure auth.", failure: "Node failure, resource exhaustion, or a bad rollout.", recovery: "Automated pod rescheduling, HPA scaling, and rollout rollback via GitOps revert.", ownership: "Platform team owns the cluster; app teams own workload manifests and resource requests." },
  gateway: { title: "Application Gateway", purpose: "Routes external traffic into the cluster and terminates TLS.", decisions: "Ingress/Gateway API-based routing rather than manually managed load balancer rules.", security: "TLS termination, WAF rules where applicable, private endpoints for internal-only services.", failure: "A misconfigured routing rule sends traffic to the wrong service or drops it.", recovery: "Config is declarative and version-controlled; revert to last known-good routing config.", ownership: "Platform networking function." },
  services: { title: "Services", purpose: "The running application and middleware endpoints consumers actually talk to.", decisions: "Service-level health checks gate traffic acceptance.", security: "Network policies restrict east-west traffic to what is explicitly allowed.", failure: "A service fails its readiness check.", recovery: "Traffic is held back until healthy; automated restart on failed liveness checks.", ownership: "Application teams, with platform-provided health-check conventions." },
  monitoring: { title: "Monitoring and Alerting", purpose: "Telemetry, logs, and alerts that surface problems before customers report them.", decisions: "SLI/SLO-based alerting instead of alerting on every anomaly.", security: "Access-controlled dashboards; sensitive fields redacted from logs.", failure: "An SLO burns down faster than expected.", recovery: "Alert routes to on-call; runbook-driven triage and, if needed, rollback.", ownership: "Platform reliability function, with app teams owning their service SLOs." },
  terraform: { title: "Terraform", purpose: "Provisions the cloud infrastructure everything above runs on.", decisions: "Reusable modules with remote state and environment promotion via plan review.", security: "Least-privilege service principal for apply; state files encrypted at rest.", failure: "An unreviewed apply introduces drift or an outage.", recovery: "Plan-before-apply catches most issues; state history allows targeted rollback.", ownership: "Platform team owns core modules; app teams consume them." },
  vault: { title: "Azure Key Vault", purpose: "Central secret and certificate storage, referenced instead of hardcoded credentials.", decisions: "Workload Identity/AAD Pod Identity to fetch secrets; no secrets baked into images.", security: "RBAC-scoped access policies, audit logging on every secret access.", failure: "A secret is rotated without updating dependent services.", recovery: "Versioned secrets allow rollback to the previous value while the issue is fixed.", ownership: "Platform security function." },
  helm: { title: "Helm", purpose: "Packages Kubernetes manifests into versioned, configurable releases.", decisions: "Values files per environment instead of duplicated manifest trees.", security: "Chart source pinned and reviewed; no pulling arbitrary public charts into production.", failure: "A bad values change ships to the wrong environment.", recovery: "Helm rollback to the previous release revision.", ownership: "Platform team owns chart structure; app teams own values overrides." },
  observability: { title: "Prometheus / Grafana", purpose: "Metrics collection and visualization for cluster and application health.", decisions: "Dashboards built around SLIs that matter to the business, not vanity metrics.", security: "Scoped access to dashboards containing sensitive operational data.", failure: "A metric silently stops reporting, masking a real problem.", recovery: "Alerting on missing or stale metrics, not only on threshold breaches.", ownership: "Platform reliability function." },
  rollback: { title: "Automated Rollback", purpose: "Reverts a bad deployment without waiting for someone to notice at 2am.", decisions: "Health-check-gated promotion; automatic revert if the new version fails checks.", security: "The rollback path itself is version-controlled and auditable.", failure: "A rollout passes health checks but fails under real load.", recovery: "Manual rollback via GitOps revert as a second line of defense.", ownership: "Platform team owns the rollback mechanism; app teams define health checks." }
};

var middlewareNodes = {
  appworkloads: { title: "Application Workloads", purpose: "Application workloads that consume messaging, caching, search, and object storage from the middleware layer.", security: "Runs under least-privilege service accounts; no embedded credentials.", persistence: "Stateless; pods can be rescheduled freely.", connectivity: "Talks to middleware only through internal Kubernetes service names, never direct pod IPs.", failure: "A workload pod crashes or is evicted.", recovery: "Kubernetes reschedules the pod automatically; no manual intervention required.", ownership: "Application teams own workload code and configuration." },
  k8sservices: { title: "Internal Kubernetes Services", purpose: "Stable network identities for stateful and stateless middleware components, split across stateless and stateful namespaces.", security: "Namespace isolation and network policies restrict which workloads can reach which services.", persistence: "Services hold no data themselves; they route to the pods backing each component.", connectivity: "ClusterIP services for internal-only components; nothing here is publicly routed.", failure: "A service's backing pods become unhealthy.", recovery: "Readiness probes remove unhealthy pods from the endpoint list until they recover.", ownership: "Platform team owns service and namespace conventions." },
  rabbitmq: { title: "RabbitMQ", purpose: "Message queue used for asynchronous communication between services.", security: "Credentials retrieved via Key Vault; TLS between clients and the broker.", persistence: "StatefulSet with persistent volumes for queue durability.", connectivity: "Internal-only; consumed through a ClusterIP service.", failure: "Broker pod restart or node failure.", recovery: "StatefulSet identity and persistent volume reattachment restore queue state on restart.", ownership: "Platform team owns the broker; application teams own queue usage." },
  activemq: { title: "ActiveMQ Artemis", purpose: "Secondary broker supporting enterprise messaging patterns alongside RabbitMQ.", security: "Same Key Vault-backed credentials and network policy restrictions as other middleware.", persistence: "StatefulSet with persistent volume for message store durability.", connectivity: "Internal-only ClusterIP service.", failure: "Broker pod failure or storage volume issue.", recovery: "Persistent volume reattachment on rescheduled pod, per a documented failover runbook.", ownership: "Platform team owns the broker; application teams own client configuration." },
  memcached: { title: "Memcached", purpose: "In-memory cache reducing repeated load on backend data stores.", security: "Internal-only network policy; no external exposure.", persistence: "Stateless by design; cache loss on restart is expected and tolerated.", connectivity: "ClusterIP service consumed by application workloads.", failure: "Cache pod restart, resulting in a cold cache.", recovery: "Application-level cache warm-up or fallback to the source-of-truth data store.", ownership: "Platform team owns deployment; application teams define keys and TTLs." },
  elasticsearch: { title: "Elasticsearch", purpose: "Search and log indexing engine used for application search and observability data.", security: "Access-controlled indices; credentials via Key Vault; network policy restricts direct access.", persistence: "StatefulSet with persistent volumes per data node.", connectivity: "Internal-only; dashboards access it through an internal API layer.", failure: "A data node fails or disk pressure occurs.", recovery: "Cluster replication and shard reallocation restore availability; backups provide a further path.", ownership: "Platform reliability function owns the cluster; application teams own index design." },
  minio: { title: "MinIO", purpose: "S3-compatible object storage for application-managed files and artifacts.", security: "Access keys stored in Key Vault; bucket policies enforce least privilege.", persistence: "Backed by persistent volumes with redundancy for durability.", connectivity: "Internal-only service; no public bucket exposure.", failure: "A storage node becomes unavailable.", recovery: "Redundant storage tolerates node loss without data loss, subject to configured redundancy.", ownership: "Platform team owns the deployment; application teams own bucket usage." },
  couchbase: { title: "Couchbase", purpose: "Document database used for workloads needing flexible schema and low-latency reads.", security: "Credentials via Key Vault; role-based access per bucket.", persistence: "StatefulSet with persistent volumes per node.", connectivity: "Internal-only ClusterIP service.", failure: "A node fails or a rebalance is interrupted.", recovery: "Cluster rebalancing and replica promotion restore full availability.", ownership: "Platform team owns cluster operations; application teams own data modeling." },
  storage: { title: "Persistent Storage", purpose: "Persistent volumes backed by Azure managed disks and Azure Files where shared access is required.", security: "Disk encryption at rest; access scoped to the owning pod's service account.", persistence: "This is the persistence layer itself, retained independently of pod lifecycle.", connectivity: "Attached to the node running the owning pod; not independently network-accessible.", failure: "A disk becomes unavailable or a node fails.", recovery: "Managed-disk reattachment on reschedule; Velero backups for full volume recovery.", ownership: "Platform team owns storage classes and backup policy." },
  keyvault: { title: "Azure Key Vault", purpose: "Central secret and certificate storage referenced instead of hardcoded credentials.", security: "RBAC-scoped access policies and audit logging on every secret access.", persistence: "Secrets are versioned; no secret data lives in the cluster itself.", connectivity: "Reached over private endpoints only, never the public Key Vault endpoint.", failure: "A secret is rotated without updating a dependent service.", recovery: "Versioned secrets allow rollback to the previous value while the issue is fixed.", ownership: "Platform security function." },
  workloadidentity: { title: "Workload Identity", purpose: "Federates Kubernetes service accounts to Azure AD identities so pods authenticate without stored credentials.", security: "Each workload gets a distinct, scoped identity rather than a shared service principal.", persistence: "No persistent state; tokens are issued per request and short-lived.", connectivity: "Uses OIDC federation between the cluster and Azure AD.", failure: "Federation misconfiguration blocks a workload from authenticating.", recovery: "Federated credential configuration is version-controlled and can be reapplied quickly.", ownership: "Platform security function." },
  secretprovider: { title: "SecretProviderClass", purpose: "Mounts Key Vault secrets as files inside the pod using the CSI secrets store driver.", security: "Secrets exist only in pod memory/volume, never baked into images or manifests.", persistence: "Mounted secrets are ephemeral and tied to the pod lifecycle.", connectivity: "Communicates with Key Vault through Workload Identity over a private endpoint.", failure: "The CSI driver fails to mount a secret at pod start.", recovery: "Pod restart retries the mount; alerting flags repeated mount failures.", ownership: "Platform security function; application teams consume the mounted files." },
  privatenet: { title: "Private Networking", purpose: "Private endpoints and private DNS keep middleware and secret traffic off the public internet.", security: "No public IP exposure for internal services; traffic stays on the virtual network.", persistence: "Not applicable; this is a networking control, not a data store.", connectivity: "Private DNS zones resolve internal service names to private IPs only.", failure: "A private DNS record is missing or misconfigured.", recovery: "DNS zone configuration is version-controlled and can be reapplied.", ownership: "Platform networking function." },
  monitoring2: { title: "Monitoring and Health Checks", purpose: "Health checks and telemetry for every middleware component, surfaced through the same observability stack as the rest of the platform.", security: "Access-controlled dashboards; sensitive fields redacted from logs.", persistence: "Metrics and logs retained per the observability stack's retention policy.", connectivity: "Scrapes internal service endpoints; no public exposure.", failure: "A middleware component fails its health check.", recovery: "Alert routes to on-call; runbook-driven triage per component.", ownership: "Platform reliability function." }
};

function initArchDiagram(svgId, panelId, dataMap, panelKind){
  var svg = document.getElementById(svgId);
  var panel = document.getElementById(panelId);
  var section = svg ? svg.closest("section") : null;
  if(!svg || !panel) return;

  var nodes = svg.querySelectorAll(".arch-node");
  for(var i=0;i<nodes.length;i++){
    (function(node){
      node.setAttribute("tabindex","0");
      node.setAttribute("role","button");
      var id = node.dataset.node;
      var data = dataMap[id];
      if(data) node.setAttribute("aria-label", data.title + ": " + data.purpose);
      function activate(){
        var all = svg.querySelectorAll(".arch-node");
        for(var j=0;j<all.length;j++){ all[j].classList.remove("is-selected"); }
        node.classList.add("is-selected");
        renderPanel(data);
      }
      node.addEventListener("click", activate);
      node.addEventListener("keydown", function(e){
        if(e.key === "Enter" || e.key === " "){ e.preventDefault(); activate(); }
      });
    })(nodes[i]);
  }

  function renderPanel(data){
    if(!data) return;
    var html = "<h3>" + data.title + "</h3><dl>";
    if(panelKind === "delivery"){
      html += "<dt>Purpose</dt><dd>" + data.purpose + "</dd>" +
        "<dt>Design Decisions</dt><dd>" + data.decisions + "</dd>" +
        "<dt>Security Controls</dt><dd>" + data.security + "</dd>" +
        "<dt>Failure Scenario</dt><dd>" + data.failure + "</dd>" +
        "<dt>Recovery</dt><dd>" + data.recovery + "</dd>" +
        "<dt>Operational Ownership</dt><dd>" + data.ownership + "</dd>";
    } else {
      html += "<dt>Purpose</dt><dd>" + data.purpose + "</dd>" +
        "<dt>Security Model</dt><dd>" + data.security + "</dd>" +
        "<dt>Persistence Model</dt><dd>" + data.persistence + "</dd>" +
        "<dt>Connectivity</dt><dd>" + data.connectivity + "</dd>" +
        "<dt>Failure Behavior</dt><dd>" + data.failure + "</dd>" +
        "<dt>Recovery Approach</dt><dd>" + data.recovery + "</dd>" +
        "<dt>Operational Ownership</dt><dd>" + data.ownership + "</dd>";
    }
    html += "</dl>";
    panel.innerHTML = html;
  }

  if(section && "IntersectionObserver" in window){
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){ if(entry.isIntersecting) section.classList.add("is-live"); });
    }, {threshold:0.2});
    obs.observe(section);
  } else if(section){
    section.classList.add("is-live");
  }
}

function initArchitectureInteractions(){
  initArchDiagram("pipelineDiagram", "architecturePanel", archNodes, "delivery");
  initArchDiagram("middlewarePipeline", "middlewarePanel", middlewareNodes, "middleware");
}

function initHeroSequence(){
  var hero = document.querySelector(".hero");
  var terminal = document.getElementById("terminalBody");
  if(!hero) return;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var lines = [
    "$ kubectl get engineer anil",
    "NAME    ROLE                     STATUS",
    "anil    DevOps & Cloud Platform  Ready",
    "",
    "SPECIALTY   Kubernetes, Cloud, Automation",
    "MISSION     Secure. Automate. Scale.",
    "UPTIME      High",
    "INCIDENTS   Under control"
  ];

  function activateHero(){
    hero.classList.add("is-live");
    var nodes = hero.querySelectorAll(".hp-node");
    for(var i=0;i<nodes.length;i++){
      (function(n, idx){
        setTimeout(function(){ n.classList.add("is-active"); }, reduced ? 0 : idx * 220);
      })(nodes[i], i);
    }
  }

  function typeTerminal(){
    if(!terminal) return;
    if(reduced){ terminal.textContent = lines.join("\n"); return; }
    var li = 0, ci = 0;
    function step(){
      if(li >= lines.length) return;
      var line = lines[li];
      if(ci <= line.length){
        terminal.textContent = lines.slice(0,li).join("\n") + (li>0 ? "\n" : "") + line.slice(0,ci);
        ci++;
        setTimeout(step, 14);
      } else {
        li++; ci = 0;
        setTimeout(step, 60);
      }
    }
    step();
  }

  requestAnimationFrame(function(){
    activateHero();
    setTimeout(typeTerminal, reduced ? 0 : 500);
  });
}
