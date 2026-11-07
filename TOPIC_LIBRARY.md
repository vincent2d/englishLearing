# Treehouse English · 幼儿英语选题库

> 版本：v1.0 · 2026-11-06
>
> 适用产品：离线 PWA、低文字、图片卡片、预生成音频、听音寻物和亲子互动。

## 产品定位

当前产品适合学龄前到 Pre-A1 阶段的幼儿。现有课程已经覆盖交通工具、食物和水果，核心能力是“看图、听音、指认、选择”。后续选题按以下学习路径递进：

**认识物品 → 身体与动作 → 日常生活 → 生活任务 → 简单故事与综合复习。**

每个单元默认控制为：6–8 个核心词、2–4 个动作词、1–2 个核心句、1 个主场景、2 个屏幕内玩法和 1 个亲子现实任务。单次学习建议控制在 5–15 分钟。

## 真实素材总规范

幼儿英语课程的图片素材默认使用真实摄影照片。选题和制作时不得用漫画、卡通、SVG 插画、emoji、CSS 绘图或 AI 生图替代真实素材。每个主题都要在自己的 `assets/credits.json` 中记录来源页面、作者、许可证和处理方式；如果某个主题无法找到安全、清晰、可追溯的真实素材，应调整选题或暂缓制作。

身体与动作主题尤其严格：人物主视觉和身体部位卡片全部使用真实照片，身体躯干必须使用有衣物遮挡的生活化照片，不使用医疗、伤口或裸露画面。

## 优先级说明

- **P0**：下一步直接制作，用于验证产品能力升级。
- **P1**：第一批课程，复用已验证的页面和音频框架。
- **P2**：主线稳定后制作，包含更多场景、排序或角色扮演。
- **Seasonal**：季节性或节日短单元，可穿插发布。

## A. 已有基础与第一批扩展

| 编号 | 单元 | 核心词汇方向 | 核心语言 | 主要玩法 | 优先级 |
|---|---|---|---|---|---|
| 1 | Little Wheels · 交通工具 | car, bus, train, airplane, ship 等 | Where is the…? | 听音寻车 | 已完成 |
| 2 | Food · 食物 | cake, rice, bread, fish, chips | I like… | 选择喜欢的食物 | 已完成 |
| 3 | Little Fruits · 水果 | apple, banana, orange, grape 等 | Where is the…? | 听音寻果 | 已完成 |
| 4 | Little Body · 身体与动作 | head, eyes, ears, nose, mouth, hands, feet, tummy | Touch your… / Show me… | 听音点身体部位、动作游戏 | **P0** |
| 5 | Little Toys · 玩具与游戏 | ball, doll, teddy, kite, blocks, car | It’s a… / I want… | 找玩具、选择喜欢的玩具 | P1 |
| 6 | Little Animals · 动物朋友 | dog, cat, bird, fish, rabbit, cow, duck, lion | What’s this? It’s a… | 动物声音、听音找动物 | P1 |
| 7 | Colors & Shapes · 颜色与形状 | red, blue, yellow, green, circle, square, star | What colour is it? | 颜色与形状分类 | P1 |
| 8 | Little Clothes · 衣服 | shirt, shoes, socks, hat, jacket, dress | Put on your… | 给人物搭配衣服 | P1 |
| 9 | My Home · 我的家 | bed, chair, table, door, window, room | Where is the…? | 房间找物、位置指认 | P1 |
| 10 | My Classroom · 教室 | book, pencil, bag, desk, chair, teacher | This is my… | 书包整理、听音找物 | P1 |

## B. 日常生活与自我表达

| 编号 | 单元 | 核心词汇方向 | 核心语言 | 主要玩法 | 优先级 |
|---|---|---|---|---|---|
| 11 | My Day · 我的一天 | wake up, wash, eat, play, sleep | I… in the morning. | 作息排序 | **P0** |
| 12 | Wash & Clean · 洗漱与清洁 | wash, brush, clean, hands, face, teeth | Wash your hands. | 听音做动作 | P1 |
| 13 | Feelings · 我的心情 | happy, sad, angry, tired, hungry, sleepy | I’m happy. | 看表情选心情 | P1 |
| 14 | Family & Friends · 家人和朋友 | mum, dad, baby, brother, sister, friend | This is my… | 家庭人物配对 | P1 |
| 15 | Weather · 天气 | sunny, rainy, cloudy, windy, hot, cold | It’s… today. | 天气与衣服搭配 | P1 |
| 16 | Playground · 游乐场 | swing, slide, ball, run, jump, climb | I can… | 动作匹配 | P1 |
| 17 | Park & Nature · 公园与自然 | tree, flower, grass, bird, sun, cloud | I see a… | 公园找物 | P1 |
| 18 | Numbers · 数一数 | one–ten, more, less, many | How many? | 数物品、找数量 | P1 |

## C. 生活任务与亲子场景

| 编号 | 单元 | 核心任务 | 核心语言 | 主要玩法 | 优先级 |
|---|---|---|---|---|---|
| 19 | Shopping · 去买东西 | 找商品、放进购物篮 | I want… / Here you are. | 超市寻物 | P2 |
| 20 | Kitchen · 小小厨房 | 食材、餐具、简单动作 | Cut, mix, eat. | 按步骤做食物 | P2 |
| 21 | Birthday Party · 生日派对 | cake, candle, gift, balloon, hat | Happy birthday! | 布置生日桌 | P2 |
| 22 | Picnic · 公园野餐 | basket, apple, sandwich, juice, blanket | I have… | 选择野餐物品 | P2 |
| 23 | Bedtime · 睡觉前 | pajamas, bed, book, light, teddy | Good night. | 睡前流程排序 | P2 |
| 24 | Doctor · 看医生 | head, ear, mouth, hand, hurt, cold | It hurts. | 听指令找身体部位 | P2 |
| 25 | Beach · 去海边 | sea, sand, shell, sun, ball, hat | Let’s go to… | 沙滩寻物 | P2 |
| 26 | Community Helpers · 工作的人 | doctor, teacher, police officer, firefighter, driver | He/She is a… | 职业与工具配对 | P2 |

## D. 兴趣、自然与季节短单元

| 编号 | 单元 | 内容方向 | 主要玩法 | 优先级 |
|---|---|---|---|---|
| 27 | Farm · 农场 | cow, pig, sheep, chicken, horse、动物声音 | 听声音找动物 | P2 |
| 28 | Zoo · 动物园 | lion, elephant, giraffe, monkey | 大图找动物 | P2 |
| 29 | Garden · 小花园 | flower, leaf, seed, water | 种花流程 | P2 |
| 30 | Seasons · 四季 | spring, summer, autumn, winter | 季节与衣服搭配 | P2 |
| 31 | Music & Sounds · 声音 | drum, bell, piano, loud, quiet | 听声音匹配 | P2 |
| 32 | Sports · 运动 | run, jump, kick, throw, catch | 听指令做动作 | P2 |
| 33 | Christmas / New Year · 节日 | gift, star, tree, bell, card | 节日布置 | Seasonal |
| 34 | Transport Trip · 出门旅行 | ticket, bag, train, map, station | 简单路线 | Seasonal |

## E. 跨主题综合项目

这些不是普通词汇页，而是用于复习和验证迁移能力的项目。

1. **Dress the Teddy · 给小熊穿衣服**：复习身体、衣服、颜色。
2. **Pack My Bag · 收拾书包**：复习学校、玩具、食物和位置词。
3. **Treehouse Picnic · 树屋野餐**：复习水果、食物、数量和喜好。
4. **Find the Lost Teddy · 找丢失的小熊**：复习房间、家具和 `Where is…?`。
5. **My Little Week · 我的一周**：复习作息、天气和活动。
6. **Treasure Hunt · 树屋寻宝**：跨主题听音找物，作为阶段复习入口。
7. **Little Party · 小小派对**：复习食物、颜色、数字、礼物和情绪。
8. **Treehouse Review · 树屋总复习**：随机抽取已有主题，形成长期复访内容。

## F. 可复用互动机制

- **Listen & Find**：听 `Where is the apple?`，从三张图中寻找答案。
- **Listen & Touch**：听 `Touch your nose.`，点击正确身体部位。
- **Listen & Do**：听 `Clap your hands.`，孩子在现实中完成动作。
- **What’s Missing?**：显示 4 个物品，隐藏其中一个，找缺失物。
- **Sort It**：把衣服放进衣柜，把食物放到餐桌，把玩具放进玩具箱。
- **Put in Order**：把起床、洗脸、吃饭、出门按顺序排列。
- **Choose One**：`What food do you like?`、`What colour do you like?`。
- **Parent Says**：家长点击指令，与孩子玩简化版 Simon Says。
- **Memory Match**：图片、单词和声音进行配对。

## G. 选题筛选规则

新主题进入制作前，需要回答以下问题：

1. 孩子每天是否能看到、触摸或做出这个主题？
2. 是否能用 6–8 个词完成一个小场景？
3. 是否能加入一个动作或选择，而不是只有点图听音？
4. 是否能复用已有的 `Where is…?`、`I like…` 或 `I can…`？
5. 是否能设计一个家长在现实生活中继续使用的句子？
6. 是否能在 5–15 分钟内完成一次学习？
7. 素材成本是否与单元带来的新能力相匹配？

如果一个主题只能提供“更多图片和更多单词”，暂缓制作；优先选择能带来新动作、新句型或新任务的主题。

## H. 推荐制作顺序

1. Little Body · 身体与动作
2. My Day · 我的一天
3. Little Toys · 玩具与游戏
4. Little Clothes · 衣服
5. My Home · 我的家
6. Feelings · 我的心情
7. My Classroom · 教室
8. Shopping · 去买东西
9. Birthday Party · 生日派对
10. Treehouse Review · 综合复习

