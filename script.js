
"use strict";

document.addEventListener("DOMContentLoaded", () => {

  /* =========================================
     HELPERS
  ========================================= */

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* =========================================
     1. MOBILE NAVIGATION
  ========================================= */

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

    menuToggle.addEventListener("click", () => {
      const isOpen = !navLinks.classList.contains("open");

      navLinks.classList.toggle("open", isOpen);
      menuToggle.classList.toggle("active", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );

      document.body.classList.toggle("menu-open", isOpen);
    });

    $$("a", navLinks).forEach(link => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    document.addEventListener("click", event => {
      if (
        navLinks.classList.contains("open") &&
        !navLinks.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) {
        closeMenu();
      }
    });
  }


  /* =========================================
     2. HERO TAGLINE ROTATION
  ========================================= */

  const rotatingTag = $("#rotatingTag");

  if (rotatingTag) {

    const phrases = [
      "Pocket & Feel",
      "Serve The Song",
      "Code by Day, Drum by Night",
      "Accra's Steady Groove"
    ];

    let phraseIndex = 0;
    let characterIndex = phrases[0].length;
    let deleting = false;

    if (!prefersReducedMotion) {

      const typeTagline = () => {

        const currentPhrase = phrases[phraseIndex];

        if (!deleting) {
          characterIndex++;

          rotatingTag.textContent = currentPhrase.substring(
            0,
            characterIndex
          );

          if (characterIndex >= currentPhrase.length) {
            deleting = true;
            setTimeout(typeTagline, 1800);
            return;
          }

        } else {
          characterIndex--;

          rotatingTag.textContent = currentPhrase.substring(
            0,
            characterIndex
          );

          if (characterIndex <= 0) {
            deleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
          }
        }

        setTimeout(typeTagline, deleting ? 45 : 85);
      };

      setTimeout(typeTagline, 1800);
    }
  }


  /* =========================================
     3. FLOATING MUSIC NOTES
  ========================================= */

  const notesContainer = $("#notes");

  if (notesContainer && !prefersReducedMotion) {

    const notes = ["♪", "♫", "♬", "♩"];

    for (let i = 0; i < 14; i++) {

      const note = document.createElement("span");

      note.className = "note";
      note.textContent = notes[
        Math.floor(Math.random() * notes.length)
      ];

      note.style.left = `${Math.random() * 100}%`;
      note.style.animationDuration = `${9 + Math.random() * 12}s`;
      note.style.animationDelay = `${Math.random() * 10}s`;
      note.style.fontSize = `${16 + Math.random() * 18}px`;

      notesContainer.appendChild(note);
    }
  }


  /* =========================================
     4. SCROLL PROGRESS + BACK TO TOP
  ========================================= */

  const progress = $("#progress");
  const toTop = $("#toTop");

  const updateScrollUI = () => {

    const scrollTop =
      window.scrollY || document.documentElement.scrollTop;

    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    const percentage = scrollHeight > 0
      ? (scrollTop / scrollHeight) * 100
      : 0;

    if (progress) {
      progress.style.width = `${percentage}%`;
    }

    if (toTop) {
      toTop.classList.toggle("show", scrollTop > 450);
    }
  };

  window.addEventListener("scroll", updateScrollUI, {
    passive: true
  });

  updateScrollUI();

  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    });
  }


  /* =========================================
     5. CARD REVEAL ANIMATION
  ========================================= */

  const cards = $$(".card");

  if ("IntersectionObserver" in window && !prefersReducedMotion) {

    const cardObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            cardObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12
      }
    );

    cards.forEach(card => cardObserver.observe(card));

  } else {
    cards.forEach(card => card.classList.add("visible"));
  }


  /* =========================================
     6. ACTIVE NAVIGATION
  ========================================= */

  const sections = $$("main section[id]");
  const navigationLinks = $$("#navLinks a[href^='#']");

  if ("IntersectionObserver" in window && sections.length) {

    const sectionObserver = new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) return;

          const currentId = entry.target.id;

          navigationLinks.forEach(link => {

            const isActive =
              link.getAttribute("href") === `#${currentId}`;

            link.classList.toggle("active", isActive);
          });
        });

      },
      {
        rootMargin: "-30% 0px -60% 0px",
        threshold: 0
      }
    );

    sections.forEach(section => {
      sectionObserver.observe(section);
    });
  }


  /* =========================================
     7. AUDIO ENGINE
  ========================================= */

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  let audioContext = null;
  let masterGain = null;
  let audioReady = false;

  function initializeAudio() {

    if (!AudioContextClass) {
      alert("Your browser does not support the audio features.");
      return false;
    }

    if (!audioContext) {

      audioContext = new AudioContextClass();

      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.7;

      const compressor = audioContext.createDynamicsCompressor();

      compressor.threshold.value = -18;
      compressor.knee.value = 20;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;

      masterGain.connect(compressor);
      compressor.connect(audioContext.destination);
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    audioReady = true;
    return true;
  }

  function getAudio() {
    if (!initializeAudio()) return null;
    return audioContext;
  }

  function getOutput() {
    if (!initializeAudio()) return null;
    return masterGain;
  }


  /* =========================================
     8. DRUM SOUND GENERATORS
  ========================================= */

  function createNoise(duration = 0.2) {

    const context = getAudio();
    if (!context) return null;

    const bufferSize = Math.floor(
      context.sampleRate * duration
    );

    const buffer = context.createBuffer(
      1,
      bufferSize,
      context.sampleRate
    );

    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = context.createBufferSource();
    source.buffer = buffer;

    return source;
  }

  function playKick() {

    const context = getAudio();
    const output = getOutput();
    if (!context || !output) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(150, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      42,
      context.currentTime + 0.22
    );

    gain.gain.setValueAtTime(0.95, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 0.28
    );

    oscillator.connect(gain);
    gain.connect(output);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.3);
  }

  function playSnare() {

    const context = getAudio();
    const output = getOutput();
    if (!context || !output) return;

    const noise = createNoise(0.22);
    if (!noise) return;

    const filter = context.createBiquadFilter();
    const noiseGain = context.createGain();

    filter.type = "highpass";
    filter.frequency.value = 1200;

    noiseGain.gain.setValueAtTime(0.75, context.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 0.2
    );

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(output);

    const oscillator = context.createOscillator();
    const toneGain = context.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.value = 180;

    toneGain.gain.setValueAtTime(0.35, context.currentTime);
    toneGain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 0.12
    );

    oscillator.connect(toneGain);
    toneGain.connect(output);

    noise.start();
    noise.stop(context.currentTime + 0.22);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.13);
  }

  function playHiHat() {

    const context = getAudio();
    const output = getOutput();
    if (!context || !output) return;

    const noise = createNoise(0.12);
    if (!noise) return;

    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    filter.type = "highpass";
    filter.frequency.value = 7500;

    gain.gain.setValueAtTime(0.3, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 0.09
    );

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(output);

    noise.start();
    noise.stop(context.currentTime + 0.12);
  }

  function playTom() {

    const context = getAudio();
    const output = getOutput();
    if (!context || !output) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(180, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      75,
      context.currentTime + 0.3
    );

    gain.gain.setValueAtTime(0.65, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 0.35
    );

    oscillator.connect(gain);
    gain.connect(output);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.36);
  }

  function playRide() {

    const context = getAudio();
    const output = getOutput();
    if (!context || !output) return;

    const noise = createNoise(0.7);
    if (!noise) return;

    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    filter.type = "highpass";
    filter.frequency.value = 4500;

    gain.gain.setValueAtTime(0.28, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 0.65
    );

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(output);

    noise.start();
    noise.stop(context.currentTime + 0.7);
  }

  function playCrash() {

    const context = getAudio();
    const output = getOutput();
    if (!context || !output) return;

    const noise = createNoise(1.5);
    if (!noise) return;

    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    filter.type = "highpass";
    filter.frequency.value = 3000;

    gain.gain.setValueAtTime(0.42, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 1.4
    );

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(output);

    noise.start();
    noise.stop(context.currentTime + 1.5);
  }

  function playClap() {

    const context = getAudio();
    const output = getOutput();
    if (!context || !output) return;

    const noise = createNoise(0.2);
    if (!noise) return;

    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    filter.type = "bandpass";
    filter.frequency.value = 1800;

    gain.gain.setValueAtTime(0.6, context.currentTime);

    [0.015, 0.045, 0.075].forEach((delay, index) => {

      gain.gain.setValueAtTime(
        0.6 - index * 0.12,
        context.currentTime + delay
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + delay + 0.04
      );
    });

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(output);

    noise.start();
    noise.stop(context.currentTime + 0.2);
  }

  function playCowbell() {

    const context = getAudio();
    const output = getOutput();
    if (!context || !output) return;

    [540, 800].forEach((frequency, index) => {

      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "square";
      oscillator.frequency.value = frequency;

      gain.gain.setValueAtTime(
        0.18,
        context.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + 0.25
      );

      oscillator.connect(gain);
      gain.connect(output);

      oscillator.start(context.currentTime + index * 0.002);
      oscillator.stop(context.currentTime + 0.26);
    });
  }

  function playRimshot() {

    const context = getAudio();
    const output = getOutput();
    if (!context || !output) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(
      900,
      context.currentTime
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      250,
      context.currentTime + 0.07
    );

    gain.gain.setValueAtTime(0.45, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 0.09
    );

    oscillator.connect(gain);
    gain.connect(output);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.1);
  }


  /* =========================================
     9. DRUM PAD CONTROLS
  ========================================= */

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

  const drumPads = $$(".pad");

  function triggerDrum(pad) {

    if (!pad) return;

    const soundName = pad.dataset.sound;
    const sound = drumSounds[soundName];

    if (!sound) return;

    sound();

    pad.classList.remove("hit");

    // Restart the visual feedback animation.
    void pad.offsetWidth;

    pad.classList.add("hit");

    setTimeout(() => {
      pad.classList.remove("hit");
    }, 130);
  }

  drumPads.forEach(pad => {

    pad.addEventListener("pointerdown", event => {
      event.preventDefault();
      triggerDrum(pad);
    });
  });

  document.addEventListener("keydown", event => {

    if (event.repeat) return;

    const target = event.target;

    if (
      target &&
      (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
    ) {
      return;
    }

    const key = event.key.toLowerCase();

    const pad = drumPads.find(item =>
      item.dataset.key === key
    );

    if (pad) {
      event.preventDefault();
      triggerDrum(pad);
    }
  });


  /* =========================================
     10. WORSHIP PAD ENGINE
  ========================================= */

  let chordMode = "major";
  let currentTone = "warm";
  let activeWorshipPad = null;
  let activeVoices = [];

  const majorBtn = $("#majorBtn");
  const minorBtn = $("#minorBtn");
  const toneButtons = $$(".tone-btn");
  const worshipPads = $$(".wpad");

  const toneSettings = {

    warm: {
      wave: "sine",
      volume: 0.12,
      filter: 1100,
      detune: 2,
      attack: 0.7,
      release: 0.9
    },

    bright: {
      wave: "triangle",
      volume: 0.085,
      filter: 2600,
      detune: 1,
      attack: 0.3,
      release: 0.7
    },

    strings: {
      wave: "sawtooth",
      volume: 0.045,
      filter: 1800,
      detune: 5,
      attack: 0.9,
      release: 1.1
    },

    airy: {
      wave: "sine",
      volume: 0.1,
      filter: 3200,
      detune: 7,
      attack: 1.1,
      release: 1.2
    }
  };

  function stopWorshipPad() {

    if (!audioContext) return;

    const now = audioContext.currentTime;

    activeVoices.forEach(voice => {

      try {

        voice.gain.gain.cancelScheduledValues(now);

        voice.gain.gain.setTargetAtTime(
          0,
          now,
          0.12
        );

        voice.oscillator.stop(now + 0.5);

      } catch (error) {
        // Voice may already have stopped.
      }
    });

    activeVoices = [];

    worshipPads.forEach(pad => {
      pad.classList.remove("playing");
    });

    activeWorshipPad = null;
  }

  function startWorshipChord(pad) {

    const context = getAudio();
    const output = getOutput();

    if (!context || !output) return;

    const rootFrequency = Number(pad.dataset.freq);

    if (!Number.isFinite(rootFrequency) || rootFrequency <= 0) {
      return;
    }

    const settings = toneSettings[currentTone];

    const intervals = chordMode === "major"
      ? [1, 1.259921, 1.498307]
      : [1, 1.189207, 1.498307];

    const now = context.currentTime;

    intervals.forEach((interval, index) => {

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();

      oscillator.type = settings.wave;

      oscillator.frequency.value =
        rootFrequency * interval;

      oscillator.detune.value =
        settings.detune * (index - 1);

      filter.type = "lowpass";
      filter.frequency.value = settings.filter;

      const voiceVolume =
        settings.volume / (index === 0 ? 1 : 1.5);

      gain.gain.setValueAtTime(0.001, now);

      gain.gain.linearRampToValueAtTime(
        voiceVolume,
        now + settings.attack
      );

      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(output);

      oscillator.start(now);

      activeVoices.push({
        oscillator,
        gain
      });
    });

    activeWorshipPad = pad;
    pad.classList.add("playing");
  }

  worshipPads.forEach(pad => {

    pad.addEventListener("click", () => {

      if (activeWorshipPad === pad) {
        stopWorshipPad();
        return;
      }

      stopWorshipPad();
      startWorshipChord(pad);
    });
  });


  /* =========================================
     11. MAJOR / MINOR BUTTONS
  ========================================= */

  function setChordMode(mode) {

    chordMode = mode;

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

    // Stop the current chord when the mode changes.
    stopWorshipPad();
  }

  if (majorBtn) {
    majorBtn.addEventListener("click", () => {
      setChordMode("major");
    });
  }

  if (minorBtn) {
    minorBtn.addEventListener("click", () => {
      setChordMode("minor");
    });
  }


  /* =========================================
     12. WORSHIP SOUND PRESETS
  ========================================= */

  toneButtons.forEach(button => {

    button.addEventListener("click", () => {

      const selectedTone = button.dataset.tone;

      if (!toneSettings[selectedTone]) return;

      currentTone = selectedTone;

      toneButtons.forEach(item => {
        item.classList.toggle("active", item === button);
      });

      stopWorshipPad();
    });
  });


  /* =========================================
     13. BOOKING ASSISTANT
  ========================================= */

  const assistantButton = $("#pj-ai-btn");
  const assistantBox = $("#pj-ai-box");
  const assistantClose = $("#pj-ai-close");
  const assistantMessages = $("#pj-ai-messages");
  const assistantInput = $("#pj-ai-text");
  const assistantSend = $("#pj-ai-send");

  const booking = {
    event: "",
    date: "",
    location: "",
    details: ""
  };

  let bookingStep = 0;
  let assistantStarted = false;

  const whatsappNumber = "233206834470";

  function openAssistant() {

    if (!assistantBox || !assistantButton) return;

    assistantBox.classList.add("open");
    assistantBox.setAttribute("aria-hidden", "false");

    assistantButton.setAttribute("aria-expanded", "true");

    if (!assistantStarted) {
      assistantStarted = true;

      addBotMessage(
        "Hello! Welcome to Phil Jazzy's booking assistant. 🥁"
      );

      addBotMessage(
        "I can help collect your event details so you can send a booking enquiry directly to Phil."
      );

      showQuickOptions([
        "Church Program",
        "Wedding / Event",
        "Studio Recording",
        "Concert / Live Show",
        "Other"
      ]);
    }

    setTimeout(() => {
      if (assistantInput) assistantInput.focus();
    }, 200);
  }

  function closeAssistant() {

    if (!assistantBox || !assistantButton) return;

    assistantBox.classList.remove("open");
    assistantBox.setAttribute("aria-hidden", "true");

    assistantButton.setAttribute("aria-expanded", "false");
  }

  function addMessage(message, type = "bot") {

    if (!assistantMessages) return null;

    const messageElement = document.createElement("div");

    messageElement.className =
      `pj-msg ${type === "user" ? "pj-user" : "pj-bot"}`;

    // textContent prevents user input from being interpreted as HTML.
    messageElement.textContent = message;

    assistantMessages.appendChild(messageElement);

    assistantMessages.scrollTop =
      assistantMessages.scrollHeight;

    return messageElement;
  }

  function addBotMessage(message) {
    return addMessage(message, "bot");
  }

  function addUserMessage(message) {
    return addMessage(message, "user");
  }

  function showQuickOptions(options) {

    if (!assistantMessages) return;

    const container = document.createElement("div");
    container.className = "pj-quick";

    options.forEach(option => {

      const button = document.createElement("button");

      button.type = "button";
      button.textContent = option;

      button.addEventListener("click", () => {
        container.remove();
        handleAssistantMessage(option);
      });

      container.appendChild(button);
    });

    assistantMessages.appendChild(container);

    assistantMessages.scrollTop =
      assistantMessages.scrollHeight;
  }

  function showWhatsAppLink() {

    if (!assistantMessages) return;

    const message = [
      "Hello Phil Jazzy, I would like to make a booking enquiry.",
      "",
      `Event: ${booking.event}`,
      `Date: ${booking.date}`,
      `Location: ${booking.location}`,
      `Additional details: ${booking.details || "Not provided"}`,
      "",
      "Please let me know your availability and booking details."
    ].join("\n");

    const url =
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    const link = document.createElement("a");

    link.className = "pj-wa-link";
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Continue to WhatsApp ↗";

    assistantMessages.appendChild(link);

    assistantMessages.scrollTop =
      assistantMessages.scrollHeight;
  }

  function restartBooking() {

    booking.event = "";
    booking.date = "";
    booking.location = "";
    booking.details = "";

    bookingStep = 0;

    addBotMessage(
      "No problem. Let's start again. What kind of event are you planning?"
    );

    showQuickOptions([
      "Church Program",
      "Wedding / Event",
      "Studio Recording",
      "Concert / Live Show",
      "Other"
    ]);
  }

  function handleAssistantMessage(rawMessage) {

    const message = rawMessage.trim();

    if (!message) return;

    addUserMessage(message);

    const normalized = message.toLowerCase();

    if (
      normalized === "restart" ||
      normalized === "start again"
    ) {
      restartBooking();
      return;
    }

    if (bookingStep === 0) {

      booking.event = message;
      bookingStep = 1;

      addBotMessage(
        "Great! What date is the event? You can enter the date or say that it is not yet confirmed."
      );

      return;
    }

    if (bookingStep === 1) {

      booking.date = message;
      bookingStep = 2;

      addBotMessage(
        "Where will the event take place? Please include the town or venue."
      );

      return;
    }

    if (bookingStep === 2) {

      booking.location = message;
      bookingStep = 3;

      addBotMessage(
        "Any additional details Phil should know? For example, the event time, type of performance or music requirements. You can also type 'None'."
      );

      return;
    }

    if (bookingStep === 3) {

      booking.details =
        normalized === "none" ? "None" : message;

      bookingStep = 4;

      addBotMessage(
        "Thank you! Your booking enquiry is ready. Please continue to WhatsApp to send these details to Phil. He will personally confirm availability and discuss the booking."
      );

      showWhatsAppLink();

      showQuickOptions([
        "Start again"
      ]);

      return;
    }

    if (bookingStep === 4) {

      if (normalized.includes("start")) {
        restartBooking();
      } else {
        addBotMessage(
          "Your enquiry is ready. Use the WhatsApp link above to send it to Phil, or type 'restart' to prepare another enquiry."
        );
      }

      return;
    }
  }

  function sendAssistantMessage() {

    if (!assistantInput) return;

    const message = assistantInput.value.trim();

    if (!message) return;

    assistantInput.value = "";

    handleAssistantMessage(message);
  }

  if (assistantButton) {
    assistantButton.addEventListener("click", () => {

      if (assistantBox && assistantBox.classList.contains("open")) {
        closeAssistant();
      } else {
        openAssistant();
      }
    });
  }

  if (assistantClose) {
    assistantClose.addEventListener("click", closeAssistant);
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

    if (event.key === "Escape" && assistantBox?.classList.contains("open")) {
      closeAssistant();
    }
  });


  /* =========================================
     14. WHATSAPP BOOKING LINKS
  ========================================= */

  const whatsappLinks = $$('a[href*="wa.me/"]');

  whatsappLinks.forEach(link => {

    link.addEventListener("click", () => {

      // Analytics event, if Google Analytics is available.
      if (typeof window.gtag === "function") {
        window.gtag("event", "whatsapp_booking_click", {
          event_category: "booking",
          event_label: link.textContent.trim()
        });
      }
    });
  });


  /* =========================================
     15. PAGE READY
  ========================================= */

  document.documentElement.classList.add("js-ready");

  console.log("Phil Jazzy website JavaScript loaded successfully.");

});
