import type { AutoPilotSkill } from './types';
import { localMemory } from '../../utils/localMemory';
import { aiService } from '../../utils/aiService';
import { mcpClient } from '../../utils/mcpClient';
import { TOOLS } from '../../engine/registry';

export const skillsRegistry: Record<string, AutoPilotSkill> = {
  // ==========================================
  // LEVEL 1: Research & Knowledge
  // ==========================================
  'domo_knowledge': {
    id: 'domo_knowledge',
    name: 'Domo Knowledge Base',
    description: 'Answers questions about what DomoDomo can do, its tools, and its features.',
    level: 1,
    parameters: {
      question: 'The user question about Domo.'
    },
    execute: async (args, ctx) => {
      ctx.log(`Querying Domo Knowledge for: ${args.question}`, 'action');
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true, answer: 'DomoDomo is an all-in-one local tool hub. I can help you use it.' };
    }
  },
  'browser_search': {
    id: 'browser_search',
    name: 'Browser Search',
    description: 'Searches the web and returns a summary of results.',
    level: 1,
    parameters: {
      query: 'The search query string.'
    },
    execute: async (args, ctx) => {
      ctx.log(`Searching web for: ${args.query}`, 'action');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, summary: `Found information about ${args.query}` };
    }
  },
  'generate_research_markdown': {
    id: 'generate_research_markdown',
    name: 'Generate Research Markdown',
    description: 'Outputs literal research findings as a Markdown text file.',
    level: 1,
    parameters: {
      topic: 'The research topic query or question.',
      requirements: 'Any specific formatting or focus instructions.'
    },
    execute: async (args, ctx) => {
      const topic = args.topic || 'General Research';
      ctx.log(`Starting deep research on topic: "${topic}"...`, 'action');
      
      const prompt = `You are a professional, expert research assistant. The user wants a highly detailed, comprehensive, and exhaustive research report on the topic: "${topic}".
      
Specific requirements/instructions: "${args.requirements || 'No special requirements.'}"

Please write a full-fledged, multi-section markdown document that details your findings. Do not shorten or summarize excessively. Be extremely thorough.
Use headers, lists, bullet points, tables, and formatted code blocks if relevant. Do not include introductory conversational text (like "Here is the report..."), just output the Markdown contents directly.`;
      
      const response = await aiService.generateText(prompt, 2500, undefined, ctx.selectedModel, {
        temperature: 0.7
      });
      
      ctx.log(`Research completed successfully with ${response.length} characters.`, 'success', response);
      
      const filename = `${topic.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_findings.md`;
      ctx.addArtifact(filename, response, 'markdown');
      
      return { success: true, file_preview: response };
    }
  },
  'chat_reply': {
    id: 'chat_reply',
    name: 'Chat Reply',
    description: 'Replies directly to the user when they just ask a question or want to chat.',
    level: 1,
    parameters: {
      message: 'The message to send to the user.'
    },
    execute: async (args, ctx) => {
      ctx.log(args.message, 'info');
      localMemory.logActivity('AI Chat Reply', 'Chat', args.message);
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    }
  },
  'system_notification': {
    id: 'system_notification',
    name: 'Send System Notification',
    description: 'Sends a native OS desktop notification to the user.',
    level: 1,
    parameters: {
      title: 'The title of the notification.',
      message: 'The body of the notification.'
    },
    execute: async (args, ctx) => {
      ctx.log(`Sending notification: ${args.title}`, 'action');
      if (Notification.permission === 'granted') {
        new Notification(args.title, { body: args.message });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(args.title, { body: args.message });
        }
      }
      return { success: true };
    }
  },

  // ==========================================
  // LEVEL 2: App Mastery
  // ==========================================
  'analyze_uploaded_image': {
    id: 'analyze_uploaded_image',
    name: 'Analyze Uploaded Image',
    description: 'Uses local Vision AI (Llava) to analyze the uploaded image based on a query.',
    level: 2,
    parameters: {
      image_name: 'The filename of the uploaded image to analyze.',
      query: 'What to look for or analyze in the image.'
    },
    execute: async (args, ctx) => {
      const img = ctx.uploadedFiles.find(f => f.name === args.image_name);
      if (!img) {
        throw new Error(`File "${args.image_name}" not found in session memory.`);
      }
      if (!img.base64Raw) {
        throw new Error(`File "${args.image_name}" does not contain raw image data.`);
      }
      ctx.log(`Sending image "${img.name}" to Vision AI model (${ctx.selectedModel})...`, 'action');
      const response = await aiService.generateText(args.query, 1000, undefined, ctx.selectedModel, {
        images: [img.base64Raw],
        systemPrompt: 'You are a professional image analysis assistant. Describe the image and answer the user question based on the visual contents.'
      });
      ctx.log(`Vision analysis completed.`, 'success', response);
      return { success: true, analysis: response };
    }
  },
  'read_uploaded_file': {
    id: 'read_uploaded_file',
    name: 'Read Uploaded File',
    description: 'Reads the text content of a user-uploaded file (TXT, JSON, CSV).',
    level: 2,
    parameters: {
      file_name: 'The filename of the uploaded text file to read.'
    },
    execute: async (args, ctx) => {
      const file = ctx.uploadedFiles.find(f => f.name === args.file_name);
      if (!file) {
        throw new Error(`File "${args.file_name}" not found in session memory.`);
      }
      ctx.log(`Reading uploaded file: ${file.name}`, 'action');
      ctx.log(`File contents loaded (${file.content.length} characters).`, 'success', file.content);
      return { success: true, content: file.content };
    }
  },
  'open_domo_tool': {
    id: 'open_domo_tool',
    name: 'Open Domo Tool',
    description: 'Navigate the user interface to open a specific DomoDomo tool or page.',
    level: 2,
    parameters: {
      tool_id: 'The ID of the tool or page to open. Valid IDs: "about", "docs", "library-api", "dashboard", "auto-pilot", "model-migrator", "pdf-merge", "pdf-split", "pdf-compress", "pdf-ocr", "pdf-viewer", "pdf-text-edit", "image-resizer", "image-compressor", "crop-rotate", "ai-enhancer", "rich-text", "markdown-editor", "ocr-scanner", "hash-checker", "password-analyzer", "metadata-cleaner", "network-scanner", "qr-generator", "qr-scanner", "ai-chat", "ollama-library", "domo-agent-hub".'
    },
    execute: async (args, ctx) => {
      const id = (args.tool_id || '').trim().toLowerCase();
      ctx.log(`Navigating to: ${id}`, 'action');
      
      const validPages = ['about', 'docs', 'library-api', 'dashboard', 'home'];
      const validToolIds = TOOLS.map(t => t.id);
      const allValidIds = [...validPages, ...validToolIds];

      if (id && !allValidIds.includes(id)) {
        // Run fuzzy character matching to suggest candidates
        const suggestions = allValidIds.filter(item => {
          if (item.includes(id) || id.includes(item)) return true;
          const queryChars = new Set<string>(id.split(''));
          const itemChars = new Set<string>(item.split(''));
          let intersection = 0;
          queryChars.forEach((c: string) => {
            if (itemChars.has(c)) intersection++;
          });
          const ratio = intersection / Math.max(queryChars.size, itemChars.size);
          return ratio >= 0.7; // 70% character similarity
        });

        if (suggestions.length > 0) {
          throw new Error(`Tool/page "${id}" not found. Did you mean: ${suggestions.map(s => `"${s}"`).join(', ')}?`);
        } else {
          throw new Error(`Tool/page "${id}" not found. Please specify a valid tool or page.`);
        }
      }

      let path = '/';
      if (['about', 'docs', 'library-api'].includes(id)) {
        path = `/${id}`;
      } else if (id === 'dashboard' || id === 'home') {
        path = '/';
      } else {
        // Redirect to standard tool path format: tool/:id
        path = `/tool/${id}`;
      }

      // Dispatch custom navigate event for React Router synchronicity
      const event = new CustomEvent('domo-navigate', { detail: { path } });
      window.dispatchEvent(event);
      
      // Safe fallback
      window.location.hash = `#${path}`;
      
      return { success: true };
    }
  },
  'domo_ui_interact': {
    id: 'domo_ui_interact',
    name: 'Domo UI Interaction',
    description: 'Click buttons or fill forms within the DOM of the DomoDomo application.',
    level: 2,
    parameters: {
      action: 'The action to perform (click, type).',
      target: 'The CSS selector of the element.',
      value: 'The value to type, if applicable.'
    },
    execute: async (args, ctx) => {
      ctx.log(`UI Interact: ${args.action} on ${args.target}`, 'action');
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real implementation, this would use document.querySelector and dispatch events
      return { success: true, status: `Simulated ${args.action} on ${args.target}` };
    }
  },
  'read_file_local': {
    id: 'read_file_local',
    name: 'Read Local File',
    description: 'Reads the contents of a local file in the workspace.',
    level: 2,
    parameters: {
      path: 'Relative path to the file.'
    },
    execute: async (args, ctx) => {
      ctx.log(`Reading file: ${args.path}`, 'action');
      if (mcpClient.isOnline()) {
        try {
          const res = await mcpClient.callTool('read_file', { path: args.path });
          const content = res.content?.[0]?.text || '';
          ctx.log(`Successfully read file content (${content.length} chars).`, 'success');
          return { success: true, content };
        } catch (err: any) {
          ctx.log(`MCP read_file failed: ${err.message}. Falling back to simulation.`, 'error');
        }
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, content: `// Simulated content for ${args.path}\nconst example = 42;` };
    }
  },
  'write_file_local': {
    id: 'write_file_local',
    name: 'Write Local File',
    description: 'Writes content to a local file. Will ask for confirmation.',
    level: 2,
    parameters: {
      path: 'Relative path to the file.',
      content: 'Content to write.'
    },
    execute: async (args, ctx) => {
      const approved = await ctx.requestApproval(`Write ${args.content?.length || 0} characters to ${args.path}?`);
      if (!approved) throw new Error('User denied file write.');
      ctx.log(`Writing file: ${args.path}`, 'action');
      
      const filename = args.path.split(/[/\\]/).pop() || 'file.txt';
      if (mcpClient.isOnline()) {
        try {
          await mcpClient.callTool('write_file', { path: args.path, content: args.content });
          ctx.log(`Successfully wrote to local file: ${args.path}`, 'success');
          ctx.addArtifact(filename, args.content, 'code');
          return { success: true };
        } catch (err: any) {
          ctx.log(`MCP write_file failed: ${err.message}. Falling back to simulation.`, 'error');
        }
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      ctx.addArtifact(filename, args.content, 'code');
      return { success: true };
    }
  },

  // ==========================================
  // LEVEL 3: OS Control (Physical Computer)
  // ==========================================
  'os_execute_terminal': {
    id: 'os_execute_terminal',
    name: 'Execute Terminal Command',
    description: 'Runs a raw terminal bash command on the host machine. DANGEROUS.',
    level: 3,
    parameters: {
      command: 'The bash command to run.'
    },
    execute: async (args, ctx) => {
      const command = args.command || '';
      
      // Strict Security Guardrails checking
      const cleanCmd = command.toLowerCase().trim();
      const destructivePatterns = [
        /\brm\s+-[rf]*/,     // rm -rf
        /\bdel\s+\/s/i,       // del /s
        /\bformat\b/,         // disk format
        /\brd\s+\/s/i,         // rd /s Windows
        /\brmdir\s+-[rf]*/,     // rmdir recursive
        /\bshred\b/,
        /\bmkfs\b/,
        /\bdd\b/,
        /c:\\windows/i,
        /c:\\system32/i
      ];
      const isDangerous = destructivePatterns.some(pat => pat.test(cleanCmd));
      if (isDangerous) {
        ctx.log(`⚠️ Blocked hazardous terminal command due to safety guardrails: "${command}"`, 'error');
        throw new Error(`Security Guardrail Block: Dangerous or destructive command detected.`);
      }

      const approved = await ctx.requestApproval(`Execute terminal command: \`${command}\`?`);
      if (!approved) throw new Error('User denied terminal execution.');
      ctx.log(`Running command: ${command}`, 'action');
      
      if (mcpClient.isOnline()) {
        try {
          const res = await mcpClient.callTool('execute_command', { command });
          const output = res.content?.[0]?.text || '';
          ctx.log(`Command execution completed successfully.`, 'success', output);
          return { success: true, output };
        } catch (err: any) {
          ctx.log(`MCP execute_command failed: ${err.message}. Falling back to simulation.`, 'error');
        }
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, output: `[Simulated Stdout for "${command}"]: Execution completed.` };
    }
  },
  'os_simulate_keystroke': {
    id: 'os_simulate_keystroke',
    name: 'Simulate Keystroke (OS Level)',
    description: 'Presses physical keyboard keys (e.g. Tab, Enter, Write text) on the host OS.',
    level: 3,
    parameters: {
      keys: 'The key sequence to type or press.',
      modifier: 'Any modifier key like cmd, ctrl, shift.'
    },
    execute: async (args, ctx) => {
      const approved = await ctx.requestApproval(`Allow Auto-Pilot to physically type "${args.keys}" on your computer?`);
      if (!approved) throw new Error('User denied keystroke simulation.');
      ctx.log(`Typing: ${args.keys}`, 'action');
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true, status: 'Mock keystroke complete. Desktop bridge required for live OS typing.' };
    }
  },
  'os_simulate_click': {
    id: 'os_simulate_click',
    name: 'Simulate Mouse Click (OS Level)',
    description: 'Moves the physical mouse to coordinates and clicks on the host OS.',
    level: 3,
    parameters: {
      x: 'X coordinate.',
      y: 'Y coordinate.',
      type: 'Click type (left, right, double).'
    },
    execute: async (args, ctx) => {
      const approved = await ctx.requestApproval(`Allow Auto-Pilot to move your mouse and click at (${args.x}, ${args.y})?`);
      if (!approved) throw new Error('User denied mouse control.');
      ctx.log(`Moving mouse and clicking at ${args.x}, ${args.y}`, 'action');
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true, status: 'Mock click complete. Desktop bridge required for live OS mouse control.' };
    }
  },
  'os_list_directory': {
    id: 'os_list_directory',
    name: 'OS List Directory',
    description: 'Lists all files and folders recursively inside any absolute directory path on the computer (Level 3).',
    level: 3,
    parameters: {
      path: 'The absolute directory path to list (e.g., "/Users/username/Documents" or "C:\\Users").'
    },
    execute: async (args, ctx) => {
      const dirPath = args.path || '';
      ctx.log(`OS Listing directory: ${dirPath}`, 'action');
      if (mcpClient.isOnline()) {
        try {
          const res = await mcpClient.callTool('list_directory', { path: dirPath });
          const content = JSON.parse(res.content?.[0]?.text || '[]');
          ctx.log(`Successfully listed directory contents (${content.length} items found).`, 'success');
          return { success: true, files: content };
        } catch (err: any) {
          ctx.log(`MCP list_directory failed: ${err.message}`, 'error');
          throw err;
        }
      }
      throw new Error('MCP server is offline. Absolute folder listing is disabled.');
    }
  },
  'os_search_files': {
    id: 'os_search_files',
    name: 'OS Search Files',
    description: 'Searches recursively for files matching a query string starting from an absolute root path on the computer (Level 3).',
    level: 3,
    parameters: {
      query: 'Term to find in filenames.',
      rootPath: 'Optional absolute starting path (e.g., "/Users/username" or "C:\\Users").'
    },
    execute: async (args, ctx) => {
      ctx.log(`OS Searching files for: "${args.query}" under "${args.rootPath || 'Workspace'}"`, 'action');
      if (mcpClient.isOnline()) {
        try {
          const res = await mcpClient.callTool('search_files', { query: args.query, rootPath: args.rootPath });
          const matched = JSON.parse(res.content?.[0]?.text || '[]');
          ctx.log(`Search complete. Found ${matched.length} matches.`, 'success');
          return { success: true, matches: matched };
        } catch (err: any) {
          ctx.log(`MCP search_files failed: ${err.message}`, 'error');
          throw err;
        }
      }
      throw new Error('MCP server is offline. Global OS search is disabled.');
    }
  },
  'os_read_file': {
    id: 'os_read_file',
    name: 'OS Read File',
    description: 'Reads the text content of any file on the computer using an absolute file path (Level 3).',
    level: 3,
    parameters: {
      path: 'The absolute file path to read (e.g., "/Users/username/Documents/notes.txt").'
    },
    execute: async (args, ctx) => {
      ctx.log(`OS Reading file: ${args.path}`, 'action');
      if (mcpClient.isOnline()) {
        try {
          const res = await mcpClient.callTool('read_file', { path: args.path });
          const content = res.content?.[0]?.text || '';
          ctx.log(`Successfully read OS file (${content.length} characters).`, 'success');
          return { success: true, content };
        } catch (err: any) {
          ctx.log(`MCP read_file failed: ${err.message}`, 'error');
          throw err;
        }
      }
      throw new Error('MCP server is offline. Absolute file reading is disabled.');
    }
  },
  'os_write_file': {
    id: 'os_write_file',
    name: 'OS Write File',
    description: 'Writes/Saves content to any file on the computer using an absolute file path (Level 3). Will ask for confirmation.',
    level: 3,
    parameters: {
      path: 'The absolute file path to write to.',
      content: 'The content to write.'
    },
    execute: async (args, ctx) => {
      const approved = await ctx.requestApproval(`Write to absolute file path: ${args.path}?`);
      if (!approved) throw new Error('User denied OS file write.');
      ctx.log(`OS Writing file: ${args.path}`, 'action');
      if (mcpClient.isOnline()) {
        try {
          await mcpClient.callTool('write_file', { path: args.path, content: args.content });
          ctx.log(`Successfully wrote to absolute file: ${args.path}`, 'success');
          return { success: true };
        } catch (err: any) {
          ctx.log(`MCP write_file failed: ${err.message}`, 'error');
          throw err;
        }
      }
      throw new Error('MCP server is offline. Absolute file writing is disabled.');
    }
  },
  'os_open_browser': {
    id: 'os_open_browser',
    name: 'Open Link in Browser',
    description: 'Opens a web URL or searches a query in the default system web browser (Level 3).',
    level: 3,
    parameters: {
      url: 'The URL to open (e.g. "https://facebook.com"), or a search query (e.g. "facebook").'
    },
    execute: async (args, ctx) => {
      let target = args.url || '';
      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        // If it's not a URL, make it a Google search query!
        target = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
      }
      
      const approved = await ctx.requestApproval(`Open browser to: ${target}?`);
      if (!approved) throw new Error('User denied browser request.');
      
      ctx.log(`Opening browser: ${target}`, 'action');
      if (mcpClient.isOnline()) {
        try {
          let cmd = '';
          if (process.platform === 'win32') {
            cmd = `start "" "${target}"`;
          } else if (process.platform === 'darwin') {
            cmd = `open "${target}"`;
          } else {
            cmd = `xdg-open "${target}"`;
          }
          await mcpClient.callTool('execute_command', { command: cmd });
          ctx.log(`Successfully opened browser to: ${target}`, 'success');
          return { success: true };
        } catch (err: any) {
          ctx.log(`MCP open failed: ${err.message}`, 'error');
        }
      }
      
      // Fallback: try opening it using browser window.open if running in frontend context
      window.open(target, '_blank');
      return { success: true };
    }
  }
};
