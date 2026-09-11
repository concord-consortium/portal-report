# The `portal-report` deploy role

The workflows in `.github/workflows/` assume `arn:aws:iam::612297603577:role/portal-report` via GitHub OIDC. This directory records how that role is built, and the one way it deviates from the org's standard setup.

The general explanation of how OIDC deploys work at Concord is in [deploy-setup.md in starter-projects](https://github.com/concord-consortium/starter-projects/blob/main/doc/deploy-setup.md). Read that first. This file only covers what is different here.

## The deviation: a different bucket

The org's script, `scripts/create-deploy-role.sh` in [`starter-projects`](https://github.com/concord-consortium/starter-projects), does three things: it creates the role with a GitHub OIDC trust policy, tags it `RepoName=<repo>`, and attaches the shared managed policy `S3-deploy-by-role-tag`.

The third step is wrong for this repo. That managed policy grants access only to:

```
arn:aws:s3:::models-resources/${aws:PrincipalTag/RepoName}/*
```

This project does not deploy to `models-resources`. It deploys to its own bucket, `portal-report.concord.org`, and `ci.yml` passes `noPrefix: true` so files are written across the whole bucket rather than under a repo-named prefix. The managed policy would grant write access to a `models-resources/portal-report/*` path that nothing uses, and every deploy would still fail with `AccessDenied`.

So this role gets an inline policy for its own bucket instead of the managed one. The `RepoName` tag is kept for consistency with other repos even though nothing consumes it here — it only carries meaning for the `models-resources` policy we are deliberately not attaching.

## Why the S3 policy is shaped this way

[`portal-report-s3-policy.json`](portal-report-s3-policy.json) grants four actions. Each one is needed:

- **`s3:PutObject`** — the deploy writes the built files.
- **`s3:DeleteObject`** — `s3-deploy-action` syncs with `--delete`, which removes files that no longer exist in the build.
- **`s3:ListBucket`** — also required by `--delete`. The sync has to enumerate the destination to discover those orphaned files; without it the deploy fails.
- **`s3:GetObject`** — the release workflows copy one S3 key to another (`version/<tag>/index-top.html` to `index.html`), and `s3-deploy-action` does the same for the `topBranches` copy. A server-side copy reads the source object.

`ListBucket` is granted on the whole bucket with no `s3:prefix` condition, because
`noPrefix: true` means the deploy touches paths across the bucket rather than one prefix.

No `s3:PutObjectAcl` is granted. The workflows pass no `--acl`.

## Recreating the role

Run the org's script from the root of this repo, then replace the managed policy:

```sh
/path/to/starter-projects/scripts/create-deploy-role.sh portal-report

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

aws iam detach-role-policy \
  --role-name portal-report \
  --policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/S3-deploy-by-role-tag

aws iam put-role-policy \
  --role-name portal-report \
  --policy-name portal-report-s3 \
  --policy-document file://docs/iam/portal-report-s3-policy.json
```

The role name **must** be `portal-report` — the workflows hard-code that ARN.

Re-running the script against the existing role is safe for the trust policy; it updates it in place. But it re-attaches the managed policy every time, so the `detach-role-policy` step has to be repeated afterwards.

The trust policy the script produced is recorded in [`portal-report-trust-policy.json`](portal-report-trust-policy.json). If you ever need to set it directly rather than through the script:

```sh
aws iam update-assume-role-policy --role-name portal-report \
  --policy-document file://docs/iam/portal-report-trust-policy.json
```

## The two subject claim formats

The trust policy lists two values for the `sub` condition:

```
repo:concord-consortium/portal-report:*
repo:concord-consortium@319219/portal-report@53022080:*
```

The first is the legacy name-only format; the second embeds the numeric owner and repo IDs. GitHub has changed its default to the second form for repositories created or transferred after 2026-07-15, per [the changelog](https://github.blog/changelog/2026-04-23-immutable-subject-claims-for-github-actions-oidc-tokens/). This repo is old enough to still send the legacy form, and the script confirmed that when the role was created. Both are listed so the role keeps working if that changes.

This matters because a policy matching only one format never matches the other, and the failure looks like a permissions problem:

```
Could not assume role with OIDC: Not authorized to perform sts:AssumeRoleWithWebIdentity
```

The permissions are fine in that case; the subject string simply does not match. Ask GitHub what it will actually send:

```sh
gh api /repos/concord-consortium/portal-report/actions/oidc/customization/sub
```

## Verify

```sh
aws iam get-role --role-name portal-report \
  --query 'Role.[Arn,AssumeRolePolicyDocument.Statement[0].Condition.StringLike]'
aws iam list-role-tags --role-name portal-report
aws iam list-role-policies --role-name portal-report
aws iam list-attached-role-policies --role-name portal-report
```

Expect the ARN `arn:aws:iam::612297603577:role/portal-report`, both `sub` values, the tag `RepoName=portal-report`, the inline policy `portal-report-s3`, and **no** attached managed policies. A `S3-deploy-by-role-tag` showing up in that last list means the script was re-run and the detach step was skipped.
