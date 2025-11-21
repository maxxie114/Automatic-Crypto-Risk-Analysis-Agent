import { getCliClient } from 'sanity/cli'

const client = getCliClient()

// Configuration
const COINS = [
    { id: 'ethereum', symbol: 'ETH', address: '0x0000000000000000000000000000000000000000' },
    { id: 'pepe', symbol: 'PEPE', address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933' },
    { id: 'solana', symbol: 'SOL', address: 'So11111111111111111111111111111111111111112' }, // Example of adding another one
]

// Types
interface CoinData {
    id: string
    symbol: string
    current_price: number
    price_change_percentage_24h: number
    total_volume: number
    market_cap: number
}

async function fetchMarketData(): Promise<CoinData[]> {
    try {
        const ids = COINS.map(c => c.id).join(',')
        const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false`
        )

        if (!response.ok) {
            throw new Error(`CoinGecko API Error: ${response.statusText}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Failed to fetch market data:', error)
        return []
    }
}

function calculateRisk(coin: CoinData): { score: number; level: string; factors: string[] } {
    let score = 10 // Base risk
    const factors = []

    // Volatility Risk
    if (Math.abs(coin.price_change_percentage_24h) > 10) {
        score += 20
        factors.push('High Volatility')
    } else if (Math.abs(coin.price_change_percentage_24h) > 5) {
        score += 10
        factors.push('Moderate Volatility')
    }

    // Liquidity/Volume Risk (Simplified)
    if (coin.total_volume < 1000000) {
        score += 30
        factors.push('Low Liquidity')
    }

    // Market Cap Risk
    if (coin.market_cap < 10000000) {
        score += 20
        factors.push('Low Market Cap')
    }

    // Random "Market Sentiment" fluctuation for demo purposes
    const sentiment = Math.random() * 10 - 5
    score += sentiment

    // Clamp score
    score = Math.min(100, Math.max(0, Math.round(score)))

    let level = 'low'
    if (score > 80) level = 'critical'
    else if (score > 60) level = 'high'
    else if (score > 40) level = 'medium'

    return { score, level, factors }
}

async function updateCoin(coinDef: any, marketData: CoinData) {
    console.log(`Updating ${coinDef.symbol}...`)

    // 1. Update Coin Document
    const coinDoc = await client.createOrReplace({
        _type: 'coin',
        _id: `coin-${coinDef.symbol}`,
        name: marketData.id.charAt(0).toUpperCase() + marketData.id.slice(1),
        symbol: coinDef.symbol,
        address: coinDef.address,
        priceUsd: marketData.current_price,
        priceChange24h: marketData.price_change_percentage_24h,
        liquidityUsd: marketData.total_volume, // Proxy for liquidity in this demo
        fdv: marketData.market_cap,
        lastUpdated: new Date().toISOString()
    })

    // 2. Calculate Risk
    const risk = calculateRisk(marketData)

    // 3. Create Risk Assessment
    await client.create({
        _type: 'risk',
        coin: { _type: 'reference', _ref: coinDoc._id },
        overallRisk: risk.level,
        riskScore: risk.score,
        riskFactors: risk.factors,
        assessedAt: new Date().toISOString()
    })

    // 4. Create Agent Log
    await client.create({
        _type: 'agentLog',
        agentType: 'MarketWatcher',
        action: 'UPDATE_PRICE',
        status: 'success',
        message: `Updated ${coinDef.symbol}: $${marketData.current_price} (${marketData.price_change_percentage_24h.toFixed(2)}%). Risk: ${risk.score}/100`,
        timestamp: new Date().toISOString(),
        severity: 'info'
    })
}

async function runWatcher() {
    console.log('Starting Crypto Risk Agent Watcher...')
    console.log('Press Ctrl+C to stop.')

    while (true) {
        try {
            console.log('\n--- Fetching Market Data ---')
            const marketData = await fetchMarketData()

            for (const data of marketData) {
                const coinDef = COINS.find(c => c.id === data.id)
                if (coinDef) {
                    await updateCoin(coinDef, data)
                }
            }

            console.log('Waiting 30 seconds...')
            await new Promise(resolve => setTimeout(resolve, 30000))

        } catch (error) {
            console.error('Watcher Error:', error)
            await new Promise(resolve => setTimeout(resolve, 10000)) // Wait before retrying
        }
    }
}

runWatcher()
