import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Root path configuration (default to domodomo workspace root)
const WORKSPACE_ROOT = path.resolve('../');

const server = new Server(
  {
    name: 'domo-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools schemas
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'read_file',
        description: 'Read the contents of a local file in the workspace.',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Relative path of the file to read' },
          },
          required: ['path'],
        },
      },
      {
        name: 'write_file',
        description: 'Create or overwrite a file in the workspace.',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Relative path of the target file' },
            content: { type: 'string', description: 'Full code/text content to write' },
          },
          required: ['path', 'content'],
        },
      },
      {
        name: 'execute_command',
        description: 'Execute a development shell command in the local workspace.',
        inputSchema: {
          type: 'object',
          properties: {
            command: { type: 'string', description: 'Command string to execute (e.g. npm run build, vitest, etc.)' },
          },
          required: ['command'],
        },
      },
      {
        name: 'git_status',
        description: 'Retrieve the current Git status of the local repository.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_directory',
        description: 'List all files and subdirectories recursively in the local workspace.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'stitch',
        description: 'Perform a seek-and-replace modification (stitch) to an existing file.',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Relative path of the file to edit' },
            searchContent: { type: 'string', description: 'Exact code block to target and replace' },
            replacementContent: { type: 'string', description: 'New code block to replace the target content with' },
          },
          required: ['path', 'searchContent', 'replacementContent'],
        },
      },
    ],
  };
});

// Call tools dispatcher
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'read_file': {
        const relPath = (args as any).path;
        const absPath = path.resolve(WORKSPACE_ROOT, relPath);
        if (!fs.existsSync(absPath)) {
          return { content: [{ type: 'text', text: `Error: File not found at ${relPath}` }], isError: true };
        }
        const data = fs.readFileSync(absPath, 'utf-8');
        return { content: [{ type: 'text', text: data }] };
      }

      case 'write_file': {
        let relPath = (args as any).path;
        const content = (args as any).content;
        
        // Strip leading slashes and relative path indicators to prevent resolving outside workspace
        relPath = relPath.replace(/^(\.\/|\/)+/, '');
        const absPath = path.resolve(WORKSPACE_ROOT, relPath);
        
        // Ensure folder directory exists
        const dir = path.dirname(absPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(absPath, content, 'utf-8');
        return { content: [{ type: 'text', text: `Successfully wrote file: ${relPath}` }] };
      }

      case 'execute_command': {
        const cmd = (args as any).command;
        return new Promise((resolve) => {
          exec(cmd, { cwd: WORKSPACE_ROOT }, (error, stdout, stderr) => {
            const output = stdout + (stderr ? `\nStderr:\n${stderr}` : '');
            resolve({
              content: [{ type: 'text', text: output || 'Command ran with no output.' }],
              isError: !!error,
            });
          });
        });
      }

      case 'git_status': {
        return new Promise((resolve) => {
          exec('git status -s', { cwd: WORKSPACE_ROOT }, (error, stdout, stderr) => {
            if (error) {
              resolve({ content: [{ type: 'text', text: `Git Error: ${stderr}` }], isError: true });
            } else {
              resolve({ content: [{ type: 'text', text: stdout || 'Repository clean. No changes.' }] });
            }
          });
        });
      }

      case 'stitch': {
        const relPath = (args as any).path;
        const searchContent = (args as any).searchContent;
        const replacementContent = (args as any).replacementContent;
        const absPath = path.resolve(WORKSPACE_ROOT, relPath);

        if (!fs.existsSync(absPath)) {
          return { content: [{ type: 'text', text: `Error: Target file not found at ${relPath}` }], isError: true };
        }

        const fileContent = fs.readFileSync(absPath, 'utf-8');
        if (!fileContent.includes(searchContent)) {
          return {
            content: [{ type: 'text', text: `Error: Search content block was not found inside ${relPath}. Ensure whitespace matches exactly.` }],
            isError: true,
          };
        }

        const updatedContent = fileContent.replace(searchContent, replacementContent);
        fs.writeFileSync(absPath, updatedContent, 'utf-8');
        
        return {
          content: [
            { type: 'text', text: `Stitch completed successfully in ${relPath}. Target block replaced.` }
          ],
        };
      }

      case 'list_directory': {
        const getFiles = (dir: string, baseDir: string = ''): any[] => {
          const results: any[] = [];
          if (!fs.existsSync(dir)) return [];
          const list = fs.readdirSync(dir);
          list.forEach((file) => {
            const absPath = path.join(dir, file);
            const relPath = baseDir ? `${baseDir}/${file}` : file;
            
            // Skip node_modules, .git, and build artifacts
            if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.gemini' || file === 'build') {
              return;
            }
            
            try {
              const stat = fs.statSync(absPath);
              if (stat && stat.isDirectory()) {
                results.push({
                  name: file,
                  path: relPath,
                  kind: 'directory',
                  children: getFiles(absPath, relPath)
                });
              } else {
                results.push({
                  name: file,
                  path: relPath,
                  kind: 'file'
                });
              }
            } catch (err) {
              // skip unreadable files/symlinks
            }
          });
          return results;
        };

        try {
          const files = getFiles(WORKSPACE_ROOT);
          return { content: [{ type: 'text', text: JSON.stringify(files) }] };
        } catch (e: any) {
          return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
        }
      }

      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }
  } catch (err: any) {
    return { content: [{ type: 'text', text: `Exception calling tool ${name}: ${err.message}` }], isError: true };
  }
});

// Setup Express app to listen on SSE
const app = express();
app.use(cors());
app.use(express.json());

let sseTransport: SSEServerTransport | null = null;

app.get('/sse', async (req, res) => {
  console.log('🔌 Client requested SSE transport connection...');
  try {
    if (sseTransport) {
      await sseTransport.close();
      sseTransport = null;
    }
    await server.close();
  } catch (err) {
    // Ignore inactive connection close errors
  }

  // SSEServerTransport receives:
  // 1. Endpoint path to route messages back (POST endpoint)
  // 2. HTTP response object to establish the EventStream stream
  sseTransport = new SSEServerTransport('/message', res);
  server.connect(sseTransport).then(() => {
    console.log('✅ SSE Transport connection established.');
  }).catch((err) => {
    console.error('Failed to establish SSE transport connection:', err);
    if (!res.headersSent) {
      res.status(500).send(`Failed to establish connection: ${err.message}`);
    }
  });
});

app.post('/message', async (req, res) => {
  if (sseTransport) {
    try {
      await sseTransport.handlePostMessage(req, res, req.body);
    } catch (err: any) {
      if (!res.headersSent) {
        res.status(500).send(err.message);
      }
    }
  } else {
    if (!res.headersSent) {
      res.status(400).send('No active SSE transport connection');
    }
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Domo MCP SSE Server is running at http://localhost:${PORT}`);
  console.log(`- Connection Stream endpoint: http://localhost:${PORT}/sse`);
  console.log(`- Connection Messages endpoint: http://localhost:${PORT}/message`);
});
