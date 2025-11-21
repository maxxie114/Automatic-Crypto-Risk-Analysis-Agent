import {defineCliConfig} from 'sanity/cli'
import 'dotenv/config'

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || 'production'

if (!projectId) {
  throw new Error('Missing required environment variable: SANITY_PROJECT_ID')
}

export default defineCliConfig({
  api: {
    projectId,
    dataset
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/cli#auto-updates
     */
    autoUpdates: true,
  }
})
