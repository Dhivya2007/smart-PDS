# Smart PDS — User Stories & Acceptance Criteria

---

### Epic 1: Citizen Enrollment & Verification

#### US-1.1: Ration Card Verification & Linking
- **As a** citizen beneficiary,
- **I want to** verify my household smart ration card using my card number and Head of Family Aadhaar last 4 digits,
- **So that** I can link my verified card to my account and see my monthly commodity entitlement.

**Acceptance Criteria:**
1. Given a valid card number (e.g. `TN-04-10293847`) and matching Aadhaar digits (`4821`), the system displays card type (PHH/AAY/NPHH), family members, and linked shop.
2. Given incorrect Aadhaar digits, the API returns HTTP 400 with "Aadhaar verification failed".
3. When linking, the user account is populated with `rationCardId` and `rationCardNumber`.
4. A card already linked to another registered account cannot be re-linked (HTTP 400).

---

### Epic 2: Queue Slot Booking & Token Issuance

#### US-2.1: 15-Minute Slot Availability Selection
- **As a** beneficiary,
- **I want to** select an available date and 15-minute time slot at my linked Fair Price Shop,
- **So that** I don't have to wait in physical queues.

**Acceptance Criteria:**
1. Slots are generated dynamically at 15-minute intervals (e.g., 09:00 - 09:15, 09:15 - 09:30).
2. Lunch breaks (13:00 - 14:00) are automatically excluded from available booking slots.
3. Each slot displays real-time remaining capacity (Max 6 citizens per slot).
4. Slots with 0 spots remaining are disabled and marked "Full".

#### US-2.2: Single Monthly Collection & Double-Booking Prevention
- **As a** civil supplies administrator,
- **I want to** strictly enforce that a ration card can only have one collection per monthly cycle,
- **So that** ghost claims and quota duplication are completely prevented.

**Acceptance Criteria:**
1. If `card.lastCollectedMonth === currentMonth`, slot booking is rejected with HTTP 400.
2. If the card already has an active booking with status `CONFIRMED` in the cycle, new booking attempts are rejected with HTTP 400.
3. Database enforces partial unique index `{ rationCardId: 1, monthCycle: 1 }` where `{ status: 'CONFIRMED' }`.

#### US-2.3: Tamper-Proof Cryptographic QR Token
- **As a** beneficiary,
- **I want to** receive an authenticated QR token upon booking confirmation,
- **So that** the shop owner can scan and verify my slot at the counter.

**Acceptance Criteria:**
1. Token code adheres to non-guessable format `PDS-TKN-YYYYMM-XXXXXXXX`.
2. QR payload contains HMAC-SHA256 signature calculated with `QR_SECRET`.
3. Token can be downloaded as a high-resolution PNG image or printed.

---

### Epic 3: Payment Options & Mock Gateway

#### US-3.1: Flexible Payment Selection
- **As a** beneficiary,
- **I want to** choose between paying cash at the counter or completing an online mock payment,
- **So that** I have flexible payment options suited to my digital readiness.

**Acceptance Criteria:**
1. If "Cash at Counter" is selected, payment record is created with status `PENDING` and remains pending until confirmed by shop owner during disbursal.
2. If "Online Payment" is selected, user can interact with the Mock Payment Gateway modal to simulate "Success", "Card Decline", or "Network Glitch".
3. Verified online payment transitions to `COMPLETED` with simulated bank reference ID.

---

### Epic 4: Shop Owner Verification & Disbursement

#### US-4.1: High-Speed QR Verification
- **As a** Fair Price Shop owner,
- **I want to** scan the citizen's QR token using my webcam or enter the token code manually,
- **So that** I can verify eligibility and commodity entitlement in seconds.

**Acceptance Criteria:**
1. System validates HMAC cryptographic signature.
2. Token belonging to a different shop is rejected with HTTP 403.
3. Already used, cancelled, or expired tokens are immediately rejected with appropriate error messages.
4. Screen presents full checklist of commodities to disburse and checks shop stock levels.

#### US-4.2: Atomic Distribution & Stock Decrement
- **As a** Fair Price Shop owner,
- **I want to** confirm disbursal after verifying the collecting family member,
- **So that** ration commodities are officially recorded, stock balances decrease, and an authenticated digital receipt is issued.

**Acceptance Criteria:**
1. Stock of Rice, Wheat, Sugar, Kerosene, and Dal is decremented atomically from the shop balance.
2. `QueueToken` transitions to `USED`, `Booking` transitions to `DISTRIBUTED`, and `RationCard` records `lastCollectedMonth`.
3. Unique digital receipt number (e.g. `RCP-202610-XXXX`) is issued.
4. Second concurrent disbursal attempt on the same token fails with HTTP 400.

---

### Epic 5: Administrative Telemetry & Governance

#### US-5.1: Statewide Dashboard & Visual Analytics
- **As an** administrator,
- **I want to** view real-time metrics and Recharts visualizations,
- **So that** I can monitor state-wide distribution progress and stock health.

**Acceptance Criteria:**
1. Displays total beneficiaries, active shops, monthly distributions, active slots, and total revenue.
2. Renders 7-day daily distribution line chart, monthly commodity volume bar chart, and card-type distribution pie chart.
3. Automatically alerts on shops where commodity stock is below 15% of allocation.
4. Provides full CSV export capability for state auditors.
