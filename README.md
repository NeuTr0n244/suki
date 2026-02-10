# SUKI - Your Anime Degen Analyst ✦

A Next.js application that analyzes Solana wallet trading patterns with an anime AI assistant.

![SUKI](https://img.shields.io/badge/SUKI-Degen%20Analyst-purple)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

- **Degen Score (0-100)**: AI-powered analysis of your trading degeneracy
- **Full PnL Tracking**: Real profit/loss calculations across all tokens
- **Rug Detection**: Identifies dead tokens and scams
- **Trading Patterns**: Paper hands, diamond hands, FOMO habits
- **AI Chat**: Ask SUKI questions about your wallet
- **Voice Responses**: SUKI speaks her roasts and advice
- **3D Character**: Animated anime character that reacts to your performance
- **Beautiful UI**: Anime/cyberpunk design with glassmorphism

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **3D Graphics**: Three.js, React Three Fiber
- **Animations**: Framer Motion
- **AI**: Gemini 2.0 Flash
- **APIs**: Helius (Solana), DexScreener
- **TTS**: Google Translate TTS

## Setup

1. **Clone and install**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Create `.env.local`:
   ```env
   HELIUS_API_KEY=your_helius_key
   GEMINI_API_KEY=your_gemini_key
   NEXT_PUBLIC_URL=http://localhost:3000
   ```

   Get API keys:
   - Helius: https://www.helius.dev/
   - Gemini: https://aistudio.google.com/apikey

3. **Run development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

4. **(Optional) Add 3D model**:
   Place a `.glb` file named `anime_girl_walking_relaxed.glb` in the `/public` folder for the 3D character. If not present, a fallback animation will show.

## How It Works

1. User pastes their Solana wallet address
2. SUKI fetches all swap transactions via Helius API
3. Token data is enriched with DexScreener API
4. Metrics are calculated (PnL, win rate, hold times, etc.)
5. Degen Score is computed based on 8 factors
6. Gemini AI generates personalized roasts and advice
7. User can chat with SUKI about their trading patterns

## Degen Score Factors

- Trading frequency (more = higher score)
- Token diversity (more = higher score)
- Rug pull rate (more rugs = higher score)
- Paper hands rate (quick sells = higher score)
- Night trading percentage (FOMO hours)
- Average hold time (shorter = higher score)
- Token age at purchase (buying new tokens = higher score)
- Active trading days

## Project Structure

```
suki-degen/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts    # Wallet analysis endpoint
│   │   └── chat/route.ts       # AI chat endpoint
│   ├── layout.tsx              # Root layout with fonts
│   ├── page.tsx                # Main page
│   └── globals.css             # Global styles
├── components/
│   ├── Header.tsx
│   ├── Chat.tsx
│   ├── ChatMessage.tsx
│   ├── ChatInput.tsx
│   ├── ScoreCard.tsx
│   ├── FinancialCard.tsx
│   ├── TradesCard.tsx
│   ├── AllTradesTable.tsx
│   ├── SukiCharacter.tsx       # 3D character
│   ├── Landing.tsx             # Landing sections
│   ├── SoundToggle.tsx
│   └── SparkleDecoration.tsx
├── lib/
│   ├── helius.ts               # Helius API
│   ├── dexscreener.ts          # DexScreener API
│   ├── metrics.ts              # PnL calculations
│   ├── score.ts                # Degen score logic
│   ├── gemini.ts               # Gemini AI
│   ├── tts.ts                  # Text-to-speech
│   └── format.ts               # Formatters
└── public/                     # Static assets
```

## Design

The UI uses an **anime cyberpunk** aesthetic:
- Dark backgrounds with purple/pink neon glows
- Glassmorphism cards
- Floating sparkles and animated backgrounds
- Soft gradient accents
- Anime-inspired character and decorations

### Color Palette

- **Primary**: `#c084fc` (purple)
- **Secondary**: `#f472b6` (pink)
- **Accent**: `#22d3ee` (cyan)
- **Success**: `#4ade80` (green)
- **Danger**: `#f87171` (red)

### Fonts

- **Outfit**: Body text, UI
- **Orbitron**: Headings, score numbers
- **JetBrains Mono**: Code, data, addresses

## API Routes

### `GET /api/analyze?wallet={address}`

Analyzes a Solana wallet and returns:
- Degen score
- Total PnL (USD and %)
- Win rate
- All tokens traded
- Top wins/losses
- Trading stats

### `POST /api/chat`

Body:
```json
{
  "message": "user message",
  "walletData": {...}  // optional
}
```

Returns AI response from SUKI.

## Privacy

- No wallet addresses are stored
- All analysis is done in real-time
- Uses only public blockchain data
- No private keys or signatures required

## License

MIT

## Credits

Built with ☕ and questionable life choices.

Not financial advice. DYOR.
