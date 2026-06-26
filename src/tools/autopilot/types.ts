export type PermissionLevel = 1 | 2 | 3;
export type MissionStatus = 'idle' | 'planning' | 'running' | 'paused' | 'waiting_approval' | 'completed' | 'failed';

export interface Mission {
  id: string;
  goal: string;
  status: MissionStatus;
  startTime: number;
  endTime?: number;
  logs: MissionLog[];
  currentStepIndex: number;
  steps: MissionStep[];
}

export interface MissionStep {
  id: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  skillId?: string;
  reasoning?: string;
}

export interface MissionLog {
  id: string;
  timestamp: number;
  type: 'info' | 'action' | 'success' | 'error' | 'reasoning' | 'user';
  message: string;
  details?: string;
}

export interface AutoPilotSkill {
  id: string;
  name: string;
  description: string;
  level: PermissionLevel;
  parameters: Record<string, string>; // name -> description
  execute: (args: Record<string, any>, context: ExecutionContext) => Promise<any>;
}

export interface ExecutionContext {
  log: (msg: string, type?: MissionLog['type'], details?: string) => void;
  requestApproval: (prompt: string) => Promise<boolean>;
}

export interface AutoPilotContextType {
  mission: Mission | null;
  permissionLevel: PermissionLevel;
  setPermissionLevel: (level: PermissionLevel) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  approvalRequest: { prompt: string; resolve: (approved: boolean) => void } | null;
  startMission: (goal: string) => void;
  pauseMission: () => void;
  resumeMission: () => void;
  log: (message: string, type?: MissionLog['type'], details?: string) => void;
  isFloatingVisible: boolean;
  setFloatingVisible: (visible: boolean) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
}
