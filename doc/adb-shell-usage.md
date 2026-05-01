# ADB Shell Usage with Rayhunter

This guide covers how to use ADB (Android Debug Bridge) shell access with Rayhunter-enabled devices for advanced interaction, troubleshooting, and device management.

## Overview

ADB shell provides command-line access to your Rayhunter device, enabling advanced configuration, debugging, and maintenance tasks. The method of accessing a shell varies by device and Rayhunter version.

## General ADB Shell Usage

The basic ADB shell command opens a shell on the connected device:

```sh
adb shell
```

This provides limited user privileges. For root access, additional steps are required depending on your device and Rayhunter version.

## Device-Specific Shell Access

### Orbic/Kajeet RC400L

**For Rayhunter 0.7.0 and newer (network installer):**

After running the installer, ADB is not enabled by default. Use the installer utility instead:

```sh
./installer util orbic-shell
```

**For Rayhunter versions prior to 0.7.0 or when using `orbic-usb`:**

1. Open an ADB shell:
   ```sh
   adb shell
   ```
   Or use the installer utility:
   ```sh
   ./installer util shell
   ```

2. Obtain "fakeroot" access:
   ```sh
   /bin/rootshell
   ```

See the [Orbic RC400L documentation](./orbic.md#shell) for more details.

### Moxee K779HSDL

Access a shell using:

```sh
./installer util orbic-shell
```

**Making ADB Persistent:**

To ensure ADB remains enabled after reboots on the Moxee K779HSDL:

```sh
adb shell "echo 9 > /usrdata/mode.cfg"
```

This command modifies the device's USB mode configuration to enable persistent root ADB access and changes its product ID.

See the [Moxee Hotspot documentation](./moxee.md) for more details.

## Installation with ADB

### USB-based Installation (orbic-usb)

The `orbic-usb` installer method uses ADB for installation. While functional, this method is generally not recommended for most users due to potential USB driver complications on Windows.

```sh
./installer orbic-usb
```

This method:
- Requires USB debugging to be enabled on the device
- May require manual USB driver installation on Windows
- Provides direct ADB access after installation

### Network-based Installation (orbic)

Starting with Rayhunter 0.6.0, the network-based installer became available and is the recommended approach:

```sh
./installer orbic --admin-password 'your-password'
```

This method:
- Works over WiFi connection
- No USB drivers required
- More reliable across different operating systems
- ADB is not enabled by default after installation

## Common ADB Commands for Rayhunter

Once you have shell access, here are common operations:

### View Rayhunter daemon status

```sh
/etc/init.d/rayhunter_daemon status
```

### Stop Rayhunter daemon

```sh
/bin/rootshell -c "/etc/init.d/rayhunter_daemon stop"
```

### Start Rayhunter daemon

```sh
/etc/init.d/rayhunter_daemon start
```

### Check running processes

```sh
ps | grep rayhunter
```

### View logs

```sh
logread | grep rayhunter
```

## Troubleshooting ADB Connection Issues

### Timeout Waiting for ADB Connection

This is a common issue during installation where the installer cannot establish an ADB connection despite USB debugging being enabled.

**Solutions:**

1. **Restart the ADB server:**
   ```sh
   adb kill-server
   adb start-server
   ```

2. **Verify device recognition:**
   ```sh
   adb devices
   ```
   Your device should appear in the list. If it shows as "unauthorized", check your device's screen for an authorization prompt.

3. **Check USB connection:**
   - Try a different USB cable (data-capable, not charge-only)
   - Try a different USB port
   - Avoid USB hubs if possible

4. **On Linux, verify udev permissions:**

   Ensure your user has proper permissions to access USB devices. The installer should set this up, but you can verify:

   ```sh
   # Check if udev rules exist
   cat /etc/udev/rules.d/51-android.rules

   # Restart udev
   sudo udevadm control --reload-rules
   sudo udevadm trigger
   ```

### "Access Denied" Errors

These typically stem from permission issues:

**On Linux:**
- Check udev rules are properly configured
- Ensure your user is in the `plugdev` group (if applicable)
- Restart the ADB server with `adb kill-server` and `adb start-server`

**On Windows:**
- Ensure proper USB drivers are installed
- Try running the installer as Administrator
- Check Windows Device Manager for any driver issues

**On macOS:**
- Ensure you've granted necessary permissions in System Preferences
- Try restarting the ADB server

### Device Not Recognized

1. **Enable USB debugging on the device** (if applicable to your device model)

2. **For Orbic RC400L specifically:**
   - Some users report success using the Orbic Update Assistant trick on Windows
   - On Linux, the `install-linux.sh` script can help enable ADB
   - Advanced users can send a USB vendor control message (request 0xa0, value 0)

3. **Verify the device is in the correct USB mode:**

   Check `/data/usb/boot_hsusb_composition` on the device to see available USB modes and current Android USB gadget settings.

## Advanced Usage

### Persistent ADB Configuration

Different devices handle ADB persistence differently:

**Moxee K779HSDL:**
```sh
adb shell "echo 9 > /usrdata/mode.cfg"
```

**Orbic RC400L:**

To enable USB tethering (which includes ADB in some modes):
```sh
echo 9 > /usrdata/mode.cfg
reboot
```

To disable USB tethering:
```sh
echo 3 > /usrdata/mode.cfg
reboot
```

See the [FAQ](./faq.md) for more USB mode configurations.

### Development and Build Process

The Rayhunter development build process uses ADB commands for:
- Stopping the rayhunter daemon
- Pushing firmware updates to devices
- Rebooting devices after updates
- Port forwarding for web interface access

Example from the build process:
```sh
# Stop daemon
/bin/rootshell -c "/etc/init.d/rayhunter_daemon stop"

# Push updated firmware
adb push /path/to/binary /data/rayhunter/

# Reboot
adb reboot
```

## Security Considerations

⚠️ **Important:** ADB shell provides powerful root-level access to your device. Always:

- Understand the commands you're executing before running them
- Be cautious when modifying system files or configurations
- Keep ADB disabled when not actively needed (for security)
- Only enable ADB on trusted networks
- Improper use can affect device stability or even brick the device

## Version-Specific Notes

### Rayhunter 0.7.0+
- Network installer (`./installer orbic`) is preferred
- ADB not enabled by default post-installation
- Use `./installer util orbic-shell` for shell access
- More unified shell experience across devices

### Rayhunter 0.6.0 - 0.6.x
- Network installer introduced as `./installer orbic-network`
- USB installer still available as `./installer orbic`

### Rayhunter prior to 0.6.0
- USB/ADB-based installation only
- Required manual ADB setup and USB drivers
- Shell access via `adb shell` followed by `/bin/rootshell`

### Rayhunter 0.8.0+
- `orbic-network` renamed to `orbic`
- Original `orbic` renamed to `orbic-usb`
- Improved extensibility for external installations

## Additional Resources

- [Orbic/Kajeet RC400L specific instructions](./orbic.md)
- [Moxee Hotspot specific instructions](./moxee.md)
- [Installing from source](./installing-from-source.md)
- [Frequently Asked Questions](./faq.md)
- [Uninstalling Rayhunter](./uninstalling.md)
