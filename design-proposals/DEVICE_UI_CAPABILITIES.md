# Rayhunter Device UI Capabilities & Web-to-Device Communication Research

## Executive Summary

After thorough code analysis, here are the findings regarding Orbic device UI capabilities and web-to-device communication:

### Current Capabilities ✅
1. **Display Updates:** The Orbic device supports framebuffer-based UI updates (128x128 RGB565 display)
2. **Status Visualization:** Three display states (Recording, Paused, WarningDetected)
3. **Web-to-Device Communication:** Limited to HTTP endpoints for configuration and control
4. **Serial Communication:** AT commands via USB serial interface (used during installation)

### Text Messaging Feasibility ⚠️

**Short Answer:** Not directly supported in current implementation.

**Detailed Analysis:**

#### What EXISTS in the Codebase:

1. **Display State API Endpoint** (`/api/debug/display-state`)
   - Route wiring: `daemon/src/main.rs` (handler implementation: `daemon/src/server.rs:302-323`)
   - Allows sending DisplayState updates to device
   - Limited to 3 enum states: Recording, Paused, WarningDetected
   - Currently used for debugging

2. **Orbic Serial Communication** (`installer/src/orbic.rs`)
   - AT command interface via USB serial
   - Used during installation for system commands
   - Functions: `send_serial_cmd()`, `adb_serial_cmd()`, `adb_at_syscmd()`
   - Bi-directional communication confirmed

3. **Framebuffer Display** (`daemon/src/display/orbic.rs`)
   - 128x128 pixel RGB565 screen
   - Writes raw pixel data to `/dev/fb0`
   - Currently displays colored lines and patterns

#### What WOULD BE NEEDED for Text Messaging:

**Option 1: Extend Display API (Simpler)**
```rust
// Extend DisplayState enum
pub enum DisplayState {
    Recording,
    Paused,
    WarningDetected { event_type: EventType },
    TextMessage { text: String },  // NEW
}
```

**Implementation Steps:**
1. Extend `DisplayState` enum in `daemon/src/display/mod.rs`
2. Add text rendering to framebuffer in `daemon/src/display/orbic.rs`
3. Update web API endpoint to accept text messages
4. Add font rendering library (e.g., `embedded-graphics`, `rusttype`)

**Pros:**
- Leverages existing architecture
- One-way communication (web → device)
- Minimal API surface change (extends existing debug endpoint)

**Cons:**
- Display limited to 128x128 pixels (small text area)
- No device-to-web messaging
- Requires font rendering implementation

**Option 2: SMS-like Bi-directional System (Complex)**

Would require:
1. **New API Endpoints:**
   ```
   POST /api/message/send   - Web sends message to device
   GET  /api/message/inbox  - Web polls for device messages
   POST /api/message/device - Device sends message to server
   ```

2. **Message Queue System:**
   - In-memory or file-based queue on device
   - Web polling or WebSocket for real-time updates

3. **Device Input Mechanism:**
   - Physical buttons (power button already used for start/stop)
   - Limited input options on Orbic

**Pros:**
- Bi-directional communication
- Message history/logging

**Cons:**
- Significant development effort
- Input mechanism challenging on Orbic
- Storage constraints on device

#### Recommended Approach

**For Orbic Device Specifically:**

Use **Option 1 (Extended Display API)** with these features:

1. **Simple Text Display:**
   ```typescript
   // Web UI sends
   POST /api/display/text
   {
     "message": "Hello from Web UI!",
     "duration_seconds": 10  // Auto-clear after 10s
   }
   ```

2. **Display Implementation:**
   - Render text on 128x128 screen
   - Word wrap for longer messages
   - Auto-scroll for messages > screen size
   - Return to status display after timeout

3. **Example Use Cases:**
   - Send reminders to device
   - Display custom status messages
   - Show WiFi credentials
   - Alert messages from server

#### Code Changes Required

**1. Update DisplayState (`daemon/src/display/mod.rs`):**
```rust
#[derive(Clone, PartialEq, Serialize, Deserialize)]
pub enum DisplayState {
    Recording,
    Paused,
    WarningDetected { event_type: EventType },
    TextDisplay {
        message: String,
        duration_secs: Option<u64>,
    },
}
```

**2. Add Text Rendering (`daemon/src/display/orbic.rs`):**
```rust
use embedded_graphics::{
    mono_font::{ascii::FONT_6X10, MonoTextStyle},
    pixelcolor::Rgb565,
    prelude::*,
    text::Text,
};

async fn render_text(&mut self, message: &str) {
    // Render text to framebuffer
    // Handle word wrapping, scrolling
}
```

**3. Add Web API Endpoint (`daemon/src/server.rs`):**
```rust
pub async fn send_text_to_device(
    State(state): State<Arc<ServerState>>,
    Json(request): Json<TextDisplayRequest>,
) -> Result<(StatusCode, String), (StatusCode, String)> {
    if let Some(ui_sender) = &state.ui_update_sender {
        ui_sender.send(DisplayState::TextDisplay {
            message: request.message,
            duration_secs: request.duration_secs,
        }).await.map_err(|_| {
            (StatusCode::INTERNAL_SERVER_ERROR,
             "failed to send to device".to_string())
        })?;
        Ok((StatusCode::OK, "message sent".to_string()))
    } else {
        Err((StatusCode::SERVICE_UNAVAILABLE,
             "display not available".to_string()))
    }
}
```

**4. Web UI Component:**
```svelte
<!-- SendTextToDevice.svelte -->
<script lang="ts">
  let message = $state('');
  let duration = $state(10);

  async function sendMessage() {
    await fetch('/api/display/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        duration_secs: duration
      })
    });
  }
</script>

<div class="card">
  <h3>Send Message to Device</h3>
  <textarea bind:value={message} placeholder="Enter message..."></textarea>
  <input type="number" bind:value={duration} /> seconds
  <button onclick={sendMessage}>Send to Device</button>
</div>
```

#### Limitations

**Physical Constraints:**
- **Screen Size:** 128x128 pixels = ~21 chars wide × ~12 lines
- **No Keyboard:** No easy way for device to send messages back
- **Processing Power:** Limited embedded processor
- **Memory:** Constrained RAM for message storage

**Current Architecture:**
- **One-way Communication:** Web → Device works well
- **Device → Web:** Would require polling or push mechanism
- **No SMS API:** Device doesn't expose SMS functionality to system

#### Alternative: Notification System

Instead of traditional messaging, consider:

1. **Web-to-Device Alerts:**
   - Critical warnings
   - Configuration confirmations
   - Status updates

2. **Device-to-Web Logs:**
   - Already implemented via log endpoints
   - View logs in web UI (existing LogView component)

3. **Two-way Status Sync:**
   - Device state reflected in web UI (already working)
   - Web can change device state (partially working)

## Conclusion

**Can you send text from web UI to Orbic device?**
- **YES**, with modifications to display text on screen
- **Estimated Effort:** 2-3 days of development
- **Dependencies:** Font rendering library

**Can device send text back to web UI?**
- **NOT EASILY** - would require significant architectural changes
- **Alternative:** Use existing log system or status updates

**Recommendation:**
Implement one-way text display (Web → Device) as it provides practical utility with minimal complexity. For device-to-web communication, leverage existing log viewing and status synchronization systems.

## Implementation Priority

**Phase 1 (Easy):**
- Extend DisplayState enum for text
- Add basic text rendering to Orbic display
- Create web API endpoint

**Phase 2 (Medium):**
- Add font rendering library
- Implement word wrapping and scrolling
- Create web UI component

**Phase 3 (Complex - Optional):**
- Message queue system
- Bi-directional communication
- Message history

**Estimated Timeline:**
- Phase 1: 1-2 days
- Phase 2: 2-3 days
- Phase 3: 1-2 weeks

---

**Document Version:** 1.0
**Date:** May 1, 2026
**Research By:** Claude Code Agent
