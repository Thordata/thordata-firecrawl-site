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

// Load example data
function loadExample() {
    const endpoint = document.getElementById('endpoint').value;
    const example = endpointExamples[endpoint];
    if (example) {
        document.getElementById('request-body').value = JSON.stringify(example, null, 2);
        
        // Show success message
        const textarea = document.getElementById('request-body');
        const hint = textarea.nextElementSibling;
        if (hint && hint.classList.contains('hint')) {
            const originalText = hint.textContent;
            hint.textContent = '✅ Example loaded! Now click "Send Request" or press Ctrl/Cmd + Enter';
            hint.style.color = 'var(--success-color)';
            setTimeout(() => {
                hint.textContent = originalText;
                hint.style.color = '';
            }, 3000);
        }
    }
}

const STORAGE_KEY = 'thordata_playground_state_v1';

function savePlaygroundState() {
    const state = {
        apiUrl: document.getElementById('api-url')?.value || '',
        endpoint: document.getElementById('endpoint')?.value || '/v1/scrape',
        requestBody: document.getElementById('request-body')?.value || ''
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function restorePlaygroundState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const state = JSON.parse(raw);
        if (state.apiUrl) document.getElementById('api-url').value = state.apiUrl;
        if (state.endpoint) document.getElementById('endpoint').value = state.endpoint;
        if (state.requestBody) document.getElementById('request-body').value = state.requestBody;
        return true;
    } catch {
        return false;
    }
}

// Initialize playground defaults
document.addEventListener('DOMContentLoaded', function() {
    const restored = restorePlaygroundState();
    if (!restored) {
        loadExample();
    }

    ['api-url', 'endpoint', 'request-body'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', savePlaygroundState);
            el.addEventListener('change', savePlaygroundState);
        }
    });
});

function buildCurrentCurl() {
    const apiKey = document.getElementById('api-key').value.trim() || 'YOUR_API_KEY';
    const apiUrl = document.getElementById('api-url').value.trim() || 'https://thordata-firecrawl-api.onrender.com';
    const endpoint = document.getElementById('endpoint').value;
    const requestBody = document.getElementById('request-body').value.trim() || '{}';

    return `curl -X POST "${apiUrl}${endpoint}" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '${requestBody.replace(/'/g, "'\\''")}'`;
}

function copyCurrentCurl() {
    const curl = buildCurrentCurl();
    navigator.clipboard.writeText(curl).then(() => {
        const btn = document.getElementById('copy-curl-btn');
        if (btn) {
            const original = btn.textContent;
            btn.textContent = '✅ Copied cURL';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = original;
                btn.classList.remove('copied');
            }, 1800);
        }
    }).catch(() => {
        alert('Copy failed. Please copy manually:\n\n' + curl);
    });
}

async function runPreflightCheck() {
    const apiKey = document.getElementById('api-key').value.trim();
    const apiUrlRaw = document.getElementById('api-url').value.trim();
    const responseOutput = document.getElementById('response-output');
    const preflightBtn = document.getElementById('preflight-btn');

    if (!apiKey || !apiUrlRaw) {
        responseOutput.innerHTML = '<code style="color: var(--error-color);">Preflight failed: please fill API key and API URL first.</code>';
        return;
    }

    const apiUrl = apiUrlRaw.replace(/\/+$/, '');

    const original = preflightBtn ? preflightBtn.textContent : '';
    if (preflightBtn) {
        preflightBtn.disabled = true;
        preflightBtn.textContent = 'Checking...';
    }

    const startedAt = performance.now();
    try {
        const healthController = new AbortController();
        const healthTimeout = setTimeout(() => healthController.abort(), 10000);
        const healthResp = await fetch(`${apiUrl}/health`, { signal: healthController.signal });
        clearTimeout(healthTimeout);
        const healthText = await healthResp.text();
        const elapsed = Math.round(performance.now() - startedAt);

        let checkResp;
        try {
            const checkController = new AbortController();
            const checkTimeout = setTimeout(() => checkController.abort(), 15000);
            checkResp = await fetch(`${apiUrl}/v1/scrape`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: 'https://www.thordata.com', formats: ['markdown'] }),
                signal: checkController.signal
            });
            clearTimeout(checkTimeout);
        } catch (e) {
            const msg = e?.name === 'AbortError'
                ? 'Preflight timed out. Server may be down/cold-starting, or blocked by network/CORS.'
                : (e?.message || String(e));
            responseOutput.innerHTML = `<code style="color: var(--error-color);">❌ Preflight failed: ${escapeHtml(msg)}</code>`;
            return;
        }

        const authOk = checkResp.status !== 401 && checkResp.status !== 403;
        const statusColor = authOk ? 'var(--success-color)' : 'var(--error-color)';
        const statusIcon = authOk ? '✅' : '❌';

        responseOutput.innerHTML = `<code style="color: ${statusColor};">
${statusIcon} Preflight Result
- /health: ${healthResp.status} (${elapsed} ms)
- auth check (/v1/scrape): ${checkResp.status}
- health body: ${healthText.substring(0, 120)}${healthText.length > 120 ? '...' : ''}

${authOk ? 'Ready to send full requests.' : 'Auth may be invalid. Get API key from https://dashboard.thordata.com'}
</code>`;
    } catch (err) {
        responseOutput.innerHTML = `<code style="color: var(--error-color);">❌ Preflight failed: ${err.message}</code>`;
    } finally {
        if (preflightBtn) {
            preflightBtn.disabled = false;
            preflightBtn.textContent = original;
        }
    }
}

function copyResponseJson() {
    const btn = document.getElementById('copy-response-btn');
    if (!window.lastResponseData || !window.lastResponseData.json) {
        if (btn) {
            const original = btn.textContent;
            btn.textContent = 'No JSON Yet';
            setTimeout(() => {
                btn.textContent = original;
            }, 1200);
        }
        return;
    }

    navigator.clipboard.writeText(window.lastResponseData.json).then(() => {
        if (btn) {
            const original = btn.textContent;
            btn.textContent = '✅ Copied';
            setTimeout(() => {
                btn.textContent = original;
            }, 1500);
        }
    }).catch(() => {
        alert('Copy failed.');
    });
}

// Send API request
async function sendRequest() {
    const apiKey = document.getElementById('api-key').value.trim();
    const apiUrlRaw = document.getElementById('api-url').value.trim();
    const endpoint = document.getElementById('endpoint').value;
    const requestBody = document.getElementById('request-body').value;
    const responseOutput = document.getElementById('response-output');
    
    // Enhanced validation with detailed error messages
    if (!apiKey) {
        responseOutput.innerHTML = `<code style="color: var(--error-color);">
❌ <strong>Missing API Key</strong>

Please enter your Thordata API key.
Get one from: <a href="https://dashboard.thordata.com" target="_blank">https://dashboard.thordata.com</a>

Required token types:
- For Scrape/Crawl/Map: THORDATA_SCRAPER_TOKEN (or THORDATA_API_KEY)
- For Agent: Also need OPENAI_API_KEY on the server
        </code>`;
        return;
    }
    
    if (!apiUrlRaw) {
        responseOutput.innerHTML = `<code style="color: var(--error-color);">
❌ <strong>Missing API URL</strong>

Please enter the API URL. Try:
- Cloud (Render): https://thordata-firecrawl-api.onrender.com
- Local: http://localhost:3002
        </code>`;
        return;
    }

    const apiUrl = apiUrlRaw.replace(/\/+$/, '');
    
    let body;
    try {
        body = JSON.parse(requestBody);
    } catch (e) {
        responseOutput.innerHTML = `<code style="color: var(--error-color);">
❌ <strong>Invalid JSON</strong>

${e.message}

Please check your JSON syntax. Use a JSON formatter/linter.
        </code>`;
        return;
    }
    
    // Show loading state with spinner
    responseOutput.innerHTML = '<code class="loading">⏳ Sending request... Please wait</code>';
    
    // Disable button during request
    const sendBtn = document.querySelector('.playground-controls .btn-primary');
    const originalText = sendBtn.textContent;
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';
    
    try {
        const startedAt = performance.now();
        const url = `${apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
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
        const elapsed = Math.round(performance.now() - startedAt);
        
        const text = await response.text();

        let parsed = null;
        try {
            parsed = JSON.parse(text);
        } catch {
            parsed = null;
        }

        const formattedJson = parsed ? JSON.stringify(parsed, null, 2) : text;
        window.lastResponseData = { json: formattedJson, status: response.status };
        
        const isSuccess = response.ok;
        
        if (!isSuccess) {
            // Parse error details if possible
            let errorDetail = '';
            try {
                const errorJson = parsed ?? JSON.parse(text);
                errorDetail = errorJson.detail || errorJson.error || JSON.stringify(errorJson, null, 2);
            } catch {
                errorDetail = text;
            }
            
            // Common error patterns with troubleshooting tips
            let troubleshootingTips = '';
            if (response.status === 401 || response.status === 403) {
                troubleshootingTips = `
<strong>🔐 Authentication Failed</strong>
- Verify your API key is correct
- Check if you're using THORDATA_SCRAPER_TOKEN for scrape operations
- Ensure the API key hasn't expired
- Get a new key from: https://dashboard.thordata.com`;
            } else if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After') || '60';
                troubleshootingTips = `
<strong>⏱ Rate Limit Exceeded</strong>
- Please wait ${retryAfter} seconds before retrying
- Default limits: 60 req/min per token, 120 req/min per IP
- Consider upgrading your plan for higher limits`;
            } else if (response.status === 500 || response.status === 502 || response.status === 503) {
                troubleshootingTips = `
<strong>🔧 Server Error</strong>
- The API server encountered an error
- Check /health endpoint for server status
- If using Render: free tier may have cold starts (15-30s delay)
- Try again in a few moments`;
            } else if (response.status === 400) {
                troubleshootingTips = `
<strong>📝 Bad Request</strong>
- Check your request body format
- Verify all required fields are present
- Ensure URLs are valid and properly formatted`;
            }
            
            responseOutput.innerHTML = `<code style="color: var(--error-color);">
❌ <strong>Request Failed: ${response.status} ${response.statusText}</strong>

⏱ Response time: ${elapsed}ms
📍 Endpoint: ${endpoint}

<strong>Error Details:</strong>
${errorDetail.substring(0, 800)}${errorDetail.length > 800 ? '...' : ''}

${troubleshootingTips}
        </code>`;
            return;
        }
        
        // Success path: render JSON + (optional) markdown/html tabs if present.
        let markdownContent = null;
        let htmlContent = null;
        if (parsed && parsed.data) {
            if (typeof parsed.data.markdown === 'string') markdownContent = parsed.data.markdown;
            if (typeof parsed.data.html === 'string') htmlContent = parsed.data.html;
        }
        
        const okHtml = `<div class="response-status" style="color: var(--success-color); margin-bottom: 1rem;">
✅ Status: ${response.status} ${response.statusText} · ${elapsed} ms
</div>`;

        let responseHtml = okHtml;

        const hasMarkdown = typeof markdownContent === 'string' && markdownContent.length > 0;
        const hasHtml = typeof htmlContent === 'string' && htmlContent.length > 0;

        if (hasMarkdown || hasHtml) {
            responseHtml += `
<div class="response-format-tabs" style="display: flex; gap: 0.5rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
  <button class="format-tab-btn active" data-format="json" onclick="switchResponseFormat('json')">JSON</button>
  ${hasMarkdown ? `<button class="format-tab-btn" data-format="markdown" onclick="switchResponseFormat('markdown')">Markdown</button>` : ''}
  ${hasHtml ? `<button class="format-tab-btn" data-format="html" onclick="switchResponseFormat('html')">HTML</button>` : ''}
</div>`;
        }

        responseHtml += `
<div id="response-json" class="response-format-content" style="display: block;">
  <pre><code>${escapeHtml(formattedJson)}</code></pre>
</div>`;

        if (hasMarkdown) {
            const markdownBase64 = btoa(unescape(encodeURIComponent(markdownContent)));
            responseHtml += `
<div id="response-markdown" class="response-format-content" style="display: none;">
  <pre><code class="markdown-content">${escapeHtml(markdownContent)}</code></pre>
  <button class="download-btn" data-format="markdown" data-content-base64="${markdownBase64}" title="Download as Markdown">📥 Download Markdown</button>
</div>`;
        }

        if (hasHtml) {
            const htmlBase64 = btoa(unescape(encodeURIComponent(htmlContent)));
            responseHtml += `
<div id="response-html" class="response-format-content" style="display: none;">
  <pre><code class="html-content">${escapeHtml(htmlContent)}</code></pre>
  <button class="download-btn" data-format="html" data-content-base64="${htmlBase64}" title="Download as HTML">📥 Download HTML</button>
</div>`;
        }

        // Always provide JSON download button
        responseHtml += `<button class="download-btn" data-format="json" data-content="${escapeHtml(formattedJson).replace(/"/g, '&quot;')}" title="Download as JSON">📥 Download JSON</button>`;

        window.lastResponseData = {
            json: formattedJson,
            markdown: hasMarkdown ? markdownContent : null,
            html: hasHtml ? htmlContent : null,
            status: response.status,
        };

        responseOutput.innerHTML = responseHtml;
        
        // Attach download button event listeners
        responseOutput.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const format = this.getAttribute('data-format');
                let content;
                
                // Check if content is base64 encoded (for markdown/html)
                const base64Content = this.getAttribute('data-content-base64');
                if (base64Content) {
                    // Decode base64
                    try {
                        content = decodeURIComponent(escape(atob(base64Content)));
                    } catch (e) {
                        console.error('Failed to decode base64 content:', e);
                        content = this.getAttribute('data-content') || '';
                    }
                } else {
                    // Regular content (JSON)
                    content = this.getAttribute('data-content');
                    // Decode HTML entities
                    const div = document.createElement('div');
                    div.innerHTML = content;
                    content = div.textContent || div.innerText || content;
                }
                
                downloadResponse(format, content);
            });
        });
    } catch (error) {
        let errorMsg = error.message;
        if (error.name === 'AbortError') {
            errorMsg = 'Request timeout (30s). The server may be slow or unreachable.';
        }
        
        let troubleshooting = `
Troubleshooting:
1. Check if the API server is running
2. Verify the API URL is correct
3. Ensure CORS is enabled (for cross-origin requests)
4. Check your API key is valid
5. Verify the request body is valid JSON`;

        if (/401|unauthorized|forbidden/i.test(errorMsg)) {
            troubleshooting = `
Troubleshooting (Auth):
1. Ensure you are using your own Thordata API key
2. Get API key from https://dashboard.thordata.com
3. Ensure header format is: Authorization: Bearer <YOUR_KEY>`;
        } else if (/timeout/i.test(errorMsg)) {
            troubleshooting = `
Troubleshooting (Timeout):
1. Free tier may cold start, wait and retry
2. Reduce crawl depth/limit for heavy requests
3. Retry after 5-10 seconds`;
        }

        responseOutput.innerHTML = `<code style="color: var(--error-color);">
❌ Error: ${errorMsg}
${troubleshooting}
</code>`;
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = originalText;
    }
}

// Hero Demo Tab Switching with Animation
document.addEventListener('DOMContentLoaded', function() {
    const demoTabs = document.querySelectorAll('.demo-tab');
    const demoCode = document.getElementById('demo-code');
    const demoStatus = document.getElementById('demo-status');
    const demoFormatBadge = document.getElementById('demo-format-badge');
    const demoFormatBadgeMain = document.getElementById('demo-format-badge-main');
    
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
    
    const formatBadges = {
        json: '[ .JSON ]',
        markdown: '[ .MD ]',
        html: '[ .HTML ]'
    };
    
    const formatBadgesMain = {
        json: '[ .JSON ]',
        markdown: '[ .MD ]',
        html: '[ .HTML ]'
    };
    
    // Simulate scraping animation
    function simulateScraping(format) {
        demoStatus.classList.remove('completed');
        demoStatus.querySelector('.status-text').textContent = 'Scraping...';
        
        setTimeout(() => {
            demoStatus.classList.add('completed');
            demoStatus.querySelector('.status-text').textContent = 'Completed';
            demoCode.textContent = demoContent[format] || demoContent.json;
            
            setTimeout(() => {
                demoStatus.classList.remove('completed');
                demoStatus.querySelector('.status-text').textContent = 'Scraping...';
            }, 2000);
        }, 1500);
    }
    
    demoTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            demoTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const format = this.getAttribute('data-format');
            
            // Update format badges
            if (demoFormatBadge) {
                demoFormatBadge.textContent = formatBadges[format] || '[ .MD ]';
            }
            if (demoFormatBadgeMain) {
                demoFormatBadgeMain.textContent = formatBadgesMain[format] || '[ .JSON ]';
            }
            
            // Simulate scraping
            simulateScraping(format);
        });
    });
    
    // Initial animation
    setTimeout(() => simulateScraping('json'), 500);
    
    // Auto-cycle demo (optional)
    let currentFormat = 0;
    const formats = ['json', 'markdown', 'html'];
    setInterval(() => {
        if (document.hidden) return; // Don't animate when tab is hidden
        currentFormat = (currentFormat + 1) % formats.length;
        const format = formats[currentFormat];
        const tab = document.querySelector(`.demo-tab[data-format="${format}"]`);
        if (tab) {
            tab.click();
        }
    }, 8000);
    
    // Load GitHub stars (only show if >= 50 stars to avoid showing low numbers)
    fetch('https://api.github.com/repos/Thordata/thordata-firecrawl')
        .then(response => response.json())
        .then(data => {
            const githubStat = document.getElementById('github-stat');
            const starsEl = document.getElementById('github-stars');
            if (githubStat && starsEl && data.stargazers_count) {
                const count = data.stargazers_count;
                if (count >= 50) {
                    starsEl.textContent = count >= 1000 ? (count / 1000).toFixed(1) + 'K' : count;
                    githubStat.style.display = 'flex';
                } else {
                    // Hide the GitHub stars stat if less than 50 stars
                    githubStat.style.display = 'none';
                }
            } else {
                // Hide if API fails or no stars
                if (githubStat) {
                    githubStat.style.display = 'none';
                }
            }
        })
        .catch(err => {
            const githubStat = document.getElementById('github-stat');
            // Hide GitHub stars stat on error
            if (githubStat) {
                githubStat.style.display = 'none';
            }
        });
    
    // Mobile Navigation Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Close mobile menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
    
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

// FAQ Toggle
function toggleFaq(button) {
    const faqItem = button.closest('.faq-item');
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Open clicked item if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

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

// Clear response
function clearResponse() {
    const responseOutput = document.getElementById('response-output');
    responseOutput.innerHTML = '<pre><code class="response-placeholder">// 1. Enter your API Key above\n// 2. Click "Load Example" to auto-fill request\n// 3. Click "Send Request" or press Ctrl/Cmd + Enter\n// \n// Response will appear here...</code></pre>';
    window.lastResponseData = null;
}

// Escape HTML for safe display
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Switch response format (JSON/Markdown/HTML)
function switchResponseFormat(format) {
    // Hide all format contents
    document.querySelectorAll('.response-format-content').forEach(el => {
        el.style.display = 'none';
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.format-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected format
    const contentEl = document.getElementById(`response-${format}`);
    if (contentEl) {
        contentEl.style.display = 'block';
    }
    
    // Activate selected tab
    const tabBtn = document.querySelector(`.format-tab-btn[data-format="${format}"]`);
    if (tabBtn) {
        tabBtn.classList.add('active');
    }
}

// Download response as file
function downloadResponse(format, content) {
    // Get timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    let filename = `thordata-firecrawl-${timestamp}.${format}`;
    let mimeType = 'text/plain';
    
    if (format === 'json') {
        mimeType = 'application/json';
    } else if (format === 'markdown') {
        mimeType = 'text/markdown';
    } else if (format === 'html') {
        mimeType = 'text/html';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to focus on API key input
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            const apiKeyInput = document.getElementById('api-key');
            if (apiKeyInput && document.activeElement !== apiKeyInput) {
                e.preventDefault();
                apiKeyInput.focus();
            }
        }
    });
    
    // Add enter key support for playground
    const requestBody = document.getElementById('request-body');
    if (requestBody) {
        requestBody.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + Enter to send request
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                sendRequest();
            }
        });
    }
});
