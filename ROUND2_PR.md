## feat: add re-audit on pricing change with email notifications

### What this PR does

This PR adds a complete re-audit system that keeps user audits fresh when AI tool pricing changes. When pricing data updates (e.g., Claude Pro goes from $20 to $25/seat), the system detects affected audits, notifies users via email, and shows a side-by-side comparison of their old vs. new recommendations. Users can see exactly what changed in the market and how it impacts their spending.

### Why

Pricing for AI tools changes constantly (Claude added Max tiers in 2025, Cursor raised prices in 2024, etc.). A one-time audit becomes stale within weeks. Users need to know when market changes invalidate their previous recommendations—not because they changed their stack, but because the vendors changed the rules. This feature makes audits "live" instead of historical snapshots.

We assumed users care about staying informed without constant manual re-checks, and that transparent pricing change notifications build trust better than silence.

### How it works

**Data Flow:**

1. **Audit Persistence** (`/api/report`): When an audit runs, it now saves:
   - User's email (captured from modal)
   - Input stack (what tools/plans they submitted)
   - Output result (recommendations + savings)
   - Pricing snapshot (exact pricing used at that moment in JSON)

2. **Change Detection** (`/api/detect-changes`): A scheduled or manually-triggered function:
   - Fetches all stored audits
   - Compares each audit's old pricing snapshot vs. current OFFICIAL_PRICING
   - Uses deep JSON comparison (not string matching) to catch all changes
   - Re-runs the audit engine with current pricing
   - Checks if recommendations actually changed (old savings vs. new savings)

3. **Notification** (`/api/send-reaudit-email`): For affected audits:
   - Sends email to stored user email
   - Lists what pricing changed ("Claude Pro: $20 → $25")
   - Shows impact ("you'd now save $10/mo instead of $0")
   - Includes one-click link to re-audit page

4. **Diff View** (`/app/reaudit/[id]/page.js`): When user clicks link:
   - Loads the original audit from database
   - Runs new audit with current pricing
   - Displays side-by-side: "Previous Audit" vs. "Updated Audit"
   - Shows savings delta prominently
   - Highlights which recommendations changed

**Code locations:**
- `src/lib/pricingSnapshot.js` — New utility for snapshot capture/comparison
- `src/app/api/report/route.js` — Updated to save email + snapshot
- `src/app/results/page.js` — Updated to pass email from modal to API
- `src/lib/detectPricingChanges.js` — Updated with snapshot-based detection
- `src/app/api/detect-changes/route.js` — New detection endpoint
- `src/app/api/send-reaudit-email/route.js` — New email send endpoint
- `src/app/reaudit/[id]/page.js` — Already existed, works with new data

### What I cut

- **Email unsubscribe links**: Would need token generation + database tracking. For 36h, simpler to not include. Users can always reply "unsubscribe" or we add later.

- **Public "What changed in the market" page**: Cool growth feature, but detection logic had to be solid first. Once detection works, this is just a public query + page. Left for next phase.

- **Admin dashboard (audits count, click-through %)**: Useful for metrics but non-essential for core feature. Detection + emails are the critical path. Dashboard is future polish.

- **Opt-in/opt-out preference on account level**: Initially planned, but users don't have accounts yet (just email-based). Would require account system. Went with simpler email-level control instead.

- **Scheduled cron job**: Vercel Cron requires Pro tier. Used manual `/api/detect-changes` endpoint instead. Can be wired to GitHub Actions or a cron service later (no code change needed—just deployment config).

### How to test it manually

**Setup:**
1. Deploy this PR to staging/preview
2. Open the app and create an audit
   - Tools: Claude Pro, 2 seats, $40/mo spend
   - Use case: coding
   - Click "Email Me This Report"
   - Submit email (use a real email you can check, e.g., your Gmail)
3. Check your email: should receive "Report sent" confirmation
4. Check database: `SELECT user_email FROM audits WHERE id = [the audit id]`
   - Should show your email, NOT "unknown@example.com"

**Test pricing change detection:**
1. Edit `src/data/pricingData.js`
   - Change `claude.Pro.pricePerSeat` from `20` to `25`
2. Run detection: `curl https://credexiq-git-round-2-reaudit-sejalbhole-sudos-projects.vercel.app/api/detect-changes`
3. Look at response: should show `"affectedAudits": [{ ... }]` (non-empty)
4. Check your inbox: should receive "Your AI Audit Needs an Update"
   - Email shows: "Claude Pro: $20 → $25"
   - Shows old vs. new savings
   - Has link to re-audit

**Test re-audit diff view:**
1. Click the email link or visit `https://credexiq-git-round-2-reaudit-sejalbhole-sudos-projects.vercel.app/`
2. Should see:
   - Header: "🔄 Audit Update"
   - "Savings Impact" showing delta (e.g., "+$10/mo")
   - "Previous Audit" section with old recommendations
   - "Updated Audit" section with new recommendations
   - Numbers should differ between the two

**Test no false positives:**
1. Undo the price change in pricingData.js (set Pro back to $20)
2. Run detection again: `curl https://credexiq-git-round-2-reaudit-sejalbhole-sudos-projects.vercel.app/api/detect-changes`
3. Should see `"affectedAudits": []` (empty array)
4. No email sent this time ✓

### What's tested

- ✅ Audit persists with email + pricing snapshot (manual DB check)
- ✅ Detection finds audits when pricing changes (curl /api/detect-changes)
- ✅ Detection ignores audits when pricing hasn't changed (curl returns empty)
- ✅ Email sends with correct details (inbox check)
- ✅ Re-audit page loads and shows before/after (browser check)
- ✅ No "report not found" errors when visiting re-audit link

**Not automated (time constraint):**
- Email delivery (using Resend free tier, manual verification only)
- Email content formatting (tested visually)
- Database transaction rollbacks (not added due to scope)
- Concurrent detection runs (single-threaded model sufficient for 36h)

Would test first: email actually arriving + re-audit page showing different savings

### Open questions / risks

- **Email deliverability**: Using Resend free tier. If domain isn't warmed up, emails might land in spam. Easy to verify by checking email address on test.
- **Pricing snapshot size**: If OFFICIAL_PRICING gets very large (100+ tools × 10 plans each), JSON blob could hit database limits. Currently fine, but monitor if pricing data grows 10x.
- **Concurrent detection runs**: If detection job runs twice simultaneously, could send duplicate emails. Solution: add `processed_at` timestamp to audits table, check before sending. Not critical for MVP.
- **Stale re-audit links**: If pricing changes again after user gets email but before they click the link, they'd see a different new audit. OK—user still gets accurate current state, which is the goal.

---

## Summary

✅ All 4 required features work end-to-end
✅ Emails send with pricing change details
✅ Diff view clearly shows before/after
✅ Code is clean and non-breaking
✅ Ready for production after ~1 week of cron reliability monitoring