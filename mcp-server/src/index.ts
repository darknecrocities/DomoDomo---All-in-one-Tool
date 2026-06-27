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

// Helper to resolve Ollama models folder path
function getOllamaModelsPath(customPath?: string): string {
  if (customPath && fs.existsSync(customPath)) {
    return customPath;
  }
  if (process.env.OLLAMA_MODELS && fs.existsSync(process.env.OLLAMA_MODELS)) {
    return process.env.OLLAMA_MODELS;
  }
  const home = process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\Default';
  let defaultPath = '';
  if (process.platform === 'win32') {
    defaultPath = path.join(home, '.ollama', 'models');
  } else if (process.platform === 'darwin') {
    defaultPath = path.join(home, '.ollama', 'models');
  } else {
    defaultPath = '/usr/share/ollama/.ollama/models';
    if (!fs.existsSync(defaultPath)) {
      defaultPath = path.join(home, '.ollama', 'models');
    }
  }
  return defaultPath;
}

// Helper to recursively walk a directory
function getManifestsRecursively(dir: string, baseDir: string = ''): { relPath: string; absPath: string }[] {
  let results: { relPath: string; absPath: string }[] = [];
  if (!fs.existsSync(dir)) return [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const absPath = path.join(dir, file);
    const relPath = baseDir ? `${baseDir}/${file}` : file;
    try {
      const stat = fs.statSync(absPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getManifestsRecursively(absPath, relPath));
      } else {
        results.push({ relPath, absPath });
      }
    } catch {
      // ignore
    }
  });
  return results;
}

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
      {
        name: 'list_ollama_models',
        description: 'List local Ollama models found on disk (including registry, namespace, and manifest metadata).',
        inputSchema: {
          type: 'object',
          properties: {
            ollamaPath: { type: 'string', description: 'Optional custom path to Ollama models folder' },
          },
        },
      },
      {
        name: 'export_ollama_model',
        description: 'Export an Ollama model\'s manifest and SHA256 layer blobs to a target portable directory (like a USB drive or HDD path).',
        inputSchema: {
          type: 'object',
          properties: {
            modelName: { type: 'string', description: 'The name of the model to export (e.g. llama3.2)' },
            modelTag: { type: 'string', description: 'The tag of the model to export (e.g. 3b)' },
            destinationPath: { type: 'string', description: 'Absolute target path to save the exported files' },
            ollamaPath: { type: 'string', description: 'Optional custom path to local Ollama models folder' },
          },
          required: ['modelName', 'modelTag', 'destinationPath'],
        },
      },
      {
        name: 'import_ollama_model',
        description: 'Import an exported Ollama model from a portable directory back into the local Ollama models storage.',
        inputSchema: {
          type: 'object',
          properties: {
            sourceFolderPath: { type: 'string', description: 'Absolute source path of the exported model directory containing metadata.json, manifest, and blobs/' },
            ollamaPath: { type: 'string', description: 'Optional custom path to local Ollama models folder' },
          },
          required: ['sourceFolderPath'],
        },
      },
      {
        name: 'select_local_directory',
        description: 'Launch a native host OS dialog window to visually browse and select a local storage folder or external USB/HDD drive.',
        inputSchema: {
          type: 'object',
          properties: {},
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

      case 'list_ollama_models': {
        const customPath = (args as any).ollamaPath;
        const modelsPath = getOllamaModelsPath(customPath);
        const manifestsRoot = path.join(modelsPath, 'manifests');
        
        if (!fs.existsSync(manifestsRoot)) {
          return {
            content: [{ type: 'text', text: `Ollama manifests folder not found at: ${manifestsRoot}. Check your custom Ollama path.` }],
            isError: true
          };
        }

        const files = getManifestsRecursively(manifestsRoot);
        const models: any[] = [];

        files.forEach((file) => {
          const normalized = file.relPath.replace(/\\/g, '/');
          const parts = normalized.split('/');
          
          if (parts.length >= 4) {
            const registry = parts[0];
            const namespace = parts[1];
            const name = parts.slice(2, parts.length - 1).join('/');
            const tag = parts[parts.length - 1];

            let sizeBytes = 0;
            let layersCount = 0;
            try {
              const manifestContent = fs.readFileSync(file.absPath, 'utf-8');
              const manifest = JSON.parse(manifestContent);
              if (manifest.layers) {
                layersCount = manifest.layers.length;
                sizeBytes += manifest.layers.reduce((sum: number, l: any) => sum + (l.size || 0), 0);
              }
              if (manifest.config && manifest.config.size) {
                sizeBytes += manifest.config.size;
              }
            } catch (err) {
              // ignore
            }

            models.push({
              registry,
              namespace,
              name,
              tag,
              sizeBytes,
              layersCount,
              manifestPath: file.relPath
            });
          }
        });

        return { content: [{ type: 'text', text: JSON.stringify({ modelsPath, models }) }] };
      }

      case 'export_ollama_model': {
        const { modelName, modelTag, destinationPath } = args as any;
        const customPath = (args as any).ollamaPath;
        const modelsPath = getOllamaModelsPath(customPath);
        
        const manifestsRoot = path.join(modelsPath, 'manifests');
        if (!fs.existsSync(manifestsRoot)) {
          return { content: [{ type: 'text', text: `Ollama manifests directory not found.` }], isError: true };
        }

        const files = getManifestsRecursively(manifestsRoot);
        const targetManifest = files.find(file => {
          const normalized = file.relPath.replace(/\\/g, '/');
          return normalized.endsWith(`/${modelName}/${modelTag}`);
        });

        if (!targetManifest) {
          return { content: [{ type: 'text', text: `Model "${modelName}:${modelTag}" not found locally in Ollama manifests.` }], isError: true };
        }

        let manifest: any;
        try {
          manifest = JSON.parse(fs.readFileSync(targetManifest.absPath, 'utf-8'));
        } catch (err: any) {
          return { content: [{ type: 'text', text: `Failed to read manifest file: ${err.message}` }], isError: true };
        }

        const exportFolder = path.join(destinationPath, `${modelName.replace(/\//g, '_')}-${modelTag}`);
        const exportBlobsFolder = path.join(exportFolder, 'blobs');

        try {
          fs.mkdirSync(exportBlobsFolder, { recursive: true });
        } catch (err: any) {
          return { content: [{ type: 'text', text: `Failed to create export directory: ${err.message}` }], isError: true };
        }

        fs.copyFileSync(targetManifest.absPath, path.join(exportFolder, 'manifest'));

        const copiedBlobs: string[] = [];
        const missingBlobs: string[] = [];
        
        const digestsToCopy: string[] = [];
        if (manifest.config && manifest.config.digest) {
          digestsToCopy.push(manifest.config.digest);
        }
        if (manifest.layers) {
          manifest.layers.forEach((l: any) => {
            if (l.digest) digestsToCopy.push(l.digest);
          });
        }

        digestsToCopy.forEach((digest) => {
          const blobFile = digest.replace(':', '-');
          const srcBlobPath = path.join(modelsPath, 'blobs', blobFile);
          const destBlobPath = path.join(exportBlobsFolder, blobFile);

          if (fs.existsSync(srcBlobPath)) {
            fs.copyFileSync(srcBlobPath, destBlobPath);
            copiedBlobs.push(digest);
          } else {
            missingBlobs.push(digest);
          }
        });

        const metadata = {
          modelName,
          modelTag,
          originalManifestPath: targetManifest.relPath,
          exportedAt: new Date().toISOString(),
          platform: process.platform,
          digests: digestsToCopy
        };
        fs.writeFileSync(path.join(exportFolder, 'metadata.json'), JSON.stringify(metadata, null, 2), 'utf-8');

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: missingBlobs.length === 0,
              exportPath: exportFolder,
              copiedLayers: copiedBlobs.length,
              missingLayers: missingBlobs
            })
          }]
        };
      }

      case 'import_ollama_model': {
        const { sourceFolderPath } = args as any;
        const customPath = (args as any).ollamaPath;
        const modelsPath = getOllamaModelsPath(customPath);
        
        const metadataPath = path.join(sourceFolderPath, 'metadata.json');
        const manifestSrcPath = path.join(sourceFolderPath, 'manifest');
        const blobsSrcFolder = path.join(sourceFolderPath, 'blobs');

        if (!fs.existsSync(metadataPath) || !fs.existsSync(manifestSrcPath) || !fs.existsSync(blobsSrcFolder)) {
          return { content: [{ type: 'text', text: `Invalid source folder. Ensure metadata.json, manifest and blobs/ folder exist.` }], isError: true };
        }

        let metadata: any;
        try {
          metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        } catch (err: any) {
          return { content: [{ type: 'text', text: `Failed to read metadata.json: ${err.message}` }], isError: true };
        }

        const modelName = metadata.modelName;
        const modelTag = metadata.modelTag;
        const targetRelManifestPath = metadata.originalManifestPath || `registry.ollama.ai/library/${modelName}/${modelTag}`;
        
        const localBlobsFolder = path.join(modelsPath, 'blobs');
        const localManifestDest = path.join(modelsPath, 'manifests', targetRelManifestPath);

        try {
          fs.mkdirSync(localBlobsFolder, { recursive: true });
          fs.mkdirSync(path.dirname(localManifestDest), { recursive: true });
        } catch (err: any) {
          return { content: [{ type: 'text', text: `Failed to initialize local directories: ${err.message}` }], isError: true };
        }

        const copiedBlobs: string[] = [];
        const sourceBlobs = fs.readdirSync(blobsSrcFolder);

        sourceBlobs.forEach((blobFile) => {
          const srcBlob = path.join(blobsSrcFolder, blobFile);
          const destBlob = path.join(localBlobsFolder, blobFile);
          fs.copyFileSync(srcBlob, destBlob);
          copiedBlobs.push(blobFile);
        });

        fs.copyFileSync(manifestSrcPath, localManifestDest);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              model: `${modelName}:${modelTag}`,
              manifestPath: localManifestDest,
              importedBlobsCount: copiedBlobs.length
            })
          }]
        };
      }

      case 'select_local_directory': {
        return new Promise((resolve) => {
          let command = '';
          if (process.platform === 'win32') {
            // Build the PowerShell script as a plain string first
            const psScript = [
              'Add-Type -AssemblyName System.Windows.Forms;',
              '$dlg = New-Object System.Windows.Forms.FolderBrowserDialog;',
              '$dlg.ShowNewFolderButton = $true;',
              '$dlg.Description = "Select target folder or external USB/HDD drive";',
              '$owner = New-Object System.Windows.Forms.Form;',
              '$owner.TopMost = $true;',
              '$owner.ShowInTaskbar = $false;',
              '$owner.WindowState = [System.Windows.Forms.FormWindowState]::Minimized;',
              '$owner.Show();',
              '$owner.Hide();',
              'if ($dlg.ShowDialog($owner) -eq [System.Windows.Forms.DialogResult]::OK) {',
              '  Write-Output $dlg.SelectedPath;',
              '};',
              '$owner.Dispose();'
            ].join(' ');
            // Encode to UTF-16LE base64 so PowerShell -EncodedCommand accepts it cleanly
            const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
            command = `powershell.exe -NoProfile -WindowStyle Hidden -EncodedCommand ${encoded}`;
          } else if (process.platform === 'darwin') {
            command = `osascript -e 'POSIX path of (choose folder with prompt "Select target folder or external USB/HDD drive")'`;
          } else {
            command = `zenity --file-selection --directory --title="Select target folder or external USB/HDD drive"`;
          }

          exec(command, { timeout: 60000 }, (error, stdout, stderr) => {
            if (error) {
              resolve({ content: [{ type: 'text', text: '' }], isError: true });
            } else {
              const selectedPath = stdout.trim();
              resolve({ content: [{ type: 'text', text: selectedPath }] });
            }
          });
        });
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
