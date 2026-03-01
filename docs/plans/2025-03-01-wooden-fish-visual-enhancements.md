# 赛博寺视觉/动效增强 · 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在木鱼组件上增加点击涟漪与 3D 倾斜反馈、功德气泡多样化与更顺滑动效、背景低密度粒子氛围，不引入新依赖，仅用 Vue 3 + CSS。

**Architecture:** 木鱼动效在 `WoodenFish.vue` 内用 CSS 涟漪 + transform；功德气泡在 i18n 增加多文案、`App.vue` 传文案与随机样式、`MeritBubble.vue` 用新曲线与可选弹出动画；背景粒子在 `App.vue` 挂载一层粒子容器，用 CSS 动画驱动。

**Tech Stack:** Vue 3 (Composition API), Vite, CSS (@keyframes, transform, opacity), vue-i18n。

---

## Task 1: 木鱼点击涟漪

**Files:**
- Modify: `src/components/WoodenFish.vue`

**Step 1:** 在木鱼按钮内增加涟漪层（不改变现有 tap 逻辑）。

在 `<button class="wooden-fish">` 内、`<img>` 前增加一个涟漪元素，仅在点击时显示并播放动画：

```html
<span class="fish-ripple" :class="{ 'fish-ripple--active': isTapping }" aria-hidden="true"></span>
<img :src="fishSvg" ... />
```

**Step 2:** 在 `<style scoped>` 中增加涟漪样式与动画。

- `.fish-ripple`：绝对定位在木鱼中心（例如 left/top 50%, transform translate(-50%,-50%)），宽高 0，圆角 50%，边框或背景为半透明金色/米色，pointer-events: none，z-index 低于图片。
- `.fish-ripple--active`：触发一次扩散动画（scale 0→2 或宽高 0→160px 量级），opacity 0.4→0，duration 0.5s ease-out；动画结束后需重置以便下次点击再次播放（可用 animation 名称或 keyframes 控制）。
- 使用 `@keyframes` 定义 `fish-ripple-burst`，from: scale(0) opacity 0.4，to: scale(2) opacity 0。

**Step 3:** 验证。

运行 `npm run dev`，点击木鱼，确认每次点击出现一圈自中心扩散并淡出的涟漪，且不遮挡木鱼。提交：`feat(wooden-fish): add tap ripple effect`。

---

## Task 2: 木鱼点击 3D 倾斜与压下感

**Files:**
- Modify: `src/components/WoodenFish.vue`

**Step 1:** 为 `.wooden-fish.tap .fish-svg` 的 transform 增加压下与 3D 倾斜。

- 当前 tap 为 `transform: scale(0.92)`。
- 改为：`transform: scale(0.92) translateY(2px) rotateX(2deg) rotateY(-2deg)`；并为 `.wooden-fish` 或包裹图片的容器增加 `transform-style: preserve-3d` 和适当 `perspective`（例如 200px），使 3D 可见。
- 将 transition 设为约 0.12s ease-out，保持与现有一致。

**Step 2:** 验证。

点击木鱼时木鱼应有轻微「压下」和倾斜感，松开后回弹。提交：`feat(wooden-fish): add tap press and 3D tilt feedback`。

---

## Task 3: 功德气泡多文案 i18n

**Files:**
- Modify: `src/locales/zh-CN.js`
- Modify: `src/locales/en.js`

**Step 1:** 在 `zh-CN.js` 的 `merit` 下增加 `texts` 数组，保留原有 `text: '功德+1'` 以兼容，新增：

```js
merit: {
  text: '功德+1',
  texts: ['功德+1', '善哉', '叮'],
},
```

**Step 2:** 在 `en.js` 的 `merit` 下增加：

```js
merit: {
  text: 'Merit +1',
  texts: ['Merit +1', 'Well said', 'Ding'],
},
```

**Step 3:** 验证。

运行应用，确认未报错；后续 Task 4 将使用 `tm('merit.texts')` 随机取一条。提交：`feat(i18n): add merit bubble text variants`。

---

## Task 4: 功德气泡随机文案与随机样式

**Files:**
- Modify: `src/App.vue`
- Modify: `src/components/MeritBubble.vue`

**Step 1:** 在 `App.vue` 的 `onTap` 中，推送功德气泡时增加 `text` 与可选 `scale`/`opacity`。

- 从 `tm('merit.texts')` 或 `tm('merit')?.texts` 取数组，若无则回退到 `t('merit.text')`；用 `pickRandomQuote` 风格随机选一条（可复用或写简单 `arr[Math.floor(Math.random()*arr.length)]`）。
- 为每个 bubble 增加 `text`、`scale`（0.85–1.15）、`opacity`（0.85–1）：例如 `list.push({ id: nextMeritId++, left, top, text, scale, opacity })`。

**Step 2:** 在 `MeritBubble.vue` 中，接收 `text`（可选）、`scale`、`opacity` 的 props；若传入 `text` 则显示 `text`，否则 `t('merit.text')`。将 `bubbleStyle` 扩展为包含 `fontSize`（用 `scale` 乘当前 0.95rem）、`opacity`。

**Step 3:** 验证。

多次敲木鱼，功德气泡应出现不同文案与略不同的字号/透明度。提交：`feat(merit): random bubble text and scale/opacity`。

---

## Task 5: 功德气泡动效曲线与弹出

**Files:**
- Modify: `src/components/MeritBubble.vue`

**Step 1:** 将上升动画改为 `cubic-bezier(0.2, 0.8, 0.2, 1)`，时长约 1.2s，上移约 90px 并淡出。

- 将 `merit-rise` 的 duration 改为 1.2s，timing 改为 `cubic-bezier(0.2, 0.8, 0.2, 1)`。
- to 的 `translateY` 改为约 -90px（或 -100px），保持 opacity 与 color 淡出。

**Step 2:** 可选：增加出现时弹出。在 `.merit-bubble` 上增加初始 `transform: translateX(-50%) translateY(0) scale(0.8)`，并在挂载后 50–100ms 内切换到 `scale(1)`（可用 class 或 transition），时长约 0.15s。

**Step 3:** 验证。

功德气泡上升更顺滑，若有弹出则先小后大。提交：`feat(merit): smoother rise curve and optional pop-in`。

---

## Task 6: 背景粒子层结构与样式

**Files:**
- Create: `src/components/BackgroundParticles.vue`
- Modify: `src/App.vue`

**Step 1:** 新建 `BackgroundParticles.vue`。

- 单文件组件：一个容器 div（例如 `.particles`），内部 25–40 个 div（例如 `.particle`）。
- 容器：position fixed，inset 0，pointer-events none，z-index 0（确保在 `style.css` 的 body/#app 之下、主内容之下）；主内容区需保持 z-index 更高。
- 每个粒子：position absolute，宽高 4–8px，border-radius 50%，背景为半透明色（如 rgba(255,235,200,0.2) 深色主题），left/top 用百分比随机（在 onMounted 或静态写死多组），animation 使用不同的 `@keyframes` 名（如 `particle-float-1` … `particle-float-5`）或同一 keyframes 不同 animation-delay/duration，实现 2–5px/s 量级的缓慢位移（translate）。

**Step 2:** 在 `App.vue` 最外层 `<div class="app">` 内、主内容前，引入并挂载 `<BackgroundParticles />`；确保 `.main-wrap` 或主内容有 `position: relative; z-index: 1`，使粒子在背后。

**Step 3:** 为粒子增加 `prefers-color-scheme: light` 下的颜色（深棕/灰，如 rgba(60,45,35,0.2)），与 `docs/plans/2025-03-01-wooden-fish-visual-design.md` 一致。

**Step 4:** 验证。

运行 `npm run dev`，页面背景有缓慢飘动的光点，不遮挡按钮与木鱼，不响应点击。提交：`feat(bg): add low-density background particles`。

---

## Task 7: 无障碍与 prefers-reduced-motion（可选）

**Files:**
- Modify: `src/components/WoodenFish.vue`
- Modify: `src/components/MeritBubble.vue`
- Modify: `src/components/BackgroundParticles.vue`

**Step 1:** 在全局样式或各组件内，对 `@media (prefers-reduced-motion: reduce)` 做处理：木鱼涟漪与 3D 倾斜可保留（或缩短时间）；功德气泡动画可缩短为 0.6s；背景粒子可 `animation: none` 或 opacity 降至 0.05。

**Step 2:** 验证。

在系统/浏览器中开启「减少动效」，确认动效减弱或关闭。提交：`a11y: respect prefers-reduced-motion for animations`。

---

## 执行顺序与验收

按 Task 1 → 2 → 3 → 4 → 5 → 6 → 7 顺序执行；每步完成后运行 `npm run dev` 与 `npm run build` 确认无报错，再提交。最终验收：敲木鱼有涟漪与倾斜、功德气泡多样且动效顺滑、背景有粒子氛围，且无新依赖。
