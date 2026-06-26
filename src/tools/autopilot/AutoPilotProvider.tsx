import { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Mission, MissionLog, PermissionLevel, ExecutionContext, AutoPilotContextType } from './types';
import { skillsRegistry } from './skillsRegistry';
import { aiService } from '../../utils/aiService';
import { localMemory } from '../../utils/localMemory';

const AutoPilotContext = createContext<AutoPilotContextType | undefined>(undefined);

export const AutoPilotProvider = ({ children }: { children: ReactNode }) => {
  const [mission, setMission] = useState<Mission | null>(null);
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>(2);
  const [selectedModel, setSelectedModel] = useState<string>('llama3.2');
  const [isFloatingVisible, setFloatingVisible] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [approvalRequest, setApprovalRequest] = useState<{ prompt: string; resolve: (approved: boolean) => void } | null>(null);

  const missionRef = useRef<Mission | null>(null);
  missionRef.current = mission;
  const permissionLevelRef = useRef<PermissionLevel>(permissionLevel);
  permissionLevelRef.current = permissionLevel;
  const selectedModelRef = useRef<string>(selectedModel);
  selectedModelRef.current = selectedModel;
  const voiceEnabledRef = useRef<boolean>(voiceEnabled);
  voiceEnabledRef.current = voiceEnabled;

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

  const requestApproval = useCallback((prompt: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setMission(prev => prev ? { ...prev, status: 'waiting_approval' } : prev);
      // Ensure floating widget is visible when approval is requested
      setFloatingVisible(true);
      setApprovalRequest({ prompt, resolve: (approved: boolean) => {
        setApprovalRequest(null);
        setMission(prev => prev ? { ...prev, status: 'running' } : prev);
        resolve(approved);
      }});
    });
  }, []);

  const startMission = async (goal: string) => {
    const newMission: Mission = {
      id: Date.now().toString(),
      goal,
      status: 'planning',
      startTime: Date.now(),
      logs: [],
      currentStepIndex: 0,
      steps: []
    };
    setMission(newMission);
    setFloatingVisible(true);
    log(`Mission Started: ${goal}`, 'info');
    localMemory.logActivity('User Query', 'Chat', goal);

    try {
      log('Analyzing request and creating execution plan...', 'reasoning');
      
      const allowedSkills = Object.values(skillsRegistry)
        .filter(skill => skill.level <= permissionLevelRef.current)
        .map(skill => `${skill.id} (${skill.name}): ${skill.description}`);

      const memoryContext = localMemory.getActivityContextString();

      const prompt = `You are the Auto-Pilot Planner. Break down the following goal into a JSON array of sequential steps.
Goal: "${goal}"

Available Skills (Filtered to Level ${permissionLevelRef.current}): 
${allowedSkills.join('\n')}

${memoryContext}

CRITICAL: 
- You MUST only use the skills listed above. Do not invent skills.
- If the goal is a casual greeting (like "hello", "how are you") or just conversational chat, you MUST output EXACTLY ONE step using 'chat_reply'. DO NOT search the web for greetings.
- For Level 2 App Mastery, use 'domo_ui_interact' or 'open_domo_tool'.
- For Level 3 OS Control, use 'os_simulate_keystroke', 'os_simulate_click', or 'os_execute_terminal'.
- If the user explicitly asks for research, use 'generate_research_markdown'.

Respond ONLY with a valid JSON array matching this format:
[
  { "description": "Step 1 description", "skillId": "skill_name" }
]`;

      const planJson = await aiService.generateText(prompt, 800, undefined, selectedModelRef.current, {
        systemPrompt: 'You are a task planner. Output only JSON.',
        temperature: 0.1
      });

      let parsedSteps: any[] = [];
      try {
        const cleanJson = planJson.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedSteps = JSON.parse(cleanJson);
      } catch (e) {
        log('Failed to parse planner output. Creating fallback step.', 'error');
        parsedSteps = [{ description: 'Attempt fulfillment', skillId: 'browser_search' }];
      }

      const steps = parsedSteps.map((s: any, i: number) => ({
        id: `step_${i}`,
        description: s.description,
        skillId: s.skillId,
        status: 'pending' as const
      }));

      setMission(prev => prev ? { ...prev, status: 'running', steps } : prev);
      log(`Execution plan created with ${steps.length} steps.`, 'success');

      for (let i = 0; i < steps.length; i++) {
        if (missionRef.current?.status === 'paused' || missionRef.current?.status === 'failed') break;

        setMission(prev => prev ? { ...prev, currentStepIndex: i } : prev);
        const step = steps[i];
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
          const ctx: ExecutionContext = { log, requestApproval };
          const argsPrompt = `Generate JSON arguments for skill "${skill.name}" based on this step: "${step.description}".
Skill parameters: ${JSON.stringify(skill.parameters)}
Goal context: "${goal}"

Output ONLY a valid JSON object.`;

          const argsJson = await aiService.generateText(argsPrompt, 300, undefined, selectedModelRef.current, {
            systemPrompt: 'You are an argument generator. Output only JSON.',
            temperature: 0.1
          });

          let args = {};
          try { 
            const cleanArgs = argsJson.replace(/```json/g, '').replace(/```/g, '').trim();
            args = JSON.parse(cleanArgs); 
          } catch (e) { /* fallback */ }

          await skill.execute(args, ctx);
          log(`Step ${i + 1} completed successfully.`, 'success');
        } catch (err: any) {
          log(`Step failed: ${err.message}`, 'error');
          setMission(prev => prev ? { ...prev, status: 'failed', endTime: Date.now() } : prev);
          return;
        }
      }

      // Final conversational summary
      log('Generating final summary...', 'reasoning');
      try {
        const summaryPrompt = `You are a conversational coding agent. The user's goal was: "${goal}".
You just successfully executed these steps:
${steps.map(s => `- ${s.description}`).join('\n')}

Write a very brief, friendly 1-2 sentence completion message to the user as if you are their personal AI assistant. DO NOT use markdown code blocks or JSON. Just plain text.`;
        
        const summaryResponse = await aiService.generateText(summaryPrompt, 200, undefined, selectedModelRef.current, {
          systemPrompt: 'You are a helpful AI assistant.',
          temperature: 0.7
        });
        
        const finalMessage = summaryResponse.trim();
        log(finalMessage, 'info');
        localMemory.logActivity('AI Response', 'Chat', finalMessage);

        // Speak ONLY the final conversational reply if voice is enabled
        if (voiceEnabledRef.current) {
          window.speechSynthesis.cancel(); // Stop any currently playing TTS to avoid overlap
          const utterance = new SpeechSynthesisUtterance(finalMessage);
          
          let voices = window.speechSynthesis.getVoices();
          // Pick one consistent voice actor
          let preferred = voices.find(v => v.name === 'Google US English') || 
                          voices.find(v => v.name === 'Samantha') ||
                          voices.find(v => v.lang === 'en-US') || 
                          voices[0];
                          
          if (preferred) utterance.voice = preferred;
          utterance.rate = 1.05;
          window.speechSynthesis.speak(utterance);
        }
        
      } catch (e) {
        log('Mission completed successfully.', 'success');
      }

      setMission(prev => prev ? { ...prev, status: 'completed', endTime: Date.now() } : prev);
    } catch (err: any) {
      log(`Mission failed: ${err.message}`, 'error');
      setMission(prev => prev ? { ...prev, status: 'failed', endTime: Date.now() } : prev);
    }
  };

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
      setVoiceEnabled
    }}>
      {children}
    </AutoPilotContext.Provider>
  );
};

export const useAutoPilotEngine = () => {
  const context = useContext(AutoPilotContext);
  if (context === undefined) {
    throw new Error('useAutoPilotEngine must be used within an AutoPilotProvider');
  }
  return context;
};
