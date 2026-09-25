document.addEventListener("DOMContentLoaded", function(){

  const bookBtn = document.getElementById("bookBtn");
  if(bookBtn){
    bookBtn.addEventListener("click", function(){
      window.open("https://wa.me/233206834470?text=Hi%20Phil%20Jazzy%20-%20I'm%20from%20your%20website%20and%20want%20to%20book%20you%20for%20my%20program%20in%20Accra","_blank");
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
  let actx = null, master = null, compressor = null;
  function ctx(){
    if(!actx){
      actx = new AudioCtx();
      compressor = actx.createDynamicsCompressor();
      compressor.threshold.value = -12;
      compressor.knee.value = 12;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.002;
      compressor.release.value = 0.15;
      master = actx.createGain();
      master.gain.value = 3.6;
      compressor.threshold.value = -18;
      compressor.ratio.value = 6;
      compressor.connect(master).connect(actx.destination);
    }
    return actx;
  }
  function out(){ return compressor; }

  function kick(){
    const c = ctx(), t = c.currentTime;
    const osc = c.createOscillator(), gain = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t+0.35);
    gain.gain.setValueAtTime(2.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t+0.4);
    osc.connect(gain).connect(out());
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
    noise.connect(filter).connect(gain).connect(out());
    noise.start(t);
  }
  function snare(){
    noiseBurst({decay:0.18, filterType:"highpass", freq:900, gainVal:2.4});
    const c = ctx(), t = c.currentTime;
    const osc = c.createOscillator(), gain = c.createGain();
    osc.type = "triangle"; osc.frequency.setValueAtTime(180, t);
    gain.gain.setValueAtTime(1.3, t); gain.gain.exponentialRampToValueAtTime(0.001, t+0.12);
    osc.connect(gain).connect(out()); osc.start(t); osc.stop(t+0.12);
  }
  function hihat(){ noiseBurst({decay:0.06, filterType:"highpass", freq:7000, gainVal:1.4}); }
  function ride(){ noiseBurst({decay:0.5, filterType:"highpass", freq:5000, gainVal:1.0}); }
  function crash(){ noiseBurst({decay:1.1, filterType:"highpass", freq:4000, gainVal:1.4}); }
  function tom(){
    const c = ctx(), t = c.currentTime;
    const osc = c.createOscillator(), gain = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(90, t+0.3);
    gain.gain.setValueAtTime(2.4, t); gain.gain.exponentialRampToValueAtTime(0.001, t+0.35);
    osc.connect(gain).connect(out()); osc.start(t); osc.stop(t+0.35);
  }
  const sounds = {kick, snare, hihat, tom, ride, crash, clap, cowbell, rimshot};

  function clap(){
    // three quick layered noise bursts to emulate a hand clap
    [0, 0.02, 0.04].forEach(delay=>{
      const c = ctx(), t = c.currentTime + delay;
      const bufferSize = c.sampleRate * 0.12;
      const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
      const data = buffer.getChannelData(0);
      for(let i=0;i<bufferSize;i++) data[i] = (Math.random()*2-1) * (1 - i/bufferSize);
      const noise = c.createBufferSource();
      noise.buffer = buffer;
      const filter = c.createBiquadFilter();
      filter.type = "bandpass"; filter.frequency.value = 1200; filter.Q.value = 1.5;
      const gain = c.createGain();
      gain.gain.setValueAtTime(1.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t+0.12);
      noise.connect(filter).connect(gain).connect(out());
      noise.start(t);
    });
  }

  function cowbell(){
    const c = ctx(), t = c.currentTime;
    [540, 800].forEach(freq=>{
      const osc = c.createOscillator();
      osc.type = "square";
      osc.frequency.value = freq;
      const gain = c.createGain();
      gain.gain.setValueAtTime(1.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t+0.3);
      osc.connect(gain).connect(out());
      osc.start(t); osc.stop(t+0.3);
    });
  }

  function rimshot(){
    const c = ctx(), t = c.currentTime;
    const osc = c.createOscillator();
    osc.type = "square"; osc.frequency.value = 420;
    const oGain = c.createGain();
    oGain.gain.setValueAtTime(1.4, t);
    oGain.gain.exponentialRampToValueAtTime(0.001, t+0.06);
    osc.connect(oGain).connect(out());
    osc.start(t); osc.stop(t+0.06);
    noiseBurst({decay:0.05, filterType:"highpass", freq:3000, gainVal:1.0});
  }

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