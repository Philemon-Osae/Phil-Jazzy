document.addEventListener("DOMContentLoaded", function(){

  const bookBtn = document.getElementById("bookBtn");
  if(bookBtn){
    bookBtn.addEventListener("click", function(){
      window.open("https://api.whatsapp.com/send?phone=233206834470&text=Hello%20Phil%20Jazzy,%20I%20would%20like%20to%20book%20your%20drumming%20services.", "_blank");
    });
  }

  const cards = document.querySelectorAll(".card");
  const revealObs = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{ if(entry.isIntersecting) entry.target.classList.add("visible"); });
  }, {threshold:0.15});
  cards.forEach(c=> revealObs.observe(c));

  const progress = document.getElementById("progress");
  const toTop = document.getElementById("toTop");
  const navLinks = document.querySelectorAll("nav a");
  const sections = ["home","about","services","drumkit","contact"].map(id=>document.getElementById(id));

  window.addEventListener("scroll", function(){
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progress.style.width = scrolled + "%";
    toTop.classList.toggle("show", h.scrollTop > 400);

    let current = sections[0].id;
    sections.forEach(sec=>{
      if(sec.getBoundingClientRect().top <= 100) current = sec.id;
    });
    navLinks.forEach(a=> a.classList.toggle("active", a.getAttribute("href") === "#"+current));
  });
  toTop.addEventListener("click", ()=> window.scrollTo({top:0, behavior:"smooth"}));

  const phrases = ["Pocket & Feel", "Serve The Song", "Code by Day, Drum by Night", "Accra's Steady Groove"];
  const tagEl = document.getElementById("rotatingTag");
  let pi = 0, ci = 0, deleting = false;
  function typeLoop(){
    const word = phrases[pi];
    ci += deleting ? -1 : 1;
    tagEl.textContent = word.slice(0, ci);
    let delay = deleting ? 40 : 90;
    if(!deleting && ci === word.length){ delay = 1400; deleting = true; }
    else if(deleting && ci === 0){ deleting = false; pi = (pi+1) % phrases.length; delay = 300; }
    setTimeout(typeLoop, delay);
  }
  typeLoop();

  const notesWrap = document.getElementById("notes");
  const symbols = ["♪","♫","♬","♩"];
  for(let i=0;i<14;i++){
    const n = document.createElement("div");
    n.className = "note";
    n.textContent = symbols[Math.floor(Math.random()*symbols.length)];
    n.style.left = Math.random()*100 + "%";
    n.style.fontSize = (14 + Math.random()*20) + "px";
    n.style.animationDuration = (6 + Math.random()*8) + "s";
    n.style.animationDelay = (Math.random()*8) + "s";
    notesWrap.appendChild(n);
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let actx = null;
  function ctx(){ if(!actx) actx = new AudioCtx(); return actx; }

  function kick(){
    const c = ctx(), t = c.currentTime;
    const osc = c.createOscillator(), gain = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t+0.35);
    gain.gain.setValueAtTime(1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t+0.4);
    osc.connect(gain).connect(c.destination);
    osc.start(t); osc.stop(t+0.4);
  }
  function noiseBurst({decay=0.15, filterType="highpass", freq=1000, gainVal=0.7}={}){
    const c = ctx(), t = c.currentTime;
    const bufferSize = c.sampleRate * decay;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<bufferSize;i++) data[i] = (Math.random()*2-1) * (1 - i/bufferSize);
    const noise = c.createBufferSource();
    noise.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = filterType; filter.frequency.value = freq;
    const gain = c.createGain();
    gain.gain.setValueAtTime(gainVal, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t+decay);
    noise.connect(filter).connect(gain).connect(c.destination);
    noise.start(t);
  }
  function snare(){
    noiseBurst({decay:0.18, filterType:"highpass", freq:900, gainVal:0.8});
    const c = ctx(), t = c.currentTime;
    const osc = c.createOscillator(), gain = c.createGain();
    osc.type = "triangle"; osc.frequency.setValueAtTime(180, t);
    gain.gain.setValueAtTime(0.4, t); gain.gain.exponentialRampToValueAtTime(0.001, t+0.12);
    osc.connect(gain).connect(c.destination); osc.start(t); osc.stop(t+0.12);
  }
  function hihat(){ noiseBurst({decay:0.06, filterType:"highpass", freq:7000, gainVal:0.4}); }
  function ride(){ noiseBurst({decay:0.5, filterType:"highpass", freq:5000, gainVal:0.25}); }
  function crash(){ noiseBurst({decay:1.1, filterType:"highpass", freq:4000, gainVal:0.4}); }
  function tom(){
    const c = ctx(), t = c.currentTime;
    const osc = c.createOscillator(), gain = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(90, t+0.3);
    gain.gain.setValueAtTime(0.8, t); gain.gain.exponentialRampToValueAtTime(0.001, t+0.35);
    osc.connect(gain).connect(c.destination); osc.start(t); osc.stop(t+0.35);
  }
  const sounds = {kick, snare, hihat, tom, ride, crash};

  const pads = document.querySelectorAll(".pad");
  function hitPad(pad){
    const s = pad.getAttribute("data-sound");
    if(sounds[s]) sounds[s]();
    pad.classList.add("hit");
    setTimeout(()=> pad.classList.remove("hit"), 120);
  }
  pads.forEach(pad=>{
    pad.addEventListener("pointerdown", ()=> hitPad(pad));
  });
  document.addEventListener("keydown", (e)=>{
    if(e.repeat) return;
    const key = e.key.toLowerCase();
    const pad = document.querySelector('.pad[data-key="'+key+'"]');
    if(pad) hitPad(pad);
  });
});
