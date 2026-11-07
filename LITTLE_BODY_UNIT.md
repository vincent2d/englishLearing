# Little Body · 身体与动作

> 单元类型：P0 · 第一个新主题
>
> 目标年龄：学龄前到 Pre-A1
>
> 当前阶段：已生成页面、真实照片和本地 MP3，页面入口为 `lessons/body/body.html`

## 1. 单元定位

把产品从“点击图片认识名词”推进到“听懂简单指令并完成动作”。页面继续复用现有的探索模式、音频播放、三选一听音题和离线资源方式，同时增加一个低成本的 `Listen & Do` 亲子动作环节。

单元标题：**Little Body · 身体小探险**

一句话承诺：**看一看身体，听一听指令，跟着做出来。**

## 1.1 素材硬性规则

- 本单元所有人物和身体部位图片必须是真实摄影照片。
- 禁止使用漫画、卡通、SVG 插画、emoji、CSS 绘图或 AI 生图作为课程图片。
- 每张图片必须记录来源页面、作者、许可证和处理方式。
- 页面实际使用 WebP；原始来源和许可记录在 `lessons/body/assets/credits.json`。
- 身体部位可以使用真实局部特写；人物主视觉使用真实人物照片。
- 对身体主题只使用安全、非医疗、非裸露的生活化照片；身体躯干使用有衣物遮挡的照片。

## 2. 学习目标

完成一次学习后，孩子能够：

- 听到并指认 6–8 个常见身体部位；
- 听懂 `Touch your…` 和 `Show me…` 这两类指令；
- 在家长带领下完成 2–4 个简单动作；
- 尝试跟读至少一个身体部位单词。

## 3. 核心词汇

### 必选词（8 个）

| English | 中文 | 备注 |
|---|---|---|
| head | 头 | 适合全身图热点 |
| eyes | 眼睛 | 使用复数形式 |
| ears | 耳朵 | 使用复数形式 |
| nose | 鼻子 | 句型清晰 |
| mouth | 嘴巴 | 与 eyes、ears 同组 |
| hands | 手 | 可连接 clap |
| feet | 脚 | 使用复数形式 |
| tummy | 肚子 | 比 stomach 更适合幼儿口语 |

### 动作词（4 个）

| English | 中文 | 用途 |
|---|---|---|
| touch | 摸、碰 | `Touch your…` |
| point | 指 | `Point to…` |
| show | 给我看 | `Show me…` |
| clap | 拍手 | 亲子动作环节 |

`jump` 可以作为第二版扩展词，不放入第一版核心学习量，避免主题从身体部位扩展成泛动作课。

## 4. 核心句型

### 第一优先级

- `Touch your nose.`
- `Touch your head.`
- `Show me your hands.`
- `Point to your eyes.`

### 亲子延伸

- `Where is your nose?`
- `Here it is!`
- `Clap your hands!`

句型不讲语法规则，只通过声音、图片和动作反复出现。British Council 建议幼儿通过固定短语、重复和动作游戏吸收语言，而不是先讲解语法。[British Council](https://www.britishcouncil.sg/blog/teach-kids-english-home)

## 5. 页面内容结构

### A. 开场

画面：一张真实人物照片，作为身体部位学习的主视觉；卡片使用真实局部照片显示头、眼睛、耳朵、鼻子、嘴巴、手、脚和肚子。

开场语音建议：

> Hello! Let’s learn about our bodies.

中文提示：

> 看一看自己的身体，听一听英语怎么说。

### B. 自由探索

第一版可以沿用当前水果页的卡片布局：

- 8 张身体部位卡片；
- 每张卡片显示英文、中文和局部真实照片；
- 点击卡片播放单词音频；
- 点击后有轻微缩放或弹跳反馈；
- 卡片顺序固定，方便第一次学习。

图片形式：

- 使用真实人物照片作为开场和动作区主视觉；
- 使用真实的眼睛、耳朵、鼻子、嘴巴、手和脚照片作为部位卡片；
- 每张照片统一裁切为 4:3 WebP，但保留真实纹理和摄影特征；
- 避免医疗、疼痛、伤口和裸露躯干画面；
- 来源、作者、许可证和裁切信息必须在素材清单中可追溯。

### C. 听音找部位

题型：三张卡片中找出正确身体部位。

题目示例：

- `Where is the nose?`
- `Where are the eyes?`
- `Where are the hands?`

规则：

- 每题展示 3 个选项；
- 正确后显示 `Great job!`；
- 错误后显示 `Try again.`；
- 正确答案 1.5 秒后进入下一题；
- 同一题不连续重复出现；
- 第一次学习只使用单词问题，不混入复杂句子。

### D. 听音做动作

这是本单元的新能力，不要求设备识别孩子是否真的完成动作。

流程：

1. 页面播放 `Touch your nose.`；
2. 屏幕显示一个大图标和动作提示；
3. 孩子在现实中完成动作；
4. 家长点击 `We did it!` 或星星按钮进入下一题；
5. 连续完成 3 题后显示庆祝反馈。

动作题建议：

- `Touch your nose.`
- `Touch your head.`
- `Show me your hands.`
- `Clap your hands.`

### E. 结束反馈

结束文案：

> Great job! You know your body.

家长提示：

> 现在可以在洗手、穿衣或睡前，再说一次：Touch your nose / Show me your hands.

## 6. 音频清单

建议继续使用现有的 Edge Neural Voice、本地 MP3 和慢速语音方案。

### 单词音频

- `head-word.mp3`
- `eyes-word.mp3`
- `ears-word.mp3`
- `nose-word.mp3`
- `mouth-word.mp3`
- `hands-word.mp3`
- `feet-word.mp3`
- `tummy-word.mp3`

### 句子音频

- `touch-your-head.mp3`
- `touch-your-nose.mp3`
- `show-me-your-hands.mp3`
- `point-to-your-eyes.mp3`
- `clap-your-hands.mp3`
- `where-is-your-nose.mp3`

### 反馈音频

- `lets-learn-body.mp3`
- `great-job.mp3`
- `try-again.mp3`
- `we-did-it.mp3`

## 7. 素材清单

### 必需素材

- 1 张真实人物主视觉照片；
- 8 张真实身体部位照片；
- 8 张卡片缩略图（由真实照片裁切得到）；
- 1 张开场照片（可复用人物主视觉）；
- 真实照片来源清单 `assets/credits.json`；
- 1 套成功反馈图标；
- 1 套错误/重试反馈图标。

### 可选素材

- 人物眨眼或挥手的简单动效；
- `Touch`、`Point`、`Clap` 三个动作图标；
- 亲子一起做动作的小插图。

## 8. 亲子使用脚本

建议一次只练 3 个词：

1. 家长指着自己的鼻子说：`Nose.`
2. 点击页面播放：`Touch your nose.`
3. 孩子摸鼻子，家长回应：`Great job!`
4. 换成 `hands` 或 `head`。

现实场景：

- 洗手时：`Show me your hands.`
- 洗脸时：`Touch your nose.`
- 穿衣时：`Where are your feet?`
- 唱歌或游戏时：`Clap your hands.`

## 9. 验收标准

- [ ] 8 个核心词都有英文、中文、图片和单词音频。
- [ ] 卡片点击后能播放对应音频。
- [ ] 听音找部位至少有 3 选 1、答错重试、答对自动下一题。
- [ ] 指令题至少包含 4 条可播放句子。
- [ ] 单元不依赖摄像头或麦克风。
- [ ] 音频失效时仍保留完整文字和可操作界面。
- [ ] 所有图片和音频可以随项目本地部署。
- [ ] 单次学习流程可以在 5–15 分钟内完成。
- [ ] 不引入新的账户、联网服务或运行时生成依赖。

## 10. 后续扩展

第二版再考虑：

- 人物图热点点击；
- `jump`、`run`、`turn around` 等动作；
- 身体部位与衣服组合；
- 与 `Feelings` 单元共享人物角色；
- 与 `Wash & Clean` 单元共享 `hands`、`face`、`teeth`。

