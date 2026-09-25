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
  const sections = ["home","about","services","drumkit","worship","contact"].map(id=>document.getElementById(id));

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

  /* worship pad synth — separate audio graph from the drum kit above, sustains until tapped again */
  let wActx = null, wReverb = null, wDryGain = null, wWetGain = null, wLimiter = null;
  let chordMode = "major";
  let currentTone = "warm";

  const tonePresets = {
    warm:    { oscTypes:["sine","triangle"], filterStart:350,  filterEnd:1700, filterQ:0.4, attack:1.4, release:2.0, lfoRate:0.10, lfoDepth:2.5, shimmer:0.08, wet:0.55 },
    bright:  { oscTypes:["triangle","sawtooth"], filterStart:600, filterEnd:3200, filterQ:0.6, attack:1.0, release:1.6, lfoRate:0.15, lfoDepth:3.5, shimmer:0.14, wet:0.45 },
    strings: { oscTypes:["sawtooth","triangle"], filterStart:400, filterEnd:1900, filterQ:0.5, attack:1.8, release:2.4, lfoRate:0.08, lfoDepth:2.5, shimmer:0.06, wet:0.5 },
    airy:    { oscTypes:["sine","sine"], filterStart:800, filterEnd:2600, filterQ:0.3, attack:2.2, release:2.8, lfoRate:0.06, lfoDepth:2.0, shimmer:0.22, wet:0.75 },
  };

  function buildReverb(c){
    const duration = 3.2, rate = c.sampleRate;
    const len = rate * duration;
    const buf = c.createBuffer(2, len, rate);
    for(let ch=0; ch<2; ch++){
      const data = buf.getChannelData(ch);
      for(let i=0;i<len;i++){
        data[i] = (Math.random()*2-1) * Math.pow(1 - i/len, 2.4);
      }
    }
    const conv = c.createConvolver();
    conv.buffer = buf;
    return conv;
  }

  function wCtx(){
    if(!wActx){
      wActx = new AudioCtx();
      wReverb = buildReverb(wActx);
      wLimiter = wActx.createDynamicsCompressor();
      wLimiter.threshold.value = -6;
      wLimiter.knee.value = 6;
      wLimiter.ratio.value = 12;
      wLimiter.attack.value = 0.003;
      wLimiter.release.value = 0.25;
      wLimiter.connect(wActx.destination);
      wDryGain = wActx.createGain(); wDryGain.gain.value = 0.5;
      wWetGain = wActx.createGain(); wWetGain.gain.value = 0.55;
      wDryGain.connect(wLimiter);
      wReverb.connect(wWetGain).connect(wLimiter);
    }
    return wActx;
  }

  function chordFreqs(root, mode){
    const thirdInterval = mode === "minor" ? Math.pow(2, 3/12) : Math.pow(2, 4/12);
    const fifthInterval = Math.pow(2, 7/12);
    return [root, root * thirdInterval, root * fifthInterval];
  }

  const activeWorshipPads = {};

  function startWorshipPad(padEl, rootFreq){
    const c = wCtx(), t = c.currentTime;
    const preset = tonePresets[currentTone];
    wWetGain.gain.value = preset.wet;

    const master = c.createGain();
    master.gain.setValueAtTime(0, t);
    master.gain.linearRampToValueAtTime(0.24, t + preset.attack);

    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(preset.filterStart, t);
    filter.frequency.linearRampToValueAtTime(preset.filterEnd, t + preset.attack);
    filter.Q.value = preset.filterQ;

    master.connect(filter);
    filter.connect(wDryGain);
    filter.connect(wReverb);

    const lfo = c.createOscillator();
    lfo.frequency.value = preset.lfoRate;
    const lfoGain = c.createGain();
    lfoGain.gain.value = preset.lfoDepth;
    lfo.connect(lfoGain);
    lfo.start(t);

    const oscillators = [];
    const freqs = chordFreqs(rootFreq, chordMode);
    freqs.forEach((freq, voiceIdx)=>{
      [ -2, 2 ].forEach((detuneCents, i)=>{
        const osc = c.createOscillator();
        osc.type = preset.oscTypes[i];
        osc.frequency.value = freq;
        osc.detune.value = detuneCents;
        lfoGain.connect(osc.detune);
        const g = c.createGain();
        g.gain.value = voiceIdx === 0 ? 0.4 : 0.34;
        osc.connect(g).connect(master);
        osc.start(t);
        oscillators.push(osc);
      });
    });

    // faint octave-up shimmer on the root only, amount varies per tone preset
    const shimmer = c.createOscillator();
    shimmer.type = "sine";
    shimmer.frequency.value = rootFreq * 2;
    const shimmerGain = c.createGain();
    shimmerGain.gain.value = preset.shimmer;
    shimmer.connect(shimmerGain).connect(master);
    shimmer.start(t);
    oscillators.push(shimmer);

    activeWorshipPads[padEl.dataset.padId] = { master, oscillators, lfo, release: preset.release };
    padEl.classList.add("playing");
  }

  function stopWorshipPad(padEl){
    const active = activeWorshipPads[padEl.dataset.padId];
    if(!active) return;
    const c = wCtx(), t = c.currentTime;
    active.master.gain.cancelScheduledValues(t);
    active.master.gain.setValueAtTime(active.master.gain.value, t);
    active.master.gain.linearRampToValueAtTime(0, t + active.release);
    active.oscillators.forEach(osc=> osc.stop(t + active.release + 0.1));
    active.lfo.stop(t + active.release + 0.1);
    delete activeWorshipPads[padEl.dataset.padId];
    padEl.classList.remove("playing");
  }

  function stopAllWorshipPads(){
    Object.keys(activeWorshipPads).forEach(id=>{
      const pad = document.querySelector('[data-pad-id="'+id+'"]');
      if(pad) stopWorshipPad(pad);
    });
  }

  document.querySelectorAll(".wpad").forEach((pad, i)=>{
    pad.dataset.padId = "wpad" + i;
    pad.addEventListener("pointerdown", (e)=>{
      e.preventDefault();
      const freq = Number(pad.getAttribute("data-freq"));
      if(activeWorshipPads[pad.dataset.padId]){
        stopWorshipPad(pad);
        return;
      }
      stopAllWorshipPads();
      startWorshipPad(pad, freq);
    });
  });

  const majorBtn = document.getElementById("majorBtn");
  const minorBtn = document.getElementById("minorBtn");
  if(majorBtn && minorBtn){
    majorBtn.addEventListener("click", ()=>{
      if(chordMode === "major") return;
      chordMode = "major";
      majorBtn.classList.add("active");
      minorBtn.classList.remove("active");
      stopAllWorshipPads();
    });
    minorBtn.addEventListener("click", ()=>{
      if(chordMode === "minor") return;
      chordMode = "minor";
      minorBtn.classList.add("active");
      majorBtn.classList.remove("active");
      stopAllWorshipPads();
    });
  }

  const toneButtons = document.querySelectorAll(".tone-btn");
  toneButtons.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const tone = btn.getAttribute("data-tone");
      if(currentTone === tone) return;
      currentTone = tone;
      toneButtons.forEach(b=> b.classList.remove("active"));
      btn.classList.add("active");
      stopAllWorshipPads();
    });
  });
});