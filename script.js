document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const display = document.getElementById('display');
  const slider = document.getElementById('sliderHours');
  const labelHours = document.getElementById('labelHours');
  const labelLeft = document.getElementById('labelLeft');

  const tabClock = document.getElementById('tabClock');
  const tabStopwatch = document.getElementById('tabStopwatch');
  const tabAlarm = document.getElementById('tabAlarm');
  const tabSettings = document.getElementById('tabSettings');

  const langSelect = document.getElementById('langSelect');
  const langSelectSettings = document.getElementById('langSelectSettings');

  const stopwatchArea = document.getElementById('stopwatchArea');
  const swStart = document.getElementById('swStart');
  const swLap = document.getElementById('swLap');
  const swReset = document.getElementById('swReset');
  const lapList = document.getElementById('lapList');

  const alarmArea = document.getElementById('alarmArea');
  const alarmTimeInput = document.getElementById('alarmTime');
  const alarmSetBtn = document.getElementById('alarmSetBtn');
  const alarmsContainer = document.getElementById('alarmsContainer');

  const settingsArea = document.getElementById('settingsArea');
  const secondsToggle = document.getElementById('secondsToggle');
  const secondsLabel = document.getElementById('secondsLabel');

  const footer = document.querySelector('.footer');

  // Localization
  const L = {
    ja: {
      'tab.clock':'時計','tab.stopwatch':'ストップウォッチ','tab.alarm':'アラーム','tab.settings':'設定',
      'btn.start':'Start','btn.stop':'Stop','btn.lap':'Lap','btn.reset':'Reset','btn.addAlarm':'アラーム追加',
      'label.hours':'1日の長さ','label.hoursValue':'24 時間','settings.showSeconds':'秒数表示',
      'settings.language':'言語','footer':'設定は自動で保存されます。',
      'msg.pickTime':'時刻を選択してください','msg.invalidTime':'不正な時刻です','msg.alarmSound':'アラームが鳴りました',
      'lap.none':'ラップなし','alarm.none':'アラームなし','btn.delete':'削除'
    },
    en: {
      'tab.clock':'Clock','tab.stopwatch':'Stopwatch','tab.alarm':'Alarm','tab.settings':'Settings',
      'btn.start':'Start','btn.stop':'Stop','btn.lap':'Lap','btn.reset':'Reset','btn.addAlarm':'Add Alarm',
      'label.hours':'Day length','label.hoursValue':'24 h','settings.showSeconds':'Show seconds',
      'settings.language':'Language','footer':'Settings are saved automatically.',
      'msg.pickTime':'Please pick a time','msg.invalidTime':'Invalid time','msg.alarmSound':'Alarm',
      'lap.none':'No laps','alarm.none':'No alarms','btn.delete':'Delete'
    }
  };

  // State
  let customHours = Number(localStorage.getItem('nclock_hours')) || 24;
  slider.value = customHours;
  labelHours.textContent = `${customHours} ${localStorage.getItem('nclock_lang')==='en'?'h':'時間'}`;
  let showSeconds = localStorage.getItem('nclock_show_seconds')==='false'?false:true;
  secondsToggle.checked = showSeconds;
  let lang = localStorage.getItem('nclock_lang')||'ja';
  langSelect.value = lang;
  langSelectSettings.value = lang;
  let mode = localStorage.getItem('nclock_mode')||'clock';
  let running = false;
  let elapsedMs = Number(localStorage.getItem('nclock_sw_elapsed')||0);
  let laps = JSON.parse(localStorage.getItem('nclock_sw_laps')||'[]');
  let alarms = JSON.parse(localStorage.getItem('nclock_alarms')||'[]');
  let lastTriggered = localStorage.getItem('nclock_last_triggered')||'';

  // Helpers
  function t(key){return L[lang][key]||key;}
  function saveAll(){
    localStorage.setItem('nclock_hours',customHours);
    localStorage.setItem('nclock_show_seconds',showSeconds);
    localStorage.setItem('nclock_lang',lang);
    localStorage.setItem('nclock_mode',mode);
    localStorage.setItem('nclock_sw_elapsed',elapsedMs);
    localStorage.setItem('nclock_sw_laps',JSON.stringify(laps));
    localStorage.setItem('nclock_alarms',JSON.stringify(alarms));
    localStorage.setItem('nclock_last_triggered',lastTriggered);
  }
  function applyLocalization(){
    tabClock.textContent = t('tab.clock');
    tabStopwatch.textContent = t('tab.stopwatch');
    tabAlarm.textContent = t('tab.alarm');
    tabSettings.textContent = t('tab.settings');
    labelLeft.textContent = t('label.hours');
    labelHours.textContent = lang==='en'?`${customHours} h`:`${customHours} 時間`;
    footer.textContent = t('footer');
    secondsLabel.textContent = showSeconds?(lang==='en'?'On':'表示'):(lang==='en'?'Off':'非表示');
  }

  // Mode switching
  function setMode(m){
    mode = m;
    [tabClock, tabStopwatch, tabAlarm, tabSettings].forEach(t=>t.classList.remove('active'));
    if(m==='clock') tabClock.classList.add('active');
    if(m==='stopwatch') tabStopwatch.classList.add('active');
    if(m==='alarm') tabAlarm.classList.add('active');
    if(m==='settings') tabSettings.classList.add('active');
    stopwatchArea.style.display = m==='stopwatch'?'flex':'none';
    alarmArea.style.display = m==='alarm'?'block':'none';
    settingsArea.style.display = m==='settings'?'block':'none';
    saveAll();
    applyLocalization();
  }
  setMode(mode);

  // Slider
  slider.addEventListener('input',()=>{customHours=Number(slider.value);labelHours.textContent=lang==='en'?`${customHours} h`:`${customHours} 時間`;saveAll();});

  // Tabs
  tabClock.addEventListener('click',()=>setMode('clock'));
  tabStopwatch.addEventListener('click',()=>setMode('stopwatch'));
  tabAlarm.addEventListener('click',()=>setMode('alarm'));
  tabSettings.addEventListener('click',()=>setMode('settings'));

  // Language
  function setLanguage(l){lang=l;langSelect.value=l;langSelectSettings.value=l;applyLocalization();saveAll();}
  langSelect.addEventListener('change',()=>setLanguage(langSelect.value));
  langSelectSettings.addEventListener('change',()=>setLanguage(langSelectSettings.value));

  // Seconds toggle
  secondsToggle.addEventListener('change',()=>{showSeconds=secondsToggle.checked;applyLocalization();saveAll();});

  // Stopwatch helpers
  function formatStopwatch(ms){
    const total=Math.floor(ms/1000);
    const h=Math.floor(total/3600);
    const m=Math.floor(total/60)%60;
    const s=total%60;
    if(h>0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  function renderLaps(){lapList.innerHTML='';if(laps.length===0){lapList.innerHTML=`<div style="color:var(--muted);padding:8px">${t('lap.none')}</div>`;return;}laps.forEach((t,i)=>{const node=document.createElement('div');node.className='lap-item';node.innerHTML=`<div>${lang==='en'?'Lap':'Lap'} ${laps.length-i}</div><div>${t}</div>`;lapList.appendChild(node);});}
  renderLaps();

  // Stopwatch events
  swStart.addEventListener('click',()=>{
    running=!running;
    if(running){swStart.textContent=t('btn.stop');swStart.classList.replace('btn-start','btn-stop');swLap.disabled=false;swReset.disabled=true;}
    else{swStart.textContent=t('btn.start');swStart.classList.replace('btn-stop','btn-start');swLap.disabled=true;swReset.disabled=false;saveAll();}
  });
  swLap.addEventListener('click',()=>{laps.unshift(formatStopwatch(elapsedMs));if(laps.length>5000) laps.pop();renderLaps();saveAll();});
  swReset.addEventListener('click',()=>{elapsedMs=0;laps=[];renderLaps();swReset.disabled=true;saveAll();});

  // Alarm helpers
  function genId(){return Math.floor(Math.random()*1e9).toString(36);}
  function renderAlarms(){alarmsContainer.innerHTML='';if(alarms.length===0){alarmsContainer.innerHTML=`<div style="color:var(--muted);padding:8px">${t('alarm.none')}</div>`;return;}alarms.forEach((a,idx)=>{const card=document.createElement('div');card.className='alarm-card';const timeDiv=document.createElement('div');timeDiv.className='alarm-time';timeDiv.textContent=`${String(a.hour).padStart(2,'0')}:${String(a.min).padStart(2,'0')}`;const actions=document.createElement('div');actions.className='alarm-actions';const toggle=document.createElement('div');toggle.className='toggle'+(a.enabled?' on':'');const thumb=document.createElement('div');thumb.className='thumb';toggle.appendChild(thumb);toggle.addEventListener('click',()=>{a.enabled=!a.enabled;saveAll();renderAlarms();});const del=document.createElement('button');del.className='del-btn';del.textContent=t('btn.delete');del.addEventListener('click',()=>{alarms.splice(idx,1);saveAll();render
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       Alarms renderingの続きです。先ほどのコードの最後から接続してください。

Alarms renderingの続き:
    renderAlarms();
    });
    actions.appendChild(toggle);
    actions.appendChild(del);
    card.appendChild(timeDiv);
    card.appendChild(actions);
    alarmsContainer.appendChild(card);
  });
}
renderAlarms();

// Alarm set
alarmSetBtn.addEventListener('click',()=>{
  const val=alarmTimeInput.value;
  if(!val){alert(t('msg.pickTime'));return;}
  const parts=val.split(':');
  if(parts.length!==2){alert(t('msg.invalidTime'));return;}
  const hour=Number(parts[0]), min=Number(parts[1]);
  if(isNaN(hour)||isNaN(min)||hour<0||hour>23||min<0||min>59){alert(t('msg.invalidTime'));return;}
  alarms.push({id:genId(),hour,min,enabled:true});
  alarmTimeInput.value='';
  saveAll();
  renderAlarms();
});

// Main clock loop
function updateClock(){
  const now=new Date();
  // Adjusted for customHours/day
  const totalSec=(now.getHours()*3600+now.getMinutes()*60+now.getSeconds());
  const scaledSec=Math.floor(totalSec*24/customHours);
  const h=Math.floor(scaledSec/3600)%24;
  const m=Math.floor(scaledSec/60)%60;
  const s=scaledSec%60;
  display.textContent=showSeconds?`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;

  // Check alarms
  alarms.forEach(a=>{
    if(a.enabled && h===a.hour && m===a.min && lastTriggered!==`${a.id}-${now.getDate()}`){
      alert(t('msg.alarmSound'));
      lastTriggered=`${a.id}-${now.getDate()}`;
      saveAll();
    }
  });
}
setInterval(()=>{
  if(mode==='clock') updateClock();
  if(mode==='stopwatch' && running){elapsedMs+=100;saveAll();renderLaps();display.textContent=formatStopwatch(elapsedMs);}
},100);

// Initial display
updateClock();
display.textContent=mode==='stopwatch'?formatStopwatch(elapsedMs):display.textContent;
