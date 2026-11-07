const BODY_PARTS = [
  ["head", "Head", "头"], ["eyes", "Eyes", "眼睛"], ["ears", "Ears", "耳朵"], ["nose", "Nose", "鼻子"],
  ["mouth", "Mouth", "嘴巴"], ["hands", "Hands", "手"], ["feet", "Feet", "脚"], ["tummy", "Tummy", "肚子"]
].map(([id, word, zh]) => ({
  id, word, zh,
  image: `./assets/images/${id}.webp`,
  wordAudio: `./assets/audio/${id}-word.mp3`
}));

const ACTIONS = [
  { id: "touch-your-nose", text: "Touch your nose.", audio: "./assets/audio/touch-your-nose.mp3", tip: "洗脸时说：Touch your nose." },
  { id: "touch-your-head", text: "Touch your head.", audio: "./assets/audio/touch-your-head.mp3", tip: "出门前说：Touch your head." },
  { id: "show-me-your-hands", text: "Show me your hands.", audio: "./assets/audio/show-me-your-hands.mp3", tip: "洗手时说：Show me your hands." },
  { id: "point-to-your-eyes", text: "Point to your eyes.", audio: "./assets/audio/point-to-your-eyes.mp3", tip: "读绘本时说：Point to your eyes." },
  { id: "clap-your-hands", text: "Clap your hands!", audio: "./assets/audio/clap-your-hands.mp3", tip: "唱歌时说：Clap your hands!" }
];

const AUDIO = {
  lesson: "./assets/audio/lets-learn-body.mp3",
  great: "./assets/audio/great-job.mp3",
  tryAgain: "./assets/audio/try-again.mp3",
  didIt: "./assets/audio/we-did-it.mp3"
};

const $ = id => document.getElementById(id);
const elements = {
  cards: $("cards"), explore: $("exploreMode"), find: $("findMode"), doMode: $("doMode"),
  prompt: $("gamePrompt"), promptText: $("promptText"), promptOverline: $("promptOverline"), counter: $("questionCounter"),
  title: $("sectionTitle"), hint: $("sectionHint"), count: $("countPill"), feedback: $("feedback"),
  doPanel: $("doPanel"), doText: $("doText"), doProgress: $("doProgress"), parentTip: $("parentTipText")
};

let mode = "explore";
let currentQuestion = null;
let previousAnswer = null;
let questionNumber = 0;
let lockedAnswer = false;
let nextQuestionTimer = null;
let activeAudio = null;
let actionIndex = 0;
let actionDone = 0;

function playAudio(url) {
  if (activeAudio) { activeAudio.pause(); activeAudio.currentTime = 0; }
  activeAudio = new Audio(url);
  activeAudio.volume = .95;
  activeAudio.play().catch(() => {});
}

function shuffle(values) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function soundIcon() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3Zm12.2-1.4a6 6 0 0 1 0 8.8M18 5a9.5 9.5 0 0 1 0 14"/></svg>';
}

function cardMarkup(part) {
  return `<button class="body-card" type="button" data-id="${part.id}" aria-label="${part.word}，${part.zh}，点击听发音">
    <img src="${part.image}" alt="${part.zh}真实照片" draggable="false">
    <span class="body-card-bottom"><span><b>${part.word}</b><small>${part.zh}</small></span><i>${soundIcon()}</i></span>
  </button>`;
}

function renderCards(parts) {
  elements.cards.innerHTML = parts.map(cardMarkup).join("");
  elements.cards.classList.toggle("is-game", mode === "find");
  elements.cards.hidden = mode === "do";
}

function resetAudio() {
  if (activeAudio) { activeAudio.pause(); activeAudio.currentTime = 0; }
  activeAudio = null;
}

function clearInteraction() {
  clearTimeout(nextQuestionTimer);
  resetAudio();
  elements.feedback.textContent = "";
  lockedAnswer = false;
}

function findPart(id) { return BODY_PARTS.find(part => part.id === id); }

function newQuestion() {
  clearInteraction();
  const candidates = BODY_PARTS.filter(part => part.id !== previousAnswer);
  currentQuestion = candidates[Math.floor(Math.random() * candidates.length)];
  previousAnswer = currentQuestion.id;
  const others = shuffle(BODY_PARTS.filter(part => part.id !== currentQuestion.id)).slice(0, 2);
  renderCards(shuffle([currentQuestion, ...others]));
  questionNumber += 1;
  elements.promptText.textContent = `Where ${["eyes", "ears", "hands", "feet"].includes(currentQuestion.id) ? "are" : "is"} the ${currentQuestion.word.toLowerCase()}?`;
  elements.counter.textContent = `${String(questionNumber).padStart(2, "0")} / ∞`;
  playAudio(`./assets/audio/${["eyes", "ears", "hands", "feet"].includes(currentQuestion.id) ? "where-are" : "where-is"}-your-${currentQuestion.id}.mp3`);
}

function updateActionProgress() {
  [...elements.doProgress.children].forEach((dot, index) => dot.classList.toggle("done", index < actionDone));
}

function showAction() {
  const action = ACTIONS[actionIndex % ACTIONS.length];
  elements.doText.textContent = action.text;
  elements.parentTip.innerHTML = action.tip;
  updateActionProgress();
  playAudio(action.audio);
}

function setMode(next) {
  if (next === mode) return;
  clearInteraction();
  mode = next;
  const isFind = mode === "find";
  const isDo = mode === "do";
  elements.explore.classList.toggle("is-selected", mode === "explore");
  elements.find.classList.toggle("is-selected", isFind);
  elements.doMode.classList.toggle("is-selected", isDo);
  elements.explore.setAttribute("aria-pressed", String(mode === "explore"));
  elements.find.setAttribute("aria-pressed", String(isFind));
  elements.doMode.setAttribute("aria-pressed", String(isDo));
  elements.prompt.hidden = !isFind;
  elements.doPanel.hidden = !isDo;
  elements.cards.hidden = isDo;
  elements.count.hidden = isFind || isDo;
  if (isFind) {
    elements.title.innerHTML = '听声音，找一找<span>✳</span>';
    elements.hint.textContent = "仔细听问题，从图卡里找到正确的身体部位。";
    elements.promptOverline.textContent = "LISTEN & FIND";
    newQuestion();
  } else if (isDo) {
    elements.title.innerHTML = '听指令，做一做<span>✳</span>';
    elements.hint.textContent = "听一听，和身边的大人一起做出来。";
    actionIndex = 0;
    actionDone = 0;
    showAction();
  } else {
    elements.title.innerHTML = '认识我的身体<span>✳</span>';
    elements.hint.textContent = "点一张卡片，先看一看，再听英语怎么说。";
    renderCards(BODY_PARTS);
  }
}

function animate(card, className) {
  card.classList.remove(className);
  void card.offsetWidth;
  card.classList.add(className);
  setTimeout(() => card.classList.remove(className), 650);
}

function onCardClick(card) {
  const part = findPart(card.dataset.id);
  if (!part) return;
  if (mode === "explore") {
    animate(card, "is-active");
    playAudio(part.wordAudio);
    return;
  }
  if (lockedAnswer) return;
  if (part.id === currentQuestion.id) {
    lockedAnswer = true;
    card.classList.add("is-correct");
    elements.feedback.textContent = "找到了！Great job!";
    playAudio(AUDIO.great);
    nextQuestionTimer = setTimeout(newQuestion, 1400);
  } else {
    animate(card, "is-wrong");
    elements.feedback.textContent = "再试一次 · Try again";
    playAudio(AUDIO.tryAgain);
  }
}

elements.cards.addEventListener("click", event => {
  const card = event.target.closest(".body-card");
  if (card) onCardClick(card);
});
elements.explore.addEventListener("click", () => setMode("explore"));
elements.find.addEventListener("click", () => setMode("find"));
elements.doMode.addEventListener("click", () => setMode("do"));
$("repeatQuestion").addEventListener("click", () => { if (currentQuestion && !lockedAnswer) playAudio(`./assets/audio/${["eyes", "ears", "hands", "feet"].includes(currentQuestion.id) ? "where-are" : "where-is"}-your-${currentQuestion.id}.mp3`); });
$("doListen").addEventListener("click", () => showAction());
$("didIt").addEventListener("click", () => {
  actionDone += 1;
  playAudio(actionDone >= 3 ? AUDIO.didIt : AUDIO.great);
  if (actionDone >= 3) actionDone = 0;
  actionIndex += 1;
  setTimeout(showAction, 800);
});
$("startButton").addEventListener("click", () => {
  $("startScreen").remove();
  playAudio(AUDIO.lesson);
  elements.explore.focus();
});

const creditsDialog = $("creditsDialog");
$("creditsButton").addEventListener("click", async () => {
  if (!$('creditsList').children.length) {
    try {
      const response = await fetch("./assets/credits.json");
      const data = await response.json();
      const list = $("creditsList");
      data.items.forEach(item => {
        const row = document.createElement("div");
        row.className = "credit-item";
        row.innerHTML = `<strong>${item.output.replace("lessons/body/assets/images/", "")} · ${item.license}</strong><span>${item.author}</span> · <a href="${item.source_page}" target="_blank" rel="noopener noreferrer">查看来源</a>`;
        list.appendChild(row);
      });
    } catch (_) { $("creditsList").textContent = "来源清单暂时无法加载。"; }
  }
  creditsDialog.showModal();
});
$("closeCredits").addEventListener("click", () => creditsDialog.close());
creditsDialog.addEventListener("click", event => { if (event.target === creditsDialog) creditsDialog.close(); });

renderCards(BODY_PARTS);
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("../../sw.js").catch(() => {}));
