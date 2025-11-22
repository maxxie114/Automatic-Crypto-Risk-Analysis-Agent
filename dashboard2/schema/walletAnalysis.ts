import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'walletAnalysis',
    title: 'Wallet Analysis',
    type: 'document',

    fields: [
        defineField({
            name: 'walletAddress',
            title: 'Wallet Address',
            type: 'string',
            validation: Rule => Rule.required()
        }),

        defineField({
            name: 'chain',
            title: 'Blockchain',
            type: 'string',
            initialValue: 'solana'
        }),

        // -------------------------------
        // PORTFOLIO OVERVIEW
        // -------------------------------
        defineField({
            name: 'totalValueUsd',
            title: 'Total Portfolio Value (USD)',
            type: 'number'
        }),

        defineField({
            name: 'nativeBalance',
            title: 'Native Token Balance (SOL)',
            type: 'number'
        }),

        defineField({
            name: 'tokenCount',
            title: 'Number of Tokens',
            type: 'number'
        }),

        defineField({
            name: 'nftCount',
            title: 'Number of NFTs',
            type: 'number'
        }),

        // -------------------------------
        // TOKEN HOLDINGS
        // -------------------------------
        defineField({
            name: 'tokens',
            title: 'Token Holdings',
            type: 'array',
            of: [
                {
                    type: 'object',
                    name: 'tokenHolding',
                    fields: [
                        { name: 'tokenAddress', type: 'string', title: 'Token Address' },
                        { name: 'symbol', type: 'string', title: 'Symbol' },
                        { name: 'name', type: 'string', title: 'Name' },
                        { name: 'balance', type: 'number', title: 'Balance' },
                        { name: 'decimals', type: 'number', title: 'Decimals' },
                        { name: 'valueUsd', type: 'number', title: 'Value (USD)' },
                        { name: 'priceUsd', type: 'number', title: 'Price (USD)' },
                        { name: 'percentageOfPortfolio', type: 'number', title: '% of Portfolio' }
                    ]
                }
            ]
        }),

        // -------------------------------
        // NFT HOLDINGS
        // -------------------------------
        defineField({
            name: 'nfts',
            title: 'NFT Holdings',
            type: 'array',
            of: [
                {
                    type: 'object',
                    name: 'nftHolding',
                    fields: [
                        { name: 'mintAddress', type: 'string', title: 'Mint Address' },
                        { name: 'name', type: 'string', title: 'Name' },
                        { name: 'symbol', type: 'string', title: 'Symbol' },
                        { name: 'collection', type: 'string', title: 'Collection' },
                        { name: 'imageUrl', type: 'url', title: 'Image URL' },
                        { name: 'floorPriceUsd', type: 'number', title: 'Floor Price (USD)' }
                    ]
                }
            ]
        }),

        // -------------------------------
        // RISK ASSESSMENT
        // -------------------------------
        defineField({
            name: 'riskLevel',
            title: 'Portfolio Risk Level',
            type: 'string',
            options: {
                list: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
            }
        }),

        defineField({
            name: 'riskScore',
            title: 'Risk Score (0–100)',
            type: 'number'
        }),

        defineField({
            name: 'riskFactors',
            title: 'Risk Factors',
            type: 'array',
            of: [{ type: 'string' }]
        }),

        // -------------------------------
        // DIVERSIFICATION METRICS
        // -------------------------------
        defineField({
            name: 'diversification',
            title: 'Diversification Metrics',
            type: 'object',
            fields: [
                { name: 'topTokenConcentration', type: 'number', title: 'Top Token % of Portfolio' },
                { name: 'top3Concentration', type: 'number', title: 'Top 3 Tokens %' },
                { name: 'top5Concentration', type: 'number', title: 'Top 5 Tokens %' },
                { name: 'herfindahlIndex', type: 'number', title: 'Herfindahl Index (0-1)' }
            ]
        }),

        // -------------------------------
        // ACTIVITY METRICS
        // -------------------------------
        defineField({
            name: 'activityMetrics',
            title: 'Activity Metrics',
            type: 'object',
            fields: [
                { name: 'firstTransaction', type: 'datetime', title: 'First Transaction' },
                { name: 'lastTransaction', type: 'datetime', title: 'Last Transaction' },
                { name: 'totalTransactions', type: 'number', title: 'Total Transactions' },
                { name: 'daysSinceFirstTx', type: 'number', title: 'Days Since First Tx' },
                { name: 'avgTxPerDay', type: 'number', title: 'Avg Transactions/Day' }
            ]
        }),

        // -------------------------------
        // AI ANALYSIS
        // -------------------------------
        defineField({
            name: 'aiAnalysis',
            title: 'AI Analysis Summary',
            type: 'text'
        }),

        defineField({
            name: 'recommendations',
            title: 'Recommendations',
            type: 'array',
            of: [{ type: 'string' }]
        }),

        // -------------------------------
        // RAW DATA
        // -------------------------------
        defineField({
            name: 'rawJson',
            title: 'Raw JSON Data',
            type: 'text'
        }),

        defineField({
            name: 'timestamp',
            title: 'Analysis Date',
            type: 'datetime',
            validation: Rule => Rule.required()
        }),

        defineField({
            name: 'lastUpdated',
            title: 'Last Updated',
            type: 'datetime'
        })
    ]
})
