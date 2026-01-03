# CardBenefit: AI 驱动的信用卡权益管理专家 💳✨

[English](./README.md) | **简体中文**

**CardBenefit** 是一款基于 Next.js 15 和 Gemini AI 构建的智能信用卡权益管理系统。它能够通过 AI 自动解析复杂的银行权益页面、截图记录，并进行结构化存储。

> [!TIP]
> 本项目集成了高效的 **TOON (Token-Oriented Object Notation)** 协议，相比传统 JSON 可降低约 **56%** 的 AI Token 消耗，让权益解析更快速、更便宜。

---

## 🚀 核心功能

- **🤖 AI 智能解析**: 无需手动输入。只需粘贴网页链接 (URL)、直接输入文本或上传宣传截图。AI 将自动分析并提取权益详情、有效期、使用条件等。
- **⚡ TOON 协议优化**: 专为 LLM 设计的极简数据传输协议，大大缩短了 AI 的上下文长度，显著降低 API 账单费用。
- **🔍 智能搜索与筛选**: 支持按银行、卡片名称、权益分类（接送机、医疗、里程、购物等）进行实时双重过滤。
- **🧩 自动合并 (Auto-Merge)**: 自动识别相似标题的重复权益，智能合成描述信息，保持数据库整洁，避免数据冗余。
- **🎨 高端审美界面**: 基于玻璃拟合设计风格，提供根据银行专属配色动态生成的卡片视图和精简的表格视图。
- **🛡️ 数据持久化与安全**: 采用本地 `.toon` 文件存储，支持自动快照备份和 Git 自动提交记录，确保数据永不丢失。

<img width="2506" height="1838" alt="image" src="https://github.com/user-attachments/assets/03aa319a-48c4-4b05-b981-90a07e395cdc" />

---

## 🛠️ 技术栈

- **前端框架**: Next.js 15 (App Router)
- **核心逻辑**: React 19 + TypeScript
- **UI/样式**: Tailwind CSS 4 + Radix UI + Lucide Icons
- **AI 引擎**: Google Gemini (通过 OpenAI SDK 调用)
- **数据存储**: 本地磁盘持久化 (`data/benefits.toon`)

---

## 🏁 快速开始

## 建议用 AI coding工具直接在本地部署及调试

### 1. 前置要求

- Node.js 20 或更高版本
- Google AI Studio API Key (或其他兼容 OpenAI 格式的 API 秘钥)

### 2. 安装步骤

```bash
# 克隆仓库
git clone https://github.com/aiist007/CardBenefit.git
cd CardBenefit

# 安装依赖
npm install
```

### 3. 配置环境变量

复制模板文件并填写你的 API Key：

```bash
cp .env.example .env
```

编辑 `.env`：

```env
GOOGLE_AI_STUDIO_API_KEY=你的秘钥
OPENAI_BASE_URL=https://llm.ai-nebula.com/v1 # 或者你的官方/代理地址
```

### 4. 运行应用

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可开始。

---

## 📖 技术亮点：TOON 存储协议

本项目不直接使用 JSON 传输大量数据。TOON 格式通过以下方式优化：

- 去除冗余的引号、大括号、冒号。
- 采用表头预定义 + 字符分隔。
- **实测结果**: 对于同一组权益库，TOON 相比 JSON 能够节约 **52%** 的字符空间，对应减少约 **56%** 的 Token 消耗。

---


## 🙏 致谢

- [Nebula AI 官网](https://ai-nebula.com/)

---

## 📄 开源协议

本项目采用 MIT 协议开源。

*由 Antigravity AI 精心打造，献给所有信用卡玩卡爱好者。*
