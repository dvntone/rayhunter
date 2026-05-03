# GitHub Actions

This directory contains reusable GitHub Actions for the Rayhunter project.

## Available Actions

### setup-rust

Set up the Rust toolchain with caching and optional cross-compilation targets.

**Inputs:**
- `toolchain` (optional): Rust toolchain version (default: `stable`)
- `target` (optional): Additional Rust target for cross-compilation
- `components` (optional): Comma-separated list of components to install
- `cache` (optional): Enable Rust caching (default: `true`)
- `cache-key` (optional): Additional cache key

**Example usage:**

```yaml
- uses: ./.github/actions/setup-rust
  with:
    toolchain: stable
    components: rustfmt,clippy
    target: armv7-unknown-linux-musleabihf
```

### setup-node-project

Set up Node.js environment and install dependencies for a project.

**Inputs:**
- `node-version` (optional): Node.js version (default: `20`)
- `working-directory` (required): Directory containing package.json
- `cache` (optional): Enable npm caching (default: `true`)
- `install-deps` (optional): Run npm install (default: `true`)

**Example usage:**

```yaml
- uses: ./.github/actions/setup-node-project
  with:
    node-version: '20'
    working-directory: daemon/web
```

## Contributing

When creating new actions:

1. Create a new directory under `.github/actions/`
2. Add an `action.yml` file with the action definition
3. Document inputs, outputs, and usage examples
4. Update this README with the new action details
5. Test the action in a workflow before committing

## Best Practices

- Use semantic versioning for action releases
- Keep actions focused on a single responsibility
- Document all inputs and outputs clearly
- Include branding (icon and color) for better visibility
- Test actions thoroughly before merging to main
