// Background service worker for DomoDomo extension

// Auto-inject content script into all active tabs upon installation/reload
chrome.runtime.onInstalled.addListener(async () => {
  try {
    // Query all HTTP and HTTPS tabs
    const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
    for (const tab of tabs) {
      // Skip injecting into Chrome internal/system pages
      if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('devtools://'))) {
        continue;
      }
      
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        console.log(`Successfully auto-injected Domo Companion into tab: ${tab.url}`);
      } catch (err) {
        // Suppress warning if tab is not active or restricted (e.g. Chrome Web Store)
        console.warn(`Could not auto-inject into tab ${tab.id}:`, err);
      }
    }
  } catch (err) {
    console.error('Error executing auto-injection script on install:', err);
  }
});

// Listener for content script local AI queries
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'query-local-ai') {
    const { model, prompt } = request.payload;

    // Direct local fetch to backend proxy or Ollama API
    fetch('http://localhost:8000/api/thoughts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: prompt,
        model: model || 'llama3.2:1b'
      })
    })
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`HTTP status error: ${res.status}`);
      }
      const data = await res.json();
      sendResponse({ success: true, text: data.ai_insight || data.content });
    })
    .catch((err) => {
      // Fallback direct to Ollama if backend proxy is offline
      fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model || 'llama3.2:1b',
          prompt: prompt,
          stream: false
        })
      })
      .then(async (res) => {
        if (!res.ok) throw new Error('Ollama offline');
        const data = await res.json();
        sendResponse({ success: true, text: data.response });
      })
      .catch((fallbackErr) => {
        sendResponse({ success: false, error: `Could not connect to DomoDomo local API or Ollama direct port: ${fallbackErr.message}` });
      });
    });

    return true; // Keep message channel open for async response
  }
});
