# Treehouse English · 幼儿英语互动学习屋

首页聚合四个可独立打开的幼儿英语互动课程：交通工具篇、食物篇、水果篇和身体与动作篇。素材随 Docker 镜像打包，运行时不需要联网。

## 本地入口

直接打开 [index.html](./index.html) 进入课程首页。首页会链接到：

- `vehicles.html`：Little Wheels 交通工具篇，10 种载具、真实照片、现场音效和听音寻物。
- `food-lesson.html`：Treehouse Unit 2 Lesson 1，Cake、Rice、Bread、Fish、Chips 和 `What food do you like?` 句式练习。
- `fruits.html`：Little Fruits 水果篇，Apple、Banana、Orange、Strawberry、Watermelon、Grape、Pear、Pineapple 和听音寻果。
- `lessons/body/body.html`：Little Body 身体与动作篇，8 个身体部位、听音寻部位和听指令做动作。

选题库和第一个主题的制作规格：

- [TOPIC_LIBRARY.md](./TOPIC_LIBRARY.md)：完整主题路线、优先级、互动机制和筛选规则。
- [LITTLE_BODY_UNIT.md](./LITTLE_BODY_UNIT.md)：Little Body 的内容规格、音频清单、素材清单和验收标准。

## 目录结构

现有旧课程保留在根目录，便于兼容原有入口；新增课程按主题收进 `lessons/<topic>/`，主题目录自包含页面、样式、脚本、图片、音频和生成脚本：

```text
lessons/
└── body/
    ├── body.html
    ├── body.css
    ├── body.js
    ├── generate_body_audio.py
    ├── download_body_assets.py
    ├── sapi_synthesize.ps1
    └── assets/
        ├── images/          # real photographs only
        └── audio/
```

水果页的完整制作要求、图片生成规范、交互规则和验收清单见 [FRUITS_PAGE_SPEC.md](./FRUITS_PAGE_SPEC.md)。水果卡片使用 ImageGen 生成的真实感图片，生成原图 PNG 和最终 WebP 文件都位于 `fruit-assets/images/`。

身体主题使用 Wikimedia Commons 的真实摄影照片，禁止漫画、SVG 插画、emoji 和 AI 生图；所有来源、作者、许可证和裁切信息记录在 `lessons/body/assets/credits.json`。音频优先使用 Edge Neural Voice 生成，若 Edge TTS websocket 不可用，`lessons/body/generate_body_audio.py` 会回退到 Windows SAPI 的本地英文语音并转成 MP3。

## 语音方案

项目使用微软 Edge Neural Voice，通过免费的 Python 库 `edge-tts` 预生成本地 MP3：

- 音色：`en-US-AnaNeural`
- 语速：`-15%`
- 生成脚本：`generate_fruit_audio.py`
- 水果语音目录：`fruit-assets/audio/`
- 播放方式：页面使用 `new Audio()` 播放本地文件，不调用浏览器 `SpeechSynthesis`，也不请求运行时 TTS 服务

水果页的卡片句子、听音寻果题目、开场语音以及 `Great job` / `Try again` 反馈都使用这套语音。重新生成水果语音：

```bash
python3 -m pip install -r requirements.txt
python3 generate_fruit_audio.py
```

需要覆盖已有音频时，加上 `--force`。语音生成脚本需要互联网；生成后的 MP3 会随项目和 Docker 镜像一起部署，部署后可离线播放。

重新生成身体主题语音：

```bash
python3 lessons/body/generate_body_audio.py
```

需要覆盖已有音频时，加上 `--force`。脚本会先尝试 Edge TTS；在无法访问 Edge TTS 时使用 Windows 自带的 `Microsoft Zira Desktop` 作为本地回退。

## 飞牛 NAS 一键启动

在飞牛 NAS 上把整个项目文件夹放到任意目录，进入目录后运行：

```bash
docker compose up -d --build
```

在同一局域网的 iPad 或手机上打开 `http://NAS的局域网IP:8088`。若 8088 端口被占用，按下面的 `TREEHOUSE_PORT` 方法换端口。更新项目后再次运行同一命令。停止服务：`docker compose down`。

### 低性能 NAS 配置

部署只启动一个 `nginx:alpine` 静态文件容器，不安装 Python/Node，也不需要数据库。Compose 已限制容器最多使用 128 MB 内存和 0.25 个 CPU，并使用只读文件系统，减少 NAS 的写入和后台开销。需要换端口时，在启动前设置环境变量：

```bash
TREEHOUSE_PORT=8090 docker compose up -d --build
```

如果 NAS 的 Docker 管理界面不读取命令行环境变量，可在 Compose 项目里添加 `TREEHOUSE_PORT=8090`；默认端口仍是 `8088`。

也可在飞牛 Docker 管理界面新建 Compose 项目，粘贴 `docker-compose.yml`，将项目目录设为构建目录后部署。

### iPad 主屏幕与离线使用

Service Worker 和可安装 PWA 需要安全上下文。局域网 IP 的普通 HTTP 页面可以正常学习，但 Safari 不会在该地址启用离线缓存。请在飞牛的反向代理中给本应用配置 **HTTPS 域名**，代理到 `http://127.0.0.1:8088`，并安装受 iPad 信任的证书。用 Safari 打开该 HTTPS 地址，点“分享” → “添加到主屏幕”。首次打开并载入全部素材后，即可离线使用。

首次进入需要轻点“开始探索”，用于解锁 iOS 音频。设备静音开关或音量设置仍会影响实际播放。

## 重新获取或更换素材

首发素材已经打包在 `assets/`。若要重新生成：

```bash
python3 -m pip install -r requirements.txt
python3 download_assets.py --force
docker compose up -d --build
```

`download_assets.py` 使用 Wikimedia Commons 的固定文件标题自动获取高清实物照片及真实现场录音；照片统一裁切到 1200×900 WebP，录音截取并转成 Safari 可播放的 MP3。单词、游戏题目和“Try again”用 `edge-tts` 的 `en-US-AnaNeural` 音色、`-15%` 语速生成。脚本需要互联网；已部署应用不需要。每份素材的作者、许可和原始链接在 `assets/credits.json` 中，也可在应用底部打开“照片与声音来源”。

部分 Wikimedia Commons 文件采用 CC BY 或 CC BY-SA 许可；分发修改后的素材时请保留 `assets/credits.json` 和相应许可条款。脚本只下载明确选定且人工核对过的照片，避免搜索结果混入插画或模型玩具。

## 本地预览

无需前端构建。在项目目录运行 `python3 -m http.server 8088`，然后打开 `http://localhost:8088`。直接双击 HTML 也能查看本地页面，但使用 HTTP 服务时音频和 Service Worker 兼容性更好。
