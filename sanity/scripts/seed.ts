import { getCliClient } from 'sanity/cli'

const client = getCliClient()

const coins = [
    {
        _id: 'coin-eth',
        _type: 'coin',
        name: 'Ethereum',
        symbol: 'ETH',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        chainId: '1',
        priceUsd: 3500.50,
        priceChange24h: 2.5,
        volume24h: 15000000000,
        liquidity: 5000000000,
        marketCap: 400000000000,
        fdv: 400000000000,
        createdAt: new Date().toISOString(),
        url: 'https://dexscreener.com/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
    },
    {
        _id: 'coin-pepe',
        _type: 'coin',
        name: 'Pepe',
        symbol: 'PEPE',
        address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
        chainId: '1',
        priceUsd: 0.0000085,
        priceChange24h: -5.2,
        volume24h: 500000000,
        liquidity: 100000000,
        marketCap: 3500000000,
        fdv: 3500000000,
        createdAt: new Date().toISOString(),
        url: 'https://dexscreener.com/ethereum/0x6982508145454ce325ddbe47a25d4ec3d2311933'
    },
    {
        _id: 'coin-scam',
        _type: 'coin',
        name: 'Super Safe Moon',
        symbol: 'SSM',
        address: '0x1234567890123456789012345678901234567890',
        chainId: '1',
        priceUsd: 0.0001,
        priceChange24h: 500.0,
        volume24h: 10000,
        liquidity: 5000,
        marketCap: 1000000,
        fdv: 100000000,
        createdAt: new Date().toISOString(),
        url: 'https://dexscreener.com/ethereum/scam'
    },
    {
        _id: 'coin-gem',
        _type: 'coin',
        name: 'Hidden Gem',
        symbol: 'GEM',
        address: '0x0987654321098765432109876543210987654321',
        chainId: '1',
        priceUsd: 1.25,
        priceChange24h: 15.0,
        volume24h: 250000,
        liquidity: 150000,
        marketCap: 12500000,
        fdv: 12500000,
        createdAt: new Date().toISOString(),
        url: 'https://dexscreener.com/ethereum/gem'
    }
]

const risks = [
    {
        _id: 'risk-eth',
        _type: 'risk',
        coin: { _type: 'reference', _ref: 'coin-eth' },
        overallRisk: 'very_low',
        riskScore: 5,
        rugPullRisk: 1,
        liquidityRisk: 1,
        contractRisk: 1,
        holderRisk: 2,
        volatilityRisk: 10,
        recommendation: 'safe',
        assessedAt: new Date().toISOString(),
        flags: []
    },
    {
        _id: 'risk-pepe',
        _type: 'risk',
        coin: { _type: 'reference', _ref: 'coin-pepe' },
        overallRisk: 'medium',
        riskScore: 45,
        rugPullRisk: 10,
        liquidityRisk: 5,
        contractRisk: 5,
        holderRisk: 30,
        volatilityRisk: 80,
        recommendation: 'caution',
        assessedAt: new Date().toISOString(),
        flags: [
            {
                _key: 'f1',
                type: 'pump_dump_pattern',
                severity: 'medium',
                description: 'High volatility detected in recent trading.',
                detectedAt: new Date().toISOString()
            }
        ]
    },
    {
        _id: 'risk-scam',
        _type: 'risk',
        coin: { _type: 'reference', _ref: 'coin-scam' },
        overallRisk: 'critical',
        riskScore: 98,
        rugPullRisk: 95,
        liquidityRisk: 90,
        contractRisk: 100,
        holderRisk: 85,
        volatilityRisk: 50,
        recommendation: 'blocked',
        assessedAt: new Date().toISOString(),
        flags: [
            {
                _key: 'f1',
                type: 'honeypot',
                severity: 'critical',
                description: 'Contract execution simulation failed. Selling is likely disabled.',
                detectedAt: new Date().toISOString()
            },
            {
                _key: 'f2',
                type: 'high_tax',
                severity: 'high',
                description: 'Sell tax is 99%.',
                detectedAt: new Date().toISOString()
            }
        ]
    },
    {
        _id: 'risk-gem',
        _type: 'risk',
        coin: { _type: 'reference', _ref: 'coin-gem' },
        overallRisk: 'low',
        riskScore: 20,
        rugPullRisk: 5,
        liquidityRisk: 15,
        contractRisk: 5,
        holderRisk: 10,
        volatilityRisk: 30,
        recommendation: 'safe',
        assessedAt: new Date().toISOString(),
        flags: []
    }
]

const logs = [
    {
        _type: 'agentLog',
        agentType: 'risk_analyzer',
        action: 'Analyzed Ethereum',
        status: 'completed',
        message: 'Routine risk assessment completed for ETH.',
        severity: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
        coin: { _type: 'reference', _ref: 'coin-eth' }
    },
    {
        _type: 'agentLog',
        agentType: 'tx_monitor',
        action: 'Blocked Transaction',
        status: 'warning',
        message: 'Prevented purchase of SSM (Super Safe Moon) due to honeypot detection.',
        severity: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
        coin: { _type: 'reference', _ref: 'coin-scam' }
    },
    {
        _type: 'agentLog',
        agentType: 'risk_analyzer',
        action: 'Analyzed Super Safe Moon',
        status: 'completed',
        message: 'Detected critical honeypot risk in SSM contract.',
        severity: 'critical',
        timestamp: new Date(Date.now() - 1000 * 60 * 16).toISOString(), // 16 mins ago
        coin: { _type: 'reference', _ref: 'coin-scam' }
    },
    {
        _type: 'agentLog',
        agentType: 'workflow_automation',
        action: 'New Token Detected',
        status: 'completed',
        message: 'Detected new pool creation for Hidden Gem (GEM). Initiating analysis.',
        severity: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        coin: { _type: 'reference', _ref: 'coin-gem' }
    },
    {
        _type: 'agentLog',
        agentType: 'risk_analyzer',
        action: 'Analyzed Pepe',
        status: 'completed',
        message: 'Updated volatility metrics for PEPE.',
        severity: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
        coin: { _type: 'reference', _ref: 'coin-pepe' }
    }
]

const blockedTxs = [
    {
        _type: 'blockedTx',
        txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
        coin: { _type: 'reference', _ref: 'coin-scam' },
        userAddress: '0xUserAddress123',
        blockReason: 'honeypot',
        riskScore: 98,
        amount: 1000000,
        amountUsd: 100,
        details: 'Transaction blocked due to confirmed honeypot status.',
        preventedLoss: 100,
        blockedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        chainId: '1'
    }
]

async function seed() {
    console.log('Starting seed...')
    const transaction = client.transaction()

    // Add coins
    coins.forEach(coin => {
        transaction.createOrReplace(coin)
    })

    // Add risks
    risks.forEach(risk => {
        transaction.createOrReplace(risk)
    })

    // Add logs
    logs.forEach(log => {
        transaction.create(log)
    })

    // Add blocked txs
    blockedTxs.forEach(tx => {
        transaction.create(tx)
    })

    await transaction.commit()
    console.log('Seed completed!')
}

seed().catch(err => {
    console.error('Seed failed:', err)
    process.exit(1)
})
