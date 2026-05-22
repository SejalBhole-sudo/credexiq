## ROUND2_REFLECTION.md

### 1. Most uncomfortable trade-off you made because of time pressure

**The trade-off:** I chose not to implement email unsubscribe links, even though the requirements listed it as a bonus feature. Instead of generating unsubscribe tokens, storing them in the database, and verifying them on a callback endpoint, I left that logic for phase 2.

**Why it was uncomfortable:** Email is a relationship tool—sending notifications without an obvious way to opt out feels slightly presumptuous. The "best practice" response would be to include an unsubscribe link in every email. But in 36 hours, adding `unsubscribe_tokens` table + verification logic + callback endpoint would've taken 3-4 hours of solid work that pulled away from ensuring the core four features shipped flawlessly.

**What I chose instead:** I focused entirely on making detection + email + diff view bulletproof, because without those working perfectly, unsubscribe links are just window dressing on a broken feature. The assumption is: if the core feature delivers value (showing real price changes), users won't mind clicking "reply unsubscribe" or we add the link in Round 3 when we have more time.

**In retrospect:** Correct call. The unsubscribe token logic would have introduced subtle bugs (token expiry, collision, verification endpoint errors) that would've broken the main feature testing. Better to ship 4/4 working than 4/4 + 1/5 bonus.

---

### 2. If we extended the deadline by 24 more hours, what's the first thing you'd do?

**Single first thing:** Add a Supabase scheduled function to run detection automatically every 24 hours, so detection doesn't rely on manual curl calls and the feature feels like a true background job, not a one-off endpoint.

**Why:** Right now, detection only runs if someone manually hits `/api/detect-changes`. That feels incomplete. A proper "live audit" system detects pricing changes without human intervention. With one extra day, I'd:

1. Set up Supabase Edge Functions (or Vercel Cron with environment variable gating)
2. Wire it to run daily at 2 AM UTC
3. Add a `last_detection_run` timestamp to track when it ran
4. Add error alerting (Slack webhook) if detection fails

This is the difference between "feature that works when you poke it" and "feature that silently keeps audits fresh." It's 2-3 hours of work and makes the product feel professional.

---

### 3. Looking back at your Round 1 codebase: what's one thing your Round 1 self made harder for your Round 2 self?

**The thing:** I didn't plan for audit persistence in Round 1. The audit runs client-side, results display on a client-side page, and I just saved audit data to localStorage. There was no database schema for audits, no concept of a user email, no audit ID beyond a client-generated UUID.

**Why it hurt in Round 2:** When Round 2 asked to store audits and send re-audit notifications, I had to:

1. Create the audits table schema from scratch (new columns: pricing_snapshot, user_email, input_stack, output_result)
2. Retrofit user email capture into the modal (wasn't designed to collect email initially)
3. Change audit ID generation from client-side UUID to server-side Supabase ID
4. Migrate all the data structures (audit format, results format) to work with new storage

If Round 1 me had thought about persistence even slightly, I would have:
- Added an email field to the modal from day one
- Made audit results serializable to JSON from the start
- Used server-side IDs instead of client UUIDs

**The lesson:** Features that seem optional (user identity, data persistence) often become required later. Better to design for them from the start even if you don't use them immediately.

**Time lost:** ~45 minutes of the 36-hour window was spent retrofitting storage logic, schema design, and data format changes. If I'd done this in Round 1, Round 2 would've been 90% feature work instead of 50/50 feature/refactor.

---

## Bonus Reflection: What went well

- **Snapshot logic was correct first try**: The pricingSnapshot.js utility worked without bugs because I thought through the comparison logic before coding.
- **Email modal callback pattern was clean**: The `onEmailSubmitted` callback in results/page.js felt like natural React patterns, no weird state management.
- **Detection endpoint was flexible**: By building it as a manual `/api/detect-changes` endpoint, it's trivial to wire to a scheduler later. Good architectural choice.

## What I'd do differently next time

- **Start with database schema**: Spend 30 min designing tables before writing any UI code. Saves refactoring later.
- **Test detection with real data earlier**: I tested after the email code was done. Should've tested detection logic day 1 with seed data.
- **Document the flow diagram earlier**: Took me 2 hours to draw out the data flow. Would've saved time if I did this in the planning phase instead of cleanup phase.

---

## Final thought

Round 2 was about execution under constraint. The most valuable thing I learned: **shipping something that works is better than shipping something perfect with missing features**. I could have spent 10 extra hours polishing edge cases, but instead I shipped all 4 core requirements and documented what's left. That's the right trade-off for a 36-hour sprint.