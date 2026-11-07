const VEHICLES = [
  ["car", "Car"], ["bus", "Bus"], ["train", "Train"],
  ["airplane", "Airplane"], ["ship", "Ship"], ["bicycle", "Bicycle"],
  ["fire-truck", "Fire Truck"], ["police-car", "Police Car"],
  ["ambulance", "Ambulance"], ["helicopter", "Helicopter"]
].map(([id, word]) => ({ id, word, image: `./assets/images/${id}.webp`,
  effect: `./assets/audio/${id}-fx.mp3`, voice: `./assets/audio/${id}-word.mp3`,
  question: `./assets/audio/${id}-question.mp3` }));

const $ = id => document.getElementById(id);
const elements = {
  cards: $("cards"), explore: $("exploreMode"), game: $("gameMode"),
  prompt: $("gamePrompt"), promptText: $("promptText"), questionCounter: $("questionCounter"),
  title: $("sectionTitle"), hint: $("sectionHint"), count: $("countPill"),
  feedback: $("feedback"), start: $("startScreen")
};
let mode = "explore";
let currentQuestion = null;
let questionNumber = 0;
let previousAnswer = null;
let lockedAnswer = false;
let nextQuestionTimer = null;
let activeCard = null;

class AudioPipeline {
  constructor() {
    this.context = null;
    this.buffers = new Map();
    this.pending = new Map();
    this.sources = [];
    this.fallback = [];
    this.generation = 0;
  }
  async unlock() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.context = new AudioContextClass();
    }
    const resumed = this.context.resume();
    // Start the silent buffer before yielding from the touch gesture on iOS.
    const silent = this.context.createBuffer(1, 1, this.context.sampleRate);
    const source = this.context.createBufferSource();
    source.buffer = silent;
    source.connect(this.context.destination);
    source.start(0);
    await resumed;
  }
  async load(url) {
    if (this.buffers.has(url)) return this.buffers.get(url);
    if (this.pending.has(url)) return this.pending.get(url);
    if (!this.context) return null;
    const pending = fetch(url)
      .then(response => { if (!response.ok) throw new Error(`${response.status} ${url}`); return response.arrayBuffer(); })
      .then(bytes => this.context.decodeAudioData(bytes))
      .then(buffer => { this.buffers.set(url, buffer); return buffer; })
      .catch(error => { console.warn("Audio unavailable:", error); return null; })
      .finally(() => this.pending.delete(url));
    this.pending.set(url, pending);
    return pending;
  }
  preload() {
    const urls = VEHICLES.flatMap(vehicle => [vehicle.effect, vehicle.voice, vehicle.question]);
    urls.push("./assets/audio/applause-fx.mp3", "./assets/audio/star-fx.mp3",
      "./assets/audio/wrong-fx.mp3", "./assets/audio/try-again.mp3");
    urls.forEach(url => this.load(url));
  }
  stop() {
    this.generation++;
    for (const source of this.sources) { try { source.stop(); } catch (_) {} }
    this.sources = [];
    for (const audio of this.fallback) { audio.pause(); audio.currentTime = 0; }
    this.fallback = [];
  }
  schedule(buffer, when, maxDuration, volume = 1) {
    if (!buffer || !this.context) return;
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    source.buffer = buffer;
    gain.gain.value = volume;
    source.connect(gain).connect(this.context.destination);
    source.start(when, 0, Math.min(buffer.duration, maxDuration));
    this.sources.push(source);
  }
  async play(url, volume = 1) {
    this.stop();
    const token = this.generation;
    const buffer = await this.load(url);
    if (token !== this.generation) return;
    if (buffer && this.context) this.schedule(buffer, this.context.currentTime, buffer.duration, volume);
    else this.playFallback(url, volume, token);
  }
  async playCard(vehicle) {
    this.stop();
    const token = this.generation;
    const [effect, voice] = await Promise.all([this.load(vehicle.effect), this.load(vehicle.voice)]);
    if (token !== this.generation) return;
    if (this.context && effect && voice) {
      const beat = this.context.currentTime + 0.015;
      this.schedule(effect, beat, 1.5, 0.85);
      this.schedule(voice, beat + 1.5, 1.3, 1);
    } else {
      this.playFallback(vehicle.effect, 0.85, token);
      setTimeout(() => { if (token === this.generation) this.playFallback(vehicle.voice, 1, token); }, 1500);
    }
  }
  async playCorrect() {
    this.stop();
    const token = this.generation;
    const [applause, star] = await Promise.all([
      this.load("./assets/audio/applause-fx.mp3"), this.load("./assets/audio/star-fx.mp3")
    ]);
    if (token !== this.generation) return;
    if (this.context) {
      const now = this.context.currentTime;
      this.schedule(applause, now, 1, 0.72);
      this.schedule(star, now + 0.12, 1, 0.8);
    }
  }
  async playWrong() {
    this.stop();
    const token = this.generation;
    const [error, voice] = await Promise.all([
      this.load("./assets/audio/wrong-fx.mp3"), this.load("./assets/audio/try-again.mp3")
    ]);
    if (token !== this.generation) return;
    if (this.context) {
      const now = this.context.currentTime;
      this.schedule(error, now, 0.35, 0.22);
      this.schedule(voice, now + 0.38, 1.1, 1);
    }
  }
  playFallback(url, volume, token) {
    if (token !== this.generation) return;
    const audio = new Audio(url);
    audio.volume = volume;
    this.fallback.push(audio);
    audio.play().catch(() => {});
  }
}
const audio = new AudioPipeline();

function soundIcon() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3Zm12.2-1.4a6 6 0 0 1 0 8.8M18 5a9.5 9.5 0 0 1 0 14"/></svg>';
}
function cardMarkup(vehicle) {
  return `<button class="card" type="button" data-id="${vehicle.id}" aria-label="${vehicle.word}，点击听声音和英文发音">
    <img class="card-image" src="${vehicle.image}" alt="真实的${vehicle.word}照片" draggable="false">
    <span class="card-bottom"><span class="card-word">${vehicle.word}</span><span class="card-sound">${soundIcon()}</span></span>
  </button>`;
}
function renderCards(vehicles) {
  elements.cards.innerHTML = vehicles.map(cardMarkup).join("");
  elements.cards.classList.toggle("is-game", mode === "game");
}
function animateCard(card, className) {
  card.classList.remove(className);
  void card.offsetWidth;
  card.classList.add(className);
  setTimeout(() => card.classList.remove(className), 650);
}
function clearInteraction() {
  clearTimeout(nextQuestionTimer);
  audio.stop();
  if (activeCard) activeCard.classList.remove("is-active");
  activeCard = null;
  elements.feedback.textContent = "";
  lockedAnswer = false;
}
function shuffle(values) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function newQuestion() {
  clearInteraction();
  const candidates = VEHICLES.filter(vehicle => vehicle.id !== previousAnswer);
  currentQuestion = candidates[Math.floor(Math.random() * candidates.length)];
  previousAnswer = currentQuestion.id;
  const others = shuffle(VEHICLES.filter(vehicle => vehicle.id !== currentQuestion.id)).slice(0, 2);
  renderCards(shuffle([currentQuestion, ...others]));
  questionNumber++;
  elements.promptText.textContent = `Where is the ${currentQuestion.word.toLowerCase()}?`;
  elements.questionCounter.textContent = String(questionNumber).padStart(2, "0") + " / ∞";
  audio.play(currentQuestion.question);
}
function setMode(next) {
  if (next === mode) return;
  clearInteraction();
  mode = next;
  const game = mode === "game";
  elements.explore.classList.toggle("is-selected", !game);
  elements.game.classList.toggle("is-selected", game);
  elements.explore.setAttribute("aria-pressed", String(!game));
  elements.game.setAttribute("aria-pressed", String(game));
  elements.prompt.hidden = !game;
  elements.count.hidden = game;
  elements.title.innerHTML = game ? '听声音，找一找<span class="title-spark">✳</span>' : '探索会动的世界<span class="title-spark">✳</span>';
  elements.hint.textContent = game ? "仔细听问题，从照片里找到正确的交通工具。" : "点一张真实照片，先听它的声音，再听英文名字。";
  if (game) newQuestion(); else { currentQuestion = null; renderCards(VEHICLES); }
}
function spawnStars(card) {
  const box = card.getBoundingClientRect();
  for (let i = 0; i < 9; i++) {
    const star = document.createElement("span");
    star.textContent = "★";
    star.style.cssText = `position:fixed;z-index:20;pointer-events:none;color:${i % 2 ? "#f4c95a" : "#e8a83b"};font-size:${18 + Math.random() * 15}px;left:${box.left + box.width * Math.random()}px;top:${box.top + box.height * .3}px;transition:transform 1s ease-out,opacity 1s ease-out;`;
    document.body.appendChild(star);
    requestAnimationFrame(() => {
      star.style.transform = `translate(${(Math.random() - .5) * 140}px,${100 + Math.random() * 130}px) rotate(${Math.random() * 220}deg)`;
      star.style.opacity = "0";
    });
    setTimeout(() => star.remove(), 1100);
  }
}
function onCardClick(card) {
  const vehicle = VEHICLES.find(item => item.id === card.dataset.id);
  if (!vehicle) return;
  if (mode === "explore") {
    if (activeCard) activeCard.classList.remove("is-active");
    activeCard = card;
    animateCard(card, "is-active");
    audio.playCard(vehicle);
    return;
  }
  if (lockedAnswer) return;
  if (vehicle.id === currentQuestion.id) {
    lockedAnswer = true;
    card.classList.add("is-correct");
    elements.feedback.textContent = "找到了！Great job!";
    spawnStars(card);
    audio.playCorrect();
    nextQuestionTimer = setTimeout(newQuestion, 1500);
  } else {
    animateCard(card, "is-wrong");
    elements.feedback.textContent = "再试一次 · Try again";
    audio.playWrong();
  }
}

elements.cards.addEventListener("click", event => {
  const card = event.target.closest(".card");
  if (card) onCardClick(card);
});
elements.explore.addEventListener("click", () => setMode("explore"));
elements.game.addEventListener("click", () => setMode("game"));
$("repeatQuestion").addEventListener("click", () => {
  if (currentQuestion && !lockedAnswer) audio.play(currentQuestion.question);
});
// Unlock synchronously in the first user gesture, then decode all local media.
$("startButton").addEventListener("pointerdown", () => { audio.unlock().then(() => audio.preload()).catch(console.warn); }, { once: true });
$("startButton").addEventListener("click", async () => {
  await audio.unlock();
  audio.preload();
  elements.start.remove();
  $("exploreMode").focus();
});
renderCards(VEHICLES);

const creditsDialog = $("creditsDialog");
$("creditsButton").addEventListener("click", async () => {
  if (!$("creditsList").children.length) {
    try {
      const response = await fetch("./assets/credits.json");
      const data = await response.json();
      const list = $("creditsList");
      for (const item of data.items) {
        const row = document.createElement("div");
        row.className = "credit-item";
        const heading = document.createElement("strong");
        heading.textContent = item.source_title;
        const detail = document.createElement("span");
        detail.textContent = `${item.author} · ${item.license} · ${item.modification} · `;
        const link = document.createElement("a");
        link.href = item.source_page;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "查看原始文件";
        row.append(heading, detail, link);
        list.appendChild(row);
      }
    } catch (error) { $("creditsList").textContent = "来源清单暂时无法加载。"; }
  }
  creditsDialog.showModal();
});
$("closeCredits").addEventListener("click", () => creditsDialog.close());
creditsDialog.addEventListener("click", event => { if (event.target === creditsDialog) creditsDialog.close(); });

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(console.warn));
}
