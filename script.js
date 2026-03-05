// Tab switching for Quick Start section
function showTab(tabName, event) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Add active class to clicked button
    if (event && event.target) {
        event.target.classList.add('active');
    }
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
    
    // Show loading state with spinner
    responseOutput.innerHTML = '<code class="loading">⏳ Loading...</code>';
    
    // Disable button during request
    const sendBtn = document.querySelector('.playground-controls .btn-primary');
    const originalText = sendBtn.textContent;
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';
    
    try {
        const url = `${apiUrl}${endpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        let data;
        try {
            data = await response.json();
        } catch (e) {
            const text = await response.text();
            responseOutput.innerHTML = `<code style="color: var(--error-color);">
Status: ${response.status} ${response.statusText}

Response (not JSON):
${text.substring(0, 500)}${text.length > 500 ? '...' : ''}
</code>`;
            sendBtn.disabled = false;
            sendBtn.textContent = originalText;
            return;
        }
        
        // Format response
        const formatted = JSON.stringify(data, null, 2);
        const statusClass = response.ok ? 'var(--success-color)' : 'var(--error-color)';
        const statusIcon = response.ok ? '✅' : '❌';
        
        responseOutput.innerHTML = `<code style="color: ${statusClass};">
${statusIcon} Status: ${response.status} ${response.statusText}

${formatted}
</code>`;
    } catch (error) {
        let errorMsg = error.message;
        if (error.name === 'AbortError') {
            errorMsg = 'Request timeout (30s). The server may be slow or unreachable.';
        }
        
        responseOutput.innerHTML = `<code style="color: var(--error-color);">
❌ Error: ${errorMsg}

Troubleshooting:
1. Check if the API server is running
2. Verify the API URL is correct
3. Ensure CORS is enabled (for cross-origin requests)
4. Check your API key is valid
5. Verify the request body is valid JSON
</code>`;
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = originalText;
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

// Copy code functionality
function addCopyButtons() {
    document.querySelectorAll('pre code').forEach(codeBlock => {
        const pre = codeBlock.parentElement;
        if (pre.querySelector('.copy-btn')) return; // Already has copy button
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.title = 'Copy code';
        
        copyBtn.addEventListener('click', async function() {
            const text = codeBlock.textContent;
            try {
                await navigator.clipboard.writeText(text);
                copyBtn.textContent = 'Copied!';
                copyBtn.classList.add('copied');
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                    copyBtn.classList.remove('copied');
                }, 2000);
            } catch (err) {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    copyBtn.textContent = 'Copied!';
                    copyBtn.classList.add('copied');
                    setTimeout(() => {
                        copyBtn.textContent = 'Copy';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                } catch (e) {
                    copyBtn.textContent = 'Failed';
                }
                document.body.removeChild(textarea);
            }
        });
        
        pre.style.position = 'relative';
        pre.appendChild(copyBtn);
    });
}

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

// Initialize copy buttons after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    addCopyButtons();
    
    // Re-add copy buttons when feature tabs change
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('feature-detail') && target.classList.contains('active')) {
                    setTimeout(addCopyButtons, 100);
                }
            }
        });
    });
    
    document.querySelectorAll('.feature-detail').forEach(detail => {
        observer.observe(detail, { attributes: true });
    });
});
