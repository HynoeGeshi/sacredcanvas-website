import {sceneState} from './scene-state.mjs';
(()=>{
const $=s=>document.querySelector(s),music=$('#lounge-music'),toggle=$('#music-toggle'),status=$('#music-status')||{textContent:''},enter=$('#enter-vibe'),mute=$('#master-mute');
const sliders={music:$('#music-volume'),rain:$('#rain-volume'),fire:$('#fire-volume'),ui:$('#ui-volume')};
let soundContext,layers=[],muted=false,playing=false;
const level=name=>Math.max(0,Math.min(1,Number(sliders[name]?.value||0)/100));
function updateVolumes(){if(music)music.volume=muted?0:level('music');for(const layer of layers)layer.gain.gain.setTargetAtTime(muted?0:level(layer.kind)*.1,soundContext.currentTime,.12);for(const [name,slider]of Object.entries(sliders)){if(slider)slider.setAttribute('aria-valuetext',Math.round(level(name)*100)+' percent');}if(mute){mute.setAttribute('aria-pressed',String(muted));mute.textContent=muted?'Unmute sound':'Mute all';}}
function stopAtmosphere(){for(const layer of layers){try{layer.source.stop();layer.source.disconnect();layer.filter.disconnect();layer.gain.disconnect();}catch{}}layers=[];}
function startAtmosphere(){if(layers.length)return;try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;soundContext ||= new Audio();soundContext.resume().catch(()=>{});for(const [kind,frequency]of [['rain',1800],['fire',240]]){const buffer=soundContext.createBuffer(1,soundContext.sampleRate*4,soundContext.sampleRate),channel=buffer.getChannelData(0);for(let i=0;i<channel.length;i++)channel[i]=(Math.random()*2-1)*(kind==='fire'?(Math.random()<.0015?1:.08):.28);const source=soundContext.createBufferSource(),filter=soundContext.createBiquadFilter(),gain=soundContext.createGain();source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=frequency;gain.gain.value=0;source.connect(filter).connect(gain).connect(soundContext.destination);source.start();layers.push({kind,source,filter,gain});}updateVolumes();}catch{status.textContent='Music playing; ambience is unavailable in this browser.';}}
function updateButtons(){if(toggle){toggle.textContent=playing?'Pause lounge music':'Play lounge music';toggle.setAttribute('aria-pressed',String(playing));}if(enter){enter.textContent=playing?'Pause the Vibe':'Enter the Vibe';enter.setAttribute('aria-pressed',String(playing));}}
function pauseSound(message='Sound paused'){music?.pause();stopAtmosphere();playing=false;updateButtons();status.textContent=message;}
async function playSound(){if(!music)return;try{updateVolumes();await music.play();playing=true;startAtmosphere();updateButtons();status.textContent=muted?'Playing, muted':'Lounge music and ambience playing softly. Adjust each layer below.';}catch{pauseSound('Audio could not start. Select Enter the Vibe to try again.');}}
async function toggleSound(){if(playing||(music&&!music.paused))pauseSound('Music off');else await playSound();}
if(!music&&enter)enter.hidden=true;
toggle?.addEventListener('click',toggleSound);enter?.addEventListener('click',toggleSound);
mute?.addEventListener('click',()=>{muted=!muted;updateVolumes();status.textContent=muted?'All sound muted':playing?'Sound restored':'Sound ready; select Enter the Vibe to start';});
for(const slider of Object.values(sliders))slider?.addEventListener('input',updateVolumes);
music?.addEventListener('error',()=>pauseSound('Music is unavailable. Please try again later.'));
// Optional, quiet interaction sounds are disabled until the visitor enables them.
document.addEventListener('click',event=>{if(!playing||muted||!soundContext||!level('ui')||!event.target?.closest?.('button,a,summary'))return;try{const oscillator=soundContext.createOscillator(),gain=soundContext.createGain();oscillator.type='sine';oscillator.frequency.value=540;gain.gain.setValueAtTime(level('ui')*.025,soundContext.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,soundContext.currentTime+.09);oscillator.connect(gain).connect(soundContext.destination);oscillator.start();oscillator.stop(soundContext.currentTime+.1);}catch{}});
document.querySelectorAll('button.video-load[data-video]').forEach(button=>button.addEventListener('click',()=>{pauseSound('Music paused for video');const frame=document.createElement('iframe');frame.src='https://www.tiktok.com/player/v1/'+button.dataset.video+'?autoplay='+(document.body.dataset.video==='autoload'?'1&muted=1':'0')+'&controls=1&description=1&rel=0';frame.title=button.dataset.title;frame.allow='autoplay; fullscreen';frame.setAttribute('allowfullscreen','');button.replaceWith(frame);}));
if(document.body.dataset.video==='autoload')document.querySelectorAll('button.video-load[data-video]').forEach(b=>b.click());
// Respect the selected setting; manual is the approved default and creates no audio context on load.
if(document.body.dataset.audio==='autostart')playSound();
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseSound('Sound paused while this page is hidden');});
updateVolumes();
if(document.body.classList.contains('tropical')){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),motion=$('#motion-toggle');let paused=false,queued=false;
 const update=()=>{queued=false;const p=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight),s=sceneState(p,reduced.matches||paused);for(const[key,value]of Object.entries(s))document.body.style.setProperty('--scene-'+key,String(value));document.body.dataset.night=s.night>.56?'true':'false';document.body.dataset.motion=reduced.matches||paused?'paused':'scroll';if(motion){motion.disabled=reduced.matches;motion.setAttribute('aria-pressed',String(paused||reduced.matches));motion.textContent=reduced.matches?'Reduced motion enabled':paused?'Resume scenery':'Pause scenery';}};
 const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(update);}};
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});reduced.addEventListener('change',schedule);motion?.addEventListener('click',()=>{paused=!paused;schedule();});update();
}
})();
