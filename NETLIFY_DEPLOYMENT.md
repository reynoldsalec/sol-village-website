# Netlify Deployment Guide

This guide will help you deploy the Sol Village website with TwentyCRM integration to Netlify.

## Prerequisites

- GitHub repository with your code
- Netlify account (free tier available)
- TwentyCRM API key

## Deployment Options

### Option 1: GitHub Actions (Recommended) ⭐

**Automated deployments with preview environments**

1. **Follow the GitHub Actions Setup Guide**
   - See `GITHUB_ACTIONS_SETUP.md` for detailed instructions
   - Set up automated deployments on push to `main`
   - Get preview deployments for pull requests

2. **Quick Setup Summary**:
   - Add `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` to GitHub secrets
   - Push to `main` branch → automatic production deployment
   - Create PR → automatic preview deployment

### Option 2: Git Integration (Manual)

1. **Connect Repository to Netlify**
   - Log into [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Select the repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18` (set in `netlify.toml`)

3. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add `TWENTY_API_KEY` with your TwentyCRM API key
   - Add `TWENTY_API_URL` with `https://api.twenty.com/rest`

4. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy
   - Future pushes to main branch will trigger automatic deployments

### Option 3: Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   netlify init
   ```

4. **Set Environment Variables**
   ```bash
   netlify env:set TWENTY_API_KEY your_api_key_here
   netlify env:set TWENTY_API_URL https://api.twenty.com/rest
   ```

5. **Build and Deploy**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

## Local Development with Netlify Functions

To test Netlify Functions locally:

1. **Install Netlify CLI** (if not already installed)
   ```bash
   npm install -g netlify-cli
   ```

2. **Start Local Development Server**
   ```bash
   netlify dev
   ```

3. **Test the Form**
   - Navigate to `http://localhost:8888/join`
   - Fill out and submit the form
   - Check the terminal for function logs

## Why GitHub Actions?

### Benefits of Automated Deployment

- ✅ **Zero-touch deployments**: Push to `main` → automatic production deployment
- ✅ **Preview environments**: Every PR gets its own preview URL
- ✅ **Consistent builds**: Same environment every time
- ✅ **Team collaboration**: Everyone can see preview links in PR comments
- ✅ **Rollback capability**: Easy to revert deployments
- ✅ **Build caching**: Faster builds with dependency caching
- ✅ **Deployment history**: Track all deployments in GitHub Actions

### Comparison

| Feature | GitHub Actions | Netlify Git Integration | Netlify CLI |
|---------|----------------|------------------------|-------------|
| **Automation** | ✅ Full automation | ✅ Basic automation | ❌ Manual |
| **Preview Deploys** | ✅ PR previews | ✅ Branch previews | ❌ Manual |
| **Build Caching** | ✅ Advanced caching | ❌ Basic caching | ❌ No caching |
| **Deployment Comments** | ✅ PR comments | ❌ No comments | ❌ No comments |
| **Custom Workflows** | ✅ Full control | ❌ Limited | ❌ Manual |
| **Setup Complexity** | 🟡 Medium | 🟢 Easy | 🟢 Easy |

## Function Endpoints

After deployment, your function will be available at:
- **Production**: `https://your-site.netlify.app/.netlify/functions/join-interest-list`
- **Local**: `http://localhost:8888/.netlify/functions/join-interest-list`

## Monitoring and Debugging

### View Function Logs
1. Go to your Netlify site dashboard
2. Click on "Functions" tab
3. Click on `join-interest-list` function
4. View logs in "Invocations" and "Logs" tabs

### Common Issues

**Function not found (404)**
- Verify function is in `netlify/functions/` directory
- Check function file is named correctly
- Ensure build completed successfully

**Environment variables not working**
- Check variables are set in Netlify dashboard
- Verify variable names match exactly
- Redeploy after adding new variables

**CORS errors**
- Function includes CORS headers
- Check browser console for specific errors
- Verify request URL is correct

## Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to Site settings → Domain management
   - Add your custom domain
   - Follow DNS configuration instructions

2. **SSL Certificate**
   - Netlify automatically provides SSL certificates
   - Force HTTPS redirect is enabled by default

## Performance Optimization

- **Function Timeout**: Default is 10 seconds (sufficient for TwentyCRM API calls)
- **Cold Starts**: First request may be slower due to function initialization
- **Caching**: Consider implementing caching for frequently accessed data

## Security Considerations

- **API Keys**: Stored securely in Netlify environment variables
- **CORS**: Properly configured for your domain
- **Input Validation**: All form inputs are validated
- **Rate Limiting**: Consider implementing rate limiting for production use

## Backup and Recovery

- **Code**: Stored in Git repository
- **Environment Variables**: Document your variables for easy recreation
- **Function Logs**: Available in Netlify dashboard for debugging

## Support

- **Netlify Documentation**: [docs.netlify.com](https://docs.netlify.com)
- **Netlify Functions**: [docs.netlify.com/functions](https://docs.netlify.com/functions)
- **TwentyCRM API**: Check your TwentyCRM workspace documentation
