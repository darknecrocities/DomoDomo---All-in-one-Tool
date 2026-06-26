import type { AutoPilotSkill } from './types';
import { localMemory } from '../../utils/localMemory';

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
      title: 'Title of the research document.',
      content: 'The fully formatted markdown content based on the research.'
    },
    execute: async (args, ctx) => {
      ctx.log(`Generating Research Markdown: ${args.title}`, 'action');
      await new Promise(resolve => setTimeout(resolve, 1000));
      ctx.log(`Research created with ${args.content?.length || 0} characters.`, 'success', args.content);
      return { success: true, file_preview: args.content };
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
  'open_domo_tool': {
    id: 'open_domo_tool',
    name: 'Open Domo Tool',
    description: 'Navigate the user interface to open a specific DomoDomo tool.',
    level: 2,
    parameters: {
      tool_id: 'The ID of the tool to open (e.g. "pdf-merge", "image-resizer").'
    },
    execute: async (args, ctx) => {
      ctx.log(`Opening Domo Tool: ${args.tool_id}`, 'action');
      window.location.hash = `#/tools/${args.tool_id}`;
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
      path: 'Absolute path to the file.'
    },
    execute: async (args, ctx) => {
      ctx.log(`Reading file: ${args.path}`, 'action');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, content: '// Mock file content' };
    }
  },
  'write_file_local': {
    id: 'write_file_local',
    name: 'Write Local File',
    description: 'Writes content to a local file. Will ask for confirmation.',
    level: 2,
    parameters: {
      path: 'Absolute path to the file.',
      content: 'Content to write.'
    },
    execute: async (args, ctx) => {
      const approved = await ctx.requestApproval(`Write ${args.content?.length || 0} characters to ${args.path}?`);
      if (!approved) throw new Error('User denied file write.');
      ctx.log(`Writing file: ${args.path}`, 'action');
      await new Promise(resolve => setTimeout(resolve, 1000));
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
      const approved = await ctx.requestApproval(`Execute terminal command: \`${args.command}\`?`);
      if (!approved) throw new Error('User denied terminal execution.');
      ctx.log(`Running command: ${args.command}`, 'action');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, output: 'Mock execution complete. Bridge required for actual OS command.' };
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
  }
};
