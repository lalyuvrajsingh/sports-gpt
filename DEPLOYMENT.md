# CricketGPT Deployment Guide

## Overview

This document provides instructions for deploying the CricketGPT application to Vercel. The application has been simplified by removing the complex research event system components to ensure smooth deployment.

## Changes Made for Deployment

To simplify deployment and eliminate type errors, the following changes were made:

1. **Simplified Research Components**:
   - Replaced complex `ResearchProgress` component with a simplified version
   - Replaced `ResearchEventProvider` with a minimal implementation
   - Created a placeholder for `ResearchEventScript`
   - Simplified the `ResearchBridge` service

2. **Consolidated Type Definitions**:
   - Created a central `src/lib/types.ts` file with common types
   - Removed duplicated window interface declarations
   - Fixed imports to use the central types

3. **Fixed Client-Side Rendering Issues**:
   - Added Suspense boundaries around components using `useSearchParams`
   - Ensured proper static/dynamic rendering

## Deployment Instructions

### Using Vercel CLI

1. **Login to Vercel** (if not already logged in):
   ```bash
   npx vercel login
   ```

2. **Deploy the Application**:
   ```bash
   npx vercel
   ```
   - Follow the prompts to configure your project
   - When asked for environment variables, make sure to set `PERPLEXITY_API_KEY` if you have one

3. **Production Deployment**:
   ```bash
   npx vercel --prod
   ```

### Using GitHub Integration

1. Push your repository to GitHub
2. In the Vercel dashboard, click "Add New..." → "Project"
3. Import your repository
4. Configure environment variables (especially `PERPLEXITY_API_KEY`)
5. Deploy

## Environment Variables

Make sure to configure the following environment variables in Vercel:

- `PERPLEXITY_API_KEY`: API key for Perplexity's research capabilities
- `NODE_ENV`: Set to "production" for production deployments

## Mock Mode

The application includes a mock mode that automatically activates when the Perplexity API key is not configured. This allows for testing and demonstration without requiring actual API credentials.

## Troubleshooting

If you encounter issues during deployment:

1. **Build Errors**: 
   - Check if any type errors or other issues exist in your code
   - Run `npm run build` locally to identify and fix issues

2. **Runtime Errors**:
   - Check Vercel logs for details
   - Ensure environment variables are correctly set

3. **API Authentication Issues**:
   - Verify your Perplexity API key is correctly set
   - The application should fall back to mock mode if the API key is missing

## Next Steps

After successful deployment:

1. Test the application thoroughly on the deployed URL
2. Set up custom domain (if desired) through Vercel dashboard
3. Consider setting up CI/CD for automatic deployments from your repository 