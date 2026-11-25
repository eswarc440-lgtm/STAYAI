# StayAI Firestore Security Specification (Phase 0 TDD)

## Core Data Invariants
1. **Zero Self-Assigned Roles**: On `/users/{userId}` creation, clients may only create a profile with `role == 'customer'` and `status == 'active'`. Clients can never modify `role`, `status`, or `uid`.
2. **PII Isolation**: User profiles, bookings, payments, refunds, notifications, favorites, recentViews, and supportTickets are strictly readable only by their owner (`userId == request.auth.uid`), the owning manager where applicable (`managerId == request.auth.uid`), or a verified Admin.
3. **Server-Authoritative Transactions**: Clients cannot create or alter `/payments`, `/payment_webhooks`, `/refunds`, `/auditLogs`, or mark `/bookings` as `confirmed`.
4. **Manager Isolation**: Managers can only create/update properties, rooms, availability, promotions, and staff where `managerId == request.auth.uid`, and can never self-verify (`verificationStatus == 'verified'` or `bookable == true`).
5. **Verified Email Gate**: All authenticated write operations require `request.auth.token.email_verified == true`.

## The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Self-Role Escalation (Create)**: Creating `/users/{uid}` with `{ role: "admin" }`.
2. **Self-Role Escalation (Update)**: Updating `/users/{uid}` with `{ role: "manager" }`.
3. **Cross-User PII Read**: Non-admin user A reading `/users/{userB}`.
4. **Unverified Admin Spoof**: Token with admin email but `email_verified: false`.
5. **Shadow Ghost Field Injection**: Updating `/users/{uid}` with `{ displayName: "Ok", isVerified: true }`.
6. **Manager Self-Verification**: Manager creating `/properties/{id}` with `{ verificationStatus: "verified", bookable: true }`.
7. **Cross-Manager Hijack**: Manager B updating Manager A's `/rooms/{roomId}`.
8. **Fake Booking Confirmation**: Customer creating/updating `/bookings/{id}` with `{ status: "confirmed" }`.
9. **Client Payment Tampering**: Customer writing `/payments/{id}` with `{ status: "captured", verifiedServerSide: true }`.
10. **Webhook Forgery**: Authenticated client writing `/payment_webhooks/{id}`.
11. **ID Poisoning**: Creating `/favorites/{200-char-invalid-id!@#}`.
12. **Client List Scraping**: Querying `/favorites` without `where('userId', '==', auth.uid)`.
