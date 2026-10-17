# Access Manager experiences in the Vela shell

Before connecting, choose Terminal, Frutiger Aero or Access World 3D. The selector is always visible, remembers the previous choice, and never adds theme or experience fields to credential/API payloads. World requires WebGL; the connected Aero interface remains usable if WebGL creation or the lazy bundle fails.

After connecting, the Theme selector and World/Interface button switch presentation without logging out, losing the route, or clearing the Juniper/subscriber/CPE context. Opening a hotspot invokes the same view renderer and scoped API service as sidebar navigation. Closing its panel restores position, yaw/pitch, zoom, visited regions, audio and quality. Disconnected sessions dispose the renderer and clear in-memory world contexts.

## Vela integration and theme variants

The application still uses `layout="blank"`, `vela.template_engine.engine.render_template`, Vela's `static()` helper and Vela collectstatic. Vela 0.2.2 does not expose a separate runtime component theme provider for this application. The app's ThemeProvider extends the real shell using scoped design tokens and variants of its existing buttons, controls, tables, dialogs, drawers and scroll areas; no new frontend framework or parallel desktop host was introduced.

`ui/theme.js` applies `data-experience-theme` to the document root so native Vela surfaces, the login, the connected shell, the dialog portal and toasts share a theme. Terminal's existing CSS/CRT identity remains opt-in by default. `aero.css` supplies Segoe/Tahoma typography, glossy gradients, readable status colours, light tables and dialogs, blue scrollbars and SVG navigation icons. Console/code output explicitly retains monospace styling. Presentation-label conversion is reversible and never visits form values, payloads, raw consoles or password inputs. Matrix rendering pauses outside the Terminal login.

## One route source, two world layouts

`core/routes.js` combines the actual registered view implementations, canonical router navigation and Juniper's existing navigation. It records presentation metadata and required capability names, not device protocols. The sidebar is generated from that source; the HTML template no longer duplicates a route list.

`world/regions.js` filters that registry for the session family and existing capabilities. SUPPORTED/PARTIAL reads or explicitly supported writes permit corresponding regions; UNKNOWN/UNSUPPORTED features do not gain fictional access. Read availability never grants a writer. Overview, local profiles, management/history and Juniper operation logs remain available where their existing views are relevant.

| Context | Applicable region examples | Existing workspaces/actions |
| --- | --- | --- |
| Huawei/ZTE | Overview, Clients, Traffic, Wi-Fi, WAN, LAN, DHCP/DNS, Diagnostics, Full diagnostic, Profiles, Management | Canonical router routes; capability-dependent features omitted when unproven |
| Juniper BNG | BNG hub, PPPoE subscribers/session, accounting/services, interfaces/LACP/optics, subscriber routing, AAA/RADIUS, probes, system/chassis/logs | Registered Juniper routes, including contextual views that ask for subscriber selection |
| Selected Juniper subscriber with IPv4 | Acessar CPE | Existing action of `juniperSubscriber`, opening its existing CPE drawer; not a fabricated route |

No domestic Wi-Fi, SSID, DHCP, Mesh or residential-router label is remapped to an unrelated Juniper page. Mesh/NAT do not receive invented standalone regions when the current application has no corresponding registered route. Their existing management surfaces remain intact.

The router world combines greenery, water, homes and an Internet skyline. Juniper adds infrastructure racks, glass buildings and subscriber/fibre symbols. Procedural region icons represent Wi-Fi, clients, ports, traffic, DNS, diagnostics, gear, hubs and racks. Optional GLB prop loading falls back through procedural geometry, SVG billboard and a glossy orb. The included buddy remains procedural with optional GLB animation support.

The minimap and progress denominator use exactly the current applicable region array. Position/progress are cached in memory per session/family, including CPE handoff/return, without persisting IPs or subscriber identifiers. Capability/selected-subscriber changes rebuild region props while preserving the active world state.

## Controls, graphics and limits

WASD/arrows walk; Shift runs; Space jumps; dragging rotates the camera; wheel zooms; E opens the nearby region. Escape closes the technical dialog/panel first, then returns to Interface. A gamepad or touch movement pad is not implemented; ordinary interface navigation remains available on small devices.

Low/Medium/High cap DPR and control shadows/particle counts and water environment intensity. The water has gentle geometry waves and an original generated sky environment, not planar real-time reflections or caustics. Trees are smooth glossy geometry. Ambient motion and transitions respect reduced motion. Debug FPS uses actual frame duration, separately from the clamped movement simulation step.

The renderer does not import backend/vendor code or receive credentials. Three.js and GLTFLoader are in a separate local bundle and are loaded only when entering World. There is no CDN dependency. Cleanup disposes scenes, textures, render targets, listeners and ResizeObserver. WebGL context loss returns to the operational interface.

The scene is bounded. Terrain-aware camera height is implemented; full obstacle/prop camera raycasts, terrain chunks/LOD, collisions/swimming, animation retargeting and licensed artist-made assets remain future work. No physical-GPU FPS target or native Windows WebView result is claimed by software-browser tests.

## Local audio

The default distribution is silent: no Nintendo music, recordings, streams or synthetic placeholder chord is shipped. The Wii Shop theme is a reference only.

Use **Escolher música…** in the World HUD to choose OGG, MP3 or WAV. The browser reads it through a local object URL; no upload, copied server file, filesystem path or audio content enters an API request or localStorage. Selection must be repeated after restarting the app; playback state, master volume and repeat preference are saved. Music starts only through an explicit play/import action. Closing a technical panel preserves music; leaving World or hiding the app pauses it.

For a persistent, legitimately obtained local track:

1. Copy `aero_bgm.ogg` (or `.mp3` / `.wav`) to `apps/access_manager/static/audio/user/`.
2. Edit the adjacent `manifest.json`:

   ```json
   {"track":"aero_bgm.ogg","title":"Minha música local","regions":{}}
   ```

3. Run `python manage.py collectstatic --no-tailwind` and reopen the application.
4. Enter World and press **Reproduzir**. Installation does not enable autoplay.

Track files in this directory are gitignored. Do not commit unlicensed recordings. The manifest only resolves local files in its own static directory and rejects external streams. `AudioManager` exposes master/music/ambient/ui/sfx gains, volume, enabled state, play/pause and fades. The empty `regions` map is a future per-region audio slot, not an implemented automatic soundtrack switch.

## Build and QA

```bash
npm ci
python tools/sync_frontend.py
python tools/sync_frontend.py --check
npm test
python -m pytest -q
python manage.py collectstatic --no-tailwind
python manage.py runapp
```

`node tests/visual/aero.cjs` checks login choices, all router screens, password and preview dialogs, traceroute, neighbour scan, Juniper routes/CPE drawer, adaptive worlds, local WAV playback, theme leaks, bounds and Terminal regression at 1366×768, 1600×900 and 1920×1080. `node tests/visual/world.cjs` separately exercises real movement/proximity, returning to the same position, quality, context loss and unavailable-WebGL fallback. An existing Chromium can be selected with `ACCESS_MANAGER_CHROMIUM`.

API data in visual QA is synthetic test data. No real device password/subscriber capture is committed. Reviewed evidence and the file list are linked from AERO_WORLD_PATCH_REPORT.md. Native Windows WebView and live-device confirmation remain external validation steps.

## Voxel World and current service record

`voxel/renderer.js` is a separate lazy IIFE (`voxel-runtime.js`). The conventional interface does not load either Three.js bundle. Both world modes consume `deriveWorldRegions`, which filters the canonical route registry by session family/capabilities and selected subscriber actions. Voxel names decorate real routes; they do not add API features. DHCP/DNS share their existing panel; NAT/Mesh are not invented as routes.

The procedural voxel world streams 12×12 instanced surface chunks, generating at most one new chunk per frame and disposing removed chunks. Low/medium/high use radius 2/3/4 (25/49/81 chunks), DPR 1/1.5/2, disabled/enabled shadows and 0/24/64 particles. Water is a simple translucent plane on medium/high, not a reflective simulation. Structures are rendered independently of streaming to keep actual destinations discoverable. Collision covers structure footprints, terrain landing and map boundaries; it is intentionally basic. Third person is default; V toggles first person; drag changes view; WASD, Shift, Space, E and F provide movement, interaction and scanner. Double-click raycasting opens a structure only within interaction range. Esc closes scanner/panel or returns to the interface.

`service/model.js` holds only the current service in memory. It starts on a successful connection, records context transitions (including CPE handoff), and clears on complete disconnect/page unload. It never writes to localStorage/backend/telemetry. Relevant API observations are sanitized, repeated reads throttled, raw output and credential fields excluded. Configuration forms add known before/after values; unknown old values are not invented. Wi-Fi password edits explicitly read the old value using the existing reveal endpoint, hold it within the operation, and record old/new in the in-memory service. Secrets are masked by default; an unchecked checkbox must be selected locally to include them in copy/export. Export is an explicit user download, not automatic persistence. The technician is taken from session metadata where provided; otherwise it is marked unknown.

The service panel offers timeline, operational summary, notes, text export and Markdown copy. It can be opened from the topbar and either world. Client details now offer diagnosis, add-to-service and navigation to the Clients region. This region is a navigation destination, never a claim about a device's physical position. Diagnosis reads the actual client table and related radio when enabled, pings the client's IP only with the existing diagnostics write capability, and records measured results. Presence, RF metrics and ping are reported separately; there is no inferred internet reachability or invented ARP/lease endpoint.
