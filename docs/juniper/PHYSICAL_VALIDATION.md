# Juniper physical validation

**Not performed.** No management host, authorized credentials, model/release or test subscriber was supplied. No real subscriber was queried or disconnected. XML fixtures contain documentation-range addresses, synthetic identifiers and fictional session values.

Linux validation: real `manage.py runapp`, Vela/Bottle API and Qt WebEngine (Chromium), synthetic remote transport only. This is not Windows/WebView2 or physical Juniper evidence.

Windows dependency audit: ncclient 0.7.0 built as `py3-none-any`; CPython 3.12 Windows x64 wheels downloaded successfully for Paramiko, lxml, cryptography and their dependencies. This verifies package availability only. No Windows process, Vela/WebView2 or Windows SSH socket was executed.

## Next authorized device check

1. Install requirements, sync frontend, collect static and run the existing Vela application.
2. Explicitly select Juniper; use NETCONF on enabled port 830 or SSH/XML on the authorized CLI port. Validate the SSH host key in the user's known_hosts beforehand; unknown or changed keys are rejected.
3. Record sanitized model, release, Junos variant and transport. Capture each relevant command's `| display xml rpc` and XML shape.
4. Search a test contract using all three prefixes; compare username, IPv4/IPv6, state, interface, MAC and distinct Session IDs with the Junos GUI/CLI.
5. Open PPPoE/AAA details on a selected session; compare IDs and RI. Test limited-permission behavior and a legitimate empty result.
6. Validate Windows/Vela at 1366×768, 1600×900 and 1920×1080.

Disconnect/reconnect remain unimplemented and UNKNOWN: required Windows/target validation, release/privilege confirmation, explicit test-session authorization and a tested read-before-write/read-back path are not available. The app does not send any clear/set/request/commit commands.
