import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { getToolById } from '../engine/registry';
import { DynamicIcon } from '../components/DynamicIcon';

export const ToolContainer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tool = id ? getToolById(id) : undefined;

  if (!tool) {
    return (
      <div className="glass-card p-12 text-center flex flex-col items-center gap-4 max-w-md mx-auto my-12">
        <h2 className="text-xl font-bold text-rose-400">Tool Not Found</h2>
        <p className="text-slate-400 text-sm">
          The requested tool does not exist or is still in development.
        </p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>
    );
  }

  const ToolComponent = tool.component;

  return (
    <div className="flex flex-col gap-8">
      {/* Tool Header Breadcrumb */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex flex-col gap-2">
          {/* Breadcrumb nav */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <button
              onClick={() => navigate('/')}
              className="hover:text-teal-400 flex items-center gap-1 transition-colors"
            >
              <Home size={12} />
              <span>Dashboard</span>
            </button>
            <span>/</span>
            <span className="text-slate-400">{tool.category}</span>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <div className="p-2.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl">
              <DynamicIcon name={tool.icon} size={20} />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white font-sans tracking-tight">
              {tool.name}
            </h2>
          </div>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
            {tool.description}
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="btn-secondary py-2 px-4 text-xs font-bold"
        >
          <ArrowLeft size={14} />
          <span>Dashboard</span>
        </button>
      </div>

      {/* Tool Dynamic Component Frame */}
      <div className="w-full">
        <ToolComponent />
      </div>
    </div>
  );
};
