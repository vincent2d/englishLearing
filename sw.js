const CACHE = "treehouse-v8";
const IDS = ["car", "bus", "train", "airplane", "ship", "bicycle", "fire-truck", "police-car", "ambulance", "helicopter"];
const STATIC = ["/", "/index.html", "/home.css", "/vehicles.html", "/styles.css", "/app.js", "/food-lesson.html", "/food-lesson.css", "/food-lesson.js", "/fruits.html", "/fruits.css", "/fruits.js", "/lessons/body/body.html", "/lessons/body/body.css", "/lessons/body/body.js", "/manifest.json", "/assets/credits.json", "/assets/icon.svg", "/assets/icon-192.png", "/assets/icon-512.png", "/assets/apple-touch-icon.png"];
const MEDIA = IDS.flatMap(id => [`/assets/images/${id}.webp`, `/assets/audio/${id}-fx.mp3`, `/assets/audio/${id}-word.mp3`, `/assets/audio/${id}-question.mp3`]);
MEDIA.push("/assets/audio/applause-fx.mp3", "/assets/audio/star-fx.mp3", "/assets/audio/wrong-fx.mp3", "/assets/audio/try-again.mp3");
const FRUIT_IMAGES = ["apple", "banana", "orange", "strawberry", "watermelon", "grape", "pear", "pineapple"];
FRUIT_IMAGES.forEach(id => STATIC.push(`/fruit-assets/images/${id}-photo.webp`));
const FRUIT_AUDIO = [
  "lets-learn-fruit", "great-job", "try-again",
  ...FRUIT_IMAGES.flatMap(id => [`${id}-sentence`, `${id}-question`])
];
FRUIT_AUDIO.forEach(id => STATIC.push(`/fruit-assets/audio/${id}.mp3`));
const BODY_PARTS = ["head", "eyes", "ears", "nose", "mouth", "hands", "feet", "tummy"];
BODY_PARTS.forEach(id => STATIC.push(`/lessons/body/assets/images/${id}.webp`));
STATIC.push("/lessons/body/assets/images/body-character.webp");
STATIC.push("/lessons/body/assets/credits.json");
const BODY_AUDIO = [
  "lets-learn-body", "great-job", "try-again", "we-did-it",
  ...BODY_PARTS.map(id => `${id}-word`),
  "touch-your-head", "touch-your-nose", "show-me-your-hands", "point-to-your-eyes", "clap-your-hands",
  "where-is-your-head", "where-is-your-mouth", "where-is-your-nose", "where-is-your-tummy",
  "where-are-your-eyes", "where-are-your-ears", "where-are-your-hands", "where-are-your-feet"
];
BODY_AUDIO.forEach(id => STATIC.push(`/lessons/body/assets/audio/${id}.mp3`));
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll([...STATIC, ...MEDIA])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.match(request, { ignoreSearch: true }).then(cached => cached || fetch(request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(request, copy));
    }
    return response;
  }).catch(() => request.mode === "navigate" ? caches.match("/index.html") : Response.error())));
});
