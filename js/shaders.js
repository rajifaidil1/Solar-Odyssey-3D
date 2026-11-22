/* ==========================================================================
   SOLAR ODYSSEY — GLSL ES 3.00 Vertex & Fragment Shaders
   (Materi 6: Smooth vs Flat Normal Interpolation;
    Materi 9: Blinn-Phong Illumination & Fresnel Atmosphere;
    Materi 10: Multi-layer UV Texture Mapping & Ring Shadowing)
   ========================================================================== */

SolarOdyssey.Shaders = (function () {
  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error("GLSL Compile Error: " + log);
    }
    return shader;
  }

  function createProgram(gl, vsSrc, fsSrc) {
    const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(prog);
      gl.deleteProgram(prog);
      throw new Error("GLSL Link Error: " + log);
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return prog;
  }

  // 1. Standard Mesh Vertex Shader (supports instancing via uUseInstancing)
  const STANDARD_VS = `#version 300 es
  precision highp float;

  layout(location = 0) in vec3 aPosition;
  layout(location = 1) in vec3 aNormal;
  layout(location = 2) in vec2 aUv;
  layout(location = 3) in mat4 aInstanceModel;

  uniform mat4 uModel;
  uniform mat4 uView;
  uniform mat4 uProjection;
  uniform bool uUseInstancing;
  uniform float uPointSize;

  out vec3 vWorldPos;
  out vec3 vNormal;
  out vec2 vUv;

  void main() {
    mat4 modelMat = uUseInstancing ? aInstanceModel : uModel;
    vec4 worldPos = modelMat * vec4(aPosition, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = mat3(modelMat) * aNormal;
    vUv = aUv;
    gl_Position = uProjection * uView * worldPos;
    gl_PointSize = uPointSize;
  }`;

  // 2. Sun FBM Animated Plasma & Limb Corona Fragment Shader
  const SUN_FS = `#version 300 es
  precision highp float;

  in vec3 vWorldPos;
  in vec3 vNormal;
  in vec2 vUv;

  uniform sampler2D uTexBase;
  uniform float uTime;
  uniform vec3 uCameraPos;
  uniform bool uUseTexture;
  uniform float uSunIntensity;

  out vec4 fragColor;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec3(0.15, -0.11, 0.08);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(uCameraPos - vWorldPos);
    float ndotv = max(dot(N, V), 0.0);

    vec3 baseTex = uUseTexture ? texture(uTexBase, vUv).rgb : vec3(1.0, 0.55, 0.1);
    float turb = fbm(N * 5.2 + vec3(uTime * 0.18, -uTime * 0.14, uTime * 0.11));
    float flare = fbm(N * 11.0 - vec3(uTime * 0.28));

    vec3 hotCore = vec3(1.0, 0.96, 0.72);
    vec3 midPlasma = mix(vec3(1.0, 0.48, 0.05), baseTex * 1.35, 0.55);
    vec3 darkSpot = vec3(0.62, 0.14, 0.01);

    vec3 col = mix(darkSpot, midPlasma, smoothstep(0.22, 0.62, turb));
    col = mix(col, hotCore, smoothstep(0.56, 0.88, turb * 0.7 + flare * 0.45));

    // Limb darkening & bright fiery corona edge
    float limb = pow(ndotv, 0.42);
    float corona = pow(1.0 - ndotv, 2.6);
    col = col * (0.65 + 0.55 * limb) + vec3(1.0, 0.45, 0.08) * corona * 1.15;
    col *= (0.82 + 0.25 * uSunIntensity);

    fragColor = vec4(col, 1.0);
  }`;

  // 3a. Planet Vertex Shader (Supports Phong, Per-Vertex Gouraud & Flat Shading + Instancing)
  const PLANET_VS = `#version 300 es
  precision highp float;
  precision highp int;

  layout(location = 0) in vec3 aPosition;
  layout(location = 1) in vec3 aNormal;
  layout(location = 2) in vec2 aUv;
  layout(location = 3) in mat4 aInstanceModel;

  uniform mat4 uModel;
  uniform mat4 uView;
  uniform mat4 uProjection;
  uniform bool uUseInstancing;
  uniform float uPointSize;

  // Materi 6: Per-Vertex Gouraud Shading uniforms
  uniform int uShadingMode; // 0 = Phong, 1 = Gouraud, 2 = Flat
  uniform vec3 uLightPos;
  uniform vec3 uCameraPos;
  uniform float uShininess;
  uniform float uSpecularStrength;
  uniform float uSunIntensity;
  uniform bool uUseDiffuse;
  uniform bool uUseSpecular;

  out vec3 vWorldPos;
  out vec3 vNormal;
  out vec2 vUv;
  out float vGouraudDiff;
  out float vGouraudSpec;
  out float vGouraudNdotL;

  void main() {
    mat4 modelMat = uUseInstancing ? aInstanceModel : uModel;
    vec4 worldPos = modelMat * vec4(aPosition, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = mat3(modelMat) * aNormal;
    vUv = aUv;

    if (uShadingMode == 1) {
      vec3 N = normalize(vNormal);
      vec3 L = normalize(uLightPos - vWorldPos);
      vec3 V = normalize(uCameraPos - vWorldPos);
      vec3 H = normalize(L + V);
      float ndotl = dot(N, L);
      vGouraudNdotL = ndotl;
      vGouraudDiff = uUseDiffuse ? max(ndotl, 0.0) * uSunIntensity : 0.0;
      float specAng = max(dot(N, H), 0.0);
      vGouraudSpec = (uUseSpecular && ndotl > 0.0)
        ? pow(specAng, uShininess) * uSpecularStrength * uSunIntensity
        : 0.0;
    } else {
      vGouraudNdotL = 0.0;
      vGouraudDiff = 0.0;
      vGouraudSpec = 0.0;
    }

    gl_Position = uProjection * uView * worldPos;
    gl_PointSize = uPointSize;
  }`;

  // 3b. Planet Blinn-Phong + Phong/Gouraud/Flat Interpolation + Earth Night/Cloud + Atmosphere
  const PLANET_FS = `#version 300 es
  precision highp float;
  precision highp int;

  in vec3 vWorldPos;
  in vec3 vNormal;
  in vec2 vUv;
  in float vGouraudDiff;
  in float vGouraudSpec;
  in float vGouraudNdotL;

  uniform sampler2D uTexBase;
  uniform sampler2D uTexCloud;
  uniform sampler2D uTexNight;

  uniform vec3 uLightPos;
  uniform vec3 uCameraPos;
  uniform vec3 uBaseColor;
  uniform vec3 uAtmoColor;
  uniform float uAtmoStrength;
  uniform float uShininess;
  uniform float uSpecularStrength;
  uniform float uSunIntensity;
  uniform float uTime;

  uniform bool uUseTexture;
  uniform bool uHasEarthLayers;
  uniform bool uUseEarthLayers;
  uniform int uShadingMode; // 0 = Phong, 1 = Gouraud, 2 = Flat
  uniform bool uUseAmbient;
  uniform bool uUseDiffuse;
  uniform bool uUseSpecular;
  uniform bool uUseAtmosphere;
  uniform bool uIsSelected;

  out vec4 fragColor;

  void main() {
    vec3 V = normalize(uCameraPos - vWorldPos);
    vec3 albedo = uUseTexture ? texture(uTexBase, vUv).rgb : uBaseColor;

    // Cloud layer for Earth
    float cloudMask = 0.0;
    if (uHasEarthLayers && uUseEarthLayers && uUseTexture) {
      vec2 cloudUv = vec2(fract(vUv.x + uTime * 0.0045), vUv.y);
      cloudMask = texture(uTexCloud, cloudUv).r;
      albedo = mix(albedo, vec3(0.97, 0.98, 1.0), cloudMask * 0.78);
    }

    vec3 ambient = uUseAmbient ? albedo * 0.085 : vec3(0.0);
    float specBoost = (uHasEarthLayers && uUseTexture) ? (1.0 - cloudMask * 0.7) : 1.0;

    vec3 N = normalize(vNormal);
    float NdotL = 0.0;
    vec3 diffuse = vec3(0.0);
    vec3 specular = vec3(0.0);

    if (uShadingMode == 1) {
      // Materi 6: Gouraud Shading (barycentric interpolation of per-vertex lighting)
      NdotL = vGouraudNdotL;
      diffuse = albedo * vGouraudDiff;
      specular = vec3(1.0, 0.96, 0.88) * vGouraudSpec * specBoost;
    } else {
      // Materi 6: Phong normal interpolation (0) vs. Flat faceted normal dFdx/dFdy (2)
      N = (uShadingMode == 0)
        ? normalize(vNormal)
        : normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
      vec3 L = normalize(uLightPos - vWorldPos);
      vec3 H = normalize(L + V);
      NdotL = dot(N, L);
      float diffFactor = max(NdotL, 0.0);
      diffuse = uUseDiffuse ? albedo * diffFactor * uSunIntensity : vec3(0.0);
      float specAngle = max(dot(N, H), 0.0);
      specular = (uUseSpecular && NdotL > 0.0)
        ? vec3(1.0, 0.96, 0.88) * pow(specAngle, uShininess) * uSpecularStrength * specBoost * uSunIntensity
        : vec3(0.0);
    }

    vec3 color = ambient + diffuse + specular;

    // Earth city lights on the night hemisphere
    if (uHasEarthLayers && uUseEarthLayers && uUseTexture) {
      float nightMask = smoothstep(0.12, -0.28, NdotL);
      vec3 nightLights = texture(uTexNight, vUv).rgb;
      color += nightLights * nightMask * (1.0 - cloudMask * 0.65) * 1.35;
    }

    // Atmospheric Fresnel Rim Scattering
    if (uUseAtmosphere && uAtmoStrength > 0.0) {
      float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.2);
      float daySide = smoothstep(-0.35, 0.45, NdotL);
      color += uAtmoColor * fresnel * uAtmoStrength * (0.22 + 0.78 * daySide);
    }

    // Subtle selection highlight rim when planet is locked
    if (uIsSelected) {
      float selRim = pow(1.0 - max(dot(N, V), 0.0), 4.0);
      color += vec3(0.25, 0.78, 1.0) * selRim * 0.55;
    }

    fragColor = vec4(color, 1.0);
  }`;

  // 4. Saturn Ring Shader with Analytic Planet Shadow Casting
  const RING_FS = `#version 300 es
  precision highp float;

  in vec3 vWorldPos;
  in vec3 vNormal;
  in vec2 vUv;

  uniform sampler2D uTexRing;
  uniform vec3 uPlanetCenter;
  uniform float uPlanetRadius;
  uniform vec3 uLightPos;
  uniform float uSunIntensity;
  uniform bool uUseTexture;

  out vec4 fragColor;

  void main() {
    vec4 tex = uUseTexture
      ? texture(uTexRing, vUv)
      : vec4(0.84, 0.75, 0.58, 0.72);

    if (tex.a < 0.04) discard;

    // Analytic ray-sphere shadow cast by Saturn onto its rings
    vec3 toLight = normalize(uLightPos - vWorldPos);
    vec3 relPos = vWorldPos - uPlanetCenter;
    float b = dot(relPos, toLight);
    float shadow = 1.0;
    if (b < 0.0) {
      float distSq = dot(relPos, relPos) - b * b;
      float rSq = uPlanetRadius * uPlanetRadius;
      shadow = smoothstep(rSq * 0.92, rSq * 1.12, distSq);
    }

    vec3 col = tex.rgb * (0.14 + 0.86 * shadow * uSunIntensity);
    fragColor = vec4(col, tex.a);
  }`;

  // 5. Atmospheric Corona / Glow Halo Billboard Shader
  const GLOW_VS = `#version 300 es
  precision highp float;

  layout(location = 0) in vec2 aQuad;

  uniform mat4 uView;
  uniform mat4 uProjection;
  uniform vec3 uCenter;
  uniform float uRadius;

  out vec2 vQuad;

  void main() {
    vQuad = aQuad;
    // Extract camera right & up vectors from view matrix for screen-aligned billboard
    vec3 camRight = vec3(uView[0][0], uView[1][0], uView[2][0]);
    vec3 camUp    = vec3(uView[0][1], uView[1][1], uView[2][1]);
    vec3 worldPos = uCenter + (camRight * aQuad.x + camUp * aQuad.y) * uRadius;
    gl_Position = uProjection * uView * vec4(worldPos, 1.0);
  }`;

  const GLOW_FS = `#version 300 es
  precision highp float;

  in vec2 vQuad;
  uniform vec3 uColor;
  uniform float uAlpha;

  out vec4 fragColor;

  void main() {
    float r = length(vQuad);
    if (r > 1.0) discard;
    float falloff = pow(1.0 - r, 2.8);
    fragColor = vec4(uColor, falloff * uAlpha);
  }`;

  // 6. Simple Colored Line / Axis / Orbit Shader
  const LINE_VS = `#version 300 es
  precision highp float;

  layout(location = 0) in vec3 aPosition;
  layout(location = 1) in vec3 aColor;

  uniform mat4 uModel;
  uniform mat4 uView;
  uniform mat4 uProjection;

  out vec3 vColor;

  void main() {
    vColor = aColor;
    gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
  }`;

  const LINE_FS = `#version 300 es
  precision highp float;

  in vec3 vColor;
  uniform float uAlpha;
  uniform vec3 uTint;

  out vec4 fragColor;

  void main() {
    fragColor = vec4(vColor * uTint, uAlpha);
  }`;

  // 7. Procedural Deep-Space Starfield & Milky Way Skybox Shader
  const SKY_VS = `#version 300 es
  precision highp float;

  layout(location = 0) in vec2 aPos;
  out vec2 vNdc;

  void main() {
    vNdc = aPos;
    gl_Position = vec4(aPos, 0.9999, 1.0);
  }`;

  const SKY_FS = `#version 300 es
  precision highp float;

  in vec2 vNdc;
  uniform mat4 uInvViewProj;
  uniform vec3 uCameraPos;
  uniform float uTime;

  out vec4 fragColor;

  float hash31(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yzx + 19.19);
    return fract((p.x + p.y) * p.z);
  }

  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash31(i), hash31(i + vec3(1,0,0)), f.x),
          mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
          mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  void main() {
    vec4 worldFar = uInvViewProj * vec4(vNdc, 1.0, 1.0);
    vec3 dir = normalize(worldFar.xyz / worldFar.w - uCameraPos);

    // Subtle cosmic dust & Milky Way band
    float band = exp(-abs(dir.y * 2.4 + dir.x * 0.65) * 2.8);
    float neb = noise3(dir * 3.5) * 0.6 + noise3(dir * 7.5) * 0.4;
    vec3 sky = vec3(0.008, 0.012, 0.024);
    sky += vec3(0.035, 0.055, 0.11) * band * neb;
    sky += vec3(0.04, 0.025, 0.06) * smoothstep(0.55, 0.9, neb) * 0.5;

    // Multi-scale crisp twinkling stars
    vec3 grid1 = floor(dir * 260.0);
    float h1 = hash31(grid1);
    if (h1 > 0.9945) {
      vec3 cellCenter = normalize(grid1 + 0.5);
      float d = length(dir - cellCenter) * 260.0;
      float star = smoothstep(0.45, 0.0, d);
      float twinkle = 0.75 + 0.25 * sin(uTime * 2.5 + h1 * 120.0);
      vec3 starCol = mix(vec3(0.75, 0.86, 1.0), vec3(1.0, 0.91, 0.76), fract(h1 * 31.7));
      sky += starCol * star * twinkle * 1.4;
    }

    vec3 grid2 = floor(dir * 520.0);
    float h2 = hash31(grid2);
    if (h2 > 0.996) {
      sky += vec3(0.65, 0.75, 0.92) * 0.55;
    }

    fragColor = vec4(sky, 1.0);
  }`;

  return {
    createProgram,
    STANDARD_VS,
    PLANET_VS,
    SUN_FS,
    PLANET_FS,
    RING_FS,
    GLOW_VS,
    GLOW_FS,
    LINE_VS,
    LINE_FS,
    SKY_VS,
    SKY_FS
  };
})();
