# GitHub Pages Deployment Guide

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Repository name: `thordata-firecrawl-site`
3. Description: "Frontend website for Thordata Firecrawl API"
4. Set to **Public** (required for free GitHub Pages)
5. **Do NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

## Step 2: Push Code to GitHub

```bash
cd thordata-firecrawl-site

# Add remote (replace YOUR_USERNAME if needed)
git remote add origin https://github.com/Thordata/thordata-firecrawl-site.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Enable GitHub Pages

1. Go to repository settings: `https://github.com/Thordata/thordata-firecrawl-site/settings/pages`
2. Under "Source", select:
   - Branch: `main`
   - Folder: `/ (root)`
3. Click "Save"

## Step 4: Access Your Site

Your site will be available at:
- `https://thordata.github.io/thordata-firecrawl-site/`

It may take a few minutes for the site to be available after enabling Pages.

## Step 5: Custom Domain (Optional)

To use a custom domain like `crawl.thordata.com`:

1. Create `CNAME` file in repository root:
```bash
echo "crawl.thordata.com" > CNAME
git add CNAME
git commit -m "Add custom domain"
git push
```

2. Configure DNS:
   - Add a CNAME record: `crawl.thordata.com` → `thordata.github.io`
   - Or add an A record pointing to GitHub Pages IPs

3. In GitHub repository settings → Pages:
   - Enter your custom domain
   - Enable "Enforce HTTPS"

## Troubleshooting

### Site not loading
- Wait 5-10 minutes after enabling Pages
- Check repository settings → Pages for any errors
- Verify files are in the root directory

### CORS errors in Playground
- The API server must allow CORS from your domain
- Add CORS headers in your API server configuration
- Or use a proxy server to avoid CORS issues

### Custom domain not working
- Wait for DNS propagation (can take up to 48 hours)
- Verify DNS records are correct
- Check GitHub Pages settings for domain verification status
