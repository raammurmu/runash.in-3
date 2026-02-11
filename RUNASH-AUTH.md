# Custom RunAsh Auth Integration 
Better Auth & Drizzle ORM Auth Integration Setup Guide

Complete implementation guide for migrating to Better Auth with Drizzle ORM and feature flags for gradual rollout.

## Quick Start

### 1. Install Dependencies

\`\`\`install

npm install better-auth drizzle-orm @better-auth/drizzle
npm install -D drizzle-kit @neondatabase/serverless
npm install bcryptjs
npm install -D @types/bcryptjs

\`\`\`

### 2. Environment Variables

Make sure these are set in your `.env.local` or Vercel environment:

\`\`\`env
# Better Auth
BETTER_AUTH_URL=http://localhost:3000  # or your production URL
BETTER_AUTH_SECRET=<generate-with-openssl-rand-hex-32>

# Database
DATABASE_URL=postgresql://...  # Your Neon PostgreSQL connection

# OAuth Providers (already configured in your project)
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>

# For file uploads/migrations
MIGRATION_SECRET=<generate-a-secret-token>
\`\`\`

To generate `BETTER_AUTH_SECRET`:

\`\`\`bash
openssl rand -hex 32
\`\`\`

### 3. Generate Database Migrations

\`\`\`bash
# Generate initial migration from schema
npx drizzle-kit generate

# Run migrations
npx drizzle-kit migrate
\`\`\`

### 4. Initialize Feature Flags

\`\`\`bash
# Run the initialization script
npx ts-node scripts/init-db.ts
\`\`\`

This creates the initial feature flags in your database:
- `use_better_auth`: Controls rollout of Better Auth (0% → 100%)
- `enable_oauth`: Controls OAuth provider availability

### 5. Deploy to Vercel

\`\`\`bash
# Push changes to GitHub
git add .
git commit -m "Phase 1: Better Auth & Drizzle setup"
git push

# Deploy to Vercel (automatic or via CLI)
vercel deploy
\`\`\`

### 6. Run Database Migrations in Production

\`\`\`bash
curl -X POST https://your-app.vercel.app/api/db/migrate \
  -H "Authorization: Bearer your-migration-secret"
\`\`\`

## File Structure

\`\`\`
app/
├── api/
│   ├── auth/
│   │   ├── route.ts                 # Better Auth main handler
│   │   ├── session/route.ts         # Get current session
│   │   ├── verify-email/route.ts    # Email verification
│   │   ├── refresh-session/route.ts # Keep session alive
│   │   ├── signout/route.ts         # Sign out user
│   │   ├── request-password-reset/route.ts
│   │   └── reset-password/route.ts
│   ├── admin/
│   │   └── flags/route.ts           # Feature flag management
│   └── db/
│       └── migrate/route.ts         # Run pending migrations
├── dashboard/page.tsx               # Protected page
├── profile/page.tsx
├── login/page.tsx
├── signup/page.tsx
├── forgot-password/page.tsx
├── reset-password/page.tsx
├── verify-email/page.tsx
├── page.tsx
└── layout.tsx
db/
├── schema.ts                         # Drizzle schema definition
└── migrations/                       # Auto-generated SQL migrations
lib/
├── auth.ts                           # Better Auth configuration
├── auth-client.ts                    # Client-side auth
├── auth-helpers.ts                   # Server utilities
├── db.ts                             # Database connection
├── feature-flags.ts                  # Feature flag logic
└── migration-helpers.ts              # NextAuth → Better Auth migration
hooks/
├── use-auth.ts                       # Auth state hook
components/
├── auth-provider.tsx                 # Auth context provider
scripts/
├── init-db.ts                        # Initialize database with flags
drizzle.config.ts                     # Drizzle configuration
middleware.ts                         # Next.js middleware
\`\`\`

## Key Features Implemented

### Authentication Methods
- Email + Password (with 8-char minimum)
- Google OAuth
- GitHub OAuth
- Email verification required
- Password reset flow

### Database Schema
- `users`: Core user data with migration tracking
- `sessions`: User sessions with IP/User-Agent tracking
- `accounts`: Linked OAuth accounts
- `verification_tokens`: Email verification & password reset tokens
- `auth_feature_flags`: Feature flag configuration

### Security Features
- HTTPS-only in production
- HTTPOnly, Secure, SameSite cookies
- CSRF protection (built-in)
- Password hashing with bcrypt
- Rate limiting on auth endpoints (implement as needed)
- Middleware for protected routes

### Feature Flags
- Gradual rollout of Better Auth
- Support for percentage-based rollout
- Target specific users
- Admin dashboard to manage flags

## Gradual Migration Strategy

### Test (0% Rollout)
\`\`\`javascript
// Initial flag state
use_better_auth: isEnabled=true, rolloutPercentage=0
\`\`\`
- All new users still use existing auth
- Internal team tests Better Auth in separate environment

### Expand (10% Rollout)
\`\`\`javascript
use_better_auth: rolloutPercentage=10
\`\`\`
- 10% of new users directed to Better Auth
- Monitor for issues
- Gather feedback

### Increase (50% Rollout)
\`\`\`javascript
use_better_auth: rolloutPercentage=50
\`\`\`
- Half of new users on Better Auth
- Verify compatibility with all features

### Complete (100% Rollout)
\`\`\`javascript
use_better_auth: rolloutPercentage=100
\`\`\`
- All new users on Better Auth
- Plan migration of existing users
- Archive NextAuth code

## Using the Feature Flag Admin Page

Navigate to `/admin/flags` (requires admin role):

1. **View All Flags**: See current state of all feature flags
2. **Update Rollout %**: Adjust percentage for gradual rollout
3. **Monitor Changes**: See timestamps of last updates
4. **Reset**: Change `rolloutPercentage` to 0 to disable if needed

## Testing

### Test Email/Password Login
\`\`\`bash
# Signup
POST /api/auth/sign-up
{
  "email": "test@example.com",
  "password": "TestPassword123"
}

# Login
POST /api/auth/sign-in/email
{
  "email": "test@example.com",
  "password": "TestPassword123"
}

# Check Session
GET /api/auth/session
\`\`\`

### Test OAuth Flow
- Click "Sign in with Google" → redirects to Google → returns with session
- Click "Sign in with GitHub" → redirects to GitHub → returns with session

### Test Protected Routes
- Try accessing `/dashboard` without login → redirects to `/login?from=/dashboard`
- Login successfully → can access dashboard
- Logout → redirected back to homepage

### Test Password Reset
\`\`\`bash
# Request reset
POST /api/auth/request-password-reset
{ "email": "test@example.com" }

# Check console for reset link (in dev mode)
# Reset password with token
POST /api/auth/reset-password
{ "token": "...", "password": "NewPassword123" }
\`\`\`

## Common Issues & Solutions

### Issue: Database Connection Fails
**Solution**: 
- Verify `DATABASE_URL` in environment variables
- Test connection: `psql $DATABASE_URL`
- Check Neon dashboard for connection limits

### Issue: OAuth Callbacks Not Working
**Solution**:
- Verify redirect URIs in Google Cloud / GitHub settings
- Check that `BETTER_AUTH_URL` matches your domain
- HTTPS required in production

### Issue: Migrations Don't Run
**Solution**:
- Run manually: `npx drizzle-kit migrate`
- Check `__drizzle_migrations__` table exists
- Verify non-pooling database connection

### Issue: Sessions Not Persisting
**Solution**:
- Verify cookies are being set: Check browser DevTools → Application → Cookies
- Check `BETTER_AUTH_SECRET` is same in all environments
- Verify middleware.ts is configured correctly

## Monitoring & Debugging

### Check Current Sessions
\`\`\`sql
SELECT * FROM sessions WHERE created_at > NOW() - INTERVAL '1 hour';
\`\`\`

### Monitor Feature Flag Rollout
\`\`\`sql
SELECT * FROM auth_feature_flags WHERE flag_name = 'use_better_auth';
\`\`\`

### View Verification Tokens
\`\`\`sql
SELECT * FROM verification_tokens WHERE used = false AND expires_at > NOW();
\`\`\`

### Clear Expired Sessions
\`\`\`sql
DELETE FROM sessions WHERE expires_at < NOW();
\`\`\`

## Next Steps

Once Phase 1 is stable (24+ hours without issues):

1. **Phase 2**: Setup Drizzle ORM for entire application
2. **Phase 3**: Implement Workflow automation (emails)
3. **Phase 4**: Add real-time Chat SDK
4. **Phase 5**: Expand Feature Flags system
5. **Phase 6**: Add Streaming for performance

## Support & References

- Better Auth Docs: https://better-auth.js.org
- Drizzle ORM: https://orm.drizzle.team
- Neon Docs: https://neon.tech/docs
- Next.js 16 App Router: https://nextjs.org/docs/app

## Key Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `BETTER_AUTH_URL` | Base URL for auth | `https://myapp.com` |
| `BETTER_AUTH_SECRET` | Signing secret | `abc123...` |
| `DATABASE_URL` | PostgreSQL connection | `postgres://...` |
| `GOOGLE_CLIENT_ID` | Google OAuth | `client.id@...` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | `abc123...` |
| `GITHUB_CLIENT_ID` | GitHub OAuth | `abc123...` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | `abc123...` |
| `MIGRATION_SECRET` | Admin-only operations | `migration_token_xyz` |

 
## 2026 Auth protections: tracing, quotas, and log redaction

- Auth routes now emit structured JSON logs with redaction for emails/tokens/password-like fields.
- Middleware injects and forwards correlation IDs for request tracing across auth flows.
- Registration and forgot-password endpoints enforce both per-IP and per-user quotas to reduce abuse.
- Error logging in auth API helpers now uses redacted structured logs.

 
## API Contract Note: Envelope + `/api/v1`

Auth endpoints now support a standardized API envelope for stable external consumption:
- `success`
- `data`
- `error`
- `requestId`
- optional `meta`

New integrations should prefer `/api/v1/auth/*` routes where available. Existing `/api/auth/*` routes remain active for backward compatibility and continue to expose legacy fields during migration windows.

For safe client migration:
1. Prioritize `error.code` and `error.message`.
2. Use `requestId` for auth incident traceability.
3. Read canonical payload from `data` and retain legacy fallback parsing until migration completion.

## Agent Chat API Security Guardrails

The versioned backend route `POST /api/v1/agents/chat` enforces authentication for every chat turn before model execution starts.

### Per-turn controls
- Require an authenticated session (`getServerSession`) and return `401` when missing.
- Apply per-user/IP rate limits to chat turns (`30` requests per minute window).
- Validate requested tools against an allow-list and deny unknown tool names.
- Enforce permission checks for requested tools using RBAC before streaming any response tokens.
- Return and propagate `x-correlation-id` so client and server logs can be matched safely.

### Logging policy
- Log turn lifecycle events as structured records: `turn_started`, `turn_completed`, `turn_failed`, and policy rejections.
- Never log chat message content, auth credentials, or sensitive data; only metadata (counts, IDs, timing, policy outcomes).


