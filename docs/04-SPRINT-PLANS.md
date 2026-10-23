# Smart PDS — Four Sprint Agile Plans

The development was executed in four 2-week iterations (total 8 weeks) following the Scrum framework.

```
Sprint 1: Architecture, Data Models & Core RBAC (Weeks 1-2)
    ↓
Sprint 2: Slot Scheduling Engine, Concurrency & QR Token System (Weeks 3-4)
    ↓
Sprint 3: Payment Abstraction, Shop Verification & Distribution (Weeks 5-6)
    ↓
Sprint 4: Admin Analytics, Bilingual UI, E2E Testing & Hardening (Weeks 7-8)
```

---

## Sprint 1: Architecture, Data Models & Core RBAC (Weeks 1-2)
- **Sprint Goal**: Establish foundational MERN architecture, secure JWT role-based authentication, and complete household ration card schemas with seed data.
- **Velocity Target**: 26 Story Points
- **Committed Backlog Items**:
  - `PB-01`: User Auth & JWT RBAC (Beneficiary, Shop Owner, Admin).
  - `PB-02`: Ration Card & Fair Price Shop Mongoose Schemas.
  - `PB-13`: In-App Notification Service & Data Model.
  - Database seed script with AAY, PHH, NPHH cards, fictional shops, and default credentials.
- **Key Deliverables**:
  - Express server boilerplate with Helmet, CORS, and centralized error handler.
  - Password hashing with Bcrypt (salt rounds: 10).
  - Seed script populating initial Chennai district FPS locations and cardholders.

---

## Sprint 2: Slot Scheduling Engine, Concurrency & QR Tokens (Weeks 3-4)
- **Sprint Goal**: Implement 15-minute slot reservation engine, prevent double-bookings, and build cryptographic QR token generation.
- **Velocity Target**: 29 Story Points
- **Committed Backlog Items**:
  - `PB-03`: 15-Minute Dynamic Slot Generation (09:00 - 18:00 excluding lunch).
  - `PB-04`: Single Collection Per Month Rule & Concurrency Protection via compound partial indexes.
  - `PB-05`: Cryptographic HMAC-SHA256 QR Token Generator.
  - Client-side interactive SlotPicker and Smart Ration Card UI.
- **Key Deliverables**:
  - Slot availability API returning real-time capacity per interval.
  - High-resolution base64 QR code generator with downloadable image capability.
  - Active booking card widget on beneficiary dashboard.

---

## Sprint 3: Payment Abstraction, Shop Verification & Distribution (Weeks 5-6)
- **Sprint Goal**: Develop payment service abstraction with mock online gateway, HTML5-QRCode webcam scanner, and atomic disbursal transactions.
- **Velocity Target**: 31 Story Points
- **Committed Backlog Items**:
  - `PB-06`: Payment Abstraction & Mock Gateway (Success, Failure, Retry simulations).
  - `PB-07`: QR Scanner (Webcam + Manual code input) and Disbursal Workflow.
  - `PB-08`: Digital Receipts with Printable CSS and History Tracking.
  - `PB-09`: Shop Stock Inventory Management with low-stock alerts and replenishment modal.
- **Key Deliverables**:
  - Shop Owner verification console with instant eligibility preview.
  - Atomic stock deductions and duplicate distribution rejection.
  - Printable official digital receipt acknowledging collector Aadhaar and subsidized costs.

---

## Sprint 4: Admin Analytics, Bilingual UI, E2E Testing & Hardening (Weeks 7-8)
- **Sprint Goal**: Build statewide administrative portal with Recharts telemetry, integrate English/Tamil bilingual engine, execute automated test suite, and finalize documentation.
- **Velocity Target**: 29 Story Points
- **Committed Backlog Items**:
  - `PB-10`: Statewide Analytics Dashboard with Recharts (Line, Bar, and Pie charts).
  - `PB-11`: User and Shop Governance Portals.
  - `PB-12`: Full English and Tamil (`தமிழ்`) bilingual switching.
  - `PB-14`: CSV distribution report export.
  - Automated Node.js integration test suite (18 test scenarios).
- **Key Deliverables**:
  - 100% passing automated test suite covering all critical business rules.
  - Complete Agile documentation package in `docs/`.
  - Production-ready full-stack application suitable for college project demonstration.
