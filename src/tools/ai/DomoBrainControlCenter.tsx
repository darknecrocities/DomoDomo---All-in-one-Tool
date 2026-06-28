import { useState, useEffect } from 'react';
import { Brain, Upload, Trash2, Search, Database, Activity, User, RefreshCw, Sparkles, Shield, Save } from 'lucide-react';
import { unifiedMemory } from '../../utils/unifiedMemory';
import type { UserHabit, UserProfileSummary } from '../../utils/unifiedMemory';

export const DomoBrainControlCenter = () => {
  // Tabs: 'vault' (RAG), 'identity' (User Identity Profile), 'profile' (Habits/Preferences), 'timeline' (Live timeline activity)
  const [activeTab, setActiveTab] = useState<'vault' | 'identity' | 'profile' | 'timeline'>('vault');

  // Vault/RAG State
  const [fileText, setFileText] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const [indexingMsg, setIndexingMsg] = useState('');
  const [indexingProgress, setIndexingProgress] = useState(0);
  const [isIndexing, setIsIndexing] = useState(false);

  // Search Test State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ text: string; score: number; source: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Habits/Profile State
  const [profile, setProfile] = useState<UserProfileSummary | null>(null);
  const [habits, setHabits] = useState<UserHabit[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Identity Form State
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('Developer');
  const [editTone, setEditTone] = useState('Analytical & Structured');
  const [editGoals, setEditGoals] = useState<string[]>([]);

  const goalsList = [
    { id: 'coding', label: 'Code auditing & explaining' },
    { id: 'docs', label: 'Text summarization & translating' },
    { id: 'ocr', label: 'Image description & OCR' },
    { id: 'chat', label: 'Interactive chatbot Q&A' },
    { id: 'pdf', label: 'PDF file manipulation' }
  ];

  // Load Initial Data
  const loadData = async () => {
    try {
      const srcList = await unifiedMemory.getAllSources();
      setSources(srcList);

      const profileSummary = await unifiedMemory.getProfileSummary();
      setProfile(profileSummary);

      const recentActions = await unifiedMemory.getRecentActions(20);
      setHabits(recentActions);

      const iden = await unifiedMemory.getUserIdentity();
      if (iden) {
        setEditName(iden.name);
        setEditRole(iden.role);
        setEditTone(iden.tone);
        setEditGoals(iden.goals || []);
      }
    } catch (e) {
      console.error('Failed to load brain controller data:', e);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('domodomo_memory_updated', loadData);
    return () => window.removeEventListener('domodomo_memory_updated', loadData);
  }, []);

  // Save Identity Profile
  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    await unifiedMemory.saveUserIdentity({
      name: editName.trim() || 'Explorer',
      role: editRole,
      goals: editGoals.length > 0 ? editGoals : ['General Productivity'],
      tone: editTone,
      completedOnboarding: true
    });
    alert('User identity profile saved successfully offline!');
    loadData();
    await unifiedMemory.recordAction('Identity Updated', 'User Profile', editName);
  };

  // Toggle Goal selection
  const toggleGoal = (goalLabel: string) => {
    setEditGoals(prev => 
      prev.includes(goalLabel)
        ? prev.filter(g => g !== goalLabel)
        : [...prev, goalLabel]
    );
  };

  // Purge Identity
  const handlePurgeIdentity = async () => {
    if (!confirm('Are you sure you want to delete your saved assistant profile? This will reset your identity to default Explorer.')) return;
    await unifiedMemory.clearIdentity();
    localStorage.removeItem('domodomo_onboarding_completed');
    setEditName('');
    setEditRole('Developer');
    setEditTone('Analytical & Structured');
    setEditGoals([]);
    loadData();
  };

  // Ingest Text file / manual paste
  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileText.trim() || !sourceName.trim()) return;

    setIsIndexing(true);
    setIndexingProgress(10);
    setIndexingMsg('Reading document bytes...');

    try {
      await unifiedMemory.addKnowledge(fileText, sourceName, 'general', (msg, progress) => {
        setIndexingMsg(msg);
        setIndexingProgress(progress);
      });
      setFileText('');
      setSourceName('');
      await loadData();
      await unifiedMemory.recordAction('Knowledge Uploaded', 'RAG Engine', sourceName);
    } catch (err: any) {
      setIndexingMsg(`Indexing Error: ${err.message || err}`);
    } finally {
      setTimeout(() => {
        setIsIndexing(false);
        setIndexingProgress(0);
        setIndexingMsg('');
      }, 2000);
    }
  };

  // Handle Drag & Drop File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSourceName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileText(event.target?.result as string || '');
    };
    reader.readAsText(file);
  };

  // Delete Document
  const handleDeleteSource = async (src: string) => {
    if (!confirm(`Are you sure you want to purge all knowledge chunks associated with "${src}"?`)) return;
    await unifiedMemory.deleteKnowledge(src);
    await loadData();
    await unifiedMemory.recordAction('Knowledge Deleted', 'RAG Engine', src);
  };

  // Test Recall Search
  const handleSearchTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await unifiedMemory.searchKnowledge(searchQuery, 4);
      setSearchResults(results);
      await unifiedMemory.recordAction('Search Vault Test', 'RAG Engine', searchQuery);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // Manual Profile/Habit compile
  const handleCompileProfile = async () => {
    setRefreshing(true);
    try {
      await unifiedMemory.compileProfileSummary();
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  // Reset habits
  const handleClearHabits = async () => {
    if (!confirm('Are you sure you want to clear the habit recorder and delete all user behavior profiles? This cannot be undone.')) return;
    await unifiedMemory.clearHabits();
    await loadData();
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-6xl mx-auto">
      {/* Header card with neon gradient borders and glassmorphism */}
      <section className="relative overflow-hidden bg-[#18191B] border border-[#2A2D30] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute inset-0 bg-gradient-to-r from-[#3C6B4D]/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-4 z-10">
          <div className="p-3.5 bg-[#3C6B4D]/15 border border-[#3C6B4D]/25 rounded-2xl text-[#3C6B4D]">
            <Brain size={32} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#ECEBE9] tracking-tight">Domo Local Brain</h1>
            <p className="text-xs text-[#A3A09B] mt-1 max-w-lg">
              Unified client-side vector database (RAG) and dynamic habit recorder. Integrates context memory automatically into all offline LLM modules.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 z-10 self-start md:self-center bg-[#111213]/80 px-3.5 py-2 border border-[#2A2D30] rounded-xl text-xs text-[#A3A09B]">
          <Shield size={14} className="text-[#3C6B4D]" />
          <span>100% Offline Client-Side Sandbox</span>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex border-b border-[#2A2D30] gap-1 overflow-x-auto">
        {[
          { id: 'vault', name: 'Memory Vault (RAG)', icon: Database },
          { id: 'identity', name: 'User Identity & Persona', icon: User },
          { id: 'profile', name: 'User Profile & Habits', icon: Activity },
          { id: 'timeline', name: 'Recall timeline', icon: RefreshCw }
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'border-[#3C6B4D] text-[#3C6B4D] bg-[#18191B]/40'
                  : 'border-transparent text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#18191B]/20'
              }`}
            >
              <Icon size={14} />
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'vault' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Indexing Section */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4">
              <h2 className="text-base font-bold text-[#ECEBE9] flex items-center gap-2">
                <Upload size={16} className="text-[#3C6B4D]" />
                <span>Upload Context Document (Ingestion)</span>
              </h2>
              
              <form onSubmit={handleIngest} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#A3A09B] mb-1.5">Document Title / Source Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., project_spec.txt, customer_faq.md"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    className="w-full bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#3C6B4D]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#A3A09B] mb-1.5 flex justify-between items-center">
                    <span>Text Contents</span>
                    <label className="text-[10px] font-semibold text-[#3C6B4D] cursor-pointer hover:underline flex items-center gap-1">
                      <Upload size={10} />
                      <span>Select Text File</span>
                      <input
                        type="file"
                        accept=".txt,.md,.json,.js,.ts"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </label>
                  <textarea
                    required
                    rows={8}
                    placeholder="Paste text contents or select a text file. These contents will be chunked and encoded into IndexedDB vector vectors locally..."
                    value={fileText}
                    onChange={(e) => setFileText(e.target.value)}
                    className="w-full bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-3 rounded-lg focus:outline-none focus:border-[#3C6B4D] font-mono leading-relaxed"
                  />
                </div>

                {isIndexing && (
                  <div className="p-4 bg-[#111213] border border-[#2A2D30] rounded-xl flex flex-col gap-2 animate-pulse">
                    <span className="text-xs text-[#ECEBE9] flex items-center gap-2">
                      <Sparkles size={14} className="text-[#3C6B4D] animate-spin" />
                      <span>{indexingMsg}</span>
                    </span>
                    <div className="w-full bg-[#1A1C1E] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#3C6B4D] h-full transition-all duration-300"
                        style={{ width: `${indexingProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isIndexing || !fileText.trim() || !sourceName.trim()}
                  className="w-full py-2.5 bg-[#3C6B4D] text-[#ECEBE9] text-xs font-semibold rounded-lg hover:bg-[#3C6B4D]/90 transition-colors disabled:opacity-50"
                >
                  {isIndexing ? 'Indexing local document...' : 'Ingest to Vault'}
                </button>
              </form>
            </div>

            {/* Test Recall Search */}
            <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4">
              <h2 className="text-base font-bold text-[#ECEBE9] flex items-center gap-2">
                <Search size={16} className="text-[#3C6B4D]" />
                <span>Recall Vector Similarity Test</span>
              </h2>
              <form onSubmit={handleSearchTest} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a sentence to query semantic matching..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-[#3C6B4D]"
                />
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-4 py-2 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs font-semibold rounded-lg hover:bg-[#18191B] transition-colors"
                >
                  Search
                </button>
              </form>

              {searchResults.length > 0 ? (
                <div className="flex flex-col gap-3 mt-2">
                  {searchResults.map((res, index) => (
                    <div key={index} className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] flex flex-col gap-2">
                      <div className="flex justify-between items-center border-b border-[#2A2D30]/60 pb-1.5">
                        <span className="text-[10px] font-bold text-[#A3A09B]">Source: {res.source}</span>
                        <span className="text-[10px] font-bold text-[#3C6B4D]">Score: {Math.round(res.score * 100)}% Match</span>
                      </div>
                      <p className="text-[11px] text-[#ECEBE9]/90 italic leading-relaxed">
                        "{res.text}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                searchQuery && !isSearching && (
                  <span className="text-xs text-[#A3A09B] italic">No relevant memory context matched above threshold (0.35 similarity).</span>
                )
              )}
            </div>
          </div>

          {/* Sources List */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4">
              <h2 className="text-base font-bold text-[#ECEBE9] flex items-center gap-2">
                <Database size={16} className="text-[#3C6B4D]" />
                <span>Vault Archives ({sources.length})</span>
              </h2>
              {sources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-[#A3A09B] border border-dashed border-[#2A2D30] rounded-xl bg-[#111213]/40">
                  <Database size={24} className="mb-2 text-[#2A2D30]" />
                  <span className="text-xs">No documents uploaded. Ingest files on the left to start.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {sources.map((src) => (
                    <div key={src} className="flex items-center justify-between bg-[#111213] px-4 py-3 border border-[#2A2D30] rounded-xl">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-[#ECEBE9] truncate max-w-[200px]">{src}</span>
                        <span className="text-[9px] text-[#A3A09B]">Indexed inside sandbox</span>
                      </div>
                      <button
                        onClick={() => handleDeleteSource(src)}
                        className="p-1.5 text-[#A3A09B] hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'identity' && (
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-[#2A2D30] pb-4">
            <div className="flex items-center gap-2">
              <User size={18} className="text-[#3C6B4D]" />
              <h2 className="text-lg font-bold text-[#ECEBE9]">Assistant Identity & Personalization</h2>
            </div>
            <button
              onClick={handlePurgeIdentity}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/20 border border-red-900/40 rounded-lg text-xs text-red-400 hover:bg-red-950/40"
            >
              <Trash2 size={12} />
              <span>Purge Persona Data</span>
            </button>
          </div>

          <form onSubmit={handleSaveIdentity} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#A3A09B] mb-1.5">User Nickname</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arron, Developer X"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#3C6B4D]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#A3A09B] mb-1.5">Primary Workspace Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#3C6B4D]"
                >
                  <option value="Developer">Developer / Software Engineer</option>
                  <option value="Security Analyst">Cybersecurity Analyst / Auditor</option>
                  <option value="Student">Student / Academic</option>
                  <option value="Content Creator">Writer / Content Creator</option>
                  <option value="Explorer">General Explorer</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#A3A09B] mb-1.5">Preferred AI Response Tone</label>
                <select
                  value={editTone}
                  onChange={(e) => setEditTone(e.target.value)}
                  className="w-full bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#3C6B4D]"
                >
                  <option value="Direct & Brief">Direct & Brief (Saves local tokens)</option>
                  <option value="Analytical & Structured">Analytical & Structured (Highly technical)</option>
                  <option value="Friendly & Conversational">Friendly & Conversational (Helpful tutor)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#A3A09B] mb-2">Main Assistant Goals & Tasks</label>
                <div className="grid grid-cols-1 gap-2">
                  {goalsList.map(g => {
                    const isSelected = editGoals.includes(g.label);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleGoal(g.label)}
                        className={`text-left px-4 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-[#3C6B4D]/10 border-[#3C6B4D] text-[#ECEBE9]'
                            : 'bg-[#111213] border-[#2A2D30] text-[#A3A09B] hover:border-[#3C6B4D]/50'
                        }`}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full py-2.5 bg-[#3C6B4D] text-[#ECEBE9] text-xs font-semibold rounded-lg hover:bg-[#3C6B4D]/90 transition-colors flex items-center justify-center gap-1.5"
              >
                <Save size={14} />
                <span>Save Persona Configuration</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-[#2A2D30] pb-4">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-[#3C6B4D]" />
              <h2 className="text-lg font-bold text-[#ECEBE9]">Habits, Profiles & AI Memory Tuning</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCompileProfile}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111213] border border-[#2A2D30] rounded-lg text-xs text-[#ECEBE9] hover:bg-[#18191B]"
              >
                <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
                <span>Re-Analyze</span>
              </button>
              <button
                onClick={handleClearHabits}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/20 border border-red-900/40 rounded-lg text-xs text-red-400 hover:bg-red-950/40"
              >
                <Trash2 size={12} />
                <span>Reset Memory</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 flex flex-col gap-4">
              <div className="bg-[#111213] p-5 rounded-2xl border border-[#2A2D30] flex flex-col gap-3">
                <span className="text-xs font-bold text-[#3C6B4D] uppercase tracking-wide">AI-Generated Cognitive Summary</span>
                {profile ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-[#ECEBE9] leading-relaxed italic">
                      "{profile.profileSummary}"
                    </p>
                    <span className="text-[9px] text-[#A3A09B] mt-2 block">
                      Last compiled: {new Date(profile.lastUpdated).toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-[#A3A09B] italic">No habit profile constructed yet. Execute tools and browse the app to teach the AI your preferences automatically!</span>
                )}
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col gap-4">
              <div className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] flex flex-col gap-2">
                <span className="text-[10px] font-bold text-[#A3A09B] uppercase">Learned Favorite Tools</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {profile && profile.preferredTools.length > 0 ? (
                    profile.preferredTools.map(t => (
                      <span key={t} className="px-2.5 py-1 bg-[#18191B] border border-[#2A2D30] text-[10px] font-semibold text-[#ECEBE9] rounded-lg">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-[#A3A09B] italic">No tools recorded</span>
                  )}
                </div>
              </div>

              <div className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] flex flex-col gap-2">
                <span className="text-[10px] font-bold text-[#A3A09B] uppercase">Activity Hour Peaks</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {profile && profile.activeHours.length > 0 ? (
                    profile.activeHours.map(h => (
                      <span key={h} className="px-2.5 py-1 bg-[#18191B] border border-[#2A2D30] text-[10px] font-semibold text-[#3C6B4D] rounded-lg">
                        {h}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-[#A3A09B] italic">No active times recorded</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#2A2D30] pb-3">
            <h2 className="text-base font-bold text-[#ECEBE9] flex items-center gap-2">
              <Activity size={16} className="text-[#3C6B4D]" />
              <span>Real-Time Recall Log Timeline</span>
            </h2>
            <span className="text-[10px] text-[#A3A09B]">Showing last 20 actions</span>
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-12 text-[#A3A09B] italic text-xs">
              No recent memory actions recorded. Use tools to populate this stream.
            </div>
          ) : (
            <div className="relative pl-6 flex flex-col gap-4 border-l border-[#2A2D30] ml-2 mt-2">
              {habits.map((item, index) => (
                <div key={item.id || index} className="relative flex flex-col gap-1">
                  <div className="absolute -left-[30px] top-1.5 w-2 h-2 rounded-full bg-[#3C6B4D] border-4 border-[#18191B]" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#ECEBE9]">{item.action}</span>
                    <span className="text-[9px] text-[#A3A09B]">{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <span className="text-[10px] text-[#A3A09B]">
                    Category: <span className="text-[#ECEBE9] font-medium">{item.category}</span> {item.detail && ` | Detail: "${item.detail}"`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
