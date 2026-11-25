/**
 * StayAI Firestore Security Rules Verification Specification (TDD Matrix)
 *
 * Documents the executable rule invariants verified against /firestore.rules
 * and /security_spec.md (Dirty Dozen attack payloads). Run with Firebase
 * Emulator Suite + @firebase/rules-unit-testing in CI/CD environments.
 */

export interface SecurityRuleTestCase {
  id: string;
  collection: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  actor: 'anonymous' | 'customer_verified' | 'customer_unverified' | 'manager_owner' | 'manager_other' | 'admin';
  expectation: 'ALLOW' | 'DENY';
  attackOrInvariant: string;
}

export const STAYAI_SECURITY_RULE_TEST_MATRIX: SecurityRuleTestCase[] = [
  {
    id: 'T01-DEFAULT-DENY-UNKNOWN-COLLECTION',
    collection: 'unknown_collection/doc1',
    operation: 'get',
    actor: 'admin',
    expectation: 'DENY',
    attackOrInvariant: 'Global default-deny safety net rejects undefined collections.',
  },
  {
    id: 'T02-ROLE-ESCALATION-ON-CREATE',
    collection: 'users/uid_alice',
    operation: 'create',
    actor: 'customer_verified',
    expectation: 'DENY',
    attackOrInvariant: 'Rejects client create with role: "admin" or role: "manager".',
  },
  {
    id: 'T03-ROLE-ESCALATION-ON-UPDATE',
    collection: 'users/uid_alice',
    operation: 'update',
    actor: 'customer_verified',
    expectation: 'DENY',
    attackOrInvariant: 'Rejects client update touching role, status, uid, or createdAt.',
  },
  {
    id: 'T04-UNVERIFIED-EMAIL-WRITE',
    collection: 'favorites/uid_alice_prop1',
    operation: 'create',
    actor: 'customer_unverified',
    expectation: 'DENY',
    attackOrInvariant: 'Requires request.auth.token.email_verified == true on all writes.',
  },
  {
    id: 'T05-CROSS-USER-PII-READ',
    collection: 'users/uid_bob',
    operation: 'get',
    actor: 'customer_verified',
    expectation: 'DENY',
    attackOrInvariant: 'Blocks reading another user profile document.',
  },
  {
    id: 'T06-CLIENT-BOOKING-FORGERY',
    collection: 'bookings/bk_fake',
    operation: 'create',
    actor: 'customer_verified',
    expectation: 'DENY',
    attackOrInvariant: 'Bookings are strictly server-authoritative (allow write: if false).',
  },
  {
    id: 'T07-CLIENT-PAYMENT-FORGERY',
    collection: 'payments/pay_fake',
    operation: 'create',
    actor: 'admin',
    expectation: 'DENY',
    attackOrInvariant: 'Payments and payment_webhooks are server-only writes.',
  },
  {
    id: 'T08-MANAGER-SELF-VERIFY-PROPERTY',
    collection: 'properties/prop_1',
    operation: 'update',
    actor: 'manager_owner',
    expectation: 'DENY',
    attackOrInvariant: 'Manager cannot flip verificationStatus to verified or bookable to true.',
  },
  {
    id: 'T09-CROSS-MANAGER-PROPERTY-TAMPER',
    collection: 'properties/prop_other',
    operation: 'update',
    actor: 'manager_other',
    expectation: 'DENY',
    attackOrInvariant: 'Manager cannot update a property owned by another managerId.',
  },
  {
    id: 'T10-AUDIT-LOG-IMMUTABILITY',
    collection: 'auditLogs/log_1',
    operation: 'delete',
    actor: 'admin',
    expectation: 'DENY',
    attackOrInvariant: 'Audit logs are strictly immutable from client SDKs.',
  },
  {
    id: 'T11-SUPPORT-TICKET-VALID-CREATE',
    collection: 'supportTickets/tkt_1001',
    operation: 'create',
    actor: 'customer_verified',
    expectation: 'ALLOW',
    attackOrInvariant: 'Verified user creates own support ticket with status "open" and server timestamps.',
  },
  {
    id: 'T12-FAVORITE-OWNER-CREATE-DELETE',
    collection: 'favorites/uid_alice_demo-goa-cabo-verandah',
    operation: 'create',
    actor: 'customer_verified',
    expectation: 'ALLOW',
    attackOrInvariant: 'Verified user saves a stay under their own userId with strict schema.',
  },
];
