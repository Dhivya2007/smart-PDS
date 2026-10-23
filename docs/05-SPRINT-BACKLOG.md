# Smart PDS — Detailed Sprint Backlog

This document maps user stories and engineering tasks across the sprint cycles.

### Sprint 1 Backlog: Core Foundations & Authentication
| Task ID | Task Description | Owner | Status |
| :--- | :--- | :--- | :--- |
| **TSK-101** | Initialize Git repository, server structure, and package configurations. | Backend Lead | Done |
| **TSK-102** | Configure Mongoose connection with automatic indexing. | Database Eng | Done |
| **TSK-103** | Implement `User` model with Bcrypt pre-save hook and role enum. | Backend Eng | Done |
| **TSK-104** | Implement `RationCard` model with household member schemas and entitlement fields. | Backend Eng | Done |
| **TSK-105** | Build JWT authentication middleware and role-based authorization guards. | Security Eng | Done |
| **TSK-106** | Develop `authController` (register, login, getMe) and route bindings. | Backend Eng | Done |
| **TSK-107** | Write database seed script with AAY, PHH, NPHH cards and test users. | Backend Eng | Done |

---

### Sprint 2 Backlog: Slot Scheduling & QR Cryptography
| Task ID | Task Description | Owner | Status |
| :--- | :--- | :--- | :--- |
| **TSK-201** | Develop `slotService.js` to compute 15-minute intervals between 09:00 - 18:00. | Backend Eng | Done |
| **TSK-202** | Implement atomic slot capacity check and concurrency lock. | Database Eng | Done |
| **TSK-203** | Create `Booking` model with partial unique index `{ rationCardId: 1, monthCycle: 1 }`. | Database Eng | Done |
| **TSK-204** | Develop `qrService.js` with HMAC-SHA256 signature and `qrcode` data URL generation. | Security Eng | Done |
| **TSK-205** | Build React `SlotPicker` component with real-time spot countdowns. | Frontend Eng | Done |
| **TSK-206** | Build `QueueTokenCard` with downloadable PNG QR and countdown view. | Frontend Eng | Done |

---

### Sprint 3 Backlog: Payments, Shop Operations & Disbursal
| Task ID | Task Description | Owner | Status |
| :--- | :--- | :--- | :--- |
| **TSK-301** | Build `paymentService.js` abstraction and development Mock Gateway. | Backend Eng | Done |
| **TSK-302** | Build `PaymentModal` with Success, Failure, and Timeout simulation modes. | Frontend Eng | Done |
| **TSK-303** | Implement `html5-qrcode` webcam integration and manual token fallback. | Frontend Eng | Done |
| **TSK-304** | Implement `verifyToken` endpoint checking shop ownership and cycle eligibility. | Backend Eng | Done |
| **TSK-305** | Implement `confirmDistribution` with atomic stock deductions and receipt creation. | Backend Eng | Done |
| **TSK-306** | Build printable `ReceiptModal` with print stylesheet. | Frontend Eng | Done |
| **TSK-307** | Build `StockManagementPage` and `StockUpdateModal` with restock audit history. | Full Stack Eng | Done |

---

### Sprint 4 Backlog: Admin Analytics, Localization & Hardening
| Task ID | Task Description | Owner | Status |
| :--- | :--- | :--- | :--- |
| **TSK-401** | Implement `adminController.js` aggregation pipelines for charts and KPI metrics. | Database Eng | Done |
| **TSK-402** | Build `AnalyticsCharts` using Recharts (Line, Bar, and Pie components). | Frontend Eng | Done |
| **TSK-403** | Implement English and Tamil (`தமிழ்`) translation dictionaries and context switch. | Frontend Eng | Done |
| **TSK-404** | Implement User and Shop management screens with search and status toggles. | Frontend Eng | Done |
| **TSK-405** | Build CSV telemetry export functionality. | Frontend Eng | Done |
| **TSK-406** | Author and execute automated Node.js integration test suite (18 assertions). | QA Lead | Done |
| **TSK-407** | Compile Agile documentation suite in `docs/` and root `README.md`. | Tech Writer | Done |
