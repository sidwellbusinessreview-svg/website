# Security policy

## Reporting a security issue

Please report suspected security or privacy problems privately to the publication Gmail account used for administration. Do not open a public GitHub issue containing exploit details, private student information, credentials, or screenshots of sensitive data.

Include a concise description, the affected page or service, steps to reproduce the issue, and the potential impact. The administrative account owner should acknowledge the report, restrict access to the details, and coordinate a fix before any public disclosure.

## Secrets and credentials

Secrets must never be committed to this repository. This includes passwords, API tokens, private keys, webhook secrets, service-account files, recovery codes, and populated environment files. Store local values in ignored `.env` files and keep hosted values in the deployment provider’s protected environment settings.

Draft preview credentials are server-only. `SANITY_API_READ_TOKEN` and `SANITY_PREVIEW_SECRET` must never enter client components, browser JavaScript, public environment variables, logs, screenshots, or issue reports. Preview validates an expiring Studio-generated secret or a long administrator fallback secret, restricts redirects to this site, disables draft caching, and discourages indexing. Rate-limit repeated invalid preview requests at the hosting edge when deployed.

If a secret is exposed:

1. Revoke or rotate it immediately in the affected service.
2. Review access and audit logs for unauthorized use.
3. Replace the value in every legitimate environment.
4. Notify the publication’s administrative account owner.
5. Remove the secret from Git history when necessary. Deleting it only from the latest file is not sufficient.
6. Document the incident and the steps taken without repeating the secret.

## Student privacy

Collect and publish the minimum student personal information necessary for the Review. Avoid personal phone numbers, personal email addresses, home addresses, schedules, private school records, and unnecessary identifying metadata. Use publication-managed contact channels whenever possible, obtain appropriate permission for profile details and photographs, and follow school policy for student data.

## Supported code

Security reports should focus on the current default branch and the live production site once one exists. Dependency advisories are reviewed deliberately; do not run destructive or forced automated fixes without understanding their architecture impact.
