import { useState, useCallback, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AutoPilotContext } from './AutoPilotContext';
import type { Mission, MissionLog, PermissionLevel, ExecutionContext, UploadedFile } from './types';
import { skillsRegistry } from './skillsRegistry';
import { aiService } from '../../utils/aiService';
import { localMemory } from '../../utils/localMemory';
import { mcpClient } from '../../utils/mcpClient';

function extractJson(text: string): any {
  const startCurly = text.indexOf('{');
  const startSquare = text.indexOf('[');
  
  let start = -1;
  let end = -1;
  let isArray = false;

  if (startCurly !== -1 && (startSquare === -1 || startCurly < startSquare)) {
    start = startCurly;
    end = text.lastIndexOf('}');
    isArray = false;
  } else if (startSquare !== -1) {
    start = startSquare;
    end = text.lastIndexOf(']');
    isArray = true;
  }

  if (start === -1) {
    throw new Error('No JSON brackets found in response');
  }

  let jsonContent = '';
  if (end === -1 || end < start) {
    jsonContent = text.slice(start) + (isArray ? ']' : '}');
  } else {
    jsonContent = text.slice(start, end + 1);
  }

  try {
    return JSON.parse(jsonContent);
  } catch (err) {
    try {
      const cleaned = jsonContent
        .replace(/,\s*([\]}])/g, '$1') // trailing commas before ] or }
        .replace(/\\'/g, "'") // unescape single quotes
        .replace(/'/g, '"'); // replace single quotes with double quotes
      return JSON.parse(cleaned);
    } catch {
      throw err;
    }
  }
}

// AutoPilotContext is now imported from ./AutoPilotContext

export const AutoPilotProvider = ({ children }: { children: ReactNode }) => {
  const [mission, setMission] = useState<Mission | null>(null);
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>(2);
  const [selectedModel, setSelectedModel] = useState<string>('llama3.2');
  const [isFloatingVisible, setFloatingVisible] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [approvalRequest, setApprovalRequest] = useState<{ prompt: string; resolve: (approved: boolean) => void } | null>(null);
  const [mcpOnline, setMcpOnline] = useState<boolean>(mcpClient.isOnline());
  const [availableMcpTools, setAvailableMcpTools] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [inputGoal, setInputGoal] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [autoApproveLevel3, setAutoApproveLevel3] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<any>(null);
  const wasVoiceActivatedRef = useRef<boolean>(false);
  const inputGoalRef = useRef(inputGoal);
  inputGoalRef.current = inputGoal;

  const missionRef = useRef<Mission | null>(null);
  missionRef.current = mission;
  const permissionLevelRef = useRef<PermissionLevel>(permissionLevel);
  permissionLevelRef.current = permissionLevel;
  const selectedModelRef = useRef<string>(selectedModel);
  selectedModelRef.current = selectedModel;
  const voiceEnabledRef = useRef<boolean>(voiceEnabled);
  voiceEnabledRef.current = voiceEnabled;
  const uploadedFilesRef = useRef<UploadedFile[]>(uploadedFiles);
  uploadedFilesRef.current = uploadedFiles;
  const autoApproveLevel3Ref = useRef<boolean>(autoApproveLevel3);
  autoApproveLevel3Ref.current = autoApproveLevel3;
  const [systemInfo, setSystemInfo] = useState<any | null>(null);
  const systemInfoRef = useRef<any | null>(null);
  systemInfoRef.current = systemInfo;

  const fetchSystemInfo = useCallback(async () => {
    if (mcpClient.isOnline()) {
      try {
        const res = await mcpClient.callTool('get_system_info', {});
        const parsed = JSON.parse(res.content?.[0]?.text || '{}');
        setSystemInfo(parsed);
      } catch (err) {
        console.warn('Could not fetch system info:', err);
      }
    }
  }, []);

  useEffect(() => {
    const handleStatusChange = (online: boolean) => {
      setMcpOnline(online);
      setAvailableMcpTools(mcpClient.getTools().map(t => t.name));
      if (online) {
        fetchSystemInfo();
      }
    };
    mcpClient.addStatusListener(handleStatusChange);
    if (mcpClient.isOnline()) {
      fetchSystemInfo();
    }
    return () => mcpClient.removeStatusListener(handleStatusChange);
  }, [fetchSystemInfo]);

  const syncMcp = async () => {
    const connected = await mcpClient.connect();
    setMcpOnline(connected);
    setAvailableMcpTools(mcpClient.getTools().map(t => t.name));
    if (connected) {
      await fetchSystemInfo();
    }
    return connected;
  };

  const clearMission = () => {
    setMission(null);
  };

  const log = useCallback((message: string, type: MissionLog['type'] = 'info', details?: string) => {
    setMission(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        logs: [...prev.logs, {
          id: Math.random().toString(),
          timestamp: Date.now(),
          type,
          message,
          details
        }]
      };
    });
  }, []);

  const addUploadedFile = useCallback((file: UploadedFile) => {
    setUploadedFiles(prev => {
      const filtered = prev.filter(f => f.name !== file.name);
      return [...filtered, file];
    });
    log(`File uploaded to session: "${file.name}"`, 'info');
  }, [log]);

  const removeUploadedFile = useCallback((name: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== name));
    log(`File removed from session: "${name}"`, 'info');
  }, [log]);

  const requestApproval = useCallback((prompt: string): Promise<boolean> => {
    if (autoApproveLevel3Ref.current) {
      log(`[Auto-Approve] Automatically approved request: "${prompt}"`, 'info');
      return Promise.resolve(true);
    }
    return new Promise((resolve) => {
      setMission(prev => prev ? { ...prev, status: 'waiting_approval' } : prev);
      setFloatingVisible(true);
      setApprovalRequest({ prompt, resolve: (approved: boolean) => {
        setApprovalRequest(null);
        setMission(prev => prev ? { ...prev, status: 'running' } : prev);
        resolve(approved);
      }});
    });
  }, []);

  const addArtifact = useCallback((name: string, content: string, type: string) => {
    setMission(prev => {
      if (!prev) return prev;
      const newArtifact = {
        id: Math.random().toString(),
        name,
        content,
        type,
        timestamp: Date.now()
      };
      return {
        ...prev,
        artifacts: [...(prev.artifacts || []), newArtifact]
      };
    });
    log(`Generated artifact: "${name}"`, 'success');
  }, [log]);

  const startMission = async (goal: string) => {
    const activeMission = missionRef.current;
    
    // Guard against concurrent execution
    if (activeMission && (activeMission.status === 'planning' || activeMission.status === 'running' || activeMission.status === 'waiting_approval')) {
      console.warn('⚠️ Mission already in progress. Ignoring duplicate trigger.');
      return;
    }
    
    // Check if this is a follow-up conversation or a new mission
    const isFollowUp = activeMission !== null && 
      (activeMission.status === 'completed' || activeMission.status === 'failed' || activeMission.status === 'idle');

    let previousSteps = isFollowUp ? activeMission.steps : [];
    let previousLogs = isFollowUp ? activeMission.logs : [];

    const updatedLogs = [
      ...previousLogs,
      {
        id: Math.random().toString(),
        timestamp: Date.now(),
        type: 'user' as const,
        message: goal
      }
    ];

    if (!isFollowUp) {
      const newMission: Mission = {
        id: Date.now().toString(),
        goal,
        status: 'planning',
        startTime: Date.now(),
        logs: updatedLogs,
        currentStepIndex: 0,
        steps: [],
        artifacts: []
      };
      setMission(newMission);
    } else {
      setMission(prev => prev ? {
        ...prev,
        goal,
        status: 'planning',
        logs: updatedLogs,
        currentStepIndex: previousSteps.length
      } : prev);
    }

    setFloatingVisible(true);
    log(`Starting workflow execution for: "${goal}"`, 'info');
    localMemory.logActivity('User Query', 'Chat', goal);

    try {
      log('Analyzing request and creating execution plan...', 'reasoning');
      
      const allowedSkills = Object.values(skillsRegistry)
        .map(skill => `${skill.id} (${skill.name}) [Requires Level ${skill.level}]: ${skill.description}`);

      const memoryContext = localMemory.getActivityContextString();
      const filesContext = uploadedFilesRef.current.length > 0
        ? `[USER-UPLOADED FILES IN CURRENT SESSION]
The user has uploaded the following files to the session. You can analyze them, read them, or query them:
${uploadedFilesRef.current.map(f => `- ${f.name} (type: ${f.type}, size: ${f.size} bytes)`).join('\n')}

CRITICAL: If the user asks to analyze an uploaded image, you MUST use the 'analyze_uploaded_image' skill. If they ask to read a text/JSON/CSV file, you MUST use the 'read_uploaded_file' skill.`
        : '';

      const systemInfoContext = systemInfoRef.current
        ? `[CURRENT HOST MACHINE ENVIRONMENT]
Operating System: ${systemInfoRef.current.platform} (${systemInfoRef.current.osRelease})
Architecture: ${systemInfoRef.current.arch}
Active Shell: ${systemInfoRef.current.shell}
Host Name: ${systemInfoRef.current.hostname}
Current Logged-in User: ${systemInfoRef.current.username}
Home Directory: ${systemInfoRef.current.homeDir}
Hardware Specs: ${systemInfoRef.current.cpuCount} Core CPU (${systemInfoRef.current.cpuModel}), ${systemInfoRef.current.totalMemoryGB} GB RAM`
        : '';

      let prompt = '';
      if (!isFollowUp) {
        prompt = `You are the Auto-Pilot Planner. Break down the following goal into a JSON array of sequential steps.
Goal: "${goal}"

Available Skills (Current User Permission Level is Level ${permissionLevelRef.current}): 
${allowedSkills.join('\n')}

${memoryContext}

${systemInfoContext}

${filesContext}

CRITICAL PLANNING CONSTRAINTS: 
- You MUST only use the skills listed above. Do not invent skills.
- You are fully allowed and encouraged to use skills that require a higher permission level than the current level (e.g. Level 3 terminal command or OS control) if they are needed to accomplish the goal. The application will automatically prompt the user for permission elevation at runtime before execution.
- To open external web pages, search engines, or generic internet links (e.g. GitHub, YouTube, Google, Facebook), you MUST use the 'open_web_link' skill. Do NOT use the 'open_domo_tool' skill for external links.
- Only use the 'open_domo_tool' skill to open native DomoDomo application features (like 'about', 'docs', or specific tools listed in its ID description).
- The User Activity History is already fully available to you in the prompt context. Do NOT generate steps to "read local files", "load history", or "access user actions" to read this history.
- Do NOT use the 'read_uploaded_file' or 'analyze_uploaded_image' skills unless the user has explicitly uploaded a file/image and you are querying its content.
- If the user's request is simple navigation (e.g. "go to about page", "open pdf merger"), you ONLY need to generate EXACTLY ONE step using the 'open_domo_tool' skill. Do NOT follow it up with redundant UI interactions or clicking links.
- If the user's request is unclear, vague, or contains typos for tool names (e.g. "open standard tool", "go to abotu"), you MUST use the 'chat_reply' skill to ask for clarification and recommend potential matching tools (e.g. "I couldn't find a page matching 'abotu'. Did you mean 'about' or 'auto-pilot'?").
- If the goal is a casual greeting (like "hello", "how are you") or conversational chat, you MUST output EXACTLY ONE step using 'chat_reply'.
- Respond ONLY with a valid JSON array. Do not include markdown formatting or explanations.

JSON Output Example:
[
  { "description": "Step 1 description", "skillId": "skill_name" }
]`;
      } else {
        prompt = `You are the Auto-Pilot Planner operating in ongoing conversational mode.
Previous User Goal: "${activeMission?.goal}"
Previous Completed Steps:
${previousSteps.map(s => `- ${s.description} (status: ${s.status})`).join('\n')}

We are continuing the conversation.
New User Follow-up Request: "${goal}"

Available Skills (Current User Permission Level is Level ${permissionLevelRef.current}): 
${allowedSkills.join('\n')}

${systemInfoContext}

${filesContext}

CRITICAL PLANNING CONSTRAINTS:
- You MUST only use the skills listed above. Do not invent skills.
- You are fully allowed and encouraged to use skills that require a higher permission level than the current level (e.g. Level 3 terminal command or OS control) if they are needed to accomplish the goal. The application will automatically prompt the user for permission elevation at runtime before execution.
- To open external web pages, search engines, or generic internet links (e.g. GitHub, YouTube, Google, Facebook), you MUST use the 'open_web_link' skill. Do NOT use the 'open_domo_tool' skill for external links.
- Only use the 'open_domo_tool' skill to open native DomoDomo application features (like 'about', 'docs', or specific tools listed in its ID description).
- The User Activity History is already fully available to you in the prompt context. Do NOT generate steps to "read local files", "load history", or "access user actions" to read this history.
- Do NOT use the 'read_uploaded_file' or 'analyze_uploaded_image' skills unless the user has explicitly uploaded a file/image and you are querying its content.
- If the user's request is simple navigation (e.g. "go to about page", "open pdf merger"), you ONLY need to generate EXACTLY ONE step using the 'open_domo_tool' skill. Do NOT follow it up with redundant UI interactions or clicking links.
- If the user's request is unclear, vague, or contains typos for tool names (e.g. "open standard tool", "go to abotu"), you MUST use the 'chat_reply' skill to ask for clarification and recommend potential matching tools (e.g. "I couldn't find a page matching 'abotu'. Did you mean 'about' or 'auto-pilot'?").
- Please generate a JSON array of NEW steps to satisfy the follow-up request. Do not repeat previous completed steps. Output only the new steps required.
- Respond ONLY with a valid JSON array. Do not include markdown formatting or explanations.

JSON Output Example:
[
  { "description": "Answer user follow-up", "skillId": "chat_reply" }
]`;
      }

      const planJson = await aiService.generateText(prompt, 800, undefined, selectedModelRef.current, {
        systemPrompt: 'You are a task planner. Output only JSON.',
        temperature: 0.1
      });

      let parsedSteps: any[] = [];
      try {
        parsedSteps = extractJson(planJson);
      } catch (e: any) {
        log(`Failed to parse planner output. Error: ${e.message}. Output: "${planJson.slice(0, 100)}..."`, 'error');
        parsedSteps = [{ description: 'Attempt fulfillment', skillId: 'browser_search' }];
      }

      const newSteps = parsedSteps.map((s: any, i: number) => ({
        id: `step_${previousSteps.length + i}`,
        description: s.description,
        skillId: s.skillId,
        status: 'pending' as const
      }));

      const mergedSteps = [...previousSteps, ...newSteps];
      setMission(prev => prev ? { ...prev, status: 'running', steps: mergedSteps } : prev);
      log(`Execution plan updated with ${newSteps.length} new steps.`, 'success');

      const startIdx = previousSteps.length;
      for (let i = startIdx; i < mergedSteps.length; i++) {
        if (missionRef.current?.status === 'paused' || missionRef.current?.status === 'failed') break;

        setMission(prev => prev ? { ...prev, currentStepIndex: i } : prev);
        const step = mergedSteps[i];
        log(`Executing Step ${i + 1}: ${step.description}`, 'action');
        
        const skill = step.skillId ? skillsRegistry[step.skillId] : null;
        if (!skill) {
          log(`Skill ${step.skillId} not found or not allowed in current level. Skipping.`, 'error');
          continue;
        }

        if (skill.level > permissionLevelRef.current) {
          const approved = await requestApproval(`Step requires ${skill.name} (Level ${skill.level}). Allow?`);
          if (!approved) {
            log(`User denied permission for ${skill.name}.`, 'error');
            setMission(prev => prev ? { ...prev, status: 'failed', endTime: Date.now() } : prev);
            return;
          }
        }

        try {
          const ctx: ExecutionContext = { 
            log, 
            requestApproval, 
            addArtifact, 
            selectedModel: selectedModelRef.current,
            uploadedFiles: uploadedFilesRef.current
          };
          
          const argsPrompt = `You are a helper that extracts arguments. Your task is to output a JSON object containing arguments matching the parameters for the skill "${skill.name}".

Step to execute: "${step.description}"
Goal Context: "${goal}"

Skill Parameters definition (name: description):
${Object.entries(skill.parameters).map(([key, desc]) => `- ${key}: ${desc}`).join('\n')}

CRITICAL:
- You must output ONLY a valid JSON object containing the extracted argument values.
- Do NOT output any explanation, markdown wraps, or conversational text.
- Match parameter names exactly.

JSON Output Example:
{
  ${Object.keys(skill.parameters).map(k => `"${k}": "value"`).join(',\n  ')}
}`;

          const argsJson = await aiService.generateText(argsPrompt, 1000, undefined, selectedModelRef.current, {
            systemPrompt: 'You are an argument generator. Output only JSON.',
            temperature: 0.1
          });

          let args = {};
          try { 
            args = extractJson(argsJson); 
          } catch (e: any) { 
            log(`Failed to parse arguments JSON. Error: ${e.message}. Output: "${argsJson.slice(0, 100)}..."`, 'error');
          }

          await skill.execute(args, ctx);
          
          setMission(prev => {
            if (!prev) return prev;
            const updatedSteps = [...prev.steps];
            if (updatedSteps[i]) {
              updatedSteps[i] = { ...updatedSteps[i], status: 'completed' };
            }
            return { ...prev, steps: updatedSteps };
          });
          
          log(`Step ${i + 1} completed successfully.`, 'success');
        } catch (err: any) {
          setMission(prev => {
            if (!prev) return prev;
            const updatedSteps = [...prev.steps];
            if (updatedSteps[i]) {
              updatedSteps[i] = { ...updatedSteps[i], status: 'failed' };
            }
            return { ...prev, steps: updatedSteps, status: 'failed', endTime: Date.now() };
          });
          log(`Step failed: ${err.message}`, 'error');
          return;
        }
      }

      // Final conversational summary
      log('Generating final summary...', 'reasoning');
      try {
        const summaryPrompt = `You are a conversational coding agent. The user's goal was: "${goal}".
You just successfully executed these steps:
${newSteps.map(s => `- ${s.description}`).join('\n')}

Write a very brief, friendly 1-2 sentence completion message to the user as if you are their personal AI assistant. DO NOT use markdown code blocks or JSON. Just plain text.`;
        
        const summaryResponse = await aiService.generateText(summaryPrompt, 200, undefined, selectedModelRef.current, {
          systemPrompt: 'You are a helpful AI assistant.',
          temperature: 0.7
        });
        
        const finalMessage = summaryResponse.trim();
        log(finalMessage, 'info');
        localMemory.logActivity('AI Response', 'Chat', finalMessage);

        if (voiceEnabledRef.current) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(finalMessage);
          
          let voices = window.speechSynthesis.getVoices();
          let preferred = voices.find(v => v.name === 'Google US English') || 
                          voices.find(v => v.name === 'Samantha') ||
                          voices.find(v => v.lang === 'en-US') || 
                          voices[0];
                          
          if (preferred) utterance.voice = preferred;
          utterance.rate = 1.05;
          
          // Restart microphone listening when the agent finishes speaking
          utterance.onend = () => {
            if (wasVoiceActivatedRef.current) {
              toggleListen();
            }
          };
          
          window.speechSynthesis.speak(utterance);
        }
        
      } catch (e) {
        log('Mission completed successfully.', 'success');
      }

      setMission(prev => prev ? { ...prev, status: 'completed', endTime: Date.now() } : prev);
      
      // If speech output is disabled but voice lock is active, restart mic immediately
      if (wasVoiceActivatedRef.current && !voiceEnabledRef.current) {
        setTimeout(() => {
          toggleListen();
        }, 500);
      }
    } catch (err: any) {
      log(`Mission failed: ${err.message}`, 'error');
      setMission(prev => prev ? { ...prev, status: 'failed', endTime: Date.now() } : prev);
      
      // Restart mic on failure to allow conversational debugging
      if (wasVoiceActivatedRef.current) {
        setTimeout(() => {
          toggleListen();
        }, 800);
      }
    }
  };

  const toggleListen = useCallback(() => {
    if (isListening) {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      recognitionRef.current?.stop();
      setIsListening(false);
      wasVoiceActivatedRef.current = false; // User manually clicked stop
      setTimeout(() => {
        const goal = inputGoalRef.current.trim();
        if (goal) {
          setInputGoal('');
          startMission(goal);
        }
      }, 100);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    // Set voice activated flag to true
    wasVoiceActivatedRef.current = true;

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onstart = () => setIsListening(true);
    
    rec.onresult = (e: any) => {
      // Clear any active silence timeout when new speech results are received
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }

      let final = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          final += e.results[i][0].transcript + ' ';
        }
      }
      if (final) {
        setInputGoal(prev => {
          const base = prev.trim();
          return base ? `${base} ${final.trim()}` : final.trim();
        });
      }

      // Schedule a 2.5-second silence timeout to auto-submit
      silenceTimeoutRef.current = setTimeout(() => {
        rec.stop();
        setIsListening(false);
        setTimeout(() => {
          const goal = inputGoalRef.current.trim();
          if (goal) {
            setInputGoal('');
            startMission(goal);
          }
        }, 100);
      }, 2500);
    };

    rec.onend = () => {
      setIsListening(false);
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    };

    rec.onerror = (e: any) => {
      console.error('Speech error:', e);
      setIsListening(false);
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    };

    recognitionRef.current = rec;
    rec.start();
  }, [isListening, startMission]);

  const pauseMission = () => setMission(prev => prev ? { ...prev, status: 'paused' } : prev);
  const resumeMission = () => setMission(prev => prev ? { ...prev, status: 'running' } : prev);

  return (
    <AutoPilotContext.Provider value={{
      mission,
      permissionLevel,
      setPermissionLevel,
      selectedModel,
      setSelectedModel,
      approvalRequest,
      startMission,
      pauseMission,
      resumeMission,
      log,
      isFloatingVisible,
      setFloatingVisible,
      voiceEnabled,
      setVoiceEnabled,
      mcpOnline,
      availableMcpTools,
      syncMcp,
      clearMission,
      uploadedFiles,
      addUploadedFile,
      removeUploadedFile,
      inputGoal,
      setInputGoal,
      isListening,
      toggleListen,
      autoApproveLevel3,
      setAutoApproveLevel3
    }}>
      {children}
    </AutoPilotContext.Provider>
  );
};

// useAutoPilotEngine is now imported from ./AutoPilotContext

