# Third-party assets

## Included

| Asset | Author/source | License | Changes | Retrieved |
| --- | --- | --- | --- | --- |
| Three.js 0.180.0 and GLTFLoader | three.js authors, https://github.com/mrdoob/three.js/tree/r180 | MIT, full notice in THREE_LICENSE.txt and static/licenses/three-MIT.txt | Bundled locally using esbuild; upstream sources unchanged | 2026-10-17 |

Terrain, trees, city props, bubbles and procedural buddy are original primitive-based geometry. Ambient audio is an original synthesized sine chord; no music recordings or third-party models/textures are included.

## Optional GLB

Put a legitimately obtained model at `apps/access_manager/static/models/player/frutiger_buddy.glb`, then run `python manage.py collectstatic --no-tailwind`. Missing or invalid models retain the procedural buddy. Downloads, payments and Sketchfab authentication are not automated. No remote assets are requested at runtime.

Before adding a model, record its title, author, exact source URL, license/version, modification details and download date here. Include required CC BY credits in distributed builds. The research attachments are a list of candidates, not proof of the license of a future download.
