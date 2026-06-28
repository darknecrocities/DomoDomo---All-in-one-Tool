import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Brain, Search, Plus, Trash2, Play, X,
  RotateCw, Sparkles, BookOpen, Cpu, ExternalLink, Maximize2, Minimize2, Send, Loader2
} from 'lucide-react';
import { TOOLS } from '../../engine/registry';
import { skillsRegistry } from '../autopilot/skillsRegistry';
import { unifiedMemory } from '../../utils/unifiedMemory';
import { aiService } from '../../utils/aiService';

// Node Types
type NodeCategory = 'center' | 'skill_premade' | 'skill_custom' | 'knowledge' | 'habit' | 'tool';

interface GraphNode {
  id: string;
  label: string;
  category: NodeCategory;
  description: string;
  details?: any;
  // 3D coordinates
  x: number;
  y: number;
  z: number;
  // Velocity
  vx: number;
  vy: number;
  vz: number;
  // Projection properties (updated each frame)
  screenX?: number;
  screenY?: number;
  projectedSize?: number;
  depth?: number;
}

interface GraphLink {
  source: string;
  target: string;
  value: number; // strength or weight
}

export const DomoMindMapperTool = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Data State
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Interactive / View States
  const [yaw, setYaw] = useState(-0.5); // Rotation angles
  const [pitch, setPitch] = useState(0.3);
  const [zoom, setZoom] = useState(1.0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [physicsActive, setPhysicsActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Modals & Form States
  const [showAddKnowledge, setShowAddKnowledge] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [knowledgeText, setKnowledgeText] = useState('');
  const [knowledgeSource, setKnowledgeSource] = useState('');
  const [knowledgeCategory, setKnowledgeCategory] = useState('general');
  const [isAddingKnowledge, setIsAddingKnowledge] = useState(false);
  
  // Custom Skill Form State
  const [skillName, setSkillName] = useState('');
  const [skillDesc, setSkillDesc] = useState('');
  const [skillPrompt, setSkillPrompt] = useState('');
  const [skillRules, setSkillRules] = useState('');

  // AI Cognitive Assistant State
  const [showAiConsole, setShowAiConsole] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am the Domo Cognitive Assistant. I have control over the 3D Mind Map, skills, tools, and local memory databases. Ask me to open a tool, highlight a topic, search nodes, or explain elements!' }
  ]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatLoading, setAiChatLoading] = useState(false);
  const [aiChatStatus, setAiChatStatus] = useState('');
  const aiChatEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    aiChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChatMessages, aiChatLoading]);
  
  // Mouse tracking for drag/rotate
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatInput.trim() || aiChatLoading) return;

    const userQuery = aiChatInput.trim();
    setAiChatInput('');
    setAiChatMessages(prev => [...prev, { sender: 'user', text: userQuery }]);
    setAiChatLoading(true);
    setAiChatStatus('Analyzing request...');

    // Extract node context details
    const nodesContext = nodes
      .map(n => `- Node ID: "${n.id}", Name: "${n.label}", Category: "${n.category}", Description: "${n.description.slice(0, 100)}"`)
      .join('\n');

    const prompt = `You are Domo AI, the cognitive brain assistant for the DomoDomo application. You have direct control over the 3D Mind Map representing skills, knowledge, habits, and system tools.

The current Mind Map contains the following nodes:
${nodesContext}

If the user wants you to perform an action (like opening/launching a tool, selecting/focusing a node, searching for keywords, or explaining node components), explain your action to the user and append a command block in JSON format at the very end of your response, starting with "[CMD:" and ending with "]".

Supported Command Formats:
1. Focus/select a node: [CMD: {"action": "focus_node", "nodeId": "node_id_here"}]
2. Launch/open a system tool: [CMD: {"action": "open_tool", "toolId": "tool_id_here"}]
3. Search and highlight matching nodes: [CMD: {"action": "search", "query": "search_keyword_here"}]

Example request: "Focus on the PDF Merge node" -> Response: "I will highlight and select the PDF Merge node for you. [CMD: {"action": "focus_node", "nodeId": "pdf-merge"}]"
Example request: "Launch the converter tool" -> Response: "Opening the JPG/PNG converter tool. [CMD: {"action": "open_tool", "toolId": "jpg-png"}]"

Keep your replies friendly, short, and focused on helping the user navigate.

User Request: "${userQuery}"`;

    try {
      const response = await aiService.generateText(
        prompt,
        250,
        (status) => setAiChatStatus(status),
        undefined,
        {
          systemPrompt: "You are the Domo Mind Map Assistant. You explain elements and output structured CMD triggers at the end of messages to control the UI."
        }
      );

      const aiText = response.trim();
      setAiChatMessages(prev => [...prev, { sender: 'ai', text: aiText.replace(/\[CMD:\s*\{.*?\}\s*\]/, '') }]);

      // Parse commands
      const cmdMatch = aiText.match(/\[CMD:\s*(\{.*?\})\s*\]/);
      if (cmdMatch) {
        try {
          const cmd = JSON.parse(cmdMatch[1]);
          if (cmd.action === 'focus_node') {
            const targetId = cmd.nodeId.toLowerCase();
            const node = nodes.find(n => 
              n.id.toLowerCase() === targetId || 
              n.id.replace('tool_', '').toLowerCase() === targetId || 
              n.id.replace('skill_pre_', '').toLowerCase() === targetId
            );
            if (node) {
              setSelectedNode(node);
              // Face camera towards node
              const dist = Math.sqrt(node.x * node.x + node.y * node.y + node.z * node.z) || 1;
              setYaw(-Math.atan2(node.x, node.z));
              setPitch(Math.asin(node.y / dist));
            }
          } else if (cmd.action === 'open_tool') {
            handleLaunchTool(cmd.toolId);
          } else if (cmd.action === 'search') {
            setSearchQuery(cmd.query);
          }
        } catch (parseErr) {
          console.warn("Failed to parse JSON command from AI response:", parseErr);
        }
      }
    } catch (err: any) {
      setAiChatMessages(prev => [...prev, { sender: 'ai', text: `Sorry, I encountered an error: ${err.message || err}` }]);
    } finally {
      setAiChatLoading(false);
      setAiChatStatus('');
    }
  };

  // Physics settings
  const kRepel = 400;      // Repulsive force factor
  const kAttract = 0.05;   // Attraction force factor
  const kGravity = 0.02;   // Center gravity pull
  const restLength = 100;  // Ideal link length
  const damping = 0.85;    // Velocity slowdown per frame
  const fov = 350;         // Perspective FOV

  // Load cognitive data and build the network structure
  const loadCognitiveNetwork = async () => {
    try {
      // 1. Get RAG Knowledge Sources
      const knowledgeSources = await unifiedMemory.getAllSources();

      // Get all raw chunks from cognitive brain IndexedDB
      const knowledgeChunks = await unifiedMemory.getAllChunks();
      
      // 2. Get Custom Skills
      let customSkills: any[] = [];
      const rawCustom = localStorage.getItem('domodomo_custom_skills');
      if (rawCustom) {
        try {
          customSkills = JSON.parse(rawCustom);
        } catch {}
      }

      // 3. Get Recent Actions / Habits
      const recentActions = await unifiedMemory.getRecentActions(15);

      // Create new network nodes & links
      const newNodes: GraphNode[] = [];
      const newLinks: GraphLink[] = [];

      // Helper to initialize position around spheres
      const addNode = (id: string, label: string, cat: NodeCategory, desc: string, details?: any) => {
        // If node already exists, preserve its 3D coordinates & velocity to keep layout stable
        const existing = nodes.find(n => n.id === id);
        if (existing) {
          newNodes.push({ ...existing, label, description: desc, details });
          return;
        }

        // Random starting coordinates
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const radius = 80 + Math.random() * 60;
        
        newNodes.push({
          id,
          label,
          category: cat,
          description: desc,
          details,
          x: radius * Math.sin(phi) * Math.cos(theta),
          y: radius * Math.sin(phi) * Math.sin(theta),
          z: radius * Math.cos(phi),
          vx: 0,
          vy: 0,
          vz: 0
        });
      };

      // Add Central Core Node
      addNode('domo_core', 'Domo Cognitive Core', 'center', 'The central processing nucleus of DomoDomo AI. Interconnects memory, abilities, activities, and tool environments.');

      // Add Category Hub Nodes
      addNode('hub_skills', 'Abilities & Skills', 'center', 'Dynamic agent capabilities and rulesets loaded from the local Autopilot system and user custom configs.');
      addNode('hub_knowledge', 'Knowledge Vault (RAG)', 'center', 'Vector-embedded document facts, reference libraries, and imported databases stored securely in IndexedDB.');
      addNode('hub_habits', 'Activity Memory', 'center', 'Chronological log of recent user events, habits, and execution patterns used to optimize context retention.');
      addNode('hub_tools', 'System Utilities', 'center', 'The library of standard offline tools (audio, converters, PDF processors, photo builders, etc.) that can be automated.');

      // Connect Hubs to Core
      newLinks.push({ source: 'domo_core', target: 'hub_skills', value: 1.5 });
      newLinks.push({ source: 'domo_core', target: 'hub_knowledge', value: 1.5 });
      newLinks.push({ source: 'domo_core', target: 'hub_habits', value: 1.5 });
      newLinks.push({ source: 'domo_core', target: 'hub_tools', value: 1.5 });

      // Add Skills
      // Premade
      Object.values(skillsRegistry).forEach(skill => {
        const nodeId = `skill_pre_${skill.id}`;
        addNode(nodeId, skill.name, 'skill_premade', skill.description, skill);
        newLinks.push({ source: 'hub_skills', target: nodeId, value: 0.8 });
      });

      // Custom
      customSkills.forEach((skill: any, idx: number) => {
        const nodeId = `skill_cust_${idx}_${skill.name.replace(/\s+/g, '_')}`;
        addNode(nodeId, skill.name, 'skill_custom', skill.description || 'Custom modular capabilities configured visually.', skill);
        newLinks.push({ source: 'hub_skills', target: nodeId, value: 0.9 });
      });

      // Add Knowledge sources and sub-chunk neurons
      if (knowledgeSources.length === 0) {
        // Add Demo Placeholder Knowledge Document
        const demoSrc = "Demo: Getting Started with Domo RAG";
        const parentNodeId = "know_src_demo_0";
        addNode(parentNodeId, demoSrc, 'knowledge', `Vector-indexed text source: ${demoSrc}. Loaded securely in local IndexedDB. (Placeholder demo data - add knowledge to replace)`, { sourceName: demoSrc });
        newLinks.push({ source: 'hub_knowledge', target: parentNodeId, value: 0.9 });

        // Add 3 beautiful placeholder chunks connected to the demo source
        const demoChunks = [
          { id: "demo_c1", text: "DomoDomo is designed to run 100% locally in your browser. All computations (vector indexing, model execution, etc.) occur in your browser sandbox with zero server uploads.", metadata: { source: demoSrc } },
          { id: "demo_c2", text: "You can load text files or write notes in the 'Add Knowledge' modal. The text is split into paragraphs and vectorized using your local brain embedding engine.", metadata: { source: demoSrc } },
          { id: "demo_c3", text: "Vector search checks the cosine similarity between your prompt embedding and the stored document chunk embeddings, retrieving the most relevant facts offline.", metadata: { source: demoSrc } }
        ];

        demoChunks.forEach((chunk, cIdx) => {
          const chunkNodeId = `know_chunk_demo_${cIdx}`;
          const chunkLabel = chunk.text.length > 25 ? `${chunk.text.slice(0, 25)}...` : chunk.text;
          addNode(chunkNodeId, chunkLabel, 'knowledge', chunk.text, chunk);
          newLinks.push({ source: parentNodeId, target: chunkNodeId, value: 0.6 });
        });
      } else {
        knowledgeSources.forEach((src, idx) => {
          const parentNodeId = `know_src_${idx}_${src.replace(/\s+/g, '_')}`;
          addNode(parentNodeId, src, 'knowledge', `Vector-indexed text source: ${src}. Loaded securely in local IndexedDB.`, { sourceName: src });
          newLinks.push({ source: 'hub_knowledge', target: parentNodeId, value: 0.9 });

          // Add chunk sub-nodes connected to this source
          const srcChunks = knowledgeChunks.filter(c => c.metadata?.source === src);
          srcChunks.forEach((chunk, cIdx) => {
            const chunkNodeId = `know_chunk_${idx}_${cIdx}_${chunk.id || chunk.text.slice(0, 10)}`;
            const chunkLabel = chunk.text.length > 25 ? `${chunk.text.slice(0, 25)}...` : chunk.text;
            addNode(chunkNodeId, chunkLabel, 'knowledge', chunk.text, chunk);
            newLinks.push({ source: parentNodeId, target: chunkNodeId, value: 0.6 });
          });
        });
      }

      // Add Activities/Habits
      recentActions.forEach((act, idx) => {
        const nodeId = `habit_${idx}_${act.id}`;
        const timeStr = new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        addNode(nodeId, `${act.action} (${timeStr})`, 'habit', `Action: "${act.action}" in category "${act.category}". Details: ${act.detail || 'None'}`, act);
        newLinks.push({ source: 'hub_habits', target: nodeId, value: 0.7 });
      });

      // Add a subset of system tools for representation
      const sampleTools = TOOLS.slice(0, 15); // Show first 15 for readable visual spacing
      sampleTools.forEach(tool => {
        const nodeId = `tool_${tool.id}`;
        addNode(nodeId, tool.name, 'tool', tool.description, tool);
        newLinks.push({ source: 'hub_tools', target: nodeId, value: 0.8 });
      });

      setNodes(newNodes);
      setLinks(newLinks);
    } catch (e) {
      console.error('Failed to generate cognitive mind map data:', e);
    }
  };

  useEffect(() => {
    loadCognitiveNetwork();
    
    // Subscribe to cognitive DB updates
    window.addEventListener('domodomo_memory_updated', loadCognitiveNetwork);
    return () => {
      window.removeEventListener('domodomo_memory_updated', loadCognitiveNetwork);
    };
  }, []);

  // Filter nodes matching search query
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return nodes.filter(n => n.label.toLowerCase().includes(searchQuery.toLowerCase()) || n.description.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, nodes]);

  const selectSearchedNode = (node: GraphNode) => {
    setSelectedNode(node);
    setSearchQuery('');
    // Animate view towards the node by focusing camera angle
    // Calculate yaw and pitch to face the selected node
    const dist = Math.sqrt(node.x * node.x + node.y * node.y + node.z * node.z) || 1;
    setYaw(-Math.atan2(node.x, node.z));
    setPitch(Math.asin(node.y / dist));
  };

  // Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const handleResize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        if (document.fullscreenElement) {
          canvas.height = canvas.parentElement.clientHeight || (window.innerHeight - 200);
        } else {
          canvas.height = Math.max(500, window.innerHeight - 300);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Particle flows along links (synaptic firings)
    interface SynapticParticle {
      sourceX: number; sourceY: number; sourceZ: number;
      targetX: number; targetY: number; targetZ: number;
      progress: number; // 0 to 1
      speed: number;
      color: string;
    }
    let particles: SynapticParticle[] = [];

    // Periodic spawning of synaptic particles
    const spawnParticle = () => {
      if (links.length === 0 || nodes.length === 0) return;
      const randomLink = links[Math.floor(Math.random() * links.length)];
      const sourceNode = nodes.find(n => n.id === randomLink.source);
      const targetNode = nodes.find(n => n.id === randomLink.target);
      
      if (sourceNode && targetNode) {
        let pColor = '#3C6B4D'; // default emerald
        if (sourceNode.category === 'knowledge' || targetNode.category === 'knowledge') pColor = '#38bdf8'; // blue
        if (sourceNode.category === 'skill_custom' || targetNode.category === 'skill_custom') pColor = '#a78bfa'; // violet
        if (sourceNode.category === 'habit' || targetNode.category === 'habit') pColor = '#fbbf24'; // yellow

        particles.push({
          sourceX: sourceNode.x, sourceY: sourceNode.y, sourceZ: sourceNode.z,
          targetX: targetNode.x, targetY: targetNode.y, targetZ: targetNode.z,
          progress: 0,
          speed: 0.01 + Math.random() * 0.015,
          color: pColor
        });
      }
    };

    const updatePhysics = () => {
      if (!physicsActive) return;

      // 1. Repulsion force between all node pairs
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dz = n1.z - n2.z;
          const distSq = dx * dx + dy * dy + dz * dz || 1;
          const dist = Math.sqrt(distSq);

          // Force inversely proportional to distance squared
          const force = kRepel / distSq;
          const vx = (dx / dist) * force;
          const vy = (dy / dist) * force;
          const vz = (dz / dist) * force;

          n1.vx += vx; n1.vy += vy; n1.vz += vz;
          n2.vx -= vx; n2.vy -= vy; n2.vz -= vz;
        }
      }

      // 2. Attraction force along links
      links.forEach(link => {
        const sourceNode = nodes.find(n => n.id === link.source);
        const targetNode = nodes.find(n => n.id === link.target);
        if (!sourceNode || !targetNode) return;

        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const dz = targetNode.z - sourceNode.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        const displacement = dist - restLength;
        const force = displacement * kAttract;

        const vx = (dx / dist) * force;
        const vy = (dy / dist) * force;
        const vz = (dz / dist) * force;

        sourceNode.vx += vx; sourceNode.vy += vy; sourceNode.vz += vz;
        targetNode.vx -= vx; targetNode.vy -= vy; targetNode.vz -= vz;
      });

      // 3. Gravity center pull and velocity updates
      nodes.forEach(node => {
        // Gravity pull to origin
        node.vx -= node.x * kGravity;
        node.vy -= node.y * kGravity;
        node.vz -= node.z * kGravity;

        // Apply damping
        node.vx *= damping;
        node.vy *= damping;
        node.vz *= damping;

        // Limit maximum speed
        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy + node.vz * node.vz) || 1;
        const maxSpeed = 10;
        if (speed > maxSpeed) {
          node.vx = (node.vx / speed) * maxSpeed;
          node.vy = (node.vy / speed) * maxSpeed;
          node.vz = (node.vz / speed) * maxSpeed;
        }

        // Apply velocities
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;
      });
    };

    // Main animation frame renderer
    const render = () => {
      // Periodic spawning
      if (Math.random() < 0.12 && particles.length < 50) {
        spawnParticle();
      }

      // Clear with cybernetic dark grid background
      ctx.fillStyle = '#0c0d0e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render simple digital scanlines or grid underlays
      ctx.strokeStyle = '#18191B';
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 3D rotation & projection math
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosX = Math.cos(pitch);
      const sinX = Math.sin(pitch);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const cameraDist = 400 / zoom;

      // Project Nodes
      nodes.forEach(node => {
        // Rotate around Y (yaw)
        const x1 = node.x * cosY - node.z * sinY;
        const z1 = node.x * sinY + node.z * cosY;

        // Rotate around X (pitch)
        const y2 = node.y * cosX - z1 * sinX;
        const z2 = node.y * sinX + z1 * cosX;

        const depth = z2 + cameraDist;
        node.depth = depth;

        if (depth > 10) {
          node.screenX = centerX + (x1 * fov) / depth;
          node.screenY = centerY + (y2 * fov) / depth;
          node.projectedSize = Math.max(2, (getNodeRadius(node.category) * fov) / depth);
        } else {
          node.screenX = undefined;
          node.screenY = undefined;
        }
      });

      // Sort nodes by depth (painter's algorithm)
      const projectedNodes = [...nodes].filter(n => n.screenX !== undefined).sort((a, b) => (b.depth || 0) - (a.depth || 0));

      // Draw Links
      links.forEach(link => {
        const sourceNode = nodes.find(n => n.id === link.source);
        const targetNode = nodes.find(n => n.id === link.target);
        if (!sourceNode || !targetNode) return;
        const sX = sourceNode.screenX;
        const sY = sourceNode.screenY;
        const tX = targetNode.screenX;
        const tY = targetNode.screenY;
        if (sX === undefined || sY === undefined || tX === undefined || tY === undefined) return;

        // Depth-based transparency
        const avgDepth = ((sourceNode.depth || 0) + (targetNode.depth || 0)) / 2;
        const alpha = Math.max(0.04, Math.min(0.4, 300 / avgDepth));

        ctx.strokeStyle = getNodeColor(sourceNode.category);
        ctx.globalAlpha = alpha;
        ctx.lineWidth = Math.max(0.5, 400 / avgDepth);
        ctx.beginPath();
        ctx.moveTo(sX, sY);
        ctx.lineTo(tX, tY);
        ctx.stroke();
      });
      ctx.globalAlpha = 1.0;

      // Draw particles (Synaptic Firing)
      particles.forEach((p, idx) => {
        p.progress += p.speed;
        if (p.progress >= 1.0) {
          particles.splice(idx, 1);
          return;
        }

        // Interpolate 3D coordinates
        const curX = p.sourceX + (p.targetX - p.sourceX) * p.progress;
        const curY = p.sourceY + (p.targetY - p.sourceY) * p.progress;
        const curZ = p.sourceZ + (p.targetZ - p.sourceZ) * p.progress;

        // Project
        const x1 = curX * cosY - curZ * sinY;
        const z1 = curX * sinY + curZ * cosY;
        const y2 = curY * cosX - z1 * sinX;
        const z2 = curY * sinX + z1 * cosX;

        const depth = z2 + cameraDist;
        if (depth > 10) {
          const sX = centerX + (x1 * fov) / depth;
          const sY = centerY + (y2 * fov) / depth;
          const size = Math.max(1, (5 * fov) / depth);

          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(sX, sY, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw Nodes
      projectedNodes.forEach(node => {
        const sX = node.screenX!;
        const sY = node.screenY!;
        const size = node.projectedSize!;
        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;

        // Shadow / Glow Effect
        ctx.shadowColor = getNodeColor(node.category);
        ctx.shadowBlur = isHovered || isSelected ? 18 : 6;

        // Draw core node circle
        ctx.fillStyle = isSelected ? '#ffffff' : getNodeColor(node.category);
        ctx.beginPath();
        ctx.arc(sX, sY, size, 0, Math.PI * 2);
        ctx.fill();

        // Node Ring/Pulse
        ctx.shadowBlur = 0;
        ctx.strokeStyle = getNodeColor(node.category);
        ctx.lineWidth = isHovered || isSelected ? 2 : 1;
        ctx.beginPath();
        ctx.arc(sX, sY, size + (isHovered || isSelected ? 4 : 2), 0, Math.PI * 2);
        ctx.stroke();

        // Render Text Label for closer nodes or hovered
        const threshold = 550 * zoom;
        if ((node.depth || 0) < threshold || isHovered || isSelected) {
          ctx.fillStyle = isSelected ? '#ffffff' : '#ECEBE9';
          ctx.font = isHovered || isSelected 
            ? '600 11px system-ui, sans-serif'
            : '400 9px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, sX, sY - size - 6);
        }
      });

      // Update positions and physics
      updatePhysics();

      // Handle Auto-Rotation
      if (autoRotate && !isDraggingRef.current) {
        setYaw(prev => prev + 0.002);
      }

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [nodes, links, yaw, pitch, zoom, autoRotate, physicsActive, hoveredNode, selectedNode]);

  // Radius helper based on category importance
  const getNodeRadius = (cat: NodeCategory) => {
    switch (cat) {
      case 'center': return 12;
      case 'skill_premade':
      case 'skill_custom': return 8;
      case 'knowledge': return 7;
      case 'tool': return 7;
      case 'habit': return 5;
      default: return 6;
    }
  };

  // Color helper based on node category
  const getNodeColor = (cat: NodeCategory) => {
    switch (cat) {
      case 'center': return '#8b5cf6';       // Violet
      case 'skill_premade': return '#3C6B4D'; // Theme Emerald Green
      case 'skill_custom': return '#a78bfa';  // Light Purple
      case 'knowledge': return '#38bdf8';     // Sky Blue
      case 'tool': return '#f43f5e';          // Rose Red
      case 'habit': return '#fbbf24';         // Amber Yellow
      default: return '#ECEBE9';
    }
  };

  // Canvas Mouse Interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mX = e.clientX - rect.left;
    const mY = e.clientY - rect.top;

    if (isDraggingRef.current) {
      // Calculate delta drag
      const deltaX = e.clientX - lastMousePosRef.current.x;
      const deltaY = e.clientY - lastMousePosRef.current.y;

      setYaw(prev => prev + deltaX * 0.007);
      setPitch(prev => Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, prev + deltaY * 0.007)));

      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    } else {
      // Perform node hover testing
      let found: GraphNode | null = null;
      for (const node of nodes) {
        if (node.screenX !== undefined && node.screenY !== undefined && node.projectedSize !== undefined) {
          const dx = mX - node.screenX;
          const dy = mY - node.screenY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist <= node.projectedSize + 4) {
            found = node;
            break;
          }
        }
      }
      setHoveredNode(found);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    
    // If it was a simple click (not a major drag) perform selection
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mX = e.clientX - rect.left;
    const mY = e.clientY - rect.top;

    let clickedNode: GraphNode | null = null;
    for (const node of nodes) {
      if (node.screenX !== undefined && node.screenY !== undefined && node.projectedSize !== undefined) {
        const dx = mX - node.screenX;
        const dy = mY - node.screenY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist <= node.projectedSize + 6) {
          clickedNode = node;
          break;
        }
      }
    }
    setSelectedNode(clickedNode);
  };

  // Add Dynamic Knowledge Base Source
  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!knowledgeSource.trim() || !knowledgeText.trim()) return;

    setIsAddingKnowledge(true);
    try {
      await unifiedMemory.addKnowledge(knowledgeText, knowledgeSource.trim(), knowledgeCategory);
      setKnowledgeText('');
      setKnowledgeSource('');
      setShowAddKnowledge(false);
      await loadCognitiveNetwork();
      await unifiedMemory.recordAction('Knowledge Added', 'Memory Vault', knowledgeSource);
    } catch (err: any) {
      alert(`Error storing knowledge offline: ${err.message}`);
    } finally {
      setIsAddingKnowledge(false);
    }
  };

  // Add custom skill
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    try {
      const rawCustom = localStorage.getItem('domodomo_custom_skills');
      let customSkills: any[] = rawCustom ? JSON.parse(rawCustom) : [];
      
      const newSkill = {
        name: skillName.trim(),
        description: skillDesc.trim() || 'Custom user capacity',
        tools: ['custom_executor'],
        permissions: ['read_files'],
        rules: skillRules.split('\n').filter(r => r.trim()),
        systemInstructions: skillPrompt.trim()
      };

      customSkills.push(newSkill);
      localStorage.setItem('domodomo_custom_skills', JSON.stringify(customSkills));

      setSkillName('');
      setSkillDesc('');
      setSkillPrompt('');
      setSkillRules('');
      setShowAddSkill(false);
      loadCognitiveNetwork();
      unifiedMemory.recordAction('Skill Added', 'User Abilities', newSkill.name);
    } catch (err: any) {
      alert(`Error building skill: ${err.message}`);
    }
  };

  // Delete Node (for custom skills & knowledge)
  const handleDeleteNode = async (node: GraphNode) => {
    if (!confirm(`Are you sure you want to delete "${node.label}" from the cognitive database?`)) return;

    try {
      if (node.category === 'knowledge') {
        const sourceName = node.details?.sourceName || node.label;
        await unifiedMemory.deleteKnowledge(sourceName);
        await unifiedMemory.recordAction('Knowledge Deleted', 'Memory Vault', sourceName);
      } else if (node.category === 'skill_custom') {
        const rawCustom = localStorage.getItem('domodomo_custom_skills');
        if (rawCustom) {
          let customSkills = JSON.parse(rawCustom);
          customSkills = customSkills.filter((s: any) => s.name !== node.label);
          localStorage.setItem('domodomo_custom_skills', JSON.stringify(customSkills));
          await unifiedMemory.recordAction('Skill Deleted', 'User Abilities', node.label);
        }
      } else if (node.category === 'habit') {
        // Clear all habits/ timeline events
        await unifiedMemory.clearHabits();
        await unifiedMemory.recordAction('Timeline Cleared', 'User Profile');
      }

      setSelectedNode(null);
      await loadCognitiveNetwork();
    } catch (err: any) {
      alert(`Failed to delete node: ${err.message}`);
    }
  };

  // Launch quick action to open tools
  const handleLaunchTool = (toolId: string) => {
    const event = new CustomEvent('domo-navigate', { detail: { path: `/tool/${toolId}` } });
    window.dispatchEvent(event);
  };

  const innerUI = (
    <div ref={containerRef} className={`relative w-full flex flex-col gap-6 select-none ${
      isFullscreen ? 'bg-[#0c0d0e] p-6 overflow-y-auto w-screen h-screen' : ''
    }`}>
      
      {/* Search and control bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-[#2a2d30] bg-[#131416]/80 backdrop-blur-md">
        
        <div className="relative flex-1 min-w-[280px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#72706C]" />
          <input
            type="text"
            placeholder="Search neuron nodes (skills, knowledge, habits, tools)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-lg bg-[#0C0D0E] border border-[#2A2D30] text-[#ECEBE9] placeholder-[#72706C] focus:outline-none focus:border-[#3C6B4D]/60 focus:ring-1 focus:ring-[#3C6B4D]/30"
          />
          {searchQuery && (
            <div className="absolute left-0 right-0 top-full mt-2 max-h-60 overflow-y-auto rounded-lg border border-[#2A2D30] bg-[#0c0d0e] shadow-2xl z-50">
              {filteredNodes.length > 0 ? (
                filteredNodes.map(node => (
                  <button
                    key={node.id}
                    onClick={() => selectSearchedNode(node)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#3C6B4D]/10 text-left text-xs text-[#A3A09B] transition-colors border-b border-[#18191B]/50 last:border-b-0"
                  >
                    <span className="font-bold text-[#ECEBE9]">{node.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#18191B] capitalize font-medium tracking-wide">
                      {node.category.replace('_', ' ')}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-[#72706C]">No nodes match search query</div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center rounded-lg border border-[#2A2D30] bg-[#0C0D0E] overflow-hidden">
            <button
              onClick={() => setZoom(prev => Math.max(0.3, prev - 0.15))}
              className="px-3 py-1.5 hover:bg-[#18191B] text-[#A3A09B] text-xs font-bold transition-colors"
            >
              -
            </button>
            <span className="px-2 text-[10px] font-mono text-[#72706C]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(prev => Math.min(2.5, prev + 0.15))}
              className="px-3 py-1.5 hover:bg-[#18191B] text-[#A3A09B] text-xs font-bold transition-colors"
            >
              +
            </button>
          </div>

          {/* Toggle buttons */}
          <button
            onClick={() => setAutoRotate(prev => !prev)}
            className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
              autoRotate 
                ? 'bg-[#3C6B4D]/15 border-[#3C6B4D]/45 text-[#3C6B4D]' 
                : 'bg-[#0C0D0E] border-[#2A2D30] text-[#A3A09B] hover:bg-[#18191B]'
            }`}
            title="Auto-rotate 3D view"
          >
            <RotateCw size={14} className={autoRotate ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Orbit</span>
          </button>

          <button
            onClick={() => setPhysicsActive(prev => !prev)}
            className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
              physicsActive 
                ? 'bg-[#3C6B4D]/15 border-[#3C6B4D]/45 text-[#3C6B4D]' 
                : 'bg-[#0C0D0E] border-[#2A2D30] text-[#A3A09B] hover:bg-[#18191B]'
            }`}
            title="Toggle physics simulation"
          >
            <Play size={14} className={physicsActive ? 'text-[#3C6B4D]' : ''} />
            <span className="hidden sm:inline">Forces</span>
          </button>

          {/* Action Modals triggers */}
          <button
            onClick={() => setShowAddKnowledge(true)}
            className="btn-primary py-2 px-3 text-xs font-bold flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Add Knowledge</span>
          </button>

          <button
            onClick={() => setShowAddSkill(true)}
            className="btn-secondary py-2 px-3 text-xs font-bold flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Add Skill</span>
          </button>

          <button
            onClick={() => setShowAiConsole(prev => !prev)}
            className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
              showAiConsole 
                ? 'bg-[#8b5cf6]/15 border-[#8b5cf6]/45 text-[#8b5cf6]' 
                : 'bg-[#0C0D0E] border-[#2A2D30] text-[#A3A09B] hover:bg-[#18191B]'
            }`}
            title="Open AI Command Drawer"
          >
            <Brain size={14} />
            <span className="hidden sm:inline">AI Agent Console</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all bg-[#0C0D0E] border-[#2A2D30] text-[#A3A09B] hover:bg-[#18191B]"
            title="Toggle fullscreen mode"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Full' : 'Full Screen'}</span>
          </button>
        </div>
      </div>

      {/* Mind Mapper Canvas Area */}
      <div className={`relative w-full flex flex-col lg:flex-row gap-6 ${
        isFullscreen ? 'h-[calc(100vh-140px)]' : ''
      }`}>
        
        {/* AI Command Drawer */}
        {showAiConsole && (
          <div className="w-full lg:w-80 rounded-xl border border-[#2a2d30] bg-[#131416]/95 backdrop-blur-md p-4 flex flex-col shadow-2xl relative select-text h-[500px] lg:h-auto z-10">
            <div className="flex items-center justify-between border-b border-[#2A2D30] pb-2 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#8b5cf6]">
                <Cpu size={14} />
                <span>AI Cognitive Console</span>
              </div>
              <button
                onClick={() => setShowAiConsole(false)}
                className="text-[#72706C] hover:text-[#ECEBE9] transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 mb-3 pr-1 text-xs max-h-[360px] scrollbar-thin">
              {aiChatMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col gap-1 max-w-[85%] ${
                  msg.sender === 'user' ? 'align-end ml-auto' : 'mr-auto'
                }`}>
                  <div className={`p-2.5 rounded-xl border leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/25 text-[#ECEBE9] rounded-tr-none'
                      : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B] rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiChatLoading && (
                <div className="flex items-center gap-2 text-[10px] text-[#72706C] italic mt-1">
                  <Loader2 size={12} className="animate-spin text-[#8b5cf6]" />
                  <span>{aiChatStatus || 'Thinking...'}</span>
                </div>
              )}
              <div ref={aiChatEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendAiMessage} className="relative flex items-center gap-1.5 mt-auto">
              <input
                type="text"
                value={aiChatInput}
                onChange={(e) => setAiChatInput(e.target.value)}
                placeholder="Instruct Domo AI (e.g. open PDF split)..."
                className="w-full pl-3 pr-9 py-2 text-xs font-semibold rounded-lg bg-[#0C0D0E] border border-[#2A2D30] text-[#ECEBE9] placeholder-[#72706C] focus:outline-none focus:border-[#8b5cf6]/60"
              />
              <button
                type="submit"
                disabled={aiChatLoading}
                className="absolute right-1.5 p-1 rounded bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6] hover:bg-[#8b5cf6]/20 disabled:opacity-50"
              >
                <Send size={12} />
              </button>
            </form>
          </div>
        )}
        
        {/* The 3D Canvas Box */}
        <div className={`flex-1 rounded-xl border border-[#2a2d30] overflow-hidden bg-[#0c0d0e] relative ${
          isFullscreen ? 'h-full w-full' : 'min-h-[500px]'
        }`}>
          
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="w-full h-full block cursor-grab active:cursor-grabbing"
          />

          {/* Guide Overlay */}
          <div className="absolute bottom-4 left-4 p-3 rounded-lg border border-[#2a2d30] bg-[#131416]/95 backdrop-blur-sm pointer-events-none flex flex-col gap-1">
            <h4 className="text-[10px] font-bold text-[#ECEBE9] tracking-wider uppercase">Interface Controls</h4>
            <p className="text-[9px] text-[#A3A09B]">• Drag left mouse button to rotate network</p>
            <p className="text-[9px] text-[#A3A09B]">• Scroll wheel to zoom in/out</p>
            <p className="text-[9px] text-[#A3A09B]">• Hover node to inspect name / Click to open details</p>
          </div>

          {/* Legend Overlay */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-xs pointer-events-none">
            <span className="px-2 py-0.5 rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 text-[9px] font-bold text-[#8b5cf6]">Core</span>
            <span className="px-2 py-0.5 rounded-full border border-[#3C6B4D]/30 bg-[#3C6B4D]/10 text-[9px] font-bold text-[#3C6B4D]">Premade Skills</span>
            <span className="px-2 py-0.5 rounded-full border border-[#a78bfa]/30 bg-[#a78bfa]/10 text-[9px] font-bold text-[#a78bfa]">Custom Skills</span>
            <span className="px-2 py-0.5 rounded-full border border-[#38bdf8]/30 bg-[#38bdf8]/10 text-[9px] font-bold text-[#38bdf8]">RAG Knowledge</span>
            <span className="px-2 py-0.5 rounded-full border border-[#fbbf24]/30 bg-[#fbbf24]/10 text-[9px] font-bold text-[#fbbf24]">User History</span>
            <span className="px-2 py-0.5 rounded-full border border-[#f43f5e]/30 bg-[#f43f5e]/10 text-[9px] font-bold text-[#f43f5e]">Tools</span>
          </div>

          {/* Selected Node Quick Info (Canvas Bottom) */}
          {hoveredNode && (
            <div className="absolute bottom-4 right-4 max-w-sm p-3 rounded-lg border border-[#2a2d30] bg-[#131416]/95 backdrop-blur-sm pointer-events-none">
              <h3 className="text-xs font-bold text-[#ECEBE9] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getNodeColor(hoveredNode.category) }} />
                {hoveredNode.label}
              </h3>
              <p className="text-[10px] text-[#A3A09B] mt-1 line-clamp-2 leading-relaxed">
                {hoveredNode.description}
              </p>
            </div>
          )}
        </div>

        {/* Selected Details Slide-in Panel */}
        {selectedNode ? (
          <div className="w-full lg:w-96 rounded-xl border border-[#2a2d30] bg-[#131416]/95 backdrop-blur-md p-6 flex flex-col justify-between shadow-2xl relative">
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-4 right-4 p-1 hover:bg-[#18191B] rounded-lg text-[#72706C] hover:text-[#ECEBE9] transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6]">
                  <Brain size={18} />
                </span>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#72706C]">
                    {selectedNode.category.replace('_', ' ')} Node
                  </span>
                  <h3 className="text-lg font-extrabold text-[#ECEBE9] leading-tight">
                    {selectedNode.label}
                  </h3>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0C0D0E] border border-[#2A2D30] text-xs leading-relaxed text-[#A3A09B]">
                {selectedNode.description}
              </div>

              {/* Node specific actions / metadata */}
              {selectedNode.category === 'tool' && (
                <div className="flex flex-col gap-3 mt-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#72706C]">Capabilities</h4>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-[#18191B] text-[10px] text-[#A3A09B] border border-[#2A2D30]">Runs 100% Locally</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#18191B] text-[10px] text-[#A3A09B] border border-[#2A2D30]">No File Uploads</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#18191B] text-[10px] text-[#A3A09B] border border-[#2A2D30]">Active Script</span>
                  </div>
                  <button
                    onClick={() => handleLaunchTool(selectedNode.id.replace('tool_', ''))}
                    className="btn-primary mt-2 py-2 text-xs font-bold w-full flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink size={14} />
                    <span>Launch Utility</span>
                  </button>
                </div>
              )}

              {selectedNode.category === 'skill_custom' && (
                <div className="flex flex-col gap-3 mt-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#72706C]">Behavioral Instructions</h4>
                  {selectedNode.details?.systemInstructions && (
                    <pre className="text-[9px] font-mono p-2.5 rounded bg-[#0c0d0e] text-[#a78bfa] border border-[#a78bfa]/20 overflow-x-auto max-h-36 font-semibold select-text">
                      {selectedNode.details.systemInstructions}
                    </pre>
                  )}
                  {selectedNode.details?.rules && selectedNode.details.rules.length > 0 && (
                    <div className="flex flex-col gap-1 text-[10px] text-[#A3A09B]">
                      <span className="font-bold text-[#72706C]">Defined Rules:</span>
                      {selectedNode.details.rules.map((rule: string, i: number) => (
                        <div key={i} className="flex items-start gap-1">
                          <span>•</span>
                          <span>{rule}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => handleDeleteNode(selectedNode)}
                    className="btn-secondary text-rose-500 border-rose-500/20 hover:bg-rose-500/10 hover:border-rose-500/30 mt-2 py-2 text-xs font-bold w-full flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    <span>Delete Skill</span>
                  </button>
                </div>
              )}

              {selectedNode.category === 'knowledge' && (
                <div className="flex flex-col gap-3 mt-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#72706C]">
                    {selectedNode.id.includes('know_chunk_') ? 'Knowledge Chunk Content' : 'Source Database'}
                  </h4>
                  <div className="flex flex-col gap-2 text-[10px] text-[#A3A09B]">
                    {selectedNode.id.includes('know_chunk_') ? (
                      <>
                        <div className="p-3 rounded-lg bg-[#0C0D0E] border border-[#38bdf8]/25 text-xs text-[#38bdf8] max-h-48 overflow-y-auto select-text whitespace-pre-wrap leading-relaxed font-mono">
                          {selectedNode.description}
                        </div>
                        <div className="text-[9px] text-[#72706C]">
                          Source Document: <span className="font-semibold text-[#A3A09B]">{selectedNode.details?.metadata?.source || 'Unknown'}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div><span className="text-[#72706C]">Indexed Name:</span> {selectedNode.details?.sourceName || selectedNode.label}</div>
                        <div><span className="text-[#72706C]">Embedding:</span> Local 384-dim Vector Pipeline</div>
                      </>
                    )}
                  </div>
                  {!selectedNode.id.includes('know_chunk_') && (
                    <button
                      onClick={() => handleDeleteNode(selectedNode)}
                      className="btn-secondary text-rose-500 border-rose-500/20 hover:bg-rose-500/10 hover:border-rose-500/30 mt-2 py-2 text-xs font-bold w-full flex items-center justify-center gap-1.5"
                    >
                      <Trash2 size={14} />
                      <span>Delete Source Chunks</span>
                    </button>
                  )}
                </div>
              )}

              {selectedNode.category === 'habit' && (
                <div className="flex flex-col gap-3 mt-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#72706C]">Habit Metrics</h4>
                  <div className="text-[10px] text-[#A3A09B]">
                    <div><span className="text-[#72706C]">Logged:</span> {new Date(selectedNode.details?.timestamp).toLocaleString()}</div>
                    <div><span className="text-[#72706C]">Category:</span> {selectedNode.details?.category}</div>
                    {selectedNode.details?.detail && (
                      <div className="mt-1 p-2 rounded bg-[#0C0D0E] font-mono text-[9px] text-[#fbbf24] select-text">
                        {selectedNode.details.detail}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteNode(selectedNode)}
                    className="btn-secondary text-amber-500 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/30 mt-2 py-2 text-xs font-bold w-full flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    <span>Clear Timeline Records</span>
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#2a2d30] flex items-center justify-between text-[9px] text-[#72706C]">
              <span>ID: {selectedNode.id}</span>
              <span>Pos: {Math.round(selectedNode.x)}, {Math.round(selectedNode.y)}</span>
            </div>
          </div>
        ) : (
          <div className="w-full lg:w-96 rounded-xl border border-[#2a2d30] bg-[#131416]/80 p-6 flex flex-col justify-between items-center text-center">
            <div className="my-auto flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-[#3C6B4D]/10 border border-[#3C6B4D]/25 text-[#3C6B4D] animate-pulse">
                <Brain size={32} />
              </div>
              <h3 className="text-sm font-bold text-[#ECEBE9]">Inspect Neural Core</h3>
              <p className="text-xs text-[#A3A09B] max-w-[240px] leading-relaxed">
                Click any interconnecting node to inspect modular instructions, launch applications, or prune the local cognitive database.
              </p>
            </div>
            <div className="mt-auto pt-4 border-t border-[#2a2d30]/60 w-full flex justify-between text-[9px] text-[#72706C]">
              <span>Nodes: {nodes.length}</span>
              <span>Links: {links.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Modal - Add Knowledge */}
      {showAddKnowledge && (
        <div className="fixed inset-0 bg-[#0C0D0E]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-text">
          <div className="w-full max-w-xl rounded-2xl border border-[#2a2d30] bg-[#131416] p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddKnowledge(false)}
              className="absolute top-4 right-4 p-1 hover:bg-[#18191B] rounded-lg text-[#72706C] hover:text-[#ECEBE9] transition-colors"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-[#ECEBE9] flex items-center gap-2 mb-2">
              <BookOpen size={20} className="text-[#38bdf8]" />
              <span>Vectorize Document Knowledge (RAG)</span>
            </h3>
            <p className="text-xs text-[#A3A09B] mb-4 leading-relaxed">
              Paste logs, documentation, or text notes. They will be split into paragraphs, vectorized locally in your browser, and written to IndexedDB.
            </p>

            <form onSubmit={handleAddKnowledge} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#72706C]">Source / Title Name</label>
                <input
                  type="text"
                  placeholder="e.g. Project Roadmap, Git Workflow Guide..."
                  required
                  value={knowledgeSource}
                  onChange={(e) => setKnowledgeSource(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-[#0C0D0E] border border-[#2A2D30] text-[#ECEBE9] placeholder-[#72706C] focus:outline-none focus:border-[#3C6B4D]/60"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#72706C]">Category</label>
                <select
                  value={knowledgeCategory}
                  onChange={(e) => setKnowledgeCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-[#0C0D0E] border border-[#2A2D30] text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]/60"
                >
                  <option value="general">General Reference</option>
                  <option value="coding">Coding & Syntax</option>
                  <option value="rules">Standard Instructions</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#72706C]">Document Body</label>
                <textarea
                  placeholder="Paste context notes or documents here..."
                  required
                  rows={6}
                  value={knowledgeText}
                  onChange={(e) => setKnowledgeText(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-[#0C0D0E] border border-[#2A2D30] text-[#ECEBE9] placeholder-[#72706C] focus:outline-none focus:border-[#3C6B4D]/60 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddKnowledge(false)}
                  className="btn-secondary py-2 px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingKnowledge}
                  className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
                >
                  {isAddingKnowledge ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#ECEBE9] border-t-transparent rounded-full animate-spin" />
                      <span>Embedding Locally...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Build & Connect Node</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Add Skill */}
      {showAddSkill && (
        <div className="fixed inset-0 bg-[#0C0D0E]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-text">
          <div className="w-full max-w-xl rounded-2xl border border-[#2a2d30] bg-[#131416] p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddSkill(false)}
              className="absolute top-4 right-4 p-1 hover:bg-[#18191B] rounded-lg text-[#72706C] hover:text-[#ECEBE9] transition-colors"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-[#ECEBE9] flex items-center gap-2 mb-2">
              <Cpu size={20} className="text-[#a78bfa]" />
              <span>Build Dynamic AI Agent Skill</span>
            </h3>
            <p className="text-xs text-[#A3A09B] mb-4 leading-relaxed">
              Design behavioral triggers, system prompts, and strict agent guidelines. Dynamic skills connect instantly to the cognitive network and inject context into Autopilot tasks.
            </p>

            <form onSubmit={handleAddSkill} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#72706C]">Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. Python Security Auditor, JSON Formatter Specialist..."
                  required
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-[#0C0D0E] border border-[#2A2D30] text-[#ECEBE9] placeholder-[#72706C] focus:outline-none focus:border-[#3C6B4D]/60"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#72706C]">Brief Summary</label>
                <input
                  type="text"
                  placeholder="e.g. Audits python files for XSS or command injections."
                  value={skillDesc}
                  onChange={(e) => setSkillDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-[#0C0D0E] border border-[#2A2D30] text-[#ECEBE9] placeholder-[#72706C] focus:outline-none focus:border-[#3C6B4D]/60"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#72706C]">System Prompt instructions</label>
                <textarea
                  placeholder="Describe exact system personality and guidance..."
                  rows={4}
                  value={skillPrompt}
                  onChange={(e) => setSkillPrompt(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-[#0C0D0E] border border-[#2A2D30] text-[#ECEBE9] placeholder-[#72706C] focus:outline-none focus:border-[#3C6B4D]/60"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#72706C]">Behavior Rules (One rule per line)</label>
                <textarea
                  placeholder="Never modify lockfiles&#10;Always write detailed logs&#10;Check inputs for integrity"
                  rows={3}
                  value={skillRules}
                  onChange={(e) => setSkillRules(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-[#0C0D0E] border border-[#2A2D30] text-[#ECEBE9] placeholder-[#72706C] focus:outline-none focus:border-[#3C6B4D]/60 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSkill(false)}
                  className="btn-secondary py-2 px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  <span>Register Custom Skill</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-[#0c0d0e] w-screen h-screen">
        {innerUI}
      </div>,
      document.body
    );
  }

  return innerUI;
};
