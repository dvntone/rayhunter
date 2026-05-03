# GitHub Workflows

This directory contains CI/CD workflows and automation for the Rayhunter project.

## Workflows Overview

### Main CI/CD Workflows

#### `main.yml`
**Main CI/CD Pipeline**
- Triggers: Push/PR to main, workflow_call
- Detects file changes to optimize build times
- Runs tests, linting, and builds for all platforms
- Builds installers and creates release artifacts
- Publishes documentation to GitHub Pages

#### `release.yml`
**Release Management**
- Trigger: Manual workflow dispatch
- Ensures version consistency across Cargo.toml files
- Calls main.yml to build all artifacts
- Creates GitHub releases with generated notes

### Security & Quality

#### `codeql.yml`
**CodeQL Security Analysis**
- Triggers: Push/PR to main, weekly schedule, manual
- Analyzes Rust and JavaScript/TypeScript code
- Identifies security vulnerabilities and code quality issues
- Runs on a weekly schedule to catch new vulnerability patterns

#### `check-links.yml`
**Link Validation**
- Triggers: Push/PR affecting docs, weekly schedule, manual
- Validates all links in markdown documentation
- Prevents broken links in documentation
- Runs weekly to catch external link changes

### Dependency Management

#### `dependency-updates.yml`
**Dependency Update Tracking**
- Trigger: Weekly schedule (Monday 9am UTC), manual
- Checks for outdated Rust (cargo) dependencies
- Checks for outdated npm dependencies in daemon/web and installer-gui
- Creates/updates GitHub issues with update information

### PR Automation

#### `labeler.yml`
**Automatic PR Labeling**
- Triggers: PR opened/synchronized/reopened
- Automatically labels PRs based on changed files
- Labels: rust, daemon, installer, frontend, javascript, svelte, documentation, ci, tests, dependencies, build, security

#### `pr-size-labeler.yml`
**PR Size Labeling**
- Triggers: PR opened/synchronized/reopened
- Labels PRs by size (XS, S, M, L, XL)
- Warns about extra-large PRs
- Ignores lock files and images

#### `greetings.yml`
**First-Time Contributor Welcome**
- Triggers: First issue or PR from a new contributor
- Welcomes new contributors with helpful information
- Links to contributing guidelines

### Maintenance

#### `stale.yml`
**Stale Issue/PR Management**
- Trigger: Daily at 1am UTC, manual
- Marks issues stale after 90 days of inactivity
- Marks PRs stale after 60 days of inactivity
- Closes stale issues after 7 days
- Closes stale PRs after 14 days
- Exempts pinned, security, bug, and enhancement issues

## Configuration Files

### `labeler.yml`
Configuration for automatic PR labeling based on file patterns.

### `markdown-link-check-config.json`
Configuration for link checking, including patterns to ignore and retry behavior.

## Usage

### Running Workflows Manually

Most workflows support manual triggering via `workflow_dispatch`:

1. Go to Actions tab in GitHub
2. Select the workflow from the left sidebar
3. Click "Run workflow" button
4. Select the branch and click "Run workflow"

### Workflow Permissions

Workflows use minimal required permissions:
- `contents: read` - Read repository contents
- `contents: write` - Create releases, push to pages
- `issues: write` - Create/update issues
- `pull-requests: write` - Label and comment on PRs
- `security-events: write` - Upload CodeQL results
- `pages: write` - Deploy to GitHub Pages

### Skipping Workflows

To skip CI workflows in a commit, include `[skip ci]` or `[ci skip]` in the commit message.

### Force Full Build

To force a full build on a PR without merging to main, include `#build-all` in the commit message.

## Best Practices

1. **Test workflows locally** when possible using [act](https://github.com/nektos/act)
2. **Use workflow_call** for reusable workflows
3. **Minimize permissions** - only request what's needed
4. **Cache dependencies** - use actions/cache or language-specific caching
5. **Use matrix builds** for multi-platform testing
6. **Document new workflows** - update this README
7. **Use composite actions** - see `.github/actions/` for reusable steps

## Monitoring

- Check the [Actions tab](../../actions) for workflow runs
- Enable notifications for failed workflows
- Review CodeQL security alerts regularly
- Monitor dependency update issues

## Troubleshooting

### Workflow fails on fork
Some workflows require specific permissions or secrets that may not be available on forks. Contributors should:
1. Push to a branch on the main repository if they have access
2. Or wait for maintainers to run workflows after PR creation

### Cache issues
If you experience cache-related issues:
1. Clear workflow caches from Settings > Actions > Caches
2. Or add a unique cache-key to force cache refresh

### Dependency update issues fail
Ensure the repository has labels configured:
- `dependencies`
- `rust`
- `npm`

## Contributing

When adding new workflows:
1. Follow existing patterns and naming conventions
2. Add appropriate permissions (minimal required)
3. Include workflow_dispatch for manual testing
4. Document the workflow in this README
5. Test the workflow before merging
6. Consider using composite actions for repeated steps

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Security hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
