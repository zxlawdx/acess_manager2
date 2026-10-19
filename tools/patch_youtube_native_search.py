from pathlib import Path

path = Path('apps/access_manager/static/js/world/experience.js')
text = path.read_text(encoding='utf-8')

text = text.replace(
    '<button type="submit">Pesquisar / reproduzir</button>',
    '<button type="submit">Abrir busca / reproduzir</button>',
    1,
)

start = text.index(" $('world-youtube-url').value=settings.youtube;")
end = text.index(" const keydown=e=>", start)
replacement = r''' $('world-youtube-url').value=settings.youtube;
 function tvHost(){return getWorld()?.environmentSystem?.tvSurface||null;}
 async function playYouTubeSelection(value,label='Vídeo'){const data=parseYouTube(value);tv.attach(tvHost());await tv.play(value);settings.youtube=value;save();$('world-youtube-url').value=value;$('world-youtube-external').href=youtubeURL(data);$('world-youtube-external').hidden=false;$('world-tv-status').textContent=`${label} carregado na televisão 3D.`;}
 function paintYouTubeResults(results){const box=$('world-youtube-results');box.replaceChildren();if(!results.length){box.textContent='Nenhum vídeo encontrado.';return;}for(const item of results){const button=document.createElement('button');button.type='button';button.className='world-youtube-result';const img=document.createElement('img');img.alt='';img.loading='lazy';img.src=item.thumbnail||'';const meta=document.createElement('span');const title=document.createElement('strong');title.textContent=item.title||'Vídeo';const detail=document.createElement('small');detail.textContent=[item.channel,item.duration].filter(Boolean).join(' · ');meta.append(title,detail);button.append(img,meta);button.onclick=async()=>{try{await playYouTubeSelection(item.videoId,item.title||'Vídeo');}catch(error){$('world-tv-status').textContent=error.message;}};box.append(button);}}
 async function openNativeYouTubeSearch(query){const api=window.pywebview?.api;if(typeof api?.open_youtube_search!=='function')return false;const result=await api.open_youtube_search(query);if(!result?.ok)throw new Error(result?.error||'Não foi possível abrir a busca real do YouTube.');$('world-tv-status').textContent='Busca real do YouTube aberta. Clique em um vídeo; ele será enviado para a televisão 3D.';return true;}
 const youtubeSelected=async event=>{if(event.detail?.name!=='youtube:selected')return;const payload=event.detail?.payload||{},value=payload.value||payload.videoId;if(!value)return;try{await playYouTubeSelection(value,'Vídeo selecionado');closeDialogs();}catch(error){$('world-tv-status').textContent=error.message;}};
 window.addEventListener('vela:event',youtubeSelected);
 $('world-tv-form').onsubmit=async e=>{e.preventDefault();const value=$('world-youtube-url').value.trim();$('world-youtube-results').replaceChildren();$('world-tv-status').textContent='Abrindo YouTube…';try{if(looksLikeYouTubeReference(value)){await playYouTubeSelection(value);return;}if(await openNativeYouTubeSearch(value))return;const results=await searchYouTube(value);paintYouTubeResults(results);$('world-tv-status').textContent=results.length?'Escolha um resultado para reproduzir na TV 3D.':'Nenhum vídeo encontrado.';}catch(error){$('world-tv-status').textContent=error.message;}};
'''
text = text[:start] + replacement + text[end:]

old = "dispose(){clearTimeout(speechTimer);tv.destroy();document.removeEventListener('keydown',keydown,true);}};"
new = "dispose(){clearTimeout(speechTimer);tv.destroy();window.removeEventListener('vela:event',youtubeSelected);document.removeEventListener('keydown',keydown,true);}};"
if old not in text:
    raise SystemExit('dispose hook not found')
text = text.replace(old, new, 1)
path.write_text(text, encoding='utf-8')
