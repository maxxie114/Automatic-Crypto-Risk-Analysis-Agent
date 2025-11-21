import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'analysis',
    title: 'Token Analysis',
    type: 'document',
    fields: [
        defineField({
            name: 'coin',
            title: 'Coin',
            type: 'reference',
            to: [{ type: 'coin' }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'analysisType',
            title: 'Analysis Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Risk Assessment', value: 'risk' },
                    { title: 'Liquidity Check', value: 'liquidity' },
                    { title: 'Holder Analysis', value: 'holder' },
                    { title: 'Contract Audit', value: 'contract' },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Pending', value: 'pending' },
                    { title: 'In Progress', value: 'in_progress' },
                    { title: 'Completed', value: 'completed' },
                    { title: 'Failed', value: 'failed' },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'score',
            title: 'Risk Score (0-100)',
            type: 'number',
            validation: (Rule) => Rule.min(0).max(100),
        }),
        defineField({
            name: 'findings',
            title: 'Findings',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            name: 'severity',
                            title: 'Severity',
                            type: 'string',
                            options: {
                                list: ['critical', 'high', 'medium', 'low', 'info'],
                            },
                        },
                        {
                            name: 'category',
                            title: 'Category',
                            type: 'string',
                        },
                        {
                            name: 'description',
                            title: 'Description',
                            type: 'text',
                        },
                        {
                            name: 'recommendation',
                            title: 'Recommendation',
                            type: 'text',
                        },
                    ],
                },
            ],
        }),
        defineField({
            name: 'metadata',
            title: 'Metadata',
            type: 'object',
            fields: [
                {
                    name: 'holderCount',
                    title: 'Holder Count',
                    type: 'number',
                },
                {
                    name: 'topHolderPercentage',
                    title: 'Top Holder Percentage',
                    type: 'number',
                },
                {
                    name: 'liquidityLocked',
                    title: 'Liquidity Locked',
                    type: 'boolean',
                },
                {
                    name: 'contractVerified',
                    title: 'Contract Verified',
                    type: 'boolean',
                },
                {
                    name: 'honeypotCheck',
                    title: 'Honeypot Check',
                    type: 'boolean',
                },
            ],
        }),
        defineField({
            name: 'analyzedAt',
            title: 'Analyzed At',
            type: 'datetime',
            validation: (Rule) => Rule.required(),
        }),
    ],
})
