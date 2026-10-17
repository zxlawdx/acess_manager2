# Third-party assets

## Included

| Asset | Author/source | License | Changes | Retrieved |
| --- | --- | --- | --- | --- |
| Three.js 0.180.0 and GLTFLoader | three.js authors, https://github.com/mrdoob/three.js/tree/r180 | MIT, full notice in THREE_LICENSE.txt and static/licenses/three-MIT.txt | Bundled locally using esbuild; upstream sources unchanged | 2026-10-17 |

Terrain, trees, city props, bubbles and procedural buddy are original primitive-based geometry. SVG navigation icons and the sky environment are original generated assets. No music recordings, synthesized placeholder chord or third-party models/textures are included. User-imported audio stays local and is not committed.

## Optional GLB

Put a legitimately obtained model at `apps/access_manager/static/models/player/frutiger_buddy.glb`, then run `python manage.py collectstatic --no-tailwind`. Missing or invalid models retain the procedural buddy. Downloads, payments and Sketchfab authentication are not automated. No remote assets are requested at runtime.

Before adding a model, record its title, author, exact source URL, license/version, modification details and download date here. Include required CC BY credits in distributed builds. The research attachments are a list of candidates, not proof of the license of a future download.

## Voxel World (2026-10-17)

The voxel terrain, technician, buildings, trees, palette and login preview are original procedural code. No textures, models, sounds, branding or source code from Minecraft or the research repositories are distributed. Three.js remains the existing MIT dependency, bundled locally with its existing license notice. No new dependency was added.

Consulted references: [InstancedMesh documentation](https://threejs.org/docs/pages/InstancedMesh.html), [ginogiorgi/minecraft](https://github.com/ginogiorgi/minecraft), [dgreenheck/minecraft-threejs-clone](https://github.com/dgreenheck/minecraft-threejs-clone), [wyzuk/yourcraft](https://github.com/wyzuk/yourcraft), [voxel-engine](https://github.com/max-mapper/voxel-engine). These informed the choice of instancing and streaming; no repository code/assets were copied.

[Kenney Voxel Kit](https://kenney.nl/assets/voxel-kit), [Poly Pizza](https://poly.pizza/), [MagicaVoxel](https://ephtracy.github.io/), [Blender importer](https://github.com/AstrorEnales/blender_magicavoxel), and [MagicaVoxel shaders](https://github.com/lachlanmcdonald/magicavoxel-shaders) were inspected as potential future authoring sources. No files from these sources are included. An asset-specific license review remains necessary before any future import; an editor/tool license is not a blanket license for third-party content.
