import React from 'react';
export type PermissionLevel = 1 | 2 | 3;
export type MissionStatus = 'idle' | 'planning' | 'running' | 'paused' | 'waiting_approval' | 'completed' | 'failed';

export interface MissionArtifact {
  id: string;
  name: string;
  content: string;
  type: string;
  timestamp: number;
}

export interface Mission {
  id: string;
  goal: string;
  status: MissionStatus;
  startTime: number;
  endTime?: number;
  logs: MissionLog[];
  currentStepIndex: number;
  steps: MissionStep[];
  artifacts: MissionArtifact[];
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
  addArtifact: (name: string, content: string, type: string) => void;
  selectedModel: string;
  uploadedFiles: UploadedFile[];
}

export interface UploadedFile {
  name: string;
  type: string;
  size: number;
  content: string; // text contents or data URI
  base64Raw?: string; // raw base64 string for vision analysis
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
  mcpOnline: boolean;
  availableMcpTools: string[];
  syncMcp: () => Promise<boolean>;
  clearMission: () => void;
  uploadedFiles: UploadedFile[];
  addUploadedFile: (file: UploadedFile) => void;
  removeUploadedFile: (name: string) => void;
  inputGoal: string;
  setInputGoal: React.Dispatch<React.SetStateAction<string>>;
  isListening: boolean;
  toggleListen: () => void;
}

