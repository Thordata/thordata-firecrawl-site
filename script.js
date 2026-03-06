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

// Initialize with default example
document.addEventListener('DOMContentLoaded', function() {
    loadExample();
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
    responseOutput.innerHTML = '<code class="loading">⏳ Sending request... Please wait</code>';
    
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
        
        // Format response with smart markdown/html handling
        const statusClass = response.ok ? 'var(--success-color)' : 'var(--error-color)';
        const statusIcon = response.ok ? '✅' : '❌';
        
        // Check if response contains markdown or html
        let hasMarkdown = false;
        let hasHtml = false;
        let markdownContent = '';
        let htmlContent = '';
        
        if (data.data) {
            if (data.data.markdown) {
                hasMarkdown = true;
                markdownContent = data.data.markdown;
            }
            if (data.data.html) {
                hasHtml = true;
                htmlContent = data.data.html;
            }
        }
        
        // Build response HTML with format tabs
        let responseHtml = `
<div class="response-status" style="color: ${statusClass}; margin-bottom: 1rem;">
    ${statusIcon} Status: ${response.status} ${response.statusText}
</div>`;

        // Helpful guidance for common HTTP errors
        if (!response.ok) {
            let helpMsg = '';
            if (response.status === 401 || response.status === 403) {
                helpMsg = 'Auth issue: please use your own API key from https://dashboard.thordata.com and ensure Authorization header uses Bearer token.';
            } else if (response.status === 429) {
                helpMsg = 'Rate limited: please retry after a short delay or reduce request frequency.';
            } else if (response.status >= 500) {
                helpMsg = 'Server issue or cold start: please retry in 5-10 seconds.';
            }
            if (helpMsg) {
                responseHtml += `<div class="response-help">💡 ${helpMsg}</div>`;
            }
        }
        
        if (hasMarkdown || hasHtml) {
            // Add format tabs
            responseHtml += `
<div class="response-format-tabs" style="display: flex; gap: 0.5rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
    <button class="format-tab-btn active" data-format="json" onclick="switchResponseFormat('json')">JSON</button>
    ${hasMarkdown ? '<button class="format-tab-btn" data-format="markdown" onclick="switchResponseFormat(\'markdown\')">Markdown</button>' : ''}
    ${hasHtml ? '<button class="format-tab-btn" data-format="html" onclick="switchResponseFormat(\'html\')">HTML</button>' : ''}
</div>`;
            
            // Add content containers
            const formattedJson = JSON.stringify(data, null, 2);
            responseHtml += `
<div id="response-json" class="response-format-content active">
    <pre><code>${escapeHtml(formattedJson)}</code></pre>
    <button class="download-btn" data-format="json" data-content="${escapeHtml(formattedJson).replace(/"/g, '&quot;')}" title="Download as JSON">📥 Download JSON</button>
</div>`;
            
            if (hasMarkdown) {
                // Store markdown content in a data attribute for download (base64 encoded to avoid escaping issues)
                const markdownBase64 = btoa(unescape(encodeURIComponent(markdownContent)));
                responseHtml += `
<div id="response-markdown" class="response-format-content" style="display: none;">
    <pre><code class="markdown-content">${escapeHtml(markdownContent)}</code></pre>
    <button class="download-btn" data-format="markdown" data-content-base64="${markdownBase64}" title="Download as Markdown">📥 Download Markdown</button>
</div>`;
            }
            
            if (hasHtml) {
                // Store HTML content in a data attribute for download (base64 encoded)
                const htmlBase64 = btoa(unescape(encodeURIComponent(htmlContent)));
                responseHtml += `
<div id="response-html" class="response-format-content" style="display: none;">
    <pre><code class="html-content">${escapeHtml(htmlContent)}</code></pre>
    <button class="download-btn" data-format="html" data-content-base64="${htmlBase64}" title="Download as HTML">📥 Download HTML</button>
</div>`;
            }
            
            // Store response data globally for format switching and download
            window.lastResponseData = {
                json: formattedJson,
                markdown: hasMarkdown ? markdownContent : null,
                html: hasHtml ? htmlContent : null
            };
        } else {
            // No markdown/html, just show JSON
            const formatted = JSON.stringify(data, null, 2);
            responseHtml += `
<div class="response-format-content">
    <pre><code>${escapeHtml(formatted)}</code></pre>
    <button class="download-btn" data-format="json" data-content="${escapeHtml(formatted).replace(/"/g, '&quot;')}" title="Download as JSON">📥 Download JSON</button>
</div>`;
            window.lastResponseData = { json: formatted };
        }
        
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
