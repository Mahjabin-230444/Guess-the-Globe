/* =========================================================
   FAMOUS WORLD LOCATIONS
========================================================= */

const famousLocations = [
  {
    name: "Eiffel Tower, Paris",
    lat: 48.8584,
    lng: 2.2945,
    icon: "🗼",
    description: "A global symbol of France and one of the world's most visited landmarks."
  },
  {
    name: "Statue of Liberty, New York",
    lat: 40.6892,
    lng: -74.0445,
    icon: "🗽",
    description: "A symbol of freedom located in New York Harbor."
  },
  {
    name: "Great Pyramid of Giza, Egypt",
    lat: 29.9792,
    lng: 31.1342,
    icon: "🔺",
    description: "The oldest of the Seven Wonders of the Ancient World."
  },
  {
    name: "Taj Mahal, Agra",
    lat: 27.1751,
    lng: 78.0421,
    icon: "🕌",
    description: "A marble mausoleum and one of South Asia's most famous monuments."
  },
  {
    name: "Sydney Opera House, Australia",
    lat: -33.8568,
    lng: 151.2153,
    icon: "🎭",
    description: "An iconic performing arts venue on Sydney Harbour."
  },
  {
    name: "Machu Picchu, Peru",
    lat: -13.1631,
    lng: -72.545,
    icon: "⛰️",
    description: "A historic Inca citadel high in the Andes Mountains."
  },
  {
    name: "Christ the Redeemer, Rio de Janeiro",
    lat: -22.9519,
    lng: -43.2105,
    icon: "✝️",
    description: "A major Brazilian landmark overlooking Rio de Janeiro."
  },
  {
    name: "Colosseum, Rome",
    lat: 41.8902,
    lng: 12.4922,
    icon: "🏛️",
    description: "An ancient Roman amphitheatre known for its historic architecture."
  },
  {
    name: "Mount Fuji, Japan",
    lat: 35.3606,
    lng: 138.7274,
    icon: "🗻",
    description: "Japan's highest mountain and one of its most recognizable natural icons."
  },
  {
    name: "Burj Khalifa, Dubai",
    lat: 25.1972,
    lng: 55.2744,
    icon: "🏙️",
    description: "The tallest building in the world, located in downtown Dubai."
  },
  {
    name: "Stonehenge, England",
    lat: 51.1789,
    lng: -1.8262,
    icon: "🪨",
    description: "A prehistoric stone circle and one of Britain's most mysterious sites."
  },
  {
    name: "Angkor Wat, Cambodia",
    lat: 13.4125,
    lng: 103.867,
    icon: "🏯",
    description: "A vast temple complex and a masterpiece of Khmer architecture."
  },
  {
    name: "Petra, Jordan",
    lat: 30.3285,
    lng: 35.4444,
    icon: "🏜️",
    description: "An ancient city famous for its rock-cut architecture."
  },
  {
    name: "Niagara Falls, Canada/USA",
    lat: 43.0962,
    lng: -79.0377,
    icon: "💦",
    description: "A famous group of waterfalls on the Canada–United States border."
  },
  {
    name: "Sagrada Familia, Barcelona",
    lat: 41.4036,
    lng: 2.1744,
    icon: "⛪",
    description: "A world-famous basilica designed by Antoni Gaudí."
  }
];

/* =========================================================
   DIFFICULTY SETTINGS
========================================================= */

const difficultySettings = {
  easy: {
    label: "Easy",
    time: 45,
    scoringRadiusKm: 3600,
    startZoom: 2
  },
  medium: {
    label: "Medium",
    time: 30,
    scoringRadiusKm: 2500,
    startZoom: 2
  },
  hard: {
    label: "Hard",
    time: 18,
    scoringRadiusKm: 1600,
    startZoom: 2
  }
};

const TOTAL_ROUNDS = 5;
const MAX_SCORE_PER_ROUND = 1000;
const LEADERBOARD_KEY = "neonGeoGuessLeaderboard";

/* =========================================================
   DOM ELEMENTS
========================================================= */

const loadingScreen = document.getElementById("loadingScreen");

const gameHud = document.getElementById("gameHud");
const startScreen = document.getElementById("startScreen");
const finalScreen = document.getElementById("finalScreen");
const resultPanel = document.getElementById("resultPanel");

const playBtn = document.getElementById("playBtn");
const restartTopBtn = document.getElementById("restartTopBtn");
const restartFinalBtn = document.getElementById("restartFinalBtn");
const nextRoundBtn = document.getElementById("nextRoundBtn");

const difficultySelect = document.getElementById("difficultySelect");

const targetPlace = document.getElementById("targetPlace");
const roundDisplay = document.getElementById("roundDisplay");
const scoreDisplay = document.getElementById("scoreDisplay");
const timerDisplay = document.getElementById("timerDisplay");

const resultTitle = document.getElementById("resultTitle");
const resultDescription = document.getElementById("resultDescription");
const roundScoreBadge = document.getElementById("roundScoreBadge");
const actualPlaceText = document.getElementById("actualPlaceText");
const distanceText = document.getElementById("distanceText");
const accuracyText = document.getElementById("accuracyText");

const finalScoreText = document.getElementById("finalScoreText");
const finalMessage = document.getElementById("finalMessage");
const leaderboardList = document.getElementById("leaderboardList");

const confettiCanvas = document.getElementById("confettiCanvas");
const confettiCtx = confettiCanvas.getContext("2d");

/* =========================================================
   GAME STATE
========================================================= */

let map;
let countryOutlineLayer;

let currentRound = 1;
let totalScore = 0;
let displayedScore = 0;
let currentLocation = null;
let usedLocationIndexes = [];

let difficulty = difficultySettings.medium;
let timeLeft = difficulty.time;
let timerInterval = null;
let roundLocked = false;

let guessMarker = null;
let actualMarker = null;
let connectionLine = null;

/* =========================================================
   MAP INITIALIZATION
========================================================= */

function initializeMap() {
  map = L.map("map", {
    center: [20, 0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 6,
    zoomControl: true,
    worldCopyJump: false,
    maxBounds: [
      [-85, -180],
      [85, 180]
    ],
    maxBoundsViscosity: 1.0
  });

  /*
    Stable dark basemap.
    This avoids the broken tile problem seen earlier with partial tile loading.
  */
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: "abcd",
    maxZoom: 19,
    noWrap: true
  }).addTo(map);

  map.on("click", handleMapClick);

  loadCountryOutlines();

  setTimeout(() => {
    map.invalidateSize(true);
  }, 300);
}

/* =========================================================
   COUNTRY OUTLINES
========================================================= */

function loadCountryOutlines() {
  fetch("https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
    .then(response => response.json())
    .then(data => {
      countryOutlineLayer = L.geoJSON(data, {
        style: {
          color: "#22d3ee",
          weight: 0.7,
          opacity: 0.48,
          fillOpacity: 0
        },
        interactive: false
      }).addTo(map);
    })
    .catch(() => {
      console.warn("Country outlines could not be loaded.");
    });
}

/* =========================================================
   START GAME
========================================================= */

function startGame() {
  difficulty = difficultySettings[difficultySelect.value];

  currentRound = 1;
  totalScore = 0;
  displayedScore = 0;
  usedLocationIndexes = [];
  roundLocked = false;

  startScreen.classList.add("hidden");
  finalScreen.classList.add("hidden");
  resultPanel.classList.add("hidden");
  gameHud.classList.remove("hidden");

  clearMapGraphics();
  updateHud();

  setTimeout(() => {
    map.invalidateSize(true);
    map.setView([20, 0], difficulty.startZoom, {
      animate: true
    });
  }, 250);

  startRound();
}

/* =========================================================
   ROUND LOGIC
========================================================= */

function startRound() {
  clearMapGraphics();

  roundLocked = false;
  currentLocation = getRandomLocation();

  targetPlace.textContent = `${currentLocation.icon} ${currentLocation.name}`;

  timeLeft = difficulty.time;
  updateHud();
  startTimer();

  map.setView([20, 0], difficulty.startZoom, {
    animate: true,
    duration: 0.8
  });
}

function getRandomLocation() {
  if (usedLocationIndexes.length >= famousLocations.length) {
    usedLocationIndexes = [];
  }

  let randomIndex;

  do {
    randomIndex = Math.floor(Math.random() * famousLocations.length);
  } while (usedLocationIndexes.includes(randomIndex));

  usedLocationIndexes.push(randomIndex);

  return famousLocations[randomIndex];
}

/* =========================================================
   TIMER
========================================================= */

function startTimer() {
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function updateTimerDisplay() {
  timerDisplay.textContent = `${timeLeft}s`;

  timerDisplay.classList.remove("safe", "warning", "danger");

  if (timeLeft <= 5) {
    timerDisplay.classList.add("danger");
  } else if (timeLeft <= 10) {
    timerDisplay.classList.add("warning");
  } else {
    timerDisplay.classList.add("safe");
  }
}

/* =========================================================
   MAP CLICK HANDLER
========================================================= */

function handleMapClick(event) {
  if (roundLocked || !currentLocation) return;

  const guessedLatLng = event.latlng;
  finishRound(guessedLatLng);
}

/* =========================================================
   FINISH ROUND
========================================================= */

function finishRound(guessedLatLng) {
  roundLocked = true;
  clearInterval(timerInterval);

  const actualLatLng = L.latLng(currentLocation.lat, currentLocation.lng);

  const distanceKm = calculateDistanceKm(
    guessedLatLng.lat,
    guessedLatLng.lng,
    actualLatLng.lat,
    actualLatLng.lng
  );

  const roundScore = calculateScore(distanceKm);
  const accuracy = calculateAccuracy(distanceKm);

  totalScore += roundScore;
  animateScoreCounter(displayedScore, totalScore);
  displayedScore = totalScore;

  addGuessMarker(guessedLatLng);
  addActualMarker(actualLatLng);
  addConnectionLine(guessedLatLng, actualLatLng);
  fitMapToResult(guessedLatLng, actualLatLng);

  showPopup(guessedLatLng, distanceKm, roundScore);
  showResultPanel(distanceKm, roundScore, accuracy);

  if (roundScore >= 850) {
    launchConfetti();
  }
}

/* =========================================================
   TIMEOUT
========================================================= */

function handleTimeout() {
  if (roundLocked) return;

  roundLocked = true;

  const actualLatLng = L.latLng(currentLocation.lat, currentLocation.lng);

  addActualMarker(actualLatLng);

  map.setView(actualLatLng, 4, {
    animate: true,
    duration: 0.8
  });

  showTimeoutResult();
}

/* =========================================================
   DISTANCE AND SCORE
========================================================= */

function calculateDistanceKm(lat1, lng1, lat2, lng2) {
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function calculateScore(distanceKm) {
  const score =
    MAX_SCORE_PER_ROUND *
    Math.exp(-distanceKm / difficulty.scoringRadiusKm);

  return Math.max(0, Math.round(score));
}

function calculateAccuracy(distanceKm) {
  const accuracy =
    100 * Math.exp(-distanceKm / difficulty.scoringRadiusKm);

  return Math.max(0, Math.round(accuracy));
}

function formatDistance(distanceKm) {
  const miles = distanceKm * 0.621371;

  return `${Math.round(distanceKm).toLocaleString()} km / ${Math.round(miles).toLocaleString()} mi`;
}

/* =========================================================
   MAP MARKERS AND LINE
========================================================= */

function addGuessMarker(latlng) {
  const icon = L.divIcon({
    className: "",
    html: '<div class="guess-marker"></div>',
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });

  guessMarker = L.marker(latlng, { icon }).addTo(map);
}

function addActualMarker(latlng) {
  const icon = L.divIcon({
    className: "",
    html: '<div class="actual-marker"></div>',
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });

  actualMarker = L.marker(latlng, { icon }).addTo(map);

  actualMarker.bindPopup(`
    <div class="popup-title">${currentLocation.icon} ${currentLocation.name}</div>
    <div class="popup-line">${currentLocation.description}</div>
  `);
}

function addConnectionLine(guessLatLng, actualLatLng) {
  connectionLine = L.polyline([guessLatLng, actualLatLng], {
    color: "#22d3ee",
    weight: 3,
    opacity: 0.9,
    dashArray: "8 10"
  }).addTo(map);
}

function fitMapToResult(guessLatLng, actualLatLng) {
  const bounds = L.latLngBounds([guessLatLng, actualLatLng]);

  map.fitBounds(bounds, {
    paddingTopLeft: [60, 110],
    paddingBottomRight: [60, 220],
    maxZoom: 5,
    animate: true,
    duration: 0.8
  });
}

function showPopup(guessLatLng, distanceKm, roundScore) {
  L.popup({
    closeButton: true,
    autoClose: false,
    closeOnClick: false
  })
    .setLatLng(guessLatLng)
    .setContent(`
      <div class="popup-title">🎯 Your Guess</div>
      <div class="popup-line"><strong>Actual:</strong> ${currentLocation.name}</div>
      <div class="popup-line"><strong>Distance:</strong> ${formatDistance(distanceKm)}</div>
      <div class="popup-line"><strong>Score:</strong> ${roundScore}</div>
    `)
    .openOn(map);
}

/* =========================================================
   RESULT PANEL
========================================================= */

function showResultPanel(distanceKm, roundScore, accuracy) {
  resultPanel.classList.remove("hidden");

  resultTitle.textContent = getResultTitle(roundScore);
  resultDescription.textContent = currentLocation.description;

  roundScoreBadge.textContent = `+${roundScore}`;
  actualPlaceText.textContent = currentLocation.name;
  distanceText.textContent = formatDistance(distanceKm);
  accuracyText.textContent = `${accuracy}%`;

  nextRoundBtn.textContent =
    currentRound >= TOTAL_ROUNDS ? "See Final Score 🏁" : "Next Round ➜";
}

function showTimeoutResult() {
  resultPanel.classList.remove("hidden");

  resultTitle.textContent = "⏰ Time's Up!";
  resultDescription.textContent = `The correct answer was ${currentLocation.name}.`;

  roundScoreBadge.textContent = "+0";
  actualPlaceText.textContent = currentLocation.name;
  distanceText.textContent = "No guess";
  accuracyText.textContent = "0%";

  nextRoundBtn.textContent =
    currentRound >= TOTAL_ROUNDS ? "See Final Score 🏁" : "Next Round ➜";
}

function getResultTitle(score) {
  if (score >= 900) return "🔥 Legendary Guess!";
  if (score >= 750) return "🎯 Excellent!";
  if (score >= 550) return "⚡ Nice Accuracy!";
  if (score >= 300) return "🧭 Not Bad!";
  return "🌍 Keep Exploring!";
}

/* =========================================================
   NEXT ROUND AND FINAL SCREEN
========================================================= */

function nextRound() {
  if (currentRound >= TOTAL_ROUNDS) {
    endGame();
    return;
  }

  currentRound++;
  resultPanel.classList.add("hidden");
  updateHud();
  startRound();
}

function endGame() {
  clearInterval(timerInterval);

  gameHud.classList.add("hidden");
  resultPanel.classList.add("hidden");
  finalScreen.classList.remove("hidden");

  animateFinalScore(totalScore);
  saveLeaderboardScore(totalScore);
  renderLeaderboard();

  finalMessage.textContent = getFinalMessage(totalScore);
}

function getFinalMessage(score) {
  if (score >= 4300) {
    return "Outstanding! You have elite geography instincts.";
  }

  if (score >= 3300) {
    return "Great job! You found the world’s landmarks with strong accuracy.";
  }

  if (score >= 2200) {
    return "Good performance! A little more practice will make you sharper.";
  }

  if (score >= 1000) {
    return "Nice effort! Every round helps you learn the map better.";
  }

  return "Keep exploring! The world is big, and that is what makes it fun.";
}

/* =========================================================
   LOCALSTORAGE LEADERBOARD
========================================================= */

function getLeaderboard() {
  const saved = localStorage.getItem(LEADERBOARD_KEY);

  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function saveLeaderboardScore(score) {
  const leaderboard = getLeaderboard();

  const newEntry = {
    score,
    difficulty: difficulty.label,
    date: new Date().toLocaleDateString()
  };

  leaderboard.push(newEntry);

  leaderboard.sort((a, b) => b.score - a.score);

  const topFive = leaderboard.slice(0, 5);

  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(topFive));
}

function renderLeaderboard() {
  const leaderboard = getLeaderboard();

  leaderboardList.innerHTML = "";

  if (leaderboard.length === 0) {
    leaderboardList.innerHTML = "<li>No scores yet</li>";
    return;
  }

  leaderboard.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.score.toLocaleString()} points — ${entry.difficulty} — ${entry.date}`;
    leaderboardList.appendChild(li);
  });
}

/* =========================================================
   ANIMATED SCORE COUNTERS
========================================================= */

function animateScoreCounter(from, to) {
  const duration = 700;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(from + (to - from) * eased);

    scoreDisplay.textContent = value.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function animateFinalScore(score) {
  const duration = 1000;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(score * eased);

    finalScoreText.textContent = value.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* =========================================================
   CONFETTI EFFECT
========================================================= */

let confettiPieces = [];

function resizeConfettiCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

function launchConfetti() {
  resizeConfettiCanvas();

  confettiPieces = [];

  const colors = ["#22d3ee", "#3b82f6", "#22c55e", "#ec4899", "#facc15"];

  for (let i = 0; i < 140; i++) {
    confettiPieces.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * -confettiCanvas.height,
      size: Math.random() * 7 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 4 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 8 - 4
    });
  }

  animateConfetti();
}

function animateConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiPieces.forEach(piece => {
    confettiCtx.save();
    confettiCtx.translate(piece.x, piece.y);
    confettiCtx.rotate((piece.rotation * Math.PI) / 180);
    confettiCtx.fillStyle = piece.color;
    confettiCtx.fillRect(
      -piece.size / 2,
      -piece.size / 2,
      piece.size,
      piece.size
    );
    confettiCtx.restore();

    piece.y += piece.speed;
    piece.rotation += piece.rotationSpeed;
  });

  confettiPieces = confettiPieces.filter(
    piece => piece.y < confettiCanvas.height + 20
  );

  if (confettiPieces.length > 0) {
    requestAnimationFrame(animateConfetti);
  } else {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

/* =========================================================
   HUD UPDATE
========================================================= */

function updateHud() {
  roundDisplay.textContent = `${currentRound} / ${TOTAL_ROUNDS}`;
  scoreDisplay.textContent = totalScore.toLocaleString();
  updateTimerDisplay();
}

/* =========================================================
   CLEAR MAP GRAPHICS
========================================================= */

function clearMapGraphics() {
  if (guessMarker) {
    map.removeLayer(guessMarker);
    guessMarker = null;
  }

  if (actualMarker) {
    map.removeLayer(actualMarker);
    actualMarker = null;
  }

  if (connectionLine) {
    map.removeLayer(connectionLine);
    connectionLine = null;
  }

  map.closePopup();
}

/* =========================================================
   RESTART GAME
========================================================= */

function restartGame() {
  clearInterval(timerInterval);
  clearMapGraphics();

  currentRound = 1;
  totalScore = 0;
  displayedScore = 0;
  currentLocation = null;
  usedLocationIndexes = [];
  roundLocked = false;

  gameHud.classList.add("hidden");
  resultPanel.classList.add("hidden");
  finalScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");

  map.setView([20, 0], 2, {
    animate: true,
    duration: 0.8
  });
}

/* =========================================================
   EVENT LISTENERS
========================================================= */

playBtn.addEventListener("click", startGame);
nextRoundBtn.addEventListener("click", nextRound);
restartTopBtn.addEventListener("click", restartGame);
restartFinalBtn.addEventListener("click", restartGame);

window.addEventListener("resize", () => {
  resizeConfettiCanvas();

  if (map) {
    setTimeout(() => {
      map.invalidateSize(true);
    }, 150);
  }
});

/* =========================================================
   APP BOOT
========================================================= */

window.addEventListener("load", () => {
  initializeMap();
  resizeConfettiCanvas();

  setTimeout(() => {
    loadingScreen.classList.add("fade-out");

    setTimeout(() => {
      loadingScreen.classList.add("hidden");
      map.invalidateSize(true);
    }, 550);
  }, 900);
});