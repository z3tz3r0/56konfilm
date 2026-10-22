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
2. Run the safe wrapper's dry-run against each intended dataset explicitly:

   ```sh
   pnpm exec tsx scripts/run-credential-migration.ts --project PROJECT_ID --dataset DATASET_NAME
   ```

   Dry-run is the default; `--dry-run` can also be supplied explicitly. The wrapper
   runs the installed native CLI, but discards its raw stdout/stderr, including
   errors. It prints only the migration, quoted target names, mode and safe outcome.
   It does not load environment files itself; normal Sanity CLI startup may do so.
   Use an already authenticated Sanity CLI account with the required permissions.
   Both `--project` and `--dataset` are required; there is no implicit target.

3. Apply in the coordinated window, then deploy the matching auth code:

   ```sh
   pnpm exec tsx scripts/run-credential-migration.ts --project PROJECT_ID --dataset DATASET_NAME --no-dry-run
   ```

   The wrapper requires an interactive terminal and asks for confirmation once
   (default: cancel). It then forces native `--no-progress`, `--concurrency 1` and
   `--no-confirm`. There are no passthrough flags: `--progress`, `--no-confirm`,
   concurrency overrides, duplicate/conflicting options and unknown flags are
   rejected. Run with `--help` for usage without starting the CLI.

   **Direct native apply is blocked, even if `--no-progress` is supplied.** Use
   this wrapper as the single apply entry. Its child-only process marker prevents
   accidental unsafe invocation; it is not a secret or an authorization boundary.
   Native migration discovery/list remain supported. Do not enable debug logging.

   The migration performs one revision-guarded atomic create/delete, preserves
   the existing bcrypt hash, and never overwrites a conflicting target. It stops
   for missing/malformed records, conflicting drafts/releases, or live references.
   A completed migration is a no-op on rerun. It does not publish drafts or rotate
   passwords, tokens, or session secrets.

   The wrapper waits until the native CLI process closes before reporting one
   final outcome:

   | Outcome                 | Exit code | Meaning                                                                                       |
   | ----------------------- | --------- | --------------------------------------------------------------------------------------------- |
   | Dry-run completed       | `0`       | Native dry-run finished; no writes were requested.                                            |
   | Apply command completed | `0`       | Native apply finished successfully; it may have required no changes.                          |
   | Failure                 | `1`       | Completion was not confirmed. Check permissions, target and credential state before retrying. |
   | Cancelled / Ctrl+C      | `130`     | If apply already started, changes may have committed. Verify before retrying.                 |

   Success does **not** assert changed-document counts, immediate query visibility
   or public-access protection. There is no automatic postcheck or retry. The
   runner does not infer results from progress output or claim rollback on error.
   To inspect the exit code immediately after the command, use `echo $?` in Bash
   or `$LASTEXITCODE` in PowerShell, before running any other command.

4. Verify with **metadata/boolean-only requests**: without a token, neither the
   old nor protected credential ID should be visible. With an authorized token
   and raw perspective, only the protected record should exist. Test login,
   password change, and subsequent login using the new password. Do not print
   or send hashes/tokens during verification. Mock tests do not prove deployed ACLs.
5. If prior public exposure is confirmed, rotate the password after securing the
   record. Decide separately whether to rotate the session secret to invalidate
   existing sessions. Do not roll back by restoring public credentials; recover
   forward using the protected setup tool.

### Optional detailed dry-run preview

The wrapper hides mutation details. To inspect the existing **redacted preview**,
native dry-run remains available without the wrapper marker:

```sh
pnpm exec sanity migrations run protect-cms-credentials --project PROJECT_ID --dataset DATASET_NAME
```

Username/hash values in generated preview mutations are replaced for display;
IDs/actions/revision guards remain. Never apply printed preview JSON. This is not
the apply entry, and `--no-progress` does not hide native dry-run formatting.
Native CLI errors are not filtered on this direct path: do not enable debug logs
or share unreviewed terminal output. Dry-run validates the exported credential
records; live reference and revision checks are repeated during apply.

### Account maintenance

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
