import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { exec, spawn } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// Root path configuration (default to domodomo workspace root)
const WORKSPACE_ROOT = path.resolve('../');

// Helper to resolve Ollama models folder path — tries all known locations
function getOllamaModelsPath(customPath?: string): { resolved: string; tried: string[] } {
  const tried: string[] = [];

  // 1. Custom path provided by user
  if (customPath && customPath.trim()) {
    const trimmed = customPath.trim();
    tried.push(trimmed);
    if (fs.existsSync(trimmed)) {
      return { resolved: trimmed, tried };
    }
    // If custom path was provided but doesn't exist, still add manifests check
    const withManifests = path.join(trimmed, 'manifests');
    if (fs.existsSync(withManifests)) {
      return { resolved: trimmed, tried };
    }
  }

  // 2. OLLAMA_MODELS environment variable
  if (process.env.OLLAMA_MODELS) {
    tried.push(process.env.OLLAMA_MODELS);
    if (fs.existsSync(process.env.OLLAMA_MODELS)) {
      return { resolved: process.env.OLLAMA_MODELS, tried };
    }
  }

  const home = process.env.USERPROFILE || process.env.HOME || '';
  const localAppData = process.env.LOCALAPPDATA || '';
  const appData = process.env.APPDATA || '';

  // Build candidate paths to try (in priority order)
  const candidates: string[] = [];

  if (process.platform === 'win32') {
    // Most common Windows Ollama paths
    if (home) {
      candidates.push(path.join(home, '.ollama', 'models'));
    }
    if (localAppData) {
      candidates.push(path.join(localAppData, 'Ollama', 'models'));
      candidates.push(path.join(localAppData, 'ollama', 'models'));
    }
    if (appData) {
      candidates.push(path.join(appData, 'Ollama', 'models'));
    }
    // Common user paths
    candidates.push('C:\\Users\\Arron\\.ollama\\models');
    candidates.push('C:\\.ollama\\models');
  } else if (process.platform === 'darwin') {
    if (home) {
      candidates.push(path.join(home, '.ollama', 'models'));
    }
    candidates.push('/usr/local/share/ollama/.ollama/models');
  } else {
    candidates.push('/usr/share/ollama/.ollama/models');
    if (home) {
      candidates.push(path.join(home, '.ollama', 'models'));
    }
  }

  for (const candidate of candidates) {
    tried.push(candidate);
    if (fs.existsSync(candidate)) {
      return { resolved: candidate, tried };
    }
  }

  // Return best guess even if it doesn't exist yet
  const fallback = candidates[0] || path.join(home, '.ollama', 'models');
  return { resolved: fallback, tried };
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
        description: 'Read the contents of a file on the local machine (absolute paths supported).',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Relative or absolute path of the file to read' },
          },
          required: ['path'],
        },
      },
      {
        name: 'write_file',
        description: 'Create or overwrite a file on the local machine (absolute paths supported).',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Relative or absolute path of the target file' },
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
        description: 'List all files and subdirectories recursively in a folder (defaults to workspace root, absolute paths supported).',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Optional relative or absolute directory path to list' },
          },
        },
      },
      {
        name: 'search_files',
        description: 'Search recursively for files matching a query term on the machine.',
        inputSchema: {
          type: 'object',
          properties: {
            rootPath: { type: 'string', description: 'Optional absolute or relative path to search from' },
            query: { type: 'string', description: 'Query term to match in filenames' },
          },
          required: ['query'],
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
      {
        name: 'pull_model_direct',
        description: 'Pull an Ollama model directly into a custom path (e.g. external HDD or USB) by overriding OLLAMA_MODELS env — bypasses laptop local storage entirely.',
        inputSchema: {
          type: 'object',
          properties: {
            modelTag: { type: 'string', description: 'The model tag to pull (e.g. llama3.2:3b)' },
            destinationPath: { type: 'string', description: 'Absolute path to download the model into (e.g. D:\\OllamaModels)' },
          },
          required: ['modelTag', 'destinationPath'],
        },
      },
      {
        name: 'simulate_keystroke',
        description: 'Simulate keyboard typing or shortcut key combination on the host OS.',
        inputSchema: {
          type: 'object',
          properties: {
            keys: { type: 'string', description: 'Keys to type (e.g. hello, or return, tab, enter)' },
            modifier: { type: 'string', description: 'Optional modifier key: cmd, ctrl, shift, alt' },
          },
          required: ['keys'],
        },
      },
      {
        name: 'simulate_click',
        description: 'Simulate a mouse movement and click event at specific screen coordinates.',
        inputSchema: {
          type: 'object',
          properties: {
            x: { type: 'number', description: 'Target X coordinate' },
            y: { type: 'number', description: 'Target Y coordinate' },
            type: { type: 'string', description: 'Click type: left, right, double' },
          },
          required: ['x', 'y'],
        },
      },
      {
        name: 'get_system_info',
        description: 'Scan and return operating system details, device architecture, memory, CPU metrics, and home path of the host computer.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_installed_apps',
        description: 'Retrieve a list of all user applications installed on macOS or Windows.',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'get_active_window',
        description: 'Identify the application name and window title currently in focus.',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'capture_screen',
        description: 'Takes a screenshot of the primary display. Returns base64 PNG data.',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'open_target',
        description: 'Opens an application, file, folder, setting panel, or web link.',
        inputSchema: {
          type: 'object',
          properties: {
            target: { type: 'string', description: 'The absolute file path, application name, web link, or protocol URI.' }
          },
          required: ['target']
        }
      },
      {
        name: 'clipboard_sync',
        description: 'Read from or write text to the system clipboard.',
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: ['read', 'write'], description: 'Read or write to clipboard.' },
            text: { type: 'string', description: 'The text value to copy (required if action is write).' }
          },
          required: ['action']
        }
      }
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
        const absPath = path.isAbsolute(relPath) ? relPath : path.resolve(WORKSPACE_ROOT, relPath);
        if (!fs.existsSync(absPath)) {
          return { content: [{ type: 'text', text: `Error: File not found at ${relPath}` }], isError: true };
        }
        const data = fs.readFileSync(absPath, 'utf-8');
        return { content: [{ type: 'text', text: data }] };
      }

      case 'write_file': {
        const relPath = (args as any).path;
        const content = (args as any).content;
        const absPath = path.isAbsolute(relPath) ? relPath : path.resolve(WORKSPACE_ROOT, relPath.replace(/^(\.\/|\/)+/, ''));
        
        // Ensure folder directory exists
        const dir = path.dirname(absPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(absPath, content, 'utf-8');
        return { content: [{ type: 'text', text: `Successfully wrote file: ${absPath}` }] };
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
        const absPath = path.isAbsolute(relPath) ? relPath : path.resolve(WORKSPACE_ROOT, relPath);

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
        const customPath = (args as any).path;
        const targetDir = customPath 
          ? (path.isAbsolute(customPath) ? customPath : path.resolve(WORKSPACE_ROOT, customPath))
          : WORKSPACE_ROOT;

        const getFiles = (dir: string, baseDir: string = ''): any[] => {
          const results: any[] = [];
          if (!fs.existsSync(dir)) return [];
          try {
            const list = fs.readdirSync(dir);
            list.forEach((file) => {
              const absPath = path.join(dir, file);
              const relPath = baseDir ? `${baseDir}/${file}` : file;
              
              // Skip common system / massive folders to prevent memory bloat
              if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.gemini' || file === 'build' || file === 'Library' || file === 'System') {
                return;
              }
              
              try {
                const stat = fs.statSync(absPath);
                if (stat && stat.isDirectory()) {
                  results.push({
                    name: file,
                    path: absPath, // Return absolute path to frontend for level 3 navigation
                    kind: 'directory',
                    children: getFiles(absPath, relPath)
                  });
                } else {
                  results.push({
                    name: file,
                    path: absPath,
                    kind: 'file'
                  });
                }
              } catch (err) {
                // skip unreadable files/symlinks
              }
            });
          } catch {}
          return results;
        };

        try {
          const files = getFiles(targetDir);
          return { content: [{ type: 'text', text: JSON.stringify(files) }] };
        } catch (e: any) {
          return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
        }
      }

      case 'search_files': {
        const query = ((args as any).query || '').trim();
        const rootPath = (args as any).rootPath;
        const targetDir = rootPath 
          ? (path.isAbsolute(rootPath) ? rootPath : path.resolve(WORKSPACE_ROOT, rootPath))
          : WORKSPACE_ROOT;

        if (!fs.existsSync(targetDir)) {
          return { content: [{ type: 'text', text: `Error: Search root folder not found at ${targetDir}` }], isError: true };
        }

        const maxResults = 100;
        const searchFilesRecursively = (dir: string): string[] => {
          let results: string[] = [];
          try {
            const list = fs.readdirSync(dir);
            for (const file of list) {
              if (results.length >= maxResults) break;
              const absPath = path.join(dir, file);
              try {
                const stat = fs.statSync(absPath);
                if (stat.isDirectory()) {
                  if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.gemini' || file === 'build' || file === 'Library' || file === 'System') {
                    continue;
                  }
                  results = results.concat(searchFilesRecursively(absPath));
                } else {
                  if (file.toLowerCase().includes(query.toLowerCase())) {
                    results.push(absPath);
                  }
                }
              } catch {}
            }
          } catch {}
          return results;
        };

        try {
          const matched = searchFilesRecursively(targetDir);
          return { content: [{ type: 'text', text: JSON.stringify(matched) }] };
        } catch (e: any) {
          return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
        }
      }

      case 'list_ollama_models': {
        const customPath = (args as any).ollamaPath;
        const { resolved: modelsPath, tried } = getOllamaModelsPath(customPath);
        const manifestsRoot = path.join(modelsPath, 'manifests');
        
        if (!fs.existsSync(manifestsRoot)) {
          // If manifests root doesn't exist, it means the folder is empty or new.
          // Return an empty list instead of throwing an error.
          return { content: [{ type: 'text', text: JSON.stringify({ modelsPath, models: [] }) }] };
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
        const { resolved: modelsPath, tried } = getOllamaModelsPath(customPath);
        
        const manifestsRoot = path.join(modelsPath, 'manifests');
        if (!fs.existsSync(manifestsRoot)) {
          return { content: [{ type: 'text', text: `Ollama manifests directory not found. Auto-searched:\n${tried.join('\n')}\n\nFix: In the Storage Path field at the top, click Browse... and select your Ollama models folder (usually C:\\Users\\${process.env.USERNAME || 'YourName'}\\.ollama\\models).` }], isError: true };
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
        const { resolved: modelsPath } = getOllamaModelsPath(customPath);
        
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

      case 'pull_model_direct': {
        const { modelTag, destinationPath } = args as any;
        if (!modelTag || !destinationPath) {
          return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: 'Missing modelTag or destinationPath.' }) }], isError: true };
        }

        // Create the destination directory
        try {
          fs.mkdirSync(destinationPath, { recursive: true });
        } catch (mkErr: any) {
          return { content: [{ type: 'text', text: JSON.stringify({ success: false, error: `Cannot create folder: ${mkErr.message}` }) }], isError: true };
        }

        // Find ollama executable — check common Windows install locations
        const ollamaExeCandidates = [
          'ollama', // If it's in PATH
          path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Ollama', 'ollama.exe'),
          path.join(process.env.LOCALAPPDATA || '', 'Programs', 'ollama', 'ollama.exe'),
          'C:\\Program Files\\Ollama\\ollama.exe',
          'C:\\Program Files (x86)\\Ollama\\ollama.exe',
          path.join(process.env.USERPROFILE || '', 'AppData', 'Local', 'Programs', 'Ollama', 'ollama.exe'),
        ];

        let ollamaExe = 'ollama';
        for (const candidate of ollamaExeCandidates) {
          if (candidate !== 'ollama' && fs.existsSync(candidate)) {
            ollamaExe = candidate;
            break;
          }
        }

        // Job ID for status polling
        const jobId = `pull_${Date.now()}`;
        const statusFile = path.join(destinationPath, `._domo_pull_status_${jobId}.json`);

        const writeStatus = (data: object) => {
          try { fs.writeFileSync(statusFile, JSON.stringify(data), 'utf-8'); } catch {}
        };

        writeStatus({ jobId, status: 'starting', model: modelTag, savedTo: destinationPath, progress: 0 });

        // Spawn ollama pull with OLLAMA_MODELS overridden — runs in background, writes progress to file
        const env = { ...process.env, OLLAMA_MODELS: destinationPath };
        const child = spawn(ollamaExe, ['pull', modelTag], { env, windowsHide: true });

        let lastOutput = '';
        child.stdout.on('data', (data: Buffer) => {
          lastOutput = data.toString();
          writeStatus({ jobId, status: 'downloading', model: modelTag, savedTo: destinationPath, lastLine: lastOutput.trim() });
        });
        child.stderr.on('data', (data: Buffer) => {
          lastOutput = data.toString();
          writeStatus({ jobId, status: 'downloading', model: modelTag, savedTo: destinationPath, lastLine: lastOutput.trim() });
        });
        child.on('close', (code: number) => {
          if (code === 0) {
            writeStatus({ jobId, status: 'done', success: true, model: modelTag, savedTo: destinationPath });
          } else {
            writeStatus({ jobId, status: 'error', success: false, model: modelTag, error: `ollama exited with code ${code}. Output: ${lastOutput.slice(-300)}` });
          }
          // Clean up status file after 5 minutes
          setTimeout(() => { try { fs.unlinkSync(statusFile); } catch {} }, 5 * 60 * 1000);
        });
        child.on('error', (err: Error) => {
          writeStatus({ jobId, status: 'error', success: false, model: modelTag, error: `Could not start ollama: ${err.message}. Ensure Ollama is installed.` });
        });

        // Return the job ID immediately — frontend polls check_pull_status
        return {
          content: [{ type: 'text', text: JSON.stringify({
            success: true,
            jobId,
            statusFile,
            model: modelTag,
            savedTo: destinationPath,
            ollamaExe,
            message: 'Download started in background. Poll check_pull_status for progress.'
          })}]
        };
      }

      case 'check_pull_status': {
        const { statusFile } = args as any;
        if (!statusFile || !fs.existsSync(statusFile)) {
          return { content: [{ type: 'text', text: JSON.stringify({ status: 'done', message: 'Status file not found — download may have completed.' }) }] };
        }
        try {
          const data = fs.readFileSync(statusFile, 'utf-8');
          return { content: [{ type: 'text', text: data }] };
        } catch (e: any) {
          return { content: [{ type: 'text', text: JSON.stringify({ status: 'error', error: e.message }) }] };
        }
      }

      case 'get_system_info': {
        const info = {
          platform: process.platform,
          arch: process.arch,
          osRelease: os.release(),
          hostname: os.hostname(),
          username: os.userInfo().username,
          homeDir: os.userInfo().homedir,
          cpuCount: os.cpus().length,
          cpuModel: os.cpus()[0]?.model || 'Unknown CPU',
          totalMemoryGB: Math.round(os.totalmem() / (1024 * 1024 * 1024)),
          freeMemoryGB: Math.round(os.freemem() / (1024 * 1024 * 1024)),
          shell: process.env.SHELL || (process.platform === 'win32' ? 'powershell.exe' : '/bin/sh'),
        };
        return {
          content: [{ type: 'text', text: JSON.stringify(info) }]
        };
      }

      case 'simulate_keystroke': {
        const keys = ((args as any).keys || '').replace(/"/g, '\\"');
        const modifier = (args as any).modifier; // cmd, ctrl, shift, alt

        return new Promise((resolve) => {
          let command = '';
          if (process.platform === 'darwin') {
            if (modifier) {
              const modKey = modifier === 'cmd' ? 'command down' : modifier === 'ctrl' ? 'control down' : modifier === 'shift' ? 'shift down' : 'option down';
              command = `osascript -e 'tell application "System Events" to keystroke "${keys}" using {${modKey}}'`;
            } else {
              command = `osascript -e 'tell application "System Events" to keystroke "${keys}"'`;
            }
          } else if (process.platform === 'win32') {
            let modifierChar = '';
            if (modifier) {
              if (modifier === 'shift') modifierChar = '+';
              else if (modifier === 'ctrl') modifierChar = '^';
              else if (modifier === 'alt') modifierChar = '%';
            }
            command = `powershell.exe -c "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('${modifierChar}${keys}')"`;
          } else {
            command = modifier 
              ? `xdotool key ${modifier}+${keys}`
              : `xdotool type "${keys}"`;
          }

          exec(command, (error, stdout, stderr) => {
            resolve({
              content: [{ type: 'text', text: error ? `Keystroke Error: ${stderr}` : 'Keystroke simulation triggered successfully.' }],
              isError: !!error,
            });
          });
        });
      }

      case 'simulate_click': {
        const x = Number((args as any).x);
        const y = Number((args as any).y);
        const clickType = (args as any).type || 'left';

        return new Promise((resolve) => {
          let command = '';
          if (process.platform === 'darwin') {
            const pyScript = [
              'import sys',
              'try:',
              '    from Quartz.CoreGraphics import CGEventCreateMouseEvent, CGEventPost, kCGEventMouseMoved, kCGEventLeftMouseDown, kCGEventLeftMouseUp, kCGEventRightMouseDown, kCGEventRightMouseUp, kCGMouseButtonLeft, kCGMouseButtonRight, kCGHIDEventTap',
              'except ImportError:',
              '    sys.exit(1)',
              `x = ${x}`,
              `y = ${y}`,
              'def click(x, y, button="left"):',
              '    move = CGEventCreateMouseEvent(None, kCGEventMouseMoved, (x, y), 0)',
              '    CGEventPost(kCGHIDEventTap, move)',
              '    if button == "left":',
              '        down = CGEventCreateMouseEvent(None, kCGEventLeftMouseDown, (x, y), kCGMouseButtonLeft)',
              '        up = CGEventCreateMouseEvent(None, kCGEventLeftMouseUp, (x, y), kCGMouseButtonLeft)',
              '    else:',
              '        down = CGEventCreateMouseEvent(None, kCGEventRightMouseDown, (x, y), kCGMouseButtonRight)',
              '        up = CGEventCreateMouseEvent(None, kCGEventRightMouseUp, (x, y), kCGMouseButtonRight)',
              '    CGEventPost(kCGHIDEventTap, down)',
              '    CGEventPost(kCGHIDEventTap, up)',
              `click(x, y, "${clickType}")`
            ].join('\n');
            command = `python3 -c '${pyScript}'`;

            exec(command, (error, stdout, stderr) => {
              if (error) {
                const fallbackCmd = `osascript -e 'tell application "System Events" to click at {${x}, ${y}}'`;
                exec(fallbackCmd, (fbError, fbStdout, fbStderr) => {
                  resolve({
                    content: [{ type: 'text', text: fbError ? `Click Error: ${fbStderr || fbError.message}` : 'Click simulation triggered successfully via AppleScript fallback.' }],
                    isError: !!fbError,
                  });
                });
              } else {
                resolve({
                  content: [{ type: 'text', text: 'Click simulation triggered successfully.' }],
                  isError: false,
                });
              }
            });
            return;
          } else if (process.platform === 'win32') {
            const psScript = [
              '$Signature = @\'',
              '[DllImport("user32.dll")]',
              'public static extern bool SetCursorPos(int X, int Y);',
              '[DllImport("user32.dll")]',
              'public static extern void mouse_event(int dwFlags, int dx, int dy, int cButtons, int dwExtraInfo);',
              '\'@;',
              '$User32 = Add-Type -MemberDefinition $Signature -Name "Win32Mouse" -Namespace "Win32" -PassThru;',
              `$User32::SetCursorPos(${x}, ${y});`,
              clickType === 'right' 
                ? '$User32::mouse_event(0x0008, 0, 0, 0, 0); $User32::mouse_event(0x0010, 0, 0, 0, 0);' 
                : clickType === 'double'
                  ? '$User32::mouse_event(0x0002, 0, 0, 0, 0); $User32::mouse_event(0x0004, 0, 0, 0, 0); $User32::mouse_event(0x0002, 0, 0, 0, 0); $User32::mouse_event(0x0004, 0, 0, 0, 0);'
                  : '$User32::mouse_event(0x0002, 0, 0, 0, 0); $User32::mouse_event(0x0004, 0, 0, 0, 0);'
            ].join(' ');
            const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
            command = `powershell.exe -NoProfile -WindowStyle Hidden -EncodedCommand ${encoded}`;
          } else {
            const btn = clickType === 'right' ? '3' : '1';
            command = clickType === 'double'
              ? `xdotool mousemove ${x} ${y} click --double 1`
              : `xdotool mousemove ${x} ${y} click ${btn}`;
          }

          exec(command, (error, stdout, stderr) => {
            resolve({
              content: [{ type: 'text', text: error ? `Click Error: ${stderr}` : 'Click simulation triggered successfully.' }],
              isError: !!error,
            });
          });
        });
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

      case 'get_installed_apps': {
        return new Promise((resolve) => {
          let command = '';
          if (process.platform === 'darwin') {
            command = `find /Applications /System/Applications -maxdepth 2 -name "*.app" 2>/dev/null | awk -F/ '{print $NF}' | sed 's/\\.app$//' | sort -u`;
          } else if (process.platform === 'win32') {
            command = `powershell.exe -NoProfile -Command "Get-StartApps | Select-Object Name | ConvertTo-Json"`;
          } else {
            command = `echo '["Terminal", "Firefox", "Files"]'`;
          }

          exec(command, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
            if (error) {
              resolve({ content: [{ type: 'text', text: `Error: ${stderr || error.message}` }], isError: true });
              return;
            }
            let appsList: string[] = [];
            try {
              if (process.platform === 'win32') {
                const parsed = JSON.parse(stdout);
                appsList = Array.isArray(parsed) ? parsed.map((a: any) => a.Name) : (parsed ? [parsed.Name] : []);
              } else {
                appsList = stdout.split('\n').map(l => l.trim()).filter(Boolean);
              }
            } catch {
              appsList = stdout.split('\n').map(l => l.trim()).filter(Boolean);
            }
            resolve({ content: [{ type: 'text', text: JSON.stringify(appsList) }] });
          });
        });
      }

      case 'get_active_window': {
        return new Promise((resolve) => {
          let command = '';
          if (process.platform === 'darwin') {
            command = `osascript -e 'tell application "System Events" to name of first application process whose frontmost is true'`;
          } else if (process.platform === 'win32') {
            command = `powershell.exe -NoProfile -Command "$code = @'\n[DllImport(\\"user32.dll\\")]\npublic static extern IntPtr GetForegroundWindow();\n[DllImport(\\"user32.dll\\")]\npublic static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder text, int count);\n'@; Add-Type -MemberDefinition $code -Name Win32 -Namespace Win32API -PassThru; $hwnd = [Win32API.Win32]::GetForegroundWindow(); $title = New-Object System.Text.StringBuilder 256; [Win32API.Win32]::GetWindowText($hwnd, $title, 256) | Out-Null; $title.ToString()"`;
          } else {
            command = `xdotool getactivewindow getwindowname 2>/dev/null || echo 'Unknown Window'`;
          }

          exec(command, (error, stdout) => {
            resolve({
              content: [{ type: 'text', text: error ? 'Unknown UI Window' : stdout.trim() }]
            });
          });
        });
      }

      case 'capture_screen': {
        return new Promise((resolve) => {
          const tmpPath = process.platform === 'win32'
            ? path.join(os.tmpdir(), 'screenshot.png')
            : '/tmp/screenshot.png';

          let command = '';
          if (process.platform === 'darwin') {
            command = `screencapture -x "${tmpPath}"`;
          } else if (process.platform === 'win32') {
            command = `powershell.exe -NoProfile -Command "Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; $screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds; $bmp = New-Object System.Drawing.Bitmap $screen.Width, $screen.Height; $graphics = [System.Drawing.Graphics]::FromImage($bmp); $graphics.CopyFromScreen(0, 0, 0, 0, $bmp.Size); $bmp.Save('${tmpPath}', [System.Drawing.Imaging.ImageFormat]::Png); $graphics.Dispose(); $bmp.Dispose();"`;
          } else {
            command = `scrot "${tmpPath}" 2>/dev/null || gnome-screenshot -f "${tmpPath}" 2>/dev/null`;
          }

          exec(command, (error) => {
            if (error) {
              resolve({ content: [{ type: 'text', text: `Failed to capture screen: ${error.message}` }], isError: true });
              return;
            }
            try {
              if (fs.existsSync(tmpPath)) {
                const base64Data = fs.readFileSync(tmpPath, { encoding: 'base64' });
                fs.unlinkSync(tmpPath);
                resolve({
                  content: [
                    { type: 'text', text: `data:image/png;base64,${base64Data}` }
                  ]
                });
              } else {
                resolve({ content: [{ type: 'text', text: 'Error: Screenshot file was not created.' }], isError: true });
              }
            } catch (err: any) {
              resolve({ content: [{ type: 'text', text: `Failed to read screenshot: ${err.message}` }], isError: true });
            }
          });
        });
      }

      case 'open_target': {
        let target = (args as any).target || '';
        return new Promise((resolve) => {
          let command = '';
          const normTarget = target.trim().toLowerCase();

          if (process.platform === 'darwin') {
            if (['settings', 'laptop settings', 'system settings', 'system preferences', 'preferences'].includes(normTarget)) {
              command = `open -a "System Settings" 2>/dev/null || open -a "System Preferences"`;
            } else {
              if (target.startsWith('/Applications/')) {
                try {
                  if (!fs.existsSync(target)) {
                    const systemPath = target.replace('/Applications/', '/System/Applications/');
                    if (fs.existsSync(systemPath)) {
                      target = systemPath;
                    }
                  }
                } catch (e) {
                  // Ignore check errors
                }
              }

              if (!target.includes('/') && !target.endsWith('.app') && !target.startsWith('http://') && !target.startsWith('https://')) {
                command = `open -a "${target}"`;
              } else {
                command = `open "${target}"`;
              }
            }
          } else if (process.platform === 'win32') {
            if (['settings', 'laptop settings', 'system settings', 'control panel'].includes(normTarget)) {
              command = `powershell.exe -NoProfile -Command "Start-Process ms-settings:"`;
            } else if (target.startsWith('ms-settings:') || target.startsWith('http://') || target.startsWith('https://')) {
              command = `powershell.exe -NoProfile -Command "Start-Process '${target}'"`;
            } else {
              command = `explorer.exe "${target}"`;
            }
          } else {
            if (['settings', 'laptop settings', 'system settings', 'control panel'].includes(normTarget)) {
              command = `gnome-control-center || xdg-open "settings:" || systemsettings`;
            } else {
              command = `xdg-open "${target}"`;
            }
          }

          exec(command, (error, stdout, stderr) => {
            resolve({
              content: [{
                type: 'text',
                text: error
                  ? `Failed to open "${target}": ${stderr || error.message}`
                  : `Successfully requested OS to open target: "${target}"`
              }],
              isError: !!error,
            });
          });
        });
      }

      case 'clipboard_sync': {
        const action = (args as any).action;
        const text = (args as any).text || '';

        return new Promise((resolve) => {
          let command = '';
          if (action === 'read') {
            if (process.platform === 'darwin') {
              command = `pbpaste`;
            } else if (process.platform === 'win32') {
              command = `powershell.exe -NoProfile -Command "Get-Clipboard"`;
            } else {
              command = `xclip -selection clipboard -o 2>/dev/null || xsel --clipboard --output 2>/dev/null || echo ''`;
            }
            exec(command, (error, stdout) => {
              resolve({ content: [{ type: 'text', text: error ? '' : stdout }] });
            });
          } else {
            if (process.platform === 'darwin') {
              const proc = spawn('pbcopy');
              proc.stdin.write(text);
              proc.stdin.end();
              proc.on('close', (code) => {
                resolve({
                  content: [{ type: 'text', text: code === 0 ? 'Clipboard updated successfully' : 'Failed to set clipboard' }],
                  isError: code !== 0
                });
              });
            } else if (process.platform === 'win32') {
              const escapedText = text.replace(/'/g, "''");
              command = `powershell.exe -NoProfile -Command "Set-Clipboard -Value '${escapedText}'"`;
              exec(command, (error) => {
                resolve({
                  content: [{ type: 'text', text: error ? 'Failed to set clipboard' : 'Clipboard updated successfully' }],
                  isError: !!error
                });
              });
            } else {
              const proc = spawn('xclip', ['-selection', 'clipboard']);
              proc.stdin.write(text);
              proc.stdin.end();
              proc.on('close', (code) => {
                resolve({
                  content: [{ type: 'text', text: code === 0 ? 'Clipboard updated successfully' : 'Failed to set clipboard' }],
                  isError: code !== 0
                });
              });
            }
          }
        });
      }

      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }
  } catch (err: any) {
    return { content: [{ type: 'text', text: `Exception calling tool ${name}: ${err.message}` }], isError: true };
  }
});

// ---------------------------------------------------------------------------
// Security configuration (C1 hardening)
//
// This server exposes powerful host tools (shell exec, file R/W, desktop RPA).
// It must NEVER be reachable from the LAN or from arbitrary websites. Three
// layers guard it:
//   1. Bind to loopback only (MCP_HOST, default 127.0.0.1).
//   2. Strict CORS allow-list (MCP_ALLOWED_ORIGINS) — blocks cross-origin
//      EventSource/fetch from drive-by websites.
//   3. Optional shared-secret token (MCP_AUTH_TOKEN) enforced on /sse + /message.
//      When set it is REQUIRED; when unset the server runs but warns loudly.
// ---------------------------------------------------------------------------
const MCP_HOST = process.env.MCP_HOST || '127.0.0.1';
const ALLOWED_ORIGINS = (process.env.MCP_ALLOWED_ORIGINS ||
  'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const AUTH_TOKEN = (process.env.MCP_AUTH_TOKEN || '').trim();

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    // Allow same-origin / non-browser callers (no Origin header) and the
    // explicit allow-list only. Everything else is rejected.
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin not allowed: ${origin}`));
    }
  },
  credentials: false,
};

// Extract a caller-supplied token from query (?token=, EventSource-friendly),
// Authorization: Bearer, or x-mcp-token header.
function extractToken(req: express.Request): string {
  const q = (req.query.token as string) || '';
  if (q) return q.trim();
  const header = req.header('authorization') || '';
  if (header.toLowerCase().startsWith('bearer ')) return header.slice(7).trim();
  return (req.header('x-mcp-token') || '').trim();
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!AUTH_TOKEN) return next(); // No token configured — see startup warning.
  if (extractToken(req) === AUTH_TOKEN) return next();
  res.status(401).json({ error: 'Unauthorized: missing or invalid MCP token' });
}

// Setup Express app to listen on SSE
const app = express();
app.use(cors(corsOptions));
app.use(express.json());

let sseTransport: SSEServerTransport | null = null;

app.get('/sse', requireAuth, async (req, res) => {
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

app.post('/message', requireAuth, async (req, res) => {
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

const PORT = Number(process.env.MCP_PORT) || 3001;
app.listen(PORT, MCP_HOST, () => {
  console.log(`🚀 Domo MCP SSE Server is running at http://${MCP_HOST}:${PORT}`);
  console.log(`- Connection Stream endpoint: http://${MCP_HOST}:${PORT}/sse`);
  console.log(`- Connection Messages endpoint: http://${MCP_HOST}:${PORT}/message`);
  console.log(`- CORS allow-list: ${ALLOWED_ORIGINS.join(', ')}`);
  if (AUTH_TOKEN) {
    console.log('🔒 Token auth ENABLED — clients must supply MCP_AUTH_TOKEN.');
  } else {
    console.warn(
      '⚠️  SECURITY: MCP_AUTH_TOKEN is not set. The server is bound to ' +
      `${MCP_HOST} and CORS-locked, but any local process on this machine can ` +
      'still reach it. Set MCP_AUTH_TOKEN (and domodomo_mcp_token in the app) ' +
      'to require a shared secret. See mcp-server/.env.example.'
    );
  }
});
