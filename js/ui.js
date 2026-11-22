/* ==========================================================================
   SOLAR ODYSSEY 3D — HUD, Planet Telemetry Card, CG Lab & Team Credits Modal
   ========================================================================== */

SolarOdyssey.UI = (function () {
  const State = SolarOdyssey.State;
  const Bodies = SolarOdyssey.PlanetData.BODIES;
  const STORAGE_KEY = "solar_odyssey_team_v1";

  const DEFAULT_TEAM = [
    {
      name: "Rajif Aidil Putra",
      nim: "225150200111001",
      role: "Ketua Tim · Arsitektur WebGL2, Shader GLSL & Sistem Orbit",
      multiplier: 1.0
    },
    {
      name: "Anggota Tim 2",
      nim: "225150200111002",
      role: "Pemodelan 3D Parametrik, Tekstur Prosedural & Pencahayaan",
      multiplier: 0.95
    },
    {
      name: "Anggota Tim 3",
      nim: "225150200111003",
      role: "Desain UI/UX, Telemetri Astronomi & Dokumentasi Laporan",
      multiplier: 0.90
    }
  ];

  let teamMembers = loadTeam();

  function loadTeam() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return JSON.parse(JSON.stringify(DEFAULT_TEAM));
  }

  function saveTeam() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(teamMembers));
    } catch (_) {}
  }

  function init() {
    buildPlanetDock();
    bindTopHudAndTitle();
    bindPlanetCard();
    bindCgLabDrawer();
    bindCreditsModal();
  }

  function buildPlanetDock() {
    const container = document.getElementById("planet-dock-list");
    container.innerHTML = "";
    for (const b of Bodies) {
      const btn = document.createElement("button");
      btn.className = "dock-btn";
      btn.dataset.bodyId = b.id;
      btn.innerHTML = `<span class="dock-swatch" style="background:${b.swatch};box-shadow:0 0 8px ${b.swatch}"></span><span>${b.name}</span>`;
      btn.addEventListener("click", () => selectBody(b.id, false));
      container.appendChild(btn);
    }
  }

  function updateDockActive(bodyId) {
    document.querySelectorAll(".dock-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.bodyId === bodyId);
    });
  }

  function findBodyOrMoon(id) {
    for (const b of Bodies) {
      if (b.id === id) return b;
      if (b.moons) {
        const m = b.moons.find((mn) => mn.id === id);
        if (m) {
          return {
            id: m.id,
            name: m.name,
            category: `SATELIT ALAMI (${b.name.toUpperCase()})`,
            tagline: `Satelit alami yang mengorbit planet ${b.name}`,
            description: `${m.name} adalah salah satu satelit alami yang terikat gravitasi dan mengorbit mengelilingi ${b.name} dalam hierarki tata surya.`,
            metrics: [
              { label: "Planet Induk", val: b.name },
              { label: "Radius Relatif", val: `${m.radius} unit` },
              { label: "Jarak Orbit", val: `${m.orbitRadius} unit` },
              { label: "Kecepatan Orbit", val: `${m.orbitSpeed} rad/s` }
            ],
            composition: [{ name: "Batuan Silikat & Es", pct: 100 }],
            fact: `${m.name} dirender menggunakan transformasi hierarkis induk-anak (parent-child scene graph) terhadap ${b.name}.`
          };
        }
      }
    }
    return null;
  }

  function selectBody(id, closeUp = false) {
    const info = findBodyOrMoon(id);
    if (!info) return;

    SolarOdyssey.Renderer.focusOnBody(id, closeUp);
    SolarOdyssey.Audio.playSelectChime();
    updateDockActive(id);

    document.getElementById("card-category").textContent = info.category;
    document.getElementById("card-name").textContent = info.name;
    document.getElementById("card-tagline").textContent = info.tagline;
    document.getElementById("card-desc").textContent = info.description;
    document.getElementById("card-fact").textContent = info.fact;

    const metricsEl = document.getElementById("card-metrics");
    metricsEl.innerHTML = info.metrics
      .map(
        (m) => `
        <div class="metric-box">
          <div class="metric-label">${m.label}</div>
          <div class="metric-val">${m.val}</div>
        </div>`
      )
      .join("");

    const compEl = document.getElementById("card-composition");
    compEl.innerHTML = info.composition
      .map(
        (c) => `
        <div class="comp-row">
          <div class="comp-top"><span>${c.name}</span><strong>${c.pct}%</strong></div>
          <div class="comp-bar-bg"><div class="comp-bar-fill" style="width:${c.pct}%"></div></div>
        </div>`
      )
      .join("");

    document.getElementById("planet-card").classList.remove("hidden");
  }

  function closePlanetCard() {
    State.selectedBodyId = null;
    updateDockActive(null);
    document.getElementById("planet-card").classList.add("hidden");
  }

  function bindTopHudAndTitle() {
    document.getElementById("btn-start-game").addEventListener("click", () => {
      State.started = true;
      SolarOdyssey.Audio.startAmbientDrone();
      SolarOdyssey.Audio.playSelectChime();
      document.getElementById("title-overlay").classList.add("hidden");
      document.getElementById("top-hud").classList.remove("hidden");
      document.getElementById("planet-dock").classList.remove("hidden");
    });

    document.getElementById("btn-camera-orbit").addEventListener("click", () => {
      State.cameraMode = "orbit";
      document.getElementById("btn-camera-orbit").classList.add("active");
      document.getElementById("btn-camera-ship").classList.remove("active");
      document.getElementById("flight-guide").classList.add("hidden");
      document.getElementById("hud-mode-label").textContent = "Mode Kamera Orbit · Tata Surya";
    });

    document.getElementById("btn-camera-ship").addEventListener("click", () => {
      State.cameraMode = "ship";
      State.selectedBodyId = null;
      updateDockActive(null);
      document.getElementById("btn-camera-ship").classList.add("active");
      document.getElementById("btn-camera-orbit").classList.remove("active");
      document.getElementById("flight-guide").classList.remove("hidden");
      document.getElementById("hud-mode-label").textContent = "Mode Pesawat Bebas (WASD) · Tata Surya";
    });

    document.getElementById("btn-hero-align").addEventListener("click", () => {
      SolarOdyssey.Renderer.triggerHeroAlignment();
      SolarOdyssey.Audio.playSelectChime();
    });

    document.getElementById("btn-reset-view").addEventListener("click", () => {
      closePlanetCard();
      SolarOdyssey.Renderer.resetHeroCamera();
      SolarOdyssey.Audio.playSelectChime();
    });

    document.querySelectorAll(".speed-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".speed-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        State.timeSpeed = parseFloat(btn.dataset.speed);
      });
    });

    document.getElementById("btn-toggle-audio").addEventListener("click", (e) => {
      SolarOdyssey.Audio.startAmbientDrone();
      const on = SolarOdyssey.Audio.toggle();
      e.target.textContent = on ? "Audio: ON" : "Audio: OFF";
    });

    document.getElementById("btn-toggle-cglab").addEventListener("click", () => {
      document.getElementById("cg-lab-drawer").classList.toggle("hidden");
    });

    document.getElementById("btn-close-cglab").addEventListener("click", () => {
      document.getElementById("cg-lab-drawer").classList.add("hidden");
    });
  }

  function bindPlanetCard() {
    document.getElementById("btn-close-card").addEventListener("click", closePlanetCard);

    document.getElementById("btn-focus-close").addEventListener("click", () => {
      if (State.selectedBodyId) {
        SolarOdyssey.Renderer.focusOnBody(State.selectedBodyId, true);
      }
    });

    document.getElementById("btn-prev-body").addEventListener("click", () => {
      const idx = Bodies.findIndex((b) => b.id === State.selectedBodyId);
      const prev = Bodies[(idx - 1 + Bodies.length) % Bodies.length];
      selectBody(prev.id, false);
    });

    document.getElementById("btn-next-body").addEventListener("click", () => {
      const idx = Bodies.findIndex((b) => b.id === State.selectedBodyId);
      const next = Bodies[(idx + 1) % Bodies.length];
      selectBody(next.id, false);
    });
  }

  function bindCgLabDrawer() {
    // Tabs
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
        document.querySelectorAll(".tab-pane").forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
      });
    });

    // Projection toggle (Perspective vs Orthographic)
    const btnPersp = document.getElementById("btn-proj-persp");
    const btnOrtho = document.getElementById("btn-proj-ortho");
    const rowFov = document.getElementById("row-fov");
    const rowOrtho = document.getElementById("row-ortho-size");

    btnPersp.addEventListener("click", () => {
      State.cg.projection = "perspective";
      btnPersp.classList.add("active");
      btnOrtho.classList.remove("active");
      rowFov.classList.remove("hidden");
      rowOrtho.classList.add("hidden");
    });

    btnOrtho.addEventListener("click", () => {
      State.cg.projection = "ortho";
      btnOrtho.classList.add("active");
      btnPersp.classList.remove("active");
      rowOrtho.classList.remove("hidden");
      rowFov.classList.add("hidden");
    });

    document.getElementById("slider-fov").addEventListener("input", (e) => {
      State.cg.fov = parseFloat(e.target.value);
      document.getElementById("val-fov").textContent = `${State.cg.fov}°`;
    });

    document.getElementById("slider-ortho-size").addEventListener("input", (e) => {
      State.cg.orthoSize = parseFloat(e.target.value);
      document.getElementById("val-ortho-size").textContent = State.cg.orthoSize.toFixed(1);
    });

    document.getElementById("chk-axes").addEventListener("change", (e) => (State.cg.showAxes = e.target.checked));
    document.getElementById("chk-orbits").addEventListener("change", (e) => (State.cg.showOrbits = e.target.checked));
    document.getElementById("chk-asteroids").addEventListener("change", (e) => (State.cg.showAsteroids = e.target.checked));
    document.getElementById("chk-tilt").addEventListener("change", (e) => (State.cg.useAxialTilt = e.target.checked));

    // Clipping planes
    document.getElementById("slider-near").addEventListener("input", (e) => {
      State.cg.nearPlane = parseFloat(e.target.value);
      document.getElementById("val-near").textContent = State.cg.nearPlane.toFixed(1);
    });

    document.getElementById("slider-far").addEventListener("input", (e) => {
      State.cg.farPlane = parseFloat(e.target.value);
      document.getElementById("val-far").textContent = State.cg.farPlane.toFixed(0);
    });

    // Primitives
    document.querySelectorAll(".prim-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".prim-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        State.cg.primitiveMode = btn.dataset.prim;
      });
    });

    // Sphere tessellation
    document.getElementById("slider-segments").addEventListener("input", (e) => {
      const seg = parseInt(e.target.value, 10);
      State.cg.sphereSegments = seg;
      document.getElementById("val-segments").textContent = `${seg} × ${Math.floor(seg / 2)}`;
      SolarOdyssey.Renderer.rebuildSphereMesh(seg);
    });

    // Culling & Winding
    document.getElementById("chk-cull").addEventListener("change", (e) => {
      State.cg.backfaceCulling = e.target.checked;
    });

    const btnCcw = document.getElementById("btn-wind-ccw");
    const btnCw = document.getElementById("btn-wind-cw");
    btnCcw.addEventListener("click", () => {
      State.cg.windingOrder = "CCW";
      btnCcw.classList.add("active");
      btnCw.classList.remove("active");
    });
    btnCw.addEventListener("click", () => {
      State.cg.windingOrder = "CW";
      btnCw.classList.add("active");
      btnCcw.classList.remove("active");
    });

    // Interpolation (Smooth vs Flat)
    const btnSmooth = document.getElementById("btn-shade-smooth");
    const btnFlat = document.getElementById("btn-shade-flat");
    btnSmooth.addEventListener("click", () => {
      State.cg.smoothShading = true;
      btnSmooth.classList.add("active");
      btnFlat.classList.remove("active");
    });
    btnFlat.addEventListener("click", () => {
      State.cg.smoothShading = false;
      btnFlat.classList.add("active");
      btnSmooth.classList.remove("active");
    });

    // Lighting & Textures
    document.getElementById("chk-ambient").addEventListener("change", (e) => (State.cg.useAmbient = e.target.checked));
    document.getElementById("chk-diffuse").addEventListener("change", (e) => (State.cg.useDiffuse = e.target.checked));
    document.getElementById("chk-specular").addEventListener("change", (e) => (State.cg.useSpecular = e.target.checked));
    document.getElementById("chk-atmosphere").addEventListener("change", (e) => (State.cg.useAtmosphere = e.target.checked));

    document.getElementById("slider-sun-int").addEventListener("input", (e) => {
      State.cg.sunIntensity = parseFloat(e.target.value);
      document.getElementById("val-sun-int").textContent = State.cg.sunIntensity.toFixed(2);
    });

    document.getElementById("chk-texture").addEventListener("change", (e) => (State.cg.useTexture = e.target.checked));
    document.getElementById("chk-earth-layers").addEventListener("change", (e) => (State.cg.useEarthLayers = e.target.checked));
    document.getElementById("chk-mipmap").addEventListener("change", (e) => {
      State.cg.useMipmap = e.target.checked;
      SolarOdyssey.Renderer.updateTextureFiltering(e.target.checked);
    });
  }

  function updateLiveInspector() {
    const drawer = document.getElementById("cg-lab-drawer");
    if (drawer.classList.contains("hidden")) return;

    const targetId = State.selectedBodyId || "earth";
    const info = findBodyOrMoon(targetId);
    const tr = SolarOdyssey.Renderer.getBodyTransform(targetId);

    if (info && tr) {
      document.getElementById("matrix-body-name").textContent = info.name;
      document.getElementById("matrix-readout").textContent = SolarOdyssey.Math3D.formatMat4(tr.model);
    }

    const st = State.stats;
    document.getElementById("gpu-stats-box").innerHTML =
      `FPS / Frame Time : <strong>${st.fps.toFixed(0)} FPS</strong> (${st.frameMs.toFixed(1)} ms)<br>` +
      `Active VAOs / VBOs: <strong>${st.vaoCount} VAOs</strong> / <strong>${st.vboCount} VBOs</strong><br>` +
      `Rendered Vertices: <strong>${st.totalVertices.toLocaleString()}</strong><br>` +
      `Rendered Tris    : <strong>${st.totalTriangles.toLocaleString()}</strong> (Draw Calls: ${st.drawCalls})<br>` +
      `Mouse Ray Dir    : [${st.rayDir.map((v) => v.toFixed(2)).join(", ")}]`;
  }

  function renderTeamTable() {
    const tbody = document.getElementById("team-tbody");
    tbody.innerHTML = "";
    teamMembers.forEach((member, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td><input class="team-input" data-field="name" data-idx="${idx}" value="${member.name}" /></td>
        <td><input class="team-input" data-field="nim" data-idx="${idx}" value="${member.nim}" /></td>
        <td><input class="team-input" data-field="role" data-idx="${idx}" value="${member.role}" /></td>
        <td>
          <input class="team-input mult-input" type="number" step="0.05" min="0" max="1"
                 data-field="multiplier" data-idx="${idx}" value="${Number(member.multiplier).toFixed(2)}" />
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".team-input").forEach((input) => {
      input.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        const field = e.target.dataset.field;
        if (field === "multiplier") {
          let val = parseFloat(e.target.value);
          if (Number.isNaN(val)) val = 1.0;
          val = Math.max(0, Math.min(1, val));
          e.target.value = val.toFixed(2);
          teamMembers[idx].multiplier = val;
        } else {
          teamMembers[idx][field] = e.target.value;
        }
        saveTeam();
      });
    });
  }

  function bindCreditsModal() {
    const modal = document.getElementById("credits-modal");
    const openModal = () => {
      renderTeamTable();
      document.getElementById("copy-feedback").textContent = "";
      modal.classList.remove("hidden");
    };
    const closeModal = () => modal.classList.add("hidden");

    document.getElementById("btn-open-credits-title").addEventListener("click", openModal);
    document.getElementById("btn-open-credits").addEventListener("click", openModal);
    document.getElementById("btn-close-credits").addEventListener("click", closeModal);
    document.getElementById("btn-done-credits").addEventListener("click", () => {
      saveTeam();
      closeModal();
    });

    document.getElementById("btn-add-member").addEventListener("click", () => {
      if (teamMembers.length >= 4) {
        document.getElementById("copy-feedback").textContent = "Maksimal jumlah anggota tim adalah 4 orang.";
        return;
      }
      teamMembers.push({
        name: `Anggota Tim ${teamMembers.length + 1}`,
        nim: "22515020011100" + (teamMembers.length + 1),
        role: "Pengujian & Dokumentasi",
        multiplier: 0.90
      });
      saveTeam();
      renderTeamTable();
    });

    document.getElementById("btn-reset-team").addEventListener("click", () => {
      teamMembers = JSON.parse(JSON.stringify(DEFAULT_TEAM));
      saveTeam();
      renderTeamTable();
      document.getElementById("copy-feedback").textContent = "Daftar tim dikembalikan ke default.";
    });

    document.getElementById("btn-copy-credits").addEventListener("click", async () => {
      const lines = [
        "=== CREDITS & MULTIPLIER KONTRIBUSI TIM — SOLAR ODYSSEY 3D ===",
        "Teknologi: Native WebGL2, GLSL ES 3.00, JavaScript Modular, Canvas 2D Procedural Textures, WebAudio API",
        ""
      ];
      teamMembers.forEach((m, i) => {
        lines.push(`${i + 1}. ${m.name} (NIM: ${m.nim}) — ${m.role} | Multiplier: ${Number(m.multiplier).toFixed(2)}`);
      });
      const text = lines.join("\n");
      try {
        await navigator.clipboard.writeText(text);
        document.getElementById("copy-feedback").textContent = "Teks credits & multiplier berhasil disalin ke clipboard!";
      } catch (_) {
        document.getElementById("copy-feedback").textContent = "Data tersimpan otomatis di browser.";
      }
    });
  }

  return {
    init,
    selectBody,
    findBodyOrMoon,
    updateLiveInspector
  };
})();
