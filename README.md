# 敲木鱼 · AI 大师

轻量整活：一个核心动作（敲木鱼）+ 短句池开示。敲一下，随机一句佛系/毒鸡汤/摸鱼梗。

- **技术栈**：Vite + Vue 3
- **开示**：首版仅短句池，无后端

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开提示的本地地址即可。

## 构建与部署

```bash
npm run build
```

将 `dist/` 部署到 Vercel、Netlify、GitHub Pages 等静态托管即可。

## 可选素材

- **敲击音效**：项目内 `public/tap.wav` 为占位（静音）。可到 [Freesound - Mokugyo.wav](https://freesound.org/people/jonopodmore/sounds/607215/)（CC0）下载，替换 `public/tap.wav` 获得真实木鱼声。
- **分享图**：如需社交预览图，在 `public/` 下放置 `og-image.png`，并在分享时使用同源完整 URL 作为 `og:image`。

## 项目结构

```
src/
├── App.vue              # 根布局、状态
├── main.js
├── style.css
├── components/
│   ├── WoodenFish.vue   # 木鱼点击、音效、动效
│   └── QuoteBubble.vue  # 开示文案 + 复制
├── data/
│   └── quotes.js        # 短句池
└── assets/
public/
├── tap.wav              # 敲击音效（可替换）
└── og-image.png         # 可选，分享预览图
```
