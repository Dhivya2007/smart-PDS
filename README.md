# Smart Public Distribution System (Smart PDS)
### Full-Stack Queue Management, QR Token & Ration Allocation Platform

A modern, production-grade web application engineered to eliminate physical queues, prevent black marketing, guarantee fair allocation, and digitize food grain distribution across Fair Price Shops (FPS).

---

## 1. System Overview & Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts (Visual Analytics), Lucide Icons, HTML5-QRCode (Webcam QR Scanner), Bilingual Localization Engine (English & Tamil).
- **Backend**: Node.js, Express.js (REST APIs, Modular Architecture), Helmet, Express Rate Limit, Nodemailer.
- **Database**: MongoDB with Mongoose (Compound unique indexes, atomic updates, schema validations).
- **Authentication & Security**: JWT with Bcrypt password hashing (10 salt rounds), HMAC-SHA256 tamper-proof QR signatures, Role-Based Access Control (RBAC).
- **Payment Abstraction**: Pluggable Payment Service with Development Mock Gateway (testing Success, Card Decline, and Network Glitches) + Cash at Counter reconciliation.
- **Agile Engineering**: Complete Scrum documentation package in `docs/` with 4 Sprint plans, product backlog, user stories, and test plans.

---

## 2. User Roles & Pre-Seeded Test Credentials

The database comes pre-seeded with realistic Indian PDS households, fair price shops, commodities stock, and users.

| Role | Name | Email | Password | Linked Entity / Details |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Dr. R. Balaji IAS | `admin@smartpds.gov.in` | `Admin@123` | Statewide Governance & Analytics |
| **Shop Owner 1** | P. Arumugam | `owner.anna@smartpds.gov.in` | `Shop@123` | Anna Nagar FPS (`FPS-TN-04-001`) |
| **Shop Owner 2** | V. Senthil Nathan | `owner.tmgmt@smartpds.gov.in` | `Shop@123` | T. Nagar Co-op FPS (`FPS-TN-04-002`) |
| **Beneficiary 1 (PHH)** | Karthik Ramachandran | `karthik.pds@gmail.com` | `Citizen@123` | Card `330410293847` (Active Token ready) |
| **Beneficiary 2 (AAY)** | Meenakshi Murugan | `meena.pds@gmail.com` | `Citizen@123` | Card `330420384719` (35kg Rice Entitlement) |
| **Beneficiary 3 (NPHH)** | Anand Natarajan | `anand.pds@gmail.com` | `Citizen@123` | Card `330430472819` (Has past receipt) |

> **Unlinked 12-Digit Test Card for Fresh Registration**:
> - Card Number: `330499887766`
> - Head of Family: Suresh Kumar
> - Head Aadhaar Last 4: `1234`

---

## 3. Directory Structure

```
smart-pds/
├── client/                      # React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Navbar, Footer, ProtectedRoute, StatusBadge
│   │   │   ├── beneficiary/     # RationCardCard, SlotPicker, QueueTokenCard, PaymentModal, ReceiptModal
│   │   │   ├── shop/            # TokenScanner (Webcam/Manual), DistributionForm, StockUpdateModal
│   │   │   └── admin/           # StatsCards, AnalyticsCharts
│   │   ├── context/             # AuthContext, LanguageContext (EN/TA), NotificationContext
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx  # Citizen portal homepage & instant card lookup
│   │   │   ├── LoginPage.jsx    # Multi-role login with 1-click quick-fill demo buttons
│   │   │   ├── RegisterPage.jsx # Registration for Citizens & Shop Owners
│   │   │   ├── beneficiary/     # Dashboard, BookSlot, MyBookings, PurchaseHistory, VerifyCard
│   │   │   ├── shop/            # ShopDashboard, VerifyDistribute, StockManagement
│   │   │   └── admin/           # AdminDashboard, ManageUsers, ManageShops, Reports
│   │   ├── services/            # Axios API wrappers
│   │   └── translations/        # English (`en.json`) and Tamil (`ta.json`)
├── server/                      # Node.js + Express REST API Backend
│   ├── src/
│   │   ├── config/              # MongoDB connection & JWT config
│   │   ├── controllers/         # Auth, RationCard, Shop, Booking, Payment, Distribution, Stock, Admin
│   │   ├── middleware/          # JWT Auth, Role RBAC, Rate Limiter, Error Handler
│   │   ├── models/              # User, RationCard, Shop, Booking, QueueToken, Payment, Stock, DistributionRecord, Notification
│   │   ├── routes/              # Express REST routes mounted under `/api/`
│   │   ├── services/            # Slot Engine, QR Token Generator, Payment Mock Gateway, Notification Service
│   │   └── utils/               # Database seed script
│   └── tests/                   # Automated Node.js integration test suite
├── docs/                        # Complete Agile Engineering Documentation
│   ├── 01-PRODUCT-VISION.md
│   ├── 02-PRODUCT-BACKLOG.md
│   ├── 03-USER-STORIES.md
│   ├── 04-SPRINT-PLANS.md
│   ├── 05-SPRINT-BACKLOG.md
│   ├── 06-TEST-PLAN-AND-CASES.md
│   ├── 07-DEFINITION-OF-DONE.md
│   └── 08-SPRINT-REVIEW-RETROSPECTIVE.md
└── README.md
```

---

## 4. Setup & Running Instructions

### Prerequisites
- **Node.js**: v18+ (tested on v22.18.0)
- **MongoDB**: Local MongoDB instance running on port 27017 or MongoDB Atlas URI

### Step 1: Backend Setup & Database Seeding
```bash
# 1. Navigate to server folder
cd smart-pds/server

# 2. Install server dependencies
npm install

# 3. Seed database with realistic PDS shops, cards, stock, and users
npm run seed

# 4. Start backend server (Runs on http://localhost:5000)
npm start
# (or for development auto-restart: npm run dev)
```

### Step 2: Running Automated Integration Tests
```bash
cd smart-pds/server
npm test
```
*Executes all 18 test scenarios covering authentication, card verification, slot availability, duplicate prevention, payment simulation, QR verification, and stock decrements.*

### Step 3: Frontend Setup & Launch
```bash
# In a new terminal window:
cd smart-pds/client

# Install frontend dependencies
npm install

# Start Vite development server (Runs on http://localhost:5173)
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 5. Required Environment Variables

### Server (`smart-pds/server/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/smart_pds
JWT_SECRET=smart_pds_jwt_super_secret_key_change_in_production_2026
JWT_EXPIRES_IN=7d
QR_SECRET=smart_pds_qr_token_hmac_secret_2026
PAYMENT_GATEWAY_MODE=mock
PAYMENT_MERCHANT_KEY=mock_pds_merchant_key
PAYMENT_WEBHOOK_SECRET=mock_webhook_secret_key
EMAIL_FROM=no-reply@smartpds.gov.in
```

---

## 6. Key Business Rules & Architectural Guarantees

1. **Strict 15-Minute Slot Capacity**: Slots are partitioned into 15-minute intervals (e.g. `09:00 - 09:15`, `09:15 - 09:30`). The backend evaluates remaining capacity dynamically, rejecting overbookings.
2. **Single Monthly Collection Enforcement**: A household ration card is restricted to exactly **one successful collection per monthly cycle**. Both database compound unique indexes and business controllers prevent multiple active bookings or duplicate distributions.
3. **Tamper-Proof QR Codes**: Tokens are generated with cryptographically signed HMAC payloads (`PDS-TKN-YYYYMM-XXXXXXXX`). The shop owner scanner decodes and verifies the signature, rejecting cross-shop or already-used tokens.
4. **Atomic Disbursal & Stock Reconciliation**: Disbursal updates the booking to `DISTRIBUTED`, marks the token `USED`, updates the ration card `lastCollectedMonth`, generates a `DistributionRecord`, and decrements commodity inventory atomically.
5. **Flexible Payment Abstraction**: Supports both Cash at Counter (confirmed by shop owner) and an interactive Mock Payment Gateway (simulating Success, Card Decline, and Network Timeout).
6. **Bilingual Citizen Access**: Instant English / Tamil (`தமிழ்`) interface switching across navigation, buttons, status indicators, and notification labels.

---

## 7. Automated Test Results

- **Test Suite**: Node.js Native Test Engine (`node --test tests/*.test.js`)
- **Total Tests**: 18
- **Passed**: 18
- **Failed**: 0
- **Pass Rate**: 100%

All critical flows verified:
- Login and role authorization (Admin, Shop Owner, Beneficiary)
- Ration card verification and Aadhaar digit validation
- 15-minute slot generation and capacity bounds
- Rejection of duplicate monthly bookings
- Mock payment gateway failure and success simulations
- QR token verification and cross-shop rejection
- Atomic distribution, stock decrement, and receipt issuance
- Prevention of duplicate distribution
- Role-based route guard enforcement

---

## 8. College Project Demonstration Guide

1. **Beneficiary Flow**:
   - Log in using `karthik.pds@gmail.com` / `Citizen@123` (or click the quick-fill button on the login screen).
   - View your Smart Ration Card with monthly entitlement (Rice, Wheat, Sugar, Kerosene, Dal).
   - View your active 15-minute queue token and QR code. Click "Pay Subsidized Amount" to test the Mock Payment Gateway.
   - Click "Book Slot" to test slot picking for next month or test with a new citizen registration using unlinked card `TN-04-99887766`.
2. **Shop Owner Flow**:
   - Log in using `owner.anna@smartpds.gov.in` / `Shop@123`.
   - Go to "Verify & Distribute". Enter the token code (e.g. `PDS-TKN-202610-5936BFC8`) or scan with webcam.
   - Verify household members, confirm cash payment, and click "Confirm & Distribute Ration".
   - Notice the instant printable official receipt and automatic stock deduction.
   - Try verifying the same token again: the system blocks duplicate distribution!
   - Check "Stock Inventory" to view updated balances and test the "Replenish Stock" modal.
3. **Administrator Flow**:
   - Log in using `admin@smartpds.gov.in` / `Admin@123`.
   - View statewide metrics, 7-day distribution trend line chart, monthly commodity volume bar chart, and card category pie chart.
   - Check "Manage Users" to toggle citizen/shop status.
   - Check "Fair Price Shops" to edit 15-minute slot capacity or add a new shop.
   - Check "Analytics Reports" and click "Export CSV Report".
