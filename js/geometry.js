/* ==========================================================================
   SOLAR ODYSSEY — Parametric 3D Mesh Builders & WebGL2 VAO/VBO Management
   (Materi 2: World Coordinate Axes; Materi 3: Curved Object Tessellation;
    Materi 4: VAO, VBO, EBO; Materi 7: Triangulation & CCW Orientation)
   ========================================================================== */

SolarOdyssey.Geometry = (function () {
  // 1. Parametric UV Sphere with Counter-Clockwise (CCW) outward-facing triangles
  function createSphereMesh(gl, segments = 48) {
    const rings = Math.max(8, Math.floor(segments / 2));
    const slices = Math.max(12, segments);

    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    for (let y = 0; y <= rings; y++) {
      const v = y / rings;
      const phi = v * Math.PI;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      for (let x = 0; x <= slices; x++) {
        const u = x / slices;
        const theta = u * Math.PI * 2.0;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        const nx = -cosTheta * sinPhi;
        const ny = cosPhi;
        const nz = sinTheta * sinPhi;

        positions.push(nx, ny, nz);
        normals.push(nx, ny, nz);
        uvs.push(u, v);
      }
    }

    const stride = slices + 1;
    for (let y = 0; y < rings; y++) {
      for (let x = 0; x < slices; x++) {
        const i0 = y * stride + x;
        const i1 = i0 + 1;
        const i2 = (y + 1) * stride + x;
        const i3 = i2 + 1;

        // CCW winding order when viewed from outside the sphere
        indices.push(i0, i2, i1);
        indices.push(i1, i2, i3);
      }
    }

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vboPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    const vboNorm = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboNorm);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

    const vboUv = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboUv);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);

    const ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);

    gl.bindVertexArray(null);

    return {
      vao,
      buffers: [vboPos, vboNorm, vboUv, ebo],
      vertexCount: positions.length / 3,
      indexCount: indices.length,
      triangleCount: indices.length / 3
    };
  }

  function destroyMesh(gl, mesh) {
    if (!mesh) return;
    gl.deleteVertexArray(mesh.vao);
    for (const b of mesh.buffers) gl.deleteBuffer(b);
  }

  // 2. Annulus Ring Mesh (for Saturn & Uranus)
  function createRingMesh(gl, innerRadius = 1.35, outerRadius = 2.45, segments = 96) {
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const angle = u * Math.PI * 2.0;
      const c = Math.cos(angle);
      const s = Math.sin(angle);

      positions.push(c * innerRadius, 0, s * innerRadius);
      normals.push(0, 1, 0);
      uvs.push(0.0, u);

      positions.push(c * outerRadius, 0, s * outerRadius);
      normals.push(0, 1, 0);
      uvs.push(1.0, u);
    }

    for (let i = 0; i < segments; i++) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vboPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    const vboNorm = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboNorm);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

    const vboUv = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboUv);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);

    const ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.bindVertexArray(null);

    return {
      vao,
      buffers: [vboPos, vboNorm, vboUv, ebo],
      vertexCount: positions.length / 3,
      indexCount: indices.length,
      triangleCount: indices.length / 3
    };
  }

  // 3. Instanced Asteroid Belt Mesh (Materi 8: Procedural 3D Modeling + Hardware Instancing)
  function createInstancedAsteroidBelt(gl, count = 450, innerR = 37.5, outerR = 42.5) {
    // Low-poly faceted asteroid rock sphere
    const base = createSphereMesh(gl, 10);
    const matrices = new Float32Array(count * 16);
    const M = SolarOdyssey.Math3D;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.sin(i * 17.3) * 0.15);
      const radius = innerR + ((Math.sin(i * 91.7) * 0.5 + 0.5) * (outerR - innerR));
      const yOffset = Math.sin(i * 43.1) * 1.15;
      const sx = 0.12 + (i % 7) * 0.032;
      const sy = sx * (0.65 + (i % 3) * 0.22);
      const sz = sx * (0.75 + (i % 5) * 0.14);

      let m = M.mat4Identity();
      m = M.mat4Translate(m, [Math.cos(angle) * radius, yOffset, Math.sin(angle) * radius]);
      m = M.mat4RotateY(m, i * 1.37);
      m = M.mat4RotateX(m, i * 0.83);
      m = M.mat4Scale(m, [sx, sy, sz]);
      matrices.set(m, i * 16);
    }

    gl.bindVertexArray(base.vao);
    const instanceVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceVbo);
    gl.bufferData(gl.ARRAY_BUFFER, matrices, gl.STATIC_DRAW);

    for (let col = 0; col < 4; col++) {
      const loc = 3 + col;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 64, col * 16);
      gl.vertexAttribDivisor(loc, 1);
    }

    gl.bindVertexArray(null);
    base.buffers.push(instanceVbo);
    base.instanceCount = count;
    return base;
  }

  // 4. Elliptical Orbit Loop Line Mesh
  function createOrbitLoopMesh(gl, semiMajor, eccentricity = 0.02, inclinationRad = 0, segments = 180) {
    const positions = [];
    const colors = [];
    const semiMinor = semiMajor * Math.sqrt(1 - eccentricity * eccentricity);

    for (let i = 0; i < segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const x = Math.cos(t) * semiMajor;
      const z0 = Math.sin(t) * semiMinor;
      const y = z0 * Math.sin(inclinationRad);
      const z = z0 * Math.cos(inclinationRad);

      positions.push(x, y, z);
      colors.push(0.75, 0.82, 0.95);
    }

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vboPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    const vboCol = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboCol);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);

    return {
      vao,
      buffers: [vboPos, vboCol],
      vertexCount: segments
    };
  }

  // 5. World Coordinate Axes (X=Red, Y=Green, Z=Blue) — Materi 2
  function createWorldAxesMesh(gl, len = 110) {
    const positions = [
      -len, 0, 0,   len, 0, 0,
      0, -len * 0.45, 0,   0, len * 0.45, 0,
      0, 0, -len,   0, 0, len
    ];
    const colors = [
      1.0, 0.25, 0.25,   1.0, 0.25, 0.25, // +X Red
      0.25, 0.95, 0.45,  0.25, 0.95, 0.45, // +Y Green
      0.28, 0.62, 1.0,   0.28, 0.62, 1.0   // +Z Blue
    ];

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vboPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    const vboCol = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboCol);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);

    return {
      vao,
      buffers: [vboPos, vboCol],
      vertexCount: 6
    };
  }

  // 6. Fullscreen Quad for Starfield Skybox & Billboard Quad for Corona Glow
  function createQuadMesh(gl) {
    const verts = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ]);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    return { vao, buffers: [vbo], vertexCount: 4 };
  }

  return {
    createSphereMesh,
    destroyMesh,
    createRingMesh,
    createInstancedAsteroidBelt,
    createOrbitLoopMesh,
    createWorldAxesMesh,
    createQuadMesh
  };
})();
