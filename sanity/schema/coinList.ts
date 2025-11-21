import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'coinList',
    title: 'Coin List',
    type: 'document',
    fields: [
        defineField({
            name: 'query',
            title: 'Search Query',
            type: 'string',
            description: 'The token address or search term used',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'timestamp',
            title: 'Timestamp',
            type: 'datetime',
            description: 'When this coin list was fetched',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'count',
            title: 'Count',
            type: 'number',
            description: 'Number of coins in this list',
        }),
        defineField({
            name: 'coins',
            title: 'Coins',
            type: 'array',
            description: 'Array of coin data',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            name: 'address',
                            title: 'Token Address',
                            type: 'string',
                        },
                        {
                            name: 'symbol',
                            title: 'Symbol',
                            type: 'string',
                        },
                        {
                            name: 'name',
                            title: 'Name',
                            type: 'string',
                        },
                        {
                            name: 'chainId',
                            title: 'Chain ID',
                            type: 'string',
                        },
                        {
                            name: 'priceUsd',
                            title: 'Price (USD)',
                            type: 'number',
                        },
                        {
                            name: 'priceChange24h',
                            title: 'Price Change 24h (%)',
                            type: 'number',
                        },
                        {
                            name: 'volume24h',
                            title: 'Volume 24h',
                            type: 'number',
                        },
                        {
                            name: 'liquidity',
                            title: 'Liquidity',
                            type: 'number',
                        },
                        {
                            name: 'marketCap',
                            title: 'Market Cap',
                            type: 'number',
                        },
                        {
                            name: 'fdv',
                            title: 'Fully Diluted Valuation',
                            type: 'number',
                        },
                        {
                            name: 'pairAddress',
                            title: 'Pair Address',
                            type: 'string',
                        },
                        {
                            name: 'dexId',
                            title: 'DEX ID',
                            type: 'string',
                        },
                        {
                            name: 'url',
                            title: 'DexScreener URL',
                            type: 'url',
                        },
                        {
                            name: 'createdAt',
                            title: 'Created At',
                            type: 'datetime',
                        },
                        {
                            name: 'lastUpdated',
                            title: 'Last Updated',
                            type: 'datetime',
                        },
                        {
                            name: 'pairCreatedAt',
                            title: 'Pair Created At',
                            type: 'number',
                        },
                        {
                            name: 'priceChange',
                            title: 'Price Changes',
                            type: 'object',
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
                        },
                        {
                            name: 'txns24h',
                            title: 'Transactions 24h',
                            type: 'object',
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
                        },
                        {
                            name: 'volatilityRisk',
                            title: 'Volatility Risk Score',
                            type: 'number',
                        },
                    ],
                },
            ],
        }),
    ],
})
