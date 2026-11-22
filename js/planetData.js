/* ==========================================================================
   SOLAR ODYSSEY — Astronomical Database & Orbital Mechanics Parameters
   ========================================================================== */

SolarOdyssey.PlanetData = (function () {
  // Ordered from Sun outward; heroAngle aligns all bodies gracefully like the reference artwork
  const BODIES = [
    {
      id: "sun",
      name: "Matahari",
      category: "BINTANG DERET UTAMA (TIPE G2V)",
      tagline: "Pusat gravitasi dan sumber energi utama Tata Surya",
      swatch: "#f97316",
      radius: 10.5,
      orbitRadius: 0,
      eccentricity: 0,
      inclinationDeg: 0,
      orbitSpeed: 0,
      spinSpeed: 0.14,
      axialTiltDeg: 7.25,
      heroAngle: 0,
      textureKey: "sun",
      baseColor: [1.0, 0.58, 0.12],
      atmoColor: [1.0, 0.52, 0.1],
      atmoStrength: 0.0,
      shininess: 8,
      specularStrength: 0.0,
      isSun: true,
      description:
        "Matahari mencakup 99,86% dari total massa Tata Surya. Di intinya, reaksi fusi nuklir mengubah 600 juta ton hidrogen menjadi helium setiap detik, memancarkan radiasi elektromagnetik yang menerangi seluruh planet.",
      metrics: [
        { label: "Diameter", val: "1.392.700 km" },
        { label: "Suhu Permukaan", val: "5.500 °C" },
        { label: "Suhu Inti", val: "15.000.000 °C" },
        { label: "Periode Rotasi", val: "25,4 Hari (Ekuator)" },
        { label: "Gravitasi", val: "274 m/s² (28× Bumi)" },
        { label: "Usia", val: "± 4,6 Miliar Tahun" }
      ],
      composition: [
        { name: "Hidrogen (H)", pct: 73.5 },
        { name: "Helium (He)", pct: 24.9 },
        { name: "Oksigen, Karbon & Besi", pct: 1.6 }
      ],
      fact: "Cahaya dari Matahari membutuhkan waktu rata-rata 8 menit 20 detik untuk menempuh jarak 149,6 juta km menuju Bumi."
    },
    {
      id: "mercury",
      name: "Merkurius",
      category: "PLANET KEBUMIAN (TERESTRIAL)",
      tagline: "Planet terkecil dan terdekat dari Matahari",
      swatch: "#a8a29e",
      radius: 0.92,
      orbitRadius: 15.2,
      eccentricity: 0.04,
      inclinationDeg: 2.1,
      orbitSpeed: 0.48,
      spinSpeed: 0.18,
      axialTiltDeg: 0.03,
      heroAngle: -0.06,
      textureKey: "mercury",
      baseColor: [0.68, 0.65, 0.62],
      atmoColor: [0.6, 0.6, 0.6],
      atmoStrength: 0.0,
      shininess: 10,
      specularStrength: 0.08,
      description:
        "Merkurius memiliki permukaan berbatu yang dipenuhi kawah tumbukan meteorit mirip Bulan. Karena hampir tidak memiliki atmosfer untuk menahan panas, suhu permukaannya mengalami perubahan paling ekstrem di Tata Surya.",
      metrics: [
        { label: "Diameter", val: "4.879 km" },
        { label: "Jarak Matahari", val: "57,9 Juta km" },
        { label: "Periode Revolusi", val: "88 Hari Bumi" },
        { label: "Periode Rotasi", val: "58,6 Hari Bumi" },
        { label: "Suhu Permukaan", val: "-180 °C s/d 430 °C" },
        { label: "Satelit Alami", val: "0 Bulan" }
      ],
      composition: [
        { name: "Inti Besi & Nikel", pct: 70.0 },
        { name: "Mantel Silikat", pct: 29.0 },
        { name: "Eksosfer Tipis (O₂, Na)", pct: 1.0 }
      ],
      fact: "Satu hari matahari di Merkurius (dari matahari terbit ke terbit berikutnya) berlangsung selama 176 hari Bumi—dua kali lebih lama dari tahunnya!"
    },
    {
      id: "venus",
      name: "Venus",
      category: "PLANET KEBUMIAN (TERESTRIAL)",
      tagline: "Planet terpanas dengan efek rumah kaca ekstrem",
      swatch: "#eab308",
      radius: 1.52,
      orbitRadius: 20.5,
      eccentricity: 0.01,
      inclinationDeg: 1.2,
      orbitSpeed: 0.35,
      spinSpeed: -0.12, // Retrograde rotation!
      axialTiltDeg: 177.3,
      heroAngle: -0.03,
      textureKey: "venus",
      baseColor: [0.91, 0.72, 0.42],
      atmoColor: [1.0, 0.82, 0.45],
      atmoStrength: 0.55,
      shininess: 18,
      specularStrength: 0.16,
      description:
        "Venus diselimuti awan tebal asam sulfat dan atmosfer karbon dioksida yang sangat padat. Tekanan permukaannya mencapai 92 kali tekanan Bumi dan menjebak panas hingga melampaui suhu Merkurius.",
      metrics: [
        { label: "Diameter", val: "12.104 km" },
        { label: "Jarak Matahari", val: "108,2 Juta km" },
        { label: "Periode Revolusi", val: "224,7 Hari Bumi" },
        { label: "Periode Rotasi", val: "243 Hari (Retrograde)" },
        { label: "Suhu Rata-rata", val: "465 °C" },
        { label: "Satelit Alami", val: "0 Bulan" }
      ],
      composition: [
        { name: "Karbon Dioksida (CO₂)", pct: 96.5 },
        { name: "Nitrogen (N₂)", pct: 3.4 },
        { name: "Sulfur Dioksida (SO₂)", pct: 0.1 }
      ],
      fact: "Venus berotasi berlawanan arah (retrograde) dibanding sebagian besar planet lain, sehingga Matahari terbit dari barat dan terbenam di timur."
    },
    {
      id: "earth",
      name: "Bumi",
      category: "PLANET KEBUMIAN (TERESTRIAL)",
      tagline: "Planet biru dengan lautan cair dan biosfer aktif",
      swatch: "#38bdf8",
      radius: 1.68,
      orbitRadius: 26.8,
      eccentricity: 0.016,
      inclinationDeg: 0.0,
      orbitSpeed: 0.27,
      spinSpeed: 0.65,
      axialTiltDeg: 23.44,
      heroAngle: 0.01,
      textureKey: "earth",
      baseColor: [0.22, 0.56, 0.92],
      atmoColor: [0.35, 0.72, 1.0],
      atmoStrength: 0.78,
      shininess: 36,
      specularStrength: 0.48,
      hasEarthLayers: true,
      moons: [
        {
          id: "moon",
          name: "Bulan",
          radius: 0.45,
          orbitRadius: 2.85,
          orbitSpeed: 1.65,
          spinSpeed: 1.65,
          textureKey: "moon",
          baseColor: [0.75, 0.75, 0.76]
        }
      ],
      description:
        "Bumi adalah planet ketiga dari Matahari dengan 71% permukaan tertutup lautan air cair. Kemiringan sumbu 23,44° menghasilkan siklus empat musim, sementara medan magnetnya melindungi atmosfer dari angin surya.",
      metrics: [
        { label: "Diameter", val: "12.742 km" },
        { label: "Jarak Matahari", val: "149,6 Juta km (1 AU)" },
        { label: "Periode Revolusi", val: "365,25 Hari" },
        { label: "Periode Rotasi", val: "23 Jam 56 Menit" },
        { label: "Suhu Rata-rata", val: "15 °C" },
        { label: "Satelit Alami", val: "1 (Bulan)" }
      ],
      composition: [
        { name: "Nitrogen (N₂)", pct: 78.1 },
        { name: "Oksigen (O₂)", pct: 20.9 },
        { name: "Argon, CO₂ & Uap Air", pct: 1.0 }
      ],
      fact: "Arahkan kamera ke sisi gelap Bumi pada simulasi ini untuk melihat pancaran lampu kota-kota besar di malam hari!"
    },
    {
      id: "mars",
      name: "Mars",
      category: "PLANET KEBUMIAN (TERESTRIAL)",
      tagline: "Planet Merah dengan gunung berapi terbesar di Tata Surya",
      swatch: "#ef4444",
      radius: 1.18,
      orbitRadius: 32.8,
      eccentricity: 0.05,
      inclinationDeg: 1.4,
      orbitSpeed: 0.21,
      spinSpeed: 0.62,
      axialTiltDeg: 25.19,
      heroAngle: 0.04,
      textureKey: "mars",
      baseColor: [0.85, 0.36, 0.22],
      atmoColor: [0.95, 0.55, 0.38],
      atmoStrength: 0.28,
      shininess: 14,
      specularStrength: 0.12,
      description:
        "Warna kemerahan Mars berasal dari kandungan besi oksida (karat) pada tanahnya. Mars memiliki Olympus Mons (gunung berapi setinggi 21,9 km) dan Valles Marineris, ngarai raksasa sepanjang 4.000 km.",
      metrics: [
        { label: "Diameter", val: "6.779 km" },
        { label: "Jarak Matahari", val: "227,9 Juta km" },
        { label: "Periode Revolusi", val: "687 Hari Bumi" },
        { label: "Periode Rotasi", val: "24 Jam 37 Menit" },
        { label: "Suhu Rata-rata", val: "-63 °C" },
        { label: "Satelit Alami", val: "2 (Phobos & Deimos)" }
      ],
      composition: [
        { name: "Karbon Dioksida (CO₂)", pct: 95.3 },
        { name: "Nitrogen (N₂)", pct: 2.6 },
        { name: "Argon (Ar)", pct: 1.9 }
      ],
      fact: "Puncak Olympus Mons di Mars tingginya hampir tiga kali lipat Gunung Everest di Bumi."
    },
    {
      id: "jupiter",
      name: "Jupiter",
      category: "RAKSASA GAS (GAS GIANT)",
      tagline: "Planet terbesar dengan badai abadi Bintik Merah Raksasa",
      swatch: "#d97706",
      radius: 3.65,
      orbitRadius: 48.0,
      eccentricity: 0.03,
      inclinationDeg: 0.9,
      orbitSpeed: 0.12,
      spinSpeed: 1.15,
      axialTiltDeg: 3.13,
      heroAngle: 0.07,
      textureKey: "jupiter",
      baseColor: [0.84, 0.68, 0.52],
      atmoColor: [0.92, 0.78, 0.62],
      atmoStrength: 0.36,
      shininess: 22,
      specularStrength: 0.18,
      moons: [
        { id: "io", name: "Io", radius: 0.26, orbitRadius: 4.5, orbitSpeed: 2.2, spinSpeed: 1.2, textureKey: "venus", baseColor: [0.95, 0.85, 0.35] },
        { id: "europa", name: "Europa", radius: 0.24, orbitRadius: 5.3, orbitSpeed: 1.6, spinSpeed: 1.0, textureKey: "mercury", baseColor: [0.85, 0.88, 0.92] },
        { id: "ganymede", name: "Ganymede", radius: 0.34, orbitRadius: 6.2, orbitSpeed: 1.1, spinSpeed: 0.9, textureKey: "moon", baseColor: [0.68, 0.66, 0.64] }
      ],
      description:
        "Jupiter memiliki massa lebih dari dua kali lipat gabungan seluruh planet lain di Tata Surya. Pita awan amonia berkecepatan tinggi dan Bintik Merah Raksasa menjadi ciri khas atmosfernya yang dinamis.",
      metrics: [
        { label: "Diameter", val: "139.820 km (11× Bumi)" },
        { label: "Jarak Matahari", val: "778,5 Juta km" },
        { label: "Periode Revolusi", val: "11,86 Tahun Bumi" },
        { label: "Periode Rotasi", val: "9 Jam 55 Menit" },
        { label: "Suhu Awan Atas", val: "-110 °C" },
        { label: "Satelit Alami", val: "95 Bulan (Io, Europa, dll.)" }
      ],
      composition: [
        { name: "Hidrogen (H₂)", pct: 89.8 },
        { name: "Helium (He)", pct: 10.2 }
      ],
      fact: "Jupiter adalah planet dengan rotasi tercepat di Tata Surya—satu hari penuh di Jupiter hanya berlangsung kurang dari 10 jam!"
    },
    {
      id: "saturn",
      name: "Saturnus",
      category: "RAKSASA GAS (GAS GIANT)",
      tagline: "Permata Tata Surya dengan sistem cincin es spektakuler",
      swatch: "#fcd34d",
      radius: 3.05,
      orbitRadius: 62.5,
      eccentricity: 0.035,
      inclinationDeg: 1.8,
      orbitSpeed: 0.085,
      spinSpeed: 1.02,
      axialTiltDeg: 26.73,
      heroAngle: 0.10,
      textureKey: "saturn",
      baseColor: [0.88, 0.78, 0.56],
      atmoColor: [0.95, 0.86, 0.65],
      atmoStrength: 0.34,
      shininess: 22,
      specularStrength: 0.18,
      hasRings: true,
      ringInner: 1.32,
      ringOuter: 2.38,
      description:
        "Saturnus dikelilingi tujuh kelompok cincin utama yang tersusun dari miliaran partikel es dan batuan, dipisahkan oleh celah gravitasi seperti Divisi Cassini. Massa jenis rata-ratanya bahkan lebih kecil daripada air.",
      metrics: [
        { label: "Diameter", val: "116.460 km" },
        { label: "Jarak Matahari", val: "1,43 Miliar km" },
        { label: "Periode Revolusi", val: "29,45 Tahun Bumi" },
        { label: "Periode Rotasi", val: "10 Jam 33 Menit" },
        { label: "Suhu Rata-rata", val: "-140 °C" },
        { label: "Satelit Alami", val: "146 Bulan (Titan, Enceladus)" }
      ],
      composition: [
        { name: "Hidrogen (H₂)", pct: 96.3 },
        { name: "Helium (He)", pct: 3.25 },
        { name: "Metana & Amonia", pct: 0.45 }
      ],
      fact: "Bentang sistem cincin Saturnus mencapai 282.000 km lebarnya, namun ketebalan rata-ratanya hanya sekitar 10 meter!"
    },
    {
      id: "uranus",
      name: "Uranus",
      category: "RAKSASA ES (ICE GIANT)",
      tagline: "Raksasa es biru kehijauan yang berotasi miring 97,8°",
      swatch: "#67e8f9",
      radius: 2.15,
      orbitRadius: 76.0,
      eccentricity: 0.025,
      inclinationDeg: 0.8,
      orbitSpeed: 0.058,
      spinSpeed: -0.72,
      axialTiltDeg: 97.77,
      heroAngle: 0.13,
      textureKey: "uranus",
      baseColor: [0.52, 0.84, 0.90],
      atmoColor: [0.58, 0.90, 0.96],
      atmoStrength: 0.48,
      shininess: 28,
      specularStrength: 0.25,
      description:
        "Uranus memiliki warna sian cerah karena gas metana di atmosfer atas menyerap cahaya merah Matahari. Kemiringan sumbunya hampir sejajar dengan bidang orbitnya sehingga Uranus tampak menggelinding mengelilingi Matahari.",
      metrics: [
        { label: "Diameter", val: "50.724 km" },
        { label: "Jarak Matahari", val: "2,87 Miliar km" },
        { label: "Periode Revolusi", val: "84 Tahun Bumi" },
        { label: "Periode Rotasi", val: "17 Jam 14 Menit" },
        { label: "Suhu Terdingin", val: "-224 °C" },
        { label: "Satelit Alami", val: "28 Bulan (Titania, Oberon)" }
      ],
      composition: [
        { name: "Hidrogen (H₂)", pct: 82.5 },
        { name: "Helium (He)", pct: 15.2 },
        { name: "Metana (CH₄)", pct: 2.3 }
      ],
      fact: "Karena kemiringan sumbu 97,77°, setiap kutub Uranus mengalami 42 tahun siang terus-menerus diikuti 42 tahun malam."
    },
    {
      id: "neptune",
      name: "Neptunus",
      category: "RAKSASA ES (ICE GIANT)",
      tagline: "Planet terjauh dengan badai angin supersonik tercepat",
      swatch: "#3b82f6",
      radius: 2.08,
      orbitRadius: 88.5,
      eccentricity: 0.01,
      inclinationDeg: 1.5,
      orbitSpeed: 0.042,
      spinSpeed: 0.78,
      axialTiltDeg: 28.32,
      heroAngle: 0.16,
      textureKey: "neptune",
      baseColor: [0.22, 0.44, 0.88],
      atmoColor: [0.28, 0.56, 1.0],
      atmoStrength: 0.56,
      shininess: 30,
      specularStrength: 0.28,
      description:
        "Neptunus merupakan planet kedelapan sekaligus terjauh dari Matahari. Meski menerima energi surya sangat kecil, panas internalnya menggerakkan angin badai tercepat di Tata Surya hingga 2.100 km/jam.",
      metrics: [
        { label: "Diameter", val: "49.244 km" },
        { label: "Jarak Matahari", val: "4,50 Miliar km" },
        { label: "Periode Revolusi", val: "164,8 Tahun Bumi" },
        { label: "Periode Rotasi", val: "16 Jam 6 Menit" },
        { label: "Suhu Rata-rata", val: "-214 °C" },
        { label: "Satelit Alami", val: "16 Bulan (Triton)" }
      ],
      composition: [
        { name: "Hidrogen (H₂)", pct: 80.0 },
        { name: "Helium (He)", pct: 19.0 },
        { name: "Metana (CH₄)", pct: 1.5 }
      ],
      fact: "Neptunus adalah satu-satunya planet yang ditemukan lewat perhitungan matematika sebelum diamati langsung melalui teleskop pada tahun 1846."
    }
  ];

  function getBodyById(id) {
    return BODIES.find((b) => b.id === id) || null;
  }

  return {
    BODIES,
    getBodyById
  };
})();
