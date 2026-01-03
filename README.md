# CardBenefit: AI-Powered Credit Card Benefits Manager 💳✨

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**CardBenefit** is a intelligent full-stack application designed to help you manage, track, and extract credit card benefits using the power of Generative AI.

> [!TIP]
> This project uses high-performance AI extraction and a custom **TOON (Token-Oriented Object Notation)** protocol to reduce LLM costs by ~56%.

---

## 🚀 Key Features

- **🤖 AI Benefit Extraction**: Simply paste a URL, text, or upload a screenshot. The AI will automatically parse and structure complex card benefits into items.
- **⚡ TOON Protocol**: Integrated custom format that strips JSON verbosity, significantly reducing Token consumption when interacting with Gemini/GPT.
- **🔍 Smart Search & Filter**: Instant filtering by bank, card name, or categories (Travel, Health, Shopping, etc.).
- **🧩 Intelligent Auto-Merge**: Automatically detects similar benefits and merges descriptions, values, and terms to keep your database clean.
- **📱 Responsive UI**: High-end aesthetic with glassmorphism and dynamic card themes based on bank colors.
- **🛡️ Data Safety**: Local-first storage with automatic snapshots and Git auto-commit support.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + Lucide Icons
- **AI Engine**: Google Gemini (via OpenAI SDK)
- **Storage**: Local TOON-based persistence (`data/benefits.toon`)

---

## 🏁 Quick Start

### 1. Prerequisites

- Node.js 20+
- A Google AI Studio API Key (or OpenAI API Key)

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/aiist007/CardBenefit.git
cd CardBenefit

# Install dependencies
npm install
```

### 3. Configuration

Copy the template and fill in your keys:

```bash
cp .env.example .env
```

Edit `.env`:

```env
GOOGLE_AI_STUDIO_API_KEY=your_key_here
OPENAI_BASE_URL=https://llm.ai-nebula.com/v1 # Or your preferred proxy/official
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start managing your card benefits!

---

## 📖 How it works: TOON Storage

We don't use regular JSON for AI context. Our **TOON** format transforms:

```json
{ "title": "Free Airport Lounge", "bank": "Chase" }
```

into:

```text
FIELDS: title|bank
DATA: - Free Airport Lounge|Chase
```

This simple change saves over **50% of tokens**, making your AI interactions faster and cheaper.

---

## 📄 License

This project is licensed under the MIT License.

*Crafted with ❤️ for credit card enthusiasts.*
