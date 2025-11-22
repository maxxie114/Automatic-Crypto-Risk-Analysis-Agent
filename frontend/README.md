This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Crypto Risk Analysis Frontend

Frontend application for the Automatic Crypto Risk Analysis Agent. Built with Next.js, TypeScript, TailwindCSS, and integrated with Sanity CMS.

## Features

- 🔍 **Token Search** - Search for crypto tokens by name, symbol, or address
- 📊 **Risk Analysis Dashboard** - View comprehensive risk analysis including rug pull, liquidity, contract, and holder risks
- ⚡ **Backend Integration** - Trigger on-demand risk analysis via backend API
- 🎨 **Modern UI** - Built with TailwindCSS and Lucide icons
- 📈 **Real-time Data** - Integrates with DexScreener and Sanity CMS

## Prerequisites

- Node.js >= 18.0.0
- Backend API server running (see [backend/README.md](../backend/README.md))
- Sanity project configured

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and configure:

```bash
# Backend API URL (default: http://localhost:3001)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Add your Sanity configuration
# NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
# NEXT_PUBLIC_SANITY_DATASET=production
```

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Backend Integration

The frontend integrates with the backend API for real-time risk analysis:

### API Endpoints Used

- **`POST /api/risk-analyzer/analyze`** - Trigger risk analysis for a token
- **`GET /api/risk-analyzer/:tokenId`** - Get risk data for a specific token
- **`POST /api/search`** - Search Postman collections
- **`GET /health`** - Check backend health status

### How It Works

1. **Token Search**: Users search for tokens by name or address
2. **Data Fetching**: Token data is fetched from DexScreener
3. **Risk Analysis**: Click "Run Risk Analysis" button to trigger backend analysis
4. **Results Display**: Risk analysis results are stored in Sanity and displayed in real-time

### API Client

The API client is located at `src/lib/api.ts` and provides TypeScript-typed functions:

```typescript
import { analyzeCryptoRisk } from '@/lib/api'

const response = await analyzeCryptoRisk({
  cryptoSymbol: 'BTC',
  tokenAddress: '0x...',
})
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── coin/[address]/  # Token detail page
│   │   └── page.tsx         # Home/search page
│   ├── components/          # React components
│   │   ├── AnalyzeButton.tsx
│   │   └── RiskBadge.tsx
│   ├── lib/                 # Utilities
│   │   └── api.ts          # Backend API client
│   └── sanity/             # Sanity CMS config
├── public/                  # Static assets
└── .env.local              # Environment variables
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
