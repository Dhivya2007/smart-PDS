# Smart PDS — Sprint Review & Retrospective Template

## 1. Sprint Review Summary

| Sprint | Goal | Committed SP | Completed SP | Key Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **Sprint 1** | Auth, RBAC & Core Schemas | 26 | 26 | Backend authentication, Mongoose schemas, and seed data operational. |
| **Sprint 2** | 15-Min Slots & QR Token Engine | 29 | 29 | Concurrency-safe slot booking, HMAC-SHA256 QR codes, citizen card UI. |
| **Sprint 3** | Payments, Webcam Scanner & Disbursal | 31 | 31 | Mock payment simulation, camera/manual QR scanner, atomic stock deduction, printable receipts. |
| **Sprint 4** | Statewide Analytics, Bilingual UI & Hardening | 29 | 29 | Recharts dashboards, English/Tamil switcher, 18/18 passing automated tests, project docs. |

**Total Delivered Velocity**: 115 Story Points

---

## 2. Sprint Retrospective (4Ls Framework)

### What We Liked (Liked)
- Native Node 22 test runner (`node --test`) provided rapid, zero-dependency integration testing without requiring complex Jest Babel transpilation.
- Partial unique indexes in MongoDB (`partialFilterExpression: { status: 'CONFIRMED' }`) provided an elegant, database-level guarantee against concurrent double bookings.
- HTML5-QRCode integration allowed seamless webcam scanning directly within modern desktop and mobile browsers.

### What We Learned (Learned)
- Ensuring realistic Tamil PDS terminology (e.g. `நியாயவிலைக் கடை` for Fair Price Shop, `மானியத் தொகை` for Subsidized Amount) significantly improves authenticity and usability for public sector demonstrations.
- Payment abstraction with clear development mock modes (Success, Card Decline, Gateway Timeout) allows testing failure and retry loops safely without external sandbox downtime.

### What Lacked (Lacked)
- Initial slot generator needed careful boundary checks for the 13:00 - 14:00 lunch break to ensure no slots were allocated during shop closure.
- Camera access requires HTTPS in production environments; local testing required explicit browser permissions on `localhost`.

### What We Long For (Longed For)
- Real biometric fingerprint/iris scanner integration for future hardware deployment on dedicated Point of Sale (PoS) Android terminals.
- SMS gateway integration (e.g., CDAC mobile seva) for instant push alerts to citizens with feature phones.

---

## 3. Continuous Improvement Action Items
1. **Action Item 1**: Configure automated CI/CD pipeline running `npm test` on every pull request.
2. **Action Item 2**: Implement Redis-based queue cache if scaling to millions of simultaneous statewide slot bookings.
3. **Action Item 3**: Introduce automated daily backup cron for Fair Price Shop stock ledgers.
