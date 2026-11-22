# SOLAR ODYSSEY — Simulasi Tata Surya & Lab Komputer Grafis

Aplikasi game edukasi dan eksplorasi luar angkasa 3D interaktif berbasis **Native WebGL2** dan **GLSL ES 3.00** yang dirancang khusus untuk memenuhi seluruh spesifikasi tugas proyek mata kuliah **Komputer Grafis**.

## Ketentuan Proyek yang Dipenuhi
- **Jenis Aplikasi**: Interactive Computer Graphics (3D Real-Time Rendering Engine)
- **Tujuan**: Edukasi, Informasi, & Hiburan
- **Tampilan**: 3D Penuh (dengan dukungan Proyeksi Perspektif & Ortografik)
- **Platform**: PC (Windows, macOS, Linux via browser modern)
- **Standalone & 100% Offline**: Tidak menggunakan library eksternal, CDN, atau aset internet. Seluruh geometri, shader GLSL, tekstur planet 512×256, dan synthesizer audio dibangkitkan secara mandiri oleh kode program.
- **Tampilan Credits & Multiplier Nilai Tim**: Dapat diakses langsung dari Layar Judul maupun tombol **Credits & Tim** di HUD atas, lengkap dengan pengaturan **Multiplier Kontribusi (0.00 – 1.00)** oleh Ketua Tim (**Rajif Aidil Putra**).

## Cara Menjalankan Aplikasi
1. Ekstrak seluruh isi file ZIP ini ke dalam satu folder.
2. **Cara Termudah**: Klik dua kali file `index.html` (atau jalankan `run_game.bat` di Windows / `run_game.sh` di macOS & Linux).
3. *(Opsional)* Jika ingin menggunakan server lokal, jalankan `python -m http.server 8080` di dalam folder proyek lalu buka `http://localhost:8080`.

## Struktur Folder Proyek
```text
Solar-Odyssey/
├── index.html                        # Struktur halaman utama, HUD, & panel interaktif
├── README.md                         # Panduan instalasi & penggunaan aplikasi
├── DOKUMENTASI_GRAFIKA_KOMPUTER.md   # Pemetaan materi kuliah Pertemuan 1–10 ke kode sumber
├── run_game.bat                      # Peluncur cepat untuk Windows
├── run_game.sh                       # Peluncur cepat untuk macOS / Linux
├── css/
│   └── styles.css                    # Desain antarmuka sci-fi glassmorphism
└── js/
    ├── namespace.js                  # State global aplikasi & konfigurasi Lab CG
    ├── math.js                       # Matematika 3D (Vec3, Mat4, Proyeksi, Ray-Sphere)
    ├── shaders.js                    # Vertex & Fragment Shaders (GLSL ES 3.00)
    ├── textures.js                   # Generator tekstur prosedural planet, awan & cincin
    ├── geometry.js                   # Pembangkit mesh parametrik & manajemen VAO/VBO/EBO
    ├── planetData.js                 # Database astronomi Matahari, 8 Planet, & Satelit
    ├── audio.js                      # Synthesizer efek suara & ambient WebAudio API
    ├── renderer.js                   # Pipeline rendering WebGL2, kamera Orbit & Pesawat
    ├── ui.js                         # Kontrol HUD, kartu telemetri, Lab CG & Credits
    └── main.js                       # Game loop utama & pengendali input mouse/keyboard
```

## Kontrol Permainan
- **Klik Benda Langit (Matahari, Planet, atau Bulan)**: Mengunci kamera mengikuti orbit planet tersebut dan menampilkan kartu informasi astronomi lengkap.
- **Mode Kamera Orbit**: Klik-seret (*drag*) untuk memutar sudut pandang, *scroll wheel* untuk zoom.
- **Mode Pesawat (WASD)**: Klik tombol `Pesawat (WASD)` di bilah atas, lalu gunakan `W A S D` untuk terbang, `Q / E` untuk naik/turun, `Shift` untuk turbo, dan seret mouse untuk mengarahkan pandangan.
- **Lab Komputer Grafis**: Klik tombol `Lab Komputer Grafis` di kanan atas untuk menguji langsung konsep Proyeksi, Clipping Planes, Wireframe, Back-Face Culling, Smooth vs. Flat Shading, Blinn-Phong Lighting, Tekstur UV, dan Matriks 4×4.
