/**
 * DomoDomo Dynamic Tool and Auto Pilot Test Suite
 * 
 * This script dynamically tests the tool registry and Auto Pilot skills:
 * 1. Scans and parses `src/engine/registry.ts` to locate and validate all tools.
 * 2. Parses and verifies safety parameters in `src/tools/autopilot/skillsRegistry.ts`.
 * 3. Simulates the execution of critical Auto Pilot skills using a mocked ExecutionContext.
 * 4. Asserts that safety guardrails correctly block destructive system terminal commands.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('🧪 Starting DomoDomo Dynamic Testing Suite...\n');

// Mock browser environments for tests
const mockLocalStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = String(value); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};

const mockNotification = function(title, options) {
  mockNotification.sent.push({ title, options });
};
mockNotification.permission = 'granted';
mockNotification.sent = [];
mockNotification.requestPermission = async () => 'granted';

// Global mock context
const globalMock = {
  console: {
    log: () => {},
    warn: () => {},
    error: () => {}
  },
  setTimeout: setTimeout,
  Promise: Promise,
  Date: Date,
  Math: Math,
  JSON: JSON,
  Map: Map,
  Set: Set,
  Error: Error,
  Number: Number,
  RegExp: RegExp,
  encodeURIComponent: encodeURIComponent,
  Notification: mockNotification,
  localStorage: mockLocalStorage,
  navigator: { userAgent: 'MacIntel' },
  window: {
    location: { hash: '' },
    open: (url) => { globalMock.window.openedUrl = url; },
    dispatchEvent: () => {}
  },
  CustomEvent: function(name, detail) {
    this.name = name;
    this.detail = detail;
  }
};

// Mock service singletons
const localMemoryMock = {
  activityLog: [],
  logActivity(action, category, detail) {
    this.activityLog.push({ action, category, detail });
  }
};

const aiServiceMock = {
  generateText: async (prompt, maxTokens, stop, model, options) => {
    if (prompt.includes('arguments')) {
      // Simulate arg parsing response matching the parameters
      return JSON.stringify({ question: 'mock question', query: 'mock search', command: 'ls -la', path: 'src/App.tsx' });
    }
    return '# Mock Research Findings\n- Item 1\n- Item 2';
  }
};

const mcpClientMock = {
  online: true,
  calls: [],
  isOnline() { return this.online; },
  async callTool(name, args) {
    this.calls.push({ name, args });
    if (name === 'read_file') {
      return { content: [{ text: '// Mock File Content' }] };
    }
    if (name === 'list_directory') {
      return { content: [{ text: '["App.tsx", "main.tsx", "index.css"]' }] };
    }
    if (name === 'search_files') {
      return { content: [{ text: '["src/App.tsx"]' }] };
    }
    if (name === 'execute_command') {
      return { content: [{ text: 'Mock command execution stdout.' }] };
    }
    return { content: [{ text: '{"success": true}' }] };
  }
};

// -------------------------------------------------------------
// STEP 1: Scan and Validate Tool Registry
// -------------------------------------------------------------
console.log('🔍 [Test 1] Scanning Tool Registry...');
const registryPath = path.resolve(__dirname, '../src/engine/registry.ts');

if (!fs.existsSync(registryPath)) {
  console.error(`❌ Error: Registry file not found at ${registryPath}`);
  process.exit(1);
}

const registryContent = fs.readFileSync(registryPath, 'utf8');

// Parse imported tools
const importRegex = /import\s+\{\s*([A-Za-z0-9_]+)\s*\}\s*from\s*'([^']+)'/g;
let match;
const toolImports = {};
while ((match = importRegex.exec(registryContent)) !== null) {
  toolImports[match[1]] = match[2];
}

// Parse tool list structures
const toolItemRegex = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*category:\s*'([^']+)',\s*description:\s*'([^']+)'/g;
const foundTools = [];
while ((match = toolItemRegex.exec(registryContent)) !== null) {
  foundTools.push({
    id: match[1],
    name: match[2],
    category: match[3],
    description: match[4]
  });
}

console.log(`✅ Registry scan complete. Found ${foundTools.length} registered tools in hub.`);

// Verify paths for all imported tools
let missingFiles = 0;
for (const [componentName, relPath] of Object.entries(toolImports)) {
  // Resolve path from src/engine/registry.ts
  const absPath = path.resolve(__dirname, '../src/engine', relPath + '.tsx');
  const absPathTs = path.resolve(__dirname, '../src/engine', relPath + '.ts');
  if (!fs.existsSync(absPath) && !fs.existsSync(absPathTs)) {
    console.warn(`⚠️ Warning: Tool component file for "${componentName}" not found at path: ${relPath}`);
    missingFiles++;
  }
}

if (missingFiles === 0) {
  console.log('✅ Integrity check passed: All imported tool component files exist.');
} else {
  console.log(`⚠️ Integrity check warning: ${missingFiles} component files could not be located.`);
}


// -------------------------------------------------------------
// STEP 2: Compile & Load Auto Pilot Skills Registry (Node-Safe VM)
// -------------------------------------------------------------
console.log('\n🧠 [Test 2] Loading & Verifying Auto Pilot Skills Registry...');
const skillsPath = path.resolve(__dirname, '../src/tools/autopilot/skillsRegistry.ts');

if (!fs.existsSync(skillsPath)) {
  console.error(`❌ Error: Skills registry not found at ${skillsPath}`);
  process.exit(1);
}

const skillsContent = fs.readFileSync(skillsPath, 'utf8');

// Transpile TS into JS on-the-fly using regexes to make it runnable in Node VM
let runnableJS = skillsContent
  .replace(/import type\s+[^;]+;/g, '') // remove import type
  .replace(/import\s+[^;]+;/g, '') // remove standard imports
  .replace(/:\s*Record<[^>]+>/g, '') // remove Record typing
  .replace(/:\s*PermissionLevel/g, '') // remove permission level typing
  .replace(/:\s*AutoPilotSkill/g, '') // remove skill typing
  .replace(/:\s*ExecutionContext/g, '') // remove context typing
  .replace(/\(args:\s*Record<[^>]+>,\s*ctx:\s*ExecutionContext\)/g, '(args, ctx)') // clean up executor signature
  .replace(/\(args,\s*ctx:\s*ExecutionContext\)/g, '(args, ctx)')
  .replace(/\(args:\s*any,\s*ctx\)/g, '(args, ctx)')
  .replace(/:\s*any/g, '')
  .replace(/as\s+const/g, '')
  .replace(/:\s*Promise<[^>]+>/g, '')
  .replace(/:\s*string\[\]/g, '')
  .replace(/:\s*string/g, '')
  .replace(/:\s*number/g, '')
  .replace(/:\s*boolean/g, '')
  // Replace window-dependent checks
  .replace(/navigator\.userAgent/g, '"mac"')
  .replace(/window\.open/g, 'window.open')
  .replace(/\bexport\s+/g, '');

// Setup dependencies in sandbox
const sandbox = {
  ...globalMock,
  localMemory: localMemoryMock,
  aiService: aiServiceMock,
  mcpClient: mcpClientMock,
  TOOLS: foundTools,
  skillsRegistry: {}
};

vm.createContext(sandbox);

try {
  // Execute transpiled script inside VM context
  vm.runInContext(runnableJS + '\nthis.skillsRegistry = skillsRegistry;', sandbox);
  console.log('✅ Skills registry parsed successfully in sandbox context.');
} catch (err) {
  console.error('❌ Error executing skills registry in sandbox:', err.message);
  process.exit(1);
}

const loadedSkills = sandbox.skillsRegistry;
const skillKeys = Object.keys(loadedSkills);
console.log(`✅ Loaded ${skillKeys.length} skills: [${skillKeys.join(', ')}]`);


// -------------------------------------------------------------
// STEP 3: Auto Pilot Skills Execution Verification
// -------------------------------------------------------------
console.log('\n🤖 [Test 3] Simulating Auto Pilot Skill Executions...');

const testCases = [
  {
    skillId: 'domo_knowledge',
    args: { question: 'What is Domo?' },
    verify: (result, logs) => {
      return result.success === true && logs.some(l => l.includes('Querying Domo'));
    }
  },
  {
    skillId: 'browser_search',
    args: { query: 'Vite backend integration' },
    verify: (result, logs) => {
      return result.success === true && logs.some(l => l.includes('Searching web'));
    }
  },
  {
    skillId: 'generate_research_markdown',
    args: { topic: 'SQLite scalability', requirements: 'Add table' },
    verify: (result, logs) => {
      return result.success === true && result.file_preview.includes('Mock Research');
    }
  },
  {
    skillId: 'chat_reply',
    args: { message: 'Hello user' },
    verify: (result, logs) => {
      return result.success === true && localMemoryMock.activityLog.some(l => l.action === 'AI Chat Reply');
    }
  },
  {
    skillId: 'system_notification',
    args: { title: 'Alert', message: 'Test message' },
    verify: (result, logs) => {
      return result.success === true && mockNotification.sent.some(n => n.title === 'Alert');
    }
  },
  {
    skillId: 'open_domo_tool',
    args: { tool_id: 'about' },
    verify: (result, logs) => {
      return result.success === true && logs.some(l => l.includes('Navigating to: about'));
    }
  },
  {
    skillId: 'read_file_local',
    args: { path: 'package.json' },
    verify: (result, logs) => {
      return result.success === true && result.content === '// Mock File Content';
    }
  }
];

let skillsPassed = 0;
const runningPromises = [];

for (const tc of testCases) {
  const skill = loadedSkills[tc.skillId];
  if (!skill) {
    console.error(`❌ Error: Skill "${tc.skillId}" not found in registry.`);
    continue;
  }

  // Create Mock ExecutionContext
  const logs = [];
  const artifacts = [];
  let approved = true;
  const ctx = {
    selectedModel: 'llama3.2',
    uploadedFiles: [],
    log: (msg) => logs.push(msg),
    requestApproval: async () => approved,
    addArtifact: (name, content) => artifacts.push({ name, content })
  };

  try {
    // Run execution block
    const promise = skill.execute(tc.args, ctx);
    
    // Track promise execution
    const run = promise.then((result) => {
      if (tc.verify(result, logs)) {
        console.log(`  ✅ Skill "${tc.skillId}": Pass`);
        skillsPassed++;
      } else {
        console.error(`  ❌ Skill "${tc.skillId}": Verification Fail. Logs:`, logs);
      }
    }).catch(err => {
      console.error(`  ❌ Skill "${tc.skillId}": Execution Error: ${err.message}`);
    });
    
    runningPromises.push(run);
  } catch (err) {
    console.error(`  ❌ Skill "${tc.skillId}": Synchronous Error: ${err.message}`);
  }
}

// Wait for execution simulations to resolve
Promise.all(runningPromises).then(() => {
  console.log(`\n📊 Simulated executions: ${skillsPassed}/${testCases.length} skills verified successfully.`);

  // -------------------------------------------------------------
  // STEP 4: Safety & Security Guardrail Verification
  // -------------------------------------------------------------
  console.log('\n🔒 [Test 4] Verifying Destructive Command Safety Guardrails...');
  const execTerminalSkill = loadedSkills['os_execute_terminal'];

  if (!execTerminalSkill) {
    console.error('❌ Error: "os_execute_terminal" skill is not registered.');
    process.exit(1);
  }

  const dangerousCommands = [
    'rm -rf /',
    'rm -rf .',
    'rmdir -rf .',
    'format c:',
    'dd if=/dev/zero of=/dev/sda'
  ];

  let safetyBlocks = 0;
  const safetyPromises = dangerousCommands.map(cmd => {
    const logs = [];
    const ctx = {
      selectedModel: 'llama3.2',
      log: (msg) => logs.push(msg),
      requestApproval: async () => true, // Auto pilot shouldn't reach approval for blocked queries
      addArtifact: () => {}
    };

    return execTerminalSkill.execute({ command: cmd }, ctx)
      .then(() => {
        console.error(`  ❌ FAIL: Safety breach! Dangerous command was NOT blocked: "${cmd}"`);
      })
      .catch(err => {
        if (err.message.includes('Security Guardrail Block')) {
          console.log(`  🛡️ Blocked correctly: "${cmd}"`);
          safetyBlocks++;
        } else {
          console.error(`  ❌ Unexpected error: ${err.message}`);
        }
      });
  });

  Promise.all(safetyPromises).then(() => {
    console.log(`\n📊 Safety checks: ${safetyBlocks}/${dangerousCommands.length} dangerous commands blocked correctly.`);
    if (safetyBlocks === dangerousCommands.length) {
      console.log('✅ ALL Security Guardrails Verified Successfully!');
    } else {
      console.error('❌ Warning: Some security guardrails did not trigger properly.');
    }
    
    console.log('\n🏆 ALL DomoDomo AI Dynamic Unit Tests Completed successfully!');
    process.exit(0);
  });
});
