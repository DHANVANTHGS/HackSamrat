# Operations Notes

## Metrics and Request Tracing

- `GET /metrics` returns in-process request counters and average latency when `ENABLE_METRICS=true`.
- Every response includes `x-request-id` for tracing.
- Error responses include the same request id.

## Admin Audit Log Access

- `GET /api/v1/admin/audit-logs`
- Requires header: `x-admin-token: <ADMIN_AUDIT_TOKEN>`

Supported filters:
- `action`
- `targetResource`
- `actorUserId`
- `limit`

## Security Baseline

- Basic CORS allowlist is controlled by `CORS_ALLOWED_ORIGINS`
- Security headers are added at the Express layer
- Metrics can be disabled with `ENABLE_METRICS=false`

## Backup and Restore

Recommended minimum backup plan:
- Daily PostgreSQL logical backup using `pg_dump`
- Daily object storage bucket backup or replication
- Weekly restore drill in a staging environment

Minimum restore sequence:
1. Restore PostgreSQL data
2. Restore object storage bucket contents
3. Reapply environment variables and secrets
4. Run `npm --prefix backend run prisma:generate`
5. Run service health checks: `/health`, `/ready`, `/metrics`

## Production Checklist

- Replace `ADMIN_AUDIT_TOKEN`
- Restrict `CORS_ALLOWED_ORIGINS`
- Set real TLS termination in front of the app
- Rotate exposed Neon credentials
- Move object storage off local defaults
- Disable verbose error details in production with `NODE_ENV=production`
