/* ==========================================================================
   SOLAR ODYSSEY — Procedural WebAudio Synthesizer (Zero External Files)
   ========================================================================== */

SolarOdyssey.Audio = (function () {
  let ctx = null;
  let enabled = true;
  let droneStarted = false;
  let masterGain = null;

  function ensureContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
      masterGain = ctx.createGain();
      masterGain.gain.value = enabled ? 0.25 : 0.0;
      masterGain.connect(ctx.destination);
    }
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  }

  function startAmbientDrone() {
    if (droneStarted) return;
    const c = ensureContext();
    if (!c) return;
    droneStarted = true;

    const freqs = [55.0, 82.41, 110.0];
    freqs.forEach((f, idx) => {
      const osc = c.createOscillator();
      const filter = c.createBiquadFilter();
      const gain = c.createGain();

      osc.type = idx === 0 ? "sine" : "triangle";
      osc.frequency.value = f;

      filter.type = "lowpass";
      filter.frequency.value = 180 + idx * 50;

      gain.gain.value = 0.05 / (idx + 1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start();
    });
  }

  function playSelectChime() {
    if (!enabled) return;
    const c = ensureContext();
    if (!c) return;

    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.14);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  function toggle() {
    enabled = !enabled;
    if (masterGain && ctx) {
      masterGain.gain.setTargetAtTime(enabled ? 0.25 : 0.0, ctx.currentTime, 0.08);
    }
    return enabled;
  }

  function isEnabled() {
    return enabled;
  }

  return {
    startAmbientDrone,
    playSelectChime,
    toggle,
    isEnabled
  };
})();
