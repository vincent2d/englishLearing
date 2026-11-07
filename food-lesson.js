const FOODS = [
  { id: "cake", word: "Cake", zh: "蛋糕", emoji: "🍰" },
  { id: "rice", word: "Rice", zh: "米饭 · 稻米", emoji: "🍚" },
  { id: "bread", word: "Bread", zh: "面包", emoji: "🥖" },
  { id: "fish", word: "Fish", zh: "鱼 · 鱼肉", emoji: "🐟" },
  { id: "chips", word: "Chips", zh: "薯片 · 炸薯条", emoji: "🍟" }
].map(food => ({ ...food,
  image: `./food-assets/images/${food.id}.webp`,
  wordAudio: `./food-assets/audio/${food.id}-word.mp3`,
  likeAudio: `./food-assets/audio/${food.id}-like.mp3`
}));

const $ = id => document.getElementById(id);
const audio = { current: null, unlocked: false };
let selectedFood = null;
let gameTarget = null;
let gameScore = 0;
let gameActive = false;

function unlockAudio() {
  if (audio.unlocked) return;
  audio.unlocked = true;
  // Creating the element in the click gesture helps Safari permit later playback.
  const silent = new Audio();
  silent.volume = 0;
  silent.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";
  silent.play().catch(() => {});
}
function play(url) {
  if (audio.current) { audio.current.pause(); audio.current.currentTime = 0; }
  audio.current = new Audio(url);
  audio.current.volume = .95;
  audio.current.play().catch(() => {});
}
function foodCard(food, extra = "") {
  return `<button class="food-card ${extra}" type="button" data-food="${food.id}" aria-label="${food.word}，${food.zh}，点击听发音">
    <img src="${food.image}" alt="${food.zh}的图片" draggable="false"><span class="food-meta"><span><b class="food-word">${food.word}</b><small class="food-zh">${food.zh}</small></span><span class="speak" aria-hidden="true">🔊</span></span>
  </button>`;
}
function findFood(id) { return FOODS.find(food => food.id === id); }
function setSelected(food) {
  selectedFood = food;
  $("answerText").innerHTML = `I like <u>${food.word.toLowerCase()}</u>.`;
  document.querySelectorAll(".choice").forEach(button => button.classList.toggle("selected", button.dataset.food === food.id));
  play(food.likeAudio);
}
function render() {
  $("foodGrid").innerHTML = FOODS.map(food => foodCard(food)).join("");
  $("choiceRow").innerHTML = FOODS.map(food => `<button class="choice" type="button" data-food="${food.id}">${food.emoji} ${food.word}</button>`).join("");
}
function pulseCard(card) {
  card.classList.remove("active");
  void card.offsetWidth;
  card.classList.add("active");
  setTimeout(() => card.classList.remove("active"), 500);
}
function gameRound() {
  gameActive = true;
  $("startGame").textContent = "换一个词  →";
  gameTarget = FOODS[Math.floor(Math.random() * FOODS.length)];
  $("gamePrompt").textContent = `Find the ${gameTarget.word.toLowerCase()}!`;
  // Always include the target, then add two different distractors.
  const distractors = [...FOODS]
    .filter(food => food.id !== gameTarget.id)
    .sort(() => Math.random() - .5)
    .slice(0, 2);
  $("gameOptions").innerHTML = [gameTarget, ...distractors]
    .sort(() => Math.random() - .5)
    .map(food => foodCard(food, "game-option"))
    .join("");
  $("gameFeedback").textContent = "";
  play(`./food-assets/audio/${gameTarget.id}-word.mp3`);
}
function answerGame(card) {
  if (!gameActive) return;
  const food = findFood(card.dataset.food);
  if (food.id === gameTarget.id) {
    card.classList.add("correct");
    gameScore += 1;
    $("score").querySelector("b").textContent = gameScore;
    $("gameFeedback").textContent = "Great! 找到了！ ⭐";
    play(food.likeAudio);
    gameActive = false;
  } else {
    card.classList.remove("wrong");
    void card.offsetWidth;
    card.classList.add("wrong");
    $("gameFeedback").textContent = "Try again · 再听听看";
  }
}

render();
$("startLesson").addEventListener("click", () => {
  unlockAudio();
  $("welcome").remove();
  play("./food-assets/audio/question.mp3");
});
$("heroPlay").addEventListener("click", () => play("./food-assets/audio/question.mp3"));
$("questionPlay").addEventListener("click", () => play("./food-assets/audio/question.mp3"));
$("foodGrid").addEventListener("click", event => {
  const card = event.target.closest(".food-card");
  if (!card) return;
  const food = findFood(card.dataset.food);
  pulseCard(card);
  play(food.wordAudio);
});
$("choiceRow").addEventListener("click", event => {
  const button = event.target.closest(".choice");
  if (button) setSelected(findFood(button.dataset.food));
});
$("startGame").addEventListener("click", () => { unlockAudio(); gameRound(); });
$("gameListen").addEventListener("click", () => { if (gameTarget) play(`./food-assets/audio/${gameTarget.id}-word.mp3`); });
$("gameOptions").addEventListener("click", event => {
  const card = event.target.closest(".game-option");
  if (card) answerGame(card);
});

