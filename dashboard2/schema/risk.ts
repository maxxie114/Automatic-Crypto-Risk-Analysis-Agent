import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'risk',
    title: 'Risk Assessment',
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
            name: 'overallRisk',
            title: 'Overall Risk Level',
            type: 'string',
            options: {
                list: [
                    { title: 'Very Low', value: 'very_low' },
                    { title: 'Low', value: 'low' },
                    { title: 'Medium', value: 'medium' },
                    { title: 'High', value: 'high' },
                    { title: 'Critical', value: 'critical' },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'riskScore',
            title: 'Risk Score (0-100)',
            type: 'number',
            validation: (Rule) => Rule.required().min(0).max(100),
        }),
        defineField({
            name: 'rugPullRisk',
            title: 'Rug Pull Risk',
            type: 'number',
            validation: (Rule) => Rule.min(0).max(100),
        }),
        defineField({
            name: 'liquidityRisk',
            title: 'Liquidity Risk',
            type: 'number',
            validation: (Rule) => Rule.min(0).max(100),
        }),
        defineField({
            name: 'contractRisk',
            title: 'Contract Risk',
            type: 'number',
            validation: (Rule) => Rule.min(0).max(100),
        }),
        defineField({
            name: 'holderRisk',
            title: 'Holder Concentration Risk',
            type: 'number',
            validation: (Rule) => Rule.min(0).max(100),
        }),
        defineField({
            name: 'volatilityRisk',
            title: 'Volatility Risk',
            type: 'number',
            validation: (Rule) => Rule.min(0).max(100),
        }),
        defineField({
            name: 'flags',
            title: 'Risk Flags',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            name: 'type',
                            title: 'Flag Type',
                            type: 'string',
                            options: {
                                list: [
                                    'honeypot',
                                    'high_tax',
                                    'low_liquidity',
                                    'unverified_contract',
                                    'suspicious_holders',
                                    'blacklisted_address',
                                    'pump_dump_pattern',
                                ],
                            },
                        },
                        {
                            name: 'severity',
                            title: 'Severity',
                            type: 'string',
                            options: {
                                list: ['critical', 'high', 'medium', 'low'],
                            },
                        },
                        {
                            name: 'description',
                            title: 'Description',
                            type: 'text',
                        },
                        {
                            name: 'detectedAt',
                            title: 'Detected At',
                            type: 'datetime',
                        },
                    ],
                },
            ],
        }),
        defineField({
            name: 'recommendation',
            title: 'Recommendation',
            type: 'string',
            options: {
                list: [
                    { title: 'Safe to Trade', value: 'safe' },
                    { title: 'Proceed with Caution', value: 'caution' },
                    { title: 'High Risk - Not Recommended', value: 'not_recommended' },
                    { title: 'Blocked', value: 'blocked' },
                ],
            },
        }),
        defineField({
            name: 'assessedAt',
            title: 'Assessed At',
            type: 'datetime',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'lastUpdated',
            title: 'Last Updated',
            type: 'datetime',
        }),
    ],
})
