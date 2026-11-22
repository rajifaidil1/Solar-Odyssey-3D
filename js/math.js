/* ==========================================================================
   SOLAR ODYSSEY — 3D Linear Algebra, Matrices & Ray-Sphere Intersection
   (Materi 2: Orthographic/Perspective Projection, World Coordinates;
    Materi 4: Mouse 3D Raycasting; Materi 5: Transformation Matrices)
   ========================================================================== */

SolarOdyssey.Math3D = (function () {
  const DEG2RAD = Math.PI / 180;

  function vec3(x = 0, y = 0, z = 0) {
    return new Float32Array([x, y, z]);
  }

  function add(a, b) {
    return vec3(a[0] + b[0], a[1] + b[1], a[2] + b[2]);
  }

  function sub(a, b) {
    return vec3(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  }

  function scale(a, s) {
    return vec3(a[0] * s, a[1] * s, a[2] * s);
  }

  function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  function cross(a, b) {
    return vec3(
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    );
  }

  function length(a) {
    return Math.hypot(a[0], a[1], a[2]);
  }

  function normalize(a) {
    const len = length(a) || 1;
    return vec3(a[0] / len, a[1] / len, a[2] / len);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpVec3(a, b, t) {
    return vec3(
      lerp(a[0], b[0], t),
      lerp(a[1], b[1], t),
      lerp(a[2], b[2], t)
    );
  }

  // Column-major 4x4 Matrix (WebGL standard)
  function mat4Identity() {
    const m = new Float32Array(16);
    m[0] = 1; m[5] = 1; m[10] = 1; m[15] = 1;
    return m;
  }

  function mat4Multiply(a, b) {
    const out = new Float32Array(16);
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 4; r++) {
        out[c * 4 + r] =
          a[0 * 4 + r] * b[c * 4 + 0] +
          a[1 * 4 + r] * b[c * 4 + 1] +
          a[2 * 4 + r] * b[c * 4 + 2] +
          a[3 * 4 + r] * b[c * 4 + 3];
      }
    }
    return out;
  }

  function mat4Translate(m, v) {
    const t = mat4Identity();
    t[12] = v[0];
    t[13] = v[1];
    t[14] = v[2];
    return mat4Multiply(m, t);
  }

  function mat4Scale(m, v) {
    const s = mat4Identity();
    s[0] = v[0];
    s[5] = v[1];
    s[10] = v[2];
    return mat4Multiply(m, s);
  }

  function mat4RotateX(m, rad) {
    const c = Math.cos(rad), s = Math.sin(rad);
    const r = mat4Identity();
    r[5] = c; r[6] = s;
    r[9] = -s; r[10] = c;
    return mat4Multiply(m, r);
  }

  function mat4RotateY(m, rad) {
    const c = Math.cos(rad), s = Math.sin(rad);
    const r = mat4Identity();
    r[0] = c; r[2] = -s;
    r[8] = s; r[10] = c;
    return mat4Multiply(m, r);
  }

  function mat4RotateZ(m, rad) {
    const c = Math.cos(rad), s = Math.sin(rad);
    const r = mat4Identity();
    r[0] = c; r[1] = s;
    r[4] = -s; r[5] = c;
    return mat4Multiply(m, r);
  }

  function mat4Perspective(fovRad, aspect, near, far) {
    const f = 1.0 / Math.tan(fovRad * 0.5);
    const nf = 1.0 / (near - far);
    const out = new Float32Array(16);
    out[0] = f / aspect;
    out[5] = f;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[14] = 2 * far * near * nf;
    return out;
  }

  function mat4Ortho(left, right, bottom, top, near, far) {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);
    const out = new Float32Array(16);
    out[0] = -2 * lr;
    out[5] = -2 * bt;
    out[10] = 2 * nf;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
  }

  function mat4LookAt(eye, target, up) {
    const zAxis = normalize(sub(eye, target));
    const xAxis = normalize(cross(up, zAxis));
    const yAxis = cross(zAxis, xAxis);

    const out = mat4Identity();
    out[0] = xAxis[0]; out[4] = xAxis[1]; out[8]  = xAxis[2]; out[12] = -dot(xAxis, eye);
    out[1] = yAxis[0]; out[5] = yAxis[1]; out[9]  = yAxis[2]; out[13] = -dot(yAxis, eye);
    out[2] = zAxis[0]; out[6] = zAxis[1]; out[10] = zAxis[2]; out[14] = -dot(zAxis, eye);
    return out;
  }

  function mat4Invert(m) {
    const out = new Float32Array(16);
    const m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3];
    const m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7];
    const m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11];
    const m30 = m[12], m31 = m[13], m32 = m[14], m33 = m[15];

    const b00 = m00 * m11 - m01 * m10;
    const b01 = m00 * m12 - m02 * m10;
    const b02 = m00 * m13 - m03 * m10;
    const b03 = m01 * m12 - m02 * m11;
    const b04 = m01 * m13 - m03 * m11;
    const b05 = m02 * m13 - m03 * m12;
    const b06 = m20 * m31 - m21 * m30;
    const b07 = m20 * m32 - m22 * m30;
    const b08 = m20 * m33 - m23 * m30;
    const b09 = m21 * m32 - m22 * m31;
    const b10 = m21 * m33 - m23 * m31;
    const b11 = m22 * m33 - m23 * m32;

    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) return mat4Identity();
    det = 1.0 / det;

    out[0] = (m11 * b11 - m12 * b10 + m13 * b09) * det;
    out[1] = (m02 * b10 - m01 * b11 - m03 * b09) * det;
    out[2] = (m31 * b05 - m32 * b04 + m33 * b03) * det;
    out[3] = (m22 * b04 - m21 * b05 - m23 * b03) * det;
    out[4] = (m12 * b08 - m10 * b11 - m13 * b07) * det;
    out[5] = (m00 * b11 - m02 * b08 + m03 * b07) * det;
    out[6] = (m32 * b02 - m30 * b05 - m33 * b01) * det;
    out[7] = (m20 * b05 - m22 * b02 + m23 * b01) * det;
    out[8] = (m10 * b10 - m11 * b08 + m13 * b06) * det;
    out[9] = (m01 * b08 - m00 * b10 - m03 * b06) * det;
    out[10] = (m30 * b04 - m31 * b02 + m33 * b00) * det;
    out[11] = (m21 * b02 - m20 * b04 - m23 * b00) * det;
    out[12] = (m11 * b07 - m10 * b09 - m12 * b06) * det;
    out[13] = (m00 * b09 - m01 * b07 + m02 * b06) * det;
    out[14] = (m31 * b01 - m30 * b03 - m32 * b00) * det;
    out[15] = (m20 * b03 - m21 * b01 + m22 * b00) * det;
    return out;
  }

  function transformMat4Vec4(m, v) {
    return [
      m[0] * v[0] + m[4] * v[1] + m[8]  * v[2] + m[12] * v[3],
      m[1] * v[0] + m[5] * v[1] + m[9]  * v[2] + m[13] * v[3],
      m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],
      m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3]
    ];
  }

  // Unproject Normalized Device Coordinates (ndcX, ndcY) into a 3D World Ray
  function screenToWorldRay(ndcX, ndcY, projMat, viewMat) {
    const invVP = mat4Invert(mat4Multiply(projMat, viewMat));
    const nearClip = transformMat4Vec4(invVP, [ndcX, ndcY, -1.0, 1.0]);
    const farClip  = transformMat4Vec4(invVP, [ndcX, ndcY,  1.0, 1.0]);

    const nearW = nearClip[3] || 1;
    const farW  = farClip[3]  || 1;

    const origin = vec3(nearClip[0] / nearW, nearClip[1] / nearW, nearClip[2] / nearW);
    const farPt  = vec3(farClip[0] / farW, farClip[1] / farW, farClip[2] / farW);
    const dir = normalize(sub(farPt, origin));
    return { origin, dir };
  }

  // Analytic Ray-Sphere intersection returning nearest positive t or null
  function raySphereIntersect(rayOrigin, rayDir, center, radius) {
    const oc = sub(rayOrigin, center);
    const b = dot(oc, rayDir);
    const c = dot(oc, oc) - radius * radius;
    const h = b * b - c;
    if (h < 0.0) return null;
    const sqrtH = Math.sqrt(h);
    let t = -b - sqrtH;
    if (t < 0.0) t = -b + sqrtH;
    return t >= 0.0 ? t : null;
  }

  function formatMat4(m) {
    const rows = [];
    for (let r = 0; r < 4; r++) {
      const vals = [];
      for (let c = 0; c < 4; c++) {
        const v = m[c * 4 + r];
        vals.push((v >= 0 ? " " : "") + v.toFixed(2).padStart(5, " "));
      }
      rows.push("[ " + vals.join("  ") + " ]");
    }
    return rows.join("\n");
  }

  return {
    DEG2RAD,
    vec3,
    add,
    sub,
    scale,
    dot,
    cross,
    length,
    normalize,
    lerp,
    lerpVec3,
    mat4Identity,
    mat4Multiply,
    mat4Translate,
    mat4Scale,
    mat4RotateX,
    mat4RotateY,
    mat4RotateZ,
    mat4Perspective,
    mat4Ortho,
    mat4LookAt,
    mat4Invert,
    transformMat4Vec4,
    screenToWorldRay,
    raySphereIntersect,
    formatMat4
  };
})();
