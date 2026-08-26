# 🚑 期末急救计算器

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
</p>

<p align="center">
  <img src="https://img.shields.io/github/actions/workflow/status/shangjian2023/pass-or-fail/ci.yml?branch=master&style=flat-square&label=CI" alt="CI">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square" alt="Zero dependencies">
</p>

<p align="center">
  <strong>🎯 输入平时分和权重,立刻算出期末至少要考多少分才能不挂科</strong><br>
  <a href="https://shangjian2023.github.io/pass-or-fail/">🚀 在线使用</a> ·
  <a href="#-计算公式">计算公式</a> ·
  <a href="#-faq">FAQ</a>
</p>

---

## 📖 项目简介

期末考试临近,很多同学都在焦虑"我还能及格吗"。这个工具帮你反推:

- 📈 按你课程的**平时/期中/期末占比**,计算当前总评
- 🎯 期末考试**至少需要考多少分**才能达到目标(及格 60 / 优秀 80 / 满绩 90 / 任意分数)
- ☠️ 就算神仙难救,也会诚实告诉你差多少,而不是假装有救

> 💡 **开发初衷**
> 期末周的人心惶惶,需要一个 10 秒出答案、不用装任何东西的小工具。

---

## ✨ 功能特点

| 功能 | 描述 |
|------|------|
| 🧮 **三段制计算** | 平时分 + 期中分(可选)+ 期末占比,完整覆盖常见评分规则 |
| 🎯 **任意目标分** | 及格 / 优秀 / 满绩快捷卡 + 0-100 滑杆精确调整 |
| 💾 **本地记忆** | 输入自动存 localStorage,下次打开免重填 |
| 🔗 **场景分享** | 一键生成带参数的链接,同学点开就是你算好的场景 |
| ⌨️ **键盘操作** | 数字键直接输入,Enter 计算,Backspace 删位,Esc 清空 |
| 📱 **响应式设计** | 手机、平板、电脑都可用 |
| 🔒 **纯本地计算** | 无后端、无统计、无追踪,成绩数据不出浏览器 |
| ⚡ **零依赖** | 不用 npm install,离线也能跑 |
| 🎛️ **期末模拟器** | 结果卡里拖滑杆,实时看「期末考 X 分」总评多少、过不过 |
| 🗺️ **多目标速览** | 及格 60 / 优秀 80 / 满绩 90 一次算清,不用来回调滑杆 |
| ⏰ **考试倒计时** | 填考试日期,徽章实时显示倒计时,临考 7 天红色脉冲 |
| 📴 **PWA 离线** | Service Worker 预缓存,断网可用,可添加到手机主屏 |
| 🎨 **Claude 风格设计** | 暖纸底 + 2px 墨色粗描边 + 赭橙点缀 + 硬偏移阴影,衬线大数字 |

---

## 🧮 计算公式

总评 = 平时 × w₁ + 期中 × w₂ + 期末 × w₃(其中 w₁+w₂+w₃ = 100%)

反推期末最低分:

```
期末至少需要 = ⌈ (目标总分 − 平时×w₁% − 期中×w₂%) ÷ (1 − w₁% − w₂%) ⌉
```

**示例**(对应测试用例,可在页面上复算):

| 项目 | 数值 | 占比 |
|------|------|------|
| 平时成绩 | 85 | 30% |
| 期中成绩 | 72 | 20% |
| 目标总分 | 60 | — |
| **期末至少需要** | **41 分** | 50% |

`(60 − 85×0.30 − 72×0.20) ÷ 0.50 = 40.2 → 向上取整 41`

边界情况的处理:

- 需求 ≤ 0:**已经稳了**,期末考 0 分也过
- 需求 > 100:**神仙难救**,明说差多少分,建议准备补考
- 平时+期中占比 ≥ 100%:期末已无法影响总评,直接提示而非报错崩溃
- 浮点防护:`31.6 ÷ 0.4` 这类算出 `79.00000000000001` 的情况做了修正,不会虚高 1 分

---

## 🚀 使用方法

### 在线使用

👉 https://shangjian2023.github.io/pass-or-fail/(GitHub Pages 自动部署,推送到 master 即发布)

### 本地运行

```bash
git clone https://github.com/shangjian2023/pass-or-fail.git
cd pass-or-fail
# 任意一种方式:
python -m http.server 8080   # → http://localhost:8080
# 或者直接双击 index.html(file:// 也能用)
```

---

## 🏗️ 项目结构

```
pass-or-fail/
├── index.html            # 页面结构(语义化标签 + og/meta)
├── manifest.webmanifest  # PWA 清单
├── sw.js                 # Service Worker(离线缓存)
├── icons/icon.svg        # 应用图标(✳ 星芒)
├── css/
│   ├── styles.css        # 设计系统:暖纸底/墨色粗描边/赭橙点缀/硬阴影/衬线大数字
│   └── vendor/
│       ├── modern-normalize.css  # 跨浏览器基线(MIT)
│       ├── animations.css        # 25 个精选 keyframes,摘自 animate.css(MIT)
│       ├── hover.css             # 悬停特效 keyframes,摘自 Hover.css(MIT)
│       └── csshake.css           # 抖动 keyframes,摘自 CSShake(MIT)
├── js/
│   ├── calc.js           # 纯计算模块:公式反推/分享编码/文案,无 DOM 依赖
│   ├── app.js            # 交互层:取值、渲染、事件、持久化、彩带触发
│   └── vendor/
│       └── canvas-confetti.js  # 彩带礼花引擎(MIT)
├── test/
│   └── calc.test.js      # 单元测试(node:test,17 个用例)
├── .github/workflows/
│   ├── ci.yml            # 语法检查 + 单测,Node 18/20/22 矩阵
│   └── pages.yml         # GitHub Pages 自动部署
├── LICENSE               # MIT
└── README.md
```

**计算与 UI 分离**:所有公式都在 `calc.js`(纯函数),浏览器挂 `window.Calc`,Node 里 `require()` 直接跑测试,不需要任何测试框架或依赖。

---

## 🧪 开发与测试

```bash
node --test test/*.test.js   # 17 个用例:正常路径、边界、非法输入、分享编解码
```

CI(GitHub Actions)在每次 push / PR 时对 Node 18/20/22 跑语法检查和全量测试。

---

## 📝 FAQ

**Q: 为什么平时+期中占比不能达到 100%?**
A: 那样期末占比就是 0,考多少都不影响总评,反推无意义——页面会直接提示"总评已定"。

**Q: 我的数据会上传吗?**
A: 不会。没有后端,没有统计脚本。输入记忆和"急救次数"都存在你自己浏览器的 localStorage,分享链接的参数在 `#` 后面,不会发给任何服务器。

**Q: 分享链接打开是分享者的成绩场景吗?**
A: 是。链接把平时分/占比/目标编码进 URL hash(如 `#u=85&w=40&m=72&mw=20&g=60`),打开即还原;你改了数字再分享,生成的是你自己的场景。

**Q: 没网也能用吗?**
A: 能。Service Worker 把页面和所有资源缓存在本地,断网打开链接照常计算(首次访问需要联网)。

**Q: 打不开或字体难看?**
A: 页面对 Google Fonts 做了非阻塞加载,国内访问不了字体源时直接用系统字体,不白屏。

---

## 🎨 设计与致谢

UI 采用 Claude 官网标志性的视觉语言:暖纸色背景、近黑墨色 2px 粗描边、赭橙(#D97757)点缀、硬偏移阴影与衬线标题字。跨浏览器基线与入场动效来自两个 MIT 开源库,已 vendor 化(本地打包,零构建、离线可用):

- [modern-normalize](https://github.com/sindresorhus/modern-normalize) — 浏览器样式基线
- [animate.css](https://github.com/animate-css/animate.css) — `fadeInUp / bounceIn / tada / jello / wobble / swing / flipInX / rollIn / jackInTheBox` 等 25 个 keyframes
- [Hover.css](https://github.com/IanLunn/Hover) — `hvr-bob / hvr-buzz / hvr-pop / hvr-pulse-grow / hvr-wobble-horizontal` 悬停特效
- [CSShake](https://github.com/eltonmesquita/CSShake) — `shake-crazy` 等抖动特效
- [canvas-confetti](https://github.com/catdad/canvas-confetti) — 结果彩带(稳过礼炮 / 彩蛋好运,遵循 `prefers-reduced-motion` 降级)

动效分配原则:入场用 animate.css,悬停用 Hover.css,错误/危级用 CSShake,庆祝用 canvas-confetti;自研部分(结果卡状态色、路障条纹进度条、按钮位移反馈、全站 `prefers-reduced-motion` 降级)在 `css/styles.css`。

## 🤝 贡献

欢迎 Issue 和 PR!改动计算逻辑请同时补 `test/calc.test.js` 用例,CI 会跑全量测试。

---

## 📄 许可证

[MIT](LICENSE) © 2026 shangjian2023

---

<p align="center">Made with ❤️ for students</p>
