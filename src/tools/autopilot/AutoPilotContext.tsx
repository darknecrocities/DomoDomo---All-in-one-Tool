import { createContext, useContext } from 'react';
import type { AutoPilotContextType } from './types';

export const AutoPilotContext = createContext<AutoPilotContextType | undefined>(undefined);

export const useAutoPilotEngine = () => {
  const context = useContext(AutoPilotContext);
  if (context === undefined) {
    throw new Error('useAutoPilotEngine must be used within an AutoPilotProvider');
  }
  return context;
};
