/* ==========================================================================
   SOLAR ODYSSEY — Main Entry Point, Input Controller & Render Loop
   ========================================================================== */

(function () {
  const State = SolarOdyssey.State;
  const Renderer = SolarOdyssey.Renderer;
  const UI = SolarOdyssey.UI;

  const keys = {};
  let isDragging = false;
  let dragMoved = false;
  let lastMouseX = 0;
  let lastMouseY = 0;

  function initApp() {
    const loadingScreen = document.getElementById("loading-screen");
    const loadingBar = document.getElementById("loading-bar-fill");
    const loadingStatus = document.getElementById("loading-status");
    const startStamp = performance.now();

    if (loadingBar) loadingBar.style.width = "32%";

    // Allow browser to paint the animated Loading Screen before heavy WebGL2 & texture build
    requestAnimationFrame(() => {
      setTimeout(() => {
        const canvas = document.getElementById("gl-canvas");
        if (!Renderer.init(canvas)) {
          if (loadingScreen) loadingScreen.classList.add("hidden");
          return;
        }

        if (loadingBar) loadingBar.style.width = "82%";
        if (loadingStatus) loadingStatus.textContent = "Menyiapkan Antarmuka & Lab Komputer Grafis...";

        UI.init();
        bindCanvasInteractions(canvas);

        let lastTime = performance.now();
        let fpsAccum = 0;
        let fpsFrames = 0;

        function frame(now) {
          const rawDt = Math.min(0.05, (now - lastTime) / 1000);
          lastTime = now;

          fpsAccum += rawDt;
          fpsFrames++;
          if (fpsAccum >= 0.35) {
            State.stats.fps = fpsFrames / fpsAccum;
            State.stats.frameMs = (fpsAccum / fpsFrames) * 1000;
            fpsAccum = 0;
            fpsFrames = 0;
            UI.updateLiveInspector();
          }

          const dtSim = rawDt * State.timeSpeed;
          State.simTime += dtSim;
          if (State.cg.animateOrbit) State.orbitTime += dtSim;
          if (State.cg.animateSpin) State.spinTime += dtSim;
          Renderer.render(rawDt, keys);

          requestAnimationFrame(frame);
        }

        requestAnimationFrame(frame);

        if (loadingBar) loadingBar.style.width = "100%";
        if (loadingStatus) loadingStatus.textContent = "Siap Menjelajahi Tata Surya!";

        // Ensure splash screen stays visible smoothly for at least 950ms before fading out
        const elapsed = performance.now() - startStamp;
        const holdMs = Math.max(280, 950 - elapsed);
        setTimeout(() => {
          if (loadingScreen) {
            loadingScreen.classList.add("fade-out");
            setTimeout(() => loadingScreen.classList.add("hidden"), 480);
          }
        }, holdMs);
      }, 45);
    });
  }

  function bindCanvasInteractions(canvas) {
    const tooltip = document.getElementById("hover-tooltip");
    const tooltipName = document.getElementById("tooltip-name");

    canvas.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      isDragging = true;
      dragMoved = false;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });

    window.addEventListener("mousemove", (e) => {
      if (isDragging) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        if (Math.hypot(dx, dy) > 4) dragMoved = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        if (State.cameraMode === "ship") {
          Renderer.camera.shipYaw += dx * 0.004;
          Renderer.camera.shipPitch = Math.max(
            -1.45,
            Math.min(1.45, Renderer.camera.shipPitch - dy * 0.004)
          );
        } else {
          Renderer.camera.yaw -= dx * 0.0055;
          Renderer.camera.pitch = Math.max(
            -1.42,
            Math.min(1.42, Renderer.camera.pitch + dy * 0.0055)
          );
        }
        tooltip.classList.add("hidden");
        return;
      }

      if (!State.started) return;

      // Hover raycast detection
      const hoveredId = Renderer.pickBodyAtScreen(e.clientX, e.clientY);
      State.hoveredBodyId = hoveredId;
      if (hoveredId) {
        const info = UI.findBodyOrMoon(hoveredId);
        if (info) {
          canvas.style.cursor = "pointer";
          tooltipName.textContent = info.name;
          tooltip.style.left = `${e.clientX + 14}px`;
          tooltip.style.top = `${e.clientY + 14}px`;
          tooltip.classList.remove("hidden");
          return;
        }
      }
      canvas.style.cursor = "grab";
      tooltip.classList.add("hidden");
    });

    window.addEventListener("mouseup", (e) => {
      if (!isDragging) return;
      isDragging = false;
      if (!dragMoved && State.started && e.target === canvas) {
        const clickedId = Renderer.pickBodyAtScreen(e.clientX, e.clientY);
        if (clickedId) {
          UI.selectBody(clickedId, false);
        }
      }
    });

    canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        if (State.cg.projection === "ortho") {
          State.cg.orthoSize = Math.max(6, Math.min(85, State.cg.orthoSize + e.deltaY * 0.02));
          document.getElementById("slider-ortho-size").value = State.cg.orthoSize;
          document.getElementById("val-ortho-size").textContent = State.cg.orthoSize.toFixed(1);
        } else {
          Renderer.camera.desiredDistance = Math.max(
            2.4,
            Math.min(175.0, Renderer.camera.desiredDistance * (1 + e.deltaY * 0.001))
          );
        }
      },
      { passive: false }
    );

    window.addEventListener("keydown", (e) => {
      if (document.activeElement && document.activeElement.tagName === "INPUT") return;
      keys[e.code] = true;
    });

    window.addEventListener("keyup", (e) => {
      keys[e.code] = false;
    });
  }

  window.addEventListener("DOMContentLoaded", initApp);
})();
