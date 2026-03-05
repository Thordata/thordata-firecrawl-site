# Thordata Firecrawl Website

This is the frontend website for Thordata Firecrawl, hosted on GitHub Pages.

## Features

- **Homepage**: Hero section with feature overview
- **Documentation**: Code examples in Python, cURL, and JavaScript
- **Interactive Playground**: Test API endpoints directly in the browser
- **Responsive Design**: Works on desktop and mobile devices

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/Thordata/thordata-firecrawl-site.git
cd thordata-firecrawl-site
```

2. Open `index.html` in a web browser, or use a local server:
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve
```

3. Visit `http://localhost:8000`

## GitHub Pages Deployment

This site is automatically deployed to GitHub Pages at:
- `https://thordata.github.io/thordata-firecrawl-site/`

### Custom Domain

To use a custom domain (e.g., `crawl.thordata.com`):

1. Create a `CNAME` file in the repository root:
```
crawl.thordata.com
```

2. Configure DNS:
   - Add a CNAME record pointing to `thordata.github.io`

3. GitHub Pages will automatically detect and use the custom domain.

## Structure

- `index.html`: Main page with all sections
- `styles.css`: Styling and responsive design
- `script.js`: Interactive functionality (tabs, playground)
- `README.md`: This file

## Notes

- The Playground requires users to enter their own `THORDATA_API_KEY` for security
- API calls are made directly from the browser (CORS must be enabled on the API server)
- For production use, consider using a proxy to avoid CORS issues
