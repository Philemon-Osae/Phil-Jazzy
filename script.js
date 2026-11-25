
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // ==========================================
  // 1. HELPERS
  // ==========================================

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ==========================================
  // 2. MOBILE NAVIGATION
  // ==========================================

  const menuToggle = $("#menuToggle");
  const navLinks = $("#navLinks");

  if (menuToggle && navLinks) {
    const closeMenu = () => {
      navLinks.classList.remove("open");
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");
      document.body.classList.remove("menu-open");
    };

    const openMenu = () => {
      navLinks.classList.add("open");
      menuToggle.classList.add("active");
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "Close navigation menu");
      document.body.classList.add("menu-open");
    };

    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.contains("open");

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    $$("a", navLinks).forEach(link => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 850) {
        closeMenu();
      }
    });
  }

  // ==========================================
  // 3. SCROLL PROGRESS
  // ==========================================

  const progress = $("#progress");

  function updateProgress() {
    if (!progress) return;

    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    const percentage = scrollHeight > 0
      ? (window.scrollY / scrollHeight) * 100
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
      toTop.classList.toggle("show", window.scrollY > 400);
    }, { passive: true });

    toTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reducedMotion ? "instant" : "smooth"
      });
    });
  }

  // ==========================================
  // 5. SCROLL REVEAL
  // ==========================================

  const cards = $$(".card");

  if ("IntersectionObserver" in window && !reducedMotion) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    cards.forEach(card => observer.observe(card));
  } else {
    cards.forEach(card => card.classList.add("visible"));
  }

  // ==========================================
  // 6. ACTIVE NAVIGATION
  // ==========================================

  const navAnchors = $$(".nav-links a[href^='#']");
  const sections = navAnchors
    .map(link => $(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          navAnchors.forEach(link => {
            const isActive =
              link.getAttribute("href") === `#${entry.target.id}`;

            link.classList.toggle("active", isActive);

            if (isActive) {
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

    sections.forEach(section => sectionObserver.observe(section));
  }

  // ==========================================
  // 7. ROTATING HERO TAGLINE
  // ==========================================

  const rotatingTag = $("#rotatingTag");

  if (rotatingTag) {
    const phrases = [
      "Pocket & Feel",
      "Serve The Song",
      "Code by Day, Drum by Night",
      "Accra's Steady Groove"
    ];

    if (reducedMotion) {
      rotatingTag.textContent = phrases[0];
    } else {
      let phraseIndex = 0;
      let charIndex = 0;
      let deleting = false;

      function typeTagline() {
        const phrase = phrases[phraseIndex];

        charIndex += deleting ? -1 : 1;

        rotatingTag.textContent = phrase.substring(0, charIndex);

        let delay = deleting ? 45 : 90;

        if (!deleting && charIndex === phrase.length) {
          deleting = true;
          delay = 1700;
        } else if (deleting && charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          delay = 350;
        }

        window.setTimeout(typeTagline, delay);
      }

      typeTagline();
    }
  }

  // ==========================================
  // 8. FLOATING MUSIC NOTES
  // ==========================================

  const notesContainer = $("#notes");

  if (notesContainer && !reducedMotion) {
    const symbols = ["♪", "♫", "♬", "♩"];

    for (let i = 0; i < 14; i++) {
      const note = document.createElement("span");

      note.className = "note";
      note.textContent =
        symbols[Math.floor(Math.random() * symbols.length)];

      note.style.left = `${Math.random() * 100}%`;
      note.style.animationDelay = `${Math.random() * 12}s`;
      note.style.animationDuration =
        `${10 + Math.random() * 12}s`;

      notesContainer.appendChild(note);
    }
  }

  // ==========================================
  // 9. DRUM KIT AUDIO ENGINE
  // ==========================================

  let drumContext = null;
  let drumMaster = null;

  function initDrumAudio() {
    if (drumContext) return drumContext;

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      console.warn("This browser does not support Web Audio.");
      return null;
    }

    drumContext = new AudioContextClass();

    const compressor = drumContext.createDynamicsCompressor();
    drumMaster = drumContext.createGain();

    drumMaster.gain.value = 0.8;

    compressor.threshold.value = -18;
    compressor.knee.value = 20;
    compressor.ratio.value = 8;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.2;

    drumMaster.connect(compressor);
    compressor.connect(drumContext.destination);

    return drumContext;
  }

  async function resumeDrumAudio() {
    const context = initDrumAudio();

    if (!context) return null;

    if (context.state === "suspended") {
      try {
        await context.resume();
      } catch (error) {
        console.warn("Drum audio could not start:", error);
      }
    }

    return context;
  }

  function makeDrumGain(volume, duration) {
    const gain = drumContext.createGain();
    const now = drumContext.currentTime;

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + duration
    );

    gain.connect(drumMaster);

    return gain;
  }

  function playKick() {
    const now = drumContext.currentTime;
    const oscillator = drumContext.createOscillator();
    const gain = makeDrumGain(1.1, 0.5);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(150, now);
    oscillator.frequency.exponentialRampToValueAtTime(38, now + 0.45);

    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(now + 0.5);
  }

  function playSnare() {
    const now = drumContext.currentTime;
    const size = Math.floor(drumContext.sampleRate * 0.22);

    const buffer = drumContext.createBuffer(
      1,
      size,
      drumContext.sampleRate
    );

    const data = buffer.getChannelData(0);

    for (let i = 0; i < size; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = drumContext.createBufferSource();
    const filter = drumContext.createBiquadFilter();
    const noiseGain = makeDrumGain(0.65, 0.2);

    noise.buffer = buffer;
    filter.type = "highpass";
    filter.frequency.value = 1200;

    noise.connect(filter);
    filter.connect(noiseGain);
    noise.start(now);

    const oscillator = drumContext.createOscillator();
    const oscGain = makeDrumGain(0.4, 0.12);

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(190, now);
    oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.1);

    oscillator.connect(oscGain);
    oscillator.start(now);
    oscillator.stop(now + 0.13);
  }

  function playHiHat() {
    const now = drumContext.currentTime;
    const size = Math.floor(drumContext.sampleRate * 0.12);

    const buffer = drumContext.createBuffer(
      1,
      size,
      drumContext.sampleRate
    );

    const data = buffer.getChannelData(0);

    for (let i = 0; i < size; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = drumContext.createBufferSource();
    const filter = drumContext.createBiquadFilter();
    const gain = makeDrumGain(0.28, 0.12);

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
    const gain = makeDrumGain(0.7, 0.35);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(180, now);
    oscillator.frequency.exponentialRampToValueAtTime(65, now + 0.3);

    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(now + 0.35);
  }

  function playCymbal(frequency, duration, volume) {
    const now = drumContext.currentTime;
    const size = Math.floor(drumContext.sampleRate * duration);

    const buffer = drumContext.createBuffer(
      1,
      size,
      drumContext.sampleRate
    );

    const data = buffer.getChannelData(0);

    for (let i = 0; i < size; i++) {
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

  function playRide() {
    playCymbal(4500, 0.35, 0.24);
  }

  function playCrash() {
    playCymbal(1800, 1.4, 0.65);
  }

  function playCowbell() {
    const now = drumContext.currentTime;

    [540, 800].forEach(frequency => {
      const oscillator = drumContext.createOscillator();
      const gain = makeDrumGain(0.35, 0.18);

      oscillator.type = "square";
      oscillator.frequency.value = frequency;

      oscillator.connect(gain);
      oscillator.start(now);
      oscillator.stop(now + 0.18);
    });
  }

  function playRimshot() {
    const now = drumContext.currentTime;
    const oscillator = drumContext.createOscillator();
    const gain = makeDrumGain(0.5, 0.08);

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
    clap: playSnare,
    cowbell: playCowbell,
    rimshot: playRimshot
  };

  async function triggerDrum(sound, pad) {
    if (!drumSounds[sound]) return;

    const context = await resumeDrumAudio();
    if (!context) return;

    drumSounds[sound]();

    if (pad) {
      pad.classList.add("playing");

      window.setTimeout(() => {
        pad.classList.remove("playing");
      }, 130);
    }
  }

  const drumPads = $$(".pad");

  drumPads.forEach(pad => {
    const sound = pad.dataset.sound;

    if (!sound || !drumSounds[sound]) {
      console.warn("Unknown drum sound:", sound);
      return;
    }

    pad.addEventListener("pointerdown", event => {
      event.preventDefault();
      triggerDrum(sound, pad);
    });
  });

  const drumKeys = {
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
      event.target.closest("input, textarea, select")
    ) return;

    const sound = drumKeys[event.key.toLowerCase()];
    if (!sound) return;

    const pad = drumPads.find(
      item => item.dataset.sound === sound
    );

    triggerDrum(sound, pad);
  });

  // ==========================================
  // 10. WORSHIP PAD AUDIO ENGINE
  // ==========================================

  let worshipContext = null;
  let worshipMaster = null;
  let activeWorshipNodes = [];
  let activeWorshipPad = null;

  let selectedMode = "major";
  let selectedTone = "warm";

  const chordIntervals = {
    major: [0, 4, 7],
    minor: [0, 3, 7]
  };

  const toneSettings = {
    warm: {
      type: "triangle",
      volume: 0.17,
      attack: 0.4,
      detune: 0
    },
    bright: {
      type: "sawtooth",
      volume: 0.10,
      attack: 0.12,
      detune: 3
    },
    strings: {
      type: "sawtooth",
      volume: 0.11,
      attack: 0.8,
      detune: 7
    },
    airy: {
      type: "sine",
      volume: 0.18,
      attack: 1.0,
      detune: 0
    }
  };

  function initWorshipAudio() {
    if (worshipContext) return worshipContext;

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      console.warn("Worship pad audio is not supported.");
      return null;
    }

    worshipContext = new AudioContextClass();

    const compressor = worshipContext.createDynamicsCompressor();

    worshipMaster = worshipContext.createGain();
    worshipMaster.gain.value = 0.7;

    compressor.threshold.value = -20;
    compressor.knee.value = 18;
    compressor.ratio.value = 6;

    worshipMaster.connect(compressor);
    compressor.connect(worshipContext.destination);

    return worshipContext;
  }

  async function resumeWorshipAudio() {
    const context = initWorshipAudio();

    if (!context) return null;

    if (context.state === "suspended") {
      try {
        await context.resume();
      } catch (error) {
        console.warn("Worship audio could not start:", error);
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
        node.gain.gain.setTargetAtTime(0.0001, now, 0.12);
        node.oscillator.stop(now + 0.6);
      } catch (error) {
        // Oscillator may already have stopped.
      }
    });

    activeWorshipNodes = [];

    if (activeWorshipPad) {
      activeWorshipPad.classList.remove("active");
      activeWorshipPad = null;
    }
  }

  async function playWorshipNote(pad) {
    if (!pad) return;

    const frequency = Number(pad.dataset.freq);

    if (!Number.isFinite(frequency) || frequency <= 0) {
      console.warn("Invalid worship pad frequency:", pad.dataset.freq);
      return;
    }

    if (activeWorshipPad === pad) {
      stopWorshipPad();
      return;
    }

    const context = await resumeWorshipAudio();
    if (!context) return;

    stopWorshipPad();

    const settings = toneSettings[selectedTone];
    const intervals = chordIntervals[selectedMode];
    const now = context.currentTime;

    intervals.forEach(interval => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = settings.type;
      oscillator.frequency.value =
        frequency * Math.pow(2, interval / 12);

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

    activeWorshipPad = pad;
    pad.classList.add("active");
  }

  const worshipPads = $$(".wpad");

  worshipPads.forEach(pad => {
    pad.addEventListener("click", () => {
      playWorshipNote(pad);
    });
  });

  // ==========================================
  // 11. MAJOR / MINOR BUTTONS
  // ==========================================

  const majorBtn = $("#majorBtn");
  const minorBtn = $("#minorBtn");

  function updateMode(mode) {
    selectedMode = mode;

    if (majorBtn) {
      const active = mode === "major";
      majorBtn.classList.toggle("active", active);
      majorBtn.setAttribute("aria-pressed", String(active));
    }

    if (minorBtn) {
      const active = mode === "minor";
      minorBtn.classList.toggle("active", active);
      minorBtn.setAttribute("aria-pressed", String(active));
    }

    stopWorshipPad();
  }

  if (majorBtn) {
    majorBtn.addEventListener("click", () => {
      updateMode("major");
    });
  }

  if (minorBtn) {
    minorBtn.addEventListener("click", () => {
      updateMode("minor");
    });
  }

  // ==========================================
  // 12. WORSHIP SOUND PRESETS
  // ==========================================

  const toneButtons = $$("[data-tone]");

  toneButtons.forEach(button => {
    button.addEventListener("click", () => {
      const tone = button.dataset.tone;

      if (!toneSettings[tone]) return;

      selectedTone = tone;

      toneButtons.forEach(item => {
        item.classList.toggle("active", item === button);
      });

      stopWorshipPad();
    });
  });

  // ==========================================
  // 13. STOP WORSHIP SOUND WHEN TAB IS HIDDEN
  // ==========================================

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopWorshipPad();
    }
  });

  // ==========================================
  // 14. BOOKING ASSISTANT
  // ==========================================

  const assistantButton = $("#pj-ai-btn");
  const assistantBox = $("#pj-ai-box");
  const assistantClose = $("#pj-ai-close");
  const assistantMessages = $("#pj-ai-messages");
  const assistantInput = $("#pj-ai-text");
  const assistantSend = $("#pj-ai-send");

  let assistantStarted = false;
  let bookingStep = 0;

  const bookingDetails = {
    event: "",
    date: "",
    location: ""
  };

  function addAssistantMessage(message, sender = "bot") {
    if (!assistantMessages) return;

    const bubble = document.createElement("div");

    bubble.className = sender === "user"
      ? "pj-user-message"
      : "pj-bot-message";

    // Use textContent to prevent HTML injection.
    bubble.textContent = message;

    assistantMessages.appendChild(bubble);
    assistantMessages.scrollTop = assistantMessages.scrollHeight;
  }

  function openAssistant() {
    if (!assistantBox || !assistantButton) return;

    assistantBox.classList.add("open");
    assistantBox.setAttribute("aria-hidden", "false");
    assistantButton.setAttribute("aria-expanded", "true");

    if (!assistantStarted) {
      assistantStarted = true;

      addAssistantMessage(
        "Hello! Welcome to Phil Jazzy's booking assistant. 🥁"
      );

      addAssistantMessage(
        "I can help you make a booking enquiry for church programs, weddings, studio recordings and live performances."
      );

      addAssistantMessage(
        "What type of event or musical service are you interested in?"
      );
    }

    window.setTimeout(() => {
      assistantInput?.focus();
    }, 150);
  }

  function closeAssistant() {
    if (!assistantBox || !assistantButton) return;

    assistantBox.classList.remove("open");
    assistantBox.setAttribute("aria-hidden", "true");
    assistantButton.setAttribute("aria-expanded", "false");
  }

  if (assistantButton) {
    assistantButton.addEventListener("click", () => {
      const isOpen = assistantBox?.classList.contains("open");

      if (isOpen) {
        closeAssistant();
      } else {
        openAssistant();
      }
    });
  }

  if (assistantClose) {
    assistantClose.addEventListener("click", closeAssistant);
  }

  function resetBooking() {
    bookingStep = 0;

    bookingDetails.event = "";
    bookingDetails.date = "";
    bookingDetails.location = "";

    addAssistantMessage(
      "Let's start again. What type of event would you like to book Phil Jazzy for?"
    );
  }

  function createBookingLink() {
    const message = [
      "Hi Phil Jazzy! I would like to make a booking enquiry.",
      "",
      `Event: ${bookingDetails.event}`,
      `Date: ${bookingDetails.date}`,
      `Location: ${bookingDetails.location}`,
      "",
      "Please let me know your availability and quotation."
    ].join("\n");

    const link = document.createElement("a");

    link.href =
      "https://wa.me/233206834470?text=" +
      encodeURIComponent(message);

    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Continue on WhatsApp ↗";
    link.className = "assistant-whatsapp-link";

    assistantMessages.appendChild(link);
    assistantMessages.scrollTop = assistantMessages.scrollHeight;
  }

  function processAssistantMessage(rawMessage) {
    const message = rawMessage.trim();

    if (!message) return;

    addAssistantMessage(message, "user");

    const lower = message.toLowerCase();

    if (
      ["restart", "start over", "start again"].includes(lower)
    ) {
      resetBooking();
      return;
    }

    if (bookingStep === 0) {
      if (
        lower.includes("price") ||
        lower.includes("cost") ||
        lower.includes("how much") ||
        lower.includes("rate")
      ) {
        addAssistantMessage(
          "Booking rates depend on the type of event, location and requirements. Please share your event details so Phil can provide a quotation."
        );

        addAssistantMessage(
          "What type of event are you planning?"
        );

        return;
      }

      if (
        lower.includes("available") ||
        lower.includes("availability") ||
        lower.includes("free")
      ) {
        addAssistantMessage(
          "I can collect your booking details, but I cannot check a live calendar. Phil will personally confirm availability."
        );

        addAssistantMessage(
          "What type of event would you like to book?"
        );

        return;
      }

      bookingDetails.event = message;
      bookingStep = 1;

      addAssistantMessage(
        "Great! What date are you planning for the event?"
      );

      return;
    }

    if (bookingStep === 1) {
      bookingDetails.date = message;
      bookingStep = 2;

      addAssistantMessage(
        "Thank you! Where will the event take place? Please provide the venue or town."
      );

      return;
    }

    if (bookingStep === 2) {
      bookingDetails.location = message;
      bookingStep = 3;

      addAssistantMessage(
        "Excellent! Here is a summary of your enquiry:"
      );

      addAssistantMessage(
        `Event: ${bookingDetails.event}\nDate: ${bookingDetails.date}\nLocation: ${bookingDetails.location}`
      );

      addAssistantMessage(
        "You can now send these details directly to Phil Jazzy on WhatsApp. He will confirm availability and provide a quotation."
      );

      createBookingLink();

      addAssistantMessage(
        "To make another enquiry, type RESTART."
      );

      return;
    }

    if (bookingStep === 3) {
      addAssistantMessage(
        "Your enquiry is ready. Use the WhatsApp link above to contact Phil. Type RESTART if you want to make another booking enquiry."
      );
    }
  }

  function sendAssistantMessage() {
    if (!assistantInput) return;

    const message = assistantInput.value.trim();

    if (!message) return;

    assistantInput.value = "";
    processAssistantMessage(message);
  }

  if (assistantSend) {
    assistantSend.addEventListener("click", sendAssistantMessage);
  }

  if (assistantInput) {
    assistantInput.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        sendAssistantMessage();
      }
    });
  }

  document.addEventListener("keydown", event => {
    if (
      event.key === "Escape" &&
      assistantBox?.classList.contains("open")
    ) {
      closeAssistant();
    }
  });

  // ==========================================
  // 15. FOOTER YEAR
  // ==========================================

  const year = $("#year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // ==========================================
  // 16. INITIAL STATUS
  // ==========================================

  console.log("Phil Jazzy website initialized successfully.");
  console.log("Navigation, instruments and booking assistant loaded.");

});
