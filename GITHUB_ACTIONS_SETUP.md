# GitHub Actions + Netlify Setup Guide

This guide will help you set up automated deployments to Netlify using GitHub Actions.

## Overview

The GitHub Actions workflow will:
- ✅ **Automatically deploy** to production when you push to `main` branch
- ✅ **Create preview deployments** for pull requests
- ✅ **Comment on PRs** with preview links
- ✅ **Cache dependencies** for faster builds
- ✅ **Use Node.js 18** for consistency

## Prerequisites

- GitHub repository with your code
- Netlify account and site
- Netlify Personal Access Token

## Setup Steps

### 1. Get Netlify Site ID

1. Go to your Netlify site dashboard
2. Go to **Site settings** → **General**
3. Copy the **Site ID** (looks like `abc123def-4567-8901-2345-678901234567`)

### 2. Create Netlify Personal Access Token

1. Go to [Netlify User Settings](https://app.netlify.com/user/applications#personal-access-tokens)
2. Click **"New access token"**
3. Give it a name like "GitHub Actions Deploy"
4. Copy the token (you won't see it again!)

### 3. Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `NETLIFY_AUTH_TOKEN` | Your Netlify personal access token | Authentication for Netlify API |
| `NETLIFY_SITE_ID` | Your Netlify site ID | Identifies which site to deploy to |

### 4. Verify Workflow File

The workflow file `.github/workflows/deploy.yml` should already be in your repository. It includes:

- **Production deployments** on push to `main`
- **Preview deployments** on pull requests
- **Automatic comments** on PRs with preview links
- **Dependency caching** for faster builds

## How It Works

### Production Deployments

When you push to the `main` branch:
1. GitHub Actions builds your site
2. Deploys to Netlify production
3. Adds a commit comment with deployment info

### Preview Deployments

When you create a pull request:
1. GitHub Actions builds your site
2. Creates a preview deployment on Netlify
3. Comments on the PR with the preview URL
4. Updates the comment if you push more commits

## Workflow Features

### Build Process
```yaml
- Install dependencies with `npm ci`
- Build site with `npm run build`
- Deploy `./dist` directory to Netlify
```

### Environment Variables
The workflow uses these GitHub secrets:
- `NETLIFY_AUTH_TOKEN`: Your Netlify API token
- `NETLIFY_SITE_ID`: Your Netlify site identifier
- `GITHUB_TOKEN`: Automatically provided by GitHub

### Deployment Messages
- **Production**: "Deploy from GitHub Actions - [commit-sha]"
- **Preview**: "Preview deploy for PR #[number]"

## Testing the Setup

### 1. Test Production Deployment
```bash
git add .
git commit -m "Test automated deployment"
git push origin main
```

Check:
- [ ] GitHub Actions tab shows successful workflow run
- [ ] Netlify dashboard shows new deployment
- [ ] Your site is updated

### 2. Test Preview Deployment
1. Create a new branch: `git checkout -b test-preview`
2. Make a small change
3. Create a pull request
4. Check:
   - [ ] GitHub Actions creates preview deployment
   - [ ] PR gets a comment with preview link
   - [ ] Preview site works correctly

## Troubleshooting

### Common Issues

**Workflow fails with "NETLIFY_AUTH_TOKEN not found"**
- Verify the secret is set correctly in GitHub repository settings
- Check the secret name matches exactly: `NETLIFY_AUTH_TOKEN`

**Workflow fails with "NETLIFY_SITE_ID not found"**
- Verify the secret is set correctly in GitHub repository settings
- Check the secret name matches exactly: `NETLIFY_SITE_ID`
- Ensure the Site ID is correct (no extra spaces/characters)

**Deployment fails with "Site not found"**
- Verify `NETLIFY_SITE_ID` is correct
- Check that the Netlify site exists and you have access

**Preview deployments not working**
- Ensure the Netlify site allows preview deployments
- Check that your Netlify plan supports preview deployments

### Debugging Steps

1. **Check GitHub Actions Logs**
   - Go to your repository → Actions tab
   - Click on the failed workflow run
   - Expand the failed step to see error details

2. **Check Netlify Logs**
   - Go to your Netlify site dashboard
   - Check the Deploys tab for error messages

3. **Verify Secrets**
   - Go to repository Settings → Secrets and variables → Actions
   - Ensure both secrets are present and correctly named

## Advanced Configuration

### Custom Build Commands

To modify the build process, edit `.github/workflows/deploy.yml`:

```yaml
- name: Build site
  run: npm run build
  # Add custom build steps here
```

### Environment-Specific Deployments

To deploy to different Netlify sites based on branch:

```yaml
- name: Deploy to Staging
  if: github.ref == 'refs/heads/staging'
  # ... staging deployment config
  
- name: Deploy to Production
  if: github.ref == 'refs/heads/main'
  # ... production deployment config
```

### Custom Deployment Messages

Modify the `deploy-message` parameter:

```yaml
deploy-message: "Custom message - ${{ github.actor }} deployed ${{ github.sha }}"
```

## Security Best Practices

- ✅ **Never commit** Netlify tokens to your repository
- ✅ **Use repository secrets** for sensitive data
- ✅ **Limit token permissions** to minimum required
- ✅ **Regularly rotate** access tokens
- ✅ **Monitor deployment logs** for suspicious activity

## Benefits of This Setup

- **Automated deployments**: No manual deployment steps
- **Preview environments**: Test changes before merging
- **Consistent builds**: Same environment every time
- **Faster feedback**: Immediate deployment status
- **Team collaboration**: Everyone can see preview links
- **Rollback capability**: Easy to revert deployments

## Next Steps

After setting up GitHub Actions:

1. **Test the workflow** with a small change
2. **Set up branch protection** rules for `main` branch
3. **Configure status checks** to require successful deployment
4. **Add deployment notifications** (Slack, email, etc.)
5. **Monitor deployment metrics** in Netlify dashboard

Your Sol Village website will now automatically deploy to Netlify whenever you push changes to GitHub! 🚀
