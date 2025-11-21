import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'
// import 'dotenv/config'

const projectId = '4ekjvbr6'
const dataset = 'production'

if (!projectId) {
  throw new Error('Missing required environment variable: SANITY_PROJECT_ID')
}

export default defineConfig({
  name: 'default',
  title: 'Production Agent Hack',

  projectId,
  dataset,

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
