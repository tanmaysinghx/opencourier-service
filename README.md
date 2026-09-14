<p align="center">
  <img src="courier-logo.png" width="120" height="120" alt="OpenCourier Logo" />
</p>

<h1 align="center">OpenCourier</h1>

<p align="center">
  <strong>High-Throughput, Open-Source Enterprise Notification Platform & Template Engine.</strong><br />
  Single Runnable JAR, Portal SSO / OAuth2 OIDC native, multi-tenant isolation, 100k+ bulk email dispatch, and Angular 21 Developer Console.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-4.1.1-6DB33F?logo=springboot&logoColor=white" alt="Spring Boot 4" />
  <img src="https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white" alt="Angular 21" />
  <img src="https://img.shields.io/badge/Java-25-007396?logo=openjdk&logoColor=white" alt="Java 25" />
  <img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="License" />
</p>

---

## 🚀 Overview

**OpenCourier** is a self-hosted notification engine engineered for high-scale, multi-channel event dispatch (Email, SMS, Push, Webhooks). Designed with the simplicity of **Portal SSO**, OpenCourier boots in seconds as a standalone JAR with zero mandatory external infrastructure, while providing enterprise capabilities like distributed worker scaling, multi-tenant isolation, and rate-limited bulk dispatches.

```
opencourier-service/
├── opencourier-server/   # Spring Boot 4 — API Gateway, Thymeleaf Engine, Event Producers & Workers
├── opencourier-client/   # Angular 21 — Admin Console (Template Editor, Monitor, Analytics & SMTP Settings)
└── compose.yaml          # Full production stack (PostgreSQL, RabbitMQ, Redis, OpenCourier)
```

---

## ⚡ Key Highlights & Core Value Proposition

| Capability | Proprietary SaaS (Novu / Courier / SendGrid) | OpenCourier (Self-Hosted) |
|---|---|---|
| **Deployment Model** | Vendor SaaS / Hybrid Cloud Lock-In | 100% Self-Hosted, Single JAR or Docker |
| **Pricing & Volume** | Pay-per-message tier caps | Unlimited dispatches, 0 platform usage fees |
| **Data Privacy** | Recipient emails stored in external cloud | Strict GDPR/HIPAA compliance, fully on-prem |
| **SSO Integration** | Enterprise plan paywall ($$$) | Built-in OIDC / JWT (`portal-sso` native) |
| **SMTP / Provider Support** | Single provider or forced SaaS routing | Multi-Provider Failover & Dynamic Routing |
| **Bulk Processing** | Throttled by API subscription tier | 100,000+ batch streaming with Java 25 Virtual Threads |

---

## ⚙️ Supported Providers & Databases

### Major SMTP & Email Gateways
* **Amazon SES** (AWS SDK v2 API & SMTP TLS)
* **SendGrid** (REST API v3 & SMTP)
* **Mailgun** (v3 Domain API & SMTP)
* **Postmark** (API & SMTP)
* **Resend** & **Brevo** (Sendinblue)
* **Generic SMTP / TLS** (Custom corporate gateways, Mailpit, Mailhog)

### Major Relational Databases
* **H2 Database** (Zero-configuration embedded default)
* **PostgreSQL** (12+)
* **MySQL** (8.0+) & **MariaDB**
* **Oracle Database** (19c+)
* **Microsoft SQL Server** (2019+)

---

## 📦 Quickstart Guide

### Option 1: Standalone Single JAR (Jenkins / Portal SSO Style)

Zero configuration required. Starts on H2 with an in-memory queue:

```bash
# 1. Download the latest runnable executable
curl -LO https://github.com/tanmaysinghx/opencourier/releases/latest/download/opencourier.jar

# 2. Run on port 8081 (pointing to your Portal SSO server)
java -jar opencourier.jar --httpPort=8081 --portalSsoUrl=http://localhost:8080
```

On first boot:
1. OpenCourier initializes schema and default notification templates.
2. Auto-provisions admin credentials and writes the unlock key to `~/.opencourier/secrets/initialAdminPassword`.
3. Sign in at `http://localhost:8081`.

### Option 2: Docker Compose (Full Stack with PostgreSQL & RabbitMQ)

```bash
# 1. Clone repository
git clone https://github.com/tanmaysinghx/opencourier-service.git
cd opencourier-service

# 2. Start all services
docker compose up -d
```

Compose starts:
* `opencourier-app`: API server & worker nodes (`http://localhost:8081`)
* `opencourier-db`: PostgreSQL database (`5432`)
* `opencourier-mq`: RabbitMQ cluster (`5672` / UI `15672`)
* `opencourier-redis`: Redis rate-limiter & cache (`6379`)

---

## 🛠 Multi-Tenant SSO Claims Mapping

OpenCourier integrates seamlessly as an **OAuth2 Resource Server** compliant with standard OIDC providers like `portal-sso`.

```json
{
  "iss": "http://sso.example.com",
  "sub": "usr_948102941",
  "email": "dev-lead@acme.com",
  "tenant_id": "tenant_acme_corp",
  "roles": ["ROLE_COURIER_ADMIN", "ROLE_TENANT_ADMIN"]
}
```

* `tenant_id`: Guarantees row-level data isolation for templates, logs, and provider configurations via Hibernate `@TenantId`.
* `roles`:
  * `ROLE_COURIER_ADMIN`: Global infrastructure, provider credentials, and system diagnostics.
  * `ROLE_TENANT_ADMIN`: Multi-channel template creation, API keys, and campaign dispatch.
  * `ROLE_DEVELOPER`: API trigger execution and sandbox template testing.

---

## 🏗 High-Throughput Bulk Processing Architecture

```
[REST API / Webhooks] ──► [API Gateway & Ingestion] ──► [Virtual Thread Executor]
                                                               │
                                                               ▼
                                                      [RabbitMQ / Kafka Queue]
                                                               │
                                         ┌─────────────────────┴─────────────────────┐
                                         ▼                                           ▼
                                [Worker Pool Node 1]                        [Worker Pool Node 2]
                                (Token Bucket Rate-Limit)                 (Token Bucket Rate-Limit)
                                         │                                           │
                                         ▼                                           ▼
                                [SMTP Provider Router]                      [SMTP Provider Router]
                           (SES / SendGrid / Mailgun)                  (SES / SendGrid / Mailgun)
                                         │                                           │
                                         ├─────────────────────┬─────────────────────┤
                                         ▼                     ▼                     ▼
                                   [Success Audit]      [Retry Queue]         [Dead-Letter Queue]
```

1. **Streaming Ingestion**: 100,000+ recipient dispatches are streamed into chunks of 1,000 via reactive backpressure streams to prevent OOM errors.
2. **Rate Limiting**: Distributed Redis Token Bucket algorithm limits dispatch frequency per provider endpoint per tenant.
3. **Resilience & DLQ**: Failed deliveries undergo 5-stage exponential backoff retry before being moved to the Dead-Letter Queue (DLQ) for one-click UI replay.

---

## 💻 Angular 21 Developer Console

* **Visual & Code Template Editor**: Dual-pane editor with live HTML/Thymeleaf preview, responsive layout simulator (Mobile, Tablet, Desktop), and JSON dummy variable injector.
* **Bulk Campaign & Dispatch Monitor**: Real-time STOMP WebSocket stream tracking active jobs, throughput (msgs/sec), and queue depth.
* **Analytics & Deliverability Hub**: Interactive ECharts reporting delivery rates, open/click heatmaps, hard/soft bounces, and queue latency distributions.

---

## 📜 License

Distributed under the Apache 2.0 License. See `LICENSE` for details.
"# opencourier-service" 
