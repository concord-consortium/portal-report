# Deployment

S3 deployment is handled by GitHub Actions. Pushes are deployed to the `portal-report.concord.org` bucket by the `s3-deploy` job in [`ci.yml`](../.github/workflows/ci.yml). Branches land in `branch/<name>/` and tags land in `version/<name>/`.

A released version is promoted to `index-staging.html` by [`release-staging.yml`](../.github/workflows/release-staging.yml), and to the top-level `index.html` by [`release-production.yml`](../.github/workflows/release-production.yml). Both are run manually via `workflow_dispatch` with the version tag as the input.

The step-by-step release process is in the [README](../README.md#deployment).

## AWS Access

The GitHub actions in this project are allowed to update files in S3 using OIDC. An IAM role has been created in AWS with a trust policy that allows GitHub actions in this specific repository to assume this IAM role. The IAM role has a `RepoName` tag for consistency with other repositories, but this project deploys to its own `portal-report.concord.org` bucket rather than to `models-resources`, so the role carries an inline policy granting access to that bucket instead of the shared `S3-deploy-by-role-tag` managed policy.

See [deploy-setup.md in starter-projects](https://github.com/concord-consortium/starter-projects/blob/main/doc/deploy-setup.md) for how the AWS side is set up in general, and [iam/README.md](iam/README.md) for this project's role, including the policy documents and why it differs from the standard setup.
