import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'riskReport',
    title: 'Risk Report',
    type: 'document',

    fields: [
        defineField({
            name: 'tokenAddress',
            title: 'Token Address',
            type: 'string',
            validation: Rule => Rule.required()
        }),

        defineField({
            name: 'tokenName',
            title: 'Token Name',
            type: 'string'
        }),

        defineField({
            name: 'tokenSymbol',
            title: 'Token Symbol',
            type: 'string'
        }),

        defineField({
            name: 'chain',
            title: 'Blockchain',
            type: 'string',
            initialValue: 'solana'
        }),

        // -------------------------------
        // ALWAYS TOP 10 HOLDERS
        // -------------------------------
        defineField({
            name: 'topHolders',
            title: 'Top 10 Holders',
            type: 'array',
            validation: Rule => Rule.length(10),      // FORCE EXACTLY 10
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'rank', type: 'number', title: 'Rank' },
                        { name: 'walletOwner', type: 'string', title: 'Wallet Owner' },
                        { name: 'tokenAccount', type: 'string', title: 'Token Account' },
                        { name: 'balance', type: 'number', title: 'Balance' },
                        { name: 'percentage', type: 'number', title: '% of Supply' },
                        { name: 'accountType', type: 'string', title: 'Account Type' }
                    ]
                }
            ]
        }),

        // -------------------------------
        // HOLDER CONCENTRATION
        // -------------------------------
        defineField({
            name: 'concentration',
            title: 'Holder Concentration (%)',
            type: 'object',
            fields: [
                { name: 'top3', type: 'number', title: 'Top 3 Holders %' },
                { name: 'top5', type: 'number', title: 'Top 5 Holders %' },
                { name: 'top10', type: 'number', title: 'Top 10 Holders %' }
            ]
        }),

        // -------------------------------
        // RISK SCORING
        // -------------------------------
        defineField({
            name: 'riskLevel',
            title: 'Risk Level',
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

        // -------------------------------
        // CLAUDE REASONING
        // -------------------------------
        defineField({
            name: 'claudeReasoning',
            title: 'Claude Reasoning Summary',
            type: 'text'
        }),

        // -------------------------------
        // RISK BUBBLE IMAGE
        // -------------------------------
        defineField({
            name: 'riskBubble',
            title: 'Risk Bubble Image',
            type: 'image'
        }),

        // -------------------------------
        // RECOMMENDATIONS
        // -------------------------------
        defineField({
            name: 'recommendations',
            title: 'Recommendations',
            type: 'array',
            of: [{ type: 'string' }]
        }),

        // -------------------------------
        // RAW JSON
        // -------------------------------
        defineField({
            name: 'rawJson',
            title: 'Raw JSON Data',
            type: 'text'
        }),

        defineField({
            name: 'timestamp',
            title: 'Generated At',
            type: 'datetime'
        })
    ]
})