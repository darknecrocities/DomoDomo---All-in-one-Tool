import React from 'react';

export type ToolCategory =
  | 'photo'
  | 'pdf'
  | 'document'
  | 'converter'
  | 'qr'
  | 'video'
  | 'audio'
  | 'dev'
  | 'security'
  | 'ai';

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  icon: string; // Lucide icon name, to resolve dynamically
  run(input: any): Promise<any>;
  component: React.ComponentType;
}
