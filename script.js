
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // ==========================================
  // 1. GENERAL HELPERS
  // ==========================================

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ==========================================
  // 2. WHATSAPP BOOKING
  // ==========================================

  const bookBtn = $("#bookBtn");

  if (bookBtn) {
    bookBtn.addEventListener("click", () => {
      const message = encodeURIComponent(
        "Hi Phil Jazzy! I'm interested in booking you for an event. Please let me know your availability and booking details."
      );

      window.open(
        `https://wa.me/233206834470?text=${message}`,
        "_blank",
        "noopener,noreferrer"
      );
    });
  }

  // ==========================================
  // 3. SCROLL PROGRESS
  // ==========================================

  const progress = $("#progress");

  function updateProgress() {
    if (!progress) return;

    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;

    const percentage =
      scrollable > 0
        ? (window.scrollY / scrollable) * 100
        : 0;

    progress.style.width = `${percentage}%`;
  }

  window.addEventListener("scroll", updateProgress, {
    passive: true
  });

  updateProgress();

  // ==========================================
  // 4. BACK TO TOP
  // ==========================================

  const toTop = $("#toTop");

  if (toTop) {
    window.addEventListener("scroll", () => {
      toTop.classList.toggle(
        "show",
        window.scrollY > 400
      );
    }, { passive: true });

    toTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "instant" : "smooth"
      });
    });
  }

  // ==========================================
  // 5. SCROLL REVEAL ANIMATIONS
  // ==========================================

  const revealElements = $$(".card, .reveal");

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach(element => {
      element.classList.add("visible");
    });
  }

  // ==========================================
  // 6. ACTIVE NAVIGATION
  // ==========================================

  const navLinks = $$(".nav a[href^='#']");
  const sections = navLinks
    .map(link => $(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          navLinks.forEach(link => {
            const active =
              link.getAttribute("href") === `#${entry.target.id}`;

            link.classList.toggle("active", active);

            if (active) {
              link.setAttribute("aria-current", "location");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      {
        rootMargin: "-30% 0px -60% 0px"
      }
    );

    sections.forEach(section => {
      sectionObserver.observe(section);
    });
  }

  // ==========================================
  // 7. ROTATING HERO TAGLINES
  // ==========================================

  const tagline = $("#tagline");

  if (tagline) {
    const phrases = [
      "Pocket & Feel",
      "Serve The Song",
      "Code by Day, Drum by Night",
      "Accra's Steady Groove"
    ];

    if (!prefersReducedMotion) {
      let phraseIndex = 0;
      let characterIndex = 0;
      let deleting = false;

      function typePhrase() {
        const phrase = phrases[phraseIndex];

        if (deleting) {
          characterIndex--;
        } else {
          characterIndex++;
        }

        tagline.textContent = phrase.substring(
          0,
          characterIndex
        );

        let delay = deleting ? 45 : 90;

        if (!deleting && characterIndex === phrase.length) {
          deleting = true;
          delay = 1800;
        } else if (deleting && characterIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          delay = 400;
        }

        window.setTimeout(typePhrase, delay);
      }

      typePhrase();
    } else {
      tagline.textContent = phrases[0];
    }
  }

  // ==========================================
  // 8. FLOATING MUSIC NOTES
  // ==========================================

  const notesWrap = $("#notesWrap");

  if (notesWrap && !prefersReducedMotion) {
    const notes = ["♪", "♫", "♬", "♩"];

    for (let i = 0; i < 14; i++) {
      const note = document.createElement("span");

      note.className = "music-note";
      note.textContent =
        notes[Math.floor(Math.random() * notes.length)];

      note.style.left = `${Math.random() * 100}%`;
      note.style.animationDelay = `${Math.random() * 12}s`;
      note.style.animationDuration = `${10 + Math.random() * 12}s`;

      notesWrap.appendChild(note);
    }
  }

  // ==========================================
  // 9. DRUM KIT AUDIO ENGINE
  // ==========================================

  let drumContext = null;
  let drumMaster = null;
  let drumCompressor = null;

  function initDrumAudio() {
    if (drumContext) return drumContext;

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      console.warn("Web Audio is not supported in this browser.");
      return null;
    }

    drumContext = new AudioContextClass();

    drumMaster = drumContext.createGain();
    drumMaster.gain.value = 0.8;

    drumCompressor = drumContext.createDynamicsCompressor();
    drumCompressor.threshold.value = -18;
    drumCompressor.knee.value = 20;
    drumCompressor.ratio.value = 8;
    drumCompressor.attack.value = 0.003;
    drumCompressor.release.value = 0.2;

    drumMaster.connect(drumCompressor);
    drumCompressor.connect(drumContext.destination);

    return drumContext;
  }

  async function resumeDrumAudio() {
    const context = initDrumAudio();

    if (context && context.state === "suspended") {
      try {
        await context.resume();
      } catch (error) {
        console.warn("Could not start drum audio:", error);
      }
    }

    return context;
  }

  function drumGain(value, duration = 0.1) {
    const gain = drumContext.createGain();

    gain.gain.setValueAtTime(
      Math.max(0.0001, value),
      drumContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      drumContext.currentTime + duration
    );

    gain.connect(drumMaster);

    return gain;
  }

  function playKick() {
    const now = drumContext.currentTime;

    const oscillator = drumContext.createOscillator();
    const gain = drumGain(1.1, 0.5);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(150, now);
    oscillator.frequency.exponentialRampToValueAtTime(38, now + 0.45);

    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(now + 0.5);
  }

  function playSnare() {
    const now = drumContext.currentTime;

    const bufferSize = drumContext.sampleRate * 0.22;
    const buffer = drumContext.createBuffer(
      1,
      bufferSize,
      drumContext.sampleRate
    );

    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = drumContext.createBufferSource();
    const noiseFilter = drumContext.createBiquadFilter();
    const noiseGain = drumGain(0.65, 0.2);

    noise.buffer = buffer;
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 1200;

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    noise.start(now);

    const oscillator = drumContext.createOscillator();
    const oscGain = drumGain(0.4, 0.12);

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(190, now);
    oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.1);

    oscillator.connect(oscGain);
    oscillator.start(now);
    oscillator.stop(now + 0.13);
  }

  function playHiHat() {
    const now = drumContext.currentTime;

    const bufferSize = drumContext.sampleRate * 0.12;
    const buffer = drumContext.createBuffer(
      1,
      bufferSize,
      drumContext.sampleRate
    );

    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = drumContext.createBufferSource();
    const filter = drumContext.createBiquadFilter();
    const gain = drumGain(0.28, 0.12);

    noise.buffer = buffer;

    filter.type = "highpass";
    filter.frequency.value = 7500;

    noise.connect(filter);
    filter.connect(gain);

    noise.start(now);
  }

  function playTom() {
    const now = drumContext.currentTime;

    const oscillator = drumContext.createOscillator();
    const gain = drumGain(0.7, 0.35);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(180, now);
    oscillator.frequency.exponentialRampToValueAtTime(65, now + 0.3);

    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(now + 0.35);
  }

  function playRide() {
    playCymbal(4500, 0.35, 0.24);
  }

  function playCrash() {
    playCymbal(1800, 1.4, 0.65);
  }

  function playCymbal(frequency, duration, volume) {
    const now = drumContext.currentTime;

    const bufferSize = Math.floor(
      drumContext.sampleRate * duration
    );

    const buffer = drumContext.createBuffer(
      1,
      bufferSize,
      drumContext.sampleRate
    );

    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = drumContext.createBufferSource();
    const filter = drumContext.createBiquadFilter();
    const gain = drumContext.createGain();

    noise.buffer = buffer;

    filter.type = "highpass";
    filter.frequency.value = frequency;

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + duration
    );

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(drumMaster);

    noise.start(now);
    noise.stop(now + duration);
  }

  function playClap() {
    playSnare();
  }

  function playCowbell() {
    const now = drumContext.currentTime;

    [540, 800].forEach((frequency, index) => {
      const oscillator = drumContext.createOscillator();
      const gain = drumGain(0.35, 0.18);

      oscillator.type = "square";
      oscillator.frequency.value = frequency;

      oscillator.connect(gain);
      oscillator.start(now);
      oscillator.stop(now + 0.18 + index * 0.01);
    });
  }

  function playRimshot() {
    const now = drumContext.currentTime;

    const oscillator = drumContext.createOscillator();
    const gain = drumGain(0.5, 0.07);

    oscillator.type = "triangle";
    oscillator.frequency.value = 1600;

    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(now + 0.08);
  }

  const drumSounds = {
    kick: playKick,
    snare: playSnare,
    hihat: playHiHat,
    tom: playTom,
    ride: playRide,
    crash: playCrash,
    clap: playClap,
    cowbell: playCowbell,
    rimshot: playRimshot
  };

  async function triggerDrum(name, pad) {
    if (!drumSounds[name]) return;

    const context = await resumeDrumAudio();

    if (!context) return;

    drumSounds[name]();

    if (pad) {
      pad.classList.add("playing");

      window.setTimeout(() => {
        pad.classList.remove("playing");
      }, 120);
    }
  }

  const drumPads = $$(".drum-pad");

  drumPads.forEach(pad => {
    const name =
      pad.dataset.sound ||
      pad.dataset.drum ||
      pad.dataset.key;

    if (!name || !drumSounds[name]) return;

    pad.addEventListener("pointerdown", event => {
      event.preventDefault();
      triggerDrum(name, pad);
    });
  });

  const keyboardMap = {
    q: "kick",
    w: "snare",
    e: "hihat",
    a: "tom",
    s: "ride",
    d: "crash",
    z: "clap",
    x: "cowbell",
    c: "rimshot"
  };

  document.addEventListener("keydown", event => {
    if (
      event.repeat ||
      event.target.closest("input, textarea, select, button")
    ) {
      return;
    }

    const key = event.key.toLowerCase();
    const sound = keyboardMap[key];

    if (!sound) return;

    const pad = drumPads.find(item => {
      const padName =
        item.dataset.sound ||
        item.dataset.drum ||
        item.dataset.key;

      return padName === sound;
    });

    triggerDrum(sound, pad);
  });

  // ==========================================
  // 10. WORSHIP PAD AUDIO ENGINE
  // ==========================================

  let worshipContext = null;
  let worshipMaster = null;
  let activeWorshipNodes = [];

  let selectedMode = "major";
  let selectedTone = "warm";

  const noteFrequencies = {
    C: 261.63,
    "C#": 277.18,
    D: 293.66,
    "D#": 311.13,
    E: 329.63,
    F: 349.23,
    "F#": 369.99,
    G: 392.00,
    "G#": 415.30,
    A: 440.00,
    "A#": 466.16,
    B: 493.88
  };

  const chordIntervals = {
    major: [0, 4, 7],
    minor: [0, 3, 7]
  };

  const toneSettings = {
    warm: {
      type: "triangle",
      volume: 0.17,
      attack: 0.4,
      release: 1.2,
      detune: 0
    },
    bright: {
      type: "sawtooth",
      volume: 0.10,
      attack: 0.12,
      release: 0.8,
      detune: 3
    },
    strings: {
      type: "sawtooth",
      volume: 0.11,
      attack: 0.8,
      release: 1.6,
      detune: 7
    },
    airy: {
      type: "sine",
      volume: 0.18,
      attack: 1.0,
      release: 2.0,
      detune: 0
    }
  };

  function initWorshipAudio() {
    if (worshipContext) return worshipContext;

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return null;

    worshipContext = new AudioContextClass();

    worshipMaster = worshipContext.createGain();
    worshipMaster.gain.value = 0.7;

    const compressor = worshipContext.createDynamicsCompressor();

    compressor.threshold.value = -20;
    compressor.knee.value = 18;
    compressor.ratio.value = 6;

    worshipMaster.connect(compressor);
    compressor.connect(worshipContext.destination);

    return worshipContext;
  }

  async function resumeWorshipAudio() {
    const context = initWorshipAudio();

    if (context && context.state === "suspended") {
      try {
        await context.resume();
      } catch (error) {
        console.warn("Could not start worship audio:", error);
      }
    }

    return context;
  }

  function stopWorshipPad() {
    if (!worshipContext) return;

    const now = worshipContext.currentTime;

    activeWorshipNodes.forEach(node => {
      try {
        node.gain.gain.cancelScheduledValues(now);
        node.gain.gain.setTargetAtTime(
          0.0001,
          now,
          0.12
        );

        node.oscillator.stop(now + 0.6);
      } catch (error) {
        // Already stopped.
      }
    });

    activeWorshipNodes = [];

    $$(".worship-pad").forEach(pad => {
      pad.classList.remove("active");
    });
  }

  async function playWorshipNote(note, pad) {
    const context = await resumeWorshipAudio();

    if (!context || !noteFrequencies[note]) return;

    if (pad && pad.classList.contains("active")) {
      stopWorshipPad();
      return;
    }

    stopWorshipPad();

    const baseFrequency = noteFrequencies[note];
    const intervals = chordIntervals[selectedMode];
    const settings = toneSettings[selectedTone];

    const now = context.currentTime;

    intervals.forEach(interval => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = settings.type;
      oscillator.frequency.value =
        baseFrequency * Math.pow(2, interval / 12);

      oscillator.detune.value = settings.detune;

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(
        settings.volume,
        now + settings.attack
      );

      oscillator.connect(gain);
      gain.connect(worshipMaster);

      oscillator.start(now);

      activeWorshipNodes.push({
        oscillator,
        gain
      });
    });

    if (pad) {
      pad.classList.add("active");
    }
  }

  $$(".worship-pad").forEach(pad => {
    const note =
      pad.dataset.note ||
      pad.dataset.key;

    if (!note) return;

    pad.addEventListener("click", () => {
      playWorshipNote(note, pad);
    });
  });

  // ==========================================
  // 11. WORSHIP MODE SELECTION
  // ==========================================

  const modeButtons = $$("[data-mode]");

  modeButtons.forEach(button => {
    button.addEventListener("click", () => {
      const mode = button.dataset.mode;

      if (!chordIntervals[mode]) return;

      selectedMode = mode;

      modeButtons.forEach(item => {
        item.classList.toggle(
          "active",
          item === button
        );
      });

      stopWorshipPad();
    });
  });

  // ==========================================
  // 12. WORSHIP TONE SELECTION
  // ==========================================

  const toneButtons = $$("[data-tone]");

  toneButtons.forEach(button => {
    button.addEventListener("click", () => {
      const tone = button.dataset.tone;

      if (!toneSettings[tone]) return;

      selectedTone = tone;

      toneButtons.forEach(item => {
        item.classList.toggle(
          "active",
          item === button
        );
      });

      stopWorshipPad();
    });
  });

  // ==========================================
  // 13. WORSHIP PAD KEYBOARD CONTROLS
  // ==========================================

  document.addEventListener("keydown", event => {
    if (
      event.repeat ||
      event.target.closest("input, textarea, select, button")
    ) {
      return;
    }

    const key = event.key.toUpperCase();

    if (!noteFrequencies[key]) return;

    const pad = $$(".worship-pad").find(item => {
      return (
        item.dataset.note === key ||
        item.dataset.key === key
      );
    });

    if (pad) {
      playWorshipNote(key, pad);
    }
  });

  // ==========================================
  // 14. CLEAN UP AUDIO WHEN LEAVING
  // ==========================================

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopWorshipPad();
    }
  });

  // ==========================================
  // 15. FOOTER YEAR
  // ==========================================

  const yearElement = $("#year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

});
