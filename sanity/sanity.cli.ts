import { defineCliConfig } from 'sanity/cli'
// import 'dotenv/config'

const projectId = '4ekjvbr6'
const dataset = 'production'

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
