# Rayhunter — Codebase Guide for AI Assistants

## Project Overview

Rayhunter is an open-source IMSI catcher (cell-site simulator / "Stingray") detection tool by the EFF. It runs as firmware on cheap mobile hotspots, captures cellular modem diagnostic data via the Qualcomm DIAG protocol, and applies heuristic analyzers to flag suspicious activity.

Target devices are ARM-based mobile hotspots (Orbic RC400L, TP-Link M7350, Wingtech CT2MHS01, T-Mobile TMOHS1, UZ801, PinePhone) that expose a `/dev/diag` interface.

---

## Repository Layout

```
rayhunter/
├── lib/                  # Core library: parsing, analysis engine
├── daemon/               # Main daemon: web server, device I/O, recording
│   └── web/              # SvelteKit + TypeScript frontend
├── check/                # Standalone CLI analysis tool (no device needed)
├── rootshell/            # Privilege escalation helper pushed to device
├── telcom-parser/        # Generated LTE RRC ASN.1 parser
├── installer/            # Cross-platform device installer (runs on host)
├── installer-gui/        # Experimental Tauri GUI installer (not default workspace)
├── scripts/              # build-dev.sh, install-dev.sh
├── doc/                  # mdBook documentation source
├── dist/                 # config.toml.in template and release packaging
└── tools/                # devenv.dockerfile for consistent build environment
```

---

## Workspace Structure

The repo is a **Cargo workspace** (`Cargo.toml` at the root). Default members:

| Crate | Binary name | Purpose |
|---|---|---|
| `lib` | — | Core library (no binary) |
| `daemon` | `rayhunter-daemon` | Runs on device, hosts web UI |
| `check` | `rayhunter-check` | Offline QMDL/PCAP analyzer |
| `rootshell` | `rootshell` | Setuid helper for device init |
| `telcom-parser` | — | LTE RRC parser (generated) |
| `installer` | `installer` | Installs firmware onto devices |

`installer-gui/src-tauri` is a workspace member but **excluded from `default-members`** — it requires Tauri and extra OS dependencies.

All crates share version `0.10.1`. The release workflow enforces that all `Cargo.toml` files have the same version.

---

## Build System

### Prerequisites

- Rust toolchain via `rustup` (MSRV for `daemon`: **1.88.0**)
- Node.js / npm (for the SvelteKit frontend in `daemon/web/`)
- ARM cross-compilation target: `rustup target add armv7-unknown-linux-musleabihf`

### Common Build Commands

```bash
# Full dev build: frontend + ARM daemon + rootshell
./scripts/build-dev.sh build

# Frontend only (daemon/web/)
./scripts/build-dev.sh frontend

# Check prerequisites only
./scripts/build-dev.sh check

# Install to a connected device (runs cargo run -p installer)
./scripts/install-dev.sh <device>   # e.g. orbic, tplink, pinephone, uz801

# Run all tests
cargo test --verbose

# Linting (must be clean — CI uses -Dwarnings)
cargo clippy --verbose

# Formatting check
cargo fmt --all --check
```

### Cargo Aliases (`.cargo/config.toml`)

```bash
cargo build-daemon-firmware          # armv7, firmware profile, ring-tls (smallest binary)
cargo build-daemon-firmware-devel    # armv7, firmware-devel profile, rustcrypto
cargo build-rootshell-firmware       # armv7, firmware profile
cargo build-rootshell-firmware-devel # armv7, firmware-devel profile
```

### Build Profiles

| Profile | Use case | Characteristics |
|---|---|---|
| `release` | Desktop/CLI tools | LTO fat, opt-level z, line numbers preserved |
| `firmware-devel` | Dev builds for device | opt-level s, no LTO, larger but faster to build |
| `firmware` | Production device firmware | Strip all, codegen-units 1, panic abort, smallest size |

### Frontend (SvelteKit)

```bash
cd daemon/web
npm install
npm run build   # outputs to daemon/web/build/ (embedded in daemon binary)
npm run dev     # local dev server
npm run lint
npm test        # vitest
```

### Docker Build

```bash
./docker_make.sh   # Builds in rust:1.86-bullseye container for reproducible ARM builds
```

### Environment Variables

| Variable | Effect |
|---|---|
| `NO_FIRMWARE_BIN=true` | Skip embedding the firmware binary in the installer (for local dev/testing) |

---

## Architecture

### Data Flow

```
/dev/diag  →  DiagDevice  →  QmdlWriter  →  .qmdl files
                                              ↓
                                         QmdlReader → Harness → AnalysisRow (NDJSON)
                                              ↓
                                         GsmtapParser → InformationElement → Analyzer[]
```

### Async Runtime

The daemon uses **Tokio single-threaded** (`#[tokio::main(flavor = "current_thread")]`). Tasks are spawned via `TaskTracker` and coordinate via `tokio::sync::mpsc` channels and `CancellationToken` for graceful shutdown.

### Key Threads / Tasks

- **Diag read thread** (`daemon/src/diag.rs`): Reads from `/dev/diag`, writes QMDL files, monitors disk space
- **Analysis thread** (`daemon/src/analysis.rs`): Reads QMDL files, runs `Harness`, writes NDJSON reports
- **HTTP server** (`daemon/src/server.rs`): Axum router serving REST API + embedded SvelteKit frontend
- **Display thread** (`daemon/src/display/`): Updates device framebuffer based on `DisplayState`
- **Notification worker** (`daemon/src/notifications.rs`): Sends ntfy.sh alerts on warnings
- **Battery worker** (`daemon/src/battery.rs`): Monitors battery, triggers low-battery notifications

### REST API Routes

```
GET  /api/qmdl-manifest          → recording list
GET  /api/system-stats           → CPU, memory, battery
GET  /api/pcap/{name}            → download PCAP
GET  /api/qmdl/{name}            → download QMDL
GET  /api/zip/{name}             → download ZIP archive
GET  /api/analysis-report/{name} → NDJSON analysis report
GET  /api/analysis               → analysis status
POST /api/analysis/{name}        → trigger analysis
POST /api/start-recording        → start diag recording
POST /api/stop-recording         → stop recording
POST /api/delete-recording/{name}
POST /api/delete-all-recordings
GET  /api/config                 → current config
POST /api/config                 → update config
POST /api/test-notification
GET  /api/time
POST /api/time-offset
GET  /{*path}                    → SvelteKit frontend (embedded via include_dir)
```

---

## Core Library (`lib/`)

### Key Modules

| File | Purpose |
|---|---|
| `diag.rs` | Qualcomm DIAG protocol: message types, CRC-CCITT, HDLC framing |
| `diag_device.rs` | Opens `/dev/diag`, configures modem logging, streams messages |
| `qmdl.rs` | QMDL file format: `QmdlWriter<T>` / `QmdlReader<T>` |
| `gsmtap.rs` | GSMTAP packet format, header types, cell technology enums |
| `gsmtap_parser.rs` | Converts DIAG messages → GSMTAP packets |
| `hdlc.rs` | HDLC encode/decode (byte-stuffing, CRC validation) |
| `pcap.rs` | PCAP-NG writer for packet export |
| `analysis/` | Heuristic analyzer framework + all detector implementations |

### Analysis Framework

The `Analyzer` trait in `lib/src/analysis/analyzer.rs`:

```rust
pub trait Analyzer {
    fn get_name(&self) -> Cow<'_, str>;
    fn get_description(&self) -> Cow<'_, str>;
    fn analyze_information_element(
        &mut self,
        ie: &InformationElement,
        packet_num: usize,
    ) -> Option<Event>;
    fn get_version(&self) -> u32;
}
```

**Event severity** (`EventType`): `Informational` (no alert) → `Low` → `Medium` → `High`

The `Harness` struct in `analyzer.rs` holds all active analyzers and is configured via `AnalyzerConfig` (mirrors the `[analyzers]` section of `config.toml`).

Analysis output is **Newline Delimited JSON (NDJSON)**:
- Line 1: `ReportMetadata` (analyzer names, versions, `report_version`)
- Remaining lines: `AnalysisRow` (per-packet, with events from each analyzer)

Current `REPORT_VERSION = 2`. The `AnalysisRow` deserializer handles both v1 and v2 formats for backward compatibility.

### Adding a New Analyzer

1. Create `lib/src/analysis/my_analyzer.rs`, implement `Analyzer`
2. Add `mod my_analyzer;` in `lib/src/analysis/mod.rs`
3. Add a field to `AnalyzerConfig` in `analyzer.rs` (default `true` unless experimental)
4. Register in `Harness::new_with_config()` in `analyzer.rs`
5. Add the toggle to `dist/config.toml.in` under `[analyzers]`
6. Bump `get_version()` when the heuristic logic changes substantially

### Existing Analyzers

| Module | Detects |
|---|---|
| `null_cipher.rs` | EEA0 (null) ciphering in LTE/5G RRC |
| `nas_null_cipher.rs` | Null ciphering at NAS layer |
| `imsi_requested.rs` | IMSI/IMEI request patterns (state machine) |
| `connection_redirect_downgrade.rs` | Forced 2G downgrade via RRC redirect |
| `priority_2g_downgrade.rs` | SIB6/SIB7 preference for 2G networks |
| `incomplete_sib.rs` | Missing/incomplete System Information Blocks |
| `diagnostic.rs` | General diagnostic anomalies |
| `test_analyzer.rs` | Always fires — for testing harness only |

---

## Daemon (`daemon/`)

### Module Overview

| Module | Responsibility |
|---|---|
| `main.rs` | Orchestration, startup loop, task wiring |
| `server.rs` | Axum router and all HTTP handler functions |
| `diag.rs` | Diag device read loop, QMDL file writing |
| `analysis.rs` | Analysis worker thread |
| `qmdl_store.rs` | Recording manifest, lifecycle management |
| `config.rs` | TOML config parsing, CLI args |
| `display/` | Device-specific framebuffer rendering |
| `notifications.rs` | ntfy.sh push notification integration |
| `battery.rs` | Battery level monitoring |
| `key_input.rs` | Hardware button input handling |
| `stats.rs` | System stats (CPU, memory, log) |
| `pcap.rs` | PCAP route handler |
| `error.rs` | `RayhunterError` enum |

### Display System

Each device has its own display module under `daemon/src/display/`:
- `orbic.rs`, `tplink.rs`, `tmobile.rs`, `wingtech.rs`, `uz801.rs` — framebuffer-based
- `headless.rs` — fallback for no-display devices (PinePhone)
- `generic_framebuffer.rs` — shared framebuffer rendering logic

`DisplayState` values: `Recording`, `Paused`, `WarningDetected`

UI level (configured in `config.toml`) controls display verbosity from invisible (0) through full-screen color (4).

### TLS Feature Flags

- `rustcrypto-tls` (default): Pure Rust, slightly larger binary
- `ring-tls`: Uses `ring` crate, smaller binary — used in `firmware` production builds

---

## Frontend (`daemon/web/`)

**Stack:** SvelteKit v2 + Svelte 5 + TypeScript + Tailwind CSS v3 + Vite + Vitest

Key source files:
- `src/routes/+page.svelte` — main dashboard
- `src/lib/components/` — reusable UI components
- `src/lib/manifest.svelte.ts` — recording manifest store (1s polling)
- `src/lib/analysisManager.svelte.ts` — analysis progress tracking
- `src/lib/analysis.svelte.ts` — analysis report fetching

The built output is embedded into the daemon binary at compile time via `include_dir`.

---

## Device Configuration (`dist/config.toml.in`)

This template is the basis for `config.toml` deployed to devices:

```toml
qmdl_store_path = "/data/rayhunter/qmdl"
port = 8080
debug_mode = false
colorblind_mode = false
# device = "orbic"   # set by installer
ui_level = 1         # 0=invisible, 1=subtle, 2=demo, 3=logo, 4=full-screen
key_input_mode = 0   # 0=disabled, 1=double-tap power button

ntfy_url = ""
enabled_notifications = ["Warning", "LowBattery"]

min_space_to_start_recording_mb = 1
min_space_to_continue_recording_mb = 1

[analyzers]
imsi_requested = true
connection_redirect_2g_downgrade = true
lte_sib6_and_7_downgrade = true
null_cipher = true
nas_null_cipher = true
incomplete_sib = true
test_analyzer = false
diagnostic_analyzer = true
```

`debug_mode = true` skips opening `/dev/diag` and requires a pre-existing QMDL store — useful for local testing.

---

## Installer (`installer/`)

The installer runs on the **host machine** (not the device) and handles device-specific install logic:

- `orbic.rs` / `orbic_network.rs` — USB/ADB and network-based installation
- `tplink.rs` — TP-Link via telnet/HTTP admin panel
- `pinephone.rs` — PinePhone via ADB
- `uz801.rs` — UZ801 via HTTP backdoor
- `wingtech.rs` / `tmobile.rs` — Wingtech/T-Mobile via telnet

Platform-specific ADB transport:
- Linux: `trans-nusb` (direct USB via `nusb`)
- macOS/Windows: `trans-libusb`

---

## CI/CD (`.github/workflows/main.yml`)

CI runs on push/PR to `main`. Key environment variables:
- `CARGO_TERM_COLOR: always`
- `RUSTFLAGS: "-Dwarnings"` — all clippy/compiler warnings are fatal

Jobs (selective, triggered by file path changes):
1. `check_and_test` — `cargo fmt`, `cargo check`, `cargo test`, `cargo clippy` + web build
2. `build_rayhunter` — ARM firmware binary (armv7)
3. `build_rootshell` — ARM rootshell binary
4. `build_rayhunter_check` — CLI tool for all platforms (linux-x64, armv7, aarch64, macOS, Windows)
5. `build_rust_installer` — Installer binaries (multi-platform)
6. `build_installer_gui_*` — Tauri GUI installer packages (AppImage, deb, rpm, .app, MSI)
7. `mdbook_test` / `mdbook_publish` — Documentation build/deploy

**Release process** (`.github/workflows/release.yml`):
1. PR to bump all `Cargo.toml` versions uniformly
2. Merge, tag, then run the manual workflow dispatch
3. Creates a GitHub release with platform-specific zip archives

---

## Code Conventions

### Error Handling

Use `thiserror` for custom error types. Each crate defines its own error enum. Propagate errors with `?` and map with `.map_err(ErrorVariant)`. Do not use `unwrap()` in production paths — only in tests or where the invariant is documented.

### Async Style

- Use `tokio::sync::mpsc` for inter-task communication
- Use `CancellationToken` (from `tokio-util`) for cooperative shutdown
- Use `TaskTracker` to spawn and await tasks
- The daemon runs single-threaded Tokio; avoid `spawn_blocking` unless necessary

### Serialization

- `serde` + `serde_json` for JSON/TOML
- `deku` for binary protocol parsing (DIAG messages, GSMTAP headers)
- NDJSON for streaming analysis output (one JSON object per line)

### Logging

Use the `log` crate macros (`info!`, `error!`, `debug!`, `warn!`). The daemon initializes logging in `main.rs` via `rayhunter::init_logging()`. Avoid `println!` in library code.

### Feature Flags

Feature flags in the daemon control TLS backend only (`rustcrypto-tls` vs `ring-tls`). New analyzers use `AnalyzerConfig` fields instead of Cargo features.

### Testing

- Unit tests live in `#[cfg(test)]` modules in source files
- Integration tests: `lib/tests/test_lte_parsing.rs`, `telcom-parser/tests/lte_rrc_test.rs`
- Frontend tests: `daemon/web/` via Vitest
- Use `test_analyzer = true` in config to verify the harness fires events end-to-end

### Documentation

User-facing docs live in `doc/` and are built with **mdBook** (`book.toml`). Published to GitHub Pages on push to `main`. For device-specific behavior, add a chapter under the appropriate device guide.

---

## Supported Devices

| Device | Region | Notes |
|---|---|---|
| Orbic RC400L | Americas | Primary dev device, cheapest (~$25) |
| TP-Link M7350 (v3–v9) | Europe/Middle East/Asia | Multiple hardware revisions |
| Wingtech CT2MHS01 | Americas | Qualcomm mdm9650 |
| T-Mobile TMOHS1 | Americas | White-label Wingtech |
| UZ801 | Asia/Europe | USB modem, Snapdragon 410 |
| PinePhone / PinePhone Pro | Global | Quectel EG25-G modem |
| Moxee Hotspot | Americas | |

All devices require a Qualcomm modem with accessible `/dev/diag` interface.

---

## Version Bumping

To release a new version, update `version = "x.y.z"` in **all** `Cargo.toml` files simultaneously. CI enforces that all crates have the same version. Quick way:

```bash
sed -i -E 's/0\.10\.1/0.11.0/g' */Cargo.toml installer-gui/src-tauri/Cargo.toml
```
