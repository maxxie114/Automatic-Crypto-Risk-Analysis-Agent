import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'blockedTx',
    title: 'Blocked Transaction',
    type: 'document',
    fields: [
        defineField({
            name: 'txHash',
            title: 'Transaction Hash',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'coin',
            title: 'Coin',
            type: 'reference',
            to: [{ type: 'coin' }],
        }),
        defineField({
            name: 'userAddress',
            title: 'User Address',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'blockReason',
            title: 'Block Reason',
            type: 'string',
            options: {
                list: [
                    { title: 'High Risk Token', value: 'high_risk' },
                    { title: 'Honeypot Detected', value: 'honeypot' },
                    { title: 'Blacklisted Address', value: 'blacklisted' },
                    { title: 'Suspicious Activity', value: 'suspicious' },
                    { title: 'Low Liquidity', value: 'low_liquidity' },
                    { title: 'Unverified Contract', value: 'unverified' },
                    { title: 'User Requested', value: 'user_requested' },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'riskScore',
            title: 'Risk Score',
            type: 'number',
            validation: (Rule) => Rule.min(0).max(100),
        }),
        defineField({
            name: 'amount',
            title: 'Transaction Amount',
            type: 'number',
        }),
        defineField({
            name: 'amountUsd',
            title: 'Amount (USD)',
            type: 'number',
        }),
        defineField({
            name: 'details',
            title: 'Block Details',
            type: 'text',
        }),
        defineField({
            name: 'flags',
            title: 'Risk Flags',
            type: 'array',
            of: [{ type: 'string' }],
        }),
        defineField({
            name: 'preventedLoss',
            title: 'Prevented Loss (USD)',
            type: 'number',
        }),
        defineField({
            name: 'blockedAt',
            title: 'Blocked At',
            type: 'datetime',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'chainId',
            title: 'Chain ID',
            type: 'string',
        }),
    ],
})
