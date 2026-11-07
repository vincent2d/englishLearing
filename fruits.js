const FRUITS = [
  ["apple", "Apple", "苹果"], ["banana", "Banana", "香蕉"],
  ["orange", "Orange", "橙子"], ["strawberry", "Strawberry", "草莓"],
  ["watermelon", "Watermelon", "西瓜"], ["grape", "Grape", "葡萄"],
  ["pear", "Pear", "梨"], ["pineapple", "Pineapple", "菠萝"]
].map(([id, word, zh]) => ({
  id, word, zh,
  image: `./fruit-assets/images/${id}-photo.webp`,
  sentenceAudio: `./fruit-assets/audio/${id}-sentence.mp3`,
  questionAudio: `./fruit-assets/audio/${id}-question.mp3`
}));

// Audio is generated offline with Microsoft Edge Neural Voice via edge-tts.
const AUDIO = {
  lesson: "./fruit-assets/audio/lets-learn-fruit.mp3",
  greatJob: "./fruit-assets/audio/great-job.mp3",
  tryAgain: "./fruit-assets/audio/try-again.mp3"
};

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
let activeAudio = null;

function playAudio(url) {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }
  activeAudio = new Audio(url);
  activeAudio.volume = .95;
  activeAudio.play().catch(() => {});
}
function fruitCard(fruit) {
  return `<button class="card" type="button" data-id="${fruit.id}" aria-label="${fruit.word}，${fruit.zh}，点击听发音">
    <img class="card-image" src="${fruit.image}" alt="真实${fruit.zh}照片" draggable="false">
    <span class="card-bottom"><span class="card-word">${fruit.word}</span><span class="card-sound" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 4V5L7 9H3Zm12.2-1.4a6 6 0 0 1 0 8.8M18 5a9.5 9.5 0 0 1 0 14"/></svg></span></span>
  </button>`;
}
function findFruit(id) { return FRUITS.find(fruit => fruit.id === id); }
function renderCards(fruits) {
  elements.cards.innerHTML = fruits.map(fruitCard).join("");
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
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }
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
  const candidates = FRUITS.filter(fruit => fruit.id !== previousAnswer);
  currentQuestion = candidates[Math.floor(Math.random() * candidates.length)];
  previousAnswer = currentQuestion.id;
  const others = shuffle(FRUITS.filter(fruit => fruit.id !== currentQuestion.id)).slice(0, 2);
  renderCards(shuffle([currentQuestion, ...others]));
  questionNumber++;
  elements.promptText.textContent = `Where is the ${currentQuestion.word.toLowerCase()}?`;
  elements.questionCounter.textContent = String(questionNumber).padStart(2, "0") + " / ∞";
  playAudio(currentQuestion.questionAudio);
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
  elements.title.innerHTML = game ? '听声音，找一找<span class="title-spark">✳</span>' : '发现甜甜的世界<span class="title-spark">✳</span>';
  elements.hint.textContent = game ? "仔细听问题，从图卡里找到正确的水果。" : "点一张水果卡，先看一看，再听英文名字。";
  if (game) newQuestion(); else { currentQuestion = null; renderCards(FRUITS); }
}
function spawnStars(card) {
  const box = card.getBoundingClientRect();
  for (let i = 0; i < 9; i++) {
    const star = document.createElement("span");
    star.textContent = i % 2 ? "✦" : "♥";
    star.style.cssText = `position:fixed;z-index:20;pointer-events:none;color:${i % 2 ? "#e9a45b" : "#e97968"};font-size:${18 + Math.random() * 15}px;left:${box.left + box.width * Math.random()}px;top:${box.top + box.height * .3}px;transition:transform 1s ease-out,opacity 1s ease-out;`;
    document.body.appendChild(star);
    requestAnimationFrame(() => {
      star.style.transform = `translate(${(Math.random() - .5) * 140}px,${100 + Math.random() * 130}px) rotate(${Math.random() * 220}deg)`;
      star.style.opacity = "0";
    });
    setTimeout(() => star.remove(), 1100);
  }
}
function onCardClick(card) {
  const fruit = findFruit(card.dataset.id);
  if (!fruit) return;
  if (mode === "explore") {
    if (activeCard) activeCard.classList.remove("is-active");
    activeCard = card;
    animateCard(card, "is-active");
    playAudio(fruit.sentenceAudio);
    return;
  }
  if (lockedAnswer) return;
  if (fruit.id === currentQuestion.id) {
    lockedAnswer = true;
    card.classList.add("is-correct");
    elements.feedback.textContent = "找到了！Great job!";
    spawnStars(card);
    playAudio(AUDIO.greatJob);
    nextQuestionTimer = setTimeout(newQuestion, 1500);
  } else {
    animateCard(card, "is-wrong");
    elements.feedback.textContent = "再试一次 · Try again";
    playAudio(AUDIO.tryAgain);
  }
}

elements.cards.addEventListener("click", event => { const card = event.target.closest(".card"); if (card) onCardClick(card); });
elements.explore.addEventListener("click", () => setMode("explore"));
elements.game.addEventListener("click", () => setMode("game"));
$("repeatQuestion").addEventListener("click", () => { if (currentQuestion && !lockedAnswer) playAudio(currentQuestion.questionAudio); });
$("startButton").addEventListener("click", () => { elements.start.remove(); playAudio(AUDIO.lesson); $("exploreMode").focus(); });
const creditsDialog = $("creditsDialog");
$("creditsButton").addEventListener("click", () => creditsDialog.showModal());
$("closeCredits").addEventListener("click", () => creditsDialog.close());
creditsDialog.addEventListener("click", event => { if (event.target === creditsDialog) creditsDialog.close(); });
renderCards(FRUITS);
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
