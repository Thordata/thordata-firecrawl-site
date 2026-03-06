# Thordata Firecrawl Website

Frontend website for [Thordata Firecrawl](https://github.com/Thordata/thordata-firecrawl), hosted on GitHub Pages.

🌐 **Live Site**: https://thordata.github.io/thordata-firecrawl-site/

## Features

- **Hero Section**: Dynamic demo showcasing JSON/Markdown/HTML output
- **Feature Overview**: Scrape, Search, Map, Crawl, Agent capabilities
- **Code Examples**: Python, cURL, and JavaScript snippets
- **Interactive Playground**: Test API endpoints directly in the browser
  - Format switching (JSON/Markdown/HTML)
  - Download responses as files
  - Real-time API testing
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/Thordata/thordata-firecrawl-site.git
cd thordata-firecrawl-site
```

2. Start a local server:
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# Or simply open index.html in your browser
```

3. Visit `http://localhost:8000`

### Using the Playground

1. Open the website: https://thordata.github.io/thordata-firecrawl-site/
2. Scroll to the **Interactive Playground** section
3. Enter your Thordata API Key
4. Set API URL (default: `https://thordata-firecrawl-api.onrender.com`)
5. Select an endpoint and click **Load Example**
6. Click **Send Request** to test the API
7. View response in JSON/Markdown/HTML format and download if needed

## Deployment

This site is automatically deployed to GitHub Pages. Push to `main` branch to trigger deployment.

### Custom Domain

To use a custom domain (e.g., `crawl.thordata.com`):

1. Create a `CNAME` file in the repository root:
```
crawl.thordata.com
```

2. Configure DNS: Add a CNAME record pointing to `thordata.github.io`

3. GitHub Pages will automatically detect and use the custom domain.

## Project Structure

```
thordata-firecrawl-site/
├── index.html          # Main page with all sections
├── styles.css          # Styling and responsive design
├── script.js           # Interactive functionality (tabs, playground, downloads)
└── README.md           # This file
```

## Security Notes

- The Playground requires users to enter their own `THORDATA_API_KEY`
- API keys are sent directly to the API server (via HTTPS) and never stored
- CORS must be enabled on the API server for cross-origin requests
- The default API URL points to a cloud instance (Render), but can be changed to localhost for development
