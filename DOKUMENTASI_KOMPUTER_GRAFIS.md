# Pemetaan Materi Komputer Grafis (Pertemuan 1–10) pada Solar Odyssey

Dokumen ini disusun sebagai bahan lampiran teknis untuk **Laporan Proyek Akhir Komputer Grafis** (Dosen Pengampu: Agi Putra Kharisma), yang menjelaskan implementasi setiap topik perkuliahan di dalam kode sumber **Solar Odyssey**.

---

## 1. Pengantar Komputer Grafis (Pertemuan 1)
- **Konsep**: Arsitektur pipeline grafika real-time berbasis GPU menggunakan **WebGL2 (OpenGL ES 3.0)** dengan siklus *render loop* 60 FPS (`requestAnimationFrame`).
- **Implementasi Kode**: `js/main.js` (fungsi `initApp` dan `frame`), serta pengukuran FPS dan *frame time* secara langsung di `SolarOdyssey.State.stats`.

## 2. Orthographic Projection, Viewing Box, dan World Coordinates (Pertemuan 2)
- **Konsep**: Transformasi sistem koordinat dunia (*World Coordinates* 3D dengan Matahari di titik pusat $(0,0,0)$), matriks kamera (`LookAt`), serta perbandingan **Proyeksi Perspektif** (*frustum* dengan *foreshortening*) dan **Proyeksi Ortografik** (*viewing box* sejajar tanpa distorsi jarak).
- **Implementasi Kode**:
  - `js/math.js`: `mat4Perspective()`, `mat4Ortho()`, dan `mat4LookAt()`.
  - `js/geometry.js`: `createWorldAxesMesh()` menggambar sumbu koordinat dunia **+X (Merah)**, **+Y (Hijau)**, dan **+Z (Biru)**.
  - **Fitur Interaktif**: Pada tab **1. Proyeksi & Ruang** di *Lab Komputer Grafis*, pengguna dapat beralih secara langsung antara mode **Perspective** dan **Orthographic** serta mengatur ukuran *Viewing Box*.

## 3. Clipping, Color, Primitives, Curved Object, 3D (Pertemuan 3)
- **Konsep**:
  - **View-Frustum Clipping**: Pemotongan geometri di luar bidang batas *Near Clipping Plane* dan *Far Clipping Plane*.
  - **Primitives**: Rendering menggunakan primitif `GL_TRIANGLES`, `GL_LINES` (*wireframe*), dan `GL_POINTS`.
  - **Curved Object**: Aproksimasi permukaan bola lengkung menggunakan persamaan parametrik koordinat bola $(\theta, \phi)$.
- **Implementasi Kode**:
  - `js/geometry.js`: `createSphereMesh(gl, segments)` membangkitkan titik permukaan bola dari parameter sudut azimut $\theta \in [0, 2\pi]$ dan inklinasi $\phi \in [0, \pi]$.
  - **Fitur Interaktif**: Tab **2. Mesh & Clipping** menyediakan slider **Near/Far Clipping Plane** (menggeser *Near Plane* ke depan akan memotong penampang bola planet secara visual) serta pengubah jumlah segmen kurva bola (`12×6` hingga `80×40`).

## 4. Vertex Array, Vertex Buffer, dan Mouse Interaction (Pertemuan 4)
- **Konsep**: Pengelolaan memori GPU secara efisien menggunakan **Vertex Array Object (VAO)**, **Vertex Buffer Object (VBO)**, dan **Element Buffer Object (EBO)**, serta interaksi **Mouse 3D Raycasting** (*unprojection* koordinat layar 2D ke sinar dunia 3D).
- **Implementasi Kode**:
  - `js/geometry.js`: Pembentukan VAO/VBO untuk posisi (`location = 0`), normal (`location = 1`), koordinat tekstur UV (`location = 2`), dan matriks instancing (`location = 3..6`).
  - `js/math.js`: `screenToWorldRay()`, `mat4Invert()`, dan `raySphereIntersect()` untuk mendeteksi klik dan *hover* mouse pada setiap planet.

## 5. Transformation and Animation (Pertemuan 5)
- **Konsep**: Komposisi matriks transformasi afin 4×4 untuk setiap benda langit:
  $$M = T_{\text{orbit}}(t) \cdot R_z(\text{tilt}) \cdot R_y(\text{spin}(t)) \cdot S(\text{radius})$$
- **Implementasi Kode**:
  - `js/renderer.js`: `updateCelestialTransforms()` menghitung posisi orbit elips ($T_{\text{orbit}}$) dan rotasi sumbu ($R_y$) setiap *frame* berdasarkan $\Delta t$.
  - **Fitur Interaktif**: Tab **1. Proyeksi & Ruang** menampilkan isi matriks 4×4 *real-time* milik planet yang sedang dipilih serta menyediakan kontrol independen untuk **Animasi Revolusi Orbit** dan **Animasi Rotasi Sumbu**.

## 6. Convexity and Interpolation (Pertemuan 6)
- **Konsep**: Perbandingan 3 metode interpolasi pencahayaan pada poligon segitiga:
  1. **Phong Shading (Per-Fragment)**: Interpolasi vektor normal secara barycentric lalu evaluasi pencahayaan di tiap piksel.
  2. **Gouraud Shading (Per-Vertex)**: Evaluasi pencahayaan di *Vertex Shader* lalu intensitas warnanya diinterpolasi ke seluruh permukaan segitiga.
  3. **Flat Shading (Faceted)**: Normal konstan per segitiga menggunakan turunan spasial layar `dFdx`/`dFdy`.
- **Implementasi Kode**:
  - `js/shaders.js` (`PLANET_VS` & `PLANET_FS`): Variabel uniform `uShadingMode` (`0 = Phong`, `1 = Gouraud`, `2 = Flat`).

## 7. Triangulation and Orientation (Pertemuan 7)
- **Konsep**: Triangulasi grid UV menjadi pasangan segitiga terindeks dengan urutan putaran simpul berlawanan arah jarum jam (**Counter-Clockwise / CCW**) untuk menentukan sisi depan (*front-face*) dan optimasi **Back-Face Culling** (`gl.CULL_FACE`).
- **Implementasi Kode**:
  - `js/geometry.js`: Pembentukan indeks segitiga `indices.push(i0, i2, i1)` dan `indices.push(i1, i2, i3)`.
  - **Fitur Interaktif**: Tab **2. Mesh & Clipping** memungkinkan pengguna mengaktifkan/menonaktifkan `gl.CULL_FACE` serta membalik orientasi *front-face* antara `CCW` dan `CW`.

## 8. 3D Modeling (Pertemuan 8)
- **Konsep**: Pemodelan 3D prosedural, struktur hierarkis *Scene Graph* (Matahari $\rightarrow$ Planet $\rightarrow$ Bulan & Cincin), serta **Hardware Instanced Rendering** (`gl.drawElementsInstanced`) untuk merender **450 asteroid 3D** hanya dalam satu *draw call*.
- **Implementasi Kode**: `js/geometry.js` (`createRingMesh`, `createInstancedAsteroidBelt`) dan `js/planetData.js`.

## 9. Color & Light (Pertemuan 9)
- **Konsep**: Model refleksi pencahayaan **Blinn-Phong** yang terdiri dari komponen **Ambient** ($I_a k_a$), **Diffuse** ($I_d k_d \max(\mathbf{N}\cdot\mathbf{L}, 0)$), dan **Specular** ($I_s k_s \max(\mathbf{N}\cdot\mathbf{H}, 0)^n$), ditambah efek hamburan atmosfer **Fresnel** dan bayangan analitis cincin Saturnus.
- **Implementasi Kode**: `js/shaders.js` (`PLANET_FS`, `RING_FS`, `SUN_FS`).
- **Fitur Interaktif**: Tab **3. Cahaya & Tekstur** menyediakan toggle terpisah Ambient/Diffuse/Specular/Fresnel, slider **Intensitas Cahaya Matahari**, dan slider **Specular Shininess ($n$)** secara *real-time*.

## 10. Texture (Pertemuan 10)
- **Konsep**: Pemetaan tekstur **UV Equirectangular** dari citra prosedural 2D (`512×256` piksel) ke permukaan bola 3D, *multi-texturing* (tekstur permukaan, lapisan awan bergerak, dan lampu kota malam pada sisi gelap Bumi), serta perbandingan metode **Texture Filtering** (`GL_NEAREST`, `GL_LINEAR`, dan `GL_LINEAR_MIPMAP_LINEAR`).
- **Implementasi Kode**: `js/textures.js` (`buildPlanetTexture`, `buildEarthCloudsTexture`, `buildEarthNightTexture`, `buildSaturnRingTexture`, `updateFiltering`).
