# Deployment Guide - GitHub Pages

This guide explains how to deploy the web application to GitHub Pages.

## Prerequisites

- A GitHub account
- Repository with the code pushed to GitHub

## Deployment Steps

### Step 1: Enable GitHub Pages

1. Go to your GitHub repository
2. Click on **Settings** (top right)
3. Scroll down to the **Pages** section in the left sidebar
4. Under **Source**, select the branch you want to deploy (usually `main` or `master`)
5. Select **/ (root)** as the folder
6. Click **Save**

### Step 2: Wait for Deployment

GitHub will automatically build and deploy your site. This usually takes 1-2 minutes.

You can check the deployment status:
1. Go to the **Actions** tab in your repository
2. Look for the "pages-build-deployment" workflow
3. Wait for it to complete (green checkmark)

### Step 3: Access Your Site

Your site will be available at:
```
https://[your-username].github.io/Thunderstorm-composite-model/
```

Replace `[your-username]` with your GitHub username.

### Step 4: Update README

Update the link in `README.md` to point to your actual GitHub Pages URL.

## Custom Domain (Optional)

If you want to use a custom domain:

1. In the **Pages** settings, enter your custom domain
2. Update your DNS settings to point to GitHub Pages
3. See [GitHub's custom domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

## Troubleshooting

### Site Not Loading

- Check that GitHub Pages is enabled in Settings
- Verify the correct branch is selected
- Wait a few minutes for deployment to complete
- Check the Actions tab for any errors

### JavaScript Not Working

- Ensure all files (index.html, app.js, stability-calculations.js) are in the repository
- Check browser console for errors (F12 → Console)
- Verify file paths are correct (should be relative, not absolute)

### Map Not Displaying

- Check that you have internet connection (Leaflet loads from CDN)
- Verify the Leaflet CSS and JS links in index.html are correct
- Check browser console for any network errors

## Local Testing

Before deploying, you can test locally:

### Option 1: Simple HTTP Server (Python)

```bash
# Python 3
python -m http.server 8000

# Then open: http://localhost:8000
```

### Option 2: Live Server (VS Code)

1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

### Option 3: Direct File Opening

Simply open `index.html` in your web browser. Note: Some features may not work due to CORS restrictions.

## Files Required for Web App

Make sure these files are in your repository:

- ✅ `index.html` - Main HTML page
- ✅ `app.js` - Application logic
- ✅ `stability-calculations.js` - Calculation functions
- ✅ `_config.yml` - GitHub Pages config (optional but recommended)

## Updates and Maintenance

To update the site:

1. Make changes to the files locally
2. Commit and push to GitHub
3. GitHub Pages will automatically rebuild (1-2 minutes)
4. Clear your browser cache if you don't see changes immediately

## Performance Tips

- The site loads external libraries (Leaflet) from CDN - fast and reliable
- All calculations are done client-side - no server required
- The site is fully static - very fast loading
- Works offline (except map tiles require internet)

## Security

- No sensitive data is collected or stored
- All calculations happen in the browser
- No backend server or database
- No cookies or tracking

## Support

If you encounter issues:

1. Check browser console for errors
2. Verify all files are committed and pushed
3. Check GitHub Pages deployment status
4. Open an issue on the repository

---

**Note**: GitHub Pages is free for public repositories. For private repositories, you need a GitHub Pro account or higher.
