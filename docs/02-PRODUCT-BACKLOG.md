# Smart PDS — Product Backlog with Priorities

The product backlog is prioritized using the **MoSCoW Method** (Must Have, Should Have, Could Have, Won't Have this release) and estimated in Story Points (Fibonacci scale).

| ID | Feature / Epic | Description | Priority | Story Points | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PB-01** | User Authentication & RBAC | JWT auth, bcrypt password hashing, role enforcement (Beneficiary, Shop Owner, Admin). | MUST | 5 | **Completed** |
| **PB-02** | Ration Card Schema & Linking | Household schema (AAY, PHH, NPHH), member arrays, Aadhaar verification, linked shop. | MUST | 8 | **Completed** |
| **PB-03** | 15-Minute Slot Engine | Dynamic slot generation (09:00 - 18:00) with atomic capacity checks (max 6/slot). | MUST | 8 | **Completed** |
| **PB-04** | Single Collection Per Month | Database constraints preventing double booking and double distribution per cycle. | MUST | 5 | **Completed** |
| **PB-05** | Cryptographic QR Token Engine | Non-guessable token code with HMAC-SHA256 signature and base64 QR generation. | MUST | 8 | **Completed** |
| **PB-06** | Payment Service Abstraction | Mock Payment Gateway (Success/Decline/Network Error test scenarios) + Cash at counter. | MUST | 5 | **Completed** |
| **PB-07** | QR Scanner & Disbursal Workflow | Webcam QR scanning + manual fallback, commodity check, atomic stock deduction. | MUST | 13 | **Completed** |
| **PB-08** | Digital Receipts & History | Itemized receipt with print styling, monthly cycle, collector Aadhaar, and unique receipt ID. | MUST | 5 | **Completed** |
| **PB-09** | Shop Stock Management | Live inventory view, low-stock alerts (<15%), restock modal, and delivery audit log. | MUST | 5 | **Completed** |
| **PB-10** | Statewide Admin Analytics | Recharts visualizations (daily distribution, commodity volume, card categories). | MUST | 8 | **Completed** |
| **PB-11** | User & Shop Governance | Admin management of Fair Price Shops, slot capacities, hours, and user activation. | MUST | 5 | **Completed** |
| **PB-12** | Bilingual Engine (EN / TA) | English and Tamil (`தமிழ்`) interface switching across all user journeys. | SHOULD | 5 | **Completed** |
| **PB-13** | In-App Notification System | Real-time notifications for booking, payment confirmation, disbursal, and system alerts. | SHOULD | 3 | **Completed** |
| **PB-14** | CSV Telemetry Export | Statewide distribution audit log export in standard CSV format. | SHOULD | 3 | **Completed** |
| **PB-15** | SMS Gateway Integration | Real SMS dispatch via DLT-approved telecom provider (architected for Twilio/CDAC). | COULD | 5 | Future Phase |
| **PB-16** | Biometric Iris / Fingerprint POS | Direct USB biometric sensor driver integration via WebUSB / Android OTG. | COULD | 8 | Future Phase |
| **PB-17** | Multilingual Speech Synthesis | Text-to-speech announcement of queue numbers in Tamil and English at the shop counter. | WON'T | 8 | Backlog |
