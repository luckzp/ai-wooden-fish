# 敲木鱼 · AI 大师

轻量整活小应用：**敲木鱼**积功德，随机一句佛系/毒鸡汤/摸鱼梗；**求大师开示**则用 AI 流式回答你的困惑，禅意与梗兼得。

---

## 功能概览

| 功能 | 说明 |
|------|------|
| **敲木鱼** | 点击木鱼，播放敲击音效，随机展示短句池中的开示文案（可复制） |
| **功德气泡** | 每次敲击飘出「功德+1」等气泡动画，营造氛围 |
| **背景音乐** | 页面内建 BGM，可一键开关 |
| **求大师开示** | 输入困惑，通过 OpenRouter 调用 **Gemini 3.0 Flash** 流式生成「大师」口吻的开示（需配置 API Key） |

---

## 技术栈

- **框架**：Vue 3（Composition API + `<script setup>`）
- **构建**：Vite 7
- **AI**：OpenRouter — `google/gemini-3-flash-preview`，流式 SSE

---

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务

```bash
npm run dev
```

在浏览器中打开终端提示的本地地址即可。

### 3. 「求大师开示」所需配置（可选）

该功能依赖 **OpenRouter API Key**。未配置时点击「求大师开示」会提示错误。

- 在项目根目录创建 `.env` 或 `.env.local`
- 添加变量（在 [OpenRouter](https://openrouter.ai/keys) 创建 Key）：

```env
VITE_OPENROUTER_API_KEY=你的OpenRouter_API_Key
```

不配置也可正常敲木鱼、看短句、听 BGM。

---

## 构建与部署

```bash
npm run build
```

将生成的 `dist/` 目录部署到 **Vercel**、**Netlify**、**GitHub Pages** 等静态托管即可。部署后若使用「求大师开示」，需在托管平台配置同名环境变量。

---

## 可选素材

- **敲击音效**：应用使用 `public/tap.mp3` 作为敲木鱼音效。若项目内无该文件或为占位，可自行准备木鱼音效（如 [Freesound - Mokugyo](https://freesound.org/people/jonopodmore/sounds/607215/) CC0），命名为 `tap.mp3` 放入 `public/`。
- **分享图**：在 `public/` 下放置 `og-image.png`，分享链接时会作为 Open Graph 预览图（`index.html` 已配置 `og:image`）。

---

## 项目结构

```
ai-wooden-fish/
├── index.html
├── package.json
├── src/
│   ├── App.vue              # 根组件：布局、BGM、功德气泡、开示弹窗
│   ├── main.js
│   ├── style.css            # 全局样式
│   ├── components/
│   │   ├── WoodenFish.vue   # 木鱼点击、敲击音效与动效
│   │   ├── QuoteBubble.vue  # 开示短句展示与复制
│   │   └── MeritBubble.vue  # 功德+1 飘字气泡
│   ├── data/
│   │   └── quotes.js        # 敲木鱼短句池
│   ├── api/
│   │   └── open.js          # 求大师开示：OpenRouter 流式请求与系统提示词
│   └── assets/
│       ├── WoodenFish.svg   # 木鱼图标
│       └── bgm.mp3          # 背景音乐
└── public/
    ├── tap.mp3              # 敲击音效（需自备或占位）
    └── og-image.png         # 可选，分享预览图
```

---

## 脚本说明

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 生产构建，输出到 `dist/` |
| `npm run preview` | 本地预览构建结果 |

---

## 许可与说明

- 短句池与 UI 仅供娱乐、放松使用。
- 使用 OpenRouter 时请遵守其服务条款与用量计费规则。
