# TermiChat 终端 AI 聊天助手

## 功能简介

- 在终端与 AI（如 DeepSeek/ChatGPT/OpenAI 兼容模型）持续对话
- 支持普通输出和流式输出（ChatGPT 风格）
- 支持环境变量安全管理 API Key 和 Base URL

## 安装依赖

```bash
npm install
```

## 环境变量配置

1. 在项目根目录新建 `.env` 文件（**不要提交到 git 仓库**）：

```
OPENAI_API_KEY=sk-xxxxxxx
OPENAI_BASE_URL=https://api.deepseek.com
```

2. `.env` 文件已被 `.gitignore` 忽略。

## 使用方法

### 普通模式（非流式输出）

```bash
node cli.js
```

### 流式输出模式

```bash
node cli.js --stream
```

- 启动后直接输入你的问题，AI 会自动回复。
- 支持持续多轮对话。
- 支持 Ctrl+C 优雅退出。

## 依赖说明

- [openai](https://www.npmjs.com/package/openai) —— 兼容 OpenAI/DeepSeek API
- [enquirer](https://www.npmjs.com/package/enquirer) —— 终端交互输入
- [ora](https://www.npmjs.com/package/ora) —— 终端 loading 动画
- [dotenv](https://www.npmjs.com/package/dotenv) —— 环境变量管理

## 安全说明

- API Key 和 Base URL 通过 `.env` 文件管理，**不会提交到 git 仓库**。
- 请妥善保管你的 API Key，避免泄露。

## 常见问题

- 如需切换模型或 API 地址，修改 `.env` 文件即可。

---

如有更多需求或问题，欢迎提 issue 或联系开发者。
