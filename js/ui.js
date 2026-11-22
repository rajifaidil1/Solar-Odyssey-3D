/* ==========================================================================
   SOLAR ODYSSEY — HUD, Planet Telemetry Card, CG Lab, Quiz & Credits Modal
   ========================================================================== */

SolarOdyssey.UI = (function () {
  const State = SolarOdyssey.State;
  const Bodies = SolarOdyssey.PlanetData.BODIES;
  const STORAGE_KEY = "solar_odyssey_team_v2";

  const DEFAULT_TEAM = [
    {
      name: "Rajif Aidil Putra Afina",
      nim: "245150207111072",
      multiplier: 1.00,
      role: "Ketua Tim · Arsitektur pipeline WebGL2 & render loop 60 FPS (main.js, renderer.js), aljabar linear 3D, matriks transformasi M = T·R·S, proyeksi Perspective/Orthographic, Mouse 3D Raycasting (math.js), serta sistem kamera Orbit & Jelajah Bebas (WASD)."
    },
    {
      name: "Christiano Alfonsius Purba",
      nim: "245150200111055",
      multiplier: 1.00,
      role: "Anggota Tim · Pemodelan geometri 3D parametrik bola planet, cincin Saturnus, & 450 asteroid instanced (geometry.js), manajemen memori GPU (VAO, VBO, EBO), triangulasi CCW, back-face culling, sumbu XYZ, serta validasi Lab Komputer Grafis."
    },
    {
      name: "Damar Tyaga Wistara",
      nim: "245150200111060",
      multiplier: 1.00,
      role: "Anggota Tim · Pengembangan Vertex & Fragment Shader GLSL ES 3.00 (shaders.js), model pencahayaan Blinn-Phong, Smooth vs. Flat Shading, atmosfer Fresnel, bayangan cincin Saturnus, generator tekstur UV prosedural (textures.js), & audio WebAudio (audio.js)."
    },
    {
      name: "Luthfi Pratama Sahni",
      nim: "245150200111058",
      multiplier: 1.00,
      role: "Anggota Tim · Desain UI/UX sci-fi glassmorphism & layout responsif (index.html, styles.css), database astronomi 8 planet, daftar satelit alami, citra observasi, bank soal Quiz Tata Surya (planetData.js, ui.js), pengujian offline, & laporan akhir."
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
    bindQuizModal();
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
            description: `${m.name} adalah salah satu satelit alami utama yang terikat gravitasi dan mengorbit mengelilingi ${b.name} dalam hierarki tata surya.`,
            metrics: [
              { label: "Planet Induk", val: b.name },
              { label: "Radius Relatif", val: `${m.radius} unit` },
              { label: "Jarak Orbit", val: `${m.orbitRadius} unit` },
              { label: "Kecepatan Orbit", val: `${m.orbitSpeed} rad/s` }
            ],
            composition: [{ name: "Batuan Silikat & Es", pct: 100 }],
            fact: `${m.name} dirender menggunakan transformasi hierarkis induk-anak (parent-child scene graph) terhadap ${b.name}.`,
            photoCaption: m.photoCaption || `Citra permukaan satelit alami ${m.name} yang mengitari ${b.name}.`,
            satellitesInfo: b.satellitesInfo
          };
        }
      }
    }
    return null;
  }

  /* ==========================================================================
     Procedural Canvas Planet Texture Fallback Generator (Zero Broken Images)
     ========================================================================== */
  function createPlanetCanvasPreview(bodyId) {
    const w = 460;
    const h = 260;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    // 1. Space Background with Stars
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, "#030712");
    bgGrad.addColorStop(0.5, "#060d1f");
    bgGrad.addColorStop(1, "#02040a");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#ffffff";
    const starSeeds = [
      [24, 35, 1.2, 0.7], [85, 200, 0.9, 0.5], [140, 42, 1.5, 0.8], [380, 50, 1.0, 0.6],
      [420, 180, 1.4, 0.85], [320, 220, 0.8, 0.4], [50, 120, 1.1, 0.65], [290, 30, 1.3, 0.75],
      [360, 140, 0.9, 0.5], [190, 240, 1.0, 0.6], [70, 240, 1.6, 0.9], [430, 80, 1.1, 0.6],
      [110, 15, 0.8, 0.45], [260, 245, 1.2, 0.7], [400, 230, 0.9, 0.5]
    ];
    starSeeds.forEach(([sx, sy, sr, sa]) => {
      ctx.globalAlpha = sa;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    const cx = w * 0.5;
    const cy = h * 0.5;
    let r = 74;

    if (bodyId === "sun") {
      r = 82;
      // Solar Corona outer glow
      const corona = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r * 1.6);
      corona.addColorStop(0, "rgba(251, 146, 60, 0.85)");
      corona.addColorStop(0.35, "rgba(249, 115, 22, 0.45)");
      corona.addColorStop(0.7, "rgba(234, 88, 12, 0.15)");
      corona.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = corona;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Sun body
      const sunGrad = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, 10, cx, cy, r);
      sunGrad.addColorStop(0, "#ffffff");
      sunGrad.addColorStop(0.2, "#fef08a");
      sunGrad.addColorStop(0.5, "#f97316");
      sunGrad.addColorStop(0.85, "#ea580c");
      sunGrad.addColorStop(1, "#c2410c");
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Plasma granules
      ctx.fillStyle = "rgba(254, 240, 138, 0.35)";
      for (let i = 0; i < 24; i++) {
        const ang = (i / 24) * Math.PI * 2;
        const rad = r * (0.3 + 0.6 * Math.sin(i * 1.7));
        const gx = cx + Math.cos(ang) * rad;
        const gy = cy + Math.sin(ang) * rad;
        ctx.beginPath();
        ctx.arc(gx, gy, 4 + (i % 5), 0, Math.PI * 2);
        ctx.fill();
      }
      return canvas.toDataURL("image/png");
    }

    if (bodyId === "saturn") {
      r = 52;
      // Back half of Saturn's rings (drawn behind planet)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.32);
      const ringGrad = ctx.createRadialGradient(0, 0, 68, 0, 0, 142);
      ringGrad.addColorStop(0, "rgba(202, 138, 4, 0.85)");
      ringGrad.addColorStop(0.45, "rgba(253, 224, 71, 0.95)");
      ringGrad.addColorStop(0.68, "rgba(30, 20, 10, 0.2)"); // Cassini division
      ringGrad.addColorStop(0.74, "rgba(234, 179, 8, 0.8)");
      ringGrad.addColorStop(1, "rgba(161, 98, 7, 0)");
      ctx.fillStyle = ringGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 142, 44, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Clip to spherical boundary
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    // Planet surface characteristics
    if (bodyId === "earth") {
      const oceanGrad = ctx.createRadialGradient(cx - 20, cy - 20, 10, cx, cy, r);
      oceanGrad.addColorStop(0, "#2563eb");
      oceanGrad.addColorStop(0.6, "#1d4ed8");
      oceanGrad.addColorStop(1, "#172554");
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      // Continents (green and brown)
      ctx.fillStyle = "#15803d";
      ctx.beginPath();
      ctx.ellipse(cx - 24, cy - 14, 28, 38, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#166534";
      ctx.beginPath();
      ctx.ellipse(cx + 26, cy + 18, 32, 22, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ca8a04";
      ctx.beginPath();
      ctx.ellipse(cx - 15, cy - 36, 22, 12, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric cloud swirls
      ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
      ctx.beginPath();
      ctx.ellipse(cx - 10, cy - 22, 42, 10, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 15, cy + 12, 48, 12, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - 20, cy + 34, 34, 8, -0.1, 0, Math.PI * 2);
      ctx.fill();
    } else if (bodyId === "mars") {
      const marsGrad = ctx.createRadialGradient(cx - 20, cy - 20, 10, cx, cy, r);
      marsGrad.addColorStop(0, "#ea580c");
      marsGrad.addColorStop(0.6, "#c2410c");
      marsGrad.addColorStop(1, "#7c2d12");
      ctx.fillStyle = marsGrad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      // Basalt patches
      ctx.fillStyle = "#451a03";
      ctx.beginPath();
      ctx.ellipse(cx - 15, cy + 10, 36, 16, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 20, cy - 12, 24, 18, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Polar ice cap
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(cx, cy - r + 8, 22, 9, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (bodyId === "jupiter") {
      const jupGrad = ctx.createLinearGradient(0, cy - r, 0, cy + r);
      jupGrad.addColorStop(0.0, "#d97706");
      jupGrad.addColorStop(0.15, "#fef3c7");
      jupGrad.addColorStop(0.3, "#92400e");
      jupGrad.addColorStop(0.45, "#fde68a");
      jupGrad.addColorStop(0.6, "#78350f");
      jupGrad.addColorStop(0.75, "#fed7aa");
      jupGrad.addColorStop(0.9, "#b45309");
      jupGrad.addColorStop(1.0, "#d97706");
      ctx.fillStyle = jupGrad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      // Great Red Spot
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.ellipse(cx + 22, cy + 18, 18, 11, 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fef2f2";
      ctx.beginPath();
      ctx.ellipse(cx + 22, cy + 18, 12, 6, 0.08, 0, Math.PI * 2);
      ctx.globalAlpha = 0.3;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    } else if (bodyId === "saturn") {
      const satGrad = ctx.createLinearGradient(0, cy - r, 0, cy + r);
      satGrad.addColorStop(0, "#d97706");
      satGrad.addColorStop(0.2, "#fde68a");
      satGrad.addColorStop(0.4, "#f59e0b");
      satGrad.addColorStop(0.65, "#fef3c7");
      satGrad.addColorStop(0.85, "#d97706");
      satGrad.addColorStop(1, "#b45309");
      ctx.fillStyle = satGrad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    } else if (bodyId === "venus") {
      const venGrad = ctx.createLinearGradient(0, cy - r, 0, cy + r);
      venGrad.addColorStop(0, "#eab308");
      venGrad.addColorStop(0.35, "#fef08a");
      venGrad.addColorStop(0.65, "#ca8a04");
      venGrad.addColorStop(1, "#a16207");
      ctx.fillStyle = venGrad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      ctx.fillStyle = "rgba(254, 240, 138, 0.35)";
      ctx.beginPath();
      ctx.ellipse(cx - 10, cy - 14, 52, 16, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 12, cy + 18, 48, 14, -0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (bodyId === "mercury") {
      const mercGrad = ctx.createRadialGradient(cx - 20, cy - 20, 10, cx, cy, r);
      mercGrad.addColorStop(0, "#9ca3af");
      mercGrad.addColorStop(0.6, "#6b7280");
      mercGrad.addColorStop(1, "#374151");
      ctx.fillStyle = mercGrad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      ctx.fillStyle = "#4b5563";
      [[cx - 24, cy - 15, 12], [cx + 18, cy + 22, 15], [cx - 8, cy + 26, 9], [cx + 15, cy - 28, 11]].forEach(([kx, ky, kr]) => {
        ctx.beginPath();
        ctx.arc(kx, ky, kr, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (bodyId === "moon") {
      const moonGrad = ctx.createRadialGradient(cx - 20, cy - 20, 10, cx, cy, r);
      moonGrad.addColorStop(0, "#d1d5db");
      moonGrad.addColorStop(0.6, "#9ca3af");
      moonGrad.addColorStop(1, "#4b5563");
      ctx.fillStyle = moonGrad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      ctx.fillStyle = "#374151";
      ctx.beginPath();
      ctx.ellipse(cx - 18, cy - 12, 28, 22, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 14, cy + 10, 24, 18, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx - 10, cy + 26, 14, 0, Math.PI * 2);
      ctx.fill();
    } else if (bodyId === "uranus") {
      const uranGrad = ctx.createRadialGradient(cx - 18, cy - 18, 12, cx, cy, r);
      uranGrad.addColorStop(0, "#a5f3fc");
      uranGrad.addColorStop(0.5, "#38bdf8");
      uranGrad.addColorStop(0.85, "#0284c7");
      uranGrad.addColorStop(1, "#0369a1");
      ctx.fillStyle = uranGrad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    } else if (bodyId === "neptune") {
      const neptGrad = ctx.createRadialGradient(cx - 22, cy - 22, 12, cx, cy, r);
      neptGrad.addColorStop(0, "#60a5fa");
      neptGrad.addColorStop(0.45, "#2563eb");
      neptGrad.addColorStop(0.8, "#1d4ed8");
      neptGrad.addColorStop(1, "#172554");
      ctx.fillStyle = neptGrad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.beginPath();
      ctx.ellipse(cx - 14, cy - 18, 38, 5, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 18, cy + 16, 32, 4, -0.15, 0, Math.PI * 2);
      ctx.fill();
    } else if (bodyId === "io") {
      const ioGrad = ctx.createRadialGradient(cx - 15, cy - 15, 10, cx, cy, r);
      ioGrad.addColorStop(0, "#fde047");
      ioGrad.addColorStop(0.6, "#eab308");
      ioGrad.addColorStop(1, "#854d0e");
      ctx.fillStyle = ioGrad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      ctx.fillStyle = "#991b1b";
      [[cx - 20, cy - 10, 8], [cx + 15, cy + 12, 10], [cx - 5, cy + 22, 7], [cx + 18, cy - 18, 6]].forEach(([vx, vy, vr]) => {
        ctx.beginPath();
        ctx.arc(vx, vy, vr, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (bodyId === "europa") {
      const eurGrad = ctx.createRadialGradient(cx - 15, cy - 15, 10, cx, cy, r);
      eurGrad.addColorStop(0, "#ffffff");
      eurGrad.addColorStop(0.6, "#e2e8f0");
      eurGrad.addColorStop(1, "#94a3b8");
      ctx.fillStyle = eurGrad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      ctx.strokeStyle = "rgba(180, 83, 9, 0.55)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - 40, cy - 20);
      ctx.bezierCurveTo(cx - 10, cy - 5, cx + 15, cy - 30, cx + 45, cy - 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 35, cy + 25);
      ctx.bezierCurveTo(cx - 5, cy + 10, cx + 25, cy + 30, cx + 40, cy + 15);
      ctx.stroke();
    } else if (bodyId === "ganymede") {
      const ganGrad = ctx.createRadialGradient(cx - 15, cy - 15, 10, cx, cy, r);
      ganGrad.addColorStop(0, "#9ca3af");
      ganGrad.addColorStop(0.6, "#64748b");
      ganGrad.addColorStop(1, "#334155");
      ctx.fillStyle = ganGrad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.arc(cx - 12, cy - 16, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 20, cy + 14, 9, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const defGrad = ctx.createRadialGradient(cx - 15, cy - 15, 10, cx, cy, r);
      defGrad.addColorStop(0, "#93c5fd");
      defGrad.addColorStop(0.6, "#3b82f6");
      defGrad.addColorStop(1, "#1e3a8a");
      ctx.fillStyle = defGrad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }

    // 3D Spherical Shadow Overlay (Simulates single light source from top-left)
    const shadowGrad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.2, cx, cy, r * 1.05);
    shadowGrad.addColorStop(0, "rgba(255, 255, 255, 0.2)");
    shadowGrad.addColorStop(0.45, "rgba(0, 0, 0, 0.0)");
    shadowGrad.addColorStop(0.85, "rgba(0, 0, 0, 0.72)");
    shadowGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.94)");
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    ctx.restore();

    // Front half of Saturn's rings
    if (bodyId === "saturn") {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.32);
      const ringFront = ctx.createRadialGradient(0, 0, 68, 0, 0, 142);
      ringFront.addColorStop(0, "rgba(202, 138, 4, 0.88)");
      ringFront.addColorStop(0.45, "rgba(253, 224, 71, 0.96)");
      ringFront.addColorStop(0.68, "rgba(30, 20, 10, 0.2)");
      ringFront.addColorStop(0.74, "rgba(234, 179, 8, 0.82)");
      ringFront.addColorStop(1, "rgba(161, 98, 7, 0)");
      ctx.fillStyle = ringFront;
      ctx.beginPath();
      ctx.ellipse(0, 0, 142, 44, 0, 0, Math.PI);
      ctx.fill();
      ctx.restore();
    }

    // Atmospheric rim glow
    let atmoGlowColor = "rgba(56, 189, 248, 0.4)";
    if (bodyId === "mars") atmoGlowColor = "rgba(239, 68, 68, 0.3)";
    else if (bodyId === "venus") atmoGlowColor = "rgba(234, 179, 8, 0.4)";
    else if (bodyId === "uranus" || bodyId === "neptune") atmoGlowColor = "rgba(34, 211, 238, 0.45)";
    else if (bodyId === "mercury" || bodyId === "moon") atmoGlowColor = "rgba(255, 255, 255, 0.15)";

    ctx.strokeStyle = atmoGlowColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 1, 0, Math.PI * 2);
    ctx.stroke();

    return canvas.toDataURL("image/png");
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

    // 1. Real Astronomical Photo with Automatic Fallback Handling
    const photoImg = document.getElementById("planet-real-img");
    const photoBadge = document.getElementById("photo-source-badge");
    const photoCaption = document.getElementById("photo-caption");

    if (photoCaption) {
      photoCaption.textContent = info.photoCaption || "Citra observatorium astronomi antariksa.";
    }

    if (photoImg) {
      if (photoBadge) photoBadge.textContent = "Memuat...";
      photoImg.onerror = function () {
        this.onerror = null;
        this.src = createPlanetCanvasPreview(info.id);
        if (photoBadge) photoBadge.textContent = "Preview Tekstur 3D";
      };
      photoImg.onload = function () {
        if (this.src.startsWith("data:")) {
          if (photoBadge) photoBadge.textContent = "Render Prosedural";
        } else {
          if (photoBadge) photoBadge.textContent = "Foto Asli NASA";
        }
      };
      photoImg.src = `assets/planets/${info.id}.jpg`;
    }

    // 2. Metrics Grid
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

    // 3. Composition List
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

    // 4. Main Natural Satellites Information List
    const satContainer = document.getElementById("card-satellites");
    if (satContainer) {
      const sats = info.satellitesInfo || [];
      if (sats.length === 0) {
        satContainer.innerHTML = `<div class="satellite-empty">Tidak ada satelit alami yang tercatat.</div>`;
      } else {
        satContainer.innerHTML = sats
          .map(
            (s) => `
            <div class="satellite-card ${s.id && s.id === info.id ? 'active' : ''}" ${s.id ? `data-moon-id="${s.id}" title="Klik untuk inspeksi 3D satelit ${s.name}"` : ''}>
              <div class="sat-header">
                <span class="sat-name">${s.name} ${s.id && s.id === info.id ? '(Sedang Diinspeksi)' : ''}</span>
                <span class="sat-diameter">${s.diameter}</span>
              </div>
              <div class="sat-note">${s.note}</div>
            </div>`
          )
          .join("");

        satContainer.querySelectorAll(".satellite-card[data-moon-id]").forEach((card) => {
          card.addEventListener("click", () => {
            selectBody(card.dataset.moonId, true);
          });
        });
      }
    }

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
      document.getElementById("hud-mode-label").textContent = "Mode Jelajah Bebas (WASD) · Tata Surya";
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
    document.getElementById("chk-anim-orbit")?.addEventListener("change", (e) => (State.cg.animateOrbit = e.target.checked));
    document.getElementById("chk-anim-spin")?.addEventListener("change", (e) => (State.cg.animateSpin = e.target.checked));

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

    // Interpolation (Phong vs Gouraud vs Flat) — Materi 6
    const btnPhong = document.getElementById("btn-shade-phong");
    const btnGouraud = document.getElementById("btn-shade-gouraud");
    const btnFlat = document.getElementById("btn-shade-flat");
    const shadeBtns = [btnPhong, btnGouraud, btnFlat];
    function setShadingMode(mode, activeBtn) {
      State.cg.shadingMode = mode;
      shadeBtns.forEach((b) => b && b.classList.remove("active"));
      if (activeBtn) activeBtn.classList.add("active");
    }
    btnPhong?.addEventListener("click", () => setShadingMode("phong", btnPhong));
    btnGouraud?.addEventListener("click", () => setShadingMode("gouraud", btnGouraud));
    btnFlat?.addEventListener("click", () => setShadingMode("flat", btnFlat));

    // Lighting & Textures
    document.getElementById("chk-ambient").addEventListener("change", (e) => (State.cg.useAmbient = e.target.checked));
    document.getElementById("chk-diffuse").addEventListener("change", (e) => (State.cg.useDiffuse = e.target.checked));
    document.getElementById("chk-specular").addEventListener("change", (e) => (State.cg.useSpecular = e.target.checked));
    document.getElementById("chk-atmosphere").addEventListener("change", (e) => (State.cg.useAtmosphere = e.target.checked));

    document.getElementById("slider-sun-int").addEventListener("input", (e) => {
      State.cg.sunIntensity = parseFloat(e.target.value);
      document.getElementById("val-sun-int").textContent = State.cg.sunIntensity.toFixed(2);
    });

    document.getElementById("slider-shininess")?.addEventListener("input", (e) => {
      State.cg.shininessScale = parseFloat(e.target.value);
      document.getElementById("val-shininess").textContent = `${State.cg.shininessScale.toFixed(2)}×`;
    });

    document.getElementById("chk-texture").addEventListener("change", (e) => (State.cg.useTexture = e.target.checked));
    document.getElementById("chk-earth-layers").addEventListener("change", (e) => (State.cg.useEarthLayers = e.target.checked));

    // Texture Filtering (Nearest vs Linear vs Mipmap) — Materi 10
    const filterBtns = [
      document.getElementById("btn-tex-nearest"),
      document.getElementById("btn-tex-linear"),
      document.getElementById("btn-tex-mipmap")
    ];
    filterBtns.forEach((btn) => {
      btn?.addEventListener("click", () => {
        const mode = btn.dataset.filter;
        State.cg.textureFilter = mode;
        filterBtns.forEach((b) => b && b.classList.remove("active"));
        btn.classList.add("active");
        SolarOdyssey.Renderer.updateTextureFiltering(mode);
      });
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
    const list = document.getElementById("team-list");
    if (!list) return;
    list.innerHTML = "";
    teamMembers.forEach((member, idx) => {
      const card = document.createElement("div");
      card.className = "member-card";
      card.innerHTML = `
        <div class="member-card-top">
          <div class="member-badge">#${idx + 1}</div>
          <div class="field-wrap">
            <span class="field-label">Nama Lengkap</span>
            <input class="team-input" data-field="name" data-idx="${idx}" value="${member.name}" />
          </div>
          <div class="field-wrap">
            <span class="field-label">NIM</span>
            <input class="team-input" data-field="nim" data-idx="${idx}" value="${member.nim}" />
          </div>
          <div class="field-wrap">
            <span class="field-label">Multiplier</span>
            <input class="team-input mult-input" type="number" step="0.05" min="0" max="1"
                   data-field="multiplier" data-idx="${idx}" value="${Number(member.multiplier).toFixed(2)}" />
          </div>
        </div>
        <div class="member-card-bottom">
          <span class="field-label">Peran &amp; Rincian Jobdesc</span>
          <textarea class="team-textarea" rows="3" data-field="role" data-idx="${idx}">${member.role}</textarea>
        </div>
      `;
      list.appendChild(card);
    });

    const handleFieldUpdate = (e) => {
      const idx = parseInt(e.target.dataset.idx, 10);
      const field = e.target.dataset.field;
      if (field === "multiplier") {
        let val = parseFloat(e.target.value);
        if (Number.isNaN(val)) val = 1.0;
        val = Math.max(0, Math.min(1, val));
        if (e.type === "change") {
          e.target.value = val.toFixed(2);
        }
        teamMembers[idx].multiplier = val;
      } else {
        teamMembers[idx][field] = e.target.value;
      }
      saveTeam();
    };

    list.querySelectorAll(".team-input, .team-textarea").forEach((el) => {
      el.addEventListener("input", handleFieldUpdate);
      el.addEventListener("change", handleFieldUpdate);
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
        "=== CREDITS & MULTIPLIER KONTRIBUSI TIM — SOLAR ODYSSEY ===",
        "Teknologi: Native WebGL2, GLSL ES 3.00, JavaScript Modular, Canvas 2D Procedural Textures, WebAudio API",
        ""
      ];
      teamMembers.forEach((m, i) => {
        lines.push(`${i + 1}. ${m.name} (NIM: ${m.nim}) | Multiplier: ${Number(m.multiplier).toFixed(2)}`);
        lines.push(`   Peran & Rincian Jobdesc: ${m.role}`);
        lines.push("");
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

  /* ==========================================================================
     3. Interactive Solar System Quiz Modal Logic
     ========================================================================== */
  function bindQuizModal() {
    const modal = document.getElementById("quiz-modal");
    const btnOpen = document.getElementById("btn-open-quiz");
    const btnClose = document.getElementById("btn-close-quiz");
    const btnNext = document.getElementById("btn-next-question");
    const btnQuizFocus3d = document.getElementById("btn-quiz-focus-3d");
    const btnRestart = document.getElementById("btn-restart-quiz");
    const btnFinish = document.getElementById("btn-finish-quiz");

    let currentFocusBodyId = null;

    function detectBodyFromQuestion(q) {
      const text = `${q.options[q.answerIndex] || ""} ${q.explanation || ""} ${q.question || ""}`.toLowerCase();
      const map = [
        { id: "mercury", keys: ["merkurius"] },
        { id: "venus", keys: ["venus"] },
        { id: "earth", keys: ["bumi"] },
        { id: "mars", keys: ["mars", "olympus mons", "phobos", "deimos"] },
        { id: "jupiter", keys: ["jupiter", "ganymede", "europa", "bintik merah"] },
        { id: "saturn", keys: ["saturnus", "titan", "enceladus", "cassini"] },
        { id: "uranus", keys: ["uranus", "miranda", "titania"] },
        { id: "neptune", keys: ["neptunus", "triton"] },
        { id: "sun", keys: ["matahari", "fotosfer", "korona"] }
      ];
      for (const item of map) {
        if (item.keys.some((k) => text.includes(k))) return item.id;
      }
      return null;
    }

    const activeView = document.getElementById("quiz-active-view");
    const resultView = document.getElementById("quiz-result-view");
    const progressText = document.getElementById("quiz-progress-text");
    const progressFill = document.getElementById("quiz-progress-fill");
    const scoreBadge = document.getElementById("quiz-score-badge");
    const categoryTag = document.getElementById("quiz-category-tag");
    const questionText = document.getElementById("quiz-question-text");
    const optionsList = document.getElementById("quiz-options-list");
    const feedbackBox = document.getElementById("quiz-feedback-box");
    const feedbackStatus = document.getElementById("feedback-status");
    const feedbackExplanation = document.getElementById("feedback-explanation");

    let currentQuestions = [];
    let currentIndex = 0;
    let currentScore = 0;
    let correctCount = 0;
    let isAnswered = false;

    function startNewQuiz() {
      currentQuestions = SolarOdyssey.PlanetData.getRandomQuizQuestions(10);
      currentIndex = 0;
      currentScore = 0;
      correctCount = 0;
      isAnswered = false;

      activeView.classList.remove("hidden");
      resultView.classList.add("hidden");
      renderQuestion();
    }

    function renderQuestion() {
      if (currentIndex >= currentQuestions.length) {
        showResults();
        return;
      }

      isAnswered = false;
      const q = currentQuestions[currentIndex];

      progressText.textContent = `Soal ${currentIndex + 1} / ${currentQuestions.length}`;
      progressFill.style.width = `${((currentIndex + 1) / currentQuestions.length) * 100}%`;
      scoreBadge.textContent = `Skor: ${currentScore} / 100`;
      categoryTag.textContent = q.category;
      questionText.textContent = q.question;

      feedbackBox.classList.add("hidden");

      optionsList.innerHTML = "";
      const letters = ["A", "B", "C", "D"];

      q.options.forEach((optText, idx) => {
        const btn = document.createElement("button");
        btn.className = "quiz-opt-btn";
        btn.innerHTML = `<span class="quiz-opt-letter">${letters[idx]}</span><span class="quiz-opt-text">${optText}</span>`;

        btn.addEventListener("click", () => {
          if (isAnswered) return;
          isAnswered = true;

          SolarOdyssey.Audio.playSelectChime();

          const allBtns = optionsList.querySelectorAll(".quiz-opt-btn");
          allBtns.forEach((b) => (b.disabled = true));

          const isCorrect = idx === q.answerIndex;
          if (isCorrect) {
            btn.classList.add("correct");
            currentScore += 10;
            correctCount++;
            feedbackStatus.textContent = "✓ Jawaban Anda Benar!";
            feedbackStatus.className = "feedback-status correct";
          } else {
            btn.classList.add("incorrect");
            if (allBtns[q.answerIndex]) {
              allBtns[q.answerIndex].classList.add("correct");
            }
            feedbackStatus.textContent = "✗ Jawaban Kurang Tepat";
            feedbackStatus.className = "feedback-status incorrect";
          }

          scoreBadge.textContent = `Skor: ${currentScore} / 100`;
          feedbackExplanation.textContent = q.explanation;

          currentFocusBodyId = detectBodyFromQuestion(q);
          if (btnQuizFocus3d) {
            if (currentFocusBodyId) {
              const bInfo = findBodyOrMoon(currentFocusBodyId);
              btnQuizFocus3d.textContent = `Lihat ${bInfo ? bInfo.name : "Planet"} di 3D`;
              btnQuizFocus3d.classList.remove("hidden");
            } else {
              btnQuizFocus3d.classList.add("hidden");
            }
          }

          feedbackBox.classList.remove("hidden");

          if (currentIndex < currentQuestions.length - 1) {
            btnNext.textContent = "Lanjut ke Soal Berikutnya →";
          } else {
            btnNext.textContent = "Lihat Hasil Akhir Kuis →";
          }
        });

        optionsList.appendChild(btn);
      });
    }

    function showResults() {
      activeView.classList.add("hidden");
      resultView.classList.remove("hidden");
      SolarOdyssey.Audio.playSelectChime();

      document.getElementById("result-score-large").textContent = `${currentScore} / 100`;
      document.getElementById("stat-correct-count").textContent = `${correctCount}`;
      document.getElementById("stat-wrong-count").textContent = `${currentQuestions.length - correctCount}`;
      const accuracyPct = Math.round((correctCount / currentQuestions.length) * 100);
      document.getElementById("stat-accuracy").textContent = `${accuracyPct}%`;

      const trophyEl = document.getElementById("result-trophy-icon");
      const gradeEl = document.getElementById("result-grade-badge");
      const titleEl = document.getElementById("result-title");
      const summaryEl = document.getElementById("result-summary");

      if (currentScore === 100) {
        trophyEl.textContent = "🏆";
        gradeEl.textContent = "ASTRONOM UTAMA GALAKSI";
        titleEl.textContent = "Sempurna! Nilai Tertinggi!";
        summaryEl.textContent = "Luar biasa! Anda berhasil menjawab seluruh pertanyaan kuis dengan benar dan menguasai seluruh data astronomi Tata Surya.";
      } else if (currentScore >= 80) {
        trophyEl.textContent = "🚀";
        gradeEl.textContent = "PENJELAJAH ANTARIKSA ULUNG";
        titleEl.textContent = "Pencapaian Sangat Baik!";
        summaryEl.textContent = "Hebat! Anda memiliki pemahaman mendalam tentang orbit, atmosfer planet, dan satelit alami di lingkungan kosmik kita.";
      } else if (currentScore >= 60) {
        trophyEl.textContent = "🔭";
        gradeEl.textContent = "PENGAMAT KOSMIK BERBAKAT";
        titleEl.textContent = "Hasil Cukup Baik!";
        summaryEl.textContent = "Bagus! Anda menguasai banyak fakta penting tentang tata surya. Jelajahi fitur telemetri planet untuk menyempurnakan skor Anda.";
      } else if (currentScore >= 40) {
        trophyEl.textContent = "👨‍🚀";
        gradeEl.textContent = "KADET ANTARIKSA MAGANG";
        titleEl.textContent = "Terus Tingkatkan Pengetahuan!";
        summaryEl.textContent = "Cukup baik! Klik dan inspeksi kartu planet di SOLAR ODYSSEY untuk mempelajari lebih banyak tentang misteri alam semesta.";
      } else {
        trophyEl.textContent = "🪐";
        gradeEl.textContent = "PENJELAJAH PEMULA TATA SURYA";
        titleEl.textContent = "Ayo Coba Lagi!";
        summaryEl.textContent = "Jangan berkecil hati! Eksplorasi setiap planet pada simulasi 3D ini, perhatikan karakteristik uniknya, dan ulangi kuis untuk hasil lebih baik.";
      }
    }

    if (btnOpen) {
      btnOpen.addEventListener("click", () => {
        SolarOdyssey.Audio.playSelectChime();
        startNewQuiz();
        modal.classList.remove("hidden");
      });
    }

    if (btnClose) {
      btnClose.addEventListener("click", () => {
        modal.classList.add("hidden");
      });
    }

    if (btnQuizFocus3d) {
      btnQuizFocus3d.addEventListener("click", () => {
        if (!currentFocusBodyId) return;
        modal.classList.add("hidden");
        selectBody(currentFocusBodyId, false);
      });
    }

    if (btnNext) {
      btnNext.addEventListener("click", () => {
        SolarOdyssey.Audio.playSelectChime();
        currentIndex++;
        if (currentIndex < currentQuestions.length) {
          renderQuestion();
        } else {
          showResults();
        }
      });
    }

    if (btnRestart) {
      btnRestart.addEventListener("click", () => {
        SolarOdyssey.Audio.playSelectChime();
        startNewQuiz();
      });
    }

    if (btnFinish) {
      btnFinish.addEventListener("click", () => {
        modal.classList.add("hidden");
      });
    }
  }

  return {
    init,
    selectBody,
    findBodyOrMoon,
    updateLiveInspector
  };
})();
