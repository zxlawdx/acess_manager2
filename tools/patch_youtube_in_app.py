from pathlib import Path

path = Path('apps/access_manager/static/js/world/experience.js')
text = path.read_text(encoding='utf-8')

text = text.replace(
    '<button type="submit">Abrir busca / reproduzir</button>',
    '<button type="submit">Pesquisar / reproduzir</button>',
    1,
)

old = """ async function openNativeYouTubeSearch(query){const api=window.pywebview?.api;if(typeof api?.open_youtube_search!=='function')return false;const result=await api.open_youtube_search(query);if(!result?.ok)throw new Error(result?.error||'Não foi possível abrir a busca real do YouTube.');$('world-tv-status').textContent='Busca real do YouTube aberta. Clique em um vídeo; ele será enviado para a televisão 3D.';return true;}\n const youtubeSelected=async event=>{if(event.detail?.name!=='youtube:selected')return;const payload=event.detail?.payload||{},value=payload.value||payload.videoId;if(!value)return;try{await playYouTubeSelection(value,'Vídeo selecionado');closeDialogs();}catch(error){$('world-tv-status').textContent=error.message;}};\n window.addEventListener('vela:event',youtubeSelected);\n $('world-tv-form').onsubmit=async e=>{e.preventDefault();const value=$('world-youtube-url').value.trim();$('world-youtube-results').replaceChildren();$('world-tv-status').textContent='Abrindo YouTube…';try{if(looksLikeYouTubeReference(value)){await playYouTubeSelection(value);return;}if(await openNativeYouTubeSearch(value))return;const results=await searchYouTube(value);paintYouTubeResults(results);$('world-tv-status').textContent=results.length?'Escolha um resultado para reproduzir na TV 3D.':'Nenhum vídeo encontrado.';}catch(error){$('world-tv-status').textContent=error.message;}};\n"""
new = """ $('world-tv-form').onsubmit=async e=>{e.preventDefault();const value=$('world-youtube-url').value.trim();const submit=e.submitter||$('world-tv-form').querySelector('button[type=\"submit\"]');$('world-youtube-results').replaceChildren();$('world-tv-status').textContent=looksLikeYouTubeReference(value)?'Carregando vídeo na televisão 3D…':'Pesquisando vídeos dentro do Access Manager…';if(submit)submit.disabled=true;try{if(looksLikeYouTubeReference(value)){await playYouTubeSelection(value);return;}const results=await searchYouTube(value);paintYouTubeResults(results);$('world-tv-status').textContent=results.length?`${results.length} resultado(s). Escolha um vídeo para reproduzir na TV 3D.`:'Nenhum vídeo encontrado.';}catch(error){$('world-tv-status').textContent=error.message||'Não foi possível pesquisar no YouTube agora.';}finally{if(submit)submit.disabled=false;}};\n"""
if old not in text:
    raise SystemExit('YouTube native-search block not found')
text = text.replace(old, new, 1)

old_dispose = "dispose(){clearTimeout(speechTimer);tv.destroy();window.removeEventListener('vela:event',youtubeSelected);document.removeEventListener('keydown',keydown,true);}};"
new_dispose = "dispose(){clearTimeout(speechTimer);tv.destroy();document.removeEventListener('keydown',keydown,true);}};"
if old_dispose not in text:
    raise SystemExit('YouTube native-search dispose hook not found')
text = text.replace(old_dispose, new_dispose, 1)

path.write_text(text, encoding='utf-8')
