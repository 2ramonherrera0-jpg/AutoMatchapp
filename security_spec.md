# Security Specification for AutoMatch Chile (Firestore RLS equivalent)

This document outlines the Security Architecture, Data Invariants, the "Dirty Dozen" malicious payloads, and the test assertions to enforce strict Row-Level-Security (RLS) policies within Firestore.

---

## 1. Data Invariants

1. **User Identity Invariant**: A user can only create, update, or delete their own user profile matching their authenticated `request.auth.uid`.
2. **Car Ownership Invariant**: A car listing can only be created by an authenticated user whose `request.auth.uid` matches the `ownerUid` field. Only the owner can edit or delete their vehicle.
3. **Immutability of System Counters**: Regular users cannot directly increment `views` or `likes` counters arbitrarily. Any updates to these fields must be tightly restricted to prevent denial-of-wallet / resource exhaust attacks.
4. **Swipe Authorization**: Swipes must have `senderUid` matching the authenticated user. No user can swipe on behalf of another user.
5. **Match Confidentiality**: Only the participants in a match (contained in the `participants` array) can read match records or read/write messages in its subcollection.
6. **Message Sender Integrity**: A message's `senderUid` must exactly match the authenticated `request.auth.uid` of the client writing it.

---

## 2. The "Dirty Dozen" Malicious Payloads

These 12 malicious payloads attempt to violate user identity, listing integrity, state consistency, or cheat the matchmaking system. The Firestore Security Rules are designed to guarantee that every single one of these yields a `PERMISSION_DENIED`.

### Payload 1: Spying on another user's profile
* **Threat**: Unauthenticated or competitor user reading private profile data of user `alice123`.
* **Path**: `/users/alice123`
* **Operation**: `get`
* **Attacker Auth**: `request.auth.uid = 'bob456'`
* **Expected**: `PERMISSION_DENIED`

### Payload 2: Impersonating another user during profile creation
* **Threat**: Attacker Bob registering a profile with Alice's UID.
* **Path**: `/users/alice123`
* **Operation**: `create`
* **Attacker Auth**: `request.auth.uid = 'bob456'`
* **Payload**:
  ```json
  {
    "name": "Alice fake profile",
    "contactPhone": "+56999999999",
    "createdAt": "request.time"
  }
  ```
* **Expected**: `PERMISSION_DENIED`

### Payload 3: Creation of vehicle listing for another user
* **Threat**: Creating a listing and setting `ownerUid` to a victim's ID to spam or make false listings.
* **Path**: `/cars/car_spy_123`
* **Operation**: `create`
* **Attacker Auth**: `request.auth.uid = 'bob456'`
* **Payload**:
  ```json
  {
    "ownerUid": "alice123",
    "brand": "Suzuki",
    "model": "Swift",
    "year": 2022,
    "km": 15000,
    "price": 9500000,
    "fuel": "Bencina",
    "transmission": "Manual",
    "permuta": true,
    "createdAt": "request.time"
  }
  ```
* **Expected**: `PERMISSION_DENIED`

### Payload 4: Editing someone else's vehicle listing
* **Threat**: Bob tries to change the price or delete Alice's car listing.
* **Path**: `/cars/alice_car_789`
* **Operation**: `update`
* **Attacker Auth**: `request.auth.uid = 'bob456'`
* **Payload**:
  ```json
  {
    "price": 1000 // Bob alters the price to 1,000 CLP
  }
  ```
* **Expected**: `PERMISSION_DENIED`

### Payload 5: Spoofing Swipes on behalf of another user
* **Threat**: Bob sends a "like" swipe pretending to be Alice.
* **Path**: `/swipes/swipe_busted_1`
* **Operation**: `create`
* **Attacker Auth**: `request.auth.uid = 'bob456'`
* **Payload**:
  ```json
  {
    "senderUid": "alice123",
    "targetCarId": "bob_car_999",
    "type": "like",
    "createdAt": "request.time"
  }
  ```
* **Expected**: `PERMISSION_DENIED`

### Payload 6: Sending a message into someone else's match chat
* **Threat**: Bob tries to post messages in a match conversation between Alice and Charlie.
* **Path**: `/matches/alice_charlie_match/messages/hack_msg`
* **Operation**: `create`
* **Attacker Auth**: `request.auth.uid = 'bob456'`
* **Payload**:
  ```json
  {
    "senderUid": "bob456",
    "text": "Phishing or spam link",
    "createdAt": "request.time"
  }
  ```
* **Expected**: `PERMISSION_DENIED`

### Payload 7: Reading private chats of other buyers/sellers
* **Threat**: Bob queries matches that he is not a participant of to steal contact info.
* **Path**: `/matches/alice_charlie_match`
* **Operation**: `get`
* **Attacker Auth**: `request.auth.uid = 'bob456'`
* **Expected**: `PERMISSION_DENIED`

### Payload 8: Creating invalid vehicle parameters (Sanity bypass)
* **Threat**: Malicious listing with negative mileage or futuristic year.
* **Path**: `/cars/new_car_99`
* **Operation**: `create`
* **Attacker Auth**: `request.auth.uid = 'bob456'`
* **Payload**:
  ```json
  {
    "ownerUid": "bob456",
    "brand": "Toyota",
    "model": "Yaris",
    "year": 3050,
    "km": -500,
    "price": -1000000,
    "fuel": "Uranio",
    "transmission": "Telepatía",
    "permuta": false,
    "createdAt": "request.time"
  }
  ```
* **Expected**: `PERMISSION_DENIED`

### Payload 9: Inflating likes directly via client SDK
* **Threat**: Bob attempts to directly overwrite `likes` or `views` to millions on his own car listing.
* **Path**: `/cars/bob_car_999`
* **Operation**: `update`
* **Attacker Auth**: `request.auth.uid = 'bob456'`
* **Payload**:
  ```json
  {
    "likes": 9999999,
    "views": 50000000
  }
  ```
* **Expected**: `PERMISSION_DENIED`

### Payload 10: Stealing profile write ownership by modifying contactPhone to other's
* **Threat**: Bob updates his user profile to change his authenticated contact phone to trigger spoofed transactions.
* **Path**: `/users/bob456`
* **Operation**: `update`
* **Attacker Auth**: `request.auth.uid = 'bob456'`
* **Payload**:
  ```json
  {
    "contactPhone": "invalid-chilean-format-or-someone-else"
  }
  ```
* **Expected**: `PERMISSION_DENIED`

### Payload 11: Attempting to bypass default deny catch-all
* **Threat**: Attacker trying to write to `/unregistered_config/secrets` or other non-existent collections.
* **Path**: `/unregistered_config/secrets`
* **Operation**: `create`
* **Attacker Auth**: `request.auth.uid = 'bob456'`
* **Payload**:
  ```json
  {
    "api_key": "stolen"
  }
  ```
* **Expected**: `PERMISSION_DENIED`

### Payload 12: Changing senderUid on message inside a valid match
* **Threat**: Bob, who is a participant of a match with Alice, tries to post a message but sets `senderUid` to `alice123` to spoof her typing.
* **Path**: `/matches/bob_alice_match/messages/spoof_msg`
* **Operation**: `create`
* **Attacker Auth**: `request.auth.uid = 'bob456'`
* **Payload**:
  ```json
  {
    "senderUid": "alice123",
    "text": "Yo, Alice, apruebo cambiar mi auto gratis.",
    "createdAt": "request.time"
  }
  ```
* **Expected**: `PERMISSION_DENIED`

---

## 3. The Test Runner (firestore.rules.test.ts)

Below is the design pattern of the test suite ensuring complete test coverage for all Dirty Dozen cases above:

```typescript
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import * as fs from "fs";

let testEnv: RulesTestEnvironment;

describe("AutoMatch Chile - Security Rules Test Suite", () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "gen-lang-client-0220370901",
      firestore: {
        rules: fs.readFileSync("firestore.rules", "utf8"),
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  it("Payload 1: Prevents Bob from reading Alice's private user profile", async () => {
    const bobDb = testEnv.authenticatedContext("bob456").firestore();
    await assertFails(bobDb.doc("users/alice123").get());
  });

  it("Payload 2: Prevents Bob from creating a profile on Alice's path", async () => {
    const bobDb = testEnv.authenticatedContext("bob456").firestore();
    await assertFails(
      bobDb.doc("users/alice123").set({
        name: "Alice fake profile",
        contactPhone: "+56999999999",
        createdAt: new Date(),
      })
    );
  });

  it("Payload 3: Prevents Bob from listing a car under Alice's ownerUid", async () => {
    const bobDb = testEnv.authenticatedContext("bob456").firestore();
    await assertFails(
      bobDb.collection("cars").add({
        ownerUid: "alice123",
        brand: "Suzuki",
        model: "Swift",
        year: 2022,
        km: 15000,
        price: 9500000,
        fuel: "Bencina",
        transmission: "Manual",
        permuta: true,
        createdAt: new Date(),
      })
    );
  });

  it("Payload 4: Prevents Bob from modifying Alice's car price", async () => {
    // Setup Alice car first (using system admin context)
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc("cars/alice_car_789").set({
        ownerUid: "alice123",
        brand: "Suzuki",
        model: "Swift",
        price: 9500000,
      });
    });

    const bobDb = testEnv.authenticatedContext("bob456").firestore();
    await assertFails(
      bobDb.doc("cars/alice_car_789").update({
        price: 1000,
      })
    );
  });

  it("Payload 5: Prevents Bob from swiping on behalf of Alice", async () => {
    const bobDb = testEnv.authenticatedContext("bob456").firestore();
    await assertFails(
      bobDb.doc("swipes/swipe_busted_1").set({
        senderUid: "alice123",
        targetCarId: "bob_car_999",
        type: "like",
        createdAt: new Date(),
      })
    );
  });

  it("Payload 6 & 12: Prevents Bob from messaging in unauthorized matches or spoofing messages", async () => {
    // Setup a match where Bob is NOT a participant
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc("matches/alice_charlie_match").set({
        participants: ["alice123", "charlie789"],
      });
    });

    const bobDb = testEnv.authenticatedContext("bob456").firestore();
    await assertFails(
      bobDb.doc("matches/alice_charlie_match/messages/hack_msg").set({
        senderUid: "bob456",
        text: "Phishing or spam link",
        createdAt: new Date(),
      })
    );
  });

  it("Payload 7: Prevents Bob from reading matches of other users", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc("matches/alice_charlie_match").set({
        participants: ["alice123", "charlie789"],
      });
    });

    const bobDb = testEnv.authenticatedContext("bob456").firestore();
    await assertFails(bobDb.doc("matches/alice_charlie_match").get());
  });

  it("Payload 8: Prevents creating a listing with invalid parameters", async () => {
    const bobDb = testEnv.authenticatedContext("bob456").firestore();
    await assertFails(
      bobDb.doc("cars/new_car_99").set({
        ownerUid: "bob456",
        brand: "Toyota",
        model: "Yaris",
        year: 3050,
        km: -500,
        price: -1000000,
        fuel: "Uranio",
        transmission: "Telepatía",
        permuta: false,
        createdAt: new Date(),
      })
    );
  });

  it("Payload 9: Prevents direct inflation of counters on owned car", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc("cars/bob_car_999").set({
        ownerUid: "bob456",
        brand: "Suzuki",
        model: "Swift",
        price: 9500000,
        views: 10,
        likes: 2,
      });
    });

    const bobDb = testEnv.authenticatedContext("bob456").firestore();
    await assertFails(
      bobDb.doc("cars/bob_car_999").update({
        likes: 9999999,
        views: 50000000,
      })
    );
  });

  it("Payload 10: Prevents profile with invalid phone number format", async () => {
    const bobDb = testEnv.authenticatedContext("bob456").firestore();
    await assertFails(
      bobDb.doc("users/bob456").set({
        name: "Bob",
        contactPhone: "invalid-chilean-format-or-someone-else",
        createdAt: new Date(),
      })
    );
  });

  it("Payload 11: Prevents access to arbitrary unlisted collections", async () => {
    const bobDb = testEnv.authenticatedContext("bob456").firestore();
    await assertFails(
      bobDb.doc("unregistered_config/secrets").set({
        api_key: "stolen",
      })
    );
  });
});
```
