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
      photoCaption: "Citra korona plasma dan semburan lidah api surya (solar flare) ditangkap oleh Solar Dynamics Observatory (SDO) NASA.",
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
      satellitesInfo: [
        {
          name: "Tidak Memiliki Satelit Alami (0 Bulan)",
          diameter: "0 km",
          note: "Matahari adalah bintang induk pusat tata surya; seluruh objek yang mengorbitnya diklasifikasikan sebagai planet, planet katai, asteroid, dan komet."
        }
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
      photoCaption: "Mosaik resolusi tinggi cekungan kawah Caloris di Merkurius yang diabadikan oleh wahana antariksa MESSENGER NASA.",
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
      satellitesInfo: [
        {
          name: "Tidak Memiliki Satelit Alami (0 Bulan)",
          diameter: "0 km",
          note: "Karena posisinya yang sangat dekat dengan Matahari, pengaruh pasang surut gravitasi matahari yang sangat kuat mencegah terbentuknya atau bertahannya satelit alami pada orbit Merkurius."
        }
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
      photoCaption: "Citra atmosfer awan tebal asam sulfat Venus dalam spektrum ultraviolet yang dipotret oleh wahana Akatsuki (JAXA) & Mariner 10 NASA.",
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
      satellitesInfo: [
        {
          name: "Tidak Memiliki Satelit Alami (0 Bulan)",
          diameter: "0 km",
          note: "Sama seperti Merkurius, Venus tidak memiliki satelit alami. Teori pembentukan planet menunjukkan tabrakan kolosal di masa purba atau efek gravitasi pasang surut surya melenyapkan calon satelitnya."
        }
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
      photoCaption: "Potret ikonik 'Blue Marble' Bumi yang menampilkan samudra biru, awan putih, dan benua, diabadikan oleh satelit cuaca Suomi NPP NASA/NOAA.",
      moons: [
        {
          id: "moon",
          name: "Bulan",
          radius: 0.45,
          orbitRadius: 2.85,
          orbitSpeed: 1.65,
          spinSpeed: 1.65,
          textureKey: "moon",
          baseColor: [0.75, 0.75, 0.76],
          photoCaption: "Citra resolusi tinggi kawah dan dataran basal gelap Bulan dari wahana Lunar Reconnaissance Orbiter (LRO) NASA."
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
      satellitesInfo: [
        {
          id: "moon",
          name: "Bulan (Luna)",
          diameter: "3.474 km",
          note: "Satelit terbesar ke-5 di Tata Surya. Berotasi sinkron sehingga sisi yang sama selalu menghadap ke Bumi, serta menjadi penggerak utama pasang surut air laut Bumi."
        }
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
      photoCaption: "Mosaik global permukaan kemerahan Mars dan ngarai raksasa Valles Marineris yang dipotret oleh wahana Viking 1 Orbiter NASA.",
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
      satellitesInfo: [
        {
          name: "Phobos",
          diameter: "22,4 km",
          note: "Bulan berbentuk tidak beraturan yang mengorbit sangat dekat dengan Mars (hanya 6.000 km di atas permukaan) dan diprediksi akan hancur menjadi cincin dalam 30–50 juta tahun ke depan."
        },
        {
          name: "Deimos",
          diameter: "12,4 km",
          note: "Bulan terluar Mars yang kecil dan berkawah halus, tersusun dari batuan kaya karbon yang diduga merupakan asteroid purba yang tertangkap gravitasi Mars."
        }
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
      photoCaption: "Potret Bintik Merah Raksasa dan turbulensi badai amonia atmosfer Jupiter yang diabadikan oleh wahana antariksa Juno NASA.",
      moons: [
        {
          id: "io",
          name: "Io",
          radius: 0.26,
          orbitRadius: 4.5,
          orbitSpeed: 2.2,
          spinSpeed: 1.2,
          textureKey: "venus",
          baseColor: [0.95, 0.85, 0.35],
          photoCaption: "Citra semburan letusan vulkanik belerang di Io yang ditangkap oleh wahana antariksa Galileo & New Horizons NASA."
        },
        {
          id: "europa",
          name: "Europa",
          radius: 0.24,
          orbitRadius: 5.3,
          orbitSpeed: 1.6,
          spinSpeed: 1.0,
          textureKey: "mercury",
          baseColor: [0.85, 0.88, 0.92],
          photoCaption: "Kerak es retak Europa yang menyembunyikan samudra air cair bawah tanah, dipotret oleh wahana Galileo NASA."
        },
        {
          id: "ganymede",
          name: "Ganymede",
          radius: 0.34,
          orbitRadius: 6.2,
          orbitSpeed: 1.1,
          spinSpeed: 0.9,
          textureKey: "moon",
          baseColor: [0.68, 0.66, 0.64],
          photoCaption: "Potret permukaan Ganymede, satelit alami terbesar di Tata Surya, oleh wahana Juno NASA."
        }
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
      satellitesInfo: [
        {
          id: "io",
          name: "Io (Satelit Galilean)",
          diameter: "3.643 km",
          note: "Objek paling aktif secara vulkanik di Tata Surya dengan ratusan gunung berapi belerang aktif akibat pemanasan pasang surut gravitasi Jupiter."
        },
        {
          id: "europa",
          name: "Europa (Satelit Galilean)",
          diameter: "3.122 km",
          note: "Memiliki kerak es mulus dengan retakan kemerahan yang menutupi samudra air cair bawah tanah luas dengan volume dua kali samudra Bumi."
        },
        {
          id: "ganymede",
          name: "Ganymede (Satelit Galilean)",
          diameter: "5.268 km",
          note: "Satelit alami terbesar di Tata Surya (lebih besar dari Merkurius) dan satu-satunya satelit yang membangkitkan medan magnet internalnya sendiri."
        },
        {
          name: "Callisto (Satelit Galilean)",
          diameter: "4.821 km",
          note: "Satelit tertua dengan kawah tumbukan terpadat di Tata Surya, permukaannya tidak pernah mengalami aktivitas tektonik sejak terbentuk."
        }
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
      photoCaption: "Keanggunan sistem cincin es Saturnus dan atmosfer keemasan yang diabadikan oleh wahana antariksa Cassini-Huygens NASA/ESA.",
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
      satellitesInfo: [
        {
          name: "Titan",
          diameter: "5.149 km",
          note: "Satu-satunya satelit dengan atmosfer tebal padat (nitrogen 95%) dan siklus cairan aktif yang membentuk danau serta sungai metana/etana cair di permukaannya."
        },
        {
          name: "Enceladus",
          diameter: "504 km",
          note: "Satelit es putih berkilau yang memancarkan semburan geyser uap air es dari samudra bawah permukaannya dan memasok partikel bagi cincin E Saturnus."
        },
        {
          name: "Rhea",
          diameter: "1.527 km",
          note: "Satelit es terbesar kedua Saturnus yang kaya batuan silikat dan memiliki kawah-kawah terang yang terlindung es murni."
        },
        {
          name: "Mimas",
          diameter: "396 km",
          note: "Memiliki kawah tumbukan raksasa 'Herschel' selebar 130 km sehingga penampilannya sangat menyerupai stasiun luar angkasa Death Star."
        }
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
      photoCaption: "Warna sian alami atmosfer metana Uranus yang tertangkap saat penerbangan lintas-dekat wahana antariksa Voyager 2 NASA.",
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
      satellitesInfo: [
        {
          name: "Titania",
          diameter: "1.578 km",
          note: "Satelit alami terbesar Uranus yang dipenuhi ngarai patahan tektonik graben masif dan kawah tumbukan berselimut es air dan batuan."
        },
        {
          name: "Oberon",
          diameter: "1.523 km",
          note: "Satelit terluar Uranus dengan permukaan tertua dan paling banyak kawah, dengan dasar kawah dilapisi material karbon gelap misterius."
        },
        {
          name: "Miranda",
          diameter: "471 km",
          note: "Memiliki topografi paling kacau dan dramatis di Tata Surya dengan tebing terjal Verona Rupes yang memiliki ketinggian lebih dari 10 km."
        },
        {
          name: "Ariel",
          diameter: "1.158 km",
          note: "Satelit paling terang dan paling muda secara geologis di sekitar Uranus, dipenuhi jaringan lembah sesar dan aliran es glasial."
        }
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
      photoCaption: "Badai atmosfer biru kobalt dan awan putih metana Neptunus yang diabadikan oleh wahana antariksa Voyager 2 NASA.",
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
      satellitesInfo: [
        {
          name: "Triton",
          diameter: "2.707 km",
          note: "Satelit raksasa unik yang mengorbit secara retrograde (berlawanan arah rotasi Neptunus). Memiliki geyser nitrogen cair aktif dan diduga merupakan objek Sabuk Kuiper yang tertangkap gravitasi."
        },
        {
          name: "Proteus",
          diameter: "420 km",
          note: "Satelit tak beraturan terbesar Neptunus dengan permukaan gelap pekat penuh kawah tanpa aktivitas geologis lanjutan."
        }
      ],
      fact: "Neptunus adalah satu-satunya planet yang ditemukan lewat perhitungan matematika sebelum diamati langsung melalui teleskop pada tahun 1846."
    }
  ];

  // Bank Soal Kuis Astronomi Interaktif (Berdasarkan data asli simulasi)
  const QUIZ_QUESTIONS = [
    {
      id: 1,
      category: "SUHU & IKLIM PLANET",
      question: "Planet manakah yang memiliki suhu permukaan paling panas di Tata Surya akibat efek rumah kaca yang sangat ekstrem?",
      options: ["Merkurius", "Venus", "Mars", "Jupiter"],
      answerIndex: 1,
      explanation: "Venus adalah planet terpanas dengan suhu rata-rata 465 °C karena atmosfernya terdiri dari 96,5% karbon dioksida tebal yang memerangkap panas matahari secara ekstrem."
    },
    {
      id: 2,
      category: "ORBIT & ROTASI",
      question: "Mengapa di planet Venus Matahari terbit dari arah barat dan terbenam di sebelah timur?",
      options: [
        "Karena Venus mengorbit Matahari lebih cepat dari rotasinya",
        "Karena Venus berotasi berlawanan arah (retrograde) dengan tilt 177,3°",
        "Karena Venus mengalami tarikan pasang surut gravitasi Bulan",
        "Karena sumbu rotasi Venus persis tegak lurus 0°"
      ],
      answerIndex: 1,
      explanation: "Venus mengalami rotasi retrograde (berlawanan jarum jam) dengan kemiringan sumbu 177,3°, menyebabkan arah rotasinya terbalik dibanding mayoritas planet lain."
    },
    {
      id: 3,
      category: "SUHU & IKLIM PLANET",
      question: "Mengapa Merkurius mengalami fluktuasi perubahan suhu harian paling ekstrem (-180 °C hingga 430 °C)?",
      options: [
        "Karena memiliki orbit elips yang melintasi sabuk Kuiper",
        "Karena hampir tidak memiliki lapisan atmosfer untuk menahan dan mendistribusikan panas",
        "Karena inti besinya membeku di malam hari",
        "Karena ditutupi oleh awan asam sulfat tebal"
      ],
      answerIndex: 1,
      explanation: "Merkurius hanya memiliki eksosfer yang sangat tipis (tanpa atmosfer tebal), sehingga panas radiasi Matahari langsung hilang ke luar angkasa saat sisi planet menghadap kegelapan malam."
    },
    {
      id: 4,
      category: "SUHU & IKLIM PLANET",
      question: "Planet raksasa es manakah yang mencatatkan rekor suhu atmosfer terdingin di Tata Surya hingga mencapai -224 °C?",
      options: ["Neptunus", "Uranus", "Saturnus", "Mars"],
      answerIndex: 1,
      explanation: "Meskipun Neptunus lebih jauh dari Matahari, Uranus memegang rekor suhu atmosfer terendah (-224 °C) karena memiliki panas internal inti yang sangat rendah dibanding raksasa gas lainnya."
    },
    {
      id: 5,
      category: "GEOLOGI PLANET",
      question: "Gunung berapi perisai tertinggi di Tata Surya, Olympus Mons (ketinggian ±21,9 km), berada di planet apa?",
      options: ["Bumi", "Venus", "Mars", "Merkurius"],
      answerIndex: 2,
      explanation: "Olympus Mons terletak di Mars. Ketinggiannya mencapai hampir 3 kali lipat Gunung Everest di Bumi dan terbentuk karena ketiadaan lempeng tektonik yang bergerak di Mars purba."
    },
    {
      id: 6,
      category: "ATMOSFER & GEOLOGI",
      question: "Senyawa kimia apakah yang memberikan warna khas kemerahan pada permukaan planet Mars?",
      options: ["Tembaga sulfat", "Besi oksida (karat)", "Silikon dioksida", "Kalsium karbonat"],
      answerIndex: 1,
      explanation: "Permukaan Mars kaya akan debu dan batuan yang mengandung besi oksida (Fe₂O₃ / karat), yang teroksidasi dan menyebar ke seluruh permukaannya."
    },
    {
      id: 7,
      category: "STRUKTUR CINCIN",
      question: "Tersusun dari materi apakah sistem cincin megah Saturnus yang membentang hingga 282.000 km dengan tebal hanya sekitar 10 meter?",
      options: [
        "Miliaran partikel es air dan pecahan batuan",
        "Gas hidrogen dan helium yang terpadatkan",
        "Debu karbon dioksida beku dan pasir silikat murni",
        "Plasma magnetik yang berpendar"
      ],
      answerIndex: 0,
      explanation: "Cincin Saturnus tersusun 99% dari partikel es air murni (dari ukuran mikrometer hingga pecahan sebesar bongkahan es raksasa) bercampur sedikit debu batuan."
    },
    {
      id: 8,
      category: "KARAKTERISTIK FISIK",
      question: "Fakta unik apakah yang dimiliki oleh Saturnus terkait densitas atau massa jenis rata-ratanya?",
      options: [
        "Memiliki massa jenis yang lebih kecil daripada air (< 1 g/cm³)",
        "Merupakan planet paling padat di Tata Surya",
        "Memiliki gravitasi permukaan paling tinggi di Tata Surya",
        "Memiliki inti besi yang menyumbang 80% volumenya"
      ],
      answerIndex: 0,
      explanation: "Saturnus memiliki massa jenis rata-rata sekitar 0,687 g/cm³, menjadikannya satu-satunya planet di Tata Surya yang lebih ringan daripada air."
    },
    {
      id: 9,
      category: "ORBIT & ROTASI",
      question: "Planet manakah yang memiliki kecepatan rotasi paling singkat (satu hari penuh kurang dari 10 jam)?",
      options: ["Merkurius", "Bumi", "Jupiter", "Uranus"],
      answerIndex: 2,
      explanation: "Jupiter berotasi penuh pada porosnya hanya dalam waktu 9 jam 55 menit, menjadikannya planet dengan hari terpendek di seluruh Tata Surya."
    },
    {
      id: 10,
      category: "ATMOSFER & KOMPOSISI",
      question: "Gas apakah yang mendominasi komposisi atmosfer planet Bumi dengan proporsi mencapai 78,1%?",
      options: ["Oksigen (O₂)", "Nitrogen (N₂)", "Karbon Dioksida (CO₂)", "Argon (Ar)"],
      answerIndex: 1,
      explanation: "Atmosfer Bumi didominasi oleh gas Nitrogen (N₂) sebesar 78,1%, disusul oleh Oksigen (O₂) sebesar 20,9%, dan sisanya adalah Argon serta gas lainnya."
    },
    {
      id: 11,
      category: "SATELIT ALAMI",
      question: "Apakah nama satelit alami Bumi yang memiliki ukuran terbesar ke-5 di Tata Surya dan mengalami penguncian rotasi pasang surut?",
      options: ["Titan", "Bulan (Luna)", "Europa", "Phobos"],
      answerIndex: 1,
      explanation: "Bulan (Luna) adalah satu-satunya satelit alami Bumi yang mengorbit sinkron (waktu rotasi sama dengan revolusinya) sehingga wajah yang sama selalu menghadap Bumi."
    },
    {
      id: 12,
      category: "SATELIT ALAMI",
      question: "Dua satelit alami mungil berbentuk kentang ireguler yang mengitari planet Mars adalah...",
      options: ["Io dan Europa", "Phobos dan Deimos", "Titan dan Rhea", "Triton dan Proteus"],
      answerIndex: 1,
      explanation: "Mars memiliki dua satelit alami berukuran kecil bernama Phobos (diameter 22,4 km) dan Deimos (diameter 12,4 km), yang diduga merupakan asteroid tertangkap gravitasi Mars."
    },
    {
      id: 13,
      category: "SATELIT ALAMI",
      question: "Berapa banyak satelit alami yang dimiliki oleh planet Merkurius dan Venus?",
      options: ["0 satelit (tidak memiliki bulan)", "Masing-masing 1 satelit", "Merkurius 2, Venus 0", "Merkurius 0, Venus 3"],
      answerIndex: 0,
      explanation: "Merkurius dan Venus adalah dua planet di Tata Surya yang sama sekali tidak memiliki satelit alami karena letaknya yang dekat dengan gravitasi Matahari."
    },
    {
      id: 14,
      category: "SATELIT ALAMI",
      question: "Empat satelit alami terbesar Jupiter yang pertama kali diamati oleh Galileo Galilei pada tahun 1610 dikenal sebagai Satelit Galilean, yaitu...",
      options: [
        "Titan, Enceladus, Mimas, dan Dione",
        "Io, Europa, Ganymede, dan Callisto",
        "Titania, Oberon, Miranda, dan Ariel",
        "Triton, Proteus, Nereid, dan Thalassa"
      ],
      answerIndex: 1,
      explanation: "Empat satelit Galilean Jupiter adalah Io, Europa, Ganymede, dan Callisto, yang membuktikan bahwa tidak semua benda langit di alam semesta berputar mengitari Bumi."
    },
    {
      id: 15,
      category: "SATELIT ALAMI",
      question: "Satelit alami terbesar di Tata Surya yang bahkan ukurannya melampaui planet Merkurius serta memiliki medan magnetnya sendiri adalah...",
      options: ["Titan", "Ganymede", "Callisto", "Bulan"],
      answerIndex: 1,
      explanation: "Ganymede (mengorbit Jupiter) memiliki diameter 5.268 km, menjadikannya satelit terbesar di Tata Surya dan satu-satunya satelit dengan medan magnet internal aktif."
    },
    {
      id: 16,
      category: "SATELIT ALAMI",
      question: "Dunia manakah di Tata Surya yang memiliki aktivitas vulkanisme paling dahsyat akibat tarikan pasang surut gravitasi Jupiter?",
      options: ["Io", "Europa", "Mars", "Bulan"],
      answerIndex: 0,
      explanation: "Io mengalami gaya pasang surut gravitasi kuat dari Jupiter dan satelit tetangganya yang meremas intinya, menghasilkan ratusan gunung berapi belerang aktif."
    },
    {
      id: 17,
      category: "SATELIT ALAMI",
      question: "Mengapa satelit Jupiter bernama Europa menjadi salah satu target utama pencarian kehidupan di luar Bumi?",
      options: [
        "Karena memiliki samudra air cair luas di bawah lapisan kerak es tebalnya",
        "Karena memiliki atmosfer oksigen dengan tekanan mirip Bumi",
        "Karena suhunya di khatulistiwa cukup hangat untuk tanaman",
        "Karena ditemukan hutan fosil di permukaannya"
      ],
      answerIndex: 0,
      explanation: "Di bawah kerak es Europa yang retak-retak diperkirakan terdapat samudra air asin cair sedalam puluhan kilometer yang dipanaskan oleh ventilasi hidrotermal dasar laut."
    },
    {
      id: 18,
      category: "SATELIT ALAMI",
      question: "Satelit alami Saturnus yang terkenal karena memiliki atmosfer tebal padat serta danau hidrokarbon cair (metana dan etana) adalah...",
      options: ["Titan", "Enceladus", "Mimas", "Rhea"],
      answerIndex: 0,
      explanation: "Titan adalah satu-satunya satelit di Tata Surya dengan atmosfer padat (95% nitrogen) dan memiliki siklus cuaca cair mirip hidrologi Bumi tetapi berbasis metana cair."
    },
    {
      id: 19,
      category: "SATELIT ALAMI",
      question: "Satelit es Saturnus yang memancarkan geyser uap air dan partikel es dari kutub selatannya (pemasok cincin E) adalah...",
      options: ["Enceladus", "Titan", "Iapetus", "Dione"],
      answerIndex: 0,
      explanation: "Enceladus memiliki geyser aktif di wilayah garis-garis loreng harimau kutub selatannya yang menyemburkan air dan materi es dari samudra bawah permukaannya."
    },
    {
      id: 20,
      category: "PENEMUAN ASTRONOMI",
      question: "Planet Neptunus memiliki keunikan sejarah penemuan pada tahun 1846, yaitu...",
      options: [
        "Ditemukan pertama kali melalui perhitungan prediksi matematika sebelum dibuktikan teleskop",
        "Ditemukan oleh teleskop luar angkasa pertama yang mengorbit Bumi",
        "Ditemukan secara kebetulan saat mencari komet baru",
        "Ditemukan oleh astronaut Apollo saat perjalanan ke Bulan"
      ],
      answerIndex: 0,
      explanation: "Penyimpangan orbit Uranus mendorong matematikawan Urbain Le Verrier dan John Couch Adams menghitung posisi planet misterius tersebut, yang langsung diverifikasi observatorium Johann Galle."
    },
    {
      id: 21,
      category: "ATMOSFER & IKLIM",
      question: "Fenomena atmosfer apakah yang paling spektakuler di planet Neptunus?",
      options: [
        "Badai angin supersonik tercepat di Tata Surya yang mencapai lebih dari 2.100 km/jam",
        "Hujan kristal nitrogen cair di kutub utara",
        "Ketiadaan angin sama sekali sehingga atmosfernya tenang membeku",
        "Lapisan awan karbon dioksida yang membakar permukaannya"
      ],
      answerIndex: 0,
      explanation: "Meskipun Neptunus sangat jauh dari Matahari, dinamika termal internalnya memicu angin badai paling dahsyat di Tata Surya dengan kecepatan melebihi kecepatan suara (> 2.100 km/jam)."
    },
    {
      id: 22,
      category: "SATELIT ALAMI",
      question: "Keunikan terbesar satelit alami utama Neptunus, Triton, dalam pergerakan orbitnya adalah...",
      options: [
        "Mengorbit secara retrograde (berlawanan dengan arah rotasi planet induknya)",
        "Mengorbit persis melewati kutub Neptunus setiap 1 jam",
        "Berhenti mengorbit saat posisi oposisi Matahari",
        "Memiliki orbit melingkar yang tidak memiliki kemiringan sama sekali"
      ],
      answerIndex: 0,
      explanation: "Triton adalah satu-satunya satelit alami besar di Tata Surya yang bergerak retrograde. Hal ini membuktikan bahwa Triton awalnya adalah objek Sabuk Kuiper yang tertangkap gravitasi Neptunus."
    },
    {
      id: 23,
      category: "ORBIT & ROTASI",
      question: "Uranus memiliki kemiringan sumbu rotasi yang sangat ekstrem (97,77°). Dampak utama dari karakteristik ini adalah...",
      options: [
        "Kutubnya mengalami 42 tahun siang berturut-turut diikuti 42 tahun malam",
        "Uranus berputar mengitari Matahari dalam formasi spiral",
        "Uranus tidak pernah mengalami perubahan musim",
        "Medan gravitasinya berbalik setiap 10 tahun"
      ],
      answerIndex: 0,
      explanation: "Karena Uranus berputar miring hampir sejajar dengan bidang orbitnya, salah satu kutubnya menghadap Matahari terus-menerus selama setengah periode revolusinya (±42 tahun)."
    },
    {
      id: 24,
      category: "ATMOSFER & KOMPOSISI",
      question: "Gas apakah di atmosfer Uranus dan Neptunus yang menyerap spektrum cahaya merah sehingga kedua planet tampak berwarna biru kehijauan / sian?",
      options: ["Metana (CH₄)", "Oksigen (O₂)", "Amonia (NH₃)", "Uap Air (H₂O)"],
      answerIndex: 0,
      explanation: "Gas metana di lapisan atas atmosfer menyerap cahaya pada panjang gelombang merah dan memantulkan kembali spektrum biru serta hijau ke mata pengamat."
    },
    {
      id: 25,
      category: "FISIKA SURYA",
      question: "Berapa lama waktu yang dibutuhkan cahaya radiasi Matahari untuk menempuh jarak rata-rata 149,6 juta km menuju ke planet Bumi?",
      options: ["Sekitar 8 menit 20 detik", "Sekitar 1 detik", "Sekitar 1 jam", "Sekitar 24 jam"],
      answerIndex: 0,
      explanation: "Dengan kecepatan cahaya c ≈ 300.000 km/detik, jarak 1 AU (149.600.000 km) ditempuh dalam waktu 149.600.000 / 300.000 ≈ 499 detik atau sekitar 8 menit 19–20 detik."
    }
  ];

  function getBodyById(id) {
    return BODIES.find((b) => b.id === id) || null;
  }

  function getRandomQuizQuestions(count = 10) {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  return {
    BODIES,
    getBodyById,
    QUIZ_QUESTIONS,
    getRandomQuizQuestions
  };
})();
