import { useState, useEffect } from 'react';
import { Copy, Check, Download, Plus, Trash2, Cpu, HelpCircle } from 'lucide-react';

interface DockerService {
  id: string;
  name: string;
  image: string;
  tag: string;
  ports: string[];
  environment: { key: string; value: string }[];
  volumes: string[];
  restart: string;
}

export const DockerBuilderTool = () => {
  const [services, setServices] = useState<DockerService[]>([
    {
      id: 'web',
      name: 'web-app',
      image: 'node',
      tag: '18-alpine',
      ports: ['3000:3000'],
      environment: [{ key: 'NODE_ENV', value: 'production' }],
      volumes: ['.:/app', '/app/node_modules'],
      restart: 'always'
    }
  ]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('web');
  const [composeVersion, setComposeVersion] = useState('3.8');
  const [copied, setCopied] = useState(false);
  
  // Custom networks
  const [useCustomNetwork, setUseCustomNetwork] = useState(false);
  const [networkName, setNetworkName] = useState('app-network');

  const [yamlOutput, setYamlOutput] = useState('');

  // Service Presets
  const applyPreset = (preset: 'postgres' | 'redis' | 'nginx' | 'mongodb') => {
    const nextId = preset + '-' + Math.floor(Math.random() * 100);
    let newService: DockerService;

    if (preset === 'postgres') {
      newService = {
        id: nextId,
        name: 'db-postgres',
        image: 'postgres',
        tag: '15-alpine',
        ports: ['5432:5432'],
        environment: [
          { key: 'POSTGRES_USER', value: 'postgres' },
          { key: 'POSTGRES_PASSWORD', value: 'example' },
          { key: 'POSTGRES_DB', value: 'app_db' }
        ],
        volumes: ['postgres_data:/var/lib/postgresql/data'],
        restart: 'unless-stopped'
      };
    } else if (preset === 'redis') {
      newService = {
        id: nextId,
        name: 'cache-redis',
        image: 'redis',
        tag: '7-alpine',
        ports: ['6379:6379'],
        environment: [],
        volumes: ['redis_data:/data'],
        restart: 'always'
      };
    } else if (preset === 'nginx') {
      newService = {
        id: nextId,
        name: 'proxy-nginx',
        image: 'nginx',
        tag: 'stable-alpine',
        ports: ['80:80', '443:443'],
        environment: [],
        volumes: ['./nginx.conf:/etc/nginx/nginx.conf:ro'],
        restart: 'always'
      };
    } else {
      newService = {
        id: nextId,
        name: 'db-mongo',
        image: 'mongo',
        tag: '6.0',
        ports: ['27017:27017'],
        environment: [
          { key: 'MONGO_INITDB_ROOT_USERNAME', value: 'admin' },
          { key: 'MONGO_INITDB_ROOT_PASSWORD', value: 'secret' }
        ],
        volumes: ['mongo_data:/data/db'],
        restart: 'always'
      };
    }

    setServices(prev => [...prev, newService]);
    setSelectedServiceId(nextId);
  };

  // Compile YAML
  useEffect(() => {
    let yaml = `version: '${composeVersion}'\n\nservices:\n`;

    services.forEach(s => {
      yaml += `  ${s.id}:\n`;
      yaml += `    container_name: ${s.name}\n`;
      yaml += `    image: ${s.image}:${s.tag}\n`;
      yaml += `    restart: ${s.restart}\n`;
      
      if (s.ports.length > 0) {
        yaml += `    ports:\n`;
        s.ports.forEach(p => {
          if (p.trim()) yaml += `      - "${p}"\n`;
        });
      }

      if (s.environment.length > 0) {
        yaml += `    environment:\n`;
        s.environment.forEach(env => {
          if (env.key.trim()) yaml += `      - ${env.key}=${env.value}\n`;
        });
      }

      if (s.volumes.length > 0) {
        yaml += `    volumes:\n`;
        s.volumes.forEach(v => {
          if (v.trim()) yaml += `      - ${v}\n`;
        });
      }

      if (useCustomNetwork) {
        yaml += `    networks:\n`;
        yaml += `      - ${networkName}\n`;
      }
    });

    if (useCustomNetwork) {
      yaml += `\nnetworks:\n  ${networkName}:\n    driver: bridge\n`;
    }

    // Determine if database volumes require volume roots declaration
    const dbVolumes: string[] = [];
    services.forEach(s => {
      s.volumes.forEach(v => {
        const parts = v.split(':');
        if (parts.length > 0 && !parts[0].startsWith('.') && !parts[0].startsWith('/')) {
          dbVolumes.push(parts[0]);
        }
      });
    });

    if (dbVolumes.length > 0) {
      yaml += `\nvolumes:\n`;
      dbVolumes.forEach(vol => {
        yaml += `  ${vol}:\n`;
      });
    }

    setYamlOutput(yaml);
  }, [services, composeVersion, useCustomNetwork, networkName]);

  const updateServiceField = (id: string, field: keyof DockerService, value: any) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleCopyYAML = () => {
    navigator.clipboard.writeText(yamlOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadYAML = () => {
    const blob = new Blob([yamlOutput], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'docker-compose.yml';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteService = (id: string) => {
    if (services.length <= 1) {
      alert('Cannot delete the last service context.');
      return;
    }
    setServices(prev => prev.filter(s => s.id !== id));
    setSelectedServiceId(services[0].id === id ? services[1].id : services[0].id);
  };

  const activeService = services.find(s => s.id === selectedServiceId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Visual stack list */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-[#3C6B4D] font-bold">Docker Services Dashboard</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const nextId = 'service-' + Math.floor(Math.random() * 100);
                  setServices(prev => [...prev, {
                    id: nextId,
                    name: 'custom-container',
                    image: 'nginx',
                    tag: 'alpine',
                    ports: ['8080:80'],
                    environment: [],
                    volumes: [],
                    restart: 'always'
                  }]);
                  setSelectedServiceId(nextId);
                }}
                className="py-1 px-3 bg-[#3C6B4D]/15 text-[#3C6B4D] border border-[#3C6B4D]/25 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-[#3C6B4D]/30"
              >
                <Plus size={11} /> Create Service
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {services.map(s => (
              <div
                key={s.id}
                onClick={() => setSelectedServiceId(s.id)}
                className={`py-2 px-4 rounded-xl border text-xs font-semibold cursor-pointer flex items-center gap-3 transition-all ${
                  selectedServiceId === s.id
                    ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/40 text-[#3C6B4D]'
                    : 'bg-slate-900 border-slate-850 text-slate-350 hover:text-white'
                }`}
              >
                <span>{s.id} ({s.image}:{s.tag})</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteService(s.id); }}
                  className="text-rose-400 hover:text-rose-200 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Service Editor */}
        {activeService && (
          <div className="glass-card p-6 flex flex-col gap-5">
            <span className="text-xs text-slate-400 font-bold uppercase border-b border-slate-850 pb-2 flex items-center gap-1.5"><Cpu size={14} className="text-[#3C6B4D]" /> Configure Service: {activeService.id}</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Image name</label>
                <input
                  type="text"
                  value={activeService.image}
                  onChange={(e) => updateServiceField(activeService.id, 'image', e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#3C6B4D]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Image Tag/Version</label>
                <input
                  type="text"
                  value={activeService.tag}
                  onChange={(e) => updateServiceField(activeService.id, 'tag', e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#3C6B4D]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Container Name</label>
                <input
                  type="text"
                  value={activeService.name}
                  onChange={(e) => updateServiceField(activeService.id, 'name', e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#3C6B4D]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Restart Policy</label>
                <select
                  value={activeService.restart}
                  onChange={(e) => updateServiceField(activeService.id, 'restart', e.target.value)}
                  className="bg-slate-950 border border-slate-850 text-slate-350 p-2 text-xs rounded-xl focus:outline-none focus:border-[#3C6B4D]"
                >
                  <option value="no">no</option>
                  <option value="always">always</option>
                  <option value="on-failure">on-failure</option>
                  <option value="unless-stopped">unless-stopped</option>
                </select>
              </div>
            </div>

            {/* Mappings lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ports editor */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase flex justify-between items-center">
                  <span>Ports Mapping (host:container)</span>
                  <button
                    onClick={() => updateServiceField(activeService.id, 'ports', [...activeService.ports, ''])}
                    className="text-[#3C6B4D] hover:text-white transition-colors"
                  >
                    + Add Port
                  </button>
                </label>
                <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {activeService.ports.map((p, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={p}
                        onChange={(e) => {
                          const list = [...activeService.ports];
                          list[idx] = e.target.value;
                          updateServiceField(activeService.id, 'ports', list);
                        }}
                        placeholder="e.g. 80:80"
                        className="bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none flex-1"
                      />
                      <button
                        onClick={() => {
                          const list = activeService.ports.filter((_, i) => i !== idx);
                          updateServiceField(activeService.id, 'ports', list);
                        }}
                        className="text-rose-400 hover:text-rose-200"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Volumes Editor */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase flex justify-between items-center">
                  <span>Volumes Mapping (host:container)</span>
                  <button
                    onClick={() => updateServiceField(activeService.id, 'volumes', [...activeService.volumes, ''])}
                    className="text-[#3C6B4D] hover:text-white transition-colors"
                  >
                    + Add Volume
                  </button>
                </label>
                <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {activeService.volumes.map((v, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={v}
                        onChange={(e) => {
                          const list = [...activeService.volumes];
                          list[idx] = e.target.value;
                          updateServiceField(activeService.id, 'volumes', list);
                        }}
                        placeholder="e.g. postgres_data:/var/lib/data"
                        className="bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none flex-1"
                      />
                      <button
                        onClick={() => {
                          const list = activeService.volumes.filter((_, i) => i !== idx);
                          updateServiceField(activeService.id, 'volumes', list);
                        }}
                        className="text-rose-400 hover:text-rose-200"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Environments Editor */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-slate-500 font-bold uppercase flex justify-between items-center">
                <span>Environment Variables</span>
                <button
                  onClick={() => updateServiceField(activeService.id, 'environment', [...activeService.environment, { key: '', value: '' }])}
                  className="text-[#3C6B4D] hover:text-white transition-colors"
                >
                  + Add Variable
                </button>
              </label>
              <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                {activeService.environment.map((env, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={env.key}
                      onChange={(e) => {
                        const list = [...activeService.environment];
                        list[idx].key = e.target.value;
                        updateServiceField(activeService.id, 'environment', list);
                      }}
                      placeholder="KEY"
                      className="bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none flex-1"
                    />
                    <span className="text-slate-500">=</span>
                    <input
                      type="text"
                      value={env.value}
                      onChange={(e) => {
                        const list = [...activeService.environment];
                        list[idx].value = e.target.value;
                        updateServiceField(activeService.id, 'environment', list);
                      }}
                      placeholder="VALUE"
                      className="bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none flex-1"
                    />
                    <button
                      onClick={() => {
                        const list = activeService.environment.filter((_, i) => i !== idx);
                        updateServiceField(activeService.id, 'environment', list);
                      }}
                      className="text-rose-400 hover:text-rose-200"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compiler output panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Compiler output */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-1.5"><HelpCircle size={14} className="text-[#3C6B4D]" /> docker-compose.yml</span>
          <pre className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs font-mono text-slate-300 min-h-[300px] overflow-y-auto leading-relaxed select-all">
            {yamlOutput}
          </pre>
          <div className="flex gap-2">
            <button
              onClick={handleCopyYAML}
              className="flex-1 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-semibold"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied Compose!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownloadYAML}
              className="px-4 py-2.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/90 text-white rounded-xl flex items-center justify-center transition-colors"
            >
              <Download size={14} />
            </button>
          </div>
        </div>

        {/* Stack Presets selector */}
        <div className="glass-card p-6 flex flex-col gap-3">
          <span className="text-xs text-slate-400 font-bold uppercase border-b border-slate-800 pb-2">Add Preset Database / Proxy</span>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => applyPreset('postgres')} className="py-2 px-3 bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850 hover:border-slate-800 rounded-lg text-[10px] font-bold transition-all">+ PostgreSQL</button>
            <button onClick={() => applyPreset('redis')} className="py-2 px-3 bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850 hover:border-slate-800 rounded-lg text-[10px] font-bold transition-all">+ Redis Cache</button>
            <button onClick={() => applyPreset('nginx')} className="py-2 px-3 bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850 hover:border-slate-800 rounded-lg text-[10px] font-bold transition-all">+ Nginx Proxy</button>
            <button onClick={() => applyPreset('mongodb')} className="py-2 px-3 bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850 hover:border-slate-800 rounded-lg text-[10px] font-bold transition-all">+ MongoDB</button>
          </div>
        </div>

        {/* Dynamic configurations */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <span className="text-xs text-slate-400 font-bold uppercase border-b border-slate-800 pb-2">Compose Options</span>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Compose Specification Version</label>
              <select
                value={composeVersion}
                onChange={(e) => setComposeVersion(e.target.value)}
                className="bg-slate-950 border border-slate-850 text-slate-350 p-2 text-xs rounded-xl focus:outline-none"
              >
                <option value="3.8">Version 3.8 (Modern)</option>
                <option value="3.3">Version 3.3</option>
                <option value="2.4">Version 2.4 (Legacy)</option>
              </select>
            </div>

            <div className="flex items-center justify-between bg-slate-950 border border-slate-850/80 rounded-xl p-3">
              <div className="flex flex-col">
                <span className="text-xs text-slate-200 font-semibold">Custom Bridge Network</span>
                <span className="text-[10px] text-slate-500">Inject dynamic isolate bridge networks</span>
              </div>
              <button
                onClick={() => setUseCustomNetwork(!useCustomNetwork)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  useCustomNetwork ? 'bg-[#3C6B4D]' : 'bg-slate-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  useCustomNetwork ? 'translate-x-4.5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {useCustomNetwork && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Network Name</label>
                <input
                  type="text"
                  value={networkName}
                  onChange={(e) => setNetworkName(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#3C6B4D]"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
