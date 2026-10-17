# Experimental Frutiger Aero world

The Vela application, Python routes, vendor providers and conventional navigation are retained. After connecting, choose **Mundo 3D**. **Tema Aero** independently switches the connected interface between Terminal and Aero. The login remains conventional. Three.js loads from a separate local bundle only when requested, with no CDN or external runtime dependencies.

## Controls and technical panels

- WASD/arrows: walk; Shift: sprint; Space: jump.
- Drag the canvas: rotate camera; wheel: zoom between safe limits.
- Approach a labelled orb and press E to open the existing technical workspace.
- **Voltar ao mundo** / Escape: close the technical workspace and resume at the same position. Escape closes a nested technical dialog first. Escape in exploration returns to the conventional interface.

| Region | Huawei / ZTE workspace | Juniper workspace |
| --- | --- | --- |
| Router Bay | WAN | Interfaces |
| Wi-Fi Garden | Wi-Fi | System |
| Client Lagoon | Clients | PPPoE subscribers |
| DNS Spring | DHCP / DNS | Overview |
| Diagnostic Dome | Diagnostics | Juniper diagnostics |

Juniper mappings deliberately use applicable infrastructure views rather than fabricating Wi-Fi/DNS capabilities. The existing panels enforce provider capabilities as before. The renderer never makes protocol calls, receives credentials or writes device configuration. Opening a panel invokes the same view renderer and API service as sidebar navigation; requests are scoped/cancelled on leaving. No device data is invented in the world. Minimap colours identify regions; they do not claim device health.

## Architecture

`world/controller.js` is the pure movement/proximity model. `world/renderer.js` owns the Three.js world, assets, camera, animation and graphics quality. `world/bridge.js` controls modes, routes, session lifecycle, HTML HUD and Canvas minimap. `world/audio.js` owns user-triggered audio. `world.css` is opt-in. `sync_frontend.py` reproducibly builds both `runtime.js` and the lazy `world-runtime.js`; both are versioned for Node-free desktop execution.

Low/medium/high configure pixel ratio, shadow resolution and bubble counts. Renderer pauses while hidden and stops on leaving exploration. Input is cleared on blur, panel entry and tab visibility changes. Disconnect disposes the world. Geometry, materials, textures, animation, ResizeObserver and input listeners are disposed on teardown. WebGL context loss returns to the operational interface. There is no mandatory pointer lock.

The music button currently plays a quiet, optional synthesized ambient chord, with volume control and fade. It is silent until an explicit click and silenced when leaving the world or hiding the tab. Theme, quality, volume and optional exploration counter preferences are stored locally; credentials and device information are not.

## Assets and honest limits

The included buddy is procedural. The optional local GLB path and license requirements are in THIRD_PARTY_ASSETS.md. A failed model never disables exploration. GLB animation selection uses clip names containing idle/walk/run/jump; models using other names need a mapping. No copyrighted MSN assets are bundled.

This first patch is a small bounded landscape with five regions, simple transparent water, trees, skyline, clouds, a wireframe globe and reduced-motion-aware ambient bubbles. Inventory is a visited-regions counter, not an equipment inventory. Water caustics/refraction, terrain chunks/LOD, physical prop collisions, obstacle-aware camera raycasts, animation retargeting, full region-specific music and the remaining map regions are future work. The ground-following camera avoids terrain clipping but does not solve every prop occlusion. Quality presets are implemented; 60 FPS on a physical integrated GPU is a target, not a measured result. Native Windows WebView testing and licensed artist-made assets remain necessary for final visual sign-off.

## Build and validation

```bash
npm ci
python tools/sync_frontend.py
npm test
python -m pytest -q
python manage.py collectstatic --no-tailwind
python manage.py runapp
```

The dedicated browser integration check uses fixture API responses only inside the test server:

```bash
node tests/visual/world.cjs
# Optionally use an existing Chromium:
ACCESS_MANAGER_CHROMIUM=/path/to/chromium node tests/visual/world.cjs
```

It exercises lazy loading, actual WebGL, keyboard movement, proximity interaction, the existing WAN panel, retained position, quality switching, all three target desktop sizes, WebGL failure fallback and disconnect. It does not test live devices or GPU performance.

## Validation of this patch (2026-10-17)

- 535 Python tests and 30 subtests passed.
- 68 frontend tests passed, including movement, diagonal speed, yaw, world bounds, jumping/landing and proximity selection.
- WebGL browser integration passed at 1366×768, 1600×900 and 1920×1080 with fixture data. This is functional validation in software Chromium, not a physical-GPU benchmark.
- Reproducible bundle check and Vela collectstatic passed.
