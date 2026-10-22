# CMS credential protection and operator cutover

The content dataset may remain public on the Free plan. Custom CMS login uses
`private.cms-credentials`, not the public root ID `cms-credentials`. Sanity's
[document-path access rules](https://www.sanity.io/docs/content-lake/ids) require
authentication to read IDs containing a dot. This is API-enforced access control,
not an attempt to hide a URL. It does not make content or dataset assets private.

Credential reads and writes require the server-only `SANITY_API_TOKEN` with
appropriate document read/write access. Never put it in a `NEXT_PUBLIC_*` variable,
browser configuration, screenshots, or shared logs. Public content clients and
their cache tags are unchanged; credentials use uncached, non-CDN reads. Missing
protected credentials or missing token fail closed; there is no legacy-read fallback.

**Do not deploy this auth change independently of the data cutover.** Old code
cannot log in after the root record is removed, and new code cannot log in until
the protected record exists. Coordinate a short login/password-change window;
public website content remains independent. Existing JWTs are not automatically
revoked by this migration.

1. Stop credential edits/setup scripts and keep old deployments from writing during
   cutover. Store a backup in restricted-access storage outside the repository:
   it may contain credential hashes. Never attach the export to a PR.
2. Preview the native migration against each intended dataset explicitly:

   ```sh
   pnpm exec sanity migrations run protect-cms-credentials --project PROJECT_ID --dataset DATASET_NAME
   ```

   This is a **redacted preview**, not a replayable mutation payload: username and
   hash values are replaced for display only. IDs/actions/revision guards remain.
   The offline preview validates supplied credential records; live reference and
   revision checks are repeated during apply. Do not apply printed preview JSON.

3. Apply in the coordinated window, then deploy the matching auth code:

   ```sh
   pnpm exec sanity migrations run protect-cms-credentials --project PROJECT_ID --dataset DATASET_NAME --no-dry-run --concurrency 1 --no-progress
   ```

   **Always use `--no-progress` on apply.** The installed CLI otherwise prints
   transactions including hashes. Do not enable debug logs; review/redact any CLI
   failure output before sharing. CLI startup may load local environment files.
   The migration performs one revision-guarded atomic create/delete, preserves
   the existing bcrypt hash, and never overwrites a conflicting target. It stops
   for missing/malformed records, conflicting drafts/releases, or live references.
   A completed migration is a no-op on rerun. It does not publish drafts or rotate
   passwords, tokens, or session secrets.

4. Verify with **metadata/boolean-only requests**: without a token, neither the
   old nor protected credential ID should be visible. With an authorized token
   and raw perspective, only the protected record should exist. Test login,
   password change, and subsequent login using the new password. Do not print
   or send hashes/tokens during verification. Mock tests do not prove deployed ACLs.
5. If prior public exposure is confirmed, rotate the password after securing the
   record. Decide separately whether to rotate the session secret to invalidate
   existing sessions. Do not roll back by restoring public credentials; recover
   forward using the protected setup tool.

New installations and post-cutover account maintenance use:

```sh
pnpm exec tsx scripts/setup-cms-credentials.ts --create
pnpm exec tsx scripts/setup-cms-credentials.ts --update
pnpm exec tsx scripts/setup-cms-credentials.ts --reset
pnpm exec tsx scripts/setup-cms-credentials.ts --delete
```

All modes operate only on the protected ID and refuse legacy/unexpected records.
Reset collects and validates input before a revision-guarded update; cancellation
does not delete the account. Run the entry only in an authorized interactive
terminal: it loads `.env.local`. Tests use the injected helper instead and never
run the operator entry or real CLI.
