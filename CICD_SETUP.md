# CI/CD Setup Guide

This guide explains how to set up continuous integration and deployment for the Caveo Wine Inventory ERP.

## Overview

The CI/CD pipeline automatically:
- ✅ Runs linting and type checks
- ✅ Builds the application
- ✅ Deploys preview environments for pull requests
- ✅ Deploys to production when merging to main

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. A GitHub repository with this code
3. Node.js 20.x or later installed locally

## Initial Setup

### 1. Install Vercel CLI

```bash
npm install -g vercel@latest
```

### 2. Link Your Project to Vercel

From your project directory:

```bash
vercel link
```

Follow the prompts to:
- Select your Vercel account/team
- Choose or create a project
- Link to your local directory

This creates a `.vercel` directory with project configuration.

### 3. Get Your Vercel Token

1. Go to [Vercel Account Settings → Tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Give it a descriptive name (e.g., "GitHub Actions - Caveo")
4. Set expiration (or no expiration)
5. Click "Create"
6. **Copy the token immediately** (you won't see it again)

### 4. Add Secret to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add the following secret:
   - **Name**: `VERCEL_TOKEN`
   - **Secret**: Paste your Vercel token
5. Click **"Add secret"**

### 5. Configure Vercel Project Settings

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add any required environment variables:
   - `VITE_API_BASE_URL` - Your backend API URL
   - `VITE_ENCRYPTION_KEY` - (Optional) Custom encryption key

3. Set up different values for:
   - **Production** - Used for main branch deployments
   - **Preview** - Used for pull request deployments
   - **Development** - Used for local development

### 6. Project Configuration Files

The repository includes:

- `.github/workflows/ci-cd.yml` - GitHub Actions workflow
- `vercel.json` - Vercel deployment configuration
- `.vercelignore` - Files to exclude from Vercel deployments

## Workflow Details

### Triggered By

- **Push** to `main` or `copilot/create-react-boilerplate` branches
- **Pull requests** to `main` branch

### Jobs

#### 1. Test and Build
Runs on every push and pull request:
```yaml
- Install dependencies (npm ci)
- Run ESLint
- Run TypeScript type checking
- Build production bundle
- Upload artifacts
```

#### 2. Deploy Preview
Runs on pull requests only:
```yaml
- Install Vercel CLI
- Pull Vercel environment (preview)
- Build with Vercel
- Deploy to preview URL
- Comment on PR with deployment URL
```

#### 3. Deploy Production
Runs on pushes to `main` only:
```yaml
- Install Vercel CLI
- Pull Vercel environment (production)
- Build with Vercel
- Deploy to production URL
- Create deployment summary
```

## Testing the Setup

### Test Pull Request Deployment

1. Create a new branch:
   ```bash
   git checkout -b test/ci-cd
   ```

2. Make a small change (e.g., update README)

3. Push and create a pull request:
   ```bash
   git push -u origin test/ci-cd
   ```

4. Watch the GitHub Actions workflow run
5. Check for the preview deployment URL in PR comments

### Test Production Deployment

1. Merge your pull request to `main`
2. Watch the production deployment workflow run
3. Check the deployment summary in GitHub Actions

## Monitoring Deployments

### GitHub Actions
- Go to **Actions** tab in your repository
- View workflow runs, logs, and status

### Vercel Dashboard
- Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- View all deployments
- Check deployment logs
- Monitor performance metrics

## Troubleshooting

### Build Fails

**Issue**: TypeScript or build errors

**Solution**:
1. Run locally: `npm run build`
2. Fix any errors
3. Commit and push fixes

### Deployment Fails

**Issue**: Vercel deployment errors

**Solution**:
1. Check Vercel token is valid
2. Verify `vercel.json` configuration
3. Check Vercel dashboard for error details
4. Ensure environment variables are set

### No Preview Comment on PR

**Issue**: Preview deployment succeeds but no comment

**Solution**:
1. Ensure GitHub Actions has write permissions
2. Check workflow logs for errors in comment step
3. Verify `github-script` action has correct permissions

## Security Best Practices

1. **Protect Secrets**
   - Never commit `VERCEL_TOKEN` to repository
   - Use GitHub Secrets for sensitive data
   - Rotate tokens periodically

2. **Branch Protection**
   - Require status checks to pass before merging
   - Enable "Require branches to be up to date"
   - Require pull request reviews

3. **Environment Variables**
   - Use different values for production vs preview
   - Don't expose sensitive data in build logs
   - Use Vercel's environment variable encryption

## Customization

### Add More Tests

Edit `.github/workflows/ci-cd.yml`:

```yaml
- name: Run unit tests
  run: npm test

- name: Run E2E tests
  run: npm run test:e2e
```

### Change Deployment Triggers

Modify the `on:` section:

```yaml
on:
  push:
    branches: [ main, develop, staging ]
  pull_request:
    branches: [ main, develop ]
```

### Add Slack Notifications

Add a notification step:

```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
```

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)

## Support

If you encounter issues:
1. Check the [GitHub Actions logs](https://github.com/get-caveo/backoffice-react/actions)
2. Review [Vercel deployment logs](https://vercel.com/dashboard)
3. Consult the troubleshooting section above
4. Open an issue in the repository
