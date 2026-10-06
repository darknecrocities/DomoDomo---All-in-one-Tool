import React, { useState } from 'react';

interface AppBuildersWidgetProps {
  className?: string;
  compact?: boolean;
}

export const AppBuildersWidget: React.FC<AppBuildersWidgetProps> = ({ className = '', compact = false }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <a
        href="https://www.appbuildersph.com/apps/domodomo"
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2.5 rounded-2xl border border-[#2A2D30] bg-[#18191B] px-3.5 py-2 shadow-md hover:border-white/40 transition-all ${compact ? 'w-full sm:w-auto' : 'shrink-0'} ${className}`}
        title="Vote for DomoDomo on App Builders PH"
      >
        <img
          src="/appbuildersph_logo.png"
          alt="AppBuildersPH"
          className="w-6 h-6 object-contain rounded-md shrink-0"
        />
        <div className="flex flex-col text-left">
          <span className="text-[11px] font-bold text-[#ECEBE9] hover:text-white transition-colors">
            Featured on AppBuildersPH
          </span>
          <span className="text-[9px] text-[#A0A3AB]">
            Vote for DomoDomo • #1 Community App
          </span>
        </div>
      </a>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-2xl border border-[#2A2D30] bg-[#18191B] p-0.5 shadow-md hover:border-white/40 transition-all overflow-hidden max-w-full ${compact ? 'w-full sm:w-auto' : 'shrink-0'} ${className}`}
      title="Vote for DomoDomo on App Builders PH"
    >
      <iframe
        src="https://appbuildersph.com/embed/apps/domodomo"
        title="DomoDomo votes on App Builders PH"
        width="320"
        height="72"
        style={{ border: 0, overflow: 'hidden' }}
        loading="lazy"
        scrolling="no"
        onError={() => setHasError(true)}
        className={`h-[72px] rounded-xl block max-w-full ${compact ? 'w-full min-w-[240px] max-w-[320px]' : 'w-[320px]'}`}
      />
    </div>
  );
};

export default AppBuildersWidget;
