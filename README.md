# Kapchorwa Senior Secondary School website

Official public website for Kapchorwa Senior Secondary School (Kapchorwa S.S.) in Kawowo, Central Division, Kapchorwa Municipality, Uganda. Built by Altrastate Technologies Ltd.

Phase 3 community services are independently configurable. Alumni accounts, online donations, and notice subscriptions stay off until an authorised administrator enables them in site settings and, where needed, provider credentials exist.

## Local setup

```bash
npm install
copy .env.example .env
npm run db:setup
npm run dev
```

On PowerShell, use `Copy-Item .env.example .env` if `copy` is unavailable.

Open [http://localhost:3000](http://localhost:3000).

Default administrator sign-in (change before any public deployment):

- URL: `/admin`
- Email: `admin@example.com`
- Password: `change-this-password`

## Useful commands

```bash
npm run dev          # local website
npm run typecheck    # TypeScript
npm run lint         # ESLint
npm run build        # production build
npm run start        # serve the production build
npm run db:setup     # create SQLite database and seed content
npm test             # permission, timezone, analytics, token, and payment checks
```

The public website can be deployed without `DATABASE_URL`. In that mode it
serves the approved static college content already in the code. Enquiry
storage, the admin CMS, and Phase 3 modules stay offline until a hosted
database is connected.

## Configuration

See `.env.example`. Do not commit real secrets.

- `AUTH_SECRET` must be a long random string in production. It signs both administrator and alumni session cookies.
- SMTP (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`) is optional. If it is empty, enquiries, alumni verification, receipts, and campaigns are stored, and the website says email delivery is not configured.
- Payments (`PAYMENTS_PROVIDER`, `PAYMENTS_WEBHOOK_SECRET`) stay disabled until both are set after school approval. This application does not assume Flutterwave, Stripe, or any other brand.
- School-system variables (`SCHOOL_SYSTEM_BASE_URL`, `SCHOOL_SYSTEM_API_KEY`) only allow a reachability test. Student records are not imported.

## Roles

The first seeded account is a Super Admin. Additional roles are assigned in `/admin/users` and enforced on the server:

- Super Admin: all approved modules, including integration settings
- School Admin: operational content, not user accounts or integration credentials
- Editor: public content drafts
- Admissions Officer: enquiries only
- Alumni / Development Officer: alumni stories, alumni accounts, projects, and donation records
- Communications Officer: notice drafts, subscribers, and confirmed bulk sends

## Phase 3 modules

Enable these in `/admin/settings` only after the college approves the policy:

- Alumni portal: `/alumni/portal`
- Support and donations: `/support`, `/support/donate`
- Parent/guardian notices: `/parent-communications`

Online donations are never marked successful from the browser. Payment webhooks must present `x-jico-signature` (or `x-webhook-signature`) as hex HMAC-SHA256 of the raw body using `PAYMENTS_WEBHOOK_SECRET`. Receipts exist only after that confirmation.

Bulk notice emails require typing `SEND N`, where N is the number of verified subscribers in the selected category. Test sends go only to the signed-in operator.

Analytics are first-party page-view and form counts only. Alumni portal, receipt, confirmation, and unsubscribe URLs are excluded. Analytics can be turned off in site settings.
