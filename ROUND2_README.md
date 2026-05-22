# CredexIQ – Round 2: Re-Audit & Pricing Change Monitoring

## Live Demo

Vercel Deployment:

https://credexiq-git-round-2-reaudit-sejalbhole-sudos-projects.vercel.app/

GitHub Branch:

https://github.com/SejalBhole-sudo/credexiq/tree/round-2-reaudit

---

# Overview

This round extends CredexIQ beyond a one-time audit by introducing historical audit persistence, pricing change monitoring, automated re-audits, and notification workflows.

The goal is to ensure that previously generated recommendations remain useful even as AI pricing changes over time.

Users can now:

- Generate and store audits
- Receive audit reports by email
- Subscribe to future pricing change notifications
- Compare historical recommendations with updated recommendations
- Re-run audits using current pricing information

---

# Features Implemented

## 1. Audit Persistence

Every generated audit is stored in Supabase together with:

- User inputs
- Optimization recommendations
- Savings calculations
- Pricing snapshot at generation time
- Notification metadata

This creates a historical record that can be re-evaluated when pricing changes occur.

---

## 2. Pricing Snapshot Storage

A complete pricing snapshot is captured whenever an audit is created.

Benefits:

- Historical reproducibility
- Accurate recommendation comparison
- Pricing version tracking
- Reliable re-audit generation

Even if provider pricing changes later, the original recommendation context remains available.

---

## 3. Pricing Change Detection

Implemented a pricing monitoring workflow that compares:

- Historical pricing snapshots
- Current pricing configuration

The system automatically identifies audits that are affected by pricing updates.

Detected changes trigger:

- Recommendation recalculation
- Savings impact analysis
- Re-audit generation
- Notification eligibility

---

## 4. Re-Audit Workflow

Added a dedicated re-audit experience that compares historical audit results against newly generated recommendations.

The comparison includes:

- Previous monthly savings
- Updated monthly savings
- Previous annual savings
- Updated annual savings
- Recommendation impact

This provides visibility into how evolving pricing affects optimization opportunities.

---

## 5. Pricing Change Notifications

Implemented email notifications using Resend.

Supported notification types:

### Audit Delivery

Users can request a copy of their audit report via email.

### Pricing Change Alerts

When pricing changes affect a previously generated audit, users can be notified and directed to a re-audit comparison page.

---

## 6. Re-Audit Navigation

Added direct access to re-audit functionality from the audit experience.

Users can quickly:

- Review historical recommendations
- Compare updated recommendations
- Validate savings impact
- Investigate pricing changes

This significantly reduces navigation friction.

---

# Manual Pricing Change Trigger

For demonstration and testing purposes, pricing monitoring can be manually triggered using:

```text
/api/detect-changes
```

This endpoint:

1. Loads stored audits
2. Compares historical pricing snapshots against current pricing
3. Detects affected audits
4. Generates updated recommendations
5. Sends notification emails
6. Updates audit metadata

This allows the complete pricing change workflow to be demonstrated without requiring scheduled jobs.

---

# Tech Stack

Frontend:
- Next.js

Backend:
- Next.js API Routes

Database:
- Supabase

Email Service:
- Resend

Deployment:
- Vercel

---

# Database Design

## Audits

Stores:

- Audit inputs
- Recommendation outputs
- Pricing snapshots
- User email
- Notification state

## Leads

Stores:

- User contact information
- Savings estimates
- Notification eligibility

---

# Challenges & Learnings

The most challenging part of the implementation was preserving historical recommendation accuracy while supporting constantly changing pricing information.

The final solution uses pricing snapshot persistence to ensure that every audit remains reproducible even after provider pricing changes.

This approach enabled:

- Historical recommendation comparison
- Reliable re-audit generation
- Pricing impact analysis
- Automated notification workflows

Significant effort was spent validating:

- Audit persistence
- Pricing comparison logic
- Notification delivery
- Re-audit generation
- End-to-end workflow reliability

---

# Future Improvements

Potential next steps include:

- Scheduled pricing monitoring via cron jobs
- User notification preferences
- Pricing change severity indicators
- Audit history dashboard
- Verified sending domains for improved email deliverability
- Background re-audit processing

---

# Summary

Round 2 transforms CredexIQ from a static audit generator into a continuously monitored recommendation system.

By combining:

- Historical audit storage
- Pricing snapshot versioning
- Automated change detection
- Re-audit generation
- Email notifications

the platform can proactively inform users when changing AI pricing impacts their optimization opportunities.