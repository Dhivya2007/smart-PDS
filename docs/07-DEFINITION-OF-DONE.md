# Smart PDS — Definition of Done (DoD)

A user story or engineering task is considered **Done** only when all the following criteria are strictly met:

1. **Functional Requirements Met**:
   - All specified acceptance criteria are completely satisfied.
   - Core business rules (e.g. single collection per month cycle, 15-minute slot capacity limits, HMAC signature validity) are enforced.

2. **Database & Persistence Integrity**:
   - Mongoose schemas include explicit field validations, timestamps, and indexes.
   - Unique and compound constraints (e.g. `{ rationCardId: 1, monthCycle: 1 }`) are applied to guarantee data integrity even under concurrent conditions.

3. **Security & Authorization**:
   - Passwords are encrypted using Bcrypt (minimum 10 salt rounds).
   - Sensitive endpoints are guarded with both `authenticate` and `authorize(...roles)` middlewares.
   - No sensitive passwords, OTPs, or HMAC private keys are exposed in log output or API responses.

4. **Code Quality & Architecture**:
   - Server-side code is modularized into `controllers`, `services`, `models`, `routes`, and `middleware`.
   - Client-side code is organized into reusable components, context providers, and responsive pages.
   - Centralized error handling returns standard JSON error responses with appropriate HTTP status codes.

5. **Automated Testing & Build Verification**:
   - Automated integration tests pass with 0 errors (`npm test`).
   - Frontend compiles successfully without errors (`npm run build`).

6. **Accessibility & Localization**:
   - The user interface supports dynamic bilingual switching between English and Tamil (`தமிழ்`).
   - Layout is responsive across desktop, tablet, and mobile viewport resolutions.

7. **Documentation**:
   - API endpoints, setup instructions, environment variables, and test instructions are documented in `README.md`.
