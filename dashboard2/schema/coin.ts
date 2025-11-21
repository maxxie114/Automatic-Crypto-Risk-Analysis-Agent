import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'coin',
    title: 'Coin',
    type: 'document',
    fields: [
        defineField({
            name: 'address',
            title: 'Token Address',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'symbol',
            title: 'Symbol',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'chainId',
            title: 'Chain ID',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'priceUsd',
            title: 'Price (USD)',
            type: 'number',
        }),
        defineField({
            name: 'priceChange24h',
            title: 'Price Change 24h (%)',
            type: 'number',
        }),
        defineField({
            name: 'volume24h',
            title: 'Volume 24h',
            type: 'number',
        }),
        defineField({
            name: 'liquidity',
            title: 'Liquidity',
            type: 'number',
        }),
        defineField({
            name: 'marketCap',
            title: 'Market Cap',
            type: 'number',
        }),
        defineField({
            name: 'fdv',
            title: 'Fully Diluted Valuation',
            type: 'number',
        }),
        defineField({
            name: 'pairAddress',
            title: 'Pair Address',
            type: 'string',
        }),
        defineField({
            name: 'dexId',
            title: 'DEX ID',
            type: 'string',
        }),
        defineField({
            name: 'url',
            title: 'DexScreener URL',
            type: 'url',
        }),
        defineField({
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'lastUpdated',
            title: 'Last Updated',
            type: 'datetime',
        }),
        defineField({
            name: 'pairCreatedAt',
            title: 'Pair Created At',
            type: 'number',
            description: 'Unix timestamp when the trading pair was created',
        }),
        defineField({
            name: 'priceChange',
            title: 'Price Changes',
            type: 'object',
            description: 'Price changes over different time periods',
            fields: [
                {
                    name: 'm5',
                    title: '5 Minutes',
                    type: 'number',
                },
                {
                    name: 'h1',
                    title: '1 Hour',
                    type: 'number',
                },
                {
                    name: 'h6',
                    title: '6 Hours',
                    type: 'number',
                },
                {
                    name: 'h24',
                    title: '24 Hours',
                    type: 'number',
                },
            ],
        }),
        defineField({
            name: 'txns24h',
            title: 'Transactions 24h',
            type: 'object',
            description: 'Buy and sell transaction counts in last 24 hours',
            fields: [
                {
                    name: 'buys',
                    title: 'Buys',
                    type: 'number',
                },
                {
                    name: 'sells',
                    title: 'Sells',
                    type: 'number',
                },
            ],
        }),
        defineField({
            name: 'volatilityRisk',
            title: 'Volatility Risk Score',
            type: 'number',
            description: 'Calculated volatility risk (0-100)',
        }),
    ],
})
