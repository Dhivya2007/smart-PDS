# Smart Public Distribution System (Smart PDS) — Product Vision

## 1. Executive Summary
The Public Distribution System (PDS) is one of the world's largest social welfare logistics operations, delivering subsidized food grains and essential commodities to hundreds of millions of households. However, the traditional fair price shop model suffers from long physical queues, unpredictable stock availability, crowded counters, black marketing leakage, and lack of real-time visibility for citizens.

**Smart PDS** is an end-to-end digital queue management, ration allocation, and inventory governance system. It empowers beneficiaries to verify their household entitlement, schedule 15-minute collection windows, receive non-guessable cryptographic QR tokens, select flexible payment methods, and download authentic digital receipts. Simultaneously, it equips Fair Price Shop (FPS) owners with high-speed QR verification, automated stock decrements, and live queue telemetry, while providing state food civil supplies administrators with real-time auditability and analytics.

---

## 2. Problem Statement
1. **Prolonged Waiting Hours & Congestion**: Citizens spend hours in crowded queues outside ration shops without knowing if stock will be available when their turn arrives.
2. **Duplicate Disbursals & Ghost Allotments**: Lack of atomic validation allows unscrupulous actors to manipulate paper registers or attempt duplicate claims.
3. **Manual Stock Discrepancies**: Reconciliation between warehouse allocations, physical shop balances, and distributed quotas is delayed and error-prone.
4. **Lack of Citizen Transparency**: Beneficiaries rarely receive itemized purchase receipts with subsidy breakdowns and payment acknowledgements.
5. **Language & Accessibility Barriers**: Public portals often lack localized interface terminology, creating friction for regional rural and urban citizens.

---

## 3. Product Vision & Goals
- **Zero Queue Delays**: 15-minute slot granularity ensures a maximum of 6 citizens per slot, eliminating crowds.
- **Strict Single-Monthly-Collection Rule**: Cryptographic compound indexes guarantee that a ration card receives only one distribution per calendar month cycle.
- **Cryptographic QR Tokens**: HMAC-SHA256 tamper-proof tokens prevent forgery, token reuse, and unauthorized shop redemption.
- **Transparent Stock Reconciliation**: Atomic transactions decrement inventory instantaneously upon physical disbursal.
- **Bilingual Accessibility**: Full English and Tamil (`தமிழ்`) interface switching for seamless citizen and shop owner adoption.
- **Auditable Digital Receipts**: Instant receipt generation with timestamp, shop code, Aadhaar collector verification, and item breakdown.

---

## 4. Target Stakeholders & Personas
| Role | Persona | Key Needs |
| :--- | :--- | :--- |
| **Beneficiary** | *Karthik / Meenakshi* (Citizen Cardholder) | Convenient slot booking from home, transparent view of monthly quota (Rice, Wheat, Sugar, Kerosene, Dal), digital QR token, payment flexibility. |
| **Shop Owner** | *P. Arumugam* (FPS Manager) | High-speed camera / manual QR verification, automated stock deductions, counter cash receipt logging, clear daily queue visibility. |
| **Administrator** | *Dr. R. Balaji IAS* (Civil Supplies Officer) | Statewide distribution dashboard, Recharts consumption trends, shop capacity controls, user role management, exportable CSV audit reports. |

---

## 5. Technology Architecture
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts, HTML5-QRCode Webcam Scanner.
- **Backend**: Node.js, Express.js, JWT RBAC, Helmet, Express Rate Limit, Nodemailer.
- **Database**: MongoDB with Mongoose (Compound unique indexes, atomic updates, and schema validation).
- **Security**: Bcrypt password hashing, HMAC-SHA256 QR payload signatures, input sanitization, and role-based route guards.
