/* ==========================================================================
   SOLAR ODYSSEY 3D — Global Namespace & Shared Application State
   ========================================================================== */

window.SolarOdyssey = window.SolarOdyssey || {};

SolarOdyssey.State = {
  started: false,
  paused: false,
  timeSpeed: 0.4,
  simTime: 0.0,

  // Camera modes: "orbit" | "ship"
  cameraMode: "orbit",

  // Selected & hovered celestial body ID
  selectedBodyId: null,
  hoveredBodyId: null,

  // Computer Graphics Lab parameters (Pertemuan 1 - 10)
  cg: {
    projection: "perspective", // "perspective" | "ortho"
    fov: 45,
    orthoSize: 28.0,
    nearPlane: 0.2,
    farPlane: 600.0,
    showAxes: true,
    showOrbits: true,
    showAsteroids: true,
    useAxialTilt: true,
    primitiveMode: "TRIANGLES", // "TRIANGLES" | "LINES" | "POINTS"
    sphereSegments: 48,
    backfaceCulling: true,
    windingOrder: "CCW", // "CCW" | "CW"
    smoothShading: true,
    useAmbient: true,
    useDiffuse: true,
    useSpecular: true,
    useAtmosphere: true,
    sunIntensity: 1.35,
    useTexture: true,
    useEarthLayers: true,
    useMipmap: true
  },

  // GPU telemetry counters (Pertemuan 4)
  stats: {
    fps: 60,
    frameMs: 16.6,
    vaoCount: 0,
    vboCount: 0,
    totalVertices: 0,
    totalTriangles: 0,
    drawCalls: 0,
    rayOrigin: [0, 0, 0],
    rayDir: [0, 0, -1]
  }
};
