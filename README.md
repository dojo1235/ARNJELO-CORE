<p align="center">
  <a href="https://www.arnjelo.com" target="_blank" rel="noopener noreferrer">
    <img src="https://www.arnjelo.com/preview.png" width="100%" alt="Arnjelo Core Banner" style="border-radius: 12px;" />
  </a>
</p>

<p align="center">
  <a href="https://nestjs.com/" target="_blank" rel="noopener noreferrer">
    <img src="https://nestjs.com/img/logo-small.svg" width="100" alt="NestJS Logo" />
  </a>
</p>

<h1 align="center">ARNJELO-CORE 🏛️📱</h1>

<p align="center">
  <strong>Production-grade NestJS multi-tenant commerce starter framework engineered to run natively on mobile hardware.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v20+-green.svg" alt="Node Version" />
  <img src="https://img.shields.io/badge/NestJS-v11-red.svg" alt="NestJS Version" />
  <img src="https://img.shields.io/badge/TypeScript-5.0+-blue.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Database-MariaDB%20%2F%20MySQL-orange.svg" alt="Database" />
  <img src="https://img.shields.io/badge/Platform-Termux%20%28Android%29-black.svg" alt="Platform" />
  <img src="https://img.shields.io/badge/License-MIT-purple.svg" alt="License" />
</p>

---

<p align="center">
  <a href="https://youtu.be/i-55Ricxexo?si=IRuCSP80A5iJ-19B" target="_blank" rel="noopener noreferrer">
    <img src="https://img.youtube.com/vi/i-55Ricxexo/maxresdefault.jpg" width="100%" alt="Written on a phone !== not prod." style="border-radius: 12px; border: 1px solid #30363d;" />
  </a>
</p>

<p align="center">
  <a href="https://youtu.be/i-55Ricxexo?si=IRuCSP80A5iJ-19B" target="_blank" rel="noopener noreferrer">
    <strong>▶ Watch Full Video: Can You Build Backend on an Android Phone? (18 min)</strong>
  </a>
</p>

---

`ARNJELO-CORE` is a high-assurance, zero-compromise backend foundation. It provides enterprise architecture patterns, strict tenant isolation, cryptographic session management, and pre-wired cloud infrastructure, built and tested entirely on Android hardware.

---

## ⚡ Key Architectural Highlights

- **📱 Mobile-Native Execution:** Runs 100% locally on Android via Termux + Node.js + MariaDB/MySQL.
- **🏢 Multi-Tenant Context:** Isolated store boundaries, custom tenant context injection, and strict store scoping.
- **🛡️ Auth & RBAC:** Single-use rotating refresh tokens, cryptographic session family revocation, password hashing, and role guards.
- **📦 Clean Architecture:** Decoupled repository patterns with zero raw ORM leakage into business services.
- **⚡ Fail-Fast Validation:** Zod environment schema validation at bootstrap + global class-validator DTO transformation pipelines.
- **📖 Interactive OpenAPI / Swagger:** Auto-generated API documentation accessible on your mobile browser at `http://localhost:5000/api`.
- **☁️ Pre-Wired Infrastructure Adapters:**
  - **Storage:** Cloudflare R2 (S3-compatible API) for zero-egress asset storage.
  - **Email:** Resend API integration for transactional emails.
  - **Security:** Multi-tier rate limiting via `@nestjs/throttler` and global exception filters.

---

## 📂 Architecture Overview

```text
ARNJELO-CORE/
├── src/
│   ├── config/          # Type-safe Zod env validation & TypeORM async configs
│   ├── database/        # Base repository & custom snake_case naming strategy
│   ├── common/          # Global decorators, guards, filters, and interceptors
│   ├── storage/         # Cloudflare R2 object storage service
│   ├── email/           # Resend transactional email service
│   ├── auth/            # Authentication & cryptographic token rotation
│   ├── users/           # User lifecycle & RBAC domain
│   ├── stores/          # Multi-tenant store provisioning & context
│   └── feedback/        # User feedback & audit domain
```

---

## 🚀 Quick Start on Android (Termux) in 3 Minutes

Follow these exact steps to run `ARNJELO-CORE` locally on your Android phone:

### 1. Download & Install Dependencies in Termux
> Get Termux from [F-Droid](https://f-droid.org/en/packages/com.termux/) or GitHub releases for the latest Android builds.

```bash
termux-setup-storage
pkg update && pkg upgrade -y
pkg install nodejs mariadb git -y
```

### 2. Clone the Repository (Tab 1)
```bash
mkdir -p ~/projects && cd ~/projects
git clone https://github.com/dojo1235/ARNJELO-CORE.git
cd ARNJELO-CORE
```

### 3. Setup Environment & Install Packages (Tab 1)
```bash
cp .env.example .env
npm install
```

### 4. Start MariaDB & Create Database (On a New Tab)
Swipe from the left edge in Termux to open a **New Session / Tab 2**, then run:
```bash
# Start MariaDB daemon in the background
mariadbd-safe &

# Open MariaDB interactive shell
mariadb -u root

# Create the local database
CREATE DATABASE arnjelo_core_db;

# Switch to the database (Keep this tab alive)
USE arnjelo_core_db;
```

### 5. Launch NestJS Server (Switch back to Tab 1)
Switch back to your first Termux tab (**Tab 1**) and launch the server:
```bash
npm run start:dev
```

### 6. Open Swagger on Mobile Browser
Open Chrome, Brave, or your preferred browser on your phone and navigate to:
```text
http://localhost:5000/api
```

---

## 🛡️ Authentication & Session Management Specs

This core implements an enterprise-grade authentication model mirroring managed identity providers (Auth0, Okta):

- **Access Tokens:** Short-lived (15m expiry), signed JWTs for stateless endpoint validation.
- **Refresh Tokens:** Long-lived (7d expiry), stored securely as hashes in the database per device/session.
- **Single-Use Rotation:** Every token refresh revokes the previous token and issues a fresh pair (prevents replay attacks).
- **Per-Device Revocation:** Users can log out of a single mobile/web session without invalidating others.
- **Global Revocation (Logout All):** Instantly revokes all active session families across all devices.
- **Strict Verification:** Refresh tokens must match active DB records with matching hash signatures.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (via Termux on Android)
- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** MariaDB / MySQL
- **ORM:** TypeORM
- **Validation:** Zod & Class-Validator
- **Docs:** OpenAPI / Swagger

---

## 👤 Author

**BRIGGS DIVINE TOBIN**  
- **GitHub:** [@dojo1235](https://github.com/dojo1235)

---

## 📄 License

MIT License. Free to use, study, and build upon.
