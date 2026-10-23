# Smart Public Distribution System (Smart PDS)

### Full-Stack Queue Management, QR Token & Ration Allocation Platform

Smart PDS is a full-stack web application designed to digitize the Public Distribution System (PDS). It helps beneficiaries book ration collection slots, reduces physical queues, supports QR-based token verification, and enables Fair Price Shop (FPS) owners to manage stock and distribution records.

The platform also provides administrative analytics and bilingual access in English and Tamil.

## 1. Project Objectives

- Reduce waiting time at Fair Price Shops through scheduled collection slots.
- Improve transparency in ration allocation and distribution.
- Prevent duplicate monthly collections through application-level and database validation.
- Support secure QR-based queue token verification.
- Maintain inventory and distribution records.
- Provide role-based access for beneficiaries, shop owners, and administrators.
- Make the citizen interface accessible in English and Tamil.

## 2. Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Charts and icons | Recharts, Lucide Icons |
| QR scanning | HTML5-QRCode |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| Security | Helmet, Express Rate Limit, role-based access control |
| Notifications | Nodemailer |
| Payment simulation | Mock Payment Gateway, Cash at Counter |
| Project management | Agile Scrum, Sprint Planning, Product Backlog, User Stories |
| Testing | Node.js Native Test Runner |

## 3. User Roles

### Beneficiary
- Access a ration card dashboard.
- View ration entitlements and collection information.
- Book available ration collection slots.
- View queue tokens and QR codes.
- View bookings, payment information, and receipts.

### Fair Price Shop Owner
- Verify beneficiary details and queue tokens.
- Scan QR codes or enter tokens manually.
- Confirm ration distribution.
- Manage commodity inventory and stock replenishment.
- View distribution records and receipts.

### Administrator
- Monitor distribution statistics and analytics.
- Manage users and Fair Price Shops.
- Configure shop and slot-related settings.
- View reports and export supported data.

## 4. Key Features

- **Slot booking:** 15-minute collection intervals with capacity validation.
- **Monthly collection validation:** Prevents duplicate successful collections within a monthly cycle.
- **QR token verification:** Uses HMAC-SHA256 signatures to help detect token tampering.
- **Inventory management:** Tracks commodity stock and distribution updates.
- **Payment simulation:** Supports mock payment outcomes and cash-at-counter workflows.
- **Bilingual interface:** English and Tamil localization.
- **Role-based authorization:** Restricts operations according to user roles.
- **Analytics dashboard:** Displays distribution trends and commodity statistics.
- **Agile documentation:** Includes product vision, backlogs, user stories, sprint plans, and testing documentation.

## 5. System Architecture

The application follows a client-server architecture.

1. **Frontend:** React provides the user interface and communicates with the backend through REST APIs.
2. **Backend:** Express.js processes requests, authenticates users, validates business rules, and manages application workflows.
3. **Database:** MongoDB stores users, ration cards, shops, bookings, tokens, payments, stock, and distribution records.
4. **Security layer:** JWT authentication, role-based authorization, password hashing, request rate limiting, and signed QR tokens protect application operations.

## 6. Project Structure

```text
smart-pds/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── translations/
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   └── package.json
├── docs/
│   ├── 01-PRODUCT-VISION.md
│   ├── 02-PRODUCT-BACKLOG.md
│   ├── 03-USER-STORIES.md
│   ├── 04-SPRINT-PLANS.md
│   ├── 05-SPRINT-BACKLOG.md
│   ├── 06-TEST-PLAN-AND-CASES.md
│   ├── 07-DEFINITION-OF-DONE.md
│   └── 08-SPRINT-REVIEW-RETROSPECTIVE.md
├── .gitignore
└── README.md
```

## 7. Prerequisites

Install the following before running the project:

- Node.js 18 or later.
- npm.
- MongoDB local installation or a MongoDB Atlas database.
- Git.
- A modern web browser.

## 8. Installation and Setup

### Step 1: Clone the repository

```bash
git clone https://github.com/Dhivya2007/smart-PDS
cd smart-pds
```

Replace the placeholder with the actual repository URL.

### Step 2: Configure the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory using the environment variables required by your backend.

Example configuration:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_secure_random_secret
JWT_EXPIRES_IN=7d
QR_SECRET=replace_with_a_separate_secure_secret
PAYMENT_GATEWAY_MODE=mock
PAYMENT_MERCHANT_KEY=your_development_placeholder
PAYMENT_WEBHOOK_SECRET=your_development_placeholder
EMAIL_FROM=your_configured_sender_address
```

**Security note:** This is a template only. Use private values in your local `.env` file or deployment environment settings. Never commit actual credentials or secrets to GitHub.

### Step 3: Seed the database

If the project includes the configured seed script, run:

```bash
npm run seed
```

Use this only with a development database. Check the seed script before running it, because it may create or reset test records.

### Step 4: Start the backend

```bash
npm start
```

The backend is expected to run at:

```text
http://localhost:5000
```

The actual port depends on your configuration.

### Step 5: Start the frontend

Open a second terminal from the project root:

```bash
cd client
npm install
npm run dev
```

Open the local Vite URL shown in the terminal, typically:

```text
http://localhost:5173
```

## 9. Testing

The backend includes an automated test suite using Node.js's native test runner.

Run the tests from the server directory:

```bash
npm test
```

The test suite is intended to cover workflows such as:

- Authentication and role authorization.
- Ration card verification.
- Slot availability and capacity limits.
- Duplicate booking prevention.
- Mock payment outcomes.
- QR token verification.
- Distribution and inventory updates.
- Duplicate distribution prevention.

**Test reporting:** Record the number of passed and failed tests based on the actual output from your current test run.

## 10. Security and Privacy

- Passwords are hashed before storage.
- JWTs are used for authenticated requests.
- Role-based authorization restricts protected operations.
- QR tokens use cryptographic signatures for integrity verification.
- Request rate limiting helps reduce abuse.
- Environment variables keep deployment configuration separate from source code.
- Test credentials and private configuration are not published in this README.

The application is an academic project and demonstration platform. Production use would require additional security reviews, operational monitoring, accessibility checks, privacy safeguards, and integration with authorized government systems where applicable.

## 11. Agile Engineering Documentation

The `docs/` directory contains project planning and development artifacts, including:

- Product Vision.
- Product Backlog.
- User Stories.
- Sprint Plans.
- Sprint Backlog.
- Test Plan and Test Cases.
- Definition of Done.
- Sprint Review and Retrospective.

These documents support iterative development, sprint tracking, testing, and review.

## 12. Future Enhancements

- Integration with authorized government PDS systems.
- Production payment gateway integration.
- Enhanced audit trails and operational monitoring.
- Improved accessibility and multilingual support.
- Advanced reporting and fraud-detection analytics.
- Automated deployment and continuous integration.

## 13. Disclaimer

Smart PDS is an academic software project developed for educational and demonstration purposes. It is not an official government application and is not affiliated with any government department.

All demonstration data should be synthetic. No real beneficiary credentials, Aadhaar details, payment secrets, or confidential government information should be published in the repository.

## 14. License

A license has not yet been specified. Add a suitable open-source license if you intend to permit public reuse or redistribution.


