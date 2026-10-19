from pathlib import Path

css = Path('apps/access_manager/static/css/world.css')
text = css.read_text(encoding='utf-8')
rule = '.world-experience-ui>.world-crosshair,.world-experience-ui>#world-connection,.world-experience-ui>#world-speech{pointer-events:none}\n'
if rule not in text:
    text += '\n' + rule
css.write_text(text, encoding='utf-8')

# Third-person camera can place the center ray behind the avatar or an occluder.
# Keep precise raycast selection first, then fall back to an in-range interaction
# in front of the player. Angular alignment intentionally dominates raw distance,
# so a chair or moving NPC beside/behind the operator does not steal focus from
# the computer/TV/router the character is walking toward.
interactions = Path('apps/access_manager/static/js/world/interactions.js')
text = interactions.read_text(encoding='utf-8')
old_update = """ update(camera,player,occluders=[]){this.raycaster.setFromCamera({x:0,y:0},camera);const hits=this.raycaster.intersectObjects([...this.registry.objects,...occluders],true);let next=null;for(const hit of hits){const item=this.registry.fromObject(hit.object);if(!item)break;const p=item.object.getWorldPosition?item.object.getWorldPosition(item.object.position.clone()):item.object.position;if(Math.hypot(p.x-player.x,p.z-player.z)<=(item.distance||this.distance)&&item.enabled!==false)next=item;break;}if(next!==this.focus){this.focus=next;this.onFocus(next);}return next;}"""
new_update = """ update(camera,player,occluders=[]){this.raycaster.setFromCamera({x:0,y:0},camera);const hits=this.raycaster.intersectObjects([...this.registry.objects,...occluders],true);let next=null;for(const hit of hits){const item=this.registry.fromObject(hit.object);if(!item)break;const p=item.object.getWorldPosition?item.object.getWorldPosition(item.object.position.clone()):item.object.position;if(Math.hypot(p.x-player.x,p.z-player.z)<=(item.distance||this.distance)&&item.enabled!==false)next=item;break;}if(!next&&player){let best=Infinity;for(const item of this.registry.items.values()){if(item.enabled===false||item.object.visible===false)continue;const p=item.object.getWorldPosition?item.object.getWorldPosition(item.object.position.clone()):item.object.position,d=Math.hypot(p.x-player.x,p.z-player.z),limit=item.distance||this.distance;if(d>limit)continue;const direction=Math.atan2(p.x-player.x,p.z-player.z),heading=Number.isFinite(player.heading)?player.heading:direction,angle=Math.abs(Math.atan2(Math.sin(direction-heading),Math.cos(direction-heading)));if(angle>Math.PI/3)continue;const score=angle*4+d*.25;if(score<best){best=score;next=item;}}}if(next!==this.focus){this.focus=next;this.onFocus(next);}return next;}"""
if old_update in text:
    text = text.replace(old_update, new_update, 1)
elif new_update not in text:
    raise SystemExit('InteractionManager update block not found')
interactions.write_text(text, encoding='utf-8')

test = Path('tests/visual/world-interactions.cjs')
text = test.read_text(encoding='utf-8')
old = """ await page.waitForFunction(()=>document.querySelector('#world-tv-status').textContent.includes('Esc volta'));
 assert.equal(await page.locator('#world-tv-player iframe').count(),1);await page.keyboard.press('Escape');await page.waitForFunction(()=>document.querySelectorAll('#world-tv-player iframe').length===0);
 console.log('YouTube focus and iframe cleanup OK');"""
new = """ await page.waitForFunction(()=>document.querySelector('#world-tv-status').textContent.includes('Reproduzindo na televisão 3D'));
 assert.equal(await page.locator('.world-tv-surface iframe').count(),1);await page.keyboard.press('Escape');await page.locator('#world-tv').waitFor({state:'hidden'});assert.equal(await page.locator('.world-tv-surface iframe').count(),1);
 console.log('YouTube playback is embedded in the 3D TV and persists after closing search UI');"""
if old in text:
    text = text.replace(old, new, 1)
elif new not in text:
    raise SystemExit('old YouTube visual smoke block not found')
old_open = """ await page.locator('#world-menu-button').click();await page.locator('#world-open-tv').click();await page.locator('#world-youtube-url').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');await page.locator('#world-tv-form button[type=submit]').click();"""
new_open = """ await page.locator('#world-menu-button').click();await page.locator('#world-scene').selectOption('office');await page.locator('#world-menu').waitFor({state:'hidden'});await canvas.focus();await nextWorldFrame();
 await page.locator('#world-menu-button').click();await page.locator('#world-open-tv').click();await page.locator('#world-youtube-url').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');await page.locator('#world-tv-form button[type=submit]').click();"""
if old_open in text:
    text = text.replace(old_open, new_open, 1)
elif new_open not in text:
    raise SystemExit('YouTube smoke open block not found')
test.write_text(text, encoding='utf-8')

unit = Path('tests/frontend/world-interactions.test.cjs')
text = unit.read_text(encoding='utf-8')
needle = "test('third-person interaction fallback keeps nearby forward targets usable',"
if needle not in text:
    text += "\n" + "test('third-person interaction fallback keeps nearby forward targets usable',()=>{const interactions=fs.readFileSync('apps/access_manager/static/js/world/interactions.js','utf8');assert.match(interactions,/if\\(!next&&player\\)/);assert.match(interactions,/Math\\.PI\\/3/);assert.match(interactions,/angle\\*4\\+d\\*\\.25/);assert.match(interactions,/player\\.heading/);});\n"
unit.write_text(text, encoding='utf-8')
