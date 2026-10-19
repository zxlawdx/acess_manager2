# QA — Access World interactions / media / combat

Date: 2026-10-19. Base: `a0e2828` (main). Branch: `feat/world3d-interactions-media-combat`.

## Automated validation

| Check | Result |
|---|---|
| Baseline frontend | 99 passed |
| Final frontend (`npm test`) | 113 passed (14 added) |
| Python (`python -m pytest -q`) | 538 passed, 30 subtests passed |
| Asset integrity (`python tools/world3d_assets.py`) | Four self-contained CC0 GLBs, hashes/sizes/triangles match |
| Frontend build and `--check` | Passed, all four bundles synchronized |
| Vela collectstatic | Passed, no copy errors |
| Terminal theme smoke | 1366×768 / 1600×900 / 1920×1080 and SSH modal passed |
| Chromium WebGL smoke | Full viewport, no horizontal overflow, HUD, scene switching, interaction E, radio folder library, controls, persisted blobs without autoplay, dialogue preview/re-entry, YouTube focus/close, arena hit/reset and no API mutations; context loss and missing WebGL recover to the normal interface |
| Native Vela / Qt WebEngine | Real `manage.py runapp` shell, WebGL, three resolutions, Low/Medium/High, office/arena and exit passed |

The native run used pywebview 6.2.1 + PyQt6/Qt 6.11, Xvfb and software ANGLE rendering. Equipment API responses were synthetic; native window, HTML shell, local static serving, runtime bundles and WebGL were real. `tests/visual/world-native.cjs` drives the real `tests/visual/native_driver.py` via CDP. The native host emitted GPU/compositor warnings under virtual display; screenshots confirm rendered content. This is not a GPU performance benchmark or a Windows WebView2 certification.

The initial Qt5 attempt hit an existing application dependency on `Object.hasOwn` (unsupported in that old embedded Chromium). The completed native check used Qt6; support for old Qt5 runtimes is not claimed. The headless Chromium archive required manual extraction on this host because archive ownership restoration is unavailable in its container. These host workarounds are not packaged into the app.

## Visual review

- Office and arena: 1366×768, 1600×900, 1920×1080. No oversized cards over the scene; HUD is hidden by default, menu remains accessible.
- Native office captures at all three sizes confirm canvas at (0,0), exactly the Vela WebView dimensions.
- Radio/dialogue dialogs reviewed at 1920×1080. A terminal-theme global rule initially produced dark-on-dark dialogs; scoped overrides fixed it. Smoke asserts the radio background color. Menu hover text also received a scoped contrast override.
- Shadow acne on the office floor was corrected with shadow bias/normalBias. Low disables shadows as before.

| Evidence | File |
|---|---|
| Office | `office-1366.png`, `office-1600.png`, `office-1920.png` |
| Arena | `arena-1366.png`, `arena-1600.png`, `arena-1920.png` |
| Real Vela window | `native-office-1366.png`, `native-office-1600.png`, `native-office-1920.png` |
| Music and dialogue | `playlist-1920.png`, `dialogue-1920.png` |

## Limits / deliberate choices

- The YouTube external boundary is stubbed in the offline smoke. URL validation, player creation, focus and cleanup are tested; actual third-party video playback must also be checked on the user's network/runtime. The official API may refuse embedding or return error 153. A validated external link is provided.
- TV uses the in-app focus panel fallback; no perspective-aligned iframe, CSS3D capture or VideoTexture.
- Folder selection/IndexedDB was exercised in Chromium. Native file-picker UI and codec availability vary by platform; multi-file selection remains available. No music uploads or backend filesystem scanner were added.
- The router uses original procedural animation rather than humanoid animation retargeting. Only the small selected furniture GLBs are distributed, with CC0 attribution. No proprietary/reference repository code was copied.
- NPC navigation is a short local route and arena approach/evade logic, not a navmesh. Player colliders are simple boxes; ball physics uses a single Cannon ES world.
- RSSI/optical visual thresholds are illustrative last-snapshot indicators. Arena does not receive real device operations or customer personal data.
- No physical Huawei/ZTE/Juniper was used for this visual feature QA; operational routes and existing Python regression coverage remain intact.

## CI follow-up — 2026-10-19

Both initial GitHub checks failed at the same visual arena assertion, after unit tests, build integrity and the three viewport checks had passed. The smoke assumed 650 ms of wall time meant enough simulated movement and sent a short series of punches immediately after dodge. The renderer caps simulation delta on slow frames; CI software WebGL therefore left the player/cooldown in a different state. The test now waits for the menu to close, explicitly focuses the canvas, observes actual `world-frame` player coordinates, and checks damage after frame-synchronized keyboard attacks. The office interaction uses observed position too. No combat rule was weakened and no application code was changed for this correction. The full smoke passed locally with `ACCESS_MANAGER_QA_CPU_THROTTLE=3`, including real keyboard damage and the no-device-mutation assertion.
