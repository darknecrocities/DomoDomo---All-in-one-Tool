// DomoDomo Chrome Extension Content Script
(function () {
  function init() {
    if (document.getElementById('domodomo-companion-root')) return;

    if (!document.body) {
      setTimeout(init, 100);
      return;
    }

    // Load saved coordinates or default to bottom right
    let savedX = window.innerWidth - 80;
    let savedY = window.innerHeight - 150;
    const savedPos = localStorage.getItem('domodomo_extension_position');
    if (savedPos) {
      try {
        const parsed = JSON.parse(savedPos);
        savedX = Math.min(Math.max(parsed.x, 10), window.innerWidth - 70);
        savedY = Math.min(Math.max(parsed.y, 10), window.innerHeight - 70);
      } catch (e) {
        console.warn('Could not parse extension position:', e);
      }
    }

    const container = document.createElement('div');
    container.id = 'domodomo-companion-root';
    container.style.position = 'fixed';
    container.style.left = savedX + 'px';
    container.style.top = savedY + 'px';
    container.style.zIndex = '9999999';
    document.body.appendChild(container);

    // Attach shadow root to isolate styling
    const shadow = container.attachShadow({ mode: 'open' });

    // Stylesheet
    const style = document.createElement('style');
    style.textContent = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        user-select: none;
      }
      
      /* Glowing floating button */
      .domo-orb {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: #3C6B4D;
        border: 1px solid #4d8661;
        box-shadow: 0 8px 32px rgba(60, 107, 77, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
        overflow: hidden;
      }
      .domo-orb:active {
        cursor: grabbing;
      }
      .domo-orb:hover {
        transform: scale(1.08);
        background: #467c59;
      }
      .domo-orb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        pointer-events: none;
      }
      .domo-badge {
        position: absolute;
        top: -1px;
        right: -1px;
        width: 12px;
        height: 12px;
        background: #10b981;
        border-radius: 50%;
        border: 2px solid #18191B;
      }

      /* Sidebar container */
      .domo-panel {
        display: none;
        width: 360px;
        height: 480px;
        background: #18191B;
        border: 1px solid #2A2D30;
        border-radius: 24px;
        box-shadow: 0 12px 64px rgba(0, 0, 0, 0.5);
        flex-direction: column;
        overflow: hidden;
        animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        position: absolute;
        bottom: 64px;
      }
      .domo-panel.open {
        display: flex;
      }

      /* Header */
      .domo-header {
        background: #111213;
        padding: 14px 16px;
        border-bottom: 1px solid #2A2D30;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: grab;
      }
      .domo-header:active {
        cursor: grabbing;
      }
      .domo-header-title {
        font-size: 13px;
        font-weight: 900;
        color: #ECEBE9;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        gap: 8px;
        pointer-events: none;
      }
      .domo-header-title img {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        object-fit: cover;
      }
      .domo-close-btn {
        background: none;
        border: none;
        color: #A3A09B;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .domo-close-btn:hover {
        color: #ECEBE9;
      }

      /* Messages log */
      .domo-messages {
        flex-grow: 1;
        padding: 16px;
        overflow-y: auto;
        background: #111213;
        display: flex;
        flex-direction: column;
        gap: 12px;
        user-select: text;
      }
      .msg-bubble {
        max-width: 85%;
        font-size: 12px;
        padding: 10px 14px;
        border-radius: 18px;
        line-height: 1.5;
      }
      .msg-user {
        align-self: flex-end;
        background: #3C6B4D;
        color: #ECEBE9;
        border-top-right-radius: 0;
      }
      .msg-domo {
        align-self: flex-start;
        background: #18191B;
        border: 1px solid #2A2D30;
        color: #ECEBE9;
        border-top-left-radius: 0;
      }
      .loading-indicator {
        align-self: flex-start;
        background: #18191B;
        border: 1px solid #2A2D30;
        padding: 10px 14px;
        border-radius: 18px;
        display: flex;
        gap: 4px;
      }
      .dot {
        width: 6px;
        height: 6px;
        background: #3C6B4D;
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out both;
      }
      .dot:nth-child(2) { animation-delay: 0.2s; }
      .dot:nth-child(3) { animation-delay: 0.4s; }

      /* Action bar */
      .domo-actions {
        padding: 8px 16px;
        background: #111213;
        border-top: 1px solid #2A2D30;
        display: flex;
        gap: 8px;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .domo-actions::-webkit-scrollbar {
        display: none;
      }
      .action-pill {
        background: #18191B;
        border: 1px solid #2A2D30;
        color: #A3A09B;
        font-size: 9px;
        font-weight: 700;
        padding: 6px 12px;
        border-radius: 8px;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s;
      }
      .action-pill:hover {
        background: rgba(60, 107, 77, 0.2);
        color: #ECEBE9;
        border-color: #3C6B4D;
      }

      /* Input area */
      .domo-input-area {
        padding: 12px;
        background: #18191B;
        border-top: 1px solid #2A2D30;
        display: flex;
        gap: 8px;
      }
      .domo-input {
        flex-grow: 1;
        background: #111213;
        border: 1px solid #2A2D30;
        border-radius: 12px;
        color: #ECEBE9;
        font-size: 12px;
        padding: 10px 14px;
        outline: none;
        user-select: text;
      }
      .domo-input:focus {
        border-color: #3C6B4D;
      }
      .domo-send-btn {
        background: #3C6B4D;
        border: none;
        color: #ECEBE9;
        padding: 8px 16px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
      }
      .domo-send-btn:hover {
        background: #467c59;
      }

      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); box-shadow: 0 0 15px rgba(60, 107, 77, 0.6); }
        100% { transform: scale(1); }
      }
      @keyframes slideIn {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1.0); }
      }
    `;

    shadow.appendChild(style);

    // Get logo URL
    const logoUrl = chrome.runtime.getURL('icon.png');

    // HTML Structure
    const rootDiv = document.createElement('div');
    rootDiv.innerHTML = `
      <div class="domo-orb" id="domo-trigger" title="Drag me / Click to chat with Domo">
        <img src="${logoUrl}" alt="Domo Logo" />
        <div class="domo-badge"></div>
      </div>
      
      <div class="domo-panel" id="domo-panel">
        <div class="domo-header" id="domo-header">
          <div class="domo-header-title">
            <img src="${logoUrl}" alt="Domo" /> Domo Page Assistant
          </div>
          <button class="domo-close-btn" id="domo-close">✕</button>
        </div>
        <div class="domo-messages" id="domo-chat-log">
          <div class="msg-bubble msg-domo">
            Hi! I am Domo. I can assist you offline. Ask me to summarize, explain, or check this page.
          </div>
        </div>
        <div class="domo-actions">
          <button class="action-pill" id="action-summary">Summarize Page</button>
          <button class="action-pill" id="action-keypoints">Key Takeaways</button>
          <button class="action-pill" id="action-explain">Explain Concept</button>
        </div>
        <div class="domo-input-area" id="domo-input-container">
          <input type="text" class="domo-input" id="domo-text-input" placeholder="Type offline query..." />
          <button class="domo-send-btn" id="domo-send">Send</button>
        </div>
      </div>
    `;

    shadow.appendChild(rootDiv);

    // References
    const trigger = shadow.getElementById('domo-trigger');
    const panel = shadow.getElementById('domo-panel');
    const closeBtn = shadow.getElementById('domo-close');
    const chatLog = shadow.getElementById('domo-chat-log');
    const textInput = shadow.getElementById('domo-text-input');
    const sendBtn = shadow.getElementById('domo-send');
    const summaryBtn = shadow.getElementById('action-summary');
    const keypointsBtn = shadow.getElementById('action-keypoints');
    const explainBtn = shadow.getElementById('action-explain');
    const header = shadow.getElementById('domo-header');

    // Drag support state
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialX = savedX;
    let initialY = savedY;
    let hasMoved = false;

    // Helper to align panel dynamically
    const alignPanel = (currentX) => {
      if (currentX < 380) {
        panel.style.right = 'auto';
        panel.style.left = '0px';
      } else {
        panel.style.left = 'auto';
        panel.style.right = '0px';
      }
    };

    alignPanel(savedX);

    // Mouse drag handlers
    const startDrag = (clientX, clientY) => {
      isDragging = true;
      startX = clientX;
      startY = clientY;
      initialX = parseInt(container.style.left) || 0;
      initialY = parseInt(container.style.top) || 0;
      hasMoved = false;

      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', stopDrag);
      document.addEventListener('touchmove', onTouchDrag, { passive: false });
      document.addEventListener('touchend', stopDrag);
    };

    const onDrag = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        hasMoved = true;
      }

      const newX = Math.min(Math.max(initialX + dx, 10), window.innerWidth - 70);
      const newY = Math.min(Math.max(initialY + dy, 10), window.innerHeight - 70);
      
      container.style.left = newX + 'px';
      container.style.top = newY + 'px';
      
      alignPanel(newX);
    };

    const onTouchDrag = (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        hasMoved = true;
      }

      const newX = Math.min(Math.max(initialX + dx, 10), window.innerWidth - 70);
      const newY = Math.min(Math.max(initialY + dy, 10), window.innerHeight - 70);
      
      container.style.left = newX + 'px';
      container.style.top = newY + 'px';
      
      alignPanel(newX);
    };

    const stopDrag = () => {
      if (isDragging) {
        isDragging = false;
        const finalPos = {
          x: parseInt(container.style.left),
          y: parseInt(container.style.top)
        };
        localStorage.setItem('domodomo_extension_position', JSON.stringify(finalPos));
      }
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
      document.removeEventListener('touchmove', onTouchDrag);
      document.removeEventListener('touchend', stopDrag);
    };

    // Attach listeners to trigger button and panel header
    trigger.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startDrag(e.clientX, e.clientY);
    });

    trigger.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY);
    });

    header.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startDrag(e.clientX, e.clientY);
    });

    header.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY);
    });

    // Disable dragging bubbling on chat elements
    const elementsToBlock = [chatLog, textInput, sendBtn, summaryBtn, keypointsBtn, explainBtn];
    elementsToBlock.forEach(el => {
      if (el) {
        el.addEventListener('mousedown', (e) => e.stopPropagation());
        el.addEventListener('touchstart', (e) => e.stopPropagation());
      }
    });

    // Close button click propagation block
    closeBtn.addEventListener('mousedown', (e) => e.stopPropagation());
    closeBtn.addEventListener('touchstart', (e) => e.stopPropagation());
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.remove('open');
      trigger.style.display = 'flex';
    });

    // Toggle panel click handler
    trigger.addEventListener('click', (e) => {
      if (!hasMoved) {
        panel.classList.add('open');
        trigger.style.display = 'none';
      }
    });

    // Extract page context parameters
    const getScrapedContext = () => {
      const title = document.title;
      // Get text paragraphs up to 1000 characters
      const paragraphs = Array.from(document.querySelectorAll('p'))
        .map(p => p.innerText.trim())
        .filter(text => text.length > 20)
        .slice(0, 4)
        .join('\n');
      return { title, paragraphs: paragraphs.substring(0, 1000) };
    };

    const appendMessage = (sender, text) => {
      const bubble = document.createElement('div');
      bubble.className = `msg-bubble msg-${sender}`;
      bubble.innerText = text;
      chatLog.appendChild(bubble);
      chatLog.scrollTop = chatLog.scrollHeight;
    };

    const appendLoading = () => {
      const loading = document.createElement('div');
      loading.id = 'domo-loading';
      loading.className = 'loading-indicator';
      loading.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
      chatLog.appendChild(loading);
      chatLog.scrollTop = chatLog.scrollHeight;
    };

    const removeLoading = () => {
      const loading = shadow.getElementById('domo-loading');
      if (loading) loading.remove();
    };

    const submitQuery = (customPrompt) => {
      const { title, paragraphs } = getScrapedContext();
      appendMessage('user', customPrompt);
      appendLoading();

      const fullPrompt = `Analyze the webpage titled: "${title}"\nPage Snippet:\n"""\n${paragraphs}\n"""\nUser Question: ${customPrompt}`;

      chrome.runtime.sendMessage({
        action: 'query-local-ai',
        payload: {
          model: 'llama3.2:1b',
          prompt: fullPrompt
        }
      }, (response) => {
        removeLoading();
        if (response && response.success) {
          appendMessage('domo', response.text);
        } else {
          appendMessage('domo', response?.error || 'Failed to communicate with local DomoDomo backend proxy. Verify connection.');
        }
      });
    };

    // Event Handlers
    sendBtn.addEventListener('click', () => {
      const val = textInput.value.trim();
      if (!val) return;
      textInput.value = '';
      submitQuery(val);
    });

    textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sendBtn.click();
      }
    });

    summaryBtn.addEventListener('click', () => {
      submitQuery('Provide a 2-sentence summary of this page.');
    });

    keypointsBtn.addEventListener('click', () => {
      submitQuery('List 3 key takeaways or facts from this page.');
    });

    explainBtn.addEventListener('click', () => {
      submitQuery('Explain the core concept in this page in simple terms.');
    });
  }

  // Run initialization
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
