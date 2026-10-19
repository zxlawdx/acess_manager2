from pathlib import Path

css = Path('apps/access_manager/static/css/world.css')
text = css.read_text(encoding='utf-8')
rule = '.world-experience-ui>.world-crosshair,.world-experience-ui>#world-connection,.world-experience-ui>#world-speech{pointer-events:none}\n'
if rule not in text:
    text += '\n' + rule
css.write_text(text, encoding='utf-8')

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
test.write_text(text, encoding='utf-8')
