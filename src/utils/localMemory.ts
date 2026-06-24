export interface MemoryEvent {
  timestamp: string;
  action: string;
  category: string;
  detail?: string;
}

const STORAGE_KEY = 'domodomo_activity_memory';
const ENABLED_KEY = 'domodomo_memory_enabled';
const MAX_EVENTS = 15;

export const localMemory = {
  isEnabled(): boolean {
    const val = localStorage.getItem(ENABLED_KEY);
    return val !== 'false'; // default is true
  },

  setEnabled(enabled: boolean) {
    localStorage.setItem(ENABLED_KEY, String(enabled));
    window.dispatchEvent(new Event('domodomo_memory_updated'));
  },

  getEvents(): MemoryEvent[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  },

  logActivity(action: string, category: string, detail?: string) {
    if (!this.isEnabled()) return;

    const events = this.getEvents();
    const newEvent: MemoryEvent = {
      timestamp: new Date().toISOString(),
      action,
      category,
      detail
    };

    // Prepend new event and slice to max count
    const updated = [newEvent, ...events].slice(0, MAX_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('domodomo_memory_updated'));
  },

  clearMemory() {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('domodomo_memory_updated'));
  },

  getActivityContextString(): string {
    if (!this.isEnabled()) return '';

    const events = this.getEvents();
    if (events.length === 0) return '';

    // Convert events to a readable list for context injection
    const formattedEvents = events
      .map(e => {
        const time = new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return `- [${time}] Action: "${e.action}" in category "${e.category}"${e.detail ? ` (Item: ${e.detail})` : ''}`;
      })
      .reverse() // show in chronological order for the model to follow steps
      .join('\n');

    return `[LOCAL USER ACTIVITY HISTORY (WORKSPACE MEMORY)]
You have secure access to the user's recent offline actions inside the DomoDomo application. Use this history to provide context-aware assistance, answer workflow questions, or make smart recommendations:
${formattedEvents}
[END OF WORKSPACE MEMORY]`;
  }
};
