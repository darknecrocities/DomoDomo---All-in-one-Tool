import React, { useState, useMemo, useRef } from 'react';
import { Copy, Check, Download, Plus, Trash2, Database, Code } from 'lucide-react';

interface DBField {
  id: string;
  name: string;
  type: string;
  isPK: boolean;
  isFK: boolean;
  fkTable?: string;
}

interface DBTable {
  id: string;
  name: string;
  x: number;
  y: number;
  fields: DBField[];
}

export const ERSchemaDesignerTool = () => {
  const [tables, setTables] = useState<DBTable[]>([
    {
      id: 'table-1',
      name: 'users',
      x: 50,
      y: 50,
      fields: [
        { id: 'f-1', name: 'id', type: 'INTEGER', isPK: true, isFK: false },
        { id: 'f-2', name: 'username', type: 'VARCHAR(255)', isPK: false, isFK: false },
        { id: 'f-3', name: 'email', type: 'VARCHAR(255)', isPK: false, isFK: false },
        { id: 'f-4', name: 'created_at', type: 'TIMESTAMP', isPK: false, isFK: false }
      ]
    },
    {
      id: 'table-2',
      name: 'posts',
      x: 350,
      y: 80,
      fields: [
        { id: 'f-5', name: 'id', type: 'INTEGER', isPK: true, isFK: false },
        { id: 'f-6', name: 'user_id', type: 'INTEGER', isPK: false, isFK: true, fkTable: 'users' },
        { id: 'f-7', name: 'title', type: 'VARCHAR(255)', isPK: false, isFK: false },
        { id: 'f-8', name: 'content', type: 'TEXT', isPK: false, isFK: false }
      ]
    }
  ]);

  const [activeTableId, setActiveTableId] = useState<string>('table-1');
  const [copied, setCopied] = useState<boolean>(false);
  const [dbDialect, setDbDialect] = useState<'postgresql' | 'sqlite' | 'mysql'>('postgresql');
  
  // Drag state
  const dragInfo = useRef<{ tableId: string; startX: number; startY: number } | null>(null);

  const activeTable = useMemo(() => {
    return tables.find(t => t.id === activeTableId) || tables[0];
  }, [tables, activeTableId]);

  const handleAddTable = () => {
    const id = `table-${Date.now()}`;
    const newTable: DBTable = {
      id,
      name: `new_table_${tables.length + 1}`,
      x: 100 + Math.random() * 80,
      y: 100 + Math.random() * 80,
      fields: [
        { id: `f-${Date.now()}`, name: 'id', type: 'INTEGER', isPK: true, isFK: false }
      ]
    };
    setTables([...tables, newTable]);
    setActiveTableId(id);
  };

  const handleRemoveTable = (id: string) => {
    if (tables.length <= 1) return;
    const next = tables.filter(t => t.id !== id);
    setTables(next);
    setActiveTableId(next[0].id);
  };

  const handleUpdateTable = (id: string, updates: Partial<DBTable>) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleAddField = () => {
    if (!activeTable) return;
    const newField: DBField = {
      id: `f-${Date.now()}`,
      name: `column_${activeTable.fields.length + 1}`,
      type: 'VARCHAR(255)',
      isPK: false,
      isFK: false
    };
    handleUpdateTable(activeTable.id, {
      fields: [...activeTable.fields, newField]
    });
  };

  const handleRemoveField = (fieldId: string) => {
    if (!activeTable) return;
    handleUpdateTable(activeTable.id, {
      fields: activeTable.fields.filter(f => f.id !== fieldId)
    });
  };

  const handleUpdateField = (fieldId: string, updates: Partial<DBField>) => {
    if (!activeTable) return;
    const nextFields = activeTable.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f);
    handleUpdateTable(activeTable.id, { fields: nextFields });
  };

  // Dragging handler
  const handleMouseDown = (tableId: string, e: React.MouseEvent) => {
    dragInfo.current = {
      tableId,
      startX: e.clientX,
      startY: e.clientY
    };
    setActiveTableId(tableId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragInfo.current) return;
    const { tableId, startX, startY } = dragInfo.current;
    
    // Find target
    const target = tables.find(t => t.id === tableId);
    if (!target) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    setTables(prev => prev.map(t => t.id === tableId ? {
      ...t,
      x: Math.max(0, t.x + dx),
      y: Math.max(0, t.y + dy)
    } : t));

    dragInfo.current.startX = e.clientX;
    dragInfo.current.startY = e.clientY;
  };

  const handleMouseUp = () => {
    dragInfo.current = null;
  };

  // Generate SQL Exporter script code
  const generatedSqlCode = useMemo(() => {
    const tableSql = tables.map(t => {
      const fieldLines = t.fields.map(f => {
        let typeStr = f.type;
        let pkStr = f.isPK ? ' PRIMARY KEY' : '';
        // Map dialect variations
        if (dbDialect === 'sqlite' && f.isPK && f.type === 'INTEGER') {
          pkStr = ' PRIMARY KEY AUTOINCREMENT';
        }
        return `  ${f.name} ${typeStr}${pkStr}`;
      });

      // Add foreign key lines
      t.fields.forEach(f => {
        if (f.isFK && f.fkTable) {
          fieldLines.push(`  FOREIGN KEY (${f.name}) REFERENCES ${f.fkTable}(id)`);
        }
      });

      return `CREATE TABLE ${t.name} (
${fieldLines.join(',\n')}
);`;
    }).join('\n\n');

    return tableSql;
  }, [tables, dbDialect]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedSqlCode], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schema_${dbDialect}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Editor sidebar */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-[#ECEBE9] border-b border-[#2A2D30] pb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Database size={15} className="text-[#3C6B4D]" /> Active Table Properties</span>
            <button
              onClick={handleAddTable}
              className="py-1 px-2.5 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
            >
              <Plus size={12} />
              <span>Add Table</span>
            </button>
          </h3>

          {activeTable && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#A3A09B] font-bold uppercase">Table Name</label>
                  <input
                    type="text"
                    value={activeTable.name}
                    onChange={(e) => handleUpdateTable(activeTable.id, { name: e.target.value })}
                    className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#A3A09B] font-bold uppercase">Danger Zone</label>
                  <button
                    onClick={() => handleRemoveTable(activeTable.id)}
                    disabled={tables.length <= 1}
                    className="py-1.5 px-3 bg-rose-950/20 border border-rose-500/30 text-rose-450 hover:bg-rose-900/30 disabled:opacity-40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 size={13} />
                    <span>Delete Table</span>
                  </button>
                </div>
              </div>

              {/* Table fields lists */}
              <div className="border-t border-[#2A2D30] pt-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-[#A3A09B] font-bold uppercase">Fields & Datatypes</label>
                  <button
                    onClick={handleAddField}
                    className="text-[10px] text-[#3C6B4D] font-bold hover:underline"
                  >
                    + Add Field
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {activeTable.fields.map(f => (
                    <div key={f.id} className="grid grid-cols-12 gap-2 bg-[#111213] border border-[#2A2D30]/65 p-2 rounded-xl items-center">
                      <input
                        type="text"
                        value={f.name}
                        onChange={(e) => handleUpdateField(f.id, { name: e.target.value })}
                        placeholder="Field name"
                        className="col-span-4 bg-transparent border-b border-[#2A2D30] focus:border-[#3C6B4D] text-xs text-[#ECEBE9] focus:outline-none"
                      />
                      <select
                        value={f.type}
                        onChange={(e) => handleUpdateField(f.id, { type: e.target.value })}
                        className="col-span-4 bg-transparent text-[10px] text-[#ECEBE9] focus:outline-none"
                      >
                        <option value="INTEGER">INTEGER</option>
                        <option value="VARCHAR(255)">VARCHAR(255)</option>
                        <option value="TEXT">TEXT</option>
                        <option value="TIMESTAMP">TIMESTAMP</option>
                        <option value="BOOLEAN">BOOLEAN</option>
                        <option value="NUMERIC(10,2)">NUMERIC(10,2)</option>
                      </select>

                      <label className="col-span-2 flex items-center justify-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={f.isPK}
                          onChange={(e) => handleUpdateField(f.id, { isPK: e.target.checked })}
                          className="accent-[#3C6B4D]"
                          title="Primary Key"
                        />
                        <span className="text-[9px] text-[#72706C] font-bold">PK</span>
                      </label>

                      <button
                        onClick={() => handleRemoveField(f.id)}
                        className="col-span-2 text-rose-450 hover:text-rose-500 text-xs flex justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual Canvas and Exporter */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="relative h-[320px] bg-[#111213] border border-[#2A2D30] rounded-2xl overflow-hidden cursor-crosshair select-none"
        >
          {/* Simple Grid decoration */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2d30_0.5px,transparent_0.5px),linear-gradient(to_bottom,#2a2d30_0.5px,transparent_0.5px)] bg-[size:1.5rem_1.5rem] opacity-25"></div>
          
          <span className="absolute bottom-4 left-4 text-[9px] text-[#72706C] font-bold uppercase tracking-wider">Drag header to reposition tables. Click table to edit parameters.</span>

          {/* Render lines connecting relationships */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {tables.map(t => {
              return t.fields.map(f => {
                if (f.isFK && f.fkTable) {
                  const target = tables.find(x => x.name === f.fkTable);
                  if (target) {
                    const startX = t.x + 100;
                    const startY = t.y + 40;
                    const endX = target.x + 100;
                    const endY = target.y + 40;
                    return (
                      <g key={`${t.id}-${f.id}`}>
                        <line
                          x1={startX}
                          y1={startY}
                          x2={endX}
                          y2={endY}
                          stroke="#3C6B4D"
                          strokeWidth="2"
                          strokeDasharray="4"
                        />
                        <circle cx={startX} cy={startY} r="3.5" fill="#3C6B4D" />
                        <circle cx={endX} cy={endY} r="3.5" fill="#3C6B4D" />
                      </g>
                    );
                  }
                }
                return null;
              });
            })}
          </svg>

          {/* Render table cards */}
          {tables.map(t => {
            const isActive = t.id === activeTableId;
            return (
              <div
                key={t.id}
                style={{ left: t.x, top: t.y }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTableId(t.id);
                }}
                className={`absolute w-[180px] bg-[#18191B] border rounded-xl shadow-lg z-10 select-none overflow-hidden transition-all duration-75 ${
                  isActive ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-[#2A2D30]'
                }`}
              >
                <div
                  onMouseDown={(e) => handleMouseDown(t.id, e)}
                  className="bg-[#111213] border-b border-[#2A2D30] px-3 py-1.5 text-[10px] font-extrabold text-[#ECEBE9] flex justify-between items-center cursor-move"
                >
                  <span className="truncate">{t.name}</span>
                  <span className="text-[8px] text-[#72706C]">{t.fields.length} cols</span>
                </div>
                <div className="p-2 space-y-1 bg-[#18191B]">
                  {t.fields.map(f => (
                    <div key={f.id} className="flex justify-between items-center text-[10px] font-mono leading-tight">
                      <span className="text-[#ECEBE9] truncate max-w-[90px] flex items-center gap-1">
                        {f.isPK && <span className="text-amber-500">🔑</span>}
                        {f.isFK && <span className="text-emerald-500">🔗</span>}
                        <span>{f.name}</span>
                      </span>
                      <span className="text-[#72706C] text-[8px] uppercase font-bold">{f.type.split('(')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Code exporter box */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="pb-2 border-b border-[#2A2D30] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h4 className="text-sm font-extrabold text-[#ECEBE9] flex items-center gap-1.5"><Code size={15} className="text-[#3C6B4D]" /> SQL Schema Exporter</h4>
            
            <div className="flex items-center gap-2">
              <select
                value={dbDialect}
                onChange={(e) => setDbDialect(e.target.value as any)}
                className="bg-[#111213] border border-[#2A2D30] rounded-lg px-2 py-1 text-xs text-[#ECEBE9] focus:outline-none"
              >
                <option value="postgresql">PostgreSQL</option>
                <option value="sqlite">SQLite</option>
                <option value="mysql">MySQL</option>
              </select>

              <button
                onClick={handleCopy}
                className="py-1 px-3 bg-[#111213] hover:bg-[#1E2022] text-[#A3A09B] hover:text-[#ECEBE9] rounded-lg text-xs font-bold border border-[#2A2D30] flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>Copy SQL</span>
              </button>
              <button
                onClick={handleDownload}
                className="py-1 px-3 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Download size={12} />
                <span>Download .sql</span>
              </button>
            </div>
          </div>

          <div className="bg-[#111213] p-3 rounded-xl border border-[#2A2D30] max-h-[160px] overflow-y-auto">
            <pre className="text-[10px] font-mono text-[#E29E2D] leading-relaxed break-all select-all">
              {generatedSqlCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
