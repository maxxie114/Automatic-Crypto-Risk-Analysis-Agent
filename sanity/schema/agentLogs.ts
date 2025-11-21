import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'agentLog',
    title: 'Agent Log',
    type: 'document',
    fields: [
        defineField({
            name: 'agentType',
            title: 'Agent Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Risk Analyzer', value: 'risk_analyzer' },
                    { title: 'Transaction Monitor', value: 'tx_monitor' },
                    { title: 'Workflow Automation', value: 'workflow_automation' },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'action',
            title: 'Action',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Started', value: 'started' },
                    { title: 'In Progress', value: 'in_progress' },
                    { title: 'Completed', value: 'completed' },
                    { title: 'Failed', value: 'failed' },
                    { title: 'Warning', value: 'warning' },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'coin',
            title: 'Related Coin',
            type: 'reference',
            to: [{ type: 'coin' }],
        }),
        defineField({
            name: 'message',
            title: 'Message',
            type: 'text',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'details',
            title: 'Details',
            type: 'object',
            fields: [
                {
                    name: 'duration',
                    title: 'Duration (ms)',
                    type: 'number',
                },
                {
                    name: 'dataProcessed',
                    title: 'Data Processed',
                    type: 'number',
                },
                {
                    name: 'errors',
                    title: 'Errors',
                    type: 'array',
                    of: [{ type: 'string' }],
                },
            ],
        }),
        defineField({
            name: 'severity',
            title: 'Severity',
            type: 'string',
            options: {
                list: ['info', 'warning', 'error', 'critical'],
            },
        }),
        defineField({
            name: 'timestamp',
            title: 'Timestamp',
            type: 'datetime',
            validation: (Rule) => Rule.required(),
        }),
    ],
})
