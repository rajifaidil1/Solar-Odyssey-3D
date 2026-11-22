/* ==========================================================================
   SOLAR ODYSSEY — Procedural High-Resolution Planet & Ring Texture Generator
   (Materi 10: Texture Mapping, UV Coordinates & Mipmap Filtering)
   ========================================================================== */

SolarOdyssey.Textures = (function () {
  // Deterministic pseudo-random noise for reproducible planetary surfaces
  function hash2(x, y, seed) {
    const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
    return n - Math.floor(n);
  }

  function valueNoise(x, y, seed) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);

    const a = hash2(ix, iy, seed);
    const b = hash2(ix + 1, iy, seed);
    const c = hash2(ix, iy + 1, seed);
    const d = hash2(ix + 1, iy + 1, seed);

    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  }

  function fbmSeamless(u, v, scaleX, scaleY, octaves, seed) {
    // Seamless wrap along U (longitude) using 2D periodic interpolation
    const angle = u * Math.PI * 2;
    const nx = Math.cos(angle) * scaleX * 0.35 + 4.0;
    const nz = Math.sin(angle) * scaleX * 0.35 + 4.0;
    const ny = v * scaleY;

    let sum = 0;
    let amp = 0.5;
    let freq = 1.0;
    for (let i = 0; i < octaves; i++) {
      const n1 = valueNoise(nx * freq, ny * freq, seed + i * 13);
      const n2 = valueNoise(nz * freq, ny * freq, seed + i * 29 + 7);
      sum += amp * ((n1 + n2) * 0.5);
      freq *= 2.05;
      amp *= 0.5;
    }
    return sum;
  }

  function uploadCanvasTexture(gl, canvas, clampS = false) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, clampS ? gl.CLAMP_TO_EDGE : gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return tex;
  }

  function buildPlanetTexture(gl, type) {
    const w = 512;
    const h = 256;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    const img = ctx.createImageData(w, h);
    const data = img.data;

    for (let y = 0; y < h; y++) {
      const v = y / (h - 1);
      const lat = Math.abs(v - 0.5) * 2.0; // 0 at equator, 1 at poles

      for (let x = 0; x < w; x++) {
        const u = x / w;
        const idx = (y * w + x) * 4;
        let r = 128, g = 128, b = 128;

        if (type === "sun") {
          const n = fbmSeamless(u, v, 14, 7, 5, 11);
          const gran = valueNoise(x * 0.25, y * 0.25, 3);
          const heat = Math.min(1, Math.max(0, n * 0.8 + gran * 0.35));
          r = 210 + heat * 45;
          g = 75 + Math.pow(heat, 1.3) * 165;
          b = 8 + Math.pow(heat, 2.4) * 110;
        } else if (type === "mercury") {
          const n = fbmSeamless(u, v, 12, 6, 5, 21);
          const crater = Math.sin(fbmSeamless(u, v, 28, 14, 3, 25) * 18.0) * 0.14;
          const shade = Math.min(1, Math.max(0.15, n * 0.85 + crater));
          r = 115 + shade * 85;
          g = 110 + shade * 80;
          b = 106 + shade * 76;
        } else if (type === "venus") {
          const swirl = fbmSeamless(u + Math.sin(v * 6) * 0.06, v, 8, 5, 5, 31);
          const band = Math.sin(v * 14 + swirl * 5) * 0.08;
          const t = Math.min(1, Math.max(0, swirl + band));
          r = 195 + t * 55;
          g = 148 + t * 62;
          b = 82 + t * 48;
        } else if (type === "earth") {
          const elev = fbmSeamless(u, v, 7, 4, 5, 42);
          const detail = fbmSeamless(u, v, 22, 11, 3, 49);
          if (lat > 0.86 - elev * 0.08) {
            // Polar ice caps
            r = 238; g = 245; b = 252;
          } else if (elev < 0.49) {
            // Deep & shallow oceans
            const depth = Math.max(0, elev / 0.49);
            r = 12 + depth * 28;
            g = 48 + depth * 88;
            b = 125 + depth * 95;
          } else {
            // Continents: lush forests, plains, deserts & mountain peaks
            const landH = (elev - 0.49) / 0.51;
            const arid = Math.max(0, 1 - Math.abs(lat - 0.32) * 4.5);
            r = 42 + arid * 135 + landH * 65 + detail * 25;
            g = 105 + arid * 55 + landH * 45 + detail * 20;
            b = 45 + arid * 35 + landH * 55;
          }
        } else if (type === "moon") {
          const n = fbmSeamless(u, v, 10, 5, 5, 55);
          const maria = smoothStep(0.35, 0.55, n);
          const base = 105 + maria * 95;
          r = base; g = base; b = base * 1.02;
        } else if (type === "mars") {
          const n = fbmSeamless(u, v, 9, 5, 5, 63);
          const darkBasalt = fbmSeamless(u, v, 16, 8, 3, 67);
          if (lat > 0.90) {
            r = 240; g = 235; b = 230;
          } else {
            const t = Math.min(1, Math.max(0, n * 0.75 + darkBasalt * 0.35));
            r = 135 + t * 105;
            g = 56 + t * 65;
            b = 32 + t * 38;
          }
        } else if (type === "jupiter") {
          const turb = fbmSeamless(u, v, 10, 8, 4, 71);
          const bands = Math.sin(v * 26.0 + turb * 4.2);
          const fine = Math.cos(v * 54.0 - turb * 3.0) * 0.25;
          const bVal = bands * 0.75 + fine;

          // Great Red Spot
          const du = (u - 0.62) * 2.0;
          const dv = (v - 0.63) * 4.2;
          const spotDist = Math.hypot(du, dv);
          if (spotDist < 0.24) {
            const s = 1.0 - spotDist / 0.24;
            r = 205 + s * 25;
            g = 95 - s * 22;
            b = 62 - s * 18;
          } else if (bVal > 0.15) {
            // Creamy zones
            r = 216 + bVal * 26;
            g = 198 + bVal * 24;
            b = 172 + bVal * 20;
          } else {
            // Ochre & terracotta belts
            r = 168 + bVal * 35;
            g = 118 + bVal * 32;
            b = 84 + bVal * 24;
          }
        } else if (type === "saturn") {
          const turb = fbmSeamless(u, v, 8, 6, 3, 81);
          const bands = Math.sin(v * 30.0 + turb * 2.0) * 0.5 + 0.5;
          r = 196 + bands * 42;
          g = 174 + bands * 38;
          b = 126 + bands * 34;
        } else if (type === "uranus") {
          const bands = Math.sin(v * 14.0) * 0.08 + fbmSeamless(u, v, 6, 4, 3, 91) * 0.12;
          r = 115 + bands * 45;
          g = 205 + bands * 35;
          b = 224 + bands * 24;
        } else if (type === "neptune") {
          const turb = fbmSeamless(u, v, 9, 5, 4, 101);
          const bands = Math.sin(v * 18.0 + turb * 2.8) * 0.16;
          r = 34 + (turb + bands) * 38;
          g = 78 + (turb + bands) * 65;
          b = 195 + (turb + bands) * 52;
        }

        data[idx]     = Math.min(255, Math.max(0, r));
        data[idx + 1] = Math.min(255, Math.max(0, g));
        data[idx + 2] = Math.min(255, Math.max(0, b));
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);
    return uploadCanvasTexture(gl, canvas, false);
  }

  function buildEarthCloudsTexture(gl) {
    const w = 512, h = 256;
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    const img = ctx.createImageData(w, h);
    const data = img.data;

    for (let y = 0; y < h; y++) {
      const v = y / (h - 1);
      for (let x = 0; x < w; x++) {
        const u = x / w;
        const swirl = fbmSeamless(u + Math.sin(v * 9) * 0.04, v, 9, 5, 5, 115);
        const alpha = smoothStep(0.46, 0.74, swirl) * 255;
        const idx = (y * w + x) * 4;
        data[idx] = alpha;
        data[idx + 1] = alpha;
        data[idx + 2] = alpha;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return uploadCanvasTexture(gl, canvas, false);
  }

  function buildEarthNightTexture(gl) {
    const w = 512, h = 256;
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    const img = ctx.createImageData(w, h);
    const data = img.data;

    for (let y = 0; y < h; y++) {
      const v = y / (h - 1);
      const lat = Math.abs(v - 0.5) * 2.0;
      for (let x = 0; x < w; x++) {
        const u = x / w;
        const elev = fbmSeamless(u, v, 7, 4, 5, 42);
        const city = fbmSeamless(u, v, 36, 18, 3, 131);
        const idx = (y * w + x) * 4;
        if (elev >= 0.50 && lat < 0.72 && city > 0.62) {
          const glow = Math.min(1, (city - 0.62) * 5.2);
          data[idx]     = 255 * glow;
          data[idx + 1] = 195 * glow;
          data[idx + 2] = 85 * glow;
          data[idx + 3] = 255;
        } else {
          data[idx] = 0; data[idx + 1] = 0; data[idx + 2] = 0; data[idx + 3] = 255;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    return uploadCanvasTexture(gl, canvas, false);
  }

  function buildSaturnRingTexture(gl) {
    const w = 512, h = 16;
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    const img = ctx.createImageData(w, h);
    const data = img.data;

    for (let x = 0; x < w; x++) {
      const t = x / (w - 1); // 0 = inner edge, 1 = outer edge
      let alpha = 0.0;
      let r = 212, g = 192, b = 152;

      if (t > 0.05 && t < 0.24) {
        // C Ring (faint inner ring)
        alpha = 0.24 + Math.sin(t * 140) * 0.06;
        r = 168; g = 152; b = 128;
      } else if (t >= 0.24 && t < 0.63) {
        // B Ring (brightest, densest)
        alpha = 0.85 + Math.sin(t * 210) * 0.1;
        r = 228; g = 206; b = 164;
      } else if (t >= 0.63 && t < 0.68) {
        // Cassini Division (dark gap)
        alpha = 0.04;
      } else if (t >= 0.68 && t < 0.94) {
        // A Ring
        alpha = 0.64 + Math.cos(t * 180) * 0.08;
        r = 204; g = 186; b = 150;
      } else if (t >= 0.96 && t < 0.985) {
        // F Ring
        alpha = 0.42;
      }

      for (let y = 0; y < h; y++) {
        const idx = (y * w + x) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = Math.round(alpha * 255);
      }
    }
    ctx.putImageData(img, 0, 0);
    return uploadCanvasTexture(gl, canvas, true);
  }

  function smoothStep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  function createAllTextures(gl) {
    const types = [
      "sun", "mercury", "venus", "earth", "moon",
      "mars", "jupiter", "saturn", "uranus", "neptune"
    ];
    const bank = {};
    for (const t of types) {
      bank[t] = buildPlanetTexture(gl, t);
    }
    bank.earthCloud = buildEarthCloudsTexture(gl);
    bank.earthNight = buildEarthNightTexture(gl);
    bank.saturnRing = buildSaturnRingTexture(gl);
    return bank;
  }

  function updateFiltering(gl, bank, useMipmap) {
    const minFilter = useMipmap ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR;
    for (const key of Object.keys(bank)) {
      gl.bindTexture(gl.TEXTURE_2D, bank[key]);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
    }
  }

  return {
    createAllTextures,
    updateFiltering
  };
})();
