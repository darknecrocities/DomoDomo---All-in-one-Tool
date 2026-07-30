export interface HardwareSpecs {
  ramGB: number;
  cpuCores: number;
  hasWebGPU: boolean;
  tier: 'low' | 'medium' | 'high';
  tierLabel: string;
}

export interface CatalogModelSpec {
  id: string;
  name: string;
  params: string;
  size: string;
  ram: string;
  desc: string;
  tags: string[];
  category: 'low-spec' | 'balanced' | 'coding' | 'vision' | 'heavy';
}

export const HARDWARE_CATALOG: CatalogModelSpec[] = [
  {
    id: 'llama3.2:1b',
    name: 'Meta Llama 3.2 1B',
    params: '1.2B',
    size: '1.3 GB',
    ram: '2GB - 4GB RAM',
    desc: 'Lightweight instruction model for low-memory systems.',
    tags: ['Meta', 'Ultra-Fast', 'Low RAM'],
    category: 'low-spec'
  },
  {
    id: 'llama3.2:3b',
    name: 'Meta Llama 3.2 3B',
    params: '3.2B',
    size: '2.0 GB',
    ram: '4GB - 8GB RAM',
    desc: 'High-quality instruction model balanced for desktop systems.',
    tags: ['Meta', 'Balanced', 'Recommended'],
    category: 'balanced'
  },
  {
    id: 'qwen2.5:0.5b',
    name: 'Alibaba Qwen 2.5 0.5B',
    params: '490M',
    size: '350 MB',
    ram: '1GB - 2GB RAM',
    desc: 'Ultra-compact model for rapid JSON parsing.',
    tags: ['Alibaba', 'Micro', 'Fast'],
    category: 'low-spec'
  },
  {
    id: 'qwen2.5:1.5b',
    name: 'Alibaba Qwen 2.5 1.5B',
    params: '1.5B',
    size: '900 MB',
    ram: '2GB - 4GB RAM',
    desc: 'Fast multilingual and general reasoning model.',
    tags: ['Alibaba', 'Multilingual', 'General'],
    category: 'low-spec'
  },
  {
    id: 'qwen2.5-coder:1.5b',
    name: 'Qwen 2.5 Coder 1.5B',
    params: '1.5B',
    size: '980 MB',
    ram: '2GB - 4GB RAM',
    desc: 'Specialized lightweight code generation & refactoring model.',
    tags: ['Coding', 'Fast', 'Low RAM'],
    category: 'coding'
  },
  {
    id: 'qwen2.5-coder:7b',
    name: 'Qwen 2.5 Coder 7B',
    params: '7.6B',
    size: '4.7 GB',
    ram: '8GB - 16GB RAM',
    desc: 'High-tier code synthesis and patch generation model.',
    tags: ['Coding', 'Advanced', 'High RAM'],
    category: 'coding'
  },
  {
    id: 'llava-phi3',
    name: 'Llava Phi-3 Vision 3.8B',
    params: '3.8B',
    size: '2.2 GB',
    ram: '4GB - 8GB RAM',
    desc: 'Compact multimodal vision VQA model for low-to-medium RAM.',
    tags: ['Vision', 'Compact', 'Recommended'],
    category: 'vision'
  },
  {
    id: 'llava:7b',
    name: 'Llava 7B Multimodal Vision',
    params: '7.0B',
    size: '4.5 GB',
    ram: '8GB - 16GB RAM',
    desc: 'Full-featured vision model for diagram & image inspection.',
    tags: ['Vision', 'High Accuracy'],
    category: 'vision'
  },
  {
    id: 'phi3:latest',
    name: 'Microsoft Phi-3 Mini 3.8B',
    params: '3.8B',
    size: '2.3 GB',
    ram: '4GB - 8GB RAM',
    desc: 'High-density logic & synthetic prompt engineering model.',
    tags: ['Microsoft', 'Logic'],
    category: 'balanced'
  },
  {
    id: 'deepseek-r1:1.5b',
    name: 'DeepSeek R1 Distill 1.5B',
    params: '1.5B',
    size: '1.1 GB',
    ram: '4GB - 8GB RAM',
    desc: 'Chain-of-thought reasoning model for logic and math.',
    tags: ['DeepSeek', 'Reasoning'],
    category: 'heavy'
  }
];

export function detectHardwareSpecs(): HardwareSpecs {
  const ramGB = (navigator as any).deviceMemory || 8;
  const cpuCores = navigator.hardwareConcurrency || 4;
  const hasWebGPU = !!(navigator as any).gpu;

  let tier: 'low' | 'medium' | 'high' = 'medium';
  let tierLabel = 'Balanced Setup Tier (8GB - 12GB RAM)';

  if (ramGB < 8 || cpuCores < 6) {
    tier = 'low';
    tierLabel = 'Entry Level Hardware Tier (<8GB RAM)';
  } else if (ramGB >= 16) {
    tier = 'high';
    tierLabel = 'Workstation Performance Tier (16GB+ RAM)';
  }

  return { ramGB, cpuCores, hasWebGPU, tier, tierLabel };
}

export interface ToolRecommendation {
  recommendedModelId: string;
  recommendedModelName: string;
  reason: string;
  badgeText: string;
  ramRequirement: string;
  isInstalled: boolean;
}

export function getToolHardwareRecommendation(
  activeTab: string,
  installedModels: string[] = []
): ToolRecommendation {
  const specs = detectHardwareSpecs();

  const isModelInstalled = (idOrName: string): boolean => {
    const norm = idOrName.toLowerCase().split(':')[0];
    return installedModels.some(m => m.toLowerCase().includes(norm));
  };

  let targetId = 'llama3.2:3b';
  let reason = 'Balanced 3B model for fast chat and general reasoning on your system.';
  let badgeText = '⭐ Recommended (8GB RAM)';

  // Determine domain recommendation based on tab & hardware tier
  if (activeTab === 'vision-studio') {
    if (specs.tier === 'low') {
      targetId = 'llava-phi3';
      reason = `Compact vision model tailored for your ${specs.ramGB}GB RAM system. Fast VQA without disk swapping.`;
      badgeText = '⭐ Best Vision Model for System';
    } else if (specs.tier === 'medium') {
      targetId = isModelInstalled('llava-phi3') ? 'llava-phi3' : 'llava:7b';
      reason = `Optimal balance of visual accuracy and RAM usage on your ${specs.ramGB}GB RAM machine.`;
      badgeText = '⭐ Recommended Vision Model';
    } else {
      targetId = isModelInstalled('llava:7b') ? 'llava:7b' : 'llava-phi3';
      reason = `High-capacity vision model for your ${specs.ramGB}GB RAM workstation.`;
      badgeText = '⭐ Workstation Vision Choice';
    }
  } else if (activeTab === 'code-patch' || activeTab === 'workflow') {
    if (specs.tier === 'low') {
      targetId = 'qwen2.5-coder:1.5b';
      reason = `Ultra-fast 1.5B coding model optimized for ${specs.ramGB}GB RAM systems.`;
      badgeText = '⭐ Recommended Coder for System';
    } else if (specs.tier === 'medium') {
      targetId = isModelInstalled('qwen2.5-coder:1.5b') ? 'qwen2.5-coder:1.5b' : 'qwen2.5-coder:7b';
      reason = `Powerful code synthesis model matching your ${specs.cpuCores}-core CPU and ${specs.ramGB}GB RAM setup.`;
      badgeText = '⭐ Recommended Coding Specialist';
    } else {
      targetId = isModelInstalled('qwen2.5-coder:7b') ? 'qwen2.5-coder:7b' : 'qwen2.5-coder:1.5b';
      reason = `High-tier 7B code generator taking advantage of your workstation memory.`;
      badgeText = '⭐ Workstation Coder Choice';
    }
  } else if (activeTab === 'rag' || activeTab === 'knowledge-graph') {
    if (specs.tier === 'low') {
      targetId = 'qwen2.5:1.5b';
      reason = `Lightweight 1.5B vector embedding & RAG chunking model for low memory overhead.`;
      badgeText = '⭐ Recommended RAG Model';
    } else {
      targetId = 'llama3.2:3b';
      reason = `High-density 3B model ideal for local vector retrieval and document context synthesis.`;
      badgeText = '⭐ Recommended RAG Model';
    }
  } else if (activeTab === 'extractor' || activeTab === 'function-calling') {
    if (specs.tier === 'low') {
      targetId = 'qwen2.5:0.5b';
      reason = `Micro 0.5B model for instant JSON schema extraction with minimal RAM usage.`;
      badgeText = '⭐ Recommended JSON Model';
    } else {
      targetId = 'llama3.2:3b';
      reason = `Strict instruction-following 3B model for JSON schema & tool call formatting.`;
      badgeText = '⭐ Recommended Function Caller';
    }
  } else if (activeTab === 'eval' || activeTab === 'prompts' || activeTab === 'guardrails') {
    if (specs.tier === 'low') {
      targetId = 'llama3.2:1b';
      reason = `Fast 1B instruction model tailored for ${specs.ramGB}GB RAM system benchmarks.`;
      badgeText = '⭐ Recommended Benchmark Model';
    } else {
      targetId = 'llama3.2:3b';
      reason = `Recommended 3B general intelligence model for prompt testing & guardrails.`;
      badgeText = '⭐ Recommended Model';
    }
  } else if (activeTab === 'model-settings' || activeTab === 'quant-calc') {
    targetId = specs.tier === 'low' ? 'llama3.2:1b' : 'llama3.2:3b';
    reason = `System specs detected: ${specs.ramGB}GB RAM, ${specs.cpuCores} CPU cores. Recommending ${specs.tier} footprint models.`;
    badgeText = `⭐ ${specs.tierLabel}`;
  }

  // Adaptive check: If targetId is not installed, but user has installed models matching tier, recommend installed ones!
  const catalogEntry = HARDWARE_CATALOG.find(c => c.id === targetId) || HARDWARE_CATALOG[1];
  const installed = isModelInstalled(targetId);

  return {
    recommendedModelId: catalogEntry.id,
    recommendedModelName: catalogEntry.name,
    reason,
    badgeText,
    ramRequirement: catalogEntry.ram,
    isInstalled: installed
  };
}
