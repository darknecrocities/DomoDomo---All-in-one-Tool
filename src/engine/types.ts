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
  keywords?: string; // SEO keywords for meta tags
  seoTitle?: string; // Custom SEO title override
  run(input: any): Promise<any>;
  component: React.ComponentType;
}
