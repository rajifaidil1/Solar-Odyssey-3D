/* ==========================================================================
   SOLAR ODYSSEY — Interactive Solar System & Astronomy Quiz Module
   ========================================================================== */

window.SolarOdyssey = window.SolarOdyssey || {};

SolarOdyssey.Quiz = (function () {
  const QUESTIONS = [
    {
      q: "Planet manakah yang paling dekat dengan Matahari?",
      options: ["Venus", "Merkurius", "Mars", "Bumi"],
      answer: 1,
      explanation: "Merkurius adalah planet pertama dalam tata surya dan paling dekat dengan Matahari."
    },
    {
      q: "Planet manakah yang memiliki sistem cincin paling spektakuler?",
      options: ["Jupiter", "Uranus", "Neptunus", "Saturnus"],
      answer: 3,
      explanation: "Saturnus terkenal dengan sistem cincinnya yang megah dan terbuat dari miliaran partikel es serta batuan."
    },
    {
      q: "Planet manakah yang paling besar dalam tata surya?",
      options: ["Saturnus", "Uranus", "Jupiter", "Neptunus"],
      answer: 2,
      explanation: "Jupiter adalah planet terbesar di tata surya dengan diameter lebih dari 11 kali diameter Bumi."
    },
    {
      q: "Berapa suhu rata-rata di permukaan planet Venus?",
      options: ["Sekitar 15 °C", "Sekitar -60 °C", "Sekitar 465 °C", "Sekitar -140 °C"],
      answer: 2,
      explanation: "Venus adalah planet terpanas di tata surya (sekitar 465 °C) akibat efek rumah kaca ekstrem atmosfer karbon dioksidanya."
    },
    {
      q: "Planet manakah yang sumbu rotasinya paling miring (sekitar 98°)?",
      options: ["Mars", "Uranus", "Neptunus", "Saturnus"],
      answer: 1,
      explanation: "Uranus memiliki kemiringan sumbu 97,8°, membuatnya tampak berotasi menggelinding di bidang orbitnya."
    },
    {
      q: "Berapa jumlah satelit alami (bulan) yang dimiliki planet Mars?",
      options: ["0 bulan", "1 bulan", "2 bulan", "4 bulan"],
      answer: 2,
      explanation: "Mars memiliki 2 satelit alami kecil dan berbentuk tidak beraturan, yaitu Phobos dan Deimos."
    },
    {
      q: "Berapa persen massa total tata surya yang terpusat di Matahari?",
      options: ["75%", "90%", "99,8%", "50%"],
      answer: 2,
      explanation: "Matahari sangat masif dan mencakup sekitar 99,86% dari seluruh massa yang ada di Tata Surya."
    },
    {
      q: "Planet manakah satu-satunya yang diketahui memiliki kehidupan?",
      options: ["Mars", "Venus", "Bumi", "Europa"],
      answer: 2,
      explanation: "Bumi adalah satu-satunya dunia berpenghuni yang memiliki air cair stabil dan atmosfer kaya oksigen."
    },
    {
      q: "Berapa lama periode revolusi (1 tahun) di planet Merkurius?",
      options: ["365 Hari", "225 Hari", "88 Hari", "687 Hari"],
      answer: 2,
      explanation: "Karena posisinya paling dekat dengan Matahari, Merkurius hanya butuh 88 hari Bumi untuk menyelesaikan 1 putaran orbit."
    },
    {
      q: "Di planet manakah tercatat hembusan angin supersonik tercepat?",
      options: ["Jupiter", "Saturnus", "Uranus", "Neptunus"],
      answer: 3,
      explanation: "Neptunus memiliki hembusan angin tercepat di tata surya, mencapai kecepatan lebih dari 2.000 km/jam!"
    },
    {
      q: "Olympus Mons, gunung berapi tertinggi di tata surya, berada di mana?",
      options: ["Bumi", "Venus", "Mars", "Jupiter"],
      answer: 2,
      explanation: "Olympus Mons berada di planet Mars, menjulang setinggi 22 km (hampir 3 kali tinggi Gunung Everest)."
    },
    {
      q: "Planet manakah yang arah rotasinya berlawanan (retrograde) dengan mayoritas planet?",
      options: ["Mars", "Venus", "Merkurius", "Uranus"],
      answer: 1,
      explanation: "Venus berotasi secara retrograde (searah jarum jam), sehingga Matahari di sana terbit di barat dan terbenam di timur."
    }
  ];

  const TOTAL_SESSION = 8;
  let activeQuestions = [];
  let currentIndex = 0;
  let score = 0;
  let answered = false;

  function shuffle(arr) {
    const res = [...arr];
    for (let i = res.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [res[i], res[j]] = [res[j], res[i]];
    }
    return res;
  }

  function startQuiz() {
    activeQuestions = shuffle(QUESTIONS).slice(0, TOTAL_SESSION);
    currentIndex = 0;
    score = 0;
    answered = false;

    document.getElementById("quiz-result-view").classList.add("hidden");
    document.getElementById("quiz-ongoing-view").classList.remove("hidden");
    document.getElementById("quiz-modal").classList.remove("hidden");

    renderQuestion();
  }

  function renderQuestion() {
    answered = false;
    const q = activeQuestions[currentIndex];

    // Update Progress & Meta
    const progressPct = ((currentIndex) / TOTAL_SESSION) * 100;
    document.getElementById("quiz-progress-fill").style.width = `${progressPct}%`;
    document.getElementById("quiz-step-label").textContent = `Pertanyaan ${currentIndex + 1} dari ${TOTAL_SESSION}`;
    document.getElementById("quiz-score-live").textContent = `Skor: ${score}`;

    // Question Text
    document.getElementById("quiz-question-text").textContent = q.q;

    // Reset explanation & Next button
    const explBox = document.getElementById("quiz-explanation-box");
    explBox.classList.add("hidden");
    document.getElementById("btn-next-question").classList.add("hidden");

    // Options
    const optContainer = document.getElementById("quiz-options-container");
    optContainer.innerHTML = "";

    q.options.forEach((optText, idx) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option-btn";
      btn.innerHTML = `<span class="opt-label">${String.fromCharCode(65 + idx)}.</span> <span>${optText}</span>`;
      btn.addEventListener("click", () => handleSelectOption(idx));
      optContainer.appendChild(btn);
    });
  }

  function handleSelectOption(selectedIdx) {
    if (answered) return;
    answered = true;

    const q = activeQuestions[currentIndex];
    const isCorrect = selectedIdx === q.answer;
    if (isCorrect) {
      score++;
      if (SolarOdyssey.Audio && SolarOdyssey.Audio.playSuccessChime) {
        SolarOdyssey.Audio.playSuccessChime();
      }
    } else {
      if (SolarOdyssey.Audio && SolarOdyssey.Audio.playErrorBuzz) {
        SolarOdyssey.Audio.playErrorBuzz();
      }
    }

    document.getElementById("quiz-score-live").textContent = `Skor: ${score}`;

    // Highlight buttons
    const buttons = document.querySelectorAll(".quiz-option-btn");
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.answer) {
        btn.classList.add("correct");
      } else if (idx === selectedIdx) {
        btn.classList.add("wrong");
      }
    });

    // Show Explanation
    const explBox = document.getElementById("quiz-explanation-box");
    const fbTitle = document.getElementById("quiz-feedback-title");
    const fbText = document.getElementById("quiz-explanation-text");

    if (isCorrect) {
      fbTitle.textContent = "Jawaban Benar! 🎉";
      fbTitle.style.color = "#4ade80";
    } else {
      fbTitle.textContent = `Kurang Tepat (Jawaban: ${q.options[q.answer]})`;
      fbTitle.style.color = "#f87171";
    }
    fbText.textContent = q.explanation;
    explBox.classList.remove("hidden");

    // Next Button
    const nextBtn = document.getElementById("btn-next-question");
    if (currentIndex + 1 < TOTAL_SESSION) {
      nextBtn.textContent = "Pertanyaan Selanjutnya \u2192";
    } else {
      nextBtn.textContent = "Lihat Hasil Akhir \u2192";
    }
    nextBtn.classList.remove("hidden");
  }

  function nextQuestion() {
    currentIndex++;
    if (currentIndex < TOTAL_SESSION) {
      renderQuestion();
    } else {
      showResult();
    }
  }

  function showResult() {
    document.getElementById("quiz-progress-fill").style.width = "100%";
    document.getElementById("quiz-ongoing-view").classList.add("hidden");
    const resultView = document.getElementById("quiz-result-view");
    resultView.classList.remove("hidden");

    const pct = Math.round((score / TOTAL_SESSION) * 100);
    document.getElementById("quiz-result-score").textContent = `${score} / ${TOTAL_SESSION}`;
    document.getElementById("quiz-result-pct").textContent = `${pct}% Jawaban Benar`;

    let emoji = "🏆";
    let grade = "Luar Biasa!";
    let color = "#38bdf8";

    if (pct >= 90) {
      emoji = "🏆";
      grade = "Luar Biasa! Ahli Astronomi Sejati!";
      color = "#ffd700";
    } else if (pct >= 75) {
      emoji = "🌟";
      grade = "Sangat Bagus! Pemahaman Anda Sangat Tinggi!";
      color = "#4ade80";
    } else if (pct >= 60) {
      emoji = "👍";
      grade = "Bagus! Terus Eksplorasi Lebih Dalam!";
      color = "#38bdf8";
    } else if (pct >= 40) {
      emoji = "📚";
      grade = "Cukup Baik! Pelajari Fakta Planet di Mode Jelajah.";
      color = "#f59e0b";
    } else {
      emoji = "🚀";
      grade = "Perlu Belajar Lagi! Jelajahi Setiap Planet & Coba Kembali!";
      color = "#f87171";
    }

    document.getElementById("quiz-result-emoji").textContent = emoji;
    document.getElementById("quiz-result-grade").textContent = grade;
    document.getElementById("quiz-result-grade").style.color = color;

    if (SolarOdyssey.Audio && SolarOdyssey.Audio.playFinishFanfare) {
      SolarOdyssey.Audio.playFinishFanfare();
    }
  }

  function closeQuiz() {
    document.getElementById("quiz-modal").classList.add("hidden");
  }

  function init() {
    document.getElementById("btn-close-quiz")?.addEventListener("click", closeQuiz);
    document.getElementById("btn-done-quiz")?.addEventListener("click", closeQuiz);
    document.getElementById("btn-restart-quiz")?.addEventListener("click", startQuiz);
    document.getElementById("btn-next-question")?.addEventListener("click", nextQuestion);

    document.getElementById("btn-open-quiz")?.addEventListener("click", () => {
      startQuiz();
      if (SolarOdyssey.Audio) SolarOdyssey.Audio.playSelectChime();
    });

    document.getElementById("btn-open-quiz-title")?.addEventListener("click", () => {
      startQuiz();
      if (SolarOdyssey.Audio) SolarOdyssey.Audio.playSelectChime();
    });
  }

  return {
    init,
    startQuiz,
    closeQuiz
  };
})();
