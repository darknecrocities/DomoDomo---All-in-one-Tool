import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { aiService } from '../utils/aiService';
import { X, Send, HelpCircle, FileText } from 'lucide-react';
import domodomoLogo from '../assets/domodomo.png';

export const FloatingDomo: React.FC = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'domo'; text: string }[]>([
    { sender: 'domo', text: 'Hi! I am Domo, your offline assistant. Ask me anything about the active page or workspace.' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama3.2:1b');
  const [activeTabName, setActiveTabName] = useState('Dashboard');
  const [assistantPersona, setAssistantPersona] = useState('You are Domo, a helpful offline AI assistant inside the DomoDomo application. Respond briefly and friendly.');
  const [glowEffect, setGlowEffect] = useState('regular');

  // Draggable position coordinates
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0, hasMoved: false });

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const loadPreferences = () => {
    const showSetting = localStorage.getItem('domodomo_show_floating_assistant');
    setIsVisible(showSetting === null ? true : showSetting === 'true');

    const savedModel = aiService.getSelectedOllamaModel();
    if (savedModel) {
      setSelectedModel(savedModel);
    }

    const savedPersona = localStorage.getItem('domodomo_assistant_persona');
    if (savedPersona) {
      setAssistantPersona(savedPersona);
    }

    const savedGlow = localStorage.getItem('domodomo_assistant_glow');
    if (savedGlow) {
      setGlowEffect(savedGlow);
    }

    // Load saved position or set default position
    const savedPos = localStorage.getItem('domodomo_assistant_position');
    if (savedPos) {
      try {
        const parsed = JSON.parse(savedPos);
        // Ensure within window bounds
        const x = Math.min(Math.max(parsed.x, 10), window.innerWidth - 70);
        const y = Math.min(Math.max(parsed.y, 10), window.innerHeight - 70);
        setPosition({ x, y });
      } catch {
        setDefaultPosition();
      }
    } else {
      setDefaultPosition();
    }
  };

  const setDefaultPosition = () => {
    setPosition({
      x: window.innerWidth - 80,
      y: window.innerHeight - 180
    });
  };

  useEffect(() => {
    loadPreferences();
    window.addEventListener('domodomo_settings_updated', loadPreferences);
    window.addEventListener('resize', setDefaultPosition);
    return () => {
      window.removeEventListener('domodomo_settings_updated', loadPreferences);
      window.removeEventListener('resize', setDefaultPosition);
    };
  }, []);

  // Update tab naming on route change
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveTabName('Dashboard Home');
    else if (path.startsWith('/tool/')) {
      const toolId = path.split('/')[2];
      setActiveTabName(`Tool: ${toolId}`);
    } else if (path === '/settings') setActiveTabName('System Settings');
    else if (path === '/about') setActiveTabName('About Page');
    else if (path === '/download') setActiveTabName('Downloads Page');
    else if (path === '/library-api') setActiveTabName('API Reference');
    else if (path.startsWith('/blog')) setActiveTabName('Blog Center');
    else setActiveTabName('Domo Workspace');
  }, [location]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent<any>) => {
    const target = e.target as HTMLElement;
    
    // Ignore interactive elements if the dialog is open
    if (isOpen) {
      if (
        target.closest('button') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('a')
      ) {
        return;
      }
    }

    // Ignore scrollbar clicks on scrollable containers
    const scrollContainer = target.closest('.overflow-y-auto, .overflow-x-auto') as HTMLElement;
    if (scrollContainer) {
      const rect = scrollContainer.getBoundingClientRect();
      // Check vertical scrollbar
      if (scrollContainer.scrollHeight > scrollContainer.clientHeight) {
        const scrollbarWidth = scrollContainer.offsetWidth - scrollContainer.clientWidth;
        if (scrollbarWidth > 0 && e.clientX >= rect.right - scrollbarWidth) {
          return;
        }
      }
      // Check horizontal scrollbar
      if (scrollContainer.scrollWidth > scrollContainer.clientWidth) {
        const scrollbarHeight = scrollContainer.offsetHeight - scrollContainer.clientHeight;
        if (scrollbarHeight > 0 && e.clientY >= rect.bottom - scrollbarHeight) {
          return;
        }
      }
    }

    e.preventDefault();
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
      hasMoved: false
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragRef.current.isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    
    // Check if movement is significant (not just micro-jiggle)
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragRef.current.hasMoved = true;
    }

    const newX = Math.min(Math.max(dragRef.current.initialX + dx, 10), window.innerWidth - 70);
    const newY = Math.min(Math.max(dragRef.current.initialY + dy, 10), window.innerHeight - 70);
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (dragRef.current.isDragging) {
      dragRef.current.isDragging = false;
      localStorage.setItem('domodomo_assistant_position', JSON.stringify(position));
    }
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Touch support for mobile dragging
  const handleTouchStart = (e: React.TouchEvent<any>) => {
    const target = e.target as HTMLElement;

    // Ignore interactive elements and scrollable zones if the dialog is open
    if (isOpen) {
      if (
        target.closest('button') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('a')
      ) {
        return;
      }

      // Ignore touches starting on scrollable areas on mobile (to allow normal scrolling)
      if (target.closest('.overflow-y-auto, .overflow-x-auto')) {
        return;
      }
    }

    const touch = e.touches[0];
    dragRef.current = {
      isDragging: true,
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: position.x,
      initialY: position.y,
      hasMoved: false
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!dragRef.current.isDragging) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragRef.current.startX;
    const dy = touch.clientY - dragRef.current.startY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragRef.current.hasMoved = true;
    }

    const newX = Math.min(Math.max(dragRef.current.initialX + dx, 10), window.innerWidth - 70);
    const newY = Math.min(Math.max(dragRef.current.initialY + dy, 10), window.innerHeight - 70);
    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    if (dragRef.current.isDragging) {
      dragRef.current.isDragging = false;
      localStorage.setItem('domodomo_assistant_position', JSON.stringify(position));
    }
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  const handleTriggerClick = () => {
    // Only toggle panel open/close if the button wasn't dragged!
    if (!dragRef.current.hasMoved) {
      setIsOpen(prev => !prev);
    }
  };

  const handleSend = async () => {
    if (!inputVal.trim()) return;
    const userPrompt = inputVal.trim();
    setInputVal('');
    setMessages(prev => [...prev, { sender: 'user', text: userPrompt }]);
    setIsLoading(true);

    try {
      const systemPrompt = `${assistantPersona}\n\nCurrent active page context: "${activeTabName}".`;

      const response = await aiService.generateText(
        userPrompt,
        500,
        undefined,
        selectedModel,
        { systemPrompt }
      );

      setMessages(prev => [...prev, { sender: 'domo', text: response }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { sender: 'domo', text: `Failed to fetch response: ${err.message || 'Ensure Ollama is started locally.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed z-[99999] font-sans select-none"
      style={{ left: position.x, top: position.y }}
    >
      {/* Floating Button with Domo Logo */}
      {!isOpen && (
        <button
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={handleTriggerClick}
          className={`flex items-center justify-center w-14 h-14 rounded-full bg-[#3C6B4D] hover:bg-[#467c59] text-[#ECEBE9] hover:scale-105 transition-transform duration-300 relative group border cursor-grab active:cursor-grabbing overflow-hidden ${
            glowEffect === 'none' ? 'shadow-xl border-[#4d8661]' :
            glowEffect === 'mini' ? 'shadow-[0_0_12px_rgba(60,107,77,0.3)] animate-pulse border-[#4d8661]' :
            glowEffect === 'high' ? 'shadow-[0_0_30px_rgba(60,107,77,0.85)] animate-pulse border-[#7cdba3]' :
            'shadow-[0_0_20px_rgba(60,107,77,0.55)] animate-pulse border-[#4d8661]'
          }`}
          title="Drag me / Click to chat with Domo"
        >
          <img
            src={domodomoLogo}
            alt="Domo Logo"
            className="w-full h-full object-cover pointer-events-none"
          />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#111213]"></span>
        </button>
      )}

      {/* Expanded Chat Dialog (Anchored directly next to the button) */}
      {isOpen && (
        <div 
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="absolute bottom-16 w-80 sm:w-96 h-[460px] bg-[#18191B] border border-[#2A2D30] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 cursor-grab active:cursor-grabbing"
          style={position.x < 380 ? { left: 0 } : { right: 0 }}
        >
          {/* Header */}
          <div 
            className="bg-[#111213] border-b border-[#2A2D30] px-4 py-3.5 flex justify-between items-center select-none"
          >
            <div className="flex items-center gap-2 pointer-events-none">
              <img src={domodomoLogo} alt="Domo Logo" className="w-5 h-5 rounded-md" />
              <div>
                <h3 className="text-xs font-black tracking-wide text-[#ECEBE9]">Domo Companion</h3>
                <span className="text-[9px] text-[#A3A09B] font-mono block">Context: {activeTabName}</span>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
              onMouseDown={(e) => e.stopPropagation()}
              className="text-[#A3A09B] hover:text-[#ECEBE9] transition-colors p-1"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Log */}
          <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-[#111213]/40 cursor-default">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] text-xs px-3.5 py-2.5 rounded-2xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#3C6B4D] text-[#ECEBE9] rounded-tr-none'
                    : 'bg-[#18191B] border border-[#2A2D30] text-[#ECEBE9]/95 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#18191B] border border-[#2A2D30] text-xs px-4 py-3 rounded-2xl rounded-tl-none text-[#A3A09B] flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-[#3C6B4D] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-[#3C6B4D] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-[#3C6B4D] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Context Prompts */}
          <div className="bg-[#111213]/60 px-4 py-2 border-t border-[#2A2D30]/60 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none cursor-default">
            <button
              onClick={() => setInputVal(`Summarize what the ${activeTabName} screen is designed for.`)}
              className="text-[9px] font-bold px-2.5 py-1 bg-[#18191B] hover:bg-[#3C6B4D]/25 border border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] rounded-lg transition-all flex items-center gap-1"
            >
              <FileText size={10} />
              <span>Explain screen</span>
            </button>
            <button
              onClick={() => setInputVal("Explain standard Ollama settings configuration in DomoDomo.")}
              className="text-[9px] font-bold px-2.5 py-1 bg-[#18191B] hover:bg-[#3C6B4D]/25 border border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] rounded-lg transition-all flex items-center gap-1"
            >
              <img src={domodomoLogo} alt="Domo" className="w-2.5 h-2.5 rounded-sm" />
              <span>Configure Ollama</span>
            </button>
            <button
              onClick={() => setInputVal("How does offline vector embeddings semantic search function?")}
              className="text-[9px] font-bold px-2.5 py-1 bg-[#18191B] hover:bg-[#3C6B4D]/25 border border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] rounded-lg transition-all flex items-center gap-1"
            >
              <HelpCircle size={10} />
              <span>Ask about RAG</span>
            </button>
          </div>

          {/* Message Input Box */}
          <div className="p-3 bg-[#18191B] border-t border-[#2A2D30] flex gap-2 items-center cursor-default">
            <input
              type="text"
              placeholder="Ask Domo..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-grow bg-[#111213] text-xs px-3.5 py-2.5 border border-[#2A2D30] rounded-xl text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputVal.trim()}
              className="p-2.5 rounded-xl bg-[#3C6B4D] hover:bg-[#467c59] disabled:bg-[#2A2D30] text-[#ECEBE9] disabled:text-[#A3A09B] transition-colors"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default FloatingDomo;
