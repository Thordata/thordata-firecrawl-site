// Tab switching
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Playground request handling
const endpointExamples = {
    '/v1/scrape': {
        url: 'https://www.thordata.com',
        formats: ['markdown']
    },
    '/v1/batch-scrape': {
        urls: ['https://www.thordata.com', 'https://www.thordata.com/about'],
        formats: ['markdown']
    },
    '/v1/map': {
        url: 'https://www.thordata.com'
    },
    '/v1/search': {
        query: 'Thordata web data API',
        limit: 5,
        engine: 'google'
    },
    '/v1/search-and-scrape': {
        query: 'Thordata web scraping',
        searchLimit: 3,
        formats: ['markdown']
    },
    '/v1/crawl': {
        url: 'https://www.thordata.com',
        limit: 10,
        formats: ['markdown']
    },
    '/v1/agent': {
        prompt: 'Extract company information including name and description',
        urls: ['https://www.thordata.com'],
        schema: {
            type: 'object',
            properties: {
                company_name: { type: 'string' },
                description: { type: 'string' }
            }
        },
        formats: ['markdown']
    }
};

// Update request body when endpoint changes
document.getElementById('endpoint').addEventListener('change', function() {
    const endpoint = this.value;
    const example = endpointExamples[endpoint];
    if (example) {
        document.getElementById('request-body').value = JSON.stringify(example, null, 2);
    }
});

// Initialize with default example
document.addEventListener('DOMContentLoaded', function() {
    const endpoint = document.getElementById('endpoint').value;
    const example = endpointExamples[endpoint];
    if (example) {
        document.getElementById('request-body').value = JSON.stringify(example, null, 2);
    }
});

// Send API request
async function sendRequest() {
    const apiKey = document.getElementById('api-key').value.trim();
    const apiUrl = document.getElementById('api-url').value.trim();
    const endpoint = document.getElementById('endpoint').value;
    const requestBody = document.getElementById('request-body').value;
    const responseOutput = document.getElementById('response-output');
    
    // Validation
    if (!apiKey) {
        responseOutput.innerHTML = '<code style="color: var(--error-color);">Error: Please enter your API key</code>';
        return;
    }
    
    if (!apiUrl) {
        responseOutput.innerHTML = '<code style="color: var(--error-color);">Error: Please enter API URL</code>';
        return;
    }
    
    let body;
    try {
        body = JSON.parse(requestBody);
    } catch (e) {
        responseOutput.innerHTML = `<code style="color: var(--error-color);">Error: Invalid JSON in request body\n${e.message}</code>`;
        return;
    }
    
    // Show loading state
    responseOutput.innerHTML = '<code>Loading...</code>';
    
    try {
        const url = `${apiUrl}${endpoint}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        // Format response
        const formatted = JSON.stringify(data, null, 2);
        const statusClass = response.ok ? 'var(--success-color)' : 'var(--error-color)';
        
        responseOutput.innerHTML = `<code style="color: ${statusClass};">
Status: ${response.status} ${response.statusText}

${formatted}
</code>`;
    } catch (error) {
        responseOutput.innerHTML = `<code style="color: var(--error-color);">Error: ${error.message}\n\nMake sure:\n1. The API server is running\n2. The API URL is correct\n3. CORS is enabled (for cross-origin requests)</code>`;
    }
}

// Hero Demo Tab Switching
document.addEventListener('DOMContentLoaded', function() {
    const demoTabs = document.querySelectorAll('.demo-tab');
    const demoCode = document.getElementById('demo-code');
    
    const demoContent = {
        json: `{
  "url": "https://www.thordata.com",
  "markdown": "# Thordata\\n\\nThordata provides AI-native web data infrastructure...",
  "json": {
    "title": "Thordata",
    "description": "AI-native web data infrastructure"
  },
  "screenshot": "https://api.thordata.com/screenshot/..."
}`,
        markdown: `# Thordata

Thordata provides AI-native web data infrastructure for building powerful AI applications.

## Features

- Web Scraping API
- SERP API
- Scraping Browser
- Proxy Network

## Get Started

Visit [thordata.com](https://www.thordata.com) to learn more.`,
        html: `<html>
<head>
  <title>Thordata - AI-Native Web Data Infrastructure</title>
</head>
<body>
  <h1>Thordata</h1>
  <p>AI-native web data infrastructure</p>
</body>
</html>`
    };
    
    demoTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            demoTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const format = this.getAttribute('data-format');
            demoCode.textContent = demoContent[format] || demoContent.json;
        });
    });
    
    // Feature Navigation
    const featureNavBtns = document.querySelectorAll('.feature-nav-btn');
    const featureDetails = document.querySelectorAll('.feature-detail');
    
    featureNavBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const feature = this.getAttribute('data-feature');
            
            // Update nav buttons
            featureNavBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update feature details
            featureDetails.forEach(d => d.classList.remove('active'));
            document.getElementById(`feature-${feature}`).classList.add('active');
        });
    });
    
    // Feature Code Tab Switching
    const codeTabBtns = document.querySelectorAll('.code-tab-btn');
    
    codeTabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            const featureDetail = this.closest('.feature-detail');
            const codeBlocks = featureDetail.querySelectorAll('.code-block');
            const tabs = featureDetail.querySelectorAll('.code-tab-btn');
            
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            codeBlocks.forEach(block => {
                block.classList.remove('active');
                if (block.id.includes(lang)) {
                    block.classList.add('active');
                }
            });
        });
    });
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
