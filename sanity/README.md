# Sanity Clean Content Studio

Congratulations, you have now installed the Sanity Content Studio, an open-source real-time content editing environment connected to the Sanity backend.

## Environment Variables

This project requires the following environment variables to be set:

- `SANITY_PROJECT_ID` (required) - Your Sanity project ID
- `SANITY_DATASET` (optional) - Dataset name, defaults to "production"

### Development Setup

1. Copy the sample environment file and update with your values:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set your actual values:
   ```
   SANITY_PROJECT_ID=your-actual-project-id
   SANITY_DATASET=production
   ```

### Production/Deployment

Ensure these environment variables are configured in your hosting platform:
- `SANITY_PROJECT_ID`
- `SANITY_DATASET` (if different from "production")

## Getting Started

Now you can do the following things:

- [Read “getting started” in the docs](https://www.sanity.io/docs/introduction/getting-started?utm_source=readme)
- [Join the Sanity community](https://www.sanity.io/community/join?utm_source=readme)
- [Extend and build plugins](https://www.sanity.io/docs/content-studio/extending?utm_source=readme)
