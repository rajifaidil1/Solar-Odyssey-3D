/* ==========================================================================
   SOLAR ODYSSEY — WebGL2 Rendering Pipeline, Camera & Scene Graph
   ========================================================================== */

SolarOdyssey.Renderer = (function () {
  const M = SolarOdyssey.Math3D;
  const State = SolarOdyssey.State;
  const Bodies = SolarOdyssey.PlanetData.BODIES;

  let gl = null;
  let canvas = null;

  // Shader programs & uniform locations
  let progSun = null;
  let progPlanet = null;
  let progRing = null;
  let progGlow = null;
  let progLine = null;
  let progSky = null;

  // Geometries & Textures
  let sphereMesh = null;
  let ringMesh = null;
  let asteroidMesh = null;
  let axesMesh = null;
  let quadMesh = null;
  let orbitMeshes = {};
  let textures = {};

  // Live world positions & model matrices per body
  const bodyTransforms = {};

  // Camera state (initialized to Hero Alignment angle matching the reference picture)
  const camera = {
    mode: "orbit",
    // Orbit parameters
    yaw: -0.18,
    pitch: 0.24,
    distance: 62.0,
    target: M.vec3(26.0, 0.0, 0.0),
    desiredTarget: M.vec3(26.0, 0.0, 0.0),
    desiredDistance: 62.0,
    pos: M.vec3(15.0, 14.0, 60.0),

    // Free-flight spaceship parameters
    shipPos: M.vec3(14.0, 14.0, 62.0),
    shipYaw: -0.18,
    shipPitch: -0.22
  };

  function init(canvasEl) {
    canvas = canvasEl;
    gl = canvas.getContext("webgl2", { antialias: true, alpha: false });
    if (!gl) {
      alert("Browser Anda tidak mendukung WebGL2. Gunakan Chrome, Edge, atau Firefox terbaru.");
      return false;
    }

    const S = SolarOdyssey.Shaders;
    progSun    = S.createProgram(gl, S.STANDARD_VS, S.SUN_FS);
    progPlanet = S.createProgram(gl, S.PLANET_VS, S.PLANET_FS);
    progRing   = S.createProgram(gl, S.STANDARD_VS, S.RING_FS);
    progGlow   = S.createProgram(gl, S.GLOW_VS, S.GLOW_FS);
    progLine   = S.createProgram(gl, S.LINE_VS, S.LINE_FS);
    progSky    = S.createProgram(gl, S.SKY_VS, S.SKY_FS);

    textures = SolarOdyssey.Textures.createAllTextures(gl);

    const G = SolarOdyssey.Geometry;
    sphereMesh   = G.createSphereMesh(gl, State.cg.sphereSegments);
    ringMesh     = G.createRingMesh(gl, 1.32, 2.38, 110);
    asteroidMesh = G.createInstancedAsteroidBelt(gl, 450, 37.5, 42.5);
    axesMesh     = G.createWorldAxesMesh(gl, 115);
    quadMesh     = G.createQuadMesh(gl);

    for (const b of Bodies) {
      if (b.orbitRadius > 0) {
        orbitMeshes[b.id] = G.createOrbitLoopMesh(
          gl,
          b.orbitRadius,
          b.eccentricity || 0.01,
          (b.inclinationDeg || 0) * M.DEG2RAD,
          200
        );
      }
      bodyTransforms[b.id] = {
        pos: M.vec3(b.orbitRadius, 0, 0),
        radius: b.radius,
        model: M.mat4Identity()
      };
    }

    resize();
    return true;
  }

  function rebuildSphereMesh(segments) {
    if (!gl) return;
    SolarOdyssey.Geometry.destroyMesh(gl, sphereMesh);
    sphereMesh = SolarOdyssey.Geometry.createSphereMesh(gl, segments);
  }

  function updateTextureFiltering(filterMode) {
    if (!gl) return;
    SolarOdyssey.Textures.updateFiltering(gl, textures, filterMode);
  }

  function resize() {
    if (!canvas || !gl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(canvas.clientWidth * dpr);
    const h = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function resetHeroCamera() {
    State.selectedBodyId = null;
    camera.yaw = -0.18;
    camera.pitch = 0.24;
    camera.desiredTarget = M.vec3(26.0, 0.0, 0.0);
    camera.desiredDistance = 62.0;
    camera.shipPos = M.vec3(14.0, 14.0, 62.0);
    camera.shipYaw = -0.18;
    camera.shipPitch = -0.22;
  }

  function triggerHeroAlignment() {
    // Align all planets in a dramatic sweeping arc to the right of the Sun
    State.simTime = 0.0;
    State.orbitTime = 0.0;
    State.spinTime = 0.0;
  }

  function focusOnBody(bodyId, closeUp = false) {
    const t = bodyTransforms[bodyId];
    if (!t) return;
    State.selectedBodyId = bodyId;
    camera.desiredTarget = M.vec3(t.pos[0], t.pos[1], t.pos[2]);
    const mult = closeUp ? 3.2 : (bodyId === "sun" ? 3.4 : 5.2);
    camera.desiredDistance = Math.max(2.6, t.radius * mult);
  }

  function computeProjectionMatrix() {
    const aspect = (canvas.width || 1) / (canvas.height || 1);
    const cg = State.cg;
    if (cg.projection === "ortho") {
      const halfH = cg.orthoSize;
      const halfW = halfH * aspect;
      return M.mat4Ortho(-halfW, halfW, -halfH, halfH, -250.0, cg.farPlane);
    }
    return M.mat4Perspective(cg.fov * M.DEG2RAD, aspect, cg.nearPlane, cg.farPlane);
  }

  function computeViewMatrix(dt, keys) {
    // Track locked planet smoothly if selected
    if (State.selectedBodyId && bodyTransforms[State.selectedBodyId]) {
      const p = bodyTransforms[State.selectedBodyId].pos;
      camera.desiredTarget = M.vec3(p[0], p[1], p[2]);
    }

    if (State.cameraMode === "ship") {
      // Spaceship free-flight kinematics (WASD + Q/E + Shift boost)
      const speed = (keys["ShiftLeft"] || keys["ShiftRight"] ? 48.0 : 18.0) * dt;
      const forward = M.vec3(
        Math.sin(camera.shipYaw) * Math.cos(camera.shipPitch),
        Math.sin(camera.shipPitch),
        -Math.cos(camera.shipYaw) * Math.cos(camera.shipPitch)
      );
      const right = M.normalize(M.cross(forward, M.vec3(0, 1, 0)));

      if (keys["KeyW"] || keys["ArrowUp"])    camera.shipPos = M.add(camera.shipPos, M.scale(forward, speed));
      if (keys["KeyS"] || keys["ArrowDown"])  camera.shipPos = M.sub(camera.shipPos, M.scale(forward, speed));
      if (keys["KeyD"] || keys["ArrowRight"]) camera.shipPos = M.add(camera.shipPos, M.scale(right, speed));
      if (keys["KeyA"] || keys["ArrowLeft"])  camera.shipPos = M.sub(camera.shipPos, M.scale(right, speed));
      if (keys["KeyE"] || keys["Space"])      camera.shipPos[1] += speed;
      if (keys["KeyQ"] || keys["KeyC"])       camera.shipPos[1] -= speed;

      camera.pos = M.vec3(camera.shipPos[0], camera.shipPos[1], camera.shipPos[2]);
      const lookTarget = M.add(camera.pos, forward);
      return M.mat4LookAt(camera.pos, lookTarget, M.vec3(0, 1, 0));
    }

    // Smooth Orbit camera interpolation
    const damp = 1.0 - Math.exp(-8.0 * dt);
    camera.target = M.lerpVec3(camera.target, camera.desiredTarget, damp);
    camera.distance = M.lerp(camera.distance, camera.desiredDistance, damp);

    const cosP = Math.cos(camera.pitch);
    const sinP = Math.sin(camera.pitch);
    const sinY = Math.sin(camera.yaw);
    const cosY = Math.cos(camera.yaw);

    camera.pos = M.vec3(
      camera.target[0] + camera.distance * sinY * cosP,
      camera.target[1] + camera.distance * sinP,
      camera.target[2] + camera.distance * cosY * cosP
    );

    // Sync ship position so switching modes feels seamless
    camera.shipPos = M.vec3(camera.pos[0], camera.pos[1], camera.pos[2]);

    return M.mat4LookAt(camera.pos, camera.target, M.vec3(0, 1, 0));
  }

  function updateCelestialTransforms() {
    const tOrbit = State.orbitTime;
    const tSpin = State.spinTime;
    const useTilt = State.cg.useAxialTilt;

    for (const b of Bodies) {
      let x = 0, y = 0, z = 0;
      if (b.orbitRadius > 0) {
        const angle = b.heroAngle + tOrbit * b.orbitSpeed;
        const a = b.orbitRadius;
        const e = b.eccentricity || 0.01;
        const semiMinor = a * Math.sqrt(1 - e * e);
        const inc = (b.inclinationDeg || 0) * M.DEG2RAD;

        x = Math.cos(angle) * a;
        const z0 = Math.sin(angle) * semiMinor;
        y = z0 * Math.sin(inc);
        z = z0 * Math.cos(inc);
      }

      // Build Hierarchical Model Matrix: M = T * R_tilt * R_spin * S (Materi 5)
      let model = M.mat4Identity();
      model = M.mat4Translate(model, [x, y, z]);
      if (useTilt && b.axialTiltDeg) {
        model = M.mat4RotateZ(model, b.axialTiltDeg * M.DEG2RAD);
      }
      model = M.mat4RotateY(model, tSpin * b.spinSpeed);
      model = M.mat4Scale(model, [b.radius, b.radius, b.radius]);

      bodyTransforms[b.id] = {
        pos: M.vec3(x, y, z),
        radius: b.radius,
        model
      };

      // Update child moons (Materi 8: Hierarchical Scene Graph)
      if (b.moons) {
        for (const moon of b.moons) {
          const mAngle = tOrbit * moon.orbitSpeed + 0.6;
          const mx = x + Math.cos(mAngle) * moon.orbitRadius;
          const my = y + Math.sin(mAngle * 0.7) * 0.18;
          const mz = z + Math.sin(mAngle) * moon.orbitRadius;

          let mModel = M.mat4Identity();
          mModel = M.mat4Translate(mModel, [mx, my, mz]);
          mModel = M.mat4RotateY(mModel, tSpin * moon.spinSpeed);
          mModel = M.mat4Scale(mModel, [moon.radius, moon.radius, moon.radius]);

          bodyTransforms[moon.id] = {
            pos: M.vec3(mx, my, mz),
            radius: moon.radius,
            model: mModel
          };
        }
      }
    }
  }

  function getPrimitiveEnum() {
    const mode = State.cg.primitiveMode;
    if (mode === "LINES") return gl.LINES;
    if (mode === "POINTS") return gl.POINTS;
    return gl.TRIANGLES;
  }

  function render(dt, keys) {
    if (!gl) return;
    resize();
    updateCelestialTransforms();

    const cg = State.cg;
    const proj = computeProjectionMatrix();
    const view = computeViewMatrix(dt, keys);
    const invVP = M.mat4Invert(M.mat4Multiply(proj, view));

    let drawCalls = 0;
    let totalVerts = 0;
    let totalTris = 0;

    gl.clearColor(0.01, 0.015, 0.03, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 1. Render Procedural Starfield & Milky Way Skybox
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.useProgram(progSky);
    gl.uniformMatrix4fv(gl.getUniformLocation(progSky, "uInvViewProj"), false, invVP);
    gl.uniform3fv(gl.getUniformLocation(progSky, "uCameraPos"), camera.pos);
    gl.uniform1f(gl.getUniformLocation(progSky, "uTime"), State.simTime);
    gl.bindVertexArray(quadMesh.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    drawCalls++;

    // Configure Depth, Culling & Orientation (Materi 3 & Materi 7)
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    if (cg.backfaceCulling) {
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);
      gl.frontFace(cg.windingOrder === "CW" ? gl.CW : gl.CCW);
    } else {
      gl.disable(gl.CULL_FACE);
    }

    const primType = getPrimitiveEnum();

    // 2. Render World Coordinate Axes (Materi 2)
    if (cg.showAxes) {
      gl.useProgram(progLine);
      gl.uniformMatrix4fv(gl.getUniformLocation(progLine, "uModel"), false, M.mat4Identity());
      gl.uniformMatrix4fv(gl.getUniformLocation(progLine, "uView"), false, view);
      gl.uniformMatrix4fv(gl.getUniformLocation(progLine, "uProjection"), false, proj);
      gl.uniform1f(gl.getUniformLocation(progLine, "uAlpha"), 0.55);
      gl.uniform3fv(gl.getUniformLocation(progLine, "uTint"), [1, 1, 1]);
      gl.bindVertexArray(axesMesh.vao);
      gl.drawArrays(gl.LINES, 0, axesMesh.vertexCount);
      drawCalls++;
    }

    // 3. Render Elliptical Orbit Lines
    if (cg.showOrbits) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(progLine);
      gl.uniformMatrix4fv(gl.getUniformLocation(progLine, "uModel"), false, M.mat4Identity());
      gl.uniformMatrix4fv(gl.getUniformLocation(progLine, "uView"), false, view);
      gl.uniformMatrix4fv(gl.getUniformLocation(progLine, "uProjection"), false, proj);

      for (const b of Bodies) {
        if (!orbitMeshes[b.id]) continue;
        const isSel = State.selectedBodyId === b.id;
        gl.uniform1f(gl.getUniformLocation(progLine, "uAlpha"), isSel ? 0.85 : 0.32);
        gl.uniform3fv(
          gl.getUniformLocation(progLine, "uTint"),
          isSel ? [0.4, 0.88, 1.0] : [0.85, 0.90, 1.0]
        );
        gl.bindVertexArray(orbitMeshes[b.id].vao);
        gl.drawArrays(gl.LINE_LOOP, 0, orbitMeshes[b.id].vertexCount);
        drawCalls++;
      }
      gl.disable(gl.BLEND);
    }

    // 4. Render Sun (Animated FBM Plasma Shader)
    const sunTr = bodyTransforms["sun"];
    gl.useProgram(progSun);
    gl.uniformMatrix4fv(gl.getUniformLocation(progSun, "uModel"), false, sunTr.model);
    gl.uniformMatrix4fv(gl.getUniformLocation(progSun, "uView"), false, view);
    gl.uniformMatrix4fv(gl.getUniformLocation(progSun, "uProjection"), false, proj);
    gl.uniform1i(gl.getUniformLocation(progSun, "uUseInstancing"), 0);
    gl.uniform1f(gl.getUniformLocation(progSun, "uPointSize"), 3.0);
    gl.uniform1f(gl.getUniformLocation(progSun, "uTime"), State.simTime);
    gl.uniform3fv(gl.getUniformLocation(progSun, "uCameraPos"), camera.pos);
    gl.uniform1i(gl.getUniformLocation(progSun, "uUseTexture"), cg.useTexture ? 1 : 0);
    gl.uniform1f(gl.getUniformLocation(progSun, "uSunIntensity"), cg.sunIntensity);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures.sun);
    gl.uniform1i(gl.getUniformLocation(progSun, "uTexBase"), 0);

    gl.bindVertexArray(sphereMesh.vao);
    gl.drawElements(primType, sphereMesh.indexCount, gl.UNSIGNED_INT, 0);
    drawCalls++;
    totalVerts += sphereMesh.vertexCount;
    totalTris += sphereMesh.triangleCount;

    // 5. Render All 8 Planets & Moons (Blinn-Phong + Atmosphere + Earth Night/Clouds)
    gl.useProgram(progPlanet);
    gl.uniformMatrix4fv(gl.getUniformLocation(progPlanet, "uView"), false, view);
    gl.uniformMatrix4fv(gl.getUniformLocation(progPlanet, "uProjection"), false, proj);
    gl.uniform1i(gl.getUniformLocation(progPlanet, "uUseInstancing"), 0);
    gl.uniform1f(gl.getUniformLocation(progPlanet, "uPointSize"), 3.0);
    gl.uniform3fv(gl.getUniformLocation(progPlanet, "uLightPos"), [0, 0, 0]);
    gl.uniform3fv(gl.getUniformLocation(progPlanet, "uCameraPos"), camera.pos);
    gl.uniform1f(gl.getUniformLocation(progPlanet, "uSunIntensity"), cg.sunIntensity);
    gl.uniform1f(gl.getUniformLocation(progPlanet, "uTime"), State.simTime);

    const shadingInt = cg.shadingMode === "gouraud" ? 1 : (cg.shadingMode === "flat" ? 2 : 0);
    gl.uniform1i(gl.getUniformLocation(progPlanet, "uUseTexture"), cg.useTexture ? 1 : 0);
    gl.uniform1i(gl.getUniformLocation(progPlanet, "uUseEarthLayers"), cg.useEarthLayers ? 1 : 0);
    gl.uniform1i(gl.getUniformLocation(progPlanet, "uShadingMode"), shadingInt);
    gl.uniform1i(gl.getUniformLocation(progPlanet, "uUseAmbient"), cg.useAmbient ? 1 : 0);
    gl.uniform1i(gl.getUniformLocation(progPlanet, "uUseDiffuse"), cg.useDiffuse ? 1 : 0);
    gl.uniform1i(gl.getUniformLocation(progPlanet, "uUseSpecular"), cg.useSpecular ? 1 : 0);
    gl.uniform1i(gl.getUniformLocation(progPlanet, "uUseAtmosphere"), cg.useAtmosphere ? 1 : 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures.earthCloud);
    gl.uniform1i(gl.getUniformLocation(progPlanet, "uTexCloud"), 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, textures.earthNight);
    gl.uniform1i(gl.getUniformLocation(progPlanet, "uTexNight"), 2);

    const shinScale = cg.shininessScale || 1.0;

    for (const b of Bodies) {
      if (b.isSun) continue;
      const tr = bodyTransforms[b.id];

      gl.uniformMatrix4fv(gl.getUniformLocation(progPlanet, "uModel"), false, tr.model);
      gl.uniform3fv(gl.getUniformLocation(progPlanet, "uBaseColor"), b.baseColor);
      gl.uniform3fv(gl.getUniformLocation(progPlanet, "uAtmoColor"), b.atmoColor);
      gl.uniform1f(gl.getUniformLocation(progPlanet, "uAtmoStrength"), b.atmoStrength);
      gl.uniform1f(gl.getUniformLocation(progPlanet, "uShininess"), Math.max(2.0, Math.min(256.0, b.shininess * shinScale)));
      gl.uniform1f(gl.getUniformLocation(progPlanet, "uSpecularStrength"), b.specularStrength);
      gl.uniform1i(gl.getUniformLocation(progPlanet, "uHasEarthLayers"), b.hasEarthLayers ? 1 : 0);
      gl.uniform1i(gl.getUniformLocation(progPlanet, "uIsSelected"), State.selectedBodyId === b.id ? 1 : 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures[b.textureKey]);
      gl.uniform1i(gl.getUniformLocation(progPlanet, "uTexBase"), 0);

      gl.bindVertexArray(sphereMesh.vao);
      gl.drawElements(primType, sphereMesh.indexCount, gl.UNSIGNED_INT, 0);
      drawCalls++;
      totalVerts += sphereMesh.vertexCount;
      totalTris += sphereMesh.triangleCount;

      // Render Moons
      if (b.moons) {
        for (const moon of b.moons) {
          const mTr = bodyTransforms[moon.id];
          gl.uniformMatrix4fv(gl.getUniformLocation(progPlanet, "uModel"), false, mTr.model);
          gl.uniform3fv(gl.getUniformLocation(progPlanet, "uBaseColor"), moon.baseColor);
          gl.uniform1f(gl.getUniformLocation(progPlanet, "uAtmoStrength"), 0.0);
          gl.uniform1f(gl.getUniformLocation(progPlanet, "uShininess"), 10.0);
          gl.uniform1f(gl.getUniformLocation(progPlanet, "uSpecularStrength"), 0.08);
          gl.uniform1i(gl.getUniformLocation(progPlanet, "uHasEarthLayers"), 0);
          gl.uniform1i(gl.getUniformLocation(progPlanet, "uIsSelected"), State.selectedBodyId === moon.id ? 1 : 0);

          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, textures[moon.textureKey]);
          gl.drawElements(primType, sphereMesh.indexCount, gl.UNSIGNED_INT, 0);
          drawCalls++;
          totalVerts += sphereMesh.vertexCount;
          totalTris += sphereMesh.triangleCount;
        }
      }
    }

    // 6. Render Instanced Asteroid Belt (450 3D rocks in 1 draw call!)
    if (cg.showAsteroids) {
      gl.uniform1i(gl.getUniformLocation(progPlanet, "uUseInstancing"), 1);
      gl.uniform3fv(gl.getUniformLocation(progPlanet, "uBaseColor"), [0.58, 0.54, 0.50]);
      gl.uniform1f(gl.getUniformLocation(progPlanet, "uAtmoStrength"), 0.0);
      gl.uniform1f(gl.getUniformLocation(progPlanet, "uShininess"), 8.0);
      gl.uniform1f(gl.getUniformLocation(progPlanet, "uSpecularStrength"), 0.06);
      gl.uniform1i(gl.getUniformLocation(progPlanet, "uHasEarthLayers"), 0);
      gl.uniform1i(gl.getUniformLocation(progPlanet, "uIsSelected"), 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures.mercury);
      gl.bindVertexArray(asteroidMesh.vao);
      gl.drawElementsInstanced(
        primType,
        asteroidMesh.indexCount,
        gl.UNSIGNED_INT,
        0,
        asteroidMesh.instanceCount
      );
      drawCalls++;
      totalVerts += asteroidMesh.vertexCount * asteroidMesh.instanceCount;
      totalTris += asteroidMesh.triangleCount * asteroidMesh.instanceCount;
    }

    // 7. Render Saturn's Rings with Analytic Planet Shadow Casting
    const saturn = SolarOdyssey.PlanetData.getBodyById("saturn");
    const saturnTr = bodyTransforms["saturn"];
    if (saturn && saturnTr) {
      gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      let ringModel = M.mat4Identity();
      ringModel = M.mat4Translate(ringModel, saturnTr.pos);
      if (cg.useAxialTilt) {
        ringModel = M.mat4RotateZ(ringModel, saturn.axialTiltDeg * M.DEG2RAD);
      }
      ringModel = M.mat4Scale(ringModel, [saturn.radius, saturn.radius, saturn.radius]);

      gl.useProgram(progRing);
      gl.uniformMatrix4fv(gl.getUniformLocation(progRing, "uModel"), false, ringModel);
      gl.uniformMatrix4fv(gl.getUniformLocation(progRing, "uView"), false, view);
      gl.uniformMatrix4fv(gl.getUniformLocation(progRing, "uProjection"), false, proj);
      gl.uniform1i(gl.getUniformLocation(progRing, "uUseInstancing"), 0);
      gl.uniform3fv(gl.getUniformLocation(progRing, "uPlanetCenter"), saturnTr.pos);
      gl.uniform1f(gl.getUniformLocation(progRing, "uPlanetRadius"), saturn.radius);
      gl.uniform3fv(gl.getUniformLocation(progRing, "uLightPos"), [0, 0, 0]);
      gl.uniform1f(gl.getUniformLocation(progRing, "uSunIntensity"), cg.sunIntensity);
      gl.uniform1i(gl.getUniformLocation(progRing, "uUseTexture"), cg.useTexture ? 1 : 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures.saturnRing);
      gl.uniform1i(gl.getUniformLocation(progRing, "uTexRing"), 0);

      gl.bindVertexArray(ringMesh.vao);
      gl.drawElements(primType, ringMesh.indexCount, gl.UNSIGNED_SHORT, 0);
      drawCalls++;
      totalVerts += ringMesh.vertexCount;
      totalTris += ringMesh.triangleCount;
    }

    // 8. Render Additive Solar Corona Halo Billboard
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.depthMask(false);
    gl.useProgram(progGlow);
    gl.uniformMatrix4fv(gl.getUniformLocation(progGlow, "uView"), false, view);
    gl.uniformMatrix4fv(gl.getUniformLocation(progGlow, "uProjection"), false, proj);
    gl.uniform3fv(gl.getUniformLocation(progGlow, "uCenter"), [0, 0, 0]);
    gl.uniform1f(gl.getUniformLocation(progGlow, "uRadius"), 17.5);
    gl.uniform3fv(gl.getUniformLocation(progGlow, "uColor"), [1.0, 0.56, 0.14]);
    gl.uniform1f(gl.getUniformLocation(progGlow, "uAlpha"), 0.65);

    gl.bindVertexArray(quadMesh.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    drawCalls++;

    gl.depthMask(true);
    gl.disable(gl.BLEND);

    // Update GPU stats (Materi 4)
    State.stats.vaoCount = 3 + Object.keys(orbitMeshes).length + 2;
    State.stats.vboCount = State.stats.vaoCount * 2;
    State.stats.totalVertices = totalVerts;
    State.stats.totalTriangles = totalTris;
    State.stats.drawCalls = drawCalls;
  }

  // Pick celestial body under mouse cursor (clientX, clientY)
  function pickBodyAtScreen(clientX, clientY) {
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = 1 - ((clientY - rect.top) / rect.height) * 2;

    const proj = computeProjectionMatrix();
    const aspect = (canvas.width || 1) / (canvas.height || 1);
    const cosP = Math.cos(camera.pitch);
    const sinP = Math.sin(camera.pitch);
    const sinY = Math.sin(camera.yaw);
    const cosY = Math.cos(camera.yaw);
    const camPos = State.cameraMode === "ship"
      ? camera.shipPos
      : M.vec3(
          camera.target[0] + camera.distance * sinY * cosP,
          camera.target[1] + camera.distance * sinP,
          camera.target[2] + camera.distance * cosY * cosP
        );
    const lookTgt = State.cameraMode === "ship"
      ? M.add(camPos, M.vec3(
          Math.sin(camera.shipYaw) * Math.cos(camera.shipPitch),
          Math.sin(camera.shipPitch),
          -Math.cos(camera.shipYaw) * Math.cos(camera.shipPitch)
        ))
      : camera.target;
    const view = M.mat4LookAt(camPos, lookTgt, M.vec3(0, 1, 0));

    const ray = M.screenToWorldRay(ndcX, ndcY, proj, view);
    State.stats.rayOrigin = [ray.origin[0], ray.origin[1], ray.origin[2]];
    State.stats.rayDir = [ray.dir[0], ray.dir[1], ray.dir[2]];

    let closestId = null;
    let closestDist = Infinity;

    for (const id of Object.keys(bodyTransforms)) {
      const item = bodyTransforms[id];
      // Add slight hit padding so smaller distant planets are effortless to click
      const hitRadius = item.radius * 1.28;
      const t = M.raySphereIntersect(ray.origin, ray.dir, item.pos, hitRadius);
      if (t !== null && t < closestDist) {
        closestDist = t;
        closestId = id;
      }
    }
    return closestId;
  }

  function getBodyTransform(id) {
    return bodyTransforms[id] || null;
  }

  return {
    init,
    render,
    camera,
    resetHeroCamera,
    triggerHeroAlignment,
    focusOnBody,
    pickBodyAtScreen,
    rebuildSphereMesh,
    updateTextureFiltering,
    getBodyTransform
  };
})();
